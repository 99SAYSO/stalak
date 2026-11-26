// « Where did you hear about Stalak? » (Comptes, 26/11, docs/handoff/chef-question-source.md): the answer of a signed-in account,
// once (App shows the card right after the account is made, or after the 1st video, never again). Many visitors sent by the
// ChatGPT app arrive without any trace (« direct »): asking is the only sure way.
//   POST /api/account/heard {answer, text?} — answer ∈ HEARD; text: the free field of « Other » (60 characters, plain text);
//   « skip » keeps « never asked again » without an answer. The first answer stays (a second call changes nothing).
// Dashboard: « Comment ils nous ont connus » (accounts, trials, paying subscribers per answer, 7 and 30 days).
import { HttpError } from './http.js';
import { payEnv } from './entitlements.js';

export const HEARD = ['chatgpt', 'google', 'other_ai', 'tiktok', 'instagram', 'youtube', 'friend', 'other'];
const clean = (s) => String(s || '').replace(/[\u0000-\u001f\u007f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60);

export async function saveHeard(env, user, b, now = Date.now()) {
  const answer = typeof b.answer === 'string' ? b.answer.trim().toLowerCase() : '';
  if (!(HEARD.includes(answer) || answer === 'skip')) throw new HttpError(400, 'bad_answer', 'Unknown answer.');
  const text = answer === 'other' ? clean(b.text) || null : null;
  const r = await env.DB.prepare('UPDATE users SET heard_from = ?2, heard_text = ?3, heard_at = ?4 WHERE id = ?1 AND heard_at IS NULL')
    .bind(user.id, answer, text, now).run();
  return { saved: !!(r.meta && r.meta.changes), heardAsked: true };
}

// per answer, over 7 and 30 days: new accounts that answered, trials started by them, first real payments by them
export async function heardStats(env, now = Date.now()) {
  const pe = payEnv(env), out = {};
  for (const d of [7, 30]) {
    const from = now - d * 864e5;
    const [a, t, p, n] = await env.DB.batch([
      env.DB.prepare('SELECT heard_from AS k, COUNT(*) AS n FROM users WHERE created_at >= ?1 AND heard_from IS NOT NULL GROUP BY heard_from').bind(from),
      env.DB.prepare(`SELECT u.heard_from AS k, COUNT(DISTINCT s.id) AS n FROM subscriptions s JOIN users u ON u.id = s.user_id
        WHERE s.env = ?1 AND s.trial_started_at >= ?2 AND COALESCE(s.trial_result, '') <> 'refused' AND u.heard_from IS NOT NULL GROUP BY u.heard_from`).bind(pe, from),
      env.DB.prepare(`SELECT u.heard_from AS k, COUNT(DISTINCT p.user_id) AS n FROM payments p JOIN users u ON u.id = p.user_id
        WHERE p.env = ?1 AND p.billed_at >= ?2 AND p.total > 0 AND u.heard_from IS NOT NULL
          AND NOT EXISTS (SELECT 1 FROM payments q WHERE q.user_id = p.user_id AND q.env = ?1 AND q.total > 0 AND q.billed_at < ?2) GROUP BY u.heard_from`).bind(pe, from),
      env.DB.prepare('SELECT COUNT(*) AS n, SUM(heard_at IS NULL) AS unanswered FROM users WHERE created_at >= ?1').bind(from),
    ]);
    const rows = {};
    const add = (res, key) => { for (const r of res.results || []) { rows[r.k] = rows[r.k] || { answer: r.k, accounts: 0, trials: 0, paying: 0 }; rows[r.k][key] = r.n; } };
    add(a, 'accounts'); add(t, 'trials'); add(p, 'paying');
    const order = [...HEARD, 'skip'];
    out['d' + d] = { rows: Object.values(rows).sort((x, y) => (y.accounts - x.accounts) || (order.indexOf(x.answer) - order.indexOf(y.answer))),
      newAccounts: (n.results && n.results[0] && n.results[0].n) || 0, notAnswered: (n.results && n.results[0] && n.results[0].unanswered) || 0 };
  }
  // the « Other » texts of the last 30 days (short, typed by the people): to spot a new source
  const { results } = await env.DB.prepare("SELECT heard_text AS t, COUNT(*) AS n FROM users WHERE heard_from = 'other' AND heard_text IS NOT NULL AND heard_at >= ?1 GROUP BY lower(heard_text) ORDER BY n DESC LIMIT 15")
    .bind(now - 30 * 864e5).all();
  out.otherTexts = results.map((r) => ({ text: r.t, n: r.n }));
  return out;
}
