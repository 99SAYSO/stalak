// All /api/* routes. Entry point: functions/api/[[path]].js
import { HttpError, json, errorResponse, checkCsrf, readJson, readText, clearSessionCookie } from './http.js';
import { sendCode, verifyCode, currentUser, requireUser, logout, loginPassword, setPassword, recentCodeSession } from './auth.js';
import { updateProfile, avatar, avatarUrl, AVATAR_TYPES } from './profile.js';
import { entitlementsFor, requirePro } from './entitlements.js';
import { handleWebhook, portalLinks, cancelSubscriptionNow } from './paddle.js';
import { social } from './social.js';
import { sha256Hex } from './crypto.js';

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
  } : null;
}

// How the current session was opened; recentCode = may set a new password without the current one.
function publicSession(u) {
  return u ? { method: u.s_method || null, recentCode: recentCodeSession(u) } : null;
}

async function meResponse(env, user, headers) {
  const { entitlements, subscription } = await entitlementsFor(env, user);
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
    features: { socialConnect: env.SOCIAL_CONNECT_ENABLED === '1' },
  };
}

async function projects(request, env, method, id) {
  const user = await requireUser(request, env);
  if (!id) {
    if (method !== 'GET') throw new HttpError(405, 'method_not_allowed', 'Method not allowed.');
    const { results } = await env.DB.prepare(
      'SELECT id, name, size, created_at, updated_at FROM projects WHERE user_id = ?1 ORDER BY updated_at DESC'
    ).bind(user.id).all();
    return json({ projects: results.map((p) => ({ id: p.id, name: p.name, size: p.size,
      createdAt: new Date(p.created_at).toISOString(), updatedAt: new Date(p.updated_at).toISOString() })) });
  }
  if (!PROJECT_ID.test(id)) throw new HttpError(400, 'invalid_id', 'Project id: 1-64 letters, digits, - or _.');

  if (method === 'GET') {
    const p = await env.DB.prepare('SELECT * FROM projects WHERE user_id = ?1 AND id = ?2').bind(user.id, id).first();
    if (!p) throw new HttpError(404, 'not_found', 'Project not found.');
    return json({ id: p.id, name: p.name, state: JSON.parse(p.data), updatedAt: new Date(p.updated_at).toISOString() });
  }
  if (method === 'PUT') {
    await requirePro(env, user, HttpError);
    const raw = await readText(request, PROJECT_MAX_BYTES);
    let body;
    try { body = JSON.parse(raw); } catch { throw new HttpError(400, 'invalid_json', 'Body must be JSON.'); }
    if (!body || typeof body !== 'object' || body.state === undefined) throw new HttpError(400, 'invalid_project', 'Body must be {name, state}.');
    const name = String(body.name || '').slice(0, 120);
    const data = JSON.stringify(body.state);
    const now = Date.now();
    const exists = await env.DB.prepare('SELECT 1 AS x FROM projects WHERE user_id = ?1 AND id = ?2').bind(user.id, id).first();
    if (!exists) {
      const c = await env.DB.prepare('SELECT COUNT(*) AS n FROM projects WHERE user_id = ?1').bind(user.id).first();
      if (c.n >= PROJECT_MAX_COUNT) throw new HttpError(409, 'too_many_projects', `At most ${PROJECT_MAX_COUNT} saved projects.`);
    }
    await env.DB.prepare(
      `INSERT INTO projects (user_id, id, name, data, size, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?6)
       ON CONFLICT(user_id, id) DO UPDATE SET name = ?3, data = ?4, size = ?5, updated_at = ?6`
    ).bind(user.id, id, name, data, data.length, now).run();
    return json({ ok: true, id, updatedAt: new Date(now).toISOString() });
  }
  if (method === 'DELETE') {
    await env.DB.prepare('DELETE FROM projects WHERE user_id = ?1 AND id = ?2').bind(user.id, id).run();
    return json({ ok: true });
  }
  throw new HttpError(405, 'method_not_allowed', 'Method not allowed.');
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
  await env.DB.batch([
    env.DB.prepare('DELETE FROM projects WHERE user_id = ?1').bind(user.id),
    env.DB.prepare('DELETE FROM sessions WHERE user_id = ?1').bind(user.id),
    env.DB.prepare('DELETE FROM subscriptions WHERE user_id = ?1').bind(user.id),
    env.DB.prepare('DELETE FROM login_codes WHERE email = ?1').bind(user.email),
    env.DB.prepare('DELETE FROM rate_limits WHERE key = ?1').bind('pwfail:' + (await sha256Hex('email:' + user.email)).slice(0, 32)),
    // the users row holds the display name, the photo and the password hash: all gone with it
    env.DB.prepare('DELETE FROM users WHERE id = ?1').bind(user.id),
  ]);
  // Note: Paddle keeps its own invoices/customer record (legal accounting obligation as Merchant of Record).
  return json({ ok: true, deleted: true }, 200, { 'Set-Cookie': clearSessionCookie() });
}

export async function handle(request, env) {
  try {
    return await dispatch(request, env);
  } catch (e) {
    return errorResponse(e);
  }
}

async function dispatch(request, env) {
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
    if (STATE_CHANGING.has(method)) checkCsrf(request, env, route === 'me/avatar' && method === 'PUT' ? AVATAR_TYPES : []);

    switch (route) {
      case 'config':
        return json(config(env), 200, { 'Cache-Control': 'public, max-age=300' });
      case 'me':
        if (method === 'GET') return meResponse(env, await currentUser(request, env));
        if (method !== 'PATCH') break;
        return meResponse(env, await updateProfile(env, await requireUser(request, env), await readJson(request)));
      case 'me/avatar':
        return avatar(request, env, method);
      case 'auth/login': {
        if (method !== 'POST') break;
        const { user, cookie } = await loginPassword(request, env, await readJson(request));
        return meResponse(env, user, { 'Set-Cookie': cookie });
      }
      case 'auth/password':
        if (method !== 'POST') break;
        return meResponse(env, await setPassword(request, env, await readJson(request)));
      case 'auth/send-code':
        if (method !== 'POST') break;
        return json(await sendCode(request, env, await readJson(request)));
      case 'auth/verify': {
        if (method !== 'POST') break;
        const { user, cookie } = await verifyCode(request, env, await readJson(request));
        return meResponse(env, user, { 'Set-Cookie': cookie });
      }
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
        if (parts[0] === 'projects' && parts.length <= 2) return projects(request, env, method, parts[1]);
        if (parts[0] === 'connect' && parts.length === 3) return social(request, env, parts[1], parts[2]);
        throw new HttpError(404, 'not_found', 'Unknown API route.');
    }
    throw new HttpError(405, 'method_not_allowed', 'Method not allowed.');
}
