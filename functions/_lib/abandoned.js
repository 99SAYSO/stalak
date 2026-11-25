// « Paiements abandonnés » (Comptes, 25/11, docs/handoff/chef-sources-et-paiements.md): what Paddle itself knows about the
// payment windows opened on stalak.app and not paid. Read with Paddle's API (GET /transactions, origin web, read-only,
// developer.paddle.com/api-reference/transactions/list-transactions, read 25/11): each opening of the payment window makes
// a transaction « draft » or « ready »; a paid one becomes « completed ». Each has its plan (price), trial or not, currency,
// amount, the country of the address, and the payment attempts with Paddle's reason when one failed (declined,
// authentication_failed, blocked_card…).
// Only what helps to understand WHY, never who: no e-mail, no name, no customer or transaction id, no card details.
import { paddleApi } from './paddle.js';
import { planOfPrice, intervalOf } from './entitlements.js';

const OPEN = ['draft', 'ready'];
export const PAY_ERRORS = ['authentication_failed', 'blocked_by_policy', 'blocked_card', 'canceled', 'declined', 'declined_not_retryable',
  'expired_card', 'fraud', 'invalid_amount', 'invalid_payment_details', 'issuer_unavailable', 'not_enough_balance', 'payment_attempt_expired',
  'preferred_network_not_supported', 'prepaid_card_not_supported', 'psp_error', 'redacted_payment_method', 'system_error', 'transaction_not_permitted', 'unknown'];

function kindOfPrice(env, id) {
  if (!id) return 'unknown';
  if (id === env.PADDLE_PRICE_PRO_OFFER1) return 'offer1';
  if (id === env.PADDLE_PRICE_PRO_MONTH_TRIAL || id === env.PADDLE_PRICE_PRO_YEAR_TRIAL) return 'trial';
  return 'normal';
}
// one transaction → its anonymous row
export function rowOf(env, t) {
  const item = (t.items || [])[0] || {}, price = item.price || {}, pid = price.id || item.price_id || null;
  const pays = (Array.isArray(t.payments) ? t.payments : []).map((p) => ({
    status: String(p.status || 'unknown').slice(0, 30),
    error: PAY_ERRORS.includes(p.error_code) ? p.error_code : p.error_code ? 'unknown' : null,
    method: /^[a-z_]{2,30}$/.test(String((p.method_details || {}).type || '')) ? p.method_details.type : null,
  }));
  const totals = (t.details && t.details.totals) || {};
  const country = t.address && /^[A-Z]{2}$/.test(t.address.country_code || '') ? t.address.country_code : null;
  // how far the person went, from what Paddle has: a payment tried (and why it failed), an address, or only opened
  const stage = pays.some((p) => p.status === 'error' || p.status === 'canceled' || p.status === 'dropped' || p.error) ? 'try'
    : pays.length ? 'method' : t.address_id && t.address && t.address.postal_code ? 'info' : 'price';
  return {
    at: t.created_at || null, status: String(t.status || ''), stage,
    plan: planOfPrice(env, pid) || (pid === env.PADDLE_PRICE_PRO_OFFER1 ? 'pro' : null), interval: intervalOf(env, pid),
    kind: kindOfPrice(env, pid), trial: !!price.trial_period || kindOfPrice(env, pid) === 'trial',
    currency: /^[A-Z]{3}$/.test(t.currency_code || '') ? t.currency_code : null,
    total: Number.isFinite(Number(totals.total)) ? Number(totals.total) : null, tax: Number.isFinite(Number(totals.tax)) ? Number(totals.tax) : null,
    country, discount: !!t.discount_id, payments: pays,
  };
}

// GET /api/admin/paddle/abandoned?days=7|14|30 — the openings not paid, and the paid ones of the same days to compare
export async function abandoned(env, days = 7, now = Date.now()) {
  if (!env.PADDLE_API_KEY) return { state: 'off' };
  days = [7, 14, 30].includes(days) ? days : 7;
  const since = new Date(now - days * 864e5).toISOString().replace(/\.\d{3}Z$/, 'Z');
  const rows = [];
  let paid = 0, after = null;
  for (let page = 0; page < 5; page++) {
    const q = new URLSearchParams({ origin: 'web', 'created_at[GTE]': since, include: 'address', per_page: '30', order_by: 'created_at[DESC]' });
    if (after) q.set('after', after);
    let r;
    try { r = await paddleApi(env, 'GET', '/transactions?' + q.toString().replace(/%5B/g, '[').replace(/%5D/g, ']')); }
    catch (e) { return { state: 'error', error: e.paddleCode || e.paddleStatus || 'paddle_error' }; }
    for (const t of r.data || []) {
      if (OPEN.includes(t.status) || t.status === 'canceled') rows.push(rowOf(env, t));
      else if (t.status === 'completed' || t.status === 'paid' || t.status === 'billed') paid++;
    }
    const next = r.meta && r.meta.pagination && r.meta.pagination.has_more && r.meta.pagination.next;
    if (!next) break;
    after = new URL(next).searchParams.get('after');
    if (!after) break;
  }
  const count = (f) => rows.reduce((o, x) => { const k = f(x) ?? 'unknown'; o[k] = (o[k] || 0) + 1; return o; }, {});
  return {
    state: 'ok', days, paid, notPaid: rows.length, rows: rows.slice(0, 60),
    byStage: count((x) => x.stage), byKind: count((x) => x.kind), byPlan: count((x) => (x.plan ? x.plan + (x.interval ? '_' + x.interval : '') : null)),
    byCurrency: count((x) => x.currency), byCountry: count((x) => x.country),
    byError: rows.flatMap((x) => x.payments.map((p) => p.error).filter(Boolean)).reduce((o, k) => { o[k] = (o[k] || 0) + 1; return o; }, {}),
  };
}
