/* Studio Chambre — sets, props and screens (Marketing & croissance, 15/11/2026).
   Everything is drawn in world coordinates of the wide shot (1080 × 1920). Deterministic : the snow and every
   « random » detail come from a seeded generator. BandLab is never drawn : the recording app is our own. */
(function () {
  const { INK, SNOW, star, line } = PERSO;
  const K = { sky: '#1f6fd6', night: '#0e3f8f', wall: '#12398a', wallS: '#0f3279', ice: '#d6ecff', frost: '#eef7ff', glass: '#0a2556',
    rec: '#e5484d', ui: '#0b1b3d', uiL: '#16305f', wave: '#8fd3ff', gold: '#f2c14e', desk: '#d6ecff', deskS: '#a9cdf0', wood: '#9cc3ea' };
  const r1 = (x) => Math.round(x * 10) / 10;
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const box = (x, y, w, h, fill, rx = 0, sw = 8, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" ${sw ? `stroke="${INK}" stroke-width="${sw}"` : ''} stroke-linejoin="round" ${extra}/>`;
  const txt = (x, y, s, size, fill = INK, font = 'Lilita One', anchor = 'middle', extra = '') => `<text x="${x}" y="${y}" font-family="${font}, Rubik, sans-serif" font-size="${size}" fill="${fill}" text-anchor="${anchor}" ${extra}>${s}</text>`;
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

  // falling snow inside a rectangle (time t in seconds)
  function snow(t, x, y, w, h, n, seed, size = 7) {
    const R = rng(seed); let s = '';
    for (let i = 0; i < n; i++) {
      const sx = R() * w, sp = 40 + R() * 70, ph = R() * h, sz = size * (0.5 + R());
      const yy = (ph + t * sp) % h, xx = sx + Math.sin(t * 0.9 + i) * 12;
      s += `<circle cx="${r1(x + ((xx % w) + w) % w)}" cy="${r1(y + yy)}" r="${r1(sz / 2)}" fill="${SNOW}" opacity="${r1(0.55 + R() * 0.45)}"/>`;
    }
    return s;
  }

  // ---------- the bedroom-studio : back layer (wall, window, door, poster, lights) ----------
  // o : {t, door:0..1 (open), hall:'' | svg of who stands in the doorway, night:true, window:{extra svg}}
  function bedroomBack(o) {
    const t = o.t || 0;
    const day = !!o.day;
    let s = `<rect x="-400" y="-400" width="1880" height="2720" fill="${day ? '#2f66c4' : K.wall}"/>`;
    for (let x = -400; x < 1480; x += 96) s += `<rect x="${x}" y="-400" width="40" height="2720" fill="${day ? '#2858b0' : K.wallS}" opacity="0.55"/>`;
    // string lights
    let lights = 'M -40 150';
    for (let i = 0; i <= 12; i++) lights += ` Q ${-40 + i * 100 + 50} ${i % 2 ? 190 : 120} ${-40 + (i + 1) * 100} 150`;
    s += line(lights, 5, INK);
    for (let i = 0; i < 24; i++) {
      const x = -40 + i * 50, y = 150 + (i % 2 ? 22 : -8) * (i % 4 < 2 ? 1 : -0.4);
      const on = 0.75 + 0.25 * Math.sin(t * 2.2 + i * 1.7);
      s += `<circle cx="${x}" cy="${y + 12}" r="18" fill="${i % 2 ? K.wave : SNOW}" opacity="${r1(0.18 * on)}"/><circle cx="${x}" cy="${y + 12}" r="9" fill="${i % 2 ? K.wave : '#fff6d8'}" stroke="${INK}" stroke-width="4"/>`;
    }
    // window (top right) : night, moon, snow, frost corners
    const W = { x: 690, y: 250, w: 330, h: 470 };
    s += box(W.x - 22, W.y - 22, W.w + 44, W.h + 44, SNOW, 18, 9);
    s += `<clipPath id="win"><rect x="${W.x}" y="${W.y}" width="${W.w}" height="${W.h}" rx="6"/></clipPath><g clip-path="url(#win)">`;
    s += `<rect x="${W.x}" y="${W.y}" width="${W.w}" height="${W.h}" fill="${day ? '#9fd4ff' : K.glass}"/>`;
    s += day ? `<circle cx="${W.x + 236}" cy="${W.y + 112}" r="74" fill="#fff6d8" opacity="0.45"/><circle cx="${W.x + 236}" cy="${W.y + 112}" r="48" fill="#fff3b8" stroke="${INK}" stroke-width="6"/>`
      : `<circle cx="${W.x + 240}" cy="${W.y + 110}" r="46" fill="#fff6d8"/><circle cx="${W.x + 262}" cy="${W.y + 96}" r="42" fill="${K.glass}"/>`;
    s += `<path d="M ${W.x - 10} ${W.y + 400} Q ${W.x + 90} ${W.y + 360} ${W.x + 170} ${W.y + 390} T ${W.x + 350} ${W.y + 380} L ${W.x + 350} ${W.y + 480} L ${W.x - 10} ${W.y + 480} Z" fill="${SNOW}"/>`;
    s += snow(t, W.x, W.y, W.w, W.h, 26, 11, 9);
    if (o.window) s += o.window;
    s += `</g>`;
    s += line(`M ${W.x + W.w / 2} ${W.y} L ${W.x + W.w / 2} ${W.y + W.h} M ${W.x} ${W.y + W.h * 0.48} L ${W.x + W.w} ${W.y + W.h * 0.48}`, 14, INK) + line(`M ${W.x + W.w / 2} ${W.y} L ${W.x + W.w / 2} ${W.y + W.h} M ${W.x} ${W.y + W.h * 0.48} L ${W.x + W.w} ${W.y + W.h * 0.48}`, 6, SNOW);
    s += `<path d="M ${W.x} ${W.y + 60} Q ${W.x + 30} ${W.y + 30} ${W.x + 70} ${W.y} L ${W.x} ${W.y} Z M ${W.x + W.w} ${W.y + W.h - 70} Q ${W.x + W.w - 40} ${W.y + W.h - 30} ${W.x + W.w - 90} ${W.y + W.h} L ${W.x + W.w} ${W.y + W.h} Z" fill="${K.ice}" opacity="0.9"/>`;
    // icicles on the window sill
    s += box(W.x - 40, W.y + W.h + 14, W.w + 80, 30, SNOW, 10, 8);
    [[W.x - 10, 44], [W.x + 40, 26], [W.x + 110, 58], [W.x + 190, 32], [W.x + 260, 50], [W.x + 330, 28]].forEach(([x, l]) => { s += `<path d="M ${x - 14} ${W.y + W.h + 44} Q ${x} ${W.y + W.h + 44 + l} ${x + 14} ${W.y + W.h + 44} Z" fill="${K.ice}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>`; });
    // acoustic foam under the window
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
      const x = 730 + c * 96, y = 840 + r * 96;
      s += box(x, y, 90, 90, '#2a78d8', 8, 6) + line(`M ${x + 10} ${y + 45} L ${x + 45} ${y + 10} L ${x + 80} ${y + 45} L ${x + 45} ${y + 80} Z`, 4, '#1d5fb4');
    }
    // the door (left), with its sign ; it opens on a warm hallway
    const D = { x: 40, y: 470, w: 300, h: 980 };
    const open = Math.max(0, Math.min(1, o.door || 0));
    s += box(D.x - 18, D.y - 18, D.w + 36, D.h + 30, SNOW, 10, 9);
    s += `<rect x="${D.x}" y="${D.y}" width="${D.w}" height="${D.h}" fill="#ffd98a"/>`;
    if (open > 0) {
      s += `<path d="M ${D.x} ${D.y + D.h} L ${D.x + D.w} ${D.y + D.h} L ${D.x + D.w + 260} ${D.y + D.h + 300} L ${D.x - 120} ${D.y + D.h + 300} Z" fill="#ffd98a" opacity="${r1(0.35 * open)}"/>`;
      if (o.hall) s += `<clipPath id="hallc"><rect x="${D.x}" y="${D.y - 400}" width="${D.w + 400}" height="${D.h + 400}"/></clipPath><g clip-path="url(#hallc)">${o.hall}</g>`;
    }
    // the door leaf turns on its left hinge : drawn as a narrowing panel
    const leafW = D.w * (1 - open * 0.86);
    s += `<g><path d="M ${D.x} ${D.y} L ${D.x + leafW} ${D.y + open * 40} L ${D.x + leafW} ${D.y + D.h - open * 40} L ${D.x} ${D.y + D.h} Z" fill="${K.ice}" stroke="${INK}" stroke-width="9" stroke-linejoin="round"/>`;
    if (open < 0.6) {
      const k = 1 - open * 0.86;
      s += `<g transform="translate(${D.x},0) scale(${r1(k * 1000) / 1000},1) translate(${-D.x},0)">` +
        box(D.x + 40, D.y + 70, D.w - 80, 330, 'none', 14, 6) + box(D.x + 40, D.y + 470, D.w - 80, 420, 'none', 14, 6) +
        `<circle cx="${D.x + D.w - 44}" cy="${D.y + 540}" r="18" fill="${K.gold}" stroke="${INK}" stroke-width="6"/>` +
        `<g transform="rotate(-4 ${D.x + D.w / 2} ${D.y + 220})">${box(D.x + 46, D.y + 130, D.w - 92, 190, '#fffdf4', 6, 6)}` +
        txt(D.x + D.w / 2, D.y + 200, 'STUDIO', 44, INK) + txt(D.x + D.w / 2, D.y + 250, 'NE PAS', 30, K.rec) + txt(D.x + D.w / 2, D.y + 288, 'DÉRANGER', 30, K.rec) +
        `<rect x="${D.x + D.w / 2 - 30}" y="${D.y + 118}" width="60" height="22" fill="${K.ice}" opacity="0.8" transform="rotate(3 ${D.x + D.w / 2} ${D.y + 128})"/></g></g>`;
    }
    s += `</g>`;
    // poster (between door and window)
    s += `<g transform="rotate(3 520 330)">${box(400, 200, 230, 300, SNOW, 6, 8)}<rect x="416" y="216" width="198" height="200" fill="${K.sky}"/>` +
      star(515, 300, 56, SNOW, 6) + txt(515, 448, 'LIL GIVRE', 38, INK) + txt(515, 482, 'BIENTÔT', 24, K.sky) + `</g>`;
    return s;
  }

  // ---------- the desk : front layer (laptop from the back, mic, phone on books, mug) ----------
  // o : {t, laptop:true, mic:true|'near', books:true, phoneOnBooks:true, rec:0..1 (red light), lampOn}
  function desk(o) {
    const t = o.t || 0;
    let s = '';
    // desk top and front
    s += `<path d="M -300 1380 L 1380 1380 L 1380 2400 L -300 2400 Z" fill="${K.desk}" stroke="${INK}" stroke-width="9"/>`;
    s += `<path d="M -300 1380 L 1380 1380 L 1380 1424 L -300 1424 Z" fill="${SNOW}" stroke="${INK}" stroke-width="9"/>`;
    s += line('M -300 1560 L 1380 1560', 6, K.deskS);
    // laptop seen from the back (left)
    if (o.laptop !== false) {
      s += `<path d="M 110 1130 L 440 1150 L 452 1386 L 96 1386 Z" fill="#c9d9ee" stroke="${INK}" stroke-width="9" stroke-linejoin="round"/>`;
      s += star(275, 1262, 36, SNOW, 6) + `<circle cx="214" cy="1196" r="14" fill="${K.sky}" stroke="${INK}" stroke-width="5"/>`;
      if (o.laptopGlow) s += `<path d="M 452 1160 L 560 1100 L 560 1400 L 452 1386 Z" fill="${K.wave}" opacity="${r1(0.18 * o.laptopGlow)}"/>`;
    }
    // books + phone filming him (right)
    if (o.books) {
      s += box(820, 1300, 220, 40, '#e9705e', 6, 7) + box(836, 1262, 196, 40, '#f2c14e', 6, 7) + box(812, 1224, 230, 40, K.sky, 6, 7);
      if (o.phoneOnBooks) {
        s += `<rect x="878" y="1030" width="120" height="196" rx="20" fill="${INK}"/><rect x="888" y="1040" width="100" height="176" rx="14" fill="#16305f"/>`;
        const rec = (Math.floor(t * 2) % 2) ? 1 : 0.35;
        s += `<circle cx="938" cy="1128" r="16" fill="${K.rec}" opacity="${rec}"/>`;
      }
    }
    // microphone on its stand (right)
    if (o.mic) {
      const mx = o.mic === 'near' ? 700 : 760;
      s += line(`M ${mx + 40} 1386 L ${mx + 40} 1240`, 16, INK) + line(`M ${mx + 40} 1386 L ${mx + 40} 1240`, 6, '#9aa9bf');
      s += box(mx - 10, 1376, 100, 18, '#9aa9bf', 8, 6);
      s += `<g transform="rotate(-8 ${mx + 40} 1160)">${box(mx + 6, 1080, 68, 160, '#26334f', 34, 8)}` + line(`M ${mx + 14} 1110 L ${mx + 66} 1110 M ${mx + 14} 1132 L ${mx + 66} 1132 M ${mx + 14} 1154 L ${mx + 66} 1154`, 4, '#5d6f93') + `</g>`;
      if (o.rec) s += `<circle cx="${mx + 40}" cy="1210" r="9" fill="${K.rec}" opacity="${r1(0.4 + 0.6 * o.rec)}"/>`;
    }
    // mug
    if (o.mug !== false) s += box(560, 1300, 76, 86, SNOW, 12, 7) + `<path d="M 636 1318 C 676 1318 676 1366 636 1366" fill="none" stroke="${INK}" stroke-width="7"/>` + star(598, 1342, 16, K.sky, 4);
    return s;
  }

  // ---------- the laptop screen, full frame ----------
  // our own recording app (never BandLab's) : o = {t, mode:'rec'|'edit', file, timer, recording, wave:[..], spike:{x,label}, clock, preview}
  function laptopScreen(o) {
    const t = o.t || 0;
    let s = `<rect x="-200" y="-200" width="1480" height="2320" fill="#05070d"/>`;
    s += box(40, 260, 1000, 1400, '#1a2236', 46, 12);
    s += `<rect x="78" y="298" width="924" height="1324" rx="20" fill="${K.ui}"/>`;
    s += `<circle cx="540" cy="282" r="7" fill="#3b4763"/>`;
    // top bar
    s += `<rect x="78" y="298" width="924" height="120" rx="20" fill="${K.uiL}"/>`;
    s += star(132, 358, 26, K.wave, 5) + `<text x="176" y="372" font-family="Rubik" font-weight="700" font-size="40" fill="${SNOW}">${esc(o.file || 'son_final_v12')}</text>`;
    if (o.clock) s += box(780, 324, 190, 70, '#0b1b3d', 16, 0) + `<text x="875" y="374" text-anchor="middle" font-family="Rubik" font-weight="700" font-size="44" fill="${K.rec}">${esc(o.clock)}</text>`;
    if (o.mode === 'edit') return s + editUI(o);
    // tracks
    const lanes = [{ name: 'BEAT', y: 520, color: '#3c6fd1' }, { name: 'VOIX', y: 760, color: '#8fd3ff' }];
    lanes.forEach((L, i) => {
      s += `<rect x="98" y="${L.y - 90}" width="884" height="200" rx="18" fill="#0e2550"/>`;
      s += `<text x="122" y="${L.y - 46}" font-family="Rubik" font-weight="700" font-size="32" fill="${K.wave}">${L.name}</text>`;
      const end = i === 1 && o.recording != null ? 120 + 840 * Math.min(1, o.recording) : 960;
      const R = rng(30 + i);
      let d = '';
      for (let x = 120; x < end; x += 9) {
        let a = (0.25 + R() * 0.75) * (i === 0 ? 46 : 62) * (i === 0 ? (0.6 + 0.4 * Math.abs(Math.sin(x / 37))) : 1);
        if (o.spike && i === 1 && Math.abs(x - o.spike.x) < 40) a = 96;
        d += `M ${x} ${L.y + 20 - a} L ${x} ${L.y + 20 + a} `;
      }
      s += `<rect x="114" y="${L.y - 70}" width="${end - 110}" height="180" rx="14" fill="${L.color}" opacity="0.28"/>`;
      s += `<path d="${d}" stroke="${L.color}" stroke-width="5" stroke-linecap="round"/>`;
      if (o.spike && i === 1) {
        s += `<path d="${(() => { let q = ''; for (let x = o.spike.x - 40; x < o.spike.x + 40; x += 9) q += `M ${x} ${L.y - 80} L ${x} ${L.y + 120} `; return q; })()}" stroke="${K.rec}" stroke-width="7" stroke-linecap="round"/>`;
        s += `<g transform="rotate(-6 ${o.spike.x} ${L.y - 150})">${box(o.spike.x - 120, L.y - 200, 240, 86, K.rec, 16, 7)}${txt(o.spike.x, L.y - 140, esc(o.spike.label), 56, SNOW)}</g>`;
      }
    });
    // playhead + transport
    const ph = 120 + 840 * ((o.play != null ? o.play : (t * 0.08)) % 1);
    s += line(`M ${r1(ph)} 420 L ${r1(ph)} 900`, 6, SNOW);
    const recOn = o.recording != null ? ((Math.floor(t * 2) % 2) ? 1 : 0.45) : 0.35;
    s += `<circle cx="540" cy="1180" r="120" fill="${K.rec}" opacity="${recOn}" stroke="${INK}" stroke-width="10"/><circle cx="540" cy="1180" r="52" fill="${SNOW}" opacity="${r1(0.85 * recOn)}"/>`;
    s += txt(540, 1380, o.recording != null ? 'ENREGISTREMENT' : 'PRÊT', 54, o.recording != null ? K.rec : K.wave);
    s += `<text x="540" y="1470" text-anchor="middle" font-family="Rubik" font-weight="700" font-size="48" fill="${SNOW}">${esc(o.timer || '00:01:23')}</text>`;
    return s;
  }
  // the editing app at 3:47 : a preview where the mouth is out of time, the takes badly lined up (o.takes, 3 by default)
  function editUI(o) {
    const t = o.t || 0;
    let s = box(118, 460, 844, 560, '#05070d', 18, 0);
    if (o.preview) s += `<g transform="translate(540,1110) scale(0.62)">${o.preview}</g>`;
    s += `<rect x="118" y="460" width="844" height="560" rx="18" fill="none" stroke="#2a3b66" stroke-width="8"/>`;
    s += `<g transform="rotate(-5 300 520)">${box(150, 480, 300, 76, K.rec, 14, 6)}${txt(300, 534, 'DÉCALÉ', 52, SNOW)}</g>`;
    // the timeline : the takes, each one a bit off
    const offs = [0, 46, -28, 74].slice(0, o.takes || 3);
    offs.forEach((dx, i) => {
      const y = 1100 + i * 110;
      s += `<rect x="98" y="${y}" width="884" height="92" rx="12" fill="#0e2550"/>`;
      s += box(150 + dx + Math.sin(t * 3 + i) * 6, y + 12, 620, 68, ['#3c6fd1', '#8fd3ff', '#5aa0ea', '#2f86c9'][i], 12, 5);
      s += `<text x="${170 + dx}" y="${y + 58}" font-family="Rubik" font-weight="700" font-size="30" fill="${INK}">PRISE ${i + 1}</text>`;
    });
    const ph = 300 + Math.sin(t * 1.3) * 160;
    s += line(`M ${r1(ph)} 1080 L ${r1(ph)} ${1100 + offs.length * 110}`, 6, K.rec);
    s += `<text x="540" y="1600" text-anchor="middle" font-family="Rubik" font-weight="700" font-size="34" fill="${K.wave}">image par image…</text>`;
    return s;
  }

  // ---------- the phone, full frame ----------
  const PH = { x: 190, y: 170, w: 700, h: 1520, r: 92 };
  function phoneFrame(content, o = {}) {
    let s = `<rect x="${PH.x}" y="${PH.y}" width="${PH.w}" height="${PH.h}" rx="${PH.r}" fill="${INK}"/>`;
    s += `<clipPath id="phc"><rect x="${PH.x + 22}" y="${PH.y + 22}" width="${PH.w - 44}" height="${PH.h - 44}" rx="${PH.r - 22}"/></clipPath>`;
    s += `<g clip-path="url(#phc)"><rect x="${PH.x}" y="${PH.y}" width="${PH.w}" height="${PH.h}" fill="${o.bg || '#0b1b3d'}"/>${content}</g>`;
    s += `<rect x="${PH.x + 270}" y="${PH.y + 40}" width="160" height="40" rx="20" fill="${INK}"/>`;
    s += `<rect x="${PH.x}" y="${PH.y}" width="${PH.w}" height="${PH.h}" rx="${PH.r}" fill="none" stroke="#2a3346" stroke-width="6"/>`;
    return s;
  }
  // a chat with Big Banquise : msgs = [{from:'me'|'him', kind:'text'|'voice', text, dur, play:0..1, t0}]
  function chat(o) {
    const t = o.t || 0;
    let s = `<rect x="${PH.x}" y="${PH.y}" width="${PH.w}" height="${PH.h}" fill="#0f2147"/>`;
    // header
    s += `<rect x="${PH.x}" y="${PH.y}" width="${PH.w}" height="230" fill="#16305f"/>`;
    s += `<g transform="translate(${PH.x + 110},${PH.y + 160}) scale(0.36)">${PERSO.banquise({}, 'bqh')}</g>`;
    s += `<text x="${PH.x + 186}" y="${PH.y + 168}" font-family="Rubik" font-weight="800" font-size="40" fill="${SNOW}">Big Banquise</text>` + star(PH.x + 470, PH.y + 154, 18, K.wave, 4);
    s += `<text x="${PH.x + 186}" y="${PH.y + 206}" font-family="Rubik" font-size="28" fill="${K.wave}">${esc(o.sub || 'en ligne')}</text>`;
    let y = PH.y + 290;
    (o.msgs || []).forEach((m, i) => {
      if (m.t0 != null && t < m.t0) return;
      const k = m.t0 != null ? Math.min(1, (t - m.t0) / 0.18) : 1;
      const me = m.from === 'me';
      if (m.kind === 'date') { s += `<text x="540" y="${y + 30}" text-anchor="middle" font-family="Rubik" font-size="26" fill="#7f97c8">${esc(m.text)}</text>`; y += 70; return; }
      const w = m.kind === 'voice' ? 470 : Math.min(520, 60 + m.text.length * 21);
      const h = m.kind === 'voice' ? 110 : 96 * Math.ceil(m.text.length * 21 / 470);
      const x = me ? PH.x + PH.w - 40 - w : PH.x + 40;
      s += `<g transform="translate(${x + (me ? w : 0)},${y}) scale(${r1(0.6 + 0.4 * k)}) translate(${me ? -w : 0},0)" opacity="${r1(k)}">`;
      s += box(0, 0, w, h, me ? K.sky : '#f2f7ff', 32, 6);
      if (m.kind === 'voice') {
        const play = m.play || 0;
        s += `<circle cx="58" cy="${h / 2}" r="34" fill="${INK}"/><path d="M 48 ${h / 2 - 18} L 76 ${h / 2} L 48 ${h / 2 + 18} Z" fill="${SNOW}"/>`;
        const R = rng(70 + i); let d = '', dp = '';
        for (let j = 0; j < 26; j++) { const xx = 112 + j * 11.5, a = 8 + R() * 30; const seg = `M ${xx} ${h / 2 - a} L ${xx} ${h / 2 + a} `; if (j / 26 < play) dp += seg; else d += seg; }
        s += `<path d="${d}" stroke="#9aaac6" stroke-width="6" stroke-linecap="round"/><path d="${dp}" stroke="${K.sky}" stroke-width="6" stroke-linecap="round"/>`;
        s += `<text x="${w - 26}" y="${h - 22}" text-anchor="end" font-family="Rubik" font-size="24" fill="#5d6f93">${esc(m.dur || '0:04')}</text>`;
      } else {
        s += `<foreignObject x="22" y="12" width="${w - 44}" height="${h - 20}"><div xmlns="http://www.w3.org/1999/xhtml" style="font:500 34px Rubik,sans-serif;color:${me ? SNOW : INK};line-height:1.25">${esc(m.text)}</div></foreignObject>`;
      }
      s += `</g>`;
      y += h + 30;
    });
    // typing bar
    s += `<rect x="${PH.x}" y="${PH.y + PH.h - 170}" width="${PH.w}" height="170" fill="#16305f"/>` + box(PH.x + 36, PH.y + PH.h - 140, PH.w - 72, 84, '#0b1b3d', 42, 0);
    if (o.typing) s += `<text x="${PH.x + 70}" y="${PH.y + PH.h - 84}" font-family="Rubik" font-size="34" fill="${SNOW}">${esc(o.typing)}<tspan fill="${K.wave}">${Math.floor(t * 3) % 2 ? '|' : ''}</tspan></text>`;
    return s;
  }
  // lock screen with a notification
  function lock(o) {
    const t = o.t || 0;
    let s = `<rect x="${PH.x}" y="${PH.y}" width="${PH.w}" height="${PH.h}" fill="${K.sky}"/>` + snow(t, PH.x, PH.y, PH.w, PH.h, 30, 5, 10);
    s += `<text x="540" y="${PH.y + 330}" text-anchor="middle" font-family="Rubik" font-weight="700" font-size="150" fill="${SNOW}">${esc(o.time || '14:32')}</text>`;
    s += `<text x="540" y="${PH.y + 400}" text-anchor="middle" font-family="Rubik" font-size="34" fill="${K.ice}">${esc(o.date || 'mercredi 18 novembre')}</text>`;
    if (o.notif) {
      const k = Math.min(1, Math.max(0, (t - (o.notifT || 0)) / 0.25));
      s += `<g transform="translate(0,${r1((1 - k) * -80)})" opacity="${r1(k)}">${box(PH.x + 36, PH.y + 470, PH.w - 72, 170, SNOW, 34, 7)}` +
        `<g transform="translate(${PH.x + 114},${PH.y + 555}) scale(0.32)">${PERSO.banquise({}, 'bqn')}</g>` +
        `<text x="${PH.x + 184}" y="${PH.y + 540}" font-family="Rubik" font-weight="800" font-size="34" fill="${INK}">${esc(o.notif.title)}</text>` +
        `<text x="${PH.x + 184}" y="${PH.y + 590}" font-family="Rubik" font-size="30" fill="#3f5170">${esc(o.notif.text)}</text></g>`;
    }
    return s;
  }
  // a real screen of the Stalak app (site_src/aide/fr-*.jpg), with a status bar
  function stalakScreen(o) {
    const img = o.img, sc = (PH.w - 44) / 600;
    let s = `<rect x="${PH.x}" y="${PH.y}" width="${PH.w}" height="${PH.h}" fill="${K.sky}"/>`;
    const y = PH.y + 96 - (o.scroll || 0);
    s += `<image href="/site_src/aide/${img}" x="${PH.x + 22}" y="${y}" width="${600 * sc}" height="${o.h * sc}" preserveAspectRatio="xMidYMin slice"/>`;
    s += `<rect x="${PH.x}" y="${PH.y}" width="${PH.w}" height="96" fill="${K.sky}"/><text x="${PH.x + 90}" y="${PH.y + 72}" font-family="Rubik" font-weight="700" font-size="30" fill="${SNOW}">9:41</text>`;
    return s;
  }
  // a video on a phone : black screen with lyrics (Big Banquise's), with the view count
  function blackLyrics(o) {
    let s = `<rect x="${PH.x}" y="${PH.y}" width="${PH.w}" height="${PH.h}" fill="#05070d"/>`;
    s += `<text x="540" y="900" text-anchor="middle" font-family="Rubik" font-size="40" fill="#b9c3d6">${esc(o.l1 || 'paroles…')}</text>`;
    s += `<text x="540" y="960" text-anchor="middle" font-family="Rubik" font-size="40" fill="#b9c3d6">${esc(o.l2 || '')}</text>`;
    if (o.views) s += `<text x="${PH.x + 60}" y="${PH.y + PH.h - 90}" font-family="Rubik" font-weight="700" font-size="34" fill="${SNOW}">▶ ${esc(o.views)}</text>`;
    return s;
  }

  // ---------- the end card ----------
  // o : {t, k (0..1 entrance), tease, mascot:'hello'}
  function endCard(o) {
    const t = o.t || 0, k = o.k == null ? 1 : o.k;
    let s = `<rect x="-200" y="-200" width="1480" height="2320" fill="${K.sky}"/>` + snow(t, 0, 0, 1080, 1920, 50, 23, 12);
    // icicles along the top
    let ic = 'M -20 0 L 1100 0 L 1100 60';
    for (let x = 1100; x > -20; x -= 60) ic += ` L ${x - 20} ${60 + (x % 120 ? 50 : 90)} L ${x - 40} 60`;
    s += `<path d="${ic} L -20 60 Z" fill="${SNOW}" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>`;
    const sc = 0.4 + 0.6 * k;
    s += `<g transform="translate(540,690) scale(${r1(sc * 1000) / 1000})"><image href="/site_src/icons/icon.svg" x="-190" y="-190" width="380" height="380"/></g>`;
    return s;
  }

  window.DECOR = { K, rng, snow, bedroomBack, desk, laptopScreen, phoneFrame, chat, lock, stalakScreen, blackLyrics, endCard, PH, box, txt, esc };
})();
