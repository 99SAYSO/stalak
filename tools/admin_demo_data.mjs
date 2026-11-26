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
import { paidTests } from '../functions/_lib/paidtest.js';
import { trialStats } from '../functions/_lib/trialstats.js';
import { seedTrials } from '../tests/fixtures/trials-seed.mjs';
import { seedActivation } from '../tests/fixtures/activation-seed.mjs';
import { stepsStats } from '../functions/_lib/activation.js';
import { heardStats } from '../functions/_lib/heard.js';
import { ga4Report, ga4Live } from '../functions/_lib/ga4.js';
import { clarityDaily, clarityView } from '../functions/_lib/clarity.js';
import { fakeAnalyticsFetch } from '../tests/fixtures/analytics-fake.mjs';
import { languages } from '../functions/_lib/admin.js';
import { abandoned } from '../functions/_lib/abandoned.js';
import { fakePaddleTransactions } from '../tests/fixtures/paddle-abandoned-fake.mjs';

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
// « Langue des visiteurs et des abonnés » and « Paiements abandonnés » (25/11): the real code, made-up Paddle answers
out.languages = await languages(env, now);
{
  const penv = { ...env, PADDLE_API_KEY: 'demo_not_real', PADDLE_PRICE_PRO_MONTH: 'pri_pro_m', PADDLE_PRICE_PRO_YEAR: 'pri_pro_y', PADDLE_PRICE_PRO_MONTH_TRIAL: 'pri_pro_m_t', PADDLE_PRICE_PRO_OFFER1: 'pri_of1', PADDLE_PRICE_CREATOR_MONTH: 'pri_cr_m' };
  const realFetch = globalThis.fetch, fake = fakePaddleTransactions(now);
  globalThis.fetch = async (u, i) => (await fake(u, i)) || new Response('{}', { status: 599 });
  out.abandoned = { 7: await abandoned(penv, 7, now), 30: await abandoned(penv, 30, now) };
  globalThis.fetch = realFetch;
}
// « Test payant » (25/11): 2 made-up links, their funnel counters and payments
{
  const db = env.DB.raw, d0 = new Date(now - 6 * 864e5).toISOString().slice(0, 10);
  db.prepare("INSERT INTO paid_tests (ref, label, spent_cents, started_on, updated_at) VALUES ('ttads', 'Publicités TikTok US', 4200, ?, ?), ('inf-demo', '@influenceur_demo', 3000, ?, ?)").run(d0, now, d0, now);
  const b = db.prepare('INSERT INTO daily_counts (day, name, n) VALUES (?, ?, ?) ON CONFLICT(day, name) DO UPDATE SET n = n + excluded.n');
  for (let k = 0; k < 6; k++) {
    const d = new Date(now - k * 864e5).toISOString().slice(0, 10);
    for (const [step, a, c] of [['visit', 61, 17], ['export_ok', 14, 5], ['plans_open', 6, 2], ['checkout_open', 2, 1]]) { b.run(d, 'fs:' + step + ':ref:ttads', Math.max(0, a - k * (step === 'visit' ? 6 : 1))); b.run(d, 'fs:' + step + ':ref:inf-demo', c); }
  }
  const pay = db.prepare("INSERT INTO payments (id, env, user_id, origin, currency, total, tax, billed_at, created_at, source, subscription_id) VALUES (?, 'production', NULL, 'web', 'USD', ?, 0, ?, ?, ?, ?)");
  pay.run('txn_demo_pt1', 799, now - 2 * 864e5, now, 'ref:ttads', 'sub_demo_1'); pay.run('txn_demo_pt2', 0, now - 864e5, now, 'ref:ttads', 'sub_demo_2');
  out.paidTests = await paidTests(env, now);
}
// « Essais Pro » (26/11): made-up trials (tests/fixtures/trials-seed.mjs), the real code
seedTrials(env.DB.raw, now, 'production');
out.trials = await trialStats({ ...env, PADDLE_ENV: 'production' }, now);
// « Du son au wow » and « Comment ils nous ont connus » (26/11): made-up steps and answers, the real code
seedActivation(env.DB.raw, now);
out.steps = {};
for (const d of [7, 30]) for (const dev of ['all', 'ios', 'android', 'desktop']) out.steps[d + ':' + dev] = await stepsStats(env, d, dev, now);
out.heard = await heardStats(env, now);
for (const [k, d] of [['7', 7], ['30', 30], ['90', 90], ['all', 45]]) out.stats[k] = scrub(await stats(env, d, now));
const js = `// MADE-UP figures for the dashboard demo on previews (tools/admin_demo_data.mjs, ${out.generatedAt.slice(0, 10)}). Not real data.\nexport const DEMO_DATA = ${JSON.stringify(out)};\n`;
writeFileSync(join(root, 'functions/_lib/admin-demo-data.js'), js);
console.log('demo data', js.length, 'bytes');
