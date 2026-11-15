/* Série « T-Crazy » — Liam and his room-studio, drawn in code (décision du propriétaire du 15/11 à 23 h :
   every visual is drawn by Claude, never generated). One drawing, three ways to draw it (?s=1|2|3) :
   1 « Anime US » : thin crisp lines, thicker outer contour, narrowed eyes, hard cel shadows, warm late-afternoon light.
   2 « Sticker givré » : the Stalak mascot's look : thick outlines, white sticker border, big head, flat bright colours.
   3 « BD imprimée » : printed comic page : rough brush lines, halftone shadows, paper grain, navy / ice / orange.
   (Marketing & croissance, 15/11/2026) */
(function () {
  const STY = {
    1: { ink: '#17110e', lw: 3.4, outer: 7.5, sticker: 0, head: 1.3, leg: 0.96, eye: 'anime', shade: 'cel', rough: 0, paper: 0, room: 3,
      pal: { wall: '#d9b79b', wallS: '#b48f78', light: '#ffd9a6', floor: '#8c6a57', floorS: '#6c4f41', base: '#efe2d2',
        skin: '#c98b5e', skinS: '#a3673f', hair: '#3b2419', hairS: '#24150e', tip: '#cfe9ff', jacket: '#1f6fd6', jacketS: '#16509f', jacketH: '#8cc4ff',
        tee: '#f6f2ea', teeS: '#d3c8b6', jeans: '#2d3b59', jeansS: '#1d283f', shoe: '#f8f7f3', shoeS: '#c9cdd6', sole: '#9aa1ad',
        gold: '#efbb31', goldS: '#b98715', neon: '#a5e4ff', foam: '#5c5d66', foamS: '#45464e', tape: '#e8eef6',
        p1: '#c9573f', p1b: '#5a2a24', p2: '#2f4c7d', p2b: '#16223b', mat: '#ece6dc', matS: '#c5bba9', blanket: '#9fb7d6', blanketS: '#7b93b4',
        desk: '#7c5437', deskS: '#5b3c27', lap: '#2b303b', screen: '#0f1c34', wave: '#57adff', sky1: '#ffd49a', sky2: '#f39a62', city: '#a8586b', frost: '#f3f9ff',
        phone: '#2a2d36', cupRing: '#1f6fd6', metal: '#3a3d46' } },
    2: { ink: '#0a0d14', lw: 6.5, outer: 9, sticker: 13, head: 1.62, leg: 0.78, eye: 'round', shade: 'soft', rough: 0, paper: 0, room: 6,
      pal: { wall: '#cfe6ff', wallS: '#a9cdf3', light: '#ffffff', floor: '#8fb2df', floorS: '#6f93c4', base: '#f4faff',
        skin: '#cf9063', skinS: '#b2744b', hair: '#3b2419', hairS: '#2a170f', tip: '#d6ecff', jacket: '#1f6fd6', jacketS: '#1a5cb5', jacketH: '#bfe2ff',
        tee: '#ffffff', teeS: '#d6ecff', jeans: '#25345a', jeansS: '#1b2745', shoe: '#ffffff', shoeS: '#d6ecff', sole: '#a9cdf3',
        gold: '#f5c53a', goldS: '#d39b1c', neon: '#8fd3ff', foam: '#2f3b57', foamS: '#22304b', tape: '#ffffff',
        p1: '#1f6fd6', p1b: '#0e3f8f', p2: '#0e3f8f', p2b: '#08214d', mat: '#ffffff', matS: '#d6ecff', blanket: '#8fd3ff', blanketS: '#5fb3ea',
        desk: '#0e3f8f', deskS: '#0a2f6c', lap: '#0a0d14', screen: '#0e1b33', wave: '#8fd3ff', sky1: '#fff2c9', sky2: '#ffc27a', city: '#7aa6dc', frost: '#ffffff',
        phone: '#0a0d14', cupRing: '#8fd3ff', metal: '#2b3346' } },
    3: { ink: '#141022', lw: 4.6, outer: 8.5, sticker: 0, head: 1.32, leg: 0.96, eye: 'anime', shade: 'halftone', rough: 3.2, paper: 1, room: 4.5,
      pal: { wall: '#45598a', wallS: '#2a3961', light: '#f6a65c', floor: '#2d3556', floorS: '#1d2340', base: '#9fb4dd',
        skin: '#d08c5b', skinS: '#8f5233', hair: '#2e1c18', hairS: '#160c0a', tip: '#c6e6ff', jacket: '#2c78dc', jacketS: '#163f86', jacketH: '#a9d8ff',
        tee: '#f3eadb', teeS: '#b9a68c', jeans: '#28304f', jeansS: '#141a33', shoe: '#f3eee4', shoeS: '#b4b8c8', sole: '#7d8399',
        gold: '#f2b93a', goldS: '#a86d12', neon: '#9fe6ff', foam: '#222a44', foamS: '#151a2e', tape: '#e6d8bf',
        p1: '#e2763f', p1b: '#3b1f22', p2: '#7fb6e8', p2b: '#1b2547', mat: '#d9d2c4', matS: '#8d8478', blanket: '#5f7fb8', blanketS: '#34477a',
        desk: '#6a4334', deskS: '#3d2620', lap: '#1b1d2a', screen: '#0c1430', wave: '#7fd0ff', sky1: '#ffc27a', sky2: '#e9693f', city: '#7a3d55', frost: '#eef6ff',
        phone: '#1b1d2a', cupRing: '#8fd3ff', metal: '#2b2f40' } },
  };
  const r1 = (x) => Math.round(x * 10) / 10;
  let UID = 0;

  // ---------------- small geometry helpers ----------------
  const pt = (p) => `${r1(p[0])} ${r1(p[1])}`;
  function capsule(a, b, r) { // a rounded bar from a to b, half-width r
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L * r, ny = dx / L * r;
    return `M ${pt([a[0] + nx, a[1] + ny])} L ${pt([b[0] + nx, b[1] + ny])} A ${r} ${r} 0 0 1 ${pt([b[0] - nx, b[1] - ny])} L ${pt([a[0] - nx, a[1] - ny])} A ${r} ${r} 0 0 1 ${pt([a[0] + nx, a[1] + ny])} Z`;
  }
  function lerp(a, b, k) { return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]; }

  // ---------------- the renderer : parts drawn in 3 passes (sticker border, outer contour, fill + thin lines) ----------------
  function render(parts, S, P) {
    const defs = [], p0 = [], p1 = [], p2 = [];
    parts.forEach(q => {
      const tf = q.tf ? ` transform="${q.tf}"` : '';
      if (q.kind === 'stroke') {
        const base = `d="${q.d}" fill="none" stroke-linecap="${q.cap || 'round'}" stroke-linejoin="round"${tf}`;
        if (S.sticker) p0.push(`<path ${base} stroke="#ffffff" stroke-width="${r1(q.w + 2 * S.outer + 2 * S.sticker)}"/>`);
        p1.push(`<path ${base} stroke="${S.ink}" stroke-width="${r1(q.w + 2 * S.outer)}"/>`);
        if (!q.noLine) p2.push(`<path ${base} stroke="${S.ink}" stroke-width="${r1(q.w + 2 * S.lw)}"/>`);
        p2.push(`<path ${base} stroke="${q.color}" stroke-width="${r1(q.w)}"/>`);
        if (q.ticks) p2.push(q.tf ? `<g transform="${q.tf}">${q.ticks}</g>` : q.ticks);
        if (q.tip) p2.push(`<path d="${q.tip}" fill="none" stroke="${q.tipColor}" stroke-width="${r1(q.tipW || q.w)}" stroke-linecap="round"${tf}${q.tipW ? ' transform="translate(-14 -12)" opacity="0.8"' : ''}/>`);
        return;
      }
      const base = `d="${q.d}" stroke-linejoin="round"${tf}`;
      if (!q.inner) {
        if (S.sticker) p0.push(`<path ${base} fill="#ffffff" stroke="#ffffff" stroke-width="${r1(2 * S.outer + 2 * S.sticker)}"/>`);
        p1.push(`<path ${base} fill="${S.ink}" stroke="${S.ink}" stroke-width="${r1(2 * S.outer)}"/>`);
      }
      p2.push(`<path ${base} fill="${q.fill}" ${q.noLine ? '' : `stroke="${S.ink}" stroke-width="${r1(q.lw || S.lw)}"`}/>`);
      if (q.shade) {
        const flat = q.shadeColor === P.skinS || q.shadeColor === P.hairS;
        const id = 'c' + (++UID);
        defs.push(`<clipPath id="${id}"><path d="${q.d}"${tf}/></clipPath>`);
        p2.push(`<g clip-path="url(#${id})"><path d="${q.shade}" fill="${flat ? q.shadeColor : shadeFill(q.shadeColor, S)}"${tf}/></g>`);
      }
      if (q.extra) p2.push(q.tf ? `<g transform="${q.tf}">${q.extra}</g>` : q.extra);
    });
    return { defs: defs.join(''), svg: `<g>${p0.join('')}</g><g>${p1.join('')}</g><g>${p2.join('')}</g>` };
  }
  // halftone : a dot pattern per shadow colour
  const DOTS = {};
  function shadeFill(color, S) {
    if (S.shade !== 'halftone') return color;
    if (!DOTS[color]) DOTS[color] = 'h' + Object.keys(DOTS).length;
    return `url(#${DOTS[color]})`;
  }
  function dotDefs() {
    return Object.entries(DOTS).map(([c, id]) => `<pattern id="${id}" width="11" height="11" patternUnits="userSpaceOnUse" patternTransform="rotate(28)"><circle cx="5.5" cy="5.5" r="3.3" fill="${c}"/></pattern>`).join('');
  }

  // ---------------- Liam ----------------
  // world points : N = base of the neck. The head is drawn around F (face centre) and scaled by S.head around N.
  function liam(S, P) {
    const N = [450, 846], hs = S.head, F = [N[0], N[1] - 112 * hs];
    const H = (x, y) => [F[0] + x * hs, F[1] + y * hs];
    const htf = `translate(${r1(F[0])} ${r1(F[1])}) scale(${hs})`;
    const legK = S.leg, hip = 1206, ank = hip + 490 * legK;
    const back = [], parts = [];
    let nLoc = 0;
    const loc = (list, into) => list.forEach(([root, end, bend, w]) => {
      const c = [(root[0] + end[0]) / 2 + bend, (root[1] + end[1]) / 2];
      const k = [0.84, 0.88, 0.8, 0.9, 0.86][nLoc++ % 5], t0 = lerp(lerp(root, c, k), lerp(c, end, k), k);
      const q = (t) => lerp(lerp(root, c, t), lerp(c, end, t), t);
      let ticks = '';
      for (let t = 0.22; t < k - 0.05; t += 0.16) { const a = q(t), b2 = q(t + 0.02), dx = b2[0] - a[0], dy = b2[1] - a[1], L = Math.hypot(dx, dy) || 1, ww = (w || 17) * 0.38;
        ticks += `M ${pt([a[0] - dy / L * ww, a[1] + dx / L * ww])} L ${pt([a[0] + dy / L * ww, a[1] - dx / L * ww])} `; }
      into.push({ kind: 'stroke', d: `M ${pt(root)} Q ${pt(c)} ${pt(end)}`, w: (w || 17) * (S.eye === 'round' ? 1.15 : 1), color: P.hair, tf: htf,
        tip: `M ${pt(t0)} Q ${pt(lerp(c, end, 0.9))} ${pt(end)}`, tipColor: P.tip,
        ticks: `<path d="${ticks}" stroke="${P.hairS}" stroke-width="2.4" stroke-linecap="round"/>` });
    });
    // --- hair behind the head : the cap of locs and the long locs at the back ---
    back.push({ d: `M -92 -10 C -104 -60 -96 -122 -40 -142 C -10 -152 10 -152 40 -142 C 96 -122 104 -60 92 -10 C 70 -36 -70 -36 -92 -10 Z`, fill: P.hair, tf: htf, shade: `M -120 -160 L -50 -160 L -80 40 L -120 40 Z`, shadeColor: P.hairS });
    loc([[[-84, -60], [-112, 62], -12], [[-94, -24], [-120, 44], -8], [[-70, -96], [-104, 76], -14], [[84, -60], [112, 62], 12], [[94, -24], [120, 44], 8], [[70, -96], [104, 76], 14],
      [[-40, -120], [-86, 84], -10], [[40, -120], [86, 84], 10]], back);

    // --- jeans (baggy), sneakers ---
    const jeans = `M 300 ${hip - 24} L 600 ${hip - 24} C 612 ${hip + 160 * legK} 626 ${hip + 330 * legK} 632 ${ank} L 474 ${ank} C 468 ${hip + 260 * legK} 462 ${hip + 150 * legK} 450 ${hip + 118 * legK} C 438 ${hip + 150 * legK} 432 ${hip + 260 * legK} 426 ${ank} L 268 ${ank} C 274 ${hip + 330 * legK} 288 ${hip + 160 * legK} 300 ${hip - 24} Z`;
    const jeansShade = `M 250 ${hip - 30} L 336 ${hip - 30} L 352 ${ank + 10} L 250 ${ank + 10} Z M 450 ${hip + 100} L 474 ${hip + 100} L 498 ${ank + 10} L 432 ${ank + 10} Z`;
    const folds = `<path d="M 282 ${ank - 40} q 40 -18 80 0 q 30 14 56 -4 M 278 ${ank - 92} q 50 -16 90 2 M 484 ${ank - 44} q 40 -18 80 0 q 30 12 58 -6 M 490 ${ank - 96} q 46 -14 88 4 M 310 ${hip + 210 * legK} q 30 22 70 10 M 520 ${hip + 230 * legK} q 34 18 70 4" fill="none" stroke="${S.ink}" stroke-width="${r1(S.lw * 0.8)}" stroke-linecap="round"/>`;
    parts.push({ d: jeans, fill: P.jeans, shade: jeansShade, shadeColor: P.jeansS, extra: folds });
    const shoe = (cx, s) => {
      const d = `M ${cx - 92 * s} ${ank + 62} C ${cx - 98 * s} ${ank + 18} ${cx - 70 * s} ${ank - 18} ${cx - 34 * s} ${ank - 20} L ${cx + 30 * s} ${ank - 16} C ${cx + 62 * s} ${ank - 8} ${cx + 96 * s} ${ank + 18} ${cx + 104 * s} ${ank + 52} L ${cx + 104 * s} ${ank + 70} L ${cx - 92 * s} ${ank + 70} Z`;
      const extra = `<path d="M ${cx - 92 * s} ${ank + 52} L ${cx + 104 * s} ${ank + 52} L ${cx + 104 * s} ${ank + 70} L ${cx - 92 * s} ${ank + 70} Z" fill="${P.sole}" stroke="${S.ink}" stroke-width="${r1(S.lw)}"/>` +
        `<path d="M ${cx - 30 * s} ${ank - 6} l 22 16 M ${cx - 10 * s} ${ank - 10} l 22 16 M ${cx + 10 * s} ${ank - 8} l 20 14" stroke="${S.ink}" stroke-width="${r1(S.lw * 0.8)}" stroke-linecap="round"/>`;
      parts.push({ d, fill: P.shoe, shade: `M ${cx - 110 * s} ${ank + 24} L ${cx + 120 * s} ${ank + 32} L ${cx + 120 * s} ${ank + 60} L ${cx - 110 * s} ${ank + 60} Z`, shadeColor: P.shoeS, extra });
    };
    shoe(350, -1); shoe(550, 1);

    // --- neck (behind the collar) ---
    parts.push({ d: `M 424 ${N[1] - 70} L 476 ${N[1] - 70} L 478 ${N[1] + 30} C 460 ${N[1] + 44} 440 ${N[1] + 44} 422 ${N[1] + 30} Z`, fill: P.skin, shade: `M 410 ${N[1] - 80} L 490 ${N[1] - 80} L 490 ${N[1] - 30} C 460 ${N[1] - 16} 440 ${N[1] - 16} 410 ${N[1] - 30} Z`, shadeColor: P.skinS });
    // --- the puffer jacket : scalloped sides, quilt lines, gloss ---
    const rows = [880, 950, 1020, 1090, 1160, 1218], wide = [150, 172, 164, 174, 166, 156];
    let jk = `M 392 872 C 360 868 322 870 ${450 - wide[0]} ${rows[0]}`;
    for (let i = 0; i < rows.length - 1; i++) jk += ` C ${450 - wide[i] - 26} ${rows[i] + 22} ${450 - wide[i + 1] - 26} ${rows[i + 1] - 22} ${450 - wide[i + 1]} ${rows[i + 1]}`;
    jk += ` C 380 ${rows[5] + 14} 520 ${rows[5] + 14} ${450 + wide[5]} ${rows[5]}`;
    for (let i = rows.length - 1; i > 0; i--) jk += ` C ${450 + wide[i] + 26} ${rows[i] - 22} ${450 + wide[i - 1] + 26} ${rows[i - 1] + 22} ${450 + wide[i - 1]} ${rows[i - 1]}`;
    jk += ` C 578 870 540 868 508 872 Z`;
    const quilts = rows.slice(1, 5).map(y => `M ${450 - 178} ${y} C 340 ${y + 16} 380 ${y + 16} 408 ${y + 8} M 492 ${y + 8} C 520 ${y + 16} 560 ${y + 16} ${450 + 178} ${y}`).join(' ');
    const gloss = rows.slice(0, 5).map((y, i) => `M ${300 + (i % 2) * 8} ${y + 26} q 28 -14 62 -12 M ${540 + (i % 2) * 6} ${y + 18} q 34 -4 58 10`).join(' ');
    parts.push({ d: jk, fill: P.jacket, shade: `M 260 860 L 372 860 C 346 960 356 1090 392 1240 L 260 1240 Z`, shadeColor: P.jacketS,
      extra: `<path d="${quilts}" fill="none" stroke="${S.ink}" stroke-width="${r1(S.lw)}" stroke-linecap="round"/><path d="${gloss}" fill="none" stroke="${P.jacketH}" stroke-width="${r1(S.lw * 2.2)}" stroke-linecap="round" opacity="0.85"/>` });
    parts.push({ d: `M 412 880 L 488 880 L 492 1222 L 408 1222 Z`, fill: P.tee, inner: true, shade: `M 400 870 L 432 870 L 428 1230 L 400 1230 Z`, shadeColor: P.teeS });
    parts.push({ d: `M 406 880 L 410 1222 M 494 880 L 490 1222`, fill: 'none', inner: true });
    parts.push({ kind: 'stroke', d: `M 390 892 C 378 822 522 822 510 892`, w: 34, color: P.jacket }); // the puffy collar
    // --- head : face, details, front locs, headphones ---
    const face = S.eye === 'round'
      ? `M -72 -78 C -88 -40 -90 14 -80 48 C -68 86 -36 106 0 108 C 36 106 68 86 80 48 C 90 14 88 -40 72 -78 Z`
      : `M -70 -84 C -82 -54 -84 -18 -82 8 C -80 40 -72 62 -60 76 L -28 102 C -12 110 12 110 28 102 L 60 76 C 72 62 80 40 82 8 C 84 -18 82 -54 70 -84 Z`;
    parts.push({ d: face, fill: P.skin, tf: htf, shade: `M -92 -90 L -42 -90 C -58 -40 -64 10 -48 58 C -38 86 -12 100 6 112 L -92 112 Z`, shadeColor: P.skinS, extra: faceDetails(S, P) });
    loc([[[-8, -138], [-72, -40], -34, 16], [[-30, -132], [-88, -8], -26, 16], [[8, -138], [72, -40], 34, 16], [[30, -132], [88, -8], 26, 16],
      [[-58, -114], [-98, 44], -14, 17], [[58, -114], [98, 44], 14, 17]], parts);
    parts.push({ kind: 'stroke', d: `M -104 6 C -112 -168 112 -168 104 6`, w: 15, color: P.phone, tf: htf });
    [-1, 1].forEach(sg => parts.push({ d: `M ${sg * 100} -42 C ${sg * 134} -42 ${sg * 138} 54 ${sg * 100} 54 C ${sg * 78} 54 ${sg * 72} -42 ${sg * 100} -42 Z`, fill: P.phone, tf: htf,
      extra: `<ellipse cx="${sg * 104}" cy="6" rx="16" ry="31" fill="${P.cupRing}" stroke="${S.ink}" stroke-width="${S.lw}"/><path d="M ${sg * 112} -18 q ${sg * 8} 14 2 30" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity="0.8"/>` }));
    // --- the chain and the T (a block letter T, never a cross) ---
    const chain = [];
    for (let k = 0; k <= 16; k++) { const t = k / 16, x = 410 + 80 * t, y = 884 + Math.sin(t * Math.PI) * 86; chain.push(`<circle cx="${r1(x)}" cy="${r1(y)}" r="5.2" fill="${P.gold}" stroke="${S.ink}" stroke-width="${r1(S.lw * 0.6)}"/>`); }
    parts.push({ d: `M 408 968 L 492 968 L 492 992 L 462 992 L 462 1040 L 438 1040 L 438 992 L 408 992 Z`, fill: P.gold,
      shade: `M 400 982 L 500 982 L 500 1000 L 400 1000 Z M 452 992 L 470 992 L 470 1046 L 452 1046 Z`, shadeColor: P.goldS,
      extra: chain.join('') + `<path d="M 416 975 l 24 0 M 446 998 l 0 18" stroke="#fff6cf" stroke-width="5" stroke-linecap="round"/>` });
    // --- arms : puffy sleeves ; left hand pressing the left cup, right hand raised, index up (« le prochain ») ---
    const cup = H(-118, 6), hL = [cup[0] - 6, cup[1] + 12], wL = [hL[0] - 4, hL[1] + 46];
    const hR = [652, 700], wR = [hR[0] + 6, hR[1] + 58];
    const sleeve = (a, e, w) => parts.push({ kind: 'stroke', d: `M ${pt(a)} L ${pt(e)} L ${pt(w)}`, w: 82, color: P.jacket,
      tip: `M ${pt(lerp(a, e, 0.15))} L ${pt(lerp(a, e, 0.75))}`, tipColor: P.jacketH });
    sleeve([322, 912], [238, 1010], wL);
    sleeve([578, 912], [700, 900], wR);
    // fix the sleeve gloss : thinner
    parts.slice(-2).forEach(q => { q.tipW = 10; });
    // left hand : palm on the cup, fingers on top
    parts.push({ d: `M ${hL[0] - 34} ${hL[1] + 30} C ${hL[0] - 46} ${hL[1] - 6} ${hL[0] - 34} ${hL[1] - 46} ${hL[0] - 6} ${hL[1] - 52} C ${hL[0] + 10} ${hL[1] - 70} ${hL[0] + 30} ${hL[1] - 62} ${hL[0] + 30} ${hL[1] - 44} C ${hL[0] + 44} ${hL[1] - 44} ${hL[0] + 50} ${hL[1] - 26} ${hL[0] + 42} ${hL[1] - 12} C ${hL[0] + 50} ${hL[1] + 4} ${hL[0] + 44} ${hL[1] + 24} ${hL[0] + 26} ${hL[1] + 30} C ${hL[0] + 14} ${hL[1] + 52} ${hL[0] - 18} ${hL[1] + 54} ${hL[0] - 34} ${hL[1] + 30} Z`,
      fill: P.skin, shade: `M ${hL[0] - 60} ${hL[1] - 10} L ${hL[0] - 8} ${hL[1] - 10} L ${hL[0] + 6} ${hL[1] + 70} L ${hL[0] - 60} ${hL[1] + 70} Z`, shadeColor: P.skinS,
      extra: `<path d="M ${hL[0]} ${hL[1] - 42} q 8 18 6 38 M ${hL[0] + 22} ${hL[1] - 34} q 6 16 2 32" fill="none" stroke="${S.ink}" stroke-width="${r1(S.lw * 0.8)}" stroke-linecap="round"/>` });
    // right hand : holds his phone up, filming himself (the back of the phone faces us)
    const ph = [hR[0] - 4, hR[1] - 70];
    parts.push({ d: `M ${ph[0] - 40} ${ph[1] - 74} C ${ph[0] - 40} ${ph[1] - 88} ${ph[0] - 30} ${ph[1] - 96} ${ph[0] - 16} ${ph[1] - 96} L ${ph[0] + 22} ${ph[1] - 96} C ${ph[0] + 36} ${ph[1] - 96} ${ph[0] + 44} ${ph[1] - 88} ${ph[0] + 44} ${ph[1] - 74} L ${ph[0] + 44} ${ph[1] + 74} C ${ph[0] + 44} ${ph[1] + 88} ${ph[0] + 36} ${ph[1] + 96} ${ph[0] + 22} ${ph[1] + 96} L ${ph[0] - 16} ${ph[1] + 96} C ${ph[0] - 30} ${ph[1] + 96} ${ph[0] - 40} ${ph[1] + 88} ${ph[0] - 40} ${ph[1] + 74} Z`,
      fill: P.cupRing, shade: `M ${ph[0] - 50} ${ph[1] - 100} L ${ph[0] - 18} ${ph[1] - 100} L ${ph[0] - 18} ${ph[1] + 100} L ${ph[0] - 50} ${ph[1] + 100} Z`, shadeColor: P.jacketS,
      extra: `<rect x="${ph[0] - 28}" y="${ph[1] - 84}" width="34" height="50" rx="12" fill="${P.phone}" stroke="${S.ink}" stroke-width="${r1(S.lw * 0.8)}"/><circle cx="${ph[0] - 11}" cy="${ph[1] - 70}" r="8" fill="#0b1020" stroke="#8fa3c8" stroke-width="2.5"/><circle cx="${ph[0] - 11}" cy="${ph[1] - 47}" r="6" fill="#0b1020" stroke="#8fa3c8" stroke-width="2"/><path d="M ${ph[0] + 26} ${ph[1] - 80} l 0 60" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity="0.6"/>` });
    parts.push({ d: `M ${hR[0] - 38} ${hR[1] + 14} C ${hR[0] - 44} ${hR[1] - 14} ${hR[0] - 30} ${hR[1] - 34} ${hR[0] - 6} ${hR[1] - 32} L ${hR[0] + 30} ${hR[1] - 30} C ${hR[0] + 46} ${hR[1] - 22} ${hR[0] + 48} ${hR[1] - 4} ${hR[0] + 42} ${hR[1] + 14} C ${hR[0] + 40} ${hR[1] + 40} ${hR[0] + 20} ${hR[1] + 54} ${hR[0]} ${hR[1] + 54} C ${hR[0] - 22} ${hR[1] + 54} ${hR[0] - 36} ${hR[1] + 38} ${hR[0] - 38} ${hR[1] + 14} Z`,
      fill: P.skin, shade: `M ${hR[0] - 54} ${hR[1] - 40} L ${hR[0] - 8} ${hR[1] - 40} L ${hR[0] - 4} ${hR[1] + 60} L ${hR[0] - 54} ${hR[1] + 60} Z`, shadeColor: P.skinS,
      extra: `<path d="M ${hR[0] - 30} ${hR[1] - 8} q 34 -6 70 0 M ${hR[0] - 30} ${hR[1] + 14} q 32 -4 66 2 M ${hR[0] - 26} ${hR[1] + 34} q 28 -2 56 4" fill="none" stroke="${S.ink}" stroke-width="${r1(S.lw * 0.8)}" stroke-linecap="round"/>` });
    return render(back.concat(parts), S, P);
  }

  function faceDetails(S, P) {
    const ink = S.ink, lw = S.lw;
    let s = '';
    if (S.eye === 'round') {
      // sticker look : dark half-moon eyes under a heavy lid, a white catchlight
      [-1, 1].forEach(k => {
        const x = k * 34;
        s += `<path d="M ${x - 22} 2 L ${x + 22} 2 C ${x + 20} 22 ${x - 20} 22 ${x - 22} 2 Z" fill="#1d120c"/><circle cx="${x + 8}" cy="9" r="4" fill="#ffffff"/>`;
        s += `<path d="M ${x - 26} 2 L ${x + 26} ${k < 0 ? 0 : 4}" stroke="${ink}" stroke-width="${lw * 1.3}" stroke-linecap="round"/>`;
      });
      s += `<path d="M -58 -30 L -14 -34 M 14 -40 C 30 -46 46 -46 58 -38" fill="none" stroke="${ink}" stroke-width="${lw * 1.6}" stroke-linecap="round"/>`;
      s += `<path d="M -4 26 q 8 14 -2 22" fill="none" stroke="${ink}" stroke-width="${lw * 0.9}" stroke-linecap="round"/>`;
      s += `<path d="M -26 64 C -8 72 18 70 34 54" fill="none" stroke="${ink}" stroke-width="${lw * 1.1}" stroke-linecap="round"/><path d="M 12 66 L 30 58 L 28 64 Z" fill="#ffffff"/>`;
      return s;
    }
    // narrowed anime-US eyes : heavy upper lid, small iris, catchlight
    [-1, 1].forEach(k => {
      const x = k * 36;
      s += `<path d="M ${x - 24} 6 Q ${x} -6 ${x + 24} 4 Q ${x} 16 ${x - 24} 6 Z" fill="#fbf7f1"/>`;
      s += `<clipPath id="eye${k}"><path d="M ${x - 24} 6 Q ${x} -6 ${x + 24} 4 Q ${x} 16 ${x - 24} 6 Z"/></clipPath><g clip-path="url(#eye${k})"><circle cx="${x + 4 * k}" cy="6" r="9" fill="#3a2214"/><circle cx="${x + 4 * k}" cy="6" r="4.5" fill="#0d0805"/><circle cx="${x + 7 * k}" cy="3" r="2.4" fill="#ffffff"/></g>`;
      s += `<path d="M ${x - 26} ${k < 0 ? 8 : 2} Q ${x - 2} ${k < 0 ? -10 : -12} ${x + 26} ${k < 0 ? 2 : 8}" fill="none" stroke="${ink}" stroke-width="${lw * 1.9}" stroke-linecap="round"/>`;
      s += `<path d="M ${x - 18} 12 Q ${x} 18 ${x + 18} 11" fill="none" stroke="${ink}" stroke-width="${lw * 0.6}" stroke-linecap="round"/>`;
    });
    s += `<path d="M -60 -20 L -16 -26 L -14 -20 L -58 -14 Z" fill="${ink}"/><path d="M 14 -36 C 30 -42 46 -42 60 -34 L 58 -28 C 46 -34 30 -34 16 -30 Z" fill="${ink}"/>`;
    s += `<path d="M 2 16 L -4 40 L 8 42" fill="none" stroke="${ink}" stroke-width="${lw * 0.9}" stroke-linecap="round" stroke-linejoin="round"/>`;
    s += `<path d="M -24 66 C -6 72 16 68 32 54" fill="none" stroke="${ink}" stroke-width="${lw * 1.2}" stroke-linecap="round"/><path d="M 10 66 L 28 58 L 26 64 Z" fill="#ffffff"/>`;
    s += `<path d="M 30 50 q 8 4 6 12" fill="none" stroke="${ink}" stroke-width="${lw * 0.7}" stroke-linecap="round"/>`;
    return s;
  }

  // ---------------- the room-studio ----------------
  function room(S, P) {
    const ink = S.ink, lw = S.room;
    const ln = (d, w = lw, c = ink) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
    const sh = (d, c) => `<path d="${d}" fill="${shadeFill(c, S)}"/>`;
    let s = `<rect x="-40" y="-40" width="1160" height="2000" fill="${P.wall}"/>`;
    // the warm sunbeam on the wall
    if (S.shade !== 'soft') s += `<path d="M 700 300 L 1080 300 L 1080 1520 L 160 1520 Z" fill="${P.light}" opacity="${S.shade === 'halftone' ? 0.35 : 0.42}"/>`;
    s += sh(`M -40 -40 L 260 -40 L 120 1520 L -40 1520 Z`, P.wallS);
    // neon strip
    s += `<rect x="70" y="214" width="600" height="20" rx="10" fill="${P.neon}" opacity="0.35" transform="scale(1,1)"/><rect x="60" y="200" width="620" height="48" rx="24" fill="${P.neon}" opacity="0.18"/>`;
    s += `<rect x="80" y="218" width="580" height="14" rx="7" fill="#ffffff" stroke="${ink}" stroke-width="${lw * 0.8}"/>`;
    // posters (invented rappers, no text)
    const poster = (x, y, w, h, rot, a, b, crown) => `<g transform="rotate(${rot} ${x + w / 2} ${y + h / 2})"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${a}" stroke="${ink}" stroke-width="${lw}"/>` +
      `<path d="M ${x + w * 0.2} ${y + h} C ${x + w * 0.22} ${y + h * 0.68} ${x + w * 0.78} ${y + h * 0.68} ${x + w * 0.8} ${y + h} Z" fill="${b}"/><circle cx="${x + w / 2}" cy="${y + h * 0.45}" r="${w * 0.2}" fill="${b}"/>` +
      `<path d="M ${x + w * 0.34} ${y + h * 0.42} L ${x + w * 0.66} ${y + h * 0.42}" stroke="${a}" stroke-width="${w * 0.07}"/>` +
      (crown ? `<path d="M ${x + w * 0.32} ${y + h * 0.26} L ${x + w * 0.38} ${y + h * 0.16} L ${x + w * 0.5} ${y + h * 0.24} L ${x + w * 0.62} ${y + h * 0.16} L ${x + w * 0.68} ${y + h * 0.26} Z" fill="${P.gold}" stroke="${ink}" stroke-width="${lw * 0.6}"/>` : '') +
      `<path d="M ${x + w * 0.36} ${y + h * 0.78} q ${w * 0.14} ${h * 0.08} ${w * 0.28} 0" fill="none" stroke="${P.gold}" stroke-width="${lw}"/>` +
      `<rect x="${x - 10}" y="${y - 8}" width="40" height="16" fill="${P.tape}" opacity="0.9" transform="rotate(-30 ${x} ${y})"/><rect x="${x + w - 30}" y="${y - 8}" width="40" height="16" fill="${P.tape}" opacity="0.9" transform="rotate(30 ${x + w} ${y})"/></g>`;
    s += poster(96, 330, 200, 280, -3, P.p1, P.p1b, false) + poster(340, 300, 180, 250, 2.5, P.p2, P.p2b, true);
    // acoustic foam, taped crooked
    s += `<g transform="rotate(-6 260 860)">`;
    for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) {
      const x = 130 + c * 128, y = 690 + r * 118;
      s += `<rect x="${x}" y="${y}" width="122" height="112" fill="${P.foam}" stroke="${ink}" stroke-width="${lw}"/>`;
      for (let k = 1; k < 5; k++) s += `<path d="M ${x + k * 24} ${y + 6} L ${x + k * 24} ${y + 106}" stroke="${P.foamS}" stroke-width="7"/>`;
    }
    s += `<rect x="150" y="676" width="60" height="22" fill="${P.tape}" transform="rotate(8 180 687)"/><rect x="330" y="1012" width="60" height="22" fill="${P.tape}" transform="rotate(-12 360 1023)"/></g>`;
    // the window : sunset, frost
    s += `<rect x="690" y="290" width="330" height="590" rx="10" fill="${P.base}" stroke="${ink}" stroke-width="${lw * 1.4}"/>`;
    s += `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.sky1}"/><stop offset="1" stop-color="${P.sky2}"/></linearGradient></defs>`;
    s += `<rect x="714" y="314" width="282" height="542" fill="url(#sky)" stroke="${ink}" stroke-width="${lw}"/>`;
    s += `<circle cx="880" cy="690" r="56" fill="#fff4cf" opacity="0.9"/>`;
    s += `<path d="M 714 856 L 714 720 L 760 720 L 760 690 L 800 690 L 800 740 L 850 740 L 850 700 L 900 700 L 900 760 L 960 760 L 960 715 L 996 715 L 996 856 Z" fill="${P.city}"/>`;
    s += ln(`M 855 314 L 855 856 M 714 585 L 996 585`, lw * 2.2) + ln(`M 855 314 L 855 856 M 714 585 L 996 585`, lw * 0.9, P.base);
    // frost on the glass corners
    const frost = (x, y, sx, sy) => ln(`M ${x} ${y} l ${sx * 60} ${sy * 40} M ${x + sx * 20} ${y + sy * 13} l ${sx * 6} ${sy * 22} M ${x + sx * 38} ${y + sy * 25} l ${sx * 20} ${sy * -6} M ${x} ${y} l ${sx * 30} ${sy * 70} M ${x + sx * 12} ${y + sy * 28} l ${sx * -14} ${sy * 10}`, 4, P.frost);
    s += frost(716, 316, 1, 1) + frost(994, 316, -1, 1) + frost(716, 854, 1, -1) + frost(994, 854, -1, -1);
    s += `<path d="M 714 856 q 30 -18 60 -6 q 40 -22 80 -4 q 50 -24 90 -6 q 30 -14 52 -8 L 996 856 Z" fill="${P.frost}" opacity="0.85"/>`;
    // floor, baseboard
    s += `<rect x="-40" y="1520" width="1160" height="440" fill="${P.floor}"/>` + sh(`M -40 1520 L 380 1520 L 200 1960 L -40 1960 Z`, P.floorS);
    if (S.shade !== 'soft') s += `<path d="M 600 1520 L 1080 1520 L 1080 1960 L 380 1960 Z" fill="${P.light}" opacity="0.28"/>`;
    s += `<rect x="-40" y="1504" width="1160" height="22" fill="${P.base}" stroke="${ink}" stroke-width="${lw}"/>`;
    // mattress on the floor, pillow, blanket
    s += `<path d="M -20 1600 L 360 1600 L 392 1660 L -20 1660 Z" fill="${P.mat}" stroke="${ink}" stroke-width="${lw}"/><path d="M -20 1660 L 392 1660 L 392 1712 L -20 1712 Z" fill="${P.matS}" stroke="${ink}" stroke-width="${lw}"/>`;
    s += `<path d="M 6 1590 C 4 1570 80 1560 120 1572 C 140 1590 130 1620 100 1626 C 60 1630 10 1620 6 1590 Z" fill="#ffffff" stroke="${ink}" stroke-width="${lw}"/>`;
    s += `<path d="M 170 1606 C 200 1580 260 1600 300 1588 C 340 1600 372 1620 380 1650 C 330 1668 230 1664 160 1650 Z" fill="${P.blanket}" stroke="${ink}" stroke-width="${lw}"/>` + ln(`M 210 1612 q 30 14 60 4 M 280 1606 q 26 18 60 14`, lw * 0.8);
    // desk, laptop showing an invented recording app (no logo)
    s += `<path d="M 716 1236 L 1060 1236 L 1060 1270 L 716 1270 Z" fill="${P.desk}" stroke="${ink}" stroke-width="${lw}"/>` + `<path d="M 736 1270 L 756 1270 L 756 1590 L 736 1590 Z M 1026 1270 L 1046 1270 L 1046 1590 L 1026 1590 Z" fill="${P.deskS}" stroke="${ink}" stroke-width="${lw}"/>`;
    s += `<path d="M 770 1214 L 1012 1214 L 1030 1236 L 752 1236 Z" fill="${P.lap}" stroke="${ink}" stroke-width="${lw}"/><rect x="786" y="1038" width="212" height="176" rx="8" fill="${P.lap}" stroke="${ink}" stroke-width="${lw}"/>`;
    s += `<rect x="798" y="1050" width="188" height="152" fill="${P.screen}"/>`;
    for (let lane = 0; lane < 2; lane++) { let d = ''; for (let i = 0; i < 26; i++) { const x = 808 + i * 7, a = 6 + Math.abs(Math.sin(i * 1.7 + lane * 2)) * 18; d += `M ${x} ${1090 + lane * 46 - a} L ${x} ${1090 + lane * 46 + a} `; } s += `<path d="${d}" stroke="${P.wave}" stroke-width="4" stroke-linecap="round"/>`; }
    s += `<circle cx="892" cy="1182" r="9" fill="#e5484d"/><rect x="808" y="1060" width="60" height="8" rx="4" fill="${P.wave}" opacity="0.6"/>`;
    // mic stand with pop filter
    s += ln(`M 760 1780 L 780 1260 M 720 1790 L 780 1700 L 840 1792 M 780 1700 L 790 1788`, lw * 1.6, P.metal) + ln(`M 780 1266 L 708 1010`, lw * 1.4, P.metal);
    s += `<rect x="686" y="960" width="40" height="76" rx="18" fill="${P.metal}" stroke="${ink}" stroke-width="${lw}" transform="rotate(-16 706 998)"/>`;
    s += `<circle cx="664" cy="1020" r="46" fill="${P.screen}" fill-opacity="0.35" stroke="${ink}" stroke-width="${lw}"/>` + ln(`M 640 990 L 690 1050 M 626 1018 L 682 1060 M 650 978 L 702 1030`, 2, P.metal);
    return s;
  }

  // ---------------- the whole frame ----------------
  window.TCRAZY = {
    STY,
    scene(id) {
      const S = STY[id] || STY[1], P = S.pal;
      UID = 0; for (const k in DOTS) delete DOTS[k];
      const back = room(S, P);
      const L = liam(S, P);
      const rough = S.rough ? `<filter id="rough" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7"/><feDisplacementMap in="SourceGraphic" scale="${S.rough}"/></filter>` : '';
      const paper = S.paper ? `<filter id="paper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" seed="11"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="table" tableValues="0 0.22"/></feComponentTransfer></filter>` : '';
      let s = `<defs>${rough}${paper}${L.defs}${dotDefs()}</defs>`;
      const g = (inner) => (S.rough ? `<g filter="url(#rough)">${inner}</g>` : inner);
      s += g(back);
      // warm light / cold neon over the scene
      if (S.shade === 'cel') s += `<rect width="1080" height="1920" fill="#ff9d4d" opacity="0.06"/>`;
      s += g(L.svg);
      if (S.shade === 'cel') s += `<path d="M 720 300 L 1080 300 L 1080 1920 L 420 1920 Z" fill="#ffd39a" opacity="0.10"/>`;
      if (S.paper) s += `<rect width="1080" height="1920" filter="url(#paper)" style="mix-blend-mode:multiply"/><rect x="10" y="10" width="1060" height="1900" fill="none" stroke="${S.ink}" stroke-width="10"/>`;
      return s;
    },
  };
})();
