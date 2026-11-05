// The thank-you e-mail after a new subscription (owner's request of 5/11). Personal, not an ad: plain text (and the same
// text as plain HTML paragraphs), sent as « 99sayso de Stalak », replies to contact@stalak.app (the owner's Gmail).
// When: the same trigger as the Telegram notice (a new subscription, never a renewal), real payments only (never sandbox),
// once per person: once per account (users.thanked_at) and once per e-mail address (a key in webhook_events, kept when
// an account is deleted and made again). The 3 first customers are marked by migration 0012 (the owner writes to them).
// Sent about 3 hours after the purchase with Resend's scheduled sending (scheduled_at), after the answer to Paddle:
// it never blocks nor fails the webhook. Not sent → the marks are taken back, the next subscription event tries again.
// resend.com/docs/api-reference/emails/send-email (scheduled_at, reply_to, Idempotency-Key)
import { sha256Hex } from './crypto.js';
import { normPlan } from './entitlements.js';
import { isDev } from './http.js';

export const THANKS_FROM = '99sayso de Stalak <99sayso@stalak.app>';
export const THANKS_REPLY_TO = 'contact@stalak.app';
export const THANKS_DELAY_MS = 3 * 3600e3;
const PLAN_NAME = { pro: 'Stalak Pro', creator: 'Creator Plus' };

const TEXT = {
  en: (plan, year) => ({
    subject: 'Thank you, from 99sayso',
    lines: [
      'Hey,',
      `I’m 99sayso, the rapper who built Stalak. I just saw you took ${plan}${year ? ' for a full year' : ''}, and honestly it made my day. You’re one of the very first people to support it, so thank you.`,
      'Quick question, if you have 2 minutes (just hit reply, even a few words is perfect):',
      ['How did you find Stalak?', `What made you go for ${plan}?`, 'Is there anything that bugged you, or something you wish Stalak could do?'],
      'I read every reply myself, and I’ll use what you tell me to decide what to build next.',
      'And if you post something made with Stalak, send me the link, I’d love to see it.',
      'Thanks again,\n99sayso\n— Stalak, stalak.app',
    ],
  }),
  fr: (plan, year) => ({
    subject: 'Merci, de la part de 99sayso',
    lines: [
      'Salut,',
      `C’est 99sayso, le rappeur qui a créé Stalak. Je viens de voir que tu as pris ${plan}${year ? ' pour un an entier' : ''}, et franchement, ça m’a fait ma journée. Tu fais partie des toutes premières personnes à soutenir Stalak, alors merci.`,
      'Petite question, si tu as 2 minutes (réponds simplement à ce mail, même quelques mots, c’est parfait) :',
      ['Comment tu as découvert Stalak ?', `Qu’est-ce qui t’a donné envie de prendre ${plan} ?`, 'Est-ce qu’il y a un truc qui t’a embêté, ou quelque chose que tu aimerais que Stalak sache faire ?'],
      'Je lis chaque réponse moi-même, et je m’en servirai pour décider de ce que je construis ensuite.',
      'Et si tu publies quelque chose fait avec Stalak, envoie-moi le lien, j’adorerais voir ça.',
      'Encore merci,\n99sayso\n— Stalak, stalak.app',
    ],
  }),
};

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// { subject, text, html } for lang 'fr' | 'en', plan 'pro' | 'creator', interval 'month' | 'year'
export function thanksEmail(lang, plan, interval) {
  const l = lang === 'fr' ? 'fr' : 'en';
  const t = TEXT[l](PLAN_NAME[normPlan(plan)] || PLAN_NAME.pro, interval === 'year');
  const text = t.lines.map((x) => (Array.isArray(x) ? x.map((q, i) => `${i + 1}. ${q}`).join('\n') : x)).join('\n\n') + '\n';
  // the look of an e-mail typed by hand: the reader's own font, no colours, no pictures, no button
  const html = `<!doctype html><html lang="${l}"><head><meta charset="utf-8"></head><body>` + t.lines.map((x) => (Array.isArray(x)
    ? `<ol>${x.map((q) => `<li>${esc(q)}</li>`).join('')}</ol>`
    : `<p>${esc(x).replace(/\n/g, '<br>').replace('stalak.app', '<a href="https://stalak.app">stalak.app</a>')}</p>`)).join('') + '</body></html>';
  return { subject: t.subject, text, html };
}

// one e-mail with Resend; at = when (ms) or null for now. true when Resend took it. Never throws.
export async function sendThanks(env, to, msg, { at = null, key = null } = {}) {
  if (!env.RESEND_API_KEY) {
    if (isDev(env)) { console.log(`[stalak dev] thank-you mail to ${to}: ${msg.subject}`); return true; }
    return false;
  }
  const body = { from: THANKS_FROM, to: [to], reply_to: THANKS_REPLY_TO, subject: msg.subject, text: msg.text, html: msg.html };
  if (at) body.scheduled_at = new Date(at).toISOString();
  const headers = { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' };
  if (key) headers['Idempotency-Key'] = key;
  try {
    const res = await fetch('https://api.resend.com/emails', { method: 'POST', headers, body: JSON.stringify(body) });
    if (!res.ok) console.warn('[stalak] thank-you mail', res.status);
    return res.ok;
  } catch {
    console.warn('[stalak] thank-you mail unreachable');
    return false;
  }
}

// Called by the Paddle webhook (with the Telegram notice) for a NEW subscription. info: {plan, interval, userId, live}.
// Returns 'sent' | 'skipped:<why>' (for the tests); never throws.
export async function thanksAfterPurchase(env, info, now = Date.now()) {
  try {
    if (!info.live) return 'skipped:sandbox';
    if (!info.userId) return 'skipped:no_account';
    const u = await env.DB.prepare('SELECT email, lang, thanked_at FROM users WHERE id = ?1').bind(info.userId).first();
    if (!u || !u.email) return 'skipped:no_account';
    if (u.thanked_at) return 'skipped:already';
    // once per account: only the request that writes thanked_at goes on (Paddle sends several events at once)
    const claim = await env.DB.prepare('UPDATE users SET thanked_at = ?2 WHERE id = ?1 AND thanked_at IS NULL').bind(info.userId, now).run();
    if (!(claim.meta && claim.meta.changes === 1)) return 'skipped:already';
    // once per e-mail address, even through a new account (only a hash of the address is kept)
    const key = 'thanks:' + (await sha256Hex(String(u.email).trim().toLowerCase()));
    const ins = await env.DB.prepare('INSERT OR IGNORE INTO webhook_events (event_id, event_type, received_at) VALUES (?1, ?2, ?3)')
      .bind(key, 'thanks', now).run();
    if (!(ins.meta && ins.meta.changes === 1)) return 'skipped:already';
    const ok = await sendThanks(env, u.email, thanksEmail(u.lang, info.plan, info.interval), { at: now + THANKS_DELAY_MS, key: key.slice(0, 80) });
    if (!ok) {
      // not taken: free the marks so that the next event of this subscription tries again
      await env.DB.prepare('UPDATE users SET thanked_at = NULL WHERE id = ?1 AND thanked_at = ?2').bind(info.userId, now).run().catch(() => {});
      await env.DB.prepare('DELETE FROM webhook_events WHERE event_id = ?1').bind(key).run().catch(() => {});
      return 'skipped:send_failed';
    }
    return 'sent';
  } catch (e) {
    console.warn('[stalak] thank-you mail', String(e && e.message || e).slice(0, 80));
    return 'skipped:error';
  }
}
