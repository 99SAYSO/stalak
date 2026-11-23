// « 1re vidéo sans filigrane offerte » (owner's decision of 23/11): every free account (Google, Apple, Microsoft or e-mail)
// may export ONE video without the watermark, once in its life. Pro and Creator Plus are not concerned (no watermark).
//   - while the account exists: users.free_nowm_at (when it took it, ms; NULL = not taken) is all that is kept;
//   - when an account that took it is deleted: a mark « freevideo:<HMAC of the address> » in webhook_events, so the same
//     address does not get a 2nd one on a new account. The HMAC uses the server secret AUTH_SECRET (an address cannot be
//     found back by trying addresses), and the mark is erased 12 months after the deletion (Juridique, legal/video-offerte).
//     Nothing else is kept. Without AUTH_SECRET, no mark is written (a re-created account could get a 2nd video).
// The server decides (POST /api/free-video): one « yes » only, even when two exports start at the same time.
import { hmacSha256Hex } from './crypto.js';
import { bump } from './metrics.js';

export const FREE_VIDEO_MARK_KEEP_MS = 365 * 864e5;   // 12 months after the deletion of the account

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
// null without the secret: then nothing is written nor looked up
export async function freeVideoMark(env, email) {
  if (!env.AUTH_SECRET) return null;
  return 'freevideo:' + (await hmacSha256Hex(env.AUTH_SECRET, 'freevideo:' + mailboxOf(email)));
}

// still available to this free account? (taken neither by this account nor by a deleted one with the same address)
export async function freeVideoAvailable(env, user) {
  if (!user || !user.id || !user.email) return false;
  const key = await freeVideoMark(env, user.email);
  const r = await env.DB.prepare('SELECT u.free_nowm_at AS at, (SELECT 1 FROM webhook_events WHERE event_id = ?2) AS marked FROM users u WHERE u.id = ?1')
    .bind(user.id, key || '-').first().catch(() => null);
  return !!r && r.at == null && !r.marked;
}

// The free account starts an export without the watermark: « yes » once. One statement decides (the row is written only
// if neither the account nor a deleted account with the same address has taken it): two exports at the same time get one
// « yes » and one « no ».
export async function claimFreeVideo(env, user, now = Date.now()) {
  const key = await freeVideoMark(env, user.email);
  const r = await env.DB.prepare(
    'UPDATE users SET free_nowm_at = ?2 WHERE id = ?1 AND free_nowm_at IS NULL AND NOT EXISTS (SELECT 1 FROM webhook_events WHERE event_id = ?3)'
  ).bind(user.id, now, key || '-').run();
  if (!(r.meta && r.meta.changes === 1)) return false;
  await bump(env, 'free_video').catch(() => {});
  return true;
}

// Account deletion (router.js deleteAccount, in the same batch as the deletion of the users row): the mark of the address,
// only if this account took its free video. The 12 months start at the deletion (a later deletion starts them again).
export async function freeVideoMarkOnDelete(env, user, now = Date.now()) {
  const key = await freeVideoMark(env, user.email);
  if (!key) {
    const r = await env.DB.prepare('SELECT free_nowm_at FROM users WHERE id = ?1').bind(user.id).first().catch(() => null);
    if (r && r.free_nowm_at != null) console.warn('[stalak] free video: AUTH_SECRET missing, no mark kept for a deleted account');
    return null;
  }
  return env.DB.prepare(`INSERT INTO webhook_events (event_id, event_type, received_at)
      SELECT ?2, 'freevideo', ?3 WHERE EXISTS (SELECT 1 FROM users WHERE id = ?1 AND free_nowm_at IS NOT NULL)
      ON CONFLICT(event_id) DO UPDATE SET received_at = excluded.received_at`).bind(user.id, key, now);
}

// daily (retention.js): marks older than 12 months go
export async function purgeOldFreeVideoMarks(env, now = Date.now()) {
  const r = await env.DB.prepare("DELETE FROM webhook_events WHERE event_type = 'freevideo' AND received_at < ?1").bind(now - FREE_VIDEO_MARK_KEEP_MS).run();
  return r.meta ? r.meta.changes || 0 : 0;
}
