/* Série « T-Crazy » — the animation of an episode (Marketing & croissance, 16/11/2026).
   window.seek(t) draws the picture at time t from the episode's data (window.__DATA, made by tools/serie/tcrazy.py plan) :
   the validated storyboard shot on screen (storyboard.js), a small camera move on every shot, the characters who breathe,
   blink and talk on their voice, the subtitle of the moment, and the parts that pop in (phone, sticker, labels, end card).
   No clock and no CSS animation : the same t always gives the same picture. */
(function () {
  const D = window.__DATA || { shots: [], lines: [], subs: [], duration: 0, fps: 30 };
  const svg = document.getElementById('s');
  FRAME.ANIM = true;

  // ---------------- helpers ----------------
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const seg = (t, a, b) => clamp((t - a) / ((b - a) || 1e-6), 0, 1);
  const eio = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const eout = (x) => 1 - Math.pow(1 - x, 3);
  // damped spring, 0 → 1 after t0
  function spring(t, t0, k = 170, d = 18) {
    if (t <= t0) return 0;
    const x = t - t0, w0 = Math.sqrt(k), z = d / (2 * Math.sqrt(k));
    if (z < 1) { const wd = w0 * Math.sqrt(1 - z * z); return 1 - Math.exp(-z * w0 * x) * (Math.cos(wd * x) + (z * w0 / wd) * Math.sin(wd * x)); }
    return 1 - Math.exp(-w0 * x) * (1 + w0 * x);
  }
  function hash(n) { n = (n << 13) ^ n; return 1 - ((n * (n * n * 15731 + 789221) + 1376312589) & 0x7fffffff) / 1073741824; }
  function noise(t, seed) { const i = Math.floor(t), f = t - i, u = f * f * (3 - 2 * f); return hash(i + seed * 101) * (1 - u) + hash(i + 1 + seed * 101) * u; }
  // a blink every 2.6-4.6 s, 0.13 s long (deterministic, one rhythm per character)
  function blinking(t, seed) {
    let tt = 0.7 + (hash(seed) + 1) * 0.8, i = 0;
    while (tt <= t && i < 600) { if (t < tt + 0.13) return true; tt += 2.6 + (hash(seed * 7 + i) + 1) * 1.0; i++; }
    return false;
  }
  const seedOf = (who) => [...who].reduce((a, c) => a + c.charCodeAt(0), 0);
  // the mouth of `who` at time t : the loudness of his voice (30 values per second), 0 when he is silent
  function mouth(who, t) {
    for (const L of D.lines) {
      if (L.who !== who || t < L.t0 || t > L.t1) continue;
      const e = L.env || [];
      if (!e.length) return (Math.sin(t * 23) > -0.2 && Math.sin(t * 6.1) > -0.6) ? 0.8 : 0.1; // no voice yet : a plausible flap
      return e[clamp(Math.floor((t - L.t0) * D.fps), 0, e.length - 1)] || 0;
    }
    return 0;
  }
  const speaking = (who, t) => D.lines.some(L => L.who === who && t >= L.t0 && t <= L.t1);

  // ---------------- one shot on screen ----------------
  let cur = -1, R = null, justComposed = false;
  const PH = {};
  const hasPhone = (i) => (i in PH ? PH[i] : (PH[i] = FRAME.compose(D.shots[i].frame).includes('class="phone"')));
  function shotAt(t) { for (let i = 0; i < D.shots.length; i++) if (t < D.shots[i].t1) return i; return D.shots.length - 1; }
  function place() { // the characters stand on their feet : data-place="x y h" (feet centre, height in px), measured on .fig
    svg.querySelectorAll('[data-place]').forEach(g => {
      const [x, y, h] = g.getAttribute('data-place').split(' ').map(Number);
      const fig = g.querySelector('.fig') || g.firstElementChild, b = fig.getBBox(), s = h / b.height;
      g.setAttribute('transform', `translate(${(x - (b.x + b.width / 2) * s).toFixed(1)} ${(y - (b.y + b.height) * s).toFixed(1)}) scale(${s.toFixed(4)})`);
      g.dataset.fx = (b.x + b.width / 2).toFixed(1); g.dataset.fy = (b.y + b.height).toFixed(1);
    });
  }
  const centre = (el) => { const b = el.getBBox(); return [b.x + b.width / 2, b.y + b.height / 2]; };
  function compose(i) {
    const S = D.shots[i];
    FRAME.MUTE_SUB = true;
    svg.innerHTML = `<g id="cam">${FRAME.compose(S.frame)}</g><g id="ui"></g><g id="subs"></g><g id="cri"></g><rect id="dip" width="1080" height="1920" fill="#0a0d14" opacity="0"/>`;
    FRAME.MUTE_SUB = false;
    place();
    if (window.LIGHTS) LIGHTS.attach(svg); // the glints on what shines, the glow of the screens (lights.js)
    const cam = svg.querySelector('#cam'), ui = svg.querySelector('#ui');
    // the banner, the name labels, the captions, the notification and the clapperboard stay still : out of the camera
    // (only those drawn straight on the frame : the band of the end card keeps its place)
    [...cam.children].filter(el => el.matches('.bandeau, .tag, .notif, .clap, .carton, .knock')).forEach(el => ui.appendChild(el));
    justComposed = true;
    const F = FRAME.FRAMES[S.frame] || {};
    R = {
      i, S, cam, ui, subs: svg.querySelector('#subs'), cri: svg.querySelector('#cri'), criY: F.criY || 660, lastSub: null,
      // the Stalak screen we draw (storyboard.js stalakApp) : the import step, then the clip cut on the beat
      stk: [...svg.querySelectorAll('.stk')].map(el => ({
        ti: +el.dataset.ti, n: +el.dataset.n || 1, tks: [...el.querySelectorAll('.tk')], imp: el.querySelector('.imp'),
        ths: [...el.querySelectorAll('.th')].map(e => ({ el: e, c: centre(e) })), ck: el.querySelector('.ck'), mk: el.querySelector('.mk'),
        spin: el.querySelector('.spin'), ph: el.querySelector('.ph'),
        raps: [...el.querySelectorAll('.rap')].map(e => ({ fig: e.querySelector('.fig'), figT: e.querySelector('.figT') })),
      })),
      chars: [...svg.querySelectorAll('[data-who]')].map(el => ({
        el, who: el.dataset.who, seed: seedOf(el.dataset.who) + i * 3,
        body: el.classList.contains('head') ? null : el.firstElementChild,
        fx: +el.dataset.fx || 0, fy: +el.dataset.fy || 0,
        fig: el.querySelectorAll('.fig'), figT: el.querySelectorAll('.figT'), figB: el.querySelectorAll('.figB'),
      })),
      pops: [...svg.querySelectorAll('.phone, .tag, .notif, .sticker, .clap, .dream, .laptop, .bandeau, .ec-logo, .ec-url, .ec-free, .clock, .cmt, .carton, .knock')].map(el => ({ el, cls: el.classList[0], c: centre(el), dl: el.dataset.dl != null ? +el.dataset.dl : null })),
      phoneCont: i > 0 && hasPhone(i - 1) && hasPhone(i), // the phone was already there : no new pop
      spins: [...svg.querySelectorAll('.blades')], hands: [...svg.querySelectorAll('.hands')],
      bus: svg.querySelector('.bus'), dogs: [...svg.querySelectorAll('.dog')], smoke: [...svg.querySelectorAll('.smoke')],
      lights: [...svg.querySelectorAll('.slight')], caps: [...svg.querySelectorAll('.cap')], scooters: [...svg.querySelectorAll('.scooter')],
      // the little actions on a screen or in a scene, written in storyboard.js with K({...}) (see kf() below)
      kfs: [...svg.querySelectorAll('[data-k]')].map(el => ({ el, o: JSON.parse(el.dataset.k), c: centre(el) })),
    };
    cur = i;
  }
  const show = (list, on) => list.forEach(el => el.setAttribute('display', on ? 'inline' : 'none'));
  const scaleAt = (el, c, k, extra = '') => el.setAttribute('transform', `${extra} translate(${c[0].toFixed(1)} ${c[1].toFixed(1)}) scale(${k.toFixed(4)}) translate(${(-c[0]).toFixed(1)} ${(-c[1]).toFixed(1)})`);

  // one action of a shot (storyboard.js K({...}), 16/11 : the owner wants to see what happens, « pour qu'on comprenne »).
  // Times are in seconds from the start of the shot ; a negative time counts from its end. Keys :
  //   in, out : shown from `in`, gone at `out` ; pop : start scale of a spring pop at `in` ; gone : [a, b] shrinks away
  //   path : [[t, dx, dy]...] a move between key positions (eased) ; lin : [dx, dy, a, b, repeat] a steady move
  //   osc : [ax, ay, hz] a wobble ; hop : [height, hz] bounces ; spin : degrees per second ; blink : [hz, duty]
  //   fadein, fade : [a, b] opacity ; ripple : [a, b] a tap ring that grows and fades
  function kf(K, lt, dur) {
    const o = K.o, T = v => (v < 0 ? dur + v : v);
    let vis = true, k = 1, tx = 0, ty = 0, rot = 0, op = 1;
    if (o.in != null) { const a = T(o.in); vis = lt >= a; if (o.pop != null) k = o.pop + (1 - o.pop) * spring(lt, a, o.ks || 300, o.kd || 18); }
    if (o.out != null && lt >= T(o.out)) vis = false;
    if (o.gone) { const p = seg(lt, T(o.gone[0]), T(o.gone[1])); k *= 1 - eout(p); if (p >= 1) vis = false; }
    if (o.path) {
      const P = o.path.map(q => [T(q[0]), q[1] || 0, q[2] || 0]);
      let q = P[P.length - 1];
      if (lt <= P[0][0]) q = P[0];
      else for (let j = 0; j < P.length - 1; j++) if (lt < P[j + 1][0]) { const p = eio(seg(lt, P[j][0], P[j + 1][0])); q = [lt, P[j][1] + (P[j + 1][1] - P[j][1]) * p, P[j][2] + (P[j + 1][2] - P[j][2]) * p]; break; }
      tx += q[1]; ty += q[2];
    }
    if (o.lin) { const [dx, dy, a, b, rep] = o.lin; let p = (lt - T(a)) / Math.max(1e-6, T(b) - T(a)); p = rep ? ((p % 1) + 1) % 1 : clamp(p, 0, 1); tx += dx * p; ty += dy * p; }
    if (o.osc) { const [ax, ay, hz] = o.osc; tx += ax * Math.sin(2 * Math.PI * hz * lt); ty += ay * Math.sin(2 * Math.PI * hz * lt + 1.3); }
    if (o.hop) ty -= o.hop[0] * Math.abs(Math.sin(Math.PI * o.hop[1] * lt));
    if (o.spin) rot += o.spin * lt;
    if (o.blink) { const [hz, duty] = o.blink; vis = vis && (((lt * hz) % 1) + 1) % 1 < (duty == null ? 0.5 : duty); }
    if (o.fadein) op *= eout(seg(lt, T(o.fadein[0]), T(o.fadein[1])));
    if (o.fade) op *= 1 - seg(lt, T(o.fade[0]), T(o.fade[1]));
    if (o.ripple) { const p = seg(lt, T(o.ripple[0]), T(o.ripple[1])); k *= 0.4 + 1.3 * eout(p); if (p <= 0 || p >= 1) vis = false; op *= 1 - p; }
    // the lights (lights.js) : tw = [period, phase, length, min] a glint that swells and turns once per period ;
    // flk = [seed, rate] a neon that flickers now and then ; sweep = [period, phase, length, dx, dy] a shine across a glass
    if (o.tw) {
      const [per, ph, len, mn] = o.tw, L = len || 0.6, m = mn == null ? 0.15 : mn, u = (((lt + ph) % per) + per) % per, p = u < L ? Math.sin(Math.PI * u / L) : 0;
      k *= m + (1 - m) * p; op *= 0.35 + 0.65 * p; if (u < L) rot += 50 * u / L;
    }
    if (o.flk) { const [sd, rate] = o.flk, n = noise(lt * 7, sd), r = rate == null ? 0.6 : rate; op *= n > r ? 0.3 + 0.2 * Math.sin(lt * 61 + sd) : 0.94 + 0.06 * Math.sin(lt * 9 + sd); }
    if (o.sweep) { const [per, ph, len, dx, dy] = o.sweep, u = (((lt + ph) % per) + per) % per; if (u > len) vis = false; else { const p = eio(u / len); tx += dx * p; ty += (dy || 0) * p; op *= Math.sin(Math.PI * u / len); } }
    // walk = [[t, dx, dy]...] : a character walks between the keys at a steady pace, his body bobbing at each step
    if (o.walk) {
      const P = o.walk.map(q => [T(q[0]), q[1] || 0, q[2] || 0]);
      let q = P[P.length - 1], u = -1;
      if (lt <= P[0][0]) q = P[0];
      else for (let j = 0; j < P.length - 1; j++) if (lt < P[j + 1][0]) {
        const a = P[j][0], b = P[j + 1][0], x = seg(lt, a, b), p = x + (eio(x) - x) * 0.45;
        q = [lt, P[j][1] + (P[j + 1][1] - P[j][1]) * p, P[j][2] + (P[j + 1][2] - P[j][2]) * p];
        if (P[j][1] !== P[j + 1][1] || P[j][2] !== P[j + 1][2]) u = lt - a;
        break;
      }
      tx += q[1]; ty += q[2];
      if (u >= 0) { const st = o.step || 2.2; ty -= (o.bob == null ? 16 : o.bob) * Math.abs(Math.sin(Math.PI * st * u)); rot += (o.sway == null ? 1.4 : o.sway) * Math.sin(Math.PI * st * u); }
    }
    // tilt = [[t, degrees]...] : a keyed rotation that speeds up (a fall), around pv = [x, y] (the feet) or the centre
    if (o.tilt) {
      const P = o.tilt.map(q => [T(q[0]), q[1]]);
      let r = P[P.length - 1][1];
      if (lt <= P[0][0]) r = P[0][1];
      else for (let j = 0; j < P.length - 1; j++) if (lt < P[j + 1][0]) { const x = seg(lt, P[j][0], P[j + 1][0]); r = P[j][1] + (P[j + 1][1] - P[j][1]) * x * x; break; }
      rot += r;
    }
    K.el.setAttribute('display', vis ? 'inline' : 'none');
    if (!vis) return;
    K.el.setAttribute('opacity', op.toFixed(3));
    const rc = o.pv || K.c;
    scaleAt(K.el, K.c, Math.max(0.001, k), `translate(${tx.toFixed(1)} ${ty.toFixed(1)})` + (rot ? ` rotate(${(rot % 360).toFixed(2)} ${rc[0].toFixed(1)} ${rc[1].toFixed(1)})` : ''));
  }

  // the pop of each kind of element : [delay after the shot starts, spring stiffness, damping, start scale]
  const POP = { phone: [0, 240, 20, 0.55], laptop: [0, 260, 24, 0.85], sticker: [0.55, 300, 13, 0], tag: [0.3, 300, 16, 0], notif: [0.25, 260, 20, 0.4],
    clap: [0.05, 320, 15, 0.3], cmt: [1.6, 240, 18, 0.3], dream: [0.25, 220, 15, 0], clock: [0, 260, 22, 0.8], 'ec-logo': [0.1, 260, 14, 0], 'ec-url': [0.35, 260, 16, 0], 'ec-free': [0.55, 260, 18, 0], bandeau: [0, 0, 0, 1],
    carton: [0.08, 300, 18, 0], knock: [0.05, 420, 13, 0] };
  // how long they stay before they go away (the caption : 3 s ; the knock : 1.6 s)
  const GONE = { carton: 3.0, knock: 1.6 };

  window.seek = function (t) {
    const i = shotAt(t);
    if (i !== cur) compose(i);
    const S = R.S, lt = t - S.t0, dur = Math.max(0.5, S.t1 - S.t0);
    // camera : a punch at the cut, then a slow push in towards the faces
    const punch = 1 - spring(lt, 0, 260, 24), drift = eio(seg(lt, 0, dur));
    const z = 1 + 0.055 * punch + (S.still ? 0 : 0.045 * drift);
    const cx = 540, cy = S.focusY || 860;
    R.cam.setAttribute('transform', `translate(${cx} ${cy}) scale(${z.toFixed(4)}) translate(${-cx} ${-cy})`);
    // the characters : breathing, a little life while they talk, the mouth on the voice, the blinks
    for (const C of R.chars) {
      const talk = speaking(C.who, t), m = talk ? mouth(C.who, t) : 0;
      const shut = blinking(t, C.seed), open = !shut && m > 0.32;
      show(C.fig, !shut && !open); show(C.figT, open); show(C.figB, shut);
      const br = Math.sin((t + C.seed * 0.37) * 2.6) * 0.006;
      const rot = talk ? noise(t * 2.2, C.seed) * 1.4 : noise(t * 0.5, C.seed) * 0.4;
      const hop = talk ? -Math.max(0, m - 0.5) * 10 : 0;
      if (C.body) C.body.setAttribute('transform', `translate(${C.fx} ${C.fy + hop}) rotate(${rot.toFixed(3)}) scale(${(1 - br * 0.4).toFixed(4)} ${(1 + br).toFixed(4)}) translate(${-C.fx} ${-C.fy})`);
      else { const fx = +C.el.dataset.fx, fy = +C.el.dataset.fy; C.el.setAttribute('transform', `translate(${fx} ${fy + hop}) rotate(${(rot * 1.5).toFixed(3)}) translate(${-fx} ${-fy})`); }
    }
    // what pops in
    for (const P of R.pops) {
      if (P.cls === 'bandeau') {
        if (P.el.parentNode !== R.ui) { // the end card's band slides in from the left after the logo (it never crosses the address)
          const k = spring(lt, 0.8, 200, 18);
          P.el.setAttribute('opacity', lt < 0.8 ? 0 : 1);
          P.el.setAttribute('transform', `translate(${((1 - k) * -1150).toFixed(1)} 0)`);
        } else { // the episode's banner is there from the very first image (text on screen at once), with a small punch
          scaleAt(P.el, P.c, 1 + 0.12 * (1 - spring(lt, 0, 260, 14)));
        }
        continue;
      }
      if (P.cls === 'phone' && R.phoneCont) { P.el.removeAttribute('transform'); continue; }
      const [dl0, k0, d0, s0] = POP[P.cls] || [0, 260, 20, 0.6], dl = P.dl != null ? P.dl : dl0;
      let k = s0 + (1 - s0) * spring(lt, dl, k0, d0);
      if (GONE[P.cls] && dur > GONE[P.cls] + 0.6) k *= 1 - eout(seg(lt, GONE[P.cls], GONE[P.cls] + 0.22));
      let extra = '';
      if (P.cls === 'knock') { const j = lt < 0.7 ? Math.sin(lt * 70) * 7 * Math.exp(-lt * 3) : 0; extra = `translate(${j.toFixed(1)} 0)`; }
      if (P.cls === 'sticker') { const w = Math.sin((lt - dl) * 5) * 5 * Math.exp(-Math.max(0, lt - dl - 0.5) * 0.4); extra = `rotate(${w.toFixed(2)} ${P.c[0].toFixed(1)} ${P.c[1].toFixed(1)})`; }
      if (P.cls === 'dream') extra = `translate(0 ${(Math.sin(lt * 2.2) * 8).toFixed(1)})`;
      if (P.cls === 'notif') extra = `translate(0 ${((1 - spring(lt, 0.25, 220, 20)) * -160).toFixed(1)})`;
      P.el.setAttribute('opacity', lt < dl ? 0 : 1);
      scaleAt(P.el, P.c, Math.max(0.001, k), extra);
    }
    // the rest of the life of a shot
    R.spins.forEach(el => el.setAttribute('transform', `rotate(${(lt * 1440) % 360})`));
    R.hands.forEach(el => el.setAttribute('transform', `rotate(${(lt * 540).toFixed(1)} ${el.dataset.cx} ${el.dataset.cy})`));
    if (R.bus) R.bus.setAttribute('transform', `translate(${(1500 - 3000 * seg(lt, 0.2, Math.min(dur, 2.6))).toFixed(1)} 0)`);
    R.dogs.forEach(el => el.setAttribute('transform', `translate(0 ${(-Math.abs(Math.sin(lt * 13)) * 16).toFixed(1)})`));
    R.smoke.forEach(el => el.setAttribute('transform', `translate(${(lt * 18).toFixed(1)} ${(-lt * 46).toFixed(1)})`));
    R.lights.forEach(el => el.setAttribute('opacity', (0.65 + 0.35 * (noise(t * 9, 4) + 1) / 2).toFixed(3)));
    R.caps.forEach(el => el.setAttribute('transform', `translate(0 ${(-70 * eio(seg(lt, 0.8, dur))).toFixed(1)})`));
    R.scooters.forEach(el => el.setAttribute('transform', `translate(${(noise(t * 18, 9) * 3).toFixed(1)} ${(noise(t * 21, 5) * 2.5).toFixed(1)})`));
    R.kfs.forEach(K => kf(K, lt, dur));
    // the Stalak screen : the song and the takes go in (they pop one by one), « Montage du clip… », then the clip plays,
    // cut from one take to the next every 2 beats of the music, Liam's mouth opening on the half beats
    for (const K of R.stk) {
      const ti = K.ti < 0 ? 1e9 : K.ti, importing = lt < ti;
      if (K.imp) K.imp.setAttribute('display', importing ? 'inline' : 'none');
      if (importing) {
        K.ths.forEach((h, j) => { const d = 0.45 + 0.24 * j; h.el.setAttribute('opacity', lt < d ? 0 : 1); scaleAt(h.el, h.c, Math.max(0.001, spring(lt, d, 300, 15))); });
        if (K.ck) K.ck.setAttribute('opacity', lt < 0.3 ? 0 : 1);
        const mkT = K.ti < 0 ? 0.45 + 0.24 * K.ths.length + 0.4 : Math.max(0.6, ti - 1.0);
        if (K.mk) K.mk.setAttribute('display', lt >= mkT ? 'inline' : 'none');
        if (K.spin) K.spin.setAttribute('transform', `rotate(${(lt * 240).toFixed(1)} ${K.spin.dataset.cx} ${K.spin.dataset.cy})`);
      }
      const per = S.beat || 0.5, b0 = S.beat0 != null ? S.beat0 : S.t0, pt = t - b0;
      const j = ((Math.floor(pt / (2 * per)) % K.n) + K.n) % K.n, open = (((pt / (per / 2)) % 1) + 1) % 1 < 0.5;
      K.tks.forEach((el, q) => el.setAttribute('display', q === j ? 'inline' : 'none'));
      K.raps.forEach(r => { if (r.fig) r.fig.setAttribute('display', open ? 'none' : 'inline'); if (r.figT) r.figT.setAttribute('display', open ? 'inline' : 'none'); });
      if (K.ph) { const t0 = Math.max(0, K.ti), p = importing ? 0 : clamp((lt - t0) / Math.max(1, dur - t0), 0, 1); K.ph.setAttribute('transform', `translate(${(p * 480).toFixed(1)} 0)`); }
    }
    // the subtitle of the moment, with a small pop when it changes ; a shout : big words, one by one (owner, 16/11)
    const sb = D.subs.find(x => t >= x.t0 && t < x.t1);
    const key = sb ? sb.who + '|' + sb.text : null;
    if (key !== R.lastSub) {
      R.subs.innerHTML = sb && sb.kind !== 'cri' ? FRAME.sub(1, sb.who, sb.text) : '';
      R.cri.innerHTML = ''; R.criW = null;
      if (sb && sb.kind === 'cri') {
        const L = FRAME.criLayout(sb.who, sb.text, R.criY);
        R.cri.innerHTML = `<g transform="rotate(-3 500 ${R.criY})"><g class="cn">${FRAME.criName(sb.who, L)}</g>` + L.words.map(o => `<g class="cw">${FRAME.criWord(o)}</g>`).join('') + '</g>';
        const els = [...R.cri.querySelectorAll('.cw')], wt = sb.words || [];
        R.criW = els.map((el, q) => ({ el, c: [L.words[q].x + L.words[q].ww / 2, L.words[q].y - L.size * 0.34], t: wt[q] != null ? wt[q] : sb.t0 + q * 0.22 }));
        R.criN = { el: R.cri.querySelector('.cn'), c: [L.left + 60, L.top - 40] };
      }
      R.lastSub = key;
    }
    if (sb && sb.kind === 'cri' && R.criW) {
      scaleAt(R.criN.el, R.criN.c, Math.max(0.001, spring(t, sb.t0, 320, 16)));
      for (const w of R.criW) {
        w.el.setAttribute('display', t >= w.t ? 'inline' : 'none');
        // each word grows from small with a little bounce (never bigger than its place : it does not cover its neighbours)
        if (t >= w.t) scaleAt(w.el, w.c, Math.max(0.001, 0.25 + 0.75 * spring(t, w.t, 520, 26)), `rotate(${(6 * (1 - spring(t, w.t, 300, 16))).toFixed(2)} ${w.c[0].toFixed(1)} ${w.c[1].toFixed(1)})`);
      }
    } else if (sb) { const k = 0.86 + 0.14 * spring(t, sb.t0, 320, 22); R.subs.setAttribute('transform', `translate(500 1420) scale(${k.toFixed(4)}) translate(-500 -1420)`); }
    // a change of time or place (a shot with dip : true, the one with its caption) : the picture goes dark, then the new
    // moment appears, so that a child understands that time has passed (owner, 16/11 at 17 h 04 : « pas de passage trop rapide »)
    const nx = D.shots[R.i + 1];
    let dk = 0;
    if (S.dip) dk = Math.max(dk, 1 - eout(seg(lt, 0, 0.4)));
    if (nx && nx.dip) dk = Math.max(dk, eio(seg(t, S.t1 - 0.35, S.t1)));
    svg.querySelector('#dip').setAttribute('opacity', dk.toFixed(3));
  };

  // for the render : the picture at t, once the pictures of a new shot are decoded
  window.seekAsync = async function (t) {
    justComposed = false;
    seek(t);
    if (justComposed) await Promise.all([...svg.querySelectorAll('image')].map(im => new Promise(r => { const i2 = new Image(); i2.onload = i2.onerror = r; i2.src = im.getAttribute('href'); })));
    if (window.__afterPaint) await window.__afterPaint(); // (anim.html : two painted frames before the screenshot)
  };

  // for HyperFrames (tcrazy.py hf : the engine is the runtime of a HyperFrames composition, seeked with hf-seek) : the same
  // picture, ready once the pictures of a new shot are decoded ; HyperFrames takes the picture itself
  window.seekReady = async function (t) {
    justComposed = false;
    seek(t);
    if (justComposed) await Promise.all([...svg.querySelectorAll('image')].map(im => new Promise(r => { const i2 = new Image(); i2.onload = i2.onerror = r; i2.src = im.getAttribute('href'); })));
  };

  // fonts and pictures first, then the first frame
  const imgs = ['/site_src/icons/icon.svg'].concat((D.preload || []));
  document.fonts.load('66px "Lilita One"').then(() => document.fonts.load('800 44px Rubik')).then(() => document.fonts.load('700 42px Rubik')).then(() => document.fonts.load('900 48px Rubik'))
    .then(() => Promise.all(imgs.map(src => new Promise(r => { const im = new Image(); im.onload = im.onerror = r; im.src = src; }))))
    .then(() => { seek(0); setTimeout(() => { window.ready = true; }, 100); });
})();
