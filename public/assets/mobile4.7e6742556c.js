/* App & montage, refonte mobile, lot 4 (24/11): the tutorial (demo n° 10), the help ice cube as a real chat (n° 6), the paywall
   (n° 14), the end of an export with the 1 € offer (n° 15) and the screen after a purchase (n° 8), of
   docs/audit/maquettes/mobile-2026-11-23/ (validated by the owner; 14 and 15 started on his word of 24/11 at 16 h, « commence le
   lot 3 et le reste »). Phones only (under 900 px), stalak.app only, loaded by the app: /assets/mobile4.<hash>.js.
   The demo's own words, word for word. Every price, right and payment comes from the app (window.StalakM.pw): the same figures
   and the same buttons as the plans page and the end screen; nothing here sets a price or opens a payment of its own.
   Under test (navigator.webdriver) it stays off unless the test asks (window.__stalakM4on). */
(function(){
'use strict';
var M = window.StalakM, P = M && M.pw, D = document, W = window;
if (!M || !P || W.__stalakM4) return;
if (navigator.webdriver && !W.__stalakM4on) return;
W.__stalakM4 = 1;
var $ = function(s, r){ return (r || D).querySelector(s); }, $$ = function(s, r){ return Array.prototype.slice.call((r || D).querySelectorAll(s)); };
var root = D.documentElement;
function el(tag, cls, html){ var e = D.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
var store = { get: function(k){ try { return localStorage.getItem(k); } catch(e){ return null; } }, set: function(k, v){ try { localStorage.setItem(k, v); } catch(e){} } };
function shown(e){ return !!(e && e.getClientRects().length); }

var TX = {
fr: { skip: 'Passer', next: 'Suivant', go: 'C’est parti !', t1: 'Choisis ton son', p1: 'Garde le passage que tu veux poster.', bpm: '144 BPM', sec: '24 secondes choisies',
  t2: 'Filme tes prises', p2: 'Le même passage, sous plusieurs angles.', take: 'Prise {n}', t3: 'Stalak coupe', t3b: 'sur le rythme', p3: 'Tout seul, lèvres synchro, prêt pour TikTok et Reels.',
  t4: 'Exporte et poste', p4: 'Ta vidéo est prête pour TikTok et Reels.', again: 'Revoir le tutoriel', tuto: 'Tutoriel',
  hT: 'Le glaçon d’aide', hS: 'Répond tout de suite', today: 'Aujourd’hui', back: 'Retour', close: 'Fermer',
  pwT: 'Fais décoller {ts}', pwTs: 'ton son', or: 'ou', nothing: 'Rien à payer aujourd’hui · Annulable en 1 geste', payY: '{y} par an. Annulable à tout moment.', payM: '{m} par mois. Annulable à tout moment.', best: 'Meilleur prix · -{p} %', year: 'Pro · à l’année', month: 'Pro · au mois', free: '{n} jours gratuits',
  perM: '{m}/mois', perY: '{y} par an', creator: 'Voir Creator Plus (packs, sauvegarde en ligne)', tryF: 'Essayer gratuitement', choose: 'Choisir Pro',
  termsY: 'Rien aujourd’hui. Puis {y} par an dans {n} jours. Annulable à tout moment.', termsM: 'Rien aujourd’hui. Puis {m} par mois dans {n} jours. Annulable à tout moment.',
  reviews: 'Avis clients', home: 'Retour au menu principal', ready: 'Ta vidéo est prête', of1T: 'Retire le filigrane pour {p}', of1Go: 'Retirer pour {p}', saveWm: 'Enregistrer gratuitement (avec filigrane)', rmWm: 'Retirer le filigrane',
  thxT: 'Bienvenue dans Stalak {plan} !', thxP: 'Plus de filigrane. Tous les effets et les paroles automatiques sont débloqués.',
  thxPc: 'Plus de filigrane. Les effets, les paroles automatiques, les packs et la sauvegarde en ligne sont débloqués.', thxGo: 'Faire un montage', thxPlan: 'Voir ma formule' },
en: { skip: 'Skip', next: 'Next', go: 'Let’s go!', t1: 'Pick your song', p1: 'Keep the part you want to post.', bpm: '144 BPM', sec: '24 seconds picked',
  t2: 'Film your takes', p2: 'The same part, from several angles.', take: 'Take {n}', t3: 'Stalak cuts', t3b: 'to the beat', p3: 'By itself, lips in sync, ready for TikTok and Reels.',
  t4: 'Export and post', p4: 'Your video is ready for TikTok and Reels.', again: 'See the tutorial again', tuto: 'Tutorial',
  hT: 'The help ice cube', hS: 'Answers right away', today: 'Today', back: 'Back', close: 'Close',
  pwT: 'Make {ts} take off', pwTs: 'your song', or: 'or', nothing: 'Nothing to pay today · Cancel in 1 tap', payY: '{y} a year. Cancel anytime.', payM: '{m} a month. Cancel anytime.', best: 'Best price · -{p}%', year: 'Pro · yearly', month: 'Pro · monthly', free: '{n} days free',
  perM: '{m}/mo', perY: '{y} a year', creator: 'See Creator Plus (packs, online saving)', tryF: 'Try it free', choose: 'Choose Pro',
  termsY: 'Nothing today. Then {y} a year in {n} days. Cancel anytime.', termsM: 'Nothing today. Then {m} a month in {n} days. Cancel anytime.',
  reviews: 'Customer reviews', home: 'Back to home', ready: 'Your video is ready', of1T: 'Remove the watermark for {p}', of1Go: 'Remove for {p}', saveWm: 'Save for free (with watermark)', rmWm: 'Remove the watermark',
  thxT: 'Welcome to Stalak {plan}!', thxP: 'No more watermark. All the effects and the automatic lyrics are unlocked.',
  thxPc: 'No more watermark. The effects, the automatic lyrics, the packs and online saving are unlocked.', thxGo: 'Make an edit', thxPlan: 'See my plan' }
};
function t(k, v){ var s = (TX[M.lang()] || TX.en)[k] || TX.en[k] || k; if (v) for (var x in v) s = s.split('{' + x + '}').join(v[x]); return s; }

var INK = '#0a0d14', BLUE = '#1f6fd6';
var CSS = '@media (max-width:899px){'
+ '.m4-tu,.m4-pw,.m4-thx,.m4-hh,.m4-of1h,.m4-of1s{display:none}'
/* the tutorial */
+ 'html.m4tu .m4-tu{display:flex;position:fixed;inset:0;z-index:300;flex-direction:column;background:radial-gradient(120vw 70vh at 50% 0,#eef7ff 0,#d6ecff 62%);padding:max(14px,env(safe-area-inset-top,0px)) 20px max(18px,env(safe-area-inset-bottom,0px));box-sizing:border-box;overflow:hidden}'
+ 'html.m4tu .tabbar,html.m4tu .help-cube{display:none !important}'
+ '.m4-tt{display:flex;align-items:center;gap:12px;min-height:48px}.m4-bars{flex:1;display:flex;gap:6px}.m4-bars i{flex:1;height:8px;border-radius:8px;background:rgba(10,13,20,.15);overflow:hidden}.m4-bars i b{display:block;height:100%;width:100%;background:' + BLUE + ';transform:scaleX(0);transform-origin:0 50%}'
+ '.m4-skip{min-height:44px;padding:0 6px;margin:0;border:0;background:none;color:' + BLUE + ';font:800 16px/1 var(--body);cursor:pointer}'
+ '.m4-sl{flex:1;position:relative;min-height:0}.m4-s{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:10px;visibility:hidden}.m4-s.on{visibility:visible}'
+ '.m4-art{width:min(300px,80vw);height:min(300px,40svh);display:grid;place-items:center;margin-bottom:12px}'
+ '.m4-s h2:focus{outline:none}.m4-s h2{margin:0;font:400 31px/1.08 var(--display);color:' + INK + ';text-shadow:none;-webkit-text-stroke:0}.m4-s h2 b{font-weight:400;color:' + BLUE + '}.m4-s p{margin:0;max-width:300px;font:500 17px/1.4 var(--body);color:#3d4a63}'
+ '.m4-card{width:100%;box-sizing:border-box;border:3px solid ' + INK + ';border-radius:24px;background:#fff;box-shadow:0 6px 0 ' + INK + ';padding:16px}'
+ '.m4-wave{display:flex;align-items:center;justify-content:center;gap:3px;height:96px;margin:6px 0 10px;position:relative}.m4-wave i{width:5px;border-radius:3px;background:#9cc6f5}.m4-wave i.in{background:' + BLUE + '}'
+ '.m4-sel{position:absolute;top:-4px;bottom:-4px;left:28%;right:28%;border:3px solid ' + INK + ';border-radius:12px}'
+ '.m4-meta{display:flex;justify-content:space-between;font:700 13.5px/1.2 var(--body);color:#3d4a63}'
+ '.m4-takes{display:flex;gap:10px;justify-content:center}.m4-takes div{width:84px;aspect-ratio:9/16;border:3px solid ' + INK + ';border-radius:16px;box-shadow:0 5px 0 ' + INK + ';display:flex;align-items:flex-end;padding:7px;box-sizing:border-box;color:#fff;font:800 12px/1 var(--body)}'
+ '.m4-takes div:nth-child(1){background:linear-gradient(170deg,#1f4f9e,#0e1a33)}.m4-takes div:nth-child(2){background:linear-gradient(170deg,#5b3aa8,#1a1033)}.m4-takes div:nth-child(3){background:linear-gradient(170deg,#1f8f6a,#0d2a20)}'
+ '.m4-big{width:150px;height:150px;border-radius:44px;border:4px solid ' + INK + ';background:#fff;box-shadow:0 8px 0 ' + INK + ';display:grid;place-items:center;font-size:70px}.m4-big.ok{background:' + BLUE + ';color:#fff;font:400 84px/1 var(--display)}'
+ '.m4-cta{display:block;width:100%;min-height:60px;margin:12px 0 0;border:3.5px solid ' + INK + ';border-radius:20px;background:' + BLUE + ';color:#fff;box-shadow:0 6px 0 ' + INK + ';font:400 21px/1 var(--display);cursor:pointer}'
+ '.m4-cta:active{transform:translateY(4px);box-shadow:0 2px 0 ' + INK + '}'
/* the help ice cube: a real chat */
+ 'html.m4 #helpPanel:not([hidden]){position:fixed;inset:0;z-index:250;width:auto;max-width:none;height:auto;max-height:none;margin:0;border:0;border-radius:0;box-shadow:none;background:#d6ecff;display:flex;flex-direction:column;padding:0}'
+ 'html.m4 #helpPanel .hp-head{display:none}html.m4 #helpPanel .m4-hh{display:flex;align-items:center;gap:12px;padding:max(14px,env(safe-area-inset-top,0px)) 16px 18px;background:linear-gradient(135deg,#1f6fd6,#4a93ea);border-bottom:3px solid ' + INK + ';color:#fff}'
+ '.m4-hb{flex:none;width:44px;height:44px;margin:0;padding:0;border-radius:50%;border:3px solid ' + INK + ';background:#fff;box-shadow:0 3px 0 ' + INK + ';display:grid;place-items:center;color:' + INK + ';cursor:pointer}.m4-hb svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}'
+ '.m4-cube{flex:none;width:52px;height:52px;border-radius:15px;border:3px solid ' + INK + ';background:linear-gradient(135deg,#fff,#cfe6ff);box-shadow:0 3px 0 ' + INK + ';position:relative}'
+ '.m4-cube::before,.m4-cube::after{content:"";position:absolute;top:17px;width:7px;height:9px;border-radius:4px;background:' + INK + '}.m4-cube::before{left:14px}.m4-cube::after{right:14px}'
+ '.m4-cube i{position:absolute;left:16px;right:16px;bottom:12px;height:8px;border:3px solid ' + INK + ';border-top:0;border-radius:0 0 10px 10px}'
+ '.m4-hh b{display:block;font:400 22px/1.1 var(--display);text-shadow:0 2px 0 rgba(10,13,20,.35)}.m4-hh span{display:flex;align-items:center;gap:6px;margin-top:3px;font:600 14px/1.2 var(--body)}.m4-hh span::before{content:"";width:10px;height:10px;border-radius:50%;background:#5ee08a;border:2px solid #fff}'
+ 'html.m4 #helpLog{flex:1;min-height:0;max-height:none;overflow-y:auto;padding:16px 16px 10px;background:none;border:0;display:flex;flex-direction:column;gap:10px}'
+ 'html.m4 #helpLog::before{content:attr(data-m4d);align-self:center;margin:0 0 4px;font:600 13px/1 var(--body);color:#7a8aa6}'
+ 'html.m4 #helpLog .hp-msg{max-width:82%;margin:0;padding:12px 15px;border:3px solid ' + INK + ';border-radius:20px;box-shadow:0 4px 0 ' + INK + ';font:500 15.5px/1.4 var(--body);white-space:pre-wrap}'
+ 'html.m4 #helpLog .hp-msg.bot{align-self:flex-start;background:#fff;color:' + INK + ';margin-left:46px;position:relative;border-radius:20px 20px 20px 6px}'
+ 'html.m4 #helpLog .hp-msg.bot::before{content:"";position:absolute;left:-48px;bottom:-4px;width:34px;height:34px;border-radius:10px;border:2.5px solid ' + INK + ';background:#eaf5ff url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 34 34%27%3E%3Ccircle cx=%2711%27 cy=%2713%27 r=%272.6%27 fill=%27%230a0d14%27/%3E%3Ccircle cx=%2723%27 cy=%2713%27 r=%272.6%27 fill=%27%230a0d14%27/%3E%3Cpath d=%27M11 20q6 6 12 0%27 fill=%27none%27 stroke=%27%230a0d14%27 stroke-width=%272.6%27 stroke-linecap=%27round%27/%3E%3C/svg%3E") center/cover}'
+ 'html.m4 #helpLog .hp-msg.me,html.m4 #helpLog .hp-msg.user{align-self:flex-end;background:' + BLUE + ';color:#fff;border-radius:20px 20px 6px 20px}'
+ 'html.m4 #helpLog .hp-chips{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:8px;margin:2px 0 0}html.m4 #helpLog .hp-chips button{min-height:44px;margin:0;padding:0 16px;border:3px solid ' + INK + ';border-radius:999px;background:#fff;box-shadow:0 3px 0 ' + INK + ';color:' + BLUE + ';font:800 15px/1 var(--body);cursor:pointer}'
+ 'html.m4 #helpPanel .hp-form{display:flex;align-items:flex-end;gap:8px;margin:0 16px 8px;padding:6px 6px 6px 16px;border:3px solid ' + INK + ';border-radius:28px;background:#fff;box-shadow:0 4px 0 ' + INK + '}'
+ 'html.m4 #helpIn{flex:1;min-height:40px;max-height:120px;border:0;outline:0;background:none;box-shadow:none;padding:9px 0;font:500 16px/1.35 var(--body);resize:none}'
+ 'html.m4 #helpSend{flex:none;width:46px;height:46px;min-height:0;margin:0;padding:0;border-radius:50%;border:3px solid ' + INK + ';background:' + BLUE + ';box-shadow:none;color:transparent;font-size:0;position:relative}html.m4 #helpSend::after{content:"↑";position:absolute;inset:0;display:grid;place-items:center;color:#fff;font:800 22px/1 var(--body)}'
+ 'html.m4 #helpSend::before{display:none}'
// (26/11, owner: the two buttons under the question looked like a stuck tab and a dashed block) two real Stalak buttons: « Parler
// à un humain » the blue button (ink outline, hard shadow), « Copier les infos pour l'équipe » a quiet link under it
+ 'html.m4 #helpPanel .hp-human:not([hidden]){display:flex;align-items:center;justify-content:center;gap:8px;align-self:stretch;margin:4px 16px 0;min-height:52px;padding:0 18px;border:3px solid ' + INK + ';border-radius:18px;background:' + BLUE + ';color:#fff;box-shadow:0 4px 0 ' + INK + ';font:800 16px/1.1 var(--body);text-shadow:none}'
+ 'html.m4 #helpPanel .hp-human::before{content:"💬";font-size:17px}html.m4 #helpPanel .hp-human:active{transform:translateY(3px);box-shadow:0 1px 0 ' + INK + '}'
+ 'html.m4 #helpPanel .hp-diag{align-self:center;margin:6px 0 max(8px,env(safe-area-inset-bottom,0px));min-height:44px;padding:0 12px;border:0;background:none;color:#3d4a63;font:600 13.5px/1 var(--body);text-decoration:underline;text-underline-offset:3px}'
+ 'html.m4 #helpLog .hp-msg .btn.primary{display:inline-flex;align-items:center;min-height:44px;margin:10px 0 6px;padding:0 18px;border:3px solid ' + INK + ';border-radius:16px;background:' + BLUE + ';color:#fff;box-shadow:0 3px 0 ' + INK + ';font:800 15px/1 var(--body)}html.m4 #helpLog .hp-msg .btn.primary::before,html.m4 #helpLog .hp-msg .btn.primary::after{display:none}'
+ 'html.m4help .help-cube{display:none !important}'
/* the paywall « Salle » (maquette D, owner 24/11 18 h 18): the drawn concert hall, the star sticker, the night blue */
+ 'html.m4pw:not(.m4pwall) #apPro > :not(.m4-pw){display:none !important}html.m4pw .m4-pw{display:block;margin:calc(-1 * max(14px,env(safe-area-inset-top,0px))) -16px 0;padding-bottom:max(18px,env(safe-area-inset-bottom,0px));color:#fff}'
+ 'html.m4pw:not(.m4pwall) #acctPage .ap-top{display:none}html.m4pw:not(.m4pwall) #acctPage,html.m4pw:not(.m4pwall) #acctPage .ap-in{background:#081a45 !important;background-image:none !important}'
+ '.m4-ph{position:relative;height:min(42svh,340px);overflow:hidden;background:#081a45}'
+ '.m4-bg{position:absolute;inset:0;background:#0b2a6b center 30%/cover no-repeat;transform-origin:50% 40%}'
+ '.m4-ph::after{content:"";position:absolute;left:0;right:0;bottom:0;height:42%;background:linear-gradient(rgba(8,26,69,0),#081a45);pointer-events:none}'
+ '.m4-beam{position:absolute;top:-10%;width:34%;height:95%;background:linear-gradient(rgba(180,220,255,.55),rgba(180,220,255,0) 85%);clip-path:polygon(44% 0,56% 0,100% 100%,0 100%);mix-blend-mode:screen;opacity:.7;transform-origin:50% 0}'
+ '.m4-beam.l{left:8%;transform:rotate(18deg)}.m4-beam.r{right:8%;transform:rotate(-18deg)}'
+ '.m4-fl{position:absolute;width:7px;height:7px;border-radius:50%;background:#fff;box-shadow:0 0 10px 4px rgba(255,255,255,.85);opacity:0}'
+ '.m4-cf{position:absolute;top:-14px;width:7px;height:12px;border-radius:2px}'
+ '.m4-star{position:absolute;left:50%;top:14%;width:min(34vw,140px);margin-left:calc(min(34vw,140px) / -2);transform-origin:50% 100%;filter:drop-shadow(0 6px 10px rgba(0,0,0,.4))}'
+ '.m4-x{position:absolute;z-index:3;right:16px;top:max(14px,env(safe-area-inset-top,0px));width:44px;height:44px;margin:0;padding:0;border-radius:50%;border:0;background:rgba(8,26,69,.45);color:#fff;display:grid;place-items:center;cursor:pointer}.m4-x svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:3;stroke-linecap:round}'
+ '.m4-pb{position:relative;z-index:1;margin-top:-30px;padding:0 16px}'
+ '.m4-pt{margin:0 0 14px;text-align:center;white-space:nowrap;font:900 clamp(22px,7.2vw,30px)/1.1 var(--body);letter-spacing:-.02em;color:#fff;text-shadow:0 3px 0 rgba(0,0,0,.35);-webkit-text-stroke:0}.m4-pt .m4-ts{color:#ffd23f}'
+ '.m4-rv{display:flex;gap:10px;margin:0 -16px;padding:2px 16px 8px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding:0 16px;scrollbar-width:none;overscroll-behavior-x:contain;list-style:none}.m4-rv::-webkit-scrollbar{display:none}'
+ '.m4-rv li{flex:0 0 86%;scroll-snap-align:start;box-sizing:border-box;padding:12px 14px;border:3px solid #0a0d14;border-radius:20px;background:#fff;box-shadow:0 4px 0 #0a0d14;color:#0a0d14}'
+ '.m4-rv .rv-note{display:inline-flex;gap:6px;align-items:center;color:#f2a900;font:800 13.5px/1 var(--body)}.m4-rv .rv-note b{display:none}'
+ '.m4-rv .rv-who{display:inline;margin:0 0 0 6px;font:800 13.5px/1 var(--body);color:#0a0d14}'
+ '.m4-rv blockquote{margin:7px 0 0;font:500 13.5px/1.4 var(--body);color:#3d4a63;quotes:none;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}'
+ '.m4-rv .m4-rh{display:flex;flex-wrap:wrap;align-items:center}.m4-dots{display:flex;justify-content:center;gap:6px;margin:6px 0 18px}.m4-dots i{width:7px;height:7px;border-radius:7px;background:rgba(255,255,255,.35);transition:width .2s ease,background-color .2s ease}.m4-dots i.on{width:22px;background:#ffd23f}'
+ '.m4-opt{position:relative;display:flex;align-items:center;gap:12px;width:100%;margin:0 0 12px;padding:13px 14px;text-align:left;border:3px solid #0a0d14;border-radius:18px;background:#fff;box-shadow:0 4px 0 #0a0d14;color:#0a0d14;cursor:pointer}'
+ '.m4-opt[aria-checked="true"]{background:#eaf5ff;box-shadow:0 0 0 3px #4a93ea,0 4px 0 #0a0d14}'
+ '.m4-opt > i{flex:none;width:24px;height:24px;border-radius:50%;border:3px solid #0a0d14;background:#fff;box-sizing:border-box}.m4-opt[aria-checked="true"] > i{background:radial-gradient(circle,#1f6fd6 0 45%,#fff 50%)}'
+ '.m4-opt span{flex:1;min-width:0}.m4-opt b{display:block;font:800 17px/1.15 var(--body)}.m4-opt small{display:block;margin-top:3px;font:500 13px/1.3 var(--body);color:#3d4a63}'
+ '.m4-opt strong{flex:none;text-align:right;font:900 18px/1.1 var(--body)}.m4-opt strong small{font:500 12px/1.3 var(--body);color:#7a8aa6}'
+ '.m4-tag{position:absolute;left:16px;top:-14px;padding:3px 9px;border:2.5px solid #0a0d14;border-radius:9px;background:#ffd23f;font:700 12.5px/1.1 var(--body);color:#0a0d14}'
+ '.m4-ou{display:block;width:max-content;margin:-4px auto 8px;padding:3px 10px;border:2.5px solid #0a0d14;border-radius:999px;background:#ffd23f;color:#0a0d14;font:900 12px/1.1 var(--body)}'
+ '.m4-go{position:relative;overflow:hidden;margin-top:0}.m4-go::after{content:"";position:absolute;top:0;bottom:0;left:-40%;width:30%;background:linear-gradient(100deg,rgba(255,255,255,0),rgba(255,255,255,.55),rgba(255,255,255,0));transform:skewX(-18deg);animation:m4glint 3.2s ease-in-out 1s infinite;pointer-events:none}'
+ '@keyframes m4glint{0%{transform:translateX(0) skewX(-18deg)}45%,100%{transform:translateX(560%) skewX(-18deg)}}'
+ '.m4-go.pulse{animation:m4pulse 2.4s ease-in-out infinite}@keyframes m4pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}'
+ '.m4-terms{margin:10px 0 0;text-align:center;font:600 13px/1.4 var(--body);color:rgba(255,255,255,.8)}.m4-terms:empty{display:none}'
+ '.m4-link{display:block;margin:4px auto 0;min-height:44px;padding:0 8px;border:0;background:none;color:#9cc6f5;font:700 14px/1.2 var(--body);text-decoration:underline;text-underline-offset:3px;cursor:pointer}'
+ '@media (prefers-reduced-motion:reduce){.m4-go::after,.m4-go.pulse{animation:none}.m4-dots i{transition:none}}'
+ 'html.m4pwall .m4-pw{display:none}'
/* (25/11, owner, 2nd time: « l'écran pour enregistrer la vidéo est tout noir et moche. Je veux une belle page comme les autres »;
   Chef: docs/handoff/chef-fin-export-belle-page.md) the end of an export, with or without the 1 € offer, for everyone: a party
   sky in the family of the gradient A (night blue at the top, royal blue, light blue at the bottom; never darker than #0e3f8f),
   white flakes falling, a golden halo behind the video, the mascot celebrating next to « Ta vidéo est prête », confetti once
   when the screen comes; the white cards one under the other, evenly spaced, and the page ends at the last one */
+ 'html.m4fe.m4fe,html.m4fe.m4fe body{background:#d6ecff !important;background-image:none !important}html.m4fe.m4fe body{background:transparent !important}'
+ '.m4-fbg{display:none}html.m4fe .m4-fbg{display:block;position:fixed;left:0;right:0;top:-2px;bottom:auto;height:calc(100vh + 4px);height:calc(100lvh + 4px);z-index:-1;pointer-events:none;background:radial-gradient(1.6px 1.6px at 20px 30px,#fff 98%,transparent),radial-gradient(2.4px 2.4px at 90px 110px,rgba(255,255,255,.9) 98%,transparent),radial-gradient(1.8px 1.8px at 150px 60px,rgba(255,255,255,.8) 98%,transparent),radial-gradient(3px 3px at 60px 170px,rgba(255,255,255,.85) 98%,transparent),radial-gradient(2px 2px at 190px 200px,#fff 98%,transparent),linear-gradient(180deg,#0e3f8f 0%,#1a5fc4 38%,#3f8ee6 64%,#8fcaff 86%,#d6ecff 100%);background-size:220px 230px,220px 230px,220px 230px,220px 230px,220px 230px,100% 100%;animation:m4snow 14s linear infinite}'
+ '@keyframes m4snow{from{background-position:0 0,0 0,0 0,0 0,0 0,0 0}to{background-position:30px 230px,-20px 230px,10px 230px,-30px 230px,20px 230px,0 0}}'
+ 'html.m4fe #doneView .dv-card{position:relative;overflow:visible;gap:14px;background:none;border:0;box-shadow:none;padding:0;color:#fff}html.m4fe #doneView .dv-card::before,html.m4fe #doneView .dv-card::after{display:none}'
+ 'html.m4fe #dvT,html.m4fe .wrap > header{display:none}'
+ 'html.m4fe .m4-of1h{display:flex;align-items:center;justify-content:center;gap:8px;margin:0;text-align:center;font:400 27px/1.1 var(--display);color:#fff;-webkit-text-stroke:6px ' + INK + ';paint-order:stroke fill;text-shadow:0 3px 0 ' + INK + '}'
+ 'html.m4fe .m4-of1h span::before{content:"✓ ";color:#5ee08a}.m4-fem{flex:none;width:74px;height:74px;margin:-14px 0 -10px -6px;object-fit:contain;filter:drop-shadow(0 3px 0 rgba(10,13,20,.25))}'
+ 'html.m4fe #dvCmp .cmp-pro,html.m4fe #dvCmp .cmp-note,html.m4fe #dvCmp figcaption{display:none}html.m4of1 #dvCmp{display:block}html.m4fe #dvCmp .cmp-f{margin:0 auto;max-width:280px}'
+ 'html.m4fe #resultVideo,html.m4fe #dvCmp video{position:relative;border:3px solid #fff;border-radius:24px;max-height:40svh;width:auto !important;max-width:100%;margin:0 auto;display:block;box-shadow:0 0 0 3px ' + INK + ',0 0 34px 10px rgba(255,205,70,.75)}html.m4fe #dvCmp .cmp-f,html.m4fe #dvCmp .cmp-box{max-width:none;width:auto;height:auto;aspect-ratio:auto;background:none;border:0;box-shadow:none}'
+ 'html.m4fe #result{position:relative;display:flex !important;flex-direction:column;gap:14px;margin:0;padding:6px 0 0}html.m4fe #result > *{order:6}html.m4fe #result > #dvCmp,html.m4fe #result > #resultVideo{order:1}html.m4fe #result > .m4-of1h{order:2}html.m4fe #result > .m4-of1s{order:3}'
+ '.m4-halo{display:none}html.m4fe #result > .m4-halo{display:block;position:absolute;z-index:-1;left:50%;top:-50px;width:340px;height:min(560px,calc(40svh + 140px));margin-left:-170px;pointer-events:none;background:radial-gradient(closest-side,rgba(255,222,110,.95),rgba(255,204,70,.7) 55%,rgba(255,196,60,0) 100%)}'
// the cards: all the same, 14 px apart
+ 'html.m4fe #result > .m4-of1s,html.m4fe #result > .sharebox:not([hidden]),html.m4fe #result > .capbox,html.m4fe #result > .optbox:not([hidden]),html.m4fe #result > .post,html.m4fe .dv-foot{position:static;margin:0;padding:14px 16px;background:#fff;border:3px solid ' + INK + ';border-radius:20px;box-shadow:0 4px 0 ' + INK + ';color:' + INK + '}'
+ 'html.m4fe .m4-of1s{display:block;padding:18px 16px 16px;text-align:center}.m4-of1s h3{margin:0 0 14px;font:400 26px/1.1 var(--display);color:' + INK + ';text-shadow:none}.m4-of1s h3 b{font-weight:400;color:' + BLUE + '}html.m4fe .m4-of1s h3:empty{display:none}'
+ 'html.m4fe #result > .capbox,html.m4fe #result > .sharebox:not([hidden]){display:flex !important;flex-direction:column;gap:8px}html.m4fe #result > .capbox > *,html.m4fe #result > .sharebox > *{order:0 !important;margin:0}'
+ 'html.m4fe #result > .optbox::before,html.m4fe #result > .optbox::after,html.m4fe #result > .capbox::before,html.m4fe #result > .capbox::after{display:none !important}'
+ 'html.m4fe #result .hint,html.m4fe #result .note,html.m4fe #result .label,html.m4fe #result .optc{color:#3d4a63 !important;text-shadow:none}html.m4fe #result .label{color:' + INK + ' !important;font-weight:800}'
+ 'html.m4fe .dv-foot{display:flex;flex-direction:row;flex-wrap:wrap;justify-content:center;gap:0 18px;margin:0;padding:4px 12px}html.m4fe .dv-foot .linkbtn{min-height:44px;color:' + BLUE + ';text-shadow:none}html.m4fe .dv-foot .linkbtn[hidden]{display:none}'
+ 'html.m4fe .wrap{padding-bottom:calc(18px + env(safe-area-inset-bottom,0px)) !important}html.m4fe #doneView{margin-bottom:0;padding-bottom:0}'
// the save, in the white card: a real button (25/11, owner's rule: the free choice is clearly seen)
+ 'html.m4fe #saveRow{display:block;margin:0}html.m4of1 #saveRow{margin:12px 0 0}html.m4fe #saveBtn{display:block;box-sizing:border-box;width:100%;min-height:56px;margin:0;white-space:normal}html.m4fe #capText{min-height:118px}'
+ 'html.m4of1 #saveBtn{padding:8px 12px;border:3px solid ' + INK + ';border-radius:18px;background:#fff;box-shadow:0 4px 0 ' + INK + ';color:' + INK + ';font-size:0}html.m4of1 #saveBtn > .m4-sw{font:700 16.5px/1.25 var(--body);color:' + INK + '}'
+ 'html.m4of1 #saveBtn::before,html.m4of1 #saveBtn::after{display:none}html.m4of1 #saveBtn > *{display:none}html.m4of1 #saveBtn > .m4-sw{display:inline}html.m4fe #saveNote:empty{display:none}'
// with the offer: the blue « Retirer pour 1 € », the terms, the free save under it
+ 'html.m4of1 #dvCmpGo{display:block;width:100%;min-height:60px;margin:0;border:3.5px solid ' + INK + ';border-radius:20px;background:' + BLUE + ';color:#fff;box-shadow:0 6px 0 ' + INK + ';font:400 21px/1 var(--display)}'
+ 'html.m4of1 #dvCmpGo > span{display:none}html.m4of1 #dvCmpGo > .m4-o1g{display:inline}html.m4of1 #dvCmpGo::before,html.m4of1 #dvCmpGo::after{display:none}'
+ 'html.m4of1 #dvOffer1{margin:12px 0 0;font:500 14px/1.45 var(--body);color:#3d4a63}'
// (25/11, owner's decision) the other times (no offer): « Enregistrer » first, and a small link « Retirer le filigrane » to the plans
+ 'html.m4wm #dvCmpP,html.m4wm #dvTrial{display:none !important}html.m4fe:not(.m4of1) #dvCmp:not([hidden]){display:block}'
// without the offer (or for a subscriber), « Enregistrer la vidéo » is the big blue button of the card, like « Retirer pour 1 € »
+ 'html.m4fe:not(.m4of1) #saveBtn{min-height:60px;padding:8px 12px;border:3.5px solid ' + INK + ';border-radius:20px;background:' + BLUE + ';color:#fff;box-shadow:0 6px 0 ' + INK + ';font:400 21px/1.1 var(--display);text-shadow:none}html.m4fe:not(.m4of1) #saveBtn::before,html.m4fe:not(.m4of1) #saveBtn::after{display:none !important}'
+ 'html.m4wm #dvCmpGo{display:block;width:auto;min-height:44px;margin:8px auto -6px;padding:0 8px;border:0;background:none;box-shadow:none;font-size:0}html.m4wm #dvCmpGo::before,html.m4wm #dvCmpGo::after{display:none}html.m4wm #dvCmpGo > *{display:none}'
+ 'html.m4wm #dvCmpGo > .m4-rw{display:inline;font:700 15px/1.2 var(--body);color:' + BLUE + ';text-decoration:underline;text-underline-offset:3px}'
+ 'html.m4fe .m4-of1s #ttkPub{display:flex;box-sizing:border-box;width:100%;min-height:56px;margin:12px 0 0;border-radius:18px}html.m4fe .m4-of1s #ttkPub[hidden]{display:none}'
+ '.m4-home{display:none}html.m4fe .m4-home:not([hidden]){display:flex;align-items:center;justify-content:center;gap:10px;box-sizing:border-box;width:100%;min-height:58px;margin:14px 0 0;padding:8px 14px;border:3.5px solid ' + INK + ';border-radius:20px;background:#ffd23f;color:' + INK + ';box-shadow:0 5px 0 ' + INK + ';font:400 21px/1.1 var(--display);cursor:pointer;animation:m4homeIn .24s cubic-bezier(.165,.84,.44,1) both}'
+ '.m4-home i{font-style:normal;font-size:22px}@keyframes m4homeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}@media (prefers-reduced-motion:reduce){.m4-home{animation:none !important}}'
// confetti, once, when the screen comes (GSAP, as in the HyperFrames demos; never with « reduce motion »)
+ '.m4-fx{position:fixed;inset:0;z-index:150;pointer-events:none;overflow:hidden}.m4-fx i{position:absolute;top:-24px;width:10px;height:16px;border-radius:3px;border:1.5px solid rgba(10,13,20,.35)}'
/* after a purchase */
+ 'html.m4thx #proThx > :not(.m4-thx){display:none !important}html.m4thx #proThx{background:rgba(10,13,20,.45)}'
+ 'html.m4thx .m4-thx{display:block;position:fixed;left:0;right:0;bottom:0;z-index:2;padding:0 20px max(22px,env(safe-area-inset-bottom,0px));background:#fff;border-top:3px solid ' + INK + ';border-radius:30px 30px 0 0;text-align:center}'
+ '.m4-thx img{width:150px;height:150px;margin:-70px auto 0;display:block;object-fit:contain}.m4-thx h2{margin:4px 0 8px;font:400 29px/1.1 var(--display);color:' + INK + ';text-shadow:none}.m4-thx h2 b{font-weight:400;color:' + BLUE + '}'
+ '.m4-thx p{margin:0 auto;max-width:320px;font:500 16px/1.45 var(--body);color:#3d4a63}.m4-conf{position:fixed;inset:0;z-index:1;pointer-events:none;overflow:hidden}.m4-conf i{position:absolute;top:-20px;width:10px;height:16px;border-radius:3px}'
+ '@media (prefers-reduced-motion:reduce){.m4-dots i{transition:none}}'
+ '}';

var built = false, tu = null, pw = null, thx = null, of1s = null, of1h = null, hh = null;
function build(){
  if (built) return; built = true;
  var st = el('style'); st.textContent = CSS; D.head.appendChild(st);
  root.classList.add('m4');
  // the help: its header (back, the cube, « Répond tout de suite »)
  var hp = $('#helpPanel');
  if (hp){ hh = el('div', 'm4-hh', '<button type="button" class="m4-hb"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M15 5l-7 7 7 7"/></svg></button><div class="m4-cube" aria-hidden="true"><i></i></div><div><b></b><span></span></div>');
    hp.insertBefore(hh, hp.firstChild); $('.m4-hb', hh).onclick = function(){ var c = $('#helpClose'); if (c) c.click(); }; }
  // « Revoir le tutoriel » in the profile (lot 2), under « Aide »
  addAgain();
  var mo = new MutationObserver(function(){ sync(); });
  ['#helpPanel', '#proThx', '#doneView', '#dvOffer1', '#apPro', '#acctPage'].forEach(function(s){ var n = $(s); if (n) mo.observe(n, { attributes: true, attributeFilter: ['hidden', 'class'] }); });
}
function addAgain(){
  var h = $('#m2Help'); if (!h || $('#m4Again')) return;
  var a = h.cloneNode(true); a.id = 'm4Again'; var ic = $('svg', a); if (ic) ic.innerHTML = '<path d="M3 9l9-5 9 5-9 5z"/><path d="M7 11.2v4.3c1.5 1.3 3.2 2 5 2s3.5-.7 5-2v-4.3"/>';
  h.parentNode.insertBefore(a, h.nextSibling); a.onclick = function(){ tuOpen(true); };
}

/* ---- the tutorial (26/11, Chef: 3 screens at most, one message each, each can be skipped): 3 screens at the first launch (after the onboarding), and from the profile ---------------------------- */
function tuOpen(again){
  if (tu) return; build();
  var waves = ''; for (var i = 0; i < 34; i++){ var h = 18 + Math.round(Math.abs(Math.sin(i * 1.7) * 60 + Math.sin(i * 0.6) * 18)); waves += '<i class="' + (i >= 10 && i < 24 ? 'in' : '') + '" style="height:' + h + 'px"></i>'; }
  tu = el('div', 'm4-tu'); tu.setAttribute('role', 'dialog'); tu.setAttribute('aria-modal', 'true'); tu.setAttribute('aria-label', t('tuto'));
  tu.innerHTML = '<div class="m4-tt"><div class="m4-bars"><i><b></b></i><i><b></b></i><i><b></b></i></div><button type="button" class="m4-skip"></button></div>'
    + '<div class="m4-sl">'
    + '<section class="m4-s" data-i="0"><div class="m4-art"><div class="m4-card"><div class="m4-meta"><span>' + esc(t('bpm')) + '</span><span>' + esc(t('sec')) + '</span></div><div class="m4-wave">' + waves + '<span class="m4-sel"></span></div></div></div><h2>' + esc(t('t1')) + '</h2><p>' + esc(t('p1')) + '</p></section>'
    + '<section class="m4-s" data-i="1"><div class="m4-art"><div class="m4-takes"><div>' + esc(t('take', { n: 1 })) + '</div><div>' + esc(t('take', { n: 2 })) + '</div><div>' + esc(t('take', { n: 3 })) + '</div></div></div><h2>' + esc(t('t2')) + '</h2><p>' + esc(t('p2')) + '</p></section>'
    + '<section class="m4-s" data-i="2"><div class="m4-art"><div class="m4-big" aria-hidden="true">✂️</div></div><h2>' + esc(t('t3')) + ' <b>' + esc(t('t3b')) + '</b></h2><p>' + esc(t('p3')) + '</p></section>'
    + '</div><button type="button" class="m4-cta"></button>';
  D.body.appendChild(tu); root.classList.add('m4tu');
  var cur = -1, last = D.activeElement;
  $('.m4-skip', tu).textContent = t('skip');
  function show(i){
    var from = cur >= 0 ? $('.m4-s[data-i="' + cur + '"]', tu) : null, to = $('.m4-s[data-i="' + i + '"]', tu); cur = i;
    $('.m4-cta', tu).textContent = t(i === 2 ? 'go' : 'next'); $('.m4-skip', tu).hidden = i === 2;
    $$('.m4-bars b', tu).forEach(function(b, k){ var on = k <= i; if (!M.play(function(g){ return g.to(b, { scaleX: on ? 1 : 0, duration: 0.4, ease: 'power2.out' }); })) b.style.transform = 'scaleX(' + (on ? 1 : 0) + ')'; });
    to.classList.add('on');
    var tl = M.play(function(g){ var tl = g.timeline();
      if (from){ tl.to(from, { x: -60, opacity: 0, duration: 0.22, ease: 'power2.in', onComplete: function(){ from.classList.remove('on'); g.set(from, { clearProps: 'transform,opacity' }); } }, 0); }
      tl.fromTo(to, { x: from ? 60 : 0, opacity: 0 }, { x: 0, opacity: 1, duration: 0.36, ease: 'power3.out', clearProps: 'transform,opacity' }, from ? 0.16 : 0);
      tl.fromTo($('.m4-art', to), { scale: 0.85, y: 14 }, { scale: 1, y: 0, duration: 0.5, ease: 'back.out(2)', clearProps: 'transform' }, from ? 0.2 : 0.05);
      if (i === 0) tl.fromTo($$('.m4-wave i', to), { scaleY: 0.2 }, { scaleY: 1, duration: 0.4, ease: 'back.out(2)', stagger: 0.012, transformOrigin: '50% 50%', clearProps: 'transform' }, 0.25);
      if (i === 1) tl.fromTo($$('.m4-takes div', to), { y: 40, rotation: -6, opacity: 0 }, { y: 0, rotation: 0, opacity: 1, duration: 0.4, ease: 'back.out(2)', stagger: 0.1, clearProps: 'transform,opacity' }, 0.25);
      return tl; });
    if (!tl && from) from.classList.remove('on');
    try { $('h2', to).setAttribute('tabindex', '-1'); $('h2', to).focus({ preventScroll: true }); } catch(e){}
  }
  function end(){ store.set('stalak:tuto', '1'); var box = tu; tu = null;
    var fin = function(){ box.remove(); root.classList.remove('m4tu'); try { last && last.focus && last.focus(); } catch(e){} W.__stalakTutoDone = 1; };
    if (!M.play(function(g){ return g.to(box, { opacity: 0, y: 30, duration: 0.25, ease: 'power2.in', onComplete: fin }); })) fin(); }
  $('.m4-cta', tu).onclick = function(){ if (cur < 2) show(cur + 1); else end(); };
  $('.m4-skip', tu).onclick = end;
  tu.addEventListener('keydown', function(e){ if (e.key === 'Escape') end(); });
  // a swipe moves too
  var x0 = null; tu.addEventListener('touchstart', function(e){ x0 = e.touches[0].clientX; }, { passive: true });
  tu.addEventListener('touchend', function(e){ if (x0 == null) return; var dx = e.changedTouches[0].clientX - x0; x0 = null; if (dx < -50 && cur < 2) show(cur + 1); else if (dx > 50 && cur > 0) show(cur - 1); }, { passive: true });
  M.play(function(g){ return g.fromTo(tu, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out', clearProps: 'opacity' }); });
  show(0);
}
// the first launch (24/11: the tutorial takes the questionnaire's place, which now opens from « Stats »), on the home screen,
// never over an edit or a page
function tuMaybe(){
  if (tu || store.get('stalak:tuto') || !M.phone() || !M.home() || M.view() || location.hash) return;
  if (root.classList.contains('splash-on') || root.classList.contains('m2-onb') || $('#m2Onb')){ setTimeout(tuMaybe, 500); return; }
  tuOpen(false);
}

/* ---- the paywall « Salle » (demo 14, maquette D chosen on 24/11 at 18 h 18): the plans page of someone without a plan --------- */
var rvTimer = 0, rvI = 0, pwAnim = null;
function pwBuild(){
  var ap = $('#apPro'); if (!ap) return;
  var fresh = !pw;
  if (!pw){
    pw = el('div', 'm4-pw');
    pw.innerHTML = '<div class="m4-ph" aria-hidden="true"><div class="m4-bg"></div><i class="m4-beam l"></i><i class="m4-beam r"></i><img class="m4-star" alt=""></div>'
      + '<button type="button" class="m4-x"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18"/></svg></button>'
      + '<div class="m4-pb"><h2 class="m4-pt"></h2><ul class="m4-rv" aria-roledescription="carrousel"></ul><div class="m4-dots" aria-hidden="true"></div>'
      + '<button type="button" class="m4-opt" role="radio" data-int="year"><em class="m4-tag"></em><i aria-hidden="true"></i><span><b></b><small></small></span><strong></strong></button>'
      + '<button type="button" class="m4-opt" role="radio" data-int="month"><i aria-hidden="true"></i><span><b></b><small></small></span><strong></strong></button>'
      + '<span class="m4-ou" aria-hidden="true"></span><button type="button" class="m4-cta m4-go"></button><p class="m4-terms"></p><button type="button" class="m4-link m4-cr"></button></div>';
    ap.insertBefore(pw, ap.firstChild);
    // the drawn hall and the sticker: loaded only now, when the paywall opens
    $('.m4-bg', pw).style.backgroundImage = 'url("/decors/scene-salle.webp")'; $('.m4-star', pw).src = '/emoji/star.webp';
    var ph = $('.m4-ph', pw);
    [[14, 72], [28, 84], [47, 78], [63, 88], [79, 74], [90, 86], [36, 92]].forEach(function(p){ var f = el('i', 'm4-fl'); f.style.left = p[0] + '%'; f.style.top = p[1] + '%'; ph.appendChild(f); });
    $('.m4-x', pw).onclick = function(){ var b = $('#apBack'); if (b) b.click(); else M.hide(); };
    $$('.m4-opt', pw).forEach(function(b){ b.onclick = function(){ P.setInt(b.dataset.int); pwUi(); }; });
    $('.m4-cr', pw).onclick = function(){ root.classList.add('m4pwall'); var c = $('#apPro .pl-creator'); try { (c || ap).scrollIntoView({ block: 'start' }); } catch(e){} };
    $('.m4-go', pw).onclick = function(){ P.buy($('.m4-go', pw)); };
    // the reviews: the real ones of the page (avis.json, word for word), moved with the finger; the dots follow
    var rv = $('.m4-rv', pw), src = $$('.rv-list > li').slice(0, 6);
    src.forEach(function(li){ var n = el('li'), note = $('.rv-note', li), q = $('blockquote', li), who = $('.rv-who', li);
      n.innerHTML = '<div class="m4-rh">' + (note ? note.outerHTML : '') + (who ? who.outerHTML : '') + '</div>' + (q ? q.outerHTML : ''); rv.appendChild(n); });
    if (!src.length) rv.hidden = true;
    $('.m4-dots', pw).innerHTML = src.map(function(_, k){ return '<i class="' + (k ? '' : 'on') + '"></i>'; }).join('');
    var rvRaf = 0; rv.addEventListener('scroll', function(){ cancelAnimationFrame(rvRaf); rvRaf = requestAnimationFrame(rvDots); }, { passive: true });
    rv.addEventListener('pointerdown', function(){ clearInterval(rvTimer); rvTimer = 0; }, { passive: true });
  }
  pwUi();
  if (fresh || !root.classList.contains('m4pw')) pwIntro();
}
function rvDots(){
  var rv = $('.m4-rv', pw), items = $$('li', rv); if (!items.length) return;
  var w = items[0].offsetWidth + 10, k = Math.max(0, Math.min(items.length - 1, Math.round(rv.scrollLeft / w))); rvI = k;
  $$('.m4-dots i', pw).forEach(function(d, i){ d.classList.toggle('on', i === k); });
}
function rvShow(i){
  var rv = $('.m4-rv', pw), items = $$('li', rv); if (!items.length) return;
  rvI = (i + items.length) % items.length;
  try { rv.scrollTo({ left: items[rvI].offsetLeft - 16, behavior: M.calm() ? 'auto' : 'smooth' }); } catch(e){ rv.scrollLeft = items[rvI].offsetLeft - 16; }
}
/* the opening: the hall zooms out a little, 2 beams sweep, phones flash in the crowd, confetti, the star falls on the stage and sways */
function pwIntro(){
  if (pwAnim){ try { pwAnim.kill(); } catch(e){} pwAnim = null; }
  var ph = $('.m4-ph', pw);
  $$('.m4-cf', ph).forEach(function(c){ c.remove(); });
  pwAnim = M.play(function(g){
    var tl = g.timeline();
    tl.fromTo($('.m4-bg', pw), { scale: 1.14 }, { scale: 1, duration: 1.6, ease: 'power2.out' }, 0)
      .fromTo($('.m4-star', pw), { y: -260, rotation: -14 }, { y: 0, rotation: 0, duration: 0.7, ease: 'bounce.out' }, 0.25)
      .to($('.m4-star', pw), { rotation: 4, duration: 1.4, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 1.0)
      .fromTo($('.m4-beam.l', pw), { rotation: 30 }, { rotation: 6, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 0)
      .fromTo($('.m4-beam.r', pw), { rotation: -30 }, { rotation: -6, duration: 2.9, ease: 'sine.inOut', yoyo: true, repeat: -1 }, 0.2)
      .fromTo($$('.m4-pb > *', pw), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out', stagger: 0.05, clearProps: 'opacity,transform' }, 0.35);
    $$('.m4-fl', pw).forEach(function(f, i){ tl.to(f, { opacity: 1, duration: 0.08, yoyo: true, repeat: 1, repeatDelay: 0.06 }, 0.6 + i * 0.37 + Math.random() * 0.3);
      tl.to(f, { opacity: 1, duration: 0.08, yoyo: true, repeat: 1, repeatDelay: 0.06 }, 3.2 + i * 0.53); });
    var cols = ['#ffd23f', '#ffffff', '#9cc6f5', '#ff5fa2', '#4a93ea'];
    for (var i = 0; i < 26; i++){ var c = el('i', 'm4-cf'); c.style.left = (Math.random() * 100) + '%'; c.style.background = cols[i % cols.length]; ph.appendChild(c);
      tl.fromTo(c, { y: 0, rotation: Math.random() * 360 }, { y: ph.offsetHeight + 30, x: (Math.random() - 0.5) * 80, rotation: '+=' + (300 + Math.random() * 300), duration: 1.8 + Math.random() * 1.2, ease: 'power1.in' }, 0.3 + Math.random() * 0.8); }
    return tl; });
  var go = $('.m4-go', pw); go.classList.toggle('pulse', !M.calm());
}
function pwUi(){
  if (!pw) return;
  var a = P.amounts(), int = P.int(), tr = P.trial(), days = P.days();
  var m = P.money(a.m, a.cur), y = P.money(a.y, a.cur), ym = P.money(Math.round(a.y / 12 * 100) / 100, a.cur), save = a.m > 0 ? Math.round((1 - a.y / (a.m * 12)) * 100) : 0;
  $('.m4-pt', pw).innerHTML = esc(t('pwT')).replace('{ts}', '<span class="m4-ts">' + esc(t('pwTs')) + '</span>');
  var yb = $('.m4-opt[data-int="year"]', pw), mb = $('.m4-opt[data-int="month"]', pw);
  $('.m4-tag', yb).textContent = t('best', { p: save }); $('.m4-tag', yb).hidden = save <= 0;
  $('b', yb).textContent = t('year'); $('b', mb).textContent = t('month');
  $('span small', yb).textContent = tr ? t('free', { n: days }) : ''; $('span small', mb).textContent = tr ? t('free', { n: days }) : '';
  $('strong', yb).innerHTML = esc(t('perM', { m: ym })) + '<small>' + esc(t('perY', { y: y })) + '</small>'; $('strong', mb).textContent = t('perM', { m: m });
  yb.setAttribute('aria-checked', String(int === 'year')); mb.setAttribute('aria-checked', String(int !== 'year'));
  $('.m4-ou', pw).textContent = t('or');
  $('.m4-cr', pw).textContent = t('creator');
  $('.m4-go', pw).textContent = tr ? t('tryF') : t('choose');
  // under the button: with the free trial, the demo's line; without it, what is paid (the yearly or the monthly amount)
  $('.m4-terms', pw).textContent = tr ? t('nothing') : t(int === 'year' ? 'payY' : 'payM', { y: y, m: m });
  $('.m4-x', pw).setAttribute('aria-label', t('close'));
  $('.m4-rv', pw).setAttribute('aria-label', t('reviews'));
  clearInterval(rvTimer); rvTimer = 0; if (!M.calm()) rvTimer = setInterval(function(){ if (root.classList.contains('m4pw')) rvShow(rvI + 1); }, 5200);
}

/* ---- the end of an export (all cases): the sky, the halo, the mascot, the cards; with the 1 € offer, the offer's card --------- */
var of1Moved = [], feWas = '', fbg = null, halo = null, fem = null, feHome = null;
(function(){ var sb = $('#saveBtn'); if (sb) sb.addEventListener('click', function(){ if (feHome && feWas) feHome.hidden = false; }); })();
function feBack(){
  var tk = $('#ttkPub'), tin = !!(tk && of1s && of1s.contains(tk));
  for (var i = of1Moved.length - 1; i >= 0; i--){ var m = of1Moved[i]; try { m[1].insertBefore(m[0], m[2] && m[2].parentNode === m[1] ? m[2] : null); } catch(e){} } of1Moved = [];
  $$('.m4-o1g, .m4-sw').forEach(function(n){ n.remove(); });
  var sr = $('#saveRow'); if (tin && sr) sr.after(tk);
}
// mode: 'of1' (the offer), 'wm' (watermark, no offer this time), 'plain' (nothing to sell), '' (not the end of an export)
function feOn(mode){
  var res = $('#result');
  if (mode && res){
    if (!of1s){ of1s = el('div', 'm4-of1s', '<h3></h3>'); feHome = el('button', 'm4-home', '<i aria-hidden="true">🏠</i><span></span>'); feHome.type = 'button'; feHome.hidden = true; feHome.onclick = function(){ if (M.ed && M.ed.goHome) M.ed.goHome(); }; of1h = el('p', 'm4-of1h', '<img class="m4-fem" src="/emoji/star.webp" alt="" width="74" height="74"><span></span>'); halo = el('div', 'm4-halo'); halo.setAttribute('aria-hidden', 'true'); fem = $('img', of1h); }
    if (!fbg){ fbg = el('div', 'm4-fbg'); fbg.setAttribute('aria-hidden', 'true'); D.body.insertBefore(fbg, D.body.firstChild); }
    if (mode !== feWas){
      feBack();
      res.appendChild(of1s); res.insertBefore(halo, res.firstChild);
      var v = $('#dvCmp') || $('#resultVideo'); if (v && v.parentNode === res) res.insertBefore(of1h, v.nextSibling); else res.appendChild(of1h);
      // the white card: with the offer, its blue button, its terms and the free save; otherwise the save (and the small link)
      (mode === 'of1' ? ['#dvCmpGo', '#dvOffer1', '#saveRow'] : mode === 'wm' ? ['#saveRow', '#dvCmpGo'] : ['#saveRow']).forEach(function(s){ var n = $(s); if (n){ of1Moved.push([n, n.parentNode, n.nextSibling]); of1s.appendChild(n); } });
    }
    // (25/11, owner: « y'a pas le bouton pour upload sur TikTok direct ? ») « Publier sur TikTok » (src/tiktok.js, shown where
    // TikTok is offered) in the same card, right under « Enregistrer »
    ttkIn();
    $('span', of1h).textContent = t('ready');
    // (26/11, owner) after « Enregistrer la vidéo »: « Retour au menu principal », at the end of the white card
    $('span', feHome).textContent = t('home'); if (feHome.parentNode !== of1s || feHome.nextSibling) of1s.appendChild(feHome);
    var pr = mode === 'of1' && P.of1();
    $('h3', of1s).innerHTML = pr ? esc(t('of1T', { p: '\u0001' })).replace('\u0001', '<b>' + esc(pr.today) + '</b>') : '';
    if (pr){
      var g = $('#dvCmpGo'); if (g){ var s = $('.m4-o1g', g); if (!s){ s = el('span', 'm4-o1g'); g.appendChild(s); } s.textContent = t('of1Go', { p: pr.today }); }
      var sv = $('#saveBtn'); if (sv){ var w = $('.m4-sw', sv); if (!w){ w = el('span', 'm4-sw'); sv.appendChild(w); } w.textContent = t('saveWm'); }
    }
    root.classList.add('m4fe'); root.classList.toggle('m4of1', mode === 'of1');
    if (!feWas) feParty();
  } else if (feWas || of1Moved.length){
    root.classList.remove('m4fe', 'm4of1'); feBack(); if (feHome) feHome.hidden = true;
    if (of1s) of1s.remove(); if (of1h) of1h.remove(); if (halo) halo.remove();
  }
  feWas = mode && res ? mode : '';
}
function ttkIn(){ var tk = $('#ttkPub'), sr = $('#saveRow'); if (tk && sr && of1s && sr.parentNode === of1s && tk.previousElementSibling !== sr) sr.after(tk); }
(function(){ var r = $('#result'); if (r) new MutationObserver(function(){ if (feWas) ttkIn(); }).observe(r, { childList: true }); })();
// the party, once when the screen comes: the mascot jumps in, confetti fall from the top (never with « reduce motion »)
function feParty(){
  if (M.calm()) return;
  (M.gsap ? M.gsap() : Promise.resolve()).then(function(){
    if (!root.classList.contains('m4fe')) return;
    var fx = el('div', 'm4-fx'); fx.setAttribute('aria-hidden', 'true'); var cols = ['#ffd23f', '#ff6b9a', '#5fe0a0', '#ffffff', '#8fd0ff', '#1f6fd6'];
    var tl = M.play(function(g){ var tl = g.timeline({ onComplete: function(){ fx.remove(); } });
      if (fem) tl.fromTo(fem, { scale: 0.3, rotation: -20, y: 30 }, { scale: 1, rotation: 0, y: 0, duration: 0.55, ease: 'back.out(2.4)', clearProps: 'transform' }, 0.1)
        .to(fem, { y: -12, duration: 0.22, ease: 'power2.out', yoyo: true, repeat: 3 }, 0.7);
      for (var i = 0; i < 46; i++){ var c = el('i'); c.style.left = (Math.random() * 100) + '%'; c.style.background = cols[i % cols.length]; fx.appendChild(c);
        tl.fromTo(c, { y: -30, x: 0, rotation: Math.random() * 360 }, { y: innerHeight + 60, x: (Math.random() - 0.5) * 140, rotation: '+=' + (360 + Math.random() * 360), duration: 1.6 + Math.random() * 1.1, ease: 'power1.in' }, Math.random() * 0.5); }
      return tl; });
    if (tl) D.body.appendChild(fx);
  });
}

/* ---- after a purchase: a sheet, the mascot glad, confetti, one button ------------------------------------------------------- */
function thxOn(){
  var box = $('#proThx'); if (!box || thx) return;
  var plan = P.plan(), pn = M.t('pl.n.' + plan), crea = plan === 'creator';
  thx = el('div', 'm4-thx', '<div class="m4-conf" aria-hidden="true"></div><img src="/emoji/love.webp" alt=""><h2></h2><p></p><button type="button" class="m4-cta m4-tg"></button><button type="button" class="m4-link m4-tp"></button>');
  $('h2', thx).innerHTML = esc(t('thxT', { plan: '\u0001' })).replace('\u0001', '<b>' + esc(String(pn).replace(/^Stalak\s+/i, '')) + '</b>');
  $('p', thx).textContent = t(crea ? 'thxPc' : 'thxP');
  $('.m4-tg', thx).textContent = t('thxGo'); $('.m4-tp', thx).textContent = t('thxPlan');
  box.appendChild(thx); root.classList.add('m4thx');
  $('.m4-tg', thx).onclick = function(){ P.thxClose(); M.hide(); var n = $('#tabBar [data-tab="new"]'); if (n) n.click(); };
  $('.m4-tp', thx).onclick = function(){ P.thxClose(); M.go('account'); };
  try { $('.m4-tg', thx).focus({ preventScroll: true }); } catch(e){}
  var cf = $('.m4-conf', thx), cols = ['#1f6fd6', '#ffffff', '#d6ecff', '#ffd23f', '#ff5fa2'];
  M.play(function(g){ var tl = g.timeline();
    tl.fromTo(thx, { yPercent: 100 }, { yPercent: 0, duration: 0.5, ease: 'power3.out', clearProps: 'transform' }, 0)
      .fromTo($('img', thx), { scale: 0.4, rotation: -12 }, { scale: 1, rotation: 0, duration: 0.6, ease: 'back.out(2.2)', clearProps: 'transform' }, 0.25);
    for (var i = 0; i < 46; i++){ var c = el('i'); c.style.left = (Math.random() * 100) + '%'; c.style.background = cols[i % cols.length]; cf.appendChild(c);
      tl.fromTo(c, { y: -30, rotation: Math.random() * 360 }, { y: innerHeight + 40, x: (Math.random() - 0.5) * 120, rotation: '+=' + (360 + Math.random() * 360), duration: 1.6 + Math.random() * 1.4, ease: 'power1.in' }, 0.1 + Math.random() * 0.6); }
    return tl; });
}
function thxOff(){ if (!thx) return; thx.remove(); thx = null; root.classList.remove('m4thx'); }

/* ---- what is shown ------------------------------------------------------------------------------------------------------- */
function sync(){
  if (!M.phone()){ root.classList.remove('m4', 'm4pw', 'm4pwall', 'm4help', 'm4thx', 'm4wm'); feOn(''); return; }
  build(); root.classList.add('m4'); addAgain();
  if (hh){ $('b', hh).textContent = t('hT'); $('span', hh).textContent = t('hS'); $('.m4-hb', hh).setAttribute('aria-label', t('back'));
    var lg = $('#helpLog'); if (lg && !lg.dataset.m4d){ var d = new Date(); lg.dataset.m4d = t('today') + ' · ' + d.toLocaleTimeString(M.lang() === 'fr' ? 'fr-FR' : 'en-US', { hour: '2-digit', minute: '2-digit' }); } }
  root.classList.toggle('m4help', !!($('#helpPanel') && !$('#helpPanel').hidden));
  var again = $('#m4Again span'); if (again) again.textContent = t('again');
  // the paywall: the plans page of someone without a plan
  var onPw = M.view() === 'pro' && !M.paid() && !!M.acct;
  if (onPw){ pwBuild(); root.classList.add('m4pw'); } else { root.classList.remove('m4pw', 'm4pwall'); }
  // the end of an export: the 1 € offer, or the save with the small link, or the save alone (a subscriber)
  var dv = $('#doneView'), o1 = $('#dvOffer1'), go = $('#dvCmpGo'), fin = !!(dv && !dv.hidden);
  var of = fin && !!(o1 && (!o1.hidden || (feWas === 'of1' && of1Moved.length)) && P.of1());
  var wm = fin && !of && !!(go && !go.hidden && !M.paid());
  feOn(!fin ? '' : of ? 'of1' : wm ? 'wm' : 'plain');
  root.classList.toggle('m4wm', wm);
  if (go){ var rw = $('.m4-rw', go); if (wm && !rw){ rw = el('span', 'm4-rw'); go.appendChild(rw); } if (rw){ if (wm) rw.textContent = t('rmWm'); else rw.remove(); } }
  // after a purchase
  if (P.thxOpen()) thxOn(); else thxOff();
}
M.on(sync); sync();
setTimeout(tuMaybe, 900);
W.addEventListener('stalak:onbdone', tuMaybe);
setInterval(function(){ if (!store.get('stalak:tuto') && W.__stalakOnbDone && !tu) tuMaybe(); }, 1500);
W.StalakM4 = { tutorial: tuOpen, sync: sync };
})();
