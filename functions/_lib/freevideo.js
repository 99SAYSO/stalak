// « 1re vidéo sans filigrane offerte » (owner's decision of 23/11): every free account (Google, Apple, Microsoft or e-mail)
// may export ONE video without the watermark, once in its life. Pro and Creator Plus are not concerned (no watermark).
//   - users.free_nowm_at: when the account took it (ms), NULL = not taken yet;
//   - a mark per e-mail address, kept when the account is deleted: « freevideo:<sha-256 of the address> » in webhook_events
//     (like the thank-you e-mail, thanks.js), so a deleted then re-created account with the same address gets no 2nd one.
//     Only the hash is kept, never the address; deleted after 3 years with the thank-you hashes (retention.js).
// The server decides (POST /api/free-video): one « yes » only, even when two exports start at the same time.
import { sha256Hex } from './crypto.js';
import { bump } from './metrics.js';

export const FREE_VIDEO_KEEP_MS = 3 * 365 * 864e5;
// The address in one form, so that the usual copies of one mailbox count as one: « +anything » removed before the @
// (name+1@…, name+2@… reach the same box), and the dots of a Gmail address (n.a.m.e@gmail.com = name@gmail.com).
export function mailboxOf(email) {
  const e = String(email || '').trim().toLowerCase(), at = e.lastIndexOf('@');
  if (at < 1) return e;
  let local = e.slice(0, at).replace(/\+.*$/, ''), domain = e.slice(at + 1);
  if (domain === 'googlemail.com') domain = 'gmail.com';
  if (domain === 'gmail.com') local = local.replace(/\./g, '');
  return (local || e.slice(0, at)) + '@' + domain;
}
export const freeVideoMark = async (email) => 'freevideo:' + (await sha256Hex(mailboxOf(email)));

// still available to this free account? (taken neither by this account nor by an earlier one with the same address)
export async function freeVideoAvailable(env, user) {
  if (!user || !user.id || !user.email) return false;
  const r = await env.DB.prepare('SELECT u.free_nowm_at AS at, (SELECT 1 FROM webhook_events WHERE event_id = ?2) AS marked FROM users u WHERE u.id = ?1')
    .bind(user.id, await freeVideoMark(user.email)).first().catch(() => null);
  return !!r && r.at == null && !r.marked;
}

// The free account starts an export without the watermark: « yes » once. The claim is one statement (the row is written
// only if neither the account nor the address has taken it), so two exports at the same time get one « yes » and one « no ».
export async function claimFreeVideo(env, user, now = Date.now()) {
  const key = await freeVideoMark(user.email);
  const r = await env.DB.prepare(
    'UPDATE users SET free_nowm_at = ?2 WHERE id = ?1 AND free_nowm_at IS NULL AND NOT EXISTS (SELECT 1 FROM webhook_events WHERE event_id = ?3)'
  ).bind(user.id, now, key).run();
  if (!(r.meta && r.meta.changes === 1)) return false;
  await env.DB.prepare('INSERT OR IGNORE INTO webhook_events (event_id, event_type, received_at) VALUES (?1, ?2, ?3)').bind(key, 'freevideo', now).run();
  await bump(env, 'free_video').catch(() => {});
  return true;
}

// Juridique: the address hashes are kept 3 years, like the thank-you ones (to be written on the privacy page)
export async function purgeOldFreeVideoMarks(env, now = Date.now()) {
  const r = await env.DB.prepare("DELETE FROM webhook_events WHERE event_type = 'freevideo' AND received_at < ?1").bind(now - FREE_VIDEO_KEEP_MS).run();
  return r.meta ? r.meta.changes || 0 : 0;
}
