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
  // 7/11: sources of the visits (weights) and how well each one goes on to a video and the plans
  const VSRC = ['tiktok', 'tiktok', 'tiktok', 'tiktok', 'tiktok', 'ig', 'ig', 'yt', 'google', 'google', 'direct', 'direct', 'triller', 'discord', 'ref:wm'];
  const VQ = { tiktok: 1, ig: 0.8, yt: 1.1, google: 1.3, direct: 0.9, triller: 0.6, discord: 1.4, 'ref:wm': 1.2 };
  const insOpt = db.prepare('INSERT INTO email_optins (id, email, lang, consent, token_hash, created_at, confirmed_at) VALUES (?, ?, ?, ?, ?, ?, ?)');
  const insVc = db.prepare('INSERT INTO video_counts (day, vid, name, n, ios) VALUES (?, ?, ?, ?, ?)');
  const bump = db.prepare('INSERT INTO daily_counts (day, name, n) VALUES (?, ?, ?) ON CONFLICT(day, name) DO UPDATE SET n = n + excluded.n');
  // the hour of the day (UTC) people come: evenings in the US (0–4 h UTC) and in France (17–21 h UTC); r in [0, 1) → a time
  const W = [9, 10, 9, 7, 5, 3, 2, 1, 1, 1, 2, 2, 3, 3, 4, 4, 5, 6, 7, 7, 7, 6, 7, 8], WT = W.reduce((a, b) => a + b, 0);
  const atHour = (t, r) => {
    const d0 = Math.floor(t / 864e5) * 864e5; let x = r * WT, h = 0;
    while (h < 23 && x >= W[h]) x -= W[h++];
    const ms = d0 + (h + x / W[h]) * 3600e3;
    return ms <= now ? ms : d0 + (ms - d0) * (now - d0) / 864e5;   // today: never in the future
  };
  const bumpH = db.prepare("INSERT INTO hourly_counts (hour, name, n) VALUES (?, 'export_ok', ?) ON CONFLICT(hour, name) DO UPDATE SET n = n + excluded.n");
  for (let i = 40; i >= 0; i--) {
    const t = now - i * 864e5, d = day(t), grow = 1 + (40 - i) / 14, nv = Math.round((40 + rnd() * 30) * grow);
    const perSrc = {};
    for (let k = 0; k < nv; k++) {
      const c = pick(COUNTRIES);
      const ft = Math.round(atHour(t, rnd())); insV.run(d, 'seed_' + i + '_' + k + '_xxxxxxxx', ft, ft + 60e3, c === 'FR' || c === 'BE' ? 'fr' : 'en', c, pick(DEV), pick(SRC), rnd() < 0.28 ? 1 : 0);
      // 7/11: the anonymous totals per source and country (not from rnd(): the other figures stay the same)
      const vs = VSRC[(i * 7 + k * 3) % VSRC.length];
      bump.run(d, `vs:${vs}:${c}`, 1); perSrc[vs] = (perSrc[vs] || 0) + 1;
    }
    let co = 0;
    for (const [vs, v] of Object.entries(perSrc)) {
      const q = VQ[vs] || 1, vid = Math.round(v * 0.42 * q), pl = Math.round(vid * 0.3 * q), ck = Math.round(pl * 0.35), pd = (i + vs.length) % 4 === 0 && ck ? 1 : 0;
      for (const [step, n] of [['visit', v], ['export_ok', vid], ['plans_open', pl], ['checkout_open', ck], ['checkout_done', pd]]) if (n) bump.run(d, `fs:${step}:${vs}`, n);
      co += ck - pd;
    }
    co = Math.max(0, Math.round(Math.round(nv * 0.42) * 0.05) - 1);   // about the payment windows opened that day (ev_checkout_open), minus a purchase
    for (const [stage, part] of [['start', 0.5], ['details', 0.3], ['payment', 0.2]]) { const n = Math.round(co * part); if (n) bump.run(d, 'ev_checkout_close_' + stage, n); }
    if (i % 3 === 0) insOpt.run('opt_seed' + i, `tips${i}@demo.stalak`, i % 2 ? 'fr' : 'en', 'v1-2026-11-07', 'h' + i, t, i % 9 === 0 ? null : t + 3600e3);
    const ns = Math.round(nv * (0.05 + rnd() * 0.03));
    for (let k = 0; k < ns; k++) {
      const c = pick(COUNTRIES);
      insU.run('u_seed' + i + '_' + k, `fan${i}_${k}@example.com`, c === 'FR' ? 'fr' : 'en', Math.round(atHour(t, ((i * 37 + k * 101) % 97) / 97)), t, t, c, pick(DEV), rnd() < 0.62 ? 'email' : 'google',
        pick([['tiktok', 30], ['ig', 14], ['yt', 8], ['google', 12], ['direct', 16], ['ref:tiktok', 6], ['ref:ytshort', 4], ['dir:alternativeto', 3], ['dir:saashub', 2], ['site:reddit.com', 2], [null, 3]]));
      if ((i * 7 + k) % 5) setName.run(NAMES[(i * 3 + k) % NAMES.length], 'u_seed' + i + '_' + k);
      // some come back a few days later (a new session)
      if (i > 3 && rnd() < 0.3) db.prepare("INSERT OR IGNORE INTO sessions (token_hash, user_id, created_at, expires_at, method) VALUES (?, ?, ?, ?, 'password')").run('seedsess' + i + '_' + k, 'u_seed' + i + '_' + k, t + 3 * 864e5, t + 60 * 864e5);
    }
    const ex = Math.round(nv * 0.42), fail = Math.round(ex * 0.06);
    // videos per person (vid, no account): most make 1, some 2, a few 3 to 5; about 45 % on an iPhone; the same for the ad
    for (const [name, total] of [['export_ok', ex], ['ad_ok', Math.round(ex * 0.2)]]) {
      for (let left = total, p = 0; left > 0; p++) {
        const m = (i * 7 + p * 13) % 20, n = Math.min(left, m < 12 ? 1 : m < 17 ? 2 : 3 + (m % 3));
        insVc.run(d, (name === 'ad_ok' ? 'a' : 'e') + String(i).padStart(3, '0') + String(p).padStart(20, '0').slice(-20), name, n, (i + p * 3) % 20 < 9 ? 1 : 0);
        left -= n;
      }
    }
    // the exports by hour (the same shape as the visits)
    for (let h = 0; h < 24; h++) { const ms = Math.floor(t / 864e5) * 864e5 + h * 3600e3, n = Math.round(ex * W[h] / WT); if (n && ms <= now) bumpH.run(Math.floor(ms / 3600e3), n); }
    [['ev_export_start', ex + fail], ['ev_export_ok', ex], ['ev_export_fail', fail], ['ev_export_fail_memory', Math.ceil(fail / 2)], ['ev_export_fail_hidden', Math.floor(fail / 2)],
      ['ev_pro_offer', Math.round(ex * 0.7)], ['ev_ad_offer', Math.round(ex * 0.3)], ['ev_ad_shown', Math.round(ex * 0.24)], ['ev_ad_ok', Math.round(ex * 0.2)],
      ['ev_plans_open', Math.round(ex * 0.16)], ['ev_plans_why_clip', Math.round(ex * 0.05)], ['ev_plans_why_filters', Math.round(ex * 0.04)], ['ev_plans_why_pack', Math.round(ex * 0.03)],
      ['ev_plans_why_wm', Math.round(ex * 0.04)], ['ev_checkout_open', Math.round(ex * 0.05)], ['code_mail', ns + Math.round(rnd() * 4)], ['help_q', Math.round(rnd() * 12)],
      ['err_5xx', rnd() < 0.15 ? 1 : 0]].forEach(([n, v]) => { if (v) bump.run(d, n, v); });
    // (7/11) the failed exports in detail (metrics.js EXPORT_X), made up: mostly iPhones, out of memory or left during the export
    { const mem = Math.ceil(fail / 2), hid = Math.floor(fail / 2), iosF = Math.round(fail * 0.7), andF = Math.round(fail * 0.2), desk = fail - iosF - andF;
      const starts = ex + fail, iosS = Math.round(starts * 0.45), andS = Math.round(starts * 0.2);
      [['ev_xs_ios', iosS], ['ev_xs_android', andS], ['ev_xs_desktop', starts - iosS - andS], ['ev_xo_ios', iosS - iosF], ['ev_xo_android', andS - andF], ['ev_xo_desktop', starts - iosS - andS - desk],
        ['ev_xf_dev_ios', iosF], ['ev_xf_dev_android', andF], ['ev_xf_dev_desktop', desk], ['ev_xf_ios_memory', Math.min(iosF, mem)], ['ev_xf_ios_hidden', Math.max(0, iosF - mem)],
        ['ev_xf_android_hidden', andF], ['ev_xf_desktop_memory', Math.max(0, mem - iosF)], ['ev_xf_desktop_hidden', Math.max(0, desk - Math.max(0, mem - iosF))],
        ['ev_xf_st_frames', Math.round(fail * 0.6)], ['ev_xf_st_prepare', Math.round(fail * 0.25)], ['ev_xf_st_assemble', fail - Math.round(fail * 0.6) - Math.round(fail * 0.25)],
        ['ev_xf_fmt_916', fail - Math.round(fail * 0.15)], ['ev_xf_fmt_169', Math.round(fail * 0.15)], ['ev_xf_kind_one', fail - Math.round(fail * 0.3)], ['ev_xf_kind_pack', Math.round(fail * 0.3)],
        ['ev_xf_path_wc', fail], ['ev_xf_dur_d30', Math.round(fail * 0.5)], ['ev_xf_dur_d60', fail - Math.round(fail * 0.5)], ['ev_xf_took_t30', Math.round(fail * 0.4)], ['ev_xf_took_t60', fail - Math.round(fail * 0.4)],
        ['ev_xf_mem_unk', iosF], ['ev_xf_mem_m4', andF], ['ev_xf_mem_m8', desk],
        ['ev_export_retry_hidden', Math.round(fail * 0.8)], ['ev_export_retry_memory', Math.round(fail * 0.5)], ['ev_export_saved_hidden', Math.round(fail * 0.7)], ['ev_export_saved_memory', Math.round(fail * 0.3)],
        ['ev_export_refused_memory', Math.round(fail * 0.2)],
        ['ev_xs_kind_clip', Math.round(starts * 0.18)], ['ev_xo_kind_clip', Math.round(starts * 0.16)], ['ev_xs_kind_reel', starts - Math.round(starts * 0.18)], ['ev_xo_kind_reel', ex - Math.round(starts * 0.16)],
        ['ev_clip_ask_pro', Math.round(ex * 0.03)], ['ev_clip_ask_reel', Math.round(ex * 0.05)], ['ev_clip_ask_none', Math.round(ex * 0.02)]].forEach(([n, v]) => { if (v > 0) bump.run(d, n, v); }); }
    const paid = rnd() < 0.55 ? 1 + Math.round(rnd()) : 0;
    for (let k = 0; k < paid; k++) {
      const uid = 'u_seed' + i + '_' + k, plan = rnd() < 0.7 ? 'pro' : 'creator', year = rnd() < 0.35;
      const price = env['PADDLE_PRICE_' + plan.toUpperCase() + '_' + (year ? 'YEAR' : 'MONTH')] || 'pri_seed';
      db.prepare("INSERT OR IGNORE INTO subscriptions (id, user_id, customer_id, status, price_id, current_period_end, cancel_at, last_event_at, updated_at, plan, env, started_at) VALUES (?, ?, ?, 'active', ?, ?, ?, ?, ?, ?, ?, ?)")
        .run('sub_seed' + i + k, uid, 'ctm_seed' + i + k, price, t + (year ? 365 : 30) * 864e5, rnd() < 0.12 ? t + 30 * 864e5 : null, t, t, plan, PE, Math.round(atHour(t, ((i * 53 + k * 29) % 89) / 89)));
      const cents = plan === 'pro' ? (year ? 4999 : 799) : (year ? 9999 : 1499);
      db.prepare("INSERT OR IGNORE INTO payments (id, user_id, subscription_id, price_id, origin, currency, total, tax, earnings, billed_at, created_at, env) VALUES (?, ?, ?, ?, 'web', 'USD', ?, 0, ?, ?, ?, ?)")
        .run('txn_seed' + i + k, uid, 'sub_seed' + i + k, price, cents, Math.round(cents * 0.9), t, t, PE);
      bump.run(d, 'paid_first', 1);
    }
  }
  db.prepare("UPDATE subscriptions SET status = 'canceled', updated_at = ? WHERE id IN (SELECT id FROM subscriptions WHERE id LIKE 'sub_seed%' LIMIT 3)").run(now - 3 * 864e5);
}
