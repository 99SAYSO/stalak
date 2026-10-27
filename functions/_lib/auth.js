// Passwordless login with a 6-digit email code, and cookie sessions.
import { HttpError, getCookie, sessionCookie, clearSessionCookie, clientIp, isDev } from './http.js';
import { randomCode, randomToken, randomId, sha256Hex, hmacSha256Hex, timingSafeEqual } from './crypto.js';
import { limit, cleanup } from './ratelimit.js';
import { sendLoginCode } from './email.js';

export const CODE_TTL_MS = 10 * 60e3;
export const MAX_ATTEMPTS = 5;
export const SESSION_TTL_MS = 60 * 24 * 3600e3;
const HOUR = 3600e3;

export function normalizeEmail(v) {
  const e = String(v || '').trim().toLowerCase();
  if (e.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) {
    throw new HttpError(400, 'invalid_email', 'Invalid email address.');
  }
  return e;
}

export function normalizeLang(v) {
  return String(v || '').toLowerCase().startsWith('en') ? 'en' : 'fr';
}

// Codes are hashed with the email (and an optional server-side pepper AUTH_SECRET).
async function hashCode(env, email, code) {
  return env.AUTH_SECRET ? hmacSha256Hex(env.AUTH_SECRET, `${email}:${code}`) : sha256Hex(`stalak:${email}:${code}`);
}

async function ipKey(request) {
  return (await sha256Hex('ip:' + clientIp(request))).slice(0, 32);
}

export async function sendCode(request, env, body) {
  const email = normalizeEmail(body.email);
  const lang = normalizeLang(body.lang);
  const emailKey = (await sha256Hex('email:' + email)).slice(0, 32);
  const ip = await ipKey(request);
  // Per IP: 20 codes / hour. Per email: 1 every 30 s, 5 per hour.
  await limit(env, `send:ip:${ip}`, 20, HOUR, 'Too many codes requested from this connection, try again later.');
  await limit(env, `send:email30:${emailKey}`, 1, 30e3, 'Wait a few seconds before asking for a new code.');
  await limit(env, `send:email:${emailKey}`, 5, HOUR, 'Too many codes requested for this email, try again later.');

  const code = randomCode();
  const now = Date.now();
  await env.DB.prepare(
    `INSERT INTO login_codes (email, code_hash, expires_at, attempts, created_at, lang) VALUES (?1, ?2, ?3, 0, ?4, ?5)
     ON CONFLICT(email) DO UPDATE SET code_hash = ?2, expires_at = ?3, attempts = 0, created_at = ?4, lang = ?5`
  ).bind(email, await hashCode(env, email, code), now + CODE_TTL_MS, now, lang).run();

  const r = await sendLoginCode(env, email, code, lang);
  if (Math.random() < 0.05) await cleanup(env).catch(() => {});
  const out = { ok: true, expiresIn: CODE_TTL_MS / 1000 };
  if (r.devCode && isDev(env)) out.devCode = r.devCode;
  return out;
}

// Returns { user, token } on success; throws HttpError otherwise.
export async function verifyCode(request, env, body) {
  const email = normalizeEmail(body.email);
  const code = String(body.code || '').replace(/\s+/g, '');
  const ip = await ipKey(request);
  await limit(env, `verify:ip:${ip}`, 30, 10 * 60e3, 'Too many attempts from this connection, try again later.');
  if (!/^\d{6}$/.test(code)) throw new HttpError(400, 'invalid_code', 'The code has 6 digits.');

  const now = Date.now();
  const row = await env.DB.prepare('SELECT code_hash, expires_at, attempts, lang FROM login_codes WHERE email = ?1').bind(email).first();
  if (!row || row.expires_at < now) {
    if (row) await env.DB.prepare('DELETE FROM login_codes WHERE email = ?1').bind(email).run();
    throw new HttpError(400, 'code_expired', 'This code has expired, ask for a new one.');
  }
  if (row.attempts >= MAX_ATTEMPTS) {
    await env.DB.prepare('DELETE FROM login_codes WHERE email = ?1').bind(email).run();
    throw new HttpError(429, 'too_many_attempts', 'Too many wrong codes, ask for a new one.');
  }
  const ok = timingSafeEqual(await hashCode(env, email, code), row.code_hash);
  if (!ok) {
    const attempts = row.attempts + 1;
    if (attempts >= MAX_ATTEMPTS) {
      await env.DB.prepare('DELETE FROM login_codes WHERE email = ?1').bind(email).run();
      throw new HttpError(429, 'too_many_attempts', 'Too many wrong codes, ask for a new one.');
    }
    await env.DB.prepare('UPDATE login_codes SET attempts = ?2 WHERE email = ?1').bind(email, attempts).run();
    throw new HttpError(400, 'invalid_code', 'Wrong code.', { attemptsLeft: MAX_ATTEMPTS - attempts });
  }
  await env.DB.prepare('DELETE FROM login_codes WHERE email = ?1').bind(email).run();

  const lang = body.lang ? normalizeLang(body.lang) : (row.lang || null);
  let user = await env.DB.prepare('SELECT * FROM users WHERE email = ?1').bind(email).first();
  if (!user) {
    const id = randomId('u_');
    await env.DB.prepare('INSERT INTO users (id, email, lang, created_at, last_login_at) VALUES (?1, ?2, ?3, ?4, ?4)')
      .bind(id, email, lang || 'fr', now).run();
    user = await env.DB.prepare('SELECT * FROM users WHERE id = ?1').bind(id).first();
  } else {
    await env.DB.prepare('UPDATE users SET last_login_at = ?2, lang = COALESCE(?3, lang) WHERE id = ?1').bind(user.id, now, lang).run();
  }

  const token = randomToken(32);
  await env.DB.prepare('INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?1, ?2, ?3, ?4)')
    .bind(await sha256Hex(token), user.id, now, now + SESSION_TTL_MS).run();
  return { user, cookie: sessionCookie(token, SESSION_TTL_MS / 1000) };
}

// Current user from the stalak_s cookie, or null.
export async function currentUser(request, env) {
  const token = getCookie(request, 'stalak_s');
  if (!token || token.length > 100) return null;
  const row = await env.DB.prepare(
    `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ?1 AND s.expires_at > ?2`
  ).bind(await sha256Hex(token), Date.now()).first();
  return row || null;
}

export async function requireUser(request, env) {
  const u = await currentUser(request, env);
  if (!u) throw new HttpError(401, 'not_logged_in', 'You must be signed in.');
  return u;
}

export async function logout(request, env) {
  const token = getCookie(request, 'stalak_s');
  if (token) await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?1').bind(await sha256Hex(token)).run();
  return clearSessionCookie();
}
