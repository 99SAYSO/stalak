// UI test server: node tests/ui/server.mjs <built site dir> <port>
// Serves a built site (python3 build_site.py, public/) and runs the real Pages Functions for /api/* on an in-memory
// SQLite "D1", with a fake Workers AI binding (env.AI) that answers in the documented Whisper output shape.
// Test-only routes: POST /__test/user {pro} → a signed-in user (session token); GET /__test/ai → the AI calls seen;
// GET /__test/helpmax?n=N → the help assistant's daily budget.
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, dirname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createD1 } from '../backend/fake-d1.mjs';
import { onRequest } from '../../functions/api/[[path]].js';
import { onRequest as adminPage } from '../../functions/admin/[[path]].js';
import { sha256Hex, base64url } from '../../functions/_lib/crypto.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const siteDir = process.argv[2], port = Number(process.argv[3] || 8787), origin = `http://localhost:${port}`;
const WORDS = ['je', 'rentre', 'tard', 'ce', 'soir', 'la', 'ville', 'dort', 'encore', 'mon', 'cœur', 'bat', 'fort', 'sous', 'la', 'neige'];
const aiCalls = [];
const AI = {
  async run(model, input) {
    // the help assistant (POST /api/help/chat): a chat model, answered in the chat-completion shape
    if (Array.isArray(input.messages)) {
      const sys = input.messages[0].content, q = input.messages[input.messages.length - 1].content;
      aiCalls.push({ model, help: true, en: sys.includes('ANSWER RULES'), turns: input.messages.length - 1, question: q });
      const content = sys.includes('ANSWER RULES') ? 'Tap **“Export video”** at the Edit step.' : 'Touche **« Exporter la vidéo »** à l’étape Montage.';
      return { id: 'c1', object: 'chat.completion', choices: [{ index: 0, message: { role: 'assistant', content } }] };
    }
    const bytes = Buffer.from(input.audio, 'base64');
    const dur = (bytes.length - 44) / 32000;
    let ss = 0, pk = 0; for (let i = 44; i + 1 < bytes.length; i += 2) { const v = bytes.readInt16LE(i) / 32768; ss += v * v; pk = Math.max(pk, Math.abs(v)); }
    const call = { model, language: input.language || null, vad: input.vad_filter, seconds: Math.round(dur * 100) / 100,
      wav: bytes.toString('latin1', 0, 4) + bytes.toString('latin1', 8, 12), rate: bytes.readUInt32LE(24), channels: bytes.readUInt16LE(22),
      prompt: input.initial_prompt, conditioned: input.condition_on_previous_text, rms: Math.sqrt(ss / Math.max(1, (bytes.length - 44) / 2)), peak: pk, t0: Date.now() };
    aiCalls.push(call);
    await new Promise((r) => setTimeout(r, 60));   // a little like the real model: takes some time
    call.t1 = Date.now();
    // a 4-word phrase every 2.5 s, then a silence hallucination that must be dropped
    const segments = []; let k = 0;
    // with context (the previous piece's end), the model "repeats" its last 4 words squeezed at the start: a duplicate at the
    // cut that the client must remove
    const ctxWords = /^(Paroles de chanson\.|Song lyrics\.)( Paroles de chanson\.)? (.+)$/.exec(input.initial_prompt || '');
    if (ctxWords) {
      const last = ctxWords[3].split(' ').slice(-4);
      segments.push({ start: 0.05, end: 0.45, text: ' ' + last.join(' '), temperature: 0, avg_logprob: -0.5, compression_ratio: 1, no_speech_prob: 0.1,
        words: last.map((w, i) => ({ word: ' ' + w, start: +(0.05 + i * 0.1).toFixed(2), end: +(0.13 + i * 0.1).toFixed(2) })) });
    }
    for (let t = 0.6; t + 2 < dur; t += 2.5) {
      const words = [0, 1, 2, 3].map((i) => ({ word: ' ' + WORDS[(k * 4 + i) % WORDS.length] + (i === 3 ? '.' : ''), start: +(t + i * 0.4).toFixed(2), end: +(t + i * 0.4 + 0.35).toFixed(2) }));
      segments.push({ start: words[0].start, end: words[3].end, text: words.map((w) => w.word).join(''), temperature: 0, avg_logprob: -0.3, compression_ratio: 1.2, no_speech_prob: 0.02, words });
      k++;
    }
    segments.push({ start: Math.max(0, dur - 1), end: dur, text: ' Sous-titres réalisés par la communauté d\'Amara.org', temperature: 0, avg_logprob: -0.6, compression_ratio: 1.1, no_speech_prob: 0.5, words: [] });
    return { transcription_info: { language: input.language || 'fr', language_probability: 0.9, duration: dur, duration_after_vad: dur }, text: segments.map((s) => s.text).join(''), word_count: k * 4, segments, vtt: 'WEBVTT' };
  },
};
// Cloudflare Access, imitated for the owner's dashboard: a test key signs the token the Access edge would add, for requests
// that carry the cookie test_admin=1 (set by GET /__test/admin-login). The real check in functions/_lib/admin.js runs unchanged.
const ACCESS_TEAM = 'https://stalak-ui.cloudflareaccess.com', ACCESS_AUD = 'aud-ui-test-0123456789abcdef0123';
const accessKey = await crypto.subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign', 'verify']);
const accessJwk = { ...(await crypto.subtle.exportKey('jwk', accessKey.publicKey)), kid: 'ui1', alg: 'RS256', use: 'sig' };
const realFetch = globalThis.fetch;
globalThis.fetch = (url, init) => String(url) === ACCESS_TEAM + '/cdn-cgi/access/certs' ? Promise.resolve(Response.json({ keys: [accessJwk] })) : realFetch(url, init);
const b64u = (b) => Buffer.from(b).toString('base64url');
async function accessToken() {
  const now = Math.floor(Date.now() / 1000);
  const input = b64u(JSON.stringify({ alg: 'RS256', kid: 'ui1', typ: 'JWT' })) + '.' + b64u(JSON.stringify({ iss: ACCESS_TEAM, aud: [ACCESS_AUD], email: 'owner@example.com', iat: now, exp: now + 600 }));
  return input + '.' + b64u(await crypto.subtle.sign({ name: 'RSASSA-PKCS1-v1_5' }, accessKey.privateKey, new TextEncoder().encode(input)));
}
const env = { ADMIN_HOST: 'localhost', ACCESS_TEAM_DOMAIN: ACCESS_TEAM, ACCESS_AUD, ADMIN_EMAILS: 'owner@example.com',
  DB: createD1(join(root, 'migrations')), APP_ORIGIN: origin, PADDLE_ENV: 'sandbox', PADDLE_CLIENT_TOKEN: 'test_x', PADDLE_PRICE_MONTH: 'pri_month', PADDLE_PRICE_YEAR: 'pri_year', AI };
// e-mails: in dev mode (no RESEND_API_KEY) the server writes them in the console; kept here for the tests (GET /__test/mails)
const mails = [];
const consoleLog = console.log;
console.log = (...a) => { const t = String(a[0]); if (t.startsWith('[stalak dev] mail to ')) mails.push(t.slice(21)); else consoleLog(...a); };
let userN = 0;
async function testUser(pro) {
  const id = 'u_ui' + (++userN), now = Date.now(), token = base64url(crypto.getRandomValues(new Uint8Array(32)));
  env.DB.raw.prepare('INSERT INTO users (id, email, lang, created_at, last_login_at, email_verified_at) VALUES (?, ?, ?, ?, ?, ?)').run(id, `ui${userN}@example.com`, 'fr', now, now, now);
  env.DB.raw.prepare('INSERT INTO sessions (token_hash, user_id, created_at, expires_at, method) VALUES (?, ?, ?, ?, ?)').run(await sha256Hex(token), id, now, now + 864e5, 'password');
  if (pro) env.DB.raw.prepare("INSERT INTO subscriptions (id, user_id, customer_id, status, price_id, current_period_end, last_event_at, updated_at) VALUES (?, ?, ?, 'active', 'pri_month', ?, ?, ?)").run('sub_ui' + userN, id, 'ctm_ui' + userN, now + 30 * 864e5, now, now);
  return { id, token };
}
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json', '.txt': 'text/plain' };

http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, origin);
    const chunks = []; for await (const c of req) chunks.push(c);
    const body = Buffer.concat(chunks);
    if (url.pathname === '/__test/user') { const u = await testUser(JSON.parse(body.toString() || '{}').pro); res.writeHead(200, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify(u)); }
    // the site-wide daily budget of the help assistant (HELP_DAILY_MAX)
    if (url.pathname === '/__test/helpmax') { env.HELP_DAILY_MAX = url.searchParams.get('n'); res.writeHead(200); return res.end('{}'); }
    if (url.pathname === '/__test/admin-login') { res.writeHead(302, { Location: '/admin/', 'Set-Cookie': 'test_admin=1; Path=/' }); return res.end(); }
    if (url.pathname === '/__test/mails') { res.writeHead(200, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify(mails)); }
    if (url.pathname === '/__test/ai') { res.writeHead(200, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify(aiCalls)); }
    const isAdmin = url.pathname === '/admin' || url.pathname.startsWith('/admin/') || url.pathname.startsWith('/api/admin/');
    if (url.pathname.startsWith('/api/') || isAdmin) {
      const headers = new Headers(); for (const [k, v] of Object.entries(req.headers)) headers.set(k, Array.isArray(v) ? v.join(', ') : v);
      if (isAdmin && /(^|;\s*)test_admin=1/.test(req.headers.cookie || '')) headers.set('Cf-Access-Jwt-Assertion', await accessToken());
      headers.set('CF-Connecting-IP', '127.0.0.1');
      const request = new Request(origin + req.url, { method: req.method, headers, body: ['GET', 'HEAD'].includes(req.method) ? undefined : body });
      const r = url.pathname.startsWith('/api/') ? await onRequest({ request, env, params: {}, waitUntil() {} }) : await adminPage({ request, env });
      const h = {}; r.headers.forEach((v, k) => { if (k !== 'set-cookie') h[k] = v; });
      const sc = r.headers.getSetCookie(); if (sc.length) h['set-cookie'] = sc;
      res.writeHead(r.status, h); return res.end(Buffer.from(await r.arrayBuffer()));
    }
    let p = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '');
    let f = join(siteDir, p);
    try { if ((await stat(f)).isDirectory()) f = join(f, 'index.html'); } catch { if (!extname(f)) f += '.html'; }
    let data = await readFile(f);
    // test probe: the app lives in a closure; __ev(code) evaluates code inside it (test server only, never in the build)
    if (extname(f) === '.html') data = Buffer.from(data.toString('utf8').replace(/applyLang\(\);\n\}\)\(\);/, 'applyLang();\nwindow.__ev = (s) => eval(s);\n})();'));
    res.writeHead(200, { 'Content-Type': TYPES[extname(f)] || 'application/octet-stream' }); res.end(data);
  } catch (e) {
    res.writeHead(e.code === 'ENOENT' ? 404 : 500, { 'Content-Type': 'text/plain' }); res.end(String(e.code === 'ENOENT' ? 'not found' : e.stack));
  }
}).listen(port, () => console.log('ui test server on ' + origin));
