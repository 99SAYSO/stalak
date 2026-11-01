/* Promo v8 « The Snippet Machine » — the render engine. Every pixel is a pure function of t (seconds).
   A small orthographic 3D engine on a 2D canvas: an isometric camera (yaw 45°, pitch 35.26°) that can turn and dive,
   faces filled from two colours by their angle to the light, the app's ink outlines, decals drawn in each face's own
   plane (screens, labels, the song's waveform), icicles, contact shadows, puffs and snow.
   The machine edits his snippet on his beat. window.T comes from times.js (build.py). */
(function () {
  "use strict";
  var T = window.T, P = T.P, TOTAL = T.TOTAL, TAKES = T.TAKES, WAVE = T.WAVE;
  function B(b) { return b * P; }
  var D2R = Math.PI / 180, ISO = Math.atan(1 / Math.SQRT2) / D2R;
  function sat(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function mix(a, b, k) { return a + (b - a) * k; }
  function eOut(x) { x = sat(x); return 1 - Math.pow(1 - x, 3); }
  function eIn(x) { x = sat(x); return x * x * x; }
  function eIO(x) { x = sat(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function eBack(x) { x = sat(x); var c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); }
  function bump(x) { return x <= 0 || x >= 1 ? 0 : Math.sin(Math.PI * x); }
  function decay(t, a, tau) { return t < a ? 0 : Math.exp(-(t - a) / tau); }
  function spr(t, w, z) {
    if (t <= 0) return 0;
    var wd = w * Math.sqrt(1 - z * z);
    return 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + (z * w / wd) * Math.sin(wd * t));
  }
  function hash(i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
  function px(n) { return n.toFixed(2) + "px"; }
  function vis(el, on) { el.style.visibility = on ? "visible" : "hidden"; }

  // ------------------------------------------------------------ colours: each material is [lit, shade]
  function hx(h) { return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]; }
  function mixc(a, b, k) { return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k]; }
  function rgb(c) { return "rgb(" + (c[0] | 0) + "," + (c[1] | 0) + "," + (c[2] | 0) + ")"; }
  var INK = "#0a0d14", WHITE = [255, 255, 255];
  var M = {
    SNOW: [hx("#ffffff"), hx("#9fc8f2")], ICE: [hx("#eef8ff"), hx("#7fb7ee")], BLUE: [hx("#3d91f3"), hx("#1550aa")],
    DEEP: [hx("#3a4e74"), hx("#152036")], INK: [hx("#30394b"), hx("#0a0d14")], METAL: [hx("#fbfdff"), hx("#93abc6")],
    T1: [hx("#f45c94"), hx("#a3204f")], T2: [hx("#6a97f5"), hx("#2347a6")], T3: [hx("#f8b955"), hx("#b06a12")],
    PAD: [hx("#ff7fb7"), hx("#b23a72")], LCD: [hx("#15213a"), hx("#0b1020")], PINE: [hx("#f2faff"), hx("#86b8ea")]
  };
  var TK = { 1: M.T1, 2: M.T2, 3: M.T3 }, TKH = { 1: "#d6336c", 2: "#3a6fe0", 3: "#e0952c" };
  var L = (function () { var v = [-0.35, 1, 0.6], n = Math.hypot(v[0], v[1], v[2]); return [v[0] / n, v[1] / n, v[2] / n]; })();

  // ------------------------------------------------------------ the camera (orthographic)
  var C = { shx: 0, shy: 0 };
  function cam(tx, ty, tz, s, yaw, pitch, cx, cy) {
    C.tx = tx; C.ty = ty; C.tz = tz; C.s = s; C.cx = cx; C.cy = cy; C.yaw = yaw; C.pitch = pitch;
    C.cyw = Math.cos(yaw * D2R); C.syw = Math.sin(yaw * D2R); C.cp = Math.cos(pitch * D2R); C.sp = Math.sin(pitch * D2R);
    C.v = [C.syw * C.cp, C.sp, C.cyw * C.cp];
  }
  function P3(x, y, z) {
    x -= C.tx; y -= C.ty; z -= C.tz;
    var x1 = x * C.cyw - z * C.syw, z1 = x * C.syw + z * C.cyw;
    return [C.cx + C.s * x1 + C.shx, C.cy - C.s * (y * C.cp - z1 * C.sp) + C.shy, z1 * C.cp + y * C.sp];
  }
  function LV(x, y, z) { var x1 = x * C.cyw - z * C.syw, z1 = x * C.syw + z * C.cyw; return [C.s * x1, -C.s * (y * C.cp - z1 * C.sp)]; }

  // ------------------------------------------------------------ objects: faces in local space, a transform each frame
  function Obj(faces, o) {
    o = o || {};
    this.f = faces; this.pos = (o.pos || [0, 0, 0]).slice(); this.base = this.pos.slice(); this.rot = [0, 0, o.rz || 0]; if (o.ry) this.rot[1] = o.ry;
    this.piv = o.piv || [0, 0, 0]; this.sc = [1, 1, 1]; this.on = true; this.sh = o.sh !== false; this.alpha = 1; this.hull = !!o.hull;
    this.sink = o.sink === undefined ? 64 : o.sink; this.tint = null; this.name = o.name || "";
    var s = [0, 0, 0], n = 0; faces.forEach(function (f) { f.p.forEach(function (p) { s[0] += p[0]; s[1] += p[1]; s[2] += p[2]; n++; }); });
    this.ctr = o.ctr || [s[0] / n, s[1] / n, s[2] / n]; this.dz = o.dz || 0;
  }
  function prep(o) {
    var rx = o.rot[0], ry = o.rot[1], rz = o.rot[2];
    var cx = Math.cos(rx), sx = Math.sin(rx), cy = Math.cos(ry), sy = Math.sin(ry), cz = Math.cos(rz), sz = Math.sin(rz);
    o.R = [cy * cz + sy * sx * sz, -cy * sz + sy * sx * cz, sy * cx, cx * sz, cx * cz, -sx, -sy * cz + cy * sx * sz, sy * sz + cy * sx * cz, cy * cx];
  }
  function W(o, p) {
    var R = o.R, x = (p[0] - o.piv[0]) * o.sc[0], y = (p[1] - o.piv[1]) * o.sc[1], z = (p[2] - o.piv[2]) * o.sc[2];
    return [o.pos[0] + o.piv[0] + R[0] * x + R[1] * y + R[2] * z, o.pos[1] + o.piv[1] + R[3] * x + R[4] * y + R[5] * z, o.pos[2] + o.piv[2] + R[6] * x + R[7] * y + R[8] * z];
  }
  function WV(o, v) { var R = o.R, x = v[0] * o.sc[0], y = v[1] * o.sc[1], z = v[2] * o.sc[2]; return [R[0] * x + R[1] * y + R[2] * z, R[3] * x + R[4] * y + R[5] * z, R[6] * x + R[7] * y + R[8] * z]; }
  function WN(o, n) { var R = o.R; return [R[0] * n[0] + R[1] * n[1] + R[2] * n[2], R[3] * n[0] + R[4] * n[1] + R[5] * n[2], R[6] * n[0] + R[7] * n[1] + R[8] * n[2]]; }

  // ------------------------------------------------------------ shapes
  function boxF(w, h, d, m, o) {
    o = o || {}; var ms = o.mats || {}, x0 = -w / 2, x1 = w / 2, y0 = 0, y1 = h, z0 = -d / 2, z1 = d / 2;
    function mm(k) { return ms[k] || m; }
    return [
      { p: [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], n: [0, 1, 0], m: mm("top"), plane: [[x0, y1, z0], [1, 0, 0], [0, 0, 1]], W: w, H: d, key: "top" },
      { p: [[x0, y1, z1], [x1, y1, z1], [x1, y0, z1], [x0, y0, z1]], n: [0, 0, 1], m: mm("front"), plane: [[x0, y1, z1], [1, 0, 0], [0, -1, 0]], W: w, H: h, key: "front" },
      { p: [[x1, y1, z1], [x1, y1, z0], [x1, y0, z0], [x1, y0, z1]], n: [1, 0, 0], m: mm("right"), plane: [[x1, y1, z1], [0, 0, -1], [0, -1, 0]], W: d, H: h, key: "right" },
      { p: [[x0, y1, z0], [x0, y1, z1], [x0, y0, z1], [x0, y0, z0]], n: [-1, 0, 0], m: mm("left"), plane: [[x0, y1, z0], [0, 0, 1], [0, -1, 0]], W: d, H: h, key: "left" },
      { p: [[x1, y1, z0], [x0, y1, z0], [x0, y0, z0], [x1, y0, z0]], n: [0, 0, -1], m: mm("back"), plane: [[x1, y1, z0], [-1, 0, 0], [0, -1, 0]], W: w, H: h, key: "back" },
      { p: [[x0, y0, z1], [x1, y0, z1], [x1, y0, z0], [x0, y0, z0]], n: [0, -1, 0], m: mm("bottom"), key: "bottom" }
    ];
  }
  function key(F, k) { for (var i = 0; i < F.length; i++) if (F[i].key === k) return F[i]; return null; }
  function cylF(r, h, n, m, o) {
    o = o || {}; var F = [], top = [], bot = [], i;
    for (i = 0; i < n; i++) { var a = 2 * Math.PI * i / n; top.push([r * Math.cos(a), h, r * Math.sin(a)]); bot.push([r * Math.cos(a), 0, r * Math.sin(a)]); }
    for (i = 0; i < n; i++) { var j = (i + 1) % n, am = 2 * Math.PI * (i + 0.5) / n; F.push({ p: [top[i], top[j], bot[j], bot[i]], n: [Math.cos(am), 0, Math.sin(am)], m: o.side || m, ns: true }); }
    F.push({ p: top.slice().reverse(), n: [0, 1, 0], m: o.top || m, plane: [[-r, h, -r], [1, 0, 0], [0, 0, 1]], W: 2 * r, H: 2 * r, key: "top" });
    F.push({ p: bot.slice(), n: [0, -1, 0], m: o.side || m, key: "bottom", ns: true });
    return F;
  }
  function coneF(r, h, n, m, y0) {
    var F = [], base = [], i; y0 = y0 || 0;
    for (i = 0; i < n; i++) { var a = 2 * Math.PI * i / n; base.push([r * Math.cos(a), y0, r * Math.sin(a)]); }
    var k = r / h;
    for (i = 0; i < n; i++) { var j = (i + 1) % n, am = 2 * Math.PI * (i + 0.5) / n, nn = Math.hypot(1, k); F.push({ p: [[0, y0 + h, 0], base[j], base[i]], n: [Math.cos(am) / nn, k / nn, Math.sin(am) / nn], m: m, ns: true }); }
    F.push({ p: base.slice(), n: [0, -1, 0], m: m, ns: true });
    return F;
  }
  function polyY(pts, h, m, o) {   // a prism: polygon in x-z (counter-clockwise seen from above), extruded up
    o = o || {}; var F = [], n = pts.length, i;
    F.push({ p: pts.map(function (q) { return [q[0], h, q[1]]; }).reverse(), n: [0, 1, 0], m: o.top || m, key: "top", plane: o.plane });
    for (i = 0; i < n; i++) {
      var a = pts[i], b = pts[(i + 1) % n], ex = b[0] - a[0], ez = b[1] - a[1], l = Math.hypot(ex, ez);
      F.push({ p: [[a[0], h, a[1]], [b[0], h, b[1]], [b[0], 0, b[1]], [a[0], 0, a[1]]], n: [-ez / l, 0, ex / l], m: m, ns: !!o.smooth });
    }
    return F;
  }
  function polyZ(pts, d, m, o) {   // polygon in x-y (counter-clockwise seen from +z), extruded along z, centred
    o = o || {}; var F = [], n = pts.length, z0 = -d / 2, z1 = d / 2, i;
    F.push({ p: pts.map(function (q) { return [q[0], q[1], z1]; }), n: [0, 0, 1], m: o.front || m, key: "front", plane: o.plane, W: o.W, H: o.H });
    F.push({ p: pts.map(function (q) { return [q[0], q[1], z0]; }).reverse(), n: [0, 0, -1], m: m, key: "back" });
    for (i = 0; i < n; i++) {
      var a = pts[i], b = pts[(i + 1) % n], ex = b[0] - a[0], ey = b[1] - a[1], l = Math.hypot(ex, ey);
      F.push({ p: [[a[0], a[1], z1], [b[0], b[1], z1], [b[0], b[1], z0], [a[0], a[1], z0]], n: [ey / l, -ex / l, 0], m: m, ns: !!o.smooth });
    }
    return F;
  }
  function rrect(w, h, r, nseg, y0) {   // counter-clockwise in x-y, from y0
    var pts = [], c = [[w / 2 - r, y0 + r, -90], [w / 2 - r, y0 + h - r, 0], [-w / 2 + r, y0 + h - r, 90], [-w / 2 + r, y0 + r, 180]];
    c.forEach(function (q) { for (var i = 0; i <= nseg; i++) { var a = (q[2] + 90 * i / nseg) * D2R; pts.push([q[0] + r * Math.cos(a), q[1] + r * Math.sin(a)]); } });
    return pts;
  }
  function hexXZ(r, a0) { var p = []; for (var i = 0; i < 6; i++) { var a = (a0 || 0) + i * 60 * D2R; p.push([r * Math.cos(a), -r * Math.sin(a)]); } return p; }
  // snow on the top edge of a face, with drips, and icicles under it (drawn over the face)
  function capOn(F, k, capH, seed, ice, amp) {
    var f = key(F, k); if (!f || !f.plane) return;
    var O = f.plane[0], U = f.plane[1], V = f.plane[2], len = f.W, n = Math.max(6, Math.round(len / 0.14)), pts = [], i;
    var off = [f.n[0] * 0.004, f.n[1] * 0.004, f.n[2] * 0.004];
    function at(u, v) { return [O[0] + U[0] * u + V[0] * v + off[0], O[1] + U[1] * u + V[1] * v + off[1], O[2] + U[2] * u + V[2] * v + off[2]]; }
    pts.push(at(0, 0)); pts.push(at(len, 0));
    var drips = [];
    for (i = n; i >= 0; i--) {
      var u = len * i / n, hh = hash(seed + i * 3.7), v = capH * (0.62 + 0.3 * Math.sin(i * 1.7 + seed) * 0.5 + 0.28 * hh);
      if (i % 4 === 2 && hh > 0.35) v += capH * (0.35 + 0.5 * hash(seed + i));
      pts.push(at(u, v)); drips.push([u, v]);
    }
    F.push({ p: pts, n: f.n, m: M.SNOW, over: true, lw: 0.8 });
    if (!ice) return;
    var m = Math.max(3, Math.round(len / 0.32));
    for (i = 0; i < m; i++) {
      var hu = hash(seed * 1.3 + i * 5.1);
      if (hu < 0.25) continue;
      var uu = len * (i + 0.5 + (hash(seed + i * 9.1) - 0.5) * 0.5) / m, ww = len / m * (0.32 + 0.22 * hu);
      var base = capH * 0.82, Lc = capH * (amp || 1) * (0.7 + 1.9 * hash(seed + i * 2.3));
      F.push({ p: [at(uu - ww / 2, base), at(uu + ww / 2, base), at(uu, base + Lc)], n: f.n, m: M.ICE, over: true, lw: 0.7, ice: [at(uu - ww / 2, base), at(uu + ww / 2, base), at(uu, base + Lc), at(uu, base)] });
    }
  }
  function shift(F, d) { F.forEach(function (f) { f.p = f.p.map(function (p) { return [p[0] + d[0], p[1] + d[1], p[2] + d[2]]; }); if (f.plane) f.plane = [[f.plane[0][0] + d[0], f.plane[0][1] + d[1], f.plane[0][2] + d[2]], f.plane[1], f.plane[2]]; if (f.ice) f.ice = f.ice.map(function (p) { return [p[0] + d[0], p[1] + d[1], p[2] + d[2]]; }); }); return F; }

  // ------------------------------------------------------------ drawing
  var cv, ctx, LW = 4;
  function path(pts) { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.closePath(); }
  function setPlane(o, f) {
    var O = W(o, f.plane[0]), U = WV(o, f.plane[1]), V = WV(o, f.plane[2]);
    var po = P3(O[0], O[1], O[2]), lu = LV(U[0], U[1], U[2]), lv = LV(V[0], V[1], V[2]);
    ctx.setTransform(lu[0] / 100, lu[1] / 100, lv[0] / 100, lv[1] / 100, po[0], po[1]);
  }
  function hull2(pts) {
    var p = pts.slice().sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; });
    if (p.length < 3) return p;
    function cr(o, a, b) { return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); }
    var lo = [], up = [], i;
    for (i = 0; i < p.length; i++) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p[i]) <= 0) lo.pop(); lo.push(p[i]); }
    for (i = p.length - 1; i >= 0; i--) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p[i]) <= 0) up.pop(); up.push(p[i]); }
    up.pop(); lo.pop(); return lo.concat(up);
  }
  function drawObj(o, t) {
    if (!o.on) return;
    var list = [], all = [], i, j;
    for (i = 0; i < o.f.length; i++) {
      var f = o.f[i];
      if (f.hide && f.hide(t)) continue;
      var nW = WN(o, f.n), dv = nW[0] * C.v[0] + nW[1] * C.v[1] + nW[2] * C.v[2];
      var src = f.ice ? iceP(f, o) : (f.poly && f.poly(t)) || f.p, pts = [], d = 0;
      for (j = 0; j < src.length; j++) { var w = W(o, src[j]), q = P3(w[0], w[1], w[2]); pts.push(q); d += q[2]; if (o.hull && !f.over) all.push(q); }
      if (dv <= 0.0008) continue;
      list.push({ f: f, n: nW, pts: pts, d: d / src.length + (f.over ? 1000 : 0) + (f.lift || 0) });
    }
    list.sort(function (a, b) { return a.d - b.d; });
    ctx.globalAlpha = o.alpha;
    for (i = 0; i < list.length; i++) drawFace(list[i], o, t);
    if (o.hull && all.length > 2) { var h = hull2(all); path(h); ctx.lineWidth = LW; ctx.strokeStyle = INK; ctx.stroke(); }
    ctx.globalAlpha = 1;
  }
  function iceP(f, o) { var g = o.ice === undefined ? 1 : o.ice, a = f.ice; return [a[0], a[1], [mix(a[3][0], a[2][0], g), mix(a[3][1], a[2][1], g), mix(a[3][2], a[2][2], g)]]; }
  function drawFace(it, o, t) {
    var f = it.f, k = Math.max(0, it.n[0] * L[0] + it.n[1] * L[1] + it.n[2] * L[2]);
    var m = f.mfn ? f.mfn(t) : f.m, c = mixc(m[1], m[0], 0.12 + 0.88 * k);
    if (o.tint) c = mixc(c, o.tint[0], o.tint[1]);
    if (f.a !== undefined) ctx.globalAlpha = o.alpha * f.a;
    path(it.pts); ctx.fillStyle = rgb(c); ctx.fill();
    if (f.dec || f.glint) {
      ctx.save(); path(it.pts); ctx.clip(); setPlane(o, f);
      if (f.glint) { var S = (f.W + f.H) * 100; ctx.fillStyle = "rgba(255,255,255,0.34)"; ctx.beginPath(); ctx.moveTo(S * 0.18, 0); ctx.lineTo(S * 0.3, 0); ctx.lineTo(0, S * 0.3); ctx.lineTo(0, S * 0.18); ctx.closePath(); ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.22)"; ctx.beginPath(); ctx.moveTo(S * 0.36, 0); ctx.lineTo(S * 0.4, 0); ctx.lineTo(0, S * 0.4); ctx.lineTo(0, S * 0.36); ctx.closePath(); ctx.fill(); }
      if (f.dec) f.dec(f.W * 100, f.H * 100, t, o, k);
      ctx.restore();
    }
    if (!f.ns) { path(it.pts); ctx.lineWidth = LW * (f.lwFn ? f.lwFn(t) : (f.lw || 1)) * (o.lwk || 1); ctx.strokeStyle = INK; ctx.lineJoin = "round"; ctx.stroke(); }
    if (f.a !== undefined) ctx.globalAlpha = o.alpha;
  }
  function shadowOf(o) {
    if (!o.on || !o.sh || o.alpha < 0.05) return;
    var pts = [], i, j;
    for (i = 0; i < o.f.length; i++) { var f = o.f[i]; if (f.over) continue; for (j = 0; j < f.p.length; j++) { var w = W(o, f.p[j]); if (w[1] < -0.02) continue; var k = w[1] / L[1]; pts.push([w[0] - L[0] * k, w[2] - L[2] * k]); } }
    if (pts.length < 3) return;
    var h = hull2(pts).map(function (q) { return P3(q[0], 0, q[1]); });
    path(h); ctx.fillStyle = "rgba(24,78,170," + (0.2 * o.alpha).toFixed(3) + ")"; ctx.fill();
  }
  function ball(x, y, z, r, col) {   // a sphere is a circle in an orthographic view
    var q = P3(x, y, z), R = r * C.s;
    var g = ctx.createRadialGradient(q[0] - R * 0.35, q[1] - R * 0.4, R * 0.1, q[0], q[1], R);
    g.addColorStop(0, "#ffffff"); g.addColorStop(0.55, col || "#e6f3ff"); g.addColorStop(1, "#9cc7f0");
    ctx.beginPath(); ctx.arc(q[0], q[1], R, 0, 6.2832); ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = LW; ctx.strokeStyle = INK; ctx.stroke();
  }
  function txt(s, x, y, size, col, opts) {
    opts = opts || {};
    ctx.font = (opts.w || "") + " " + size + "px " + (opts.font || '"Lilita One"');
    ctx.textAlign = opts.align || "center"; ctx.textBaseline = opts.base || "middle";
    if (opts.stroke) { ctx.lineWidth = opts.stroke; ctx.strokeStyle = INK; ctx.lineJoin = "round"; ctx.strokeText(s, x, y); }
    ctx.fillStyle = col; ctx.fillText(s, x, y);
  }
  function rr2(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

  // ------------------------------------------------------------ the world
  var O = {}, LIST = [], SLABS = [], DOMS = [], REELS = [], PUFFS = [], FL = [], FAR = [], ROOT, $ = {};
  function add(name, faces, o) { o = o || {}; o.name = name; var ob = new Obj(faces, o); LIST.push(ob); O[name] = ob; return ob; }
  var HS = 8, XG = -3.0;                     // half the island, the gantry's x
  var xD = function (i) { return -0.9 + 0.75 * i; }, ZD = -5.8, XB = 6.2, TT = [6.2, -5.8];
  var ZS = [-2.4, 0.2, 2.7, 4.6, 5.9];       // where the stack stops: after the blade, sync, stamp, cannon, dock
  var Z_BLADE = -3.6, Z_ARCH = 0.2, Z_STAMP = 2.7, Z_CAN = 4.6, X_CAN = 4.75, PH = [4.85, 6.95], WT = [7.35, 4.95], BEND = 6.4;
  var CDIR = [Math.cos(-25 * D2R), Math.sin(-25 * D2R)], CBASE = [X_CAN + 0.2, 3.05];   // the snow cannon, on its mast, aims down at the stack
  var BZ0 = TT[1] + 1.15, BLEN = BEND - (TT[1] + 1.15), SLEN = Z_BLADE - (TT[1] + 1.15), RX = (xD(0) + xD(7)) / 2;
  var CUT = []; for (var kc = 0; kc < 21; kc++) CUT.push(B(T.DROP + 0.5 * kc));
  var S_PATH = "M51 20.0C46 12.0 38 11.0 30 11.0C18 11.0 9 18.0 9 29.0C9 41.0 20 44.0 30 48.0C42 52.0 52 57.0 52 69.0C52 87.0 42 89.0 30 89.0C20 89.0 12 86.0 7 79.0";
  var S_DRIP = "M21.0 100.0Q27.5 114.3 31.0 126.0Q34.5 114.3 41.0 100.0Z";
  var CAP_PATH = "M5 30V30Q5 5 30 5H98Q123 5 123 30V30L114 30Q111 44 108 50Q104 40 100 30H30Q26 42 22 48Q19 38 16 30Z";
  var PS, PD, PC;

  function lcd(wd, ht, draw) {   // a dark LCD inset on a face
    ctx.fillStyle = "#0e1628"; rr2(wd * 0.07, ht * 0.16, wd * 0.86, ht * 0.68, ht * 0.12); ctx.fill();
    ctx.lineWidth = 5; ctx.strokeStyle = INK; ctx.stroke();
    draw(wd * 0.07, ht * 0.16, wd * 0.86, ht * 0.68);
  }
  function build() {
    // the island: the Stalak icon as a block of ice, its top the snow where the machine stands
    var isl = boxF(16, 16, 16, M.BLUE, { mats: { top: M.SNOW } });
    capOn(isl, "right", 1.1, 3, true, 1.25);
    key(isl, "front").dec = function (wd, ht, t) {   // the icon's cap and S, at the icon's own proportions (128 -> the face)
      ctx.save(); ctx.scale(wd / 128, ht / 128);
      var pxs = (wd / 128) * 0.01 * C.s, endK = sat((t - B(64)) / (B(67.5) - B(64)));   // outlines stay screen-thin, then match the real icon at the end
      ctx.fillStyle = "#ffffff"; ctx.strokeStyle = INK; ctx.lineJoin = "round"; ctx.lineWidth = mix(LW / pxs, 4, endK); ctx.fill(PC); ctx.stroke(PC);
      var sa = sat((t - B(60.5)) / (B(63) - B(60.5))); if (sa <= 0) { ctx.restore(); return; } ctx.globalAlpha = sa;
      ctx.translate(44, 23); ctx.scale(0.7, 0.7); ctx.lineCap = "round";
      ctx.save(); ctx.translate(3, 6); ctx.lineWidth = 34; ctx.strokeStyle = INK; ctx.stroke(PS); ctx.restore();
      ctx.fillStyle = "#d6ecff"; ctx.lineWidth = mix(LW / pxs / 0.7, 5, endK); ctx.fill(PD); ctx.stroke(PD);
      ctx.lineWidth = 34; ctx.strokeStyle = INK; ctx.stroke(PS); ctx.lineWidth = 22; ctx.strokeStyle = "#ffffff"; ctx.stroke(PS);
      ctx.restore();
    };
    var fr = key(isl, "front");
    fr.poly = function (t) {   // the square face rounds its corners as it turns to face us (the real icon: rx 28 of 128)
      var r = 16 * 28 / 128 * eIO((t - B(66.4)) / (B(67.5) - B(66.4)));
      if (r < 0.01) return null;
      var pts = [], c = [[HS - r, -r, 0], [-HS + r, -r, 90], [-HS + r, -16 + r, 180], [HS - r, -16 + r, 270]];
      c.forEach(function (q) { for (var i = 0; i <= 6; i++) { var a = (q[2] + 15 * i) * D2R; pts.push([q[0] + r * Math.cos(a), 16 + q[1] + r * Math.sin(a), HS]); } });
      return pts;
    };
    fr.lwFn = function (t) { var e = sat((t - B(66.4)) / (B(67.5) - B(66.4))); return mix(1, 7 * (16 / 128) * C.s / LW, e); };
    add("island", isl, { pos: [0, -16, 0], sh: false, sink: 999 });
    // decor on the free side of the top: a frozen pond, crystals, snowy pines
    var pond = []; for (var i = 0; i < 32; i++) { var a = -i / 32 * 6.2832; pond.push([2.0 * Math.cos(a), 1.25 * Math.sin(a)]); }
    var pf = polyY(pond, 0.05, M.ICE, { top: [hx("#d9eeff"), hx("#8ec2f2")], smooth: true, plane: [[-2.0, 0.05, -1.25], [1, 0, 0], [0, 0, 1]] });
    pf[0].W = 4.0; pf[0].H = 2.5;
    pf[0].dec = function (wd, ht, t) { ctx.strokeStyle = "rgba(255,255,255,0.75)"; ctx.lineWidth = 5; for (var r = 0; r < 3; r++) { var q = ((t * 0.35 + r / 3) % 1); ctx.globalAlpha = 0.8 * (1 - q); ctx.beginPath(); ctx.ellipse(wd * 0.55, ht * 0.5, wd * 0.12 * (0.4 + 2.4 * q), ht * 0.12 * (0.4 + 2.4 * q), 0, 0, 6.2832); ctx.stroke(); } ctx.globalAlpha = 1; };
    add("pond", pf, { pos: [-3.4, 0, 1.6], sh: false, sink: 64.2, hull: true, dz: -60 });
    [[-6.0, -2.4, 1.9, 0.32, 0], [-5.4, -1.8, 1.25, 0.25, 1], [-6.5, -1.6, 0.9, 0.2, 2], [1.4, 4.9, 1.6, 0.3, 3], [2.0, 5.5, 1.0, 0.23, 4], [0.8, 5.6, 0.75, 0.19, 5], [-1.6, -3.4, 1.1, 0.24, 6]].forEach(function (c) {
      var hxz = hexXZ(c[3], 0.3 * c[4]), F = polyY(hxz, c[2], M.ICE, {});
      var tip = [0, c[2] + c[3] * 1.4, 0]; for (var q = 0; q < 6; q++) { var a1 = hxz[q], b1 = hxz[(q + 1) % 6], mx = (a1[0] + b1[0]) / 2, mz = (a1[1] + b1[1]) / 2, l = Math.hypot(mx, mz); F.push({ p: [[a1[0], c[2], a1[1]], tip, [b1[0], c[2], b1[1]]], n: [mx / l * 0.8, 0.6, mz / l * 0.8], m: M.ICE }); }
      F.forEach(function (f, j) { if (j > 0 && j < 7) f.lw = 0.8; });
      add("cr" + c[4], F, { pos: [c[0], 0, c[1]], sink: 64.0 + 0.1 * c[4], hull: false });
    });
    [[-5.6, 5.0, 1.1], [-4.4, 6.2, 0.85], [-6.6, 3.7, 0.75], [-2.2, 6.6, 0.65], [-6.4, 6.5, 0.6]].forEach(function (pn, j) {
      var s = pn[2], F = boxF(0.16 * s, 0.32 * s, 0.16 * s, M.INK);
      F = F.concat(coneF(0.62 * s, 0.85 * s, 16, M.PINE, 0.3 * s), coneF(0.48 * s, 0.75 * s, 16, M.PINE, 0.78 * s), coneF(0.33 * s, 0.62 * s, 16, M.PINE, 1.2 * s));
      add("pine" + j, F, { pos: [pn[0], 0, pn[1]], sink: 64.3 + 0.1 * j, hull: true });
    });
    // the gantry that holds his song
    add("post1", boxF(0.28, 3.4, 0.28, M.ICE), { pos: [XG - 0.8, 0, ZD], sink: 63.6 });
    add("post2", boxF(0.28, 3.4, 0.28, M.ICE), { pos: [XG + 0.8, 0, ZD], sink: 63.6 });
    var beam = boxF(1.9, 0.34, 0.44, M.BLUE, { mats: { top: M.SNOW } }); capOn(beam, "front", 0.16, 11, true, 1.6); capOn(beam, "right", 0.16, 12, true, 1.6);
    add("beam", beam, { pos: [XG, 3.4, ZD], sink: 63.6 });
    add("rope", boxF(0.05, 0.5, 0.05, M.INK), { pos: [XG, 2.9, ZD], sink: 63.6, sh: false });
    add("clawL", boxF(0.09, 0.36, 0.34, M.INK), { pos: [XG - 0.42, 2.58, ZD], piv: [0, 0.36, 0], sink: 63.6, sh: false });
    add("clawR", boxF(0.09, 0.36, 0.34, M.INK), { pos: [XG + 0.42, 2.58, ZD], piv: [0, 0.36, 0], sink: 63.6, sh: false });
    add("clawT", boxF(0.95, 0.1, 0.34, M.INK), { pos: [XG, 2.9, ZD], sink: 63.6, sh: false });
    var sb = boxF(1.5, 1.0, 1.0, M.ICE, {}); key(sb, "top").glint = true; key(sb, "right").glint = true;
    key(sb, "front").dec = function (wd, ht) {   // the real waveform of his song, engraved
      var n = WAVE.length, bw = wd * 0.8 / n;
      ctx.fillStyle = "#1f6fd6";
      for (var i = 0; i < n; i++) { var h = ht * 0.62 * WAVE[i]; rr2(wd * 0.1 + i * bw + bw * 0.18, ht * 0.5 - h / 2, bw * 0.64, h, bw * 0.3); ctx.fill(); }
    };
    key(sb, "right").dec = function (wd, ht) { ctx.fillStyle = "#1f6fd6"; ctx.font = (ht * 0.5) + 'px "Lilita One"'; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("♪", wd * 0.5, ht * 0.52); };
    add("song", sb, { pos: [XG, 1.95, ZD], piv: [0, 0, 0], sink: 63.6 });
    var tri = polyZ([[-0.32, 0], [0.32, 0], [0, 0.4]], 0.5, M.ICE); add("fulcrum", tri, { pos: [XG + 0.6, 0, ZD], sink: 63.7 });
    var pl = boxF(1.9, 0.1, 0.56, M.BLUE, { mats: { top: M.SNOW } }); add("plank", pl, { pos: [XG + 0.6, 0.4, ZD], piv: [0, 0, 0], sink: 63.7 });
    // the dominoes, one per beat, and the beat ruler in front of them
    for (i = 0; i < 8; i++) { var dF = boxF(0.22, 1.25, 0.75, M.ICE); key(dF, "front").glint = true; key(dF, "top").glint = true; DOMS.push(add("dom" + i, dF, { pos: [xD(i), 0, ZD], piv: [0.11, 0, 0], sink: 63.8 + 0.03 * i })); }
    var ru = boxF(5.9, 0.07, 0.3, M.INK, { mats: { top: M.LCD } });
    key(ru, "top").dec = function (wd, ht, t) {
      for (var i = 0; i < 8; i++) {
        var x = (xD(i) - (RX - 2.95)) * 100, on = t >= B(8 + i), fl = decay(t, B(8 + i), 0.18);
        ctx.fillStyle = on ? rgb(mixc([127, 220, 255], WHITE, fl)) : "#33415e"; rr2(x - 9, ht * 0.25, 18, ht * 0.5, 6); ctx.fill();
      }
    };
    add("ruler", ru, { pos: [RX, 0, ZD + 0.7], sh: false, sink: 63.8, dz: -60 });
    add("switch", boxF(0.45, 0.24, 0.62, M.T1, { mats: { top: M.PAD } }), { pos: [xD(7) + 0.51, 0, ZD], piv: [0, 0, 0], sink: 64.0 });
    // the turntable and the three reels (his three takes)
    var tt = cylF(1.15, 0.3, 36, M.BLUE, { top: M.SNOW });
    key(tt, "top").dec = function (wd, ht, t) {
      ctx.translate(wd / 2, ht / 2); ctx.rotate(-O.turn.ang);
      ctx.strokeStyle = "rgba(31,111,214,0.45)"; ctx.lineWidth = 5; [0.36, 0.48, 0.62, 0.78].forEach(function (r) { ctx.beginPath(); ctx.arc(0, 0, wd / 2 * r, 0, 6.2832); ctx.stroke(); });
      ctx.fillStyle = INK; rr2(wd * 0.36, -8, wd * 0.11, 16, 6); ctx.fill();
    };
    add("turn", tt, { pos: [TT[0], 0, TT[1]], sink: 64.0, hull: true }); O.turn.ang = 0;
    add("spindle", cylF(0.12, 0.55, 14, M.INK), { pos: [TT[0], 0, TT[1]], sink: 64.0, hull: true, sh: false });
    for (i = 0; i < 3; i++) {
      (function (i) {
        var rF = cylF(0.42, 0.3, 24, TK[i + 1], { top: [mixc(TK[i + 1][0], WHITE, 0.25), TK[i + 1][1]] });
        key(rF, "top").dec = function (wd, ht, t) {
          ctx.translate(wd / 2, ht / 2); ctx.rotate(-O.turn.ang * 1.6);
          ctx.fillStyle = "rgba(255,255,255,0.85)"; for (var h = 0; h < 5; h++) { var a = h * 1.2566; ctx.beginPath(); ctx.arc(Math.cos(a) * wd * 0.3, Math.sin(a) * wd * 0.3, wd * 0.1, 0, 6.2832); ctx.fill(); }
          ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(0, 0, wd * 0.13, 0, 6.2832); ctx.fill();
        };
        REELS.push(add("reel" + i, rF, { pos: [TT[0], 0.3, TT[1]], sink: 64.0, hull: true }));
      })(i);
    }
    // the belt, the strip of film, the blade
    var bt = boxF(1.3, 0.25, BLEN, M.DEEP, { mats: { top: M.LCD } });
    key(bt, "top").dec = function (wd, ht, t) {
      var off = (O.belt.off * 100) % 60;
      ctx.strokeStyle = "rgba(160,205,255,0.55)"; ctx.lineWidth = 7; ctx.lineCap = "round";
      for (var y = -60 + off; y < ht + 60; y += 60) { ctx.beginPath(); ctx.moveTo(wd * 0.32, y - 14); ctx.lineTo(wd * 0.5, y + 4); ctx.lineTo(wd * 0.68, y - 14); ctx.stroke(); }
    };
    add("belt", bt, { pos: [XB, 0, BZ0 + BLEN / 2], sh: false, sink: 64.4, dz: -60 }); O.belt.off = 0;
    var st = boxF(0.9, 0.035, SLEN, M.T2);
    key(st, "top").dec = function (wd, ht, t) {
      var off = (O.strip.off * 100) % 22; ctx.fillStyle = "rgba(255,255,255,0.9)";
      for (var y = -22 + off; y < ht + 22; y += 22) { rr2(wd * 0.06, y, wd * 0.1, 10, 3); ctx.fill(); rr2(wd * 0.84, y, wd * 0.1, 10, 3); ctx.fill(); }
      ctx.fillStyle = "rgba(10,13,20,0.18)"; ctx.fillRect(wd * 0.22, 0, wd * 0.56, ht);
    };
    key(st, "top").mfn = function () { return TK[O.strip.take]; }; key(st, "front").mfn = key(st, "top").mfn; key(st, "right").mfn = key(st, "top").mfn;
    add("strip", st, { pos: [XB, 0.25, BZ0 + SLEN / 2], piv: [0, 0, -SLEN / 2], sink: 64.4, sh: false }); O.strip.off = 0; O.strip.take = 2;
    add("bpost1", boxF(0.2, 2.6, 0.2, M.ICE), { pos: [XB - 0.82, 0, Z_BLADE], sink: 64.4 });
    add("bpost2", boxF(0.2, 2.6, 0.2, M.ICE), { pos: [XB + 0.82, 0, Z_BLADE], sink: 64.4 });
    var hs = boxF(1.95, 0.62, 0.62, M.BLUE, { mats: { top: M.SNOW } });
    key(hs, "front").dec = function (wd, ht, t) {
      lcd(wd, ht, function (x, y, w, h) {
        var n = O.counter || 0, fl = n > 0 ? decay(t, CUT[n - 1], 0.12) : 0;
        txt("CUTS", x + w * 0.2, y + h * 0.54, h * 0.42, "#7fb7ee");
        txt((n < 10 ? "0" : "") + n, x + w * 0.68, y + h * 0.56, h * 0.86, rgb(mixc([127, 228, 255], WHITE, fl)));
      });
    };
    capOn(hs, "right", 0.14, 21, true, 1.5);
    add("housing", hs, { pos: [XB, 2.6, Z_BLADE], sink: 64.4 });
    var bl = boxF(1.45, 0.8, 0.07, M.METAL); key(bl, "front").glint = true;
    key(bl, "front").dec = function (wd, ht) { ctx.fillStyle = "rgba(147,171,198,0.55)"; ctx.fillRect(0, ht * 0.78, wd, ht * 0.22); ctx.strokeStyle = INK; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, ht * 0.78); ctx.lineTo(wd, ht * 0.78); ctx.stroke(); };
    add("blade", bl, { pos: [XB, 1.7, Z_BLADE], sink: 64.4 });
    // the stack: the base, then one slab per cut, in the colours of the real edit
    var base = boxF(1.15, 0.15, 0.8, M.BLUE, { mats: { top: M.SNOW } });
    add("sbase", base, { pos: [XB, 0.25, ZS[0]], sink: 64.5 });
    for (i = 0; i < 21; i++) {
      (function (i) {
        var sF = boxF(0.92, 0.07, 0.58, TK[TAKES[i]]);
        if (i === 20) {
          key(sF, "top").dec = function (wd, ht, t) {
            var lines = ["I", "GOTTA", "BOUNCE"], n = O.words || 0;
            for (var l = 0; l < n; l++) { var fl = decay(t, B(39 + l), 0.15); txt(lines[l], wd * 0.5, ht * (0.22 + 0.29 * l), ht * 0.27, rgb(mixc(WHITE, [255, 230, 120], fl)), { stroke: 7 }); }
          };
          capOn(sF, "front", 0.035, 31, true, 3.2); capOn(sF, "right", 0.035, 32, true, 3.2);
          sF.forEach(function (f) { if (f.over) f.hide = function (t) { return t < B(43); }; });
        }
        SLABS.push(add("slab" + i, sF, { pos: [XB, 0, 0], sink: 64.5 }));
      })(i);
    }
    // the sync gate
    add("apost1", boxF(0.28, 2.5, 0.28, M.ICE), { pos: [XB - 0.98, 0, Z_ARCH], sink: 64.7 });
    add("apost2", boxF(0.28, 2.5, 0.28, M.ICE), { pos: [XB + 0.98, 0, Z_ARCH], sink: 64.7 });
    var ab = boxF(2.3, 0.82, 0.5, M.BLUE, { mats: { top: M.SNOW } });
    key(ab, "front").dec = function (wd, ht, t) {
      lcd(wd, ht, function (x, y, w, h) {
        var al = eIO((t - B(35.5)) / (B(37) - B(35.5))), lock = t >= B(37), fl = decay(t, B(37), 0.25);
        var n = WAVE.length, bw = w * 0.9 / n, sh = (1 - al) * w * 0.16;
        for (var pass = 0; pass < 2; pass++) {
          ctx.fillStyle = pass === 0 ? (lock ? "#5ee6a0" : "#ffffff") : (lock ? "#5ee6a0" : TKH[1]);
          ctx.globalAlpha = pass === 0 ? 1 : 0.8;
          for (var i = 0; i < n; i++) { var hh = h * 0.62 * WAVE[i], xx = x + w * 0.05 + i * bw + (pass === 0 ? -sh : sh); rr2(xx + bw * 0.2, y + h * 0.5 - hh / 2, bw * 0.6, hh, bw * 0.25); ctx.fill(); }
        }
        ctx.globalAlpha = 1;
        if (fl > 0.01) { ctx.fillStyle = "rgba(255,255,255," + (0.6 * fl).toFixed(3) + ")"; ctx.fillRect(x, y, w, h); }
      });
    };
    capOn(ab, "right", 0.15, 41, true, 1.6); capOn(ab, "front", 0.15, 42, true, 1.6);
    key(ab, "front").lift = -1;
    add("abeam", ab, { pos: [XB, 2.5, Z_ARCH], sink: 64.7 });
    // the stamp
    add("spost1", boxF(0.24, 3.4, 0.24, M.ICE), { pos: [XB - 0.92, 0, Z_STAMP], sink: 65.0 });
    add("spost2", boxF(0.24, 3.4, 0.24, M.ICE), { pos: [XB + 0.92, 0, Z_STAMP], sink: 65.0 });
    var stop_ = boxF(2.1, 0.5, 0.78, M.BLUE, { mats: { top: M.SNOW } }); capOn(stop_, "right", 0.14, 51, true, 1.5); capOn(stop_, "front", 0.14, 52, true, 1.5);
    add("stop", stop_, { pos: [XB, 3.4, Z_STAMP], sink: 65.0 });
    add("piston", cylF(0.12, 1.0, 14, M.METAL), { pos: [XB, 2.6, Z_STAMP], sink: 65.0, hull: true, sh: false });
    var hd = boxF(1.25, 0.45, 0.9, M.INK, { mats: { bottom: M.PAD } });
    key(hd, "front").dec = function (wd, ht) { txt("LYRICS", wd * 0.5, ht * 0.54, ht * 0.42, "#ff9cc8"); };
    add("head", hd, { pos: [XB, 2.2, Z_STAMP], sink: 65.0 });
    // the snow cannon
    add("cbase", cylF(0.4, 0.22, 24, M.BLUE, { top: M.SNOW }), { pos: [X_CAN, 0, Z_CAN], sink: 65.2, hull: true });
    add("cstem", boxF(0.22, 2.85, 0.22, M.ICE), { pos: [X_CAN, 0, Z_CAN], sink: 65.2 });
    var chd = boxF(0.62, 0.5, 0.62, M.BLUE, { mats: { top: M.SNOW } }); capOn(chd, "right", 0.12, 71, true, 1.4); capOn(chd, "front", 0.12, 72, true, 1.4);
    add("chead", chd, { pos: [X_CAN, 2.8, Z_CAN], sink: 65.2 });
    var br = cylF(0.22, 1.0, 24, M.ICE, { top: [hx("#ffffff"), hx("#b9d9f6")] });
    key(br, "top").dec = function (wd, ht) { ctx.fillStyle = INK; ctx.beginPath(); ctx.arc(wd / 2, ht / 2, wd * 0.3, 0, 6.2832); ctx.fill(); };
    add("barrel", br, { pos: [CBASE[0], CBASE[1], Z_CAN], rz: -115 * D2R, sink: 65.2, hull: true });
    // the phone on its dock
    var dk = boxF(1.8, 0.42, 0.6, M.BLUE, { mats: { top: M.SNOW } });
    key(dk, "top").dec = function (wd, ht) { ctx.fillStyle = INK; rr2(wd * 0.12, ht * 0.1, wd * 0.76, ht * 0.25, 10); ctx.fill(); };
    add("dock", dk, { pos: [PH[0], 0, PH[1]], ry: Math.PI / 4, sink: 65.6 });
    var ph = polyZ(rrect(1.62, 2.9, 0.26, 5, 0), 0.2, [hx("#46536c"), hx("#141b29")], { smooth: true, plane: [[-0.81, 2.9, 0.1], [1, 0, 0], [0, -1, 0]], W: 1.62, H: 2.9 });
    key(ph, "front").dec = function (wd, ht, t) {
      var on = sat((t - B(49)) / 0.12);
      var gr = ctx.createLinearGradient(0, 0, wd, ht); gr.addColorStop(0, rgb(mixc([30, 46, 80], [64, 146, 240], on))); gr.addColorStop(1, rgb(mixc([12, 18, 34], [31, 111, 214], on)));
      ctx.fillStyle = gr; rr2(wd * 0.0556, ht * 0.0586, wd * 0.8889, ht * 0.8828, 12); ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.10)"; ctx.beginPath(); ctx.moveTo(wd * 0.06, ht * 0.06); ctx.lineTo(wd * 0.62, ht * 0.06); ctx.lineTo(wd * 0.06, ht * 0.5); ctx.closePath(); ctx.fill();
      if (on <= 0) {   // the lock screen is the machine's stopwatch: it counts to 03:00
        var q = sat((t - B(46)) / (B(48) - B(46))), sec = Math.floor(180 * eIO(q)), mm = Math.floor(sec / 60), ss = sec % 60;
        var stop = t >= B(48), blink = stop && Math.floor((t - B(48)) / 0.12) % 2 === 0, fl = decay(t, B(48), 0.2);
        var col = stop ? (blink ? "#ffffff" : "#5ee6a0") : (t >= B(46) ? "#7fe4ff" : "rgba(127,228,255,0.45)");
        txt("0" + mm + ":" + (ss < 10 ? "0" : "") + ss, wd * 0.5, ht * 0.4, ht * (0.125 + 0.015 * fl), col, { stroke: 9 });
        txt(stop ? "DONE" : "EDITING", wd * 0.5, ht * 0.54, ht * 0.045, "rgba(255,255,255,0.7)", { w: "700", font: '"Rubik"' });
        ctx.globalAlpha = 0.35; if ($.iconImg.complete && $.iconImg.naturalWidth) ctx.drawImage($.iconImg, wd * 0.4, ht * 0.75, wd * 0.2, wd * 0.2); ctx.globalAlpha = 1;
      }
      ctx.fillStyle = INK; rr2(wd * 0.38, ht * 0.018, wd * 0.24, ht * 0.022, 6); ctx.fill();
      if (on > 0 && $.iconImg.complete && $.iconImg.naturalWidth) { ctx.globalAlpha = on; ctx.drawImage($.iconImg, wd * 0.3, ht * 0.4, wd * 0.4, wd * 0.4); ctx.globalAlpha = 1; }
    };
    add("phone", ph, { pos: [PH[0], 0.42, PH[1]], ry: Math.PI / 4, sink: 65.6, hull: true });
  }

  // ------------------------------------------------------------ the camera's route: [beat, tx, ty, tz, zoom, yaw, pitch, screen y of the target]
  var CK;
  function camRoute() {
    var sc = O.phone; prep(sc); var c = W(sc, [0, 1.45, 0.1]); O.screenC = c;
    CK = [
      [-1, -2.3, 1.95, ZD, 188, 45, ISO, 1110], [6, -2.5, 1.7, ZD, 196, 45, ISO, 1110], [7.6, -2.4, 1.2, ZD, 190, 45, ISO, 1100],
      [8.4, -1.4, 0.9, ZD, 178, 45, ISO, 1090], [15.6, 4.0, 0.9, ZD, 176, 45, ISO, 1090],
      [17, 6.0, 1.3, ZD + 0.2, 152, 45, ISO, 1130], [20, 6.1, 1.2, ZD + 0.7, 154, 45, ISO, 1110],
      [23.4, XB, 1.05, Z_BLADE + 0.2, 192, 45, ISO, 1090], [24, XB, 1.0, Z_BLADE + 0.45, 216, 45, ISO, 1080], [34, XB, 1.1, Z_BLADE + 0.7, 222, 45, ISO, 1080],
      [35.5, XB, 1.45, Z_ARCH, 210, 45, ISO, 1090], [38, XB, 1.45, Z_ARCH + 0.05, 214, 45, ISO, 1090],
      [38.8, XB, 1.65, Z_STAMP, 204, 45, ISO, 1100], [42, XB, 1.65, Z_STAMP + 0.05, 208, 45, ISO, 1100],
      [42.8, XB - 0.1, 1.75, Z_CAN - 0.2, 196, 45, ISO, 1100], [46, XB - 0.1, 1.75, Z_CAN - 0.1, 200, 45, ISO, 1100],
      [46.8, 5.8, 1.55, 5.65, 164, 45, ISO, 1100], [50, 5.65, 1.65, 5.75, 170, 45, ISO, 1090],
      [52, c[0], c[1], c[2], 750, 45, 0, 960], [60, c[0], c[1], c[2], 750, 45, 0, 960],
      [63.6, 0, -HS, 0, 30, 45, ISO, 1010], [65.6, 0, -HS, 0.2, 31, 45, ISO, 1000],
      [67.4, 0, -HS, HS, 460 / 16, 0, 0, 560], [68, 0, -HS, HS, 460 / 16, 0, 0, 560]
    ];
  }
  function camAt(t) {
    var b = t / P, i = 0;
    while (i < CK.length - 2 && CK[i + 1][0] <= b) i++;
    var A = CK[i], Bk = CK[i + 1], u = sat((b - A[0]) / (Bk[0] - A[0])), e = eIO(u);
    var es = e, et = e, ep = e;
    if (A[0] === 50) { et = eOut(sat(u * 1.1)); es = eIn(u) * 0.55 + eIO(u) * 0.45; ep = eIO(sat(u * 1.15)); }
    if (A[0] === 60) { et = eOut(u); es = eOut(u); ep = eIO(sat(u * 1.2)); }
    if (A[0] === 8.4) { e = es = et = ep = u < 0.06 ? eIn(u / 0.06) * 0.06 : u; }
    var s = Math.exp(mix(Math.log(A[4]), Math.log(Bk[4]), es));
    cam(mix(A[1], Bk[1], et), mix(A[2], Bk[2], et), mix(A[3], Bk[3], et), s, mix(A[5], Bk[5], ep), mix(A[6], Bk[6], ep), 540, mix(A[7], Bk[7], et));
    // punches and shakes on the hits
    var hits = [[7, 12, 0.05], [24, 16, 0.05], [39, 9, 0.035], [40, 9, 0.035], [41, 11, 0.04], [43, 6, 0.02], [48, 4, 0.0]];
    var shx = 0, shy = 0, pz = 0;
    hits.forEach(function (h) { var d = decay(t, B(h[0]), 0.09); if (d > 0) { var q = t - B(h[0]); shx += h[1] * d * Math.sin(q * 71 + h[0]); shy += h[1] * d * Math.cos(q * 63 + h[0]); pz += h[2] * d; } });
    for (var k = 0; k < 21; k++) { var d2 = decay(t, CUT[k], 0.05); if (d2 > 0.01) { shy += 2.4 * d2; pz += 0.006 * d2; } }
    C.shx = shx; C.shy = shy; C.s *= 1 + pz;
    cam(C.tx, C.ty, C.tz, C.s, C.yaw, C.pitch, C.cx, C.cy);
  }

  // ------------------------------------------------------------ the machine, frame by frame
  function domAngle(i, t) {
    var h = B(8 + i), q = (t - h) / P, ac = 25.1, rest = i === 7 ? 37 : 63;
    if (q <= 0) return 0;
    if (i === 7) return rest * (q < 1 ? q * q : 1);
    if (q < 1) return ac * q * q;
    return ac + (rest - ac) * eOut((q - 1) / 1.3);
  }
  function stackZ(t) {
    var segs = [[34.5, 35.5, 0, 1], [38, 38.75, 1, 2], [42, 42.75, 2, 3], [46, 46.75, 3, 4]], z = ZS[0];
    for (var i = 0; i < segs.length; i++) { var s = segs[i]; if (t >= B(s[0])) z = mix(ZS[s[2]], ZS[s[3]], eIO((t - B(s[0])) / (B(s[1]) - B(s[0])))); }
    return z;
  }
  function beltRun(t) {   // how far the belt has run (units): with the strip, then with each hop of the stack
    var d = 0, a = B(20), b = B(34);
    d += 2.6 * Math.max(0, Math.min(t, b) - a);
    return d + (stackZ(t) - ZS[0]);
  }
  function animate(t) {
    LIST.forEach(function (o) { o.pos[0] = o.base[0]; o.pos[1] = o.base[1]; o.pos[2] = o.base[2]; o.sc[0] = o.sc[1] = o.sc[2] = 1; o.alpha = 1; o.on = true; o.tint = null; o.lwk = 1; });
    // the song: hanging, released on beat 6, lands on the seesaw on beat 7, which flips and throws a snowball at the first domino
    var rel = B(6), land = B(7), q;
    var open = eOut((t - rel) / 0.1);
    O.clawL.rot[2] = 0.45 * open; O.clawR.rot[2] = -0.45 * open;
    var plA = t < land ? -8 * D2R : mix(-8, 13, eBack((t - land) / 0.11)) * D2R;
    O.plank.rot[2] = plA;
    if (t < rel) { O.song.pos[1] = 1.95 + 0.03 * Math.sin(t * 2.4); O.song.rot[2] = 0.025 * Math.sin(t * 1.7); }
    else if (t < land) { q = (t - rel) / (land - rel); O.song.pos[1] = mix(1.95, 0.61, q * q); O.song.rot[2] = 0; }
    else {
      prep(O.plank); var at = W(O.plank, [-0.62, 0.1, 0]);
      O.song.pos[0] = at[0]; O.song.pos[1] = at[1]; O.song.pos[2] = at[2] - 0; O.song.rot[2] = plA;
      var sq = decay(t, land, 0.07); O.song.sc[1] = 1 - 0.16 * sq; O.song.sc[0] = O.song.sc[2] = 1 + 0.08 * sq;
    }
    // the dominoes
    for (var i = 0; i < 8; i++) DOMS[i].rot[2] = -domAngle(i, t) * D2R;
    var sw = decay(t, B(16), 0.3); O.switch.sc[1] = t >= B(16) ? 0.55 + 0.1 * (1 - sw) : 1;
    // the reels drop in on beats 16, 17, 18; the turntable spins from 19
    var spin = t < B(19) ? 0 : (t - B(19)) * (t < B(24) ? 2.2 * sat((t - B(19)) / 1.2) : 2.2) + (t > B(24) ? (t - B(24)) * 4.2 : 0);
    O.turn.ang = spin;
    for (i = 0; i < 3; i++) {
      var r = REELS[i], tl = B(16 + i), a = spin + i * 2.0944 + 0.6;
      r.pos[0] = TT[0] + 0.62 * Math.cos(a); r.pos[2] = TT[1] + 0.62 * Math.sin(a);
      if (t < tl - 0.34) r.on = false;
      else if (t < tl) { q = (t - (tl - 0.34)) / 0.34; r.pos[1] = mix(6, 0.3, q * q); }
      else { var bo = Math.sin(Math.min(1, (t - tl) / 0.22) * Math.PI) * 0.18 * decay(t, tl, 0.2); r.pos[1] = 0.3 + bo; r.sc[1] = 1 - 0.18 * decay(t, tl, 0.06); }
      var act = t >= CUT[0] && t < CUT[20] + 0.3 ? (TAKES[Math.min(20, Math.max(0, cutIndex(t)))] === i + 1) : false;
      r.tint = act ? [WHITE, 0.18 + 0.12 * Math.sin(t * 30)] : null;
    }
    // the strip of film: from beat 20 it runs out of the turntable to the blade, in the colour of the take being cut
    var stp = O.strip;
    if (t < B(20) || t > CUT[20] + 0.2) stp.on = false;
    else { stp.sc[2] = 0.05 + 0.95 * eOut((t - B(20)) / (B(23.5) - B(20))); stp.off = 2.6 * (t - B(20)); var ci = cutIndex(t); stp.take = TAKES[Math.min(20, ci + 1 > 20 ? 20 : Math.max(0, ci + 1))]; }
    O.belt.off = beltRun(t);
    // the blade: loads before the drop, then a cut on every half beat (21)
    var yb = 1.7;
    if (t < B(20)) yb = 1.15; else if (t < B(24)) yb = mix(1.15, 1.75, eIO((t - B(20)) / (B(23) - B(20)))) + 0.025 * Math.sin(t * 90) * sat((t - B(22.5)) / 0.8);
    var ncut = 0;
    for (var k = 0; k < 21; k++) {
      var c = CUT[k];
      if (t >= c - 0.045) { var dn = sat((t - (c - 0.045)) / 0.045), up = eOut((t - c - 0.02) / 0.11); if (t < c + 0.16) yb = Math.min(yb, mix(mix(1.75, 0.28, dn * dn), 1.75, up)); }
      if (t >= c) ncut = k + 1;
    }
    O.blade.pos[1] = yb; O.counter = ncut;
    // the stack: each cut slab flies onto it and lands on the next half beat
    var zs = stackZ(t), slot = t >= B(48) ? eIn((t - B(48)) / (B(49) - B(48))) : 0;
    var squash = 1;
    for (i = 0; i < 3; i++) squash -= 0.1 * decay(t, B(39 + i), 0.08);
    var SC = O.screenC; slot = t >= B(48) ? sat((t - B(48)) / (B(49) - B(48))) : 0;
    var sk = 1 - 0.96 * eIn(slot), b0 = [XB, 0.25, zs], an = [mix(b0[0], SC[0] + 0.35, slot), mix(b0[1], SC[1] - 0.4, slot) + 1.7 * bump(Math.sqrt(slot)), mix(b0[2], SC[2] + 0.35, slot)];
    var into = function (o) {   // the whole stack flies into the phone's screen as one piece, shrinking
      if (slot <= 0) return;
      o.pos[0] = an[0] + (o.pos[0] - b0[0]) * sk; o.pos[1] = an[1] + (o.pos[1] - b0[1]) * sk; o.pos[2] = an[2] + (o.pos[2] - b0[2]) * sk;
      o.sc[0] *= sk; o.sc[1] *= sk; o.sc[2] *= sk; o.lwk = 0.35 + 0.65 * sk; if (slot >= 0.999) o.on = false;
    };
    O.sbase.pos[2] = zs; into(O.sbase);
    for (k = 0; k < 21; k++) {
      var s = SLABS[k], c0 = CUT[k], fly = 0.17, yT = 0.4 + 0.07 * k * squash;
      if (t < c0) { s.on = false; continue; }
      if (t < c0 + fly) { q = (t - c0) / fly; s.pos[0] = XB; s.pos[2] = mix(Z_BLADE + 0.25, zs, eOut(q)); s.pos[1] = mix(0.29, yT, q) + 0.75 * bump(q); s.rot[0] = Math.PI * eIO(q); }
      else { s.pos[0] = XB; s.pos[2] = zs; s.pos[1] = yT; s.rot[0] = 0; s.sc[1] = squash; var lnd = decay(t, c0 + fly, 0.05); s.sc[0] = 1 + 0.06 * lnd; }
      into(s);
      var fr = sat((t - B(43.2)) / (B(44.6) - B(43.2)));
      if (fr > 0) s.tint = [WHITE, 0.32 * fr];
    }
    O.words = t >= B(41) ? 3 : t >= B(40) ? 2 : t >= B(39) ? 1 : 0;
    SLABS[20].ice = sat((t - B(43.3)) / (B(44.8) - B(43.3)));
    // the stamp slams on beats 39, 40, 41
    var yh = 2.3;
    for (i = 0; i < 3; i++) { var sl = B(39 + i), dn2 = sat((t - (sl - 0.07)) / 0.07), up2 = eOut((t - sl - 0.05) / 0.22); if (t >= sl - 0.07 && t < sl + 0.3) yh = Math.min(yh, mix(mix(2.3, 0.4 + 0.07 * 21 * squash, dn2 * dn2), 2.3, up2)); }
    O.head.pos[1] = yh; O.piston.pos[1] = yh + 0.45; O.piston.sc[1] = (3.4 - (yh + 0.45)) / 1.0;
    // the cannon recoils when it fires on beat 43
    var rc = decay(t, B(43), 0.12); O.barrel.pos[0] = CBASE[0] - 0.22 * rc * CDIR[0]; O.barrel.pos[1] = CBASE[1] - 0.22 * rc * CDIR[1];
    // the sink at the end: everything goes back into the snow, from the back to the front
    LIST.forEach(function (o) {
      if (o.sink > 900) return;
      var e = eIn((t - B(o.sink)) / 0.34);
      if (e > 0) { o.pos[1] = o.pos[1] * (1 - e); o.sc[1] *= Math.max(0.001, 1 - e); o.sc[0] *= 1 - 0.3 * e; o.sc[2] *= 1 - 0.3 * e; if (e >= 1) o.on = false; }
    });
    O.island.on = t < B(68) + 0.05;
    LIST.forEach(prep);
  }
  function cutIndex(t) { var n = -1; for (var k = 0; k < 21; k++) if (t >= CUT[k]) n = k; return n; }

  // ------------------------------------------------------------ puffs, snow, the far islands
  function puffs() {   // [time, x, y, z, count, size, spread, seed, outline]
    var P_ = [[B(7), XG, 0.6, ZD, 9, 0.28, 0.9, 1, 1], [B(8) + 0.02, xD(0) - 0.05, 1.15, ZD, 6, 0.16, 0.45, 2, 1]];
    for (var i = 0; i < 3; i++) P_.push([B(16 + i), TT[0], 0.35, TT[1], 5, 0.14, 0.6, 3 + i, 1]);
    for (i = 0; i < 3; i++) P_.push([B(39 + i), XB, 1.9, Z_STAMP, 7, 0.17, 0.8, 7 + i, 1]);
    P_.push([B(43), CBASE[0] + 1.05 * CDIR[0], CBASE[1] + 1.05 * CDIR[1], Z_CAN, 7, 0.2, 0.45, 11, 1]);
    P_.push([B(48.95), O.screenC[0] + 0.35, O.screenC[1], O.screenC[2] + 0.35, 6, 0.14, 0.5, 12, 1]);
    LIST.forEach(function (o, j) { if (o.sink < 900 && o.sh && j % 2 === 0) P_.push([B(o.sink) + 0.18, o.base[0], 0.1, o.base[2], 3, 0.18, 0.4, 20 + j, 1]); });
    return P_;
  }
  function drawPuffs(t) {
    PUFFS.forEach(function (p) {
      var q = (t - p[0]) / 0.55; if (q < 0 || q > 1) return;
      for (var i = 0; i < p[4]; i++) {
        var a = hash(p[7] * 13 + i) * 6.2832, r = p[6] * (0.4 + 0.6 * hash(p[7] * 7 + i * 3)) * eOut(q);
        var x = p[1] + Math.cos(a) * r, z = p[3] + Math.sin(a) * r * 0.8, y = p[2] + 0.35 * eOut(q) * (0.5 + hash(i + p[7]));
        var sz = p[5] * (0.6 + 0.6 * hash(i * 5 + p[7])) * (1 - eIn(q)) * (0.5 + 0.5 * eOut(q * 3));
        if (sz <= 0.005) continue;
        var c = P3(x, y, z); ctx.beginPath(); ctx.arc(c[0], c[1], sz * C.s, 0, 6.2832); ctx.fillStyle = "#ffffff"; ctx.fill();
        if (p[8]) { ctx.lineWidth = LW * 0.75; ctx.strokeStyle = INK; ctx.stroke(); }
      }
    });
    // the snow cannon's spray, beat 43
    var t0 = B(43);
    if (t > t0 && t < t0 + 1.0) {
      for (var k = 0; k < 90; k++) {
        var e0 = t0 + 0.45 * hash(k * 3.1), q2 = (t - e0) / 0.55; if (q2 < 0 || q2 > 1) continue;
        var mx0 = CBASE[0] + 1.05 * CDIR[0], my0 = CBASE[1] + 1.05 * CDIR[1], rq = 1.35 * eOut(q2);
        var x = mx0 + CDIR[0] * rq + (hash(k * 2.2) - 0.5) * 0.5 * q2, y = my0 + CDIR[1] * rq * 1.4 - 0.5 * q2 * q2 + (hash(k * 7.7) - 0.5) * 0.6 * q2, z = Z_CAN + (hash(k * 5.3) - 0.5) * 1.0 * q2;
        var c2 = P3(x, y, z), rr = (0.025 + 0.05 * hash(k)) * C.s * (1 - q2 * 0.5);
        ctx.beginPath(); ctx.arc(c2[0], c2[1], rr, 0, 6.2832); ctx.fillStyle = "rgba(255,255,255," + (0.95 * (1 - eIn(q2))).toFixed(3) + ")"; ctx.fill();
      }
    }
    // sparks on each cut
    for (var j = 0; j < 21; j++) {
      var qq = (t - CUT[j]) / 0.14; if (qq < 0 || qq > 1) continue;
      var c3 = P3(XB, 0.33, Z_BLADE + 0.05); ctx.strokeStyle = "rgba(255,255,255," + (1 - qq).toFixed(3) + ")"; ctx.lineWidth = 4; ctx.lineCap = "round";
      for (var s = 0; s < 6; s++) { var an = (s / 6) * 6.2832 + j, r1 = 12 + 50 * eOut(qq), r2 = r1 + 18; ctx.beginPath(); ctx.moveTo(c3[0] + Math.cos(an) * r1, c3[1] + Math.sin(an) * r1 * 0.7); ctx.lineTo(c3[0] + Math.cos(an) * r2, c3[1] + Math.sin(an) * r2 * 0.7); ctx.stroke(); }
    }
  }
  function initSnow() {
    for (var i = 0; i < 120; i++) FL.push({ x: hash(i * 1.37) * 1180 - 50, y: hash(i * 2.71) * 2100, r: 1.6 + 4.2 * Math.pow(hash(i * 3.3), 2), v: 40 + 90 * hash(i * 4.1), amp: 8 + 22 * hash(i * 5.9), w: 0.4 + 0.8 * hash(i * 6.7), ph: hash(i * 8.3) * 6.28, a: 0.45 + 0.5 * hash(i * 9.1), par: 0.15 + 0.5 * hash(i * 1.9) });
    FAR = [[150, 560, 0.8, 0], [945, 420, 0.55, 1], [960, 1560, 1.0, 2], [110, 1700, 0.65, 3], [560, 160, 0.4, 4]];
  }
  var camRef = null;
  function drawSnow(t) {
    var p0 = P3(0, 0, 0); if (!camRef) camRef = p0;
    for (var i = 0; i < FL.length; i++) {
      var f = FL[i], dx = (p0[0] - 540) * f.par * 0.12, dy = (p0[1] - 1000) * f.par * 0.12;
      var x = ((f.x + f.amp * Math.sin(f.w * t + f.ph) + dx) % 1180 + 1180) % 1180 - 50, y = ((f.y + f.v * t + dy) % 2100 + 2100) % 2100 - 90;
      ctx.beginPath(); ctx.arc(x, y, f.r, 0, 6.2832); ctx.fillStyle = "rgba(255,255,255," + f.a.toFixed(2) + ")"; ctx.fill();
    }
  }
  function drawFar(t) {   // little floating islands far away, light, with a slow drift and a little parallax
    var p0 = P3(0, 0, 0);
    FAR.forEach(function (f) {
      var s = 46 * f[2], x = f[0] + 10 * Math.sin(t * 0.4 + f[3]) - (p0[0] - 540) * 0.04, y = f[1] + 8 * Math.cos(t * 0.33 + f[3]) - (p0[1] - 1000) * 0.04;
      var c = Math.cos(45 * D2R), sn = Math.sin(ISO * D2R), cs = Math.cos(ISO * D2R);
      function pr(X, Y, Z) { var x1 = (X - Z) * c, z1 = (X + Z) * c; return [x + s * x1, y - s * (Y * cs - z1 * sn)]; }
      var h = 1.6;
      var top = [pr(-1, 0, -1), pr(1, 0, -1), pr(1, 0, 1), pr(-1, 0, 1)], rt = [pr(1, 0, 1), pr(1, 0, -1), pr(1, -h, -1), pr(1, -h, 1)], ft = [pr(-1, 0, 1), pr(1, 0, 1), pr(1, -h, 1), pr(-1, -h, 1)];
      ctx.globalAlpha = 0.55;
      ctx.lineWidth = 2.5; ctx.strokeStyle = "#1c4a8f";
      [[ft, "#5c9de8"], [rt, "#3f7fd3"], [top, "#f4faff"]].forEach(function (q) { path(q[0]); ctx.fillStyle = q[1]; ctx.fill(); ctx.stroke(); });
      var ti = pr(0, 0, 0), ti2 = pr(0, 1.1, 0); ctx.beginPath(); ctx.moveTo(ti[0] - s * 0.28, ti[1]); ctx.lineTo(ti2[0], ti2[1]); ctx.lineTo(ti[0] + s * 0.28, ti[1]); ctx.closePath(); ctx.fillStyle = "#e8f4ff"; ctx.fill(); ctx.stroke();
      ctx.globalAlpha = 1;
    });
  }

  // ------------------------------------------------------------ the DOM layers: titles, the takes' cards, his snippet, the end
  function init(root) {
    ROOT = root;
    cv = root.querySelector("#cv"); ctx = cv.getContext("2d");
    PS = new Path2D(S_PATH); PD = new Path2D(S_DRIP); PC = new Path2D(CAP_PATH);
    $.iconImg = new Image(); $.iconImg.src = "assets/brand/icon.svg";
    ["pay", "p-cap", "e-icon", "e-wm", "e-url", "e-tag", "kw0", "kw1", "kw2"].forEach(function (id) { $[id] = root.querySelector("#" + id); });
    $.bills = [0, 1, 2].map(function (i) { return root.querySelector("#bb" + i); });
    $.tts = Array.prototype.map.call(root.querySelectorAll(".tt"), function (el) {
      var b0 = parseFloat(el.getAttribute("data-b0")), b1 = parseFloat(el.getAttribute("data-b1"));
      var ws = Array.prototype.map.call(el.querySelectorAll(".w"), function (w, j) { var d = w.getAttribute("data-d"); return { el: w, t0: d ? B(parseFloat(d)) : B(b0) + 0.06 * j }; });
      return { el: el, t0: B(b0), t1: B(b1), ws: ws };
    });
    build(); camRoute(); initSnow(); PUFFS = puffs();
  }
  function domLayers(t) {
    // titles: each word slams in, the line flies off at its end
    $.tts.forEach(function (T_) {
      if (t < T_.t0 - 0.02 || t > T_.t1 + 0.11) { vis(T_.el, false); return; }
      vis(T_.el, true);
      var e = eIn((t - T_.t1) / 0.1);
      T_.el.style.opacity = (1 - e).toFixed(3); T_.el.style.transform = "translate3d(0," + px(-60 * e) + ",0) scale(" + (1 - 0.08 * e).toFixed(4) + ")";
      T_.el.style.filter = e > 0.02 ? "blur(" + (8 * e).toFixed(2) + "px)" : "none";
      T_.ws.forEach(function (w) {
        var q = t - w.t0;
        if (q < 0) { w.el.style.opacity = "0"; return; }
        var k = spr(q, 20, 0.5);
        w.el.style.opacity = sat(q / 0.04).toFixed(3);
        w.el.style.transform = "translate3d(0," + px(-20 * (1 - k)) + ",0) rotate(" + (-7 * (1 - k)).toFixed(2) + "deg) scale(" + (1.36 - 0.36 * k).toFixed(4) + ")";
      });
    });
    // the takes on their cards, above the turntable
    var c0 = P3(TT[0], 1.1, TT[1]);
    $.bills.forEach(function (el, i) {
      var tl = B(16 + i) + 0.05, out = eIn((t - B(21.4)) / 0.2);
      if (t < tl || out >= 1) { el.style.opacity = "0"; return; }
      var k = spr(t - tl, 15, 0.55), sc = 0.128 * (C.s / 130) * (0.2 + 0.8 * k) * (1 - 0.9 * out);
      var x = c0[0] + (i - 1) * 182 * (C.s / 130), y = c0[1] - 60 * (C.s / 130) - 1920 * sc + 20 * (1 - k);
      el.style.opacity = (sat((t - tl) / 0.05) * (1 - out)).toFixed(3);
      el.style.transform = "matrix(" + sc.toFixed(5) + ",0,0," + sc.toFixed(5) + "," + (x - 540 * sc).toFixed(2) + "," + y.toFixed(2) + ")";
    });
    // his snippet: mapped on the phone's screen (an orthographic view keeps it a parallelogram), then the whole frame
    var pay = $.pay, a0 = B(49.5), a1 = B(63.5);
    if (t < a0 || t > a1 + 0.4) { pay.style.opacity = "0"; vis($["p-cap"], false); }
    else {
      var ph = O.phone, tl2 = W(ph, [-0.72, 2.73, 0.101]), tr = W(ph, [0.72, 2.73, 0.101]), blp = W(ph, [-0.72, 0.17, 0.101]);
      var A = P3(tl2[0], tl2[1], tl2[2]), Bq = P3(tr[0], tr[1], tr[2]), Cq = P3(blp[0], blp[1], blp[2]);
      var m = [(Bq[0] - A[0]) / 1080, (Bq[1] - A[1]) / 1080, (Cq[0] - A[0]) / 1920, (Cq[1] - A[1]) / 1920, A[0], A[1]];
      var full = sat((Math.hypot(Bq[0] - A[0], Bq[1] - A[1]) - 700) / 380);
      pay.style.transform = "matrix(" + m.map(function (v, j) { return j < 4 ? v.toFixed(6) : v.toFixed(2); }).join(",") + ")";
      pay.style.borderRadius = px(92 * (1 - full));
      var fin = sat((t - a0) / 0.18) * (1 - sat((t - a1) / 0.35));
      pay.style.opacity = (O.phone.on ? fin : 0).toFixed(3);
      var cq = t - T.cap;
      if (cq > 0 && t < B(58.6)) { vis($["p-cap"], true); $["p-cap"].style.opacity = sat(cq / 0.06).toFixed(3); $["p-cap"].style.transform = "scale(" + (0.6 + 0.4 * spr(cq, 16, 0.55)).toFixed(4) + ")"; }
      else vis($["p-cap"], false);
    }
    // the stamp's words pop out of the stack
    var st = P3(XB, 1.95, Z_STAMP);
    ["kw0", "kw1", "kw2"].forEach(function (id, i) {
      var el = $[id], q = t - B(39 + i);
      if (q < 0 || q > 0.56) { vis(el, false); return; }
      vis(el, true);
      var k = spr(q, 16, 0.5), fo = eIn((q - 0.3) / 0.26);
      el.style.opacity = (1 - fo).toFixed(3);
      el.style.transform = "translate3d(" + px(st[0] - el.offsetWidth / 2 + (i - 1) * 250) + "," + px(st[1] - 150 - 230 * eOut(q / 0.5) - el.offsetHeight) + ",0) scale(" + (0.3 + 0.7 * k).toFixed(4) + ") rotate(" + ((i - 1) * 6 * (1 - k)).toFixed(2) + "deg)";
    });
    // the end: the icon, the name, the address
    var ic = $["e-icon"], q3 = t - B(68);
    var xf = sat((t - B(67.55)) / (B(68) - B(67.55)));
    if (xf > 0) { vis(ic, true); var kk = spr(q3, 14, 0.45); ic.style.transform = "scale(" + (1 + 0.07 * Math.sin(sat(q3 / 0.3) * Math.PI)).toFixed(4) + ") translate3d(0," + px(4 * Math.sin(t * 1.8)) + ",0)"; ic.style.opacity = xf.toFixed(3); } else vis(ic, false);
    var wm = $["e-wm"], q4 = t - B(68.5);
    if (q4 >= 0) { vis(wm, true); var k4 = spr(q4, 13, 0.55); wm.style.opacity = sat(q4 / 0.08).toFixed(3); wm.style.transform = "translate3d(0," + px(40 * (1 - k4)) + ",0) scale(" + (0.82 + 0.18 * k4).toFixed(4) + ")"; } else vis(wm, false);
    var url = "stalak.app", nt = Math.floor(sat((t - B(69.5)) / 0.42) * url.length + 0.0001); $["e-url"].textContent = url.slice(0, nt);
    var tg = $["e-tag"], q5 = t - B(70.5);
    if (q5 >= 0) { vis(tg, true); var k5 = spr(q5, 15, 0.55); tg.style.opacity = sat(q5 / 0.06).toFixed(3); tg.style.transform = "scale(" + (0.6 + 0.4 * k5).toFixed(4) + ")"; } else vis(tg, false);
  }
  function overlays(t) {
    // the tempo, pinned to the beat ruler
    var q = t - B(10), out = eIn((t - B(15.6)) / 0.2);
    if (q >= 0 && out < 1) {
      var k = spr(q, 15, 0.55), a = P3(RX + 0.3, 2.35, ZD), b = P3(RX + 0.3, 0.07, ZD + 0.7);
      ctx.globalAlpha = sat(q / 0.06) * (1 - out);
      ctx.setLineDash([10, 9]); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(a[0], a[1] + 40); ctx.lineTo(b[0], b[1]); ctx.stroke(); ctx.setLineDash([]);
      ctx.save(); ctx.translate(a[0], a[1]); ctx.scale(0.4 + 0.6 * k, 0.4 + 0.6 * k);
      ctx.fillStyle = "#ffffff"; rr2(-150, -46, 300, 92, 46); ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = INK; ctx.stroke();
      txt("157 BPM", 0, 3, 56, INK);
      ctx.restore(); ctx.globalAlpha = 1;
    }
    // pins from the takes' cards to their reels
    for (var i = 0; i < 3; i++) {
      var tl = B(16 + i) + 0.05, o2 = eIn((t - B(21.4)) / 0.2);
      if (t < tl + 0.08 || o2 >= 1) continue;
      var r = P3(REELS[i].pos[0], REELS[i].pos[1] + 0.3, REELS[i].pos[2]), c0 = P3(TT[0], 1.1, TT[1]), x = c0[0] + (i - 1) * 182 * (C.s / 130), y = c0[1] - 60 * (C.s / 130);
      ctx.globalAlpha = sat((t - tl - 0.08) / 0.1) * (1 - o2); ctx.lineWidth = 4; ctx.strokeStyle = INK; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(r[0], r[1]); ctx.stroke();
      ctx.beginPath(); ctx.arc(r[0], r[1], 7, 0, 6.2832); ctx.fillStyle = INK; ctx.fill(); ctx.globalAlpha = 1;
    }
  }

  function render(t) {
    if (!ctx) return;
    if (t < 0) t = 0; if (t > TOTAL) t = TOTAL;
    camAt(t);
    LW = Math.max(3, Math.min(7.5, 2.4 + C.s / 55));
    animate(t);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, 1080, 1920);
    ctx.lineJoin = "round"; ctx.lineCap = "round";
    drawFar(t);
    var isl = O.island;
    if (isl.on) {
      drawObj(isl, t);
      // contact shadows, on the snow only
      var top = [W(isl, [-HS, 16, -HS]), W(isl, [HS, 16, -HS]), W(isl, [HS, 16, HS]), W(isl, [-HS, 16, HS])].map(function (p) { return P3(p[0], p[1], p[2]); });
      ctx.save(); path(top); ctx.clip();
      LIST.forEach(function (o) { if (o !== isl) shadowOf(o); });
      ctx.restore();
    }
    var objs = LIST.filter(function (o) { return o !== isl && o.on; }).map(function (o) { var c = W(o, o.ctr); return { o: o, d: P3(c[0], c[1], c[2])[2] + o.dz }; });
    objs.sort(function (a, b) { return a.d - b.d; });
    objs.forEach(function (it) { drawObj(it.o, t); });
    // the snowball between the seesaw and the first domino
    var land = B(7), hit = B(8);
    if (t < hit + 0.03) {
      var bx, by, bz = ZD;
      if (t < land + 0.03) { prep(O.plank); var p = W(O.plank, [0.74, 0.1 + 0.2, 0]); bx = p[0]; by = p[1]; }
      else { var q = sat((t - land - 0.03) / (hit - land - 0.03)); bx = mix(XG + 1.38, xD(0) - 0.32, q); by = mix(0.62, 1.12, q) + 1.6 * q * (1 - q) * 2; }
      ball(bx, by, bz, 0.2);
    }
    drawPuffs(t);
    overlays(t);
    drawSnow(t);
    domLayers(t);
  }

  window.MACHINE = { init: init, render: render };
})();
