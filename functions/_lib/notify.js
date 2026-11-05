// Notifications on the owner's phone, owner's request of 5/11: Telegram (telegram.js, the main channel since ntfy did not show
// on the iPhone) and ntfy (ntfy.sh, optional: only when NTFY_TOPIC is set). Both get the same notices:
//   - a new subscription: « 💸 Nouvel abonné Creator Plus » / « 14,99 $ / mois · États-Unis » (one per purchase, not one per
//     Paddle event: subscription.created, .activated and transaction.completed all arrive for the same purchase);
//   - a cancellation, quieter: « Abonnement Pro annulé » (once per subscription).
// Never the customer's e-mail nor name. The channel name is a secret (NTFY_TOPIC, typed by the owner in Cloudflare):
// empty = nothing sent. ntfy slow or down never blocks the webhook nor the account becoming Pro (3 s at most, errors swallowed,
// sent after the answer when the runtime allows it).
// docs.ntfy.sh/publish/#publish-as-json
import { normPlan } from './entitlements.js';
import { COUNTRY_NAMES_FR } from './admin-map.js';
import { telegram, tgToken } from './telegram.js';

const TOPIC = /^[A-Za-z0-9_-]{1,64}$/;
const PLAN_NAME = { pro: 'Pro', creator: 'Creator Plus' };
export const NTFY_TIMEOUT_MS = 3000;

export const ntfyOn = (env) => TOPIC.test(String(env.NTFY_TOPIC || '').trim());
const server = (env) => (/^https:\/\/[a-z0-9.-]+(:\d+)?$/i.test(String(env.NTFY_SERVER || '')) ? String(env.NTFY_SERVER) : 'https://ntfy.sh');

// one notification; true when ntfy took it. Never throws.
export async function ntfy(env, { title, message, tags = [], priority = 3 }) {
  if (!ntfyOn(env)) return false;
  const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), NTFY_TIMEOUT_MS);
  try {
    const res = await fetch(server(env), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: String(env.NTFY_TOPIC).trim(), title: String(title).slice(0, 120), message: String(message).slice(0, 300), tags, priority }),
      signal: ctl.signal,
    });
    if (!res.ok) console.warn('[stalak] ntfy answered', res.status);
    return res.ok;
  } catch (e) {
    console.warn('[stalak] ntfy unreachable', e && e.name === 'AbortError' ? 'timeout' : String(e && e.message || e).slice(0, 80));
    return false;
  } finally { clearTimeout(timer); }
}

// one notice to every channel that is set (Telegram, ntfy); quiet = no sound. {telegram, ntfy}: true when taken. Never throws.
export async function notifyOwner(env, { title, message, quiet = false, tags = [] }) {
  const [tg, nt] = await Promise.all([
    tgToken(env) ? telegram(env, message ? `${title}\n${message}` : title, { quiet }).catch(() => false) : false,
    ntfyOn(env) ? ntfy(env, { title, message: message || title, tags, priority: quiet ? 2 : 4 }) : false,
  ]);
  return { telegram: tg, ntfy: nt };
}
const anyChannel = (env) => !!tgToken(env) || ntfyOn(env);

// « 14,99 $ / mois » from the subscription's price (unit_price in cents, as a string), in French for the owner
export function priceText(item, interval) {
  const up = item && item.price && item.price.unit_price;
  const per = interval === 'year' ? ' / an' : interval === 'month' ? ' / mois' : '';
  if (!up || !/^\d+$/.test(String(up.amount || ''))) return '';
  const n = Number(up.amount) / 100, cur = String(up.currency_code || 'USD').toUpperCase();
  let s;
  try { s = n.toLocaleString('fr-FR', { style: 'currency', currency: cur, currencyDisplay: 'narrowSymbol', minimumFractionDigits: n % 1 ? 2 : 0 }); }
  catch { s = n.toFixed(2).replace('.', ',') + ' ' + cur; }
  return s.replace(/ | /g, ' ') + per;
}
const flag = (c) => (/^[A-Z]{2}$/.test(c || '') ? String.fromCodePoint(...[...c].map((x) => 0x1f1a5 + x.charCodeAt(0))) : '');
export const countryText = (c) => (/^[A-Z]{2}$/.test(c || '') ? `${flag(c)} ${COUNTRY_NAMES_FR[c] || c}` : '');

// Once per key (a subscription id), even when Paddle sends several events at once or again: the key goes into
// webhook_events (same table as Paddle's event ids, with a prefix), and only the request that wrote it sends.
async function once(env, key) {
  const r = await env.DB.prepare('INSERT OR IGNORE INTO webhook_events (event_id, event_type, received_at) VALUES (?1, ?2, ?3)')
    .bind(key, 'ntfy', Date.now()).run();
  return !!(r.meta && r.meta.changes === 1);
}

// A new subscription that pays (or is in trial). « New » = not known before this event, or started less than 2 days ago
// (created and activated may come in any order); a renewal of an older subscription is never « new ». Also the trigger of
// the thank-you e-mail (thanks.js).
export function isNewPurchase(sub, info) {
  const started = Date.parse(sub.started_at || sub.first_billed_at || '') || 0;
  const fresh = info.isNew || (started && Date.now() - started < 2 * 864e5);
  return !!(fresh && ['active', 'trialing'].includes(String(sub.status || '')) && !sub.scheduled_change);
}

// Called by the Paddle webhook after a subscription was written. sub: the Paddle data; info: {plan, interval, isNew,
// wasCanceling, userId, test}. Returns the promise of the sending (or null when there is nothing to send).
export async function subscriptionNotice(env, sub, info) {
  if (!anyChannel(env) || !sub || !sub.id) return null;
  const plan = PLAN_NAME[normPlan(info.plan)] || 'Pro';
  const status = String(sub.status || '');
  const test = info.test ? '[TEST] ' : '';
  // a new subscription that pays (or is in trial): once per subscription. « New » = not known before this event, or started
  // less than 2 days ago (created and activated may come in any order); a renewal of an older subscription is never « new ».
  if (isNewPurchase(sub, info) && await once(env, 'ntfy:new:' + sub.id)) {
    let country = '';
    if (info.userId) {
      const u = await env.DB.prepare('SELECT country FROM users WHERE id = ?1').bind(info.userId).first().catch(() => null);
      country = countryText(u && u.country);
    }
    const item = (sub.items || []).find((i) => i && i.status !== 'inactive') || (sub.items || [])[0];
    const price = priceText(item, info.interval) || (info.interval === 'year' ? 'annuel' : 'mensuel');
    return notifyOwner(env, { title: `${test}💸 Nouvel abonné ${plan}`, message: [price, country].filter(Boolean).join(' · '), tags: ['moneybag'] });
  }
  // cancelled: when the person stops it (end of the paid period planned) or it ends at once; once per subscription
  const sc = sub.scheduled_change;
  const canceling = (sc && sc.action === 'cancel') || status === 'canceled';
  if (canceling && await once(env, 'ntfy:cancel:' + sub.id)) {
    const end = sc && sc.action === 'cancel' && sc.effective_at ? new Date(sc.effective_at) : null;
    const day = end && !Number.isNaN(end.getTime()) ? end.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', timeZone: 'Europe/Paris' }) : '';
    return notifyOwner(env, { title: `${test}Abonnement ${plan} annulé`, message: day ? `Fin le ${day}.` : '', tags: ['wave'], quiet: true });
  }
  return null;
}
