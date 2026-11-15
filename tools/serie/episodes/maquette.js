/* Studio Chambre — the mock-up in still images (décision du 15/11 à 21 h 51 : characters and sets are validated
   as stills before any voice or video). Same drawing code as the episodes : what the owner validates is what will move.
   play.html?ep=maquette&shot=<name>[&style=A|B|C][&ui=1|2|3][&clean=1]
   (Marketing & croissance, 15/11/2026) */
(function () {
  const q = new URLSearchParams(location.search);
  const T = 0.3;            // a still : no blink at this time
  const OLD = T - 5;        // a start long ago : every spring is at rest
  const CLEAN = q.get('clean') === '1';
  const sub = (D, who, text) => { D.subs = CLEAN ? [] : [{ t0: OLD, t1: 99, who, text }]; };
  const still = (o) => Object.assign({ breath: 0, headRot: 0, headDY: 0 }, o || {});
  const SKY = (t) => `<rect x="-200" y="-200" width="1480" height="2320" fill="${K.sky}"/>` + snow(t, 0, 0, 1080, 1920, 40, 9, 11);
  const ICE = (t) => `<rect x="-200" y="-200" width="1480" height="2320" fill="${K.ice}"/>` + snow(t, 0, 0, 1080, 1920, 36, 4, 10);
  const Z = { z: 1, x: 540, y: 960, r: 0 };

  // Yanis's poses (portraits, expressions and scenes)
  const POSES = {
    fier: { face: { eyes: 'happy', brows: 'proud', mouth: 'grin' }, arms: ARMS.thumb, st: { sparkle: 1 } },
    crie: { face: { eyes: 'wide', brows: 'worried', mouth: 'O', open: 1, sweat: 1 }, arms: ARMS.cheeks },
    fatigue: { face: { eyes: 'half', brows: 'sad', mouth: 'flat', bags: true, gaze: [0, 0.4] }, arms: ARMS.chin, st: { headRot: -5, headDY: 8 } },
    ebahi: { face: { eyes: 'wide', brows: 'up', mouth: 'O', open: 0.55 }, arms: ARMS.desk },
    smirk: { face: { eyes: 'open', brows: 'smirk', mouth: 'smirk', gaze: [0.35, 0] }, arms: ARMS.cross },
    chut: { face: { eyes: 'open', brows: 'proud', mouth: 'closed', gaze: [0.5, 0] }, arms: { L: ARMS.desk.L, R: { W: [22, -24], hand: 'point', bend: -1 } } },
    rap: { face: { eyes: 'closed', brows: 'proud', mouth: 'talk', open: 0.6 }, arms: ARMS.headphone, st: { headphones: 'ears' } },
    fache: { face: { eyes: 'open', brows: 'angry', mouth: 'frown' }, arms: ARMS.slam },
  };
  const yPose = (D, name, extra) => {
    const P = POSES[name];
    return yState(D, T, { face: Object.assign({}, P.face, (extra || {}).face), arms: (extra || {}).arms || P.arms, st: still(Object.assign({}, P.st, (extra || {}).st)) });
  };
  const momState = (o = {}) => Object.assign({
    face: { eyes: 'open', mouth: 'talk', open: 0.9, brows: 'angry' },
    arms: { L: { W: [-170, 420], hand: 'fist' }, R: { W: [236, -86], hand: 'fist', prop: chicken(PERSO.STYLES[STYLE] || PERSO.STYLES.A) } },
  }, o);
  // Maman standing in the doorway (drawn inside the door opening of the room)
  const momInDoor = (st) => `<rect x="40" y="470" width="300" height="980" fill="#ffe2a0"/><rect x="40" y="470" width="300" height="420" fill="#fff0c8" opacity="0.6"/>` +
    `<g transform="translate(190,1080) scale(0.92)">${maman(st, STYLE, 'mm')}</g>`;

  const SHOT = {
    // ---------- portraits (cropped by maquette.py) ----------
    portrait(t, D) {
      const who = q.get('who') || 'yanis', bg = q.get('bg') || K.sky;
      let svg = `<rect x="-200" y="-200" width="1480" height="2320" fill="${bg}"/>`;
      if (who === 'yanis') svg += yDraw(yPose(D, q.get('pose') || 'fier'), [540, 1100], 1.2);
      if (who === 'maman') svg += `<g transform="translate(540,1100) scale(1.2)">${maman(momState(q.get('pose') === 'lunettes' ? { sunglasses: true, face: { eyes: 'open', mouth: 'smirk', brows: 'proud' }, arms: { L: { W: [110, 220], hand: 'fist', bend: 1 }, R: { W: [-110, 240], hand: 'fist', bend: -1 } } } : {}), STYLE, 'mp')}</g>`;
      if (who === 'banquise') svg += `<g transform="translate(540,960) scale(2.4)">${banquise({}, 'bqp')}</g>`;
      return { svg, noWatermark: true };
    },

    // ---------- épisode 1 ----------
    cri1(t, D) {   // the opening shout, at 3:47 in the morning
      const cam = { z: 1.42, x: 540, y: 870, r: 0 };
      const svg = room(T, cam, { y: yPose(D, 'crie', { st: { headRot: -3 } }), desk: { laptopGlow: 1, mic: false, mug: true } }) + OVER.night(1) + OVER.vig(0.5);
      sub(D, 'yanis', 'Pourquoi ma bouche est décalée ?!');
      return { svg, ui: CLEAN ? '' : banner(D, T, OLD, 99, 'STUDIO CHAMBRE · ÉPISODE 1', "LE SON DE L'ANNÉE"), noWatermark: true };
    },
    intro1(t, D) { // the narrator introduces Yanis : the room by day
      const cam = { z: 1.18, x: 540, y: 900, r: 0 };
      const st = yState(D, T, { face: { eyes: 'happy', brows: 'proud', mouth: 'smile' }, arms: ARMS.headphone, st: still({ headphones: 'ears', headRot: -4 }) });
      const svg = room(T, cam, { y: st, day: true, desk: { mic: 'near' } });
      sub(D, 'narrateur', "Son studio, c'est sa chambre.");
      return { svg, ui: CLEAN ? '' : label(D, 'YANIS', 'alias LIL GIVRE', T, OLD, 99, { x: 330, y: 560, r: -4 }) };
    },
    nuit(t, D) {   // midnight → 3:47, editing by hand
      const cam = { z: 1.15, x: 540, y: 930, r: 0 };
      const svg = room(T, cam, { y: yPose(D, 'fatigue'), desk: { laptopGlow: 1, mic: false, mug: true } }) + OVER.night(1);
      return { svg, extra: stamp('03:47', T, OLD, 99, { y: 430, r: -4, cls: 'clock' }) };
    },
    appli(t, D) {  // his recording app : drawn by us, not BandLab's
      let svg = layer(laptopScreen({ t: T, mode: 'rec', file: 'son_final_v12', timer: '03:12', play: 0.42 }), 1, Z);
      return { svg, extra: stamp('ENREGISTRÉ', T, OLD, 99, { x: 330, y: 1360, r: -5 }) + stamp('MIXÉ', T, OLD, 99, { x: 790, y: 1290, r: 5 }) };
    },
    montage(t, D) { // the editing screen : his mouth does not follow the sound
      const prev = yanis({ face: { eyes: 'open', mouth: 'talk', open: 0.9, brows: 'neutral' }, arms: ARMS.desk, headphones: 'neck' }, STYLE, 'pv');
      const svg = layer(laptopScreen({ t: T, mode: 'edit', file: 'clip_v4_FINAL', clock: '03:47', preview: prev }), 1, Z) + OVER.vig(0.5);
      return { svg };
    },
    prise(t, D) {  // take 2 : « de profil, pour le mystère »
      const cam = { z: 1.3, x: 520, y: 900, r: 2.5 };
      const st = yPose(D, 'smirk', { face: { turn: 0.6, gaze: [0.9, -0.2], mouth: 'closed', brows: 'proud' }, st: { headRot: 4 } });
      const svg = room(T, cam, { y: st, desk: { books: true, phoneOnBooks: true, mic: false, laptop: false } });
      return { svg, extra: stamp('PRISE 2', T, OLD, 99, { y: 430, r: 4 }) };
    },
    ecrannoir(t, D) { // the black screen with the lyrics, scrolled past
      const ph = `<g transform="translate(540,1000) scale(0.82) translate(-540,-930)">${phoneFrame(blackLyrics({ l1: "J'viens du froid,", l2: "j'ai le cœur en verglas…" }))}</g>`;
      const arrow = `<g transform="translate(930,860)"><path d="M 0 -150 L 62 -50 L 22 -50 L 22 150 L -22 150 L -22 -50 L -62 -50 Z" fill="${'#fdfeff'}" stroke="#0a0d14" stroke-width="9" stroke-linejoin="round"/></g>`;
      return { svg: SKY(T) + ph + arrow };
    },
    fenetre(t, D) { // the mascot of Stalak knocks at the frosted window
      const cam = { z: 1.18, x: 680, y: 760, r: 0 };
      const win = mascot('hello', 860, 470, 300, 1, 3);
      const st = yPose(D, 'ebahi', { face: { turn: 0.6, gaze: [0.9, -0.4] }, st: { headRot: 4 } });
      const svg = room(T, cam, { y: st, window: win, desk: { mic: false, laptop: true } }) + OVER.night(0.6);
      return { svg, ui: CLEAN ? '' : label(D, 'LA MASCOTTE DE STALAK', '', T, OLD, 99, { x: 640, y: 1080, r: -3 }) };
    },
    danse(t, D) {  // the video is done : he dances
      const cam = { z: 1.12, x: 540, y: 920, r: -1.5 };
      const st = yPose(D, 'fier', { face: { eyes: 'happy', mouth: 'grin' }, arms: ARMS.up, st: { sparkle: 1, headRot: 6 } });
      return { svg: room(T, cam, { y: st, desk: { laptopGlow: 1, mic: false } }) + OVER.night(0.5) };
    },
    stalak(t, D) { // the real Stalak, with the 3 steps
      const svg = SKY(T) + stalakPhone(T, 'takes', { sc: 0.72, cy: 1240 });
      return { svg, extra: steps([['TON SON', OLD], ['TES PRISES', OLD], ['STALAK COUPE SUR LE RYTHME', OLD]], T, { y: 330 }) };
    },
    fin(t, D) {    // the end card
      const r = ending(T, { t0: OLD }, q.get('tease') || 'MA MÈRE ENTRE PENDANT LA PRISE', +(q.get('n') || 1));
      return { svg: r.svg, extra: r.ui, noWatermark: true };
    },

    // ---------- épisode 2 ----------
    micro(t, D) {  // take 23, at the mic, REC on
      const cam = { z: 1.25, x: 540, y: 880, r: 0 };
      return { svg: room(T, cam, { y: yPose(D, 'rap'), desk: { mic: 'near', rec: 1, laptop: true, laptopGlow: 1 } }) + OVER.night(0.7) };
    },
    porte(t, D) {  // the door bursts open : Maman and the frozen chicken
      const cam = { z: 1.05, x: 500, y: 960, r: 0 };
      const st = yPose(D, 'ebahi', { face: { turn: -0.6, gaze: [-0.9, 0], mouth: 'O', open: 0.8 }, arms: ARMS.headphone, st: { headphones: 'ears', sweat: 1 } });
      const svg = room(T, cam, { y: st, at: [680, 1010], door: 1, hall: momInDoor(momState()), desk: { mic: 'near', rec: 1 } }) + OVER.night(0.35);
      return { svg };
    },
    lunettes(t, D) { // Maman wants to be credited
      const cam = { z: 1.05, x: 500, y: 960, r: 0 };
      const mom = momState({ sunglasses: true, face: { eyes: 'open', mouth: 'smirk', brows: 'proud' }, arms: { L: { W: [110, 220], hand: 'fist', bend: 1 }, R: { W: [-110, 240], hand: 'fist', bend: -1 } } });
      const st = yPose(D, 'fier', { face: { turn: -0.5, gaze: [-0.8, 0] }, arms: ARMS.point });
      return { svg: room(T, cam, { y: st, at: [680, 1010], door: 1, hall: momInDoor(mom), desk: { mic: 'near' } }) + OVER.night(0.35) };
    },
    pic(t, D) {    // the ruined take : a red spike « MAMAN »
      return { svg: layer(laptopScreen({ t: T, mode: 'rec', file: 'couplet_prise23', timer: '00:41', spike: { x: 690, label: 'MAMAN' }, play: 0.62 }), 1, Z) };
    },

    // ---------- épisode 3 ----------
    notif(t, D) {
      const ph = `<g transform="translate(540,1010) scale(0.82) translate(-540,-930)">${phoneFrame(lock({ t: T, time: '16:42', date: 'mardi 17 novembre', notif: { title: 'Big Banquise', text: 'Note vocale · 0:02' }, notifT: OLD }))}</g>`;
      return { svg: SKY(T) + ph };
    },
    discussion(t, D) {
      const msgs = [{ from: 'me', kind: 'date', text: 'Hier, 23:12' }, { from: 'me', kind: 'text', text: 'Salut frère, un feat gratuit ?' },
        { from: 'me', kind: 'date', text: "Aujourd'hui" }, { from: 'him', kind: 'voice', dur: '0:02', play: 1 },
        { from: 'me', kind: 'text', text: 'Et pour la visibilité ?' }, { from: 'him', kind: 'voice', dur: '0:03', play: 0.45 }];
      const ph = `<g transform="translate(540,1010) scale(0.82) translate(-540,-930)">${phoneFrame(chat({ t: T, msgs }))}</g>`;
      return { svg: SKY(T) + ph };
    },
    banquise(t, D) {
      return { svg: ICE(T) + `<g transform="translate(540,900) scale(2.4)">${banquise({}, 'bqb')}</g>`, noWatermark: true };
    },
    decale(t, D) { // his promo video : the mouth does not follow the sound
      const inner = `<rect x="190" y="170" width="700" height="1520" fill="#0b1b3d"/>` +
        `<g transform="translate(540,800) scale(1.45)">${banquise({}, 'bqd')}</g>` +
        `<text x="540" y="1320" text-anchor="middle" font-family="Rubik" font-weight="800" font-size="40" fill="#fdfeff">♪ sur la banquise…</text>` +
        `<rect x="250" y="1430" width="580" height="12" rx="6" fill="#2a3a5c"/><rect x="250" y="1430" width="250" height="12" rx="6" fill="#e5484d"/>`;
      const ph = `<g transform="translate(540,1010) scale(0.82) translate(-540,-930)">${phoneFrame(inner)}</g>`;
      return { svg: SKY(T) + ph, extra: stamp('DÉCALÉ', T, OLD, 99, { y: 520, r: -6, cls: 'red' }) };
    },
  };

  window.EPISODE = {
    frame(t, D) {
      const r = SHOT[q.get('shot') || 'cri1'](t, D);
      if (!D.subs) D.subs = [];
      return { svg: r.svg, ui: (r.ui || '') + (r.extra || ''), noWatermark: r.noWatermark || CLEAN };
    },
  };
})();
