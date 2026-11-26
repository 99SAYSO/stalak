// « Essais Pro » (Comptes, 26/11, docs/handoff/chef-suivi-essais.md): the 3 figures of the free trials, for the dashboard.
// 1. Activation J1: of the trials started, the share with at least one video WITHOUT the watermark in the 24 h after the start
//    (and with at least one video of any kind).
// 2. Conversion at the end: of the trials ended, the share paid / cancelled during the trial / payment failed; per week of
//    start; then, of the paid ones 32 days or more after the end, the share still paying (2nd payment) in the 2nd month.
// 3. Active during the trial: trials going on now and those active in the last 3 days; share that came back 2 different days
//    or more during the trial; average videos per trial.
// From: subscriptions (trial_started_at, trial_ends_at, trial_result — trial.js), payments, user_day_counts (migration 0025).
import { payEnv } from './entitlements.js';
import { today } from './metrics.js';

const DAY = 864e5;
const isoWeek = (t) => {
  const d = new Date(t); d.setUTCHours(0, 0, 0, 0); d.setUTCDate(d.getUTCDate() + 3 - ((d.getUTCDay() + 6) % 7));
  const y = d.getUTCFullYear(), w1 = new Date(Date.UTC(y, 0, 4));
  return y + '-W' + String(1 + Math.round(((d - w1) / DAY - 3 + ((w1.getUTCDay() + 6) % 7)) / 7)).padStart(2, '0');
};
const overlaps = (r, a, b) => r.last_at >= a && r.first_at <= b;
export const maskEmail = (e) => { const [u, d] = String(e || '').split('@'); return d ? (u.slice(0, 1) + '•••@' + d) : null; };

export async function trialStats(env, now = Date.now()) {
  const pe = payEnv(env), since = now - 75 * DAY;
  const subs = (await env.DB.prepare(`SELECT s.id, s.user_id, s.status, s.trial_started_at AS start, s.trial_ends_at AS end_at, s.trial_result AS result,
        u.email, u.signup_source FROM subscriptions s LEFT JOIN users u ON u.id = s.user_id
      WHERE s.env = ?1 AND s.trial_started_at IS NOT NULL AND s.trial_started_at >= ?2 AND COALESCE(s.trial_result, '') <> 'refused'
      ORDER BY s.trial_started_at DESC`).bind(pe, since).all()).results;
  // the answer to « Where did you hear about Stalak? » when that column exists (docs/handoff/chef-question-source.md)
  let heard = new Map();
  try {
    const h = await env.DB.prepare(`SELECT id, heard_from FROM users WHERE id IN (SELECT user_id FROM subscriptions WHERE env = ?1 AND trial_started_at >= ?2)`).bind(pe, since).all();
    heard = new Map(h.results.map((r) => [r.id, r.heard_from || null]));
  } catch { /* not there yet */ }
  const days = (await env.DB.prepare(`SELECT user_id, day, name, n, first_at, last_at FROM user_day_counts
      WHERE day >= ?2 AND user_id IN (SELECT user_id FROM subscriptions WHERE env = ?1 AND trial_started_at >= ?3)`)
    .bind(pe, new Date(since).toISOString().slice(0, 10), since).all()).results;
  const byUser = new Map();
  for (const r of days) { if (!byUser.has(r.user_id)) byUser.set(r.user_id, []); byUser.get(r.user_id).push(r); }
  const paidCount = new Map((await env.DB.prepare(`SELECT subscription_id AS id, COUNT(*) AS n FROM payments
      WHERE env = ?1 AND total > 0 AND subscription_id IN (SELECT id FROM subscriptions WHERE env = ?1 AND trial_started_at >= ?2) GROUP BY subscription_id`)
    .bind(pe, since).all()).results.map((r) => [r.id, r.n]));
  const last3 = today(now - 2 * DAY);

  const trials = subs.map((s) => {
    const rows = byUser.get(s.user_id) || [], end = s.end_at || s.start + 7 * DAY, upto = Math.min(end, now);
    const in24 = rows.filter((r) => overlaps(r, s.start, s.start + DAY));
    const during = rows.filter((r) => overlaps(r, s.start, upto));
    const ended = end <= now;
    return {
      id: s.id, start: s.start, end, ended,
      j1Done: now >= s.start + DAY,                                    // the 24 h are over: the J1 figure is final
      j1Nowm: in24.some((r) => r.name === 'export_nowm'), j1Any: in24.some((r) => r.name === 'export_ok'),
      activeDays: new Set(during.map((r) => r.day)).size,
      exports: during.filter((r) => r.name === 'export_ok').reduce((t, r) => t + r.n, 0),
      exportsNowm: during.filter((r) => r.name === 'export_nowm').reduce((t, r) => t + r.n, 0),
      active3: rows.some((r) => r.day >= last3),
      result: ended ? (s.result || 'pending') : (s.result === 'canceled' ? 'canceled_running' : 'running'),
      month2: s.result === 'paid' && end <= now - 32 * DAY ? (paidCount.get(s.id) || 0) >= 2 : null,
      source: s.signup_source || null, heard: heard.get(s.user_id) || null, email: maskEmail(s.email),
    };
  });

  const pct = (a, b) => (b ? Math.round(a / b * 1000) / 10 : null);
  function period(d) {
    const from = now - d * DAY;
    const started = trials.filter((t) => t.start >= from), j1 = started.filter((t) => t.j1Done);
    const endedIn = trials.filter((t) => t.ended && t.end >= from);
    const count = (list, f) => list.filter(f).length;
    const m2 = trials.filter((t) => t.month2 !== null && t.end >= from - 32 * DAY);
    return {
      days: d, started: started.length,
      activation: { measured: j1.length, nowm: count(j1, (t) => t.j1Nowm), any: count(j1, (t) => t.j1Any),
        nowmPct: pct(count(j1, (t) => t.j1Nowm), j1.length), anyPct: pct(count(j1, (t) => t.j1Any), j1.length) },
      conversion: { ended: endedIn.length, paid: count(endedIn, (t) => t.result === 'paid'), canceled: count(endedIn, (t) => t.result === 'canceled'),
        failed: count(endedIn, (t) => t.result === 'failed'), pending: count(endedIn, (t) => t.result === 'pending'),
        paidPct: pct(count(endedIn, (t) => t.result === 'paid'), endedIn.length),
        month2: { measured: m2.length, still: count(m2, (t) => t.month2), pct: pct(count(m2, (t) => t.month2), m2.length) } },
      usage: { twoDays: count(started, (t) => t.activeDays >= 2), twoDaysPct: pct(count(started, (t) => t.activeDays >= 2), started.length),
        exportsAvg: started.length ? Math.round(started.reduce((s, t) => s + t.exports, 0) / started.length * 10) / 10 : null },
    };
  }
  const running = trials.filter((t) => !t.ended);
  const weeks = [...new Set(trials.map((t) => isoWeek(t.start)))].sort().reverse().slice(0, 8).map((w) => {
    const c = trials.filter((t) => isoWeek(t.start) === w), e = c.filter((t) => t.ended);
    return { week: w, started: c.length, ended: e.length, paid: e.filter((t) => t.result === 'paid').length, canceled: e.filter((t) => t.result === 'canceled').length,
      failed: e.filter((t) => t.result === 'failed').length, month2: c.filter((t) => t.month2 === true).length, month2Measured: c.filter((t) => t.month2 !== null).length };
  });
  return {
    d7: period(7), d30: period(30), weeks,
    now: { running: running.length, active3: running.filter((t) => t.active3).length },
    running: running.map((t) => ({ day: Math.min(7, Math.floor((now - t.start) / DAY) + 1), startedAt: new Date(t.start).toISOString(),
      exported: t.exports > 0, exportedNowm: t.exportsNowm > 0, j1Nowm: t.j1Nowm, active3: t.active3, canceled: t.result === 'canceled_running',
      exports: t.exports, activeDays: t.activeDays, source: t.source, heard: t.heard, email: t.email })),
  };
}
