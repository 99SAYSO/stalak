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
import { notifyOwner, ntfyOn } from './notify.js';
import { sendThanks, thanksEmail } from './thanks.js';
import { tgStatus, linkTelegram, unlinkTelegram } from './telegram.js';
import { limit } from './ratelimit.js';

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
  for (const d of list) series[d] = { day: d, signups: 0, visits: 0, newPro: 0, payments: 0, revenue: 0, revenueUsd: 0, refunds: 0,
    exportOk: 0, exportFail: 0, adOk: 0, paid: 0, errors: 0, codeMails: 0,
    lyricsJobs: 0, lyricsMinutes: 0, lyricsUsers: 0, cloudSaves: 0, helpQuestions: 0, helpFailed: 0, tickets: 0, ticketMessages: 0 };
  const at = (d) => series[d];
  for (const r of R(signups)) if (at(r.d)) at(r.d).signups = r.n;
  for (const r of R(visitDays)) if (at(r.d)) at(r.d).visits = r.n;
  // revenue per day in euros (other currencies are listed in the totals, not in the chart)
  for (const r of R(payDays)) if (at(r.d)) { at(r.d).payments += r.n; at(r.d).newPro += r.first || 0; if (r.currency === 'EUR') at(r.d).revenue += r.total || 0; if (r.currency === 'USD') at(r.d).revenueUsd += r.total || 0; }
  for (const r of R(refDays)) if (at(r.d) && r.currency === 'EUR') at(r.d).refunds += r.total || 0;
  for (const r of R(lyrDays)) if (at(r.d)) { at(r.d).lyricsJobs = r.jobs || 0; at(r.d).lyricsMinutes = Math.round((r.seconds || 0) / 6) / 10; at(r.d).lyricsUsers = r.users || 0; }
  const KEY = { help_q: 'helpQuestions', help_fail: 'helpFailed', cloud_save: 'cloudSaves', ticket: 'tickets', ticket_msg: 'ticketMessages' };
  for (const r of R(counts)) if (at(r.d) && KEY[r.name] && r.name !== 'ticket') at(r.d)[KEY[r.name]] = r.n;
  const DAY_EV = { ev_export_ok: 'exportOk', ev_export_fail: 'exportFail', ev_ad_ok: 'adOk', paid_first: 'paid', err_5xx: 'errors', code_mail: 'codeMails' };
  for (const r of R(counts)) if (at(r.d) && DAY_EV[r.name]) at(r.d)[DAY_EV[r.name]] = r.n;
  // the funnel (audit of 30/10): visit → export → ad → plans page → payment window → first payment, over the last 30 days;
  // plus the server errors and the code e-mails (anonymous counters, metrics.js)
  const inRange = new Set(list), ev = {};
  for (const r of R(counts)) if (inRange.has(r.d)) ev[r.name] = (ev[r.name] || 0) + (r.n || 0);
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
    ...(await insights(env, list, fromMs, now)),
    recentUsers: R(recent).map((r) => ({ email: r.email, name: r.display_name || null, createdAt: new Date(r.created_at).toISOString(),
      verified: !!r.email_verified_at, pro: proUsers.has(r.id), plan: proUsers.get(r.id) || null })),
  };
}

// ---- the new dashboard (1/11): who, from where, what they do, what it brings, how the server is (one batch of queries) ----
const DEVICES = ['ios', 'android', 'desktop'];
const tally = (rows, key = 'k') => { const o = {}; for (const r of rows) o[r[key] == null ? 'unknown' : r[key]] = (o[r[key] == null ? 'unknown' : r[key]] || 0) + (r.n || 0); return o; };
export async function insights(env, list, fromMs, now = Date.now()) {
  const from = list[0], pe = payEnv(env), q = (sql, ...b) => env.DB.prepare(sql).bind(...b);
  // how an account was made: the column (from 1/11), else Google / Apple / Microsoft when its identity came with it, else e-mail
  const method = `COALESCE(u.signup_method, (SELECT i.provider FROM identities i WHERE i.user_id = u.id AND i.created_at <= u.created_at + 120000 ORDER BY i.created_at LIMIT 1), 'email')`;
  const [uMethod, uLang, uDevice, uCountry, uCountryAll, vCountry, vSource, vDevice, vLang, vBack, back, subsEnd, canceled, firstPay, refunds, storage, sCountry] = await env.DB.batch([
    q(`SELECT ${method} AS k, COUNT(*) AS n FROM users u WHERE u.created_at >= ?1 GROUP BY k`, fromMs),
    q('SELECT lang AS k, COUNT(*) AS n FROM users WHERE created_at >= ?1 GROUP BY lang', fromMs),
    q('SELECT device AS k, COUNT(*) AS n FROM users WHERE created_at >= ?1 GROUP BY device', fromMs),
    q('SELECT country AS k, COUNT(*) AS n FROM users WHERE created_at >= ?1 GROUP BY country', fromMs),
    q('SELECT country AS k, COUNT(*) AS n FROM users GROUP BY country'),
    q('SELECT country AS k, COUNT(*) AS n FROM visits WHERE day >= ?1 GROUP BY country', from),
    q('SELECT source AS k, COUNT(*) AS n FROM visits WHERE day >= ?1 GROUP BY source', from),
    q('SELECT device AS k, COUNT(*) AS n FROM visits WHERE day >= ?1 GROUP BY device', from),
    q('SELECT lang AS k, COUNT(*) AS n FROM visits WHERE day >= ?1 GROUP BY lang', from),
    q('SELECT came_back AS k, COUNT(*) AS n FROM visits WHERE day >= ?1 GROUP BY came_back', from),
    // accounts that came back: a session opened in the period on a later day than the sign-up day
    q(`SELECT COUNT(DISTINCT s.user_id) AS n FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.created_at >= ?1 AND date(s.created_at / 1000, 'unixepoch') > date(u.created_at / 1000, 'unixepoch')`, fromMs),
    q("SELECT COUNT(*) AS n FROM subscriptions WHERE env = ?1 AND cancel_at IS NOT NULL AND status IN ('active','trialing','past_due')", pe),
    q("SELECT COUNT(*) AS n FROM subscriptions WHERE env = ?1 AND status = 'canceled' AND updated_at >= ?2", pe, fromMs),
    q("SELECT currency, COUNT(*) AS n, SUM(total) AS total FROM payments WHERE env = ?1 AND billed_at >= ?2 AND origin <> 'subscription_recurring' GROUP BY currency", pe, fromMs),
    q("SELECT currency, COUNT(*) AS n, SUM(total) AS total FROM refunds WHERE env = ?1 AND created_at >= ?2 AND status = 'approved' AND action IN ('refund','chargeback') GROUP BY currency", pe, fromMs),
    q('SELECT COALESCE(SUM(media_bytes), 0) + COALESCE(SUM(size), 0) AS bytes FROM projects'),
    q(`SELECT u.country AS k, COUNT(DISTINCT s.user_id) AS n FROM subscriptions s JOIN users u ON u.id = s.user_id
       WHERE s.env = ?1 AND s.status IN ('active','trialing','past_due') GROUP BY u.country`, pe),
  ]);
  const R = (r) => r.results || [];
  const dev = (rows) => { const t = tally(rows), o = { ios: 0, android: 0, desktop: 0, unknown: 0 }; for (const k in t) o[DEVICES.includes(k) ? k : 'unknown'] += t[k]; return o; };
  const one = (r) => (R(r)[0] || {}).n || 0;
  const cur = (rows) => { const o = {}; for (const r of R(rows)) o[r.currency || '?'] = { n: r.n || 0, total: r.total || 0 }; return o; };
  const todayStr = today(now);
  const counts = (await q('SELECT name, n FROM daily_counts WHERE day = ?1', todayStr).all()).results || [];
  const t = Object.fromEntries(counts.map((r) => [r.name, r.n]));
  const lyr = await q('SELECT COALESCE(SUM(seconds), 0) AS s, COALESCE(SUM(jobs), 0) AS j FROM lyrics_usage WHERE day = ?1', todayStr).first();
  const num = (v, d) => { const n = Number.parseInt(v, 10); return Number.isFinite(n) && n > 0 ? n : d; };
  return {
    range: { days: list.length, from, to: list[list.length - 1], visitsKeptDays: 90 },
    test: pe !== 'production',
    people: {
      byMethod: tally(R(uMethod)), byLang: tally(R(uLang)), byDevice: dev(R(uDevice)),
      byCountry: tally(R(uCountry)), byCountryAll: tally(R(uCountryAll)), returningAccounts: one(back), subsByCountry: tally(R(sCountry)),
    },
    audience: {
      byCountry: tally(R(vCountry)), bySource: tally(R(vSource)), byDevice: dev(R(vDevice)), byLang: tally(R(vLang)),
      returning: (() => { const b = tally(R(vBack)); return { yes: b['1'] || 0, no: b['0'] || 0, unknown: b.unknown || 0 }; })(),
    },
    money: { newSubscribers: cur(firstPay), refunds: cur(refunds), canceled: one(canceled), ending: one(subsEnd) },
    limits: {
      codeMails: { today: t.code_mail || 0, max: num(env.EMAIL_DAILY_MAX, 1000) },
      help: { today: t.help_q || 0, max: num(env.HELP_DAILY_MAX, 60) },
      lyrics: { todayJobs: (lyr && lyr.j) || 0, todayMinutes: Math.round(((lyr && lyr.s) || 0) / 60), freeMinutes: 210 },
      storage: { bytes: (R(storage)[0] || {}).bytes || 0, perAccount: 100 * 1024 ** 3 },
      errorsToday: t.err_5xx || 0,
      ntfy: ntfyOn(env),
      telegram: await tgStatus(env),
    },
  };
}

// ---- dashboard v3 (5/11): the « Accueil » page, the list of new accounts, subscribers per country (globe) ----
// Net money: Paddle's own figure (earnings, after its fees and taxes) when it gave it, else an estimate: (paid − tax) × 95 % − 0.50 $.
const NET = `COALESCE(earnings, CAST(ROUND((total - tax) * 0.95) AS INTEGER) - 50)`;
export const PAYOUT_MIN_CENTS = 10000;   // Paddle pays on the 15th the balance of the 1st, from 100 $ (else it waits)
const ymOf = (ms) => new Date(ms).toISOString().slice(0, 7);
export function nextPayout(months, now = Date.now()) {
  // months: [{ym, net}] in order; the balance of each month end is paid when it reaches 100 $, else carried over
  const cur = ymOf(now); let bal = 0;
  for (const m of months) { if (m.ym >= cur) continue; bal += m.net; if (bal >= PAYOUT_MIN_CENTS) bal = 0; }
  const thisMonth = (months.find((m) => m.ym === cur) || {}).net || 0;
  const amount = bal + thisMonth, d = new Date(now);
  const date = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 15)).toISOString().slice(0, 10);
  return { amount, date, enough: amount >= PAYOUT_MIN_CENTS, min: PAYOUT_MIN_CENTS };
}
export async function home(env, now = Date.now()) {
  const q = (sql, ...b) => env.DB.prepare(sql).bind(...b), pe = payEnv(env);
  const day = (ms) => new Date(ms).toISOString().slice(0, 10);
  const t0 = Date.parse(day(now) + 'T00:00:00Z'), today = day(now), yday = day(now - 864e5);
  const d = new Date(now), monthStart = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1);
  const prevStart = Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - 1, 1), prevSame = prevStart + (now - monthStart);
  const w0 = now - 7 * 864e5, w1 = now - 14 * 864e5;
  const [months, prevPart, subs, firsts, visits, signups, srcNow, srcPrev, tix, counts] = await env.DB.batch([
    q(`SELECT strftime('%Y-%m', billed_at / 1000, 'unixepoch') AS ym, SUM(${NET}) AS net FROM payments WHERE env = ?1 AND currency = 'USD' GROUP BY ym ORDER BY ym`, pe),
    q(`SELECT SUM(${NET}) AS net FROM payments WHERE env = ?1 AND currency = 'USD' AND billed_at >= ?2 AND billed_at < ?3`, pe, prevStart, prevSame),
    q("SELECT id, user_id, status, price_id, plan, current_period_end, cancel_at, keep_plan, keep_until FROM subscriptions WHERE env = ?1", pe),
    q(`SELECT SUM(billed_at >= ?2) AS today, SUM(billed_at >= ?3 AND billed_at < ?2) AS yday, SUM(billed_at >= ?4) AS week,
         SUM(billed_at >= ?5 AND billed_at < ?4) AS prevweek FROM payments WHERE env = ?1 AND origin <> 'subscription_recurring' AND billed_at >= ?5`,
      pe, t0, t0 - 864e5, w0, w1),
    q('SELECT day, COUNT(*) AS n FROM visits WHERE day IN (?1, ?2) GROUP BY day', today, yday),
    q('SELECT SUM(created_at >= ?1) AS today, SUM(created_at >= ?2 AND created_at < ?1) AS yday FROM users WHERE created_at >= ?2', t0, t0 - 864e5),
    q('SELECT source AS k, COUNT(*) AS n FROM visits WHERE day > ?1 GROUP BY source', day(w0)),
    q('SELECT source AS k, COUNT(*) AS n FROM visits WHERE day > ?1 AND day <= ?2 GROUP BY source', day(w1), day(w0)),
    q(`SELECT SUM(status = 'open' AND (admin_read_at IS NULL OR admin_read_at < updated_at)
         AND (SELECT sender FROM ticket_messages m WHERE m.ticket_id = tickets.id ORDER BY m.id DESC LIMIT 1) = 'user') AS unread FROM tickets`),
    q('SELECT name, n FROM daily_counts WHERE day = ?1', today),
  ]);
  const R = (r) => r.results || [];
  const active = R(subs).filter((s) => subscriptionGivesPro(s, now));
  const byPlan = { pro: 0, creator: 0 };
  for (const s of active) byPlan[planOfSub(env, s, now) === 'creator' ? 'creator' : 'pro']++;
  const f = R(firsts)[0] || {}, v = Object.fromEntries(R(visits).map((r) => [r.day, r.n])), s = R(signups)[0] || {};
  const tally = (rows) => { const o = {}; for (const r of rows) o[r.k || 'direct'] = (o[r.k || 'direct'] || 0) + r.n; return o; };
  const now7 = tally(R(srcNow)), prev7 = tally(R(srcPrev));
  const sources = Object.keys(now7).sort((a, b) => now7[b] - now7[a]).slice(0, 4).map((k) => ({ source: k, week: now7[k], prevWeek: prev7[k] || 0 }));
  const t = Object.fromEntries(R(counts).map((r) => [r.name, r.n]));
  const monthsArr = R(months).map((r) => ({ ym: r.ym, net: r.net || 0 }));
  // alerts: what needs the owner; none → « Tout va bien ✅ »
  const alerts = [];
  const unread = (R(tix)[0] || {}).unread || 0;
  if (unread) alerts.push({ kind: 'messages', n: unread, tab: 'msgs' });
  if (t.err_5xx) alerts.push({ kind: 'errors', n: t.err_5xx, tab: 'health' });
  const mailMax = Number.parseInt(env.EMAIL_DAILY_MAX, 10) > 0 ? Number.parseInt(env.EMAIL_DAILY_MAX, 10) : 1000;
  if ((t.code_mail || 0) >= mailMax * 0.8) alerts.push({ kind: 'mails', n: t.code_mail, max: mailMax, tab: 'health' });
  const tg = await tgStatus(env);
  if (tg.state !== 'linked') alerts.push({ kind: 'telegram', state: tg.state, tab: 'health' });
  return {
    test: pe !== 'production',
    money: { month: (monthsArr.find((m) => m.ym === ymOf(now)) || {}).net || 0, prevMonthSameDays: (R(prevPart)[0] || {}).net || 0,
      payout: nextPayout(monthsArr, now), currency: 'USD' },
    subscribers: { total: active.length, ...byPlan, newToday: f.today || 0, newYesterday: f.yday || 0, newWeek: f.week || 0, newPrevWeek: f.prevweek || 0 },
    visitors: { today: v[today] || 0, yesterday: v[yday] || 0 },
    signups: { today: s.today || 0, yesterday: s.yday || 0 },
    sources, alerts,
  };
}
// the list of new accounts: date, country, where it came from, plan now (newest first; « before » pages back)
// « Heure par heure » (5/11): for each hour of the day (0 h–1 h … 23 h–0 h) in Paris or New York time, the visits, the accounts
// made, the videos exported and the new subscriptions. period 'today' (since midnight there) or 7 / 30 days (the AVERAGE per
// hour over those days, to see the habit). Counted per UTC hour in the database, then put in the local hour of the chosen city
// (summer / winter time included: both cities are whole hours away from UTC). Exports: only since migration 0013 (exportsSince).
export const HOUR_TZ = { paris: 'Europe/Paris', ny: 'America/New_York' };
export async function hourly(env, period, tz, now = Date.now()) {
  const zone = HOUR_TZ[tz] ? tz : 'paris', days = period === '7' ? 7 : period === '30' ? 30 : 1;
  const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: HOUR_TZ[zone], hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
  const parts = (ms) => { const o = {}; for (const p of fmt.formatToParts(new Date(ms))) o[p.type] = Number(p.value); return o; };
  const p = parts(now), nowHour = p.hour % 24;
  // today: since midnight in that city; 7 / 30 days: the last 7 / 30 × 24 hours, from the start of an hour
  const sinceMidnight = ((p.hour % 24) * 3600 + p.minute * 60 + p.second) * 1000 + (now % 1000);
  const from = days === 1 ? now - sinceMidnight : Math.floor(now / 3600e3) * 3600e3 + 3600e3 - days * 864e5;
  const fromH = Math.floor(from / 3600e3), pe = payEnv(env), q = (sql, ...b) => env.DB.prepare(sql).bind(...b);
  const fromDay = new Date(from - 864e5).toISOString().slice(0, 10);
  const [vis, acc, exp, sub, first] = await env.DB.batch([
    q('SELECT first_at / 3600000 AS h, COUNT(*) AS n FROM visits WHERE day >= ?1 AND first_at >= ?2 AND first_at <= ?3 GROUP BY h', fromDay, from, now),
    q('SELECT created_at / 3600000 AS h, COUNT(*) AS n FROM users WHERE created_at >= ?1 AND created_at <= ?2 GROUP BY h', from, now),
    q("SELECT hour AS h, n FROM hourly_counts WHERE name = 'export_ok' AND hour >= ?1 AND hour <= ?2", fromH, Math.floor(now / 3600e3)),
    q('SELECT started_at / 3600000 AS h, COUNT(*) AS n FROM subscriptions WHERE env = ?1 AND started_at >= ?2 AND started_at <= ?3 GROUP BY h', pe, from, now),
    q("SELECT MIN(hour) AS h FROM hourly_counts WHERE name = 'export_ok'"),
  ]);
  const hours = Array.from({ length: 24 }, () => ({ visits: 0, signups: 0, exports: 0, subs: 0 }));
  const local = new Map();
  const at = (h) => { if (!local.has(h)) local.set(h, parts(h * 3600e3 + 1).hour % 24); return local.get(h); };
  for (const [rows, key] of [[vis, 'visits'], [acc, 'signups'], [exp, 'exports'], [sub, 'subs']]) {
    for (const r of rows.results || []) hours[at(Math.floor(r.h))][key] += r.n;
  }
  if (days > 1) for (const h of hours) for (const k of Object.keys(h)) h[k] = Math.round((h[k] / days) * 10) / 10;
  let best = null;
  hours.forEach((h, i) => { if (h.visits > 0 && (best === null || h.visits > hours[best].visits)) best = i; });
  const f = first.results && first.results[0] && first.results[0].h;
  return { period: days === 1 ? 'today' : String(days), tz: zone, average: days > 1, nowHour, best, hours,
    exportsSince: f ? f * 3600e3 : null, test: pe !== 'production' };
}

export async function signupList(env, before, limitN = 50, now = Date.now()) {
  const n = Math.min(100, Math.max(1, limitN | 0)), pe = payEnv(env);
  const { results } = await env.DB.prepare(
    `SELECT u.id, u.email, u.display_name, u.created_at, u.country, u.signup_source, u.signup_method,
       (SELECT i.provider FROM identities i WHERE i.user_id = u.id AND i.created_at <= u.created_at + 120000 LIMIT 1) AS idp
     FROM users u WHERE u.created_at < ?1 ORDER BY u.created_at DESC LIMIT ?2`
  ).bind(Number.isFinite(before) && before > 0 ? before : now + 1, n + 1).all();
  const rows = results.slice(0, n);
  const plans = {};
  if (rows.length) {
    const ids = rows.map((r) => r.id);
    const subs = (await env.DB.prepare(`SELECT user_id, status, price_id, plan, current_period_end, cancel_at, keep_plan, keep_until FROM subscriptions
      WHERE env = ?1 AND user_id IN (${ids.map((_, i) => '?' + (i + 2)).join(',')})`).bind(pe, ...ids).all()).results;
    for (const s of subs) if (subscriptionGivesPro(s, now)) { const p = planOfSub(env, s, now); if (p === 'creator' || !plans[s.user_id]) plans[s.user_id] = p; }
  }
  return {
    // the e-mail and the pseudo (owner's request of 5/11: this page only; never on the Accueil, in Telegram or in the demo)
    signups: rows.map((r) => ({ at: new Date(r.created_at).toISOString(), email: r.email || null, name: r.display_name || null, country: r.country || null, source: r.signup_source || null,
      method: r.signup_method || r.idp || 'email', plan: plans[r.id] || 'free' })),
    more: results.length > n ? rows[rows.length - 1].created_at : null,
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
    // 7, 30, 90 days, or « all »: since the first account (at most 2 years of days)
    const raw = url.searchParams.get('days') || '30';
    let d = Number.parseInt(raw, 10);
    if (raw === 'all') {
      const first = await env.DB.prepare('SELECT MIN(created_at) AS t FROM users').first();
      d = first && first.t ? Math.ceil((Date.now() - first.t) / 864e5) + 1 : 30;
    }
    return json(await stats(env, Math.min(730, Math.max(7, Number.isFinite(d) ? d : 30))));
  }
  if (route === 'home' && method === 'GET') return json(await home(env));
  if (route === 'hours' && method === 'GET') return json(await hourly(env, url.searchParams.get('period') || 'today', url.searchParams.get('tz') || 'paris'));
  if (route === 'signups' && method === 'GET') {
    const b = Number.parseInt(url.searchParams.get('before') || '', 10);
    return json(await signupList(env, b, Number.parseInt(url.searchParams.get('limit') || '50', 10)));
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
  // « Envoyer une notif de test »: checks that the owner's phone rings (Telegram, and ntfy when NTFY_TOPIC is set); the Paddle
  // webhook cannot be tried on a preview. 'ntfy-test' = the name of the first version.
  if ((route === 'notify-test' || route === 'ntfy-test') && method === 'POST') {
    await readJson(request);
    // no limit (owner's request of 5/11): the route is only reachable by the owner (Cloudflare Access + server check)
    const tg = await tgStatus(env), nt = ntfyOn(env);
    if (tg.state !== 'linked' && !nt) return json({ configured: false, sent: false, telegram: tg.state, ntfy: false });
    const r = await notifyOwner(env, { title: '🔔 Notif de test Stalak', message: 'Ça marche ! Tu seras prévenu ici à chaque nouvel abonné (et, plus discrètement, à chaque annulation).', tags: ['bell'] });
    return json({ configured: true, sent: r.telegram || r.ntfy, telegram: tg.state === 'linked' ? (r.telegram ? 'sent' : 'failed') : tg.state, ntfy: nt ? (r.ntfy ? 'sent' : 'failed') : false });
  }
  // « M’envoyer l’e-mail de remerciement » (5/11): the thank-you e-mail of a new customer, to the owner (his Access address),
  // once in French (Creator Plus for a year) and once in English (Stalak Pro by month), sent now; the webhook cannot be
  // tried on a preview. Owner only (Cloudflare Access + server check); no limit, like the test notification (owner's choice).
  if (route === 'thanks-test' && method === 'POST') {
    await readJson(request);
    if (!who.email) throw new HttpError(400, 'no_email', 'No e-mail address for the owner.');
    const r = await Promise.all([
      sendThanks(env, who.email, thanksEmail('fr', 'creator', 'year')),
      sendThanks(env, who.email, thanksEmail('en', 'pro', 'month')),
    ]);
    return json({ to: who.email, fr: r[0], en: r[1] });
  }
  // « Relier mon Telegram »: the private chat that just sent /start to the bot becomes the owner's chat
  if (route === 'telegram-link' && method === 'POST') {
    await readJson(request);
    await limit(env, 'telegram-link', 20, 3600e3, 'Too many tries, try again in an hour.');
    return json(await linkTelegram(env));
  }
  if (route === 'telegram-unlink' && method === 'POST') {
    await readJson(request);
    return json(await unlinkTelegram(env));
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

