// Online saving of projects (Stalak Pro): the media files of a project (the song and every take) in Cloudflare R2.
// The project itself (a small JSON state) stays in D1, table `projects` (see router.js); its files are in `project_files`.
//
// R2 key of a file: u/<userId>/p/<projectId>/<fileId>. Keys are always built here from the signed-in user's id and
// validated ids: the client never gives a key, and nothing lists the bucket except to erase a user's own prefix.
//
// Uploads go through the Pages Function (no presigned URL: those need S3 API keys stored as secrets). A Worker request
// body is limited to 100 MB on the Free and Pro plans (https://developers.cloudflare.com/workers/platform/limits/), so a
// file larger than one part is sent with R2's multipart API, part by part: "Minimum part size: 5 MiB (except for the last
// part)", "All parts except the last must be the same size", "Maximum number of parts: 10,000", and incomplete uploads are
// "automatically aborted after 7 days by default" (https://developers.cloudflare.com/r2/objects/multipart-objects/).
// The binding is env.MEDIA (wrangler.toml [[r2_buckets]]). Without it, everything here answers 503 cloud_unavailable and
// the app hides the feature: the rest of the site keeps working.
import { HttpError, json, readJson, isDev } from './http.js';
import { requirePro } from './entitlements.js';
import { limit, hit } from './ratelimit.js';

export const PART_SIZE = 8 * 1024 * 1024;                 // 8 MiB: above R2's 5 MiB minimum, far below the 100 MB body limit
export const MAX_FILE_BYTES = 4 * 1024 * 1024 * 1024;     // 4 GiB per file (512 parts)
export const DEFAULT_QUOTA = 20 * 1024 * 1024 * 1024;     // 20 GiB per Pro user (CLOUD_QUOTA_BYTES can change it)
export const MAX_FILES_PER_PROJECT = 64;
export const FILE_ID = /^[A-Za-z0-9_-]{8,64}$/;
const MEDIA_TYPE = /^(audio|video)\/[a-z0-9][a-z0-9.+-]{0,60}$/;
const DAY = 24 * 3600e3;
export const KEEP_MS = 183 * DAY;          // a project not opened for 6 months is deleted...
export const WARN_BEFORE_MS = 14 * DAY;    // ...after an e-mail sent at least 14 days before
export const STALE_UPLOAD_MS = 6 * DAY;    // unfinished uploads are dropped before R2's own 7-day abort
export const ORPHAN_MS = 2 * DAY;          // files whose project was never saved
export const CLEANUP_EVERY_MS = 6 * 3600e3;

export const cloudAvailable = (env) => !!(env.MEDIA && typeof env.MEDIA.get === 'function');
export const quotaOf = (env) => {
  const q = Number(env.CLOUD_QUOTA_BYTES);
  return Number.isFinite(q) && q > 0 ? q : DEFAULT_QUOTA;
};
const keyOf = (userId, projectId, fileId) => `u/${userId}/p/${projectId}/${fileId}`;
const partsCount = (size) => Math.max(1, Math.ceil(size / PART_SIZE));

function needCloud(env) {
  if (!cloudAvailable(env)) throw new HttpError(503, 'cloud_unavailable', 'Online saving is not available yet.');
}

// Bytes used by a user: every media file (also those being uploaded: their size is reserved) + the project states.
export async function usedBytes(env, userId) {
  const r = await env.DB.prepare(
    `SELECT (SELECT COALESCE(SUM(size), 0) FROM project_files WHERE user_id = ?1)
          + (SELECT COALESCE(SUM(size), 0) FROM projects WHERE user_id = ?1) AS n`
  ).bind(userId).first();
  return Number(r.n) || 0;
}

export async function storageInfo(env, userId) {
  return { available: cloudAvailable(env), used: await usedBytes(env, userId), quota: quotaOf(env), partSize: PART_SIZE, maxFile: MAX_FILE_BYTES };
}

function cleanName(v) {
  // shown back to the user only; control characters and path separators removed
  return String(v || '').replace(/[\u0000-\u001f\u007f/\\]/g, '').trim().slice(0, 160) || 'file';
}
function cleanType(v, name) {
  const t = String(v || '').toLowerCase().split(';')[0].trim();
  if (MEDIA_TYPE.test(t)) return t;
  // iPhone sometimes gives no type: accepted when the name says audio / video, stored as a neutral type
  if ((!t || t === 'application/octet-stream') && /\.(mp4|m4v|mov|webm|mkv|3gp|wav|mp3|m4a|aac|ogg|oga|opus|flac|aif|aiff|caf)$/i.test(name)) return 'application/octet-stream';
  return null;
}

async function fileRow(env, userId, projectId, fileId) {
  return env.DB.prepare('SELECT * FROM project_files WHERE user_id = ?1 AND project_id = ?2 AND id = ?3')
    .bind(userId, projectId, fileId).first();
}
async function deleteFileRows(env, userId, projectId, fileId) {
  await env.DB.batch([
    env.DB.prepare('DELETE FROM file_parts WHERE user_id = ?1 AND project_id = ?2 AND file_id = ?3').bind(userId, projectId, fileId),
    env.DB.prepare('DELETE FROM project_files WHERE user_id = ?1 AND project_id = ?2 AND id = ?3').bind(userId, projectId, fileId),
  ]);
}
// Removes one file from R2 (and aborts its multipart upload if it was still running), then its rows.
async function dropFile(env, row) {
  if (cloudAvailable(env)) {
    const key = keyOf(row.user_id, row.project_id, row.id);
    if (row.upload_id) { try { await env.MEDIA.resumeMultipartUpload(key, row.upload_id).abort(); } catch { /* already gone */ } }
    await env.MEDIA.delete(key);
  }
  await deleteFileRows(env, row.user_id, row.project_id, row.id);
}

// Several files of one project at once: unfinished uploads aborted, objects deleted (1000 keys per call), rows removed in
// one D1 batch. D1 allows 50 queries per invocation on the Free plan (1000 on Paid): never one query per file.
async function dropFiles(env, userId, projectId, rows) {
  if (!rows.length) return;
  if (cloudAvailable(env)) {
    for (const r of rows) if (r.upload_id) { try { await env.MEDIA.resumeMultipartUpload(keyOf(userId, projectId, r.id), r.upload_id).abort(); } catch { /* gone */ } }
    const keys = rows.map((r) => keyOf(userId, projectId, r.id));
    for (let i = 0; i < keys.length; i += 1000) await env.MEDIA.delete(keys.slice(i, i + 1000));
  }
  const ids = JSON.stringify(rows.map((r) => r.id));
  await env.DB.batch([
    env.DB.prepare('DELETE FROM file_parts WHERE user_id = ?1 AND project_id = ?2 AND file_id IN (SELECT value FROM json_each(?3))').bind(userId, projectId, ids),
    env.DB.prepare('DELETE FROM project_files WHERE user_id = ?1 AND project_id = ?2 AND id IN (SELECT value FROM json_each(?3))').bind(userId, projectId, ids),
  ]);
}

// Every file of a project: R2 objects (also strays under the project's prefix) and rows.
export async function deleteProjectMedia(env, userId, projectId) {
  const { results } = await env.DB.prepare('SELECT * FROM project_files WHERE user_id = ?1 AND project_id = ?2').bind(userId, projectId).all();
  await dropFiles(env, userId, projectId, results);
  if (cloudAvailable(env)) await deletePrefix(env, `u/${userId}/p/${projectId}/`);
}

// Everything a user has in R2 (account deletion). Rows are removed by the caller's batch.
export async function deleteUserMedia(env, userId) {
  if (!cloudAvailable(env)) return;
  const { results } = await env.DB.prepare("SELECT * FROM project_files WHERE user_id = ?1 AND upload_id IS NOT NULL").bind(userId).all();
  for (const r of results) { try { await env.MEDIA.resumeMultipartUpload(keyOf(userId, r.project_id, r.id), r.upload_id).abort(); } catch { /* gone */ } }
  await deletePrefix(env, `u/${userId}/`);
}

// list() returns at most 1000 keys, delete() takes at most 1000 keys (R2 Workers API reference).
async function deletePrefix(env, prefix) {
  let cursor;
  for (let guard = 0; guard < 1000; guard++) {
    const page = await env.MEDIA.list({ prefix, limit: 1000, cursor });
    const keys = page.objects.map((o) => o.key);
    if (keys.length) await env.MEDIA.delete(keys);
    if (!page.truncated) break;
    cursor = page.cursor;
  }
}

// ---- routes: /api/projects/:id/files[/:fileId[/parts/:n | /complete]] -------------------------------------------
export async function projectFiles(request, env, method, user, projectId, rest) {
  const [fileId, sub, subArg] = rest;
  if (!fileId) {
    if (method !== 'POST') throw new HttpError(405, 'method_not_allowed', 'Method not allowed.');
    return createUpload(request, env, user, projectId);
  }
  if (!FILE_ID.test(fileId)) throw new HttpError(400, 'invalid_file_id', 'File id: 8-64 letters, digits, - or _.');
  if (!sub) {
    if (method === 'GET') return download(request, env, user, projectId, fileId);
    if (method === 'PUT') return putWhole(request, env, user, projectId, fileId);
    if (method === 'DELETE') {
      const row = await fileRow(env, user.id, projectId, fileId);
      if (row) await dropFile(env, row);
      return json({ ok: true });
    }
    throw new HttpError(405, 'method_not_allowed', 'Method not allowed.');
  }
  if (sub === 'parts' && subArg && rest.length === 3) {
    if (method !== 'PUT') throw new HttpError(405, 'method_not_allowed', 'Method not allowed.');
    return putPart(request, env, user, projectId, fileId, subArg);
  }
  if (sub === 'complete' && rest.length === 2) {
    if (method !== 'POST') throw new HttpError(405, 'method_not_allowed', 'Method not allowed.');
    return complete(env, user, projectId, fileId);
  }
  throw new HttpError(404, 'not_found', 'Unknown API route.');
}

async function uploadState(env, row) {
  const multipart = row.size > PART_SIZE;
  let uploadedParts = [];
  if (row.status === 'uploading' && multipart) {
    const { results } = await env.DB.prepare('SELECT part_number FROM file_parts WHERE user_id = ?1 AND project_id = ?2 AND file_id = ?3 ORDER BY part_number')
      .bind(row.user_id, row.project_id, row.id).all();
    uploadedParts = results.map((r) => r.part_number);
  }
  return { fileId: row.id, status: row.status, size: row.size, multipart, partSize: PART_SIZE, parts: partsCount(row.size), uploadedParts };
}

// POST {fileId, name, type, size}: reserves the size in the quota and starts the upload (or says the file is already there).
async function createUpload(request, env, user, projectId) {
  needCloud(env);
  await requirePro(env, user, HttpError);
  const b = await readJson(request);
  const fileId = String(b.fileId || '');
  if (!FILE_ID.test(fileId)) throw new HttpError(400, 'invalid_file_id', 'File id: 8-64 letters, digits, - or _.');
  const size = Number(b.size);
  if (!Number.isSafeInteger(size) || size <= 0) throw new HttpError(400, 'invalid_size', 'size must be a positive integer.');
  if (size > MAX_FILE_BYTES) throw new HttpError(413, 'file_too_large', `A file can have at most ${MAX_FILE_BYTES} bytes.`, { maxFile: MAX_FILE_BYTES });
  const name = cleanName(b.name), type = cleanType(b.type, name);
  if (!type) throw new HttpError(415, 'invalid_media_type', 'Only audio and video files can be saved.');

  const old = await fileRow(env, user.id, projectId, fileId);
  if (old && old.size === size) {
    // same file again: nothing to send (already there), or the upload goes on where it stopped
    if (old.name !== name) await env.DB.prepare('UPDATE project_files SET name = ?4 WHERE user_id = ?1 AND project_id = ?2 AND id = ?3').bind(user.id, projectId, fileId, name).run();
    return json(await uploadState(env, old));
  }
  if (old) await dropFile(env, old);

  await limit(env, 'cloud:' + user.id, 3000, 3600e3, 'Too many uploads, try again later.');
  const c = await env.DB.prepare('SELECT COUNT(*) AS n FROM project_files WHERE user_id = ?1 AND project_id = ?2').bind(user.id, projectId).first();
  if (c.n >= MAX_FILES_PER_PROJECT) throw new HttpError(409, 'too_many_files', `At most ${MAX_FILES_PER_PROJECT} files per project.`);

  const quota = quotaOf(env), now = Date.now();
  // one statement: the quota check and the reservation cannot be split by another upload running at the same time
  const ins = await env.DB.prepare(
    `INSERT INTO project_files (user_id, project_id, id, name, type, size, status, upload_id, created_at, updated_at)
     SELECT ?1, ?2, ?3, ?4, ?5, ?6, 'uploading', NULL, ?7, ?7
     WHERE (SELECT COALESCE(SUM(size), 0) FROM project_files WHERE user_id = ?1)
         + (SELECT COALESCE(SUM(size), 0) FROM projects WHERE user_id = ?1) + ?6 <= ?8`
  ).bind(user.id, projectId, fileId, name, type, size, now, quota).run();
  if (!ins.meta || !ins.meta.changes) {
    throw new HttpError(413, 'quota_exceeded', 'Your online storage is full.', { used: await usedBytes(env, user.id), quota, needed: size });
  }
  if (size > PART_SIZE) {
    try {
      const mpu = await env.MEDIA.createMultipartUpload(keyOf(user.id, projectId, fileId), { httpMetadata: { contentType: type } });
      await env.DB.prepare('UPDATE project_files SET upload_id = ?4 WHERE user_id = ?1 AND project_id = ?2 AND id = ?3')
        .bind(user.id, projectId, fileId, mpu.uploadId).run();
    } catch (e) {
      await deleteFileRows(env, user.id, projectId, fileId);
      throw e;
    }
  }
  return json(await uploadState(env, await fileRow(env, user.id, projectId, fileId)), 201);
}

function bodyLength(request) {
  const raw = request.headers.get('Content-Length');
  const n = raw == null ? NaN : Number(raw);
  if (!Number.isSafeInteger(n) || n < 0) throw new HttpError(411, 'length_required', 'Content-Length is required.');
  if (!request.body) throw new HttpError(400, 'empty_body', 'The body is empty.');
  return n;
}
async function uploadingRow(env, user, projectId, fileId) {
  needCloud(env);
  await requirePro(env, user, HttpError);
  const row = await fileRow(env, user.id, projectId, fileId);
  if (!row) throw new HttpError(404, 'not_found', 'Upload not found: start it again.');
  if (row.status !== 'uploading') throw new HttpError(409, 'already_uploaded', 'This file is already saved.');
  return row;
}

// PUT raw body: a file of at most one part, in one go.
async function putWhole(request, env, user, projectId, fileId) {
  const row = await uploadingRow(env, user, projectId, fileId);
  if (row.size > PART_SIZE) throw new HttpError(409, 'use_multipart', 'Send this file part by part.');
  const n = bodyLength(request);
  if (n !== row.size) throw new HttpError(400, 'size_mismatch', `Expected ${row.size} bytes.`);
  const key = keyOf(user.id, projectId, fileId);
  const obj = await env.MEDIA.put(key, request.body, { httpMetadata: { contentType: row.type } });
  if (!obj || obj.size !== row.size) {
    await env.MEDIA.delete(key);
    throw new HttpError(400, 'size_mismatch', `Expected ${row.size} bytes.`);
  }
  await env.DB.prepare("UPDATE project_files SET status = 'ready', updated_at = ?4 WHERE user_id = ?1 AND project_id = ?2 AND id = ?3")
    .bind(user.id, projectId, fileId, Date.now()).run();
  return json({ ok: true, fileId, status: 'ready', size: row.size });
}

// PUT raw body: part n (1-based). Every part has PART_SIZE bytes except the last one.
async function putPart(request, env, user, projectId, fileId, nRaw) {
  const row = await uploadingRow(env, user, projectId, fileId);
  if (!row.upload_id) throw new HttpError(409, 'not_multipart', 'Send this file in one go.');
  const count = partsCount(row.size), n = Number(nRaw);
  if (!/^\d{1,5}$/.test(nRaw) || n < 1 || n > count) throw new HttpError(400, 'invalid_part', `Part number: 1 to ${count}.`);
  const expected = n < count ? PART_SIZE : row.size - (count - 1) * PART_SIZE;
  if (bodyLength(request) !== expected) throw new HttpError(400, 'size_mismatch', `Part ${n} must have ${expected} bytes.`);
  const mpu = env.MEDIA.resumeMultipartUpload(keyOf(user.id, projectId, fileId), row.upload_id);
  const part = await mpu.uploadPart(n, request.body);
  const now = Date.now();
  await env.DB.batch([
    env.DB.prepare(`INSERT INTO file_parts (user_id, project_id, file_id, part_number, etag, size, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
      ON CONFLICT(user_id, project_id, file_id, part_number) DO UPDATE SET etag = ?5, size = ?6, created_at = ?7`)
      .bind(user.id, projectId, fileId, n, part.etag, expected, now),
    env.DB.prepare('UPDATE project_files SET updated_at = ?4 WHERE user_id = ?1 AND project_id = ?2 AND id = ?3').bind(user.id, projectId, fileId, now),
  ]);
  return json({ ok: true, part: n });
}

async function complete(env, user, projectId, fileId) {
  const row = await uploadingRow(env, user, projectId, fileId);
  if (!row.upload_id) throw new HttpError(409, 'not_multipart', 'Send this file in one go.');
  const { results } = await env.DB.prepare('SELECT part_number, etag FROM file_parts WHERE user_id = ?1 AND project_id = ?2 AND file_id = ?3 ORDER BY part_number')
    .bind(user.id, projectId, fileId).all();
  const count = partsCount(row.size);
  const missing = [];
  for (let i = 1; i <= count; i++) if (!results.some((r) => r.part_number === i)) missing.push(i);
  if (missing.length) throw new HttpError(409, 'parts_missing', 'Some parts are missing.', { missing: missing.slice(0, 50) });
  const key = keyOf(user.id, projectId, fileId);
  const obj = await env.MEDIA.resumeMultipartUpload(key, row.upload_id).complete(results.map((r) => ({ partNumber: r.part_number, etag: r.etag })));
  if (!obj || obj.size !== row.size) {
    await dropFile(env, row);
    throw new HttpError(400, 'size_mismatch', 'The saved file does not have the expected size: send it again.');
  }
  await env.DB.batch([
    env.DB.prepare('DELETE FROM file_parts WHERE user_id = ?1 AND project_id = ?2 AND file_id = ?3').bind(user.id, projectId, fileId),
    env.DB.prepare("UPDATE project_files SET status = 'ready', upload_id = NULL, updated_at = ?4 WHERE user_id = ?1 AND project_id = ?2 AND id = ?3")
      .bind(user.id, projectId, fileId, Date.now()),
  ]);
  return json({ ok: true, fileId, status: 'ready', size: row.size });
}

// "bytes=a-b", "bytes=a-", "bytes=-n" (one range). Anything else: the whole file. Unsatisfiable: 'bad'.
export function parseRange(h, size) {
  if (!h) return null;
  const m = /^bytes=(\d*)-(\d*)$/.exec(h.trim());
  if (!m || (m[1] === '' && m[2] === '')) return null;
  if (m[1] === '') {
    const n = Number(m[2]);
    if (n === 0) return 'bad';
    return { offset: Math.max(0, size - n), length: Math.min(n, size) };
  }
  const start = Number(m[1]), end = m[2] === '' ? size - 1 : Math.min(Number(m[2]), size - 1);
  if (start >= size || end < start) return 'bad';
  return { offset: start, length: end - start + 1 };
}

// GET: the file, streamed from R2, only for its owner. Range requests get 206 (a <video> can seek).
async function download(request, env, user, projectId, fileId) {
  await requirePro(env, user, HttpError);
  needCloud(env);
  const row = await fileRow(env, user.id, projectId, fileId);
  if (!row || row.status !== 'ready') throw new HttpError(404, 'not_found', 'File not found.');
  const range = parseRange(request.headers.get('Range'), row.size);
  const base = {
    'Content-Type': row.type, 'Accept-Ranges': 'bytes', 'Cache-Control': 'private, no-store',
    'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'none'; sandbox",
    'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(row.name)}`,
  };
  if (range === 'bad') return new Response(null, { status: 416, headers: { ...base, 'Content-Range': `bytes */${row.size}` } });
  const obj = await env.MEDIA.get(keyOf(user.id, projectId, fileId), range ? { range } : undefined);
  if (!obj || !obj.body) throw new HttpError(404, 'not_found', 'File not found.');
  const h = new Headers(base);
  if (obj.httpEtag) h.set('ETag', obj.httpEtag);
  if (range) {
    h.set('Content-Range', `bytes ${range.offset}-${range.offset + range.length - 1}/${row.size}`);
    h.set('Content-Length', String(range.length));
    return new Response(obj.body, { status: 206, headers: h });
  }
  h.set('Content-Length', String(row.size));
  return new Response(obj.body, { status: 200, headers: h });
}

// ---- after a project save: the files it uses must be there; the ones it no longer uses are erased -----------------
export async function checkProjectFiles(env, userId, projectId, fileIds) {
  if (!Array.isArray(fileIds) || fileIds.length > MAX_FILES_PER_PROJECT || !fileIds.every((f) => typeof f === 'string' && FILE_ID.test(f))) {
    throw new HttpError(400, 'invalid_files', 'files must be a list of file ids.');
  }
  if (fileIds.length) needCloud(env);
  const { results } = await env.DB.prepare("SELECT id, size FROM project_files WHERE user_id = ?1 AND project_id = ?2 AND status = 'ready'").bind(userId, projectId).all();
  const ready = new Map(results.map((r) => [r.id, r.size]));
  const missing = fileIds.filter((f) => !ready.has(f));
  if (missing.length) throw new HttpError(409, 'files_missing', 'Some files of this project are not uploaded yet.', { missing });
  return [...new Set(fileIds)].reduce((s, f) => s + ready.get(f), 0);
}
export async function dropUnusedFiles(env, userId, projectId, fileIds) {
  const keep = new Set(fileIds);
  const { results } = await env.DB.prepare('SELECT * FROM project_files WHERE user_id = ?1 AND project_id = ?2').bind(userId, projectId).all();
  await dropFiles(env, userId, projectId, results.filter((r) => !keep.has(r.id)));
}
export async function readyFiles(env, userId, projectId) {
  const { results } = await env.DB.prepare("SELECT id, name, type, size FROM project_files WHERE user_id = ?1 AND project_id = ?2 AND status = 'ready' ORDER BY created_at")
    .bind(userId, projectId).all();
  return results;
}

// ---- the 6-month rule -------------------------------------------------------------------------------------------
// A project not opened (or saved) for 6 months is deleted, with its files. An e-mail warns its owner at least 14 days
// before; without a sent e-mail nothing is ever deleted. Opening the project (GET /api/projects/:id) resets the clock.
// Runs from (1) the scheduled Worker in workers/cloud-cleanup (daily cron), (2) POST /api/cron/cloud-cleanup with
// CRON_SECRET (an outside cron), (3) lazily, at most every 6 hours, after a GET /api/projects (context.waitUntil).
const WARN_TEXTS = {
  fr: {
    subject: 'Tes projets Stalak vont être supprimés',
    intro: 'Tu n’as pas ouvert ces projets sauvegardés en ligne depuis bientôt 6 mois :',
    when: (d) => `Ils seront supprimés le ${d}, avec leurs vidéos et leur son.`,
    keep: 'Pour en garder un, ouvre-le simplement depuis Compte → Mes projets sur https://stalak.app/#compte',
  },
  en: {
    subject: 'Your Stalak projects will be deleted',
    intro: 'You haven’t opened these projects saved online for almost 6 months:',
    when: (d) => `They will be deleted on ${d}, with their videos and sound.`,
    keep: 'To keep one, just open it from Account → My projects at https://stalak.app/en/#compte',
  },
};
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
export function warningEmail(lang, names, deleteAt) {
  const t = WARN_TEXTS[lang] || WARN_TEXTS.fr;
  const d = new Date(deleteAt).toLocaleDateString(lang === 'en' ? 'en-GB' : 'fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' });
  const list = names.map((n) => '• ' + (n || 'Stalak')).join('\n');
  const text = `${t.intro}\n\n${list}\n\n${t.when(d)}\n${t.keep}\n\nStalak — stalak.app`;
  const html = `<!doctype html><html lang="${lang === 'en' ? 'en' : 'fr'}"><body style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#111;padding:24px">
<p>${esc(t.intro)}</p><ul>${names.map((n) => `<li>${esc(n || 'Stalak')}</li>`).join('')}</ul>
<p>${esc(t.when(d))}<br>${esc(t.keep)}</p>
<p style="color:#888;font-size:12px">Stalak — <a href="https://stalak.app" style="color:#888">stalak.app</a></p></body></html>`;
  return { subject: t.subject, text, html };
}
async function sendWarning(env, to, lang, names, deleteAt) {
  const msg = warningEmail(lang, names, deleteAt);
  if (!env.RESEND_API_KEY) {
    if (isDev(env)) { console.log(`[stalak dev] cloud warning for ${to}: ${names.join(', ')}`); return true; }
    return false;
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: env.EMAIL_FROM || 'Stalak <login@stalak.app>', to: [to], subject: msg.subject, text: msg.text, html: msg.html }),
  });
  return res.ok;
}

// `max` bounds each step: about 3 + 4 x max D1 queries in all (the Free plan allows 50 per invocation, Paid 1000).
export async function cleanupCloud(env, now = Date.now(), { max = 100 } = {}) {
  const out = { warned: 0, deleted: 0, staleUploads: 0, orphans: 0 };
  const last = 'COALESCE(p.opened_at, p.updated_at)';
  // 1. warnings: one e-mail per user, for the projects that reach 6 months in 14 days or less
  const { results: toWarn } = await env.DB.prepare(
    `SELECT p.user_id, p.id, p.name, ${last} AS last, u.email, u.lang FROM projects p JOIN users u ON u.id = p.user_id
     WHERE p.warned_at IS NULL AND ${last} < ?1 ORDER BY p.user_id LIMIT ?2`
  ).bind(now - (KEEP_MS - WARN_BEFORE_MS), max).all();
  const byUser = new Map();
  for (const r of toWarn) { if (!byUser.has(r.user_id)) byUser.set(r.user_id, []); byUser.get(r.user_id).push(r); }
  for (const rows of byUser.values()) {
    const deleteAt = Math.max(now + WARN_BEFORE_MS, Math.min(...rows.map((r) => r.last + KEEP_MS)));
    let ok = false;
    try { ok = await sendWarning(env, rows[0].email, rows[0].lang, rows.map((r) => r.name), deleteAt); } catch { ok = false; }
    if (!ok) continue;
    await env.DB.batch(rows.map((r) => env.DB.prepare('UPDATE projects SET warned_at = ?3 WHERE user_id = ?1 AND id = ?2').bind(r.user_id, r.id, now)));
    out.warned += rows.length;
  }
  // 2. deletion: 6 months without opening AND warned at least 14 days ago
  const { results: toDelete } = await env.DB.prepare(
    `SELECT p.user_id, p.id FROM projects p WHERE ${last} < ?1 AND p.warned_at IS NOT NULL AND p.warned_at <= ?2 LIMIT ?3`
  ).bind(now - KEEP_MS, now - WARN_BEFORE_MS, max).all();
  for (const r of toDelete) {
    await deleteProjectMedia(env, r.user_id, r.id);   // 2 queries
    await env.DB.prepare('DELETE FROM projects WHERE user_id = ?1 AND id = ?2').bind(r.user_id, r.id).run();
    out.deleted++;
  }
  // 3. uploads left unfinished, and files of a project that was never saved
  const { results: stale } = await env.DB.prepare(
    `SELECT * FROM project_files f WHERE (f.status = 'uploading' AND f.updated_at < ?1)
       OR (f.created_at < ?2 AND NOT EXISTS (SELECT 1 FROM projects p WHERE p.user_id = f.user_id AND p.id = f.project_id)) LIMIT ?3`
  ).bind(now - STALE_UPLOAD_MS, now - ORPHAN_MS, max).all();
  const groups = new Map();
  for (const r of stale) {
    const k = r.user_id + '/' + r.project_id;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(r);
    if (r.status === 'uploading' && r.updated_at < now - STALE_UPLOAD_MS) out.staleUploads++; else out.orphans++;
  }
  for (const rows of groups.values()) await dropFiles(env, rows[0].user_id, rows[0].project_id, rows);
  return out;
}

// At most once every 6 hours, whoever triggers it (the counter lives in rate_limits).
export async function maybeCleanup(env, ctx, now = Date.now()) {
  try {
    const r = await hit(env, 'cron:cloud-cleanup', CLEANUP_EVERY_MS, now);
    if (r.count !== 1) return false;
    const p = cleanupCloud(env, now, { max: 8 }).catch((e) => console.error('[stalak] cloud cleanup', e && e.stack ? e.stack : e));
    if (ctx && typeof ctx.waitUntil === 'function') ctx.waitUntil(p); else await p;
    return true;
  } catch (e) {
    console.error('[stalak] cloud cleanup', e);
    return false;
  }
}
