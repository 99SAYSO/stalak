/* Série « T-Crazy » — the storyboards of the validated scripts (step « visuels » of Studio Stalak) : one still per moment
   of the script, drawn with the chosen characters, sets, banner and subtitles (frame.js). The owner validates these
   stills before any voice or animation. Props are drawn here, in the series style ; the Stalak screen too (owner, 16/11 :
   never a real capture, never his own footage), with Liam's videos, and the official mascot stickers (site_src/emoji).
   GTA 6 : the name only, never the game.
   (Marketing & croissance, 16/11/2026) */
(function () {
  const INK = '#0a0d14', BLUE = '#1f6fd6', ICE = '#d6ecff', NIGHT = '#0e3f8f', SNOW = '#fdfeff';
  const { bandeau, sub, FRAMES } = FRAME;
  const T = (x, y, t, size, fill, o = {}) => `<text x="${x}" y="${y}" text-anchor="${o.anchor || 'middle'}" font-family="${o.font || 'Lilita One'}"${o.weight ? ` font-weight="${o.weight}"` : ''} font-size="${size}" fill="${fill}"${o.stroke ? ` stroke="${o.stroke}" stroke-width="${o.sw}" paint-order="stroke" stroke-linejoin="round"` : ''}>${t}</text>`;

  // ---------------- props, in a character's own coordinates (front figures : hands near 320/580, 1170) ----------------
  const P = {
    phone: (x, y, glow = '#8fd3ff') => `<g transform="translate(${x} ${y})"><rect x="-26" y="-50" width="52" height="96" rx="10" fill="#2a2d36" stroke="${INK}" stroke-width="5"/><rect x="-19" y="-42" width="38" height="78" rx="5" fill="${glow}" class="screen" data-glow="${glow}"/><rect x="-12" y="-36" width="24" height="5" rx="2.5" fill="#ffffff" opacity="0.7"/></g>`,
    sponge: (x, y) => `<g transform="translate(${x} ${y}) rotate(-10)"><rect x="-38" y="-22" width="76" height="44" rx="10" fill="#f2d24b" stroke="${INK}" stroke-width="5"/><rect x="-38" y="-22" width="76" height="16" rx="8" fill="#3fa34d" stroke="${INK}" stroke-width="5"/><circle cx="-14" cy="10" r="3" fill="#c9a52c"/><circle cx="10" cy="6" r="2.5" fill="#c9a52c"/><circle cx="22" cy="14" r="2" fill="#c9a52c"/></g>`,
    // a bag of ice cubes, our own design (« GLAÇONS », no brand)
    icebag: (x, y, r = 0) => `<g transform="translate(${x} ${y}) rotate(${r})"><path d="M -40 -50 L 40 -50 L 46 50 C 20 60 -20 60 -46 50 Z" fill="#eef7ff" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><rect x="-30" y="-14" width="60" height="26" rx="5" fill="${BLUE}"/>${T(0, 7, 'GLAÇONS', 15, SNOW)}<path d="M -40 -50 L 40 -50 L 34 -64 L -34 -64 Z" fill="#cfe6fb" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><circle class="shiny" cx="-24" cy="-30" r="8" fill="none"/></g>`,
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
    phoneBack: (x, y) => `<g transform="translate(${x} ${y})"><rect x="-28" y="-52" width="56" height="100" rx="11" fill="#1d1f27" stroke="${INK}" stroke-width="5"/><rect x="-18" y="-42" width="22" height="34" rx="7" fill="#2f323d"/><circle cx="-7" cy="-33" r="6" fill="#0b0d12" stroke="#4a4f5c" stroke-width="2"/><circle cx="-7" cy="-17" r="6" fill="#0b0d12" stroke="#4a4f5c" stroke-width="2"/><circle class="shiny" cx="-7" cy="-33" r="7" fill="none"/></g>`,
    plant: (x, y) => `<g transform="translate(${x} ${y})"><path d="M -40 0 L 40 0 L 30 70 L -30 70 Z" fill="#c4683a" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>${[[-60, -120, -30], [0, -170, 0], [55, -125, 30], [-30, -80, -60], [35, -85, 55]].map(([dx, dy, r]) => `<path d="M 0 0 Q ${dx * 0.4} ${dy * 0.5} ${dx} ${dy} Q ${dx * 0.7 + 18} ${dy * 0.6} 0 0 Z" fill="#3f9a5a" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`).join('')}</g>`,
  };

  // the headphones in the head's own coordinates (face centre 0,0 ; ears at ±83..109)
  function hp() {
    const band = 'M -110 4 C -124 -118 -70 -182 0 -184 C 70 -182 124 -118 110 4';
    return `<path d="${band}" fill="none" stroke="${INK}" stroke-width="26" stroke-linecap="round"/><path d="${band}" fill="none" stroke="#2a2d36" stroke-width="14" stroke-linecap="round"/>` +
      [-1, 1].map(k => `<rect x="${k * 108 - 24}" y="-40" width="48" height="88" rx="22" fill="#2a2d36" stroke="${INK}" stroke-width="6"/><rect x="${k * 108 - 12}" y="-24" width="24" height="56" rx="12" fill="${BLUE}"/>`).join('');
  }
  // Liam's head alone, big, anywhere in the frame (a reaction in a corner, a thumbnail)
  const headAt = (expr, x, y, k, extra = '', live = true) => {
    const r = LIAM.headOnly(4, expr);
    if (!FRAME.ANIM || !live) return `<defs>${r.defs}</defs><g transform="translate(${x} ${y}) scale(${k})">${r.svg}${extra}</g>`;
    const rT = LIAM.headOnly(4, expr + '+parle'), rB = LIAM.headOnly(4, expr + '+cligne');
    return `<defs>${r.defs}${rT.defs}${rB.defs}</defs><g class="head" data-who="liam" data-fx="${x}" data-fy="${y + 120 * k}"><g transform="translate(${x} ${y}) scale(${k})"><g class="fig">${r.svg}</g><g class="figT" display="none">${rT.svg}</g><g class="figB" display="none">${rB.svg}</g>${extra}</g></g>`;
  };

  // ---------------- screens and cards over the whole frame ----------------
  const img = (href, x, y, w, h, extra = '') => `<image href="${href}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice"${extra}/>`;
  // a big phone in the middle of the frame ; inner = what its screen shows (in screen coordinates 0..560 × 0..1000)
  // o.dl : the phone pops in that late (the shot first shows who holds it)
  function phoneBig(inner, k = 1, o = {}) {
    const W = 600, H = 1080, x = 540 - W / 2, y = 250, dim = `<rect width="1080" height="1920" fill="${INK}" opacity="0.5"/>`;
    return (o.dl != null ? K({ fadein: [o.dl, o.dl + 0.25] }, dim) : dim) + `<g class="phone"${o.dl != null ? ` data-dl="${o.dl}"` : ''}><g transform="translate(540 ${y + H / 2}) scale(${k}) translate(-540 ${-(y + H / 2)})">` +
      (window.LIGHTS ? `<g style="mix-blend-mode:screen">${LIGHTS.halo(540, y + H / 2, 470, '#8fd3ff', 0.3, { ry: 760, c1: 0.2, skirt: 0.55 })}</g>` : '') +
      `<rect x="${x + 12}" y="${y + 16}" width="${W}" height="${H}" rx="64" fill="${INK}" opacity="0.55"/>` +
      `<rect x="${x}" y="${y}" width="${W}" height="${H}" rx="64" fill="#2a2d36" stroke="${INK}" stroke-width="12"/>` +
      `<clipPath id="scr${++UID}"><rect x="${x + 20}" y="${y + 40}" width="${W - 40}" height="${H - 80}" rx="40"/></clipPath>` +
      `<g clip-path="url(#scr${UID})"><rect x="${x + 20}" y="${y + 40}" width="${W - 40}" height="${H - 80}" fill="${NIGHT}"/><g transform="translate(${x + 20} ${y + 40})">${inner}</g>` +
      // the lights (16/11, 19 h 32) : the glass of the screen catches the light, a shine crosses it now and then
      `<path d="M ${x + 20} ${y + 520} L ${x + 330} ${y + 40} L ${x + 400} ${y + 40} L ${x + 20} ${y + 630} Z" fill="#ffffff" opacity="0.05"/>` + K({ sweep: [7, 1.2, 1.1, 900, 0] }, `<path d="M ${x - 420} ${y + 1040} L ${x - 40} ${y + 40} L ${x + 30} ${y + 40} L ${x - 350} ${y + 1040} Z" fill="#ffffff" opacity="0.16"/>`) + `</g>` +
      `<rect x="${540 - 50}" y="${y + 14}" width="100" height="12" rx="6" fill="#4a4f5c"/></g></g>`;
  }
  let UID = 0;
  // ---------------- 16/11 (owner) : the little actions that make a screen understandable ----------------
  // K(o, inner) : something that happens during the shot, in seconds from its start (anim.js kf : in, out, pop, gone, path,
  // lin, osc, hop, spin, blink, fadein, fade, ripple). On a still storyboard image everything shows.
  const K = (o, inner) => `<g data-k='${JSON.stringify(o)}'>${inner}</g>`;
  // the name of a track in the editor
  const chipT = (text, x, y, c) => `<rect x="${x}" y="${y - 22}" width="92" height="40" rx="10" fill="#0b0d12" stroke="${c}" stroke-width="3"/>` + T(x + 46, y + 7, text, 22, c, { font: 'Rubik', weight: 800 });
  // the icons of a video feed (our own drawing) : a heart, a comment bubble, a share arrow
  const ICON = {
    heart: (x, y, c = SNOW) => `<path d="M ${x} ${y + 20} C ${x - 6} ${y + 14} ${x - 30} ${y} ${x - 30} ${y - 13} C ${x - 30} ${y - 30} ${x - 9} ${y - 34} ${x} ${y - 19} C ${x + 9} ${y - 34} ${x + 30} ${y - 30} ${x + 30} ${y - 13} C ${x + 30} ${y} ${x + 6} ${y + 14} ${x} ${y + 20} Z" fill="${c}" stroke="${INK}" stroke-width="3"/>`,
    bubble: (x, y) => `<path d="M ${x - 30} ${y - 4} C ${x - 30} ${y - 22} ${x - 16} ${y - 28} ${x} ${y - 28} C ${x + 16} ${y - 28} ${x + 30} ${y - 22} ${x + 30} ${y - 4} C ${x + 30} ${y + 14} ${x + 16} ${y + 20} ${x} ${y + 20} L ${x - 8} ${y + 20} L ${x - 22} ${y + 32} L ${x - 18} ${y + 16} C ${x - 26} ${y + 12} ${x - 30} ${y + 6} ${x - 30} ${y - 4} Z" fill="${SNOW}" stroke="${INK}" stroke-width="3"/>` + [-12, 0, 12].map(d => `<circle cx="${x + d}" cy="${y - 4}" r="3.5" fill="${INK}"/>`).join(''),
    share: (x, y) => `<path d="M ${x - 28} ${y + 22} C ${x - 26} ${y - 4} ${x - 8} ${y - 14} ${x + 6} ${y - 14} L ${x + 6} ${y - 30} L ${x + 32} ${y - 4} L ${x + 6} ${y + 22} L ${x + 6} ${y + 6} C ${x - 8} ${y + 6} ${x - 20} ${y + 10} ${x - 28} ${y + 22} Z" fill="${SNOW}" stroke="${INK}" stroke-width="3"/>`,
  };
  // a vertical video in a feed, as on TikTok (our own drawing, no logo) : the picture, the likes, comments and shares on the
  // right, the name, the caption and the sound at the bottom (owner, 16/11 : « une sorte de TikTok, avec les likes sur le côté,
  // le pseudo, le logo des commentaires »). pic : the post, in 0..560 × 0..1000
  function feed(pic, o = {}) {
    let s = `<rect width="560" height="1000" fill="#0b0d12"/>${pic}<rect x="0" y="790" width="560" height="210" fill="#0b0d12" opacity="0.35"/>`;
    s += T(196, 66, 'Abonnements', 26, '#b9c2d3', { font: 'Rubik', weight: 700, stroke: INK, sw: 4 }) + T(372, 66, 'Pour toi', 28, SNOW, { font: 'Rubik', weight: 800, stroke: INK, sw: 4 }) + `<rect x="342" y="80" width="60" height="5" rx="2.5" fill="${SNOW}"/>`;
    const X = 498, cnt = (v, y) => T(X, y, String(v), 26, SNOW, { font: 'Rubik', weight: 800, stroke: INK, sw: 5 });
    s += `<circle cx="${X}" cy="470" r="34" fill="${BLUE}" stroke="${SNOW}" stroke-width="4"/>${T(X, 483, 'T', 34, SNOW)}<circle cx="${X}" cy="504" r="13" fill="#e5484d"/>${T(X, 513, '+', 24, SNOW, { font: 'Rubik', weight: 800 })}`;
    s += ICON.heart(X, 586) + cnt(o.likes, 642) + ICON.bubble(X, 704) + cnt(o.comments, 758) + ICON.share(X, 812) + cnt(o.shares, 866);
    s += T(26, 878, '@' + o.user, 30, SNOW, { font: 'Rubik', weight: 800, anchor: 'start', stroke: INK, sw: 5 });
    s += T(26, 920, o.caption, 26, SNOW, { font: 'Rubik', weight: 700, anchor: 'start', stroke: INK, sw: 5 });
    return s + T(26, 962, '♫ ' + o.sound, 24, SNOW, { font: 'Rubik', weight: 700, anchor: 'start', stroke: INK, sw: 5 });
  }
  // posting a video, step by step (owner, 16/11 : « on ne sait même pas qu'il a posté la vidéo ») : the page of the new post and
  // its « Publier » button, a finger taps it (at o.at s), « Vidéo publiée ! », then the post in the feed (o.feed) ; o.after : drawn
  // over the feed (a notification, the comments)
  function publish(o) {
    const a = o.at, end = a + 0.6;
    let page = `<rect width="560" height="1000" fill="#f3f6fb"/><rect width="560" height="96" fill="${SNOW}"/><path d="M 0 96 L 560 96" stroke="#d5dbe6" stroke-width="3"/>${T(280, 64, 'Nouvelle vidéo', 34, INK)}`;
    page += `<clipPath id="pb${++UID}"><rect x="157" y="124" width="246" height="440" rx="18"/></clipPath><g clip-path="url(#pb${UID})"><g transform="translate(157 124) scale(0.44)">${o.pic}</g></g><rect x="157" y="124" width="246" height="440" rx="18" fill="none" stroke="${INK}" stroke-width="5"/>`;
    page += `<rect x="30" y="600" width="500" height="120" rx="18" fill="${SNOW}" stroke="#c3cbd8" stroke-width="3"/>${T(54, 650, o.feed.caption, 28, INK, { font: 'Rubik', weight: 700, anchor: 'start' })}${T(54, 696, '#rap #nouveauson', 24, BLUE, { font: 'Rubik', weight: 700, anchor: 'start' })}`;
    const btn = (fill) => `<rect x="30" y="820" width="500" height="96" rx="26" fill="${fill}" stroke="${INK}" stroke-width="5"/>${T(280, 886, 'Publier', 46, SNOW)}`;
    page += btn(BLUE) + K({ in: a, out: a + 0.25 }, btn(NIGHT));
    page += K({ in: a - 0.35, pop: 0.5, out: a + 0.3, path: [[a - 0.35, 70, 110], [a, 0, 0]] }, `<circle cx="300" cy="880" r="30" fill="${SNOW}" fill-opacity="0.85" stroke="${INK}" stroke-width="4"/>`);
    page += K({ ripple: [a, a + 0.45] }, `<circle cx="300" cy="880" r="56" fill="none" stroke="${SNOW}" stroke-width="10"/>`);
    let s = K({ out: end }, page) + K({ in: end }, feed(o.pic, o.feed)) + (o.after || '');
    return s + K({ in: a + 0.25, pop: 0.3, gone: [end + 0.5, end + 0.7] }, `<g transform="translate(280 470)"><rect x="-214" y="-60" width="428" height="120" rx="30" fill="${SNOW}" stroke="${INK}" stroke-width="6"/><circle cx="-146" cy="0" r="34" fill="#3fbf7f" stroke="${INK}" stroke-width="4"/><path d="M -162 0 l 11 11 l 22 -24" fill="none" stroke="${SNOW}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>${T(40, 14, 'Vidéo publiée !', 38, INK)}</g>`);
  }
  // a notification that drops from the top of a phone screen ; col : the colour of the avatar
  const notifTop = (who, text, col) => `<g transform="translate(16 18)"><rect width="528" height="112" rx="26" fill="${SNOW}" stroke="${INK}" stroke-width="5"/><circle cx="58" cy="56" r="34" fill="${col}"/>${T(58, 69, who[0].toUpperCase(), 34, SNOW)}` +
    `${T(108, 48, who, 26, '#7a8091', { font: 'Rubik', weight: 700, anchor: 'start' })}${T(108, 88, text, 27, INK, { font: 'Rubik', weight: 800, anchor: 'start' })}</g>`;
  // the comments of a post, slid up from the bottom of the screen
  function comments(who, text, col) {
    let s = `<rect x="0" y="560" width="560" height="460" rx="32" fill="${SNOW}" stroke="${INK}" stroke-width="5"/>${T(280, 614, '1 commentaire', 26, '#5b6170', { font: 'Rubik', weight: 800 })}`;
    s += `<circle cx="64" cy="690" r="34" fill="${col}"/>${T(64, 703, who[0].toUpperCase(), 34, SNOW)}${T(116, 674, who, 26, '#7a8091', { font: 'Rubik', weight: 700, anchor: 'start' })}`;
    const words = text.split(' '), out = []; let line = '';
    words.forEach(w => { if ((line + ' ' + w).trim().length > 24) { out.push(line); line = w; } else line = (line + ' ' + w).trim(); }); out.push(line);
    return s + out.map((l, i) => T(116, 718 + i * 42, l, 32, INK, { font: 'Rubik', weight: 800, anchor: 'start' })).join('');
  }
  // a tumbleweed (a ball of dry grass, as in a western) : nobody is there
  function tumbleweed(cx, cy, r) {
    let s = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#c9a26b" opacity="0.28"/>`;
    for (let i = 0; i < 16; i++) {
      const a = i * 2.39, b = a + 2.1 + (i % 3) * 0.35, k = 0.25 + (i % 4) * 0.12;
      const d = `M ${(cx + Math.cos(a) * r).toFixed(1)} ${(cy + Math.sin(a) * r).toFixed(1)} Q ${(cx + Math.cos(a + 1.2) * r * k).toFixed(1)} ${(cy + Math.sin(a + 1.2) * r * k).toFixed(1)} ${(cx + Math.cos(b) * r).toFixed(1)} ${(cy + Math.sin(b) * r).toFixed(1)}`;
      s += `<path d="${d}" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${i % 2 ? '#a07a4a' : '#7a5530'}" stroke-width="5" stroke-linecap="round"/>`;
    }
    return s;
  }
  // the gallery of the phone : 3 videos of Liam, filmed anywhere (our own interface, no real app)
  function gallery() {
    let s = `<rect width="560" height="1000" fill="#f3f6fb"/>` + T(30, 70, 'Vidéos', 44, INK, { anchor: 'start' });
    [['#e8c39a', 'placard'], ['#cfe3f7', 'frigo'], ['#f2d7c4', 'vaisselle']].forEach(([bg, label], i) => {
      const x = 24 + i * 176, y = 110;
      s += `<rect x="${x}" y="${y}" width="164" height="290" rx="14" fill="${bg}" stroke="${INK}" stroke-width="4"/>` +
        headAt(i === 1 ? 'fierte' : 'frime', x + 82, y + 170, 0.62, '', false) +
        `<path d="M ${x + 70} ${y + 250} l 26 14 l -26 14 Z" fill="${SNOW}" stroke="${INK}" stroke-width="3"/>`;
    });
    return s + T(280, 470, 'Le son est prêt. Le clip, non.', 30, '#5b6170', { font: 'Rubik', weight: 700 });
  }
  // a laptop seen from the front, filling the top of the frame ; inner = its screen (848 × 528)
  function laptopBig(inner) {
    const x = 90, y = 300, W = 900, H = 580;
    return `<g class="laptop"><rect x="${x + 14}" y="${y + 18}" width="${W}" height="${H}" rx="30" fill="${INK}" opacity="0.5"/>` +
      `<rect x="${x}" y="${y}" width="${W}" height="${H}" rx="30" fill="#2a2d36" stroke="${INK}" stroke-width="12"/>` +
      `<clipPath id="lap${++UID}"><rect x="${x + 26}" y="${y + 26}" width="${W - 52}" height="${H - 52}" rx="12"/></clipPath>` +
      `<g clip-path="url(#lap${UID})"><rect x="${x + 26}" y="${y + 26}" width="${W - 52}" height="${H - 52}" fill="#161a24"/><g transform="translate(${x + 26} ${y + 26})">${inner}</g></g>` +
      `<path d="M ${x - 50} ${y + H + 6} L ${x + W + 50} ${y + H + 6} L ${x + W + 10} ${y + H + 70} L ${x - 10} ${y + H + 70} Z" fill="#9aa1ad" stroke="${INK}" stroke-width="10" stroke-linejoin="round"/>` +
      `<rect x="450" y="${y + H + 16}" width="180" height="16" rx="8" fill="#7a8190"/></g>`;
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
    s += `<g class="hands" data-cx="${cx}" data-cy="${cy}">`;
    [-0.5, -0.9, -1.3].forEach((a, j) => { s += `<path d="M ${cx} ${cy} L ${cx + Math.sin(a) * r * 0.62} ${cy - Math.cos(a) * r * 0.62}" stroke="${INK}" stroke-width="12" stroke-linecap="round" opacity="${0.15 + j * 0.1}"/>`; });
    s += `<path d="M ${cx} ${cy} L ${cx + Math.sin(0.3) * r * 0.62} ${cy - Math.cos(0.3) * r * 0.62}" stroke="${INK}" stroke-width="14" stroke-linecap="round"/><path d="M ${cx} ${cy} L ${cx + Math.sin(2.4) * r * 0.46} ${cy - Math.cos(2.4) * r * 0.46}" stroke="${INK}" stroke-width="18" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="18" fill="${INK}"/></g>`;
    return `<g class="clock">${s}</g>`;
  }
  // the video editor on Liam's computer (our own simple interface) : his video on top (his face, the mouth wide open on 4 frames)
  // and his song below (4 loud words). He drags the video to put each open mouth in front of its word, and it never fits
  // (owner, 16/11 : « il faut que l'écran soit animé pour qu'on comprenne vraiment ce qu'il essaye de faire »).
  // o.drag : the moves of the video track [[t, dx]...] ; o.cursor : the mouse ; o.labels : when « DÉCALÉ » shows (K options)
  function editor(o = {}) {
    const WORDS = [236, 396, 556, 716], OFF = 52; // the words of the song (x) ; the mouths start 52 px too late
    let s = `<rect width="848" height="528" fill="#161a24"/><rect x="254" y="22" width="340" height="236" rx="10" fill="#0b0d12" stroke="#2a3142" stroke-width="4"/>`;
    // the preview : his face, the mouth opening at the wrong moments
    s += headAt('panique', 424, 150, 0.6, '', false) + K({ blink: [3.1, 0.42] }, headAt('panique+parle', 424, 150, 0.6, '', false));
    s += `<rect x="24" y="284" width="800" height="228" rx="12" fill="#1d2230"/>` + chipT('VIDÉO', 32, 340, '#57adff') + chipT('SON', 32, 446, '#ffd34d');
    // the song : quiet, with 4 loud words
    let d = '';
    for (let i = 0; i < 168; i++) { const xx = 140 + i * 4, near = Math.min(...WORDS.map(w => Math.abs(xx - w))); const a = near < 22 ? 28 + 12 * Math.abs(Math.sin(i * 1.3)) : 4 + 6 * Math.abs(Math.sin(i * 0.7)); d += `M ${xx} ${446 - a} L ${xx} ${446 + a} `; }
    s += `<path d="${d}" stroke="#ffd34d" stroke-width="3"/>`;
    // where each mouth should be
    s += WORDS.map(w => `<path d="M ${w} 300 L ${w} 488" stroke="${SNOW}" stroke-width="3" stroke-dasharray="10 9" opacity="0.6"/>`).join('');
    // the video : 8 frames of his face, the mouth wide open on 4 of them ; the whole track moves when he drags it
    let v = '';
    for (let i = 0; i < 8; i++) {
      const c = 156 + i * 80 + OFF, open = i % 2 === 1;
      v += `<rect x="${c - 37}" y="304" width="74" height="72" rx="8" fill="#2b5d9a" stroke="${open ? '#ff9f43' : '#57adff'}" stroke-width="${open ? 5 : 3}"/><circle cx="${c}" cy="340" r="25" fill="#c98a5e" stroke="${INK}" stroke-width="3"/>`;
      v += open ? `<ellipse cx="${c}" cy="348" rx="12" ry="10" fill="${INK}"/><ellipse cx="${c}" cy="353" rx="7" ry="4" fill="#e5484d"/>` : `<path d="M ${c - 9} 349 L ${c + 9} 349" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`;
      v += `<circle cx="${c - 9}" cy="334" r="3.5" fill="${INK}"/><circle cx="${c + 9}" cy="334" r="3.5" fill="${INK}"/>`;
    }
    s += `<clipPath id="ed${++UID}"><rect x="134" y="296" width="690" height="90"/></clipPath><g clip-path="url(#ed${UID})">` + K({ path: (o.drag || [[0, 0]]).map(([t, dx]) => [t, dx, 0]) }, v) + '</g>';
    // the play head, again and again
    s += K({ lin: [660, 0, 0, 1.7, 1] }, `<path d="M 140 292 L 140 504" stroke="${SNOW}" stroke-width="4"/><path d="M 128 288 L 152 288 L 140 304 Z" fill="${SNOW}"/>`);
    // the mouse, on the first open mouth
    s += K({ path: o.cursor || [[0, 0, 0]] }, `<path d="M 300 352 L 300 392 L 310 382 L 318 400 L 326 396 L 318 379 L 332 379 Z" fill="${SNOW}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`);
    // « DÉCALÉ » : the mouth and the song do not match
    const label = `<g transform="translate(130 150) rotate(-6)"><rect x="-96" y="-34" width="192" height="64" rx="16" fill="#ff5a5f" stroke="${INK}" stroke-width="5"/>${T(0, 13, 'DÉCALÉ', 38, SNOW)}</g>`;
    return s + (o.labels || [{}]).map(ko => K(ko, label)).join('');
  }
  // his posted video and the first comment under it (our own interface, no real app) ; who : the name of the commenter
  function postScreen(text, who = 'commentaire') {
    let s = `<rect width="560" height="1000" fill="#0b0d12"/><rect x="0" y="0" width="560" height="640" fill="#1d2a44"/>`;
    s += headAt('frime', 280, 330, 1.05, '', false);
    s += `<g class="cmt"><rect x="0" y="600" width="560" height="400" rx="0" fill="#f3f6fb"/><circle cx="64" cy="684" r="34" fill="${who === 'maya' ? '#c94f84' : '#9aa6bd'}"/>` + (who === 'maya' ? T(64, 697, 'M', 34, SNOW) : '');
    s += T(116, 668, who, 26, '#7a8091', { font: 'Rubik', weight: 700, anchor: 'start' });
    const words = text.split(' '); let line = '', y = 712; const out = [];
    words.forEach(w => { if ((line + ' ' + w).trim().length > 22) { out.push(line); line = w; } else line = (line + ' ' + w).trim(); }); out.push(line);
    out.forEach((l, i) => { s += T(116, y + i * 40, l, 32, INK, { font: 'Rubik', weight: 800, anchor: 'start' }); });
    return s + '</g>';
  }
  // ---------------- the Stalak screen (owner, 16/11 : never a real capture, never the owner's own footage) ----------------
  // We draw it ourselves, with an example made of Liam's own videos : the song and his takes go into Stalak, then the clip
  // plays, cut from one take to the next on the beat, his mouth in time. The options shown are the real ones of the app
  // (cuts : Auto / Sur les mots / Par mesure ; rhythm : Posé / Normal / Nerveux ; effects : Aucun / Sobre / Intense).
  const TAKE_COL = ['#ff9f43', '#57adff', '#3fbf7f', '#c4b2ee'];
  // the little scene of a take, in the coordinates of the preview (0..520 × 0..400)
  function takeScene(kind) {
    const rows = (y0, c) => [0, 1, 2, 3, 4, 5].map(i => `<path d="M 0 ${y0 + i * 52} L 520 ${y0 + i * 52}" stroke="${c}" stroke-width="3"/>`).join('') + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => `<path d="M ${i * 58} 0 L ${i * 58} 400" stroke="${c}" stroke-width="3"/>`).join('');
    if (kind === 'placard') return `<rect width="520" height="400" fill="#a86d43"/><rect x="34" y="0" width="452" height="400" fill="#6e4426"/><path d="M 34 44 L 486 44" stroke="#c9ccd6" stroke-width="8"/>` +
      [[86, '#e5484d'], [164, '#ffd34d'], [356, '#57adff'], [436, '#3fa34d']].map(([x, c]) => `<path d="M ${x} 44 l 0 14" stroke="#c9ccd6" stroke-width="4"/><rect x="${x - 34}" y="58" width="68" height="200" rx="12" fill="${c}" stroke="${INK}" stroke-width="4"/>`).join('') +
      `<rect x="408" y="270" width="72" height="50" rx="6" fill="${SNOW}" stroke="${INK}" stroke-width="3"/>${T(444, 302, 'STUDIO', 15, '#c63d33')}`;
    if (kind === 'frigo') return `<rect width="520" height="400" fill="#cfe3f7"/>${rows(26, '#b9d2ec')}<rect x="318" y="10" width="190" height="400" rx="18" fill="#f8fbff" stroke="${INK}" stroke-width="5"/><path d="M 318 170 L 508 170" stroke="${INK}" stroke-width="4"/>` +
      `<rect x="334" y="80" width="12" height="70" rx="6" fill="#9aa1ad"/><rect x="334" y="190" width="12" height="90" rx="6" fill="#9aa1ad"/><circle cx="420" cy="60" r="14" fill="#e5484d" stroke="${INK}" stroke-width="3"/><rect x="452" y="96" width="36" height="44" rx="4" fill="#ffd34d" stroke="${INK}" stroke-width="3"/>`;
    if (kind === 'vaisselle') return `<rect width="520" height="400" fill="#e8f1f7"/>${rows(20, '#cddbe6')}<rect x="0" y="292" width="520" height="108" fill="#9aa1ad" stroke="${INK}" stroke-width="5"/><path d="M 400 292 L 400 236 Q 400 214 424 214 L 456 214" fill="none" stroke="#6b7180" stroke-width="16" stroke-linecap="round"/>` +
      [[60, 270, 18], [96, 250, 12], [470, 262, 16], [440, 236, 10], [126, 278, 9]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffffff" stroke="#9fc4d8" stroke-width="3" opacity="0.95"/>`).join('');
    if (kind === 'chambre') return `<rect width="520" height="400" fill="#e9b98f"/><rect x="330" y="30" width="170" height="210" rx="8" fill="#ffb27a" stroke="${INK}" stroke-width="5"/><circle cx="420" cy="170" r="40" fill="#ffe2a8"/><path d="M 330 200 L 380 160 L 420 190 L 470 140 L 500 170 L 500 240 L 330 240 Z" fill="#c4683a"/><path d="M 415 30 L 415 240" stroke="${INK}" stroke-width="4"/>`;
    if (kind === 'nuit') return `<rect width="520" height="400" fill="#142449"/><rect x="0" y="0" width="520" height="16" fill="#57adff"/><rect x="0" y="16" width="520" height="70" fill="#57adff" opacity="0.18"/><rect x="340" y="120" width="150" height="110" rx="8" fill="#0b0d12" stroke="#2a3142" stroke-width="5"/><rect x="352" y="132" width="126" height="86" fill="#2b5d9a"/>`;
    if (kind === 'rue') return `<rect width="520" height="400" fill="#9fd0f0"/><rect x="0" y="40" width="520" height="300" fill="#e8d3b0" stroke="${INK}" stroke-width="4"/><rect x="0" y="40" width="520" height="70" fill="#c8443a"/>${T(260, 92, 'REYES', 46, SNOW)}` +
      [0, 1, 2, 3, 4, 5, 6, 7].map(i => `<rect x="${i * 66}" y="110" width="33" height="36" fill="${i % 2 ? '#2f8a4e' : '#f3ecd8'}"/>`).join('') + `<rect x="0" y="330" width="520" height="70" fill="#c7c0b4"/>`;
    if (kind === 'coucher') return `<defs><linearGradient id="cch${++UID}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff7a4a"/><stop offset="1" stop-color="#ffd08a"/></linearGradient></defs><rect width="520" height="400" fill="url(#cch${UID})"/><circle cx="400" cy="250" r="70" fill="#fff0b8" opacity="0.9"/><rect x="0" y="320" width="520" height="80" fill="#8a5a4a"/>` +
      `<g transform="translate(90 330) scale(0.9)">${P.plant(0, -70)}</g>`;
    return `<rect width="520" height="400" fill="#cfe3f7"/>`;
  }
  // Liam from the waist up, inside a take ; live : his mouth moves on the beat (the animation)
  function liamBust(expr, x, top, h, props = '', live = true) {
    const k = h / 1249, tr = `translate(${(x - 450 * k).toFixed(1)} ${(top - 483 * k).toFixed(1)}) scale(${k.toFixed(4)})`, r = LIAM.figure(4, expr);
    if (!FRAME.ANIM || !live) return `<defs>${r.defs}</defs><g transform="${tr}">${r.svg}${props}</g>`;
    const rT = LIAM.figure(4, expr + '+parle');
    return `<defs>${r.defs}${rT.defs}</defs><g class="rap" transform="${tr}"><g class="fig">${r.svg}</g><g class="figT" display="none">${rT.svg}</g>${props}</g>`;
  }
  // the app. o.takes : [[scene, expression]...] shown in the clip (4 at most) ; o.count : how many takes went in ;
  // o.ti : how long the import step lasts (-1 : the whole shot, 0 : the clip plays at once) ; o.sticker, o.dl : the mascot and when
  function stalakApp(o = {}) {
    const takes = (o.takes || [['placard', 'fierte'], ['frigo', 'frime'], ['vaisselle', 'fierte']]).slice(0, 4), n = takes.length;
    const count = o.count || n, ti = o.ti == null ? -1 : o.ti, word = o.word || (count > 4 ? 'prises' : 'vidéos');
    let s = `<g class="stk" data-ti="${ti}" data-n="${n}"><rect width="560" height="1000" fill="#f3f6fb"/>`;
    // the app bar : the official round logo and the name
    s += `<rect width="560" height="92" fill="${BLUE}"/><circle cx="50" cy="47" r="31" fill="${INK}"/>${img('/site_src/icons/icon.svg', 22, 19, 56, 56)}${T(94, 63, 'Stalak', 42, SNOW, { anchor: 'start', stroke: INK, sw: 8 })}${T(536, 58, 'Nouveau clip', 24, ICE, { font: 'Rubik', weight: 800, anchor: 'end' })}`;
    // the preview : the clip being played
    s += `<clipPath id="pv${++UID}"><rect x="20" y="108" width="520" height="400" rx="18"/></clipPath><g clip-path="url(#pv${UID})"><g transform="translate(20 108)">`;
    takes.forEach(([kind, expr], j) => {
      s += `<g class="tk"${j ? ' display="none"' : ''}>${takeScene(kind)}${liamBust(expr, 260, 40, 700, kind === 'placard' || kind === 'nuit' ? P.headphones() : '')}` +
        `<g transform="rotate(-3 76 36)"><rect x="18" y="16" width="118" height="42" rx="10" fill="${TAKE_COL[j % 4]}" stroke="${INK}" stroke-width="4"/>${T(77, 46, 'PRISE ' + (j + 1), 25, INK)}</g></g>`;
    });
    s += `<rect x="0" y="0" width="520" height="400" rx="18" fill="none" stroke="${INK}" stroke-width="6"/>`;
    if (o.lyric) s += T(260, 376, o.lyric, 30, SNOW, { font: 'Rubik', weight: 900, stroke: INK, sw: 9 });
    // the import step : his song and his videos go into Stalak, then the clip is made
    s += `<g class="imp"${!FRAME.ANIM && ti !== -1 ? ' display="none"' : ''}><rect width="520" height="400" rx="18" fill="${SNOW}" stroke="${INK}" stroke-width="6"/>`;
    s += T(26, 50, 'Ton son', 30, INK, { font: 'Rubik', weight: 800, anchor: 'start' });
    s += `<rect x="20" y="66" width="480" height="62" rx="14" fill="#e3e9f3"/><circle cx="54" cy="97" r="21" fill="${BLUE}" stroke="${INK}" stroke-width="3"/>${T(54, 108, '♪', 30, SNOW)}`;
    for (let i = 0; i < 42; i++) { const a = 6 + 18 * Math.abs(Math.sin(i * 0.9) * Math.sin(i * 0.37 + 1)); s += `<rect x="${88 + i * 8}" y="${97 - a}" width="5" height="${2 * a}" rx="2" fill="${BLUE}"/>`; }
    s += `<g class="ck"><circle cx="468" cy="97" r="19" fill="#3fbf7f" stroke="${INK}" stroke-width="3"/><path d="M 459 97 l 7 7 l 12 -14" fill="none" stroke="${SNOW}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></g>`;
    s += T(26, 172, 'Tes ' + word, 30, INK, { font: 'Rubik', weight: 800, anchor: 'start' }) + T(500, 172, count + ' ' + word, 26, '#5b6170', { font: 'Rubik', weight: 700, anchor: 'end' });
    takes.forEach(([kind, expr], j) => {
      const x = 22 + j * 120;
      s += `<g class="th"><clipPath id="th${++UID}"><rect x="${x}" y="190" width="108" height="150" rx="12"/></clipPath><g clip-path="url(#th${UID})"><g transform="translate(${x} 190) scale(0.208 0.375)">${takeScene(kind)}</g>${headAt(expr, x + 54, 276, 0.4, '', false)}</g>` +
        `<rect x="${x}" y="190" width="108" height="150" rx="12" fill="none" stroke="${INK}" stroke-width="4"/>` +
        (j === 3 && count > 4 ? `<rect x="${x}" y="190" width="108" height="150" rx="12" fill="${INK}" opacity="0.6"/>${T(x + 54, 280, '+' + (count - 3), 44, SNOW)}` : `<path d="M ${x + 44} 300 l 24 13 l -24 13 Z" fill="${SNOW}" stroke="${INK}" stroke-width="3"/>`) + '</g>';
    });
    s += `<g class="mk"><g class="spin" data-cx="150" data-cy="372">${[0, 1, 2, 3, 4, 5].map(i => `<path d="M 150 372 L ${(150 + Math.sin(i * Math.PI / 3) * 17).toFixed(1)} ${(372 - Math.cos(i * Math.PI / 3) * 17).toFixed(1)}" stroke="${BLUE}" stroke-width="5" stroke-linecap="round"/>`).join('')}</g>${T(178, 382, 'Montage du clip…', 28, NIGHT, { font: 'Rubik', weight: 800, anchor: 'start' })}</g>`;
    s += '</g></g></g>';
    // the timeline : the clip cut on the beat, one colour per take, and the play head
    s += `<rect x="20" y="524" width="520" height="80" rx="14" fill="#e3e9f3"/>`;
    for (let i = 0; i < 8; i++) s += `<rect x="${34 + i * 61.5}" y="540" width="58" height="48" rx="6" fill="${TAKE_COL[i % n]}" stroke="${INK}" stroke-width="3"/>`;
    s += `<g class="ph"><path d="M 34 528 L 34 600" stroke="${INK}" stroke-width="5"/><path d="M 24 524 L 44 524 L 34 538 Z" fill="${INK}"/></g>`;
    // the buttons and the real options of the app
    s += `<rect x="20" y="620" width="250" height="56" rx="16" fill="${SNOW}" stroke="${INK}" stroke-width="4"/>${T(145, 658, '▶ Lecture', 28, INK, { font: 'Rubik', weight: 800 })}`;
    s += `<rect x="290" y="620" width="250" height="56" rx="16" fill="${INK}"/>${T(415, 658, '↻ Régénérer', 28, SNOW, { font: 'Rubik', weight: 800 })}`;
    [['Coupes', ['Auto', 'Sur les mots', 'Par mesure'], 0], ['Rythme', ['Posé', 'Normal', 'Nerveux'], 1], ['Effets', ['Aucun', 'Sobre', 'Intense'], 1]].forEach(([label, opts, sel], r) => {
      const y = 712 + r * 96;
      s += T(22, y, label, 24, '#5b6170', { font: 'Rubik', weight: 800, anchor: 'start' });
      let x = 20;
      opts.forEach((op, i) => { const w = FRAME.width(op, '700 24px Rubik') + 36; s += `<rect x="${x}" y="${y + 12}" width="${w}" height="46" rx="23" fill="${i === sel ? BLUE : SNOW}" stroke="${i === sel ? INK : '#c3cbd8'}" stroke-width="3"/>${T(x + w / 2, y + 44, op, 24, i === sel ? SNOW : INK, { font: 'Rubik', weight: 700 })}`; x += w + 10; });
    });
    s += '</g>';
    // the sticker sits on the screen's right edge, clear of the « Nerveux » and « Intense » chips (planche, 16/11)
    if (o.sticker) s += `<g class="sticker" data-dl="${o.dl != null ? o.dl : 0.55}"><g transform="translate(492 872)"><circle r="86" fill="${SNOW}" stroke="${INK}" stroke-width="6"/>${img(`/site_src/emoji/${o.sticker}.webp`, -76, -76, 152, 152)}</g></g>`;
    return s;
  }
  // ---------------- 16/11 (owner) : every change of place or time is said on screen, and who arrives is clear ----------------
  // a caption at the top (« CINQ MINUTES PLUS TARD · LA CUISINE ») : it pops in, stays 3 s, then goes away
  const carton = (text, y = 268) => {
    const w = FRAME.width(text, '46px "Lilita One"') + 116, x = 500 - w / 2;
    return `<g class="carton"><g transform="rotate(-2 500 ${y})"><rect x="${x + 8}" y="${y - 30}" width="${w}" height="82" rx="20" fill="${INK}"/><rect x="${x}" y="${y - 40}" width="${w}" height="82" rx="20" fill="${ICE}" stroke="${INK}" stroke-width="6"/>` +
      `<circle cx="${x + 46}" cy="${y + 1}" r="21" fill="${SNOW}" stroke="${INK}" stroke-width="5"/><path d="M ${x + 46} ${y + 1} L ${x + 46} ${y - 11} M ${x + 46} ${y + 1} L ${x + 55} ${y + 7}" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>` +
      `${T(x + 78, y + 17, text, 46, NIGHT, { anchor: 'start' })}</g></g>`;
  };
  // « TOC TOC ! » : someone knocks on the window (a comic burst)
  const knock = (x, y, r = -8) => {
    let d = ''; for (let i = 0; i < 28; i++) { const a = i * Math.PI / 14, rr = i % 2 ? 1 : 0.8; d += `${i ? 'L' : 'M'} ${(Math.cos(a) * 200 * rr).toFixed(1)} ${(Math.sin(a) * 92 * rr).toFixed(1)} `; }
    return `<g class="knock"><g transform="translate(${x} ${y}) rotate(${r})"><path d="${d}Z" fill="${INK}" transform="translate(8 10)"/><path d="${d}Z" fill="#ffd34d" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>${T(0, 19, 'TOC TOC !', 56, INK)}</g></g>`;
  };
  // a notification or a comment, our own interface
  const notif = (text, y = 330) => `<g class="notif"><g transform="translate(140 ${y})"><rect x="0" y="0" width="800" height="120" rx="30" fill="${SNOW}" stroke="${INK}" stroke-width="6"/><circle cx="64" cy="60" r="38" fill="${BLUE}"/>${T(64, 76, '♥', 44, SNOW)}${T(124, 74, text, 36, INK, { font: 'Rubik', weight: 800, anchor: 'start' })}</g></g>`;
  const comment = (text, y = 300) => `<g transform="translate(110 ${y})"><rect x="0" y="0" width="860" height="150" rx="30" fill="${SNOW}" stroke="${INK}" stroke-width="6"/>${T(40, 58, 'commentaire', 28, '#7a8091', { font: 'Rubik', weight: 700, anchor: 'start' })}${T(40, 112, text, 36, INK, { font: 'Rubik', weight: 800, anchor: 'start' })}</g>`;
  // a name label next to a character
  const tag = (text, x, y, r = -4) => { const w = 34 + text.length * 21; return `<g class="tag"><g transform="translate(${x} ${y}) rotate(${r})"><rect x="${-w / 2 + 6}" y="-30" width="${w}" height="64" rx="32" fill="${INK}"/><rect x="${-w / 2}" y="-36" width="${w}" height="64" rx="32" fill="${SNOW}" stroke="${INK}" stroke-width="6"/>${T(0, 10, text, 34, INK)}</g></g>`; };
  // the end card : the official logo sticker, stalak.app, what it costs (as the site says it), the next episode
  function endCard(next) {
    let s = `<rect width="1080" height="1920" fill="${BLUE}"/>`;
    s += `<path d="M 0 0 L 1080 0 L 1080 200 C 980 210 960 290 900 280 C 850 272 860 210 790 210 C 720 210 730 320 660 310 C 600 302 610 220 540 220 C 470 220 480 340 410 330 C 350 322 360 230 290 230 C 220 230 230 300 170 290 C 110 280 110 210 0 210 Z" fill="${ICE}" stroke="${INK}" stroke-width="8"/>`;
    // the logo catches the light : a shine sweeps across it now and then (16/11, 19 h 32 : « un truc qui brille »)
    const lc = 'ecl' + (++UID);
    s += `<g class="ec-logo"><circle cx="550" cy="512" r="168" fill="${INK}"/>` + img('/site_src/icons/icon.svg', 380, 340, 330, 330) +
      `<clipPath id="${lc}"><circle cx="545" cy="505" r="160"/></clipPath><g clip-path="url(#${lc})">` + K({ sweep: [2.6, 1.6, 0.8, 560, 0] }, `<path d="M 230 700 L 370 300 L 430 300 L 290 700 Z" fill="#ffffff" opacity="0.5"/>`) + '</g>' +
      (window.LIGHTS ? LIGHTS.glint(668, 400, 34, { tw: [2.6, 0.6, 0.7, 0] }) : '') + '</g>';
    s += `<g class="ec-url">${T(540, 830, 'stalak.app', 150, SNOW, { stroke: INK, sw: 20 })}</g>`;
    s += `<g class="ec-free">${T(520, 910, 'Gratuit, sans téléchargement ni inscription', 34, ICE, { font: 'Rubik', weight: 800 })}</g>`; // clear of the right edge
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
  function bus(x, y, w = 980) { return `<g class="bus">${bus0(x, y, w)}</g>`; }
  function bus0(x, y, w) {
    const h = 360;
    let s = [0, 1, 2].map(i => `<path d="M ${x - 60 - i * 40} ${y - 260 + i * 80} L ${x - 200 - i * 60} ${y - 260 + i * 80}" stroke="${INK}" stroke-width="10" stroke-linecap="round" opacity="0.6"/>`).join('');
    s += `<rect x="${x}" y="${y - h}" width="${w}" height="${h - 40}" rx="44" fill="#e8b43a" stroke="${INK}" stroke-width="9"/><rect x="${x + 6}" y="${y - 140}" width="${w - 12}" height="44" fill="#c98a06"/>`;
    for (let i = 0; i < 6; i++) s += `<rect x="${x + 50 + i * 150}" y="${y - h + 40}" width="118" height="120" rx="16" fill="#9fc4d8" stroke="${INK}" stroke-width="6"/>` +
      // the lights (16/11, 19 h 32) : the sky in each window, a glint on the last one
      `<path d="M ${x + 62 + i * 150} ${y - h + 148} L ${x + 104 + i * 150} ${y - h + 52} L ${x + 126 + i * 150} ${y - h + 52} L ${x + 84 + i * 150} ${y - h + 148} Z" fill="#ffffff" opacity="0.35"/>`;
    s += `<circle class="shiny" cx="${x + 50 + 5 * 150 + 96}" cy="${y - h + 62}" r="12" fill="none"/>`;
    [x + 180, x + w - 180].forEach(cx => { s += `<circle cx="${cx}" cy="${y - 40}" r="62" fill="#2a2d36" stroke="${INK}" stroke-width="8"/><circle cx="${cx}" cy="${y - 40}" r="24" fill="#9aa1ad"/><circle class="shiny" cx="${cx - 8}" cy="${y - 50}" r="9" fill="none"/>`; });
    // its headlight, lit, with its halo
    s += `<rect x="${x + w - 40}" y="${y - 120}" width="30" height="40" rx="10" fill="#fff4c8" stroke="${INK}" stroke-width="6"/>` + (window.LIGHTS ? `<g style="mix-blend-mode:screen">${LIGHTS.halo(x + w - 25, y - 100, 170, '#fff1c0', 0.75, { hot: 28, streak: 220 })}</g>` : '');
    return s;
  }
  // a small dog barking, side view, facing left ; x, y : under its paws
  function dog(x, y) {
    return `<g class="dog"><g transform="translate(${x} ${y})"><path d="M 30 -60 C 70 -90 90 -110 96 -120" stroke="${INK}" stroke-width="20" stroke-linecap="round"/><path d="M 30 -60 C 70 -90 90 -110 96 -120" stroke="#c98a4e" stroke-width="10" stroke-linecap="round"/>` +
      [-50, -20, 20, 50].map(dx => `<rect x="${dx - 9}" y="-50" width="18" height="50" rx="8" fill="#c98a4e" stroke="${INK}" stroke-width="6"/>`).join('') +
      `<ellipse cx="0" cy="-70" rx="80" ry="42" fill="#c98a4e" stroke="${INK}" stroke-width="7"/><circle cx="-84" cy="-118" r="44" fill="#c98a4e" stroke="${INK}" stroke-width="7"/>` +
      `<path d="M -120 -110 L -150 -100 L -122 -86 Z" fill="#3b1612" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><path d="M -70 -160 C -50 -170 -40 -140 -56 -118 Z" fill="#8a5a33" stroke="${INK}" stroke-width="6"/><circle cx="-96" cy="-128" r="7" fill="${INK}"/>` +
      `<g transform="translate(-200 -230) rotate(-8)"><path d="M -96 -46 L 96 -46 L 96 30 L -10 30 L -40 64 L -36 30 L -96 30 Z" fill="${SNOW}" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>${T(0, 10, 'WOUF !', 52, INK)}</g></g></g>`;
  }
  // a clapperboard : « PRISE n »
  const clap = (x, y, n, r = -6) => `<g class="clap"><g transform="translate(${x} ${y}) rotate(${r})"><rect x="-120" y="-36" width="240" height="120" rx="10" fill="#2a2d36" stroke="${INK}" stroke-width="7"/><path d="M -120 -36 L 120 -36 L 124 -84 L -116 -84 Z" fill="${SNOW}" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>` +
    [-80, -20, 40, 100].map(dx => `<path d="M ${dx} -84 L ${dx + 30} -84 L ${dx + 14} -36 L ${dx - 16} -36 Z" fill="${INK}"/>`).join('') + `${T(0, 48, 'PRISE ' + n, 50, SNOW)}</g></g>`;
  // ice bags piled in his arms (figure coordinates), bigger than the plain prop
  const bigBag = (x, y, r = 0, k = 1.7) => `<g transform="translate(${x} ${y}) scale(${k}) translate(${-x} ${-y})">${P.icebag(x, y, r)}</g>`;
  const BAGS = (n) => [[450, 1150, -3], [360, 1060, -9], [545, 1050, 8], [450, 960, 4], [380, 880, -6], [530, 870, 9]].slice(0, n).map(([x, y, r]) => bigBag(x, y, r)).join('');
  // ---------------- EP5 (the GTA-style clip) : our own drawings, never anything from the game ----------------
  // the sunset over the street (set coordinates)
  const sunset = () => `<defs><linearGradient id="sst" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff5a3d" stop-opacity="0.5"/><stop offset="0.55" stop-color="#ffa060" stop-opacity="0.28"/><stop offset="1" stop-color="#ffb27a" stop-opacity="0.12"/></linearGradient></defs><rect x="-60" y="-60" width="1200" height="2040" fill="url(#sst)"/>`;
  // a scooter seen from the front (our own design, no brand) : barY = handlebar, floor = where the riders' feet are
  function scooter(cx, barY, floor, k = 0.57, color = '#5fc4b3') { return `<g class="scooter">${scooter0(cx, barY, floor, k, color)}</g>`; }
  function scooter0(cx, barY, floor, k, color) {
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
  const smoke = (x, y) => `<g class="smoke">` + [[0, 0, 46], [60, -50, 38], [120, -110, 30], [-40, -70, 26]].map(([dx, dy, r]) => `<circle cx="${x + dx}" cy="${y + dy}" r="${r}" fill="#c9ccd6" stroke="${INK}" stroke-width="5" opacity="0.92"/>`).join('') + '</g>';
  // a desk fan (Deuce's helicopter), in a character's coordinates
  const fan = (x, y) => `<g transform="translate(${x} ${y})">${[0, 1, 2].map(i => `<path d="M -140 ${-60 + i * 50} q -60 -16 -120 0" fill="none" stroke="#9fc4ff" stroke-width="9" stroke-linecap="round"/>`).join('')}` +
    `<rect x="-14" y="80" width="28" height="110" fill="#9aa1ad" stroke="${INK}" stroke-width="6"/><ellipse cx="0" cy="196" rx="70" ry="18" fill="#9aa1ad" stroke="${INK}" stroke-width="6"/>` +
    `<circle r="104" fill="#e9f4ff" stroke="${INK}" stroke-width="8"/><g class="blades">${[0, 120, 240].map(a => `<ellipse cx="0" cy="-46" rx="26" ry="50" fill="#57adff" stroke="${INK}" stroke-width="5" transform="rotate(${a})"/>`).join('')}</g>` +
    `<circle r="62" fill="none" stroke="#9aa1ad" stroke-width="3"/><circle r="86" fill="none" stroke="#9aa1ad" stroke-width="3"/><circle r="18" fill="#2a2d36" stroke="${INK}" stroke-width="5"/></g>`;
  // Deuce's dream : a car, palm trees, a helicopter (plain cartoon icons of ours, nothing from the game)
  function dream(cx, cy) { return `<g class="dream">${dream0(cx, cy)}</g>`; }
  function dream0(cx, cy) {
    let s = [[-300, 20, 120], [-160, -90, 140], [40, -110, 150], [220, -60, 130], [320, 40, 110], [150, 110, 130], [-80, 110, 130], [-260, 120, 100]].map(([dx, dy, r]) => `<circle cx="${cx + dx}" cy="${cy + dy}" r="${r}" fill="${INK}"/>`).join('');
    s += [[-300, 20, 112], [-160, -90, 132], [40, -110, 142], [220, -60, 122], [320, 40, 102], [150, 110, 122], [-80, 110, 122], [-260, 120, 92]].map(([dx, dy, r]) => `<circle cx="${cx + dx}" cy="${cy + dy}" r="${r}" fill="${SNOW}"/>`).join('');
    // v2 (owner, 16/11 : « des bouts sortent de la bulle d'idées ») : the dream is drawn smaller, inside a window that stays
    // within the white of the cloud, and clipped to it : nothing pokes out
    const cid = 'drm' + (++UID);
    s += `<rect x="${cx - 310}" y="${cy - 150}" width="620" height="300" rx="130" fill="#ffe2c4"/><clipPath id="${cid}"><rect x="${cx - 310}" y="${cy - 150}" width="620" height="300" rx="130"/></clipPath>`;
    s += `<g clip-path="url(#${cid})"><g transform="translate(${cx} ${cy}) scale(0.8) translate(${-cx} ${-cy})">`;
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
    s += '</g></g>';
    return s;
  }
  // the 12 takes in Liam's phone : all a bit failed, but he raps well in each (our own interface). v2 (owner, 16/11 : « sur
  // les cases des vidéos, il faut qu'on voie le décor, le scooter, la plante, devant la supérette ») : each thumbnail is a
  // little picture of the take, Liam where he filmed it : on the scooter, with the plant, in front of the shop, with the fan
  function takeTile(i, x, y) {
    const kind = ['superette', 'scooter', 'plante', 'ventilo'][i % 4], cid = 'gt' + (++UID), cx = x + 82;
    let s = `<clipPath id="${cid}"><rect x="${x}" y="${y}" width="164" height="184" rx="12"/></clipPath><g clip-path="url(#${cid})">`;
    s += `<g transform="translate(${x - 38} ${y}) scale(0.46)">${takeScene('rue')}</g>`;
    const ex = ['fierte', 'frime', 'colere', 'fierte'][(i >> 2) % 4];
    if (kind === 'superette') s += headAt(ex, cx, y + 128, 0.3, '', false);
    if (kind === 'scooter') s += headAt(ex, cx, y + 70, 0.24, '', false) + `<g transform="translate(${cx} ${y + 104}) scale(0.28)">${scooter0(0, 0, 330, 0.57, '#5fc4b3')}</g>`;
    if (kind === 'plante') s += headAt(ex, x + 58, y + 116, 0.26, '', false) + `<g transform="translate(${x + 124} ${y + 136}) scale(0.5)">${P.plant(0, 0)}</g>`;
    if (kind === 'ventilo') s += headAt(ex, x + 60, y + 118, 0.26, '', false) + `<g transform="translate(${x + 126} ${y + 104}) scale(0.32)">${fan(0, 0)}</g>`;
    return s + `</g><rect x="${x}" y="${y}" width="164" height="184" rx="12" fill="none" stroke="${INK}" stroke-width="4"/>` +
      `<path d="M ${x + 128} ${y + 150} l 22 12 l -22 12 Z" fill="${SNOW}" stroke="${INK}" stroke-width="3"/>`;
  }
  function gallery12() {
    let s = `<rect width="560" height="1000" fill="#f3f6fb"/>` + T(30, 70, 'Vidéos', 44, INK, { anchor: 'start' });
    for (let i = 0; i < 12; i++) s += takeTile(i, 22 + (i % 3) * 176, 100 + Math.floor(i / 3) * 196);
    return s;
  }
  // a phone held sideways (Deuce films in landscape : the joke)
  const phoneWide = (x, y) => `<g transform="translate(${x} ${y}) rotate(90)">${P.phoneBack(0, 0)}</g>`;
  // the sets alone, to check a framing : frame.html?f=set-terrain1
  [['chambre', 2], ['cuisine', 1], ['rue', 1], ['terrain', 1], ['lycee', 1], ['toit', 2]].forEach(([id, v]) => { FRAMES[`set-${id}${v}`] = { set: [id, v, 'jour'], chars: [] }; });

  // the shop of M. Reyes closed : a « FERMÉ » sign over the « OUVERT » one (set coordinates of rue 1)
  const closed = () => `<g transform="rotate(-3 742 1238)"><rect x="660" y="1196" width="164" height="86" rx="14" fill="#c8443a" stroke="${INK}" stroke-width="6"/>${T(742, 1255, 'FERMÉ', 46, SNOW)}</g><path d="M 690 1196 L 742 1150 L 794 1196" fill="none" stroke="${INK}" stroke-width="4"/>`;
  // glare on a shop window, over whoever stands behind it
  // a character behind a window pane : the glass is in front of her, a light tint and two reflections over her (owner, 16/11 :
  // « elle est censée être derrière la vitre »). Drawn in her `after`, so the characters in the room stay in front of it.
  // the kitchen at night (the set is drawn by day) : a night sky in its window, between the curtains and under the valance
  const kitchenNight = () => `<defs><linearGradient id="kng" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c1636"/><stop offset="1" stop-color="#2b3270"/></linearGradient></defs>` +
    `<rect x="420" y="470" width="250" height="358" fill="url(#kng)"/>` + [[455, 520], [610, 545], [520, 600], [640, 640], [470, 690]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#eef3ff"/>`).join('') +
    `<circle cx="590" cy="600" r="30" fill="#eef3ff"/><circle cx="604" cy="591" r="27" fill="#2b3270"/>` +
    `<path d="M 420 828 L 420 760 L 470 760 L 470 730 L 530 730 L 530 780 L 590 780 L 590 745 L 640 745 L 640 790 L 670 790 L 670 828 Z" fill="#151a36"/>`;
  const vitre = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#cfe9ff" opacity="0.22"/>` + glare(x, y, w, h);
  const glare = (x, y, w, h) => `<clipPath id="gl${++UID}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath><g clip-path="url(#gl${UID})" opacity="0.28"><path d="M ${x + w * 0.1} ${y + h} L ${x + w * 0.35} ${y} L ${x + w * 0.45} ${y} L ${x + w * 0.2} ${y + h} Z M ${x + w * 0.55} ${y + h} L ${x + w * 0.8} ${y} L ${x + w * 0.85} ${y} L ${x + w * 0.6} ${y + h} Z" fill="#ffffff"/></g>`;
  // his new song posted with a still image : nobody stops on it (our own interface)
  function stillPost() {
    let s = `<rect width="560" height="1000" fill="#0b0d12"/><rect x="40" y="120" width="480" height="480" rx="18" fill="${NIGHT}" stroke="#2a3142" stroke-width="4"/>`;
    s += `<g transform="translate(280 300)">${[0, 1, 2, 3, 4, 5].map(i => `<path d="M 0 0 L ${Math.sin(i * Math.PI / 3) * 90} ${-Math.cos(i * Math.PI / 3) * 90}" stroke="${ICE}" stroke-width="12" stroke-linecap="round"/>`).join('')}</g>`;
    s += T(280, 480, 'T-CRAZY', 76, SNOW, { stroke: INK, sw: 10 }) + T(280, 548, 'nouveau son', 34, ICE, { font: 'Rubik', weight: 700 });
    s += `<rect x="40" y="650" width="480" height="10" rx="5" fill="#2a3142"/><rect x="40" y="650" width="60" height="10" rx="5" fill="${BLUE}"/><circle cx="100" cy="655" r="15" fill="${SNOW}"/>`;
    return s + T(280, 770, '0 écoute', 46, '#9aa6bd', { font: 'Rubik', weight: 800 });
  }
  // the same still picture, as a post in the feed (0..560 × 0..1000) : nothing moves in it
  const stillPic = () => `<rect width="560" height="1000" fill="#0b0d12"/><rect x="40" y="230" width="480" height="480" rx="18" fill="${NIGHT}" stroke="#2a3142" stroke-width="4"/>` +
    `<g transform="translate(280 400)">${[0, 1, 2, 3, 4, 5].map(i => `<path d="M 0 0 L ${Math.sin(i * Math.PI / 3) * 90} ${-Math.cos(i * Math.PI / 3) * 90}" stroke="${ICE}" stroke-width="12" stroke-linecap="round"/>`).join('')}</g>` +
    T(280, 590, 'T-CRAZY', 76, SNOW, { stroke: INK, sw: 10 }) + T(280, 656, 'nouveau son', 34, ICE, { font: 'Rubik', weight: 700 });
  // his promo video of episode 2, as posted : his face in his room at night, the mouth moving (out of time, of course)
  const myClip = () => `<rect width="560" height="1000" fill="#1d2a44"/><rect width="560" height="140" fill="#57adff" opacity="0.15"/>` +
    headAt('frime', 280, 430, 1.05, '', false) + K({ blink: [3.1, 0.42] }, headAt('frime+parle', 280, 430, 1.05, '', false));
  // the light of a screen on a wall, from off screen (a game being played : never shown)
  const screenLight = (cx, cy) => `<defs><radialGradient id="sl1"><stop offset="0" stop-color="#57adff" stop-opacity="0.75"/><stop offset="1" stop-color="#57adff" stop-opacity="0"/></radialGradient><radialGradient id="sl2"><stop offset="0" stop-color="#e86ad6" stop-opacity="0.6"/><stop offset="1" stop-color="#e86ad6" stop-opacity="0"/></radialGradient><radialGradient id="sl3"><stop offset="0" stop-color="#5fe08a" stop-opacity="0.5"/><stop offset="1" stop-color="#5fe08a" stop-opacity="0"/></radialGradient></defs>` +
    `<g class="slight"><ellipse cx="${cx}" cy="${cy}" rx="420" ry="330" fill="url(#sl1)"/><ellipse cx="${cx + 140}" cy="${cy - 90}" rx="260" ry="200" fill="url(#sl2)"/><ellipse cx="${cx - 120}" cy="${cy + 120}" rx="240" ry="190" fill="url(#sl3)"/></g>`;

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
  // v2 (16/11) : the owner's 10 remarks on episode 1, for the whole series. The shouts are written big (FRAME.cri, criY : the
  // middle of the block) ; every change of place or time has its caption (carton) ; who arrives says hello and gets a label ;
  // the Stalak screen is ours (stalakApp), with Liam's own videos.
  const NB = ' ';
  ep('ep1', 'SA MÈRE A CRIÉ EN PLEINE PRISE', 1, [
    { t: '0:00', cap: "L'accroche : Nadia a trouvé le clip, elle crie", set: KITCHEN, criY: 700, chars: [CH('nadia', 2, 560, 2610, 2050, 'colere', P.phone(580, 1130, '#ffe066'))],
      over: () => bandeau(2, 'SA MÈRE A CRIÉ EN PLEINE PRISE', 1) + FRAME.cri('nadia', `Tu m'as enregistrée sans me le dire${NB}?!`, 700) },
    { t: '0:03', cap: 'Le narrateur présente Liam', set: ROOM, chars: [LI(230, 1490, 1000, 'frime', HP)],
      over: () => tag('LIAM, ALIAS T-CRAZY', 650, 640) + sub(1, 'narrateur', 'Voici Liam. 15 ans. Zéro abonné. Persuadé d\'être le prochain rappeur à percer.') },
    { t: '0:09', cap: 'Carton « Une heure plus tôt » : au micro', set: ROOM0, zoom: [290, 900, 1.7], chars: [LI(420, 2250, 1500, 'fierte', HP + P.mic(612, 790))],
      over: () => carton('UNE HEURE PLUS TÔT') + sub(1, 'liam', 'T-Crazy, le froid dans les veines, je glace la scène !') },
    { t: '0:15', cap: 'La porte du placard s\'ouvre : Nadia crie', set: ROOM, chars: [LI(200, 1490, 980, 'panique', HP), CH('nadia', 2, 640, 1640, 1240, 'colere', P.sponge(330, 1170))],
      over: () => tag('NADIA, SA MÈRE', 700, 300, 3) + sub(1, 'nadia', 'T-Crazy mange pas si T-Crazy a pas fait la vaisselle !') },
    { t: '0:20', cap: "L'ordi a tout enregistré", set: ROOM, zoom: [640, 1060, 1.6], dim: 0.45,
      over: () => laptopBig(take()) + headAt('panique', 300, 1150, 1.9, hp()) + sub(1, 'liam', 'Maman, on t\'entend dans mon enregistrement !') },
    { t: '0:26', cap: 'Il réécoute, abattu…', set: ROOM0, zoom: [768, 1000, 1.5], chars: [LI(740, 2940, 2300, 'panique', HP)],
      over: () => sub(1, 'narrateur', 'Il réécoute. Et au final, le cri de sa mère sonne plutôt bien dans sa musique.') },
    { t: '0:30', cap: '… puis son visage s\'éclaire', set: ROOM0, zoom: [768, 1000, 1.5], chars: [LI(740, 2940, 2300, 'fierte', HP)],
      over: () => sub(1, 'liam', 'Wouah, ça tue ! Je vais le garder dans mon refrain !') },
    { t: '0:33', cap: 'Carton « Cinq minutes plus tard · la cuisine » : la vaisselle, il sort son téléphone', set: KITCHEN, chars: [LI(560, 1846, 1250, 'frime', P.sponge(320, 1170) + P.phone(606, 760), { pose: { raise: 'r' } })],
      over: () => carton('CINQ MINUTES PLUS TARD · LA CUISINE') + sub(1, 'narrateur', 'Pour sortir son son, il lui faut un clip. Et des vidéos de lui qui rappe, il en a déjà plein son téléphone.') },
    { t: '0:38', cap: 'Ses vidéos dans sa galerie', set: KITCHEN, over: () => phoneBig(gallery(), 0.92) + sub(1, 'liam', 'J\'ai le son. J\'ai les vidéos. Mais monter un clip, ça prend des heures.') },
    { t: '0:42', cap: 'Toc toc : Maya, la voisine, à la fenêtre', set: KITCHEN, chars: [CH('maya', 1, 545, 1570, 1150, 'frime', '', { clip: [420, 470, 250, 358], after: winPhone(420, 470, 250, 358) + vitre(420, 452, 250, 376) }), LI(800, 1846, 1170, 'frime', P.sponge(612, 742), { pose: { raise: 'r' } })],
      over: () => knock(560, 360) + tag('MAYA, LA VOISINE', 230, 660, -4) + sub(1, 'maya', 'Coucou Liam ! Je t\'entends râler depuis chez moi. Pas besoin d\'y passer des heures : mets ton son et tes trois vidéos dans Stalak.') },
    { t: '0:49', cap: 'Stalak, dessiné : son son et ses 3 vidéos, puis le clip coupé sur le temps', set: KITCHEN, chars: [], shade: true,
      over: () => phoneBig(stalakApp({ takes: [['placard', 'fierte'], ['frigo', 'frime'], ['vaisselle', 'fierte']], count: 3, ti: 2.6, sticker: 'hype', dl: 3.1, lyric: 'le froid dans les veines' }), 0.92) + sub(1, 'narrateur', 'Il met son son et ses trois vidéos dans Stalak. Stalak monte le clip : il coupe sur le rythme et garde la synchro des lèvres.') },
    { t: '0:57', cap: 'Nadia arrive et découvre le clip (la scène du début)', set: KITCHEN, chars: [CH('nadia', 2, 760, 1856, 1250, 'colere', P.phone(580, 1130, '#ffe066')), LI(330, 1846, 1170, 'frime')],
      over: () => sub(1, 'nadia', `Tu m'as enregistrée sans me le dire${NB}?!`) },
    { t: '1:03', cap: 'Liam parle à celui qui regarde', set: KITCHEN, chars: [LI(540, 2730, 2250, 'frime', P.sponge(612, 742), { pose: { raise: 'r' } })],
      over: () => sub(1, 'liam', 'Toi aussi, t\'as un son et des vidéos de toi qui dorment dans ta galerie ? T\'as déjà un clip.') },
    { t: '1:10', cap: 'La carte de fin', plain: true, over: () => endCard('IL A PASSÉ LA NUIT SUR SA VIDÉO DE PROMO') },
  ], 'Version 2 (16/11) : tes remarques de l\'épisode 1 appliquées.');

  ep('ep2', 'IL A PASSÉ LA NUIT SUR SA VIDÉO DE PROMO', 2, [
    { t: '0:00', cap: "L'accroche : la nuit, devant l'ordi, il crie", set: ROOMN0, zoom: [290, 560, 1.7], criY: 700, chars: [LI(540, 2785, 2300, 'colere+cerne', HP)],
      over: () => `<rect width="1080" height="1920" fill="#57adff" opacity="0.10"/>` + bandeau(2, 'IL A PASSÉ LA NUIT SUR SA VIDÉO DE PROMO', 2) + FRAME.cri('liam', `Pourquoi ma bouche est décalée${NB}?!`, 700) },
    { t: '0:03', cap: 'Le narrateur présente Liam', set: ROOMN, chars: [LI(230, 1490, 1000, 'frime+cerne', HP)],
      over: () => tag('LIAM, ALIAS T-CRAZY', 650, 640) + sub(1, 'narrateur', 'Voici Liam. 15 ans. Zéro abonné. Il vient d\'écrire le son de l\'année.') },
    { t: '0:09', cap: 'Carton « Six heures plus tôt » : sûr de lui', set: ROOM, chars: [LI(560, 1846, 1250, 'frime', P.phone(606, 760), { pose: { raise: 'r' } })],
      over: () => carton('SIX HEURES PLUS TÔT') + sub(1, 'liam', 'Une vidéo pour la promo de mon son ? Dix minutes, max.') },
    { t: '0:14', cap: 'Carton « Six heures plus tard » : l\'horloge tourne', set: ROOMN, dim: 0.35,
      over: () => carton('SIX HEURES PLUS TARD') + clockBig(610, 600, 230) + headAt('panique+cerne', 300, 1060, 1.7, hp()) + sub(1, 'narrateur', 'Six heures plus tard, il découvre le vrai boss de fin : faire coller sa bouche à son son.') },
    // v3 (owner, 16/11 : « l'écran doit être animé », « le téléphone sort de nulle part ») : the times below are seconds from the
    // start of the shot, on the voice of line 5 (« Non. » at 2.2 s, « Non plus ! » at 3.94 s) and line 6 (2.6 s)
    { t: '0:20', cap: 'Il recale sa bouche : il fait glisser sa vidéo pour mettre chaque bouche ouverte en face de son mot, rien ne colle', set: ROOMN0, zoom: [640, 1060, 1.6], dim: 0.45,
      over: () => laptopBig(editor({ drag: [[0, 0], [0.95, 0], [1.55, -74], [2.5, -74], [3.15, -28]], cursor: [[0, 250, 140], [0.8, 0, 0], [0.95, 0, 0], [1.55, -74, 0], [2.5, -74, 0], [3.15, -28, 0]],
        labels: [{ in: 0, out: 0.95, blink: [1.6, 0.7] }, { in: 2.2, pop: 0.3, out: 2.5 }, { in: 3.94, pop: 0.3, blink: [1.6, 0.8] }] })) + headAt('colere+cerne', 300, 1150, 1.9, hp()) + sub(1, 'liam', 'Là, c\'est bon. Non. Là ! Non plus !') },
    { t: '0:25', cap: 'Il prend son téléphone et publie (« Publier », « Vidéo publiée ! ») ; une notification, puis le commentaire de « maya »', set: ROOMN, chars: [LI(540, 1846, 1250, 'frime+cerne', P.phone(606, 760), { pose: { raise: 'r' } })],
      over: () => phoneBig(publish({ at: 1.0, pic: myClip(), feed: { user: 't.crazy', caption: 'Mon nouveau son !', sound: 'son original - T-Crazy', likes: 0, comments: 1, shares: 0 },
        after: K({ in: 2.05, path: [[2.05, 0, -150], [2.35, 0, 0], [2.9, 0, 0], [3.15, 0, -150]] }, notifTop('maya', 'a commenté ta vidéo', '#c94f84')) +
          K({ in: 2.95, path: [[2.95, 0, 470], [3.3, 0, 0]] }, comments('maya', 'Ta bouche est décalée sur toute la vidéo.', '#c94f84')) }), 0.92, { dl: 0.55 }) + sub(1, 'liam', 'Un commentaire !') },
    { t: '0:32', cap: 'Toc toc : Maya, la voisine, à la fenêtre (la nuit)', set: ROOMN, chars: [CH('maya', 1, 865, 1490, 1150, 'frime', '', { clip: [722, 500, 286, 278], after: winPhone(722, 500, 286, 278, 760, 800) + vitre(722, 500, 286, 278) }), LI(380, 1846, 1200, 'frime')],
      over: () => knock(480, 330, -6) + tag('MAYA, LA VOISINE', 830, 450, 4) + sub(1, 'maya', 'Coucou T-Crazy ! Le commentaire, c\'est moi. Ta bouche est décalée sur toute la vidéo.') },
    { t: '0:41', cap: 'Le téléphone de Maya : ses prises et son son entrent dans Stalak', set: ROOMN, shade: true,
      over: () => phoneBig(stalakApp({ takes: [['nuit', 'colere'], ['chambre', 'frime'], ['nuit', 'fierte']], count: 3, ti: -1, sticker: 'shock', dl: 1.2, word: 'prises' }), 0.92) + sub(1, 'maya', 'Tu mets ton son et tes prises.') },
    { t: '0:46', cap: 'Le clip de Liam, coupé sur le temps, la bouche synchro', set: ROOMN, shade: true,
      over: () => phoneBig(stalakApp({ takes: [['nuit', 'colere'], ['chambre', 'frime'], ['nuit', 'fierte']], count: 3, ti: 0, sticker: 'cool', dl: 0.6, word: 'prises', lyric: 'le son de l\'année' }), 0.92) + sub(1, 'maya', 'Stalak coupe sur le rythme, et ta bouche reste synchro.') },
    { t: '0:53', cap: 'Liam regarde son clip, ému ; Maya toujours à la fenêtre', set: ROOMN, chars: [CH('maya', 1, 865, 1490, 1150, 'frime', '', { clip: [722, 500, 286, 278], after: winPhone(722, 500, 286, 278, 760, 800) + vitre(722, 500, 286, 278) }), LI(380, 1846, 1200, 'fierte+larme', P.phone(606, 760), { pose: { raise: 'r' } })],
      over: () => sub(1, 'maya', 'Pas pour rien. T\'as appris la patience.') },
    { t: '0:59', cap: 'Liam parle à celui qui regarde (la nuit)', set: ROOMN0, zoom: [500, 960, 1.3], chars: [LI(540, 2730, 2250, 'frime', P.phone(606, 760), { pose: { raise: 'r' } })],
      over: () => sub(1, 'liam', 'Si toi aussi tu passes tes nuits à recaler ta bouche sur ton son, arrête. Stalak le fait pour toi.') },
    { t: '1:07', cap: 'La carte de fin (le prochain à sortir : GTA 6, le 19 au soir)', plain: true, over: () => endCard(GTA) },
  ], 'Version 2 (16/11) : tes remarques de l\'épisode 1 appliquées.');

  // the GTA 6 episode comes out on 19/11 in the evening, right after episode 2 : number 3 on screen. GTA 6 : the name only, the game never shown.
  const GTA = 'IL SORT SON SON LE JOUR DE GTA 6';
  ep('ep4', GTA, 3, [
    { t: '0:00', cap: "L'accroche : Deuce n'en revient pas, il crie", set: ROOM, criY: 700, chars: [CH('deuce', 1, 560, 2660, 2050, 'panique')],
      over: () => bandeau(2, GTA, 3) + FRAME.cri('deuce', `Sortir ton son le jour de GTA 6${NB}?! T'es fou${NB}!`, 700) },
    { t: '0:03', cap: 'Le narrateur présente Liam et Deuce', set: ROOM, chars: [LI(230, 1490, 1000, 'frime', HP), CH('deuce', 1, 740, 1846, 1200, 'frime')],
      over: () => tag('LIAM, ALIAS T-CRAZY', 330, 430, -3) + tag('DEUCE, SON POTE', 760, 590, 3) + sub(1, 'narrateur', 'Voici Liam. 15 ans. Zéro abonné. Il a choisi la pire date de l\'année pour sortir son son.') },
    { t: '0:09', cap: 'Liam, sûr de lui', set: ROOM0, zoom: [560, 960, 1.3], chars: [LI(360, 2250, 1500, 'frime', HP), CH('deuce', 1, 820, 2250, 1460, 'colere')],
      over: () => sub(1, 'liam', 'Justement. Tout le monde sera chez soi, devant un écran.') },
    // v2 (owner, 16/11 : « un seul décor ici, pas deux ») : the school corridor alone, then the empty court with a tumbleweed
    // rolling across, as in a western ; the court comes on « jour de la sortie de GTA 6, tout le quartier a disparu » (2.36 s from the start of the shot)
    { t: '0:16', cap: 'Carton « Le 19 novembre » : le couloir du lycée vide, puis le terrain vide où roule une boule d\'herbes sèches', plain: true,
      over: () => K({ out: 2.36 }, band(LYCEE, 0, 1920, 540, 960, 1, 'ly')) + K({ in: 2.36 }, band(TERRAIN, 0, 1920, 540, 960, 1, 'ta') +
        K({ lin: [1500, 0, 2.36, 5.5] }, `<ellipse cx="-160" cy="1712" rx="80" ry="14" fill="${INK}" opacity="0.25"/>`) + K({ lin: [1500, 0, 2.36, 5.5], spin: 320, hop: [34, 1.4] }, tumbleweed(-160, 1614, 88))) +
        carton('LE 19 NOVEMBRE') + sub(1, 'narrateur', 'Le 19 novembre, jour de la sortie de GTA 6, tout le quartier a disparu.') },
    { t: '0:22', cap: "L'épicerie : « FERMÉ »", set: STREET, zoom: [668, 1060, 1.5], front: closed, chars: [CH('reyes', 1, 560, 1580, 820, 'frime', '', { clip: [303, 675, 476, 585], after: glare(303, 675, 476, 585) })],
      over: () => tag('M. REYES, L\'ÉPICIER', 360, 560, -3) + sub(1, 'reyes', 'Je vais jouer.') },
    // v2 (owner, 16/11 : « une sorte de TikTok, avec les likes sur le côté, le pseudo ») : he posts his song with a still picture
    // (the tap at 2.9 s, on « sort quand même son son »), the feed comes on « Avec juste une image fixe », and nothing moves
    { t: '0:26', cap: 'Carton « Le soir » : il publie son son avec juste une image fixe ; dans le fil, zéro partout', set: ROOMN, chars: [LI(540, 1846, 1250, 'frime', P.phone(606, 760), { pose: { raise: 'r' } })],
      over: () => phoneBig(publish({ at: 2.9, pic: stillPic(), feed: { user: 't.crazy', caption: 'Mon nouveau son !', sound: 'son original - T-Crazy', likes: 0, comments: 0, shares: 0 },
        after: K({ in: 4.3, pop: 0.4 }, `<g transform="translate(26 112)"><rect width="236" height="58" rx="16" fill="#0b0d12" fill-opacity="0.8" stroke="${SNOW}" stroke-width="3"/><path d="M 24 15 L 50 29 L 24 43 Z" fill="${SNOW}"/>${T(146, 40, '0 écoute', 30, SNOW, { font: 'Rubik', weight: 800 })}</g>`) }), 0.92, { dl: 1.1 }) + carton('LE SOIR', 200) + sub(1, 'liam', 'Zéro écoute. Même pas ma mère.') },
    { t: '0:32', cap: "Liam demande à sa mère ; elle, hors champ : la lumière d'un écran (la nuit)", set: KITCHEN, setOver: kitchenNight, dim: 0.55, chars: [LI(780, 1846, 1200, 'fierte')],
      over: () => screenLight(300, 760) + carton('LA CUISINE', 360) + sub(1, 'nadia', 'Pas maintenant, je suis en pleine mission !') }, // a change of place : its caption (owner, 16/11)
    { t: '0:37', cap: 'Carton « Le lendemain · dans la rue » : Maya arrive et dit bonjour', set: STREET, setOver: closed, chars: [CH('maya', 1, 300, 1846, 1180, 'frime', P.phone(580, 1130)), LI(760, 1846, 1200, 'panique')],
      over: () => carton('LE LENDEMAIN · DANS LA RUE') + tag('MAYA, LA VOISINE', 300, 560, -4) + sub(1, 'maya', 'Ils jouent, oui. Mais entre deux parties, ils scrollent.') },
    { t: '0:47', cap: 'Il se filme trois fois dans le placard', set: ROOM0, zoom: [290, 900, 1.7], chars: [LI(420, 2250, 1500, 'fierte', P.phoneBack(606, 740), { pose: { raise: 'r' } })],
      over: () => sub(1, 'narrateur', 'Alors il se filme en train de rapper son son : trois prises, dans son placard.') },
    { t: '0:51', cap: 'Stalak, dessiné : son son et ses 3 prises, puis le clip coupé sur le temps', set: ROOM, shade: true,
      over: () => phoneBig(stalakApp({ takes: [['placard', 'fierte'], ['placard', 'frime'], ['placard', 'colere']], count: 3, ti: 2.4, sticker: 'hype', dl: 2.9, word: 'prises' }), 0.92) + sub(1, 'narrateur', 'Il met son son et ses trois vidéos dans Stalak. Stalak coupe sur le rythme et garde la synchro des lèvres.') },
    { t: '0:58', cap: 'Le téléphone vibre', set: ROOM, chars: [LI(540, 1846, 1250, 'fierte', P.phoneBack(606, 740), { pose: { raise: 'r' } })],
      over: () => notif('Nadia a aimé ta vidéo.', 330) + sub(1, 'liam', 'Ma mère a liké pendant sa partie !') },
    { t: '1:02', cap: 'Liam parle à celui qui regarde', set: ROOM0, zoom: [500, 960, 1.3], chars: [LI(540, 2730, 2250, 'frime', P.phone(606, 760), { pose: { raise: 'r' } })],
      over: () => sub(1, 'liam', 'Tout le monde est sur GTA 6 ? Entre deux parties, ils scrollent. Sois dans leur fil avec un clip, pas juste un son.') },
    { t: '1:10', cap: 'La carte de fin', plain: true, over: () => endCard('SON POTE S\'EST NOMMÉ SON MANAGER') },
  ], "Version 2 (16/11). Sort le 19/11 au soir, jour de GTA 6, juste après l'épisode 2 : c'est l'épisode 3 à l'écran.");

  // the manager episode comes out on 20/11, after the GTA 6 one : number 4 on screen
  ep('ep3', 'SON POTE S\'EST NOMMÉ SON MANAGER', 4, [
    // v2 (owner's remark on episode 1, for the whole series) : the one who shouts is in the middle, big, seen from the first picture
    { t: '0:00', cap: "L'accroche : Liam au centre, les bras chargés de glaçons, il crie", set: STREET, zoom: [540, 650, 1.5], criY: 700, chars: [LI(540, 2700, 2150, 'colere', `<g transform="translate(0 120)">${BAGS(6)}</g>`)], // the bags lower : his face stays clear
      over: () => bandeau(2, 'SON POTE S\'EST NOMMÉ SON MANAGER', 4) + FRAME.cri('liam', 'Mon manager m\'a fait acheter douze sachets de glaçons !', 700) },
    { t: '0:03', cap: 'Le narrateur présente Deuce', set: STREET, chars: [CH('deuce', 1, 380, 1846, 1300, 'frime'), LI(800, 1846, 1150, 'colere', BAGS(4))],
      over: () => tag('DEUCE, SON POTE', 380, 470, -3) + tag('LIAM, ALIAS T-CRAZY', 720, 640, 3) + sub(1, 'narrateur', 'Voici Deuce, le meilleur pote de Liam. Il s\'est nommé son manager. Personne ne lui a rien demandé.') },
    { t: '0:10', cap: 'Carton « Ce matin » : Deuce déroule son plan', set: STREET, zoom: [700, 1150, 1.3], chars: [CH('deuce', 1, 600, 2700, 2150, 'frime'), LI(160, 2300, 1500, 'panique')],
      over: () => carton('CE MATIN') + sub(1, 'deuce', 'Le plan est simple : un clip devant l\'épicerie, une seule prise, et demain, t\'es partout.') },
    { t: '0:18', cap: 'Ils filment. M. Reyes sort de sa boutique', set: STREET, chars: [CH('deuce', 1, 170, 1846, 1150, 'frime', P.phone(580, 1130)), LI(500, 1846, 1200, 'fierte'), CH('reyes', 1, 880, 1856, 1250, 'colere')],
      over: () => tag('M. REYES, L\'ÉPICIER', 700, 520, 3) + sub(1, 'reyes', 'Pas de tournage devant ma boutique. Sauf si t\'achètes quelque chose.') },
    { t: '0:25', cap: 'Prise 4 : un bus passe', set: STREET, chars: [LI(420, 1846, 1200, 'fierte')],
      over: () => bus(-60, 1900, 1040) + clap(820, 330, 4) + sub(1, 'narrateur', 'À chaque prise ratée, un sachet de glaçons de plus.') },
    { t: '0:28', cap: 'Prise 12 : un chien aboie, Deuce filme à l\'horizontale', set: STREET, chars: [CH('deuce', 1, 200, 1846, 1150, 'frime', phoneWide(580, 1120)), LI(560, 1846, 1200, 'panique')],
      over: () => `<g transform="translate(860 1520) scale(1.5) translate(-860 -1520)">${dog(860, 1520)}</g>` + clap(820, 330, 12, 5) + sub(1, 'narrateur', 'Prise douze : douze sachets.') },
    { t: '0:30', cap: 'M. Reyes tend la main : un sachet de plus', set: STREET, chars: [LI(330, 1846, 1200, 'panique', BAGS(6)), CH('reyes', 1, 820, 1856, 1250, 'frime', bigBag(590, 1150, 8, 1.5))],
      over: () => sub(1, 'narrateur', 'Et toujours pas de clip.') },
    // v3 (owner, 16/11 : « l'entrée de Big Mo et Maya sont trop rapides… il pourrait arriver en marchant, Liam se dit
    // "wouah c'est Big Mo", ils échangent, à la fin Big Mo part, ensuite Liam est dégoûté, et là Maya arrive ») :
    // Big Mo walks in, his followers behind him ; Liam recognises him ; they talk ; Big Mo walks away, passing behind Liam
    { t: '0:35', cap: 'Big Mo arrive en marchant avec ses deux suiveurs : Liam le reconnaît', set: STREET, chars: [
      CH('deuce', 2, 420, 1700, 1050, 'frime', '', { sil: true, k: { walk: [[0.35, 900, 0], [2.65, 0, 0]] } }),
      CH('bigmo', 2, 900, 1700, 1080, 'frime', '', { sil: true, k: { walk: [[0.5, 700, 0], [2.8, 0, 0]] } }),
      CH('bigmo', 1, 660, 1846, 1350, 'frime', '', { k: { walk: [[0, 760, 0], [2.3, 0, 0]] } }),
      // Liam waits, cool, then lights up when he sees who it is
      LI(230, 1846, 1100, 'frime', BAGS(2), { k: { out: 1.05 } }), LI(230, 1846, 1100, 'fierte', BAGS(2), { k: { in: 1.05 } })],
      over: () => tag('BIG MO, LA STAR DU QUARTIER', 560, 400, -3).replace('class="tag"', 'class="tag" data-dl="2.3"') + sub(1, 'liam', 'Wouah, c\'est Big Mo, le rappeur le plus connu de chez moi !') },
    { t: '0:41', cap: 'Big Mo, arrêté devant Liam : ils échangent, puis il repart en marchant', set: STREET, chars: [
      CH('deuce', 2, 420, 1700, 1050, 'frime', '', { sil: true, k: { walk: [[-2.0, 0, 0], [0, -1150, 0]] } }),
      CH('bigmo', 2, 900, 1700, 1080, 'frime', '', { sil: true, k: { walk: [[-1.8, 0, 0], [0, -1350, 0]] } }),
      CH('bigmo', 1, 660, 1846, 1350, 'frime', '', { k: { walk: [[-2.2, 0, 0], [-0.15, -1020, -20]] } }),
      LI(230, 1846, 1100, 'panique', BAGS(2))],
      over: () => sub(1, 'bigmo', 'Encore toi, le petit ? Moi, j\'ai posté trois clips ce matin.') },
    // Liam alone, disgusted : how does Big Mo do three clips ? He collapses (falls out of the picture), cut to him lying
    { t: '0:48', cap: 'Liam, seul, dégoûté, s\'effondre', set: STREET, zoom: [420, 1250, 1.2], chars: [
      LI(470, 1846, 1250, 'colere', BAGS(2), { k: { tilt: [[-0.8, 0], [-0.3, -26]], pv: [470, 1846], path: [[-0.8, 0, 0], [-0.3, -60, 820]] } })],
      over: () => sub(1, 'liam', 'Trois clips en un matin… Mais comment il fait ?') },
    { t: '0:52', cap: "Liam par terre au milieu de ses sachets. Maya arrive en marchant et dit bonjour", set: STREET, zoom: [540, 1150, 1.25], chars: [
      CH('maya', 1, 880, 1900, 1420, 'frime', P.phone(580, 1130), { k: { walk: [[0.3, 720, 0], [2.4, 0, 0]] } })],
      over: () => tag('MAYA, LA VOISINE', 640, 520, 3).replace('class="tag"', 'class="tag" data-dl="2.45"') + lying('panique', 420, 1610, 0.55) + bigBag(470, 1610, -18, 1.25) + bigBag(690, 1650, 14, 1.3) + bigBag(590, 1560, -6, 1.25) + sub(1, 'maya', 'Salut T-Crazy. Big Mo, il fait pas trois tournages : il filme ses prises, et Stalak fait le montage.') },
    { t: '1:00', cap: 'Liam, relevé, sort son téléphone : Stalak, dessiné, ses douze prises et son son, puis le clip', set: STREET, chars: [LI(540, 1846, 1250, 'fierte', P.phone(606, 760), { pose: { raise: 'r' } })],
      over: () => phoneBig(stalakApp({ takes: [['rue', 'fierte'], ['rue', 'frime'], ['rue', 'colere'], ['rue', 'fierte']], count: 12, ti: 2.9, sticker: 'cool', dl: 3.4 }), 0.92, { dl: 0.5 }) + sub(1, 'narrateur', 'Liam met son son et ses douze prises dans Stalak. Stalak coupe sur le rythme et garde la synchro des lèvres.') },
    { t: '1:07', cap: 'M. Reyes regarde le clip par-dessus son épaule', set: STREET, chars: [CH('reyes', 1, 640, 1790, 1300, 'frime'), LI(470, 1880, 1200, 'fierte', P.phoneBack(606, 740), { pose: { raise: 'r' } })],
      over: () => sub(1, 'reyes', 'Pas mal. Pour le prochain clip, j\'ai une promo sur les glaçons.') },
    { t: '1:11', cap: 'Liam parle à celui qui regarde', set: STREET, zoom: [540, 1150, 1.3], chars: [LI(540, 2730, 2250, 'frime', P.phone(606, 760), { pose: { raise: 'r' } })],
      over: () => sub(1, 'liam', 'Pas de manager, pas de budget ? T\'as un téléphone. Filme tes prises, Stalak fait le montage.') },
    { t: '1:19', cap: 'La carte de fin', plain: true, over: () => endCard('IL VOULAIT UN CLIP COMME DANS GTA') },
  ], "Version 3 (16/11, 20 h) : Big Mo et Maya arrivent en marchant, lumières réalistes. Sort le 20/11, après l'épisode GTA 6 : c'est l'épisode 4 à l'écran.");

  // v2 (16/11, 19 h 32 : the lights) : the evening is the street at sunset (lights.js), its light over everyone ;
  // the morning stays the street by day
  const SUNSET = ['rue', 1, 'jour'], EVE = ['rue', 1, 'coucher'];
  ep('ep5', 'IL VOULAIT UN CLIP COMME DANS GTA', 5, [
    { t: '0:00', cap: "L'accroche : M. Reyes, au centre, crie (le matin)", set: SUNSET, zoom: [700, 1100, 1.2], criY: 700, chars: [CH('reyes', 1, 540, 2560, 1900, 'colere')],
      over: () => bandeau(2, 'IL VOULAIT UN CLIP COMME DANS GTA', 5) + FRAME.cri('reyes', 'Rendez-moi ma plante !', 700) },
    { t: '0:03', cap: 'Le narrateur présente Deuce', set: SUNSET, chars: [CH('deuce', 1, 380, 1846, 1300, 'fierte'), LI(800, 1846, 1150, 'frime')],
      over: () => tag('DEUCE, SON POTE', 380, 470, -3) + tag('LIAM, ALIAS T-CRAZY', 720, 640, 3) + sub(1, 'narrateur', 'Voici Deuce, le pote de Liam. Il a vu la bande-annonce de GTA 6. Maintenant, il veut un clip pareil.') },
    { t: '0:10', cap: 'Carton « Plus tôt, ce matin » : Deuce décrit son clip', set: SUNSET, zoom: [540, 1150, 1.3], chars: [CH('deuce', 1, 540, 2900, 2050, 'fierte')],
      over: () => dream(540, 640) + `<circle cx="600" cy="910" r="34" fill="${SNOW}" stroke="${INK}" stroke-width="7"/><circle cx="570" cy="975" r="20" fill="${SNOW}" stroke="${INK}" stroke-width="6"/>` + carton('PLUS TÔT, CE MATIN', 230) + sub(1, 'deuce', 'On va faire un clip comme dans GTA. Des voitures de luxe, des palmiers, un hélicoptère.') },
    { t: '0:15', cap: 'Ce qu\'ils ont vraiment : un scooter, une plante', set: SUNSET, chars: [LI(330, 1846, 1200, 'colere'), CH('deuce', 1, 820, 1846, 1180, 'frime', P.plant(590, 1090))],
      over: () => `<g transform="translate(540 1480) scale(0.7) translate(-540 -1480)">${scooter(540, 1080, 1700, 0.57)}</g>` + sub(1, 'liam', 'On a un scooter.') },
    { t: '0:18', cap: 'Le tournage : le scooter cale, le ventilateur-hélico', set: SUNSET, chars: [LI(420, 1700, 1150, 'panique'), CH('deuce', 1, 880, 1846, 1150, 'fierte', fan(640, 1000))],
      over: () => scooter(420, 1198, 1700) + smoke(170, 1580) + P.plant(120, 1300) + sub(1, 'narrateur', 'Budget du clip : un scooter emprunté et une plante verte.') },
    { t: '0:26', cap: 'M. Reyes les a retrouvés : il crie', set: SUNSET, zoom: [700, 1100, 1.2], chars: [CH('reyes', 1, 640, 2600, 1900, 'colere')],
      over: () => tag('M. REYES, L\'ÉPICIER', 250, 1280, -4) + sub(1, 'reyes', 'Rendez-moi ma plante !') },
    { t: '0:30', cap: 'Carton « Le soir » : Liam sort son téléphone et fait défiler ses douze prises', set: EVE, chars: [LI(540, 1846, 1250, 'colere', P.phone(606, 760), { pose: { raise: 'r' } })],
      over: () => phoneBig(gallery12(), 0.92, { dl: 1.1 }) + carton('LE SOIR', 200) + sub(1, 'liam', 'C\'est nul. On dirait pas du tout un jeu vidéo.') },
    // v2 (owner, 16/11, on « Le manager », for the whole series : no one pops in too fast) : Maya walks in, then speaks
    { t: '0:38', cap: 'Maya arrive en marchant et dit bonjour', set: EVE, chars: [CH('maya', 1, 760, 1846, 1180, 'frime', P.phone(580, 1130), { k: { walk: [[0.2, 640, 0], [2.3, 0, 0]] } }), LI(320, 1846, 1200, 'colere')],
      over: () => tag('MAYA, LA VOISINE', 760, 560, 4).replace('class="tag"', 'class="tag" data-dl="2.35"') + sub(1, 'maya', 'Salut les garçons ! Les gens veulent pas un jeu vidéo. Ils veulent te voir rapper ton son. Mets tes prises dans Stalak.') },
    { t: '0:46', cap: 'Liam ouvre Stalak sur son téléphone : le son et les douze prises entrent', set: EVE, chars: [LI(540, 1846, 1250, 'frime', P.phone(606, 760), { pose: { raise: 'r' } })],
      over: () => phoneBig(stalakApp({ takes: [['coucher', 'fierte'], ['rue', 'frime'], ['coucher', 'colere'], ['rue', 'fierte']], count: 12, ti: -1 }), 0.92, { dl: 0.45 }) + sub(1, 'narrateur', 'Liam met son son et ses douze prises dans Stalak.') },
    { t: '0:52', cap: 'Le clip : le scooter, la plante, coupés sur le temps', set: EVE, shade: true,
      over: () => phoneBig(stalakApp({ takes: [['coucher', 'fierte'], ['rue', 'frime'], ['coucher', 'colere'], ['rue', 'fierte']], count: 12, ti: 0, sticker: 'cool', dl: 0.6 }), 0.92) + sub(1, 'narrateur', 'Stalak coupe sur le rythme et garde la synchro des lèvres.') },
    { t: '0:58', cap: 'Deuce, très fier', set: EVE, chars: [LI(320, 1846, 1200, 'colere'), CH('deuce', 1, 780, 1846, 1230, 'fierte')],
      over: () => sub(1, 'deuce', 'Je l\'avais dit : façon GTA.') },
    { t: '1:02', cap: 'Liam parle à celui qui regarde', set: EVE, zoom: [540, 1150, 1.3], chars: [LI(540, 2730, 2250, 'frime', P.phone(606, 760), { pose: { raise: 'r' } })],
      over: () => sub(1, 'liam', 'Pas besoin d\'un budget de jeu vidéo. Ton son, tes prises au téléphone, et Stalak coupe sur le rythme.') },
    { t: '1:10', cap: 'La carte de fin', plain: true, over: () => endCard('LE CLASH AU TERRAIN') },
  ], "Version 2 (16/11). Sort le 21/11. GTA 6 : le nom seulement, jamais le jeu. À faire vérifier par Juridique.");

  // ---------------- the thumbnails (TikTok cover), one per episode, in the style of the validated example (frame.js) ----------------
  const thumb = (set, chars, title, num, extra = '') => ({ set, chars, over: () => extra + `<g transform="translate(0 120)">${bandeau(2, title, num)}</g>` });
  FRAMES['thumb-ep1'] = thumb(KITCHEN, [CH('nadia', 2, 790, 2760, 2300, 'colere', P.phone(580, 1130, '#ffe066')), LI(330, 3080, 2330, 'panique')], 'SA MÈRE A CRIÉ EN PLEINE PRISE', 1);
  FRAMES['thumb-ep2'] = thumb(ROOMN0, [LI(540, 3150, 2450, 'colere+cerne', HP)], 'IL A PASSÉ LA NUIT SUR SA VIDÉO DE PROMO', 2, `<rect width="1080" height="1920" fill="#57adff" opacity="0.10"/>`);
  FRAMES['thumb-ep4'] = thumb(ROOM, [LI(320, 3080, 2330, 'frime', HP), CH('deuce', 1, 790, 2900, 2350, 'panique')], GTA, 3);
  FRAMES['thumb-ep3'] = thumb(STREET, [CH('deuce', 1, 800, 2860, 2250, 'frime'), LI(330, 3000, 2330, 'colere', BAGS(4))], 'SON POTE S\'EST NOMMÉ SON MANAGER', 4);
  FRAMES['thumb-ep5'] = thumb(EVE, [CH('deuce', 1, 800, 2900, 2300, 'fierte', P.plant(600, 1080)), LI(330, 3000, 2330, 'panique')], 'IL VOULAIT UN CLIP COMME DANS GTA', 5);

  window.STORYBOARD = { BOARDS, P, band, hp, headAt, phoneBig, laptopBig, take, editor, clockBig, postScreen, winPhone, gallery, stalakApp, takeScene, liamBust, carton, knock, notif, comment, tag, endCard };
})();
