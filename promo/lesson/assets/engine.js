/* Promo v7 « Your snippet is the problem » — the render engine. Every style below is a pure function of t (seconds).
   The grammar of the owner's example (a 28 s motion explainer): a voice, its words on screen one by one, white cards that tilt
   in from the camera and settle, numbers that pop, three pills, a word circled by hand, the logo on white. In Stalak's colours.
   window.T comes from times.js (build.py). LESSON.init(root) builds the repeated parts, LESSON.render(t) draws a frame. */
(function () {
  "use strict";
  var T = window.T, P = T.P, TOTAL = T.TOTAL, S = T.S;
  function B(b) { return b * P; }
  function sat(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function mix(a, b, k) { return a + (b - a) * k; }
  function eOut(x) { x = sat(x); return 1 - Math.pow(1 - x, 3); }
  function eIn(x) { x = sat(x); return x * x * x; }
  function eIO(x) { x = sat(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function bump(x) { return x <= 0 || x >= 1 ? 0 : Math.sin(Math.PI * x); }
  function decay(t, a, tau) { return t < a ? 0 : Math.exp(-(t - a) / tau); }
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
  function fx(el, al, bl) { el.style.opacity = al.toFixed(3); el.style.filter = bl > 0.05 ? "blur(" + bl.toFixed(2) + "px)" : "none"; vis(el, al > 0.002); }
  function W(i, k) { return T.VO[i][0] + T.VW[i][k][1]; }      // word k of voice line i, in film time
  var INK = "#0a0d14", BLUE = "#1f6fd6";
  var $ = {}, R0;

  // ------------------------------------------------------------ the light: blobs, rings, snow
  var BLOBS = [[150, 330, 230, "31,111,214", 0.20], [900, 560, 170, "120,176,255", 0.28], [260, 1540, 280, "120,176,255", 0.24],
               [880, 1420, 210, "31,111,214", 0.16], [560, 980, 360, "169,211,255", 0.18], [80, 980, 150, "31,111,214", 0.14], [980, 180, 140, "120,176,255", 0.22]];
  var RINGS = [[880, 520, 300], [300, 1500, 420], [760, 1560, 250]];
  var FL = [];
  function initLight() {
    BLOBS.forEach(function (b, i) {
      var d = document.createElement("div"); d.className = "blob";
      d.style.width = d.style.height = px(b[2] * 2);
      d.style.background = "radial-gradient(circle, rgba(" + b[3] + "," + b[4] + ") 0%, rgba(" + b[3] + "," + (b[4] * 0.5).toFixed(3) + ") 34%, rgba(" + b[3] + ",0) 70%)";
      $.blobs.appendChild(d); b.el = d;
    });
    RINGS.forEach(function (r) { var d = document.createElement("div"); d.className = "ring"; d.style.width = d.style.height = px(r[2] * 2); $.rings.appendChild(d); r.el = d; });
    var rr = rng(5);
    for (var i = 0; i < 46; i++) FL.push({ x: rr() * 1120, y: rr() * 2000, rad: 1.4 + rr() * 2.8, v: 16 + rr() * 26, a: 0.3 + rr() * 0.4, amp: 6 + rr() * 16, w: 0.3 + rr() * 0.5, ph: rr() * 6.28 });
  }
  function drawLight(t) {
    BLOBS.forEach(function (b, i) {
      var x = b[0] + 40 * Math.sin(6.2832 * t / (13 + 3 * i) + i), y = b[1] + 34 * Math.cos(6.2832 * t / (11 + 2 * i) + 2 * i);
      b.el.style.transform = "translate3d(" + px(x - b[2]) + "," + px(y - b[2]) + ",0)";
    });
    RINGS.forEach(function (r, i) {
      var x = r[0] + 26 * Math.sin(6.2832 * t / (17 + 4 * i) + 1 + i), y = r[1] + 22 * Math.cos(6.2832 * t / (15 + 3 * i) + i);
      r.el.style.transform = "translate3d(" + px(x - r[2]) + "," + px(y - r[2]) + ",0)";
    });
    var c = $.ctx; c.clearRect(0, 0, 1080, 1920); c.fillStyle = "#a9cff7";
    for (var k = 0; k < FL.length; k++) {
      var f = FL[k], y = (f.y + f.v * t) % 2000 - 40, x = ((f.x + f.amp * Math.sin(f.w * t + f.ph)) % 1120 + 1120) % 1120 - 20;
      c.globalAlpha = f.a; c.beginPath(); c.arc(x, y, f.rad, 0, 6.2832); c.fill();
    }
    c.globalAlpha = 1;
  }

  // ------------------------------------------------------------ a card tilts in from the camera, settles, drifts a little, then leaves in a blur
  function card(el, tin, tout, t, o) {
    o = o || {};
    var q = t - tin;
    if (q < -0.001 || t > tout + 0.24) { vis(el, false); return; }
    var k = spr(q, o.w || 10.5, 0.8), e = eIn((t - tout) / 0.22);
    var rx = (o.rx === undefined ? 30 : o.rx) * (1 - k) + 1.4 * Math.sin(6.2832 * t / 5.3), ry = (o.ry === undefined ? -26 : o.ry) * (1 - k) + 2.6 * Math.sin(6.2832 * t / 6.7 + 1);
    var tz = 340 * (1 - k), ty = 80 * (1 - k) - 70 * e;
    fx(el, sat(q / 0.08) * (1 - e), (1 - sat(q / 0.26)) * 16 + 12 * e);
    el.style.transform = "translate3d(0," + px(ty) + "," + px(tz) + ") rotateX(" + rx.toFixed(3) + "deg) rotateY(" + ry.toFixed(3) + "deg) scale(" + (1 - 0.06 * e).toFixed(4) + ")";
  }
  function pop(el, t0, t, w, base) {   // a thing that pops in place
    var q = t - t0;
    if (q < 0) { el.style.opacity = "0"; el.style.transform = "scale(0.4)"; return 0; }
    var k = spr(q, w || 16, 0.55);
    el.style.opacity = sat(q / 0.06).toFixed(3);
    el.style.transform = (base || "") + " scale(" + (0.4 + 0.6 * k).toFixed(4) + ")";
    return k;
  }
  // icicles under a button (bottom edge), grown by g in [0,1] (the app's)
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

  // ------------------------------------------------------------ the generic snippet: grey, one take, a silhouette, a flat waveform
  function tileSVG(w, h) {
    var s = '<svg width="' + w + '" height="' + h + '" viewBox="0 0 240 400" preserveAspectRatio="xMidYMid slice">' +
      '<circle cx="120" cy="150" r="42" fill="#c3cddb"/><path d="M34 312 C 34 226, 206 226, 206 312 L 206 342 L 34 342 Z" fill="#c3cddb"/>' +
      '<circle cx="120" cy="214" r="36" fill="rgba(255,255,255,0.72)"/><path d="M109 197 L136 214 L109 231 Z" fill="#97a6ba"/>';
    for (var i = 0; i < 24; i++) s += '<rect x="' + (22 + i * 8.2).toFixed(1) + '" y="368" width="4.6" height="9" rx="2.3" fill="#b4c0d0"/>';
    return s + "</svg>";
  }

  function init(root) {
    R0 = root;
    ["blobs", "rings", "snow", "notes", "c-feed", "tiles", "c-phone", "feedlist", "c-stats", "s-line", "s-rep", "s-sha", "c-chart", "dots",
     "ch-trail", "ch-ring", "ch-dot", "ch-lab", "p1", "p2", "p3", "icon", "c-edit", "e-ruler", "e-bar", "e-ph", "c-pay", "p-cap",
     "end-wm", "end-url", "cursor", "caps", "circle", "circ"].forEach(function (id) { $[id] = root.querySelector("#" + id); });
    $.ctx = $.snow.getContext("2d");
    initLight();
    // s1: little notes around the hook
    var NOTES = [[210, 640, 52, -12], [860, 690, 44, 10], [170, 1180, 40, 8], [900, 1230, 58, -8], [330, 1380, 36, 14], [760, 560, 34, -16]];
    $.notes2 = NOTES.map(function (n, i) {
      var d = document.createElement("div"); d.className = "note";
      d.innerHTML = '<svg width="' + n[2] + '" height="' + (n[2] * 1.3).toFixed(0) + '" viewBox="0 0 40 52"><path d="M14 40 a8 7 0 1 1 -2 -6 V6 L34 2 V30 a8 7 0 1 1 -2 -6 V10 L16 13 Z" fill="' + BLUE + '" opacity="' + (0.35 + 0.08 * (i % 3)) + '"/></svg>';
      $.notes.appendChild(d); return { el: d, x: n[0], y: n[1], r: n[3], t0: -0.3 + 0.09 * i };
    });
    // s2: three identical snippets, with their tags
    $.tagEls = [];
    [48, 330, 612].forEach(function (x, i) {
      var tl = document.createElement("div"); tl.className = "tile"; tl.style.left = px(x); tl.style.top = "96px"; tl.innerHTML = tileSVG(240, 400);
      $.tiles.appendChild(tl);
      var tg = document.createElement("div"); tg.className = "abs"; tg.style.cssText = "left:" + (x - 18) + "px;top:514px;width:276px;display:flex;flex-wrap:wrap;justify-content:center;gap:8px";
      ["1 take", "0 cuts", "no lyrics"].forEach(function (s, j) { var e = document.createElement("div"); e.className = "tag"; e.style.position = "relative"; e.textContent = s; tg.appendChild(e); $.tagEls.push({ el: e, j: j, i: i }); });
      $.tiles.appendChild(tg);
    });
    // s3: the feed, the same snippet again and again
    for (var f = 0; f < 4; f++) { var it = document.createElement("div"); it.className = "abs"; it.style.cssText = "left:0;top:" + (f * 792) + "px;width:432px;height:792px;background:linear-gradient(165deg,#e9eef5,#d4dce8)"; it.innerHTML = tileSVG(432, 792); $.feedlist.appendChild(it); }
    // s4: the line that stays flat
    $.lineLen = $["s-line"].getTotalLength ? $["s-line"].getTotalLength() : 505;
    $["s-line"].style.strokeDasharray = $.lineLen.toFixed(1); $["s-line"].style.strokeDashoffset = $.lineLen.toFixed(1);
    // s5: every snippet posted, low; one goes up
    var r = rng(21); $.dotEls = [];
    for (var d = 0; d < 24; d++) {
      var c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      var x0 = 120 + r() * 640, y0 = 610 + r() * 76;
      c.setAttribute("cx", x0.toFixed(1)); c.setAttribute("cy", y0.toFixed(1)); c.setAttribute("r", (8 + r() * 4).toFixed(1)); c.setAttribute("fill", "#c6d1df");
      $.dots.appendChild(c); $.dotEls.push({ el: c, t0: 0.18 + d * 0.022 });
    }
    // s6: the three things (sized once the font is there)
    $.pills = [$.p1, $.p2, $.p3].map(function (el, i) { return { el: el, ice: el.querySelector("svg.ice"), t0: [S.p1, S.p2, S.p3][i], cy: [760, 920, 1080][i], cx: [470, 610, 470][i] }; });
    // s7: the real edit, 21 shots
    $.blocks = []; var IW = 788, TOTE = T.CUTS[21];
    for (var b = 0; b < 21; b++) {
      var bk = document.createElement("div"); bk.className = "bk";
      var l = T.CUTS[b] / TOTE * IW, w = (T.CUTS[b + 1] - T.CUTS[b]) / TOTE * IW;
      bk.style.left = px(l); bk.style.width = px(w + 0.6); bk.style.fontSize = (w > 30 ? 28 : 20) + "px";
      if (b === 0) bk.style.borderRadius = "16px 0 0 16px";
      if (b === 20) bk.style.borderRadius = "0 16px 16px 0";
      var tk = T.TAKES[b]; bk.style.background = { 1: "#d6336c", 2: "#3a6fe0", 3: "#e0952c" }[tk]; bk.style.color = tk === 3 ? INK : "#fff";
      bk.fl = document.createElement("b"); bk.appendChild(bk.fl);
      var lab = document.createElement("span"); lab.style.position = "relative"; lab.textContent = w > 18 ? String(tk) : ""; bk.appendChild(lab);
      $["e-bar"].appendChild(bk); $.blocks.push(bk);
    }
    for (var kk = 0; kk * P <= TOTE; kk++) {
      var tx = kk * P, down = Math.abs(((tx + 0.0837) / (4 * P)) - Math.round((tx + 0.0837) / (4 * P))) < 0.02;
      var tick = document.createElement("i");
      tick.style.cssText = "position:absolute;bottom:0;border-radius:2px;background:#0a0d14;left:" + px(4 + tx / TOTE * IW) + ";width:" + (down ? 3 : 2) + "px;height:" + (down ? 22 : 11) + "px;opacity:" + (down ? 0.85 : 0.45);
      $["e-ruler"].appendChild(tick);
    }
    // the voice, word by word: [line, first word, last word, top, accents, line break before word k]
    var CH = [
      { line: 0, a: 0, b: 7, top: 880, ac: [6], br: [5], end: S.s2 - 0.02 },
      { line: 1, a: 0, b: 4, top: 1180, ac: [3], end: S.s3 - 0.04 },
      { line: 2, a: 0, b: 5, top: 1210, ac: [4, 5], end: S.s4 - 0.04 },
      { line: 4, a: 0, b: 6, top: 1250, ac: [5, 6], br: [4], end: S.s6 - 0.04 },
      { line: 6, a: 0, b: 7, top: 1250, ac: [4, 5], end: S.merge - 0.04 },
      { line: 6, a: 8, b: 13, top: 250, ac: [8, 12, 13], end: S.pay - 0.04 },
      { line: 7, a: 0, b: 5, top: 800, ac: [5], br: [3], end: S.s10 - 0.04 },
    ];
    $.caps2 = CH.map(function (c) {
      var el = document.createElement("div"); el.className = "capc"; el.style.top = c.top + "px";
      var html = [], ts = [];
      for (var k = c.a; k <= c.b; k++) {
        if (c.br && c.br.indexOf(k) >= 0) html.push("<br>");
        html.push('<span class="w' + (c.ac.indexOf(k) >= 0 ? " ac" : "") + '">' + T.VW[c.line][k][0] + "</span>");
        ts.push(W(c.line, k));
      }
      el.innerHTML = html.join(" ");
      $.caps.appendChild(el);
      if (c.line === 0 && c.a === 0) { ts[0] = -0.3; ts[1] = Math.min(ts[1], -0.1); }   // the hook: its first words are there on the first frame
      return { el: el, spans: el.querySelectorAll(".w"), ts: ts, a: ts[0] - 0.02, b: c.end };
    });
    $.every = $.caps2[6].spans[$.caps2[6].spans.length - 1];
    $.every.style.margin = "0.24em 0 0 0.42em";   // room for the circle: from "it" on the left, from "song." above
  }

  // sizes that need the fonts: the pills, the circle around "everywhere"
  function fit() {
    if ($.fitted) return true;
    if (document.fonts && document.fonts.check && (!document.fonts.check('56px "Lilita One"') || !document.fonts.check('600 62px "Rubik"'))) return false;
    $.pills.forEach(function (p) {
      p.w = p.el.offsetWidth; p.h = p.el.offsetHeight;
      p.ice.setAttribute("width", p.w.toFixed(0));
      p.ice.innerHTML = '<g transform="translate(' + (p.w / 2 - 5).toFixed(1) + ',0)"><path class="icp" fill="#d6ecff" stroke="#0a0d14" stroke-width="4" stroke-linejoin="round"/></g>';
      p.icp = p.ice.querySelector(".icp");
    });
    // the hand-drawn ring around "everywhere" (layout position: transforms do not move offsets)
    var e = $.every, x = e.offsetLeft + e.parentNode.offsetLeft, y = e.offsetTop + e.parentNode.offsetTop, w = e.offsetWidth, h = e.offsetHeight;
    var cx = x + w / 2, cy = y + h * 0.55, rx = w / 2 + 36, ry = h * 0.5 + 4, pts = [];
    for (var i = 0; i <= 64; i++) {   // starts on the right and ends past it, where there is no other word
      var a = (-25 + 385 * i / 64) * Math.PI / 180, k = 1 + 0.05 * Math.sin(i / 64 * 5.1) - 0.04 * i / 64;
      var px0 = rx * k * Math.cos(a), py0 = ry * k * Math.sin(a), tl = -4 * Math.PI / 180;
      pts.push([cx + px0 * Math.cos(tl) - py0 * Math.sin(tl), cy + px0 * Math.sin(tl) + py0 * Math.cos(tl)]);
    }
    $.circ.setAttribute("d", "M" + pts.map(function (p) { return p[0].toFixed(1) + " " + p[1].toFixed(1); }).join(" L"));
    $.circLen = $.circ.getTotalLength ? $.circ.getTotalLength() : 2 * Math.PI * (rx + ry) / 2 * 1.07;
    $.circ.style.strokeDasharray = $.circLen.toFixed(1);
    $.fitted = true;
    return true;
  }

  function render(t) {
    if (!R0) return;
    if (t < 0) t = 0; if (t > TOTAL) t = TOTAL;
    drawLight(t);
    var ok = fit();
    // ----------------------------------------------------------- s1 the hook: notes around the words
    var nOut = eIn((t - S.s2) / 0.2);
    $.notes2.forEach(function (n, i) {
      var q = t - n.t0;
      if (q < 0 || nOut >= 1) { vis(n.el, false); return; }
      var k = spr(q, 12, 0.6);
      fx(n.el, sat(q / 0.1) * (1 - nOut), 6 * nOut);
      n.el.style.transform = "translate3d(" + px(n.x + 10 * Math.sin(t * 1.3 + i)) + "," + px(n.y - 30 * (1 - k) + 12 * Math.cos(t * 1.1 + 2 * i) - 40 * nOut) + ",0) rotate(" + (n.r + 6 * Math.sin(t * 1.7 + i)).toFixed(2) + "deg) scale(" + (0.5 + 0.5 * k).toFixed(3) + ")";
    });
    // ----------------------------------------------------------- s2 the feed: three times the same snippet
    card($["c-feed"], S.s2, S.s3 - 0.02, t);
    $.tagEls.forEach(function (g) { pop(g.el, [S.tag1, S.tag2, S.tag3][g.j] + 0.05 * g.i, t, 17); });
    // ----------------------------------------------------------- s3 it scrolls right past
    card($["c-phone"], S.s3, S.s4 - 0.02, t, { rx: 24, ry: 22 });
    var sw = eIO((t - S.swipe + 0.02) / 0.52), vel = bump((t - S.swipe + 0.02) / 0.52);
    $.feedlist.style.transform = "translate3d(0," + px(-792 * 3 * sw) + ",0)";
    $.feedlist.style.filter = vel > 0.05 ? "blur(" + (vel * 5).toFixed(2) + "px)" : "none";
    var cOn = t > S.s3 + 0.15 && t < S.s4 - 0.05;
    if (cOn) {
      var cp = eIO((t - S.swipe + 0.06) / 0.48), cin = eOut((t - S.s3 - 0.15) / 0.35), press = t > S.swipe - 0.06 && t < S.swipe + 0.44 ? 1 : 0;
      var cx = 760 + 160 * (1 - cin), cy = mix(1110, 560, cp) + 120 * (1 - cin);
      vis($.cursor, true); $.cursor.style.opacity = (1 - eIn((t - S.s4 + 0.3) / 0.25)).toFixed(3);
      $.cursor.style.transform = "translate3d(" + px(cx - 6) + "," + px(cy - 4) + ",40px) scale(" + (1 - 0.14 * press).toFixed(3) + ")";
    } else vis($.cursor, false);
    // ----------------------------------------------------------- s4 flat views, no replays, no shares
    card($["c-stats"], S.s4, S.s5 - 0.02, t);
    $["s-line"].style.strokeDashoffset = ($.lineLen * (1 - eIO((t - S.s4 - 0.25) / 0.75))).toFixed(1);
    pop($["s-rep"], S.rep0, t, 15); pop($["s-sha"], S.sha0, t, 15);
    // ----------------------------------------------------------- s5 one snippet goes up: built differently (the drop)
    card($["c-chart"], S.s5, S.s6 - 0.02, t, { rx: 22, ry: 28 });
    $.dotEls.forEach(function (d) { var q = t - S.s5 - d.t0, k = spr(q, 16, 0.55); d.el.setAttribute("opacity", (q < 0 ? 0 : sat(q / 0.06)).toFixed(3)); d.el.setAttribute("transform-origin", d.el.getAttribute("cx") + " " + d.el.getAttribute("cy")); d.el.setAttribute("transform", "scale(" + (q < 0 ? 0 : 0.4 + 0.6 * k).toFixed(3) + ")"); });
    var lp = eIO((t - S.launch) / (S.drop - S.launch)), x0 = 380, y0 = 646, x1 = 676, y1 = 176;
    var bx = mix(x0, x1, lp) - 60 * bump(lp), by = mix(y0, y1, Math.pow(lp, 0.85));
    var on5 = t > S.launch - 0.25;
    $["ch-dot"].setAttribute("cx", bx.toFixed(1)); $["ch-dot"].setAttribute("cy", by.toFixed(1)); $["ch-dot"].setAttribute("opacity", on5 ? sat((t - S.launch + 0.25) / 0.1).toFixed(3) : "0");
    $["ch-trail"].setAttribute("d", lp > 0.001 ? "M" + x0 + " " + y0 + " Q " + (mix(x0, x1, 0.25) - 50).toFixed(1) + " " + mix(y0, y1, 0.45).toFixed(1) + " " + bx.toFixed(1) + " " + by.toFixed(1) : "");
    var rq = t - S.drop;
    $["ch-ring"].setAttribute("cx", x1); $["ch-ring"].setAttribute("cy", y1);
    $["ch-ring"].setAttribute("r", (20 + 70 * eOut(rq / 0.6)).toFixed(1)); $["ch-ring"].setAttribute("opacity", rq > 0 ? (0.8 * (1 - sat(rq / 0.6))).toFixed(3) : "0");
    var lk = rq > 0 ? spr(rq, 15, 0.55) : 0;
    vis($["ch-lab"], rq > 0 && t <= S.s6 - 0.02 + 0.24); $["ch-lab"].style.opacity = sat(rq / 0.06).toFixed(3);   // a visible child shows through a hidden card: bound it to the card
    $["ch-lab"].style.transform = "translate3d(" + px(x1 - 160) + "," + px(y1 - 118) + ",0) scale(" + (0.4 + 0.6 * lk).toFixed(4) + ")";
    // ----------------------------------------------------------- s6 the three things, in Stalak's own style; s7 they fly into Stalak
    var punch = 0, bn = Math.floor(t / P + 1e-6);
    for (var bb = bn - 2; bb <= bn; bb++) { var dtb = t - B(bb); if (dtb >= 0 && B(bb) >= S.drop - 1e-6) punch += 0.035 * Math.exp(-dtb / 0.11); }
    if (ok) $.pills.forEach(function (p, i) {
      var q = t - p.t0;
      if (q < 0 || t > S.merge + 0.45) { vis(p.el, false); return; }
      var k = spr(q, 15, 0.58), mq = t - S.merge - 0.05 * i, m = eIO(mq / 0.3);
      var x = mix(p.cx, 540, m), y = mix(p.cy, 910, m) + 40 * (1 - k), sc = (0.35 + 0.65 * k) * (1 - 0.85 * m) * (1 + punch), rot = -8 * (1 - k) + 25 * m * (i % 2 ? -1 : 1);
      fx(p.el, sat(q / 0.06) * (1 - sat((mq - 0.2) / 0.1)), 6 * m);
      p.el.style.transform = "translate3d(" + px(x - p.w / 2) + "," + px(y - p.h / 2) + ",0) rotate(" + rot.toFixed(2) + "deg) scale(" + sc.toFixed(4) + ")";
      p.icp.setAttribute("d", iciclesPath(p.w, 59, eOut((q - 0.15) / 0.45), i + 1));
    });
    // the icon: it pops where the three met, then opens into the real edit
    var iq = t - S.merge - 0.1, ie = eIn((t - S.edit) / 0.16);
    if (iq > 0 && ie < 1) {
      var ik = spr(iq, 12, 0.5);
      vis($.icon, true); $.icon.style.opacity = (sat(iq / 0.05) * (1 - ie)).toFixed(3);
      $.icon.style.transform = "translate3d(0," + px(14 * Math.sin(t * 2.2)) + ",0) rotate(" + (-14 * (1 - ik)).toFixed(2) + "deg) scale(" + ((0.2 + 0.8 * ik) * (1 + 0.9 * ie) * (1 + punch)).toFixed(4) + ")";
    } else vis($.icon, false);
    var eq = t - S.edit, ex = eIn((t - S.pay) / 0.14);
    if (eq > 0 && ex < 1) {
      var ek = spr(eq, 12, 0.78);
      $["c-edit"].style.transformOrigin = "450px 390px";
      fx($["c-edit"], sat(eq / 0.08) * (1 - ex), (1 - sat(eq / 0.2)) * 10);
      $["c-edit"].style.transform = "rotateX(" + (1.2 * Math.sin(6.2832 * t / 5.3)).toFixed(3) + "deg) rotateY(" + (2 * Math.sin(6.2832 * t / 6.7)).toFixed(3) + "deg) scale(" + ((0.33 + 0.67 * ek) * (1 + 0.5 * punch)).toFixed(4) + ")";
      for (var kb = 0; kb < 21; kb++) {
        var bk = $.blocks[kb], tl = S.edit + 0.1 + 0.055 * kb, e2 = spr(t - tl, 18, 0.62);
        bk.style.opacity = sat((t - tl) / 0.04).toFixed(3);
        bk.style.transform = "translateY(" + px(-50 * (1 - e2)) + ") scale(" + (1.2 - 0.2 * e2).toFixed(4) + ")";
        bk.fl.style.opacity = decay(t, tl, 0.1).toFixed(3);
      }
      $["e-ph"].style.left = px(46 + 4 + Math.max(0, t + T.tk0) / T.CUTS[21] * 788 - 3);
    } else vis($["c-edit"], false);
    // ----------------------------------------------------------- s8 his snippet, out of the preview, full of life (his song)
    var pq = t - S.pay, pe = eIn((t - S.payEnd) / 0.22);
    if (pq >= 0 && pe < 1) {
      var pk = spr(pq, 13, 0.78), sc8 = mix(0.487, 1, pk);
      vis($["c-pay"], true); $["c-pay"].style.opacity = (1 - pe).toFixed(3);
      $["c-pay"].style.filter = pe > 0.01 ? "blur(" + (12 * pe).toFixed(2) + "px)" : "none";
      $["c-pay"].style.transform = "translate3d(" + px(-6 * (1 - pk)) + "," + px(-83 * (1 - pk) - 40 * pe) + ",0) rotateY(" + (35 * pe).toFixed(2) + "deg) scale(" + (sc8 * (1 - 0.2 * pe) * (1 + 0.6 * punch)).toFixed(4) + ")";
      var cq = t - T.payCap;
      vis($["p-cap"], cq > 0 && pe < 0.5); $["p-cap"].style.opacity = sat(cq / 0.06).toFixed(3);
      $["p-cap"].style.transform = "scale(" + (0.6 + 0.4 * spr(cq, 16, 0.55)).toFixed(4) + ")";
    } else { vis($["c-pay"], false); vis($["p-cap"], false); }
    // ----------------------------------------------------------- s10 the logo and the address
    var lq = t - S.s10;
    if (lq > 0) {
      var lk2 = spr(lq, 11, 0.62);
      fx($["end-wm"], sat(lq / 0.08), (1 - sat(lq / 0.22)) * 10);
      $["end-wm"].style.transform = "translate3d(0," + px(26 * (1 - lk2) + 6 * Math.sin(t * 1.6)) + ",0) scale(" + (0.85 + 0.15 * lk2).toFixed(4) + ")";
    } else vis($["end-wm"], false);
    var url = "stalak.app", nt = Math.floor(sat((t - S.url) / 0.32) * url.length + 0.0001);
    $["end-url"].textContent = url.slice(0, nt);
    // ----------------------------------------------------------- the voice, word by word
    $.caps2.forEach(function (C) {
      if (t < C.a || t > C.b + 0.16) { vis(C.el, false); return; }
      var cout = eIn((t - C.b) / 0.14);
      fx(C.el, 1 - cout, 8 * cout);
      C.el.style.transform = "translate3d(0," + px(-24 * cout) + ",0)";
      for (var j = 0; j < C.spans.length; j++) {
        var qw = t - C.ts[j], sp = C.spans[j];
        if (qw < 0) { sp.style.opacity = "0"; continue; }
        var kc = spr(qw, 17, 0.62), bl = (1 - sat(qw / 0.16)) * 8;
        sp.style.opacity = sat(qw / 0.07).toFixed(3);
        sp.style.filter = bl > 0.05 ? "blur(" + bl.toFixed(2) + "px)" : "none";
        sp.style.transform = "translateY(" + px(26 * (1 - kc)) + ")" + (sp.className.indexOf("ac") >= 0 ? " scale(" + (0.7 + 0.3 * kc).toFixed(4) + ")" : "");
      }
    });
    // "everywhere": circled by hand
    var gq = t - S.every - 0.12, gOut = eIn((t - S.s10 + 0.04) / 0.14);   // once the word has landed
    if (ok && gq > 0 && gOut < 1) {
      vis($.circle, true); $.circle.style.opacity = (1 - gOut).toFixed(3);
      $.circ.style.strokeDashoffset = ($.circLen * (1 - eIO(gq / 0.38))).toFixed(1);
    } else vis($.circle, false);
  }

  window.LESSON = { init: init, render: render };
})();
