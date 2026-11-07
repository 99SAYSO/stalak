// The owner's dashboard page (admin.stalak.app/admin/), sent by functions/admin/[[path]].js only after the Cloudflare Access
// check (admin.js). It holds no data: it reads /api/admin/* (same checks). __NONCE__ is replaced per request (CSP).
// New dashboard (owner's request of 1/11): Stalak's style made calmer (light cards, ink outline, big figures, brand blue),
// 6 tabs (Aujourd'hui, Utilisateurs, Argent, Entonnoir, Messages, Santé), every figure explained in one plain sentence,
// a period switch (7 d, 30 d, 90 d, all), a world map by country, test figures (Paddle sandbox) marked « TEST ».
// Charts follow the dataviz rules: one measure per chart (no second axis), one hue (the brand blue) for magnitude, a
// sequential blue ramp for the map, labelled bar lists instead of many colours, rounded data-ends, tooltips, a table view.
// Written with String.raw: no backtick and no dollar-brace inside.
import { COUNTRY_NAMES_FR } from './admin-map.js';
import { GLOBE_LIBS, WORLD_TOPO } from './admin-globe.js';
import { DEMO_DATA } from './admin-demo-data.js';

const PAGE = String.raw`<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Stalak · tableau de bord</title>
<link rel="icon" type="image/png" href="/icons/icon-192.png">
<style nonce="__NONCE__">
@font-face{font-family:Lilita;src:url(/fonts/lilitaone.ttf) format("truetype");font-display:swap}
@font-face{font-family:Rubik;src:url(/fonts/rubik.ttf) format("truetype");font-weight:300 900;font-display:swap}
:root{color-scheme:light;--sky:#1f6fd6;--sky-deep:#1a64c8;--bg:#eef5fd;--card:#ffffff;--sunk:#f3f8ff;--ink:#0a0d14;--text:#0a0d14;--text2:#3f5170;--muted:#6b7a92;--line:#dbe5f2;
  --series:#1f6fd6;--series-2:#a9cdf5;--me:#dcebff;--them:#ffffff;--good:#0f7a3a;--good-bg:#e3f6ea;--warn:#9a5200;--warn-bg:#fff2dc;--bad:#b42318;--bad-bg:#fde8e6;--test:#7a3e00;--test-bg:#ffe7b8;
  --m0:#e7edf5;--m1:#cfe2fb;--m2:#9ac4f3;--m3:#5d9fe6;--m4:#2a78d6;--m5:#0f4c9e}
@media (prefers-color-scheme:dark){:root{color-scheme:dark;--bg:#0c1220;--card:#141b2a;--sunk:#101727;--ink:#2f3b52;--text:#eef3fb;--text2:#b9c6da;--muted:#8796ad;--line:#26314a;
  --series:#4f97ec;--series-2:#2a4a75;--me:#1d3150;--them:#182235;--good:#5fd38d;--good-bg:#173323;--warn:#f0b44c;--warn-bg:#3a2c12;--bad:#ff8a80;--bad-bg:#3d1c19;--test:#ffd28a;--test-bg:#4a3410;
  --m0:#1d2638;--m1:#1d3a63;--m2:#245594;--m3:#2f74c4;--m4:#5097ea;--m5:#9cc8ff}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--text);font:15px/1.45 Rubik,system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
button,input,select,textarea{font:inherit;color:inherit}
h1,h2,h3{font-family:Lilita,Rubik,system-ui,sans-serif;font-weight:400;letter-spacing:.01em;margin:0}
h2{font-size:21px;margin-bottom:4px}h3{font-size:17px;margin-bottom:6px}
.top{background:var(--sky);color:#fff;border-bottom:3px solid #0a0d14}
.top .in{max-width:1200px;margin:0 auto;padding:12px 16px;display:flex;flex-wrap:wrap;align-items:center;gap:10px 16px}
.brand{display:flex;align-items:center;gap:10px}
.brand img{width:38px;height:38px;display:block}
.brand h1{font-size:24px;color:#fff}
.who{font-size:13px;opacity:.9}
.sp{flex:1}
.switch{display:flex;align-items:center;gap:10px;background:#fff;color:#0a0d14;border:2px solid #0a0d14;border-radius:999px;padding:5px 14px 5px 8px;cursor:pointer;user-select:none;font-size:14px}
.switch input{appearance:none;width:42px;height:24px;border-radius:999px;background:#c9d3e0;position:relative;margin:0;cursor:pointer;transition:background .15s}
.switch input::after{content:"";position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.3);transition:left .15s}
.switch input:checked{background:#0f7a3a}.switch input:checked::after{left:21px}
.switch input:focus-visible{outline:3px solid #fff;outline-offset:2px}
.pill{display:inline-flex;align-items:center;gap:6px;font-size:13px;padding:3px 10px;border-radius:999px;background:var(--line);color:var(--text2)}
.top .pill{background:rgba(255,255,255,.18);color:#fff}
.pill.on{background:var(--good-bg);color:var(--good)}.top .pill.on{background:#d9f5e4;color:#0b5a33}
.pill.warn{background:var(--warn-bg);color:var(--warn)}
.dot{width:8px;height:8px;border-radius:50%;background:currentColor;display:inline-block}
.wrap{max-width:1200px;margin:0 auto;padding:14px 16px 40px}
.bar{display:flex;flex-wrap:wrap;align-items:center;gap:10px 14px;margin-bottom:12px}
.tabs{display:flex;gap:6px;overflow-x:auto;padding:2px 2px 6px;margin:0 -2px 12px;scrollbar-width:thin}
.tab{flex:none;border:2px solid var(--ink);background:var(--card);border-radius:14px;padding:8px 14px;cursor:pointer;font-weight:600;display:inline-flex;align-items:center;gap:7px;color:var(--text)}
.tab[aria-selected="true"]{background:var(--ink);color:#fff;border-color:var(--ink)}
@media (prefers-color-scheme:dark){.tab[aria-selected="true"]{background:var(--series);border-color:var(--series);color:#04101f}}
.tab:focus-visible,.seg button:focus-visible,.btn:focus-visible{outline:3px solid var(--sky);outline-offset:2px}
.tab .badge{margin-left:2px}
.seg{display:inline-flex;border:2px solid var(--ink);border-radius:12px;overflow:hidden;background:var(--card)}
.seg button{border:0;background:transparent;padding:6px 12px;cursor:pointer;color:var(--text)}
.seg button[aria-pressed="true"]{background:var(--ink);color:#fff}
@media (prefers-color-scheme:dark){.seg button[aria-pressed="true"]{background:var(--series);color:#04101f}}
.test[hidden]{display:none}.test{display:inline-flex;align-items:center;gap:6px;background:var(--test-bg);color:var(--test);border-radius:8px;padding:2px 8px;font-size:12px;font-weight:800;letter-spacing:.06em}
.testnote{display:none;background:var(--test-bg);color:var(--test);border-radius:14px;padding:10px 14px;margin-bottom:12px;font-size:14px}
.testnote.show{display:block}
.banner{display:none;background:var(--bad-bg);color:var(--bad);border:2px solid var(--bad);border-radius:14px;padding:10px 14px;margin-bottom:14px}
.banner.show{display:block}
.panel[hidden]{display:none}
.intro{color:var(--text2);margin:2px 0 14px;max-width:760px}
.card{background:var(--card);border:2px solid var(--ink);border-radius:20px;padding:16px;margin-bottom:14px;min-width:0;box-shadow:0 4px 0 var(--ink)}
@media (prefers-color-scheme:dark){.card,.kpi{box-shadow:none}}
.card .head{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px 12px;margin-bottom:8px}
.card .head p{margin:0;color:var(--text2);font-size:13.5px;flex-basis:100%}
.grid2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
.grid3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}
.grid2>.card,.grid3>.card{margin-bottom:0}
.kpis{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px;margin-bottom:14px}
.kpi{background:var(--card);border:2px solid var(--ink);border-radius:18px;padding:12px 14px;min-width:0;box-shadow:0 3px 0 var(--ink);display:flex;flex-direction:column}
.kpi .k{font-size:13.5px;font-weight:600;color:var(--text2);display:flex;gap:6px;align-items:center;flex-wrap:wrap}
.kpi .v{font-family:Lilita,Rubik,sans-serif;font-size:36px;line-height:1.1;margin:4px 0 2px;font-variant-numeric:tabular-nums;overflow-wrap:anywhere}
.kpi .d{font-size:13px;color:var(--text2);margin-top:auto}
.kpi .e{font-size:12.5px;color:var(--muted);margin-top:4px}
.row{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px}
.btn{border:2px solid var(--ink);background:var(--card);border-radius:12px;padding:6px 14px;cursor:pointer;color:var(--text)}
.btn.primary{background:var(--ink);color:#fff}.btn:disabled{opacity:.5;cursor:default}
.btn.small{padding:3px 10px;font-size:13px}.btn.danger{color:var(--bad);border-color:var(--bad)}
.charts{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:12px}
.chart{border:1px solid var(--line);border-radius:14px;padding:10px 12px 6px;position:relative;min-width:0;background:var(--card)}
.chart .t{display:flex;justify-content:space-between;gap:8px;font-size:13.5px}
.chart .t b{font-weight:600}.chart .t span{color:var(--text2);font-variant-numeric:tabular-nums;white-space:nowrap}
.chart .x{font-size:12px;color:var(--muted);margin:2px 0 0}
.chart svg{display:block;width:100%;height:auto;margin-top:6px;overflow:visible}
.ax{fill:var(--muted);font-size:10px}
.gridl{stroke:var(--line);stroke-width:1}
.barm{fill:var(--series)}
.hit{fill:transparent;cursor:crosshair}
.barm.on{opacity:.7}
.tip{position:absolute;pointer-events:none;background:#0a0d14;color:#fff;font-size:12.5px;padding:5px 9px;border-radius:8px;white-space:nowrap;transform:translate(-50%,-110%);display:none;z-index:3}
.table-wrap{overflow-x:auto;margin-top:12px;display:none}.table-wrap.show{display:block}
table{border-collapse:collapse;width:100%;font-size:13.5px;font-variant-numeric:tabular-nums}
th,td{padding:6px 8px;border-bottom:1px solid var(--line);text-align:right;white-space:nowrap}
th:first-child,td:first-child{text-align:left}
th{color:var(--text2);font-weight:600}
.scroll-x{overflow-x:auto}
.blist{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:7px}
.blist li{display:grid;grid-template-columns:minmax(0,9.5em) minmax(0,1fr) auto;gap:10px;align-items:center;font-size:14px}
.blist .nm{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.blist .tr{height:14px;background:var(--sunk);border-radius:99px;overflow:hidden}
.blist .tr i{display:block;height:100%;background:var(--series);border-radius:99px;min-width:3px}
.blist .n{font-variant-numeric:tabular-nums;color:var(--text2);white-space:nowrap}
.blist .n b{color:var(--text)}
.empty{color:var(--muted);padding:14px;text-align:center}
.map{position:relative}
.map svg{display:block;width:100%;height:auto}
.map path{stroke:var(--card);stroke-width:.6;fill:var(--m0)}
.map path.has{cursor:pointer}
.map path:hover{stroke:var(--ink);stroke-width:1.2}
.legend{display:flex;align-items:center;gap:8px;font-size:12.5px;color:var(--text2);flex-wrap:wrap;margin-top:6px}
.legend .sw{display:inline-flex;border-radius:6px;overflow:hidden;border:1px solid var(--line)}
.legend .sw i{width:26px;height:12px;display:block}
.funnel{display:flex;flex-direction:column;gap:10px}
.fstep{display:grid;grid-template-columns:minmax(0,13em) minmax(0,1fr) 8.5em;gap:12px;align-items:center}
.fstep .lab b{display:block;font-size:14.5px}.fstep .lab small{color:var(--muted);font-size:12.5px}
.fstep .tr{height:30px;background:var(--sunk);border-radius:10px;overflow:hidden;position:relative}
.fstep .tr i{display:block;height:100%;background:var(--series);border-radius:10px;min-width:4px}
.fstep .tr span{position:absolute;left:10px;top:50%;transform:translateY(-50%);font-weight:700;font-variant-numeric:tabular-nums;color:var(--text);text-shadow:0 0 3px var(--card)}
.fstep .rate{text-align:right;font-variant-numeric:tabular-nums;font-weight:700}
.fstep .rate small{display:block;font-weight:400;color:var(--muted);font-size:11.5px}
.meter{height:12px;border-radius:99px;background:var(--sunk);overflow:hidden;margin:6px 0 4px;border:1px solid var(--line)}
.meter i{display:block;height:100%;background:var(--series);border-radius:99px}
.meter.warn i{background:var(--warn)}.meter.bad i{background:var(--bad)}
.lim b{font-size:15px}.lim .v{font-family:Lilita,Rubik,sans-serif;font-size:26px;font-variant-numeric:tabular-nums}
.lim p{margin:0;color:var(--text2);font-size:13.5px}
.status{display:inline-flex;align-items:center;gap:6px;font-size:13px;font-weight:700;padding:2px 9px;border-radius:99px}
.status.ok{background:var(--good-bg);color:var(--good)}.status.warn{background:var(--warn-bg);color:var(--warn)}.status.bad{background:var(--bad-bg);color:var(--bad)}
.support{display:grid;grid-template-columns:minmax(0,320px) minmax(0,1fr);gap:12px;min-height:420px}
.tlist{border:1px solid var(--line);border-radius:14px;overflow:auto;max-height:560px}
.tlist button{display:block;width:100%;text-align:left;border:0;border-bottom:1px solid var(--line);background:none;padding:10px 12px;cursor:pointer;color:var(--text)}
.tlist button:hover{background:var(--sunk)}.tlist button[aria-current="true"]{background:var(--me)}
.tlist .l1{display:flex;gap:6px;align-items:center;font-size:13.5px}
.tlist .l1 b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1}
.tlist .l2{color:var(--text2);font-size:12.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.badge{background:var(--bad);color:#fff;border-radius:99px;font-size:11px;padding:1px 7px;font-weight:700}
.pro{background:var(--ink);color:#fff;border-radius:6px;font-size:11px;padding:1px 6px;font-weight:700;letter-spacing:.03em}
.pro.off{background:var(--line);color:var(--text2)}
.conv{border:1px solid var(--line);border-radius:14px;display:flex;flex-direction:column;min-height:420px;min-width:0}
.conv .head{padding:10px 12px;border-bottom:1px solid var(--line);display:flex;flex-wrap:wrap;gap:6px 10px;align-items:center;margin:0}
.conv .head b{overflow-wrap:anywhere}
.conv .info{padding:6px 12px;border-bottom:1px solid var(--line);font-size:12.5px;color:var(--text2)}
.conv .info pre{white-space:pre-wrap;overflow-wrap:anywhere;font-size:11.5px;max-height:180px;overflow:auto;background:var(--sunk);padding:8px;border-radius:8px}
.msgs{flex:1;overflow:auto;padding:12px;display:flex;flex-direction:column;gap:8px;max-height:460px}
.m{max-width:85%;padding:8px 12px;border-radius:14px;border:1px solid var(--line);white-space:pre-wrap;overflow-wrap:anywhere}
.m.user{align-self:flex-start;background:var(--them)}.m.admin{align-self:flex-end;background:var(--me)}
.m small{display:block;color:var(--muted);font-size:11px;margin-top:3px}
.reply{border-top:1px solid var(--line);padding:10px;display:flex;flex-direction:column;gap:8px}
.reply textarea{width:100%;min-height:76px;resize:vertical;border:2px solid var(--ink);border-radius:12px;padding:8px 10px;background:var(--card)}
.reply .row label{font-size:13px;color:var(--text2)}
.reply select{border:2px solid var(--ink);border-radius:10px;padding:3px 6px;background:var(--card)}
.note{font-size:12.5px;color:var(--muted);margin:8px 0 0}
[data-mt]{margin-top:14px}
.vh{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
@media (max-width:900px){.grid3{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:760px){.grid2,.grid3,.support{grid-template-columns:1fr}.tlist{max-height:260px}.brand h1{font-size:20px}.kpi .v{font-size:30px}
  .fstep{grid-template-columns:minmax(0,1fr) 4.6em}.fstep .tr{grid-column:1 / -1;order:3}.blist li{grid-template-columns:minmax(0,7.5em) minmax(0,1fr) auto}}
/* ---- v3 (5/11): menu ☰, Accueil, « ? », globe, new accounts, demo ---- */
:root{--ease-out:cubic-bezier(.165,.84,.44,1);--up:#0f7a3a;--down:#b42318}
@media (prefers-color-scheme:dark){:root{--up:#5fd38d;--down:#ff8a80}}
.menubtn{flex:none;width:44px;height:44px;border-radius:12px;border:2px solid #0a0d14;background:#fff;color:#0a0d14;font-size:22px;line-height:1;cursor:pointer;display:grid;place-items:center}
.menubtn:focus-visible{outline:3px solid #fff;outline-offset:2px}
.where{font-family:Lilita,Rubik,sans-serif;font-size:20px;color:#fff}
.scrim{position:fixed;inset:0;background:rgba(10,13,20,.45);opacity:0;pointer-events:none;transition:opacity 180ms ease;z-index:40}
.scrim.open{opacity:1;pointer-events:auto}
.drawer{position:fixed;top:0;left:0;bottom:0;width:min(300px,86vw);background:var(--card);border-right:3px solid #0a0d14;z-index:41;padding:14px 12px;overflow-y:auto;
  transform:translateX(-104%);transition:transform 180ms var(--ease-out);visibility:hidden}
.drawer.open{transform:none;transition-duration:240ms;visibility:visible}
.drawer .dh{display:flex;align-items:center;gap:10px;margin:0 4px 12px}
.drawer .dh img{width:34px;height:34px}
.drawer nav{display:flex;flex-direction:column;gap:4px}
.drawer nav button{display:flex;align-items:center;gap:12px;width:100%;text-align:left;border:2px solid transparent;background:none;border-radius:14px;padding:11px 12px;font-size:16px;font-weight:600;color:var(--text);cursor:pointer;min-height:48px}
.drawer nav button .ic{width:26px;text-align:center;font-size:19px}
.drawer nav button[aria-current="page"]{background:var(--ink);color:#fff}
@media (prefers-color-scheme:dark){.drawer nav button[aria-current="page"]{background:var(--series);color:#04101f}}
@media (hover:hover){.drawer nav button:not([aria-current="page"]):hover{background:var(--sunk)}}
.drawer nav button:focus-visible{outline:3px solid var(--sky);outline-offset:1px}
.drawer .sep{height:1px;background:var(--line);margin:6px 8px}
.bar[hidden]{display:none}
.kpi .k .q{margin-left:auto}
.q{flex:none;width:26px;height:26px;border-radius:50%;border:2px solid var(--line);background:var(--card);color:var(--text2);font-weight:800;font-size:14px;line-height:1;cursor:pointer;display:inline-grid;place-items:center;padding:0}
.q[aria-expanded="true"]{background:var(--ink);color:#fff;border-color:var(--ink)}
.q:focus-visible{outline:3px solid var(--sky);outline-offset:2px}
.kpi .e{display:none}.kpi.help .e{display:block}
.home{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
.hc{background:var(--card);border:2px solid var(--ink);border-radius:22px;padding:16px 18px;box-shadow:0 4px 0 var(--ink);display:flex;flex-direction:column;gap:6px;min-width:0;text-align:left;color:var(--text);font:inherit}
@media (prefers-color-scheme:dark){.hc{box-shadow:none}}
.hc.wide{grid-column:1 / -1}
.hctl{gap:10px;flex-wrap:wrap;margin-bottom:12px}
.xfg{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:18px 26px;margin-top:16px}.xfg h3{margin:0 0 8px;font-size:15px}
/* the labels are long (« iPhone / iPad · Mémoire pleine »): above their bar, whole */
.xfg .blist li{grid-template-columns:minmax(0,1fr) auto;row-gap:3px}.xfg .blist .nm{grid-column:1 / -1;white-space:normal}
@media (max-width:480px){#xfDev th,#xfDev td{padding:6px 4px;font-size:12.5px}}
.vsum{font-size:17px;font-weight:700;margin:12px 0}.vcol{max-width:640px}.vcol h3{margin:0 0 8px}
#vppCard{margin-top:16px}#vppCard .hbest{flex-wrap:wrap}
.hq .he{display:none;font-size:13.5px;color:var(--muted);margin:6px 0 0}.hq.help .he{display:block}
.hbest{display:flex;align-items:center;gap:8px;font-weight:700;font-size:18px}.hbest .sp{flex:1}
.hlist{list-style:none;margin:10px 0 0;padding:0}
.hhead,.hlist li{display:grid;grid-template-columns:6.4em 3.6em minmax(0,1fr) 5.2em 5.2em 7em;align-items:center;gap:10px}
.hhead{font-size:12.5px;color:var(--muted);margin-top:12px;padding:0 6px}.hhead span:nth-child(n+4){text-align:right}
.hlist li{padding:5px 6px;border-radius:10px;font-variant-numeric:tabular-nums}.hlist .cs{display:contents}
.hlist li+li{border-top:1px solid var(--line)}
.hlist .hl{font-weight:700;white-space:nowrap}.hlist .hn{text-align:right;font-weight:700}
.hlist .hb{height:14px;background:var(--sunk);border-radius:7px;overflow:hidden}.hlist .hb i{display:block;height:100%;background:var(--series);border-radius:7px;transform-origin:left}
.hlist .c{text-align:right;color:var(--text2)}.hlist .c small{display:none}.hlist .c.z{color:var(--muted)}
.hlist li.best{background:var(--hot-bg)}.hlist li.best .hb i{background:var(--hot)}
.hlist li.now{box-shadow:inset 3px 0 0 var(--series)}.hlist li.now .hl::after{content:"maintenant";display:block;font-weight:400;color:var(--muted);font-size:12px}
.hlist li.later{opacity:.45}
:root{--hot:#d9480f;--hot-bg:#fff1e8}
@media (prefers-color-scheme:dark){:root{--hot:#fb923c;--hot-bg:#3a2214}}
@media (max-width:760px){.hhead{display:none}
  .hlist li{grid-template-columns:5.6em minmax(0,1fr) 3em;row-gap:2px}
  .hlist .hb{grid-column:2;grid-row:1}.hlist .hn{grid-column:3;grid-row:1}.hlist .hl{grid-column:1;grid-row:1 / 3}
  .hlist .cs{grid-column:2 / 4;grid-row:2;display:flex;gap:10px;flex-wrap:wrap;font-size:13px}.hlist .c{text-align:left}.hlist .c small{display:inline}}

.hc .hk{display:flex;align-items:center;gap:8px;font-weight:700;font-size:15px;color:var(--text2)}
.hc .hk .ico{font-size:20px}
.hc .hv{font-family:Lilita,Rubik,sans-serif;font-size:46px;line-height:1.05;font-variant-numeric:tabular-nums;overflow-wrap:anywhere}
.hc .hs{font-size:15px;color:var(--text2)}
.hc .he{display:none;font-size:13.5px;color:var(--muted)}.hc.help .he{display:block}
.hc .more{margin-top:auto;align-self:flex-start;border:0;background:none;color:var(--sky-deep);font-weight:700;padding:4px 0;cursor:pointer;font-size:14.5px}
@media (prefers-color-scheme:dark){.hc .more{color:var(--series)}}
.trend{display:inline-flex;align-items:center;gap:5px;font-weight:700;font-size:14.5px;border-radius:99px;padding:3px 10px;width:fit-content}
.trend.up{color:var(--up);background:var(--good-bg)}.trend.down{color:var(--down);background:var(--bad-bg)}.trend.same{color:var(--text2);background:var(--sunk)}
.srcs{list-style:none;margin:4px 0 0;padding:0;display:flex;flex-direction:column;gap:8px}
.srcs li{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:10px;align-items:center;font-size:16px}
.srcs b{font-variant-numeric:tabular-nums}
.alerts{list-style:none;margin:4px 0 0;padding:0;display:flex;flex-direction:column;gap:8px}
.alerts li button{width:100%;text-align:left;border:2px solid var(--bad);background:var(--bad-bg);color:var(--bad);border-radius:14px;padding:10px 12px;font-weight:700;font-size:15px;cursor:pointer}
.alerts li.warn button{border-color:var(--warn);background:var(--warn-bg);color:var(--warn)}
.allok{font-size:20px;font-weight:700;color:var(--up)}
.signups{list-style:none;margin:0;padding:0}
.signups li{display:grid;grid-template-columns:5.6em minmax(0,2fr) minmax(0,1.1fr) minmax(0,1.2fr) auto;gap:10px;align-items:center;padding:11px 4px;border-bottom:1px solid var(--line);font-size:15px}
.signups .when{color:var(--text2);font-variant-numeric:tabular-nums;font-size:14px}
.signups .ctry,.signups .src{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.signups .who{display:flex;align-items:baseline;gap:8px;min-width:0}
.signups .who .nm{font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:45%;flex:none}.signups .who .nm.none{color:var(--muted);font-weight:400}
.signups .who .em{color:var(--text2);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;user-select:all}
.plan{border-radius:8px;padding:2px 8px;font-size:12.5px;font-weight:800;white-space:nowrap}
.plan.free{background:var(--sunk);color:var(--text2)}.plan.pro{background:var(--ink);color:#fff}.plan.creator{background:var(--sky);color:#fff}
.globe-wrap{position:relative;touch-action:none;user-select:none;-webkit-user-select:none}
.globe-wrap canvas{display:block;width:100%;height:auto;aspect-ratio:1/1;max-width:560px;margin:0 auto;cursor:grab}
.globe-wrap canvas.drag{cursor:grabbing}
.gzoom{position:absolute;right:6px;bottom:6px;display:flex;flex-direction:column;gap:6px}
.gzoom button{width:40px;height:40px;border-radius:12px;border:2px solid var(--ink);background:var(--card);color:var(--text);font-size:20px;font-weight:800;cursor:pointer}
.ginfo{border:2px solid var(--ink);border-radius:16px;padding:12px 14px;margin-top:10px;background:var(--sunk);min-height:64px}
.ginfo b{font-size:17px}.ginfo p{margin:4px 0 0;color:var(--text2)}
details.more-d{margin-top:12px}
details.more-d>summary{cursor:pointer;font-weight:700;color:var(--sky-deep);padding:8px 0;list-style:none}
details.more-d>summary::-webkit-details-marker{display:none}
details.more-d>summary::before{content:"▸ ";}details.more-d[open]>summary::before{content:"▾ ";}
@media (prefers-color-scheme:dark){details.more-d>summary{color:var(--series)}}
.demo{background:#ffe7b8;color:#7a3e00;border-bottom:3px solid #0a0d14;text-align:center;font-weight:700;padding:8px 12px;font-size:14px}
@media (max-width:760px){.home{grid-template-columns:1fr}.hc .hv{font-size:40px}.where{font-size:18px}
  .signups li{grid-template-columns:4.6em minmax(0,1fr) auto;row-gap:2px;align-items:start}.signups .when{grid-row:1 / 4}
  .signups .who{grid-column:2;grid-row:1;flex-direction:column;align-items:stretch;gap:0}.signups .who .nm{max-width:none}.signups .who .em{font-size:13.5px}
  .signups .ctry{grid-column:2;grid-row:2}.signups .src{grid-column:2;grid-row:3;font-size:13.5px;color:var(--text2)}.signups .plan{grid-row:1 / 4;grid-column:3;align-self:center}}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
</style>
</head>
<body>
__DEMO_BANNER__<header class="top"><div class="in">
  <button class="menubtn" type="button" id="menuBtn" aria-label="Menu" aria-expanded="false" aria-controls="drawer">☰</button>
  <div class="brand"><img src="/icons/icon-192.png" alt="" width="38" height="38"><h1 class="where" id="whereTxt">Accueil</h1></div>
  <span class="sp"></span>
  <span class="pill" id="availPill"><span class="dot"></span><span id="availTxt">…</span></span>
  <label class="switch"><input type="checkbox" id="availSw"><span>Je suis disponible</span></label>
</div></header>
<div class="scrim" id="scrim"></div>
<aside class="drawer" id="drawer" aria-label="Menu" aria-hidden="true">
  <div class="dh"><img src="/icons/icon-192.png" alt="" width="34" height="34"><b>Tableau de bord</b></div>
  <nav>
    <button type="button" id="tab-home" data-go="home"><span class="ic">🏠</span>Accueil</button>
    <button type="button" id="tab-today" data-go="today"><span class="ic">☀️</span>Aujourd’hui</button>
    <button type="button" id="tab-hours" data-go="hours"><span class="ic">🕑</span>Heure par heure</button>
    <button type="button" id="tab-signups" data-go="signups"><span class="ic">🆕</span>Nouveaux comptes</button>
    <button type="button" id="tab-users" data-go="users"><span class="ic">🌍</span>Visiteurs et pays</button>
    <button type="button" id="tab-money" data-go="money"><span class="ic">💵</span>Argent <span class="test" data-test hidden>TEST</span></button>
    <button type="button" id="tab-funnel" data-go="funnel"><span class="ic">🪜</span>Du visiteur à l’abonné</button>
    <button type="button" id="tab-msgs" data-go="msgs"><span class="ic">💬</span>Messages <span class="badge" id="tabBadge" hidden></span></button>
    <button type="button" id="tab-health" data-go="health"><span class="ic">🩺</span>Santé du serveur</button>
  </nav>
  <div class="sep"></div>
  <p class="note" id="who"></p>
</aside>
<div class="wrap">
  <div class="banner" id="banner" role="alert"></div>
  <p class="testnote" id="testNote" role="note">Les abonnements et l’argent affichés viennent des <b>paiements de test</b> (Paddle « sandbox ») : ce n’est pas de l’argent réel.</p>
  <div class="bar" id="periodBar" hidden>
    <div class="seg" role="group" aria-label="Période"><button type="button" data-days="7" aria-pressed="false">7 j</button><button type="button" data-days="30" aria-pressed="true">30 j</button><button type="button" data-days="90" aria-pressed="false">90 j</button><button type="button" data-days="all" aria-pressed="false">Tout</button></div>
    <span class="note" id="rangeTxt"></span>
    <span class="sp"></span>
    <span class="test" id="testTag" hidden>TEST</span>
  </div>

  <!-- ===== Accueil ===== -->
  <section class="panel" id="p-home" aria-labelledby="tab-home">
    <div class="home">
      <div class="hc" id="hMoney"><div class="hk"><span class="ico">💵</span>Gagné ce mois-ci <span class="test" data-test hidden>TEST</span><span class="sp"></span><button class="q" type="button" aria-expanded="false" aria-label="Explication">?</button></div>
        <div class="hv" id="hMoneyV">–</div><span class="trend same" id="hMoneyT">…</span><div class="hs" id="hMoneyS">&nbsp;</div>
        <p class="he">Ce qui te reste ce mois-ci après la part de Paddle et les taxes (estimé). Paddle te verse l’argent une fois par mois, vers le 15, dès que tu as au moins 100 $.</p>
        <button class="more" type="button" data-go="money">Voir l’argent →</button></div>
      <div class="hc" id="hSubs"><div class="hk"><span class="ico">⭐</span>Abonnés <span class="test" data-test hidden>TEST</span><span class="sp"></span><button class="q" type="button" aria-expanded="false" aria-label="Explication">?</button></div>
        <div class="hv" id="hSubsV">–</div><div class="hs" id="hSubsS">&nbsp;</div><span class="trend same" id="hSubsT">…</span><span class="trend same" id="hSubsW">…</span>
        <p class="he">Personnes qui paient en ce moment (Pro ou Creator Plus). Les flèches comparent les nouveaux abonnés d’aujourd’hui à hier, et de la semaine à la semaine d’avant.</p>
        <button class="more" type="button" data-go="money">Voir les abonnés →</button></div>
      <div class="hc" id="hVis"><div class="hk"><span class="ico">👀</span>Visiteurs aujourd’hui<span class="sp"></span><button class="q" type="button" aria-expanded="false" aria-label="Explication">?</button></div>
        <div class="hv" id="hVisV">–</div><span class="trend same" id="hVisT">…</span>
        <p class="he">Nombre de fois où quelqu’un a ouvert Stalak aujourd’hui, comparé à hier à la même heure de fin de journée.</p>
        <button class="more" type="button" data-go="users">Voir les visiteurs →</button></div>
      <div class="hc" id="hSign"><div class="hk"><span class="ico">🆕</span>Comptes créés aujourd’hui<span class="sp"></span><button class="q" type="button" aria-expanded="false" aria-label="Explication">?</button></div>
        <div class="hv" id="hSignV">–</div><span class="trend same" id="hSignT">…</span>
        <p class="he">Personnes qui ont créé un compte aujourd’hui (par e-mail ou Google), comparé à hier.</p>
        <button class="more" type="button" data-go="signups">Voir d’où ils viennent →</button></div>
      <div class="hc" id="hSrc"><div class="hk"><span class="ico">🧭</span>D’où viennent les gens (7 jours)<span class="sp"></span><button class="q" type="button" aria-expanded="false" aria-label="Explication">?</button></div>
        <ul class="srcs" id="hSrcL"></ul>
        <p class="he">Les sites ou liens qui ont amené le plus de visiteurs ces 7 derniers jours, avec la flèche par rapport aux 7 jours d’avant.</p>
        <button class="more" type="button" data-go="users">Voir le détail →</button></div>
      <div class="hc" id="hAlerts"><div class="hk"><span class="ico">🔔</span>Alertes<span class="sp"></span><button class="q" type="button" aria-expanded="false" aria-label="Explication">?</button></div>
        <div id="hAlertsL"></div>
        <p class="he">Ce qui demande ton attention : messages sans réponse, souci sur le serveur, notifications Telegram pas reliées.</p></div>
    </div>
  </section>

  <!-- ===== Heure par heure ===== -->
  <section class="panel" id="p-hours" aria-labelledby="tab-hours" hidden>
    <p class="intro">À quelle heure il y a le plus de monde sur Stalak. Une ligne par heure ; la barre montre les visites.</p>
    <div class="row hctl">
      <div class="seg" role="group" aria-label="Période" id="hPer"><button type="button" data-p="today" aria-pressed="true">Aujourd’hui</button><button type="button" data-p="7" aria-pressed="false">7 j</button><button type="button" data-p="30" aria-pressed="false">30 j</button></div>
      <div class="seg" role="group" aria-label="Heure de" id="hTz"><button type="button" data-tz="paris" aria-pressed="true">🇫🇷 Paris</button><button type="button" data-tz="ny" aria-pressed="false">🇺🇸 New York</button></div>
    </div>
    <div class="card hq">
      <div class="hbest"><span id="hBest">…</span><span class="sp"></span><button class="q" type="button" aria-expanded="false" aria-label="Explication">?</button></div>
      <p class="he" id="hHelp">Chaque ligne est une heure de la journée, à l’heure de la ville choisie. Visites : pages de Stalak ouvertes. Comptes : comptes créés. Exports : vidéos exportées. Abonnements : nouveaux abonnés. Sur 7 ou 30 jours, c’est la moyenne d’une journée, pour voir l’habitude.</p>
      <p class="note" id="hNote" hidden></p>
      <div class="hhead" aria-hidden="true"><span>Heure</span><span>Visites</span><span></span><span>Comptes</span><span>Exports</span><span>Abonnements</span></div>
      <ol class="hlist" id="hList"></ol>
    </div>
  </section>

  <!-- ===== Nouveaux comptes ===== -->
  <section class="panel" id="p-signups" aria-labelledby="tab-signups" hidden>
    <p class="intro">Une ligne par compte créé, du plus récent au plus ancien : quand, qui (pseudo et e-mail), depuis quel pays, d’où venait la personne la première fois, et sa formule aujourd’hui.</p>
    <div class="card"><ul class="signups" id="signupList"></ul><div class="row" data-mt><button class="btn" type="button" id="signupMore" hidden>Voir plus</button><span class="note" id="signupNote"></span></div></div>
  </section>

  <!-- ===== Aujourd'hui ===== -->
  <section class="panel" id="p-today" aria-labelledby="tab-today" hidden>
    <p class="intro">Les chiffres d’aujourd’hui. Ils repartent de zéro chaque nuit à 1 h (heure de Paris). Touche « ? » pour l’explication d’un chiffre.</p>
    <div class="kpis">
      <div class="kpi"><div class="k">Visiteurs en direct</div><div class="v" id="kLive">–</div><div class="d" id="kLiveS">&nbsp;</div><div class="e">Personnes qui ont Stalak ouvert en ce moment (vues dans les 6 dernières minutes).</div></div>
      <div class="kpi"><div class="k">Visites aujourd’hui</div><div class="v" id="kVisT">–</div><div class="d" id="kVisTS">&nbsp;</div><div class="e">Chaque page de Stalak ouverte compte pour une visite.</div></div>
      <div class="kpi"><div class="k">Inscriptions aujourd’hui</div><div class="v" id="kSignT">–</div><div class="d" id="kSignTS">&nbsp;</div><div class="e">Comptes créés aujourd’hui (e-mail ou Google).</div></div>
      <div class="kpi"><div class="k">Vidéos exportées aujourd’hui</div><div class="v" id="kExpT">–</div><div class="d" id="kExpTS">&nbsp;</div><div class="e">Montages enregistrés sur un téléphone ou un ordinateur.</div></div>
      <div class="kpi"><div class="k">Abonnés <span class="test" data-test hidden>TEST</span></div><div class="v" id="kPro">–</div><div class="d" id="kProS">&nbsp;</div><div class="e">Personnes qui paient Pro ou Creator Plus en ce moment.</div></div>
      <div class="kpi"><div class="k">Revenu mensuel <span class="test" data-test hidden>TEST</span></div><div class="v" id="kMrr">–</div><div class="d" id="kMrrS">&nbsp;</div><div class="e">Ce que rapportent les abonnements chaque mois (un annuel compte pour un douzième), avant taxes.</div></div>
      <div class="kpi"><div class="k">Messages à traiter</div><div class="v" id="kTix">–</div><div class="d" id="kTixS">&nbsp;</div><div class="e">Messages d’abonnés (« Parler à un humain ») sans réponse de ta part.</div></div>
    </div>
  </section>

  <!-- ===== Utilisateurs ===== -->
  <section class="panel" id="p-users" aria-labelledby="tab-users" hidden>
    <p class="intro">Qui vient sur Stalak, d’où, avec quel appareil, et qui revient. Seul le <b>pays</b> est enregistré (donné par Cloudflare) : jamais l’adresse IP ni la ville.</p>
    <div class="kpis">
      <div class="kpi"><div class="k">Comptes en tout</div><div class="v" id="kUsers">–</div><div class="d" id="kUsersS">&nbsp;</div><div class="e">Tous les comptes créés depuis le début.</div></div>
      <div class="kpi"><div class="k">Nouveaux comptes</div><div class="v" id="kNew">–</div><div class="d" id="kNewS">&nbsp;</div><div class="e">Comptes créés pendant la période choisie.</div></div>
      <div class="kpi"><div class="k">Comptes revenus</div><div class="v" id="kBack">–</div><div class="d" id="kBackS">&nbsp;</div><div class="e">Personnes qui se sont reconnectées un autre jour que celui de leur inscription.</div></div>
      <div class="kpi"><div class="k">Visites de retour</div><div class="v" id="kRet">–</div><div class="d" id="kRetS">&nbsp;</div><div class="e">Part des visites faites par un navigateur déjà venu un autre jour.</div></div>
    </div>
    <div class="card">
      <div class="head"><h2>Le globe</h2><span class="sp"></span>
        <div class="seg" role="group" aria-label="Ce que montre le globe"><button type="button" data-map="visits" aria-pressed="true">Visiteurs</button><button type="button" data-map="accounts" aria-pressed="false">Comptes</button><button type="button" data-map="subs" aria-pressed="false">Abonnés</button></div>
        <p id="mapTxt">Fais tourner le globe avec le doigt ou la souris, pince ou utilise + / − pour zoomer, touche un pays pour voir ses chiffres. Plus le bleu est foncé, plus il y en a.</p></div>
      <div class="grid2">
        <div><div class="globe-wrap" id="globeWrap"><canvas id="globe" width="560" height="560" aria-label="Globe des pays"></canvas>
          <div class="gzoom"><button type="button" id="gIn" aria-label="Zoomer">+</button><button type="button" id="gOut" aria-label="Dézoomer">−</button></div></div>
          <div class="ginfo" id="gInfo" role="status"><b>Touche un pays</b><p>pour voir ses visiteurs, comptes et abonnés.</p></div></div>
        <div><h3 id="topTitle">Pays</h3><ul class="blist" id="topCountries"></ul><p class="note" id="mapUnknown"></p></div>
      </div>
    </div>
    <details class="more-d"><summary>Voir le détail : jour par jour, appareils, langues, provenance</summary>
    <div class="card">
      <div class="head"><h2>Jour par jour</h2><span class="sp"></span><button class="btn small" type="button" id="tableBtn" aria-expanded="false">Voir en tableau</button>
        <p>Chaque barre est un jour (une semaine quand la période est longue). Passe la souris ou touche une barre pour le chiffre exact.</p></div>
      <div class="charts" id="charts"></div>
      <div class="table-wrap" id="tableWrap"></div>
    </div>
    <div class="grid3">
      <div class="card"><h3>Façon de créer le compte</h3><p class="note">Nouveaux comptes de la période, par e-mail ou par Google (Apple, Microsoft plus tard).</p><ul class="blist" id="bMethod"></ul></div>
      <div class="card"><h3>Appareils (comptes)</h3><p class="note">Avec quoi les nouveaux comptes ont été créés.</p><ul class="blist" id="bDevU"></ul></div>
      <div class="card"><h3>Langue des comptes</h3><p class="note">La langue de Stalak au moment de l’inscription.</p><ul class="blist" id="bLang"></ul></div>
      <div class="card"><h3>D’où viennent les visites</h3><p class="note">Le lien suivi (?ref=…) ou le site d’où arrive le visiteur (Google, TikTok…). « Direct » : adresse tapée ou lien sans indication.</p><ul class="blist" id="bSource"></ul></div>
      <div class="card"><h3>Appareils (visites)</h3><p class="note">Avec quoi les visiteurs ouvrent Stalak.</p><ul class="blist" id="bDevV"></ul></div>
      <div class="card"><h3>Langue des visites</h3><p class="note">Version de Stalak ouverte : anglais ou français.</p><ul class="blist" id="bLangV"></ul></div>
    </div>
    <div class="card" data-mt>
      <h2>Derniers inscrits</h2>
      <div class="scroll-x"><table id="users"><thead><tr><th>E-mail</th><th>Pseudo</th><th>Inscrit le</th><th>Vérifié</th><th>Formule</th></tr></thead><tbody></tbody></table></div>
    </div>
    </details>
    <p class="note" id="visitsKept">Les visites sont gardées 90 jours ; les comptes, tant qu’ils existent.</p>
  </section>

  <!-- ===== Argent ===== -->
  <section class="panel" id="p-money" aria-labelledby="tab-money" hidden>
    <p class="intro">Abonnés, revenu et désabonnements. Prix en dollars, avant les taxes que Paddle ajoute selon le pays. Encaissé = argent réellement payé, remboursements à part.</p>
    <div class="kpis">
      <div class="kpi"><div class="k">Abonnés <span class="test" data-test hidden>TEST</span></div><div class="v" id="mPro">–</div><div class="d" id="mProS">&nbsp;</div><div class="e">Personnes qui paient en ce moment, toutes formules.</div></div>
      <div class="kpi"><div class="k">Revenu mensuel <span class="test" data-test hidden>TEST</span></div><div class="v" id="mMrr">–</div><div class="d">&nbsp;</div><div class="e">Ce que rapportent les abonnements en cours chaque mois (annuels divisés par 12).</div></div>
      <div class="kpi"><div class="k">Encaissé sur la période <span class="test" data-test hidden>TEST</span></div><div class="v" id="kRev">–</div><div class="d" id="kRevS">&nbsp;</div><div class="e">Paiements reçus pendant la période (premiers paiements et renouvellements).</div></div>
      <div class="kpi"><div class="k">Nouveaux abonnés <span class="test" data-test hidden>TEST</span></div><div class="v" id="mNew">–</div><div class="d" id="mNewS">&nbsp;</div><div class="e">Premiers paiements pendant la période.</div></div>
      <div class="kpi"><div class="k">Désabonnements <span class="test" data-test hidden>TEST</span></div><div class="v" id="mChurn">–</div><div class="d" id="mChurnS">&nbsp;</div><div class="e">Abonnements terminés pendant la période. « Arrêt prévu » : encore payés, mais ne se renouvelleront pas.</div></div>
      <div class="kpi"><div class="k">Remboursements <span class="test" data-test hidden>TEST</span></div><div class="v" id="mRef">–</div><div class="d" id="mRefS">&nbsp;</div><div class="e">Argent rendu (ou contesté par la banque) pendant la période.</div></div>
    </div>
    <div class="card">
      <div class="head"><h2>Par formule</h2><p>Chaque abonné compte à son prix (il le garde). Les anciens abonnements Pro en euros et les essais Basic / Max sont rangés en Pro / Creator Plus.</p></div>
      <div class="scroll-x"><table id="plans"><thead><tr><th scope="col">Formule</th><th scope="col">Abonnés</th><th scope="col">Mensuels</th><th scope="col">Annuels</th><th scope="col">Arrêt prévu</th><th scope="col">Revenu mensuel</th><th scope="col">Encaissé 30 j</th><th scope="col">Depuis le début</th></tr></thead><tbody></tbody></table></div>
    </div>
    <div class="charts" id="moneyCharts"></div>
  </section>

  <!-- ===== Entonnoir ===== -->
  <section class="panel" id="p-funnel" aria-labelledby="tab-funnel" hidden>
    <p class="intro">Le chemin d’un visiteur jusqu’au paiement, sur la période. Chaque étape montre combien de fois elle a eu lieu et la part de l’étape d’avant. Ce sont des compteurs anonymes : rien sur la personne.</p>
    <div class="card"><div class="head"><h2>Du visiteur à l’abonné</h2><p>Une étape faible = l’endroit où les gens s’arrêtent. C’est là qu’il faut agir.</p></div><div class="funnel" id="funnel"></div></div>
    <div class="grid2">
      <div class="card"><h3>Vidéos exportées</h3><p class="note">Réussies ou ratées, et pourquoi ça a raté.</p><ul class="blist" id="bExport"></ul></div>
      <div class="card"><h3>Ce qui ouvre la page des formules</h3><p class="note">La fonction payante qui a donné envie (cadenas touché).</p><ul class="blist" id="bWhy"></ul></div>
    </div>
    <!-- (7/11, rapport chiffres, piste 4) the failed exports in detail: anonymous counters (metrics.js EXPORT_X) -->
    <div class="card" id="xfCard">
      <div class="head"><h2>Pourquoi les exports ratent</h2><p>Chaque export raté avec l’appareil, la raison, l’étape où ça a cassé, le format, la mémoire de l’appareil et la durée. Compteurs anonymes, depuis le 7/11. « Rattrapés » : l’export a raté puis Stalak l’a refait tout seul et la personne a eu sa vidéo (ils ne comptent pas dans les ratés).</p></div>
      <p class="vsum" id="xfSum">…</p>
      <div class="scroll-x"><table id="xfDev"><thead><tr><th scope="col">Appareil</th><th scope="col">Lancés</th><th scope="col">Réussis</th><th scope="col">Ratés</th><th scope="col">% ratés</th></tr></thead><tbody></tbody></table></div>
      <div class="xfg">
        <div><h3>Raison</h3><ul class="blist" id="xfCat"></ul></div>
        <div><h3>Appareil et raison</h3><ul class="blist" id="xfDevCat"></ul></div>
        <div><h3>Étape où ça casse</h3><ul class="blist" id="xfSt"></ul></div>
        <div><h3>Rattrapés tout seuls</h3><ul class="blist" id="xfSaved"></ul></div>
        <div><h3>Format</h3><ul class="blist" id="xfFmt"></ul></div>
        <div><h3>Vidéo ou pack</h3><ul class="blist" id="xfKind"></ul></div>
        <div><h3>Mémoire de l’appareil</h3><ul class="blist" id="xfMem"></ul></div>
        <div><h3>Durée du passage</h3><ul class="blist" id="xfDur"></ul></div>
        <div><h3>Temps avant l’échec</h3><ul class="blist" id="xfTook"></ul></div>
      </div>
    </div>
    <div class="card hq" id="vppCard">
      <div class="hbest"><span>🎬 Combien de vidéos par personne</span><span class="sp"></span>
        <div class="seg" role="group" aria-label="Période" id="vPer"><button type="button" data-p="7" aria-pressed="true">7 j</button><button type="button" data-p="30" aria-pressed="false">30 j</button></div>
        <button class="q" type="button" aria-expanded="false" aria-label="Explication">?</button></div>
      <p class="he">Pour chaque personne et chaque jour, combien de vidéos elle a faites : 1, 2, 3 ou plus. « Personne » = une page de Stalak ouverte (un numéro au hasard, sans compte) : si elle recharge la page, elle compte pour deux. Ton compte et ceux des tests ne sont pas comptés.</p>
      <p class="vsum" id="vSum">…</p>
      <div class="vcol"><h3>Vidéos exportées</h3><ul class="blist" id="vExp"></ul></div>
      <p class="note" id="vIos"></p>
    </div>
    <div class="charts" id="funnelCharts" data-mt></div>
  </section>

  <!-- ===== Messages ===== -->
  <section class="panel" id="p-msgs" aria-labelledby="tab-msgs" hidden>
    <div class="card">
      <div class="row"><h2 id="hSup">Messages des abonnés</h2><span class="sp"></span>
        <div class="seg" role="group" aria-label="Quels messages"><button type="button" data-st="open" aria-pressed="true">Ouverts</button><button type="button" data-st="closed" aria-pressed="false">Fermés</button><button type="button" data-st="all" aria-pressed="false">Tous</button></div>
        <button class="btn small" type="button" id="notifBtn">Activer les notifications</button>
      </div>
      <p class="note">« Je suis disponible » (en haut) = le glaçon propose le chat en direct. Sinon, l’abonné laisse son e-mail et ta réponse lui part par e-mail (aussi s’il a quitté la page).</p>
      <div class="support" data-mt>
        <div class="tlist" id="tlist" aria-label="Conversations"><div class="empty">Chargement…</div></div>
        <div class="conv" id="conv"><div class="empty">Choisis une conversation.</div></div>
      </div>
    </div>
  </section>

  <!-- ===== Santé du serveur ===== -->
  <section class="panel" id="p-health" aria-labelledby="tab-health" hidden>
    <p class="intro">Est-ce que tout marche, et reste-t-il de la marge ? Vert = tout va bien ; orange = à surveiller ; rouge = à régler. Tu reçois aussi un e-mail d’alerte quand quelque chose casse.</p>
    <div class="card">
      <div class="head"><h2>Notifications sur ton téléphone</h2><span class="sp"></span><span class="status" id="tgState">…</span>
        <p>Telegram t’envoie un message à chaque nouvel abonné (formule, prix, mensuel ou annuel, pays) et un message silencieux à chaque annulation. Jamais l’e-mail ni le nom du client.</p>
        <p><b>Pour relier :</b> 1. la clé du bot est le secret <b>TELEGRAM_BOT_TOKEN</b> (Cloudflare) ; 2. dans Telegram, ouvre ton bot et envoie <b>/start</b> ; 3. dans les 15 minutes, touche « Relier mon Telegram ».</p></div>
      <div class="row"><button class="btn" type="button" id="tgLink">Relier mon Telegram</button><button class="btn primary" type="button" id="ntfyBtn">Envoyer une notif de test</button>
        <button class="btn small danger" type="button" id="tgUnlink" hidden>Délier</button><span class="note" id="ntfyOut" role="status"></span></div>
      <p class="note" id="ntfyState">ntfy (facultatif) : …</p>
    </div>
    <div class="card" data-mt>
      <div class="head"><h2>E-mail de remerciement aux nouveaux abonnés</h2>
        <p>Environ 3 heures après un nouvel abonnement (Pro ou Creator Plus), le client reçoit un e-mail simple de « 99sayso de Stalak », dans sa langue. Une seule fois par personne, jamais pour un renouvellement ni pour un paiement de test. Ses réponses arrivent sur contact@stalak.app.</p></div>
      <div class="row"><button class="btn" type="button" id="thanksBtn">M’envoyer l’e-mail de remerciement</button><span class="note" id="thanksOut" role="status"></span></div>
    </div>
    <div class="grid2" id="limits"></div>
    <div class="charts" id="healthCharts" data-mt></div>
    <div class="card" data-mt><h2>Usage des fonctions (30 derniers jours)</h2><div class="grid3" id="usage"></div></div>
  </section>
</div>
<script nonce="__NONCE__">__GLOBE_LIBS__</script>
<script nonce="__NONCE__">
(function () {
  'use strict';
  var MAP = __MAP__;
  var DEMO = __DEMO__;
  var WORLD = __WORLD__;
  __DEMO_JS__
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  var S = { days: '30', status: 'open', open: null, unread: -1, stats: null, timers: {}, map: 'accounts', tab: 'today' };
  var nf = new Intl.NumberFormat('fr-FR');
  var pct = function (a, b) { return b ? Math.round(a / b * 100) : 0; };
  function money(cents, cur) { try { return (cents / 100).toLocaleString('fr-FR', { style: 'currency', currency: cur || 'USD', currencyDisplay: 'narrowSymbol', maximumFractionDigits: cents % 100 ? 2 : 0 }); } catch (e) { return (cents / 100).toFixed(2) + ' ' + cur; } }
  function el(tag, attrs, text) { var e = document.createElement(tag); if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]); if (text != null) e.textContent = text; return e; }
  function svgEl(tag, attrs) { var e = document.createElementNS('http://www.w3.org/2000/svg', tag); for (var k in attrs) e.setAttribute(k, attrs[k]); return e; }
  function dateFr(iso, withTime) { var d = new Date(iso); return withTime ? d.toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }); }
  function ago(iso) { var s = Math.round((Date.now() - new Date(iso)) / 1000); if (s < 60) return 'à l’instant'; if (s < 3600) return 'il y a ' + Math.round(s / 60) + ' min'; if (s < 86400) return 'il y a ' + Math.round(s / 3600) + ' h'; return dateFr(iso); }
  function banner(text) { var b = $('#banner'); b.textContent = text || ''; b.className = 'banner' + (text ? ' show' : ''); }
  function set(id, v) { var e = $(id); if (e) e.textContent = v; }
  var COUNTRY = function (c) { return c === 'unknown' ? 'Pays inconnu' : (MAP.names[c] || c); };
  var NAMES = {
    method: { email: 'E-mail', google: 'Google', apple: 'Apple', microsoft: 'Microsoft', unknown: 'Inconnu' },
    device: { ios: 'iPhone / iPad', android: 'Android', desktop: 'Ordinateur', unknown: 'Inconnu (avant le 1/11)' },
    lang: { en: 'Anglais', fr: 'Français', unknown: 'Inconnue' },
    source: { tiktok: 'TikTok', ig: 'Instagram', instagram: 'Instagram', yt: 'YouTube', youtube: 'YouTube', x: 'X (Twitter)', reddit: 'Reddit', discord: 'Discord', google: 'Google', bing: 'Bing', other: 'Autre site', unknown: 'Direct / sans indication', wm: 'Filigrane d’une vidéo' },
    why: { filters: 'Filtres', clip: 'Mode Clip 16:9', fx: 'Effets premium', text: 'Paroles karaoké', lyrics: 'Paroles auto', pack: 'Packs', cloud: 'Sauvegarde en ligne', human: 'Parler à un humain', wm: 'Enlever le filigrane', other: 'Autre / menu' },
    fail: { memory: 'Mémoire pleine', decoder: 'Lecture vidéo', encoder: 'Fabrication de la vidéo', hidden: 'Appli quittée pendant l’export', cancel: 'Annulé par la personne',
      closed: 'Page fermée pendant l’export', crash: 'Onglet fermé par le navigateur', other: 'Autre raison' },
    xst: { start: 'Au lancement', prepare: 'Préparation des prises', frames: 'Fabrication des images', assemble: 'Assemblage', file: 'Fichier final', realtime: 'Enregistrement en temps réel' },
    xfmt: { '916': '9:16 (TikTok / Reels)', '45': '4:5', '11': '1:1', '169': '16:9 (Clip)' },
    xkind: { one: 'Une vidéo', pack: 'Un pack' },
    xmem: { m1: '1 Go', m2: '2 Go', m4: '4 Go', m8: '8 Go ou plus', unk: 'Inconnue (iPhone, Safari, Firefox)' },
    xdur: { d15: 'Moins de 15 s', d30: '15 à 30 s', d60: '30 s à 1 min', dlong: 'Plus d’1 min' },
    xtook: { t10: 'Moins de 10 s', t30: '10 à 30 s', t60: '30 s à 1 min', t180: '1 à 3 min', tlong: 'Plus de 3 min' },
  };

  // every call goes to /api/admin/... on this host; an Access session that ended answers with a redirect to its login
  function api(method, path, body) {
    if (DEMO) return DEMO_API(method, path, body);   // demo page (previews only): made-up data, nothing sent anywhere
    var opts = { method: method, credentials: 'same-origin', cache: 'no-store', redirect: 'manual', headers: { Accept: 'application/json' } };
    if (body !== undefined) { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
    return fetch('/api/admin/' + path, opts).then(function (r) {
      if (r.type === 'opaqueredirect' || r.status === 401 || r.status === 403) {
        banner('Ta session Cloudflare Access est finie : recharge la page pour te reconnecter.');
        throw Object.assign(new Error('access'), { code: 'access' });
      }
      return r.json().catch(function () { return {}; }).then(function (d) {
        if (!r.ok) throw Object.assign(new Error(d.message || ('Erreur ' + r.status)), { code: d.error });
        return d;
      });
    });
  }

  // ---- menu ☰ (drawer): one page at a time; the period choice only where it means something ----
  var PAGES = { home: 'Accueil', today: 'Aujourd’hui', hours: 'Heure par heure', signups: 'Nouveaux comptes', users: 'Visiteurs et pays', money: 'Argent', funnel: 'Du visiteur à l’abonné', msgs: 'Messages', health: 'Santé du serveur' };
  var PERIOD = { users: 1, money: 1, funnel: 1, health: 1 };
  function menu(open) {
    var d = $('#drawer'), b = $('#menuBtn');
    d.classList.toggle('open', open); $('#scrim').classList.toggle('open', open);
    d.setAttribute('aria-hidden', open ? 'false' : 'true'); b.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) { var cur = $('#drawer [aria-current="page"]') || $('#drawer nav button'); cur.focus(); } else b.focus({ preventScroll: true });
  }
  $('#menuBtn').addEventListener('click', function () { menu(!$('#drawer').classList.contains('open')); });
  $('#scrim').addEventListener('click', function () { menu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && $('#drawer').classList.contains('open')) menu(false); });
  function showTab(name) {
    if (!PAGES[name]) name = 'home';
    S.tab = name;
    Object.keys(PAGES).forEach(function (t) {
      var p = $('#p-' + t), b = $('#tab-' + t);
      if (p) p.hidden = t !== name;
      if (b) { if (t === name) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); }
    });
    set('#whereTxt', PAGES[name]);
    $('#periodBar').hidden = !PERIOD[name];
    if (name === 'home') home();
    if (name === 'signups' && !S.signupsLoaded) signups();
    if (name === 'hours') hours();
    if (name === 'funnel') vpp();
    if (name === 'users') globeStart(); else globeStop();
    if (!/^#t=/.test(location.hash)) try { history.replaceState(null, '', '#' + name); } catch (e) {}
    window.scrollTo(0, 0);
  }
  // every [data-go] (menu, « Voir … → » on the cards, alerts) opens that page
  document.addEventListener('click', function (e) {
    var g = e.target.closest && e.target.closest('[data-go]'); if (!g) return;
    var fromMenu = !!g.closest('#drawer');
    showTab(g.dataset.go); if (fromMenu) menu(false);
  });
  // « ? » : one sentence that explains the figure (the cards of every page)
  function helpButtons() {
    $$('.kpi').forEach(function (k) {
      if (k.querySelector('.q') || !k.querySelector('.e')) return;
      var b = el('button', { class: 'q', type: 'button', 'aria-expanded': 'false', 'aria-label': 'Explication' }, '?');
      k.querySelector('.k').append(b);
    });
    $$('.q').forEach(function (b) {
      if (b.dataset.on) return; b.dataset.on = '1';
      b.addEventListener('click', function (e) {
        e.stopPropagation(); var c = b.closest('.kpi, .hc, .hq'), on = !c.classList.contains('help');
        c.classList.toggle('help', on); b.setAttribute('aria-expanded', on ? 'true' : 'false');
      });
    });
  }

  // ---- Heure par heure (5/11): the visits, accounts, exports and subscriptions of each hour, in Paris or New York time ----
  var HZ = { paris: 'Paris', ny: 'New York' };
  S.hPer = 'today'; S.hTz = 'paris';
  try { var tz0 = localStorage.getItem('stalak:admin:tz'); if (HZ[tz0]) S.hTz = tz0; } catch (e) {}
  function hLabel(h) { return h + ' h–' + ((h + 1) % 24) + ' h'; }
  function nfmt(x) { return Number(x).toLocaleString('fr-FR', { maximumFractionDigits: 1 }); }
  function plural(n, one, many) { return n >= 2 ? many : one; }
  function hours() {
    $$('#hPer button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.p === S.hPer ? 'true' : 'false'); });
    $$('#hTz button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.tz === S.hTz ? 'true' : 'false'); });
    return api('GET', 'hours?period=' + S.hPer + '&tz=' + S.hTz).then(function (d) {
      var city = HZ[d.tz] || 'Paris', avg = d.average, ol = $('#hList'); ol.textContent = '';
      var max = Math.max.apply(null, d.hours.map(function (h) { return h.visits; }).concat([0]));
      set('#hBest', d.best === null ? 'Pas encore de visites sur cette période.'
        : '🔥 Le plus de monde : ' + hLabel(d.best) + ' (heure de ' + city + ')');
      var notes = [];
      if (avg) notes.push('Moyenne d’une journée sur les ' + d.period + ' derniers jours.');
      if (!d.exportsSince) notes.push('Les exports sont comptés heure par heure depuis la mise en ligne de cette page : pas encore de chiffre.');
      else if (d.exportsSince > Date.now() - Number(avg ? d.period : 1) * 864e5) notes.push('Exports comptés heure par heure seulement depuis le ' + new Date(d.exportsSince).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) + '.');
      if (d.test) notes.push('Abonnements : paiements de test.');
      var note = $('#hNote'); note.textContent = notes.join(' '); note.hidden = !notes.length;
      d.hours.forEach(function (h, i) {
        var li = el('li'), later = d.period === 'today' && i > d.nowHour;
        if (i === d.best) li.classList.add('best');
        if (d.period === 'today' && i === d.nowHour) li.classList.add('now');
        if (later) li.classList.add('later');
        var bar = el('i'), hb = el('span', { class: 'hb', 'aria-hidden': 'true' }); hb.append(bar);
        bar.style.width = (max ? Math.round(h.visits / max * 100) : 0) + '%';
        var cs = el('span', { class: 'cs' });
        if (later) cs.append(el('span', { class: 'c z' }, 'plus tard'));
        else [[h.signups, ' compte', ' comptes'], [h.exports, ' export', ' exports'], [h.subs, ' abonnement', ' abonnements']].forEach(function (c) {
          var sp = el('span', { class: 'c' + (c[0] ? '' : ' z') }, nfmt(c[0]));
          sp.append(el('small', null, plural(c[0], c[1], c[2]))); cs.append(sp);
        });
        li.append(el('span', { class: 'hl' }, hLabel(i) + (i === d.best ? ' 🔥' : '')), el('span', { class: 'hn', title: 'Visites' }, later ? '' : nfmt(h.visits)), hb, cs);
        li.setAttribute('aria-label', hLabel(i) + ' : ' + nfmt(h.visits) + ' visites, ' + nfmt(h.signups) + ' comptes, ' + nfmt(h.exports) + ' exports, ' + nfmt(h.subs) + ' abonnements' + (avg ? ' en moyenne' : ''));
        ol.append(li);
      });
    }).catch(function (e) { set('#hBest', 'Impossible de charger : ' + e.message); });
  }
  $('#hPer').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; S.hPer = b.dataset.p; hours(); });
  $('#hTz').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return; S.hTz = b.dataset.tz;
    try { localStorage.setItem('stalak:admin:tz', S.hTz); } catch (er) {}
    hours();
  });
  // ---- « Combien de vidéos par personne » (5/11): 1 / 2 / 3 or more videos a day, exports and clean videos through the ad ----
  S.vPer = '7';
  function vpp() {
    $$('#vPer button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.p === S.vPer ? 'true' : 'false'); });
    return api('GET', 'videos?period=' + S.vPer).then(function (d) {
      set('#vSum', d.summary);
      // no more ad since 6/11 (owner's decision): only the exports are shown (the server still answers d.ads)
      [['#vExp', d.exports]].forEach(function (x) {
        var ul = $(x[0]), g = x[1]; ul.textContent = '';
        if (!g.people) { ul.append(el('li', { class: 'note' }, 'Rien encore.')); return; }
        [['1 vidéo', g.one], ['2 vidéos', g.two], ['3 ou plus', g.three]].forEach(function (r) {
          var pc = Math.round(r[1] / g.people * 100), li = el('li'), tr = el('span', { class: 'tr' }), bar = el('i');
          bar.style.width = pc + '%'; tr.append(bar);
          var n = el('span', { class: 'n' }); n.append(el('b', null, pc + ' %'), document.createTextNode(' (' + r[1] + ')'));
          li.append(el('span', { class: 'nm' }, r[0]), tr, n); ul.append(li);
        });
      });
      var e = d.exports, since = d.since ? ' Compté depuis le ' + new Date(d.since + 'T12:00:00Z').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) + '.' : '';
      set('#vIos', (e.people ? '📱 iPhone : ' + Math.round(e.ios / e.people * 100) + ' % des gens qui ont exporté une vidéo.' : '') + since);
    }).catch(function (er) { set('#vSum', 'Impossible de charger : ' + er.message); });
  }
  $('#vPer').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; S.vPer = b.dataset.p; vpp(); });
  // ---- Accueil: the few figures that matter, with an arrow against yesterday / last week ----
  function trend(node, cur, prev, what) {
    var e = $(node); if (!e) return;
    var diff = cur - prev, up = diff > 0, same = diff === 0;
    e.className = 'trend ' + (same ? 'same' : up ? 'up' : 'down');
    e.textContent = (same ? '= ' : up ? '▲ +' : '▼ ') + (same ? 'pareil que ' + what : nf.format(diff) + ' par rapport à ' + what);
    e.setAttribute('aria-label', same ? 'Pareil que ' + what : (up ? 'En hausse de ' : 'En baisse de ') + nf.format(Math.abs(diff)) + ' par rapport à ' + what);
  }
  function home() {
    return api('GET', 'home').then(function (d) {
      $$('[data-test]').forEach(function (x) { x.hidden = !d.test; }); $('#testNote').classList.toggle('show', !!d.test);
      var m = d.money;
      set('#hMoneyV', money(m.month, 'USD'));
      var dm = m.month - m.prevMonthSameDays, tm = $('#hMoneyT');
      tm.className = 'trend ' + (dm === 0 ? 'same' : dm > 0 ? 'up' : 'down');
      tm.textContent = dm === 0 ? '= pareil que le mois dernier' : (dm > 0 ? '▲ +' : '▼ −') + money(Math.abs(dm), 'USD') + ' par rapport au mois dernier (mêmes jours)';
      var pd = new Date(m.payout.date + 'T12:00:00Z').toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
      set('#hMoneyS', m.payout.enough ? 'Prochain versement : environ ' + money(m.payout.amount, 'USD') + ' vers le ' + pd + '.'
        : 'Pas encore de versement : Paddle paie à partir de 100 $ (' + money(m.payout.amount, 'USD') + ' pour l’instant).');
      var sb = d.subscribers;
      set('#hSubsV', nf.format(sb.total)); set('#hSubsS', 'Pro ' + nf.format(sb.pro) + ' · Creator Plus ' + nf.format(sb.creator));
      var t1 = $('#hSubsT'); t1.className = 'trend ' + (sb.newToday > sb.newYesterday ? 'up' : sb.newToday < sb.newYesterday ? 'down' : 'same');
      t1.textContent = (sb.newToday > sb.newYesterday ? '▲ ' : sb.newToday < sb.newYesterday ? '▼ ' : '= ') + sb.newToday + ' nouveau' + (sb.newToday > 1 ? 'x' : '') + ' aujourd’hui (hier : ' + sb.newYesterday + ')';
      var t2 = $('#hSubsW'); t2.className = 'trend ' + (sb.newWeek > sb.newPrevWeek ? 'up' : sb.newWeek < sb.newPrevWeek ? 'down' : 'same');
      t2.textContent = (sb.newWeek > sb.newPrevWeek ? '▲ ' : sb.newWeek < sb.newPrevWeek ? '▼ ' : '= ') + sb.newWeek + ' nouveau' + (sb.newWeek > 1 ? 'x' : '') + ' en 7 jours (7 jours d’avant : ' + sb.newPrevWeek + ')';
      set('#hVisV', nf.format(d.visitors.today)); trend('#hVisT', d.visitors.today, d.visitors.yesterday, 'hier (' + nf.format(d.visitors.yesterday) + ')');
      set('#hSignV', nf.format(d.signups.today)); trend('#hSignT', d.signups.today, d.signups.yesterday, 'hier (' + nf.format(d.signups.yesterday) + ')');
      var ul = $('#hSrcL'); ul.textContent = '';
      if (!d.sources.length) ul.append(el('li', { class: 'empty' }, 'Pas encore de visites cette semaine.'));
      d.sources.forEach(function (x) {
        var li = el('li'), diff = x.week - x.prevWeek, t = el('span', { class: 'trend ' + (diff > 0 ? 'up' : diff < 0 ? 'down' : 'same') }, diff > 0 ? '▲ +' + diff : diff < 0 ? '▼ ' + diff : '=');
        t.setAttribute('aria-label', diff > 0 ? 'en hausse' : diff < 0 ? 'en baisse' : 'pareil');
        li.append(el('span', null, sourceName(x.source)), el('b', null, nf.format(x.week)), t); ul.append(li);
      });
      var al = $('#hAlertsL'); al.textContent = '';
      if (!d.alerts.length) al.append(el('div', { class: 'allok' }, 'Tout va bien ✅'));
      else {
        var list = el('ul', { class: 'alerts' });
        d.alerts.forEach(function (a) {
          var txt = a.kind === 'messages' ? '💬 ' + a.n + ' message' + (a.n > 1 ? 's' : '') + ' à traiter'
            : a.kind === 'errors' ? '⚠️ ' + a.n + ' erreur' + (a.n > 1 ? 's' : '') + ' du serveur aujourd’hui'
            : a.kind === 'mails' ? '✉️ Les e-mails de code approchent de la limite du jour (' + a.n + ' / ' + a.max + ')'
            : a.kind === 'telegram' ? '📱 Notifications Telegram ' + (a.state === 'no_token' ? 'pas installées (clé du bot manquante)' : 'pas encore reliées') : a.kind;
          var li = el('li', { class: a.kind === 'telegram' ? 'warn' : '' }), b = el('button', { type: 'button', 'data-go': a.tab }, txt + ' →');
          li.append(b); list.append(li);
        });
        al.append(list);
      }
    }).catch(function (e) { if (e.code !== 'access') banner('L’accueil n’a pas pu être chargé (' + e.message + ').'); });
  }

  // ---- Nouveaux comptes: one line per account, where it came from ----
  var SOURCES = { tiktok: 'TikTok', ig: 'Instagram', instagram: 'Instagram', yt: 'YouTube', youtube: 'YouTube', google: 'Google', bing: 'Bing', x: 'X (Twitter)', twitter: 'X (Twitter)',
    reddit: 'Reddit', discord: 'Discord', facebook: 'Facebook', fb: 'Facebook', snapchat: 'Snapchat', direct: 'Lien direct', other: 'Autre site', unknown: 'Lien direct', wm: 'Filigrane d’une vidéo' };
  var DIRS = { alternativeto: 'AlternativeTo', saashub: 'SaaSHub', producthunt: 'Product Hunt', betalist: 'BetaList', futurepedia: 'Futurepedia', theresanaiforthat: 'There’s An AI For That', contentcreators: 'contentcreators.com', buzzsonic: 'Buzzsonic', toolify: 'Toolify' };
  function sourceName(src) {
    if (!src) return 'Inconnue';
    var m = /^(ref|utm|dir|site):(.+)$/.exec(src);
    if (!m) return SOURCES[src] || src;
    if (m[1] === 'dir') return 'Annuaire (' + (DIRS[m[2]] || m[2]) + ')';
    if (m[1] === 'site') return 'Site ' + m[2];
    var known = SOURCES[m[2]];
    return m[1] === 'ref' ? (known ? known + ' (lien ?ref=' + m[2] + ')' : 'Lien ?ref=' + m[2]) : (known || m[2]) + ' (lien utm)';
  }
  function flag(c) { return /^[A-Z]{2}$/.test(c || '') ? String.fromCodePoint.apply(null, c.split('').map(function (x) { return 0x1f1a5 + x.charCodeAt(0); })) : '🏳️'; }
  var PLAN_LABEL = { free: 'Gratuit', pro: 'Pro', creator: 'Creator Plus' };
  function signups(more) {
    S.signupsLoaded = true;
    var ul = $('#signupList'); if (!more) { ul.textContent = ''; S.signupBefore = null; }
    return api('GET', 'signups?limit=40' + (S.signupBefore ? '&before=' + S.signupBefore : '')).then(function (d) {
      if (!d.signups.length && !more) ul.append(el('li', { class: 'empty' }, 'Personne pour l’instant.'));
      d.signups.forEach(function (u) {
        var li = el('li');
        var who = el('span', { class: 'who' });
        who.append(el('b', { class: 'nm' + (u.name ? '' : ' none') }, u.name || '—'), el('span', { class: 'em', title: u.email || '' }, u.email || ''));
        li.append(el('span', { class: 'when' }, new Date(u.at).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })), who,
          el('span', { class: 'ctry' }, flag(u.country) + ' ' + (u.country ? (MAP.names[u.country] || u.country) : 'Pays inconnu')),
          el('span', { class: 'src', title: u.source || '' }, '↳ ' + (u.source ? sourceName(u.source) : (u.method === 'google' ? 'Inconnue (Google, avant le 5/11)' : 'Inconnue (avant le 5/11)'))),
          el('span', { class: 'plan ' + (PLAN_LABEL[u.plan] ? u.plan : 'free') }, PLAN_LABEL[u.plan] || 'Gratuit'));
        ul.append(li);
      });
      S.signupBefore = d.more; $('#signupMore').hidden = !d.more;
      set('#signupNote', 'La source est la première façon dont la personne est arrivée sur Stalak (lien suivi, site, annuaire).');
    }).catch(function (e) { if (e.code !== 'access') banner(e.message); });
  }
  $('#signupMore').addEventListener('click', function () { signups(true); });

  // ---- live: visitors, availability, unread messages (every 10 s; also tells the server the dashboard is open) ----
  function live() {
    return api('GET', 'live').then(function (d) {
      banner('');
      set('#kLive', nf.format(d.visitors.total));
      set('#kLiveS', 'Anglais ' + d.visitors.en + ' · français ' + d.visitors.fr);
      $('#availSw').checked = d.availableSwitch;
      var pill = $('#availPill');
      pill.className = 'pill' + (d.available ? ' on' : d.availableSwitch ? ' warn' : '');
      set('#availTxt', d.available ? 'Direct proposé aux abonnés' : d.availableSwitch ? 'Connexion…' : 'Réponses par e-mail');
      set('#kTix', nf.format(d.tickets.unread));
      set('#kTixS', d.tickets.open + ' conversation' + (d.tickets.open > 1 ? 's' : '') + ' ouverte' + (d.tickets.open > 1 ? 's' : ''));
      var tb = $('#tabBadge'); tb.hidden = !d.tickets.unread; tb.textContent = d.tickets.unread;
      document.title = (d.tickets.unread ? '(' + d.tickets.unread + ') ' : '') + 'Stalak · tableau de bord';
      if (S.unread >= 0 && d.tickets.unread > S.unread) { notify(d.tickets.unread); tickets(); }
      S.unread = d.tickets.unread;
    }).catch(function (e) { if (e.code !== 'access') banner('Pas de connexion au serveur (' + e.message + '). Nouvel essai dans quelques secondes.'); });
  }
  function notify(n) {
    try { if ('Notification' in window && Notification.permission === 'granted' && document.hidden) new Notification('Stalak', { body: n + ' message' + (n > 1 ? 's' : '') + ' à traiter' }); } catch (e) {}
  }
  $('#notifBtn').addEventListener('click', function () {
    if (!('Notification' in window)) { this.textContent = 'Pas de notifications ici'; return; }
    var b = this; Notification.requestPermission().then(function (p) { b.textContent = p === 'granted' ? 'Notifications activées' : 'Notifications refusées'; });
  });
  $('#availSw').addEventListener('change', function () {
    var on = this.checked;
    api('POST', 'available', { available: on }).then(live).catch(function (e) { if (e.code !== 'access') banner(e.message); });
  });

  // ---- charts: one measure, one hue, a bar per day (per week beyond 120 days), tooltip, table view ----
  function niceMax(v) { if (v <= 4) return 4; var p = Math.pow(10, Math.floor(Math.log10(v))), m = v / p; return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p; }
  function weekly(days) {
    if (days.length <= 120) return { rows: days, week: false };
    var out = [];
    for (var i = 0; i < days.length; i += 7) {
      var g = days.slice(i, i + 7), r = { day: g[0].day, end: g[g.length - 1].day };
      g.forEach(function (d) { for (var k in d) if (typeof d[k] === 'number') r[k] = (r[k] || 0) + d[k]; });
      out.push(r);
    }
    return { rows: out, week: true };
  }
  function chart(box, days, c) {
    var w = weekly(days), rows = w.rows, W = 300, H = 112, L = 30, B = 16, T = 6, n = rows.length;
    var vals = rows.map(function (d) { return d[c.k] || 0; });
    var max = niceMax(Math.max(c.cents ? 1000 : 0, Math.max.apply(null, vals))), slot = (W - L) / n, bw = Math.max(1.5, Math.min(24, slot - 2));
    var total = vals.reduce(function (a, b) { return a + b; }, 0);
    var wrap = el('div', { class: 'chart' }), head = el('div', { class: 't' });
    head.append(el('b', null, c.t), el('span', null, 'Total : ' + c.f(total)));
    wrap.append(head);
    if (c.x) wrap.append(el('p', { class: 'x' }, c.x));
    var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': c.t + ', total ' + c.f(total) });
    var yv = function (v) { return T + (H - B - T) * (1 - v / max); };
    [0, max / 2, max].forEach(function (v) {
      svg.append(svgEl('line', { class: 'gridl', x1: L, x2: W, y1: yv(v), y2: yv(v) }));
      var lab = svgEl('text', { class: 'ax', x: L - 4, y: yv(v) + 3, 'text-anchor': 'end' });
      lab.textContent = c.cents ? (v / 100 >= 1000 ? Math.round(v / 100000) + ' k' : Math.round(v / 100)) : (v >= 1000 ? Math.round(v / 100) / 10 + ' k' : v);
      svg.append(lab);
    });
    var tip = el('div', { class: 'tip' });
    rows.forEach(function (d, i) {
      var v = vals[i], x = L + i * slot + (slot - bw) / 2, y = yv(v), h = Math.max(0, yv(0) - y), r = Math.min(4, bw / 2, h);
      var hit = svgEl('rect', { class: 'hit', x: L + i * slot, y: T, width: slot, height: H - B - T });
      var show = function () {
        tip.textContent = (w.week ? 'Semaine du ' + dateFr(d.day + 'T12:00:00Z').replace(/ \d{4}$/, '') : dateFr(d.day + 'T12:00:00Z')) + ' · ' + c.f(v);
        tip.style.left = ((x + bw / 2) / W * 100) + '%'; tip.style.top = (y / H * 100 + 18) + '%'; tip.style.display = 'block';
      };
      var bar = h > 0 ? svgEl('path', { class: 'barm', d: 'M' + x + ',' + yv(0) + 'V' + (y + r) + 'Q' + x + ',' + y + ' ' + (x + r) + ',' + y + 'H' + (x + bw - r) + 'Q' + (x + bw) + ',' + y + ' ' + (x + bw) + ',' + (y + r) + 'V' + yv(0) + 'Z' }) : null;
      if (bar) svg.append(bar);
      hit.addEventListener('mouseenter', function () { show(); if (bar) bar.classList.add('on'); });
      hit.addEventListener('mouseleave', function () { tip.style.display = 'none'; if (bar) bar.classList.remove('on'); });
      hit.addEventListener('touchstart', show, { passive: true });
      svg.append(hit);
    });
    [[0, 'start'], [n - 1, 'end']].forEach(function (p) {
      var t = svgEl('text', { class: 'ax', x: p[0] === 0 ? L : W, y: H - 3, 'text-anchor': p[1] });
      t.textContent = dateFr(rows[p[0]].day + 'T12:00:00Z').replace(/ \d{4}$/, ''); svg.append(t);
    });
    wrap.append(svg, tip);
    box.append(wrap);
  }
  function charts(box, days, list) { box.textContent = ''; list.forEach(function (c) { chart(box, days, c); }); }
  var N = nf.format.bind(nf), USD = function (v) { return money(v, 'USD'); };
  var DAY_CHARTS = [
    { k: 'visits', t: 'Visites', f: N, x: 'Pages de Stalak ouvertes.' },
    { k: 'signups', t: 'Inscriptions', f: N, x: 'Nouveaux comptes.' },
    { k: 'exportOk', t: 'Vidéos exportées', f: N, x: 'Montages enregistrés.' },
    { k: 'newPro', t: 'Nouveaux abonnés', f: N, x: 'Premiers paiements (pas les renouvellements).' },
  ];
  function table(days) {
    var cols = DAY_CHARTS.concat([{ k: 'revenueUsd', t: 'Encaissé ($)', f: USD }, { k: 'errors', t: 'Erreurs serveur', f: N }]);
    var t = el('table'), hr = el('tr');
    hr.append(el('th', null, 'Jour')); cols.forEach(function (c) { hr.append(el('th', null, c.t)); });
    var th = el('thead'); th.append(hr); t.append(th);
    var tb = el('tbody');
    days.slice().reverse().forEach(function (d) {
      var tr = el('tr'); tr.append(el('td', null, dateFr(d.day + 'T12:00:00Z')));
      cols.forEach(function (c) { tr.append(el('td', null, c.f(d[c.k] || 0))); }); tb.append(tr);
    });
    t.append(tb); return t;
  }
  // a labelled bar list: one hue, the label and the number written next to each bar (no colour legend to decode)
  // (7/11) « Pourquoi les exports ratent »: fu.exportX = { dev_ios: n, ios_memory: n, st_frames: n, … } (admin.js)
  function xfRender(fu) {
    var X = fu.exportX || {}, sub = function (p) { var o = {}; for (var k in X) if (k.indexOf(p) === 0) o[k.slice(p.length)] = X[k]; return o; };
    var DEV = { ios: 'iPhone / iPad', android: 'Android', desktop: 'Ordinateur' }, sd = fu.startDev || {}, od = fu.okDev || {}, fd = sub('dev_');
    var tb = $('#xfDev tbody'); tb.textContent = '';
    ['ios', 'android', 'desktop'].forEach(function (d) {
      var tr = el('tr'), st = sd[d] || 0, ok = od[d] || 0, fl = fd[d] || 0;
      [DEV[d], nf.format(st), nf.format(ok), nf.format(fl), st ? pct(fl, st) + ' %' : '–'].forEach(function (v, i) { tr.append(el(i ? 'td' : 'th', i ? null : { scope: 'row' }, v)); });
      tb.append(tr);
    });
    var failN = Object.keys(fd).reduce(function (n, k) { return n + fd[k]; }, 0), saved = fu.saved || {}, retry = fu.retry || {}, refused = fu.refused || {};
    var savedN = Object.keys(saved).reduce(function (n, k) { return n + saved[k]; }, 0), retryN = Object.keys(retry).reduce(function (n, k) { return n + retry[k]; }, 0);
    var refN = Object.keys(refused).reduce(function (n, k) { return n + refused[k]; }, 0), startN = Object.keys(sd).reduce(function (n, k) { return n + sd[k]; }, 0);
    set('#xfSum', failN || savedN || refN ? nf.format(failN) + ' ratés sur ' + nf.format(startN) + ' lancés (' + pct(failN, startN) + ' %) · ' + nf.format(savedN) + ' rattrapés tout seuls sur ' + nf.format(retryN) + ' nouveaux essais · ' + nf.format(refN) + ' packs refusés (trop gros pour l’appareil)' : 'Aucun export raté avec le détail pour l’instant (compté depuis le 7/11).');
    var cats = {}, devCat = {};
    for (var k in X) { var m = /^(ios|android|desktop)_([a-z]+)$/.exec(k); if (m) { cats[m[2]] = (cats[m[2]] || 0) + X[k]; devCat[k] = X[k]; } }
    blist($('#xfCat'), cats, NAMES.fail);
    blist($('#xfDevCat'), devCat, function (k) { var p = k.split('_'); return DEV[p[0]] + ' · ' + (NAMES.fail[p[1]] || p[1]); }, { max: 8 });
    blist($('#xfSt'), sub('st_'), NAMES.xst);
    var sv = {}; for (var c in retry) sv[c] = saved[c] || 0;
    blist($('#xfSaved'), sv, function (c) { return (NAMES.fail[c] || c) + ' (' + nf.format(saved[c] || 0) + ' / ' + nf.format(retry[c]) + ')'; }, { keepZero: true, noPct: true });
    blist($('#xfFmt'), sub('fmt_'), NAMES.xfmt);
    blist($('#xfKind'), sub('kind_'), NAMES.xkind);
    blist($('#xfMem'), sub('mem_'), NAMES.xmem);
    blist($('#xfDur'), sub('dur_'), NAMES.xdur);
    blist($('#xfTook'), sub('took_'), NAMES.xtook);
  }
  function blist(ul, obj, names, opts) {
    opts = opts || {}; ul.textContent = '';
    var keys = Object.keys(obj || {}).filter(function (k) { return obj[k] > 0 || opts.keepZero; });
    if (opts.order) keys.sort(function (a, b) { return opts.order.indexOf(a) - opts.order.indexOf(b); });
    else keys.sort(function (a, b) { return (a === 'unknown') - (b === 'unknown') || obj[b] - obj[a]; });
    if (opts.max) keys = keys.slice(0, opts.max);
    var total = Object.keys(obj || {}).reduce(function (s, k) { return s + (obj[k] || 0); }, 0), top = Math.max.apply(null, keys.map(function (k) { return obj[k]; }).concat([1]));
    if (!keys.length) { ul.append(el('li', { class: 'empty' }, 'Rien pour l’instant sur cette période.')); return; }
    keys.forEach(function (k) {
      var li = el('li'), lab = typeof names === 'function' ? names(k) : (names[k] || k);
      li.append(el('span', { class: 'nm', title: lab }, lab));
      var tr = el('span', { class: 'tr' }), i = el('i'); i.style.width = (obj[k] / top * 100) + '%'; tr.append(i); li.append(tr);
      var n = el('span', { class: 'n' }); n.append(el('b', null, nf.format(obj[k]))); if (!opts.noPct && total) n.append(document.createTextNode(' · ' + pct(obj[k], total) + ' %'));
      li.append(n); ul.append(li);
    });
  }

  // ---- the globe (d3-geo, orthographic, on a canvas): turn with a finger or the mouse, pinch or +/− to zoom, tap a country.
  //      One hue ramp (light → dark blue) for the chosen figure; the list beside it gives the exact numbers. ----
  var G = { cv: null, ctx: null, proj: null, path: null, feats: null, rot: [-10, -25], k: 1, sel: null, raf: 0, spin: true, data: {}, max: 0, run: false, last: 0 };
  var RAMP = ['--m0', '--m1', '--m2', '--m3', '--m4', '--m5'], REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function cssv(n) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim() || '#999'; }
  function globeInit() {
    if (G.cv || !window.d3 || !window.topojson) return !!G.cv;
    G.cv = $('#globe'); G.ctx = G.cv.getContext('2d');
    G.feats = topojson.feature(WORLD, WORLD.objects.countries).features;
    G.proj = d3.geoOrthographic().precision(0.6).clipAngle(90);
    G.path = d3.geoPath(G.proj, G.ctx);
    var pts = {}, drag = null;
    var size = function () { var w = Math.min(560, G.cv.parentNode.clientWidth || 320), dpr = Math.min(2, window.devicePixelRatio || 1);
      G.cv.width = Math.round(w * dpr); G.cv.height = Math.round(w * dpr); G.w = w; G.dpr = dpr; draw(); };
    window.addEventListener('resize', size); size();
    G.cv.addEventListener('pointerdown', function (e) {
      G.cv.setPointerCapture(e.pointerId); pts[e.pointerId] = [e.clientX, e.clientY]; G.spin = false;
      drag = { x: e.clientX, y: e.clientY, rot: G.rot.slice(), k: G.k, moved: false, d0: dist() }; G.cv.classList.add('drag');
    });
    function dist() { var p = Object.values(pts); return p.length > 1 ? Math.hypot(p[0][0] - p[1][0], p[0][1] - p[1][1]) : 0; }
    G.cv.addEventListener('pointermove', function (e) {
      if (!drag || !pts[e.pointerId]) return; pts[e.pointerId] = [e.clientX, e.clientY];
      var n = Object.keys(pts).length;
      if (n > 1) { var d = dist(); if (!drag.d0) drag.d0 = d; G.k = Math.max(1, Math.min(6, drag.k * d / drag.d0)); drag.moved = true; }
      else {
        var dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
        var sens = 0.35 / G.k; G.rot = [drag.rot[0] + dx * sens, Math.max(-80, Math.min(80, drag.rot[1] - dy * sens))];
      }
      draw();
    });
    function up(e) {
      var wasTap = drag && !drag.moved && Object.keys(pts).length === 1;
      delete pts[e.pointerId];
      if (!Object.keys(pts).length) { G.cv.classList.remove('drag'); if (wasTap) pick(e); drag = null; }
      else if (drag) { var p = Object.values(pts)[0]; drag = { x: p[0], y: p[1], rot: G.rot.slice(), k: G.k, moved: true, d0: 0 }; }
    }
    G.cv.addEventListener('pointerup', up); G.cv.addEventListener('pointercancel', up);
    G.cv.addEventListener('wheel', function (e) { e.preventDefault(); G.spin = false; G.k = Math.max(1, Math.min(6, G.k * (e.deltaY < 0 ? 1.15 : 1 / 1.15))); draw(); }, { passive: false });
    $('#gIn').addEventListener('click', function () { G.spin = false; G.k = Math.min(6, G.k * 1.4); draw(); });
    $('#gOut').addEventListener('click', function () { G.spin = false; G.k = Math.max(1, G.k / 1.4); draw(); });
    G.cv.tabIndex = 0;
    G.cv.addEventListener('keydown', function (e) {
      var k = { ArrowLeft: [-10, 0], ArrowRight: [10, 0], ArrowUp: [0, 10], ArrowDown: [0, -10] }[e.key];
      if (k) { e.preventDefault(); G.spin = false; G.rot = [G.rot[0] + k[0], Math.max(-80, Math.min(80, G.rot[1] + k[1]))]; draw(); }
    });
    return true;
  }
  function pick(e) {
    var r = G.cv.getBoundingClientRect(), x = (e.clientX - r.left) * G.cv.width / r.width, y = (e.clientY - r.top) * G.cv.height / r.height;
    var ll = G.proj.invert([x, y]); if (!ll || isNaN(ll[0])) return;
    // only the front side of the globe can be touched
    if (d3.geoDistance(ll, [-G.rot[0], -G.rot[1]]) > Math.PI / 2) return;
    var f = G.feats.find(function (f) { return d3.geoContains(f, ll); });
    G.sel = f ? f.id : null; draw(); showCountry(G.sel);
  }
  function showCountry(c) {
    var box = $('#gInfo'); box.textContent = '';
    if (!c) { box.append(el('b', null, 'Touche un pays'), el('p', null, 'pour voir ses visiteurs, comptes et abonnés.')); return; }
    var d = S.stats || {}, A = (d.audience || {}).byCountry || {}, P = (d.people || {}).byCountry || {}, B = (d.people || {}).subsByCountry || {};
    box.append(el('b', null, flag(c) + ' ' + (MAP.names[c] || c)),
      el('p', null, nf.format(A[c] || 0) + ' visiteur' + ((A[c] || 0) > 1 ? 's' : '') + ' · ' + nf.format(P[c] || 0) + ' compte' + ((P[c] || 0) > 1 ? 's' : '') + ' créé' + ((P[c] || 0) > 1 ? 's' : '') + ' (période choisie) · ' + nf.format(B[c] || 0) + ' abonné' + ((B[c] || 0) > 1 ? 's' : '') + ' en ce moment'));
  }
  function draw() {
    if (!G.ctx) return;
    var c = G.ctx, W = G.cv.width, s = W / 2 * 0.94 * G.k;
    G.proj.translate([W / 2, W / 2]).scale(s).rotate([G.rot[0], G.rot[1]]);
    c.clearRect(0, 0, W, W);
    var cols = RAMP.map(cssv), line = cssv('--card'), sea = cssv('--sunk'), ink = cssv('--text2');
    c.beginPath(); G.path({ type: 'Sphere' }); c.fillStyle = sea; c.fill();
    c.lineWidth = Math.max(0.5, 0.6 * G.dpr);
    G.feats.forEach(function (f) {
      var v = G.data[f.id] || 0, r = G.max ? v / G.max : 0, i = !v ? 0 : r > .8 ? 5 : r > .6 ? 4 : r > .4 ? 3 : r > .2 ? 2 : 1;
      c.beginPath(); G.path(f); c.fillStyle = cols[i]; c.fill(); c.strokeStyle = line; c.stroke();
    });
    if (G.sel) { var f = G.feats.find(function (x) { return x.id === G.sel; }); if (f) { c.beginPath(); G.path(f); c.lineWidth = 2.5 * G.dpr; c.strokeStyle = cssv('--text'); c.stroke(); } }
    c.beginPath(); G.path({ type: 'Sphere' }); c.lineWidth = 1.5 * G.dpr; c.strokeStyle = ink; c.stroke();
  }
  function loop(t) {
    if (!G.run) return;
    if (G.spin && !REDUCED && !document.hidden) { var dt = G.last ? Math.min(64, t - G.last) : 16; G.rot[0] += dt * 0.006; draw(); }
    G.last = t; G.raf = requestAnimationFrame(loop);
  }
  function globeStart() { if (!globeInit()) return; G.run = true; globeData(); cancelAnimationFrame(G.raf); G.last = 0; G.raf = requestAnimationFrame(loop); }
  function globeStop() { G.run = false; cancelAnimationFrame(G.raf); }
  function globeData() {
    var d = S.stats; if (!d || !d.people) return;
    var data = S.map === 'accounts' ? d.people.byCountry : S.map === 'subs' ? (d.people.subsByCountry || {}) : d.audience.byCountry;
    var known = {}, unknown = 0, max = 0;
    for (var k in data) { if (k === 'unknown') unknown += data[k]; else { known[k] = data[k]; if (data[k] > max) max = data[k]; } }
    G.data = known; G.max = max; draw(); if (G.sel) showCountry(G.sel);
    var what = S.map === 'accounts' ? 'comptes créés' : S.map === 'subs' ? 'abonnés' : 'visiteurs';
    set('#topTitle', 'Pays : ' + what);
    blist($('#topCountries'), known, function (c) { return flag(c) + ' ' + COUNTRY(c); }, { max: 12 });
    set('#mapUnknown', unknown ? nf.format(unknown) + ' ' + what + ' sans pays connu (avant le 1/11, ou pays caché).' : '');
  }
  $$('[data-map]').forEach(function (b) {
    b.addEventListener('click', function () { S.map = b.dataset.map; $$('[data-map]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); globeData(); });
  });
  S.map = 'visits';

  // ---- stats ----
  var PLAN_NAME = { pro: 'Pro', creator: 'Creator Plus', basic: 'Pro', max: 'Creator Plus' };
  function cents(o) { var r = {}; for (var c in o) r[c] = { total: o[c] }; return r; }
  function totalsByCur(o) { var parts = []; for (var cur in o) parts.push(money(o[cur].total, cur)); return parts.length ? parts.join(' + ') : money(0, 'USD'); }
  function sumN(o) { var n = 0; for (var c in o) n += o[c].n || 0; return n; }
  function limitCard(box, title, used, max, unit, text) {
    var r = max ? used / max : 0, st = r >= 1 ? 'bad' : r >= .8 ? 'warn' : 'ok';
    var c = el('div', { class: 'card lim' }), h = el('div', { class: 'row' });
    h.append(el('b', null, title), el('span', { class: 'sp' }), el('span', { class: 'status ' + st }, st === 'ok' ? 'Tout va bien' : st === 'warn' ? 'À surveiller' : 'Limite atteinte'));
    c.append(h, el('div', { class: 'v' }, nf.format(used) + (max ? ' / ' + nf.format(max) : '') + (unit ? ' ' + unit : '')));
    if (max) { var m = el('div', { class: 'meter' + (st === 'ok' ? '' : ' ' + st), role: 'img', 'aria-label': pct(used, max) + ' %' }), i = el('i'); i.style.width = Math.min(100, r * 100) + '%'; m.append(i); c.append(m); }
    c.append(el('p', null, text)); box.append(c);
  }
  function stats() {
    return api('GET', 'stats?days=' + S.days).then(function (d) {
      S.stats = d;
      var t = d.totals, days = d.days, last = days[days.length - 1] || {}, prev = days[days.length - 2] || {};
      var sumK = function (k) { return days.reduce(function (a, x) { return a + (x[k] || 0); }, 0); };
      var label = S.days === 'all' ? 'depuis le début' : 'sur ' + S.days + ' j';
      set('#rangeTxt', 'Du ' + dateFr(d.range.from + 'T12:00:00Z') + ' au ' + dateFr(d.range.to + 'T12:00:00Z') + ' (heure UTC).');
      // test figures (Paddle sandbox): marked everywhere
      $('#testTag').hidden = !d.test; $('#testNote').classList.toggle('show', !!d.test);
      $$('[data-test]').forEach(function (x) { x.hidden = !d.test; });
      // Aujourd'hui
      set('#kVisT', nf.format(last.visits || 0)); set('#kVisTS', 'Hier : ' + nf.format(prev.visits || 0));
      set('#kSignT', nf.format(last.signups || 0)); set('#kSignTS', 'Hier : ' + nf.format(prev.signups || 0));
      set('#kExpT', nf.format(last.exportOk || 0)); set('#kExpTS', 'Ratées : ' + nf.format(last.exportFail || 0) + ' · hier ' + nf.format(prev.exportOk || 0));
      set('#kPro', nf.format(t.pro.total));
      set('#kProS', t.pro.month + ' mensuels · ' + t.pro.year + ' annuels' + (t.pro.ending ? ' · ' + t.pro.ending + ' arrêt prévu' : ''));
      set('#kMrr', totalsByCur(cents(t.mrr || { USD: t.mrrCents })));
      set('#kMrrS', 'Avant taxes, en dollars');
      // Utilisateurs
      var P = d.people || {}, A = d.audience || {};
      set('#kUsers', nf.format(t.users)); set('#kUsersS', t.verified + ' avec e-mail vérifié');
      set('#kNew', nf.format(sumK('signups'))); set('#kNewS', label);
      set('#kBack', nf.format(P.returningAccounts || 0)); set('#kBackS', label);
      var rt = A.returning || { yes: 0, no: 0, unknown: 0 };
      set('#kRet', (rt.yes + rt.no ? pct(rt.yes, rt.yes + rt.no) : 0) + ' %'); set('#kRetS', nf.format(rt.yes) + ' visites de retour sur ' + nf.format(rt.yes + rt.no) + ' ' + label);
      globeData();
      charts($('#charts'), days, DAY_CHARTS);
      var tw = $('#tableWrap'); tw.textContent = ''; tw.append(table(days));
      blist($('#bMethod'), P.byMethod, NAMES.method);
      blist($('#bDevU'), P.byDevice, NAMES.device, { order: ['ios', 'android', 'desktop', 'unknown'] });
      blist($('#bLang'), P.byLang, NAMES.lang);
      blist($('#bSource'), A.bySource, NAMES.source, { max: 10 });
      blist($('#bDevV'), A.byDevice, NAMES.device, { order: ['ios', 'android', 'desktop', 'unknown'] });
      blist($('#bLangV'), A.byLang, NAMES.lang);
      var tb = $('#users tbody'); tb.textContent = '';
      d.recentUsers.forEach(function (r) {
        var tr = el('tr'); tr.append(el('td', null, r.email), el('td', null, r.name || '–'), el('td', null, dateFr(r.createdAt, true)), el('td', null, r.verified ? 'oui' : 'non'), el('td', null, r.plan ? PLAN_NAME[r.plan] || r.plan : '–')); tb.append(tr);
      });
      if (!d.recentUsers.length) { var tr0 = el('tr'), td0 = el('td', { colspan: '5' }, 'Personne pour l’instant.'); tr0.append(td0); tb.append(tr0); }
      set('#visitsKept', 'Les visites sont gardées ' + (d.range.visitsKeptDays || 90) + ' jours ; les comptes, tant qu’ils existent.' + (S.days === 'all' || S.days === '90' ? ' Sur « Tout », les visites ne remontent donc qu’à 90 jours.' : ''));
      // Argent
      var M = d.money || {};
      set('#mPro', nf.format(t.pro.total)); set('#mProS', t.pro.month + ' mensuels · ' + t.pro.year + ' annuels');
      set('#mMrr', totalsByCur(cents(t.mrr || { USD: t.mrrCents })));
      var rev = {}; days.forEach(function (x) { if (x.revenueUsd) rev.USD = { total: ((rev.USD || {}).total || 0) + x.revenueUsd }; if (x.revenue) rev.EUR = { total: ((rev.EUR || {}).total || 0) + x.revenue }; });
      set('#kRev', totalsByCur(rev)); set('#kRevS', 'Depuis le début : ' + totalsByCur(t.revenue.all));
      set('#mNew', nf.format(sumN(M.newSubscribers || {}))); set('#mNewS', label + (sumN(M.newSubscribers || {}) ? ' · ' + totalsByCur(M.newSubscribers) : ''));
      set('#mChurn', nf.format(M.canceled || 0)); set('#mChurnS', label + ' · arrêt prévu : ' + nf.format(M.ending || 0) + (t.pro.total ? ' (' + pct(M.ending || 0, t.pro.total) + ' % des abonnés)' : ''));
      set('#mRef', totalsByCur(M.refunds || {})); set('#mRefS', nf.format(sumN(M.refunds || {})) + ' remboursement(s) ' + label);
      var pb = $('#plans tbody'); pb.textContent = '';
      ['pro', 'creator'].forEach(function (k) {
        var p = (t.plans || {})[k] || { total: 0, month: 0, year: 0, ending: 0, mrr: {}, revenue: {}, revenue30: {} };
        var tr = el('tr'); tr.append(el('th', { scope: 'row' }, PLAN_NAME[k]), el('td', null, nf.format(p.total)), el('td', null, nf.format(p.month)),
          el('td', null, nf.format(p.year)), el('td', null, nf.format(p.ending)), el('td', null, totalsByCur(cents(p.mrr || {}))),
          el('td', null, totalsByCur(p.revenue30)), el('td', null, totalsByCur(p.revenue)));
        pb.append(tr);
      });
      charts($('#moneyCharts'), days, [{ k: 'revenueUsd', t: 'Encaissé (dollars)', f: USD, cents: true, x: 'Paiements reçus chaque jour.' }, { k: 'newPro', t: 'Nouveaux abonnés', f: N, x: 'Premiers paiements.' }]);
      // Entonnoir
      var fu = d.usage.funnel, fb = $('#funnel'); fb.textContent = '';
      if (fu) {
        var steps = [['Visites', fu.visits, 'pages de Stalak ouvertes'], ['Vidéos exportées', fu.exportOk, 'montages enregistrés'], ['Offre Pro vue', fu.proOffer || 0, 'après la 1re vidéo'],
          ['Page des formules', fu.plansOpen, 'ouverte'], ['Fenêtre de paiement', fu.checkoutOpen, 'Paddle ouvert'], ['Abonnés', fu.paid, 'premiers paiements']];
        var top = Math.max(1, steps[0][1] || 0);
        steps.forEach(function (st, i) {
          var row = el('div', { class: 'fstep' }), lab = el('div', { class: 'lab' });
          lab.append(el('b', null, st[0]), el('small', null, st[2]));
          var tr = el('div', { class: 'tr' }), bar = el('i'); bar.style.width = Math.max(1, (st[1] || 0) / top * 100) + '%';
          tr.append(bar, el('span', null, nf.format(st[1] || 0)));
          var prevV = i ? steps[i - 1][1] : 0, rate = el('div', { class: 'rate' });
          rate.append(document.createTextNode(i ? (prevV ? pct(st[1] || 0, prevV) + ' %' : '–') : '100 %'));
          rate.append(el('small', null, i ? 'de l’étape d’avant' : 'point de départ'));
          row.append(lab, tr, rate); fb.append(row);
        });
        var ex = { ok: fu.exportOk || 0 }; var fw = fu.exportFailWhy || {};
        var exObj = { 'Réussies': fu.exportOk || 0 }; for (var k in fw) exObj['Ratées : ' + (NAMES.fail[k] || k)] = fw[k];
        blist($('#bExport'), exObj, function (x) { return x; }, { order: Object.keys(exObj) });
        blist($('#bWhy'), fu.plansWhy || {}, NAMES.why);
        xfRender(fu);
      }
      charts($('#funnelCharts'), days, [{ k: 'exportOk', t: 'Vidéos exportées', f: N, x: 'Réussies.' }, { k: 'exportFail', t: 'Exports ratés', f: N, x: 'Erreur pendant l’export (voir les raisons plus haut).' }]);   // no more ad (owner's decision of 6/11): the « Pubs regardées » chart is gone
      // Santé
      var L = d.limits || {}, u = d.usage, lb = $('#limits'); lb.textContent = '';
      var tg = L.telegram || { state: 'no_token' }, ts = $('#tgState');
      ts.className = 'status ' + (tg.state === 'linked' ? 'ok' : 'warn');
      ts.textContent = tg.state === 'linked' ? 'Telegram relié' + (tg.name ? ' (' + tg.name + ')' : '') : tg.state === 'not_linked' ? 'Telegram pas encore relié' : 'Clé du bot manquante (TELEGRAM_BOT_TOKEN)';
      $('#tgUnlink').hidden = tg.state !== 'linked'; $('#tgLink').disabled = tg.state === 'no_token';
      set('#ntfyState', 'ntfy (facultatif) : ' + (L.ntfy ? 'activé aussi (NTFY_TOPIC rempli).' : 'pas utilisé (NTFY_TOPIC vide).'));
      if (L.codeMails) limitCard(lb, 'E-mails de code aujourd’hui', L.codeMails.today, L.codeMails.max, '', 'Codes envoyés pour créer un compte, se connecter ou changer de mot de passe. Au-delà de la limite, ils attendent minuit (UTC).');
      if (L.help) limitCard(lb, 'Questions au glaçon d’aide (IA) aujourd’hui', L.help.today, L.help.max, '', 'L’assistant répond jusqu’à cette limite par jour, pour garder la facture IA sous contrôle.');
      if (L.lyrics) limitCard(lb, 'Paroles automatiques aujourd’hui', L.lyrics.todayMinutes, L.lyrics.freeMinutes, 'min', 'Minutes de son transcrites. Environ ' + L.lyrics.freeMinutes + ' min par jour sont gratuites chez Cloudflare ; au-delà, il faut le forfait payant (5 $/mois).');
      if (L.storage) { var c = el('div', { class: 'card lim' }); c.append(el('b', null, 'Stockage des projets en ligne'), el('div', { class: 'v' }, L.storage.bytes >= 1e9 ? (L.storage.bytes / 1e9).toLocaleString('fr-FR', { maximumFractionDigits: 2 }) + ' Go' : Math.round(L.storage.bytes / 1e6).toLocaleString('fr-FR') + ' Mo'), el('p', null, 'Vidéos et sons des projets Creator Plus (100 Go au plus par compte). Environ 0,015 $ par Go et par mois chez Cloudflare.')); lb.append(c); }
      var h = u.health || {};
      var ec = el('div', { class: 'card lim' }), st = (L.errorsToday || 0) === 0 ? 'ok' : L.errorsToday < 10 ? 'warn' : 'bad', hr2 = el('div', { class: 'row' });
      hr2.append(el('b', null, 'Erreurs du serveur'), el('span', { class: 'sp' }), el('span', { class: 'status ' + st }, st === 'ok' ? 'Aucune aujourd’hui' : nf.format(L.errorsToday) + ' aujourd’hui'));
      ec.append(hr2, el('div', { class: 'v' }, nf.format(sumK('errors')) + ' ' + label), el('p', null, 'Une erreur = une demande que le serveur n’a pas pu traiter. Tu reçois un e-mail d’alerte (une fois par heure au plus). Alertes envoyées sur 30 j : ' + nf.format(h.alerts30 || 0) + '.'));
      lb.append(ec);
      charts($('#healthCharts'), days, [{ k: 'errors', t: 'Erreurs serveur', f: N, x: 'Demandes qui ont échoué côté serveur.' }, { k: 'codeMails', t: 'E-mails de code', f: N, x: 'Codes envoyés par jour.' }]);
      var us = $('#usage'); us.textContent = '';
      function block(title, lines) { var b = el('div'); b.append(el('h3', null, title)); lines.forEach(function (l) { var p = el('p', { class: 'note' }, l[0] + ' '); p.append(el('b', null, l[1])); b.append(p); }); us.append(b); }
      block('Paroles automatiques', [['Transcriptions :', nf.format(u.lyrics.jobs30)], ['Minutes de son :', nf.format(u.lyrics.minutes30)]]);
      block('Sauvegarde en ligne', [['Projets gardés :', nf.format(u.cloud.projects)], ['Comptes qui l’utilisent :', nf.format(u.cloud.users)], ['Nouveaux projets :', nf.format(u.cloud.saves30)]]);
      block('Aide', [['Questions au glaçon :', nf.format(u.help.questions30)], ['Sans réponse :', nf.format(u.help.failed30)], ['Messages « humain » :', nf.format(u.tickets.created30)]]);
    }).catch(function (e) { if (e.code !== 'access') banner('Les chiffres n’ont pas pu être chargés (' + e.message + ').'); });
  }
  $$('[data-days]').forEach(function (b) {
    b.addEventListener('click', function () {
      S.days = b.dataset.days; $$('[data-days]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); stats();
    });
  });
  $('#ntfyBtn').addEventListener('click', function () {
    var b = this, out = $('#ntfyOut'); b.disabled = true; out.textContent = 'Envoi…';
    api('POST', 'notify-test', {}).then(function (r) {
      out.textContent = !r.configured ? 'Rien envoyé : relie d’abord ton Telegram (ou remplis NTFY_TOPIC).'
        : r.sent ? 'Envoyée ! Ton téléphone devrait sonner dans quelques secondes.' + (r.telegram === 'failed' ? ' (Telegram n’a pas répondu, ntfy oui.)' : r.ntfy === 'failed' ? ' (ntfy n’a pas répondu.)' : '')
        : 'Telegram n’a pas répondu. Réessaie dans une minute.';
    }).catch(function (e) { out.textContent = 'Pas envoyée : ' + e.message; }).then(function () { b.disabled = false; });
  });
  $('#thanksBtn').addEventListener('click', function () {
    var b = this, out = $('#thanksOut'); b.disabled = true; out.textContent = 'Envoi…';
    api('POST', 'thanks-test', {}).then(function (r) {
      out.textContent = r.fr && r.en ? 'Envoyés à ' + r.to + ' : un en français (Creator Plus, un an) et un en anglais (Stalak Pro, mensuel). Regarde ta boîte dans une minute.'
        : (r.fr || r.en) ? 'Un seul est parti (' + (r.fr ? 'français' : 'anglais') + '). Réessaie dans une minute.'
        : 'Pas envoyés : Resend n’a pas répondu (ou la clé RESEND_API_KEY manque).';
    }).catch(function (e) { out.textContent = 'Pas envoyés : ' + e.message; }).then(function () { b.disabled = false; });
  });
  var TG_ERR = { telegram_no_start: 'Je ne trouve pas ton /start : ouvre ton bot dans Telegram, envoie /start, puis réessaie (dans les 15 minutes).',
    telegram_several: 'Plusieurs personnes ont écrit /start à ton bot : renvoie /start toi-même, attends 15 minutes que les autres expirent, puis réessaie.',
    telegram_bad_token: 'Telegram refuse la clé du bot : vérifie TELEGRAM_BOT_TOKEN dans Cloudflare.',
    telegram_webhook: 'Ce bot est relié à un autre service (webhook) : utilise un bot à toi seul.',
    telegram_no_token: 'Ajoute d’abord la clé du bot (TELEGRAM_BOT_TOKEN) dans Cloudflare.', telegram_unreachable: 'Telegram n’a pas répondu. Réessaie dans une minute.' };
  $('#tgLink').addEventListener('click', function () {
    var b = this, out = $('#ntfyOut'); b.disabled = true; out.textContent = 'Recherche de ton /start…';
    api('POST', 'telegram-link', {}).then(function (r) {
      out.textContent = 'Relié' + (r.name ? ' à ' + r.name : '') + ' ! Un message de confirmation vient de partir dans Telegram.'; stats();
    }).catch(function (e) { out.textContent = TG_ERR[e.code] || ('Pas relié : ' + e.message); }).then(function () { b.disabled = false; });
  });
  $('#tgUnlink').addEventListener('click', function () {
    if (!confirm('Ne plus recevoir les notifications sur ce Telegram ?')) return;
    api('POST', 'telegram-unlink', {}).then(function () { $('#ntfyOut').textContent = 'Telegram délié.'; stats(); }).catch(function (e) { $('#ntfyOut').textContent = e.message; });
  });
  $('#tableBtn').addEventListener('click', function () {
    var w = $('#tableWrap'), on = !w.classList.contains('show'); w.classList.toggle('show', on);
    this.setAttribute('aria-expanded', on ? 'true' : 'false'); this.textContent = on ? 'Cacher le tableau' : 'Voir en tableau';
  });

  // ---- messages ----
  function tickets() {
    return api('GET', 'tickets?status=' + S.status).then(function (d) {
      var box = $('#tlist'); box.textContent = '';
      if (!d.tickets.length) { box.append(el('div', { class: 'empty' }, S.status === 'open' ? 'Aucun message en attente.' : 'Rien ici.')); return; }
      d.tickets.forEach(function (t) {
        var b = el('button', { type: 'button', 'data-id': t.id, 'aria-current': S.open === t.id ? 'true' : 'false' });
        var l1 = el('div', { class: 'l1' });
        l1.append(el('b', null, t.email || 'Visiteur sans e-mail'));
        l1.append(t.pro ? el('span', { class: 'pro', title: 'Abonné Stalak ' + (PLAN_NAME[t.plan] || 'Pro') }, PLAN_NAME[t.plan] || 'Pro') : el('span', { class: 'pro off', title: t.account ? 'Compte sans abonnement' : 'Sans compte' }, t.account ? 'gratuit' : 'invité'));
        if (t.unread) l1.append(el('span', { class: 'badge' }, 'nouveau'));
        if (t.visitorLive) l1.append(el('span', { class: 'pill on' }, 'en ligne'));
        b.append(l1, el('div', { class: 'l2' }, (t.lastFrom === 'admin' ? 'Toi : ' : '') + t.lastText), el('div', { class: 'l2' }, ago(t.updatedAt) + ' · ' + t.lang.toUpperCase() + (t.account ? ' · compte' : '') + (t.status === 'closed' ? ' · fermé' : '')));
        b.addEventListener('click', function () { openTicket(t.id); });
        box.append(b);
      });
    }).catch(function (e) { if (e.code !== 'access') banner(e.message); });
  }
  $$('[data-st]').forEach(function (b) {
    b.addEventListener('click', function () {
      S.status = b.dataset.st; $$('[data-st]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); tickets();
    });
  });
  function renderMsgs(box, msgs) {
    msgs.forEach(function (m) {
      var d = el('div', { class: 'm ' + (m.from === 'admin' ? 'admin' : 'user') }, m.text);
      d.append(el('small', null, (m.from === 'admin' ? 'Toi' : 'Visiteur') + ' · ' + dateFr(m.at, true) + (m.emailed ? ' · envoyé par e-mail' : '')));
      box.append(d);
    });
    box.scrollTop = box.scrollHeight;
  }
  function openTicket(id, keepDraft) {
    S.open = id;
    try { history.replaceState(null, '', '#t=' + encodeURIComponent(id)); } catch (e) {}
    $$('#tlist button').forEach(function (b) { b.setAttribute('aria-current', b.dataset.id === id ? 'true' : 'false'); });
    return api('GET', 'tickets/' + encodeURIComponent(id)).then(function (t) {
      var conv = $('#conv'), draft = keepDraft && $('#replyText') ? $('#replyText').value : '';
      conv.textContent = '';
      var head = el('div', { class: 'head' });
      head.append(el('b', null, t.email || 'Visiteur sans e-mail'), t.account && t.account.pro ? el('span', { class: 'pro' }, PLAN_NAME[t.account.plan] || 'Pro') : el('span', { class: 'pro off' }, t.account ? 'gratuit' : 'invité'), el('span', { class: 'pill' + (t.visitorLive ? ' on' : '') }, t.visitorLive ? 'en ligne, il voit ta réponse' : (t.visitorSeenAt ? 'vu ' + ago(t.visitorSeenAt) : 'absent')));
      head.append(el('span', { class: 'sp' }));
      var close = el('button', { type: 'button', class: 'btn small' }, t.status === 'open' ? 'Fermer' : 'Rouvrir');
      close.addEventListener('click', function () { api('POST', 'tickets/' + encodeURIComponent(id) + '/status', { status: t.status === 'open' ? 'closed' : 'open' }).then(function () { tickets(); openTicket(id); }); });
      var del = el('button', { type: 'button', class: 'btn small danger' }, 'Supprimer');
      del.addEventListener('click', function () {
        if (!confirm('Supprimer cette conversation pour de bon ?')) return;
        api('DELETE', 'tickets/' + encodeURIComponent(id), {}).then(function () { S.open = null; $('#conv').textContent = ''; $('#conv').append(el('div', { class: 'empty' }, 'Conversation supprimée.')); tickets(); });
      });
      head.append(close, del);
      var info = el('div', { class: 'info' });
      info.append(el('span', null, 'Ouvert ' + dateFr(t.createdAt, true) + ' · ' + t.lang.toUpperCase() + (t.account ? ' · compte ' + t.account.email + (t.account.pro ? ' (' + (PLAN_NAME[t.account.plan] || 'Pro') + ' ' + (t.account.interval === 'year' ? 'annuel' : 'mensuel') + ')' : ' (gratuit)') : ' · sans compte')));
      if (t.context) { var det = el('details'), sum = el('summary', null, 'Ce que montrait la page'); det.append(sum, el('pre', null, t.context)); info.append(det); }
      var msgs = el('div', { class: 'msgs', 'aria-live': 'polite' });
      renderMsgs(msgs, t.messages);
      S.sig = t.messages.length + ':' + t.messages.filter(function (m) { return m.emailed; }).length + ':' + t.visitorLive;
      var form = el('form', { class: 'reply' });
      var ta = el('textarea', { id: 'replyText', 'aria-label': 'Ta réponse', placeholder: 'Ta réponse… (Ctrl + Entrée pour envoyer)', maxlength: '2000' });
      ta.value = draft;
      var row = el('div', { class: 'row' }), lab = el('label', { for: 'replyMail' }, 'Par e-mail :');
      var sel = el('select', { id: 'replyMail' });
      [['auto', t.email ? 'si absent' : 'pas d’adresse'], ['yes', 'toujours'], ['no', 'jamais']].forEach(function (o) { var op = el('option', { value: o[0] }, o[1]); sel.append(op); });
      if (!t.email) sel.disabled = true;
      var send = el('button', { type: 'submit', class: 'btn primary' }, 'Envoyer');
      row.append(lab, sel, el('span', { class: 'sp' }), send);
      var out = el('p', { class: 'note', role: 'status' });
      form.append(ta, row, out);
      ta.addEventListener('keydown', function (e) { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); form.requestSubmit(); } });
      form.addEventListener('submit', function (e) {
        e.preventDefault(); var text = ta.value.trim(); if (!text) return;
        send.disabled = true; out.textContent = 'Envoi…';
        api('POST', 'tickets/' + encodeURIComponent(id) + '/messages', { text: text, email: sel.value }).then(function (r) {
          ta.value = ''; out.textContent = r.emailed ? 'Envoyé, et parti par e-mail.' : (t.email && sel.value !== 'no' ? 'Envoyé. S’il ne le voit pas ici dans les 20 s, il le recevra par e-mail.' : 'Envoyé.');
          msgs.textContent = ''; renderMsgs(msgs, r.messages); S.sig = ''; tickets();
        }).catch(function (err) { out.textContent = 'Pas envoyé : ' + err.message; }).then(function () { send.disabled = false; });
      });
      conv.append(head, info, msgs, form);
      if (!keepDraft) ta.focus();
    }).catch(function (e) { if (e.code !== 'access') { $('#conv').textContent = ''; $('#conv').append(el('div', { class: 'empty' }, 'Conversation introuvable.')); } });
  }
  // the open conversation: new messages from the visitor every 4 s
  function refreshOpen() {
    if (!S.open || document.hidden) return;
    api('GET', 'tickets/' + encodeURIComponent(S.open)).then(function (t) {
      var sig = t.messages.length + ':' + t.messages.filter(function (m) { return m.emailed; }).length + ':' + t.visitorLive;
      if (sig !== S.sig) openTicket(S.open, true);
    }).catch(function () {});
  }

  // a link from an e-mail (#t=<conversation>) opens the Messages tab on it; #users, #money… open that tab
  var tm = location.hash.match(/^#t=([\w-]+)$/), th = location.hash.replace('#', '');
  helpButtons();
  showTab(tm ? 'msgs' : th);
  api('GET', 'me').then(function (d) { set('#who', d.email); }).catch(function () {});
  live(); stats(); tickets().then(function () { if (tm) openTicket(decodeURIComponent(tm[1])); });
  S.timers.live = setInterval(live, 10000);
  S.timers.open = setInterval(refreshOpen, 4000);
  S.timers.list = setInterval(function () { if (!document.hidden) tickets(); }, 20000);
  S.timers.stats = setInterval(function () { if (!document.hidden) stats(); }, 300000);
})();
</script>
</body>
</html>`;

// The demo of previews (functions/admin-demo/[[path]].js): the same page, answered in the browser by MADE-UP figures
// (admin-demo-data.js, built by tools/admin_demo_data.mjs with the real dashboard code on a fake database). It sends nothing.
const DEMO_JS = String.raw`var DD = __DEMO_DATA__, DS = { avail: false, tickets: [
    { id: 't_demo1', email: 'fan12_3@demo.stalak', pro: true, plan: 'creator', account: true, lang: 'en', status: 'open', unread: true, visitorLive: true,
      createdAt: new Date(Date.now() - 36e5).toISOString(), updatedAt: new Date(Date.now() - 6e5).toISOString(),
      messages: [{ from: 'user', text: 'Hi! My export stops at 80% on my iPhone, what can I do?', at: new Date(Date.now() - 6e5).toISOString() }] },
    { id: 't_demo2', email: 'fan30_1@demo.stalak', pro: true, plan: 'pro', account: true, lang: 'fr', status: 'open', unread: false, visitorLive: false,
      createdAt: new Date(Date.now() - 864e5).toISOString(), updatedAt: new Date(Date.now() - 5e6).toISOString(),
      messages: [{ from: 'user', text: 'Comment je mets les paroles en karaoké ?', at: new Date(Date.now() - 6e6).toISOString() },
        { from: 'admin', text: 'Étape Paroles → Style → Karaoké. Dis-moi si ça marche !', at: new Date(Date.now() - 5e6).toISOString(), emailed: true }] }] };
  function DEMO_API(method, path, body) {
    var p = path.split('?')[0], q = new URLSearchParams(path.split('?')[1] || ''), r = null, m;
    var row = function (t) { var last = t.messages[t.messages.length - 1]; return { id: t.id, email: t.email, pro: t.pro, plan: t.plan, account: t.account, lang: t.lang, status: t.status,
      unread: t.unread && last.from === 'user', visitorLive: t.visitorLive, lastFrom: last.from, lastText: last.text, updatedAt: t.updatedAt }; };
    if (p === 'me') r = { email: 'démo (fausses données)' };
    else if (p === 'live') r = { visitors: { total: 7, en: 5, fr: 2 }, availableSwitch: DS.avail, available: DS.avail,
      tickets: { open: DS.tickets.filter(function (t) { return t.status === 'open'; }).length, unread: DS.tickets.filter(function (t) { return row(t).unread; }).length } };
    else if (p === 'home') r = DD.home;
    else if (p === 'stats') r = DD.stats[q.get('days') || '30'] || DD.stats['30'];
    else if (p === 'videos') r = DD.videos[q.get('period') === '30' ? '30' : '7'];
    else if (p === 'hours') r = DD.hours[(q.get('period') || 'today') + '_' + (q.get('tz') || 'paris')] || DD.hours.today_paris;
    else if (p === 'signups') { var b = q.get('before'), i = 0; if (b) { DD.signups.forEach(function (pg, k) { if (String(pg.more) === b) i = k + 1; }); } r = DD.signups[i] || { signups: [], more: null }; }
    else if (p === 'tickets') { var st = q.get('status') || 'open'; r = { tickets: DS.tickets.filter(function (t) { return st === 'all' || t.status === st; }).map(row) }; }
    else if ((m = /^tickets\/([\w-]+)(\/(messages|status))?$/.exec(p))) {
      var t = DS.tickets.find(function (x) { return x.id === m[1]; });
      if (!t) return Promise.reject(Object.assign(new Error('Introuvable'), { code: 'not_found' }));
      if (method === 'DELETE') { DS.tickets = DS.tickets.filter(function (x) { return x !== t; }); r = { ok: true }; }
      else if (m[3] === 'messages') { t.messages.push({ from: 'admin', text: body.text, at: new Date().toISOString(), emailed: !t.visitorLive }); t.unread = false; t.updatedAt = new Date().toISOString(); r = { emailed: !t.visitorLive, messages: t.messages }; }
      else if (m[3] === 'status') { t.status = body.status; r = { ok: true }; }
      else { t.unread = false; r = { id: t.id, email: t.email, status: t.status, lang: t.lang, createdAt: t.createdAt, visitorLive: t.visitorLive, visitorSeenAt: t.updatedAt,
        account: { email: t.email, pro: t.pro, plan: t.plan, interval: 'month' }, context: 'Démo : ce que montrait la page.', messages: t.messages }; }
    }
    else if (p === 'available') { DS.avail = !!body.available; r = { availableSwitch: DS.avail }; }
    else if (p === 'notify-test' || p === 'ntfy-test') r = { configured: true, sent: true, telegram: 'sent', ntfy: false };
    else if (p === 'thanks-test') r = { to: 'toi@demo.stalak', fr: true, en: true };
    else if (p === 'telegram-link') r = { linked: true, name: 'Démo' };
    else if (p === 'telegram-unlink') r = { linked: false };
    else return Promise.reject(Object.assign(new Error('Pas dans la démo'), { code: 'demo' }));
    return new Promise(function (res) { setTimeout(function () { res(JSON.parse(JSON.stringify(r))); }, 120); });
  }`;
const fill = (page, demo) => page
  .replace('__GLOBE_LIBS__', () => GLOBE_LIBS)
  .replace('__WORLD__', () => JSON.stringify(WORLD_TOPO))
  .replace('__MAP__', () => JSON.stringify({ names: COUNTRY_NAMES_FR }))
  .replace('__DEMO__', demo ? 'true' : 'false')
  .replace('__DEMO_JS__', () => (demo ? DEMO_JS.replace('__DEMO_DATA__', () => JSON.stringify(DEMO_DATA)) : 'var DEMO_API = null;'))
  .replace('__DEMO_BANNER__', demo ? '<div class="demo" role="note">DÉMO avec de fausses données, pour voir le tableau de bord avant la mise en ligne. Le vrai est sur admin.stalak.app.</div>\n' : '');
export const ADMIN_HTML = fill(PAGE, false);
export const ADMIN_DEMO_HTML = fill(PAGE, true);
