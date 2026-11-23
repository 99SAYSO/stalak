/* Marketing & croissance (23/11, the owner's pick of the 6 animation ideas): small touches for the pages of the site.
   - blocks under the first screen come up softly, once, when they reach the screen (those already on screen never hide);
   - the main buttons of the site's pages (a.cta, .pr-cta) throw a little snow when pressed.
   Nothing with « reduce motion ». transform and opacity only. */
(function () {
  if (!window.matchMedia || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if ('IntersectionObserver' in window) {
    var els = document.querySelectorAll('.ba-c, .rv-band > h2, .rv-avg, .about, .p4-plan, .pr-trust, .pr-clip, .pr-compare, .pr-faq, main > section, article > section, .steps > li, .faq');
    var vh = window.innerHeight, io = new IntersectionObserver(function (es) {
      var k = 0;
      es.forEach(function (e) { var el = e.target;
        if (!e.isIntersecting) { if (e.boundingClientRect.bottom < 0) { io.unobserve(el); el.classList.remove('fx-rise'); } return; }   // jumped past it: shown as it is
        io.unobserve(el);
        el.style.transitionDelay = (k++ * 90) + 'ms'; el.classList.add('fx-in');
        el.addEventListener('transitionend', function done(ev) { if (ev.target !== el || ev.propertyName !== 'transform') return; el.removeEventListener('transitionend', done); el.classList.remove('fx-rise', 'fx-in'); el.style.transitionDelay = ''; });
      });
    }, { rootMargin: '0px 0px -6% 0px' });
    for (var i = 0; i < els.length; i++) { var el = els[i]; if (el.closest('.fx-rise')) continue; if (el.getBoundingClientRect().top > vh * .95) { el.classList.add('fx-rise'); io.observe(el); } }
  }
  document.addEventListener('pointerdown', function (e) {
    var b = e.target.closest && e.target.closest('a.cta, .pr-cta'); if (!b) return;
    var r = b.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    for (var i = 0; i < 12; i++) { var f = document.createElement('i'), a = (i / 12) * Math.PI * 2, d = r.width / 2 + 18 + (i % 3) * 14;
      f.className = 'fx-flake'; f.style.left = cx + 'px'; f.style.top = cy + 'px';
      f.style.setProperty('--x', (Math.cos(a) * d).toFixed(0) + 'px'); f.style.setProperty('--y', (Math.sin(a) * (r.height / 2 + 26 + (i % 2) * 12)).toFixed(0) + 'px');
      document.body.appendChild(f); f.addEventListener('animationend', function () { this.remove(); }); }
  }, { passive: true });
})();
