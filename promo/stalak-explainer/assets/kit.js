/* Stalak explainer: small seek-safe helpers shared by the scenes (every call adds tweens to the scene's own paused timeline). */
window.KIT = {
  // words of a line rise out of the screen one after another
  words: function (tl, sel, t, step, dur) {
    tl.fromTo(sel + " .w", { opacity: 0, y: 46, rotationX: -70, filter: "blur(10px)", transformPerspective: 900, transformOrigin: "50% 100%" },
      { opacity: 1, y: 0, rotationX: 0, filter: "blur(0px)", transformPerspective: 900, duration: dur || 0.34, ease: "expo.out", stagger: step || 0.08 }, t);
  },
  // a key word slams in from the camera
  slam: function (tl, sel, t) {
    tl.fromTo(sel, { opacity: 0, scale: 1.9, filter: "blur(14px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.26, ease: "expo.out" }, t);
  },
  // leave upward, blurring
  out: function (tl, sel, t, dur) {
    tl.to(sel, { opacity: 0, y: -50, filter: "blur(12px)", duration: dur || 0.22, ease: "power2.in" }, t);
  },
  // a card pops toward the camera
  pop: function (tl, sel, t, from) {
    var f = Object.assign({ opacity: 0, scale: 0.55, z: -300, rotationX: 25, transformPerspective: 1200 }, from || {});
    tl.fromTo(sel, f, { opacity: 1, scale: 1, z: 0, rotation: 0, rotationX: 0, rotationY: 0, x: 0, y: 0, transformPerspective: 1200, duration: 0.42, ease: "back.out(1.5)" }, t);
  },
  // light sweeps across a phone's glass
  glare: function (tl, sel, t) {
    tl.fromTo(sel + " .glare .band", { x: 0 }, { x: 1300, duration: 0.7, ease: "power2.inOut", immediateRender: false }, t);
  },
  // a finger tap: a ring that grows and fades
  tap: function (tl, sel, t) {
    tl.fromTo(sel, { opacity: 0.95, scale: 0.3 }, { opacity: 0, scale: 1.6, duration: 0.45, ease: "expo.out", immediateRender: false }, t);
  },
  // swap the image shown in a phone/mac screen: the new one slides up over the old one
  swap: function (tl, outSel, inSel, t) {
    tl.fromTo(inSel, { opacity: 0, y: 80 }, { opacity: 1, y: 0, duration: 0.3, ease: "expo.out", immediateRender: false }, t);
    tl.to(outSel, { opacity: 0, duration: 0.2, ease: "power1.in" }, t + 0.06);
  }
};
