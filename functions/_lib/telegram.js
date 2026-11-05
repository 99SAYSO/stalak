// Notifications on the owner's phone with Telegram (owner's request of 5/11: ntfy did not show on the iPhone).
// The bot's key is a secret, TELEGRAM_BOT_TOKEN (typed by the owner in Cloudflare). The owner's chat is found by the server:
// the owner sends /start to the bot, then taps « Relier mon Telegram » on the dashboard; the server reads the bot's recent
// messages (getUpdates) and keeps only the PRIVATE chat that sent /start (admin_state 'telegram_chat'). Nothing is sent to
// anyone else. Never blocks the caller: 3 s at most, errors swallowed, the key never written to the logs (it is in the URL).
// core.telegram.org/bots/api#sendmessage, #getupdates
import { HttpError } from './http.js';
import { getState, setState } from './support.js';

export const TG_TIMEOUT_MS = 3000;
// a bot key: <digits>:<35 letters, digits, _ or ->
const TOKEN = /^\d{5,15}:[A-Za-z0-9_-]{30,64}$/;
const CHAT = /^\d{1,20}$/;
export const LINK_WINDOW_MS = 15 * 60e3;   // a /start older than this is not taken

export const tgToken = (env) => { const t = String(env.TELEGRAM_BOT_TOKEN || '').trim(); return TOKEN.test(t) ? t : null; };
const api = (env, method) => `https://api.telegram.org/bot${tgToken(env)}/${method}`;

async function call(env, method, body, timeout = TG_TIMEOUT_MS) {
  const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), timeout);
  try {
    const res = await fetch(api(env, method), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: ctl.signal });
    const d = await res.json().catch(() => ({}));
    if (!res.ok || !d.ok) {
      // never the URL (it holds the key): only the method, the status and Telegram's short reason
      console.warn('[stalak] telegram', method, res.status, String(d.description || '').slice(0, 80));
      return { ok: false, status: res.status, description: String(d.description || '') };
    }
    return { ok: true, result: d.result };
  } catch (e) {
    console.warn('[stalak] telegram', method, e && e.name === 'AbortError' ? 'timeout' : 'unreachable');
    return { ok: false, status: 0, description: e && e.name === 'AbortError' ? 'timeout' : 'unreachable' };
  } finally { clearTimeout(timer); }
}

export async function tgChat(env) {
  const s = await getState(env);
  return CHAT.test(s.telegram_chat || '') ? s.telegram_chat : null;
}
// 'no_token' | 'not_linked' | 'linked'
export async function tgStatus(env) {
  if (!tgToken(env)) return { state: 'no_token' };
  const s = await getState(env);
  return CHAT.test(s.telegram_chat || '') ? { state: 'linked', name: s.telegram_name || '' } : { state: 'not_linked' };
}

// one message to the owner; quiet = no sound (Telegram's disable_notification). true when Telegram took it. Never throws.
export async function telegram(env, text, { quiet = false } = {}) {
  if (!tgToken(env)) return false;
  const chat = await tgChat(env).catch(() => null);
  if (!chat) return false;
  const r = await call(env, 'sendMessage', { chat_id: chat, text: String(text).slice(0, 1000), disable_notification: !!quiet, disable_web_page_preview: true });
  return r.ok;
}

// « Relier mon Telegram »: the private chat that sent /start in the last 15 minutes becomes the owner's chat.
// Several different chats did → refused (someone else found the bot): the owner tries again.
export async function linkTelegram(env, now = Date.now()) {
  if (!tgToken(env)) throw new HttpError(409, 'telegram_no_token', 'TELEGRAM_BOT_TOKEN is not set.');
  const r = await call(env, 'getUpdates', { limit: 100, timeout: 0, allowed_updates: ['message'] }, 5000);
  if (!r.ok) {
    if (r.status === 401 || r.status === 404) throw new HttpError(409, 'telegram_bad_token', 'Telegram refused the bot key.');
    if (r.status === 409) throw new HttpError(409, 'telegram_webhook', 'This bot has a webhook: getUpdates cannot be used.');
    throw new HttpError(502, 'telegram_unreachable', 'Telegram did not answer, try again.');
  }
  const starts = (r.result || [])
    .map((u) => u && u.message)
    .filter((m) => m && m.chat && m.chat.type === 'private' && /^\/start(\s|@|$)/.test(String(m.text || '')) && m.date * 1000 > now - LINK_WINDOW_MS);
  const chats = [...new Set(starts.map((m) => String(m.chat.id)))];
  if (!chats.length) throw new HttpError(404, 'telegram_no_start', 'No /start received from a private chat in the last 15 minutes.');
  if (chats.length > 1) throw new HttpError(409, 'telegram_several', 'Several people sent /start: send it again alone, then retry.');
  const m = starts[starts.length - 1];
  const chat = String(m.chat.id);
  if (!CHAT.test(chat)) throw new HttpError(400, 'telegram_bad_chat', 'Unexpected chat id.');
  // only the first name (shown on the dashboard so the owner sees it is him), nothing else is kept
  const name = String(m.chat.first_name || m.from && m.from.first_name || '').slice(0, 40);
  await setState(env, 'telegram_chat', chat);
  await setState(env, 'telegram_name', name);
  // the messages read are marked as seen by Telegram (the next link only sees new ones)
  const last = Math.max(...(r.result || []).map((u) => u.update_id || 0));
  if (last) await call(env, 'getUpdates', { offset: last + 1, limit: 1, timeout: 0 }).catch(() => {});
  await telegram(env, '✅ Stalak est relié à ce Telegram. Tu recevras ici une notification à chaque nouvel abonné et à chaque annulation.');
  return { linked: true, name };
}

export async function unlinkTelegram(env) {
  await setState(env, 'telegram_chat', '');
  await setState(env, 'telegram_name', '');
  return { linked: false };
}
