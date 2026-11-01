/* « One take » — the render engine. One shape that never cuts: every style below is a pure function of t (seconds).
   Springs are closed-form step responses; a value with many targets is the sum of one spring per change.
   window.T comes from times.js (build.py). ONE.init(root) builds the repeated parts, ONE.render(t) draws a frame. */
(function () {
  "use strict";
  var T = window.T, P = T.P, TOTAL = T.TOTAL;
  function B(b) { return b * P; }
  function sat(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function mix(a, b, k) { return a + (b - a) * k; }
  function eOut(x) { x = sat(x); return 1 - Math.pow(1 - x, 3); }
  function eOut5(x) { x = sat(x); return 1 - Math.pow(1 - x, 5); }
  function eIn(x) { x = sat(x); return x * x * x; }
  function eIO(x) { x = sat(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function bump(x) { return x <= 0 || x >= 1 ? 0 : Math.sin(Math.PI * x); }
  function spr(t, w, z) {
    if (t <= 0) return 0;
    if (z >= 1) return 1 - Math.exp(-w * t) * (1 + w * t);
    var wd = w * Math.sqrt(1 - z * z);
    return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + (z * w / wd) * Math.sin(wd * t));
  }
  // track from keys [[t, v, w?, z?], ...]: v0 + sum over changes of (vi - v(i-1)) * spring(t - ti)
  function K(keys, w0, z0) {
    w0 = w0 || 14; z0 = z0 || 0.8;
    return function (t) {
      var v = keys[0][1];
      for (var i = 1; i < keys.length; i++) { var k = keys[i]; if (t <= k[0]) break; v += (k[1] - keys[i - 1][1]) * spr(t - k[0], k[2] || w0, k[3] || z0); }
      return v;
    };
  }
  // eased steps (no spring): for opacities and colours, which never bounce
  function E(keys, d) {
    return function (t) {
      var v = keys[0][1];
      for (var i = 1; i < keys.length; i++) { var k = keys[i]; if (t <= k[0]) break; v = mix(v, k[1], eIO((t - k[0]) / (k[2] || d))); }
      return v;
    };
  }
  function hex(h) { h = h.replace("#", ""); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
  function CE(keys, d) {   // colour steps
    var c = keys.map(function (k) { return [k[0], hex(k[1])]; });
    return function (t) {
      var v = c[0][1].slice();
      for (var i = 1; i < c.length; i++) { if (t <= c[i][0]) break; var k = eIO((t - c[i][0]) / d); for (var j = 0; j < 3; j++) v[j] = mix(v[j], c[i][1][j], k); }
      return "rgb(" + Math.round(v[0]) + "," + Math.round(v[1]) + "," + Math.round(v[2]) + ")";
    };
  }
  function rng(s) { return function () { s |= 0; s = s + 0x6D2B79F5 | 0; var t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function hash(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
  // visibility window: fades in at a over din, out at b over dout
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

  var INK = "#0a0d14";
  var $ = {}, R0;
  // -------------------------------------------------------------- the one shape: states on the beat
  // [t, W, H, R, X, Y, RX, RY, w]   (RY of the hook drifts by +5 deg on top, so later states hold -5 = 0)
  var S = [
    [0,             596, 1060, 70, 540, 790, 3, -12],
    [B(4) + 0.06,   860, 520,  46, 540, 880, 0, -5, 12],
    [B(10.4) + 0.04, 176, 176, 88, 540, 880, 0, -5, 16],
    [B(12),         920, 210, 105, 540, 880, 0, -5, 13],
    [B(16),         880, 900,  52, 540, 870, 0, -5, 12],
    [B(24.05),      880, 760,  52, 540, 880, 0, -5, 13],
    [B(28),         900, 900,  56, 540, 870, 0, -5, 13],
    [B(40),         900, 960,  56, 540, 860, 0, -5, 13],
    [B(44),         600, 180,  90, 540, 900, 0, -5, 14],
    [B(48),        1240, 2140,  0, 540, 960, 0, -5, 10],
    [B(60),         880, 230, 115, 540, 900, 0, -5, 12],
    [B(68),         380, 150,  75, 540, 860, 0, -5, 14],
  ];
  function col(i) { return S.map(function (s) { return [s[0], s[i], s[8] || 13, 0.8]; }); }
  var sW = K(col(1)), sH = K(col(2)), sR = K(col(3)), sX = K(col(4)), sY = K(col(5)), sRX = K(col(6)), sRY = K(col(7));
  var sZ = K([[0, 0], [B(19.9), -170, 7, 0.9], [B(24.05), 0, 9, 0.9], [B(47.55), -34, 18, 0.9], [B(48), 40, 10, 0.85], [B(60), 0, 10, 0.9], [B(68), -60, 12, 0.9]]);
  var sFace = CE([[0, INK], [B(4) + 0.22, "#eef7ff"], [B(10.4) + 0.05, INK], [B(16) + 0.02, "#ffffff"], [B(44), INK], [B(64.75) + 0.04, "#ffffff"]], 0.2);
  var sLight = E([[0, 0], [B(4) + 0.22, 1], [B(10.4) + 0.05, 0], [B(16) + 0.02, 1], [B(44), 0], [B(64.75) + 0.04, 1]], 0.2);
  var sDim = E([[0, 0], [B(19.9), 0.62, 0.3], [B(24.05), 0, 0.25]], 0.3);
  var sOpa = E([[0, 1], [B(68) + 0.05, 0, 0.2]], 0.2);
  var PRESS = [[B(4), 0.035], [B(45), 0.05]];
  // camera
  var cZ = K([[0, 1], [B(19.8), 0.92, 5, 0.9], [B(22.6), 0.97, 5, 0.9], [B(24.1), 1.0, 6, 0.9]]);
  var cRY = K([[0, 0], [B(20), -17, 4.5, 0.85], [B(22.5), 8, 4, 0.85], [B(23.6), 0, 6, 0.9]]);
  var cRX = K([[0, 0], [B(20), 5, 5, 0.9], [B(23.6), 0, 6, 0.9]]);
  // cursor (world coordinates of its tip)
  var CUR = [[0, 1170, 1560], [B(2.9), 690, 1050], [B(4.55), 1190, 1420], [B(7.3), 1270, 1180], [B(8.1), 860, 1010], [B(9.3), 600, 905],
             [B(10.85), 1220, 1160], [B(16.9), 600, 760], [B(18.4), 1230, 1120], [B(35.5), 600, 1262], [B(37.4), 1230, 1300],
             [B(40.1), 478, 1162], [B(41.75), 1230, 1250], [B(44.1), 620, 925], [B(45.9), 1240, 1250]];
  var cuX = K(CUR.map(function (k) { return [k[0], k[1], 9.5, 0.93]; })), cuY = K(CUR.map(function (k) { return [k[0], k[2], 9.5, 0.93]; }));
  var CLICKS = [B(4), B(10.4), B(17.75), B(36.5), B(41), B(45)];
  // titles: [id, in, out]
  var TITLES = [["ti1", B(10.25), B(15.85)], ["ti2", B(16), B(23.85)], ["ti3", B(24.05), B(27.85)], ["ti4", B(28), B(35.85)], ["ti5", B(36), B(39.85)], ["ti6", B(40), B(43.85)], ["ti7", B(44), B(47.6)]];
  // the sync tiles
  function tileTracks(k) {
    var tr = B(20) + 0.06 * k, tw = B(22.5) + 0.05 * k, te = B(24.05) + 0.03 * k;
    var x0 = 540, y0 = 906 + 130 * k;
    return {
      x: K([[0, x0], [tr, 540 + (k - 1) * 215, 8, 0.82], [tw, 540 + (k - 1) * 306, 9, 0.8], [te, 540, 11, 0.9]]),
      y: K([[0, y0], [tr, 850 - (k - 1) * 26, 8, 0.82], [tw, 868, 9, 0.8], [te, 880, 11, 0.9]]),
      z: K([[0, 0], [tr, 190 - k * 250, 7, 0.82], [tw, 150, 8, 0.8], [te, -80, 11, 0.9]]),
      ry: K([[0, 0], [tr, -20, 7, 0.8], [tw, 0, 8, 0.85]]),
      s: K([[0, 0.3], [tr, 1, 9, 0.75], [te, 0.22, 12, 0.9]]),
      tr: tr, tw: tw, te: te
    };
  }
  var TL = [tileTracks(0), tileTracks(1), tileTracks(2)];
  // the edit
  var NEW = [1, 3, 2, 1, 2, 3, 2, 1, 3, 2, 1, 3, 1, 2, 3, 1, 3, 2, 1, 2, 3];
  var TCOL = { 1: "#d6336c", 2: "#3a6fe0", 3: "#e0952c" };
  var ringL = K([[0, 133, 9, 0.8], [B(41), 293, 8.5, 0.78]]), ringR = K([[0, 287, 9, 0.8], [B(41), 447, 15, 0.72]]);
  // logo
  var lgS = K([[0, 0.38], [B(68) + 0.04, 1, 8.5, 0.72]]), lgRY = K([[0, 78], [B(68) + 0.04, 0, 6.5, 0.74]]), lgRX = K([[0, 22], [B(68) + 0.04, 0, 7, 0.8]]), lgZ = K([[0, -260], [B(68) + 0.04, 0, 7.5, 0.82]]);

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

  // icicles under a button (bottom edge), grown by g in [0,1]
  function iciclesPath(w, r, g, seed, stepPx) {
    var d = "", half = w / 2 - r * 0.72 - 8, step = stepPx || 36;
    if (g <= 0.01 || half <= 0) return "";
    for (var i = -30; i <= 30; i++) {
      var x = i * step + (seed % 2) * step * 0.5;
      if (Math.abs(x) > half) continue;
      var h = hash(i * 7.3 + seed), L = (14 + 30 * h + (Math.abs(i) % 5 === 2 ? 18 : 0)) * g, ww = 15 + 6 * hash(i + 3.1 + seed);
      d += "M" + (x - ww / 2).toFixed(1) + " 0 Q" + (x - ww / 4).toFixed(1) + " " + (L * 0.62).toFixed(1) + " " + x.toFixed(1) + " " + L.toFixed(1) + " Q" + (x + ww / 4).toFixed(1) + " " + (L * 0.62).toFixed(1) + " " + (x + ww / 2).toFixed(1) + " 0 Z ";
    }
    return d;
  }
  // the fringe of icicles along the top of a card (the app's card style)
  function fringePath(w, r, g) {
    if (g <= 0.01) return "";
    var x = -(w / 2 - r * 0.9), end = w / 2 - r * 0.9, d = "M" + x.toFixed(1) + " 0 ", i = 0;
    while (x < end - 6) {
      var ww = 24 + 10 * hash(i * 3.7), h = (16 + 22 * hash(i * 5.1 + 2)) * g, nx = Math.min(end, x + ww);
      d += "L" + ((x + nx) / 2).toFixed(1) + " " + h.toFixed(1) + " L" + nx.toFixed(1) + " 0 ";
      x = nx; i++;
    }
    return d + "Z";
  }

  function init(root) {
    R0 = root;
    ["snow", "world", "fshadow", "shape", "face", "sheen", "rim", "icb", "fringe", "c-hook", "c-zone", "c-load", "c-song", "c-takes", "c-lyr", "c-edit", "c-filt", "c-exp", "c-pay", "c-claim",
     "h-freeze", "h-cap", "h-wm", "z-hover", "z-dash", "l-spin", "l-check", "l-ck", "s-bars", "t-imp", "t-r1", "t-r2", "t-r3", "l-hint", "l-1", "l-2", "l-caret",
     "e-pv", "e-ver1", "e-ver2", "e-ruler", "e-bar", "e-ph", "e-knob", "e-shuf", "e-shufice", "f-ring", "f-pv", "x-fill", "p-cap", "p-wm", "k-num", "k-sub1", "k-sub2",
     "tile1", "tile2", "tile3", "st1", "st2", "st3", "chip", "logo", "tag1", "tag2", "cursor"].forEach(function (id) { $[id] = root.querySelector("#" + id); });
    ctx = $.snow.getContext("2d"); initSnow();
    $.fvids = root.querySelectorAll("#f-pv video");
    // extrusion of the shape: rounded ink layers behind the face
    $.layers = [];
    for (var k = 16; k >= 1; k--) {
      var L = document.createElement("div"); L.className = "ly";
      var c = Math.round(mix(28, 6, k / 16)), cc = "rgb(" + c + "," + (c + 3) + "," + (c + 9) + ")";
      L.style.background = cc; L.dataset.z = String(-k * 1.65);
      $.shape.insertBefore(L, $.shape.firstChild); $.layers.push(L);
    }
    $.dim = document.createElement("div"); $.dim.className = "abs"; $.dim.style.cssText = "inset:0;background:#1f6fd6;opacity:0;z-index:28;pointer-events:none"; $.face.appendChild($.dim);
    // tiles: thickness
    [$.tile1, $.tile2, $.tile3].forEach(function (tile) {
      tile.layers = [];
      for (var k = 8; k >= 1; k--) { var L = document.createElement("div"); L.className = "ly"; L.style.borderRadius = "40px"; var c = Math.round(mix(26, 8, k / 8)); L.style.background = "rgb(" + c + "," + (c + 3) + "," + (c + 9) + ")"; L.style.transform = "translateZ(" + (-k * 3) + "px)"; tile.insertBefore(L, tile.firstChild); tile.layers.push(L); }
      tile.ok = tile.querySelector(".ok"); tile.vids = tile.querySelectorAll("video");
    });
    // the song pill's bars
    $.bars = [];
    for (var i = 0; i < 26; i++) { var b = document.createElement("i"); b.style.cssText = "position:absolute;bottom:0;width:7px;border-radius:4px;left:" + (i * 11.6).toFixed(1) + "px"; $["s-bars"].appendChild(b); $.bars.push(b); }
    // the edit: 21 real shots
    $.blocks = []; var IW = 788, TOTE = T.CUTS[21];
    for (i = 0; i < 21; i++) {
      var bk = document.createElement("div"); bk.className = "bk";
      var l = T.CUTS[i] / TOTE * IW, w = (T.CUTS[i + 1] - T.CUTS[i]) / TOTE * IW;
      bk.style.left = px(l); bk.style.width = px(w + 0.6); bk.style.fontSize = (w > 30 ? 30 : 22) + "px";
      bk.dataset.w = String(w);
      $["e-bar"].appendChild(bk); $.blocks.push(bk);
    }
    var ruler = $["e-ruler"], dbt = -0.0837;
    for (var kk = 0; kk * P <= TOTE; kk++) {
      var tx = kk * P, down = Math.abs(((tx - dbt) / (4 * P)) - Math.round((tx - dbt) / (4 * P))) < 0.02;
      var tk = document.createElement("i");
      tk.style.cssText = "position:absolute;bottom:0;border-radius:2px;background:#0a0d14;left:" + px(4 + tx / TOTE * IW) + ";width:" + (down ? 3 : 2) + "px;height:" + (down ? 22 : 11) + "px;opacity:" + (down ? 0.85 : 0.45);
      ruler.appendChild(tk);
    }
    $["e-shufice"].innerHTML = '<g transform="translate(165,0)"><path d="' + iciclesPath(330, 48, 1, 3, 30) + '" fill="#d6ecff" stroke="#0a0d14" stroke-width="4" stroke-linejoin="round"/></g>';
    // the logo: the official wordmark, extruded in ink
    for (k = 22; k >= 0; k--) {
      var im = document.createElement("img"); im.src = "assets/brand/wordmark.svg"; im.alt = "";
      im.style.transform = "translateZ(" + (-k * 1.7).toFixed(1) + "px)";
      if (k > 0) im.style.filter = "brightness(0)";
      $.logo.appendChild(im);
    }
    // titles: one span per word
    $.titles = TITLES.map(function (tt) {
      var el = root.querySelector("#" + tt[0]), words = el.textContent.split(" ");
      el.innerHTML = words.map(function (w) { return "<span>" + w + "</span>"; }).join(" ");
      return { el: el, spans: el.querySelectorAll("span"), a: tt[1], b: tt[2] };
    });
    $.tag1w = $.tag1.querySelectorAll("span");
  }

  function render(t) {
    if (!R0) return;
    if (t < 0) t = 0; if (t > TOTAL) t = TOTAL;
    var f = Math.max(0, Math.min(T.low.length - 1, Math.round(t * 30)));
    // ----------------------------------------------------------- camera
    var punch = 0;
    var bNow = Math.floor(t / P);
    for (var bb = Math.max(0, bNow - 3); bb <= bNow; bb++) {
      var dt = t - B(bb); if (dt < 0) continue;
      var amp = bb >= 48 && bb < 60 ? (bb % 4 === 0 ? 0.03 : 0.01) : bb >= 4 && bb < 48 ? (bb % 4 === 0 ? 0.014 : 0.007) : (bb % 4 === 0 ? 0.008 : 0.004);
      punch += amp * Math.exp(-dt / 0.12);
    }
    var pay = win(t, B(48) + 0.05, B(60), 0.35, 0.3);
    var cz = cZ(t) * (1 + punch) * (1 + 0.05 * eIO((t - B(48.2)) / B(11.6)) * (t < B(60.4) ? 1 : 0));
    var sway = 1 - pay;
    var cry = cRY(t) + 1.0 * Math.sin(6.2832 * t / 11) * sway, crx = cRX(t) + 0.6 * Math.sin(6.2832 * t / 13 + 1) * sway;
    $.world.style.transform = "translate3d(540px,960px,0) scale(" + cz.toFixed(4) + ") rotateX(" + crx.toFixed(3) + "deg) rotateY(" + cry.toFixed(3) + "deg) translate3d(-540px,-960px,0)";
    drawSnow(t, cry, pay);

    // ----------------------------------------------------------- the shape
    var W = sW(t), H = sH(t), R = Math.max(0, sR(t)), X = sX(t), Y = sY(t);
    var RX = sRX(t), RY = sRY(t) + 5 * eIO(t / B(4)), Z = sZ(t);
    var sc = 1;
    for (var p = 0; p < PRESS.length; p++) sc -= PRESS[p][1] * bump((t - PRESS[p][0]) / 0.24);
    sc -= 0.05 * bump((t - B(47.5)) / (B(48) - B(47.5)) * 0.5);
    var hookTilt = t < B(4) ? 1 : 0;
    $.shape.style.width = px(W); $.shape.style.height = px(H);
    $.shape.style.transform = "translate3d(" + px(X - W / 2) + "," + px(Y - H / 2) + "," + px(Z) + ") rotateX(" + RX.toFixed(3) + "deg) rotateY(" + RY.toFixed(3) + "deg) scale(" + sc.toFixed(4) + ")";
    var op = sOpa(t);
    $.shape.style.opacity = op.toFixed(3);
    $.shape.style.visibility = op < 0.002 ? "hidden" : "visible";
    var rr = px(R);
    $.face.style.borderRadius = rr; $.face.style.background = sFace(t);
    $.face.style.borderColor = INK;
    for (var li = 0; li < $.layers.length; li++) { var Ly = $.layers[li]; Ly.style.borderRadius = rr; Ly.style.transform = "translateZ(" + Ly.dataset.z + "px)"; }
    var light = sLight(t);
    $.sheen.style.opacity = ((1 - light) * (1 - pay)).toFixed(3);
    $.sheen.style.backgroundPosition = (50 + RY * 3 + (X - 540) * 0.05 + 8 * Math.sin(t * 0.7)).toFixed(1) + "% 0";
    $.rim.style.opacity = (1 - pay).toFixed(3);
    $.dim.style.opacity = sDim(t).toFixed(3);
    // floor shadow
    var shO = (1 - pay) * op * (1 - win(t, B(19.9), B(24), 0.3, 0.3) * 0.6);
    $.fshadow.style.width = px(W * 0.92); $.fshadow.style.height = px(Math.max(60, H * 0.08));
    $.fshadow.style.transform = "translate3d(" + px(X - W * 0.46) + "," + px(Y + H / 2 + 30) + "," + px(Z - 40) + ")";
    $.fshadow.style.opacity = shO.toFixed(3);
    // icicles under the buttons, fringe on the cards
    var gB = Math.max(win(t, B(12) + 0.35, B(16) - 0.05, 0.5, 0.1), win(t, B(44) + 0.3, B(47.5), 0.5, 0.1), win(t, B(60) + 0.35, B(64.6), 0.5, 0.1));
    $.icb.setAttribute("width", W.toFixed(0)); $.icb.setAttribute("height", "80");
    $.icb.style.transform = "translate3d(0," + px(H - 5) + ",0.5px)";
    $.icb.innerHTML = gB > 0.01 ? '<g transform="translate(' + (W / 2).toFixed(1) + ',0)"><path d="' + iciclesPath(W, R, eOut(gB), 0) + '" fill="#d6ecff" stroke="#0a0d14" stroke-width="4" stroke-linejoin="round"/></g>' : "";
    var gF = Math.max(win(t, B(16) + 0.28, B(24), 0.45, 0.1), win(t, B(24.05) + 0.3, B(28), 0.45, 0.1), win(t, B(28) + 0.3, B(40), 0.45, 0.1), win(t, B(40) + 0.3, B(44), 0.45, 0.1));
    $.fringe.setAttribute("width", (W - 12).toFixed(0)); $.fringe.setAttribute("height", "60");
    $.fringe.innerHTML = gF > 0.01 ? '<g transform="translate(' + ((W - 12) / 2).toFixed(1) + ',-2)"><path d="' + fringePath(W - 12, R, eOut(gF)) + '" fill="#ffffff" stroke="#0a0d14" stroke-width="4" stroke-linejoin="round"/></g>' : "";

    // ----------------------------------------------------------- contents
    // m0 hook
    show($["c-hook"], t < B(4) ? 1 : 1 - eIn((t - B(4) - 0.1) / 0.16), 12);
    show($["h-freeze"], t >= B(4) - 0.02 ? 1 : 0, 0);
    show($["h-cap"], win(t, T.hookCap[0], B(3.95), 0.1, 0.08), 6);
    show($["h-wm"], t < B(4.3) ? 1 : 0, 0);
    // m1 zone
    show($["c-zone"], win(t, B(4) + 0.24, B(10.4) + 0.02, 0.18, 0.1), 10, "translate(-50%,-50%)");
    var hov = win(t, B(9.55), B(10.4), 0.12, 0.1);
    $["z-hover"].style.opacity = (hov * 0.9).toFixed(3);
    // m2 loader
    show($["c-load"], win(t, B(10.4) + 0.12, B(12) + 0.02, 0.14, 0.1), 8, "translate(-50%,-50%)");
    $["l-spin"].style.opacity = (1 - sat((t - B(11.3)) / 0.1)).toFixed(3);
    $["l-spin"].style.transform = "rotate(" + ((t - B(10.4)) * 450).toFixed(1) + "deg)";
    $["l-ck"].setAttribute("stroke-dashoffset", (1.1 - 1.1 * eOut((t - B(11.35)) / 0.22)).toFixed(3));
    // m3 song
    show($["c-song"], win(t, B(12) + 0.16, B(16) + 0.02, 0.16, 0.1), 10, "translate(-50%,-50%)");
    if (t > B(11.8) && t < B(16.4)) {
      var lo = T.low[f] || 0, mi = T.mid[f] || 0, played = sat((t - B(12)) / (B(16) - B(12))) * 26;
      for (var bi = 0; bi < 26; bi++) {
        var wgt = 0.35 + 0.65 * hash(bi * 2.3), lv = sat(0.18 + 0.82 * (lo * wgt + mi * (1 - wgt)) * (0.72 + 0.28 * Math.sin(bi * 1.7 + t * 8.5)));
        $.bars[bi].style.height = px(14 + 102 * lv);
        $.bars[bi].style.background = bi < played ? "#5b9cf6" : "rgba(255,255,255,0.92)";
      }
    }
    // m4 takes
    var vTakes = win(t, B(16) + 0.18, B(24.05) + 0.02, 0.16, 0.1);
    show($["c-takes"], vTakes, 10, "translate(-50%,-50%)");
    var pressImp = 1 - 0.04 * bump((t - B(17.75)) / 0.22);
    $["t-imp"].style.transform = "scale(" + pressImp.toFixed(4) + ")";
    ["t-r1", "t-r2", "t-r3"].forEach(function (id, k) {
      var ta = B(18.25) + B(0.5) * k, e = spr(t - ta, 13, 0.72), o = sat((t - ta) / 0.1) * (1 - sat((t - B(20) - 0.04 * k) / 0.12));
      $[id].style.opacity = o.toFixed(3);
      $[id].style.transform = "translateX(" + px(70 * (1 - e)) + ") scale(" + (1.04 - 0.04 * e).toFixed(4) + ")";
    });
    // m5 the three takes in depth, then in sync
    [$.tile1, $.tile2, $.tile3].forEach(function (tile, k) {
      var tr = TL[k], vis = win(t, tr.tr, tr.te + 0.05, 0.14, 0.22);
      if (vis <= 0.002) { tile.style.visibility = "hidden"; tile.style.opacity = "0"; return; }
      var wob = t < tr.tw ? sat((t - tr.tr) / 0.4) * (1 - sat((t - tr.tw + 0.3) / 0.3)) : 0;
      var x = tr.x(t), y = tr.y(t) + 7 * Math.sin(6.2832 * (t * 1.9 + k * 0.37)) * wob, z = tr.z(t), ry = tr.ry(t) + 3.5 * Math.sin(6.2832 * (t * 1.3 + k * 0.5)) * wob;
      var s = tr.s(t) * (1 + 0.06 * bump((t - B(23.5) - 0.03 * k) / 0.26));
      tile.style.visibility = "visible"; tile.style.opacity = vis.toFixed(3);
      tile.style.transform = "translate3d(" + px(x - 145) + "," + px(y - 258) + "," + px(z) + ") rotateY(" + ry.toFixed(2) + "deg) scale(" + s.toFixed(4) + ")";
      var okv = sat((t - B(23.5) - 0.05 * k) / 0.12), oks = 0.6 + 0.4 * spr(t - B(23.5) - 0.05 * k, 16, 0.6);
      tile.ok.style.opacity = okv.toFixed(3); tile.ok.style.transform = "scale(" + oks.toFixed(3) + ")";
    });
    // status lines
    show($.st1, win(t, B(10.55), B(11.9), 0.14, 0.12), 8, "translateY(" + px(880 + 88 + 54) + ")");
    show($.st2, win(t, B(13.6), B(15.9), 0.16, 0.12), 8, "translateY(" + px(880 + 105 + 70) + ")");
    show($.st3, win(t, B(23.5) + 0.04, B(24.4), 0.14, 0.14), 8, "translateY(" + px(1172) + ")");
    // the file, carried by the cursor, dropped into the zone
    var cx = cuX(t), cy = cuY(t);
    var chipV = win(t, B(7.3), B(10.4), 0.01, 0.16);
    if (chipV > 0) {
      var cd = sat((t - B(10.4)) / 0.16), chs = 1 - 0.7 * eIn(cd);
      $.chip.style.visibility = "visible"; $.chip.style.opacity = chipV.toFixed(3);
      $.chip.style.transform = "translate3d(" + px(mix(cx - 300, 540 - 150, eIn(cd))) + "," + px(mix(cy - 54, 880 - 42, eIn(cd))) + ",30px) scale(" + chs.toFixed(3) + ") rotate(" + (-4 * (1 - cd)).toFixed(2) + "deg)";
    } else { $.chip.style.visibility = "hidden"; }
    // m6 lyrics
    show($["c-lyr"], win(t, B(24.05) + 0.2, B(28) + 0.02, 0.16, 0.1), 10, "translate(-50%,-50%)");
    var L1 = "After all this time, baby", L2 = "I gotta bounce";
    var ty1 = Math.floor(sat((t - B(24.7)) / 1.25) * L1.length), ty2 = Math.floor(sat((t - B(26.55)) / 0.75) * L2.length);
    $["l-1"].textContent = L1.slice(0, ty1); $["l-2"].textContent = L2.slice(0, ty2);
    $["l-hint"].style.opacity = (1 - sat((t - B(24.6)) / 0.12)).toFixed(3);
    var onLine2 = t >= B(26.55);
    var caretX = 34 + (onLine2 ? $["l-2"].offsetWidth : $["l-1"].offsetWidth) + 4;
    $["l-caret"].style.left = px(caretX); $["l-caret"].style.top = px(onLine2 ? 168 : 102);
    $["l-caret"].style.opacity = (t > B(24.6) && t < B(27.9) ? 1 : 0).toString();
    // m7-m9 edit
    show($["c-edit"], win(t, B(28) + 0.2, B(40) + 0.02, 0.16, 0.1), 10, "translate(-50%,-50%)");
    if (t > B(27.8) && t < B(40.3)) {
      for (var ki = 0; ki < 21; ki++) {
        var bk = $.blocks[ki], tl = B(28) + 0.2 + (ki / 20) * B(6.5), e2 = spr(t - tl, 14, 0.7);
        var ts = B(36.6) + 0.018 * ki, sw = t > ts + 0.09;
        var tk = sw ? NEW[ki] : T.TAKES[ki];
        var hop = 26 * bump((t - ts) / 0.34);
        bk.style.background = TCOL[tk];
        bk.textContent = (+bk.dataset.w > 18) ? String(tk) : "";
        bk.style.opacity = sat((t - tl) / 0.08).toFixed(3);
        bk.style.transform = "translateY(" + px(-52 * (1 - e2) - hop) + ") scale(" + (1.25 - 0.25 * e2).toFixed(4) + ")";
      }
      var take = t + T.prevOff, phx = 52 + 4 + take / T.CUTS[21] * 788;
      $["e-ph"].style.left = px(phx - 3); $["e-knob"].style.left = px(phx - 15);
      var v2 = eOut((t - B(38)) / 0.22);
      $["e-ver1"].style.transform = "translateY(" + px(-50 * v2) + ")"; $["e-ver2"].style.transform = "translateY(" + px(-50 * v2) + ")";
      var shV = sat((t - B(35.4)) / 0.12), shS = 0.7 + 0.3 * spr(t - B(35.4), 14, 0.7);
      var shP = 1 - 0.07 * bump((t - B(36.5)) / 0.22);
      $["e-shuf"].style.opacity = shV.toFixed(3); $["e-shuf"].style.transform = "scale(" + (shS * shP).toFixed(4) + ")";
      $["e-shufice"].style.opacity = shV.toFixed(3); $["e-shufice"].style.transform = "scaleY(" + eOut((t - B(35.6)) / 0.4).toFixed(3) + ")";
      $["e-shufice"].style.transformOrigin = "50% 0";
    }
    // m10 filter
    show($["c-filt"], win(t, B(40) + 0.2, B(44) + 0.02, 0.16, 0.1), 10, "translate(-50%,-50%)");
    if (t > B(39.8) && t < B(44.3)) {
      var rl = ringL(t), rR = ringR(t);
      $["f-ring"].style.left = px(rl); $["f-ring"].style.width = px(Math.max(40, rR - rl));
      var gi = eIO((t - B(41.25)) / 0.3).toFixed(3);
      for (var vi = 0; vi < $.fvids.length; vi++) $.fvids[vi].style.setProperty("--hf-color-grading-intensity", gi);
    }
    // m11 export
    show($["c-exp"], win(t, B(44) + 0.16, B(48) + 0.06, 0.14, 0.08), 10, "translate(-50%,-50%)");
    $["x-fill"].style.width = px(600 * eIO((t - B(45.1)) / (B(47.85) - B(45.1))));
    // m12-m14 payoff
    show($["c-pay"], win(t, B(48) + 0.01, B(60) + 0.22, 0.08, 0.2), 14, "translate(-50%,-50%)");
    show($["p-cap"], win(t, T.payCap[0], T.payCap[1], 0.1, 0.12), 6);
    // m15-m16 the time
    show($["c-claim"], win(t, B(60) + 0.2, B(68) + 0.04, 0.16, 0.1), 10, "translate(-50%,-50%)");
    if (t > B(59.9) && t < B(68.3)) {
      var c0 = B(64.75) - 0.1, cnt = sat((t - c0) / 0.42), seq = [40, 37, 33, 28, 22, 16, 11, 7, 4, 3];
      var n = cnt <= 0 ? 40 : seq[Math.min(seq.length - 1, Math.floor(cnt * (seq.length - 1) + 0.0001))];
      $["k-num"].textContent = n + " min";
      $["k-num"].style.color = t >= B(64.75) ? "#1f6fd6" : "#ffffff";
      $["k-num"].style.filter = cnt > 0 && cnt < 1 ? "blur(2px)" : "none";
      $["k-num"].style.transform = "scale(" + (1 + 0.08 * bump((t - B(64.75)) / 0.3)).toFixed(4) + ")";
      show($["k-sub1"], 1 - sat((t - B(64.75) + 0.05) / 0.12), 8);
      show($["k-sub2"], sat((t - B(64.75) - 0.06) / 0.16), 8);
    }
    // ----------------------------------------------------------- the end: the logo, the offer, the address
    var lgV = sat((t - B(68) - 0.02) / 0.16);
    if (lgV > 0) {
      var since = t - B(70), drift = sat(since / 1.2);
      var ry = lgRY(t) + 3.5 * Math.sin(6.2832 * since / 6) * drift, rx = lgRX(t) + 1.6 * Math.sin(6.2832 * since / 7 + 1) * drift;
      $.logo.style.visibility = "visible"; $.logo.style.opacity = lgV.toFixed(3);
      $.logo.style.transform = "translate3d(" + px(540 - 390) + "," + px(820 - 172) + "," + px(lgZ(t)) + ") rotateX(" + rx.toFixed(3) + "deg) rotateY(" + ry.toFixed(3) + "deg) scale(" + lgS(t).toFixed(4) + ")";
    } else { $.logo.style.visibility = "hidden"; }
    for (var wi = 0; wi < $.tag1w.length; wi++) { var kw = sat((t - B(69) - 0.06 * wi) / 0.16); $.tag1w[wi].style.opacity = kw.toFixed(3); $.tag1w[wi].style.filter = kw < 1 ? "blur(" + ((1 - kw) * 8).toFixed(1) + "px)" : "none"; }
    $.tag1.style.visibility = t > B(68.9) ? "visible" : "hidden";
    var url = "stalak.app", nt = Math.floor(sat((t - B(72.5)) / 0.62) * url.length + 0.0001);
    $.tag2.textContent = url.slice(0, nt);
    // ----------------------------------------------------------- titles (screen space, never move once landed)
    for (var ti = 0; ti < $.titles.length; ti++) {
      var TI = $.titles[ti];
      if (t < TI.a - 0.01 || t > TI.b + 0.16) { TI.el.style.visibility = "hidden"; continue; }
      TI.el.style.visibility = "visible";
      var out = eIn((t - TI.b) / 0.14);
      TI.el.style.opacity = (1 - out).toFixed(3);
      TI.el.style.filter = out > 0 ? "blur(" + (out * 9).toFixed(1) + "px)" : "none";
      for (var si = 0; si < TI.spans.length; si++) {
        var kx = eOut5((t - TI.a - 0.075 * si) / 0.2), sp = TI.spans[si];
        sp.style.opacity = sat((t - TI.a - 0.075 * si) / 0.12).toFixed(3);
        sp.style.filter = kx < 1 ? "blur(" + ((1 - kx) * 8).toFixed(1) + "px)" : "none";
        sp.style.transform = ti % 2 === 0 ? "scale(" + (1.12 - 0.12 * kx).toFixed(4) + ")" : "translateY(" + px(-26 * (1 - kx)) + ")";
      }
    }
    // ----------------------------------------------------------- cursor
    var press = 0;
    for (var ci = 0; ci < CLICKS.length; ci++) press = Math.max(press, bump((t - CLICKS[ci] + 0.06) / 0.2));
    var curVis = t > B(2.2) && t < B(46.6);
    $.cursor.style.visibility = curVis ? "visible" : "hidden";
    $.cursor.style.transform = "translate3d(" + px(cx - 6) + "," + px(cy - 4) + ",60px) scale(" + (1 - 0.16 * press).toFixed(4) + ")";
  }

  window.ONE = { init: init, render: render, B: B };
})();
