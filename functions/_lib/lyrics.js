// « Paroles automatiques » (Stalak Pro): POST /api/lyrics/transcribe
// The browser cuts the chosen passage of the song into short pieces (≤ 30 s each, cut in quiet spots), each one sent here
// as a small WAV (mono, 16 kHz, 16-bit PCM, base64 in JSON). This hands it to Cloudflare Workers AI (Whisper large v3 turbo,
// binding AI) and sends back the sung words with their times in the piece. The client merges the pieces and makes the lines.
//
// Workers AI model @cf/openai/whisper-large-v3-turbo (developers.cloudflare.com/workers-ai/models/whisper-large-v3-turbo):
//   input  { audio: <base64 string>, task, language, vad_filter, condition_on_previous_text, hallucination_silence_threshold, … }
//   output { transcription_info: { language, language_probability, duration, duration_after_vad }, text, word_count,
//            segments: [{ start, end, text, temperature, avg_logprob, compression_ratio, no_speech_prob,
//                         words: [{ word, start, end }] }], vtt }
import { HttpError, json, readJson, clientIp } from './http.js';
import { requireUser } from './auth.js';
import { requirePro } from './entitlements.js';
import { limit } from './ratelimit.js';
import { sha256Hex } from './crypto.js';

export const MODEL = '@cf/openai/whisper-large-v3-turbo';
export const SAMPLE_RATE = 16000;
export const PIECE_MAX_S = 31;            // one request: at most ~30 s of audio (≈ 0.96 MB of WAV, ≈ 1.3 MB of base64)
export const PIECES_MAX = 16;             // one transcription: at most 16 pieces ≈ 8 minutes
export const JOBS_PER_DAY = 20;           // transcriptions per account per day (UTC)
export const SECONDS_PER_DAY = 90 * 60;   // audio minutes per account per day (cost guard: ~47 neurons per audio minute)
const WAV_HEADER = 44;
const BODY_MAX = Math.ceil((WAV_HEADER + PIECE_MAX_S * SAMPLE_RATE * 2) / 3) * 4 + 4096;
const B64 = /^[A-Za-z0-9+/]+={0,2}$/;
const LANG = /^[a-z]{2,3}$/;
const JOB = /^[A-Za-z0-9_-]{8,40}$/;

// What Whisper tends to "hear" in silence or pure music (subtitle credits, video outros): never real lyrics.
const HALLU = [
  /amara\.org/i, /sous-titr(es|age)/i, /subtitles? by/i, /^\s*(merci|thanks?|thank you)( beaucoup| very much)?( d'avoir regardé| for watching)?[.!\s]*$/i,
  /merci d'avoir regardé/i, /thanks? for watching/i, /abonnez-vous/i, /please subscribe/i, /like and subscribe/i,
];
const isHallu = (t) => HALLU.some((r) => r.test(t));
const r3 = (x) => Math.round(x * 1000) / 1000;
const num = (x) => (typeof x === 'number' && isFinite(x) ? x : null);

// The 44-byte header the client writes: RIFF / WAVE / fmt PCM mono 16 kHz 16-bit / data.
function checkWav(b64) {
  const head = atob(b64.slice(0, 60));
  const u16 = (o) => head.charCodeAt(o) | (head.charCodeAt(o + 1) << 8);
  const u32 = (o) => (u16(o) + u16(o + 2) * 65536);
  if (head.slice(0, 4) !== 'RIFF' || head.slice(8, 16) !== 'WAVEfmt ' || head.slice(36, 40) !== 'data') return null;
  if (u16(20) !== 1 || u16(22) !== 1 || u32(24) !== SAMPLE_RATE || u16(34) !== 16) return null;
  // the length really sent (not the one written in the header)
  const bytes = Math.floor(b64.length / 4) * 3 - (b64.endsWith('==') ? 2 : b64.endsWith('=') ? 1 : 0);
  return (bytes - WAV_HEADER) / (SAMPLE_RATE * 2);
}

// Workers AI output → [{ start, end, text, words: [{ word, start, end }] }], cleaned. Robust to missing fields.
export function cleanSegments(out, duration) {
  if (!out || typeof out !== 'object') return [];
  let segs = Array.isArray(out.segments) ? out.segments : null;
  // older Whisper shape: { text, words: [{ word, start, end }] } with no segments
  if (!segs && Array.isArray(out.words) && out.words.length) segs = [{ text: out.text || out.words.map((w) => w.word).join(' '), words: out.words }];
  if (!segs && typeof out.text === 'string' && out.text.trim()) segs = [{ start: 0, end: duration, text: out.text }];
  if (!segs) return [];
  // word times given beside the segments (top-level "words") rather than inside them: each word goes to its segment
  if (Array.isArray(out.words) && out.words.length && segs.every((sg) => !sg || !Array.isArray(sg.words) || !sg.words.length)) {
    segs = segs.map((sg, i) => {
      if (!sg || typeof sg !== 'object') return sg;
      const s0 = num(sg.start), s1 = num(sg.end), last = i === segs.length - 1;
      if (s0 == null || s1 == null) return segs.length === 1 ? { ...sg, words: out.words } : sg;
      return { ...sg, words: out.words.filter((w) => w && num(w.start) != null && w.start >= s0 - 0.05 && (w.start < s1 || (last && w.start <= s1 + 0.5))) };
    });
  }
  const clamp = (t) => r3(Math.max(0, Math.min(duration, t)));
  const res = [];
  for (const s of segs) {
    if (!s || typeof s !== 'object') continue;
    const text = String(s.text || '').replace(/\s+/g, ' ').trim();
    // no voice, repeated / low-confidence text, or a known silence hallucination
    // (Whisper's own rules: no_speech_prob > 0.6 with avg_logprob < -1; compression ratio > 2.4; sung words over music
    // often score low, so only a very low confidence alone drops a segment)
    if (num(s.no_speech_prob) != null && s.no_speech_prob > 0.85 && (num(s.avg_logprob) == null || s.avg_logprob < -1.2)) continue;
    if (num(s.compression_ratio) != null && s.compression_ratio > 2.4) continue;
    if (num(s.avg_logprob) != null && s.avg_logprob < -2.5) continue;
    let words = (Array.isArray(s.words) ? s.words : [])
      .map((w) => ({ word: String((w && w.word) || '').replace(/\s+/g, ' ').trim(), start: num(w && w.start), end: num(w && w.end) }))
      .filter((w) => w.word && w.start != null)
      .map((w) => ({ word: w.word.slice(0, 60), start: clamp(w.start), end: clamp(w.end != null && w.end >= w.start ? w.end : w.start + 0.2) }));
    const wtext = words.map((w) => w.word).join(' ');
    const segText = (text || wtext).slice(0, 400);
    if (!segText || !/[\p{L}\p{N}]/u.test(segText) || isHallu(segText)) continue;
    const start = num(s.start) != null ? clamp(s.start) : words.length ? words[0].start : 0;
    const end = num(s.end) != null ? clamp(s.end) : words.length ? words[words.length - 1].end : duration;
    if (words.length > 120) words = words.slice(0, 120);
    res.push({ start, end: Math.max(start, end), text: segText, words });
  }
  // the same line over and over (a hallucination loop): kept at most twice in a row
  return res.filter((s, i) => !(i >= 2 && s.text === res[i - 1].text && s.text === res[i - 2].text));
}

async function useQuota(env, userId, day, seconds, newJob) {
  // one statement: counts the piece only if the account stays under its daily limits (no row back = over the limit)
  return env.DB.prepare(
    `INSERT INTO lyrics_usage (user_id, day, jobs, pieces, seconds, updated_at) VALUES (?1, ?2, ?3, 1, ?4, ?5)
     ON CONFLICT(user_id, day) DO UPDATE SET jobs = jobs + ?3, pieces = pieces + 1, seconds = seconds + ?4, updated_at = ?5
       WHERE jobs + ?3 <= ?6 AND seconds + ?4 <= ?7
     RETURNING jobs, seconds`
  ).bind(userId, day, newJob ? 1 : 0, seconds, Date.now(), JOBS_PER_DAY, SECONDS_PER_DAY).first();
}

export async function transcribe(request, env) {
  const user = await requireUser(request, env);
  await requirePro(env, user, HttpError);
  const ipKey = (await sha256Hex('ip:' + clientIp(request))).slice(0, 32);
  await limit(env, `lyr:ip:${ipKey}`, 300, 3600e3, 'Too many transcription requests from this connection, try again later.');
  await limit(env, `lyr:u:${user.id}`, 200, 3600e3, 'Too many transcription requests, try again later.');

  const body = await readJson(request, BODY_MAX);
  const audio = typeof body.audio === 'string' ? body.audio : '';
  const part = Number.isInteger(body.part) ? body.part : -1, parts = Number.isInteger(body.parts) ? body.parts : -1;
  if (parts > PIECES_MAX) throw new HttpError(413, 'too_long', `At most ${PIECES_MAX * 30} seconds of audio per transcription.`);
  if (part < 0 || parts < 1 || part >= parts) throw new HttpError(400, 'invalid_part', 'part / parts must be integers, 0 <= part < parts.');
  if (typeof body.job !== 'string' || !JOB.test(body.job)) throw new HttpError(400, 'invalid_job', 'job: 8-40 letters, digits, - or _.');
  const language = body.language == null || body.language === 'auto' ? null : String(body.language).toLowerCase();
  if (language && !LANG.test(language)) throw new HttpError(400, 'invalid_language', 'language: "auto" or a 2-3 letter code.');
  if (audio.length < 100 || audio.length % 4 || !B64.test(audio)) throw new HttpError(400, 'invalid_audio', 'audio: base64 WAV, mono 16 kHz 16-bit.');
  const duration = checkWav(audio);
  if (duration == null) throw new HttpError(400, 'invalid_audio', 'audio: base64 WAV, mono 16 kHz 16-bit.');
  if (duration > PIECE_MAX_S) throw new HttpError(413, 'too_long', `At most ${PIECE_MAX_S} seconds of audio per request.`);
  if (duration < 0.3) throw new HttpError(400, 'invalid_audio', 'Audio too short.');
  if (!env.AI || typeof env.AI.run !== 'function') throw new HttpError(503, 'ai_unavailable', 'Automatic lyrics are not available right now.');

  const day = new Date().toISOString().slice(0, 10);
  const seconds = Math.ceil(duration * 10) / 10;
  const q = await useQuota(env, user.id, day, seconds, part === 0);
  if (!q) throw new HttpError(429, 'quota_exceeded', `Daily limit reached (${JOBS_PER_DAY} transcriptions or ${SECONDS_PER_DAY / 60} minutes of audio per day).`);

  // sung lyrics over music: no voice-activity filter (it takes singing for music and throws it away) and no silence
  // skipping; a short prompt tells the model it is a song. Repeats on silence are cleaned afterwards (cleanSegments).
  const input = { audio, task: 'transcribe', vad_filter: false, condition_on_previous_text: false,
    initial_prompt: language === 'en' ? 'Song lyrics.' : language === 'fr' ? 'Paroles de chanson.' : 'Song lyrics. Paroles de chanson.' };
  if (language) input.language = language;
  let out;
  try {
    out = await env.AI.run(MODEL, input);
  } catch (e) {
    console.error('[stalak] workers ai', e && e.message ? e.message : e);
    // the piece was not transcribed: it does not count
    await env.DB.prepare(
      'UPDATE lyrics_usage SET jobs = MAX(0, jobs - ?3), pieces = MAX(0, pieces - 1), seconds = MAX(0, seconds - ?4) WHERE user_id = ?1 AND day = ?2'
    ).bind(user.id, day, part === 0 ? 1 : 0, seconds).run();
    throw new HttpError(502, 'transcribe_failed', 'The transcription failed, try again.');
  }
  const info = (out && out.transcription_info) || {};
  return json({
    segments: cleanSegments(out, duration),
    debug: { raw: Array.isArray(out && out.segments) ? out.segments.length : 0, words: Array.isArray(out && out.words) ? out.words.length : 0,
      chars: typeof (out && out.text) === 'string' ? out.text.length : 0 },
    language: typeof info.language === 'string' && LANG.test(info.language) ? info.language : language,
    duration: r3(duration),
    usage: { jobs: q.jobs, jobsMax: JOBS_PER_DAY, seconds: Math.round(q.seconds), secondsMax: SECONDS_PER_DAY },
  });
}
