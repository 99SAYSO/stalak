// « Parler à un humain » (the help ice cube), a Stalak Pro feature: a support ticket the owner answers from the dashboard
// (admin.js). Starting a conversation or writing in it needs a signed-in Pro account (the conversation must be this
// account's). Reading it needs only the ticket's token: someone who is no longer Pro keeps the answers already received.
// The page holds the ticket id and a random token (only its SHA-256 is stored) and asks for news every few seconds while
// the help window is open. When the owner is not there (« disponible » off, or the dashboard closed), the answers go to the
// account's e-mail (« sous 24 h »). The owner gets an e-mail for each new message when he is not on the dashboard.
//
//   GET  /api/support/status                       → {available}
//   POST /api/support/tickets                      Pro; {lang, message, email?, context?} → {id, token, available, email, messages}
//   GET  /api/support/tickets/:id?after=<msg id>   header X-Ticket-Token → {status, available, email, messages}
//   POST /api/support/tickets/:id/messages         Pro, own ticket; header X-Ticket-Token, {text, email?} → {messages}
import { HttpError, json, readJson, clientIp, isDev } from './http.js';
import { requireUser } from './auth.js';
import { requirePro } from './entitlements.js';
import { limit } from './ratelimit.js';
import { sha256Hex, base64url } from './crypto.js';
import { bump } from './metrics.js';

export const MESSAGE_MAX = 2000;
export const CONTEXT_MAX = 3000;
export const AVAILABLE_MS = 180e3;        // the dashboard said « I'm here » less than 3 minutes ago
export const USER_LIVE_MS = 15e3;         // the visitor's page asked for news less than 15 s ago (it asks every 5 s): he sees it live
export const CATCH_UP_MS = 20e3;          // an answer the visitor's page has not fetched after 20 s goes by e-mail
export const OWNER_MAIL_EVERY_MS = 15 * 60e3; // at most one e-mail to the owner per ticket every 15 minutes
export const OWNER_MAILS_PER_DAY = 50;
export const TICKETS_PER_DAY = 200;       // for the whole site
export const KEEP_MS = 183 * 864e5;       // a ticket goes 6 months after its last message
const ID = /^t_[A-Za-z0-9_-]{16,32}$/;
const TOKEN = /^[A-Za-z0-9_-]{32,64}$/;
const EMAIL = /^[^\s@<>"',;:]{1,64}@[^\s@<>"',;:]{1,190}\.[A-Za-z]{2,24}$/;

const clean = (s, max) => String(s)
  .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F​-‏‪-‮⁦-⁩﻿]/g, '')
  .replace(/\r\n?/g, '\n').trim().slice(0, max);
export const cleanEmail = (e) => {
  const v = String(e || '').trim().toLowerCase();
  return v.length <= 254 && EMAIL.test(v) ? v : null;
};
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const day = () => new Date().toISOString().slice(0, 10);
const ipKeyOf = async (request) => (await sha256Hex('ip:' + clientIp(request))).slice(0, 32);

// ---- the owner's availability (admin_state) ----------------------------------------------------
export async function getState(env) {
  const { results } = await env.DB.prepare('SELECT key, value FROM admin_state').all();
  const s = {}; for (const r of results) s[r.key] = r.value; return s;
}
export async function setState(env, key, value) {
  await env.DB.prepare('INSERT INTO admin_state (key, value, updated_at) VALUES (?1, ?2, ?3) ON CONFLICT(key) DO UPDATE SET value = ?2, updated_at = ?3')
    .bind(key, String(value), Date.now()).run();
}
export function isAvailable(state, now = Date.now()) {
  return state.available === '1' && Number(state.admin_seen || 0) > now - AVAILABLE_MS;
}

// ---- e-mails (Resend) ---------------------------------------------------------------------------
async function sendMail(env, { to, subject, text, html, replyTo }) {
  if (!env.RESEND_API_KEY) {
    if (isDev(env)) { console.log(`[stalak dev] mail to ${to}: ${subject}`); return true; }
    return false;
  }
  const body = { from: env.EMAIL_FROM || 'Stalak <login@stalak.app>', to: [to], subject, text, html };
  if (replyTo) body.reply_to = replyTo;
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) console.error('[stalak] support mail', res.status);
  return res.ok;
}
const supportAddress = (env) => cleanEmail(env.SUPPORT_EMAIL) || 'contact@stalak.app';
const page = (lang, inner) => `<!doctype html><html lang="${lang === 'en' ? 'en' : 'fr'}"><body style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#111;padding:24px;max-width:600px">${inner}
<p style="color:#888;font-size:12px">Stalak — <a href="https://stalak.app" style="color:#888">stalak.app</a></p></body></html>`;

const REPLY = {
  fr: { subject: 'Réponse de l’équipe Stalak', intro: 'Voici la réponse à ton message :', yours: 'Ton message :',
    more: 'Pour répondre, réponds simplement à cet e-mail, ou rouvre le glaçon d’aide sur stalak.app.' },
  en: { subject: 'Reply from the Stalak team', intro: 'Here is the reply to your message:', yours: 'Your message:',
    more: 'To answer, just reply to this email, or open the help ice cube on stalak.app again.' },
};
export function replyEmail(lang, answer, question) {
  const t = REPLY[lang] || REPLY.fr;
  const q = question ? `\n\n${t.yours}\n> ${question.slice(0, 600).replace(/\n/g, '\n> ')}` : '';
  const text = `${t.intro}\n\n${answer}${q}\n\n${t.more}\n\nStalak — stalak.app`;
  const html = page(lang, `<p>${esc(t.intro)}</p><div style="white-space:pre-wrap;border-left:3px solid #2a7de1;padding:4px 12px;margin:12px 0">${esc(answer)}</div>`
    + (question ? `<p style="color:#555">${esc(t.yours)}</p><div style="white-space:pre-wrap;color:#555;border-left:3px solid #ccc;padding:4px 12px">${esc(question.slice(0, 600))}</div>` : '')
    + `<p>${esc(t.more)}</p>`);
  return { subject: t.subject, text, html };
}
export function ownerEmail(env, ticket, text) {
  const host = env.ADMIN_HOST || 'admin.stalak.app';
  const link = `https://${host}/admin/#t=${encodeURIComponent(ticket.id)}`;
  const who = ticket.email || 'visiteur sans e-mail';
  const body = String(text).slice(0, 1000);
  return {
    subject: `Stalak Pro : nouveau message (${who})`,
    text: `Nouveau message d’un abonné Stalak Pro, de ${who} :\n\n${body}\n\nRépondre : ${link}`,
    html: page('fr', `<p>Nouveau message d’un abonné Stalak Pro, de <b>${esc(who)}</b> :</p><div style="white-space:pre-wrap;border-left:3px solid #2a7de1;padding:4px 12px;margin:12px 0">${esc(body)}</div><p><a href="${esc(link)}">Répondre depuis le tableau de bord</a></p>`),
  };
}

// The owner hears about a visitor's message by e-mail when he is not on the dashboard (bounded per ticket and per day).
async function tellOwner(env, ticket, text, ctx) {
  const now = Date.now();
  if (isAvailable(await getState(env), now)) return;
  if (ticket.notified_at && ticket.notified_at > now - OWNER_MAIL_EVERY_MS) return;
  try { await limit(env, `support:ownermail:${day()}`, OWNER_MAILS_PER_DAY, 86400e3); } catch { return; }
  await env.DB.prepare('UPDATE tickets SET notified_at = ?2 WHERE id = ?1').bind(ticket.id, now).run();
  const send = sendMail(env, { to: supportAddress(env), replyTo: ticket.email || undefined, ...ownerEmail(env, ticket, text) }).catch(() => false);
  if (ctx && typeof ctx.waitUntil === 'function') ctx.waitUntil(send); else await send;
}

// A reply from the owner goes by e-mail (when an address is known) unless the visitor's page sees it:
//   mode 'yes' → now; 'no' → never (emailed_at = 0); 'auto' → now if the visitor is away, else catchUpReplies() sends it
//   when his page has not fetched it within 20 s (he closed the window just before the answer, say).
async function sendReply(env, ticket, msgId, text, now = Date.now()) {
  const q = await env.DB.prepare("SELECT body FROM ticket_messages WHERE ticket_id = ?1 AND sender = 'user' ORDER BY id DESC LIMIT 1").bind(ticket.id).first();
  const ok = await sendMail(env, { to: ticket.email, replyTo: supportAddress(env), ...replyEmail(ticket.lang, text, q && q.body) }).catch(() => false);
  if (ok) await env.DB.prepare('UPDATE ticket_messages SET emailed_at = ?2 WHERE id = ?1').bind(msgId, now).run();
  return ok;
}
export async function deliverReply(env, ticket, msgId, text, mode = 'auto') {
  const now = Date.now();
  if (mode === 'no' || !ticket.email) {
    if (mode === 'no') await env.DB.prepare('UPDATE ticket_messages SET emailed_at = 0 WHERE id = ?1').bind(msgId).run();
    return false;
  }
  const away = !ticket.user_seen_at || ticket.user_seen_at < now - USER_LIVE_MS;
  if (mode === 'auto' && !away) return false;
  return sendReply(env, ticket, msgId, text, now);
}
// Answers the visitor's page did not fetch (no poll since they were written): sent by e-mail. Run by the dashboard's refresh.
export async function catchUpReplies(env, now = Date.now(), max = 10) {
  const { results } = await env.DB.prepare(
    `SELECT m.id, m.body, m.ticket_id FROM ticket_messages m JOIN tickets t ON t.id = m.ticket_id
     WHERE m.sender = 'admin' AND m.emailed_at IS NULL AND t.email IS NOT NULL AND m.created_at < ?1 AND m.created_at > ?2
       AND (t.user_seen_at IS NULL OR t.user_seen_at < m.created_at) ORDER BY m.id LIMIT ?3`
  ).bind(now - CATCH_UP_MS, now - 864e5, max).all();
  let sent = 0;
  for (const m of results) {
    const t = await env.DB.prepare('SELECT * FROM tickets WHERE id = ?1').bind(m.ticket_id).first();
    if (t && await sendReply(env, t, m.id, m.body, now)) sent++;
  }
  return sent;
}

export async function messagesOf(env, ticketId, after = 0) {
  const { results } = await env.DB.prepare(
    'SELECT id, sender, body, created_at, emailed_at FROM ticket_messages WHERE ticket_id = ?1 AND id > ?2 ORDER BY id LIMIT 200'
  ).bind(ticketId, after).all();
  return results.map((m) => ({ id: m.id, from: m.sender, text: m.body, at: new Date(m.created_at).toISOString(), emailed: !!m.emailed_at }));   // 0 = « never »
}

// Old tickets go now and then (6 months after their last message).
export async function cleanupTickets(env, now = Date.now()) {
  const old = now - KEEP_MS;
  await env.DB.batch([
    env.DB.prepare('DELETE FROM ticket_messages WHERE ticket_id IN (SELECT id FROM tickets WHERE updated_at < ?1)').bind(old),
    env.DB.prepare('DELETE FROM tickets WHERE updated_at < ?1').bind(old),
  ]);
}

// The visitor's own ticket: id + token (the token is compared through its SHA-256, so its timing tells nothing).
async function ownTicket(request, env, id) {
  const token = request.headers.get('X-Ticket-Token') || '';
  if (!ID.test(id || '') || !TOKEN.test(token)) throw new HttpError(404, 'not_found', 'Ticket not found.');
  const t = await env.DB.prepare('SELECT * FROM tickets WHERE id = ?1').bind(id).first();
  if (!t || t.token_hash !== await sha256Hex('ticket:' + token)) throw new HttpError(404, 'not_found', 'Ticket not found.');
  return t;
}

async function addMessage(env, ticketId, sender, body, now = Date.now()) {
  const row = await env.DB.prepare('INSERT INTO ticket_messages (ticket_id, sender, body, created_at) VALUES (?1, ?2, ?3, ?4) RETURNING id')
    .bind(ticketId, sender, body, now).first();
  await env.DB.prepare(`UPDATE tickets SET updated_at = ?2${sender === 'user' ? ", status = 'open'" : ''} WHERE id = ?1`).bind(ticketId, now).run();
  return row.id;
}

export async function support(request, env, method, rest, ctx) {
  const ipKey = await ipKeyOf(request);
  if (rest[0] === 'status' && rest.length === 1) {
    if (method !== 'GET') throw new HttpError(405, 'method_not_allowed', 'Method not allowed.');
    return json({ available: isAvailable(await getState(env)) });
  }
  if (rest[0] !== 'tickets' || rest.length > 3) throw new HttpError(404, 'not_found', 'Unknown API route.');

  // a new ticket
  if (rest.length === 1) {
    if (method !== 'POST') throw new HttpError(405, 'method_not_allowed', 'Method not allowed.');
    // Stalak Pro only (401 not_logged_in / 403 pro_required); checked before anything is counted
    const user = await requireUser(request, env);
    await requirePro(env, user, HttpError);
    await limit(env, `support:new:ip:${ipKey}`, 5, 3600e3, 'Too many new conversations, try again later.');
    await limit(env, `support:newd:ip:${ipKey}`, 20, 86400e3, 'Too many new conversations today, try again tomorrow.');
    const body = await readJson(request, 16 * 1024);
    const lang = body.lang === 'en' ? 'en' : 'fr';
    const message = clean(typeof body.message === 'string' ? body.message : '', MESSAGE_MAX);
    if (!message) throw new HttpError(400, 'invalid_message', 'message: 1-2000 characters.');
    const context = body.context == null ? null : clean(typeof body.context === 'string' ? body.context : '', CONTEXT_MAX) || null;
    // the answers go to the account's address, or to another one the member gives
    let email = user.email;
    if (body.email != null && body.email !== '') {
      email = cleanEmail(body.email);
      if (!email) throw new HttpError(400, 'invalid_email', 'That email address does not look right.');
    }
    const available = isAvailable(await getState(env));
    try {
      await limit(env, `support:all:${day()}`, TICKETS_PER_DAY, 86400e3);
    } catch { throw new HttpError(503, 'support_busy', 'Too many conversations today, write to the support email address.'); }
    const id = 't_' + base64url(crypto.getRandomValues(new Uint8Array(16)));
    const token = base64url(crypto.getRandomValues(new Uint8Array(32)));
    const now = Date.now();
    await env.DB.prepare(
      `INSERT INTO tickets (id, token_hash, user_id, email, lang, status, context, created_at, updated_at, user_seen_at)
       VALUES (?1, ?2, ?3, ?4, ?5, 'open', ?6, ?7, ?7, ?7)`
    ).bind(id, await sha256Hex('ticket:' + token), user.id, email, lang, context, now).run();
    await addMessage(env, id, 'user', message, now);
    await bump(env, 'ticket');
    await tellOwner(env, { id, email, notified_at: null }, message, ctx);
    if (Math.random() < 0.02) await cleanupTickets(env).catch(() => {});
    return json({ id, token, available, email, messages: await messagesOf(env, id) });
  }

  const t = await ownTicket(request, env, rest[1]);
  // news: the visitor's page asks every few seconds while the help window is open
  if (rest.length === 2) {
    if (method !== 'GET') throw new HttpError(405, 'method_not_allowed', 'Method not allowed.');
    // reading costs no write: « seen » is written at most every 4 s (the page asks every 5 s), no rate-limit row per poll
    const after = Math.max(0, Number.parseInt(new URL(request.url).searchParams.get('after') || '0', 10) || 0);
    const now = Date.now();
    await env.DB.prepare('UPDATE tickets SET user_seen_at = ?2 WHERE id = ?1 AND (user_seen_at IS NULL OR user_seen_at < ?3)').bind(t.id, now, now - 4000).run();
    return json({ status: t.status, available: isAvailable(await getState(env)), email: t.email, messages: await messagesOf(env, t.id, after) });
  }
  if (rest[2] !== 'messages') throw new HttpError(404, 'not_found', 'Unknown API route.');
  if (method !== 'POST') throw new HttpError(405, 'method_not_allowed', 'Method not allowed.');
  // writing: Stalak Pro, and only in this account's own conversation (older ones without an account stay read-only)
  const user = await requireUser(request, env);
  await requirePro(env, user, HttpError);
  if (t.user_id !== user.id) throw new HttpError(404, 'not_found', 'Ticket not found.');
  await limit(env, `support:msg:ip:${ipKey}`, 120, 3600e3, 'Too many messages, try again later.');
  await limit(env, `support:msg:t:${t.id}`, 60, 3600e3, 'Too many messages, try again later.');
  const body = await readJson(request, 8 * 1024);
  const text = clean(typeof body.text === 'string' ? body.text : '', MESSAGE_MAX);
  if (!text) throw new HttpError(400, 'invalid_message', 'text: 1-2000 characters.');
  if (body.email != null && body.email !== '') {
    const email = cleanEmail(body.email);
    if (!email) throw new HttpError(400, 'invalid_email', 'That email address does not look right.');
    await env.DB.prepare('UPDATE tickets SET email = ?2 WHERE id = ?1').bind(t.id, email).run();
    t.email = email;
  }
  const after = Math.max(0, Number.parseInt(body.after, 10) || 0);
  await addMessage(env, t.id, 'user', text);
  await env.DB.prepare('UPDATE tickets SET user_seen_at = ?2 WHERE id = ?1').bind(t.id, Date.now()).run();
  await bump(env, 'ticket_msg');
  await tellOwner(env, t, text, ctx);
  return json({ email: t.email, messages: await messagesOf(env, t.id, after) });
}
