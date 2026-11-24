/* App & montage, refonte mobile, lot 3 (24/11): the editor in 4 steps and the camera (demo n° 7 and 11 of
   docs/audit/maquettes/mobile-2026-11-23/, validated by the owner on 23/11). Phones only (under 900 px), stalak.app only.
   Loaded by the app after itself, never on a computer: /assets/mobile3.<hash>.js. It carries its own style and its own
   words (FR / EN) and talks to the app through window.StalakM.ed (src/app.js).
   No setting of the editor disappears: the same controls (same ids, same listeners) are dressed and put in other places:
   - a top bar (back, 4 steps, the help ice cube), « Étape n sur 4 » and the step's question, one blue button at the bottom;
   - Son: TikTok / Clip, the song card (wave, handles, listen), « Changer de son »; start, end, length and the beat in a fold;
   - Prises: the takes as pictures (stars, sync, its buttons), « + », « Filmer une prise »;
   - the camera: its own full screen (song's progress, take number, timer, flash, big red button, « Terminer »);
   - Paroles: three big choices; the language, the .txt, the timing as before under them; the text's style goes to Montage;
   - Montage: the preview, the shots, 6 tools (Coupes, Effets, Filtres, Paroles, Remixer, Format) opening sheets.
   The yellow bubble of the mascot: the first time only. Under test (navigator.webdriver) it stays off unless the test asks
   (window.__stalakM3on), so the older tests keep the layout they know. */
(function(){
'use strict';
var M = window.StalakM, E = M && M.ed, D = document, W = window;
if (!M || !E || W.__stalakM3) return;
if (navigator.webdriver && !W.__stalakM3on) return;
W.__stalakM3 = 1;
var $ = function(s, r){ return (r || D).querySelector(s); }, $$ = function(s, r){ return Array.prototype.slice.call((r || D).querySelectorAll(s)); };
var root = D.documentElement;
function el(tag, cls, html){ var e = D.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
var store = { get: function(k){ try { return localStorage.getItem(k); } catch(e){ return null; } }, set: function(k, v){ try { localStorage.setItem(k, v); } catch(e){} } };

/* ---- words (the demo's own, word for word in French) ------------------------------------------------------------------ */
var TX = {
fr: { kick: 'Étape {n} sur 4', h1: 'Choisis ton passage', h2: 'Tes prises', s2: 'Plus tu en as, plus le montage est varié.', h3: 'Des paroles à l’écran ?',
  tip1: 'Glisse les deux poignées pour garder ton meilleur passage.', tip2: 'Filme le même passage sous plusieurs angles.',
  lyA: 'Automatiques', lyAs: 'Stalak écoute ton son et écrit tout.', lyP: 'Je colle mon texte', lyPs: 'Puis tu tapes le rythme avec ton pouce.',
  lyN: 'Sans paroles', lyNs: 'Tu pourras en ajouter plus tard.', rec: 'Filmer une prise', add: 'Importer des vidéos', more: 'Début, durée et rythme',
  cuts: 'Coupes', fx: 'Effets', filt: 'Filtres', ly: 'Paroles', mix: 'Remixer', fmt: 'Format', exp: 'Exporter ma vidéo',
  lyEdit: 'Modifier les paroles', fxNo: 'Les effets se posent dans un clip 16:9 (mode Clip).', back: 'Retour', help: 'Aide', close: 'Fermer',
  done: 'Terminer', steps: 'Étapes', take: 'Prise {n}', timer: 'Minuteur', timerOff: 'Sans', takes: 'Tes prises', play: 'Lecture' },
en: { kick: 'Step {n} of 4', h1: 'Pick your part', h2: 'Your takes', s2: 'The more you have, the more varied the edit.', h3: 'Lyrics on screen?',
  tip1: 'Drag the two handles to keep your best part.', tip2: 'Film the same part from several angles.',
  lyA: 'Automatic', lyAs: 'Stalak listens to your song and writes it all.', lyP: 'I paste my lyrics', lyPs: 'Then you tap the rhythm with your thumb.',
  lyN: 'No lyrics', lyNs: 'You can add some later.', rec: 'Film a take', add: 'Import videos', more: 'Start, length and beat',
  cuts: 'Cuts', fx: 'Effects', filt: 'Filters', ly: 'Lyrics', mix: 'Remix', fmt: 'Format', exp: 'Export my video',
  lyEdit: 'Edit the lyrics', fxNo: 'Effects are added in a 16:9 clip (Music video mode).', back: 'Back', help: 'Help', close: 'Close',
  done: 'Done', steps: 'Steps', take: 'Take {n}', timer: 'Timer', timerOff: 'Off', takes: 'Your takes', play: 'Play' }
};
function t(k, v){ var s = (TX[M.lang()] || TX.en)[k] || TX.en[k] || k; if (v) for (var x in v) s = s.split('{' + x + '}').join(v[x]); return s; }

/* ---- style: phones only, and only while this editor is on (html.m3) ---------------------------------------------------- */
var INK = '#0a0d14', BLUE = '#1f6fd6';
var CSS = '@media (max-width:899px){'
+ '.m3-bar,.m3-head,.m3-fade,.m3-tools,.m3-ly,.m3-tip,.m3-play,.m3-cam,.m3-sheet,.m3-scrim,.m3-more > summary{display:none}'
+ 'html.m3,html.m3 body{background:#d6ecff !important}html.m3 body{background-image:none !important}'
+ 'html.m3 .wrap > header,html.m3 .help-cube,html.m3 .nav [data-back],html.m3 #demoBtn,html.m3 .proof,html.m3 body > .ft,html.m3 body > .bands{display:none !important}'
+ 'html.m3 .wrap{padding-top:calc(70px + env(safe-area-inset-top,0px));padding-bottom:128px}'
/* the top bar */
+ 'html.m3 .m3-bar{display:flex;position:fixed;z-index:60;top:0;left:0;right:0;align-items:center;gap:10px;padding:max(10px,env(safe-area-inset-top,0px)) 16px 12px;background:linear-gradient(#d6ecff 72%,rgba(214,236,255,0))}'
+ '.m3-rd{flex:none;width:44px;height:44px;margin:0;padding:0;border-radius:50%;border:3px solid ' + INK + ';background:#fff;box-shadow:0 3px 0 ' + INK + ';display:grid;place-items:center;color:' + INK + ';cursor:pointer}'
+ '.m3-rd:active{transform:translateY(2px);box-shadow:0 1px 0 ' + INK + '}.m3-rd svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}'
+ '.m3-segs{flex:1;display:flex;gap:6px;margin:0;padding:0;list-style:none}.m3-segs li{flex:1;height:10px;border-radius:10px;border:2.5px solid ' + INK + ';background:#fff;transition:background-color .2s ease}.m3-segs li.on{background:' + BLUE + '}'
+ '.m3-cube{border-radius:13px;background:#eaf5ff;position:relative}.m3-cube::before,.m3-cube::after{content:"";position:absolute;top:15px;width:7px;height:10px;border-radius:4px;background:' + INK + '}.m3-cube::before{left:12px}.m3-cube::after{right:12px}'
/* the step's question, and the bottom button */
+ 'html.m3 .m3-head{display:block;margin:2px 2px 16px}.m3-k{margin:0;font:800 12.5px/1 var(--body);letter-spacing:.07em;text-transform:uppercase;color:' + BLUE + '}'
+ '.m3-h{margin:7px 0 0;font:400 28px/1.08 var(--display);color:' + INK + ';text-shadow:none;-webkit-text-stroke:0;text-wrap:balance}.m3-s{margin:7px 0 0;font:500 15px/1.4 var(--body);color:#3d4a63}.m3-s:empty{display:none}'
+ 'html.m3 .m3-fade{display:block;position:fixed;z-index:54;left:0;right:0;bottom:0;height:118px;background:linear-gradient(rgba(214,236,255,0),#d6ecff 42%);pointer-events:none}'
+ '.m3-nav{display:none !important}html.m3.m3s1 .m3-nav[data-m3="1"],html.m3.m3s2 .m3-nav[data-m3="2"],html.m3.m3s3 .m3-nav[data-m3="3"]{display:block !important}'
+ 'html.m3cam .m3-nav,html.m3cam .m3-fade,html.m3cam .m3-bar{display:none !important}'
+ 'html.m3 .m3-nav{position:fixed;z-index:55;left:16px;right:16px;bottom:max(16px,env(safe-area-inset-bottom,0px));margin:0;padding:0;display:block}'
+ 'html.m3 #p4 > .nav{display:none}html.m3 .nav{background:none !important;border:0 !important;box-shadow:none !important}html.m3 .nav::before,html.m3 .nav::after{display:none !important}html.m3 .installtip{display:none !important}'
+ 'html.m3 #next1,html.m3 #next2,html.m3 #next3,html.m3 #expFab .expbar-go{display:block;width:100%;min-height:60px;margin:0;border:3.5px solid ' + INK + ';border-radius:20px;background:' + BLUE + ';color:#fff;box-shadow:0 6px 0 ' + INK + ';font:400 21px/1 var(--display);letter-spacing:.01em;text-shadow:none}'
+ 'html.m3 #next1::before,html.m3 #next1::after,html.m3 #next2::before,html.m3 #next2::after,html.m3 #next3::before,html.m3 #next3::after,html.m3 #expFab .expbar-go::before,html.m3 #expFab .expbar-go::after{display:none !important}'
+ 'html.m3 #next1:active,html.m3 #next2:active,html.m3 #next3:active,html.m3 #expFab .expbar-go:active{transform:translateY(4px);box-shadow:0 2px 0 ' + INK + '}'
+ 'html.m3 #next1:disabled,html.m3 #next2:disabled{opacity:.45;box-shadow:0 6px 0 ' + INK + ';transform:none}'
+ 'html.m3 #expFab{position:fixed;z-index:55;left:16px;right:16px;bottom:max(16px,env(safe-area-inset-bottom,0px));display:flex;flex-direction:column-reverse;gap:6px;margin:0;padding:0;background:none;border:0;box-shadow:none}'
+ 'html.m3 #expFab[hidden]{display:none}html.m3 #expFab .expbar-go > span{display:none}html.m3 #expFab .expbar-go > .m3-el{display:inline}'
+ 'html.m3 #expFab .expbar-i{align-self:center;white-space:nowrap;font:600 12.5px/1.2 var(--body);color:#3d4a63;text-shadow:none}html.m3 #expFab .expbar-i br{display:none}'
/* cards without their chrome: the screen is the card */
+ 'html.m3 #p1 > .card:not(.lpoffer),html.m3 #p2 > .card,html.m3 #p3 > .card:not(#lyStyle),html.m3 #p4 > .card:not(:has(#expRow)){background:none;border:0;box-shadow:none;padding:0;margin:0 0 6px}'
+ 'html.m3 #p1 > .card:not(.lpoffer)::before,html.m3 #p1 > .card:not(.lpoffer)::after,html.m3 #p2 > .card::before,html.m3 #p2 > .card::after,html.m3 #p3 > .card:not(#lyStyle)::before,html.m3 #p3 > .card:not(#lyStyle)::after,html.m3 #p4 > .card:not(:has(#expRow))::before,html.m3 #p4 > .card:not(:has(#expRow))::after{display:none}'
+ 'html.m3 #p1 > .card:not(.lpoffer) > h2,html.m3 #p2 > .card > h2,html.m3 #p2 > .card > .hint:first-of-type,html.m3 #p3 > .card:not(#lyStyle) > h2,html.m3 #p4 > .card:not(:has(#expRow)) > h2{display:none}'
/* 1. Son */
+ 'html.m3 #p1 > .card:not(.lpoffer){display:flex;flex-direction:column}'
+ 'html.m3 #p1 .kindpick{order:0;margin:0 0 14px}html.m3 #p1 .kindpick > .label,html.m3 #kindHint{display:none}'
+ 'html.m3 #kindSeg{display:flex;width:100%;box-sizing:border-box}html.m3 #kindSeg button{flex:1;min-height:46px}'
+ 'html.m3 #songNear{order:1}html.m3 #songBox{order:2}html.m3 .m3-more{order:3}html.m3 #p1 .m3-tip{order:4}html.m3 #songDrop{order:5}'
+ 'html.m3 #songBox:not([hidden]){display:block;background:#fff;border:3px solid ' + INK + ';border-radius:22px;box-shadow:0 5px 0 ' + INK + ';padding:14px 14px 12px}'
+ 'html.m3 #songBox:not([hidden]){display:flex !important;flex-direction:column}html.m3 #songMeta{order:0;margin:0 !important;font-weight:700}html.m3 #songBox .wavebox{order:1}html.m3 #songBox .listen{order:2}'
+ 'html.m3 #songPlay,html.m3 #segPlay{min-height:44px;margin:0;padding:0 14px;border-width:2.5px;border-radius:14px;box-shadow:0 3px 0 ' + INK + ';font:700 15px/1 var(--body)}html.m3 #songPlay::before,html.m3 #songPlay::after,html.m3 #segPlay::before,html.m3 #segPlay::after{display:none !important}'
+ 'html.m3 #songBox .listen{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:10px 0 0}html.m3 #songBox .listen .btn{min-height:44px;padding:0 14px;font-size:15px}'
+ 'html.m3 #songBox .wavebox{order:-1;border-radius:14px;margin:10px 0 0}'
+ 'html.m3.m3song #songDrop{border:0 !important;background:none !important;box-shadow:none !important;padding:14px 0 4px;min-height:0;text-align:center}'
+ 'html.m3.m3song #songDrop > span,html.m3.m3song #songDrop .drop-eq,html.m3.m3song #songDrop .drop-dash{display:none}html.m3.m3song #songDrop strong{color:' + BLUE + ';font:700 16px/1.2 var(--body);text-decoration:underline;text-underline-offset:3px}'
+ 'html.m3 .m3-more{display:block;margin:14px 0 0;background:#fff;border:3px solid ' + INK + ';border-radius:18px;box-shadow:0 4px 0 ' + INK + ';padding:0 14px}'
+ 'html.m3 .m3-more > summary{display:flex;align-items:center;justify-content:space-between;min-height:50px;cursor:pointer;font:700 15.5px/1.2 var(--body);color:' + INK + ';list-style:none}'
+ 'html.m3 .m3-more > summary::-webkit-details-marker{display:none}html.m3 .m3-more > summary::after{content:"";width:9px;height:9px;border-right:3px solid ' + INK + ';border-bottom:3px solid ' + INK + ';transform:rotate(45deg) translate(-2px,-2px);transition:transform .2s ease}'
+ 'html.m3 .m3-more[open] > summary::after{transform:rotate(225deg)}html.m3 .m3-more[open]{padding-bottom:12px}html.m3 .m3-more .row{flex-wrap:wrap;row-gap:8px}'
/* the mascot's yellow bubble */
+ 'html.m3 .m3-tip{display:flex;align-items:flex-end;gap:8px;margin:18px 0 0}'
+ '.m3-tip i{flex:none;width:52px;height:60px;background:var(--mascot) center bottom/contain no-repeat}'
+ '.m3-tip p{margin:0 0 6px;max-width:230px;padding:10px 13px;border:3px solid ' + INK + ';border-radius:16px 16px 16px 4px;background:#ffd23f;box-shadow:0 4px 0 ' + INK + ';font:700 14px/1.3 var(--body);color:' + INK + '}'
/* 2. Prises */
+ 'html.m3 #p2 > .card{display:flex;flex-direction:column}html.m3 #takesNear{order:0}html.m3 .m3-grid{order:1}html.m3 #p2 .m3-tip{order:2}html.m3 #takeChoices{order:3}html.m3 #wSteps{order:4}html.m3 #p2 .brollbox{order:5}'
+ 'html.m3 .m3-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}html.m3 .m3-grid #takeList{display:contents}'
+ 'html.m3 .m3-grid > #wSteps{grid-column:1/-1;order:9;margin:6px 0 0}html.m3 .m3-grid > .m3-add{order:8}html.m3 .m3-grid > .nearbox{grid-column:1/-1}'
+ 'html.m3 .m3-grid li.empty{grid-column:1/-1;list-style:none;font:500 15px/1.4 var(--body);color:#3d4a63}'
+ 'html.m3 .m3-grid li.take{position:relative;list-style:none;aspect-ratio:9/16;min-height:0;margin:0;display:flex;flex-direction:column;justify-content:flex-end;gap:4px;padding:6px;border:3px solid ' + INK + ';border-radius:16px;overflow:hidden;background:linear-gradient(170deg,#1f4f9e,#0e1a33);box-shadow:0 4px 0 ' + INK + ';color:#fff}'
+ 'html.m3 .m3-grid li.take > *{position:relative;z-index:1}html.m3 .m3-grid li.take > .m3-th{position:absolute;inset:0;z-index:0;width:100%;height:100%;object-fit:cover}'
+ 'html.m3 .m3-grid li.take::after{content:"";position:absolute;inset:40% 0 0;z-index:0;background:linear-gradient(rgba(10,13,20,0),rgba(10,13,20,.85))}'
+ 'html.m3 .m3-grid li.take > div{width:100%;min-width:0;overflow:hidden}html.m3 .m3-grid li.take .dot{display:none}html.m3 .m3-grid li.take .name{font:800 13px/1.1 var(--body);color:#fff}'
+ 'html.m3 .m3-grid li.take .st{font:500 10.5px/1.25 var(--body);color:rgba(255,255,255,.85);display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}'
+ 'html.m3 .m3-grid li.take .qual{color:#ffd23f}html.m3 .m3-grid li.take .qual .off{color:rgba(255,255,255,.35)}'
+ 'html.m3 .m3-grid li.take .ctl{display:flex;flex-wrap:wrap;gap:4px}html.m3 .m3-grid li.take .ctl .btn{min-width:30px;min-height:30px;padding:0 6px;border-width:2px;border-radius:10px;font-size:14px;box-shadow:none}'
+ 'html.m3 .m3-add{aspect-ratio:9/16;display:grid;place-items:center;margin:0;padding:0;border:3px dashed ' + INK + ' !important;border-radius:16px;background:rgba(255,255,255,.6) !important;box-shadow:none !important;cursor:pointer;min-height:0}'
+ 'html.m3 .m3-add > *{display:none}html.m3 .m3-add::before{content:"+";font:400 44px/1 var(--display);color:' + BLUE + '}'
+ 'html.m3 #takeChoices{display:none}html.m3.m3s2:not(.m3cam) body > #takeChoices:not([hidden]){display:block;position:fixed;z-index:55;left:16px;right:16px;bottom:calc(max(16px,env(safe-area-inset-bottom,0px)) + 74px);margin:0}html.m3 #takeChoices[hidden]{display:none}'
+ 'html.m3.m3s2 .wrap{padding-bottom:200px}html.m3.m3s2 .m3-fade{height:190px}'
+ 'html.m3 #recOpen{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;min-height:56px;margin:0;padding:0 16px;border:3px solid ' + INK + ' !important;border-radius:18px;background:#fff !important;box-shadow:0 5px 0 ' + INK + ' !important}'
+ 'html.m3 #recOpen > strong,html.m3 #recOpen > span:not(.m3-rl){display:none}html.m3 #recOpen .m3-rl{font:400 20px/1 var(--display);color:' + INK + '}html.m3 #recOpen .m3-rl::before{content:"";display:inline-block;width:12px;height:12px;margin-right:9px;border-radius:50%;background:#e53935;vertical-align:1px}'
/* the camera: its own full screen */
+ 'html.m3cam body{overflow:hidden}html.m3cam #recPanel{position:fixed;inset:0;z-index:200;margin:0;padding:0;background:#0a0d14;display:block}'
+ 'html.m3cam #recPanel .recbox{position:absolute;inset:0;margin:0;max-width:none;width:auto;height:auto;aspect-ratio:auto;border:0;border-radius:0;box-shadow:none;background:#000}'
+ 'html.m3cam #recVideo{width:100%;height:100%;object-fit:cover;border-radius:0}'
+ 'html.m3cam #recPanel.flashring .recbox::after{content:"";position:absolute;inset:0;z-index:2;pointer-events:none;border:26px solid #fff;box-shadow:inset 0 0 60px 26px rgba(255,255,255,.9)}'
+ 'html.m3cam #recPanel .rectimer,html.m3cam #recPanel > .row{display:contents}html.m3cam #recPanel .rectimer > *{display:none}'
+ 'html.m3cam #recPanel > .hint{position:absolute;z-index:3;left:76px;right:76px;top:calc(env(safe-area-inset-top,0px) + 86px);margin:0 auto;max-width:300px;text-align:center;font:600 13px/1.35 var(--body);color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.7)}'
+ 'html.m3cam #recPanel[data-st="rec"] > .hint,html.m3cam #recPanel[data-st="cd"] > .hint{display:none}'
+ 'html.m3cam .m3-cam{display:block}'
+ '.m3-cp{position:absolute;z-index:4;left:16px;right:16px;top:max(10px,env(safe-area-inset-top,0px));height:6px;border-radius:6px;background:rgba(255,255,255,.3);overflow:hidden}.m3-cp i{display:block;height:100%;width:100%;background:#fff;transform-origin:0 50%;transform:scaleX(0)}'
+ '.m3-cb{position:absolute;z-index:4;width:48px;height:48px;margin:0;padding:0;border-radius:50%;border:2.5px solid #fff;background:rgba(10,13,20,.35);color:#fff;display:grid;place-items:center;font:700 14px/1 var(--body);cursor:pointer}'
+ '.m3-cb svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:2.6;stroke-linecap:round;stroke-linejoin:round}'
+ '.m3-cb[aria-pressed="true"]{background:#ffd23f;color:' + INK + ';border-color:#ffd23f}.m3-cb:disabled{opacity:.4}'
+ '.m3-cx{left:16px;top:calc(max(10px,env(safe-area-inset-top,0px)) + 20px)}'
+ '.m3-pill{position:absolute;z-index:4;left:50%;transform:translateX(-50%);top:calc(max(10px,env(safe-area-inset-top,0px)) + 26px);padding:8px 16px;border:2.5px solid #fff;border-radius:999px;background:rgba(10,13,20,.45);color:#fff;font:800 14px/1 var(--body);white-space:nowrap}'
+ '.m3-pill::before{content:"";display:inline-block;width:9px;height:9px;margin-right:8px;border-radius:50%;background:#e53935;vertical-align:1px}'
+ 'html.m3cam #recFlip{position:absolute;z-index:4;right:16px;top:calc(max(10px,env(safe-area-inset-top,0px)) + 20px);width:48px;height:48px;min-height:0;margin:0;padding:0;border-radius:50%;border:2.5px solid #fff;background:rgba(10,13,20,.35);box-shadow:none;color:transparent;font-size:0;overflow:hidden}'
+ 'html.m3cam #recFlip::after{content:"⟲";color:#fff;font:700 24px/44px var(--body)}'
+ '.m3-ct{right:16px;top:calc(max(10px,env(safe-area-inset-top,0px)) + 84px)}'
+ 'html.m3cam #recFlash{position:absolute;z-index:4;right:16px;top:calc(max(10px,env(safe-area-inset-top,0px)) + 144px);width:48px;height:48px;min-height:0;margin:0;padding:0;border-radius:50%;border:2.5px solid #fff;background:rgba(10,13,20,.35);box-shadow:none;color:transparent;font-size:0;overflow:hidden}'
+ 'html.m3cam #recFlash::after{content:"⚡";color:#fff;font:700 21px/44px var(--body)}html.m3cam #recFlash[aria-pressed="true"]{background:#ffd23f;border-color:#ffd23f}html.m3cam #recFlash[aria-pressed="true"]::after{color:' + INK + '}'
+ 'html.m3cam #recGo,html.m3cam #recStop,html.m3cam #recCancel{position:absolute;z-index:4;left:50%;bottom:max(26px,env(safe-area-inset-bottom,0px));transform:translateX(-50%);width:86px;height:86px;min-height:0;margin:0;padding:0;border-radius:50%;border:6px solid #fff;box-shadow:0 0 0 3px rgba(10,13,20,.5);color:transparent;font-size:0;overflow:hidden}'
+ 'html.m3cam #recGo{background:#e53935}html.m3cam #recGo:active{transform:translateX(-50%) scale(.94)}'
+ 'html.m3cam #recStop{background:rgba(10,13,20,.35)}html.m3cam #recStop::after{content:"";position:absolute;left:50%;top:50%;width:30px;height:30px;margin:-15px 0 0 -15px;border-radius:7px;background:#e53935}'
+ 'html.m3cam #recCancel{background:rgba(10,13,20,.35)}html.m3cam #recCancel::after{content:"✕";color:#fff;font:700 28px/74px var(--body)}'
+ 'html.m3cam #recClose{position:absolute;z-index:4;right:16px;bottom:calc(max(26px,env(safe-area-inset-bottom,0px)) + 22px);min-height:44px;margin:0;padding:0 18px;border:2.5px solid ' + INK + ';border-radius:999px;background:#fff;color:' + INK + ';box-shadow:0 3px 0 ' + INK + ';font:800 15px/1 var(--body);font-size:0}html.m3cam #recClose::after{content:attr(data-m3t);font:800 15px/1 var(--body)}'
+ 'html.m3cam #recPanel.busy #recClose,html.m3cam #recPanel.busy .m3-stack{display:none}'
+ '.m3-stack{position:absolute;z-index:4;left:20px;bottom:calc(max(26px,env(safe-area-inset-bottom,0px)) + 14px);width:50px;height:62px;margin:0;padding:0;border:3px solid #fff;border-radius:12px;background:linear-gradient(170deg,#1f4f9e,#0e1a33);box-shadow:5px -5px 0 -1px rgba(255,255,255,.55);cursor:pointer}'
+ '.m3-stack b{position:absolute;right:-10px;top:-10px;min-width:24px;height:24px;padding:0 5px;box-sizing:border-box;border-radius:12px;background:' + BLUE + ';border:2px solid #fff;color:#fff;font:800 12px/20px var(--body);text-align:center}'
+ 'html.m3cam #recCd{z-index:5}html.m3cam #recTime,html.m3cam #recN,html.m3cam #recCount{display:none !important}'
/* 3. Paroles */
+ 'html.m3.m3s3 #work .stage{display:none}html.m3.m3s3.m3lyw #work .stage{display:block}html.m3.m3s3.m3lyw #view{max-height:34svh}'
+ 'html.m3 #lyrMode{display:none}html.m3.m3s3 #lyStyle{display:none}'
+ 'html.m3 .m3-ly{display:flex;flex-direction:column;gap:12px;margin:0 0 16px}'
+ '.m3-ly button{display:flex;align-items:center;gap:14px;width:100%;margin:0;padding:14px;text-align:left;border:3px solid ' + INK + ';border-radius:20px;background:#fff;box-shadow:0 5px 0 ' + INK + ';color:' + INK + ';cursor:pointer}'
+ '.m3-ly button[aria-pressed="true"]{background:#eaf5ff;box-shadow:0 0 0 3px ' + BLUE + ',0 5px 0 ' + INK + '}.m3-ly button:active{transform:translateY(3px);box-shadow:0 2px 0 ' + INK + '}'
+ '.m3-ly i{flex:none;width:48px;height:48px;border-radius:14px;border:2.5px solid ' + INK + ';background:#eaf5ff;display:grid;place-items:center;font-size:22px;font-style:normal}'
+ '.m3-ly span{flex:1;min-width:0}.m3-ly b{display:block;font:400 19px/1.1 var(--display)}.m3-ly small{display:block;margin-top:4px;font:500 13.5px/1.35 var(--body);color:#3d4a63}'
+ '.m3-ly em{flex:none;align-self:center;padding:3px 7px;border-radius:7px;background:' + INK + ';color:#fff;font:800 10.5px/1 var(--body);font-style:normal;letter-spacing:.04em}'
/* 4. Montage */
+ 'html.m3.m3s4 #work .stage{position:relative;margin:0 auto 12px;text-align:center}html.m3.m3s4 #work .stage{background:none;border:0;box-shadow:none;padding:0}html.m3.m3s4 #tlHint,html.m3.m3s4 #pvNote{display:none}html.m3.m3s4 #view{max-height:34svh;width:auto !important;max-width:100%;border-radius:20px}'
+ 'html.m3.m3s4 #work .transport{display:none}'
+ 'html.m3.m3s4 .m3-play{display:grid;place-items:center;position:absolute;z-index:3;left:50%;top:calc(17svh - 32px);transform:translateX(-50%);width:64px;height:64px;margin:0;padding:0;border-radius:50%;border:3px solid ' + INK + ';background:#fff;box-shadow:0 4px 0 ' + INK + ';cursor:pointer;transition:opacity .2s ease}'
+ '.m3-play svg{width:24px;height:24px;fill:' + INK + '}html.m3.m3playing .m3-play{opacity:0}html.m3.m3playing .m3-play:focus-visible{opacity:1}'
+ 'html.m3 #p4 .grid2:not(:has(> *)){display:none}'
+ 'html.m3 .m3-tools{display:flex;gap:6px;justify-content:space-between;overflow-x:auto;scrollbar-width:none;margin:12px -4px 8px;padding:4px 4px 8px}html.m3 .m3-tools::-webkit-scrollbar{display:none}'
+ '.m3-tools button{flex:1 0 54px;display:flex;flex-direction:column;align-items:center;gap:6px;margin:0;padding:0;background:none;border:0;box-shadow:none;color:' + INK + ';font:700 12px/1.1 var(--body);cursor:pointer}'
+ '.m3-tools i{width:50px;height:50px;border-radius:16px;border:3px solid ' + INK + ';background:#fff;box-shadow:0 3px 0 ' + INK + ';display:grid;place-items:center;font-size:22px;font-style:normal}'
+ '.m3-tools button[aria-expanded="true"] i{background:' + BLUE + '}.m3-tools button:active i{transform:translateY(2px);box-shadow:0 1px 0 ' + INK + '}'
+ 'html.m3 .m3-scrim.on{display:block;position:fixed;inset:0;z-index:118;background:rgba(10,13,20,.35)}'
+ 'html.m3 .m3-sheet.on{display:block;position:fixed;z-index:120;left:0;right:0;bottom:0;max-height:74svh;overflow:auto;overscroll-behavior:contain;box-sizing:border-box;padding:12px 16px max(22px,env(safe-area-inset-bottom,0px));background:#fff;border-top:3px solid ' + INK + ';border-radius:26px 26px 0 0;box-shadow:0 -6px 0 rgba(10,13,20,.12)}'
+ '.m3-sh{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 12px}.m3-sh h3{margin:0;font:400 23px/1.1 var(--display);color:' + INK + '}'
+ '.m3-sheet .m3-rows > .label{display:block;margin:14px 0 7px;font:800 12.5px/1 var(--body);letter-spacing:.05em;text-transform:uppercase;color:#3d4a63}.m3-sheet .m3-rows > .label[hidden]{display:none}'
+ '.m3-sheet .m3-rows > .seg{display:flex;flex-wrap:wrap;width:100%;box-sizing:border-box}.m3-sheet .m3-rows > .seg[hidden]{display:none}.m3-sheet .m3-rows > .seg button{flex:1 1 auto;min-height:44px}'
+ '.m3-sheet #lyStyle{margin:0;padding:0;border:0;background:none;box-shadow:none}.m3-sheet #lyStyle::before,.m3-sheet #lyStyle::after,.m3-sheet #lyStyle > h2{display:none}'
+ '.m3-sheet #filtBox{margin:0}.m3-sheet .m3-note{margin:6px 0 0;font:500 15px/1.4 var(--body);color:#3d4a63}.m3-sheet .m3-note[hidden]{display:none}'
+ '.m3-go{display:block;width:100%;min-height:52px;margin:18px 0 0;border:3px solid ' + INK + ';border-radius:16px;background:#fff;box-shadow:0 4px 0 ' + INK + ';font:800 16px/1 var(--body);color:' + INK + ';cursor:pointer}'
+ 'html.m3 #cutBar:not([hidden]),html.m3 #fxBar:not([hidden]){position:fixed;z-index:56;left:12px;right:12px;bottom:calc(max(16px,env(safe-area-inset-bottom,0px)) + 92px);margin:0;padding:12px;background:#fff;border:3px solid ' + INK + ';border-radius:20px;box-shadow:0 5px 0 ' + INK + ';display:flex;flex-wrap:wrap;gap:6px}'
+ 'html.m3.m3s4 .wrap{padding-top:calc(62px + env(safe-area-inset-top,0px))}html.m3.m3s4 #work{margin-top:0;padding-top:0}'
+ '@media (max-height:700px){html.m3.m3s4 #view{max-height:27svh}html.m3.m3s4 .m3-play{top:calc(13.5svh - 28px);width:56px;height:56px}}'
+ '@media (prefers-reduced-motion:reduce){.m3-segs li,.m3-play,.m3-more > summary::after{transition:none}}'
+ '}';

/* ---- the pieces --------------------------------------------------------------------------------------------------------- */
var SVG_BACK = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M15 5l-7 7 7 7"/></svg>';
var SVG_X = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6L6 18"/></svg>';
var SVG_PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8 5.5v13l11-6.5z"/></svg>';
var SVG_PAUSE = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>';
var built = false, on = false, moved = [], bar, head, fade, tip, lyBox, tools, scrim, sheets = {}, cur = 0, playB, cam, stack, pill, cprog, ctimer, grid, addL, more;
/* a control moved somewhere else on a phone; put back where it was when the page becomes a computer's */
function move(node, into, before){ if (!node) return; moved.push([node, node.parentNode, node.nextSibling]); if (before) into.insertBefore(node, before); else into.appendChild(node); }
function moveBack(){ for (var i = moved.length - 1; i >= 0; i--){ var m = moved[i]; try { m[1].insertBefore(m[0], m[2] && m[2].parentNode === m[1] ? m[2] : null); } catch(e){} } moved = []; }
/* a label and its control in the grid of the Montage step (span.label just before) */
function pair(sel, into, before){ var c = $(sel); if (!c) return; var l = c.previousElementSibling; if (l && l.classList.contains('label')) move(l, into, before); move(c, into, before); }

function build(){
  if (built) return; built = true;
  var st = el('style'); st.textContent = CSS; D.head.appendChild(st);
  // the top bar
  bar = el('div', 'm3-bar'); bar.setAttribute('role', 'navigation');
  bar.innerHTML = '<button type="button" class="m3-rd m3-back">' + SVG_BACK + '</button><ol class="m3-segs"><li></li><li></li><li></li><li></li></ol><button type="button" class="m3-rd m3-cube"></button>';
  D.body.appendChild(bar);
  $('.m3-back', bar).onclick = backTap;
  $('.m3-cube', bar).onclick = function(){ var h = $('#helpBtn'); if (h) h.click(); };
  head = el('div', 'm3-head', '<p class="m3-k"></p><h1 class="m3-h"></h1><p class="m3-s"></p>');
  fade = el('div', 'm3-fade'); D.body.appendChild(fade);
  tip = el('div', 'm3-tip', '<i aria-hidden="true"></i><p></p>');
  // 1. the settings of the passage and the beat, in a fold under the song
  more = el('details', 'm3-more', '<summary></summary>');
  var box = $('#songBox'); if (box) box.parentNode.insertBefore(more, box.nextSibling);
  // 2. the takes as a grid of pictures, with « + »
  grid = el('div', 'm3-grid'); var tl = $('#takeList'); if (tl) tl.parentNode.insertBefore(grid, tl);
  addL = $('#takeChoices label.drop[for="takeFiles"]');
  var ro = $('#recOpen'); if (ro && !$('.m3-rl', ro)) ro.appendChild(el('span', 'm3-rl'));
  // the camera's own screen: progress of the song, close, take number, timer, the stack of takes
  cam = el('div', 'm3-cam', '<div class="m3-cp"><i></i></div><button type="button" class="m3-cb m3-cx">' + SVG_X + '</button><div class="m3-pill" aria-live="polite"></div>'
    + '<button type="button" class="m3-cb m3-ct"></button><button type="button" class="m3-stack"><b></b></button>');
  var rp = $('#recPanel'); if (rp) rp.appendChild(cam);
  cprog = $('.m3-cp i', cam); pill = $('.m3-pill', cam); ctimer = $('.m3-ct', cam); stack = $('.m3-stack', cam);
  $('.m3-cx', cam).onclick = stack.onclick = function(){ var c = $('#recClose'); if (c) c.click(); };
  ctimer.onclick = function(){ var v = E.timer(), n = v === 0 ? 3 : v === 3 ? 5 : 0; E.timerSet(n); camUi(); };
  // 3. the three choices of lyrics
  lyBox = el('div', 'm3-ly', '<button type="button" data-m="auto"><i aria-hidden="true">✨</i><span><b></b><small></small></span><em hidden>PRO</em></button>'
    + '<button type="button" data-m="paste"><i aria-hidden="true">📝</i><span><b></b><small></small></span></button>'
    + '<button type="button" data-m="none"><i aria-hidden="true">🚫</i><span><b></b><small></small></span></button>');
  var lm = $('#lyrMode'); if (lm) lm.parentNode.insertBefore(lyBox, lm);
  $$('button', lyBox).forEach(function(b){ b.onclick = function(){ var o = $('#lyrMode button[data-mode="' + b.dataset.m + '"]'); if (o) o.click(); lyUi(); }; });
  // 4. the play button over the preview, the 6 tools and their sheets
  var stage = $('#work .stage'); if (stage){ playB = el('button', 'm3-play'); playB.type = 'button'; stage.appendChild(playB); playB.onclick = function(){ var p = $('#playBtn'); if (p) p.click(); }; }
  tools = el('div', 'm3-tools'); tools.setAttribute('role', 'toolbar');
  [['cuts', '✂️'], ['fx', '⚡'], ['filt', '🎨'], ['ly', '💬'], ['mix', '🔀'], ['fmt', '📐']].forEach(function(x){
    var b = el('button', null, '<i aria-hidden="true">' + x[1] + '</i><span></span>'); b.type = 'button'; b.dataset.tool = x[0];
    if (x[0] !== 'mix'){ b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-controls', 'm3Sh_' + x[0]); }
    b.onclick = function(){ if (x[0] === 'mix'){ var s = $('#shuffleBtn'); if (s) s.click(); return; } sheet(cur === x[0] ? 0 : x[0]); };
    tools.appendChild(b);
  });
  var tlw = $('#p4 .tlwrap'), th = $('#tlHint'); if (th) th.parentNode.insertBefore(tools, th); else if (tlw) tlw.parentNode.insertBefore(tools, tlw.nextSibling);
  scrim = el('div', 'm3-scrim'); scrim.onclick = function(){ sheet(0); }; D.body.appendChild(scrim);
  ['cuts', 'fx', 'filt', 'ly', 'fmt'].forEach(function(k){
    var s = el('section', 'm3-sheet', '<div class="m3-sh"><h3></h3><button type="button" class="m3-rd">' + SVG_X + '</button></div><div class="m3-rows"></div>');
    s.id = 'm3Sh_' + k; s.setAttribute('role', 'dialog'); s.setAttribute('aria-modal', 'true'); $('.m3-rd', s).onclick = function(){ sheet(0); };
    D.body.appendChild(s); sheets[k] = s;
  });
  $('.m3-rows', sheets.fx).appendChild(el('p', 'm3-note m3-fxno'));
  var lg = el('button', 'm3-go m3-lyedit'); lg.type = 'button'; lg.onclick = function(){ sheet(0); E.go(3); }; $('.m3-rows', sheets.ly).appendChild(lg);
  var eb = $('#expFab .expbar-go'); if (eb && !$('.m3-el', eb)) eb.appendChild(el('span', 'm3-el'));
  // what changes by itself: the takes, the camera, the lyrics' screens, the play button, the time of a take
  var mo = new MutationObserver(function(){ if (on) refresh(); });
  ['#takeList', '#recPanel', '#lyEdit', '#tapZone', '#playBtn', '#recTime', '#songBox', '#fxSeg', '#expFab', '#recGo'].forEach(function(s){ var n = $(s); if (n) mo.observe(n, { attributes: true, childList: true, characterData: true, subtree: s === '#takeList' || s === '#playBtn' || s === '#recTime' }); });
  D.addEventListener('keydown', function(e){ if (e.key === 'Escape' && cur){ e.stopPropagation(); sheet(0); } }, true);
}
/* the controls go to their phone places (and back to their own on a computer) */
var placed = false;
function place(){
  if (placed) return; placed = true;
  var box = $('#songBox'); if (box){ move($('.row', box), more); move($('#waveHint'), more); move($('#beatFix'), more); }
  move($('#takeList'), grid); if (addL){ move(addL, grid); addL.classList.add('m3-add'); }
  var R = function(k){ return $('.m3-rows', sheets[k]); };
  pair('#modeSeg', R('cuts')); pair('#paceSeg', R('cuts')); var best = $('label[for="bestChk"]'); if (best){ var bl = best.previousElementSibling; if (bl && bl.classList.contains('label')) move(bl, R('cuts')); move(best, R('cuts')); }
  pair('#brollSeg', R('cuts'));
  pair('#fxSeg', R('fx'), $('.m3-fxno', sheets.fx)); move($('#fxHint'), R('fx'), $('.m3-fxno', sheets.fx));
  move($('#filtBox'), R('filt'));
  move($('#lyStyle'), R('ly'), $('.m3-lyedit', sheets.ly));
  pair('#kindSeg4', R('fmt')); pair('#fmtSeg', R('fmt')); pair('#frameSeg', R('fmt'));
  // what stays at the bottom of the screen, and the camera, leave their step: a step glides in with a transform, which
  // would hold them inside it; each one is shown only with its step (html.m3s1…)
  [['#p1 > .nav', 1], ['#p2 > .nav', 2], ['#p3 > .nav', 3]].forEach(function(x){ var n = $(x[0]); if (n){ n.dataset.m3 = String(x[1]); n.classList.add('m3-nav'); move(n, D.body); } });
  move($('#takeChoices'), D.body); move($('#recPanel'), D.body); move($('#cutBar'), D.body); move($('#fxBar'), D.body);
}
function unplace(){ if (!placed) return; placed = false; moveBack(); if (addL) addL.classList.remove('m3-add'); $$('.m3-nav').forEach(function(n){ n.classList.remove('m3-nav'); }); }
function backTap(){ var s = E.step(); if (s > 1) E.go(s - 1); else { var h = $('#homeBtn'); if (h) h.click(); } }

/* a sheet of the Montage step: k, or none (0) */
function sheet(k){
  var was = cur; cur = k;
  Object.keys(sheets).forEach(function(x){ sheets[x].classList.toggle('on', x === k); });
  scrim.classList.toggle('on', !!k);
  $$('button[data-tool]', tools).forEach(function(b){ if (b.dataset.tool !== 'mix') b.setAttribute('aria-expanded', String(b.dataset.tool === k)); });
  if (k){ sheetUi(k); M.play(function(g){ return g.fromTo(sheets[k], { yPercent: 100 }, { yPercent: 0, duration: 0.28, ease: 'power3.out', clearProps: 'transform' }); }); try { $('.m3-rd', sheets[k]).focus({ preventScroll: true }); } catch(e){} }
  else if (was){ var b = $('button[data-tool="' + was + '"]', tools); try { b && b.focus({ preventScroll: true }); } catch(e){} }
}
function sheetUi(k){
  var s = sheets[k]; if (!s) return; $('h3', s).textContent = t(k);
  if (k === 'fx'){ var fs = $('#fxSeg'), no = $('.m3-fxno', s); no.hidden = !!(fs && !fs.hidden); no.textContent = t('fxNo'); }
  if (k === 'ly') $('.m3-lyedit', s).textContent = t('lyEdit');
}

/* ---- what is shown, step by step ----------------------------------------------------------------------------------------- */
function seen(n){ return store.get('stalak:m3tip' + n) === '1'; }
function tipAt(n, into, before){
  if (!into) return; if (before && before.parentNode !== into) before = null;
  if (seen(n)){ if (tip.parentNode) tip.remove(); return; }
  $('p', tip).textContent = t('tip' + n);
  if (tip.parentNode !== into || tip.dataset.n !== String(n)){ tip.dataset.n = String(n); if (before) into.insertBefore(tip, before); else into.appendChild(tip);
    M.play(function(g){ return g.fromTo(tip, { opacity: 0, y: 14, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(2)', clearProps: 'opacity,transform' }); }); }
  if (!tip.dataset.at || tip.dataset.n !== String(n)) tip.dataset.at = String(Date.now());
}
/* shown once: seen when the step is left after it was on screen a moment (a step crossed in passing does not count) */
function tipSeen(s){ var n = tip.dataset.n; if (!tip.parentNode || !n || n === String(s)) return; if (Date.now() - (+tip.dataset.at || 0) > 1500) store.set('stalak:m3tip' + n, '1'); tip.remove(); tip.dataset.at = ''; }
function lyUi(){
  var m = E.lyr(); $$('button', lyBox).forEach(function(b){ b.setAttribute('aria-pressed', String(b.dataset.m === m)); });
  var k = { auto: 'lyA', paste: 'lyP', none: 'lyN' };
  $$('button', lyBox).forEach(function(b){ $('b', b).textContent = t(k[b.dataset.m]); $('small', b).textContent = t(k[b.dataset.m] + 's'); });
  var pro = $('em', lyBox); if (pro) pro.hidden = E.can('lyrics');
  var w = ($('#lyEdit') && !$('#lyEdit').hidden) || ($('#tapZone') && !$('#tapZone').hidden); root.classList.toggle('m3lyw', !!w);
}
function thumbs(){
  var tk = E.takes(); $$('#takeList li.take').forEach(function(li, i){
    var x = tk[i]; if (!x) return; var c = $('.m3-th', li);
    if (!c){ c = el('canvas', 'm3-th'); c.width = 180; c.height = 320; c.setAttribute('aria-hidden', 'true'); li.insertBefore(c, li.firstChild); }
    var v = x.el; if (!v || v.readyState < 2 || !v.videoWidth){ if (!c.dataset.ok) setTimeout(function(){ if (on && E.step() === 2) thumbs(); }, 900); return; }
    try { var g = c.getContext('2d'), r = Math.max(c.width / v.videoWidth, c.height / v.videoHeight), w = v.videoWidth * r, h = v.videoHeight * r;
      g.drawImage(v, (c.width - w) / 2, (c.height - h) / 2, w, h); c.dataset.ok = '1'; } catch(e){}
  });
}
var camRaf = 0;
function camUi(){
  var v = E.timer(); ctimer.textContent = v ? v + ' s' : '⏱';
  var rc = $('#recClose'); if (rc) rc.dataset.m3t = t('done'); ctimer.setAttribute('aria-label', t('timer') + ' : ' + (v ? v + ' s' : t('timerOff')));
  ctimer.disabled = E.rec() !== 'idle';
  var rt = $('#recTime'), time = rt && !rt.hidden ? rt.textContent.trim() : '';
  pill.textContent = t('take', { n: E.take() }) + (time ? ' · ' + time : '');
  var n = E.takes().filter(function(x){ return !x.demo; }).length; $('b', stack).textContent = String(n); stack.hidden = !n; stack.setAttribute('aria-label', t('takes') + ' : ' + n);
  $('.m3-cx', cam).setAttribute('aria-label', t('close'));
}
function camLoop(){ cancelAnimationFrame(camRaf); var go = function(){ if (!root.classList.contains('m3cam')) return; cprog.style.transform = 'scaleX(' + E.recPos() + ')'; camRaf = requestAnimationFrame(go); }; go(); }

function refresh(){
  var s = E.step();
  root.classList.toggle('m3song', E.song());
  // the bar and the question of the step
  $$('.m3-segs li', bar).forEach(function(li, i){ li.classList.toggle('on', i < s); });
  $('.m3-segs', bar).setAttribute('aria-label', t('steps') + ' : ' + t('kick', { n: s }));
  $('.m3-back', bar).setAttribute('aria-label', t('back')); $('.m3-cube', bar).setAttribute('aria-label', t('help'));
  var into = s === 1 ? $('#p1 > .card:not(.lpoffer)') : s === 2 ? $('#p2 > .card') : s === 3 ? $('#p3') : $('#p4');
  if (s === 4){ if (head.parentNode) head.remove(); }
  else if (into){ $('.m3-k', head).textContent = t('kick', { n: s }); $('.m3-h', head).textContent = t('h' + s); $('.m3-s', head).textContent = s === 2 ? t('s2') : '';
    if (head.parentNode !== into) into.insertBefore(head, into.firstChild); }
  var sd = $('#songDrop'); if (sd && sd.parentNode) sd.parentNode.appendChild(sd);
  more.hidden = !E.song(); $('summary', more).textContent = t('more');
  // the bubble, the first time a step is seen with something to do
  tipSeen(s);
  if (s === 1 && E.song()) tipAt(1, $('#p1 > .card:not(.lpoffer)'), $('#songDrop'));
  else if (s === 2) tipAt(2, $('#p2 > .card'), null);
  var rl = $('#recOpen .m3-rl'); if (rl) rl.textContent = t('rec'); if (addL) addL.setAttribute('aria-label', t('add'));
  if (s === 2) thumbs();
  // the camera
  var c = !!($('#recPanel') && !$('#recPanel').hidden);
  if (c !== root.classList.contains('m3cam')){ root.classList.toggle('m3cam', c); if (c) camLoop(); }
  if (c) camUi();
  if (s === 3) lyUi(); else root.classList.remove('m3lyw');
  // Montage: the tools, the play button, the export button's words
  $$('button[data-tool]', tools).forEach(function(b){ $('span', b).textContent = t(b.dataset.tool); });
  if (playB){ var pl = E.playing(); playB.innerHTML = pl ? SVG_PAUSE : SVG_PLAY; playB.setAttribute('aria-label', $('#playBtn') ? $('#playBtn').textContent.trim() : t('play')); root.classList.toggle('m3playing', pl); }
  var el2 = $('#expFab .m3-el'); if (el2) el2.textContent = t('exp');
  if (cur) sheetUi(cur);
  if (s !== 4 && cur) sheet(0);
}

/* ---- on and off: a phone in the editor (steps 1 to 4, not the end of an export) -------------------------------------------- */
function sync(){
  var want = M.phone() && root.classList.contains('medit') && !E.done() && !M.view();
  if (want && !built) build();
  if (want) place();
  if (want !== on){ on = want; root.classList.toggle('m3', on); if (!on){ sheet(0); root.classList.remove('m3cam', 'm3song', 'm3lyw', 'm3playing'); } }
  if (on){ ['m3s1', 'm3s2', 'm3s3', 'm3s4'].forEach(function(c, i){ root.classList.toggle(c, E.step() === i + 1); }); refresh(); }
  // a computer again (the window made wider): everything back in its place
  if (!M.phone()) unplace();
}
M.on(sync); sync();
W.addEventListener('pageshow', sync);
W.StalakM3 = { sheet: sheet, on: function(){ return on; }, sync: sync };
})();
