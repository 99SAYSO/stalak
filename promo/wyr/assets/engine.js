/* « Would you rather » (promo v6) — the render engine. Every style below is a pure function of t (seconds).
   1. The game (canvas #wyr): red / blue halves, the options, the clock, the real votes. Its "OR" is the one shape, flat and black.
   2. The boom (b48, the beat's own drop): the game cracks into shards that turn to snow; the OR circle turns to ice and grows 3D.
   3. "Well, yeah. The answer is obviously Stalak.": the circle flips into Stalak's icon; then the demo of promo v5 « One take ».
   The v5 demo keeps its own clock: tv = t - SH * P, so every B(x) in it is a v5 beat (see build.py).
   Springs are closed-form step responses; a value with many targets is the sum of one spring per change.
   window.T comes from times.js (build.py). ONE.init(root) builds the repeated parts, ONE.render(t) draws a frame. */
(function () {
  "use strict";
  var T = window.T, P = T.P, TOTAL = T.TOTAL, OFFT = T.SH * P, BOOM = T.BOOM, Q = T.Q;
  function B(b) { return b * P; }
  function F(x) { return x - OFFT; }                         // a film time on the v5 clock
  function W(i, rel) { return T.VO[i][0] - OFFT + rel; }     // a word of voice line i, rel seconds after the line starts (v5 clock)
  var LID = ["wyr_q1", "wyr_q2", "wyr_q3", "wyr_a1", "wyr_a2", "wyr_a3"];
  function wr(i, w) {                                        // when a word of a new line starts (measured in the file)
    var ws = T.VW[LID[i]];
    for (var k = 0; k < ws.length; k++) if (ws[k][0].replace(/[.,?!]/g, "").toLowerCase() === w) return ws[k][1];
    throw new Error("word " + w);
  }
  function sat(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function mix(a, b, k) { return a + (b - a) * k; }
  function eOut(x) { x = sat(x); return 1 - Math.pow(1 - x, 3); }
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
  // ------------------------------------------------------------ key times, on the v5 clock
  var tB = F(BOOM);                                   // the boom
  var tStk = W(3, wr(3, "stalak"));                   // "...obviously Stalak": the ice circle flips into the icon
  var tHr = W(4, wr(4, "an")), tOv = W(4, wr(4, "over"));   // "an hour" ... "are over."
  var tZ = F(T.ZB);                                   // "Now,": the icon becomes the drop zone
  // ------------------------------------------------------------ the one shape: states [t, W, H, R, X, Y, spring w]
  var S = [
    [-1e4,            160,  160,  80, 540, 960],        // the game's "OR"
    [tB,              300,  300, 150, 540, 960, 9],     // the boom: an ice disc
    [tStk,            340,  340,  80, 540, 975, 13],    // Stalak's icon, on "Stalak"
    [tZ,              860,  520,  46, 540, 930, 14],    // the drop zone (v5 b9.75)
    [B(10.25),        176,  176,  88, 540, 900, 17],    // it takes the file (v5 b10.75)
    [B(10.75),        880,  230, 115, 540, 880, 15],    // the song pill (v5 b11.25)
    [B(17),           880,  430,  52, 540, 700, 14],    // add your takes (top stays at 485 while it grows)
    [B(18.5),         880,  560,  52, 540, 765, 16],
    [B(18.875),       880,  690,  52, 540, 830, 16],
    [B(19.25),        880,  820,  52, 540, 895, 16],
    [B(20),           880,  780,  52, 540, 895, 11],    // the tray of the sync
    [B(24.25),        880,  620,  52, 540, 850, 15],    // lyrics
    [B(26.75),        900, 1020,  56, 540, 925, 14],    // the edit, then the look (same card)
    [B(40.25),        600,  180,  90, 540, 900, 15],    // export
    [B(44),          1240, 2140,   0, 540, 960, 11],    // the payoff, full screen, one bar
    [B(48),           300,  300,  70, 540, 610, 12],    // the app icon (v5 b56.25: the "40 min" part is out)
  ];
  function col(i) { return S.map(function (s) { return [s[0], s[i], s[6] || 13, 0.8]; }); }
  var sW = K(col(1)), sH = K(col(2)), sR = K(col(3)), sX = K(col(4)), sY = K(col(5));
  var sZ = K([[-1e4, 0], [tB, 80, 9, 0.7], [tB + 0.45, 0, 7, 0.9], [B(20), -130, 7, 0.9], [B(22), -40, 12, 0.85], [B(24.25), 0, 9, 0.9],
              [B(43.55), -34, 18, 0.9], [B(44), 40, 11, 0.85], [B(48.3), 90, 8, 0.8], [B(49.1), 0, 7, 0.9]]);
  var sSpin = K([[-1e4, 0], [tStk, 360, 12.5, 0.78], [B(48.3), 720, 9, 0.78]]);   // the end: it folds, then flips     // the flips into the icon (90 deg at about +0.1 s)
  var sRZ = K([[-1e4, 0], [F(Q[0].nx), 360, 12, 0.8], [F(Q[1].nx), 720, 12, 0.8]]);   // the OR circle rolls into the next question
  var sD = K([[-1e4, 0], [tB, 1, 10, 0.72]]);                                     // the extrusion: none in the game, grown on the boom
  var sFace = CE([[-1e4, "#000000"], [tB + 0.02, "#d6ecff"], [tStk + 0.1, "#1f6fd6"], [tZ + 0.1, "#eef7ff"], [B(10.25) + 0.08, INK],
                  [B(17) + 0.1, "#ffffff"], [B(20) + 0.08, "#d6ecff"], [B(24.25) + 0.1, "#ffffff"], [B(40.25) + 0.1, INK], [B(48.3) + 0.08, "#1f6fd6"]], 0.07);
  var PRESS = [[B(41.25), 0.05]];
  // a 3D kick at each morph, sized to the change: [t, rotateX deg, rotateY deg]
  var KICKS = [[tB, 26, -32], [tStk, 14, 0], [tZ, 14, 0], [B(10.25), 0, 8], [B(10.75), 0, -15], [B(17), 16, 0], [B(24.25), 0, 12], [B(26.75), -12, 0],
               [B(37.75), 0, -4], [B(40.25), 15, 0], [B(44), 4, 0], [B(48), 12, 0]];
  // camera: whips on the changes [t, dx, dy, rotateZ], an orbit while the takes fly out
  var CAMK = [[tB, 0, 0, -4], [tStk, 0, 0, 2.5], [tZ, -60, 0, 3], [B(10.25), 0, 0, -2], [B(10.75), 50, 0, 2.5], [B(17), 0, -40, -2.5], [B(24.25), -50, 0, 2],
              [B(26.75), 0, 40, -2], [B(35), 0, 0, 0.8], [B(37.75), 40, 0, -1.5], [B(40.25), 0, -30, 2], [B(44), 0, 0, -3], [B(48), 0, 0, 2.5]];
  var cZ = K([[-1e4, 1], [B(20), 0.93, 5, 0.9], [B(22), 1.0, 14, 0.85]]);
  var cRY = K([[-1e4, 0], [B(20.1), -15, 4.5, 0.85], [B(21.4), 7, 4.5, 0.85], [B(22), 0, 14, 0.9]]);
  var cRX = K([[-1e4, 0], [B(20.1), 5, 5, 0.9], [B(22), 0, 14, 0.9]]);
  // cursor: [t0, t1, x, y, arc] = move to (x, y) between t0 and t1 on an arc (below if arc < 0), settling; the tip, in world coordinates
  var CUR = [
    [-1e4, 0, 1420, 1250, 0],
    [B(9.3), B(10.0), 712, 1094, -0.18],      // in with the file, under the zone's text (it drops on "drop")
    [B(10.4), B(11.1), 1230, 1480, 0.1],
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
  var CLICKS = [B(10.25), B(18), B(25), B(35), B(38.75), B(41.25)];
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
  // the sync tiles: out of the card's rows, into depth, out of time; then in line and in sync on b22
  function tileTracks(k) {
    var tl = B(20) + 0.07 * k, y0 = 485 + 410 + 56 + 130 * k;
    var xs = [275, 540, 805], ys = [830, 820, 830], zs = [120, 200, 60], rys = [14, 0, -14], xf = [290, 540, 790];
    return {
      x: K([[-1e4, 540], [tl, xs[k], 8, 0.8], [B(22), xf[k], 14, 0.72], [B(24.25), 540, 11, 0.9]]),
      y: K([[-1e4, y0], [tl, ys[k], 8, 0.8], [B(22), 758, 14, 0.72], [B(24.25), 850, 11, 0.9]]),
      z: K([[-1e4, 0], [tl, zs[k], 7, 0.8], [B(22), 24, 14, 0.75], [B(24.25), -80, 11, 0.9]]),
      ry: K([[-1e4, 0], [tl, rys[k], 7, 0.8], [B(22), 0, 14, 0.75]]),
      s: K([[-1e4, 0.3], [tl, 1, 9, 0.75], [B(24.25), 0.2, 12, 0.9]]),
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
  var ringL = K([[-1e4, 52, 9, 0.8], [B(38.75), 262, 9.5, 0.78]]), ringR = K([[-1e4, 218, 9, 0.8], [B(38.75), 428, 16, 0.72]]);

  // ------------------------------------------------------------ falling snow (behind everything, after the boom)
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

  // ------------------------------------------------------------ the game (canvas): red / blue, the options, the clock, the votes
  // the owner's background, redrawn sharp at 1080 x 1920 (his file is 415 x 739): same colours, the line and the circle in the middle
  var RED = "#ff3728", BLUE = "#129aff", GREEN = "#2df014";
  var G = { c: null, x: null, im: {}, fit: null, plate: null };
  var LAY = { a: { txt: 292, img: 590, pct: 826 }, b: { txt: 1268, img: 1530, pct: 1090 } };
  var IMS = 300, FS = 86, MAXW = 900;
  function gReady() {
    if (document.fonts && document.fonts.check && !document.fonts.check('900 80px "NunitoW"')) return false;
    for (var k in G.im) { var im = G.im[k]; if (!im.complete || (!im.naturalWidth && k !== "icon")) return false; }
    return true;
  }
  function gFit() {   // each option's font size, so that its longest line fits (measured once the font is there)
    if (G.fit) return G.fit;
    if (!gReady()) return null;
    var c = G.x, out = [];
    c.font = '900 ' + FS + 'px "NunitoW"';
    T.WC.forEach(function (q) {
      var r = {};
      ["a", "b"].forEach(function (sd) { var w = 1; q[sd].lines.forEach(function (l) { w = Math.max(w, c.measureText(l).width); }); r[sd] = Math.min(FS, FS * MAXW / w); });
      out.push(r);
    });
    G.fit = out;
    return out;
  }
  function gText(c, s, x, y, fs, fill, sw) {   // white words with a thick black outline and a drop shadow, like the game
    c.font = '900 ' + fs.toFixed(1) + 'px "NunitoW"';
    c.textAlign = "center"; c.textBaseline = "middle"; c.lineJoin = "round"; c.miterLimit = 2;
    c.shadowColor = "rgba(0,0,0,0.30)"; c.shadowOffsetY = Math.max(3, sw * 0.42); c.shadowBlur = 0;
    c.lineWidth = sw; c.strokeStyle = "#000"; c.strokeText(s, x, y);
    c.shadowColor = "rgba(0,0,0,0)"; c.shadowOffsetY = 0;
    c.fillStyle = fill; c.fillText(s, x, y);
  }
  function rrect(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function qIn(qi, sd) { return (qi === 0 ? -0.22 : Q[qi].s + 0.05) + (sd === "a" ? 0 : 0.06); }
  function qOut(qi, t) { return Q[qi].nx !== null ? eIn((t - Q[qi].nx) / 0.14) : 0; }
  function gOption(c, qi, sd, t, fit) {
    var o = T.WC[qi][sd], L = LAY[sd], top = sd === "a", t0 = qIn(qi, sd);
    if (t < t0) return;
    var kin = spr(t - t0, 15, 0.6), kout = qOut(qi, t);
    if (kout >= 1) return;
    var al = sat((t - t0) / 0.07) * (1 - kout), dy = (top ? -90 : 90) * kout;
    var sc = (0.45 + 0.55 * kin) * (1 - 0.25 * kout);
    var ph = qi * 1.7 + (top ? 0 : 2.1), bob = 7 * Math.sin(6.2832 * t / 2.3 + ph), rot = 3.2 * Math.sin(6.2832 * t / 3.1 + ph);
    c.save(); c.globalAlpha = al;
    c.translate(540, L.img + dy + bob); c.rotate(rot * Math.PI / 180); c.scale(sc, sc);
    for (var j = 0; j < o.img.length; j++) {
      var nm = o.img[j], im = G.im[nm.replace("_3d", "")];
      if (!im) continue;
      if (nm === "prohibited_3d") {     // "without": a red "no" ring and slash over the thing, which stays visible
        c.lineCap = "round";
        for (var pass = 0; pass < 2; pass++) {
          c.lineWidth = pass ? 24 : 36; c.strokeStyle = pass ? "#ff2b2b" : "rgba(90,0,0,0.45)";
          c.beginPath(); c.arc(0, 0, IMS * 0.47, 0, 6.2832); c.stroke();
          c.beginPath(); c.moveTo(-IMS * 0.33, -IMS * 0.33); c.lineTo(IMS * 0.33, IMS * 0.33); c.stroke();
        }
      }
      else if (nm === "icon") { c.shadowColor = "rgba(0,0,0,0.32)"; c.shadowOffsetY = 14; c.shadowBlur = 20; c.drawImage(im, -132, -132, 264, 264); c.shadowColor = "rgba(0,0,0,0)"; c.shadowOffsetY = 0; c.shadowBlur = 0; }
      else { var isz = o.img.length > 1 ? IMS * 0.8 : IMS; c.drawImage(im, -isz / 2, -isz / 2, isz, isz); }
    }
    c.restore();
    var fs = fit[qi][sd], lh = fs * 1.06, n = o.lines.length, y0 = -(n - 1) * lh / 2, ks = (0.7 + 0.3 * kin) * (1 - 0.2 * kout);
    c.save(); c.globalAlpha = al; c.translate(540, L.txt + dy); c.scale(ks, ks);
    for (var i = 0; i < n; i++) gText(c, o.lines[i], 0, y0 + i * lh, fs, "#ffffff", fs * 0.21);
    c.restore();
  }
  function gVotes(c, qi, t) {   // the result: the losing half dims, the winner flashes, the two shares pop (the winner in green)
    var q = Q[qi]; if (q.rev === null) return;
    var tr = B(q.rev); if (t < tr) return;
    var kout = qOut(qi, t); if (kout >= 1) return;
    var w = T.WC[qi], wn = w.a.pct > w.b.pct ? "a" : "b";
    var dim = 0.26 * sat((t - tr) / 0.18) * (1 - kout);
    c.fillStyle = "rgba(0,0,0," + dim.toFixed(3) + ")";
    if (wn === "a") c.fillRect(0, 960, 1080, 960); else c.fillRect(0, 0, 1080, 960);
    var fl = 0.3 * decay(t, tr, 0.13) * (1 - kout);
    if (fl > 0.003) { c.fillStyle = "rgba(255,255,255," + fl.toFixed(3) + ")"; if (wn === "a") c.fillRect(0, 0, 1080, 960); else c.fillRect(0, 960, 1080, 960); }
    ["a", "b"].forEach(function (sd, j) {
      var dt = t - tr - 0.04 * j; if (dt < 0) return;
      var k = spr(dt, 16, 0.5), isW = sd === wn, sc = (0.3 + 0.7 * k) * (isW ? 1.14 : 1) * (1 - 0.3 * kout);
      c.save(); c.globalAlpha = sat(dt / 0.05) * (1 - kout);
      c.translate(540, LAY[sd].pct + (sd === "a" ? -70 : 70) * kout); c.scale(sc, sc);
      gText(c, w[sd].pct + "%", 0, 0, 116, isW ? GREEN : "#ffffff", 22);
      c.restore();
    });
  }
  function gPill(c, qi, t) {    // the number of real votes, on the line, left of the circle (where the clock was)
    var q = Q[qi]; if (q.rev === null) return;
    var tr = B(q.rev) + 0.1; if (t < tr) return;
    var kout = qOut(qi, t); if (kout >= 1) return;
    var w = T.WC[qi], kv = spr(t - tr, 15, 0.6), av = sat((t - tr) / 0.06) * (1 - kout);
    c.save(); c.globalAlpha = av; c.font = '900 40px "NunitoW"';
    var tw = c.measureText(w.votes).width, pw = tw + 54, cx0 = 46 + pw / 2;
    c.translate(cx0, 960); c.scale(0.6 + 0.4 * kv, 0.6 + 0.4 * kv);
    rrect(c, -pw / 2, -37, pw, 74, 37); c.fillStyle = "#000"; c.fill(); c.lineWidth = 5; c.strokeStyle = "#fff"; c.stroke();
    c.fillStyle = "#fff"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(w.votes, 0, 2);
    c.restore();
  }
  function gClock(c, qi, t) {   // the 3-second clock, left on the line: 3, 2, 1 and the time left in red
    var q = Q[qi], t0 = B(q.cs), dur = T.CD * P;
    if (t < t0) return;
    var t1 = q.rev !== null ? B(q.rev) : 1e9, kout = eIn((t - t1) / 0.1);
    if (kout >= 1) return;
    var e = sat((t - t0) / dur), n = Math.max(1, 3 - Math.floor(e * 3 + 1e-6));
    var tn = t - (t0 + (3 - n) * dur / 3), pop = 1 + 0.24 * (1 - spr(tn, 18, 0.5));
    var kin = spr(t - t0, 15, 0.6), sc = (0.4 + 0.6 * kin) * (1 - kout) * pop;
    c.save(); c.translate(150, 960); c.scale(sc, sc);
    c.beginPath(); c.arc(0, 0, 68, 0, 6.2832); c.fillStyle = "#fff"; c.fill(); c.lineWidth = 9; c.strokeStyle = "#000"; c.stroke();
    if (e < 0.999) { c.beginPath(); c.arc(0, 0, 51, -Math.PI / 2, -Math.PI / 2 + 6.2832 * (1 - e)); c.lineWidth = 12; c.lineCap = "round"; c.strokeStyle = RED; c.stroke(); }
    c.fillStyle = "#000"; c.font = '900 64px "NunitoW"'; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(String(n), 0, 4);
    c.restore();
  }
  function gPlate(c, t) {
    c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1;
    c.fillStyle = RED; c.fillRect(0, 0, 1080, 960);
    c.fillStyle = BLUE; c.fillRect(0, 960, 1080, 960);
    var fit = gFit(), qi;
    for (qi = 0; qi < 3; qi++) {
      var q = Q[qi];
      if (t < q.s - 0.3 || (q.nx !== null && t > q.nx + 0.2)) continue;
      if (fit) { gOption(c, qi, "a", t, fit); gOption(c, qi, "b", t, fit); gVotes(c, qi, t); }
    }
    c.fillStyle = "#000"; c.fillRect(0, 948, 1080, 24);
    for (qi = 0; qi < 3; qi++) {
      q = Q[qi];
      if (t < q.s || (q.nx !== null && t > q.nx + 0.2)) continue;
      if (fit) { gClock(c, qi, t); gPill(c, qi, t); }
    }
  }
  function gCache() {   // the game's last frame before the boom, kept to cut the shards from
    if (G.plate) return G.plate;
    if (!gReady()) return null;
    var cv = document.createElement("canvas"); cv.width = 1080; cv.height = 1920;
    gPlate(cv.getContext("2d"), BOOM - 0.0005);
    G.plate = cv;
    return cv;
  }
  // ------------------------------------------------------------ the boom: shards cut along cracks from the circle, then snow
  var SHARDS = [], BURST = [], PUFF = [];
  function initShards() {
    var r = rng(42), cx = 540, cy = 960, NS = 15, rings = [92, 190, 330, 520, 760, 1060, 1500], ang = [], pts = [], i, j;
    for (i = 0; i < NS; i++) ang.push((i + (r() - 0.5) * 0.55) / NS * 6.2832 + 0.2);
    for (j = 0; j < rings.length; j++) { var row = []; for (i = 0; i < NS; i++) { var rr = rings[j] * (j === 0 ? 1 : 0.86 + 0.28 * r()); row.push([cx + rr * Math.cos(ang[i]), cy + rr * Math.sin(ang[i])]); } pts.push(row); }
    function add(p) {
      var mx = 0, my = 0, x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      p.forEach(function (q) { mx += q[0]; my += q[1]; x0 = Math.min(x0, q[0]); y0 = Math.min(y0, q[1]); x1 = Math.max(x1, q[0]); y1 = Math.max(y1, q[1]); });
      mx /= p.length; my /= p.length;
      var dx = mx - cx, dy = my - cy, d = Math.sqrt(dx * dx + dy * dy) || 1, a = Math.atan2(dy, dx) + (r() - 0.5) * 0.5;
      SHARDS.push({ p: p, mx: mx, my: my, bx: x0 - 2, by: y0 - 2, bw: x1 - x0 + 4, bh: y1 - y0 + 4, dx: Math.cos(a), dy: Math.sin(a),
                    v: Math.max(460, (1750 - 0.6 * d) * (0.75 + 0.5 * r())), dl: 0.028 + d / 11000, fo: 0.22 * r(),
                    w: (r() - 0.5) * 7, fv: (r() - 0.5) * 11, zg: 0.25 + 0.95 * r() });
    }
    for (j = 0; j < rings.length - 1; j++) for (i = 0; i < NS; i++) {
      var a = pts[j][i], b = pts[j][(i + 1) % NS], c = pts[j + 1][(i + 1) % NS], d = pts[j + 1][i];
      if (j >= 2 && r() < 0.7) { if (r() < 0.5) { add([a, b, c]); add([a, c, d]); } else { add([a, b, d]); add([b, c, d]); } }
      else add([a, b, c, d]);
    }
  }
  function mkBurst(list, seed, n, cx, cy, spread, vmax, life) {
    var r = rng(seed);
    for (var i = 0; i < n; i++) {
      var a = r() * 6.2832, rho = spread * (0.08 + 0.92 * Math.pow(r(), 1.25)), big = r() < 0.08;
      list.push({ x: cx + rho * Math.cos(a), y: cy + rho * Math.sin(a) * 1.15, dx: Math.cos(a + (r() - 0.5) * 0.6), dy: Math.sin(a + (r() - 0.5) * 0.6),
                  v: (0.25 + 0.75 * r()) * vmax * (1.15 - 0.6 * rho / spread), dl: 0.015 + rho / 9000 + 0.04 * r(), k: 2 + 1.6 * r(),
                  rad: big ? 9 + 13 * r() : 1.6 + 3.8 * Math.pow(r(), 2), big: big, fall: 40 + 90 * r(), amp: 8 + 28 * r(), w: 0.6 + 1.4 * r(), ph: r() * 6.28,
                  life: life * (0.6 + 0.6 * r()), a: 0.55 + 0.45 * r() });
    }
  }
  function drawBurst(c, list, t0, t, ox, oy) {
    var tau = t - t0; if (tau < 0) return;
    c.fillStyle = "#ffffff";
    for (var i = 0; i < list.length; i++) {
      var p = list[i], q = tau - p.dl; if (q < 0) continue;
      var al = p.a * sat(q / 0.05) * (1 - sat((q - p.life) / 0.7)); if (al <= 0.003) continue;
      var d = p.v * (1 - Math.exp(-p.k * q)) / p.k;
      var x = p.x + p.dx * d + p.amp * Math.sin(p.w * q + p.ph) * sat(q / 0.6) + ox, y = p.y + p.dy * d + p.fall * q + oy;
      c.globalAlpha = al;
      if (p.big) c.drawImage(sprite, x - p.rad * 2, y - p.rad * 2, p.rad * 4, p.rad * 4);
      else { c.beginPath(); c.arc(x, y, p.rad, 0, 6.2832); c.fill(); }
    }
    c.globalAlpha = 1;
  }
  function drawBoom(c, t) {
    var tau = t - BOOM, pl = gCache();
    var sk = decay(t, BOOM, 0.12), shx = 16 * Math.sin(tau * 95) * sk, shy = 11 * Math.cos(tau * 80) * sk;
    if (pl && tau < 1.3) {
      for (var i = 0; i < SHARDS.length; i++) {
        var s = SHARDS[i], q = tau - s.dl, al = 1 - sat((tau - 0.3 - s.fo) / 0.42);
        if (al <= 0.003) continue;
        var tx = 0, ty = 0, rot = 0, sx = 1, gr = 1;
        if (q > 0) { var d = s.v * (1 - Math.exp(-2.4 * q)) / 2.4; tx = s.dx * d; ty = s.dy * d + 650 * q * q; rot = s.w * q; sx = Math.cos(s.fv * q); gr = 1 + s.zg * q; }
        c.save(); c.globalAlpha = al;
        c.translate(s.mx + tx + shx, s.my + ty + shy); c.rotate(rot); c.scale(sx * gr, gr); c.translate(-s.mx, -s.my);
        c.beginPath(); c.moveTo(s.p[0][0], s.p[0][1]); for (var j = 1; j < s.p.length; j++) c.lineTo(s.p[j][0], s.p[j][1]); c.closePath();
        c.save(); c.clip(); c.drawImage(pl, 0, 0);
        var fr = sat(Math.max(0, q) / 0.5) * 0.78;   // the shard frosts over: the game turns to snow
        if (fr > 0.003) { c.fillStyle = "rgba(234,246,255," + fr.toFixed(3) + ")"; c.fillRect(s.bx, s.by, s.bw, s.bh); }
        c.restore();
        c.lineJoin = "round"; c.lineWidth = 3.5; c.strokeStyle = "rgba(255,255,255," + (0.5 + 0.45 * decay(t, BOOM, 0.1)).toFixed(3) + ")"; c.stroke();
        c.restore();
      }
    }
    drawBurst(c, BURST, BOOM, t, shx, shy);
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

  function init(root) {
    R0 = root;
    ["snow", "wyr", "flash", "world", "fshadow", "shape", "face", "shade", "sheen", "rim", "icb", "fringe",
     "c-or", "c-ice", "ice-flake", "c-zone", "c-load", "c-song", "c-takes", "c-sync", "c-lyr", "c-edit", "c-exp", "c-pay", "c-icon",
     "z-hover", "l-spin", "s-bpm", "s-dots", "t-imp", "s-ok", "hourg",
     "l-s1", "l-sel", "l-hint", "l-1", "l-2", "e-low", "f-low", "e-ver1", "e-ver2", "e-ruler", "e-bar", "e-ph", "e-knob", "e-shuf", "e-shufice",
     "f-ring", "f-frost", "f-edge", "x-fill", "x-lab2", "p-cap",
     "tile1", "tile2", "tile3", "chip", "logo", "caplogo", "caps", "tag1", "tag2", "cursor", "backf"].forEach(function (id) { $[id] = root.querySelector("#" + id); });
    ctx = $.snow.getContext("2d"); initSnow();
    G.c = $.wyr; G.x = $.wyr.getContext("2d");
    root.querySelectorAll(".pre img").forEach(function (im) { G.im[im.id.replace("im-", "")] = im; });
    initShards();
    mkBurst(BURST, 77, 560, 540, 960, 1050, 1900, 2.2);
    mkBurst(PUFF, 91, 80, 0, 0, 120, 1000, 0.8);
    $.layers = [];
    for (var k = 16; k >= 1; k--) {
      var L = document.createElement("div"); L.className = "ly";
      L.style.background = sideColour(k, 16); L.k = k;
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
    // the voice, word by word (each line in chunks that fit two lines on screen); index 3-5: the answer, 6-13: the v5 lines
    function nw(i, w) { return W(i, wr(i, w)); }
    var CAPS = [
      { b: nw(3, "the") - 0.05, words: [["Well,", W(3, 0)], ["yeah.", nw(3, "yeah")]] },
      { b: W(4, 0) - 0.06, words: [["The", nw(3, "the")], ["answer", nw(3, "answer")], ["is", nw(3, "is")], ["obviously", nw(3, "obviously")], ["Stalak.", nw(3, "stalak"), 1]] },
      { b: nw(4, "editing") - 0.04, words: [["The", W(4, 0)], ["days", nw(4, "days")], ["of", nw(4, "of")], ["spending", nw(4, "spending")], ["an", nw(4, "an"), 1], ["hour", nw(4, "hour"), 1]] },
      { b: W(5, 0) - 0.06, words: [["editing", nw(4, "editing")], ["a", nw(4, "a")], ["snippet", nw(4, "snippet")], ["are", nw(4, "are")], ["over.", nw(4, "over"), 1]] },
      { b: W(6, 0) - 0.06, words: [["Now,", W(5, 0)], ["you", nw(5, "you")], ["just", nw(5, "just")], ["drop", nw(5, "drop"), 1], ["your", nw(5, "your")], ["song.", nw(5, "song")]] },
      { b: W(7, 0) - 0.06, top: 396, logo: W(6, 0), words: [["finds", W(6, 0.70)], ["the", W(6, 1.12)], ["beat.", W(6, 1.38), 1]] },
      { b: W(8, 0) - 0.06, words: [["Add", W(7, 0)], ["your", W(7, 0.20)], ["takes.", W(7, 0.36), 1]] },
      { b: W(9, 0) - 0.06, words: [["They", W(8, 0)], ["sync", W(8, 0.12), 1], ["up", W(8, 0.46)], ["by", W(8, 0.70)], ["themselves.", W(8, 0.88)]] },
      { b: W(10, 0) - 0.06, words: [["Paste", W(9, 0)], ["your", W(9, 0.26)], ["lyrics.", W(9, 0.38), 1]] },
      { b: W(10, 0.98) - 0.04, words: [["Then", W(10, 0)], ["it", W(10, 0.28)], ["cuts", W(10, 0.38), 1], ["between", W(10, 0.66)]] },
      { b: W(10, 1.78) - 0.04, words: [["your", W(10, 0.98)], ["takes,", W(10, 1.16)]] },
      { b: W(11, 0) - 0.06, words: [["on", W(10, 1.78)], ["the", W(10, 1.96)], ["beat.", W(10, 2.12), 1]] },
      { b: W(12, 0) - 0.06, words: [["Shuffle", W(11, 0), 1], ["for", W(11, 0.30)], ["a", W(11, 0.42)], ["new", W(11, 0.48)], ["edit.", W(11, 0.66)]] },
      { b: W(13, 0) - 0.06, words: [["Pick", W(12, 0)], ["a", W(12, 0.14)], ["look.", W(12, 0.22), 1]] },
      { b: B(44) - 0.05, words: [["And", W(13, 0)], ["export.", W(13, 0.16), 1]] },
    ];
    $.caps = CAPS.map(function (c) {
      var el = document.createElement("div"); el.className = "capc";
      if (c.top) el.style.top = c.top + "px";
      el.innerHTML = c.words.map(function (w) { return '<span class="w' + (w[2] ? " pk" : "") + '">' + w[0] + "</span>"; }).join(" ");
      $.caps.appendChild(el);
      return { el: el, spans: el.querySelectorAll(".w"), a: c.logo || c.words[0][1], b: c.b, logo: c.logo, ts: c.words.map(function (w) { return w[1]; }) };
    });
    $.capLogo = $.caps.filter(function (c) { return c.logo; })[0];
    $.tag1w = $.tag1.querySelectorAll("span");
    $.tagT = [W(14, 0), W(14, 0.45), W(14, 0.74), W(14, 0.82), W(14, 0.94), W(14, 1.15), W(14, 1.22), W(14, 1.30)];
    $.cursor.style.transformOrigin = "6px 4px";
  }

  function render(t) {
    if (!R0) return;
    if (t < 0) t = 0; if (t > TOTAL) t = TOTAL;
    var tv = t - OFFT, game = t < BOOM;
    // ----------------------------------------------------------- the game, then its shards and snow (screen space, under the shape)
    var gc = G.x;
    gc.setTransform(1, 0, 0, 1, 0, 0); gc.clearRect(0, 0, 1080, 1920);
    if (game) gPlate(gc, t);
    else if (t < BOOM + 3.6) drawBoom(gc, t);
    if (tv > tOv - 0.05 && tv < tOv + 1.5) drawBurst(gc, PUFF, tOv + OFFT, t, 860, 930);
    var fla = game ? 0 : 0.9 * Math.exp(-(t - BOOM) / 0.06);
    $.flash.style.opacity = fla.toFixed(3); $.flash.style.visibility = fla > 0.004 ? "visible" : "hidden";
    // ----------------------------------------------------------- camera: still during the game; after the boom, punches on the beat, whips on the changes
    var lv = eIO((t - BOOM) / 0.6), pay = win(tv, B(44) + 0.05, B(48), 0.3, 0.3), full = pay;
    if (game) { $.world.style.transform = "none"; ctx.clearRect(0, 0, 1080, 1920); }
    else {
      var punch = 0.075 * decay(tv, tB, 0.16), bNow = Math.floor(tv / P + 1e-6);
      for (var bb = bNow - 3; bb <= bNow; bb++) {
        var dt = tv - B(bb); if (dt < 0 || B(bb) < tB - 1e-6) continue;
        var amp = bb >= 44 && bb < 48 ? 0.04 : ((bb % 4) + 4) % 4 !== 0 ? 0 : bb < 44 ? 0.018 : 0.012;
        punch += amp * Math.exp(-dt / 0.13);
      }
      var push = 0.04 * eIO((tv - B(44.2)) / B(3.6)) * (1 - eIO((tv - B(48)) / 0.3)) + 0.025 * eIO((tv - B(27)) / B(13)) * (1 - eIO((tv - B(40.25)) / 0.3));
      var cz = cZ(tv) * (1 + punch) * (1 + push);
      var cdx = 0, cdy = 0, crz = 0;
      for (var ck = 0; ck < CAMK.length; ck++) { var ci0 = impulse(tv - CAMK[ck][0], 10.5, 0.62); cdx += CAMK[ck][1] * ci0; cdy += CAMK[ck][2] * ci0; crz += CAMK[ck][3] * ci0; }
      var sh = decay(tv, tB, 0.14);                                // the boom: a short shake
      cdx += 22 * Math.sin((tv - tB) * 90) * sh; cdy += 15 * Math.cos((tv - tB) * 77) * sh;
      var cry = cRY(tv) + 1.0 * Math.sin(6.2832 * tv / 11) * (1 - full) * lv, crx = cRX(tv) + 0.6 * Math.sin(6.2832 * tv / 13 + 1) * (1 - full) * lv;
      $.world.style.transform = "translate3d(" + px(540 + cdx) + "," + px(960 + cdy) + ",0) scale(" + cz.toFixed(4) + ") rotateZ(" + crz.toFixed(3) + "deg) rotateX(" + crx.toFixed(3) + "deg) rotateY(" + cry.toFixed(3) + "deg) translate3d(-540px,-960px,0)";
      drawSnow(tv, cry, Math.max(full, 1 - lv));
    }

    // ----------------------------------------------------------- the shape
    var W_ = sW(tv), H = sH(tv), R = Math.max(0, sR(tv)), X = sX(tv), Y = sY(tv), Z = sZ(tv), dep = game ? 0 : sat(sD(tv));
    var RX = 0, RY = sSpin(tv), RZ = sRZ(tv);
    for (var kq = 0; kq < KICKS.length; kq++) { var ik = impulse(tv - KICKS[kq][0], 10.5, 0.62); RX += KICKS[kq][1] * ik; RY += KICKS[kq][2] * ik; }
    var flI = win(tv, tStk + 0.5, tZ - 0.1, 0.6, 0.2), fl8 = sat((tv - B(49.25)) / 1.2);   // the icon floats once it has landed
    RY += 4 * Math.sin(6.2832 * (tv - tStk) / 5.5) * flI + 4 * Math.sin(6.2832 * (tv - B(49.25)) / 5.5) * fl8;
    RX += 2 * Math.sin(6.2832 * (tv - tStk) / 6.5 + 1) * flI + 2 * Math.sin(6.2832 * (tv - B(49.25)) / 6.5 + 1) * fl8;
    var sc = 1;
    for (var qk = 0; qk < 3; qk++) {                               // the game's circle answers the voice: a pulse on "or", on the votes
      sc += 0.16 * bump((t - Q[qk].or + 0.03) / 0.3);
      if (Q[qk].rev !== null) sc += 0.07 * bump((t - B(Q[qk].rev)) / 0.26);
    }
    for (var p = 0; p < PRESS.length; p++) sc -= PRESS[p][1] * bump((tv - PRESS[p][0]) / 0.24);
    sc -= 0.05 * bump((tv - B(43.5)) / (B(44) - B(43.5)) * 0.5);
    $.shape.style.width = px(W_); $.shape.style.height = px(H);
    $.shape.style.transform = "translate3d(" + px(X - W_ / 2) + "," + px(Y - H / 2) + "," + px(Z) + ") rotateX(" + RX.toFixed(3) + "deg) rotateY(" + RY.toFixed(3) + "deg) rotateZ(" + RZ.toFixed(3) + "deg) scale(" + sc.toFixed(4) + ")";
    var rr = px(R), icon = (tv >= tStk + 0.06 && tv < tZ + 0.06) || tv > B(48.3) + 0.08;
    $.face.style.borderRadius = rr; $.face.style.background = sFace(tv);
    $.face.style.borderWidth = icon ? "0px" : "6px";
    for (var li = 0; li < $.layers.length; li++) {
      var Ly = $.layers[li];
      Ly.style.borderRadius = rr;
      Ly.style.visibility = dep < 0.01 ? "hidden" : "visible";
      Ly.style.transform = "translateZ(" + (-Ly.k * 1.65 * dep).toFixed(2) + "px)";
    }
    $.backf.style.borderRadius = rr; $.backf.style.visibility = dep < 0.01 ? "hidden" : "visible";
    $.backf.style.transform = "translateZ(" + (-(16 * 1.65 * dep + 0.8)).toFixed(2) + "px) rotateY(180deg)";
    var aRX = RX * Math.PI / 180, aRY = RY * Math.PI / 180;
    var nX = Math.sin(aRY) * Math.cos(aRX), nY = -Math.sin(aRX), nZ = Math.cos(aRY) * Math.cos(aRX);
    var nl = -0.42 * nX - 0.42 * nY + 0.8 * nZ;
    $.shade.style.opacity = (sat((0.8 - nl) * 1.4) * 0.45 * (1 - full) * lv).toFixed(3);
    var ryw = ((RY + 180) % 360 + 360) % 360 - 180, tilt = sat((Math.abs(ryw) + Math.abs(RX) * 0.8) / 12);
    $.sheen.style.opacity = (tilt * 0.6 * (1 - full) * lv).toFixed(3);
    $.sheen.style.backgroundPosition = (50 - ryw * 3.2 - RX * 1.6).toFixed(1) + "% 0";
    $.rim.style.opacity = ((1 - full) * lv).toFixed(3);
    var shO = (1 - full) * (1 - win(tv, B(19.9), B(24), 0.3, 0.3) * 0.6) * lv;
    $.fshadow.style.width = px(W_ * 0.92); $.fshadow.style.height = px(Math.max(60, H * 0.08));
    $.fshadow.style.transform = "translate3d(" + px(X - W_ * 0.46) + "," + px(Y + H / 2 + 30) + "," + px(Z - 40) + ")";
    $.fshadow.style.opacity = shO.toFixed(3);
    var gB = Math.max(win(tv, tB + 0.12, tStk + 0.04, 0.45, 0.08), win(tv, B(10.75) + 0.35, B(17) - 0.05, 0.5, 0.1), win(tv, B(40.25) + 0.3, B(43.5), 0.5, 0.1));
    $.icb.setAttribute("width", W_.toFixed(0)); $.icb.setAttribute("height", "100");
    $.icb.style.transform = "translate3d(0," + px(H - 5) + ",0.5px)";
    $.icb.innerHTML = gB > 0.01 ? '<g transform="translate(' + (W_ / 2).toFixed(1) + ',0)"><path d="' + iciclesPath(W_, R, eOut(gB), 0, R > 120 ? 22 : 34) + '" fill="#d6ecff" stroke="#0a0d14" stroke-width="4" stroke-linejoin="round"/></g>' : "";
    var gF = Math.max(win(tv, B(17) + 0.28, B(20) - 0.02, 0.45, 0.1), win(tv, B(24.25) + 0.3, B(26.75) - 0.02, 0.45, 0.1), win(tv, B(26.75) + 0.3, B(40.25) - 0.02, 0.45, 0.1));
    $.fringe.setAttribute("width", (W_ - 12).toFixed(0)); $.fringe.setAttribute("height", "70");
    $.fringe.innerHTML = gF > 0.01 ? '<g transform="translate(' + ((W_ - 12) / 2).toFixed(1) + ',-2)"><path d="' + fringePath(W_ - 12, R, eOut(gF)) + '" fill="#ffffff" stroke="#0a0d14" stroke-width="4" stroke-linejoin="round"/></g>' : "";

    // ----------------------------------------------------------- g0 "OR", g1 the ice disc, g2 the icon (the answer)
    show($["c-or"], game ? 1 : 0, 0);
    show($["c-ice"], tv >= tB + 0.02 && tv < tStk + 0.06 ? 1 : 0, 0);
    $["ice-flake"].style.transform = "rotate(" + ((tv - tB) * 46).toFixed(1) + "deg) scale(" + (0.6 + 0.4 * spr(tv - tB, 12, 0.55)).toFixed(4) + ")";
    show($["c-icon"], icon ? 1 : 0, 0);
    // "an hour": an hourglass pops by the icon; "are over.": it bursts into snow
    if (tv > tHr - 0.02 && tv < tOv + 0.2) {
      var hq = tv - tHr, hk = spr(hq, 14, 0.55), hb = sat((tv - tOv) / 0.12), hs = (0.3 + 0.7 * hk) * (1 + 0.25 * bump(hb)) * (1 - eIn(hb));
      var hrot = 14 + 10 * Math.sin(6.2832 * hq / 1.4) * (1 - hk * 0.5);
      $.hourg.style.visibility = hs > 0.01 ? "visible" : "hidden"; $.hourg.style.opacity = sat(hq / 0.06).toFixed(3);
      $.hourg.style.transform = "translate3d(" + px(860 - 105) + "," + px(930 - 105) + ",40px) rotate(" + hrot.toFixed(2) + "deg) scale(" + hs.toFixed(4) + ")";
    } else $.hourg.style.visibility = "hidden";
    // ----------------------------------------------------------- m1 the zone
    show($["c-zone"], win(tv, tZ + 0.2, B(10.25) + 0.02, 0.16, 0.1), 10, "translate(-50%,-50%)");
    $["z-hover"].style.opacity = (win(tv, B(9.85), B(10.25), 0.1, 0.1) * 0.9).toFixed(3);
    if (tv > tZ && tv < B(10.5)) $.zflakes.style.backgroundPosition = "0 " + px((tv * 46) % 120) + ", 30px " + px((tv * 28) % 90);
    // ----------------------------------------------------------- m2 it takes the file
    show($["c-load"], win(tv, B(10.25) + 0.1, B(10.75) + 0.02, 0.1, 0.08), 8, "translate(-50%,-50%)");
    $["l-spin"].style.transform = "rotate(" + ((tv - B(10.25)) * 620).toFixed(1) + "deg)";
    // ----------------------------------------------------------- m3 the song: its tempo found, its beats counted
    show($["c-song"], win(tv, B(10.75) + 0.16, B(17) + 0.02, 0.16, 0.1), 10, "translate(-50%,-50%)");
    if (tv > B(10.5) && tv < B(17.4)) {
      var bu = eOut((tv - B(11.5)) / (B(14.5) - B(11.5)));
      $["s-bpm"].textContent = (157 * bu).toFixed(1) + " BPM";
      $["s-bpm"].style.transform = "scale(" + (1 + 0.1 * bump((tv - B(14.5)) / 0.3)).toFixed(4) + ")";
      for (var di = 0; di < 4; di++) {
        var on = sat((tv - B(13 + di)) / 0.05), fla2 = decay(tv, B(13 + di), 0.22), dd = $.dots[di];
        dd.style.background = "rgba(255," + Math.round(mix(255, 111, fla2)) + "," + Math.round(mix(255, 174, fla2)) + "," + on.toFixed(3) + ")";
        dd.style.borderColor = on > 0 ? "#ffffff" : "rgba(255,255,255,0.35)";
        dd.style.transform = "scale(" + (1 + 0.45 * fla2).toFixed(3) + ")";
      }
    }
    // ----------------------------------------------------------- m4 the takes (the card grows with each one)
    show($["c-takes"], win(tv, B(17) + 0.18, B(20) + 0.04, 0.16, 0.12), 10, "translateX(-50%)");
    $["t-imp"].style.transform = "scale(" + (1 - 0.04 * bump((tv - B(18)) / 0.22)).toFixed(4) + ")";
    for (var ri = 0; ri < 3; ri++) {
      var row = $.rows[ri], ta = B(18.5) + B(0.375) * ri, re = spr(tv - ta, 14, 0.72);
      row.style.opacity = sat((tv - ta) / 0.1).toFixed(3);
      row.style.transform = "translateX(" + px(80 * (1 - re)) + ") scale(" + (1.04 - 0.04 * re).toFixed(4) + ")";
      row.sp.style.transform = "rotate(" + (Math.max(0, tv - ta) * 520).toFixed(1) + "deg)";
    }
    // ----------------------------------------------------------- m5 the tray, the three takes, in sync on b22
    show($["c-sync"], win(tv, B(20) + 0.2, B(24.25) + 0.02, 0.16, 0.1), 8, "translate(-50%,-50%)");
    $["s-ok"].style.opacity = sat((tv - B(22.15)) / 0.1).toFixed(3);
    $["s-ok"].style.transform = "scale(" + (0.7 + 0.3 * spr(tv - B(22.15), 15, 0.6)).toFixed(4) + ")";
    for (var k = 0; k < 3; k++) {
      var tile = $.tiles[k], tr = TL[k], vis = win(tv, tr.tl, B(24.25) + 0.1, 0.12, 0.2);
      if (vis <= 0.002) { tile.style.visibility = "hidden"; tile.style.opacity = "0"; continue; }
      var wob = sat((tv - tr.tl) / 0.4) * (1 - sat((tv - B(22) + 0.12) / 0.12));
      var x = tr.x(tv), y = tr.y(tv) + 9 * Math.sin(6.2832 * (tv * 1.7 + k * 0.37)) * wob, z = tr.z(tv);
      var ry2 = tr.ry(tv) + 4 * Math.sin(6.2832 * (tv * 1.3 + k * 0.5)) * wob;
      var s2 = tr.s(tv) * (1 + 0.06 * bump((tv - B(22) - 0.03 * k) / 0.26));
      tile.style.visibility = "visible"; tile.style.opacity = vis.toFixed(3);
      tile.style.transform = "translate3d(" + px(x - 120) + "," + px(y - 213) + "," + px(z) + ") rotateY(" + ry2.toFixed(2) + "deg) scale(" + s2.toFixed(4) + ")";
      var okv = sat((tv - B(22) - 0.05 * k) / 0.12);
      tile.ok.style.opacity = okv.toFixed(3); tile.ok.style.transform = "scale(" + (0.6 + 0.4 * spr(tv - B(22) - 0.05 * k, 16, 0.6)).toFixed(3) + ")";
      var off = T.OFFS[k] * (1 - spr(tv - B(22), 13, 0.75)), tt = tv + T.prevOff + off;
      for (var bi = 0; bi < 40; bi++) { var hh = 4 + 46 * envAt(tt + (bi - 20) * 0.06), bar = tile.bars[bi]; bar.style.height = px(hh); bar.style.top = px(29 - hh / 2); }
    }
    // ----------------------------------------------------------- m6 lyrics, pasted in one hit
    show($["c-lyr"], win(tv, B(24.25) + 0.2, B(26.75) + 0.02, 0.16, 0.1), 10, "translate(-50%,-50%)");
    $["l-s1"].style.transform = "scale(" + (1 - 0.06 * bump((tv - B(25)) / 0.2)).toFixed(4) + ")";
    $["l-hint"].style.opacity = (1 - sat((tv - B(25.25)) / 0.08)).toFixed(3);
    for (var lk = 0; lk < 2; lk++) {
      var la = B(25.25) + 0.07 * lk, le = spr(tv - la, 15, 0.7), lel = $["l-" + (lk + 1)];
      lel.style.opacity = sat((tv - la) / 0.06).toFixed(3);
      lel.style.transform = "translateY(" + px(22 * (1 - le)) + ")";
    }
    $["l-sel"].style.opacity = (sat((tv - B(25.25)) / 0.05) * (1 - eIO((tv - B(25.25) - 0.12) / 0.4))).toFixed(3);
    // ----------------------------------------------------------- m7-m10 the edit, then its look, in the same preview
    show($["c-edit"], win(tv, B(26.75) + 0.2, B(40.25) + 0.02, 0.16, 0.1), 10, "translate(-50%,-50%)");
    if (tv > B(26.5) && tv < B(40.6)) {
      var eLow = 1 - eIO((tv - B(37.75)) / 0.14);
      $["e-low"].style.opacity = eLow.toFixed(3); $["e-low"].style.visibility = eLow < 0.002 ? "hidden" : "visible";
      $["e-low"].style.transform = "translateY(" + px(40 * (1 - eLow)) + ")";
      var fLo = sat((tv - B(37.75) - 0.1) / 0.12), fK = spr(tv - B(37.75) - 0.1, 14, 0.75);
      $["f-low"].style.opacity = fLo.toFixed(3); $["f-low"].style.visibility = fLo < 0.002 ? "hidden" : "visible";
      $["f-low"].style.transform = "translateY(" + px(50 * (1 - fK)) + ")";
      if (eLow > 0.002) {
        for (var ki = 0; ki < 21; ki++) {   // each shot lands on a sixteenth, then the shuffle makes them hop and change take
          var bk = $.blocks[ki], tl = B(27.25) + B(0.25) * ki, e2 = spr(tv - tl, 16, 0.62);
          var ts = B(35.1) + 0.02 * ki, hp = bump((tv - ts) / 0.36), tk = tv > ts + 0.18 ? T.NEW[ki] : T.TAKES[ki];
          bk.style.background = TCOL[tk]; bk.style.color = tk === 3 ? INK : "#fff";
          bk.lab.textContent = (+bk.dataset.w > 18) ? String(tk) : "";
          bk.style.opacity = sat((tv - tl) / 0.05).toFixed(3);
          bk.style.transform = "translateY(" + px(-46 * (1 - e2) - 64 * hp) + ") scale(" + (1.2 - 0.2 * e2).toFixed(4) + ")";
          bk.fl.style.opacity = Math.max(decay(tv, tl, 0.12), decay(tv, ts + 0.36, 0.12)).toFixed(3);
        }
        var phx = 52 + 4 + Math.max(0, tv + T.prevOff) / T.CUTS[21] * 788;
        $["e-ph"].style.left = px(phx - 3); $["e-knob"].style.left = px(phx - 15);
        var v2 = eOut((tv - B(36.25)) / 0.22);
        $["e-ver1"].style.transform = "translateY(" + px(-50 * v2) + ")"; $["e-ver2"].style.transform = "translateY(" + px(-50 * v2) + ")";
        var shP = 1 - 0.07 * bump((tv - B(35)) / 0.22);
        $["e-shuf"].style.transform = "scale(" + shP.toFixed(4) + ")";
        $["e-shufice"].style.transform = "scaleY(" + (eOut((tv - B(26.75) - 0.35) / 0.45) * shP).toFixed(3) + ")";
        $["e-shufice"].style.transformOrigin = "50% 0";
      }
      var rl = ringL(tv), rR = ringR(tv);
      $["f-ring"].style.left = px(rl); $["f-ring"].style.width = px(Math.max(40, rR - rl));
      var wp = eIO((tv - B(38.85)) / 0.42);   // Frost wipes across the preview
      $["f-frost"].style.clipPath = "inset(0 " + ((1 - wp) * 100).toFixed(2) + "% 0 0)";
      $["f-edge"].style.left = px(wp * 360); $["f-edge"].style.opacity = (wp > 0.001 && wp < 0.999 ? 1 : 0).toString();
    }
    // ----------------------------------------------------------- m11 export
    show($["c-exp"], win(tv, B(40.25) + 0.16, B(44) + 0.06, 0.14, 0.08), 10, "translate(-50%,-50%)");
    var fw = 600 * eIO((tv - B(41.5)) / (B(43.85) - B(41.5)));
    $["x-fill"].style.width = px(fw); $["x-lab2"].style.clipPath = "inset(0 " + px(600 - fw) + " 0 0)";
    // ----------------------------------------------------------- m12 the payoff (one bar; the video stays while it folds)
    show($["c-pay"], win(tv, B(44) + 0.01, B(48.3) + 0.08, 0.08, 0.05), 14, "translate(-50%,-50%)");
    var pq = t - T.payCap[0];
    show($["p-cap"], win(t, T.payCap[0], T.payCap[1], 0.06, 0.1), 6, "scale(" + (0.6 + 0.4 * spr(pq, 16, 0.55)).toFixed(4) + ")");
    // ----------------------------------------------------------- m15 the icon, the wordmark, the offer, the address
    if (tv >= B(48.75)) {
      var lq = tv - B(48.75), wr2 = eOut(lq / 0.32), ls = 1 + 0.16 * (1 - spr(lq, 9, 0.6)), lrx = 26 * (1 - spr(lq, 7.5, 0.72));
      var dr = sat((tv - B(50.25)) / 1.2), lry = 3.5 * Math.sin(6.2832 * (tv - B(50.25)) / 6) * dr;
      lrx += 1.6 * Math.sin(6.2832 * (tv - B(50.25)) / 7 + 1) * dr;
      $.logo.style.visibility = "visible";
      $.logo.style.transform = "rotateX(" + lrx.toFixed(3) + "deg) rotateY(" + lry.toFixed(3) + "deg) scale(" + ls.toFixed(4) + ")";
      var cp = wr2 < 0.999 ? "inset(0 " + ((1 - wr2) * 100).toFixed(2) + "% 0 0)" : "none";
      for (var gi = 0; gi < $.logoL.length; gi++) $.logoL[gi].style.clipPath = cp;
    } else $.logo.style.visibility = "hidden";
    for (var wi = 0; wi < $.tag1w.length; wi++) {
      var kw2 = sat((tv - $.tagT[wi]) / 0.14), ke = spr(tv - $.tagT[wi], 15, 0.65), sw2 = $.tag1w[wi];
      sw2.style.opacity = kw2.toFixed(3); sw2.style.filter = kw2 > 0 && kw2 < 1 ? "blur(" + ((1 - kw2) * 8).toFixed(1) + "px)" : "none";
      sw2.style.transform = "translateY(" + px(18 * (1 - ke)) + ")";
    }
    $.tag1.style.visibility = tv > W(14, 0) - 0.05 ? "visible" : "hidden";
    var url = "stalak.app", nt = Math.floor(sat((tv - B(51.5)) / 0.28) * url.length + 0.0001);
    $.tag2.textContent = url.slice(0, nt);
    $.tag2.style.transform = "scale(" + (1 + 0.07 * bump((tv - W(15, 0)) / 0.32)).toFixed(4) + ")";
    // ----------------------------------------------------------- the voice, word by word (screen space)
    for (var cI = 0; cI < $.caps.length; cI++) {
      var C = $.caps[cI];
      if (tv < C.a - 0.01 || tv > C.b + 0.1) { C.el.style.visibility = "hidden"; continue; }
      C.el.style.visibility = "visible";
      var cout = eIn((tv - C.b) / 0.09);
      C.el.style.opacity = (1 - cout).toFixed(3);
      C.el.style.filter = cout > 0 ? "blur(" + (cout * 8).toFixed(1) + "px)" : "none";
      C.el.style.transform = "scale(" + (1 - 0.12 * cout).toFixed(4) + ")";
      for (var sj = 0; sj < C.spans.length; sj++) {
        var qw = tv - C.ts[sj], sp2 = C.spans[sj];
        if (qw < 0) { sp2.style.opacity = "0"; continue; }
        var kc = spr(qw, 18, 0.55);
        sp2.style.opacity = sat(qw / 0.05).toFixed(3);
        sp2.style.transform = "translateY(" + px(36 * (1 - kc)) + ") scale(" + (0.35 + 0.65 * kc).toFixed(4) + ")" + (sp2.className.indexOf("pk") >= 0 ? " rotate(" + (-8 * (1 - kc)).toFixed(2) + "deg)" : "");
      }
    }
    // "Stalak finds the beat": the logo slams in on the word
    var cl = $.capLogo, lgq = tv - cl.logo;
    if (lgq >= 0 && tv <= cl.b + 0.1) {
      var lk1 = spr(lgq, 13, 0.55), lk2 = spr(lgq, 10, 0.7), lout = eIn((tv - cl.b) / 0.09);
      $.caplogo.style.visibility = "visible"; $.caplogo.style.opacity = (sat(lgq / 0.05) * (1 - lout)).toFixed(3);
      $.caplogo.style.transform = "rotateX(" + (55 * (1 - lk2)).toFixed(2) + "deg) scale(" + ((1 + 1.1 * (1 - lk1)) * (1 - 0.12 * lout)).toFixed(4) + ")";
    } else $.caplogo.style.visibility = "hidden";
    // ----------------------------------------------------------- the cursor, and the file it carries
    var cu = cursorAt(tv), cx = cu[0], cy = cu[1];
    var press = 0;
    for (var cj = 0; cj < CLICKS.length; cj++) press = Math.max(press, bump((tv - CLICKS[cj] + 0.06) / 0.2));
    $.cursor.style.visibility = tv > B(9.25) && tv < B(42.6) ? "visible" : "hidden";
    var cq = unproj(cx, cy, 60);
    $.cursor.style.transform = "translate3d(" + px(cq[0] - 6) + "," + px(cq[1] - 4) + ",60px) scale(" + (1 - 0.16 * press).toFixed(4) + ")";
    var chipV = win(tv, B(9.25), B(10.25), 0.01, 0.16);
    if (chipV > 0) {
      var cd = sat((tv - B(10.25)) / 0.16), chs = 1 - 0.7 * eIn(cd), sw3 = Math.sin(6.2832 * (tv - B(9.25)) / 1.9) * (1 - cd);
      var chq = unproj(mix(cx - 300, 540 - 150, eIn(cd)), mix(cy - 54, 1040 - 42, eIn(cd)), 30);
      $.chip.style.visibility = "visible"; $.chip.style.opacity = chipV.toFixed(3);
      $.chip.style.transform = "translate3d(" + px(chq[0]) + "," + px(chq[1]) + ",30px) scale(" + chs.toFixed(3) + ") rotate(" + (-5 * (1 - cd) + 3 * sw3).toFixed(2) + "deg)";
    } else $.chip.style.visibility = "hidden";
  }

  window.ONE = { init: init, render: render, B: B };
})();
