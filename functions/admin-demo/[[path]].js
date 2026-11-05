// Cloudflare Pages Function: /admin-demo/ — the DEMO of the owner's dashboard, with made-up figures, for the preview of a
// branch (rule 9, « maquette avant le vrai site »): https://<branch>.stalak-site.pages.dev/admin-demo/
// It holds no real data and asks the server for nothing (the page answers itself from admin-demo-data.js).
// It exists only on previews (<branch>.<project>.pages.dev) and on a developer's computer; on stalak.app, admin.stalak.app
// and the bare production pages.dev address it answers 404.
import { ADMIN_DEMO_HTML } from '../_lib/admin-page.js';
import { isPreviewHost } from '../_lib/router.js';
import { base64url } from '../_lib/crypto.js';

const notFound = () => new Response('Not found', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } });
const local = (h) => /^(localhost|127\.0\.0\.1)$/.test(h);

export async function onRequest({ request }) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return notFound();
  const url = new URL(request.url);
  if (!isPreviewHost(url.hostname) && !local(url.hostname)) return notFound();
  const nonce = base64url(crypto.getRandomValues(new Uint8Array(16)));
  return new Response(request.method === 'HEAD' ? null : ADMIN_DEMO_HTML.replaceAll('__NONCE__', nonce), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Content-Security-Policy': `default-src 'none'; script-src 'nonce-${nonce}'; style-src 'nonce-${nonce}'; font-src 'self'; img-src 'self' data:; connect-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'`,
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
      'X-Robots-Tag': 'noindex, nofollow',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    },
  });
}
