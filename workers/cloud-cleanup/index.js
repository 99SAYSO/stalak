// Stalak: the 6-month rule of online saving, run once a day by Cloudflare (Cron Trigger).
// Pages Functions have no cron: this small separate Worker shares the D1 database and the R2 bucket of the site and
// calls the same code (functions/_lib/cloud.js): e-mail warning 14 days before, then deletion of the projects not
// opened for 6 months, unfinished uploads and orphan files.
// Deploy (once, from the repository root):  npx wrangler deploy -c workers/cloud-cleanup/wrangler.toml
// Secret for the warning e-mails:           npx wrangler secret put RESEND_API_KEY -c workers/cloud-cleanup/wrangler.toml
// Without this Worker, the same cleanup still runs lazily from the site (at most every 6 hours, see BACKEND.md).
import { cleanupCloud } from '../../functions/_lib/cloud.js';
import { sendReminders } from '../../functions/_lib/videos.js';

export default {
  async scheduled(controller, env, ctx) {
    // the two daytime triggers send the reminder e-mails of the free video of the day (sent only 10:00-21:00, Paris time)
    if (controller.cron !== '17 3 * * *') {
      ctx.waitUntil(sendReminders(env, Date.now(), { max: 300 }).then((r) => console.log('[stalak] reminders', JSON.stringify(r))));
      return;
    }
    ctx.waitUntil(cleanupCloud(env, Date.now(), { max: 200 }).then((r) => console.log('[stalak] cloud cleanup', JSON.stringify(r))));
  },
};
