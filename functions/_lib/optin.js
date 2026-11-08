// Report of 7/11 (the owner's n°8): the e-mail of a free user, given freely at the end of a video.
//   POST /api/optin {email, consent: true, lang}: the box is not ticked beforehand; without consent → 400. A confirmation
//     e-mail with a link (double opt-in): the address counts only once the link is used. Same answer whether the address is
//     new, waiting or already confirmed (nobody can learn who is on the list).
//   GET  /api/optin/confirm?t=… : a small page with one button « Oui, je confirme » (a link opened by a mail scanner confirms
//     nothing); POST of that button → confirmed.
//   GET  /api/optin/stop?t=…    : a small page « Me désinscrire »; POST → the row is erased.
// Kept: the address, the language, the version of the accepted text, the dates. Nothing else (no account, no source, no
// country, no IP). Not confirmed after 7 days → erased; confirmed: erased 3 years after (retention.js). No mailing yet: only the
// collection (owner, 7/11).
import { HttpError, json, readJson, clientIp, appOrigin, isDev } from './http.js';
import { normalizeEmail } from './auth.js';
import { limit } from './ratelimit.js';
import { sha256Hex, randomBytes, toHex, randomId } from './crypto.js';
const randomHex = (n) => toHex(randomBytes(n));
import { mail } from './mail-layout.js';

export const OPTIN_CONSENT = 'v1-2026-11-07';
export const OPTIN_CONFIRM_DAYS = 7;
export const OPTIN_KEEP_MS = 3 * 365 * 864e5;
const FROM = 'Stalak <login@stalak.app>';

// the words of the box (the same in src/app.js « opt.* »): what is accepted, word for word, for the proof
export const OPTIN_TEXT = {
  fr: 'J’accepte de recevoir par e-mail des conseils pour mes vidéos et des nouvelles de Stalak (au plus 2 par mois). Je peux me désinscrire à tout moment avec le lien de chaque e-mail.',
  en: 'I agree to get tips for my videos and Stalak news by e-mail (2 a month at most). I can unsubscribe at any time with the link in each e-mail.',
};

const T = {
  en: { subject: 'Confirm your e-mail for Stalak tips', pre: 'One tap to confirm', title: 'One tap to confirm',
    intro: 'You asked to get tips for your next videos by e-mail. Tap the button to confirm it is really you.',
    button: 'Yes, I confirm', ignore: 'If it was not you, ignore this e-mail: you will get nothing else from us.',
    reason: 'This address was given on stalak.app to get tips by e-mail.', stop: 'Changed your mind?', stopLink: 'Unsubscribe' },
  fr: { subject: 'Confirme ton e-mail pour les conseils Stalak', pre: 'Une touche pour confirmer', title: 'Une touche pour confirmer',
    intro: 'Tu as demandé à recevoir des conseils pour tes prochaines vidéos par e-mail. Touche le bouton pour confirmer que c’est bien toi.',
    button: 'Oui, je confirme', ignore: 'Si ce n’est pas toi, ignore cet e-mail : tu ne recevras rien d’autre de notre part.',
    reason: 'Cette adresse a été donnée sur stalak.app pour recevoir des conseils par e-mail.', stop: 'Tu as changé d’avis ?', stopLink: 'Me désinscrire' },
};

export function optinEmail(lang, token, site) {
  const fr = lang === 'fr', t = fr ? T.fr : T.en, base = String(site || 'https://stalak.app').replace(/\/+$/, '');
  return mail({
    lang: fr ? 'fr' : 'en', site: base, subject: t.subject, preheader: t.pre, title: t.title, mascot: 'hello', reason: t.reason,
    blocks: [{ p: t.intro }, { button: { label: t.button, href: `${base}/api/optin/confirm?t=${token}` } }, { small: t.ignore },
      { small: `${t.stop} ${t.stopLink} : ${base}/api/optin/stop?t=${token}` }],
  });
}

export async function optinAsk(request, env) {
  const body = await readJson(request, 1024);
  if (body.consent !== true) throw new HttpError(400, 'consent_required', 'Tick the box to agree first.');
  const email = normalizeEmail(body.email);
  const lang = body.lang === 'fr' ? 'fr' : 'en';
  const ipKey = (await sha256Hex('ip:' + clientIp(request))).slice(0, 32), mKey = (await sha256Hex('optin:' + email)).slice(0, 32);
  await limit(env, `optin:ip:${ipKey}`, 5, 3600e3);
  await limit(env, `optin:mail:${mKey}`, 3, 864e5);
  const old = await env.DB.prepare('SELECT id, confirmed_at FROM email_optins WHERE email = ?1').bind(email).first();
  if (old && old.confirmed_at) return json({ ok: true, state: 'check_mail' });   // already on the list: same answer, no e-mail
  const token = randomHex(24), th = await sha256Hex('optin:' + token), now = Date.now();
  if (old) await env.DB.prepare('UPDATE email_optins SET token_hash = ?2, created_at = ?3, lang = ?4, consent = ?5 WHERE id = ?1').bind(old.id, th, now, lang, OPTIN_CONSENT).run();
  else await env.DB.prepare('INSERT INTO email_optins (id, email, lang, consent, token_hash, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)')
    .bind(randomId('opt_'), email, lang, OPTIN_CONSENT, th, now).run();
  const msg = optinEmail(lang, token, appOrigin(env));
  if (!env.RESEND_API_KEY) {
    if (isDev(env)) { console.log(`[stalak dev] opt-in link for ${email}: /api/optin/confirm?t=${token}`); return json({ ok: true, state: 'check_mail', devToken: token }); }
    throw new HttpError(500, 'email_not_configured', 'Email sending is not configured (RESEND_API_KEY).');
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST', headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: env.EMAIL_FROM || FROM, to: [email], subject: msg.subject, text: msg.text, html: msg.html }),
  }).catch(() => null);
  if (!res || !res.ok) throw new HttpError(502, 'email_failed', 'Could not send the email, try again in a moment.');
  return json({ ok: true, state: 'check_mail' });
}

// the small pages of the links (no script; one button that POSTs to the same address)
const PAGE = {
  confirm: { fr: ['Confirmer ton e-mail', 'Touche le bouton pour recevoir les conseils Stalak par e-mail.', 'Oui, je confirme'],
    en: ['Confirm your e-mail', 'Tap the button to get Stalak tips by e-mail.', 'Yes, I confirm'] },
  confirmed: { fr: ['C’est confirmé ✅', 'Merci ! Tu recevras nos conseils par e-mail. Tu peux te désinscrire à tout moment avec le lien de chaque e-mail.'],
    en: ['Confirmed ✅', 'Thanks! You will get our tips by e-mail. You can unsubscribe at any time with the link in each e-mail.'] },
  stop: { fr: ['Te désinscrire', 'Touche le bouton : ton adresse sera effacée et tu ne recevras plus rien.', 'Me désinscrire'],
    en: ['Unsubscribe', 'Tap the button: your address will be erased and you will get nothing more.', 'Unsubscribe'] },
  stopped: { fr: ['C’est fait', 'Ton adresse est effacée. Tu ne recevras plus rien.'], en: ['Done', 'Your address is erased. You will get nothing more.'] },
  bad: { fr: ['Lien expiré', 'Ce lien n’est plus valable. Tu peux redonner ton e-mail sur stalak.app.'], en: ['Link expired', 'This link no longer works. You can give your e-mail again on stalak.app.'] },
};
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function page(kind, lang, action = null) {
  const [title, text, button] = PAGE[kind][lang === 'fr' ? 'fr' : 'en'];
  const home = lang === 'fr' ? '/fr/' : '/';
  const html = `<!doctype html><html lang="${lang === 'fr' ? 'fr' : 'en'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>${esc(title)} · Stalak</title><style>
body{margin:0;font:17px/1.5 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#eaf4ff;color:#0a0d14;display:grid;place-items:center;min-height:100vh;padding:16px;box-sizing:border-box}
main{background:#fff;border:3px solid #0a0d14;border-radius:22px;padding:28px;max-width:440px;box-shadow:6px 6px 0 #0a0d14}
h1{margin:0 0 10px;font-size:26px}button{font:700 18px system-ui,sans-serif;background:#1f6fd6;color:#fff;border:3px solid #0a0d14;border-radius:14px;padding:12px 20px;cursor:pointer;min-height:48px}
a{color:#1f6fd6;font-weight:700}@media (prefers-color-scheme:dark){body{background:#0a0d14;color:#f2f6ff}main{background:#151b28;border-color:#f2f6ff;box-shadow:6px 6px 0 #1f6fd6}a{color:#8cc2ff}}
</style></head><body><main><h1>${esc(title)}</h1><p>${esc(text)}</p>${action ? `<form method="post" action="${esc(action)}"><button type="submit">${esc(button)}</button></form>` : `<p><a href="${home}">stalak.app</a></p>`}</main></body></html>`;
  return new Response(html, { status: kind === 'bad' ? 410 : 200, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store',
    'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
    'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer', 'X-Robots-Tag': 'noindex' } });
}

// GET shows the button, POST does it. kind: 'confirm' | 'stop'
export async function optinLink(request, env, kind) {
  const url = new URL(request.url), t = url.searchParams.get('t') || '';
  const row = /^[0-9a-f]{48}$/.test(t)
    ? await env.DB.prepare('SELECT id, lang, created_at, confirmed_at FROM email_optins WHERE token_hash = ?1').bind(await sha256Hex('optin:' + t)).first() : null;
  const lang = (row && row.lang) || (/^fr\b/i.test(request.headers.get('Accept-Language') || '') ? 'fr' : 'en');
  const expired = !row || (kind === 'confirm' && !row.confirmed_at && Date.now() - row.created_at > OPTIN_CONFIRM_DAYS * 864e5);
  if (expired) return page(kind === 'stop' && !row ? 'stopped' : 'bad', lang);
  if (request.method === 'GET') return page(kind === 'confirm' && row.confirmed_at ? 'confirmed' : kind, lang, kind === 'confirm' && row.confirmed_at ? null : `/api/optin/${kind}?t=${t}`);
  if (kind === 'confirm') {
    await env.DB.prepare('UPDATE email_optins SET confirmed_at = COALESCE(confirmed_at, ?2) WHERE id = ?1').bind(row.id, Date.now()).run();
    return page('confirmed', lang);
  }
  await env.DB.prepare('DELETE FROM email_optins WHERE id = ?1').bind(row.id).run();
  return page('stopped', lang);
}

// retention.js: not confirmed after 7 days, or confirmed more than 3 years ago → erased
export async function purgeOptins(env, now = Date.now()) {
  const r = await env.DB.prepare('DELETE FROM email_optins WHERE (confirmed_at IS NULL AND created_at < ?1) OR (confirmed_at IS NOT NULL AND confirmed_at < ?2)')
    .bind(now - OPTIN_CONFIRM_DAYS * 864e5, now - OPTIN_KEEP_MS).run();
  return (r.meta && r.meta.changes) || 0;
}
