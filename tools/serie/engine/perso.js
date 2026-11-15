/* Studio Chambre — the characters, drawn in code (Marketing & croissance, 15/11/2026).
   Every character is a function (state, style, id) → an SVG string, in its own coordinates (origin = base of the neck,
   y down). Nothing random: the same state always draws the same picture.
   Styles : A « Sticker givré » (contour épais, aplats + ombre franche, liseré blanc comme les emojis de la mascotte),
            B « Glaçon » (formes taillées comme de la glace, aplats, reflets), C « Papier découpé » (sans contour, bords
            irréguliers, ombres portées). */
(function () {
  const INK = '#0a0d14', SNOW = '#fdfeff';
  const STYLES = {
    A: { sw: 8, shade: true, rim: true, geo: 'round', paper: false },
    B: { sw: 9, shade: false, rim: true, geo: 'facet', paper: false, glint: true },
    C: { sw: 0, shade: true, rim: false, geo: 'round', paper: true },
  };
  const C = {
    skinY: '#b4744a', skinYs: '#935a36', hair: '#16100c',
    beanie: '#8fd3ff', beanieS: '#58b2ef', band: '#4aa3e6', bandS: '#2f86c9',
    hood: '#1d2c57', hoodS: '#142146', hoodL: '#2e4380', string: '#f2f7ff',
    cup: '#eef6ff', cupS: '#b9d8f2', cushion: '#7cc4f5',
    chain: '#cfdbea', cube: '#bfe9ff', cubeS: '#8fd0f3',
    mouth: '#57121e', tongue: '#e8687a', teeth: '#fbfdff', eye: '#fbfdff', pupil: '#1b120c',
    skinM: '#c48356', skinMs: '#a3653d', hairM: '#2a1610', card: '#e9705e', cardS: '#c9543f', top: '#f7f2ea',
    gold: '#f2c14e', lens: '#a9dcff',
    skinB: '#6a3f27', skinBs: '#4f2c1a', beard: '#17100c', fur: '#f4f8ff', furS: '#cfdff0',
  };
  const r1 = (x) => Math.round(x * 10) / 10;
  const lerp = (a, b, k) => a + (b - a) * k;
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

  // ---------- drawing helpers ----------
  function P(d, fill, S, extra = '') {
    const st = S.sw ? ` stroke="${INK}" stroke-width="${S.sw}" stroke-linejoin="round" stroke-linecap="round"` : '';
    return `<path d="${d}" fill="${fill}"${st} ${extra}/>`;
  }
  function line(d, w, color = INK, extra = '') {
    return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
  }
  // flat shape with a hard shade on one side (style A/C), outline on top
  function shaded(id, d, base, shade, S, dx = 16, dy = 10) {
    if (!S.shade) return P(d, base, S);
    return `<clipPath id="${id}"><path d="${d}"/></clipPath><path d="${d}" fill="${shade}"/>` +
      `<g clip-path="url(#${id})"><path d="${d}" fill="${base}" transform="translate(${-dx},${-dy})"/></g>` +
      (S.sw ? `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${S.sw}" stroke-linejoin="round"/>` : '');
  }
  function poly(pts) { return 'M' + pts.map(p => r1(p[0]) + ' ' + r1(p[1])).join(' L') + ' Z'; }
  function mirror(d) { return d.replace(/(-?\d+(\.\d+)?) (-?\d+(\.\d+)?)/g, (m, x, _a, y) => r1(-parseFloat(x)) + ' ' + y); }
  // a 4-point sparkle
  function star(x, y, r, fill = SNOW, sw = 4) {
    const k = r * 0.28;
    return `<path d="M ${x} ${y - r} Q ${x + k} ${y - k} ${x + r} ${y} Q ${x + k} ${y + k} ${x} ${y + r} Q ${x - k} ${y + k} ${x - r} ${y} Q ${x - k} ${y - k} ${x} ${y - r} Z" fill="${fill}" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round"/>`;
  }

  // ---------- face parts (shared by every human character) ----------
  // e = expression state : {eyes:'open'|'wide'|'happy'|'closed'|'half', blink, gaze:[gx,gy], brows:'neutral'|'up'|'angry'|'sad'|'smirk'|'worried',
  //                          mouth:'closed'|'smile'|'frown'|'flat'|'grin'|'O'|'smirk'|'talk', open (0..1), turn (-1..1)}
  function eyes(e, S, o) {
    const geo = S.geo;
    const turn = e.turn || 0, sx = turn * 16;
    const blink = clamp(e.blink || 0, 0, 1);
    let out = '';
    [-1, 1].forEach(side => {
      const cx = side * o.ex + sx, cy = o.ey;
      let rx = o.erx, ry = o.ery;
      const kind = e.eyes || 'open';
      if (kind === 'wide') { rx *= 1.1; ry *= 1.14; }
      if (kind === 'happy') {
        out += line(`M ${cx - rx * 0.8} ${cy + 6} Q ${cx} ${cy - ry * 0.9} ${cx + rx * 0.8} ${cy + 6}`, S.sw ? S.sw + 1 : 9, INK);
        return;
      }
      const closedness = kind === 'closed' ? 1 : blink;
      if (closedness > 0.92) {
        out += line(`M ${cx - rx * 0.85} ${cy} Q ${cx} ${cy + ry * 0.25} ${cx + rx * 0.85} ${cy}`, S.sw ? S.sw + 1 : 9, INK);
        return;
      }
      const shape = geo === 'facet'
        ? `M ${cx - rx} ${cy - ry + 14} Q ${cx - rx} ${cy - ry} ${cx - rx + 14} ${cy - ry} L ${cx + rx - 14} ${cy - ry} Q ${cx + rx} ${cy - ry} ${cx + rx} ${cy - ry + 14} L ${cx + rx} ${cy + ry - 14} Q ${cx + rx} ${cy + ry} ${cx + rx - 14} ${cy + ry} L ${cx - rx + 14} ${cy + ry} Q ${cx - rx} ${cy + ry} ${cx - rx} ${cy + ry - 14} Z`
        : `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`;
      const id = o.id + 'e' + (side < 0 ? 'l' : 'r');
      out += `<clipPath id="${id}"><path d="${shape}"/></clipPath>`;
      out += `<path d="${shape}" fill="${C.eye}"/>`;
      const g = e.gaze || [0, 0];
      const pr = (kind === 'wide' ? o.pr * 0.6 : o.pr);
      const px = cx + g[0] * rx * 0.36 + sx * 0.3, py = cy + g[1] * ry * 0.3 + 4;
      let inner = geo === 'facet'
        ? `<rect x="${px - pr}" y="${py - pr}" width="${pr * 2}" height="${pr * 2}" rx="${pr * 0.35}" fill="${C.pupil}"/><rect x="${px - pr * 0.55}" y="${py - pr * 0.6}" width="${pr * 0.45}" height="${pr * 0.45}" fill="${SNOW}"/>`
        : `<circle cx="${px}" cy="${py}" r="${pr}" fill="${C.pupil}"/><circle cx="${px - pr * 0.36}" cy="${py - pr * 0.4}" r="${pr * 0.34}" fill="${SNOW}"/>`;
      // lids : blink, half-closed (tired), and the skin colour of the face above
      const lid = Math.max(kind === 'half' ? 0.5 : 0, closedness);
      if (lid > 0) {
        const ly = cy - ry + ry * 2 * lid;
        inner += `<path d="M ${cx - rx - 4} ${cy - ry - 4} L ${cx + rx + 4} ${cy - ry - 4} L ${cx + rx + 4} ${ly} Q ${cx} ${ly + 8} ${cx - rx - 4} ${ly} Z" fill="${o.skin}"/>` +
          line(`M ${cx - rx} ${ly} Q ${cx} ${ly + 8} ${cx + rx} ${ly}`, S.sw ? S.sw - 1 : 6, INK);
      }
      out += `<g clip-path="url(#${id})">${inner}</g>`;
      if (S.sw) out += `<path d="${shape}" fill="none" stroke="${INK}" stroke-width="${S.sw}"/>`;
      if (kind === 'half' || e.bags) out += line(`M ${cx - rx * 0.7} ${cy + ry + 10} Q ${cx} ${cy + ry + 20} ${cx + rx * 0.7} ${cy + ry + 10}`, 5, o.skinS);
    });
    return out;
  }
  function brows(e, S, o) {
    const turn = e.turn || 0, sx = turn * 16;
    const k = e.brows || 'neutral';
    const lift = e.browLift || 0;
    let out = '';
    [-1, 1].forEach(side => {
      let ix = side * o.bx0 + sx, ox = side * o.bx1 + sx, iy = o.by, oy = o.by - 4;
      if (k === 'up') { iy -= 18; oy -= 18; }
      if (k === 'angry') { iy += 14; oy -= 8; }
      if (k === 'sad' || k === 'worried') { iy -= 14; oy += 8; }
      if (k === 'smirk' && side > 0) { iy -= 18; oy -= 22; }
      if (k === 'proud') { iy -= 6; oy -= 10; }
      iy -= lift; oy -= lift;
      const d = S.geo === 'facet' ? `M ${ix} ${iy} L ${ox} ${oy}` : `M ${ix} ${iy} Q ${(ix + ox) / 2} ${Math.min(iy, oy) - 8} ${ox} ${oy}`;
      out += line(d, o.bw, o.browColor || INK);
    });
    return out;
  }
  function mouth(e, S, o) {
    const turn = e.turn || 0, x0 = turn * 14, y = o.my;
    const kind = e.mouth || 'closed';
    const open = clamp(e.open || 0, 0, 1);
    const sw = S.sw ? S.sw - 1 : 0;
    const facet = S.geo === 'facet';
    const fillOpen = (d, w, h, id) => {
      // dark inside, tongue at the bottom, teeth at the top when it opens wide
      let s = `<clipPath id="${id}"><path d="${d}"/></clipPath><path d="${d}" fill="${C.mouth}"/>`;
      s += `<g clip-path="url(#${id})"><ellipse cx="${x0}" cy="${y + h * 0.95}" rx="${w * 0.8}" ry="${h * 0.55}" fill="${C.tongue}"/>`;
      if (h > 16) s += `<rect x="${x0 - w}" y="${y - 12}" width="${w * 2}" height="${Math.min(12, h * 0.28) + 8}" fill="${C.teeth}"/>`;
      s += `</g>`;
      if (sw) s += `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round"/>`;
      return s;
    };
    if (kind === 'talk' || (kind === 'closed' && open > 0.04) || (kind === 'smile' && open > 0.04)) {
      if (open <= 0.04) return line(`M ${x0 - 30} ${y - 2} Q ${x0} ${y + 10} ${x0 + 30} ${y - 2}`, sw || 7);
      const w = o.mw * (0.72 + open * 0.38), h = 10 + open * o.mh;
      const d = facet
        ? `M ${x0 - w} ${y - 4} L ${x0 + w} ${y - 4} L ${x0 + w * 0.7} ${y + h} L ${x0 - w * 0.7} ${y + h} Z`
        : `M ${x0 - w} ${y - 4} Q ${x0} ${y - 12} ${x0 + w} ${y - 4} Q ${x0 + w * 0.92} ${y + h} ${x0} ${y + h + 4} Q ${x0 - w * 0.92} ${y + h} ${x0 - w} ${y - 4} Z`;
      return fillOpen(d, w, h, o.id + 'm');
    }
    if (kind === 'grin') {
      const w = o.mw * 1.45, h = o.mh * 0.95;
      const d = facet ? `M ${x0 - w} ${y - 10} L ${x0 + w} ${y - 10} L ${x0 + w * 0.5} ${y + h} L ${x0 - w * 0.5} ${y + h} Z`
        : `M ${x0 - w} ${y - 10} Q ${x0} ${y + 2} ${x0 + w} ${y - 10} Q ${x0 + w * 0.8} ${y + h} ${x0} ${y + h + 4} Q ${x0 - w * 0.8} ${y + h} ${x0 - w} ${y - 10} Z`;
      return fillOpen(d, w, h, o.id + 'm');
    }
    if (kind === 'O') {
      const rx = o.mw * 0.55, ry = o.mh * 0.75;
      const d = `M ${x0 - rx} ${y + 10} A ${rx} ${ry} 0 1 0 ${x0 + rx} ${y + 10} A ${rx} ${ry} 0 1 0 ${x0 - rx} ${y + 10} Z`;
      return fillOpen(d, rx, ry, o.id + 'm');
    }
    if (kind === 'smile') return line(facet ? `M ${x0 - 42} ${y - 8} L ${x0} ${y + 12} L ${x0 + 42} ${y - 8}` : `M ${x0 - 44} ${y - 10} Q ${x0} ${y + 22} ${x0 + 44} ${y - 10}`, sw || 7);
    if (kind === 'frown') return line(`M ${x0 - 30} ${y + 10} Q ${x0} ${y - 8} ${x0 + 30} ${y + 10}`, sw || 7);
    if (kind === 'flat') return line(`M ${x0 - 28} ${y + 2} L ${x0 + 28} ${y + 2}`, sw || 7);
    if (kind === 'smirk') return line(`M ${x0 - 30} ${y + 4} Q ${x0 + 8} ${y + 10} ${x0 + 40} ${y - 14}`, sw || 7);
    if (kind === 'wavy') return line(`M ${x0 - 34} ${y + 2} q 8.5 -8 17 0 t 17 0 t 17 0 t 17 0`, sw || 7);
    return line(`M ${x0 - 30} ${y - 2} Q ${x0} ${y + 10} ${x0 + 30} ${y - 2}`, sw || 7);
  }

  // ---------- arms and hands (rubber hose, shared) ----------
  // ik : shoulder S, target W, lengths, bend (+1/-1) → elbow
  function ik(S, W, L1, L2, bend) {
    const dx = W[0] - S[0], dy = W[1] - S[1];
    let d = Math.hypot(dx, dy);
    const dmax = (L1 + L2) * 0.995, dmin = Math.abs(L1 - L2) + 1;
    const k = clamp(d, dmin, dmax);
    const W2 = [S[0] + dx / (d || 1) * k, S[1] + dy / (d || 1) * k];
    d = k;
    const a = Math.atan2(dy, dx);
    const cosA = clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1);
    const A = Math.acos(cosA) * bend;
    return { E: [S[0] + Math.cos(a + A) * L1, S[1] + Math.sin(a + A) * L1], W: W2 };
  }
  function hand(kind, skin, skinS, S) {
    // drawn pointing down (+y), wrist at (0,0)
    const sw = S.sw ? S.sw - 1 : 0;
    const st = sw ? ` stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"` : '';
    const f = (d, fill = skin) => `<path d="${d}" fill="${fill}"${st}/>`;
    if (S.geo === 'facet') {
      if (kind === 'open') return f('M -30 0 L 30 0 L 34 44 L 22 74 L -22 74 L -34 44 Z') + line('M -14 44 L -14 70 M 0 44 L 0 74 M 14 44 L 14 70', 5);
      if (kind === 'point') return f('M -28 0 L 28 0 L 30 48 L -30 48 Z') + f('M -8 40 L 8 40 L 8 96 L -8 96 Z');
      if (kind === 'thumb') return f('M -28 0 L 28 0 L 30 50 L -30 50 Z') + f('M 22 30 L 44 30 L 44 -14 L 22 -14 Z');
      return f('M -30 0 L 30 0 L 32 52 L -32 52 Z') + line('M -12 30 L -12 50 M 10 30 L 10 50', 5);
    }
    if (kind === 'open') {
      return f('M -30 6 C -36 26 -40 48 -36 60 C -34 70 -26 70 -24 60 L -22 46 L -18 78 C -16 90 -4 90 -4 78 L -4 50 L 0 84 C 2 96 14 96 14 84 L 12 50 L 20 76 C 24 86 34 84 32 72 L 26 40 C 34 46 46 44 46 34 C 46 26 34 22 26 18 C 20 6 8 0 -6 0 C -18 0 -26 2 -30 6 Z');
    }
    if (kind === 'point') {
      return f('M -28 4 C -34 22 -34 44 -24 54 C -14 62 14 62 22 52 C 30 40 30 20 26 6 C 14 -2 -14 -2 -28 4 Z') +
        f('M -10 48 C -12 70 -10 96 -2 104 C 6 110 12 104 12 94 L 10 50 Z') + line('M -18 40 C -10 44 0 44 8 40', 5);
    }
    if (kind === 'thumb') {
      return f('M -28 4 C -34 22 -34 44 -24 54 C -14 62 14 62 22 52 C 30 40 30 20 26 6 C 14 -2 -14 -2 -28 4 Z') +
        f('M 18 22 C 30 16 40 2 40 -16 C 40 -30 26 -30 24 -18 C 22 -6 14 4 8 10 Z') + line('M -18 30 C -8 34 6 34 14 30 M -18 44 C -8 48 6 48 14 44', 5);
    }
    // fist
    return f('M -28 4 C -34 22 -34 46 -22 56 C -12 64 14 64 24 54 C 32 42 32 20 26 6 C 14 -2 -14 -2 -28 4 Z') +
      line('M -18 32 C -8 36 6 36 16 32 M -16 46 C -6 50 6 50 14 46', 5);
  }
  // arm from shoulder S (body coords) to target W ; a.hand kind ; returns svg
  function arm(a, look, S) {
    const r = ik(a.S, a.W, look.L1, look.L2, a.bend || 1);
    const E = r.E, W = r.W;
    const ang = Math.atan2(W[1] - E[1], W[0] - E[0]);
    const deg = ang * 180 / Math.PI - 90;
    const w = look.sleeveW;
    const d = `M ${r1(a.S[0])} ${r1(a.S[1])} L ${r1(E[0])} ${r1(E[1])} L ${r1(W[0])} ${r1(W[1])}`;
    const join = S.geo === 'facet' ? 'miter' : 'round';
    let s = '';
    if (S.sw) s += `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w + S.sw * 2}" stroke-linecap="${join === 'miter' ? 'square' : 'round'}" stroke-linejoin="${join}"/>`;
    s += `<path d="${d}" fill="none" stroke="${look.sleeve}" stroke-width="${w}" stroke-linecap="${join === 'miter' ? 'square' : 'round'}" stroke-linejoin="${join}"/>`;
    if (S.shade && !S.paper) s += `<path d="${d}" fill="none" stroke="${look.sleeveS}" stroke-width="${w * 0.32}" stroke-linecap="round" stroke-linejoin="round" transform="translate(${w * 0.22},${w * 0.12})" opacity="0.9"/>`;
    // cuff + hand, rotated along the forearm ; a prop (the frozen chicken) hangs straight down whatever the arm does
    const hk = a.hand || 'fist';
    s += `<g transform="translate(${r1(W[0])},${r1(W[1])}) rotate(${r1(deg)})">` +
      `<g transform="translate(0,${look.handOff}) ${a.flip ? 'scale(-1,1)' : ''}">${a.prop ? `<g transform="rotate(${r1(a.flip ? deg : -deg)})">${a.prop}</g>` : ''}${hand(hk, look.skin, look.skinS, S)}</g>` +
      `<rect x="${-w * 0.56}" y="${-4}" width="${w * 1.12}" height="${look.cuffH}" rx="${S.geo === 'facet' ? 4 : look.cuffH / 2}" fill="${look.cuff}" ${S.sw ? `stroke="${INK}" stroke-width="${S.sw - 1}"` : ''}/>` +
      `</g>`;
    return s;
  }

  // ---------- Yanis, alias Lil Givre ----------
  const YLOOK = { L1: 178, L2: 168, sleeveW: 76, sleeve: C.hood, sleeveS: C.hoodS, cuff: C.hoodL, cuffH: 30, handOff: 22, skin: C.skinY, skinS: C.skinYs };
  function facePath(S) {
    if (S.geo === 'facet') return poly([[-122, -300], [122, -300], [146, -276], [148, -118], [96, -34], [44, -14], [-44, -14], [-96, -34], [-148, -118], [-146, -276]]);
    return 'M -140 -175 C -143 -255 -80 -300 0 -300 C 80 -300 143 -255 140 -175 C 137 -98 108 -42 56 -22 C 30 -13 -30 -13 -56 -22 C -108 -42 -137 -98 -140 -175 Z';
  }
  function yanisHead(st, S, id) {
    const e = st.face || {};
    const turn = e.turn || 0;
    let s = '';
    // ears (behind the face), one bigger when he turns
    const ear = S.geo === 'facet' ? 'M 140 -200 L 172 -196 L 176 -140 L 142 -128 Z' : 'M 134 -198 C 172 -206 182 -138 138 -126 Z';
    s += `<g transform="translate(${turn * 10},0) scale(${1 - turn * 0.15},1)">${P(ear, C.skinY, S)}${S.sw ? line('M 146 -184 C 160 -180 160 -152 148 -146', 5, C.skinYs) : ''}</g>`;
    s += `<g transform="translate(${turn * 10},0) scale(${1 + turn * 0.15},1)">${P(mirror(ear), C.skinY, S)}${S.sw ? line(mirror('M 146 -184 C 160 -180 160 -152 148 -146'), 5, C.skinYs) : ''}</g>`;
    // curls at the sides, under the beanie
    const curls = S.geo === 'facet'
      ? [poly([[-150, -250], [-126, -262], [-118, -232], [-142, -214]]), poly([[150, -250], [126, -262], [118, -232], [142, -214]])]
      : [[-138, -238, 17], [-150, -214, 14], [-128, -214, 13], [138, -238, 17], [150, -214, 14], [128, -214, 13]].map(([x, y, r]) => `M ${x - r} ${y} A ${r} ${r} 0 1 0 ${x + r} ${y} A ${r} ${r} 0 1 0 ${x - r} ${y} Z`);
    curls.forEach(d => { s += P(d, C.hair, S); });
    // face with a hard shade on the right
    s += shaded(id + 'f', facePath(S), C.skinY, C.skinYs, S, 26, 4);
    // nose
    s += S.geo === 'facet' ? P('M -4 -118 L -16 -92 L 10 -92 Z', C.skinYs, S) : line('M -6 -120 Q -22 -96 -2 -92 Q 12 -92 16 -102', S.sw ? 6 : 7, S.sw ? INK : C.skinYs);
    // eyes, brows, mouth
    const o = { id, ex: 60, ey: -160, erx: S.geo === 'facet' ? 40 : 40, ery: S.geo === 'facet' ? 44 : 47, pr: 19, skin: C.skinY, skinS: C.skinYs, bx0: 24, bx1: 98, by: -224, bw: S.geo === 'facet' ? 15 : 16, my: -62, mw: 34, mh: 40 };
    s += eyes(e, S, o) + mouth(e, S, o);
    if (e.sweat) s += `<path d="M 150 ${-250 + e.sweat * 30} q 12 22 0 30 q -12 -8 0 -30 Z" fill="${C.cube}" stroke="${INK}" stroke-width="4" opacity="${clamp(e.sweat * 2, 0, 1)}"/>`;
    // beanie : dome, ribs, folded band with 3 small icicles, pompom
    const dome = S.geo === 'facet' ? poly([[-150, -282], [-112, -380], [112, -380], [150, -282]]) : 'M -150 -280 C -150 -352 -88 -392 0 -392 C 88 -392 150 -352 150 -280 Z';
    s += shaded(id + 'b', dome, C.beanie, C.beanieS, S, 24, 0);
    if (S.geo !== 'facet') s += line('M -70 -286 Q -78 -340 -44 -382 M 0 -288 L 0 -390 M 70 -286 Q 78 -340 44 -382', 5, C.beanieS);
    const icicles = [[-118, 24], [4, 30], [120, 22]];
    icicles.forEach(([x, l]) => {
      s += S.geo === 'facet' ? P(`M ${x - 11} -240 L ${x + 11} -240 L ${x} ${-240 + l + 8} Z`, C.cube, S) : P(`M ${x - 11} -242 Q ${x - 2} ${-236 + l * 1.5} ${x} ${-238 + l * 1.5} Q ${x + 3} ${-236 + l * 1.5} ${x + 11} -242 Z`, C.cube, S);
    });
    const band = S.geo === 'facet' ? poly([[-162, -282], [162, -282], [164, -238], [-164, -238]]) : 'M -160 -280 C -60 -298 60 -298 160 -280 L 162 -238 C 60 -256 -60 -256 -162 -238 Z';
    s += shaded(id + 'n', band, C.band, C.bandS, S, 0, -10);
    if (S.glint) s += line('M -130 -300 L -90 -350', 7, SNOW) + line('M -120 -268 L -60 -268', 5, SNOW);
    const pom = S.geo === 'facet' ? poly([[0, -440], [20, -420], [34, -412], [22, -394], [24, -372], [0, -380], [-24, -372], [-22, -394], [-34, -412], [-20, -420]])
      : 'M -30 -398 C -42 -414 -26 -440 -8 -432 C 0 -448 26 -444 26 -426 C 44 -422 42 -396 26 -392 C 22 -376 -2 -376 -8 -388 C -26 -380 -40 -390 -30 -398 Z';
    s += P(pom, SNOW, S);
    // headphones on the ears (recording)
    if (st.headphones === 'ears') {
      s += line('M -150 -200 C -170 -330 -90 -420 0 -420 C 90 -420 170 -330 150 -200', 20 + (S.sw ? 2 * S.sw : 0), INK) + line('M -150 -200 C -170 -330 -90 -420 0 -420 C 90 -420 170 -330 150 -200', 20, C.cup);
      [-1, 1].forEach(sd => { s += `<rect x="${sd * 168 - 30}" y="-232" width="60" height="96" rx="26" fill="${C.cup}" ${S.sw ? `stroke="${INK}" stroke-width="${S.sw}"` : ''}/><rect x="${sd * 168 - (sd > 0 ? 30 : -14) - 0}" y="-218" width="16" height="68" rx="8" fill="${C.cushion}"/>`; });
    }
    // brows on top of everything (they may cross the band when raised)
    s += brows(e, S, o);
    return s;
  }
  function pendant(st, S, id) {
    let s = '';
    // chain : small links on a curve
    const pts = [];
    for (let i = 0; i <= 16; i++) {
      const t = i / 16, x = (1 - t) * (1 - t) * -76 + 2 * (1 - t) * t * 0 + t * t * 76, y = (1 - t) * (1 - t) * 34 + 2 * (1 - t) * t * 186 + t * t * 34;
      pts.push([x, y]);
    }
    s += line('M ' + pts.map(p => r1(p[0]) + ' ' + r1(p[1])).join(' L '), 9, INK) + line('M ' + pts.map(p => r1(p[0]) + ' ' + r1(p[1])).join(' L '), 4, C.chain, 'stroke-dasharray="7 5"');
    // the ice cube
    const cube = S.geo === 'facet' ? poly([[-26, 152], [24, 146], [30, 196], [-20, 202]]) : 'M -22 148 Q -28 148 -28 156 L -24 196 Q -24 204 -16 204 L 22 200 Q 30 200 30 192 L 26 152 Q 26 144 18 144 Z';
    s += `<g transform="rotate(${st.cubeRot || 6} 0 176)">${P(cube, C.cube, S)}${line('M -14 160 L -12 186 M -14 160 L 6 158', 5, SNOW)}</g>`;
    if (st.drip) {
      const k = clamp(st.drip, 0, 1), y = 210 + k * 150;
      s += `<path d="M 4 ${y - 14} Q 14 ${y + 4} 4 ${y + 8} Q -6 ${y + 4} 4 ${y - 14} Z" fill="${C.cube}" stroke="${INK}" stroke-width="4" opacity="${k < 0.85 ? 1 : (1 - k) / 0.15}"/>`;
    }
    if (st.sparkle) {
      const k = clamp(st.sparkle, 0, 1);
      s += star(44, 150, 22 * k) + star(-40, 196, 14 * k) + star(30, 222, 10 * k);
    }
    return s;
  }
  // st : {face, arms:{L:{W,hand,bend,front,prop}, R:{...}}, headRot, headDY, breath, headphones:'neck'|'ears', drip, sparkle, cubeRot, squash}
  function yanis(st, styleKey, id) {
    const S = STYLES[styleKey || 'A'];
    let s = '';
    const neck = S.geo === 'facet' ? poly([[-42, -40], [42, -40], [46, 30], [-46, 30]]) : 'M -42 -44 L -46 32 L 46 32 L 42 -44 Z';
    const torso = S.geo === 'facet' ? poly([[-92, 6], [-214, 52], [-238, 600], [238, 600], [214, 52], [92, 6]]) : 'M -96 6 C -150 14 -206 36 -218 104 L -234 600 L 234 600 L 218 104 C 206 36 150 14 96 6 Z';
    const arms = st.arms || {};
    const armSvg = (side) => {
      const a = arms[side]; if (!a) return '';
      const Sx = side === 'L' ? -192 : 192;
      return arm({ S: [Sx, 92], W: a.W, hand: a.hand, bend: a.bend != null ? a.bend : (side === 'L' ? -1 : 1), prop: a.prop, flip: side === 'L' }, YLOOK, S);
    };
    // behind : arms that go behind the body, headphone band
    ['L', 'R'].forEach(sd => { if (arms[sd] && arms[sd].front === false) s += armSvg(sd); });
    if (st.headphones !== 'ears') s += line('M -96 70 C -110 0 -70 -40 0 -40 C 70 -40 110 0 96 70', 20 + (S.sw ? 2 * S.sw : 0), INK) + line('M -96 70 C -110 0 -70 -40 0 -40 C 70 -40 110 0 96 70', 20, C.cup);
    s += shaded(id + 't', torso, C.hood, C.hoodS, S, 40, 0);
    s += P(S.geo === 'facet' ? poly([[-118, 30], [-90, -6], [90, -6], [118, 30]]) : 'M -118 30 C -110 -14 110 -14 118 30 Z', C.hoodS, S);
    s += P(neck, C.skinYs, S);
    if (S.glint) s += line('M -170 140 L -120 90', 9, '#3f5aa8') + line('M -180 220 L -150 190', 7, '#3f5aa8');
    // pocket and drawstrings
    s += line('M -126 430 L 126 430 L 150 600 M -126 430 L -150 600', S.sw ? 6 : 5, S.sw ? INK : C.hoodS);
    // the hood, rolled around the neck, in front of it
    const collar = S.geo === 'facet' ? poly([[-138, 14], [-74, 22], [0, 40], [74, 22], [138, 14], [118, 62], [0, 84], [-118, 62]])
      : 'M -138 16 C -110 34 -60 40 0 44 C 60 40 110 34 138 16 C 136 56 100 84 0 88 C -100 84 -136 56 -138 16 Z';
    s += P(collar, C.hoodL, S);
    ['M -34 50 C -40 100 -30 150 -36 200', 'M 34 50 C 40 100 30 150 36 200'].forEach(d => { s += (S.sw ? line(d, 13, INK) : '') + line(d, 7, C.string); });
    // headphones around the neck
    if (st.headphones !== 'ears') {
      [-1, 1].forEach(sd => {
        s += `<g transform="translate(${sd * 104},${96}) rotate(${sd * -28})"><rect x="-34" y="-44" width="68" height="88" rx="${S.geo === 'facet' ? 10 : 30}" fill="${C.cup}" ${S.sw ? `stroke="${INK}" stroke-width="${S.sw}"` : ''}/>` +
          `<rect x="${sd > 0 ? -34 : 12}" y="-30" width="22" height="60" rx="10" fill="${C.cushion}" ${S.sw ? `stroke="${INK}" stroke-width="5"` : ''}/>` +
          `<circle cx="${sd > 0 ? 8 : -8}" cy="0" r="9" fill="${C.cushion}"/></g>`;
      });
    }
    s += pendant(st, S, id);
    // the head, on its neck pivot
    const hr = st.headRot || 0, hdy = st.headDY || 0;
    s += `<g transform="translate(0,${r1(-10 + hdy)}) rotate(${r1(hr)})">${yanisHead(st, S, id)}</g>`;
    ['L', 'R'].forEach(sd => { if (arms[sd] && arms[sd].front !== false) s += armSvg(sd); });
    return wrap(s, st, S, id);
  }
  // breathing / squash, the white sticker rim, paper look
  function wrap(s, st, S, id) {
    const sq = st.squash || 0, br = st.breath || 0;
    const sy = 1 + sq + br * 0.01, sx = 1 - sq * 0.6;
    let filt = '';
    if (S.rim) filt = `filter="url(#rim)"`;
    if (S.paper) filt = `filter="url(#paper)"`;
    return `<g ${filt}><g transform="translate(0,600) scale(${r1(sx * 1000) / 1000},${r1(sy * 1000) / 1000}) translate(0,-600)">${s}</g></g>`;
  }

  // ---------- Maman ----------
  const MLOOK = { L1: 168, L2: 158, sleeveW: 70, sleeve: C.card, sleeveS: C.cardS, cuff: '#f39a86', cuffH: 26, handOff: 20, skin: C.skinM, skinS: C.skinMs };
  function maman(st, styleKey, id) {
    const S = STYLES[styleKey || 'A'];
    const e = st.face || {};
    let s = '';
    const arms = st.arms || {};
    const armSvg = (side) => { const a = arms[side]; if (!a) return ''; const Sx = side === 'L' ? -176 : 176; return arm({ S: [Sx, 86], W: a.W, hand: a.hand, bend: a.bend != null ? a.bend : (side === 'L' ? -1 : 1), prop: a.prop, flip: side === 'L' }, MLOOK, S); };
    ['L', 'R'].forEach(sd => { if (arms[sd] && arms[sd].front === false) s += armSvg(sd); });
    // big curly bun behind the head
    let h = '';
    [[0, -350, 66], [-62, -320, 46], [62, -320, 46], [-30, -400, 44], [34, -398, 46], [0, -440, 40]].forEach(([x, y, r]) => { h += P(`M ${x - r} ${y} A ${r} ${r} 0 1 0 ${x + r} ${y} A ${r} ${r} 0 1 0 ${x - r} ${y} Z`, C.hairM, S); });
    h += P('M -40 -300 C -20 -316 20 -316 40 -300 L 34 -282 C 14 -292 -14 -292 -34 -282 Z', C.card, S); // scrunchie
    // ears + hoops
    [-1, 1].forEach(sd => {
      h += P(sd > 0 ? 'M 126 -190 C 160 -198 168 -136 130 -126 Z' : mirror('M 126 -190 C 160 -198 168 -136 130 -126 Z'), C.skinM, S);
      h += `<circle cx="${sd * 146}" cy="-108" r="16" fill="none" stroke="${INK}" stroke-width="10"/><circle cx="${sd * 146}" cy="-108" r="16" fill="none" stroke="${C.gold}" stroke-width="5"/>`;
    });
    const face = 'M -130 -180 C -134 -262 -74 -296 0 -296 C 74 -296 134 -262 130 -180 C 128 -100 96 -40 50 -24 C 26 -16 -26 -16 -50 -24 C -96 -40 -128 -100 -130 -180 Z';
    h += shaded(id + 'f', face, C.skinM, C.skinMs, S, 24, 4);
    // hair front : a soft wave over the forehead
    h += P('M -132 -190 C -150 -270 -90 -316 0 -312 C 90 -316 150 -270 132 -190 C 120 -236 90 -262 40 -264 C 10 -246 -40 -244 -70 -262 C -100 -252 -124 -226 -132 -190 Z', C.hairM, S);
    h += line('M -4 -126 Q -18 -102 0 -98 Q 12 -98 14 -108', S.sw ? 6 : 7, S.sw ? INK : C.skinMs);
    const o = { id, ex: 54, ey: -166, erx: 33, ery: 38, pr: 15, skin: C.skinM, skinS: C.skinMs, bx0: 22, bx1: 86, by: -222, bw: 13, my: -66, mw: 30, mh: 40 };
    h += eyes(e, S, o);
    // glasses (round) or sunglasses
    if (st.sunglasses) {
      [-1, 1].forEach(sd => { h += `<path d="M ${sd * 54 - 46} -186 L ${sd * 54 + 46} -186 L ${sd * 54 + 40} -146 Q ${sd * 54} -132 ${sd * 54 - 40} -146 Z" fill="${INK}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>` + line(`M ${sd * 54 - 26} -176 L ${sd * 54 - 10} -176`, 5, '#6c84b8'); });
      h += line('M -8 -178 L 8 -178', 7, INK);
    } else {
      [-1, 1].forEach(sd => { h += `<circle cx="${sd * 54}" cy="-166" r="46" fill="${C.lens}" fill-opacity="0.22" stroke="${INK}" stroke-width="7"/>`; });
      h += line('M -8 -170 Q 0 -178 8 -170', 6, INK);
    }
    h += mouth(e, S, o) + brows(e, S, o);
    // cardigan over a white top
    const torso = 'M -88 8 C -140 16 -192 38 -204 104 L -220 600 L 220 600 L 204 104 C 192 38 140 16 88 8 Z';
    s += P('M -40 -44 L -44 30 L 44 30 L 40 -44 Z', C.skinMs, S);
    s += shaded(id + 't', torso, C.card, C.cardS, S, 36, 0);
    s += P('M -86 8 L 0 170 L 86 8 Z', C.top, S);
    s += line('M -10 230 L -10 600', S.sw ? 6 : 5, S.sw ? INK : C.cardS);
    [270, 360, 450].forEach(y => { s += `<circle cx="-30" cy="${y}" r="9" fill="${C.top}" ${S.sw ? `stroke="${INK}" stroke-width="5"` : ''}/>`; });
    const hr = st.headRot || 0, hdy = st.headDY || 0;
    s += `<g transform="translate(0,${r1(-8 + hdy)}) rotate(${r1(hr)})">${h}</g>`;
    ['L', 'R'].forEach(sd => { if (arms[sd] && arms[sd].front !== false) s += armSvg(sd); });
    return wrap(s, st, S, id);
  }
  // the frozen chicken, held in a hand (hand coords : the hand points down from the wrist)
  function chicken(S) {
    const sw = S.sw || 0;
    const st = sw ? ` stroke="${INK}" stroke-width="${sw}" stroke-linejoin="round"` : '';
    // (0,0) = the knot of the bag, in the hand ; the frozen bird hangs below it
    return `<g transform="translate(0,6)">` +
      `<path d="M -12 -14 C -20 -26 -6 -34 0 -22 C 6 -34 20 -26 12 -14 L 10 24 L -10 24 Z" fill="#cfe9ff"${st}/>` +
      `<path d="M -16 24 C -110 40 -130 140 -100 200 C -70 256 70 256 100 200 C 130 140 110 40 16 24 Z" fill="#f0cf9c"${st}/>` +
      `<path d="M -16 24 C -110 40 -130 140 -100 200 C -70 256 70 256 100 200 C 130 140 110 40 16 24 Z" fill="#d6ecff" fill-opacity="0.45"/>` +
      `<path d="M -84 70 C -70 60 -56 62 -50 72 M 40 60 C 54 52 70 58 72 70 M -60 214 C -48 204 -32 206 -28 216 M 54 196 C 64 188 80 192 80 204" fill="none" stroke="${SNOW}" stroke-width="9" stroke-linecap="round"/>` +
      `<rect x="-62" y="112" width="124" height="54" rx="8" fill="${SNOW}"${st}/>` +
      `<text x="0" y="150" text-anchor="middle" font-family="Lilita One, Rubik, sans-serif" font-size="34" fill="${INK}">POULET</text>` +
      star(-72, 102, 14) + star(84, 132, 11) + star(16, 226, 9) + `</g>`;
  }

  // ---------- Big Banquise (profile picture) ----------
  function banquise(st, id) {
    const S = STYLES.A;
    let s = `<clipPath id="${id}c"><circle cx="0" cy="0" r="150"/></clipPath><g clip-path="url(#${id}c)">`;
    s += `<rect x="-160" y="-160" width="320" height="320" fill="#9fd2ff"/>`;
    [[-110, -110, 6], [90, -120, 5], [120, -60, 4], [-130, -40, 5]].forEach(([x, y, r]) => { s += `<circle cx="${x}" cy="${y}" r="${r}" fill="${SNOW}"/>`; });
    // fur coat
    s += P('M -170 170 C -170 60 -120 40 -80 50 C -60 20 -20 30 0 40 C 20 30 60 20 80 50 C 120 40 170 60 170 170 Z', C.fur, S);
    s += line('M -120 90 Q -110 70 -96 80 M 100 90 Q 112 70 126 82 M -40 70 Q -28 54 -14 66 M 30 70 Q 44 56 58 68', 5, C.furS);
    // head, beard, sunglasses
    s += shaded(id + 'f', 'M -86 -40 C -92 -120 -50 -150 0 -150 C 50 -150 92 -120 86 -40 C 84 10 50 46 0 48 C -50 46 -84 10 -86 -40 Z', C.skinB, C.skinBs, S, 18, 2);
    s += P('M -78 -20 C -70 30 -36 62 0 64 C 36 62 70 30 78 -20 C 62 6 40 18 22 14 C 10 30 -10 30 -22 14 C -40 18 -62 6 -78 -20 Z', C.beard, S);
    s += P('M -34 -6 C -20 -16 20 -16 34 -6 C 20 2 -20 2 -34 -6 Z', C.beard, S);
    s += P('M -88 -96 C -80 -150 -40 -168 0 -166 C 40 -168 80 -150 88 -96 C 60 -120 -60 -120 -88 -96 Z', C.beard, S);
    s += `<path d="M -80 -84 L -8 -84 L -14 -48 Q -44 -36 -72 -50 Z M 80 -84 L 8 -84 L 14 -48 Q 44 -36 72 -50 Z" fill="${INK}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>` + line('M -60 -74 L -40 -74 M 30 -74 L 50 -74', 5, '#7f97c8');
    s += line('M -20 4 Q 0 14 20 4', 6, '#3a2418');
    // the big « ice » chain
    s += line('M -90 120 Q 0 190 90 120', 14, INK) + line('M -90 120 Q 0 190 90 120', 7, '#e8f4ff');
    s += star(0, 158, 30, '#e8f4ff', 5) + star(-50, 140, 14, '#e8f4ff', 4) + star(52, 140, 14, '#e8f4ff', 4);
    s += `</g><circle cx="0" cy="0" r="150" fill="none" stroke="${INK}" stroke-width="10"/>`;
    return s;
  }

  // the SVG <defs> every scene needs (rim, paper)
  const DEFS = `<filter id="rim" x="-15%" y="-15%" width="130%" height="130%" color-interpolation-filters="sRGB">` +
    `<feMorphology in="SourceAlpha" operator="dilate" radius="9" result="d"/><feFlood flood-color="${SNOW}"/>` +
    `<feComposite in2="d" operator="in" result="w"/><feMerge><feMergeNode in="w"/><feMergeNode in="SourceGraphic"/></feMerge></filter>` +
    `<filter id="paper" x="-15%" y="-15%" width="130%" height="130%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" result="n"/>` +
    `<feDisplacementMap in="SourceGraphic" in2="n" scale="9" xChannelSelector="R" yChannelSelector="G" result="w"/>` +
    `<feDropShadow in="w" dx="5" dy="8" stdDeviation="3" flood-color="${INK}" flood-opacity="0.35"/></filter>` +
    `<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="3"/><feColorMatrix values="0 0 0 0 0.04  0 0 0 0 0.05  0 0 0 0 0.08  0 0 0 0.10 0"/></filter>`;

  window.PERSO = { INK, SNOW, C, STYLES, yanis, maman, banquise, chicken, star, line, P, poly, hand, DEFS };
})();
