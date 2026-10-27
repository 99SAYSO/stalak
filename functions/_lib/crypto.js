// WebCrypto helpers (work the same in Cloudflare Workers and Node >= 20).
const enc = new TextEncoder();

export function toHex(buf) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function randomBytes(n) {
  const a = new Uint8Array(n);
  crypto.getRandomValues(a);
  return a;
}

export function base64url(bytes) {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function randomToken(n = 32) {
  return base64url(randomBytes(n));
}

export function randomId(prefix = '') {
  return prefix + toHex(randomBytes(12));
}

// Uniform 6-digit code (rejection sampling, no modulo bias).
export function randomCode() {
  const a = new Uint32Array(1);
  const limit = Math.floor(0x100000000 / 1000000) * 1000000;
  do crypto.getRandomValues(a); while (a[0] >= limit);
  return String(a[0] % 1000000).padStart(6, '0');
}

export async function sha256Hex(text) {
  return toHex(await crypto.subtle.digest('SHA-256', enc.encode(text)));
}

export async function hmacSha256Hex(secret, message) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return toHex(await crypto.subtle.sign('HMAC', key, enc.encode(message)));
}

// Constant-time string comparison (length leak only).
export function timingSafeEqual(a, b) {
  a = String(a); b = String(b);
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
