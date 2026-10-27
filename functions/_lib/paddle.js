// Paddle Billing: webhook signature, subscription sync, customer portal, cancellation.
// Docs: https://developer.paddle.com/webhooks/about/signature-verification
//       https://developer.paddle.com/api-reference/customer-portals/create-customer-portal-session
import { HttpError, readText } from './http.js';
import { hmacSha256Hex, timingSafeEqual } from './crypto.js';

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
  const periodEnd = ms(data.current_billing_period && data.current_billing_period.ends_at);
  const sc = data.scheduled_change;
  const cancelAt = sc && sc.action === 'cancel' ? ms(sc.effective_at) : null;
  const now = Date.now();

  await env.DB.prepare(
    `INSERT INTO subscriptions (id, user_id, customer_id, status, price_id, current_period_end, cancel_at, last_event_at, updated_at)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
     ON CONFLICT(id) DO UPDATE SET user_id = COALESCE(?2, user_id), customer_id = ?3, status = ?4, price_id = COALESCE(?5, price_id),
       current_period_end = ?6, cancel_at = ?7, last_event_at = ?8, updated_at = ?9`
  ).bind(data.id, userId, data.customer_id || null, String(data.status || 'active'), priceId, periodEnd, cancelAt, occurredAt, now).run();
  await linkCustomer(env, userId, data.customer_id);
  if (!userId) console.warn('[stalak] subscription without known user', data.id, data.customer_id);
  return { applied: true, userId };
}

// transaction.completed: links the Paddle customer to the user (custom_data.user_id).
async function applyTransaction(env, data) {
  const userId = await findUserId(env, data || {});
  await linkCustomer(env, userId, data && data.customer_id);
  if (userId && data.subscription_id) {
    await env.DB.prepare('UPDATE subscriptions SET user_id = ?2 WHERE id = ?1 AND user_id IS NULL').bind(data.subscription_id, userId).run();
  }
  return { applied: true, userId };
}

export const HANDLED_EVENTS = [
  'subscription.created', 'subscription.updated', 'subscription.activated', 'subscription.canceled',
  'subscription.past_due', 'subscription.paused', 'subscription.resumed', 'subscription.trialing',
  'transaction.completed',
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
    const r = type.startsWith('subscription.') ? await applySubscription(env, event.data, occurredAt) : await applyTransaction(env, event.data);
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
    throw new HttpError(502, 'paddle_error', 'Payment provider error, try again later.');
  }
  return data;
}

// POST /customers/{customer_id}/portal-sessions -> data.urls.general.overview (+ per-subscription deep links).
export async function portalLinks(env, user) {
  const subs = (await env.DB.prepare('SELECT id, customer_id FROM subscriptions WHERE user_id = ?1 ORDER BY updated_at DESC').bind(user.id).all()).results;
  const customerId = user.paddle_customer_id || (subs[0] && subs[0].customer_id);
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
