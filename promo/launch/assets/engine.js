/* The launch film's engine (SPEC.md): render(t) sets every element from the film time t, so any frame renders on its own.
   Times come from times.js (build.py): the scenes (S), the actions that land on the voice's words (K), the flashes (FL) and
   his lyric (LYRIC, LY). The moves that no word names are relative to their scene's start. No bounce, no shake. */
window.LV = (function () {
  var T, R, K, $ = {};
  var W = 1920, H = 1080, INK = "#0a0d14", BLUE = "#1f6fd6";
  // ---------------------------------------------------------------- maths
  function cl(x, a, b) { return x < a ? a : x > b ? b : x; }
  function sat(x) { return cl(x, 0, 1); }
  function seg(t, a, b) { return sat((t - a) / (b - a)); }
  function lerp(a, b, q) { return a + (b - a) * q; }
  var E = {
    o2: function (q) { return 1 - (1 - q) * (1 - q); }, o3: function (q) { return 1 - Math.pow(1 - q, 3); },
    o4: function (q) { return 1 - Math.pow(1 - q, 4); }, expo: function (q) { return q >= 1 ? 1 : 1 - Math.pow(2, -10 * q); },
    i2: function (q) { return q * q; }, i3: function (q) { return q * q * q; },
    io2: function (q) { return q < 0.5 ? 2 * q * q : 1 - Math.pow(-2 * q + 2, 2) / 2; },
    io3: function (q) { return q < 0.5 ? 4 * q * q * q : 1 - Math.pow(-2 * q + 2, 3) / 2; }
  };
  function rng(s) { return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
  // ---------------------------------------------------------------- dom
  function el(tag, cls, css, parent, html) {
    var e = document.createElement(tag); if (cls) e.className = cls; if (css) e.style.cssText = css;
    if (html !== undefined) e.innerHTML = html; if (parent) parent.appendChild(e); return e;
  }
  // A layer (.lay, hidden by its class) is switched on with "visible"; anything inside one only inherits ("") or hides.
  // Whatever is off is also made transparent (class "off"): the runtime shows a playing video on its own, and a video set
  // visible would show through a parent that is only hidden.
  function vis(e, on) {
    var v = on ? (e.classList && e.classList.contains("lay") ? "visible" : "") : "hidden";
    if (e.style.visibility !== v) e.style.visibility = v;
    var off = e.classList.contains("off");
    if (on && off) e.classList.remove("off"); else if (!on && !off) e.classList.add("off");
  }
  function op(e, v) { e.style.opacity = v >= 0.999 ? "1" : v.toFixed(3); }
  function tf(e, s) { e.style.transform = s; }
  function blur(e, b) { var f = b > 0.05 ? "blur(" + b.toFixed(2) + "px)" : "none"; if (e.style.filter !== f) e.style.filter = f; }
  function px(v) { return v.toFixed(2) + "px"; }
  function box(e, x, y, w, h) { e.style.left = px(x); e.style.top = px(y); if (w !== undefined) { e.style.width = px(w); e.style.height = px(h); } }
  function img(src, css, parent) { var i = el("img", "abs", css, parent); i.src = src; i.alt = ""; return i; }
  function ui(name) { return "assets/ui/" + name + ".png"; }
  // ---------------------------------------------------------------- v2: the transitions (owner's remark, 2/11: "trop sec",
  // transitions that melt into the set). A camera maps the local point P to the screen point Q with the zoom Z (origin 0 0);
  // zooms are interpolated in log space, so that they look steady.
  function cam(e, P, Q, Z) { e.style.transformOrigin = "0 0"; tf(e, "translate(" + px(Q[0] - P[0] * Z) + "," + px(Q[1] - P[1] * Z) + ") scale(" + Z.toFixed(5) + ")"); }
  function lz(a, b, q) { return Math.exp(lerp(Math.log(a), Math.log(b), q)); }
  function dio3(q) { return q <= 0 || q >= 1 ? 0 : (q < 0.5 ? 12 * q * q : 12 * (1 - q) * (1 - q)); }   // the slope of io3
  // motion blur along the move only (x for a pan, y for a swipe): an SVG filter whose deviation follows the speed
  function mblur(e, id, sd) {
    var on = sd > 0.4;
    if (on) $[id].setAttribute("stdDeviation", id === "mby" ? "0 " + sd.toFixed(1) : sd.toFixed(1) + " 0");
    e.style.filter = on ? "url(#" + id + ")" : "none";     // set every frame: blur() may have used the same element
  }
  function mbSpeed(dist, dur, q) { return Math.min(60, dio3(q) * dist / dur / T.FPS * 0.3); }   // 30 % of the move per frame
  function mbFrame(dpx) { return Math.min(60, Math.abs(dpx) * 0.3); }                          // the same, from the move of one frame
  function gmask(e, css) { var v = css || ""; if (e.__gm !== v) { e.style.webkitMaskImage = v; e.style.maskImage = v; e.__gm = v; } }
  // words of a line, each its own span (blur-in, letters…)
  function words(parent, text, cls) {
    return text.split(" ").map(function (w, i, a) { var s = el("span", "w " + (cls || ""), "", parent, w); if (i < a.length - 1) parent.appendChild(document.createTextNode(" ")); return s; });
  }
  function wordsIn(ws, t, t0, st, d, b) {
    ws.forEach(function (w, i) { var q = E.o3(seg(t, t0 + i * st, t0 + i * st + d)); op(w, q); blur(w, (1 - q) * b); });
  }
  function wordsAt(ws, t, times, d, b) {      // each word at its own time (the voice's)
    ws.forEach(function (w, i) { var q = E.o3(seg(t, times[i], times[i] + d)); op(w, q); blur(w, (1 - q) * b); });
  }
  function letters(parent, text) {
    return text.split("").map(function (c) { return el("span", "w", "", parent, c === " " ? "&nbsp;" : c); });
  }
  function caretOn(t, typing) { return typing || Math.floor(t * 2.4) % 2 === 0; }
  // ---------------------------------------------------------------- the worlds
  function snow(parent, n, seed, big, alpha) {
    var r = rng(seed), out = [];
    for (var i = 0; i < n; i++) {
      var d = (big ? 2.5 : 1.6) + r() * (big ? 4 : 2.6), f = el("div", "flake", "width:" + px(d) + ";height:" + px(d), parent);
      out.push({ e: f, x: r() * W, y: r() * (H + 40), v: 26 + r() * 46, a: 10 + r() * 26, w: 0.3 + r() * 0.7, p: r() * 6.3, o: alpha * (0.5 + r() * 0.5) });
    }
    return out;
  }
  function snowAt(fl, t) {
    for (var i = 0; i < fl.length; i++) {
      var f = fl[i], y = ((f.y + f.v * t) % (H + 40)) - 20, x = f.x + Math.sin(t * f.w + f.p) * f.a;
      f.e.style.transform = "translate(" + px(x) + "," + px(y) + ")"; f.e.style.opacity = f.o.toFixed(2);
    }
  }
  function bokeh(parent, n, seed) {
    var r = rng(seed), out = [];
    for (var i = 0; i < n; i++) {
      var d = 50 + r() * 70, b = el("div", "bokeh", "width:" + px(d) + ";height:" + px(d) + ";filter:blur(" + px(8 + r() * 6) + ")", parent);
      out.push({ e: b, x: r() * W, y: r() * H, vx: -8 + r() * 16, vy: 10 + r() * 14, o: 0.22 + r() * 0.2, d: d });
    }
    return out;
  }
  function bokehAt(bk, t) {
    bk.forEach(function (b) { var x = b.x + b.vx * t, y = ((b.y + b.vy * t) % (H + 200)) - 100; b.e.style.transform = "translate(" + px(x - b.d / 2) + "," + px(y - b.d / 2) + ")"; b.e.style.opacity = b.o.toFixed(2); });
  }
  // v3 (owner's remark, 2/11: "utilise plus d'éléments liés à Stalak, genre des flocons en fond"): big ice crystals (the
  // 6-arm flake of the brand), far behind, turning slowly (3-6° a second) and drifting down
  function crystals(parent, n, seed, o) {
    var r = rng(seed), out = [];
    for (var i = 0; i < n; i++) {
      var sz = lerp(o.s[0], o.s[1], r()), e = el("div", "abs", "left:0;top:0;width:" + px(sz) + ";height:" + px(sz), parent,
        '<svg viewBox="-52 -52 104 104" style="width:100%;height:100%;overflow:visible"><path d="' + FLAKE_PATH + '" fill="' + (o.c || "#ffffff") + '" fill-opacity="0.5" stroke="' + (o.k || "#ffffff") +
        '" stroke-width="1.6" stroke-opacity="0.95"/><circle r="7" fill="' + (o.k || "#ffffff") + '" fill-opacity="0.75"/></svg>');
      var b = lerp(o.blur[0], o.blur[1], r()); if (b > 0.3) e.style.filter = "blur(" + px(b) + ")";
      out.push({ e: e, x: (i + 0.15 + r() * 0.7) / n * (W + 160) - 80, y: r() * (H + 400), sz: sz, a: lerp(o.a[0], o.a[1], r()), rot: r() * 60,
                 vr: (i % 2 ? -1 : 1) * lerp(3, 6, r()), vx: lerp(-5, 5, r()), vy: lerp(5, 16, r()) });
    }
    return out;
  }
  function crystalsAt(cs, t, dx) {
    cs.forEach(function (c) {
      var span = H + c.sz + 300, y = ((c.y + c.vy * t) % span + span) % span - c.sz - 150;
      c.e.style.transform = "translate(" + px(c.x + c.vx * t + (dx || 0) - c.sz / 2) + "," + px(y) + ") rotate(" + (c.rot + c.vr * t).toFixed(2) + "deg)";
      c.e.style.opacity = c.a.toFixed(3);
    });
  }
  // big soft flakes in front of everything, passing faster than the snow behind (depth)
  function fgFlakes(parent, n, seed) {
    var r = rng(seed), out = [];
    for (var i = 0; i < n; i++) {
      var d = 30 + r() * 70, b = el("div", "bokeh", "width:" + px(d) + ";height:" + px(d) + ";filter:blur(" + px(6 + r() * 10) + ")", parent);
      out.push({ e: b, x: (i + r()) / n * W, y: r() * H, vx: 14 + r() * 30, vy: 46 + r() * 64, o: 0.3 + r() * 0.3, d: d, w: 0.35 + r() * 0.5, p: r() * 6.3 });
    }
    return out;
  }
  function fgAt(fl, t, a) {
    fl.forEach(function (f) {
      var y = ((f.y + f.vy * t) % (H + 260)) - 130, x = ((f.x + f.vx * t + Math.sin(t * f.w + f.p) * 34) % (W + 260)) - 130;
      f.e.style.transform = "translate(" + px(x - f.d / 2) + "," + px(y - f.d / 2) + ")"; f.e.style.opacity = (f.o * a).toFixed(3);
    });
  }
  // a fringe of icicles (the app's stalactites: ice #d6ecff, ink outline), pointing down from y = 0
  function icicles(w, n, seed, lmin, lmax) {
    var r = rng(seed), d = "M0 0", step = w / n;
    for (var i = 0; i < n; i++) {
      var a = i * step, b = a + step, m = a + step * (0.38 + r() * 0.24), l = lerp(lmin, lmax, Math.pow(r(), 1.4));
      d += " L" + a.toFixed(1) + " 0 L" + m.toFixed(1) + " " + l.toFixed(1) + " L" + b.toFixed(1) + " 0";
    }
    return '<svg width="' + w.toFixed(0) + '" height="' + (lmax + 8).toFixed(0) + '" viewBox="0 -4 ' + w.toFixed(0) + " " + (lmax + 8).toFixed(0) + '" style="position:absolute;left:0;top:0;overflow:visible">' +
      '<path d="' + d + ' Z" fill="#d6ecff" stroke="#0a0d14" stroke-width="3.2" stroke-linejoin="round"/></svg>';
  }
  function mkSky(parent, seed) {
    var w = el("div", "full", "", parent);
    w.style.background = "radial-gradient(80% 70% at 22% 8%, #8cc6fa 0%, #4d9cf0 30%, #2b7de0 55%, #1f6fd6 72%, #1552a6 100%)";
    el("div", "", "position:absolute;left:-260px;top:-320px;width:1300px;height:1000px;background:radial-gradient(closest-side, rgba(255,255,255,0.5), rgba(255,255,255,0))", w);
    var cr = crystals(w, 5, seed + 3, { a: [0.1, 0.2], s: [150, 380], blur: [0, 4] });
    return { e: w, cr: cr, fl: snow(w, 70, seed, true, 0.85), bk: bokeh(w, 7, seed + 7) };
  }
  function skyAt(s, t) { crystalsAt(s.cr, t); snowAt(s.fl, t); bokehAt(s.bk, t); }
  // the aurora of the night world: three ribbons of ice light, drifting slowly
  function auroraAt(t) {
    var p = [
      { c: "#1f6fd6", w: 300, o: 0.55, y: 520, a: 170, f: 0.18, ph: 0 },
      { c: "#3fb4ff", w: 210, o: 0.45, y: 760, a: 140, f: 0.23, ph: 2.1 },
      { c: "#9fdcff", w: 120, o: 0.32, y: 640, a: 120, f: 0.29, ph: 4.0 }
    ], h = "";
    p.forEach(function (r) {
      var d = "M -100 " + (r.y + Math.sin(t * r.f + r.ph) * r.a).toFixed(1);
      for (var k = 1; k <= 6; k++) {
        var x = -100 + k * 420, y = r.y + Math.sin(t * r.f + r.ph + k * 1.1) * r.a, cx = x - 210, cy = r.y + Math.sin(t * r.f * 1.3 + r.ph + k * 0.9) * r.a * 1.4;
        d += " Q " + cx.toFixed(1) + " " + cy.toFixed(1) + " " + x.toFixed(1) + " " + y.toFixed(1);
      }
      h += '<path d="' + d + '" fill="none" stroke="' + r.c + '" stroke-width="' + r.w + '" stroke-linecap="round" opacity="' + r.o + '"/>';
    });
    $.aurora.innerHTML = h;
  }
  // the icon's silhouette (rounded square and three stalactites): the window of the opening
  var ICON_MASK = "url(\"data:image/svg+xml;utf8," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-6 -6 112 142"><filter id="b"><feGaussianBlur stdDeviation="1.1"/></filter><g filter="url(#b)" fill="#000">' +
    '<rect x="0" y="0" width="100" height="100" rx="26"/><path d="M20 96 L34 96 L27 122 Z"/><path d="M44 96 L58 96 L51 130 Z"/><path d="M68 96 L80 96 L74 114 Z"/></g></svg>') + "\")";
  var FLAKE_PATH = (function () {   // a 6-arm ice crystal, 100 x 100 around 0,0
    var d = "";
    for (var k = 0; k < 6; k++) {
      var a = k * Math.PI / 3, c = Math.cos(a), s = Math.sin(a);
      var P = function (x, y) { return (x * c - y * s).toFixed(2) + " " + (x * s + y * c).toFixed(2); };
      d += "M" + P(0, -4) + " L" + P(30, -5) + " L" + P(40, -16) + " L" + P(44, -13) + " L" + P(37, -4) + " L" + P(50, -3) + " L" + P(50, 3) +
           " L" + P(37, 4) + " L" + P(44, 13) + " L" + P(40, 16) + " L" + P(30, 5) + " L" + P(0, 4) + " Z ";
    }
    return d;
  })();
  var FLAKE_MASK = "url(\"data:image/svg+xml;utf8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="-52 -52 104 104"><path d="' + FLAKE_PATH + '" fill="#000"/><circle r="9" fill="#000"/></svg>') + "\")";
  function maskAt(e, m, size, cx, cy, ratio) {
    if (size === null) { if (e.style.webkitMaskImage) { e.style.webkitMaskImage = ""; e.style.maskImage = ""; } return; }
    var w = Math.max(0.01, size), h = w * (ratio || 1);
    e.style.webkitMaskImage = m; e.style.maskImage = m;
    e.style.webkitMaskRepeat = "no-repeat"; e.style.maskRepeat = "no-repeat";
    e.style.webkitMaskSize = px(w) + " " + px(h); e.style.maskSize = px(w) + " " + px(h);
    e.style.webkitMaskPosition = px(cx - w / 2) + " " + px(cy - h / 2); e.style.maskPosition = px(cx - w / 2) + " " + px(cy - h / 2);
  }
  // ---------------------------------------------------------------- the cursor: path of [t, x, y], clicks at [t]
  function cursorAt(t, path, clicks) {
    if (!path || t < path[0][0] || t > path[path.length - 1][0]) { vis($.cursor, false); return; }
    var x = path[0][1], y = path[0][2];
    for (var i = 1; i < path.length; i++) {
      if (t <= path[i][0]) { var q = E.io3(seg(t, path[i - 1][0], path[i][0])); x = lerp(path[i - 1][1], path[i][1], q); y = lerp(path[i - 1][2], path[i][2], q); break; }
      x = path[i][1]; y = path[i][2];
    }
    var s = 1;
    (clicks || []).forEach(function (c) { if (t >= c && t < c + 0.2) s = 1 - 0.1 * Math.sin(Math.PI * (t - c) / 0.2); });
    vis($.cursor, true); tf($.cursor, "translate(" + px(x - 30) + "," + px(y - 8) + ") scale(" + s.toFixed(3) + ")");
  }
  // ---------------------------------------------------------------- his lyric, in the app's "Classic" style, word by word on his voice
  function mkLyr(parent, size, top) {
    var d = el("div", "lyr", "top:" + px(top) + ";font-size:" + px(size), parent);
    var chunks = T.LYRIC.map(function (c) {
      var bx = el("div", "abs", "left:0;right:0;top:0", d), ws = [];
      c[1].forEach(function (line) {
        var ln = el("div", "", "", bx);
        line.forEach(function (wt, i) { var s = el("span", "w", "", ln, wt[0]); if (i < line.length - 1) ln.appendChild(document.createTextNode(" ")); ws.push({ e: s, t: wt[1] }); });
      });
      return { e: bx, t0: c[0], w: ws };
    });
    return { e: d, c: chunks };
  }
  function tauAt(segs, t) {
    for (var i = 0; i < segs.length; i++) if (t >= segs[i][0] && t < segs[i][1]) return segs[i][2] + (t - segs[i][0]);
    return null;
  }
  function lyrAt(L, segs, t) {
    var tau = tauAt(segs, t), cur = -1, i;
    if (tau !== null) for (i = 0; i < L.c.length; i++) if (tau + 0.06 >= L.c[i].t0) cur = i;
    if (cur === 0 && tau < L.c[0].w[0].t - 0.3) cur = -1;
    L.c.forEach(function (c, j) {
      var on = j === cur; vis(c.e, on); if (!on) return;
      c.w.forEach(function (w) { var q = E.o3(seg(tau, w.t - 0.05, w.t + 0.05)); op(w.e, q); blur(w.e, (1 - q) * 5); });
    });
  }

  // ================================================================= init: the scenes' furniture
  function init(root) {
    T = window.T; R = root; K = T.K;
    ["w-night", "w-blue", "w-studio", "skywrap", "skycam", "w-sky", "ssnow", "sbokeh", "s0", "spark", "s1", "s1b", "s2", "s3", "s3a", "s3b", "s3c", "phone",
     "tablet", "s4", "live", "s4ui", "s4prev", "s5", "bento", "f0", "f1", "f1a", "f1b", "f1c", "f2", "f2v", "f3", "s6", "lap6", "lap6s", "s7", "s7cam", "prev7",
     "s8", "s9", "car", "car0", "car1", "car2", "car3", "s10", "s11", "s12", "cursor", "aurora", "nsnow", "bsnow"].forEach(function (id) { $[id] = root.querySelector("#" + id); });
    $.sun = root.querySelector("#w-studio .sun");
    // the motion blurs of the pans (x) and of the swipe (y)
    var fs = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    fs.setAttribute("width", "0"); fs.setAttribute("height", "0"); fs.style.cssText = "position:absolute;left:0;top:0;width:0;height:0";
    fs.innerHTML = '<filter id="mbx" x="-25%" y="-5%" width="150%" height="110%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="0 0"/></filter>' +
                   '<filter id="mby" x="-5%" y="-25%" width="110%" height="150%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="0 0"/></filter>' +
                   '<filter id="mbx2" x="-25%" y="-5%" width="150%" height="110%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="0 0"/></filter>' +
                   '<filter id="mbx3" x="-25%" y="-5%" width="150%" height="110%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="0 0"/></filter>';
    root.appendChild(fs);
    $.mbx = fs.querySelector("#mbx feGaussianBlur"); $.mby = fs.querySelector("#mby feGaussianBlur");
    $.mbx2 = fs.querySelector("#mbx2 feGaussianBlur"); $.mbx3 = fs.querySelector("#mbx3 feGaussianBlur");
    // ---- worlds
    $.nfl = snow($.nsnow, 60, 3, false, 0.5);
    $.bfl = snow($.bsnow, 50, 5, false, 0.55);
    $.sfl = snow($.ssnow, 80, 9, true, 0.9);
    $.sbk = bokeh($.sbokeh, 8, 17);
    $.scr1 = crystals($.ssnow, 5, 23, { a: [0.1, 0.2], s: [160, 400], blur: [0, 4] });                 // S1's sky
    $.ncr = crystals($["w-night"], 7, 31, { a: [0.07, 0.15], s: [150, 440], blur: [0, 6], c: "#9fdcff" });
    $.bcr = crystals($["w-blue"], 7, 37, { a: [0.07, 0.15], s: [130, 400], blur: [0, 5], c: "#bfe6ff" });
    $.stcr = crystals($["w-studio"], 6, 43, { a: [0.22, 0.34], s: [120, 300], blur: [0, 3], c: "#d6ecff", k: "#8fc3f2" });
    $.fg = root.querySelector("#fg"); $.fgf = fgFlakes($.fg, 7, 53);
    // ---- S0: the spark (6 arms of ice)
    $.spark.innerHTML = '<defs><radialGradient id="sg"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#d6ecff"/></radialGradient></defs>' +
      '<path d="' + (function () { var d = ""; for (var k = 0; k < 12; k++) { var a = k * Math.PI / 6 - Math.PI / 2, r = k % 2 ? 7 : 48; d += (k ? "L" : "M") + (Math.cos(a) * r).toFixed(2) + " " + (Math.sin(a) * r).toFixed(2); } return d + "Z"; })() + '" fill="url(#sg)"/>';
    $.spark.style.filter = "drop-shadow(0 0 10px rgba(190,230,255,0.9))";
    // ---- S1: the glass composer on the sky (seen first through the icon, zoomed on its + button)
    var s1 = $.s1;
    $.hero = el("div", "big", "top:236px;font-weight:600;font-size:92px", s1); $.heroW = words($.hero, "Your takes, cut on the beat.");
    $.sub = el("div", "big", "top:362px;font-weight:400;font-size:34px;color:rgba(255,255,255,0.86)", s1); $.subW = words($.sub, "Drop your song and a few takes of you performing it.");
    $.gbox = el("div", "glass", "left:330px;top:452px;width:1260px;height:312px;border-radius:44px", s1);
    $.gice = el("div", "abs", "left:374px;top:451px;width:1172px;height:70px;transform-origin:50% 0", s1, icicles(1172, 34, 61, 14, 52));
    $.gplus = el("div", "glass round", "left:374px;top:646px;width:92px;height:92px;border-radius:46px", s1,
      '<svg viewBox="-50 -50 100 100" style="position:absolute;inset:0"><g id="gx" stroke="#fff" stroke-width="7" stroke-linecap="round"><path d="M-17 -17 L17 17"/><path d="M17 -17 L-17 17"/></g></svg>');
    $.gx = $.gplus.querySelector("#gx");
    $.gpill = el("div", "pill", "left:484px;top:654px;height:76px;padding:0 30px 0 26px;overflow:hidden", s1, '<span style="font-size:30px">♫</span><span>Import your music</span>');
    $.gsend = el("div", "round", "left:1458px;top:646px;width:92px;height:92px;border-radius:46px;background:#ffffff;box-shadow:0 12px 26px rgba(5,20,60,0.25)", s1,
      '<svg viewBox="-50 -50 100 100" style="position:absolute;inset:0"><path d="M-18 0 L16 0 M2 -15 L17 0 L2 15" fill="none" stroke="' + BLUE + '" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>');
    $.gcaret = el("div", "caret", "position:absolute;left:392px;top:508px;height:46px", s1);
    // ---- S1b: inside the composer, "I have a song."
    $.s1bBox = el("div", "glass", "left:150px;top:250px;width:2200px;height:1100px;border-radius:120px", $.s1b);
    $.s1bTxt = el("div", "abs", "left:290px;top:452px;font-weight:400;font-size:150px;white-space:nowrap;line-height:1", $.s1b);
    $.s1bT = el("span", "", "", $.s1bTxt); $.s1bW = el("span", "", "", $.s1bTxt); $.s1bE = el("span", "", "", $.s1bTxt);   // "I have a " · "song" · "."
    $.s1bC = el("span", "caret", "height:138px;width:8px", $.s1bTxt);
    // the whole line, unseen, to know where "song" will be while it is still being typed
    $.s1bG = el("div", "abs", "left:290px;top:452px;font-weight:400;font-size:150px;white-space:nowrap;line-height:1;visibility:hidden", $.s1b);
    $.s1bG.appendChild(document.createTextNode("I have a ")); $.s1bGw = el("span", "", "", $.s1bG, "song"); $.s1bG.appendChild(document.createTextNode("."));
    // ---- S2: "song" → the icon → the name
    $.song2 = el("div", "big ice", "top:400px;font-weight:600;font-size:270px", $.s2, "song");
    $.ic2 = img("assets/brand/icon.svg", "left:850px;top:430px;width:220px;height:220px", $.s2);
    $.wm2w = el("div", "abs", "left:0;top:0;height:150px;overflow:hidden", $.s2);
    $.wm2 = img("assets/brand/wordmark.svg", "left:0;top:0;height:150px;width:340px", $.wm2w);
    $.glow2 = el("div", "abs", "left:360px;top:-70px;width:1200px;height:1200px;border-radius:50%;background:radial-gradient(closest-side, rgba(214,236,255,0.75), rgba(159,220,255,0.25) 45%, rgba(159,220,255,0))", $.s2);
    $.s2.insertBefore($.glow2, $.s2.firstChild);
    $.burst = []; var brr = rng(91);
    for (var bi = 0; bi < 34; bi++) {
      var crys = bi % 3 === 0, bsz = crys ? 26 + brr() * 38 : 6 + brr() * 12;
      var be = crys ? el("div", "abs", "left:0;top:0;width:" + px(bsz) + ";height:" + px(bsz), $.s2, '<svg viewBox="-52 -52 104 104" style="width:100%;height:100%;overflow:visible"><path d="' + FLAKE_PATH + '" fill="#ffffff"/><circle r="9" fill="#ffffff"/></svg>')
                    : el("div", "flake", "width:" + px(bsz) + ";height:" + px(bsz), $.s2);
      if (brr() < 0.35) be.style.filter = "blur(" + px(1 + brr() * 3) + ")";
      $.burst.push({ e: be, a: (bi / 34) * Math.PI * 2 + brr() * 0.5, d: 280 + brr() * 700, sz: bsz, rot: brr() * 360, vr: (brr() < 0.5 ? -1 : 1) * (60 + brr() * 140), dl: brr() * 0.07 });
    }
    $.shine2 = el("div", "abs", "left:850px;top:430px;width:220px;height:220px;-webkit-mask-image:url(assets/brand/icon.svg);mask-image:url(assets/brand/icon.svg);-webkit-mask-size:100% 100%;mask-size:100% 100%;" +
      "background:linear-gradient(115deg, rgba(255,255,255,0) 35%, rgba(255,255,255,0.85) 50%, rgba(255,255,255,0) 65%);background-size:300% 100%", $.s2);
    // ---- S3 (v5, owner's remark on v4: "toutes les transitions avec un élément de ce qu'il y a à l'écran"): ONE device that
    // changes shape, the laptop's lid becoming the phone (12.0 s), the phone becoming the tablet (13.6 s). Its screen holds
    // the three real screens, each at its own size, fitted into the screen as it changes; his takes play in their previews.
    var dv = $.dev = el("div", "abs", "left:0;top:0;width:10px;height:10px;transform-origin:0 0", $.s3a);
    $.devBase = el("div", "abs", "left:0;top:0;width:1260px;height:34px;border-radius:0 0 26px 26px;background:linear-gradient(180deg,#e3e9f2 0%,#c3ccd9 55%,#9aa6b8 100%);box-shadow:0 34px 50px rgba(30,60,110,0.28)", dv);
    $.devNotchB = el("div", "abs", "left:0;top:0;width:196px;height:12px;border-radius:0 0 12px 12px;background:#a9b3c3", $.devBase);
    $.devBezel = el("div", "bezel", "left:0;top:0", dv);
    $.devScr = el("div", "abs", "left:0;top:0;overflow:hidden", dv);   // the screen (it clips its contents)
    $.devBg = el("div", "full", "background:" + BLUE, $.devScr);
    $.cHome = el("div", "abs", "left:0;top:0;width:1196px;height:748px;transform-origin:0 0", $.devScr);
    img(ui("screen_home"), "left:0;top:0;width:100%;height:auto", $.cHome);
    // v5 (owner's remark at 15.7 s: the video went past the app's frame): each screenshot keeps its own proportions (it was
    // stretched to the device's screen), and each video sits inside the preview's frame, as the app draws it (preview())
    $.cPhone = el("div", "abs", "left:0;top:0;width:400px;height:864px;transform-origin:0 0", $.devScr);
    $.cPhoneImg = img(ui("screen_phone_edit"), "left:0;top:0;width:100%;height:auto", $.cPhone);
    $.phPrev = place(T.UI.screen_phone_edit, "view", $.cPhone, 0, 0, 400 / 390, ["v3b"], 3, 20);
    $.cTab = el("div", "abs", "left:0;top:0;width:1256px;height:862px;transform-origin:0 0", $.devScr);
    $.cTabImg = img(ui("screen_tablet_edit"), "left:0;top:0;width:100%;height:auto", $.cTab);
    $.tbPrev = place(T.UI.screen_tablet_edit, "view", $.cTab, 0, 0, 1256 / 1180, ["v3c"], 4, 28);
    $.devNotch = el("div", "abs", "left:0;top:0;width:116px;height:34px;border-radius:17px;background:#05070c", dv);
    vis($.s3b, false); vis($.s3c, false);
    // v2: the tablet's preview becomes his 9:16 card of S4 (the same take, the same instant): where it lands
    var tk = 1256 / 1180;
    $.tbV = $.tbPrev.box;                                           // the preview's inner box, in the tablet's screen
    CARD.h = 960; CARD.w = CARD.h * $.tbV[2] / $.tbV[3]; CARD.x = 960 - CARD.w / 2; CARD.y = 60;
    CARD.s = CARD.w / $.tbV[2]; CARD.r = $.tbPrev.r * CARD.s;
    CARD.x2 = BOX4.x0 + BOX4.w + 160;                               // beside the glass box, once the import starts
    // ---- S4
    var s4 = $.s4ui;
    $.ibox = el("div", "glass", "", s4);
    $.chSong = el("div", "chip", "", s4, '<span class="dot" style="background:' + BLUE + '">♫</span><span>neva die.mp3</span>');
    $.chTk = [1, 2, 3].map(function (k) { return el("div", "chip", "", s4, '<span class="th" style="background-image:url(assets/stills/t' + k + '_0' + (k + 3) + '.jpg)"></span><span>Take ' + k + '</span>'); });
    $.isend = el("div", "round", "width:88px;height:88px;border-radius:44px;background:#ffffff;box-shadow:0 12px 26px rgba(5,20,60,0.25)", s4,
      '<svg viewBox="-50 -50 100 100" style="position:absolute;inset:0"><path d="M-18 0 L16 0 M2 -15 L17 0 L2 15" fill="none" stroke="' + BLUE + '" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>');
    $.isendFill = el("div", "abs", "left:0;top:0;width:88px;height:88px;border-radius:44px;background:" + BLUE + ";opacity:0", $.isend,
      '<svg viewBox="-50 -50 100 100" style="position:absolute;inset:0"><path d="M-18 0 L16 0 M2 -15 L17 0 L2 15" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg>');
    $.ihint = el("div", "abs", "font-weight:400;font-size:30px;color:rgba(255,255,255,0.72);white-space:nowrap", s4, "Drop your song and a few takes of you performing it.");
    $.icaret = el("div", "caret", "position:absolute;height:38px", s4);
    $.ld = el("div", "abs", "left:0;top:0;width:100%;height:100%", $.ibox);
    $.ldIc = img("assets/brand/icon.svg", "left:50%;top:34px;width:70px;height:70px;margin-left:-35px", $.ld);
    $.ldTx = el("div", "abs", "left:0;right:0;top:122px;text-align:center;font-weight:500;font-size:34px;white-space:nowrap", $.ld, "Analyzing the takes…");
    $.ldOk = el("div", "abs", "left:0;right:0;top:122px;text-align:center;font-weight:500;font-size:34px;white-space:nowrap", $.ld, '<span style="color:#9fe8ff">✓</span> All the takes are synced.');
    $.ldBar = el("div", "abs", "left:110px;right:110px;top:186px;height:10px;border-radius:5px;background:rgba(255,255,255,0.22);overflow:hidden", $.ld);
    $.ldFill = el("div", "abs", "left:0;top:0;height:100%;width:0;border-radius:5px;background:linear-gradient(90deg,#9fdcff,#ffffff)", $.ldBar);
    // the real edit step, after the sync: the preview (his take) + the edit card; the cut bar is built left to right
    $.s4cam = el("div", "full", "transform-origin:0 0", $.s4);      // one camera for the whole edit step
    $.st4 = img(ui("stage_normal"), "", $.s4cam); $.ed4 = img(ui("edit_normal"), "", $.s4cam);
    $.bar4 = el("div", "abs", "background:#eef7ff;border-radius:0 0 11px 0", $.s4cam);
    $.s4cam.appendChild($.s4prev);
    // v5: the loader's bar, flying into the edit card's cut bar (it becomes the bar that is not cut yet); above the edit step
    $.fbar = el("div", "abs", "left:0;top:0;overflow:hidden;background:linear-gradient(90deg,#9fdcff,#ffffff)", $.s4);
    $.fbarB = el("div", "full", "background:#eef7ff;opacity:0", $.fbar);
    $.live.style.zIndex = "3"; $.fbar.style.zIndex = "4";          // his card passes in front of the glass box
    $.holes4 = SEG5.map(function () { return el("div", "abs", "background:#eef7ff", $.s4cam); });
    // ---- S5: the grid of his videos, then the flashes
    $.s5sky = mkSky(el("div", "full", "", null), 21); $.s5.insertBefore($.s5sky.e.parentNode || $.s5sky.e, $.s5.firstChild);
    var TL = [[90, 90, 470, 900, "TikTok · Frost", ""], [584, 90, 760, 428, "YouTube · Music video", "PRO"], [584, 542, 368, 448, "Black & white", ""],
              [976, 542, 368, 448, "35 mm film", ""], [1368, 90, 462, 900, "Lyrics on screen", ""]];
    $.TL = TL;
    $.tiles = TL.map(function (d, i) {
      var tile = $["t" + i] = R.querySelector("#t" + i); box(tile, d[0], d[1], d[2], d[3]);
      el("div", "tag", "", tile, d[4] + (d[5] ? ' <span class="pro">' + d[5] + "</span>" : ""));
      return tile;
    });
    // v5: each tile starts as one cut of the edit card's bar, in its colour (the colour gives way to his video)
    $.tcol = $.tiles.map(function (tile, i) { var c = el("div", "full", "left:0;top:0;width:100%;height:100%;background:" + SEG5[i][2], tile); tile.insertBefore(c, tile.querySelector(".tag")); return c; });
    $.t4ly = mkLyr($.tiles[4], 36, 560);
    // the Frost filter's icy veil on its borders (src/app.js FILT_FRAG, Givre); its colours are the video's media treatment
    $.t0frost = el("div", "abs", "inset:0;border-radius:28px;box-shadow:inset 0 0 70px 26px rgba(225,242,255,0.85), inset 0 0 0 3px rgba(255,255,255,0.6)", $.tiles[0]);
    $.tiles[0].insertBefore($.t0frost, $.tiles[0].querySelector(".tag"));
    // flash 2: the three takes side by side, the same instant of the song, on the sky
    $.f1sky = mkSky(el("div", "full", "", null), 27); $.f1.insertBefore($.f1sky.e, $.f1.firstChild);
    [["f1a", 150], ["f1b", 690], ["f1c", 1230]].forEach(function (d, i) {
      var e = $[d[0]]; box(e, d[1], 60, 540, 960); e.style.borderRadius = "26px";
      el("div", "tag", "", e, "Take " + (i + 1));
    });
    // flash 3: one 9:16 on the sky, his line
    $.f2sky = mkSky(el("div", "full", "", null), 33); $.f2.insertBefore($.f2sky.e, $.f2.firstChild);
    box($.f2v, 656, 0, 608, 1080); $.f2ly = mkLyr($.f2v, 52, 660);
    // flash 4: the real cut bar, very close
    $.f3sky = mkSky(el("div", "full", "", null), 41); $.f3.appendChild($.f3sky.e);
    $.f3img = img(ui("edit_shuffle"), "", $.f3);
    // ---- S6: the laptop in 3D, then the window between the words, then "ready to post"
    var lp = $.lap6; lp.style.cssText = "left:410px;top:150px;width:1100px;height:690px;transform-style:preserve-3d";
    lp.insertBefore(el("div", "bezel", "left:-18px;top:-18px;width:1136px;height:726px;border-radius:28px"), lp.firstChild);
    $.lap6s.style.cssText = "left:0;top:0;width:1100px;height:690px;border-radius:10px";
    // its base: as wide as the lid and less deep (v2, owner's remark 4: its ends went far past the screen)
    $.lap6b = el("div", "abs", "left:-18px;top:708px;width:1136px;height:540px;transform-origin:50% 0;transform:rotateX(75deg);border-radius:0 0 34px 34px;" +
      "background:linear-gradient(180deg,#cfd7e3,#9aa6b8);box-shadow:inset 0 0 0 2px #e8eef6", lp);
    el("div", "abs", "left:78px;top:44px;width:980px;height:290px;border-radius:16px;background:repeating-linear-gradient(90deg,#3a4354 0 56px,#2b3241 56px 63px),#2b3241;opacity:0.9", $.lap6b);
    el("div", "abs", "left:388px;top:362px;width:360px;height:146px;border-radius:16px;background:#b9c3d2;box-shadow:inset 0 0 0 2px #d9e0ea", $.lap6b);
    $.wBeau = el("div", "abs", "top:486px;font-weight:500;font-size:104px;white-space:nowrap;line-height:1", $.s6, "Beautifully");
    $.wEdit = el("div", "abs", "top:486px;font-weight:500;font-size:104px;white-space:nowrap;line-height:1", $.s6, "edited");
    $.readyA = el("div", "abs", "top:486px;width:800px;font-weight:500;font-size:104px;white-space:nowrap;line-height:1;text-align:right", $.s6);
    $.readyB = el("div", "abs", "top:486px;width:800px;font-weight:500;font-size:104px;white-space:nowrap;line-height:1;text-align:left", $.s6);
    $.readyL = letters($.readyA, "ready").concat(letters($.readyB, "to post"));
    var rr = rng(77); $.readyO = $.readyL.map(function () { return rr(); });
    $.tog = el("div", "abs", "width:150px;height:78px;border-radius:39px;background:rgba(255,255,255,0.22);box-shadow:inset 0 0 0 2px rgba(255,255,255,0.6), 0 12px 24px rgba(5,20,60,0.25)", $.s6);
    $.togFill = el("div", "abs", "left:0;top:0;width:100%;height:100%;border-radius:39px;background:linear-gradient(160deg,#4b95f0," + BLUE + ")", $.tog);
    $.togK = el("div", "abs", "left:7px;top:7px;width:64px;height:64px;border-radius:32px;background:#ffffff;box-shadow:0 4px 10px rgba(5,20,60,0.3)", $.tog);
    // ---- S7: the pills (the real controls), the real edit, "in any direction"
    $.s7sky = mkSky(el("div", "full", "", null), 51); $.s7.insertBefore($.s7sky.e, $.s7.firstChild);
    $.pillRow = el("div", "abs", "left:0;top:0;height:76px;white-space:nowrap", $.s7);
    var PR = [["seg", ["Chill", "Normal", "Punchy"], 1], ["seg", ["Auto", "On the words", "Every bar"], 0], ["one", "Lyrics"], ["one", "↻ Shuffle"], ["one", "Export", true]];
    $.pills = [];
    PR.forEach(function (p) {
      var g = el("div", "pill", "position:absolute;top:0;left:0" + (p[0] === "seg" ? ";padding:0 8px;gap:0" : ""), $.pillRow);
      if (p[0] === "seg") p[1].forEach(function (s, i) { el("span", "", "padding:16px 26px;border-radius:30px;" + (i === p[2] ? "background:" + BLUE + ";" : ""), g, s); });
      else { g.textContent = p[1]; if (p[2]) g.className = "pill on"; }
      $.pills.push(g);
    });
    $.ready7 = el("div", "abs", "top:486px;font-weight:500;font-size:104px;white-space:nowrap;line-height:1", $.s7, "ready");
    $.post7 = el("div", "abs", "top:486px;font-weight:500;font-size:104px;white-space:nowrap;line-height:1", $.s7, "to post");
    $.st7 = img(ui("stage_normal"), "", $.s7cam); $.st7s = img(ui("stage_shuffle"), "", $.s7cam);
    $.ed7 = img(ui("edit_normal"), "", $.s7cam); $.ed7p = img(ui("edit_punchy"), "", $.s7cam); $.ed7s = img(ui("edit_shuffle"), "", $.s7cam);
    $.s7cam.appendChild($.prev7);
    $.ly7 = mkLyr($.prev7, 33, 400);
    $.dim7 = el("div", "full", "background:rgba(5,15,45,0.28);opacity:0", $.s7cam);
    $.dir3 = el("div", "abs", "left:0;top:0;width:1920px;height:1080px;perspective:1500px", $.s7);
    $.dir3.setAttribute("data-layout-allow-overlap", ""); $.ly7.e.setAttribute("data-layout-allow-overlap", "");   // the title over the dimmed edit
    $.dir = el("div", "big", "top:430px;font-weight:600;font-size:156px;transform-style:preserve-3d", $.dir3);
    $.dirW = words($.dir, "in any direction"); $.dirW[2].className += " ice";
    // ---- S8: "What starts as" → "a few takes" → the laptop with the real Export card → a week of videos
    var s8 = $.s8;
    // v5: the words are on the laptop's screen, seen from very close (the camera pulls back out of it, r8)
    $.lap8 = el("div", "abs", "left:300px;top:0;width:1320px;height:860px;transform-origin:0 0", s8);
    $.w8 = el("div", "full", "", s8);
    $.ws8 = el("div", "big", "top:500px;font-weight:500;font-size:70px", $.w8); $.ws8W = words($.ws8, "What starts as");
    $.ft8 = el("div", "big", "top:450px;font-weight:600;font-size:160px", $.w8); $.ft8W = words($.ft8, "a few takes"); $.ft8W[2].className += " ice";
    el("div", "bezel", "left:0;top:0;width:1320px;height:836px;border-radius:32px", $.lap8);
    $.sc8 = el("div", "screen", "left:22px;top:20px;width:1276px;height:796px;border-radius:12px", $.lap8);
    $.sc8cam = el("div", "abs", "left:0;top:0;width:1276px;height:796px;transform-origin:0 0", $.sc8);
    $.sc8sky = mkSky($.sc8cam, 61);
    $.ex8 = img(ui("export"), "", $.sc8cam);
    el("div", "abs", "left:-12px;top:832px;width:1344px;height:32px;border-radius:0 0 26px 26px;background:linear-gradient(180deg,#e3e9f2 0%,#c3ccd9 55%,#9aa6b8 100%)", $.lap8);
    $.days = []; var DN = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"], DS = ["t2_06", "t3_04", "t1_07", "t2_10", "t3_09", "t1_11", "t2_02"];
    DN.forEach(function (n, i) {
      var d = el("div", "abs", "width:212px;height:420px", s8);
      el("div", "tile", "left:0;top:0;width:212px;height:377px;border-radius:22px;background:#0b1020 url(assets/stills/" + DS[i] + ".jpg) center 30%/cover no-repeat", d);
      el("div", "abs", "left:0;right:0;top:390px;text-align:center;font-weight:700;font-size:28px;letter-spacing:0.06em", d, n);
      $.days.push(d);
    });
    // ---- S9: the real Export button, then the formats' carousel with its braces
    $.s9sky = mkSky(el("div", "full", "", null), 71); $.s9.insertBefore($.s9sky.e, $.s9.firstChild);
    $.ex9 = img(ui("export"), "", $.s9); $.s9.insertBefore($.ex9, $.car);   // v5: under the cards (its button opens into the first one)
    $.car0.style.zIndex = "2";                                      // the other cards come out from behind it
    $.guide9 = el("div", "abs", "left:0;width:1920px;height:2px;background:rgba(255,255,255,0.35)", $.s9);
    var CL = [["TikTok", 315, 560], ["Reels", 315, 560], ["Shorts", 315, 560], ["YouTube", 747, 420]];
    $.cards = CL.map(function (c, i) {
      var e = $["car" + i]; e.style.width = px(c[1]); e.style.height = px(c[2]); e.style.borderRadius = "26px";
      var lb = el("div", "abs", "left:0;right:0;top:" + px(c[2] + 22) + ";text-align:center;font-weight:600;font-size:34px;white-space:nowrap", e, c[0] + (i === 3 ? ' <span class="pro" style="vertical-align:4px">PRO</span>' : ""));
      e.style.overflow = "visible"; [].forEach.call(e.querySelectorAll("video"), function (v) { v.style.borderRadius = "26px"; });
      return { e: e, w: c[1], h: c[2], lb: lb };
    });
    $.br = [el("div", "abs", "font-weight:300;font-size:250px;line-height:1;color:#fff;top:0", $.s9, "{"), el("div", "abs", "font-weight:300;font-size:250px;line-height:1;color:#fff;top:0", $.s9, "}")];
    // ---- S10: guides and the glass panel, typed
    $.s10sky = mkSky(el("div", "full", "", null), 71); $.s10.insertBefore($.s10sky.e, $.s10.firstChild);   // v5: S9's sky, the same
    $.g10 = [];
    [[0, 432, 1920, 2], [0, 650, 1920, 2], [470, 0, 2, 1080], [1448, 0, 2, 1080]].forEach(function (g) { $.g10.push(el("div", "abs", "left:" + g[0] + "px;top:" + g[1] + "px;width:" + g[2] + "px;height:" + g[3] + "px;background:rgba(255,255,255,0.4)", $.s10)); });
    $.p10 = el("div", "glass", "left:472px;top:434px;width:976px;height:216px;border-radius:0", $.s10);
    $.p10ice = el("div", "abs", "left:472px;top:649px;width:976px;height:80px;transform-origin:50% 0", $.s10, icicles(976, 26, 67, 16, 64));
    $.p10t = el("div", "abs", "left:536px;top:506px;font-weight:500;font-size:70px;white-space:nowrap;line-height:1", $.s10);
    $.p10sel = el("span", "", "border-radius:6px", $.p10t);
    $.p10a = el("span", "", "", $.p10t); $.p10b = el("span", "ice", "", $.p10t); $.p10c = el("span", "caret", "height:66px", $.p10t);
    $.p10t.insertBefore($.p10sel, $.p10a); $.p10sel.appendChild(document.createTextNode(""));
    // ---- S11: the streak, then "What will you drop today", on one line
    $.streak = el("div", "abs", "left:-200px;width:2320px;height:300px;border-radius:50%;filter:blur(40px);background:linear-gradient(180deg,rgba(255,255,255,0),rgba(235,247,255,0.95) 45%,rgba(190,228,255,0.9) 60%,rgba(255,255,255,0))", $.s11);
    $.line11 = el("div", "big", "top:430px;font-weight:600;font-size:190px", $.s11);
    $.wwy = el("span", "", "font-weight:500;font-size:68px;margin-right:34px", $.line11); $.wwyW = words($.wwy, "What will you");
    $.dropA = el("span", "w ice", "", $.line11, "drop"); $.line11.appendChild(document.createTextNode(" ")); $.dropB = el("span", "w", "", $.line11, "today");
    // ---- S12: the crystal, the mark, the call to action
    $.ice12 = el("div", "abs", "left:-20px;top:-4px;width:1960px;height:170px;transform-origin:50% 0", $.s12, icicles(1960, 46, 71, 26, 150));
    $.cr3 = el("div", "abs", "left:0;top:0;width:1920px;height:1080px;perspective:1600px", $.s12);
    $.cr = el("div", "abs", "left:560px;top:140px;width:800px;height:800px;transform-style:preserve-3d", $.cr3);
    var CRL = [["#ffffff", 0.9, 1.0, 0], ["#cfe8ff", 0.75, 0.86, 30], ["#7cc0ff", 0.55, 0.66, 0]];
    $.crL = CRL.map(function (c, i) {
      var s = el("div", "abs", "left:0;top:0;width:800px;height:800px", $.cr,
        '<svg viewBox="-52 -52 104 104" style="width:100%;height:100%;overflow:visible"><defs><linearGradient id="cg' + i + '" x1="0" y1="-1" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="' + c[0] + '"/></linearGradient></defs>' +
        '<path d="' + FLAKE_PATH + '" fill="url(#cg' + i + ')" fill-opacity="' + c[1] + '" stroke="#ffffff" stroke-width="0.7" stroke-opacity="0.9"/><circle r="8" fill="#ffffff" fill-opacity="0.85"/></svg>');
      return { e: s, k: c[2], r0: c[3] };
    });
    $.ic12 = img("assets/brand/icon.svg", "left:0;top:0;width:200px;height:200px", $.s12);
    $.wm12w = el("div", "abs", "left:0;top:0;height:142px;overflow:hidden", $.s12);
    $.wm12 = img("assets/brand/wordmark.svg", "left:0;top:0;height:142px;width:322px", $.wm12w);
    $.cta = el("div", "abs", "left:0;width:1920px;top:742px;text-align:center", $.s12);
    $.ctaBtn = el("div", "", "display:inline-block;padding:20px 54px 22px;border-radius:44px;background:#ffffff;color:" + INK + ";border:5px solid " + INK + ";box-shadow:0 8px 0 " + INK + ";font-family:'Lilita One',sans-serif;font-size:56px;line-height:1", $.cta, "stalak.app");
    $.ctaSub = el("div", "abs", "left:0;width:1920px;top:866px;text-align:center;font-weight:500;font-size:32px;color:rgba(255,255,255,0.85)", $.s12, "Free · No download · No sign-up");
  }
  // the videos of a preview, laid exactly inside the screenshot's preview frame (sx, sy: the screen's offset in the device;
  // k: css px → device px). v5: the box captured is the app's <canvas id="view"> with its border (src/theme.css: border 4 px,
  // radius 28 px; on a phone 3 px and 20 px): the picture is inside that border, with the inner radius (R - bw)
  function preview(b, bw, R) { return [b[0] + bw, b[1] + bw, b[2] - 2 * bw, b[3] - 2 * bw, R - bw]; }
  function place(info, key, parent, sx, sy, k, vids, bw, R) {
    var p = preview(info.boxes[key], bw, R), bx = [sx + p[0] * k, sy + p[1] * k, p[2] * k, p[3] * k];
    var d = el("div", "prev", "left:" + px(bx[0]) + ";top:" + px(bx[1]) + ";width:" + px(bx[2]) + ";height:" + px(bx[3]) + ";border-radius:" + px(p[4] * k), parent);
    vids.forEach(function (id) { var v = R_(id); if (v) d.appendChild(v); });
    d.box = bx; d.r = p[4] * k;
    return d;
  }
  function R_(id) { return R.querySelector("#" + id); }

  // ================================================================= render
  function layer(e, t, a, b) { var on = t >= a && t < b; vis(e, on); return on; }
  function render(t) {
    var S = T.S;
    // the worlds: which one is on
    // v2: the worlds overlap where a transition melts one into the next (the night comes in under "I have a song.", the
    // studio holds the three devices and gives way to the blue under the tablet's push, the blue rides the S8 → S9 swipe,
    // waits under S10's streak and fades into the night under the crystal)
    var night = (t < S.s1) || (t >= S.s2 - 0.45 && t < S.s3a) || (t >= S.s12);
    // v5: the blue stays under the tiles flying off the cut bar (to 24.35), and comes in as the last flash tilts into S6's laptop
    var blue = (t >= S.s4 - 0.4 && t < S.s5 + 0.35) || (t >= FLX().wide[1] - 0.05 && t < S.s7 + 1.3) || (t >= S.s8 - 0.32 && t < S.s9 + 0.2) || (t >= S.s11 - 0.3 && t < S.s12 + 0.3);
    var studio = (t >= S.s3a && t < S.s4);
    vis($["w-night"], night); vis($["w-blue"], blue); vis($["w-studio"], studio);
    if (night) { auroraAt(t); snowAt($.nfl, t); crystalsAt($.ncr, t); }
    if (blue) {
      snowAt($.bfl, t); crystalsAt($.bcr, t); op($["w-blue"], 1 - E.io2(seg(t, S.s12, S.s12 + 0.3)));
      tf($["w-blue"], "none"); $["w-blue"].style.filter = "none";      // v5: no more swipe from S8 to S9
    }
    if (studio) op($["w-studio"], 1 - E.io2(seg(t, S.s4 - 0.4, S.s4)));
    r0(t, S); r1(t, S); r2(t, S); r3(t, S); r4(t, S); r5(t, S); r6(t, S); r7(t, S); r8(t, S); r9(t, S); r10(t, S); r11(t, S); r12(t, S);
    // v3: big soft flakes pass in front, in the open shots (not over the app's close-ups)
    var fa = 0, FW = [[1.7, 5.1], [9.75, 22.3], [29.0, 31.5], [40.1, 44.5], [53.7, 60.5]];
    FW.forEach(function (w) { fa = Math.max(fa, seg(t, w[0], w[0] + 0.5) * (1 - seg(t, w[1] - 0.5, w[1]))); });
    vis($.fg, fa > 0.001); if (fa > 0.001) fgAt($.fgf, t, fa);
    cursorAt(t, curPath(t, S), [K.go, K.toggle6, K.punchy, K.shuffle, K.pack, K.export]);
  }
  // ---- S0 + S1: the spark, the icon's window, the glass composer
  function r0(t, S) {
    var on = layer($.s0, t, 0, S.s1); if (!on) return;
    var r = t, q = E.expo(seg(r, 0, 0.35)), s = q * (1 + 0.1 * E.io2(seg(r, 0.35, 0.55))) * (1 - E.i3(seg(r, 0.52, 0.66)));
    op($.spark, 1 - seg(r, 0.6, 0.68));
    tf($.spark, "scale(" + Math.max(0.001, s).toFixed(3) + ") rotate(" + (lerp(0, 30, q) + 15 * E.io2(seg(r, 0.35, 0.66))).toFixed(1) + "deg)");
  }
  function r1(t, S) {
    var on = layer($.skywrap, t, S.s0 + 0.52, S.s2); if (!on) { return; }
    var r = t - S.s1, m = t - S.s0;
    // the icon's window grows (S0), then the sky is plain
    if (m < 1.55) maskAt($.skywrap, ICON_MASK, m < 0.72 ? 110 * E.expo(seg(m, 0.52, 0.72)) : lerp(110, 4800, E.i3(seg(m, 0.72, 1.55))), 960, 540 + 20, 142 / 112);
    else maskAt($.skywrap, null);
    snowAt($.sfl, t); bokehAt($.sbk, t); crystalsAt($.scr1, t);
    // the camera: zoomed on the + button, pulls back, then pushes into the box
    var ZX = 420, ZY = 692, s, cx, cy;
    var back = E.io2(seg(r, 1.45, 2.75)), push = E.i2(seg(t, S.s1b - 0.5, S.s1b));
    s = lerp(2.4, 1.0, back); cx = lerp(ZX, 960, back); cy = lerp(ZY, 560, back);
    if (push > 0) { s = lerp(1.0, 2.9, push); cx = lerp(960, 560, push); cy = 560; }
    var inner = lerp(1.22, 1.0, E.o3(seg(m, 0.52, 1.9)));          // the world inside the window settles
    $.skycam.style.transformOrigin = "0 0";
    tf($.skycam, "translate(" + px(960 - cx * s * inner) + "," + px(540 - cy * s * inner) + ") scale(" + (s * inner).toFixed(4) + ")");
    blur($.skycam, t >= S.s1b ? lerp(6, 12, seg(t, S.s1b, S.s1b + 0.4)) : 8 * push);
    op($.skywrap, 1 - E.io2(seg(t, S.s2 - 0.45, S.s2)));            // v2: the sky goes out to the night as the camera nears "song"
    // × turns into +
    tf($.gx, "rotate(" + (45 * E.io3(seg(r, 0.15, 0.75))).toFixed(2) + "deg)");
    // the pill grows out of the + button
    var pq = E.expo(seg(r, 0.85, 1.35));
    $.gpill.style.width = px(lerp(76, 390, pq)); op($.gpill, seg(r, 0.85, 0.95));
    $.gpill.style.clipPath = "inset(0 round 38px)";
    var lab = $.gpill.children; op(lab[1], seg(r, 1.05, 1.3)); blur(lab[1], (1 - seg(r, 1.05, 1.3)) * 6);
    // the title and the box come in as the camera pulls back
    wordsIn($.heroW, t, S.s1 + 1.55, 0.08, 0.18, 8); wordsIn($.subW, t, S.s1 + 1.95, 0.05, 0.16, 6);
    op($.gbox, seg(r, 1.4, 1.9)); op($.gsend, seg(r, 1.6, 2.0));
    op($.gice, seg(r, 1.65, 1.85)); tf($.gice, "scaleY(" + Math.max(0.001, E.expo(seg(r, 1.65, 2.25))).toFixed(4) + ")");   // v3: its icicles grow
    vis($.gcaret, r > 2.2 && caretOn(t - S.s1, false));
  }
  // ---- S1b: "I have a song." (typed while the voice says "a song?"), then S2: "song" → the icon → "Stalak"
  function r2(t, S) {
    var onb = layer($.s1b, t, S.s1b, S.s2 + 0.12);
    if (onb) {
      var rb = t - S.s1b, full = "I have a song.", n = Math.floor(seg(t, K.type1[0], K.type1[1]) * full.length + 0.0001);
      $.s1bT.textContent = full.slice(0, Math.min(n, 9)); $.s1bW.textContent = full.slice(9, Math.min(n, 13)); $.s1bE.textContent = full.slice(13, n);
      var push = E.io3(seg(t, S.s2 - 0.45, S.s2));
      vis($.s1bC, push === 0 && caretOn(t, t < K.type1[1]));
      var z = 1;                                                   // v3: no creeping zoom on the typed line (it read as "linear")
      $.s1bTxt.style.transformOrigin = "0 75px"; tf($.s1bTxt, "scale(" + z.toFixed(4) + ")");
      op($.s1bBox, seg(rb, 0, 0.2) * (1 - E.o2(seg(push, 0, 0.7))));
      // v2: the camera pushes into "song" until it is the next shot's "song" (in the middle, 270 px); the other words go
      var g = $.s1bGw, wx = 290 + (g.offsetLeft + g.offsetWidth / 2) * z, wy = 452 + 75;
      cam($.s1b, [wx, wy], [lerp(wx, 960, push), lerp(wy, 535, push)], lz(1, 270 / (150 * z), push));
      var rest = seg(push, 0.1, 0.7); op($.s1bT, 1 - rest); op($.s1bE, 1 - rest); blur($.s1bT, rest * 12); blur($.s1bE, rest * 12);
      op($.s1bW, 1 - seg(t, S.s2 - 0.08, S.s2 + 0.1)); blur($.s1bW, 3 * push);
    }
    var on = layer($.s2, t, S.s2 - 0.1, S.s3a); if (!on) return;
    var r = t - S.s2;
    // "song": floating toward the camera, blurred, then melting into the icon (v2: it takes over from the typed "song")
    var sq = seg(r, 0, 1.0), melt = E.io2(seg(r, 0.75, 1.15));
    op($.song2, (1 - melt) * E.o3(seg(r, -0.08, 0.1)));
    blur($.song2, lerp(3, 4, sq) + 22 * melt);
    tf($.song2, "scale(" + (lerp(1.0, 1.06, E.o3(sq)) * lerp(1, 0.55, melt)).toFixed(4) + ")");
    // the icon: appears from the blur, shines, shrinks, slides left; the name wipes in beside it on "Stalak"
    var iq = E.o3(seg(r, 0.85, 1.3)), shrink = E.io2(seg(r, 1.3, 1.75)), slide = E.o4(seg(r, 1.85, 2.35));
    var size = lerp(220, 168, shrink);
    var x = lerp(960 - size / 2, 960 - (168 + 30 + 340) / 2, slide), y = 540 - size / 2 - 10;
    box($.ic2, x, y, size, size); op($.ic2, iq); blur($.ic2, (1 - iq) * 18);
    box($.shine2, x, y, size, size); op($.shine2, seg(r, 1.2, 1.3) * (1 - seg(r, 1.75, 1.85)));
    $.shine2.style.backgroundPosition = lerp(100, 0, E.io2(seg(r, 1.2, 1.8))).toFixed(1) + "% 0";
    var wx = x + 168 + 30, wy = 540 - 75 - 6;
    box($.wm2w, wx, wy); $.wm2w.style.width = px(340 * E.o3(seg(r, 1.95, 2.5))); op($.wm2w, seg(r, 1.9, 2.0));
    // v2: the camera dives into the icon's blue, right of its "S": the frame is all Stalak blue (#1f6fd6) just before the cut,
    // and the next shot comes out of the same blue, on the laptop's screen
    var dive = E.i3(seg(t, S.s3a - 0.5, S.s3a - 0.04)), P = [x + size * 106 / 128, y + size * 88 / 128];
    cam($.s2, P, [lerp(P[0], 960, dive), lerp(P[1], 540, dive)], lz(1, 70, dive));
    blur($.s2, 1.2 * dive);
    // v3: the beat drops on "Meet Stalak." (8.8 s): a burst of snow and ice out of the logo, and its light
    var D = K.beatDrop, cx = x + (168 + 30 + 340) / 2, cy = y + size / 2;
    op($.glow2, 0.6 * seg(t, D - 0.02, D + 0.04) * (1 - E.o2(seg(t, D + 0.04, D + 0.6))));
    $.burst.forEach(function (p) {
      var a0 = D + p.dl, q = E.expo(seg(t, a0, a0 + 1.1)), on = t >= a0 && t < a0 + 1.2; vis(p.e, on); if (!on) return;
      var dd = p.d * q, px_ = cx + Math.cos(p.a) * dd - p.sz / 2, py_ = cy + Math.sin(p.a) * dd * 0.78 - p.sz / 2 + 60 * E.i2(seg(t, a0, a0 + 1.1));
      tf(p.e, "translate(" + px(px_) + "," + px(py_) + ") rotate(" + (p.rot + p.vr * (t - a0)).toFixed(1) + "deg) scale(" + lerp(0.4, 1, E.o3(seg(t, a0, a0 + 0.25))).toFixed(3) + ")");
      op(p.e, seg(t, a0, a0 + 0.04) * (1 - E.i2(seg(t, a0 + 0.35, a0 + 1.15))));
    });
  }
  // ---- S3: the devices
  // v5: the device's three shapes (its screen x, y, w, h and radius; its bezel around the screen: left, top, right, bottom
  // and radius), on the same studio set. The laptop is v4's (its screen at 362, 124); the phone and the tablet face us.
  var DEV = {
    lap: { s: [362, 124, 1196, 748], r: 12, b: [20, 18, 20, 18], br: 30 },
    ph: { s: [760, 108, 400, 864], r: 54, b: [18, 18, 18, 18], br: 70 },
    tab: { s: [332, 109, 1256, 862], r: 30, b: [22, 22, 22, 22], br: 52 }
  };
  function devShape(A, B, qw, qh) {     // between two shapes: the width leads, the height follows (a supple change)
    var cx = lerp(A.s[0] + A.s[2] / 2, B.s[0] + B.s[2] / 2, qw), cy = lerp(A.s[1] + A.s[3] / 2, B.s[1] + B.s[3] / 2, qh);
    var w = lerp(A.s[2], B.s[2], qw), h = lerp(A.s[3], B.s[3], qh), q = (qw + qh) / 2;
    return { s: [cx - w / 2, cy - h / 2, w, h], r: lerp(A.r, B.r, q), b: A.b.map(function (v, i) { return lerp(v, B.b[i], q); }), br: lerp(A.br, B.br, q) };
  }
  function fitIn(e, cw, ch, sw, sh, s, x, y, o, b) {   // a content layer of natural size cw x ch, scaled s, at x, y in the screen
    vis(e, o > 0.002); if (o <= 0.002) return;
    tf(e, "translate(" + px(x) + "," + px(y) + ") scale(" + s.toFixed(5) + ")"); op(e, o); blur(e, b);
  }
  function r3(t, S) {
    var on = layer($.s3, t, S.s3a, S.s4); if (!on) return;
    // v5 (owner's remark on v4, "des transitions qui se fondent dans le décor"): no more pans from device to device. The
    // laptop's lid becomes the phone on the bar line of 12.0 s, the phone becomes the tablet on 13.6 s: the frame changes
    // shape while its screen goes from one real screen to the next; from the phone to the tablet, the preview (his take)
    // glides from the one to the other. The laptop's base drops away; the set's light drifts behind (parallax).
    var qaw = E.io3(seg(t, 11.70, 12.32)), qah = E.io3(seg(t, 11.80, 12.42)), qa = (qaw + qah) / 2;
    var qbw = E.io3(seg(t, 13.28, 13.90)), qbh = E.io3(seg(t, 13.38, 14.00)), qb = (qbw + qbh) / 2;
    var D = qb > 0 ? devShape(DEV.ph, DEV.tab, qbw, qbh) : devShape(DEV.lap, DEV.ph, qaw, qah);
    var dX = (qa + qb) * 220; tf($.sun, "translateX(" + px(-0.35 * dX) + ")"); crystalsAt($.stcr, t, -0.55 * dX);
    vis($.s3a, true);
    var sx = D.s[0], sy = D.s[1], sw = D.s[2], sh = D.s[3];
    box($.devScr, sx, sy, sw, sh); $.devScr.style.borderRadius = px(D.r);
    box($.devBezel, sx - D.b[0], sy - D.b[1], sw + D.b[0] + D.b[2], sh + D.b[1] + D.b[3]); $.devBezel.style.borderRadius = px(D.br);
    var bz = [sx - D.b[0], sy - D.b[1], sw + D.b[0] + D.b[2], sh + D.b[1] + D.b[3]];
    // the laptop's base, under its lid, until the lid starts changing
    var bo = 1 - seg(qa, 0, 0.45); vis($.devBase, bo > 0.002);
    if (bo > 0.002) { box($.devBase, bz[0] - 12, bz[1] + bz[3] - 4, bz[2] + 24, 34); op($.devBase, bo); tf($.devBase, "translateY(" + px(70 * E.i2(seg(qa, 0, 0.6))) + ")"); $.devNotchB.style.left = px((bz[2] + 24) / 2 - 98); }
    var no = seg(qa, 0.6, 1) * (1 - seg(qb, 0, 0.35)); vis($.devNotch, no > 0.002);
    if (no > 0.002) { box($.devNotch, bz[0] + bz[2] / 2 - 58, bz[1] + 32); op($.devNotch, no); }
    // the screens: the home page and the phone fitted to the screen's height; then the phone and the tablet with their
    // previews on the same spot (the take changes there: take 3 → take 2)
    var pb = $.phPrev.box, tb = $.tbPrev.box, bl = 7 * Math.sin(Math.PI * qa) + 7 * Math.sin(Math.PI * qb);
    if (qb <= 0) {
      var sH = sh / 748, sP = sh / 864;
      fitIn($.cHome, 1196, 748, sw, sh, sH, (sw - 1196 * sH) / 2, 0, 1 - seg(qa, 0.25, 0.7), bl);
      fitIn($.cPhone, 400, 864, sw, sh, sP, (sw - 400 * sP) / 2, 0, seg(qa, 0.3, 0.75), bl);
      vis($.cTab, false);
    } else {
      var P0 = [DEV.ph.s[0] + pb[0], DEV.ph.s[1] + pb[1], pb[2]], T0 = [DEV.tab.s[0] + tb[0], DEV.tab.s[1] + tb[1], tb[2]];
      var Pr = [lerp(P0[0], T0[0], qb), lerp(P0[1], T0[1], qb), lerp(P0[2], T0[2], qb)];
      var kP = Pr[2] / pb[2], kT = Pr[2] / tb[2];
      vis($.cHome, false);
      fitIn($.cPhone, 400, 864, sw, sh, kP, Pr[0] - pb[0] * kP - sx, Pr[1] - pb[1] * kP - sy, 1 - seg(qb, 0.3, 0.75), bl);
      fitIn($.cTab, 1256, 862, sw, sh, kT, Pr[0] - tb[0] * kT - sx, Pr[1] - tb[1] * kT - sy, seg(qb, 0.25, 0.7), bl);
    }
    // the phone leans a little while it is a phone
    var rz = -2.5 * (qa - qb), ccx = sx + sw / 2, ccy = sy + sh / 2;
    var rot = Math.abs(rz) > 0.01 ? " translate(" + px(ccx) + "," + px(ccy) + ") rotate(" + rz.toFixed(3) + "deg) translate(" + px(-ccx) + "," + px(-ccy) + ")" : "";
    // v2: the tablet comes to us until its preview is his 9:16 card of S4, the same take going on; the rest of it goes
    var b1 = E.io3(seg(t, S.s4 - 1.25, S.s4)), Z = lz(1, CARD.s, b1);
    var Pc = [DEV.tab.s[0] + tb[0] + tb[2] / 2, DEV.tab.s[1] + tb[1] + tb[3] / 2], Qc = [lerp(Pc[0], CARD.x + CARD.w / 2, b1), lerp(Pc[1], CARD.y + CARD.h / 2, b1)];
    tf($.dev, (b1 > 0 ? "translate(" + px(Qc[0] - Pc[0] * Z) + "," + px(Qc[1] - Pc[1] * Z) + ") scale(" + Z.toFixed(5) + ")" : "") + rot || "none");
    var fade = E.io2(seg(t, S.s4 - 0.38, S.s4 - 0.03));
    op($.devBezel, 1 - fade); op($.cTabImg, 1 - fade); op($.devBg, 1 - fade);
    $.tbPrev.style.boxShadow = fade > 0 ? "0 " + px(30 / Z) + " " + px(60 / Z) + " rgba(5,20,60," + (0.32 * fade).toFixed(3) + ")" : "none";   // = the card's shadow
    // v2: the shot starts inside the laptop's screen, in the home page's sky left of its card (the same blue as the icon),
    // and pulls back out of it
    var out = E.expo(seg(t, S.s3a, S.s3a + 1.7)), P = [499.5, 535.4];
    if (out < 1) { cam($.s3a, P, [lerp(960, P[0], out), lerp(540, P[1], out)], lz(9, 1, out)); blur($.s3a, 1.4 * (1 - seg(t, S.s3a, S.s3a + 0.45))); }
    else { tf($.s3a, "none"); blur($.s3a, 0); }
  }
  // ---- S4: him; the import (song and takes on the words); the sync; the real edit
  var BOX4 = { x0: 170, x1: 520, y: 390, w: 880, h: 300 };
  var CARD = {};                    // v2: his 9:16 card (init: where the tablet's preview lands)
  function bx4(t) { return lerp(BOX4.x0, BOX4.x1, E.io3(seg(t, K.slide4, K.slide4 + 0.35))); }
  function cam4(t, S) {         // v5: the edit step's camera on screen (its offset and scale): where its bar is
    var L = edit4(t, S), eq = E.io2(seg(t, BAR4[0] + 0.2, BAR4[1] + 0.1)), es = lerp(1.03, 1.0, eq) * L.es;
    return { L: L, eq: eq, es: es, ox: L.ox + 960 * (1 - es), oy: L.oy + 540 * (1 - es) };
  }
  var FL5END = 28.4;                // v5: S5's last flash has become S6's laptop by then
  function edit4(t, S) {        // the edit step's layout and the camera that moves along the cut bar
    var I = T.UI, sw = I.stage_normal.w, ew = I.edit_normal.w, g = 30, x0 = (W - sw - g - ew) / 2;
    var L = { stx: x0, sty: (H - I.stage_normal.h) / 2, edx: x0 + sw + g, edy: (H - I.edit_normal.h) / 2 };
    var cam = E.io2(seg(t, K.edit4 + 0.35, S.s5 - 0.05)), es = lerp(1, 1.5, cam);
    var bcx = L.edx + 370, bcy = L.edy + 624;                      // the bar's middle (css px of the card)
    L.ox = lerp(0, 960 - 960 * (1 - 1.5) - bcx * 1.5, cam) ; L.oy = lerp(0, 640 - 540 * (1 - 1.5) - bcy * 1.5, cam);
    L.es = es; return L;
  }
  // v5: S4's moments, all made of what is on screen (owner's remark on v4)
  // the five cuts of the bar that become the grid's tiles (x0, x1 in css px of the edit card, measured; their colour), by tile
  var SEG5 = [[165, 204, "#e0952c"], [370, 532, "#d6336c"], [206, 286, "#3a6fe0"], [534, 614, "#e0952c"], [616, 696, "#d6336c"]];
  var FLY4 = [19.62, 20.12];        // his card flies into the "Take 2" chip, on "your takes"
  var BAR4 = [22.42, 22.98];        // the loader's bar flies into the edit card's cut bar
  function cardX(t) { return lerp(CARD.x, CARD.x2, E.io3(seg(t, K.split, K.split + 0.6))); }
  function boxLR(t) {               // the glass box comes out from behind his card, to the left, as the card moves aside
    var d = bx4(t) - BOX4.x0;
    return [lerp(CARD.x + 40, BOX4.x0, E.io3(seg(t, K.split + 0.04, K.split + 0.78))) + d, lerp(CARD.x + 80, BOX4.x0 + BOX4.w, E.io3(seg(t, K.split, K.split + 0.66))) + d];
  }
  function r4(t, S) {
    var on = layer($.s4, t, S.s4, S.s5 + 0.3); if (!on) return;
    var I = T.UI, L = edit4(t, S), BX = 44, BY = 601, BW = 652.5, BH = 45.5;   // the cuts inside the card's bar (css px of the 746-wide card)
    // the glass box, its hint, the chips, the → button
    var LR = boxLR(t), bx = LR[0], by = BOX4.y, bw = LR[1] - LR[0], bh = BOX4.h;
    var morph = E.io3(seg(t, K.go + 0.05, K.go + 0.45));             // → the loader card
    var lw = 760, lh = 240, lx2 = 960 - lw / 2, ly2 = 420;
    var fx = lerp(bx, lx2, morph), fy = lerp(by, ly2, morph), fw = lerp(bw, lw, morph), fh = lerp(bh, lh, morph);
    var boxIn = seg(t, K.split, K.split + 0.12), boxOut = E.io2(seg(t, BAR4[0] + 0.03, BAR4[0] + 0.38));
    $.ibox.style.transformOrigin = "50% 50%";
    box($.ibox, fx, fy, fw, fh); op($.ibox, boxIn * (1 - boxOut)); tf($.ibox, "scale(" + lerp(1, 0.97, boxOut).toFixed(4) + ")"); blur($.ibox, 5 * boxOut);
    mblur($.s4ui, "mbx3", t >= K.slide4 && t < K.go ? mbFrame(bx4(t) - bx4(t - 1 / T.FPS)) : 0);
    var chipOut = seg(t, K.go + 0.05, K.go + 0.25);
    var hint = seg(t, K.split + 0.45, K.split + 0.75) * (1 - seg(t, K.chSong - 0.05, K.chSong + 0.1));
    box($.ihint, bx + 48, by + 62); op($.ihint, hint);
    box($.icaret, bx + 46, by + 60); vis($.icaret, hint > 0.5 && caretOn(t, false));
    function chipY(t0, y) { return by + y + 18 * (1 - E.expo(seg(t, t0, t0 + 0.35))); }
    function chip(e, t0, x, y) { var q = E.expo(seg(t, t0, t0 + 0.35)); box(e, bx + x, chipY(t0, y)); op(e, q * (1 - chipOut)); blur(e, (1 - q) * 6 + chipOut * 8); }
    chip($.chSong, K.chSong, 44, 46);
    $.chTk.forEach(function (c, i) { chip(c, K.chTk[i], 44 + i * 246, 136); });
    box($.isend, bx + bw - 120, by + bh - 116); op($.isend, seg(t, K.split + 0.3, K.split + 0.55) * (1 - chipOut));
    op($.isendFill, seg(t, K.go, K.go + 0.04));
    // v2 (owner's remark 1: no more close-up of his face): him in his 9:16 card, the tablet's preview that came to us; it
    // moves aside while the glass box comes out from behind it, then (v5) it flies into the box on "your takes": it
    // becomes the "Take 2" chip's picture
    var fq = E.io3(seg(t, FLY4[0], FLY4[1])), cOn = t < FLY4[1]; vis($.live, cOn);
    if (cOn) {
      var tx = bx + 44 + 246 + 10 + 22, ty = chipY(K.chTk[1], 136) + 32;        // the chip's picture (44 px round), its middle
      var cw = lz(CARD.w, 44, fq), ch = lz(CARD.h, 44, fq), ccx = lerp(cardX(t) + CARD.w / 2, tx, fq), ccy = lerp(CARD.y + CARD.h / 2, ty, fq) - 90 * Math.sin(Math.PI * fq);
      box($.live, ccx - cw / 2, ccy - ch / 2, cw, ch); op($.live, 1 - seg(fq, 0.86, 1));
      var k = cw / CARD.w; $.live.style.borderRadius = px(lerp(CARD.r, 22, E.io2(fq)));
      $.live.style.boxShadow = "0 " + px(30 * k) + " " + px(60 * k) + " rgba(5,20,60,0.32)";
      var cxAt = function (tt) { var q = E.io3(seg(tt, FLY4[0], FLY4[1])); return lerp(cardX(tt) + CARD.w / 2, tx, q); };
      mblur($.live, "mbx2", mbFrame(cxAt(t) - cxAt(t - 1 / T.FPS)));
      var lv = $.live.querySelector("video"); if (lv) tf(lv, "none");
    }
    // the loader: icon, "Analyzing the takes…", the bar, then "All the takes are synced." on "music"
    var lq = seg(t, K.go + 0.3, K.go + 0.5), ok = seg(t, K.synced - 0.05, K.synced + 0.05), lo = seg(t, BAR4[0] - 0.12, BAR4[0] + 0.12);
    op($.ld, lq); tf($.ldIc, "rotate(" + (lerp(0, 360, E.io2(seg(t, K.go + 0.3, K.synced)))).toFixed(1) + "deg)");
    op($.ldTx, 1 - ok); blur($.ldTx, ok * 6); op($.ldOk, ok * (1 - lo)); blur($.ldOk, (1 - ok) * 6 + lo * 6); op($.ldIc, 1 - lo);
    $.ldFill.style.width = (100 * E.io2(seg(t, K.go + 0.4, K.synced - 0.05))).toFixed(1) + "%";
    vis($.ldBar, t < BAR4[0]);                                       // from then on it is the bar flying to the edit card
    // the real edit step: preview + card; the camera goes along the cut bar while its cuts are built
    var C4 = cam4(t, S), eq = C4.eq, es = C4.es, ox = C4.ox, oy = C4.oy;
    var edOn = t >= BAR4[0] + 0.18; vis($.s4cam, edOn);
    if (edOn) {
      tf($.s4cam, "translate(" + px(ox) + "," + px(oy) + ") scale(" + es.toFixed(4) + ")"); op($.s4cam, eq);
      box($.st4, L.stx, L.sty, I.stage_normal.w, I.stage_normal.h);
      box($.ed4, L.edx, L.edy, I.edit_normal.w, I.edit_normal.h);
      var vb = preview(I.stage_normal.boxes.view, 4, 28);              // v5: inside the preview's frame
      box($.s4prev, L.stx + vb[0], L.sty + vb[1], vb[2], vb[3]); $.s4prev.style.borderRadius = px(vb[4]);
      var built = E.io2(seg(t, BAR4[1], S.s5 - 0.3));
      box($.bar4, L.edx + BX + BW * built, L.edy + BY, BW * (1 - built), BH); vis($.bar4, t >= BAR4[1] && built < 1);
      // v5: the cuts that fly off to become the grid's tiles leave their place empty in the bar
      SEG5.forEach(function (g, i) { var h = $.holes4[i], on_ = t >= K.tiles5[i]; vis(h, on_); if (on_) box(h, L.edx + g[0], L.edy + 602.5, g[1] - g[0], 44); });
    }
    var away = E.io2(seg(t, S.s5 - 0.28, S.s5 + 0.22)); op($.s4, 1 - away); blur($.s4, 8 * away);
    // v5: the loader's bar leaves its card and lands in the edit card as its cut bar, which is then cut, left to right
    var bq = E.io3(seg(t, BAR4[0], BAR4[1])), bOn = t >= BAR4[0] && t < BAR4[1]; vis($.fbar, bOn);
    if (bOn) {
      var b0 = [lx2 + 110, ly2 + 186, lw - 220, 10], b1 = [ox + es * (L.edx + BX), oy + es * (L.edy + BY), es * BW, es * BH];
      box($.fbar, lerp(b0[0], b1[0], bq), lerp(b0[1], b1[1], bq), lerp(b0[2], b1[2], bq), lerp(b0[3], b1[3], bq));
      $.fbar.style.borderRadius = px(lerp(5, 3, bq)); op($.fbarB, E.io2(seg(bq, 0.3, 0.9)));
    }
  }
  // ---- S5: the grid, then four flashes on the beats
  function r5(t, S) {
    var on = layer($.s5, t, K.tiles5[0], FL5END); if (!on) return;
    var r = t - S.s5, FL = T.FL;
    var gridOn = t < S.s5f; vis($.bento, gridOn); vis($.s5sky.e, gridOn);
    if (gridOn) {
      skyAt($.s5sky, t); op($.s5sky.e, E.io2(seg(t, K.tiles5[0] + 0.05, S.s5 + 0.3)));
      // v5 (owner's remark on v4): the grid is made of the cut bar: five of its cuts lift off, fly out and open into the
      // tiles, their colour giving way to his videos (no more flight through the bar and tiles fading in)
      var C4 = cam4(t, S);
      $.tiles.forEach(function (e, i) {
        var g = SEG5[i], d = $.TL[i], a = K.tiles5[i], q = E.io3(seg(t, a, a + 0.8));
        var x0 = C4.ox + C4.es * (C4.L.edx + g[0]), y0 = C4.oy + C4.es * (C4.L.edy + 602.5), w0 = C4.es * (g[1] - g[0]), h0 = C4.es * 44;
        var w = lz(w0, d[2], q), h = lz(h0, d[3], q), cx = lerp(x0 + w0 / 2, d[0] + d[2] / 2, q), cy = lerp(y0 + h0 / 2, d[1] + d[3] / 2, q);
        vis(e, t >= a); box(e, cx - w / 2, cy - h / 2, w, h); tf(e, "none"); blur(e, 0);
        e.style.borderRadius = px(lerp(3, 28, E.io2(seg(q, 0, 0.6))));
        op($.tcol[i], 1 - E.io2(seg(q, 0.4, 0.85)));
        if (i === 0) op($.t0frost, seg(q, 0.65, 1));                   // the Frost veil once the tile is open
        var v = e.querySelector("video"); if (v) op(v, seg(q, 0.3, 0.75));
        op(e.querySelector(".tag"), seg(q, 0.85, 1));
      });
      // the camera: a slow push, then (v2) into the YouTube tile, which fills the frame and IS his music video (flash 1)
      var pu = E.io3(seg(t, S.s5f - 0.5, S.s5f - 0.03)), Z0 = 1;
      cam($.bento, [lerp(960, 584 + 380, pu), lerp(540, 90 + 214, pu)], [960, 540], lz(Z0, 1920 / 760, pu));
      var yt = $.tiles[1]; if (pu > 0) { yt.style.borderRadius = px(28 * (1 - pu)); op(yt.querySelector(".tag"), 1 - seg(pu, 0, 0.4)); }
      yt.style.boxShadow = "0 24px 50px rgba(5,20,60," + (0.3 * (1 - pu)).toFixed(3) + "), inset 0 0 0 1.5px rgba(255,255,255," + (0.4 * (1 - pu)).toFixed(3) + ")";
      lyrAt($.t4ly, T.LY.t4, t);
    }
    // v5 (owner's remark on v4): the flashes are one move from card to card. His music video (flash 1) shrinks into the
    // middle card; the two other takes come out from behind it (flash 2); take 3's card comes to the middle and grows to
    // the full height, his line on it (flash 3); that card widens to the full frame as his music video comes back on it,
    // and the frame tilts back into the laptop of S6 (r6). No more cut bar close-up.
    var F = FLX(), f0On = t >= FL[0] && t < F.f0[1], f1On = t >= F.f0[0] && t < FL5END, f2On = t >= F.f2[0] && t < FL5END;
    vis($.f0, f0On); vis($.f1, f1On); vis($.f2, f2On); vis($.f3, false);
    var SL = { a: [150, 60, 540, 960], b: [690, 60, 540, 960], c: [1230, 60, 540, 960], v: [656, 0, 608, 1080], full: [0, 0, 1920, 1080] };
    function rl(A, B, q) { return [lerp(A[0], B[0], q), lerp(A[1], B[1], q), lerp(A[2], B[2], q), lerp(A[3], B[3], q)]; }
    function bx(e, R4, rad) { box(e, R4[0], R4[1], R4[2], R4[3]); e.style.borderRadius = px(rad); }
    var q0 = E.io3(seg(t, F.f0[0], F.f0[1])), R0 = rl(SL.full, SL.b, q0);
    var q2 = E.io3(seg(t, F.f2[0], F.f2[1])), Rc2 = rl(SL.c, SL.v, q2);
    if (f0On) { bx($.f0, R0, 26 * q0); op($.f0, 1 - seg(t, F.f0[0] + 0.26, F.f0[1] - 0.06)); tf($.f0, "none"); blur($.f0, 0); $.f0.style.zIndex = "3"; }
    if (f1On) {
      skyAt($.f1sky, t); op($.f1sky.e, seg(t, F.f0[0], F.f0[0] + 0.2));
      var cards = t < F.f2[1] + 0.02; [$.f1a, $.f1b, $.f1c].forEach(function (e) { vis(e, cards); });
      if (cards) {
        var qs = E.io3(seg(t, F.fan[0], F.fan[1])), recede = E.io2(seg(t, F.f2[0], F.f2[0] + 0.4));
        bx($.f1b, t < F.f0[1] ? R0 : SL.b, 26);
        bx($.f1a, rl(SL.b, SL.a, qs), 26); op($.f1a, seg(t, F.fan[0], F.fan[0] + 0.12) * (1 - recede));
        bx($.f1c, q2 > 0 ? Rc2 : rl(SL.b, SL.c, qs), lerp(26, 0, q2)); op($.f1c, seg(t, F.fan[0], F.fan[0] + 0.12));
        op($.f1b, 1 - recede);
        // the two others step back while take 3 comes to the middle
        [$.f1a, $.f1b].forEach(function (e) { e.style.transformOrigin = "50% 50%"; tf(e, recede > 0 ? "translateX(" + px(-60 * recede) + ") scale(" + lerp(1, 0.9, recede).toFixed(4) + ")" : "none"); blur(e, 8 * recede); });
        $.f1b.style.zIndex = q2 > 0 ? "1" : "2"; $.f1a.style.zIndex = "1"; $.f1c.style.zIndex = q2 > 0 ? "2" : "1";
        [$.f1a, $.f1b, $.f1c].forEach(function (e) { op(e.querySelector(".tag"), seg(t, F.fan[0] + 0.15, F.fan[0] + 0.3) * (1 - seg(t, F.f2[0], F.f2[0] + 0.15))); });
      }
    }
    if (f2On) {
      vis($.f2sky.e, false); lyrAt($.f2ly, T.LY.f2, t);
      var q3 = E.io3(seg(t, F.wide[0], F.wide[1]));
      bx($.f2v, q3 > 0 ? rl(SL.v, SL.full, q3) : Rc2, lerp(26, 0, q2)); tf($.f2v, "none");
      op($.f2v, seg(t, F.f2[0] + 0.15, F.f2[0] + 0.4)); op($.f2ly.e, 1 - seg(t, F.wide[0] + 0.05, F.wide[0] + 0.25));
    }
  }
  function S10X(S) { return [S.s10 - 0.35, S.s10 + 0.25]; }   // v5: the YouTube card becomes S10's glass panel
  function S8X(S) {                  // v5: S8's camera: out of the laptop's screen (back), its inner push undone (unz), into it (push)
    return { Z0: 1.62, back: [S.s8 + 2.0, S.s8 + 2.85], unz: [K.pack + 0.25, K.pack + 0.9], push: [S.s9 - 0.5, S.s9 + 0.15] };
  }
  function FLX() {                   // v5: the moves of the flash chain (on the flashes' bar lines, FL)
    var FL = T.FL;
    return { f0: [FL[1] - 0.28, FL[1] + 0.26], fan: [FL[1] - 0.08, FL[1] + 0.5], f2: [FL[2] - 0.25, FL[2] + 0.3], wide: [FL[3] - 0.22, FL[3] + 0.3], tilt: [FL[3] + 0.3, FL[3] + 1.25] };
  }
  // ---- S6: the laptop in 3D → "Beautifully [window] edited" → "ready ○ to post", switched on by the cursor
  function r6(t, S) {
    var F = FLX(), on = layer($.s6, t, F.wide[0], S.s7 + 0.3); if (!on) return;   // its toggle stays a moment into S7: the pills grow out of it
    var r = t - S.s6, after = t >= S.s7;
    tf($.s6, "none"); blur($.s6, 0);
    vis($.readyA, !after); vis($.readyB, !after); vis($.lap6, !after);
    var flat = E.io3(seg(r, 0.95, 2.0)), orbit = E.io2(seg(t, F.tilt[0], S.s6 + 1.4));
    // v5 (owner's remark on v4): it comes out of the last flash. Take 3's card widens to the full frame while his music video
    // comes back on it: that frame is the laptop's screen, which tilts back into the laptop (its lid, its base) — the
    // frame goes into the set instead of a flight through it
    var wq = E.io3(seg(t, F.wide[0], F.wide[1])), back = E.io3(seg(t, F.tilt[0], F.tilt[1])), pre = t < F.wide[1];
    // v2: seen a little from above, the lid leaning back 15° on its base: the keyboard deck shows, as wide as the lid
    var ry = back * lerp(lerp(-26, -14, orbit), 0, flat), rx = back * lerp(-10, 0, flat);
    var ww = lerp(1100, 420, flat), wh = lerp(690, 236, flat), wy = lerp(96, 540 - 236 / 2 - 4, flat);
    var sh0 = K.ready6 - 0.1, shrink = E.io3(seg(t, sh0, sh0 + 0.55)), tw = lerp(ww, 150, shrink), th = lerp(wh, 78, shrink);
    var fx = 960 - tw / 2, fy = lerp(wy, 540 - 39 + 12, shrink);
    if (pre) { fx = lerp(656, 0, wq); fy = 0; tw = lerp(608, 1920, wq); th = 1080; }       // = take 3's card, widening
    else if (back < 1) { fx = lerp(0, fx, back); fy = lerp(0, fy, back); tw = lerp(1920, tw, back); th = lerp(1080, th, back); }
    box($.lap6, fx, fy, tw, th);
    $.lap6s.style.width = px(tw); $.lap6s.style.height = px(th); $.lap6s.style.borderRadius = px(pre ? 0 : lerp(0, lerp(10, 39, shrink), back));
    var bz = $.lap6.firstChild; bz.style.width = px(tw + 36 * (1 - flat)); bz.style.height = px(th + 36 * (1 - flat)); bz.style.left = px(-18 * (1 - flat)); bz.style.top = px(-18 * (1 - flat));
    bz.style.borderRadius = px(lerp(28, 39, shrink)); op(bz, pre ? 0 : 1 - flat * 0.85);
    op($.lap6b, pre ? 0 : 1 - E.o2(seg(r, 0.95, 1.35))); $.lap6b.style.top = px(th + 18);
    tf($.lap6b, "rotateX(75deg) scaleX(" + (tw / 1100).toFixed(4) + ")");      // the hinge at 105°; as wide as the lid, always
    $.lap6.style.transformOrigin = "50% 50%";
    // a longer lens (v2): the base's near edge no longer looks much wider than the screen
    tf($.lap6, "perspective(4000px) rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg)");
    op($.lap6, seg(t, F.wide[0] + 0.14, F.wide[0] + 0.42) * (1 - seg(t, sh0 + 0.5, sh0 + 0.65)));
    // the words slide in beside the window, on "Beautifully"
    var wq = E.o4(seg(t, K.words6, K.words6 + 0.75)), gone = seg(t, sh0 - 0.05, sh0 + 0.2);
    var bw = 600;
    box($.wBeau, 960 - 236 / 2 - 44 - bw + lerp(-420, 0, wq), 486); $.wBeau.style.width = px(bw); $.wBeau.style.textAlign = "right";
    box($.wEdit, 960 + 236 / 2 + 44 + lerp(420, 0, wq), 486);
    op($.wBeau, wq * (1 - gone)); op($.wEdit, wq * (1 - gone)); blur($.wBeau, (1 - wq) * 10 + gone * 10); blur($.wEdit, (1 - wq) * 10 + gone * 10);
    // "ready ○ to post": letters landing out of order on "ready", then the toggle, switched on after "post"
    var open = E.io3(seg(t, sh0 + 0.55, sh0 + 0.85)), g = lerp(24, 190, open);
    box($.readyA, 960 - g / 2 - 20 - 800, 486); box($.readyB, 960 + g / 2 + 20, 486);
    $.readyL.forEach(function (l, i) { var a = K.ready6 + 0.05 + $.readyO[i] * 0.45, q = seg(t, a, a + 0.15); op(l, q); blur(l, (1 - q) * 8); });
    var tq = E.o3(seg(t, sh0 + 0.55, sh0 + 0.8)), tout = seg(t, S.s7 + 0.04, S.s7 + 0.28);
    box($.tog, 960 - 75, 486 + 8 + 4); op($.tog, tq * (1 - tout)); blur($.tog, 8 * tout);
    tf($.tog, "scale(" + (lerp(0.7, 1, tq) * lerp(1, 1.5, E.o2(tout))).toFixed(3) + ")");
    var sw = E.o3(seg(t, K.toggle6, K.toggle6 + 0.2)); $.togK.style.left = px(lerp(7, 79, sw)); op($.togFill, sw);
  }
  // ---- S7: the pills, the real edit (Punchy, his lyric, Shuffle), "in any direction", closing in a flake
  function r7(t, S) {
    var on = layer($.s7, t, S.s7, S.s8); if (!on) return;
    var r = t - S.s7, I = T.UI, k = 1.15, stx = 300, sty = 88, edx = 300 + 370 * k + 34, edy = 84;
    var LD = [0.85, 1.25];            // v5: the edit card comes in around the pills that fly into it (r, from S7)
    vis($.s7sky.e, r >= LD[0]); if (r >= LD[0]) { skyAt($.s7sky, t); op($.s7sky.e, E.io2(seg(r, LD[0], LD[1]))); }
    // the pills, out of the toggle. v5 (owner's remark on v4: transitions made of what is on screen; no more dive into
    // "Punchy"): they are the app's controls, so each one flies to its place in the real edit, which appears around them:
    // Pace and Cuts to their rows of the card, Lyrics to its line, Shuffle to its button; Export goes (it is not here)
    var rowOn = r < 1.45; vis($.pillRow, rowOn); vis($.ready7, r < 0.6); vis($.post7, r < 0.6);
    if (rowOn) {
      var gap = 22, ws = $.pills.map(function (p) { return p.offsetWidth || 200; });
      var tot = ws.reduce(function (a, b) { return a + b; }, 0) + gap * 4, x = 960 - tot / 2 - 60 * E.io2(seg(r, 0.3, 0.9));
      var ES = I.edit_normal, SS = I.stage_normal.boxes.shuffle;
      var TG = [[edx + 107 * k, edy + 158.5 * k, 231 * k, 48 * k], [edx + 107 * k, edy + 96.5 * k, 288 * k, 48 * k], [edx + 49 * k, edy + 692.5 * k, 0, 41.5 * k],
                [stx + SS[0] * k, sty + SS[1] * k, SS[2] * k, SS[3] * k], null];
      box($.pillRow, x, 540 - 38); tf($.pillRow, "none"); blur($.pillRow, 0);
      $.pills.forEach(function (p, i) {
        var d = Math.abs(i - 2), q = E.expo(seg(r, 0.02 + d * 0.06, 0.45 + d * 0.06)), f = E.io3(seg(r, 0.75 + 0.03 * i, 1.3 + 0.03 * i));
        var l0 = ws.slice(0, i).reduce(function (a, b) { return a + b + gap; }, 0); p.style.left = px(l0);
        var tg = TG[i], sx = 1, sy = 1, dx = 0, dy = 0, w = ws[i];
        if (tg) {                                                       // where it lands (its middle), at the size of its control
          if (!tg[2]) { tg = tg.slice(); tg[2] = w * tg[3] / 76; }
          sx = lerp(1, tg[2] / w, f); sy = lerp(1, tg[3] / 76, f);
          dx = lerp(0, tg[0] + tg[2] / 2 - (x + l0 + w / 2), f); dy = lerp(0, tg[1] + tg[3] / 2 - 540, f);
        } else { dy = 120 * E.i2(f); }
        p.style.transformOrigin = "50% 50%";
        tf(p, "translate(" + px(dx) + "," + px(dy) + ") scale(" + (lerp(0.5, 1, q) * sx).toFixed(4) + "," + (lerp(0.5, 1, q) * sy).toFixed(4) + ")");
        op(p, q * (1 - seg(f, tg ? 0.62 : 0.2, tg ? 1 : 0.7))); blur(p, (1 - q) * 10 + (tg ? 0 : 8 * f));
      });
      var away = E.io2(seg(r, 0.0, 0.5));
      box($.ready7, 960 - 75 - 40 - 300 - 400 * away, 486); $.ready7.style.width = "300px"; $.ready7.style.textAlign = "right";
      box($.post7, 960 + 75 + 40 + 400 * away, 486); op($.ready7, 1 - away); op($.post7, 1 - away); blur($.ready7, away * 12); blur($.post7, away * 12);
    }
    // the real edit, as Stalak shows it
    var uiOn = r >= LD[0]; vis($.s7cam, uiOn);
    if (uiOn) {
      var land = E.io2(seg(r, LD[0], LD[1])), dq = E.io2(seg(t, K.dir[0] - 0.1, K.dir[0] + 0.3));
      tf($.s7cam, "none"); op($.s7cam, land); blur($.s7cam, (1 - land) * 6 + 7 * dq);
      [$.st7, $.st7s].forEach(function (e) { box(e, stx, sty, I.stage_normal.w * k, I.stage_normal.h * k); });
      vis($.st7, t < K.shuffle); vis($.st7s, t >= K.shuffle);
      [$.ed7, $.ed7p, $.ed7s].forEach(function (e) { box(e, edx, edy, I.edit_normal.w * k, I.edit_normal.h * k); });
      vis($.ed7, t < K.punchy); vis($.ed7p, t >= K.punchy && t < K.shuffle); vis($.ed7s, t >= K.shuffle);
      var vb = preview(I.stage_normal.boxes.view, 4, 28);              // v5: inside the preview's frame
      box($.prev7, stx + vb[0] * k, sty + vb[1] * k, vb[2] * k, vb[3] * k); $.prev7.style.borderRadius = px(vb[4] * k);
      lyrAt($.ly7, T.LY.p7, t);
      op($.dim7, dq);
    }
    // "in any direction", in 3D over the edit, word by word on the voice
    var dOn = t >= K.dir[0] - 0.1; vis($.dir3, dOn);
    if (dOn) {
      var dd = E.expo(seg(t, K.dir[0] - 0.1, K.dir[0] + 1.0));
      tf($.dir, "rotateY(" + lerp(26, 12, dd).toFixed(2) + "deg) rotateX(" + lerp(8, 3, dd).toFixed(2) + "deg) translateZ(" + lerp(-80, 40, dd).toFixed(1) + "px)");
      wordsAt($.dirW, t, K.dir, 0.2, 14);
    }
    // closing in an ice crystal (the next world shows behind)
    var cq = E.i3(seg(t, S.s8 - 0.32, S.s8));
    if (cq > 0) maskAt($.s7, FLAKE_MASK, lerp(5200, 0, cq), 960, 540, 1); else maskAt($.s7, null);
  }
  // ---- S8: "What starts as" → "a few takes" → the laptop with the real Export card → a week of videos
  function r8(t, S) {
    var on = layer($.s8, t, S.s8, S.s9 + 0.2); if (!on) return;
    var r = t - S.s8, A8 = S8X(S);
    tf($.s8, "none"); $.s8.style.filter = "none"; op($.s8, seg(t, S.s8, S.s8 + 0.18));
    // v5 (owner's remark on v4: no more slides): the words are on the laptop's screen, seen from so close that it fills the
    // frame; the camera pulls back out of it (the laptop no longer rises from below) and, at the end, pushes back into it,
    // to its Export button: S9 is that button (no more swipe up)
    var I = T.UI.export, k = 1.25, exx = (1276 - I.w * k) / 2, exy = 70, eb = I.boxes.export;
    var pb = E.io3(seg(t, A8.back[0], A8.back[1])), ps = E.io3(seg(t, A8.push[0], A8.push[1]));
    var Bx = 22 + exx + (eb[0] + eb[2] / 2) * k, By = 20 + exy + (eb[1] + eb[3] / 2) * k;          // the Export button, in the laptop
    var Zl, Q, P;
    if (ps > 0) { Zl = lz(1, 2.0 / k, ps); P = [Bx, By]; Q = [lerp(300 + Bx, 960, ps), lerp(140 + By, 540, ps)]; }
    else { Zl = lz(A8.Z0, 1, pb); P = [660, 418]; Q = [960, lerp(540, 558, pb)]; }
    tf($.lap8, "translate(" + px(Q[0] - 300 - P[0] * Zl) + "," + px(Q[1] - P[1] * Zl) + ") scale(" + Zl.toFixed(5) + ")");
    $.ex8R = [Q[0] - P[0] * Zl + Zl * (22 + exx), Q[1] - P[1] * Zl + Zl * (20 + exy), Zl * k];       // its export card on screen (r9 lays S9's on it)
    // the words: on the screen while it fills the frame; they go with it, and give way to the export card
    var wz = ps > 0 ? 1 / A8.Z0 : lz(1, 1 / A8.Z0, pb);
    cam($.w8, [960, 540], [960, lerp(540, 558, pb)], wz); op($.w8, 1 - seg(t, A8.back[0] + 0.25, A8.back[0] + 0.6)); blur($.w8, 5 * seg(t, A8.back[0] + 0.25, A8.back[0] + 0.6));
    var up1 = E.io3(seg(t, K.ft8[0] - 0.12, K.ft8[0] + 0.22));
    wordsAt($.ws8W, t, K.ws8, 0.2, 10); tf($.ws8, "translateY(" + px(-150 * up1) + ")");
    wordsAt($.ft8W, t, K.ft8, 0.22, 12);
    // the laptop, its screen: the real export card on the sky; the camera pushes to the pack row, then back
    var push = E.io3(seg(t, K.pack - 0.55, K.pack - 0.05)) * (1 - E.io3(seg(t, A8.unz[0], A8.unz[1])));
    vis($.lap8, true); box($.ex8, exx, exy, I.w * k, I.h * k); op($.ex8, seg(t, A8.back[0] + 0.3, A8.back[0] + 0.7));
    var pk = I.boxes.pack, px0 = exx + (pk[0] + pk[2] / 2) * k, py0 = exy + (pk[1] + pk[3] / 2) * k, zs = lerp(1, 2.0, push);
    tf($.sc8cam, "translate(" + px(lerp(0, 638 - px0 * zs, push)) + "," + px(lerp(0, 398 - py0 * zs, push)) + ") scale(" + zs.toFixed(4) + ")");
    skyAt($.sc8sky, t);
    // the week: seven videos out of the screen, MON → SUN; at the push into the screen they fly on past us
    var dOut = E.io2(seg(t, K.pack + 0.1, K.pack + 0.6)) * (1 - E.io2(seg(t, A8.push[0] - 0.05, A8.push[0] + 0.3)));
    op($.lap8, 1 - dOut * 0.85); blur($.lap8, dOut * 8);
    [].forEach.call($.lap8.children, function (c) { if (c !== $.sc8) op(c, 1 - seg(t, A8.push[0] + 0.25, A8.push[1] - 0.05)); });   // its lid and base go
    var fly = E.i2(seg(t, A8.push[0], A8.push[0] + 0.5));
    $.days.forEach(function (d, i) {
      var q = E.expo(seg(t, K.pack + 0.1 + i * 0.07, K.pack + 0.6 + i * 0.07)), x = 960 - (7 * 212 + 6 * 26) / 2 + i * 238, dx = x + 106 - 960;
      box(d, x + dx * 1.6 * fly, lerp(560, 300, q) + 260 * fly * (i % 2 ? 1 : -0.4)); op(d, q * (1 - seg(fly, 0.4, 1))); blur(d, 10 * fly);
      tf(d, "scale(" + (lerp(0.6, 1, q) * lerp(1, 2.6, fly)).toFixed(3) + ")");
    });
  }
  // ---- S9: the real Export button → the formats' carousel, picked one by one as the voice says them
  function r9(t, S) {
    var A8 = S8X(S), PM = S10X(S), on = layer($.s9, t, A8.push[1] - 0.25, PM[1] + 0.02); if (!on) return;
    skyAt($.s9sky, t); blur($.s9sky.e, 14 * E.io2(seg(t, PM[0], PM[1])));
    // v5 (owner's remark on v4): it comes out of the push into the laptop's screen (r8), on its Export button
    tf($.s9, "none"); $.s9.style.filter = "none"; op($.s9, seg(t, A8.push[1] - 0.23, A8.push[1]));
    var I = T.UI.export, eb = I.boxes.export, k = 2.0, ex = 960 - (eb[0] + eb[2] / 2) * k, ey = 540 - (eb[1] + eb[3] / 2) * k;
    var gq = E.io2(seg(t, K.export + 0.22, K.export + 0.62)), s = lerp(k, 1.9, gq);
    if (t < A8.push[1] && $.ex8R) box($.ex9, $.ex8R[0], $.ex8R[1], I.w * $.ex8R[2], I.h * $.ex8R[2]);   // still on the laptop's card
    else box($.ex9, 960 - (eb[0] + eb[2] / 2) * s, 540 - (eb[1] + eb[3] / 2) * s, I.w * s, I.h * s);
    op($.ex9, 1 - gq); blur($.ex9, gq * 6);
    // the cards slide so that the one being said sits in the braces
    var picks = K.pick, idx = 0;
    for (var i = 0; i < picks.length; i++) if (t >= picks[i] - 0.15) idx = i;
    var gap = 170, xs = [], x = 0;                                  // room for the braces between two cards
    $.cards.forEach(function (c) { xs.push(x + c.w / 2); x += c.w + gap; });
    var posAt = function (tt) { var p_ = xs[0]; for (var j = 1; j < picks.length; j++) p_ = lerp(p_, xs[j], E.io3(seg(tt, picks[j] - 0.3, picks[j]))); return p_; };
    var pos = posAt(t); mblur($.car, "mbx2", mbFrame(pos - posAt(t - 1 / T.FPS)));
    var cardsIn = E.o3(seg(t, K.export + 0.5, K.export + 0.9)), fwd = E.expo(seg(t, picks[3] + 0.2, picks[3] + 1.0));
    // v5: the Export button he clicked opens into the first format's card (TikTok); the others come out from behind it
    var mq = E.io3(seg(t, K.export + 0.2, K.export + 0.75)), oq = E.io3(seg(t, K.export + 0.55, K.export + 1.05));
    var B0 = [ex + eb[0] * k, ey + eb[1] * k, eb[2] * k, eb[3] * k];
    // v5: then the YouTube card becomes the glass panel of S10 (its video gives way to the frosted glass)
    var pm = E.io3(seg(t, PM[0], PM[1])), P10 = [472, 434, 976, 216];
    $.cards.forEach(function (c, i) {
      var cxx = 960 + xs[i] - pos, sc = i === 3 ? lerp(1, 1.35, fwd) : 1, R4 = [cxx - c.w * sc / 2, 540 - 30 - c.h * sc / 2, c.w * sc, c.h * sc], rad = 26 * sc;
      if (i === 0 && mq < 1) { R4 = [lerp(B0[0], R4[0], mq), lerp(B0[1], R4[1], mq), lerp(B0[2], R4[2], mq), lerp(B0[3], R4[3], mq)]; rad = lerp(56, 26, mq); }
      if (i > 0 && oq < 1) { var Rt = [960 - $.cards[0].w / 2, 540 - 30 - $.cards[0].h / 2]; R4[0] = lerp(Rt[0] + (c.w < 400 ? 0 : -216), R4[0], oq); R4[1] = lerp(Rt[1] + (c.h - $.cards[0].h) / -2, R4[1], oq); }
      if (i === 3 && pm > 0) { R4 = [lerp(R4[0], P10[0], pm), lerp(R4[1], P10[1], pm), lerp(R4[2], P10[2], pm), lerp(R4[3], P10[3], pm)]; rad = lerp(rad, 0, pm); }
      if (i === 3) { $.p10R = R4; $.p10r = rad; }                      // (r10 lays its glass panel on it)
      box(c.e, R4[0], R4[1], R4[2], R4[3]); tf(c.e, "none"); c.e.style.borderRadius = px(rad);
      c.lb.style.top = px(R4[3] + 22 * sc);
      [].forEach.call(c.e.querySelectorAll("video"), function (v) { v.style.borderRadius = px(rad); op(v, i === 0 ? seg(mq, 0.35, 0.85) : i === 3 ? 1 - seg(pm, 0.35, 0.9) : 1); });
      c.e.style.background = i === 0 && mq < 1 ? INK : "";
      op(c.e, i === 0 ? seg(t, K.export + 0.2, K.export + 0.3) * (1 - fwd) : i === 3 ? seg(oq, 0, 0.3) : seg(oq, 0, 0.3) * (1 - fwd));
      op(c.lb, cardsIn * (i > 0 ? seg(oq, 0.7, 1) : 1) * (i === 3 ? 1 - seg(t, PM[0] - 0.2, PM[0]) : 1)); blur(c.e, 0);
    });
    var cur = $.cards[idx];
    $.br[0].style.left = px(960 - cur.w / 2 - 98); $.br[1].style.left = px(960 + cur.w / 2 + 22);
    $.br.forEach(function (b) { b.style.top = px(540 - 30 - 140); op(b, cardsIn * (1 - fwd)); });
    box($.guide9, 0, 540 - 30); op($.guide9, cardsIn * 0.8 * (1 - fwd));
  }
  // ---- S10: the glass panel: "Less time editing." typed, selected, replaced by "More time making music."
  function r10(t, S) {
    var PM = S10X(S), on = layer($.s10, t, PM[0], S.s11 + 0.45); if (!on) return;
    var r = t - S.s10; skyAt($.s10sky, t); blur($.s10sky.e, 14); op($.s10sky.e, seg(t, PM[1] - 0.12, PM[1]));
    // v5 (owner's remark on v4): the YouTube card of S9 becomes this glass panel (r9): no more flight into his video. Then
    // (v2) it is wiped away by S11's light streak, from the top
    tf($.s10, "none"); op($.s10, 1);
    var pm = E.io3(seg(t, PM[0], PM[1])), R4 = $.p10R || [472, 434, 976, 216];
    if (t < PM[1]) { box($.p10, R4[0], R4[1], R4[2], R4[3]); $.p10.style.borderRadius = px($.p10r || 0); }
    else { box($.p10, 472, 434, 976, 216); $.p10.style.borderRadius = "0px"; }
    var sk = seg(t, S.s11 - 0.2, S.s11 + 0.55), yc = lerp(-420, 1300, E.io2(sk)) + 150;   // the streak's middle (r11)
    gmask($.s10, sk > 0 ? "linear-gradient(180deg, rgba(0,0,0,0) " + px(yc - 30) + ", #000 " + px(yc + 110) + ")" : null);
    var g = E.o3(seg(r, 0.0, 0.5)); $.g10.forEach(function (e) { op(e, g * 0.9); });
    op($.p10, t < PM[1] ? seg(pm, 0.1, 0.5) : 1);
    op($.p10ice, seg(r, 0.3, 0.45)); tf($.p10ice, "scaleY(" + Math.max(0.001, E.expo(seg(r, 0.3, 0.95))).toFixed(4) + ")");
    var A = "Less time editing.", B1 = "More time making ", B2 = "music.", typing = false;
    if (t < K.del[1]) {
      var n = Math.floor(seg(t, K.less[0], K.less[1]) * A.length + 0.0001); typing = t >= K.less[0] && t < K.less[1];
      var sel = seg(t, K.del[0], K.del[0] + 0.14);                        // shift + home: the text is selected from its end
      var ns = Math.round(A.length * sel);
      $.p10a.textContent = A.slice(0, n - ns); $.p10sel.textContent = ns > 0 ? A.slice(n - ns, n) : "";
      $.p10sel.style.background = ns > 0 ? "rgba(159,220,255,0.5)" : "none";
      $.p10b.textContent = "";
      $.p10t.insertBefore($.p10a, $.p10sel);
    } else {
      var m = Math.floor(seg(t, K.more[0], K.more[1]) * (B1.length + B2.length) + 0.0001); typing = t >= K.more[0] && t < K.more[1];
      $.p10sel.textContent = ""; $.p10sel.style.background = "none";
      $.p10a.textContent = B1.slice(0, Math.min(m, B1.length)); $.p10b.textContent = m > B1.length ? B2.slice(0, m - B1.length) : "";
    }
    vis($.p10c, t >= K.less[0] - 0.4 && caretOn(t, typing) && $.p10sel.textContent === "");
  }
  // ---- S11: the streak, then "What will you drop today", each word on the voice
  function r11(t, S) {
    var on = layer($.s11, t, S.s11 - 0.35, S.s12 + 0.5); if (!on) return;
    var r = t - S.s11, sq = E.io2(seg(r, -0.2, 0.55));
    box($.streak, -200, lerp(-420, 1300, sq)); op($.streak, 1 - seg(r, 0.45, 0.6));
    wordsAt($.wwyW, t, K.wwy, 0.18, 8);
    var dq = E.o3(seg(t, K.drop, K.drop + 0.3)); op($.dropA, dq); blur($.dropA, (1 - dq) * 12);
    var tq = E.o3(seg(t, K.today, K.today + 0.3)); op($.dropB, tq); blur($.dropB, (1 - tq) * 12);
    var burst = E.i2(seg(t, S.s12 + 0.1, S.s12 + 0.45)); op($.line11, 1 - burst); blur($.line11, burst * 16);
    $.line11.style.transformOrigin = "960px 95px"; tf($.line11, "scale(" + lerp(1, 1.12, burst).toFixed(4) + ")");
  }
  // ---- S12: the crystal opens, closes into the icon; the name on "Stalak"; stalak.app
  function r12(t, S) {
    var on = layer($.s12, t, S.s12, S.end + 1); if (!on) return;
    var r = t - S.s12;
    op($.ice12, seg(r, 0.25, 0.4)); tf($.ice12, "scaleY(" + Math.max(0.001, E.expo(seg(r, 0.25, 1.1))).toFixed(4) + ")");   // v3: frost from the top
    var open = E.expo(seg(r, 0, 0.5)), close = E.io3(seg(r, 1.0, 1.45));
    var cs = lerp(0.05, 1.0, open) * lerp(1, 0.25, close);
    vis($.cr3, r < 1.5);
    tf($.cr, "scale(" + cs.toFixed(4) + ") rotateX(" + lerp(28, 8, E.io2(seg(r, 0, 1.4))).toFixed(2) + "deg) rotateY(" + lerp(-30, 20, E.io2(seg(r, 0, 1.4))).toFixed(2) + "deg) rotateZ(" + (lerp(-40, 50, E.o2(seg(r, 0, 1.45)))).toFixed(2) + "deg)");
    $.crL.forEach(function (l, i) { tf(l.e, "translateZ(" + (i * -60) + "px) rotate(" + (l.r0 + lerp(0, 20 * (i + 1), E.o2(seg(r, 0, 1.4)))).toFixed(2) + "deg) scale(" + l.k + ")"); });
    op($.cr, 1 - seg(r, 1.3, 1.45));
    // the icon, out of the crystal; then the lockup
    var iq = E.o3(seg(r, 1.25, 1.55)), slide = E.o4(seg(t, K.mark - 0.1, K.mark + 0.4));
    var lockW = 164 + 30 + 322, size = lerp(200, 164, E.io2(seg(r, 1.4, 1.75)));
    var x = lerp(960 - size / 2, 960 - lockW / 2, slide), y = 470 - size / 2;
    box($.ic12, x, y, size, size); op($.ic12, iq); blur($.ic12, (1 - iq) * 14);
    box($.wm12w, x + 164 + 30, 470 - 71 - 8); $.wm12w.style.width = px(322 * E.o3(seg(t, K.mark, K.mark + 0.55))); op($.wm12w, seg(t, K.mark - 0.05, K.mark + 0.05));
    var cq = E.expo(seg(t, K.mark + 0.5, K.mark + 1.0)); op($.cta, cq); tf($.cta, "translateY(" + px(26 * (1 - cq)) + ")"); blur($.cta, (1 - cq) * 6);
    var sq = E.o3(seg(t, K.mark + 0.75, K.mark + 1.15)); op($.ctaSub, sq); blur($.ctaSub, (1 - sq) * 6);
  }
  // ---- the cursor's paths, to the real buttons, clicking on the words
  function curPath(t, S) {
    var I = T.UI;
    if (t >= K.go - 0.55 && t <= K.go + 0.45) {                   // the → button of the glass box (in the middle by then)
      var tx = BOX4.x1 + BOX4.w - 120 + 44, ty = BOX4.y + BOX4.h - 116 + 44;
      return [[K.go - 0.55, 1990, 1150], [K.go - 0.1, tx, ty], [K.go + 0.12, tx, ty], [K.go + 0.45, tx + 260, ty + 520]];
    }
    if (t >= K.toggle6 - 0.5 && t <= K.toggle6 + 0.5) {           // the toggle between "ready" and "to post"
      return [[K.toggle6 - 0.5, 1560, 1160], [K.toggle6 - 0.08, 952, 540], [K.toggle6 + 0.15, 952, 540], [K.toggle6 + 0.5, 1280, 1200]];
    }
    if (t >= K.punchy - 0.5 && t <= K.shuffle + 0.7) {            // Punchy, then ↻ Shuffle
      var k = 1.15, edx = 300 + 370 * k + 34, edy = 84, pb = I.edit_normal.boxes.punchy, sb = I.stage_normal.boxes.shuffle;
      var px1 = edx + (pb[0] + pb[2] / 2) * k, py1 = edy + (pb[1] + pb[3] / 2) * k, px2 = 300 + (sb[0] + sb[2] / 2) * k, py2 = 88 + (sb[1] + sb[3] / 2) * k;
      return [[K.punchy - 0.5, 1990, 1150], [K.punchy - 0.08, px1, py1], [K.punchy + 0.25, px1, py1], [K.shuffle - 0.1, px2, py2], [K.shuffle + 0.25, px2, py2], [K.shuffle + 0.7, px2 + 300, 1200]];
    }
    if (t >= K.pack - 0.5 && t <= K.pack + 0.4) {                 // Make the pack (CREATOR+), on the laptop's screen
      return [[K.pack - 0.5, 1700, 1150], [K.pack - 0.08, 975, 560], [K.pack + 0.1, 975, 560], [K.pack + 0.4, 1200, 1200]];
    }
    if (t >= K.export - 0.5 && t <= K.export + 0.45) {            // Export
      return [[K.export - 0.5, 1500, 1150], [K.export - 0.08, 960, 540], [K.export + 0.12, 960, 540], [K.export + 0.45, 1250, 1180]];
    }
    return null;
  }
  return { init: init, render: render };
})();
