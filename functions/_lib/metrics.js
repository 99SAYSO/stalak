// Counters for the owner's dashboard (functions/_lib/admin.js): features used per day, and visits.
// Nothing here can identify a person: no IP, no account, no cookie.
import { HttpError, json, readJson, clientIp } from './http.js';
import { limit } from './ratelimit.js';
import { sha256Hex } from './crypto.js';

export const today = (now = Date.now()) => new Date(now).toISOString().slice(0, 10);
export const METRICS = ['help_q', 'help_fail', 'cloud_save', 'ticket', 'ticket_msg', 'code_mail', 'alert', 'err_5xx', 'paid_first'];

// Anonymous steps of the way to a subscription (audit of 30/10, « entonnoir »): the page tells POST /api/event {name}.
// A closed list; no cookie, no account, no number per visitor: only +1 on the day's counter `ev_<name>`.
// visit (the visits table) → export_ok → pro_offer → ad_shown → ad_ok → plans_open → checkout_open → paid_first (Paddle webhook).
// pro_offer: the Pro offer shown after the first video; ad_offer: a rewarded ad asked; ad_shown: the ad really on screen.
export const EVENTS = ['export_start', 'export_ok', 'export_fail', 'pro_offer', 'ad_offer', 'ad_shown', 'ad_ok', 'plans_open', 'checkout_open'];
// why an export failed, as a category only (App sends it): nothing about the person or the video
export const EXPORT_FAIL = ['memory', 'decoder', 'hidden', 'cancel', 'other'];
export const EVENTS_PER_IP_HOUR = 120;
export const EVENT_REASONS = ['filters', 'clip', 'fx', 'text', 'lyrics', 'pack', 'cloud', 'human', 'wm', 'other'];

// +1 on today's counter `name`. Never breaks the request that counts (the counter is only for the dashboard).
export async function bump(env, name, n = 1) {
  try {
    await env.DB.prepare(
      'INSERT INTO daily_counts (day, name, n) VALUES (?1, ?2, ?3) ON CONFLICT(day, name) DO UPDATE SET n = n + ?3'
    ).bind(today(), name, n).run();
  } catch (e) {
    console.error('[stalak] metric', name, e && e.message ? String(e.message).slice(0, 120) : 'error');
  }
}

// audit of 30/10: one request + one D1 write per sign of life; every 5 min (was 1 min) spares the Cloudflare quota
export const VISIT_EVERY_S = 300;         // the page sends a sign of life every 5 minutes while it is shown (and when it comes back)
export const LIVE_MS = 390e3;             // "live" = seen in the last 6 min 30 s
export const NEW_VISITS_PER_IP_HOUR = 60; // new page loads counted per connection and per hour (sign-of-life updates are free)
export const VISITS_KEEP_DAYS = 90;
const VID = /^[A-Za-z0-9_-]{16,40}$/;

// POST /api/event {name, cat?, ios?, why?}: one step of the funnel. Unknown names are refused (400), so the table holds
// only the names above. Limited per connection (hashed, like the visits).
export async function event(request, env) {
  const body = await readJson(request, 512);
  const name = typeof body.name === 'string' && EVENTS.includes(body.name) ? body.name : null;
  if (!name) throw new HttpError(400, 'invalid_event', 'Unknown event name.');
  const ipKey = (await sha256Hex('ip:' + clientIp(request))).slice(0, 32);
  await limit(env, `event:ip:${ipKey}`, EVENTS_PER_IP_HOUR, 3600e3);
  await bump(env, 'ev_' + name);
  if (body.ios === true) await bump(env, 'ios_' + name);   // the same step on an iPhone / iPad
  if (name === 'export_fail') await bump(env, 'ev_export_fail_' + (EXPORT_FAIL.includes(body.cat) ? body.cat : 'other'));
  if (name === 'plans_open' && typeof body.why === 'string') await bump(env, 'ev_plans_why_' + (EVENT_REASONS.includes(body.why) ? body.why : 'other'));
  return json({ ok: true });
}

// POST /api/presence {vid, lang}: the page is open. One row per page load and per day, updated each minute.
export async function presence(request, env) {
  const body = await readJson(request, 1024);
  const vid = typeof body.vid === 'string' && VID.test(body.vid) ? body.vid : null;
  if (!vid) throw new HttpError(400, 'invalid_vid', 'vid: 16-40 letters, digits, - or _.');
  const lang = body.lang === 'fr' ? 'fr' : 'en';
  const now = Date.now(), day = today(now);
  const row = await env.DB.prepare(
    `INSERT INTO visits (day, vid, first_at, last_at, lang) VALUES (?1, ?2, ?3, ?3, ?4)
     ON CONFLICT(day, vid) DO UPDATE SET last_at = ?3 RETURNING first_at`
  ).bind(day, vid, now, lang).first();
  if (row && row.first_at === now) {
    // a new page load: limited per connection, so nobody can fill the table with made-up visits
    const ipKey = (await sha256Hex('ip:' + clientIp(request))).slice(0, 32);
    try {
      await limit(env, `visit:ip:${ipKey}`, NEW_VISITS_PER_IP_HOUR, 3600e3);
    } catch (e) {
      await env.DB.prepare('DELETE FROM visits WHERE day = ?1 AND vid = ?2').bind(day, vid).run();
      throw e;
    }
    // old visits go now and then
    if (Math.random() < 0.01) {
      const old = today(now - VISITS_KEEP_DAYS * 864e5);
      await env.DB.prepare('DELETE FROM visits WHERE day < ?1').bind(old).run().catch(() => {});
    }
  }
  return json({ ok: true, every: VISIT_EVERY_S });
}
