// The free trial of Stalak Pro (owner's decision of 23/11), Comptes:
//   - 7 days, card asked at the start by Paddle, Stalak Pro only (monthly and yearly; Creator Plus is paid from day 1);
//   - two Paddle prices of their own, with a 7-day trial (PADDLE_PRICE_PRO_MONTH_TRIAL / _YEAR_TRIAL in wrangler.toml):
//     the page opens the checkout with them only when the account has the right to a trial (entitlements.trialEligible);
//   - once per person: an account that already had a subscription or a trial has no right to it. The server checks it
//     again when Paddle says a trial started (webhook): a trial it should not have had is stopped at once and nothing is
//     billed (Paddle cancel « immediately »), whatever the page did. Not « activate » (billing at once): the person saw
//     « free for 7 days » in the checkout, a charge they did not expect would be unfair (and a dispute);
//   - after the deletion of an account that had a subscription or a trial: a mark of its address, HMAC with AUTH_SECRET
//     (« trial:… » in webhook_events), erased 12 months after the deletion (retention.js); nothing else is kept;
//   - during the trial the account has all of Pro (status trialing, entitlements.js);
//   - at the end Paddle bills the plan chosen unless it was cancelled; cancelled during the trial = nothing billed, Pro
//     stops at the end of the 7 days (Paddle: cancel at the next billing date = the end of the trial);
//   - an e-mail 2 days before the first payment: the date, the exact amount (asked to Paddle), a link to cancel
//     (GET /api/trial/cancel shows one button; a link that cancels by itself would be clicked by mail scanners).
import { HttpError, appOrigin, isDev } from './http.js';
import { hmacSha256Hex, timingSafeEqual } from './crypto.js';
import { payEnv, intervalOf } from './entitlements.js';
import { bump } from './metrics.js';
import { mail, homeOf } from './mail-layout.js';
import { paddleApi } from './paddle.js';

export const TRIAL_DAYS = 7;
export const TRIAL_MARK_KEEP_MS = 365 * 864e5;            // 12 months after the deletion of the account
export const TRIAL_REMIND_BEFORE_MS = 2 * 864e5;          // the reminder: 2 days before the first payment
const REMIND_SLACK_MS = 3 * 3600e3;                       // the daily tasks run every 6 hours at most

// the two trial prices (public ids, not secrets)
export const trialPrices = (env) => ({ month: env.PADDLE_PRICE_PRO_MONTH_TRIAL || null, year: env.PADDLE_PRICE_PRO_YEAR_TRIAL || null });
export const isTrialPrice = (env, id) => !!id && (id === env.PADDLE_PRICE_PRO_MONTH_TRIAL || id === env.PADDLE_PRICE_PRO_YEAR_TRIAL || id === env.PADDLE_PRICE_PRO_OFFER1);
// 23/11 (evening), the 1 € offer (only on the end screen of an export with the watermark): a Paddle price of its own, Stalak Pro
// monthly with a PAID trial of 7 days (trial_period.unit_price = 1 €). Same rules as the free trial: once per person (one trial
// of either kind per account), checked again at the webhook (a refused one is stopped and its 1 € paid back), same refunds.
export const offer1Price = (env) => env.PADDLE_PRICE_PRO_OFFER1 || null;
export const isOffer1 = (env, id) => !!id && id === env.PADDLE_PRICE_PRO_OFFER1;

// One form per mailbox: « +anything » removed before the @, and the dots of a Gmail address.
export function mailboxOf(email) {
  const e = String(email || '').trim().toLowerCase(), at = e.lastIndexOf('@');
  if (at < 1) return e;
  let local = e.slice(0, at).replace(/\+.*$/, ''), domain = e.slice(at + 1);
  if (domain === 'googlemail.com') domain = 'gmail.com';
  if (domain === 'gmail.com') local = local.replace(/\./g, '');
  return (local || e.slice(0, at)) + '@' + domain;
}
// null without the server secret: then no mark is written nor looked up (an address cannot be found back by trying)
export async function trialMark(env, email) {
  if (!env.AUTH_SECRET || !email) return null;
  return 'trial:' + (await hmacSha256Hex(env.AUTH_SECRET, 'trial:' + mailboxOf(email)));
}

// Has this account still the right to a trial? (never a subscription nor a trial, here or on a deleted account with the
// same address; and the trial prices exist)
export async function trialEligible(env, user) {
  const p = trialPrices(env);
  if (!user || !user.id || !(p.month || p.year)) return false;
  return trialRight(env, user);
}
// the 1 € offer: the same right (one trial of either kind per person) and its price set
export async function offer1Eligible(env, user) {
  if (!user || !user.id || !offer1Price(env)) return false;
  return trialRight(env, user);
}
async function trialRight(env, user) {
  const key = await trialMark(env, user.email);
  const r = await env.DB.prepare(`SELECT u.trial_used_at AS used,
      (SELECT COUNT(*) FROM subscriptions s WHERE s.user_id = u.id AND s.env = ?2) AS subs,
      (SELECT 1 FROM webhook_events WHERE event_id = ?3) AS marked
    FROM users u WHERE u.id = ?1`).bind(user.id, payEnv(env), key || '-').first().catch(() => null);
  return !!r && r.used == null && !r.subs && !r.marked;
}

const priceOf = (data) => { const it = (data.items || []).find((i) => i && i.price && i.price.id); return it ? it.price.id : null; };
// the completed payment of a subscription (the 1 € of the offer), refunded in full (Paddle adjustment « refund », type full)
async function refundTrialPayment(env, subId) {
  const r = await paddleApi(env, 'GET', `/transactions?subscription_id=${encodeURIComponent(subId)}&status=completed,paid&per_page=5`);
  const txn = ((r && r.data) || [])[0];
  if (!txn) return null;
  const items = ((txn.details && txn.details.line_items) || []).map((li) => ({ item_id: li.id, type: 'full' }));
  if (!items.length) return null;
  await paddleApi(env, 'POST', '/adjustments', { action: 'refund', transaction_id: txn.id, reason: 'Stalak: this account already had its trial', items });
  await bump(env, 'offer1_refunded').catch(() => {});
  return txn.id;
}
const ms = (iso) => { const t = iso ? Date.parse(iso) : NaN; return Number.isFinite(t) ? t : null; };
// the end of the trial: the trial dates of the item, else the next billing date
export function trialEndOf(data) {
  const it = (data.items || []).find((i) => i && i.trial_dates && i.trial_dates.ends_at);
  return ms(it && it.trial_dates.ends_at) || ms(data.next_billed_at) || ms(data.current_billing_period && data.current_billing_period.ends_at);
}
const trialStartOf = (data) => {
  const it = (data.items || []).find((i) => i && i.trial_dates && i.trial_dates.starts_at);
  return ms(it && it.trial_dates.starts_at) || ms(data.started_at) || Date.now();
};

// After each subscription.* webhook already written (paddle.js applySubscription): the life of a trial.
export async function trialAfterWebhook(env, data, r, now = Date.now()) {
  if (!r || !r.applied || !data || !data.id) return null;
  const status = String(data.status || '');
  const sub = await env.DB.prepare('SELECT id, user_id, trial_ends_at, trial_result, cancel_at FROM subscriptions WHERE id = ?1').bind(data.id).first();
  if (!sub) return null;
  // 1. a trial starts (first message that shows it): the server decides whether the account may have it
  if (status === 'trialing' && sub.trial_ends_at == null) {
    const end = trialEndOf(data), start = trialStartOf(data);
    const w = await env.DB.prepare('UPDATE subscriptions SET trial_started_at = ?2, trial_ends_at = ?3 WHERE id = ?1 AND trial_ends_at IS NULL')
      .bind(data.id, start, end).run();
    if (!(w.meta && w.meta.changes === 1)) return null;   // another message of the same trial got here first
    if (!sub.user_id) { console.warn('[stalak] trial without a known account', data.id); return { trial: 'unknown_user' }; }
    const user = await env.DB.prepare('SELECT id, email FROM users WHERE id = ?1').bind(sub.user_id).first();
    const key = await trialMark(env, user && user.email);
    // one statement: the account takes its trial only if it never had one, nor another subscription, nor a mark
    const c = await env.DB.prepare(`UPDATE users SET trial_used_at = ?2 WHERE id = ?1 AND trial_used_at IS NULL
        AND NOT EXISTS (SELECT 1 FROM subscriptions s WHERE s.user_id = ?1 AND s.env = ?3 AND s.id != ?4)
        AND NOT EXISTS (SELECT 1 FROM webhook_events WHERE event_id = ?5)`).bind(sub.user_id, now, payEnv(env), data.id, key || '-').run();
    if (c.meta && c.meta.changes === 1) { await bump(env, 'trial_start').catch(() => {}); return { trial: 'started' }; }
    // no right to it (the page should never have offered it): stopped now, nothing billed, no Pro from it
    await env.DB.prepare("UPDATE subscriptions SET trial_result = 'refused', status = 'canceled', cancel_at = ?2 WHERE id = ?1").bind(data.id, now).run();
    await bump(env, 'trial_refused').catch(() => {});
    try { await paddleApi(env, 'POST', `/subscriptions/${encodeURIComponent(data.id)}/cancel`, { effective_from: 'immediately' }); }
    catch (e) { console.error('[stalak] trial refused but Paddle did not cancel it', data.id, e && e.paddleStatus, e && e.paddleCode); }
    // a paid trial (the 1 € offer): its payment is given back in full
    if (isOffer1(env, priceOf(data))) await refundTrialPayment(env, data.id).catch((e) => console.error('[stalak] refused 1 € offer not refunded', data.id, e && e.paddleStatus, e && e.paddleCode));
    return { trial: 'refused' };
  }
  if (sub.trial_ends_at == null || sub.trial_result === 'refused') return null;
  // 2. what the trial became (one result; « paid » can come after « canceled » or « failed »: resumed, payment recovered)
  let result = null;
  if (status === 'active' && sub.trial_result !== 'paid') result = 'paid';
  else if (sub.trial_result == null && status === 'past_due') result = 'failed';
  else if (sub.trial_result == null && (status === 'canceled' || (status === 'trialing' && data.scheduled_change && data.scheduled_change.action === 'cancel'))) result = 'canceled';
  // cancel undone during the trial: the trial goes on
  else if (sub.trial_result === 'canceled' && status === 'trialing' && !data.scheduled_change) {
    await env.DB.prepare('UPDATE subscriptions SET trial_result = NULL WHERE id = ?1').bind(data.id).run();
    return { trial: 'resumed' };
  }
  if (!result) return null;
  await env.DB.prepare('UPDATE subscriptions SET trial_result = ?2 WHERE id = ?1').bind(data.id, result).run();
  await bump(env, 'trial_' + result).catch(() => {});
  return { trial: result };
}

// Account deletion (router.js): the mark of the address if the account had a subscription or a trial, written in the
// same batch as the deletion. The 12 months start at the deletion.
export async function trialMarkOnDelete(env, user, now = Date.now()) {
  const key = await trialMark(env, user.email);
  if (!key) return null;
  return env.DB.prepare(`INSERT INTO webhook_events (event_id, event_type, received_at)
      SELECT ?2, 'trialmark', ?3 WHERE EXISTS (SELECT 1 FROM users WHERE id = ?1 AND trial_used_at IS NOT NULL)
        OR EXISTS (SELECT 1 FROM subscriptions WHERE user_id = ?1 AND env = ?4)
      ON CONFLICT(event_id) DO UPDATE SET received_at = excluded.received_at`).bind(user.id, key, now, payEnv(env));
}
export async function purgeOldTrialMarks(env, now = Date.now()) {
  const r = await env.DB.prepare("DELETE FROM webhook_events WHERE event_type = 'trialmark' AND received_at < ?1").bind(now - TRIAL_MARK_KEEP_MS).run();
  return r.meta ? r.meta.changes || 0 : 0;
}

// ---- cancelling from the e-mail ----
export const cancelToken = async (env, subId) => (env.AUTH_SECRET ? hmacSha256Hex(env.AUTH_SECRET, 'trialcancel:' + subId) : null);
export async function cancelLink(env, subId, lang) {
  const t = await cancelToken(env, subId);
  if (!t) return homeOf(appOrigin(env), lang) + (lang === 'fr' ? '#compte' : '#account');
  return `${appOrigin(env)}/api/trial/cancel?s=${encodeURIComponent(subId)}&t=${t}&l=${lang === 'fr' ? 'fr' : 'en'}`;
}
async function subForCancel(env, subId, token, user) {
  if (!/^sub_[a-z0-9]{10,40}$/i.test(String(subId || ''))) throw new HttpError(404, 'not_found', 'Unknown trial.');
  const sub = await env.DB.prepare('SELECT id, user_id, status, cancel_at, trial_ends_at, trial_result FROM subscriptions WHERE id = ?1 AND env = ?2')
    .bind(subId, payEnv(env)).first();
  const want = await cancelToken(env, subId);
  const byLink = !!(want && token && timingSafeEqual(String(token), want));
  const byOwner = !!(user && sub && sub.user_id === user.id);
  if (!sub || (!byLink && !byOwner)) throw new HttpError(404, 'not_found', 'Unknown trial.');
  return sub;
}
const trialState = (sub, now = Date.now()) => sub.status === 'trialing' && sub.trial_ends_at > now
  ? (sub.cancel_at ? 'canceled' : 'running') : 'over';

// POST /api/trial/cancel {s, t}: Paddle cancels at the next billing date (the end of the trial): nothing billed, Pro until then
export async function cancelTrial(env, body, user, now = Date.now()) {
  const sub = await subForCancel(env, body && body.s, body && body.t, user);
  const st = trialState(sub, now);
  if (st === 'canceled') return { ok: true, already: true, endsAt: new Date(sub.trial_ends_at).toISOString() };
  if (st !== 'running') throw new HttpError(409, 'trial_over', 'This trial is over: manage the subscription from your account.');
  await paddleApi(env, 'POST', `/subscriptions/${encodeURIComponent(sub.id)}/cancel`, { effective_from: 'next_billing_period' });
  // written now (the webhook confirms it): the page and the reminder see it at once
  await env.DB.prepare("UPDATE subscriptions SET cancel_at = COALESCE(cancel_at, ?2), trial_result = COALESCE(trial_result, 'canceled') WHERE id = ?1")
    .bind(sub.id, sub.trial_ends_at).run();
  await bump(env, 'trial_cancel_link').catch(() => {});
  return { ok: true, endsAt: new Date(sub.trial_ends_at).toISOString() };
}

// GET /api/trial/cancel?s&t&l: a small page with one button (no cancel on a GET: mail scanners open links)
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const dayOf = (t, fr) => new Date(t).toLocaleDateString(fr ? 'fr-FR' : 'en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
export async function cancelPage(env, url, now = Date.now()) {
  const fr = url.searchParams.get('l') !== 'en';
  let sub = null;
  try { sub = await subForCancel(env, url.searchParams.get('s'), url.searchParams.get('t'), null); } catch { sub = null; }
  const st = sub ? trialState(sub, now) : 'unknown';
  const T = fr ? {
    title: 'Annuler ton essai Stalak Pro', running: `Si tu annules, <b>rien ne sera prélevé</b>. Tu gardes Stalak Pro jusqu’au ${esc(dayOf(sub ? sub.trial_ends_at : now, true))}, puis ton compte repasse en Gratuit.`,
    btn: 'Annuler mon essai', done: 'C’est annulé. Rien ne sera prélevé, et tu gardes Pro jusqu’à la fin de l’essai.', canceled: 'Ton essai est déjà annulé : rien ne sera prélevé.',
    over: 'Cet essai est terminé. Pour gérer ton abonnement : Stalak → menu du compte → Gérer mon abonnement.', unknown: 'Ce lien ne marche pas (ou plus). Pour gérer ton abonnement : Stalak → menu du compte → Gérer mon abonnement.',
    err: 'Ça n’a pas marché. Réessaie dans un instant, ou écris à contact@stalak.app.', back: 'Retour à Stalak',
  } : {
    title: 'Cancel your Stalak Pro trial', running: `If you cancel, <b>you won’t be charged</b>. You keep Stalak Pro until ${esc(dayOf(sub ? sub.trial_ends_at : now, false))}, then your account goes back to Free.`,
    btn: 'Cancel my trial', done: 'Done. You won’t be charged, and you keep Pro until the end of the trial.', canceled: 'Your trial is already cancelled: you won’t be charged.',
    over: 'This trial is over. To manage your subscription: Stalak → account menu → Manage my subscription.', unknown: 'This link doesn’t work (anymore). To manage your subscription: Stalak → account menu → Manage my subscription.',
    err: 'That didn’t work. Try again in a moment, or write to contact@stalak.app.', back: 'Back to Stalak',
  };
  const nonce = Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, '0')).join('');
  const msg = st === 'running' ? T.running : st === 'canceled' ? T.canceled : st === 'over' ? T.over : T.unknown;
  const home = homeOf(appOrigin(env), fr ? 'fr' : 'en');
  const html = `<!doctype html><html lang="${fr ? 'fr' : 'en'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>${esc(T.title)}</title><style>
body{margin:0;background:#d6ecff;font:17px/1.5 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#0a0d14}
main{max-width:460px;margin:8vh auto;padding:0 16px}.card{background:#fff;border:3px solid #0a0d14;border-radius:18px;box-shadow:0 5px 0 #0a0d14;padding:24px}
h1{font-size:24px;margin:0 0 12px}button{font:inherit;font-weight:800;background:#1f6fd6;color:#fff;border:3px solid #0a0d14;border-radius:14px;box-shadow:0 4px 0 #0a0d14;padding:12px 20px;width:100%;cursor:pointer;margin-top:12px}
button[disabled]{opacity:.6}a{color:#0e3f8f}</style></head><body><main><div class="card"><h1>${esc(T.title)}</h1>
<p id="m">${msg}</p>${st === 'running' ? `<button id="b" type="button">${esc(T.btn)}</button>` : ''}<p><a href="${esc(home)}">${esc(T.back)}</a></p></div></main>
${st === 'running' ? `<script nonce="${nonce}">
var b=document.getElementById('b'),m=document.getElementById('m');
b.addEventListener('click',function(){b.disabled=true;fetch('/api/trial/cancel',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},
body:JSON.stringify({s:${JSON.stringify(sub.id)},t:${JSON.stringify(url.searchParams.get('t') || '')}})}).then(function(r){return r.json().then(function(d){return [r.ok,d];});})
.then(function(x){if(x[0]){m.textContent=${JSON.stringify(T.done)};b.remove();}else{m.textContent=${JSON.stringify(T.err)};b.disabled=false;}})
.catch(function(){m.textContent=${JSON.stringify(T.err)};b.disabled=false;});});
</script>` : ''}</body></html>`;
  return new Response(html, { status: 200, headers: {
    'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store', 'Referrer-Policy': 'no-referrer', 'X-Frame-Options': 'DENY',
    'Content-Security-Policy': `default-src 'none'; script-src 'nonce-${nonce}'; style-src 'unsafe-inline'; connect-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'`,
  } });
}

// ---- the reminder, 2 days before the first payment ----
function money(cents, currency, fr) {
  try {
    const f = new Intl.NumberFormat(fr ? 'fr-FR' : 'en-US', { style: 'currency', currency });
    const digits = f.resolvedOptions().maximumFractionDigits;
    return f.format(Number(cents) / 10 ** digits);
  } catch { return null; }
}
export function trialReminderEmail(env, lang, { endsAt, amount, interval, link }) {
  const fr = lang === 'fr', site = appOrigin(env), when = dayOf(endsAt, fr);
  const per = interval === 'year' ? (fr ? 'par an' : 'a year') : (fr ? 'par mois' : 'a month');
  const blocks = fr ? [
    { p: `Ton essai gratuit de Stalak Pro se termine le ${when}. Ce jour-là, Paddle (notre service de paiement) prélèvera ${amount} sur ta carte, puis ${amount} ${per} jusqu’à ce que tu arrêtes.` },
    { p: 'Pour garder Pro, tu n’as rien à faire. Pour ne rien payer, annule avant cette date : tu gardes Pro jusqu’à la fin de l’essai.' },
    { button: { href: link, label: 'Annuler mon essai' } },
    { small: 'Une question ? Réponds simplement à cet e-mail ou écris à contact@stalak.app.' },
  ] : [
    { p: `Your free Stalak Pro trial ends on ${when}. That day, Paddle (our payment provider) will charge ${amount} to your card, then ${amount} ${per} until you cancel.` },
    { p: 'To keep Pro, there is nothing to do. To pay nothing, cancel before that date: you keep Pro until the end of the trial.' },
    { button: { href: link, label: 'Cancel my trial' } },
    { small: 'Questions? Just reply to this email or write to contact@stalak.app.' },
  ];
  return mail({
    lang: fr ? 'fr' : 'en', site,
    subject: fr ? `Ton essai Stalak Pro se termine le ${when}` : `Your Stalak Pro trial ends on ${when}`,
    preheader: fr ? `${amount} seront prélevés ce jour-là, sauf si tu annules.` : `${amount} will be charged that day unless you cancel.`,
    title: fr ? 'Ton essai se termine bientôt' : 'Your trial ends soon', mascot: 'coffee', blocks,
    reason: fr ? 'Tu as commencé un essai gratuit de Stalak Pro. Ce rappel part une seule fois.' : 'You started a free Stalak Pro trial. We send this reminder once.',
  });
}
async function sendMail(env, to, msg) {
  if (!env.RESEND_API_KEY) {
    if (isDev(env)) { console.log(`[stalak dev] trial reminder for ${to}: ${msg.subject}`); return true; }
    return false;
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: env.EMAIL_FROM || 'Stalak <login@stalak.app>', to: [to], reply_to: 'contact@stalak.app',
      subject: msg.subject, text: msg.text, html: msg.html }),
  });
  return res.ok;
}
// the exact amount of the first payment (tax included), asked to Paddle: GET /subscriptions/{id}?include=next_transaction
async function nextAmount(env, subId, fr) {
  const r = await paddleApi(env, 'GET', `/subscriptions/${encodeURIComponent(subId)}?include=next_transaction`);
  const nt = r && r.data && r.data.next_transaction, t = nt && nt.details && nt.details.totals;
  const cents = t && (t.grand_total != null ? t.grand_total : t.total);
  const cur = String((t && t.currency_code) || (r && r.data && r.data.currency_code) || '').toUpperCase();
  return cents != null && /^-?\d+$/.test(String(cents)) && /^[A-Z]{3}$/.test(cur) ? money(cents, cur, fr) : null;
}
// Daily (cloud.js maybeCleanup, POST /api/cron/cloud-cleanup): trials ending in 2 days that are not cancelled → one e-mail.
// Without the exact amount (Paddle not answering) the e-mail waits for the next run (6 hours at most).
export async function trialReminders(env, now = Date.now(), { max = 20 } = {}) {
  const out = { trialReminded: 0 };
  // (23/11, the owner) our own reminder e-mail is turned off: Paddle sends its own before the end of the trial.
  // Kept in the code; TRIAL_REMINDER_EMAIL = "1" in wrangler.toml turns it back on.
  if (String(env.TRIAL_REMINDER_EMAIL || '') !== '1') return out;
  const { results } = await env.DB.prepare(
    `SELECT s.id, s.price_id, s.trial_ends_at, u.email, u.lang FROM subscriptions s JOIN users u ON u.id = s.user_id
     WHERE s.env = ?1 AND s.status = 'trialing' AND s.cancel_at IS NULL AND s.trial_reminded_at IS NULL AND s.trial_result IS NULL
       AND s.trial_ends_at > ?2 AND s.trial_ends_at <= ?3 ORDER BY s.trial_ends_at LIMIT ?4`
  ).bind(payEnv(env), now, now + TRIAL_REMIND_BEFORE_MS + REMIND_SLACK_MS, max).all();
  for (const s of results) {
    const fr = s.lang === 'fr';
    let amount = null;
    try { amount = await nextAmount(env, s.id, fr); } catch { amount = null; }
    if (!amount) continue;
    const link = await cancelLink(env, s.id, fr ? 'fr' : 'en');
    // claimed before sending: two runs at the same time send one e-mail
    const c = await env.DB.prepare('UPDATE subscriptions SET trial_reminded_at = ?2 WHERE id = ?1 AND trial_reminded_at IS NULL').bind(s.id, now).run();
    if (!(c.meta && c.meta.changes === 1)) continue;
    let ok = false;
    try { ok = await sendMail(env, s.email, trialReminderEmail(env, fr ? 'fr' : 'en', { endsAt: s.trial_ends_at, amount, interval: intervalOf(env, s.price_id), link })); } catch { ok = false; }
    if (!ok) { await env.DB.prepare('UPDATE subscriptions SET trial_reminded_at = NULL WHERE id = ?1').bind(s.id).run(); continue; }
    out.trialReminded++;
  }
  return out;
}

// Dashboard (admin.js): trials started in the period (refused ones apart), what they became, and the share that pays
// among the finished ones. From the subscription rows (an account deleted takes its rows with it).
// kind: 'free' (the 7 free days) or 'offer1' (the 1 € offer, its own price)
export async function trialCounts(env, fromMs, kind = 'free') {
  const offer = offer1Price(env) || '-';
  const r = await env.DB.prepare(`SELECT COUNT(*) AS started,
      SUM(trial_result = 'canceled') AS canceled, SUM(trial_result = 'paid') AS paid, SUM(trial_result = 'failed') AS failed,
      SUM(trial_result IS NULL) AS running
    FROM subscriptions WHERE env = ?1 AND trial_started_at >= ?2 AND COALESCE(trial_result, '') != 'refused'
      AND ${kind === 'offer1' ? 'price_id = ?3' : 'COALESCE(price_id, \'\') != ?3'}`).bind(payEnv(env), fromMs, offer).first().catch(() => null);
  const n = (k) => (r && r[k]) || 0;
  const done = n('canceled') + n('paid') + n('failed');
  return { started: n('started'), canceled: n('canceled'), paid: n('paid'), failed: n('failed'), running: n('running'),
    paidRate: done ? Math.round((n('paid') / done) * 1000) / 10 : null };
}
