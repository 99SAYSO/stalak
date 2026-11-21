// « Publier sur TikTok » and « Mes stats » (domain « Réseaux sociaux », 21/11/2026).
// Needs the TikTok link of social.js (SOCIAL_CONNECT_ENABLED = "1", TikTok keys, SOCIAL_TOKEN_KEY). Tokens never leave the server.
//
//   GET  /api/tiktok/creator                 -> creator_info, read again before every sending (Pro)
//   POST /api/tiktok/publish                 -> checks the choices against creator_info, then asks TikTok for an upload
//                                               address (Direct Post, or a draft in the TikTok inbox) (Pro)
//   PUT  /api/tiktok/publish/:id/chunk/:n    -> one piece of the file (application/octet-stream), passed on to TikTok
//   GET  /api/tiktok/publish/:id             -> where the sending is (status/fetch, at most one call every 3 s)
//   GET  /api/tiktok/stats?tz=-60            -> « Mes stats »: account + last videos for everyone who linked TikTok;
//                                               the detailed analysis (up to 100 videos) for Pro only, computed here
//
// Decisions of the owner (21/11): « Publier sur TikTok » is for Pro (TikTok forbids a watermark added by the app, and the
// free export carries Stalak's); « Mes stats »: a free preview, the analysis for Pro; never promise that Stalak makes anyone
// famous. The analysis only says what TikTok's numbers show: TikTok gives no retention curve, so « which passage of the song
// worked » is only computed for the videos sent from Stalak (we know their passage).
//
// Docs read on 21/11/2026 (quoted in docs/social/TIKTOK_PUBLIER.md):
//   https://developers.tiktok.com/doc/content-sharing-guidelines
//   https://developers.tiktok.com/doc/content-posting-api-reference-query-creator-info
//   https://developers.tiktok.com/doc/content-posting-api-reference-direct-post
//   https://developers.tiktok.com/doc/content-posting-api-reference-upload-video
//   https://developers.tiktok.com/doc/content-posting-api-media-transfer-guide
//   https://developers.tiktok.com/doc/content-posting-api-reference-get-video-status
//   https://developers.tiktok.com/doc/tiktok-api-v2-get-user-info  https://developers.tiktok.com/doc/tiktok-api-v2-video-list
//   https://developers.tiktok.com/doc/tiktok-api-v2-video-object
import { HttpError, json, readJson } from './http.js';
import { requireUser } from './auth.js';
import { randomId } from './crypto.js';
import { limit } from './ratelimit.js';
import { requirePlan, planFor, planHas } from './entitlements.js';
import { socialAccessToken, sealToken, openToken, socialProviders } from './social.js';

const API = 'https://open.tiktokapis.com';
export const CHUNK = 10 * 1024 * 1024;            // 10 MB: TikTok wants 5 to 64 MB per piece, the last one up to 128 MB
const MIN_CHUNK = 5 * 1024 * 1024;
const MAX_SIZE = 2 * 1024 * 1024 * 1024;           // 2 GB (TikTok: 4 GB); a Stalak export is far smaller
const UPLOAD_TTL = 55 * 60e3;                      // TikTok's upload address lasts 1 hour
const PRIVACY = ['PUBLIC_TO_EVERYONE', 'MUTUAL_FOLLOW_FRIENDS', 'FOLLOWER_OF_CREATOR', 'SELF_ONLY'];
const VIDEO_FIELDS = 'id,create_time,cover_image_url,share_url,title,video_description,duration,like_count,comment_count,share_count,view_count';
const httpsUrl = (v) => (/^https:\/\/[^\s"'<>]{1,1990}$/.test(String(v || '')) ? String(v) : null);
// the address TikTok gives for sending the file: only TikTok's own upload hosts (revue de sécurité 21/11: Stalak's server
// never sends a file anywhere else, even if TikTok's answer were changed on the way)
const uploadUrl = (v) => { const u = httpsUrl(v); if (!u) return null; try { return /^open-upload(-[a-z0-9]+)*\.tiktokapis\.com$/i.test(new URL(u).hostname) ? u : null; } catch { return null; } };
const cut = (v, n) => (v == null ? '' : String(v).slice(0, n));
const int = (v) => (Number.isFinite(Number(v)) ? Math.max(0, Math.round(Number(v))) : 0);

// TikTok's error codes → what the app can say. Unknown codes stay generic (never TikTok's raw message to the page).
const TT_ERRORS = {
  spam_risk_too_many_posts: [429, 'tt_too_many_posts', 'TikTok: the daily posting limit of this account is reached. Try again tomorrow.'],
  spam_risk_too_many_pending_share: [429, 'tt_too_many_drafts', 'TikTok: too many drafts are waiting in the TikTok app. Finish or delete them first.'],
  spam_risk_user_banned_from_posting: [403, 'tt_banned', 'TikTok does not let this account post right now.'],
  reached_active_user_cap: [429, 'tt_app_cap', 'TikTok: too many people are posting from Stalak today. Try again later.'],
  unaudited_client_can_only_post_to_private_accounts: [403, 'tt_private_only', 'For now TikTok only lets Stalak post to a private TikTok account.'],
  privacy_level_option_mismatch: [400, 'tt_privacy', 'This visibility is not available for this account.'],
  scope_not_authorized: [409, 'tt_scope', 'Link TikTok again and accept every permission.'],
  access_token_invalid: [409, 'reconnect_needed', 'The TikTok link has expired: connect the account again.'],
  rate_limit_exceeded: [429, 'tt_rate', 'TikTok asks to wait a little. Try again in a minute.'],
};
function ttFail(body, status, where) {
  const code = String((body && body.error && body.error.code) || '');
  const known = TT_ERRORS[code];
  console.warn('[stalak] tiktok', where, status, code || '-', body && body.error && body.error.log_id);
  if (known) return new HttpError(known[0], known[1], known[2]);
  return new HttpError(502, 'tt_error', 'TikTok did not answer as expected. Try again in a moment.');
}
async function tt(token, path, body, method = 'POST') {
  const res = await fetch(API + path, {
    method, headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json; charset=UTF-8' },
    body: method === 'POST' ? JSON.stringify(body || {}) : undefined,
  });
  const text = await res.text().catch(() => '');
  let b = {};
  try { b = JSON.parse(text); } catch {}
  const ok = res.ok && (!b.error || !b.error.code || b.error.code === 'ok');
  return { res, body: b && typeof b === 'object' ? b : {}, ok, text };
}

// the TikTok row of the person: token, granted permissions
async function account(env, user) {
  if (env.SOCIAL_CONNECT_ENABLED !== '1' || !socialProviders(env).includes('tiktok')) throw new HttpError(404, 'not_enabled', 'TikTok is not available yet.');
  const row = await env.DB.prepare("SELECT scopes FROM social_accounts WHERE user_id = ?1 AND provider = 'tiktok'").bind(user.id).first();
  if (!row) throw new HttpError(409, 'not_connected', 'Link your TikTok account first.');
  const token = await socialAccessToken(env, user.id, 'tiktok');
  return { token, scopes: String(row.scopes || '').split(/[,\s]+/).filter(Boolean) };
}
function needScope(scopes, s) { if (!scopes.includes(s)) throw new HttpError(409, 'tt_scope', 'Link TikTok again and accept every permission.'); }

async function creatorInfo(token) {
  const r = await tt(token, '/v2/post/publish/creator_info/query/', {});
  if (!r.ok) throw ttFail(r.body, r.res.status, 'creator_info');
  const d = r.body.data || {};
  return {
    username: cut(d.creator_username, 100), nickname: cut(d.creator_nickname, 100), avatarUrl: httpsUrl(d.creator_avatar_url),
    privacyOptions: (Array.isArray(d.privacy_level_options) ? d.privacy_level_options : []).filter((p) => PRIVACY.includes(p)),
    commentDisabled: !!d.comment_disabled, duetDisabled: !!d.duet_disabled, stitchDisabled: !!d.stitch_disabled,
    maxDuration: int(d.max_video_post_duration_sec) || null,
  };
}

// the pieces of the file, as TikTok wants them (media transfer guide): under 5 MB, or under 2 pieces' worth, one piece;
// otherwise pieces of 10 MB, the last one taking the rest (less than 20 MB, TikTok accepts up to 128 MB)
export function chunkPlan(size) {
  const n = Math.max(1, Math.floor(size / CHUNK));
  return n === 1 ? { chunkSize: size, chunks: 1 } : { chunkSize: CHUNK, chunks: n };
}

export async function tiktok(request, env, method, rest, now = Date.now()) {
  const [what, id, sub, n] = rest;
  if (what === 'creator' && rest.length === 1) {
    if (method !== 'GET') throw new HttpError(405, 'method_not_allowed', 'Method not allowed.');
    const user = await requireUser(request, env);
    const { token, scopes } = await account(env, user);
    await requirePlan(env, user, 'tiktok');
    needScope(scopes, 'video.publish');
    await limit(env, `tt:ci:${user.id}`, 20, 60e3, 'Too many requests, wait a minute.');
    return json({ creator: await creatorInfo(token), canDraft: scopes.includes('video.upload') }, 200, { 'Cache-Control': 'no-store' });
  }
  if (what === 'publish' && rest.length === 1) {
    if (method !== 'POST') throw new HttpError(405, 'method_not_allowed', 'Method not allowed.');
    return publishStart(request, env, now);
  }
  if (what === 'publish' && rest.length === 2) {
    if (method !== 'GET') throw new HttpError(405, 'method_not_allowed', 'Method not allowed.');
    return publishStatus(request, env, id, now);
  }
  if (what === 'publish' && rest.length === 4 && sub === 'chunk') {
    if (method !== 'PUT') throw new HttpError(405, 'method_not_allowed', 'Method not allowed.');
    return publishChunk(request, env, id, n, now);
  }
  if (what === 'stats' && rest.length === 1) {
    if (method !== 'GET') throw new HttpError(405, 'method_not_allowed', 'Method not allowed.');
    return stats(request, env, now);
  }
  throw new HttpError(404, 'not_found', 'Unknown API route.');
}

// ---- sending a video ------------------------------------------------------------------------------
async function publishStart(request, env, now) {
  const user = await requireUser(request, env);
  const { token, scopes } = await account(env, user);
  await requirePlan(env, user, 'tiktok');
  const b = await readJson(request, 16 * 1024);
  const mode = b.mode === 'draft' ? 'draft' : b.mode === 'direct' ? 'direct' : null;
  if (!mode) throw new HttpError(400, 'bad_mode', 'mode must be direct or draft.');
  needScope(scopes, mode === 'draft' ? 'video.upload' : 'video.publish');
  const size = Number(b.size);
  if (!Number.isInteger(size) || size < 1 || size > MAX_SIZE) throw new HttpError(400, 'bad_size', 'Video size is not valid.');
  const duration = Number(b.duration);
  if (!(duration > 0 && duration < 36000)) throw new HttpError(400, 'bad_duration', 'Video duration is not valid.');
  // the person said yes to sending, after seeing the preview (Content Sharing Guidelines, 5c)
  if (b.consent !== true) throw new HttpError(400, 'consent_required', 'Agree to TikTok’s terms before posting.');
  await limit(env, `tt:pub:${user.id}`, 10, 3600e3, 'Too many videos sent this hour. Try again later.');

  const meta = sanitizeMeta(b.meta);
  let body, path, privacy = null, creator = null;
  if (mode === 'direct') {
    // read again just before sending, as TikTok asks (1a-1c, 2b, 2c)
    creator = await creatorInfo(token);
    if (creator.maxDuration && duration > creator.maxDuration + 0.5) {
      throw new HttpError(400, 'tt_too_long', `This TikTok account can post videos of ${creator.maxDuration} s at most.`, { max: creator.maxDuration });
    }
    privacy = String(b.privacy || '');
    if (!creator.privacyOptions.includes(privacy)) throw new HttpError(400, 'tt_privacy', 'Choose who can see the video.');
    const c = b.commercial || {};
    const on = c.on === true, yourBrand = on && c.yourBrand === true, branded = on && c.branded === true;
    if (on && !yourBrand && !branded) throw new HttpError(400, 'tt_commercial', 'Say whether the video promotes yourself, a third party, or both.');
    if (branded && privacy === 'SELF_ONLY') throw new HttpError(400, 'tt_branded_private', 'Branded content cannot be private.');
    const title = String(b.title == null ? '' : b.title).replace(/\r\n?/g, '\n');
    if (title.length > 2200) throw new HttpError(400, 'tt_title', 'The caption is too long (2,200 characters at most).');
    body = {
      post_info: {
        title, privacy_level: privacy,
        // the boxes are off unless the person ticks them, and stay off when the account does not allow them (2c)
        disable_comment: creator.commentDisabled || b.comment !== true,
        disable_duet: creator.duetDisabled || b.duet !== true,
        disable_stitch: creator.stitchDisabled || b.stitch !== true,
        brand_organic_toggle: yourBrand, brand_content_toggle: branded,
      },
      source_info: {},
    };
    path = '/v2/post/publish/video/init/';
  } else {
    body = { source_info: {} };
    path = '/v2/post/publish/inbox/video/init/';
  }
  const plan = chunkPlan(size);
  body.source_info = { source: 'FILE_UPLOAD', video_size: size, chunk_size: plan.chunkSize, total_chunk_count: plan.chunks };
  const r = await tt(token, path, body);
  if (!r.ok || !r.body.data || !r.body.data.publish_id || !uploadUrl(r.body.data.upload_url)) throw ttFail(r.body, r.res.status, 'init ' + mode);
  const id = randomId('ttp_');
  await env.DB.prepare(
    `INSERT INTO tiktok_posts (id, user_id, publish_id, mode, status, upload_url_enc, video_size, chunk_size, chunk_count, privacy,
       creator_username, meta_json, created_at, updated_at, expires_at)
     VALUES (?1, ?2, ?3, ?4, 'uploading', ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?12, ?13)`
  ).bind(id, user.id, cut(r.body.data.publish_id, 64), mode, await sealToken(env, r.body.data.upload_url, `${user.id}:tiktok:upload:${id}`),
    size, plan.chunkSize, plan.chunks, privacy, creator ? creator.username || null : null, meta ? JSON.stringify(meta) : null, now, now + UPLOAD_TTL).run();
  return json({ id, mode, chunkSize: plan.chunkSize, chunks: plan.chunks });
}

function sanitizeMeta(m) {
  if (!m || typeof m !== 'object') return null;
  const n = (v) => (Number.isFinite(Number(v)) ? Math.round(Number(v) * 10) / 10 : null);
  const o = { song: cut(m.song, 120) || null, start: n(m.start), end: n(m.end), format: /^(tiktok|reels|shorts|clip|16:9|9:16)$/.test(String(m.format)) ? String(m.format) : null };
  return o.song || o.start != null ? o : null;
}

async function ownPost(env, user, id) {
  if (!/^ttp_[0-9a-f]{24}$/.test(String(id || ''))) throw new HttpError(404, 'not_found', 'Unknown sending.');
  const row = await env.DB.prepare('SELECT * FROM tiktok_posts WHERE id = ?1 AND user_id = ?2').bind(id, user.id).first();
  if (!row) throw new HttpError(404, 'not_found', 'Unknown sending.');
  return row;
}

async function publishChunk(request, env, id, nRaw, now) {
  const user = await requireUser(request, env);
  const row = await ownPost(env, user, id);
  const n = Number(nRaw);
  if (row.status !== 'uploading' || !row.upload_url_enc) throw new HttpError(409, 'not_uploading', 'This video is already sent.');
  if (row.expires_at < now) {
    await env.DB.prepare("UPDATE tiktok_posts SET status = 'failed', fail_reason = 'upload_expired', upload_url_enc = NULL, updated_at = ?2 WHERE id = ?1").bind(id, now).run();
    throw new HttpError(410, 'upload_expired', 'The sending took too long. Start again.');
  }
  // the pieces go in order (media transfer guide)
  if (!Number.isInteger(n) || n !== row.chunks_done) throw new HttpError(409, 'bad_chunk', 'Pieces must be sent in order.', { next: row.chunks_done });
  const first = n * row.chunk_size, last = n === row.chunk_count - 1 ? row.video_size - 1 : first + row.chunk_size - 1;
  const want = last - first + 1;
  const len = Number(request.headers.get('Content-Length') || -1);
  if (len !== -1 && len !== want) throw new HttpError(400, 'bad_length', 'Wrong piece size.');
  const buf = await request.arrayBuffer();
  if (buf.byteLength !== want) throw new HttpError(400, 'bad_length', 'Wrong piece size.');
  const url = await openToken(env, row.upload_url_enc, `${user.id}:tiktok:upload:${id}`);
  const res = await fetch(url, { method: 'PUT', body: buf, headers: {
    'Content-Type': 'video/mp4', 'Content-Length': String(want), 'Content-Range': `bytes ${first}-${last}/${row.video_size}` } });
  if (!(res.status === 200 || res.status === 201 || res.status === 206)) {
    console.warn('[stalak] tiktok upload', res.status);
    if (res.status === 403) {
      await env.DB.prepare("UPDATE tiktok_posts SET status = 'failed', fail_reason = 'upload_expired', upload_url_enc = NULL, updated_at = ?2 WHERE id = ?1").bind(id, now).run();
      throw new HttpError(410, 'upload_expired', 'The sending took too long. Start again.');
    }
    throw new HttpError(502, 'tt_upload', 'TikTok did not take this piece. Try again.');
  }
  const done = n + 1, complete = done === row.chunk_count;
  await env.DB.prepare(
    `UPDATE tiktok_posts SET chunks_done = ?2, status = ?3, upload_url_enc = ?4, updated_at = ?5 WHERE id = ?1`
  ).bind(id, done, complete ? 'processing' : 'uploading', complete ? null : row.upload_url_enc, now).run();
  return json({ id, done, chunks: row.chunk_count, status: complete ? 'processing' : 'uploading' });
}

const STATUS_MAP = { PUBLISH_COMPLETE: 'published', SEND_TO_USER_INBOX: 'inbox', FAILED: 'failed', PROCESSING_UPLOAD: 'processing', PROCESSING_DOWNLOAD: 'processing' };
const FAIL_OK = /^[a-z_]{1,60}$/;
function postView(row) {
  const url = row.post_id ? `https://www.tiktok.com/${row.creator_username ? '@' + encodeURIComponent(row.creator_username) : '@'}/video/${encodeURIComponent(row.post_id)}` : null;
  return { id: row.id, mode: row.mode, status: row.status, failReason: row.fail_reason || null, url, done: row.chunks_done, chunks: row.chunk_count };
}
async function publishStatus(request, env, id, now) {
  const user = await requireUser(request, env);
  let row = await ownPost(env, user, id);
  const asking = row.status === 'processing';
  if (asking && (!row.checked_at || now - row.checked_at >= 3000)) {
    await env.DB.prepare('UPDATE tiktok_posts SET checked_at = ?2 WHERE id = ?1').bind(id, now).run();
    const { token } = await account(env, user);
    const r = await tt(token, '/v2/post/publish/status/fetch/', { publish_id: row.publish_id });
    if (r.ok && r.body.data) {
      const d = r.body.data, st = STATUS_MAP[d.status] || 'processing';
      // TikTok sends these ids as 64-bit numbers: read as JSON they lose their last digits, so they are taken from the text
      const m = r.text.match(/"publicaly_available_post_id"\s*:\s*\[\s*"?([0-9]{1,30})/);
      const postId = m ? m[1] : null;
      const fail = st === 'failed' ? (FAIL_OK.test(String(d.fail_reason || '')) ? String(d.fail_reason) : 'internal') : null;
      await env.DB.prepare('UPDATE tiktok_posts SET status = ?2, fail_reason = ?3, post_id = COALESCE(?4, post_id), updated_at = ?5 WHERE id = ?1')
        .bind(id, st, fail, postId, now).run();
      row = { ...row, status: st, fail_reason: fail, post_id: postId || row.post_id };
    } else if (!r.ok) console.warn('[stalak] tiktok status', r.res.status, r.body.error && r.body.error.code);
  }
  return json(postView(row), 200, { 'Cache-Control': 'no-store' });
}

// ---- « Mes stats » ------------------------------------------------------------------------------------
async function stats(request, env, now) {
  const user = await requireUser(request, env);
  const { token, scopes } = await account(env, user);
  needScope(scopes, 'user.info.stats'); needScope(scopes, 'video.list');
  await limit(env, `tt:st:${user.id}`, 30, 3600e3, 'Too many requests, try again later.');
  const { plan } = await planFor(env, user);
  const pro = planHas(plan, 'tiktok');
  const tz = Math.max(-840, Math.min(840, Math.round(Number(new URL(request.url).searchParams.get('tz')) || 0)));

  const u = await tt(token, '/v2/user/info/?fields=open_id,display_name,avatar_url,follower_count,following_count,likes_count,video_count', null, 'GET');
  if (!u.ok) throw ttFail(u.body, u.res.status, 'user_info');
  const ui = (u.body.data && u.body.data.user) || {};
  const videos = [];
  let cursor = null;
  for (let page = 0; page < (pro ? 5 : 1); page++) {
    const r = await tt(token, '/v2/video/list/?fields=' + VIDEO_FIELDS, cursor ? { max_count: 20, cursor } : { max_count: pro ? 20 : 10 });
    if (!r.ok) throw ttFail(r.body, r.res.status, 'video_list');
    const d = r.body.data || {};
    for (const v of Array.isArray(d.videos) ? d.videos : []) videos.push(v);
    if (!d.has_more || !d.cursor) break;
    cursor = d.cursor;
  }
  const clean = videos.map((v) => ({
    id: /^[0-9]{1,30}$/.test(String(v.id)) ? String(v.id) : null, createdAt: int(v.create_time) * 1000,
    title: cut(v.title || v.video_description, 150), cover: httpsUrl(v.cover_image_url), url: httpsUrl(v.share_url),
    duration: int(v.duration), views: int(v.view_count), likes: int(v.like_count), comments: int(v.comment_count), shares: int(v.share_count),
  })).filter((v) => v.id);
  const acct = { displayName: cut(ui.display_name, 100), avatarUrl: httpsUrl(ui.avatar_url), followers: int(ui.follower_count),
    following: int(ui.following_count), likes: int(ui.likes_count), videos: int(ui.video_count) };
  if (!pro) {
    // the free preview (decision of 21/11): followers, views and likes of the last videos
    return json({ pro: false, account: acct, videos: clean.slice(0, 10).map((v) => ({ id: v.id, createdAt: v.createdAt, title: v.title,
      cover: v.cover, url: v.url, views: v.views, likes: v.likes })) }, 200, { 'Cache-Control': 'no-store' });
  }
  const { results: sent } = await env.DB.prepare("SELECT post_id, meta_json FROM tiktok_posts WHERE user_id = ?1 AND post_id IS NOT NULL").bind(user.id).all();
  const fromStalak = new Map(sent.map((s) => [String(s.post_id), safeJson(s.meta_json)]));
  for (const v of clean) { v.stalak = fromStalak.has(v.id); v.passage = fromStalak.get(v.id) || null; }
  return json({ pro: true, account: acct, videos: clean, analysis: analyse(clean, tz, now) }, 200, { 'Cache-Control': 'no-store' });
}
function safeJson(s) { try { return s ? JSON.parse(s) : null; } catch { return null; } }

// ---- the Pro analysis: only what the numbers show, with how many videos are behind each one -----------
export const MIN_N = 3;
export function median(a) {
  if (!a.length) return null;
  const s = [...a].sort((x, y) => x - y), m = s.length >> 1;
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
}
function groups(videos, keyOf) {
  const g = new Map();
  for (const v of videos) for (const k of [].concat(keyOf(v)).filter((x) => x != null)) { if (!g.has(k)) g.set(k, []); g.get(k).push(v.views); }
  return [...g].map(([key, views]) => ({ key, n: views.length, medianViews: median(views), enough: views.length >= MIN_N }))
    .sort((a, b) => (b.enough - a.enough) || (b.medianViews - a.medianViews));
}
export const hashtagsOf = (t) => [...new Set((String(t || '').toLowerCase().match(/#[\p{L}\p{N}_]{2,40}/gu) || []))];
const durBucket = (d) => (d <= 15 ? '0-15' : d <= 30 ? '16-30' : d <= 60 ? '31-60' : '61+');
export function analyse(videos, tz, now = Date.now()) {
  const local = (ms) => new Date(ms - tz * 60e3);   // tz = Date.getTimezoneOffset() of the person (minutes, UTC − local)
  const eng = (v) => (v.views > 0 ? (v.likes + v.comments + v.shares) / v.views : null);
  const by = (k) => [...videos].sort((a, b) => b[k] - a[k]);
  const eRates = videos.map(eng).filter((x) => x != null);
  const songs = new Map();
  for (const v of videos) if (v.stalak && v.passage && v.passage.song && v.passage.start != null) {
    if (!songs.has(v.passage.song)) songs.set(v.passage.song, []);
    songs.get(v.passage.song).push({ start: v.passage.start, end: v.passage.end, views: v.views, id: v.id });
  }
  return {
    n: videos.length,
    medianViews: median(videos.map((v) => v.views)),
    engagement: eRates.length ? Math.round(median(eRates.map((x) => x * 10000))) / 100 : null,   // %, median
    top: by('views').slice(0, 3).map((v) => v.id),
    flop: videos.length >= 6 ? by('views').slice(-3).reverse().map((v) => v.id) : [],
    weekday: groups(videos, (v) => local(v.createdAt).getUTCDay()),
    hour: groups(videos, (v) => { const h = local(v.createdAt).getUTCHours(); return `${String(h - (h % 3)).padStart(2, '0')}-${String(h - (h % 3) + 3).padStart(2, '0')}`; }),
    duration: groups(videos, (v) => durBucket(v.duration)),
    hashtags: groups(videos, (v) => hashtagsOf(v.title)).filter((g) => g.n >= 2).slice(0, 8),
    stalak: groups(videos, (v) => (v.stalak ? 'stalak' : 'other')),
    // the passage of a song: only between videos sent from Stalak with the same song
    passages: [...songs].filter(([, l]) => l.length >= 2).map(([song, l]) => ({ song, videos: l.sort((a, b) => b.views - a.views) })),
  };
}
