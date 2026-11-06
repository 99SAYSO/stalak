// Audit of 6/11, point 12: what is kept no longer than the privacy page says, with a real purge (not only now and then).
// Run with the daily tasks (cloud.js maybeCleanup, at most every 6 hours, and the daily Worker workers/cloud-cleanup).
//   - the thank-you hashes (webhook_events « thanks:… »): 3 years (purgeOldThanks, thanks.js);
//   - the daily use of the automatic lyrics (lyrics_usage): 90 days;
//   - the rate-limit counters (rate_limits: hashed IP addresses and e-mails), expired codes, sessions, devices: 24 hours after
//     their window or their end (ratelimit.js cleanup, which before only ran at random, 5 % of the sign-ins).
import { purgeOldThanks } from './thanks.js';
import { cleanup } from './ratelimit.js';

export const LYRICS_USAGE_KEEP_DAYS = 90;

export async function dailyRetention(env, now = Date.now()) {
  const out = {};
  out.thanks = await purgeOldThanks(env, now).catch(() => null);
  const old = new Date(now - LYRICS_USAGE_KEEP_DAYS * 864e5).toISOString().slice(0, 10);
  const r = await env.DB.prepare('DELETE FROM lyrics_usage WHERE day < ?1').bind(old).run().catch(() => null);
  out.lyricsUsage = r && r.meta ? r.meta.changes || 0 : null;
  out.rateLimits = await cleanup(env, now).then(() => true, () => false);
  return out;
}
