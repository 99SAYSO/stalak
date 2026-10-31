/* The film's clock, shared by every scene (film seconds).
   The instrumental of "neva die" runs at 157 BPM and starts 40.095 s in, so a downbeat lands at 3.500 s.
   Footage is cut like Stalak's own edit and stays on the beat: take time = film time + OFF. */
window.BEAT = (function () {
  var B = 60 / 157, T0 = 3.5;
  function beat(k) { return Math.round((T0 + k * B) * 1000) / 1000; }
  function bar(n) { return beat(4 * n); }
  return {
    B: B, BAR: 4 * B, beat: beat, bar: bar, OFF: -8.946,
    crack: 1.75,          // the camera dives into a crack of the ice
    cuts: [beat(-3), beat(-2), beat(-1)],   // "cut." x3 inside the crack
    boom: 3.5,            // the ice block explodes, the beat opens up
    open: bar(1),         // the phone: just open stalak.app
    song: bar(3),         // 1. drop your song
    bassOut: 8.685,       // the bass drops out (the instrumental's break)
    takes: bar(4),        // 2. add your takes
    timeline: bar(5),     // 3. it cuts on the beat
    bassIn: beat(22),     // the bass comes back: the cuts start
    big: bar(6),
    done: bar(7),         // the finished snippet plays
    shuffle: bar(9),      // three edits at once
    reviews: bar(10),     // what beta testers say
    end: bar(13),         // the end card
    dance: 24.3,          // the mascot dances (from the start of her dance clip)...
    freeze: 27.3,         // ...and freezes again: the loop
    total: 28.0
  };
})();
