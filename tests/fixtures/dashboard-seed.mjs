// Made-up figures for the owner's dashboard: screenshots (tests/ui/server.mjs, /__test/seed-dashboard) and the demo page of
// previews (tools/admin_demo_data.mjs). 40 days of visits, accounts from several countries and sources, exports, ads,
// subscriptions and payments. Never used with real data.
export function seedDashboard(env, { now = Date.now() } = {}) {
  const db = env.DB.raw, day = (ms) => new Date(ms).toISOString().slice(0, 10);
  for (const [k, v] of [['PADDLE_PRICE_PRO_MONTH', 'pri_pro_m'], ['PADDLE_PRICE_PRO_YEAR', 'pri_pro_y'], ['PADDLE_PRICE_CREATOR_MONTH', 'pri_cr_m'], ['PADDLE_PRICE_CREATOR_YEAR', 'pri_cr_y']]) if (!env[k]) env[k] = v;
  const PE = env.PADDLE_ENV === 'production' ? 'production' : 'sandbox';
  let seed = 7; const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  const pick = (arr) => { const t = arr.reduce((a, x) => a + x[1], 0); let r = rnd() * t; for (const [v, w] of arr) { if ((r -= w) <= 0) return v; } return arr[0][0]; };
  const COUNTRIES = [['US', 46], ['FR', 14], ['GB', 7], ['CA', 6], ['DE', 4], ['BR', 4], ['MX', 3], ['NG', 3], ['AU', 2], ['BE', 2], ['IN', 3], ['JP', 1], [null, 3]];
  const DEV = [['ios', 55], ['android', 25], ['desktop', 20]], SRC = [['tiktok', 34], ['ig', 18], ['google', 16], [null, 22], ['yt', 5], ['reddit', 3], ['other', 2]];
  const insV = db.prepare('INSERT OR IGNORE INTO visits (day, vid, first_at, last_at, lang, country, device, source, came_back) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
  const insU = db.prepare('INSERT OR IGNORE INTO users (id, email, lang, created_at, last_login_at, email_verified_at, country, device, signup_method, signup_source) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  // made-up pseudos (a few accounts have none: shown « — »); not from rnd(), so the other figures stay the same
  const NAMES = ['lilnova', 'beatsbyjay', 'Mira K', 'drill.fr', 'kaïa', 'yungwave', 'Sami', 'noctis', 'Lou B', 'prodbymax', 'zoé', 'blkcherry'];
  const setName = db.prepare('UPDATE users SET display_name = ? WHERE id = ?');
  const bump = db.prepare('INSERT INTO daily_counts (day, name, n) VALUES (?, ?, ?) ON CONFLICT(day, name) DO UPDATE SET n = n + excluded.n');
  for (let i = 40; i >= 0; i--) {
    const t = now - i * 864e5, d = day(t), grow = 1 + (40 - i) / 14, nv = Math.round((40 + rnd() * 30) * grow);
    for (let k = 0; k < nv; k++) {
      const c = pick(COUNTRIES);
      const ft = t - Math.round(rnd() * 20 * 3600e3); insV.run(d, 'seed_' + i + '_' + k + '_xxxxxxxx', ft, ft + 60e3, c === 'FR' || c === 'BE' ? 'fr' : 'en', c, pick(DEV), pick(SRC), rnd() < 0.28 ? 1 : 0);
    }
    const ns = Math.round(nv * (0.05 + rnd() * 0.03));
    for (let k = 0; k < ns; k++) {
      const c = pick(COUNTRIES);
      insU.run('u_seed' + i + '_' + k, `fan${i}_${k}@example.com`, c === 'FR' ? 'fr' : 'en', t - k * 6e4, t, t, c, pick(DEV), rnd() < 0.62 ? 'email' : 'google',
        pick([['tiktok', 30], ['ig', 14], ['yt', 8], ['google', 12], ['direct', 16], ['ref:tiktok', 6], ['ref:ytshort', 4], ['dir:alternativeto', 3], ['dir:saashub', 2], ['site:reddit.com', 2], [null, 3]]));
      if ((i * 7 + k) % 5) setName.run(NAMES[(i * 3 + k) % NAMES.length], 'u_seed' + i + '_' + k);
      // some come back a few days later (a new session)
      if (i > 3 && rnd() < 0.3) db.prepare("INSERT OR IGNORE INTO sessions (token_hash, user_id, created_at, expires_at, method) VALUES (?, ?, ?, ?, 'password')").run('seedsess' + i + '_' + k, 'u_seed' + i + '_' + k, t + 3 * 864e5, t + 60 * 864e5);
    }
    const ex = Math.round(nv * 0.42), fail = Math.round(ex * 0.06);
    [['ev_export_start', ex + fail], ['ev_export_ok', ex], ['ev_export_fail', fail], ['ev_export_fail_memory', Math.ceil(fail / 2)], ['ev_export_fail_hidden', Math.floor(fail / 2)],
      ['ev_pro_offer', Math.round(ex * 0.7)], ['ev_ad_offer', Math.round(ex * 0.3)], ['ev_ad_shown', Math.round(ex * 0.24)], ['ev_ad_ok', Math.round(ex * 0.2)],
      ['ev_plans_open', Math.round(ex * 0.16)], ['ev_plans_why_clip', Math.round(ex * 0.05)], ['ev_plans_why_filters', Math.round(ex * 0.04)], ['ev_plans_why_pack', Math.round(ex * 0.03)],
      ['ev_plans_why_wm', Math.round(ex * 0.04)], ['ev_checkout_open', Math.round(ex * 0.05)], ['code_mail', ns + Math.round(rnd() * 4)], ['help_q', Math.round(rnd() * 12)],
      ['err_5xx', rnd() < 0.15 ? 1 : 0]].forEach(([n, v]) => { if (v) bump.run(d, n, v); });
    const paid = rnd() < 0.55 ? 1 + Math.round(rnd()) : 0;
    for (let k = 0; k < paid; k++) {
      const uid = 'u_seed' + i + '_' + k, plan = rnd() < 0.7 ? 'pro' : 'creator', year = rnd() < 0.35;
      const price = env['PADDLE_PRICE_' + plan.toUpperCase() + '_' + (year ? 'YEAR' : 'MONTH')] || 'pri_seed';
      db.prepare("INSERT OR IGNORE INTO subscriptions (id, user_id, customer_id, status, price_id, current_period_end, cancel_at, last_event_at, updated_at, plan, env, started_at) VALUES (?, ?, ?, 'active', ?, ?, ?, ?, ?, ?, ?, ?)")
        .run('sub_seed' + i + k, uid, 'ctm_seed' + i + k, price, t + (year ? 365 : 30) * 864e5, rnd() < 0.12 ? t + 30 * 864e5 : null, t, t, plan, PE, t);
      const cents = plan === 'pro' ? (year ? 4999 : 799) : (year ? 9999 : 1499);
      db.prepare("INSERT OR IGNORE INTO payments (id, user_id, subscription_id, price_id, origin, currency, total, tax, earnings, billed_at, created_at, env) VALUES (?, ?, ?, ?, 'web', 'USD', ?, 0, ?, ?, ?, ?)")
        .run('txn_seed' + i + k, uid, 'sub_seed' + i + k, price, cents, Math.round(cents * 0.9), t, t, PE);
      bump.run(d, 'paid_first', 1);
    }
  }
  db.prepare("UPDATE subscriptions SET status = 'canceled', updated_at = ? WHERE id IN (SELECT id FROM subscriptions WHERE id LIKE 'sub_seed%' LIMIT 3)").run(now - 3 * 864e5);
}
