/* Stalak trailer: seek-safe helpers shared by the scenes (every call adds tweens to the scene's own paused timeline). */
window.KT = {
  // the words of a line arrive one after another with the voice: blur 6 -> 0, 20 px up, expo.out; times are film seconds relative to the scene
  words: function (tl, sel, t, step) {
    tl.fromTo(sel + " .w", { opacity: 0, y: 20, filter: "blur(6px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.13, ease: "expo.out", stagger: step == null ? 0.08 : step, immediateRender: false }, t);
  },
  // the key word slams in, and its blurred copies spread above and below (the Spenda echo)
  echo: function (tl, sel, t) {
    var el = document.querySelector(sel), m = el.querySelector(".m");
    if (!el.querySelector(".c")) {
      for (var i = 0; i < 6; i++) { var c = document.createElement("span"); c.className = "c"; c.setAttribute("aria-hidden", "true"); c.setAttribute("data-layout-allow-overlap", ""); c.textContent = m.textContent; el.insertBefore(c, m); }
    }
    tl.fromTo(m, { opacity: 0, scale: 1.5 }, { opacity: 1, scale: 1, duration: 0.18, ease: "expo.out", immediateRender: false }, t);
    el.querySelectorAll(".c").forEach(function (c, i) {
      var k = i < 3 ? -(3 - i) : (i - 2), op = [0.42, 0.26, 0.12][Math.abs(k) - 1];
      tl.fromTo(c, { opacity: 0, y: 0 }, { opacity: op, y: k * 42, duration: 0.22, ease: "power2.out", immediateRender: false }, t + 0.03);
    });
  },
  // leave: blur and lift, 40% of the entry
  out: function (tl, sel, t, d) { tl.to(sel, { opacity: 0, y: -24, filter: "blur(8px)", duration: d || 0.16, ease: "power2.in" }, t); },
  // the clock: hands set to h:mm (12-hour face); animated by tweening the rotations
  clock: function (tl, sel, from, to, t, d, ease) {
    var a = function (m) { return (m % 720) * 0.5; }, h = function (m) { return (m % 720) / 2; };
    tl.fromTo(sel + " .min", { rotation: a(from) }, { rotation: a(to) + (to > from ? 0 : 0), duration: d, ease: ease || "power2.inOut", immediateRender: false }, t);
    tl.fromTo(sel + " .hr", { rotation: h(from) }, { rotation: h(to), duration: d, ease: ease || "power2.inOut", immediateRender: false }, t);
  },
  fmt: function (m) { var hh = Math.floor(m / 60) % 24, mm = m % 60, h12 = ((hh + 11) % 12) + 1; return h12 + ":" + (mm < 10 ? "0" : "") + mm + ' <small>' + (hh >= 12 ? "PM" : "AM") + '</small>'; },
  // a time readout that ticks: sets the text at each minute between from and to over d seconds
  ticks: function (tl, sel, from, to, t, d, ease) {
    var n = Math.abs(to - from), dir = to > from ? 1 : -1, o = { k: 0 }, el = document.querySelector(sel), last = -1;
    tl.fromTo(o, { k: 0 }, { k: n, duration: d, ease: ease || "power2.inOut", immediateRender: false, onUpdate: function () {
      var m = from + dir * Math.round(o.k); if (m !== last) { last = m; el.innerHTML = KT.fmt(m); } } }, t);
  },
  tap: function (tl, sel, t) { tl.fromTo(sel, { opacity: 0.95, scale: 0.3 }, { opacity: 0, scale: 1.6, duration: 0.45, ease: "expo.out", immediateRender: false }, t); }
};
// film minutes: 11:42 PM = 23*60+42; the clock's "PM" at 23:xx, "AM" at 0:xx
window.MIN = { start: 23 * 60 + 42, missed: 24 * 60 + 22, done: 23 * 60 + 45 };
