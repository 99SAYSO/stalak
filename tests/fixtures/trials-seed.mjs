// MADE-UP free trials and their per-account day counters, for the « Essais Pro » card: the dashboard demo and the tests.
// t(days ago the trial started, result, exports in the first 24 h without watermark?, active days, exports, source, paid twice?)
export function seedTrials(db, now = Date.now(), env = 'production') {
  const H = 3600e3, D = 24 * H, day = (t) => new Date(t).toISOString().slice(0, 10);
  const u = db.prepare("INSERT OR IGNORE INTO users (id, email, display_name, created_at, lang, signup_source) VALUES (?, ?, NULL, ?, 'en', ?)");
  const s = db.prepare(`INSERT INTO subscriptions (id, user_id, customer_id, status, price_id, current_period_end, last_event_at, updated_at, plan, env, started_at,
      trial_started_at, trial_ends_at, trial_result) VALUES (?, ?, 'ctm_tr', ?, 'pri_pro_m_t', ?, ?, ?, 'pro', ?, ?, ?, ?, ?)`);
  const c = db.prepare(`INSERT INTO user_day_counts (user_id, day, name, n, first_at, last_at) VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, day, name) DO UPDATE SET n = n + excluded.n, last_at = MAX(last_at, excluded.last_at)`);
  const p = db.prepare("INSERT INTO payments (id, env, user_id, subscription_id, origin, currency, total, tax, billed_at, created_at) VALUES (?, ?, ?, ?, ?, 'USD', ?, 0, ?, ?)");
  const list = [
    // running
    [0.3, null, true, 1, 2, null], [2.2, null, true, 2, 4, 'ai:chatgpt'], [3.5, null, false, 1, 1, 'ref:ttads'], [5.1, 'canceled', false, 1, 0, null], [6.4, null, true, 4, 9, 'tiktok'],
    // ended
    [9, 'paid', true, 3, 7, 'tiktok'], [10, 'canceled', false, 1, 1, null], [12, 'paid', true, 5, 12, 'ai:chatgpt'], [13, 'failed', true, 2, 3, 'google'],
    [20, 'canceled', true, 2, 2, null], [24, 'paid', true, 4, 6, 'ref:ttads'], [45, 'paid', true, 3, 5, 'tiktok', true], [50, 'paid', false, 2, 2, null, false],
  ];
  list.forEach(([ago, result, nowm, activeDays, exports, src, twice], i) => {
    const id = 'usr_trial_' + i, start = now - ago * D, end = start + 7 * D;
    u.run(id, 'trial' + i + '@demo.stalak', start - H, src);
    s.run('sub_trial_' + i, id, end > now ? 'trialing' : result === 'paid' ? 'active' : result === 'failed' ? 'past_due' : 'canceled', end, now, now, env, start, start, end, result);
    p.run('txn_trial0_' + i, env, id, 'sub_trial_' + i, 'web', 0, start, start);
    if (result === 'paid') p.run('txn_trial1_' + i, env, id, 'sub_trial_' + i, 'subscription_recurring', 799, end, end);
    if (twice) p.run('txn_trial2_' + i, env, id, 'sub_trial_' + i, 'subscription_recurring', 799, end + 30 * D, end + 30 * D);
    const last = Math.min(end, now);
    for (let k = 0; k < activeDays; k++) {
      const t = Math.min(last - 60e3, start + (k === 0 ? 2 * H : k * ((last - start) / Math.max(1, activeDays))) );
      c.run(id, day(t), 'open', 1, t, t);
      const e = k === activeDays - 1 ? exports - Math.floor(exports / activeDays) * (activeDays - 1) : Math.floor(exports / activeDays);
      if (e > 0) { c.run(id, day(t), 'export_ok', e, t + 60e3, t + 120e3); if (nowm || k > 0) c.run(id, day(t), 'export_nowm', e, t + 60e3, t + 120e3); }
    }
  });
}
