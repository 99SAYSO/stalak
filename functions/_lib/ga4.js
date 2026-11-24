// Google Analytics 4 in the dashboard (Comptes, 24/11, docs/handoff/chef-dashboard-clarity-ga4.md).
// Google Analytics Data API v1beta (developers.google.com/analytics/devguides/reporting/data/v1, read 24/11):
//   POST https://analyticsdata.googleapis.com/v1beta/properties/<GA4_PROPERTY_ID>:runReport | :batchRunReports | :runRealtimeReport
//   Access: a service account (JSON key = the secret GA4_SA_KEY, typed by the owner in Cloudflare), added as « Lecteur » of the
//   property. A JWT signed RS256 with WebCrypto (no library) is exchanged at oauth2.googleapis.com/token for an access token
//   (1 hour; kept ~50 min in this Worker's memory). Scope: analytics.readonly.
//   Quotas of a standard property: 200,000 tokens a day, 40,000 an hour, 14,000 per project an hour, 10 requests at the same
//   time, 10 server errors per project an hour; realtime has the same numbers on its own. A report costs about 10 tokens or
//   less: the page asks for 2 to 4 reports a load, kept 10 min (realtime: 1 min) in memory, far below.
// Only totals (no user id, no IP, no e-mail are ever asked). Only the visitors who accepted the cookies are in GA4.

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SCOPE = 'https://www.googleapis.com/auth/analytics.readonly';
const API = 'https://analyticsdata.googleapis.com/v1beta/properties/';
export const FUNNEL_FIXED = ['accueil_vue', 'export_lance', 'export_ok', 'paywall_vu', 'checkout_ouvert', 'achat'];
const STEP_RE = /^onboarding_etape_(\d{1,2})$/;

export function ga4Config(env) {
  const property = String(env.GA4_PROPERTY_ID || '').trim();
  if (!env.GA4_SA_KEY) return { state: 'off', missing: 'GA4_SA_KEY' };
  if (!/^\d{4,15}$/.test(property)) return { state: 'off', missing: 'GA4_PROPERTY_ID' };
  let key;
  try { key = typeof env.GA4_SA_KEY === 'string' ? JSON.parse(env.GA4_SA_KEY) : env.GA4_SA_KEY; } catch { return { state: 'bad_key' }; }
  if (!key || typeof key.client_email !== 'string' || typeof key.private_key !== 'string' || !/BEGIN PRIVATE KEY/.test(key.private_key)) return { state: 'bad_key' };
  return { state: 'ok', property, email: key.client_email, pem: key.private_key };
}

// ---- the access token ---------------------------------------------------------------------------------------------------
const b64url = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const b64urlText = (s) => b64url(new TextEncoder().encode(s));
function pemToDer(pem) {
  const b = atob(pem.replace(/-----[^-]+-----/g, '').replace(/\\n/g, '').replace(/\s+/g, ''));
  const out = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) out[i] = b.charCodeAt(i);
  return out.buffer;
}
export async function signedAssertion(cfg, now = Date.now()) {
  const iat = Math.floor(now / 1000);
  const head = b64urlText(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = b64urlText(JSON.stringify({ iss: cfg.email, scope: SCOPE, aud: TOKEN_URL, iat, exp: iat + 3600 }));
  const key = await crypto.subtle.importKey('pkcs8', pemToDer(cfg.pem), { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(head + '.' + claims));
  return head + '.' + claims + '.' + b64url(sig);
}
const TOKENS = new Map();     // client_email → { token, until }
const CACHE = new Map();      // report key → { until, value }
export function ga4ResetCache() { TOKENS.clear(); CACHE.clear(); }

class GaError extends Error { constructor(code) { super(code); this.code = code; } }
async function accessToken(cfg, now = Date.now()) {
  const t = TOKENS.get(cfg.email);
  if (t && t.until > now) return t.token;
  let assertion;
  try { assertion = await signedAssertion(cfg, now); } catch { throw new GaError('bad_key'); }
  let res;
  try {
    res = await fetch(TOKEN_URL, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, signal: AbortSignal.timeout(15000),
      body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }).toString() });
  } catch { throw new GaError('network'); }
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.access_token) throw new GaError(res.status === 400 || res.status === 401 ? 'key_refused' : 'token_http_' + res.status);
  const life = Math.min(50 * 60e3, Math.max(60e3, (Number(j.expires_in) || 3600) * 1000 - 10 * 60e3));
  TOKENS.set(cfg.email, { token: j.access_token, until: now + life });
  return j.access_token;
}
async function gaPost(cfg, method, body, now) {
  const token = await accessToken(cfg, now);
  let res;
  try {
    res = await fetch(API + cfg.property + ':' + method, { method: 'POST', signal: AbortSignal.timeout(15000),
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  } catch { throw new GaError('network'); }
  if (res.status === 401) TOKENS.delete(cfg.email);
  if (res.status === 403) throw new GaError('access');      // the service account is not « Lecteur » of the property, or the API is off
  if (res.status === 429) throw new GaError('quota');
  if (res.status === 401) throw new GaError('key_refused');
  if (!res.ok) throw new GaError('http_' + res.status);
  return res.json().catch(() => { throw new GaError('bad_answer'); });
}
async function cached(key, ms, now, fn) {
  const c = CACHE.get(key);
  if (c && c.until > now) return c.value;
  const value = await fn();
  CACHE.set(key, { until: now + ms, value });
  return value;
}

// ---- reading the answers ------------------------------------------------------------------------------------------------
const n = (v) => { const x = Number(v); return Number.isFinite(x) ? x : 0; };
export function rowsOf(report) {
  const dh = (report && report.dimensionHeaders || []).map((h) => h.name), mh = (report && report.metricHeaders || []).map((h) => h.name);
  return (report && report.rows || []).map((r) => {
    const o = {};
    dh.forEach((name, i) => { o[name] = r.dimensionValues && r.dimensionValues[i] ? String(r.dimensionValues[i].value) : ''; });
    mh.forEach((name, i) => { o[name] = r.metricValues && r.metricValues[i] ? n(r.metricValues[i].value) : 0; });
    return o;
  });
}
function totalOf(report) {
  const mh = (report && report.metricHeaders || []).map((h) => h.name), t = report && report.totals && report.totals[0];
  const o = {}; mh.forEach((name, i) => { o[name] = t && t.metricValues && t.metricValues[i] ? n(t.metricValues[i].value) : 0; });
  return o;
}

// the funnel, people (totalUsers) at each step over today / 7 days / 30 days; the biggest loss between two steps is « worst »
export function funnelFrom(report) {
  const rows = rowsOf(report), counts = {}, seen = new Set();
  for (const r of rows) {
    const range = r.dateRange || 'd30';
    counts[range] = counts[range] || {};
    counts[range][r.eventName] = (counts[range][r.eventName] || 0) + r.totalUsers;
    seen.add(r.eventName);
  }
  const onboarding = [...seen].filter((e) => STEP_RE.test(e)).sort((a, b) => Number(STEP_RE.exec(a)[1]) - Number(STEP_RE.exec(b)[1]));
  const order = [FUNNEL_FIXED[0], ...onboarding, ...FUNNEL_FIXED.slice(1)];
  const out = {};
  for (const range of ['d1', 'd7', 'd30']) {
    const c = counts[range] || {};
    // the onboarding steps that nobody reached in this period are left out (App may not send them all yet)
    const steps = order.filter((name) => !STEP_RE.test(name) || c[name] > 0).map((name) => ({ name, people: c[name] || 0 }));
    let worst = null;
    steps.forEach((s, i) => {
      if (!i) return;
      const prev = steps[i - 1].people;
      s.fromPrev = prev ? Math.round(s.people / prev * 1000) / 10 : null;
      const lost = prev - s.people;
      if (prev > 0 && lost > 0 && (worst === null || s.fromPrev < steps[worst].fromPrev)) worst = i;
    });
    if (worst !== null) steps[worst].worst = true;
    out[range] = steps;
  }
  return out;
}

const RANGES = [{ startDate: 'today', endDate: 'today', name: 'd1' }, { startDate: '6daysAgo', endDate: 'today', name: 'd7' }, { startDate: '29daysAgo', endDate: 'today', name: 'd30' }];
const since = (days) => ({ startDate: days === 1 ? 'today' : (days - 1) + 'daysAgo', endDate: 'today' });

export async function ga4Report(env, days, now = Date.now()) {
  const cfg = ga4Config(env);
  if (cfg.state !== 'ok') return { state: cfg.state, missing: cfg.missing || null };
  days = [1, 7, 30].includes(days) ? days : 7;
  try {
    return await cached('report:' + days, 10 * 60e3, now, async () => {
      const funnel = await gaPost(cfg, 'runReport', {
        dateRanges: RANGES, dimensions: [{ name: 'eventName' }], metrics: [{ name: 'totalUsers' }, { name: 'eventCount' }],
        dimensionFilter: { orGroup: { expressions: [
          { filter: { fieldName: 'eventName', inListFilter: { values: FUNNEL_FIXED } } },
          { filter: { fieldName: 'eventName', stringFilter: { matchType: 'BEGINS_WITH', value: 'onboarding_etape_' } } }] } },
        limit: 100,
      }, now);
      const dr = [since(days)];
      const batch = await gaPost(cfg, 'batchRunReports', { requests: [
        { dateRanges: dr, dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }], metrics: [{ name: 'sessions' }, { name: 'totalUsers' }],
          orderBys: [{ metric: { metricName: 'sessions' }, desc: true }], limit: 15 },
        { dateRanges: dr, dimensions: [{ name: 'countryId' }], metrics: [{ name: 'activeUsers' }, { name: 'sessions' }],
          orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }], limit: 15 },
        { dateRanges: dr, dimensions: [{ name: 'deviceCategory' }], metrics: [{ name: 'activeUsers' }, { name: 'sessions' }, { name: 'userEngagementDuration' }, { name: 'screenPageViews' }],
          metricAggregations: ['TOTAL'] },
        { dateRanges: dr, dimensions: [{ name: 'language' }], metrics: [{ name: 'activeUsers' }],
          orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }], limit: 10 },
        { dateRanges: dr, dimensions: [{ name: 'pagePath' }], metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }, { name: 'userEngagementDuration' }],
          orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }], limit: 15 },
      ] }, now);
      const [src, ctry, dev, lang, pages] = (batch.reports || []);
      const t = totalOf(dev);
      return {
        state: 'ok', days, at: new Date(now).toISOString(), funnel: funnelFrom(funnel),
        sources: rowsOf(src).map((r) => ({ source: r.sessionSource, medium: r.sessionMedium, sessions: r.sessions, people: r.totalUsers })),
        countries: rowsOf(ctry).map((r) => ({ country: /^[A-Z]{2}$/.test(r.countryId) ? r.countryId : null, people: r.activeUsers, sessions: r.sessions })),
        devices: rowsOf(dev).map((r) => ({ device: r.deviceCategory, people: r.activeUsers, sessions: r.sessions })),
        languages: rowsOf(lang).map((r) => ({ language: r.language, people: r.activeUsers })),
        pages: rowsOf(pages).map((r) => ({ page: String(r.pagePath || '/').replace(/[?#].*$/s, '').slice(0, 120), views: r.screenPageViews, people: r.activeUsers,
          engagement: r.activeUsers ? Math.round(r.userEngagementDuration / r.activeUsers) : 0 })),
        totals: { people: t.activeUsers || 0, sessions: t.sessions || 0, views: t.screenPageViews || 0,
          engagementPerPerson: t.activeUsers ? Math.round(t.userEngagementDuration / t.activeUsers) : 0 },
      };
    });
  } catch (e) {
    if (e instanceof GaError) return { state: 'error', error: e.code };
    throw e;
  }
}

export async function ga4Live(env, now = Date.now()) {
  const cfg = ga4Config(env);
  if (cfg.state !== 'ok') return { state: cfg.state, missing: cfg.missing || null };
  try {
    return await cached('live', 60e3, now, async () => {
      const [c, p] = await Promise.all([
        gaPost(cfg, 'runRealtimeReport', { dimensions: [{ name: 'countryId' }], metrics: [{ name: 'activeUsers' }], metricAggregations: ['TOTAL'], limit: 20 }, now),
        gaPost(cfg, 'runRealtimeReport', { dimensions: [{ name: 'unifiedScreenName' }], metrics: [{ name: 'activeUsers' }], limit: 10 }, now),
      ]);
      const countries = rowsOf(c).map((r) => ({ country: /^[A-Z]{2}$/.test(r.countryId) ? r.countryId : null, people: r.activeUsers }));
      const total = totalOf(c).activeUsers || countries.reduce((s, r) => s + r.people, 0);
      return { state: 'ok', at: new Date(now).toISOString(), now: total, countries,
        pages: rowsOf(p).map((r) => ({ page: String(r.unifiedScreenName || '').slice(0, 120), people: r.activeUsers })) };
    });
  } catch (e) {
    if (e instanceof GaError) return { state: 'error', error: e.code };
    throw e;
  }
}
