// Backend tests: node tests/backend/run.mjs   (Node >= 22.5, no dependencies)
// Runs the real Pages Function (functions/api/[[path]].js) against an in-memory SQLite "D1" and a fake fetch.
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import assert from 'node:assert/strict';
import { createD1 } from './fake-d1.mjs';
import { onRequest } from '../../functions/api/[[path]].js';
import { hmacSha256Hex } from '../../functions/_lib/crypto.js';
import { verifySignature } from '../../functions/_lib/paddle.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const ORIGIN = 'https://stalak.app';
const WEBHOOK_SECRET = 'pdl_ntfset_test_secret';

// ---- fake outside world -------------------------------------------------------------
const outbound = [];
globalThis.fetch = async (url, init = {}) => {
  const body = init.body ? JSON.parse(init.body) : null;
  outbound.push({ url: String(url), method: init.method, body, headers: init.headers });
  if (String(url) === 'https://api.resend.com/emails') return Response.json({ id: 'email_1' });
  let m = String(url).match(/paddle\.com\/customers\/(ctm_\w+)\/portal-sessions$/);
  if (m) return Response.json({ data: { id: 'cpls_1', customer_id: m[1], urls: { general: { overview: 'https://portal.example/overview' },
    subscriptions: (body.subscription_ids || []).map((id) => ({ id, cancel_subscription: 'https://portal.example/cancel/' + id,
      update_subscription_payment_method: 'https://portal.example/pay/' + id, view_subscription: 'https://portal.example/view/' + id })) } } }, { status: 201 });
  m = String(url).match(/paddle\.com\/subscriptions\/(sub_\w+)\/cancel$/);
  if (m) return Response.json({ data: { id: m[1], status: 'canceled' } });
  return new Response('not mocked: ' + url, { status: 599 });
};
const origLog = console.log, origWarn = console.warn;
console.log = (...a) => { if (!String(a[0]).startsWith('[stalak dev]')) origLog(...a); };
console.warn = () => {};

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
  return { status: res.status, data, headers: res.headers };
}

function lastCode(email) {
  const e = [...outbound].reverse().find((o) => o.url.includes('resend') && o.body.to[0] === email);
  return e.body.text.match(/\b(\d{6})\b/)[1];
}

async function login(env, email, lang = 'fr') {
  let r = await call(env, 'POST', '/api/auth/send-code', { body: { email, lang } });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  r = await call(env, 'POST', '/api/auth/verify', { body: { email, code: lastCode(email) } });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  const cookie = r.headers.get('Set-Cookie').split(';')[0];
  return { cookie, user: r.data.user, data: r.data, setCookie: r.headers.get('Set-Cookie') };
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

test('config exposes only public Paddle settings', async () => {
  const env = makeEnv();
  const r = await call(env, 'GET', '/api/config');
  assert.equal(r.status, 200);
  assert.deepEqual(r.data.paddle, { environment: 'sandbox', clientToken: 'test_clienttoken', prices: { month: 'pri_month', year: 'pri_year' } });
  assert.ok(!JSON.stringify(r.data).includes('pdl_sdbx_apikey_test'));
  assert.ok(!JSON.stringify(r.data).includes(WEBHOOK_SECRET));
});

test('anonymous /api/me returns free entitlements', async () => {
  const r = await call(makeEnv(), 'GET', '/api/me');
  assert.equal(r.status, 200);
  assert.equal(r.data.user, null);
  assert.deepEqual(r.data.entitlements, { plan: 'free', outro: true, cloudSave: false, clipMode: false, autoLyrics: false });
});

test('code login flow: email sent (FR/EN), code hashed, session cookie set', async () => {
  const env = makeEnv();
  let r = await call(env, 'POST', '/api/auth/send-code', { body: { email: '  Alice@Example.com ', lang: 'en' } });
  assert.equal(r.status, 200);
  assert.equal(r.data.devCode, undefined, 'code never returned outside dev');
  const mail = outbound.at(-1);
  assert.equal(mail.body.from, 'Stalak <login@stalak.app>');
  assert.deepEqual(mail.body.to, ['alice@example.com']);
  assert.match(mail.body.subject, /is your Stalak code/);
  const code = lastCode('alice@example.com');
  const stored = await env.DB.prepare('SELECT code_hash FROM login_codes').first();
  assert.ok(!stored.code_hash.includes(code) && stored.code_hash.length === 64, 'code stored hashed');

  r = await call(env, 'POST', '/api/auth/verify', { body: { email: 'alice@example.com', code } });
  assert.equal(r.status, 200);
  const sc = r.headers.get('Set-Cookie');
  assert.match(sc, /^stalak_s=[A-Za-z0-9_-]{43};/);
  for (const flag of ['HttpOnly', 'Secure', 'SameSite=Lax', 'Path=/', `Max-Age=${60 * 86400}`]) assert.ok(sc.includes(flag), flag);
  const token = sc.split(';')[0].split('=')[1];
  const sess = await env.DB.prepare('SELECT token_hash, expires_at FROM sessions').first();
  assert.notEqual(sess.token_hash, token, 'session token stored hashed');
  assert.ok(Math.abs(sess.expires_at - (Date.now() + 60 * 864e5)) < 60e3);

  r = await call(env, 'GET', '/api/me', { cookie: 'stalak_s=' + token });
  assert.equal(r.data.user.email, 'alice@example.com');
  assert.equal(r.data.user.lang, 'en');
  assert.equal(r.data.entitlements.plan, 'free');

  // code is single use
  r = await call(env, 'POST', '/api/auth/verify', { body: { email: 'alice@example.com', code } });
  assert.equal(r.status, 400); assert.equal(r.data.error, 'code_expired');

  // French email
  await call(env, 'POST', '/api/auth/send-code', { body: { email: 'bob@example.com', lang: 'fr' } });
  assert.match(outbound.at(-1).body.subject, /est ton code Stalak/);

  // logout
  r = await call(env, 'POST', '/api/auth/logout', { cookie: 'stalak_s=' + token });
  assert.match(r.headers.get('Set-Cookie'), /Max-Age=0/);
  r = await call(env, 'GET', '/api/me', { cookie: 'stalak_s=' + token });
  assert.equal(r.data.user, null);
});

test('wrong code: 5 attempts max, then the code is burned', async () => {
  const env = makeEnv();
  await call(env, 'POST', '/api/auth/send-code', { body: { email: 'c@example.com' } });
  const good = lastCode('c@example.com');
  const bad = good === '000000' ? '111111' : '000000';
  for (let i = 1; i <= 4; i++) {
    const r = await call(env, 'POST', '/api/auth/verify', { body: { email: 'c@example.com', code: bad } });
    assert.equal(r.status, 400); assert.equal(r.data.error, 'invalid_code'); assert.equal(r.data.attemptsLeft, 5 - i);
  }
  let r = await call(env, 'POST', '/api/auth/verify', { body: { email: 'c@example.com', code: bad } });
  assert.equal(r.status, 429); assert.equal(r.data.error, 'too_many_attempts');
  r = await call(env, 'POST', '/api/auth/verify', { body: { email: 'c@example.com', code: good } });
  assert.equal(r.status, 400, 'even the right code fails after 5 wrong ones');
});

test('expired code is refused', async () => {
  const env = makeEnv();
  await call(env, 'POST', '/api/auth/send-code', { body: { email: 'd@example.com' } });
  env.DB.raw.exec('UPDATE login_codes SET expires_at = 1');
  const r = await call(env, 'POST', '/api/auth/verify', { body: { email: 'd@example.com', code: lastCode('d@example.com') } });
  assert.equal(r.data.error, 'code_expired');
});

test('rate limiting per email (30 s cooldown, 5/hour) and per IP (20/hour)', async () => {
  const env = makeEnv();
  let r = await call(env, 'POST', '/api/auth/send-code', { body: { email: 'e@example.com' } });
  assert.equal(r.status, 200);
  r = await call(env, 'POST', '/api/auth/send-code', { body: { email: 'e@example.com' } });
  assert.equal(r.status, 429); assert.equal(r.data.error, 'rate_limited'); assert.ok(r.data.retryAfter > 0);
  for (let i = 0; i < 4; i++) { env.DB.raw.exec("DELETE FROM rate_limits WHERE key LIKE 'send:email30:%'");
    r = await call(env, 'POST', '/api/auth/send-code', { body: { email: 'e@example.com' } }); assert.equal(r.status, 200); }
  env.DB.raw.exec("DELETE FROM rate_limits WHERE key LIKE 'send:email30:%'");
  r = await call(env, 'POST', '/api/auth/send-code', { body: { email: 'e@example.com' } });
  assert.equal(r.status, 429, '6th code in an hour refused');

  for (let i = 0; i < 20; i++) {
    r = await call(env, 'POST', '/api/auth/send-code', { body: { email: `ip${i}@example.com` }, ip: '9.9.9.9' });
    assert.equal(r.status, 200);
  }
  r = await call(env, 'POST', '/api/auth/send-code', { body: { email: 'ip21@example.com' }, ip: '9.9.9.9' });
  assert.equal(r.status, 429);
  const keys = env.DB.raw.prepare('SELECT key FROM rate_limits').all().map((x) => x.key).join(' ');
  assert.ok(!keys.includes('9.9.9.9') && !keys.includes('example.com'), 'no clear IP/email in rate limit keys');
});

test('dev mode without RESEND_API_KEY returns/logs the code', async () => {
  const env = makeEnv({ RESEND_API_KEY: '', APP_ORIGIN: 'http://localhost:8788' });
  const r = await call(env, 'POST', '/api/auth/send-code', { body: { email: 'dev@example.com' }, origin: 'http://localhost:8788' });
  assert.equal(r.status, 200); assert.match(r.data.devCode, /^\d{6}$/);
  const prod = makeEnv({ RESEND_API_KEY: '' });
  const r2 = await call(prod, 'POST', '/api/auth/send-code', { body: { email: 'dev@example.com' } });
  assert.equal(r2.status, 500); assert.equal(r2.data.error, 'email_not_configured');
});

test('CSRF: JSON content type and Origin required on state-changing requests', async () => {
  const env = makeEnv();
  let r = await call(env, 'POST', '/api/auth/send-code', { body: { email: 'f@example.com' }, ct: 'text/plain' });
  assert.equal(r.status, 415); assert.equal(r.data.error, 'json_required');
  r = await call(env, 'POST', '/api/auth/send-code', { body: { email: 'f@example.com' }, origin: 'https://evil.example' });
  assert.equal(r.status, 403); assert.equal(r.data.error, 'bad_origin');
  r = await call(env, 'POST', '/api/auth/send-code', { body: { email: 'f@example.com' }, origin: null });
  assert.equal(r.status, 403);
  r = await call(env, 'POST', '/api/auth/send-code', { body: { email: 'f@example.com' }, origin: 'http://localhost:8788' });
  assert.equal(r.status, 403, 'localhost refused outside dev');
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
  assert.deepEqual(r.data.entitlements, { plan: 'pro', outro: false, cloudSave: true, clipMode: true, autoLyrics: true });
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
  assert.equal(data.user.hasPassword, false);
  assert.deepEqual(data.session, { method: 'code', recentCode: true });
  const r = await call(env, 'GET', '/api/me', { cookie });
  assert.deepEqual(r.data.session, { method: 'code', recentCode: true });
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

test('password: set (policy), PBKDF2 stored, login with password, generic error', async () => {
  const env = makeEnv();
  const { cookie, user } = await login(env, 'pw@example.com');
  for (const [pw, code] of [['short', 'password_too_short'], ['password', 'password_too_common'], ['AZERTYUIOP', 'password_too_common'],
    ['pw@example.com', 'password_too_common'], ['x'.repeat(201), 'password_too_long']]) {
    const r = await call(env, 'POST', '/api/auth/password', { cookie, body: { password: pw } });
    assert.equal(r.status, 400, pw); assert.equal(r.data.error, code, pw);
  }
  assert.equal((await call(env, 'POST', '/api/auth/password', { body: { password: 'neige-et-glace' } })).status, 401);
  let r = await call(env, 'POST', '/api/auth/password', { cookie, body: { password: 'neige-et-glace' } });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  assert.equal(r.data.user.hasPassword, true);
  const row = env.DB.raw.prepare('SELECT password_hash, password_salt, password_iter FROM users WHERE id = ?').get(user.id);
  assert.equal(row.password_iter, 100000);
  assert.match(row.password_salt, /^[0-9a-f]{32}$/);
  assert.match(row.password_hash, /^[0-9a-f]{64}$/);
  assert.ok(!row.password_hash.includes('neige'));

  r = await call(env, 'POST', '/api/auth/login', { body: { email: ' PW@example.com ', password: 'neige-et-glace' } });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  assert.match(r.headers.get('Set-Cookie'), /^stalak_s=[A-Za-z0-9_-]{43};.*HttpOnly/);
  assert.equal(r.data.user.email, 'pw@example.com');
  assert.deepEqual(r.data.session, { method: 'password', recentCode: false });
  const pwCookie = r.headers.get('Set-Cookie').split(';')[0];
  assert.equal((await call(env, 'GET', '/api/me', { cookie: pwCookie })).data.user.id, user.id);

  // wrong password, unknown email and account without password: same answer
  const wrong = await call(env, 'POST', '/api/auth/login', { body: { email: 'pw@example.com', password: 'pas-le-bon' } });
  const unknown = await call(env, 'POST', '/api/auth/login', { body: { email: 'nobody@example.com', password: 'pas-le-bon' } });
  await login(env, 'nopw@example.com');
  const nopw = await call(env, 'POST', '/api/auth/login', { body: { email: 'nopw@example.com', password: 'pas-le-bon' } });
  for (const x of [wrong, unknown, nopw]) { assert.equal(x.status, 401); assert.deepEqual(x.data, { error: 'invalid_login', message: 'Wrong email or password.' }); }
  r = await call(env, 'POST', '/api/auth/login', { body: { email: 'pw@example.com', password: 'neige-et-glace' }, origin: 'https://evil.example' });
  assert.equal(r.status, 403, 'CSRF check on login');
});

test('password login: lock after 5 failures for 15 min (also for unknown emails), rate limits per IP and per email', async () => {
  const env = makeEnv();
  const { cookie } = await login(env, 'lock@example.com');
  await call(env, 'POST', '/api/auth/password', { cookie, body: { password: 'banquise-2026' } });
  for (let i = 1; i <= 4; i++) {
    const r = await call(env, 'POST', '/api/auth/login', { body: { email: 'lock@example.com', password: 'nope-nope-' + i } });
    assert.equal(r.status, 401);
  }
  let r = await call(env, 'POST', '/api/auth/login', { body: { email: 'lock@example.com', password: 'nope-nope-5' } });
  assert.equal(r.status, 429); assert.equal(r.data.error, 'too_many_attempts'); assert.ok(r.data.retryAfter > 800);
  r = await call(env, 'POST', '/api/auth/login', { body: { email: 'lock@example.com', password: 'banquise-2026' } });
  assert.equal(r.status, 429, 'locked even with the right password');
  for (let i = 1; i <= 5; i++) r = await call(env, 'POST', '/api/auth/login', { body: { email: 'ghost@example.com', password: 'nope-nope-' + i } });
  assert.equal(r.status, 429, 'unknown emails lock the same way (no account enumeration)');
  // lock expires
  env.DB.raw.exec(`UPDATE rate_limits SET window_start = window_start - ${16 * 60e3} WHERE key LIKE 'pwfail:%'`);
  env.DB.raw.exec("DELETE FROM rate_limits WHERE key LIKE 'login:email:%'");
  r = await call(env, 'POST', '/api/auth/login', { body: { email: 'lock@example.com', password: 'banquise-2026' } });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  assert.equal(env.DB.raw.prepare("SELECT COUNT(*) AS n FROM rate_limits WHERE key LIKE 'pwfail:%' AND count >= 5").get().n, 1, 'success clears the failures');
  // per email: 10 attempts / 10 min
  env.DB.raw.exec('DELETE FROM rate_limits');
  for (let i = 0; i < 10; i++) {
    env.DB.raw.exec("DELETE FROM rate_limits WHERE key LIKE 'pwfail:%'");
    r = await call(env, 'POST', '/api/auth/login', { body: { email: 'lock@example.com', password: 'banquise-2026' } });
    assert.equal(r.status, 200);
  }
  r = await call(env, 'POST', '/api/auth/login', { body: { email: 'lock@example.com', password: 'banquise-2026' } });
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

test('password change: needs the current one, or a code session < 15 min; other sessions signed out', async () => {
  const env = makeEnv();
  const codeS = await login(env, 'chg@example.com');
  let r = await call(env, 'POST', '/api/auth/password', { cookie: codeS.cookie, body: { password: 'premier-mdp-1' } });
  assert.equal(r.status, 200);
  // a fresh code session may change it without the old one (forgotten password flow)
  r = await call(env, 'POST', '/api/auth/password', { cookie: codeS.cookie, body: { password: 'deuxieme-mdp-2' } });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  // a password session needs the current one
  r = await call(env, 'POST', '/api/auth/login', { body: { email: 'chg@example.com', password: 'deuxieme-mdp-2' } });
  const pwCookie = r.headers.get('Set-Cookie').split(';')[0];
  r = await call(env, 'POST', '/api/auth/password', { cookie: pwCookie, body: { password: 'troisieme-mdp-3' } });
  assert.equal(r.status, 403); assert.equal(r.data.error, 'reauth_required');
  r = await call(env, 'POST', '/api/auth/password', { cookie: pwCookie, body: { password: 'troisieme-mdp-3', currentPassword: 'faux-faux-faux' } });
  assert.equal(r.status, 400); assert.equal(r.data.error, 'wrong_password');
  // the code session is now older than 15 minutes: needs the current password too
  env.DB.raw.exec(`UPDATE sessions SET created_at = created_at - ${16 * 60e3} WHERE method = 'code'`);
  r = await call(env, 'POST', '/api/auth/password', { cookie: codeS.cookie, body: { password: 'troisieme-mdp-3' } });
  assert.equal(r.data.error, 'reauth_required');
  assert.equal((await call(env, 'GET', '/api/me', { cookie: codeS.cookie })).data.session.recentCode, false);
  r = await call(env, 'POST', '/api/auth/password', { cookie: pwCookie, body: { password: 'troisieme-mdp-3', currentPassword: 'deuxieme-mdp-2' } });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  assert.equal((await call(env, 'GET', '/api/me', { cookie: pwCookie })).data.user.email, 'chg@example.com', 'this session stays');
  assert.equal((await call(env, 'GET', '/api/me', { cookie: codeS.cookie })).data.user, null, 'the other sessions are signed out');
  r = await call(env, 'POST', '/api/auth/login', { body: { email: 'chg@example.com', password: 'deuxieme-mdp-2' } });
  assert.equal(r.status, 401, 'old password no longer works');
  r = await call(env, 'POST', '/api/auth/login', { body: { email: 'chg@example.com', password: 'troisieme-mdp-3' } });
  assert.equal(r.status, 200);
  // wrong current passwords count toward the lock
  const p2 = r.headers.get('Set-Cookie').split(';')[0];
  for (let i = 0; i < 5; i++) r = await call(env, 'POST', '/api/auth/password', { cookie: p2, body: { password: 'quatrieme-mdp-4', currentPassword: 'faux-' + i + '-faux' } });
  r = await call(env, 'POST', '/api/auth/password', { cookie: p2, body: { password: 'quatrieme-mdp-4', currentPassword: 'troisieme-mdp-3' } });
  assert.equal(r.status, 429); assert.equal(r.data.error, 'too_many_attempts');
});

test('account delete also erases name, photo and password', async () => {
  const env = makeEnv();
  const { cookie } = await login(env, 'gone@example.com');
  await call(env, 'PATCH', '/api/me', { cookie, body: { displayName: 'Gone' } });
  await putAvatar(env, cookie, JPEG, 'image/jpeg');
  await call(env, 'POST', '/api/auth/password', { cookie, body: { password: 'adieu-la-neige' } });
  await call(env, 'POST', '/api/auth/login', { body: { email: 'gone@example.com', password: 'wrong-wrong' } });
  const r = await call(env, 'DELETE', '/api/account', { cookie, body: { confirm: true } });
  assert.equal(r.status, 200);
  assert.equal(env.DB.raw.prepare('SELECT COUNT(*) AS n FROM users').get().n, 0);
  assert.equal(env.DB.raw.prepare("SELECT COUNT(*) AS n FROM rate_limits WHERE key LIKE 'pwfail:%'").get().n, 0);
  const login2 = await call(env, 'POST', '/api/auth/login', { body: { email: 'gone@example.com', password: 'adieu-la-neige' } });
  assert.equal(login2.status, 401);
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
