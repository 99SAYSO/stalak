// All /api/* routes. Entry point: functions/api/[[path]].js
import { HttpError, json, errorResponse, checkCsrf, readJson, readText, clearSessionCookie } from './http.js';
import { currentUser, requireUser, logout, loginPassword, setPassword, recentCodeSession, signup, signupVerify, loginVerify, forgot, reset, failKey } from './auth.js';
import { oauthStart, oauthCallback, enabledProviders, PROVIDERS } from './oauth.js';
import { updateProfile, avatar, avatarUrl, AVATAR_TYPES } from './profile.js';
import { entitlementsFor, requirePro } from './entitlements.js';
import { handleWebhook, portalLinks, cancelSubscriptionNow } from './paddle.js';
import { social } from './social.js';
import { projectFiles, storageInfo, checkProjectFiles, dropUnusedFiles, readyFiles, deleteProjectMedia, deleteUserMedia, maybeCleanup, cleanupCloud, cloudAvailable } from './cloud.js';
import { timingSafeEqual } from './crypto.js';

const PROJECT_MAX_BYTES = 256 * 1024; // ~200 KB of project JSON + envelope
const PROJECT_MAX_COUNT = 200;
const PROJECT_ID = /^[A-Za-z0-9_-]{1,64}$/;
const STATE_CHANGING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

function publicUser(u) {
  return u ? {
    id: u.id, email: u.email, lang: u.lang, createdAt: new Date(u.created_at).toISOString(),
    displayName: u.display_name || null,
    avatarUrl: avatarUrl(u),
    hasPassword: !!u.password_hash,
    passwordSetAt: u.password_set_at ? new Date(u.password_set_at).toISOString() : null,
    emailVerified: !!u.email_verified_at,
    providers: u.providers || [],
  } : null;
}

// How the current session was opened; recentCode = may set a new password without the current one.
function publicSession(u) {
  return u ? { method: u.s_method || null, recentCode: recentCodeSession(u) } : null;
}

async function meResponse(env, user, headers) {
  const { entitlements, subscription } = await entitlementsFor(env, user);
  if (user) {
    const { results } = await env.DB.prepare('SELECT provider FROM identities WHERE user_id = ?1 ORDER BY created_at').bind(user.id).all();
    user.providers = results.map((r) => r.provider);
  }
  return json({ user: publicUser(user), session: publicSession(user), entitlements, subscription }, 200, headers);
}

function config(env) {
  return {
    paddle: {
      environment: env.PADDLE_ENV === 'production' ? 'production' : 'sandbox',
      clientToken: env.PADDLE_CLIENT_TOKEN || null,
      prices: { month: env.PADDLE_PRICE_MONTH || null, year: env.PADDLE_PRICE_YEAR || null },
    },
    plans: {
      pro: { month: { amount: '9.99', currency: 'EUR' }, year: { amount: '79.00', currency: 'EUR' } },
    },
    features: { socialConnect: env.SOCIAL_CONNECT_ENABLED === '1', cloudSave: cloudAvailable(env) },
    // sign-in with Google / Apple / Microsoft: only the providers whose keys are set (the buttons show only those)
    auth: { providers: enabledProviders(env), passwordMin: 8 },
  };
}

// Saved projects: the JSON state here (D1), their media files in R2 (cloud.js: /api/projects/:id/files/...).
async function projects(request, env, method, rest, ctx) {
  const user = await requireUser(request, env);
  const id = rest[0];
  if (!id) {
    if (method !== 'GET') throw new HttpError(405, 'method_not_allowed', 'Method not allowed.');
    const { results } = await env.DB.prepare(
      'SELECT id, name, size, media_bytes, created_at, updated_at, opened_at FROM projects WHERE user_id = ?1 ORDER BY updated_at DESC'
    ).bind(user.id).all();
    const storage = await storageInfo(env, user.id);
    await maybeCleanup(env, ctx);   // the 6-month rule, at most every 6 hours (cloud.js)
    return json({ projects: results.map((p) => ({ id: p.id, name: p.name, size: p.size, mediaBytes: p.media_bytes || 0,
      createdAt: new Date(p.created_at).toISOString(), updatedAt: new Date(p.updated_at).toISOString(),
      openedAt: new Date(p.opened_at || p.updated_at).toISOString() })), storage });
  }
  if (!PROJECT_ID.test(id)) throw new HttpError(400, 'invalid_id', 'Project id: 1-64 letters, digits, - or _.');
  if (rest[1] === 'files') return projectFiles(request, env, method, user, id, rest.slice(2));
  if (rest.length > 1) throw new HttpError(404, 'not_found', 'Unknown API route.');

  if (method === 'GET') {
    const p = await env.DB.prepare('SELECT * FROM projects WHERE user_id = ?1 AND id = ?2').bind(user.id, id).first();
    if (!p) throw new HttpError(404, 'not_found', 'Project not found.');
    // opened: the 6-month clock starts again
    await env.DB.prepare('UPDATE projects SET opened_at = ?3, warned_at = NULL WHERE user_id = ?1 AND id = ?2').bind(user.id, id, Date.now()).run();
    return json({ id: p.id, name: p.name, state: JSON.parse(p.data), updatedAt: new Date(p.updated_at).toISOString(),
      mediaBytes: p.media_bytes || 0, files: await readyFiles(env, user.id, id) });
  }
  if (method === 'PUT') {
    await requirePro(env, user, HttpError);
    const raw = await readText(request, PROJECT_MAX_BYTES);
    let body;
    try { body = JSON.parse(raw); } catch { throw new HttpError(400, 'invalid_json', 'Body must be JSON.'); }
    if (!body || typeof body !== 'object' || body.state === undefined) throw new HttpError(400, 'invalid_project', 'Body must be {name, state}.');
    const name = String(body.name || '').slice(0, 120);
    const data = JSON.stringify(body.state);
    // with media: body.files = the ids of the uploaded files this version uses (all must be there); the others are erased
    const withFiles = body.files !== undefined;
    const mediaBytes = withFiles ? await checkProjectFiles(env, user.id, id, body.files) : null;
    const now = Date.now();
    const exists = await env.DB.prepare('SELECT 1 AS x FROM projects WHERE user_id = ?1 AND id = ?2').bind(user.id, id).first();
    if (!exists) {
      const c = await env.DB.prepare('SELECT COUNT(*) AS n FROM projects WHERE user_id = ?1').bind(user.id).first();
      if (c.n >= PROJECT_MAX_COUNT) throw new HttpError(409, 'too_many_projects', `At most ${PROJECT_MAX_COUNT} saved projects.`);
    }
    await env.DB.prepare(
      `INSERT INTO projects (user_id, id, name, data, size, created_at, updated_at, opened_at, media_bytes) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?6, ?6, COALESCE(?7, 0))
       ON CONFLICT(user_id, id) DO UPDATE SET name = ?3, data = ?4, size = ?5, updated_at = ?6, opened_at = ?6, warned_at = NULL,
         media_bytes = COALESCE(?7, media_bytes)`
    ).bind(user.id, id, name, data, data.length, now, mediaBytes).run();
    if (withFiles) await dropUnusedFiles(env, user.id, id, body.files);
    return json({ ok: true, id, updatedAt: new Date(now).toISOString(), mediaBytes: mediaBytes || 0, storage: await storageInfo(env, user.id) });
  }
  if (method === 'PATCH') {
    // rename only (Pro not needed: it is the user's own data)
    const body = await readJson(request);
    const name = String(body.name || '').replace(/\s+/g, ' ').trim().slice(0, 120);
    if (!name) throw new HttpError(400, 'invalid_name', 'The name cannot be empty.');
    const r = await env.DB.prepare('UPDATE projects SET name = ?3 WHERE user_id = ?1 AND id = ?2').bind(user.id, id, name).run();
    if (!r.meta.changes) throw new HttpError(404, 'not_found', 'Project not found.');
    return json({ ok: true, id, name });
  }
  if (method === 'DELETE') {
    await deleteProjectMedia(env, user.id, id);
    await env.DB.prepare('DELETE FROM projects WHERE user_id = ?1 AND id = ?2').bind(user.id, id).run();
    return json({ ok: true, storage: await storageInfo(env, user.id) });
  }
  throw new HttpError(405, 'method_not_allowed', 'Method not allowed.');
}

// An outside cron (or a person) runs the 6-month rule: POST with "Authorization: Bearer <CRON_SECRET>".
async function cronCleanup(request, env) {
  const want = env.CRON_SECRET || '';
  const got = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
  if (want.length < 16 || !timingSafeEqual(got, want)) throw new HttpError(404, 'not_found', 'Unknown API route.');
  return json({ ok: true, ...(await cleanupCloud(env)) });
}

// Signed in: the session cookie (and the trusted-device cookie), then the same answer as GET /api/me.
function signedIn(env, { user, cookies }) {
  return meResponse(env, user, { 'Set-Cookie': cookies });
}

async function deleteAccount(request, env) {
  const user = await requireUser(request, env);
  const body = await readJson(request);
  if (body.confirm !== true) throw new HttpError(400, 'confirm_required', 'Send {"confirm": true} to delete the account.');
  // Stop any running Paddle subscription first, so nobody keeps paying for a deleted account.
  const { results } = await env.DB.prepare(
    "SELECT id FROM subscriptions WHERE user_id = ?1 AND status IN ('active','trialing','past_due','paused')"
  ).bind(user.id).all();
  for (const s of results) await cancelSubscriptionNow(env, s.id);
  // the media files saved online (R2), then their rows with the rest
  await deleteUserMedia(env, user.id);
  await env.DB.batch([
    env.DB.prepare('DELETE FROM file_parts WHERE user_id = ?1').bind(user.id),
    env.DB.prepare('DELETE FROM project_files WHERE user_id = ?1').bind(user.id),
    env.DB.prepare('DELETE FROM projects WHERE user_id = ?1').bind(user.id),
    env.DB.prepare('DELETE FROM sessions WHERE user_id = ?1').bind(user.id),
    env.DB.prepare('DELETE FROM subscriptions WHERE user_id = ?1').bind(user.id),
    env.DB.prepare('DELETE FROM login_codes WHERE email = ?1').bind(user.email),
    env.DB.prepare('DELETE FROM auth_codes WHERE email = ?1').bind(user.email),
    env.DB.prepare('DELETE FROM trusted_devices WHERE user_id = ?1').bind(user.id),
    env.DB.prepare('DELETE FROM identities WHERE user_id = ?1').bind(user.id),
    env.DB.prepare('DELETE FROM rate_limits WHERE key = ?1').bind(await failKey(user.email)),
    // the users row holds the display name, the photo and the password hash: all gone with it
    env.DB.prepare('DELETE FROM users WHERE id = ?1').bind(user.id),
  ]);
  // Note: Paddle keeps its own invoices/customer record (legal accounting obligation as Merchant of Record).
  return json({ ok: true, deleted: true }, 200, { 'Set-Cookie': clearSessionCookie() });
}

export async function handle(request, env, ctx) {
  try {
    return await dispatch(request, env, ctx);
  } catch (e) {
    return errorResponse(e);
  }
}

async function dispatch(request, env, ctx) {
    if (!env.DB) throw new HttpError(500, 'not_configured', 'D1 binding DB is missing.');
    const url = new URL(request.url);
    const method = request.method.toUpperCase();
    const parts = url.pathname.replace(/^\/api\/?/, '').split('/').filter(Boolean);
    const route = parts.join('/');

    // The webhook is server-to-server: authenticated by its signature, not by Origin.
    if (route === 'paddle/webhook') {
      if (method !== 'POST') throw new HttpError(405, 'method_not_allowed', 'Method not allowed.');
      return json(await handleWebhook(request, env));
    }
    // Google / Apple / Microsoft: browser navigations (Apple comes back with a cross-site form POST, checked by state + cookie)
    if (parts[0] === 'auth' && parts[1] === 'oauth' && parts.length === 4 && PROVIDERS[parts[2]]) {
      if (parts[3] === 'start') {
        if (method !== 'GET') throw new HttpError(405, 'method_not_allowed', 'Method not allowed.');
        return oauthStart(request, env, parts[2]);
      }
      if (parts[3] === 'callback') return oauthCallback(request, env, parts[2], method);
    }
    if (route === 'cron/cloud-cleanup') {
      if (method !== 'POST') throw new HttpError(405, 'method_not_allowed', 'Method not allowed.');
      return cronCleanup(request, env);
    }
    // raw media bytes (project files): application/octet-stream, which a plain cross-site form cannot send either
    const rawUpload = method === 'PUT' && parts[0] === 'projects' && parts[2] === 'files' && parts.length >= 4;
    if (STATE_CHANGING.has(method)) checkCsrf(request, env, route === 'me/avatar' && method === 'PUT' ? AVATAR_TYPES : rawUpload ? ['application/octet-stream'] : []);

    switch (route) {
      case 'config':
        return json(config(env), 200, { 'Cache-Control': 'no-store' });
      case 'me':
        if (method === 'GET') return meResponse(env, await currentUser(request, env));
        if (method !== 'PATCH') break;
        return meResponse(env, await updateProfile(env, await requireUser(request, env), await readJson(request)));
      case 'me/avatar':
        return avatar(request, env, method);
      case 'auth/signup':
        if (method !== 'POST') break;
        return json(await signup(request, env, await readJson(request)));
      case 'auth/signup/verify':
        if (method !== 'POST') break;
        return signedIn(env, await signupVerify(request, env, await readJson(request)));
      case 'auth/login': {
        if (method !== 'POST') break;
        const r = await loginPassword(request, env, await readJson(request));
        if (r.needCode) return json(r.needCode);
        return signedIn(env, r);
      }
      case 'auth/login/verify':
        if (method !== 'POST') break;
        return signedIn(env, await loginVerify(request, env, await readJson(request)));
      case 'auth/forgot':
        if (method !== 'POST') break;
        return json(await forgot(request, env, await readJson(request)));
      case 'auth/reset': {
        if (method !== 'POST') break;
        const r = await reset(request, env, await readJson(request));
        if (r.codeOk) return json({ ok: true, codeOk: true });
        return signedIn(env, r);
      }
      case 'auth/password':
        if (method !== 'POST') break;
        return meResponse(env, await setPassword(request, env, await readJson(request)));
      case 'auth/send-code':
      case 'auth/verify':
        // v2 "code only" sign-in: replaced by sign up / sign in with a password (+ code on a new device) in v3
        if (method !== 'POST') break;
        throw new HttpError(410, 'gone', 'Sign in with your email and password, or use "Forgot password".');
      case 'auth/logout':
        if (method !== 'POST') break;
        return json({ ok: true }, 200, { 'Set-Cookie': await logout(request, env) });
      case 'paddle/portal':
        if (method !== 'POST') break;
        return json(await portalLinks(env, await requireUser(request, env)));
      case 'account':
        if (method !== 'DELETE') break;
        return deleteAccount(request, env);
      default:
        if (parts[0] === 'projects' && parts.length <= 6) return projects(request, env, method, parts.slice(1), ctx);
        if (parts[0] === 'connect' && parts.length === 3) return social(request, env, parts[1], parts[2]);
        throw new HttpError(404, 'not_found', 'Unknown API route.');
    }
    throw new HttpError(405, 'method_not_allowed', 'Method not allowed.');
}
