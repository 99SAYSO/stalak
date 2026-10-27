// Minimal JWT (JWS compact) helpers on WebCrypto: verify RS256 / ES256 against a JWKS, sign ES256 (Apple's client secret).
import { base64url } from './crypto.js';

const enc = new TextEncoder();

export function b64urlToBytes(s) {
  s = String(s).replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
const b64urlJson = (o) => base64url(enc.encode(JSON.stringify(o)));

export function decodeJwt(token) {
  const parts = String(token || '').split('.');
  if (parts.length !== 3) throw new Error('malformed token');
  const header = JSON.parse(new TextDecoder().decode(b64urlToBytes(parts[0])));
  const payload = JSON.parse(new TextDecoder().decode(b64urlToBytes(parts[1])));
  return { header, payload, signed: enc.encode(parts[0] + '.' + parts[1]), sig: b64urlToBytes(parts[2]) };
}

const ALGS = {
  RS256: { kty: 'RSA', imp: { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, ver: { name: 'RSASSA-PKCS1-v1_5' } },
  ES256: { kty: 'EC', imp: { name: 'ECDSA', namedCurve: 'P-256' }, ver: { name: 'ECDSA', hash: 'SHA-256' } },
};

// Verifies the signature of `token` with the key of `jwks` named by its kid. `algs`: accepted algorithms.
// Returns {header, payload}; throws on any problem. Claims (iss, aud, exp, nonce…) are checked by the caller.
export async function verifyJwtSignature(token, jwks, algs) {
  const t = decodeJwt(token);
  const alg = t.header.alg;
  if (!algs.includes(alg) || !ALGS[alg]) throw new Error('algorithm not allowed: ' + alg);
  const keys = (jwks && jwks.keys) || [];
  const jwk = keys.find((k) => k.kid === t.header.kid && (!k.alg || k.alg === alg) && k.kty === ALGS[alg].kty && (!k.use || k.use === 'sig'));
  if (!jwk) throw Object.assign(new Error('unknown key id'), { unknownKid: true });
  const { kty, n, e, crv, x, y } = jwk;
  const pub = kty === 'RSA' ? { kty, n, e } : { kty, crv, x, y };
  const key = await crypto.subtle.importKey('jwk', pub, ALGS[alg].imp, false, ['verify']);
  if (alg === 'ES256' && t.sig.length !== 64) throw new Error('bad signature');
  const ok = await crypto.subtle.verify(ALGS[alg].ver, key, t.sig, t.signed);
  if (!ok) throw new Error('bad signature');
  return { header: t.header, payload: t.payload };
}

// PEM (PKCS #8, "-----BEGIN PRIVATE KEY-----") -> bytes. Accepts the key pasted with real or written "\n" line breaks.
export function pemToBytes(pem) {
  const body = String(pem || '').replace(/\\n/g, '\n').replace(/-----(BEGIN|END)[^-]*-----/g, '').replace(/\s+/g, '');
  if (!body) throw new Error('empty key');
  return b64urlToBytes(body.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''));
}

// ES256 JWS. WebCrypto's ECDSA signature is already r||s (64 bytes), the JWS format.
export async function signEs256(header, payload, pkcs8Pem) {
  const key = await crypto.subtle.importKey('pkcs8', pemToBytes(pkcs8Pem), { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const input = b64urlJson({ ...header, alg: 'ES256' }) + '.' + b64urlJson(payload);
  const sig = new Uint8Array(await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, enc.encode(input)));
  return input + '.' + base64url(sig);
}
