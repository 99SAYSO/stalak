// Cloudflare Pages Function: /admin and /admin/* — the owner's dashboard page.
// Only on the admin host with a valid Cloudflare Access token (functions/_lib/admin.js); anywhere else it does not exist (404).
import { requireAdmin } from '../_lib/admin.js';
import { ADMIN_HTML } from '../_lib/admin-page.js';
import { base64url } from '../_lib/crypto.js';

const notFound = () => new Response('Not found', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } });

export async function onRequest({ request, env }) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return notFound();
  try {
    await requireAdmin(request, env);
  } catch (e) {
    if (e && e.status === 403) {
      return new Response('Accès refusé : passe par https://' + String(env.ADMIN_HOST || 'admin.stalak.app') + '/admin/ et connecte-toi avec ton e-mail.',
        { status: 403, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } });
    }
    return notFound();
  }
  const nonce = base64url(crypto.getRandomValues(new Uint8Array(16)));
  return new Response(request.method === 'HEAD' ? null : ADMIN_HTML.replaceAll('__NONCE__', nonce), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Content-Security-Policy': `default-src 'none'; script-src 'nonce-${nonce}'; style-src 'nonce-${nonce}'; font-src 'self'; img-src 'self' data:; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'`,
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
      'X-Robots-Tag': 'noindex, nofollow',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    },
  });
}
