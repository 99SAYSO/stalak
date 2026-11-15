/* Studio Chambre — the engine (Marketing & croissance, 15/11/2026).
   window.seek(t) draws the frame at time t, from the episode's data (ep.json : voice lines, timings, subtitles)
   and the episode's choreography (episodes/<id>.js). No clock, no CSS animation : the same t gives the same picture. */
(function () {
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const seg = (t, a, b) => clamp((t - a) / ((b - a) || 1e-6), 0, 1);
  const E = {
    out: (x) => 1 - Math.pow(1 - x, 3), in: (x) => x * x * x,
    io: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
    expo: (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x)),
    back: (x) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
  };
  // damped spring step response, 0 → 1 after t0 (k stiffness, d damping)
  function spring(t, t0, k = 170, d = 18) {
    if (t <= t0) return 0;
    const x = t - t0, w0 = Math.sqrt(k), z = d / (2 * Math.sqrt(k));
    if (z < 1) { const wd = w0 * Math.sqrt(1 - z * z); return 1 - Math.exp(-z * w0 * x) * (Math.cos(wd * x) + (z * w0 / wd) * Math.sin(wd * x)); }
    return 1 - Math.exp(-w0 * x) * (1 + w0 * x);
  }
  function hash(n) { n = (n << 13) ^ n; return 1 - ((n * (n * n * 15731 + 789221) + 1376312589) & 0x7fffffff) / 1073741824; }
  function noise(t, seed) { const i = Math.floor(t), f = t - i, u = f * f * (3 - 2 * f); return hash(i + seed * 101) * (1 - u) + hash(i + 1 + seed * 101) * u; }
  // a blink every 2.5-4.5 s (deterministic), 0.12 s long
  function blink(t, seed = 1) {
    let tt = 0.8 + (hash(seed) + 1) * 0.7, i = 0;
    while (tt < t + 1 && i < 400) {
      if (t >= tt && t < tt + 0.13) { const k = (t - tt) / 0.13; return k < 0.5 ? k * 2 : (1 - k) * 2; }
      tt += 2.5 + (hash(seed * 7 + i) + 1) * 1.0; i++;
    }
    return 0;
  }

  // ---------- data helpers ----------
  const B = (D, name) => D.beats.find(b => b.name === name);
  function line(D, i) { return D.lines[i]; }
  // mouth opening (0..1) of `who` at time t, from the voice envelope (30 values per second)
  function mouth(D, who, t) {
    for (const L of D.lines) {
      if (L.who !== who || t < L.t0 || t > L.t1 + 0.05) continue;
      const i = Math.floor((t - L.t0) * D.fps);
      const e = L.env || [];
      const v = e.length ? (e[clamp(i, 0, e.length - 1)] || 0) : (0.55 + 0.45 * Math.sin(t * 22)) * (Math.sin(t * 7) > -0.3 ? 1 : 0);
      return clamp(v, 0, 1);
    }
    return 0;
  }
  function speaking(D, who, t) { return D.lines.some(L => L.who === who && t >= L.t0 && t <= L.t1); }

  // ---------- camera ----------
  // cam = {z, x, y, r} : zoom, centre of the view in world coordinates, rotation (deg) ; f = depth (1 = the character's plane)
  function layer(svg, f, cam) {
    const z = Math.pow(cam.z, f), cx = 540 + (cam.x - 540) * f, cy = 960 + (cam.y - 960) * f;
    return `<g transform="translate(540 960) rotate(${(cam.r || 0).toFixed(3)}) scale(${z.toFixed(4)}) translate(${(-cx).toFixed(2)} ${(-cy).toFixed(2)})">${svg}</g>`;
  }
  // camera keys [[t, z, x, y, r], …] with eased segments, zoom in log space
  function camAt(keys, t, ease = E.io) {
    if (t <= keys[0][0]) return { z: keys[0][1], x: keys[0][2], y: keys[0][3], r: keys[0][4] || 0 };
    for (let i = 0; i < keys.length - 1; i++) {
      const a = keys[i], b = keys[i + 1];
      if (t <= b[0]) {
        const k = ease(seg(t, a[0], b[0]));
        return { z: Math.exp(Math.log(a[1]) + (Math.log(b[1]) - Math.log(a[1])) * k), x: a[2] + (b[2] - a[2]) * k, y: a[3] + (b[3] - a[3]) * k, r: (a[4] || 0) + ((b[4] || 0) - (a[4] || 0)) * k };
      }
    }
    const l = keys[keys.length - 1];
    return { z: l[1], x: l[2], y: l[3], r: l[4] || 0 };
  }
  // a shake that dies out after t0
  function shake(cam, t, t0, amp = 22, dur = 0.45) {
    if (t < t0 || t > t0 + dur) return cam;
    const k = 1 - (t - t0) / dur;
    return Object.assign({}, cam, { x: cam.x + noise(t * 30, 3) * amp * k, y: cam.y + noise(t * 30, 9) * amp * k, r: (cam.r || 0) + noise(t * 25, 5) * 1.6 * k });
  }
  // gentle « beat punch » : +zoom on every beat, decaying
  function punch(t, bpm, t0, amt = 0.012) {
    if (t < t0) return 0;
    const beat = 60 / bpm, ph = ((t - t0) % beat) / beat;
    return amt * Math.exp(-ph * 6);
  }

  // ---------- text on screen (HTML, above the picture, inside the safe zone) ----------
  // who speaks : name on screen and colours (1 & 2 : the name tag ; 3 : the name on the navy bubble)
  const NAMES = { yanis: 'YANIS', narrateur: 'NARRATEUR', maman: 'MAMAN', banquise: 'BIG BANQUISE', mascotte: 'MASCOTTE' };
  const C1 = { yanis: '#1f6fd6', narrateur: '#0a0d14', maman: '#ff8a73', banquise: '#f5b931', mascotte: '#8fd3ff' };
  const DARK = { maman: 1, banquise: 1, mascotte: 1 };
  const C3 = { yanis: '#8fd3ff', narrateur: '#d6ecff', maman: '#ffb3a7', banquise: '#ffd666', mascotte: '#b8f0ff' };
  const COLORS = C1;
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  // the look chosen by the owner : 1 « carte givrée », 2 « glaçon », 3 « ruban bleu »
  const design = (D) => String((D && D.ui) || new URLSearchParams(location.search).get('ui') || '1');
  function icicles(w, seed) {
    let s = `<svg class="ice" width="${w}" height="64" viewBox="0 0 ${w} 64">`, x = 30, i = 0;
    while (x < w - 20) {
      const l = 24 + ((hash(seed * 13 + i) + 1) / 2) * 34;
      s += `<path d="M ${x - 15} 0 Q ${x} ${l.toFixed(1)} ${x + 15} 0 Z" fill="#d6ecff" stroke="#0a0d14" stroke-width="6" stroke-linejoin="round"/>`;
      x += 46 + ((hash(seed * 7 + i) + 1) / 2) * 60; i++;
    }
    return s + '</svg>';
  }
  // the banner with the episode title (it drops in, then flies away when the narrator starts at t1)
  function banner(D, t, t0, t1, ep, title) {
    if (t < t0 || t > t1 + 0.35) return '';
    const d = design(D), k = spring(t, t0, 300, 20), out = clamp((t - t1) / 0.35, 0, 1);
    const dy = (1 - Math.min(k, 1.15)) * -240 - E.in(out) * 520, sc = 0.86 + 0.14 * Math.min(k, 1.1);
    const inner = d === '1' ? `<div class="card"><div class="ep">${esc(ep)}</div><div class="ti">${esc(title)}</div>${icicles(840, 7)}</div>`
      : d === '2' ? `<div class="ep">${esc(ep)}</div><div class="slab"><div class="ti">${esc(title)}</div></div>`
        : `<div class="rib"><div class="ep">${esc(ep)}</div><div class="ti">${esc(title)}</div></div>`;
    return `<div class="bandeau d${d}" style="transform:translateX(-50%) translateY(${dy.toFixed(1)}px) scale(${sc.toFixed(3)})${d === '3' ? ' rotate(-2.5deg)' : ''}">${inner}</div>`;
  }
  // a name label (« YANIS », « alias LIL GIVRE »), popping in at t0
  function label(D, text, small, t, t0, t1, o = {}) {
    if (t < t0 || t > t1) return '';
    const d = design(D), k = spring(t, t0, 420, 22), out = clamp((t - (t1 - 0.15)) / 0.15, 0, 1);
    const body = `<b>${esc(text)}</b>${small ? `<i>${esc(small)}</i>` : ''}`;
    return `<div class="label d${d}" style="left:${o.x || 540}px;top:${o.y || 900}px;opacity:${(1 - out).toFixed(2)};transform:translate(-50%,-50%) rotate(${o.r == null ? -3 : o.r}deg) scale(${(0.5 + 0.5 * Math.min(k, 1.12)).toFixed(3)})">${d === '2' ? `<div class="slab">${body}</div>` : body}</div>`;
  }
  // subtitles : what is said, 2 to 5 words at a time, with the name of who speaks
  function subtitle(D, t) {
    const s = D.subs.find(x => t >= x.t0 && t < x.t1);
    if (!s) return '';
    const d = design(D), k = spring(t, s.t0, 520, 30);
    const who = NAMES[s.who] || String(s.who).toUpperCase(), dark = DARK[s.who] ? ' dark' : '';
    const tag = d === '2' ? `<span class="whow"><span class="who${dark}">${esc(who)}</span></span>` : `<span class="who${dark}">${esc(who)}</span>`;
    return `<div class="sub d${d}" style="--c:${C1[s.who] || '#1f6fd6'};--c3:${C3[s.who] || '#fdfeff'};transform:translate(-50%,0) scale(${(0.86 + 0.14 * Math.min(k, 1.05)).toFixed(3)});opacity:${Math.min(1, (t - s.t0) / 0.06).toFixed(2)}">${tag}<span class="tx">${esc(s.text)}</span></div>`;
  }
  // the hook / chapter title : words pop one after the other
  function title(text, t, t0, t1, o = {}) {
    if (t < t0 || t > t1) return '';
    const words = text.split(' ');
    const out = Math.min(1, Math.max(0, (t - (t1 - 0.22)) / 0.22));
    const html = words.map((w, i) => {
      const k = spring(t, t0 + i * 0.07, 380, 22);
      return `<span style="display:inline-block;transform:translateY(${((1 - k) * 60).toFixed(1)}px) scale(${(0.6 + 0.4 * Math.min(1.15, k)).toFixed(3)});opacity:${Math.min(1, k * 1.6).toFixed(2)}">${esc(w)}</span>`;
    }).join(' ');
    return `<div class="title ${o.cls || ''}" style="top:${o.y || 230}px;opacity:${(1 - out).toFixed(2)};transform:translate(-50%,${(-out * 40).toFixed(1)}px)">${html}</div>`;
  }
  // a stamp (« PRISE 1 », « 3 H 47 ») : slams in
  function stamp(text, t, t0, t1, o = {}) {
    if (t < t0 || t > t1) return '';
    const k = spring(t, t0, 600, 26);
    const sc = 1.8 - 0.8 * k;
    return `<div class="stamp ${o.cls || ''}" style="left:${o.x || 540}px;top:${o.y || 420}px;transform:translate(-50%,-50%) rotate(${o.r || -6}deg) scale(${sc.toFixed(3)});opacity:${Math.min(1, (t - t0) / 0.05).toFixed(2)}">${esc(text)}</div>`;
  }
  // the 3 steps of Stalak, one per line
  function steps(list, t, o = {}) {
    return `<div class="steps" style="top:${o.y || 210}px">` + list.map(([txt, t0], i) => {
      if (t < t0) return '';
      const k = spring(t, t0, 420, 26);
      return `<div class="step" style="transform:translateX(${((1 - k) * -80).toFixed(1)}px);opacity:${Math.min(1, k * 1.5).toFixed(2)}"><b>${i + 1}</b>${esc(txt)}</div>`;
    }).join('') + `</div>`;
  }
  const WATERMARK = `<img class="wm" src="/site_src/icons/watermark.svg" alt="">`;
  const flash = (t, t0, dur = 0.12) => (t >= t0 && t < t0 + dur ? `<div class="flash" style="opacity:${(1 - (t - t0) / dur).toFixed(2)}"></div>` : '');

  window.PLAY = { clamp, seg, E, spring, noise, blink, B, line, mouth, speaking, layer, camAt, shake, punch, subtitle, banner, label, design, NAMES, title, stamp, steps, WATERMARK, flash, esc, COLORS };

  // ---------- boot ----------
  window.boot = async function () {
    const q = new URLSearchParams(location.search);
    const D = window.__DATA || await (await fetch(q.get('data'))).json();
    window.D = D;
    const imgs = [...new Set((D.preload || []))];
    await Promise.all(imgs.map(src => new Promise(r => { const i = new Image(); i.onload = i.onerror = r; i.src = src; })));
    await document.fonts.ready;
    const stage = document.getElementById('stage'), ui = document.getElementById('ui');
    window.seek = function (t) {
      const r = window.EPISODE.frame(t, D);
      stage.innerHTML = `<defs>${PERSO.DEFS}${typeof EXTRA_DEFS !== 'undefined' ? EXTRA_DEFS : ''}</defs>` + r.svg;
      ui.innerHTML = (r.ui || '') + subtitle(D, t) + (r.noWatermark ? '' : WATERMARK);
      return true;
    };
    window.seek(0);
    window.ready = true;
  };
})();
