// Login with a 6-digit email code or an (optional) password, and cookie sessions.
import { HttpError, getCookie, sessionCookie, clearSessionCookie, clientIp, isDev } from './http.js';
import { randomCode, randomToken, randomId, randomBytes, toHex, sha256Hex, hmacSha256Hex, timingSafeEqual, pbkdf2Hex, PBKDF2_ITER } from './crypto.js';
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

  return { user, cookie: await createSession(env, user, 'code') };
}

// Opens a session; the user row gets the session fields that currentUser() would add.
async function createSession(env, user, method) {
  const token = randomToken(32);
  const now = Date.now();
  user.s_hash = await sha256Hex(token); user.s_created_at = now; user.s_method = method;
  const userId = user.id;
  await env.DB.prepare('INSERT INTO sessions (token_hash, user_id, created_at, expires_at, method) VALUES (?1, ?2, ?3, ?4, ?5)')
    .bind(await sha256Hex(token), userId, now, now + SESSION_TTL_MS, method).run();
  return sessionCookie(token, SESSION_TTL_MS / 1000);
}

// Current user from the stalak_s cookie, or null.
export async function currentUser(request, env) {
  const token = getCookie(request, 'stalak_s');
  if (!token || token.length > 100) return null;
  const row = await env.DB.prepare(
    `SELECT u.*, s.token_hash AS s_hash, s.created_at AS s_created_at, s.method AS s_method
     FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ?1 AND s.expires_at > ?2`
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

// ---- passwords -----------------------------------------------------------------------
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 200;
export const PW_MAX_FAILS = 5;            // wrong passwords in a row for one email...
export const PW_LOCK_MS = 15 * 60e3;      // ...lock password login for that email for 15 minutes
export const REAUTH_MS = 15 * 60e3;       // a code session this young may change the password without the old one
// The 20 most common passwords (lists of leaked passwords: NordPass, NCSC), plus a few French favourites. Compared lower-cased.
export const COMMON_PASSWORDS = new Set([
  '123456', '123456789', '12345678', 'password', 'qwerty123', 'qwerty1', '111111', '12345', 'secret', '123123',
  '1234567890', '1234567', '000000', 'qwerty', 'abc123', 'password1', 'iloveyou', '11111111', 'azerty', 'azertyuiop',
  'motdepasse', 'azerty123', '00000000', '123123123', 'qwertyuiop', 'password123', 'abcd1234', '12341234', 'soleil123', 'doudou123',
]);

export function checkPasswordPolicy(pw, email) {
  if (typeof pw !== 'string' || pw.length < PASSWORD_MIN) throw new HttpError(400, 'password_too_short', `At least ${PASSWORD_MIN} characters.`, { min: PASSWORD_MIN });
  if (pw.length > PASSWORD_MAX) throw new HttpError(400, 'password_too_long', `At most ${PASSWORD_MAX} characters.`);
  const low = pw.toLowerCase();
  if (COMMON_PASSWORDS.has(low) || (email && low === String(email).toLowerCase())) throw new HttpError(400, 'password_too_common', 'This password is too easy to guess.');
}

async function hashPassword(pw) {
  const salt = toHex(randomBytes(16));
  return { hash: await pbkdf2Hex(pw, salt, PBKDF2_ITER), salt, iter: PBKDF2_ITER };
}

const DUMMY_SALT = '00112233445566778899aabbccddeeff';
// Always spends one PBKDF2, even without a stored hash, so timing does not tell whether the account exists.
async function passwordMatches(user, pw) {
  const has = !!(user && user.password_hash && user.password_salt);
  const got = await pbkdf2Hex(String(pw), has ? user.password_salt : DUMMY_SALT, has ? (user.password_iter || PBKDF2_ITER) : PBKDF2_ITER);
  return has && timingSafeEqual(got, user.password_hash);
}

const failKey = async (email) => 'pwfail:' + (await sha256Hex('email:' + email)).slice(0, 32);

// Lock state lives in rate_limits (window_start = time of the last failure), keyed by the hashed email,
// so it behaves the same whether the account exists or not.
async function lockedFor(env, key, now = Date.now()) {
  const r = await env.DB.prepare('SELECT window_start, count FROM rate_limits WHERE key = ?1').bind(key).first();
  if (r && r.count >= PW_MAX_FAILS && now - r.window_start < PW_LOCK_MS) return Math.ceil((r.window_start + PW_LOCK_MS - now) / 1000);
  return 0;
}
async function recordFailure(env, key, now = Date.now()) {
  await env.DB.prepare(
    `INSERT INTO rate_limits (key, window_start, count) VALUES (?1, ?2, 1)
     ON CONFLICT(key) DO UPDATE SET count = CASE WHEN window_start <= ?3 THEN 1 ELSE count + 1 END, window_start = ?2`
  ).bind(key, now, now - PW_LOCK_MS).run();
}
const clearFailures = (env, key) => env.DB.prepare('DELETE FROM rate_limits WHERE key = ?1').bind(key).run();

function lockedError(retryAfter) {
  return new HttpError(429, 'too_many_attempts', 'Too many wrong passwords, try again later or sign in with an email code.', { retryAfter });
}

// POST /api/auth/login {email, password}
export async function loginPassword(request, env, body) {
  const email = normalizeEmail(body.email);
  const password = typeof body.password === 'string' ? body.password : '';
  const ip = await ipKey(request);
  const emailKey = (await sha256Hex('email:' + email)).slice(0, 32);
  await limit(env, `login:ip:${ip}`, 30, 10 * 60e3, 'Too many attempts from this connection, try again later.');
  await limit(env, `login:email:${emailKey}`, 10, 10 * 60e3, 'Too many attempts for this email, try again later.');
  const fk = await failKey(email);
  const wait = await lockedFor(env, fk);
  if (wait) throw lockedError(wait);
  if (!password || password.length > PASSWORD_MAX) {
    await recordFailure(env, fk);
    throw new HttpError(401, 'invalid_login', 'Wrong email or password.');
  }
  const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?1').bind(email).first();
  if (!(await passwordMatches(user, password))) {
    await recordFailure(env, fk);
    const w = await lockedFor(env, fk);
    if (w) throw lockedError(w);
    throw new HttpError(401, 'invalid_login', 'Wrong email or password.');
  }
  await clearFailures(env, fk);
  const lang = body.lang ? normalizeLang(body.lang) : null;
  await env.DB.prepare('UPDATE users SET last_login_at = ?2, lang = COALESCE(?3, lang) WHERE id = ?1').bind(user.id, Date.now(), lang).run();
  const fresh = await env.DB.prepare('SELECT * FROM users WHERE id = ?1').bind(user.id).first();
  return { user: fresh, cookie: await createSession(env, fresh, 'password') };
}

// May this session change the password without typing the current one?
export function recentCodeSession(user, now = Date.now()) {
  return !!(user && user.s_method === 'code' && now - user.s_created_at < REAUTH_MS);
}

// POST /api/auth/password {password, currentPassword?}  (signed in)
export async function setPassword(request, env, body) {
  const user = await requireUser(request, env);
  const pw = body.password;
  checkPasswordPolicy(pw, user.email);
  const fk = await failKey(user.email);
  if (user.password_hash && !recentCodeSession(user)) {
    if (typeof body.currentPassword !== 'string' || !body.currentPassword) {
      throw new HttpError(403, 'reauth_required', 'Type your current password, or sign in again with an email code.');
    }
    const wait = await lockedFor(env, fk);
    if (wait) throw lockedError(wait);
    if (!(await passwordMatches(user, body.currentPassword))) {
      await recordFailure(env, fk);
      throw new HttpError(400, 'wrong_password', 'The current password is wrong.');
    }
  }
  const h = await hashPassword(pw);
  const now = Date.now();
  await env.DB.batch([
    env.DB.prepare('UPDATE users SET password_hash = ?2, password_salt = ?3, password_iter = ?4, password_set_at = ?5 WHERE id = ?1')
      .bind(user.id, h.hash, h.salt, h.iter, now),
    // every other device is signed out when the password changes
    env.DB.prepare('DELETE FROM sessions WHERE user_id = ?1 AND token_hash <> ?2').bind(user.id, user.s_hash),
  ]);
  await clearFailures(env, fk);
  return env.DB.prepare(`SELECT u.*, ?2 AS s_hash, ?3 AS s_created_at, ?4 AS s_method FROM users u WHERE u.id = ?1`)
    .bind(user.id, user.s_hash, user.s_created_at, user.s_method).first();
}
