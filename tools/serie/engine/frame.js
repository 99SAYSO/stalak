/* Série « T-Crazy » — a frame of the series (1080 × 1920) : a set, the characters, and the on-screen dressing.
   The dressing : the banner with the episode title (in capitals, during the hook ; it goes away when the narrator speaks)
   and the subtitles with the speaker's name next to the text (owner's rules of 15/11). 3 versions of each, and 3 series logos.
   Everything stays in the zone TikTok, Reels and Shorts leave visible : not in the top 8 %, not in the bottom 20 %,
   not on the right edge between 35 % and 80 % of the height. (Marketing & croissance, 16/11/2026) */
(function () {
  const INK = '#0a0d14', BLUE = '#1f6fd6', ICE = '#d6ecff', NIGHT = '#0e3f8f', SNOW = '#fdfeff';
  // the speaker's colour, for the name next to the subtitle
  const WHO = { liam: ['LIAM', BLUE], nadia: ['NADIA', '#7d55c7'], deuce: ['DEUCE', '#23845a'], maya: ['MAYA', '#c94f84'], bigmo: ['BIG MO', '#c98a06'], reyes: ['M. REYES', '#c63d33'], narrateur: ['NARRATEUR', INK] };
  const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const cv = document.createElement('canvas').getContext('2d');
  // split on plain spaces only : a non-breaking space keeps « ! » and « ? » with their word. French punctuation is glued to its
  // word here too (« ÉPISODE : », « fou ! »), and a « \n » in the text is a forced cut (« PROCHAIN ÉPISODE :\n » on its own line)
  const glue = (t) => String(t).replace(/ ([:;!?»])/g, ' $1').replace(/« /g, '« ');
  function wrap1(text, font, maxW) {
    cv.font = font;
    const out = [];
    let cur = '';
    text.split(' ').filter(Boolean).forEach(w => { const t = cur ? cur + ' ' + w : w; if (!cur || cv.measureText(t).width <= maxW) cur = t; else { out.push(cur); cur = w; } });
    return cur ? out.concat(cur) : out;
  }
  function wrap(text, font, maxW) { return glue(text).split('\n').flatMap(p => wrap1(p, font, maxW)); }
  // the subtitle cards and the titles (16/11, contact sheets) : never one word alone on a line (« GTA » / « 6. », « … EN PLEINE / PRISE »,
  // « SON POTE S'EST / NOMMÉ / SON MANAGER ») : the same number of lines as the plain wrap, all inside the width, the cuts chosen
  // so that the lines are as even as possible, and never after a small word (article, possessive, preposition, subject pronoun :
  // « … LA NUIT SUR / SA VIDÉO » → « … LA NUIT / SUR SA VIDÉO »)
  const SMALL = /^(de|du|des|le|la|les|un|une|à|et|ou|ton|ta|tes|son|sa|ses|mon|ma|mes|ce|cet|ces|cette|leur|leurs|en|au|aux|sur|dans|pour|par|avec|sans|chez|vers|je|tu|il|elle|on|ils|qui|que|ne|se|me|te|quelques|plusieurs|chaque|toute|toutes|tous)$/i;
  // 19/11, contact sheets : nor after a number, which stays with what it counts (« trois / prises », « vingt / personnes »,
  // « trois cent / soixante-quatre ») ; a number followed by its punctuation (« trois, ») can end a line
  const NUMW = /^(deux|trois|quatre|cinq|six|sept|huit|neuf|dix|onze|douze|treize|quatorze|quinze|seize|vingt|trente|quarante|cinquante|soixante|cent|cents|mille|\d+)$/i;
  const evenCache = new Map();
  function wrapEven(text, font, maxW) {
    const key = font + '|' + maxW + '|' + text;
    if (!evenCache.has(key)) evenCache.set(key, glue(text).split('\n').flatMap(p => even1(p, font, maxW)));
    return evenCache.get(key).slice();
  }
  function even1(text, font, maxW) {
    const L = wrap1(text, font, maxW), words = text.split(' ').filter(Boolean), n = L.length, m = words.length;
    let res = L;
    if (n >= 2 && m <= 24) {
      cv.font = font;
      const W = [];   // W[a][b] : the width of the words a … b-1 on one line
      for (let a = 0; a < m; a++) { W[a] = []; for (let b = a + 1; b <= m; b++) W[a][b] = cv.measureText(words.slice(a, b).join(' ')).width; }
      let best = null;
      const cuts = [];
      (function place(start, k) {   // k lines still to place, from the word « start »
        if (k === 1) {
          const lines = cuts.concat([[start, m]]), ws = lines.map(([a, b]) => W[a][b]);
          if (ws.some(w => w > maxW)) return;
          const mean = ws.reduce((s, w) => s + w, 0) / n;
          let cost = Math.sqrt(ws.reduce((s, w) => s + (w - mean) * (w - mean), 0) / n);
          // (a cut after a small word costs ; a cut after a full stop or a comma helps : « Le 19 novembre, / jour de la sortie… »)
          lines.slice(0, -1).forEach(([, b]) => { if (SMALL.test(words[b - 1]) || NUMW.test(words[b - 1])) cost += maxW * 0.3; else if (/[.,;:!?…]$/.test(words[b - 1])) cost -= maxW * 0.08; });
          if (!best || cost < best[0] - 0.01) best = [cost, lines];
          return;
        }
        for (let e = start + 1; e <= m - (k - 1); e++) { cuts.push([start, e]); place(e, k - 1); cuts.pop(); }
      })(0, n);
      if (best) res = best[1].map(([a, b]) => words.slice(a, b).join(' '));
    }
    return res;
  }
  const width = (text, font) => { cv.font = font; return cv.measureText(text).width; };
  const T = (x, y, t, size, fill, o = {}) => `<text x="${x}" y="${y}" text-anchor="${o.anchor || 'middle'}" font-family="${o.font || 'Lilita One'}"${o.weight ? ` font-weight="${o.weight}"` : ''} font-size="${size}" fill="${fill}"${o.stroke ? ` stroke="${o.stroke}" stroke-width="${o.sw}" paint-order="stroke" stroke-linejoin="round"` : ''}${o.ls ? ` letter-spacing="${o.ls}"` : ''}>${esc(t)}</text>`;
  const flake = (x, y, r, c, w = 4) => { let d = ''; for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 - Math.PI / 2, ux = Math.cos(a), uy = Math.sin(a); d += `M ${x} ${y} L ${(x + ux * r).toFixed(1)} ${(y + uy * r).toFixed(1)} `; [-1, 1].forEach(k => { const b = r * 0.6, c2 = Math.cos(a + k * 0.8), s2 = Math.sin(a + k * 0.8); d += `M ${(x + ux * b).toFixed(1)} ${(y + uy * b).toFixed(1)} l ${(c2 * r * 0.32).toFixed(1)} ${(s2 * r * 0.32).toFixed(1)} `; }); } return `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`; };
  // a hanging icicle under an edge
  const icicle = (cx, y, w, L, fill = ICE) => `<path d="M ${cx - w} ${y - 4} Q ${cx - w * 0.7} ${y + L * 0.55} ${cx} ${y + L} Q ${cx + w * 0.7} ${y + L * 0.55} ${cx + w} ${y - 4} Z" fill="${fill}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><path d="M ${cx - w * 0.35} ${y + 6} Q ${cx - w * 0.3} ${y + L * 0.4} ${cx - w * 0.08} ${y + L * 0.62}" fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity="0.9"/>`;
  // snow resting on a top edge, from x0 to x1
  const snowCap = (x0, x1, y, r = 20) => {
    let d = `M ${x0} ${y + 6}`, x = x0;
    let i = 0;
    while (x < x1) { const w = r * (1.6 + ((i * 37) % 7) / 10), nx = Math.min(x1, x + w); d += ` Q ${(x + nx) / 2} ${y - r * (0.9 + ((i * 53) % 5) / 10)} ${nx} ${y + 2}`; x = nx; i++; }
    d += ` L ${x1} ${y + 14} L ${x0} ${y + 14} Z`;
    return `<path d="${d}" fill="${SNOW}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`;
  };

  // ---------------- the banner : episode number and title, top of the screen ----------------
  // (16/11, contact sheets : the titles are cut like the subtitles, never one word alone on the last line :
  //  « SA MÈRE A CRIÉ / EN PLEINE PRISE », not « … EN PLEINE / PRISE » ; same number of lines, so the band keeps its height)
  function bandeau(style, title, ep) { return `<g class="bandeau">${bandeau0(style, title, ep)}</g>`; }
  function bandeau0(style, title, ep) {
    let s = '';
    if (style === 1) { // « La carte glacée » : the white Stalak card, thick ink outline, hard shadow, icicles under it
      const font = '66px "Lilita One"', lines = wrapEven(title, font, 820), x = 70, y = 196, w = 940, h = 64 + lines.length * 72;
      s += `<rect x="${x + 10}" y="${y + 12}" width="${w}" height="${h}" rx="28" fill="${INK}"/>`;
      [[0.1, 16, 58], [0.19, 12, 34], [0.47, 18, 70], [0.56, 11, 30], [0.79, 15, 52], [0.9, 12, 36]].forEach(([k, iw, L]) => { s += icicle(x + w * k, y + h, iw, L); });
      s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="28" fill="${SNOW}" stroke="${INK}" stroke-width="8"/>`;
      lines.forEach((ln, i) => { s += T(540, y + 86 + i * 72, ln, 66, INK); });
      s += `<g transform="rotate(-4 ${x + 150} ${y})"><rect x="${x + 28}" y="${y - 30}" width="244" height="54" rx="27" fill="${BLUE}" stroke="${INK}" stroke-width="6"/>${T(x + 150, y + 8, 'ÉPISODE ' + ep, 30, SNOW, { font: 'Rubik', weight: 800 })}</g>`;
    }
    if (style === 2) { // « La bande bleue » : a full-width blue band, a little tilted, snow on its top edge
      // 16/11 (owner) : the accents of the title (CRIÉ, MÈRE) must never touch the « ÉPISODE n » line above them
      const font = '74px "Lilita One"', lines = wrapEven(title, font, ep !== '' && ep != null ? 900 : 740), y = 206, top = (ep !== '' && ep != null) ? 152 : 136, h = top - 40 + lines.length * 80; // the end card's band : narrower, clear of the buttons on the right edge
      s += `<g transform="rotate(-2.5 540 ${y + h / 2})">`;
      s += `<rect x="-60" y="${y + 12}" width="1200" height="${h}" fill="${INK}"/><rect x="-60" y="${y}" width="1200" height="${h}" fill="${BLUE}" stroke="${INK}" stroke-width="10"/>`;
      s += snowCap(-60, 1140, y, 22);
      if (ep !== '' && ep != null) s += T(540, y + 58, 'ÉPISODE ' + ep, 28, ICE, { font: 'Rubik', weight: 800, ls: 3 });
      lines.forEach((ln, i) => { s += T(540, y + top + i * 80, ln, 74, SNOW, { stroke: INK, sw: 14 }); });
      s += flake(130, y + 52, 22, ICE, 5) + flake(950, y + 52, 22, ICE, 5);
      s += '</g>';
    }
    if (style === 3) { // « L'étiquette glace » : an ice ticket with notches, the episode in a night-blue stub, snow on top
      const font = '62px "Lilita One"', lines = wrapEven(title, font, 640), x = 80, y = 200, w = 920, h = 70 + lines.length * 68, sx = x + 170;
      s += `<g transform="rotate(1.5 540 ${y + h / 2})">`;
      const tk = (dx, dy) => `M ${x + dx} ${y + dy} L ${x + w + dx} ${y + dy} L ${x + w + dx} ${y + h / 2 - 24 + dy} A 24 24 0 0 0 ${x + w + dx} ${y + h / 2 + 24 + dy} L ${x + w + dx} ${y + h + dy} L ${x + dx} ${y + h + dy} L ${x + dx} ${y + h / 2 + 24 + dy} A 24 24 0 0 0 ${x + dx} ${y + h / 2 - 24 + dy} Z`;
      s += `<path d="${tk(9, 11)}" fill="${INK}"/><path d="${tk(0, 0)}" fill="${ICE}" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>`;
      s += `<clipPath id="stub"><path d="${tk(0, 0)}"/></clipPath><rect x="${x}" y="${y}" width="${sx - x}" height="${h}" fill="${NIGHT}" clip-path="url(#stub)"/>`;
      s += `<path d="M ${sx} ${y + 4} L ${sx} ${y + h - 4}" stroke="${INK}" stroke-width="5" stroke-dasharray="14 10"/>`;
      s += T((x + sx) / 2 + 6, y + h / 2 - 8, 'ÉP.', 34, ICE) + T((x + sx) / 2 + 6, y + h / 2 + 52, String(ep), 70, SNOW);
      lines.forEach((ln, i) => { s += T((sx + x + w) / 2, y + 82 + i * 68, ln, 62, NIGHT); });
      s += snowCap(sx + 60, sx + 520, y, 18);
      s += '</g>';
    }
    return s;
  }

  // ---------------- the subtitles : the speaker's name next to the text, above the bottom 20 % ----------------
  function sub(style, who, text, bottom = 1488) {
    if (FRAME.MUTE_SUB) return '';
    const [name, col] = WHO[who], cx = 500, maxW = 800;
    let s = '';
    if (style === 1) { // white card, ink outline, hard shadow ; the name in a coloured tab on its top-left corner
      const font = '800 44px Rubik';
      let lines = wrapEven(text, font, maxW - 60), cap = maxW;
      // 19/11, contact sheet of episode 12 : two lines with one word alone (« Commence / par la version gratuite : ») stay on one line
      // when the text fits a slightly wider card (at most 872 px, still clear of the buttons on the right edge)
      if (lines.length === 2 && lines.some(l => !l.includes(' ')) && width(glue(text), font) <= maxW) { lines = [glue(text)]; cap = maxW + 72; }
      const h = 54 + lines.length * 56, w = Math.min(cap, Math.max(...lines.map(l => width(l, font))) + 72), x = cx - w / 2, y = bottom - h;
      s += `<rect x="${x + 8}" y="${y + 10}" width="${w}" height="${h}" rx="22" fill="${INK}"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="22" fill="${SNOW}" stroke="${INK}" stroke-width="6"/>`;
      lines.forEach((ln, i) => { s += T(x + 36, y + 66 + i * 56, ln, 44, INK, { font: 'Rubik', weight: 800, anchor: 'start' }); });
      const nw = width(name, '34px "Lilita One"') + 44;
      s += `<g transform="rotate(-3 ${x + 20} ${y})"><rect x="${x + 18}" y="${y - 34}" width="${nw}" height="52" rx="26" fill="${col}" stroke="${INK}" stroke-width="5"/>${T(x + 18 + nw / 2, y + 4, name, 34, who === 'narrateur' ? ICE : SNOW)}</g>`;
    }
    if (style === 2) { // big white words with a thick ink outline ; the name above, in its colour
      const font = '900 48px Rubik', lines = wrap(text, font, maxW), y = bottom - lines.length * 60;
      s += T(cx, y - 18, name, 40, who === 'narrateur' ? ICE : col, { stroke: INK, sw: 10 });
      lines.forEach((ln, i) => { s += T(cx, y + 42 + i * 60, ln, 48, SNOW, { font: 'Rubik', weight: 900, stroke: INK, sw: 13 }); });
    }
    if (style === 3) { // night-blue box with an ice edge ; the name in a coloured pill at its top
      const font = '700 42px Rubik', lines = wrap(text, font, maxW - 60), h = 92 + lines.length * 54, w = Math.min(maxW, Math.max(...lines.map(l => width(l, font))) + 64), x = cx - w / 2, y = bottom - h;
      s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="26" fill="${NIGHT}" fill-opacity="0.93" stroke="${ICE}" stroke-width="4"/>`;
      const nw = width(name, '30px "Lilita One"') + 36;
      s += `<rect x="${x + 28}" y="${y + 18}" width="${nw}" height="44" rx="22" fill="${who === 'narrateur' ? ICE : col}"/>${T(x + 28 + nw / 2, y + 50, name, 30, who === 'narrateur' ? NIGHT : SNOW)}`;
      lines.forEach((ln, i) => { s += T(x + 32, y + 110 + i * 54, ln, 42, SNOW, { font: 'Rubik', weight: 700, anchor: 'start' }); });
    }
    return s;
  }

  // ---------------- the series logos (centred on 0 0, about 820 wide) ----------------
  function logo(style) {
    let s = '';
    if (style === 1) { // « T-CRAZY » : a round badge, ice on top, Liam's backwards cap sitting on it
      const R = 270;
      s += `<circle cx="14" cy="18" r="${R}" fill="${INK}"/><circle r="${R}" fill="${BLUE}"/>`;
      s += `<clipPath id="disc1"><circle r="${R}"/></clipPath><g clip-path="url(#disc1)">`;
      s += `<path d="M -300 -300 L 300 -300 L 300 -70 C 250 -66 236 -20 214 -26 C 194 -32 192 -96 150 -94 C 112 -92 116 -8 86 -12 C 58 -16 62 -84 20 -86 C -24 -88 -18 -30 -52 -30 C -84 -30 -82 -92 -122 -90 C -160 -88 -156 -20 -190 -24 C -222 -28 -228 -74 -300 -72 Z" fill="${ICE}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>`;
      s += `<path d="M -150 -200 q 40 -36 96 -44 M 120 -210 q 30 10 52 34" fill="none" stroke="#ffffff" stroke-width="12" stroke-linecap="round" opacity="0.9"/>`;
      s += `<circle r="${R - 24}" fill="none" stroke="${NIGHT}" stroke-width="5" stroke-dasharray="2 16" stroke-linecap="round" opacity="0.6"/>`;
      s += '</g>' + `<circle r="${R}" fill="none" stroke="${INK}" stroke-width="14"/>`;
      // Liam's snapback seen from the side (ice crown, flat blue brim, our embroidered snowflake), sitting on the badge
      s += `<g transform="translate(-8 ${-R + 26}) rotate(-12)"><path d="M -116 10 L -256 18 C -270 20 -270 38 -254 40 L -110 30 Z" fill="${BLUE}" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>` +
        `<path d="M -126 14 C -130 -64 -84 -128 0 -134 C 86 -136 132 -74 134 14 C 60 2 -50 2 -126 14 Z" fill="#e8f2ff" stroke="${INK}" stroke-width="8" stroke-linejoin="round"/>` +
        `<path d="M -70 -110 q -40 40 -44 112 M 4 -132 q 10 60 4 136" fill="none" stroke="#bfd4ee" stroke-width="5" stroke-linecap="round"/><path d="M -100 -40 q 18 -50 60 -76" fill="none" stroke="#ffffff" stroke-width="9" stroke-linecap="round"/>` +
        `<ellipse cx="0" cy="-136" rx="20" ry="9" fill="${BLUE}" stroke="${INK}" stroke-width="6"/>` + flake(64, -50, 22, BLUE, 5) + '</g>';
      s += `<g transform="rotate(-7)">${T(0, 90, 'T-CRAZY', 168, SNOW, { stroke: INK, sw: 22 })}</g>`;
      s += flake(-176, 176, 24, ICE, 5) + flake(184, 168, 18, ICE, 4);
      return { defs: '', svg: s };
    }
    if (style === 2) { // « LE PROCHAIN » : chunky letters with ice glaze dripping from the top, the hook line under it
      const W = 'PROCHAIN', y = 70, fs = 176;
      s += `<g transform="rotate(-4)">`;
      s += T(10, y + 14, W, fs, INK, { stroke: INK, sw: 24 });
      s += T(0, y, W, fs, BLUE, { stroke: INK, sw: 24 });
      s += `<clipPath id="pc2"><text x="0" y="${y}" text-anchor="middle" font-family="Lilita One" font-size="${fs}">${W}</text></clipPath>`;
      s += `<g clip-path="url(#pc2)"><path d="M -480 -200 L 480 -200 L 480 -12 C 446 -14 440 30 418 28 C 394 26 396 -22 360 -22 C 322 -22 330 46 296 44 C 266 42 270 -16 232 -16 C 196 -16 204 22 176 20 C 146 18 150 -24 112 -24 C 76 -24 82 54 50 52 C 20 50 24 -18 -14 -18 C -52 -18 -44 26 -74 24 C -102 22 -100 -22 -136 -22 C -174 -22 -166 40 -198 38 C -228 36 -226 -14 -262 -14 C -298 -14 -292 30 -322 28 C -352 26 -350 -20 -386 -18 C -420 -16 -428 20 -480 18 Z" fill="${SNOW}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`;
      s += `<path d="M -330 40 l 30 -8 M -60 44 l 40 -8 M 230 40 l 34 -8" stroke="#7fb2f0" stroke-width="10" stroke-linecap="round"/></g>`;
      s += `<g transform="rotate(-6 -250 -120)"><rect x="-372" y="-178" width="196" height="96" rx="48" fill="${BLUE}" stroke="${INK}" stroke-width="9"/>${T(-274, -105, 'LE', 74, SNOW)}</g>`;
      const star = (x, y2, r) => `<path d="M ${x} ${y2 - r} Q ${x + r * 0.18} ${y2 - r * 0.18} ${x + r} ${y2} Q ${x + r * 0.18} ${y2 + r * 0.18} ${x} ${y2 + r} Q ${x - r * 0.18} ${y2 + r * 0.18} ${x - r} ${y2} Q ${x - r * 0.18} ${y2 - r * 0.18} ${x} ${y2 - r} Z" fill="${SNOW}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`;
      s += star(372, -120, 38) + star(300, -168, 20) + star(-410, 30, 22);
      s += `<rect x="-250" y="${y + 66}" width="500" height="70" rx="35" fill="${ICE}" stroke="${INK}" stroke-width="7"/>${T(0, y + 116, '15 ANS · 0 ABONNÉ', 40, INK, { font: 'Rubik', weight: 800 })}`;
      s += '</g>';
      return { defs: '', svg: s };
    }
    if (style === 3) { // « 0 ABONNÉ » : a frozen « 0 », icicles hanging from it, « ABONNÉ » on a blue label across it
      const ring = (dx, dy) => `M ${-170 + dx} ${-250 + dy} A 180 250 0 1 0 ${-170 + dx} ${250 + dy} A 180 250 0 1 0 ${-170 + dx} ${-250 + dy} Z M ${-170 + dx} ${-140 + dy} A 76 140 0 1 1 ${-170 + dx} ${140 + dy} A 76 140 0 1 1 ${-170 + dx} ${-140 + dy} Z`;
      s += `<path d="${ring(14, 18)}" fill="${INK}" fill-rule="evenodd"/>`;
      [[-262, 196, 16, 54], [-200, 236, 13, 40], [-120, 232, 18, 74], [-62, 178, 12, 38]].forEach(([x, y, w, L]) => { s += icicle(x, y, w, L); });
      s += `<path d="${ring(0, 0)}" fill="${ICE}" fill-rule="evenodd" stroke="${INK}" stroke-width="14" stroke-linejoin="round"/>`;
      s += `<path d="M -300 -120 Q -310 -10 -286 90 M -248 -196 q 24 -24 52 -30" fill="none" stroke="#ffffff" stroke-width="14" stroke-linecap="round"/>`;
      s += `<path d="M -40 -150 L -70 -110 L -50 -92 L -86 -40" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
      s += `<g transform="rotate(-7 160 30)"><rect x="-40" y="-36" width="${470}" height="128" rx="20" fill="${INK}" transform="translate(10 12)"/><rect x="-40" y="-36" width="470" height="128" rx="20" fill="${BLUE}" stroke="${INK}" stroke-width="10"/>${T(195, 64, 'ABONNÉ', 104, SNOW, { stroke: INK, sw: 14 })}</g>`;
      s += flake(330, -170, 30, ICE, 6) + flake(250, 190, 20, ICE, 5) + flake(-380, -230, 22, ICE, 5);
      return { defs: '', svg: s };
    }
    return { defs: '', svg: '' };
  }

  // ---------------- a character, placed by its feet : x, y (feet), h (height in px) ----------------
  let CLIPN = 0;
  function who(c) {
    const fig = (e) => c.who === 'liam' ? LIAM.figure(c.v || 4, e, c.pose) : CAST.figure(c.who, c.v, e);
    const r = fig(c.expr);
    let defs = r.defs, figs = `<g class="fig">${r.svg}</g>`;
    if (FRAME.ANIM && !c.sil) { // the talking and blinking faces, hidden until the animation shows them
      const rT = fig(c.expr + '+parle'), rB = fig(c.expr + '+cligne');
      defs += rT.defs + rB.defs;
      figs += `<g class="figT" display="none">${rT.svg}</g><g class="figB" display="none">${rB.svg}</g>`;
    }
    const inner = figs + (c.props || ''); // props are drawn in the character's own coordinates ; only the figure is measured
    let svg = `<g data-place="${c.x} ${c.y} ${c.h}" data-who="${c.who}"><g>${c.flip ? `<g transform="scale(-1 1)">${inner}</g>` : inner}</g></g>`;
    // the lights (16/11, 19 h 32) : a soft shadow under the feet when they are in the picture
    // clip : [x, y, w, h] in frame coordinates (a character seen through a window) ; after : drawn over him, in frame coordinates
    // sil : an anonymous silhouette (followers in the background)
    // flour (17/11, « Les effets spéciaux ») : someone covered in flour from his cap to his shoes, every colour washed towards white, the lines still dark enough to read his face
    if (c.flour) { const id = 'flf' + (++CLIPN); defs += `<filter id="${id}"><feColorMatrix type="matrix" values="0.68 0 0 0 0.32  0 0.68 0 0 0.32  0 0 0.68 0 0.33  0 0 0 1 0"/></filter>`; svg = `<g filter="url(#${id})">${svg}</g>`; }
    // sodium (17/11, « Nuit à 17 h ») : under the orange street lamp, someone turns orange (the joke of take 2 : « Liam est tout orange »)
    if (c.sodium) { const id = 'sod' + (++CLIPN); defs += `<filter id="${id}"><feColorMatrix type="matrix" values="0.55 0.45 0.09 0 0.03  0.12 0.50 0.04 0 0.01  0.03 0.07 0.22 0 0  0 0 0 1 0"/></filter>`; svg = `<g filter="url(#${id})">${svg}</g>`; }
    if (c.sil) { defs += `<filter id="silf"><feFlood flood-color="#2a2d36"/><feComposite in2="SourceAlpha" operator="in"/></filter>`; svg = `<g filter="url(#silf)" opacity="0.92">${svg}</g>`; }
    if (c.clip) { const id = 'cc' + (++CLIPN); defs += `<clipPath id="${id}"><rect x="${c.clip[0]}" y="${c.clip[1]}" width="${c.clip[2]}" height="${c.clip[3]}"/></clipPath>`; svg = `<g clip-path="url(#${id})">${svg}</g>`; }
    else if (window.LIGHTS && c.y < 1960 && !c.noShadow) svg = LIGHTS.contact(c.x, c.y, c.h) + svg;
    // k : the character moves during the shot (anim.js kf : walk, path…), with his shadow
    if (c.k) svg = `<g data-k='${JSON.stringify(c.k)}'>${svg}</g>`;
    return { defs, svg: svg + (c.after || '') };
  }

  // ---------------- the frames shown on the boards ----------------
  const TITLE = 'LA VAISSELLE OU LA GLOIRE', EP = 1;
  const HOOK = ['nadia', 'T-Crazy mange pas si T-Crazy a pas fait la vaisselle !'];
  const NARR = ['narrateur', 'Voici Liam. 15 ans. Zéro abonné. Persuadé d\'être le prochain rappeur à percer.'];
  const FRAMES = {};
  [1, 2, 3].forEach(n => {
    FRAMES[`bandeau-${n}-accroche`] = { set: ['cuisine', 1, 'jour'], chars: [{ who: 'liam', v: 4, expr: 'panique', x: 330, y: 1846, h: 1170 }, { who: 'nadia', v: 2, expr: 'colere', x: 770, y: 1856, h: 1250 }], over: () => bandeau(n, TITLE, EP) + sub(n, ...HOOK) };
    FRAMES[`bandeau-${n}-narrateur`] = { set: ['cuisine', 1, 'jour'], chars: [{ who: 'liam', v: 4, expr: 'frime', x: 540, y: 1880, h: 1300 }], over: () => sub(n, ...NARR) };
  });
  // version 4, the owner's mix (16/11) : the title band of version 2, the subtitles of version 1
  FRAMES['bandeau-4-accroche'] = Object.assign({}, FRAMES['bandeau-1-accroche'], { over: () => bandeau(2, TITLE, EP) + sub(1, ...HOOK) });
  FRAMES['bandeau-4-narrateur'] = Object.assign({}, FRAMES['bandeau-1-narrateur'], { over: () => sub(1, ...NARR) });
  // the thumbnail (owner, 16/11 : made by Claude with each video, in the series' style) : the chosen title band, the faces big,
  // everything inside the centre 3:4 that the TikTok profile grid keeps (y 240 to 1680)
  FRAMES['miniature-exemple'] = { set: ['cuisine', 1, 'jour'], chars: [{ who: 'nadia', v: 2, expr: 'colere', x: 790, y: 2760, h: 2300 }, { who: 'liam', v: 4, expr: 'panique', x: 330, y: 3080, h: 2330 }],
    over: () => `<g transform="translate(0 120)">${bandeau(2, TITLE, EP)}</g>` };
  const COVERS = { 1: [['rue', 1, 'jour'], 'frime'], 2: [['toit', 2, 'soir'], 'fierte'], 3: [['terrain', 1, 'jour'], 'panique'] };
  [1, 2, 3].forEach(n => {
    FRAMES[`logo-${n}`] = { set: COVERS[n][0], chars: [{ who: 'liam', v: 4, expr: COVERS[n][1], x: 540, y: 3330, h: 2560 }], shade: true, logo: [n, 540, 505, 0.85] };
    FRAMES[`logo-${n}-seul`] = { plain: true, logo: [n, 540, 960, 1] };
  });

  function compose(id) {
    const F = FRAMES[id];
    let defs = '', body = '';
    if (F.plain) {
      defs += `<radialGradient id="bgp" cx="0.5" cy="0.5" r="0.6"><stop offset="0" stop-color="#3a86e8"/><stop offset="1" stop-color="${BLUE}"/></radialGradient>`;
      body += `<rect width="1080" height="1920" fill="url(#bgp)"/>`;
    }
    // the lights of the set at its hour (lights.js, 16/11 at 19 h 32) : `under` with the set, `over` on top of the characters
    const L = !F.plain && F.set && window.LIGHTS && !F.noLight ? LIGHTS.rig(...F.set) : null;
    if (F.plain) { /* the plain blue background above */ } else if (F.zoom) { // zoom : [cx, cy, k], the set seen closer around (cx, cy) ; never past its edges (16/11 : no empty band)
      const zk = F.zoom[2], zx = Math.min(Math.max(F.zoom[0], 540 / zk), 1080 - 540 / zk), zy = Math.min(Math.max(F.zoom[1], 960 / zk), 1920 - 960 / zk);
      F.zoomUsed = [zx, zy, zk];
      body += `<g transform="translate(540 960) scale(${zk}) translate(${-zx} ${-zy})">${DECORS.scene(...F.set)}${L ? L.under : ''}${F.setOver ? F.setOver() : ''}</g>`;
    } else {
      body += DECORS.scene(...F.set) + (L ? L.under : '') + (F.setOver ? F.setOver() : ''); // setOver : drawn on the set, in its own coordinates (a sign on a shop)
    }
    (F.chars || []).forEach(c => { const r = who(c); defs += r.defs; body += r.svg; });
    // front : drawn in the set's coordinates but over the characters (a sign stuck on the glass of a shop window)
    const inSet = (svg) => F.zoom ? `<g transform="translate(540 960) scale(${F.zoomUsed[2]}) translate(${-F.zoomUsed[0]} ${-F.zoomUsed[1]})">${svg}</g>` : svg;
    if (F.front) body += inSet(F.front());
    if (L) body += `<g class="lt-rig" data-amb="${L.amb}">${inSet(L.over)}</g>`;
    if (F.shade) {
      defs += `<linearGradient id="topsh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${INK}" stop-opacity="0.55"/><stop offset="1" stop-color="${INK}" stop-opacity="0"/></linearGradient>`;
      body += `<rect width="1080" height="900" fill="url(#topsh)"/>`;
    }
    if (F.dim) body += `<rect width="1080" height="1920" fill="${INK}" opacity="${F.dim}"/>`;
    if (F.over) body += F.over();
    if (F.logo) { const [n, x, y, k] = F.logo, L = logo(n); defs += L.defs; body += `<g transform="translate(${x} ${y}) scale(${k})">${L.svg}</g>`; }
    return `<defs>${defs}</defs>${body}`;
  }

  // ---------------- the shout of the hook (owner, 16/11) : the opening shout has no subtitle card. The words themselves, big,
  // in the upper half of the screen, appear one by one as they are said ; then the subtitles come back. Only the hook :
  // every other line, even shouted, is a normal subtitle (owner, 16/11 at 16 h 34, « pas comme celui de l'intro »).
  // The speaker's name stays next to them (rule of 15/11). cy : the middle of the block. The character stays centred and
  // fully visible : the words may pass over him (owner, 16/11 at 16 h 32), so the block is kept short (2 lines when it fits).
  function criLayout(who, text, cy = 660) {
    const maxW = 840;
    let size = 104, font, lines;
    const fit = n => { for (const sz of [104, 92, 82]) { const f = `${sz}px "Lilita One"`, l = wrap(text, f, maxW); if (l.length <= n) return [sz, f, l]; } return null; };
    [size, font, lines] = fit(2) || fit(3) || [82, '82px "Lilita One"', wrap(text, '82px "Lilita One"', maxW)];
    const lh = Math.round(size * 1.08), sp = width(' ', font), top = cy - (lines.length * lh) / 2, words = [];
    lines.forEach((ln, li) => {
      let x = 500 - width(ln, font) / 2; // centred on x = 500 : clear of the buttons on the right edge
      ln.split(' ').forEach(w => { const ww = width(w, font); words.push({ w, x, y: top + (li + 1) * lh - 20, ww, size }); x += ww + sp; });
    });
    return { size, lh, top, cy, words, left: Math.min(...words.map(o => o.x)) };
  }
  // one word : an ink shadow, then white with a thick ink outline
  const criWord = (o) => T(o.x + 7, o.y + 9, o.w, o.size, INK, { anchor: 'start', stroke: INK, sw: 18 }) + T(o.x, o.y, o.w, o.size, SNOW, { anchor: 'start', stroke: INK, sw: 18 });
  function criName(who, L) {
    const [name, col] = WHO[who], nw = width(name, '34px "Lilita One"') + 44, x = L.left - 4, y = L.top - 14;
    return `<g transform="rotate(-4 ${x} ${y})"><rect x="${x}" y="${y - 34}" width="${nw}" height="52" rx="26" fill="${col}" stroke="${INK}" stroke-width="5"/>${T(x + nw / 2, y + 4, name, 34, who === 'narrateur' ? ICE : SNOW)}</g>`;
  }
  function cri(who, text, cy = 660) {
    if (FRAME.MUTE_SUB) return '';
    const L = criLayout(who, text, cy);
    return `<g transform="rotate(-3 500 ${cy})">${criName(who, L)}${L.words.map(criWord).join('')}</g>`;
  }

  window.FRAME = { compose, bandeau, sub, cri, criLayout, criWord, criName, wrap, width, logo, FRAMES, WHO, ANIM: false, MUTE_SUB: false };
})();
