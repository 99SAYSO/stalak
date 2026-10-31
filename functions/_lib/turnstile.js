// Cloudflare Turnstile (free anti-robot check, audit of 30/10) on the forms that send an e-mail to any address typed:
// « Créer un compte » and « Mot de passe oublié ». On only when the owner has set both keys:
// TURNSTILE_SITE_KEY (public, wrangler.toml) and TURNSTILE_SECRET (secret, Cloudflare dashboard). Without them nothing changes.
// developers.cloudflare.com/turnstile/get-started/server-side-validation/
import { HttpError, clientIp } from './http.js';

export const turnstileOn = (env) => !!(env.TURNSTILE_SITE_KEY && env.TURNSTILE_SECRET);
export const turnstileSiteKey = (env) => (turnstileOn(env) ? String(env.TURNSTILE_SITE_KEY) : null);

// Throws 400 captcha_failed when the token is missing or refused. A Turnstile breakdown (no answer) lets the request
// through: the other limits (per connection, per address, per day) still hold, and nobody is locked out by an outage.
export async function checkTurnstile(request, env, token, action) {
  if (!turnstileOn(env)) return true;
  if (typeof token !== 'string' || !token || token.length > 2048) {
    throw new HttpError(400, 'captcha_failed', 'Please confirm you are not a robot, then try again.');
  }
  let d;
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: env.TURNSTILE_SECRET, response: token, remoteip: clientIp(request) }),
    });
    if (!res.ok) throw new Error('siteverify ' + res.status);
    d = await res.json();
  } catch (e) {
    console.error('[stalak] turnstile unreachable', e && e.message ? String(e.message).slice(0, 120) : 'error');
    return true;
  }
  if (!d || d.success !== true || (action && d.action && d.action !== action)) {
    console.warn('[stalak] turnstile refused', JSON.stringify((d && d['error-codes']) || []).slice(0, 120));
    throw new HttpError(400, 'captcha_failed', 'Please confirm you are not a robot, then try again.');
  }
  return true;
}
