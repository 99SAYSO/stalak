// MADE-UP step counters, times to the wow and « Where did you hear about Stalak? » answers, for the « Du son au wow » and
// « Comment ils nous ont connus » cards: the dashboard demo (tools/admin_demo_data.mjs) and the tests. Built on the visits and
// accounts already seeded (tests/fixtures/dashboard-seed.mjs); fixed shares, no randomness.
import { STEPS } from '../../functions/_lib/metrics.js';

// share of the step before, per device (the « wow » is lost the most on iPhone, before the 1st take)
const RATES = {
  ios:     { step_song: 0.62, step_passage: 0.81, step_take1: 0.38, step_take3: 0.71, step_preview: 0.86, step_lyrics: 0.34, step_export_start: 0.58, step_export_ok: 0.93 },
  android: { step_song: 0.60, step_passage: 0.80, step_take1: 0.45, step_take3: 0.70, step_preview: 0.84, step_lyrics: 0.30, step_export_start: 0.55, step_export_ok: 0.90 },
  desktop: { step_song: 0.55, step_passage: 0.78, step_take1: 0.52, step_take3: 0.66, step_preview: 0.88, step_lyrics: 0.41, step_export_start: 0.62, step_export_ok: 0.95 },
};
export function seedActivation(db, now = Date.now()) {
  const b = db.prepare('INSERT INTO daily_counts (day, name, n) VALUES (?, ?, ?) ON CONFLICT(day, name) DO UPDATE SET n = n + excluded.n');
  const w = db.prepare('INSERT INTO wow_times (day, device, secs) VALUES (?, ?, ?)');
  const visits = db.prepare('SELECT day, device, COUNT(*) AS n FROM visits WHERE day >= ? GROUP BY day, device').all(new Date(now - 30 * 864e5).toISOString().slice(0, 10));
  let k = 0;
  for (const v of visits) {
    const dev = ['ios', 'android', 'desktop'].includes(v.device) ? v.device : null;
    if (!dev) continue;
    let prev = v.n, preview = 0;
    for (const s of STEPS) {
      const base = s === 'step_export_start' ? preview : prev;
      const n = Math.round(base * RATES[dev][s]);
      b.run(v.day, `st:${s}:${dev}`, n);
      if (s === 'step_preview') preview = n;
      if (s !== 'step_lyrics') prev = n;
    }
    // times to the wow: a spread around 75 s on iPhone, 60 s on a computer
    const mid = dev === 'desktop' ? 60 : dev === 'android' ? 80 : 75;
    for (let i = 0; i < preview; i++) w.run(v.day, dev, Math.max(18, Math.round(mid * (0.45 + ((i * 37 + k * 11) % 100) / 70))));
    k++;
  }
  // answers of the accounts made in the last 30 days (one in 6 never saw the question)
  const order = ['chatgpt', 'tiktok', 'chatgpt', 'google', 'friend', 'instagram', 'skip', 'youtube', 'chatgpt', 'other', 'other_ai', 'tiktok'];
  const texts = ['Reddit', 'un podcast', 'Reddit'];
  const users = db.prepare('SELECT id, created_at FROM users WHERE created_at >= ? ORDER BY created_at').all(now - 30 * 864e5);
  const up = db.prepare('UPDATE users SET heard_from = ?, heard_text = ?, heard_at = ? WHERE id = ?');
  let o = 0;
  users.forEach((u, i) => {
    if (i % 6 === 5) return;
    const a = order[o % order.length];
    up.run(a, a === 'other' ? texts[Math.floor(o / order.length) % texts.length] : null, u.created_at + 90e3, u.id); o++;
  });
}
