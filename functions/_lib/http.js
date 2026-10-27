// JSON responses, errors, cookies, CSRF checks.

export class HttpError extends Error {
  constructor(status, code, message, extra) {
    super(message || code);
    this.status = status;
    this.code = code;
    this.extra = extra;
  }
}

export function json(data, status = 200, headers = {}) {
  const h = new Headers({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  for (const [k, v] of Object.entries(headers)) {
    if (Array.isArray(v)) v.forEach((x) => h.append(k, x));
    else h.set(k, v);
  }
  return new Response(JSON.stringify(data), { status, headers: h });
}

export function errorResponse(err) {
  if (err instanceof HttpError) {
    return json({ error: err.code, message: err.message, ...(err.extra || {}) }, err.status);
  }
  console.error('[stalak] unexpected error', err && err.stack ? err.stack : err);
  return json({ error: 'internal_error', message: 'Unexpected server error.' }, 500);
}

export function isDev(env) {
  return env.DEV_MODE === '1' || /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(env.APP_ORIGIN || '');
}

export function appOrigin(env) {
  return (env.APP_ORIGIN || 'https://stalak.app').replace(/\/+$/, '');
}

export function allowedOrigins(env) {
  const list = [appOrigin(env)];
  for (const o of (env.EXTRA_ORIGINS || '').split(',')) if (o.trim()) list.push(o.trim().replace(/\/+$/, ''));
  return list;
}

// CSRF protection for state-changing requests: JSON content type + same Origin.
export function checkCsrf(request, env) {
  const ct = (request.headers.get('Content-Type') || '').toLowerCase();
  if (!ct.startsWith('application/json')) {
    throw new HttpError(415, 'json_required', 'Content-Type must be application/json.');
  }
  const origin = request.headers.get('Origin');
  const ok = origin && (allowedOrigins(env).includes(origin) ||
    (isDev(env) && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)));
  if (!ok) throw new HttpError(403, 'bad_origin', 'Request origin not allowed.');
}

export async function readJson(request, maxBytes = 16 * 1024) {
  const text = await readText(request, maxBytes);
  if (!text) return {};
  try {
    const v = JSON.parse(text);
    if (v === null || typeof v !== 'object' || Array.isArray(v)) throw new Error('not an object');
    return v;
  } catch {
    throw new HttpError(400, 'invalid_json', 'Body must be a JSON object.');
  }
}

export async function readText(request, maxBytes) {
  const len = Number(request.headers.get('Content-Length') || 0);
  if (len > maxBytes) throw new HttpError(413, 'too_large', `Body larger than ${maxBytes} bytes.`);
  const buf = await request.arrayBuffer();
  if (buf.byteLength > maxBytes) throw new HttpError(413, 'too_large', `Body larger than ${maxBytes} bytes.`);
  return new TextDecoder().decode(buf);
}

export function getCookie(request, name) {
  const raw = request.headers.get('Cookie') || '';
  for (const part of raw.split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return null;
}

export function sessionCookie(token, maxAgeSec) {
  return `stalak_s=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAgeSec}`;
}

export function clearSessionCookie() {
  return 'stalak_s=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0';
}

export function clientIp(request) {
  return request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For')?.split(',')[0].trim() || 'unknown';
}
