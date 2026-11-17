// LEVELS v2 (mise en scène du 17/11) : la scène dessinée en code, image par image (SVG #scene, sous le haut de l'écran).
// Le haut de l'écran, la jauge, les bulles, les cartons sont des éléments HTML animés par HyperFrames (GSAP), voir index.html.
// Réutilise stick(), boom(), stars(), phoneFrame(), clip() de ../engine.js.
const OL2 = '#0d1020', LW2 = 13, TOPH = 760;
const HEROC = '#f7f8fc', STRANGER = '#ffb36b', MOM = '#d7a6e8', TATA = '#9fe0c0';
const D = () => window.__DATA;
const inR = (t, a, b) => t >= a && t < b;
const kk = (t, a, d) => clamp((t - a) / d, 0, 1);

function S(o) { return stick(Object.assign({ lw: LW2 }, o)); }
function cap(x, y, h) { return `<path d="M${x - h * 0.125} ${y - h * 0.66 - h * 0.17 * 1.7} q ${h * 0.125} ${-h * 0.11} ${h * 0.25} 0 z" fill="#2fb36b" stroke="${OL2}" stroke-width="${LW2}"/>`; }

// ------------------------------------------------ décors (contours épais, lumière ambiante)
function setRue(t) {
  let o = `<rect x="0" y="${TOPH}" width="1080" height="${1920 - TOPH}" fill="#151b38"/>`;
  const F = [[-30, 790, 330, '#2a2f55'], [300, 850, 300, '#33295a'], [600, 770, 520, '#26345e']];
  for (const [x, y, w, c] of F) {
    o += `<rect x="${x}" y="${y}" width="${w}" height="${1560 - y}" fill="${c}" stroke="${OL2}" stroke-width="${LW2}"/>`;
    for (let yy = y + 50; yy < 1430; yy += 150) for (let xx = x + 40; xx < x + w - 80; xx += 110) {
      const on = ((xx * 3 + yy) % 7) < 3;
      o += `<rect x="${xx}" y="${yy}" width="70" height="90" rx="6" fill="${on ? '#ffd27a' : '#1c2246'}" stroke="${OL2}" stroke-width="9"/>`;
      if (on) o += `<rect x="${xx - 30}" y="${yy - 30}" width="130" height="150" rx="40" fill="#ffc96b" opacity=".18" filter="url(#blur8)"/>`;
    }
  }
  o += `<rect x="660" y="1250" width="380" height="310" fill="#1c2246" stroke="${OL2}" stroke-width="${LW2}"/><rect x="640" y="1200" width="420" height="70" rx="10" fill="#c43b4a" stroke="${OL2}" stroke-width="${LW2}"/>
   <rect x="690" y="1310" width="320" height="210" fill="#ffe8b0" opacity=".85" stroke="${OL2}" stroke-width="9"/>`;
  o += `<rect x="0" y="1560" width="1080" height="360" fill="#262c4d" stroke="${OL2}" stroke-width="${LW2}"/><rect x="0" y="1560" width="1080" height="34" fill="#3a4170" stroke="${OL2}" stroke-width="${LW2}"/>`;
  const fl = 0.5 + 0.05 * Math.sin(t * 7);
  o += `<circle cx="200" cy="960" r="430" fill="url(#halo)" opacity="${fl}"/><ellipse cx="200" cy="1580" rx="320" ry="60" fill="#ffd27a" opacity=".22"/>
   <rect x="232" y="960" width="20" height="600" fill="#3a4170" stroke="${OL2}" stroke-width="10"/><path d="M242 965 q -10 -50 -70 -40" stroke="#3a4170" stroke-width="20" fill="none"/>
   <ellipse cx="172" cy="935" rx="44" ry="20" fill="#fff6d8" stroke="${OL2}" stroke-width="8"/>`;
  return o;
}
function setChambre(t, ring) {
  let o = `<rect x="0" y="${TOPH}" width="1080" height="${1920 - TOPH}" fill="#2a2450"/>`;
  o += `<rect x="0" y="1560" width="1080" height="360" fill="#3b2f4f" stroke="${OL2}" stroke-width="${LW2}"/>`;
  for (let x = -40; x < 1100; x += 120) o += `<line x1="${x}" y1="1572" x2="${x + 60}" y2="1920" stroke="${OL2}" stroke-width="5" opacity=".35"/>`;
  // la porte (d'où vient la claquette)
  o += `<rect x="40" y="900" width="230" height="660" rx="8" fill="#6b4a3a" stroke="${OL2}" stroke-width="${LW2}"/><circle cx="235" cy="1250" r="14" fill="#e8c46a" stroke="${OL2}" stroke-width="6"/>
   <rect x="70" y="940" width="170" height="250" rx="6" fill="none" stroke="${OL2}" stroke-width="8" opacity=".5"/>`;
  // la fenêtre, la nuit + lampe de chevet (lumière chaude)
  o += `<rect x="380" y="820" width="220" height="200" rx="8" fill="#13173a" stroke="${OL2}" stroke-width="${LW2}"/><circle cx="550" cy="870" r="22" fill="#fff3c4" opacity=".9"/><line x1="490" y1="820" x2="490" y2="1020" stroke="${OL2}" stroke-width="8"/>`;
  o += `<circle cx="520" cy="1300" r="380" fill="url(#halo)" opacity=".38"/>`;
  // le lit
  o += `<rect x="300" y="1400" width="300" height="160" rx="20" fill="#4a5fa8" stroke="${OL2}" stroke-width="${LW2}"/><rect x="320" y="1380" width="110" height="60" rx="18" fill="#e8ecf8" stroke="${OL2}" stroke-width="9"/>`;
  if (ring) o += `<circle cx="760" cy="1140" r="${300 + 30 * Math.sin(t * 20)}" fill="#7fd3ff" opacity=".10"/>`;
  return o;
}
function setBureau(t) {
  let o = `<rect x="0" y="${TOPH}" width="1080" height="${1920 - TOPH}" fill="#1b1f3e"/>`;
  o += `<rect x="0" y="1560" width="1080" height="360" fill="#2c2f55" stroke="${OL2}" stroke-width="${LW2}"/>`;
  // le bureau
  o += `<rect x="440" y="1360" width="560" height="40" rx="8" fill="#8a6a4a" stroke="${OL2}" stroke-width="${LW2}"/><rect x="470" y="1400" width="30" height="160" fill="#6b4a3a" stroke="${OL2}" stroke-width="9"/><rect x="940" y="1400" width="30" height="160" fill="#6b4a3a" stroke="${OL2}" stroke-width="9"/>`;
  // lumière bleue de l'écran
  o += `<circle cx="720" cy="1080" r="520" fill="#4f8dff" opacity=".13" filter="url(#blur8)"/>`;
  return o;
}

// ------------------------------------------------ écrans dessinés (sans logo d'aucune appli)
function chatScreen(x, y, w, h, msgs, t, title, A_MAX) {
  let o = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#e9e3d9"/><rect x="${x}" y="${y}" width="${w}" height="86" fill="#2f6b55"/>
   <circle cx="${x + 50}" cy="${y + 43}" r="26" fill="#c9e8da" stroke="${OL2}" stroke-width="4"/><text x="${x + 92}" y="${y + 55}" font-family="Rubik" font-weight="700" font-size="32" fill="#fff">${title}</text>`;
  let yy = y + 110;
  const vis = msgs.filter(m => t >= m.t);
  const start = Math.max(0, vis.length - (A_MAX || 7));
  vis.slice(start).forEach(m => {
    const k = ease(kk(t, m.t, 0.2));
    if (m.sys) { const ls = wrap(m.text, 22), bh = 18 + ls.length * 30; o += `<g opacity="${k}"><rect x="${x + 30}" y="${yy}" width="${w - 60}" height="${bh}" rx="14" fill="#f6efc9" stroke="${OL2}" stroke-width="3"/>` + ls.map((l, i) => `<text x="${x + w / 2}" y="${yy + 36 + i * 30}" font-family="Rubik" font-weight="700" font-size="24" fill="#6b5a2f" text-anchor="middle">${esc(l)}</text>`).join('') + `</g>`; yy += bh + 14; return; }
    const me = m.me, maxW = w - 70, lines = wrap(m.text, Math.floor((maxW - 36) / 12.5));
    const bw = Math.min(maxW, Math.max(...lines.map(l => l.length)) * 14 + 40), bh = 26 + lines.length * 32, bx = me ? x + w - bw - 14 : x + 14;
    const top = yy + (m.from ? 26 : 0);
    o += `<g opacity="${k}" transform="translate(0,${(1 - k) * 20})">`;
    if (m.from) o += `<text x="${bx + 8}" y="${yy + 20}" font-family="Rubik" font-weight="700" font-size="21" fill="#2f6b55">${esc(m.from)}</text>`;
    o += `<rect x="${bx}" y="${top}" width="${bw}" height="${bh}" rx="16" fill="${me ? '#d3f5c6' : '#fff'}" stroke="${OL2}" stroke-width="3"/>`;
    lines.forEach((l, i) => o += `<text x="${bx + 18}" y="${top + 38 + i * 32}" font-family="Rubik" font-weight="500" font-size="26" fill="#1a1a1a">${esc(l)}</text>`);
    o += `</g>`;
    yy = top + bh + 12;
  });
  return o;
}
function callScreen(x, y, w, h, t, who) {
  const wig = Math.sin(t * 30) * 4, cx = x + w / 2;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#1f2a4a"/><circle cx="${cx}" cy="${y + 150}" r="${82 + 8 * Math.abs(Math.sin(t * 6))}" fill="#7fd3ff" opacity=".25"/>
   <circle cx="${cx}" cy="${y + 150}" r="70" fill="${MOM}" stroke="${OL2}" stroke-width="6"/><text x="${cx}" y="${y + 290}" font-family="Lilita" font-size="54" fill="#fff" text-anchor="middle" transform="rotate(${wig * 0.3} ${cx} ${y + 270})">${who}</text>
   <text x="${cx}" y="${y + 335}" font-family="Rubik" font-size="26" fill="#9fb4e8" text-anchor="middle">appel entrant…</text>
   <circle cx="${x + w * 0.28}" cy="${y + h - 85}" r="44" fill="#e5484d" stroke="${OL2}" stroke-width="6"/><circle cx="${x + w * 0.72}" cy="${y + h - 85 + wig}" r="44" fill="#2fb36b" stroke="${OL2}" stroke-width="6"/>`;
}
function feedScreen(x, y, w, h, t, A) {
  // des vidéos de stars (silhouettes inventées, une étoile, aucun vrai visage), ses commentaires apparaissent dessous
  let o = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#0f1226"/>`;
  const scroll = A.scroll(t);
  o += `<g transform="translate(0,${-scroll})">`;
  A.posts.forEach((p, i) => {
    const py = y + 20 + i * 330;
    o += `<rect x="${x + 20}" y="${py}" width="${w - 40}" height="220" rx="16" fill="${p.c}" stroke="${OL2}" stroke-width="5"/>
      <circle cx="${x + w / 2}" cy="${py + 95}" r="42" fill="#0d1020" opacity=".6"/><rect x="${x + w / 2 - 50}" y="${py + 140}" width="100" height="70" rx="30" fill="#0d1020" opacity=".6"/>
      <text x="${x + 44}" y="${py + 44}" font-family="Lilita" font-size="30" fill="#ffc93c">★ ${esc(p.name)}</text>`;
    if (t >= p.c1) o += `<g opacity="${ease(kk(t, p.c1, 0.2))}"><rect x="${x + 20}" y="${py + 232}" width="${w - 40}" height="70" rx="14" fill="#1d2247" stroke="#3a4473" stroke-width="3"/>
      <text x="${x + 40}" y="${py + 260}" font-family="Rubik" font-weight="700" font-size="20" fill="#9fb4e8">@lefuturdrake</text><text x="${x + 40}" y="${py + 290}" font-family="Rubik" font-size="26" fill="#fff">écoutez mon son 🔥🔥</text></g>`;
  });
  o += `</g>`;
  return o;
}
function postScreen(x, y, w, h, t, A) {
  // son post : une simple photo de lui (fixe) + le compteur de vues qui reste bloqué
  const views = Math.min(12, Math.floor(kk(t, A.t0, 1.2) * 12));
  let o = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#000"/>`;
  o += `<rect x="${x + 30}" y="${y + 60}" width="${w - 60}" height="${h - 220}" fill="#2b3566"/>`;
  o += S({ x: x + w / 2, y: y + h - 70, h: 420, color: HEROC, hat: true, lw: 9, pose: { la: [110, 95], ra: [70, 85], ll: [100, 100], rl: [80, 80] } });
  o += `<rect x="${x + 30}" y="${y + h - 150}" width="${w - 60}" height="110" fill="#000" opacity=".85"/><text x="${x + 60}" y="${y + h - 90}" font-family="Rubik" font-weight="700" font-size="34" fill="#fff">▶ ${views} vues</text>
   <text x="${x + 60}" y="${y + h - 54}" font-family="Rubik" font-size="24" fill="#9aa6cf">♪ mon son (image fixe)</text>`;
  if (t >= A.t0 + 1.2) o += `<text x="${x + w - 50}" y="${y + h - 90}" font-family="Lilita" font-size="34" fill="#ff6b70" text-anchor="end" opacity="${0.6 + 0.4 * Math.sin(t * 8)}">bloqué</text>`;
  return o;
}

// ------------------------------------------------ le niveau 5
function stalakApp(x, y, w, h, t, A) { // l'appli Stalak dessinée (son, prises, coupes qui se posent sur les temps)
  const k = kk(t, A.tApp, A.tSnip - A.tApp);
  let o = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#eaf4ff"/><rect x="${x}" y="${y}" width="${w}" height="96" fill="${BLUE}"/>
   <image href="assets/icon.svg" x="${x + 20}" y="${y + 14}" width="68" height="68"/><text x="${x + 100}" y="${y + 64}" font-family="Lilita" font-size="44" fill="#fff">stalak</text>`;
  const x0 = x + 30, x1 = x + w - 30, y0 = y + 160;
  o += `<text x="${x0}" y="${y0 - 14}" font-family="Rubik" font-weight="700" font-size="24" fill="${INK}">TON SON</text>`;
  for (let i = 0; i < 70; i++) { const xx = x0 + i * (x1 - x0) / 70, a = 12 + 30 * Math.abs(Math.sin(i * 0.9) * Math.cos(i * 0.23)); o += `<rect x="${xx}" y="${y0 + 34 - a / 2}" width="4" height="${a}" rx="2" fill="${BLUE}"/>`; }
  const grid = [...Array(9).keys()].map(i => x0 + i * (x1 - x0) / 8);
  for (const g of grid) o += `<line x1="${g}" y1="${y0 - 4}" x2="${g}" y2="${y0 + 400}" stroke="#9fb4e8" stroke-width="3" stroke-dasharray="8 8"/>`;
  const cols = ['#1f6fd6', '#7fb8ff', '#0e3f8f'];
  for (let i = 0; i < 3; i++) {
    const yy = y0 + 110 + i * 100;
    o += `<text x="${x0}" y="${yy - 10}" font-family="Rubik" font-weight="700" font-size="22" fill="${INK}">PRISE ${i + 1}</text><rect x="${x0}" y="${yy}" width="${x1 - x0}" height="56" rx="12" fill="#cfdcf5"/>`;
    for (let s = 0; s < 8; s++) if (s % 3 === i) {
      const p = ease(clamp(k * 1.7 - s * 0.08, 0, 1)), from = x0 + ((s * 37) % 8) * 50 + 15;
      o += `<rect x="${lerp(from, grid[s], p)}" y="${yy + 4}" width="${(x1 - x0) / 8 - 6}" height="48" rx="10" fill="${cols[i]}" stroke="${INK}" stroke-width="4"/>`;
    }
  }
  o += `<rect x="${x0}" y="${y0 + 440}" width="${x1 - x0}" height="64" rx="20" fill="${k > 0.7 ? '#2fb36b' : '#fff'}" stroke="${INK}" stroke-width="5"/><text x="${x + w / 2}" y="${y0 + 483}" font-family="Lilita" font-size="32" text-anchor="middle" fill="${k > 0.7 ? '#fff' : INK}">COUPÉ SUR LE RYTHME</text>`;
  return o;
}
function snippet(x, y, w, h, t, A) { // le snippet monté : une prise par mesure, bouche synchro, paroles
  const bs = A.beats; let bi = 0; for (let i = 0; i < bs.length; i++) if (t >= bs[i]) bi = i;
  const lieu = A.lieux[Math.floor(bi / 2) % A.lieux.length];
  const wd = A.words.find(q => t >= q.t0 && t < q.t1);
  const mouth = wd ? Math.abs(Math.sin((t - wd.t0) / (wd.t1 - wd.t0) * Math.PI * wd.syl)) : 0.05;
  let o = clip(x, y, w, h, lieu, mouth, { pose: Math.floor(bi / 2) % 2 ? { la: [200, 240], ra: [-30, -70], ll: [100, 100], rl: [80, 80] } : { la: [120, 70], ra: [60, 110], ll: [100, 100], rl: [80, 80] } });
  const pulse = Math.max(0, 1 - (t - bs[bi]) / 0.25);
  o += `<text x="${x + w - 50}" y="${y + 90}" font-family="Lilita" font-size="${56 + 30 * pulse}" fill="#ffc93c" stroke="${INK}" stroke-width="6" paint-order="stroke" text-anchor="middle">♪</text>`;
  o += `<image href="assets/icon.svg" x="${x + 20}" y="${y + 20}" width="54" height="54" opacity=".85"/>`;
  const cur = A.lines.find(l => t < l.t1) || A.lines[A.lines.length - 1];
  const txt = cur.words.map(q => `<tspan fill="${t >= q.t0 ? (t < q.t1 ? '#ffc93c' : '#fff') : '#7f8bb0'}">${esc(q.w)} </tspan>`).join('');
  o += `<rect x="${x + 16}" y="${y + h - 120}" width="${w - 32}" height="92" rx="18" fill="#0a0d14" opacity=".75"/><text x="${x + w / 2}" y="${y + h - 60}" font-family="Lilita" font-size="${Math.min(40, Math.floor(w / (cur.words.map(q => q.w).join(' ').length * 0.52)))}" text-anchor="middle">${txt}</text>`;
  if (Math.abs(t - bs[bi]) < 0.05) o += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff" opacity=".22"/>`;
  return o;
}
function hearts(x, y, t, t0) {
  let o = '';
  for (let i = 0; i < 6; i++) { const a = (t - t0 - i * 0.18); if (a < 0 || a > 1.4) continue; const p = a / 1.4; o += `<text x="${x + Math.sin(i * 2.1 + a * 3) * 40}" y="${y - p * 260}" font-size="${40 + i * 4}" opacity="${1 - p}" text-anchor="middle">❤️</text>`; }
  return o;
}

// ------------------------------------------------ l'image du temps t
function scene(t) {
  const A = D(), L = A.levels.find(l => t >= l.t0 && t < l.t1) || A.levels[A.levels.length - 1];
  const sh = A.shakes.find(s => t >= s.t && t < s.t + s.d);
  let dx = 0, dy = 0; if (sh) { const k = 1 - (t - sh.t) / sh.d; dx = Math.sin(t * 90) * 16 * sh.a * k; dy = Math.cos(t * 77) * 12 * sh.a * k; }
  let o = `<g transform="translate(${dx},${dy})">`;
  const c = L.coup, k = c ? t - c.t : -1;
  const bob = Math.sin(t * 3) * 4;
  const talking = A.says.some(s => s.who === 'r' && t >= s.t0 && t < s.t1);
  const talkPose2 = { la: [200 + Math.sin(t * 9) * 18, 235], ra: [-20, -60 + Math.sin(t * 9) * 18], ll: [100, 108], rl: [80, 72] };
  const KO = { la: [230, 260], ra: [-40, -80], ll: [115, 130], rl: [60, 30] };

  if (L.n === 1) {
    o += setRue(t);
    // l'inconnu, casquette verte
    const slap = c && k > -0.18 && k < 0.25;
    const sp = slap ? (k < 0 ? ease((k + 0.18) / 0.18) : 1 - ease(k / 0.25)) : 0;
    o += S({ x: 790, y: 1600, h: 560, color: STRANGER, flip: true, pose: { la: [lerp(120, 178, sp), lerp(100, 182, sp)], ra: [60, 80], ll: [100, 105], rl: [80, 75] } }) + cap(790, 1600, 560);
    if (!c || k < 0) {
      o += S({ x: 430, y: 1600 + bob, h: 560, color: HEROC, hat: true, pose: talking ? { la: [200 + Math.sin(t * 9) * 18, 235], ra: [-20, -15], ll: [100, 108], rl: [80, 72] } : { la: [110, 95], ra: [-20, -15], ll: [100, 108], rl: [80, 72] } });
      o += `<path d="M530 1150 q 140 -60 210 -30" stroke="#fff" stroke-width="7" fill="none"/><circle cx="738" cy="1120" r="14" fill="#fff" stroke="${OL2}" stroke-width="6"/>`;
    } else {
      o += S({ x: 350, y: 1600, h: 560, color: HEROC, hat: true, rot: -24, pose: KO });
      if (k > 0.1) o += stars(270, 1010, t);
    }
  }
  if (L.n === 2) {
    const ring = inR(t, A.n2.ring, A.n2.ringEnd);
    o += setChambre(t, ring);
    const px = 540, py = 925, pw = 400, ph = 580;
    const inner = t >= A.n2.ring ? callScreen(px + 16, py + 16, pw - 32, ph - 32, t, 'MAMAN') : chatScreen(px + 16, py + 16, pw - 32, ph - 32, A.n2.msgs, t, 'FAMILLE ❤️', 5);
    o += phoneFrame(px, py, pw, ph, inner);
    // la claquette qui traverse la porte
    if (c && k > -0.5 && k < 0) { const p = easeIn((k + 0.5) / 0.5); o += `<g transform="translate(${lerp(150, 330, p)},${lerp(1150, 1000, p)}) rotate(${p * 720})"><ellipse cx="0" cy="0" rx="70" ry="30" fill="#2b2f3a" stroke="${OL2}" stroke-width="9"/><path d="M-30 -10 q 30 -40 60 0" stroke="#e5484d" stroke-width="14" fill="none"/></g>`; }
    if (c && k >= -0.5 && k < 0) o += `<rect x="40" y="900" width="230" height="660" fill="#fff" opacity="${0.25 * (1 - kk(t, c.t - 0.5, 0.2))}"/>`;
    if (!c || k < 0) o += S({ x: 320, y: 1600 + bob, h: 540, color: HEROC, hat: true, phone: true, pose: talking ? { la: [200 + Math.sin(t * 9) * 18, 235], ra: [-30, -50], ll: [100, 108], rl: [80, 72] } : { la: [110, 95], ra: [-30, -50], ll: [100, 108], rl: [80, 72] } });
    else {
      o += S({ x: 330, y: 1600, h: 540, color: HEROC, hat: true, rot: 18, pose: KO });
      o += `<g transform="translate(300,1010) rotate(25)"><ellipse cx="0" cy="0" rx="70" ry="30" fill="#2b2f3a" stroke="${OL2}" stroke-width="9"/><path d="M-30 -10 q 30 -40 60 0" stroke="#e5484d" stroke-width="14" fill="none"/></g>`;
      if (k > 0.1) o += stars(340, 990, t);
    }
  }
  if (L.n === 3 || L.n === 4) {
    o += setBureau(t);
    const px = 500, py = 925, pw = 440, ph = 580;
    const inner = L.n === 3 ? feedScreen(px + 16, py + 16, pw - 32, ph - 32, t, Object.assign({}, A.n3, { scroll: tt => 330 * clamp((tt - A.n3.t0) / 3.2, 0, 1) })) : postScreen(px + 16, py + 16, pw - 32, ph - 32, t, A.n4);
    o += phoneFrame(px, py, pw, ph, inner);
    if (L.n === 3 && c && k > -0.45) { // la notification « compte bloqué » sort de l'écran et lui arrive dessus
      const p = ease(clamp((k + 0.45) / 0.45, 0, 1));
      const x = lerp(740, 300, p), y = lerp(1100, 1000, p), s = lerp(0.5, 1.15, p);
      o += `<g transform="translate(${x},${y}) scale(${s}) rotate(${-8 * p})"><rect x="-230" y="-70" width="460" height="140" rx="24" fill="#fff" stroke="${OL2}" stroke-width="9"/><circle cx="-170" cy="0" r="36" fill="#e5484d" stroke="${OL2}" stroke-width="6"/><text x="-170" y="14" font-family="Lilita" font-size="44" fill="#fff" text-anchor="middle">!</text>
        <text x="-110" y="-8" font-family="Rubik" font-weight="800" font-size="30" fill="${INK}">Compte bloqué</text><text x="-110" y="32" font-family="Rubik" font-size="26" fill="#5b6378">pour spam</text></g>`;
    }
    const sit = { la: [60, -10], ra: [40, -20], ll: [10, 90], rl: [20, 95] };
    if (!c || k < 0) o += S({ x: 300, y: 1600 + bob * 0.5, h: 540, color: HEROC, hat: true, pose: talking ? { la: [200 + Math.sin(t * 9) * 18, 235], ra: [10, -10], ll: [100, 108], rl: [80, 72] } : { la: [110, 95], ra: [10, -10], ll: [100, 108], rl: [80, 72] } });
    else { o += S({ x: 290, y: 1600, h: 540, color: HEROC, hat: true, rot: L.n === 3 ? -20 : 0, sy: L.n === 4 ? 0.62 : 1, sx: L.n === 4 ? 1.15 : 1, pose: KO }); if (k > 0.1) o += stars(260, L.n === 4 ? 1180 : 1000, t); }
  }
  if (L.n === 5) o += level5(t, A, L);
  o += `</g>`;
  // lumière ambiante + vignette sur la scène
  o += `<rect x="0" y="${TOPH}" width="1080" height="${1920 - TOPH}" fill="${['', '#3b6dff', '#ff9a5a', '#4f8dff', '#4f8dff', '#ffc93c'][L.n]}" opacity=".07"/>`;
  o += `<rect x="0" y="${TOPH}" width="1080" height="${1920 - TOPH}" fill="url(#vig)"/>`;
  for (const h of A.hits) if (t >= h.t && t < h.t + 0.75) { const q = (t - h.t) / 0.75; o += boom(h.x, h.y, h.word, -8, q < 0.15 ? lerp(0.3, 1.1, q / 0.15) : q < 0.3 ? lerp(1.1, 1, (q - .15) / .15) : 1); }
  document.getElementById('scene').innerHTML = o;
}

function level5(t, A, L) {
  const N = A.n5; let o = `<rect x="0" y="${TOPH}" width="1080" height="${1920 - TOPH}" fill="#121633"/><circle cx="540" cy="1200" r="600" fill="url(#halo)" opacity=".18"/>`;
  if (t < N.tApp) {
    N.lieux.forEach((lieu, i) => { const ti = N.tPrises + i * 0.55; if (t < ti) return; const k = ease(kk(t, ti, 0.3)), x = 75 + i * 290, y = 935 + (1 - k) * 60;
      o += `<g opacity="${k}">` + phoneFrame(x, y, 260, 470, clip(x + 16, y + 16, 228, 438, lieu, Math.abs(Math.sin(t * 9)) * 0.7)) + `<circle cx="${x + 230}" cy="${y + 50}" r="12" fill="#e5484d"/><rect x="${x + 35}" y="${y + 490}" width="190" height="54" rx="14" fill="#fff" stroke="${INK}" stroke-width="5"/><text x="${x + 130}" y="${y + 528}" font-family="Lilita" font-size="34" text-anchor="middle" fill="${INK}">PRISE ${i + 1}</text></g>`; });
    return o;
  }
  if (t < N.tSnip) return o + phoneFrame(300, 935, 480, 590, stalakApp(316, 951, 448, 558, t, N));
  if (t < N.tPub) return o + phoneFrame(300, 935, 480, 590, snippet(316, 951, 448, 558, t, N));
  if (t < N.tBack) { // publié partout : 3 téléphones, des cœurs qui montent
    for (let i = 0; i < 3; i++) { const ti = N.tPub + i * 0.25, k = ease(kk(t, ti, 0.3)), x = 75 + i * 290, y = 935 + (1 - k) * 80;
      o += `<g opacity="${k}">` + phoneFrame(x, y, 260, 470, snippet(x + 16, y + 16, 228, 438, N.tSnip + 0.6 + i * 0.4, N)) + hearts(x + 200, y + 380, t, ti + 0.2) + `</g>`; }
    o += `<text x="540" y="1495" font-family="Lilita" font-size="56" fill="#fff" stroke="${INK}" stroke-width="10" paint-order="stroke" text-anchor="middle">PUBLIÉ PARTOUT</text>`;
    return o;
  }
  // les personnages d'avant reviennent : l'inconnu danse (gauche), le groupe de la famille (droite)
  o += `<g>` + setRue(t).replace(`<rect x="0" y="${TOPH}" width="1080"`, `<rect x="0" y="${TOPH}" width="540"`) + `</g>`;
  o += `<rect x="540" y="${TOPH}" width="540" height="${1920 - TOPH}" fill="#2a2450"/><line x1="540" y1="${TOPH}" x2="540" y2="1920" stroke="${OL2}" stroke-width="${LW2}"/>`;
  const d = Math.sin(t * 9);
  o += S({ x: 270, y: 1600 + Math.abs(d) * -30, h: 520, color: STRANGER, flip: true, rot: d * 8, pose: { la: [200 + d * 40, 250], ra: [-20 - d * 40, -70], ll: [100 + d * 15, 110], rl: [80 - d * 15, 70] } }) + cap(270, 1600 + Math.abs(d) * -30, 520);
  o += `<text x="270" y="960" font-family="Lilita" font-size="60" fill="#ffc93c" stroke="${INK}" stroke-width="8" paint-order="stroke" text-anchor="middle" transform="rotate(${d * 10} 270 960)">♪ ♪</text>`;
  o += phoneFrame(560, 925, 400, 580, chatScreen(576, 941, 368, 548, N.chat, t, 'FAMILLE ❤️'));
  return o;
}
