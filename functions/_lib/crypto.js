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

// PBKDF2-SHA256 (WebCrypto), 32-byte result as hex. 100000 iterations is the most the Workers runtime accepts.
export const PBKDF2_ITER = 100000;
export async function pbkdf2Hex(password, saltHex, iterations = PBKDF2_ITER) {
  const salt = new Uint8Array(String(saltHex).match(/../g).map((h) => parseInt(h, 16)));
  const key = await crypto.subtle.importKey('raw', enc.encode(String(password)), 'PBKDF2', false, ['deriveBits']);
  return toHex(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, 256));
}

export function base64Encode(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

export function base64Decode(text) {
  const s = atob(text);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}
