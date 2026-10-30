// Paddle Billing: webhook signature, subscription sync, customer portal, cancellation.
// Docs: https://developer.paddle.com/webhooks/about/signature-verification
//       https://developer.paddle.com/api-reference/customer-portals/create-customer-portal-session
import { HttpError, readText } from './http.js';
import { hmacSha256Hex, timingSafeEqual } from './crypto.js';
import { planOfPrice, normPlan, salePrices, priceTable, subscriptionActive, planOfSub, payEnv } from './entitlements.js';
import { bump } from './metrics.js';

export const SIGNATURE_TOLERANCE_S = 300;

export function apiBase(env) {
  return env.PADDLE_ENV === 'production' ? 'https://api.paddle.com' : 'https://sandbox-api.paddle.com';
}

// Header: "ts=1671552777;h1=eb4d...". Several h1 may be present during secret rotation.
export function parseSignatureHeader(header) {
  const out = { ts: null, h1: [] };
  for (const part of String(header || '').split(';')) {
    const i = part.indexOf('=');
    if (i < 0) continue;
    const k = part.slice(0, i).trim(), v = part.slice(i + 1).trim();
    if (k === 'ts') out.ts = v;
    else if (k === 'h1') out.h1.push(v);
  }
  return out;
}

// Signed payload = `${ts}:${rawBody}`, HMAC-SHA256 with the notification destination's secret key.
export async function verifySignature(secret, header, rawBody, nowS = Math.floor(Date.now() / 1000)) {
  const { ts, h1 } = parseSignatureHeader(header);
  if (!ts || !/^\d+$/.test(ts) || h1.length === 0) return { ok: false, reason: 'malformed' };
  if (Math.abs(nowS - Number(ts)) > SIGNATURE_TOLERANCE_S) return { ok: false, reason: 'stale' };
  const expected = await hmacSha256Hex(secret, `${ts}:${rawBody}`);
  let match = false;
  for (const sig of h1) if (timingSafeEqual(expected, sig.toLowerCase())) match = true;
  return match ? { ok: true } : { ok: false, reason: 'mismatch' };
}

const ms = (iso) => (iso ? Date.parse(iso) || null : null);

async function findUserId(env, data) {
  const cd = data.custom_data || {};
  if (cd.user_id) {
    const u = await env.DB.prepare('SELECT id FROM users WHERE id = ?1').bind(String(cd.user_id)).first();
    if (u) return u.id;
  }
  if (data.customer_id) {
    const u = await env.DB.prepare('SELECT id FROM users WHERE paddle_customer_id = ?1').bind(data.customer_id).first();
    if (u) return u.id;
    const s = await env.DB.prepare('SELECT user_id FROM subscriptions WHERE customer_id = ?1 AND user_id IS NOT NULL LIMIT 1').bind(data.customer_id).first();
    if (s) return s.user_id;
  }
  return null;
}

async function linkCustomer(env, userId, customerId) {
  if (userId && customerId) {
    await env.DB.prepare('UPDATE users SET paddle_customer_id = ?2 WHERE id = ?1').bind(userId, customerId).run();
  }
}

// subscription.created / updated / activated / canceled / past_due / paused / resumed / trialing
async function applySubscription(env, data, occurredAt) {
  if (!data || !data.id) throw new HttpError(400, 'bad_event', 'Missing subscription data.');
  const prev = await env.DB.prepare('SELECT last_event_at, user_id FROM subscriptions WHERE id = ?1').bind(data.id).first();
  if (prev && prev.last_event_at > occurredAt) return { applied: false, reason: 'older_event' };

  const userId = (await findUserId(env, data)) || (prev && prev.user_id) || null;
  const item = (data.items || []).find((i) => i.status !== 'inactive') || (data.items || [])[0];
  const priceId = item && item.price ? item.price.id : null;
  // the plan (pro / creator): from the price ids set in wrangler.toml, else from the price's custom_data {"plan": "creator"}
  // set in Paddle. Unknown price: NULL (entitlements.js then counts it as Pro, the plan of the first offer) and a warning.
  const cdPlan = item && item.price && item.price.custom_data && item.price.custom_data.plan;
  const cd = normPlan(cdPlan);
  const plan = planOfPrice(env, priceId) || (cd && cd !== 'free' ? cd : null);
  if (priceId && !plan) console.warn('[stalak] subscription with an unknown price', data.id, priceId);
  const periodEnd = ms(data.current_billing_period && data.current_billing_period.ends_at);
  const sc = data.scheduled_change;
  const cancelAt = sc && sc.action === 'cancel' ? ms(sc.effective_at) : null;
  const now = Date.now();

  const startedAt = ms(data.started_at) || ms(data.first_billed_at) || null;
  await env.DB.prepare(
    `INSERT INTO subscriptions (id, user_id, customer_id, status, price_id, current_period_end, cancel_at, last_event_at, updated_at, plan, env, started_at)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)
     ON CONFLICT(id) DO UPDATE SET user_id = COALESCE(?2, user_id), customer_id = ?3, status = ?4, price_id = COALESCE(?5, price_id),
       current_period_end = ?6, cancel_at = ?7, last_event_at = ?8, updated_at = ?9, plan = CASE WHEN ?5 IS NULL THEN plan ELSE ?10 END,
       env = ?11, started_at = COALESCE(started_at, ?12)`
  ).bind(data.id, userId, data.customer_id || null, String(data.status || 'active'), priceId, periodEnd, cancelAt, occurredAt, now, plan, payEnv(env), startedAt).run();
  await linkCustomer(env, userId, data.customer_id);
  if (!userId) console.warn('[stalak] subscription without known user', data.id, data.customer_id);
  return { applied: true, userId, plan };
}

// transaction.completed: links the Paddle customer to the user (custom_data.user_id), and keeps the payment for the
// owner's dashboard (functions/_lib/admin.js): amounts in cents, as strings in Paddle's payload (details.totals).
// developer.paddle.com/webhooks/transactions/transaction-completed
const cents = (v) => (v == null || v === '' || !/^-?\d+$/.test(String(v)) ? null : Number(v));
async function applyTransaction(env, data) {
  const userId = await findUserId(env, data || {});
  await linkCustomer(env, userId, data && data.customer_id);
  if (userId && data.subscription_id) {
    await env.DB.prepare('UPDATE subscriptions SET user_id = ?2 WHERE id = ?1 AND user_id IS NULL').bind(data.subscription_id, userId).run();
  }
  const totals = data && data.details && data.details.totals;
  const total = totals && cents(totals.grand_total != null ? totals.grand_total : totals.total);
  if (data && data.id && total != null) {
    const item = (data.items || []).find((i) => i && i.price) || null;
    const known = await env.DB.prepare('SELECT 1 FROM payments WHERE id = ?1').bind(data.id).first();
    await env.DB.prepare(
      `INSERT INTO payments (id, user_id, subscription_id, price_id, origin, currency, total, tax, earnings, billed_at, created_at, env)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)
       ON CONFLICT(id) DO UPDATE SET user_id = COALESCE(?2, user_id), total = ?7, tax = ?8, earnings = COALESCE(?9, earnings)`
    ).bind(data.id, userId, data.subscription_id || null, item ? item.price.id : null, String(data.origin || ''),
      String(totals.currency_code || data.currency_code || 'EUR').toUpperCase().slice(0, 3), total, cents(totals.tax) || 0, cents(totals.earnings),
      ms(data.billed_at) || ms(data.updated_at) || Date.now(), Date.now(), payEnv(env)).run();
    // the last step of the funnel (dashboard): a first payment (not a renewal)
    if (!known && String(data.origin || '') !== 'subscription_recurring') await bump(env, 'paid_first');
  }
  return { applied: true, userId };
}

// adjustment.created / adjustment.updated: refunds and chargebacks (counted when approved), for the dashboard.
// developer.paddle.com/webhooks/adjustments/adjustment-updated
async function applyAdjustment(env, data, occurredAt) {
  if (!data || !data.id) throw new HttpError(400, 'bad_event', 'Missing adjustment data.');
  const t = data.totals || {};
  await env.DB.prepare(
    `INSERT INTO refunds (id, transaction_id, action, status, currency, total, last_event_at, created_at, env)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
     ON CONFLICT(id) DO UPDATE SET status = ?4, total = ?6, last_event_at = ?7 WHERE refunds.last_event_at <= ?7`
  ).bind(data.id, data.transaction_id || null, String(data.action || ''), String(data.status || ''),
    String(t.currency_code || data.currency_code || 'EUR').toUpperCase().slice(0, 3), cents(t.total) || 0, occurredAt,
    ms(data.created_at) || occurredAt, payEnv(env)).run();
  return { applied: true };
}

export const HANDLED_EVENTS = [
  'subscription.created', 'subscription.updated', 'subscription.activated', 'subscription.canceled',
  'subscription.past_due', 'subscription.paused', 'subscription.resumed', 'subscription.trialing',
  'transaction.completed', 'adjustment.created', 'adjustment.updated',
];

export async function handleWebhook(request, env) {
  if (!env.PADDLE_WEBHOOK_SECRET) throw new HttpError(500, 'not_configured', 'PADDLE_WEBHOOK_SECRET is not set.');
  const raw = await readText(request, 1024 * 1024);
  const v = await verifySignature(env.PADDLE_WEBHOOK_SECRET, request.headers.get('Paddle-Signature'), raw);
  if (!v.ok) throw new HttpError(401, 'invalid_signature', `Webhook signature check failed (${v.reason}).`);

  let event;
  try { event = JSON.parse(raw); } catch { throw new HttpError(400, 'invalid_json', 'Body is not JSON.'); }
  const type = event.event_type;
  if (!HANDLED_EVENTS.includes(type)) return { ok: true, ignored: type };

  if (event.event_id) {
    const ins = await env.DB.prepare('INSERT OR IGNORE INTO webhook_events (event_id, event_type, received_at) VALUES (?1, ?2, ?3)')
      .bind(event.event_id, type, Date.now()).run();
    if (ins.meta && ins.meta.changes === 0) return { ok: true, duplicate: true };
  }
  const occurredAt = ms(event.occurred_at) || Date.now();
  try {
    const r = type.startsWith('subscription.') ? await applySubscription(env, event.data, occurredAt)
      : type.startsWith('adjustment.') ? await applyAdjustment(env, event.data, occurredAt) : await applyTransaction(env, event.data);
    return { ok: true, ...r };
  } catch (e) {
    // Let Paddle retry: forget the event id so the retry is not seen as a duplicate.
    if (event.event_id) await env.DB.prepare('DELETE FROM webhook_events WHERE event_id = ?1').bind(event.event_id).run().catch(() => {});
    throw e;
  }
}

async function paddleApi(env, method, path, body) {
  if (!env.PADDLE_API_KEY) throw new HttpError(500, 'not_configured', 'PADDLE_API_KEY is not set.');
  const res = await fetch(apiBase(env) + path, {
    method,
    headers: { Authorization: `Bearer ${env.PADDLE_API_KEY}`, 'Content-Type': 'application/json', 'Paddle-Version': '1' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error('[stalak] Paddle API error', method, path, res.status, JSON.stringify(data).slice(0, 500));
    const err = new HttpError(502, 'paddle_error', 'Payment provider error, try again later.');
    err.paddleStatus = res.status; err.paddleCode = data && data.error && data.error.code;
    throw err;
  }
  return data;
}

// POST /customers/{customer_id}/portal-sessions -> data.urls.general.overview (+ per-subscription deep links).
export async function portalLinks(env, user) {
  const subs = (await env.DB.prepare('SELECT id, customer_id FROM subscriptions WHERE user_id = ?1 AND env = ?2 ORDER BY updated_at DESC').bind(user.id, payEnv(env)).all()).results;
  // the customer of a subscription of the Paddle environment in use first (a sandbox customer id means nothing in production)
  const customerId = (subs[0] && subs[0].customer_id) || user.paddle_customer_id;
  if (!customerId) throw new HttpError(404, 'no_customer', 'No Stalak Pro purchase found for this account.');
  const ids = subs.filter((s) => s.customer_id === customerId).map((s) => s.id).slice(0, 25);
  const r = await paddleApi(env, 'POST', `/customers/${encodeURIComponent(customerId)}/portal-sessions`, { subscription_ids: ids });
  const urls = (r.data && r.data.urls) || {};
  const first = (urls.subscriptions || [])[0] || {};
  return {
    url: urls.general && urls.general.overview,
    cancelUrl: first.cancel_subscription || null,
    updatePaymentUrl: first.update_subscription_payment_method || null,
  };
}

// Used when an account is deleted: stop billing immediately.
export async function cancelSubscriptionNow(env, subscriptionId) {
  return paddleApi(env, 'POST', `/subscriptions/${encodeURIComponent(subscriptionId)}/cancel`, { effective_from: 'immediately' });
}

// POST /api/paddle/change {plan, interval, preview?}: a subscriber moves to another plan on the SAME subscription, instead of
// buying a second one. Rules of the conditions of sale (Juridique, 30/10):
// - up (a bigger plan, or monthly → yearly): now, prorated (Paddle prorated_immediately), the amount shown before confirming
//   ({preview: true} asks Paddle's preview: nothing changes); if the payment fails nothing changes (prevent_change);
// - down (Creator Plus → Pro, same billing interval): at the next renewal, nothing refunded: Paddle bills the new price from the
//   next renewal (full_next_billing_period) and the plan paid for stays until then (subscriptions.keep_plan / keep_until);
// - down with a change of interval (yearly → monthly, or a smaller plan billed yearly): Paddle cannot schedule a change of
//   billing interval, so it is refused (409 change_at_renewal): stop the renewal, then take the new plan when it ends.
// The new plan is set by the webhook (subscription.updated). Prices of the change: the prices of today (env), never the
// subscriber's old price. developer.paddle.com/build/subscriptions/replace-products-prices-upgrade-downgrade
const RANK = { pro: 1, creator: 2 };
function cents2(v) { return v == null || v === '' || !/^-?\d+$/.test(String(v)) ? null : Number(v); }
export async function changePlan(env, user, body) {
  const plan = body && body.plan, interval = body && body.interval, preview = !!(body && body.preview === true);
  if (!['pro', 'creator'].includes(plan) || !['month', 'year'].includes(interval)) {
    throw new HttpError(400, 'invalid_plan', 'plan: pro or creator; interval: month or year.');
  }
  // only the prices on sale (the older ones are only kept for their subscribers)
  const priceId = env[`PADDLE_PRICE_${plan.toUpperCase()}_${interval === 'year' ? 'YEAR' : 'MONTH'}`];
  if (!priceId || !salePrices(env)[priceId]) throw new HttpError(409, 'not_configured', 'This plan cannot be bought yet.');
  const { results } = await env.DB.prepare('SELECT * FROM subscriptions WHERE user_id = ?1 AND env = ?2 ORDER BY updated_at DESC').bind(user.id, payEnv(env)).all();
  const sub = results.find((s) => subscriptionActive(s) && s.status !== 'past_due');
  if (!sub) throw new HttpError(404, 'no_subscription', 'No running subscription to change: buy a plan instead.');
  if (sub.cancel_at) throw new HttpError(409, 'subscription_ending', 'This subscription is ending: buy a new plan once it has stopped, or resume it first.');
  if (sub.price_id === priceId) throw new HttpError(409, 'same_plan', 'This is already your plan.');
  // the plan paid for now (a smaller plan already chosen does not count: the comparison is with what the person has)
  const paid = planOfPrice(env, sub.price_id) || (normPlan(sub.plan) && normPlan(sub.plan) !== 'free' ? normPlan(sub.plan) : 'pro');
  const curInterval = (priceTable(env)[sub.price_id] || {}).interval || 'month';
  const up = RANK[plan] > RANK[paid] || (plan === paid && curInterval === 'month' && interval === 'year');
  if (!up && interval !== curInterval) {
    throw new HttpError(409, 'change_at_renewal', 'A smaller plan with another billing interval starts at the end of the current one: stop the renewal, then take it.');
  }
  // back up to a plan already paid for this period (a smaller one was chosen, the bigger one is still kept): no new charge
  const kept = normPlan(sub.keep_plan), keepOn = !!kept && sub.keep_until > Date.now();
  const repaid = up && keepOn && RANK[plan] <= RANK[kept] && interval === curInterval;
  const req = {
    items: [{ price_id: priceId, quantity: 1 }],
    proration_billing_mode: repaid ? 'do_not_bill' : up ? 'prorated_immediately' : 'full_next_billing_period',
    on_payment_failure: 'prevent_change',
  };
  const path = `/subscriptions/${encodeURIComponent(sub.id)}`;
  if (preview) {
    const r = await paddleApi(env, 'PATCH', path + '/preview', req);
    const d = (r && r.data) || {}, t = d.immediate_transaction && d.immediate_transaction.details && d.immediate_transaction.details.totals;
    const res = d.update_summary && d.update_summary.result;
    const amount = repaid ? 0 : up ? (t ? cents2(t.grand_total != null ? t.grand_total : t.total) : res ? cents2(res.amount) : null) : 0;
    const currency = String((t && t.currency_code) || (res && res.currency_code) || d.currency_code || 'EUR').toUpperCase().slice(0, 3);
    return { preview: true, kind: up ? 'up' : 'down', from: paid, to: plan, interval, amount, currency,
      effectiveAt: up ? null : (sub.current_period_end ? new Date(sub.current_period_end).toISOString() : null) };
  }
  await paddleApi(env, 'PATCH', path, req);
  if (up && !(repaid && RANK[plan] < RANK[kept])) {
    await env.DB.prepare('UPDATE subscriptions SET keep_plan = NULL, keep_until = NULL WHERE id = ?1').bind(sub.id).run();
  } else if (!up) {
    // the plan paid for stays until the end of the period (the earlier one, if a smaller plan was already chosen)
    const keep = keepOn && RANK[kept] > RANK[paid] ? kept : paid;
    await env.DB.prepare('UPDATE subscriptions SET keep_plan = ?2, keep_until = ?3 WHERE id = ?1').bind(sub.id, keep, sub.current_period_end || null).run();
  }
  return { ok: true, kind: up ? 'up' : 'down', from: paid, to: plan, interval,
    effectiveAt: up ? null : (sub.current_period_end ? new Date(sub.current_period_end).toISOString() : null) };
}
