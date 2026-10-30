// Sign in with Google, Apple and Microsoft: OpenID Connect authorization-code flow, done by the server.
//   GET  /api/auth/oauth/:provider/start?return=/en/&to=pro   -> 302 to the provider (state, nonce, PKCE)
//   GET  /api/auth/oauth/:provider/callback?code&state         -> Google, Microsoft
//   POST /api/auth/oauth/apple/callback (form_post)            -> Apple
// The callback swaps the code for an id_token at the provider (server to server), checks its signature against the
// provider's published keys (JWKS) and its iss / aud / exp / nonce, then links or creates the Stalak account and
// sends the browser back to the page it came from, signed in (#auth-ok-account / #auth-ok-pro, or #auth-err-<code>).
// Docs: Google https://developers.google.com/identity/openid-connect/openid-connect
//       Microsoft https://learn.microsoft.com/entra/identity-platform/v2-protocols-oidc
//       Apple https://developer.apple.com/documentation/signinwithapplerestapi
import { HttpError, getCookie, appOrigin, readText, clientIp } from './http.js';
import { randomToken, randomId, sha256Hex, base64url, timingSafeEqual } from './crypto.js';
import { verifyJwtSignature, signEs256, decodeJwt } from './jwt.js';
import { createSession, trustDevice, normalizeLang } from './auth.js';
import { normalizeDisplayName } from './profile.js';
import { limit } from './ratelimit.js';

const STATE_TTL_MS = 10 * 60e3;
const SKEW_S = 120;
const MS_CONSUMER_TENANT = '9188040d-6c67-4c5b-b112-36a304b66dad';   // personal Microsoft accounts (outlook.com, hotmail…)

function msTenant(env) {
  const t = String(env.MICROSOFT_TENANT || 'common').trim();
  return /^(common|consumers|organizations|[0-9a-f-]{36})$/i.test(t) ? t : 'common';
}

export const PROVIDERS = {
  google: {
    authorize: () => 'https://accounts.google.com/o/oauth2/v2/auth',
    token: () => 'https://oauth2.googleapis.com/token',
    jwks: 'https://www.googleapis.com/oauth2/v3/certs',
    scope: 'openid email profile',
    pkce: true, algs: ['RS256'],
    clientId: (env) => env.GOOGLE_CLIENT_ID,
    enabled: (env) => !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET),
    secret: async (env) => env.GOOGLE_CLIENT_SECRET,
    extra: { prompt: 'select_account' },
    issuerOk: (iss) => iss === 'https://accounts.google.com' || iss === 'accounts.google.com',
    emailVerified: (c) => c.email_verified === true || c.email_verified === 'true',
  },
  microsoft: {
    authorize: (env) => `https://login.microsoftonline.com/${msTenant(env)}/oauth2/v2.0/authorize`,
    token: (env) => `https://login.microsoftonline.com/${msTenant(env)}/oauth2/v2.0/token`,
    jwks: 'https://login.microsoftonline.com/common/discovery/v2.0/keys',
    scope: 'openid email profile',
    pkce: true, algs: ['RS256'],
    clientId: (env) => env.MICROSOFT_CLIENT_ID,
    enabled: (env) => !!(env.MICROSOFT_CLIENT_ID && env.MICROSOFT_CLIENT_SECRET),
    secret: async (env) => env.MICROSOFT_CLIENT_SECRET,
    extra: { prompt: 'select_account' },
    // multi-tenant: the issuer is the user's own tenant, https://login.microsoftonline.com/{tid}/v2.0, and must match the tid claim
    issuerOk: (iss, c, env) => {
      const m = /^https:\/\/login\.microsoftonline\.com\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\/v2\.0$/.exec(String(iss));
      if (!m || m[1] !== String(c.tid || '').toLowerCase()) return false;
      const t = msTenant(env).toLowerCase();
      if (t === 'consumers') return m[1] === MS_CONSUMER_TENANT;
      if (t === 'organizations') return m[1] !== MS_CONSUMER_TENANT;
      if (t !== 'common') return m[1] === t;
      return true;
    },
    // Work / school accounts may carry an e-mail nobody checked: trusted only for personal accounts, or when Microsoft says
    // the domain owner verified it (optional claim xms_edov). Otherwise the sign-in is refused (oauth_email_unverified).
    emailVerified: (c) => String(c.tid || '').toLowerCase() === MS_CONSUMER_TENANT || c.xms_edov === true || c.xms_edov === 'true' || c.xms_edov === 1 || c.xms_edov === '1',
  },
  apple: {
    authorize: () => 'https://appleid.apple.com/auth/authorize',
    token: () => 'https://appleid.apple.com/auth/token',
    jwks: 'https://appleid.apple.com/auth/keys',
    scope: 'name email',
    // Apple's token endpoint takes no code_verifier: state + nonce + the signed client secret protect the flow
    pkce: false, algs: ['RS256', 'ES256'],
    clientId: (env) => env.APPLE_CLIENT_ID,
    enabled: (env) => !!(env.APPLE_CLIENT_ID && env.APPLE_TEAM_ID && env.APPLE_KEY_ID && env.APPLE_PRIVATE_KEY),
    secret: appleClientSecret,
    extra: { response_mode: 'form_post' },
    issuerOk: (iss) => iss === 'https://appleid.apple.com',
    emailVerified: (c) => c.email_verified === true || c.email_verified === 'true',
  },
};

export function enabledProviders(env) {
  return Object.keys(PROVIDERS).filter((p) => PROVIDERS[p].enabled(env));
}

// Apple: the client secret is a short ES256 JWT signed with the .p8 key (header kid = key id; iss = team; sub = Services ID).
export async function appleClientSecret(env, now = Math.floor(Date.now() / 1000)) {
  return signEs256({ kid: env.APPLE_KEY_ID, typ: 'JWT' },
    { iss: env.APPLE_TEAM_ID, iat: now, exp: now + 300, aud: 'https://appleid.apple.com', sub: env.APPLE_CLIENT_ID },
    env.APPLE_PRIVATE_KEY);
}

const redirectUri = (env, p) => `${appOrigin(env)}/api/auth/oauth/${p}/callback`;

// ---- provider keys (JWKS), kept one hour per isolate ----------------------------------------
const jwksCache = new Map();
export function resetJwksCache() { jwksCache.clear(); }
export async function jwksFor(url, force) {
  const c = jwksCache.get(url);
  if (c && !force && Date.now() - c.at < 3600e3) return c.keys;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error('jwks ' + res.status);
  const keys = await res.json();
  jwksCache.set(url, { keys, at: Date.now() });
  return keys;
}

// Checks an id_token from `provider`: signature (JWKS, fetched again once if the key id is new), iss, aud, exp, iat, nonce.
export async function verifyIdToken(env, provider, idToken, nonce, nowS = Math.floor(Date.now() / 1000)) {
  const P = PROVIDERS[provider];
  let out;
  try { out = await verifyJwtSignature(idToken, await jwksFor(P.jwks), P.algs); }
  catch (e) {
    if (!e.unknownKid) throw e;
    out = await verifyJwtSignature(idToken, await jwksFor(P.jwks, true), P.algs);
  }
  const c = out.payload, cid = P.clientId(env);
  if (!P.issuerOk(c.iss, c, env)) throw new Error('wrong issuer');
  const aud = Array.isArray(c.aud) ? c.aud : [c.aud];
  if (!aud.includes(cid)) throw new Error('wrong audience');
  if (aud.length > 1 && c.azp !== cid) throw new Error('wrong azp');
  if (typeof c.exp !== 'number' || c.exp + SKEW_S < nowS) throw new Error('expired');
  if (typeof c.iat === 'number' && c.iat - SKEW_S > nowS) throw new Error('issued in the future');
  if (!c.sub) throw new Error('no subject');
  if (!nonce || typeof c.nonce !== 'string' || !timingSafeEqual(c.nonce, nonce)) throw new Error('nonce mismatch');
  return c;
}

// ---- where to go back ---------------------------------------------------------------------
function safeReturn(v) {
  const s = String(v || '/');
  return /^\/(?!\/)[A-Za-z0-9._~\/-]{0,200}$/.test(s) && !s.startsWith('/api') ? s : '/';
}
// ret = "/en/#pro" (path # where to go), or "/en/#pro:popup" when the sign-in runs in a small window opened by the app
// (used when a project is open: leaving the page would lose it). The window then tells the app and closes itself.
function backTo(env, ret, frag, cookies = []) {
  const [path, tail = ''] = String(ret || '/').split('#');
  const url = appOrigin(env) + safeReturn(path) + '#' + frag;
  const h = new Headers({ 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer' });
  for (const c of cookies) h.append('Set-Cookie', c);
  h.append('Set-Cookie', 'stalak_o=; Path=/api/auth/oauth; HttpOnly; Secure; SameSite=None; Max-Age=0');
  if (!tail.endsWith(':popup')) { h.set('Location', url); return new Response(null, { status: 303, headers: h }); }
  h.set('Content-Type', 'text/html; charset=utf-8');
  h.set('Content-Security-Policy', "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'");
  const msg = JSON.stringify({ stalakAuth: frag }).replace(/</g, '\\u003c');
  const u = JSON.stringify(url).replace(/</g, '\\u003c');
  const ok = frag.startsWith('auth-ok');
  const html = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Stalak</title></head>
<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#5aa9f0;color:#0a0d14;font:600 18px/1.4 system-ui,-apple-system,sans-serif;text-align:center;padding:24px;box-sizing:border-box">
<p>${ok ? 'C’est bon, tu es connecté. Tu peux fermer cette fenêtre.<br>Signed in. You can close this window.' : 'La connexion n’a pas abouti. Tu peux fermer cette fenêtre.<br>Sign-in did not work. You can close this window.'}<br><br><a href="${appOrigin(env)}/" id="go" style="color:#0a0d14">Stalak</a></p>
<script>(function(){var m=${msg},u=${u};document.getElementById('go').href=u;
try{var b=new BroadcastChannel('stalak-auth');b.postMessage(m);b.close();}catch(e){}
try{localStorage.setItem('stalak:auth',JSON.stringify({f:m.stalakAuth,t:Date.now()}));}catch(e){}
try{if(window.opener&&window.opener!==window)window.opener.postMessage(m,location.origin);}catch(e){}
setTimeout(function(){try{window.close();}catch(e){}},150);
setTimeout(function(){if(!window.closed&&!(window.opener&&!window.opener.closed))location.replace(u);},900);})();</script></body></html>`;
  return new Response(html, { status: 200, headers: h });
}

// GET /api/auth/oauth/:provider/start
export async function oauthStart(request, env, provider) {
  const P = PROVIDERS[provider];
  if (!P) throw new HttpError(404, 'not_found', 'Unknown provider.');
  const url = new URL(request.url);
  const ret = safeReturn(url.searchParams.get('return'));
  const to = (url.searchParams.get('to') === 'pro' ? 'pro' : 'account') + (url.searchParams.get('popup') === '1' ? ':popup' : '');
  if (!P.enabled(env)) return backTo(env, ret + '#' + to, 'auth-err-not_enabled');
  await limit(env, `oauth:ip:${(await sha256Hex('ip:' + clientIp(request))).slice(0, 32)}`, 30, 10 * 60e3, 'Too many sign-in attempts, try again later.');
  const state = randomToken(32), nonce = randomToken(24), binding = randomToken(24);
  const verifier = P.pkce ? randomToken(48) : null;
  const now = Date.now();
  await env.DB.prepare(
    `INSERT INTO oauth_states (state_hash, provider, nonce, verifier, binding, return_to, lang, created_at, expires_at)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)`
  ).bind(await sha256Hex(state), provider, nonce, verifier, await sha256Hex(binding), ret + '#' + to,
    normalizeLang(url.searchParams.get('lang') || (ret.startsWith('/en') ? 'en' : 'fr')), now, now + STATE_TTL_MS).run();
  const q = new URLSearchParams({ client_id: P.clientId(env), redirect_uri: redirectUri(env, provider), response_type: 'code',
    scope: P.scope, state, nonce, ...P.extra });
  if (verifier) {
    q.set('code_challenge', base64url(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)))));
    q.set('code_challenge_method', 'S256');
  }
  return new Response(null, { status: 302, headers: {
    Location: P.authorize(env) + '?' + q.toString(),
    'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer',
    // ties the callback to this browser; SameSite=None because Apple comes back with a cross-site POST
    'Set-Cookie': `stalak_o=${binding}; Path=/api/auth/oauth; HttpOnly; Secure; SameSite=None; Max-Age=${STATE_TTL_MS / 1000}`,
  } });
}

class OAuthFail extends Error { constructor(code, detail) { super(detail || code); this.code = code; } }

// GET or POST /api/auth/oauth/:provider/callback
export async function oauthCallback(request, env, provider, method) {
  const P = PROVIDERS[provider];
  if (!P) throw new HttpError(404, 'not_found', 'Unknown provider.');
  let params;
  if (method === 'POST') {
    const ct = (request.headers.get('Content-Type') || '').toLowerCase();
    if (!ct.startsWith('application/x-www-form-urlencoded')) throw new HttpError(415, 'form_required', 'Form post expected.');
    params = new URLSearchParams(await readText(request, 16 * 1024));
  } else if (method === 'GET') {
    params = new URL(request.url).searchParams;
  } else throw new HttpError(405, 'method_not_allowed', 'Method not allowed.');

  let ret = '/#account';
  try {
    const state = params.get('state') || '';
    const row = state.length >= 20 && state.length <= 100
      ? await env.DB.prepare('SELECT * FROM oauth_states WHERE state_hash = ?1').bind(await sha256Hex(state)).first() : null;
    if (row) await env.DB.prepare('DELETE FROM oauth_states WHERE state_hash = ?1').bind(row.state_hash).run();   // single use
    if (!row || row.provider !== provider || row.expires_at < Date.now()) throw new OAuthFail('state_mismatch', 'unknown or expired state');
    ret = row.return_to;
    const bind = getCookie(request, 'stalak_o');
    if (!bind || !timingSafeEqual(await sha256Hex(bind), row.binding)) throw new OAuthFail('state_mismatch', 'browser binding missing');
    if (params.get('error')) throw new OAuthFail(/access_denied|user_cancelled/.test(params.get('error')) ? 'cancelled' : 'oauth_failed', params.get('error'));
    const code = params.get('code');
    if (!code || code.length > 2048) throw new OAuthFail('oauth_failed', 'no code');
    if (!P.enabled(env)) throw new OAuthFail('not_enabled');

    // the code for tokens, server to server
    const form = new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: redirectUri(env, provider),
      client_id: P.clientId(env), client_secret: await P.secret(env) });
    if (row.verifier) form.set('code_verifier', row.verifier);
    const res = await fetch(P.token(env), { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' }, body: form.toString() });
    const tok = await res.json().catch(() => ({}));
    if (!res.ok || !tok.id_token) throw new OAuthFail('oauth_failed', 'token endpoint ' + res.status + ' ' + (tok.error || ''));
    let claims;
    try { claims = await verifyIdToken(env, provider, tok.id_token, row.nonce); }
    catch (e) { throw new OAuthFail('oauth_failed', 'id_token: ' + e.message); }

    // Apple sends the name once, the first time, next to the code
    let name = claims.name || [claims.given_name, claims.family_name].filter(Boolean).join(' ');
    if (provider === 'apple' && params.get('user')) {
      try { const u = JSON.parse(params.get('user')); name = [u.name && u.name.firstName, u.name && u.name.lastName].filter(Boolean).join(' '); } catch {}
    }
    const user = await linkOrCreate(env, provider, claims, name, row.lang);
    const cookies = [await createSession(env, user, 'oauth:' + provider), await trustDevice(request, env, user.id)];
    return backTo(env, ret, 'auth-ok-' + (String(ret.split('#')[1]).startsWith('pro') ? 'pro' : 'account'), cookies);
  } catch (e) {
    const code = e instanceof OAuthFail ? e.code : 'oauth_failed';
    console.warn('[stalak] oauth', provider, code, e && e.message);
    return backTo(env, ret, 'auth-err-' + code);
  }
}

// An identity already linked signs in its account. Otherwise the account with the same (verified) e-mail gets the identity,
// or a new account is made, its address counted as verified.
export async function linkOrCreate(env, provider, claims, name, lang) {
  const now = Date.now(), sub = String(claims.sub);
  const email = claims.email ? String(claims.email).trim().toLowerCase() : null;
  const ident = await env.DB.prepare('SELECT * FROM identities WHERE provider = ?1 AND subject = ?2').bind(provider, sub).first();
  if (ident) {
    const u = await env.DB.prepare('SELECT * FROM users WHERE id = ?1').bind(ident.user_id).first();
    if (u) {
      await env.DB.prepare('UPDATE identities SET last_login_at = ?3, email = COALESCE(?4, email) WHERE provider = ?1 AND subject = ?2').bind(provider, sub, now, email).run();
      return u;
    }
    await env.DB.prepare('DELETE FROM identities WHERE provider = ?1 AND subject = ?2').bind(provider, sub).run();
  }
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new OAuthFail('oauth_no_email');
  if (!PROVIDERS[provider].emailVerified(claims)) throw new OAuthFail('oauth_email_unverified');
  let user = await env.DB.prepare('SELECT * FROM users WHERE email = ?1').bind(email).first();
  if (user) {
    if (!user.email_verified_at) await env.DB.prepare('UPDATE users SET email_verified_at = ?2 WHERE id = ?1').bind(user.id, now).run();
  } else {
    let dn = null;
    try { dn = normalizeDisplayName(name ? String(name).slice(0, 60) : null); } catch { dn = null; }
    if (dn && [...dn].length > 30) dn = null;
    const id = randomId('u_');
    await env.DB.prepare('INSERT INTO users (id, email, lang, created_at, last_login_at, display_name, email_verified_at) VALUES (?1, ?2, ?3, ?4, ?4, ?5, ?4)')
      .bind(id, email, lang === 'fr' ? 'fr' : 'en', now, dn).run();
    user = await env.DB.prepare('SELECT * FROM users WHERE id = ?1').bind(id).first();
  }
  await env.DB.prepare('INSERT INTO identities (provider, subject, user_id, email, created_at, last_login_at) VALUES (?1, ?2, ?3, ?4, ?5, ?5)')
    .bind(provider, sub, user.id, email, now).run();
  return user;
}

export { decodeJwt };
