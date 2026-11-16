/* Série « T-Crazy » — the other characters, drawn in code in the chosen style (Style 1 « Anime US »), like Liam (liam.js).
   Nadia, Deuce, Maya, Big Mo and M. Reyes : 2 versions each. Each sheet : front, profile, 4 expressions.
   The mascot is not redrawn : the owner keeps the official one (16/11, 3 h 27) ; its sheet shows its own stickers in Liam's phone.
   The owner's tastes applied : compact heads in profile, no team or brand logo, nothing taken from another series.
   (Marketing & croissance, 16/11/2026) */
(function () {
  const { STY, render, lerp, pt, r1 } = TCRAZY;
  const S = STY[1], INK = S.ink, LW = S.lw;

  // ---------------- helpers ----------------
  // a smooth path through points (Catmull-Rom) ; a point [x, y, 1] is a corner
  function smooth(pts, closed = true) {
    const n = pts.length, g = (i) => (closed ? pts[((i % n) + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
    let d = `M ${pt(pts[0])}`;
    const m = closed ? n : n - 1;
    for (let i = 0; i < m; i++) {
      const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
      const c1 = p1[2] ? p1 : [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = p2[2] ? p2 : [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += ` C ${pt(c1)} ${pt(c2)} ${pt(p2)}`;
    }
    return d + (closed ? ' Z' : '');
  }
  // a symmetric outline around x = cx, from its right half (top centre → bottom centre)
  function sym(right, cx = 450) {
    const R = right.map(p => [cx + p[0], p[1], p[2]]);
    const L = right.slice(1, -1).reverse().map(p => [cx - p[0], p[1], p[2]]);
    return smooth(R.concat(L));
  }
  const at = (pts, dx = 0, dy = 0, sx = 1) => pts.map(p => [dx + p[0] * sx, dy + p[1], p[2]]);
  const part = (d, fill, o = {}) => Object.assign({ d, fill }, o);
  const ln = (d, color = INK, w = LW, extra = '') => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${r1(w)}" stroke-linecap="round" stroke-linejoin="round"${extra}/>`;
  const dot = (x, y, r, fill, extra = '') => `<circle cx="${r1(x)}" cy="${r1(y)}" r="${r1(r)}" fill="${fill}"${extra}/>`;
  const overlay = (svg, tf, at = [0, 0]) => Object.assign({ d: `M ${at[0]} ${at[1]} Z`, fill: 'none', inner: true, noLine: true, extra: svg }, tf ? { tf } : {});
  // scalloped outline (afro puff, fur, bun) : arcs that bulge out between points of an ellipse
  function fluffy(cx, cy, rx, ry, n = 16, puff = 0.18, rot = 0) {
    const P = (a, k) => [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k];
    let d = `M ${pt(P(rot, 1))}`;
    for (let i = 1; i <= n; i++) d += ` Q ${pt(P(rot + (i - 0.5) / n * Math.PI * 2, 1 + puff))} ${pt(P(rot + i / n * Math.PI * 2, 1))}`;
    return d + ' Z';
  }
  // a braid or a twist : a rope with diagonal ridges
  function braid(root, end, bend, w, color, ridge, into, tf) {
    const c = [(root[0] + end[0]) / 2 + bend, (root[1] + end[1]) / 2], q = (t) => lerp(lerp(root, c, t), lerp(c, end, t), t);
    const L = Math.hypot(end[0] - root[0], end[1] - root[1]) + Math.abs(bend) * 0.5, n = Math.max(3, Math.round(L / (w * 0.9)));
    let r = '';
    for (let i = 1; i < n; i++) {
      const t = i / n, p = q(t), p2 = q(Math.min(1, t + 0.01));
      let dx = p2[0] - p[0], dy = p2[1] - p[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
      const nx = -dy, ny = dx, h = w * 0.5;
      r += `M ${pt([p[0] + nx * h * 0.86 - dx * h * 0.6, p[1] + ny * h * 0.86 - dy * h * 0.6])} L ${pt([p[0] + dx * h * 0.3, p[1] + dy * h * 0.3])} L ${pt([p[0] - nx * h * 0.86 - dx * h * 0.6, p[1] - ny * h * 0.86 - dy * h * 0.6])} `;
    }
    into.push({ kind: 'stroke', d: `M ${pt(root)} Q ${pt(c)} ${pt(end)}`, w, color, tf, ticks: ln(r, ridge, 2.2) });
  }

  // ---------------- body pieces, front view (centre x = 450, neck base y = 846) ----------------
  function handF(parts, K, x, y, z = 1) {
    if (z !== 1) { const p = []; handF(p, K, 0, 0); p.forEach(q => { q.tf = `translate(${x} ${y}) scale(${z})`; parts.push(q); }); return; }
    parts.push(part(`M ${x - 26} ${y - 24} C ${x - 32} ${y + 10} ${x - 20} ${y + 34} ${x} ${y + 34} C ${x + 20} ${y + 34} ${x + 32} ${y + 10} ${x + 26} ${y - 24} Z`, K.skin,
      { shade: `M ${x - 40} ${y - 30} L ${x - 6} ${y - 30} L ${x - 6} ${y + 40} L ${x - 40} ${y + 40} Z`, shadeColor: K.skinS }));
  }
  function arm(parts, sh, el, wr, w, color, o = {}) {
    if (o.under) { parts.push({ kind: 'stroke', d: `M ${pt(lerp(el, wr, 0.6))} L ${pt(wr)}`, w: w - 10, color: o.under }); wr = lerp(el, wr, 0.86); }
    parts.push(Object.assign({ kind: 'stroke', d: `M ${pt(sh)} L ${pt(el)} L ${pt(wr)}`, w, color },
      o.shine ? { tip: `M ${pt(lerp(sh, el, 0.15))} L ${pt(lerp(sh, el, 0.75))}`, tipColor: o.shine, tipW: 9 } : {}));
    if (o.cuff) parts.push({ kind: 'stroke', d: `M ${pt(lerp(el, wr, 0.88))} L ${pt(wr)}`, w: w - 4, color: o.cuff });
    if (o.stripe) parts.push({ kind: 'stroke', d: `M ${pt(lerp(sh, el, 0.08))} L ${pt(el)} L ${pt(lerp(el, wr, 0.8))}`, w: 5, color: o.stripe, noLine: true });
  }
  function neckF(parts, K, w = 25, bottom = 902) {
    parts.push(part(`M ${450 - w} 776 L ${450 + w} 776 L ${450 + w + 2} ${bottom} C ${450 + 10} ${bottom + 10} ${450 - 10} ${bottom + 10} ${450 - w - 2} ${bottom} Z`, K.skin,
      { shade: `M ${430 - w} 766 L ${470 + w} 766 L ${470 + w} 816 C 460 830 440 830 ${430 - w} 816 Z`, shadeColor: K.skinS }));
  }
  function pantsF(parts, o) {
    const { top, ank, tw, ao, ai, cd = 136, fill, shade } = o, x = 450;
    const d = `M ${x - tw} ${top} L ${x + tw} ${top} C ${x + tw + 8} ${top + 178} ${x + ao - 4} ${ank - 160} ${x + ao} ${ank} L ${x + ai} ${ank} C ${x + ai - 4} ${top + 274} ${x + 8} ${top + 168} ${x} ${top + cd} C ${x - 8} ${top + 168} ${x - ai + 4} ${top + 274} ${x - ai} ${ank} L ${x - ao} ${ank} C ${x - ao + 4} ${ank - 160} ${x - tw - 8} ${top + 178} ${x - tw} ${top} Z`;
    const folds = `M ${x - ao + 8} ${ank - 40} q 30 -16 60 0 q 20 12 36 -4 M ${x + ai + 6} ${ank - 44} q 30 -16 60 0 q 20 10 36 -6 M ${x - tw + 10} ${top + 230} q 24 20 56 8 M ${x + tw - 70} ${top + 250} q 26 16 56 4`;
    parts.push(part(d, fill, { shade: `M ${x - tw - 40} ${top - 10} L ${x - tw + 26} ${top - 10} L ${x - ao + 40} ${ank + 10} L ${x - ao - 20} ${ank + 10} Z M ${x} ${top + cd - 14} L ${x + 16} ${top + cd - 14} L ${x + ai + 20} ${ank + 10} L ${x - 14} ${ank + 10} Z`, shadeColor: shade,
      extra: ln(folds, INK, LW * 0.8) + (o.extra || '') }));
  }
  function sneakerF(parts, cx, ank, sg, o) {
    const z = o.z || 0.8, stf = `translate(${cx} ${ank}) scale(${z}) translate(${-cx} ${-ank})`, top = o.high ? -70 : -20;
    parts.push({ d: `M ${cx - 92 * sg} ${ank + 62} C ${cx - 98 * sg} ${ank + 18} ${cx - 80 * sg} ${ank + top} ${cx - 40 * sg} ${ank + top} L ${cx + 26 * sg} ${ank + top + 4} C ${cx + 40 * sg} ${ank - 6} ${cx + 96 * sg} ${ank + 18} ${cx + 104 * sg} ${ank + 52} L ${cx + 104 * sg} ${ank + 70} L ${cx - 92 * sg} ${ank + 70} Z`,
      fill: o.c, tf: stf, shade: `M ${cx - 110 * sg} ${ank + 24} L ${cx + 120 * sg} ${ank + 32} L ${cx + 120 * sg} ${ank + 60} L ${cx - 110 * sg} ${ank + 60} Z`, shadeColor: o.s,
      extra: `<path d="M ${cx - 92 * sg} ${ank + 52} L ${cx + 104 * sg} ${ank + 52} L ${cx + 104 * sg} ${ank + 70} L ${cx - 92 * sg} ${ank + 70} Z" fill="${o.sole}" stroke="${INK}" stroke-width="${LW}"/>` +
        ln(`M ${cx - 30 * sg} ${ank - 6} l 22 16 M ${cx - 10 * sg} ${ank - 10} l 22 16`, o.lace || INK, LW * 0.8) + (o.mark ? ln(`M ${cx - 50 * sg} ${ank + 36} q ${40 * sg} -4 ${80 * sg} -22`, o.mark, 6) : '') });
  }
  function clogF(parts, cx, ank, o) {
    parts.push(part(`M ${cx - 46} ${ank + 40} C ${cx - 52} ${ank + 4} ${cx - 34} ${ank - 18} ${cx} ${ank - 18} C ${cx + 34} ${ank - 18} ${cx + 52} ${ank + 4} ${cx + 46} ${ank + 40} C ${cx + 40} ${ank + 48} ${cx - 40} ${ank + 48} ${cx - 46} ${ank + 40} Z`, o.c,
      { shade: `M ${cx - 60} ${ank + 18} L ${cx + 60} ${ank + 26} L ${cx + 60} ${ank + 60} L ${cx - 60} ${ank + 60} Z`, shadeColor: o.s,
        extra: `<path d="M ${cx - 46} ${ank + 36} C ${cx - 38} ${ank + 50} ${cx + 38} ${ank + 50} ${cx + 46} ${ank + 36} L ${cx + 44} ${ank + 52} C ${cx + 34} ${ank + 62} ${cx - 34} ${ank + 62} ${cx - 44} ${ank + 52} Z" fill="${o.sole}" stroke="${INK}" stroke-width="${LW}"/>` +
          [-18, 0, 18].map(dx => dot(cx + dx, ank + 6, 4.5, o.s, ` stroke="${INK}" stroke-width="2"`)).join('') }));
  }

  // ---------------- body pieces, profile (facing right) ----------------
  function legP(parts, x0, x1, c, cS, hip, ank, extra = '') {
    parts.push({ d: `M ${x0 - 44} ${hip - 20} L ${x0 + 54} ${hip - 20} C ${x0 + 60} ${hip + 200} ${x1 + 58} ${ank - 160} ${x1 + 56} ${ank} L ${x1 - 52} ${ank} C ${x1 - 54} ${ank - 160} ${x0 - 50} ${hip + 200} ${x0 - 44} ${hip - 20} Z`,
      fill: c, shade: `M ${x0 - 60} ${hip} L ${x0 - 20} ${hip} L ${x1 - 20} ${ank + 10} L ${x1 - 70} ${ank + 10} Z`, shadeColor: cS,
      extra: ln(`M ${x1 - 40} ${ank - 40} q 30 -14 70 -2 M ${x1 - 36} ${ank - 90} q 28 -12 60 0`, INK, LW * 0.8) + extra });
  }
  function sneakerP(parts, x, ank, o, back) {
    const top = o.high ? 64 : 22;
    parts.push({ d: `M ${x - 60} ${ank + 66} L ${x - 60} ${ank - top} C ${x - 30} ${ank - top - 6} ${x + 6} ${ank - top} ${x + 16} ${ank - 6} C ${x + 60} ${ank} ${x + 110} ${ank + 18} ${x + 112} ${ank + 50} L ${x + 112} ${ank + 66} Z`,
      fill: back ? o.s : o.c, shade: `M ${x - 70} ${ank + 30} L ${x + 120} ${ank + 36} L ${x + 120} ${ank + 60} L ${x - 70} ${ank + 60} Z`, shadeColor: o.s,
      extra: `<path d="M ${x - 60} ${ank + 48} L ${x + 112} ${ank + 48} L ${x + 112} ${ank + 66} L ${x - 60} ${ank + 66} Z" fill="${o.sole}" stroke="${INK}" stroke-width="${LW}"/>` + ln(`M ${x - 10} ${ank - 8} l 16 18 M ${x + 10} ${ank - 4} l 14 16`, o.lace || INK, LW * 0.8) +
        (o.mark && !back ? ln(`M ${x - 40} ${ank + 30} q 50 -2 100 -14`, o.mark, 6) : '') });
  }
  function clogP(parts, x, ank, o, back) {
    parts.push({ d: `M ${x - 50} ${ank + 58} L ${x - 52} ${ank + 10} C ${x - 40} ${ank - 8} ${x + 10} ${ank - 16} ${x + 46} ${ank - 6} C ${x + 84} ${ank + 4} ${x + 100} ${ank + 30} ${x + 98} ${ank + 58} Z`,
      fill: back ? o.s : o.c, shade: `M ${x - 70} ${ank + 26} L ${x + 120} ${ank + 34} L ${x + 120} ${ank + 60} L ${x - 70} ${ank + 60} Z`, shadeColor: o.s,
      extra: `<path d="M ${x - 50} ${ank + 44} L ${x + 99} ${ank + 44} L ${x + 98} ${ank + 60} L ${x - 50} ${ank + 60} Z" fill="${o.sole}" stroke="${INK}" stroke-width="${LW}"/>` + (back ? '' : [10, 34, 58].map(dx => dot(x + dx, ank + 12, 4.5, o.s, ` stroke="${INK}" stroke-width="2"`)).join('')) });
  }
  function handP(parts, K, x = 492, y = 1150) {
    parts.push(part(`M ${x - 22} ${y + 16} C ${x - 22} ${y + 46} ${x - 2} ${y + 68} ${x + 18} ${y + 64} C ${x + 36} ${y + 60} ${x + 38} ${y + 34} ${x + 30} ${y + 14} Z`, K.skin, { shade: `M ${x - 32} ${y + 10} L ${x - 2} ${y + 10} L ${x - 2} ${y + 70} L ${x - 32} ${y + 70} Z`, shadeColor: K.skinS }));
  }
  function neckP(parts, K) {
    parts.push(part(`M 420 750 L 500 760 L 506 900 L 426 896 Z`, K.skin, { shade: `M 410 740 L 458 740 L 458 900 L 410 900 Z`, shadeColor: K.skinS }));
  }

  // ---------------- heads ----------------
  // front : face centre at 0,0, eyes at y 5, chin about 104, skull top about -150
  const FACE = {
    oval: `M -68 -84 C -82 -52 -84 -12 -80 22 C -74 62 -44 96 0 102 C 44 96 74 62 80 22 C 84 -12 82 -52 68 -84 Z`,
    soft: `M -70 -82 C -86 -46 -88 6 -80 40 C -70 80 -38 102 0 104 C 38 102 70 80 80 40 C 88 6 86 -46 70 -82 Z`,
    angular: `M -70 -84 C -82 -54 -84 -18 -82 8 C -80 40 -72 62 -60 76 L -28 102 C -12 110 12 110 28 102 L 60 76 C 72 62 80 40 82 8 C 84 -18 82 -54 70 -84 Z`,
    long: `M -66 -86 C -78 -54 -80 -18 -78 10 C -76 44 -66 70 -50 88 L -22 112 C -10 120 10 120 22 112 L 50 88 C 66 70 76 44 78 10 C 80 -18 78 -54 66 -86 Z`,
    big: `M -80 -84 C -96 -48 -100 0 -94 38 C -88 76 -56 106 0 112 C 56 106 88 76 94 38 C 100 0 96 -48 80 -84 Z`,
    // bald heads : the face and the skull in one shape (no line across the forehead)
    bigBald: `M -96 0 C -100 -84 -64 -150 0 -152 C 64 -150 100 -84 96 0 C 96 40 86 76 56 104 C 30 118 -30 118 -56 104 C -86 76 -96 40 -96 0 Z`,
    oldBald: `M -84 0 C -88 -84 -56 -148 0 -150 C 56 -148 88 -84 84 0 C 84 30 76 60 56 86 C 40 104 18 112 0 112 C -18 112 -40 104 -56 86 C -76 60 -84 30 -84 0 Z`,
    old: `M -72 -84 C -84 -50 -86 -10 -84 24 C -82 56 -70 80 -52 96 C -32 110 32 110 52 96 C 70 80 82 56 84 24 C 86 -10 84 -50 72 -84 Z`,
  };
  const HWF = { oval: 80, soft: 86, angular: 82, long: 78, big: 96, bigBald: 96, oldBald: 84, old: 84 };
  const EAR = (x0, k) => `M ${x0} -16 C ${x0 + k * 16} -26 ${x0 + k * 26} -8 ${x0 + k * 22} 12 C ${x0 + k * 20} 30 ${x0 + k * 10} 40 ${x0} 34 Z`;
  const FACESHADE = `M -110 -160 L -44 -160 C -60 -40 -66 10 -50 58 C -40 86 -14 100 4 124 L -110 124 Z`;

  // eyes, brows, nose, mouth for an expression
  function features(K, expr) {
    const H = K.head, E = H.eye || {};
    let s = '';
    // +parle : the mouth open (talking) ; +cligne : the eyes shut (a blink) — shown in turn by the animation
    const mods = (String(expr).match(/\+\w+/g) || []).map(m => m.slice(1));
    expr = String(expr).replace(/\+\w+/g, '');
    const talk = mods.includes('parle'), shut = mods.includes('cligne');
    const shape = (x, k, h) => (k < 0 ? `M ${x - 24} 6 Q ${x} ${6 - h} ${x + 24} 4 Q ${x} ${6 + h * 0.8} ${x - 24} 6 Z` : `M ${x - 24} 4 Q ${x} ${6 - h} ${x + 24} 6 Q ${x} ${6 + h * 0.8} ${x - 24} 4 Z`);
    const BR = Object.assign({ frime: [[-18, -24], [-34, -26]], colere: [[-8, -30], [-8, -30]], panique: [[-40, -30], [-40, -30]], fierte: [[-30, -28], [-30, -28]] }, H.brows || {});
    const B = BR[expr], sun = H.glasses === 'sun';
    [-1, 1].forEach((k, i) => {
      const x = k * 36;
      if (!sun) {
        if (expr === 'fierte') {
          s += ln(`M ${x - 22} 8 Q ${x} -10 ${x + 22} 8`, INK, LW * 1.7);
          if (E.lash) s += ln(`M ${x + k * 22} 6 l ${k * 9} -6`, INK, LW * 1.1);
        } else if (shut) {
          s += ln(`M ${x - 24} 6 Q ${x} 16 ${x + 24} 6`, INK, LW * 1.6);
          if (E.lash) s += ln(`M ${x + k * 24} 6 l ${k * 9} 4`, INK, LW * 1.1);
        } else {
          let h = expr === 'panique' ? 22 : expr === 'colere' ? 9 : 12;
          const tired = (E.tired || E.lazy) && expr !== 'panique';
          if (tired) h -= 2;
          const Ep = shape(x, k, h), ir = expr === 'panique' ? 6 : expr === 'colere' ? 7 : 9, id = `e${K.id}${k}${expr}`;
          s += `<path d="${Ep}" fill="#fbf7f1"/><clipPath id="${id}"><path d="${Ep}"/></clipPath><g clip-path="url(#${id})">${dot(x + 1, 5, ir, E.iris || '#3a2214')}${dot(x + 1, 5, ir / 2, '#0d0805')}${dot(x + 4, 2, 2.2, '#ffffff')}`;
          if (tired) s += `<path d="M ${x - 30} -20 L ${x + 30} -20 L ${x + 30} 2 Q ${x} -6 ${x - 30} 2 Z" fill="${K.skin}"/>`; // heavy lids
          s += '</g>';
          const lid = expr === 'colere' ? (k < 0 ? `M ${x - 26} 0 Q ${x} -6 ${x + 26} 8` : `M ${x - 26} 8 Q ${x} -6 ${x + 26} 0`)
            : expr === 'panique' ? `M ${x - 26} 4 Q ${x} -22 ${x + 26} 4`
              : tired ? (k < 0 ? `M ${x - 26} 6 Q ${x - 2} -4 ${x + 26} 4` : `M ${x - 26} 4 Q ${x + 2} -4 ${x + 26} 6`)
                : (k < 0 ? `M ${x - 26} 8 Q ${x - 2} -10 ${x + 26} 2` : `M ${x - 26} 2 Q ${x + 2} -10 ${x + 26} 8`);
          s += ln(lid, INK, LW * (expr === 'panique' ? 1.2 : 1.9));
          if (E.lash) s += ln(`M ${x + k * 24} 3 l ${k * 9} -6 M ${x + k * 19} -1 l ${k * 6} -8`, INK, LW * 1.1);
          if (expr === 'panique') s += ln(`M ${x - 18} 20 Q ${x} 26 ${x + 18} 19`, INK, LW * 0.6);
        }
        if (E.tired) s += ln(`M ${x - 17} 23 Q ${x} 31 ${x + 17} 22`, K.skinS, 3.6);
      }
      const [yi, yo] = B[i];
      const inner = [k * 14, yi], outer = [k * 60, yo], mid = [k * 37, Math.min(yi, yo) - (expr === 'panique' ? 6 : 3)];
      s += ln(`M ${pt(inner)} Q ${pt(mid)} ${pt(outer)}`, H.browC || INK, H.browW || 9);
      if (H.browCut && k > 0) { const yc = 0.4225 * yi + 0.455 * mid[1] + 0.1225 * yo; s += ln(`M ${k * 34} ${r1(yc - 10)} L ${k * 28} ${r1(yc + 10)}`, K.skin, 5.5); }
    });
    s += ln({ regular: 'M 2 16 L -4 40 L 8 42', small: 'M 2 24 Q -4 36 6 38', wide: 'M -12 38 Q -6 46 0 41 Q 6 46 12 38 M 2 14 L -2 32', big: 'M 6 4 L -8 42 Q 2 52 14 44' }[H.nose || 'regular'], INK, LW * 0.9);
    const M = (H.mouth && H.mouth[expr]) || expr, lip = H.lips;
    if (talk) {
      const tongue = (y) => ln(`M -10 ${y} q 10 -8 20 0`, '#c4535a', 5);
      if (M === 'colere' || M === 'shout') s += `<path d="M -30 52 C -36 96 36 96 30 52 C 18 44 -18 44 -30 52 Z" fill="#3b1612" stroke="${INK}" stroke-width="${LW}"/><path d="M -24 54 C -14 50 14 50 24 54 L 22 60 C 10 57 -10 57 -22 60 Z" fill="#ffffff"/>` + tongue(84);
      else if (M === 'panique') s += `<path d="M -22 54 C -26 98 26 98 22 54 C 12 46 -12 46 -22 54 Z" fill="#3b1612" stroke="${INK}" stroke-width="${LW}"/>` + tongue(86);
      else if (M === 'fierte' || M === 'grin') s += `<path d="M -30 56 C -14 92 16 92 32 54 Z" fill="#3b1612" stroke="${INK}" stroke-width="${LW}" stroke-linejoin="round"/><path d="M -26 58 L 28 57 L 26 64 L -24 65 Z" fill="#ffffff"/>` + tongue(82);
      else s += `<path d="M -20 58 C -22 86 22 86 20 58 C 10 52 -10 52 -20 58 Z" fill="#3b1612" stroke="${INK}" stroke-width="${LW}"/>` + tongue(78);
    }
    else {
    if (M === 'frime') s += ln('M -24 66 C -6 72 16 68 32 54', INK, LW * 1.2) + '<path d="M 10 66 L 28 58 L 26 64 Z" fill="#ffffff"/>' + (lip ? ln('M -10 74 Q 4 78 16 72', lip, 4) : '');
    if (M === 'smirk') s += ln('M -20 66 C -4 70 14 68 28 58', INK, LW * 1.2) + (lip ? ln('M -8 74 Q 4 77 14 72', lip, 4) : '');
    if (M === 'flat') s += ln('M -26 66 Q 0 62 26 66 M -26 66 l -6 6 M 26 66 l 6 6', INK, LW * 1.2);
    if (M === 'colere') s += `<path d="M -30 58 L 30 58 C 32 76 -32 76 -30 58 Z" fill="#ffffff" stroke="${INK}" stroke-width="${LW}"/>` + ln('M -28 66 L 28 66 M -10 58 L -10 74 M 10 58 L 10 74', INK, LW * 0.6);
    if (M === 'shout') s += `<path d="M -30 52 C -36 96 36 96 30 52 C 18 44 -18 44 -30 52 Z" fill="#3b1612" stroke="${INK}" stroke-width="${LW}"/><path d="M -24 54 C -14 50 14 50 24 54 L 22 60 C 10 57 -10 57 -22 60 Z" fill="#ffffff"/><path d="M -14 82 Q 0 72 14 82" fill="#c4535a"/>`;
    if (M === 'panique') s += `<path d="M -16 56 C -18 86 18 86 16 56 C 10 50 -10 50 -16 56 Z" fill="#3b1612" stroke="${INK}" stroke-width="${LW}"/>` + ln('M -8 74 q 8 -6 16 0', '#c4535a', 5);
    if (M === 'fierte') s += `<path d="M -32 56 C -14 82 18 82 34 54 Z" fill="#ffffff" stroke="${INK}" stroke-width="${r1(LW * 1.1)}" stroke-linejoin="round"/>` + ln('M -28 60 L 30 60', INK, LW * 0.5);
    if (M === 'grin') s += `<path d="M -28 58 C -12 76 14 76 30 56 Z" fill="#ffffff" stroke="${INK}" stroke-width="${LW}" stroke-linejoin="round"/>`;
    }
    // glasses
    if (H.glasses === 'sun') s += `<path d="M -68 -12 C -68 -20 -10 -20 -8 -12 L -12 16 C -14 28 -60 28 -64 16 Z M 68 -12 C 68 -20 10 -20 8 -12 L 12 16 C 14 28 60 28 64 16 Z" fill="${H.lens || '#15161c'}" stroke="${INK}" stroke-width="${LW}"/>` +
      ln('M -8 -10 Q 0 -15 8 -10 M -68 -10 L -84 -8 M 68 -10 L 84 -8', INK, LW * 1.2) + ln('M -54 -8 l 16 0 M 22 -8 l 16 0', '#ffffff', 4, ' opacity="0.75"') + '<circle class="shiny" cx="52" cy="-6" r="13" fill="none"/>';
    if (H.glasses === 'aviator') s += `<path d="M -68 -12 L -10 -12 C -6 6 -16 28 -40 28 C -62 28 -72 8 -68 -12 Z M 68 -12 L 10 -12 C 6 6 16 28 40 28 C 62 28 72 8 68 -12 Z" fill="${H.lens || '#5b3d8f'}" stroke="${H.frame || '#efbb31'}" stroke-width="3.6"/>` +
      ln('M -10 -10 L 10 -10 M -10 -2 Q 0 -6 10 -2 M -68 -10 L -86 -8 M 68 -10 L 86 -8', H.frame || '#efbb31', 3.6) + ln('M -56 -4 l 16 0 M 24 -4 l 16 0', '#ffffff', 4, ' opacity="0.6"') + '<circle class="shiny" cx="54" cy="-4" r="13" fill="none"/>';
    if (H.glasses === 'round') s += [-1, 1].map(k => `<circle cx="${k * 36}" cy="5" r="25" fill="#ffffff" fill-opacity="0.12" stroke="${H.frame || INK}" stroke-width="3.6"/>`).join('') + ln('M -11 2 Q 0 -4 11 2 M -61 2 L -80 -2 M 61 2 L 80 -2', H.frame || INK, 3.6);
    if (H.glasses === 'reading') s += [-1, 1].map(k => `<path d="M ${k * 36 - 24} 14 L ${k * 36 + 24} 14 Q ${k * 36 + 22} 34 ${k * 36} 34 Q ${k * 36 - 22} 34 ${k * 36 - 24} 14 Z" fill="#ffffff" fill-opacity="0.18" stroke="${H.frame || INK}" stroke-width="3.4"/>`).join('') + ln('M -12 14 Q 0 8 12 14 M -60 14 L -80 4 M 60 14 L 80 4', H.frame || INK, 3.4);
    return s;
  }

  // facial hair, front
  const BEARD = {
    mustache: (K) => [part('M -38 50 C -28 36 -8 36 0 44 C 8 36 28 36 38 50 C 28 58 10 56 0 50 C -10 56 -28 58 -38 50 Z', K.facial || K.hair, { inner: true })],
    full: (K, hw) => [part(`M ${-hw + 2} -20 C ${-hw - 2} 50 -66 116 0 126 C 66 116 ${hw + 2} 50 ${hw - 2} -20 L ${hw - 18} -14 C ${hw - 20} 30 52 50 34 50 C 30 36 -30 36 -34 50 C -52 50 ${-hw + 20} 30 ${-hw + 18} -14 Z M -30 58 C -18 52 18 52 30 58 C 30 84 -30 84 -30 58 Z`, K.facial || K.hair,
      { extra: ln('M -60 40 l 6 8 M -40 70 l 4 9 M 40 70 l -4 9 M 60 40 l -6 8 M 0 104 l 0 9', K.hairT, 3) }), ...BEARD.mustache(K)],
    thick: (K, hw) => [part(`M ${-hw + 2} -16 C ${-hw - 6} 60 -70 136 0 148 C 70 136 ${hw + 6} 60 ${hw - 2} -16 L ${hw - 16} -12 C ${hw - 18} 32 54 52 34 50 C 30 36 -30 36 -34 50 C -54 52 ${-hw + 18} 32 ${-hw + 16} -12 Z M -30 58 C -18 52 18 52 30 58 C 30 86 -30 86 -30 58 Z`, K.facial || K.hair,
      { extra: ln('M -64 50 l 6 10 M -44 86 l 4 10 M 44 86 l -4 10 M 64 50 l -6 10 M -14 120 l 2 10 M 14 120 l -2 10', K.hairT, 3) }), ...BEARD.mustache(K)],
    goatee: (K) => [part('M -20 84 C -16 76 16 76 20 84 C 20 106 8 118 0 120 C -8 118 -20 106 -20 84 Z', K.facial || K.hair, { inner: true }),
      part('M -30 52 C -18 42 -6 42 0 47 C 6 42 18 42 30 52 C 20 57 8 56 0 52 C -8 56 -20 57 -30 52 Z', K.facial || K.hair, { inner: true })],
  };

  // ---------------- hair and headwear : front (f*) and profile (p*) layers ----------------
  // profile head : facing right, forehead about (62, -54), nose tip about (88, 20), chin about (44, 104), back of the skull about (-80, -20)
  const HEADP = {
    male: 'M 64 -54 C 68 -36 66 -24 70 -12 L 90 20 C 92 26 86 30 78 30 L 74 36 C 80 42 80 48 74 52 L 68 56 C 76 60 76 68 68 72 C 68 86 62 98 46 104 C 28 110 6 106 -10 98 L -34 92 C -44 84 -56 72 -66 56 C -78 34 -82 -20 -76 -60 C -68 -108 -40 -130 -2 -128 C 34 -126 58 -100 64 -54 Z',
    female: 'M 62 -54 C 66 -36 64 -24 68 -12 L 84 16 C 86 22 80 26 74 26 L 72 34 C 80 38 80 46 72 50 L 68 54 C 77 58 77 66 68 70 C 66 84 58 96 42 102 C 26 108 6 104 -10 96 L -32 90 C -42 82 -54 70 -64 56 C -76 34 -80 -20 -74 -60 C -66 -106 -38 -128 -2 -126 C 32 -124 56 -100 62 -54 Z',
    big: 'M 66 -54 C 72 -36 70 -24 74 -12 L 94 22 C 96 30 88 34 80 34 L 78 40 C 86 46 86 54 78 58 L 72 62 C 82 68 82 76 72 80 C 74 96 64 112 44 118 C 24 124 0 118 -16 106 L -40 96 C -52 86 -62 72 -72 56 C -84 34 -86 -20 -80 -60 C -72 -108 -42 -130 -2 -128 C 36 -126 60 -100 66 -54 Z',
    old: 'M 64 -54 C 68 -36 66 -24 72 -10 L 96 24 C 98 32 90 36 80 34 L 76 40 C 82 46 82 52 76 56 L 70 60 C 76 64 76 72 68 76 C 66 90 58 100 42 106 C 26 112 6 108 -10 100 L -34 92 C -44 84 -56 72 -66 56 C -78 34 -82 -20 -76 -60 C -68 -108 -40 -130 -2 -128 C 34 -126 58 -100 64 -54 Z',
  };
  const EARP = 'M -8 -12 C -22 -24 -40 -16 -40 4 C -40 24 -30 40 -14 40 C -8 40 -5 32 -8 24 C -10 12 -6 0 -8 -12 Z';
  function featuresP(K) {
    const H = K.head, E = H.eye || {};
    let s = '';
    if (H.glasses !== 'sun') {
      s += `<path d="M 34 -6 Q 46 ${E.tired ? -11 : -14} 58 -4 Q 48 6 34 -6 Z" fill="#fbf7f1"/>${dot(52, -4, 5.5, '#1d120c')}` + ln(`M 30 -10 Q 46 ${E.tired ? -18 : -22} 62 -8`, INK, LW * 1.8);
      if (E.lash) s += ln('M 60 -8 l 8 -6 M 56 -12 l 5 -8', INK, LW * 1.1);
      if (E.tired) s += ln('M 38 8 Q 48 12 58 6', K.skinS, 3.4);
    }
    s += ln('M 24 -30 Q 44 -38 64 -30', H.browC || INK, H.browW || 9);
    const m = { male: 'M 58 58 Q 64 62 70 60', female: 'M 60 56 Q 65 59 70 57', big: 'M 62 62 Q 68 66 74 64', old: 'M 60 62 Q 66 64 72 64' }[H.prof || 'male'];
    s += ln(m, INK, LW);
    if (H.lips) s += ln('M 62 62 Q 68 64 72 61', H.lips, 4);
    return s;
  }
  const BEARDP = {
    mustache: (K) => [part('M 56 48 C 66 40 80 40 86 48 C 80 54 66 56 56 52 Z', K.facial || K.hair, { inner: true })],
    full: (K) => [part('M 10 -30 L 26 -30 C 30 6 42 30 60 44 C 74 40 84 44 88 52 L 84 60 C 86 80 76 104 56 116 C 30 128 0 120 -18 104 C -30 90 -32 60 -28 30 C -26 10 -12 -10 10 -30 Z M 64 62 C 70 70 76 70 82 64 C 78 60 70 58 64 62 Z', K.facial || K.hair)],
    thick: (K) => [part('M 10 -26 L 26 -26 C 30 6 42 30 60 44 C 74 40 86 44 90 52 L 86 62 C 88 92 74 124 46 136 C 20 144 -8 132 -22 112 C -32 94 -34 60 -30 30 C -28 10 -12 -8 10 -26 Z M 66 64 C 72 72 78 72 84 66 C 80 62 72 60 66 64 Z', K.facial || K.hair)],
    goatee: (K) => [part('M 50 78 C 58 74 66 76 68 80 C 68 96 58 108 46 110 C 40 100 42 86 50 78 Z', K.facial || K.hair), part('M 58 52 C 66 46 78 46 84 52 C 78 57 66 58 58 56 Z', K.facial || K.hair, { inner: true })],
  };

  const HAIR = {
    // Nadia 1 : natural hair pulled up into a puff, a headband
    puff: {
      fback: (K) => [part(fluffy(0, -172, 86, 64, 18, 0.15, 0.2), K.hair, { shade: 'M -130 -260 L -36 -260 C -60 -200 -58 -150 -40 -100 L -130 -100 Z', shadeColor: K.hairS,
        extra: ln('M -40 -200 q 8 -8 16 0 M 20 -214 q 8 -8 16 0 M 46 -170 q 8 -8 16 0 M -10 -168 q 8 -8 16 0 M -56 -150 q 8 -8 16 0', K.hairT, 3) })],
      ffront: (K) => [part('M -86 -36 C -94 -96 -60 -136 0 -138 C 60 -136 94 -96 86 -36 C 80 -58 62 -74 0 -76 C -62 -74 -80 -58 -86 -36 Z', K.hair, { extra: ln('M -44 -78 C -40 -96 -34 -106 -26 -118 M 0 -78 L 0 -116 M 44 -78 C 40 -96 34 -106 26 -118', K.hairT, 3) }),
        part('M -86 -92 C -58 -128 58 -128 86 -92 L 82 -74 C 54 -110 -54 -110 -82 -74 Z', K.band, { shade: 'M -100 -140 L -50 -140 L -60 -60 L -100 -60 Z', shadeColor: K.bandS })],
      pback: (K) => [part(fluffy(-30, -168, 78, 60, 16, 0.15, 0.3), K.hair, { shade: 'M -140 -260 L -60 -260 C -80 -200 -80 -150 -66 -100 L -140 -100 Z', shadeColor: K.hairS,
        extra: ln('M -70 -200 q 8 -8 16 0 M -10 -206 q 8 -8 16 0 M -40 -160 q 8 -8 16 0', K.hairT, 3) })],
      pfront: (K) => [part('M 58 -62 C 62 -106 34 -134 -6 -136 C -48 -136 -80 -104 -84 -50 C -86 -10 -78 24 -64 42 L -50 40 C -44 18 -42 0 -40 -14 C -30 -28 -14 -30 4 -26 C 14 -24 20 -20 22 -14 C 28 -30 40 -50 58 -62 Z', K.hair,
        { extra: ln('M 40 -64 C 20 -80 0 -96 -14 -118 M 12 -40 C -4 -62 -20 -84 -34 -110', K.hairT, 3) }),
        part('M -38 -30 C -42 -80 -22 -120 4 -138 L 24 -132 C 0 -114 -20 -78 -20 -30 Z', K.band, { shade: 'M -60 -140 L -26 -140 L -36 -20 L -60 -20 Z', shadeColor: K.bandS })],
    },
    // Nadia 2 : long dark hair up in a messy bun, a claw clip, two loose strands
    bun: {
      fback: (K) => [part('M -30 -168 a 46 44 0 1 0 92 0 a 46 44 0 1 0 -92 0 Z', K.hair, { shade: 'M -40 -230 L 0 -230 L 0 -100 L -40 -100 Z', shadeColor: K.hairS,
        extra: ln('M -8 -170 C -2 -196 40 -200 46 -172 C 50 -150 20 -140 10 -160', K.hairT, 3) }),
        part('M -18 -196 C 6 -214 42 -214 62 -196 L 56 -180 C 38 -194 8 -194 -10 -182 Z', K.clip, { extra: ln('M 4 -198 l -2 14 M 22 -202 l 0 14 M 40 -200 l 2 14', INK, 2.4) })],
      ffront: (K) => [part('M -88 -30 C -96 -100 -58 -140 0 -142 C 60 -140 96 -98 88 -30 C 84 -54 70 -72 26 -80 C -10 -86 -60 -76 -88 -30 Z', K.hair, { extra: ln('M 26 -80 C 18 -100 12 -120 10 -138 M -30 -80 C -26 -100 -20 -118 -12 -132 M 60 -64 C 54 -90 44 -110 32 -126', K.hairT, 3) }),
        { kind: 'stroke', d: 'M -50 -80 C -70 -58 -74 -30 -66 -6 C -60 8 -62 22 -68 34', w: 6, color: K.hair }, { kind: 'stroke', d: 'M 56 -76 C 74 -54 78 -28 70 -6 C 66 6 68 18 72 28', w: 6, color: K.hair }],
      pback: (K) => [part('M -88 -150 a 44 42 0 1 0 88 0 a 44 42 0 1 0 -88 0 Z', K.hair, { shade: 'M -100 -200 L -60 -200 L -60 -100 L -100 -100 Z', shadeColor: K.hairS, extra: ln('M -60 -150 C -54 -176 -20 -178 -16 -152 C -14 -130 -40 -126 -46 -144', K.hairT, 3) }),
        part('M -70 -186 C -50 -200 -20 -198 -6 -180 L -14 -166 C -26 -180 -48 -182 -62 -172 Z', K.clip)],
      pfront: (K) => [part('M 58 -62 C 62 -106 34 -134 -6 -136 C -48 -136 -80 -104 -84 -50 C -86 -10 -78 24 -64 42 L -50 40 C -44 18 -42 0 -40 -14 C -30 -28 -14 -30 4 -26 C 14 -24 20 -20 22 -14 C 28 -30 40 -50 58 -62 Z', K.hair,
        { extra: ln('M 40 -66 C 20 -84 -4 -104 -24 -122 M 10 -42 C -10 -66 -30 -90 -48 -112', K.hairT, 3) }), { kind: 'stroke', d: 'M 24 -40 C 32 -20 20 2 26 28', w: 6, color: K.hair }],
    },
  };

  // short hair under a hat or a cap : sideburns and temples (front), above and behind the ear (profile)
  const sideburnsF = (K, hw) => [-1, 1].map(k => part(`M ${k * (hw + 12)} -64 L ${k * (hw - 14)} -64 C ${k * (hw - 12)} -38 ${k * (hw - 10)} -16 ${k * (hw - 8)} 4 L ${k * (hw - 1)} 6 C ${k * hw} -6 ${k * (hw + 2)} -16 ${k * (hw + 4)} -22 C ${k * (hw + 8)} -26 ${k * (hw + 12)} -28 ${k * (hw + 12)} -30 Z`, K.hair));
  const shortP = (K) => part('M 40 -112 L 40 -62 C 37 -40 34 -20 32 -4 L 17 -2 C 15 -8 14 -12 11 -16 C 2 -26 -24 -28 -38 -14 C -42 4 -44 18 -46 28 C -54 33 -66 32 -82 22 C -86 -6 -86 -30 -79 -60 L -72 -112 Z', K.hair);
  Object.assign(HAIR, {
    // Deuce 1 : a low fade, a crisp line-up, a shaved part
    fade: {
      ffront: (K, hw) => [part('M -84 -40 C -90 -108 -56 -142 0 -144 C 56 -142 90 -108 84 -40 L 76 -46 C 72 -66 60 -78 34 -80 L -34 -80 C -60 -78 -72 -66 -76 -46 Z', K.hair,
        { extra: ln('M 40 -84 C 50 -102 56 -118 58 -132', K.skinS, 3.4) + [[-40, -110], [-14, -124], [14, -112], [-24, -96], [26, -130], [-56, -90]].map(([x, y]) => ln(`M ${x} ${y} q 5 -5 10 0`, K.hairT, 2.6)).join('') }),
        ...[-1, 1].map(k => part(`M ${k * 88} -38 C ${k * 90} -54 ${k * 89} -68 ${k * 86} -82 L ${k * 75} -76 C ${k * 77} -64 ${k * 78} -54 ${k * 77} -46 Z`, K.fadeC, { inner: true }))],
      pfront: (K) => [part('M 58 -66 C 60 -110 30 -138 -8 -140 C -50 -140 -82 -108 -84 -60 C -86 -36 -82 -16 -76 0 L -62 -6 C -56 -22 -48 -30 -38 -26 C -28 -30 -10 -32 6 -30 L 24 -30 L 30 -50 C 36 -58 46 -64 58 -66 Z', K.hair,
        { extra: [[-20, -110], [10, -122], [-50, -90], [20, -96], [-30, -70]].map(([x, y]) => ln(`M ${x} ${y} q 5 -5 10 0`, K.hairT, 2.6)).join('') }),
        part('M -84 -52 C -86 -36 -82 -16 -76 0 L -62 -6 C -58 -16 -54 -24 -48 -28 C -60 -36 -72 -44 -84 -52 Z', K.fadeC, { inner: true })],
    },
    // Deuce 2 : a bucket hat, short hair under it
    bucket: {
      ffront: (K, hw) => [...sideburnsF(K, hw),
        part('M -82 -54 L -76 -126 C -74 -142 -50 -150 0 -150 C 50 -150 74 -142 76 -126 L 82 -54 Z', K.hat, { shade: 'M -120 -170 L -54 -170 C -64 -120 -66 -90 -62 -50 L -120 -50 Z', shadeColor: K.hatS, extra: ln('M -80 -76 C -40 -84 40 -84 80 -76', K.hatS, 3, ' stroke-dasharray="7 6"') + ln('M -76 -124 C -40 -132 40 -132 76 -124', K.hatS, 3, ' stroke-dasharray="7 6"') }),
        part('M -114 -32 C -100 -68 100 -68 114 -32 C 118 -16 106 -8 94 -14 C 60 -38 -60 -38 -94 -14 C -106 -8 -118 -16 -114 -32 Z', K.hat, { shade: 'M -140 -60 L 140 -60 L 140 -10 L -140 -10 Z M -140 -90 L -90 -90 L -90 -10 L -140 -10 Z', shadeColor: K.hatS,
          extra: ln('M -104 -28 C -76 -56 76 -56 104 -28', K.hatS, 3, ' stroke-dasharray="7 6"') })],
      pfront: (K) => [shortP(K)],
      ptop: (K) => [part('M 54 -60 L 48 -126 C 46 -142 22 -150 -18 -150 C -58 -150 -78 -142 -80 -126 L -86 -60 Z', K.hat, { shade: 'M -120 -170 L -54 -170 L -60 -50 L -120 -50 Z', shadeColor: K.hatS, extra: ln('M -84 -80 C -40 -88 20 -88 52 -80', K.hatS, 3, ' stroke-dasharray="7 6"') + ln('M -80 -124 C -40 -132 20 -132 48 -124', K.hatS, 3, ' stroke-dasharray="7 6"') }),
        part('M 96 -26 C 74 -64 -100 -70 -124 -32 C -130 -22 -118 -14 -106 -22 C -66 -52 64 -50 88 -16 C 96 -10 104 -18 96 -26 Z', K.hat, { shade: 'M -140 -50 L 120 -50 L 120 -10 L -140 -10 Z', shadeColor: K.hatS })],
    },
  });

  Object.assign(HAIR, {
    // Maya 1 : box braids up in a high ponytail, a scrunchie, baby hair
    pony: {
      fbehind: (K) => {
        const out = [], long = !K._heads;
        [[-6, -58, 120, 18], [-4, -84, 180, 30], [-2, -104, 230, 22], [2, 58, 120, -18], [4, 86, 186, -30], [6, 108, 236, -22]].forEach(([x0, x1, y1, b]) => braid([x0, -160], [x1 * (long ? 1 : 0.8), long ? y1 : Math.min(y1, 96)], b, 13, K.hair, K.hairT, out, ''));
        return out.map(p => { delete p.tf; return p; });
      },
      ffront: (K) => [part('M -86 -36 C -94 -98 -58 -140 0 -142 C 58 -140 94 -98 86 -36 C 80 -58 62 -74 0 -78 C -62 -74 -80 -58 -86 -36 Z', K.hair,
        { extra: ln('M -46 -80 C -40 -104 -22 -132 -4 -146 M 0 -80 L 0 -146 M 46 -80 C 40 -104 22 -132 4 -146 M -70 -62 C -60 -100 -34 -132 -8 -146 M 70 -62 C 60 -100 34 -132 8 -146', K.hairT, 2.6) +
          ln('M -74 -60 q -10 4 -6 14 q 6 6 10 -2 M 74 -60 q 10 4 6 14 q -6 6 -10 -2', K.hair, 2.6) }),
        part(fluffy(0, -156, 30, 15, 12, 0.3), K.scrunch, { shade: 'M -40 -170 L -6 -170 L -6 -136 L -40 -136 Z', shadeColor: K.scrunchS })],
      pbehind: (K) => {
        const out = [];
        [[-34, -150, -98, 210, -40], [-30, -154, -84, 250, -50], [-26, -152, -70, 226, -34], [-38, -146, -112, 170, -30]].forEach(([x0, y0, x1, y1, b]) => braid([x0, y0], [x1, y1], b, 13, K.hair, K.hairT, out, ''));
        return out.map(p => { delete p.tf; return p; });
      },
      pfront: (K) => [part('M 58 -62 C 62 -106 34 -134 -6 -136 C -48 -136 -80 -104 -84 -50 C -86 -10 -78 24 -64 42 L -50 40 C -44 18 -42 0 -40 -14 C -30 -28 -14 -30 4 -26 C 14 -24 20 -20 22 -14 C 28 -30 40 -50 58 -62 Z', K.hair,
        { extra: ln('M 44 -66 C 20 -96 -6 -122 -26 -140 M 14 -40 C -8 -80 -24 -112 -36 -138 M -20 -20 C -40 -60 -48 -100 -44 -138', K.hairT, 2.6) + ln('M 24 -20 q 6 8 -2 14 q -6 2 -6 -6', K.hair, 2.6) }),
        part(fluffy(-34, -148, 18, 26, 12, 0.3), K.scrunch)],
    },
    // Maya 2 : a black bob with a straight fringe (round glasses)
    bob: {
      fback: (K) => [part('M -104 62 C -114 -20 -104 -122 -40 -148 C -14 -158 14 -158 40 -148 C 104 -122 114 -20 104 62 C 96 72 78 72 70 62 L -70 62 C -78 72 -96 72 -104 62 Z', K.hair,
        { shade: 'M -130 -170 L -76 -170 C -92 -100 -96 0 -90 80 L -130 80 Z', shadeColor: K.hairS, extra: ln('M -92 -40 C -96 0 -96 30 -92 58 M 92 -40 C 96 0 96 30 92 58', K.hairT, 2.6) })],
      ffront: (K) => [part('M -82 -42 C -86 -104 -50 -138 0 -140 C 50 -138 86 -104 82 -42 C 50 -36 -50 -36 -82 -42 Z', K.hair,
        { extra: ln('M -50 -40 C -48 -70 -40 -100 -26 -124 M -16 -38 C -14 -70 -10 -100 -2 -130 M 20 -38 C 20 -70 18 -100 12 -128 M 54 -40 C 52 -70 44 -100 32 -124', K.hairT, 2.6) })],
      hideEarP: true,
      pfront: (K) => [part('M 66 -40 C 70 -100 32 -138 -10 -140 C -58 -138 -90 -100 -92 -40 C -94 10 -90 44 -86 64 L 4 64 C 8 30 12 4 20 -20 C 28 -34 46 -38 66 -40 Z', K.hair,
        { shade: 'M -120 -160 L -60 -160 L -60 80 L -120 80 Z', shadeColor: K.hairS, extra: ln('M 50 -44 C 40 -80 20 -110 -10 -130 M 10 -10 C 0 -60 -20 -100 -50 -124 M -40 0 C -50 -50 -60 -90 -76 -110', K.hairT, 2.6) })],
    },
  });

  Object.assign(HAIR, {
    // Big Mo 1 : a buzz cut with a sharp line-up
    buzz: {
      ffront: (K) => [part('M -96 -36 C -102 -104 -62 -142 0 -144 C 62 -142 102 -104 96 -36 L 86 -42 C 84 -62 70 -76 40 -80 L -40 -80 C -70 -76 -84 -62 -86 -42 Z', K.hair,
        { extra: [[-50, -110], [-20, -126], [10, -114], [40, -126], [-60, -84], [62, -94], [-30, -96], [26, -96]].map(([x, y]) => dot(x, y, 2.2, K.hairT)).join('') })],
      pfront: (K) => [part('M 60 -64 C 62 -110 34 -140 -6 -142 C -50 -142 -84 -110 -88 -60 C -90 -36 -86 -16 -80 2 L -66 -4 C -60 -20 -50 -30 -40 -26 C -28 -30 -10 -32 8 -30 L 26 -30 L 32 -50 C 38 -58 48 -62 60 -64 Z', K.hair,
        { extra: [[-20, -110], [12, -124], [-54, -84], [24, -96], [-30, -66]].map(([x, y]) => dot(x, y, 2.2, K.hairT)).join('') })],
    },
    // Big Mo 2 : a shaved head (the shine is drawn on the head)
    bald: {},
    // M. Reyes 1 : bald on top, grey on the sides, a few combed strands
    balding: {
      ffront: (K, hw) => [...[-1, 1].map(k => part(`M ${k * (hw - 2)} -70 C ${k * (hw + 8)} -50 ${k * (hw + 10)} -20 ${k * (hw + 2)} 0 L ${k * (hw - 8)} 2 C ${k * (hw - 10)} -20 ${k * (hw - 12)} -46 ${k * (hw - 16)} -64 Z`, K.hair, { extra: ln(`M ${k * (hw - 2)} -52 l ${k * 8} 6 M ${k * (hw)} -30 l ${k * 8} 6`, K.hairT, 2.6) })),
        overlay(ln('M -40 -112 C -14 -126 20 -126 46 -114 M -34 -124 C -10 -136 18 -134 40 -126', K.hair, 4), '')],
      pfront: (K) => [part('M 20 -60 C 0 -70 -40 -76 -70 -66 C -84 -50 -86 -20 -80 4 C -76 20 -68 30 -58 36 L -46 30 C -42 10 -42 -6 -38 -16 C -28 -28 -10 -30 8 -26 C 14 -40 18 -50 20 -60 Z', K.hair,
        { extra: ln('M -60 -50 l 10 8 M -70 -20 l 10 8 M -60 10 l 10 6', K.hairT, 2.6) }), overlay(ln('M 40 -112 C 14 -124 -20 -124 -46 -110', K.hair, 4), '')],
    },
    // M. Reyes 2 : a flat cap, grey hair under it
    flatcap: {
      ffront: (K, hw) => [...sideburnsF(K, hw),
        part('M -98 -60 C -104 -110 -62 -150 0 -152 C 66 -152 108 -116 102 -60 C 70 -76 -70 -76 -98 -60 Z', K.hat, { shade: 'M -130 -170 L -60 -170 C -76 -120 -80 -90 -74 -50 L -130 -50 Z', shadeColor: K.hatS,
          extra: ln('M -60 -138 L -40 -70 M -20 -150 L -6 -74 M 22 -150 L 30 -74 M 62 -138 L 64 -70', K.hatS, 3, ' stroke-dasharray="5 6"') }),
        part('M -78 -66 C -50 -54 50 -54 78 -66 C 88 -56 74 -40 0 -38 C -74 -40 -88 -56 -78 -66 Z', K.hatS)],
      pfront: (K) => [shortP(K)],
      ptop: (K) => [part('M 84 -56 C 70 -100 20 -138 -40 -140 C -80 -138 -94 -102 -86 -60 C -40 -66 30 -64 84 -56 Z', K.hat, { shade: 'M -120 -160 L -60 -160 L -66 -50 L -120 -50 Z', shadeColor: K.hatS, extra: ln('M -60 -132 L -50 -66 M -10 -136 L -4 -66 M 36 -118 L 40 -62', K.hatS, 3, ' stroke-dasharray="5 6"') }),
        part('M 60 -60 C 82 -62 104 -56 110 -46 C 96 -38 72 -42 54 -48 Z', K.hatS)],
    },
  });

  function headF(K, expr, tf, into) {
    if (K._expr) expr = K._expr; // a scene can ask for another expression than the sheet's
    const full = expr; expr = String(expr).replace(/\+\w+/g, ''); // the modifiers (+parle, +cligne) only change the face
    const H = K.head, hw = HWF[H.face], HS = HAIR[H.hair] || {};
    const add = (arr) => arr.forEach(p => into.push(Object.assign({ tf }, p)));
    if (HS.fbehind && !K._body) add(HS.fbehind(K, hw));
    if (HS.fback) add(HS.fback(K, hw));
    if (!H.noEars) [-1, 1].forEach(k => {
      const x0 = k * (hw - 5);
      into.push(part(EAR(x0, k), K.skin, { tf, extra: ln(`M ${x0 + k * 6} -5 C ${x0 + k * 15} -6 ${x0 + k * 17} 12 ${x0 + k * 9} 22`, K.skinS, 4) }));
    });
    into.push(part(FACE[H.face], K.skin, { tf, shade: FACESHADE, shadeColor: K.skinS, extra: features(K, full) + (H.shine ? ln('M -46 -118 q 26 -16 56 -12', '#ffffff', 6, ' opacity="0.55"') : '') }));
    if (H.earpiece) into.push(part(`M ${hw + 4} 0 a 7 9 0 1 0 0.1 0 Z`, H.earpiece, { tf, inner: true }));
    if (H.beard) add(BEARD[H.beard](K, hw));
    if (HS.ffront) add(HS.ffront(K, hw));
    if (H.earring) [-1, 1].forEach(k => into.push(part(`M ${k * (hw + 6) - 6} 32 a 6 6 0 1 0 12 0 a 6 6 0 1 0 -12 0 Z`, H.earring, { tf, inner: true, cls: 'shiny' })));
    if (HS.fover) add(HS.fover(K, hw));
    if (H.hoop) [-1, 1].forEach(k => into.push(Object.assign(overlay(`<circle cx="${k * (hw + 6)}" cy="44" r="8" fill="none" stroke="${INK}" stroke-width="6"/><circle cx="${k * (hw + 6)}" cy="44" r="8" fill="none" stroke="${H.hoop}" stroke-width="3"/>`, tf), { cls: 'shiny' })));
    if (expr === 'panique') into.push(part('M 70 -60 q 16 24 0 38 q -16 -14 0 -38 Z M -80 -48 q 11 17 0 27 q -11 -10 0 -27 Z', '#bfe6ff', { tf }));
    if (H.pick && expr !== 'panique' && expr !== 'colere') into.push(overlay(ln('M 22 64 L 58 52', '#d9c8ad', 4) + ln('M 22 64 L 58 52', INK, 1.4, ' opacity="0.5"'), tf));
  }
  function headP(K, tf, into) {
    const H = K.head, HS = HAIR[H.hair] || {};
    const add = (arr) => arr.forEach(p => into.push(Object.assign({ tf }, p)));
    if (HS.pback) add(HS.pback(K));
    into.push(part(HEADP[H.prof || 'male'], K.skin, { tf, shade: 'M -140 -140 L -28 -140 C -34 -50 -28 24 -8 66 C 6 92 24 104 46 112 L -140 114 Z', shadeColor: K.skinS,
      extra: featuresP(K) + (H.shine ? ln('M -40 -116 q 26 -14 56 -8', '#ffffff', 6, ' opacity="0.55"') : '') }));
    if (H.beard) add(BEARDP[H.beard](K));
    if (HS.pfront) add(HS.pfront(K));
    if (!HS.hideEarP) into.push(part(EARP, K.skin, { tf, extra: ln('M -16 -4 C -30 -6 -32 18 -20 26', K.skinS, 4) }));
    if (H.earring) into.push(part('M -24 38 a 6 6 0 1 0 12 0 a 6 6 0 1 0 -12 0 Z', H.earring, { tf, inner: true, cls: 'shiny' }));
    if (H.earpiece) into.push(part('M -22 8 a 9 11 0 1 0 0.1 0 Z', H.earpiece, { tf, inner: true }));
    if (H.hoop && !HS.hideEarP) into.push(overlay(`<circle cx="-20" cy="48" r="8" fill="none" stroke="${INK}" stroke-width="6"/><circle cx="-20" cy="48" r="8" fill="none" stroke="${H.hoop}" stroke-width="3"/>`, tf));
    if (HS.ptop) add(HS.ptop(K));
    if (H.glasses === 'aviator') into.push(overlay(`<path d="M 30 -16 L 66 -14 C 68 4 60 18 46 18 C 34 18 28 4 30 -16 Z" fill="${H.lens || '#5b3d8f'}" stroke="${H.frame || '#efbb31'}" stroke-width="3.6"/>` + ln('M 30 -12 L -14 -4', H.frame || '#efbb31', 3.6), tf));
    if (H.glasses === 'sun') into.push(overlay(`<path d="M 28 -16 L 64 -14 C 68 -2 64 12 50 14 L 34 12 C 28 4 26 -6 28 -16 Z" fill="${H.lens || '#15161c'}" stroke="${INK}" stroke-width="${LW}"/>` + ln('M 30 -12 L -14 -4', INK, LW * 1.4) + ln('M 40 -10 l 14 0', '#ffffff', 4, ' opacity="0.75"'), tf));
    if (H.glasses === 'round') into.push(overlay(`<ellipse cx="58" cy="-2" rx="7" ry="22" fill="#ffffff" fill-opacity="0.12" stroke="${H.frame || INK}" stroke-width="3.6"/>` + ln('M 52 -8 L -14 -6', H.frame || INK, 3.6), tf));
    if (H.glasses === 'reading') into.push(overlay(`<path d="M 58 6 L 66 6 L 66 26 L 58 26 Z" fill="#ffffff" fill-opacity="0.18" stroke="${H.frame || INK}" stroke-width="3.4"/>` + ln('M 58 8 L -14 -4', H.frame || INK, 3.4), tf));
  }

  // ---------------- the characters ----------------
  const NADIA_HEAD = { face: 'oval', prof: 'female', nose: 'small', eye: { lash: true, tired: true }, browW: 6, mouth: { colere: 'shout' } };
  const CAST = {
    nadia: {
      1: { name: "L'INFIRMIÈRE", text: 'Cheveux relevés en puff, bandeau corail. Blouse de nuit, gilet long, sabots, café.', note: 'Cheveux naturels relevés en puff avec un bandeau corail. Tenue d\'infirmière de nuit (bleu-vert), long gilet beige, sabots, badge et mug de café. Les cernes de la fatigue.',
        skin: '#8a5536', skinS: '#6b3f25', hair: '#1c1512', hairS: '#0e0a08', hairT: '#4a3b34', band: '#e86a52', bandS: '#c44f3b',
        head: Object.assign({ hair: 'puff', lips: '#5a2c22' }, NADIA_HEAD), hs: 1.22,
        c: { scrub: '#3c9aa9', scrubS: '#2b7684', trim: '#d6ecff', cardi: '#d9c8ad', cardiS: '#b9a688', clog: '#f1f4f8', clogS: '#c9d1dc', sole: '#9aa1ad' },
        front: (K, parts, htf) => {
          const hip = 1190, ank = 1690, c = K.c;
          pantsF(parts, { top: hip, ank, tw: 100, ao: 116, ai: 14, fill: c.scrub, shade: c.scrubS });
          clogF(parts, 386, ank, { c: c.clog, s: c.clogS, sole: c.sole }); clogF(parts, 514, ank, { c: c.clog, s: c.clogS, sole: c.sole });
          parts.push(part('M 426 776 L 474 776 L 476 900 C 466 944 434 944 424 900 Z', K.skin, { shade: 'M 400 766 L 500 766 L 500 820 C 470 836 430 836 400 820 Z', shadeColor: K.skinS }));
          // the scrub top : V neck, chest pocket, the lanyard and a badge
          parts.push(part(sym([[0, 950, 1], [28, 868, 1], [76, 872], [100, 902], [104, 970], [98, 1080], [104, 1228, 1], [0, 1234]]), c.scrub,
            { shade: 'M 330 860 L 392 860 C 380 960 384 1100 396 1240 L 330 1240 Z', shadeColor: c.scrubS,
              extra: ln('M 422 868 L 450 950 L 478 868', c.trim, 6) + `<path d="M 470 1004 l 40 0 l 0 40 l -40 0 Z" fill="${c.scrubS}" stroke="${INK}" stroke-width="${LW}"/>` + ln('M 480 1006 l 0 -26', '#2b2f3a', 4) +
                ln('M 432 872 L 444 1020 M 468 872 L 456 1020', '#1f6fd6', 4) + `<rect x="430" y="1018" width="40" height="52" rx="5" fill="#f7f9fc" stroke="${INK}" stroke-width="${LW}"/><rect x="430" y="1018" width="40" height="13" fill="#1f6fd6"/><rect x="438" y="1036" width="14" height="16" fill="#c9d1dc"/>` + ln('M 456 1040 l 8 0 M 456 1048 l 8 0 M 438 1060 l 24 0', '#9aa1ad', 3) }));
          // the long cardigan, open
          [-1, 1].forEach(k => parts.push(part(smooth(at([[38, 870, 1], [80, 868], [106, 896], [112, 990], [110, 1130], [116, 1332, 1], [56, 1336, 1], [48, 1120], [44, 960], [38, 870, 1]], 450, 0, k)), c.cardi,
            { shade: k < 0 ? 'M 320 860 L 376 860 C 366 1000 370 1200 380 1340 L 320 1340 Z' : null, shadeColor: c.cardiS,
              extra: ln(`M ${450 + k * 58} 1300 L ${450 + k * 114} 1298 M ${450 + k * 66} 1190 l ${k * 38} 0 l 0 50 l ${-k * 38} 0`, c.cardiS, 4) })));
          arm(parts, [366, 906], [346, 1040], [344, 1150], 52, c.cardi, { cuff: c.cardiS });
          arm(parts, [534, 906], [554, 1040], [556, 1150], 52, c.cardi, { cuff: c.cardiS });
          handF(parts, K, 344, 1186);
          // a big mug of coffee in the other hand
          parts.push(part('M 562 1166 L 616 1166 L 612 1236 C 610 1246 568 1246 566 1236 Z', '#f4f7fb', { shade: 'M 556 1160 L 578 1160 L 578 1250 L 556 1250 Z', shadeColor: '#d4dbe5',
            extra: `<path d="M 564 1186 L 615 1186 L 614 1200 L 565 1200 Z" fill="#1f6fd6"/>` + ln('M 578 1150 q -10 -14 0 -28 q 10 -14 0 -28 M 598 1150 q -10 -14 0 -28 q 10 -14 0 -28', '#ffffff', 5, ' opacity="0.9"') }));
          handF(parts, K, 558, 1186);
          headF(K, 'frime', htf, parts);
        },
        profile: (K, parts, htf) => {
          const hip = 1190, ank = 1690, c = K.c;
          legP(parts, 440, 424, c.scrubS, c.scrubS, hip, ank); legP(parts, 470, 500, c.scrub, c.scrubS, hip, ank);
          clogP(parts, 424, ank, { c: c.clog, s: c.clogS, sole: c.sole }, true); clogP(parts, 500, ank, { c: c.clog, s: c.clogS, sole: c.sole });
          neckP(parts, K);
          parts.push(part('M 446 872 C 420 874 398 900 396 950 C 392 1010 400 1060 396 1120 C 394 1170 398 1210 404 1232 L 540 1232 C 546 1180 540 1120 532 1080 C 528 1040 546 1000 544 960 C 542 920 520 884 496 876 Z', c.scrub,
            { shade: 'M 360 860 L 420 860 L 420 1240 L 360 1240 Z', shadeColor: c.scrubS, extra: ln('M 500 878 C 512 900 520 914 526 930', c.trim, 6) + ln('M 496 880 L 512 1010', '#1f6fd6', 4) + `<rect x="500" y="1008" width="24" height="50" rx="4" fill="#f7f9fc" stroke="${INK}" stroke-width="${LW}"/>` }));
          // the cardigan : the back, and the front panel hanging open
          parts.push(part('M 444 868 C 404 868 380 900 378 960 C 374 1040 382 1120 378 1200 C 376 1260 378 1300 384 1334 L 492 1336 C 488 1270 484 1200 484 1130 C 484 1060 488 990 490 940 C 492 910 480 880 462 870 Z', c.cardi,
            { shade: 'M 340 860 L 404 860 L 412 1340 L 340 1340 Z', shadeColor: c.cardiS, extra: ln('M 386 1300 L 490 1302', c.cardiS, 4) }));
          arm(parts, [466, 914], [476, 1044], [490, 1146], 52, c.cardi, { cuff: c.cardiS });
          handP(parts, K);
          parts.push(part('M 498 1164 L 548 1164 L 546 1230 C 544 1240 504 1240 502 1230 Z', '#f4f7fb', { shade: 'M 494 1160 L 512 1160 L 512 1244 L 494 1244 Z', shadeColor: '#d4dbe5',
            extra: `<path d="M 499 1182 L 547 1182 L 547 1196 L 500 1196 Z" fill="#1f6fd6"/>` + ln('M 548 1180 C 572 1180 574 1214 546 1214', INK, 6) + ln('M 512 1148 q -10 -14 0 -28 q 10 -14 0 -28 M 530 1148 q -10 -14 0 -28', '#ffffff', 5, ' opacity="0.9"') }));
          headP(K, htf, parts);
        },
      },
      2: { name: 'LE CHIGNON', text: 'Chignon et pince glace. Blouse lilas, longue doudoune bleu nuit, café à emporter.', note: 'Cheveux longs relevés en chignon avec une pince couleur glace, deux mèches qui tombent. Blouse lilas, longue doudoune bleu nuit ouverte, baskets, café à emporter. Les cernes de la fatigue.',
        skin: '#d6a07a', skinS: '#b27a55', hair: '#2a1b14', hairS: '#160e0a', hairT: '#5a4235', clip: '#8fd3ff',
        head: Object.assign({ hair: 'bun', lips: '#9a4c40' }, NADIA_HEAD), hs: 1.22,
        c: { scrub: '#9d8fd6', scrubS: '#7a6cb4', trim: '#f2efff', coat: '#2b3b66', coatS: '#1d2848', coatH: '#5a72b0', shoe: '#f8f7f3', shoeS: '#c9cdd6', sole: '#9aa1ad' },
        front: (K, parts, htf) => {
          const hip = 1190, ank = 1690, c = K.c;
          pantsF(parts, { top: hip, ank, tw: 100, ao: 116, ai: 14, fill: c.scrub, shade: c.scrubS });
          sneakerF(parts, 382, ank, -1, { c: c.shoe, s: c.shoeS, sole: c.sole }); sneakerF(parts, 518, ank, 1, { c: c.shoe, s: c.shoeS, sole: c.sole });
          parts.push(part('M 426 776 L 474 776 L 476 900 C 466 944 434 944 424 900 Z', K.skin, { shade: 'M 400 766 L 500 766 L 500 820 C 470 836 430 836 400 820 Z', shadeColor: K.skinS }));
          parts.push(part(sym([[0, 950, 1], [28, 868, 1], [76, 872], [100, 902], [104, 970], [98, 1080], [104, 1228, 1], [0, 1234]]), c.scrub,
            { shade: 'M 330 860 L 392 860 C 380 960 384 1100 396 1240 L 330 1240 Z', shadeColor: c.scrubS, extra: ln('M 422 868 L 450 950 L 478 868', c.trim, 6) + ln('M 432 872 L 444 1020 M 468 872 L 456 1020', '#e86a52', 4) +
              `<rect x="430" y="1018" width="40" height="52" rx="5" fill="#f7f9fc" stroke="${INK}" stroke-width="${LW}"/><rect x="430" y="1018" width="40" height="13" fill="#e86a52"/><rect x="438" y="1036" width="14" height="16" fill="#c9d1dc"/>` + ln('M 456 1040 l 8 0 M 456 1048 l 8 0 M 438 1060 l 24 0', '#9aa1ad', 3) }));
          // the long puffer coat, open, its hood behind the neck
          parts.push(part('M 392 866 C 400 840 500 840 508 866 L 486 880 C 470 872 430 872 414 880 Z', c.coat));
          [-1, 1].forEach(k => {
            const rows = [[40, 872, 1], [84, 868], [116, 900], [124, 960], [118, 1040], [126, 1120], [120, 1200], [128, 1280], [124, 1360], [130, 1424, 1], [58, 1428, 1], [54, 1300], [52, 1150], [48, 980], [40, 872, 1]];
            parts.push(part(smooth(at(rows, 450, 0, k)), c.coat, { shade: k < 0 ? 'M 310 860 L 372 860 C 362 1000 366 1250 376 1440 L 310 1440 Z' : null, shadeColor: c.coatS,
              extra: ln([960, 1040, 1120, 1200, 1280, 1360].map(y => `M ${450 + k * 56} ${y} q ${k * 34} 10 ${k * 68} 0`).join(' '), INK, LW) + ln(`M ${450 + k * 70} 930 q ${k * 20} -8 ${k * 40} 0 M ${450 + k * 72} 1090 q ${k * 20} -8 ${k * 40} 0`, c.coatH, 7, ' opacity="0.8"') }));
          });
          arm(parts, [362, 908], [338, 1040], [336, 1150], 62, c.coat, { shine: c.coatH });
          arm(parts, [538, 908], [562, 1040], [564, 1150], 62, c.coat, { shine: c.coatH });
          handF(parts, K, 336, 1186);
          // a takeaway coffee
          parts.push(part('M 570 1150 L 622 1150 L 614 1240 L 578 1240 Z', '#f4f1ea', { shade: 'M 560 1140 L 584 1140 L 584 1250 L 560 1250 Z', shadeColor: '#d8d2c6',
            extra: `<path d="M 566 1138 L 626 1138 L 624 1152 L 568 1152 Z" fill="#2b2f3a" stroke="${INK}" stroke-width="${LW}"/><path d="M 574 1180 L 618 1180 L 615 1212 L 577 1212 Z" fill="#9a6a44" stroke="${INK}" stroke-width="${LW}"/>` }));
          handF(parts, K, 564, 1186);
          headF(K, 'frime', htf, parts);
        },
        profile: (K, parts, htf) => {
          const hip = 1190, ank = 1690, c = K.c;
          legP(parts, 440, 424, c.scrubS, c.scrubS, hip, ank); legP(parts, 470, 500, c.scrub, c.scrubS, hip, ank);
          sneakerP(parts, 424, ank, { c: c.shoe, s: c.shoeS, sole: c.sole }, true); sneakerP(parts, 500, ank, { c: c.shoe, s: c.shoeS, sole: c.sole });
          neckP(parts, K);
          parts.push(part('M 446 872 C 420 874 398 900 396 950 C 392 1010 400 1060 396 1120 C 394 1170 398 1210 404 1232 L 540 1232 C 546 1180 540 1120 532 1080 C 528 1040 546 1000 544 960 C 542 920 520 884 496 876 Z', c.scrub,
            { shade: 'M 360 860 L 420 860 L 420 1240 L 360 1240 Z', shadeColor: c.scrubS, extra: ln('M 500 878 C 512 900 520 914 526 930', c.trim, 6) }));
          // the long coat from the side : puffy, open in front
          parts.push(part('M 442 866 C 396 866 368 900 364 960 C 358 1040 368 1120 362 1200 C 356 1280 366 1360 362 1430 L 506 1432 C 500 1350 496 1260 498 1180 C 500 1090 504 1000 504 950 C 506 910 494 880 470 868 Z', c.coat,
            { shade: 'M 330 860 L 396 860 L 404 1440 L 330 1440 Z', shadeColor: c.coatS,
              extra: ln('M 366 980 q 66 16 134 0 M 364 1060 q 68 16 136 0 M 364 1140 q 68 16 136 0 M 362 1220 q 68 16 138 0 M 362 1300 q 70 16 140 0 M 362 1380 q 70 16 142 0', INK, LW) }));
          parts.push(part('M 404 860 C 420 838 470 836 488 858 C 496 872 486 884 470 880 C 450 874 426 874 410 880 Z', c.coat));
          arm(parts, [466, 914], [476, 1044], [490, 1146], 62, c.coat, { shine: c.coatH });
          handP(parts, K);
          parts.push(part('M 500 1146 L 546 1146 L 540 1232 L 506 1232 Z', '#f4f1ea', { shade: 'M 494 1140 L 512 1140 L 512 1240 L 494 1240 Z', shadeColor: '#d8d2c6',
            extra: `<path d="M 496 1134 L 550 1134 L 548 1148 L 498 1148 Z" fill="#2b2f3a" stroke="${INK}" stroke-width="${LW}"/><path d="M 503 1176 L 543 1176 L 541 1206 L 505 1206 Z" fill="#9a6a44" stroke="${INK}" stroke-width="${LW}"/>` }));
          headP(K, htf, parts);
        },
      },
    },
  };

  // a phone held upright in a hand (front) ; drawn before the hand that covers its bottom
  const phoneF = (parts, x, y, glow = '#8fd3ff') => parts.push(part(`M ${x - 17} ${y - 66} L ${x + 17} ${y - 66} C ${x + 22} ${y - 66} ${x + 22} ${y - 60} ${x + 22} ${y - 56} L ${x + 22} ${y + 4} L ${x - 22} ${y + 4} L ${x - 22} ${y - 56} C ${x - 22} ${y - 62} ${x - 21} ${y - 66} ${x - 17} ${y - 66} Z`, '#2a2d36',
    { extra: `<rect x="${x - 16}" y="${y - 58}" width="32" height="54" rx="4" fill="${glow}" opacity="0.85"/>` }));
  const phoneP = (parts, x, y) => parts.push(part(`M ${x - 4} ${y - 70} L ${x + 8} ${y - 70} L ${x + 8} ${y + 6} L ${x - 4} ${y + 6} Z`, '#2a2d36'));

  CAST.deuce = {
    1: { name: 'LE MANAGER', text: 'Grand et lent. Blazer sur un sweat à capuche, sacoche, oreillette, téléphone.', note: 'Grand, lent, sûr de lui. Dégradé net avec une raie rasée. Blazer bleu marine ouvert sur un sweat gris à capuche, sacoche en bandoulière, oreillette, téléphone à la main, jogging noir et grosses baskets.',
      skin: '#6b3f27', skinS: '#4f2d1b', hair: '#17110e', hairS: '#0b0807', hairT: '#4a3d37', fadeC: '#3f2d24',
      head: { face: 'long', prof: 'male', hair: 'fade', nose: 'wide', eye: { lazy: true }, browW: 8, earpiece: '#f2f4f8', mouth: { frime: 'smirk' } }, hs: 1.2,
      c: { pant: '#22252c', pantS: '#15171c', hood: '#9da3ad', hoodS: '#7f8590', blz: '#24304f', blzS: '#18203a', lap: '#33416a', shoe: '#f8f7f3', shoeS: '#c9cdd6', sole: '#9aa1ad', mark: '#8fd3ff', bag: '#1c1e24' },
      front: (K, parts, htf) => {
        const hip = 1230, ank = 1770, c = K.c;
        pantsF(parts, { top: hip, ank, tw: 92, ao: 100, ai: 22, fill: c.pant, shade: c.pantS, extra: ln(`M 352 ${ank - 18} L 428 ${ank - 18} M 472 ${ank - 18} L 548 ${ank - 18}`, '#3a3e48', 5) });
        sneakerF(parts, 382, ank, -1, { c: c.shoe, s: c.shoeS, sole: c.sole, mark: c.mark, z: 0.86 }); sneakerF(parts, 518, ank, 1, { c: c.shoe, s: c.shoeS, sole: c.sole, mark: c.mark, z: 0.86 });
        parts.push(part('M 392 890 C 390 838 510 838 508 890 L 484 880 C 474 866 426 866 416 880 Z', c.hood, { shade: 'M 380 820 L 420 820 L 420 900 L 380 900 Z', shadeColor: c.hoodS }));
        neckF(parts, K, 22);
        parts.push(part(sym([[0, 872], [40, 868], [86, 882], [104, 912], [106, 1000], [102, 1120], [106, 1252, 1], [0, 1258]]), c.hood,
          { extra: ln('M 436 900 L 432 984 M 464 900 L 468 978', '#f2f4f8', 4) + dot(432, 988, 4, '#f2f4f8') + dot(468, 982, 4, '#f2f4f8') + ln('M 360 1236 L 540 1236', c.hoodS, 5) }));
        [-1, 1].forEach(k => parts.push(part(smooth(at([[34, 872, 1], [80, 866], [112, 896], [118, 980], [114, 1120], [120, 1286, 1], [62, 1290, 1], [58, 1160], [52, 1040], [44, 960], [34, 872, 1]], 450, 0, k)), c.blz,
          { shade: k < 0 ? 'M 320 860 L 376 860 C 366 1000 370 1150 380 1300 L 320 1300 Z' : null, shadeColor: c.blzS,
            extra: `<path d="M ${450 + k * 36} 874 L ${450 + k * 74} 880 L ${450 + k * 60} 960 L ${450 + k * 47} 1004 Z" fill="${c.lap}" stroke="${INK}" stroke-width="${LW}" stroke-linejoin="round"/>` +
              (k > 0 ? `<path d="M 512 952 l 20 -12 l 6 14 Z" fill="#f2f4f8" stroke="${INK}" stroke-width="2.4"/>` : dot(450 + k * 62, 1140, 5, c.blzS, ` stroke="${INK}" stroke-width="2.4"`)) })));
        // the crossbody bag
        parts.push({ kind: 'stroke', d: 'M 386 884 L 540 1196', w: 12, color: c.bag });
        parts.push(part('M 500 1176 L 572 1176 C 580 1176 584 1182 584 1190 L 584 1232 C 584 1240 578 1244 570 1244 L 502 1244 C 494 1244 490 1240 490 1232 L 490 1188 C 490 1180 494 1176 500 1176 Z', c.bag, { extra: ln('M 500 1196 L 574 1196', '#3a3e48', 3) + dot(560, 1196, 3, '#8fd3ff') }));
        arm(parts, [358, 908], [338, 1060], [336, 1190], 52, c.blz, { under: c.hood });
        arm(parts, [542, 908], [562, 1060], [564, 1190], 52, c.blz, { under: c.hood });
        phoneF(parts, 336, 1222);
        handF(parts, K, 336, 1226); handF(parts, K, 564, 1226);
        headF(K, 'frime', htf, parts);
      },
      profile: (K, parts, htf) => {
        const hip = 1230, ank = 1770, c = K.c;
        legP(parts, 440, 428, c.pantS, c.pantS, hip, ank); legP(parts, 470, 496, c.pant, c.pantS, hip, ank);
        sneakerP(parts, 428, ank, { c: c.shoe, s: c.shoeS, sole: c.sole }, true); sneakerP(parts, 496, ank, { c: c.shoe, s: c.shoeS, sole: c.sole, mark: c.mark });
        parts.push(part('M 404 900 C 384 870 400 836 440 834 C 460 834 470 850 466 870 Z', c.hood));
        neckP(parts, K);
        parts.push(part('M 446 870 C 416 872 394 900 392 960 C 388 1040 396 1120 392 1200 L 396 1256 L 538 1256 C 544 1200 536 1120 532 1060 C 530 1000 540 940 528 900 C 520 880 504 872 490 870 Z', c.hood, { shade: 'M 360 860 L 418 860 L 418 1260 L 360 1260 Z', shadeColor: c.hoodS, extra: ln('M 506 884 L 512 970', '#f2f4f8', 4) + ln('M 396 1240 L 536 1240', c.hoodS, 5) }));
        parts.push(part('M 444 866 C 404 866 380 900 378 960 C 374 1040 382 1120 378 1200 C 376 1240 378 1270 382 1290 L 500 1292 C 496 1240 494 1180 494 1120 C 494 1040 500 980 506 940 C 510 906 496 878 470 868 Z', c.blz,
          { shade: 'M 340 860 L 404 860 L 412 1300 L 340 1300 Z', shadeColor: c.blzS, extra: `<path d="M 470 870 L 506 900 L 500 980 Z" fill="${c.lap}" stroke="${INK}" stroke-width="${LW}" stroke-linejoin="round"/>` }));
        parts.push({ kind: 'stroke', d: 'M 470 878 L 540 1110', w: 12, color: c.bag });
        arm(parts, [466, 914], [474, 1060], [488, 1186], 52, c.blz, { under: c.hood });
        phoneP(parts, 506, 1214);
        handP(parts, K, 488, 1186);
        headP(K, htf, parts);
      },
    },
    2: { name: 'LE REVENDEUR', text: 'Bob beige, survêtement vert, tee blanc, boîte de baskets sous le bras.', note: 'Grand, lent, sûr de lui. Bob beige sur des cheveux courts, survêtement vert à liseré blanc ouvert sur un tee blanc, grosses baskets, et toujours une boîte de baskets à revendre.',
      skin: '#8f5634', skinS: '#6d3f24', hair: '#17110e', hairS: '#0b0807', hairT: '#4a3d37', hat: '#cdb894', hatS: '#ab9672',
      head: { face: 'angular', prof: 'male', hair: 'bucket', nose: 'wide', eye: { lazy: true }, browW: 8, mouth: { frime: 'smirk' } }, hs: 1.2,
      c: { suit: '#2f6b4f', suitS: '#22513b', pipe: '#f4f6f2', tee: '#f6f2ea', shoe: '#f8f7f3', shoeS: '#c9cdd6', sole: '#9aa1ad', mark: '#2f6b4f', box: '#c69c6d', boxS: '#a47e53' },
      front: (K, parts, htf) => {
        const hip = 1230, ank = 1770, c = K.c;
        pantsF(parts, { top: hip, ank, tw: 96, ao: 104, ai: 20, fill: c.suit, shade: c.suitS, extra: ln(`M ${450 - 96} ${hip + 6} C ${450 - 92} ${hip + 200} ${450 - 104} ${ank - 160} ${450 - 102} ${ank - 4} M ${450 + 96} ${hip + 6} C ${450 + 92} ${hip + 200} ${450 + 104} ${ank - 160} ${450 + 102} ${ank - 4}`, c.pipe, 5) + ln(`M 350 ${ank - 16} L 426 ${ank - 16} M 474 ${ank - 16} L 550 ${ank - 16}`, c.suitS, 6) });
        sneakerF(parts, 382, ank, -1, { c: c.shoe, s: c.shoeS, sole: c.sole, mark: c.mark, z: 0.86, high: true }); sneakerF(parts, 518, ank, 1, { c: c.shoe, s: c.shoeS, sole: c.sole, mark: c.mark, z: 0.86, high: true });
        neckF(parts, K, 22, 930);
        parts.push(part(sym([[0, 1010, 1], [26, 872, 1], [80, 868], [106, 898], [110, 1000], [106, 1120], [110, 1248, 1], [0, 1254]]), c.suit,
          { shade: 'M 320 860 L 384 860 C 372 980 376 1120 388 1260 L 320 1260 Z', shadeColor: c.suitS,
            extra: `<path d="M 424 870 L 450 1008 L 476 870 L 470 870 L 450 960 L 430 870 Z" fill="${c.tee}"/>` + ln('M 450 1010 L 450 1236', '#c9cdd6', 4) + ln('M 352 1232 L 548 1232', c.suitS, 8) +
              `<path d="M 412 872 L 420 846 L 446 860 Z M 488 872 L 480 846 L 454 860 Z" fill="${c.suit}" stroke="${INK}" stroke-width="${LW}" stroke-linejoin="round"/>` }));
        arm(parts, [358, 908], [338, 1060], [336, 1190], 54, c.suit, { cuff: c.suitS, stripe: c.pipe });
        arm(parts, [542, 908], [562, 1060], [564, 1190], 54, c.suit, { cuff: c.suitS, stripe: c.pipe });
        handF(parts, K, 336, 1226);
        // a sneaker box to sell
        parts.push(part('M 566 1168 L 680 1168 L 680 1254 L 566 1254 Z', c.box, { shade: 'M 560 1240 L 690 1240 L 690 1260 L 560 1260 Z', shadeColor: c.boxS,
          extra: `<path d="M 562 1158 L 684 1158 L 684 1182 L 562 1182 Z" fill="#f4f1ea" stroke="${INK}" stroke-width="${LW}"/><rect x="636" y="1200" width="34" height="22" fill="#f4f1ea" stroke="${INK}" stroke-width="2.4"/>` }));
        handF(parts, K, 564, 1226);
        headF(K, 'frime', htf, parts);
      },
      profile: (K, parts, htf) => {
        const hip = 1230, ank = 1770, c = K.c;
        legP(parts, 440, 428, c.suitS, c.suitS, hip, ank); legP(parts, 470, 496, c.suit, c.suitS, hip, ank, ln(`M 474 ${hip} C 486 ${hip + 200} 500 ${ank - 160} 498 ${ank - 4}`, c.pipe, 5));
        sneakerP(parts, 428, ank, { c: c.shoe, s: c.shoeS, sole: c.sole, high: true }, true); sneakerP(parts, 496, ank, { c: c.shoe, s: c.shoeS, sole: c.sole, mark: c.mark, high: true });
        neckP(parts, K);
        parts.push(part('M 446 868 C 412 870 390 900 388 960 C 384 1040 392 1120 388 1200 L 392 1252 L 540 1252 C 546 1200 538 1120 534 1060 C 532 1000 542 940 530 900 C 522 880 506 870 490 868 Z', c.suit,
          { shade: 'M 350 860 L 414 860 L 414 1260 L 350 1260 Z', shadeColor: c.suitS, extra: ln('M 392 1236 L 538 1236', c.suitS, 8) + `<path d="M 492 870 L 512 846 L 520 880 Z" fill="${c.suit}" stroke="${INK}" stroke-width="${LW}" stroke-linejoin="round"/>` + ln('M 520 884 C 528 910 532 940 532 966', c.tee, 6) }));
        arm(parts, [466, 914], [474, 1060], [488, 1186], 54, c.suit, { cuff: c.suitS, stripe: c.pipe });
        handP(parts, K, 488, 1186);
        parts.push(part('M 470 1176 L 528 1176 L 528 1262 L 470 1262 Z', c.box, { shade: 'M 464 1240 L 534 1240 L 534 1268 L 464 1268 Z', shadeColor: c.boxS, extra: `<path d="M 466 1166 L 532 1166 L 532 1190 L 466 1190 Z" fill="#f4f1ea" stroke="${INK}" stroke-width="${LW}"/>` }));
        headP(K, htf, parts);
      },
    },
  };

  // headphones around the neck (front / profile)
  const phonesF = (parts) => {
    parts.push({ kind: 'stroke', d: 'M 396 896 C 400 850 500 850 504 896', w: 10, color: '#f2f4f8' });
    [-1, 1].forEach(k => parts.push(part(`M ${450 + k * 40} 884 C ${450 + k * 40} 868 ${450 + k * 78} 868 ${450 + k * 78} 884 L ${450 + k * 78} 916 C ${450 + k * 78} 932 ${450 + k * 40} 932 ${450 + k * 40} 916 Z`, '#f2f4f8',
      { extra: `<path d="M ${450 + k * 46} 888 L ${450 + k * 72} 888 L ${450 + k * 72} 912 L ${450 + k * 46} 912 Z" fill="#8fd3ff" stroke="${INK}" stroke-width="2.4"/>` })));
  };
  CAST.maya = {
    1: { name: 'LES TRESSES', text: 'Tresses en queue haute, sweat lilas trop grand, casque au cou, téléphone.', note: 'Calme et sarcastique, toujours sur son téléphone. Tresses en queue de cheval haute avec un chouchou lilas, petites créoles, sweat lilas trop grand, casque autour du cou, cargo gris et grosses baskets.',
      skin: '#9a5f3c', skinS: '#784528', hair: '#18110e', hairS: '#0c0807', hairT: '#4a3a33', scrunch: '#b7a3e6', scrunchS: '#957fcc',
      head: { face: 'soft', prof: 'female', hair: 'pony', nose: 'small', eye: { lash: true, lazy: true }, browW: 6, lips: '#5e2f24', hoop: '#efbb31', mouth: { frime: 'smirk', colere: 'flat', fierte: 'grin' }, brows: { colere: [[-14, -30], [-14, -30]] } }, hs: 1.3,
      c: { hood: '#b7a3e6', hoodS: '#957fcc', pant: '#7c818d', pantS: '#5f6470', shoe: '#f8f7f3', shoeS: '#c9cdd6', sole: '#9aa1ad', mark: '#b7a3e6' },
      front: (K, parts, htf) => {
        const hip = 1206, ank = 1666, c = K.c;
        pantsF(parts, { top: hip, ank, tw: 100, ao: 122, ai: 12, fill: c.pant, shade: c.pantS, extra: `<path d="M 352 1360 l 40 0 l 0 56 l -40 0 Z M 508 1360 l 40 0 l 0 56 l -40 0 Z" fill="${c.pantS}" stroke="${INK}" stroke-width="${LW}"/>` });
        sneakerF(parts, 382, ank, -1, { c: c.shoe, s: c.shoeS, sole: c.sole, mark: c.mark, z: 0.84 }); sneakerF(parts, 518, ank, 1, { c: c.shoe, s: c.shoeS, sole: c.sole, mark: c.mark, z: 0.84 });
        parts.push(part('M 392 892 C 390 840 510 840 508 892 L 484 882 C 474 868 426 868 416 882 Z', c.hood, { shade: 'M 380 820 L 420 820 L 420 900 L 380 900 Z', shadeColor: c.hoodS }));
        neckF(parts, K, 21);
        parts.push(part(sym([[0, 874], [38, 868], [88, 882], [112, 914], [118, 1000], [114, 1120], [118, 1246, 1], [0, 1252]]), c.hood,
          { shade: 'M 320 860 L 380 860 C 370 980 374 1120 384 1260 L 320 1260 Z', shadeColor: c.hoodS,
            extra: `<path d="M 390 1110 L 510 1110 L 530 1196 L 370 1196 Z" fill="${c.hood}" stroke="${INK}" stroke-width="${LW}" stroke-linejoin="round"/>` + ln('M 352 1234 L 548 1234', c.hoodS, 8) + ln('M 436 902 L 432 970 M 464 902 L 468 966', '#f2f4f8', 4) }));
        phonesF(parts);
        arm(parts, [356, 910], [334, 1046], [332, 1166], 58, c.hood, { cuff: c.hoodS });
        arm(parts, [544, 910], [566, 1046], [568, 1166], 58, c.hood, { cuff: c.hoodS });
        handF(parts, K, 332, 1198);
        phoneF(parts, 568, 1196, '#b7a3e6');
        handF(parts, K, 568, 1198);
        headF(K, 'frime', htf, parts);
      },
      profile: (K, parts, htf) => {
        const hip = 1206, ank = 1666, c = K.c;
        legP(parts, 440, 424, c.pantS, c.pantS, hip, ank); legP(parts, 470, 500, c.pant, c.pantS, hip, ank, `<path d="M 452 1380 l 46 0 l 2 56 l -46 0 Z" fill="${c.pantS}" stroke="${INK}" stroke-width="${LW}"/>`);
        sneakerP(parts, 424, ank, { c: c.shoe, s: c.shoeS, sole: c.sole }, true); sneakerP(parts, 500, ank, { c: c.shoe, s: c.shoeS, sole: c.sole, mark: c.mark });
        parts.push(part('M 404 902 C 384 872 400 838 440 836 C 460 836 470 852 466 872 Z', c.hood));
        neckP(parts, K);
        parts.push(part('M 446 870 C 410 872 386 902 382 962 C 376 1040 386 1120 380 1200 L 384 1250 L 546 1250 C 552 1200 544 1120 540 1060 C 538 1000 548 940 534 902 C 526 880 506 872 490 870 Z', c.hood,
          { shade: 'M 350 860 L 410 860 L 410 1260 L 350 1260 Z', shadeColor: c.hoodS, extra: `<path d="M 470 1110 L 546 1110 L 550 1196 L 466 1196 Z" fill="${c.hood}" stroke="${INK}" stroke-width="${LW}"/>` + ln('M 384 1234 L 546 1234', c.hoodS, 8) }));
        parts.push(part('M 480 872 C 480 858 512 858 512 872 L 512 906 C 512 920 480 920 480 906 Z', '#f2f4f8', { extra: `<path d="M 486 876 L 506 876 L 506 902 L 486 902 Z" fill="#8fd3ff" stroke="${INK}" stroke-width="2.4"/>` }));
        arm(parts, [466, 914], [476, 1046], [490, 1160], 58, c.hood, { cuff: c.hoodS });
        handP(parts, K, 490, 1166);
        phoneP(parts, 512, 1196);
        headP(K, htf, parts);
      },
    },
    2: { name: 'LE CARRÉ', text: 'Carré noir à frange, lunettes rondes, pull moutarde, jean droit, téléphone.', note: 'Calme et sarcastique, toujours sur son téléphone. Carré noir avec une frange droite, lunettes rondes, gros pull moutarde sur un col de chemise blanc, jean droit et baskets blanches.',
      skin: '#dfae86', skinS: '#bd8a62', hair: '#141011', hairS: '#08060a', hairT: '#3c3436',
      head: { face: 'soft', prof: 'female', hair: 'bob', noEars: true, nose: 'small', eye: { lash: true, lazy: true }, browW: 6, lips: '#a5584a', glasses: 'round', frame: '#2b2f3a', mouth: { frime: 'smirk', colere: 'flat', fierte: 'grin' }, brows: { colere: [[-14, -30], [-14, -30]] } }, hs: 1.3,
      c: { knit: '#e0b13d', knitS: '#bf9126', collar: '#f6f2ea', jean: '#3d5a8a', jeanS: '#2c4268', shoe: '#f8f7f3', shoeS: '#c9cdd6', sole: '#9aa1ad' },
      front: (K, parts, htf) => {
        const hip = 1206, ank = 1666, c = K.c;
        pantsF(parts, { top: hip, ank, tw: 98, ao: 110, ai: 16, fill: c.jean, shade: c.jeanS });
        sneakerF(parts, 382, ank, -1, { c: c.shoe, s: c.shoeS, sole: c.sole }); sneakerF(parts, 518, ank, 1, { c: c.shoe, s: c.shoeS, sole: c.sole });
        neckF(parts, K, 21);
        parts.push(part(sym([[0, 874], [36, 868], [88, 882], [112, 914], [118, 1000], [114, 1120], [116, 1238, 1], [0, 1244]]), c.knit,
          { shade: 'M 320 860 L 380 860 C 370 980 374 1120 384 1250 L 320 1250 Z', shadeColor: c.knitS,
            extra: ln('M 352 1222 L 548 1222', c.knitS, 10) + ln([1222].map(y => [360, 380, 400, 420, 440, 460, 480, 500, 520, 540].map(x => `M ${x} ${y - 8} l 0 16`).join(' ')).join(' '), INK, 2) +
              ln('M 400 960 q 10 10 0 20 q -10 10 0 20 M 500 960 q 10 10 0 20 q -10 10 0 20 M 450 1000 q 10 10 0 20 q -10 10 0 20', c.knitS, 4) +
              `<path d="M 420 868 L 450 900 L 432 916 L 410 880 Z M 480 868 L 450 900 L 468 916 L 490 880 Z" fill="${c.collar}" stroke="${INK}" stroke-width="${LW}" stroke-linejoin="round"/>` }));
        arm(parts, [356, 910], [334, 1046], [332, 1166], 58, c.knit, { cuff: c.knitS });
        arm(parts, [544, 910], [566, 1046], [568, 1166], 58, c.knit, { cuff: c.knitS });
        handF(parts, K, 332, 1198);
        phoneF(parts, 568, 1196, '#8fd3ff');
        handF(parts, K, 568, 1198);
        headF(K, 'frime', htf, parts);
      },
      profile: (K, parts, htf) => {
        const hip = 1206, ank = 1666, c = K.c;
        legP(parts, 440, 424, c.jeanS, c.jeanS, hip, ank); legP(parts, 470, 500, c.jean, c.jeanS, hip, ank);
        sneakerP(parts, 424, ank, { c: c.shoe, s: c.shoeS, sole: c.sole }, true); sneakerP(parts, 500, ank, { c: c.shoe, s: c.shoeS, sole: c.sole });
        neckP(parts, K);
        parts.push(part('M 446 870 C 410 872 386 902 382 962 C 376 1040 386 1120 380 1200 L 384 1242 L 546 1242 C 552 1200 544 1120 540 1060 C 538 1000 548 940 534 902 C 526 880 506 872 490 870 Z', c.knit,
          { shade: 'M 350 860 L 410 860 L 410 1250 L 350 1250 Z', shadeColor: c.knitS, extra: ln('M 384 1226 L 546 1226', c.knitS, 10) + `<path d="M 492 870 L 520 896 L 506 906 Z" fill="${c.collar}" stroke="${INK}" stroke-width="${LW}" stroke-linejoin="round"/>` }));
        arm(parts, [466, 914], [476, 1046], [490, 1160], 58, c.knit, { cuff: c.knitS });
        handP(parts, K, 490, 1166);
        phoneP(parts, 512, 1196);
        headP(K, htf, parts);
      },
    },
  };

  const PAT = `<pattern id="chk" width="26" height="26" patternUnits="userSpaceOnUse"><rect width="26" height="26" fill="#a9c2e0"/><path d="M 0 13 L 26 13 M 13 0 L 13 26" stroke="#6f8fb8" stroke-width="6" opacity="0.75"/><path d="M 0 13 L 26 13 M 13 0 L 13 26" stroke="#ffffff" stroke-width="1.5" opacity="0.6"/></pattern>`;
  // a little snowflake (pendant, embroidery)
  const flake = (x, y, r, color, w = 2.6) => {
    let d = '';
    for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 - Math.PI / 2, ux = Math.cos(a), uy = Math.sin(a); d += `M ${r1(x)} ${r1(y)} L ${r1(x + ux * r)} ${r1(y + uy * r)} `; [-1, 1].forEach(sg => { d += `M ${r1(x + ux * r * 0.6)} ${r1(y + uy * r * 0.6)} l ${r1(Math.cos(a + sg * 0.8) * r * 0.34)} ${r1(Math.sin(a + sg * 0.8) * r * 0.34)} `; }); }
    return ln(d, color, w);
  };
  CAST.bigmo = {
    1: { name: 'LE BOSS DU QUARTIER', text: 'Lunettes noires la nuit, barbe, doudoune noire sur un sweat rouge, pendentif glace.', note: 'Le rival : 50 000 abonnés, il poste un clip par jour. Grand gabarit, coupe rase bien nette, barbe courte, lunettes noires même la nuit. Doudoune noire ouverte sur un sweat rouge, pendentif en flocon de glace (un clin d\'œil : il utilise déjà Stalak), cargo noir.',
      skin: '#5e3720', skinS: '#442615', hair: '#141010', hairS: '#080606', hairT: '#3c3230',
      head: { face: 'big', prof: 'big', hair: 'buzz', nose: 'wide', glasses: 'sun', beard: 'full', browW: 11, mouth: { frime: 'smirk' } }, hs: 1.2,
      c: { pf: '#1f2128', pfS: '#121318', pfH: '#4c5160', red: '#c8443a', redS: '#a3332b', pant: '#2a2c33', pantS: '#1b1c21', shoe: '#2b2e38', shoeS: '#1b1d24', sole: '#f2efe8', mark: '#c8443a', ice: '#d6ecff' },
      front: (K, parts, htf) => {
        const hip = 1214, ank = 1690, c = K.c;
        pantsF(parts, { top: hip, ank, tw: 132, ao: 146, ai: 18, fill: c.pant, shade: c.pantS, extra: `<path d="M 320 1380 l 40 0 l 0 60 l -40 0 Z M 540 1380 l 40 0 l 0 60 l -40 0 Z" fill="${c.pantS}" stroke="${INK}" stroke-width="${LW}"/>` });
        sneakerF(parts, 372, ank, -1, { c: c.shoe, s: c.shoeS, sole: c.sole, mark: c.mark, z: 0.9, lace: '#f2efe8' }); sneakerF(parts, 528, ank, 1, { c: c.shoe, s: c.shoeS, sole: c.sole, mark: c.mark, z: 0.9, lace: '#f2efe8' });
        parts.push(part('M 386 892 C 384 834 516 834 514 892 L 488 880 C 476 864 424 864 412 880 Z', c.red, { shade: 'M 370 820 L 414 820 L 414 900 L 370 900 Z', shadeColor: c.redS }));
        neckF(parts, K, 32);
        parts.push(part(sym([[0, 874], [44, 868], [110, 882], [140, 916], [148, 1000], [150, 1120], [144, 1244, 1], [0, 1250]]), c.red, { extra: ln('M 434 904 L 430 976 M 466 904 L 470 972', '#f2efe8', 4) }));
        // the chain and the ice pendant
        parts.push(overlay(ln('M 416 880 C 420 940 436 984 450 1000 C 464 984 480 940 484 880', '#c9d6e6', 4) + `<circle cx="450" cy="1016" r="20" fill="${c.ice}" stroke="${INK}" stroke-width="${LW}"/>` + flake(450, 1016, 13, '#1f6fd6', 3) +
          '<circle class="shiny" cx="458" cy="1008" r="22" fill="none"/><circle class="shiny" cx="424" cy="930" r="9" fill="none"/>', undefined, [450, 1000]));
        [-1, 1].forEach(k => parts.push(part(smooth(at([[48, 872, 1], [102, 866], [146, 900], [160, 960], [154, 1040], [162, 1120], [154, 1200], [158, 1264, 1], [74, 1268, 1], [70, 1150], [64, 1000], [48, 872, 1]], 450, 0, k)), c.pf,
          { shade: k < 0 ? 'M 280 860 L 330 860 C 322 1000 326 1150 336 1280 L 280 1280 Z' : null, shadeColor: c.pfS,
            extra: ln([960, 1040, 1120, 1200].map(y => `M ${450 + k * 72} ${y} q ${k * 40} 12 ${k * 84} 0`).join(' '), INK, LW) + ln(`M ${450 + k * 92} 930 q ${k * 22} -8 ${k * 44} 0 M ${450 + k * 96} 1090 q ${k * 22} -8 ${k * 44} 0`, c.pfH, 8, ' opacity="0.8"') })));
        arm(parts, [326, 912], [300, 1050], [298, 1166], 78, c.pf, { shine: c.pfH });
        arm(parts, [574, 912], [600, 1050], [602, 1166], 78, c.pf, { shine: c.pfH });
        handF(parts, K, 298, 1206, 1.2);
        phoneF(parts, 602, 1200, '#ffb4a6');
        handF(parts, K, 602, 1206, 1.2);
        headF(K, 'frime', htf, parts);
      },
      profile: (K, parts, htf) => {
        const hip = 1214, ank = 1690, c = K.c;
        legP(parts, 432, 420, c.pantS, c.pantS, hip, ank); legP(parts, 472, 500, c.pant, c.pantS, hip, ank, `<path d="M 452 1390 l 48 0 l 2 60 l -48 0 Z" fill="${c.pantS}" stroke="${INK}" stroke-width="${LW}"/>`);
        sneakerP(parts, 420, ank, { c: c.shoe, s: c.shoeS, sole: c.sole, lace: '#f2efe8' }, true); sneakerP(parts, 500, ank, { c: c.shoe, s: c.shoeS, sole: c.sole, mark: c.mark, lace: '#f2efe8' });
        parts.push(part('M 398 902 C 374 868 394 832 438 830 C 460 830 470 848 466 868 Z', c.red));
        neckP(parts, K);
        parts.push(part('M 444 866 C 396 868 358 904 354 970 C 348 1050 360 1130 356 1210 L 360 1264 L 562 1264 C 574 1200 578 1120 570 1060 C 580 1000 574 930 552 896 C 536 876 508 868 488 866 Z', c.pf,
          { shade: 'M 320 860 L 384 860 L 392 1270 L 320 1270 Z', shadeColor: c.pfS,
            extra: `<path d="M 548 900 C 566 930 572 990 566 1050 C 576 1110 572 1180 564 1250 L 548 1250 C 556 1180 558 1110 548 1050 C 556 990 552 940 536 906 Z" fill="${c.red}" stroke="${INK}" stroke-width="${LW}"/>` +
              ln('M 358 980 q 90 18 178 0 M 356 1060 q 92 18 182 0 M 356 1140 q 92 18 184 0 M 358 1220 q 92 16 182 0', INK, LW) }));
        arm(parts, [460, 916], [470, 1052], [486, 1160], 78, c.pf, { shine: c.pfH });
        handP(parts, K, 486, 1172);
        phoneP(parts, 510, 1206);
        headP(K, htf, parts);
      },
    },
    2: { name: 'LE FLASHY', text: 'Crâne rasé, grosse barbe, lunettes violettes, blouson universitaire rouge.', note: 'Le rival : 50 000 abonnés, il poste un clip par jour. Grand gabarit, crâne rasé qui brille, grosse barbe, lunettes violettes cerclées d\'or même la nuit. Blouson universitaire rouge aux manches crème avec un grand « M », tee blanc, jean clair, baskets rouges.',
      skin: '#a86a3f', skinS: '#844f2b', hair: '#1a1210', hairS: '#0b0807', hairT: '#4a3a33',
      head: { face: 'bigBald', prof: 'big', hair: 'bald', shine: true, nose: 'wide', glasses: 'aviator', beard: 'thick', browW: 11, mouth: { frime: 'smirk' } }, hs: 1.2,
      c: { var: '#c23b33', varS: '#9c2c26', slv: '#f2efe8', slvS: '#cfc9bd', rib: '#1d1f26', tee: '#f6f2ea', jean: '#8fa9cf', jeanS: '#6f8bb5', shoe: '#c23b33', shoeS: '#9c2c26', sole: '#f2efe8', mark: '#f2efe8' },
      front: (K, parts, htf) => {
        const hip = 1214, ank = 1690, c = K.c;
        pantsF(parts, { top: hip, ank, tw: 132, ao: 146, ai: 18, fill: c.jean, shade: c.jeanS });
        sneakerF(parts, 372, ank, -1, { c: c.shoe, s: c.shoeS, sole: c.sole, mark: c.mark, z: 0.9 }); sneakerF(parts, 528, ank, 1, { c: c.shoe, s: c.shoeS, sole: c.sole, mark: c.mark, z: 0.9 });
        neckF(parts, K, 32);
        parts.push(part(sym([[0, 872], [40, 866], [110, 882], [140, 916], [148, 1000], [150, 1120], [144, 1244, 1], [0, 1250]]), c.tee));
        [-1, 1].forEach(k => parts.push(part(smooth(at([[30, 870, 1], [100, 866], [146, 900], [156, 980], [154, 1100], [156, 1236, 1], [40, 1240, 1], [38, 1100], [34, 960], [30, 870, 1]], 450, 0, k)), c.var,
          { shade: k < 0 ? 'M 280 860 L 330 860 C 322 1000 326 1150 336 1250 L 280 1250 Z' : null, shadeColor: c.varS,
            extra: `<path d="M ${450 + k * 40} 1212 L ${450 + k * 156} 1210 L ${450 + k * 156} 1240 L ${450 + k * 40} 1242 Z" fill="${c.rib}" stroke="${INK}" stroke-width="${LW}"/>` + ln(`M ${450 + k * 42} 1222 L ${450 + k * 154} 1221 M ${450 + k * 42} 1231 L ${450 + k * 154} 1230`, c.slv, 3) +
              (k > 0 ? ln('M 488 1000 l 0 0 M 489 1060 l 0 0 M 490 1120 l 0 0', INK, 9) + ln('M 488 1000 l 0 0 M 489 1060 l 0 0 M 490 1120 l 0 0', c.slv, 5) : '') })));
        parts.push(part('M 404 878 C 410 852 490 852 496 878 L 482 892 C 470 878 430 878 418 892 Z', c.rib, { extra: ln('M 410 874 C 430 862 470 862 490 874', c.slv, 3) }));
        parts.push(overlay(`<text x="386" y="1010" text-anchor="middle" font-family="Lilita One" font-size="58" fill="${c.slv}" stroke="${INK}" stroke-width="9" paint-order="stroke">M</text>`, undefined, [386, 990]));
        arm(parts, [326, 912], [302, 1050], [300, 1166], 76, c.slv, { cuff: c.rib });
        arm(parts, [574, 912], [598, 1050], [600, 1166], 76, c.slv, { cuff: c.rib });
        handF(parts, K, 300, 1206, 1.2); handF(parts, K, 600, 1206, 1.2);
        headF(K, 'frime', htf, parts);
      },
      profile: (K, parts, htf) => {
        const hip = 1214, ank = 1690, c = K.c;
        legP(parts, 432, 420, c.jeanS, c.jeanS, hip, ank); legP(parts, 472, 500, c.jean, c.jeanS, hip, ank);
        sneakerP(parts, 420, ank, { c: c.shoe, s: c.shoeS, sole: c.sole }, true); sneakerP(parts, 500, ank, { c: c.shoe, s: c.shoeS, sole: c.sole, mark: c.mark });
        neckP(parts, K);
        parts.push(part('M 444 866 C 396 868 358 904 354 970 C 348 1050 360 1130 356 1200 L 360 1244 L 562 1244 C 574 1190 578 1120 570 1060 C 580 1000 574 930 552 896 C 536 876 508 868 488 866 Z', c.var,
          { shade: 'M 320 860 L 384 860 L 392 1250 L 320 1250 Z', shadeColor: c.varS, extra: `<path d="M 358 1214 L 566 1214 L 562 1244 L 360 1244 Z" fill="${c.rib}" stroke="${INK}" stroke-width="${LW}"/>` + ln('M 360 1224 L 564 1224 M 360 1233 L 563 1233', c.slv, 3) + `<path d="M 548 900 C 566 930 572 990 566 1050 C 572 1110 570 1160 566 1210 L 552 1210 C 556 1160 558 1110 550 1050 C 556 990 552 940 536 906 Z" fill="${c.tee}" stroke="${INK}" stroke-width="${LW}"/>` }));
        parts.push(part('M 452 868 C 470 852 506 856 520 874 L 506 888 C 494 874 470 872 458 882 Z', c.rib));
        arm(parts, [460, 916], [470, 1052], [486, 1160], 76, c.slv, { cuff: c.rib });
        handP(parts, K, 486, 1172);
        headP(K, htf, parts);
      },
    },
  };

  CAST.reyes = {
    1: { name: "L'ÉPICIER", text: 'Grincheux. Moustache, lunettes de lecture, chemise à carreaux, tablier vert.', note: 'Le gérant de l\'épicerie, grincheux, « il a tout vu dans les années 90 ». Dégarni sur le dessus, cheveux gris sur les côtés, grosse moustache, lunettes de lecture, chemise à carreaux aux manches retroussées, tablier vert avec un stylo, journal roulé à la main.',
      skin: '#c08458', skinS: '#9c6440', hair: '#9aa0a6', hairS: '#7c8288', hairT: '#c7ccd1', facial: '#5a5a60',
      head: { face: 'oldBald', prof: 'old', hair: 'balding', nose: 'big', glasses: 'reading', frame: '#5a3a24', beard: 'mustache', browW: 11, browC: '#8d9096', mouth: { frime: 'smirk', colere: 'shout' }, brows: { frime: [[-14, -26], [-26, -30]] } }, hs: 1.2,
      c: { apron: '#3f7a55', apronS: '#2f5e41', pant: '#6b5444', pantS: '#524033', shoe: '#5a3a24', shoeS: '#422a1a', sole: '#2b2f3a' },
      front: (K, parts, htf) => {
        const hip = 1214, ank = 1680, c = K.c;
        pantsF(parts, { top: hip, ank, tw: 108, ao: 112, ai: 18, fill: c.pant, shade: c.pantS });
        sneakerF(parts, 382, ank, -1, { c: c.shoe, s: c.shoeS, sole: c.sole, lace: '#d9c8ad' }); sneakerF(parts, 518, ank, 1, { c: c.shoe, s: c.shoeS, sole: c.sole, lace: '#d9c8ad' });
        neckF(parts, K, 26);
        const shirt = sym([[0, 872], [40, 866], [90, 880], [110, 912], [114, 1000], [122, 1110], [118, 1226, 1], [0, 1232]]);
        parts.push(part(shirt, 'url(#chk)', { shade: 'M 320 860 L 380 860 C 370 980 374 1120 384 1240 L 320 1240 Z', shadeColor: '#7f9cc4',
          extra: `<path d="M 422 868 L 450 900 L 436 918 L 412 880 Z M 478 868 L 450 900 L 464 918 L 488 880 Z" fill="#a9c2e0" stroke="${INK}" stroke-width="${LW}" stroke-linejoin="round"/>` }));
        // the apron and its pocket with a pen
        parts.push(part('M 392 930 L 508 930 L 512 1010 C 530 1040 540 1100 544 1200 L 556 1420 L 344 1420 L 356 1200 C 360 1100 370 1040 388 1010 Z', c.apron,
          { shade: 'M 330 920 L 386 920 L 380 1430 L 330 1430 Z', shadeColor: c.apronS,
            extra: ln('M 392 932 C 400 890 420 872 432 868 M 508 932 C 500 890 480 872 468 868 M 388 1010 L 340 1000 M 512 1010 L 560 1000', c.apronS, 6) + `<path d="M 406 1100 L 494 1100 L 494 1170 L 406 1170 Z" fill="${c.apron}" stroke="${INK}" stroke-width="${LW}"/>` + ln('M 470 1100 l 2 -30', '#2b2f3a', 5) + ln('M 450 1100 L 450 1170', INK, LW * 0.8) }));
        // rolled-up sleeves : bare forearms
        [[[360, 910], [338, 1044], [336, 1164]], [[540, 910], [562, 1044], [564, 1164]]].forEach(([sh, el, wr]) => {
          parts.push({ kind: 'stroke', d: `M ${pt(lerp(sh, el, 0.8))} L ${pt(el)} L ${pt(wr)}`, w: 40, color: K.skin });
          parts.push({ kind: 'stroke', d: `M ${pt(sh)} L ${pt(lerp(el, wr, 0.12))}`, w: 56, color: '#a9c2e0', ticks: '' });
          parts.push({ kind: 'stroke', d: `M ${pt(lerp(sh, el, 0.86))} L ${pt(lerp(el, wr, 0.14))}`, w: 60, color: '#8fabcf' });
        });
        handF(parts, K, 336, 1198);
        parts.push(part('M 548 1150 L 572 1140 L 610 1240 L 586 1250 Z', '#efe9dc', { extra: ln('M 560 1160 L 594 1240 M 570 1156 L 602 1236', '#9aa1ad', 2.6) }));
        handF(parts, K, 564, 1198);
        headF(K, 'frime', htf, parts);
      },
      profile: (K, parts, htf) => {
        const hip = 1214, ank = 1680, c = K.c;
        legP(parts, 440, 428, c.pantS, c.pantS, hip, ank); legP(parts, 470, 496, c.pant, c.pantS, hip, ank);
        sneakerP(parts, 428, ank, { c: c.shoe, s: c.shoeS, sole: c.sole, lace: '#d9c8ad' }, true); sneakerP(parts, 496, ank, { c: c.shoe, s: c.shoeS, sole: c.sole, lace: '#d9c8ad' });
        neckP(parts, K);
        parts.push(part('M 446 868 C 412 870 390 900 388 960 C 384 1040 392 1120 388 1200 L 392 1230 L 560 1230 C 568 1180 566 1120 556 1080 C 560 1030 552 960 536 910 C 526 884 508 872 490 868 Z', 'url(#chk)',
          { shade: 'M 350 860 L 412 860 L 412 1240 L 350 1240 Z', shadeColor: '#7f9cc4' }));
        parts.push(part('M 520 936 C 548 980 562 1040 566 1100 C 570 1200 572 1300 568 1420 L 532 1420 C 536 1300 534 1200 532 1110 C 530 1040 520 980 506 950 Z', c.apron, { shade: 'M 500 920 L 530 920 L 530 1430 L 500 1430 Z', shadeColor: c.apronS, extra: ln('M 520 938 C 500 900 490 880 486 868 M 532 1010 L 420 1000', c.apronS, 6) }));
        parts.push({ kind: 'stroke', d: 'M 472 1044 L 488 1160', w: 40, color: K.skin });
        parts.push({ kind: 'stroke', d: 'M 466 914 L 474 1056', w: 56, color: '#a9c2e0' });
        parts.push({ kind: 'stroke', d: 'M 471 1032 L 474 1060', w: 60, color: '#8fabcf' });
        handP(parts, K, 486, 1168);
        parts.push(part('M 500 1150 L 524 1150 L 524 1260 L 500 1260 Z', '#efe9dc', { extra: ln('M 506 1160 L 506 1250 M 516 1160 L 516 1250', '#9aa1ad', 2.6) }));
        headP(K, htf, parts);
      },
    },
    2: { name: 'LE VÉTÉRAN DES 90s', text: 'Casquette plate, bouc gris, coupe-vent des années 90, montre dorée, cure-dent.', note: 'Le gérant de l\'épicerie, grincheux, « il a tout vu dans les années 90 ». Casquette plate grise, cheveux et bouc gris, coupe-vent rétro bleu-vert, violet et blanc, montre dorée, cure-dent au coin de la bouche.',
      skin: '#a46a44', skinS: '#80502f', hair: '#9aa0a6', hairS: '#7c8288', hairT: '#c7ccd1', facial: '#9aa0a6', hat: '#6e6a64', hatS: '#55514c',
      head: { face: 'old', prof: 'old', hair: 'flatcap', nose: 'big', beard: 'goatee', browW: 10, browC: '#8d9096', mouth: { frime: 'smirk', colere: 'shout' }, brows: { frime: [[-14, -26], [-26, -30]] }, pick: true }, hs: 1.2,
      c: { teal: '#2a9d8f', tealS: '#1f7a6f', purple: '#6c4ab6', purpleS: '#553a92', white: '#f1f1f1', whiteS: '#cfd3d8', pant: '#2b2b30', pantS: '#1b1b1f', shoe: '#f8f7f3', shoeS: '#c9cdd6', sole: '#9aa1ad', gold: '#efbb31' },
      front: (K, parts, htf) => {
        const hip = 1214, ank = 1680, c = K.c;
        pantsF(parts, { top: hip, ank, tw: 108, ao: 112, ai: 18, fill: c.pant, shade: c.pantS });
        sneakerF(parts, 382, ank, -1, { c: c.shoe, s: c.shoeS, sole: c.sole, mark: c.teal }); sneakerF(parts, 518, ank, 1, { c: c.shoe, s: c.shoeS, sole: c.sole, mark: c.teal });
        neckF(parts, K, 26);
        const wb = sym([[0, 870], [40, 864], [92, 880], [114, 914], [118, 1000], [124, 1110], [120, 1226, 1], [0, 1232]]), id = K.id + 'wbF';
        parts.push(part(wb, c.white, { extra: `<clipPath id="${id}"><path d="${wb}"/></clipPath><g clip-path="url(#${id})"><path d="M 300 820 L 600 820 L 600 990 C 520 1010 380 1010 300 990 Z" fill="${c.teal}"/><path d="M 300 990 C 380 1010 520 1010 600 990 L 600 1110 C 520 1128 380 1128 300 1110 Z" fill="${c.purple}"/><path d="M 300 820 L 380 820 C 370 980 374 1120 384 1240 L 300 1240 Z" fill="#000" opacity="0.16"/></g>` +
          `<path d="${wb}" fill="none" stroke="${INK}" stroke-width="${LW}"/>` + ln('M 450 870 L 450 1226', '#c9cdd6', 5) + ln('M 334 1208 L 566 1208', c.whiteS, 10) + `<path d="M 414 870 L 422 840 L 450 856 L 478 840 L 486 870 L 470 878 L 450 868 L 430 878 Z" fill="${c.teal}" stroke="${INK}" stroke-width="${LW}" stroke-linejoin="round"/>` }));
        arm(parts, [358, 910], [334, 1046], [332, 1166], 60, c.teal, { cuff: c.whiteS });
        arm(parts, [542, 910], [566, 1046], [568, 1166], 60, c.teal, { cuff: c.whiteS });
        [[[358, 910], [334, 1046], [332, 1166]], [[542, 910], [566, 1046], [568, 1166]]].forEach(([sh, el, wr]) => parts.push({ kind: 'stroke', d: `M ${pt(lerp(sh, el, 0.62))} L ${pt(el)} L ${pt(lerp(el, wr, 0.5))}`, w: 60, color: c.purple, noLine: true }));
        handF(parts, K, 332, 1198);
        handF(parts, K, 568, 1198);
        parts.push(part('M 312 1176 L 352 1176 L 352 1190 L 312 1190 Z', c.gold));
        headF(K, 'frime', htf, parts);
      },
      profile: (K, parts, htf) => {
        const hip = 1214, ank = 1680, c = K.c;
        legP(parts, 440, 428, c.pantS, c.pantS, hip, ank); legP(parts, 470, 496, c.pant, c.pantS, hip, ank);
        sneakerP(parts, 428, ank, { c: c.shoe, s: c.shoeS, sole: c.sole }, true); sneakerP(parts, 496, ank, { c: c.shoe, s: c.shoeS, sole: c.sole, mark: c.teal });
        neckP(parts, K);
        const wb = 'M 446 866 C 412 868 390 900 388 960 C 384 1040 392 1120 388 1200 L 392 1230 L 562 1230 C 570 1180 568 1120 558 1080 C 562 1030 554 960 538 910 C 528 884 508 870 490 866 Z', id = K.id + 'wbP';
        parts.push(part(wb, c.white, { extra: `<clipPath id="${id}"><path d="${wb}"/></clipPath><g clip-path="url(#${id})"><path d="M 340 820 L 600 820 L 600 990 C 520 1010 420 1010 340 990 Z" fill="${c.teal}"/><path d="M 340 990 C 420 1010 520 1010 600 990 L 600 1110 C 520 1128 420 1128 340 1110 Z" fill="${c.purple}"/><path d="M 340 820 L 412 820 L 412 1240 L 340 1240 Z" fill="#000" opacity="0.16"/></g>` +
          `<path d="${wb}" fill="none" stroke="${INK}" stroke-width="${LW}"/>` + ln('M 392 1212 L 562 1212', c.whiteS, 10) }));
        parts.push(part('M 456 868 L 470 840 L 500 856 L 504 878 Z', c.teal));
        arm(parts, [466, 914], [476, 1046], [490, 1160], 60, c.teal, { cuff: c.whiteS });
        parts.push({ kind: 'stroke', d: 'M 471 996 L 476 1046 L 483 1100', w: 60, color: c.purple, noLine: true });
        handP(parts, K, 490, 1166);
        headP(K, htf, parts);
      },
    },
  };

  // ---------------- the mascot : the official one, as it is (owner, 16/11 3 h 27 : « je veux garder la mascotte de stalak de base, pas de personnage ») ----------------
  // its own stickers (site_src/emoji), shown in Liam's phone screen, never redrawn
  const STICKERS = [['hello', 'SALUT'], ['cool', 'COOL'], ['shock', 'CHOC'], ['hype', 'HYPE'], ['angry', 'COLÈRE'], ['sad', 'TRISTE'], ['lol', 'MDR'], ['love', 'LOVE'],
    ['think', 'RÉFLÉCHIT'], ['facepalm', 'DÉSESPOIR'], ['money', 'ARGENT'], ['gg', 'GG'], ['focus', 'CONCENTRÉ'], ['coffee', 'CAFÉ'], ['sleep', 'DODO'], ['logo', 'LOGO']];
  const img = (n, x, y, w) => `<image href="/site_src/emoji/${n}.webp" x="${x}" y="${y}" width="${w}" height="${w}"/>`;
  function mascotSheet() {
    let s = `<rect width="1200" height="1600" fill="#1f6fd6"/>`;
    s += `<text x="600" y="78" text-anchor="middle" font-family="Lilita One" font-size="58" fill="#fdfeff" stroke="#0a0d14" stroke-width="9" paint-order="stroke">LA MASCOTTE · L'OFFICIELLE</text>`;
    s += `<text x="600" y="122" text-anchor="middle" font-family="Rubik" font-weight="700" font-size="25" fill="#d6ecff">Telle quelle : ses autocollants, dans l'écran du téléphone de Liam.</text>`;
    const panel = (x, y, w, h) => `<rect x="${x + 5}" y="${y + 9}" width="${w}" height="${h}" rx="22" fill="#0a0d14"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="22" fill="#f1e2d3" stroke="#0a0d14" stroke-width="6"/>`;
    s += panel(30, 150, 560, 930) + panel(610, 150, 560, 930);
    for (let i = 0; i < 4; i++) s += panel(30 + i * 288, 1110, 270, 390);
    // the phone, drawn in the series style ; the sticker inside is the real one
    s += `<g transform="translate(310 586) scale(0.6) translate(-450 -800)"><path d="M 196 110 L 704 110 C 744 110 762 128 762 168 L 762 1432 C 762 1472 744 1490 704 1490 L 196 1490 C 156 1490 138 1472 138 1432 L 138 168 C 138 128 156 110 196 110 Z" fill="#2a2d36" stroke="${INK}" stroke-width="14"/>` +
      `<rect x="162" y="140" width="576" height="1320" rx="36" fill="url(#scr)"/>` + ln('M 400 126 L 500 126', '#4a4f5c', 8) +
      `<rect x="214" y="200" width="472" height="78" rx="39" fill="#ffffff" opacity="0.16"/><text x="450" y="252" text-anchor="middle" font-family="Lilita One" font-size="42" fill="#ffffff">stalak.app</text>` +
      img('hello', 170, 420, 560) + flake(240, 1120, 30, '#d6ecff', 6) + flake(660, 1040, 26, '#d6ecff', 5) + flake(300, 1330, 22, '#8fd3ff', 5) + flake(650, 340, 22, '#8fd3ff', 5) +
      `<g transform="rotate(-12 640 1300)"><rect x="610" y="1270" width="62" height="62" rx="12" fill="#bfe6ff" stroke="${INK}" stroke-width="5"/><path d="M 620 1282 L 646 1282" stroke="#ffffff" stroke-width="7" stroke-linecap="round"/></g>` +
      '</g>';
    s += `<text x="310" y="1062" text-anchor="middle" font-family="Lilita One" font-size="34" fill="#0a0d14">DANS LE TÉLÉPHONE</text>`;
    // its 16 stickers
    STICKERS.forEach(([n, label], i) => {
      const x = 636 + (i % 4) * 128, y = 178 + Math.floor(i / 4) * 214;
      s += img(n, x, y, 120) + `<text x="${x + 60}" y="${y + 150}" text-anchor="middle" font-family="Lilita One" font-size="21" fill="#0a0d14">${label}</text>`;
    });
    s += `<text x="890" y="1062" text-anchor="middle" font-family="Lilita One" font-size="34" fill="#0a0d14">SES 16 AUTOCOLLANTS</text>`;
    // the 4 reactions that match the other characters' expressions
    [['cool', 'FRIME'], ['angry', 'COLÈRE'], ['shock', 'PANIQUE'], ['hype', 'FIERTÉ']].forEach(([n, label], i) => {
      s += img(n, 30 + i * 288 + 15, 1130, 240) + `<text x="${165 + i * 288}" y="1478" text-anchor="middle" font-family="Lilita One" font-size="34" fill="#0a0d14">${label}</text>`;
    });
    return `<defs><linearGradient id="scr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1f6fd6"/><stop offset="1" stop-color="#0e3f8f"/></linearGradient></defs>` + s;
  }

  // ---------------- the sheet ----------------
  function sheet(cid, v) {
    if (cid === 'mascotte') return mascotSheet();
    const K = Object.assign({ id: cid + v }, CAST[cid][v]);
    K.P = { skinS: K.skinS, hairS: K.hairS };
    const title = { nadia: 'NADIA', deuce: 'DEUCE', maya: 'MAYA', bigmo: 'BIG MO', reyes: 'M. REYES', mascotte: 'LA MASCOTTE' }[cid];
    let defs = '', body = '';
    const fit = (r, box, mode, max) => { defs += r.defs; body += `<g data-fit="${box} ${mode}"${max ? ` data-max="${max}"` : ''}><g>${r.svg}</g></g>`; };
    let s = `<rect width="1200" height="1600" fill="#1f6fd6"/>`;
    const T = `${title} · VERSION ${v} : ${K.name}`, fs = Math.min(62, Math.floor(1120 / (0.52 * T.length)));
    s += `<text x="600" y="78" text-anchor="middle" font-family="Lilita One" font-size="${fs}" fill="#fdfeff" stroke="#0a0d14" stroke-width="9" paint-order="stroke">${T}</text>`;
    s += `<text x="600" y="122" text-anchor="middle" font-family="Rubik" font-weight="700" font-size="25" fill="#d6ecff">${K.text}</text>`;
    const panel = (x, y, w, h) => `<rect x="${x + 5}" y="${y + 9}" width="${w}" height="${h}" rx="22" fill="#0a0d14"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="22" fill="#f1e2d3" stroke="#0a0d14" stroke-width="6"/>`;
    s += panel(30, 150, 560, 930) + panel(610, 150, 560, 930);
    for (let i = 0; i < 4; i++) s += panel(30 + i * 288, 1110, 270, 390);
    const hs = K.hs || 1.22;
    let parts = [];
    const HSb = HAIR[K.head.hair] || {}, ftf = `translate(450 ${r1(846 - 124 * hs)}) scale(${hs})`, ptf = `translate(470 ${r1(846 - 124 * hs)}) scale(${hs})`;
    if (HSb.fbehind) HSb.fbehind(K).forEach(p => parts.push(Object.assign({ tf: ftf }, p)));
    K._body = true;
    K.front(K, parts, ftf);
    fit(render(parts, S, K.P), '36 160 548 870', 'bottom', 0.66);
    parts = [];
    if (HSb.pbehind) HSb.pbehind(K).forEach(p => parts.push(Object.assign({ tf: ptf }, p)));
    K.profile(K, parts, ptf);
    K._body = false; K._heads = true;
    fit(render(parts, S, K.P), '616 160 548 870', 'bottom', 0.66);
    ['frime', 'colere', 'panique', 'fierte'].forEach((ex, i) => {
      const p = [];
      headF(K, ex, '', p);
      const r = render(p, S, K.P), tilt = ex === 'fierte' ? -6 : ex === 'colere' ? 4 : 0;
      defs += r.defs;
      body += `<g data-fit="${36 + i * 288} 1118 258 316 center" data-max="0.86"><g><g transform="rotate(${tilt})">${r.svg}</g></g></g>`;
    });
    s += body;
    s += `<text x="310" y="1062" text-anchor="middle" font-family="Lilita One" font-size="34" fill="#0a0d14">DE FACE</text><text x="890" y="1062" text-anchor="middle" font-family="Lilita One" font-size="34" fill="#0a0d14">DE PROFIL</text>`;
    ['FRIME', 'COLÈRE', 'PANIQUE', 'FIERTÉ'].forEach((t, i) => { s += `<text x="${165 + i * 288}" y="1478" text-anchor="middle" font-family="Lilita One" font-size="34" fill="#0a0d14">${t}</text>`; });
    return `<defs>${PAT}<linearGradient id="scr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1f6fd6"/><stop offset="1" stop-color="#0e3f8f"/></linearGradient>${defs}</defs>` + s;
  }

  // for the scenes (frame.js) : one character, full body, front view, with an expression ; returns { defs, svg }
  function figure(cid, v, expr) {
    const K = Object.assign({ id: cid + v + 'x' }, CAST[cid][v]);
    K.P = { skinS: K.skinS, hairS: K.hairS };
    const hs = K.hs || 1.22, HSb = HAIR[K.head.hair] || {}, ftf = `translate(450 ${r1(846 - 124 * hs)}) scale(${hs})`;
    const parts = [];
    if (HSb.fbehind) HSb.fbehind(K).forEach(p => parts.push(Object.assign({ tf: ftf }, p)));
    K._body = true; K._expr = expr;
    K.front(K, parts, ftf);
    const r = render(parts, S, K.P);
    return { defs: PAT + r.defs, svg: r.svg };
  }

  window.CAST = { sheet, figure, CAST, smooth, sym, fluffy, braid, HAIR, BEARD, BEARDP, FACE, HWF, features };
})();
