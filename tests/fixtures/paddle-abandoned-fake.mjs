// MADE-UP answers of Paddle's GET /transactions (shape of developer.paddle.com, 25/11): the dashboard demo and the tests of
// « Paiements abandonnés » (functions/_lib/abandoned.js). Not real data.
export function fakeTransactions(now = Date.now()) {
  const at = (h) => new Date(now - h * 3600e3).toISOString();
  const tx = (h, status, price, trial, cur, total, tax, country, postal, pays, extra = {}) => ({
    id: 'txn_' + h, status, origin: 'web', created_at: at(h), currency_code: cur, customer_id: 'ctm_x', address_id: country ? 'add_x' : null,
    address: country ? { country_code: country, postal_code: postal } : null, discount_id: null,
    items: [{ price: { id: price, trial_period: trial ? { interval: 'day', frequency: 7 } : null } }],
    details: { totals: { total: String(total), tax: String(tax) } }, payments: pays, customer: { email: 'someone@example.com' }, ...extra });
  return [
    tx(5, 'ready', 'pri_pro_m_t', true, 'USD', 0, 0, 'US', null, []),
    tx(20, 'ready', 'pri_pro_m', false, 'USD', 799, 0, 'US', '10001', [{ status: 'error', error_code: 'authentication_failed', method_details: { type: 'card', card: { last4: '4242' } } }]),
    tx(30, 'draft', 'pri_pro_m_t', true, 'EUR', 0, 0, 'FR', null, []),
    tx(44, 'ready', 'pri_of1', false, 'EUR', 100, 17, 'FR', '81000', [{ status: 'canceled', error_code: null, method_details: { type: 'apple_pay' } }]),
    tx(50, 'completed', 'pri_pro_y', false, 'USD', 4999, 0, 'AU', '2000', [{ status: 'captured', method_details: { type: 'card' } }]),
    tx(200, 'ready', 'pri_cr_m', false, 'USD', 1499, 0, 'CA', null, []),
    tx(400, 'ready', 'pri_pro_m', false, 'USD', 799, 0, 'GB', 'SW1', [{ status: 'error', error_code: 'declined', method_details: { type: 'card' } }]),
  ];
}
export function fakePaddleTransactions(now = Date.now(), log = null) {
  return async (url, init) => {
    url = String(url);
    if (!/^https:\/\/(sandbox-)?api\.paddle\.com\/transactions\?/.test(url)) return null;
    if (log) log.push({ url, auth: init && init.headers && init.headers.Authorization });
    const since = Date.parse(new URL(url).searchParams.get('created_at[GTE]'));
    return Response.json({ data: fakeTransactions(now).filter((t) => Date.parse(t.created_at) >= since), meta: { pagination: { has_more: false, next: null } } });
  };
}
