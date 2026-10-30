// Test server for the online-saving UI tests (tests/ui/test_cloud.py):
//   node tests/ui/cloud-server.mjs <built public dir> <port>
// Serves the built site (python3 build_site.py, in a copy of the repo) and runs the real Pages Function
// (functions/api/[[path]].js) on an in-memory SQLite "D1" and an in-memory fake R2 bucket.
// Test-only helpers under /__test/ (never part of the site):
//   GET /__test/login?email=…&pro=1  -> creates the account if needed (Pro with pro=1, &plan=basic|pro|max, ex-Pro with pro=ex), signs in (cookie), redirects to ?to=
//   POST /__test/r2?on=0|1           -> removes / puts back the MEDIA binding (R2 not configured)
//   POST /__test/quota?bytes=N       -> per-user quota (default: 20 GB)
//   GET /__test/stats                -> {objects, uploads, files, projects}
//   POST /__test/fail?method=PUT&path=…&n=N -> the next N such requests whose path contains … get a 503
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { Readable } from 'node:stream';
import { join, extname, dirname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createD1 } from '../backend/fake-d1.mjs';
import { createR2 } from '../backend/fake-r2.mjs';
import { onRequest } from '../../functions/api/[[path]].js';
import { sha256Hex, base64url } from '../../functions/_lib/crypto.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const pub = process.argv[2];
const port = Number(process.argv[3] || 8790);
const origin = `http://localhost:${port}`;
const r2 = createR2();
const env = { DB: createD1(join(root, 'migrations')), MEDIA: r2, APP_ORIGIN: origin, DEV_MODE: '1', PADDLE_ENV: 'sandbox', PADDLE_CLIENT_TOKEN: 'test_x',
  // the offer of 30/10 (entitlements.js): Max yearly is left without a price, to see « Bientôt »
  PADDLE_PRICE_BASIC_MONTH: 'pri_basic_m', PADDLE_PRICE_BASIC_YEAR: 'pri_basic_y', PADDLE_PRICE_PRO_MONTH: 'pri_pro_m', PADDLE_PRICE_PRO_YEAR: 'pri_pro_y',
  PADDLE_PRICE_MAX_MONTH: 'pri_max_m', PADDLE_API_KEY: 'pdl_test_key_not_real' };
// Paddle, imitated: the preview of a change of plan (23.10 € now for a bigger plan) and the change itself
const realFetch = globalThis.fetch;
globalThis.fetch = async (url, init = {}) => {
  const u = String(url);
  if (/paddle\.com\/subscriptions\/sub_[\w-]+\/preview$/.test(u)) {
    const b = JSON.parse(init.body || '{}');
    return Response.json({ data: { currency_code: 'EUR', immediate_transaction: b.proration_billing_mode === 'prorated_immediately' ? { details: { totals: { grand_total: '2310', currency_code: 'EUR' } } } : null } });
  }
  if (/paddle\.com\/subscriptions\/sub_[\w-]+$/.test(u) && init.method === 'PATCH') return Response.json({ data: { status: 'active' } });
  return realFetch(url, init);
};
const fails = [];
console.log = () => {};   // dev codes etc.

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webmanifest': 'application/manifest+json',
  '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.ico': 'image/x-icon', '.txt': 'text/plain', '.xml': 'application/xml' };

async function testRoute(req, url, res) {
  const q = url.searchParams;
  if (url.pathname === '/__test/login') {
    const email = (q.get('email') || 'pro@example.com').toLowerCase();
    let u = env.DB.raw.prepare('SELECT id FROM users WHERE email = ?').get(email);
    const now = Date.now();
    if (!u) {
      const id = 'u_' + base64url(crypto.getRandomValues(new Uint8Array(9)));
      env.DB.raw.prepare('INSERT INTO users (id, email, lang, created_at, last_login_at, email_verified_at, display_name) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run(id, email, q.get('lang') || 'fr', now, now, now, q.get('name') || null);
      u = { id };
    }
    if (q.get('pro') === '1') {
      // &plan=basic|pro|max (offer of 30/10); without it, Pro at the first offer's price
      const plan = ['basic', 'pro', 'max'].includes(q.get('plan')) ? q.get('plan') : null;
      env.DB.raw.prepare(`INSERT OR REPLACE INTO subscriptions (id, user_id, customer_id, status, price_id, current_period_end, last_event_at, updated_at, plan)
        VALUES (?, ?, ?, 'active', ?, ?, ?, ?, ?)`).run('sub_' + u.id, u.id, 'ctm_' + u.id, plan ? 'pri_' + plan + '_m' : 'pri_month', now + 30 * 864e5, now, now, plan);
    } else if (q.get('pro') === 'ex') {
      // Stalak Pro has ended (the subscription stays, canceled): an ex-Pro
      env.DB.raw.prepare(`INSERT OR REPLACE INTO subscriptions (id, user_id, customer_id, status, price_id, current_period_end, last_event_at, updated_at)
        VALUES (?, ?, ?, 'canceled', 'pri_month', ?, ?, ?)`).run('sub_' + u.id, u.id, 'ctm_' + u.id, now - 864e5, now, now);
    } else if (q.get('pro') === '0') {
      env.DB.raw.prepare('DELETE FROM subscriptions WHERE user_id = ?').run(u.id);
    }
    const token = base64url(crypto.getRandomValues(new Uint8Array(32)));
    env.DB.raw.prepare('INSERT INTO sessions (token_hash, user_id, created_at, expires_at, method) VALUES (?, ?, ?, ?, ?)').run(await sha256Hex(token), u.id, now, now + 864e5, 'password');
    res.writeHead(302, { Location: q.get('to') || '/', 'Set-Cookie': `stalak_s=${token}; Path=/; HttpOnly; SameSite=Lax` });
    return res.end();
  }
  if (url.pathname === '/__test/r2') { env.MEDIA = q.get('on') === '0' ? undefined : r2; }
  else if (url.pathname === '/__test/quota') { if (q.get('bytes')) env.CLOUD_QUOTA_BYTES = q.get('bytes'); else delete env.CLOUD_QUOTA_BYTES; }
  else if (url.pathname === '/__test/fail') { fails.push({ method: q.get('method') || 'PUT', path: q.get('path'), n: Number(q.get('n') || 1) }); }
  else if (url.pathname !== '/__test/stats') { res.writeHead(404); return res.end(); }
  const n = (t) => env.DB.raw.prepare(`SELECT COUNT(*) AS n FROM ${t}`).get().n;
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ objects: r2.objects.size, uploads: r2.uploads.size, files: n('project_files'), projects: n('projects'),
    keys: [...r2.objects.keys()], requests: counts }));
}
const counts = {};

async function api(req, url, res) {
  const f = fails.find((x) => x.n > 0 && x.method === req.method && url.pathname.includes(x.path));
  // (a closed connection is sent again by the browser itself for a PUT: a 503 is what the app has to handle)
  if (f) { f.n--; req.resume(); res.writeHead(503, { 'Content-Type': 'application/json' }); res.end('{"error":"unavailable"}'); return; }
  const key = req.method + ' ' + url.pathname.replace(/\/[^/]+\/files\/[^/]+/, '/:p/files/:f').replace(/\/parts\/\d+/, '/parts/:n');
  counts[key] = (counts[key] || 0) + 1;
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) if (v != null) headers.set(k, Array.isArray(v) ? v.join(', ') : v);
  const hasBody = !['GET', 'HEAD'].includes(req.method);
  const request = new Request(origin + req.url, { method: req.method, headers, body: hasBody ? Readable.toWeb(req) : undefined, duplex: 'half' });
  const out = await onRequest({ request, env, params: {}, waitUntil(p) { Promise.resolve(p).catch(() => {}); } });
  const h = {};
  out.headers.forEach((v, k) => { if (k !== 'set-cookie') h[k] = v; });
  const sc = out.headers.getSetCookie(); if (sc.length) h['set-cookie'] = sc.map((c) => c.replace(/; Secure/i, ''));
  res.writeHead(out.status, h);
  if (out.body) Readable.fromWeb(out.body).pipe(res); else res.end();
}

async function file(req, url, res) {
  let p = decodeURIComponent(url.pathname);
  if (p.endsWith('/')) p += 'index.html';
  const full = normalize(join(pub, p));
  if (!full.startsWith(normalize(pub))) { res.writeHead(403); return res.end(); }
  try {
    let s = await stat(full), f = full;
    if (s.isDirectory()) { f = join(full, 'index.html'); s = await stat(f); }
    res.writeHead(200, { 'Content-Type': TYPES[extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(await readFile(f));
  } catch {
    try { await stat(full + '.html'); res.writeHead(200, { 'Content-Type': TYPES['.html'] }); res.end(await readFile(full + '.html')); }
    catch { res.writeHead(404); res.end('not found'); }
  }
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, origin);
  try {
    if (url.pathname.startsWith('/__test/')) return await testRoute(req, url, res);
    if (url.pathname.startsWith('/api/')) return await api(req, url, res);
    return await file(req, url, res);
  } catch (e) {
    process.stderr.write(String(e && e.stack || e) + '\n');
    if (!res.headersSent) res.writeHead(500); res.end();
  }
}).listen(port, () => process.stdout.write(`ready ${origin}\n`));
