/* App & montage (24/11, docs/handoff/chef-stats-analyse.md): « Stats » in the bottom bar opens the questionnaire (lot 2), then
   about 9 s of analysis, « Ton analyse est prête », the account to create, and this screen: the free summary (3 sentences of
   Comptes, from real data) and the rest blurred with a padlock, opened by a plan. Phones only, stalak.app only, loaded by the
   app: /assets/mobile5.<hash>.js. The figures come from Comptes (GET /api/stats, docs/contrats/stats-analyse.md), with its
   names and its rules: « moins de 1 000 écoutes » for under1000, no estimated figure shown as real, a free account never gets
   the Pro part (its blurred preview is a generic drawing), a figure given by the artist says so. Any advice says it is one.
   Under test (navigator.webdriver) it stays off unless the test asks (window.__stalakM5on). */
(function(){
'use strict';
var M = window.StalakM, D = document, W = window;
if (!M || W.__stalakM5) return;
if (navigator.webdriver && !W.__stalakM5on) return;
W.__stalakM5 = 1;
var $ = function(s, r){ return (r || D).querySelector(s); }, $$ = function(s, r){ return Array.prototype.slice.call((r || D).querySelectorAll(s)); };
var root = D.documentElement;
function el(tag, cls, html){ var e = D.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
var store = { get: function(k){ try { return localStorage.getItem(k); } catch(e){ return null; } }, set: function(k, v){ try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch(e){} } };
var WANT = 'stalak:statsWant';

var TX = {
fr: { title: 'Tes stats', ready: 'Ton analyse est prête', readyP: 'Crée ton compte pour voir ton analyse.', create: 'Crée ton compte pour la voir',
  loading: 'On prépare ton analyse…', sum: 'Ton bilan', missing: 'Il manque {list} : sans {them}, on ne peut pas faire ton analyse.', addLinks: 'Ajouter mes liens',
  them1: 'lui', them2: 'eux', and: ' et ', tt: 'ton lien TikTok', sp: 'ton lien Spotify',
  pending: 'On lit tes sorties Spotify…', stale: 'Chiffres pas mis à jour cette semaine (dernier relevé le {d}).', failed: 'On n’a pas pu lire tes chiffres Spotify. Tu peux donner tes auditeurs du mois toi-même :',
  off: 'Les chiffres Spotify arrivent bientôt. En attendant, tu peux donner tes auditeurs du mois toi-même :', notArtist: 'Colle le lien de ton profil d’artiste (open.spotify.com/artist/…).',
  give: 'Auditeurs ce mois-ci', save: 'Enregistrer', saved: 'C’est noté.', listeners: 'Auditeurs par mois', given: 'chiffre que tu as donné', followers: 'Abonnés',
  last: 'Dernier son', daysAgo: 'il y a {n} jours', today: 'aujourd’hui', top: 'Ton son le plus écouté', under: 'moins de 1 000 écoutes', streams: '{n} écoutes',
  city: 'Ta 1re ville', ttStats: 'Mes stats TikTok', ttLink: 'Relier TikTok', proT: 'Ton analyse complète', proP: 'Tes courbes semaine par semaine, le classement de tes sons, ton rythme de sortie et ton plan de la semaine.',
  unlock: 'Débloquer avec Pro', weeks: 'Tes auditeurs, semaine par semaine', songs: 'Tes sons, du plus écouté au moins écouté', months: 'Tes sorties par mois',
  rhythm: 'Ton rythme', rhythmP: 'Ton dernier son date de {d} jours ; en moyenne, {a} jours entre deux sorties.', advice: 'Conseil', adviceKeep: 'Garde ce rythme : un son toutes les {w} semaines environ.',
  adviceMore: 'Essaie de sortir un son toutes les 3 à 4 semaines : ton public garde le fil.', plan: 'Ton plan de la semaine', planNew: 'Fais vivre « {name} » : poste 3 extraits de ce son cette semaine.',
  planNext: 'Prépare le teaser de ton prochain son : 2 vidéos cette semaine.', planAny: 'Poste 3 vidéos de ton meilleur passage cette semaine.', cities: 'Tes villes', noData: 'Pas encore de chiffres.',
  err: 'Impossible de charger tes stats pour l’instant. Réessaie dans un moment.', retry: 'Réessayer', back: 'Retour',
  pvNums: 'Tes chiffres', pvL: 'Auditeurs', pvF: 'Abonnés TikTok', pvV: 'Vues moyennes', pvVid: 'Classement de tes vidéos', pvPace: 'Rythme de sortie conseillé',
  pvPaceX: 'Un son toutes les 3 semaines', pvWeek: 'Ton plan de la semaine', d1: 'Lun', d2: 'Mer', d3: 'Ven', pvChart: 'Tes auditeurs, semaine par semaine',
  demo: 'Exemple : ces chiffres sont inventés pour voir l’écran. Sur stalak.app, ce sont les tiens.', demoName: 'Exemple' },
en: { title: 'Your stats', ready: 'Your analysis is ready', readyP: 'Create your account to see your analysis.', create: 'Create your account to see it',
  loading: 'Preparing your analysis…', sum: 'Your summary', missing: '{list} {is} missing: without {them}, we can’t make your analysis.', addLinks: 'Add my links',
  them1: 'it', them2: 'them', and: ' and ', tt: 'Your TikTok link', sp: 'your Spotify link', is1: 'is', is2: 'are',
  pending: 'Reading your Spotify releases…', stale: 'Figures not updated this week (last reading on {d}).', failed: 'We couldn’t read your Spotify figures. You can give your monthly listeners yourself:',
  off: 'Spotify figures are coming soon. Meanwhile, you can give your monthly listeners yourself:', notArtist: 'Paste the link of your artist profile (open.spotify.com/artist/…).',
  give: 'Listeners this month', save: 'Save', saved: 'Saved.', listeners: 'Monthly listeners', given: 'the figure you gave', followers: 'Followers',
  last: 'Latest song', daysAgo: '{n} days ago', today: 'today', top: 'Your most played song', under: 'under 1,000 plays', streams: '{n} plays',
  city: 'Your top city', ttStats: 'My TikTok stats', ttLink: 'Link TikTok', proT: 'Your full analysis', proP: 'Your curves week by week, your songs ranked, your release pace and your plan for the week.',
  unlock: 'Unlock with Pro', weeks: 'Your listeners, week by week', songs: 'Your songs, most played first', months: 'Your releases per month',
  rhythm: 'Your pace', rhythmP: 'Your latest song is {d} days old; on average, {a} days between two releases.', advice: 'Tip', adviceKeep: 'Keep this pace: a song about every {w} weeks.',
  adviceMore: 'Try to release a song every 3 to 4 weeks: your audience keeps track.', plan: 'Your plan for the week', planNew: 'Keep “{name}” alive: post 3 clips of it this week.',
  planNext: 'Get the teaser of your next song ready: 2 videos this week.', planAny: 'Post 3 videos of your best part this week.', cities: 'Your cities', noData: 'No figures yet.',
  err: 'Your stats can’t be loaded right now. Try again in a moment.', retry: 'Try again', back: 'Back',
  pvNums: 'Your figures', pvL: 'Listeners', pvF: 'TikTok followers', pvV: 'Average views', pvVid: 'Your videos ranked', pvPace: 'Advised release pace',
  pvPaceX: 'A song every 3 weeks', pvWeek: 'Your plan for the week', d1: 'Mon', d2: 'Wed', d3: 'Fri', pvChart: 'Your listeners, week by week',
  demo: 'Example: these figures are made up to show the screen. On stalak.app, they are yours.', demoName: 'Example' }
};
function t(k, v){ var s = (TX[M.lang()] || TX.en)[k]; if (s == null) s = TX.en[k] != null ? TX.en[k] : k; if (v) for (var x in v) s = s.split('{' + x + '}').join(v[x]); return s; }
function num(n){ try { return new Intl.NumberFormat(M.lang() === 'fr' ? 'fr-FR' : 'en-US').format(n); } catch(e){ return String(n); } }
function day(iso){ try { return new Date(iso).toLocaleDateString(M.lang() === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'long' }); } catch(e){ return ''; } }

var INK = '#0a0d14', BLUE = '#1f6fd6';
var CSS = '@media (max-width:899px){'
+ '.m5{display:none}html.m5on .m5{display:block;position:fixed;z-index:130;left:0;right:0;top:0;bottom:var(--tabs,74px);overflow-y:auto;overscroll-behavior:contain;background:var(--skyA,#1f6fd6) fixed;background-color:#1f6fd6;padding:max(14px,env(safe-area-inset-top,0px)) 16px 26px;box-sizing:border-box}'
+ 'html.m5on .help-cube{display:none !important}html.m5on .tabbar{z-index:131}'
+ '.m5{overflow-x:hidden}.m5 *,.m5 *::before,.m5 *::after,.m5-pv *,.m5-ph *{box-sizing:border-box}.m5 > *{max-width:100%}'
+ '.m5 h1{margin:6px 0 2px;font:400 30px/1.1 var(--display);color:#fff;-webkit-text-stroke:7px ' + INK + ';paint-order:stroke fill;text-shadow:0 3px 0 ' + INK + '}.m5 .m5-who{margin:0 0 14px;font:700 15px/1.3 var(--body);color:rgba(255,255,255,.9)}'
+ '.m5-card{margin:0 0 14px;padding:16px;border:3px solid ' + INK + ';border-radius:22px;background:#fff;box-shadow:0 5px 0 ' + INK + ';color:' + INK + '}'
+ '.m5-card h2{margin:0 0 10px;font:400 21px/1.15 var(--display);color:' + INK + ';text-shadow:none}.m5-card p{margin:0;font:500 15px/1.45 var(--body);color:#3d4a63}'
+ '.m5-sum{margin:0;padding:0;list-style:none}.m5-sum li{position:relative;margin:0 0 10px;padding-left:26px;font:600 15.5px/1.45 var(--body);color:' + INK + '}.m5-sum li::before{content:"✓";position:absolute;left:0;top:0;color:' + BLUE + ';font-weight:900}'
+ '.m5-note{margin:0 0 14px;padding:12px 14px;border:2.5px solid ' + INK + ';border-radius:16px;background:#fff6cf;font:600 14.5px/1.4 var(--body);color:' + INK + '}'
+ '.m5-warn{background:#ffe1e1}'
+ '.m5-facts{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0 0 14px}.m5-fact{padding:12px;border:3px solid ' + INK + ';border-radius:18px;background:#fff;box-shadow:0 4px 0 ' + INK + '}'
+ '.m5-fact small{display:block;font:700 12px/1.2 var(--body);color:#7a8aa6;text-transform:uppercase;letter-spacing:.03em}.m5-fact b{display:block;margin-top:5px;font:900 20px/1.15 var(--body);color:' + INK + ';overflow-wrap:anywhere}.m5-fact em{display:block;margin-top:3px;font:600 12.5px/1.3 var(--body);font-style:normal;color:#3d4a63}'
+ '.m5-btn{display:block;width:100%;min-height:54px;margin:10px 0 0;border:3px solid ' + INK + ';border-radius:18px;background:#fff;box-shadow:0 4px 0 ' + INK + ';font:800 16px/1 var(--body);color:' + INK + ';cursor:pointer}'
+ '.m5-btn.blue{background:' + BLUE + ';color:#fff;font:400 20px/1 var(--display)}.m5-btn:active{transform:translateY(3px);box-shadow:0 1px 0 ' + INK + '}'
+ '.m5-give{display:flex;gap:8px;margin-top:10px}.m5-give input{flex:1;min-width:0;min-height:48px;padding:0 14px;border:3px solid ' + INK + ';border-radius:14px;font:700 17px/1 var(--body)}.m5-give button{flex:none;min-height:48px;padding:0 16px;border:3px solid ' + INK + ';border-radius:14px;background:' + BLUE + ';color:#fff;font:800 15px/1 var(--body)}'
+ '.m5-pro{position:relative}.m5-lock .m5-fakebox{filter:blur(7px);pointer-events:none;user-select:none}'
+ '.m5-ph{display:flex;align-items:center;gap:12px;margin:0 0 6px}.m5-ph .m5-pad{flex:none;width:56px;height:56px;font-size:26px}.m5-ph h2{margin:0 0 3px}.m5-ph p{font-size:13.5px}'
+ '.m5-pv h3{margin:16px 0 8px;font:800 13px/1.2 var(--body);letter-spacing:.04em;text-transform:uppercase;color:' + INK + '}.m5-pv h3::before{content:"🔒 ";font-size:11px}'
+ '.m5-bl{filter:blur(6px);pointer-events:none;user-select:none}'
+ '.m5-pvn{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.m5-pvn div{padding:9px 8px;border:2.5px solid ' + INK + ';border-radius:14px;background:#f4f9ff;min-width:0}.m5-pvn small{display:block;font:700 11px/1.2 var(--body);color:#3d4a63;overflow-wrap:anywhere}.m5-pvn b{display:block;margin-top:4px;font:900 19px/1 var(--body);color:' + INK + '}'
+ '.m5-pvv{margin:0;padding:0;list-style:none}.m5-pvv li{display:flex;align-items:center;gap:10px;padding:6px 0}.m5-pvv .th{flex:none;width:38px;height:50px;border:2.5px solid ' + INK + ';border-radius:9px;background:linear-gradient(160deg,#0e3f8f,' + BLUE + ' 55%,#8fd0ff)}.m5-pvv .tx{flex:1;min-width:0}.m5-pvv .tx i{display:block;height:11px;margin:4px 0;border-radius:6px;background:#c9dcf3}.m5-pvv .tx i+i{width:55%;background:#e3ecf8}.m5-pvv b{flex:none;font:900 15px/1 var(--body);color:' + BLUE + '}'
+ '.m5-pvp{padding:10px 12px;border-radius:14px;background:#eaf5ff;font:800 16px/1.3 var(--body);color:' + INK + '}'
+ '.m5-pvw{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.m5-pvw div{border:2.5px solid ' + INK + ';border-radius:14px;overflow:hidden;background:#fff;min-width:0}.m5-pvw small{display:block;padding:5px 8px;background:#ffd23f;border-bottom:2.5px solid ' + INK + ';font:800 12px/1 var(--body);color:' + INK + '}.m5-pvw p{margin:0;padding:8px;font:600 12px/1.35 var(--body);color:#3d4a63}'
+ '.m5-pv .bars{display:flex;align-items:flex-end;gap:7px;height:80px}.m5-pv .bars i{flex:1;border-radius:7px 7px 0 0;background:' + BLUE + '}'
+ '.m5-demo{background:#e6f2ff}'
+ '.m5-fakebox .bars{display:flex;align-items:flex-end;gap:7px;height:120px}.m5-fakebox .bars i{flex:1;border-radius:7px 7px 0 0;background:' + BLUE + '}'
+ '.m5-fakebox .ln{display:block;height:13px;margin:10px 0;border-radius:6px;background:#c9dcf3}'
+ '.m5-padbox{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:16px;text-align:center}'
+ '.m5-pad{width:70px;height:70px;border-radius:50%;border:3px solid ' + INK + ';background:#ffd23f;box-shadow:0 4px 0 ' + INK + ';display:grid;place-items:center;font-size:32px}'
+ '.m5-padbox h2{margin:0;font:400 22px/1.15 var(--display);color:' + INK + '}.m5-padbox p{margin:0;font:600 14px/1.4 var(--body);color:#3d4a63;max-width:290px}.m5-padbox .m5-btn{max-width:300px}'
+ '.m5-chart svg{display:block;width:100%;height:140px}.m5-chart .ax{font:600 10px var(--body);fill:#7a8aa6}'
+ '.m5-songs{margin:0;padding:0;list-style:none;counter-reset:s}.m5-songs li{display:flex;justify-content:space-between;gap:10px;padding:9px 0;border-bottom:2px solid #eaf1fb;font:600 14.5px/1.3 var(--body);color:' + INK + '}.m5-songs li::before{counter-increment:s;content:counter(s);flex:none;width:24px;font-weight:900;color:' + BLUE + '}.m5-songs li span{flex:1;min-width:0}.m5-songs li b{flex:none;font-weight:800}'
+ '.m5-mon{display:flex;align-items:flex-end;gap:5px;height:90px}.m5-mon i{flex:1;min-height:3px;border-radius:5px 5px 0 0;background:' + BLUE + '}.m5-mon i.z{background:#c9dcf3}'
+ '.m5-tip{margin-top:10px;padding:10px 12px;border-radius:14px;background:#eaf5ff;font:600 14.5px/1.4 var(--body);color:' + INK + '}.m5-tip b{color:' + BLUE + '}'
+ '.m5-ready{text-align:center}.m5-ready .m5-card{text-align:left}'
+ '.m5-spin{display:grid;place-items:center;gap:12px;min-height:50svh;font:700 16px/1.3 var(--body);color:#3d4a63}.m5-spin i{width:46px;height:46px;border-radius:50%;border:5px solid #c9dcf3;border-top-color:' + BLUE + ';animation:m5spin .8s linear infinite}'
+ '@keyframes m5spin{to{transform:rotate(360deg)}}@media (prefers-reduced-motion:reduce){.m5-spin i{animation:none}}'
+ '}';

var box = null, on = false, data = null, polls = 0;
function build(){
  if (box) return;
  var st = el('style'); st.textContent = CSS; D.head.appendChild(st);
  box = el('section', 'm5'); box.setAttribute('role', 'region'); box.id = 'm5Stats'; D.body.appendChild(box);
}
function show(v){
  build(); on = v; root.classList.toggle('m5on', v);
  $$('#tabBar [data-tab]').forEach(function(b){ if (v){ if (b.dataset.tab === 'stats') b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); } });
  if (v){ box.setAttribute('aria-label', t('title')); box.scrollTop = 0; }
}
function fakePro(){
  // the full analysis as it will look, its real titles readable, its contents blurred under the padlock (no real figure inside)
  var bl = function(h){ return '<div class="m5-bl" aria-hidden="true">' + h + '</div>'; };
  var vid = function(n, w){ return '<li><span class="th"></span><span class="tx"><i style="width:' + w + '%"></i><i></i></span><b>' + n + '</b></li>'; };
  return '<div class="m5-pv">'
    + '<h3>' + esc(t('pvNums')) + '</h3><div class="m5-pvn">'
    + [['pvL', '4 812'], ['pvF', '1 930'], ['pvV', '2 406']].map(function(x){ return '<div><small>' + esc(t(x[0])) + '</small>' + bl('<b>' + x[1] + '</b>') + '</div>'; }).join('') + '</div>'
    + '<h3>' + esc(t('pvVid')) + '</h3>' + bl('<ol class="m5-pvv">' + vid('12,4 k', 90) + vid('8,1 k', 72) + vid('5,6 k', 80) + '</ol>')
    + '<h3>' + esc(t('pvPace')) + '</h3>' + bl('<p class="m5-pvp">' + esc(t('pvPaceX')) + '</p>')
    + '<h3>' + esc(t('pvWeek')) + '</h3><div class="m5-pvw">'
    + ['d1', 'd2', 'd3'].map(function(k){ return '<div><small>' + esc(t(k)) + '</small>' + bl('<p>' + esc(t('planAny')) + '</p>') + '</div>'; }).join('') + '</div>'
    + '<h3>' + esc(t('pvChart')) + '</h3>' + bl('<div class="bars"><i style="height:28%"></i><i style="height:44%"></i><i style="height:36%"></i><i style="height:58%"></i><i style="height:52%"></i><i style="height:74%"></i><i style="height:90%"></i></div>')
    + '</div>';
}
function lockHead(){ return '<div class="m5-ph"><span class="m5-pad" aria-hidden="true">🔒</span><div><h2>' + esc(t('proT')) + '</h2><p>' + esc(t('proP')) + '</p></div></div>'; }
// for the questionnaire's « Ton analyse est prête » (lot 2): the same preview
function preview(){ build(); return '<div class="m5-card m5-pro m5-lock" style="margin:0;box-shadow:none;border:0;padding:0">' + lockHead() + fakePro() + '</div>'; }
function enter(){ M.play(function(g){ return g.fromTo($$('.m5 > *', D), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power3.out', stagger: 0.05, clearProps: 'opacity,transform' }); }); }

/* ---- « Ton analyse est prête » (signed out): the account to create first --------------------------------------------- */
function readyScreen(){
  box.innerHTML = '<div class="m5-ready"><h1>' + esc(t('ready')) + '</h1><p class="m5-who">' + esc(t('readyP')) + '</p></div>'
    + '<div class="m5-card m5-pro m5-lock">' + lockHead() + fakePro() + '</div>'
    + '<button type="button" class="m5-btn blue m5-create"></button>';
  $('.m5-create', box).textContent = t('create');
  $('.m5-create', box).onclick = function(){ store.set(WANT, '1'); show(false); M.go('login', { mode: 'up' }); };
  enter();
}

/* ---- the screen of someone signed in ---------------------------------------------------------------------------------- */
function spin(){ box.innerHTML = '<div class="m5-spin" role="status"><i aria-hidden="true"></i><span>' + esc(t('loading')) + '</span></div>'; }
function load(){
  spin();
  var st = W.StalakM2 && W.StalakM2.state(), waitSent = 0;
  // the answers just given go to the account first (lot 2): the analysis reads them
  var go = function(){
    var s2 = W.StalakM2 && W.StalakM2.state();
    if (s2 && (s2.done || s2.skipped) && !s2.sent && waitSent++ < 12){ setTimeout(go, 400); return; }
    fetch('/api/stats?lang=' + (M.lang() === 'fr' ? 'fr' : 'en'), { credentials: 'same-origin', cache: 'no-store', headers: { Accept: 'application/json' } })
      .then(function(r){ if (r.status === 401) return { signedOut: true }; if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function(d){
        if (!on) return;
        if (d.signedOut){ readyScreen(); return; }
        data = d; render(d);
        // Spotify read just now (a new artist link): asked again 3 times, every 3 s
        if (d.spotify && d.spotify.state === 'pending' && polls < 3){ polls++; setTimeout(function(){ if (on) load(); }, 3000); }
      })
      .catch(function(){ if (!on) return; box.innerHTML = '<h1>' + esc(t('title')) + '</h1><div class="m5-note m5-warn">' + esc(t('err')) + '</div><button type="button" class="m5-btn m5-retry"></button>'; $('.m5-retry', box).textContent = t('retry'); $('.m5-retry', box).onclick = load; });
  };
  go();
}
function render(d){
  var s = d.summary || {}, f = s.facts || {}, sp = d.spotify || {}, h = '';
  var st = W.StalakM2 && W.StalakM2.state(), name = d.demo ? t('demoName') : st && st.a && st.a.artistName;
  if (d.demo) h += '<div class="m5-note m5-demo" role="note">' + esc(t('demo')) + '</div>';
  h += '<h1>' + esc(t('title')) + '</h1>' + (name ? '<p class="m5-who">' + esc(name) + '</p>' : '');
  // the links the analysis needs
  var miss = (d.missing || []).map(function(k){ return t(k === 'tiktok' ? 'tt' : 'sp'); });
  if (miss.length){ var lst = miss.join(t('and')); lst = lst.charAt(0).toUpperCase() + lst.slice(1);
    h += '<div class="m5-note m5-warn">' + esc(t('missing', { list: M.lang() === 'fr' ? miss.join(t('and')) : lst, them: t(miss.length > 1 ? 'them2' : 'them1'), is: t(miss.length > 1 ? 'is2' : 'is1') })) + '<button type="button" class="m5-btn m5-links"></button></div>'; }
  // Spotify: what state the figures are in
  if (sp.state === 'pending') h += '<div class="m5-note">' + esc(t('pending')) + '</div>';
  else if (sp.state === 'stale') h += '<div class="m5-note">' + esc(t('stale', { d: day(sp.updatedAt) })) + '</div>';
  else if (sp.state === 'not_artist_link') h += '<div class="m5-note m5-warn">' + esc(t('notArtist')) + '<button type="button" class="m5-btn m5-links"></button></div>';
  else if (sp.state === 'failed' || sp.state === 'off') h += '<div class="m5-note">' + esc(t(sp.state)) + '<form class="m5-give"><input type="number" inputmode="numeric" min="0" step="1" aria-label="' + esc(t('give')) + '" placeholder="' + esc(t('give')) + '"><button type="submit">' + esc(t('save')) + '</button></form></div>';
  // the free summary: Comptes' 3 sentences, from real data
  var sen = s.sentences || [];
  h += '<div class="m5-card"><h2>' + esc(t('sum')) + '</h2>' + (sen.length ? '<ul class="m5-sum">' + sen.map(function(x){ return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '<p>' + esc(t('noData')) + '</p>') + '</div>';
  // a few facts (only those that exist)
  var fx = [];
  if (f.listeners) fx.push([t('listeners'), num(f.listeners.n), f.listeners.source === 'artist' ? t('given') : '']);
  if (f.followers != null) fx.push([t('followers'), num(f.followers), '']);
  if (f.lastRelease) fx.push([t('last'), f.lastRelease.name, f.lastRelease.daysAgo ? t('daysAgo', { n: f.lastRelease.daysAgo }) : t('today')]);
  if (f.topSong) fx.push([t('top'), f.topSong.name, f.topSong.under1000 ? t('under') : f.topSong.streams != null ? t('streams', { n: num(f.topSong.streams) }) : '']);
  if (f.topCity) fx.push([t('city'), f.topCity.city, '']);
  if (fx.length) h += '<div class="m5-facts">' + fx.map(function(x){ return '<div class="m5-fact"><small>' + esc(x[0]) + '</small><b>' + esc(x[1]) + '</b>' + (x[2] ? '<em>' + esc(x[2]) + '</em>' : '') + '</div>'; }).join('') + '</div>';
  // TikTok: the stats that already exist (Réseaux sociaux)
  h += '<button type="button" class="m5-btn m5-tt"></button>';
  // the Pro part: real for Pro / Creator Plus, a blurred generic drawing with a padlock otherwise
  if (d.locked || !d.pro) h += '<div class="m5-card m5-pro m5-lock" style="margin-top:14px">' + lockHead() + fakePro() + '<button type="button" class="m5-btn blue m5-unlock"></button></div>';
  else h += proPart(d.pro, f);
  box.innerHTML = h;
  $$('.m5-links', box).forEach(function(b){ b.textContent = t('addLinks'); b.onclick = function(){ show(false); if (W.StalakM2) W.StalakM2.onboarding({ from: 'stats', start: 'links' }); }; });
  var tt = $('.m5-tt', box); tt.textContent = t(d.tiktokLinked ? 'ttStats' : 'ttLink');
  tt.onclick = function(){ show(false); if (!(M.ttStats && M.ttStats())) M.go('account'); };
  var un = $('.m5-unlock', box); if (un){ un.textContent = t('unlock'); un.onclick = function(){ show(false); M.go('pro', { from: 'stats' }); }; }
  var gv = $('.m5-give', box); if (gv) gv.onsubmit = function(e){ e.preventDefault(); var v = Math.round(+$('input', gv).value); if (!(v >= 0) || !M.acct || typeof M.acct.saveListeners !== 'function') return;
    Promise.resolve(M.acct.saveListeners(v)).then(function(){ gv.outerHTML = '<p class="m5-tip">' + esc(t('saved')) + '</p>'; setTimeout(function(){ if (on) load(); }, 600); }).catch(function(){}); };
  enter();
}
function proPart(p, f){
  var h = '';
  // the listeners, week by week (the reading of Spotify, and the figures given by the artist)
  var w = (p.weeks || []).filter(function(x){ return x.listeners != null; });
  if (w.length > 1){
    var mx = Math.max.apply(null, w.map(function(x){ return x.listeners; })) || 1, n = w.length, pts = w.map(function(x, i){ return (10 + 300 * i / (n - 1)).toFixed(1) + ',' + (120 - 100 * x.listeners / mx).toFixed(1); }).join(' ');
    h += '<div class="m5-card m5-chart"><h2>' + esc(t('weeks')) + '</h2><svg viewBox="0 0 320 140" role="img" aria-label="' + esc(t('weeks')) + '"><polyline points="' + pts + '" fill="none" stroke="' + BLUE + '" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>'
      + '<text class="ax" x="10" y="136">' + esc(w[0].week) + '</text><text class="ax" x="310" y="136" text-anchor="end">' + esc(w[n - 1].week) + '</text><text class="ax" x="312" y="16" text-anchor="end">' + esc(num(mx)) + '</text></svg></div>';
  }
  // the songs, most played first (« moins de 1 000 écoutes », never 0)
  var so = p.songs || [];
  if (so.length) h += '<div class="m5-card"><h2>' + esc(t('songs')) + '</h2><ol class="m5-songs">' + so.slice(0, 10).map(function(x){ return '<li><span>' + esc(x.name) + '</span><b>' + esc(x.under1000 ? t('under') : x.streams != null ? t('streams', { n: num(x.streams) }) : '') + '</b></li>'; }).join('') + '</ol></div>';
  // releases per month
  var bm = p.byMonth || [];
  if (bm.length){ var mm = Math.max.apply(null, bm.map(function(x){ return x.songs || 0; })) || 1;
    h += '<div class="m5-card"><h2>' + esc(t('months')) + '</h2><div class="m5-mon" role="img" aria-label="' + esc(bm.map(function(x){ return x.month + ' : ' + (x.songs || 0); }).join(', ')) + '">' + bm.map(function(x){ var v = x.songs || 0; return '<i class="' + (v ? '' : 'z') + '" style="height:' + Math.max(4, Math.round(100 * v / mm)) + '%"></i>'; }).join('') + '</div></div>'; }
  // the pace and the plan of the week: advice, said as advice (from rhythm and byMonth)
  var r = p.rhythm || {};
  if (r.daysSinceLast != null){
    var tip = r.avgGapDays && r.avgGapDays <= 35 ? t('adviceKeep', { w: Math.max(1, Math.round(r.avgGapDays / 7)) }) : t('adviceMore');
    h += '<div class="m5-card"><h2>' + esc(t('rhythm')) + '</h2><p>' + esc(t('rhythmP', { d: r.daysSinceLast, a: r.avgGapDays != null ? Math.round(r.avgGapDays) : '—' })) + '</p><p class="m5-tip"><b>' + esc(t('advice')) + ' :</b> ' + esc(tip) + '</p></div>';
  }
  var lr = f.lastRelease, plan = lr && lr.daysAgo != null && lr.daysAgo <= 30 ? t('planNew', { name: lr.name }) : lr ? t('planNext') : t('planAny');
  h += '<div class="m5-card"><h2>' + esc(t('plan')) + '</h2><p class="m5-tip"><b>' + esc(t('advice')) + ' :</b> ' + esc(plan) + '</p></div>';
  var ci = p.cities || [];
  if (ci.length) h += '<div class="m5-card"><h2>' + esc(t('cities')) + '</h2><ol class="m5-songs">' + ci.slice(0, 5).map(function(x){ return '<li><span>' + esc(x.city) + (x.country ? ' · ' + esc(x.country) : '') + '</span><b>' + esc(num(x.listeners)) + '</b></li>'; }).join('') + '</ol></div>';
  return h;
}

/* ---- the way in: the « Stats » tab ------------------------------------------------------------------------------------- */
/* ---- demo of the mock-ups (24/11, owner's feedback): ?demo=gratuit / ?demo=pro shows « Stats » as for a signed-in free / Pro
   account, with example figures said to be examples. Never on stalak.app: only on the previews (*.pages.dev) and the tests ---- */
var DEMO = (function(){ try { if (/(^|\.)stalak\.app$/i.test(location.hostname)) return null; var m = /[?&]demo=(gratuit|free|pro)(&|$)/i.exec(location.search); return m ? (m[1].toLowerCase() === 'pro' ? 'pro' : 'free') : null; } catch(e){ return null; } })();
function demoData(){
  var fr = M.lang() === 'fr', ago = function(n){ return new Date(Date.now() - n * 864e5).toISOString().slice(0, 10); };
  var d = { demo: true, missing: [], tiktokLinked: true, spotify: { state: 'ok', updatedAt: ago(2) },
    summary: { sentences: fr ? ['Tu as 4 812 auditeurs ce mois-ci, 6 % de plus que le mois dernier.', 'Ton dernier son, « Neva Die », est sorti il y a 12 jours.', 'Ton public est surtout à Toulouse.']
                             : ['You have 4,812 listeners this month, 6% more than last month.', 'Your latest song, “Neva Die”, came out 12 days ago.', 'Your audience is mostly in Toulouse.'],
      facts: { listeners: { n: 4812, source: 'spotify' }, followers: 1930, lastRelease: { name: 'Neva Die', daysAgo: 12 }, topSong: { name: 'Neva Die', streams: 18400 }, topCity: { city: 'Toulouse' } } } };
  if (DEMO === 'pro') d.pro = { weeks: [3900, 4100, 4050, 4380, 4520, 4700, 4812].map(function(n, i){ return { week: fr ? 'S' + (41 + i) : 'W' + (41 + i), listeners: n }; }),
      songs: [{ name: 'Neva Die', streams: 18400 }, { name: 'Glaçon', streams: 9200 }, { name: 'Albi Nuit', streams: 3100 }, { name: 'Premier Son', under1000: true }],
      byMonth: [1, 0, 1, 1, 0, 1].map(function(n, i){ return { month: String(i + 6), songs: n }; }),
      rhythm: { daysSinceLast: 12, avgGapDays: 24 }, cities: [{ city: 'Toulouse', country: 'FR', listeners: 1240 }, { city: 'Paris', country: 'FR', listeners: 860 }, { city: 'Lyon', country: 'FR', listeners: 410 }] };
  else d.locked = true;
  return d;
}
function open(){
  if (!M.phone()) return false;
  if (DEMO){ build(); show(true); render(demoData()); return true; }
  var st = W.StalakM2 && W.StalakM2.state();
  // never answered (or never opened): the questionnaire first
  if (!st || !(st.done || st.skipped)){ if (W.StalakM2){ W.StalakM2.onboarding({ from: 'stats' }); return true; } }
  build(); show(true); polls = 0;
  if (M.acct && M.acct.state.user) load(); else readyScreen();
  return true;
}
// after the questionnaire: signed in → the analysis; signed out → « Ton analyse est prête », then the account
function after(done){ polls = 0; if (M.acct && M.acct.state.user){ build(); show(true); load(); } else { store.set(WANT, '1'); M.go('login', { mode: 'up' }); } }
function sync(){
  // another tab or page: this screen goes
  if (box && on && (M.view() || !M.home())) show(false);
  // back from creating the account: « Stats » opens with the analysis
  var u = M.acct && M.acct.state.user;
  if (u && store.get(WANT) && !M.view()){ store.set(WANT, null); open(); }
}
M.on(sync); setTimeout(sync, 600);
if (DEMO) setTimeout(function(){ if (M.phone() && !M.view() && !on) open(); }, 900);
$('#tabBar') && $('#tabBar').addEventListener('click', function(e){ var b = e.target.closest && e.target.closest('[data-tab]'); if (b && b.dataset.tab !== 'stats' && on) show(false); }, true);
W.StalakM5 = { open: open, after: after, preview: preview, demo: function(){ return DEMO; }, close: function(){ show(false); }, on: function(){ return on; } };
})();
