/* « One take » v3 — the render engine. One shape that never cuts: every style below is a pure function of t (seconds).
   Springs are closed-form step responses; a value with many targets is the sum of one spring per change.
   window.T comes from times.js (build.py). ONE.init(root) builds the repeated parts, ONE.render(t) draws a frame.
   v3: the voice runs without gaps, its words appear one by one, "Stalak" is the logo, the snippet at the end lasts one bar. */
(function () {
  "use strict";
  var T = window.T, P = T.P, TOTAL = T.TOTAL;
  function B(b) { return b * P; }
  function W(i, rel) { return T.VO[i][0] + rel; }   // a word of voice line i, rel seconds after the line starts (measured in the files)
  function sat(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function mix(a, b, k) { return a + (b - a) * k; }
  function eOut(x) { x = sat(x); return 1 - Math.pow(1 - x, 3); }
  function eOut5(x) { x = sat(x); return 1 - Math.pow(1 - x, 5); }
  function eIn(x) { x = sat(x); return x * x * x; }
  function eIO(x) { x = sat(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function eBack(x, s) { x = sat(x); var u = x - 1; return 1 + (s + 1) * u * u * u + s * u * u; }
  function bump(x) { return x <= 0 || x >= 1 ? 0 : Math.sin(Math.PI * x); }
  function decay(t, a, tau) { return t < a ? 0 : Math.exp(-(t - a) / tau); }
  function spr(t, w, z) {
    if (t <= 0) return 0;
    if (z >= 1) return 1 - Math.exp(-w * t) * (1 + w * t);
    var wd = w * Math.sqrt(1 - z * z);
    return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + (z * w / wd) * Math.sin(wd * t));
  }
  // a damped kick that starts and ends at 0, peak ~1 (w 10.5, z 0.62)
  function impulse(t, w, z) { if (t <= 0) return 0; var wd = w * Math.sqrt(1 - z * z); return Math.exp(-z * w * t) * Math.sin(wd * t) / 0.384; }
  // track from keys [[t, v, w?, z?], ...]: v0 + sum over changes of (vi - v(i-1)) * spring(t - ti)
  function K(keys, w0, z0) {
    w0 = w0 || 14; z0 = z0 || 0.8;
    return function (t) {
      var v = keys[0][1];
      for (var i = 1; i < keys.length; i++) { var k = keys[i]; if (t <= k[0]) break; v += (k[1] - keys[i - 1][1]) * spr(t - k[0], k[2] || w0, k[3] || z0); }
      return v;
    };
  }
  function hex(h) { h = h.replace("#", ""); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
  function CE(keys, d) {   // colour steps (no bounce)
    var c = keys.map(function (k) { return [k[0], hex(k[1])]; });
    return function (t) {
      var v = c[0][1].slice();
      for (var i = 1; i < c.length; i++) { if (t <= c[i][0]) break; var k = eIO((t - c[i][0]) / d); for (var j = 0; j < 3; j++) v[j] = mix(v[j], c[i][1][j], k); }
      return "rgb(" + Math.round(v[0]) + "," + Math.round(v[1]) + "," + Math.round(v[2]) + ")";
    };
  }
  function rng(s) { return function () { s |= 0; s = s + 0x6D2B79F5 | 0; var t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function hash(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
  function win(t, a, b, din, dout) {
    if (din === undefined) din = 0.16; if (dout === undefined) dout = 0.12;
    if (t < a || t > b + dout) return 0;
    var i = din <= 0 ? 1 : eOut((t - a) / din), o = 1 - eIn((t - b) / dout);
    return Math.max(0, Math.min(i, o));
  }
  function show(el, k, blur, extra) {
    if (!el) return;
    if (blur === undefined) blur = 10;
    el.style.opacity = k.toFixed(3);
    el.style.visibility = k <= 0.002 ? "hidden" : "visible";
    el.style.filter = (k > 0.002 && k < 0.998 && blur > 0) ? "blur(" + ((1 - k) * blur).toFixed(2) + "px)" : "none";
    if (extra !== undefined) el.style.transform = extra;
  }
  function px(n) { return n.toFixed(2) + "px"; }
  // where to put an element at depth z so that it is seen at (x, y) (perspective 1300 px, origin 540 1880)
  function unproj(x, y, z) { var k = (1300 - z) / 1300; return [540 + (x - 540) * k, 1880 + (y - 1880) * k]; }

  var INK = "#0a0d14";
  var $ = {}, R0;
  // -------------------------------------------------------------- the one shape: states on the beat
  // [t, W, H, R, X, Y, spring w]
  var S = [
    [0,              1240, 2140,   0, 540, 960],        // the finished snippet, full screen
    [B(4) + 0.03,     360,  640,  40, 540, 860, 11],    // the click: it freezes, the words lock around it
    [B(9.75),         860,  520,  46, 540, 930, 14],    // the drop zone
    [B(10.75),        176,  176,  88, 540, 900, 17],    // it takes the file
    [B(11.25),        880,  230, 115, 540, 880, 15],    // the song pill
    [B(17),           880,  430,  52, 540, 700, 14],    // add your takes (top stays at 485 while it grows)
    [B(18.5),         880,  560,  52, 540, 765, 16],
    [B(18.875),       880,  690,  52, 540, 830, 16],
    [B(19.25),        880,  820,  52, 540, 895, 16],
    [B(20),           880,  780,  52, 540, 895, 11],    // the tray of the sync
    [B(24.25),        880,  620,  52, 540, 850, 15],    // lyrics
    [B(26.75),        900, 1020,  56, 540, 925, 14],    // the edit, then the look (same card)
    [B(40.25),        600,  180,  90, 540, 900, 15],    // export
    [B(44),          1240, 2140,   0, 540, 960, 11],    // the payoff, full screen, one bar
    [B(48),           880,  230, 115, 540, 900, 13],    // the time
    [B(56.25),        300,  300,  70, 540, 610, 12],    // the app icon
  ];
  function col(i) { return S.map(function (s) { return [s[0], s[i], s[6] || 13, 0.8]; }); }
  var sW = K(col(1)), sH = K(col(2)), sR = K(col(3)), sX = K(col(4)), sY = K(col(5));
  var sZ = K([[0, 0], [B(20), -130, 7, 0.9], [B(22), -40, 12, 0.85], [B(24.25), 0, 9, 0.9], [B(43.55), -34, 18, 0.9], [B(44), 40, 11, 0.85], [B(48), 0, 11, 0.9],
              [B(56.25), 90, 8, 0.8], [B(57.1), 0, 7, 0.9]]);
  var sSpin = K([[0, 0], [B(56.25), 360, 7.5, 0.78]]);   // the pill flips into the icon (90 deg at +0.12 s)
  var sFace = CE([[0, INK], [B(9.75) + 0.1, "#eef7ff"], [B(10.75) + 0.08, INK], [B(17) + 0.1, "#ffffff"], [B(20) + 0.08, "#d6ecff"], [B(24.25) + 0.1, "#ffffff"],
                  [B(40.25) + 0.1, INK], [B(52.75) + 0.05, "#ffffff"], [B(56.25) + 0.12, "#1f6fd6"]], 0.07);
  var PRESS = [[B(4), 0.035], [B(41.25), 0.05]];
  // a 3D kick at each morph, sized to the change: [t, rotateX deg, rotateY deg]
  var KICKS = [[B(4) + 0.03, 10, -24], [B(9.75), 14, 0], [B(10.75), 0, 8], [B(11.25), 0, -15], [B(17), 16, 0], [B(24.25), 0, 12], [B(26.75), -12, 0], [B(37.75), 0, -4],
               [B(40.25), 15, 0], [B(44), 4, 0], [B(48), 0, 19], [B(52.75), 9, 0], [B(56.25), 12, 0]];
  // camera: whips on the changes [t, dx, dy, rotateZ], an orbit while the takes fly out
  var CAMK = [[B(2), 0, 0, 2.5], [B(4) + 0.03, 0, 0, -3], [B(9.75), -60, 0, 3], [B(10.75), 0, 0, -2], [B(11.25), 50, 0, 2.5], [B(17), 0, -40, -2.5], [B(24.25), -50, 0, 2],
              [B(26.75), 0, 40, -2], [B(35), 0, 0, 0.8], [B(37.75), 40, 0, -1.5], [B(40.25), 0, -30, 2], [B(44), 0, 0, -3], [B(48), -40, 0, 3], [B(52.75), 0, 0, -2], [B(56.25), 0, 0, 2.5]];
  var cZ = K([[0, 1], [B(20), 0.93, 5, 0.9], [B(22), 1.0, 14, 0.85]]);
  var cRY = K([[0, 0], [B(20.1), -15, 4.5, 0.85], [B(21.4), 7, 4.5, 0.85], [B(22), 0, 14, 0.9]]);
  var cRX = K([[0, 0], [B(20.1), 5, 5, 0.9], [B(22), 0, 14, 0.9]]);
  // the frozen snippet's frames, scrubbed back and forth (0 = start of the snippet, 1 = end)
  var scrubK = K([[0, 1], [B(4.6), 0.1, 9, 0.75], [B(5.6), 0.72, 9, 0.75], [B(6.6), 0.22, 9, 0.75], [B(7.6), 0.85, 9, 0.75], [B(8.6), 0.45, 10, 0.8]]);
  // cursor: [t0, t1, x, y, arc] = move to (x, y) between t0 and t1 on an arc (below if arc < 0), settling; the tip, in world coordinates
  var CUR = [
    [0, 0, 1180, 1750, 0],
    [B(2.6), B(3.6), 760, 1330, 0.16],        // in, to click the snippet
    [B(4.2), B(4.7), 1260, 1560, 0.1],        // out of the way of the words
    [B(9.75), B(9.751), 1420, 1250, 0],
    [B(9.8), B(10.5), 712, 1094, -0.18],      // back with the file, under the zone's text
    [B(10.9), B(11.6), 1230, 1480, 0.1],
    [B(17.2), B(17.75), 800, 722, 0.15],      // "Import my videos", right of the label
    [B(18.2), B(18.9), 1230, 1250, 0.1],
    [B(24.3), B(24.75), 410, 752, 0.14],      // "Paste my lyrics"
    [B(25.3), B(26.0), 1230, 1200, 0.1],
    [B(33.8), B(34.6), 820, 1355, 0.15],      // "Shuffle"
    [B(35.4), B(36.1), 1230, 1320, 0.1],
    [B(37.9), B(38.45), 470, 1282, 0.16],     // the Frost thumbnail
    [B(39.0), B(39.7), 1230, 1300, 0.1],
    [B(40.4), B(40.95), 770, 905, 0.15],      // "Export", right of the arrow
    [B(41.6), B(42.3), 1250, 1300, 0.1],
  ];
  var CLICKS = [B(4), B(10.75), B(18), B(25), B(35), B(38.75), B(41.25)];
  function cursorAt(t) {
    var x = CUR[0][2], y = CUR[0][3];
    for (var i = 1; i < CUR.length; i++) {
      var c = CUR[i]; if (t <= c[0]) break;
      var p = (t - c[0]) / Math.max(1e-4, c[1] - c[0]), e = eBack(p, 0.9);
      var dx = c[2] - x, dy = c[3] - y, d = Math.sqrt(dx * dx + dy * dy) || 1;
      var nx = dy / d, ny = -dx / d; if ((ny > 0) !== (c[4] < 0)) { nx = -nx; ny = -ny; }
      var a = Math.abs(c[4]) * d * bump(sat(p));
      x = x + dx * e + nx * a; y = y + dy * e + ny * a;
    }
    return [x, y];
  }
  // L1: the words lock around the frozen snippet, each on its word of the voice
  var KW = [{ id: "k-still", rel: 0.00, kind: "top" }, { id: "k-edit", rel: 0.18, kind: "left" }, { id: "k-snip", rel: 0.60, kind: "bottom" },
            { id: "k-by", rel: 1.18, kind: "right" }, { id: "k-hand", rel: 1.48, kind: "slam" }];
  var KW_OUT = B(9.75);
  // the sync tiles: out of the card's rows, into depth, out of time; then in line and in sync on b22
  function tileTracks(k) {
    var tl = B(20) + 0.07 * k, y0 = 485 + 410 + 56 + 130 * k;
    var xs = [275, 540, 805], ys = [830, 820, 830], zs = [120, 200, 60], rys = [14, 0, -14], xf = [290, 540, 790];
    return {
      x: K([[0, 540], [tl, xs[k], 8, 0.8], [B(22), xf[k], 14, 0.72], [B(24.25), 540, 11, 0.9]]),
      y: K([[0, y0], [tl, ys[k], 8, 0.8], [B(22), 758, 14, 0.72], [B(24.25), 850, 11, 0.9]]),
      z: K([[0, 0], [tl, zs[k], 7, 0.8], [B(22), 24, 14, 0.75], [B(24.25), -80, 11, 0.9]]),
      ry: K([[0, 0], [tl, rys[k], 7, 0.8], [B(22), 0, 14, 0.75]]),
      s: K([[0, 0.3], [tl, 1, 9, 0.75], [B(24.25), 0.2, 12, 0.9]]),
      tl: tl
    };
  }
  var TL = [tileTracks(0), tileTracks(1), tileTracks(2)];
  function envAt(x) {
    var f = (x - T.envT0) / T.envDt, i = Math.floor(f), n = T.env.length;
    if (i < 0) return T.env[0]; if (i >= n - 1) return T.env[n - 1];
    var u = f - i; return T.env[i] * (1 - u) + T.env[i + 1] * u;
  }
  var TCOL = { 1: "#d6336c", 2: "#3a6fe0", 3: "#e0952c" };
  var ringL = K([[0, 52, 9, 0.8], [B(38.75), 262, 9.5, 0.78]]), ringR = K([[0, 218, 9, 0.8], [B(38.75), 428, 16, 0.72]]);

  var FL = [], sprite = null, ctx = null;
  function initSnow() {
    var r = rng(7), i;
    for (i = 0; i < 150; i++) FL.push({ x: r() * 1160, y: r() * 2040, rad: 1.2 + r() * 1.5, v: 24 + r() * 22, a: 0.42 + r() * 0.4, amp: 6 + r() * 14, w: 0.35 + r() * 0.6, ph: r() * 6.28, d: 0.3 });
    for (i = 0; i < 60; i++) FL.push({ x: r() * 1160, y: r() * 2040, rad: 2.6 + r() * 2.6, v: 52 + r() * 36, a: 0.6 + r() * 0.34, amp: 10 + r() * 20, w: 0.3 + r() * 0.5, ph: r() * 6.28, d: 0.65 });
    for (i = 0; i < 11; i++) FL.push({ x: r() * 1160, y: r() * 2040, rad: 13 + r() * 11, v: 118 + r() * 60, a: 0.32 + r() * 0.26, amp: 16 + r() * 26, w: 0.22 + r() * 0.4, ph: r() * 6.28, d: 1.2, blur: true });
    sprite = document.createElement("canvas"); sprite.width = sprite.height = 96;
    var g = sprite.getContext("2d"), gr = g.createRadialGradient(48, 48, 0, 48, 48, 48);
    gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.45, "rgba(255,255,255,0.75)"); gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 96, 96);
  }
  function drawSnow(t, cry, hide) {
    ctx.clearRect(0, 0, 1080, 1920);
    if (hide >= 0.999) return;
    ctx.fillStyle = "#ffffff";
    for (var i = 0; i < FL.length; i++) {
      var f = FL[i];
      var y = (f.y + f.v * t) % 2040 - 60;
      var x = f.x + f.amp * Math.sin(f.w * t + f.ph) - cry * 7 * f.d;
      x = ((x % 1160) + 1160) % 1160 - 40;
      ctx.globalAlpha = f.a * (1 - hide);
      if (f.blur) ctx.drawImage(sprite, x - f.rad * 2, y - f.rad * 2, f.rad * 4, f.rad * 4);
      else { ctx.beginPath(); ctx.arc(x, y, f.rad, 0, 6.2832); ctx.fill(); }
    }
    ctx.globalAlpha = 1;
  }
  // icicles under a button (bottom edge), grown by g in [0,1]: uneven, with a few long drips
  function iciclesPath(w, r, g, seed, stepPx) {
    var d = "", half = w / 2 - r * 0.72 - 8, step = stepPx || 34;
    if (g <= 0.01 || half <= 0) return "";
    for (var i = -40; i <= 40; i++) {
      var x = i * step + (seed % 2) * step * 0.5 + (hash(i * 1.9 + seed) - 0.5) * step * 0.35;
      if (Math.abs(x) > half) continue;
      var h = hash(i * 7.3 + seed), lg = hash(i * 3.1 + seed * 2.7) > 0.84;
      var L = (12 + 26 * h + (lg ? 34 + 14 * hash(i + 9.4) : 0)) * g, ww = (lg ? 19 : 12) + 7 * hash(i + 3.1 + seed);
      d += "M" + (x - ww / 2).toFixed(1) + " 0 Q" + (x - ww / 4).toFixed(1) + " " + (L * 0.62).toFixed(1) + " " + x.toFixed(1) + " " + L.toFixed(1) + " Q" + (x + ww / 4).toFixed(1) + " " + (L * 0.62).toFixed(1) + " " + (x + ww / 2).toFixed(1) + " 0 Z ";
    }
    return d;
  }
  function fringePath(w, r, g) {
    if (g <= 0.01) return "";
    var x = -(w / 2 - r * 0.9), end = w / 2 - r * 0.9, d = "M" + x.toFixed(1) + " 0 ", i = 0;
    while (x < end - 6) {
      var ww = 22 + 14 * hash(i * 3.7), h = (14 + 24 * hash(i * 5.1 + 2) + (hash(i * 2.3 + 7) > 0.86 ? 16 : 0)) * g, nx = Math.min(end, x + ww);
      d += "L" + ((x + nx) / 2).toFixed(1) + " " + h.toFixed(1) + " L" + nx.toFixed(1) + " 0 ";
      x = nx; i++;
    }
    return d + "Z";
  }
  function sideColour(k, n) {   // the extrusion: a light lip right behind the face, then ink-blue sides
    if (k === 1) return "#4d5f82";
    var m = (k - 2) / Math.max(1, n - 2);
    return "rgb(" + Math.round(mix(36, 18, m)) + "," + Math.round(mix(50, 26, m)) + "," + Math.round(mix(76, 42, m)) + ")";
  }
  function layeredLogo(host, n, dz) {   // the official wordmark, extruded in ink
    var out = [];
    for (var k = n; k >= 0; k--) {
      var im = document.createElement("img"); im.src = "assets/brand/wordmark.svg"; im.alt = "";
      im.style.transform = "translateZ(" + (-k * dz).toFixed(1) + "px)";
      if (k > 0) im.style.filter = "brightness(0)";
      host.appendChild(im); out.push(im);
    }
    return out;
  }

  function init(root) {
    R0 = root;
    ["snow", "world", "fshadow", "shape", "face", "shade", "sheen", "rim", "icb", "fringe",
     "c-hook", "c-zone", "c-load", "c-song", "c-takes", "c-sync", "c-lyr", "c-edit", "c-exp", "c-pay", "c-claim", "c-icon",
     "h-sprite", "h-wm", "z-hover", "l-spin", "s-bpm", "s-dots", "t-imp", "s-ok",
     "l-s1", "l-sel", "l-hint", "l-1", "l-2", "e-low", "f-low", "e-ver1", "e-ver2", "e-ruler", "e-bar", "e-ph", "e-knob", "e-shuf", "e-shufice",
     "f-ring", "f-frost", "f-edge", "x-fill", "x-lab2", "p-cap", "k-num", "k-sub1", "k-sub2",
     "tile1", "tile2", "tile3", "chip", "logo", "caplogo", "caps", "tag1", "tag2", "cursor"].forEach(function (id) { $[id] = root.querySelector("#" + id); });
    ctx = $.snow.getContext("2d"); initSnow();
    $.layers = [];
    for (var k = 16; k >= 1; k--) {
      var L = document.createElement("div"); L.className = "ly";
      L.style.background = sideColour(k, 16); L.style.transform = "translateZ(" + (-k * 1.65).toFixed(2) + "px)";
      $.shape.insertBefore(L, $.shape.firstChild); $.layers.push(L);
    }
    $.zflakes = document.createElement("div"); $.zflakes.className = "abs";
    $.zflakes.style.cssText = "inset:24px;border-radius:30px;opacity:0.9;background-image:radial-gradient(circle at 20px 20px, #a9d3ff 3.2px, transparent 4px),radial-gradient(circle at 15px 15px, #d6ecff 2.4px, transparent 3px);background-size:120px 120px, 90px 90px;";
    $["c-zone"].insertBefore($.zflakes, $["c-zone"].firstChild);
    $.dots = [];
    for (var i = 0; i < 4; i++) { var dd = document.createElement("i"); dd.className = "sdot"; dd.style.left = (i * 66) + "px"; $["s-dots"].appendChild(dd); $.dots.push(dd); }
    $.rows = ["t-r1", "t-r2", "t-r3"].map(function (id) { var r = root.querySelector("#" + id); r.sp = r.querySelector(".sp"); return r; });
    $.tiles = [$.tile1, $.tile2, $.tile3];
    $.tiles.forEach(function (tile, ti) {
      tile.style.transformOrigin = "120px 213px";
      for (var j = 8; j >= 1; j--) { var Lt = document.createElement("div"); Lt.className = "ly"; Lt.style.background = sideColour(j, 8); Lt.style.transform = "translateZ(" + (-j * 3) + "px)"; tile.insertBefore(Lt, tile.firstChild); }
      tile.ok = tile.querySelector(".ok"); tile.wv = tile.querySelector(".wv"); tile.bars = [];
      for (var bi = 0; bi < 40; bi++) { var b = document.createElement("b"); b.style.left = px(2 + bi * 5.8); b.style.background = TCOL[ti + 1]; tile.wv.appendChild(b); tile.bars.push(b); }
    });
    // the edit: 21 real shots
    $.blocks = []; var IW = 788, TOTE = T.CUTS[21];
    for (i = 0; i < 21; i++) {
      var bk = document.createElement("div"); bk.className = "bk";
      var l = T.CUTS[i] / TOTE * IW, w = (T.CUTS[i + 1] - T.CUTS[i]) / TOTE * IW;
      bk.style.left = px(l); bk.style.width = px(w + 0.6); bk.style.fontSize = (w > 30 ? 28 : 20) + "px";
      if (i === 0) bk.style.borderRadius = "16px 0 0 16px";
      if (i === 20) bk.style.borderRadius = "0 16px 16px 0";
      bk.dataset.w = String(w);
      bk.fl = document.createElement("b"); bk.appendChild(bk.fl);
      bk.lab = document.createElement("span"); bk.lab.style.position = "relative"; bk.appendChild(bk.lab);
      $["e-bar"].appendChild(bk); $.blocks.push(bk);
    }
    var ruler = $["e-ruler"], dbt = -0.0837;
    for (var kk = 0; kk * P <= TOTE; kk++) {
      var tx = kk * P, down = Math.abs(((tx - dbt) / (4 * P)) - Math.round((tx - dbt) / (4 * P))) < 0.02;
      var tk = document.createElement("i");
      tk.style.cssText = "position:absolute;bottom:0;border-radius:2px;background:#0a0d14;left:" + px(4 + tx / TOTE * IW) + ";width:" + (down ? 3 : 2) + "px;height:" + (down ? 22 : 11) + "px;opacity:" + (down ? 0.85 : 0.45);
      ruler.appendChild(tk);
    }
    $["e-shufice"].innerHTML = '<g transform="translate(155,0)"><path d="' + iciclesPath(310, 44, 1, 3, 28) + '" fill="#d6ecff" stroke="#0a0d14" stroke-width="4" stroke-linejoin="round"/></g>';
    $.logoL = layeredLogo($.logo, 22, 1.6);
    $.capL = layeredLogo($.caplogo, 14, 1.8);
    $.kwEls = KW.map(function (d) { return root.querySelector("#" + d.id); });
    // the voice, word by word (each line in chunks that fit two lines on screen)
    var CAPS = [
      { b: W(2, 0) - 0.06, words: [["Drop", W(1, 0)], ["your", W(1, 0.26)], ["song.", W(1, 0.42), 1]] },
      { b: W(3, 0) - 0.06, top: 396, logo: W(2, 0), words: [["finds", W(2, 0.70)], ["the", W(2, 1.12)], ["beat.", W(2, 1.38), 1]] },
      { b: W(4, 0) - 0.06, words: [["Add", W(3, 0)], ["your", W(3, 0.20)], ["takes.", W(3, 0.36), 1]] },
      { b: W(5, 0) - 0.06, words: [["They", W(4, 0)], ["sync", W(4, 0.12), 1], ["up", W(4, 0.46)], ["by", W(4, 0.70)], ["themselves.", W(4, 0.88)]] },
      { b: W(6, 0) - 0.06, words: [["Paste", W(5, 0)], ["your", W(5, 0.26)], ["lyrics.", W(5, 0.38), 1]] },
      { b: W(6, 0.98) - 0.04, words: [["Then", W(6, 0)], ["it", W(6, 0.28)], ["cuts", W(6, 0.38), 1], ["between", W(6, 0.66)]] },
      { b: W(6, 1.78) - 0.04, words: [["your", W(6, 0.98)], ["takes,", W(6, 1.16)]] },
      { b: W(7, 0) - 0.06, words: [["on", W(6, 1.78)], ["the", W(6, 1.96)], ["beat.", W(6, 2.12), 1]] },
      { b: W(8, 0) - 0.06, words: [["Shuffle", W(7, 0), 1], ["for", W(7, 0.30)], ["a", W(7, 0.42)], ["new", W(7, 0.48)], ["edit.", W(7, 0.66)]] },
      { b: W(9, 0) - 0.06, words: [["Pick", W(8, 0)], ["a", W(8, 0.14)], ["look.", W(8, 0.22), 1]] },
      { b: B(44) - 0.05, words: [["And", W(9, 0)], ["export.", W(9, 0.16), 1]] },
    ];
    $.caps = CAPS.map(function (c) {
      var el = document.createElement("div"); el.className = "capc";
      if (c.top) el.style.top = c.top + "px";
      el.innerHTML = c.words.map(function (w) { return '<span class="w' + (w[2] ? " pk" : "") + '">' + w[0] + "</span>"; }).join(" ");
      $.caps.appendChild(el);
      return { el: el, spans: el.querySelectorAll(".w"), a: c.logo || c.words[0][1], b: c.b, logo: c.logo, ts: c.words.map(function (w) { return w[1]; }) };
    });
    $.tag1w = $.tag1.querySelectorAll("span");
    $.tagT = [W(12, 0), W(12, 0.45), W(12, 0.74), W(12, 0.82), W(12, 0.94), W(12, 1.15), W(12, 1.22), W(12, 1.30)];
    $.cursor.style.transformOrigin = "6px 4px";
  }

  // L1 words, fitted to the frozen snippet's frame (360 x 640 at 540,860) once the font has loaded (it sets their widths)
  function fitKW() {
    if ($.kw) return true;
    if (document.fonts && document.fonts.check && !document.fonts.check('100px "Lilita One"')) return false;
    var FX0 = 360, FX1 = 720, FY0 = 540, FY1 = 1180, GAP = 6;
    var kw = KW.map(function (d, i) {
      var el = $.kwEls[i]; el.style.fontSize = "100px";
      return { d: d, el: el, w100: el.offsetWidth, target: d.kind === "top" || d.kind === "bottom" ? 700 : d.kind === "left" ? 640 : d.kind === "slam" ? 760 : 0 };
    });
    var fsEdit = 100 * 640 / kw[1].w100, snipBottom = 0;
    kw.forEach(function (o) {
      var fs = o.target ? 100 * o.target / o.w100 : fsEdit;
      o.el.style.fontSize = fs.toFixed(1) + "px";
      o.w = o.el.offsetWidth; o.h = o.el.offsetHeight; o.t = W(0, o.d.rel);
      // capitals fill about 0.1-0.8 of the line box: place the letters, not the box
      if (o.d.kind === "top") { o.cx = 540; o.cy = FY0 - GAP - o.h / 2 + 0.17 * fs; o.rot = 0; }
      else if (o.d.kind === "bottom") { o.cx = 540; o.cy = FY1 + GAP + o.h / 2 - 0.08 * fs; o.rot = 0; snipBottom = o.cy - o.h / 2 + 0.8 * fs; }
      else if (o.d.kind === "left") { o.cx = FX0 - GAP - o.h / 2 + 0.17 * fs; o.cy = (FY0 + FY1) / 2; o.rot = -90; }
      else if (o.d.kind === "right") { o.cx = FX1 + GAP + o.h / 2 - 0.17 * fs; o.cy = FY0 + o.w / 2; o.rot = 90; }
      else { o.cx = 540; o.cy = snipBottom + 18 - 0.1 * fs + o.h / 2; o.rot = -5; }
      if (o.d.kind === "top" || o.d.kind === "bottom") {
        var txt = o.el.textContent; o.el.innerHTML = "";
        for (var c = 0; c < txt.length; c++) { var s = document.createElement("span"); s.textContent = txt[c]; o.el.appendChild(s); }
        o.spans = o.el.querySelectorAll("span");
      }
    });
    $.kw = kw;
    return true;
  }

  function render(t) {
    if (!R0) return;
    if (t < 0) t = 0; if (t > TOTAL) t = TOTAL;
    // ----------------------------------------------------------- camera: punches on the beat, whips on the changes
    var punch = 0, bNow = Math.floor(t / P + 1e-6);
    for (var bb = Math.max(0, bNow - 3); bb <= bNow; bb++) {
      var dt = t - B(bb); if (dt < 0) continue;
      var amp = bb >= 1 && bb < 4 ? 0.05 : bb >= 44 && bb < 48 ? 0.04 : bb % 4 !== 0 ? 0 : bb < 44 ? 0.018 : 0.012;
      punch += amp * Math.exp(-dt / 0.13);
    }
    for (var kw = 0; kw < KW.length; kw++) punch += 0.03 * decay(t, W(0, KW[kw].rel), 0.12) * (t < KW_OUT ? 1 : 0);
    var pay = win(t, B(44) + 0.05, B(48), 0.3, 0.3), hook = t < B(4) ? 1 : 0, full = Math.max(pay, hook);
    var l1 = win(t, B(4), KW_OUT, 0.25, 0.3), l1p = eIO((t - B(4.2)) / (KW_OUT - B(4.2)));
    var push = 0.04 * eIO((t - B(44.2)) / B(3.6)) * (1 - eIO((t - B(48)) / 0.3)) + 0.025 * eIO((t - B(27)) / B(13)) * (1 - eIO((t - B(40.25)) / 0.3)) + 0.05 * l1p * l1;
    var cz = cZ(t) * (1 + punch) * (1 + push);
    var cdx = 0, cdy = 0, crz = (-2.2 + 4 * l1p) * l1 + 1.2 * Math.sin(6.2832 * t / 3.06) * hook;
    for (var ck = 0; ck < CAMK.length; ck++) { var ci0 = impulse(t - CAMK[ck][0], 10.5, 0.62); cdx += CAMK[ck][1] * ci0; cdy += CAMK[ck][2] * ci0; crz += CAMK[ck][3] * ci0; }
    var th = W(0, 1.48), sh = decay(t, th, 0.1) * (t < KW_OUT ? 1 : 0);   // HAND? lands: a short shake
    cdx += 16 * Math.sin((t - th) * 90) * sh; cdy += 10 * Math.cos((t - th) * 77) * sh;
    var cry = cRY(t) + 1.0 * Math.sin(6.2832 * t / 11) * (1 - full), crx = cRX(t) + 0.6 * Math.sin(6.2832 * t / 13 + 1) * (1 - full);
    $.world.style.transform = "translate3d(" + px(540 + cdx) + "," + px(960 + cdy) + ",0) scale(" + cz.toFixed(4) + ") rotateZ(" + crz.toFixed(3) + "deg) rotateX(" + crx.toFixed(3) + "deg) rotateY(" + cry.toFixed(3) + "deg) translate3d(-540px,-960px,0)";
    drawSnow(t, cry, full);

    // ----------------------------------------------------------- the shape
    var W_ = sW(t), H = sH(t), R = Math.max(0, sR(t)), X = sX(t), Y = sY(t), Z = sZ(t);
    var RX = -5 * (1 - spr(t, 10, 0.6)), RY = sSpin(t) + 10 * (1 - spr(t, 10, 0.6));   // the snippet slams in, tilted
    for (var kq = 0; kq < KICKS.length; kq++) { var ik = impulse(t - KICKS[kq][0], 10.5, 0.62); RX += KICKS[kq][1] * ik; RY += KICKS[kq][2] * ik; }
    var fl8 = sat((t - B(57.5)) / 1.2);   // the icon floats once it has landed
    RY += 4 * Math.sin(6.2832 * (t - B(57.5)) / 5.5) * fl8; RX += 2 * Math.sin(6.2832 * (t - B(57.5)) / 6.5 + 1) * fl8;
    var sc = 1 + 0.28 * (1 - spr(t, 13, 0.55));
    for (var p = 0; p < PRESS.length; p++) sc -= PRESS[p][1] * bump((t - PRESS[p][0]) / 0.24);
    sc -= 0.05 * bump((t - B(43.5)) / (B(44) - B(43.5)) * 0.5);
    $.shape.style.width = px(W_); $.shape.style.height = px(H);
    $.shape.style.transform = "translate3d(" + px(X - W_ / 2) + "," + px(Y - H / 2) + "," + px(Z) + ") rotateX(" + RX.toFixed(3) + "deg) rotateY(" + RY.toFixed(3) + "deg) scale(" + sc.toFixed(4) + ")";
    var rr = px(R);
    $.face.style.borderRadius = rr; $.face.style.background = sFace(t);
    $.face.style.borderWidth = t > B(56.25) + 0.12 ? "0px" : "6px";
    for (var li = 0; li < $.layers.length; li++) $.layers[li].style.borderRadius = rr;
    var aRX = RX * Math.PI / 180, aRY = RY * Math.PI / 180;
    var nX = Math.sin(aRY) * Math.cos(aRX), nY = -Math.sin(aRX), nZ = Math.cos(aRY) * Math.cos(aRX);
    var nl = -0.42 * nX - 0.42 * nY + 0.8 * nZ;
    $.shade.style.opacity = (sat((0.8 - nl) * 1.4) * 0.45 * (1 - full)).toFixed(3);
    var ryw = ((RY + 180) % 360 + 360) % 360 - 180, tilt = sat((Math.abs(ryw) + Math.abs(RX) * 0.8) / 12);
    $.sheen.style.opacity = (tilt * 0.6 * (1 - full)).toFixed(3);
    $.sheen.style.backgroundPosition = (50 - ryw * 3.2 - RX * 1.6).toFixed(1) + "% 0";
    $.rim.style.opacity = (1 - full).toFixed(3);
    var shO = (1 - full) * (1 - win(t, B(19.9), B(24), 0.3, 0.3) * 0.6);
    $.fshadow.style.width = px(W_ * 0.92); $.fshadow.style.height = px(Math.max(60, H * 0.08));
    $.fshadow.style.transform = "translate3d(" + px(X - W_ * 0.46) + "," + px(Y + H / 2 + 30) + "," + px(Z - 40) + ")";
    $.fshadow.style.opacity = shO.toFixed(3);
    var gB = Math.max(win(t, B(11.25) + 0.35, B(17) - 0.05, 0.5, 0.1), win(t, B(40.25) + 0.3, B(43.5), 0.5, 0.1), win(t, B(48) + 0.35, B(52.6), 0.5, 0.1));
    $.icb.setAttribute("width", W_.toFixed(0)); $.icb.setAttribute("height", "100");
    $.icb.style.transform = "translate3d(0," + px(H - 5) + ",0.5px)";
    $.icb.innerHTML = gB > 0.01 ? '<g transform="translate(' + (W_ / 2).toFixed(1) + ',0)"><path d="' + iciclesPath(W_, R, eOut(gB), 0) + '" fill="#d6ecff" stroke="#0a0d14" stroke-width="4" stroke-linejoin="round"/></g>' : "";
    var gF = Math.max(win(t, B(17) + 0.28, B(20) - 0.02, 0.45, 0.1), win(t, B(24.25) + 0.3, B(26.75) - 0.02, 0.45, 0.1), win(t, B(26.75) + 0.3, B(40.25) - 0.02, 0.45, 0.1));
    $.fringe.setAttribute("width", (W_ - 12).toFixed(0)); $.fringe.setAttribute("height", "70");
    $.fringe.innerHTML = gF > 0.01 ? '<g transform="translate(' + ((W_ - 12) / 2).toFixed(1) + ',-2)"><path d="' + fringePath(W_ - 12, R, eOut(gF)) + '" fill="#ffffff" stroke="#0a0d14" stroke-width="4" stroke-linejoin="round"/></g>' : "";

    // ----------------------------------------------------------- m0 the snippet, then frozen, its frames scrubbed back and forth
    show($["c-hook"], t < B(9.75) + 0.06 ? 1 : 1 - eIn((t - B(9.75) - 0.06) / 0.14), 12);
    var fi = Math.round(sat(scrubK(t)) * 23);
    $["h-sprite"].style.left = (-(fi % 6) * 100) + "%"; $["h-sprite"].style.top = (-Math.floor(fi / 6) * 100) + "%";
    show($["h-wm"], t < B(4.05) ? 1 : 0, 0);
    // ----------------------------------------------------------- L1: STILL / EDITING / SNIPPETS / BY / HAND?
    var kOut = eIn((t - KW_OUT) / 0.2), kwOk = fitKW();
    for (var wi2 = 0; kwOk && wi2 < $.kw.length; wi2++) {
      var o = $.kw[wi2], q = t - o.t;
      if (q < 0 || kOut >= 1) { o.el.style.visibility = "hidden"; continue; }
      o.el.style.visibility = "visible";
      var ks = spr(q, 15, 0.58), ox = 0, oy = 0, scl = 1, rot = o.rot;
      if (o.d.kind === "top") oy = -420 * (1 - ks) - 520 * kOut;
      else if (o.d.kind === "bottom") { ox = -760 * (1 - ks); oy = 520 * kOut; }
      else if (o.d.kind === "left") { oy = 560 * (1 - ks); ox = -600 * kOut; }
      else if (o.d.kind === "right") { ox = 480 * (1 - ks) + 600 * kOut; }
      else { var kh = spr(q, 14, 0.5); scl = 1 + 1.6 * (1 - kh) + 0.7 * kOut; rot = o.rot - 15 * (1 - kh); }
      o.el.style.opacity = (sat(q / 0.05) * (1 - kOut)).toFixed(3);
      var bl = (1 - eOut(q / 0.16)) * 12 + kOut * 10;
      o.el.style.filter = bl > 0.05 ? "blur(" + bl.toFixed(1) + "px)" : "none";
      o.el.style.transform = "translate3d(" + px(o.cx - o.w / 2 + ox) + "," + px(o.cy - o.h / 2 + oy) + ",4px) rotate(" + rot.toFixed(2) + "deg) scale(" + scl.toFixed(4) + ")";
      if (o.spans) for (var si = 0; si < o.spans.length; si++) {
        var qs = q - 0.022 * si, kl = spr(qs, 16, 0.55);
        o.spans[si].style.opacity = sat(qs / 0.04).toFixed(3);
        o.spans[si].style.transform = o.d.kind === "top" ? "translateY(" + px(-140 * (1 - kl)) + ")" : "translateX(" + px(-90 * (1 - kl)) + ")";
      }
    }
    // ----------------------------------------------------------- m1 the zone
    show($["c-zone"], win(t, B(9.75) + 0.2, B(10.75) + 0.02, 0.16, 0.1), 10, "translate(-50%,-50%)");
    $["z-hover"].style.opacity = (win(t, B(10.35), B(10.75), 0.1, 0.1) * 0.9).toFixed(3);
    if (t > B(9.75) && t < B(11)) $.zflakes.style.backgroundPosition = "0 " + px((t * 46) % 120) + ", 30px " + px((t * 28) % 90);
    // ----------------------------------------------------------- m2 it takes the file
    show($["c-load"], win(t, B(10.75) + 0.1, B(11.25) + 0.02, 0.1, 0.08), 8, "translate(-50%,-50%)");
    $["l-spin"].style.transform = "rotate(" + ((t - B(10.75)) * 620).toFixed(1) + "deg)";
    // ----------------------------------------------------------- m3 the song: its tempo found, its beats counted
    show($["c-song"], win(t, B(11.25) + 0.16, B(17) + 0.02, 0.16, 0.1), 10, "translate(-50%,-50%)");
    if (t > B(11) && t < B(17.4)) {
      var bu = eOut((t - B(11.5)) / (B(14.5) - B(11.5)));
      $["s-bpm"].textContent = (157 * bu).toFixed(1) + " BPM";
      $["s-bpm"].style.transform = "scale(" + (1 + 0.1 * bump((t - B(14.5)) / 0.3)).toFixed(4) + ")";
      for (var di = 0; di < 4; di++) {
        var on = sat((t - B(13 + di)) / 0.05), fla = decay(t, B(13 + di), 0.22), dd = $.dots[di];
        dd.style.background = "rgba(255," + Math.round(mix(255, 111, fla)) + "," + Math.round(mix(255, 174, fla)) + "," + on.toFixed(3) + ")";
        dd.style.borderColor = on > 0 ? "#ffffff" : "rgba(255,255,255,0.35)";
        dd.style.transform = "scale(" + (1 + 0.45 * fla).toFixed(3) + ")";
      }
    }
    // ----------------------------------------------------------- m4 the takes (the card grows with each one)
    show($["c-takes"], win(t, B(17) + 0.18, B(20) + 0.04, 0.16, 0.12), 10, "translateX(-50%)");
    $["t-imp"].style.transform = "scale(" + (1 - 0.04 * bump((t - B(18)) / 0.22)).toFixed(4) + ")";
    for (var ri = 0; ri < 3; ri++) {
      var row = $.rows[ri], ta = B(18.5) + B(0.375) * ri, re = spr(t - ta, 14, 0.72);
      row.style.opacity = sat((t - ta) / 0.1).toFixed(3);
      row.style.transform = "translateX(" + px(80 * (1 - re)) + ") scale(" + (1.04 - 0.04 * re).toFixed(4) + ")";
      row.sp.style.transform = "rotate(" + (Math.max(0, t - ta) * 520).toFixed(1) + "deg)";
    }
    // ----------------------------------------------------------- m5 the tray, the three takes, in sync on b22
    show($["c-sync"], win(t, B(20) + 0.2, B(24.25) + 0.02, 0.16, 0.1), 8, "translate(-50%,-50%)");
    $["s-ok"].style.opacity = sat((t - B(22.15)) / 0.1).toFixed(3);
    $["s-ok"].style.transform = "scale(" + (0.7 + 0.3 * spr(t - B(22.15), 15, 0.6)).toFixed(4) + ")";
    for (var k = 0; k < 3; k++) {
      var tile = $.tiles[k], tr = TL[k], vis = win(t, tr.tl, B(24.25) + 0.1, 0.12, 0.2);
      if (vis <= 0.002) { tile.style.visibility = "hidden"; tile.style.opacity = "0"; continue; }
      var wob = sat((t - tr.tl) / 0.4) * (1 - sat((t - B(22) + 0.12) / 0.12));
      var x = tr.x(t), y = tr.y(t) + 9 * Math.sin(6.2832 * (t * 1.7 + k * 0.37)) * wob, z = tr.z(t);
      var ry2 = tr.ry(t) + 4 * Math.sin(6.2832 * (t * 1.3 + k * 0.5)) * wob;
      var s2 = tr.s(t) * (1 + 0.06 * bump((t - B(22) - 0.03 * k) / 0.26));
      tile.style.visibility = "visible"; tile.style.opacity = vis.toFixed(3);
      tile.style.transform = "translate3d(" + px(x - 120) + "," + px(y - 213) + "," + px(z) + ") rotateY(" + ry2.toFixed(2) + "deg) scale(" + s2.toFixed(4) + ")";
      var okv = sat((t - B(22) - 0.05 * k) / 0.12);
      tile.ok.style.opacity = okv.toFixed(3); tile.ok.style.transform = "scale(" + (0.6 + 0.4 * spr(t - B(22) - 0.05 * k, 16, 0.6)).toFixed(3) + ")";
      var off = T.OFFS[k] * (1 - spr(t - B(22), 13, 0.75)), tt = t + T.prevOff + off;
      for (var bi = 0; bi < 40; bi++) { var hh = 4 + 46 * envAt(tt + (bi - 20) * 0.06), bar = tile.bars[bi]; bar.style.height = px(hh); bar.style.top = px(29 - hh / 2); }
    }
    // ----------------------------------------------------------- m6 lyrics, pasted in one hit
    show($["c-lyr"], win(t, B(24.25) + 0.2, B(26.75) + 0.02, 0.16, 0.1), 10, "translate(-50%,-50%)");
    $["l-s1"].style.transform = "scale(" + (1 - 0.06 * bump((t - B(25)) / 0.2)).toFixed(4) + ")";
    $["l-hint"].style.opacity = (1 - sat((t - B(25.25)) / 0.08)).toFixed(3);
    for (var lk = 0; lk < 2; lk++) {
      var la = B(25.25) + 0.07 * lk, le = spr(t - la, 15, 0.7), lel = $["l-" + (lk + 1)];
      lel.style.opacity = sat((t - la) / 0.06).toFixed(3);
      lel.style.transform = "translateY(" + px(22 * (1 - le)) + ")";
    }
    $["l-sel"].style.opacity = (sat((t - B(25.25)) / 0.05) * (1 - eIO((t - B(25.25) - 0.12) / 0.4))).toFixed(3);
    // ----------------------------------------------------------- m7-m10 the edit, then its look, in the same preview
    show($["c-edit"], win(t, B(26.75) + 0.2, B(40.25) + 0.02, 0.16, 0.1), 10, "translate(-50%,-50%)");
    if (t > B(26.5) && t < B(40.6)) {
      var eLow = 1 - eIO((t - B(37.75)) / 0.14);
      $["e-low"].style.opacity = eLow.toFixed(3); $["e-low"].style.visibility = eLow < 0.002 ? "hidden" : "visible";
      $["e-low"].style.transform = "translateY(" + px(40 * (1 - eLow)) + ")";
      var fLo = sat((t - B(37.75) - 0.1) / 0.12), fK = spr(t - B(37.75) - 0.1, 14, 0.75);
      $["f-low"].style.opacity = fLo.toFixed(3); $["f-low"].style.visibility = fLo < 0.002 ? "hidden" : "visible";
      $["f-low"].style.transform = "translateY(" + px(50 * (1 - fK)) + ")";
      if (eLow > 0.002) {
        for (var ki = 0; ki < 21; ki++) {   // each shot lands on a sixteenth, then the shuffle makes them hop and change take
          var bk = $.blocks[ki], tl = B(27.25) + B(0.25) * ki, e2 = spr(t - tl, 16, 0.62);
          var ts = B(35.1) + 0.02 * ki, hp = bump((t - ts) / 0.36), tk = t > ts + 0.18 ? T.NEW[ki] : T.TAKES[ki];
          bk.style.background = TCOL[tk]; bk.style.color = tk === 3 ? INK : "#fff";
          bk.lab.textContent = (+bk.dataset.w > 18) ? String(tk) : "";
          bk.style.opacity = sat((t - tl) / 0.05).toFixed(3);
          bk.style.transform = "translateY(" + px(-46 * (1 - e2) - 64 * hp) + ") scale(" + (1.2 - 0.2 * e2).toFixed(4) + ")";
          bk.fl.style.opacity = Math.max(decay(t, tl, 0.12), decay(t, ts + 0.36, 0.12)).toFixed(3);
        }
        var phx = 52 + 4 + Math.max(0, t + T.prevOff) / T.CUTS[21] * 788;
        $["e-ph"].style.left = px(phx - 3); $["e-knob"].style.left = px(phx - 15);
        var v2 = eOut((t - B(36.25)) / 0.22);
        $["e-ver1"].style.transform = "translateY(" + px(-50 * v2) + ")"; $["e-ver2"].style.transform = "translateY(" + px(-50 * v2) + ")";
        var shP = 1 - 0.07 * bump((t - B(35)) / 0.22);
        $["e-shuf"].style.transform = "scale(" + shP.toFixed(4) + ")";
        $["e-shufice"].style.transform = "scaleY(" + (eOut((t - B(26.75) - 0.35) / 0.45) * shP).toFixed(3) + ")";
        $["e-shufice"].style.transformOrigin = "50% 0";
      }
      var rl = ringL(t), rR = ringR(t);
      $["f-ring"].style.left = px(rl); $["f-ring"].style.width = px(Math.max(40, rR - rl));
      var wp = eIO((t - B(38.85)) / 0.42);   // Frost wipes across the preview
      $["f-frost"].style.clipPath = "inset(0 " + ((1 - wp) * 100).toFixed(2) + "% 0 0)";
      $["f-edge"].style.left = px(wp * 360); $["f-edge"].style.opacity = (wp > 0.001 && wp < 0.999 ? 1 : 0).toString();
    }
    // ----------------------------------------------------------- m11 export
    show($["c-exp"], win(t, B(40.25) + 0.16, B(44) + 0.06, 0.14, 0.08), 10, "translate(-50%,-50%)");
    var fw = 600 * eIO((t - B(41.5)) / (B(43.85) - B(41.5)));
    $["x-fill"].style.width = px(fw); $["x-lab2"].style.clipPath = "inset(0 " + px(600 - fw) + " 0 0)";
    // ----------------------------------------------------------- m12 the payoff (one bar; the video stays while it folds)
    show($["c-pay"], win(t, B(44) + 0.01, B(48) + 0.12, 0.08, 0.12), 14, "translate(-50%,-50%)");
    var pq = t - T.payCap[0];
    show($["p-cap"], win(t, T.payCap[0], T.payCap[1], 0.06, 0.1), 6, "scale(" + (0.6 + 0.4 * spr(pq, 16, 0.55)).toFixed(4) + ")");
    // ----------------------------------------------------------- m13-m14 the time
    show($["c-claim"], win(t, B(48) + 0.22, B(56.25) + 0.08, 0.16, 0.04), 10, "translate(-50%,-50%)");
    if (t > B(47.9) && t < B(56.6)) {
      var c0 = B(52.75) - 0.1, cnt = sat((t - c0) / 0.42), seq = [40, 37, 33, 28, 22, 16, 11, 7, 4, 3];
      var up = eOut((t - B(48.3)) / (B(49) - B(48.3)));
      var n = cnt <= 0 ? Math.max(1, Math.round(40 * up)) : seq[Math.min(seq.length - 1, Math.floor(cnt * (seq.length - 1) + 0.0001))];
      $["k-num"].textContent = n + " min";
      $["k-num"].style.color = t >= B(52.75) ? "#1f6fd6" : "#ffffff";
      $["k-num"].style.filter = cnt > 0 && cnt < 1 ? "blur(2px)" : "none";
      $["k-num"].style.transform = "scale(" + (1 + 0.08 * bump((t - B(49)) / 0.3) + 0.08 * bump((t - B(52.75)) / 0.3)).toFixed(4) + ")";
      show($["k-sub1"], 1 - sat((t - B(52.75) + 0.05) / 0.12), 8);
      show($["k-sub2"], sat((t - B(52.75) - 0.06) / 0.16), 8);
    }
    // ----------------------------------------------------------- m15 the icon, the wordmark, the offer, the address
    show($["c-icon"], t > B(56.25) + 0.1 ? 1 : 0, 0);
    if (t >= B(57)) {
      var lq = t - B(57), wr = eOut(lq / 0.32), ls = 1 + 0.16 * (1 - spr(lq, 9, 0.6)), lrx = 26 * (1 - spr(lq, 7.5, 0.72));
      var dr = sat((t - B(58.5)) / 1.2), lry = 3.5 * Math.sin(6.2832 * (t - B(58.5)) / 6) * dr;
      lrx += 1.6 * Math.sin(6.2832 * (t - B(58.5)) / 7 + 1) * dr;
      $.logo.style.visibility = "visible";
      $.logo.style.transform = "rotateX(" + lrx.toFixed(3) + "deg) rotateY(" + lry.toFixed(3) + "deg) scale(" + ls.toFixed(4) + ")";
      var cp = wr < 0.999 ? "inset(0 " + ((1 - wr) * 100).toFixed(2) + "% 0 0)" : "none";
      for (var gi = 0; gi < $.logoL.length; gi++) $.logoL[gi].style.clipPath = cp;
    } else $.logo.style.visibility = "hidden";
    for (var wi = 0; wi < $.tag1w.length; wi++) {
      var kw2 = sat((t - $.tagT[wi]) / 0.14), ke = spr(t - $.tagT[wi], 15, 0.65), sw2 = $.tag1w[wi];
      sw2.style.opacity = kw2.toFixed(3); sw2.style.filter = kw2 > 0 && kw2 < 1 ? "blur(" + ((1 - kw2) * 8).toFixed(1) + "px)" : "none";
      sw2.style.transform = "translateY(" + px(18 * (1 - ke)) + ")";
    }
    $.tag1.style.visibility = t > W(12, 0) - 0.05 ? "visible" : "hidden";
    var url = "stalak.app", nt = Math.floor(sat((t - B(59.75)) / 0.28) * url.length + 0.0001);
    $.tag2.textContent = url.slice(0, nt);
    $.tag2.style.transform = "scale(" + (1 + 0.07 * bump((t - W(13, 0)) / 0.32)).toFixed(4) + ")";
    // ----------------------------------------------------------- the voice, word by word (screen space)
    for (var cI = 0; cI < $.caps.length; cI++) {
      var C = $.caps[cI];
      if (t < C.a - 0.01 || t > C.b + 0.1) { C.el.style.visibility = "hidden"; continue; }
      C.el.style.visibility = "visible";
      var cout = eIn((t - C.b) / 0.09);
      C.el.style.opacity = (1 - cout).toFixed(3);
      C.el.style.filter = cout > 0 ? "blur(" + (cout * 8).toFixed(1) + "px)" : "none";
      C.el.style.transform = "scale(" + (1 - 0.12 * cout).toFixed(4) + ")";
      for (var sj = 0; sj < C.spans.length; sj++) {
        var qw = t - C.ts[sj], sp2 = C.spans[sj];
        if (qw < 0) { sp2.style.opacity = "0"; continue; }
        var kc = spr(qw, 18, 0.55);
        sp2.style.opacity = sat(qw / 0.05).toFixed(3);
        sp2.style.transform = "translateY(" + px(36 * (1 - kc)) + ") scale(" + (0.35 + 0.65 * kc).toFixed(4) + ")" + (sp2.className.indexOf("pk") >= 0 ? " rotate(" + (-8 * (1 - kc)).toFixed(2) + "deg)" : "");
      }
    }
    // "Stalak": the logo slams in on the word
    var cl = $.caps[1], lgq = t - cl.logo;
    if (lgq >= 0 && t <= cl.b + 0.1) {
      var lk1 = spr(lgq, 13, 0.55), lk2 = spr(lgq, 10, 0.7), lout = eIn((t - cl.b) / 0.09);
      $.caplogo.style.visibility = "visible"; $.caplogo.style.opacity = (sat(lgq / 0.05) * (1 - lout)).toFixed(3);
      $.caplogo.style.transform = "rotateX(" + (55 * (1 - lk2)).toFixed(2) + "deg) scale(" + ((1 + 1.1 * (1 - lk1)) * (1 - 0.12 * lout)).toFixed(4) + ")";
    } else $.caplogo.style.visibility = "hidden";
    // ----------------------------------------------------------- the cursor, and the file it carries
    var cu = cursorAt(t), cx = cu[0], cy = cu[1];
    var press = 0;
    for (var cj = 0; cj < CLICKS.length; cj++) press = Math.max(press, bump((t - CLICKS[cj] + 0.06) / 0.2));
    $.cursor.style.visibility = t > B(2.6) && t < B(42.6) ? "visible" : "hidden";
    var cq = unproj(cx, cy, 60);
    $.cursor.style.transform = "translate3d(" + px(cq[0] - 6) + "," + px(cq[1] - 4) + ",60px) scale(" + (1 - 0.16 * press).toFixed(4) + ")";
    var chipV = win(t, B(9.75), B(10.75), 0.01, 0.16);
    if (chipV > 0) {
      var cd = sat((t - B(10.75)) / 0.16), chs = 1 - 0.7 * eIn(cd), sw3 = Math.sin(6.2832 * (t - B(9.75)) / 1.9) * (1 - cd);
      var chq = unproj(mix(cx - 300, 540 - 150, eIn(cd)), mix(cy - 54, 1040 - 42, eIn(cd)), 30);
      $.chip.style.visibility = "visible"; $.chip.style.opacity = chipV.toFixed(3);
      $.chip.style.transform = "translate3d(" + px(chq[0]) + "," + px(chq[1]) + ",30px) scale(" + chs.toFixed(3) + ") rotate(" + (-5 * (1 - cd) + 3 * sw3).toFixed(2) + "deg)";
    } else $.chip.style.visibility = "hidden";
  }

  window.ONE = { init: init, render: render, B: B };
})();
