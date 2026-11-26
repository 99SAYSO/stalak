// « Test payant » (Comptes, 25/11, docs/handoff/chef-test-acquisition-payante.md): for each followed link ?ref=<code> (the
// TikTok ads « ttads », each influencer « inf-<nom> »), from the day it started: visits, videos exported, payment windows
// opened, free trials, paying subscribers and money received, against the money spent (typed by the owner), so the cost
// per export and per subscriber. Anonymous totals only: the funnel counters « fs:<step>:ref:<code> » (metrics.js) and the
// payments whose source is that link (payments.source, sent with the payment; or the account's sign-up source).
import { HttpError } from './http.js';
import { today } from './metrics.js';
import { payEnv } from './entitlements.js';

export const TEST_BUDGET_CENTS = 15000;   // the owner's decision of 25/11: 150 € at most for the whole test
export const REF_CODE = /^[a-z0-9_-]{2,24}$/;
// src/app.js (VISIT_SRC) turns a ?ref= that looks like a platform into that platform (« igor » → Instagram): such a code would
// never be counted as « ref:… », so it is refused here with a clear message
const PLATFORM_LIKE = /^(ig|insta|yt|x|fb)|tiktok|google|discord|triller|reddit|facebook|bing|youtu|twitter/;

export async function paidTests(env, now = Date.now()) {
  const { results: tests } = await env.DB.prepare('SELECT ref, label, spent_cents, started_on, updated_at FROM paid_tests ORDER BY started_on, ref').all();
  const rows = [];
  for (const t of tests) {
    const src = 'ref:' + t.ref, from = t.started_on, fromMs = Date.parse(from + 'T00:00:00Z');
    const { results: c } = await env.DB.prepare(`SELECT name, SUM(n) AS n FROM daily_counts WHERE day >= ?1 AND name IN (?2, ?3, ?4, ?5) GROUP BY name`)
      .bind(from, `fs:visit:${src}`, `fs:export_ok:${src}`, `fs:checkout_open:${src}`, `fs:checkout_done:${src}`).all();
    const n = Object.fromEntries(c.map((r) => [r.name.split(':')[1], r.n]));
    // the payments of this link: their own source, or the account's sign-up source when the payment has none
    const pay = await env.DB.prepare(`SELECT p.currency, p.total, p.subscription_id, p.user_id FROM payments p LEFT JOIN users u ON u.id = p.user_id
        WHERE p.env = ?1 AND p.billed_at >= ?2 AND (p.source = ?3 OR (p.source IS NULL AND u.signup_source = ?3))`).bind(payEnv(env), fromMs, src).all();
    const paid = pay.results.filter((p) => p.total > 0), subs = new Set(paid.map((p) => p.subscription_id || p.user_id || Math.random()));
    const trials = new Set(pay.results.filter((p) => p.total === 0).map((p) => p.subscription_id || p.user_id || Math.random()));
    const revenue = {};
    for (const p of paid) revenue[p.currency] = (revenue[p.currency] || 0) + p.total;
    const exports = n.export_ok || 0, subscribers = subs.size, spent = t.spent_cents || 0;
    rows.push({ ref: t.ref, label: t.label || null, startedOn: from, spentCents: spent,
      visits: n.visit || 0, exports, checkouts: n.checkout_open || 0, trials: trials.size, subscribers, revenue,
      costPerExportCents: spent && exports ? Math.round(spent / exports) : null, costPerSubscriberCents: spent && subscribers ? Math.round(spent / subscribers) : null });
  }
  const spentTotal = rows.reduce((s, r) => s + r.spentCents, 0);
  return { budgetCents: TEST_BUDGET_CENTS, spentCents: spentTotal, overBudget: spentTotal > TEST_BUDGET_CENTS, rows, today: today(now) };
}

// POST /api/admin/paid-tests {ref, label?, spent? (euros), startedOn?} adds or updates a link; {ref, remove: true} removes it
export async function savePaidTest(env, b, now = Date.now()) {
  const ref = String(b.ref || '').trim().toLowerCase().replace(/^\?ref=|^ref:/, '');
  if (!REF_CODE.test(ref)) throw new HttpError(400, 'bad_ref', 'Le code du lien : 2 à 24 lettres, chiffres, - ou _ (ex. ttads, inf-nom).');
  if (b.remove === true) { await env.DB.prepare('DELETE FROM paid_tests WHERE ref = ?1').bind(ref).run(); return paidTests(env, now); }
  if (PLATFORM_LIKE.test(ref)) throw new HttpError(400, 'ref_like_platform', 'Ce code serait compté comme une plateforme (TikTok, Instagram, YouTube…) : choisis plutôt « inf-' + ref.replace(/[^a-z0-9]/g, '').slice(0, 18) + ' ».');
  const spent = b.spent == null || b.spent === '' ? null : Number(String(b.spent).replace(',', '.'));
  if (spent !== null && !(Number.isFinite(spent) && spent >= 0 && spent <= 100000)) throw new HttpError(400, 'bad_spent', 'Montant dépensé : un nombre d’euros, 0 ou plus.');
  const started = b.startedOn == null || b.startedOn === '' ? null : String(b.startedOn);
  if (started !== null && !(/^\d{4}-\d{2}-\d{2}$/.test(started) && Number.isFinite(Date.parse(started + 'T00:00:00Z')))) throw new HttpError(400, 'bad_date', 'Date de début : AAAA-MM-JJ.');
  const label = b.label == null ? null : String(b.label).replace(/[\u0000-\u001f\u007f<>]/g, '').trim().slice(0, 40) || null;
  await env.DB.prepare(`INSERT INTO paid_tests (ref, label, spent_cents, started_on, updated_at) VALUES (?1, ?2, ?3, ?4, ?5)
    ON CONFLICT(ref) DO UPDATE SET label = COALESCE(?2, label), spent_cents = COALESCE(?6, spent_cents), started_on = COALESCE(?7, started_on), updated_at = ?5`)
    .bind(ref, label, spent === null ? 0 : Math.round(spent * 100), started || today(now), now, spent === null ? null : Math.round(spent * 100), started).run();
  return paidTests(env, now);
}
