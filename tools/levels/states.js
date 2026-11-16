// Ce que font les personnages à chaque instant (poses, coups, accessoires, téléphone).
// Les données de l'épisode viennent de window.TL (fabriquées par fabrique.py).
const IDLE = { la: [110, 95], ra: [70, 85], ll: [100, 108], rl: [80, 72] };
const VIDLE = { la: [70, 20], ra: [110, 160], ll: [100, 105], rl: [80, 75] }; // bras croisés
function speaking(t, who) { return window.TL.says.find(s => s.who === who && t >= s.t0 && t < s.t1); }
function talkPose(t) { const a = Math.sin(t * 9) * 18; return { la: [200 + a, 235 - a], ra: [-20 - a, -60 + a], ll: [100, 108], rl: [80, 72] }; }

window.STATE = function (t, lv, T) {
  const L = lv, sp = L.special || {}, c = L.coup; // c : {type, t, prop, word}
  const r = { hero: { pose: IDLE, x: L.hx || 330 }, vid: { pose: VIDLE }, behind: [], front: [] };
  const bob = Math.sin(t * 3) * 4;
  r.hero.y = 1500 + bob; r.vid.y = 1505 - bob * 0.5;
  if (speaking(t, 'r')) { r.hero.pose = sp.talk === 'drill' ? drillPose(t) : talkPose(t); r.hero.y = 1500 + Math.abs(Math.sin(t * 9)) * -10; }
  if (sp.pose && !speaking(t, 'r')) r.hero.pose = POSES[sp.pose](t);
  if (sp.pose && speaking(t, 'r') && sp.keepPose) r.hero.pose = POSES[sp.pose](t);
  if (speaking(t, 'v')) r.vid.y = 1505 + Math.sin(t * 6) * 3;
  if (L.phone && t >= L.t0 + 0.35 && (!c || t < c.t - 0.05)) { r.hero.pose = { la: [110, 95], ra: [-30, -50], ll: [100, 108], rl: [80, 72] }; r.hero.phone = true; r.phone = phoneInset(t, L, T); }

  // accessoires du niveau (derrière les personnages)
  if (sp.behind) r.behind.push(BEHIND[sp.behind](t, L, c));
  if (sp.front) r.front.push(FRONT[sp.front](t, L, c));

  // le coup
  if (c) {
    const k = t - c.t;
    if (c.type === 'baffe' || c.type === 'double') {
      const swings = c.type === 'double' ? [c.t, c.t + 0.35] : [c.t];
      for (const s of swings) {
        const q = t - s;
        if (q > -0.18 && q < 0.25) { const p = q < 0 ? ease((q + 0.18) / 0.18) : 1 - ease(q / 0.25); r.vid.pose = { la: VIDLE.la, ra: [lerp(110, 185, p), lerp(160, 185, p)], ll: VIDLE.ll, rl: VIDLE.rl }; }
      }
      if (k >= 0) {
        const side = c.type === 'double' && k >= 0.35 ? 1 : -1;
        r.hero.rot = side * 22 * (1 - Math.min(1, Math.max(0, k - 0.45) * 0)); r.hero.x = (L.hx || 330) - 60; r.hero.pose = { la: [230, 260], ra: [-40, -80], ll: [115, 130], rl: [60, 30] };
        if (k > 0.1) r.front.push(stars((L.hx || 330) - 90, 930, t));
      }
    }
    if (c.type === 'pied') {
      if (k > -0.18 && k < 0.3) { const p = k < 0 ? ease((k + 0.18) / 0.18) : 1 - ease(k / 0.3); r.vid.pose = { la: VIDLE.la, ra: VIDLE.ra, ll: VIDLE.ll, rl: [lerp(80, 185, p), lerp(72, 180, p)] }; }
      if (k >= 0) { r.hero.y = 1500 - 70 * Math.max(0, 1 - k / 0.5); r.hero.eyesPop = k < 0.7 ? ease(k / 0.12) : 1; r.hero.pose = { la: [140, 60], ra: [40, 120], ll: [70, 120], rl: [110, 60] }; r.hero.x = (L.hx || 330); }
    }
    if (c.type === 'chute' || c.type === 'big') {
      const hx = L.hx || 330, land = 1050, big = c.type === 'big';
      if (k > -0.6 && k < 0) { const p = easeIn((k + 0.6) / 0.6); r.front.push(`<g>${PROPS[c.prop](hx, lerp(560, land - 120, p))}</g>`); r.hero.pose = { la: [-120, -100], ra: [-60, -80], ll: [100, 108], rl: [80, 72] }; }
      if (k >= 0) {
        const sq = big ? 0.28 : 0.38; r.hero.sy = sq; r.hero.sx = 1.35; r.hero.y = 1500;
        r.front.push(PROPS[c.prop](hx, 1500 - 560 * sq * 1.15 - 110));
        if (k > 0.15) r.front.push(stars(hx, 1500 - 560 * sq * 1.2 - 300, t));
      }
    }
    if (c.type === 'kickout') {
      if (k > -0.18 && k < 0.3) { const p = k < 0 ? ease((k + 0.18) / 0.18) : 1 - ease(k / 0.3); r.vid.pose = { la: VIDLE.la, ra: VIDLE.ra, ll: VIDLE.ll, rl: [lerp(80, 190, p), lerp(72, 175, p)] }; }
      if (k >= 0) { const p = clamp(k / 0.55, 0, 1); r.hero.x = lerp(L.hx || 330, -320, p); r.hero.y = 1500 - Math.sin(p * Math.PI) * 420; r.hero.rot = -720 * p; }
    }
  }
  // niveau 5 : les écrans plein cadre, puis le Videur qui laisse entrer
  if (L.n === 5) return level5(t, L, T, r);
  return r;
};

function drillPose(t) { const a = Math.sin(t * 8); return { la: [160 + 40 * a, 120 + 60 * a], ra: [-10 - 30 * a, 40 - 50 * a], ll: [100, 110], rl: [80, 70] }; }
const POSES = {
  echelle: t => ({ la: [110, 95], ra: [-60, -70], ll: [100, 108], rl: [80, 72] }),
  coeur: t => ({ la: [110, 95], ra: [120, 200], ll: [100, 108], rl: [80, 72] }),
  genou: t => ({ la: [150, 100], ra: [40, 90], ll: [60, 120], rl: [120, 180] }),
  boxe: t => { const a = Math.sin(t * 10); return { la: [200 - 30 * a, 180], ra: [-20 + 30 * a, 0], ll: [100, 108], rl: [80, 72] }; },
  pleure: t => ({ la: [-100, -150], ra: [-80, -30], ll: [100, 108], rl: [80, 72] }),
  ecouteur: t => ({ la: [110, 95], ra: [-15, -25], ll: [100, 108], rl: [80, 72] }),
  crie: t => ({ la: [210, 260], ra: [-30, -80], ll: [100, 108], rl: [80, 72] }),
  drill: t => drillPose(t),
};
const BEHIND = {
  echelle: (t, L, c) => {
    const x = (L.hx || 330) + 80; const fall = c && t > c.t ? ease((t - c.t) / 0.6) : 0;
    let o = `<g transform="rotate(${-70 * fall} ${x} 1500)">`;
    for (let k = 0; k < 16; k++) o += `<rect x="${x - 60}" y="${1450 - k * 95}" width="120" height="12" rx="4" fill="#c9a24a" stroke="${LINE}" stroke-width="3"/>`;
    o += `<rect x="${x - 70}" y="0" width="14" height="1500" rx="6" fill="#c9a24a" stroke="${LINE}" stroke-width="4"/><rect x="${x + 56}" y="0" width="14" height="1500" rx="6" fill="#c9a24a" stroke="${LINE}" stroke-width="4"/></g>`;
    o += `<g opacity="${1 - fall}"><ellipse cx="${x}" cy="640" rx="190" ry="60" fill="#e8ecf8" stroke="${LINE}" stroke-width="5" opacity=".9"/><ellipse cx="${x + 90}" cy="610" rx="110" ry="55" fill="#e8ecf8" stroke="${LINE}" stroke-width="5" opacity=".9"/></g>`;
    return o;
  },
};
const FRONT = {};

// ------------------------------------------------ le téléphone en gros plan (niveaux 3 et 4)
function envAt(T, t) { const i = Math.floor(t * 30); return T.env && i >= 0 && i < T.env.length ? T.env[i] : 0; }
function phoneInset(t, L, T) {
  const P = L.phone, x = 390, y = 930, w = 380, h = 560;
  const k = ease((t - L.t0 - 0.35) / 0.25);
  let inner = '';
  const ix = x + 16, iy = y + 16, iw = w - 32, ih = h - 32;
  if (P.type === 'intro') inner = clip(ix, iy, iw, ih, P.lieu || 'immeuble', Math.min(1, envAt(T, t) * 2.2), { mask: P.mask });
  else if (P.type === 'noir') inner = `<rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" fill="#000"/><text x="${ix + iw / 2}" y="${iy + ih / 2}" font-family="Rubik" font-size="22" fill="#9aa3b8" text-anchor="middle">${esc(P.word || '')}</text>`;
  else if (P.type === 'floue') inner = clip(ix, iy, iw, ih, P.lieu || 'rue', 0.1, { blur: true, tint: P.tint });
  else if (P.type === 'photo') inner = `<rect x="${ix}" y="${iy}" width="${iw}" height="${ih}" fill="#c8cfe0"/><g filter="url(#blur8)"><circle cx="${ix + iw * 0.3}" cy="${iy + ih * 0.4}" r="70" fill="#9aa3b8"/><circle cx="${ix + iw * 0.7}" cy="${iy + ih * 0.4}" r="70" fill="#9aa3b8"/><rect x="${ix + iw * 0.15}" y="${iy + ih * 0.55}" width="${iw * 0.7}" height="${ih * 0.4}" rx="60" fill="#9aa3b8"/></g><path d="M${ix + iw / 2} ${iy} l -20 80 l 25 70 l -20 90 l 20 80 l -15 120 l 20 120" stroke="${LINE}" stroke-width="7" fill="none"/>`;
  else if (P.type === 'desync') { // monté n'importe comment : la bouche bouge en retard sur les paroles
    const N = T.n5; const tt = (t - L.t0) % 3.2;
    const lieu = N.lieux[Math.floor(((t - L.t0) * 1.7 + Math.sin(t * 3)) % 3 + 3) % 3];
    const late = 0.45; const ws = P.words;
    const wd = ws.find(q => tt - late >= q.a && tt - late < q.b);
    const mouth = wd ? Math.abs(Math.sin((tt - late - wd.a) / (wd.b - wd.a) * Math.PI * 2)) : 0.05;
    inner = clip(ix, iy, iw, ih, lieu, mouth);
    const shown = ws.filter(q => tt >= q.a).map(q => q.w).slice(-3).join(' ');
    inner += `<rect x="${ix + 10}" y="${iy + ih - 90}" width="${iw - 20}" height="76" rx="16" fill="#0a0d14" opacity=".75"/><text x="${ix + iw / 2}" y="${iy + ih - 40}" font-family="Lilita" font-size="30" fill="#fff" text-anchor="middle">${esc(shown)}</text>`;
  }
  return `<g opacity="${k}">` + phoneFrame(x, y, w, h, inner) + `</g>`;
}

// ------------------------------------------------ le niveau 5
function beatsIn(T, t0, t1) { return T.n5.beats.filter(b => b >= t0 && b < t1); }
function level5(t, L, T, r) {
  const N = T.n5;
  const panel = (inner) => `<g>${inner}</g>`;
  if (t < N.tApp) { // les 3 prises
    let o = `<rect x="0" y="630" width="1080" height="930" fill="#0b1022" opacity=".88"/>`;
    N.lieux.forEach((lieu, i) => {
      const ti = N.tPrises + i * 0.7; if (t < ti) return;
      const k = ease((t - ti) / 0.3), x = 90 + i * 300, y = 800 + (1 - k) * 60;
      o += `<g opacity="${k}">` + phoneFrame(x, y, 270, 480, clip(x + 16, y + 16, 238, 448, lieu, Math.abs(Math.sin(t * 9)) * 0.7)) +
        `<circle cx="${x + 230}" cy="${y + 50}" r="12" fill="#e5484d" opacity="${(t * 2) % 1 < 0.5 ? 1 : .3}"/>` +
        `<rect x="${x + 40}" y="${y + 500}" width="190" height="54" rx="14" fill="#fff" stroke="${INK}" stroke-width="5"/><text x="${x + 135}" y="${y + 538}" font-family="Lilita" font-size="34" text-anchor="middle" fill="${INK}">PRISE ${i + 1}</text></g>`;
    });
    r.phone = o; return r;
  }
  if (t < N.tSnip) { // dans l'appli Stalak
    const k = clamp((t - N.tApp) / (N.tSnip - N.tApp), 0, 1);
    let inner = `<rect x="236" y="666" width="608" height="928" fill="#eaf4ff"/>
      <rect x="236" y="666" width="608" height="110" fill="${BLUE}"/><circle cx="300" cy="721" r="34" fill="${BLUE}" stroke="${INK}" stroke-width="5"/><path d="M266 712 q 34 -34 68 0" fill="${ICE}" stroke="${INK}" stroke-width="4"/><text x="300" y="737" font-family="Lilita" font-size="44" fill="#fff" stroke="${INK}" stroke-width="5" paint-order="stroke" text-anchor="middle">S</text>
      <text x="350" y="738" font-family="Lilita" font-size="46" fill="#fff">stalak</text>`;
    // le son (onde) + la grille des temps
    const x0 = 270, x1 = 810, y0 = 830;
    inner += `<text x="${x0}" y="${y0 - 14}" font-family="Rubik" font-weight="700" font-size="26" fill="${INK}">TON SON</text>`;
    for (let i = 0; i < 90; i++) { const x = x0 + i * 6, a = 14 + 34 * Math.abs(Math.sin(i * 0.9) * Math.cos(i * 0.23)); inner += `<rect x="${x}" y="${y0 + 40 - a / 2}" width="4" height="${a}" rx="2" fill="${BLUE}"/>`; }
    const grid = [0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => x0 + i * (x1 - x0) / 8);
    for (const g of grid) inner += `<line x1="${g}" y1="${y0 - 4}" x2="${g}" y2="${y0 + 420}" stroke="#9fb4e8" stroke-width="3" stroke-dasharray="8 8"/>`;
    const cols = ['#1f6fd6', '#7fb8ff', '#0e3f8f'];
    N.lieux.forEach((lieu, i) => {
      const y = y0 + 120 + i * 110;
      inner += `<text x="${x0}" y="${y - 10}" font-family="Rubik" font-weight="700" font-size="24" fill="${INK}">PRISE ${i + 1}</text><rect x="${x0}" y="${y}" width="${x1 - x0}" height="64" rx="12" fill="#cfdcf5"/>`;
      // les morceaux gardés de cette prise viennent se poser sur les temps
      for (let s = 0; s < 8; s++) if (s % 3 === i) {
        const p = ease(clamp(k * 1.6 - s * 0.08, 0, 1));
        const from = x0 + ((s * 37) % 8) * 60 + 15, to = grid[s];
        inner += `<rect x="${lerp(from, to, p)}" y="${y + 4}" width="${(x1 - x0) / 8 - 6}" height="56" rx="10" fill="${cols[i]}" stroke="${INK}" stroke-width="4"/>`;
      }
    });
    inner += `<rect x="${x0}" y="${y0 + 470}" width="${x1 - x0}" height="70" rx="20" fill="${k > 0.7 ? '#2fb36b' : '#fff'}" stroke="${INK}" stroke-width="5"/><text x="540" y="${y0 + 517}" font-family="Lilita" font-size="34" text-anchor="middle" fill="${k > 0.7 ? '#fff' : INK}">COUPÉ SUR LE RYTHME</text>`;
    r.phone = `<rect x="0" y="630" width="1080" height="930" fill="#0b1022" opacity=".88"/><g transform="translate(300,760) scale(0.75) translate(-220,-650)">` + phoneFrame(220, 650, 640, 960, inner) + `</g>`;
    return r;
  }
  if (t < N.tEnd) { // le snippet monté : coupes sur les temps, bouche synchro, paroles
    const bs = N.beats; let bi = 0; for (let i = 0; i < bs.length; i++) if (t >= bs[i]) bi = i;
    const lieu = N.lieux[Math.floor(bi / 2) % N.lieux.length];
    const w = N.words.find(x => t >= x.t0 && t < x.t1);
    const mouth = w ? Math.abs(Math.sin((t - w.t0) / (w.t1 - w.t0) * Math.PI * w.syl)) : 0.05;
    let inner = clip(236, 666, 608, 928, lieu, mouth, { pose: Math.floor(bi / 2) % 2 ? { la: [200, 240], ra: [-30, -70], ll: [100, 100], rl: [80, 80] } : { la: [120, 70], ra: [60, 110], ll: [100, 100], rl: [80, 80] } });
    const pulse = Math.max(0, 1 - (t - bs[bi]) / 0.25);
    inner += `<text x="790" y="760" font-family="Lilita" font-size="${60 + 30 * pulse}" fill="#ffc93c" stroke="${INK}" stroke-width="6" paint-order="stroke" text-anchor="middle">♪</text>`;
    inner += `<image href="../../site_src/icons/icon.svg" x="262" y="692" width="56" height="56" opacity=".85"/>`;
    // paroles : le mot dit est en jaune
    let line = '', lx = []; N.words.forEach(x => { lx.push(x); });
    let row = `<rect x="256" y="1420" width="568" height="140" rx="20" fill="#0a0d14" opacity=".75"/>`;
    const per = N.lyricsLines;
    const li = per.findIndex(l => t < l.t1); const cur = per[Math.max(0, li)];
    let xx = 540; const txt = cur.words.map(wd => `<tspan fill="${t >= wd.t0 ? (t < wd.t1 ? '#ffc93c' : '#fff') : '#7f8bb0'}">${esc(wd.w)} </tspan>`).join('');
    row += `<text x="540" y="1505" font-family="Lilita" font-size="46" text-anchor="middle">${txt}</text>`;
    inner += row;
    if (Math.abs(t - bs[bi]) < 0.05) inner += `<rect x="236" y="666" width="608" height="928" fill="#fff" opacity=".25"/>`;
    r.phone = `<rect x="0" y="630" width="1080" height="930" fill="#0b1022" opacity=".88"/><g transform="translate(300,760) scale(0.75) translate(-220,-650)">` + phoneFrame(220, 650, 640, 960, inner) + `</g>`;
    return r;
  }
  // retour devant la porte : le Videur hoche la tête, décroche la corde
  r.hero.x = 400; r.hero.pose = { la: [110, 95], ra: [-30, -50], ll: [100, 108], rl: [80, 72] }; r.hero.phone = true;
  r.vid.y = 1505 + Math.abs(Math.sin((t - N.tEnd) * 7)) * 8;
  if (t >= T.rope - 0.3) r.vid.pose = { la: [140, 120], ra: VIDLE.ra, ll: VIDLE.ll, rl: VIDLE.rl };
  if (t >= T.door) r.vid.pose = { la: [100, 60], ra: [80, 120], ll: VIDLE.ll, rl: VIDLE.rl };
  return r;
}
