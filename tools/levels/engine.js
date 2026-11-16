// Moteur d'animation LEVELS (style D) : dessine l'image du temps t à partir de la timeline (window.TL).
// Tout est dessiné en code. Utilisé par engine.html et tools/levels/fabrique.py.
const INK = '#0a0d14', BLUE = '#1f6fd6', ICE = '#d6ecff', LINE = '#151a2c';
const W = 1080, H = 1920;
const HERO = '#f7f8fc', VID = '#4a5275';
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const ease = x => 1 - Math.pow(1 - clamp(x, 0, 1), 3);
const easeIn = x => Math.pow(clamp(x, 0, 1), 2);
const lerp = (a, b, k) => a + (b - a) * k;
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ---------------------------------------------------------------- décor (dessiné une seule fois)
function decorSVG() {
  let o = `<defs>
  <radialGradient id="halo"><stop offset="0" stop-color="#fff3c4" stop-opacity=".95"/><stop offset=".35" stop-color="#ffd76a" stop-opacity=".35"/><stop offset="1" stop-color="#ffd76a" stop-opacity="0"/></radialGradient>
  <radialGradient id="vig" cx=".5" cy=".55" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></radialGradient>
  <radialGradient id="doorlight"><stop offset="0" stop-color="#fff6d8" stop-opacity="1"/><stop offset=".5" stop-color="#ffd76a" stop-opacity=".6"/><stop offset="1" stop-color="#ffd76a" stop-opacity="0"/></radialGradient>
  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="rim" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur in="SourceAlpha" stdDeviation="9" result="bl"/><feFlood flood-color="#dfe6ff" flood-opacity=".35" result="fl"/><feComposite in="fl" in2="bl" operator="in" result="gl"/><feMerge><feMergeNode in="gl"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="blur8"><feGaussianBlur stdDeviation="8"/></filter>
  <filter id="blur3"><feGaussianBlur stdDeviation="3"/></filter>
  </defs>
  <rect width="1080" height="1920" fill="#0d1328"/>`;
  const bc = ['#3a2a35', '#43303a', '#2f2836', '#4a3540', '#352c3d', '#3e2f2f', '#2a2533'];
  for (let r = 0; r < 44; r++) {
    const y = 640 + r * 26, off = (r % 2) * 38;
    for (let x = -40; x < 1100; x += 76) {
      const c = bc[(r * 7 + ((x + off) / 76 | 0) * 3) % bc.length];
      o += `<rect x="${x + off}" y="${y}" width="72" height="22" rx="3" fill="${c}"/>`;
    }
  }
  o += `<rect x="560" y="820" width="380" height="690" rx="12" fill="#0a0e1d"/>
   <rect x="585" y="845" width="330" height="665" rx="8" fill="#141a33" stroke="#232b4a" stroke-width="6"/>`;
  o += `<rect x="560" y="700" width="380" height="100" rx="18" fill="#1b0c14" stroke="#0a0e1d" stroke-width="8"/>
   <text x="750" y="772" font-family="Lilita" font-size="66" fill="#ff5a6a" text-anchor="middle" filter="url(#glow)">POUR TOI</text>
   <ellipse cx="750" cy="760" rx="300" ry="120" fill="#ff3b5c" opacity=".10"/>`;
  for (const x of [470, 1030]) o += `<circle cx="${x}" cy="900" r="170" fill="url(#halo)" opacity=".45"/><rect x="${x - 18}" y="880" width="36" height="46" rx="8" fill="#fff1c2" stroke="#0a0e1d" stroke-width="6"/>`;
  o += `<rect x="0" y="1500" width="1080" height="420" fill="#141a30"/><rect x="0" y="1500" width="1080" height="18" fill="#232b4a"/>
   <ellipse cx="750" cy="1600" rx="240" ry="26" fill="#ff5a6a" opacity=".12"/>`;
  for (let x = 0; x < 1080; x += 160) o += `<line x1="${x}" y1="1518" x2="${x - 60}" y2="1920" stroke="#1b2240" stroke-width="5"/>`;
  return o;
}

// ---------------------------------------------------------------- personnages
const L2 = (a, len) => [Math.cos(a * Math.PI / 180) * len, Math.sin(a * Math.PI / 180) * len];
function limb(sx, sy, [a1, a2], len) { const [x1, y1] = L2(a1, len), [x2, y2] = L2(a2, len); return [`M${sx} ${sy} l${x1} ${y1} l${x2} ${y2}`, sx + x1 + x2, sy + y1 + y2]; }
// o : x, y (pieds), h, color, pose {la, ra, ll, rl}, rot, sx, sy, hat, flip, eyesPop, mouth (0..1, pour le snippet), mask
function stick(o) {
  const c = o.color, h = o.h || 520, lw = 6;
  const head = h * 0.17, neckY = -h * 0.66, hipY = -h * 0.30;
  const P = Object.assign({ la: [110, 95], ra: [70, 85], ll: [100, 108], rl: [80, 72] }, o.pose || {});
  const arm = h * 0.20, leg = h * 0.25, limbW = h * 0.078, torsoW = h * 0.15;
  const sh = neckY + h * 0.05;
  const [la, lhx, lhy] = limb(-torsoW * 0.32, sh, P.la, arm), [ra, rhx, rhy] = limb(torsoW * 0.32, sh, P.ra, arm);
  const [ll] = limb(-limbW * 0.55, hipY, P.ll, leg), [rl] = limb(limbW * 0.55, hipY, P.rl, leg);
  const limbs = [la, ra, ll, rl].join(' ');
  const td = `M0 ${neckY + torsoW * 0.35} L0 ${hipY}`;
  const hy = neckY - head * 0.9;
  let g = `<g transform="translate(${o.x},${o.y}) rotate(${o.rot || 0}) scale(${(o.flip ? -1 : 1) * (o.sx || 1)},${o.sy || 1})">`;
  g += `<g filter="url(#rim)">`;
  g += `<path d="${limbs}" stroke="${LINE}" stroke-width="${limbW + lw * 2}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  g += `<path d="${td}" stroke="${LINE}" stroke-width="${torsoW + lw * 2}" stroke-linecap="round" fill="none"/>`;
  g += `<path d="${limbs}" stroke="${c}" stroke-width="${limbW}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
  g += `<path d="${td}" stroke="${c}" stroke-width="${torsoW}" stroke-linecap="round" fill="none"/>`;
  g += `<circle cx="0" cy="${hy}" r="${head}" fill="${o.mask ? '#1b1f2b' : c}" stroke="${LINE}" stroke-width="${lw}"/>`;
  g += `</g>`;
  if (o.mask) g += `<rect x="${-head * 0.6}" y="${hy - head * 0.25}" width="${head * 1.2}" height="${head * 0.32}" rx="${head * 0.16}" fill="#e9ecf5"/><circle cx="${-head * 0.25}" cy="${hy - head * 0.09}" r="${head * 0.09}" fill="${LINE}"/><circle cx="${head * 0.25}" cy="${hy - head * 0.09}" r="${head * 0.09}" fill="${LINE}"/>`;
  if (o.mouth !== undefined) { // seulement dans le snippet (vue rapprochée) : yeux + bouche synchro
    g += `<ellipse cx="${-head * 0.32}" cy="${hy - head * 0.12}" rx="${head * 0.09}" ry="${head * 0.14}" fill="${LINE}"/><ellipse cx="${head * 0.32}" cy="${hy - head * 0.12}" rx="${head * 0.09}" ry="${head * 0.14}" fill="${LINE}"/>`;
    g += `<ellipse cx="0" cy="${hy + head * 0.42}" rx="${head * 0.26}" ry="${head * (0.05 + 0.24 * o.mouth)}" fill="#3a1820" stroke="${LINE}" stroke-width="4"/>`;
  }
  if (o.eyesPop) {
    const p = o.eyesPop;
    for (const s of [-1, 1]) g += `<line x1="${s * head * 0.3}" y1="${hy}" x2="${s * head * (0.3 + 0.5 * p)}" y2="${hy - head * 0.9 * p}" stroke="${LINE}" stroke-width="5"/><circle cx="${s * head * (0.3 + 0.5 * p)}" cy="${hy - head * 0.9 * p}" r="${head * 0.32}" fill="#fff" stroke="${LINE}" stroke-width="5"/><circle cx="${s * head * (0.3 + 0.5 * p)}" cy="${hy - head * 0.9 * p}" r="${head * 0.11}" fill="${LINE}"/>`;
  }
  if (o.hat) {
    g += `<path d="M${-head * 1.02} ${hy - head * 0.15} Q ${-head} ${hy - head * 1.35} 0 ${hy - head * 1.3} Q ${head} ${hy - head * 1.35} ${head * 1.02} ${hy - head * 0.15} Z" fill="${BLUE}" stroke="${LINE}" stroke-width="6"/>`;
    g += `<rect x="${-head * 1.1}" y="${hy - head * 0.4}" width="${head * 2.2}" height="${head * 0.38}" rx="10" fill="${ICE}" stroke="${LINE}" stroke-width="6"/>`;
    g += `<circle cx="0" cy="${hy - head * 1.42}" r="${head * 0.26}" fill="${ICE}" stroke="${LINE}" stroke-width="6"/>`;
    g += `<path d="M${-head * 0.7} ${neckY + 8} q ${head * 0.7} ${head * 0.35} ${head * 1.4} 0 l -10 ${head * 0.9} l -22 -6 l 6 -${head * 0.6}" fill="${BLUE}" stroke="${LINE}" stroke-width="6" stroke-linejoin="round"/>`;
  }
  if (o.videur) {
    g += `<rect x="${-head * 0.85}" y="${hy - head * 0.35}" width="${head * 1.7}" height="${head * 0.45}" rx="12" fill="#0a0d14"/><rect x="${-head * 0.7}" y="${hy - head * 0.28}" width="${head * 0.4}" height="${head * 0.1}" rx="4" fill="#5d6890"/>`;
    g += `<path d="M${head * 0.95} ${hy + head * 0.1} q 22 30 6 70" stroke="#0a0d14" stroke-width="6" fill="none"/>`;
  }
  if (o.phone) g += `<rect x="${rhx - 26}" y="${rhy - 44}" width="52" height="88" rx="9" fill="${INK}" stroke="#3a4473" stroke-width="4"/><rect x="${rhx - 19}" y="${rhy - 36}" width="38" height="66" rx="5" fill="#9fd2ff"/>`;
  g += '</g>';
  return g;
}

// ---------------------------------------------------------------- habillage
function hud(genre, lvl, label, ok, hype, caseState) {
  let o = `<g font-family="Lilita" text-anchor="middle">
  <text x="540" y="235" font-size="62" fill="#fff" stroke="${INK}" stroke-width="10" paint-order="stroke">COMMENT POSTER TON SNIPPET</text></g>`;
  const gw = genre.length * 36 + 60, tw = 375 + 22 + gw, x0 = 540 - tw / 2;
  o += `<text x="${x0}" y="315" font-family="Lilita" font-size="62" fill="#fff" stroke="${INK}" stroke-width="10" paint-order="stroke">POUR UN SON</text>`;
  o += `<g transform="translate(${x0 + 397},262)"><rect x="8" y="8" width="${gw}" height="74" rx="18" fill="${INK}"/><rect width="${gw}" height="74" rx="18" fill="${BLUE}" stroke="${INK}" stroke-width="6"/>
  <text x="${gw / 2}" y="56" font-family="Lilita" font-size="52" fill="#fff" text-anchor="middle">${esc(genre)}</text></g>`;
  for (let i = 1; i <= 5; i++) {
    const st = caseState[i - 1];
    const col = st === 'ko' ? '#e5484d' : st === 'ok' ? '#2fb36b' : st === 'cur' ? '#ffc93c' : '#ffffff';
    const x = 540 + (i - 3) * 92 - 36;
    o += `<rect x="${x + 6}" y="381" width="72" height="72" rx="14" fill="${INK}"/><rect x="${x}" y="375" width="72" height="72" rx="14" fill="${col}" stroke="${INK}" stroke-width="6"/>
    <text x="${x + 36}" y="427" font-family="Lilita" font-size="46" text-anchor="middle" fill="${st && st !== 'cur' ? '#fff' : INK}">${i}</text>`;
  }
  if (label) {
    const lw = Math.min(900, label.length * 20 + 110);
    o += `<g transform="translate(${540 - lw / 2},475)"><rect x="6" y="6" width="${lw}" height="66" rx="33" fill="${INK}"/><rect width="${lw}" height="66" rx="33" fill="#fff" stroke="${INK}" stroke-width="5"/>
    <text x="44" y="46" font-family="Rubik" font-weight="700" font-size="40" fill="${ok ? '#2fb36b' : '#e5484d'}" text-anchor="middle">${ok ? '✓' : '✗'}</text>
    <text x="${lw / 2 + 22}" y="45" font-family="Rubik" font-weight="700" font-size="34" fill="${INK}" text-anchor="middle">${esc(label)}</text></g>`;
  }
  o += `<g transform="translate(280,575)"><text x="-14" y="34" font-family="Lilita" font-size="34" text-anchor="end" fill="#fff" stroke="${INK}" stroke-width="6" paint-order="stroke">HYPE</text>
  <rect width="520" height="40" rx="20" fill="#fff" stroke="${INK}" stroke-width="5"/>
  <rect x="5" y="5" width="${Math.max(30, 510 * hype)}" height="30" rx="15" fill="${hype >= 0.999 ? '#ffc93c' : hype > .5 ? '#2fb36b' : '#e5484d'}"/>
  ${hype >= 0.999 ? `<text x="545" y="34" font-family="Lilita" font-size="36" fill="#ffc93c" stroke="${INK}" stroke-width="6" paint-order="stroke">MAX</text>` : ''}</g>`;
  return o;
}

function wrap(text, maxChars) {
  const words = text.split(' '); const lines = []; let cur = '';
  for (const w of words) { if ((cur + ' ' + w).trim().length > maxChars && cur) { lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); }
  if (cur) lines.push(cur); return lines;
}
// bulle : le texte s'écrit au rythme de la voix (k de 0 à 1)
function bubble(x, y, w, text, tailX, k, opts = {}) {
  const fs = opts.fs || 40, maxC = Math.floor((w - 50) / (fs * 0.55));
  const full = wrap(text, maxC); const n = Math.max(1, Math.round(text.length * clamp(k, 0, 1)));
  let left = n; const shown = full.map(l => { const s = l.slice(0, Math.max(0, left)); left -= l.length + 1; return s; });
  const h = full.length * fs * 1.22 + 40;
  const y0 = y - h; // y = bas de la bulle
  let o = `<g><rect x="${x + 8}" y="${y0 + 8}" width="${w}" height="${h}" rx="26" fill="${INK}"/>
  <rect x="${x}" y="${y0}" width="${w}" height="${h}" rx="26" fill="${opts.fill || '#fff'}" stroke="${INK}" stroke-width="6"/>`;
  if (tailX !== null) o += `<path d="M${tailX - 18} ${y - 3} L${tailX} ${y + 34} L${tailX + 20} ${y - 3}" fill="${opts.fill || '#fff'}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/><rect x="${tailX - 15}" y="${y - 9}" width="32" height="10" fill="${opts.fill || '#fff'}"/>`;
  if (opts.tag) o += `<rect x="${x + 18}" y="${y0 - 22}" width="${opts.tag.length * 17 + 30}" height="40" rx="12" fill="${BLUE}" stroke="${INK}" stroke-width="4"/><text x="${x + 33}" y="${y0 + 7}" font-family="Lilita" font-size="28" fill="#fff">${opts.tag}</text>`;
  shown.forEach((l, i) => { o += `<text x="${x + w / 2}" y="${y0 + 20 + fs + i * fs * 1.22 - 6}" font-family="Rubik" font-weight="700" font-size="${fs}" fill="${INK}" text-anchor="middle">${esc(l)}</text>`; });
  return o + '</g>';
}

function boom(x, y, word, rot, s) {
  let pts = ''; for (let i = 0; i < 24; i++) { const r = i % 2 ? 95 : 180, a = i * Math.PI / 12; pts += `${x + Math.cos(a) * r * 1.25},${y + Math.sin(a) * r} `; }
  return `<g transform="translate(${x},${y}) scale(${s}) rotate(${rot}) translate(${-x},${-y})"><polygon points="${pts}" transform="translate(10,10)" fill="${INK}"/><polygon points="${pts}" fill="#ffc93c" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>
  <text x="${x}" y="${y + 30}" font-family="Lilita" font-size="${word.length > 6 ? 70 : 92}" fill="#e5484d" stroke="${INK}" stroke-width="8" paint-order="stroke" text-anchor="middle">${esc(word)}</text></g>`;
}
function stars(cx, cy, t) {
  let o = `<ellipse cx="${cx}" cy="${cy}" rx="110" ry="30" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="10 12" opacity=".8"/>`;
  for (let i = 0; i < 3; i++) {
    const a = t * 7 + i * 2.09, x = cx + Math.cos(a) * 105, y = cy + Math.sin(a) * 28; let p = '';
    for (let j = 0; j < 10; j++) { const r = j % 2 ? 11 : 26, b = -Math.PI / 2 + j * Math.PI / 5; p += `${x + Math.cos(b) * r},${y + Math.sin(b) * r} `; }
    o += `<polygon points="${p}" fill="#ffc93c" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`;
  }
  return o;
}
function bigLevel(n, k) { // 0..1 sur 0,6 s
  const s = k < 0.25 ? lerp(0.4, 1.15, k / 0.25) : k < 0.4 ? lerp(1.15, 1, (k - .25) / .15) : 1;
  const op = k > 0.8 ? (1 - k) / 0.2 : 1;
  return `<g opacity="${op}" transform="translate(540,1180) scale(${s}) rotate(-6)"><text x="10" y="70" font-family="Lilita" font-size="190" fill="${INK}" text-anchor="middle" opacity=".9">NIVEAU ${n}</text>
  <text x="0" y="60" font-family="Lilita" font-size="190" fill="#ffc93c" stroke="${INK}" stroke-width="14" paint-order="stroke" text-anchor="middle">NIVEAU ${n}</text></g>`;
}

// ---------------------------------------------------------------- accessoires
const PROPS = {
  enclume: (x, y) => `<g filter="url(#rim)"><path d="M${x - 170} ${y - 60} h340 q -40 0 -70 50 h -40 v 80 h 90 v 50 h -260 v -50 h 90 v -80 h -40 q -30 -50 -70 -50 z" fill="#5b6378" stroke="${LINE}" stroke-width="6"/></g>`,
  poele: (x, y) => `<g filter="url(#rim)"><rect x="${x + 100}" y="${y - 22}" width="230" height="44" rx="20" fill="#3b2a22" stroke="${LINE}" stroke-width="6"/><circle cx="${x}" cy="${y}" r="160" fill="#2b2f3a" stroke="${LINE}" stroke-width="6"/><circle cx="${x}" cy="${y}" r="118" fill="#3b4150"/></g>`,
  parapluie: (x, y) => `<g filter="url(#rim)"><path d="M${x - 200} ${y} q 200 -220 400 0 q -50 -32 -100 0 q -50 -32 -100 0 q -50 -32 -100 0 q -50 -32 -100 0 z" fill="${BLUE}" stroke="${LINE}" stroke-width="6"/><path d="M${x} ${y} v 220 q 0 44 -44 32" stroke="${LINE}" stroke-width="10" fill="none" stroke-linecap="round"/></g>`,
  boule: (x, y) => `<g filter="url(#rim)"><circle cx="${x}" cy="${y}" r="190" fill="#f4f8ff" stroke="${LINE}" stroke-width="6"/></g>${[[-60, -40], [50, 30], [-20, 90], [80, -70]].map(([a, b]) => `<circle cx="${x + a}" cy="${y + b}" r="16" fill="#d6e2f5"/>`).join('')}`,
  potcoeur: (x, y) => `<g filter="url(#rim)"><path d="M${x} ${y + 80} l -130 -130 a 75 75 0 0 1 130 -90 a 75 75 0 0 1 130 90 z" fill="#e85a7a" stroke="${LINE}" stroke-width="6"/><path d="M${x} ${y - 140} q -10 -60 30 -110" stroke="#2f8a4a" stroke-width="10" fill="none" stroke-linecap="round"/><circle cx="${x + 30}" cy="${y - 255}" r="26" fill="#ffd76a" stroke="${LINE}" stroke-width="5"/></g>`,
  piano: (x, y) => `<g filter="url(#rim)"><path d="M${x - 240} ${y - 50} h 310 q 170 0 170 120 q 0 70 -95 70 h -385 z" fill="#14161f" stroke="#3a4473" stroke-width="6"/><rect x="${x - 240}" y="${y + 50}" width="350" height="34" fill="#f4f8ff" stroke="${LINE}" stroke-width="4"/>${[0, 1, 2, 3, 4, 5, 6].map(k => `<rect x="${x - 228 + k * 48}" y="${y + 50}" width="24" height="20" fill="#14161f"/>`).join('')}<rect x="${x - 215}" y="${y + 140}" width="18" height="120" fill="#14161f"/><rect x="${x + 120}" y="${y + 140}" width="18" height="120" fill="#14161f"/></g>`,
  cadre: (x, y) => `<g filter="url(#rim)"><rect x="${x - 190}" y="${y - 230}" width="380" height="470" fill="none" stroke="#8a6a4a" stroke-width="36"/><rect x="${x - 190}" y="${y - 230}" width="380" height="470" fill="none" stroke="${LINE}" stroke-width="6"/></g>`,
  affaires: (x, y) => `<g filter="url(#rim)"><rect x="${x - 190}" y="${y - 40}" width="210" height="160" rx="18" fill="#4a5275" stroke="${LINE}" stroke-width="6"/><rect x="${x - 125}" y="${y - 72}" width="84" height="36" rx="12" fill="none" stroke="${LINE}" stroke-width="8"/><path d="M${x + 40} ${y - 120} q 60 -30 120 0 l 20 70 l -40 0 l 0 140 l -100 0 l 0 -140 l -40 0 z" fill="#c43b4a" stroke="${LINE}" stroke-width="6"/><rect x="${x - 100}" y="${y + 120}" width="210" height="62" rx="26" fill="#2b2f3a" stroke="${LINE}" stroke-width="6"/></g>`,
  haltere: (x, y) => `<g filter="url(#rim)"><rect x="${x - 210}" y="${y - 22}" width="420" height="44" rx="12" fill="#9aa3b8" stroke="${LINE}" stroke-width="6"/><rect x="${x - 240}" y="${y - 120}" width="70" height="240" rx="18" fill="#2b2f3a" stroke="${LINE}" stroke-width="6"/><rect x="${x + 170}" y="${y - 120}" width="70" height="240" rx="18" fill="#2b2f3a" stroke="${LINE}" stroke-width="6"/></g>`,
  banc: (x, y) => `<g filter="url(#rim)"><rect x="${x - 220}" y="${y}" width="440" height="56" rx="14" fill="#c43b4a" stroke="${LINE}" stroke-width="6"/>${[-170, 170].map(d => `<rect x="${x + d - 14}" y="${y + 56}" width="28" height="150" fill="#5b6378" stroke="${LINE}" stroke-width="5"/>`).join('')}<rect x="${x + 120}" y="${y - 240}" width="28" height="240" fill="#5b6378" stroke="${LINE}" stroke-width="5"/><rect x="${x - 80}" y="${y - 250}" width="300" height="20" rx="10" fill="#9aa3b8" stroke="${LINE}" stroke-width="5"/></g>`,
};

// ---------------------------------------------------------------- écrans de téléphone (niveaux 3, 4, 5)
function phoneFrame(x, y, w, h, inner) {
  return `<g><rect x="${x + 12}" y="${y + 12}" width="${w}" height="${h}" rx="46" fill="${INK}" opacity=".7"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="46" fill="${INK}" stroke="#3a4473" stroke-width="5"/>
  <clipPath id="scr${x}${y}"><rect x="${x + 16}" y="${y + 16}" width="${w - 32}" height="${h - 32}" rx="32"/></clipPath><g clip-path="url(#scr${x}${y})">${inner}</g></g>`;
}
// la « vidéo » du rappeur dans le téléphone : un lieu, le rappeur en plan rapproché, la bouche
function clip(x, y, w, h, lieu, mouth, extra = {}) {
  const bg = { capot: '#2a1d3d', immeuble: '#1b2546', porte: '#1a1430', banc: '#1d3524', reverbere: '#141a33', neige: '#2a3c66', bus: '#1e2a4a', toit: '#23224a', pont: '#1c2b3b', traction: '#1d3524', rue: '#262a44', noir: '#000' }[lieu] || '#1b2546';
  let o = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${bg}"/>`;
  const gx = x + w / 2, gy = y + h;
  if (lieu === 'capot') o += `<path d="M${x} ${gy - 160} q ${w * 0.3} -120 ${w * 0.6} -120 h ${w * 0.4} v 280 h ${-w} z" fill="#c43b4a" stroke="${LINE}" stroke-width="6"/><circle cx="${x + w * 0.85}" cy="${gy - 200}" r="26" fill="#fff3c4" filter="url(#glow)"/>`;
  if (lieu === 'immeuble' || lieu === 'toit') for (let i = 0; i < 4; i++) for (let j = 0; j < 5; j++) o += `<rect x="${x + 30 + i * (w / 4)}" y="${y + 40 + j * 120}" width="${w / 8}" height="70" fill="${(i + j) % 3 ? '#ffd76a' : '#2b3566'}" opacity=".8"/>`;
  if (lieu === 'porte') o += `<rect x="${x + w * 0.25}" y="${y + 80}" width="${w * 0.5}" height="${h}" fill="#141a33" stroke="#232b4a" stroke-width="6"/><text x="${gx}" y="${y + 60}" font-family="Lilita" font-size="44" fill="#ff5a6a" text-anchor="middle" filter="url(#glow)">POUR TOI</text>`;
  if (lieu === 'reverbere' || lieu === 'bus' || lieu === 'rue') o += `<circle cx="${x + w * 0.8}" cy="${y + 140}" r="160" fill="url(#halo)" opacity=".6"/><rect x="${x + w * 0.8 - 8}" y="${y + 140}" width="16" height="${h}" fill="#2a3b6b"/>`;
  if (lieu === 'banc') o += `<rect x="${x}" y="${gy - 140}" width="${w}" height="30" fill="#7a5b3d"/><circle cx="${x + w * 0.2}" cy="${y + 160}" r="120" fill="#2f6b3a"/>`;
  if (lieu === 'neige') for (let i = 0; i < 40; i++) o += `<circle cx="${x + (i * 97) % w}" cy="${y + (i * 211) % h}" r="${3 + i % 3}" fill="#fff" opacity=".8"/>`;
  if (lieu === 'pont') o += `<path d="M${x - 20} ${y + h * 0.45} q ${w / 2} -160 ${w + 40} 0" stroke="#5b6378" stroke-width="22" fill="none"/>`;
  if (lieu === 'traction') o += `<rect x="${x + 40}" y="${y + 120}" width="${w - 80}" height="18" rx="9" fill="#9aa3b8"/>`;
  const fig = stick({ x: gx, y: gy + h * 0.28, h: h * 1.05, color: HERO, hat: !extra.mask, mask: extra.mask, mouth: mouth, pose: extra.pose || { la: [120, 70], ra: [60, 110], ll: [100, 100], rl: [80, 80] } });
  o += fig;
  if (extra.blur) o = `<g filter="url(#blur8)">${o}</g>`;
  if (extra.tint) o += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${extra.tint}" opacity=".45"/>`;
  return o;
}

// ---------------------------------------------------------------- l'image du temps t
function at(list, t) { return list.find(e => t >= e.t0 && t < e.t1); }
function draw(t) {
  const T = window.TL, ep = T.ep;
  let o = '';
  // niveau courant
  const lv = T.levels.find(l => t >= l.t0 && t < l.t1) || T.levels[T.levels.length - 1];
  const n = lv.n, lt = t - lv.t0;
  const caseState = [1, 2, 3, 4, 5].map(i => i < n ? 'ko' : i === n ? (n === 5 && t >= T.win ? 'ok' : 'cur') : '');
  let hype = 0.08 + 0.02 * (n - 1);
  if (n === 5) hype = t < T.win ? lerp(0.16, 0.6, clamp((t - lv.t0) / (T.win - lv.t0), 0, 1)) : lerp(0.6, 1, ease((t - T.win) / 0.6));
  // secousse
  const sh = T.shakes.find(s => t >= s.t && t < s.t + s.d);
  let dx = 0, dy = 0;
  if (sh) { const k = 1 - (t - sh.t) / sh.d; dx = Math.sin(t * 90) * 18 * sh.a * k; dy = Math.cos(t * 77) * 14 * sh.a * k; }
  o += `<g transform="translate(${dx},${dy})">`;
  // porte ouverte au niveau 5
  if (t >= T.door) {
    const k = ease((t - T.door) / 0.6);
    o += `<rect x="585" y="845" width="330" height="665" fill="#fff6d8" opacity="${0.85 * k}"/><circle cx="750" cy="1150" r="${420 * k}" fill="url(#doorlight)" opacity="${0.8 * k}"/>`;
  }
  // corde
  const ropeOff = t >= T.rope ? ease((t - T.rope) / 0.4) : 0;
  o += `<path d="M560 1395 q ${90 - 60 * ropeOff} ${70 + 40 * ropeOff} ${180 - 180 * ropeOff} ${0 + 100 * ropeOff}" stroke="#7a1420" stroke-width="22" fill="none" stroke-linecap="round"/><path d="M560 1395 q ${90 - 60 * ropeOff} ${70 + 40 * ropeOff} ${180 - 180 * ropeOff} ${0 + 100 * ropeOff}" stroke="#c9303e" stroke-width="12" fill="none" stroke-linecap="round"/>`;
  for (const x of [560, 740]) o += `<rect x="${x - 9}" y="1380" width="18" height="130" fill="#c9a24a" stroke="#0a0e1d" stroke-width="4"/><circle cx="${x}" cy="1378" r="16" fill="#e8c46a" stroke="#0a0e1d" stroke-width="4"/><ellipse cx="${x}" cy="1512" rx="34" ry="10" fill="#c9a24a" stroke="#0a0e1d" stroke-width="4"/>`;

  // état des deux personnages pour ce niveau
  const st = window.STATE(t, lv, T);
  for (const b of st.behind || []) o += b;
  o += stick(Object.assign({ x: 330, y: 1500, h: 560, color: HERO, hat: true }, st.hero));
  o += stick(Object.assign({ x: 850, y: 1505, h: 600, color: VID, videur: true }, st.vid));
  for (const f of st.front || []) o += f;
  o += `</g>`;
  o += `<rect width="1080" height="1920" fill="url(#vig)"/>`;
  // téléphone en gros plan
  if (st.phone) o += st.phone;
  // bulles
  for (let i = 0; i < T.says.length; i++) {
    const s = T.says[i], nx = T.says[i + 1];
    if (t < s.t0 - 0.05 || t > s.t1 + 0.35 || (nx && t >= nx.t0 - 0.05)) continue;
    if (s.who === 'off') continue;
    const k = (t - s.t0) / Math.max(0.3, (s.t1 - s.t0) * 0.9);
    if (s.who === 'r') o += bubble(30, s.by || 900, 560, s.text, s.tail || 330, k);
    else if (s.who === 'rp') o += bubble(30, 900, 560, s.text, null, k, { tag: 'DANS LE TÉLÉPHONE', fill: '#eaf4ff' });
    else o += bubble(400, s.by || 860, 540, s.text, s.tail || 830, k);
  }
  const vo = T.says.find(s => s.who === 'off' && t >= s.t0 - 0.05 && t <= s.t1 + 0.3);
  if (vo) o += bubble(70, 752, 870, vo.text, null, (t - vo.t0) / Math.max(0.3, (vo.t1 - vo.t0) * 0.9), { tag: 'VOIX OFF', fs: 30 });
  // coups : onomatopées et étoiles
  for (const c of T.hits) {
    if (t >= c.t && t < c.t + 0.75) { const k = (t - c.t) / 0.75; o += boom(c.x || 470, c.y || 1080, c.word, -8, k < 0.15 ? lerp(0.3, 1.1, k / 0.15) : k < 0.3 ? lerp(1.1, 1, (k - .15) / .15) : 1); }
  }
  // niveau en gros
  for (const l of T.levels) if (t >= l.t0 && t < l.t0 + 0.6) o += bigLevel(l.n, (t - l.t0) / 0.6);
  // fin : promo puis question
  if (t >= T.promo) o += endCard(t);
  // habillage en haut (toujours, sauf sur la carte de fin)
  if (t < T.promo) o += hud(T.genre, n, lv.label, n === 5, hype, caseState);
  document.getElementById('dyn').innerHTML = o;
}

function endCard(t) {
  const T = window.TL; const k = ease((t - T.promo) / 0.4);
  let o = `<rect width="1080" height="1920" fill="#0b1022" opacity="${0.92 * k}"/>`;
  const q = t >= T.question;
  const y = 700 + (1 - k) * 80;
  o += `<g opacity="${k}"><image href="../../site_src/icons/icon.svg" x="390" y="${y - 150}" width="300" height="300"/>
   <text x="540" y="${y + 290}" font-family="Lilita" font-size="66" fill="#fff" stroke="${INK}" stroke-width="10" paint-order="stroke" text-anchor="middle">LE NIVEAU 5,</text>
   <text x="540" y="${y + 370}" font-family="Lilita" font-size="66" fill="#fff" stroke="${INK}" stroke-width="10" paint-order="stroke" text-anchor="middle">TU LE FAIS SUR</text>
   <g transform="translate(540,${y + 470})"><rect x="-292" y="-62" width="600" height="110" rx="26" fill="${INK}"/><rect x="-300" y="-70" width="600" height="110" rx="26" fill="#fff" stroke="${INK}" stroke-width="8"/>
   <text x="0" y="12" font-family="Lilita" font-size="76" fill="${BLUE}" text-anchor="middle">stalak.app</text></g></g>`;
  if (q) {
    const kq = ease((t - T.question) / 0.35);
    o += `<g opacity="${kq}" transform="translate(0,${(1 - kq) * 40})">` + bubble(100, 1440, 830, T.questionText, null, 1, { fs: 46, tag: 'ET TOI ?' }) + `</g>`;
  }
  return o;
}
