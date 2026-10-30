// Profile: display name and profile photo (small square image, resized in the browser before upload).
import { HttpError, json } from './http.js';
import { requireUser } from './auth.js';
import { limit } from './ratelimit.js';
import { base64Encode, base64Decode } from './crypto.js';

export const NAME_MIN = 2;
export const NAME_MAX = 30;
export const AVATAR_MAX_BYTES = 80 * 1024;
export const AVATAR_TYPES = ['image/jpeg', 'image/webp', 'image/png'];

// null / '' clears the name. Control and invisible format characters are removed, spaces collapsed.
export function normalizeDisplayName(v) {
  if (v === null || v === undefined) return null;
  if (typeof v !== 'string') throw new HttpError(400, 'invalid_name', 'displayName must be a string.');
  const s = v.normalize('NFC').replace(/[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/gu, '').replace(/\s+/g, ' ').trim();
  if (!s) return null;
  const n = [...s].length;
  if (n < NAME_MIN || n > NAME_MAX) throw new HttpError(400, 'invalid_name', `The name has ${NAME_MIN} to ${NAME_MAX} characters.`, { min: NAME_MIN, max: NAME_MAX });
  return s;
}

export function avatarUrl(user) {
  return user && user.avatar_updated_at ? `/api/me/avatar?v=${user.avatar_updated_at}` : null;
}

// Real type from the first bytes (the declared Content-Type must agree).
export function sniffImage(b) {
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'image/jpeg';
  if (b.length >= 8 && [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every((x, i) => b[i] === x)) return 'image/png';
  if (b.length >= 12 && String.fromCharCode(...b.subarray(0, 4)) === 'RIFF' && String.fromCharCode(...b.subarray(8, 12)) === 'WEBP') return 'image/webp';
  return null;
}

// PATCH /api/me {displayName}
export async function updateProfile(env, user, body) {
  if (!('displayName' in body) && !('reminders' in body)) throw new HttpError(400, 'nothing_to_update', 'Send {"displayName": "..."} or {"reminders": true|false}.');
  if ('reminders' in body) {
    // the reminder e-mail « Ta vidéo gratuite du jour est disponible » (videos.js)
    if (typeof body.reminders !== 'boolean') throw new HttpError(400, 'invalid_reminders', 'reminders: true or false.');
    await env.DB.prepare('UPDATE users SET reminders = ?2 WHERE id = ?1').bind(user.id, body.reminders ? 1 : 0).run();
    user.reminders = body.reminders ? 1 : 0;
  }
  if ('displayName' in body) {
    const name = normalizeDisplayName(body.displayName);
    await env.DB.prepare('UPDATE users SET display_name = ?2 WHERE id = ?1').bind(user.id, name).run();
    user.display_name = name;
  }
  return user;
}

// /api/me/avatar: PUT (raw image body), GET, DELETE
export async function avatar(request, env, method) {
  const user = await requireUser(request, env);
  if (method === 'GET') {
    const row = await env.DB.prepare('SELECT avatar, avatar_type, avatar_updated_at FROM users WHERE id = ?1').bind(user.id).first();
    if (!row || !row.avatar) throw new HttpError(404, 'not_found', 'No profile photo.');
    const bytes = base64Decode(row.avatar);
    return new Response(bytes, { status: 200, headers: {
      'Content-Type': row.avatar_type || 'image/jpeg',
      'Content-Length': String(bytes.length),
      // the URL carries the version (?v=updated_at): a new photo gets a new URL
      'Cache-Control': 'private, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; sandbox",
      'Cross-Origin-Resource-Policy': 'same-origin',
    } });
  }
  if (method === 'DELETE') {
    await env.DB.prepare('UPDATE users SET avatar = NULL, avatar_type = NULL, avatar_updated_at = NULL WHERE id = ?1').bind(user.id).run();
    return json({ ok: true, avatarUrl: null });
  }
  if (method === 'PUT') {
    await limit(env, `avatar:${user.id}`, 20, 3600e3, 'Too many photo changes, try again later.');
    const type = (request.headers.get('Content-Type') || '').split(';')[0].trim().toLowerCase();
    if (!AVATAR_TYPES.includes(type)) throw new HttpError(415, 'invalid_image', 'The photo must be JPEG, WebP or PNG.');
    const len = Number(request.headers.get('Content-Length') || 0);
    if (len > AVATAR_MAX_BYTES) throw new HttpError(413, 'too_large', `The photo must be at most ${AVATAR_MAX_BYTES / 1024} KB.`);
    const bytes = new Uint8Array(await request.arrayBuffer());
    if (bytes.length > AVATAR_MAX_BYTES) throw new HttpError(413, 'too_large', `The photo must be at most ${AVATAR_MAX_BYTES / 1024} KB.`);
    if (bytes.length < 16 || sniffImage(bytes) !== type) throw new HttpError(415, 'invalid_image', 'This file is not a valid JPEG, WebP or PNG image.');
    const now = Date.now();
    await env.DB.prepare('UPDATE users SET avatar = ?2, avatar_type = ?3, avatar_updated_at = ?4 WHERE id = ?1')
      .bind(user.id, base64Encode(bytes), type, now).run();
    return json({ ok: true, avatarUrl: avatarUrl({ avatar_updated_at: now }) });
  }
  throw new HttpError(405, 'method_not_allowed', 'Method not allowed.');
}
