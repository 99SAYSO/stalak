// Yearly reminder to monthly subscribers (audit of 30/10). The US terms (site_src/en/terms.html, « Reminders ») say:
// « If you're on a monthly plan, we email you a reminder of your subscription once a year. » (Yearly plans: Paddle's
// renewal e-mail.) Run once a day with the 6-month rule: Worker workers/cloud-cleanup, POST /api/cron/cloud-cleanup, or
// lazily from the site (at most every 6 hours).
import { isDev, appOrigin } from './http.js';
import { intervalOf, planOfSub, salePrices, payEnv } from './entitlements.js';

export const YEAR_MS = 365 * 864e5;
const AMOUNTS = { pro: { month: '7.99' }, creator: { month: '14.99' } };   // the prices on sale (router.js config)
const NAMES = { pro: 'Stalak Pro', creator: 'Stalak Creator Plus' };

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function reminderEmail(env, lang, plan, amount, startedAt) {
  const fr = lang === 'fr', name = NAMES[plan] || NAMES.pro, site = appOrigin(env);
  const since = new Date(startedAt).toLocaleDateString(fr ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  const price = amount ? (fr ? `${amount.replace('.', ',')} $ par mois (plus les taxes de ton pays)` : `$${amount} a month (plus your local tax)`)
    : (fr ? 'au prix de ton abonnement, chaque mois' : 'at your subscription price, every month');
  const manage = fr ? `${site}/#compte` : `${site}/en/#account`;
  const lines = fr ? [
    'Bonjour,',
    `Petit rappel annuel : ton abonnement ${name} est actif depuis le ${since}. Il se renouvelle automatiquement chaque mois, ${price}, jusqu’à ce que tu l’arrêtes.`,
    `Pour le garder, tu n’as rien à faire. Pour l’arrêter ou changer de formule : Stalak → menu du compte → Gérer mon abonnement (${manage}). L’arrêt prend effet à la fin du mois déjà payé.`,
    'Une question ? Réponds simplement à cet e-mail ou écris à contact@stalak.app.',
    'On t’envoie ce rappel une fois par an.',
  ] : [
    'Hi,',
    `A yearly reminder: your ${name} subscription has been active since ${since}. It renews automatically every month, ${price}, until you cancel it.`,
    `To keep it, there is nothing to do. To cancel or change plans: Stalak → account menu → Manage my subscription (${manage}). Canceling takes effect at the end of the month you already paid for.`,
    'Questions? Just reply to this email or write to contact@stalak.app.',
    'We send this reminder once a year.',
  ];
  const subject = fr ? `Rappel : ton abonnement ${name}` : `Reminder: your ${name} subscription`;
  const html = `<!doctype html><html lang="${fr ? 'fr' : 'en'}"><body style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#111;padding:24px;max-width:600px">` +
    lines.map((l) => `<p>${esc(l).replace(esc(manage), `<a href="${esc(manage)}">${esc(manage)}</a>`)}</p>`).join('') +
    `<p style="color:#888;font-size:12px">Stalak — <a href="${esc(site)}" style="color:#888">stalak.app</a></p></body></html>`;
  return { subject, text: lines.join('\n\n') + '\n\nStalak — stalak.app', html };
}

async function send(env, to, msg) {
  if (!env.RESEND_API_KEY) {
    if (isDev(env)) { console.log(`[stalak dev] yearly reminder for ${to}: ${msg.subject}`); return true; }
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

// Monthly subscriptions running for a year (or a year since the last reminder): one e-mail each. Returns {reminded}.
export async function yearlyReminders(env, now = Date.now(), { max = 50 } = {}) {
  const out = { reminded: 0 };
  // without the price list (a Worker set up without the Paddle variables), monthly and yearly cannot be told apart: wait
  if (!env.PADDLE_PRICE_PRO_MONTH && !env.PADDLE_PRICE_MONTH) return { reminded: 0, skipped: 'no_prices' };
  const { results } = await env.DB.prepare(
    `SELECT s.*, u.email, u.lang FROM subscriptions s JOIN users u ON u.id = s.user_id
     WHERE s.env = ?1 AND s.status IN ('active', 'past_due') AND s.cancel_at IS NULL AND s.started_at IS NOT NULL
       AND COALESCE(s.reminded_at, s.started_at) <= ?2 ORDER BY s.started_at LIMIT ?3`
  ).bind(payEnv(env), now - YEAR_MS, max).all();
  const sale = salePrices(env);
  for (const s of results) {
    if (intervalOf(env, s.price_id) !== 'month') {
      // yearly plans: Paddle's renewal e-mail; marked as seen so they do not come back every day
      await env.DB.prepare('UPDATE subscriptions SET reminded_at = ?2 WHERE id = ?1').bind(s.id, now).run();
      continue;
    }
    const plan = planOfSub(env, s, now);
    const amount = sale[s.price_id] ? (AMOUNTS[sale[s.price_id].plan] || {}).month : null;
    let ok = false;
    try { ok = await send(env, s.email, reminderEmail(env, s.lang === 'fr' ? 'fr' : 'en', plan, amount, s.started_at)); } catch { ok = false; }
    if (!ok) continue;
    await env.DB.prepare('UPDATE subscriptions SET reminded_at = ?2 WHERE id = ?1').bind(s.id, now).run();
    out.reminded++;
  }
  return out;
}
