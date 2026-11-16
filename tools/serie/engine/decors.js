/* Série « T-Crazy » — the sets, drawn in code in the chosen style (Style 1 « Anime US ») : 1080 × 1920 (9:16), empty,
   ready for the characters. Each set : 2 versions ; Liam's room-studio by day and by night.
   No real brand, logo or shop name : every sign is invented. (Marketing & croissance, 16/11/2026) */
(function () {
  const { STY, room } = TCRAZY;
  const S = STY[1], P = S.pal, INK = S.ink, LW = 3.4;
  let DEFS = [], GID = 0;

  // ---------------- helpers ----------------
  const f = (d, fill, w = LW, extra = '') => `<path d="${d}" fill="${fill}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"${extra}/>`;
  const nf = (d, fill, op = 1, extra = '') => `<path d="${d}" fill="${fill}"${op < 1 ? ` opacity="${op}"` : ''}${extra}/>`;
  const ln = (d, c = INK, w = LW, extra = '') => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"${extra}/>`;
  const R = (x, y, w, h) => `M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + h} L ${x} ${y + h} Z`;
  const rr = (x, y, w, h, r, fill, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${INK}" stroke-width="${LW}"${extra}/>`;
  const txt = (x, y, t, size, fill, o = {}) => `<text x="${x}" y="${y}" text-anchor="${o.anchor || 'middle'}" font-family="${o.font || 'Lilita One'}"${o.weight ? ` font-weight="${o.weight}"` : ''} font-size="${size}" fill="${fill}"${o.stroke ? ` stroke="${o.stroke}" stroke-width="${o.sw || 6}" paint-order="stroke"` : ''}${o.rot ? ` transform="rotate(${o.rot} ${x} ${y})"` : ''}${o.op ? ` opacity="${o.op}"` : ''}>${t}</text>`;
  function grad(stops, vertical = true) {
    const id = 'g' + (++GID);
    DEFS.push(`<linearGradient id="${id}" x1="0" y1="0" x2="${vertical ? 0 : 1}" y2="${vertical ? 1 : 0}">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a !== undefined ? ` stop-opacity="${a}"` : ''}/>`).join('')}</linearGradient>`);
    return `url(#${id})`;
  }
  // a soft light : radial glow, screen-blended
  function glow(cx, cy, rx, ry, color, op = 0.8) {
    const id = 'r' + (++GID);
    DEFS.push(`<radialGradient id="${id}"><stop offset="0" stop-color="${color}" stop-opacity="${op}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`);
    return `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${id})" style="mix-blend-mode:screen"/>`;
  }
  const night = (op = 0.42) => `<rect x="-40" y="-40" width="1160" height="2000" fill="#0b1235" opacity="${op}" style="mix-blend-mode:multiply"/>`;
  const warm = () => `<rect x="-40" y="-40" width="1160" height="2000" fill="#ff9d4d" opacity="0.06"/>`;
  const stars = (n, x0, y0, w, h, seed = 3) => { let s = '', a = seed; for (let i = 0; i < n; i++) { a = (a * 9301 + 49297) % 233280; const x = x0 + (a / 233280) * w; a = (a * 9301 + 49297) % 233280; const y = y0 + (a / 233280) * h; s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${i % 3 ? 2.2 : 3.4}" fill="#ffffff" opacity="0.9"/>`; } return s; };
  const snowflake = (x, y, r, c, w = 4) => { let d = ''; for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 - Math.PI / 2, ux = Math.cos(a), uy = Math.sin(a); d += `M ${x} ${y} L ${(x + ux * r).toFixed(1)} ${(y + uy * r).toFixed(1)} `; } return ln(d, c, w); };
  // a poster of an invented rapper (no text, no logo)
  function poster(x, y, w, h, rot, a, b, gold) {
    return `<g transform="rotate(${rot} ${x + w / 2} ${y + h / 2})">${f(R(x, y, w, h), a)}` +
      `<path d="M ${x + w * 0.2} ${y + h} C ${x + w * 0.22} ${y + h * 0.68} ${x + w * 0.78} ${y + h * 0.68} ${x + w * 0.8} ${y + h} Z" fill="${b}"/><circle cx="${x + w / 2}" cy="${y + h * 0.45}" r="${w * 0.2}" fill="${b}"/>` +
      ln(`M ${x + w * 0.36} ${y + h * 0.78} q ${w * 0.14} ${h * 0.08} ${w * 0.28} 0`, gold, LW) +
      `<rect x="${x - 10}" y="${y - 8}" width="40" height="16" fill="${P.tape}" opacity="0.9" transform="rotate(-30 ${x} ${y})"/><rect x="${x + w - 30}" y="${y - 8}" width="40" height="16" fill="${P.tape}" opacity="0.9" transform="rotate(30 ${x + w} ${y})"/></g>`;
  }
  // a laptop with an invented recording app (two waveforms, a red dot)
  function laptop(x, y, w, screen, wave) {
    const h = w * 0.72;
    let s = f(`M ${x + 14} ${y + h + 4} L ${x + w - 14} ${y + h + 4} L ${x + w + 8} ${y + h + 26} L ${x - 8} ${y + h + 26} Z`, P.lap) + rr(x, y, w, h, 8, P.lap) + `<rect x="${x + 12}" y="${y + 12}" width="${w - 24}" height="${h - 24}" fill="${screen}"/>`;
    for (let lane = 0; lane < 2; lane++) { let d = ''; for (let i = 0; i < 24; i++) { const xx = x + 22 + i * (w - 44) / 24, a = 5 + Math.abs(Math.sin(i * 1.7 + lane * 2)) * h * 0.1; d += `M ${xx.toFixed(1)} ${(y + h * 0.36 + lane * h * 0.3 - a).toFixed(1)} L ${xx.toFixed(1)} ${(y + h * 0.36 + lane * h * 0.3 + a).toFixed(1)} `; } s += ln(d, wave, 4); }
    return s + `<circle cx="${x + w / 2}" cy="${y + h - 26}" r="8" fill="#e5484d"/>`;
  }
  function micStand(x, yTop, yFloor, pop = true) {
    let s = ln(`M ${x - 20} ${yFloor} L ${x} ${yFloor - 90} L ${x + 22} ${yFloor} M ${x} ${yFloor - 90} L ${x + 2} ${yFloor} M ${x} ${yFloor - 90} L ${x + 8} ${yTop + 60}`, P.metal, LW * 1.6) + ln(`M ${x + 8} ${yTop + 64} L ${x - 50} ${yTop - 20}`, P.metal, LW * 1.4);
    s += `<rect x="${x - 76}" y="${yTop - 74}" width="38" height="72" rx="17" fill="${P.metal}" stroke="${INK}" stroke-width="${LW}" transform="rotate(-18 ${x - 57} ${yTop - 38})"/>`;
    if (pop) s += `<circle cx="${x - 100}" cy="${yTop - 18}" r="40" fill="${P.screen}" fill-opacity="0.32" stroke="${INK}" stroke-width="${LW}"/>` + ln(`M ${x - 122} ${yTop - 44} L ${x - 80} ${yTop + 6} M ${x - 134} ${yTop - 18} L ${x - 88} ${yTop + 18} M ${x - 110} ${yTop - 54} L ${x - 66} ${yTop - 8}`, P.metal, 2);
    return s;
  }
  // a window with its frame ; inside : a sky (day or night) and a skyline
  function windowSky(x, y, w, h, t, o = {}) {
    let s = rr(x, y, w, h, 10, o.frame || P.base);
    const ix = x + 22, iy = y + 22, iw = w - 44, ih = h - 44;
    const sky = t === 'nuit' ? grad([[0, '#0c1636'], [1, '#2b3270']]) : grad([[0, P.sky1], [1, P.sky2]]);
    s += `<rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" fill="${sky}" stroke="${INK}" stroke-width="${LW}"/>`;
    if (t === 'nuit') s += stars(14, ix + 8, iy + 8, iw - 16, ih * 0.5) + `<circle cx="${ix + iw * 0.7}" cy="${iy + ih * 0.28}" r="${iw * 0.11}" fill="#eef3ff"/><circle cx="${ix + iw * 0.7 + iw * 0.05}" cy="${iy + ih * 0.28 - iw * 0.03}" r="${iw * 0.1}" fill="#2b3270"/>`;
    else s += `<circle cx="${ix + iw * 0.6}" cy="${iy + ih * 0.66}" r="${iw * 0.18}" fill="#fff4cf" opacity="0.9"/>`;
    // skyline
    const base = iy + ih, cs = t === 'nuit' ? '#151a36' : P.city;
    let d = `M ${ix} ${base}`, xx = ix, k = 0;
    while (xx < ix + iw) { const bw = 30 + (k * 37) % 40, bh = 50 + (k * 53) % 110; d += ` L ${xx} ${base - bh} L ${Math.min(ix + iw, xx + bw)} ${base - bh}`; xx += bw; k++; }
    d += ` L ${ix + iw} ${base} Z`;
    s += nf(d, cs);
    if (t === 'nuit') { let w2 = ''; for (let i = 0; i < 18; i++) w2 += `<rect x="${ix + 10 + (i * 47) % (iw - 24)}" y="${base - 20 - (i * 29) % 90}" width="8" height="10" fill="#ffd36b"/>`; s += w2; }
    if (o.cross !== false) s += ln(`M ${ix + iw / 2} ${iy} L ${ix + iw / 2} ${iy + ih} M ${ix} ${iy + ih / 2} L ${ix + iw} ${iy + ih / 2}`, INK, LW * 2.2) + ln(`M ${ix + iw / 2} ${iy} L ${ix + iw / 2} ${iy + ih} M ${ix} ${iy + ih / 2} L ${ix + iw} ${iy + ih / 2}`, o.frame || P.base, LW * 0.9);
    return s;
  }
  // blankets hanging (a vocal booth in a closet)
  function quilt(x, y, w, h, c, cs, rot = 0) {
    let s = `<g transform="rotate(${rot} ${x + w / 2} ${y})">` + f(`M ${x} ${y} L ${x + w} ${y} C ${x + w + 8} ${y + h * 0.5} ${x + w - 6} ${y + h * 0.8} ${x + w + 4} ${y + h} L ${x} ${y + h} C ${x - 6} ${y + h * 0.7} ${x + 6} ${y + h * 0.4} ${x} ${y} Z`, c);
    for (let i = 1; i < 4; i++) s += ln(`M ${x + 6} ${y + i * h / 4} q ${w / 2} 12 ${w - 12} 0`, cs, 4);
    for (let i = 1; i < 3; i++) s += ln(`M ${x + i * w / 3} ${y + 8} q -8 ${h / 2} 0 ${h - 16}`, cs, 4);
    return s + '</g>';
  }

  // ---------------- 1. Liam's room-studio ----------------
  const NIGHT_PAL = Object.assign({}, P, { wall: '#4f5380', wallS: '#3a3d63', light: '#9fc4ff', floor: '#4a4262', floorS: '#372f4c', base: '#8186b2', sky1: '#0c1636', sky2: '#27306a', city: '#141a36',
    sun: 'none', p1: '#8a4a5a', p1b: '#3a2228', p2: '#2c4470', p2b: '#141f38', mat: '#b9bcd6', matS: '#9295b4', blanket: '#5f77a6', blanketS: '#4a5f8a', desk: '#4e3a46', deskS: '#3a2a34', foam: '#3a3b4c', foamS: '#2b2c3a', tape: '#c9d0e6', frost: '#dfe9ff', gold: '#c9a23a' });
  function chambre1(t) {
    if (t !== 'nuit') return room(S, P) + warm() + nf('M 720 300 L 1080 300 L 1080 1920 L 420 1920 Z', '#ffd39a', 0.10);
    let s = room(S, NIGHT_PAL);
    // the sun becomes the moon, the city lights up
    s += `<circle cx="930" cy="420" r="34" fill="#eef3ff"/><circle cx="944" cy="410" r="30" fill="#121b44"/>` + stars(12, 720, 320, 270, 300, 7);
    for (let i = 0; i < 14; i++) s += `<rect x="${722 + (i * 41) % 260}" y="${760 + (i * 23) % 80}" width="9" height="12" fill="#ffd36b"/>`;
    s += night(0.4);
    // the ice-blue neon, the laptop screen, the moonlight
    s += glow(370, 226, 420, 150, '#8fd3ff', 0.85) + glow(892, 1126, 230, 190, '#57adff', 0.7) + glow(855, 585, 260, 330, '#9fc4ff', 0.35);
    s += `<rect x="80" y="218" width="580" height="14" rx="7" fill="#e9f8ff"/>` + nf('M 714 870 L 996 870 L 1080 1520 L 560 1520 Z', '#9fc4ff', 0.10);
    return s;
  }
  // version 2 : the closet turned into a vocal booth, the bed under the window, a LED strip
  function chambre2(t) {
    const N = t === 'nuit', C = N ? NIGHT_PAL : P;
    const wall = N ? '#4b4f7a' : '#cfae90', wallS = N ? '#383b60' : '#ad8b70';
    let s = `<rect x="-40" y="-40" width="1160" height="2000" fill="${wall}"/>` + nf('M -40 -40 L 180 -40 L 60 1500 L -40 1500 Z', wallS);
    if (!N) s += nf('M 640 300 L 1080 300 L 1080 1500 L 300 1500 Z', P.light, 0.36);
    // ceiling line and the LED strip
    s += f(R(-40, 96, 1160, 18), C.base) + `<rect x="0" y="118" width="1080" height="10" rx="5" fill="${N ? '#bfeaff' : '#e9f4ff'}" stroke="${INK}" stroke-width="2.4"/>`;
    // the closet, doors open, blankets hung inside, the mic
    s += f(R(40, 360, 400, 1140), N ? '#3a3552' : '#8b6a52') + f(R(66, 386, 348, 1114), N ? '#24203a' : '#5a4436');
    s += quilt(82, 400, 150, 620, N ? '#3e5a8a' : '#6f93c8', N ? '#2c4268' : '#4f74a8', -2) + quilt(236, 404, 160, 640, N ? '#5a5f78' : '#9aa1b2', N ? '#41465c' : '#7b8293', 2);
    s += f(R(84, 1060, 312, 440), N ? '#2c2a40' : '#6b5442') + ln('M 90 1200 L 390 1200 M 90 1340 L 390 1340', N ? '#1c1a2c' : '#4a3a2e', 5);
    s += micStand(270, 830, 1480);
    s += f('M 440 360 L 520 380 L 520 1480 L 440 1500 Z', N ? '#4a4566' : '#a07c5e') + `<g transform="rotate(4 482 560)">${f(R(452, 520, 60, 80), '#f4f1ea')}${txt(482, 568, 'STUDIO', 15, '#c8443a')}</g>`;
    // no poster on this wall (owner, 16/11 : « pas de poster »)
    // the window with blinds, the bed under it
    s += windowSky(700, 330, 330, 470, t, { cross: false });
    for (let i = 0; i < 6; i++) s += f(R(722, 352 + i * 26, 286, 16), N ? '#8a8fb8' : '#f1e6d6', 2.4);
    s += ln('M 1000 352 L 1000 520', INK, 2.4);
    s += f('M 600 1290 L 1080 1290 L 1080 1560 L 600 1560 Z', N ? '#4e4466' : '#8c6a57') + f('M 620 1250 L 1080 1250 L 1080 1330 L 620 1330 Z', C.mat);
    s += f('M 640 1236 C 700 1200 780 1230 820 1214 C 900 1236 980 1210 1080 1230 L 1080 1340 C 980 1356 760 1350 640 1330 Z', N ? '#5f77a6' : '#8fd3ff') + ln('M 700 1270 q 40 16 80 4 M 860 1262 q 50 18 100 6', N ? '#4a5f8a' : '#5fb3ea', 5);
    s += f('M 960 1196 C 960 1176 1040 1170 1066 1184 C 1076 1206 1060 1226 1030 1228 C 990 1230 962 1220 960 1196 Z', '#ffffff');
    // the desk, the laptop and an old second screen, the lamp, the shoe boxes
    s += f(R(500, 1130, 300, 30), C.desk) + f(R(516, 1160, 20, 340), C.deskS) + f(R(764, 1160, 20, 340), C.deskS);
    s += laptop(520, 1010, 150, C.screen, C.wave) + rr(680, 990, 110, 90, 6, '#2a2d36') + `<rect x="690" y="1000" width="90" height="70" fill="${N ? '#2b5d9a' : '#3c6fa8'}"/>` + f(R(726, 1080, 18, 50), '#2a2d36');
    s += ln('M 530 1130 L 560 1060 L 540 1030', P.metal, LW * 1.4) + f('M 520 1020 L 566 1010 L 572 1040 L 530 1046 Z', '#e8873a');
    [[878, 1420, '#e8873a'], [890, 1360, '#f4f1ea'], [870, 1300, '#2a2d36']].forEach(([x, y, c]) => { s += f(R(x, y, 150, 60), c) + f(R(x - 4, y - 10, 158, 16), c === '#2a2d36' ? '#e86a52' : '#f4f1ea'); });
    // floor
    s += f(R(-40, 1500, 1160, 460), N ? '#4a4262' : '#9a7356') + nf('M -40 1500 L 300 1500 L 160 1960 L -40 1960 Z', N ? '#372f4c' : '#7c5a44');
    s += ln('M -40 1600 L 1120 1600 M -40 1730 L 1120 1730 M -40 1860 L 1120 1860 M 200 1500 L 180 1600 M 520 1600 L 500 1730 M 820 1500 L 800 1600 M 300 1730 L 280 1860 M 700 1730 L 680 1860', N ? '#372f4c' : '#7c5a44', 4);
    s += f(R(-40, 1486, 1160, 20), C.base);
    if (N) s += night(0.38) + glow(540, 120, 640, 120, '#8fd3ff', 0.9) + glow(600, 1080, 200, 140, '#57adff', 0.6) + glow(865, 560, 220, 300, '#9fc4ff', 0.3) + `<rect x="0" y="118" width="1080" height="10" rx="5" fill="#e9f8ff"/>`;
    else s += warm() + nf('M 700 800 L 1030 800 L 1080 1500 L 520 1500 Z', '#ffd39a', 0.16);
    return s;
  }

  // ---------------- more helpers : sky, clouds, wires, patterns, perspective ----------------
  const sky = (stops, h = 1920) => `<rect x="-40" y="-40" width="1160" height="${h + 40}" fill="${grad(stops)}"/>`;
  const cloud = (x, y, s2, c = '#ffffff', op = 0.95) => `<g opacity="${op}">${f(`M ${x} ${y} C ${x - 10 * s2} ${y - 40 * s2} ${x + 50 * s2} ${y - 60 * s2} ${x + 70 * s2} ${y - 34 * s2} C ${x + 90 * s2} ${y - 70 * s2} ${x + 160 * s2} ${y - 50 * s2} ${x + 150 * s2} ${y - 10 * s2} C ${x + 190 * s2} ${y - 10 * s2} ${x + 190 * s2} ${y + 24 * s2} ${x + 150 * s2} ${y + 24 * s2} L ${x + 10 * s2} ${y + 24 * s2} C ${x - 30 * s2} ${y + 24 * s2} ${x - 30 * s2} ${y} ${x} ${y} Z`, c, 2.6)}</g>`;
  const wire = (x1, y1, x2, y2, sag, c = '#1d1f26', w = 3) => ln(`M ${x1} ${y1} Q ${(x1 + x2) / 2} ${(y1 + y2) / 2 + sag} ${x2} ${y2}`, c, w);
  function pattern(id, w, h, body) { DEFS.push(`<pattern id="${id}" width="${w}" height="${h}" patternUnits="userSpaceOnUse">${body}</pattern>`); return `url(#${id})`; }
  const bricks = (c, cs) => pattern('brick' + (++GID), 60, 40, `<rect width="60" height="40" fill="${c}"/><path d="M 0 0 L 60 0 M 0 20 L 60 20 M 30 0 L 30 20 M 0 20 L 0 40 M 60 20 L 60 40" stroke="${cs}" stroke-width="3"/>`);
  const mesh = (c) => pattern('mesh' + (++GID), 36, 36, `<path d="M 0 18 L 18 0 L 36 18 L 18 36 Z" fill="none" stroke="${c}" stroke-width="2.6"/>`);
  function house(x, y, w, h, wall, roof, win) {
    return f(`M ${x - 16} ${y} L ${x + w / 2} ${y - h * 0.42} L ${x + w + 16} ${y} Z`, roof) + f(R(x, y, w, h), wall) +
      rr(x + w * 0.14, y + h * 0.18, w * 0.24, h * 0.3, 3, win) + rr(x + w * 0.62, y + h * 0.18, w * 0.24, h * 0.3, 3, win) + f(R(x + w * 0.42, y + h * 0.52, w * 0.16, h * 0.48), '#6b4f52') +
      ln(`M ${x + w * 0.26} ${y + h * 0.18} L ${x + w * 0.26} ${y + h * 0.48} M ${x + w * 0.74} ${y + h * 0.18} L ${x + w * 0.74} ${y + h * 0.48}`, INK, 2.4);
  }
  function tree(x, y, r, c, cs) { return f(R(x - 10, y, 20, r * 1.4), '#6b4a35') + f(`M ${x - r} ${y} C ${x - r * 1.2} ${y - r * 1.2} ${x - r * 0.2} ${y - r * 1.7} ${x} ${y - r * 1.5} C ${x + r * 0.4} ${y - r * 1.9} ${x + r * 1.3} ${y - r * 1.1} ${x + r} ${y} C ${x + r * 0.6} ${y + r * 0.3} ${x - r * 0.6} ${y + r * 0.3} ${x - r} ${y} Z`, c) + nf(`M ${x - r} ${y} C ${x - r * 1.2} ${y - r * 1.2} ${x - r * 0.4} ${y - r * 1.6} ${x - r * 0.2} ${y - r * 1.5} C ${x - r * 0.6} ${y - r} ${x - r * 0.5} ${y - r * 0.2} ${x - r * 0.2} ${y + r * 0.18} Z`, cs); }
  // one-point perspective : a point at depth z (1 = picture plane)
  const persp = (vx, vy) => ({ x: (x, z) => vx + (x - vx) / z, y: (y, z) => vy + (y - vy) / z });

  // ---------------- 2. the kitchen, the living room ----------------
  function cuisine1() {
    let s = `<rect x="-40" y="-40" width="1160" height="2000" fill="#ecd9a6"/>` + nf('M -40 -40 L 200 -40 L 80 1500 L -40 1500 Z', '#d6c28e');
    // wall clock, upper cabinets
    s += `<circle cx="560" cy="250" r="56" fill="#f8f4ea" stroke="${INK}" stroke-width="${LW}"/>` + ln('M 560 250 L 560 214 M 560 250 L 586 262', INK, 5);
    s += f(R(30, 300, 320, 330), '#b07a4e') + nf(R(30, 300, 60, 330), '#8f5e3a') + ln('M 190 304 L 190 626', INK, LW) + `<circle cx="170" cy="580" r="7" fill="#efbb31" stroke="${INK}" stroke-width="2.4"/><circle cx="210" cy="580" r="7" fill="#efbb31" stroke="${INK}" stroke-width="2.4"/>`;
    // the window over the sink, a valance and curtains
    s += windowSky(380, 430, 330, 420, 'jour');
    s += f('M 360 404 L 730 404 L 730 470 Q 640 500 545 470 Q 450 500 360 470 Z', '#e86a52') + f('M 360 466 L 420 466 L 404 880 L 360 880 Z', '#e86a52') + f('M 730 466 L 670 466 L 686 880 L 730 880 Z', '#e86a52');
    // tiles, counter, cabinets
    s += `<rect x="-40" y="880" width="780" height="250" fill="${pattern('tile', 46, 46, '<rect width="46" height="46" fill="#f4f1e8"/><path d="M 0 0 L 46 0 L 46 46" fill="none" stroke="#cfc8b6" stroke-width="3"/>')}" stroke="${INK}" stroke-width="${LW}"/>`;
    s += f(R(-40, 1130, 790, 40), '#e8e1d1') + f(R(-40, 1170, 790, 330), '#b07a4e') + nf(R(-40, 1170, 70, 330), '#8f5e3a');
    [[40, 210], [270, 210], [500, 230]].forEach(([x, w]) => { s += ln(`M ${x} 1200 L ${x + w} 1200 L ${x + w} 1470 L ${x} 1470 Z`, INK, 2.6) + ln(`M ${x + w / 2 - 20} 1230 L ${x + w / 2 + 20} 1230`, '#efbb31', 6); });
    // the sink full of dishes (« T-Crazy mange pas si T-Crazy a pas fait la vaisselle »)
    s += ln('M 560 1130 L 560 1040 Q 560 1010 600 1010 L 620 1010', '#9aa1ad', 10) + ln('M 560 1130 L 560 1040 Q 560 1010 600 1010 L 620 1010', INK, 2) ;
    [[470, 1110, 90], [480, 1086, 80], [494, 1064, 66], [610, 1104, 70]].forEach(([x, y, w]) => { s += `<ellipse cx="${x + w / 2}" cy="${y}" rx="${w / 2}" ry="14" fill="#f8f4ea" stroke="${INK}" stroke-width="${LW}"/>`; });
    s += f('M 600 1050 L 640 1050 L 636 1100 L 604 1100 Z', '#8fd3ff') + f('M 640 1080 L 700 1060 L 704 1072 L 646 1094 Z', '#2a2d36');
    // the coffee maker, Nadia's
    s += f(R(90, 1010, 110, 120), '#2a2d36') + f(R(104, 1070, 82, 56), '#9a6a44') + `<rect x="104" y="1030" width="82" height="20" fill="#e5484d" opacity="0.8"/>`;
    // the fridge covered with bills, magnets, a child's drawing
    s += f(R(760, 560, 300, 960), '#f1ede2') + nf(R(760, 560, 50, 960), '#d8d2c2') + ln('M 760 840 L 1060 840', INK, LW) + ln('M 790 600 L 790 800 M 790 880 L 790 1080', '#9aa1ad', 8);
    const paper = (x, y, w, h, r, stamp) => `<g transform="rotate(${r} ${x + w / 2} ${y + h / 2})">${f(R(x, y, w, h), '#ffffff', 2.4)}${ln(`M ${x + 10} ${y + 18} l ${w - 20} 0 M ${x + 10} ${y + 32} l ${w - 30} 0 M ${x + 10} ${y + 46} l ${w - 24} 0`, '#9aa1ad', 3)}${stamp ? `<circle cx="${x + w - 24}" cy="${y + h - 24}" r="15" fill="none" stroke="#e5484d" stroke-width="4"/>` : ''}</g>`;
    s += paper(830, 600, 100, 130, -6, true) + paper(940, 620, 92, 120, 5, true) + paper(860, 880, 110, 140, 4, true) + paper(980, 900, 70, 96, -8, false) + paper(820, 1060, 96, 120, -3, true);
    s += `<g transform="rotate(3 1000 1110)">${f(R(950, 1050, 100, 120), '#fdfbf4', 2.4)}${ln('M 980 1150 L 980 1110 M 980 1110 l -14 22 M 980 1110 l 14 22 M 980 1120 l -14 -6 M 980 1120 l 14 -10', '#1f6fd6', 4)}<circle cx="980" cy="1096" r="10" fill="none" stroke="#1f6fd6" stroke-width="4"/>${ln('M 994 1112 l 16 -18', '#2a2d36', 5)}${ln('M 966 1080 l 6 -10 l 8 6 l 8 -6 l 6 10', '#efbb31', 4)}</g>`;
    [[880, 590, '#e5484d'], [990, 610, '#1f6fd6'], [910, 870, '#efbb31'], [1020, 890, '#3f7a55'], [860, 1050, '#9d8fd6']].forEach(([x, y, c]) => { s += `<circle cx="${x}" cy="${y}" r="11" fill="${c}" stroke="${INK}" stroke-width="2.4"/>`; });
    // floor : linoleum tiles
    s += `<rect x="-40" y="1500" width="1160" height="460" fill="${pattern('lino', 120, 120, '<rect width="120" height="120" fill="#e6dcc4"/><rect width="60" height="60" fill="#cbbd9c"/><rect x="60" y="60" width="60" height="60" fill="#cbbd9c"/>')}" stroke="${INK}" stroke-width="${LW}"/>` + nf('M -40 1500 L 300 1500 L 160 1960 L -40 1960 Z', '#000', 0.08);
    s += f(R(-40, 1490, 1160, 16), '#d8cfb8');
    // the warm light of the end of the afternoon
    s += warm() + nf('M 380 860 L 710 860 L 900 1500 L 300 1500 Z', '#ffd39a', 0.22) + nf('M 300 1500 L 900 1500 L 1000 1960 L 220 1960 Z', '#ffd39a', 0.18);
    return s;
  }
  function cuisine2() {
    let s = `<rect x="-40" y="-40" width="1160" height="2000" fill="#cdb98f"/>` + nf('M -40 -40 L 160 -40 L 60 1500 L -40 1500 Z', '#b29e74');
    // the window with blinds : stripes of light on the wall
    s += windowSky(640, 380, 360, 500, 'jour', { cross: false });
    for (let i = 0; i < 10; i++) s += f(R(662, 402 + i * 44, 316, 26), '#f1e6d6', 2.2);
    for (let i = 0; i < 6; i++) s += nf(`M ${560 - i * 60} ${700 + i * 70} L ${620 - i * 60} ${700 + i * 70} L ${300 - i * 60} ${1100 + i * 70} L ${240 - i * 60} ${1100 + i * 70} Z`, '#ffe2b0', 0.45);
    // family photos above the couch
    [[120, 600, 130, 160, '#9d8fd6'], [290, 560, 150, 190, '#8fd3ff'], [480, 610, 120, 150, '#e86a52']].forEach(([x, y, w, h, c]) => {
      s += f(R(x, y, w, h), '#6b4a35') + `<rect x="${x + 12}" y="${y + 12}" width="${w - 24}" height="${h - 24}" fill="${c}"/>` + `<circle cx="${x + w * 0.42}" cy="${y + h * 0.42}" r="${w * 0.14}" fill="#6b3f25"/><circle cx="${x + w * 0.66}" cy="${y + h * 0.56}" r="${w * 0.1}" fill="#a86a40"/>` + nf(`M ${x + w * 0.24} ${y + h - 12} C ${x + w * 0.26} ${y + h * 0.66} ${x + w * 0.6} ${y + h * 0.66} ${x + w * 0.62} ${y + h - 12} Z`, '#6b3f25') + nf(`M ${x + w * 0.52} ${y + h - 12} C ${x + w * 0.54} ${y + h * 0.74} ${x + w * 0.8} ${y + h * 0.74} ${x + w * 0.82} ${y + h - 12} Z`, '#a86a40');
    });
    // the worn couch, a patch, a crocheted blanket
    s += f('M 60 1060 C 60 1020 100 1000 140 1000 L 700 1000 C 740 1000 780 1020 780 1060 L 780 1200 L 60 1200 Z', '#c9973f') + nf('M 60 1060 C 60 1020 100 1000 140 1000 L 200 1000 L 200 1200 L 60 1200 Z', '#a87a2c');
    s += f(R(40, 1150, 760, 120), '#c9973f') + f(R(20, 1110, 90, 260), '#b8862f') + f(R(730, 1110, 90, 260), '#b8862f') + f(R(40, 1270, 760, 90), '#a87a2c');
    s += ln('M 300 1160 L 300 1268 M 540 1160 L 540 1268', INK, 2.6) + f('M 400 1040 L 470 1036 L 474 1100 L 404 1104 Z', '#7e9dca', 2.6) + ln('M 404 1040 l 4 60 M 420 1038 l 4 64', INK, 1.6, ' stroke-dasharray="5 5"');
    s += f('M 600 1000 L 720 1000 C 760 1040 780 1140 760 1240 L 700 1240 L 680 1060 Z', '#e86a52') + ln('M 640 1010 l 20 30 l 20 -30 l 20 30 M 690 1100 l 20 30 l 20 -30', '#f6f2ea', 5);
    // the TV on its low cabinet, the floor lamp
    s += f(R(840, 1180, 220, 320), '#6b4a35') + rr(830, 930, 240, 170, 8, '#2a2d36') + `<rect x="846" y="946" width="208" height="138" fill="#3a4152"/>` + nf('M 860 960 L 920 960 L 870 1070 L 846 1070 Z', '#ffffff', 0.12) + f(R(930, 1100, 40, 80), '#2a2d36');
    s += ln('M 40 1500 L 40 820', '#2a2d36', 8) + f('M -10 760 L 90 760 L 70 830 L 10 830 Z', '#f1e6d6');
    // the rug, the coffee table with the mail, a mug, the remote
    s += `<ellipse cx="420" cy="1680" rx="420" ry="120" fill="#7d5a8f" stroke="${INK}" stroke-width="${LW}"/><ellipse cx="420" cy="1680" rx="360" ry="96" fill="none" stroke="#9d7ab0" stroke-width="6"/>`;
    s += f(R(-40, 1500, 1160, 460), '#a58663').replace('<path', '<path opacity="1"') ;
    s = s.replace(`<ellipse cx="420" cy="1680" rx="420" ry="120" fill="#7d5a8f" stroke="${INK}" stroke-width="${LW}"/><ellipse cx="420" cy="1680" rx="360" ry="96" fill="none" stroke="#9d7ab0" stroke-width="6"/>`, '');
    s += `<ellipse cx="420" cy="1690" rx="430" ry="120" fill="#7d5a8f" stroke="${INK}" stroke-width="${LW}"/><ellipse cx="420" cy="1690" rx="370" ry="96" fill="none" stroke="#9d7ab0" stroke-width="6"/>`;
    s += f(R(220, 1540, 400, 36), '#6b4a35') + f(R(240, 1576, 18, 90), '#5a3d2c') + f(R(582, 1576, 18, 90), '#5a3d2c');
    s += `<g transform="rotate(-6 320 1530)">${f(R(280, 1514, 90, 26), '#ffffff', 2.4)}</g><g transform="rotate(4 380 1524)">${f(R(340, 1510, 80, 24), '#f4f1e8', 2.4)}</g>` + f(R(470, 1500, 40, 40), '#e86a52') + f(R(540, 1522, 60, 16), '#2a2d36');
    s += f(R(-40, 1490, 1160, 16), '#b29e74');
    s += warm() + nf('M 640 880 L 1000 880 L 1080 1500 L 540 1500 Z', '#ffd39a', 0.16);
    return s;
  }

  // ---------------- 3. the street and M. Reyes' corner shop ----------------
  function shopFront(x, y, w, o) {
    // sign, awning, window with posters, an « OUVERT » sign, the door, the ice chest (« GLAÇONS »)
    let s = f(R(x, y, w, 1460 - y), o.wall) + nf(R(x, y, 50, 1460 - y), o.wallS);
    s += f(R(x + 20, y + 30, w - 40, 130), o.sign) + txt(x + w / 2, y + 128, 'REYES', 96, '#fdfeff', { stroke: INK, sw: 10 }) + txt(x + w / 2, y + 22, 'ÉPICERIE', 30, INK, { font: 'Rubik', weight: 800 });
    let aw = '';
    for (let i = 0; i < 8; i++) aw += f(`M ${x + 10 + i * (w - 20) / 8} ${y + 180} L ${x + 10 + (i + 1) * (w - 20) / 8} ${y + 180} L ${x + (i + 1) * (w - 20) / 8 + 20} ${y + 290} L ${x + i * (w - 20) / 8 + 20} ${y + 290} Z`, i % 2 ? '#f4f1ea' : o.awning, 2.6);
    s += aw + ln(`M ${x + 10} ${y + 180} L ${x + w - 10} ${y + 180}`, INK, LW * 1.4);
    const wx = x + 40, wy = y + 330, ww = w * 0.52, wh = 1460 - y - 330 - 160;
    s += f(R(wx, wy, ww, wh), o.glass) + nf(`M ${wx + 20} ${wy + 10} L ${wx + 80} ${wy + 10} L ${wx + 30} ${wy + wh - 10} L ${wx + 10} ${wy + wh - 10} Z`, '#ffffff', 0.25);
    s += `<g transform="rotate(-4 ${wx + 80} ${wy + 80})">${f(R(wx + 30, wy + 40, 120, 90), '#ffe066', 2.4)}${txt(wx + 90, wy + 98, 'PROMO', 28, '#c8443a')}</g>` + f(R(wx + 180, wy + 50, 90, 120), '#f4f1ea', 2.4) + f(`M ${wx + 200} ${wy + 150} L ${wx + 200} ${wy + 90} L ${wx + 220} ${wy + 70} L ${wx + 240} ${wy + 90} L ${wx + 240} ${wy + 150} Z`, '#8fd3ff', 2.4);
    s += rr(wx + ww - 150, wy + wh - 90, 130, 56, 12, '#2a2d36') + txt(wx + ww - 85, wy + wh - 50, 'OUVERT', 30, o.neon);
    const dx = wx + ww + 30, dw = x + w - 30 - dx;
    s += f(R(dx, wy - 20, dw, 1460 - wy + 20), '#6b4f52') + f(R(dx + 16, wy, dw - 32, 1460 - wy - 120), o.glass) + ln(`M ${dx + dw - 36} ${wy + 300} l 0 60`, '#efbb31', 8);
    s += f(R(x + 50, 1300, 230, 160), '#f4f8fc') + f(R(x + 44, 1286, 242, 30), '#d6ecff') + txt(x + 165, 1390, 'GLAÇONS', 38, '#1f6fd6') + snowflake(x + 90, 1432, 14, '#1f6fd6', 3) + snowflake(x + 240, 1432, 14, '#1f6fd6', 3);
    return s;
  }
  function rue1() {
    let s = sky([[0, '#8fc3ec'], [0.55, '#cfe3f0'], [1, '#ffd7a8']], 1500);
    s += cloud(80, 260, 1.1) + cloud(640, 180, 0.8) + cloud(420, 420, 0.6, '#ffffff', 0.8);
    s += house(-30, 900, 300, 420, '#9fc1d8', '#6b4f52', '#ffe9b0') + house(250, 960, 230, 360, '#e8c9a0', '#7a4e45', '#ffe9b0') + tree(420, 1100, 90, '#5f9a4f', '#477a3a');
    s += f(R(-40, 1320, 520, 140), '#8fbf6f') + ln('M -40 1320 L 480 1320', INK, LW);
    s += shopFront(470, 580, 610, { wall: '#e9d2b0', wallS: '#cdb38f', sign: '#c8443a', awning: '#3f7a55', glass: '#9fc4d8', neon: '#ff8a7a' });
    // the power pole and the wires
    s += f(R(118, 160, 26, 1300), '#7a5a40') + f(R(60, 230, 140, 18), '#6b4a35') + f(R(70, 300, 120, 16), '#6b4a35') + f('M 150 360 C 150 340 190 340 190 360 L 190 420 C 190 440 150 440 150 420 Z', '#9aa1ad');
    s += wire(66, 232, 1120, 300, 90) + wire(130, 232, 1120, 340, 120) + wire(194, 232, 1120, 260, 70) + wire(80, 302, 1120, 470, 160) + wire(186, 302, 700, 580, 40);
    // sidewalk, curb, street, hydrant, trash can
    s += f(R(-40, 1460, 1160, 170), '#cfcbc4') + ln('M 200 1460 L 160 1630 M 520 1460 L 500 1630 M 860 1460 L 860 1630', '#a9a49b', 4);
    s += f(R(-40, 1630, 1160, 30), '#b5b0a7') + f(R(-40, 1660, 1160, 300), '#5a5c63') + ln('M -40 1800 L 1120 1800', '#e8c95a', 10, ' stroke-dasharray="80 60"');
    s += f('M 390 1460 L 390 1400 C 390 1380 430 1380 430 1400 L 430 1460 Z', '#e5484d') + f(R(376, 1410, 68, 16), '#c8443a') + f('M 270 1460 L 278 1370 L 352 1370 L 360 1460 Z', '#3f7a55') + f(R(268, 1360, 92, 16), '#2f5e41');
    s += warm() + nf('M -40 1460 L 1120 1460 L 1120 1640 L -40 1640 Z', '#ffd39a', 0.14) + nf('M 470 580 L 1080 580 L 1080 1460 L 470 1460 Z', '#ffd39a', 0.12);
    return s;
  }
  function rue2() {
    let s = sky([[0, '#1d2350'], [0.5, '#6c4ab6'], [0.85, '#e8735a'], [1, '#ffb27a']], 1500);
    s += stars(16, 0, 0, 1080, 300, 11);
    // brick buildings, a fire escape, lit windows
    s += f(R(-40, 280, 470, 1180), bricks('#a8513f', '#8c3f31')) + f(R(-40, 260, 470, 30), '#6b3f35');
    for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) { const x = 40 + c * 200, y = 360 + r * 250; s += f(R(x, y, 120, 160), (r + c) % 3 ? '#ffd36b' : '#2b3270') + ln(`M ${x + 60} ${y} L ${x + 60} ${y + 160}`, INK, 3); }
    s += ln('M 250 520 L 420 520 M 250 770 L 420 770 M 250 1020 L 420 1020 M 260 520 L 410 770 M 260 770 L 410 1020', '#2a2d36', 6) + ln('M 250 500 L 250 1040 M 420 500 L 420 1040', '#2a2d36', 6);
    s += f(R(440, 380, 680, 1080), bricks('#7a4a52', '#5f3740')) + f(R(440, 360, 680, 30), '#4a2f35');
    for (let c = 0; c < 3; c++) { const x = 500 + c * 200; s += f(R(x, 460, 120, 170), c === 1 ? '#2b3270' : '#ffd36b') + f(R(x, 720, 120, 170), c === 2 ? '#2b3270' : '#ffd36b'); }
    s += shopFront(440, 960, 640, { wall: '#3a3d4c', wallS: '#2c2f3c', sign: '#1f6fd6', awning: '#c8443a', glass: '#ffe9a8', neon: '#ff5a7a' });
    // wires, the street lamp
    s += wire(-40, 300, 440, 390, 60) + wire(-40, 340, 1120, 420, 140);
    s += f(R(372, 900, 16, 560), '#2a2d36') + f('M 340 900 L 420 900 L 410 870 L 350 870 Z', '#2a2d36') + `<ellipse cx="380" cy="904" rx="30" ry="8" fill="#ffe9a8"/>`;
    s += f(R(-40, 1460, 1160, 170), '#8a8792') + ln('M 200 1460 L 160 1630 M 520 1460 L 500 1630 M 860 1460 L 860 1630', '#6f6c78', 4) + f(R(-40, 1630, 1160, 30), '#77747f') + f(R(-40, 1660, 1160, 300), '#33343c') + ln('M -40 1800 L 1120 1800', '#b89f4a', 10, ' stroke-dasharray="80 60"');
    s += night(0.32) + glow(760, 1050, 420, 160, '#5aa9ff', 0.55) + glow(640, 1300, 420, 260, '#ffd36b', 0.45) + glow(380, 1150, 220, 420, '#ffe9a8', 0.45) + glow(760, 1640, 520, 120, '#ffd36b', 0.3);
    s += txt(760, 1088, 'REYES', 96, '#e9f8ff', { stroke: '#0e3f8f', sw: 10 });
    return s;
  }

  // ---------------- 4. the fenced basketball court ----------------
  function hoop(x, ground, top, flip = 1) {
    let s = f(R(x - 12, top + 120, 24, ground - top - 120), '#6f7480') + f(`M ${x} ${top + 140} L ${x - flip * 110} ${top + 120} L ${x - flip * 110} ${top + 100} L ${x} ${top + 116} Z`, '#6f7480');
    const bx = x - flip * 110 - (flip > 0 ? 200 : 0);
    s += f(R(bx, top, 200, 140), '#f4f1ea') + ln(`M ${bx + 66} ${top + 60} L ${bx + 134} ${top + 60} L ${bx + 134} ${top + 112} L ${bx + 66} ${top + 112} Z`, '#c8443a', 5);
    const rx = bx + 100;
    s += `<ellipse cx="${rx}" cy="${top + 160}" rx="56" ry="13" fill="none" stroke="${INK}" stroke-width="10" transform="rotate(${flip * 9} ${rx} ${top + 160})"/><ellipse cx="${rx}" cy="${top + 160}" rx="56" ry="13" fill="none" stroke="#e8873a" stroke-width="6" transform="rotate(${flip * 9} ${rx} ${top + 160})"/>`;
    s += ln(`M ${rx - 50} ${top + 168} L ${rx - 34} ${top + 230} L ${rx - 12} ${top + 176} L ${rx} ${top + 214} M ${rx + 20} ${top + 180} L ${rx + 30} ${top + 236}`, '#f4f1ea', 3);
    return s;
  }
  function terrain1() {
    let s = sky([[0, '#8fc3ec'], [0.6, '#d8e6ee'], [1, '#ffe1b0']], 1300);
    s += cloud(560, 220, 1) + cloud(80, 360, 0.7);
    // apartment blocks behind
    [[-40, 520, 360, '#c9a58a'], [300, 620, 320, '#a8b6c8'], [600, 480, 520, '#d9b48e']].forEach(([x, y, w, c]) => {
      s += f(R(x, y, w, 1300 - y), c);
      for (let r = 0; r < Math.floor((1260 - y) / 110); r++) for (let k = 0; k < Math.floor((w - 40) / 90); k++) s += f(R(x + 30 + k * 90, y + 40 + r * 110, 50, 64), (r + k) % 4 ? '#7e9dca' : '#ffe9b0', 2.4);
    });
    // court
    s += f(R(-40, 1300, 1160, 660), '#7a7c84') + ln('M -40 1500 C 300 1440 780 1440 1120 1500 M 300 1960 L 380 1560 L 700 1560 L 780 1960 M 380 1560 C 400 1640 680 1640 700 1560', '#e8e6e0', 8, ' opacity="0.7"');
    s += ln('M 120 1700 l 40 30 l -20 40 l 50 20 M 860 1820 l -30 20 l 10 50', '#5a5c63', 4) + ln('M 136 1712 l -8 -14 M 150 1724 l 6 -16', '#6a9a4f', 4);
    // the fence and its shadow
    s += nf('M -40 1500 L 1120 1500 L 1120 1640 L -40 1720 Z', '#000', 0.1);
    s += `<rect x="-40" y="760" width="1160" height="540" fill="${mesh('#5a5f6b')}"/>` + ln('M -40 760 L 1120 760', '#6f7480', 8);
    [100, 520, 940].forEach(x => { s += f(R(x - 9, 740, 18, 580), '#6f7480'); });
    // twisted signpost, the hoop, the bench
    s += ln('M 60 1520 L 70 1100 Q 80 1060 120 1050', '#6f7480', 10) + f('M 120 1020 L 220 1030 L 240 1060 L 220 1090 L 120 1080 Z', '#3f7a55');
    s += hoop(900, 1720, 860, 1);
    s += f(R(40, 1580, 300, 26), '#b07a4e') + f(R(60, 1606, 18, 70), '#6f7480') + f(R(300, 1606, 18, 70), '#6f7480');
    s += warm() + nf('M -40 1300 L 1120 1300 L 1120 1960 L -40 1960 Z', '#ffd39a', 0.1);
    return s;
  }
  function terrain2() {
    let s = sky([[0, '#0c1636'], [1, '#2b3270']], 1300) + stars(20, 0, 0, 1080, 260, 5);
    // city lights far away, the overpass and its pillars
    let city = '';
    for (let i = 0; i < 12; i++) { const x = -40 + i * 100, h = 140 + (i * 67) % 160; city += f(R(x, 1100 - h, 90, h + 200), '#151a36', 2); for (let k = 0; k < 5; k++) city += `<rect x="${x + 14 + (k * 23) % 60}" y="${1110 - h + 20 + k * 26}" width="9" height="12" fill="#ffd36b"/>`; }
    s += city;
    s += f('M -40 300 L 1120 360 L 1120 520 L -40 470 Z', '#5a5d6b') + f('M -40 470 L 1120 520 L 1120 560 L -40 506 Z', '#454856') + ln('M -40 300 L 1120 360', '#c9cdd6', 4);
    s += f(R(160, 500, 120, 900), '#5a5d6b') + nf(R(160, 500, 40, 900), '#454856') + f(R(780, 530, 120, 870), '#5a5d6b') + nf(R(780, 530, 40, 870), '#454856');
    s += f('M 820 900 C 840 860 880 870 870 920 C 900 940 870 980 840 960 Z', '#9d8fd6') + f('M 200 1000 C 230 960 270 980 250 1030 Z', '#8fd3ff');
    // court, fence on the side, the hoop on the left, a lamp
    s += f(R(-40, 1400, 1160, 560), '#4a4c57') + ln('M -40 1600 C 300 1540 780 1540 1120 1600 M 300 1960 L 380 1660 L 700 1660 L 780 1960', '#c9cdd6', 7, ' opacity="0.5"');
    s += `<path d="M 900 1400 L 1120 1300 L 1120 900 L 900 1060 Z" fill="${mesh('#7a7f8c')}"/>` + ln('M 900 1060 L 900 1420 M 1120 900 L 900 1060', '#7a7f8c', 8);
    s += hoop(150, 1760, 980, -1);
    s += f(R(560, 820, 18, 600), '#2a2d36') + f('M 520 820 L 620 820 L 606 790 L 534 790 Z', '#2a2d36') + `<ellipse cx="569" cy="824" rx="38" ry="9" fill="#ffc06b"/>`;
    s += night(0.3) + nf('M 530 828 L 608 828 L 900 1960 L 240 1960 Z', '#ffc06b', 0.16) + glow(569, 830, 140, 70, '#ffc06b', 0.9) + glow(569, 1600, 420, 260, '#ffc06b', 0.35);
    return s;
  }

  // ---------------- 5. the high school : the corridor, the yellow bus ----------------
  function lycee1() {
    const V = persp(540, 900), zEnd = 4;
    let s = `<rect x="-40" y="-40" width="1160" height="2000" fill="#dfe3e8"/>`;
    s += f(`M 0 0 L 1080 0 L ${V.x(1080, zEnd)} ${V.y(0, zEnd)} L ${V.x(0, zEnd)} ${V.y(0, zEnd)} Z`, '#eef0f2') + f(`M 0 1920 L 1080 1920 L ${V.x(1080, zEnd)} ${V.y(1920, zEnd)} L ${V.x(0, zEnd)} ${V.y(1920, zEnd)} Z`, '#c9d1da');
    s += f(`M 0 0 L ${V.x(0, zEnd)} ${V.y(0, zEnd)} L ${V.x(0, zEnd)} ${V.y(1920, zEnd)} L 0 1920 Z`, '#e8e2d2') + f(`M 1080 0 L ${V.x(1080, zEnd)} ${V.y(0, zEnd)} L ${V.x(1080, zEnd)} ${V.y(1920, zEnd)} L 1080 1920 Z`, '#e1dacb');
    // the far wall : a door, the exit sign
    const fx = V.x(0, zEnd), fy = V.y(0, zEnd), fw = V.x(1080, zEnd) - fx, fh = V.y(1920, zEnd) - fy;
    s += f(R(fx, fy, fw, fh), '#d8d2c2') + f(R(fx + fw * 0.3, fy + fh * 0.36, fw * 0.4, fh * 0.64), '#2f63b8') + f(R(fx + fw * 0.38, fy + fh * 0.44, fw * 0.24, fh * 0.16), '#bfe6ff');
    s += f(R(fx + fw * 0.34, fy + fh * 0.2, fw * 0.32, fh * 0.1), '#3f9a5a') + txt(fx + fw * 0.5, fy + fh * 0.278, 'SORTIE', fh * 0.05, '#ffffff');
    // floor tiles converging, ceiling lights
    for (let i = 1; i < 8; i++) { const x = i * 1080 / 8; s += ln(`M ${x} 1920 L ${V.x(x, zEnd)} ${V.y(1920, zEnd)}`, '#b2bcc8', 3); }
    [1.25, 1.6, 2.1, 2.8].forEach(z => { s += ln(`M ${V.x(0, z)} ${V.y(1920, z)} L ${V.x(1080, z)} ${V.y(1920, z)}`, '#b2bcc8', 3); });
    [1.3, 1.9, 2.8].forEach(z => { const z2 = z + 0.2; s += f(`M ${V.x(380, z)} ${V.y(0, z)} L ${V.x(700, z)} ${V.y(0, z)} L ${V.x(700, z2)} ${V.y(0, z2)} L ${V.x(380, z2)} ${V.y(0, z2)} Z`, '#ffffff', 2.4) + nf(`M ${V.x(380, z)} ${V.y(1920, z)} L ${V.x(700, z)} ${V.y(1920, z)} L ${V.x(700, z2)} ${V.y(1920, z2)} L ${V.x(380, z2)} ${V.y(1920, z2)} Z`, '#ffffff', 0.35); });
    // lockers on both walls
    const zs = [1.0, 1.18, 1.4, 1.66, 1.98, 2.38, 2.9, 3.5];
    [[0, '#2f63b8', '#244f96'], [1080, '#2f63b8', '#244f96']].forEach(([wx, c, cs]) => {
      for (let i = 0; i < zs.length - 1; i++) {
        const z1 = zs[i], z2 = zs[i + 1], yb = 1700, yt = 480;
        const p = [[V.x(wx, z1), V.y(yt, z1)], [V.x(wx, z2), V.y(yt, z2)], [V.x(wx, z2), V.y(yb, z2)], [V.x(wx, z1), V.y(yb, z1)]];
        s += f(`M ${p[0]} L ${p[1]} L ${p[2]} L ${p[3]} Z`.replace(/,/g, ' '), i % 4 === 2 ? '#e86a52' : c, 2.6);
        const vy = (k) => [V.x(wx, z1 + (z2 - z1) * 0.2), V.y(yt + 80 + k * 22, z1 + (z2 - z1) * 0.2), V.x(wx, z1 + (z2 - z1) * 0.8), V.y(yt + 80 + k * 22, z1 + (z2 - z1) * 0.8)];
        for (let k = 0; k < 3; k++) { const a = vy(k); s += ln(`M ${a[0]} ${a[1]} L ${a[2]} ${a[3]}`, cs, 3); }
        const hx = V.x(wx, z1 + (z2 - z1) * 0.7), hy = V.y(1060, z1 + (z2 - z1) * 0.7);
        s += ln(`M ${hx} ${hy} L ${hx} ${hy + 40 / z1}`, '#c9cdd6', 5);
      }
    });
    // a notice board with flyers (no text)
    const nb = [[V.x(1080, 3.55), V.y(560, 3.55)], [V.x(1080, 3.95), V.y(560, 3.95)], [V.x(1080, 3.95), V.y(900, 3.95)], [V.x(1080, 3.55), V.y(900, 3.55)]];
    s += f(`M ${nb[0]} L ${nb[1]} L ${nb[2]} L ${nb[3]} Z`.replace(/,/g, ' '), '#b07a4e', 2.4);
    return s + nf('M 0 0 L 1080 0 L 1080 1920 L 0 1920 Z', '#fff3d6', 0.06);
  }
  function lycee2() {
    const V = persp(540, 820), zEnd = 5;
    let s = `<rect x="-40" y="-40" width="1160" height="2000" fill="#efe6cf"/>`;
    // ceiling, floor, the back door
    s += f(`M 0 0 L 1080 0 L ${V.x(1080, zEnd)} ${V.y(0, zEnd)} L ${V.x(0, zEnd)} ${V.y(0, zEnd)} Z`, '#f4eedc') + f(`M 0 1920 L 1080 1920 L ${V.x(1080, zEnd)} ${V.y(1920, zEnd)} L ${V.x(0, zEnd)} ${V.y(1920, zEnd)} Z`, '#4a4b52');
    s += ln(`M 540 1920 L 540 ${V.y(1920, zEnd)}`, '#2f3036', 60) + ln(`M 520 1920 L ${V.x(520, zEnd)} ${V.y(1920, zEnd)} M 560 1920 L ${V.x(560, zEnd)} ${V.y(1920, zEnd)}`, '#5f6068', 4);
    const fx = V.x(0, zEnd), fy = V.y(0, zEnd), fw = V.x(1080, zEnd) - fx, fh = V.y(1920, zEnd) - fy;
    s += f(R(fx, fy, fw, fh), '#e8c440') + f(R(fx + fw * 0.2, fy + fh * 0.12, fw * 0.6, fh * 0.34), '#9fd0f0') + f(R(fx + fw * 0.3, fy + fh * 0.5, fw * 0.4, fh * 0.5), '#d9b02e') + ln(`M ${fx + fw * 0.36} ${fy + fh * 0.62} L ${fx + fw * 0.64} ${fy + fh * 0.62}`, '#c8443a', 8);
    // the windows on both sides : the town going by
    [[0, 1], [1080, -1]].forEach(([wx]) => {
      const zs = [1.0, 1.35, 1.8, 2.4, 3.2, 4.3];
      for (let i = 0; i < zs.length - 1; i++) {
        const z1 = zs[i] + 0.04, z2 = zs[i + 1] - 0.04, yt = 240, yb = 760;
        const p = [[V.x(wx, z1), V.y(yt, z1)], [V.x(wx, z2), V.y(yt, z2)], [V.x(wx, z2), V.y(yb, z2)], [V.x(wx, z1), V.y(yb, z1)]];
        s += f(`M ${p[0]} L ${p[1]} L ${p[2]} L ${p[3]} Z`.replace(/,/g, ' '), grad([[0, '#9fd0f0'], [0.7, '#cfe8c0'], [1, '#7aa86a']]), 3);
        s += nf(`M ${p[0][0]} ${(p[0][1] + p[3][1]) / 2} L ${p[1][0]} ${(p[1][1] + p[2][1]) / 2} L ${p[2]} L ${p[3]} Z`.replace(/,/g, ' '), '#5f9a4f', 0.6);
      }
    });
    // seat rows, green vinyl, from the back of the bus to the front (the far rows first)
    const Q4 = (p) => `M ${p.map(q => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(' L ')} Z`;
    [4.0, 3.1, 2.45, 1.95, 1.55, 1.22].forEach((z) => {
      [[40, 420], [660, 1040]].forEach(([a, b]) => {
        const zf = z - 0.16, aisle = a < 540 ? b : a;
        // the seat cushion, seen from above, and its front
        s += f(Q4([[V.x(a, z), V.y(1290, z)], [V.x(b, z), V.y(1290, z)], [V.x(b, zf), V.y(1290, zf)], [V.x(a, zf), V.y(1290, zf)]]), '#5a9a72', 2.4);
        s += f(Q4([[V.x(a, zf), V.y(1290, zf)], [V.x(b, zf), V.y(1290, zf)], [V.x(b, zf), V.y(1370, zf)], [V.x(a, zf), V.y(1370, zf)]]), '#2f5e41', 2.4);
        // the side toward the aisle
        s += f(Q4([[V.x(aisle, z), V.y(900, z)], [V.x(aisle, zf), V.y(900, zf)], [V.x(aisle, zf), V.y(1370, zf)], [V.x(aisle, z), V.y(1370, z)]]), '#2f5e41', 2.4);
        // the backrest with a rounded top, and its grab bar
        const x1 = V.x(a, z), x2 = V.x(b, z), yt = V.y(900, z), yb = V.y(1290, z), r = 40 / z;
        s += f(`M ${x1} ${yb} L ${x1} ${yt + r} Q ${x1} ${yt} ${x1 + r} ${yt} L ${x2 - r} ${yt} Q ${x2} ${yt} ${x2} ${yt + r} L ${x2} ${yb} Z`, '#3f7a55', 2.6);
        s += ln(`M ${x1 + 14 / z} ${yt + 70 / z} L ${x2 - 14 / z} ${yt + 70 / z}`, '#5a9a72', 6 / z + 2);
        s += ln(`M ${x1 + 10 / z} ${yt - 6 / z} L ${x2 - 10 / z} ${yt - 6 / z}`, '#c9cdd6', 9 / z + 2);
      });
    });
    s += ln(`M 0 220 L ${V.x(0, zEnd)} ${V.y(220, zEnd)} M 1080 220 L ${V.x(1080, zEnd)} ${V.y(220, zEnd)}`, '#c9cdd6', 10);
    return s + nf('M 0 0 L 1080 0 L 1080 1920 L 0 1920 Z', '#fff3d6', 0.08);
  }

  // ---------------- 6. the roof at sunset ----------------
  function skyline(base, c, lit, seed = 1) {
    let s = '', x = -40, k = seed;
    while (x < 1120) { const w = 60 + (k * 37) % 90, h = 120 + (k * 71) % 260; s += f(R(x, base - h, w, h + 400), c, 2); if (lit) for (let j = 0; j < 6; j++) s += `<rect x="${x + 10 + (j * 29) % (w - 20)}" y="${base - h + 20 + j * (h / 7)}" width="9" height="12" fill="${lit}"/>`; x += w + 6; k++; }
    return s;
  }
  function toit1() {
    let s = sky([[0, '#5a3d8f'], [0.4, '#c85a6a'], [0.75, '#f39a62'], [1, '#ffd49a']], 1300);
    s += `<circle cx="700" cy="1130" r="150" fill="#fff0c0"/>` + glow(700, 1130, 420, 300, '#fff0c0', 0.6);
    s += ln('M 300 360 l 18 -12 l 18 12 M 360 300 l 14 -10 l 14 10 M 820 420 l 16 -11 l 16 11', '#3a2240', 5);
    s += skyline(1240, '#4a2f5c', '#ffcf7a', 3);
    // the roof, its low wall, the water tower, AC units, a folding chair
    s += f(R(-40, 1240, 1160, 90), '#8a7f88') + f(R(-40, 1220, 1160, 30), '#a69ba4') + f(R(-40, 1330, 1160, 630), '#6b6670');
    s += ln('M -40 1500 L 1120 1480 M -40 1700 L 1120 1690 M 200 1330 L 140 1960 M 640 1330 L 700 1960', '#5a5560', 4);
    s += ln('M 100 1340 L 80 900 M 300 1340 L 320 900 M 90 1120 L 310 1340 M 310 1120 L 90 1340 M 86 1000 L 314 1000', '#3a3540', 10);
    s += f('M 60 600 L 340 600 L 340 900 C 340 930 60 930 60 900 Z', '#8a5a3c') + f('M 40 600 L 200 470 L 360 600 Z', '#6b4535') + ln('M 60 680 L 340 680 M 60 780 L 340 780 M 60 860 L 340 860', '#3a3540', 6) + ln('M 120 600 L 120 920 M 200 600 L 200 930 M 280 600 L 280 920', '#6b4535', 3);
    s += ln('M 350 900 L 350 1330 M 380 900 L 380 1330 M 350 960 L 380 960 M 350 1040 L 380 1040 M 350 1120 L 380 1120 M 350 1200 L 380 1200 M 350 1280 L 380 1280', '#3a3540', 5);
    [[760, 1380], [900, 1430]].forEach(([x, y]) => { s += f(R(x, y, 160, 130), '#b9bcc4') + `<circle cx="${x + 80}" cy="${y + 65}" r="44" fill="#8a8f9a" stroke="${INK}" stroke-width="${LW}"/>` + ln(`M ${x + 46} ${y + 65} L ${x + 114} ${y + 65} M ${x + 80} ${y + 31} L ${x + 80} ${y + 99}`, '#5a5f6b', 6); });
    s += ln('M 460 1640 L 560 1520 M 460 1520 L 560 1640 M 450 1530 L 570 1530', '#b9bcc4', 8) + f('M 450 1470 L 570 1470 L 566 1530 L 454 1530 Z', '#e86a52');
    s += nf('M -40 1240 L 1120 1240 L 1120 1260 L -40 1260 Z', '#ffd49a', 0.6) + nf('M -40 1330 L 1120 1330 L 1120 1960 L -40 1960 Z', '#ff9a5a', 0.12);
    return s;
  }
  function toit2() {
    let s = sky([[0, '#1d2350'], [0.55, '#5a3d8f'], [0.85, '#c85a6a'], [1, '#f39a62']], 1300) + stars(24, 0, 0, 1080, 420, 9);
    s += skyline(1240, '#2b2140', '#ffd36b', 6);
    // the roof, the low wall
    s += f(R(-40, 1240, 1160, 90), '#5f5866') + f(R(-40, 1220, 1160, 30), '#77707e') + f(R(-40, 1330, 1160, 630), '#4a4552') + ln('M -40 1520 L 1120 1500 M 260 1330 L 200 1960 M 760 1330 L 820 1960', '#3e3a46', 4);
    // string lights
    const bulbs = (x1, y1, x2, y2, sag, n) => { let o = wire(x1, y1, x2, y2, sag, '#2a2d36', 3); for (let i = 1; i < n; i++) { const t = i / n, x = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * (x1 + x2) / 2 + t * t * x2, y = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * ((y1 + y2) / 2 + sag) + t * t * y2; o += `<circle cx="${x.toFixed(1)}" cy="${(y + 12).toFixed(1)}" r="9" fill="#ffe9a8" stroke="${INK}" stroke-width="2.4"/>` + glow(x.toFixed(1), (y + 12).toFixed(1), 40, 40, '#ffd36b', 0.7); } return o; };
    s += f(R(40, 300, 14, 1100), '#3a3540') + f(R(1026, 360, 14, 1060), '#3a3540') + bulbs(47, 320, 1033, 380, 160, 12) + bulbs(47, 520, 1033, 560, 120, 10);
    // the salvaged couch, the crate table, plants, the cooler (an icy wink)
    s += f('M 120 1420 C 120 1380 150 1370 180 1370 L 600 1370 C 630 1370 660 1380 660 1420 L 660 1520 L 120 1520 Z', '#3f7a55') + f(R(100, 1480, 580, 110), '#3f7a55') + f(R(80, 1450, 70, 190), '#2f5e41') + f(R(630, 1450, 70, 190), '#2f5e41') + ln('M 300 1490 L 300 1586 M 480 1490 L 480 1586', INK, 2.6);
    s += f(R(740, 1560, 170, 120), '#b07a4e') + ln('M 740 1600 L 910 1600 M 740 1640 L 910 1640', '#8f5e3a', 4) + rr(780, 1500, 90, 60, 10, '#2a2d36') + `<circle cx="805" cy="1530" r="14" fill="#5a5f6b"/><circle cx="845" cy="1530" r="14" fill="#5a5f6b"/>`;
    s += f(R(900, 1400, 120, 100), '#1f6fd6') + f(R(890, 1386, 140, 24), '#d6ecff') + snowflake(960, 1450, 22, '#ffffff', 5);
    [[60, 1300, '#5f9a4f'], [960, 1290, '#477a3a']].forEach(([x, y, c]) => { s += f(R(x, y + 60, 80, 90), '#8a5a3c') + f(`M ${x - 10} ${y + 64} C ${x - 20} ${y} ${x + 40} ${y - 30} ${x + 40} ${y + 20} C ${x + 60} ${y - 20} ${x + 100} ${y + 20} ${x + 90} ${y + 64} Z`, c); });
    s += night(0.22) + glow(540, 1500, 600, 300, '#ffd36b', 0.25);
    return s;
  }

  const SCENES = { chambre: { 1: chambre1, 2: chambre2 }, cuisine: { 1: cuisine1, 2: cuisine2 }, rue: { 1: rue1, 2: rue2 }, terrain: { 1: terrain1, 2: terrain2 }, lycee: { 1: lycee1, 2: lycee2 }, toit: { 1: toit1, 2: toit2 } };
  window.DECORS = {
    scene(id, v, t) { DEFS = []; GID = 0; const body = SCENES[id][v](t); return `<defs>${DEFS.join('')}</defs>` + body; },
  };
})();
