/* Studio Chambre — what every episode shares : the room, Yanis's default state, arm poses, overlays.
   (Marketing & croissance, 15/11/2026) */
const { yanis, maman, banquise, chicken, star, line: pline } = PERSO;
const { bedroomBack, desk, laptopScreen, phoneFrame, chat, lock, stalakScreen, blackLyrics, endCard, K, snow, box, txt, PH } = DECOR;
const { clamp, seg, E, spring, noise, blink, B, mouth, speaking, layer, camAt, shake, punch, title, stamp, steps, flash, esc, banner, label, design } = PLAY;
const STYLE = new URLSearchParams(location.search).get('style') || 'A';
const NECK = [540, 1010];           // where Yanis sits, behind the desk (wide shot coordinates)
const BEAT = 60 / 140;              // the series beat : 140 BPM

// arm poses, in Yanis's coordinates (shoulders at ±192, 92 ; the desk top is at y ≈ 370)
const ARMS = {
  desk: { L: { W: [-176, 352], hand: 'fist' }, R: { W: [176, 352], hand: 'fist' } },
  head: { L: { W: [-150, -262], hand: 'open', bend: 1 }, R: { W: [150, -262], hand: 'open', bend: -1 } },
  cheeks: { L: { W: [-176, -150], hand: 'open', bend: 1 }, R: { W: [176, -150], hand: 'open', bend: -1 } },
  headphone: { L: { W: [-236, 150], hand: 'open' }, R: { W: [176, -172], hand: 'open', bend: -1 } },
  point: { L: { W: [-176, 352], hand: 'fist' }, R: { W: [292, 40], hand: 'point', bend: 1 } },
  pointUp: { L: { W: [-176, 352], hand: 'fist' }, R: { W: [250, -160], hand: 'point', bend: 1 } },
  up: { L: { W: [-300, -210], hand: 'fist', bend: 1 }, R: { W: [300, -210], hand: 'fist', bend: -1 } },
  thumb: { L: { W: [-176, 352], hand: 'fist' }, R: { W: [250, 60], hand: 'thumb', bend: 1 } },
  shrug: { L: { W: [-320, 130], hand: 'open', bend: -1 }, R: { W: [320, 130], hand: 'open', bend: 1 } },
  phone: { L: { W: [-70, 250], hand: 'fist', bend: -1 }, R: { W: [70, 250], hand: 'fist', bend: 1 } },
  chin: { L: { W: [-176, 352], hand: 'fist' }, R: { W: [60, -40], hand: 'fist', bend: 1 } },
  facepalm: { L: { W: [-176, 352], hand: 'fist' }, R: { W: [40, -150], hand: 'open', bend: 1 } },
  slam: { L: { W: [-140, 330], hand: 'open' }, R: { W: [140, 330], hand: 'open' } },
  cross: { L: { W: [120, 230], hand: 'fist', bend: 1 }, R: { W: [-120, 250], hand: 'fist', bend: -1 } },
};
// blend two poses (k : 0 → a, 1 → b)
function mixArms(a, b, k) {
  const out = {};
  ['L', 'R'].forEach(sd => {
    const A = a[sd], Bq = b[sd];
    out[sd] = Object.assign({}, k < 0.5 ? A : Bq, { W: [A.W[0] + (Bq.W[0] - A.W[0]) * k, A.W[1] + (Bq.W[1] - A.W[1]) * k] });
  });
  return out;
}
// Yanis at time t : breathing, blinking, the mouth follows his voice
function yState(D, t, o = {}) {
  const sp = speaking(D, 'yanis', t), open = mouth(D, 'yanis', t);
  const face = Object.assign({ eyes: 'open', brows: 'neutral', mouth: o.rest || 'closed', gaze: [0, 0], blink: blink(t, 3) }, o.face || {});
  if (sp && !o.keepMouth) { face.mouth = 'talk'; face.open = open; }
  if (face.eyes === 'happy' || face.eyes === 'closed') face.blink = 0;
  return Object.assign({
    face, breath: Math.sin(t * 2.1), headRot: Math.sin(t * 1.3) * 1.2 + (sp ? open * 3 : 0), headDY: sp ? -open * 7 : 0,
    arms: o.arms || ARMS.desk,
  }, o.st || {});
}
function yDraw(st, at = NECK, sc = 1) { return `<g transform="translate(${at[0]},${at[1]}) scale(${sc})">${yanis(st, STYLE, 'y')}</g>`; }

// the room, with Yanis between the wall and the desk ; o : {y (state), door, hall, window, desk, behind, front, noYanis}
function room(t, cam, o = {}) {
  let s = layer(bedroomBack({ t, door: o.door || 0, hall: o.hall || '', window: o.window || '', day: o.day }), 0.82, cam);
  if (o.behind) s += layer(o.behind, 0.95, cam);
  if (!o.noYanis) s += layer(yDraw(o.y, o.at || NECK, o.sc || 1), 1, cam);
  s += layer(desk(Object.assign({ t }, o.desk || {})), 1.1, cam);
  if (o.front) s += layer(o.front, 1.1, cam);
  return s;
}
// overlays : darkness (night), a cold freeze, a vignette
const OVER = {
  night: (k = 1) => `<rect x="-100" y="-100" width="1280" height="2120" fill="#040a1c" opacity="${(0.4 * k).toFixed(2)}"/><rect x="-100" y="-100" width="1280" height="2120" fill="url(#vig)" opacity="${(0.6 * k).toFixed(2)}"/>`,
  freeze: (k = 1) => `<rect x="-100" y="-100" width="1280" height="2120" fill="#8fd3ff" opacity="${(0.28 * k).toFixed(2)}"/>` +
    `<rect x="-100" y="-100" width="1280" height="2120" fill="url(#vig)" opacity="${k.toFixed(2)}"/>`,
  vig: (k = 1) => `<rect x="-100" y="-100" width="1280" height="2120" fill="url(#vig)" opacity="${k.toFixed(2)}"/>`,
};
const EXTRA_DEFS = `<radialGradient id="vig" cx="50%" cy="45%" r="75%"><stop offset="55%" stop-color="#0a0d14" stop-opacity="0"/><stop offset="100%" stop-color="#0a0d14" stop-opacity="0.55"/></radialGradient>`;
// the mascot of Stalak : one of its official stickers (site_src/emoji), popping in
function mascot(name, x, y, size, k, wob = 0) {
  const sc = 0.2 + 0.8 * k;
  return `<g transform="translate(${x},${y}) rotate(${(wob).toFixed(2)}) scale(${sc.toFixed(3)})"><image href="/site_src/emoji/${name}.webp" x="${-size / 2}" y="${-size / 2}" width="${size}" height="${size}"/></g>`;
}
// the end card : logo, stalak.app, free in the browser, the next episode
function ending(t, b, tease, epNum) {
  const k = t - b.t0;
  const svg = endCard({ t, k: E.back(seg(k, 0.05, 0.45)) }) + mascot('hello', 230, 640, 240, E.back(seg(k, 0.35, 0.7)), Math.sin(t * 3) * 4);
  let ui = '';
  const a = spring(t, b.t0 + 0.25, 300, 22);
  ui += `<div class="serie" style="top:250px;opacity:${Math.min(1, a).toFixed(2)}">STUDIO CHAMBRE · ÉPISODE ${epNum}</div>`;
  ui += `<div class="endurl" style="top:930px;transform:translateX(-50%) scale(${(0.7 + 0.3 * Math.min(1.1, spring(t, b.t0 + 0.3, 420, 24))).toFixed(3)})">stalak.app</div>`;
  const c = spring(t, b.t0 + 0.55, 420, 26);
  ui += `<div class="endsub" style="top:1080px;opacity:${Math.min(1, c * 1.4).toFixed(2)};transform:translateX(-50%) translateY(${((1 - c) * 30).toFixed(1)}px)">Gratuit, dans ton navigateur</div>`;
  const d = spring(t, b.t0 + 0.9, 380, 26);
  ui += `<div class="tease" style="top:1230px;opacity:${Math.min(1, d * 1.4).toFixed(2)};transform:translateX(-50%) translateY(${((1 - d) * 40).toFixed(1)}px)"><small>PROCHAIN ÉPISODE</small>${esc(tease)}</div>`;
  return { svg, ui, noWatermark: true };
}
// Stalak on the phone : the real screens of the app (site_src/aide), a little smaller so the steps fit above
const SHOTS = { song: ['fr-song.jpg', 1007], takes: ['fr-takes.jpg', 916], edit: ['fr-edit.jpg', 977], export: ['fr-export.jpg', 916] };
function stalakPhone(t, which, o = {}) {
  const [img, h] = SHOTS[which];
  const sc = o.sc || 0.78, cx = o.cx || 540, cy = o.cy || 1190;
  const inner = phoneFrame(stalakScreen({ img, h, scroll: o.scroll || 0 }), { bg: K.sky });
  return `<g transform="translate(${cx},${cy}) scale(${sc}) translate(-540,-930) rotate(${(o.rot || 0).toFixed(2)} 540 930)">${inner}</g>`;
}
