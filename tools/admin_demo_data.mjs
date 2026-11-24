// Builds functions/_lib/admin-demo-data.js: MADE-UP figures for the demo of the owner's dashboard shown on branch previews
// (https://<branch>.stalak-site.pages.dev/admin-demo/). The real dashboard code (admin.js) runs on a fake database filled by
// tests/fixtures/dashboard-seed.mjs, so the demo has exactly the shape of the real answers. No real data is ever involved.
// Run: node tools/admin_demo_data.mjs   (again only if the dashboard's data changes)
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createD1 } from '../tests/backend/fake-d1.mjs';
import { seedDashboard } from '../tests/fixtures/dashboard-seed.mjs';
import { stats, home, signupList, hourly, videosPerPerson } from '../functions/_lib/admin.js';
import { ga4Report, ga4Live } from '../functions/_lib/ga4.js';
import { clarityDaily, clarityView } from '../functions/_lib/clarity.js';
import { fakeAnalyticsFetch } from '../tests/fixtures/analytics-fake.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const env = { DB: createD1(join(root, 'migrations')), PADDLE_ENV: 'production', APP_ORIGIN: 'https://stalak.app', EMAIL_DAILY_MAX: '1000',
  TELEGRAM_BOT_TOKEN: '12345:' + 'demo'.repeat(9) };
const now = Date.now();
seedDashboard(env, { now });
env.DB.raw.prepare("INSERT INTO admin_state (key, value, updated_at) VALUES ('telegram_chat', '1', 0), ('telegram_name', 'Démo', 0)").run();
const scrub = (o) => JSON.parse(JSON.stringify(o).replace(/fan\d+_\d+@example\.com/g, (m) => m.replace('@example.com', '@demo.stalak')));
const out = { generatedAt: new Date(now).toISOString(), stats: {}, home: scrub(await home(env, now)), signups: [] };
for (const [k, d] of [['7', 7], ['30', 30], ['90', 90], ['all', 45]]) out.stats[k] = scrub(await stats(env, d, now));
out.videos = { 7: await videosPerPerson(env, '7', now), 30: await videosPerPerson(env, '30', now) };
out.hours = {};
for (const per of ['today', '7', '30']) for (const tz of ['paris', 'ny']) out.hours[per + '_' + tz] = await hourly(env, per, tz, now);
let before = null;
for (let i = 0; i < 3; i++) { const p = await signupList(env, before, 40, now); out.signups.push(scrub(p)); before = p.more; if (!before) break; }
// « Clarity et Google Analytics » (24/11): the real code (ga4.js, clarity.js) on made-up answers (tests/fixtures/analytics-fake.mjs)
{
  const kp = await crypto.subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign']);
  const pemKey = '-----BEGIN PRIVATE KEY-----\n' + Buffer.from(await crypto.subtle.exportKey('pkcs8', kp.privateKey)).toString('base64') + '\n-----END PRIVATE KEY-----\n';
  const aenv = { ...env, GA4_PROPERTY_ID: '565628578', CLARITY_PROJECT_ID: 'zic7crm0mc', CLARITY_API_TOKEN: 'demo-token-not-real',
    GA4_SA_KEY: JSON.stringify({ client_email: 'demo@demo.iam.gserviceaccount.com', private_key: pemKey }) };
  const realFetch = globalThis.fetch, fake = fakeAnalyticsFetch();
  globalThis.fetch = async (u, i) => (await fake(u, i)) || new Response('', { status: 599 });
  for (let k = 13; k >= 0; k--) {
    if (k) { await clarityDaily(aenv, now - k * 864e5); continue; }
    await clarityDaily(aenv, now);
  }
  const visits = { 1: 260, 7: 1720, 30: 7020 };
  out.analytics = {};
  for (const d of [1, 7, 30]) out.analytics[d] = { days: d, ga4: await ga4Report(aenv, d, now), clarity: await clarityView(aenv, now), visits: visits[d] };
  out.analyticsLive = await ga4Live(aenv, now);
  globalThis.fetch = realFetch;
}
const js = `// MADE-UP figures for the dashboard demo on previews (tools/admin_demo_data.mjs, ${out.generatedAt.slice(0, 10)}). Not real data.\nexport const DEMO_DATA = ${JSON.stringify(out)};\n`;
writeFileSync(join(root, 'functions/_lib/admin-demo-data.js'), js);
console.log('demo data', js.length, 'bytes');
