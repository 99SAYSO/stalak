// LEVELS v2 : le haut de l'écran, la jauge HYPE, les bulles, la lumière, les cartons de fin.
// Tout est posé sur UNE timeline GSAP (pausée) que HyperFrames fait avancer image par image.
(function () {
  const D = window.__DATA, DUR = D.duration, $ = id => document.getElementById(id);
  const tl = gsap.timeline({ paused: true });
  const RED = '#e5484d', GREEN = '#2fb36b', GOLD = '#ffc93c', ORANGE = '#ff9f43';
  const col = v => v >= 0.999 ? GOLD : v > 0.5 ? GREEN : v > 0.2 ? ORANGE : RED;
  const show = (el, a, b, from) => { // visible de a à b, avec une petite entrée et sortie
    if (a <= 0) { gsap.set(el, { autoAlpha: 1 }); if (b < DUR) tl.to(el, { autoAlpha: 0, duration: 0.15 }, b - 0.15); return; } // dès la 1re image
    tl.fromTo(el, Object.assign({ autoAlpha: 0 }, from || { y: 18 }), { autoAlpha: 1, y: 0, x: 0, scale: 1, duration: 0.25, ease: 'back.out(2)', immediateRender: false }, a);
    if (b < DUR) tl.to(el, { autoAlpha: 0, duration: 0.15 }, b - 0.15);
  };

  // ---- les définitions SVG (dégradés, flous) de l'ancien moteur, sans son décor
  $('defs').innerHTML = decorSVG().split('<rect width="1080" height="1920" fill="#0d1328"/>')[0];

  // ---- le titre (tout blanc) et les 5 chiffres
  $('title').innerHTML = D.title.join('<br>');
  const nums = [];
  for (let i = 1; i <= 5; i++) { const n = document.createElement('div'); n.className = 'num'; n.textContent = i; $('nums').appendChild(n); nums.push(n); }
  D.levels.forEach(L => {
    nums.forEach((n, i) => {
      const k = i + 1, st = k < L.n ? 'ko' : k === L.n ? 'cur' : '';
      tl.set(n, { backgroundColor: st === 'ko' ? RED : st === 'cur' ? '#ffffff' : 'rgba(0,0,0,0)', color: st === 'cur' ? '#0b0e1a' : '#ffffff' }, L.t0);
    });
    tl.fromTo(nums[L.n - 1], { scale: 1.35 }, { scale: 1, duration: 0.35, ease: 'back.out(3)', immediateRender: false }, L.t0);
    // la phrase sous les chiffres : ce qui ne va pas (✗) ou le point fort (✓)
    const lab = document.createElement('div'); lab.className = 'lab abs';
    lab.style.color = L.ok ? '#4fd88a' : '#ff6b70'; lab.textContent = (L.ok ? '✓ ' : '✗ ') + D.labels[L.n - 1];
    $('labs').appendChild(lab); show(lab, L.t0, L.t1 >= D.levels[D.levels.length - 1].t1 ? DUR + 1 : L.t1, { y: 14, scale: 0.9 });
    // éclair + coup de lumière à chaque nouveau niveau
    if (L.t0 > 0) {
      tl.fromTo('#flash', { opacity: 0.55 }, { opacity: 0, duration: 0.3, ease: 'power1.out', immediateRender: false }, L.t0);
      tl.fromTo('#leak', { x: 0, opacity: 0.9 }, { x: 1900, opacity: 0.2, duration: 0.9, ease: 'power1.inOut', immediateRender: false }, L.t0);
    }
  });
  nums[4].style.transformOrigin = '50% 50%';
  tl.set(nums[4], { backgroundColor: GREEN, color: '#ffffff' }, D.boom);
  tl.fromTo(nums[4], { scale: 1.5 }, { scale: 1, duration: 0.5, ease: 'elastic.out(1,0.4)', immediateRender: false }, D.boom);

  // ---- la jauge HYPE : elle monte après chaque phrase du rappeur, retombe à chaque échec
  const H = { v: D.hype[0].v };
  const paint = () => {
    const v = H.v; $('fill').style.width = Math.max(26, 766 * v) + 'px'; $('shine').style.width = Math.max(10, 740 * v) + 'px';
    $('fill').style.background = col(v); $('pct').textContent = Math.round(v * 100) + ' %'; $('pct').style.color = col(v);
  };
  paint();
  D.hype.forEach((h, i) => {
    if (i === 0) return;
    const up = h.v > D.hype[i - 1].v;
    tl.to(H, { v: h.v, duration: h.d, ease: up ? 'power2.out' : 'power3.in', onUpdate: paint }, h.t);
    if (up) tl.fromTo('#bar', { scale: 1 }, { scale: 1.06, duration: 0.12, yoyo: true, repeat: 1, ease: 'power1.out', immediateRender: false }, h.t);
    else tl.fromTo('#gauge', { x: 0 }, { x: 10, duration: 0.05, yoyo: true, repeat: 5, ease: 'none', immediateRender: false }, h.t + h.d * 0.8);
  });
  // le commentaire sarcastique sous la jauge (change quand l'humeur change)
  const cms = []; D.hype.forEach(h => { if (h.c && (!cms.length || cms[cms.length - 1].c !== h.c)) cms.push({ c: h.c, t: h.t }); });
  cms.forEach((c, i) => {
    const el = document.createElement('div'); el.className = 'cm abs'; el.textContent = c.c; $('cms').appendChild(el);
    if (c.c === 'là, ça donne envie') el.style.color = GOLD;
    show(el, i === 0 ? 0 : c.t, i + 1 < cms.length ? cms[i + 1].t : DUR + 1, i === 0 ? { y: 0 } : { y: 14 });
  });
  // niveau 4 : la jauge tremble, se décroche et lui tombe sur la tête
  const dr = D.drop;
  tl.fromTo('#gauge', { rotation: 0 }, { rotation: 3, duration: 0.06, yoyo: true, repeat: 5, ease: 'none', immediateRender: false }, dr.t0 - 0.36);
  tl.to('#gauge', { x: -170, y: 470, rotation: 17, duration: dr.t1 - dr.t0, ease: 'power2.in' }, dr.t0);
  tl.to('#gauge', { y: 430, rotation: 22, duration: 0.14, yoyo: true, repeat: 1, ease: 'power1.out' }, dr.t1);
  tl.set('#cracks', { autoAlpha: 1 }, dr.t1);
  tl.to('#gauge', { x: 0, y: 0, rotation: 0, duration: 0.55, ease: 'back.out(1.6)' }, dr.back);
  tl.set('#cracks', { autoAlpha: 0 }, D.levels[4].t0);
  // niveau 5 : elle se remplit et explose
  tl.fromTo('#glow', { opacity: 0 }, { opacity: 0.6, duration: 0.3, immediateRender: false }, D.boom - 0.3);
  tl.fromTo('#gauge', { scale: 1 }, { scale: 1.14, duration: 0.14, yoyo: true, repeat: 3, ease: 'power1.inOut', immediateRender: false }, D.boom);
  const PC = [GOLD, '#ff6b70', '#7fd3ff', '#ffffff', GREEN];
  for (let i = 0; i < 28; i++) {
    const p = document.createElement('div'); p.className = 'part'; p.style.background = PC[i % 5]; p.style.left = '740px'; p.style.top = '66px';
    if (i % 3 === 0) p.style.borderRadius = '50%';
    $('parts').appendChild(p);
    const a = (i / 28) * Math.PI * 2 + (i % 2) * 0.2, r = 160 + (i * 37) % 160;
    tl.fromTo(p, { x: 0, y: 0, opacity: 1, scale: 1.2, rotation: 0 }, { x: Math.cos(a) * r * 1.4, y: Math.sin(a) * r * 0.8 + 40, opacity: 0, scale: 0.4, rotation: 360, duration: 0.9, ease: 'power2.out', immediateRender: false }, D.boom);
  }

  // ---- les bulles : petit bruitage (dans le son), entrée et sortie animées
  const says = D.says;
  says.forEach((s, i) => {
    const b = s.bub, el = document.createElement('div'); el.className = 'bub' + (s.who === 'off' ? ' off' : '');
    el.style.left = b.x + 'px'; el.style.width = b.w + 'px';
    if (b.top !== undefined) el.style.top = b.top + 'px'; else el.style.bottom = (1920 - b.y) + 'px';
    el.innerHTML = esc(s.text);
    if (b.tag) el.innerHTML += `<div class="tag" style="${b.top === undefined ? 'top:auto;bottom:-26px' : ''}">${esc(b.tag)}</div>`;
    if (b.tail !== undefined) el.innerHTML += `<svg class="tail" style="left:${b.tail - b.x - 22}px" viewBox="0 0 44 42"><path d="M2 0 L22 38 L42 0" fill="#fff" stroke="#0a0d14" stroke-width="6" stroke-linejoin="round"/><rect x="5" y="-6" width="34" height="9" fill="#fff"/></svg>`;
    $('bubs').appendChild(el);
    el.style.transformOrigin = b.tail !== undefined ? `${b.tail - b.x}px 110%` : '50% 0%';
    let out = s.t1 + 0.35;
    const nx = says[i + 1]; if (nx && nx.t0 - 0.1 < out) out = nx.t0 - 0.1;
    tl.fromTo(el, { autoAlpha: 0, scale: 0.2, rotation: b.tail !== undefined ? -6 : 0 }, { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.28, ease: 'back.out(2.2)', immediateRender: false }, s.t0 - 0.06);
    tl.to(el, { scale: 1.03, duration: 0.18, yoyo: true, repeat: Math.max(0, Math.floor((s.t1 - s.t0) / 0.36) * 2 - 1), ease: 'sine.inOut' }, s.t0 + 0.25);
    tl.to(el, { autoAlpha: 0, scale: 0.6, y: -20, duration: 0.18, ease: 'power1.in' }, out);
  });

  // ---- lumière ambiante : deux halos qui respirent + un rayon à chaque niveau
  Object.assign($('b1').style, { left: '-200px', top: '80px', width: '760px', height: '760px', background: 'radial-gradient(circle,#ffcf7a 0%,rgba(255,207,122,0) 70%)', opacity: 0.22 });
  Object.assign($('b2').style, { left: '520px', top: '420px', width: '820px', height: '820px', background: 'radial-gradient(circle,#6fa8ff 0%,rgba(111,168,255,0) 70%)', opacity: 0.2 });
  const n = Math.ceil(DUR / 4);
  tl.to('#b1', { x: 180, y: 120, opacity: 0.32, duration: 4, yoyo: true, repeat: n, ease: 'sine.inOut' }, 0);
  tl.to('#b2', { x: -160, y: -140, opacity: 0.12, duration: 3.3, yoyo: true, repeat: n + 1, ease: 'sine.inOut' }, 0);

  // ---- la fin : la promo, puis la question qui reste
  tl.fromTo('#dim', { opacity: 0 }, { opacity: 0.55, duration: 0.3, immediateRender: false }, D.promo);
  tl.fromTo('#promo', { autoAlpha: 0, scale: 0.6, rotation: -4 }, { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.45, ease: 'back.out(2)', immediateRender: false }, D.promo);
  tl.to('#promo', { autoAlpha: 0, scale: 0.85, duration: 0.2 }, D.question - 0.2);
  tl.fromTo('#question', { autoAlpha: 0, scale: 0.6, y: 40 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.45, ease: 'back.out(2)', immediateRender: false }, D.question);
  tl.to('#question', { scale: 1.03, duration: 0.5, yoyo: true, repeat: 3, ease: 'sine.inOut' }, D.question + 0.5);

  // ---- la scène dessinée, image par image
  const clock = { t: 0 };
  tl.to(clock, { t: DUR, duration: DUR, ease: 'none', onUpdate: () => scene(clock.t) }, 0);
  window.addEventListener('hf-seek', e => { if (e && e.detail && typeof e.detail.time === 'number') scene(e.detail.time); });
  scene(0);
  window.__timelines = window.__timelines || {};
  window.__timelines['levels'] = tl;
  window.__seek = t => { tl.seek(t, false); scene(t); }; // pour les images fixes de contrôle
})();
