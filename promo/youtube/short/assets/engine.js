/* « The edit nobody sees » — YouTube presentation film (16:9). Every style below is a pure function of t (seconds).
   Two worlds: a cutting mat seen in 3D (the edit done by hand: pieces, takes that never line up, a cut off the beat, lips out
   of sync, a new pile every day), then the floor opens on the drop into Stalak's sky, where the real app does each step.
   window.T comes from times.js (build.py). YT.init(root) builds the repeated parts, YT.render(t) draws a frame. */
(function () {
  "use strict";
  var T = window.T, P = T.P, TOTAL = T.TOTAL, S = T.S;
  var VW = T.W || 1920, VH = T.H || 1080, CX = VW / 2, CY = VH / 2, PORT = VH > VW;
  var DB = T.DB || 0;                                       // the film beat that is a downbeat (mod 4)
  // the dive into one frame of the film: where that frame ends up on screen (landscape: left of centre, beside the tracks; portrait: centred, under the captions)
  var DIVE = PORT ? { ox: 0, oy: -5.33, dz: 1552 } : { ox: 66, oy: 0, dz: 1470 }, DK = 1800 / (1800 - DIVE.dz);
  function B(b) { return b * P; }
  function sat(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function mix(a, b, k) { return a + (b - a) * k; }
  function lin(x) { return sat(x); }
  function sio(x) { x = sat(x); return -(Math.cos(Math.PI * x) - 1) / 2; }
  function p2io(x) { x = sat(x); return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; }
  function p3o(x) { x = sat(x); return 1 - Math.pow(1 - x, 3); }
  function p2o(x) { x = sat(x); return 1 - (1 - x) * (1 - x); }
  function p2i(x) { x = sat(x); return x * x; }
  function p3i(x) { x = sat(x); return x * x * x; }
  function eio(x) { x = sat(x); return x === 0 ? 0 : x === 1 ? 1 : x < 0.5 ? Math.pow(2, 20 * x - 10) / 2 : (2 - Math.pow(2, -20 * x + 10)) / 2; }
  function bko(x) { x = sat(x); var c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); }
  function bump(x) { return x <= 0 || x >= 1 ? 0 : Math.sin(Math.PI * x); }
  function spr(t, w, z) {
    if (t <= 0) return 0;
    if (z >= 1) return 1 - Math.exp(-w * t) * (1 + w * t);
    var wd = w * Math.sqrt(1 - z * z);
    return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + (z * w / wd) * Math.sin(wd * t));
  }
  function rng(s) { return function () { s |= 0; s = s + 0x6D2B79F5 | 0; var t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function hash(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
  function px(n) { return n.toFixed(2) + "px"; }
  function vis(el, on) { el.style.visibility = on ? "visible" : "hidden"; }
  function op(el, a) { el.style.opacity = a.toFixed(3); vis(el, a > 0.002); }
  /* keyframes: [[t, value, ease of the segment that ends here], ...] */
  function trk(keys, t) {
    if (t <= keys[0][0]) return keys[0][1];
    for (var i = 1; i < keys.length; i++) {
      if (t < keys[i][0]) { var a = keys[i - 1], b = keys[i]; return a[1] + (b[1] - a[1]) * (b[2] || sio)((t - a[0]) / Math.max(1e-6, b[0] - a[0])); }
    }
    return keys[keys.length - 1][1];
  }
  var INK = "#0a0d14", BLUE = "#1f6fd6", RED = "#ff4d5e", TK = { 1: "#d6336c", 2: "#3a6fe0", 3: "#e0952c" };
  var $ = {}, R0;
  function el(tag, cls, css, parent, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (css) e.style.cssText = css; if (html) e.innerHTML = html; if (parent) parent.appendChild(e); return e; }
  function still(k, i) { return "assets/stills/t" + k + "_" + (i < 10 ? "0" : "") + i + ".jpg"; }

  // ======================================================================== the old world: geometry (mat px)
  var TAPE_X = 400, TAPE_Y = 990, PXS = 120;                 // the song tape: 120 px per second of the song
  var ST_Y = [1190, 1430, 1670], FX0 = 184, FP = 113, FW = 99, FH = 176, NF = 30;
  var FCU = 24, CU_X = 400 + FX0 + FCU * FP + FW / 2, CU_Y = ST_Y[2] + 16 + FH / 2;   // the frame the camera dives into
  var XM = 1000;                                             // shot 3: where the markers are
  var XC2 = 2050;                                            // shot 2: where the cutter cuts
  var SUCK = [2300, 1480];
  function tickX(k) { return TAPE_X + PXS * (T.songBar0 + k * P); }
  var K4 = 64;                                               // shot 4: index of the first tick that lights

  function buildMat() {
    // angle lines and numbers, like a real cutting mat
    var L = "";
    [[0, 2600, 2600, 0], [800, 2600, 3400, 0], [1700, 2600, 4300, 0], [0, 0, 2300, 2600]].forEach(function (l) {
      L += '<line x1="' + l[0] + '" y1="' + l[1] + '" x2="' + l[2] + '" y2="' + l[3] + '" stroke="rgba(160,215,190,0.35)" stroke-width="3"/>';
    });
    L += '<rect x="120" y="120" width="4160" height="2360" fill="none" stroke="rgba(217,239,229,0.5)" stroke-width="4"/>';
    $["mat-lines"].innerHTML = L;
    for (var i = 1; i < 17; i++) el("div", "mnum", "left:" + (i * 250 + 6) + "px;top:66px", $.mnums, String(i));
    for (var j = 1; j < 10; j++) el("div", "mnum", "left:58px;top:" + (j * 250 - 18) + "px", $.mnums, String(j));
    // the metal ruler
    var R = '<rect x="0" y="0" width="2300" height="120" rx="10" fill="#c9d1da"/><rect x="0" y="0" width="2300" height="22" rx="10" fill="#eef3f7"/><rect x="0" y="104" width="2300" height="16" rx="8" fill="#9aa6b3"/>';
    for (var r = 0; r <= 230; r++) {
      var h = r % 10 === 0 ? 46 : (r % 5 === 0 ? 32 : 20);
      R += '<rect x="' + (r * 10 + 8) + '" y="22" width="2.5" height="' + h + '" fill="#3c4652"/>';
      if (r % 10 === 0 && r < 230) R += '<text x="' + (r * 10 + 14) + '" y="92" font-family="Rubik" font-weight="600" font-size="24" fill="#3c4652">' + (r / 10) + "</text>";
    }
    $.ruler3.innerHTML = R;
    // the song tape: its real waveform, a tick per beat
    var wv = T.WAVES.tape, d = "";
    for (var k = 0; k < wv.length; k++) { var hh = 4 + 104 * Math.pow(wv[k], 1.2); d += '<rect x="' + (k * 6 + 1) + '" y="' + (70 - hh / 2).toFixed(1) + '" width="4" height="' + hh.toFixed(1) + '" rx="2" fill="#26303d"/>'; }
    $["tape-wave"].innerHTML = d;
    $.ticks = [];
    for (var b = 0; tickX(b) < TAPE_X + 3560; b++) {
      var tk = el("div", "tick" + (b % 4 === 0 ? " down" : ""), "left:" + px(tickX(b) - TAPE_X - 2) + ";", $["tape-ticks"]);
      $.ticks.push(tk);
    }
    // the three film strips: his real takes, frame after frame
    for (var s = 0; s < 3; s++) {
      var st = $["st" + s];
      el("div", "perf", "top:2px", st); el("div", "perf", "bottom:2px", st);
      el("div", "leader", "background:" + TK[s + 1], st);
      for (var f = 0; f < NF; f++) {
        var src = (s === 2 && f === FCU) ? "assets/stills/cu.jpg" : still(s + 1, (f * 3 + s * 5) % 14);
        el("img", "frm", "left:" + (FX0 + f * FP) + "px;width:" + FW + "px;height:" + FH + "px", st).src = src;
      }
      el("div", "lab", "left:20px;top:-46px;font-size:52px;transform:rotate(" + (s === 1 ? 3 : -3) + "deg)", st, "TAKE " + (s + 1));
    }
    // the cutter: yellow handle, a snap-off blade (tip on the left, at (0, 70))
    $.cutter.innerHTML = '<path d="M0 70 L120 40 L210 40 L210 100 L120 100 Z" fill="#dfe6ee" stroke="#5d6875" stroke-width="4" stroke-linejoin="round"/>' +
      '<path d="M40 60 L60 55 M80 52 L100 47 M120 46 L140 46 M160 46 L180 46" stroke="#8e9aa8" stroke-width="4"/>' +
      '<rect x="190" y="26" width="360" height="88" rx="30" fill="#f2c230" stroke="#3a2f0b" stroke-width="5"/>' +
      '<rect x="230" y="44" width="230" height="52" rx="18" fill="#2b2f36"/><path d="M262 50 V90 M292 50 V90 M322 50 V90 M352 50 V90 M382 50 V90 M412 50 V90" stroke="#4d5560" stroke-width="7" stroke-linecap="round"/>' +
      '<rect x="480" y="56" width="44" height="28" rx="10" fill="#d9a514"/>';
    // the pieces: the edit, cut up (shot 2), and every day's new pile (shot 6)
    var rr = rng(11);
    $.pieces = [];
    function piece(nf, k, i0) {
      var w = nf * FP + 6, p = el("div", "piece", "width:" + w + "px", $.piecesBox);
      el("div", "perf", "top:2px", p); el("div", "perf", "bottom:2px", p);
      for (var q = 0; q < nf; q++) el("img", "frm", "left:" + (6 + q * FP) + "px;width:" + FW + "px;height:" + FH + "px", p).src = still(k, (i0 + q * 2) % 14);
      return p;
    }
    $.pieces = [];
    for (var n = 0; n < 40; n++) {
      var nf = 1 + Math.floor(rr() * 3), k3 = 1 + (n % 3), lx, ly;
      do { lx = 1500 + rr() * 1500; ly = 700 + rr() * 1600; } while (ly > 940 && ly < 1460 && lx > 2700);
      $.pieces.push({ el: piece(nf, k3, n), w: nf * FP + 6,
        x0: XC2 - 60 + rr() * 120, y0: ST_Y[n % 3] + 100, z0: 0, r0: 0,
        x1: lx, y1: ly, r1: (rr() - 0.5) * 140,
        t0: S.slice + 0.04 + rr() * 0.14, d: 0.55 + rr() * 0.35, h: 260 + rr() * 380 });
    }
    // the days: a card, then a new pile around it
    var DAYS = PORT ? [["TUE", 1950, 800, -8, S.tue], ["WED", 2330, 1230, 6, S.wed], ["THU", 1850, 1630, -5, S.thu], ["FRI", 2280, 2010, 9, S.fri]]
                    : [["TUE", 1250, 1180, -8, S.tue], ["WED", 2700, 1000, 6, S.wed], ["THU", 3050, 1700, -5, S.thu], ["FRI", 1500, 1880, 9, S.fri]];
    $.days = DAYS.map(function (dd, i) {
      var c = el("div", "day", "", $.days0, "<b>" + dd[0] + "</b>");
      var pile = [];
      for (var m = 0; m < 12; m++) {
        var nf2 = 1 + Math.floor(rr() * 3), a2 = rr() * 6.283, rd2 = 230 + rr() * 330;
        pile.push({ el: piece(nf2, 1 + (m + i) % 3, m * 3 + i), w: nf2 * FP + 6, x1: dd[1] + 260 + Math.cos(a2) * rd2 * 1.2, y1: dd[2] + 165 + Math.sin(a2) * rd2 * 0.9,
          r1: (rr() - 0.5) * 160, t0: dd[4] + 0.34 + m * 0.035 + rr() * 0.05, h: 700 + rr() * 500 });
      }
      return { el: c, x: dd[1], y: dd[2], r: dd[3], t0: dd[4], pile: pile };
    });
  }

  // ======================================================================== the Stalak world
  var CAM2 = {};
  function buildBoard() {
    // 1. the song panel: the real waveform, the part's handles
    var wv = T.WAVES.pick, d = '<rect x="150" y="0" width="420" height="150" fill="#e3efff"/>';
    for (var k = 0; k < wv.length; k++) { var h = 6 + 120 * Math.pow(wv[k], 1.15); d += '<rect x="' + (k * 4 + 2) + '" y="' + (75 - h / 2).toFixed(1) + '" width="2.6" height="' + h.toFixed(1) + '" rx="1.3" fill="' + (k * 4 >= 150 && k * 4 < 570 ? BLUE : "#9db6d6") + '"/>'; }
    d += '<rect x="146" y="6" width="9" height="138" rx="4.5" fill="#0a0d14"/><rect x="566" y="6" width="9" height="138" rx="4.5" fill="#0a0d14"/><rect x="300" y="0" width="5" height="150" fill="' + RED + '"/>';
    $["s-wsvg"].innerHTML = d;
    var tw = T.WAVES.tape, d2 = "";
    for (var q = 0; q < 220; q++) { var v = tw[q * 2 + 60] || 0, h2 = 4 + 70 * Math.pow(v, 1.2); d2 += '<rect x="' + (q * 4 + 10) + '" y="' + (58 - h2 / 2).toFixed(1) + '" width="2.6" height="' + h2.toFixed(1) + '" rx="1.3" fill="#26303d"/>'; }
    $["s-tsvg"].innerHTML = d2;
    var d3 = "";
    for (var q3 = 0; q3 < 146; q3++) { var v3 = tw[q3 * 3 + 40] || 0, h3 = 4 + 52 * Math.pow(v3, 1.2); d3 += '<rect x="' + (q3 * 4 + 8) + '" y="' + (40 - h3 / 2).toFixed(1) + '" width="2.6" height="' + h3.toFixed(1) + '" rx="1.3" fill="#26303d"/>'; }
    $["pk-tsvg"].innerHTML = d3;
    // 2. the takes: thumbnails, then their sound lined up with the song's
    $.thumbs = [1, 2, 3].map(function (k, i) {
      var x = PORT ? 74 + i * 300 : 744 + i * 160;
      var th = el("div", "thumb", "left:" + x + "px;top:" + (PORT ? 456 : 150) + "px;width:" + (PORT ? 240 : 136) + "px;height:" + (PORT ? 427 : 242) + "px", $["t-thumbs"], '<img src="' + still(k, [9, 10, 6][i]) + '" alt="">');
      th.style.borderColor = INK; th.style.boxShadow = "0 0 0 5px " + TK[k];
      var nm = el("div", "tname", "left:" + (x + (PORT ? 52 : -2)) + "px;top:" + (PORT ? 896 : 408) + "px;font-size:" + (PORT ? 38 : 32) + "px", $["t-thumbs"], '<i style="background:' + TK[k] + '"></i>Take ' + k);
      return { th: th, nm: nm, t0: S.takesIn + 0.08 + 0.12 * i };
    });
    var pw = T.WAVES.part, rows = "";
    function wpath(y, amp, seed, col, off) {
      var s = '<g class="wr" data-off="' + off + '">';
      for (var k2 = 0; k2 < pw.length; k2++) {
        var v2 = pw[k2] * (seed ? 0.86 + 0.28 * hash(k2 * 3.7 + seed) : 1), hh = 4 + amp * Math.pow(v2, 1.15);
        s += '<rect x="' + (k2 * 3.8 + 30).toFixed(1) + '" y="' + (y - hh / 2).toFixed(1) + '" width="2.4" height="' + hh.toFixed(1) + '" rx="1.2" fill="' + col + '"/>';
      }
      return s + "</g>";
    }
    rows += '<rect x="0" y="6" width="1120" height="62" fill="#ffffff"/>' + wpath(37, 54, 0, INK, 0);
    rows += wpath(96, 40, 1, TK[1], 92) + wpath(148, 40, 2, TK[2], -64) + wpath(200, 40, 3, TK[3], 128);
    for (var b = 0; b <= 32; b++) rows += '<rect x="' + (30 + b * 280 * 3.8 / 32 - 1).toFixed(1) + '" y="' + (b % 4 ? 70 : 64) + '" width="2" height="' + (b % 4 ? 160 : 166) + '" fill="rgba(10,13,20,' + (b % 4 ? 0.08 : 0.18) + ')"/>';
    $["t-rows"].innerHTML = rows;
    $.wrows = Array.prototype.slice.call($["t-rows"].querySelectorAll(".wr")).slice(1).map(function (g, i) { return { g: g, off: [92, -64, 128][i] }; });
    // 3. the edit: a tick per beat over the 8 bars, the blocks
    for (var bb = 0; bb <= 32; bb++) el("i", "", "position:absolute;bottom:0;border-radius:2px;background:#0a0d14;left:" + px(bb / 32 * 940 + 5) + ";width:" + (bb % 4 ? 3 : 4) + "px;height:" + (bb % 4 ? 12 : 26) + "px;opacity:" + (bb % 4 ? 0.45 : 0.85), $.ruler);
    $.bks = [];
    for (var n = 0; n < 44; n++) { var bk = el("div", "bk", "visibility:hidden", $.bar); $.bks.push(bk); }
    $.knife = el("div", "", "position:absolute;top:-12px;width:8px;height:124px;border-radius:4px;background:" + RED + ";visibility:hidden", $.bar);
    // 3b. the lyrics: the first line is his, the others are left blank
    var LN = [["I gotta bounce", 0], [0, 520], [0, 400], [0, 600]];
    $.lns = LN.map(function (l, i) {
      var ln = el("div", "ln", "left:30px;top:" + (26 + i * 74) + "px", $["ly-box"]);
      var st = el("div", "st", "", ln, "");
      var tx = l[0] ? el("div", "tx", "", ln, "") : el("div", "sk", "width:" + l[1] + "px", ln);
      return { ln: ln, st: st, tx: tx, text: l[0] || "", w: l[1] };
    });
    // 5. the pack: 30 videos, each its own cut (the little bar under each)
    var rp = rng(31), picks = [];
    for (var k3 = 1; k3 <= 3; k3++) for (var i3 = 0; i3 < 14; i3++) picks.push([k3, i3]);
    for (var z = picks.length - 1; z > 0; z--) { var j = Math.floor(rp() * (z + 1)), tmp = picks[z]; picks[z] = picks[j]; picks[j] = tmp; }
    $.pks = [];
    for (var p = 0; p < 30; p++) {
      var u = "", acc = 0;
      while (acc < 100) { var wdt = Math.min(100 - acc, 8 + Math.floor(rp() * 22)); u += '<s style="width:' + wdt + '%;background:' + TK[1 + Math.floor(rp() * 3)] + '"></s>'; acc += wdt; }
      var pk = el("div", "pk", "", $["pk-grid"], '<img src="' + still(picks[p][0], picks[p][1]) + '" alt=""><u>' + u + "</u>");
      var col = p % 10, row = Math.floor(p / 10);
      $.pks.push({ el: pk, gx: 5628 + col * 136, gy: -260 + row * 229, t0: S.turns + 0.05 + p * 0.02, slot: p % 7, back: Math.floor(p / 7) });
    }
    // the week: MON … SUN
    $.dnames = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map(function (n, i) { return el("div", "dname", "left:" + (5673 + i * 184) + "px;top:-150px", $["pk-grid"], n); });
    // the camera's stations
    CAM2 = PORT ? { c1in: [0, -60], c1: [0, -60], c2: [1500, -80], c3: [3000, -100], bar: [3000, -100], pv: [3000, 0], pace: [3000, -400], expPhone: [4310, 0], exp: [4780, 0], packCtl: [6300, -410], pack: [6300, 0] }
                : { c1in: [0, 0], c1: [0, 0], c2: [1500, 10], c3: [3000, 0], bar: [3236, -10], pv: [2500, -27], pace: [3236, -70], expPhone: [4310, -30], exp: [4780, -20], packCtl: [6300, -410], pack: [6300, -90] };
  }

  // the payoff panels and the claim, sized once the fonts are there
  function fit() {
    if ($.fitted) return true;
    if (document.fonts && document.fonts.check && (!document.fonts.check('150px "Lilita One"') || !document.fonts.check('700 36px "Rubik"'))) return false;
    function segPos(seg) {
      return Array.prototype.slice.call(seg.querySelectorAll("b")).map(function (b) { return [b.offsetLeft, b.offsetWidth, b]; });
    }
    $.paceL = segPos($.pace); $.pkL = segPos($["pk-seg"]);
    $.barX = $.bar.offsetLeft;
    var cs = $["c-song"], dz = $["s-drop"];
    $.dropC = [cs.offsetLeft + 6 + dz.offsetLeft + dz.offsetWidth / 2, cs.offsetTop + 6 + dz.offsetTop + dz.offsetHeight / 2];
    $.cl1w = $["cl-t1"].offsetWidth; $.cl2w = $["cl-t2"].offsetWidth;
    $.fitted = true;
    return true;
  }

  function init(root) {
    R0 = root;
    ["w1", "cam", "mat", "mat-l", "mat-r", "objs", "mat-lines", "mnums", "ruler3", "tape", "tape-wave", "tape-ticks", "lab-song", "st0", "st1", "st2",
     "mk-tape", "mk-strip", "gap3", "tag3", "cut4", "gap4", "tag4", "cut2", "pieces", "days", "cutter", "w1-vig",
     "cu", "cu-panel", "cu-word", "cu-side", "cu-tracks", "cu-tag", "cu-tag2",
     "sky", "snow", "board", "c-song", "s-drop", "s-wave", "s-wsvg", "s-bpm", "s-next", "s-tape", "s-tsvg",
     "c-takes", "t-imp", "t-rec", "t-recdot", "t-thumbs", "t-rows", "t-ok",
     "c-edit", "pv", "pv-lyr", "pv-lock", "pv-shackle", "pace", "pace-on", "ruler", "bar", "ph", "e-exp",
     "c-lyr", "ly-paste", "ly-box", "ly-tapsync", "tapb",
     "x-phone", "x-pl", "x-tv", "x-pro", "x-tl", "c-pack", "pk-seg", "pk-on", "pk-btn", "pk-grid", "pk-ok", "pk-cp", "pk-tape", "pk-tsvg",
     "icon-land", "icon-ice", "icon-icp", "pay", "pd0", "pd1", "pd2", "pp0", "pp1", "pp2",
     "claim", "cl-cam", "cl-t1", "cl-icon", "cl-t2", "end", "end-icon", "end-wm", "end-url", "end-sub"].forEach(function (id) { $[id] = root.querySelector("#" + id); });
    $.ctx = $.snow.getContext("2d");
    $.days0 = $.days; $.piecesBox = $.pieces;
    $.desk = el("div", "", "position:absolute;inset:0;background:radial-gradient(90% 70% at 30% 20%, #2a2f36 0%, #171b21 55%, #0f1216 100%)", null);
    $.w1.insertBefore($.desk, $.cam);
    $.w1.style.background = "transparent";
    $.w1.style.perspectiveOrigin = CX + "px " + CY + "px";
    buildMat();
    buildBoard();
    // the close-up's side: the voice and the lips, as two tracks
    var tr = "", pw = T.WAVES.part;
    function trackPath(y, col, seed) {
      var s = "";
      for (var k = 0; k < 150; k++) { var v = pw[k + 40] * (seed ? 0.85 + 0.3 * hash(k * 5.1 + seed) : 1), h = 6 + 92 * Math.pow(v, 1.1); s += '<rect x="' + (k * 4.6 + 20).toFixed(1) + '" y="' + (y - h / 2).toFixed(1) + '" width="3" height="' + h.toFixed(1) + '" rx="1.5" fill="' + col + '"/>'; }
      return s;
    }
    tr += '<rect x="0" y="120" width="760" height="120" rx="14" fill="#f4f1e8"/><rect x="0" y="350" width="760" height="120" rx="14" fill="#f4f1e8"/>';
    tr += '<g id="trk-v">' + trackPath(180, "#26303d", 0) + '</g><g id="trk-l">' + trackPath(410, RED, 7) + "</g>";
    tr += '<rect id="trk-line" x="378" y="104" width="5" height="380" rx="2.5" fill="#ffd34d"/>';
    $["cu-tracks"].innerHTML = tr;
    $.trkL = $["cu-tracks"].querySelector("#trk-l"); $.trkLine = $["cu-tracks"].querySelector("#trk-line");
    // snow
    var rs = rng(5); $.fl = [];
    for (var i = 0; i < 90; i++) $.fl.push({ x: rs() * (VW + 180), y: rs() * (VH + 120), r: 1.2 + rs() * 2.4, v: 60 + rs() * 80, a: 0.45 + rs() * 0.45, amp: 8 + rs() * 20, w: 0.4 + rs() * 0.6, ph: rs() * 6.28, d: 0.4 + rs() * 0.8 });
    // captions (the Short): T.CAPS = [{line, from, to, end}]: the words of a voice line, shown as they are said
    if (T.CAPS && root.querySelector("#caps")) {
      $.caps2 = T.CAPS.map(function (c) {
        var d = el("div", "cap", "", root.querySelector("#caps")), ts = [], html = [];
        for (var k = c.from; k <= c.to; k++) { html.push('<span class="w">' + T.VW[c.line][k][0] + "</span>"); ts.push(T.VO[c.line][0] + T.VW[c.line][k][1]); }
        d.innerHTML = html.join(" ");
        return { el: d, spans: d.querySelectorAll(".w"), ts: ts, a: ts[0], b: c.end };
      });
    }
    // the payoff's lyric words
    $.pls = Array.prototype.slice.call(root.querySelectorAll(".pl")).map(function (e) { return e.querySelectorAll("span"); });
    $.pvw = []; ["I", "gotta", "bounce"].forEach(function (w) { $.pvw.push(el("span", "", "", $["pv-lyr"], w)); $["pv-lyr"].appendChild(document.createTextNode(" ")); });
  }

  // ------------------------------------------------------------------------ the old world's camera (mat point at the screen's centre; tilt; turn; dolly)
  function camW1(t) {
    var e = 0.001, s2 = S.s2, sl = S.slice, s3 = S.s3, s4 = S.s4, s5 = S.s5, c0 = S.cu0, s6 = S.s6, dr = S.drop;
    var KCX = [[0, 820], [s2, 1700, sio], [sl - 0.1, 1990, p2io], [sl + 0.75, 2150, p2io], [s3 - e, 2190, lin], [s3, XM + 10, lin], [s4 - e, XM + 60, lin],
               [s4, 3520, lin], [s5, 3560, lin], [c0, CU_X + DIVE.ox, eio], [s6 - e, CU_X + DIVE.ox, lin], [s6, SUCK[0], lin], [dr, SUCK[0], lin]];
    var KCY = [[0, 1250], [s2, 1330], [sl - 0.1, 1420, p2io], [sl + 0.75, 1500, p2io], [s3 - e, 1505, lin], [s3, 1170, lin], [s4 - e, 1175, lin],
               [s4, 1200, lin], [s5, 1210, lin], [c0, CU_Y + DIVE.oy, eio], [s6 - e, CU_Y + DIVE.oy, lin], [s6, SUCK[1], lin], [dr, SUCK[1], lin]];
    var KRX = [[0, 60], [s2, 56], [sl - 0.1, 52, p2io], [sl + 0.75, 40, p2io], [s3 - e, 40, lin], [s3, 61, lin], [s4 - e, 59, lin],
               [s4, 34, lin], [s5, 31, lin], [c0, 0, eio], [s6 - e, 0, lin], [s6, 20, lin], [S.s7, 14, lin], [dr, 8, p2i]];
    var KRZ = [[0, -16], [s2, -9], [sl - 0.1, -6, p2io], [sl + 0.75, 7, p2io], [s3 - e, 8, lin], [s3, -7, lin], [s4 - e, -3, lin],
               [s4, 5, lin], [s5, 6, lin], [c0, 0, eio], [s6 - e, 0, lin], [s6, 4, lin], [S.s7, 9, lin], [dr, 40, p2i], [dr + 0.5, 70, p2o]];
    var KDZ = [[0, 300], [s2, 140], [sl - 0.1, 110, p2io], [sl + 0.75, -520, p2io], [s3 - e, -560, lin], [s3, 520, lin], [s4 - e, 560, lin],
               [s4, 520, lin], [s5, 560, lin], [c0, DIVE.dz, eio], [s6 - e, DIVE.dz, lin], [s6, PORT ? -700 : -1150, lin], [S.s7, PORT ? -640 : -1080, lin], [dr, -560, p2i], [dr + 0.42, 1650, p3i]];
    var c = { cx: trk(KCX, t), cy: trk(KCY, t), rx: trk(KRX, t), rz: trk(KRZ, t), dz: trk(KDZ, t) };
    if (PORT) { var w = 1 - p2io((t - S.s5) / 0.62); c.dz += 420 * w; c.rz -= 18 * w; }
    return c;
  }
  function place(e, x, y, z, r, sc) {
    e.style.transform = "translate3d(" + px(x) + "," + px(y) + "," + px(z || 0) + ") rotate(" + (r || 0).toFixed(2) + "deg)" + (sc !== undefined && sc !== 1 ? " scale(" + sc.toFixed(4) + ")" : "");
  }

  function renderW1(t) {
    var on = t < S.drop + 0.46;
    op($.w1, on ? 1 : 0);
    if (!on) return;
    var c = camW1(t);
    // a little hand-held life, and a shake on the cuts
    var sh = 0;
    [S.slice, S.blade, S.tue + 0.28, S.wed + 0.28, S.thu + 0.28, S.fri + 0.28].forEach(function (a) { sh += 7 * Math.exp(-Math.max(0, t - a) / 0.08) * (t >= a ? 1 : 0); });
    var hx = 6 * Math.sin(t * 1.7) + sh * Math.sin(t * 90), hy = 5 * Math.cos(t * 1.3) + sh * Math.cos(t * 77);
    var calm = t >= S.s5 && t < S.s6 ? 1 - sat((t - S.s5) / 0.5) : 1;
    hx *= calm; hy *= calm;
    $.cam.style.transform = "translate3d(" + px(CX + hx) + "," + px(CY + hy) + "," + px(c.dz) + ") rotateX(" + c.rx.toFixed(3) + "deg) rotateZ(" + c.rz.toFixed(3) + "deg) translate3d(" + px(-c.cx) + "," + px(-c.cy) + ",0)";
    // the drop: everything is pulled into one point, then the mat opens like a trapdoor onto the sky
    var sk = p3i((t - S.s7 - 0.1) / (S.drop - S.s7 - 0.1));
    $.objs.style.transformOrigin = SUCK[0] + "px " + SUCK[1] + "px";
    $.objs.style.transform = sk > 0 ? "rotate(" + (120 * sk).toFixed(2) + "deg) scale(" + Math.max(0.001, 1 - sk).toFixed(4) + ")" : "none";
    var opn = p2i((t - S.drop + 0.02) / 0.4) * 115;
    $["mat-l"].style.transform = "rotateY(" + opn.toFixed(2) + "deg)";
    $["mat-r"].style.transform = "rotateY(" + (-opn).toFixed(2) + "deg)";
    $.desk.style.opacity = (1 - sat((t - S.drop + 0.06) / 0.12)).toFixed(3);
    $["w1-vig"].style.opacity = (1 - sat((t - S.drop) / 0.2)).toFixed(3);

    // shot 2: the cutter comes in, cuts all three strips; the pieces fly
    var cutT = 0, cx, cy, cz, cr;
    if (t < S.s3) {
      var q = t - S.cutIn;
      cx = mix(3300, XC2, p2io(q / (S.slice - 0.06 - S.cutIn))); cy = mix(900, ST_Y[0] - 40, p2io(q / (S.slice - 0.06 - S.cutIn)));
      cz = mix(160, 14, p2io(q / (S.slice - 0.06 - S.cutIn))); cr = -58;
      var sq = (t - S.slice + 0.06) / 0.26;
      if (sq > 0) { cy = mix(ST_Y[0] - 40, ST_Y[2] + 240, p2io(sq)); cz = 0; }
      var lq = (t - S.slice - 0.22) / 0.5;
      if (lq > 0) { cx += 500 * p2i(lq); cy += 300 * p2i(lq); cz = 380 * p2i(lq); }
      cutT = q > 0 && lq < 1 ? 1 : 0;
    } else if (t < S.s5) {
      var bq = t - S.blade, x4 = tickX(K4 + 3) + 20;
      cx = x4; cy = mix(ST_Y[0] - 30, ST_Y[0] + 240, p2io((bq + 0.02) / 0.16)); cz = bq < -0.02 ? 220 * p2io(-bq / 0.5) : (bq > 0.2 ? 300 * p2i((bq - 0.2) / 0.4) : 0); cr = -70;
      cutT = t > S.s4 + 0.1 && bq < 0.6 ? 1 : 0;
    }
    if (cutT) { vis($.cutter, true); $.cutter.style.transformOrigin = "0 70px"; place($.cutter, cx, cy - 70, cz, cr); } else vis($.cutter, false);
    vis($.cut2, t > S.slice + 0.04); $.cut2.style.height = px(sat((t - S.slice + 0.06) / 0.26) * 700);
    $.pieces.forEach(function (p) {
      var k = (t - p.t0) / p.d;
      if (k <= 0) { vis(p.el, false); return; }
      var e = p3o(k), land = k > 1 ? spr(t - p.t0 - p.d, 22, 0.45) : 0;
      vis(p.el, true);
      place(p.el, mix(p.x0, p.x1, e) - p.w / 2, mix(p.y0, p.y1, e) - 100, p.h * bump(Math.min(1, k)) + (k > 1 ? 8 * (1 - land) : 0), mix(0, p.r1, e));
    });
    // shot 3: one strip slides against the song, three tries, never lined up
    var off = trk([[S.s3 + 0.05, 0], [S.try1 + 0.3, 110, p2io], [S.try2 + 0.3, -80, p2io], [S.try3 + 0.3, 34, p2io], [S.s4, 34, lin]], t);
    var has3 = S.s4 - S.s3 > 0.5;                // the Short has no shot 3
    if (t < S.s3 || !has3) off = 0;
    $.st0.style.transform = "translate3d(" + px(off) + ",0,0)";
    place($["mk-tape"], XM - 45, 0, 2); place($["mk-strip"], XM - 45 + off, 0, 2);
    var in3 = has3 && t > S.s3 && t < S.s4 + 0.02;
    vis($["mk-tape"], in3); vis($["mk-strip"], in3);
    var settled = in3 && t > S.try1 + 0.3 ? 1 : 0;
    vis($.gap3, settled && Math.abs(off) > 4);
    $.gap3.style.left = px(XM + Math.min(0, off)); $.gap3.style.width = px(Math.abs(off));
    var tg = t < S.try2 + 0.3 ? "+27 frames" : (t < S.try3 + 0.3 ? "−20 frames" : "+8 frames");
    if ($.tag3.textContent !== tg) $.tag3.textContent = tg;
    var tq = t - (t > S.try3 + 0.3 ? S.try3 + 0.3 : (t > S.try2 + 0.3 ? S.try2 + 0.3 : S.try1 + 0.3));
    vis($.tag3, settled);
    place($.tag3, XM + off / 2 - 170, 0, 6, -3, 1 + 0.15 * Math.exp(-Math.max(0, tq) / 0.08));
    // shot 4: the beats light up one by one; the blade lands just off one
    var in4 = t > S.s4 - 0.01 && t < S.s5 + 0.05;
    var lit = Math.floor((t - S.s4) / P + 1e-6);
    for (var i = 0; i < $.ticks.length; i++) {
      var on4 = in4 && i >= K4 && i <= K4 + 3 && (i - K4) <= lit;
      $.ticks[i].style.background = on4 ? "#ffd34d" : "#26303d"; $.ticks[i].style.opacity = on4 ? "1" : "";
      $.ticks[i].style.boxShadow = on4 ? "0 0 0 4px rgba(255,211,77,0.35)" : "none";
    }
    var x4c = tickX(K4 + 3) + 20, cut4 = t > S.blade + 0.04 && in4;
    vis($.cut4, cut4); $.cut4.style.left = px(x4c - 4);
    vis($.gap4, cut4 && t > S.blade + 0.12); $.gap4.style.left = px(tickX(K4 + 3)); $.gap4.style.width = px(20);
    var tq4 = t - S.blade - 0.16;
    vis($.tag4, cut4 && tq4 > 0); place($.tag4, x4c - 110, 0, 6, 4, 0.6 + 0.4 * spr(tq4, 18, 0.5));
    // shot 6: a new day, a new pile
    $.days.forEach(function (d) {
      var q6 = t - d.t0;
      if (q6 <= 0 || t > S.drop + 0.1) { vis(d.el, false); d.pile.forEach(function (p) { vis(p.el, false); }); return; }
      var f = p2i(q6 / 0.3), land = q6 > 0.3 ? spr(q6 - 0.3, 20, 0.4) : 0;
      vis(d.el, true);
      place(d.el, d.x, d.y, 6 + 900 * (1 - f) + (q6 > 0.3 ? 14 * (1 - land) * Math.sin(Math.min(1, (q6 - 0.3) / 0.25) * Math.PI) : 0), d.r * (1 - 0.3 * f));
      d.pile.forEach(function (p) {
        var k6 = (t - p.t0) / 0.32;
        if (k6 <= 0) { vis(p.el, false); return; }
        vis(p.el, true);
        place(p.el, p.x1 - p.w / 2, p.y1 - 100, p.h * (1 - p2i(Math.min(1, k6))), p.r1);
      });
    });
  }

  function renderCU(t) {
    var a = t >= S.cu0 && t < S.s6;
    op($.cu, a ? 1 : 0);
    if (!a) return;
    // the frame is exactly where the dive left it (99 x 176 mat px, times the dive's scale)
    var fw = 99 * DK, fh = 176 * DK, fx = CX - DIVE.ox * DK - fw / 2, fy = CY - DIVE.oy * DK - fh / 2;
    $["cu-panel"].style.cssText = "position:absolute;overflow:hidden;background:#000;left:" + px(fx) + ";top:" + px(fy) + ";width:" + px(fw) + ";height:" + px(fh) + ";border-radius:4px";
    var off = t > S.off + 0.05, lips = t > S.lips;
    var jolt = off ? 16 * Math.exp(-(t - S.off - 0.05) / 0.07) * Math.sin((t - S.off) * 80) : 0;
    $["cu-panel"].style.transform = "translate3d(" + px(jolt + (lips ? -8 : 0)) + ",0,0)";
    // the word under his mouth: in place, then a frame late, then it drifts off
    var wx = fx + fw / 2, wy = fy + fh * 0.75, dr = lips ? p2io((t - S.lips - 0.1) / 0.9) : 0;
    $["cu-word"].style.left = "0"; $["cu-word"].style.top = "0";
    var wk = spr(t - S.cu0 - 0.08, 16, 0.6);
    $["cu-word"].style.transform = "translate3d(" + px(wx - (PORT ? 180 : 130) + (off ? 18 : 0) + (PORT ? 160 : 120) * dr) + "," + px(wy + 10 * dr) + ",0) rotate(" + (5 * dr).toFixed(2) + "deg) scale(" + (0.5 + 0.5 * wk).toFixed(4) + ")";
    $["cu-word"].style.background = lips ? (t > S.words ? RED : "#ffd0d5") : "#ffffff";
    $["cu-word"].style.color = lips && t > S.words ? "#ffffff" : INK;
    $["cu-word"].style.opacity = sat((t - S.cu0) / 0.08).toFixed(3);
    // the side: the voice and the lips, one track slides one frame
    var sk = p3o((t - S.cu0) / 0.35);
    $["cu-side"].style.transform = "translate3d(" + px(1080 + 120 * (1 - sk)) + "," + px(250) + ",0) rotate(" + (-1.5 + 2 * (1 - sk)).toFixed(2) + "deg)";
    $["cu-side"].style.opacity = PORT ? "0" : sk.toFixed(3);
    var sl = (off ? 34 : 0) + (lips ? 90 * p2io((t - S.lips - 0.1) / 0.9) : 0);
    $.trkL.setAttribute("transform", "translate(" + sl.toFixed(1) + ",0)");
    var tq = t - S.off - 0.1;
    vis($["cu-tag"], tq > 0);
    $["cu-tag"].style.transform = "scale(" + (0.6 + 0.4 * spr(tq, 18, 0.5)).toFixed(4) + ") rotate(-3deg)";
    $["cu-tag"].textContent = lips && t > S.words - 0.1 ? "out of sync" : "1 frame off";
    if ($["cu-tag2"]) {                           // portrait: the tag sits on the frame's corner
      vis($["cu-tag2"], tq > 0);
      $["cu-tag2"].style.transform = "translate3d(" + px(fx + fw - 330) + "," + px(fy - 46) + ",0) scale(" + (0.6 + 0.4 * spr(tq, 18, 0.5)).toFixed(4) + ") rotate(-3deg)";
      if ($["cu-tag2"].textContent !== $["cu-tag"].textContent) $["cu-tag2"].textContent = $["cu-tag"].textContent;
    }
  }

  // ------------------------------------------------------------------------ the Stalak world
  var ZOOM = PORT ? { c1in: 0.7, c1: 1.0, c2: 0.9, c3: 0.86, bar: 0.86, pv: 1.2, pace: 1.0, expPhone: 1.0, exp: 0.86, packCtl: 0.9, pack: 0.76 }
                  : { c1in: 0.8, c1: 1.26, c2: 1.12, c3: 1.05, bar: 1.05, pv: 1.36, pace: 1.22, expPhone: 1.12, exp: 1, packCtl: 1.3, pack: 1 };
  var CAMK = null;
  function camW2(t) {
    if (!CAMK) {
      var K = [[S.drop, "c1in"], [S.s8 - 0.1, "c1in"], [S.s8 + 0.4, "c1", p3o], [S.s9, "c1"], [S.s9 + 0.6, "c2"], [S.toEdit - 0.04, "c2"], [S.toEdit + 0.56, "c3"]];
      K.push([S.s11, "c3"], [S.s11 + 0.5, "pv"], [S.s12 - 0.04, "pv"], [S.s12 + 0.46, "c3"], [S.s13, "c3"], [S.s13 + 0.42, "pace"],
             [S.s14 + 0.16, "pace"], [S.s14 + 0.8, "expPhone"], [S.pro - 0.3, "expPhone"], [S.pro + 0.35, "exp"], [S.s15, "exp"],
             [S.s15 + 0.6, "packCtl"], [S.one15 - 0.15, "packCtl"], [S.one15 + 0.45, "pack"]);
      CAMK = K.filter(function (k) { return k[0] <= TOTAL + 1; });
      CAMK.forEach(function (k, i) { k[3] = i > 0 && k[1] === CAMK[i - 1][1] ? CAMK[i - 1][3] * (1 + 0.012 * Math.min(6, k[0] - CAMK[i - 1][0])) : ZOOM[k[1]]; });
      var lastK = CAMK[CAMK.length - 1];
      CAMK.push([lastK[0] + 6, lastK[1], sio, lastK[3] * 1.06], [1e6, lastK[1], lin, lastK[3] * 1.06]);
    }
    var K2 = CAMK;
    for (var i = 1; i < K2.length; i++) {
      if (t < K2[i][0]) {
        var a = K2[i - 1], b = K2[i], q = sat((t - a[0]) / Math.max(1e-6, b[0] - a[0])), e = (b[2] || sio)(q);
        var A = CAM2[a[1]], Bp = CAM2[b[1]];
        var pan = Math.abs(Bp[0] - A[0]) > 300 ? bump(q) : 0;
        return { x: mix(A[0], Bp[0], e), y: mix(A[1], Bp[1], e), z: mix(a[3], b[3], b[1] === a[1] ? lin(q) : e) * (1 - 0.07 * pan), r: 1.6 * pan * (Bp[0] > A[0] ? 1 : -1) };
      }
    }
  }
  function press(e, t0, t, base) {          // a button pressed at t0
    var q = t - t0, k = q >= 0 && q < 0.22 ? bump(q / 0.22) : 0;
    e.style.transform = (base || "") + " translateY(" + px(6 * k) + ")";
    e.style.boxShadow = "0 " + (8 - 6 * k).toFixed(1) + "px 0 #0a0d14";
  }
  function popIn(e, t0, t, base, w, z) {    // pops in place, returns the spring
    var q = t - t0;
    if (q < 0) { vis(e, false); return 0; }
    var k = spr(q, w || 16, z || 0.6);
    vis(e, true); e.style.opacity = sat(q / 0.06).toFixed(3);
    e.style.transform = (base || "") + " scale(" + (0.4 + 0.6 * k).toFixed(4) + ")";
    return k;
  }
  function icicles(w, g, seed) {
    var d = "", half = w / 2 - 34;
    if (g <= 0.01) return "";
    for (var i = -20; i <= 20; i++) {
      var x = i * 30 + (hash(i * 1.9 + seed) - 0.5) * 10;
      if (Math.abs(x) > half) continue;
      var h = hash(i * 7.3 + seed), lg = hash(i * 3.1 + seed * 2.7) > 0.8;
      var L = (14 + 28 * h + (lg ? 40 : 0)) * g, ww = (lg ? 20 : 13) + 6 * hash(i + 3.1 + seed);
      d += "M" + (w / 2 + x - ww / 2).toFixed(1) + " 0 Q" + (w / 2 + x - ww / 4).toFixed(1) + " " + (L * 0.62).toFixed(1) + " " + (w / 2 + x).toFixed(1) + " " + L.toFixed(1) + " Q" + (w / 2 + x + ww / 4).toFixed(1) + " " + (L * 0.62).toFixed(1) + " " + (w / 2 + x + ww / 2).toFixed(1) + " 0 Z ";
    }
    return d;
  }
  function drawSnow(t, camx) {
    var c = $.ctx; c.clearRect(0, 0, VW, VH); c.fillStyle = "#ffffff";
    for (var k = 0; k < $.fl.length; k++) {
      var f = $.fl[k], y = (f.y + f.v * t) % (VH + 120) - 60, x = (((f.x + f.amp * Math.sin(f.w * t + f.ph) - camx * 0.18 * f.d) % (VW + 180)) + (VW + 180)) % (VW + 180) - 90;
      c.globalAlpha = f.a; c.beginPath(); c.arc(x, y, f.r, 0, 6.2832); c.fill();
    }
    c.globalAlpha = 1;
  }
  // the cut bar: one layout, re-cut from left to right by a red knife
  var SWEEPS = null;
  function bar(t) {
    if (!SWEEPS) SWEEPS = [[S.sweep0, S.sweep1, "normal"], [S.chill + 0.05, S.chill + 0.4, "chill"], [S.punchy + 0.08, S.punchy + 0.45, "punchy"]];
    var W = 940, cur = null, prev = null, q = 0, n = 0;
    for (var i = 0; i < SWEEPS.length; i++) if (t >= SWEEPS[i][0]) { prev = cur; cur = SWEEPS[i]; }
    if (cur) q = sat((t - cur[0]) / (cur[1] - cur[0]));
    var xk = q * W;
    function draw(lay, a, b) {
      var bl = T.LAY[lay];
      for (var j = 0; j < bl.length; j++) {
        var l = bl[j][0] / 32 * W, r = (j + 1 < bl.length ? bl[j + 1][0] : 32) / 32 * W;
        var L = Math.max(l, a), R = Math.min(r, b);
        if (R - L < 0.5) continue;
        var e = $.bks[n++]; vis(e, true);
        e.style.left = px(L); e.style.width = px(R - L + 0.6); e.style.background = TK[bl[j][1]];
        e.style.color = bl[j][1] === 3 ? INK : "#ffffff";
        var lab = (r - l > 34 && R - L > 30) ? String(bl[j][1]) : "";
        if (e.textContent !== lab) e.textContent = lab;
        e.style.boxShadow = R < r - 0.5 ? "none" : "inset -4px 0 0 #0a0d14";
      }
    }
    if (cur) draw(cur[2], 0, xk);
    if (prev) draw(prev[2], xk, W);
    for (; n < $.bks.length; n++) vis($.bks[n], false);
    var sweeping = cur && q > 0 && q < 1;
    vis($.knife, sweeping); $.knife.style.left = px(xk - 4);
    // the playhead runs with the music once the edit exists
    var ph = ((t - T.PART0) % T.L8 + T.L8) % T.L8 / T.L8;
    vis($.ph, t > S.sweep1);
    $.ph.style.left = px(($.barX || 510) + 5 + ph * W - 4);
  }

  function renderW2(t) {
    var on = t > S.drop - 0.05;
    op($.sky, on ? 1 : 0);
    if (!on) { op($.board, 0); vis($["icon-land"], false); vis($["icon-ice"], false); return; }
    var c = camW2(t);
    drawSnow(t, c.x);
    var punch = 0, bn = Math.floor(t / P + 1e-6);
    for (var bb = bn - 2; bb <= bn; bb++) { var dtb = t - B(bb); if (dtb >= 0 && B(bb) >= S.drop - 1e-6) punch += (((bb - DB) % 4 + 4) % 4 === 0 ? 0.016 : 0.008) * Math.exp(-dtb / 0.1); }
    var bon = t > S.s8 - 0.1 && t < S.pay + 0.05;
    op($.board, bon ? sat((t - S.s8 + 0.1) / 0.2) : 0);
    var z = c.z * (1 + punch);
    $.board.style.transform = "translate3d(" + CX + "px," + CY + "px,0) rotate(" + c.r.toFixed(3) + "deg) scale(" + z.toFixed(4) + ") translate3d(" + px(-c.x) + "," + px(-c.y) + ",0)";
    // the icon lands on the drop, its icicles grow; it hands over to the app
    var iq = t - S.drop, iout = p2i((t - S.s8 + 0.15) / 0.25);
    if (iq > 0 && iout < 1) {
      var ik = spr(iq, 13, 0.5), sc = (0.25 + 0.75 * ik) * (1 + 2.2 * punch) * (1 - 0.5 * iout);
      vis($["icon-land"], true); $["icon-land"].style.opacity = (1 - iout).toFixed(3);
      $["icon-land"].style.transform = "translate3d(" + px(CX - 150) + "," + px(CY - 150 - 60 * (1 - ik) - (CY + 280) * iout) + ",0) rotate(" + (-16 * (1 - ik) + 20 * iout).toFixed(2) + "deg) scale(" + sc.toFixed(4) + ")";
      vis($["icon-ice"], iout < 0.2); $["icon-ice"].style.transform = "translate3d(" + px(CX - 150) + "," + px(CY + 128) + ",0)";
      $["icon-icp"].setAttribute("d", icicles(300, p3o((iq - 0.12) / 0.5), 3));
    } else { vis($["icon-land"], false); vis($["icon-ice"], false); }
    if (!bon) return;
    // 1. the song falls into "Import your music"; its waveform and tempo
    var fq = t - S.songDrop, fl = sat(fq / (S.land + 0.1 - S.songDrop));
    if (fq > 0 && t < S.land + 0.32) {
      vis($["s-tape"], true);
      var sq = t > S.land + 0.1 ? spr(t - S.land - 0.1, 22, 0.4) : 0;
      $["s-tape"].style.opacity = (1 - sat((t - S.land - 0.14) / 0.16)).toFixed(3);
      var dc = $.dropC || [0, 25];
      $["s-tape"].style.transform = "translate3d(" + px(dc[0] - 450) + "," + px(mix(dc[1] - 790, dc[1] - 55, p2i(fl))) + ",0) rotate(" + (mix(-9, 0, fl)).toFixed(2) + "deg) scale(" + (1 - 0.05 * Math.sin(sq * Math.PI)).toFixed(4) + ")";
    } else vis($["s-tape"], false);
    var wq = t - S.land - 0.12;
    vis($["s-drop"], wq < 0.05);
    if (wq > 0) { vis($["s-wave"], true); $["s-wave"].style.transform = "scale(" + (0.94 + 0.06 * spr(wq, 18, 0.6)).toFixed(4) + ")"; } else vis($["s-wave"], false);
    popIn($["s-bpm"], S.land + 0.08, t, "", 18, 0.6);
    vis($["s-next"], true);
    // 2. the takes drop in, the buttons, then their sound lines up with the song's
    $.thumbs.forEach(function (th) { var k = popIn(th.th, th.t0, t, "translateY(" + px(-40 * (1 - Math.min(1, spr(t - th.t0, 16, 0.7)))) + ")", 16, 0.62); popIn(th.nm, th.t0 + 0.06, t, "", 18, 0.7); });
    press($["t-imp"], S.imp, t); press($["t-rec"], S.rec, t);
    $["t-recdot"].setAttribute("opacity", t > S.rec && Math.floor((t - S.rec) / 0.25) % 2 === 0 ? "0.25" : "1");
    var aq = p2io((t - S.align - 0.05) / (S.synced - S.align - 0.35));
    $.wrows.forEach(function (w, i) {
      var lk = (t - (S.synced - 0.45 + 0.12 * i));
      var o = w.off * (1 - aq) + (lk < 0 && aq > 0.98 ? 3 * Math.sin(t * 50) : 0);
      w.g.setAttribute("transform", "translate(" + o.toFixed(1) + ",0)");
    });
    popIn($["t-ok"], S.synced - 0.12, t, "", 18, 0.7);
    // 3. the edit: the bar gets cut on the beats, the preview switches takes (the card leaves once the camera is on the export)
    var eg = sat((t - S.s14 - 0.55) / 0.3);
    $["c-edit"].style.opacity = (1 - eg).toFixed(3); vis($["c-edit"], eg < 1);
    bar(t);
    press($["e-exp"], S.s14, t);
    // the lock: lip sync stays locked
    var lq = t - S.s11 - 0.3;
    if (lq > 0 && t < S.s12 + 0.4) {
      vis($["pv-lock"], true);
      $["pv-lock"].style.opacity = (sat(lq / 0.08) * (1 - sat((t - S.s12 - 0.1) / 0.3))).toFixed(3);
      $["pv-lock"].style.transform = "scale(" + (0.5 + 0.5 * spr(lq, 16, 0.55)).toFixed(4) + ")";
      var cl = p3i((t - S.lock + 0.08) / 0.1);
      $["pv-shackle"].setAttribute("transform", "translate(0," + (-16 * (1 - cl)).toFixed(1) + ")");
    } else vis($["pv-lock"], false);
    // the lyric on the preview, right on time
    var lyOn = t > S.show && t < S.s14 + 0.9;
    vis($["pv-lyr"], lyOn);
    $.pvw.forEach(function (w, i) { var q = t - (S.show + 0.1 + i * P / 2); w.style.opacity = q > 0 ? "1" : "0"; w.style.transform = "scale(" + (q > 0 ? 0.7 + 0.3 * spr(q, 20, 0.55) : 0.7).toFixed(4) + ")"; });
    // 3b. lyrics: paste, then tap along
    var ly = t - S.s12, lyo = p2i((t - S.show + 0.14) / 0.3);
    if (ly > 0 && lyo < 1) {
      var lk = spr(ly, 13, 0.75);
      vis($["c-lyr"], true); $["c-lyr"].style.opacity = (sat(ly / 0.08) * (1 - lyo)).toFixed(3);
      $["c-lyr"].style.transform = "translate3d(" + px(420 * (1 - lk) + 700 * lyo) + "," + px(30 * (1 - lk)) + ",0) rotate(" + (5 * (1 - lk) + 4 * lyo).toFixed(2) + "deg)";
      $.lns.forEach(function (l, i) {
        var pq = t - S.paste - 0.08 - i * 0.07;
        l.ln.style.opacity = pq > 0 ? "1" : "0";
        if (l.text) { var nch = Math.floor(sat(pq / 0.25) * l.text.length + 1e-4), s = l.text.slice(0, nch); if (l.tx.textContent !== s) l.tx.textContent = s; }
        else l.tx.style.width = px(l.w * p3o(pq / 0.2));
        var tp = S.tap + 0.12 + i * P / 2, ok = t > tp;
        l.st.style.background = ok ? BLUE : "#e7edf5"; l.st.style.borderColor = ok ? INK : "#c8d3e2"; l.st.style.color = ok ? "#ffffff" : "#9aa8bb";
        var lab = ok ? "✓ synced" : "—";
        if (l.st.textContent !== lab) l.st.textContent = lab;
        l.st.style.transform = "scale(" + (ok ? 1 + 0.15 * Math.exp(-(t - tp) / 0.08) : 1).toFixed(3) + ")";
      });
      press($["ly-tapsync"], S.tap - 0.12, t);
      var tb = t - S.tap + 0.05, pulse = 0;
      for (var j = 0; j < 4; j++) { var dq = t - (S.tap + 0.12 + j * P / 2); if (dq >= 0) pulse = Math.max(pulse, Math.exp(-dq / 0.07)); }
      popIn($.tapb, S.tap - 0.05, t, "translateY(" + px(5 * pulse) + ")", 16, 0.6);
      $.tapb.style.background = pulse > 0.3 ? BLUE : INK;
      $.tapb.style.transform += " scale(" + (1 - 0.06 * pulse).toFixed(3) + ")";
    } else op($["c-lyr"], 0);
    // the pace: Normal -> Chill -> Punchy
    if (fit()) {
      var pos = trk([[0, 1], [S.chill, 1], [S.chill + 0.22, 0, p2io], [S.punchy + 0.04, 0, lin], [S.punchy + 0.26, 2, p2io]], t);
      var L = $.paceL, i0 = Math.floor(pos), i1 = Math.min(2, i0 + 1), f2 = pos - i0;
      $["pace-on"].style.left = px(mix(L[i0][0], L[i1][0], f2)); $["pace-on"].style.width = px(mix(L[i0][1], L[i1][1], f2));
      L.forEach(function (b, k) { b[2].style.color = Math.abs(pos - k) < 0.5 ? "#ffffff" : INK; });
      var pk = trk([[0, 0], [S.cplus + 0.3, 0], [S.cplus + 0.55, 2, p2io]], t), M = $.pkL, j0 = Math.floor(pk), j1 = Math.min(2, j0 + 1), g2 = pk - j0;
      $["pk-on"].style.left = px(mix(M[j0][0], M[j1][0], g2)); $["pk-on"].style.width = px(mix(M[j0][1], M[j1][1], g2));
      M.forEach(function (b, k) { b[2].style.color = Math.abs(pk - k) < 0.5 ? "#ffffff" : INK; });
    }
    // 4. export: the vertical video for TikTok, Reels, Shorts; the music video (Pro)
    var xq = t - S.tik + 0.35, xgone = t > S.s15 + 0.7;
    if (xgone) { ["x-pl", "x-pro", "x-tl"].forEach(function (id) { vis($[id], false); }); op($["x-phone"], 0); op($["x-tv"], 0); }
    else if (xq > 0) {
      var xk = spr(xq, 12, 0.72);
      vis($["x-phone"], true); $["x-phone"].style.opacity = "1";
      $["x-phone"].style.transform = "translate3d(0," + px(700 * (1 - xk)) + ",0) rotate(" + (-6 * (1 - xk)).toFixed(2) + "deg)";
    } else { vis($["x-phone"], false); $["x-phone"].style.opacity = "0"; }
    if (!xgone) popIn($["x-pl"], S.tik + 0.15, t, "", 18, 0.7);
    var vq = t - S.pro + 0.2;
    if (xgone) {} else if (vq > 0) {
      var vk = spr(vq, 12, 0.72);
      vis($["x-tv"], true); $["x-tv"].style.opacity = "1";
      $["x-tv"].style.transform = "translate3d(" + px(1200 * (1 - vk)) + ",0,0) rotate(" + (5 * (1 - vk)).toFixed(2) + "deg)";
    } else { vis($["x-tv"], false); $["x-tv"].style.opacity = "0"; }
    if (!xgone) { popIn($["x-pro"], S.pro + 0.25, t, "rotate(6deg)", 16, 0.5); popIn($["x-tl"], S.pro + 0.35, t, "", 18, 0.7); }
    // 5. the pack: 30 videos fan out; then one a day
    var pq0 = t - S.s15 - 0.1;
    if (pq0 > 0) { op($["c-pack"], 1); $["c-pack"].style.transform = "translateY(" + px(-260 * (1 - spr(pq0, 13, 0.75))) + ")"; } else op($["c-pack"], 0);
    press($["pk-btn"], S.one15, t, "");
    popIn($["pk-cp"], S.cplus + 0.05, t, "rotate(-5deg)", 15, 0.5);
    var tq0 = t - S.one15 - 0.1, tout = p2i((t - S.turns - 0.25) / 0.3);
    if (tq0 > 0 && tout < 1) { vis($["pk-tape"], true); $["pk-tape"].style.opacity = (1 - tout).toFixed(3); $["pk-tape"].style.transform = "scale(" + ((0.4 + 0.6 * spr(tq0, 15, 0.55)) * (1 + 0.08 * bump(sat((t - S.turns) / 0.3)))).toFixed(4) + ")"; }
    else vis($["pk-tape"], false);
    var rdy = sat((t - S.edits - 0.3) / 0.15);
    $["pk-seg"].style.opacity = (1 - rdy).toFixed(3); $["pk-btn"].style.opacity = (1 - rdy).toFixed(3);
    var wk = t - S.newv;
    $.pks.forEach(function (p, i) {
      var q = t - p.t0;
      if (q < 0) { vis(p.el, false); return; }
      var k = spr(q, 14, 0.72);
      var x = mix(6300 - 60, p.gx, k), y = mix(-66, p.gy, k), r = mix(-30 + 60 * hash(i), 0, k), sc = 0.3 + 0.7 * k;
      if (wk > 0) {
        var wq2 = p3o((wk - 0.012 * i) / 0.42), sx = 5673 + p.slot * 184 - 15, sy = -60;
        x = mix(p.gx, sx + (p.back ? 8 * p.back : 0), wq2); y = mix(p.gy, sy - (p.back ? 10 * p.back : 0), wq2);
        sc = mix(1, p.back ? 1.25 - 0.05 * p.back : 1.25, wq2); r = mix(0, p.back ? (hash(i * 3) - 0.5) * 14 : 0, wq2);
        p.el.style.zIndex = p.back ? String(10 - p.back) : "20";
        p.el.style.filter = p.back ? "brightness(" + (1 - 0.25 * wq2).toFixed(3) + ")" : "none";
      }
      vis(p.el, true);
      p.el.style.transform = "translate3d(" + px(x) + "," + px(y) + ",0) rotate(" + r.toFixed(2) + "deg) scale(" + sc.toFixed(4) + ")";
      p.el.style.transformOrigin = "0 0";
    });
    popIn($["pk-ok"], S.edits + 0.36, t, "", 18, 0.7);
    $.dnames.forEach(function (d, i) { popIn(d, S.newv + 0.4 + i * P / 2, t, "", 18, 0.6); });
  }

  // the payoff: MON, TUE, WED grow out of the week into three of his videos, on his song
  function renderPay(t) {
    var a = t > S.pay - 0.42 && t < S.payEnd + 0.02;
    op($.pay, a ? 1 : 0);
    if (!a) return;
    var g = p3o((t - S.pay + 0.42) / 0.42), out = p2i((t - S.payEnd + 0.26) / 0.26);
    var punch = 0, bn = Math.floor(t / P + 1e-6);
    for (var bb = bn - 1; bb <= bn; bb++) { var dtb = t - B(bb); if (dtb >= 0 && B(bb) >= S.pay - 1e-6) punch += (((bb - DB) % 4 + 4) % 4 === 0 ? 0.03 : 0.014) * Math.exp(-dtb / 0.1); }
    var LYR = T.LYR === undefined ? 3.469 : T.LYR;
    if (PORT) {
      var pk0 = spr(t - S.pay + 0.3, 12, 0.7), o2 = p2i((t - S.payEnd + 0.26) / 0.26);
      $.pp0.style.transform = "translate3d(0," + px(120 * (1 - pk0) - 200 * o2) + ",0) scale(" + ((0.6 + 0.4 * pk0) * (1 + punch) * (1 - 0.2 * o2)).toFixed(4) + ")";
      $.pp0.style.opacity = (sat((t - S.pay + 0.3) / 0.1) * (1 - o2)).toFixed(3);
      var w0 = $.pls[0];
      for (var w9 = 0; w9 < w0.length; w9++) { var q9 = t - (S.pay + LYR + w9 * P / 2); w0[w9].style.opacity = q9 > 0 ? "1" : "0"; w0[w9].style.transform = "scale(" + (q9 > 0 ? 0.7 + 0.3 * spr(q9, 20, 0.55) : 0.7).toFixed(4) + ")"; }
      return;
    }
    [0, 1, 2].forEach(function (i) {
      var pp = $["pp" + i], pd = $["pd" + i];
      // from the week's slot, where the camera shows it, to the panel
      var cs = camW2(S.pay - 0.42);
      var sx = CX + (5673 + i * 184 - 15 - cs.x) * cs.z, sy = CY + (-60 - cs.y) * cs.z, sw = 150 * cs.z;
      var fx = [150, 710, 1270][i], fy = 140, s0 = sw / 500;
      var x = mix(sx, fx, g), y = mix(sy, fy, g), sc = mix(s0, 1, g) * (1 + punch);
      var ox = (i - 1) * 900 * out, oy = 160 * out;
      pp.style.transformOrigin = "0 0";
      pp.style.transform = "translate3d(" + px(x - fx + ox) + "," + px(y - fy + oy) + ",0) scale(" + sc.toFixed(4) + ") rotate(" + ((i - 1) * 8 * out).toFixed(2) + "deg)";
      pp.style.opacity = (1 - out).toFixed(3);
      pd.style.opacity = (sat((g - 0.6) / 0.4) * (1 - out)).toFixed(3);
      pd.style.transform = "translateY(" + px(30 * (1 - g) + oy) + ") translateX(" + px(ox) + ")";
      var ws = $.pls[i];
      for (var w = 0; w < ws.length; w++) { var q = t - (S.pay + LYR + w * P / 2); ws[w].style.opacity = q > 0 ? "1" : "0"; ws[w].style.transform = "scale(" + (q > 0 ? 0.7 + 0.3 * spr(q, 20, 0.55) : 0.7).toFixed(4) + ")"; }
    });
  }

  function renderEnd(t) {
    // you film. Stalak edits.
    var a = t > S.s17 - 0.05 && t < S.s18 + 0.02;
    op($.claim, a ? 1 : 0);
    if (a && fit()) {
      var out = p2i((t - S.s18 + 0.2) / 0.2);
      var q1 = t - S.film17, k1 = q1 > 0 ? spr(q1, 15, 0.55) : 0, q2 = t - S.stalak17, k2 = q2 > 0 ? spr(q2, 15, 0.55) : 0;
      var w1 = 230 + 40 + $.cl1w, x1 = CX - w1 / 2, w2 = 200 + 40 + $.cl2w, x2 = CX - w2 / 2;
      var y1 = PORT ? 700 : 250, y2 = PORT ? 1000 : 560;
      function put(e, x, y, k, q, rot) { vis(e, q > 0); e.style.opacity = (sat(q / 0.05) * (1 - out)).toFixed(3); e.style.transform = "translate3d(" + px(x) + "," + px(y - 60 * out) + ",0) rotate(" + (rot * (1 - k)).toFixed(2) + "deg) scale(" + (0.3 + 0.7 * k).toFixed(4) + ")"; }
      put($["cl-cam"], x1, y1 - 20, k1, q1, -14); put($["cl-t1"], x1 + 270, y1, k1, q1 - 0.04, 6);
      put($["cl-icon"], x2, y2 - 20, k2, q2, 14); put($["cl-t2"], x2 + 240, y2, k2, q2 - 0.04, -6);
    }
    // the end card
    var e = t - S.s18 - 0.02;
    op($.end, e > 0 ? 1 : 0);
    if (e > 0) {
      $.end.style.transformOrigin = CX + "px " + CY + "px";
      $.end.style.transform = "scale(" + (1 + 0.045 * sio(e / Math.max(1, TOTAL - S.s18))).toFixed(4) + ")";
      var ik = spr(e, 12, 0.55), wk = spr(e - 0.15, 11, 0.7);
      $["end-icon"].style.opacity = sat(e / 0.06).toFixed(3);
      $["end-icon"].style.transform = "translateY(" + px(-40 * (1 - ik) + 8 * Math.sin(t * 1.6)) + ") rotate(" + (-12 * (1 - ik)).toFixed(2) + "deg) scale(" + (0.3 + 0.7 * ik).toFixed(4) + ")";
      $["end-wm"].style.opacity = sat((e - 0.15) / 0.08).toFixed(3);
      $["end-wm"].style.transform = "translateY(" + px(40 * (1 - wk)) + ") scale(" + (0.85 + 0.15 * wk).toFixed(4) + ")";
      var parts = [["Free", S.free], ["  ·  No download", S.nodl], ["  ·  No sign-up", S.nosu]], sub = "";
      parts.forEach(function (p) { if (t > p[1] - 0.02) sub += p[0]; });
      if ($["end-sub"].textContent !== sub) $["end-sub"].textContent = sub;
      var url = "stalak.app", nt = Math.floor(sat((t - S.url) / 0.5) * url.length + 1e-4);
      var u = url.slice(0, nt);
      if ($["end-url"].textContent !== u) $["end-url"].textContent = u;
    }
  }

  function renderCaps(t) {
    if (!$.caps2) return;
    $.caps2.forEach(function (C) {
      if (t < C.a - 0.02 || t >= C.b) { vis(C.el, false); return; }
      vis(C.el, true); C.el.style.opacity = "1";
      for (var k = 0; k < C.spans.length; k++) {
        var q = t - C.ts[k], sp = C.spans[k];
        sp.style.opacity = q > 0 ? "1" : "0";
        sp.style.transform = "translateY(" + px(q > 0 ? 18 * (1 - spr(q, 18, 0.62)) : 18) + ")";
      }
    });
  }

  function render(t) {
    if (!R0) return;
    if (t < 0) t = 0; if (t > TOTAL) t = TOTAL;
    fit();
    renderW1(t);
    renderCU(t);
    renderW2(t);
    renderPay(t);
    renderEnd(t);
    renderCaps(t);
  }

  window.YT = { init: init, render: render };
})();
