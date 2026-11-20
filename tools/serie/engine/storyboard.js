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
    // the basketball court in the afternoon (episode 6) ; terrain-maya : Maya dances at Liam's side
    if (kind === 'terrain' || kind === 'terrain-maya') {
      let c = `<rect width="520" height="400" fill="#a9d4f0"/><rect y="150" width="520" height="140" fill="#cfd6df"/>` + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => `<path d="M ${i * 44 - 20} 150 L ${i * 44 + 40} 290 M ${i * 44 + 40} 150 L ${i * 44 - 20} 290" stroke="#8a919c" stroke-width="3"/>`).join('') +
        `<rect y="140" width="520" height="12" fill="#6f7480"/><rect y="290" width="520" height="110" fill="#7a7c84"/><path d="M 0 330 C 160 300 360 300 520 330" fill="none" stroke="#e8e6e0" stroke-width="6" opacity="0.7"/>` +
        `<circle cx="470" cy="60" r="70" fill="#fff4cf" opacity="0.55"/>`;
      if (kind === 'terrain-maya') { const r = CAST.figure('maya', 1, 'fierte'); c += `<defs>${r.defs}</defs><g transform="translate(330 30) scale(0.42)">${r.svg}</g>`; }
      return c;
    }
    if (kind === 'rue') return `<rect width="520" height="400" fill="#9fd0f0"/><rect x="0" y="40" width="520" height="300" fill="#e8d3b0" stroke="${INK}" stroke-width="4"/><rect x="0" y="40" width="520" height="70" fill="#c8443a"/>${T(260, 92, 'REYES', 46, SNOW)}` +
      [0, 1, 2, 3, 4, 5, 6, 7].map(i => `<rect x="${i * 66}" y="110" width="33" height="36" fill="${i % 2 ? '#2f8a4e' : '#f3ecd8'}"/>`).join('') + `<rect x="0" y="330" width="520" height="70" fill="#c7c0b4"/>`;
    if (kind === 'coucher') return `<defs><linearGradient id="cch${++UID}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff7a4a"/><stop offset="1" stop-color="#ffd08a"/></linearGradient></defs><rect width="520" height="400" fill="url(#cch${UID})"/><circle cx="400" cy="250" r="70" fill="#fff0b8" opacity="0.9"/><rect x="0" y="320" width="520" height="80" fill="#8a5a4a"/>` +
      `<g transform="translate(90 330) scale(0.9)">${P.plant(0, -70)}</g>`;
    // 17/11 : the takes of the new episodes. tshirts : in front of the shop, the table of tee-shirts on both sides of Liam ;
    // lampe : under Deuce's phone light, black around ; lampadaire : orange under the street lamp ; vitrine : the warm shop window
    if (kind === 'tshirts' || kind === 'tshirts-deuce') {
      let c = takeScene('rue') + `<rect x="-10" y="298" width="540" height="24" rx="5" fill="#c9cdd6" stroke="${INK}" stroke-width="4"/>` +
        [[52, 3], [128, 4], [398, 3], [474, 2]].map(([x, n]) => [0, 1, 2, 3].slice(0, n).map(i => foldedTee(x, 298 - (i + 1) * 17, 64)).join('')).join('');
      if (kind === 'tshirts-deuce') { const r = CAST.figure('deuce', 1, 'fierte'); c += `<defs>${r.defs}</defs><g transform="translate(330 30) scale(0.42)">${r.svg}${tshirt(600, 1060, 300, -14)}</g>`; }
      return c;
    }
    if (kind === 'terrain-echarpe') return takeScene('terrain');
    // the furnished roof at dusk (17/11, « La fiche d'orientation ») : the string lights, the city lit up below
    if (kind === 'toit') { let c = `<defs><linearGradient id="tt${++UID}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1d2350"/><stop offset="0.6" stop-color="#5a3d8f"/><stop offset="1" stop-color="#f39a62"/></linearGradient></defs><rect width="520" height="400" fill="url(#tt${UID})"/>`;
      c += `<path d="M 0 300 L 40 300 L 40 260 L 90 260 L 90 290 L 150 290 L 150 240 L 210 240 L 210 300 L 300 300 L 300 250 L 360 250 L 360 280 L 430 280 L 430 230 L 480 230 L 480 300 L 520 300 L 520 400 L 0 400 Z" fill="#2b2140"/>`;
      for (let i = 0; i < 14; i++) c += `<rect x="${12 + (i * 37) % 500}" y="${262 + (i * 23) % 40}" width="7" height="9" fill="#ffd36b"/>`;
      c += `<path d="M 0 40 Q 260 130 520 50" fill="none" stroke="#2a2d36" stroke-width="3"/>` + [40, 110, 180, 250, 320, 390, 460].map((x, i) => `<circle cx="${x}" cy="${(52 + Math.sin(i / 6 * Math.PI) * 52).toFixed(0)}" r="9" fill="#ffe9a8" stroke="${INK}" stroke-width="2"/><circle cx="${x}" cy="${(52 + Math.sin(i / 6 * Math.PI) * 52).toFixed(0)}" r="22" fill="#ffd36b" opacity="0.3"/>`).join('');
      return c + `<rect y="340" width="520" height="60" fill="#5f5866"/>`; }
    if (kind === 'lampe') return `<rect width="520" height="400" fill="#05070d"/><radialGradient id="lp${++UID}" cx="0.5" cy="0.45" r="0.6"><stop offset="0" stop-color="#f4f8ff" stop-opacity="0.55"/><stop offset="1" stop-color="#f4f8ff" stop-opacity="0"/></radialGradient><rect width="520" height="400" fill="url(#lp${UID})"/>`;
    if (kind === 'lampadaire') return `<rect width="520" height="400" fill="#141a3c"/><rect x="0" y="330" width="520" height="70" fill="#2a2b3a"/><rect x="62" y="0" width="14" height="400" fill="#2a2d36"/>` +
      `<path d="M 70 40 L 0 400 L 300 400 Z" fill="#ffb347" opacity="0.28"/><circle cx="96" cy="40" r="60" fill="#ffcf7a" opacity="0.45"/><ellipse cx="96" cy="38" rx="26" ry="8" fill="#fff3c4"/>`;
    if (kind === 'vitrine') return `<rect width="520" height="400" fill="#1b2150"/><rect x="0" y="40" width="520" height="70" fill="#c8443a"/>${T(260, 92, 'REYES', 46, SNOW)}` +
      `<rect x="30" y="130" width="300" height="270" fill="#ffdca4" stroke="${INK}" stroke-width="5"/><rect x="360" y="130" width="140" height="270" fill="#ffe9c0" stroke="${INK}" stroke-width="5"/><rect width="520" height="400" fill="#ffd08a" opacity="0.12"/>`;
    return `<rect width="520" height="400" fill="#cfe3f7"/>`;
  }
  // 17/11 : what Liam wears in a take (in his own coordinates)
  function takeProps(kind) { return kind === 'terrain-echarpe' ? scarf() : ''; }
  // 17/11 : what the light of a take does to Liam himself (drawn over him, in the preview's coordinates)
  function takeOver(kind) {
    if (kind === 'lampe') return `<radialGradient id="lo${++UID}" cx="0.5" cy="0.42" r="0.5"><stop offset="0" stop-color="#ffffff" stop-opacity="0.62"/><stop offset="0.55" stop-color="#ffffff" stop-opacity="0.22"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient><rect width="520" height="400" fill="url(#lo${UID})"/>`;
    if (kind === 'lampadaire') return `<rect width="520" height="400" fill="#ff8a2a" opacity="0.3" style="mix-blend-mode:multiply"/>` + moths(110, 70, 0.8);
    if (kind === 'vitrine') return `<rect width="520" height="400" fill="#ffd08a" opacity="0.12"/>`;
    return '';
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
    // o.bw (17/11, « Nuit à 17 h ») : the free filter « Noir & blanc » on the clip
    if (o.bw) s += `<filter id="bw${++UID}"><feColorMatrix type="saturate" values="0"/></filter><g filter="url(#bw${UID})">`;
    takes.forEach(([kind, expr], j) => {
      s += `<g class="tk"${j ? ' display="none"' : ''}>${takeScene(kind)}${liamBust(expr, 260, 40, 700, kind === 'placard' || kind === 'nuit' ? P.headphones() : takeProps(kind))}${takeOver(kind)}` +
        `<g transform="rotate(-3 76 36)"><rect x="18" y="16" width="118" height="42" rx="10" fill="${TAKE_COL[j % 4]}" stroke="${INK}" stroke-width="4"/>${T(77, 46, 'PRISE ' + (j + 1), 25, INK)}</g></g>`;
    });
    if (o.bw) s += '</g>';
    s += `<rect x="0" y="0" width="520" height="400" rx="18" fill="none" stroke="${INK}" stroke-width="6"/>`;
    if (o.lyric) { const ls = o.lyric.split('\n'); ls.forEach((l, i) => { s += T(260, 376 - (ls.length - 1 - i) * 38, l, 30, SNOW, { font: 'Rubik', weight: 900, stroke: INK, sw: 9 }); }); }
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
    // o.rows : other rows of real options (17/11 : « Filtre », the 3 free filters ; « Rythme : Nerveux » selected)
    (o.rows || [['Coupes', ['Auto', 'Sur les mots', 'Par mesure'], 0], ['Rythme', ['Posé', 'Normal', 'Nerveux'], 1], ['Effets', ['Aucun', 'Sobre', 'Intense'], 1]]).forEach(([label, opts, sel], r) => {
      const y = 712 + r * 96;
      s += T(22, y, label, 24, '#5b6170', { font: 'Rubik', weight: 800, anchor: 'start' });
      let fs = 24; while (fs > 17 && opts.reduce((a, op) => a + FRAME.width(op, `700 ${fs}px Rubik`) + 46, 0) > 525) fs--; // the chips fit the screen
      let x = 20;
      opts.forEach((op, i) => { const w = FRAME.width(op, `700 ${fs}px Rubik`) + 36; s += `<rect x="${x}" y="${y + 12}" width="${w}" height="46" rx="23" fill="${i === sel ? BLUE : SNOW}" stroke="${i === sel ? INK : '#c3cbd8'}" stroke-width="3"/>${T(x + w / 2, y + 44 - (24 - fs) / 2, op, fs, i === sel ? SNOW : INK, { font: 'Rubik', weight: 700 })}`; x += w + 10; });
    });
    s += '</g>';
    // o.wm : the little Stalak logo of the free version, in a corner of the clip (episode 6 : « la version gratuite »)
    if (o.wm) s += `<g opacity="0.85"><circle cx="490" cy="470" r="22" fill="${INK}"/>${img('/site_src/icons/icon.svg', 470, 450, 40, 40)}</g>`;
    // the sticker sits on the screen's right edge, clear of the « Nerveux » and « Intense » chips (planche, 16/11)
    if (o.sticker) s += `<g class="sticker" data-dl="${o.dl != null ? o.dl : 0.55}"><g transform="translate(492 872)"><circle r="86" fill="${SNOW}" stroke="${INK}" stroke-width="6"/>${img(`/site_src/emoji/${o.sticker}.webp`, -76, -76, 152, 152)}</g></g>`;
    return s;
  }
  // ---------------- 16/11 (owner) : every change of place or time is said on screen, and who arrives is clear ----------------
  // a caption at the top (« CINQ MINUTES PLUS TARD · LA CUISINE ») : it pops in, stays 3 s, then goes away
  const carton = (text, y = 268) => {
    // a long caption gets a smaller font, so that the card stays inside the picture (17/11 : « Le lendemain, au coucher du soleil · le toit »)
    let fs = 46; while (fs > 30 && FRAME.width(text, `${fs}px "Lilita One"`) + 116 > 960) fs -= 2;
    const w = FRAME.width(text, `${fs}px "Lilita One"`) + 116, x = 500 - w / 2;
    return `<g class="carton"><g transform="rotate(-2 500 ${y})"><rect x="${x + 8}" y="${y - 30}" width="${w}" height="82" rx="20" fill="${INK}"/><rect x="${x}" y="${y - 40}" width="${w}" height="82" rx="20" fill="${ICE}" stroke="${INK}" stroke-width="6"/>` +
      `<circle cx="${x + 46}" cy="${y + 1}" r="21" fill="${SNOW}" stroke="${INK}" stroke-width="5"/><path d="M ${x + 46} ${y + 1} L ${x + 46} ${y - 11} M ${x + 46} ${y + 1} L ${x + 55} ${y + 7}" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>` +
      `${T(x + 78, y + 17, text, fs, NIGHT, { anchor: 'start' })}</g></g>`;
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
    s += `<g transform="translate(0 800)">${bandeau(2, 'PROCHAIN ÉPISODE :\n' + next, '')}</g>`;
    return s;
  }

  // a band of the frame showing another set (a split screen) : y0..y0+h, the set point (cx, cy) in its middle, zoom k
  function band(set, y0, h, cx, cy, k, ns, extra = '') { // extra : drawn on that set, in its coordinates
    const o = Object.assign({}, set[3] || {}, { ns });
    const L = window.LIGHTS ? LIGHTS.rig(set[0], set[1], set[2]) : { under: '', over: '' }; // its lights too (16/11, 19 h 32)
    return `<clipPath id="bd${ns}"><rect x="0" y="${y0}" width="1080" height="${h}"/></clipPath><g clip-path="url(#bd${ns})"><g transform="translate(540 ${y0 + h / 2}) scale(${k}) translate(${-cx} ${-cy})">${DECORS.scene(set[0], set[1], set[2], o)}${L.under}${extra}${L.over}</g></g>`;
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
    // v5 (owner, 16/11 on « Le manager », for the whole series : nobody pops in) : Nadia walks in, then speaks
    { t: '0:57', cap: 'Nadia arrive en marchant et découvre le clip (la scène du début)', set: KITCHEN, chars: [CH('nadia', 2, 760, 1856, 1250, 'colere', P.phone(580, 1130, '#ffe066'), { k: { walk: [[0.3, 700, 0], [2.1, 0, 0]] } }), LI(330, 1846, 1170, 'frime')],
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
    { t: '0:37', cap: 'Carton « Le lendemain · dans la rue » : Maya arrive en marchant et dit bonjour', set: STREET, setOver: closed, chars: [CH('maya', 1, 300, 1846, 1180, 'frime', P.phone(580, 1130), { k: { walk: [[0.5, -700, 0], [2.5, 0, 0]] } }), LI(760, 1846, 1200, 'panique')],
      over: () => carton('LE LENDEMAIN · DANS LA RUE') + tag('MAYA, LA VOISINE', 300, 560, -4).replace('class="tag"', 'class="tag" data-dl="2.55"') + sub(1, 'maya', 'Ils jouent, oui. Mais entre deux parties, ils scrollent.') },
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

  // ---------------- EP6 (« L'appli a fermé ») : our own screens, never a real app : no store logo, no Triller logo ----------------
  // a search in an app store : « Triller », no result (the fact : no longer on the App Store since August 2026)
  function storeSearch() {
    let s = `<rect width="560" height="1000" fill="${SNOW}"/>` + T(30, 84, 'Rechercher', 46, INK, { anchor: 'start' });
    s += `<rect x="24" y="116" width="400" height="66" rx="18" fill="#eef1f6"/><circle cx="62" cy="146" r="13" fill="none" stroke="#7a8091" stroke-width="5"/><path d="M 72 156 L 82 166" stroke="#7a8091" stroke-width="5" stroke-linecap="round"/>` +
      T(96, 160, 'Triller', 34, INK, { font: 'Rubik', weight: 700, anchor: 'start' }) + `<rect x="210" y="128" width="4" height="40" fill="${BLUE}"/>` + T(492, 160, 'Annuler', 28, BLUE, { font: 'Rubik', weight: 700 });
    s += `<circle cx="280" cy="420" r="62" fill="none" stroke="#c3cbd8" stroke-width="12"/><path d="M 324 466 L 370 512" stroke="#c3cbd8" stroke-width="14" stroke-linecap="round"/>`;
    return s + T(280, 600, 'Aucun résultat', 48, INK) + T(280, 650, 'pour « Triller »', 30, '#7a8091', { font: 'Rubik', weight: 700 });
  }
  // one of his old snippets : in the video it plays first (his mouth on the beat, the play head running), then at `freeze`
  // (seconds from the start of the shot ; < 0 : from its end) it freezes and goes grey, « Vidéo indisponible ». On the still
  // storyboard : the frozen picture only.
  function snippetFrozen(freeze = -1.05) {
    const g = 'gr' + (++UID), live = !!FRAME.ANIM;
    const scene = (rap) => `<g transform="translate(20 150) scale(1)">${takeScene('rue')}${liamBust('fierte', 260, 40, 700, '', rap)}</g>`;
    const frozen = `<rect width="560" height="1000" fill="#0b0d12"/><defs><filter id="${g}"><feColorMatrix type="saturate" values="0"/></filter></defs><g filter="url(#${g})" opacity="0.75">${scene(false)}</g>` +
      `<rect width="560" height="1000" fill="#0b0d12" opacity="0.35"/>`;
    const pause = `<g transform="translate(280 350)"><circle r="70" fill="#0b0d12" opacity="0.7"/><rect x="-24" y="-30" width="16" height="60" rx="5" fill="${SNOW}"/><rect x="8" y="-30" width="16" height="60" rx="5" fill="${SNOW}"/></g>`;
    const label = `<rect x="80" y="690" width="400" height="80" rx="22" fill="${SNOW}" stroke="${INK}" stroke-width="5"/>` + T(280, 744, 'Vidéo indisponible', 34, INK);
    if (!live) return frozen + pause + label;
    const bar = `<rect x="40" y="958" width="480" height="8" rx="4" fill="#ffffff" opacity="0.35"/>`;
    const play = `<g class="stk" data-ti="0" data-n="1"><rect width="560" height="1000" fill="#0b0d12"/>${scene(true)}</g>` + bar +
      K({ lin: [300, 0, 0, freeze] }, `<circle cx="40" cy="962" r="11" fill="${SNOW}" stroke="${INK}" stroke-width="3"/>`);
    return play + K({ in: freeze, fadein: [freeze, freeze + 0.3] }, frozen + bar + `<circle cx="340" cy="962" r="11" fill="#9aa3b5" stroke="${INK}" stroke-width="3"/>`) +
      K({ in: freeze, pop: 0.3 }, pause) + K({ in: freeze + 0.2, pop: 0.4 }, label);
  }
  // Stalak's camera, filming a take : the take number, the red dot, the count 3, 2, 1, the song playing.
  // rec (video only) : the time the camera starts recording ; before it the count 3, 2, 1, after it the red dot blinks and he raps
  function cameraScreen(n, count = '3', kind = 'terrain', rec = null) {
    const live = !!FRAME.ANIM && rec != null;
    let s = `<rect width="560" height="1000" fill="#0b0d12"/>` + (live ? `<g class="stk" data-ti="${rec}" data-n="1">` : '') +
      `<g transform="translate(-60 120) scale(1.31)">${takeScene(kind)}${liamBust('fierte', 260, 40, 700, '', live)}</g>` + (live ? '</g>' : '');
    s += `<rect width="560" height="92" fill="${BLUE}"/><circle cx="50" cy="47" r="31" fill="${INK}"/>${img('/site_src/icons/icon.svg', 22, 19, 56, 56)}${T(94, 63, 'Stalak', 42, SNOW, { anchor: 'start', stroke: INK, sw: 8 })}`;
    const dot = `<circle cx="440" cy="138" r="13" fill="#e5484d"/>`;
    s += `<g transform="rotate(-3 90 140)"><rect x="24" y="112" width="150" height="50" rx="12" fill="${TAKE_COL[(n - 1) % 4]}" stroke="${INK}" stroke-width="4"/>${T(99, 147, 'PRISE ' + n, 30, INK)}</g>` +
      (live ? `<circle cx="440" cy="138" r="13" fill="#5b6170"/>` + K({ in: rec, blink: [1.4, 0.6] }, dot) : dot) + T(464, 149, 'REC', 30, SNOW, { anchor: 'start', stroke: INK, sw: 5 });
    if (live) s += ['3', '2', '1'].map((c, i) => K({ in: i * rec / 3.2, out: (i + 1) * rec / 3.2, pop: 0.55, ks: 380, kd: 16 }, T(280, 560, c, 230, SNOW, { stroke: INK, sw: 18 }))).join('');
    else if (count) s += T(280, 560, count, 230, SNOW, { stroke: INK, sw: 18 });
    s += `<rect x="130" y="830" width="300" height="56" rx="28" fill="#0b0d12" opacity="0.6"/>` + T(280, 868, '♫ ton son', 30, SNOW, { font: 'Rubik', weight: 800 });
    s += `<circle cx="280" cy="940" r="44" fill="${SNOW}" stroke="${INK}" stroke-width="5"/>`;
    // the record button : a round red button, a red square once the camera records
    return s + (live ? K({ out: rec }, `<circle cx="280" cy="940" r="30" fill="#e5484d"/>`) + K({ in: rec, pop: 0.4 }, `<rect x="262" y="922" width="36" height="36" rx="8" fill="#e5484d"/>`) : `<circle cx="280" cy="940" r="30" fill="#e5484d"/>`);
  }
  // his clip in the feed, then the likes and a comment from someone he does not know (our own drawing, no TikTok logo)
  const courtClip = () => `<g transform="translate(-60 160) scale(1.31)">${takeScene('terrain-maya')}${liamBust('fierte', 260, 40, 700, '', false)}</g>`;
  const AFT = ['rue', 1, 'apres-midi'], COURT = ['terrain', 1, 'apres-midi'];
  const steps6 = (x) => `<path d="M ${x - 130} 1400 L ${x + 130} 1400 L ${x + 150} 1460 L ${x - 150} 1460 Z" fill="#b5b0a7" stroke="${INK}" stroke-width="4"/>`;
  ep('ep6', "TRILLER N'EST PLUS SUR L'APP STORE", 6, [
    { t: '0:00', cap: "L'accroche : « Triller », aucun résultat", set: AFT, criY: 700, chars: [CH('deuce', 1, 880, 1700, 900, 'frime'), CH('maya', 1, 230, 1700, 900, 'frime'), LI(540, 2650, 2100, 'panique')],
      // (16/11, planche contact : the phone held lower, beside him : nothing hides the face of who shouts, rule of the owner)
      over: () => bandeau(2, "TRILLER N'EST PLUS SUR L'APP STORE", 6) + FRAME.cri('liam', 'Ils ont fermé Triller ?!', 700) + `<g transform="translate(800 1330) scale(0.5) translate(-540 -790)">${phoneBig(storeSearch(), 1).replace(/<rect width="1080" height="1920" fill="#0a0d14" opacity="0.5"\/>/, '')}</g>` },
    // (the banner stays until the narrator's first sentence, rule « regle-bandeau-titre » : here, Liam speaks once more before him)
    { t: '0:02', cap: 'Liam baisse le téléphone, dépité', set: AFT, chars: [CH('deuce', 1, 880, 1700, 900, 'frime'), CH('maya', 1, 230, 1700, 900, 'frime'), LI(540, 1846, 1250, 'colere', P.phone(580, 1130))],
      over: () => bandeau(2, "TRILLER N'EST PLUS SUR L'APP STORE", 6).replace('class="bandeau"', 'class="bandeau" data-cont="1"') + sub(1, 'liam', 'Je faisais toutes mes vidéos de promotion de mes sons dessus… je suis deg.') },
    { t: '0:06', cap: 'Le narrateur présente Liam', set: AFT, chars: [CH('deuce', 1, 880, 1700, 900, 'frime'), CH('maya', 1, 230, 1700, 900, 'frime'), LI(540, 1846, 1250, 'colere', P.phone(580, 1130))],
      over: () => tag('LIAM, ALIAS T-CRAZY', 640, 600, 3) + sub(1, 'narrateur', "Voici Liam. 15 ans. Zéro abonné. Triller n'est plus disponible sur l'App Store, et c'est là qu'il faisait ses snippets.") },
    { t: '0:11', cap: 'Un ancien snippet se fige et devient gris', set: AFT, chars: [LI(540, 1846, 1250, 'colere', P.phone(606, 760), { pose: { raise: 'r' } })],
      over: () => phoneBig(snippetFrozen(-0.8), 0.92) + sub(1, 'narrateur', "Un snippet, c'est quelques secondes de son son, filmées en playback, pour donner envie sur TikTok et Insta.") },
    { t: '0:17', cap: 'Retour dans la rue : Deuce et Maya', set: AFT, chars: [CH('deuce', 1, 540, 1846, 1200, 'frime'), CH('maya', 1, 870, 1846, 1150, 'frime'), LI(220, 1846, 1150, 'panique')],
      over: () => tag('DEUCE, SON POTE', 540, 470, -3) + tag('MAYA, LA VOISINE', 860, 600, 3) + sub(1, 'liam', 'Sans Triller, je fais comment ? Je monte tout à la main ?') },
    { t: '0:21', cap: 'Deuce', set: AFT, chars: [CH('deuce', 1, 540, 1846, 1200, 'fierte'), CH('maya', 1, 870, 1846, 1150, 'frime'), LI(220, 1846, 1150, 'colere')],
      over: () => sub(1, 'deuce', "La dernière fois que t'as monté à la main, t'as mis six heures.") },
    { t: '0:24', cap: 'Maya', set: AFT, chars: [CH('deuce', 1, 540, 1846, 1200, 'frime'), CH('maya', 1, 870, 1846, 1150, 'fierte', P.phone(580, 1130)), LI(220, 1846, 1150, 'colere')],
      over: () => sub(1, 'maya', "Prends Stalak. C'est fait pour ça.") },
    { t: '0:27', cap: 'Maya lui montre Stalak, dessiné', set: AFT, chars: [CH('maya', 1, 800, 1846, 1200, 'frime', P.phone(580, 1130)), LI(300, 1846, 1200, 'panique')],
      over: () => phoneBig(stalakApp({ takes: [['rue', 'fierte'], ['rue', 'frime'], ['rue', 'colere']], count: 3, ti: -1 }), 0.92) + sub(1, 'liam', "C'est quoi, Stalak ?") },
    { t: '0:33', cap: 'Rien à installer : stalak.app', set: AFT, chars: [CH('maya', 1, 800, 1846, 1200, 'fierte', P.phone(580, 1130)), LI(300, 1846, 1200, 'frime')],
      over: () => sub(1, 'maya', 'Même pas. Tu vas sur stalak.app.') },
    { t: '0:38', cap: 'Carton : le terrain · Deuce filme Liam', set: COURT, chars: [CH('deuce', 1, 820, 1846, 1200, 'fierte', P.phoneBack(580, 1130)), LI(300, 1846, 1200, 'fierte')],
      over: () => carton('CINQ MINUTES PLUS TARD · LE TERRAIN DE BASKET', 230) + sub(1, 'deuce', 'Silence, on tourne ! Prise 1 !') },
    // the video (16/11, storyboard validated) : the camera counts 3, 2, 1 then records ; Liam raps on the music in the takes
    // (rap : his mouth on the beat) ; Maya walks into take 2 before she speaks
    { t: '0:42', cap: 'Prise 1 : la caméra de Stalak, 3, 2, 1', set: COURT, chars: [CH('deuce', 1, 540, 1846, 1250, 'frime', P.phoneBack(580, 1130))],
      over: () => phoneBig(cameraScreen(1, '3', 'terrain', 1.35), 0.92) + sub(1, 'narrateur', 'Deuce filme. Le son passe dans le téléphone, et Liam rappe dessus en playback.') },
    { t: '0:48', cap: 'Prise 2 : Maya arrive en marchant', set: COURT, rap: 'liam', rapFrom: 0.2, chars: [CH('maya', 1, 760, 1846, 1180, 'fierte', '', { k: { walk: [[0.2, 700, 0], [2.0, 0, 0]] } }), LI(330, 1846, 1200, 'fierte')],
      over: () => clap(820, 330, 2) + sub(1, 'maya', 'Attends, je veux être dans le clip !') },
    { t: '0:54', cap: 'Prise 3 : Liam seul, de plus près', set: COURT, rap: 'liam', rapFrom: 0.15, zoom: [540, 1150, 1.3], chars: [LI(540, 2730, 2250, 'fierte')],
      over: () => clap(820, 330, 3) + sub(1, 'deuce', 'Prise 3… C\'est dans la boîte !') },
    // the takes go into Stalak (2.2 s), then the clip plays cut on the beat ; the mascot's sticker
    { t: '0:58', cap: 'Stalak monte le clip sur le temps', set: COURT, chars: [CH('deuce', 1, 820, 1846, 1150, 'fierte'), CH('maya', 1, 260, 1846, 1100, 'fierte'), LI(540, 1846, 1200, 'fierte', P.phone(606, 760), { pose: { raise: 'r' } })],
      over: () => phoneBig(stalakApp({ takes: [['terrain', 'fierte'], ['terrain-maya', 'frime'], ['terrain', 'colere']], count: 3, ti: 2.2, sticker: 'hype', dl: 2.7, wm: true, word: 'prises' }), 0.92) + sub(1, 'liam', 'On dirait un vrai clip !') },
    // he posts it (« Publier », « Vidéo publiée ! »), Maya then Deuce like it, then the comment of someone he does not know
    { t: '1:06', cap: 'Il publie : des cœurs et un inconnu', set: COURT, chars: [LI(540, 1846, 1250, 'fierte', P.phone(606, 760), { pose: { raise: 'r' } })],
      over: () => phoneBig(FRAME.ANIM ? publish({ at: 0.8, pic: courtClip(), feed: { user: 't.crazy', caption: 'Mon nouveau son, filmé au terrain', sound: 'T-Crazy · son original', likes: 2, comments: 1, shares: 0 },
        after: K({ in: 1.6, out: 2.45, path: [[1.6, 0, -150], [1.85, 0, 0], [2.2, 0, 0], [2.45, 0, -150]] }, notifTop('maya', 'a aimé ta vidéo', '#c94f84')) +
          K({ in: 2.2, out: 3.05, path: [[2.2, 0, -150], [2.45, 0, 0], [2.8, 0, 0], [3.05, 0, -150]] }, notifTop('deuce', 'a aimé ta vidéo', '#23845a')) +
          K({ in: 2.9, path: [[2.9, 0, 470], [3.25, 0, 0]] }, comments('neo.beats', "Le son est lourd, c'est quand la sortie ?", '#7d55c7')) })
        : feed(courtClip(), { likes: 2, comments: 1, shares: 0, user: 't.crazy', caption: 'Mon nouveau son, filmé au terrain', sound: 'T-Crazy · son original' }) + notifTop('deuce', 'a aimé ta vidéo', '#23845a') + comments('neo.beats', "Le son est lourd, c'est quand la sortie ?", '#7d55c7'), 0.92) + sub(1, 'liam', 'Quelqu\'un que je connais pas a commenté !') },
    { t: '1:11', cap: 'Liam parle à celui qui regarde', set: COURT, zoom: [540, 1150, 1.3], chars: [LI(540, 2730, 2250, 'frime', P.phone(606, 760), { pose: { raise: 'r' } })],
      over: () => sub(1, 'liam', "T'avais Triller, toi aussi ? Ton son, trois prises au téléphone, et Stalak fait le montage sur le rythme. Rien à installer.") },
    { t: '1:19', cap: 'Carte de fin (prochain épisode à choisir)', plain: true, over: () => endCard('…') },
  ], "L'après-midi, lumières réalistes, Triller nommé sans logo.");

  // ================= 17/11 : 3 episodes a day (owner, 17/11 at 3 h 57). The 6 validated episodes keep 1 to 6 (his answer at
  // 5 h), the 9 new ones are 7 to 15, in their release order ; each end card names the video that comes out right after.
  // Only the chosen sets : the street of houses (also at night), the kitchen, the court, the room, the furnished roof.
  // The print of Deuce's merch : Liam's face in a blue disc, « T-CRAZY » under it (our own design) ; in the tee's own coordinates
  function teePrint() {
    const id = 'tp' + (++UID);
    return `<circle cx="0" cy="-18" r="64" fill="${BLUE}" stroke="${INK}" stroke-width="5"/><clipPath id="${id}"><circle cx="0" cy="-18" r="61"/></clipPath><g clip-path="url(#${id})">${headAt('frime', 0, 6, 0.3, '', false)}</g>` + T(0, 100, 'T-CRAZY', 44, INK);
  }
  // a white tee-shirt with that print ; cx, cy : its centre, w : its width
  function tshirt(cx, cy, w = 300, r = 0) {
    return `<g transform="translate(${cx} ${cy}) rotate(${r}) scale(${(w / 300).toFixed(3)})"><path d="M -70 -150 C -40 -126 40 -126 70 -150 L 152 -108 L 126 -36 L 92 -50 L 92 160 L -92 160 L -92 -50 L -126 -36 L -152 -108 Z" fill="#fbfcff" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>` +
      `<path d="M -70 -150 C -44 -114 44 -114 70 -150" fill="none" stroke="${INK}" stroke-width="6"/><path d="M 40 -120 L 40 150" stroke="#e4ebf4" stroke-width="22" opacity="0.8"/>${teePrint()}</g>`;
  }
  // a folded tee-shirt, seen from the front on a pile : x the middle, y the top, w the width
  const foldedTee = (x, y, w = 120) => `<rect x="${x - w / 2}" y="${y}" width="${w}" height="${(w * 0.28).toFixed(1)}" rx="${(w * 0.06).toFixed(1)}" fill="#fbfcff" stroke="${INK}" stroke-width="${w > 90 ? 4 : 2.5}"/>` +
    `<path d="M ${x - w * 0.16} ${y} q ${w * 0.16} ${w * 0.11} ${w * 0.32} 0" fill="none" stroke="${INK}" stroke-width="${w > 90 ? 3 : 2}"/><circle cx="${x}" cy="${(y + w * 0.15).toFixed(1)}" r="${(w * 0.08).toFixed(1)}" fill="${BLUE}" stroke="${INK}" stroke-width="2"/>`;
  // Deuce's stall, in the coordinates of whoever stands behind it (front figure : hands near y 1170, feet 1732) : a folding
  // table, piles of folded tees, the box they came in, a cardboard sign
  function merchTable(o = {}) {
    let s = `<path d="M -40 1224 L 30 1732 M 30 1224 L -40 1732 M 900 1224 L 970 1732 M 970 1224 L 900 1732" stroke="${INK}" stroke-width="16" stroke-linecap="round"/><path d="M -40 1224 L 30 1732 M 30 1224 L -40 1732 M 900 1224 L 970 1732 M 970 1224 L 900 1732" stroke="#8a919c" stroke-width="7" stroke-linecap="round"/>`;
    s += `<rect x="-90" y="1188" width="1080" height="40" rx="10" fill="#d9dde4" stroke="${INK}" stroke-width="8"/><rect x="-80" y="1222" width="1060" height="10" fill="#a9b0bb"/>`;
    [[60, 5], [230, 6], [400, 4]].forEach(([x, n]) => { for (let i = 0; i < n; i++) s += foldedTee(x + (i % 2) * 6, 1188 - (i + 1) * 44, 156); });
    // the box, full, a tee hanging out
    s += `<path d="M 560 1188 L 590 1010 L 900 1010 L 930 1188 Z" fill="#c9965e" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/><path d="M 590 1010 L 540 940 L 760 940 L 745 1010 M 900 1010 L 960 950 L 760 940" fill="#d9a86e" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>` +
      `<g transform="rotate(-8 700 1000)">${foldedTee(700, 985, 180)}</g>` + T(745, 1130, 'T-CRAZY', 50, INK) + `<path d="M 640 1150 L 850 1150" stroke="${INK}" stroke-width="5"/>`;
    // the sign taped on the front of the table
    if (!o.nosign) s += `<g transform="rotate(-4 300 1330)"><rect x="140" y="1250" width="330" height="150" rx="8" fill="#d9a86e" stroke="${INK}" stroke-width="7"/>${T(305, 1314, 'T-SHIRTS', 54, INK)}${T(305, 1376, 'T-CRAZY', 54, BLUE)}<path d="M 160 1250 L 200 1236 M 440 1250 L 470 1236" stroke="#e8e1c8" stroke-width="16"/></g>`;
    return s;
  }
  // dead leaves on the sidewalk (in the set's coordinates) : the street is empty, the time is long
  const leaves = (pts) => pts.map(([x, y, r]) => `<g transform="translate(${x} ${y}) rotate(${r})"><path d="M -26 0 C -16 -18 16 -18 26 0 C 16 18 -16 18 -26 0 Z" fill="#c4813a" stroke="${INK}" stroke-width="4"/><path d="M -26 0 L 30 0" stroke="${INK}" stroke-width="3"/></g>`).join('');
  // moths around a lamp ; k : their size
  const moths = (cx, cy, k = 1) => [[-60, -10, 20], [40, -40, -30], [70, 30, 50], [-30, 50, -60], [10, -70, 10], [-80, 40, 80]].map(([dx, dy, r]) =>
    `<g transform="translate(${cx + dx * k} ${cy + dy * k}) rotate(${r}) scale(${k})"><path d="M 0 0 C -10 -14 -24 -10 -20 2 C -16 10 -6 8 0 0 C 6 8 16 10 20 2 C 24 -10 10 -14 0 0 Z" fill="#e9dcc0" stroke="${INK}" stroke-width="3"/><path d="M 0 -6 L 0 8" stroke="${INK}" stroke-width="4" stroke-linecap="round"/></g>`).join('');
  // a phone on a selfie stick, held up (in the coordinates of whoever holds it : the hand near 580, 1170)
  const selfieStick = () => `<path d="M 586 1160 L 760 560" stroke="${INK}" stroke-width="16" stroke-linecap="round"/><path d="M 586 1160 L 760 560" stroke="#6b7180" stroke-width="7" stroke-linecap="round"/><g transform="translate(772 512) rotate(16) scale(1.5)">${P.phoneBack(0, 0)}</g>`;
  // the lock screen of Liam's phone : the time, big, and his own reminder
  function lockScreen(time, date) {
    const g = 'ls' + (++UID);
    let s = `<defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#121a44"/><stop offset="1" stop-color="#5a3d8f"/></linearGradient></defs><rect width="560" height="1000" fill="url(#${g})"/>`;
    s += T(280, 118, date, 30, ICE, { font: 'Rubik', weight: 700 }) + T(280, 300, time, 170, SNOW, { font: 'Rubik', weight: 800 });
    return s + `<g transform="translate(16 380)"><rect width="528" height="112" rx="26" fill="${SNOW}" opacity="0.92" stroke="${INK}" stroke-width="5"/><circle cx="58" cy="56" r="34" fill="#ffd34d" stroke="${INK}" stroke-width="3"/>${T(58, 70, '!', 38, INK)}` +
      `${T(108, 48, 'Rappel', 26, '#7a8091', { font: 'Rubik', weight: 700, anchor: 'start' })}${T(108, 88, 'Tourner le clip après les cours', 27, INK, { font: 'Rubik', weight: 800, anchor: 'start' })}</g>`;
  }
  // the camera of a phone (not Stalak : before Stalak comes), filming a take : the picture, REC, the take number
  function camScreen(kind, n, expr = 'fierte') {
    let s = `<rect width="560" height="1000" fill="#0b0d12"/><g transform="translate(-60 120) scale(1.31)">${takeScene(kind)}${liamBust(expr, 260, 40, 700, takeProps(kind), false)}${takeOver(kind)}</g>`;
    s += `<rect width="560" height="96" fill="#0b0d12" opacity="0.6"/><circle cx="214" cy="50" r="12" fill="#e5484d"/>` + T(298, 61, '00:04', 32, SNOW, { font: 'Rubik', weight: 800 });
    s += `<g transform="rotate(-3 90 160)"><rect x="24" y="132" width="150" height="50" rx="12" fill="${TAKE_COL[(n - 1) % 4]}" stroke="${INK}" stroke-width="4"/>${T(99, 167, 'PRISE ' + n, 30, INK)}</g>`;
    return s + `<circle cx="280" cy="930" r="46" fill="none" stroke="${SNOW}" stroke-width="7"/><rect x="262" y="912" width="36" height="36" rx="8" fill="#e5484d"/>`;
  }
  const noDim = (svg) => svg.replace(/<rect width="1080" height="1920" fill="#0a0d14" opacity="0.5"\/>/, '');
  const smallPhone = (inner, x = 800, y = 1330) => `<g transform="translate(${x} ${y}) scale(0.5) translate(-540 -790)">${noDim(phoneBig(inner, 1))}</g>`;
  const clipPic = (kind, expr = 'fierte', o = {}) => { const id = 'cpb' + (++UID); return (o.bw ? `<filter id="${id}"><feColorMatrix type="saturate" values="0"/></filter><g filter="url(#${id})">` : '<g>') + `<g transform="translate(-60 160) scale(1.31)">${takeScene(kind)}${liamBust(expr, 260, 40, 700, takeProps(kind), false)}${takeOver(kind)}</g></g>` +
    (o.lyric ? o.lyric.split('\n').map((l, i, a) => T(236, 470 - (a.length - 1 - i) * 38, l, 30, SNOW, { font: 'Rubik', weight: 900, stroke: INK, sw: 9 })).join('') : ''); }; // clear of the feed's buttons on the right
  // a post : in the video, step by step (« Publier », « Vidéo publiée ! ») then the comment ; on the still, the feed and the comment
  const posted = (pic, caption, who, text, col, likes = 1) => FRAME.ANIM ? publish({ at: 0.8, pic, feed: { user: 't.crazy', caption, sound: 'T-Crazy · son original', likes, comments: 1, shares: 0 },
    after: K({ in: 1.9, path: [[1.9, 0, 470], [2.25, 0, 0]] }, comments(who, text, col)) }) : feed(pic, { likes, comments: 1, shares: 0, user: 't.crazy', caption, sound: 'T-Crazy · son original' }) + comments(who, text, col);
  const RUE = ['rue', 1, 'apres-midi'], RUE_EVE = ['rue', 1, 'coucher'], RUE_NIGHT = ['rue', 1, 'nuit'];

  // ---------------- épisode 7 (18/11, 18 h) : « Les tee-shirts » ----------------
  const E7 = `SON POTE A IMPRIMÉ DES${NB}TEE-SHIRTS AVEC SA TÊTE`; // 19/11 (check_lines.py) : not « … IMPRIMÉ DES / TEE-SHIRTS… »
  const TEE = (x = 450, y = 1190, w = 380, r = 0) => tshirt(x, y, w, r);
  ep('ep7', E7, 7, [
    { t: '0:00', cap: "L'accroche : M. Reyes brandit un tee-shirt", set: RUE, criY: 700, chars: [CH('deuce', 1, 860, 1700, 900, 'fierte', merchTable()), LI(210, 1700, 900, 'fierte'), CH('reyes', 1, 540, 2450, 1800, 'colere', TEE())],
      over: () => bandeau(2, E7, 7) + FRAME.cri('reyes', `Cinquante tee-shirts avec ta tête${NB}?!`, 700) },
    { t: '0:02', cap: 'Liam ajuste sa casquette, très fier', set: RUE, chars: [CH('deuce', 1, 840, 1740, 1000, 'frime', merchTable()), CH('reyes', 1, 190, 1856, 1150, 'colere', TEE(450, 1190, 330)), LI(560, 1846, 1250, 'fierte')],
      over: () => bandeau(2, E7, 7).replace('class="bandeau"', 'class="bandeau" data-cont="1"') + sub(1, 'liam', "C'est ma collection. Le merch, c'est là qu'est l'argent.") },
    { t: '0:05', cap: 'Le narrateur présente Liam et Deuce', set: RUE, chars: [CH('deuce', 1, 840, 1740, 1000, 'frime', merchTable()), CH('reyes', 1, 190, 1856, 1150, 'frime', TEE(450, 1190, 330)), LI(560, 1846, 1250, 'frime')],
      over: () => tag('LIAM, ALIAS T-CRAZY', 560, 520, -3) + tag('DEUCE, SON POTE', 860, 690, 3) + tag("M. REYES, L'ÉPICIER", 230, 620, -3) + sub(1, 'narrateur', 'Voici Liam. 15 ans. Zéro abonné. Et voici Deuce, son pote. Ce matin, il a imprimé cinquante tee-shirts avec la tête de Liam.') },
    { t: '0:13', cap: 'Deuce étale les tee-shirts, sûr de lui', set: RUE, chars: [CH('deuce', 1, 560, 1760, 1060, 'fierte', merchTable()), LI(170, 1846, 1150, 'frime'), CH('reyes', 1, 920, 1856, 1150, 'colere', TEE(450, 1190, 330))],
      over: () => sub(1, 'deuce', 'Les grands rappeurs vendent des tee-shirts. Donc on vend des tee-shirts. C\'est du business.') },
    { t: '0:18', cap: 'M. Reyes rend le tee-shirt et rentre', set: RUE, chars: [CH('deuce', 1, 500, 1760, 1060, 'panique', merchTable()), LI(150, 1846, 1150, 'panique'), CH('reyes', 1, 955, 1856, 1150, 'colere', '', { k: { walk: [[0.6, 0, 0], [1.8, 120, -30]] } })],
      over: () => sub(1, 'reyes', 'Pas devant ma vitrine.') },
    { t: '0:21', cap: 'Deux heures plus tard : rien de vendu', set: RUE_EVE, front: () => leaves([[620, 1560, 20], [760, 1600, -30], [900, 1540, 60]]), chars: [CH('deuce', 1, 330, 1760, 1060, 'panique', merchTable()), LI(820, 1846, 1150, 'colere')],
      over: () => carton('DEUX HEURES PLUS TARD · LA RUE') + sub(1, 'narrateur', 'Deux heures plus tard : zéro tee-shirt vendu.') },
    { t: '0:25', cap: 'Maya arrive en marchant et dit bonjour', set: RUE_EVE, chars: [CH('deuce', 1, 330, 1760, 1060, 'frime', merchTable()), CH('maya', 1, 860, 1846, 1150, 'frime', P.phone(580, 1130), { k: { walk: [[0.2, 640, 0], [2.0, 0, 0]] } }), LI(600, 1846, 1180, 'fierte')],
      over: () => tag('MAYA, LA VOISINE', 860, 600, 3) + sub(1, 'maya', 'Salut. Vous vendez les tee-shirts de qui ?') },
    { t: '0:31', cap: 'Liam, vexé ; Deuce a une idée', set: RUE_EVE, chars: [CH('deuce', 1, 330, 1760, 1060, 'fierte', merchTable()), CH('maya', 1, 860, 1846, 1150, 'frime', P.phone(580, 1130)), LI(600, 1846, 1180, 'colere')],
      over: () => sub(1, 'deuce', "Les gens savent pas qui t'es ? Solution : cent tee-shirts de plus.") },
    { t: '0:37', cap: 'Maya, appuyée au coffre à glaçons', set: RUE_EVE, chars: [CH('deuce', 1, 230, 1760, 1060, 'panique', merchTable()), LI(470, 1846, 1180, 'panique'), CH('maya', 1, 800, 1846, 1150, 'frime', P.phone(580, 1130))],
      over: () => sub(1, 'maya', "Les gens achètent le tee-shirt d'un son qu'ils connaissent. Ton son, tu l'as jamais posté.") },
    { t: '0:45', cap: 'Maya lui montre Stalak, dessiné', set: RUE_EVE, chars: [CH('maya', 1, 800, 1846, 1200, 'frime', P.phone(580, 1130)), LI(300, 1846, 1200, 'panique')],
      over: () => phoneBig(stalakApp({ takes: [['tshirts', 'fierte'], ['tshirts-deuce', 'frime'], ['tshirts', 'colere']], count: 3, ti: -1 }), 0.92) + sub(1, 'maya', 'Prends Stalak. Tu te filmes trois fois sur ton son, et Stalak monte sur le rythme.') },
    { t: '0:54', cap: 'Les prises : Deuce danse derrière', set: RUE_EVE, rap: 'liam', rapFrom: 0.2, chars: [CH('deuce', 1, 760, 1760, 1060, 'fierte', merchTable({ nosign: true }) + TEE(600, 1060, 300, -14)), LI(420, 1846, 1220, 'fierte')],
      over: () => clap(840, 330, 2) },
    { t: '0:57', cap: 'Stalak monte le clip sur le temps', set: RUE_EVE, chars: [CH('maya', 1, 830, 1846, 1150, 'fierte'), CH('deuce', 1, 250, 1846, 1100, 'fierte'), LI(540, 1846, 1200, 'fierte', P.phone(606, 760), { pose: { raise: 'r' } })],
      over: () => phoneBig(stalakApp({ takes: [['tshirts', 'fierte'], ['tshirts-deuce', 'frime'], ['tshirts', 'colere']], count: 3, ti: 2.2, sticker: 'hype', dl: 2.7, wm: true, word: 'prises' }), 0.92) + sub(1, 'narrateur', 'Stalak monte les trois prises sur le rythme. Et Liam poste son son pour la première fois.') },
    { t: '1:01', cap: 'Il publie : un inconnu veut le tee-shirt', set: RUE_EVE, chars: [LI(540, 1846, 1250, 'fierte', P.phone(606, 760), { pose: { raise: 'r' } })],
      over: () => phoneBig(posted(clipPic('tshirts-deuce'), 'Mon son, enfin posté', 'kenzo.prod', 'Le son est lourd. Il est où, le tee-shirt ?', '#7d55c7', 2), 0.92) + sub(1, 'deuce', "Quelqu'un veut un tee-shirt ! Je l'avais dit !") },
    { t: '1:06', cap: 'Liam parle à celui qui regarde', set: RUE_EVE, zoom: [540, 1150, 1.3], chars: [LI(540, 2730, 2250, 'frime')],
      over: () => sub(1, 'liam', "Ton son, personne l'a encore entendu ? Filme trois prises, et Stalak monte sur le rythme. Les tee-shirts, après.") },
    // 18/11 : with the Chef's new schedule, the episode 2 comes right after this one (owner, 18/11 : « Oui, refais-la »)
    { t: '1:13', cap: 'La carte de fin (le prochain à sortir : l\'épisode 2, le 20/11 à 12 h 30)', plain: true, over: () => endCard('IL A PASSÉ LA NUIT SUR SA VIDÉO DE PROMO') },
  ], "Sort le 19/11 à 21 h. La rue pavillonnaire l'après-midi, puis au coucher du soleil.");

  // ---------------- épisode 8 (18/11, 21 h) : « Nuit à 17 h » ----------------
  const E8 = `IL FAIT NUIT À 17${NB}H ET IL${NB}DEVAIT TOURNER SON CLIP`; // « 17 H » never cut in two ; 19/11 : not « … ET IL / DEVAIT… »
  const torch = (x, y, tx, ty) => { const g = 'tc' + (++UID), b = 'tb' + (++UID);
    return `<defs><radialGradient id="${g}"><stop offset="0" stop-color="#ffffff" stop-opacity="0.95"/><stop offset="0.25" stop-color="#f4f8ff" stop-opacity="0.55"/><stop offset="1" stop-color="#f4f8ff" stop-opacity="0"/></radialGradient>` +
      `<linearGradient id="${b}" x1="${x}" y1="${y}" x2="${tx}" y2="${ty}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffffff" stop-opacity="0.5"/><stop offset="1" stop-color="#ffffff" stop-opacity="0.12"/></linearGradient></defs>` +
      `<g style="mix-blend-mode:screen"><path d="M ${x} ${y - 14} L ${tx - 60} ${ty - 300} L ${tx - 120} ${ty + 380} L ${x} ${y + 14} Z" fill="url(#${b})"/><circle cx="${x}" cy="${y}" r="300" fill="url(#${g})"/><circle cx="${tx}" cy="${ty}" r="230" fill="url(#${g})" opacity="0.8"/><circle cx="${x}" cy="${y}" r="26" fill="#ffffff"/></g>` +
      (window.LIGHTS ? LIGHTS.glint(x, y, 60, {}) : ''); };
  ep('ep8', E8, 8, [
    { t: '0:00', cap: "L'accroche : 17 h 02, et il fait déjà nuit", set: RUE_NIGHT, criY: 700, chars: [CH('deuce', 1, 880, 1700, 900, 'frime', selfieStick()), LI(540, 2650, 2100, 'panique')],
      over: () => bandeau(2, E8, 8) + FRAME.cri('liam', `Il est 17${NB}h et il fait déjà nuit${NB}?!`, 700) + smallPhone(lockScreen('17:02', 'mercredi 18 novembre')) },
    { t: '0:02', cap: "Liam, dégoûté, montre l'heure", set: RUE_NIGHT, chars: [CH('deuce', 1, 860, 1760, 1050, 'frime', selfieStick()), LI(470, 1846, 1250, 'colere', P.phone(606, 760), { pose: { raise: 'r' } })],
      over: () => bandeau(2, E8, 8).replace('class="bandeau"', 'class="bandeau" data-cont="1"') + sub(1, 'liam', 'Je devais tourner mon clip après les cours !') },
    { t: '0:05', cap: 'Le narrateur présente Liam et Deuce', set: RUE_NIGHT, chars: [CH('deuce', 1, 860, 1760, 1050, 'frime', selfieStick()), LI(470, 1846, 1250, 'colere')],
      over: () => tag('LIAM, ALIAS T-CRAZY', 470, 520, -3) + tag('DEUCE, SON POTE', 860, 660, 3) + sub(1, 'narrateur', 'Voici Liam. 15 ans. Zéro abonné. Et Deuce, son pote. En novembre, le soleil se couche vers cinq heures. Et Liam sort des cours à cinq heures.') },
    { t: '0:12', cap: 'La lampe du téléphone : Liam ébloui', set: RUE_NIGHT, chars: [CH('deuce', 1, 820, 1846, 1200, 'fierte', P.phone(580, 1130, '#ffffff')), LI(300, 1846, 1200, 'colere')],
      over: () => torch(945, 1268, 300, 806) + sub(1, 'deuce', "Pas de soleil ? Pas de problème. J'ai la lampe de mon téléphone.") },
    { t: '0:17', cap: 'Prise 1 : tout blanc, fond tout noir', set: RUE_NIGHT, chars: [CH('deuce', 1, 540, 1846, 1250, 'frime', P.phoneBack(580, 1130))],
      over: () => phoneBig(camScreen('lampe', 1), 0.92) + sub(1, 'deuce', 'Prise 1… On dirait un interrogatoire.') },
    { t: '0:22', cap: 'Prise 2 : orange sous le lampadaire', set: RUE_NIGHT, rap: 'liam', rapFrom: 0.2, front: () => moths(263, 560, 1.4), chars: [CH('deuce', 1, 840, 1846, 1150, 'frime', P.phoneBack(580, 1130)), LI(290, 1846, 1200, 'fierte', '', { sodium: true })],
      over: () => `<rect x="80" y="560" width="420" height="1300" fill="#ff8a2a" opacity="0.14" style="mix-blend-mode:multiply"/>` + clap(820, 330, 2) + sub(1, 'narrateur', 'Prise 2, sous le lampadaire. Liam est tout orange, et les papillons de nuit adorent son son.') },
    { t: '0:28', cap: 'Maya arrive en marchant et dit bonsoir', set: RUE_NIGHT, front: () => moths(263, 560, 1.4), chars: [CH('maya', 1, 830, 1846, 1150, 'frime', P.phone(580, 1130), { k: { walk: [[0.2, 640, 0], [2.0, 0, 0]] } }), LI(290, 1846, 1200, 'frime', '', { sodium: true })],
      over: () => `<rect x="80" y="560" width="420" height="1300" fill="#ff8a2a" opacity="0.14" style="mix-blend-mode:multiply"/>` + tag('MAYA, LA VOISINE', 830, 600, 3) + sub(1, 'maya', 'Bonsoir. Pourquoi t\'es orange ?') },
    { t: '0:33', cap: 'Maya montre la vitrine de l\'épicerie', set: RUE_NIGHT, chars: [CH('maya', 1, 360, 1846, 1150, 'fierte', P.phone(580, 1130)), LI(760, 1846, 1200, 'frime')],
      over: () => sub(1, 'maya', 'Mets-toi devant la vitrine. Là, la lumière est belle.') },
    { t: '0:37', cap: 'Prise 3, devant la vitrine ; M. Reyes ouvre sa porte', set: RUE_NIGHT, rap: 'liam', rapFrom: 0.2, chars: [LI(640, 1846, 1200, 'fierte'), CH('reyes', 1, 960, 1856, 1150, 'colere')],
      over: () => clap(250, 330, 3) + tag("M. REYES, L'ÉPICIER", 900, 640, 3) + sub(1, 'reyes', 'Bonsoir. Devant ma vitrine, c\'est un chewing-gum minimum.') },
    { t: '0:43', cap: 'Stalak et le filtre Noir & blanc', set: RUE_NIGHT, chars: [CH('maya', 1, 820, 1846, 1150, 'fierte', P.phone(580, 1130)), CH('deuce', 1, 220, 1846, 1150, 'frime'), LI(520, 1846, 1200, 'frime')],
      over: () => phoneBig(stalakApp({ takes: [['lampe', 'colere'], ['lampadaire', 'fierte'], ['vitrine', 'frime']], count: 3, ti: -1, word: 'prises', rows: [['Coupes', ['Auto', 'Sur les mots', 'Par mesure'], 0], ['Rythme', ['Posé', 'Normal', 'Nerveux'], 1], ['Filtre', ['Aucun', 'Givre', 'Film 35 mm', 'Noir & blanc'], 3]] }), 0.92) + sub(1, 'maya', 'Mets tes trois prises dans Stalak : il les coupe sur le rythme. Et prends le filtre Noir & blanc.') },
    { t: '0:52', cap: 'Le clip en noir et blanc, coupé sur le temps', set: RUE_NIGHT, chars: [CH('maya', 1, 830, 1846, 1150, 'fierte'), CH('deuce', 1, 250, 1846, 1100, 'fierte'), LI(540, 1846, 1200, 'fierte', P.phone(606, 760), { pose: { raise: 'r' } })],
      over: () => phoneBig(stalakApp({ takes: [['lampe', 'colere'], ['lampadaire', 'fierte'], ['vitrine', 'frime']], count: 3, ti: 0, sticker: 'cool', dl: 0.8, wm: true, word: 'prises', bw: true, rows: [['Coupes', ['Auto', 'Sur les mots', 'Par mesure'], 0], ['Rythme', ['Posé', 'Normal', 'Nerveux'], 1], ['Filtre', ['Aucun', 'Givre', 'Film 35 mm', 'Noir & blanc'], 3]] }), 0.92) + sub(1, 'narrateur', 'En noir et blanc, la lampe, le lampadaire et la vitrine vont ensemble. Ça devient un style.') },
    { t: '0:59', cap: 'Il publie : « L\'ambiance de nuit »', set: RUE_NIGHT, chars: [CH('maya', 1, 860, 1846, 1100, 'frime'), LI(470, 1846, 1250, 'fierte', P.phone(606, 760), { pose: { raise: 'r' } })],
      over: () => phoneBig(posted(clipPic('vitrine', 'fierte', { bw: true }), 'Clip de nuit', 'yasmine.wav', "L'ambiance de nuit 🔥", '#c94f84', 3), 0.92) + sub(1, 'liam', 'Le clip de nuit, c\'était voulu.') },
    { t: '1:04', cap: 'Liam parle à celui qui regarde', set: RUE_NIGHT, zoom: [400, 1150, 1.3], chars: [LI(330, 2730, 2250, 'frime')],
      over: () => sub(1, 'liam', 'Toi aussi, il fait nuit après les cours ? Filme sous la lumière que t\'as. Stalak coupe sur le rythme, et le noir et blanc est gratuit.') },
    // 18/11 : the Chef's new schedule puts « L'extrait de 3 h du matin » right after this one (owner, 18/11 : « Oui, refais-la »)
    { t: '1:12', cap: 'La carte de fin (le prochain à sortir : « L\'extrait de 3 h du matin »)', plain: true, over: () => endCard("SON EXTRAIT A MARCHÉ, MAIS LE SON N'EST PAS FINI") },
  ], 'Sort le 21/11 à 21 h. Ta rue pavillonnaire à la tombée de la nuit (la rue en ville n\'a pas été choisie).');

  // ---------------- épisode 9 (19/11, 21 h) : « Le cahier de rap » ----------------
  const E9 = 'SA MÈRE A LU SES TEXTES DE RAP', KITCHEN_N = ['cuisine', 1, 'nuit'];
  const LYRICS = ['Ma daronne rentre à six heures,', 'les yeux fatigués.', 'Elle a sauvé des vies,', "moi j'ai sauvé un couplet."];
  // Liam's notebook of lyrics, open (its own lines and blue handwriting) ; cx, cy its centre, w its width
  function notebook(cx, cy, w = 300, r = 0) {
    let s = `<g transform="translate(${cx} ${cy}) rotate(${r}) scale(${(w / 300).toFixed(3)})"><rect x="-150" y="-104" width="300" height="208" rx="10" fill="#fdfbf4" stroke="${INK}" stroke-width="6"/>`;
    for (let i = 0; i < 6; i++) s += `<path d="M -138 ${-70 + i * 30} L -12 ${-70 + i * 30} M 12 ${-70 + i * 30} L 138 ${-70 + i * 30}" stroke="#9fc4ff" stroke-width="2.5"/>`;
    for (let i = 0; i < 5; i++) s += `<path d="M -130 ${-76 + i * 30} q 12 -9 24 0 t 24 0 t 24 0 t 24 0${i % 2 ? '' : ' t 22 0'}" fill="none" stroke="#1f3fa0" stroke-width="3.2"/><path d="M 22 ${-76 + i * 30} q 12 -9 24 0 t 24 0${i === 4 ? '' : ' t 24 0 t 22 0'}" fill="none" stroke="#1f3fa0" stroke-width="3.2"/>`;
    for (let i = 0; i < 7; i++) s += `<circle cx="0" cy="${-90 + i * 30}" r="7" fill="none" stroke="#6b7180" stroke-width="3"/>`;
    return s + '</g>';
  }
  // the page, close up : his four lines written by hand, a crown over « daronne »
  function notebookPage() {
    let s = `<rect width="1080" height="1920" fill="${INK}" opacity="0.45"/><g transform="rotate(-4 540 900)"><rect x="96" y="420" width="900" height="1000" rx="18" fill="${INK}" opacity="0.5" transform="translate(14 18)"/><rect x="96" y="420" width="900" height="1000" rx="18" fill="#fdfbf4" stroke="${INK}" stroke-width="10"/>`;
    for (let i = 0; i < 11; i++) s += `<path d="M 130 ${560 + i * 76} L 960 ${560 + i * 76}" stroke="#9fc4ff" stroke-width="4"/>`;
    s += `<path d="M 210 440 L 210 1400" stroke="#ff9a9a" stroke-width="4"/>` + T(240, 520, 'Couplet 1', 46, '#6b7180', { font: 'Rubik', weight: 700, anchor: 'start' });
    // the lines fit the page (17/11, planche : the first one went past its edge)
    let fs = 54; while (fs > 30 && Math.max(...LYRICS.map(l => FRAME.width(l, `italic 700 ${fs}px Rubik`))) > 700) fs -= 2;
    LYRICS.forEach((l, i) => { s += `<text x="240" y="${625 + i * 152}" font-family="Rubik" font-weight="700" font-style="italic" font-size="${fs}" fill="#1f3fa0">${l}</text>`; });
    // the crown drawn over « daronne », a heart and a snowflake in the margin
    const cx = 240 + FRAME.width('Ma ', `italic 700 ${fs}px Rubik`) + FRAME.width('daronne', `italic 700 ${fs}px Rubik`) / 2;
    s += `<path d="M ${cx - 62} 566 L ${cx - 50} 534 L ${cx - 24} 558 L ${cx} 526 L ${cx + 24} 558 L ${cx + 50} 534 L ${cx + 62} 566 Z" fill="none" stroke="#1f3fa0" stroke-width="5" stroke-linejoin="round"/>`;
    s += `<path d="M 150 900 C 132 880 112 900 150 930 C 188 900 168 880 150 900 Z" fill="none" stroke="#e5484d" stroke-width="5"/>` + T(150, 1190, '❄', 60, '#1f6fd6');
    return s + '</g>';
  }
  // a mug of coffee, in a character's own coordinates (the hand near 580, 1130)
  const mug = (x, y) => `<g transform="translate(${x} ${y})"><path d="M 28 -24 q 30 0 30 24 q 0 24 -30 24" fill="none" stroke="${INK}" stroke-width="9"/><rect x="-32" y="-40" width="62" height="74" rx="12" fill="#e86a52" stroke="${INK}" stroke-width="6"/><path d="M -10 -56 q -10 -16 0 -30 M 12 -56 q -10 -16 0 -30" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity="0.8"/></g>`;
  // Liam asleep at the kitchen table, his cheek on his pen (in the set's coordinates, behind whoever stands in front)
  function sleepingLiam(x, y, k = 1) {
    let s = `<g transform="translate(${x} ${y}) scale(${k})">`;
    s += `<rect x="-300" y="0" width="600" height="38" rx="8" fill="#c48a52" stroke="${INK}" stroke-width="7"/><path d="M -250 38 L -250 330 M 250 38 L 250 330" stroke="${INK}" stroke-width="18"/><path d="M -250 38 L -250 330 M 250 38 L 250 330" stroke="#9a6a40" stroke-width="9"/>`;
    s += `<rect x="-190" y="-58" width="300" height="70" rx="34" fill="${BLUE}" stroke="${INK}" stroke-width="7"/><rect x="-60" y="-70" width="260" height="76" rx="36" fill="${BLUE}" stroke="${INK}" stroke-width="7"/>`;
    s += `<g transform="rotate(-78 -40 -120)">${headAt('frime+cligne', -40, -120, 0.62, '', false)}</g>`;
    s += `<path d="M 150 -10 L 250 -40" stroke="${INK}" stroke-width="12" stroke-linecap="round"/><path d="M 150 -10 L 250 -40" stroke="#ffd34d" stroke-width="6" stroke-linecap="round"/>`;
    return s + T(-120, -230, 'z', 54, '#9fc4ff', { stroke: INK, sw: 6 }) + T(-70, -290, 'z', 70, '#9fc4ff', { stroke: INK, sw: 6 }) + '</g>';
  }
  // Stalak's lyrics step (the real thing : « paroles importées et calées au tap ») : the clip with the line on it, his
  // four lines pasted, the two first already placed, the third lit, and the big button he taps in time with his song
  function lyricsScreen() {
    let s = `<rect width="560" height="1000" fill="#f3f6fb"/><rect width="560" height="92" fill="${BLUE}"/><circle cx="50" cy="47" r="31" fill="${INK}"/>${img('/site_src/icons/icon.svg', 22, 19, 56, 56)}${T(94, 63, 'Stalak', 42, SNOW, { anchor: 'start', stroke: INK, sw: 8 })}${T(536, 58, 'Paroles', 24, ICE, { font: 'Rubik', weight: 800, anchor: 'end' })}`;
    s += `<clipPath id="ly${++UID}"><rect x="20" y="108" width="520" height="330" rx="18"/></clipPath><g clip-path="url(#ly${UID})"><g transform="translate(20 108)">${takeScene('vaisselle')}${liamBust('fierte', 260, 30, 640, '', false)}</g></g><rect x="20" y="108" width="520" height="330" rx="18" fill="none" stroke="${INK}" stroke-width="6"/>`;
    s += T(280, 386, LYRICS[2], 30, SNOW, { font: 'Rubik', weight: 900, stroke: INK, sw: 9 });
    s += T(26, 488, 'Tes paroles', 30, INK, { font: 'Rubik', weight: 800, anchor: 'start' }) + T(534, 488, 'collées', 24, '#5b6170', { font: 'Rubik', weight: 700, anchor: 'end' });
    LYRICS.forEach((l, i) => {
      const y = 508 + i * 62, on = i === 2;
      s += `<rect x="20" y="${y}" width="520" height="52" rx="14" fill="${on ? BLUE : SNOW}" stroke="${on ? INK : '#c3cbd8'}" stroke-width="3"/>` + T(40, y + 35, l, 24, on ? SNOW : i < 2 ? INK : '#9aa3b5', { font: 'Rubik', weight: 800, anchor: 'start' });
      if (i < 2) s += `<circle cx="512" cy="${y + 26}" r="14" fill="#3fbf7f" stroke="${INK}" stroke-width="2.5"/><path d="M 505 ${y + 26} l 5 5 l 9 -10" fill="none" stroke="${SNOW}" stroke-width="4" stroke-linecap="round"/>`;
    });
    s += K({ ripple: [0.8, 1.3] }, `<circle cx="280" cy="866" r="96" fill="none" stroke="${BLUE}" stroke-width="10"/>`) + `<circle cx="280" cy="866" r="70" fill="${BLUE}" stroke="${INK}" stroke-width="6"/>` + T(280, 882, 'TAP', 46, SNOW);
    s += K({ in: 0.5, out: 1.1, path: [[0.5, 60, 80], [0.8, 0, 0]] }, `<circle cx="336" cy="912" r="28" fill="${SNOW}" fill-opacity="0.85" stroke="${INK}" stroke-width="4"/>`);
    return s + T(280, 976, 'Tape à chaque phrase, en rythme', 24, '#5b6170', { font: 'Rubik', weight: 800 });
  }
  ep('ep9', E9, 9, [
    { t: '0:00', cap: "L'accroche : 6 h du matin, Nadia a trouvé le cahier", set: KITCHEN_N, criY: 700, setOver: () => sleepingLiam(800, 1420, 0.8), chars: [CH('nadia', 2, 470, 2450, 1800, 'colere', notebook(450, 1110, 400, -6))],
      over: () => bandeau(2, E9, 9) + FRAME.cri('nadia', `Tu rappes sur moi${NB}?!`, 700) },
    { t: '0:02', cap: "Liam se réveille d'un coup", set: KITCHEN_N, chars: [CH('nadia', 2, 300, 1856, 1250, 'colere', notebook(450, 1110, 330, -6)), LI(780, 1846, 1200, 'panique')],
      over: () => bandeau(2, E9, 9).replace('class="bandeau"', 'class="bandeau" data-cont="1"') + sub(1, 'liam', "Maman ! C'est privé, ça ! Rends-moi mon cahier !") },
    { t: '0:06', cap: 'Le narrateur présente Liam et Nadia', set: KITCHEN_N, chars: [CH('nadia', 2, 300, 1856, 1250, 'frime', notebook(450, 1110, 330, -6)), LI(780, 1846, 1200, 'colere')],
      over: () => tag('LIAM, ALIAS T-CRAZY', 780, 560, 3) + tag('NADIA, SA MÈRE', 300, 520, -3) + sub(1, 'narrateur', 'Voici Liam. 15 ans. Zéro abonné. Et voici Nadia, sa mère, infirmière de nuit. En rentrant, elle a trouvé son cahier de rap.') },
    { t: '0:14', cap: 'Le cahier, de près : Nadia lit', set: KITCHEN_N, chars: [CH('nadia', 2, 300, 1856, 1250, 'frime', notebook(450, 1110, 330, -6))],
      over: () => notebookPage() + sub(1, 'nadia', '« Ma daronne rentre à six heures, les yeux fatigués. Elle a sauvé des vies, moi j\'ai sauvé un couplet. »') },
    { t: '0:21', cap: 'Nadia est touchée, mais ne le montre pas', set: KITCHEN_N, chars: [CH('nadia', 2, 300, 1856, 1250, 'fierte', notebook(450, 1110, 330, -6)), LI(780, 1846, 1200, 'colere')],
      over: () => sub(1, 'nadia', "C'est… pas mal.") },
    { t: '0:26', cap: 'Nadia, son café à la main', set: KITCHEN_N, chars: [CH('nadia', 2, 300, 1856, 1250, 'frime', mug(580, 1130)), LI(780, 1846, 1200, 'frime')],
      over: () => sub(1, 'nadia', "Alors pourquoi personne l'a jamais entendu ?") },
    { t: '0:30', cap: 'Sa vidéo : il rappe trop vite, « Il dit quoi ? »', set: KITCHEN_N, chars: [LI(540, 1846, 1250, 'colere', P.phone(606, 760), { pose: { raise: 'r' } })],
      over: () => phoneBig(feed(clipPic('chambre', 'colere'), { likes: 0, comments: 1, shares: 0, user: 't.crazy', caption: 'Mon couplet en 10 secondes', sound: 'T-Crazy · son original' }) + comments('theo.bzh', 'Il dit quoi ?', '#23845a'), 0.92) + sub(1, 'liam', 'Dans mes vidéos, je rappe trop vite. Personne comprend ce que je dis.') },
    { t: '0:36', cap: 'Carton « Après les cours » : Maya arrive', set: KITCHEN, chars: [CH('maya', 1, 800, 1846, 1150, 'frime', P.phone(580, 1130), { k: { walk: [[0.3, 600, 0], [2.0, 0, 0]] } }), LI(330, 1846, 1200, 'frime')],
      over: () => carton('APRÈS LES COURS · LA CUISINE') + tag('MAYA, LA VOISINE', 800, 600, 3) + sub(1, 'maya', "Salut. Ta mère m'a dit que t'avais écrit un truc très beau.") },
    { t: '0:41', cap: 'Stalak : il colle ses paroles, puis il tape en rythme', set: KITCHEN, chars: [CH('maya', 1, 820, 1846, 1150, 'fierte', P.phone(580, 1130)), LI(300, 1846, 1200, 'frime')],
      over: () => phoneBig(lyricsScreen(), 0.92) + sub(1, 'maya', 'Mets tes paroles à l\'écran. Dans Stalak, tu les colles, puis tu tapes en rythme pour les caler sur ton son.') },
    { t: '0:51', cap: 'Le clip : chaque phrase quand il la dit', set: KITCHEN, chars: [CH('maya', 1, 830, 1846, 1150, 'fierte'), LI(540, 1846, 1200, 'fierte', P.phone(606, 760), { pose: { raise: 'r' } })],
      over: () => phoneBig(stalakApp({ takes: [['vaisselle', 'fierte'], ['frigo', 'frime'], ['vaisselle', 'colere']], count: 3, ti: 2.2, sticker: 'hype', dl: 2.7, wm: true, word: 'prises', lyric: LYRICS[2] + '\n' + LYRICS[3] }), 0.92) + sub(1, 'narrateur', 'Stalak passe d\'une prise à l\'autre sur le rythme, et chaque phrase s\'affiche quand Liam la dit.') },
    { t: '0:59', cap: 'Il publie : « La phrase sur sa mère »', set: KITCHEN, chars: [LI(540, 1846, 1250, 'fierte', P.phone(606, 760), { pose: { raise: 'r' } })],
      over: () => phoneBig(posted(clipPic('vaisselle', 'fierte', { lyric: LYRICS[2] + '\n' + LYRICS[3] }), 'Couplet pour ma daronne', 'ines.mp3', 'La phrase sur sa mère 😭', '#c94f84', 4), 0.92) },
    { t: '1:02', cap: 'Nadia passe, sa tasse à la main', set: KITCHEN, chars: [CH('maya', 1, 860, 1846, 1100, 'frime'), LI(520, 1846, 1200, 'fierte', P.phone(606, 760), { pose: { raise: 'r' } }), CH('nadia', 2, 180, 1856, 1250, 'frime', mug(580, 1130), { k: { walk: [[0, -520, 0], [1.6, 0, 0]] } })],
      over: () => sub(1, 'nadia', 'Bonjour, Maya. Très joli, ton couplet, Liam. Maintenant, la vaisselle.') },
    { t: '1:05', cap: 'Liam parle à celui qui regarde', set: KITCHEN, zoom: [540, 1150, 1.3], chars: [LI(540, 2730, 2250, 'frime')],
      over: () => sub(1, 'liam', 'T\'as écrit des phrases que personne a jamais lues, toi aussi ? Mets-les à l\'écran : avec Stalak, tu les cales au tap, gratuitement.') },
    { t: '1:13', cap: 'La carte de fin (le prochain à sortir : l\'épisode 4)', plain: true, over: () => endCard("SON POTE S'EST NOMMÉ SON MANAGER") },
  ], 'Sort le 20/11 à 18 h. La cuisine à 6 h du matin (il fait encore nuit), puis après les cours.');

  // ---------------- épisode 10 (20/11, 18 h) : « L'extrait de 3 h du matin » ----------------
  const E10 = "SON EXTRAIT A MARCHÉ, MAIS LE SON N'EST PAS FINI";
  // several comments under a post (our own interface) : [who, text, colour]...
  function commentsList(items, title) {
    let s = `<rect x="0" y="430" width="560" height="590" rx="32" fill="${SNOW}" stroke="${INK}" stroke-width="5"/>${T(280, 484, title || items.length + ' commentaires', 26, '#5b6170', { font: 'Rubik', weight: 800 })}`;
    items.forEach(([who, text, col], i) => {
      const y = 540 + i * 118;
      s += K({ in: 0.2 + i * 0.7, pop: 0.35 }, `<g><circle cx="64" cy="${y + 20}" r="34" fill="${col}"/>${T(64, y + 33, who[0].toUpperCase(), 34, SNOW)}${T(116, y + 4, who, 26, '#7a8091', { font: 'Rubik', weight: 700, anchor: 'start' })}${T(116, y + 48, text, 31, INK, { font: 'Rubik', weight: 800, anchor: 'start' })}</g>`);
    });
    return s;
  }
  const extractPic = () => clipPic('placard', 'fierte');
  const ROOM_D = ['chambre', 2, 'jour'];
  ep('ep10', E10, 10, [
    { t: '0:00', cap: "L'accroche : ils réclament le son en entier", set: ROOM_D, criY: 770, chars: [LI(540, 2650, 2100, 'panique')],
      over: () => bandeau(2, E10, 10) + FRAME.cri('liam', `Ils veulent le son en entier${NB}?!`, 770) + smallPhone(feed(extractPic(), { likes: 41, comments: 12, shares: 3, user: 't.crazy', caption: 'Extrait du nouveau son', sound: 'T-Crazy · son original' }) + commentsList([['nina.lzr', 'Le son en entier stp', '#c94f84'], ['kev_93', "C'est quand, la sortie ?", '#23845a']], '12 commentaires')) },
    { t: '0:02', cap: 'Liam, paniqué', set: ROOM_D, chars: [LI(540, 1846, 1250, 'panique', P.phone(606, 760), { pose: { raise: 'r' } })],
      over: () => bandeau(2, E10, 10).replace('class="bandeau"', 'class="bandeau" data-cont="1"') + sub(1, 'liam', 'Mais il existe pas, le son en entier !') },
    { t: '0:05', cap: "Le narrateur : l'extrait posté à 3 h 12", set: ROOM_D, chars: [LI(540, 1846, 1250, 'colere', P.phone(606, 760), { pose: { raise: 'r' } })],
      over: () => phoneBig(feed(extractPic(), { likes: 41, comments: 12, shares: 3, user: 't.crazy', caption: 'Extrait du nouveau son · publié à 3:12', sound: 'T-Crazy · son original' }), 0.92) + tag('LIAM, ALIAS T-CRAZY', 540, 230, -3) + sub(1, 'narrateur', 'Voici Liam. 15 ans. Hier encore, zéro abonné. Cette nuit, à trois heures du matin, il a posté quinze secondes de son nouveau son.') },
    { t: '0:13', cap: 'Les commentaires continuent', set: ROOM_D, chars: [LI(540, 1846, 1250, 'panique', P.phone(606, 760), { pose: { raise: 'r' } })],
      over: () => phoneBig(feed(extractPic(), { likes: 41, comments: 12, shares: 3, user: 't.crazy', caption: 'Extrait du nouveau son', sound: 'T-Crazy · son original' }) + commentsList([['nina.lzr', 'Le son en entier stp', '#c94f84'], ['kev_93', "C'est quand, la sortie ?", '#23845a'], ['sofiane.wav', 'Encore !!', '#7d55c7']], '12 commentaires'), 0.92) + sub(1, 'narrateur', 'Ce matin, des inconnus réclament la suite. Le problème : Liam n\'a écrit que le refrain.') },
    { t: '0:18', cap: 'Deuce entre en marchant et dit bonjour', set: ROOM_D, chars: [CH('deuce', 1, 790, 1846, 1200, 'fierte', '', { k: { walk: [[0.2, 600, 0], [1.9, 0, 0]] } }), LI(300, 1846, 1200, 'panique')],
      over: () => tag('DEUCE, SON MANAGER', 790, 560, 3) + sub(1, 'deuce', 'Salut, la star. On est en rupture de stock.') },
    { t: '0:22', cap: 'Liam, dépassé', set: ROOM_D, chars: [CH('deuce', 1, 790, 1846, 1200, 'frime'), LI(300, 1846, 1200, 'colere')],
      over: () => sub(1, 'liam', 'Il me faut une semaine pour finir le son. D\'ici là, ils vont m\'oublier !') },
    { t: '0:29', cap: 'Son ordi : 4 h de montage pour 15 s', set: ['chambre', 2, 'jour', { nomic: true }], zoom: [640, 1060, 1.6], dim: 0.45,
      over: () => laptopBig(editor({ labels: [] })) + `<g transform="rotate(6 860 360)"><rect x="740" y="290" width="250" height="140" rx="10" fill="#ffd34d" stroke="${INK}" stroke-width="6"/>${T(865, 352, 'MONTAGE', 40, INK)}${T(865, 408, '3 h → 7 h', 44, '#c8443a')}</g>` + headAt('colere', 300, 1150, 1.9) + sub(1, 'liam', 'Un extrait par jour ?! Celui-là m\'a pris quatre heures de montage ! J\'écris quand, moi ?') },
    { t: '0:36', cap: 'Maya entre en marchant et dit bonjour', set: ROOM_D, chars: [CH('maya', 1, 800, 1846, 1150, 'frime', P.phone(580, 1130), { k: { walk: [[0.2, 600, 0], [1.9, 0, 0]] } }), LI(320, 1846, 1200, 'colere')],
      over: () => tag('MAYA, LA VOISINE', 800, 600, 3) + sub(1, 'maya', 'Salut. J\'ai vu ton extrait. Il est où, le reste ?') },
    { t: '0:41', cap: 'Maya lui montre Stalak, dessiné', set: ROOM_D, chars: [CH('maya', 1, 820, 1846, 1150, 'fierte', P.phone(580, 1130)), LI(300, 1846, 1200, 'frime')],
      over: () => phoneBig(stalakApp({ takes: [['placard', 'fierte'], ['chambre', 'frime'], ['placard', 'colere']], count: 3, ti: -1, word: 'prises' }), 0.92) + sub(1, 'maya', 'Le montage, laisse Stalak le faire. Tu te filmes trois fois sur ton refrain, et Stalak coupe sur le rythme. Toi, pendant ce temps, tu écris.') },
    { t: '0:50', cap: 'Stalak monte l\'extrait ; Liam écrit son couplet', set: ROOM_D, chars: [CH('deuce', 1, 820, 1846, 1150, 'fierte', P.phone(580, 1130)), LI(300, 1846, 1200, 'fierte', notebook(450, 1180, 260, -10))],
      over: () => phoneBig(stalakApp({ takes: [['placard', 'fierte'], ['chambre', 'frime'], ['placard', 'colere']], count: 3, ti: 2.2, sticker: 'hype', dl: 2.7, wm: true, word: 'prises' }), 0.8) + sub(1, 'narrateur', 'Stalak monte l\'extrait sur le rythme. Et pendant ce temps-là, Liam écrit enfin son premier couplet.') },
    { t: '0:58', cap: 'Il publie « Extrait 2 » : « Encore ! »', set: ROOM_D, chars: [LI(540, 1846, 1250, 'fierte', P.phone(606, 760), { pose: { raise: 'r' } })],
      over: () => phoneBig(posted(clipPic('chambre', 'frime'), 'Extrait 2', 'nina.lzr', 'Encore !', '#c94f84', 57), 0.92) + sub(1, 'deuce', 'Et moi, j\'ai trouvé le nom de l\'album : « Le son en entier ».') },
    { t: '1:04', cap: 'Liam parle à celui qui regarde', set: ['chambre', 2, 'jour', { nomic: true }], zoom: [500, 960, 1.3], chars: [LI(540, 2730, 2250, 'frime')],
      over: () => sub(1, 'liam', 'T\'as un son pas fini, toi aussi ? Garde tes nuits pour écrire. Tes extraits, Stalak les monte sur le rythme.') },
    { t: '1:12', cap: 'La carte de fin (le prochain à sortir : « La voix perdue »)', plain: true, over: () => endCard('IL A PERDU SA VOIX LA VEILLE DE SON CLIP') },
  ], 'Sort le 22/11 à 12 h 30. La chambre-studio, le matin.');

  // ---------------- épisode 11 (20/11, 21 h) : « La voix perdue » ----------------
  const E11 = 'IL A PERDU SA VOIX LA VEILLE DE SON CLIP';
  // a knitted scarf around Liam's neck, its two ends hanging (in his own coordinates)
  function scarf() {
    return `<path d="M 318 918 Q 450 990 582 918 L 590 972 Q 450 1046 310 972 Z" fill="#c8443a" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>` +
      `<path d="M 340 950 Q 450 1004 560 950" fill="none" stroke="#ffd34d" stroke-width="7"/>` +
      `<path d="M 500 990 L 548 1000 L 560 1210 L 506 1214 Z" fill="#c8443a" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/><path d="M 508 1060 L 552 1064 M 510 1120 L 556 1124" stroke="#ffd34d" stroke-width="7"/>` +
      `<path d="M 506 1214 l 0 22 M 524 1214 l 0 24 M 542 1212 l 0 22 M 558 1210 l 0 20" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`;
  }
  // a plaid over his shoulders (in his own coordinates)
  const plaid = () => `<path d="M 236 1010 Q 450 930 664 1010 L 720 1480 L 586 1500 L 470 1060 L 430 1060 L 314 1500 L 180 1480 Z" fill="#8a6ab0" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>` +
    [0, 1, 2, 3].map(i => `<path d="M ${214 + i * 6} ${1150 + i * 90} L ${330 - i * 4} ${1130 + i * 90} M ${570 + i * 4} ${1130 + i * 90} L ${690 - i * 6} ${1150 + i * 90}" stroke="#ffd34d" stroke-width="7"/>`).join('');
  // a phone screen with big words typed (he has no voice : he writes)
  const typed = (text) => `<rect width="560" height="1000" fill="#fdfbf4"/><rect width="560" height="96" fill="#ffd34d"/>${T(280, 64, 'Notes', 36, INK)}` + text.split('\n').map((l, i) => T(280, 420 + i * 120, l, 96, INK)).join('') + `<rect x="${280 + FRAME.width(text.split('\n').slice(-1)[0], '96px "Lilita One"') / 2 + 10}" y="${330 + (text.split('\n').length - 1) * 120}" width="8" height="110" fill="${BLUE}"/>`;
  // the reminder on Deuce's phone
  const shootReminder = () => `<rect width="560" height="1000" fill="#f3f6fb"/><rect width="560" height="96" fill="${SNOW}"/>${T(280, 64, 'Calendrier', 34, INK)}` +
    `${T(40, 170, 'Demain', 40, '#5b6170', { font: 'Rubik', weight: 800, anchor: 'start' })}<rect x="30" y="200" width="500" height="200" rx="22" fill="#c8443a" stroke="${INK}" stroke-width="5"/>${T(60, 270, 'TOURNAGE DU CLIP', 40, SNOW, { anchor: 'start' })}${T(60, 340, '16 h · le terrain', 34, SNOW, { font: 'Rubik', weight: 800, anchor: 'start' })}`;
  const SICK = (expr, x, y, h, o = {}) => LI(x, y, h, expr, plaid() + scarf() + (o.mug ? mug(580, 1150) : ''), o);
  const COURT_PM = ['terrain', 1, 'apres-midi'];
  ep('ep11', E11, 11, [
    { t: '0:00', cap: "L'accroche : plus de voix, tournage demain", set: KITCHEN_N, criY: 700, chars: [SICK('panique', 830, 1700, 900, { mug: true }), CH('deuce', 1, 470, 2450, 1800, 'panique', P.phone(580, 1130))],
      over: () => bandeau(2, E11, 11) + FRAME.cri('deuce', `T'as plus de voix et on tourne demain${NB}?!`, 700) + smallPhone(shootReminder(), 820, 1360) },
    { t: '0:02', cap: "Liam n'a qu'un filet de voix", set: KITCHEN_N, chars: [CH('deuce', 1, 260, 1846, 1150, 'panique', P.phone(580, 1130)), SICK('panique', 740, 1846, 1200, { mug: true })],
      over: () => bandeau(2, E11, 11).replace('class="bandeau"', 'class="bandeau" data-cont="1"') + sub(1, 'liam', 'Ça va… je gère…') },
    { t: '0:05', cap: 'Le narrateur présente Liam et Deuce', set: KITCHEN_N, chars: [CH('deuce', 1, 260, 1846, 1150, 'frime', P.phone(580, 1130)), SICK('colere', 740, 1846, 1200, { mug: true })],
      over: () => tag('LIAM, ALIAS T-CRAZY', 740, 560, 3) + tag('DEUCE, SON MANAGER', 260, 600, -3) + sub(1, 'narrateur', 'Voici Liam. 15 ans. Zéro abonné. Et Deuce, son manager. Hier soir, Liam a rappé dehors, dans le froid, pendant trois heures. Ce matin, plus de voix.') },
    { t: '0:12', cap: 'Nadia entre avec du thé', set: KITCHEN_N, chars: [CH('deuce', 1, 180, 1846, 1100, 'frime'), SICK('colere', 560, 1846, 1180), CH('nadia', 2, 870, 1856, 1250, 'frime', mug(580, 1130), { k: { walk: [[0.2, 520, 0], [1.8, 0, 0]] } })],
      over: () => tag('NADIA, SA MÈRE', 870, 520, 3) + sub(1, 'nadia', 'Bonsoir, Deuce. Je suis infirmière : pour sa voix, c\'est du thé, du repos, et pas un mot jusqu\'à demain.') },
    { t: '0:18', cap: 'Liam ne peut plus parler : il écrit', set: KITCHEN_N, chars: [SICK('colere', 540, 1846, 1250, { pose: { raise: 'r' } })],
      over: () => phoneBig(typed('ET MON\nCLIP ?!'), 0.92) + sub(1, 'narrateur', 'Liam ne peut plus parler. Alors il écrit.') },
    { t: '0:22', cap: 'Deuce, très sérieux ; Nadia', set: KITCHEN_N, chars: [CH('deuce', 1, 220, 1846, 1150, 'fierte'), SICK('panique', 560, 1846, 1180), CH('nadia', 2, 880, 1856, 1250, 'frime', mug(580, 1130))],
      over: () => sub(1, 'deuce', 'Pas de panique. On annule le tournage, et on fait un communiqué de presse.') },
    { t: '0:28', cap: "Nadia : c'est du playback", set: KITCHEN_N, chars: [CH('deuce', 1, 220, 1846, 1150, 'panique'), SICK('frime', 560, 1846, 1180), CH('nadia', 2, 880, 1856, 1250, 'fierte', mug(580, 1130))],
      over: () => sub(1, 'nadia', 'Ton son, il est déjà enregistré. Dans ton clip, tu chantes pas pour de vrai : tu bouges les lèvres dessus.') },
    { t: '0:35', cap: 'Le lendemain, 16 h, au terrain', set: COURT_PM, chars: [CH('deuce', 1, 800, 1846, 1200, 'fierte', P.phoneBack(580, 1130)), LI(320, 1846, 1200, 'frime', scarf())],
      over: () => carton('LE LENDEMAIN, 16 H · LE TERRAIN DE BASKET', 230) },
    { t: '0:38', cap: 'Les prises : il bouge les lèvres, sans un bruit', set: COURT_PM, chars: [CH('deuce', 1, 540, 1846, 1250, 'frime', P.phoneBack(580, 1130))],
      over: () => phoneBig(camScreen('terrain-echarpe', 1), 0.92) + sub(1, 'narrateur', 'Le son passe dans le téléphone. Et pour la première fois de sa vie, Liam tourne un clip sans dire un mot.') },
    { t: '0:47', cap: 'Maya arrive en marchant et dit bonjour', set: COURT_PM, chars: [CH('deuce', 1, 230, 1846, 1150, 'frime', P.phoneBack(580, 1130)), LI(520, 1846, 1200, 'frime', scarf()), CH('maya', 1, 860, 1846, 1150, 'frime', P.phone(580, 1130), { k: { walk: [[0.2, 500, 0], [1.8, 0, 0]] } })],
      over: () => tag('MAYA, LA VOISINE', 860, 600, 3) + sub(1, 'maya', 'Salut. C\'est quoi, cette écharpe ?') },
    { t: '0:52', cap: 'Maya ouvre Stalak', set: COURT_PM, chars: [CH('maya', 1, 820, 1846, 1150, 'fierte', P.phone(580, 1130)), LI(300, 1846, 1200, 'frime', scarf())],
      over: () => phoneBig(stalakApp({ takes: [['terrain-echarpe', 'fierte'], ['terrain-echarpe', 'frime'], ['terrain-echarpe', 'colere']], count: 3, ti: -1, word: 'prises' }), 0.92) + sub(1, 'maya', 'Mets tes trois prises dans Stalak. Il les cale sur ton son, et il coupe sur le rythme. Ta bouche reste synchro.') },
    { t: '0:59', cap: 'Le clip, la bouche synchro, même sans voix', set: COURT_PM, chars: [CH('maya', 1, 830, 1846, 1150, 'fierte'), CH('deuce', 1, 250, 1846, 1100, 'fierte'), LI(540, 1846, 1200, 'fierte', scarf() + P.phone(606, 760), { pose: { raise: 'r' } })],
      over: () => phoneBig(stalakApp({ takes: [['terrain-echarpe', 'fierte'], ['terrain-echarpe', 'frime'], ['terrain-echarpe', 'colere']], count: 3, ti: 2.2, sticker: 'cool', dl: 2.7, wm: true, word: 'prises' }), 0.92) + sub(1, 'narrateur', 'Même sans voix, sa bouche est synchro. Personne ne devinerait qu\'il est malade.') },
    { t: '1:05', cap: 'Il publie ; il écrit « C\'ÉTAIT VOULU »', set: COURT_PM, chars: [LI(540, 1846, 1250, 'fierte', scarf() + P.phone(606, 760), { pose: { raise: 'r' } })],
      over: () => phoneBig(posted(clipPic('terrain-echarpe', 'fierte'), 'Clip sans voix', 'lou.prod', "Le style avec l'écharpe 🔥", '#7d55c7', 6), 0.92) + `<g transform="rotate(-4 540 300)"><rect x="250" y="220" width="580" height="140" rx="26" fill="${SNOW}" stroke="${INK}" stroke-width="8"/>${T(540, 316, "C'ÉTAIT VOULU.", 74, INK)}</g>` + sub(1, 'deuce', 'Demain, je lance la mode des écharpes.') },
    { t: '1:09', cap: 'Liam chuchote à celui qui regarde', set: COURT_PM, zoom: [540, 1150, 1.3], chars: [LI(540, 2730, 2250, 'frime', scarf())],
      over: () => sub(1, 'liam', 'Toi aussi, t\'as plus de voix ? Ton son est déjà enregistré. Filme-toi en playback, et Stalak cale tes prises sur ton son.') },
    { t: '1:16', cap: 'La carte de fin (le prochain à sortir : « Le clash au terrain »)', plain: true, over: () => endCard('IL A CLASHÉ LE RAPPEUR LE PLUS CONNU DU QUARTIER') },
  ], 'Sort le 22/11 à 18 h. La cuisine le soir (le salon n\'a pas été choisi), puis le terrain le lendemain.');

  // ---------------- épisode 12 (21/11, 18 h) : « Le clash au terrain » ----------------
  // 18/11, contact sheet : « … LE RAPPEUR LE / PLUS CONNU… » ended a line with « LE » ; « LE PLUS » now stays together
  const E12 = `IL A CLASHÉ LE RAPPEUR LE${NB}PLUS CONNU DU QUARTIER`;
  // Big Mo from the waist up in a little tile (his own clips), anywhere ; x, y : the top left, w : the width
  const moBust = (x, y, w) => { const r = CAST.figure('bigmo', 1, 'frime'), k = w / 900 * 1.15; return `<defs>${r.defs}</defs><g transform="translate(${(x - 0.08 * w).toFixed(1)} ${(y + 0.06 * w).toFixed(1)}) scale(${k.toFixed(4)})">${r.svg}</g>`; };
  // Big Mo's profile : a clip a day, always his two takes (the court, the shop) cut differently (our own interface)
  function moProfile() {
    let s = `<rect width="560" height="1000" fill="#0b0d12"/><circle cx="84" cy="124" r="56" fill="#c98a06" stroke="${SNOW}" stroke-width="4"/>${T(84, 144, 'M', 56, SNOW)}`;
    s += T(160, 112, '@bigmo.officiel', 32, SNOW, { font: 'Rubik', weight: 800, anchor: 'start' }) + T(160, 152, '50 000 abonnés · un clip par jour', 24, '#b9c2d3', { font: 'Rubik', weight: 700, anchor: 'start' });
    for (let i = 0; i < 9; i++) {
      const x = 8 + (i % 3) * 184, y = 200 + Math.floor(i / 3) * 262, id = 'mp' + (++UID);
      s += `<clipPath id="${id}"><rect x="${x}" y="${y}" width="176" height="252" rx="10"/></clipPath><g clip-path="url(#${id})"><g transform="translate(${x} ${y}) scale(${176 / 520} ${252 / 400})">${takeScene(i % 2 ? 'rue' : 'terrain')}</g>${moBust(x + 20, y + 40, 150)}</g>`;
      s += `<rect x="${x}" y="${y}" width="176" height="252" rx="10" fill="none" stroke="#2a3142" stroke-width="3"/>` + T(x + 12, y + 238, '▶ JOUR ' + (60 - i), 20, SNOW, { font: 'Rubik', weight: 800, anchor: 'start', stroke: INK, sw: 4 });
    }
    return s;
  }
  // Stalak, Creator Plus (the real offer : « packs de 5 à 30 vidéos aux coupes différentes, à partir de 2 playbacks ») on Big Mo's phone
  function packScreen() {
    let s = `<rect width="560" height="1000" fill="#f3f6fb"/><rect width="560" height="92" fill="${BLUE}"/><circle cx="50" cy="47" r="31" fill="${INK}"/>${img('/site_src/icons/icon.svg', 22, 19, 56, 56)}${T(94, 63, 'Stalak', 42, SNOW, { anchor: 'start', stroke: INK, sw: 8 })}`;
    s += `<rect x="346" y="26" width="194" height="42" rx="21" fill="#ffd34d" stroke="${INK}" stroke-width="3"/>${T(443, 55, 'Creator Plus', 24, INK, { font: 'Rubik', weight: 800 })}`;
    s += T(26, 150, 'Tes 2 playbacks', 30, INK, { font: 'Rubik', weight: 800, anchor: 'start' });
    ['terrain', 'rue'].forEach((k, j) => { const x = 26 + j * 260, id = 'pk' + (++UID); s += `<clipPath id="${id}"><rect x="${x}" y="172" width="244" height="190" rx="14"/></clipPath><g clip-path="url(#${id})"><g transform="translate(${x} 172) scale(${244 / 520} ${190 / 400})">${takeScene(k)}</g>${moBust(x + 60, 186, 140)}</g><rect x="${x}" y="172" width="244" height="190" rx="14" fill="none" stroke="${INK}" stroke-width="4"/>`; });
    s += T(26, 420, 'Pack : 30 vidéos', 38, INK, { anchor: 'start' }) + T(534, 420, 'coupes différentes', 22, '#5b6170', { font: 'Rubik', weight: 700, anchor: 'end' });
    for (let i = 0; i < 30; i++) {
      const x = 26 + (i % 6) * 86, y = 446 + Math.floor(i / 6) * 92;
      s += `<rect x="${x}" y="${y}" width="76" height="82" rx="8" fill="#e3e9f3" stroke="${INK}" stroke-width="2.5"/>` + [0, 1, 2, 3].map(b => `<rect x="${x + 6 + b * 17}" y="${y + 58}" width="15" height="16" rx="3" fill="${TAKE_COL[(i + b * (1 + i % 3)) % 2]}"/>`).join('') + `<path d="M ${x + 30} ${y + 18} l 20 12 l -20 12 Z" fill="${INK}"/>`;
    }
    return s + `<rect x="20" y="916" width="520" height="66" rx="20" fill="${BLUE}" stroke="${INK}" stroke-width="4"/>` + T(280, 960, 'Générer le pack', 30, SNOW, { font: 'Rubik', weight: 800 });  // the app's own button (FR : « Générer le pack ») : Stalak makes the videos, it does not post them
  }
  // his phone forgotten on the bench (decors.js terrain1 : the bench 40-340 × 1580), lit up
  const benchPhone = () => `<g transform="translate(190 1566) rotate(-4)"><rect x="-56" y="-14" width="112" height="28" rx="8" fill="#1d1f27" stroke="${INK}" stroke-width="4"/><rect x="-48" y="-9" width="96" height="18" rx="4" fill="#8fd3ff"/></g>` + (window.LIGHTS ? LIGHTS.glint(190, 1566, 40, {}) : '');
  const MO = (expr, x, y, h, props = '', o = {}) => CH('bigmo', 1, x, y, h, expr, props, o);
  ep('ep12', E12, 12, [
    { t: '0:00', cap: "L'accroche : Big Mo n'en revient pas", set: COURT_PM, criY: 700, chars: [CH('deuce', 1, 200, 1700, 880, 'frime'), CH('maya', 1, 880, 1700, 860, 'frime'), MO('colere', 540, 2450, 1800)],
      over: () => bandeau(2, E12, 12) + FRAME.cri('bigmo', `T'as zéro abonné et tu me clashes${NB}?!`, 700) },
    { t: '0:02', cap: 'Liam, le menton levé, rappe son clash', set: COURT_PM, rap: 'liam', rapFrom: 0.1, chars: [MO('frime', 800, 1846, 1350), LI(300, 1846, 1200, 'fierte')],
      over: () => bandeau(2, E12, 12).replace('class="bandeau"', 'class="bandeau" data-cont="1"') + sub(1, 'liam', "Big Mo, tes clips, c'est tous les jours la même chose. Moi, j'en fais un par an, mais c'est grandiose !") },
    { t: '0:07', cap: 'Le narrateur présente Liam et Big Mo', set: COURT_PM, chars: [MO('frime', 800, 1846, 1350), LI(300, 1846, 1200, 'frime')],
      over: () => tag('LIAM, ALIAS T-CRAZY', 300, 560, -3) + tag('BIG MO, LE RAPPEUR DU QUARTIER', 700, 420, 3) + sub(1, 'narrateur', 'Voici Liam. 15 ans. Zéro abonné. Et voici Big Mo, le rappeur le plus connu du quartier : cinquante mille abonnés.') },
    // 04-06 : everybody stands right of the bench (40-340), so that the phone left on it stays in sight
    { t: '0:15', cap: 'Big Mo pose son téléphone sur le banc', set: COURT_PM, setOver: benchPhone, chars: [LI(790, 1846, 1200, 'colere'), MO('fierte', 440, 1846, 1350, '', { k: { walk: [[1.4, 0, 0], [3.6, 1120, 0]] } })],
      over: () => sub(1, 'bigmo', 'Un par an ? Moi, c\'est un par jour, le petit. Salut.') },
    { t: '0:20', cap: 'Liam, dégoûté, se tourne vers le banc', set: COURT_PM, setOver: benchPhone, chars: [CH('deuce', 1, 700, 1846, 1150, 'frime'), CH('maya', 1, 930, 1846, 1100, 'frime', P.phone(580, 1130)), LI(460, 1846, 1200, 'colere')],
      over: () => tag('DEUCE, SON MANAGER', 660, 560, -3) + tag('MAYA, LA VOISINE', 880, 640, 3) + sub(1, 'liam', 'Un clip par jour ?! Moi, un clip, ça me prend tout un week-end !') },
    { t: '0:25', cap: 'Deuce a une théorie', set: COURT_PM, setOver: benchPhone, chars: [CH('deuce', 1, 700, 1846, 1150, 'fierte'), CH('maya', 1, 930, 1846, 1100, 'frime', P.phone(580, 1130)), LI(460, 1846, 1200, 'panique')],
      over: () => sub(1, 'deuce', 'Facile : il a une équipe de vingt personnes. Ou un clone.') },
    { t: '0:31', cap: 'Les vidéos de Big Mo : les deux mêmes prises', set: COURT_PM, chars: [CH('maya', 1, 800, 1846, 1150, 'fierte', P.phone(580, 1130)), LI(300, 1846, 1200, 'panique')],
      over: () => phoneBig(moProfile(), 0.92) + sub(1, 'maya', 'Regarde : c\'est toujours les deux mêmes prises. Mais chaque jour, le montage change.') },
    { t: '0:38', cap: 'Sur le banc, le téléphone de Big Mo s\'allume : Stalak', set: COURT_PM, chars: [LI(540, 1846, 1250, 'panique', P.phone(606, 760), { pose: { raise: 'r' } })],
      over: () => phoneBig(packScreen() + `<g class="sticker" data-dl="0.6"><g transform="translate(470 720)"><circle r="80" fill="${SNOW}" stroke="${INK}" stroke-width="6"/>${img('/site_src/emoji/shock.webp', -70, -70, 140, 140)}</g></g>`, 0.92) + sub(1, 'liam', 'Big Mo utilise Stalak ?!') },
    { t: '0:46', cap: 'Big Mo revient chercher son téléphone', set: COURT_PM, chars: [LI(280, 1846, 1200, 'panique', P.phone(606, 760), { pose: { raise: 'r' } }), MO('frime', 790, 1846, 1350, '', { k: { walk: [[0, 700, 0], [1.6, 0, 0]] } })],
      over: () => sub(1, 'bigmo', 'Mon téléphone. Et pas un mot, le petit.') },
    { t: '0:50', cap: 'Liam à Maya : un pack de trente ?', set: COURT_PM, chars: [CH('maya', 1, 800, 1846, 1150, 'fierte', P.phone(580, 1130)), LI(300, 1846, 1200, 'fierte')],
      over: () => sub(1, 'maya', 'T\'as pas un rond. Commence par la version gratuite : tes vidéos sont illimitées.') },
    { t: '0:56', cap: 'Deux prises au terrain, Stalak monte le clip', set: COURT_PM, chars: [CH('deuce', 1, 820, 1846, 1150, 'fierte', P.phoneBack(580, 1130)), LI(540, 1846, 1200, 'fierte', P.phone(606, 760), { pose: { raise: 'r' } })],
      over: () => phoneBig(stalakApp({ takes: [['terrain', 'fierte'], ['terrain', 'frime']], count: 2, ti: 2.2, sticker: 'hype', dl: 2.7, wm: true, word: 'prises' }), 0.92) + sub(1, 'narrateur', 'Deux prises, Stalak monte sur le rythme, et Liam poste sa vidéo du jour. Jour un.') },
    { t: '1:04', cap: 'Il publie « Jour 1 » : « Réponds à Big Mo »', set: COURT_PM, chars: [LI(540, 1846, 1250, 'fierte', P.phone(606, 760), { pose: { raise: 'r' } })],
      over: () => phoneBig(posted(clipPic('terrain', 'fierte'), 'Jour 1', 'adam.bkr', 'Réponds à Big Mo 😂', '#7d55c7', 9), 0.92) + sub(1, 'deuce', 'Plus que trois cent soixante-quatre.') },
    { t: '1:08', cap: 'Liam parle à celui qui regarde', set: COURT_PM, zoom: [540, 1150, 1.3], chars: [LI(540, 2730, 2250, 'frime')],
      over: () => sub(1, 'liam', 'Un clip te prend tout un week-end, toi aussi ? Filme tes prises, Stalak monte sur le rythme, et poste tous les jours.') },
    { t: '1:16', cap: 'La carte de fin : « La fiche d\'orientation »', plain: true, over: () => endCard('IL A ÉCRIT “RAPPEUR” SUR SA FICHE D\'ORIENTATION') },
  ], 'Sort le 22/11 à 21 h, juste après « La voix perdue » (qui l\'annonce). Le terrain en fin de journée.');

  // ---------------- épisode 13 (21/11, 21 h) : « La fiche d'orientation » ----------------
  const E13 = `IL A ÉCRIT “RAPPEUR” SUR${NB}SA FICHE D'ORIENTATION`, ROOF = ['toit', 2, 'soir']; // « SUR SA » together : no line ends with « SUR » (18/11)
  // the school form (our own : no real school), in a character's own coordinates ; cx, cy its centre, w its width
  function fiche(cx, cy, w = 380, r = 0) {
    return `<g transform="translate(${cx} ${cy}) rotate(${r}) scale(${(w / 380).toFixed(3)})"><rect x="-190" y="-250" width="380" height="500" rx="8" fill="#fdfdfb" stroke="${INK}" stroke-width="7"/>` +
      T(0, -190, "FICHE D'ORIENTATION", 30, INK) + `<path d="M -160 -170 L 160 -170" stroke="${INK}" stroke-width="3"/>` +
      [-120, -70].map(y => `<path d="M -160 ${y} L 160 ${y}" stroke="#c3cbd8" stroke-width="3"/>`).join('') + T(-160, -128, 'Nom : Liam', 24, '#5b6170', { font: 'Rubik', weight: 700, anchor: 'start' }) +
      T(-160, -20, 'Métier envisagé :', 26, INK, { font: 'Rubik', weight: 800, anchor: 'start' }) +
      `<text x="0" y="50" text-anchor="middle" font-family="Rubik" font-weight="800" font-style="italic" font-size="50" fill="#1f3fa0">RAPPEUR</text><text x="0" y="104" text-anchor="middle" font-family="Rubik" font-weight="700" font-style="italic" font-size="32" fill="#1f3fa0">(le prochain)</text>` +
      `<ellipse cx="0" cy="36" rx="150" ry="52" fill="none" stroke="#e5484d" stroke-width="6" transform="rotate(-4)"/>` + [150, 200].map(y => `<path d="M -160 ${y} L 160 ${y}" stroke="#c3cbd8" stroke-width="3"/>`).join('') + '</g>';
  }
  // the form in close-up over the dimmed kitchen (19/11, contact sheet : held at Nadia's waist, « RAPPEUR (le prochain) » was hidden
  // by Liam's subtitle while he talks about it) ; the title band stays on top of it
  const ficheBig = () => `<rect width="1080" height="1920" fill="${INK}" opacity="0.5"/><g class="phone">${fiche(540, 905, 500, -4)}</g>`;
  // a folding chair on the roof (in the set's coordinates) ; x its middle, y the seat
  const chair = (x, y) => `<path d="M ${x - 70} ${y + 10} L ${x - 90} ${y + 196} M ${x + 70} ${y + 10} L ${x + 90} ${y + 196} M ${x - 60} ${y} L ${x - 60} ${y - 160} M ${x + 60} ${y} L ${x + 60} ${y - 160}" stroke="${INK}" stroke-width="14" stroke-linecap="round"/><path d="M ${x - 70} ${y + 10} L ${x - 90} ${y + 196} M ${x + 70} ${y + 10} L ${x + 90} ${y + 196} M ${x - 60} ${y} L ${x - 60} ${y - 160} M ${x + 60} ${y} L ${x + 60} ${y - 160}" stroke="#8a919c" stroke-width="6" stroke-linecap="round"/>` +
    `<rect x="${x - 80}" y="${y - 10}" width="160" height="26" rx="6" fill="#3f7a55" stroke="${INK}" stroke-width="6"/><rect x="${x - 66}" y="${y - 150}" width="132" height="56" rx="6" fill="#3f7a55" stroke="${INK}" stroke-width="6"/>`;
  ep('ep13', E13, 13, [
    { t: '0:00', cap: "L'accroche : Nadia a lu la fiche d'orientation", set: KITCHEN_N, criY: 700, chars: [LI(820, 1700, 900, 'frime'), CH('nadia', 2, 450, 2450, 1800, 'colere', fiche(450, 1170, 400, -5))],
      over: () => bandeau(2, E13, 13) + FRAME.cri('nadia', `T'as écrit «${NB}rappeur${NB}» sur ta fiche d'orientation${NB}?!`, 700) },
    { t: '0:02', cap: 'Liam, très calme ; la fiche en gros plan', set: KITCHEN_N, chars: [CH('nadia', 2, 290, 1856, 1250, 'colere'), LI(770, 1846, 1200, 'frime')],
      over: () => ficheBig() + bandeau(2, E13, 13).replace('class="bandeau"', 'class="bandeau" data-cont="1"') + sub(1, 'liam', 'Et j\'ai mis « le prochain » entre parenthèses. Pour qu\'ils sachent.') },
    { t: '0:06', cap: 'Le narrateur présente Liam et Nadia', set: KITCHEN_N, chars: [CH('nadia', 2, 290, 1856, 1250, 'frime', fiche(450, 1170, 330, -5)), LI(770, 1846, 1200, 'fierte')],
      over: () => tag('NADIA, SA MÈRE', 290, 520, -3) + tag('LIAM, ALIAS T-CRAZY', 770, 560, 3) + sub(1, 'narrateur', 'Voici Liam. 15 ans. Zéro abonné. Et Nadia, sa mère. Au lycée, on a demandé à Liam quel métier il voulait faire plus tard.') },
    { t: '0:14', cap: 'Nadia pose la feuille', set: KITCHEN_N, chars: [CH('nadia', 2, 290, 1856, 1250, 'colere'), LI(770, 1846, 1200, 'panique')],
      over: () => sub(1, 'nadia', 'Rappeur, d\'accord. Mais tu vas en cours jusqu\'au bout. Et tu fais la vaisselle.') },
    { t: '0:20', cap: 'Le lendemain, sur le toit : debout sur une chaise', set: ROOF, setOver: () => chair(540, 1660), chars: [LI(540, 1660, 1150, 'fierte')],
      over: () => carton('LE LENDEMAIN, AU COUCHER DU SOLEIL · LE TOIT', 230) },
    { t: '0:24', cap: 'Maya arrive en marchant et dit bonjour', set: ROOF, setOver: () => chair(420, 1660), chars: [LI(420, 1660, 1150, 'fierte'), CH('maya', 1, 860, 1846, 1150, 'frime', P.phone(580, 1130), { k: { walk: [[0.2, 500, 0], [1.8, 0, 0]] } })],
      over: () => tag('MAYA, LA VOISINE', 860, 600, 3) + sub(1, 'liam', 'Je visualise. Dans un an, je remplis un stade.') },
    { t: '0:30', cap: 'Maya, à côté de la glacière', set: ROOF, setOver: () => chair(420, 1660), chars: [LI(420, 1660, 1150, 'frime'), CH('maya', 1, 860, 1846, 1150, 'frime', P.phone(580, 1130))],
      over: () => sub(1, 'maya', 'Un stade. Avec qui dedans ?') },
    { t: '0:33', cap: 'Liam descend de sa chaise', set: ROOF, setOver: () => chair(560, 1660), chars: [LI(320, 1846, 1200, 'panique'), CH('maya', 1, 860, 1846, 1150, 'frime', P.phone(580, 1130))],
      over: () => sub(1, 'narrateur', 'Pour remplir un stade, il faut des gens qui connaissent ton son. Et pour ça, il faut le poster. Souvent.') },
    { t: '0:40', cap: 'Combien de vidéos ce mois-ci ? Une.', set: ROOF, setOver: () => chair(560, 1660), chars: [LI(320, 1846, 1200, 'colere'), CH('maya', 1, 860, 1846, 1150, 'fierte', P.phone(580, 1130))],
      over: () => sub(1, 'liam', 'Une. Entre les cours, les devoirs et la vaisselle, j\'ai pas le temps de monter !') },
    { t: '0:47', cap: 'Maya lui montre Stalak, dessiné', set: ROOF, chars: [CH('maya', 1, 820, 1846, 1150, 'fierte', P.phone(580, 1130)), LI(300, 1846, 1200, 'frime')],
      over: () => phoneBig(stalakApp({ takes: [['toit', 'fierte'], ['toit', 'frime'], ['toit', 'colere']], count: 3, ti: -1, word: 'prises' }), 0.92) + sub(1, 'maya', 'Le montage, c\'est Stalak. Tu te filmes trois fois sur ton son, ici, et Stalak coupe sur le rythme.') },
    { t: '0:56', cap: 'Trois prises au coucher du soleil, le clip monté', set: ROOF, chars: [CH('maya', 1, 830, 1846, 1150, 'fierte'), LI(540, 1846, 1200, 'fierte', P.phone(606, 760), { pose: { raise: 'r' } })],
      over: () => phoneBig(stalakApp({ takes: [['toit', 'fierte'], ['toit', 'frime'], ['toit', 'colere']], count: 3, ti: 2.2, sticker: 'cool', dl: 2.7, wm: true, word: 'prises' }), 0.92) + sub(1, 'narrateur', 'Trois prises au coucher du soleil. Stalak monte sur le rythme, et Liam a posté avant le dîner.') },
    { t: '1:03', cap: `Il publie : « C'est où, ce${NB}toit${NB}?${NB}»`, set: ROOF, chars: [CH('maya', 1, 860, 1846, 1100, 'frime'), LI(470, 1846, 1250, 'fierte', P.phone(606, 760), { pose: { raise: 'r' } })],
      over: () => phoneBig(posted(clipPic('toit', 'fierte'), 'Coucher de soleil', 'clara.mp3', 'C\'est où, ce toit ? 😍', '#c94f84', 7), 0.92) + sub(1, 'liam', 'Bon. Le stade, ce sera dans deux ans.') },
    { t: '1:08', cap: 'Liam parle à celui qui regarde', set: ROOF, zoom: [540, 1150, 1.3], chars: [LI(540, 2730, 2250, 'frime')],
      over: () => sub(1, 'liam', 'T\'as cours demain, toi aussi ? Filme trois prises ce soir. Stalak monte sur le rythme, et t\'as posté avant tes devoirs.') },
    { t: '1:16', cap: 'La carte de fin : « Le Black Friday »', plain: true, over: () => endCard(`IL VEUT UNE CAMÉRA DE PRO POUR${NB}LE${NB}BLACK${NB}FRIDAY`) },
  ], 'Sort le 23/11 à 12 h 30. La cuisine le soir, puis ton toit au coucher du soleil.');

  // ---------------- épisode 14 (22/11, 18 h) : « Le Black Friday » ----------------
  // 18/11, contact sheet : « … POUR LE BLACK / FRIDAY » cut « Black Friday » in two ; « POUR LE BLACK FRIDAY » now stays together
  const E14 = `IL VEUT UNE CAMÉRA DE PRO POUR${NB}LE${NB}BLACK${NB}FRIDAY`;
  // a camera, drawn by us (no brand) ; cx, cy its centre, w its width
  const camera = (cx, cy, w = 300) => `<g transform="translate(${cx} ${cy}) scale(${(w / 300).toFixed(3)})"><rect x="-150" y="-80" width="300" height="170" rx="22" fill="#2a2d36" stroke="${INK}" stroke-width="8"/>` +
    `<rect x="-118" y="-114" width="110" height="40" rx="10" fill="#3a3f4c" stroke="${INK}" stroke-width="7"/><circle cx="40" cy="6" r="66" fill="#1d1f27" stroke="${INK}" stroke-width="8"/><circle cx="40" cy="6" r="42" fill="#3b6fb0" stroke="${INK}" stroke-width="6"/>` +
    `<circle cx="24" cy="-10" r="12" fill="#ffffff" opacity="0.7"/><circle cx="-112" cy="-40" r="10" fill="#e5484d"/></g>`;
  // the Black Friday ad on Liam's phone (our own drawing : a camera with no brand, its old price crossed out, « neuf cents balles »)
  function bfAd() {
    let s = `<rect width="560" height="1000" fill="#0f1116"/>` + T(280, 118, 'BLACK', 92, '#ffd34d', { stroke: INK, sw: 6 }) + T(280, 208, 'FRIDAY', 92, '#ffd34d', { stroke: INK, sw: 6 });
    s += `<rect x="40" y="248" width="480" height="420" rx="30" fill="#f3f6fb" stroke="${INK}" stroke-width="6"/>` + camera(280, 470, 330);
    s += `<g transform="rotate(10 446 312)"><circle cx="446" cy="312" r="66" fill="#e5484d" stroke="${INK}" stroke-width="6"/>${T(446, 326, '−30 %', 36, SNOW)}</g>`;
    s += T(280, 736, 'Caméra pro 4K', 40, SNOW, { font: 'Rubik', weight: 800 }) + T(280, 796, '1 290 €', 40, '#9aa3b5', { font: 'Rubik', weight: 700 }) + `<path d="M 196 783 L 364 783" stroke="#e5484d" stroke-width="6"/>`;
    s += T(280, 892, '900 €', 96, '#ffd34d', { stroke: INK, sw: 6 });
    return s + `<rect x="60" y="920" width="440" height="58" rx="18" fill="${BLUE}" stroke="${INK}" stroke-width="4"/>` + T(280, 959, 'Ajouter au panier', 28, SNOW, { font: 'Rubik', weight: 800 });
  }
  // the promotions Deuce scrolls through (our own drawing, no brand)
  function bfList() {
    const icon = {
      shoe: `<path d="M -66 26 L -64 -14 Q -44 -34 -14 -22 L 22 -6 Q 62 0 66 26 Z" fill="${SNOW}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/><rect x="-70" y="22" width="140" height="18" rx="8" fill="#e5484d" stroke="${INK}" stroke-width="5"/>`,
      hp: `<path d="M -46 20 L -46 -6 A 46 46 0 0 1 46 -6 L 46 20" fill="none" stroke="${INK}" stroke-width="10"/><rect x="-62" y="0" width="30" height="50" rx="10" fill="${BLUE}" stroke="${INK}" stroke-width="5"/><rect x="32" y="0" width="30" height="50" rx="10" fill="${BLUE}" stroke="${INK}" stroke-width="5"/>`,
      tv: `<rect x="-66" y="-40" width="132" height="84" rx="8" fill="#2a2d36" stroke="${INK}" stroke-width="6"/><rect x="-56" y="-31" width="112" height="66" rx="4" fill="#57adff"/><path d="M -20 44 L -30 60 M 20 44 L 30 60" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`,
      cam: camera(0, 0, 130),
    };
    let s = `<rect width="560" height="1000" fill="#0f1116"/>` + T(280, 88, 'BLACK FRIDAY', 64, '#ffd34d', { stroke: INK, sw: 6 });
    [['Baskets', '−30 %', 'shoe'], ['Casque', '−40 %', 'hp'], ['Télé', '−50 %', 'tv'], ['Caméra pro', '−30 %', 'cam']].forEach(([name, off, ic], i) => {
      const y = 126 + i * 214;
      s += `<rect x="24" y="${y}" width="512" height="190" rx="24" fill="#f3f6fb" stroke="${INK}" stroke-width="5"/><circle cx="110" cy="${y + 95}" r="70" fill="#e3e9f3"/><g transform="translate(110 ${y + 95})">${icon[ic]}</g>`;
      s += T(206, y + 110, name, 38, INK, { font: 'Rubik', weight: 800, anchor: 'start' }) + T(206, y + 156, 'Offre limitée', 26, '#5b6170', { font: 'Rubik', weight: 700, anchor: 'start' });
      s += `<g transform="rotate(-6 466 ${y + 34})"><rect x="410" y="${y + 10}" width="112" height="48" rx="14" fill="#e5484d" stroke="${INK}" stroke-width="5"/>${T(466, y + 45, off, 28, SNOW)}</g>`; // 18/11 : in the corner, so that « Caméra pro » is not cut by it
    });
    return s;
  }
  // a phone held in the hand, its screen readable (in a character's own coordinates) : inner is a 560 × 1000 screen
  const handPhone = (inner, x, y, k = 0.3) => { const id = 'hp' + (++UID); return `<g transform="translate(${x} ${y}) scale(${k}) translate(-300 -540)"><rect width="600" height="1080" rx="64" fill="#2a2d36" stroke="${INK}" stroke-width="14"/>` +
    `<clipPath id="${id}"><rect x="20" y="40" width="560" height="1000" rx="40"/></clipPath><g clip-path="url(#${id})"><g transform="translate(20 40)">${inner}</g></g></g>`; };
  // a shoe box (no brand) : under the arm, or open and empty (in a character's own coordinates)
  const shoebox = (x, y, open = false, r = 0) => `<g transform="translate(${x} ${y}) rotate(${r})">` + (open
    ? `<g transform="rotate(-28 -150 -64)"><rect x="-160" y="-108" width="320" height="44" rx="6" fill="#ff8f4a" stroke="${INK}" stroke-width="8"/></g><path d="M -150 -64 L 150 -64 L 136 70 L -136 70 Z" fill="#e8742c" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/><path d="M -134 -54 L 134 -54 L 128 -14 L -128 -14 Z" fill="#3a2a20"/>`
    : `<rect x="-150" y="-64" width="300" height="134" rx="8" fill="#e8742c" stroke="${INK}" stroke-width="8"/><rect x="-162" y="-80" width="324" height="44" rx="6" fill="#ff8f4a" stroke="${INK}" stroke-width="8"/>`) + '</g>';
  ep('ep14', E14, 14, [
    { t: '0:00', cap: "L'accroche : la caméra du Black Friday", set: KITCHEN_N, criY: 700, chars: [LI(830, 1700, 900, 'panique'), CH('nadia', 2, 470, 2450, 1800, 'colere', handPhone(bfAd(), 590, 1010, 0.42))],
      over: () => bandeau(2, E14, 14) + FRAME.cri('nadia', `Neuf cents balles, ta caméra${NB}?!`, 700) },
    { t: '0:02', cap: 'Liam insiste, le téléphone à bout de bras', set: KITCHEN_N, chars: [CH('nadia', 2, 290, 1856, 1250, 'colere'), LI(770, 1846, 1200, 'fierte', handPhone(bfAd(), 606, 700, 0.3), { pose: { raise: 'r' } })],
      over: () => bandeau(2, E14, 14).replace('class="bandeau"', 'class="bandeau" data-cont="1"') + sub(1, 'liam', "Mais elle est en promo ! C'est le Black Friday, maman !") },
    { t: '0:05', cap: 'Le narrateur présente Liam et Nadia', set: KITCHEN_N, chars: [CH('nadia', 2, 290, 1856, 1250, 'frime'), LI(770, 1846, 1200, 'fierte', handPhone(bfAd(), 606, 700, 0.3), { pose: { raise: 'r' } })],
      over: () => tag('NADIA, SA MÈRE', 290, 520, -3) + tag('LIAM, ALIAS T-CRAZY', 770, 560, 3) + sub(1, 'narrateur', "Voici Liam. 15 ans. Zéro abonné. Et Nadia, sa mère. Dans cinq jours, c'est le Black Friday. Et Liam en est sûr : sans caméra de pro, pas de vrai clip.") },
    { t: '0:13', cap: 'Nadia lui rend son téléphone', set: KITCHEN_N, chars: [CH('nadia', 2, 290, 1856, 1250, 'frime', P.phone(580, 1130)), LI(770, 1846, 1200, 'panique')],
      over: () => sub(1, 'nadia', "Ton téléphone filme très bien. Je le sais : c'est moi qui l'ai payé.") },
    { t: '0:19', cap: 'Deuce entre, une boîte de baskets sous le bras', set: KITCHEN_N, chars: [CH('nadia', 2, 240, 1856, 1250, 'frime'), LI(540, 1846, 1200, 'panique'), CH('deuce', 1, 860, 1846, 1150, 'fierte', shoebox(600, 1010), { k: { walk: [[0.3, 600, 0], [2.0, 0, 0]] } })],
      over: () => tag('DEUCE, SON MANAGER', 860, 600, 3) + sub(1, 'deuce', "Bonsoir, madame. J'ai entendu “Black Friday”. J'ai un plan.") },
    { t: '0:24', cap: 'Deuce ouvre la boîte : vide', set: KITCHEN_N, chars: [CH('nadia', 2, 240, 1856, 1250, 'colere'), LI(540, 1846, 1200, 'panique'), CH('deuce', 1, 860, 1846, 1150, 'fierte', shoebox(470, 1120, true))],
      over: () => sub(1, 'deuce', "On revend tes baskets, et avec l'argent, on prend la caméra.") },
    { t: '0:30', cap: 'Le lendemain, dans la rue', set: RUE, chars: [CH('deuce', 1, 720, 1846, 1150, 'fierte', P.phone(580, 1130)), LI(380, 1846, 1200, 'frime')],
      over: () => carton('LE LENDEMAIN · LA RUE') },
    { t: '0:33', cap: 'Deuce fait défiler les promos', set: RUE, chars: [CH('deuce', 1, 720, 1846, 1150, 'fierte', P.phone(580, 1130)), LI(380, 1846, 1200, 'frime')],
      over: () => phoneBig(bfList(), 0.92) + sub(1, 'deuce', 'Moins trente, moins quarante… Si on achète tout, on est riches !') },
    { t: '0:38', cap: 'Maya arrive en marchant et dit bonjour', set: RUE, chars: [CH('deuce', 1, 250, 1846, 1150, 'frime', P.phone(580, 1130)), LI(520, 1846, 1200, 'fierte'), CH('maya', 1, 850, 1846, 1150, 'frime', P.phone(580, 1130), { k: { walk: [[0.2, 640, 0], [2.0, 0, 0]] } })],
      over: () => tag('MAYA, LA VOISINE', 850, 600, 3) + sub(1, 'maya', 'Salut. Vous achetez quoi ?') },
    { t: '0:43', cap: 'Maya lui montre Stalak, dessiné', set: RUE, chars: [CH('maya', 1, 800, 1846, 1200, 'frime', P.phone(580, 1130)), LI(300, 1846, 1200, 'panique')],
      over: () => phoneBig(stalakApp({ takes: [['superette', 'fierte'], ['rue', 'frime'], ['superette', 'colere']], count: 3, ti: -1, word: 'prises' }), 0.92) + sub(1, 'maya', "Un vrai clip, c'est pas la caméra, c'est le montage. Tu te filmes trois fois au téléphone, et Stalak coupe sur le rythme.") },
    { t: '0:53', cap: 'Les prises : Deuce filme avec le téléphone de Liam', set: RUE, rap: 'liam', rapFrom: 0.2, chars: [CH('deuce', 1, 820, 1846, 1150, 'fierte', P.phoneBack(580, 1130)), LI(380, 1846, 1220, 'fierte')],
      over: () => clap(840, 330, 2) },
    { t: '0:57', cap: 'Stalak monte le clip sur le temps', set: RUE, chars: [CH('maya', 1, 830, 1846, 1150, 'fierte'), CH('deuce', 1, 250, 1846, 1100, 'fierte'), LI(540, 1846, 1200, 'fierte', P.phone(606, 760), { pose: { raise: 'r' } })],
      over: () => phoneBig(stalakApp({ takes: [['superette', 'fierte'], ['rue', 'frime'], ['superette', 'colere']], count: 3, ti: 2.2, sticker: 'hype', dl: 2.7, wm: true, word: 'prises' }), 0.92) + sub(1, 'narrateur', 'Trois prises au téléphone, Stalak monte sur le rythme, et les baskets de Liam sont sauvées.') },
    { t: '1:01', cap: 'Il publie : « Tu filmes avec quoi ? »', set: RUE, chars: [LI(540, 1846, 1250, 'fierte', P.phone(606, 760), { pose: { raise: 'r' } })],
      over: () => phoneBig(posted(clipPic('superette'), 'Mon nouveau clip', 'lina.wav', 'Tu filmes avec quoi ?', '#2f8f6a', 3), 0.92) + sub(1, 'liam', 'Avec une caméra de pro, évidemment.') },
    { t: '1:06', cap: 'Liam parle à celui qui regarde', set: RUE, zoom: [540, 1150, 1.3], chars: [LI(540, 2730, 2250, 'frime')],
      over: () => sub(1, 'liam', "Avant de casser ta tirelire au Black Friday : ton téléphone suffit. Stalak monte tes prises sur le rythme, et c'est gratuit.") },
    { t: '1:14', cap: 'La carte de fin : « Le nuage de farine »', plain: true, over: () => endCard('IL A TOURNÉ SON DROP\nDANS UN NUAGE DE FARINE') }, // 18/11 : 4 even lines (« … SON DROP DANS UN / … » ended a line with « UN »)
  ], "Sort le 23/11 à 18 h. La cuisine le soir (au lieu du salon), puis la rue l'après-midi.");

  // ---------------- épisode 15 (22/11, 21 h) : « Les effets spéciaux » ----------------
  const E15 = 'IL A TOURNÉ SON DROP DANS UN NUAGE DE FARINE';
  // a seeded random : the same picture at every render
  const rnd = (seed) => { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  // flour on someone, in frame coordinates (his feet x, y and his height h) : white dust all over him
  function flourDust(x, y, h, seed = 7, n = 46) {
    const r = rnd(seed); let s = '<g opacity="0.85">';
    for (let i = 0; i < n; i++) { const px = x + (r() - 0.5) * h * 0.42, py = y - h * (0.04 + 0.9 * r()), rr = (4 + r() * 12) * h / 1200; s += `<circle cx="${px.toFixed(0)}" cy="${py.toFixed(0)}" r="${rr.toFixed(1)}" fill="#ffffff"/>`; }
    return s + '</g>';
  }
  // the flour in the air, in the set's coordinates : the sun ray from the window (380-710 × 430-850), big soft puffs, and
  // dust slowly falling through the ray
  function flourCloud(seed = 3) {
    const r = rnd(seed);
    let s = `<path d="M 410 470 L 700 470 L 1080 1380 L 1080 1920 L 640 1920 Z" fill="#fff3cc" opacity="0.2"/>`;
    for (let i = 0; i < 8; i++) s += `<ellipse cx="${(160 + r() * 760).toFixed(0)}" cy="${(700 + r() * 900).toFixed(0)}" rx="${(110 + r() * 150).toFixed(0)}" ry="${(70 + r() * 90).toFixed(0)}" fill="#ffffff" opacity="${(0.1 + r() * 0.1).toFixed(2)}"/>`;
    for (let i = 0; i < 44; i++) {
      const px = (80 + r() * 920).toFixed(0), py = (520 + r() * 1150).toFixed(0), dx = ((r() - 0.5) * 30).toFixed(0), t0 = (r() * 0.8).toFixed(2);
      s += K({ path: [[+t0, 0, -40], [+t0 + 4, +dx, 150]] }, `<circle cx="${px}" cy="${py}" r="${(2.5 + r() * 5).toFixed(1)}" fill="#ffffff" opacity="0.9"/>`);
    }
    return s;
  }
  // the kitchen floor, white with flour (in the set's coordinates, under the characters)
  function flourMess(seed = 11) {
    const r = rnd(seed); let s = '<g opacity="0.9">';
    for (let i = 0; i < 16; i++) s += `<ellipse cx="${(40 + r() * 1000).toFixed(0)}" cy="${(1560 + r() * 340).toFixed(0)}" rx="${(50 + r() * 120).toFixed(0)}" ry="${(12 + r() * 24).toFixed(0)}" fill="#ffffff"/>`;
    return s + '</g>';
  }
  // the empty bag of flour (no brand), in a character's own coordinates
  const flourBag = (x, y, r = -24) => `<g transform="translate(${x} ${y}) rotate(${r})"><path d="M -80 -126 L 80 -126 L 96 130 L -96 130 Z" fill="#f4efe2" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>` +
    `<path d="M -80 -126 L -62 -168 L -22 -138 L 18 -172 L 58 -140 L 80 -126" fill="#f4efe2" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>${T(0, 16, 'FARINE', 42, INK)}<path d="M -42 64 q 42 -30 84 0" fill="none" stroke="#d9a86e" stroke-width="8" stroke-linecap="round"/></g>`;
  // a broom standing on the floor, held at the hand (in a character's own coordinates)
  const broom = (x = 600, top = 560, foot = 1760, lean = 40) => `<path d="M ${x} ${top} L ${x + lean} ${foot - 96}" stroke="${INK}" stroke-width="24" stroke-linecap="round"/><path d="M ${x} ${top} L ${x + lean} ${foot - 96}" stroke="#c48a52" stroke-width="12" stroke-linecap="round"/>` +
    `<path d="M ${x + lean - 92} ${foot} L ${x + lean - 58} ${foot - 104} L ${x + lean + 58} ${foot - 104} L ${x + lean + 92} ${foot} Z" fill="#e8c35a" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>` +
    [-56, -28, 0, 28, 56].map(d => `<path d="M ${x + lean + d * 0.7} ${foot - 90} L ${x + lean + d} ${foot - 8}" stroke="#b8902c" stroke-width="5"/>`).join('');
  // Nadia's bag on her shoulder (in her own coordinates)
  // 19/11, contact sheet : the long strap started on Nadia's face (a dark line across it) ; a short handle above the bag instead
  const handbag = (x = 640, y = 1060) => `<path d="M ${x - 56} ${y - 70} Q ${x} ${y - 165} ${x + 56} ${y - 70}" fill="none" stroke="${INK}" stroke-width="12" stroke-linecap="round"/>` +
    `<rect x="${x - 92}" y="${y - 72}" width="184" height="150" rx="26" fill="#8a3f5c" stroke="${INK}" stroke-width="8"/><rect x="${x - 40}" y="${y - 42}" width="80" height="20" rx="8" fill="#ffd34d" stroke="${INK}" stroke-width="4"/>`;
  // the take on Deuce's phone : the drop comes… and the picture turns white (18/11 : at 1.85 s, on Deuce's « boum »)
  function dropScreen() {
    const id = 'dr' + (++UID);
    let s = `<rect width="560" height="1000" fill="#0f1116"/>` + T(280, 76, 'Prise 1', 36, SNOW, { font: 'Rubik', weight: 800 });
    s += `<clipPath id="${id}"><rect x="20" y="110" width="520" height="650" rx="18"/></clipPath><g clip-path="url(#${id})"><g transform="translate(20 110) scale(1 1.625)">${takeScene('vaisselle')}</g>${liamBust('fierte', 280, 210, 900, '', false)}` +
      K({ in: 1.85 }, `<rect x="20" y="110" width="520" height="650" fill="#ffffff"/><g opacity="0.13">${liamBust('panique', 280, 210, 900, '', false)}</g>` + [[150, 300, 90], [380, 260, 110], [260, 520, 130], [440, 620, 80]].map(([cx, cy, rr]) => `<circle cx="${cx}" cy="${cy}" r="${rr}" fill="#f4f6f9" stroke="#dfe3ea" stroke-width="6"/>`).join('')) + '</g>';
    s += `<rect x="20" y="110" width="520" height="650" rx="18" fill="none" stroke="${INK}" stroke-width="6"/>`;
    s += `<rect x="40" y="806" width="480" height="14" rx="7" fill="#3a3f4c"/><rect x="40" y="806" width="300" height="14" rx="7" fill="${BLUE}"/><circle cx="340" cy="813" r="17" fill="${SNOW}" stroke="${INK}" stroke-width="4"/>`;
    return s + `<rect x="286" y="842" width="108" height="46" rx="12" fill="#e5484d" stroke="${INK}" stroke-width="4"/>` + T(340, 875, 'DROP', 28, SNOW);
  }
  const FLOUR = (x, y, h, seed) => ({ flour: true, after: flourDust(x, y, h, seed) });
  const NERVEUX = [['Coupes', ['Auto', 'Sur les mots', 'Par mesure'], 0], ['Rythme', ['Posé', 'Normal', 'Nerveux'], 2], ['Effets', ['Aucun', 'Sobre', 'Intense'], 1]];
  const DROP_TAKES = [['vaisselle', 'fierte'], ['frigo', 'frime'], ['vaisselle', 'colere']];
  ep('ep15', E15, 15, [
    { t: '0:00', cap: "L'accroche : Liam, blanc de farine", set: KITCHEN, criY: 700, setOver: () => flourMess(), front: () => flourCloud(), chars: [CH('deuce', 1, 850, 1700, 900, 'frime', flourBag(600, 1100)), LI(520, 2450, 1800, 'colere', '', FLOUR(520, 2450, 1800, 7))],
      over: () => bandeau(2, E15, 15) + FRAME.cri('liam', `Pourquoi t'as lancé de la farine pendant mon drop${NB}?!`, 700) },
    { t: '0:02', cap: 'Deuce, très calme', set: KITCHEN, setOver: () => flourMess(), front: () => flourCloud(5), chars: [LI(300, 1846, 1200, 'colere', '', FLOUR(300, 1846, 1200, 5)), CH('deuce', 1, 770, 1846, 1150, 'frime', flourBag(600, 1100))],
      over: () => bandeau(2, E15, 15).replace('class="bandeau"', 'class="bandeau" data-cont="1"') + sub(1, 'deuce', "C'est un effet spécial. Dans les vrais clips, il y a de la fumée sur le drop.") },
    { t: '0:07', cap: 'Le narrateur présente Liam et Deuce', set: KITCHEN, setOver: () => flourMess(), chars: [LI(300, 1846, 1200, 'frime', '', FLOUR(300, 1846, 1200, 5)), CH('deuce', 1, 770, 1846, 1150, 'fierte', flourBag(600, 1100))],
      over: () => tag('LIAM, ALIAS T-CRAZY', 300, 560, -3) + tag('DEUCE, SON MANAGER', 770, 600, 3) + sub(1, 'narrateur', "Voici Liam. 15 ans. Zéro abonné. Et voici Deuce, son manager. Le drop, c'est le moment où le son explose : Deuce voulait que ça se voie.") },
    { t: '0:15', cap: 'La prise : au drop, tout devient blanc', set: KITCHEN, setOver: () => flourMess(), chars: [LI(300, 1846, 1200, 'panique', '', FLOUR(300, 1846, 1200, 5)), CH('deuce', 1, 770, 1846, 1150, 'fierte', P.phone(580, 1130))],
      over: () => phoneBig(dropScreen(), 0.92) + sub(1, 'deuce', 'Regarde : le drop arrive, et… boum !') },
    { t: '0:21', cap: "Nadia rentre et s'arrête net", set: KITCHEN, setOver: () => flourMess(), chars: [LI(540, 1846, 1200, 'panique', '', FLOUR(540, 1846, 1200, 9)), CH('deuce', 1, 860, 1846, 1150, 'frime', flourBag(600, 1100)), CH('nadia', 2, 200, 1856, 1250, 'colere', handbag(), { k: { walk: [[0, -520, 0], [1.6, 0, 0]] } })],
      over: () => tag('NADIA, SA MÈRE', 200, 520, -3) + sub(1, 'nadia', 'Bonsoir… Pourquoi ma cuisine est blanche ?') },
    { t: '0:27', cap: 'Nadia tend un balai à chacun', set: KITCHEN, setOver: () => flourMess(), chars: [LI(540, 1846, 1200, 'panique', '', FLOUR(540, 1846, 1200, 9)), CH('deuce', 1, 860, 1846, 1150, 'panique'), CH('nadia', 2, 200, 1856, 1250, 'frime', broom(560, 520, 1760, -30) + broom(640, 540, 1760, 30))],
      over: () => sub(1, 'nadia', 'Alors la direction artistique va passer le balai.') },
    { t: '0:31', cap: 'Une heure plus tard : la cuisine est propre', set: KITCHEN_N, chars: [LI(330, 1846, 1200, 'panique', broom(600, 620, 1760, 50)), CH('deuce', 1, 760, 1846, 1150, 'panique', broom(560, 640, 1760, -50))],
      over: () => carton('UNE HEURE PLUS TARD · LA CUISINE') },
    { t: '0:34', cap: 'Deuce a une autre idée', set: KITCHEN_N, chars: [LI(330, 1846, 1200, 'colere', broom(600, 620, 1760, 50)), CH('deuce', 1, 760, 1846, 1150, 'fierte', broom(560, 640, 1760, -50))],
      over: () => sub(1, 'deuce', "Pour le prochain clip, j'ai pensé aux confettis.") },
    { t: '0:38', cap: 'Maya arrive en marchant et dit bonjour', set: KITCHEN_N, chars: [CH('deuce', 1, 230, 1846, 1100, 'frime'), LI(510, 1846, 1200, 'frime'), CH('maya', 1, 840, 1846, 1150, 'frime', P.phone(580, 1130), { k: { walk: [[0.2, 640, 0], [2.0, 0, 0]] } })],
      over: () => tag('MAYA, LA VOISINE', 840, 600, 3) + sub(1, 'maya', "Salut. Il paraît que t'as tourné un clip dans la farine ?") },
    { t: '0:43', cap: 'Stalak, en « Nerveux »', set: KITCHEN_N, chars: [CH('maya', 1, 800, 1846, 1200, 'frime', P.phone(580, 1130)), LI(300, 1846, 1200, 'panique')],
      over: () => phoneBig(stalakApp({ takes: DROP_TAKES, count: 3, ti: -1, rows: NERVEUX, word: 'prises' }), 0.92) + sub(1, 'maya', "Pour qu'un drop claque, il faut que ça coupe pile sur le temps. Et Stalak, en “Nerveux”, coupe jusqu'à chaque temps.") },
    { t: '0:53', cap: 'Les prises : Deuce mime la farine', set: KITCHEN_N, rap: 'liam', rapFrom: 0.2, chars: [CH('deuce', 1, 800, 1846, 1150, 'fierte', `<path d="M 640 1010 q 70 -90 170 -70 M 660 1080 q 90 -60 190 -20" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round" stroke-dasharray="16 14"/>`), LI(380, 1846, 1220, 'fierte')],
      over: () => clap(840, 330, 2) },
    { t: '0:57', cap: 'Stalak monte le clip : au drop, une prise par temps', set: KITCHEN_N, chars: [CH('maya', 1, 830, 1846, 1150, 'fierte'), CH('deuce', 1, 250, 1846, 1100, 'fierte'), LI(540, 1846, 1200, 'fierte', P.phone(606, 760), { pose: { raise: 'r' } })],
      over: () => phoneBig(stalakApp({ takes: DROP_TAKES, count: 3, ti: 2.2, sticker: 'hype', dl: 2.7, wm: true, word: 'prises', rows: NERVEUX }), 0.92) + sub(1, 'narrateur', "Au drop, Stalak passe d'une prise à l'autre à chaque temps. Ça explose, et la cuisine reste propre.") },
    { t: '1:01', cap: 'Il publie : un inconnu adore le drop', set: KITCHEN_N, chars: [LI(540, 1846, 1250, 'fierte', P.phone(606, 760), { pose: { raise: 'r' } })],
      over: () => phoneBig(posted(clipPic('frigo', 'fierte'), 'Mon drop, sans farine', 'sami.beats', 'Le drop 🔥🔥', '#d9822b', 5), 0.92) + sub(1, 'deuce', "Tu vois ? Mon idée de farine, c'était presque ça.") },
    { t: '1:06', cap: 'Liam parle à celui qui regarde', set: KITCHEN_N, zoom: [540, 1150, 1.3], chars: [LI(540, 2730, 2250, 'frime')],
      over: () => sub(1, 'liam', 'Tu veux que ton drop explose, toi aussi ? Pas besoin de farine : filme plusieurs prises, et Stalak coupe sur le rythme.') },
    { t: '1:14', cap: 'La carte de fin : « Prochain épisode : bientôt » (son choix du 18/11)', plain: true, over: () => endCard('BIENTÔT') },
  ], "Sort le 23/11 à 21 h. La cuisine en fin d'après-midi, puis le soir, une fois rangée.");

  // ---------------- « BONNE IDÉE VS MAUVAISE IDÉE » (owner, 20/11) : the Stalak part, the last 20 to 22 s, the same in every video.
  // Big Mo stands on the left of the set of the video, the set darkened behind him ; tools/serie/stalak_part.py lays over it the
  // phone with the owner's real iPhone recordings of stalak.app, the steps, the store card and Big Mo's words (HyperFrames).
  // One frame per set : 01 the kitchen in the evening, 02 the bedroom, 03 the street, 04 the roof, 05 the kitchen in the morning, 06 the court.
  const DIMSET = (k) => () => `<rect width="1080" height="1920" fill="${INK}" opacity="${k}"/>`;
  ep('bima-stalak', 'STALAK', 0, [KITCHEN_N, ROOM, STREET, ROOF, KITCHEN, TERRAIN].map((set, i) => (
    { t: '0:00', cap: 'La partie Stalak : Big Mo et son téléphone (' + set[0] + ', ' + set[2] + ')', set, setOver: DIMSET(0.42), chars: [CH('bigmo', 1, 215, 1846, 1300, 'frime')] })));

  // ---------------- the thumbnails (TikTok cover), one per episode, in the style of the validated example (frame.js) ----------------
  const thumb = (set, chars, title, num, extra = '') => ({ set, chars, over: () => extra + `<g transform="translate(0 120)">${bandeau(2, title, num)}</g>` });
  FRAMES['thumb-ep1'] = thumb(KITCHEN, [CH('nadia', 2, 790, 2760, 2300, 'colere', P.phone(580, 1130, '#ffe066')), LI(330, 3080, 2330, 'panique')], 'SA MÈRE A CRIÉ EN PLEINE PRISE', 1);
  FRAMES['thumb-ep2'] = thumb(ROOMN0, [LI(540, 3150, 2450, 'colere+cerne', HP)], 'IL A PASSÉ LA NUIT SUR SA VIDÉO DE PROMO', 2, `<rect width="1080" height="1920" fill="#57adff" opacity="0.10"/>`);
  FRAMES['thumb-ep4'] = thumb(ROOM, [LI(320, 3080, 2330, 'frime', HP), CH('deuce', 1, 790, 2900, 2350, 'panique')], GTA, 3);
  FRAMES['thumb-ep3'] = thumb(STREET, [CH('deuce', 1, 800, 2860, 2250, 'frime'), LI(330, 3000, 2330, 'colere', BAGS(4))], 'SON POTE S\'EST NOMMÉ SON MANAGER', 4);
  FRAMES['thumb-ep5'] = thumb(EVE, [CH('deuce', 1, 800, 2900, 2300, 'fierte', P.plant(600, 1080)), LI(330, 3000, 2330, 'panique')], 'IL VOULAIT UN CLIP COMME DANS GTA', 5);
  FRAMES['thumb-ep6'] = thumb(AFT, [CH('maya', 1, 800, 2900, 2300, 'frime'), LI(330, 3000, 2330, 'panique')], "TRILLER N'EST PLUS SUR L'APP STORE", 6);
  FRAMES['thumb-ep7'] = thumb(RUE, [LI(300, 3000, 2330, 'fierte'), CH('reyes', 1, 790, 2900, 2300, 'colere', TEE(450, 1190, 380))], E7, 7);
  FRAMES['thumb-ep8'] = thumb(RUE_NIGHT, [LI(540, 3150, 2450, 'panique')], E8, 8);
  FRAMES['thumb-ep9'] = thumb(KITCHEN_N, [LI(300, 3000, 2330, 'panique'), CH('nadia', 2, 790, 2900, 2300, 'colere', notebook(450, 1110, 420, -6))], E9, 9);
  FRAMES['thumb-ep10'] = thumb(ROOM_D, [LI(540, 3150, 2450, 'panique', P.phone(606, 760), { pose: { raise: 'r' } })], E10, 10);
  FRAMES['thumb-ep11'] = thumb(KITCHEN_N, [CH('deuce', 1, 800, 2900, 2300, 'panique'), SICK('panique', 330, 3000, 2330)], E11, 11);
  FRAMES['thumb-ep12'] = thumb(COURT_PM, [LI(300, 3000, 2330, 'fierte'), MO('colere', 790, 2900, 2300)], E12, 12);
  FRAMES['thumb-ep13'] = thumb(KITCHEN_N, [LI(320, 3000, 2330, 'frime'), CH('nadia', 2, 790, 2900, 2300, 'colere', fiche(450, 1170, 420, -5))], E13, 13);
  // 19/11 : the ad was held up by Liam behind Nadia's head (« BLACK FRIDAY » and « 900 € » half hidden) ; now Nadia holds it in front of her, as in the hook
  FRAMES['thumb-ep14'] = thumb(KITCHEN_N, [LI(320, 3000, 2330, 'fierte'), CH('nadia', 2, 790, 2900, 2300, 'colere', handPhone(bfAd(), 450, 1050, 0.26))], E14, 14);
  FRAMES['thumb-ep15'] = thumb(KITCHEN, [LI(540, 3150, 2450, 'colere', '', FLOUR(540, 3150, 2450, 7))], E15, 15, flourCloud());

  window.STORYBOARD = { BOARDS, P, band, hp, headAt, phoneBig, laptopBig, take, editor, clockBig, postScreen, winPhone, gallery, stalakApp, takeScene, liamBust, carton, knock, notif, comment, tag, endCard };
})();
