// What each plan unlocks. The server is the source of truth; the client only reads this.

export const FREE = Object.freeze({ plan: 'free', outro: true, cloudSave: false, clipMode: false, autoLyrics: false });
export const PRO = Object.freeze({ plan: 'pro', outro: false, cloudSave: true, clipMode: true, autoLyrics: true });

// Statuses that keep Pro. past_due = Paddle is retrying a failed payment (dunning): access is kept meanwhile.
const PRO_STATUSES = new Set(['active', 'trialing', 'past_due']);
// If webhooks were missed, never keep Pro more than 3 days after the paid period ended.
const GRACE_MS = 3 * 24 * 3600e3;

export function subscriptionGivesPro(sub, now = Date.now()) {
  if (!sub || !PRO_STATUSES.has(sub.status)) return false;
  if (sub.current_period_end && sub.current_period_end + GRACE_MS < now) return false;
  return true;
}

export async function userSubscription(env, userId) {
  const { results } = await env.DB.prepare(
    'SELECT * FROM subscriptions WHERE user_id = ?1 ORDER BY updated_at DESC'
  ).bind(userId).all();
  return results.find((s) => subscriptionGivesPro(s)) || results[0] || null;
}

export function intervalOf(env, priceId) {
  if (priceId && priceId === env.PADDLE_PRICE_YEAR) return 'year';
  if (priceId && priceId === env.PADDLE_PRICE_MONTH) return 'month';
  return null;
}

export async function entitlementsFor(env, user) {
  if (!user) return { entitlements: { ...FREE }, subscription: null };
  const sub = await userSubscription(env, user.id);
  const pro = subscriptionGivesPro(sub);
  return {
    entitlements: { ...(pro ? PRO : FREE) },
    subscription: sub ? {
      status: sub.status,
      interval: intervalOf(env, sub.price_id),
      currentPeriodEnd: sub.current_period_end ? new Date(sub.current_period_end).toISOString() : null,
      cancelAt: sub.cancel_at ? new Date(sub.cancel_at).toISOString() : null,
    } : null,
  };
}

export async function requirePro(env, user, HttpError) {
  const { entitlements } = await entitlementsFor(env, user);
  if (entitlements.plan !== 'pro') throw new HttpError(403, 'pro_required', 'This feature needs Stalak Pro.');
}
