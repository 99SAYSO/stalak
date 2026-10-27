// Stalak: the 6-month rule of online saving, run once a day by Cloudflare (Cron Trigger).
// Pages Functions have no cron: this small separate Worker shares the D1 database and the R2 bucket of the site and
// calls the same code (functions/_lib/cloud.js): e-mail warning 14 days before, then deletion of the projects not
// opened for 6 months, unfinished uploads and orphan files.
// Deploy (once, from the repository root):  npx wrangler deploy -c workers/cloud-cleanup/wrangler.toml
// Secret for the warning e-mails:           npx wrangler secret put RESEND_API_KEY -c workers/cloud-cleanup/wrangler.toml
// Without this Worker, the same cleanup still runs lazily from the site (at most every 6 hours, see BACKEND.md).
import { cleanupCloud } from '../../functions/_lib/cloud.js';

export default {
  async scheduled(controller, env, ctx) {
    ctx.waitUntil(cleanupCloud(env, Date.now(), { max: 200 }).then((r) => console.log('[stalak] cloud cleanup', JSON.stringify(r))));
  },
};
