// Fixed-window rate limiter stored in D1 (table rate_limits).
import { HttpError } from './http.js';

// Increments the counter for `key` and returns the new count in the current window.
export async function hit(env, key, windowMs, now = Date.now()) {
  const start = now - windowMs;
  const row = await env.DB.prepare(
    `INSERT INTO rate_limits (key, window_start, count) VALUES (?1, ?2, 1)
     ON CONFLICT(key) DO UPDATE SET
       count = CASE WHEN window_start <= ?3 THEN 1 ELSE count + 1 END,
       window_start = CASE WHEN window_start <= ?3 THEN ?2 ELSE window_start END
     RETURNING count, window_start`
  ).bind(key, now, start).first();
  return { count: row.count, resetAt: row.window_start + windowMs };
}

export async function limit(env, key, max, windowMs, message) {
  const r = await hit(env, key, windowMs);
  if (r.count > max) {
    const retryAfter = Math.max(1, Math.ceil((r.resetAt - Date.now()) / 1000));
    throw new HttpError(429, 'rate_limited', message || 'Too many requests, try again later.', { retryAfter });
  }
  return r;
}

// Occasional cleanup of old rows (called opportunistically).
export async function cleanup(env, now = Date.now()) {
  await env.DB.batch([
    env.DB.prepare('DELETE FROM rate_limits WHERE window_start < ?1').bind(now - 24 * 3600e3),
    env.DB.prepare('DELETE FROM login_codes WHERE expires_at < ?1').bind(now),
    env.DB.prepare('DELETE FROM sessions WHERE expires_at < ?1').bind(now),
  ]);
}
