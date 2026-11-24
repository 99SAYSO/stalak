// Microsoft Clarity in the dashboard (Comptes, 24/11, docs/handoff/chef-dashboard-clarity-ga4.md).
// Clarity's Data Export API (learn.microsoft.com/en-us/clarity/setup-and-installation/clarity-data-export-api, read 24/11):
//   GET https://www.clarity.ms/export-data/api/v1/project-live-insights?numOfDays=1|2|3&dimension1=…&dimension2=…&dimension3=…
//   Authorization: Bearer <token> (Clarity → Settings → Data Export → Generate new API token).
//   Limits: 10 requests per project per day, 1 to 3 days back only, 3 dimensions at most, 1,000 rows, no pagination.
//   Errors: 401 / 403 (token), 400 (request), 429 (daily limit reached).
// So: ONE snapshot per UTC day, stored in D1 (migration 0022), 3 calls (by device; by page and device; by channel), 24 h each.
// The dashboard only reads the table. A 429 stops the calls for the rest of the day and the last snapshot stays shown.
// Run with the daily tasks (cloud.js maybeCleanup, the Worker workers/cloud-cleanup, POST /api/cron/cloud-cleanup), and by the
// owner's button « Relever maintenant » (only what today's snapshot lacks, within the same daily budget).
// Privacy: only anonymous totals. Page addresses are kept without « ?… » and « #… » (a sign-in link could carry a code), any
// text with an « @ » is masked, no IP, no visitor id. The recordings stay in Clarity: the dashboard only links to them.

export const CLARITY_API = 'https://www.clarity.ms/export-data/api/v1/project-live-insights';
export const CLARITY_DAILY_MAX = 10;   // Clarity's limit per project per day
const OUR_BUDGET = 8;                  // we never use more than 8 (2 left for the owner's own tries in Clarity's tools)
const KEEP_DAYS = 400;
export const CLARITY_KINDS = [
  { kind: 'device', dims: ['Device'] },
  { kind: 'url_device', dims: ['URL', 'Device'] },
  { kind: 'channel', dims: ['Channel'] },
];
const ROWS_MAX = 400;                  // rows kept per metric (the page shows the top 30)

export const clarityOn = (env) => !!(env.CLARITY_API_TOKEN && String(env.CLARITY_API_TOKEN).length > 10);
const utcDay = (t) => new Date(t).toISOString().slice(0, 10);

// the friction signals, by their (normalised) metric name in Clarity's answer
export const SIGNALS = {
  rageclickcount: 'rage', deadclickcount: 'dead', quickbackclick: 'quickback',
  scripterrorcount: 'jsError', errorclickcount: 'errorClick', excessivescroll: 'scroll',
};
const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const num = (v) => { const n = typeof v === 'number' ? v : Number.parseFloat(String(v == null ? '' : v).replace(',', '.')); return Number.isFinite(n) ? n : null; };

// ---- cleaning what Clarity sends, before it is stored -----------------------------------------------------------------
export function cleanText(s) {
  s = String(s);
  if (s.includes('@')) return '[masqué]';
  if (/^(https?:)?\/\//i.test(s) || s.startsWith('/')) s = s.replace(/[?#].*$/s, '');
  return s.slice(0, 300);
}
export function cleanAnswer(data) {
  if (!Array.isArray(data)) return null;
  return data.slice(0, 40).filter((m) => m && typeof m === 'object').map((m) => ({
    metricName: String(m.metricName || '').slice(0, 60),
    information: (Array.isArray(m.information) ? m.information : []).slice(0, ROWS_MAX).map((row) => {
      const o = {};
      if (row && typeof row === 'object') for (const [k, v] of Object.entries(row).slice(0, 20)) {
        const key = String(k).slice(0, 60);
        o[key] = typeof v === 'number' ? v : typeof v === 'string' ? cleanText(v) : null;
      }
      return o;
    }),
  }));
}

// ---- the daily snapshot -------------------------------------------------------------------------------------------------
async function callsToday(env, day) {
  return (await env.DB.prepare('SELECT n, quota, last_error, last_at FROM clarity_calls WHERE day = ?1').bind(day).first()) || { n: 0, quota: 0, last_error: null, last_at: null };
}
async function noteCall(env, day, now, { quota = false, error = null } = {}) {
  await env.DB.prepare(`INSERT INTO clarity_calls (day, n, quota, last_error, last_at) VALUES (?1, 1, ?2, ?3, ?4)
    ON CONFLICT(day) DO UPDATE SET n = n + 1, quota = MAX(quota, ?2), last_error = ?3, last_at = ?4`).bind(day, quota ? 1 : 0, error, now).run();
}

export async function clarityFetch(env, dims, days = 1) {
  const q = new URLSearchParams({ numOfDays: String(days) });
  dims.forEach((d, i) => q.set('dimension' + (i + 1), d));
  let res;
  try {
    res = await fetch(CLARITY_API + '?' + q, { headers: { Authorization: 'Bearer ' + env.CLARITY_API_TOKEN, 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(20000) });
  } catch { return { error: 'network' }; }
  if (res.status === 429) return { error: 'quota' };
  if (res.status === 401 || res.status === 403) return { error: 'auth' };
  if (!res.ok) return { error: 'http_' + res.status };
  const data = cleanAnswer(await res.json().catch(() => null));
  return data ? { data } : { error: 'bad_answer' };
}

// One snapshot a day: fetches what today's lacks, stops at a 429 or a token refused, never more than OUR_BUDGET calls.
export async function clarityDaily(env, now = Date.now()) {
  if (!clarityOn(env)) return { clarity: 'off' };
  const day = utcDay(now);
  const { results } = await env.DB.prepare('SELECT kind FROM clarity_snapshots WHERE day = ?1').bind(day).all();
  const have = new Set(results.map((r) => r.kind)), todo = CLARITY_KINDS.filter((k) => !have.has(k.kind));
  const out = { clarity: 'ok', fetched: 0, day };
  if (!todo.length) return { ...out, clarity: 'done' };
  let calls = await callsToday(env, day);
  for (const k of todo) {
    if (calls.quota) return { ...out, clarity: 'quota' };
    if (calls.n >= OUR_BUDGET) return { ...out, clarity: 'budget' };
    const r = await clarityFetch(env, k.dims, 1);
    await noteCall(env, day, now, { quota: r.error === 'quota', error: r.error || null });
    calls = { ...calls, n: calls.n + 1, quota: r.error === 'quota' ? 1 : calls.quota };
    if (r.error) {
      console.warn('[stalak] clarity', k.kind, r.error);
      if (r.error === 'quota' || r.error === 'auth') return { ...out, clarity: r.error };
      continue;
    }
    await env.DB.prepare('INSERT OR REPLACE INTO clarity_snapshots (day, kind, fetched_at, data) VALUES (?1, ?2, ?3, ?4)')
      .bind(day, k.kind, now, JSON.stringify(r.data)).run();
    out.fetched++;
  }
  await env.DB.prepare('DELETE FROM clarity_snapshots WHERE day < ?1').bind(utcDay(now - KEEP_DAYS * 864e5)).run();
  await env.DB.prepare('DELETE FROM clarity_calls WHERE day < ?1').bind(utcDay(now - 30 * 864e5)).run();
  return out;
}

// ---- reading the snapshots for the page ---------------------------------------------------------------------------------
const dimOf = (row, name) => { const k = Object.keys(row).find((x) => norm(x) === norm(name)); return k ? row[k] : null; };
const pathOf = (u) => {
  const s = String(u || '');
  try { const x = new URL(s, 'https://stalak.app'); return (x.pathname || '/') ; } catch { return s.slice(0, 120) || '/'; }
};
function metrics(data) {
  const m = {};
  for (const x of Array.isArray(data) ? data : []) m[norm(x.metricName)] = Array.isArray(x.information) ? x.information : [];
  return m;
}
// a friction row: how many times (subTotal) and the share of sessions that had it (sessionsWithMetricPercentage)
function friction(row) {
  const sessions = num(row.sessionsCount);
  let pctv = num(row.sessionsWithMetricPercentage);
  let count = num(row.subTotal);
  if (count == null && sessions != null && pctv != null) count = Math.round(sessions * pctv / 100);
  return { count: count || 0, pct: pctv, sessions };
}
function trafficOf(row) {
  return { sessions: num(row.totalSessionCount) || 0, bots: num(row.totalBotSessionCount) || 0, users: num(row.distantUserCount) || 0,
    pps: num(row.PagesPerSessionPercentage ?? row.pagesPerSessionPercentage) };
}

export function recordingsLink(env) {
  const id = String(env.CLARITY_PROJECT_ID || '').replace(/[^\w-]/g, '');
  return id ? 'https://clarity.microsoft.com/projects/view/' + id + '/impressions' : null;
}

export function summarise(env, rows) {
  const by = {}; for (const r of rows) by[r.kind] = r;
  const out = { at: null, totals: null, devices: [], channels: [], signals: {}, friction: [], recordings: recordingsLink(env) };
  const dev = by.device ? metrics(JSON.parse(by.device.data)) : null;
  if (by.device) out.at = new Date(by.device.fetched_at).toISOString();
  if (dev) {
    const t = { sessions: 0, bots: 0, users: 0 }; let ppsW = 0, ppsN = 0;
    for (const row of dev.traffic || []) {
      const x = trafficOf(row); t.sessions += x.sessions; t.bots += x.bots; t.users += x.users;
      if (x.pps != null) { ppsW += x.pps * x.sessions; ppsN += x.sessions; }
      out.devices.push({ device: String(dimOf(row, 'Device') || 'Other'), sessions: x.sessions });
    }
    const avg = (rowsA, field) => { let w = 0, n = 0; for (const row of rowsA || []) { const v = num(row[field]), s = num(row.sessionsCount) || 1; if (v != null) { w += v * s; n += s; } } return n ? w / n : null; };
    let active = null, total = null;
    for (const row of dev.engagementtime || []) { const a = num(row.activeTime), tt = num(row.totalTime); if (a != null) active = (active || 0) + a; if (tt != null) total = (total || 0) + tt; }
    const rowsE = (dev.engagementtime || []).length || 1;
    out.totals = { ...t, pagesPerSession: ppsN ? ppsW / ppsN : null, scrollDepth: avg(dev.scrolldepth, 'averageScrollDepth'),
      activeTime: active != null ? active / rowsE : null, totalTime: total != null ? total / rowsE : null };
    for (const [name, sig] of Object.entries(SIGNALS)) {
      const list = dev[name]; if (!list) continue;
      let c = 0, w = 0, n = 0;
      for (const row of list) { const f = friction(row); c += f.count; if (f.pct != null) { const s = f.sessions || 1; w += f.pct * s; n += s; } }
      out.signals[sig] = { count: c, pct: n ? w / n : null };
    }
    out.devices.sort((a, b) => b.sessions - a.sessions);
  }
  if (by.channel) {
    const ch = metrics(JSON.parse(by.channel.data));
    for (const row of ch.traffic || []) out.channels.push({ channel: String(dimOf(row, 'Channel') || 'Other'), sessions: trafficOf(row).sessions });
    out.channels.sort((a, b) => b.sessions - a.sessions);
  }
  if (by.url_device) {
    const ud = metrics(JSON.parse(by.url_device.data)), merged = new Map();
    for (const [name, sig] of Object.entries(SIGNALS)) {
      for (const row of ud[name] || []) {
        const f = friction(row); if (!f.count) continue;
        const page = pathOf(dimOf(row, 'URL')), device = String(dimOf(row, 'Device') || 'Other'), key = sig + '|' + page + '|' + device;
        const cur = merged.get(key) || { signal: sig, page, device, count: 0, pct: null };
        cur.count += f.count; if (f.pct != null) cur.pct = Math.max(cur.pct || 0, f.pct);
        merged.set(key, cur);
      }
    }
    out.friction = [...merged.values()].sort((a, b) => b.count - a.count).slice(0, 30);
  }
  return out;
}

export async function clarityView(env, now = Date.now()) {
  const day = utcDay(now);
  const calls = await callsToday(env, day);
  const base = { state: clarityOn(env) ? 'ok' : 'off', projectId: env.CLARITY_PROJECT_ID || null, today: day,
    calls: { today: calls.n, max: CLARITY_DAILY_MAX, ours: OUR_BUDGET }, quotaToday: !!calls.quota, lastError: calls.last_error || null,
    recordings: recordingsLink(env) };
  // the newest snapshot of each kind (a day with an error keeps the one before)
  const { results } = await env.DB.prepare(
    `SELECT s.kind, s.day, s.fetched_at, s.data FROM clarity_snapshots s
     JOIN (SELECT kind, MAX(day) AS d FROM clarity_snapshots GROUP BY kind) m ON m.kind = s.kind AND m.d = s.day`).all();
  const { results: hist } = await env.DB.prepare(
    "SELECT day, fetched_at, data FROM clarity_snapshots WHERE kind = 'device' AND day >= ?1 ORDER BY day").bind(utcDay(now - 13 * 864e5)).all();
  const history = hist.map((h) => {
    const m = metrics(JSON.parse(h.data));
    return { day: h.day, sessions: (m.traffic || []).reduce((s, r) => s + trafficOf(r).sessions, 0) };
  });
  if (!results.length) return { ...base, snapshot: null, history, stale: false };
  const snap = summarise(env, results);
  const newest = Math.max(...results.map((r) => r.fetched_at));
  return { ...base, snapshot: snap, history, stale: newest < now - 36 * 3600e3, snapshotDay: utcDay(newest) };
}
