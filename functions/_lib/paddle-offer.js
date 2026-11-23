// Comptes, 23/11 (evening): the Paddle price of the « 1 € » offer, made from the dashboard (« Créer le prix … ») with the
// server's own Paddle key, so nobody has to type a key. Paddle's « paid trial » (2026): a recurring price whose trial has its
// own amount (trial_period.unit_price), card required. Made from the Stalak Pro MONTHLY price on sale (same product, same
// amounts by country, same tax mode), with a 7-day trial at 1 USD, and 1 EUR in the euro countries.
// Once made, its id goes in wrangler.toml (PADDLE_PRICE_PRO_OFFER1) by the Chef de projet. Asking again gives the same price.
import { HttpError } from './http.js';
import { paddleApi } from './paddle.js';

const EURO = ['AT', 'BE', 'CY', 'DE', 'EE', 'ES', 'FI', 'FR', 'GR', 'HR', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'PT', 'SI', 'SK',
  'AD', 'MC', 'SM', 'VA', 'ME', 'XK'];
const MARK = 'stalak_offer1';

export async function createOffer1Price(env) {
  const base = env.PADDLE_PRICE_PRO_MONTH;
  if (!base) throw new HttpError(409, 'not_configured', 'PADDLE_PRICE_PRO_MONTH is not set.');
  const environment = env.PADDLE_ENV === 'production' ? 'production' : 'sandbox';
  const p = (await paddleApi(env, 'GET', `/prices/${encodeURIComponent(base)}`)).data;
  if (!p || !p.product_id) throw new HttpError(502, 'paddle_error', 'Paddle did not give the Pro monthly price.');
  // already made? (the same price again)
  const list = await paddleApi(env, 'GET', `/prices?product_id=${encodeURIComponent(p.product_id)}&status=active&per_page=100`);
  const found = ((list && list.data) || []).find((x) => x && x.custom_data && x.custom_data.stalak === MARK);
  if (found) return { priceId: found.id, existed: true, environment };
  const cur = String((p.unit_price && p.unit_price.currency_code) || 'USD').toUpperCase();
  const body = {
    product_id: p.product_id,
    description: 'Stalak Pro – 7 jours à 1 €, puis mensuel (offre de l’écran de fin)',
    name: 'Stalak Pro — 7 days for 1, then monthly',
    billing_cycle: { interval: 'month', frequency: 1 },
    trial_period: {
      interval: 'day', frequency: 7, requires_payment_method: true,
      unit_price: { amount: '100', currency_code: cur },
      unit_price_overrides: [{ country_codes: EURO, unit_price: { amount: '100', currency_code: 'EUR' } }],
    },
    unit_price: p.unit_price,
    unit_price_overrides: p.unit_price_overrides || [],
    tax_mode: p.tax_mode || 'account_setting',
    quantity: p.quantity || { minimum: 1, maximum: 1 },
    custom_data: { stalak: MARK, plan: 'pro' },
  };
  const made = await paddleApi(env, 'POST', '/prices', body);
  if (!made || !made.data || !made.data.id) throw new HttpError(502, 'paddle_error', 'Paddle did not make the price.');
  return { priceId: made.data.id, existed: false, environment };
}
