// Backend tests: node tests/backend/run.mjs   (Node >= 22.5, no dependencies)
// Runs the real Pages Function (functions/api/[[path]].js) against an in-memory SQLite "D1" and a fake fetch
// (Resend, Paddle, and fake Google / Apple / Microsoft token endpoints and key sets).
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import assert from 'node:assert/strict';
import { createD1 } from './fake-d1.mjs';
import { createR2 } from './fake-r2.mjs';
import { onRequest } from '../../functions/api/[[path]].js';
import { hmacSha256Hex, sha256Hex, base64url } from '../../functions/_lib/crypto.js';
import { verifySignature } from '../../functions/_lib/paddle.js';
import { verifyJwtSignature, decodeJwt } from '../../functions/_lib/jwt.js';
import { resetJwksCache } from '../../functions/_lib/oauth.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const ORIGIN = 'https://stalak.app';
const WEBHOOK_SECRET = 'pdl_ntfset_test_secret';
const PW = 'glace-et-neige-42';

// ---- fake identity providers (keys made here; tokens signed here) ---------------------------
const enc = new TextEncoder();
const b64j = (o) => base64url(enc.encode(JSON.stringify(o)));
async function rsaKey(kid) {
  const k = await crypto.subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign', 'verify']);
  const jwk = await crypto.subtle.exportKey('jwk', k.publicKey);
  return { kid, alg: 'RS256', priv: k.privateKey, jwk: { kty: 'RSA', n: jwk.n, e: jwk.e, kid, alg: 'RS256', use: 'sig' } };
}
async function ecKey(kid) {
  const k = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  const jwk = await crypto.subtle.exportKey('jwk', k.publicKey);
  return { kid, alg: 'ES256', priv: k.privateKey, pub: k.publicKey, jwk: { kty: 'EC', crv: 'P-256', x: jwk.x, y: jwk.y, kid, alg: 'ES256', use: 'sig' },
    pkcs8: await crypto.subtle.exportKey('pkcs8', k.privateKey) };
}
async function signJwt(key, payload, header = {}) {
  const h = { alg: key.alg, kid: key.kid, typ: 'JWT', ...header };
  const input = b64j(h) + '.' + b64j(payload);
  const algo = key.alg === 'RS256' ? { name: 'RSASSA-PKCS1-v1_5' } : { name: 'ECDSA', hash: 'SHA-256' };
  return input + '.' + base64url(new Uint8Array(await crypto.subtle.sign(algo, key.priv, enc.encode(input))));
}
const KEYS = {
  google: await rsaKey('g1'), microsoft: await rsaKey('m1'), apple: await ecKey('a1'), appleRsa: await rsaKey('a2'),
  rogue: await rsaKey('g1'),        // same kid as Google's, other key: forged tokens
  appleP8: await ecKey('ABC123DEFG'), // the .p8 key used to sign Apple's client secret
};
const pem = (der) => '-----BEGIN PRIVATE KEY-----\n' + Buffer.from(der).toString('base64').match(/.{1,64}/g).join('\n') + '\n-----END PRIVATE KEY-----\n';
const JWKS = {
  'https://www.googleapis.com/oauth2/v3/certs': { keys: [KEYS.google.jwk] },
  'https://login.microsoftonline.com/common/discovery/v2.0/keys': { keys: [KEYS.microsoft.jwk] },
  'https://appleid.apple.com/auth/keys': { keys: [KEYS.apple.jwk, KEYS.appleRsa.jwk] },
};
const TOKEN_URLS = { 'https://oauth2.googleapis.com/token': 'google', 'https://login.microsoftonline.com/common/oauth2/v2.0/token': 'microsoft', 'https://appleid.apple.com/auth/token': 'apple' };
let nextIdToken = null;           // what the fake token endpoint answers
const tokenRequests = [];

// ---- fake outside world -------------------------------------------------------------
const outbound = [];
globalThis.fetch = async (url, init = {}) => {
  url = String(url);
  if (JWKS[url]) return Response.json(JWKS[url]);
  if (TOKEN_URLS[url]) {
    tokenRequests.push({ provider: TOKEN_URLS[url], form: new URLSearchParams(init.body) });
    if (!nextIdToken) return Response.json({ error: 'invalid_grant' }, { status: 400 });
    return Response.json({ access_token: 'at', token_type: 'Bearer', expires_in: 3600, id_token: nextIdToken });
  }
  const body = init.body ? JSON.parse(init.body) : null;
  outbound.push({ url, method: init.method, body, headers: init.headers });
  if (url === 'https://api.resend.com/emails') return Response.json({ id: 'email_1' });
  let m = url.match(/paddle\.com\/customers\/(ctm_\w+)\/portal-sessions$/);
  if (m) return Response.json({ data: { id: 'cpls_1', customer_id: m[1], urls: { general: { overview: 'https://portal.example/overview' },
    subscriptions: (body.subscription_ids || []).map((id) => ({ id, cancel_subscription: 'https://portal.example/cancel/' + id,
      update_subscription_payment_method: 'https://portal.example/pay/' + id, view_subscription: 'https://portal.example/view/' + id })) } } }, { status: 201 });
  m = url.match(/paddle\.com\/subscriptions\/(sub_\w+)\/cancel$/);
  if (m) return Response.json({ data: { id: m[1], status: 'canceled' } });
  return new Response('not mocked: ' + url, { status: 599 });
};
const origLog = console.log, origWarn = console.warn;
console.log = (...a) => { if (!String(a[0]).startsWith('[stalak dev]')) origLog(...a); };
console.warn = () => {};

const OAUTH_ENV = {
  GOOGLE_CLIENT_ID: 'g-client.apps.googleusercontent.com', GOOGLE_CLIENT_SECRET: 'g-secret',
  MICROSOFT_CLIENT_ID: '11111111-2222-3333-4444-555555555555', MICROSOFT_CLIENT_SECRET: 'm-secret',
  APPLE_CLIENT_ID: 'app.stalak.web', APPLE_TEAM_ID: 'TEAM123456', APPLE_KEY_ID: 'ABC123DEFG', APPLE_PRIVATE_KEY: pem(KEYS.appleP8.pkcs8),
};

function makeEnv(extra = {}) {
  return {
    DB: createD1(join(root, 'migrations')),
    APP_ORIGIN: ORIGIN, PADDLE_ENV: 'sandbox', PADDLE_WEBHOOK_SECRET: WEBHOOK_SECRET, PADDLE_API_KEY: 'pdl_sdbx_apikey_test',
    PADDLE_CLIENT_TOKEN: 'test_clienttoken', PADDLE_PRICE_MONTH: 'pri_month', PADDLE_PRICE_YEAR: 'pri_year',
    RESEND_API_KEY: 're_test', ...extra,
  };
}

let ipCounter = 0;
async function call(env, method, path, { body, cookie, origin = ORIGIN, ct = 'application/json', ip, headers = {}, raw } = {}) {
  const h = new Headers(headers);
  if (method !== 'GET') { if (ct) h.set('Content-Type', ct); if (origin) h.set('Origin', origin); }
  if (cookie) h.set('Cookie', cookie);
  h.set('CF-Connecting-IP', ip || '10.0.0.' + (++ipCounter % 250));
  const req = new Request('https://stalak.app' + path, { method, headers: h,
    body: method === 'GET' ? undefined : (raw !== undefined ? raw : JSON.stringify(body || {})) });
  const res = await onRequest({ request: req, env, params: {}, waitUntil() {} });
  const text = await res.text();
  let data; try { data = JSON.parse(text); } catch { data = text; }
  const setCookies = res.headers.getSetCookie();
  const jar = (name) => { const c = setCookies.find((x) => x.startsWith(name + '=')); return c ? c.split(';')[0] : null; };
  return { status: res.status, data, headers: res.headers, setCookies, jar };
}
const cookies = (...c) => c.filter(Boolean).join('; ');

function lastMail(email) {
  return [...outbound].reverse().find((o) => o.url.includes('resend') && o.body.to[0] === email);
}
function lastCode(email) {
  return lastMail(email).body.text.match(/\b(\d{6})\b/)[1];
}
const mailCount = (email) => outbound.filter((o) => o.url.includes('resend') && o.body.to[0] === email).length;
const ageCodes = (env) => env.DB.raw.exec(`UPDATE auth_codes SET created_at = created_at - ${31e3}`);

// Signs up (email + password + code): returns the session cookie, the trusted-device cookie, the user.
async function login(env, email, lang = 'fr', password = PW) {
  let r = await call(env, 'POST', '/api/auth/signup', { body: { email, password, lang } });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  r = await call(env, 'POST', '/api/auth/signup/verify', { body: { email, code: lastCode(email) } });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  return { cookie: r.jar('stalak_s'), device: r.jar('stalak_d'), user: r.data.user, data: r.data, setCookies: r.setCookies };
}
// Password sign-in, typing the code if the browser (device cookie) is new. Returns the cookies.
async function signIn(env, email, password = PW, device = null) {
  let r = await call(env, 'POST', '/api/auth/login', { body: { email, password }, cookie: device || undefined });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  if (r.data.needCode) {
    r = await call(env, 'POST', '/api/auth/login/verify', { body: { email, code: lastCode(email.trim().toLowerCase()) }, cookie: device || undefined });
    assert.equal(r.status, 200, JSON.stringify(r.data));
  }
  return { cookie: r.jar('stalak_s'), device: r.jar('stalak_d') || device, data: r.data };
}
// An account from before v3: made with an e-mail code only, no password; signed in with a 'code' session.
async function legacyUser(env, email) {
  const id = 'u_legacy' + Math.random().toString(16).slice(2, 10), now = Date.now(), token = base64url(crypto.getRandomValues(new Uint8Array(32)));
  env.DB.raw.prepare('INSERT INTO users (id, email, lang, created_at, last_login_at, email_verified_at) VALUES (?, ?, ?, ?, ?, ?)').run(id, email, 'fr', now, now, now);
  env.DB.raw.prepare('INSERT INTO sessions (token_hash, user_id, created_at, expires_at, method) VALUES (?, ?, ?, ?, ?)').run(await sha256Hex(token), id, now, now + 864e5, 'code');
  return { id, cookie: 'stalak_s=' + token };
}

async function webhook(env, event, { secret = WEBHOOK_SECRET, ts = Math.floor(Date.now() / 1000), tamper = false } = {}) {
  const raw = JSON.stringify(event);
  const h1 = await hmacSha256Hex(secret, `${ts}:${raw}`);
  return call(env, 'POST', '/api/paddle/webhook', { raw: tamper ? raw.replace('active', 'actiwe') : raw, origin: null,
    headers: { 'Paddle-Signature': `ts=${ts};h1=${h1}` } });
}

let evtN = 0;
function subEvent(type, sub, occurredAt = new Date().toISOString()) {
  return { event_id: 'evt_' + (++evtN), event_type: type, occurred_at: occurredAt, notification_id: 'ntf_' + evtN, data: sub };
}
function sub(userId, over = {}) {
  const now = Date.now();
  return { id: 'sub_01', status: 'active', customer_id: 'ctm_01', custom_data: { user_id: userId },
    items: [{ status: 'active', quantity: 1, price: { id: 'pri_month', product_id: 'pro_1' } }],
    current_billing_period: { starts_at: new Date(now).toISOString(), ends_at: new Date(now + 30 * 864e5).toISOString() },
    scheduled_change: null, canceled_at: null, ...over };
}

// ---- tests ------------------------------------------------------------------------------
const tests = [];
const test = (name, fn) => tests.push({ name, fn });
const FREE_ENT = { plan: 'free', outro: true, cloudSave: false, clipMode: false, autoLyrics: false, packs: false };
const PRO_ENT = { plan: 'pro', outro: false, cloudSave: true, clipMode: true, autoLyrics: true, packs: true };

test('config exposes only public settings; sign-in providers only when configured', async () => {
  let r = await call(makeEnv(), 'GET', '/api/config');
  assert.equal(r.status, 200);
  assert.deepEqual(r.data.paddle, { environment: 'sandbox', clientToken: 'test_clienttoken', prices: { month: 'pri_month', year: 'pri_year' } });
  assert.deepEqual(r.data.auth.providers, []);
  assert.ok(!JSON.stringify(r.data).includes('pdl_sdbx_apikey_test'));
  assert.ok(!JSON.stringify(r.data).includes(WEBHOOK_SECRET));
  r = await call(makeEnv({ GOOGLE_CLIENT_ID: 'x', GOOGLE_CLIENT_SECRET: 'y', APPLE_CLIENT_ID: 'z' }), 'GET', '/api/config');
  assert.deepEqual(r.data.auth.providers, ['google'], 'Apple needs all four settings');
  r = await call(makeEnv(OAUTH_ENV), 'GET', '/api/config');
  assert.deepEqual(r.data.auth.providers, ['google', 'microsoft', 'apple']);
  for (const v of Object.values(OAUTH_ENV)) if (!/client/i.test(v) && v.length > 5 && !v.includes('.')) assert.ok(!JSON.stringify(r.data).includes(v), 'secret leaked');
});

test('anonymous /api/me returns free entitlements (no packs)', async () => {
  const r = await call(makeEnv(), 'GET', '/api/me');
  assert.equal(r.status, 200);
  assert.equal(r.data.user, null);
  assert.deepEqual(r.data.entitlements, FREE_ENT);
});

test('sign up: code by email (FR/EN), hashed; account made only after the code; session + trusted device', async () => {
  const env = makeEnv();
  let r = await call(env, 'POST', '/api/auth/signup', { body: { email: '  Alice@Example.com ', password: PW, displayName: ' Alice ', lang: 'en' } });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  assert.equal(r.data.needCode, true);
  assert.equal(r.data.devCode, undefined, 'code never returned outside dev');
  assert.equal(r.setCookies.length, 0, 'not signed in yet');
  assert.equal(env.DB.raw.prepare('SELECT COUNT(*) AS n FROM users').get().n, 0, 'no account before the code');
  const mail = lastMail('alice@example.com');
  assert.equal(mail.body.from, 'Stalak <login@stalak.app>');
  assert.match(mail.body.subject, /is your Stalak code/);
  assert.match(mail.body.text, /confirm your email/);
  const code = lastCode('alice@example.com');
  const stored = env.DB.raw.prepare('SELECT code_hash, data FROM auth_codes').get();
  assert.ok(!stored.code_hash.includes(code) && stored.code_hash.length === 64, 'code stored hashed');
  assert.ok(!stored.data.includes(PW), 'password kept hashed while waiting');

  r = await call(env, 'POST', '/api/auth/signup/verify', { body: { email: 'alice@example.com', code } });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  const sc = r.setCookies.find((c) => c.startsWith('stalak_s='));
  assert.match(sc, /^stalak_s=[A-Za-z0-9_-]{43};/);
  for (const flag of ['HttpOnly', 'Secure', 'SameSite=Lax', 'Path=/', `Max-Age=${60 * 86400}`]) assert.ok(sc.includes(flag), flag);
  const dc = r.setCookies.find((c) => c.startsWith('stalak_d='));
  for (const flag of ['HttpOnly', 'Secure', 'SameSite=Lax', 'Path=/api/auth', `Max-Age=${90 * 86400}`]) assert.ok(dc.includes(flag), flag);
  const dtok = dc.split(';')[0].split('=')[1];
  assert.equal(env.DB.raw.prepare('SELECT token_hash FROM trusted_devices').get().token_hash, await sha256Hex(dtok), 'device token stored hashed');
  assert.equal(r.data.user.email, 'alice@example.com');
  assert.equal(r.data.user.lang, 'en');
  assert.equal(r.data.user.displayName, 'Alice');
  assert.equal(r.data.user.hasPassword, true);
  assert.equal(r.data.user.emailVerified, true);
  assert.deepEqual(r.data.user.providers, []);
  assert.deepEqual(r.data.session, { method: 'signup', recentCode: false });
  const token = sc.split(';')[0].split('=')[1];
  const sess = env.DB.raw.prepare('SELECT token_hash, expires_at FROM sessions').get();
  assert.notEqual(sess.token_hash, token, 'session token stored hashed');
  assert.ok(Math.abs(sess.expires_at - (Date.now() + 60 * 864e5)) < 60e3);
  r = await call(env, 'GET', '/api/me', { cookie: 'stalak_s=' + token });
  assert.equal(r.data.user.email, 'alice@example.com');
  // code is single use
  r = await call(env, 'POST', '/api/auth/signup/verify', { body: { email: 'alice@example.com', code } });
  assert.equal(r.status, 400); assert.equal(r.data.error, 'code_expired');
  // French email
  await call(env, 'POST', '/api/auth/signup', { body: { email: 'bob@example.com', password: PW, lang: 'fr' } });
  assert.match(lastMail('bob@example.com').body.subject, /est ton code Stalak/);
  // logout
  r = await call(env, 'POST', '/api/auth/logout', { cookie: 'stalak_s=' + token });
  assert.match(r.headers.get('Set-Cookie'), /Max-Age=0/);
  r = await call(env, 'GET', '/api/me', { cookie: 'stalak_s=' + token });
  assert.equal(r.data.user, null);
});

test('sign up: password and name rules, bad email; nothing sent', async () => {
  const env = makeEnv();
  for (const [body, code] of [[{ email: 'x@example.com', password: 'short' }, 'password_too_short'], [{ email: 'x@example.com', password: 'azertyuiop' }, 'password_too_common'],
    [{ email: 'x@example.com', password: 'x@example.com' }, 'password_too_common'], [{ email: 'x@example.com', password: 'x'.repeat(201) }, 'password_too_long'],
    [{ email: 'x@example.com', password: PW, displayName: 'A' }, 'invalid_name'], [{ email: 'not-an-email', password: PW }, 'invalid_email']]) {
    const r = await call(env, 'POST', '/api/auth/signup', { body });
    assert.equal(r.status, 400, JSON.stringify(body)); assert.equal(r.data.error, code);
  }
  assert.equal(mailCount('x@example.com'), 0);
});

test('sign up: email already used -> 409 email_taken (also if taken while waiting for the code); rate limited per IP', async () => {
  const env = makeEnv();
  await login(env, 'taken@example.com');
  let r = await call(env, 'POST', '/api/auth/signup', { body: { email: 'TAKEN@example.com', password: 'autre-mot-de-passe' } });
  assert.equal(r.status, 409); assert.equal(r.data.error, 'email_taken');
  // asked twice: the second account made first wins, the other code is refused
  await call(env, 'POST', '/api/auth/signup', { body: { email: 'race@example.com', password: PW } });
  const code = lastCode('race@example.com');
  await legacyUser(env, 'race@example.com');
  r = await call(env, 'POST', '/api/auth/signup/verify', { body: { email: 'race@example.com', code } });
  assert.equal(r.status, 409); assert.equal(r.data.error, 'email_taken');
  // per IP: 20 sign-up requests / hour
  for (let i = 0; i < 20; i++) {
    r = await call(env, 'POST', '/api/auth/signup', { body: { email: 'taken@example.com', password: PW }, ip: '8.8.8.8' });
    assert.equal(r.status, 409);
  }
  r = await call(env, 'POST', '/api/auth/signup', { body: { email: 'taken@example.com', password: PW }, ip: '8.8.8.8' });
  assert.equal(r.status, 429); assert.equal(r.data.error, 'rate_limited');
});

test('codes: 5 wrong tries burn the code; expired code refused', async () => {
  const env = makeEnv();
  await call(env, 'POST', '/api/auth/signup', { body: { email: 'c@example.com', password: PW } });
  const good = lastCode('c@example.com');
  const bad = good === '000000' ? '111111' : '000000';
  for (let i = 1; i <= 4; i++) {
    const r = await call(env, 'POST', '/api/auth/signup/verify', { body: { email: 'c@example.com', code: bad } });
    assert.equal(r.status, 400); assert.equal(r.data.error, 'invalid_code'); assert.equal(r.data.attemptsLeft, 5 - i);
  }
  let r = await call(env, 'POST', '/api/auth/signup/verify', { body: { email: 'c@example.com', code: bad } });
  assert.equal(r.status, 429); assert.equal(r.data.error, 'too_many_attempts');
  r = await call(env, 'POST', '/api/auth/signup/verify', { body: { email: 'c@example.com', code: good } });
  assert.equal(r.status, 400, 'even the right code fails after 5 wrong ones');
  await call(env, 'POST', '/api/auth/signup', { body: { email: 'd@example.com', password: PW } });
  env.DB.raw.exec('UPDATE auth_codes SET expires_at = 1');
  r = await call(env, 'POST', '/api/auth/signup/verify', { body: { email: 'd@example.com', code: lastCode('d@example.com') } });
  assert.equal(r.data.error, 'code_expired');
  // a code of one purpose does not work for another
  await call(env, 'POST', '/api/auth/signup', { body: { email: 'e2@example.com', password: PW } });
  r = await call(env, 'POST', '/api/auth/login/verify', { body: { email: 'e2@example.com', code: lastCode('e2@example.com') } });
  assert.equal(r.data.error, 'code_expired');
});

test('code emails: asked again within 30 s = same code, no new mail; 5 per hour per email; 20 per hour per IP', async () => {
  const env = makeEnv();
  let r = await call(env, 'POST', '/api/auth/signup', { body: { email: 'e@example.com', password: PW } });
  assert.equal(r.status, 200); assert.equal(r.data.resent, true);
  r = await call(env, 'POST', '/api/auth/signup', { body: { email: 'e@example.com', password: 'un-autre-mdp-9' } });
  assert.equal(r.status, 200); assert.equal(r.data.resent, false);
  assert.equal(mailCount('e@example.com'), 1);
  // the last password typed is the one kept
  r = await call(env, 'POST', '/api/auth/signup/verify', { body: { email: 'e@example.com', code: lastCode('e@example.com') } });
  assert.equal(r.status, 200);
  await call(env, 'POST', '/api/auth/logout', { cookie: r.jar('stalak_s') });
  assert.equal((await call(env, 'POST', '/api/auth/login', { body: { email: 'e@example.com', password: 'un-autre-mdp-9' }, cookie: r.jar('stalak_d') })).data.user.email, 'e@example.com');

  for (let i = 0; i < 4; i++) { ageCodes(env); r = await call(env, 'POST', '/api/auth/signup', { body: { email: 'f@example.com', password: PW } }); assert.equal(r.status, 200); assert.equal(r.data.resent, true); }
  ageCodes(env); r = await call(env, 'POST', '/api/auth/signup', { body: { email: 'f@example.com', password: PW } }); assert.equal(r.status, 200);
  ageCodes(env); r = await call(env, 'POST', '/api/auth/signup', { body: { email: 'f@example.com', password: PW } });
  assert.equal(r.status, 429, '6th code in an hour refused'); assert.equal(r.data.error, 'rate_limited'); assert.ok(r.data.retryAfter > 0);

  env.DB.raw.exec('DELETE FROM rate_limits');
  for (let i = 0; i < 20; i++) {
    r = await call(env, 'POST', '/api/auth/forgot', { body: { email: `ip${i}@example.com` }, ip: '9.9.9.9' });
    assert.equal(r.status, 200);
  }
  r = await call(env, 'POST', '/api/auth/forgot', { body: { email: 'ip21@example.com' }, ip: '9.9.9.9' });
  assert.equal(r.status, 429);
  const keys = env.DB.raw.prepare('SELECT key FROM rate_limits').all().map((x) => x.key).join(' ');
  assert.ok(!keys.includes('9.9.9.9') && !keys.includes('example.com'), 'no clear IP/email in rate limit keys');
});

test('dev mode without RESEND_API_KEY returns/logs the code', async () => {
  const env = makeEnv({ RESEND_API_KEY: '', APP_ORIGIN: 'http://localhost:8788' });
  const r = await call(env, 'POST', '/api/auth/signup', { body: { email: 'dev@example.com', password: PW }, origin: 'http://localhost:8788' });
  assert.equal(r.status, 200); assert.match(r.data.devCode, /^\d{6}$/);
  const prod = makeEnv({ RESEND_API_KEY: '' });
  const r2 = await call(prod, 'POST', '/api/auth/signup', { body: { email: 'dev@example.com', password: PW } });
  assert.equal(r2.status, 500); assert.equal(r2.data.error, 'email_not_configured');
});

test('CSRF: JSON content type and Origin required on state-changing requests', async () => {
  const env = makeEnv();
  const b = { email: 'f@example.com', password: PW };
  let r = await call(env, 'POST', '/api/auth/signup', { body: b, ct: 'text/plain' });
  assert.equal(r.status, 415); assert.equal(r.data.error, 'json_required');
  r = await call(env, 'POST', '/api/auth/signup', { body: b, origin: 'https://evil.example' });
  assert.equal(r.status, 403); assert.equal(r.data.error, 'bad_origin');
  r = await call(env, 'POST', '/api/auth/login', { body: b, origin: null });
  assert.equal(r.status, 403);
  r = await call(env, 'POST', '/api/auth/forgot', { body: b, origin: 'http://localhost:8788' });
  assert.equal(r.status, 403, 'localhost refused outside dev');
});

test('v2 code-only sign-in endpoints are gone', async () => {
  const env = makeEnv();
  let r = await call(env, 'POST', '/api/auth/send-code', { body: { email: 'old@example.com' } });
  assert.equal(r.status, 410); assert.equal(r.data.error, 'gone');
  r = await call(env, 'POST', '/api/auth/verify', { body: { email: 'old@example.com', code: '123456' } });
  assert.equal(r.status, 410);
  assert.equal(mailCount('old@example.com'), 0);
});

test('sign in: new browser -> code by email -> trusted 90 days; trusted browser skips the code', async () => {
  const env = makeEnv();
  const a = await login(env, 'dev1@example.com');
  // another browser: right password, but a code is needed; no session yet
  let r = await call(env, 'POST', '/api/auth/login', { body: { email: 'dev1@example.com', password: PW } });
  assert.equal(r.status, 200); assert.equal(r.data.needCode, true); assert.equal(r.data.user, undefined);
  assert.equal(r.setCookies.length, 0, 'no session before the code');
  assert.match(lastMail('dev1@example.com').body.text, /nouvel appareil/);
  const code = lastCode('dev1@example.com');
  const bad = code === '000000' ? '111111' : '000000';
  r = await call(env, 'POST', '/api/auth/login/verify', { body: { email: 'dev1@example.com', code: bad } });
  assert.equal(r.data.error, 'invalid_code');
  r = await call(env, 'POST', '/api/auth/login/verify', { body: { email: 'dev1@example.com', code } });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  assert.deepEqual(r.data.session, { method: 'password+code', recentCode: false });
  const dev2 = r.jar('stalak_d');
  assert.ok(dev2 && r.jar('stalak_s'));
  // that browser now signs in straight away
  r = await call(env, 'POST', '/api/auth/login', { body: { email: 'dev1@example.com', password: PW }, cookie: dev2 });
  assert.equal(r.status, 200); assert.equal(r.data.user.email, 'dev1@example.com'); assert.deepEqual(r.data.session, { method: 'password', recentCode: false });
  assert.ok(r.jar('stalak_s'));
  // so does the browser used to sign up
  r = await call(env, 'POST', '/api/auth/login', { body: { email: 'dev1@example.com', password: PW }, cookie: a.device });
  assert.equal(r.data.user.email, 'dev1@example.com');
  // wrong password on a trusted browser: still refused, same message
  r = await call(env, 'POST', '/api/auth/login', { body: { email: 'dev1@example.com', password: 'pas-le-bon-mdp' }, cookie: dev2 });
  assert.equal(r.status, 401); assert.equal(r.data.error, 'invalid_login');
  // a browser trusted for someone else is not trusted for this account
  const b = await login(env, 'dev2@example.com');
  r = await call(env, 'POST', '/api/auth/login', { body: { email: 'dev1@example.com', password: PW }, cookie: b.device });
  assert.equal(r.data.needCode, true);
  // one browser, two accounts: typing the code keeps the same browser token
  ageCodes(env);
  r = await call(env, 'POST', '/api/auth/login', { body: { email: 'dev1@example.com', password: PW }, cookie: b.device });
  r = await call(env, 'POST', '/api/auth/login/verify', { body: { email: 'dev1@example.com', code: lastCode('dev1@example.com') }, cookie: b.device });
  assert.equal(r.jar('stalak_d'), b.device);
  assert.ok((await call(env, 'POST', '/api/auth/login', { body: { email: 'dev2@example.com', password: PW }, cookie: b.device })).data.user);
  assert.ok((await call(env, 'POST', '/api/auth/login', { body: { email: 'dev1@example.com', password: PW }, cookie: b.device })).data.user);
  // after 90 days the browser asks for a code again
  env.DB.raw.exec('UPDATE trusted_devices SET expires_at = 1');
  r = await call(env, 'POST', '/api/auth/login', { body: { email: 'dev1@example.com', password: PW }, cookie: dev2 });
  assert.equal(r.data.needCode, true);
  // a forged / unknown device cookie does nothing
  r = await call(env, 'POST', '/api/auth/login', { body: { email: 'dev2@example.com', password: PW }, cookie: 'stalak_d=' + 'A'.repeat(43) });
  assert.equal(r.data.needCode, true);
});

test('forgot password: same answer for unknown emails; code checked first, then the new password; signed in, others signed out', async () => {
  const env = makeEnv();
  const a = await login(env, 'fp@example.com');
  const other = await signIn(env, 'fp@example.com');   // a second browser, trusted too
  let r = await call(env, 'POST', '/api/auth/forgot', { body: { email: 'nobody@example.com' } });
  const unknown = r.data;
  r = await call(env, 'POST', '/api/auth/forgot', { body: { email: 'fp@example.com', lang: 'en' } });
  assert.equal(r.status, 200);
  assert.deepEqual(Object.keys(r.data).sort(), Object.keys(unknown).sort(), 'no hint whether the account exists');
  assert.deepEqual(r.data, unknown);
  assert.equal(mailCount('nobody@example.com'), 0);
  assert.match(lastMail('fp@example.com').body.text, /new Stalak password/);
  const code = lastCode('fp@example.com');
  const bad = code === '000000' ? '111111' : '000000';
  r = await call(env, 'POST', '/api/auth/reset', { body: { email: 'fp@example.com', code: bad } });
  assert.equal(r.data.error, 'invalid_code'); assert.equal(r.data.attemptsLeft, 4);
  r = await call(env, 'POST', '/api/auth/reset', { body: { email: 'fp@example.com', code } });
  assert.deepEqual(r.data, { ok: true, codeOk: true }); assert.equal(r.setCookies.length, 0);
  r = await call(env, 'POST', '/api/auth/reset', { body: { email: 'fp@example.com', code, password: '12345678' } });
  assert.equal(r.data.error, 'password_too_common', 'code kept when the new password is refused');
  r = await call(env, 'POST', '/api/auth/reset', { body: { email: 'fp@example.com', code, password: 'nouveau-flocon-7' } });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  assert.deepEqual(r.data.session, { method: 'reset', recentCode: true });
  const device = r.jar('stalak_d');
  assert.ok(r.jar('stalak_s') && device);
  r = await call(env, 'POST', '/api/auth/reset', { body: { email: 'fp@example.com', code, password: 'nouveau-flocon-8' } });
  assert.equal(r.data.error, 'code_expired', 'code used');
  assert.equal((await call(env, 'GET', '/api/me', { cookie: a.cookie })).data.user, null, 'old sessions signed out');
  assert.equal((await call(env, 'GET', '/api/me', { cookie: other.cookie })).data.user, null);
  assert.equal((await call(env, 'POST', '/api/auth/login', { body: { email: 'fp@example.com', password: PW }, cookie: device })).status, 401, 'old password refused');
  r = await call(env, 'POST', '/api/auth/login', { body: { email: 'fp@example.com', password: 'nouveau-flocon-7' }, cookie: device });
  assert.ok(r.data.user, 'this browser is trusted');
  r = await call(env, 'POST', '/api/auth/login', { body: { email: 'fp@example.com', password: 'nouveau-flocon-7' }, cookie: other.device });
  assert.equal(r.data.needCode, true, 'the other browsers must type a code again');
});

test('accounts made with a code only (v2): sign-in refused like a wrong password, then "forgot password" creates one', async () => {
  const env = makeEnv();
  const old = await legacyUser(env, 'legacy@example.com');
  assert.equal((await call(env, 'GET', '/api/me', { cookie: old.cookie })).data.user.email, 'legacy@example.com', 'v2 sessions keep working');
  let r = await call(env, 'POST', '/api/auth/login', { body: { email: 'legacy@example.com', password: 'nimporte-quoi' } });
  const unknown = await call(env, 'POST', '/api/auth/login', { body: { email: 'ghost2@example.com', password: 'nimporte-quoi' } });
  assert.equal(r.status, 401); assert.deepEqual(r.data, unknown.data);
  r = await call(env, 'POST', '/api/auth/signup', { body: { email: 'legacy@example.com', password: PW } });
  assert.equal(r.data.error, 'email_taken');
  await call(env, 'POST', '/api/auth/forgot', { body: { email: 'legacy@example.com' } });
  r = await call(env, 'POST', '/api/auth/reset', { body: { email: 'legacy@example.com', code: lastCode('legacy@example.com'), password: 'mon-premier-mdp' } });
  assert.equal(r.status, 200);
  assert.equal(r.data.user.id, old.id); assert.equal(r.data.user.hasPassword, true);
  r = await call(env, 'POST', '/api/auth/login', { body: { email: 'legacy@example.com', password: 'mon-premier-mdp' }, cookie: r.jar('stalak_d') });
  assert.equal(r.data.user.id, old.id);
});

test('account delete: removes devices, identities and pending codes too', async () => {
  const env = makeEnv();
  const a = await login(env, 'gone3@example.com');
  env.DB.raw.prepare("INSERT INTO identities (provider, subject, user_id, email, created_at) VALUES ('google', 's1', ?, 'gone3@example.com', 1)").run(a.user.id);
  await call(env, 'POST', '/api/auth/forgot', { body: { email: 'gone3@example.com' } });
  const r = await call(env, 'DELETE', '/api/account', { cookie: a.cookie, body: { confirm: true } });
  assert.equal(r.status, 200);
  for (const t of ['users', 'sessions', 'trusted_devices', 'identities', 'auth_codes']) assert.equal(env.DB.raw.prepare(`SELECT COUNT(*) AS n FROM ${t}`).get().n, 0, t);
});

test('webhook signature: valid, wrong secret, tampered body, stale, missing', async () => {
  const env = makeEnv();
  const ev = subEvent('subscription.created', sub('u_nobody'));
  assert.equal((await webhook(env, ev)).status, 200);
  let r = await webhook(env, subEvent('subscription.updated', sub('u_x')), { secret: 'wrong' });
  assert.equal(r.status, 401); assert.equal(r.data.error, 'invalid_signature');
  r = await webhook(env, subEvent('subscription.updated', sub('u_x')), { tamper: true });
  assert.equal(r.status, 401);
  r = await webhook(env, subEvent('subscription.updated', sub('u_x')), { ts: Math.floor(Date.now() / 1000) - 301 });
  assert.equal(r.status, 401); assert.match(r.data.message, /stale/);
  r = await call(env, 'POST', '/api/paddle/webhook', { raw: '{}', origin: null });
  assert.equal(r.status, 401);
  // multiple h1 (secret rotation) accepted if one matches
  const raw = '{"a":1}', ts = 1700000000;
  const good = await hmacSha256Hex('s', `${ts}:${raw}`);
  assert.deepEqual(await verifySignature('s', `ts=${ts};h1=${'0'.repeat(64)};h1=${good}`, raw, ts + 10), { ok: true });
  assert.equal((await verifySignature('s', `ts=${ts};h1=${good}`, raw, ts + 301)).reason, 'stale');
});

test('subscription → Pro; duplicate and out-of-order events; portal link', async () => {
  const env = makeEnv();
  const { cookie, user } = await login(env, 'pro@example.com');
  const created = subEvent('subscription.created', sub(user.id), new Date(Date.now() - 5000).toISOString());
  assert.equal((await webhook(env, created)).status, 200);
  await webhook(env, subEvent('transaction.completed', { id: 'txn_1', customer_id: 'ctm_01', subscription_id: 'sub_01', custom_data: { user_id: user.id } }));
  let r = await call(env, 'GET', '/api/me', { cookie });
  assert.deepEqual(r.data.entitlements, PRO_ENT);
  assert.equal(r.data.subscription.status, 'active');
  assert.equal(r.data.subscription.interval, 'month');
  const dup = await webhook(env, created);
  assert.equal(dup.data.duplicate, true);
  // an older "past" event must not override the newer state
  const old = await webhook(env, subEvent('subscription.updated', sub(user.id, { status: 'paused' }), new Date(Date.now() - 60000).toISOString()));
  assert.equal(old.data.applied, false);
  r = await call(env, 'GET', '/api/me', { cookie });
  assert.equal(r.data.entitlements.plan, 'pro');
  // past_due keeps Pro during Paddle's payment retries
  await webhook(env, subEvent('subscription.past_due', sub(user.id, { status: 'past_due' })));
  r = await call(env, 'GET', '/api/me', { cookie });
  assert.equal(r.data.entitlements.plan, 'pro'); assert.equal(r.data.subscription.status, 'past_due');
  await webhook(env, subEvent('subscription.activated', sub(user.id, { status: 'active', items: [{ status: 'active', price: { id: 'pri_year' } }] })));
  r = await call(env, 'GET', '/api/me', { cookie });
  assert.equal(r.data.subscription.interval, 'year');
  // customer portal
  r = await call(env, 'POST', '/api/paddle/portal', { cookie });
  assert.equal(r.status, 200);
  assert.equal(r.data.url, 'https://portal.example/overview');
  assert.equal(r.data.cancelUrl, 'https://portal.example/cancel/sub_01');
  const p = outbound.at(-1);
  assert.equal(p.url, 'https://sandbox-api.paddle.com/customers/ctm_01/portal-sessions');
  assert.equal(p.headers.Authorization, 'Bearer pdl_sdbx_apikey_test');
  assert.deepEqual(p.body, { subscription_ids: ['sub_01'] });
});

test('scheduled cancel keeps Pro until period end, canceled → Free', async () => {
  const env = makeEnv();
  const { cookie, user } = await login(env, 'cancel@example.com');
  await webhook(env, subEvent('subscription.created', sub(user.id)));
  const end = new Date(Date.now() + 10 * 864e5).toISOString();
  await webhook(env, subEvent('subscription.updated', sub(user.id, { scheduled_change: { action: 'cancel', effective_at: end, resume_at: null },
    current_billing_period: { starts_at: new Date().toISOString(), ends_at: end } })));
  let r = await call(env, 'GET', '/api/me', { cookie });
  assert.equal(r.data.entitlements.plan, 'pro');
  assert.equal(r.data.subscription.cancelAt, end);
  await webhook(env, subEvent('subscription.canceled', sub(user.id, { status: 'canceled', current_billing_period: null, canceled_at: end })));
  r = await call(env, 'GET', '/api/me', { cookie });
  assert.equal(r.data.entitlements.plan, 'free');
  assert.equal(r.data.entitlements.outro, true);
  // safety net: "active" but period ended > 3 days ago (missed webhooks) → Free
  await webhook(env, subEvent('subscription.updated', sub(user.id, { id: 'sub_02', current_billing_period: { starts_at: '2020-01-01T00:00:00Z', ends_at: '2020-02-01T00:00:00Z' } })));
  r = await call(env, 'GET', '/api/me', { cookie });
  assert.equal(r.data.entitlements.plan, 'free');
});

test('subscription linked by customer id when custom_data is missing', async () => {
  const env = makeEnv();
  const { cookie, user } = await login(env, 'link@example.com');
  await webhook(env, subEvent('transaction.completed', { id: 'txn_9', customer_id: 'ctm_77', custom_data: { user_id: user.id } }));
  await webhook(env, subEvent('subscription.created', sub(null, { id: 'sub_77', customer_id: 'ctm_77', custom_data: null })));
  const r = await call(env, 'GET', '/api/me', { cookie });
  assert.equal(r.data.entitlements.plan, 'pro');
});

test('project saving is Pro only; list/get/delete', async () => {
  const env = makeEnv();
  const free = await login(env, 'free@example.com');
  let r = await call(env, 'PUT', '/api/projects/p1', { cookie: free.cookie, body: { name: 'x', state: { a: 1 } } });
  assert.equal(r.status, 403); assert.equal(r.data.error, 'pro_required');
  r = await call(env, 'GET', '/api/projects');
  assert.equal(r.status, 401); assert.equal(r.data.error, 'not_logged_in');

  const pro = await login(env, 'saver@example.com');
  await webhook(env, subEvent('subscription.created', sub(pro.user.id, { id: 'sub_s', customer_id: 'ctm_s' })));
  r = await call(env, 'PUT', '/api/projects/p1', { cookie: pro.cookie, body: { name: 'Mon clip', state: { bpm: 120, cuts: [1, 2, 3] } } });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  r = await call(env, 'PUT', '/api/projects/p1', { cookie: pro.cookie, body: { name: 'Mon clip v2', state: { bpm: 128 } } });
  assert.equal(r.status, 200);
  r = await call(env, 'GET', '/api/projects', { cookie: pro.cookie });
  assert.equal(r.data.projects.length, 1); assert.equal(r.data.projects[0].name, 'Mon clip v2');
  r = await call(env, 'GET', '/api/projects/p1', { cookie: pro.cookie });
  assert.deepEqual(r.data.state, { bpm: 128 });
  r = await call(env, 'GET', '/api/projects/p1', { cookie: free.cookie });
  assert.equal(r.status, 404, 'other users cannot read it');
  r = await call(env, 'PUT', '/api/projects/big', { cookie: pro.cookie, body: { name: 'big', state: 'x'.repeat(300 * 1024) } });
  assert.equal(r.status, 413);
  r = await call(env, 'PUT', '/api/projects/bad%20id', { cookie: pro.cookie, body: { state: {} } });
  assert.equal(r.data.error, 'invalid_id');
  r = await call(env, 'DELETE', '/api/projects/p1', { cookie: pro.cookie });
  assert.equal(r.status, 200);
  r = await call(env, 'GET', '/api/projects', { cookie: pro.cookie });
  assert.equal(r.data.projects.length, 0);
});

test('account delete: cancels Paddle subscription, removes all data, clears cookie', async () => {
  const env = makeEnv();
  const { cookie, user } = await login(env, 'bye@example.com');
  await webhook(env, subEvent('subscription.created', sub(user.id, { id: 'sub_bye', customer_id: 'ctm_bye' })));
  await call(env, 'PUT', '/api/projects/p1', { cookie, body: { name: 'x', state: {} } });
  let r = await call(env, 'DELETE', '/api/account', { cookie, body: {} });
  assert.equal(r.status, 400); assert.equal(r.data.error, 'confirm_required');
  r = await call(env, 'DELETE', '/api/account', { cookie, body: { confirm: true } });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  assert.match(r.headers.get('Set-Cookie'), /Max-Age=0/);
  const cancel = outbound.find((o) => o.url.endsWith('/subscriptions/sub_bye/cancel'));
  assert.deepEqual(cancel.body, { effective_from: 'immediately' });
  for (const t of ['users', 'sessions', 'projects', 'subscriptions']) {
    assert.equal(env.DB.raw.prepare(`SELECT COUNT(*) AS n FROM ${t}`).get().n, 0, t);
  }
  r = await call(env, 'GET', '/api/me', { cookie });
  assert.equal(r.data.user, null);
});

test('social connect stubs are disabled by default', async () => {
  let r = await call(makeEnv(), 'GET', '/api/connect/tiktok/start');
  assert.equal(r.status, 404); assert.equal(r.data.error, 'not_enabled');
  const env = makeEnv({ SOCIAL_CONNECT_ENABLED: '1' });
  const { cookie } = await login(env, 'social@example.com');
  r = await call(env, 'GET', '/api/connect/instagram/callback', { cookie });
  assert.equal(r.status, 501); assert.equal(r.data.error, 'not_implemented');
});

test('unknown route and wrong method give JSON errors', async () => {
  const env = makeEnv();
  let r = await call(env, 'GET', '/api/nope');
  assert.equal(r.status, 404); assert.equal(r.data.error, 'not_found'); assert.ok(r.data.message);
  r = await call(env, 'GET', '/api/auth/verify');
  assert.equal(r.status, 405); assert.equal(r.data.error, 'method_not_allowed');
});

// ---- profile, photo, password (migration 0002) -------------------------------------------
async function putAvatar(env, cookie, bytes, type, extra = {}) {
  return call(env, 'PUT', '/api/me/avatar', { cookie, ct: type, raw: bytes, ...extra });
}
const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, ...new Array(60).fill(7), 0xff, 0xd9]);
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, ...new Array(40).fill(1)]);
const WEBP = new Uint8Array([...Buffer.from('RIFF'), 40, 0, 0, 0, ...Buffer.from('WEBPVP8 '), ...new Array(40).fill(2)]);

test('/api/me exposes profile fields and session info', async () => {
  const env = makeEnv();
  const { cookie, data } = await login(env, 'me2@example.com');
  assert.equal(data.user.displayName, null);
  assert.equal(data.user.avatarUrl, null);
  assert.equal(data.user.hasPassword, true);
  assert.deepEqual(data.session, { method: 'signup', recentCode: false });
  const r = await call(env, 'GET', '/api/me', { cookie });
  assert.deepEqual(r.data.session, { method: 'signup', recentCode: false });
  assert.equal((await call(env, 'GET', '/api/me')).data.session, null);
});

test('display name: 2-30 characters, trimmed, cleared with null', async () => {
  const env = makeEnv();
  const { cookie } = await login(env, 'name@example.com');
  let r = await call(env, 'PATCH', '/api/me', { cookie, body: { displayName: '  Alaska​   la   Star \n' } });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  assert.equal(r.data.user.displayName, 'Alaska la Star');
  r = await call(env, 'PATCH', '/api/me', { cookie, body: { displayName: 'A' } });
  assert.equal(r.status, 400); assert.equal(r.data.error, 'invalid_name');
  r = await call(env, 'PATCH', '/api/me', { cookie, body: { displayName: 'x'.repeat(31) } });
  assert.equal(r.data.error, 'invalid_name');
  r = await call(env, 'PATCH', '/api/me', { cookie, body: { displayName: '😀'.repeat(30) } });
  assert.equal(r.status, 200, 'counted in characters, not UTF-16 units');
  r = await call(env, 'PATCH', '/api/me', { cookie, body: { displayName: 42 } });
  assert.equal(r.data.error, 'invalid_name');
  r = await call(env, 'PATCH', '/api/me', { cookie, body: {} });
  assert.equal(r.data.error, 'nothing_to_update');
  r = await call(env, 'PATCH', '/api/me', { cookie, body: { displayName: null } });
  assert.equal(r.data.user.displayName, null);
  r = await call(env, 'PATCH', '/api/me', { body: { displayName: 'Bob' } });
  assert.equal(r.status, 401);
  r = await call(env, 'PATCH', '/api/me', { cookie, body: { displayName: 'Bob' }, origin: 'https://evil.example' });
  assert.equal(r.status, 403);
});

test('photo: upload JPEG/PNG/WebP, magic bytes and size checked, private GET with cache headers, delete', async () => {
  const env = makeEnv();
  const a = await login(env, 'pic@example.com');
  const b = await login(env, 'other@example.com');
  let r = await putAvatar(env, a.cookie, JPEG, 'image/jpeg');
  assert.equal(r.status, 200, JSON.stringify(r.data));
  assert.match(r.data.avatarUrl, /^\/api\/me\/avatar\?v=\d+$/);
  r = await call(env, 'GET', '/api/me', { cookie: a.cookie });
  const url = r.data.user.avatarUrl;
  assert.match(url, /^\/api\/me\/avatar\?v=\d+$/);
  r = await call(env, 'GET', url, { cookie: a.cookie });
  assert.equal(r.status, 200);
  assert.equal(r.headers.get('Content-Type'), 'image/jpeg');
  assert.match(r.headers.get('Cache-Control'), /^private, max-age=\d+, immutable$/);
  assert.equal(r.headers.get('X-Content-Type-Options'), 'nosniff');
  // other users and anonymous visitors get nothing
  assert.equal((await call(env, 'GET', url, { cookie: b.cookie })).status, 404);
  assert.equal((await call(env, 'GET', url)).status, 401);
  assert.equal((await putAvatar(env, a.cookie, PNG, 'image/png')).status, 200);
  assert.equal((await putAvatar(env, a.cookie, WEBP, 'image/webp')).status, 200);
  // declared type must match the bytes
  r = await putAvatar(env, a.cookie, PNG, 'image/jpeg');
  assert.equal(r.status, 415); assert.equal(r.data.error, 'invalid_image');
  r = await putAvatar(env, a.cookie, new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"></svg>'), 'image/svg+xml');
  assert.equal(r.status, 415, 'svg refused (by the CSRF type check)');
  r = await putAvatar(env, a.cookie, new TextEncoder().encode('GIF89a..........'), 'image/png');
  assert.equal(r.status, 415);
  const big = new Uint8Array(81 * 1024); big.set(JPEG.subarray(0, 4));
  r = await putAvatar(env, a.cookie, big, 'image/jpeg');
  assert.equal(r.status, 413);
  r = await putAvatar(env, a.cookie, JPEG, 'image/jpeg', { origin: 'https://evil.example' });
  assert.equal(r.status, 403);
  r = await putAvatar(env, null, JPEG, 'image/jpeg');
  assert.equal(r.status, 401);
  r = await call(env, 'DELETE', '/api/me/avatar', { cookie: a.cookie, body: {} });
  assert.equal(r.status, 200);
  r = await call(env, 'GET', '/api/me', { cookie: a.cookie });
  assert.equal(r.data.user.avatarUrl, null);
  assert.equal((await call(env, 'GET', url, { cookie: a.cookie })).status, 404);
});

test('password: set on an account without one (policy), PBKDF2 stored, login, generic error', async () => {
  const env = makeEnv();
  const { cookie, id } = await legacyUser(env, 'pw@example.com');
  for (const [pw, code] of [['short', 'password_too_short'], ['password', 'password_too_common'], ['AZERTYUIOP', 'password_too_common'],
    ['pw@example.com', 'password_too_common'], ['x'.repeat(201), 'password_too_long']]) {
    const r = await call(env, 'POST', '/api/auth/password', { cookie, body: { password: pw } });
    assert.equal(r.status, 400, pw); assert.equal(r.data.error, code, pw);
  }
  assert.equal((await call(env, 'POST', '/api/auth/password', { body: { password: 'neige-et-glace' } })).status, 401);
  let r = await call(env, 'POST', '/api/auth/password', { cookie, body: { password: 'neige-et-glace' } });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  assert.equal(r.data.user.hasPassword, true);
  const row = env.DB.raw.prepare('SELECT password_hash, password_salt, password_iter FROM users WHERE id = ?').get(id);
  assert.equal(row.password_iter, 100000);
  assert.match(row.password_salt, /^[0-9a-f]{32}$/);
  assert.match(row.password_hash, /^[0-9a-f]{64}$/);
  assert.ok(!row.password_hash.includes('neige'));

  const s = await signIn(env, ' PW@example.com ', 'neige-et-glace');
  assert.match(s.cookie, /^stalak_s=[A-Za-z0-9_-]{43}$/);
  assert.equal(s.data.user.email, 'pw@example.com');
  assert.equal((await call(env, 'GET', '/api/me', { cookie: s.cookie })).data.user.id, id);

  // wrong password, unknown email and account without password: same answer
  const wrong = await call(env, 'POST', '/api/auth/login', { body: { email: 'pw@example.com', password: 'pas-le-bon' } });
  const unknown = await call(env, 'POST', '/api/auth/login', { body: { email: 'nobody@example.com', password: 'pas-le-bon' } });
  await legacyUser(env, 'nopw@example.com');
  const nopw = await call(env, 'POST', '/api/auth/login', { body: { email: 'nopw@example.com', password: 'pas-le-bon' } });
  for (const x of [wrong, unknown, nopw]) { assert.equal(x.status, 401); assert.deepEqual(x.data, { error: 'invalid_login', message: 'Wrong email or password.' }); }
  r = await call(env, 'POST', '/api/auth/login', { body: { email: 'pw@example.com', password: 'neige-et-glace' }, origin: 'https://evil.example' });
  assert.equal(r.status, 403, 'CSRF check on login');
});

test('password login: lock after 5 failures for 15 min (also for unknown emails), rate limits per IP and per email', async () => {
  const env = makeEnv();
  const { device } = await login(env, 'lock@example.com', 'fr', 'banquise-2026');
  for (let i = 1; i <= 4; i++) {
    const r = await call(env, 'POST', '/api/auth/login', { body: { email: 'lock@example.com', password: 'nope-nope-' + i }, cookie: device });
    assert.equal(r.status, 401);
  }
  let r = await call(env, 'POST', '/api/auth/login', { body: { email: 'lock@example.com', password: 'nope-nope-5' }, cookie: device });
  assert.equal(r.status, 429); assert.equal(r.data.error, 'too_many_attempts'); assert.ok(r.data.retryAfter > 800);
  r = await call(env, 'POST', '/api/auth/login', { body: { email: 'lock@example.com', password: 'banquise-2026' }, cookie: device });
  assert.equal(r.status, 429, 'locked even with the right password');
  for (let i = 1; i <= 5; i++) r = await call(env, 'POST', '/api/auth/login', { body: { email: 'ghost@example.com', password: 'nope-nope-' + i } });
  assert.equal(r.status, 429, 'unknown emails lock the same way (no account enumeration)');
  // lock expires
  env.DB.raw.exec(`UPDATE rate_limits SET window_start = window_start - ${16 * 60e3} WHERE key LIKE 'pwfail:%'`);
  env.DB.raw.exec("DELETE FROM rate_limits WHERE key LIKE 'login:email:%'");
  r = await call(env, 'POST', '/api/auth/login', { body: { email: 'lock@example.com', password: 'banquise-2026' }, cookie: device });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  assert.equal(env.DB.raw.prepare("SELECT COUNT(*) AS n FROM rate_limits WHERE key LIKE 'pwfail:%' AND count >= 5").get().n, 1, 'success clears the failures');
  // per email: 10 attempts / 10 min
  env.DB.raw.exec('DELETE FROM rate_limits');
  for (let i = 0; i < 10; i++) {
    r = await call(env, 'POST', '/api/auth/login', { body: { email: 'lock@example.com', password: 'banquise-2026' }, cookie: device });
    assert.equal(r.status, 200);
  }
  r = await call(env, 'POST', '/api/auth/login', { body: { email: 'lock@example.com', password: 'banquise-2026' }, cookie: device });
  assert.equal(r.status, 429); assert.equal(r.data.error, 'rate_limited');
  // per IP: 30 attempts / 10 min
  env.DB.raw.exec('DELETE FROM rate_limits');
  for (let i = 0; i < 30; i++) {
    r = await call(env, 'POST', '/api/auth/login', { body: { email: `ip${i}@example.com`, password: 'whatever-1' }, ip: '7.7.7.7' });
    assert.equal(r.status, 401);
  }
  r = await call(env, 'POST', '/api/auth/login', { body: { email: 'ip99@example.com', password: 'whatever-1' }, ip: '7.7.7.7' });
  assert.equal(r.status, 429); assert.equal(r.data.error, 'rate_limited');
  const keys = env.DB.raw.prepare('SELECT key FROM rate_limits').all().map((x) => x.key).join(' ');
  assert.ok(!keys.includes('7.7.7.7') && !keys.includes('example.com'), 'no clear IP/email in keys');
});

test('password change: needs the current one (except a fresh reset session); other sessions and browsers signed out', async () => {
  const env = makeEnv();
  const a = await login(env, 'chg@example.com', 'fr', 'premier-mdp-1');
  let r = await call(env, 'POST', '/api/auth/password', { cookie: a.cookie, body: { password: 'deuxieme-mdp-2' } });
  assert.equal(r.status, 403); assert.equal(r.data.error, 'reauth_required');
  r = await call(env, 'POST', '/api/auth/password', { cookie: a.cookie, body: { password: 'deuxieme-mdp-2', currentPassword: 'faux-faux-faux' } });
  assert.equal(r.status, 400); assert.equal(r.data.error, 'wrong_password');
  const b = await signIn(env, 'chg@example.com', 'premier-mdp-1');   // another browser
  // the browser sends its device cookie too (Path=/api/auth): it stays trusted
  r = await call(env, 'POST', '/api/auth/password', { cookie: cookies(a.cookie, a.device), body: { password: 'deuxieme-mdp-2', currentPassword: 'premier-mdp-1' } });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  assert.equal((await call(env, 'GET', '/api/me', { cookie: a.cookie })).data.user.email, 'chg@example.com', 'this session stays');
  assert.equal((await call(env, 'GET', '/api/me', { cookie: b.cookie })).data.user, null, 'the other sessions are signed out');
  r = await call(env, 'POST', '/api/auth/login', { body: { email: 'chg@example.com', password: 'deuxieme-mdp-2' }, cookie: b.device });
  assert.equal(r.data.needCode, true, 'the other browser must type a code again');
  r = await call(env, 'POST', '/api/auth/login', { body: { email: 'chg@example.com', password: 'deuxieme-mdp-2' }, cookie: a.device });
  assert.ok(r.data.user, 'this browser stays trusted');
  assert.equal((await call(env, 'POST', '/api/auth/login', { body: { email: 'chg@example.com', password: 'premier-mdp-1' }, cookie: a.device })).status, 401, 'old password no longer works');
  // a reset session (forgot password) younger than 15 min may change it again without the current one
  await call(env, 'POST', '/api/auth/forgot', { body: { email: 'chg@example.com' } });
  r = await call(env, 'POST', '/api/auth/reset', { body: { email: 'chg@example.com', code: lastCode('chg@example.com'), password: 'troisieme-mdp-3' } });
  const rs = r.jar('stalak_s');
  r = await call(env, 'POST', '/api/auth/password', { cookie: rs, body: { password: 'quatrieme-mdp-4' } });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  env.DB.raw.exec(`UPDATE sessions SET created_at = created_at - ${16 * 60e3} WHERE method = 'reset'`);
  r = await call(env, 'POST', '/api/auth/password', { cookie: rs, body: { password: 'cinquieme-mdp-5' } });
  assert.equal(r.data.error, 'reauth_required');
  assert.equal((await call(env, 'GET', '/api/me', { cookie: rs })).data.session.recentCode, false);
  // wrong current passwords count toward the lock
  for (let i = 0; i < 5; i++) r = await call(env, 'POST', '/api/auth/password', { cookie: rs, body: { password: 'cinquieme-mdp-5', currentPassword: 'faux-' + i + '-faux' } });
  r = await call(env, 'POST', '/api/auth/password', { cookie: rs, body: { password: 'cinquieme-mdp-5', currentPassword: 'quatrieme-mdp-4' } });
  assert.equal(r.status, 429); assert.equal(r.data.error, 'too_many_attempts');
});

test('account delete also erases name, photo and password', async () => {
  const env = makeEnv();
  const { cookie } = await login(env, 'gone@example.com', 'fr', 'adieu-la-neige');
  await call(env, 'PATCH', '/api/me', { cookie, body: { displayName: 'Gone' } });
  await putAvatar(env, cookie, JPEG, 'image/jpeg');
  await call(env, 'POST', '/api/auth/login', { body: { email: 'gone@example.com', password: 'wrong-wrong' } });
  const r = await call(env, 'DELETE', '/api/account', { cookie, body: { confirm: true } });
  assert.equal(r.status, 200);
  assert.equal(env.DB.raw.prepare('SELECT COUNT(*) AS n FROM users').get().n, 0);
  assert.equal(env.DB.raw.prepare("SELECT COUNT(*) AS n FROM rate_limits WHERE key LIKE 'pwfail:%'").get().n, 0);
  const login2 = await call(env, 'POST', '/api/auth/login', { body: { email: 'gone@example.com', password: 'adieu-la-neige' } });
  assert.equal(login2.status, 401);
});

// ---- Google / Apple / Microsoft (OpenID Connect) ---------------------------------------------
// Starts a sign-in like the browser does, then plays the provider: returns what the callback needs.
async function oauthBegin(env, provider, query = 'return=/en/&to=pro') {
  const r = await call(env, 'GET', `/api/auth/oauth/${provider}/start?${query}`);
  assert.equal(r.status, 302, JSON.stringify(r.data));
  const loc = new URL(r.headers.get('Location'));
  return { loc, q: loc.searchParams, binding: r.jar('stalak_o'), setCookie: r.setCookies[0] };
}
function claimsFor(provider, b, over = {}) {
  const now = Math.floor(Date.now() / 1000), nonce = b.q.get('nonce');
  const base = {
    google: { iss: 'https://accounts.google.com', aud: OAUTH_ENV.GOOGLE_CLIENT_ID, sub: '1100220033', email: 'neige@gmail.com', email_verified: true, name: 'Neige Blanche' },
    microsoft: { iss: 'https://login.microsoftonline.com/9188040d-6c67-4c5b-b112-36a304b66dad/v2.0', tid: '9188040d-6c67-4c5b-b112-36a304b66dad',
      aud: OAUTH_ENV.MICROSOFT_CLIENT_ID, sub: 'AAAAAAAAAAAAAAAAAAAAAMsft', email: 'glacon@outlook.com', name: 'Gla Çon' },
    apple: { iss: 'https://appleid.apple.com', aud: OAUTH_ENV.APPLE_CLIENT_ID, sub: '001234.abcdef.0987', email: 'x7k2@privaterelay.appleid.com',
      email_verified: 'true', is_private_email: 'true' },
  }[provider];
  return { ...base, iat: now, exp: now + 600, nonce, ...over };
}
async function oauthFinish(env, provider, b, { claims, key, header, state, binding, form = {}, error } = {}) {
  nextIdToken = await signJwt(key || KEYS[provider], claims || claimsFor(provider, b), header);
  const params = new URLSearchParams({ code: 'auth-code-123', state: state ?? b.q.get('state'), ...form });
  if (error) { params.delete('code'); params.set('error', error); }
  const cookie = binding === undefined ? b.binding : binding;
  if (provider === 'apple') {
    // form_post: a cross-site POST from appleid.apple.com
    return call(env, 'POST', '/api/auth/oauth/apple/callback', { raw: params.toString(), ct: 'application/x-www-form-urlencoded', origin: 'https://appleid.apple.com', cookie });
  }
  return call(env, 'GET', `/api/auth/oauth/${provider}/callback?${params}`, { cookie });
}
const frag = (r) => { const l = r.headers.get('Location'); assert.ok(l, 'redirect expected, got ' + r.status + ' ' + JSON.stringify(r.data)); return new URL(l); };

test('oauth start: redirect with state, nonce, PKCE S256; binding cookie; disabled provider; bad return path', async () => {
  const env = makeEnv(OAUTH_ENV);
  let b = await oauthBegin(env, 'google');
  assert.equal(b.loc.origin + b.loc.pathname, 'https://accounts.google.com/o/oauth2/v2/auth');
  assert.equal(b.q.get('client_id'), OAUTH_ENV.GOOGLE_CLIENT_ID);
  assert.equal(b.q.get('redirect_uri'), 'https://stalak.app/api/auth/oauth/google/callback');
  assert.equal(b.q.get('response_type'), 'code');
  assert.equal(b.q.get('scope'), 'openid email profile');
  assert.equal(b.q.get('code_challenge_method'), 'S256');
  assert.match(b.q.get('code_challenge'), /^[A-Za-z0-9_-]{43}$/);
  assert.ok(b.q.get('state').length >= 40 && b.q.get('nonce').length >= 30);
  for (const f of ['HttpOnly', 'Secure', 'SameSite=None', 'Path=/api/auth/oauth', 'Max-Age=600']) assert.ok(b.setCookie.includes(f), f);
  const row = env.DB.raw.prepare('SELECT * FROM oauth_states').get();
  assert.notEqual(row.state_hash, b.q.get('state'), 'state stored hashed');
  assert.equal(row.return_to, '/en/#pro'); assert.equal(row.lang, 'en');
  b = await oauthBegin(env, 'microsoft');
  assert.equal(b.loc.origin + b.loc.pathname, 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize');
  b = await oauthBegin(env, 'apple');
  assert.equal(b.loc.origin + b.loc.pathname, 'https://appleid.apple.com/auth/authorize');
  assert.equal(b.q.get('response_mode'), 'form_post'); assert.equal(b.q.get('scope'), 'name email');
  assert.equal(b.q.get('code_challenge'), null, 'Apple takes no PKCE');
  // not configured: back to the app with an error, no redirect to the provider
  let r = await call(makeEnv(), 'GET', '/api/auth/oauth/google/start?return=/en/');
  assert.equal(r.status, 303); assert.equal(r.headers.get('Location'), 'https://stalak.app/en/#auth-err-not_enabled');
  r = await call(env, 'GET', '/api/auth/oauth/facebook/start');
  assert.equal(r.status, 404);
  for (const bad of ['//evil.example/', 'https://evil.example/', '/api/me', '/x?y=1']) {
    b = await oauthBegin(env, 'google', 'return=' + encodeURIComponent(bad));
    assert.equal(env.DB.raw.prepare('SELECT return_to FROM oauth_states ORDER BY created_at DESC, rowid DESC LIMIT 1').get().return_to, '/#account', bad);
  }
});

test('oauth Google: new account (verified email, name), PKCE verifier sent, signed in, back to the page; same sub = same account', async () => {
  const env = makeEnv(OAUTH_ENV); resetJwksCache();
  const b = await oauthBegin(env, 'google');
  let r = await oauthFinish(env, 'google', b);
  assert.equal(r.status, 303);
  assert.equal(r.headers.get('Location'), 'https://stalak.app/en/#auth-ok-pro');
  const tr = tokenRequests.at(-1);
  assert.equal(tr.form.get('grant_type'), 'authorization_code'); assert.equal(tr.form.get('code'), 'auth-code-123');
  assert.equal(tr.form.get('client_secret'), 'g-secret'); assert.equal(tr.form.get('redirect_uri'), 'https://stalak.app/api/auth/oauth/google/callback');
  assert.equal(base64url(new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(tr.form.get('code_verifier'))))), b.q.get('code_challenge'), 'PKCE verifier matches');
  const cookie = r.jar('stalak_s');
  assert.ok(cookie && r.jar('stalak_d'));
  assert.ok(r.setCookies.some((c) => c.startsWith('stalak_o=;') && c.includes('Max-Age=0')), 'binding cookie cleared');
  let me = await call(env, 'GET', '/api/me', { cookie });
  assert.equal(me.data.user.email, 'neige@gmail.com'); assert.equal(me.data.user.displayName, 'Neige Blanche');
  assert.equal(me.data.user.emailVerified, true); assert.equal(me.data.user.hasPassword, false); assert.equal(me.data.user.lang, 'en');
  assert.deepEqual(me.data.user.providers, ['google']); assert.equal(me.data.session.method, 'oauth:google');
  // again: same account, no second identity
  const b2 = await oauthBegin(env, 'google');
  r = await oauthFinish(env, 'google', b2, { claims: claimsFor('google', b2, { name: 'Autre Nom' }) });
  me = await call(env, 'GET', '/api/me', { cookie: r.jar('stalak_s') });
  assert.equal(me.data.user.id, (await call(env, 'GET', '/api/me', { cookie })).data.user.id);
  assert.equal(env.DB.raw.prepare('SELECT COUNT(*) AS n FROM identities').get().n, 1);
  assert.equal(env.DB.raw.prepare('SELECT COUNT(*) AS n FROM users').get().n, 1);
  // the account can then choose a password without a "current" one
  r = await call(env, 'POST', '/api/auth/password', { cookie, body: { password: 'apres-google-1' } });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  // the provider says no (user cancelled)
  const b3 = await oauthBegin(env, 'google');
  r = await oauthFinish(env, 'google', b3, { error: 'access_denied' });
  assert.equal(frag(r).hash, '#auth-err-cancelled'); assert.equal(r.jar('stalak_s'), null);
});

test('oauth popup mode (project open in the app): the callback page tells the app and closes, still signed in', async () => {
  const env = makeEnv(OAUTH_ENV); resetJwksCache();
  const b = await oauthBegin(env, 'google', 'return=/en/&to=pro&popup=1');
  const r = await oauthFinish(env, 'google', b);
  assert.equal(r.status, 200);
  assert.match(r.headers.get('Content-Type'), /text\/html/);
  assert.match(r.headers.get('Content-Security-Policy'), /default-src 'none'/);
  assert.ok(r.jar('stalak_s') && r.jar('stalak_d'));
  assert.ok(r.data.includes('{"stalakAuth":"auth-ok-pro"}') && r.data.includes('BroadcastChannel') && r.data.includes('"https://stalak.app/en/#auth-ok-pro"'));
  const b2 = await oauthBegin(env, 'google', 'return=/&popup=1');
  const r2 = await oauthFinish(env, 'google', b2, { error: 'access_denied' });
  assert.ok(r2.data.includes('auth-err-cancelled')); assert.equal(r2.jar('stalak_s'), null);
});

test('oauth: an existing account with the same verified email gets the identity (linking)', async () => {
  const env = makeEnv(OAUTH_ENV); resetJwksCache();
  const a = await login(env, 'neige@gmail.com');
  const b = await oauthBegin(env, 'google', 'return=/');
  const r = await oauthFinish(env, 'google', b);
  assert.equal(frag(r).hash, '#auth-ok-account');
  const me = await call(env, 'GET', '/api/me', { cookie: r.jar('stalak_s') });
  assert.equal(me.data.user.id, a.user.id); assert.equal(me.data.user.hasPassword, true);
  assert.deepEqual(me.data.user.providers, ['google']);
  // unverified email at Google: refused, never linked
  const env2 = makeEnv(OAUTH_ENV);
  await login(env2, 'neige@gmail.com');
  const b2 = await oauthBegin(env2, 'google');
  const r2 = await oauthFinish(env2, 'google', b2, { claims: claimsFor('google', b2, { email_verified: false }) });
  assert.equal(frag(r2).hash, '#auth-err-oauth_email_unverified');
  assert.equal(env2.DB.raw.prepare('SELECT COUNT(*) AS n FROM identities').get().n, 0);
});

test('oauth id_token checks: signature, alg, issuer, audience, expiry, nonce (each refused)', async () => {
  const env = makeEnv(OAUTH_ENV); resetJwksCache();
  const cases = [
    ['forged signature (other key, same kid)', (b) => ({ key: KEYS.rogue })],
    ['unknown kid', (b) => ({ header: { kid: 'nope' } })],
    ['alg none', (b) => ({ header: { alg: 'none' } })],
    ['HS256', (b) => ({ header: { alg: 'HS256' } })],
    ['wrong issuer', (b) => ({ claims: claimsFor('google', b, { iss: 'https://evil.example' }) })],
    ['wrong audience', (b) => ({ claims: claimsFor('google', b, { aud: 'someone-else' }) })],
    ['several audiences, azp not us', (b) => ({ claims: claimsFor('google', b, { aud: [OAUTH_ENV.GOOGLE_CLIENT_ID, 'x'], azp: 'x' }) })],
    ['expired', (b) => ({ claims: claimsFor('google', b, { exp: Math.floor(Date.now() / 1000) - 600 }) })],
    ['issued in the future', (b) => ({ claims: claimsFor('google', b, { iat: Math.floor(Date.now() / 1000) + 3600 }) })],
    ['nonce mismatch', (b) => ({ claims: claimsFor('google', b, { nonce: 'not-the-nonce' }) })],
    ['nonce missing', (b) => ({ claims: { ...claimsFor('google', b), nonce: undefined } })],
  ];
  for (const [name, f] of cases) {
    const b = await oauthBegin(env, 'google');
    const r = await oauthFinish(env, 'google', b, f(b));
    assert.equal(frag(r).hash, '#auth-err-oauth_failed', name);
    assert.equal(r.jar('stalak_s'), null, name);
  }
  // token endpoint refusing the code
  const b = await oauthBegin(env, 'google');
  nextIdToken = null;
  const r = await call(env, 'GET', `/api/auth/oauth/google/callback?code=x&state=${b.q.get('state')}`, { cookie: b.binding });
  assert.equal(frag(r).hash, '#auth-err-oauth_failed');
  assert.equal(env.DB.raw.prepare('SELECT COUNT(*) AS n FROM users').get().n, 0);
});

test('oauth state: unknown, reused, other provider, expired, missing or wrong browser cookie -> refused', async () => {
  const env = makeEnv(OAUTH_ENV); resetJwksCache();
  let b = await oauthBegin(env, 'google');
  let r = await oauthFinish(env, 'google', b, { state: 'x'.repeat(43) });
  assert.equal(frag(r).hash, '#auth-err-state_mismatch');
  r = await oauthFinish(env, 'google', b, { binding: null });
  assert.equal(frag(r).hash, '#auth-err-state_mismatch', 'no cookie (login CSRF)');
  r = await oauthFinish(env, 'google', b);
  assert.equal(frag(r).hash, '#auth-err-state_mismatch', 'state is single use, even after a failure');
  b = await oauthBegin(env, 'google');
  r = await oauthFinish(env, 'google', b, { binding: 'stalak_o=' + 'B'.repeat(32) });
  assert.equal(frag(r).hash, '#auth-err-state_mismatch', 'cookie of another browser');
  b = await oauthBegin(env, 'google');
  r = await oauthFinish(env, 'microsoft', b);
  assert.equal(frag(r).hash, '#auth-err-state_mismatch', 'state of another provider');
  b = await oauthBegin(env, 'google');
  env.DB.raw.exec('UPDATE oauth_states SET expires_at = 1');
  r = await oauthFinish(env, 'google', b);
  assert.equal(frag(r).hash, '#auth-err-state_mismatch', 'expired');
  b = await oauthBegin(env, 'google');
  r = await oauthFinish(env, 'google', b);
  assert.equal(frag(r).hash, '#auth-ok-pro', 'the normal case still works');
});

test('oauth Microsoft: tenant issuer must match tid; personal accounts trusted; work accounts need xms_edov', async () => {
  const env = makeEnv(OAUTH_ENV); resetJwksCache();
  let b = await oauthBegin(env, 'microsoft');
  let r = await oauthFinish(env, 'microsoft', b);
  assert.equal(frag(r).hash, '#auth-ok-pro', 'personal account');
  assert.ok(tokenRequests.at(-1).form.get('code_verifier'));
  assert.equal(tokenRequests.at(-1).provider, 'microsoft');
  let me = await call(env, 'GET', '/api/me', { cookie: r.jar('stalak_s') });
  assert.equal(me.data.user.email, 'glacon@outlook.com'); assert.deepEqual(me.data.user.providers, ['microsoft']);
  const T = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
  const work = (over) => ({ iss: `https://login.microsoftonline.com/${T}/v2.0`, tid: T, sub: 'work-sub-' + Math.random(), email: 'boss@entreprise.fr', ...over });
  b = await oauthBegin(env, 'microsoft');
  r = await oauthFinish(env, 'microsoft', b, { claims: claimsFor('microsoft', b, work()) });
  assert.equal(frag(r).hash, '#auth-err-oauth_email_unverified', 'work account e-mail not proven');
  b = await oauthBegin(env, 'microsoft');
  r = await oauthFinish(env, 'microsoft', b, { claims: claimsFor('microsoft', b, work({ xms_edov: true })) });
  assert.equal(frag(r).hash, '#auth-ok-pro', 'domain owner verified');
  b = await oauthBegin(env, 'microsoft');
  r = await oauthFinish(env, 'microsoft', b, { claims: claimsFor('microsoft', b, work({ tid: '11111111-bbbb-cccc-dddd-eeeeeeeeeeee', xms_edov: true })) });
  assert.equal(frag(r).hash, '#auth-err-oauth_failed', 'issuer tenant differs from tid');
  b = await oauthBegin(env, 'microsoft');
  r = await oauthFinish(env, 'microsoft', b, { claims: claimsFor('microsoft', b, { iss: `https://sts.windows.net/${T}/`, tid: T }) });
  assert.equal(frag(r).hash, '#auth-err-oauth_failed', 'v1 issuer refused');
  b = await oauthBegin(env, 'microsoft');
  r = await oauthFinish(env, 'microsoft', b, { claims: claimsFor('microsoft', b, { iss: 'https://login.microsoftonline.com/{tenantid}/v2.0' }) });
  assert.equal(frag(r).hash, '#auth-err-oauth_failed', 'template issuer refused');
  // tenant pinned to personal accounts only
  const env2 = makeEnv({ ...OAUTH_ENV, MICROSOFT_TENANT: 'consumers' });
  b = await oauthBegin(env2, 'microsoft');
  assert.equal(b.loc.pathname, '/consumers/oauth2/v2.0/authorize');
  r = await oauthFinish(env2, 'microsoft', b, { claims: claimsFor('microsoft', b, work({ xms_edov: true })) });
  assert.equal(frag(r).hash, '#auth-err-oauth_failed');
});

test('oauth Apple: form_post callback, ES256 and RS256 keys, client secret = ES256 JWT, name only the first time, private relay email', async () => {
  const env = makeEnv(OAUTH_ENV); resetJwksCache();
  let b = await oauthBegin(env, 'apple', 'return=/&to=account');
  let r = await oauthFinish(env, 'apple', b, { form: { user: JSON.stringify({ name: { firstName: 'Ana', lastName: 'Glace' }, email: 'x7k2@privaterelay.appleid.com' }) } });
  assert.equal(r.status, 303, JSON.stringify(r.data));
  assert.equal(r.headers.get('Location'), 'https://stalak.app/#auth-ok-account');
  const tr = tokenRequests.at(-1);
  assert.equal(tr.provider, 'apple'); assert.equal(tr.form.get('code_verifier'), null);
  assert.equal(tr.form.get('client_id'), 'app.stalak.web');
  // the client secret: ES256, kid = key id, iss = team, sub = Services ID, aud = Apple, signed with the .p8 key
  const cs = tr.form.get('client_secret');
  const { header, payload } = await verifyJwtSignature(cs, { keys: [KEYS.appleP8.jwk] }, ['ES256']);
  assert.equal(header.kid, 'ABC123DEFG'); assert.equal(header.alg, 'ES256');
  assert.equal(payload.iss, 'TEAM123456'); assert.equal(payload.sub, 'app.stalak.web'); assert.equal(payload.aud, 'https://appleid.apple.com');
  assert.ok(payload.exp > payload.iat && payload.exp - payload.iat <= 15777000);
  let me = await call(env, 'GET', '/api/me', { cookie: r.jar('stalak_s') });
  assert.equal(me.data.user.email, 'x7k2@privaterelay.appleid.com'); assert.equal(me.data.user.displayName, 'Ana Glace'); assert.equal(me.data.user.lang, 'fr');
  // next time: no name sent, RS256 key; the name stays
  b = await oauthBegin(env, 'apple');
  r = await oauthFinish(env, 'apple', b, { key: KEYS.appleRsa });
  assert.equal(frag(r).hash, '#auth-ok-pro');
  me = await call(env, 'GET', '/api/me', { cookie: r.jar('stalak_s') });
  assert.equal(me.data.user.displayName, 'Ana Glace');
  assert.equal(env.DB.raw.prepare('SELECT COUNT(*) AS n FROM users').get().n, 1);
  // Apple rules: issuer and audience
  b = await oauthBegin(env, 'apple');
  r = await oauthFinish(env, 'apple', b, { claims: claimsFor('apple', b, { aud: 'com.other.app' }) });
  assert.equal(frag(r).hash, '#auth-err-oauth_failed');
  b = await oauthBegin(env, 'apple');
  r = await oauthFinish(env, 'apple', b, { claims: claimsFor('apple', b, { iss: 'https://accounts.google.com' }) });
  assert.equal(frag(r).hash, '#auth-err-oauth_failed');
  // the form post must be a form
  r = await call(env, 'POST', '/api/auth/oauth/apple/callback', { raw: '{}', ct: 'application/json', origin: 'https://appleid.apple.com' });
  assert.equal(r.status, 415);
});

// ---- online saving with media (R2, migration 0004) ------------------------------------------------
const MiB = 1024 * 1024;
let proN = 0;
async function proUser(env, email) {
  const u = await login(env, email);
  proN++;
  await webhook(env, subEvent('subscription.created', sub(u.user.id, { id: 'sub_c' + proN, customer_id: 'ctm_c' + proN })));
  return u;
}
function bytes(n, seed = 1) { const b = new Uint8Array(n); let x = seed; for (let i = 0; i < n; i++) { x = (x * 1103515245 + 12345) >>> 0; b[i] = x >>> 24; } return b; }
const putRaw = (env, path, cookie, data, extra = {}) => call(env, 'PUT', path, { cookie, raw: data, ct: 'application/octet-stream',
  headers: { 'Content-Length': String(data.length), ...(extra.headers || {}) }, ...extra });
async function getBytes(env, path, cookie, headers = {}) {
  const h = new Headers(headers); if (cookie) h.set('Cookie', cookie);
  const res = await onRequest({ request: new Request('https://stalak.app' + path, { headers: h }), env, params: {}, waitUntil() {} });
  return { status: res.status, headers: res.headers, body: new Uint8Array(await res.arrayBuffer()) };
}
// uploads a whole file the way the app does: create, then one PUT or the parts, then complete
async function upload(env, cookie, pid, fileId, data, type = 'video/mp4', name = 'take.mp4') {
  let r = await call(env, 'POST', `/api/projects/${pid}/files`, { cookie, body: { fileId, name, type, size: data.length } });
  assert.ok(r.status === 200 || r.status === 201, JSON.stringify(r.data));
  if (r.data.status === 'ready') return r;
  if (!r.data.multipart) { r = await putRaw(env, `/api/projects/${pid}/files/${fileId}`, cookie, data); assert.equal(r.status, 200, JSON.stringify(r.data)); return r; }
  for (let n = 1; n <= r.data.parts; n++) {
    if (r.data.uploadedParts.includes(n)) continue;
    const p = await putRaw(env, `/api/projects/${pid}/files/${fileId}/parts/${n}`, cookie, data.subarray((n - 1) * r.data.partSize, n * r.data.partSize));
    assert.equal(p.status, 200, JSON.stringify(p.data));
  }
  r = await call(env, 'POST', `/api/projects/${pid}/files/${fileId}/complete`, { cookie, body: {} });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  return r;
}
const r2Keys = (env) => [...env.MEDIA.objects.keys()].sort();

test('cloud: without the R2 binding everything still works, media routes say cloud_unavailable', async () => {
  const env = makeEnv();
  let r = await call(env, 'GET', '/api/config');
  assert.equal(r.data.features.cloudSave, false);
  const pro = await proUser(env, 'nor2@example.com');
  r = await call(env, 'GET', '/api/projects', { cookie: pro.cookie });
  assert.equal(r.status, 200); assert.equal(r.data.storage.available, false); assert.equal(r.data.storage.quota, 20 * 1024 ** 3);
  r = await call(env, 'POST', '/api/projects/p1/files', { cookie: pro.cookie, body: { fileId: 'abcdefgh', name: 'a.mp4', type: 'video/mp4', size: 10 } });
  assert.equal(r.status, 503); assert.equal(r.data.error, 'cloud_unavailable');
  // the JSON-only save of before, and a save with an empty file list, still work
  r = await call(env, 'PUT', '/api/projects/p1', { cookie: pro.cookie, body: { name: 'x', state: { a: 1 } } });
  assert.equal(r.status, 200);
  r = await call(env, 'PUT', '/api/projects/p1', { cookie: pro.cookie, body: { name: 'x', state: { a: 1 }, files: [] } });
  assert.equal(r.status, 200);
  r = await call(env, 'PUT', '/api/projects/p1', { cookie: pro.cookie, body: { name: 'x', state: { a: 1 }, files: ['abcdefgh'] } });
  assert.equal(r.status, 503);
  r = await call(env, 'DELETE', '/api/projects/p1', { cookie: pro.cookie });
  assert.equal(r.status, 200);
  r = await call(env, 'DELETE', '/api/account', { cookie: pro.cookie, body: { confirm: true } });
  assert.equal(r.status, 200);
});

test('cloud: small file in one go, dedup on re-save, download with Range, project with files', async () => {
  const env = makeEnv({ MEDIA: createR2() });
  let r = await call(env, 'GET', '/api/config');
  assert.equal(r.data.features.cloudSave, true);
  const pro = await proUser(env, 'cloud1@example.com');
  const song = bytes(300000, 7);
  r = await call(env, 'POST', '/api/projects/p1/files', { cookie: pro.cookie, body: { fileId: 'song0001', name: 'Mon son.wav', type: 'audio/wav', size: song.length } });
  assert.equal(r.status, 201); assert.equal(r.data.status, 'uploading'); assert.equal(r.data.multipart, false);
  // wrong length, wrong content type, no Origin
  r = await putRaw(env, '/api/projects/p1/files/song0001', pro.cookie, song.subarray(0, 10));
  assert.equal(r.status, 400); assert.equal(r.data.error, 'size_mismatch');
  r = await call(env, 'PUT', '/api/projects/p1/files/song0001', { cookie: pro.cookie, raw: song, ct: 'text/plain', headers: { 'Content-Length': String(song.length) } });
  assert.equal(r.status, 415);
  r = await putRaw(env, '/api/projects/p1/files/song0001', pro.cookie, song, { origin: 'https://evil.example' });
  assert.equal(r.status, 403); assert.equal(r.data.error, 'bad_origin');
  r = await putRaw(env, '/api/projects/p1/files/song0001', pro.cookie, song);
  assert.equal(r.status, 200); assert.equal(r.data.status, 'ready');
  assert.deepEqual(r2Keys(env), [`u/${pro.user.id}/p/p1/song0001`]);
  assert.equal(env.MEDIA.objects.get(`u/${pro.user.id}/p/p1/song0001`).httpMetadata.contentType, 'audio/wav');
  // same file again: already there, nothing reserved twice
  r = await call(env, 'POST', '/api/projects/p1/files', { cookie: pro.cookie, body: { fileId: 'song0001', name: 'Mon son.wav', type: 'audio/wav', size: song.length } });
  assert.equal(r.status, 200); assert.equal(r.data.status, 'ready');
  r = await putRaw(env, '/api/projects/p1/files/song0001', pro.cookie, song);
  assert.equal(r.status, 409); assert.equal(r.data.error, 'already_uploaded');
  // the project needs its files to be there
  r = await call(env, 'PUT', '/api/projects/p1', { cookie: pro.cookie, body: { name: 'Clip', state: { v: 1 }, files: ['song0001', 'take0001'] } });
  assert.equal(r.status, 409); assert.equal(r.data.error, 'files_missing'); assert.deepEqual(r.data.missing, ['take0001']);
  r = await call(env, 'PUT', '/api/projects/p1', { cookie: pro.cookie, body: { name: 'Clip', state: { v: 1 }, files: ['song0001'] } });
  assert.equal(r.status, 200, JSON.stringify(r.data)); assert.equal(r.data.mediaBytes, song.length);
  r = await call(env, 'GET', '/api/projects', { cookie: pro.cookie });
  assert.equal(r.data.projects[0].mediaBytes, song.length);
  assert.equal(r.data.storage.used, song.length + r.data.projects[0].size);
  r = await call(env, 'GET', '/api/projects/p1', { cookie: pro.cookie });
  assert.deepEqual(r.data.files, [{ id: 'song0001', name: 'Mon son.wav', type: 'audio/wav', size: song.length }]);
  // download: whole, ranges, suffix, unsatisfiable
  let d = await getBytes(env, '/api/projects/p1/files/song0001', pro.cookie);
  assert.equal(d.status, 200); assert.deepEqual(d.body, song);
  assert.equal(d.headers.get('Content-Type'), 'audio/wav'); assert.equal(d.headers.get('Accept-Ranges'), 'bytes');
  assert.equal(d.headers.get('X-Content-Type-Options'), 'nosniff'); assert.match(d.headers.get('Content-Security-Policy'), /sandbox/);
  assert.match(d.headers.get('Cache-Control'), /private/);
  d = await getBytes(env, '/api/projects/p1/files/song0001', pro.cookie, { Range: 'bytes=100-199' });
  assert.equal(d.status, 206); assert.equal(d.headers.get('Content-Range'), `bytes 100-199/${song.length}`); assert.deepEqual(d.body, song.subarray(100, 200));
  d = await getBytes(env, '/api/projects/p1/files/song0001', pro.cookie, { Range: 'bytes=299990-' });
  assert.equal(d.status, 206); assert.equal(d.body.length, 10);
  d = await getBytes(env, '/api/projects/p1/files/song0001', pro.cookie, { Range: 'bytes=-5' });
  assert.equal(d.status, 206); assert.deepEqual(d.body, song.subarray(song.length - 5));
  d = await getBytes(env, '/api/projects/p1/files/song0001', pro.cookie, { Range: 'bytes=999999-' });
  assert.equal(d.status, 416); assert.equal(d.headers.get('Content-Range'), `bytes */${song.length}`);
  // rename
  r = await call(env, 'PATCH', '/api/projects/p1', { cookie: pro.cookie, body: { name: '  Nouveau   nom ' } });
  assert.equal(r.status, 200); assert.equal(r.data.name, 'Nouveau nom');
  r = await call(env, 'PATCH', '/api/projects/p1', { cookie: pro.cookie, body: { name: ' ' } });
  assert.equal(r.data.error, 'invalid_name');
  r = await call(env, 'PATCH', '/api/projects/zz', { cookie: pro.cookie, body: { name: 'x' } });
  assert.equal(r.status, 404);
});

test('cloud: big file in parts (multipart), resume after a cut, missing parts, wrong part size', async () => {
  const env = makeEnv({ MEDIA: createR2() });
  const pro = await proUser(env, 'cloud2@example.com');
  const vid = bytes(17 * MiB + 12345, 3);
  let r = await call(env, 'POST', '/api/projects/p2/files', { cookie: pro.cookie, body: { fileId: 'take0002', name: 'prise.mov', type: 'video/quicktime', size: vid.length } });
  assert.equal(r.status, 201); assert.equal(r.data.multipart, true); assert.equal(r.data.parts, 3); assert.equal(r.data.partSize, 8 * MiB);
  const ps = r.data.partSize;
  r = await putRaw(env, '/api/projects/p2/files/take0002', pro.cookie, vid);
  assert.equal(r.data.error, 'use_multipart');
  r = await putRaw(env, '/api/projects/p2/files/take0002/parts/1', pro.cookie, vid.subarray(0, ps - 1));
  assert.equal(r.status, 400); assert.equal(r.data.error, 'size_mismatch');
  r = await putRaw(env, '/api/projects/p2/files/take0002/parts/4', pro.cookie, vid.subarray(0, 10));
  assert.equal(r.data.error, 'invalid_part');
  r = await putRaw(env, '/api/projects/p2/files/take0002/parts/1', pro.cookie, vid.subarray(0, ps));
  assert.equal(r.status, 200);
  r = await putRaw(env, '/api/projects/p2/files/take0002/parts/3', pro.cookie, vid.subarray(2 * ps));
  assert.equal(r.status, 200);
  r = await call(env, 'POST', '/api/projects/p2/files/take0002/complete', { cookie: pro.cookie, body: {} });
  assert.equal(r.status, 409); assert.deepEqual(r.data.missing, [2]);
  // the connection dropped: asking again says which parts are already there
  r = await call(env, 'POST', '/api/projects/p2/files', { cookie: pro.cookie, body: { fileId: 'take0002', name: 'prise.mov', type: 'video/quicktime', size: vid.length } });
  assert.equal(r.status, 200); assert.deepEqual(r.data.uploadedParts, [1, 3]);
  r = await upload(env, pro.cookie, 'p2', 'take0002', vid, 'video/quicktime', 'prise.mov');
  assert.equal(r.data.status, 'ready');
  assert.equal(env.MEDIA.uploads.size, 0);
  assert.equal(env.DB.raw.prepare('SELECT COUNT(*) AS n FROM file_parts').get().n, 0);
  const d = await getBytes(env, '/api/projects/p2/files/take0002', pro.cookie, { Range: `bytes=${8 * MiB - 2}-${8 * MiB + 1}` });
  assert.equal(d.status, 206); assert.deepEqual(d.body, vid.subarray(8 * MiB - 2, 8 * MiB + 2));
  const full = await getBytes(env, '/api/projects/p2/files/take0002', pro.cookie);
  assert.equal(full.body.length, vid.length); assert.deepEqual(full.body, vid);
  // aborting an upload in progress
  const v2 = bytes(9 * MiB, 9);
  r = await call(env, 'POST', '/api/projects/p2/files', { cookie: pro.cookie, body: { fileId: 'take0003', name: 'b.mp4', type: 'video/mp4', size: v2.length } });
  assert.equal(env.MEDIA.uploads.size, 1);
  r = await call(env, 'DELETE', '/api/projects/p2/files/take0003', { cookie: pro.cookie });
  assert.equal(r.status, 200); assert.equal(env.MEDIA.uploads.size, 0);
});

test('cloud: a user only reaches their own files; Pro, type, size and id checks', async () => {
  const env = makeEnv({ MEDIA: createR2() });
  const a = await proUser(env, 'owner@example.com');
  const b = await proUser(env, 'other@example.com');
  const free = await login(env, 'freeloader@example.com');
  const data = bytes(1000);
  await upload(env, a.cookie, 'p1', 'file0001', data);
  await call(env, 'PUT', '/api/projects/p1', { cookie: a.cookie, body: { name: 'A', state: {}, files: ['file0001'] } });
  // another user: same project id and file id, nothing found; their own upload goes under their own prefix
  let d = await getBytes(env, '/api/projects/p1/files/file0001', b.cookie);
  assert.equal(d.status, 404);
  let r = await call(env, 'GET', '/api/projects/p1', { cookie: b.cookie });
  assert.equal(r.status, 404);
  r = await call(env, 'DELETE', '/api/projects/p1/files/file0001', { cookie: b.cookie });
  assert.equal(r.status, 200);
  assert.ok(env.MEDIA.objects.has(`u/${a.user.id}/p/p1/file0001`), 'not touched by another user');
  r = await call(env, 'DELETE', '/api/projects/p1', { cookie: b.cookie });
  assert.ok(env.MEDIA.objects.has(`u/${a.user.id}/p/p1/file0001`), 'not touched by another user');
  await upload(env, b.cookie, 'p1', 'file0001', bytes(50, 2));
  r = await call(env, 'PUT', '/api/projects/p1/files/file0001/parts/1', { cookie: b.cookie });
  d = await getBytes(env, '/api/projects/p1/files/file0001', a.cookie);
  assert.deepEqual(d.body, data, 'each user sees their own file');
  // signed out
  d = await getBytes(env, '/api/projects/p1/files/file0001', null);
  assert.equal(d.status, 401);
  // not Pro: cannot upload, but can still download and delete what was saved before
  r = await call(env, 'POST', '/api/projects/p9/files', { cookie: free.cookie, body: { fileId: 'file0009', name: 'a.mp4', type: 'video/mp4', size: 10 } });
  assert.equal(r.status, 403); assert.equal(r.data.error, 'pro_required');
  // checks on what is declared
  const bad = async (body, code, status) => {
    const x = await call(env, 'POST', '/api/projects/p1/files', { cookie: a.cookie, body: { fileId: 'file0002', name: 'x.mp4', type: 'video/mp4', size: 10, ...body } });
    assert.equal(x.data.error, code, JSON.stringify(x.data)); if (status) assert.equal(x.status, status);
  };
  await bad({ type: 'text/html', name: 'x.html' }, 'invalid_media_type', 415);
  await bad({ type: 'image/svg+xml' }, 'invalid_media_type', 415);
  await bad({ type: 'application/octet-stream', name: 'evil.html' }, 'invalid_media_type', 415);
  await bad({ size: 0 }, 'invalid_size');
  await bad({ size: 1.5 }, 'invalid_size');
  await bad({ size: 5 * 1024 ** 3 }, 'file_too_large', 413);
  await bad({ fileId: '../../x' }, 'invalid_file_id');
  await bad({ fileId: 'short' }, 'invalid_file_id');
  r = await call(env, 'POST', '/api/projects/p1/files', { cookie: a.cookie, body: { fileId: 'file0003', name: 'IMG_0001.MOV', type: '', size: 10 } });
  assert.equal(r.status, 201, 'no type but a video name: accepted');
  d = await getBytes(env, '/api/projects/p1/files/..%2F..%2Fx', a.cookie);
  assert.equal(d.status, 400);
  r = await call(env, 'GET', '/api/projects/p1/files/file0001/extra/x', { cookie: a.cookie });
  assert.equal(r.status, 404);
  r = await call(env, 'PUT', '/api/projects/p1', { cookie: a.cookie, body: { name: 'A', state: {}, files: ['../x'] } });
  assert.equal(r.data.error, 'invalid_files');
});

test('cloud: 20 GB quota (413 quota_exceeded), old files of a project erased on re-save, project delete', async () => {
  const env = makeEnv({ MEDIA: createR2(), CLOUD_QUOTA_BYTES: String(100000) });
  const pro = await proUser(env, 'quota@example.com');
  await upload(env, pro.cookie, 'p1', 'file000a', bytes(60000, 1));
  let r = await call(env, 'POST', '/api/projects/p1/files', { cookie: pro.cookie, body: { fileId: 'file000b', name: 'b.mp4', type: 'video/mp4', size: 50000 } });
  assert.equal(r.status, 413); assert.equal(r.data.error, 'quota_exceeded'); assert.equal(r.data.quota, 100000); assert.equal(r.data.used, 60000);
  await upload(env, pro.cookie, 'p1', 'file000c', bytes(30000, 2));
  r = await call(env, 'PUT', '/api/projects/p1', { cookie: pro.cookie, body: { name: 'v1', state: {}, files: ['file000a', 'file000c'] } });
  assert.equal(r.status, 200); assert.equal(r.data.mediaBytes, 90000);
  // the next version only uses c: a is erased, its room given back
  r = await call(env, 'PUT', '/api/projects/p1', { cookie: pro.cookie, body: { name: 'v2', state: {}, files: ['file000c'] } });
  assert.equal(r.data.mediaBytes, 30000);
  assert.deepEqual(r2Keys(env), [`u/${pro.user.id}/p/p1/file000c`]);
  assert.ok(r.data.storage.used < 40000);
  r = await call(env, 'POST', '/api/projects/p1/files', { cookie: pro.cookie, body: { fileId: 'file000b', name: 'b.mp4', type: 'video/mp4', size: 50000 } });
  assert.equal(r.status, 201);
  // deleting the project erases everything under it, unfinished uploads too
  r = await call(env, 'DELETE', '/api/projects/p1', { cookie: pro.cookie });
  assert.equal(r.status, 200); assert.equal(r2Keys(env).length, 0);
  assert.equal(env.DB.raw.prepare('SELECT COUNT(*) AS n FROM project_files').get().n, 0);
  assert.equal(r.data.storage.used, 0);
});

test('cloud: deleting the account erases all its media (and stops uploads in progress), not the others’', async () => {
  const env = makeEnv({ MEDIA: createR2() });
  const a = await proUser(env, 'leaving@example.com');
  const b = await proUser(env, 'staying@example.com');
  await upload(env, a.cookie, 'p1', 'file0001', bytes(100));
  await upload(env, a.cookie, 'p2', 'file0002', bytes(200));
  await call(env, 'PUT', '/api/projects/p1', { cookie: a.cookie, body: { name: 'A', state: {}, files: ['file0001'] } });
  await call(env, 'POST', '/api/projects/p3/files', { cookie: a.cookie, body: { fileId: 'file0003', name: 'big.mp4', type: 'video/mp4', size: 9 * MiB } });
  await upload(env, b.cookie, 'p1', 'file0001', bytes(100));
  assert.equal(env.MEDIA.uploads.size, 1);
  const r = await call(env, 'DELETE', '/api/account', { cookie: a.cookie, body: { confirm: true } });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  assert.deepEqual(r2Keys(env), [`u/${b.user.id}/p/p1/file0001`]);
  assert.equal(env.MEDIA.uploads.size, 0);
  for (const t of ['projects', 'project_files', 'file_parts']) {
    assert.equal(env.DB.raw.prepare(`SELECT COUNT(*) AS n FROM ${t} WHERE user_id = ?`).get(a.user.id).n, 0, t);
  }
});

test('cloud: 6-month rule: e-mail warning first, deletion 14 days later; opening keeps the project; stale uploads and orphans', async () => {
  const { cleanupCloud, maybeCleanup, KEEP_MS, WARN_BEFORE_MS } = await import('../../functions/_lib/cloud.js');
  const env = makeEnv({ MEDIA: createR2() });
  const pro = await proUser(env, 'sleepy@example.com');
  await upload(env, pro.cookie, 'old', 'file0001', bytes(100));
  await call(env, 'PUT', '/api/projects/old', { cookie: pro.cookie, body: { name: 'Vieux clip', state: {}, files: ['file0001'] } });
  await upload(env, pro.cookie, 'kept', 'file0002', bytes(100));
  await call(env, 'PUT', '/api/projects/kept', { cookie: pro.cookie, body: { name: 'Gardé', state: {}, files: ['file0002'] } });
  await call(env, 'PUT', '/api/projects/new', { cookie: pro.cookie, body: { name: 'Récent', state: {} } });
  const DAY = 864e5, now = Date.now();
  env.DB.raw.prepare("UPDATE projects SET opened_at = ?, updated_at = ? WHERE id IN ('old', 'kept')").run(now - 175 * DAY, now - 175 * DAY);
  const mails = mailCount('sleepy@example.com');
  let out = await cleanupCloud(env, now);
  assert.equal(out.warned, 2); assert.equal(out.deleted, 0);
  assert.equal(mailCount('sleepy@example.com'), mails + 1, 'one e-mail for both');
  const m = lastMail('sleepy@example.com');
  assert.match(m.body.subject, /supprimés/); assert.match(m.body.text, /Vieux clip/); assert.match(m.body.text, /Gardé/);
  out = await cleanupCloud(env, now + DAY);
  assert.equal(out.warned, 0, 'warned once'); assert.equal(out.deleted, 0, 'not before 6 months');
  // the user opens one: it is kept
  let r = await call(env, 'GET', '/api/projects/kept', { cookie: pro.cookie });
  assert.equal(r.status, 200);
  out = await cleanupCloud(env, now + 9 * DAY);
  assert.equal(out.deleted, 0, '14 days after the warning only');
  out = await cleanupCloud(env, now + 15 * DAY);
  assert.equal(out.deleted, 1);
  r = await call(env, 'GET', '/api/projects', { cookie: pro.cookie });
  assert.deepEqual(r.data.projects.map((p) => p.id).sort(), ['kept', 'new']);
  assert.deepEqual(r2Keys(env), [`u/${pro.user.id}/p/kept/file0002`]);
  // stale upload and a file whose project was never saved
  await call(env, 'POST', '/api/projects/x/files', { cookie: pro.cookie, body: { fileId: 'file0009', name: 'b.mp4', type: 'video/mp4', size: 9 * MiB } });
  await upload(env, pro.cookie, 'never', 'file0008', bytes(10));
  out = await cleanupCloud(env, Date.now() + 7 * DAY);
  assert.equal(out.staleUploads + out.orphans, 2);
  assert.equal(env.MEDIA.uploads.size, 0);
  assert.equal(env.DB.raw.prepare('SELECT COUNT(*) AS n FROM project_files').get().n, 1);
  // without a way to send the e-mail (production, no Resend key): no warning, so never any deletion
  const env2 = makeEnv({ MEDIA: createR2(), RESEND_API_KEY: undefined });
  env2.DB.raw.prepare("INSERT INTO users (id, email, lang, created_at) VALUES ('u1', 'x@example.com', 'en', 0)").run();
  env2.DB.raw.prepare("INSERT INTO projects (user_id, id, name, data, size, created_at, updated_at, opened_at) VALUES ('u1', 'p', 'n', '{}', 2, 0, 0, 0)").run();
  out = await cleanupCloud(env2, Date.now());
  assert.equal(out.warned, 0); assert.equal(out.deleted, 0);
  // lazy run: at most once per 6 hours (GET /api/projects above already used this window)
  assert.equal(await maybeCleanup(env, null), false);
  env.DB.raw.exec("DELETE FROM rate_limits WHERE key = 'cron:cloud-cleanup'");
  assert.equal(await maybeCleanup(env, null), true);
  assert.equal(await maybeCleanup(env, null), false);
  assert.ok(KEEP_MS > WARN_BEFORE_MS);
});

test('cloud: cron endpoint needs CRON_SECRET', async () => {
  let r = await call(makeEnv({ MEDIA: createR2() }), 'POST', '/api/cron/cloud-cleanup', { origin: null, headers: { Authorization: 'Bearer whatever' } });
  assert.equal(r.status, 404);
  const env = makeEnv({ MEDIA: createR2(), CRON_SECRET: 'a-long-cron-secret-123' });
  r = await call(env, 'POST', '/api/cron/cloud-cleanup', { origin: null, headers: { Authorization: 'Bearer nope' } });
  assert.equal(r.status, 404);
  r = await call(env, 'POST', '/api/cron/cloud-cleanup', { origin: null, headers: { Authorization: 'Bearer a-long-cron-secret-123' } });
  assert.equal(r.status, 200); assert.equal(r.data.ok, true); assert.equal(r.data.deleted, 0);
});

// ---- « Paroles automatiques »: POST /api/lyrics/transcribe -----------------------------------
// A WAV as the browser makes it: mono, 16 kHz, 16-bit PCM, 44-byte header; base64.
function wavB64(seconds, { rate = 16000, channels = 1, bits = 16 } = {}) {
  const n = Math.round(seconds * rate) * channels * (bits / 8), b = Buffer.alloc(44 + n);
  b.write('RIFF', 0); b.writeUInt32LE(36 + n, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20);
  b.writeUInt16LE(channels, 22); b.writeUInt32LE(rate, 24); b.writeUInt32LE(rate * channels * bits / 8, 28); b.writeUInt16LE(channels * bits / 8, 32);
  b.writeUInt16LE(bits, 34); b.write('data', 36); b.writeUInt32LE(n, 40);
  for (let i = 44; i + 1 < b.length; i += 2) b.writeInt16LE(Math.round(3000 * Math.sin(i / 20)), i);
  return b.toString('base64');
}
// The documented output of @cf/openai/whisper-large-v3-turbo
const AI_OUT = {
  transcription_info: { language: 'fr', language_probability: 0.97, duration: 20, duration_after_vad: 12.5 },
  text: 'Je rentre tard ce soir. La ville dort encore.',
  word_count: 9,
  segments: [
    { start: 1.2, end: 3.4, text: ' Je rentre tard ce soir.', temperature: 0, avg_logprob: -0.31, compression_ratio: 1.1, no_speech_prob: 0.02,
      words: [{ word: ' Je', start: 1.2, end: 1.4 }, { word: ' rentre', start: 1.4, end: 1.9 }, { word: ' tard', start: 1.9, end: 2.3 },
        { word: ' ce', start: 2.3, end: 2.5 }, { word: ' soir.', start: 2.5, end: 3.4 }] },
    { start: 5, end: 7.1, text: ' La ville dort encore.', temperature: 0, avg_logprob: -0.4, compression_ratio: 1.0, no_speech_prob: 0.05,
      words: [{ word: ' La', start: 5, end: 5.2 }, { word: ' ville', start: 5.2, end: 5.7 }, { word: ' dort', start: 5.7, end: 6.2 }, { word: ' encore.', start: 6.2, end: 99 }] },
    // silence: what Whisper "hears" there must go
    { start: 12, end: 18, text: ' Sous-titres réalisés par la communauté d\'Amara.org', temperature: 0, avg_logprob: -0.5, compression_ratio: 1.2, no_speech_prob: 0.4, words: [] },
    { start: 18, end: 19, text: ' Hmm', temperature: 0.2, avg_logprob: -1.3, compression_ratio: 0.8, no_speech_prob: 0.9, words: [] },
    { start: 19, end: 19.5, text: ' la la la la la la la la la la la la', temperature: 1, avg_logprob: -0.9, compression_ratio: 3.1, no_speech_prob: 0.1, words: [] },
  ],
  vtt: 'WEBVTT\n\n',
};
function fakeAI(out = AI_OUT) {
  const calls = [];
  return { calls, run: async (model, input) => { calls.push({ model, input }); if (out instanceof Error) throw out; return out; } };
}
// proUser(env, email): defined with the online-saving tests above (a signed-in account with an active subscription)
const WAV20 = wavB64(20);
const piece = (over = {}) => ({ audio: WAV20, job: 'job_abcdef12', part: 0, parts: 1, language: 'auto', ...over });
const transcribe = (env, cookie, over, opts = {}) => call(env, 'POST', '/api/lyrics/transcribe', { cookie, body: piece(over), ...opts });

test('lyrics transcribe: signed in + Pro only; Workers AI called with the documented input; cleaned, timed segments', async () => {
  const AI = fakeAI(), env = makeEnv({ AI });
  let r = await transcribe(env, undefined);
  assert.equal(r.status, 401); assert.equal(r.data.error, 'not_logged_in');
  const free = await login(env, 'lyr-free@example.com');
  r = await transcribe(env, free.cookie);
  assert.equal(r.status, 403); assert.equal(r.data.error, 'pro_required');
  assert.equal(AI.calls.length, 0, 'no AI call before the Pro check');
  r = await call(env, 'GET', '/api/lyrics/transcribe', { cookie: free.cookie });
  assert.equal(r.status, 405);
  // CSRF: JSON + same origin, as every state-changing route
  const pro = await proUser(env, 'lyr-pro@example.com');
  r = await transcribe(env, pro.cookie, {}, { origin: 'https://evil.example' });
  assert.equal(r.status, 403); assert.equal(r.data.error, 'bad_origin');
  r = await call(env, 'POST', '/api/lyrics/transcribe', { cookie: pro.cookie, raw: 'x', ct: 'text/plain' });
  assert.equal(r.status, 415);

  r = await transcribe(env, pro.cookie, { language: 'fr' });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  assert.equal(AI.calls.length, 1);
  const { model, input } = AI.calls[0];
  assert.equal(model, '@cf/openai/whisper-large-v3-turbo');
  assert.equal(input.task, 'transcribe'); assert.equal(input.language, 'fr'); assert.equal(input.vad_filter, true);
  assert.equal(input.condition_on_previous_text, false);
  assert.equal(input.audio, WAV20, 'the base64 WAV is passed as is');
  assert.equal(r.data.language, 'fr'); assert.equal(r.data.duration, 20);
  assert.deepEqual(r.data.segments.map((s) => s.text), ['Je rentre tard ce soir.', 'La ville dort encore.'], 'silence hallucinations, no-speech and loops dropped');
  assert.deepEqual(r.data.segments[0].words[0], { word: 'Je', start: 1.2, end: 1.4 });
  assert.equal(r.data.segments[1].words[3].end, 20, 'times clamped to the piece');
  assert.equal(r.data.usage.jobs, 1); assert.equal(r.data.usage.seconds, 20);
  // "auto": no language hint
  await transcribe(env, pro.cookie, { job: 'job_second01' });
  assert.equal('language' in AI.calls[1].input, false);
});

test('lyrics transcribe: audio checked (WAV mono 16 kHz, ≤ 31 s per piece, ≤ 16 pieces), body size limit', async () => {
  const AI = fakeAI(), env = makeEnv({ AI });
  const pro = await proUser(env, 'lyr-check@example.com');
  const bad = async (over, status, error) => {
    const r = await transcribe(env, pro.cookie, over);
    assert.equal(r.status, status, JSON.stringify(over).slice(0, 80) + ' ' + JSON.stringify(r.data)); if (error) assert.equal(r.data.error, error);
  };
  await bad({ audio: wavB64(5, { rate: 44100 }) }, 400, 'invalid_audio');
  await bad({ audio: wavB64(5, { channels: 2 }) }, 400, 'invalid_audio');
  await bad({ audio: Buffer.from('ID3' + 'x'.repeat(400)).toString('base64') }, 400, 'invalid_audio');
  await bad({ audio: 'not base64!'.repeat(20) }, 400, 'invalid_audio');
  await bad({ audio: undefined }, 400, 'invalid_audio');
  await bad({ audio: wavB64(0.1) }, 400, 'invalid_audio');
  await bad({ audio: wavB64(31.5) }, 413);
  await bad({ parts: 17, part: 0 }, 413, 'too_long');
  await bad({ part: 2, parts: 2 }, 400, 'invalid_part');
  await bad({ part: '0' }, 400, 'invalid_part');
  await bad({ job: 'x' }, 400, 'invalid_job');
  await bad({ language: 'français' }, 400, 'invalid_language');
  // a body far over the limit is refused
  const r = await call(env, 'POST', '/api/lyrics/transcribe', { cookie: pro.cookie, raw: JSON.stringify(piece({ audio: wavB64(60) })) });
  assert.equal(r.status, 413);
  assert.equal(AI.calls.length, 0, 'nothing invalid reaches Workers AI');
  await bad({ audio: wavB64(30.9) }, 200);
});

test('lyrics transcribe: daily quota, failures not counted, no binding → 503, odd outputs, rate limit, rows go with the account', async () => {
  let AI = fakeAI(), env = makeEnv({ AI });
  const pro = await proUser(env, 'lyr-quota@example.com');
  const W1 = wavB64(1);
  for (let i = 0; i < 20; i++) {
    const r = await transcribe(env, pro.cookie, { audio: W1, job: 'job_quota_' + String(i).padStart(3, '0') });
    assert.equal(r.status, 200, 'job ' + i + ' ' + JSON.stringify(r.data));
  }
  // the other pieces of a transcription already started still go through
  let r = await transcribe(env, pro.cookie, { audio: W1, part: 1, parts: 2 });
  assert.equal(r.status, 200);
  r = await transcribe(env, pro.cookie, { audio: W1, job: 'job_quota_021' });
  assert.equal(r.status, 429); assert.equal(r.data.error, 'quota_exceeded');
  assert.equal(AI.calls.length, 21);
  // audio budget: 90 minutes a day
  const pro2 = await proUser(env, 'lyr-minutes@example.com');
  env.DB.raw.prepare('INSERT INTO lyrics_usage (user_id, day, jobs, pieces, seconds, updated_at) VALUES (?, ?, 1, 1, 5390, 0)').run(pro2.user.id, new Date().toISOString().slice(0, 10));
  r = await transcribe(env, pro2.cookie, { part: 1, parts: 2 });
  assert.equal(r.status, 429); assert.equal(r.data.error, 'quota_exceeded');
  r = await transcribe(env, pro2.cookie, { audio: wavB64(5), part: 1, parts: 2 });
  assert.equal(r.status, 200, 'still fits');

  // Workers AI fails: 502, and the piece is not counted
  AI = fakeAI(new Error('3010: model error')); env = makeEnv({ AI });
  const p3 = await proUser(env, 'lyr-fail@example.com');
  r = await transcribe(env, p3.cookie);
  assert.equal(r.status, 502); assert.equal(r.data.error, 'transcribe_failed');
  assert.deepEqual({ ...env.DB.raw.prepare('SELECT jobs, pieces, seconds FROM lyrics_usage WHERE user_id = ?').get(p3.user.id) }, { jobs: 0, pieces: 0, seconds: 0 });
  // odd outputs do not break the answer
  for (const out of [null, {}, { text: '' }, { text: 'Bonjour tout le monde' }, { words: [{ word: 'yo', start: 0.5, end: 0.9 }], text: 'yo' }, { segments: [null, { text: 5 }, { words: 'x' }] }]) {
    const e2 = makeEnv({ AI: fakeAI(out) }); const p = await proUser(e2, 'lyr-odd@example.com');
    r = await transcribe(e2, p.cookie);
    assert.equal(r.status, 200, JSON.stringify(out)); assert.ok(Array.isArray(r.data.segments));
    if (out && out.text === 'Bonjour tout le monde') assert.deepEqual(r.data.segments, [{ start: 0, end: 20, text: 'Bonjour tout le monde', words: [] }]);
    if (out && out.words) assert.deepEqual(r.data.segments[0].words, [{ word: 'yo', start: 0.5, end: 0.9 }]);
  }
  // no AI binding (not set up yet): 503, nothing counted
  const e3 = makeEnv(); const p4 = await proUser(e3, 'lyr-noai@example.com');
  r = await transcribe(e3, p4.cookie);
  assert.equal(r.status, 503); assert.equal(r.data.error, 'ai_unavailable');
  assert.equal(e3.DB.raw.prepare('SELECT COUNT(*) AS n FROM lyrics_usage').get().n, 0);

  // per-connection rate limit (300 requests an hour)
  const e4 = makeEnv({ AI: fakeAI() }); const p5 = await proUser(e4, 'lyr-ip@example.com');
  e4.DB.raw.exec(`INSERT INTO rate_limits (key, window_start, count) VALUES ('lyr:ip:${(await sha256Hex('ip:10.9.9.9')).slice(0, 32)}', ${Date.now()}, 300)`);
  r = await transcribe(e4, p5.cookie, {}, { ip: '10.9.9.9' });
  assert.equal(r.status, 429); assert.equal(r.data.error, 'rate_limited');

  // account deleted: its usage rows go too
  env.DB.raw.prepare("INSERT INTO lyrics_usage (user_id, day, jobs, pieces, seconds, updated_at) VALUES (?, '2026-01-01', 1, 1, 10, 0)").run(p3.user.id);
  r = await call(env, 'DELETE', '/api/account', { cookie: p3.cookie, body: { confirm: true } });
  assert.equal(r.status, 200);
  assert.equal(env.DB.raw.prepare('SELECT COUNT(*) AS n FROM lyrics_usage').get().n, 0);
});

// ---- runner --------------------------------------------------------------------------
let failed = 0;
for (const t of tests) {
  try { await t.fn(); origLog('ok   -', t.name); }
  catch (e) { failed++; origLog('FAIL -', t.name, '\n      ', e.stack || e); }
}
origLog(`\n${tests.length - failed}/${tests.length} passed`);
console.warn = origWarn;
process.exit(failed ? 1 : 0);
