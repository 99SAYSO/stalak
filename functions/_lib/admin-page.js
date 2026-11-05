// The owner's dashboard page (admin.stalak.app/admin/), sent by functions/admin/[[path]].js only after the Cloudflare Access
// check (admin.js). It holds no data: it reads /api/admin/* (same checks). __NONCE__ is replaced per request (CSP).
// New dashboard (owner's request of 1/11): Stalak's style made calmer (light cards, ink outline, big figures, brand blue),
// 6 tabs (Aujourd'hui, Utilisateurs, Argent, Entonnoir, Messages, Santé), every figure explained in one plain sentence,
// a period switch (7 d, 30 d, 90 d, all), a world map by country, test figures (Paddle sandbox) marked « TEST ».
// Charts follow the dataviz rules: one measure per chart (no second axis), one hue (the brand blue) for magnitude, a
// sequential blue ramp for the map, labelled bar lists instead of many colours, rounded data-ends, tooltips, a table view.
// Written with String.raw: no backtick and no dollar-brace inside.
import { MAP_W, MAP_H, MAP_PATHS, COUNTRY_NAMES_FR } from './admin-map.js';

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
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
</style>
</head>
<body>
<header class="top"><div class="in">
  <div class="brand"><img src="/icons/icon-192.png" alt="" width="38" height="38"><h1>Tableau de bord</h1></div>
  <span class="who" id="who"></span>
  <span class="sp"></span>
  <span class="pill" id="availPill"><span class="dot"></span><span id="availTxt">…</span></span>
  <label class="switch"><input type="checkbox" id="availSw"><span>Je suis disponible</span></label>
</div></header>
<div class="wrap">
  <div class="banner" id="banner" role="alert"></div>
  <div class="bar">
    <div class="seg" role="group" aria-label="Période"><button type="button" data-days="7" aria-pressed="false">7 j</button><button type="button" data-days="30" aria-pressed="true">30 j</button><button type="button" data-days="90" aria-pressed="false">90 j</button><button type="button" data-days="all" aria-pressed="false">Tout</button></div>
    <span class="note" id="rangeTxt"></span>
    <span class="sp"></span>
    <span class="test" id="testTag" hidden>TEST</span>
  </div>
  <p class="testnote" id="testNote" role="note">Les abonnements et l’argent affichés viennent des <b>paiements de test</b> (Paddle « sandbox ») : ce n’est pas de l’argent réel. Ils disparaîtront tout seuls au passage aux vrais paiements.</p>
  <nav class="tabs" role="tablist" aria-label="Rubriques">
    <button class="tab" role="tab" id="tab-today" aria-controls="p-today" aria-selected="true">Aujourd’hui</button>
    <button class="tab" role="tab" id="tab-users" aria-controls="p-users" aria-selected="false" tabindex="-1">Utilisateurs</button>
    <button class="tab" role="tab" id="tab-money" aria-controls="p-money" aria-selected="false" tabindex="-1">Argent <span class="test" data-test hidden>TEST</span></button>
    <button class="tab" role="tab" id="tab-funnel" aria-controls="p-funnel" aria-selected="false" tabindex="-1">Entonnoir</button>
    <button class="tab" role="tab" id="tab-msgs" aria-controls="p-msgs" aria-selected="false" tabindex="-1">Messages <span class="badge" id="tabBadge" hidden></span></button>
    <button class="tab" role="tab" id="tab-health" aria-controls="p-health" aria-selected="false" tabindex="-1">Santé du serveur</button>
  </nav>

  <!-- ===== Aujourd'hui ===== -->
  <section class="panel" role="tabpanel" id="p-today" aria-labelledby="tab-today">
    <p class="intro">L’essentiel en un coup d’œil. Les chiffres « aujourd’hui » repartent de zéro chaque nuit à 1 h (heure de Paris, minuit UTC).</p>
    <div class="kpis">
      <div class="kpi"><div class="k">Visiteurs en direct</div><div class="v" id="kLive">–</div><div class="d" id="kLiveS">&nbsp;</div><div class="e">Personnes qui ont Stalak ouvert en ce moment (vues dans les 6 dernières minutes).</div></div>
      <div class="kpi"><div class="k">Visites aujourd’hui</div><div class="v" id="kVisT">–</div><div class="d" id="kVisTS">&nbsp;</div><div class="e">Chaque page de Stalak ouverte compte pour une visite.</div></div>
      <div class="kpi"><div class="k">Inscriptions aujourd’hui</div><div class="v" id="kSignT">–</div><div class="d" id="kSignTS">&nbsp;</div><div class="e">Comptes créés aujourd’hui (e-mail ou Google).</div></div>
      <div class="kpi"><div class="k">Vidéos exportées aujourd’hui</div><div class="v" id="kExpT">–</div><div class="d" id="kExpTS">&nbsp;</div><div class="e">Montages enregistrés sur un téléphone ou un ordinateur.</div></div>
      <div class="kpi"><div class="k">Abonnés <span class="test" data-test hidden>TEST</span></div><div class="v" id="kPro">–</div><div class="d" id="kProS">&nbsp;</div><div class="e">Personnes qui paient Pro ou Creator Plus en ce moment.</div></div>
      <div class="kpi"><div class="k">Revenu mensuel <span class="test" data-test hidden>TEST</span></div><div class="v" id="kMrr">–</div><div class="d" id="kMrrS">&nbsp;</div><div class="e">Ce que rapportent les abonnements chaque mois (un annuel compte pour un douzième), avant taxes.</div></div>
      <div class="kpi"><div class="k">Messages à traiter</div><div class="v" id="kTix">–</div><div class="d" id="kTixS">&nbsp;</div><div class="e">Messages d’abonnés (« Parler à un humain ») sans réponse de ta part.</div></div>
    </div>
    <div class="charts" id="todayCharts"></div>
  </section>

  <!-- ===== Utilisateurs ===== -->
  <section class="panel" role="tabpanel" id="p-users" aria-labelledby="tab-users" hidden>
    <p class="intro">Qui vient sur Stalak, d’où, avec quel appareil, et qui revient. Seul le <b>pays</b> est enregistré (donné par Cloudflare) : jamais l’adresse IP ni la ville.</p>
    <div class="kpis">
      <div class="kpi"><div class="k">Comptes en tout</div><div class="v" id="kUsers">–</div><div class="d" id="kUsersS">&nbsp;</div><div class="e">Tous les comptes créés depuis le début.</div></div>
      <div class="kpi"><div class="k">Nouveaux comptes</div><div class="v" id="kNew">–</div><div class="d" id="kNewS">&nbsp;</div><div class="e">Comptes créés pendant la période choisie.</div></div>
      <div class="kpi"><div class="k">Comptes revenus</div><div class="v" id="kBack">–</div><div class="d" id="kBackS">&nbsp;</div><div class="e">Personnes qui se sont reconnectées un autre jour que celui de leur inscription.</div></div>
      <div class="kpi"><div class="k">Visites de retour</div><div class="v" id="kRet">–</div><div class="d" id="kRetS">&nbsp;</div><div class="e">Part des visites faites par un navigateur déjà venu un autre jour.</div></div>
    </div>
    <div class="card">
      <div class="head"><h2>Carte du monde</h2><span class="sp"></span>
        <div class="seg" role="group" aria-label="Ce que montre la carte"><button type="button" data-map="accounts" aria-pressed="true">Comptes</button><button type="button" data-map="visits" aria-pressed="false">Visites</button></div>
        <p id="mapTxt">Plus le bleu est foncé, plus il y a de comptes créés depuis ce pays pendant la période.</p></div>
      <div class="grid2">
        <div class="map" id="map"></div>
        <div><h3 id="topTitle">Pays</h3><ul class="blist" id="topCountries"></ul><p class="note" id="mapUnknown"></p></div>
      </div>
    </div>
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
    <p class="note" id="visitsKept">Les visites sont gardées 90 jours ; les comptes, tant qu’ils existent.</p>
  </section>

  <!-- ===== Argent ===== -->
  <section class="panel" role="tabpanel" id="p-money" aria-labelledby="tab-money" hidden>
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
  <section class="panel" role="tabpanel" id="p-funnel" aria-labelledby="tab-funnel" hidden>
    <p class="intro">Le chemin d’un visiteur jusqu’au paiement, sur la période. Chaque étape montre combien de fois elle a eu lieu et la part de l’étape d’avant. Ce sont des compteurs anonymes : rien sur la personne.</p>
    <div class="card"><div class="head"><h2>Du visiteur à l’abonné</h2><p>Une étape faible = l’endroit où les gens s’arrêtent. C’est là qu’il faut agir.</p></div><div class="funnel" id="funnel"></div></div>
    <div class="grid3">
      <div class="card"><h3>Vidéos exportées</h3><p class="note">Réussies ou ratées, et pourquoi ça a raté.</p><ul class="blist" id="bExport"></ul></div>
      <div class="card"><h3>Pubs</h3><p class="note">Demandées (bouton touché), vraiment affichées, puis regardées jusqu’au bout (filigrane enlevé).</p><ul class="blist" id="bAds"></ul></div>
      <div class="card"><h3>Ce qui ouvre la page des formules</h3><p class="note">La fonction payante qui a donné envie (cadenas touché).</p><ul class="blist" id="bWhy"></ul></div>
    </div>
    <div class="charts" id="funnelCharts" data-mt></div>
  </section>

  <!-- ===== Messages ===== -->
  <section class="panel" role="tabpanel" id="p-msgs" aria-labelledby="tab-msgs" hidden>
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
  <section class="panel" role="tabpanel" id="p-health" aria-labelledby="tab-health" hidden>
    <p class="intro">Est-ce que tout marche, et reste-t-il de la marge ? Vert = tout va bien ; orange = à surveiller ; rouge = à régler. Tu reçois aussi un e-mail d’alerte quand quelque chose casse.</p>
    <div class="card">
      <div class="head"><h2>Notifications sur ton téléphone</h2><span class="sp"></span><span class="status" id="ntfyState">…</span>
        <p>L’appli ntfy sonne à chaque nouvel abonné (formule, prix, pays) et, plus discrètement, à chaque annulation. Jamais l’e-mail ni le nom du client. Le canal est le secret <b>NTFY_TOPIC</b> (Cloudflare) ; abonne-toi au même nom dans l’appli ntfy.</p></div>
      <div class="row"><button class="btn primary" type="button" id="ntfyBtn">Envoyer une notif de test</button><span class="note" id="ntfyOut" role="status"></span></div>
    </div>
    <div class="grid2" id="limits"></div>
    <div class="charts" id="healthCharts" data-mt></div>
    <div class="card" data-mt><h2>Usage des fonctions (30 derniers jours)</h2><div class="grid3" id="usage"></div></div>
  </section>
</div>
<script nonce="__NONCE__">
(function () {
  'use strict';
  var MAP = __MAP__;
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
    fail: { memory: 'Mémoire pleine', decoder: 'Lecture vidéo', hidden: 'Appli quittée pendant l’export', cancel: 'Annulé par la personne', other: 'Autre raison' },
  };

  // every call goes to /api/admin/... on this host; an Access session that ended answers with a redirect to its login
  function api(method, path, body) {
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

  // ---- tabs ----
  var TABS = ['today', 'users', 'money', 'funnel', 'msgs', 'health'];
  function showTab(name, focus) {
    if (TABS.indexOf(name) < 0) name = 'today';
    S.tab = name;
    TABS.forEach(function (t) {
      var b = $('#tab-' + t), p = $('#p-' + t), on = t === name;
      b.setAttribute('aria-selected', on ? 'true' : 'false'); b.tabIndex = on ? 0 : -1; p.hidden = !on;
    });
    if (focus) $('#tab-' + name).focus();
    if (!/^#t=/.test(location.hash)) try { history.replaceState(null, '', '#' + name); } catch (e) {}
  }
  TABS.forEach(function (t, i) {
    var b = $('#tab-' + t);
    b.addEventListener('click', function () { showTab(t); });
    b.addEventListener('keydown', function (e) {
      var k = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (e.key === 'Home') { e.preventDefault(); showTab(TABS[0], true); } else if (e.key === 'End') { e.preventDefault(); showTab(TABS[TABS.length - 1], true); }
      else if (k) { e.preventDefault(); showTab(TABS[(i + k + TABS.length) % TABS.length], true); }
    });
  });

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

  // ---- the world map: a sequential blue ramp by country; the list beside it gives the exact numbers ----
  var mapTip = el('div', { class: 'tip' });
  function drawMap() {
    var d = S.stats; if (!d || !d.people) return;
    var data = S.map === 'accounts' ? d.people.byCountry : d.audience.byCountry, box = $('#map');
    box.textContent = '';
    var known = {}, unknown = 0, max = 0;
    for (var k in data) { if (k === 'unknown') unknown += data[k]; else { known[k] = data[k]; if (data[k] > max) max = data[k]; } }
    var steps = [0, 1, 2, 3, 4, 5].map(function (i) { return Math.max(1, Math.round(max * i / 5)); });
    var cls = function (v) { if (!v) return 0; var r = v / max; return r > .8 ? 5 : r > .6 ? 4 : r > .4 ? 3 : r > .2 ? 2 : 1; };
    var svg = svgEl('svg', { viewBox: '0 0 ' + MAP.w + ' ' + MAP.h, role: 'img', 'aria-label': (S.map === 'accounts' ? 'Comptes' : 'Visites') + ' par pays' });
    Object.keys(MAP.paths).forEach(function (c) {
      var v = known[c] || 0, p = svgEl('path', { d: MAP.paths[c] });
      p.style.fill = 'var(--m' + cls(v) + ')';
      if (v) p.setAttribute('class', 'has');
      var show = function (e) {
        var r = box.getBoundingClientRect();
        mapTip.textContent = COUNTRY(c) + ' · ' + nf.format(v);
        mapTip.style.left = (e.clientX - r.left) + 'px'; mapTip.style.top = (e.clientY - r.top) + 'px'; mapTip.style.display = 'block';
      };
      p.addEventListener('mousemove', show); p.addEventListener('mouseleave', function () { mapTip.style.display = 'none'; });
      p.addEventListener('touchstart', function (e) { if (e.touches[0]) show(e.touches[0]); }, { passive: true });
      svg.append(p);
    });
    box.append(svg, mapTip);
    var lg = el('div', { class: 'legend' }), sw = el('span', { class: 'sw' });
    for (var i = 0; i <= 5; i++) { var s = el('i'); s.style.background = 'var(--m' + i + ')'; sw.append(s); }
    lg.append(el('span', null, '0'), sw, el('span', null, max ? nf.format(max) + ' ' + (S.map === 'accounts' ? 'comptes' : 'visites') : 'pas encore de données'));
    box.append(lg);
    set('#topTitle', S.map === 'accounts' ? 'Comptes par pays' : 'Visites par pays');
    set('#mapTxt', S.map === 'accounts' ? 'Plus le bleu est foncé, plus il y a de comptes créés depuis ce pays pendant la période.' : 'Plus le bleu est foncé, plus il y a de visites venues de ce pays pendant la période.');
    blist($('#topCountries'), known, COUNTRY, { max: 12 });
    set('#mapUnknown', unknown ? nf.format(unknown) + (S.map === 'accounts' ? ' compte(s)' : ' visite(s)') + ' sans pays connu (avant le 1/11, ou pays caché).' : '');
  }
  $$('[data-map]').forEach(function (b) {
    b.addEventListener('click', function () { S.map = b.dataset.map; $$('[data-map]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); drawMap(); });
  });

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
      charts($('#todayCharts'), days, [DAY_CHARTS[0], DAY_CHARTS[1]]);
      // Utilisateurs
      var P = d.people || {}, A = d.audience || {};
      set('#kUsers', nf.format(t.users)); set('#kUsersS', t.verified + ' avec e-mail vérifié');
      set('#kNew', nf.format(sumK('signups'))); set('#kNewS', label);
      set('#kBack', nf.format(P.returningAccounts || 0)); set('#kBackS', label);
      var rt = A.returning || { yes: 0, no: 0, unknown: 0 };
      set('#kRet', (rt.yes + rt.no ? pct(rt.yes, rt.yes + rt.no) : 0) + ' %'); set('#kRetS', nf.format(rt.yes) + ' visites de retour sur ' + nf.format(rt.yes + rt.no) + ' ' + label);
      drawMap();
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
        blist($('#bAds'), { 'Demandées': fu.adOffer || 0, 'Affichées': fu.adShown || 0, 'Regardées': fu.adOk || 0 }, function (x) { return x; }, { order: ['Demandées', 'Affichées', 'Regardées'], noPct: true, keepZero: true });
        blist($('#bWhy'), fu.plansWhy || {}, NAMES.why);
      }
      charts($('#funnelCharts'), days, [{ k: 'exportOk', t: 'Vidéos exportées', f: N, x: 'Réussies.' }, { k: 'exportFail', t: 'Exports ratés', f: N, x: 'Erreur pendant l’export (voir les raisons plus haut).' }, { k: 'adOk', t: 'Pubs regardées', f: N, x: 'Filigrane enlevé grâce à une pub.' }]);
      // Santé
      var L = d.limits || {}, u = d.usage, lb = $('#limits'); lb.textContent = '';
      var ns = $('#ntfyState'); ns.className = 'status ' + (L.ntfy ? 'ok' : 'warn'); ns.textContent = L.ntfy ? 'Activées' : 'Pas réglées (NTFY_TOPIC vide)';
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
    api('POST', 'ntfy-test', {}).then(function (r) {
      out.textContent = !r.configured ? 'Rien envoyé : le secret NTFY_TOPIC est vide dans Cloudflare.' : r.sent ? 'Envoyée ! Ton téléphone devrait sonner dans quelques secondes.' : 'ntfy n’a pas répondu. Réessaie dans une minute.';
    }).catch(function (e) { out.textContent = 'Pas envoyée : ' + e.message; }).then(function () { b.disabled = false; });
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

// the world map goes in as data (paths per country, French names)
export const ADMIN_HTML = PAGE.replace('__MAP__', () => JSON.stringify({ w: MAP_W, h: MAP_H, paths: MAP_PATHS, names: COUNTRY_NAMES_FR }));
