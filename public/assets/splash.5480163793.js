/* App & montage — refonte mobile, lot 1 (23/11) : l'ouverture « le glaçon », validée par le propriétaire
   (docs/audit/maquettes/mobile-2026-11-23/01-ouverture-glacon.mp4, source HyperFrames : sources/splash/index.html).
   The same GSAP timeline as the demo, on the real page: the ice cube falls, the mascot sleeps in it, wakes up, it bursts, she
   jumps and waves, « Stalak » letter by letter, the blue curtain lifts on the home screen and she goes to her place there.
   - stalak.app only (build_site.py writes this script first in <body>), phones only (under 900 px);
   - once per session at most, never over a page opened for something else (a #… address, an edit being reopened);
   - a touch passes it; never with « reduce motion »; if the library does not come within 3 s, the curtain simply fades;
   - the page itself decides and shows the blue curtain before its first picture (a few lines written in it by build_site.py,
     SPLASH_BOOT), then loads GSAP and this file (/assets/splash.<version>.js): nothing of it weighs on the page otherwise;
   - the owner found the shards a bit slow: they fly in 0.62 s instead of 1.1 s, and the curtain lifts at 4 s (4.35 s before). */
(function () {
  var d = document, root = d.documentElement, W = window, sp = d.getElementById('splash');
  if (!sp || !W.gsap || W.__stalakSplashGo || !root.classList.contains('splash-on')) return;   // the page decides (build_site.py SPLASH_BOOT)
  W.__stalakSplashGo = 1;
  sp.innerHTML =
    '<div class="sp-curtain"><div class="sp-bg"></div><div class="sp-rays"></div><div class="sp-snow"></div>' +
    '<svg class="sp-edge" viewBox="0 0 1080 120" preserveAspectRatio="none"><path d="M0 0H1080V20H960Q945 80 930 112Q912 76 900 20H640Q622 70 600 96Q578 70 560 20H330Q316 66 300 90Q282 62 270 20H120Q106 76 90 108Q72 70 60 20H0Z" fill="#1657b3"/></svg>' +
    '<svg class="sp-ice" viewBox="0 0 1080 230"><path d="M-20 -20H1100V112H950Q934 172 916 206Q898 168 884 112H700Q684 164 668 190Q650 160 638 112H420Q404 176 386 214Q366 170 352 112H190Q174 160 160 184Q144 156 132 112H-20Z" fill="#fff" stroke="#0a0d14" stroke-width="16" stroke-linejoin="round"/></svg>' +
    '<div class="sp-stage"><div class="sp-word"><span>S</span><span>t</span><span>a</span><span>l</span><span>a</span><span>k</span></div></div></div>' +
    '<div class="sp-stage"><div class="sp-shake"><div class="sp-shadow"></div><div class="sp-puffs"></div><div class="sp-flash"></div>' +
    '<div class="sp-cube"><div class="sp-cubeIn"><div class="sp-box"><img class="sp-sleep" src="/emoji/sleep.webp?v=2" alt="" width="256" height="256"><img class="sp-shock" src="/emoji/shock.webp?v=2" alt="" width="256" height="256" style="opacity:0"><div class="sp-frost"></div><div class="sp-shine"></div><div class="sp-shine2"></div></div>' +
    '<svg class="sp-cracks" viewBox="0 0 500 500" fill="none" stroke="#0a0d14" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"><path class="sp-c1" d="M262 8L224 96L286 168L236 250"/><path class="sp-c2" d="M236 250L128 282L20 244M236 250L282 352L246 492"/><path class="sp-c3" d="M286 168L392 196L492 170M282 352L388 384L490 350M128 282L96 380"/></svg></div></div>' +
    '<div class="sp-shards"></div><div class="sp-masc"><div class="sp-mascIn"></div></div></div></div>';
  var vw = W.innerWidth || 390, vh = W.innerHeight || 664, k = vw / 1080;
  sp.style.setProperty('--sp', String(k)); sp.style.setProperty('--sp-y', Math.round(vh * 0.44 - 890 * k) + 'px');
  var q = function (s) { return sp.querySelector(s); }, done = false, tl = null, t0 = W.__stalakSplashT || Date.now();

  function end() {
    if (done) return; done = true;
    root.classList.remove('splash-on', 'splash-lift'); if (sp.parentNode) sp.parentNode.removeChild(sp);
    W.__stalakSplashDone = true; W.__stalakSplashMs = Date.now() - t0;
  }
  function fade() { if (done) return; sp.style.transition = 'opacity .3s ease-out'; sp.style.opacity = '0'; setTimeout(end, 320); }
  // the two pictures of the cube first (0.9 s at most), then it plays
  var imgs = 0, started = false;
  function go() { if (started || done) return; started = true; try { play(W.gsap); } catch (e) { fade(); } }
  [].forEach.call(sp.querySelectorAll('img'), function (i) { var f = function () { if (++imgs >= 2) go(); }; if (i.complete) f(); else { i.onload = f; i.onerror = f; } });
  setTimeout(go, 900);
  // a touch passes it: the rest plays 5 times faster, then the home screen comes in as usual
  sp.addEventListener('pointerdown', function () { if (tl && tl.time() < X) tl.timeScale(5); });

  var X = 4.0, T = 2.5, D = 6;
  function play(gsap) {
    var seed = 11, R = function () { return (seed = (seed * 16807) % 2147483647) / 2147483647; };
    tl = gsap.timeline();
    var cube = q('.sp-cube'), cubeIn = q('.sp-cubeIn'), shake = q('.sp-shake'), shadow = q('.sp-shadow'), masc = q('.sp-masc'), mascIn = q('.sp-mascIn'), rays = q('.sp-rays');
    // snow
    var snow = q('.sp-snow');
    for (var i = 0; i < 24; i++) { var f = d.createElement('div'); f.className = 'sp-fl'; var z = 3 + R() * 7;
      f.style.cssText = 'left:' + (R() * 100) + '%;top:' + (-16 + R() * 100) + '%;width:' + z + 'px;height:' + z + 'px;opacity:' + (0.25 + R() * 0.5); snow.appendChild(f);
      tl.fromTo(f, { y: 0, x: 0 }, { y: 90 + R() * 150, x: (R() - 0.5) * 44, duration: D, ease: 'none' }, 0); }
    // the bar of ice at the top
    tl.fromTo('.sp-ice', { yPercent: -110 }, { yPercent: 0, duration: 0.55, ease: 'back.out(1.5)' }, 0.05);
    gsap.set(rays, { opacity: 0, transformOrigin: '50% 50%' });
    gsap.set([cube, cubeIn, masc, mascIn], { transformOrigin: '50% 100%' });
    // the cube falls
    gsap.set(cube, { opacity: 1 });
    tl.fromTo(cube, { y: -1700, rotation: -26 }, { y: 0, rotation: 0, duration: 0.5, ease: 'power2.in' }, 0.2);
    tl.fromTo(shadow, { scale: 0.15, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: 'power2.in' }, 0.2);
    tl.fromTo(cubeIn, { scaleX: 1, scaleY: 1 }, { scaleX: 1.22, scaleY: 0.78, duration: 0.07, ease: 'power2.out' }, 0.7);
    tl.to(cubeIn, { scaleX: 1, scaleY: 1, duration: 0.6, ease: 'elastic.out(1,0.38)' }, 0.77);
    tl.fromTo(shake, { y: 0 }, { y: 30, duration: 0.05, ease: 'power2.out' }, 0.7).to(shake, { y: 0, duration: 0.45, ease: 'elastic.out(1,0.3)' }, 0.75);
    // a puff of snow where it lands
    var puffs = q('.sp-puffs');
    for (i = 0; i < 12; i++) { var p = d.createElement('div'); p.className = 'sp-pf'; puffs.appendChild(p); var dir = i % 2 ? 1 : -1, dx = dir * (150 + R() * 330), up = -(40 + R() * 150), s = 0.6 + R() * 1.1;
      tl.fromTo(p, { x: dir * 120, y: 0, scale: 0, opacity: 1 }, { x: dx, y: up, scale: s, duration: 0.45, ease: 'power3.out' }, 0.7);
      tl.to(p, { opacity: 0, scale: s * 0.4, y: up + 40, duration: 0.3, ease: 'power2.in' }, 1.1); }
    // knocks from the inside, the cracks
    [['.sp-c1', 1.3, 5], ['.sp-c2', 1.66, -8], ['.sp-c3', 1.98, 10]].forEach(function (c) { var id = q(c[0]), t = c[1], a = c[2];
      gsap.set(id, { strokeDasharray: 900, strokeDashoffset: 900 });
      tl.to(id, { strokeDashoffset: 0, duration: 0.14, ease: 'power3.out' }, t);
      tl.to(cube, { rotation: a, duration: 0.06, ease: 'power2.out' }, t).to(cube, { rotation: -a * 0.6, duration: 0.08, ease: 'power1.inOut' }, t + 0.06).to(cube, { rotation: 0, duration: 0.24, ease: 'elastic.out(1,0.4)' }, t + 0.14);
      tl.to(cubeIn, { scaleX: 1.05, scaleY: 0.96, duration: 0.06 }, t).to(cubeIn, { scaleX: 1, scaleY: 1, duration: 0.2, ease: 'back.out(3)' }, t + 0.06); });
    tl.to('.sp-sleep', { opacity: 0, duration: 0.04 }, 1.66).to('.sp-shock', { opacity: 1, duration: 0.04 }, 1.66);
    // a breath, then it bursts
    tl.to(cubeIn, { scaleX: 1.14, scaleY: 0.84, duration: 0.22, ease: 'power2.inOut' }, 2.22);
    tl.to(cubeIn, { scaleX: 1.3, scaleY: 1.3, duration: 0.06, ease: 'power3.in' }, 2.44);
    tl.to(cube, { opacity: 0, duration: 0.03 }, T);
    tl.fromTo('.sp-flash', { scale: 0.4, opacity: 0 }, { scale: 0.5, opacity: 1, duration: 0.02, immediateRender: false }, T).to('.sp-flash', { scale: 3.6, opacity: 0, duration: 0.4, ease: 'power3.out' }, T + 0.02);
    tl.to(shake, { y: -26, duration: 0.05, ease: 'power2.out' }, T).to(shake, { y: 0, duration: 0.5, ease: 'elastic.out(1,0.3)' }, T + 0.05);
    tl.to(rays, { opacity: 0.2, duration: 0.3, ease: 'power2.out' }, T).fromTo(rays, { rotation: 0 }, { rotation: 32, duration: D - T, ease: 'none' }, T);
    var sh = q('.sp-shards');
    for (i = 0; i < 16; i++) { var a = (i / 16) * 6.283 + R() * 0.3, dist = 420 + R() * 420, sc = 0.6 + R() * 1.1, e = d.createElement('div'); e.className = 'sp-sh';
      e.innerHTML = '<svg viewBox="0 0 120 120"><path d="M12 ' + (24 + R() * 30) + 'L' + (84 + R() * 26) + ' 10L' + (64 + R() * 40) + ' 110Z" fill="' + (i % 3 ? '#d6ecff' : '#fff') + '" stroke="#0a0d14" stroke-width="11" stroke-linejoin="round"/></svg>'; sh.appendChild(e);
      var ox = Math.cos(a) * 150, oy = Math.sin(a) * 150, ex = Math.cos(a) * dist, ey = Math.sin(a) * dist;
      tl.fromTo(e, { x: ox, opacity: 1, scale: sc }, { x: ex, duration: 0.62, ease: 'power2.out', immediateRender: false }, T);
      tl.fromTo(e, { y: oy }, { y: ey - 170, duration: 0.22, ease: 'power2.out', immediateRender: false }, T).to(e, { y: ey + 900, duration: 0.42, ease: 'power2.in' }, T + 0.22);
      tl.fromTo(e, { rotation: 0 }, { rotation: (R() - 0.5) * 900, duration: 0.62, ease: 'none', immediateRender: false }, T);
      tl.to(e, { opacity: 0, duration: 0.12 }, T + 0.5); }
    // the mascot jumps out, lands, settles
    tl.to(masc, { opacity: 1, duration: 0.03 }, T);
    tl.fromTo(masc, { y: 70, scale: 0.72, rotation: -9 }, { y: -230, scale: 1, rotation: 5, duration: 0.3, ease: 'power2.out', immediateRender: false }, T);
    tl.fromTo(mascIn, { scaleX: 0.9, scaleY: 1.14 }, { scaleX: 0.96, scaleY: 1.06, duration: 0.3, ease: 'power1.out', immediateRender: false }, T);
    tl.to(masc, { y: 0, rotation: 0, duration: 0.24, ease: 'power2.in' }, T + 0.3);
    tl.to(mascIn, { scaleX: 1.16, scaleY: 0.84, duration: 0.07, ease: 'power2.out' }, T + 0.54).to(mascIn, { scaleX: 1, scaleY: 1, duration: 0.6, ease: 'elastic.out(1,0.4)' }, T + 0.61);
    tl.to(shadow, { scale: 0.6, opacity: 0.5, duration: 0.3, ease: 'power2.out' }, T).to(shadow, { scale: 1.05, opacity: 1, duration: 0.24, ease: 'power2.in' }, T + 0.3);
    tl.to(shake, { y: 16, duration: 0.05 }, T + 0.54).to(shake, { y: 0, duration: 0.35, ease: 'elastic.out(1,0.35)' }, T + 0.59);
    // the name, letter by letter
    [].forEach.call(sp.querySelectorAll('.sp-word span'), function (l, n) { tl.fromTo(l, { y: 120, scale: 0.3, opacity: 0, rotation: (n % 2 ? 1 : -1) * 14 }, { y: 0, scale: 1, opacity: 1, rotation: 0, duration: 0.42, ease: 'back.out(2.4)' }, 3.12 + n * 0.055); });
    // the curtain lifts; she goes to her place on the home screen, which comes in
    tl.call(function () { tl.timeScale(1); lift(gsap, masc, shadow); }, null, X);
  }
  function lift(gsap, masc, shadow) {
    var vis = function (n) { return !!n && n.getClientRects().length > 0; }, k2 = parseFloat(sp.style.getPropertyValue('--sp')) || 0.36;
    // where the mascot of the page stands (the pitch signed out, the card « Nouveau montage » signed in)
    var spot = [d.querySelector('.hero-m'), d.querySelector('#mhNew i')].filter(vis)[0], out = gsap.timeline({ onComplete: function () { if (spot) spot.style.visibility = ''; end(); } });
    sp.style.pointerEvents = 'none';
    out.to('.sp-curtain', { yPercent: -112, duration: 0.62, ease: 'power3.in' }, 0);
    out.to(shadow, { opacity: 0, scale: 0.5, duration: 0.25 }, 0);
    if (spot) {
      var a = masc.getBoundingClientRect(), b = spot.getBoundingClientRect();
      spot.style.visibility = 'hidden';
      out.to(masc, { x: ((b.left + b.width / 2) - (a.left + a.width / 2)) / k2, y: (b.bottom - a.bottom) / k2, scale: b.width / a.width, duration: 0.75, ease: 'power3.inOut' }, 0.05);
    } else out.to(masc, { opacity: 0, scale: 0.6, duration: 0.3, ease: 'power2.in' }, 0.1);
    var text = [].filter.call(d.querySelectorAll('#mhHi, .hero-h1, .hero-s2, #mhNew .mh-newP'), vis);
    var rise = [].filter.call(d.querySelectorAll('#heroSong, #mhNew, #mhLastT, #lpOffer, #mhList'), vis);
    var soft = [].filter.call(d.querySelectorAll('#mhPill, #heroDemo, #mhEx, #heroProof, #helpBtn, .installtip'), vis), bar = d.getElementById('tabBar');
    if (text.length) out.fromTo(text, { opacity: 0, filter: 'blur(6px)' }, { opacity: 1, filter: 'blur(0px)', duration: 0.3, ease: 'power2.out', stagger: 0.12, clearProps: 'opacity,filter' }, 0.5);
    if (rise.length) out.fromTo(rise, { opacity: 0, y: 28, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'back.out(1.6)', stagger: 0.08, clearProps: 'opacity,transform' }, 0.62);
    if (soft.length) out.fromTo(soft, { opacity: 0 }, { opacity: 1, duration: 0.3, stagger: 0.06, clearProps: 'opacity' }, 0.85);
    if (vis(bar)) out.fromTo(bar, { yPercent: 105 }, { yPercent: 0, duration: 0.55, ease: 'power4.out', clearProps: 'transform' }, 0.6);
  }
})();
