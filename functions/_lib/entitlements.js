// What each plan unlocks. The server is the source of truth; the client only reads this (GET /api/me → entitlements).
import { HttpError } from './http.js';

// Offer of 30/10/2026 (evening), STALAK_CONTEXTE.md section 2: Gratuit (no account needed, unlimited, watermark that a
// rewarded ad removes for one video) + Stalak Pro + Stalak Creator Plus.

// The plans, from the smallest. A plan has everything the plans before it have.
export const PLANS = ['free', 'pro', 'creator'];
// plans of the earlier offers of 30/10 (only test subscriptions): Basic counts as Pro, Max as Creator Plus
const OLD_PLANS = { basic: 'pro', max: 'creator' };
export const normPlan = (p) => (PLANS.includes(p) ? p : OLD_PLANS[p] || null);

// THE table (contract App / Comptes, docs/STATUS.md): each feature → the smallest plan that unlocks it. The page asks
// acctHas('<feature>'), the server requirePlan(env, user, '<feature>'). Add a feature here, nowhere else.
export const FEATURES = Object.freeze({
  nowm: 'pro',          // no watermark, no ad
  clip: 'pro',          // Clip mode, 16:9
  fx: 'pro',            // premium effects
  text: 'pro',          // lyrics word by word, karaoke, every size
  filters: 'pro',       // every video filter (the free plan keeps 3)
  lyrics: 'pro',        // automatic lyrics (Workers AI)
  pack5: 'creator',     // the pack generator: 5, 10 or 30 videos with different cuts
  pack10: 'creator',
  pack30: 'creator',
  packs: 'creator',
  cloud: 'creator',     // online saving (R2) and the Galerie
  human: 'creator',     // « Parler à un humain »
  // names of the Basic / Pro / Max offer, still asked by pages of that time (same meaning in the new offer)
  nologo: 'pro',
  unlimited: 'free',
});

// Numbers per plan.
const GB = 1024 * 1024 * 1024;
export const LIMITS = Object.freeze({
  free: Object.freeze({ lyricsPerDay: 0, lyricsMinutesPerDay: 0, cloudBytes: 0 }),
  pro: Object.freeze({ lyricsPerDay: 20, lyricsMinutesPerDay: 90, cloudBytes: 0 }),
  creator: Object.freeze({ lyricsPerDay: 60, lyricsMinutesPerDay: 270, cloudBytes: 100 * GB }),
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
    outro: false, cloudSave: planHas(p, 'cloud'), clipMode: planHas(p, 'clip'),
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

// Paddle prices → plan and billing interval. The 4 prices on sale (wrangler.toml: PADDLE_PRICE_PRO_MONTH / _YEAR,
// PADDLE_PRICE_CREATOR_MONTH / _YEAR, in dollars) and the older prices still known, so their subscribers keep their price:
// PADDLE_PRICE_MONTH / _YEAR (first Stalak Pro, euros) and PADDLE_PRICES_OLD = "pri_…:pro:month,pri_…:creator:year,…"
// (Basic and Pro in euros → pro, Max → creator). Only the 4 prices on sale can be bought or chosen in a change of plan.
export function salePrices(env) {
  const t = {};
  for (const plan of ['pro', 'creator']) for (const iv of ['month', 'year']) {
    const id = env[`PADDLE_PRICE_${plan.toUpperCase()}_${iv.toUpperCase()}`];
    if (id) t[id] = { plan, interval: iv };
  }
  return t;
}
export function priceTable(env) {
  const t = {};
  const add = (id, plan, interval) => { if (id && !t[id]) t[id] = { plan, interval }; };
  add(env.PADDLE_PRICE_MONTH, 'pro', 'month');
  add(env.PADDLE_PRICE_YEAR, 'pro', 'year');
  for (const part of String(env.PADDLE_PRICES_OLD || '').split(',')) {
    const [id, plan, iv] = part.trim().split(':');
    if (/^pri_\w+$/.test(id || '') && normPlan(plan) && normPlan(plan) !== 'free' && (iv === 'month' || iv === 'year')) add(id, normPlan(plan), iv);
  }
  return Object.assign(t, salePrices(env));
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
export function planOfSub(env, sub, now = Date.now()) {
  if (!sub) return 'free';
  const stored = normPlan(sub.plan);
  const plan = stored && stored !== 'free' ? stored : planOfPrice(env, sub.price_id) || 'pro';
  // moved to a smaller plan: the bigger one stays until the end of the period already paid (paddle.js changePlan)
  const keep = normPlan(sub.keep_plan);
  if (keep && sub.keep_until > now && rank(keep) > rank(plan)) return keep;
  return plan;
}
export const planRank = rank;

// The Paddle environment in use: 'production' (real payments) or 'sandbox' (tests). Rows of the other one are ignored
// (migration 0009): test subscriptions give nothing once real payments start.
export const payEnv = (env) => (env.PADDLE_ENV === 'production' ? 'production' : 'sandbox');

export async function userSubscription(env, userId) {
  const { results } = await env.DB.prepare(
    'SELECT * FROM subscriptions WHERE user_id = ?1 AND env = ?2 ORDER BY updated_at DESC'
  ).bind(userId, payEnv(env)).all();
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

// 403 pro_required (the name the pages already know) with the plan needed: {need: 'pro' | 'creator'}.
// Returns the user's plan, for the limits that depend on it.
export async function requirePlan(env, user, feature) {
  if (!FEATURES[feature]) throw new Error('unknown feature ' + feature);
  const { plan } = await planFor(env, user);
  if (!planHas(plan, feature)) {
    throw new HttpError(403, 'pro_required', `This feature needs Stalak ${FEATURES[feature] === 'creator' ? 'Creator Plus' : 'Pro'}.`,
      { need: FEATURES[feature], plan });
  }
  return plan;
}
