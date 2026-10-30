// The owner's dashboard page (admin.stalak.app/admin/), sent by functions/admin/[[path]].js only after the Cloudflare Access
// check (admin.js). It holds no data: it reads /api/admin/* (same checks). __NONCE__ is replaced per request (CSP).
// Charts follow the dataviz rules: one measure per chart (no second axis), one hue, 2px gaps, rounded data-ends,
// a tooltip on hover and a table view.
// Written with String.raw: no backtick and no dollar-brace inside.
export const ADMIN_HTML = String.raw`<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Stalak · tableau de bord</title>
<style nonce="__NONCE__">
@font-face{font-family:Lilita;src:url(/fonts/lilitaone.ttf) format("truetype");font-display:swap}
@font-face{font-family:Rubik;src:url(/fonts/rubik.ttf) format("truetype");font-weight:300 900;font-display:swap}
:root{color-scheme:light;--bg:#eaf4ff;--card:#fcfcfb;--ink:#0a0d14;--text:#0b0b0b;--text2:#52514e;--muted:#77756f;--line:#e3e2de;
  --series:#2a78d6;--accent:#1f63b8;--me:#dcebff;--them:#ffffff;--good:#0f7a3a;--good-bg:#e3f6ea;--warn:#a35a00;--warn-bg:#fff2dc;--bad:#b42318;--bad-bg:#fde8e6}
@media (prefers-color-scheme:dark){:root:where(:not([data-theme="light"])){color-scheme:dark;--bg:#0f1420;--card:#1a1a19;--ink:#3a3f4b;--text:#f0efec;--text2:#c3c2b7;
  --muted:#9a998f;--line:#2e2e2c;--series:#3987e5;--accent:#7fb2f0;--me:#1d3150;--them:#232322;--good:#5fd38d;--good-bg:#173323;--warn:#f0b44c;--warn-bg:#3a2c12;--bad:#ff8a80;--bad-bg:#3d1c19}}
:root[data-theme="dark"]{color-scheme:dark;--bg:#0f1420;--card:#1a1a19;--ink:#3a3f4b;--text:#f0efec;--text2:#c3c2b7;--muted:#9a998f;--line:#2e2e2c;
  --series:#3987e5;--accent:#7fb2f0;--me:#1d3150;--them:#232322;--good:#5fd38d;--good-bg:#173323;--warn:#f0b44c;--warn-bg:#3a2c12;--bad:#ff8a80;--bad-bg:#3d1c19}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--text);font:15px/1.45 Rubik,system-ui,-apple-system,Segoe UI,Roboto,sans-serif}
button,input,select,textarea{font:inherit;color:inherit}
h1,h2{font-family:Lilita,Rubik,system-ui,sans-serif;font-weight:400;letter-spacing:.01em;margin:0}
h1{font-size:26px}h2{font-size:20px;margin-bottom:10px}
.wrap{max-width:1180px;margin:0 auto;padding:16px}
header{display:flex;flex-wrap:wrap;align-items:center;gap:10px 16px;margin-bottom:14px}
header .who{color:var(--text2);font-size:13px}
header .sp{flex:1}
.switch{display:flex;align-items:center;gap:10px;background:var(--card);border:2px solid var(--ink);border-radius:999px;padding:6px 14px 6px 8px;cursor:pointer;user-select:none}
.switch input{appearance:none;width:42px;height:24px;border-radius:999px;background:var(--line);position:relative;margin:0;cursor:pointer;transition:background .15s}
.switch input::after{content:"";position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.3);transition:left .15s}
.switch input:checked{background:var(--good)}.switch input:checked::after{left:21px}
.switch input:focus-visible{outline:3px solid var(--accent);outline-offset:2px}
.pill{display:inline-flex;align-items:center;gap:6px;font-size:13px;padding:3px 10px;border-radius:999px;background:var(--line);color:var(--text2)}
.pill.on{background:var(--good-bg);color:var(--good)}.pill.warn{background:var(--warn-bg);color:var(--warn)}
.dot{width:8px;height:8px;border-radius:50%;background:currentColor;display:inline-block}
.banner{display:none;background:var(--bad-bg);color:var(--bad);border:2px solid var(--bad);border-radius:14px;padding:10px 14px;margin-bottom:14px}
.banner.show{display:block}
.card{background:var(--card);border:2px solid var(--ink);border-radius:18px;padding:16px;margin-bottom:16px;min-width:0}
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px;margin-bottom:16px}
.kpi{background:var(--card);border:2px solid var(--ink);border-radius:16px;padding:12px 14px;min-width:0}
.kpi .k{font-size:13px;color:var(--text2)}
.kpi .v{font-family:Lilita,Rubik,sans-serif;font-size:30px;line-height:1.15;margin:2px 0;font-variant-numeric:tabular-nums;overflow-wrap:anywhere}
.kpi .s{font-size:12.5px;color:var(--muted)}
.row{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px}
.sp{flex:1}.scroll-x{overflow-x:auto}
.seg{display:inline-flex;border:2px solid var(--ink);border-radius:12px;overflow:hidden}
.seg button{border:0;background:var(--card);padding:5px 12px;cursor:pointer}
.seg button[aria-pressed="true"]{background:var(--ink);color:#fff}
.btn{border:2px solid var(--ink);background:var(--card);border-radius:12px;padding:6px 14px;cursor:pointer}
.btn.primary{background:var(--ink);color:#fff}.btn:disabled{opacity:.5;cursor:default}
.btn.small{padding:3px 10px;font-size:13px}.btn.danger{color:var(--bad);border-color:var(--bad)}
.linkbtn{border:0;background:none;color:var(--accent);text-decoration:underline;cursor:pointer;padding:0}
.charts{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px;margin-top:12px}
.chart{border:1px solid var(--line);border-radius:14px;padding:10px 12px 6px;position:relative;min-width:0}
.chart .t{display:flex;justify-content:space-between;gap:8px;font-size:13.5px}
.chart .t b{font-weight:600}.chart .t span{color:var(--text2);font-variant-numeric:tabular-nums}
.chart svg{display:block;width:100%;height:auto;margin-top:6px;overflow:visible}
.chart .ax{fill:var(--muted);font-size:10px}
.chart .grid{stroke:var(--line);stroke-width:1}
.chart .bar{fill:var(--series)}
.chart .hit{fill:transparent;cursor:crosshair}
.chart .bar.on{opacity:.75}
.tip{position:absolute;pointer-events:none;background:var(--ink);color:#fff;font-size:12.5px;padding:5px 9px;border-radius:8px;white-space:nowrap;transform:translate(-50%,-110%);display:none;z-index:2}
.table-wrap{overflow-x:auto;margin-top:12px;display:none}.table-wrap.show{display:block}
table{border-collapse:collapse;width:100%;font-size:13px;font-variant-numeric:tabular-nums}
th,td{padding:5px 8px;border-bottom:1px solid var(--line);text-align:right;white-space:nowrap}
th:first-child,td:first-child{text-align:left}
th{color:var(--text2);font-weight:600}
.usage{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}
.usage .u{border:1px solid var(--line);border-radius:14px;padding:12px}
.usage .u b{display:block;margin-bottom:4px}
.usage .u p{margin:2px 0;color:var(--text2);font-size:13.5px}
.usage .u p span{color:var(--text);font-weight:600;font-variant-numeric:tabular-nums}
.meter{height:8px;border-radius:99px;background:var(--line);overflow:hidden;margin-top:6px}
.meter i{display:block;height:100%;background:var(--series);border-radius:99px}
.support{display:grid;grid-template-columns:minmax(0,320px) minmax(0,1fr);gap:12px;min-height:420px}
.tlist{border:1px solid var(--line);border-radius:14px;overflow:auto;max-height:560px}
.tlist button{display:block;width:100%;text-align:left;border:0;border-bottom:1px solid var(--line);background:none;padding:10px 12px;cursor:pointer}
.tlist button:hover{background:var(--bg)}.tlist button[aria-current="true"]{background:var(--me)}
.tlist .l1{display:flex;gap:6px;align-items:center;font-size:13.5px}
.tlist .l1 b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1}
.tlist .l2{color:var(--text2);font-size:12.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.badge{background:var(--bad);color:#fff;border-radius:99px;font-size:11px;padding:1px 7px;font-weight:700}
.pro{background:var(--ink);color:#fff;border-radius:6px;font-size:11px;padding:1px 6px;font-weight:700;letter-spacing:.03em}
.pro.off{background:var(--line);color:var(--text2)}
.empty{color:var(--muted);padding:16px;text-align:center}
.conv{border:1px solid var(--line);border-radius:14px;display:flex;flex-direction:column;min-height:420px;min-width:0}
.conv .head{padding:10px 12px;border-bottom:1px solid var(--line);display:flex;flex-wrap:wrap;gap:6px 10px;align-items:center}
.conv .head b{overflow-wrap:anywhere}
.conv .info{padding:6px 12px;border-bottom:1px solid var(--line);font-size:12.5px;color:var(--text2)}
.conv .info pre{white-space:pre-wrap;overflow-wrap:anywhere;font-size:11.5px;max-height:180px;overflow:auto;background:var(--bg);padding:8px;border-radius:8px}
.msgs{flex:1;overflow:auto;padding:12px;display:flex;flex-direction:column;gap:8px;max-height:460px}
.m{max-width:85%;padding:8px 12px;border-radius:14px;border:1px solid var(--line);white-space:pre-wrap;overflow-wrap:anywhere}
.m.user{align-self:flex-start;background:var(--them)}.m.admin{align-self:flex-end;background:var(--me)}
.m small{display:block;color:var(--muted);font-size:11px;margin-top:3px}
.reply{border-top:1px solid var(--line);padding:10px;display:flex;flex-direction:column;gap:8px}
.reply textarea{width:100%;min-height:76px;resize:vertical;border:2px solid var(--ink);border-radius:12px;padding:8px 10px;background:var(--card)}
.reply .row label{font-size:13px;color:var(--text2)}
.reply select{border:2px solid var(--ink);border-radius:10px;padding:3px 6px;background:var(--card)}
.note{font-size:12.5px;color:var(--muted)}
.vh{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
@media (max-width:760px){.support{grid-template-columns:1fr}.tlist{max-height:260px}h1{font-size:22px}.kpi .v{font-size:26px}}
</style>
</head>
<body>
<div class="wrap">
  <header>
    <h1>Stalak · tableau de bord</h1>
    <span class="who" id="who"></span>
    <span class="sp"></span>
    <span class="pill" id="availPill"><span class="dot"></span><span id="availTxt">…</span></span>
    <label class="switch"><input type="checkbox" id="availSw"><span>Je suis disponible</span></label>
  </header>
  <div class="banner" id="banner" role="alert"></div>

  <section class="kpis" aria-label="Chiffres clés">
    <div class="kpi"><div class="k">Visiteurs en direct</div><div class="v" id="kLive">–</div><div class="s" id="kLiveS">&nbsp;</div></div>
    <div class="kpi"><div class="k">Inscrits</div><div class="v" id="kUsers">–</div><div class="s" id="kUsersS">&nbsp;</div></div>
    <div class="kpi"><div class="k">Abonnés (toutes formules)</div><div class="v" id="kPro">–</div><div class="s" id="kProS">&nbsp;</div></div>
    <div class="kpi"><div class="k">Revenu mensuel (estimé)</div><div class="v" id="kMrr">–</div><div class="s" id="kMrrS">&nbsp;</div></div>
    <div class="kpi"><div class="k">Encaissé sur 30 jours</div><div class="v" id="kRev">–</div><div class="s" id="kRevS">&nbsp;</div></div>
    <div class="kpi"><div class="k">Messages à traiter</div><div class="v" id="kTix">–</div><div class="s" id="kTixS">&nbsp;</div></div>
    <div class="kpi"><div class="k">Vidéos gratuites aujourd’hui</div><div class="v" id="kFree">–</div><div class="s" id="kFreeS">&nbsp;</div></div>
  </section>

  <section class="card" aria-labelledby="hSup">
    <div class="row"><h2 id="hSup">Messages des utilisateurs</h2><span class="sp"></span>
      <div class="seg" role="group" aria-label="Quels messages"><button type="button" data-st="open" aria-pressed="true">Ouverts</button><button type="button" data-st="closed" aria-pressed="false">Fermés</button><button type="button" data-st="all" aria-pressed="false">Tous</button></div>
      <button class="btn small" type="button" id="notifBtn">Activer les notifications</button>
    </div>
    <p class="note">Disponible = le glaçon propose le direct. Sinon, le visiteur laisse son e-mail et ta réponse lui est envoyée par e-mail (aussi quand il a quitté la page).</p>
    <div class="support">
      <div class="tlist" id="tlist" aria-label="Conversations"><div class="empty">Chargement…</div></div>
      <div class="conv" id="conv"><div class="empty">Choisis une conversation.</div></div>
    </div>
  </section>

  <section class="card" aria-labelledby="hPlans">
    <h2 id="hPlans">Par formule</h2>
    <div class="scroll-x"><table id="plans"><thead><tr><th scope="col">Formule</th><th scope="col">Abonnés</th><th scope="col">Mensuels</th><th scope="col">Annuels</th><th scope="col">Résiliés en cours</th><th scope="col">Revenu mensuel (estimé)</th><th scope="col">Encaissé 30 j</th><th scope="col">Depuis le début</th></tr></thead><tbody></tbody></table></div>
    <p class="note">Chaque abonné compte à son prix (un abonné garde son prix : les Pro à 9,99 € / 79 € de la première offre restent comptés ainsi). Encaissé : TTC, remboursements à part.</p>
  </section>

  <section class="card" aria-labelledby="hEvo">
    <div class="row"><h2 id="hEvo">Jour par jour</h2><span class="sp"></span>
      <div class="seg" role="group" aria-label="Période"><button type="button" data-days="7" aria-pressed="false">7 j</button><button type="button" data-days="30" aria-pressed="true">30 j</button><button type="button" data-days="90" aria-pressed="false">90 j</button></div>
      <button class="btn small" type="button" id="tableBtn" aria-expanded="false">Voir en tableau</button>
    </div>
    <div class="charts" id="charts"></div>
    <div class="table-wrap" id="tableWrap"></div>
    <p class="note">Visites = pages ouvertes (sans cookie : recharger compte une nouvelle visite). Revenu en euros, TTC, remboursements à part. Jours en heure UTC.</p>
  </section>

  <section class="card" aria-labelledby="hUse">
    <h2 id="hUse">Usage des fonctions</h2>
    <div class="usage" id="usage"></div>
  </section>

  <section class="card" aria-labelledby="hUsers">
    <h2 id="hUsers">Derniers inscrits</h2>
    <div class="scroll-x"><table id="users"><thead><tr><th>E-mail</th><th>Pseudo</th><th>Inscrit le</th><th>Vérifié</th><th>Formule</th></tr></thead><tbody></tbody></table></div>
  </section>
  <p class="note">Audience détaillée (pays, pages, appareils) : Cloudflare → stalak.app → Web Analytics.</p>
</div>
<script nonce="__NONCE__">
(function () {
  'use strict';
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var S = { days: 30, status: 'open', open: null, last: 0, unread: -1, stats: null, timers: {} };
  var nf = new Intl.NumberFormat('fr-FR');
  function money(cents, cur) { try { return (cents / 100).toLocaleString('fr-FR', { style: 'currency', currency: cur || 'EUR' }); } catch (e) { return (cents / 100).toFixed(2) + ' ' + cur; } }
  function el(tag, attrs, text) { var e = document.createElement(tag); if (attrs) for (var k in attrs) e.setAttribute(k, attrs[k]); if (text != null) e.textContent = text; return e; }
  function svgEl(tag, attrs) { var e = document.createElementNS('http://www.w3.org/2000/svg', tag); for (var k in attrs) e.setAttribute(k, attrs[k]); return e; }
  function dateFr(iso, withTime) { var d = new Date(iso); return withTime ? d.toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }); }
  function ago(iso) { var s = Math.round((Date.now() - new Date(iso)) / 1000); if (s < 60) return 'à l’instant'; if (s < 3600) return 'il y a ' + Math.round(s / 60) + ' min'; if (s < 86400) return 'il y a ' + Math.round(s / 3600) + ' h'; return dateFr(iso); }
  function banner(text) { var b = $('#banner'); b.textContent = text || ''; b.className = 'banner' + (text ? ' show' : ''); }

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

  // ---- live: visitors, availability, unread messages (every 10 s; also tells the server the dashboard is open) ----
  function live() {
    return api('GET', 'live').then(function (d) {
      banner('');
      $('#kLive').textContent = nf.format(d.visitors.total);
      $('#kLiveS').textContent = 'FR ' + d.visitors.fr + ' · EN ' + d.visitors.en + ' · 2 dernières min';
      $('#availSw').checked = d.availableSwitch;
      var pill = $('#availPill');
      pill.className = 'pill' + (d.available ? ' on' : d.availableSwitch ? ' warn' : '');
      $('#availTxt').textContent = d.available ? 'Direct proposé aux visiteurs' : d.availableSwitch ? 'Connexion…' : 'Réponses par e-mail';
      $('#kTix').textContent = nf.format(d.tickets.unread);
      $('#kTixS').textContent = d.tickets.open + ' conversation' + (d.tickets.open > 1 ? 's' : '') + ' ouverte' + (d.tickets.open > 1 ? 's' : '');
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

  // ---- stats ----
  var CHARTS = [
    { k: 'visits', t: 'Visites', f: nf.format },
    { k: 'signups', t: 'Inscriptions', f: nf.format },
    { k: 'newPro', t: 'Nouveaux Pro', f: nf.format },
    { k: 'revenue', t: 'Encaissé (€)', f: function (v) { return money(v, 'EUR'); }, cents: true },
    { k: 'helpQuestions', t: 'Questions au glaçon', f: nf.format },
    { k: 'lyricsJobs', t: 'Paroles auto', f: nf.format },
    { k: 'cloudSaves', t: 'Sauvegardes en ligne', f: nf.format },
    { k: 'tickets', t: 'Nouveaux messages', f: nf.format },
    { k: 'freeVideos', t: 'Vidéos gratuites', f: nf.format },
  ];
  var PLAN_NAME = { basic: 'Basic', pro: 'Pro', max: 'Max' };
  function niceMax(v) { if (v <= 4) return 4; var p = Math.pow(10, Math.floor(Math.log10(v))), m = v / p; return (m <= 1 ? 1 : m <= 2 ? 2 : m <= 5 ? 5 : 10) * p; }
  function chart(box, days, c) {
    var W = 300, H = 110, L = 30, B = 16, T = 6, n = days.length;
    var vals = days.map(function (d) { return d[c.k] || 0; });
    var max = niceMax(Math.max(c.cents ? 1000 : 0, Math.max.apply(null, vals))), slot = (W - L) / n, bw = Math.max(2, Math.min(24, slot - 2));
    var total = vals.reduce(function (a, b) { return a + b; }, 0);
    var wrap = el('div', { class: 'chart' }), head = el('div', { class: 't' });
    head.append(el('b', null, c.t), el('span', null, 'Total : ' + c.f(total)));
    wrap.append(head);
    var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': c.t + ', ' + n + ' jours, total ' + c.f(total) });
    var yv = function (v) { return T + (H - B - T) * (1 - v / max); };
    [0, max / 2, max].forEach(function (v) {
      svg.append(svgEl('line', { class: 'grid', x1: L, x2: W, y1: yv(v), y2: yv(v) }));
      var lab = svgEl('text', { class: 'ax', x: L - 4, y: yv(v) + 3, 'text-anchor': 'end' });
      lab.textContent = c.cents ? (v / 100 >= 1000 ? Math.round(v / 100000) + ' k' : Math.round(v / 100)) : (v >= 1000 ? Math.round(v / 100) / 10 + ' k' : v);
      svg.append(lab);
    });
    var tip = el('div', { class: 'tip' });
    days.forEach(function (d, i) {
      var v = vals[i], x = L + i * slot + (slot - bw) / 2, y = yv(v), h = Math.max(0, yv(0) - y), r = Math.min(4, bw / 2, h);
      var hit = svgEl('rect', { class: 'hit', x: L + i * slot, y: T, width: slot, height: H - B - T });
      var show = function () {
        tip.textContent = dateFr(d.day + 'T12:00:00Z') + ' · ' + c.f(v);
        tip.style.left = ((x + bw / 2) / W * 100) + '%'; tip.style.top = (y / H * 100 + 18) + '%'; tip.style.display = 'block';
      };
      // square at the baseline, rounded data-end; the hover zone (the whole day) on top of it
      var bar = h > 0 ? svgEl('path', { class: 'bar', d: 'M' + x + ',' + yv(0) + 'V' + (y + r) + 'Q' + x + ',' + y + ' ' + (x + r) + ',' + y + 'H' + (x + bw - r) + 'Q' + (x + bw) + ',' + y + ' ' + (x + bw) + ',' + (y + r) + 'V' + yv(0) + 'Z' }) : null;
      if (bar) svg.append(bar);
      hit.addEventListener('mouseenter', function () { show(); if (bar) bar.classList.add('on'); });
      hit.addEventListener('mouseleave', function () { tip.style.display = 'none'; if (bar) bar.classList.remove('on'); });
      hit.addEventListener('touchstart', show, { passive: true });
      svg.append(hit);
    });
    [[0, 'start'], [n - 1, 'end']].forEach(function (p) {
      var t = svgEl('text', { class: 'ax', x: p[0] === 0 ? L : W, y: H - 3, 'text-anchor': p[1] });
      t.textContent = dateFr(days[p[0]].day + 'T12:00:00Z').replace(/ \d{4}$/, ''); svg.append(t);
    });
    wrap.append(svg, tip);
    box.append(wrap);
  }
  function table(days) {
    var t = el('table'), hr = el('tr');
    hr.append(el('th', null, 'Jour')); CHARTS.forEach(function (c) { hr.append(el('th', null, c.t)); });
    var th = el('thead'); th.append(hr); t.append(th);
    var tb = el('tbody');
    days.slice().reverse().forEach(function (d) {
      var tr = el('tr'); tr.append(el('td', null, dateFr(d.day + 'T12:00:00Z')));
      CHARTS.forEach(function (c) { tr.append(el('td', null, c.f(d[c.k] || 0))); }); tb.append(tr);
    });
    t.append(tb); return t;
  }
  function totalsByCur(o) { var parts = []; for (var cur in o) parts.push(money(o[cur].total, cur)); return parts.length ? parts.join(' + ') : money(0, 'EUR'); }
  function stats() {
    return api('GET', 'stats?days=' + S.days).then(function (d) {
      S.stats = d;
      var t = d.totals, last30 = d.days.slice(-30).reduce(function (a, x) { return a + x.signups; }, 0);
      $('#kUsers').textContent = nf.format(t.users);
      $('#kUsersS').textContent = '+' + last30 + ' sur 30 j · ' + t.verified + ' vérifiés';
      $('#kPro').textContent = nf.format(t.pro.total);
      $('#kProS').textContent = t.pro.month + ' mensuels · ' + t.pro.year + ' annuels' + (t.pro.ending ? ' · ' + t.pro.ending + ' résiliés' : '');
      $('#kMrr').textContent = money(t.mrrCents, 'EUR');
      $('#kMrrS').textContent = 'TTC, annuels comptés au douzième';
      var fv = d.usage.freeVideos || { today: 0, last30: 0 };
      $('#kFree').textContent = nf.format(fv.today);
      $('#kFreeS').textContent = nf.format(fv.last30) + ' sur 30 j · jour de Paris';
      var pb = $('#plans tbody'); pb.textContent = '';
      ['basic', 'pro', 'max'].forEach(function (k) {
        var p = (t.plans || {})[k] || { total: 0, month: 0, year: 0, ending: 0, mrrCents: 0, revenue: {}, revenue30: {} };
        var tr = el('tr'); tr.append(el('th', { scope: 'row' }, PLAN_NAME[k]), el('td', null, nf.format(p.total)), el('td', null, nf.format(p.month)),
          el('td', null, nf.format(p.year)), el('td', null, nf.format(p.ending)), el('td', null, money(p.mrrCents, 'EUR')),
          el('td', null, totalsByCur(p.revenue30)), el('td', null, totalsByCur(p.revenue)));
        pb.append(tr);
      });
      $('#kRev').textContent = totalsByCur(t.revenue.last30);
      $('#kRevS').textContent = 'Depuis le début : ' + totalsByCur(t.revenue.all) + (Object.keys(t.revenue.refunds).length ? ' · remboursé ' + totalsByCur(t.revenue.refunds) : '');
      var box = $('#charts'); box.textContent = '';
      CHARTS.forEach(function (c) { chart(box, d.days, c); });
      var tw = $('#tableWrap'); tw.textContent = ''; tw.append(table(d.days));
      var u = d.usage, us = $('#usage'); us.textContent = '';
      function block(title, lines, meter) {
        var b = el('div', { class: 'u' }); b.append(el('b', null, title));
        lines.forEach(function (l) { var p = el('p', null, l[0] + ' '); p.append(el('span', null, l[1])); b.append(p); });
        if (meter) { var m = el('div', { class: 'meter', role: 'img', 'aria-label': meter[1] }), i = el('i'); i.style.width = Math.min(100, meter[0]) + '%'; m.append(i); b.append(m, el('p', null, meter[1])); }
        us.append(b);
      }
      block('Paroles automatiques', [['Transcriptions sur 30 j :', nf.format(u.lyrics.jobs30)], ['Minutes de son sur 30 j :', nf.format(u.lyrics.minutes30)], ['Aujourd’hui :', nf.format(u.lyrics.today)]]);
      block('Sauvegarde en ligne', [['Projets gardés :', nf.format(u.cloud.projects)], ['Comptes qui l’utilisent :', nf.format(u.cloud.users)], ['Place prise :', (u.cloud.bytes / 1e9).toLocaleString('fr-FR', { maximumFractionDigits: 2 }) + ' Go'], ['Sauvegardes sur 30 j :', nf.format(u.cloud.saves30)]]);
      block('Glaçon d’aide (IA)', [['Questions sur 30 j :', nf.format(u.help.questions30)], ['Sans réponse sur 30 j :', nf.format(u.help.failed30)]],
        [u.help.dailyMax ? u.help.today / u.help.dailyMax * 100 : 0, 'Aujourd’hui : ' + u.help.today + ' sur ' + u.help.dailyMax + ' (limite du jour)']);
      block('Parler à un humain', [['Conversations sur 30 j :', nf.format(u.tickets.created30)]]);
      var tb = $('#users tbody'); tb.textContent = '';
      d.recentUsers.forEach(function (r) {
        var tr = el('tr'); tr.append(el('td', null, r.email), el('td', null, r.name || '–'), el('td', null, dateFr(r.createdAt, true)), el('td', null, r.verified ? 'oui' : 'non'), el('td', null, r.plan ? PLAN_NAME[r.plan] || r.plan : '–')); tb.append(tr);
      });
      if (!d.recentUsers.length) { var tr = el('tr'), td = el('td', { colspan: '5' }, 'Personne pour l’instant.'); tr.append(td); tb.append(tr); }
    }).catch(function (e) { if (e.code !== 'access') banner('Les chiffres n’ont pas pu être chargés (' + e.message + ').'); });
  }
  document.querySelectorAll('[data-days]').forEach(function (b) {
    b.addEventListener('click', function () {
      S.days = +b.dataset.days; document.querySelectorAll('[data-days]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); stats();
    });
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
  document.querySelectorAll('[data-st]').forEach(function (b) {
    b.addEventListener('click', function () {
      S.status = b.dataset.st; document.querySelectorAll('[data-st]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); tickets();
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
    document.querySelectorAll('#tlist button').forEach(function (b) { b.setAttribute('aria-current', b.dataset.id === id ? 'true' : 'false'); });
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

  api('GET', 'me').then(function (d) { $('#who').textContent = d.email; }).catch(function () {});
  live(); stats(); tickets().then(function () { var m = location.hash.match(/^#t=([\w-]+)$/); if (m) openTicket(decodeURIComponent(m[1])); });
  S.timers.live = setInterval(live, 10000);
  S.timers.open = setInterval(refreshOpen, 4000);
  S.timers.list = setInterval(function () { if (!document.hidden) tickets(); }, 20000);
  S.timers.stats = setInterval(function () { if (!document.hidden) stats(); }, 300000);
})();
</script>
</body>
</html>`;
