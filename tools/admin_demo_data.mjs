// Builds functions/_lib/admin-demo-data.js: MADE-UP figures for the demo of the owner's dashboard shown on branch previews
// (https://<branch>.stalak-site.pages.dev/admin-demo/). The real dashboard code (admin.js) runs on a fake database filled by
// tests/fixtures/dashboard-seed.mjs, so the demo has exactly the shape of the real answers. No real data is ever involved.
// Run: node tools/admin_demo_data.mjs   (again only if the dashboard's data changes)
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createD1 } from '../tests/backend/fake-d1.mjs';
import { seedDashboard } from '../tests/fixtures/dashboard-seed.mjs';
import { stats, home, signupList } from '../functions/_lib/admin.js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const env = { DB: createD1(join(root, 'migrations')), PADDLE_ENV: 'production', APP_ORIGIN: 'https://stalak.app', EMAIL_DAILY_MAX: '1000',
  TELEGRAM_BOT_TOKEN: '12345:' + 'demo'.repeat(9) };
const now = Date.now();
seedDashboard(env, { now });
env.DB.raw.prepare("INSERT INTO admin_state (key, value, updated_at) VALUES ('telegram_chat', '1', 0), ('telegram_name', 'Démo', 0)").run();
const scrub = (o) => JSON.parse(JSON.stringify(o).replace(/fan\d+_\d+@example\.com/g, (m) => m.replace('@example.com', '@demo.stalak')));
const out = { generatedAt: new Date(now).toISOString(), stats: {}, home: scrub(await home(env, now)), signups: [] };
for (const [k, d] of [['7', 7], ['30', 30], ['90', 90], ['all', 45]]) out.stats[k] = scrub(await stats(env, d, now));
let before = null;
for (let i = 0; i < 3; i++) { const p = await signupList(env, before, 40, now); out.signups.push(scrub(p)); before = p.more; if (!before) break; }
const js = `// MADE-UP figures for the dashboard demo on previews (tools/admin_demo_data.mjs, ${out.generatedAt.slice(0, 10)}). Not real data.\nexport const DEMO_DATA = ${JSON.stringify(out)};\n`;
writeFileSync(join(root, 'functions/_lib/admin-demo-data.js'), js);
console.log('demo data', js.length, 'bytes');
