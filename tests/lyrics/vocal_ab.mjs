// Offline A/B check of « Paroles automatiques »' voice emphasis (src/app.js, block tr-dsp): node tests/lyrics/vocal_ab.mjs [song.wav]
// Runs the very code of the app (the block between « tr-dsp:start » and « tr-dsp:end ») on synthetic stereo songs whose
// sources are known: a sung voice in the middle, a guitar hard left, a pad hard right, wide stereo reverb, a bass. Checks
// that nothing breaks (no NaN, no clipping, level evened), that the voice band is kept while the sides, the reverb and
// the bass go down, the fallbacks (mono file, voice not in the middle), the speed (3-minute passage), where a vocals file
// sits (trOffset), the context text and the merge at the cuts. With a 16-bit PCM WAV given, it also writes
// <name>.voice.wav (16 kHz mono, as sent) next to the scratch folder for listening.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const app = readFileSync(join(root, 'src', 'app.js'), 'utf8');
const block = app.slice(app.indexOf('/* tr-dsp:start'), app.indexOf('/* tr-dsp:end */'));
assert.ok(block.length > 1000, 'tr-dsp block found in src/app.js');
const { trVocal, trOffset, trContext, trMerge, trChan } = new Function(block + '\nreturn { trVocal, trOffset, trContext, trMerge, trChan };')();

const SR = 44100;
// an AudioBuffer look-alike
const abuf = (chs, sr = SR) => ({ sampleRate: sr, length: chs[0].length, duration: chs[0].length / sr, numberOfChannels: chs.length, getChannelData: (c) => chs[c] });
let seed = 12345; const rnd = () => ((seed = (seed * 1103515245 + 12345) >>> 0) / 4294967296) * 2 - 1;

// sources of a synthetic song (seconds)
function sources(sec) {
  const n = Math.round(sec * SR), voice = new Float32Array(n), gtr = new Float32Array(n), pad = new Float32Array(n), bass = new Float32Array(n);
  const revL = new Float32Array(n), revR = new Float32Array(n);
  // voice: syllables of random length (0.15–0.45 s) and gaps, a breath (0.6–2 s) after 4–10 syllables, f0 160–330 Hz with
  // vibrato, formant-shaped harmonics
  const plan = []; for (let t = 0.3; t < sec;) { const k = 4 + Math.floor((rnd() + 1) * 3.5); for (let j = 0; j < k && t < sec; j++) { const d = 0.15 + 0.15 * (rnd() + 1); plan.push([t, d, 160 + 85 * (rnd() + 1)]); t += d + 0.04 + 0.04 * (rnd() + 1); } t += 0.6 + 0.7 * (rnd() + 1); }
  let ph = 0, si = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    while (si < plan.length - 1 && t >= plan[si][0] + plan[si][1]) si++;
    const [s0, d, f00] = plan[si], inSyl = t - s0;
    const on = inSyl >= 0 && inSyl < d ? Math.sin(Math.PI * inSyl / d) ** 0.5 : 0;
    const f0 = f00 * (1 + 0.012 * Math.sin(2 * Math.PI * 5.5 * t));
    ph += 2 * Math.PI * f0 / SR;
    if (!on) { voice[i] = 0; continue; }
    let v = 0;
    for (let h = 1; h <= 25; h++) { const f = f0 * h; if (f > 7500) break; const fm = Math.exp(-(((f - 700) / 300) ** 2)) + 0.6 * Math.exp(-(((f - 1800) / 400) ** 2)) + 0.3 * Math.exp(-(((f - 2900) / 500) ** 2)) + 0.05; v += fm * Math.sin(h * ph) / h ** 0.3; }
    voice[i] = 0.12 * on * v;
  }
  // guitar (left): plucked notes every 0.25 s; pad (right): slow chord
  for (let i = 0; i < n; i++) {
    const t = i / SR, k = Math.floor(t / 0.25), tt = t % 0.25, f = [196, 247, 294, 392, 330, 262][k % 6];
    let g = 0; for (let h = 1; h <= 8; h++) g += Math.sin(2 * Math.PI * f * h * tt) / h; gtr[i] = 0.25 * Math.exp(-tt * 9) * g;
    pad[i] = 0.06 * (Math.sin(2 * Math.PI * 220 * t) + Math.sin(2 * Math.PI * 277.2 * t) + Math.sin(2 * Math.PI * 329.6 * t)) * (0.7 + 0.3 * Math.sin(2 * Math.PI * 0.2 * t));
    bass[i] = 0.3 * Math.sin(2 * Math.PI * 55 * t) * (0.6 + 0.4 * Math.cos(2 * Math.PI * 2 * t));
  }
  // wide reverb of the voice: two different decaying noise tails
  let eL = 0, eR = 0, lpL = 0, lpR = 0;
  for (let i = 0; i < n; i++) {
    const drive = Math.abs(voice[i]); eL = Math.max(drive, eL * 0.99993); eR = Math.max(drive, eR * 0.99993);
    lpL += 0.3 * (rnd() - lpL); lpR += 0.3 * (rnd() - lpR); revL[i] = 0.6 * eL * lpL; revR[i] = 0.6 * eR * lpR;
  }
  return { n, voice, gtr, pad, bass, revL, revR };
}
const mixStereo = (s, voiceL = 1, voiceR = 1) => {
  const L = new Float32Array(s.n), R = new Float32Array(s.n);
  for (let i = 0; i < s.n; i++) { L[i] = voiceL * s.voice[i] + s.gtr[i] + s.revL[i] + 0.7 * s.bass[i]; R[i] = voiceR * s.voice[i] + s.pad[i] + s.revR[i] + 0.7 * s.bass[i]; }
  return [L, R];
};
// a source at 16 kHz on the same grid as the app (k = time a + k/16000)
const at16 = (x, a, n) => { const o = new Float32Array(n); trChan(abuf([x]), a, 0, n, [0], o); return o; };
// share of y explained by each source: least-squares fit y ≈ Σ c_j s_j, energy of each part / energy of y
function shares(y, srcs) {
  const k = srcs.length, G = Array.from({ length: k }, () => new Float64Array(k)), b = new Float64Array(k);
  for (let i = 0; i < y.length; i++) for (let p = 0; p < k; p++) { b[p] += srcs[p][i] * y[i]; for (let q = p; q < k; q++) G[p][q] += srcs[p][i] * srcs[q][i]; }
  for (let p = 0; p < k; p++) for (let q = 0; q < p; q++) G[p][q] = G[q][p];
  // Gaussian elimination
  const A = G.map((r, i) => [...r, b[i]]);
  for (let c = 0; c < k; c++) { let m = c; for (let r = c + 1; r < k; r++) if (Math.abs(A[r][c]) > Math.abs(A[m][c])) m = r; [A[c], A[m]] = [A[m], A[c]];
    for (let r = 0; r < k; r++) if (r !== c) { const f = A[r][c] / A[c][c]; for (let j = c; j <= k; j++) A[r][j] -= f * A[c][j]; } }
  const coef = A.map((r, i) => r[k] / r[i]);
  let ey = 0; for (const v of y) ey += v * v;
  return srcs.map((s, j) => { let e = 0; for (const v of s) e += (coef[j] * v) ** 2; return e / ey; });
}
// energy below 90 Hz / total (crude DFT on a 1 s window)
function lowShare(y) {
  const n = 16000, off = Math.floor(y.length / 2) - n / 2; let lo = 0, tot = 0;
  for (let i = off; i < off + n; i++) tot += y[i] * y[i];
  for (let f = 20; f <= 90; f += 5) { let re = 0, im = 0; for (let i = 0; i < n; i++) { const w = 2 * Math.PI * f * i / 16000; re += y[off + i] * Math.cos(w); im -= y[off + i] * Math.sin(w); } lo += 2 * (re * re + im * im) / n * 5; }
  return lo / tot;
}
const stats = (y) => { let ss = 0, pk = 0, bad = 0; for (const v of y) { if (!Number.isFinite(v)) bad++; ss += v * v; pk = Math.max(pk, Math.abs(v)); } return { rms: Math.sqrt(ss / y.length), pk, bad }; };
const fmt = (x) => (x * 100).toFixed(1) + ' %';
let pass = 0, fail = 0;
const check = (name, ok, info = '') => { console.log((ok ? 'PASS ' : 'FAIL ') + name + (info ? '  — ' + info : '')); ok ? pass++ : fail++; };

// 1. A/B on a 30 s stereo piece: plain mix (as before) vs voice brought forward
{
  const src = sources(32), [L, R] = mixStereo(src), buf = abuf([L, R]);
  const a = 0.5, n = 30 * 16000;
  const v = trVocal(buf, a, 0, n);
  const plain = new Float32Array(n); trChan(buf, a, 0, n, [0, 1], plain);
  const S = [src.voice, src.gtr, src.pad, src.bass, src.revL, src.revR].map((x) => at16(x, a, n));
  const before = shares(plain, S), after = shares(v.y, S), st = stats(v.y);
  console.log('                 voice   guitar(L) pad(R)   bass    reverb L+R');
  console.log('plain mix      ' + [0, 1, 2, 3].map((j) => fmt(before[j]).padStart(8)).join(' ') + fmt(before[4] + before[5]).padStart(10));
  console.log('voice forward  ' + [0, 1, 2, 3].map((j) => fmt(after[j]).padStart(8)).join(' ') + fmt(after[4] + after[5]).padStart(10) + '   (middle kept ' + v.ratio.toFixed(2) + ', gain ×' + v.gain.toFixed(2) + ')');
  check('no NaN / Infinity', st.bad === 0);
  check('no clipping (peak ≤ 0.9)', st.pk <= 0.9 + 1e-6, 'peak ' + st.pk.toFixed(3));
  check('level evened (RMS −20 dBFS or peak-limited)', Math.abs(st.rms - 0.1) < 0.005 || st.pk > 0.899, 'rms ' + st.rms.toFixed(4));
  check('middle used for a centred voice', v.center);
  check('voice share goes up', after[0] > before[0] * 1.3, fmt(before[0]) + ' → ' + fmt(after[0]));
  check('side instruments down', after[1] + after[2] < 0.5 * (before[1] + before[2]), fmt(before[1] + before[2]) + ' → ' + fmt(after[1] + after[2]));
  // wide content alone (decorrelated L / R, like a stereo reverb or a wide pad) vs the same content in the middle
  const nz = () => { const x = new Float32Array(SR * 12); let lp = 0; for (let i = 0; i < x.length; i++) { lp += 0.3 * (rnd() - lp); x[i] = 0.2 * lp; } return x; };
  const wL = nz(), wR = nz(), wide = trVocal(abuf([wL, wR]), 0.5, 0, 10 * 16000), mid = trVocal(abuf([wL, wL]), 0.5, 0, 10 * 16000);
  check('wide reverb-like content turned down, the same in the middle kept', wide.ratio < 0.35 && mid.ratio > 0.97, 'kept ' + wide.ratio.toFixed(2) + ' (wide) vs ' + mid.ratio.toFixed(2) + ' (middle)');
  check('bass under 90 Hz filtered', lowShare(v.y) < 0.25 * lowShare(plain), lowShare(plain).toFixed(3) + ' → ' + lowShare(v.y).toFixed(4));
}
// 2. exact rebuild: identical channels (a mono song in stereo) = the band-filtered signal, no mask
{
  const src = sources(12), x = src.voice.map((v, i) => v + 0.5 * src.gtr[i]), n = 10 * 16000;
  const v2 = trVocal(abuf([x, x]), 1, 0, n), v1 = trVocal(abuf([x]), 1, 0, n);
  let d = 0, e = 0; for (let i = 0; i < n; i++) { const a = v2.y[i] / v2.gain, b = v1.y[i] / v1.gain; d += (a - b) ** 2; e += b * b; }
  check('L = R gives the same as the mono path (mask ≈ 1)', d / e < 1e-3 && v2.ratio > 0.97, 'rel. error ' + (d / e).toExponential(1) + ', middle kept ' + v2.ratio.toFixed(3));
  check('mono file: no masking, filter + level only', !v1.center && Math.abs(stats(v1.y).rms - 0.1) < 0.005);
  // pure band-pass passes a 1 kHz tone unchanged (perfect rebuild of the STFT)
  const tone = new Float32Array(SR * 6).map((_, i) => 0.3 * Math.sin(2 * Math.PI * 1000 * i / SR));
  const vt = trVocal(abuf([tone]), 0, 16000, 16000 * 5), ref = new Float32Array(16000 * 4); trChan(abuf([tone]), 0, 16000, 16000 * 5, [0], ref);
  let dd = 0, ee = 0; for (let i = 0; i < ref.length; i++) { dd += (vt.y[i] / vt.gain - ref[i]) ** 2; ee += ref[i] ** 2; }
  check('1 kHz tone rebuilt exactly (voice band untouched)', dd / ee < 1e-4, 'rel. error ' + (dd / ee).toExponential(1));
}
// 3. voice not in the middle (hard left, wide mix): fall back to the plain mix
{
  const src = sources(32), [L, R] = mixStereo(src, 1.4, 0), v = trVocal(abuf([L, R]), 0.5, 0, 30 * 16000);
  check('voice hard left → plain mix sent (fallback)', !v.center, 'middle kept ' + v.ratio.toFixed(2));
  check('fallback output clean', stats(v.y).bad === 0 && stats(v.y).pk <= 0.9 + 1e-6);
  const z = trVocal(abuf([new Float32Array(SR * 3), new Float32Array(SR * 3)]), 0, 0, 2 * 16000);
  check('digital silence: no NaN, stays silent', stats(z.y).bad === 0 && stats(z.y).pk === 0);
}
// 4. speed: a 3-minute stereo passage at 44.1 kHz, pieces of 30 s (as on the phone, piece after piece)
{
  const src = sources(181), [L, R] = mixStereo(src), buf = abuf([L, R]), n = 180 * 16000;
  trVocal(buf, 0, 0, 16000);   // warm-up
  const t = performance.now(); let k = 0;
  for (let p = 0; p < n; p += 30 * 16000) { trVocal(buf, 0.5, p, Math.min(n, p + 30 * 16000)); k++; }
  const ms = performance.now() - t;
  check('3-minute passage processed fast (' + k + ' pieces)', ms < 2000, Math.round(ms) + ' ms on this machine');
  console.log('speed: ' + Math.round(ms) + ' ms for 180 s (' + (ms / 180).toFixed(1) + ' ms per second of audio)');
}
// 5. where a vocals file sits: it starts 7.3 s later than the song and is shorter
{
  const src = sources(70), [L, R] = mixStereo(src), song = abuf([L, R]);
  const cut = Math.round(7.3 * SR), vx = src.voice.slice(cut, cut + 50 * SR).map((v, i) => v + 0.6 * src.revL[cut + i]);
  const t = performance.now(), o = trOffset(song, abuf([vx]));
  check('vocals offset found (+7.3 s)', Math.abs(o.offset - 7.3) <= 0.04 && o.sure, 'offset ' + o.offset.toFixed(2) + ' s, corr ' + o.corr.toFixed(2) + ', ' + Math.round(performance.now() - t) + ' ms');
  const noise = new Float32Array(50 * SR).map(() => 0.1 * rnd()), on = trOffset(song, abuf([noise]));
  check('unrelated file → not sure', !on.sure, 'corr ' + on.corr.toFixed(2));
}
// 6. context and merge at the cuts
{
  const segs = [{ text: 'Je rentre tard ce soir, la ville dort encore et mon cœur bat fort sous la neige. ' + 'Encore une fois je cours dans la nuit. '.repeat(5) + '<b>✨\u0000' }];
  const c = trContext(segs);
  check('context: ≤ 180 chars, whole words, no markup / control chars', c.length <= 180 && !/[<>\u0000✨]/u.test(c) && c.startsWith('Encore') === false && /nuit\.?\s*b?$/.test(c), JSON.stringify(c));
  const w = (word, start, end) => ({ word, start, end });
  const A = [{ start: 10, end: 13, text: 'mon cœur bat fort', words: [w('mon', 10, 10.4), w('cœur', 10.4, 11), w('bat', 11, 11.6), w('fort', 11.6, 13)] }];
  // the next piece starts by the same words again (squeezed right after the cut): dropped
  const B = [{ start: 13.1, end: 16, text: 'mon cœur bat fort sous la neige', words: [w('Mon', 13.1, 13.2), w('cœur', 13.2, 13.3), w('bat', 13.3, 13.4), w('fort,', 13.4, 13.5), w('sous', 14, 14.5), w('la', 14.5, 14.8), w('neige', 14.8, 16)] }];
  let m = trMerge([A, B]);
  check('duplicated line at a cut removed', m.dropped === 4 && m.segs[1].text === 'sous la neige' && m.segs[1].start === 14, JSON.stringify(m.segs[1]));
  // a real repeat, sung again at the same pace after the cut: kept
  const B2 = [{ start: 13.5, end: 16.5, text: 'mon cœur bat fort', words: [w('mon', 13.5, 13.9), w('cœur', 13.9, 14.5), w('bat', 14.5, 15.1), w('fort', 15.1, 16.5)] }];
  m = trMerge([A, B2]);
  check('a line really sung twice is kept', m.dropped === 0 && m.segs.length === 2);
  // blocks without word times: the same text twice in a row across the cut
  m = trMerge([[{ start: 0, end: 30, text: 'La ville dort.', words: [] }], [{ start: 30, end: 60, text: 'la ville dort', words: [] }, { start: 40, end: 50, text: 'Encore', words: [] }]]);
  check('same block twice (no word times) kept once', m.dropped === 1 && m.segs.length === 2);
  check('merge keeps segments of empty pieces', trMerge([A, [], B2]).segs.length === 2);
}
// 7. optional: a real song (16-bit PCM WAV) → the 16 kHz piece as it would be sent, for listening
if (process.argv[2]) {
  const f = readFileSync(process.argv[2]);
  assert.equal(f.toString('latin1', 0, 4), 'RIFF');
  let o = 12, fmtc = null, data = null;
  while (o + 8 <= f.length) { const id = f.toString('latin1', o, o + 4), sz = f.readUInt32LE(o + 4); if (id === 'fmt ') fmtc = { ch: f.readUInt16LE(o + 10), sr: f.readUInt32LE(o + 12), bits: f.readUInt16LE(o + 22) }; if (id === 'data') data = f.subarray(o + 8, o + 8 + sz); o += 8 + sz + (sz & 1); }
  assert.ok(fmtc && data && fmtc.bits === 16, '16-bit PCM WAV');
  const frames = data.length / 2 / fmtc.ch, chs = Array.from({ length: fmtc.ch }, () => new Float32Array(frames));
  for (let i = 0; i < frames; i++) for (let c = 0; c < fmtc.ch; c++) chs[c][i] = data.readInt16LE((i * fmtc.ch + c) * 2) / 32768;
  const buf = abuf(chs, fmtc.sr), n = Math.min(Math.floor(buf.duration * 16000), 30 * 16000), t = performance.now();
  const v = trVocal(buf, 0, 0, n), ms = performance.now() - t, st = stats(v.y);
  check('real song: clean output', st.bad === 0 && st.pk <= 0.9 + 1e-6, (v.center ? 'middle' : 'plain mix') + ' (kept ' + v.ratio.toFixed(2) + '), ' + Math.round(ms) + ' ms for ' + (n / 16000).toFixed(1) + ' s');
  const out = Buffer.alloc(44 + n * 2); out.write('RIFF', 0); out.writeUInt32LE(36 + n * 2, 4); out.write('WAVEfmt ', 8); out.writeUInt32LE(16, 16); out.writeUInt16LE(1, 20); out.writeUInt16LE(1, 22);
  out.writeUInt32LE(16000, 24); out.writeUInt32LE(32000, 28); out.writeUInt16LE(2, 32); out.writeUInt16LE(16, 34); out.write('data', 36); out.writeUInt32LE(n * 2, 40);
  for (let i = 0; i < n; i++) out.writeInt16LE(Math.round(Math.max(-1, Math.min(1, v.y[i])) * 32767), 44 + i * 2);
  const dest = process.argv[3] || join(dirname(process.argv[2]), basename(process.argv[2], '.wav') + '.voice.wav');
  writeFileSync(dest, out); console.log('written ' + dest);
}
console.log(`\n${pass}/${pass + fail} checks passed`);
process.exit(fail ? 1 : 0);
