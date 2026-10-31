#!/usr/bin/env python3
"""Builds index.html for « Unfreeze your snippet » and writes the footage clips inside the scenes.

The film's clock is assets/beats.js (157 BPM, a downbeat at 3.5 s); the same numbers are repeated here.
Footage is cut exactly like Stalak's own edit (EDL below) and stays on the beat: take time = film time + OFF.
Run: python3 build.py
"""
import re, pathlib
P = pathlib.Path(__file__).parent
B = 60 / 157
def beat(k): return round(3.5 + k * B, 3)
def bar(n): return beat(4 * n)
OFF = -8.946
TOTAL = 28.0
# Stalak's own edit of the three takes (Version 1, 21 shots), in take time
CUTS = [0, .669, 1.434, 2.198, 3.727, 4.491, 5.256, 8.313, 9.842, 10.606, 11.371, 12.90, 14.428, 15.957, 16.721, 17.486, 19.015, 20.543, 22.072, 22.837, 23.601, 25.565]
TAKES = [2, 1, 3, 2, 1, 3, 1, 3, 1, 3, 1, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2]

# scene hosts: (file, start, end, z)
SCENES = [("s01-hook", 0.0, 3.62, 10), ("s02-logo", 3.40, 5.25, 11), ("s03-open", 4.95, 8.35, 12), ("s04-song", 8.0, 9.85, 13),
          ("s05-takes", 9.45, 11.4, 14), ("s06-beat", 10.95, 14.45, 15), ("s07-done", 13.9, 17.55, 16), ("s08-shuffle", 17.1, 19.05, 17),
          ("s09-reviews", 18.6, 23.6, 18), ("s10-end", 23.1, TOTAL, 19)]

def montage(prefix, s0, a, b, take=None, cls="clip"):
    """Clips of Stalak's edit between film times a and b, in the scene's local time (scene starts at s0).
    take=None follows the EDL; take=N keeps one take (a different 'version' of the edit)."""
    t0, t1, out = a + OFF, b + OFF, []
    if take is not None:
        return '<video id="%s" class="%s" data-hf-media-start-basis="local" src="assets/takes/take%d.mp4" data-start="%.3f" data-duration="%.3f" data-media-start="%.3f" muted playsinline></video>' % (
            prefix, cls, take, a - s0, b - a, t0)
    for k in range(21):
        x, y = max(CUTS[k], t0), min(CUTS[k + 1], t1)
        if y - x < 0.02: continue
        out.append('<video id="%s%d" class="%s" data-hf-media-start-basis="local" src="assets/takes/take%d.mp4" data-start="%.3f" data-duration="%.3f" data-media-start="%.3f" muted playsinline></video>'
                   % (prefix, k, cls, TAKES[k], (x - OFF) - s0, y - x, x))
    return "".join(out)

def put(name, marker, html):
    f = P / "compositions" / (name + ".html"); s = f.read_text()
    s2, n = re.subn(r"<!--%s-->.*?<!--/%s-->" % (marker, marker), "<!--%s-->%s<!--/%s-->" % (marker, html, marker), s, flags=re.S)
    if n != 1: raise SystemExit("marker %s missing in %s" % (marker, name))
    f.write_text(s2)

S = {n: (a, b) for n, a, b, z in SCENES}
# the finished snippet (s07) and the three versions (s08), in sync with the beat
a7, b7 = S["s07-done"]
put("s07-done", "MONTAGE", montage("d-m", a7, a7, b7))
a8, b8 = S["s08-shuffle"]
for i, tk in enumerate([2, 3, 1]):   # left, middle (the same shot the finished video ends on), right
    put("s08-shuffle", "V%d" % (i + 1), montage("u-v%d" % (i + 1), a8, a8, b8, take=tk))

# sound on every visible action: (id, file, film time of the action, length, volume); each peak lands on its frame
PEAK = {"impact-bass-1": 0.073, "impact-bass-2": 1.986, "pop": 0.12, "sparkle": 0.027, "whoosh": 0.162, "whoosh-short": 0.08, "whoosh-cinematic": 0.35,
        "riser": 0.0, "click": 0.01, "click-soft": 0.01, "typing": 0.0, "key-press": 0.01, "notification": 0.02, "glitch-1": 0.02, "glitch-2": 0.02, "chime": 0.02, "ping": 0.02}
SFX = [("x-ice", "glitch-1", 0.05, 0.6, 0.12), ("x-dive", "whoosh-short", 1.82, 0.57, 0.22)]
SFX += [("x-cut%d" % i, "click", t, 0.3, 0.32) for i, t in enumerate([beat(-3), beat(-2), beat(-1)])]
SFX += [("x-rise", "riser", 2.05, 1.45, 0.14), ("x-boom", "impact-bass-2", 3.5, 2.59, 0.36), ("x-burst", "whoosh-cinematic", 3.5, 1.6, 0.22),
        ("x-type", "typing", 5.62, 0.75, 0.22), ("x-go", "click-soft", 6.42, 0.3, 0.3), ("x-dive2", "whoosh", 7.95, 0.57, 0.2),
        ("x-drop", "pop", 8.685, 0.72, 0.24), ("x-takes", "whoosh-short", 9.62, 0.57, 0.2), ("x-flat", "whoosh-short", 11.0, 0.57, 0.16)]
SFX += [("x-beat%d" % i, "click", beat(22 + i), 0.3, 0.26) for i in range(6)]
SFX += [("x-big", "impact-bass-1", bar(6), 2.1, 0.24), ("x-into", "whoosh", 14.05, 0.57, 0.2), ("x-shuf", "whoosh-short", bar(9), 0.57, 0.22),
        ("x-r1", "notification", 18.95, 0.8, 0.2), ("x-r2", "notification", 19.95, 0.8, 0.2), ("x-r3", "notification", 20.95, 0.8, 0.2),
        ("x-flakes", "sparkle", 23.12, 1.8, 0.2), ("x-logo", "impact-bass-1", bar(13), 2.1, 0.26), ("x-s1", "pop", 23.6, 0.72, 0.2), ("x-s2", "pop", 23.9, 0.72, 0.2),
        ("x-url", "key-press", 24.0, 0.3, 0.2), ("x-land", "pop", 24.1, 0.72, 0.18), ("x-freeze", "glitch-2", 27.3, 0.6, 0.16), ("x-frost", "sparkle", 27.32, 0.62, 0.16)]
rows, lanes = [], []   # each sound on the first Studio lane that is free at its time
for sid, fn, at, ln, vol in sorted(SFX, key=lambda r: r[2] - PEAK[r[1]]):
    t = max(0.0, at + 1 / 30 - PEAK[fn])
    lane = next((i for i, end in enumerate(lanes) if end <= t), None)
    if lane is None: lanes.append(0); lane = len(lanes) - 1
    lanes[lane] = t + ln
    rows.append('<audio id="%s" class="clip" src="assets/sfx/%s.mp3" data-start="%.3f" data-duration="%.2f" data-track-index="%d" data-volume="%.2f"></audio>' % (sid, fn, t, ln, 12 + lane, vol))

hosts = ['<div id="h-stage" data-composition-id="stage" data-composition-src="compositions/stage.html" data-start="0" data-duration="%.3f" data-track-index="0" data-track-kind="graphics" data-width="1080" data-height="1920" style="z-index:1"></div>' % TOTAL]
for i, (name, a, b, z) in enumerate(SCENES):
    hosts.append('<div id="h-%s" data-composition-id="%s" data-composition-src="compositions/%s.html" data-start="%.3f" data-duration="%.3f" data-track-index="%d" data-track-kind="graphics" data-width="1080" data-height="1920" style="z-index:%d"%s></div>'
                 % (name[:3], name[:3], name, a, b - a, 1 + i % 2, z, ' data-variable-values=\'{"site":"stalak.app","handle":"@stalak_app"}\'' if name == "s10-end" else ""))
hosts.append('<div id="h-snow" data-composition-id="snow" data-composition-src="compositions/snow.html" data-start="0" data-duration="%.3f" data-track-index="3" data-track-kind="graphics" data-width="1080" data-height="1920" data-variable-values=\'{"density":"sparse","speed":"calm"}\' style="z-index:60"></div>' % TOTAL)
music = '<audio id="music" class="clip" src="assets/audio/music.wav" data-start="0" data-duration="%.3f" data-track-index="10" data-timeline-role="music" data-volume="0.9"></audio>' % TOTAL

html = """<!doctype html>
<html lang="en" data-resolution="portrait" data-composition-variables='[
    {"id":"site","type":"string","label":"Website","default":"stalak.app"},
    {"id":"handle","type":"string","label":"Social handle","default":"@stalak_app"}
  ]'>
  <head>
    <meta charset="UTF-8" /><meta name="viewport" content="width=1080, height=1920" />
    <title>Stalak — Unfreeze your snippet (promo v3, 9:16)</title>
    <script src="assets/vendor/gsap.min.js"></script>
    <script src="assets/kit.js"></script>
    <script src="assets/beats.js"></script>
    <link rel="stylesheet" href="assets/kit.css" />
    <style>html, body { margin: 0; width: 1080px; height: 1920px; overflow: hidden; background: #1f6fd6; } #root { position: relative; width: 1080px; height: 1920px; overflow: hidden; background: #1f6fd6; }</style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="%(total).3f" data-width="1080" data-height="1920">
      <!-- generated by build.py: edit build.py, then run python3 build.py -->
      %(hosts)s
      %(music)s
      %(sfx)s
    </div>
    <script>
      window.__timelines = window.__timelines || {};
      window.__timelines["main"] = gsap.timeline({ paused: true });
    </script>
  </body>
</html>
""" % {"total": TOTAL, "hosts": "\n      ".join(hosts), "music": music, "sfx": "\n      ".join(rows)}
(P / "index.html").write_text(html)
print("scenes:", [(n, a, round(b - a, 3)) for n, a, b, z in SCENES])
