/* Série « T-Crazy » — Liam's character sheets, Style 1 « Anime US » (chosen on 16/11), drawn in code.
   4 versions (face, hair, outfit), each : front, profile, 4 expressions (frime, colère, panique, fierté).
   Fixed by the owner (16/11) : all-black locs, no chain, the neck visible above the collar, straight eyes, a slim body,
   the Stalak-blue puffer he never takes off, spotless sneakers. (Marketing & croissance, 16/11/2026) */
(function () {
  const { STY, render, lerp, pt, r1 } = TCRAZY;
  const S = STY[1], P = S.pal, INK = S.ink;

  const VERS = {
    1: { name: 'LE CLASSIQUE', face: 'angular', brows: 'thick', hair: 'short', inner: '#f6f2ea', innerS: '#d3c8b6', pants: '#2d3b59', pantsS: '#1d283f', shoe: 'low',
      text: 'Locks courtes, doudoune ouverte sur un tee blanc, jean large.' },
    2: { name: 'LE CHIGNON', face: 'round', brows: 'thin', hair: 'bun', inner: '#9aa3b2', innerS: '#7b8394', pants: '#c4ad86', pantsS: '#9f8761', shoe: 'high', crop: true, cargo: true,
      text: 'Locks attachées en chignon, doudoune courte sur un sweat gris, cargo beige, montantes.' },
    3: { name: 'LE BANDEAU', face: 'long', brows: 'heavy', hair: 'band', inner: '#e3f0ff', innerS: '#bcd3ee', pants: '#1c1e26', pantsS: '#0f1015', shoe: 'low', vest: true,
      text: 'Locks plaquées en arrière sous un bandeau blanc, doudoune sans manches, jogging noir.' },
    4: { name: 'LE DEUX-TONS', face: 'wide', brows: 'slit', hair: 'long', inner: '#24262e', innerS: '#14151a', pants: '#7e9dca', pantsS: '#5e7dab', shoe: 'low', yoke: '#e6f2ff', earring: true,
      text: 'Locks longues, doudoune bleue aux épaules glace, tee noir, jean clair, une petite boucle.' },
  };

  // ---------------- the head, front view (local coordinates : face centre at 0,0) ----------------
  function locs(list, into, tf) {
    list.forEach(([root, end, bend, w], i) => {
      const c = [(root[0] + end[0]) / 2 + bend, (root[1] + end[1]) / 2];
      const q = (t) => lerp(lerp(root, c, t), lerp(c, end, t), t);
      let ticks = '';
      for (let t = 0.2; t < 0.95; t += 0.15) {
        const a = q(t), b = q(t + 0.02), dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, ww = (w || 16) * 0.38;
        ticks += `M ${pt([a[0] - dy / L * ww, a[1] + dx / L * ww])} L ${pt([a[0] + dy / L * ww, a[1] - dx / L * ww])} `;
      }
      into.push({ kind: 'stroke', d: `M ${pt(root)} Q ${pt(c)} ${pt(end)}`, w: w || 16, color: P.hair, tf,
        ticks: `<path d="${ticks}" stroke="${P.hairT}" stroke-width="3" stroke-linecap="round"/>` });
    });
  }
  const FACES = {
    angular: `M -70 -84 C -82 -54 -84 -18 -82 8 C -80 40 -72 62 -60 76 L -28 102 C -12 110 12 110 28 102 L 60 76 C 72 62 80 40 82 8 C 84 -18 82 -54 70 -84 Z`,
    round: `M -72 -80 C -88 -42 -90 14 -80 48 C -68 86 -36 106 0 108 C 36 106 68 86 80 48 C 90 14 88 -42 72 -80 Z`,
    long: `M -66 -86 C -78 -54 -80 -18 -78 10 C -76 44 -66 70 -50 88 L -22 112 C -10 120 10 120 22 112 L 50 88 C 66 70 76 44 78 10 C 80 -18 78 -54 66 -86 Z`,
    wide: `M -72 -84 C -86 -50 -90 -14 -88 10 C -86 38 -76 58 -62 72 L -30 100 C -14 108 14 108 30 100 L 62 72 C 76 58 86 38 88 10 C 90 -14 86 -50 72 -84 Z`,
  };
  function head(V, expr, tf, into) {
    const back = [], front = [];
    // hair behind
    if (V.hair === 'bun') {
      back.push({ d: `M -86 -20 C -98 -70 -86 -126 -36 -142 C -10 -150 10 -150 36 -142 C 86 -126 98 -70 86 -20 C 64 -44 -64 -44 -86 -20 Z`, fill: P.hair, tf });
      back.push({ d: `M -44 -150 C -48 -196 -12 -214 10 -210 C 44 -206 56 -176 46 -150 C 30 -140 -26 -138 -44 -150 Z`, fill: P.hair, tf,
        extra: `<path d="M -30 -164 q 20 -26 50 -18 M -34 -150 q 30 -16 70 -8 M -16 -192 q 22 -10 46 4" fill="none" stroke="${P.hairT}" stroke-width="3.2" stroke-linecap="round"/>` });
    } else {
      back.push({ d: `M -92 -10 C -104 -60 -96 -122 -40 -142 C -10 -152 10 -152 40 -142 C 96 -122 104 -60 92 -10 C 70 -36 -70 -36 -92 -10 Z`, fill: P.hair, tf });
      const len = V.hair === 'long' ? 70 : V.hair === 'band' ? 24 : 0;
      locs([[[-84, -60], [-112, 62 + len], -12], [[-94, -24], [-120, 44 + len], -8], [[-70, -96], [-104, 76 + len], -14], [[84, -60], [112, 62 + len], 12], [[94, -24], [120, 44 + len], 8], [[70, -96], [104, 76 + len], 14],
        [[-40, -120], [-86, 84 + len], -10], [[40, -120], [86, 84 + len], 10]], back, tf);
    }
    // the face and its expression
    into.push(...back);
    into.push({ d: FACES[V.face], fill: P.skin, tf, shade: `M -94 -90 L -44 -90 C -60 -40 -66 10 -50 58 C -40 86 -14 100 4 116 L -94 116 Z`, shadeColor: P.skinS, extra: face(V, expr) });
    // hair in front
    if (V.hair === 'short' || V.hair === 'long') {
      locs([[[-8, -138], [-72, -40], -34], [[-30, -132], [-88, -8], -26], [[8, -138], [72, -40], 34], [[30, -132], [88, -8], 26],
        [[-58, -114], [-98, 44 + (V.hair === 'long' ? 60 : 0)], -14, 17], [[58, -114], [98, 44 + (V.hair === 'long' ? 60 : 0)], 14, 17]], front, tf);
    } else if (V.hair === 'bun') {
      locs([[[-44, -126], [-86, 30], -18, 15], [[44, -126], [86, 30], 18, 15]], front, tf);
      front.push({ d: `M -70 -96 C -40 -134 40 -134 70 -96 C 40 -112 -40 -112 -70 -96 Z`, fill: P.hair, tf, inner: true });
    } else if (V.hair === 'band') {
      front.push({ d: `M -72 -96 C -40 -138 40 -138 72 -96 C 40 -116 -40 -116 -72 -96 Z`, fill: P.hair, tf, inner: true,
        extra: `<path d="M -50 -112 q 20 -14 40 -10 M 10 -122 q 24 -4 40 8" fill="none" stroke="${P.hairT}" stroke-width="3" stroke-linecap="round"/>` });
      front.push({ d: `M -80 -86 C -40 -104 40 -104 80 -86 L 82 -64 C 40 -82 -40 -82 -82 -64 Z`, fill: '#f4f9ff', tf, shade: `M -90 -80 L -40 -90 L -40 -60 L -90 -60 Z`, shadeColor: '#cfe2f5' });
    }
    if (V.earring) front.push({ d: `M -92 34 a 7 7 0 1 0 0.1 0 Z`, fill: '#e8edf5', tf, inner: true });
    into.push(...front);
  }

  // eyes, brows, nose, mouth for an expression
  function face(V, expr) {
    const lw = S.lw;
    let s = '';
    const eyeShape = (x, k, h) => (k < 0 ? `M ${x - 24} 6 Q ${x} ${6 - h} ${x + 24} 4 Q ${x} ${6 + h * 0.8} ${x - 24} 6 Z` : `M ${x - 24} 4 Q ${x} ${6 - h} ${x + 24} 6 Q ${x} ${6 + h * 0.8} ${x - 24} 4 Z`);
    const browW = { thick: 9, thin: 5, heavy: 12, slit: 9 }[V.brows];
    // brows by expression : [inner y, outer y] for each side
    const B = { frime: [[-18, -24], [-34, -26]], colere: [[-8, -30], [-8, -30]], panique: [[-40, -30], [-40, -30]], fierte: [[-30, -28], [-30, -28]] }[expr];
    [-1, 1].forEach((k, i) => {
      const x = k * 36;
      if (expr === 'fierte') { // closed, happy eyes
        s += `<path d="M ${x - 22} 8 Q ${x} -10 ${x + 22} 8" fill="none" stroke="${INK}" stroke-width="${lw * 1.7}" stroke-linecap="round"/>`;
      } else {
        const h = expr === 'panique' ? 22 : expr === 'colere' ? 9 : 12;
        const E = eyeShape(x, k, h);
        const ir = expr === 'panique' ? 6 : expr === 'colere' ? 7 : 9;
        s += `<path d="${E}" fill="#fbf7f1"/><clipPath id="e${k}${expr}${V.face}"><path d="${E}"/></clipPath><g clip-path="url(#e${k}${expr}${V.face})"><circle cx="${x + 1}" cy="5" r="${ir}" fill="#3a2214"/><circle cx="${x + 1}" cy="5" r="${ir / 2}" fill="#0d0805"/><circle cx="${x + 4}" cy="2" r="2.2" fill="#ffffff"/></g>`;
        const lid = expr === 'colere' ? (k < 0 ? `M ${x - 26} 0 Q ${x} -6 ${x + 26} 8` : `M ${x - 26} 8 Q ${x} -6 ${x + 26} 0`)
          : expr === 'panique' ? `M ${x - 26} 4 Q ${x} -22 ${x + 26} 4` : (k < 0 ? `M ${x - 26} 8 Q ${x - 2} -10 ${x + 26} 2` : `M ${x - 26} 2 Q ${x + 2} -10 ${x + 26} 8`);
        s += `<path d="${lid}" fill="none" stroke="${INK}" stroke-width="${lw * (expr === 'panique' ? 1.2 : 1.9)}" stroke-linecap="round"/>`;
        if (expr === 'panique') s += `<path d="M ${x - 18} 20 Q ${x} 26 ${x + 18} 19" fill="none" stroke="${INK}" stroke-width="${lw * 0.6}"/>`;
      }
      const [yi, yo] = B[i === 0 ? 0 : 1];
      const inner = [k * 14, yi], outer = [k * 60, yo];
      const mid = [k * 37, Math.min(yi, yo) - (expr === 'panique' ? 6 : 3)];
      s += `<path d="M ${pt(inner)} Q ${pt(mid)} ${pt(outer)}" fill="none" stroke="${INK}" stroke-width="${browW}" stroke-linecap="round"/>`;
      if (V.brows === 'slit' && k > 0) s += `<path d="M ${k * 44} ${yo - 10} L ${k * 40} ${yo + 10}" stroke="${P.skin}" stroke-width="5"/>`;
    });
    s += `<path d="M 2 16 L -4 40 L 8 42" fill="none" stroke="${INK}" stroke-width="${lw * 0.9}" stroke-linecap="round" stroke-linejoin="round"/>`;
    if (expr === 'frime') s += `<path d="M -24 66 C -6 72 16 68 32 54" fill="none" stroke="${INK}" stroke-width="${lw * 1.2}" stroke-linecap="round"/><path d="M 10 66 L 28 58 L 26 64 Z" fill="#ffffff"/>`;
    if (expr === 'colere') s += `<path d="M -30 58 L 30 58 C 32 76 -32 76 -30 58 Z" fill="#ffffff" stroke="${INK}" stroke-width="${lw}"/><path d="M -28 66 L 28 66 M -10 58 L -10 74 M 10 58 L 10 74" stroke="${INK}" stroke-width="${lw * 0.6}"/>`;
    if (expr === 'panique') s += `<path d="M -16 56 C -18 86 18 86 16 56 C 10 50 -10 50 -16 56 Z" fill="#3b1612" stroke="${INK}" stroke-width="${lw}"/><path d="M -8 74 q 8 -6 16 0" fill="none" stroke="#c4535a" stroke-width="5"/>` +
      `<path d="M 74 -50 q 10 16 0 26 q -10 -10 0 -26 Z" fill="#bfe6ff" stroke="${INK}" stroke-width="2.5"/><path d="M -80 -40 q 8 14 0 22 q -8 -8 0 -22 Z" fill="#bfe6ff" stroke="${INK}" stroke-width="2.5"/>`;
    if (expr === 'fierte') s += `<path d="M -32 56 C -14 82 18 82 34 54 Z" fill="#ffffff" stroke="${INK}" stroke-width="${lw * 1.1}" stroke-linejoin="round"/><path d="M -28 60 L 30 60" stroke="${INK}" stroke-width="${lw * 0.5}"/>`;
    return s;
  }

  // ---------------- full body, front, neutral pose ----------------
  function bodyFront(V) {
    const hs = 1.3, N = [450, 846], F = [450, 846 - 124 * hs], hip = 1206, ank = hip + 490 * 0.96;
    const htf = `translate(${F[0]} ${r1(F[1])}) scale(${hs})`;
    const parts = [];
    const backHair = [];
    // trousers
    const pl = V.pants, pS = V.pantsS;
    parts.push({ d: `M 342 ${hip - 24} L 558 ${hip - 24} C 566 ${hip + 154} 576 ${hip + 317} 580 ${ank} L 468 ${ank} C 464 ${hip + 250} 458 ${hip + 144} 450 ${hip + 113} C 442 ${hip + 144} 436 ${hip + 250} 432 ${ank} L 320 ${ank} C 324 ${hip + 317} 334 ${hip + 154} 342 ${hip - 24} Z`,
      fill: pl, shade: `M 300 ${hip - 30} L 366 ${hip - 30} L 376 ${ank + 10} L 300 ${ank + 10} Z M 450 ${hip + 100} L 466 ${hip + 100} L 486 ${ank + 10} L 436 ${ank + 10} Z`, shadeColor: pS,
      extra: `<path d="M 328 ${ank - 40} q 30 -16 60 0 q 22 12 40 -4 M 472 ${ank - 44} q 30 -16 62 0 q 22 10 42 -6 M 350 ${hip + 200} q 24 20 56 8 M 494 ${hip + 220} q 26 16 56 4" fill="none" stroke="${INK}" stroke-width="${r1(S.lw * 0.8)}" stroke-linecap="round"/>` +
        (V.cargo ? `<path d="M 330 ${hip + 230} l 44 0 l 2 70 l -44 0 Z M 526 ${hip + 230} l 44 0 l -2 70 l -44 0 Z" fill="${pS}" stroke="${INK}" stroke-width="${S.lw}"/>` : '') });
    // sneakers (high-tops for version 2)
    [[368, -1], [532, 1]].forEach(([cx, sg]) => {
      const z = 0.8, stf = `translate(${cx} ${ank}) scale(${z}) translate(${-cx} ${-ank})`;
      const top = V.shoe === 'high' ? -70 : -20;
      parts.push({ d: `M ${cx - 92 * sg} ${ank + 62} C ${cx - 98 * sg} ${ank + 18} ${cx - 80 * sg} ${ank + top} ${cx - 40 * sg} ${ank + top} L ${cx + 26 * sg} ${ank + top + 4} C ${cx + 40 * sg} ${ank - 6} ${cx + 96 * sg} ${ank + 18} ${cx + 104 * sg} ${ank + 52} L ${cx + 104 * sg} ${ank + 70} L ${cx - 92 * sg} ${ank + 70} Z`,
        fill: P.shoe, tf: stf, shade: `M ${cx - 110 * sg} ${ank + 24} L ${cx + 120 * sg} ${ank + 32} L ${cx + 120 * sg} ${ank + 60} L ${cx - 110 * sg} ${ank + 60} Z`, shadeColor: P.shoeS,
        extra: `<path d="M ${cx - 92 * sg} ${ank + 52} L ${cx + 104 * sg} ${ank + 52} L ${cx + 104 * sg} ${ank + 70} L ${cx - 92 * sg} ${ank + 70} Z" fill="${P.sole}" stroke="${INK}" stroke-width="${S.lw}"/>` +
          `<path d="M ${cx - 30 * sg} ${ank - 6} l 22 16 M ${cx - 10 * sg} ${ank - 10} l 22 16" stroke="${INK}" stroke-width="${r1(S.lw * 0.8)}" stroke-linecap="round"/>` });
    });
    // neck
    parts.push({ d: `M 424 ${N[1] - 70} L 476 ${N[1] - 70} L 478 ${N[1] + 56} C 460 ${N[1] + 66} 440 ${N[1] + 66} 422 ${N[1] + 56} Z`, fill: P.skin, shade: `M 410 ${N[1] - 80} L 490 ${N[1] - 80} L 490 ${N[1] - 30} C 460 ${N[1] - 16} 440 ${N[1] - 16} 410 ${N[1] - 30} Z`, shadeColor: P.skinS });
    // inner layer : sleeves (vest version shows long sleeves), hoodie hem for the cropped jacket
    if (V.crop) parts.push({ d: `M 350 1110 L 550 1110 L 556 1232 C 500 1246 400 1246 344 1232 Z`, fill: V.inner, shade: `M 330 1100 L 390 1100 L 390 1250 L 330 1250 Z`, shadeColor: V.innerS });
    // the puffer
    const rows = V.crop ? [880, 940, 1000, 1060, 1124] : [880, 950, 1020, 1090, 1160, 1218];
    const wide = V.crop ? [112, 128, 124, 128, 118] : [112, 128, 122, 128, 122, 114];
    const n = rows.length - 1;
    let jk = `M 400 872 C 380 868 352 870 ${450 - wide[0]} ${rows[0]}`;
    for (let i = 0; i < n; i++) jk += ` C ${450 - wide[i] - 18} ${rows[i] + 22} ${450 - wide[i + 1] - 18} ${rows[i + 1] - 22} ${450 - wide[i + 1]} ${rows[i + 1]}`;
    jk += ` C 380 ${rows[n] + 14} 520 ${rows[n] + 14} ${450 + wide[n]} ${rows[n]}`;
    for (let i = n; i > 0; i--) jk += ` C ${450 + wide[i] + 18} ${rows[i] - 22} ${450 + wide[i - 1] + 18} ${rows[i - 1] + 22} ${450 + wide[i - 1]} ${rows[i - 1]}`;
    jk += ` C 548 870 520 868 500 872 L 482 896 L 418 896 L 400 872 Z`;
    const quilts = rows.slice(1, n).map(y => `M ${450 - 134} ${y} C 356 ${y + 14} 392 ${y + 14} 416 ${y + 8} M 484 ${y + 8} C 508 ${y + 14} 544 ${y + 14} ${450 + 134} ${y}`).join(' ');
    const gloss = rows.slice(0, n).map((y, i) => `M ${344 + (i % 2) * 6} ${y + 26} q 22 -12 48 -10 M ${508 + (i % 2) * 4} ${y + 18} q 26 -4 46 8`).join(' ');
    const yoke = V.yoke ? `<path d="M 338 880 C 360 868 400 872 418 896 L 412 940 C 380 930 350 934 330 948 Z M 562 880 C 540 868 500 872 482 896 L 488 940 C 520 930 550 934 570 948 Z" fill="${V.yoke}" stroke="${INK}" stroke-width="${S.lw}"/>` : '';
    parts.push({ d: jk, fill: P.jacket, shade: `M 300 860 L 386 860 C 368 960 376 1090 404 1240 L 300 1240 Z`, shadeColor: P.jacketS,
      extra: yoke + `<path d="${quilts}" fill="none" stroke="${INK}" stroke-width="${S.lw}" stroke-linecap="round"/><path d="${gloss}" fill="none" stroke="${P.jacketH}" stroke-width="${r1(S.lw * 2.2)}" stroke-linecap="round" opacity="0.85"/>` });
    const bottom = rows[n] + 4;
    parts.push({ d: `M 424 896 L 450 926 L 476 896 L 482 896 L 484 ${bottom} L 416 ${bottom} L 418 896 Z`, fill: V.inner, inner: true, shade: `M 410 890 L 436 890 L 432 ${bottom + 10} L 410 ${bottom + 10} Z`, shadeColor: V.innerS });
    parts.push({ d: `M 414 900 L 416 ${bottom} M 486 900 L 484 ${bottom}`, fill: 'none', inner: true });
    [-1, 1].forEach(sg => parts.push({ d: `M ${450 + sg * 24} 872 C ${450 + sg * 42} 866 ${450 + sg * 72} 870 ${450 + sg * 80} 888 C ${450 + sg * 86} 906 ${450 + sg * 72} 920 ${450 + sg * 54} 916 C ${450 + sg * 42} 914 ${450 + sg * 30} 906 ${450 + sg * 24} 896 Z`,
      fill: V.yoke || P.jacket, shade: sg < 0 ? `M 350 880 L 400 880 L 400 930 L 350 930 Z` : null, shadeColor: V.yoke ? '#c8dcf2' : P.jacketS }));
    // arms down, relaxed
    const arm = (sh, el, wr) => parts.push({ kind: 'stroke', d: `M ${pt(sh)} L ${pt(el)} L ${pt(wr)}`, w: V.vest ? 46 : 64, color: V.vest ? V.inner : P.jacket,
      tip: V.vest ? null : `M ${pt(lerp(sh, el, 0.15))} L ${pt(lerp(sh, el, 0.75))}`, tipColor: P.jacketH, tipW: 9 });
    arm([352, 910], [322, 1040], [320, 1150]);
    arm([548, 910], [578, 1040], [580, 1150]);
    [[320, 1186], [580, 1186]].forEach(([x, y]) => parts.push({ d: `M ${x - 26} ${y - 24} C ${x - 32} ${y + 10} ${x - 20} ${y + 34} ${x} ${y + 34} C ${x + 20} ${y + 34} ${x + 32} ${y + 10} ${x + 26} ${y - 24} Z`, fill: P.skin,
      shade: `M ${x - 40} ${y - 30} L ${x - 6} ${y - 30} L ${x - 6} ${y + 40} L ${x - 40} ${y + 40} Z`, shadeColor: P.skinS }));
    head(V, 'frime', htf, parts);
    return render(parts, S, P);
  }

  // ---------------- full body, profile (facing right) ----------------
  function bodyProfile(V) {
    const hs = 1.3, F = [470, 846 - 124 * hs], hip = 1206, ank = hip + 470;
    const htf = `translate(${F[0]} ${r1(F[1])}) scale(${hs})`;
    const parts = [];
    // legs : back leg, front leg
    const leg = (x0, x1, c, cS) => parts.push({ d: `M ${x0 - 44} ${hip - 20} L ${x0 + 54} ${hip - 20} C ${x0 + 60} ${hip + 200} ${x1 + 58} ${ank - 160} ${x1 + 56} ${ank} L ${x1 - 52} ${ank} C ${x1 - 54} ${ank - 160} ${x0 - 50} ${hip + 200} ${x0 - 44} ${hip - 20} Z`,
      fill: c, shade: `M ${x0 - 60} ${hip} L ${x0 - 20} ${hip} L ${x1 - 20} ${ank + 10} L ${x1 - 70} ${ank + 10} Z`, shadeColor: cS,
      extra: `<path d="M ${x1 - 40} ${ank - 40} q 30 -14 70 -2 M ${x1 - 36} ${ank - 90} q 28 -12 60 0" fill="none" stroke="${INK}" stroke-width="${r1(S.lw * 0.8)}"/>` + (V.cargo ? `<path d="M ${x0 - 26} ${hip + 220} l 52 0 l 2 66 l -52 0 Z" fill="${cS}" stroke="${INK}" stroke-width="${S.lw}"/>` : '') });
    leg(440, 420, V.pantsS, V.pantsS);
    leg(470, 500, V.pants, V.pantsS);
    // sneakers, side view (toe to the right)
    [[420, 0.92], [500, 1]].forEach(([x, k]) => {
      const top = V.shoe === 'high' ? 64 : 22;
      parts.push({ d: `M ${x - 60} ${ank + 66} L ${x - 60} ${ank - top} C ${x - 30} ${ank - top - 6} ${x + 6} ${ank - top} ${x + 16} ${ank - 6} C ${x + 60} ${ank} ${x + 110} ${ank + 18} ${x + 112} ${ank + 50} L ${x + 112} ${ank + 66} Z`,
        fill: k < 1 ? P.shoeS : P.shoe, shade: `M ${x - 70} ${ank + 30} L ${x + 120} ${ank + 36} L ${x + 120} ${ank + 60} L ${x - 70} ${ank + 60} Z`, shadeColor: P.shoeS,
        extra: `<path d="M ${x - 60} ${ank + 48} L ${x + 112} ${ank + 48} L ${x + 112} ${ank + 66} L ${x - 60} ${ank + 66} Z" fill="${P.sole}" stroke="${INK}" stroke-width="${S.lw}"/><path d="M ${x - 10} ${ank - 8} l 16 18 M ${x + 10} ${ank - 4} l 14 16" stroke="${INK}" stroke-width="${r1(S.lw * 0.8)}" stroke-linecap="round"/>` });
    });
    // neck
    parts.push({ d: `M 452 750 L 500 760 L 506 900 L 446 896 Z`, fill: P.skin, shade: `M 440 740 L 470 740 L 470 900 L 440 900 Z`, shadeColor: P.skinS });
    if (V.crop) parts.push({ d: `M 384 1110 L 560 1110 L 566 1232 L 380 1232 Z`, fill: V.inner, shade: `M 370 1100 L 420 1100 L 420 1250 L 370 1250 Z`, shadeColor: V.innerS });
    // the puffer from the side : bulky back on the left, chest on the right
    const bottom = V.crop ? 1126 : 1218;
    parts.push({ d: `M 440 880 C 400 878 372 900 366 940 C 356 980 368 1010 362 1050 C 356 1090 370 1120 368 ${bottom - 20} C 368 ${bottom} 390 ${bottom + 8} 420 ${bottom + 8} L 540 ${bottom + 8} C 566 ${bottom + 8} 576 ${bottom - 8} 574 ${bottom - 30} C 580 1080 584 1040 578 1000 C 584 960 576 920 556 896 C 540 880 514 880 500 884 Z`,
      fill: P.jacket, shade: `M 340 860 L 410 860 L 420 1240 L 340 1240 Z`, shadeColor: P.jacketS,
      extra: (V.yoke ? `<path d="M 380 900 C 420 880 470 880 520 890 L 528 946 C 480 936 420 938 374 952 Z" fill="${V.yoke}" stroke="${INK}" stroke-width="${S.lw}"/>` : '') +
        `<path d="M 366 970 q 104 18 212 0 M 364 1040 q 106 18 214 0 ${V.crop ? '' : 'M 368 1110 q 104 16 206 0'}" fill="none" stroke="${INK}" stroke-width="${S.lw}" stroke-linecap="round"/>` +
        `<path d="M 540 910 q 22 14 30 40 M 548 990 q 18 10 22 30" fill="none" stroke="${P.jacketH}" stroke-width="${r1(S.lw * 2.2)}" stroke-linecap="round" opacity="0.85"/>` });
    // collar, folded open : the neck stays visible
    parts.push({ d: `M 430 878 C 440 862 480 860 506 874 C 520 884 516 902 498 904 C 470 900 446 902 430 896 Z`, fill: V.yoke || P.jacket });
    // the arm hanging in front of the body, hand
    parts.push({ kind: 'stroke', d: `M 468 914 L 476 1046 L 492 1150`, w: V.vest ? 46 : 64, color: V.vest ? V.inner : P.jacket, tip: V.vest ? null : `M 470 940 L 476 1030`, tipColor: P.jacketH, tipW: 9 });
    parts.push({ d: `M 470 1166 C 470 1196 490 1218 510 1214 C 528 1210 530 1184 522 1164 Z`, fill: P.skin, shade: `M 460 1160 L 490 1160 L 490 1220 L 460 1220 Z`, shadeColor: P.skinS });
    headProfile(V, htf, parts);
    return render(parts, S, P);
  }

  function headProfile(V, tf, into) {
    // hair mass at the back
    if (V.hair === 'bun') {
      into.push({ d: `M -70 -60 C -84 -110 -40 -150 10 -146 C 48 -142 70 -120 66 -96 C 30 -110 -10 -100 -40 -60 C -50 -40 -60 -30 -70 -60 Z`, fill: P.hair, tf });
      into.push({ d: `M -64 -150 C -84 -196 -30 -214 -6 -196 C 14 -180 6 -150 -16 -140 C -34 -134 -54 -138 -64 -150 Z`, fill: P.hair, tf,
        extra: `<path d="M -60 -164 q 18 -22 44 -14 M -50 -146 q 22 -10 40 -2" fill="none" stroke="${P.hairT}" stroke-width="3.2" stroke-linecap="round"/>` });
    } else {
      into.push({ d: `M -86 10 C -104 -60 -70 -146 0 -148 C 50 -150 76 -118 70 -86 C 40 -110 -10 -96 -34 -60 C -44 -30 -60 0 -86 10 Z`, fill: P.hair, tf });
      const len = V.hair === 'long' ? 70 : V.hair === 'band' ? 24 : 0;
      locs([[[-40, -120], [-96, 70 + len], -20], [[-60, -96], [-110, 50 + len], -12], [[-20, -134], [-78, 86 + len], -24], [[-70, -60], [-112, 30 + len], -8], [[-4, -140], [-54, 96 + len], -20]], into, tf);
    }
    // the face in profile, facing right
    into.push({ d: `M -40 -96 C 10 -116 56 -96 64 -54 C 68 -36 66 -24 70 -12 L 90 20 C 92 26 86 30 78 30 L 74 36 C 80 42 80 48 74 52 L 68 56 C 76 60 76 68 68 72 C 68 86 62 98 46 104 C 24 110 -2 106 -20 92 C -40 70 -50 30 -50 -10 C -50 -50 -48 -80 -40 -96 Z`,
      fill: P.skin, tf, shade: `M -60 -100 L -10 -100 C -20 -40 -18 20 0 60 C 10 84 20 100 40 112 L -60 112 Z`, shadeColor: P.skinS,
      extra: `<path d="M 34 -6 Q 46 -14 58 -4 Q 48 6 34 -6 Z" fill="#fbf7f1"/><circle cx="52" cy="-5" r="5.5" fill="#1d120c"/><path d="M 30 -10 Q 46 -22 62 -8" fill="none" stroke="${INK}" stroke-width="${S.lw * 1.8}" stroke-linecap="round"/>` +
        `<path d="M 24 -30 Q 44 -38 64 -30" fill="none" stroke="${INK}" stroke-width="${({ thick: 9, thin: 5, heavy: 12, slit: 9 })[V.brows]}" stroke-linecap="round"/>` +
        `<path d="M 58 58 Q 64 62 70 60" fill="none" stroke="${INK}" stroke-width="${S.lw}" stroke-linecap="round"/><path d="M -8 10 C -24 6 -26 30 -12 36" fill="none" stroke="${INK}" stroke-width="${S.lw}"/>` });
    if (V.hair === 'short' || V.hair === 'long') locs([[[10, -138], [44, -60], 22, 15], [[-14, -132], [8, -40], 16, 15]], into, tf);
    if (V.hair === 'band') into.push({ d: `M -70 -90 C -20 -112 30 -112 66 -92 L 66 -70 C 30 -90 -20 -90 -72 -66 Z`, fill: '#f4f9ff', tf, shade: `M -80 -90 L -30 -100 L -30 -60 L -80 -60 Z`, shadeColor: '#cfe2f5' });
    if (V.earring) into.push({ d: `M -14 44 a 7 7 0 1 0 0.1 0 Z`, fill: '#e8edf5', tf, inner: true });
  }

  // ---------------- the sheet ----------------
  function sheet(id) {
    const V = VERS[id];
    let defs = '', body = '';
    const add = (r, tf) => { defs += r.defs; body += `<g transform="${tf}">${r.svg}</g>`; };
    // background, panels
    let s = `<rect width="1200" height="1600" fill="#1f6fd6"/>`;
    s += `<text x="600" y="78" text-anchor="middle" font-family="Lilita One" font-size="62" fill="#fdfeff" stroke="#0a0d14" stroke-width="9" paint-order="stroke">LIAM · VERSION ${id} : ${V.name}</text>`;
    s += `<text x="600" y="122" text-anchor="middle" font-family="Rubik" font-weight="700" font-size="25" fill="#d6ecff">${V.text}</text>`;
    const panel = (x, y, w, h) => `<rect x="${x + 5}" y="${y + 9}" width="${w}" height="${h}" rx="22" fill="#0a0d14"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="22" fill="#f1e2d3" stroke="#0a0d14" stroke-width="6"/>`;
    s += panel(30, 150, 560, 930) + panel(610, 150, 560, 930);
    for (let i = 0; i < 4; i++) s += panel(30 + i * 288, 1110, 270, 390);
    // front and profile (local bodies span about x 280-620, y 440-1760)
    add(bodyFront(V), `translate(310 168) scale(0.66) translate(-450 -450)`);
    add(bodyProfile(V), `translate(890 168) scale(0.66) translate(-470 -450)`);
    // 4 expressions : heads
    ['frime', 'colere', 'panique', 'fierte'].forEach((ex, i) => {
      const parts = [];
      head(V, ex, '', parts);
      const r = render(parts, S, P);
      const tilt = ex === 'fierte' ? -6 : ex === 'colere' ? 4 : 0;
      add(r, `translate(${165 + i * 288} ${1290}) rotate(${tilt}) scale(${V.hair === 'bun' ? 0.88 : 0.98})`);
    });
    s += body;
    ['PROFIL', 'DE FACE'].forEach((t, i) => { s += `<text x="${i ? 310 : 890}" y="1062" text-anchor="middle" font-family="Lilita One" font-size="34" fill="#0a0d14">${i ? 'DE FACE' : 'DE PROFIL'}</text>`; });
    ['FRIME', 'COLÈRE', 'PANIQUE', 'FIERTÉ'].forEach((t, i) => { s += `<text x="${165 + i * 288}" y="1478" text-anchor="middle" font-family="Lilita One" font-size="34" fill="#0a0d14">${t}</text>`; });
    return `<defs>${defs}</defs>` + s;
  }

  window.LIAM = { VERS, sheet };
})();
