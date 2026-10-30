// The free video of the day, and the reminder e-mail « Ta vidéo gratuite du jour est disponible » (offer of 30/10/2026).
//
// POST /api/videos/claim {video}      the page asks before exporting. Free plan: 1 video per Paris day (the counter starts
//                                     again at midnight, Paris time), an account is needed. Answers the « jeton du jour »,
//                                     or 429 daily_video_used with nextAt. The same video may be exported again that day
//                                     (an export that failed or was cancelled is not lost). Paid plans: {unlimited: true}.
// GET  /api/reminders/stop?u=&t=      unsubscribes at once, without signing in (conditions: the link stops it right away)
// POST /api/reminders/stop?u=&t=      the same, for the « one click » of the mail app (RFC 8058)
// Reminders: at most 1 a day, only the day after a video made on the free plan, never after 7 days without a visit, and
// only to accounts that ticked the box (sign-up or account page). Sent from 10:00 to 21:00, Paris time, by the
// scheduled Worker (workers/cloud-cleanup), POST /api/cron/reminders, or lazily after the site's own requests.
import { HttpError, json, readJson } from './http.js';
import { requireUser } from './auth.js';
import { planFor, planHas } from './entitlements.js';
import { limit, hit } from './ratelimit.js';
import { randomToken, timingSafeEqual } from './crypto.js';
import { bump } from './metrics.js';

const DAY = 24 * 3600e3;
export const QUIET_DAYS = 7;                 // no reminder after 7 days without a visit
export const SEND_FROM_H = 10, SEND_UNTIL_H = 21;
export const REMINDERS_EVERY_MS = 20 * 60e3; // the lazy run: at most every 20 minutes
export const FREE_VIDEOS_KEEP_DAYS = 100;    // the daily counter rows are erased after 100 days (the dashboard shows 90)
const VIDEO = /^[A-Za-z0-9_-]{8,40}$/;
const USER_ID = /^u_[A-Za-z0-9_-]{8,64}$/;
const SITE = 'https://stalak.app';
const FROM = 'Stalak <login@stalak.app>';

// ---- Paris time -------------------------------------------------------------------------------------------------------
const PARIS = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23' });
export function parisParts(now = Date.now()) {
  const p = {};
  for (const x of PARIS.formatToParts(new Date(now))) p[x.type] = x.value;
  return { day: `${p.year}-${p.month}-${p.day}`, hour: Number(p.hour) };
}
export const parisDay = (now = Date.now()) => parisParts(now).day;
const shiftDay = (day, n) => new Date(Date.parse(day + 'T12:00:00Z') + n * DAY).toISOString().slice(0, 10);
// The next midnight in Paris (UTC+1 in winter, UTC+2 in summer: the one of the two that is midnight that day).
export function nextParisMidnight(now = Date.now()) {
  const next = shiftDay(parisDay(now), 1);
  for (const off of [1, 2]) {
    const t = Date.parse(next + 'T00:00:00Z') - off * 3600e3;
    if (parisDay(t) === next && parisDay(t - 1) !== next) return t;
  }
  return Date.parse(next + 'T00:00:00Z') - 3600e3;
}

// ---- the unsubscribe link: a random key per account, kept in D1 (no server secret needed) ------------------------------
const STOP_KEY = /^[A-Za-z0-9_-]{32,64}$/;
export async function stopUrl(env, userId) {
  await env.DB.prepare('UPDATE users SET reminder_key = ?2 WHERE id = ?1 AND reminder_key IS NULL').bind(userId, randomToken(24)).run();
  const r = await env.DB.prepare('SELECT reminder_key FROM users WHERE id = ?1').bind(userId).first();
  return `${SITE}/api/reminders/stop?u=${encodeURIComponent(userId)}&t=${encodeURIComponent(r.reminder_key)}`;
}

// A visit while signed in: at most one write per hour (the reminders stop after 7 days without one).
export async function seen(env, user, now = Date.now()) {
  if (!user || (user.last_seen_at && user.last_seen_at > now - 3600e3)) return;
  try {
    await env.DB.prepare('UPDATE users SET last_seen_at = ?2 WHERE id = ?1').bind(user.id, now).run();
  } catch (e) { console.error('[stalak] last seen', e && e.message ? String(e.message).slice(0, 120) : 'error'); }
}

// ---- POST /api/videos/claim ---------------------------------------------------------------------------------------------
export async function claimVideo(request, env, now = Date.now()) {
  const user = await requireUser(request, env);
  const body = await readJson(request, 1024);
  const video = typeof body.video === 'string' && VIDEO.test(body.video) ? body.video : null;
  if (!video) throw new HttpError(400, 'invalid_video', 'video: 8-40 letters, digits, - or _.');
  await seen(env, user, now);
  const { plan } = await planFor(env, user);
  if (planHas(plan, 'unlimited')) return json({ ok: true, unlimited: true, plan });
  await limit(env, `video:${user.id}`, 60, 3600e3, 'Too many requests, try again later.');

  const day = parisDay(now), nextAt = new Date(nextParisMidnight(now)).toISOString();
  // one statement: the first video of the day wins, even with two exports started at the same time
  await env.DB.prepare('INSERT INTO free_videos (user_id, day, video, token, created_at) VALUES (?1, ?2, ?3, ?4, ?5) ON CONFLICT(user_id, day) DO NOTHING')
    .bind(user.id, day, video, randomToken(18), now).run();
  const row = await env.DB.prepare('SELECT video, token, created_at FROM free_videos WHERE user_id = ?1 AND day = ?2').bind(user.id, day).first();
  if (!row || row.video !== video) {
    throw new HttpError(429, 'daily_video_used', 'Your free video of the day is used. The next one comes at midnight (Paris time).',
      { nextAt, plan: 'free' });
  }
  if (row.created_at === now) await bump(env, 'free_video');
  return json({ ok: true, unlimited: false, plan: 'free', day, token: row.token, nextAt });
}

// What the account page shows: the free video of today is used or not, and when the next one comes.
export async function freeVideoState(env, user, now = Date.now()) {
  if (!user) return null;
  const day = parisDay(now);
  const row = await env.DB.prepare('SELECT 1 AS used FROM free_videos WHERE user_id = ?1 AND day = ?2').bind(user.id, day).first();
  return { usedToday: !!row, nextAt: new Date(nextParisMidnight(now)).toISOString() };
}

// ---- the consent: the exact words of the box (the page shows the same), kept as proof with the date and the language ------
// (kept in profile.js: REMINDER_BOX, reminderProof)
export { REMINDER_BOX, reminderProof } from './profile.js';

// ---- the reminder e-mail (nothing else in it: no offer, as the box says) -------------------------------------------------
const TEXTS = {
  fr: {
    subject: 'Ta vidéo gratuite du jour est disponible',
    hello: 'Salut !',
    body: 'Ta vidéo gratuite du jour t’attend sur Stalak : importe ton son, tes prises, et Stalak monte tout sur le rythme.',
    cta: 'Faire ma vidéo du jour',
    why: 'Tu reçois cet e-mail parce que tu as coché « Me prévenir par e-mail quand ma vidéo du jour est disponible ». Au plus un par jour, seulement le lendemain d’une vidéo gratuite.',
    stop: 'Ne plus recevoir ce rappel',
  },
  en: {
    subject: 'Your free video of the day is ready',
    hello: 'Hey!',
    body: 'Your free video of the day is waiting on Stalak: drop in your song and your takes, and Stalak cuts it all on the beat.',
    cta: 'Make my video of the day',
    why: 'You get this email because you ticked “Email me when my video of the day is ready”. At most one a day, only the day after a free video.',
    stop: 'Stop this reminder',
  },
};
export function reminderEmail(lang, stop) {
  const en = lang === 'en', t = en ? TEXTS.en : TEXTS.fr;
  const go = SITE + (en ? '/en/' : '/') + '?ref=reminder';
  const text = `${t.hello}\n\n${t.body}\n\n${t.cta} : ${go}\n\n—\n${t.why}\n${t.stop} : ${stop}\n\nStalak — stalak.app`;
  const html = `<!doctype html><html lang="${en ? 'en' : 'fr'}"><body style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#0a0d14;padding:24px;max-width:520px">
<p style="font-size:18px;font-weight:700">${t.hello}</p>
<p>${t.body}</p>
<p style="margin:24px 0"><a href="${go}" style="background:#0a0d14;color:#fff;text-decoration:none;padding:12px 20px;border-radius:12px;font-weight:700;display:inline-block">${t.cta}</a></p>
<p style="color:#666;font-size:12px;margin-top:32px">${t.why}<br><a href="${stop}" style="color:#666">${t.stop}</a></p>
<p style="color:#888;font-size:12px">Stalak — <a href="${SITE}" style="color:#888">stalak.app</a></p>
</body></html>`;
  return { subject: t.subject, text, html };
}

async function sendReminder(env, user) {
  const stop = await stopUrl(env, user.id);
  const msg = reminderEmail(user.lang, stop);
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: env.EMAIL_FROM || FROM, to: [user.email], subject: msg.subject, text: msg.text, html: msg.html,
      // unsubscribe from the mail app itself (Gmail, Apple Mail): RFC 2369 + one click, RFC 8058
      headers: { 'List-Unsubscribe': `<${stop}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' } }),
  });
  if (!res.ok) throw new Error('Resend ' + res.status);
}

// Sends the reminders due now. Returns {sent, skipped, failed}. Outside 10:00-21:00 (Paris), does nothing.
export async function sendReminders(env, now = Date.now(), { max = 50 } = {}) {
  const out = { sent: 0, skipped: 0, failed: 0 };
  const { day, hour } = parisParts(now);
  // keep the counter only as long as needed
  await env.DB.prepare('DELETE FROM free_videos WHERE day < ?1').bind(shiftDay(day, -FREE_VIDEOS_KEEP_DAYS)).run();
  if (hour < SEND_FROM_H || hour >= SEND_UNTIL_H || !env.RESEND_API_KEY) return { ...out, idle: true };
  const yesterday = shiftDay(day, -1);
  const { results } = await env.DB.prepare(
    `SELECT u.id, u.email, u.lang, u.reminder_day FROM users u
       JOIN free_videos f ON f.user_id = u.id AND f.day = ?1
     WHERE u.reminders = 1 AND u.email_verified_at IS NOT NULL
       AND (u.reminder_day IS NULL OR u.reminder_day < ?2)
       AND COALESCE(u.last_seen_at, u.last_login_at, u.created_at) >= ?3
       AND NOT EXISTS (SELECT 1 FROM free_videos g WHERE g.user_id = u.id AND g.day = ?2)
     LIMIT ?4`
  ).bind(yesterday, day, now - QUIET_DAYS * DAY, max).all();
  for (const u of results) {
    // still on the free plan (no reminder for a subscriber)
    const { plan } = await planFor(env, u);
    if (planHas(plan, 'unlimited')) { out.skipped++; continue; }
    // taken first, so two runs at the same time never send it twice
    const take = await env.DB.prepare('UPDATE users SET reminder_day = ?2 WHERE id = ?1 AND (reminder_day IS NULL OR reminder_day < ?2) AND reminders = 1')
      .bind(u.id, day).run();
    if (!take.meta || take.meta.changes !== 1) { out.skipped++; continue; }
    try { await sendReminder(env, u); out.sent++; } catch (e) {
      out.failed++;
      console.error('[stalak] reminder', e && e.message ? String(e.message).slice(0, 120) : 'error');
    }
  }
  if (out.sent) await bump(env, 'reminder', out.sent);
  return out;
}

// After the site's own requests (GET /api/config): at most every 20 minutes, a few reminders, in the background.
export async function maybeReminders(env, ctx, now = Date.now()) {
  try {
    const { hour } = parisParts(now);
    if (hour < SEND_FROM_H || hour >= SEND_UNTIL_H || !env.RESEND_API_KEY) return false;
    const r = await hit(env, 'cron:reminders', REMINDERS_EVERY_MS, now);
    if (r.count !== 1) return false;
    const p = sendReminders(env, now, { max: 20 }).catch((e) => console.error('[stalak] reminders', e && e.stack ? e.stack : e));
    if (ctx && typeof ctx.waitUntil === 'function') ctx.waitUntil(p); else await p;
    return true;
  } catch (e) {
    console.error('[stalak] reminders', e);
    return false;
  }
}

// ---- unsubscribe ----------------------------------------------------------------------------------------------------------
const STOP_TEXTS = {
  fr: { title: 'Rappel Stalak',
    done: 'C’est fait : tu ne recevras plus le rappel « Ta vidéo gratuite du jour est disponible ».', again: 'Tu peux les remettre à tout moment dans ton compte.', bad: 'Ce lien n’est pas valable.', back: 'Retour sur Stalak' },
  en: { title: 'Stalak reminder',
    done: 'Done: you won’t get the “Your free video of the day is ready” reminder anymore.', again: 'You can turn them back on any time in your account.', bad: 'This link is not valid.', back: 'Back to Stalak' },
};
function stopPage(lang, inner, status = 200) {
  const t = lang === 'en' ? STOP_TEXTS.en : STOP_TEXTS.fr;
  const html = `<!doctype html><html lang="${lang === 'en' ? 'en' : 'fr'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>${t.title}</title>
<style>body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#2f7de1;color:#0a0d14;display:grid;place-items:center;min-height:100vh;padding:16px;box-sizing:border-box}
main{background:#fff;border:3px solid #0a0d14;border-radius:22px;padding:28px;max-width:420px;width:100%;box-sizing:border-box;text-align:center}
h1{font-size:22px;margin:0 0 12px}p{line-height:1.5}button{font:inherit;font-weight:700;background:#0a0d14;color:#fff;border:0;border-radius:14px;padding:12px 22px;min-height:44px;cursor:pointer}
a{color:#0a0d14}</style></head><body><main><h1>${t.title}</h1>${inner(t)}<p><a href="${SITE}${lang === 'en' ? '/en/' : '/'}">${t.back}</a></p></main></body></html>`;
  return new Response(html, { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store',
    'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; form-action 'none'; base-uri 'none'; frame-ancestors 'none'",
    'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer', 'X-Robots-Tag': 'noindex' } });
}

export async function remindersStop(request, env, method) {
  if (method !== 'GET' && method !== 'POST') throw new HttpError(405, 'method_not_allowed', 'Method not allowed.');
  const url = new URL(request.url);
  const uid = url.searchParams.get('u') || '', sig = url.searchParams.get('t') || '';
  const row = USER_ID.test(uid) && STOP_KEY.test(sig) ? await env.DB.prepare('SELECT id, lang, reminder_key FROM users WHERE id = ?1').bind(uid).first() : null;
  const u = row && row.reminder_key && timingSafeEqual(row.reminder_key, sig) ? row : null;
  const lang = (u && u.lang) || (/^en\b/i.test(request.headers.get('Accept-Language') || '') ? 'en' : 'fr');
  if (!u) return stopPage(lang, (t) => `<p>${t.bad}</p>`, 404);
  // opening the link is enough (the conditions ask for it to stop at once); turning it back on is in the account page
  await env.DB.prepare('UPDATE users SET reminders = 0 WHERE id = ?1').bind(uid).run();
  return stopPage(lang, (t) => `<p>${t.done}</p><p>${t.again}</p>`);
}
