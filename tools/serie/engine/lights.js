/* Série « T-Crazy » — the lights (owner, 16/11 at 19 h 32, for every video from now on : « Je veux que les lumières soient
   plus réalistes : si y'a une lumière, y'a un halo lumineux, si y'a un truc qui brille… »).
   Each set has a light rig, by the hour of the day :
   - the grade of the hour is laid over the set AND over the characters, so that everyone stands in the same light ;
   - every light source (sun, street lamp, neon, lit window, screen) has its halo : a hot core and a long soft skirt, the
     streak of a bright light through the lens, drawn over the characters as real bloom (light wraps around their edges) ;
   - glass has its reflections, and a shine that sweeps across it now and then ;
   - what shines twinkles : ice, chrome, a chain, sunglasses, earrings, a phone (class « shiny » on the drawing, found here).
   Characters get a soft contact shadow under their feet. No blur filter anywhere : soft radial gradients, fast to draw.
   The animation (anim.js) moves the glints, the flicker of the neon and the sweeps from the time alone : no clock. */
(function () {
  let LID = 0;
  const nid = () => 'lt' + (++LID);
  const n1 = (v) => (+v).toFixed(1);
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const K = (o, inner) => `<g data-k='${JSON.stringify(o)}'>${inner}</g>`;

  // ---------------- the primitives (set or frame coordinates) ----------------
  // a soft light : a hot core and a long skirt (two gaussians) ; o.ry : an oval halo ; o.hot : radius of a white-hot centre ;
  // o.streak : half-length of the lens streak through it
  function halo(cx, cy, r, color, k = 1, o = {}) {
    const g = nid(), w1 = o.core || 0.1, w2 = o.skirt || 0.42, c1 = o.c1 == null ? 0.7 : o.c1, c2 = 1 - c1;
    const xs = [0, 0.03, 0.06, 0.1, 0.15, 0.22, 0.3, 0.4, 0.52, 0.66, 0.82, 1];
    const stops = xs.map(x => {
      const a = k * (c1 * Math.exp(-((x / w1) ** 2)) + c2 * Math.exp(-((x / w2) ** 2))) * (1 - x ** 4);
      return `<stop offset="${x}" stop-color="${color}" stop-opacity="${clamp01(a).toFixed(3)}"/>`;
    }).join('');
    let s = `<defs><radialGradient id="${g}">${stops}</radialGradient></defs><ellipse cx="${n1(cx)}" cy="${n1(cy)}" rx="${n1(r)}" ry="${n1(o.ry || r)}" fill="url(#${g})"/>`;
    if (o.hot) {
      const h = nid();
      s += `<defs><radialGradient id="${h}"><stop offset="0" stop-color="#ffffff" stop-opacity="${clamp01(k).toFixed(3)}"/><stop offset="0.45" stop-color="#ffffff" stop-opacity="${clamp01(0.45 * k).toFixed(3)}"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient></defs>` +
        `<ellipse cx="${n1(cx)}" cy="${n1(cy)}" rx="${n1(o.hot)}" ry="${n1(o.hot * (o.ry ? o.ry / r : 1))}" fill="url(#${h})"/>`;
    }
    if (o.streak) s += streak(cx, cy, o.streak, Math.max(3, o.streak * 0.016), color, k * (o.sk || 0.75));
    return s;
  }
  // the horizontal streak of a bright light through a lens (the tent of the HyperFrames block « vfx-anamorphic-flare »,
  // in closed form) : a thin ellipse whose soft elliptical falloff comes from its own radial gradient
  function streak(cx, cy, len, h, color, k = 0.75) {
    const g = nid();
    return `<defs><radialGradient id="${g}"><stop offset="0" stop-color="#ffffff" stop-opacity="${clamp01(k).toFixed(3)}"/><stop offset="0.1" stop-color="${color}" stop-opacity="${clamp01(0.7 * k).toFixed(3)}"/><stop offset="0.45" stop-color="${color}" stop-opacity="${clamp01(0.2 * k).toFixed(3)}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient></defs>` +
      `<ellipse cx="${n1(cx)}" cy="${n1(cy)}" rx="${n1(len)}" ry="${n1(h)}" fill="url(#${g})"/>`;
  }
  // rays of light from (x, y) : n wedges around the angle a (degrees, 0 = to the right, 90 = down), fading with the distance
  function rays(x, y, a, spread, n, len, color, k = 0.12, seed = 1) {
    const g = nid();
    let d = '', r = seed;
    for (let i = 0; i < n; i++) {
      r = (r * 9301 + 49297) % 233280;
      const j = r / 233280, ang = (a - spread / 2 + spread * (i + 0.5) / n + (j - 0.5) * spread / n * 0.8) * Math.PI / 180, w = (0.012 + 0.03 * j);
      const x1 = x + Math.cos(ang - w) * len, y1 = y + Math.sin(ang - w) * len, x2 = x + Math.cos(ang + w) * len, y2 = y + Math.sin(ang + w) * len;
      d += `M ${n1(x)} ${n1(y)} L ${n1(x1)} ${n1(y1)} L ${n1(x2)} ${n1(y2)} Z `;
    }
    return `<defs><radialGradient id="${g}" gradientUnits="userSpaceOnUse" cx="${n1(x)}" cy="${n1(y)}" r="${n1(len)}"><stop offset="0" stop-color="${color}" stop-opacity="${clamp01(k * 1.6).toFixed(3)}"/><stop offset="0.35" stop-color="${color}" stop-opacity="${clamp01(k).toFixed(3)}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient></defs><path d="${d}" fill="url(#${g})"/>`;
  }
  // the ghosts of a lens flare : soft discs on the line from the light through the centre of the picture
  function ghosts(sx, sy, k = 0.07, cx = 540, cy = 960) {
    const dx = cx - sx, dy = cy - sy;
    return [[0.42, 46, '#ffe0a0'], [1.28, 70, '#9fd3ff'], [1.62, 30, '#ffb0d0'], [1.95, 110, '#c8b8ff']].map(([p, r, c]) => {
      const g = nid();
      return `<defs><radialGradient id="${g}"><stop offset="0" stop-color="${c}" stop-opacity="${(k * 0.5).toFixed(3)}"/><stop offset="0.75" stop-color="${c}" stop-opacity="${k.toFixed(3)}"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient></defs><circle cx="${n1(sx + dx * p)}" cy="${n1(sy + dy * p)}" r="${r}" fill="url(#${g})"/>`;
    }).join('');
  }
  // a lit sign or a neon word : its bloom in its colour (wide, faint strokes of the same letters), the tube white-hot
  function neonText(x, y, text, size, color, k = 1, o = {}) {
    const t = (sw, c, a) => `<text x="${x}" y="${y}" text-anchor="middle" font-family="${o.font || 'Lilita One'}" font-size="${size}" fill="${c}" stroke="${c}" stroke-width="${n1(sw)}" stroke-linejoin="round" opacity="${clamp01(a * k).toFixed(3)}"${o.rot ? ` transform="rotate(${o.rot} ${x} ${y})"` : ''}>${text}</text>`;
    return t(size * 0.62, color, 0.1) + t(size * 0.34, color, 0.2) + t(size * 0.14, color, 0.42) + t(0, '#ffffff', 0.55);
  }
  // a neon tube along a path
  function neonPath(d, color, w = 6, k = 1) {
    return [[w * 7, 0.08], [w * 4, 0.15], [w * 2.2, 0.32]].map(([sw, a]) => `<path d="${d}" fill="none" stroke="${color}" stroke-width="${n1(sw)}" stroke-linecap="round" stroke-linejoin="round" opacity="${clamp01(a * k).toFixed(3)}"/>`).join('') +
      `<path d="${d}" fill="none" stroke="#ffffff" stroke-width="${n1(w * 0.6)}" stroke-linecap="round" stroke-linejoin="round" opacity="${clamp01(0.85 * k).toFixed(3)}"/>`;
  }
  // a glint : a four-point star, its little glow ; o.tw = [period, phase, length, min] makes it twinkle (anim.js)
  const STAR = (A, B) => `M 0 ${n1(-A)} C ${n1(B)} ${n1(-B)} ${n1(B)} ${n1(-B)} ${n1(A)} 0 C ${n1(B)} ${n1(B)} ${n1(B)} ${n1(B)} 0 ${n1(A)} C ${n1(-B)} ${n1(B)} ${n1(-B)} ${n1(B)} ${n1(-A)} 0 C ${n1(-B)} ${n1(-B)} ${n1(-B)} ${n1(-B)} 0 ${n1(-A)} Z`;
  function glint(x, y, s, o = {}) {
    const g = nid(), c = o.color || '#fff4d6';
    const body = `<defs><radialGradient id="${g}"><stop offset="0" stop-color="#ffffff" stop-opacity="0.95"/><stop offset="0.3" stop-color="${c}" stop-opacity="0.45"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient></defs>` +
      `<circle r="${n1(s * 0.62)}" fill="url(#${g})"/><path d="${STAR(s, s * 0.11)}" fill="#ffffff"/><path d="${STAR(s * 0.42, s * 0.09)}" fill="#ffffff" opacity="0.85" transform="rotate(45)"/>`;
    const inner = `<g class="glint">${body}</g>`;
    return `<g transform="translate(${n1(x)} ${n1(y)})">${o.tw ? K({ tw: o.tw }, inner) : inner}</g>`;
  }
  // reflections on a pane of glass (x, y, w, h) : two still diagonal bands, and a brighter one that sweeps across it
  // every `per` seconds (phase ph) ; o.k : how strong
  function glass(x, y, w, h, o = {}) {
    const c = nid(), k = o.k == null ? 1 : o.k, per = o.per || 5.5, ph = o.ph || 0;
    const band = (x0, bw, a) => `<path d="M ${n1(x0)} ${n1(y + h)} L ${n1(x0 + h * 0.45)} ${n1(y)} L ${n1(x0 + h * 0.45 + bw)} ${n1(y)} L ${n1(x0 + bw)} ${n1(y + h)} Z" fill="#ffffff" opacity="${clamp01(a * k).toFixed(3)}"/>`;
    let s = `<defs><clipPath id="${c}"><rect x="${n1(x)}" y="${n1(y)}" width="${n1(w)}" height="${n1(h)}"/></clipPath></defs><g clip-path="url(#${c})">`;
    s += band(x + w * 0.08 - h * 0.2, w * 0.1, 0.16) + band(x + w * 0.24 - h * 0.2, w * 0.035, 0.12);
    if (!o.still) s += K({ sweep: [per, ph, 0.9, w + h * 0.6, 0] }, band(x - h * 0.55 - w * 0.2, w * 0.16, 0.34));
    return s + '</g>';
  }
  // a pool of light on the ground
  const pool = (cx, cy, rx, ry, color, k = 0.4) => halo(cx, cy, rx, color, k, { ry, c1: 0.35, core: 0.25, skirt: 0.6 });
  // the cone of light under a lamp : from (x, y) down to the ground at gy, fading downwards
  function cone(x, y, top, bottom, gy, color, k = 0.18) {
    const g = nid();
    return `<defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity="${clamp01(k * 1.7).toFixed(3)}"/><stop offset="0.5" stop-color="${color}" stop-opacity="${clamp01(k).toFixed(3)}"/><stop offset="1" stop-color="${color}" stop-opacity="${clamp01(k * 0.3).toFixed(3)}"/></linearGradient></defs>` +
      `<path d="M ${n1(x - top)} ${n1(y)} L ${n1(x + top)} ${n1(y)} L ${n1(x + bottom)} ${n1(gy)} L ${n1(x - bottom)} ${n1(gy)} Z" fill="url(#${g})"/>`;
  }
  // a vertical gradient over the whole frame (a grade) : stops [[offset, colour, opacity]...]
  function wash(stops, x = -60, y = -60, w = 1200, h = 2040) {
    const g = nid();
    return `<defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('')}</linearGradient></defs><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${g})"/>`;
  }
  // the layers : a multiply grade, then the light (screen), both over the set and the characters
  const layers = (mul, scr, add = '') => (mul ? `<g class="lt-grade" style="mix-blend-mode:multiply">${mul}</g>` : '') + (scr ? `<g class="lt-light" style="mix-blend-mode:screen">${scr}</g>` : '') + add;

  // ---------------- the rigs ----------------
  // amb : how dark the hour is (0 : full day … 1 : night) : the screens glow more when it is dark
  const RIGS = {};
  // a rig has two parts : `under` is drawn with the set, behind the characters (the light sources themselves, their hot
  // cores and streaks, lit letters, reflections on glass, the glints of the set : a character standing in front of them
  // hides them) ; `over` is laid over the set and the characters alike (the grade of the hour, the wide soft bloom of the
  // strong lights that wraps around the edges of whoever stands in front of them, the rays and the lens ghosts)
  // the street and M. Reyes' shop (decors.js rue1 : shop at x 470, sign 490-1060 × 610-740, window 510-827 × 910-1300,
  // « OUVERT » plate 677-807 × 1210-1266, door glass 873-1034 × 910-1340, ice chest 514-756 × 1286-1460, pole x 131,
  // the street lamp on the pole : its glass at 263, 489 ; in the evening the sun sets behind the houses at 330, 865)
  RIGS.rue = { 1: (t) => {
    const ouvert = (k) => K({ flk: [3, 0.6] }, neonText(742, 1250, 'OUVERT', 30, '#ff6a5a', k) + halo(742, 1238, 150, '#ff6a5a', 0.32 * k, { ry: 70 }));
    const ice = [[548, 1292, 34, [3.1, 0.2, 0.8, 0.2]], [700, 1300, 28, [3.7, 1.9, 0.8, 0.2]], [612, 1452, 22, [4.3, 2.8, 0.8, 0.2]], [742, 1330, 26, [2.9, 1.1, 0.8, 0.2]]].map(([x, y, sz, tw]) => glint(x, y, sz, { tw, color: '#d6ecff' })).join('');
    const panes = glass(510, 910, 317, 390, { per: 6.5, ph: 0.8 }) + glass(873, 910, 161, 430, { per: 6.5, ph: 3.6, k: 0.8 });
    if (t === 'coucher' || t === 'soir') {
      // evening : the low sun behind the houses on the left, the street lamp and the shop are lit, warm and violet grade
      const sunU = halo(330, 865, 420, '#ffb060', 0.75, { hot: 130, streak: 760, sk: 0.55 });
      const sunO = halo(330, 865, 1000, '#ff9a4a', 0.34, { c1: 0.15, skirt: 0.5 }) + rays(330, 865, -14, 84, 7, 1300, '#ffb070', 0.05, 4) + ghosts(330, 865, 0.05);
      const lampU = halo(263, 492, 170, '#ffcf7a', 0.85, { hot: 34, streak: 330 }) + cone(263, 494, 26, 230, 1630, '#ffcf7a', 0.13) + pool(263, 1545, 320, 66, '#ffcf7a', 0.45);
      const lampO = halo(263, 492, 300, '#ffcf7a', 0.28, { c1: 0.2, skirt: 0.5 });
      const shopU = halo(668, 1110, 330, '#ffd08a', 0.42, { ry: 260 }) + pool(668, 1500, 300, 60, '#ffd08a', 0.3) + halo(775, 675, 420, '#ff8a6a', 0.22, { ry: 150 });
      const wins = [[48, 1039], [192, 1039], [310, 1079], [420, 1079]].map(([x, y]) => halo(x, y, 95, '#ffd36b', 0.32)).join('');
      const mul = wash([[0, '#c86a7a', 0.34], [0.45, '#e09070', 0.24], [0.8, '#8a6ab0', 0.22], [1, '#5a4a90', 0.3]]);
      return { under: layers('', sunU + lampU + shopU + wins + ouvert(1.25) + panes + ice), over: layers(mul, sunO + lampO + halo(668, 1110, 420, '#ffd08a', 0.12, { c1: 0.1 })), amb: 0.65 };
    }
    // the day (and the afternoon, a little lower and warmer) : the sun up on the right, out of the picture
    const pm = t === 'apres-midi';
    const sx = pm ? 1010 : 1130, sy = pm ? 120 : -90;
    const sun = halo(sx, sy, pm ? 900 : 820, '#fff1c8', pm ? 0.55 : 0.5, { c1: 0.25 }) + rays(sx, sy, pm ? 128 : 122, 46, 6, 1500, '#fff4d8', pm ? 0.06 : 0.05, 7) + ghosts(sx, sy, pm ? 0.05 : 0.04);
    const mul = wash([[0, '#ffffff', 0], [0.7, '#ffffff', 0], [1, '#6a7ab0', 0.16]]) + (pm ? wash([[0, '#ffd2a0', 0.16], [1, '#ffb27a', 0.1]]) : '');
    const under = ouvert(1) + panes + ice + glint(165, 372, 18, { tw: [4.9, 0.5] }) + pool(860, 1540, 420, 80, '#fff1c8', 0.16);
    return { under: layers('', under), over: layers(mul, sun), amb: pm ? 0.18 : 0.1 };
  } };
  // the basketball court by day (decors.js terrain1 : hoop at x 900, rim near 790-1010 × 1020, bench 40-340 × 1580)
  RIGS.terrain = { 1: (t) => {
    const pm = t === 'apres-midi', sx = pm ? 120 : -60, sy = pm ? 140 : -80;
    const sun = halo(sx, sy, 880, '#fff1c8', 0.5, { c1: 0.25 }) + rays(sx, sy, 58, 46, 6, 1500, '#fff4d8', 0.05, 3) + ghosts(sx, sy, 0.04);
    const under = glint(846, 1012, 22, { tw: [3.3, 0.4] }) + glint(940, 1030, 16, { tw: [4.1, 2.2] }) + glint(100, 760, 14, { tw: [5.3, 1.3] }) + glint(940, 752, 14, { tw: [4.7, 3.1] }) + (pm ? halo(sx, sy, 300, '#fff1c8', 0.6, { hot: 110, streak: 600, sk: 0.45 }) : '');
    const mul = wash([[0, '#ffffff', 0], [0.68, '#ffffff', 0], [1, '#5a6aa0', 0.18]]) + (pm ? wash([[0, '#ffd2a0', 0.14], [1, '#ffb27a', 0.08]]) : '');
    return { under: layers('', under), over: layers(mul, sun), amb: pm ? 0.18 : 0.1 };
  } };

  // ---------------- the characters ----------------
  // a soft shadow under the feet (frame coordinates : feet at x, y ; h : the height of the character)
  function contact(x, y, h) {
    const g = nid();
    return `<defs><radialGradient id="${g}"><stop offset="0" stop-color="#0a0d14" stop-opacity="0.34"/><stop offset="0.55" stop-color="#0a0d14" stop-opacity="0.16"/><stop offset="1" stop-color="#0a0d14" stop-opacity="0"/></radialGradient></defs>` +
      `<ellipse cx="${n1(x - h * 0.02)}" cy="${n1(y - h * 0.006)}" rx="${n1(h * 0.24)}" ry="${n1(h * 0.034)}" fill="url(#${g})"/>`;
  }
  // after the characters are placed : a glint on every « shiny » part (ear studs, hoops, sunglasses, the pendant, the
  // phone), put next to the face drawings so that it follows the breathing and stays behind what is in front of it ;
  // a soft glow around every « screen ». Called once per shot (anim.js) or once per still (frame.html).
  function attach(svg) {
    const amb = +((svg.querySelector('[data-amb]') || { dataset: { amb: 0.1 } }).dataset.amb);
    const placed = new Map();
    let n = 0;
    svg.querySelectorAll('.shiny, .screen').forEach(el => {
      // the talking and blinking copies of a face are hidden : only the shown drawing is measured, its glint is shared
      if (el.closest('.figT, .figB, .phone')) return; // (and nothing inside the big phone's screen : it is a video)
      const fig = el.closest('.fig'), host = fig ? fig.parentNode : el.parentNode;
      let b, sc;
      try {
        const hm = host.getCTM(), m = hm.inverse().multiply(el.getCTM()), bb = el.getBBox();
        const pts = [[bb.x, bb.y], [bb.x + bb.width, bb.y], [bb.x, bb.y + bb.height], [bb.x + bb.width, bb.y + bb.height]].map(([x, y]) => [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f]);
        const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
        b = { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
        sc = Math.hypot(hm.a, hm.b);
      } catch (e) { return; }
      if (!(b.w > 0 && b.h > 0 && sc > 0) || Math.max(b.w, b.h) * sc < 5) return; // too small on screen to shine
      const cx = b.x + b.w / 2, cy = b.y + b.h / 2, sz = Math.max(b.w, b.h);
      // one glint per spot (a stud and its little highlight are one thing)
      const list = placed.get(host) || []; if (list.some(([x, y]) => Math.hypot(x - cx, y - cy) < sz * 0.9)) return;
      list.push([cx, cy]); placed.set(host, list);
      const h = (++n) * 1.37 + cx * 0.013 + cy * 0.007, px = sz * sc;
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', 'lt-live');
      if (el.classList.contains('screen')) {
        g.innerHTML = `<g style="mix-blend-mode:screen">${halo(cx, cy, sz * 1.5, el.dataset.glow || '#bfe0ff', 0.2 + 0.45 * amb, { ry: sz * 1.25 })}</g>` +
          glint(b.x + b.w * 0.78, b.y + b.h * 0.2, Math.max(9, Math.min(30, px * 0.3)) / sc, { tw: [4.2 + (h % 1.5), h % 4, 0.7, 0] });
      } else {
        // the size of a glint follows the size of the thing on screen : 16 to 44 px
        g.innerHTML = glint(cx + b.w * 0.12, cy - b.h * 0.18, Math.min(54, Math.max(22, px * 1.6)) / sc, { tw: [2.3 + (h % 1.7), h % 3, 0.8, 0.22] });
      }
      host.appendChild(g);
    });
  }

  window.LIGHTS = {
    halo, streak, rays, ghosts, neonText, neonPath, glint, glass, pool, cone, wash, layers, contact, attach,
    // the rig of a set at an hour : { under, over : svg in set coordinates, amb } (an empty rig for a set without one yet)
    rig(id, v, t) { const r = RIGS[id] && RIGS[id][v]; return r ? r(t) : { under: '', over: '', amb: t === 'nuit' ? 0.9 : 0.1 }; },
  };
})();
