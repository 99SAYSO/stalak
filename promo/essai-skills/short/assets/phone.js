/* Take One trial (06/11): « show the real product ». In the Short, the app cards redrawn in code (the song, the takes, the edit)
   give way to the real Stalak app on a phone: screenshots of the real app driven with his song and takes (capture_app.py), and in
   the edit screen the real export of that edit playing in the preview. Every style below is a pure function of t (seconds).
   Rects come from the app's own layout (CSS px of a 412 px wide phone, capture.json), scaled to the phone's screen. */
(function () {
  var S = window.T.S, SW = 560, K = SW / 412;       // screen px per app CSS px
  var SH = Math.round(839 * K);                      // the screen (the phone's viewport: 412 x 839 CSS px)
  // the phone body on the 1080 x 1920 frame (the screen sits 22 px inside): under the captions (two lines reach ~400 px),
  // and the cut bar stays above the bottom 20 % that TikTok / Instagram cover
  var BODY = { x: Math.round((1080 - SW - 44) / 2), y: 430, w: SW + 44, h: SH + 44 };
  var SCR = { x: BODY.x + 22, y: BODY.y + 22 };
  var R = {                                           // app rects (CSS px) at each screenshot
    drop: [43, 521.9, 326, 168.1], meta: [43, 615.4, 326, 20.9], imp: [43, 356.9, 326, 117.8],
    list: [43, 639.3, 326, 275.8], view: [125.8, 227.8, 160.5, 285.3], bar: [43, 708.1, 326, 82]
  };
  var EDIT_DUR = 6.12, CUTS = [0, 1.528, 3.056, 4.584];   // the real edit (4 bars, one cut per bar)
  var $ = {};
  function sat(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function mix(a, b, k) { return a + (b - a) * k; }
  function p3o(x) { x = sat(x); return 1 - Math.pow(1 - x, 3); }
  function p2io(x) { x = sat(x); return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; }
  function p2i(x) { x = sat(x); return x * x; }
  function px(n) { return n.toFixed(2) + "px"; }
  function op(e, a) { e.style.opacity = a.toFixed(3); e.style.visibility = a > 0.002 ? "visible" : "hidden"; }
  function rc(r) { return [r[0] * K, r[1] * K, r[2] * K, r[3] * K]; }   // app CSS rect -> screen px
  // the screen moments
  var A = S.s8 - 0.2, Z = S.pay;                     // the phone is on screen from A to Z (a cut to the payoff on its beat)
  var TL = [                                         // [from, screen]
    [-1, "home"], [S.land + 0.06, "song"], [S.s9 + 0.05, "takes0"], [S.takesIn + 0.45, "takes"], [S.toEdit + 0.02, "edit"]];
  // the camera on the phone: [t, scale, focus x, focus y] (focus = frame point that the zoom keeps still: the phone's top,
  // so a zoom never pushes it up under the captions)
  var TOP = BODY.y;
  var CAM = [[A, 1, 540, TOP], [S.land + 0.1, 1, 540, TOP], [S.land + 0.55, 1.15, 540, TOP], [S.s9 - 0.05, 1.15, 540, TOP], [S.s9 + 0.35, 1, 540, TOP],
             [S.align - 0.05, 1, 540, TOP], [S.align + 0.75, 1.08, 540, TOP], [S.toEdit - 0.08, 1.08, 540, TOP], [S.toEdit + 0.25, 1, 540, TOP]];

  function el(tag, css, parent, html) { var e = document.createElement(tag); if (css) e.style.cssText = css; if (html) e.innerHTML = html; if (parent) parent.appendChild(e); return e; }

  function init(root) {
    $.board = root.querySelector("#board"); $.pp0 = root.querySelector("#pp0");
    $.ph = root.querySelector("#phone"); $.cam = root.querySelector("#ph-cam"); $.content = root.querySelector("#ph-content");
    $.shots = {}; ["home", "song", "takes0", "takes", "edit"].forEach(function (k) { $.shots[k] = root.querySelector("#ph-" + k); });
    $.pv = root.querySelector("#ph-pv"); $.head = root.querySelector("#ph-head");
    $.chip = root.querySelector("#ph-chip"); $.ring = root.querySelector("#ph-ring");
    $.minis = Array.prototype.slice.call(root.querySelectorAll(".ph-mini"));
    $.rows = Array.prototype.slice.call(root.querySelectorAll(".ph-row"));
    var v = rc(R.view); $.pv.style.cssText += ";left:" + px(v[0]) + ";top:" + px(v[1]) + ";width:" + px(v[2]) + ";height:" + px(v[3]);
  }

  function track(t) {                                 // camera keys, eased between
    var i = 0; while (i < CAM.length - 1 && t >= CAM[i + 1][0]) i++;
    var a = CAM[i], b = CAM[Math.min(i + 1, CAM.length - 1)];
    var k = b === a ? 0 : p2io((t - a[0]) / (b[0] - a[0]));
    return { s: mix(a[1], b[1], k), fx: mix(a[2], b[2], k), fy: mix(a[3], b[3], k) };
  }

  function render(t) {
    var on = t > A && t < Z + 0.05;
    if ($.board && t > S.s8 - 0.25 && t < S.pay + 0.1) op($.board, 0);   // the redrawn cards are not shown any more
    if (!on) { op($.ph, 0); return; }
    // in: the phone rises into the sky. Out: the camera dives into the preview until it sits exactly where the payoff panel
    // appears (#pp0: 850 x 1511, centre 540 x 1005, entering at scale 0.6 and 120 px lower), then grows with it while the panel
    // fades in on top: a match cut from the app's preview to the full video
    var rise = p3o((t - A) / 0.55);
    var c = track(t);
    var v = rc(R.view), pvx = SCR.x + v[0] + v[2] / 2, pvy = SCR.y + v[1] + v[3] / 2;
    var sc = c.s, ox = c.fx - c.s * c.fx, oy = c.fy - c.s * c.fy + 900 * (1 - rise);       // camera: p -> sc * p + o
    var D0 = S.pay - 0.75, D1 = S.pay - 0.3;
    if (t > D0) {
      var pk = t > D1 ? p3o((t - D1) / 0.45) : 0, tw = (0.6 + 0.4 * pk) * 850 / v[2], tcy = 1005.5 + 120 * (1 - pk);
      var w = t > D1 ? 1 : p2io((t - D0) / (D1 - D0));
      sc = mix(sc, tw, w); ox = mix(ox, 540 - tw * pvx, w); oy = mix(oy, tcy - tw * pvy, w);
    }
    op($.ph, t < Z ? sat((t - A) / 0.12) : 0);
    // the payoff panel shows only from the cut, in the phone's preview rect (opacity only: its visibility stays the engine's,
    // or its border and his lyric, which inherit it, would stay hidden)
    if ($.pp0 && t > S.pay - 0.4 && t < Z) $.pp0.style.opacity = "0";
    var rcx = 540, rcy = BODY.y + BODY.h / 2;          // the rise's small turn, about the phone's centre
    $.cam.style.transform = "translate3d(" + px(ox) + "," + px(oy) + ",0) scale(" + sc.toFixed(4) + ") translate3d(" + px(rcx) + "," + px(rcy) + ",0) rotate(" + (-5 * (1 - rise)).toFixed(2) + "deg) translate3d(" + px(-rcx) + "," + px(-rcy) + ",0)";
    // which screen (a quick cross-fade, like the app's own step change)
    var cur = TL[0][1], prev = null, since = 99;
    TL.forEach(function (x, i) { if (t >= x[0]) { prev = i > 0 ? TL[i - 1][1] : null; cur = x[1]; since = t - x[0]; } });
    Object.keys($.shots).forEach(function (k) { op($.shots[k], k === cur ? 1 : (k === prev && since < 0.12 ? 1 - since / 0.12 : 0)); });
    // the takes screen scrolls down to the third take while Stalak lines them up
    var scroll = cur === "takes" ? 211 * K * p2io((t - S.align) / 0.8) : 0;
    $.shots.takes.style.transform = "translate3d(0," + px(-scroll) + ",0)";
    // 1. the song falls into "Import your music"; a tap
    var d = rc(R.drop), dx = SCR.x + d[0] + d[2] / 2, dy = SCR.y + d[1] + d[3] / 2;
    // (it shows up while the line starts, so its name can be read: about 1 s on screen)
    var c0 = S.s8 - 0.15, fq = (t - S.songDrop) / (S.land - S.songDrop);
    if (t > c0 && t < S.land + 0.32) {
      var hov = p3o((t - c0) / 0.3);
      op($.chip, sat((t - c0) / 0.1) * (1 - sat((t - S.land - 0.12) / 0.2)));
      $.chip.style.transform = "translate3d(" + px(dx - 200) + "," + px(mix(dy - 520 - 60 * (1 - hov), dy - 52, p2i(fq))) + ",0) rotate(" + mix(-8, 0, sat(fq)).toFixed(2) + "deg) scale(" + (1 - 0.08 * sat((t - S.land) / 0.12)).toFixed(4) + ")";
    } else op($.chip, 0);
    // 2. three takes fall into "Import my videos" (they land on the pops), then a tap
    var im = rc(R.imp), ix = SCR.x + im[0] + im[2] / 2, iy = SCR.y + im[1] + im[3] / 2;
    $.minis.forEach(function (m, i) {
      var t0 = S.takesIn - 0.17 + 0.12 * i, q = (t - t0) / 0.25;
      if (q > 0 && t < S.takesIn + 0.5) {
        op(m, sat(q / 0.2) * (1 - sat((t - S.takesIn - 0.36) / 0.12)));
        m.style.transform = "translate3d(" + px(ix - 66 + (i - 1) * 120) + "," + px(mix(iy - 700, iy - 118, p2i(q))) + ",0) rotate(" + ((i - 1) * 7 * (1 - 0.6 * sat(q))).toFixed(2) + "deg)";
      } else op(m, 0);
    });
    // taps: on "Import your music" when the song lands, on "Import my videos" after the takes
    var taps = [[S.land, dx, dy], [S.takesIn + 0.42, ix, iy]], tp = null;
    taps.forEach(function (x) { if (t >= x[0] && t < x[0] + 0.4) tp = x; });
    if (tp) { var q2 = (t - tp[0]) / 0.4; op($.ring, 1 - q2); $.ring.style.transform = "translate3d(" + px(tp[1] - 60) + "," + px(tp[2] - 60) + ",0) scale(" + (0.55 + 0.8 * p3o(q2)).toFixed(4) + ")"; }
    else op($.ring, 0);
    // 3. each take's row lights up as it is synced (the three soft clicks, then the chime)
    $.rows.forEach(function (r, i) {
      var t0 = S.synced - 0.45 + 0.12 * i, q = t - t0;
      op(r, cur === "takes" && q > 0 ? Math.min(1, q / 0.06) * (0.55 + 0.45 * Math.exp(-q / 0.25)) : 0);
    });
    // 4. the edit: the real export plays in the preview; the play head runs over the real cut bar
    if (cur === "edit") {
      var e = Math.max(0, t - S.toEdit), b = rc(R.bar);
      op($.head, 1); $.head.style.transform = "translate3d(" + px(b[0] + 12 + (b[2] - 24) * Math.min(1, e / EDIT_DUR) - 3) + "," + px(b[1] - 4) + ",0)";
    } else op($.head, 0);
  }
  window.PH = { init: init, render: render, A: A, Z: Z, CUTS: CUTS };
})();
