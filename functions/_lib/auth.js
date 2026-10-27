// Accounts: sign up (e-mail + password, then a 6-digit code proves the address), sign in with the password
// (plus a code by e-mail on a browser not seen before), forgotten password (code, then a new password), cookie sessions.
// Google / Apple / Microsoft sign-in is in oauth.js and ends in createSession() too.
import { HttpError, getCookie, sessionCookie, clearSessionCookie, clientIp, isDev } from './http.js';
import { randomCode, randomToken, randomId, randomBytes, toHex, sha256Hex, hmacSha256Hex, timingSafeEqual, pbkdf2Hex, PBKDF2_ITER } from './crypto.js';
import { limit, cleanup } from './ratelimit.js';
import { sendCodeEmail } from './email.js';
import { normalizeDisplayName } from './profile.js';

export const CODE_TTL_MS = 10 * 60e3;
export const MAX_ATTEMPTS = 5;
export const SESSION_TTL_MS = 60 * 24 * 3600e3;
export const DEVICE_TTL_MS = 90 * 24 * 3600e3;   // a browser where a code was typed is trusted for 90 days
export const RESEND_AFTER_MS = 30e3;             // a code asked again within 30 s is not sent again
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

// Codes are hashed with the email and their purpose (and an optional server-side pepper AUTH_SECRET).
async function hashCode(env, email, purpose, code) {
  const m = `${purpose}:${email}:${code}`;
  return env.AUTH_SECRET ? hmacSha256Hex(env.AUTH_SECRET, m) : sha256Hex('stalak:' + m);
}

export const emailKey = async (email) => (await sha256Hex('email:' + email)).slice(0, 32);
async function ipKey(request) {
  return (await sha256Hex('ip:' + clientIp(request))).slice(0, 32);
}

// ---- codes by e-mail ---------------------------------------------------------------------
// Creates (or refreshes) the code for (email, purpose) and mails it. If one was sent less than 30 s ago, it is kept
// (only `data` is updated) and no new e-mail goes out: double taps and quick retries do not spam the inbox.
// Limits: per email 5 codes / hour, per IP 20 / hour (all purposes together).
async function issueCode(request, env, email, purpose, lang, data) {
  const now = Date.now();
  const ek = await emailKey(email), ip = await ipKey(request);
  const row = await env.DB.prepare('SELECT created_at, expires_at FROM auth_codes WHERE email = ?1 AND purpose = ?2').bind(email, purpose).first();
  if (row && row.expires_at > now && now - row.created_at < RESEND_AFTER_MS) {
    await env.DB.prepare('UPDATE auth_codes SET data = ?3, lang = ?4 WHERE email = ?1 AND purpose = ?2')
      .bind(email, purpose, data ? JSON.stringify(data) : null, lang).run();
    return { ok: true, needCode: true, expiresIn: Math.round((row.expires_at - now) / 1000), resent: false };
  }
  await limit(env, `send:ip:${ip}`, 20, HOUR, 'Too many codes requested from this connection, try again later.');
  await limit(env, `send:email:${ek}`, 5, HOUR, 'Too many codes requested for this email, try again later.');
  const code = randomCode();
  await env.DB.prepare(
    `INSERT INTO auth_codes (email, purpose, code_hash, expires_at, attempts, data, lang, created_at) VALUES (?1, ?2, ?3, ?4, 0, ?5, ?6, ?7)
     ON CONFLICT(email, purpose) DO UPDATE SET code_hash = ?3, expires_at = ?4, attempts = 0, data = ?5, lang = ?6, created_at = ?7`
  ).bind(email, purpose, await hashCode(env, email, purpose, code), now + CODE_TTL_MS, data ? JSON.stringify(data) : null, lang, now).run();
  const r = await sendCodeEmail(env, email, code, lang, purpose);
  if (Math.random() < 0.05) await cleanup(env).catch(() => {});
  const out = { ok: true, needCode: true, expiresIn: CODE_TTL_MS / 1000, resent: true };
  if (r.devCode && isDev(env)) out.devCode = r.devCode;
  return out;
}

// Checks the code; `consume` deletes it when right. Returns the row ({data, lang}). 5 wrong tries burn the code.
async function checkCode(request, env, email, purpose, rawCode, consume = true) {
  const code = String(rawCode || '').replace(/\s+/g, '');
  await limit(env, `verify:ip:${await ipKey(request)}`, 30, 10 * 60e3, 'Too many attempts from this connection, try again later.');
  if (!/^\d{6}$/.test(code)) throw new HttpError(400, 'invalid_code', 'The code has 6 digits.');
  const now = Date.now();
  const del = () => env.DB.prepare('DELETE FROM auth_codes WHERE email = ?1 AND purpose = ?2').bind(email, purpose).run();
  const row = await env.DB.prepare('SELECT code_hash, expires_at, attempts, data, lang FROM auth_codes WHERE email = ?1 AND purpose = ?2').bind(email, purpose).first();
  if (!row || row.expires_at < now) {
    if (row) await del();
    throw new HttpError(400, 'code_expired', 'This code has expired, ask for a new one.');
  }
  if (row.attempts >= MAX_ATTEMPTS) { await del(); throw new HttpError(429, 'too_many_attempts', 'Too many wrong codes, ask for a new one.'); }
  if (!timingSafeEqual(await hashCode(env, email, purpose, code), row.code_hash)) {
    const attempts = row.attempts + 1;
    if (attempts >= MAX_ATTEMPTS) { await del(); throw new HttpError(429, 'too_many_attempts', 'Too many wrong codes, ask for a new one.'); }
    await env.DB.prepare('UPDATE auth_codes SET attempts = ?3 WHERE email = ?1 AND purpose = ?2').bind(email, purpose, attempts).run();
    throw new HttpError(400, 'invalid_code', 'Wrong code.', { attemptsLeft: MAX_ATTEMPTS - attempts });
  }
  if (consume) await del();
  let data = null; try { data = row.data ? JSON.parse(row.data) : null; } catch { data = null; }
  return { data, lang: row.lang };
}

// ---- sessions ----------------------------------------------------------------------------
// Opens a session; the user row gets the session fields that currentUser() would add.
// method: 'password' | 'password+code' | 'signup' | 'reset' | 'oauth:google' | 'oauth:apple' | 'oauth:microsoft' ('code': before v3)
export async function createSession(env, user, method) {
  const token = randomToken(32);
  const now = Date.now();
  user.s_hash = await sha256Hex(token); user.s_created_at = now; user.s_method = method;
  await env.DB.prepare('INSERT INTO sessions (token_hash, user_id, created_at, expires_at, method) VALUES (?1, ?2, ?3, ?4, ?5)')
    .bind(user.s_hash, user.id, now, now + SESSION_TTL_MS, method).run();
  await env.DB.prepare('UPDATE users SET last_login_at = ?2 WHERE id = ?1').bind(user.id, now).run();
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

const userById = (env, id) => env.DB.prepare('SELECT * FROM users WHERE id = ?1').bind(id).first();
const userByEmail = (env, email) => env.DB.prepare('SELECT * FROM users WHERE email = ?1').bind(email).first();

// ---- trusted devices (cookie stalak_d) -----------------------------------------------------
// The cookie is one random token per browser; trusted_devices keeps its hash for each user who typed a code there.
const DEVICE_COOKIE = 'stalak_d';
function deviceCookie(token) {
  return `${DEVICE_COOKIE}=${token}; Path=/api/auth; HttpOnly; Secure; SameSite=Lax; Max-Age=${DEVICE_TTL_MS / 1000}`;
}
function deviceToken(request) {
  const t = getCookie(request, DEVICE_COOKIE);
  return t && /^[A-Za-z0-9_-]{43}$/.test(t) ? t : null;
}
export async function deviceTrusted(request, env, userId) {
  const t = deviceToken(request);
  if (!t) return false;
  const now = Date.now(), h = await sha256Hex(t);
  const row = await env.DB.prepare('SELECT expires_at FROM trusted_devices WHERE token_hash = ?1 AND user_id = ?2').bind(h, userId).first();
  if (!row || row.expires_at <= now) return false;
  await env.DB.prepare('UPDATE trusted_devices SET last_used_at = ?3 WHERE token_hash = ?1 AND user_id = ?2').bind(h, userId, now).run();
  return true;
}
// Remembers this browser for the user; returns the Set-Cookie (the browser keeps its token if it has one).
export async function trustDevice(request, env, userId) {
  const t = deviceToken(request) || randomToken(32);
  const now = Date.now();
  await env.DB.prepare(
    `INSERT INTO trusted_devices (token_hash, user_id, created_at, last_used_at, expires_at) VALUES (?1, ?2, ?3, ?3, ?4)
     ON CONFLICT(token_hash, user_id) DO UPDATE SET last_used_at = ?3, expires_at = ?4`
  ).bind(await sha256Hex(t), userId, now, now + DEVICE_TTL_MS).run();
  return deviceCookie(t);
}
// Password changed: every browser except this one has to type a code again.
async function forgetOtherDevices(request, env, userId) {
  const t = deviceToken(request);
  await env.DB.prepare('DELETE FROM trusted_devices WHERE user_id = ?1 AND token_hash <> ?2').bind(userId, t ? await sha256Hex(t) : '').run();
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

export const failKey = async (email) => 'pwfail:' + (await emailKey(email));

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
  return new HttpError(429, 'too_many_attempts', 'Too many wrong passwords, try again later or reset your password.', { retryAfter });
}

// ---- sign up ---------------------------------------------------------------------------
// POST /api/auth/signup {email, password, displayName?, lang}
// The account is created only once the code is typed (signup/verify). An address already in use is reported
// (409 email_taken: the usual practice, so people know to sign in instead), with a rate limit per IP against enumeration.
export async function signup(request, env, body) {
  const email = normalizeEmail(body.email);
  const lang = normalizeLang(body.lang);
  await limit(env, `signup:ip:${await ipKey(request)}`, 20, HOUR, 'Too many sign-ups from this connection, try again later.');
  checkPasswordPolicy(body.password, email);
  const name = normalizeDisplayName(body.displayName === undefined ? null : body.displayName);
  if (await userByEmail(env, email)) throw new HttpError(409, 'email_taken', 'An account already exists with this email.');
  const h = await hashPassword(body.password);
  return issueCode(request, env, email, 'signup', lang, { h: h.hash, s: h.salt, i: h.iter, name });
}

// POST /api/auth/signup/verify {email, code} -> account created, signed in, this browser trusted
export async function signupVerify(request, env, body) {
  const email = normalizeEmail(body.email);
  const { data, lang } = await checkCode(request, env, email, 'signup', body.code);
  if (!data || !data.h) throw new HttpError(400, 'code_expired', 'This code has expired, ask for a new one.');
  if (await userByEmail(env, email)) throw new HttpError(409, 'email_taken', 'An account already exists with this email.');
  const id = randomId('u_'), now = Date.now();
  try {
    await env.DB.prepare(
      `INSERT INTO users (id, email, lang, created_at, last_login_at, display_name, password_hash, password_salt, password_iter, password_set_at, email_verified_at)
       VALUES (?1, ?2, ?3, ?4, ?4, ?5, ?6, ?7, ?8, ?4, ?4)`
    ).bind(id, email, normalizeLang(body.lang || lang), now, data.name || null, data.h, data.s, data.i || PBKDF2_ITER).run();
  } catch (e) {
    if (/UNIQUE/i.test(String(e && e.message))) throw new HttpError(409, 'email_taken', 'An account already exists with this email.');
    throw e;
  }
  const user = await userById(env, id);
  return { user, cookies: [await createSession(env, user, 'signup'), await trustDevice(request, env, id)] };
}

// ---- sign in ---------------------------------------------------------------------------
// POST /api/auth/login {email, password}
// Right password on a trusted browser: signed in. On a browser not seen before: {needCode: true} and a code is mailed
// (then login/verify). Wrong password, unknown email or account without password: the same 401 invalid_login.
export async function loginPassword(request, env, body) {
  const email = normalizeEmail(body.email);
  const password = typeof body.password === 'string' ? body.password : '';
  const ip = await ipKey(request);
  const ek = await emailKey(email);
  await limit(env, `login:ip:${ip}`, 30, 10 * 60e3, 'Too many attempts from this connection, try again later.');
  await limit(env, `login:email:${ek}`, 10, 10 * 60e3, 'Too many attempts for this email, try again later.');
  const fk = await failKey(email);
  const wait = await lockedFor(env, fk);
  if (wait) throw lockedError(wait);
  if (!password || password.length > PASSWORD_MAX) {
    await recordFailure(env, fk);
    throw new HttpError(401, 'invalid_login', 'Wrong email or password.');
  }
  const user = await userByEmail(env, email);
  if (!(await passwordMatches(user, password))) {
    await recordFailure(env, fk);
    const w = await lockedFor(env, fk);
    if (w) throw lockedError(w);
    throw new HttpError(401, 'invalid_login', 'Wrong email or password.');
  }
  await clearFailures(env, fk);
  const lang = body.lang ? normalizeLang(body.lang) : null;
  if (lang) await env.DB.prepare('UPDATE users SET lang = ?2 WHERE id = ?1').bind(user.id, lang).run();
  if (!(await deviceTrusted(request, env, user.id))) {
    return { needCode: await issueCode(request, env, email, 'login', lang || user.lang || 'fr', { u: user.id }) };
  }
  const fresh = await userById(env, user.id);
  return { user: fresh, cookies: [await createSession(env, fresh, 'password')] };
}

// POST /api/auth/login/verify {email, code} -> signed in, this browser trusted for 90 days
export async function loginVerify(request, env, body) {
  const email = normalizeEmail(body.email);
  const { data } = await checkCode(request, env, email, 'login', body.code);
  const user = data && data.u ? await userById(env, data.u) : null;
  if (!user || user.email !== email) throw new HttpError(400, 'code_expired', 'This code has expired, ask for a new one.');
  if (!user.email_verified_at) await env.DB.prepare('UPDATE users SET email_verified_at = ?2 WHERE id = ?1').bind(user.id, Date.now()).run();
  const fresh = await userById(env, user.id);
  return { user: fresh, cookies: [await createSession(env, fresh, 'password+code'), await trustDevice(request, env, user.id)] };
}

// ---- forgotten password (also: accounts made with a code only, which have no password yet) --------------
// POST /api/auth/forgot {email, lang} -> always {ok, needCode, expiresIn}, whether the account exists or not.
export async function forgot(request, env, body) {
  const email = normalizeEmail(body.email);
  const lang = normalizeLang(body.lang);
  await limit(env, `forgot:ip:${await ipKey(request)}`, 20, HOUR, 'Too many requests from this connection, try again later.');
  const user = await userByEmail(env, email);
  if (user) {
    const r = await issueCode(request, env, email, 'reset', lang, { u: user.id });
    return { ok: true, needCode: true, expiresIn: r.expiresIn, ...(r.devCode ? { devCode: r.devCode } : {}) };
  }
  // unknown address: the same limits are spent and the same answer given
  await limit(env, `send:ip:${await ipKey(request)}`, 20, HOUR, 'Too many codes requested from this connection, try again later.');
  await limit(env, `send:email:${await emailKey(email)}`, 5, HOUR, 'Too many codes requested for this email, try again later.');
  return { ok: true, needCode: true, expiresIn: CODE_TTL_MS / 1000 };
}

// POST /api/auth/reset {email, code}            -> {ok, codeOk: true}  (checks the code, keeps it: the next screen asks the password)
// POST /api/auth/reset {email, code, password}  -> new password saved, signed in, other sessions and devices signed out
export async function reset(request, env, body) {
  const email = normalizeEmail(body.email);
  if (body.password === undefined || body.password === null) {
    await checkCode(request, env, email, 'reset', body.code, false);
    return { codeOk: true };
  }
  checkPasswordPolicy(body.password, email);
  const { data } = await checkCode(request, env, email, 'reset', body.code);
  const user = data && data.u ? await userById(env, data.u) : null;
  if (!user || user.email !== email) throw new HttpError(400, 'code_expired', 'This code has expired, ask for a new one.');
  const h = await hashPassword(body.password), now = Date.now();
  await env.DB.batch([
    env.DB.prepare('UPDATE users SET password_hash = ?2, password_salt = ?3, password_iter = ?4, password_set_at = ?5, email_verified_at = COALESCE(email_verified_at, ?5) WHERE id = ?1')
      .bind(user.id, h.hash, h.salt, h.iter, now),
    env.DB.prepare('DELETE FROM sessions WHERE user_id = ?1').bind(user.id),
  ]);
  await forgetOtherDevices(request, env, user.id);
  await clearFailures(env, await failKey(email));
  const fresh = await userById(env, user.id);
  return { user: fresh, cookies: [await createSession(env, fresh, 'reset'), await trustDevice(request, env, user.id)] };
}

// May this session change the password without typing the current one?
export function recentCodeSession(user, now = Date.now()) {
  return !!(user && (user.s_method === 'code' || user.s_method === 'reset') && now - user.s_created_at < REAUTH_MS);
}

// POST /api/auth/password {password, currentPassword?}  (signed in)
// Accounts without a password (made with Google / Apple / Microsoft, or with a code before v3) set one without currentPassword.
export async function setPassword(request, env, body) {
  const user = await requireUser(request, env);
  const pw = body.password;
  checkPasswordPolicy(pw, user.email);
  const fk = await failKey(user.email);
  if (user.password_hash && !recentCodeSession(user)) {
    if (typeof body.currentPassword !== 'string' || !body.currentPassword) {
      throw new HttpError(403, 'reauth_required', 'Type your current password, or use "Forgot password".');
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
  await forgetOtherDevices(request, env, user.id);
  await clearFailures(env, fk);
  return env.DB.prepare(`SELECT u.*, ?2 AS s_hash, ?3 AS s_created_at, ?4 AS s_method FROM users u WHERE u.id = ?1`)
    .bind(user.id, user.s_hash, user.s_created_at, user.s_method).first();
}

