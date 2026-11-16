/* Série « T-Crazy » — the storyboards of the validated scripts (step « visuels » of Studio Stalak) : one still per moment
   of the script, drawn with the chosen characters, sets, banner and subtitles (frame.js). The owner validates these
   stills before any voice or animation. Props are drawn here, in the series style ; the phone screens show the real
   Stalak captures (site_src/aide) and the official mascot stickers (site_src/emoji). GTA 6 : the name only, never the game.
   (Marketing & croissance, 16/11/2026) */
(function () {
  const INK = '#0a0d14', BLUE = '#1f6fd6', ICE = '#d6ecff', NIGHT = '#0e3f8f', SNOW = '#fdfeff';
  const { bandeau, sub, FRAMES } = FRAME;
  const T = (x, y, t, size, fill, o = {}) => `<text x="${x}" y="${y}" text-anchor="${o.anchor || 'middle'}" font-family="${o.font || 'Lilita One'}"${o.weight ? ` font-weight="${o.weight}"` : ''} font-size="${size}" fill="${fill}"${o.stroke ? ` stroke="${o.stroke}" stroke-width="${o.sw}" paint-order="stroke" stroke-linejoin="round"` : ''}>${t}</text>`;

  // ---------------- props, in a character's own coordinates (front figures : hands near 320/580, 1170) ----------------
  const P = {
    phone: (x, y, glow = '#8fd3ff') => `<g transform="translate(${x} ${y})"><rect x="-26" y="-50" width="52" height="96" rx="10" fill="#2a2d36" stroke="${INK}" stroke-width="5"/><rect x="-19" y="-42" width="38" height="78" rx="5" fill="${glow}"/><rect x="-12" y="-36" width="24" height="5" rx="2.5" fill="#ffffff" opacity="0.7"/></g>`,
    sponge: (x, y) => `<g transform="translate(${x} ${y}) rotate(-10)"><rect x="-38" y="-22" width="76" height="44" rx="10" fill="#f2d24b" stroke="${INK}" stroke-width="5"/><rect x="-38" y="-22" width="76" height="16" rx="8" fill="#3fa34d" stroke="${INK}" stroke-width="5"/><circle cx="-14" cy="10" r="3" fill="#c9a52c"/><circle cx="10" cy="6" r="2.5" fill="#c9a52c"/><circle cx="22" cy="14" r="2" fill="#c9a52c"/></g>`,
    // a bag of ice cubes, our own design (« GLAÇONS », no brand)
    icebag: (x, y, r = 0) => `<g transform="translate(${x} ${y}) rotate(${r})"><path d="M -40 -50 L 40 -50 L 46 50 C 20 60 -20 60 -46 50 Z" fill="#eef7ff" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><rect x="-30" y="-14" width="60" height="26" rx="5" fill="${BLUE}"/>${T(0, 7, 'GLAÇONS', 15, SNOW)}<path d="M -40 -50 L 40 -50 L 34 -64 L -34 -64 Z" fill="#cfe6fb" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/></g>`,
    // over-ear headphones on Liam's head (front figure : head centre 450, 684.8, scale 1.3)
    headphones: () => `<g transform="translate(450 684.8) scale(1.3)">${hp()}</g>`,
    // a studio mic on its stand, the capsule at x, y ; floor = the figure's floor line
    mic: (x, y, floor = 1732) => {
      const st = `M ${x + 16} ${y + 70} L ${x + 44} ${floor - 30}`;
      return `<path d="${st}" stroke="${INK}" stroke-width="20" stroke-linecap="round"/><path d="${st}" stroke="#6b7180" stroke-width="9" stroke-linecap="round"/>` +
        `<path d="M ${x - 40} ${floor} L ${x + 44} ${floor - 30} L ${x + 128} ${floor}" fill="none" stroke="${INK}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>` +
        `<g transform="translate(${x} ${y}) rotate(-14)"><rect x="-38" y="-92" width="76" height="160" rx="38" fill="#c9ccd6" stroke="${INK}" stroke-width="7"/>` +
        `<path d="M -26 -60 L 26 -60 M -31 -36 L 31 -36 M -31 -12 L 31 -12 M -27 12 L 27 12" stroke="#8a90a0" stroke-width="5"/>` +
        `<rect x="-46" y="40" width="92" height="24" rx="9" fill="#2a2d36" stroke="${INK}" stroke-width="6"/><path d="M -18 -80 q 12 -6 26 -2" stroke="#ffffff" stroke-width="6" fill="none" stroke-linecap="round"/></g>`;
    },
    // the back of a phone held up (he films himself) : dark, two lenses
    phoneBack: (x, y) => `<g transform="translate(${x} ${y})"><rect x="-28" y="-52" width="56" height="100" rx="11" fill="#1d1f27" stroke="${INK}" stroke-width="5"/><rect x="-18" y="-42" width="22" height="34" rx="7" fill="#2f323d"/><circle cx="-7" cy="-33" r="6" fill="#0b0d12" stroke="#4a4f5c" stroke-width="2"/><circle cx="-7" cy="-17" r="6" fill="#0b0d12" stroke="#4a4f5c" stroke-width="2"/></g>`,
    plant: (x, y) => `<g transform="translate(${x} ${y})"><path d="M -40 0 L 40 0 L 30 70 L -30 70 Z" fill="#c4683a" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>${[[-60, -120, -30], [0, -170, 0], [55, -125, 30], [-30, -80, -60], [35, -85, 55]].map(([dx, dy, r]) => `<path d="M 0 0 Q ${dx * 0.4} ${dy * 0.5} ${dx} ${dy} Q ${dx * 0.7 + 18} ${dy * 0.6} 0 0 Z" fill="#3f9a5a" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`).join('')}</g>`,
  };

  // the headphones in the head's own coordinates (face centre 0,0 ; ears at ±83..109)
  function hp() {
    const band = 'M -110 4 C -124 -118 -70 -182 0 -184 C 70 -182 124 -118 110 4';
    return `<path d="${band}" fill="none" stroke="${INK}" stroke-width="26" stroke-linecap="round"/><path d="${band}" fill="none" stroke="#2a2d36" stroke-width="14" stroke-linecap="round"/>` +
      [-1, 1].map(k => `<rect x="${k * 108 - 24}" y="-40" width="48" height="88" rx="22" fill="#2a2d36" stroke="${INK}" stroke-width="6"/><rect x="${k * 108 - 12}" y="-24" width="24" height="56" rx="12" fill="${BLUE}"/>`).join('');
  }
  // Liam's head alone, big, anywhere in the frame (a reaction in a corner, a thumbnail)
  const headAt = (expr, x, y, k, extra = '') => { const r = LIAM.headOnly(4, expr); return `<defs>${r.defs}</defs><g transform="translate(${x} ${y}) scale(${k})">${r.svg}${extra}</g>`; };

  // ---------------- screens and cards over the whole frame ----------------
  const img = (href, x, y, w, h, extra = '') => `<image href="${href}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice"${extra}/>`;
  // a big phone in the middle of the frame ; inner = what its screen shows (in screen coordinates 0..560 × 0..1000)
  function phoneBig(inner, k = 1) {
    const W = 600, H = 1080, x = 540 - W / 2, y = 250;
    return `<rect width="1080" height="1920" fill="${INK}" opacity="0.5"/><g transform="translate(540 ${y + H / 2}) scale(${k}) translate(-540 ${-(y + H / 2)})">` +
      `<rect x="${x + 12}" y="${y + 16}" width="${W}" height="${H}" rx="64" fill="${INK}" opacity="0.55"/>` +
      `<rect x="${x}" y="${y}" width="${W}" height="${H}" rx="64" fill="#2a2d36" stroke="${INK}" stroke-width="12"/>` +
      `<clipPath id="scr${++UID}"><rect x="${x + 20}" y="${y + 40}" width="${W - 40}" height="${H - 80}" rx="40"/></clipPath>` +
      `<g clip-path="url(#scr${UID})"><rect x="${x + 20}" y="${y + 40}" width="${W - 40}" height="${H - 80}" fill="${NIGHT}"/><g transform="translate(${x + 20} ${y + 40})">${inner}</g></g>` +
      `<rect x="${540 - 50}" y="${y + 14}" width="100" height="12" rx="6" fill="#4a4f5c"/></g>`;
  }
  let UID = 0;
  // the gallery of the phone : 3 videos of Liam, filmed anywhere (our own interface, no real app)
  function gallery() {
    let s = `<rect width="560" height="1000" fill="#f3f6fb"/>` + T(30, 70, 'Vidéos', 44, INK, { anchor: 'start' });
    [['#e8c39a', 'placard'], ['#cfe3f7', 'frigo'], ['#f2d7c4', 'vaisselle']].forEach(([bg, label], i) => {
      const x = 24 + i * 176, y = 110;
      s += `<rect x="${x}" y="${y}" width="164" height="290" rx="14" fill="${bg}" stroke="${INK}" stroke-width="4"/>` +
        headAt(i === 1 ? 'fierte' : 'frime', x + 82, y + 170, 0.62) +
        `<path d="M ${x + 70} ${y + 250} l 26 14 l -26 14 Z" fill="${SNOW}" stroke="${INK}" stroke-width="3"/>`;
    });
    return s + T(280, 470, 'Le son est prêt. Le clip, non.', 30, '#5b6170', { font: 'Rubik', weight: 700 });
  }
  // a laptop seen from the front, filling the top of the frame ; inner = its screen (848 × 528)
  function laptopBig(inner) {
    const x = 90, y = 300, W = 900, H = 580;
    return `<rect x="${x + 14}" y="${y + 18}" width="${W}" height="${H}" rx="30" fill="${INK}" opacity="0.5"/>` +
      `<rect x="${x}" y="${y}" width="${W}" height="${H}" rx="30" fill="#2a2d36" stroke="${INK}" stroke-width="12"/>` +
      `<clipPath id="lap${++UID}"><rect x="${x + 26}" y="${y + 26}" width="${W - 52}" height="${H - 52}" rx="12"/></clipPath>` +
      `<g clip-path="url(#lap${UID})"><rect x="${x + 26}" y="${y + 26}" width="${W - 52}" height="${H - 52}" fill="#161a24"/><g transform="translate(${x + 26} ${y + 26})">${inner}</g></g>` +
      `<path d="M ${x - 50} ${y + H + 6} L ${x + W + 50} ${y + H + 6} L ${x + W + 10} ${y + H + 70} L ${x - 10} ${y + H + 70} Z" fill="#9aa1ad" stroke="${INK}" stroke-width="10" stroke-linejoin="round"/>` +
      `<rect x="450" y="${y + H + 16}" width="180" height="16" rx="8" fill="#7a8190"/>`;
  }
  // the take on Liam's computer (our own simple recorder) : his voice in blue, then his mother's shout in red, on the beat grid
  function take() {
    let s = `<rect width="848" height="528" fill="#161a24"/><circle cx="44" cy="44" r="15" fill="#e5484d"/>` + T(70, 56, 'REC', 34, '#e5484d', { anchor: 'start' }) + T(816, 56, 'PRISE 7', 30, '#9aa6bd', { anchor: 'end' });
    for (let i = 0; i <= 8; i++) s += `<path d="M ${24 + i * 100} 92 L ${24 + i * 100} 476" stroke="#2a3142" stroke-width="3"/>`;
    let d1 = '', d2 = '';
    for (let i = 0; i < 200; i++) {
      const xx = 24 + i * 4, loud = i >= 120 && i < 168;
      const a = loud ? 120 + 70 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.31)) : 16 + 44 * Math.abs(Math.sin(i * 0.9) * Math.sin(i * 0.23 + 1));
      if (loud) d2 += `M ${xx} ${284 - a} L ${xx} ${284 + a} `; else d1 += `M ${xx} ${284 - a} L ${xx} ${284 + a} `;
    }
    s += `<path d="${d1}" stroke="#57adff" stroke-width="3"/><path d="${d2}" stroke="#ff5a5f" stroke-width="3"/>`;
    s += `<path d="M 600 84 L 600 484" stroke="${SNOW}" stroke-width="5"/><path d="M 586 84 L 614 84 L 600 104 Z" fill="${SNOW}"/>`;
    return s + `<g transform="translate(560 100)"><path d="M 0 -34 L 34 26 L -34 26 Z" fill="#ffd34d" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>${T(0, 18, '!', 40, INK)}</g>`;
  }
  // Maya's hand on the kitchen window sill, her phone in it (the window opening : 420..670 × 470..880)
  const winPhone = (cx = 420, cy = 470, cw = 250, ch = 410, hx = 630, hy = 814) => `<clipPath id="wph"><rect x="${cx}" y="${cy}" width="${cw}" height="${ch}"/></clipPath><g clip-path="url(#wph)">` +
    `<path d="M ${hx + 34} ${hy + 106} L ${hx + 4} ${hy - 8}" stroke="${INK}" stroke-width="60" stroke-linecap="round"/><path d="M ${hx + 34} ${hy + 106} L ${hx + 4} ${hy - 8}" stroke="#c4b2ee" stroke-width="47" stroke-linecap="round"/>` +
    `<path d="M ${hx - 24} ${hy - 54} C ${hx - 30} ${hy - 22} ${hx - 18} ${hy} ${hx} ${hy} C ${hx + 18} ${hy} ${hx + 30} ${hy - 22} ${hx + 24} ${hy - 54} Z" fill="#9a5f3c" stroke="${INK}" stroke-width="5"/>` + P.phone(hx, hy - 72) + `</g>`;
  // a big wall clock whose hands spin (« six heures plus tard »)
  function clockBig(cx = 540, cy = 640, r = 250) {
    let s = `<circle cx="${cx + 12}" cy="${cy + 16}" r="${r}" fill="${INK}" opacity="0.5"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="#f8f4ea" stroke="${INK}" stroke-width="14"/>`;
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; s += `<path d="M ${cx + Math.sin(a) * r * 0.78} ${cy - Math.cos(a) * r * 0.78} L ${cx + Math.sin(a) * r * 0.9} ${cy - Math.cos(a) * r * 0.9}" stroke="${INK}" stroke-width="${i % 3 ? 6 : 12}" stroke-linecap="round"/>`; }
    // the motion of the hands : arcs and ghosts
    [0.62, 0.48].forEach((k, j) => { s += `<path d="M ${cx + Math.sin(0.3) * r * k} ${cy - Math.cos(0.3) * r * k} A ${r * k} ${r * k} 0 1 1 ${cx + Math.sin(-1.2) * r * k} ${cy - Math.cos(-1.2) * r * k}" fill="none" stroke="${j ? '#57adff' : '#9aa6bd'}" stroke-width="10" stroke-linecap="round" stroke-dasharray="${j ? '24 18' : '40 22'}"/>`; });
    [-0.5, -0.9, -1.3].forEach((a, j) => { s += `<path d="M ${cx} ${cy} L ${cx + Math.sin(a) * r * 0.62} ${cy - Math.cos(a) * r * 0.62}" stroke="${INK}" stroke-width="12" stroke-linecap="round" opacity="${0.15 + j * 0.1}"/>`; });
    s += `<path d="M ${cx} ${cy} L ${cx + Math.sin(0.3) * r * 0.62} ${cy - Math.cos(0.3) * r * 0.62}" stroke="${INK}" stroke-width="14" stroke-linecap="round"/><path d="M ${cx} ${cy} L ${cx + Math.sin(2.4) * r * 0.46} ${cy - Math.cos(2.4) * r * 0.46}" stroke="${INK}" stroke-width="18" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="18" fill="${INK}"/>`;
    return s;
  }
  // the video editor on Liam's computer (our own simple interface) : his clip, the song, and they don't line up
  function editor() {
    let s = `<rect width="848" height="528" fill="#161a24"/><rect x="254" y="22" width="340" height="250" rx="10" fill="#0b0d12" stroke="#2a3142" stroke-width="4"/>`;
    s += headAt('panique', 424, 156, 0.62);
    s += `<rect x="24" y="300" width="800" height="200" rx="10" fill="#1d2230"/>`;
    // the video track : frame by frame, shifted to the right of the song
    for (let i = 0; i < 9; i++) s += `<rect x="${86 + i * 80}" y="318" width="74" height="70" rx="6" fill="#2b5d9a" stroke="#57adff" stroke-width="3"/>`;
    let d = '';
    for (let i = 0; i < 190; i++) { const xx = 40 + i * 4, a = 8 + 30 * Math.abs(Math.sin(i * 0.8) * Math.sin(i * 0.19 + 0.6)); d += `M ${xx} ${446 - a} L ${xx} ${446 + a} `; }
    s += `<path d="${d}" stroke="#ffd34d" stroke-width="3"/>`;
    // the gap between the mouth and the song
    s += `<path d="M 300 300 L 300 490 M 352 300 L 352 490" stroke="#ff5a5f" stroke-width="5"/><path d="M 306 300 L 346 300" stroke="#ff5a5f" stroke-width="5"/>`;
    return s + `<rect x="270" y="236" width="308" height="0" fill="none"/>` + `<g transform="translate(326 286)"><rect x="-66" y="-24" width="132" height="44" rx="12" fill="#ff5a5f" stroke="${INK}" stroke-width="4"/>${T(0, 10, 'DÉCALÉ', 28, SNOW)}</g>`;
  }
  // his posted video and the first comment under it (our own interface, no real app)
  function postScreen(text) {
    let s = `<rect width="560" height="1000" fill="#0b0d12"/><rect x="0" y="0" width="560" height="640" fill="#1d2a44"/>`;
    s += headAt('frime', 280, 330, 1.05) + `<circle cx="280" cy="560" r="0"/>`;
    s += `<rect x="0" y="600" width="560" height="400" rx="0" fill="#f3f6fb"/><circle cx="64" cy="684" r="34" fill="#9aa6bd"/>`;
    s += T(116, 668, 'commentaire', 26, '#7a8091', { font: 'Rubik', weight: 700, anchor: 'start' });
    const words = text.split(' '); let line = '', y = 712; const out = [];
    words.forEach(w => { if ((line + ' ' + w).trim().length > 22) { out.push(line); line = w; } else line = (line + ' ' + w).trim(); }); out.push(line);
    out.forEach((l, i) => { s += T(116, y + i * 40, l, 32, INK, { font: 'Rubik', weight: 800, anchor: 'start' }); });
    return s;
  }
  // the real Stalak capture in the phone, and the official mascot sticker reacting on it
  const stalakScreen = (cap, sticker) => img(`/site_src/aide/${cap}.jpg`, 0, 0, 560, 1000) +
    (sticker ? `<g transform="translate(440 860)"><circle r="96" fill="${SNOW}" stroke="${INK}" stroke-width="6"/>${img(`/site_src/emoji/${sticker}.webp`, -84, -84, 168, 168)}</g>` : '');
  // a notification or a comment, our own interface
  const notif = (text, y = 330) => `<g transform="translate(140 ${y})"><rect x="0" y="0" width="800" height="120" rx="30" fill="${SNOW}" stroke="${INK}" stroke-width="6"/><circle cx="64" cy="60" r="38" fill="${BLUE}"/>${T(64, 76, '♥', 44, SNOW)}${T(124, 74, text, 36, INK, { font: 'Rubik', weight: 800, anchor: 'start' })}</g>`;
  const comment = (text, y = 300) => `<g transform="translate(110 ${y})"><rect x="0" y="0" width="860" height="150" rx="30" fill="${SNOW}" stroke="${INK}" stroke-width="6"/>${T(40, 58, 'commentaire', 28, '#7a8091', { font: 'Rubik', weight: 700, anchor: 'start' })}${T(40, 112, text, 36, INK, { font: 'Rubik', weight: 800, anchor: 'start' })}</g>`;
  // a name label next to a character
  const tag = (text, x, y, r = -4) => { const w = 34 + text.length * 21; return `<g transform="translate(${x} ${y}) rotate(${r})"><rect x="${-w / 2 + 6}" y="-30" width="${w}" height="64" rx="32" fill="${INK}"/><rect x="${-w / 2}" y="-36" width="${w}" height="64" rx="32" fill="${SNOW}" stroke="${INK}" stroke-width="6"/>${T(0, 10, text, 34, INK)}</g>`; };
  // the end card : the official logo sticker, stalak.app, what it costs (as the site says it), the next episode
  function endCard(next) {
    let s = `<rect width="1080" height="1920" fill="${BLUE}"/>`;
    s += `<path d="M 0 0 L 1080 0 L 1080 200 C 980 210 960 290 900 280 C 850 272 860 210 790 210 C 720 210 730 320 660 310 C 600 302 610 220 540 220 C 470 220 480 340 410 330 C 350 322 360 230 290 230 C 220 230 230 300 170 290 C 110 280 110 210 0 210 Z" fill="${ICE}" stroke="${INK}" stroke-width="8"/>`;
    s += `<circle cx="550" cy="512" r="168" fill="${INK}"/>` + img('/site_src/icons/icon.svg', 380, 340, 330, 330);
    s += T(540, 830, 'stalak.app', 150, SNOW, { stroke: INK, sw: 20 });
    s += T(540, 910, 'Gratuit, sans téléchargement ni inscription', 40, ICE, { font: 'Rubik', weight: 800 });
    s += `<g transform="translate(0 800)">${bandeau(2, 'PROCHAIN ÉPISODE : ' + next, '')}</g>`;
    return s;
  }

  // a band of the frame showing another set (a split screen) : y0..y0+h, the set point (cx, cy) in its middle, zoom k
  function band(set, y0, h, cx, cy, k, ns, extra = '') { // extra : drawn on that set, in its coordinates
    const o = Object.assign({}, set[3] || {}, { ns });
    return `<clipPath id="bd${ns}"><rect x="0" y="${y0}" width="1080" height="${h}"/></clipPath><g clip-path="url(#bd${ns})"><g transform="translate(540 ${y0 + h / 2}) scale(${k}) translate(${-cx} ${-cy})">${DECORS.scene(set[0], set[1], set[2], o)}${extra}</g></g>`;
  }
  // Liam placed by his feet without measuring (front figure : 1249 high, feet at 450, 1732) ; for bands and odd poses
  const liamAt = (expr, x, y, h, props = '', pose) => { const r = LIAM.figure(4, expr, pose), k = h / 1249; return `<defs>${r.defs}</defs><g transform="translate(${x - 450 * k} ${y - 1732 * k}) scale(${k})">${r.svg}${props}</g>`; };
  // Liam flat on the ground (he collapses) : rot -90, the head on the left
  const lying = (expr, x, y, k, rot = -90) => { const r = LIAM.figure(4, expr); return `<defs>${r.defs}</defs><g transform="translate(${x} ${y}) rotate(${rot}) scale(${k}) translate(-450 -1232)">${r.svg}</g>`; };
  // a city bus passing, side view (our own design, no brand) ; x, y : its bottom left
  function bus(x, y, w = 980) {
    const h = 360;
    let s = [0, 1, 2].map(i => `<path d="M ${x - 60 - i * 40} ${y - 260 + i * 80} L ${x - 200 - i * 60} ${y - 260 + i * 80}" stroke="${INK}" stroke-width="10" stroke-linecap="round" opacity="0.6"/>`).join('');
    s += `<rect x="${x}" y="${y - h}" width="${w}" height="${h - 40}" rx="44" fill="#e8b43a" stroke="${INK}" stroke-width="9"/><rect x="${x + 6}" y="${y - 140}" width="${w - 12}" height="44" fill="#c98a06"/>`;
    for (let i = 0; i < 6; i++) s += `<rect x="${x + 50 + i * 150}" y="${y - h + 40}" width="118" height="120" rx="16" fill="#9fc4d8" stroke="${INK}" stroke-width="6"/>`;
    [x + 180, x + w - 180].forEach(cx => { s += `<circle cx="${cx}" cy="${y - 40}" r="62" fill="#2a2d36" stroke="${INK}" stroke-width="8"/><circle cx="${cx}" cy="${y - 40}" r="24" fill="#9aa1ad"/>`; });
    return s;
  }
  // a small dog barking, side view, facing left ; x, y : under its paws
  function dog(x, y) {
    return `<g transform="translate(${x} ${y})"><path d="M 30 -60 C 70 -90 90 -110 96 -120" stroke="${INK}" stroke-width="20" stroke-linecap="round"/><path d="M 30 -60 C 70 -90 90 -110 96 -120" stroke="#c98a4e" stroke-width="10" stroke-linecap="round"/>` +
      [-50, -20, 20, 50].map(dx => `<rect x="${dx - 9}" y="-50" width="18" height="50" rx="8" fill="#c98a4e" stroke="${INK}" stroke-width="6"/>`).join('') +
      `<ellipse cx="0" cy="-70" rx="80" ry="42" fill="#c98a4e" stroke="${INK}" stroke-width="7"/><circle cx="-84" cy="-118" r="44" fill="#c98a4e" stroke="${INK}" stroke-width="7"/>` +
      `<path d="M -120 -110 L -150 -100 L -122 -86 Z" fill="#3b1612" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><path d="M -70 -160 C -50 -170 -40 -140 -56 -118 Z" fill="#8a5a33" stroke="${INK}" stroke-width="6"/><circle cx="-96" cy="-128" r="7" fill="${INK}"/>` +
      `<g transform="translate(-200 -230) rotate(-8)"><path d="M -96 -46 L 96 -46 L 96 30 L -10 30 L -40 64 L -36 30 L -96 30 Z" fill="${SNOW}" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>${T(0, 10, 'WOUF !', 52, INK)}</g></g>`;
  }
  // a clapperboard : « PRISE n »
  const clap = (x, y, n, r = -6) => `<g transform="translate(${x} ${y}) rotate(${r})"><rect x="-120" y="-36" width="240" height="120" rx="10" fill="#2a2d36" stroke="${INK}" stroke-width="7"/><path d="M -120 -36 L 120 -36 L 124 -84 L -116 -84 Z" fill="${SNOW}" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>` +
    [-80, -20, 40, 100].map(dx => `<path d="M ${dx} -84 L ${dx + 30} -84 L ${dx + 14} -36 L ${dx - 16} -36 Z" fill="${INK}"/>`).join('') + `${T(0, 48, 'PRISE ' + n, 50, SNOW)}</g>`;
  // ice bags piled in his arms (figure coordinates), bigger than the plain prop
  const bigBag = (x, y, r = 0, k = 1.7) => `<g transform="translate(${x} ${y}) scale(${k}) translate(${-x} ${-y})">${P.icebag(x, y, r)}</g>`;
  const BAGS = (n) => [[450, 1150, -3], [360, 1060, -9], [545, 1050, 8], [450, 960, 4], [380, 880, -6], [530, 870, 9]].slice(0, n).map(([x, y, r]) => bigBag(x, y, r)).join('');
  // ---------------- EP5 (the GTA-style clip) : our own drawings, never anything from the game ----------------
  // the sunset over the street (set coordinates)
  const sunset = () => `<defs><linearGradient id="sst" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff5a3d" stop-opacity="0.5"/><stop offset="0.55" stop-color="#ffa060" stop-opacity="0.28"/><stop offset="1" stop-color="#ffb27a" stop-opacity="0.12"/></linearGradient></defs><rect x="-60" y="-60" width="1200" height="2040" fill="url(#sst)"/>`;
  // a scooter seen from the front (our own design, no brand) : barY = handlebar, floor = where the riders' feet are
  function scooter(cx, barY, floor, k = 0.57, color = '#5fc4b3') {
    // narrow leg shield, front fender and wheel below, the headlight on the handlebar (the riders' legs show on each side)
    let s = `<rect x="${cx - 44 * k}" y="${floor - 30}" width="${88 * k}" height="${230 * k}" rx="${38 * k}" fill="#2a2d36" stroke="${INK}" stroke-width="7"/>` +
      `<path d="M ${cx - 30 * k} ${floor + 40 * k} L ${cx + 30 * k} ${floor + 40 * k} M ${cx - 30 * k} ${floor + 90 * k} L ${cx + 30 * k} ${floor + 90 * k} M ${cx - 30 * k} ${floor + 140 * k} L ${cx + 30 * k} ${floor + 140 * k}" stroke="#4a4f5c" stroke-width="5"/>`;
    s += `<path d="M ${cx - 80 * k} ${floor + 10} C ${cx - 80 * k} ${floor - 60 * k} ${cx + 80 * k} ${floor - 60 * k} ${cx + 80 * k} ${floor + 10} Z" fill="${color}" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>`;
    const sh = `M ${cx - 90 * k} ${barY + 70 * k} C ${cx - 110 * k} ${barY + 300 * k} ${cx - 150 * k} ${floor - 120} ${cx - 160 * k} ${floor - 40 * k} L ${cx + 160 * k} ${floor - 40 * k} C ${cx + 150 * k} ${floor - 120} ${cx + 110 * k} ${barY + 300 * k} ${cx + 90 * k} ${barY + 70 * k} Z`;
    s += `<path d="${sh}" fill="${color}" stroke="${INK}" stroke-width="9" stroke-linejoin="round"/><path d="M ${cx - 50 * k} ${barY + 110 * k} C ${cx - 70 * k} ${barY + 300 * k} ${cx - 96 * k} ${floor - 160} ${cx - 104 * k} ${floor - 80 * k}" fill="none" stroke="#bff0e6" stroke-width="${16 * k}" stroke-linecap="round" opacity="0.85"/>`;
    s += `<rect x="${cx - 18 * k}" y="${barY}" width="${36 * k}" height="${90 * k}" fill="#9aa1ad" stroke="${INK}" stroke-width="6"/>`;
    [-1, 1].forEach(sg => { s += `<path d="M ${cx + sg * 150 * k} ${barY} L ${cx + sg * 190 * k} ${barY - 110 * k}" stroke="${INK}" stroke-width="8"/><circle cx="${cx + sg * 196 * k}" cy="${barY - 126 * k}" r="${30 * k}" fill="#cfe6fb" stroke="${INK}" stroke-width="6"/>`; });
    s += `<rect x="${cx - 240 * k}" y="${barY - 12 * k}" width="${480 * k}" height="${26 * k}" rx="${12 * k}" fill="#9aa1ad" stroke="${INK}" stroke-width="6"/>` + [-1, 1].map(sg => `<rect x="${cx + sg * 222 * k - 32 * k}" y="${barY - 20 * k}" width="${64 * k}" height="${42 * k}" rx="${16 * k}" fill="#2a2d36" stroke="${INK}" stroke-width="5"/>`).join('');
    s += `<path d="M ${cx - 76 * k} ${barY + 30 * k} C ${cx - 80 * k} ${barY - 70 * k} ${cx + 80 * k} ${barY - 70 * k} ${cx + 76 * k} ${barY + 30 * k} Z" fill="${color}" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/><circle cx="${cx}" cy="${barY - 6 * k}" r="${44 * k}" fill="#fff3b0" stroke="${INK}" stroke-width="7"/><circle cx="${cx}" cy="${barY - 6 * k}" r="${26 * k}" fill="#ffe066"/>`;
    return s;
  }
  // grey puffs : the scooter stalls
  const smoke = (x, y) => [[0, 0, 46], [60, -50, 38], [120, -110, 30], [-40, -70, 26]].map(([dx, dy, r]) => `<circle cx="${x + dx}" cy="${y + dy}" r="${r}" fill="#c9ccd6" stroke="${INK}" stroke-width="5" opacity="0.92"/>`).join('');
  // a desk fan (Deuce's helicopter), in a character's coordinates
  const fan = (x, y) => `<g transform="translate(${x} ${y})">${[0, 1, 2].map(i => `<path d="M -140 ${-60 + i * 50} q -60 -16 -120 0" fill="none" stroke="#9fc4ff" stroke-width="9" stroke-linecap="round"/>`).join('')}` +
    `<rect x="-14" y="80" width="28" height="110" fill="#9aa1ad" stroke="${INK}" stroke-width="6"/><ellipse cx="0" cy="196" rx="70" ry="18" fill="#9aa1ad" stroke="${INK}" stroke-width="6"/>` +
    `<circle r="104" fill="#e9f4ff" stroke="${INK}" stroke-width="8"/>${[0, 120, 240].map(a => `<ellipse cx="0" cy="-46" rx="26" ry="50" fill="#57adff" stroke="${INK}" stroke-width="5" transform="rotate(${a})"/>`).join('')}` +
    `<circle r="62" fill="none" stroke="#9aa1ad" stroke-width="3"/><circle r="86" fill="none" stroke="#9aa1ad" stroke-width="3"/><circle r="18" fill="#2a2d36" stroke="${INK}" stroke-width="5"/></g>`;
  // Deuce's dream : a car, palm trees, a helicopter (plain cartoon icons of ours, nothing from the game)
  function dream(cx, cy) {
    let s = [[-300, 20, 120], [-160, -90, 140], [40, -110, 150], [220, -60, 130], [320, 40, 110], [150, 110, 130], [-80, 110, 130], [-260, 120, 100]].map(([dx, dy, r]) => `<circle cx="${cx + dx}" cy="${cy + dy}" r="${r}" fill="${INK}"/>`).join('');
    s += [[-300, 20, 112], [-160, -90, 132], [40, -110, 142], [220, -60, 122], [320, 40, 102], [150, 110, 122], [-80, 110, 122], [-260, 120, 92]].map(([dx, dy, r]) => `<circle cx="${cx + dx}" cy="${cy + dy}" r="${r}" fill="${SNOW}"/>`).join('');
    s += `<rect x="${cx - 380}" y="${cy - 190}" width="760" height="380" rx="150" fill="#ffe2c4"/>`;
    // two palm trees
    [[cx - 250, cy + 150, 1], [cx + 290, cy + 150, -1]].forEach(([x, y, sg]) => {
      s += `<path d="M ${x} ${y} C ${x + sg * 10} ${y - 90} ${x + sg * 30} ${y - 170} ${x + sg * 20} ${y - 250}" fill="none" stroke="${INK}" stroke-width="26" stroke-linecap="round"/><path d="M ${x} ${y} C ${x + sg * 10} ${y - 90} ${x + sg * 30} ${y - 170} ${x + sg * 20} ${y - 250}" fill="none" stroke="#a0703c" stroke-width="15" stroke-linecap="round"/>`;
      [-150, -100, -40, 20, 70].forEach(a => { const r = a * Math.PI / 180, ex = x + sg * 20 + Math.cos(r) * 110, ey = y - 250 + Math.sin(r) * 70 + 30; s += `<path d="M ${x + sg * 20} ${y - 250} Q ${(x + sg * 20 + ex) / 2} ${y - 300} ${ex} ${ey}" fill="none" stroke="${INK}" stroke-width="22" stroke-linecap="round"/><path d="M ${x + sg * 20} ${y - 250} Q ${(x + sg * 20 + ex) / 2} ${y - 300} ${ex} ${ey}" fill="none" stroke="#3f9a5a" stroke-width="12" stroke-linecap="round"/>`; });
    });
    // a low red car
    s += `<path d="M ${cx - 170} ${cy + 120} L ${cx - 150} ${cy + 70} L ${cx - 70} ${cy + 50} L ${cx - 20} ${cy + 10} L ${cx + 80} ${cy + 10} L ${cx + 140} ${cy + 55} L ${cx + 180} ${cy + 70} L ${cx + 180} ${cy + 120} Z" fill="#e5484d" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/><path d="M ${cx - 50} ${cy + 50} L ${cx - 10} ${cy + 22} L ${cx + 70} ${cy + 22} L ${cx + 110} ${cy + 52} Z" fill="#9fc4d8" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>` +
      [cx - 90, cx + 110].map(x => `<circle cx="${x}" cy="${cy + 122}" r="30" fill="#2a2d36" stroke="${INK}" stroke-width="6"/><circle cx="${x}" cy="${cy + 122}" r="11" fill="#c9ccd6"/>`).join('');
    // a helicopter
    s += `<g transform="translate(${cx + 40} ${cy - 120})"><path d="M -150 -50 L 150 -50" stroke="${INK}" stroke-width="10" stroke-linecap="round"/><path d="M 0 -50 L 0 -30" stroke="${INK}" stroke-width="8"/><ellipse cx="0" cy="0" rx="78" ry="44" fill="#2b49c9" stroke="${INK}" stroke-width="7"/><path d="M 60 -6 L 170 -20 L 176 -46 L 190 -46 L 186 10 L 64 18 Z" fill="#2b49c9" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/><path d="M -60 -10 C -50 -36 -10 -40 10 -30 L 10 4 L -62 4 Z" fill="#9fc4d8" stroke="${INK}" stroke-width="5"/><path d="M -60 56 L 60 56 M -40 40 L -40 56 M 40 40 L 40 56" stroke="${INK}" stroke-width="7" stroke-linecap="round"/></g>`;
    return s;
  }
  // the 12 takes in Liam's phone : all a bit failed, but he raps well in each (our own interface)
  function gallery12() {
    let s = `<rect width="560" height="1000" fill="#f3f6fb"/>` + T(30, 70, 'Vidéos', 44, INK, { anchor: 'start' });
    const bgs = ['#ffb27a', '#9fc4d8', '#7fd1c1', '#f2d7c4'];
    for (let i = 0; i < 12; i++) {
      const x = 22 + (i % 3) * 176, y = 100 + Math.floor(i / 3) * 196;
      s += `<rect x="${x}" y="${y}" width="164" height="184" rx="12" fill="${bgs[i % 4]}" stroke="${INK}" stroke-width="4"/>` + headAt(i % 4 === 1 ? 'fierte' : 'frime', x + 82, y + 102, 0.42) +
        `<path d="M ${x + 120} ${y + 150} l 22 12 l -22 12 Z" fill="${SNOW}" stroke="${INK}" stroke-width="3"/>`;
    }
    return s;
  }
  // a phone held sideways (Deuce films in landscape : the joke)
  const phoneWide = (x, y) => `<g transform="translate(${x} ${y}) rotate(90)">${P.phoneBack(0, 0)}</g>`;
  // the sets alone, to check a framing : frame.html?f=set-terrain1
  [['chambre', 2], ['cuisine', 1], ['rue', 1], ['terrain', 1], ['lycee', 1], ['toit', 2]].forEach(([id, v]) => { FRAMES[`set-${id}${v}`] = { set: [id, v, 'jour'], chars: [] }; });

  // the shop of M. Reyes closed : a « FERMÉ » sign over the « OUVERT » one (set coordinates of rue 1)
  const closed = () => `<g transform="rotate(-3 742 1238)"><rect x="660" y="1196" width="164" height="86" rx="14" fill="#c8443a" stroke="${INK}" stroke-width="6"/>${T(742, 1255, 'FERMÉ', 46, SNOW)}</g><path d="M 690 1196 L 742 1150 L 794 1196" fill="none" stroke="${INK}" stroke-width="4"/>`;
  // glare on a shop window, over whoever stands behind it
  const glare = (x, y, w, h) => `<clipPath id="gl${++UID}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath><g clip-path="url(#gl${UID})" opacity="0.28"><path d="M ${x + w * 0.1} ${y + h} L ${x + w * 0.35} ${y} L ${x + w * 0.45} ${y} L ${x + w * 0.2} ${y + h} Z M ${x + w * 0.55} ${y + h} L ${x + w * 0.8} ${y} L ${x + w * 0.85} ${y} L ${x + w * 0.6} ${y + h} Z" fill="#ffffff"/></g>`;
  // his new song posted with a still image : nobody stops on it (our own interface)
  function stillPost() {
    let s = `<rect width="560" height="1000" fill="#0b0d12"/><rect x="40" y="120" width="480" height="480" rx="18" fill="${NIGHT}" stroke="#2a3142" stroke-width="4"/>`;
    s += `<g transform="translate(280 300)">${[0, 1, 2, 3, 4, 5].map(i => `<path d="M 0 0 L ${Math.sin(i * Math.PI / 3) * 90} ${-Math.cos(i * Math.PI / 3) * 90}" stroke="${ICE}" stroke-width="12" stroke-linecap="round"/>`).join('')}</g>`;
    s += T(280, 480, 'T-CRAZY', 76, SNOW, { stroke: INK, sw: 10 }) + T(280, 548, 'nouveau son', 34, ICE, { font: 'Rubik', weight: 700 });
    s += `<rect x="40" y="650" width="480" height="10" rx="5" fill="#2a3142"/><rect x="40" y="650" width="60" height="10" rx="5" fill="${BLUE}"/><circle cx="100" cy="655" r="15" fill="${SNOW}"/>`;
    return s + T(280, 770, '0 écoute', 46, '#9aa6bd', { font: 'Rubik', weight: 800 });
  }
  // the light of a screen on a wall, from off screen (a game being played : never shown)
  const screenLight = (cx, cy) => `<defs><radialGradient id="sl1"><stop offset="0" stop-color="#57adff" stop-opacity="0.75"/><stop offset="1" stop-color="#57adff" stop-opacity="0"/></radialGradient><radialGradient id="sl2"><stop offset="0" stop-color="#e86ad6" stop-opacity="0.6"/><stop offset="1" stop-color="#e86ad6" stop-opacity="0"/></radialGradient><radialGradient id="sl3"><stop offset="0" stop-color="#5fe08a" stop-opacity="0.5"/><stop offset="1" stop-color="#5fe08a" stop-opacity="0"/></radialGradient></defs>` +
    `<ellipse cx="${cx}" cy="${cy}" rx="420" ry="330" fill="url(#sl1)"/><ellipse cx="${cx + 140}" cy="${cy - 90}" rx="260" ry="200" fill="url(#sl2)"/><ellipse cx="${cx - 120}" cy="${cy + 120}" rx="240" ry="190" fill="url(#sl3)"/>`;

  // ---------------- the episodes, shot by shot ----------------
  const BOARDS = {};
  // num : the number shown on screen (the order of publication) ; note : a line under the board's title
  function ep(id, title, num, shots, note) {
    BOARDS[id] = { title, num, note, shots: shots.map((sh, i) => ({ id: `${id}-${String(i + 1).padStart(2, '0')}`, t: sh.t, cap: sh.cap })) };
    shots.forEach((sh, i) => { FRAMES[`${id}-${String(i + 1).padStart(2, '0')}`] = sh; });
  }
  const LI = (x, y, h, expr, props = '', o = {}) => Object.assign({ who: 'liam', v: 4, x, y, h, expr, props }, o);
  const CH = (who, v, x, y, h, expr, props = '', o = {}) => Object.assign({ who, v, x, y, h, expr, props }, o);
  const KITCHEN = ['cuisine', 1, 'jour'], ROOM = ['chambre', 2, 'jour'], ROOMN = ['chambre', 2, 'nuit'], STREET = ['rue', 1, 'jour'];
  const ROOM0 = ['chambre', 2, 'jour', { nomic: true }], ROOMN0 = ['chambre', 2, 'nuit', { nomic: true }]; // without the closet mic, for the close shots
  const TERRAIN = ['terrain', 1, 'jour'], LYCEE = ['lycee', 1, 'jour'];

  const HP = P.headphones();
  ep('ep1', 'SA MÈRE A CRIÉ EN PLEINE PRISE', 1, [
    { t: '0:00', cap: "L'accroche : Nadia a trouvé le clip", set: KITCHEN, chars: [CH('nadia', 2, 560, 2700, 2050, 'colere', P.phone(580, 1130, '#ffe066'))],
      over: () => bandeau(2, 'SA MÈRE A CRIÉ EN PLEINE PRISE', 1) + sub(1, 'nadia', 'Tu m\'as enregistrée sans me le dire ?!') },
    { t: '0:03', cap: 'Le narrateur présente Liam', set: ROOM, chars: [LI(230, 1490, 1000, 'frime', HP)],
      over: () => tag('LIAM, ALIAS T-CRAZY', 650, 640) + sub(1, 'narrateur', 'Voici Liam. 15 ans. Zéro abonné. Persuadé d\'être le prochain rappeur à percer.') },
    { t: '0:10', cap: 'Une heure plus tôt, au micro', set: ROOM0, zoom: [290, 900, 1.7], chars: [LI(420, 2250, 1500, 'fierte', HP + P.mic(612, 790))],
      over: () => sub(1, 'liam', 'T-Crazy, le froid dans les veines, je glace la scène !') },
    { t: '0:16', cap: 'La porte du placard s\'ouvre', set: ROOM, chars: [LI(200, 1490, 980, 'panique', HP), CH('nadia', 2, 640, 1640, 1240, 'colere', P.sponge(330, 1170))],
      over: () => sub(1, 'nadia', 'T-Crazy mange pas si T-Crazy a pas fait la vaisselle !') },
    { t: '0:22', cap: "L'ordi a tout enregistré", set: ROOM, zoom: [640, 1060, 1.6], dim: 0.45,
      over: () => laptopBig(take()) + headAt('panique', 300, 1150, 1.9, hp()) + sub(1, 'liam', 'Maman ! T\'es dans ma prise !') },
    { t: '0:28', cap: 'Le cri tombe pile sur le temps', set: ROOM0, zoom: [768, 1000, 1.5], chars: [LI(740, 2940, 2300, 'frime', HP)],
      over: () => sub(1, 'liam', 'Attends. C\'est mon refrain.') },
    { t: '0:36', cap: 'Ses vidéos dans sa galerie', set: ROOM, over: () => phoneBig(gallery(), 0.92) + sub(1, 'liam', 'J\'ai le son. J\'ai des vidéos. Mais un clip, c\'est des heures.') },
    { t: '0:44', cap: 'Maya à la fenêtre de la cuisine', set: KITCHEN, chars: [CH('maya', 1, 545, 1570, 1150, 'frime', '', { clip: [420, 470, 250, 410], after: winPhone() }), LI(800, 1846, 1170, 'frime', P.sponge(612, 742), { pose: { raise: 'r' } })],
      over: () => sub(1, 'maya', 'T\'as pas besoin d\'un tournage. Tes trois vidéos suffisent. Mets-les dans Stalak avec ton son.') },
    { t: '0:50', cap: 'Stalak, les vraies captures', set: KITCHEN, chars: [], shade: true,
      over: () => phoneBig(stalakScreen('fr-edit', 'hype'), 0.92) + sub(1, 'narrateur', 'Son son, les vidéos qu\'il avait déjà. Stalak coupe sur le rythme et garde la synchro des lèvres.') },
    { t: '0:58', cap: 'Retour au début : le clip', set: KITCHEN, chars: [CH('nadia', 2, 760, 1856, 1250, 'colere', P.phone(580, 1130, '#ffe066')), LI(330, 1846, 1170, 'frime')],
      over: () => sub(1, 'liam', 'T\'es dans le refrain, Maman.') },
    { t: '1:04', cap: 'Liam parle à celui qui regarde', set: KITCHEN, chars: [LI(540, 2730, 2250, 'frime', P.sponge(612, 742), { pose: { raise: 'r' } })],
      over: () => sub(1, 'liam', 'Toi aussi, t\'as un son et des vidéos de toi qui dorment dans ta galerie ? T\'as déjà un clip.') },
    { t: '1:10', cap: 'La carte de fin', plain: true, over: () => endCard('IL A PASSÉ LA NUIT SUR SA VIDÉO DE PROMO') },
  ]);

  ep('ep2', 'IL A PASSÉ LA NUIT SUR SA VIDÉO DE PROMO', 2, [
    { t: '0:00', cap: "L'accroche : la nuit, devant l'ordi", set: ROOMN0, zoom: [290, 900, 1.7], chars: [LI(540, 2900, 2300, 'colere+cerne', HP)],
      over: () => `<rect width="1080" height="1920" fill="#57adff" opacity="0.10"/>` + bandeau(2, 'IL A PASSÉ LA NUIT SUR SA VIDÉO DE PROMO', 2) + sub(1, 'liam', 'Pourquoi ma bouche est décalée ?!') },
    { t: '0:03', cap: 'Le narrateur présente Liam', set: ROOMN, chars: [LI(230, 1490, 1000, 'frime+cerne', HP)],
      over: () => tag('LIAM, ALIAS T-CRAZY', 650, 640) + sub(1, 'narrateur', 'Voici Liam. 15 ans. Zéro abonné. Il vient d\'écrire le son de l\'année.') },
    { t: '0:10', cap: "Retour en fin d'après-midi : sûr de lui", set: ROOM, chars: [LI(560, 1846, 1250, 'frime', P.phone(606, 760), { pose: { raise: 'r' } })],
      over: () => sub(1, 'liam', 'Une vidéo de promo ? Dix minutes, max.') },
    { t: '0:16', cap: "L'horloge tourne : six heures plus tard", set: ROOMN, dim: 0.35,
      over: () => clockBig(610, 560, 230) + headAt('panique+cerne', 300, 1060, 1.7, hp()) + sub(1, 'narrateur', 'Six heures plus tard, il découvre le vrai boss de fin : caler sa bouche sur son son.') },
    { t: '0:22', cap: 'Il recale sa bouche image par image', set: ROOMN0, zoom: [640, 1060, 1.6], dim: 0.45,
      over: () => laptopBig(editor()) + headAt('colere+cerne', 300, 1150, 1.9, hp()) + sub(1, 'liam', 'Là, c\'est bon. Non. Là ! Non plus !') },
    { t: '0:28', cap: 'Il poste quand même : un commentaire', set: ROOMN, over: () => phoneBig(postScreen('Ta bouche est décalée sur toute la vidéo.'), 0.92) + sub(1, 'liam', 'Un commentaire !') },
    { t: '0:36', cap: 'Maya à la fenêtre de sa chambre', set: ROOM, chars: [CH('maya', 1, 865, 1490, 1150, 'frime', '', { clip: [712, 500, 306, 296], after: winPhone(712, 500, 306, 296, 760, 800) }), LI(380, 1846, 1200, 'frime')],
      over: () => sub(1, 'maya', 'Tu sais que ta bouche est décalée sur toute la vidéo, là ?') },
    { t: '0:44', cap: 'Le téléphone de Maya : Stalak', set: ROOM, shade: true, over: () => phoneBig(stalakScreen('fr-takes', 'shock'), 0.92) + sub(1, 'maya', 'Tu mets ton son et tes prises.') },
    { t: '0:50', cap: 'Le clip de Liam, synchronisé', set: ROOM, shade: true, over: () => phoneBig(stalakScreen('fr-edit', 'cool'), 0.92) + sub(1, 'maya', 'Stalak coupe sur le rythme, et ta bouche reste synchro.') },
    { t: '0:56', cap: 'Liam regarde son clip, ému', set: ROOM, chars: [LI(360, 1846, 1200, 'fierte+larme', P.phone(606, 760), { pose: { raise: 'r' } }), CH('maya', 1, 780, 1850, 1180, 'frime', P.phone(580, 1130))],
      over: () => sub(1, 'maya', 'Pas pour rien. T\'as appris la patience.') },
    { t: '1:02', cap: 'Liam parle à celui qui regarde', set: ROOM0, zoom: [500, 960, 1.3], chars: [LI(540, 2730, 2250, 'frime', P.phone(606, 760), { pose: { raise: 'r' } })],
      over: () => sub(1, 'liam', 'Si toi aussi tu passes tes nuits à recaler ta bouche sur ton son, arrête. Stalak le fait pour toi.') },
    { t: '1:10', cap: 'La carte de fin (le prochain à sortir : GTA 6, le 19 au soir)', plain: true, over: () => endCard(GTA) },
  ]);

  // the GTA 6 episode comes out on 19/11 in the evening, right after episode 2 : number 3 on screen. GTA 6 : the name only, the game never shown.
  const GTA = 'IL SORT SON SON LE JOUR DE GTA 6';
  ep('ep4', GTA, 3, [
    { t: '0:00', cap: "L'accroche : Deuce n'en revient pas", set: ROOM, chars: [LI(230, 1490, 1000, 'frime', HP), CH('deuce', 1, 690, 2520, 1950, 'panique')],
      over: () => bandeau(2, GTA, 3) + sub(1, 'deuce', 'Sortir ton son le jour de GTA 6 ?! T\'es fou !') },
    { t: '0:03', cap: 'Le narrateur présente Liam et Deuce', set: ROOM, chars: [LI(230, 1490, 1000, 'frime', HP), CH('deuce', 1, 740, 1846, 1200, 'frime')],
      over: () => tag('LIAM, ALIAS T-CRAZY', 330, 430, -3) + tag('DEUCE', 760, 590, 3) + sub(1, 'narrateur', 'Voici Liam. 15 ans. Zéro abonné. Il a choisi la pire date de l\'année pour sortir son son.') },
    { t: '0:10', cap: 'Liam, sûr de lui', set: ROOM0, zoom: [560, 960, 1.3], chars: [LI(360, 2250, 1500, 'frime', HP), CH('deuce', 1, 820, 2250, 1460, 'colere')],
      over: () => sub(1, 'liam', 'Justement. Tout le monde sera chez soi, devant un écran.') },
    { t: '0:18', cap: 'Le terrain et le lycée, vides', plain: true,
      over: () => band(TERRAIN, 0, 700, 560, 1000, 0.9, 'ta') + band(LYCEE, 712, 1208, 540, 1436, 0.9, 'ly') + `<rect x="-10" y="700" width="1100" height="12" fill="${INK}"/>` + sub(1, 'narrateur', 'Le 19 novembre, jour de la sortie de GTA 6, tout le quartier a disparu.') },
    { t: '0:24', cap: "L'épicerie : « FERMÉ »", set: STREET, zoom: [668, 1100, 1.5], front: closed, chars: [CH('reyes', 1, 560, 1580, 820, 'frime', '', { clip: [303, 675, 476, 585], after: glare(303, 675, 476, 585) })],
      over: () => sub(1, 'reyes', 'Je vais jouer.') },
    { t: '0:28', cap: 'Son son avec une image fixe', set: ROOM, over: () => phoneBig(stillPost(), 0.92) + sub(1, 'liam', 'Zéro écoute. Même pas ma mère.') },
    { t: '0:32', cap: "Nadia, hors champ : la lumière d'un écran", set: KITCHEN, dim: 0.5, chars: [LI(780, 1846, 1200, 'colere', P.phone(606, 760), { pose: { raise: 'r' } })],
      over: () => screenLight(300, 760) + sub(1, 'nadia', 'Pas maintenant, je suis en pleine mission !') },
    { t: '0:36', cap: 'Maya arrive en faisant défiler son téléphone', set: STREET, setOver: closed, chars: [CH('maya', 1, 300, 1846, 1180, 'frime', P.phone(580, 1130)), LI(760, 1846, 1200, 'panique')],
      over: () => sub(1, 'maya', 'Ils jouent, oui. Mais entre deux parties, ils scrollent.') },
    { t: '0:44', cap: 'Il filme trois prises dans le placard', set: ROOM0, zoom: [290, 900, 1.7], chars: [LI(420, 2250, 1500, 'fierte', P.phoneBack(606, 740), { pose: { raise: 'r' } })],
      over: () => sub(1, 'narrateur', 'Son son, trois prises dans un placard.') },
    { t: '0:50', cap: 'Stalak, les vraies captures', set: ROOM, shade: true, over: () => phoneBig(stalakScreen('fr-clip', 'hype'), 0.92) + sub(1, 'narrateur', 'Stalak coupe sur le rythme et garde la synchro des lèvres.') },
    { t: '0:56', cap: 'Le téléphone vibre', set: ROOM, chars: [LI(540, 1846, 1250, 'fierte', P.phoneBack(606, 740), { pose: { raise: 'r' } })],
      over: () => notif('Nadia a aimé ta vidéo.', 330) + sub(1, 'liam', 'Ma mère a liké pendant sa partie !') },
    { t: '1:02', cap: 'Liam parle à celui qui regarde', set: ROOM0, zoom: [500, 960, 1.3], chars: [LI(540, 2730, 2250, 'frime', P.phone(606, 760), { pose: { raise: 'r' } })],
      over: () => sub(1, 'liam', 'Tout le monde est sur GTA 6 ? Entre deux parties, ils scrollent. Sois dans leur fil avec un clip, pas juste un son.') },
    { t: '1:10', cap: 'La carte de fin', plain: true, over: () => endCard('SON POTE S\'EST NOMMÉ SON MANAGER') },
  ], "Sort le 19/11 au soir, jour de GTA 6, juste après l'épisode 2 : c'est l'épisode 3 à l'écran.");

  // the manager episode comes out on 20/11, after the GTA 6 one : number 4 on screen
  ep('ep3', 'SON POTE S\'EST NOMMÉ SON MANAGER', 4, [
    { t: '0:00', cap: "L'accroche : les bras chargés de glaçons", set: STREET, chars: [LI(420, 1846, 1250, 'colere', BAGS(4)), CH('deuce', 1, 860, 1846, 1180, 'frime')],
      over: () => bandeau(2, 'SON POTE S\'EST NOMMÉ SON MANAGER', 4) + sub(1, 'liam', 'Mon manager m\'a fait acheter douze sachets de glaçons !') },
    { t: '0:03', cap: 'Le narrateur présente Deuce', set: STREET, chars: [CH('deuce', 1, 380, 1846, 1300, 'frime'), LI(800, 1846, 1150, 'colere', BAGS(4))],
      over: () => tag('DEUCE', 380, 470, -3) + tag('LIAM, ALIAS T-CRAZY', 720, 640, 3) + sub(1, 'narrateur', 'Voici Deuce. Le manager de Liam. Personne ne lui a demandé.') },
    { t: '0:10', cap: 'Deuce déroule son plan, très sérieux', set: STREET, zoom: [700, 1150, 1.3], chars: [CH('deuce', 1, 600, 2700, 2150, 'frime'), LI(160, 2300, 1500, 'panique')],
      over: () => sub(1, 'deuce', 'Le plan est simple : un clip devant l\'épicerie, une seule prise, et demain, t\'es partout.') },
    { t: '0:18', cap: 'Ils filment. M. Reyes sort', set: STREET, chars: [CH('deuce', 1, 170, 1846, 1150, 'frime', P.phone(580, 1130)), LI(500, 1846, 1200, 'fierte'), CH('reyes', 1, 880, 1856, 1250, 'colere')],
      over: () => sub(1, 'reyes', 'Pas de tournage devant ma boutique. Sauf si t\'achètes quelque chose.') },
    { t: '0:26', cap: 'Prise 4 : un bus passe', set: STREET, chars: [LI(420, 1846, 1200, 'fierte')],
      over: () => bus(-60, 1900, 1040) + clap(820, 330, 4) + sub(1, 'narrateur', 'Prise douze.') },
    { t: '0:28', cap: 'Prise 9 : un chien aboie, Deuce filme à l\'horizontale', set: STREET, chars: [CH('deuce', 1, 200, 1846, 1150, 'frime', phoneWide(580, 1120)), LI(560, 1846, 1200, 'panique')],
      over: () => `<g transform="translate(860 1520) scale(1.5) translate(-860 -1520)">${dog(860, 1520)}</g>` + clap(820, 330, 9, 5) + sub(1, 'narrateur', 'Douze sachets de glaçons.') },
    { t: '0:31', cap: 'Prise 12 : M. Reyes tend la main, un sachet de plus', set: STREET, chars: [LI(330, 1846, 1200, 'panique', BAGS(6)), CH('reyes', 1, 820, 1856, 1250, 'frime', bigBag(590, 1150, 8, 1.5))],
      over: () => clap(800, 330, 12) + sub(1, 'narrateur', 'Et toujours pas de clip.') },
    { t: '0:36', cap: 'Big Mo passe, avec ses deux suiveurs', set: STREET, chars: [CH('deuce', 2, 360, 1700, 1050, 'frime', '', { sil: true }), CH('bigmo', 2, 860, 1700, 1080, 'frime', '', { sil: true }), CH('bigmo', 1, 620, 1846, 1350, 'frime'), LI(170, 1846, 1100, 'panique', BAGS(2))],
      over: () => sub(1, 'bigmo', 'Encore toi, le petit ? Moi, j\'ai posté trois clips ce matin.') },
    { t: '0:44', cap: "Liam s'effondre sur le trottoir. Maya passe", set: STREET, zoom: [540, 1350, 1.25], chars: [CH('maya', 1, 880, 1900, 1420, 'frime', P.phone(580, 1130))],
      over: () => lying('panique', 400, 1150, 0.55) + bigBag(110, 1190, -20, 1.4) + bigBag(690, 1200, 14, 1.4) + bigBag(600, 1110, -6, 1.4) + sub(1, 'maya', 'Il fait pas trois tournages. Il filme ses prises, et Stalak fait le montage.') },
    { t: '0:50', cap: 'Stalak, avec ses douze prises', set: STREET, shade: true, over: () => phoneBig(stalakScreen('fr-takes', 'cool'), 0.92) + sub(1, 'narrateur', 'Ses douze prises, Stalak les coupe sur le rythme, en gardant la synchro des lèvres.') },
    { t: '0:58', cap: 'M. Reyes regarde le clip par-dessus son épaule', set: STREET, chars: [CH('reyes', 1, 640, 1790, 1300, 'frime'), LI(470, 1880, 1200, 'fierte', P.phoneBack(606, 740), { pose: { raise: 'r' } })],
      over: () => sub(1, 'reyes', 'Pas mal. Pour le prochain clip, j\'ai une promo sur les glaçons.') },
    { t: '1:02', cap: 'Liam parle à celui qui regarde', set: STREET, zoom: [540, 1150, 1.3], chars: [LI(540, 2730, 2250, 'frime', P.phone(606, 760), { pose: { raise: 'r' } })],
      over: () => sub(1, 'liam', 'Pas de manager, pas de budget ? T\'as un téléphone. Filme tes prises, Stalak fait le montage.') },
    { t: '1:10', cap: 'La carte de fin', plain: true, over: () => endCard('IL VOULAIT UN CLIP COMME DANS GTA') },
  ], "Sort le 20/11, après l'épisode GTA 6 : c'est l'épisode 4 à l'écran.");

  const SUNSET = ['rue', 1, 'jour'];
  ep('ep5', 'IL VOULAIT UN CLIP COMME DANS GTA', 5, [
    { t: '0:00', cap: "L'accroche : ils filent avec la plante", set: SUNSET, setOver: sunset, chars: [CH('reyes', 1, 900, 1470, 640, 'colere'), CH('deuce', 1, 600, 1640, 1240, 'fierte', P.plant(600, 1080)), LI(470, 1700, 1150, 'panique')],
      over: () => scooter(470, 1198, 1700) + bandeau(2, 'IL VOULAIT UN CLIP COMME DANS GTA', 5) + sub(1, 'reyes', 'Rendez-moi ma plante !') },
    { t: '0:03', cap: 'Le narrateur présente Deuce', set: SUNSET, setOver: sunset, chars: [CH('deuce', 1, 380, 1846, 1300, 'fierte'), LI(800, 1846, 1150, 'frime')],
      over: () => tag('DEUCE', 380, 470, -3) + tag('LIAM, ALIAS T-CRAZY', 720, 640, 3) + sub(1, 'narrateur', 'Voici Deuce. Il a vu la bande-annonce de GTA 6. Il a maintenant une vision.') },
    { t: '0:10', cap: 'Deuce décrit son clip, les yeux dans le vague', set: SUNSET, setOver: sunset, zoom: [540, 1150, 1.3], chars: [CH('deuce', 1, 540, 2900, 2050, 'fierte')],
      over: () => dream(540, 560) + `<circle cx="600" cy="840" r="34" fill="${SNOW}" stroke="${INK}" stroke-width="7"/><circle cx="570" cy="905" r="20" fill="${SNOW}" stroke="${INK}" stroke-width="6"/>` + sub(1, 'deuce', 'On va faire un clip comme dans GTA. Des voitures de luxe, des palmiers, un hélicoptère.') },
    { t: '0:15', cap: 'Ce qu\'ils ont vraiment : un scooter, une plante', set: SUNSET, setOver: sunset, chars: [LI(330, 1846, 1200, 'colere'), CH('deuce', 1, 820, 1846, 1180, 'frime', P.plant(590, 1090))],
      over: () => `<g transform="translate(540 1480) scale(0.7) translate(-540 -1480)">${scooter(540, 1080, 1700, 0.57)}</g>` + sub(1, 'liam', 'On a un scooter.') },
    { t: '0:18', cap: 'Le tournage : le scooter cale, le ventilateur-hélico', set: SUNSET, setOver: sunset, chars: [LI(420, 1700, 1150, 'panique'), CH('deuce', 1, 880, 1846, 1150, 'fierte', fan(640, 1000))],
      over: () => scooter(420, 1198, 1700) + smoke(170, 1580) + P.plant(120, 1300) + sub(1, 'narrateur', 'Budget du clip : un scooter emprunté et une plante verte.') },
    { t: '0:26', cap: 'M. Reyes les a retrouvés', set: SUNSET, setOver: sunset, zoom: [700, 1150, 1.2], chars: [CH('reyes', 1, 640, 2500, 1900, 'colere')],
      over: () => sub(1, 'reyes', 'Rendez-moi ma plante !') },
    { t: '0:30', cap: 'Liam fait défiler ses douze prises', set: SUNSET, setOver: sunset, over: () => phoneBig(gallery12(), 0.92) + sub(1, 'liam', 'C\'est nul. On dirait pas du tout un jeu vidéo.') },
    { t: '0:38', cap: 'Maya passe, le téléphone à la main', set: SUNSET, setOver: sunset, chars: [CH('maya', 1, 760, 1846, 1180, 'frime', P.phone(580, 1130)), LI(320, 1846, 1200, 'colere')],
      over: () => sub(1, 'maya', 'Les gens veulent pas un jeu vidéo. Ils veulent te voir rapper ton son.') },
    { t: '0:46', cap: 'Stalak : le son, les douze prises', set: SUNSET, setOver: sunset, shade: true, over: () => phoneBig(stalakScreen('fr-song', 'cool'), 0.92) + sub(1, 'narrateur', 'Un scooter, une plante, douze prises.') },
    { t: '0:52', cap: 'Le clip, synchronisé, tout tombe sur le temps', set: SUNSET, setOver: sunset, shade: true, over: () => phoneBig(stalakScreen('fr-edit', 'cool'), 0.92) + sub(1, 'narrateur', 'Stalak les coupe sur le rythme, en gardant la synchro des lèvres.') },
    { t: '0:58', cap: 'Deuce, très fier', set: SUNSET, setOver: sunset, chars: [LI(320, 1846, 1200, 'colere'), CH('deuce', 1, 780, 1846, 1230, 'fierte')],
      over: () => sub(1, 'deuce', 'Je l\'avais dit : façon GTA.') },
    { t: '1:02', cap: 'Liam parle à celui qui regarde', set: SUNSET, setOver: sunset, zoom: [540, 1150, 1.3], chars: [LI(540, 2730, 2250, 'frime', P.phone(606, 760), { pose: { raise: 'r' } })],
      over: () => sub(1, 'liam', 'Pas besoin d\'un budget de jeu vidéo. Ton son, tes prises au téléphone, et Stalak coupe sur le rythme.') },
    { t: '1:10', cap: 'La carte de fin', plain: true, over: () => endCard('LE CLASH AU TERRAIN') },
  ], "Sort le 21/11. GTA 6 : le nom seulement, jamais le jeu. À faire vérifier par Juridique.");

  window.STORYBOARD = { BOARDS, P, band, hp, headAt, phoneBig, laptopBig, take, editor, clockBig, postScreen, winPhone, gallery, stalakScreen, notif, comment, tag, endCard };
})();
