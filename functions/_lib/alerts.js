// Alerts to the owner (audit of 30/10): an e-mail when something goes wrong on the server, so a breakdown is seen before
// the complaints. At most one e-mail per kind of alert per hour, and 20 a day in all; never anything about a person
// (no e-mail address, no IP, no message text): only what broke and how often.
import { hit } from './ratelimit.js';
import { isDev } from './http.js';
import { bump, today } from './metrics.js';

export const ALERT_EVERY_MS = 3600e3;
export const ALERTS_PER_DAY = 20;
const ownerAddress = (env) => {
  const a = String(env.ALERT_EMAIL || env.SUPPORT_EMAIL || 'contact@stalak.app').trim();
  return /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(a) ? a : 'contact@stalak.app';
};

// kind: a short fixed word ('server_error', 'email_cap', …); text: what happened, in a few lines (no personal data).
// Never throws: an alert must not break the request that raised it.
export async function alertOwner(env, kind, subject, text) {
  try {
    kind = String(kind).replace(/[^a-z0-9_]/gi, '').slice(0, 40) || 'other';
    const once = await hit(env, `alert:${kind}`, ALERT_EVERY_MS);
    if (once.count > 1) return false;
    const day = await hit(env, `alert:all:${today()}`, 86400e3);
    if (day.count > ALERTS_PER_DAY) return false;
    await bump(env, 'alert');
    if (!env.RESEND_API_KEY) {
      if (isDev(env)) console.log(`[stalak dev] alert ${kind}: ${subject}`);
      return false;
    }
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: env.EMAIL_FROM || 'Stalak <login@stalak.app>', to: [ownerAddress(env)],
        subject: `[Stalak] ${subject}`.slice(0, 160),
        text: `${text}\n\nThis alert is sent at most once an hour for the same problem. Details: Cloudflare → Workers & Pages → stalak-site → Logs, and the dashboard (admin.stalak.app).\n` }),
    });
    // not sent (Resend itself may be the problem): the next occurrence tries again instead of waiting an hour
    if (!res.ok) await env.DB.prepare('DELETE FROM rate_limits WHERE key = ?1').bind(`alert:${kind}`).run().catch(() => {});
    return res.ok;
  } catch (e) {
    console.error('[stalak] alert failed', kind, e && e.message ? String(e.message).slice(0, 120) : 'error');
    return false;
  }
}
