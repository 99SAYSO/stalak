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
// export_retry: an export that failed and that the page made again by itself (safer settings, or once back in Stalak);
// export_saved: that second go worked (the person got the video); export_refused: a pack not started (too big for the device).
// clip_ask (7/11, Clip mode): a 16:9 clip exported without Pro, the answer to the question (pro / reel / none)
export const EVENTS = ['export_start', 'export_ok', 'export_fail', 'export_retry', 'export_saved', 'export_refused', 'clip_ask', 'pro_offer', 'ad_offer', 'ad_shown', 'ad_ok', 'plans_open', 'checkout_open',
  'checkout_close', 'checkout_done'];   // 7/11: the payment window closed without buying ({stage}), or paid
// why an export failed, as a category only (App sends it): nothing about the person or the video
// (7/11) + encoder; closed: the page closed during the export; crash: an export that never ended, found at the next visit
// (the browser closed the tab: usually out of memory on a phone)
export const EXPORT_FAIL = ['memory', 'decoder', 'encoder', 'hidden', 'cancel', 'closed', 'crash', 'other'];
// (7/11, report of the figures, track 4) the details of an export that failed, each a closed list of buckets (body.x): never the
// video, the song, the account nor the size of a file. st: where it broke; fmt: the video's shape; kind: one video or a pack;
// path: WebCodecs (wc) or recorded in real time (rt); dur: the passage's length; took: time from the click; mem: the memory the
// browser tells (navigator.deviceMemory, in GB; iPhones never tell it: '?'). The device (iPhone / Android / computer) comes from
// the browser's name (deviceOf). Every value becomes one daily counter ev_xf_<key>_<value>, plus ev_xf_<device>_<cat>.
export const EXPORT_X = {
  st: ['start', 'prepare', 'frames', 'assemble', 'file', 'realtime'],
  fmt: ['916', '45', '11', '169'],
  kind: ['one', 'pack'],
  path: ['wc', 'rt', 'none'],
  dur: ['d15', 'd30', 'd60', 'dlong'],
  took: ['t10', 't30', 't60', 't180', 'tlong'],
  mem: ['m1', 'm2', 'm4', 'm8', 'unk'],
};
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

// +1 on this hour's counter `name` (hourly_counts, migration 0013): only the exports, for the « Heure par heure » page.
export async function bumpHour(env, name, now = Date.now()) {
  try {
    await env.DB.prepare(
      'INSERT INTO hourly_counts (hour, name, n) VALUES (?1, ?2, 1) ON CONFLICT(hour, name) DO UPDATE SET n = n + 1'
    ).bind(Math.floor(now / 3600e3), name).run();
  } catch (e) {
    console.error('[stalak] hourly metric', name, e && e.message ? String(e.message).slice(0, 120) : 'error');
  }
}

// audit of 30/10: one request + one D1 write per sign of life; every 5 min (was 1 min) spares the Cloudflare quota
export const PRESENCE_GAP_MS = 240e3;     // audit of 6/11: at most one write per visit every 4 minutes
export const VISIT_EVERY_S = 300;         // the page sends a sign of life every 5 minutes while it is shown (and when it comes back)
export const LIVE_MS = 390e3;             // "live" = seen in the last 6 min 30 s
export const NEW_VISITS_PER_IP_HOUR = 60; // new page loads counted per connection and per hour (sign-of-life updates are free)
export const VISITS_KEEP_DAYS = 90;
const VID = /^[A-Za-z0-9_-]{16,40}$/;

// Where a request comes from, for the dashboard: the COUNTRY Cloudflare gives (2 letters; never the IP nor the city) and the
// kind of device read from the browser's name (iPhone/iPad, Android, computer); nothing else is kept.
export function countryOf(request) {
  const c = String((request.cf && request.cf.country) || request.headers.get('CF-IPCountry') || '').toUpperCase();
  return /^[A-Z]{2}$/.test(c) && c !== 'XX' && c !== 'T1' ? c : null;
}
export function deviceOf(request) {
  const ua = request.headers.get('User-Agent') || '';
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return ua ? 'desktop' : null;
}
// where the visit comes from (?ref=…, or the site that sent it, read by the page: src/app.js VISIT_REF)
export const SOURCE = /^[a-z0-9_-]{1,24}$/;

// Report of 7/11, n°1 and 2: where the visits come from and how far each source goes, in ANONYMOUS totals per day
// (daily_counts, like the other counters): « vs:<source>:<country> » for each new visit, « fs:<step>:<source> » for each
// step of the funnel (visit, export_ok, plans_open, checkout_open, checkout_done). The source is worked out by the page
// (src/app.js VISIT_SRC) from ?ref= / utm_source / the site that sent the visit, only for this tab; nothing ties it to a
// person, an account or a visit number. A known platform, ref:<code>, site:<domain> or direct.
export const SRC_PLATFORMS = ['tiktok', 'ig', 'yt', 'google', 'discord', 'triller', 'x', 'reddit', 'facebook', 'bing', 'direct', 'other'];
export const VISIT_SRC = /^(?:ref:[a-z0-9_-]{1,32}|site:[a-z0-9.-]{3,48})$/;
export const srcOf = (v) => (typeof v === 'string' && (SRC_PLATFORMS.includes(v) || VISIT_SRC.test(v)) ? v : null);
export const FUNNEL_STEPS = ['export_ok', 'plans_open', 'checkout_open', 'checkout_done'];
// where the payment window was closed without buying: right away / after typing the e-mail or country / after trying to pay
export const CLOSE_STAGES = ['start', 'details', 'payment'];

// POST /api/event {name, cat?, ios?, why?}: one step of the funnel. Unknown names are refused (400), so the table holds
// only the names above. Limited per connection (hashed, like the visits).
export async function event(request, env, excluded = null) {
  const body = await readJson(request, 512);
  const name = typeof body.name === 'string' && EVENTS.includes(body.name) ? body.name : null;
  if (!name) throw new HttpError(400, 'invalid_event', 'Unknown event name.');
  const ipKey = (await sha256Hex('ip:' + clientIp(request))).slice(0, 32);
  await limit(env, `event:ip:${ipKey}`, EVENTS_PER_IP_HOUR, 3600e3);
  await bump(env, 'ev_' + name);
  if (name === 'export_ok') await bumpHour(env, 'export_ok');   // the hour of the export (« Heure par heure »)
  if (body.ios === true) await bump(env, 'ios_' + name);   // the same step on an iPhone / iPad
  // « Combien de vidéos par personne » (5/11): the page's random visit number (vid) with the finished videos, per day; never
  // the account. The owner's and the test agents' accounts are left out (excluded(): read from the session, nothing kept).
  if ((name === 'export_ok' || name === 'ad_ok') && typeof body.vid === 'string' && VID.test(body.vid) && !(excluded && await excluded())) {
    await env.DB.prepare(
      'INSERT INTO video_counts (day, vid, name, n, ios) VALUES (?1, ?2, ?3, 1, ?4) ON CONFLICT(day, vid, name) DO UPDATE SET n = n + 1'
    ).bind(today(), body.vid, name, body.ios === true || deviceOf(request) === 'ios' ? 1 : 0).run()
      .catch((e) => console.error('[stalak] video count', e && e.message ? String(e.message).slice(0, 120) : 'error'));
  }
  if (name === 'export_fail' || name === 'export_retry' || name === 'export_saved' || name === 'export_refused') {
    const cat = EXPORT_FAIL.includes(body.cat) ? body.cat : 'other';
    if (name === 'export_fail') await bump(env, 'ev_export_fail_' + cat);
    else await bump(env, 'ev_' + name + '_' + cat);
    // the details (export_fail: what the person saw; export_retry: the first go of an export made again by itself)
    if (name === 'export_fail' || name === 'export_retry') {
      const p = name === 'export_fail' ? 'ev_xf_' : 'ev_xr_', dev = deviceOf(request) || 'desktop';
      const x = body.x && typeof body.x === 'object' && !Array.isArray(body.x) ? body.x : {};
      const names = ['dev_' + dev, dev + '_' + cat];
      for (const k in EXPORT_X) if (EXPORT_X[k].includes(x[k])) names.push(k + '_' + x[k]);
      for (const n of names) await bump(env, p + n);
    }
  }
  // the same device split for the starts and the videos made, so the dashboard can tell the share that fails on each device
  if (name === 'export_start' || name === 'export_ok') {
    const p = name === 'export_start' ? 'ev_xs_' : 'ev_xo_';
    await bump(env, p + (deviceOf(request) || 'desktop'));
    // (7/11, Clip mode) the kind of video: a 16:9 clip or a TikTok / Reels video
    if (body.cat === 'clip' || body.cat === 'reel') await bump(env, p + 'kind_' + body.cat);
  }
  if (name === 'clip_ask') await bump(env, 'ev_clip_ask_' + (['pro', 'reel', 'none'].includes(body.cat) ? body.cat : 'none'));
  if (name === 'plans_open' && typeof body.why === 'string') await bump(env, 'ev_plans_why_' + (EVENT_REASONS.includes(body.why) ? body.why : 'other'));
  // 7/11: the step of the funnel for its source (anonymous total), and where the payment window was closed without buying
  const src = srcOf(body.src);
  if (src && FUNNEL_STEPS.includes(name)) await bump(env, `fs:${name}:${src}`);
  if (name === 'checkout_close') await bump(env, 'ev_checkout_close_' + (CLOSE_STAGES.includes(body.stage) ? body.stage : 'start'));
  return json({ ok: true });
}

// POST /api/presence {vid, lang}: the page is open. One row per page load and per day, updated each minute.
export async function presence(request, env) {
  const body = await readJson(request, 1024);
  const vid = typeof body.vid === 'string' && VID.test(body.vid) ? body.vid : null;
  if (!vid) throw new HttpError(400, 'invalid_vid', 'vid: 16-40 letters, digits, - or _.');
  const lang = body.lang === 'fr' ? 'fr' : 'en';
  const source = typeof body.ref === 'string' && SOURCE.test(body.ref) ? body.ref : null;
  const back = body.back === true ? 1 : body.back === false ? 0 : null;
  const now = Date.now(), day = today(now);
  const row = await env.DB.prepare(
    `INSERT INTO visits (day, vid, first_at, last_at, lang, country, device, source, came_back) VALUES (?1, ?2, ?3, ?3, ?4, ?5, ?6, ?7, ?8)
     ON CONFLICT(day, vid) DO UPDATE SET last_at = ?3 WHERE visits.last_at < ?3 - ?9 RETURNING first_at`
  ).bind(day, vid, now, lang, countryOf(request), deviceOf(request), source, back, PRESENCE_GAP_MS).first();
  // audit of 6/11, point 3: a sign of life less than 4 minutes after the last one writes nothing (the page sends one every
  // 5 minutes): one visitor sending thousands of them can no longer use up the database's daily writes
  if (row && row.first_at === now) {
    // a new page load: limited per connection, so nobody can fill the table with made-up visits
    const ipKey = (await sha256Hex('ip:' + clientIp(request))).slice(0, 32);
    try {
      await limit(env, `visit:ip:${ipKey}`, NEW_VISITS_PER_IP_HOUR, 3600e3);
    } catch (e) {
      await env.DB.prepare('DELETE FROM visits WHERE day = ?1 AND vid = ?2').bind(day, vid).run();
      throw e;
    }
    // 7/11: the new visit in the anonymous totals of its source and its country (and the first step of the funnel)
    const src = srcOf(body.src) || 'direct', c = countryOf(request) || 'XX';
    await bump(env, `vs:${src}:${/^[A-Z]{2}$/.test(c) ? c : 'XX'}`);
    await bump(env, `fs:visit:${src}`);
    // old visits go now and then
    if (Math.random() < 0.01) {
      const old = today(now - VISITS_KEEP_DAYS * 864e5);
      await env.DB.prepare('DELETE FROM visits WHERE day < ?1').bind(old).run().catch(() => {});
      await env.DB.prepare('DELETE FROM video_counts WHERE day < ?1').bind(old).run().catch(() => {});
      await env.DB.prepare('DELETE FROM hourly_counts WHERE hour < ?1').bind(Math.floor((now - VISITS_KEEP_DAYS * 864e5) / 3600e3)).run().catch(() => {});
    }
  }
  return json({ ok: true, every: VISIT_EVERY_S });
}
