/* App & montage, refonte mobile, lot 2 (24/11): the sign-in and the profile as full screens, pull to refresh on « Montages »,
   and the onboarding (demos n° 2, 3, 4 and 13 of docs/audit/maquettes/mobile-2026-11-23/). Phones only (under 900 px),
   stalak.app only (accounts needed). Loaded by the app after itself, never on a computer: /assets/mobile2.<hash>.js.
   It carries its own style and its own words (FR / EN), and talks to the app through window.StalakM (src/app.js).
   Nothing here changes the rules of the accounts: the same forms, the same buttons, dressed and ordered differently.
   Every sentence of the onboarding says something true: it repeats the person's answers, or names what Stalak really does. */
(function(){
'use strict';
var M = window.StalakM, D = document, W = window; if (!M || W.__stalakM2) return; W.__stalakM2 = 1;
var $ = function(s, r){ return (r || D).querySelector(s); }, $$ = function(s, r){ return Array.prototype.slice.call((r || D).querySelectorAll(s)); };
var root = D.documentElement;
function el(tag, cls, html){ var e = D.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function fr(){ return M.lang() === 'fr'; }
var store = { get: function(k){ try { return localStorage.getItem(k); } catch(e){ return null; } }, set: function(k, v){ try { localStorage.setItem(k, v); } catch(e){} } };
function play(build){ return M.play(build); }

/* ---- words ---------------------------------------------------------------------------------------------------------- */
var TX = {
fr: {
  'lg.in': 'Connecte-toi pour <b>garder tes montages</b>', 'lg.inS': 'Retrouve-les sur tous tes appareils.', 'lg.up': 'Crée ton compte <b>Stalak</b>', 'lg.code': 'Regarde <b>tes e-mails</b>', 'lg.forgot': 'Mot de passe <b>oublié ?</b>', 'lg.newpw': 'Nouveau <b>mot de passe</b>',
  'lg.bIn': 'Content de te voir !', 'lg.bUp': 'Bienvenue !', 'lg.bCode': 'Presque fini !', 'lg.bPw': 'Ça arrive à tout le monde',
  'lg.cont': 'Continuer', 'lg.mailPh': 'Ton e-mail', 'lg.close': 'Fermer',
  'pf.set': 'Réglages du compte', 'pf.back': 'Retour', 'pf.plan': 'Ma formule', 'pf.free': 'Gratuit', 'pf.plans': 'Voir les formules', 'pf.tt': 'TikTok', 'pf.ttNo': 'Pas relié', 'pf.ttLink': 'Relier', 'pf.ttStats': 'Mes stats',
  'pf.gal': 'Mes montages', 'pf.lang': 'Langue', 'pf.help': 'Aide', 'pf.legal': 'Infos légales et guides', 'pf.acct': 'Photo, pseudo, mot de passe', 'pf.out': 'Se déconnecter', 'pf.setT': 'Réglages du compte',
  'lgl.t': 'Infos légales et guides', 'lgl.x': 'Fermer',
  'ptr.pull': 'Tire encore un peu…', 'ptr.go': 'Quoi de neuf ?', 'ptr.done': 'C’est à jour',
  'ob.skip': 'Passer', 'ob.back': 'Question précédente', 'ob.next': 'Continuer', 'ob.go': 'Faire ma 1re vidéo', 'ob.multi': 'Plusieurs choix possibles',
  'ob.q0': 'Ton nom d’artiste ?', 'ob.q0ph': 'Ton nom',
  'ob.q1': 'Tu fais quoi ?', 'ob.g.rap': 'Rap', 'ob.g.drill': 'Drill', 'ob.g.chant': 'Chant', 'ob.g.autre': 'Autre',
  'ob.q2': 'Ta musique est déjà sur les plateformes ?', 'ob.p.oui': 'Oui, déjà en ligne', 'ob.p.non': 'Pas encore',
  'ob.badlink': 'Ce n’est pas un lien {site}. Corrige-le ou efface-le.', 'ob.q3': 'Colle tes liens', 'ob.q3h': 'On s’en sert pour suivre tes écoutes',
  'ob.q4': 'Tu as combien d’auditeurs par mois aujourd’hui ?', 'ob.q4h': 'Regarde dans Spotify for Artists',
  'ob.l.a': 'Moins de 100', 'ob.l.b': '100 à 1 000', 'ob.l.c': '1 000 à 10 000', 'ob.l.d': 'Plus de 10 000',
  'ob.q5': 'Où tu postes tes vidéos ?', 'ob.s.tiktok': 'TikTok', 'ob.s.reels': 'Reels', 'ob.s.shorts': 'YouTube Shorts',
  'ob.q6': 'Ce qui te bloque ?', 'ob.b.vues': 'Mes vidéos font peu de vues', 'ob.b.temps': 'Le montage me prend du temps', 'ob.b.idees': 'Je sais pas quoi poster',
  'ob.q7': 'Combien d’auditeurs par mois tu vises ?', 'ob.t.a': '1 000', 'ob.t.b': '10 000', 'ob.t.c': '100 000', 'ob.t.d': '1 million et plus',
  'ob.q8': 'Ton objectif ?', 'ob.o.son': 'Faire décoller un son', 'ob.o.poster': 'Poster plus souvent', 'ob.o.concerts': 'Remplir mes concerts',
  'ob.b0': 'Salut !', 'ob.b1': 'Enchanté, {name} !', 'ob.b1n': 'Enchanté !', 'ob.b2': '{list}, noté !', 'ob.b2n': 'C’est noté !', 'ob.b3': 'Trop bien !', 'ob.b3n': 'Ça viendra !', 'ob.b4': 'Je note tout', 'ob.b5': 'Bien, on part de là',
  'ob.b6': '{list}, top', 'ob.b6n': 'Ça marche', 'ob.b7': 'Merci de me le dire', 'ob.b8': 'Gros objectif, j’aime', 'ob.b9': 'C’est parti !',
  'ob.load': 'On analyse ton profil…', 'ob.ready': 'Ton analyse est prête', 'ob.readyP': 'Crée ton compte pour voir ton analyse.', 'ob.readyIn': 'Elle t’attend dans « Stats ».', 'ob.create': 'Crée ton compte pour la voir', 'ob.see': 'Voir mon analyse', 'ob.other': 'Dis-nous ce que tu fais', 'ob.need': 'Ton TikTok (et ton Spotify si ta musique est en ligne) : sans eux, « Stats » ne peut pas faire ton analyse.', 'ob.needOne': 'Il faut ton {site} pour faire ton analyse.', 'ob.req': 'obligatoire', 'ob.st.tt': 'On analyse ton TikTok…', 'ob.st.sp': 'On lit tes sorties Spotify…', 'ob.st.style': 'On regarde ton style : <b>{list}</b>', 'ob.st.goal': 'On compare avec ton objectif : <b>{v}</b> auditeurs', 'ob.st.posts': 'On prépare tes conseils pour {list}', 'ob.st.end': 'On écrit ton bilan…', 'ob.ln.from': 'Tu pars de <b>{v}</b> auditeurs par mois', 'ob.ln.genre': '{list} : coupes calées sur des tempos rapides', 'ob.ln.fmt': 'Format <b>9:16</b> pour {list}', 'ob.ln.goal': 'Objectif : <b>{v}</b> auditeurs par mois', 'ob.ln.none': 'Stalak coupe tes prises sur le rythme de ton son',
  'ob.plan': 'Ton plan est prêt, {name} !', 'ob.planN': 'Ton plan est prêt !',
  'ob.pl.who': '{genres}, sur {posts}', 'ob.pl.whoG': '{genres}', 'ob.pl.whoP': 'Sur {posts}', 'ob.pl.path': 'De {from} à {to} auditeurs par mois', 'ob.pl.to': 'Objectif : {to} auditeurs par mois',
  'ob.f.lt100': 'moins de 100', 'ob.f.100_1k': '100-1 000', 'ob.f.1k_10k': '1 000-10 000', 'ob.f.gt10k': 'plus de 10 000',
  'ob.pl.week': '3 vidéos par semaine, coupées sur le rythme', 'ob.pl.stats': 'Tes auditeurs suivis chaque semaine dans « Stats »', 'ob.pl.first': 'Ta 1re vidéo en 1 minute',
  'and': ' et '
},
en: {
  'lg.in': 'Sign in to <b>keep your edits</b>', 'lg.inS': 'Find them on all your devices.', 'lg.up': 'Create your <b>Stalak</b> account', 'lg.code': 'Check <b>your e-mail</b>', 'lg.forgot': 'Forgot your <b>password?</b>', 'lg.newpw': 'New <b>password</b>',
  'lg.bIn': 'Good to see you!', 'lg.bUp': 'Welcome!', 'lg.bCode': 'Almost done!', 'lg.bPw': 'Happens to everyone',
  'lg.cont': 'Continue', 'lg.mailPh': 'Your e-mail', 'lg.close': 'Close',
  'pf.set': 'Account settings', 'pf.back': 'Back', 'pf.plan': 'My plan', 'pf.free': 'Free', 'pf.plans': 'See the plans', 'pf.tt': 'TikTok', 'pf.ttNo': 'Not linked', 'pf.ttLink': 'Link', 'pf.ttStats': 'My stats',
  'pf.gal': 'My edits', 'pf.lang': 'Language', 'pf.help': 'Help', 'pf.legal': 'Legal info and guides', 'pf.acct': 'Photo, name, password', 'pf.out': 'Sign out', 'pf.setT': 'Account settings',
  'lgl.t': 'Legal info and guides', 'lgl.x': 'Close',
  'ptr.pull': 'Pull a bit more…', 'ptr.go': 'What’s new?', 'ptr.done': 'Up to date',
  'ob.skip': 'Skip', 'ob.back': 'Previous question', 'ob.next': 'Continue', 'ob.go': 'Make my first video', 'ob.multi': 'Pick as many as you like',
  'ob.q0': 'Your artist name?', 'ob.q0ph': 'Your name',
  'ob.q1': 'What do you make?', 'ob.g.rap': 'Rap', 'ob.g.drill': 'Drill', 'ob.g.chant': 'Singing', 'ob.g.autre': 'Other',
  'ob.q2': 'Is your music already on streaming platforms?', 'ob.p.oui': 'Yes, already out', 'ob.p.non': 'Not yet',
  'ob.badlink': 'This is not a {site} link. Fix it or clear it.', 'ob.q3': 'Paste your links', 'ob.q3h': 'We use them to track your streams',
  'ob.q4': 'How many monthly listeners do you have today?', 'ob.q4h': 'Look in Spotify for Artists',
  'ob.l.a': 'Under 100', 'ob.l.b': '100 to 1,000', 'ob.l.c': '1,000 to 10,000', 'ob.l.d': 'Over 10,000',
  'ob.q5': 'Where do you post your videos?', 'ob.s.tiktok': 'TikTok', 'ob.s.reels': 'Reels', 'ob.s.shorts': 'YouTube Shorts',
  'ob.q6': 'What is holding you back?', 'ob.b.vues': 'My videos get few views', 'ob.b.temps': 'Editing takes me too long', 'ob.b.idees': 'I don’t know what to post',
  'ob.q7': 'How many monthly listeners are you aiming for?', 'ob.t.a': '1,000', 'ob.t.b': '10,000', 'ob.t.c': '100,000', 'ob.t.d': '1 million and more',
  'ob.q8': 'Your goal?', 'ob.o.son': 'Make a song take off', 'ob.o.poster': 'Post more often', 'ob.o.concerts': 'Fill my shows',
  'ob.b0': 'Hey!', 'ob.b1': 'Nice to meet you, {name}!', 'ob.b1n': 'Nice to meet you!', 'ob.b2': '{list}, noted!', 'ob.b2n': 'Noted!', 'ob.b3': 'Love it!', 'ob.b3n': 'It will come!', 'ob.b4': 'Writing it all down', 'ob.b5': 'Good, we start from there',
  'ob.b6': '{list}, nice', 'ob.b6n': 'Works for me', 'ob.b7': 'Thanks for telling me', 'ob.b8': 'Big goal, I like it', 'ob.b9': 'Let’s go!',
  'ob.load': 'Analysing your profile…', 'ob.ready': 'Your analysis is ready', 'ob.readyP': 'Create your account to see your analysis.', 'ob.readyIn': 'It’s waiting for you in “Stats”.', 'ob.create': 'Create your account to see it', 'ob.see': 'See my analysis', 'ob.other': 'Tell us what you make', 'ob.need': 'Your TikTok (and your Spotify if your music is out): without them, “Stats” can’t make your analysis.', 'ob.needOne': 'We need your {site} to make your analysis.', 'ob.req': 'required', 'ob.st.tt': 'Analysing your TikTok…', 'ob.st.sp': 'Reading your Spotify releases…', 'ob.st.style': 'Looking at your style: <b>{list}</b>', 'ob.st.goal': 'Comparing with your goal: <b>{v}</b> listeners', 'ob.st.posts': 'Preparing your tips for {list}', 'ob.st.end': 'Writing your summary…', 'ob.ln.from': 'You start from <b>{v}</b> monthly listeners', 'ob.ln.genre': '{list}: cuts set to fast tempos', 'ob.ln.fmt': '<b>9:16</b> format for {list}', 'ob.ln.goal': 'Goal: <b>{v}</b> monthly listeners', 'ob.ln.none': 'Stalak cuts your takes to the beat of your song',
  'ob.plan': 'Your plan is ready, {name}!', 'ob.planN': 'Your plan is ready!',
  'ob.pl.who': '{genres}, on {posts}', 'ob.pl.whoG': '{genres}', 'ob.pl.whoP': 'On {posts}', 'ob.pl.path': 'From {from} to {to} monthly listeners', 'ob.pl.to': 'Goal: {to} monthly listeners',
  'ob.f.lt100': 'under 100', 'ob.f.100_1k': '100-1,000', 'ob.f.1k_10k': '1,000-10,000', 'ob.f.gt10k': 'over 10,000',
  'ob.pl.week': '3 videos a week, cut to the beat', 'ob.pl.stats': 'Your listeners tracked every week in “Stats”', 'ob.pl.first': 'Your 1st video in 1 minute',
  'and': ' and '
} };
function t(k, v){ var s = (TX[M.lang()] || TX.en)[k]; if (s == null) s = TX.en[k] || k; if (v) for (var n in v) s = s.split('{' + n + '}').join(v[n]); return s; }
function low(a){ return a.map(function(x, i){ return i && /^[A-ZÀ-Ý][a-zà-ÿ]+$/.test(x) ? x.toLowerCase() : x; }); }
function list(a){ return a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + t('and') + a[a.length - 1]; }

/* ---- style (phones only) -------------------------------------------------------------------------------------------- */
var CSS = '@media (max-width:899px){'
// the scene: blue light, rays, snow, the ice at the top, a mound of snow
+ '.m2-scene{position:relative;height:214px;margin:0 -16px;overflow:hidden;background:radial-gradient(300px 300px at 50% 62%,#5aa0f5 0,#1f6fd6 55%,#1657b3 100%)}'
+ '.m2-rays{position:absolute;left:50%;top:-190px;width:640px;height:640px;margin-left:-320px;border-radius:50%;background:repeating-conic-gradient(from 4deg,rgba(255,255,255,.5) 0 9deg,transparent 9deg 22deg);-webkit-mask:radial-gradient(circle,#000 14%,transparent 60%);mask:radial-gradient(circle,#000 14%,transparent 60%);opacity:.22}'
+ '.m2-fl{position:absolute;border-radius:50%;background:#fff}'
+ '.m2-ice{position:absolute;top:-34px;left:0;width:100%;z-index:3;pointer-events:none}'
+ '.m2-mound{position:absolute;left:-40px;right:-40px;bottom:-116px;height:160px;border-radius:50%;background:#fff;border:3.5px solid #0a0d14;z-index:1}'
+ '.m2-masc{position:absolute;left:50%;bottom:10px;width:132px;height:159px;margin-left:-66px;background:var(--mascot) center bottom/contain no-repeat;z-index:2;filter:drop-shadow(0 6px 0 rgba(10,13,20,.25))}'
+ '.m2-bub{position:absolute;top:44px;left:calc(50% + 34px);max-width:42vw;background:#fff;color:#0a0d14;border:3px solid #0a0d14;border-radius:18px;padding:8px 12px;font:400 16px/1.1 var(--display);box-shadow:0 4px 0 #0a0d14;transform:rotate(5deg);z-index:4}'
+ '.m2-bub::after{content:"";position:absolute;left:18px;bottom:-11px;width:14px;height:14px;background:#fff;border-right:3px solid #0a0d14;border-bottom:3px solid #0a0d14;transform:rotate(45deg) skew(10deg,10deg)}'
+ '.m2-round{position:absolute;top:calc(max(14px,env(safe-area-inset-top,0px)) + 30px);left:16px;width:44px;height:44px;border-radius:50%;background:#fff;color:#0a0d14;border:3px solid #0a0d14;box-shadow:0 3px 0 #0a0d14;display:grid;place-items:center;padding:0;z-index:6}'
+ '.m2-round svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2.8;stroke-linecap:round;stroke-linejoin:round}'
+ '.m2-round.r{left:auto;right:16px}'
// ---- the sign-in, full screen
+ 'html.m2-login .acctpage{background:#fff}'
+ 'html.m2-login .ap-in{padding:0 16px calc(18px + env(safe-area-inset-bottom,0px));max-width:none;min-height:100%;box-sizing:border-box;display:flex;flex-direction:column}'
+ 'html.m2-login .ap-top{position:absolute;left:0;top:0;z-index:6;margin:0;padding:0}'
+ 'html.m2-login #apBack{position:absolute;top:calc(max(14px,env(safe-area-inset-top,0px)) + 30px);left:16px;width:44px;height:44px;min-height:0;border-radius:50%;padding:0;justify-content:center;background:#fff;border:3px solid #0a0d14;box-shadow:0 3px 0 #0a0d14}'
+ 'html.m2-login #apBack span{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}'
+ 'html.m2-login #apLogin{display:flex;flex-direction:column;flex:1}'
+ 'html.m2-login #apLogin[hidden]{display:none}'
+ 'html.m2-login #apLoginT{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}'
+ 'html.m2-login #apLogin .m2-lt{margin:16px 0 0;font:400 30px/1.08 var(--display);text-align:center;color:#0a0d14;text-shadow:none;text-wrap:balance;-webkit-text-stroke:0}html.m2-login #apLogin .m2-lt b{font-weight:400;color:#1f6fd6}.m2-ls{margin:8px 0 0;font:500 15px/1.35 var(--body);text-align:center;color:#3d4a63}.m2-ls[hidden]{display:none}'
+ 'html.m2-login .ap-noacct,html.m2-login .ap-why{margin:8px auto 0;max-width:21em;font:500 15px/1.4 var(--body);color:#3f5170;text-align:center;text-shadow:none}'
+ 'html.m2-login .ap-why:not([hidden]) ~ .ap-noacct,html.m2-login .ap-noacct.m2-off{display:none}'
+ 'html.m2-login .ap-auth{margin:14px 0 0;padding:0;border:0;box-shadow:none;background:none;border-radius:0}'
+ 'html.m2-login .ap-auth::before,html.m2-login .ap-auth::after{display:none}'
+ 'html.m2-login #apStepForm{display:flex;flex-direction:column}html.m2-login #apStepForm[hidden]{display:none}'
+ 'html.m2-login .ap-tabs{display:none}'
+ 'html.m2-login #apInF,html.m2-login #apUpF{order:1}html.m2-login .ap-social{order:2;display:flex;flex-direction:column;gap:10px;margin:0}html.m2-login .ap-social[hidden]{display:none}'
+ 'html.m2-login .ap-or{order:-1;margin:16px 0 4px}'
+ 'html.m2-login .ap-switch{order:3;margin-top:16px;text-align:center}'
+ 'html.m2-login .ap-field input{min-height:58px;border-radius:18px;border:3px solid #0a0d14;background:#eef6ff;box-shadow:inset 0 3px 0 #d6ecff;font-size:17px}'
+ 'html.m2-login .ap-eye{min-height:58px;border-radius:18px;border-width:3px}'
+ 'html.m2-login .ap-go,.m2-cont{display:flex;align-items:center;justify-content:center;gap:10px;width:100%;min-height:62px;margin-top:14px;border-radius:18px;background:#1f6fd6;color:#fff;border:3.5px solid #0a0d14;box-shadow:0 6px 0 #0a0d14;font:400 23px/1 var(--display);text-shadow:0 2px 0 #0a0d14}'
+ 'html.m2-login .ap-go::before,html.m2-login .ap-go::after{display:none}'
+ 'html.m2-login .ap-go:active,.m2-cont:active{transform:translateY(3px);box-shadow:0 3px 0 #0a0d14}'
+ '.m2-cont svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:3;stroke-linecap:round;stroke-linejoin:round;filter:drop-shadow(0 2px 0 #0a0d14)}'
+ 'html.m2-login .ap-sso{min-height:58px;border-radius:18px;border:3px solid #0a0d14;background:#fff;box-shadow:0 5px 0 #d6ecff;font:600 17px var(--body)}'
+ 'html.m2-login .ap-uplegal{margin-top:14px;text-align:center;font-size:12.5px;color:#7a8aa6}'
// the e-mail first: the rest of the form comes after « Continuer »
+ '.m2-cont{display:none}'
+ 'html.m2-login .m2-e1 .m2-cont{display:flex}'
+ 'html.m2-login .m2-e1 form > .ap-field ~ .ap-field,html.m2-login .m2-e1 form > .ap-go,html.m2-login .m2-e1 form > .ap-note,html.m2-login .m2-e1 form > .ap-uplegal{display:none}'
+ 'html.m2-login .m2-e1 .ap-field > label{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}'
// ---- the profile, its own screen
+ 'html.m2-prof .acctpage{background:var(--ice,#d6ecff)}'
+ 'html.m2-prof .ap-top{display:none}'
+ 'html.m2-prof .ap-in{padding-top:0}'
+ 'html.m2-prof:not(.m2-set) #apAccount > :not(.m2-pf){display:none}'
+ '.m2-pf{display:none}html.m2-prof:not(.m2-set) .m2-pf{display:block}'
+ 'html.m2-prof.m2-set .ap-top{display:block}html.m2-prof.m2-set .ap-in{padding-top:max(14px,env(safe-area-inset-top,0px))}html.m2-prof.m2-set #apAccT{color:#0a0d14;text-shadow:none}'
+ '.m2-pf .m2-scene{height:236px}.m2-pf .m2-mound{background:var(--ice,#d6ecff);bottom:-124px}'
+ '.m2-av{position:absolute;left:50%;top:56px;width:132px;height:132px;margin-left:-66px;border-radius:50%;border:4.5px solid #0a0d14;background:#d6ecff var(--mascot-head) center/118% no-repeat;z-index:3;box-shadow:0 6px 0 rgba(10,13,20,.25);display:grid;place-items:center;font:400 44px var(--display);color:#0a0d14;overflow:hidden}'
+ '.m2-av.has{background-size:cover}'
+ '.m2-who{position:relative;z-index:4;margin-top:-20px;text-align:center}'
+ '.m2-name{display:inline-flex;align-items:center;gap:8px;max-width:100%;font:400 30px/1.1 var(--display);color:#0a0d14}.m2-name span:first-child{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
+ '.m2-badge{flex:none;padding:3px 10px;border-radius:999px;background:#0a0d14;color:#fff;font:400 13px/1.3 var(--display);letter-spacing:.04em;text-transform:uppercase}'
+ '.m2-mail{margin:2px 0 0;font:500 15px var(--body);color:#56657f;overflow:hidden;text-overflow:ellipsis}'
+ '.m2-cards{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:18px}.m2-cards.one{grid-template-columns:1fr}'
+ '.m2-card{display:block;width:100%;text-align:left;padding:13px 14px 12px;border-radius:20px;background:#fff;color:#0a0d14;border:3px solid #0a0d14;box-shadow:0 5px 0 #0a0d14;min-width:0}'
+ '.m2-card small{display:block;font:500 13px var(--body);color:#7a8aa6}.m2-card b{display:block;font:400 19px/1.2 var(--display);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.m2-card i{display:block;margin-top:2px;font:600 14px var(--body);font-style:normal;color:#1f6fd6}'
+ '.m2-card em{display:block;margin-top:3px;font:500 13.5px/1.35 var(--body);font-style:normal;color:#3f5170;white-space:normal}.m2-card.wide{grid-column:1/-1}'
+ '.m2-list{margin-top:14px;padding:4px 14px;border-radius:22px;background:#fff;border:3px solid #0a0d14;box-shadow:0 5px 0 #0a0d14}'
+ '.m2-row{display:flex;align-items:center;gap:12px;width:100%;min-height:58px;padding:6px 0;background:none;border:0;border-top:2px solid #e3f0ff;color:#0a0d14;font:600 17px var(--body);text-align:left}'
+ '.m2-row:first-child{border-top:0}.m2-row > u{flex:none;width:38px;height:38px;border-radius:12px;border:2.5px solid #0a0d14;background:#eef6ff;display:grid;place-items:center;text-decoration:none}'
+ '.m2-row > u svg{width:20px;height:20px;fill:none;stroke:#0a0d14;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}'
+ '.m2-row > span{flex:1;min-width:0}.m2-row > em{font:500 15px var(--body);font-style:normal;color:#7a8aa6}.m2-row > svg{flex:none;width:18px;height:18px;fill:none;stroke:#0a0d14;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}'
+ '.m2-row .langsw{flex:none}'
+ '.m2-out{display:block;margin:18px auto 6px;padding:12px 18px;background:none;border:0;font:700 17px var(--body);color:#c0392b}'
// the legal links, in a sheet
+ '.m2-sheet{position:fixed;inset:0;z-index:120;background:rgba(10,13,20,.45);display:flex;align-items:flex-end}'
+ '.m2-sheet > div{width:100%;max-height:82svh;overflow-y:auto;box-sizing:border-box;padding:18px 18px calc(22px + env(safe-area-inset-bottom,0px));background:#fff;border-top:3.5px solid #0a0d14;border-radius:26px 26px 0 0}'
+ '.m2-sheet h2{margin:0 0 6px;font:400 24px var(--display);color:#0a0d14;text-shadow:none}.m2-sheet h3{margin:14px 0 2px;font:600 13px var(--body);color:#7a8aa6;text-transform:uppercase;letter-spacing:.05em}'
+ '.m2-sheet a{display:flex;align-items:center;min-height:46px;border-top:2px solid #e3f0ff;color:#0a0d14;font:600 16px var(--body);text-decoration:none}.m2-sheet h3 + a{border-top:0}'
+ '.m2-sheet .m2-x{display:block;width:100%;min-height:54px;margin-top:16px;border-radius:16px;background:#fff;border:3px solid #0a0d14;box-shadow:0 4px 0 #0a0d14;font:400 19px var(--display);color:#0a0d14}'
// ---- pull to refresh on « Montages »
+ '.m2-ptr{position:fixed;left:0;right:0;top:0;height:0;z-index:69;overflow:hidden;pointer-events:none;background:radial-gradient(300px 260px at 50% 46%,#5aa0f5 0,#1f6fd6 55%,#1657b3 100%)}'
+ '.m2-ptr b{position:absolute;left:0;right:0;top:calc(8px + env(safe-area-inset-top,0px));text-align:center;font:400 18px var(--display);color:#fff;text-shadow:0 2px 0 #0a0d14}'
+ '.m2-ptr i{position:absolute;left:50%;top:0;width:112px;height:112px;margin-left:-56px;background:var(--mascot-head) center/contain no-repeat;transform-origin:50% 100%}'
+ '.m2-ptr span{position:absolute;color:#fff;font:400 14px/1 var(--body)}'
+ 'html.m2-pull .acctpage{border-top:3.5px solid #0a0d14;border-radius:26px 26px 0 0;overflow:hidden}'
// ---- the onboarding
+ '.m2-ob{position:fixed;inset:0;z-index:210;display:flex;flex-direction:column;background:var(--ice,#d6ecff);color:#0a0d14;overflow:hidden;font-family:var(--body)}'
+ '.m2-ob .m2-scene{flex:none;margin:0;height:226px}.m2-ob .m2-mound{background:var(--ice,#d6ecff);bottom:-128px}'
+ '.ob-prog{position:absolute;left:72px;right:92px;top:calc(max(14px,env(safe-area-inset-top,0px)) + 45px);height:14px;box-sizing:border-box;border-radius:8px;border:3px solid #0a0d14;background:#fff;overflow:hidden;z-index:6}'
+ '.ob-prog i{position:absolute;inset:0;background:#ffd23f;transform-origin:0 50%;transform:scaleX(0)}'
+ '.ob-skip{position:absolute;right:8px;top:calc(max(14px,env(safe-area-inset-top,0px)) + 30px);min-height:44px;padding:0 10px;background:none;border:0;color:#fff;font:700 15px var(--body);z-index:6;text-shadow:0 1px 0 rgba(10,13,20,.5)}'
+ '.ob-m{position:absolute;left:50%;bottom:4px;width:128px;height:128px;margin-left:-80px;z-index:2}.ob-m img{position:absolute;inset:0;width:100%;height:100%;opacity:0}.ob-m img.on{opacity:1}'
+ '.m2-ob .m2-bub{top:88px;left:calc(50% + 30px);font-size:15px;transform-origin:0 100%}'
+ '.ob-qs{position:relative;flex:1;min-height:0}'
+ '.ob-q{position:absolute;inset:0;overflow-y:auto;padding:14px 20px 14px;box-sizing:border-box;display:none}.ob-q.on{display:block}'
+ '.ob-q h1{margin:0;font:400 28px/1.08 var(--display);text-align:center;color:#0a0d14;text-shadow:none;text-wrap:balance}'
+ '.ob-hint{margin:6px 0 0;text-align:center;font:600 14px var(--body);color:#1f6fd6}'
+ '.ob-ops{display:flex;flex-direction:column;gap:11px;margin-top:16px}.ob-ops.grid{flex-direction:row;flex-wrap:wrap}.ob-ops.grid .ob-op{width:calc(50% - 6px)}'
+ '.ob-op{position:relative;display:flex;align-items:center;gap:11px;width:100%;min-height:56px;box-sizing:border-box;padding:6px 14px;border-radius:17px;border:3px solid #0a0d14;background:#fff;box-shadow:0 4px 0 #0a0d14;color:#0a0d14;font:700 17px/1.2 var(--body);text-align:left}'
+ '.ob-op > i{font-style:normal;font-size:22px;flex:none}.ob-op > span{flex:1;min-width:0}'
+ '.ob-op .ck{flex:none;width:24px;height:24px;box-sizing:border-box;border-radius:8px;border:2.5px solid #0a0d14;background:#fff;color:transparent;font:900 15px/19px var(--body);text-align:center}'
+ '.ob-op[aria-pressed="true"]{background:#1f6fd6;color:#fff}.ob-op[aria-pressed="true"] .ck{background:#ffd23f;color:#0a0d14}'
+ '.ob-in{display:flex;align-items:center;gap:11px;min-height:56px;box-sizing:border-box;padding:4px 14px;border-radius:17px;border:3px solid #0a0d14;background:#fff;box-shadow:inset 0 4px 0 #eaf4ff}'
+ '.ob-in > i{flex:none;width:30px;height:30px;border-radius:9px;border:2px solid #0a0d14;font:900 15px/26px var(--body);font-style:normal;text-align:center;color:#fff}'
+ '.ob-in label{flex:1;min-width:0;display:block;font:600 12px var(--body);color:#7a8aa6}.ob-in input{display:block;width:100%;min-height:26px;padding:0;border:0;outline:0;background:none;box-shadow:none;font:600 16px var(--body);color:#0a0d14;border-radius:0}'
+ '.ob-in[data-l]{flex-wrap:wrap}.ob-in.bad{border-color:#c62828}.ob-bad{flex:0 0 100%;padding:2px 0 6px 41px;font:600 13px/1.3 var(--body);font-style:normal;color:#b3261e}.ob-bad[hidden]{display:none}'
+ '.ob-other{margin-top:12px}.ob-other[hidden]{display:none}.ob-need{margin:12px 2px 0;font:600 14px/1.4 var(--body);color:#3d4a63}.ob-req{font:800 11px/1 var(--body);color:#b3261e;text-transform:uppercase;letter-spacing:.04em}.ob-req[hidden]{display:none}'
+ '.ob-lock{position:relative;margin:14px 0 6px;padding:16px;border:3px solid #0a0d14;border-radius:22px;background:#fff;box-shadow:0 5px 0 #0a0d14;overflow:hidden}.ob-fake{display:flex;align-items:flex-end;gap:8px;height:110px;filter:blur(7px)}.ob-fake i{flex:1;border-radius:8px 8px 0 0;background:#1f6fd6}.ob-fake i:nth-child(1){height:30%}.ob-fake i:nth-child(2){height:48%}.ob-fake i:nth-child(3){height:40%}.ob-fake i:nth-child(4){height:66%}.ob-fake i:nth-child(5){height:58%}.ob-fake i:nth-child(6){height:82%}.ob-fake i:nth-child(7){height:95%}'
+ '.ob-fl{margin-top:14px;filter:blur(6px)}.ob-fl b{display:block;height:12px;margin:8px 0;border-radius:6px;background:#c9dcf3}.ob-fl b:nth-child(2){width:80%}.ob-fl b:nth-child(3){width:60%}.ob-pad{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:66px;height:66px;border-radius:50%;border:3px solid #0a0d14;background:#ffd23f;box-shadow:0 4px 0 #0a0d14;display:grid;place-items:center;font-size:30px}'
+ '.ob-in.big{min-height:66px}.ob-in.big input{font:700 24px var(--body);text-align:center;min-height:44px}'
+ '.ob-in:focus-within{box-shadow:inset 0 4px 0 #eaf4ff,0 0 0 3px #1f6fd6}'
+ '.ob-in .ok{flex:none;width:24px;height:24px;border-radius:50%;background:#2ecc71;border:2px solid #0a0d14;color:#fff;font:900 14px/20px var(--body);text-align:center;transform:scale(0)}.ob-in.has .ok{transform:scale(1)}'
+ '@media (max-width:359px){.ob-ops.grid .ob-op{width:100%}.ob-q h1{font-size:25px}}'
+ '.ob-foot{flex:none;padding:8px 20px calc(18px + env(safe-area-inset-bottom,0px))}'
+ '.ob-cta{display:block;width:100%;min-height:62px;border-radius:19px;background:#1f6fd6;color:#fff;border:3.5px solid #0a0d14;box-shadow:0 6px 0 #0a0d14;font:400 23px/1 var(--display);text-shadow:0 2px 0 #0a0d14}'
+ '.ob-cta:active{transform:translateY(3px);box-shadow:0 3px 0 #0a0d14}'
+ '.ob-load{position:absolute;inset:0;z-index:8;display:none;flex-direction:column;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;background:radial-gradient(340px 340px at 50% 40%,#5aa0f5 0,#1f6fd6 55%,#1657b3 100%);color:#fff;text-align:center}'
+ '.ob-load.on{display:flex}.ob-ring{position:relative;width:190px;height:190px}.ob-ring svg{width:100%;height:100%}'
+ '.ob-ring img{position:absolute;left:50%;top:50%;width:104px;height:104px;margin:-60px 0 0 -52px;transform-origin:50% 100%}'
+ '.ob-pct{margin-top:10px;font:400 34px var(--display);text-shadow:0 3px 0 #0a0d14}.ob-lt{margin-top:2px;font:600 17px var(--body)}'
+ '.ob-lns{position:relative;width:100%;height:84px;margin-top:20px}'
+ '.ob-ln{position:absolute;left:0;right:0;top:0;display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:17px;background:#fff;color:#0a0d14;border:3px solid #0a0d14;box-shadow:0 4px 0 #0a0d14;font:600 16px/1.25 var(--body);text-align:left;opacity:0}'
+ '.ob-ln u{flex:none;font-size:22px;text-decoration:none}.ob-ln b{color:#1f6fd6}'
+ '.ob-plan{display:flex;flex-direction:column;gap:9px;margin-top:16px;padding:14px;border-radius:20px;background:#fff;border:3px solid #0a0d14;box-shadow:0 5px 0 #0a0d14}'
+ '.ob-plan div{display:flex;align-items:flex-start;gap:10px;font:600 16px/1.3 var(--body)}.ob-plan u{flex:none;width:22px;height:22px;border-radius:50%;background:#1f6fd6;color:#fff;font:900 13px/22px var(--body);text-align:center;text-decoration:none}'
+ '}';
var st = el('style'); st.textContent = CSS; D.head.appendChild(st);

function flakes(host, n, seed, h){ var s = seed; function R(){ return (s = s * 16807 % 2147483647) / 2147483647; }
  for (var i = 0; i < n; i++){ var f = el('div', 'm2-fl'), z = 3 + R() * 6; f.style.cssText = 'left:' + (R() * 100) + '%;top:' + (8 + R() * (h - 30)) + 'px;width:' + z + 'px;height:' + z + 'px;opacity:' + (0.3 + R() * 0.5); host.appendChild(f); } }
var ICE = '<svg class="m2-ice" viewBox="0 0 390 96" aria-hidden="true" focusable="false"><path d="M-5 -5H395V50H340Q334 70 328 82Q321 68 316 50H250Q244 74 238 88Q231 72 226 50H150Q144 68 138 78Q131 66 126 50H70Q64 74 58 90Q51 72 46 50H-5Z" fill="#fff" stroke="#0a0d14" stroke-width="5" stroke-linejoin="round"/></svg>';
function scene(extra, seed){ var s = el('div', 'm2-scene', '<div class="m2-rays"></div>' + ICE + '<div class="m2-mound"></div>' + (extra || '')); s.setAttribute('aria-hidden', 'false'); flakes(s, 22, seed || 9, 190); return s; }
var CHEV = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 5l7 7-7 7"/></svg>';

/* ---- 1. the sign-in --------------------------------------------------------------------------------------------------- */
var lgScene, lgT, lgS, lgBub, e1 = true, lgKey = '';
function lgBuild(){
  var v = $('#apLogin'); if (!v || lgScene) return;
  lgScene = scene('<div class="m2-masc"></div><div class="m2-bub"></div>', 9); lgBub = $('.m2-bub', lgScene);
  lgT = el('h2', 'm2-lt'); lgT.setAttribute('aria-hidden', 'true'); lgS = el('p', 'm2-ls');
  v.insertBefore(lgS, v.firstChild); v.insertBefore(lgT, v.firstChild); v.insertBefore(lgScene, v.firstChild);
  // « Continuer »: the e-mail first, then the rest of the same form
  ['#apInF', '#apUpF'].forEach(function(id){ var f = $(id); if (!f) return;
    var b = el('button', 'm2-cont', '<span></span><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'); b.type = 'button';
    var first = $('.ap-field', f); first.parentNode.insertBefore(b, first.nextSibling);
    b.addEventListener('click', function(){ lgNext(f); });
  });
  v.addEventListener('submit', function(ev){ var f = ev.target; if (!lgE1() || !f || (f.id !== 'apInF' && f.id !== 'apUpF')) return; ev.preventDefault(); ev.stopImmediatePropagation(); lgNext(f); }, true);
}
function lgE1(){ return root.classList.contains('m2-login') && $('#apStepForm').classList.contains('m2-e1'); }
function lgNext(f){
  var mail = $('input[type=email]', f); if (!mail) return;
  if (!mail.value.trim() || !mail.checkValidity()){ try { mail.reportValidity(); } catch(e){} mail.focus(); return; }
  e1 = false; $('#apStepForm').classList.remove('m2-e1');
  var rest = $$('.ap-field ~ .ap-field, .ap-go, .ap-note, .ap-uplegal', f).filter(function(x){ return x.parentNode === f; });
  play(function(g){ return g.fromTo(rest, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power3.out', stagger: 0.05, clearProps: 'opacity,transform' }); });
  var pw = $('input[type=password]', f); if (pw) try { pw.focus({ preventScroll: true }); pw.scrollIntoView({ block: 'center', behavior: M.calm() ? 'auto' : 'smooth' }); } catch(e){}
}
function lgRender(on, fresh){
  root.classList.toggle('m2-login', on); if (!on) return;
  lgBuild();
  var step = M.step(), mode = M.mode(), k = step === 'form' ? mode : step;
  if (fresh) e1 = true;
  var hasPw = $$('#apInPw, #apUpPw').some(function(i){ return i.value; });
  $('#apStepForm').classList.toggle('m2-e1', e1 && step === 'form' && !hasPw);
  var key = k + '|' + M.lang();
  var title = k === 'in' ? 'lg.in' : k === 'up' ? 'lg.up' : k === 'code' ? 'lg.code' : k === 'newpw' ? 'lg.newpw' : 'lg.forgot';
  var bub = k === 'in' ? 'lg.bIn' : k === 'up' ? 'lg.bUp' : k === 'code' ? 'lg.bCode' : 'lg.bPw';
  $$('#apInMail, #apUpMail, #apFgMail').forEach(function(i){ i.placeholder = t('lg.mailPh'); });
  $$('.m2-cont span').forEach(function(s){ s.textContent = t('lg.cont'); });
  $('.ap-noacct').classList.toggle('m2-off', step !== 'form' || k === 'in'); lgS.hidden = !(k === 'in' && step === 'form'); lgS.textContent = t('lg.inS');
  $('#apBack').setAttribute('aria-label', t('lg.close'));
  if (key === lgKey) return;
  var was = lgKey; lgKey = key; lgT.innerHTML = t(title); lgBub.textContent = t(bub);
  play(function(g){ var tl = g.timeline();
    if (!was || fresh) tl.fromTo($('.m2-masc', lgScene), { y: 60, scaleY: 0.8 }, { y: 0, scaleY: 1, duration: 0.5, ease: 'back.out(2)', transformOrigin: '50% 100%', clearProps: 'transform' }, 0.05);
    tl.fromTo(lgBub, { opacity: 0, scale: 0.4, rotation: -8 }, { opacity: 1, scale: 1, rotation: 5, duration: 0.4, ease: 'back.out(2.5)', transformOrigin: '0 100%' }, was && !fresh ? 0 : 0.3);
    tl.fromTo(lgT, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.32, ease: 'power3.out', clearProps: 'opacity,transform' }, was && !fresh ? 0 : 0.12);
    return tl; });
}

/* ---- 2. the profile ---------------------------------------------------------------------------------------------------- */
var pf, legal;
function ico(d){ return '<u><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + d + '</svg></u>'; }
function pfBuild(){
  var v = $('#apAccount'); if (!v || pf) return;
  pf = el('div', 'm2-pf');
  var sc = scene('<div class="m2-av" id="m2Av"></div>', 17);
  var back = el('button', 'm2-round', '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M15 5l-7 7 7 7"/></svg>'); back.type = 'button'; back.id = 'm2Back';
  var gear = el('button', 'm2-round r', '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.500v3M2.500 12h3M18.500 12h3M5.300 5.300l2.100 2.100M16.600 16.600l2.100 2.100M5.300 18.700l2.100-2.100M16.600 7.400l2.100-2.100"/></svg>'); gear.type = 'button'; gear.id = 'm2Gear';
  sc.appendChild(back); sc.appendChild(gear); pf.appendChild(sc);
  pf.appendChild(el('div', 'm2-who', '<div class="m2-name"><span id="m2Name"></span><span class="m2-badge" id="m2Badge" hidden></span></div><p class="m2-mail" id="m2Mail"></p>'));
  pf.appendChild(el('div', 'm2-cards', '<button type="button" class="m2-card" id="m2Plan"><small></small><b></b><em id="m2PlanT" hidden></em><i></i></button><button type="button" class="m2-card" id="m2Tt"><small>TikTok</small><b></b><i></i></button>'));
  var lang = '<span class="langsw" role="group" aria-label="Langue · Language"><button type="button" data-lang="fr" lang="fr" aria-pressed="false">FR</button><button type="button" data-lang="en" lang="en" aria-pressed="false">EN</button></span>';
  pf.appendChild(el('div', 'm2-list',
    '<button type="button" class="m2-row" id="m2Gal">' + ico('<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 9.500v5l4.500-2.500z"/>') + '<span></span><em></em>' + CHEV + '</button>'
    + '<div class="m2-row" id="m2Lang">' + ico('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.800 3 2.800 15 0 18M12 3c-2.800 3-2.800 15 0 18"/>') + '<span></span>' + lang + '</div>'
    + '<button type="button" class="m2-row" id="m2Help">' + ico('<path d="M12 3l8 4.500v9L12 21l-8-4.500v-9z"/><path d="M4 7.500l8 4.500 8-4.500M12 12v9"/>') + '<span></span>' + CHEV + '</button>'
    + '<button type="button" class="m2-row" id="m2Acct">' + ico('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.400 3.600-7 8-7s8 2.600 8 7"/>') + '<span></span>' + CHEV + '</button>'
    + '<button type="button" class="m2-row" id="m2Legal">' + ico('<rect x="5" y="11" width="14" height="10" rx="2.500"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>') + '<span></span>' + CHEV + '</button>'));
  var out = el('button', 'm2-out'); out.type = 'button'; out.id = 'm2Out'; pf.appendChild(out);
  v.insertBefore(pf, v.firstChild);
  back.onclick = function(){ M.hide(); };
  gear.onclick = function(){ setOn(true); }; $('#m2Acct', pf).onclick = function(){ setOn(true); };
  $('#m2Plan', pf).onclick = function(){ var b = $('#apSubGo'); if (M.paid() && b && b.textContent.trim()) b.click(); else M.go('pro', { from: 'account' }); };
  $('#m2Tt', pf).onclick = function(){ var c = $('#ttkCard'); var b = c && ($('#ttkStats', c) || $('button', c)); if (b) b.click(); };
  $('#m2Gal', pf).onclick = function(){ M.go('gallery'); };
  $('#m2Help', pf).onclick = function(){ var h = $('#helpBtn'); if (h) h.click(); };
  $('#m2Legal', pf).onclick = legalOpen;
  out.onclick = function(){ var b = $('#apOut'); if (b) b.click(); };
  // « Retour » inside the settings comes back to the profile
  $('#apBack').addEventListener('click', function(ev){ if (root.classList.contains('m2-set') && root.classList.contains('m2-prof')){ ev.preventDefault(); ev.stopImmediatePropagation(); setOn(false); } }, true);
  // the account's cards can arrive after the profile (TikTok answers late): the profile follows them
  if (W.MutationObserver){ var due = 0; new MutationObserver(function(ms){
    if (due || !root.classList.contains('m2-prof')) return;
    for (var i = 0; i < ms.length; i++) if (!pf.contains(ms[i].target)){ due = setTimeout(function(){ due = 0; if (root.classList.contains('m2-prof')) pfRender(true, false); }, 60); return; }
  }).observe($('#apAccount'), { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['hidden'] }); }
}
function setOn(on){
  root.classList.toggle('m2-set', on); var page = $('#acctPage'); if (page) page.scrollTop = 0;
  var what = on ? $$('#apAccount > :not(.m2-pf)') : [pf];
  play(function(g){ return g.fromTo(what, { opacity: 0, x: on ? 26 : -26 }, { opacity: 1, x: 0, duration: 0.28, ease: 'power3.out', stagger: on ? 0.03 : 0, clearProps: 'opacity,transform' }); });
  try { (on ? $('#apAccT') : $('#m2Gear')).focus({ preventScroll: true }); } catch(e){}
}
function pfRender(on, fresh){
  root.classList.toggle('m2-prof', on); if (!on){ root.classList.remove('m2-set'); return; }
  pfBuild(); if (fresh) root.classList.remove('m2-set');
  var u = M.acct.state.user; if (!u) return;
  var av = $('#m2Av'), url = u.avatarUrl || '';
  av.classList.toggle('has', !!url); av.style.backgroundImage = url ? 'url("' + String(url).replace(/["\\\n]/g, '') + '")' : '';
  $('#m2Name').textContent = M.name(u); $('#m2Mail').textContent = u.email || '';
  var badge = $('#m2Badge'); badge.hidden = !M.paid(); if (M.paid()) badge.textContent = M.t('pl.n.' + M.plan()).replace(/^Stalak\s+/i, '');
  var p = $('#m2Plan'), sub = $('#apSubGo'); $('small', p).textContent = t('pf.plan'); $('b', p).textContent = M.paid() ? M.t('pl.n.' + M.plan()) : t('pf.free');
  $('i', p).textContent = ((M.paid() && sub && sub.textContent.trim()) || t('pf.plans')) + ' →';
  // what the account says about the subscription (renewal, trial and first charge, cancellation) stays written in full
  var st2 = $('#apSubT'), line = M.paid() && st2 ? st2.textContent.trim() : '', pt = $('#m2PlanT'); pt.hidden = !line; pt.textContent = line; p.classList.toggle('wide', !!line);
  var tt = $('#m2Tt'), card = $('#ttkCard'); if (card && card.hidden) card = null;
  var linked = !!(card && $('#ttkUnlink', card)), nm = card && $('b', card);
  tt.hidden = !card; tt.parentNode.classList.toggle('one', !card);
  if (card){ $('b', tt).textContent = linked && nm ? nm.textContent : t('pf.ttNo'); $('i', tt).textContent = (linked ? t('pf.ttStats') : t('pf.ttLink')) + ' →'; }
  var cl = M.cloud(), n = cl && cl.list ? cl.list.length : null;
  $('#m2Gal span').textContent = t('pf.gal'); $('#m2Gal em').textContent = n ? String(n) : '';
  $('#m2Lang span').textContent = t('pf.lang'); $('#m2Help span').textContent = t('pf.help'); $('#m2Acct span').textContent = t('pf.acct'); $('#m2Legal span').textContent = t('pf.legal');
  $('#m2Out').textContent = t('pf.out'); $('#m2Gear').setAttribute('aria-label', t('pf.set')); $('#m2Back').setAttribute('aria-label', t('pf.back'));
  $$('.langsw button', pf).forEach(function(b){ b.setAttribute('aria-pressed', String(b.dataset.lang === M.lang())); });
  if (fresh) play(function(g){ var tl = g.timeline();
    tl.fromTo('#m2Av', { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(2)', clearProps: 'transform,opacity' }, 0)
      .fromTo(['.m2-who', '.m2-cards', '.m2-list', '#m2Out'], { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.32, ease: 'power3.out', stagger: 0.06, clearProps: 'opacity,transform' }, 0.08);
    return tl; });
}
// the links of the site's footer (legal pages, pricing, guides), which a phone no longer shows under the home screen
function legalOpen(){
  if (legal) return;
  var foot = $('#siteFoot') || $('footer.ft'), html = '<h2>' + esc(t('lgl.t')) + '</h2>';
  if (foot) $$('.ft-col', foot).forEach(function(c){ var h = $('h2, h3, .ft-h', c), as = $$('a[href]', c).filter(function(a){ return !a.closest('.langsw') && !a.closest('.ft-social'); }); if (!as.length || !h || !h.textContent.trim()) return;
    html += '<h3>' + esc(h ? h.textContent.trim() : '') + '</h3>' + as.map(function(a){ return '<a href="' + esc(a.getAttribute('href')) + '"' + (/^https?:/.test(a.getAttribute('href')) ? ' target="_blank" rel="noopener"' : '') + '>' + esc(a.textContent.trim()) + '</a>'; }).join(''); });
  html += '<button type="button" class="m2-x">' + esc(t('lgl.x')) + '</button>';
  legal = el('div', 'm2-sheet', '<div role="dialog" aria-modal="true" aria-label="' + esc(t('lgl.t')) + '">' + html + '</div>'); D.body.appendChild(legal);
  var box = legal.firstChild, last = D.activeElement;
  function close(){ if (!legal) return; var l = legal; legal = null; D.removeEventListener('keydown', key, true);
    var done = function(){ l.remove(); try { last && last.focus(); } catch(e){} };
    if (!play(function(g){ return g.timeline({ onComplete: done }).to(box, { yPercent: 100, duration: 0.24, ease: 'power2.in' }, 0).to(l, { backgroundColor: 'rgba(10,13,20,0)', duration: 0.24 }, 0); })) done(); }
  function key(ev){ if (ev.key === 'Escape'){ ev.stopPropagation(); close(); } }
  D.addEventListener('keydown', key, true);
  legal.addEventListener('click', function(ev){ if (ev.target === legal || ev.target.closest('.m2-x')) close(); });
  play(function(g){ return g.timeline().fromTo(legal, { backgroundColor: 'rgba(10,13,20,0)' }, { backgroundColor: 'rgba(10,13,20,.45)', duration: 0.25 }, 0).fromTo(box, { yPercent: 100 }, { yPercent: 0, duration: 0.36, ease: 'power3.out' }, 0); });
  try { $('.m2-x', legal).focus({ preventScroll: true }); } catch(e){}
}

/* ---- 3. pull to refresh on « Montages » -------------------------------------------------------------------------------- */
var ptr, ptrOn = false, ptrBusy = false, ptrY0 = null, ptrD = 0, PTR_GO = 118, PTR_MAX = 180;
function ptrBuild(){
  if (ptr) return; ptr = el('div', 'm2-ptr', '<b></b><i></i>'); ptr.setAttribute('aria-hidden', 'true');
  var s = 31; function R(){ return (s = s * 16807 % 2147483647) / 2147483647; }
  for (var i = 0; i < 14; i++){ var f = el('span'); f.textContent = '❄'; f.style.cssText = 'left:' + (R() * 96) + '%;top:' + (R() * 130) + 'px;font-size:' + (10 + R() * 14) + 'px;opacity:' + (0.45 + R() * 0.5); ptr.appendChild(f); }
  D.body.appendChild(ptr);
  var page = $('#acctPage');
  page.addEventListener('touchstart', function(ev){ ptrY0 = ptrOn && !ptrBusy && page.scrollTop <= 0 && ev.touches.length === 1 ? ev.touches[0].clientY : null; ptrD = 0; }, { passive: true });
  page.addEventListener('touchmove', function(ev){ if (ptrY0 == null) return; var d = ev.touches[0].clientY - ptrY0;
    if (d <= 0 || page.scrollTop > 0){ if (ptrD){ ptrD = 0; ptrSet(0); } return; }
    if (ev.cancelable) ev.preventDefault(); ptrD = Math.min(PTR_MAX, d * 0.55); ptrSet(ptrD); }, { passive: false });
  var end = function(){ if (ptrY0 == null) return; ptrY0 = null; if (ptrD >= PTR_GO) ptrRun(); else ptrBackTo(0); };
  page.addEventListener('touchend', end); page.addEventListener('touchcancel', end);
}
function ptrSet(d){
  var page = $('#acctPage'); root.classList.toggle('m2-pull', d > 0);
  page.style.transform = d ? 'translateY(' + d + 'px)' : ''; ptr.style.height = d ? (d + 30) + 'px' : '0';
  $('b', ptr).textContent = d >= PTR_GO ? t('ptr.go') : t('ptr.pull');
  // the hood shows behind the page, and pops up at the threshold
  $('i', ptr).style.transform = 'translateY(' + (d >= PTR_GO ? d - 80 : d - 40) + 'px)';
}
function ptrBackTo(to, then){
  var page = $('#acctPage'), o = { d: ptrD };
  var fin = function(){ ptrD = to; ptrSet(to); if (then) then(); };
  if (!play(function(g){ return g.to(o, { d: to, duration: to ? 0.45 : 0.4, ease: to ? 'elastic.out(1,0.5)' : 'back.out(1.3)', onUpdate: function(){ ptrD = o.d; ptrSet(Math.max(0, o.d)); }, onComplete: fin }); })) fin();
}
function ptrRun(){
  ptrBusy = true; var head = $('i', ptr), t0 = Date.now();
  var load = Promise.resolve().then(function(){ return M.reload(); }).catch(function(){});
  ptrBackTo(PTR_GO - 8, function(){
    // she looks left and right while the list is asked again, then dives back
    var look = play(function(g){ return g.timeline().to(head, { rotation: -9, duration: 0.28, ease: 'power2.inOut' }).to(head, { rotation: 8, duration: 0.4, ease: 'power2.inOut' }).to(head, { rotation: 0, duration: 0.25, ease: 'power2.out' }); });
    var wait = new Promise(function(r){ setTimeout(r, look ? 950 : 250); });
    Promise.all([load, wait]).then(function(){
      $('b', ptr).textContent = t('ptr.done');
      var done = function(){ ptrBackTo(0, function(){ ptrBusy = false; head.style.transform = ''; var tiles = $$('#clList .gal-item');
        if (tiles.length) play(function(g){ return g.fromTo(tiles.slice(0, 8), { opacity: 0, y: 16, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.32, ease: 'back.out(1.6)', stagger: 0.04, clearProps: 'opacity,transform' }); }); }); };
      if (!play(function(g){ return g.timeline({ onComplete: done }).to(head, { scaleX: 1.1, scaleY: 0.86, duration: 0.1 }).to(head, { y: '+=70', scaleX: 1, scaleY: 1, duration: 0.26, ease: 'power2.in' }); })) done();
    });
  });
}

/* ---- 4. the onboarding --------------------------------------------------------------------------------------------------- */
var OB_KEY = 'stalak:onb', ob = null;
var POSE = ['hello', 'hype', 'cool', 'love', 'focus', 'think', 'focus', 'hype', 'hype', 'gg'];
var QS = [
  { id: 'artistName', kind: 'text' },
  { id: 'genres', kind: 'multi', grid: true, ops: [['rap', '🎤', 'ob.g.rap'], ['drill', '🔥', 'ob.g.drill'], ['chant', '🎶', 'ob.g.chant'], ['autre', '✨', 'ob.g.autre']] },
  { id: 'onPlatforms', kind: 'one', ops: [['oui', '✅', 'ob.p.oui'], ['non', '⏳', 'ob.p.non']] },
  { id: 'links', kind: 'links' },
  { id: 'listenersNow', kind: 'one', hint: 'ob.q4h', only: function(a){ return a.onPlatforms === 'oui' && !(a.links && a.links.spotify); }, ops: [['lt100', '🌱', 'ob.l.a'], ['100_1k', '🔥', 'ob.l.b'], ['1k_10k', '🚀', 'ob.l.c'], ['gt10k', '👑', 'ob.l.d']] },
  { id: 'postsOn', kind: 'multi', ops: [['tiktok', '📱', 'ob.s.tiktok'], ['reels', '📸', 'ob.s.reels'], ['shorts', '▶️', 'ob.s.shorts']] },
  { id: 'blockers', kind: 'multi', ops: [['few_views', '👀', 'ob.b.vues'], ['editing_time', '⏳', 'ob.b.temps'], ['no_ideas', '🤷', 'ob.b.idees']] },
  { id: 'listenersGoal', kind: 'one', ops: [['1k', '🌱', 'ob.t.a'], ['10k', '🔥', 'ob.t.b'], ['100k', '🚀', 'ob.t.c'], ['1m', '👑', 'ob.t.d']] },
  { id: 'goals', kind: 'multi', ops: [['song_launch', '💿', 'ob.o.son'], ['post_more', '📅', 'ob.o.poster'], ['fill_concerts', '🎤', 'ob.o.concerts']] }
];
// the sites Comptes accepts for each link (functions/_lib/artist.js); « @name » for Instagram
// (24/11, « Stats ») TikTok for everyone and Spotify when the music is out are needed for the analysis; YouTube added
var LINKS = [['tiktok', 'TikTok', '#0a0d14', '♪', '@…', ['tiktok.com', 'www.tiktok.com', 'vm.tiktok.com', 'm.tiktok.com']],
  ['spotify', 'Spotify', '#1db954', '♫', 'open.spotify.com/artist/…', ['open.spotify.com', 'spotify.link']], ['appleMusic', 'Apple Music', '#fa2d48', '', 'music.apple.com/…', ['music.apple.com']],
  ['soundcloud', 'SoundCloud', '#ff5500', '☁', 'soundcloud.com/…', ['soundcloud.com', 'm.soundcloud.com', 'on.soundcloud.com']], ['youtube', 'YouTube', '#ff0000', '▶', 'youtube.com/@…', ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'music.youtube.com']],
  ['instagram', 'Instagram', 'linear-gradient(45deg,#f9a12e,#e1306c,#833ab4)', '@', '@…', ['instagram.com', 'www.instagram.com']]];
function linkNeed(kind, a){ return kind === 'tiktok' || (kind === 'spotify' && a.onPlatforms === 'oui'); }
function linkOk(kind, v){
  v = String(v || '').trim(); if (!v) return true;
  var l = LINKS.filter(function(x){ return x[0] === kind; })[0]; if (!l) return false;
  if (kind === 'instagram' && /^@?[A-Za-z0-9._]{1,30}$/.test(v)) return true;
  if ((kind === 'tiktok' || kind === 'youtube') && /^@[A-Za-z0-9._-]{1,40}$/.test(v)) return true;
  if (!/^https?:\/\//i.test(v)) v = 'https://' + v;
  try { var u = new URL(v); return l[5].indexOf(u.hostname.toLowerCase()) >= 0 && !u.username && !u.password; } catch(e){ return false; }
}
function obState(){ try { return JSON.parse(store.get(OB_KEY) || 'null'); } catch(e){ return null; } }
function obSave(st){ store.set(OB_KEY, JSON.stringify(st)); obSend(); }
// the answers go to the account (Comptes: StalakAccount.saveArtist, PUT /api/artist) as soon as the person is signed in, and at
// sign-in when the answers came first. Only what was answered is sent, so a question that was passed never erases an answer.
function obWire(a){
  var o = {}, k;
  if (a.artistName) o.artistName = a.artistName;
  if (a.genres && a.genres.indexOf('autre') >= 0 && a.genreOther) o.genreOther = a.genreOther;
  ['genres', 'postsOn', 'blockers', 'goals'].forEach(function(k){ if (a[k] && a[k].length) o[k] = a[k].slice(); });
  if (a.onPlatforms) o.onPlatforms = a.onPlatforms === 'oui';
  if (a.listenersNow) o.listenersNow = a.listenersNow; if (a.listenersGoal) o.listenersGoal = a.listenersGoal;
  var L = {}; for (k in (a.links || {})) if (a.links[k] && linkOk(k, a.links[k])) L[k] = a.links[k]; if (Object.keys(L).length) o.links = L;
  return o;
}
var obBusy = false;
function obSend(){
  var st = obState(), A = M.acct, u = A && A.state.user;
  if (obBusy || !st || !(st.done || st.skipped) || st.sent || !st.a || !u || typeof A.saveArtist !== 'function') return;
  var o = obWire(st.a), mark = function(){ var s = obState(); if (s){ s.sent = Date.now(); store.set(OB_KEY, JSON.stringify(s)); } };
  if (!Object.keys(o).length){ mark(); return; }
  obBusy = true;
  var put = function(x){ return Promise.resolve(A.saveArtist(x)); };
  try { put(o).catch(function(e){ if (e && e.code === 'bad_link' && o.links){ delete o.links; return put(o); } throw e; })
    .then(mark).catch(function(){}).then(function(){ obBusy = false; }); } catch(e){ obBusy = false; }
}
function labels(q, vals){ var q2 = QS.filter(function(x){ return x.id === q; })[0]; return (vals || []).map(function(v){ var o = q2.ops.filter(function(o){ return o[0] === v; })[0]; return o ? t(o[2]) : v; }); }
function obBubble(i, a){
  var g = labels('genres', a.genres), p = labels('postsOn', a.postsOn);
  switch (i){ case 0: return t('ob.b0'); case 1: return a.artistName ? t('ob.b1', { name: a.artistName }) : t('ob.b1n'); case 2: return g.length ? t('ob.b2', { list: list(g) }) : t('ob.b2n');
    case 3: return a.onPlatforms === 'oui' ? t('ob.b3') : t('ob.b3n'); case 4: return t('ob.b4'); case 5: return a.onPlatforms === 'oui' ? t('ob.b5') : t('ob.b3n');
    case 6: return p.length ? t('ob.b6', { list: list(p) }) : t('ob.b6n'); case 7: return t('ob.b7'); case 8: return t('ob.b8'); default: return t('ob.b9'); } }
// the lines of the loading screen and of the plan: only what the person answered, or what Stalak really does
function obLines(a){
  var g = labels('genres', a.genres), p = labels('postsOn', a.postsOn), to = labels('listenersGoal', [a.listenersGoal])[0], L = [];
  if (a.links && a.links.tiktok) L.push(['📱', esc(t('ob.st.tt')), 2.6]);
  if (g.length) L.push(['🔥', t('ob.st.style', { list: esc(list(low(g))) }), 0.9]);
  if (a.links && a.links.spotify) L.push(['🎧', esc(t('ob.st.sp')), 2.3]);
  if (a.listenersGoal) L.push(['🎯', t('ob.st.goal', { v: esc(to) }), 0.8]);
  if (p.length) L.push(['✂️', esc(t('ob.st.posts', { list: list(p) })), 0.9]);
  L.push(['📝', esc(t('ob.st.end')), 1.2]);
  // about 9 s in all, whatever was answered: the slow steps take the rest
  var tot = L.reduce(function(x, l){ return x + l[2]; }, 0), slow = L.filter(function(l){ return l[2] > 1.5; });
  if (!slow.length) slow = [L[L.length - 1]];
  slow.forEach(function(l){ l[2] += (9 - tot) / slow.length; }); L.forEach(function(l){ l[2] = Math.max(0.6, l[2]); });
  return L; }
function obPlan(a){
  var g = labels('genres', a.genres), p = labels('postsOn', a.postsOn), go = labels('goals', a.goals), P = [], now = labels('listenersNow', [a.listenersNow])[0], to = labels('listenersGoal', [a.listenersGoal])[0];
  if (g.length && p.length) P.push(t('ob.pl.who', { genres: list(low(g)), posts: list(p) })); else if (g.length) P.push(t('ob.pl.whoG', { genres: list(low(g)) })); else if (p.length) P.push(t('ob.pl.whoP', { posts: list(p) }));
  if (a.listenersGoal && a.listenersNow) P.push(t('ob.pl.path', { from: t('ob.f.' + a.listenersNow), to: to })); else if (a.listenersGoal) P.push(t('ob.pl.to', { to: to }));
  P.push(t('ob.pl.week')); P.push(t('ob.pl.stats'));
  P.push(t('ob.pl.first')); return P; }

function obOpen(opts){
  if (ob) return; opts = opts || {};
  var a = { artistName: '', genres: [], genreOther: '', onPlatforms: '', links: {}, listenersNow: '', postsOn: [], blockers: [], listenersGoal: '', goals: [] };
  var u = M.acct && M.acct.state.user; if (u && u.displayName) a.artistName = u.displayName;
  var kept = obState(); if (kept && kept.a) for (var kk in a) if (kept.a[kk] != null && kept.a[kk] !== '') a[kk] = kept.a[kk];
  if (!a.links || typeof a.links !== 'object') a.links = {};
  var box = el('div', 'm2-ob'); box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.id = 'm2Onb';
  var sc = scene('<div class="ob-m">' + POSE.filter(function(p, i){ return POSE.indexOf(p) === i; }).map(function(p){ return '<img alt="" data-p="' + p + '" src="/emoji/' + p + '.webp">'; }).join('') + '</div><div class="m2-bub" aria-live="polite"></div>', 3);
  var back = el('button', 'm2-round', '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M15 5l-7 7 7 7"/></svg>'); back.type = 'button'; back.setAttribute('aria-label', t('ob.back'));
  var prog = el('div', 'ob-prog', '<i></i>'), skip = el('button', 'ob-skip'); skip.type = 'button'; skip.textContent = t('ob.skip');
  sc.appendChild(back); sc.appendChild(prog); sc.appendChild(skip); box.appendChild(sc);
  var qs = el('div', 'ob-qs'); box.appendChild(qs);
  var foot = el('div', 'ob-foot'), cta = el('button', 'ob-cta'); cta.type = 'button'; foot.appendChild(cta); box.appendChild(foot);
  var load = el('div', 'ob-load', '<div class="ob-ring"><svg viewBox="0 0 500 500" aria-hidden="true"><circle cx="250" cy="250" r="220" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="34"/><circle class="arc" cx="250" cy="250" r="220" fill="none" stroke="#ffd23f" stroke-width="34" stroke-linecap="round" transform="rotate(-90 250 250)" stroke-dasharray="1382.3" stroke-dashoffset="1382.3"/></svg><img alt="" src="/emoji/think.webp"></div><div class="ob-pct">0 %</div><div class="ob-lt"></div><div class="ob-lns"></div>');
  box.appendChild(load);
  // the questions
  QS.forEach(function(q, i){
    var s = el('section', 'ob-q'); s.dataset.i = i; var h = '<h1 id="obT' + i + '">' + esc(t('ob.q' + i)) + '</h1>';
    if (q.kind === 'multi') h += '<p class="ob-hint">' + esc(t('ob.multi')) + '</p>'; else if (q.hint) h += '<p class="ob-hint">' + esc(t(q.hint)) + '</p>'; else if (q.kind === 'links') h += '<p class="ob-hint">' + esc(t('ob.q3h')) + '</p>';
    if (q.kind === 'text') h += '<div class="ob-ops"><div class="ob-in big"><label style="position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)" for="obName">' + esc(t('ob.q0')) + '</label><input id="obName" type="text" maxlength="30" autocomplete="nickname" autocapitalize="words" spellcheck="false" enterkeyhint="next" placeholder="' + esc(t('ob.q0ph')) + '"></div></div>';
    else if (q.kind === 'links') h += '<div class="ob-ops">' + LINKS.map(function(l){ return '<div class="ob-in" data-l="' + l[0] + '"><i style="background:' + l[2] + '">' + l[3] + '</i><label>' + l[1] + ' <b class="ob-req" hidden></b><input type="text" inputmode="url" autocapitalize="off" autocomplete="off" spellcheck="false" maxlength="200" placeholder="' + esc(l[4]) + '"></label><span class="ok" aria-hidden="true">✓</span><em class="ob-bad" role="alert" hidden></em></div>'; }).join('') + '</div>';
    else h += '<div class="ob-ops' + (q.grid ? ' grid' : '') + '" role="group" aria-labelledby="obT' + i + '">' + q.ops.map(function(o){ return '<button type="button" class="ob-op" data-v="' + o[0] + '" aria-pressed="false"><i aria-hidden="true">' + o[1] + '</i><span>' + esc(t(o[2])) + '</span>' + (q.kind === 'multi' ? '<span class="ck" aria-hidden="true">✓</span>' : '') + '</button>'; }).join('') + '</div>';
    // (24/11) « Autre »: a free field, « Dis-nous ce que tu fais »
    if (q.id === 'genres') h += '<div class="ob-in ob-other" hidden><label style="position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)" for="obOther">' + esc(t('ob.other')) + '</label><input id="obOther" type="text" maxlength="60" autocomplete="off" placeholder="' + esc(t('ob.other')) + '"></div>';
    if (q.kind === 'links') h += '<p class="ob-need">' + esc(t('ob.need')) + '</p>';
    s.innerHTML = h; qs.appendChild(s);
  });
  var planS = el('section', 'ob-q'); planS.dataset.i = 9; qs.appendChild(planS);
  D.body.appendChild(box); root.classList.add('m2-onb');
  var cur = -1, bub = $('.m2-bub', box), bar = $('i', prog), last = D.activeElement, busy = false;
  ob = { box: box };
  var nameIn = $('#obName', box); nameIn.value = a.artistName;
  // the answers already given are shown as chosen (the questionnaire opened again from « Stats »)
  QS.forEach(function(q, i){ var sec = $('.ob-q[data-i="' + i + '"]', box); if (!q.ops) return; $$('.ob-op', sec).forEach(function(b){ var v = a[q.id]; b.setAttribute('aria-pressed', String(Array.isArray(v) ? v.indexOf(b.dataset.v) >= 0 : v === b.dataset.v)); }); });
  $$('.ob-in[data-l]', box).forEach(function(w){ var v = a.links[w.dataset.l]; if (v){ $('input', w).value = v; w.classList.toggle('has', linkOk(w.dataset.l, v)); } });
  var oth = $('#obOther', box); if (oth){ oth.value = a.genreOther || ''; $('.ob-other', box).hidden = a.genres.indexOf('autre') < 0; }
  function steps(){ return QS.map(function(q, i){ return i; }).filter(function(i){ return !QS[i].only || QS[i].only(a); }); }
  function pose(i){ var p = POSE[i]; $$('.ob-m img', box).forEach(function(im){ im.classList.toggle('on', im.dataset.p === p); });
    play(function(g){ return g.fromTo($('.ob-m', box), { scaleX: 1.15, scaleY: 0.85, y: 8 }, { scaleX: 1, scaleY: 1, y: 0, duration: 0.5, ease: 'elastic.out(1,0.4)', transformOrigin: '50% 100%', clearProps: 'transform' }); }); }
  function say(i){ bub.textContent = obBubble(i, a); play(function(g){ return g.fromTo(bub, { opacity: 0, scale: 0.4, rotation: -8 }, { opacity: 1, scale: 1, rotation: 4, duration: 0.4, ease: 'back.out(2.5)' }); }); }
  function show(i, dir){
    var from = $('.ob-q.on', box), to = $('.ob-q[data-i="' + i + '"]', box), st = steps(), pos = i === 9 ? st.length : st.indexOf(i);
    if (QS[i] && QS[i].kind === 'links') $$('.ob-in[data-l]', to).forEach(function(w){ var r = $('.ob-req', w); r.hidden = !linkNeed(w.dataset.l, a); r.textContent = t('ob.req'); });
    cur = i; back.hidden = i === 0 || i === 9; skip.hidden = i === 9; cta.textContent = t(i === 9 ? 'ob.go' : 'ob.next');
    var frac = pos / st.length;
    if (!play(function(g){ return g.to(bar, { scaleX: frac, duration: 0.5, ease: 'back.out(1.6)' }); })) bar.style.transform = 'scaleX(' + frac + ')';
    pose(i); say(i);
    var W2 = box.clientWidth, items = $$('.ob-op, .ob-in, .ob-plan > div', to);
    to.classList.add('on'); to.scrollTop = 0;
    var tl = play(function(g){ var tl = g.timeline();
      if (from && from !== to) tl.to(from, { x: -dir * W2, filter: 'blur(6px)', duration: 0.26, ease: 'power3.in', onComplete: function(){ from.classList.remove('on'); g.set(from, { clearProps: 'transform,filter' }); } }, 0);
      tl.fromTo(to, { x: from ? dir * W2 : 0, filter: from ? 'blur(6px)' : 'blur(0px)' }, { x: 0, filter: 'blur(0px)', duration: 0.38, ease: 'power4.out', clearProps: 'transform,filter' }, from ? 0.14 : 0);
      tl.fromTo($('h1', to), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.32, ease: 'back.out(2)', clearProps: 'opacity,transform' }, from ? 0.2 : 0.1);
      if (items.length) tl.fromTo(items, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.3, ease: 'back.out(2)', stagger: 0.05, clearProps: 'opacity,transform' }, from ? 0.3 : 0.2);
      return tl; });
    if (!tl && from && from !== to) from.classList.remove('on');
    try { ($('h1', to) || to).setAttribute('tabindex', '-1'); (i === 0 ? nameIn : $('h1', to)).focus({ preventScroll: true }); } catch(e){}
  }
  function next(){
    if (busy) return;
    if (cur === 9){ finish(true); return; }
    if (opts.start === 'links' && QS[cur] && QS[cur].kind === 'links'){ if (!linksCheck()) return; loading(); return; }
    if (cur === 0) a.artistName = nameIn.value.trim().slice(0, 30);
    if (QS[cur] && QS[cur].id === 'genres') a.genreOther = a.genres.indexOf('autre') >= 0 ? ($('#obOther', box).value || '').trim().slice(0, 60) : '';
    if (QS[cur] && QS[cur].kind === 'links' && !linksCheck()) return;
    var st = steps(), k = st.indexOf(cur);
    if (k < st.length - 1) show(st[k + 1], 1); else loading();
  }
  function linksCheck(){
    var first = null;
    $$('.ob-in[data-l]', box).forEach(function(w){ var k = w.dataset.l, v = a.links[k], wrong = !linkOk(k, v), need = !v && linkNeed(k, a), bad = wrong || need, m = $('.ob-bad', w), l = LINKS.filter(function(x){ return x[0] === k; })[0];
      w.classList.toggle('bad', bad); m.hidden = !bad; m.textContent = wrong ? t('ob.badlink', { site: l[1] }) : need ? t('ob.needOne', { site: l[1] }) : ''; if (bad && !first) first = w; });
    if (first){ try { $('input', first).focus(); } catch(e){} }
    return !first;
  }
  function prev(){ if (busy) return; var st = steps(), k = st.indexOf(cur); if (k > 0) show(st[k - 1], -1); }
  // (24/11, « Stats ») about 9 s of « analysis », at an uneven pace: quick steps, one or two that drag 2 to 3 s
  function loading(){
    busy = true; var lines = obLines(a), host = $('.ob-lns', load), pct = $('.ob-pct', load), arc = $('.arc', load);
    $('.ob-lt', load).textContent = t('ob.load'); host.innerHTML = lines.map(function(l){ return '<div class="ob-ln"><u aria-hidden="true">' + l[0] + '</u><span>' + l[1] + '</span></div>'; }).join('');
    load.classList.add('on'); bar.style.transform = 'scaleX(1)';
    obSave({ v: 2, done: Date.now(), a: a });
    var done = function(){ ready(); };
    var n = lines.length, tot = lines.reduce(function(x, l){ return x + l[2]; }, 0);
    var tl = play(function(g){ var tl = g.timeline({ onComplete: done }), P = { v: 0 }, at = 0.4, pc = 0;
      tl.fromTo(load, { yPercent: 100 }, { yPercent: 0, duration: 0.5, ease: 'power3.inOut' }, 0);
      tl.fromTo($('.ob-ring img', load), { rotation: -6 }, { rotation: 6, duration: 0.5, ease: 'sine.inOut', repeat: Math.max(1, Math.round(tot / 0.5) - 1), yoyo: true }, 0.4);
      $$('.ob-ln', load).forEach(function(l, k){ var d = lines[k][2], to = Math.round(100 * (pc + d) / tot), from = Math.round(100 * pc / tot); pc += d;
        tl.fromTo(l, { opacity: 0, y: 40, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: 'back.out(2)' }, at);
        // the ring and the per cent follow each step: fast when it is fast, slow when it drags
        tl.fromTo(arc, { strokeDashoffset: 1382.3 * (1 - from / 100) }, { strokeDashoffset: 1382.3 * (1 - to / 100), duration: d, ease: d > 1.8 ? 'power2.inOut' : 'power1.out' }, at);
        tl.fromTo(P, { v: from }, { v: to, duration: d, ease: d > 1.8 ? 'power2.inOut' : 'power1.out', onUpdate: function(){ pct.textContent = Math.round(P.v) + ' %'; } }, at);
        if (k < n - 1) tl.to(l, { opacity: 0, y: -30, filter: 'blur(6px)', duration: 0.2, ease: 'power2.in' }, at + d - 0.15);
        at += d; });
      tl.to(load, { yPercent: -105, duration: 0.5, ease: 'power3.in' }, at + 0.3);
      return tl; });
    // a touch passes it; with « less motion » the result comes at once
    load.onclick = function(){ if (tl) tl.timeScale(6); };
    if (!tl){ pct.textContent = '100 %'; done(); }
  }
  // « Ton analyse est prête »: a blurred preview with a padlock; signed out → « Crée ton compte pour la voir »
  function ready(){
    load.classList.remove('on'); busy = false;
    var signed = !!(M.acct && M.acct.state.user);
    var rich = W.StalakM5 && W.StalakM5.preview && W.StalakM5.preview();
    planS.innerHTML = '<h1>' + esc(t('ob.ready')) + '</h1>' + (rich ? '<div class="ob-lock ob-rich">' + rich + '</div>' : '<div class="ob-lock" aria-hidden="true"><div class="ob-fake"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="ob-fl"><b></b><b></b><b></b></div><span class="ob-pad">🔒</span></div>')
      + '<p class="ob-hint">' + esc(t(signed ? 'ob.readyIn' : 'ob.readyP')) + '</p>';
    var from = $('.ob-q.on', box); if (from) from.classList.remove('on');
    show(9, 1); cta.textContent = t(signed ? 'ob.see' : 'ob.create');
    play(function(g){ return g.timeline().fromTo($('.ob-lock', planS), { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.45, ease: 'back.out(2)', clearProps: 'transform,opacity' }, 0.2)
      .fromTo($('.ob-pad, .m5-pad', planS), { scale: 0.3, rotation: -20 }, { scale: 1, rotation: 0, duration: 0.5, ease: 'back.out(3)', clearProps: 'transform' }, 0.45)
      .fromTo(cta, { y: 30, scale: 0.92 }, { y: 0, scale: 1, duration: 0.5, ease: 'back.out(2)', clearProps: 'transform' }, 0.5); });
  }
  function finish(done){
    if (!done){ for (var k in a.links) if (!linkOk(k, a.links[k])) delete a.links[k]; var was = obState(); obSave({ v: 2, skipped: Date.now(), a: a, done: was && was.done || undefined }); }
    var end = function(){ box.remove(); root.classList.remove('m2-onb'); ob = null; try { last && last.focus && last.focus(); } catch(e){} W.__stalakOnbDone = 1;
      // then « Stats »: signed in, the analysis; signed out, the account to create first (Stats opens after it)
      if (opts.from === 'stats' && W.StalakM5) W.StalakM5.after(!!done); };
    if (!play(function(g){ return g.to(box, { yPercent: -104, duration: 0.42, ease: 'power3.in', onComplete: end }); })) end();
  }
  box.addEventListener('click', function(ev){
    var b = ev.target.closest && ev.target.closest('.ob-op'); if (!b || busy) return;
    var q = QS[+b.closest('.ob-q').dataset.i], v = b.dataset.v;
    if (q.kind === 'multi'){ var arr = a[q.id], k = arr.indexOf(v); if (k >= 0) arr.splice(k, 1); else arr.push(v); b.setAttribute('aria-pressed', String(k < 0)); }
    else { a[q.id] = a[q.id] === v ? '' : v; $$('.ob-op', b.parentNode).forEach(function(x){ x.setAttribute('aria-pressed', String(x.dataset.v === a[q.id])); }); }
    if (q.id === 'genres'){ var of = $('.ob-other', box), on = a.genres.indexOf('autre') >= 0; of.hidden = !on; if (on){ try { $('input', of).focus({ preventScroll: true }); } catch(e){} } }
    play(function(g){ return g.timeline().to(b, { scale: 0.96, duration: 0.08 }).to(b, { scale: 1, duration: 0.3, ease: 'back.out(3)', clearProps: 'transform' }); });
  });
  box.addEventListener('input', function(ev){ var w = ev.target.closest && ev.target.closest('.ob-in[data-l]'); if (!w) return; var v = ev.target.value.trim().slice(0, 200); if (v) a.links[w.dataset.l] = v; else delete a.links[w.dataset.l]; w.classList.toggle('has', !!v && linkOk(w.dataset.l, v)); if (w.classList.contains('bad') && linkOk(w.dataset.l, v)){ w.classList.remove('bad'); $('.ob-bad', w).hidden = true; } });
  nameIn.addEventListener('keydown', function(ev){ if (ev.key === 'Enter'){ ev.preventDefault(); next(); } });
  box.addEventListener('keydown', function(ev){ if (ev.key === 'Tab'){ var f = $$('button:not([hidden]), input', box).filter(function(x){ return x.getClientRects().length; }); if (!f.length) return;
    if (ev.shiftKey && D.activeElement === f[0]){ ev.preventDefault(); f[f.length - 1].focus(); } else if (!ev.shiftKey && D.activeElement === f[f.length - 1]){ ev.preventDefault(); f[0].focus(); } } });
  cta.onclick = next; back.onclick = prev; skip.onclick = function(){ if (!busy) finish(false); };
  if (!play(function(g){ return g.fromTo(box, { yPercent: 100 }, { yPercent: 0, duration: 0.45, ease: 'power3.out', clearProps: 'transform' }); })) { /* shown at once */ }
  show(opts.start === 'links' ? QS.map(function(q){ return q.kind; }).indexOf('links') : 0, 1);
}
// the first launch on this phone, after the opening; never over an edit, a page of the account or a link to something
function obMaybe(){
  if (ob || obState() || !M.phone() || !M.home() || M.view() || location.hash) return;
  if (navigator.webdriver && !W.__stalakOnb) return;
  if (root.classList.contains('splash-on')){ setTimeout(obMaybe, 300); return; }
  var open = function(){ M.gsap().then(function(){ if (!ob && !obState() && M.home() && !M.view()) obOpen(); }); };
  var A = M.acct;
  // signed in and already answered on another phone: nothing is asked twice
  if (A && A.state.user && typeof A.artist === 'function'){
    Promise.resolve(A.artist()).then(function(r){ if (r && r.profile && r.profile.answeredAt){ if (!obState()) store.set(OB_KEY, JSON.stringify({ v: 2, done: Date.now(), sent: Date.now(), remote: 1 })); W.__stalakOnbDone = 1; } else open(); }).catch(open);
  } else open();
}

/* ---- the app tells what is shown ---------------------------------------------------------------------------------------- */
var lastView = null;
function sync(){
  var phone = M.phone(), v = phone ? M.view() : null, fresh = v !== lastView; lastView = v;
  lgRender(v === 'login', fresh); pfRender(v === 'account', fresh);
  ptrOn = v === 'gallery'; if (ptrOn) ptrBuild(); else if (ptr && ptrD && !ptrBusy){ ptrD = 0; ptrSet(0); }
  if (legal && v !== 'account'){ legal.remove(); legal = null; }
  obSend();
}
M.on(sync); sync();
W.StalakM2 = { onboarding: obOpen, state: obState };
// (24/11) the first launch shows the tutorial (lot 4); the questionnaire opens from « Stats » (src/mobile5.js)
})();
