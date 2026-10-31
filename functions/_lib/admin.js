// The owner's dashboard: /api/admin/* (data) and /admin/ (the page, functions/admin/[[path]].js), on admin.stalak.app only.
//
// Who gets in: Cloudflare Access sits in front of admin.stalak.app and lets only the owner's e-mail through. Cloudflare's advice
// is not to trust that alone but to check the token Access adds to each request, so here every request must:
//   - come to the admin host (ADMIN_HOST, e.g. admin.stalak.app): the same routes on stalak.app or *.pages.dev answer 404;
//   - carry a Cf-Access-Jwt-Assertion token signed by the team's Access keys (RS256, ACCESS_TEAM_DOMAIN/cdn-cgi/access/certs),
//     for this application (aud = ACCESS_AUD), not expired, for an e-mail listed in ADMIN_EMAILS.
// Missing settings = the dashboard is off (404). Changes (POST, DELETE) also need JSON and the dashboard's own Origin.
// Docs: developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/
import { HttpError, json, readJson } from './http.js';
import { verifyJwtSignature } from './jwt.js';
import { jwksFor } from './oauth.js';
import { subscriptionGivesPro, intervalOf, planOfSub, planOfPrice, salePrices, payEnv } from './entitlements.js';
import { getState, setState, isAvailable, messagesOf, deliverReply, catchUpReplies, MESSAGE_MAX, cleanupTickets } from './support.js';
import { LIVE_MS, today } from './metrics.js';

const TEAM = /^https:\/\/[a-z0-9][a-z0-9-]{0,62}\.cloudflareaccess\.com$/;
const TICKET = /^t_[A-Za-z0-9_-]{16,32}$/;
export const PRICE_CENTS = { month: 999, year: 7900 };   // first offer, Stalak Pro, EUR tax included (its subscribers keep it)
// offer of 30/10/2026 (evening), in dollars before the VAT Paddle adds per country (STALAK_CONTEXTE.md, section 2)
export const PLAN_CENTS = { pro: { month: 799, year: 4999 }, creator: { month: 1499, year: 9999 } };
export const PAID_PLANS = ['pro', 'creator'];

export function adminConfig(env) {
  const host = String(env.ADMIN_HOST || '').trim().toLowerCase();
  const team = String(env.ACCESS_TEAM_DOMAIN || '').trim().replace(/\/+$/, '').toLowerCase();
  const aud = String(env.ACCESS_AUD || '').trim();
  const emails = String(env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
  if (!host || !TEAM.test(team) || aud.length < 16 || !emails.length) return null;
  return { host, team, aud, emails };
}

// Throws 404 (not the admin host, or the dashboard is not set up) or 403 (no valid Access token); returns {email}.
export async function requireAdmin(request, env) {
  const cfg = adminConfig(env);
  if (!cfg || new URL(request.url).hostname.toLowerCase() !== cfg.host) throw new HttpError(404, 'not_found', 'Unknown API route.');
  const token = request.headers.get('Cf-Access-Jwt-Assertion') || '';
  if (!token) throw new HttpError(403, 'access_required', 'Sign in through Cloudflare Access.');
  const certs = `${cfg.team}/cdn-cgi/access/certs`;
  let out;
  try {
    try { out = await verifyJwtSignature(token, await jwksFor(certs), ['RS256']); }
    catch (e) { if (!e.unknownKid) throw e; out = await verifyJwtSignature(token, await jwksFor(certs, true), ['RS256']); } // keys rotate
  } catch (e) {
    console.error('[stalak] admin token', e && e.message ? String(e.message).slice(0, 80) : 'error');
    throw new HttpError(403, 'access_denied', 'Access token not valid.');
  }
  const p = out.payload || {}, now = Math.floor(Date.now() / 1000);
  const auds = Array.isArray(p.aud) ? p.aud : [p.aud];
  const email = String(p.email || '').toLowerCase();
  if (p.iss !== cfg.team || !auds.includes(cfg.aud) || typeof p.exp !== 'number' || p.exp < now - 30
    || (typeof p.nbf === 'number' && p.nbf > now + 30) || !cfg.emails.includes(email)) {
    throw new HttpError(403, 'access_denied', 'Access token not valid.');
  }
  return { email };
}

// Changes from the dashboard: JSON and an Origin equal to the dashboard's own (a page elsewhere cannot send them).
function checkAdminWrite(request) {
  const ct = (request.headers.get('Content-Type') || '').toLowerCase();
  if (!ct.startsWith('application/json')) throw new HttpError(415, 'json_required', 'Content-Type must be application/json.');
  if (request.headers.get('Origin') !== new URL(request.url).origin) throw new HttpError(403, 'bad_origin', 'Request origin not allowed.');
}

const dayOf = (ms) => new Date(ms).toISOString().slice(0, 10);
function dayList(n, now = Date.now()) {
  const out = []; for (let i = n - 1; i >= 0; i--) out.push(dayOf(now - i * 864e5)); return out;
}
const addTo = (o, k, v) => { o[k] = (o[k] || 0) + (Number(v) || 0); };

async function liveVisitors(env, now = Date.now()) {
  const { results } = await env.DB.prepare('SELECT lang, COUNT(*) AS n FROM visits WHERE day IN (?1, ?2) AND last_at > ?3 GROUP BY lang')
    .bind(today(now), today(now - 864e5), now - LIVE_MS).all();
  const v = { total: 0, fr: 0, en: 0 };
  for (const r of results) { v[r.lang === 'en' ? 'en' : 'fr'] += r.n; v.total += r.n; }
  return v;
}
async function ticketCounts(env) {
  return env.DB.prepare(
    `SELECT SUM(status = 'open') AS open,
       SUM(status = 'open' AND (admin_read_at IS NULL OR admin_read_at < updated_at)
         AND (SELECT sender FROM ticket_messages m WHERE m.ticket_id = tickets.id ORDER BY m.id DESC LIMIT 1) = 'user') AS unread
     FROM tickets`
  ).first().then((r) => ({ open: (r && r.open) || 0, unread: (r && r.unread) || 0 }));
}

export async function stats(env, days = 30, now = Date.now()) {
  const list = dayList(days, now), from = list[0], fromMs = Date.parse(from + 'T00:00:00Z');
  const since30 = now - 30 * 864e5;
  const q = (sql, ...b) => env.DB.prepare(sql).bind(...b);
  const pe = payEnv(env);
  const [users, signups, subs, payDays, payAll, pay30, refDays, refAll, visitDays, lyrDays, counts, cloud, ticketDays, recent, payPlans] = await env.DB.batch([
    q('SELECT COUNT(*) AS n, SUM(email_verified_at IS NOT NULL) AS verified FROM users'),
    q("SELECT date(created_at / 1000, 'unixepoch') AS d, COUNT(*) AS n FROM users WHERE created_at >= ?1 GROUP BY d", fromMs),
    // payments: only those of the Paddle environment in use (migration 0009): test rows leave the figures with real payments
    q('SELECT id, user_id, status, price_id, plan, current_period_end, cancel_at, keep_plan, keep_until FROM subscriptions WHERE env = ?1', pe),
    q(`SELECT date(billed_at / 1000, 'unixepoch') AS d, currency, SUM(total) AS total, COUNT(*) AS n,
         SUM(origin <> 'subscription_recurring') AS first FROM payments WHERE billed_at >= ?1 AND env = ?2 GROUP BY d, currency`, fromMs, pe),
    q('SELECT currency, SUM(total) AS total, SUM(tax) AS tax, SUM(COALESCE(earnings, 0)) AS earnings, COUNT(*) AS n FROM payments WHERE env = ?1 GROUP BY currency', pe),
    q('SELECT currency, SUM(total) AS total, COUNT(*) AS n FROM payments WHERE billed_at >= ?1 AND env = ?2 GROUP BY currency', since30, pe),
    q(`SELECT date(created_at / 1000, 'unixepoch') AS d, currency, SUM(total) AS total FROM refunds
         WHERE status = 'approved' AND action IN ('refund', 'chargeback') AND created_at >= ?1 AND env = ?2 GROUP BY d, currency`, fromMs, pe),
    q(`SELECT currency, SUM(total) AS total, COUNT(*) AS n FROM refunds WHERE status = 'approved' AND action IN ('refund', 'chargeback') AND env = ?1 GROUP BY currency`, pe),
    q('SELECT day AS d, COUNT(*) AS n FROM visits WHERE day >= ?1 GROUP BY day', from),
    q('SELECT day AS d, SUM(jobs) AS jobs, SUM(seconds) AS seconds, COUNT(DISTINCT user_id) AS users FROM lyrics_usage WHERE day >= ?1 GROUP BY day', from),
    q('SELECT day AS d, name, n FROM daily_counts WHERE day >= ?1', from),
    q('SELECT COUNT(*) AS projects, COUNT(DISTINCT user_id) AS users, SUM(media_bytes) AS bytes FROM projects'),
    q("SELECT date(created_at / 1000, 'unixepoch') AS d, COUNT(*) AS n FROM tickets WHERE created_at >= ?1 GROUP BY d", fromMs),
    q('SELECT id, email, display_name, created_at, email_verified_at FROM users ORDER BY created_at DESC LIMIT 20'),
    // revenue per plan: payments by price (the plan comes from the price, entitlements.js)
    q('SELECT price_id, currency, SUM(total) AS total, SUM(billed_at >= ?1) AS n30, SUM(CASE WHEN billed_at >= ?1 THEN total ELSE 0 END) AS total30, COUNT(*) AS n FROM payments WHERE env = ?2 GROUP BY price_id, currency', since30, pe),
  ]);
  const R = (r) => r.results || [];

  const series = {};
  for (const d of list) series[d] = { day: d, signups: 0, visits: 0, newPro: 0, payments: 0, revenue: 0, refunds: 0,
    lyricsJobs: 0, lyricsMinutes: 0, lyricsUsers: 0, cloudSaves: 0, helpQuestions: 0, helpFailed: 0, tickets: 0, ticketMessages: 0 };
  const at = (d) => series[d];
  for (const r of R(signups)) if (at(r.d)) at(r.d).signups = r.n;
  for (const r of R(visitDays)) if (at(r.d)) at(r.d).visits = r.n;
  // revenue per day in euros (other currencies are listed in the totals, not in the chart)
  for (const r of R(payDays)) if (at(r.d)) { at(r.d).payments += r.n; at(r.d).newPro += r.first || 0; if (r.currency === 'EUR') at(r.d).revenue += r.total || 0; }
  for (const r of R(refDays)) if (at(r.d) && r.currency === 'EUR') at(r.d).refunds += r.total || 0;
  for (const r of R(lyrDays)) if (at(r.d)) { at(r.d).lyricsJobs = r.jobs || 0; at(r.d).lyricsMinutes = Math.round((r.seconds || 0) / 6) / 10; at(r.d).lyricsUsers = r.users || 0; }
  const KEY = { help_q: 'helpQuestions', help_fail: 'helpFailed', cloud_save: 'cloudSaves', ticket: 'tickets', ticket_msg: 'ticketMessages' };
  for (const r of R(counts)) if (at(r.d) && KEY[r.name] && r.name !== 'ticket') at(r.d)[KEY[r.name]] = r.n;
  // the funnel (audit of 30/10): visit → export → ad → plans page → payment window → first payment, over the last 30 days;
  // plus the server errors and the code e-mails (anonymous counters, metrics.js)
  const last30 = new Set(list.slice(-30)), ev = {};
  for (const r of R(counts)) if (last30.has(r.d)) ev[r.name] = (ev[r.name] || 0) + (r.n || 0);
  const pick = (prefix) => { const o = {}; for (const k in ev) if (k.startsWith(prefix)) o[k.slice(prefix.length)] = ev[k]; return o; };
  for (const r of R(ticketDays)) if (at(r.d)) at(r.d).tickets = r.n;

  // Stalak Pro now: the same rule as the site (entitlements.js)
  // pro = every paying subscriber (all plans); plans = the same, plan by plan, with the monthly revenue estimated from
  // each subscription's price (a subscriber keeps his price: the first offer's 9.99 € / 79 € count in euros, the prices on
  // sale in dollars; the other older prices (test subscriptions of Basic / Pro / Max in euros) are counted, without amount)
  const pro = { month: 0, year: 0, other: 0, total: 0, ending: 0, pastDue: 0 };
  const plans = {};
  for (const p of PAID_PLANS) plans[p] = { month: 0, year: 0, other: 0, total: 0, ending: 0, mrr: {}, revenue: {}, revenue30: {} };
  const proUsers = new Map();   // account → its plan now
  const mrr = {};
  const sale = salePrices(env);
  for (const s of R(subs)) {
    if (!subscriptionGivesPro(s, now)) continue;
    const k = intervalOf(env, s.price_id) || 'other', plan = planOfSub(env, s), pl = plans[plan];
    pro[k]++; pro.total++;
    if (s.cancel_at) pro.ending++;
    if (s.status === 'past_due') pro.pastDue++;
    if (s.user_id) proUsers.set(s.user_id, plan);
    const first = s.price_id && (s.price_id === env.PADDLE_PRICE_MONTH || s.price_id === env.PADDLE_PRICE_YEAR);
    const cents = first ? PRICE_CENTS : sale[s.price_id] ? PLAN_CENTS[sale[s.price_id].plan] : null, cur = first ? 'EUR' : 'USD';
    const m = !cents ? 0 : k === 'year' ? cents.year / 12 : k === 'month' ? cents.month : 0;
    if (pl) { pl[k]++; pl.total++; if (s.cancel_at) pl.ending++; if (m) addTo(pl.mrr, cur, m); }
    if (m) addTo(mrr, cur, m);
  }
  for (const r of R(payPlans)) {
    const pl = plans[planOfPrice(env, r.price_id) || 'pro'], cur = r.currency || '?';
    pl.revenue[cur] = { total: ((pl.revenue[cur] || {}).total || 0) + (r.total || 0), n: ((pl.revenue[cur] || {}).n || 0) + (r.n || 0) };
    pl.revenue30[cur] = { total: ((pl.revenue30[cur] || {}).total || 0) + (r.total30 || 0), n: ((pl.revenue30[cur] || {}).n || 0) + (r.n30 || 0) };
  }
  const round = (o) => { for (const c in o) o[c] = Math.round(o[c]); return o; };
  for (const p of PAID_PLANS) round(plans[p].mrr);
  round(mrr);
  const byCur = (rows) => { const o = {}; for (const r of rows) o[r.currency || '?'] = { total: r.total || 0, n: r.n || 0, ...(r.tax != null ? { tax: r.tax, earnings: r.earnings } : {}) }; return o; };
  const u = R(users)[0] || {}, c = R(cloud)[0] || {};
  const s30 = (k) => list.slice(-30).reduce((n, d) => n + (series[d][k] || 0), 0);
  return {
    now: new Date(now).toISOString(),
    days: list.map((d) => series[d]),
    totals: {
      users: u.n || 0, verified: u.verified || 0,
      pro, plans,
      // monthly recurring revenue, estimated from the subscriptions running now (yearly price / 12), by currency
      mrr, mrrCents: mrr.USD || 0,
      revenue: { all: byCur(R(payAll)), last30: byCur(R(pay30)), refunds: byCur(R(refAll)) },
    },
    usage: {
      lyrics: { jobs30: s30('lyricsJobs'), minutes30: Math.round(s30('lyricsMinutes')), today: series[list[list.length - 1]].lyricsJobs },
      cloud: { projects: c.projects || 0, users: c.users || 0, bytes: c.bytes || 0, saves30: s30('cloudSaves') },
      help: { questions30: s30('helpQuestions'), failed30: s30('helpFailed'), today: series[list[list.length - 1]].helpQuestions,
        dailyMax: Number.isFinite(Number.parseInt(env.HELP_DAILY_MAX, 10)) ? Number.parseInt(env.HELP_DAILY_MAX, 10) : 60 },
      tickets: { created30: s30('tickets') },
      funnel: {
        visits: s30('visits'), exportStart: ev.ev_export_start || 0, exportOk: ev.ev_export_ok || 0, exportFail: ev.ev_export_fail || 0,
        proOffer: ev.ev_pro_offer || 0, adOffer: ev.ev_ad_offer || 0, adShown: ev.ev_ad_shown || 0, adOk: ev.ev_ad_ok || 0, plansOpen: ev.ev_plans_open || 0, checkoutOpen: ev.ev_checkout_open || 0,
        paid: ev.paid_first || 0, exportFailWhy: pick('ev_export_fail_'), plansWhy: pick('ev_plans_why_'),
        ios: { exportOk: ev.ios_export_ok || 0, exportFail: ev.ios_export_fail || 0 },
      },
      health: { errors30: ev.err_5xx || 0, alerts30: ev.alert || 0, codeMails30: ev.code_mail || 0,
        codeMailsToday: R(counts).filter((r) => r.d === list[list.length - 1] && r.name === 'code_mail').reduce((n, r) => n + r.n, 0) },
    },
    env: pe,
    recentUsers: R(recent).map((r) => ({ email: r.email, name: r.display_name || null, createdAt: new Date(r.created_at).toISOString(),
      verified: !!r.email_verified_at, pro: proUsers.has(r.id), plan: proUsers.get(r.id) || null })),
  };
}

async function ticketList(env, status) {
  const where = status === 'closed' ? "WHERE t.status = 'closed'" : status === 'all' ? '' : "WHERE t.status = 'open'";
  const { results } = await env.DB.prepare(
    `SELECT t.id, t.email, t.lang, t.status, t.created_at, t.updated_at, t.user_seen_at, t.admin_read_at, t.user_id,
       (SELECT sender FROM ticket_messages m WHERE m.ticket_id = t.id ORDER BY m.id DESC LIMIT 1) AS last_from,
       (SELECT substr(body, 1, 140) FROM ticket_messages m WHERE m.ticket_id = t.id ORDER BY m.id DESC LIMIT 1) AS last_text,
       (SELECT COUNT(*) FROM ticket_messages m WHERE m.ticket_id = t.id) AS n
     FROM tickets t ${where} ORDER BY t.updated_at DESC LIMIT 100`
  ).all();
  const now = Date.now();
  // « Pro » badge: the account's subscription gives Pro now (same rule as the site)
  const ids = [...new Set(results.map((t) => t.user_id).filter(Boolean))];
  const proIds = new Map();
  if (ids.length) {
    const { results: subs } = await env.DB.prepare(
      `SELECT user_id, status, current_period_end, price_id, plan, keep_plan, keep_until FROM subscriptions WHERE env = ?1 AND user_id IN (SELECT DISTINCT user_id FROM tickets WHERE user_id IS NOT NULL)`
    ).bind(payEnv(env)).all();
    for (const sb of subs) if (subscriptionGivesPro(sb, now)) proIds.set(sb.user_id, planOfSub(env, sb));
  }
  return results.map((t) => ({ id: t.id, email: t.email, lang: t.lang, status: t.status, account: !!t.user_id, pro: proIds.has(t.user_id),
    plan: proIds.get(t.user_id) || null,
    createdAt: new Date(t.created_at).toISOString(), updatedAt: new Date(t.updated_at).toISOString(),
    visitorLive: !!t.user_seen_at && t.user_seen_at > now - 15e3, lastFrom: t.last_from, lastText: t.last_text || '', messages: t.n,
    unread: t.last_from === 'user' && (!t.admin_read_at || t.admin_read_at < t.updated_at) }));
}

async function ticketDetail(env, id) {
  const t = await env.DB.prepare('SELECT * FROM tickets WHERE id = ?1').bind(id).first();
  if (!t) throw new HttpError(404, 'not_found', 'Ticket not found.');
  let account = null;
  if (t.user_id) {
    const u = await env.DB.prepare('SELECT email, display_name, created_at FROM users WHERE id = ?1').bind(t.user_id).first();
    if (u) {
      const { results } = await env.DB.prepare('SELECT status, current_period_end, price_id, plan, keep_plan, keep_until FROM subscriptions WHERE user_id = ?1 AND env = ?2').bind(t.user_id, payEnv(env)).all();
      const s = results.find((x) => subscriptionGivesPro(x));
      account = { email: u.email, name: u.display_name || null, createdAt: new Date(u.created_at).toISOString(), pro: !!s,
        plan: s ? planOfSub(env, s) : null, interval: s ? intervalOf(env, s.price_id) : null };
    }
  }
  const now = Date.now();
  await env.DB.prepare('UPDATE tickets SET admin_read_at = ?2 WHERE id = ?1').bind(id, now).run();
  return { id: t.id, email: t.email, lang: t.lang, status: t.status, context: t.context || '', account,
    createdAt: new Date(t.created_at).toISOString(), visitorLive: !!t.user_seen_at && t.user_seen_at > now - 15e3,
    visitorSeenAt: t.user_seen_at ? new Date(t.user_seen_at).toISOString() : null, messages: await messagesOf(env, id) };
}

export async function admin(request, env, method, rest) {
  const who = await requireAdmin(request, env);
  if (method !== 'GET') checkAdminWrite(request);
  const route = rest.join('/');
  const url = new URL(request.url);

  if (route === 'me' && method === 'GET') return json({ email: who.email });
  if (route === 'stats' && method === 'GET') {
    const d = Number.parseInt(url.searchParams.get('days') || '30', 10);
    return json(await stats(env, Math.min(120, Math.max(7, Number.isFinite(d) ? d : 30))));
  }
  if (route === 'live' && method === 'GET') {
    // the dashboard is open: it counts as « here » for the visitors when « disponible » is on
    const now = Date.now();
    const state = await getState(env);
    // written at most every 30 s (the page asks every 10 s; « available » lasts 3 min)
    if (!(Number(state.admin_seen) > now - 30e3)) { await setState(env, 'admin_seen', now); state.admin_seen = String(now); }
    if (Math.random() < 0.02) await cleanupTickets(env).catch(() => {});
    // answers the visitor did not see live go by e-mail now
    await catchUpReplies(env, now).catch((e) => console.error('[stalak] catch-up', e && e.message));
    return json({ visitors: await liveVisitors(env, now), availableSwitch: state.available === '1', available: isAvailable(state, now),
      tickets: await ticketCounts(env) });
  }
  if (route === 'available' && method === 'POST') {
    const body = await readJson(request);
    await setState(env, 'available', body.available === true ? '1' : '0');
    await setState(env, 'admin_seen', Date.now());
    return json({ availableSwitch: body.available === true });
  }
  if (rest[0] === 'tickets') {
    if (rest.length === 1 && method === 'GET') return json({ tickets: await ticketList(env, url.searchParams.get('status')) });
    const id = rest[1];
    if (!TICKET.test(id || '')) throw new HttpError(404, 'not_found', 'Ticket not found.');
    if (rest.length === 2 && method === 'GET') return json(await ticketDetail(env, id));
    if (rest.length === 2 && method === 'DELETE') {
      await env.DB.batch([
        env.DB.prepare('DELETE FROM ticket_messages WHERE ticket_id = ?1').bind(id),
        env.DB.prepare('DELETE FROM tickets WHERE id = ?1').bind(id),
      ]);
      return json({ ok: true });
    }
    const t = await env.DB.prepare('SELECT * FROM tickets WHERE id = ?1').bind(id).first();
    if (!t) throw new HttpError(404, 'not_found', 'Ticket not found.');
    if (rest[2] === 'messages' && rest.length === 3 && method === 'POST') {
      const body = await readJson(request, 16 * 1024);
      const text = String(typeof body.text === 'string' ? body.text : '').replace(/\r\n?/g, '\n').trim().slice(0, MESSAGE_MAX);
      if (!text) throw new HttpError(400, 'invalid_message', 'text: 1-2000 characters.');
      const mode = ['auto', 'yes', 'no'].includes(body.email) ? body.email : 'auto';
      const now = Date.now();
      const row = await env.DB.prepare("INSERT INTO ticket_messages (ticket_id, sender, body, created_at) VALUES (?1, 'admin', ?2, ?3) RETURNING id")
        .bind(id, text, now).first();
      await env.DB.prepare('UPDATE tickets SET updated_at = ?2, admin_read_at = ?2 WHERE id = ?1').bind(id, now).run();
      const emailed = await deliverReply(env, t, row.id, text, mode);
      return json({ id: row.id, emailed, messages: await messagesOf(env, id) });
    }
    if (rest[2] === 'status' && rest.length === 3 && method === 'POST') {
      const body = await readJson(request);
      const status = body.status === 'closed' ? 'closed' : 'open';
      await env.DB.prepare('UPDATE tickets SET status = ?2 WHERE id = ?1').bind(id, status).run();
      return json({ status });
    }
  }
  throw new HttpError(404, 'not_found', 'Unknown API route.');
}

