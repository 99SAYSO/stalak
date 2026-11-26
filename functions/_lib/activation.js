// « Le wow en moins d'une minute » (Comptes, 26/11, docs/handoff/chef-activation-rapide.md, points 6 and 7).
// 6. The funnel per step of the editor (anonymous): visits → song → passage → 1st take → 3rd take → preview (the « wow ») →
//    lyrics → export started → export done, on 7 or 30 days, all devices or iPhone / Android / computer; the step that loses the
//    most; the median time from the arrival to the wow. From metrics.js (st:<step>:<device>, wow_times) and the visits table.
// 7. The reminder of an unfinished project: an account that filmed takes and made no video in the next 24 hours gets ONE e-mail
//    (« Tes 3 prises t'attendent ») with a link that reopens the project — only if it accepted the tips e-mails (box not ticked
//    beforehand, users.email_tips = 1, or a confirmed address of the end-of-video form), and once per account (users.nudged_at).
//    Off until NUDGE_EMAIL = "1" (wrangler.toml), after Juridique's check. One-click unsubscribe in every e-mail.
import { HttpError, appOrigin, isDev } from './http.js';
import { STEPS, DEVICES, today } from './metrics.js';
import { mail, homeOf } from './mail-layout.js';
import { hmacSha256Hex } from './crypto.js';

const DAY = 864e5;
export const NUDGE_AFTER_MS = 24 * 3600e3;    // 24 h after the last takes without a video
export const NUDGE_WINDOW_MS = 72 * 3600e3;   // not for takes older than 3 days (never a late e-mail)
// the words of the box (the same in src/app.js), kept with the answer as proof
export const TIPS_CONSENT = 'v1-2026-11-26';
export const TIPS_TEXT = {
  fr: 'M’envoyer un rappel si je laisse un montage pas fini, et des conseils pour mes vidéos (au plus 2 e-mails par mois). Je peux me désinscrire à tout moment.',
  en: 'Send me a reminder if I leave an edit unfinished, and tips for my videos (2 e-mails a month at most). I can unsubscribe at any time.',
};

// ---- 6. the funnel per step ---------------------------------------------------------------------------------------------
export async function stepsStats(env, days = 7, device = 'all', now = Date.now()) {
  days = [7, 30].includes(days) ? days : 7;
  const devs = DEVICES.includes(device) ? [device] : DEVICES;
  const from = today(now - (days - 1) * DAY);
  const names = STEPS.flatMap((s) => devs.map((d) => `st:${s}:${d}`));
  const [c, v, w] = await env.DB.batch([
    env.DB.prepare(`SELECT name, SUM(n) AS n FROM daily_counts WHERE day >= ?1 AND name IN (${names.map((_, i) => '?' + (i + 2)).join(',')}) GROUP BY name`).bind(from, ...names),
    env.DB.prepare(`SELECT COUNT(*) AS n FROM visits WHERE day >= ?1 ${devs.length === 1 ? 'AND device = ?2' : ''}`).bind(from, ...(devs.length === 1 ? devs : [])),
    env.DB.prepare(`SELECT secs FROM wow_times WHERE day >= ?1 AND device IN (${devs.map((_, i) => '?' + (i + 2)).join(',')}) ORDER BY secs`).bind(from, ...devs),
  ]);
  const by = {};
  for (const r of c.results || []) { const step = r.name.split(':')[1]; by[step] = (by[step] || 0) + r.n; }
  const steps = [{ step: 'visit', n: (v.results && v.results[0] && v.results[0].n) || 0 }, ...STEPS.map((s) => ({ step: s, n: by[s] || 0 }))];
  // the share of the step before (lyrics is optional: the export steps are compared with the preview)
  let worst = null;
  steps.forEach((s, i) => {
    if (!i) return;
    const prev = s.step === 'step_export_start' ? steps.find((x) => x.step === 'step_preview') : steps[i - 1];
    s.fromPrev = prev && prev.n ? Math.round(s.n / prev.n * 1000) / 10 : null;
    s.optional = s.step === 'step_lyrics';
    if (!s.optional && prev && prev.n > 0 && s.n < prev.n && (worst === null || s.fromPrev < steps[worst].fromPrev)) worst = i;
  });
  if (worst !== null) steps[worst].worst = true;
  const secs = (w.results || []).map((r) => r.secs);
  const q = (p) => (secs.length ? secs[Math.min(secs.length - 1, Math.floor(p * (secs.length - 1) + 0.5))] : null);
  return { days, device: devs.length === 1 ? devs[0] : 'all', steps,
    wow: { count: secs.length, median: q(0.5), p25: q(0.25), p75: q(0.75), under60: secs.filter((x) => x <= 60).length } };
}

// ---- 7. the consent to the tips e-mails ---------------------------------------------------------------------------------
// PUT /api/account/emails {tips: true|false, lang}: the box under the takes / in the account (never ticked beforehand)
export async function saveTips(env, user, b, now = Date.now()) {
  if (typeof b.tips !== 'boolean') throw new HttpError(400, 'bad_tips', 'tips must be true or false.');
  const lang = b.lang === 'fr' ? 'fr' : 'en';
  await env.DB.prepare('UPDATE users SET email_tips = ?2, email_tips_at = ?3, email_tips_text = ?4 WHERE id = ?1')
    .bind(user.id, b.tips ? 1 : 0, now, b.tips ? TIPS_CONSENT + ':' + lang : null).run();
  return { tips: b.tips };
}
// the unsubscribe link is signed with the server's secret (AUTH_SECRET): nobody can unsubscribe someone else
async function unsubToken(env, userId) {
  if (!env.AUTH_SECRET) throw new HttpError(500, 'server_misconfigured', 'AUTH_SECRET is missing.');
  return (await hmacSha256Hex(env.AUTH_SECRET, 'nudge-stop:' + userId)).slice(0, 40);
}
export async function nudgeStopLink(env, userId) {
  return appOrigin(env) + '/api/emails/stop?u=' + encodeURIComponent(userId) + '&t=' + await unsubToken(env, userId);
}
// GET: a small page with one button (a mail scanner opening the link changes nothing); POST (the button, or the mail app's
// one-click « List-Unsubscribe-Post »): no more tips e-mails for this account
export async function emailsStop(request, env) {
  const url = new URL(request.url), u = url.searchParams.get('u') || '', t = url.searchParams.get('t') || '';
  const ok = /^[A-Za-z0-9_-]{6,64}$/.test(u) && /^[0-9a-f]{40}$/.test(t) && t === await unsubToken(env, u);
  const row = ok ? await env.DB.prepare('SELECT lang FROM users WHERE id = ?1').bind(u).first() : null;
  const fr = row ? row.lang === 'fr' : /^fr\b/i.test(request.headers.get('Accept-Language') || '');
  if (row && request.method === 'POST') await env.DB.prepare('UPDATE users SET email_tips = 0, email_tips_at = ?2 WHERE id = ?1').bind(u, Date.now()).run();
  const done = !row || request.method === 'POST';
  const title = !row ? (fr ? 'Lien expiré' : 'Link expired') : done ? (fr ? 'C’est fait' : 'Done') : (fr ? 'Ne plus recevoir d’e-mails de conseils' : 'Stop the tips e-mails');
  const text = !row ? (fr ? 'Ce lien ne marche plus. Tu peux régler les e-mails dans ton compte Stalak.' : 'This link no longer works. You can set the e-mails in your Stalak account.')
    : done ? (fr ? 'Tu ne recevras plus d’e-mails de conseils ni de rappels de Stalak.' : 'You will get no more tips or reminder e-mails from Stalak.')
    : (fr ? 'Tu ne recevras plus de rappels ni de conseils par e-mail. Les e-mails de ton compte (codes de connexion, paiements) continuent.' : 'You will get no more reminders or tips by e-mail. Your account e-mails (sign-in codes, payments) go on.');
  const esc = (x) => String(x).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const form = done ? '' : `<form method="post"><button type="submit">${fr ? 'Me désinscrire' : 'Unsubscribe'}</button></form>`;
  const html = `<!doctype html><html lang="${fr ? 'fr' : 'en'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Stalak</title>
<style>body{margin:0;font:17px/1.5 system-ui,sans-serif;background:#d6ecff;color:#0a0d14;display:grid;place-items:center;min-height:100vh;padding:16px;box-sizing:border-box}
main{background:#fff;border:3px solid #0a0d14;border-radius:20px;box-shadow:6px 6px 0 #0a0d14;max-width:440px;padding:24px}h1{margin:0 0 8px;font-size:22px}
button{font:inherit;font-weight:700;background:#1f6fd6;color:#fff;border:3px solid #0a0d14;border-radius:14px;padding:12px 18px;min-height:48px;cursor:pointer}</style></head>
<body><main><h1>${esc(title)}</h1><p>${esc(text)}</p>${form}</main></body></html>`;
  return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex',
    'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'", 'Referrer-Policy': 'no-referrer' } });
}

// ---- 7. the reminder ----------------------------------------------------------------------------------------------------
export function nudgeEmail(env, lang, { three, link, stop }) {
  const fr = lang === 'fr', site = appOrigin(env);
  const blocks = fr ? [
    { p: three ? 'Tu as filmé tes 3 prises hier. Ton snippet est à un clic : Stalak a déjà tout ce qu’il faut pour le monter sur ton son.' : 'Tu as commencé à filmer hier. Ton snippet est presque prêt : il reste à finir tes prises et Stalak le monte sur ton son.' },
    { p: 'Ouvre le lien sur le téléphone où tu as filmé : tes prises y sont gardées, rien n’a été envoyé.' },
    { button: { href: link, label: 'Reprendre mon snippet' } },
    { small: 'C’est le seul rappel pour ce montage. Tu ne veux plus de rappels ni de conseils ? Me désinscrire : ' + stop },
  ] : [
    { p: three ? 'You filmed your 3 takes yesterday. Your snippet is one tap away: Stalak already has everything it needs to edit it to your song.' : 'You started filming yesterday. Your snippet is almost ready: finish your takes and Stalak edits it to your song.' },
    { p: 'Open the link on the phone you filmed with: your takes are kept there, nothing was uploaded.' },
    { button: { href: link, label: 'Finish my snippet' } },
    { small: 'This is the only reminder for this edit. No more reminders or tips? Unsubscribe: ' + stop },
  ];
  return mail({
    lang: fr ? 'fr' : 'en', site,
    subject: fr ? (three ? 'Tes 3 prises t’attendent' : 'Ton snippet t’attend') : (three ? 'Your 3 takes are waiting' : 'Your snippet is waiting'),
    preheader: fr ? 'Ton snippet est à un clic.' : 'Your snippet is one tap away.',
    title: fr ? 'Ton snippet est à un clic' : 'Your snippet is one tap away', mascot: 'hello', blocks,
    reason: fr ? 'Tu as accepté de recevoir un rappel si tu laisses un montage pas fini.' : 'You agreed to get a reminder if you leave an edit unfinished.',
  });
}
async function sendNudge(env, to, msg, stop) {
  if (!env.RESEND_API_KEY) {
    if (isDev(env)) { console.log(`[stalak dev] project reminder for ${to}: ${msg.subject}`); return true; }
    return false;
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST', signal: AbortSignal.timeout(10000),
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: env.EMAIL_FROM || 'Stalak <login@stalak.app>', to: [to], reply_to: 'contact@stalak.app',
      subject: msg.subject, text: msg.text, html: msg.html,
      headers: { 'List-Unsubscribe': `<${stop}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' } }),
  });
  return res.ok;
}
// Daily tasks (cloud.js maybeCleanup, the cron route, the Worker): the accounts to remind, 20 at most per run
export async function projectNudges(env, now = Date.now(), { max = 20 } = {}) {
  const out = { nudged: 0 };
  if (String(env.NUDGE_EMAIL || '') !== '1') return { nudged: 'off' };
  const { results } = await env.DB.prepare(`
    SELECT u.id, u.email, u.lang, MAX(t.last_at) AS takes_at, MAX(CASE WHEN t.name = 'takes3' THEN 1 ELSE 0 END) AS three
      FROM user_day_counts t JOIN users u ON u.id = t.user_id
     WHERE t.name IN ('takes', 'takes3') AND t.day >= ?3 AND u.nudged_at IS NULL
       AND (u.email_tips = 1 OR (u.email_tips IS NULL AND EXISTS (SELECT 1 FROM email_optins o WHERE o.email = u.email AND o.confirmed_at IS NOT NULL)))
     GROUP BY u.id
    HAVING takes_at <= ?1 AND takes_at >= ?2
       AND NOT EXISTS (SELECT 1 FROM user_day_counts e WHERE e.user_id = u.id AND e.name = 'export_ok' AND e.last_at >= takes_at)
     LIMIT ?4`).bind(now - NUDGE_AFTER_MS, now - NUDGE_WINDOW_MS, today(now - 4 * DAY), max).all();
  for (const r of results) {
    // claimed before sending: two runs at once send one e-mail
    const c = await env.DB.prepare('UPDATE users SET nudged_at = ?2 WHERE id = ?1 AND nudged_at IS NULL').bind(r.id, now).run();
    if (!(c.meta && c.meta.changes === 1)) continue;
    const lang = r.lang === 'fr' ? 'fr' : 'en', stop = await nudgeStopLink(env, r.id);
    const link = homeOf(appOrigin(env), lang) + '?resume=1&utm_source=email&utm_medium=email&utm_campaign=relance-projet';
    let ok = false;
    try { ok = await sendNudge(env, r.email, nudgeEmail(env, lang, { three: !!r.three, link, stop }), stop); } catch { ok = false; }
    if (!ok) { await env.DB.prepare('UPDATE users SET nudged_at = NULL WHERE id = ?1').bind(r.id).run(); continue; }
    out.nudged++;
  }
  return out;
}
