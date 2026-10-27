// Linking a TikTok or Instagram account to a Stalak account, to publish videos directly (domain « Réseaux sociaux »).
// Off unless SOCIAL_CONNECT_ENABLED = "1" and the secret SOCIAL_TOKEN_KEY (32+ characters) is set; each network also needs its keys.
//
//   GET    /api/connect                         -> the linked accounts of the signed-in user (no tokens) + the networks on offer
//   GET    /api/connect/:p/start?return=/en/&popup=1 -> 302 to TikTok / Instagram (state + cookie stalak_c tie the way back)
//   GET    /api/connect/:p/callback?code&state  -> swaps the code for tokens (server to server), stores them ENCRYPTED,
//                                                 back to the app: #social-ok-<p> or #social-err-<code>
//   DELETE /api/connect/:p                      -> unlinks (TikTok: the token is revoked too)
//   POST   /api/connect/instagram/deauthorize   -> Meta: the person removed Stalak from Instagram (signed_request)
//   POST   /api/connect/instagram/data-deletion -> Meta: the person asks for their data to be erased (signed_request)
//   GET    /api/connect/instagram/deletion?code -> the status page Meta shows them
//
// Docs (read 27/10/2026):
//   TikTok  https://developers.tiktok.com/doc/login-kit-web  https://developers.tiktok.com/doc/oauth-user-access-token-management
//           https://developers.tiktok.com/doc/tiktok-api-v2-get-user-info  https://developers.tiktok.com/doc/content-posting-api-get-started
//   Meta    https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/business-login
//           https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/get-started
//           https://developers.facebook.com/docs/development/create-an-app/app-dashboard/data-deletion-callback
import { HttpError, json, getCookie, appOrigin, readText } from './http.js';
import { currentUser, requireUser } from './auth.js';
import { randomToken, randomId, sha256Hex, base64url, timingSafeEqual } from './crypto.js';
import { limit } from './ratelimit.js';

export const IG_API_VERSION = 'v26.0';
const STATE_TTL_MS = 10 * 60e3;
const enc = new TextEncoder();

class SocialFail extends Error { constructor(code, detail) { super(detail || code); this.code = code; } }

const redirectUri = (env, p) => `${appOrigin(env)}/api/connect/${p}/callback`;
const splitScopes = (s) => (Array.isArray(s) ? s : String(s || '').split(/[,\s]+/)).map((x) => String(x).trim()).filter(Boolean);
const cut = (v, n) => (v == null || v === '' ? null : String(v).slice(0, n));
// photo links come from TikTok / Instagram and end up in an <img>: https only
const httpsUrl = (v) => (/^https:\/\/[^\s"'<>]{1,1990}$/.test(String(v || '')) ? String(v) : null);

async function fetchJson(url, init = {}) {
  const res = await fetch(url, { ...init, headers: { Accept: 'application/json', ...(init.headers || {}) } });
  const body = await res.json().catch(() => ({}));
  return { res, body: body && typeof body === 'object' ? body : {} };
}
const form = (o) => ({ method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(o).toString() });
// Instagram answers some calls either flat or wrapped in { data: [ … ] }
const unwrap = (b) => (Array.isArray(b.data) && b.data[0] && typeof b.data[0] === 'object' ? b.data[0] : b);

// ---- the two networks ---------------------------------------------------------------------
export const SOCIAL = {
  tiktok: {
    keys: (env) => !!(env.TIKTOK_CLIENT_KEY && env.TIKTOK_CLIENT_SECRET),
    // video.publish = Direct Post; user.info.basic = name and photo shown in Stalak
    scope: 'user.info.basic,video.publish',
    needs: 'video.publish',
    authorize(env, state) {
      const q = new URLSearchParams({ client_key: env.TIKTOK_CLIENT_KEY, response_type: 'code', scope: this.scope,
        redirect_uri: redirectUri(env, 'tiktok'), state });
      return 'https://www.tiktok.com/v2/auth/authorize/?' + q.toString();
    },
    async connect(env, code, now) {
      const { res, body } = await fetchJson('https://open.tiktokapis.com/v2/oauth/token/', form({
        client_key: env.TIKTOK_CLIENT_KEY, client_secret: env.TIKTOK_CLIENT_SECRET, code,
        grant_type: 'authorization_code', redirect_uri: redirectUri(env, 'tiktok') }));
      if (!res.ok || !body.access_token || !body.open_id) throw new SocialFail('connect_failed', `token ${res.status} ${body.error || ''}`);
      const scopes = splitScopes(body.scope);
      if (!scopes.includes(this.needs)) throw new SocialFail('missing_permission', 'scope ' + scopes.join(','));
      // name and photo: nice to have, the link works without them
      let u = {};
      try {
        const r = await fetchJson('https://open.tiktokapis.com/v2/user/info/?fields=open_id,avatar_url,display_name',
          { headers: { Authorization: 'Bearer ' + body.access_token } });
        if (r.res.ok && r.body.data && r.body.data.user) u = r.body.data.user;
      } catch {}
      if (u.open_id && u.open_id !== body.open_id) throw new SocialFail('connect_failed', 'open_id mismatch');
      return {
        accountId: String(body.open_id), appUserId: null, username: null, displayName: cut(u.display_name, 100),
        avatarUrl: httpsUrl(u.avatar_url), accountType: null, scopes: scopes.join(','),
        access: body.access_token, accessExpiresAt: now + Number(body.expires_in || 86400) * 1000,
        refresh: body.refresh_token || null,
        refreshExpiresAt: body.refresh_token ? now + Number(body.refresh_expires_in || 365 * 86400) * 1000 : null,
      };
    },
    // the access token lasts 24 h, the refresh token 365 days (TikTok may send a new one: it must then be used)
    async refresh(env, tokens, now) {
      const { res, body } = await fetchJson('https://open.tiktokapis.com/v2/oauth/token/', form({
        client_key: env.TIKTOK_CLIENT_KEY, client_secret: env.TIKTOK_CLIENT_SECRET, grant_type: 'refresh_token', refresh_token: tokens.refresh }));
      if (!res.ok || !body.access_token) throw new SocialFail('refresh_failed', `refresh ${res.status} ${body.error || ''}`);
      return { access: body.access_token, accessExpiresAt: now + Number(body.expires_in || 86400) * 1000,
        refresh: body.refresh_token || tokens.refresh,
        refreshExpiresAt: body.refresh_expires_in ? now + Number(body.refresh_expires_in) * 1000 : tokens.refreshExpiresAt };
    },
    async revoke(env, access) {
      await fetch('https://open.tiktokapis.com/v2/oauth/revoke/', form({
        client_key: env.TIKTOK_CLIENT_KEY, client_secret: env.TIKTOK_CLIENT_SECRET, token: access }));
    },
  },

  instagram: {
    keys: (env) => !!(env.INSTAGRAM_APP_ID && env.INSTAGRAM_APP_SECRET),
    scope: 'instagram_business_basic,instagram_business_content_publish',
    needs: 'instagram_business_content_publish',
    authorize(env, state) {
      const q = new URLSearchParams({ client_id: env.INSTAGRAM_APP_ID, redirect_uri: redirectUri(env, 'instagram'),
        response_type: 'code', scope: this.scope, state });
      return 'https://www.instagram.com/oauth/authorize?' + q.toString();
    },
    async connect(env, code, now) {
      // 1. the code (Meta may add "#_" at its end: not part of it) for a short-lived token (1 hour)
      const r1 = await fetchJson('https://api.instagram.com/oauth/access_token', form({
        client_id: env.INSTAGRAM_APP_ID, client_secret: env.INSTAGRAM_APP_SECRET, grant_type: 'authorization_code',
        redirect_uri: redirectUri(env, 'instagram'), code: code.replace(/#_$/, '') }));
      const short = unwrap(r1.body);
      if (!r1.res.ok || !short.access_token) throw new SocialFail('connect_failed', `token ${r1.res.status} ${(r1.body.error && r1.body.error.message) || r1.body.error_message || ''}`);
      const scopes = splitScopes(short.permissions);
      if (scopes.length && !scopes.includes(this.needs)) throw new SocialFail('missing_permission', 'permissions ' + scopes.join(','));
      // 2. the long-lived token (60 days), server to server since it needs the app secret
      const q2 = new URLSearchParams({ grant_type: 'ig_exchange_token', client_secret: env.INSTAGRAM_APP_SECRET, access_token: short.access_token });
      const r2 = await fetchJson('https://graph.instagram.com/access_token?' + q2.toString());
      if (!r2.res.ok || !r2.body.access_token) throw new SocialFail('connect_failed', 'long-lived ' + r2.res.status);
      const access = r2.body.access_token;
      // 3. who it is: id = given to our app; user_id = the professional account (the one that publishes)
      const q3 = new URLSearchParams({ fields: 'id,user_id,username,account_type,profile_picture_url', access_token: access });
      const r3 = await fetchJson(`https://graph.instagram.com/${IG_API_VERSION}/me?` + q3.toString());
      const me = unwrap(r3.body);
      const accountId = me.user_id || me.id || short.user_id;
      if (!r3.res.ok || !accountId) throw new SocialFail('connect_failed', 'me ' + r3.res.status);
      return {
        accountId: String(accountId), appUserId: cut(me.id || short.user_id, 64), username: cut(me.username, 100), displayName: cut(me.username, 100),
        avatarUrl: httpsUrl(me.profile_picture_url), accountType: cut(String(me.account_type || '').toUpperCase(), 30),
        scopes: (scopes.length ? scopes : splitScopes(this.scope)).join(','),
        access, accessExpiresAt: now + Number(r2.body.expires_in || 60 * 86400) * 1000, refresh: null, refreshExpiresAt: null,
      };
    },
    // a long-lived token can be renewed for 60 more days once it is 24 hours old and not yet expired
    async refresh(env, tokens, now) {
      const q = new URLSearchParams({ grant_type: 'ig_refresh_token', access_token: tokens.access });
      const { res, body } = await fetchJson('https://graph.instagram.com/refresh_access_token?' + q.toString());
      if (!res.ok || !body.access_token) throw new SocialFail('refresh_failed', 'refresh ' + res.status);
      return { access: body.access_token, accessExpiresAt: now + Number(body.expires_in || 60 * 86400) * 1000, refresh: null, refreshExpiresAt: null };
    },
    async revoke() {},   // Instagram Login has no revoke call: the person removes Stalak in Instagram's settings
  },
};

function featureOn(env) {
  return env.SOCIAL_CONNECT_ENABLED === '1' && String(env.SOCIAL_TOKEN_KEY || '').length >= 32;
}
// the networks a person can link right now (shown by /api/config)
export function socialProviders(env) {
  return featureOn(env) ? Object.keys(SOCIAL).filter((p) => SOCIAL[p].keys(env)) : [];
}

// ---- tokens at rest: AES-GCM, key from the secret SOCIAL_TOKEN_KEY, tied to (user, network, kind) --------------------
async function tokenKey(env) {
  const s = String(env.SOCIAL_TOKEN_KEY || '');
  if (s.length < 32) throw new HttpError(503, 'not_configured', 'SOCIAL_TOKEN_KEY is missing.');
  const raw = await crypto.subtle.digest('SHA-256', enc.encode('stalak-social-v1:' + s));
  return crypto.subtle.importKey('raw', raw, 'AES-GCM', false, ['encrypt', 'decrypt']);
}
function b64urlDecode(s) {
  const t = atob(String(s).replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((String(s).length + 3) % 4));
  return Uint8Array.from(t, (c) => c.charCodeAt(0));
}
export async function sealToken(env, plain, aad) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: enc.encode(aad) }, await tokenKey(env), enc.encode(plain));
  return 'v1.' + base64url(iv) + '.' + base64url(new Uint8Array(ct));
}
export async function openToken(env, sealed, aad) {
  const [v, iv, ct] = String(sealed || '').split('.');
  if (v !== 'v1' || !iv || !ct) throw new Error('bad sealed token');
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64urlDecode(iv), additionalData: enc.encode(aad) }, await tokenKey(env), b64urlDecode(ct));
  return new TextDecoder().decode(pt);
}
const aadFor = (userId, p, kind) => `${userId}:${p}:${kind}`;

async function saveAccount(env, userId, p, a, now) {
  const accessEnc = await sealToken(env, a.access, aadFor(userId, p, 'access'));
  const refreshEnc = a.refresh ? await sealToken(env, a.refresh, aadFor(userId, p, 'refresh')) : null;
  await env.DB.prepare(
    `INSERT INTO social_accounts (user_id, provider, account_id, app_user_id, username, display_name, avatar_url, account_type, scopes,
       access_token_enc, access_expires_at, refresh_token_enc, refresh_expires_at, status, created_at, updated_at, refreshed_at)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, 'ok', ?14, ?14, ?14)
     ON CONFLICT(user_id, provider) DO UPDATE SET account_id = ?3, app_user_id = ?4, username = ?5, display_name = ?6, avatar_url = ?7,
       account_type = ?8, scopes = ?9, access_token_enc = ?10, access_expires_at = ?11, refresh_token_enc = ?12, refresh_expires_at = ?13,
       status = 'ok', updated_at = ?14, refreshed_at = ?14`
  ).bind(userId, p, a.accountId, a.appUserId, a.username, a.displayName, a.avatarUrl, a.accountType, a.scopes,
    accessEnc, a.accessExpiresAt, refreshEnc, a.refreshExpiresAt, now).run();
}

// The access token for publishing, renewed first when needed. 409 reconnect_needed when the link is over.
// (Used by the « Publier » step; kept here so every token read goes through the same checks.)
export async function socialAccessToken(env, userId, p, now = Date.now()) {
  if (!SOCIAL[p]) throw new HttpError(404, 'not_found', 'Unknown network.');
  const row = await env.DB.prepare('SELECT * FROM social_accounts WHERE user_id = ?1 AND provider = ?2').bind(userId, p).first();
  if (!row) throw new HttpError(409, 'not_connected', `No ${p} account is linked.`);
  const reconnect = async (why) => {
    await env.DB.prepare("UPDATE social_accounts SET status = 'expired', updated_at = ?3 WHERE user_id = ?1 AND provider = ?2").bind(userId, p, now).run();
    console.warn('[stalak] social token', p, why);
    throw new HttpError(409, 'reconnect_needed', `The ${p} link has expired: connect the account again.`);
  };
  if (row.status !== 'ok') await reconnect('marked expired');
  let tokens;
  try {
    tokens = { access: await openToken(env, row.access_token_enc, aadFor(userId, p, 'access')),
      refresh: row.refresh_token_enc ? await openToken(env, row.refresh_token_enc, aadFor(userId, p, 'refresh')) : null,
      refreshExpiresAt: row.refresh_expires_at };
  } catch { await reconnect('cannot decrypt'); }
  const P = SOCIAL[p];
  let due = false;
  if (p === 'tiktok') {
    if (row.access_expires_at - now < 5 * 60e3) {
      if (!tokens.refresh || (row.refresh_expires_at && row.refresh_expires_at <= now)) await reconnect('refresh token expired');
      due = true;
    }
  } else {
    if (row.access_expires_at <= now) await reconnect('token expired');
    // renewed once 10 days have gone by (Instagram wants at least 24 hours), so it never lapses while the person uses Stalak
    due = now - (row.refreshed_at || row.created_at) >= 10 * 86400e3;
  }
  if (!due) return tokens.access;
  try {
    const t = await P.refresh(env, tokens, now);
    await env.DB.prepare(
      'UPDATE social_accounts SET access_token_enc = ?3, access_expires_at = ?4, refresh_token_enc = ?5, refresh_expires_at = ?6, refreshed_at = ?7, updated_at = ?7 WHERE user_id = ?1 AND provider = ?2'
    ).bind(userId, p, await sealToken(env, t.access, aadFor(userId, p, 'access')), t.accessExpiresAt,
      t.refresh ? await sealToken(env, t.refresh, aadFor(userId, p, 'refresh')) : null, t.refreshExpiresAt || null, now).run();
    return t.access;
  } catch (e) {
    // Instagram: the old token still works until it expires; TikTok: an access token about to expire is no use
    if (p === 'instagram' && row.access_expires_at > now + 60e3) return tokens.access;
    if (e instanceof HttpError) throw e;
    await reconnect(e.message);
  }
}

// ---- the way back to the app ------------------------------------------------------------------
function safeReturn(v) {
  const s = String(v || '/');
  return /^\/(?!\/)[A-Za-z0-9._~\/-]{0,200}$/.test(s) && !s.startsWith('/api') ? s : '/';
}
// returnTo = "/en/" or "/en/#popup" (the link runs in a small window opened by the app, so an open project is not lost)
function backTo(env, returnTo, frag) {
  const [path, tail = ''] = String(returnTo || '/').split('#');
  const url = appOrigin(env) + safeReturn(path) + '#' + frag;
  const h = new Headers({ 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer',
    'Set-Cookie': 'stalak_c=; Path=/api/connect; HttpOnly; Secure; SameSite=Lax; Max-Age=0' });
  if (tail !== 'popup') { h.set('Location', url); return new Response(null, { status: 303, headers: h }); }
  h.set('Content-Type', 'text/html; charset=utf-8');
  h.set('Content-Security-Policy', "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'");
  const msg = JSON.stringify({ stalakSocial: frag }).replace(/</g, '\\u003c');
  const u = JSON.stringify(url).replace(/</g, '\\u003c');
  const ok = frag.startsWith('social-ok');
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Stalak</title></head>
<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#5aa9f0;color:#0a0d14;font:600 18px/1.4 system-ui,-apple-system,sans-serif;text-align:center;padding:24px;box-sizing:border-box">
<p>${ok ? 'C’est bon, ton compte est relié à Stalak. Tu peux fermer cette fenêtre.<br>Your account is linked to Stalak. You can close this window.' : 'Le compte n’a pas pu être relié. Tu peux fermer cette fenêtre.<br>The account could not be linked. You can close this window.'}<br><br><a href="${appOrigin(env)}/" id="go" style="color:#0a0d14">Stalak</a></p>
<script>(function(){var m=${msg},u=${u};document.getElementById('go').href=u;
try{var b=new BroadcastChannel('stalak-social');b.postMessage(m);b.close();}catch(e){}
try{localStorage.setItem('stalak:social',JSON.stringify({f:m.stalakSocial,t:Date.now()}));}catch(e){}
try{if(window.opener&&window.opener!==window)window.opener.postMessage(m,location.origin);}catch(e){}
setTimeout(function(){try{window.close();}catch(e){}},150);
setTimeout(function(){if(!window.closed&&!(window.opener&&!window.opener.closed))location.replace(u);},900);})();</script></body></html>`;
  return new Response(html, { status: 200, headers: h });
}

// ---- routes for the signed-in person: /api/connect[/:p[/start|/callback]] ------------------------
export async function social(request, env, method, rest) {
  const [p, step] = rest;
  if (rest.length > 2 || (p && !SOCIAL[p]) || (step && step !== 'start' && step !== 'callback')) throw new HttpError(404, 'not_found', 'Unknown API route.');
  if (env.SOCIAL_CONNECT_ENABLED !== '1') throw new HttpError(404, 'not_enabled', 'Social posting is not available yet.');
  if (!p) {
    if (method !== 'GET') throw new HttpError(405, 'method_not_allowed', 'Method not allowed.');
    return listAccounts(env, await requireUser(request, env));
  }
  if (!step) {
    if (method !== 'DELETE') throw new HttpError(405, 'method_not_allowed', 'Method not allowed.');
    return disconnect(env, await requireUser(request, env), p);
  }
  if (method !== 'GET') throw new HttpError(405, 'method_not_allowed', 'Method not allowed.');
  return step === 'start' ? connectStart(request, env, p) : connectCallback(request, env, p);
}

async function listAccounts(env, user, now = Date.now()) {
  const { results } = await env.DB.prepare('SELECT * FROM social_accounts WHERE user_id = ?1 ORDER BY provider').bind(user.id).all();
  return json({
    providers: socialProviders(env),
    accounts: results.map((r) => {
      const over = r.provider === 'tiktok' ? (r.refresh_expires_at && r.refresh_expires_at <= now) : r.access_expires_at <= now;
      return { provider: r.provider, username: r.username, displayName: r.display_name, avatarUrl: r.avatar_url,
        accountType: r.account_type, status: r.status === 'ok' && !over ? 'ok' : 'expired',
        connectedAt: new Date(r.created_at).toISOString() };
    }),
  });
}

async function disconnect(env, user, p) {
  const row = await env.DB.prepare('SELECT * FROM social_accounts WHERE user_id = ?1 AND provider = ?2').bind(user.id, p).first();
  if (row) {
    await revokeRow(env, row);
    await env.DB.prepare('DELETE FROM social_accounts WHERE user_id = ?1 AND provider = ?2').bind(user.id, p).run();
  }
  return json({ ok: true, provider: p, disconnected: !!row });
}

// best effort: the link is removed on our side whatever TikTok answers
async function revokeRow(env, row) {
  try {
    if (!SOCIAL[row.provider].keys(env)) return;
    await SOCIAL[row.provider].revoke(env, await openToken(env, row.access_token_enc, aadFor(row.user_id, row.provider, 'access')));
  } catch (e) { console.warn('[stalak] social revoke', row.provider, e && e.message); }
}

// Account deletion (router.js): every linked account goes, tokens revoked. Quiet if migration 0005 is not there yet.
export async function deleteSocialAccounts(env, userId) {
  let rows;
  try { ({ results: rows } = await env.DB.prepare('SELECT * FROM social_accounts WHERE user_id = ?1').bind(userId).all()); }
  catch (e) { if (/no such table/i.test(String(e && e.message))) return; throw e; }
  for (const r of rows) await revokeRow(env, r);
  await env.DB.batch([
    env.DB.prepare('DELETE FROM social_accounts WHERE user_id = ?1').bind(userId),
    env.DB.prepare('DELETE FROM social_states WHERE user_id = ?1').bind(userId),
  ]);
}

// GET /api/connect/:p/start — a browser navigation (or a small window opened by the app)
async function connectStart(request, env, p) {
  const url = new URL(request.url);
  const ret = safeReturn(url.searchParams.get('return')) + (url.searchParams.get('popup') === '1' ? '#popup' : '');
  const user = await currentUser(request, env);
  if (!user) return backTo(env, ret, 'social-err-not_signed_in');
  if (!socialProviders(env).includes(p)) return backTo(env, ret, 'social-err-not_enabled');
  await limit(env, `social:u:${user.id}`, 20, 10 * 60e3, 'Too many attempts, try again later.');
  const state = randomToken(32), binding = randomToken(24), now = Date.now();
  await env.DB.batch([
    env.DB.prepare('DELETE FROM social_states WHERE expires_at < ?1').bind(now),
    env.DB.prepare('INSERT INTO social_states (state_hash, provider, user_id, binding, return_to, created_at, expires_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)')
      .bind(await sha256Hex(state), p, user.id, await sha256Hex(binding), ret, now, now + STATE_TTL_MS),
  ]);
  return new Response(null, { status: 302, headers: {
    Location: SOCIAL[p].authorize(env, state),
    'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer',
    // ties the way back to this browser; Lax is enough: TikTok and Instagram come back with a plain link (GET)
    'Set-Cookie': `stalak_c=${binding}; Path=/api/connect; HttpOnly; Secure; SameSite=Lax; Max-Age=${STATE_TTL_MS / 1000}`,
  } });
}

// GET /api/connect/:p/callback
async function connectCallback(request, env, p) {
  const params = new URL(request.url).searchParams;
  let ret = '/';
  try {
    const state = params.get('state') || '';
    const row = state.length >= 20 && state.length <= 100
      ? await env.DB.prepare('SELECT * FROM social_states WHERE state_hash = ?1').bind(await sha256Hex(state)).first() : null;
    if (row) await env.DB.prepare('DELETE FROM social_states WHERE state_hash = ?1').bind(row.state_hash).run();   // single use
    if (!row || row.provider !== p || row.expires_at < Date.now()) throw new SocialFail('state_mismatch', 'unknown or expired state');
    ret = row.return_to;
    const bind = getCookie(request, 'stalak_c');
    if (!bind || !timingSafeEqual(await sha256Hex(bind), row.binding)) throw new SocialFail('state_mismatch', 'browser binding missing');
    const user = await currentUser(request, env);
    if (!user) throw new SocialFail('not_signed_in');
    if (user.id !== row.user_id) throw new SocialFail('state_mismatch', 'another Stalak account');
    const err = params.get('error');
    if (err) throw new SocialFail(/access_denied|user_denied|cancel/i.test(err + ' ' + (params.get('error_reason') || '')) ? 'cancelled' : 'connect_failed', err);
    const code = params.get('code');
    if (!code || code.length > 2048) throw new SocialFail('connect_failed', 'no code');
    if (!socialProviders(env).includes(p)) throw new SocialFail('not_enabled');
    const now = Date.now();
    const a = await SOCIAL[p].connect(env, code, now);
    await saveAccount(env, user.id, p, a, now);
    return backTo(env, ret, 'social-ok-' + p);
  } catch (e) {
    const code = e instanceof SocialFail ? e.code : 'connect_failed';
    console.warn('[stalak] social connect', p, code, e && e.message);
    return backTo(env, ret, 'social-err-' + code);
  }
}

// ---- Meta's server-to-server calls (signed with the Instagram app secret), outside the CSRF check -----------
const WEBHOOK_STEPS = new Set(['deauthorize', 'data-deletion', 'deletion']);
export function isSocialWebhook(parts) {
  return parts.length === 3 && parts[0] === 'connect' && parts[1] === 'instagram' && WEBHOOK_STEPS.has(parts[2]);
}

// signed_request = base64url(HMAC-SHA256(payload, app secret)) "." payload (base64url JSON with user_id)
export async function parseSignedRequest(signed, secret) {
  const s = String(signed || '');
  const i = s.indexOf('.');
  if (i < 1 || !secret || s.length > 8192) return null;
  const sig = s.slice(0, i).replace(/=+$/, ''), payload = s.slice(i + 1);
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const want = base64url(new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(payload))));
  if (!timingSafeEqual(sig, want)) return null;
  let data;
  try { data = JSON.parse(new TextDecoder().decode(b64urlDecode(payload))); } catch { return null; }
  if (!data || String(data.algorithm || '').toUpperCase() !== 'HMAC-SHA256' || !data.user_id) return null;
  return data;
}

export async function socialWebhook(request, env, p, step, method) {
  if (!SOCIAL[p] || !SOCIAL[p].keys(env)) throw new HttpError(404, 'not_found', 'Unknown API route.');
  if (step === 'deletion') {
    if (method !== 'GET') throw new HttpError(405, 'method_not_allowed', 'Method not allowed.');
    const code = String(new URL(request.url).searchParams.get('code') || '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 64);
    const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Stalak</title></head>
<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#5aa9f0;color:#0a0d14;font:600 18px/1.5 system-ui,-apple-system,sans-serif;text-align:center;padding:24px;box-sizing:border-box">
<p>Demande ${code || ''} : les données Instagram liées à Stalak ont été effacées.<br>Request ${code || ''}: the Instagram data linked to Stalak has been erased.<br><br><a href="${appOrigin(env)}/" style="color:#0a0d14">Stalak</a></p></body></html>`;
    return new Response(html, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store',
      'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'" } });
  }
  if (method !== 'POST') throw new HttpError(405, 'method_not_allowed', 'Method not allowed.');
  const ct = (request.headers.get('Content-Type') || '').toLowerCase();
  if (!ct.startsWith('application/x-www-form-urlencoded')) throw new HttpError(415, 'form_required', 'Form post expected.');
  const data = await parseSignedRequest(new URLSearchParams(await readText(request, 16 * 1024)).get('signed_request'), env.INSTAGRAM_APP_SECRET);
  if (!data) throw new HttpError(400, 'bad_signature', 'Invalid signed_request.');
  const igId = String(data.user_id).slice(0, 64);
  try {
    await env.DB.prepare("DELETE FROM social_accounts WHERE provider = 'instagram' AND (account_id = ?1 OR app_user_id = ?1)").bind(igId).run();
  } catch (e) { if (!/no such table/i.test(String(e && e.message))) throw e; }
  if (step === 'deauthorize') return json({ ok: true });
  const code = randomId('del_');
  return json({ url: `${appOrigin(env)}/api/connect/instagram/deletion?code=${code}`, confirmation_code: code });
}
