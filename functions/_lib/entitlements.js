// What each plan unlocks. The server is the source of truth; the client only reads this (GET /api/me → entitlements).
import { HttpError } from './http.js';

// Offer of 30/10/2026: Gratuit (1 video a day, account needed) + Basic / Pro / Max (STALAK_CONTEXTE.md, section 2).

// The plans, from the smallest. A plan has everything the plans before it have.
export const PLANS = ['free', 'basic', 'pro', 'max'];

// THE table: each feature → the smallest plan that unlocks it. The page asks acctHas('<feature>'), the server
// requirePlan(env, user, '<feature>'). Add a feature here, nowhere else.
export const FEATURES = Object.freeze({
  unlimited: 'basic',   // videos without the daily limit of the free plan
  nologo: 'basic',      // no 3-second Stalak logo at the end
  text: 'basic',        // every size and appearance of the lyrics on screen
  filters: 'pro',       // every video filter (the free and Basic plans keep 3)
  clip: 'pro',          // Clip mode, 16:9
  packs: 'pro',         // packs of 5 and 10 videos
  lyrics: 'pro',        // automatic lyrics (Workers AI)
  cloud: 'pro',         // online saving (R2) and the Galerie
  pack30: 'max',        // packs of 30 videos
  human: 'max',         // « Parler à un humain »
});

// Numbers per plan. null = no limit.
const GB = 1024 * 1024 * 1024;
export const LIMITS = Object.freeze({
  free: Object.freeze({ videosPerDay: 1, lyricsPerDay: 0, lyricsMinutesPerDay: 0, cloudBytes: 0 }),
  basic: Object.freeze({ videosPerDay: null, lyricsPerDay: 0, lyricsMinutesPerDay: 0, cloudBytes: 0 }),
  pro: Object.freeze({ videosPerDay: null, lyricsPerDay: 20, lyricsMinutesPerDay: 90, cloudBytes: 20 * GB }),
  max: Object.freeze({ videosPerDay: null, lyricsPerDay: 60, lyricsMinutesPerDay: 270, cloudBytes: 100 * GB }),
});

export const isPlan = (p) => PLANS.includes(p);
const rank = (p) => Math.max(0, PLANS.indexOf(p));
export const planHas = (plan, feature) => !!FEATURES[feature] && rank(plan) >= rank(FEATURES[feature]);
export const featuresOf = (plan) => Object.keys(FEATURES).filter((f) => planHas(plan, f));

export function entitlementsOf(plan) {
  const p = isPlan(plan) ? plan : 'free';
  return {
    plan: p,
    features: featuresOf(p),
    limits: { ...LIMITS[p] },
    // older names, still read by pages opened before this version
    outro: !planHas(p, 'nologo'), cloudSave: planHas(p, 'cloud'), clipMode: planHas(p, 'clip'),
    autoLyrics: planHas(p, 'lyrics'), packs: planHas(p, 'packs'),
  };
}
export const FREE = Object.freeze(entitlementsOf('free'));

// Statuses that keep a plan. past_due = Paddle is retrying a failed payment (dunning): access is kept meanwhile.
const ACTIVE_STATUSES = new Set(['active', 'trialing', 'past_due']);
// If webhooks were missed, never keep a plan more than 3 days after the paid period ended.
const GRACE_MS = 3 * 24 * 3600e3;

export function subscriptionActive(sub, now = Date.now()) {
  if (!sub || !ACTIVE_STATUSES.has(sub.status)) return false;
  if (sub.current_period_end && sub.current_period_end + GRACE_MS < now) return false;
  return true;
}
// older name (dashboard, support): « this subscription gives a paid plan now »
export const subscriptionGivesPro = subscriptionActive;

// Paddle prices → plan and billing interval. The 6 prices of the offer are set in wrangler.toml; the 2 prices of the
// first offer (Stalak Pro 9.99 € / 79 €) stay Pro: a subscriber keeps his price.
export function priceTable(env) {
  const t = {};
  const add = (id, plan, interval) => { if (id) t[id] = { plan, interval }; };
  add(env.PADDLE_PRICE_MONTH, 'pro', 'month');
  add(env.PADDLE_PRICE_YEAR, 'pro', 'year');
  for (const plan of ['basic', 'pro', 'max']) {
    add(env[`PADDLE_PRICE_${plan.toUpperCase()}_MONTH`], plan, 'month');
    add(env[`PADDLE_PRICE_${plan.toUpperCase()}_YEAR`], plan, 'year');
  }
  return t;
}
export function planOfPrice(env, priceId) {
  const p = priceId && priceTable(env)[priceId];
  return p ? p.plan : null;
}
export function intervalOf(env, priceId) {
  const p = priceId && priceTable(env)[priceId];
  return p ? p.interval : null;
}
// The plan of a subscription row: the plan saved by the webhook, else its price; rows from before this version
// (no plan, old price) were Stalak Pro.
export function planOfSub(env, sub) {
  if (!sub) return 'free';
  if (isPlan(sub.plan) && sub.plan !== 'free') return sub.plan;
  return planOfPrice(env, sub.price_id) || 'pro';
}

export async function userSubscription(env, userId) {
  const { results } = await env.DB.prepare(
    'SELECT * FROM subscriptions WHERE user_id = ?1 ORDER BY updated_at DESC'
  ).bind(userId).all();
  // several running subscriptions (rare: a second purchase): the biggest plan counts
  const active = results.filter((s) => subscriptionActive(s));
  active.sort((a, b) => rank(planOfSub(env, b)) - rank(planOfSub(env, a)));
  return active[0] || results[0] || null;
}

export async function planFor(env, user) {
  if (!user) return { plan: 'free', sub: null };
  const sub = await userSubscription(env, user.id);
  return { plan: subscriptionActive(sub) ? planOfSub(env, sub) : 'free', sub };
}

export async function entitlementsFor(env, user) {
  if (!user) return { entitlements: { ...FREE, features: [...FREE.features], limits: { ...FREE.limits } }, subscription: null };
  const { plan, sub } = await planFor(env, user);
  return {
    entitlements: entitlementsOf(plan),
    subscription: sub ? {
      status: sub.status,
      plan: planOfSub(env, sub),
      interval: intervalOf(env, sub.price_id),
      currentPeriodEnd: sub.current_period_end ? new Date(sub.current_period_end).toISOString() : null,
      cancelAt: sub.cancel_at ? new Date(sub.cancel_at).toISOString() : null,
    } : null,
  };
}

// 403 pro_required (the name the pages already know) with the plan needed: {need: 'basic' | 'pro' | 'max'}.
// Returns the user's plan, for the limits that depend on it.
export async function requirePlan(env, user, feature) {
  if (!FEATURES[feature]) throw new Error('unknown feature ' + feature);
  const { plan } = await planFor(env, user);
  if (!planHas(plan, feature)) {
    throw new HttpError(403, 'pro_required', `This feature needs Stalak ${FEATURES[feature][0].toUpperCase() + FEATURES[feature].slice(1)}.`,
      { need: FEATURES[feature], plan });
  }
  return plan;
}
