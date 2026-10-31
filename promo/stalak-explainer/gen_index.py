#!/usr/bin/env python3
"""Builds index.html from timing.json and updates the timings written inside the scenes.

timing.json:
  lines : [[start, end], ...]   one per voice-over line (13), in film seconds
  total : film length
  c     : instrumental time at film 0 (the beat, aligned to the takes)
  vo    : the voice-over file in assets/audio/
Footage is cut exactly like Stalak's own edit (EDL below) and kept in sync with the beat:
take time = film time + c - 49.041 (the takes start 49.041 s into the instrumental).
"""
import json, re, pathlib
P = pathlib.Path(__file__).parent
T = json.loads((P / "timing.json").read_text())
L, TOTAL, C = T["lines"], T["total"], T["c"]
OFF = C - 49.041
SCENES = ["s01-hook", "s02-meet", "s03-devices", "s04-song", "s05-takes", "s06-sync-cut", "s07-lyrics",
          "s08-style", "s09-export", "s10-pack", "s11-free", "s12-post", "s13-end"]
# Stalak's own edit of the three takes (Version 1, 21 shots), in take time
CUTS = [0, .669, 1.434, 2.198, 3.727, 4.491, 5.256, 8.313, 9.842, 10.606, 11.371, 12.90, 14.428, 15.957, 16.721, 17.486, 19.015, 20.543, 22.072, 22.837, 23.601, 25.565]
TAKES = [2, 1, 3, 2, 1, 3, 1, 3, 1, 3, 1, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2]

starts = [0.0] + [round(max(0.0, l[0] - 0.15), 3) for l in L[1:]]
durs = [round((starts[i + 1] - starts[i]) + 0.35, 3) for i in range(len(starts) - 1)] + [round(TOTAL - starts[-1], 3)]

def montage(sid, F, B, D):
    t0 = F + B + OFF; t1 = F + D + OFF; out = []
    for k in range(21):
        a, b = max(CUTS[k], t0), min(CUTS[k + 1], t1)
        if b - a < 0.02: continue
        out.append('<video id="%s-m%d" class="clip" data-hf-media-start-basis="local" src="assets/takes/take%d.mp4" data-start="%.3f" data-duration="%.3f" data-media-start="%.3f" muted playsinline></video>'
                   % (sid, k, TAKES[k], B + (a - t0), b - a, a))
    return "".join(out), t0

for i, name in enumerate(SCENES):
    f = P / "compositions" / (name + ".html"); s = f.read_text()
    s = re.sub(r"var D = [0-9.]+", "var D = %.3f" % durs[i], s, count=1)
    m = re.search(r"<!--MONTAGE (s\d\d) ([0-9.]+)-->(.*?)<!--/MONTAGE-->", s, re.S) or re.search(r"<!--MONTAGE (s\d\d) ([0-9.]+)-->()", s)
    if m:
        sid, B = m.group(1), float(m.group(2))
        clips, tau0 = montage(sid, starts[i], B, durs[i])
        s = s[:m.start()] + "<!--MONTAGE %s %s-->%s<!--/MONTAGE-->" % (sid, m.group(2), clips) + s[m.end():]
        s = re.sub(r"TAU0 = [0-9.\-]+", "TAU0 = %.3f" % tau0, s, count=1)
    f.write_text(s)

w = P / "compositions" / "world.html"; s = w.read_text()
s = re.sub(r"var D = [0-9.]+", "var D = %.3f" % TOTAL, s, count=1)
s = re.sub(r"var CUTS = \[[^\]]*\]", "var CUTS = [%s]" % ", ".join("%.2f" % x for x in starts[1:]), s, count=1)
w.write_text(s)

# the music: low under the voice, up in the gaps, up at the end; the voice on top
pts = ["0:0.30"]
for i, (a, b) in enumerate(L):
    pts.append("%.2f:0.13" % max(0.0, a - 0.12))
    nxt = L[i + 1][0] if i + 1 < len(L) else TOTAL
    if nxt - b > 0.45: pts += ["%.2f:0.13" % (b + 0.05), "%.2f:0.32" % (b + 0.2), "%.2f:0.32" % (nxt - 0.25)]
pts.append("%.2f:0.13" % (L[-1][1] + 0.05)); pts.append("%.2f:0.42" % (L[-1][1] + 0.3)); pts.append("%.2f:0" % TOTAL)
for sw in T.get("swell", []):   # a short lift of the beat in a breath of the voice (the drop)
    pts += ["%.2f:0.13" % (sw - 0.12), "%.2f:0.34" % sw, "%.2f:0.13" % (sw + 0.16)]
pts = sorted(pts, key=lambda q: float(q.split(":")[0]))
music = ('<audio id="music" class="clip" src="assets/audio/inst.mp3" data-start="0" data-duration="%.3f" data-media-start="%.3f" data-track-index="10" '
         'data-timeline-role="music" data-volume="1" data-fade-out="1.4" data-automation=\'%s\'></audio>' % (TOTAL, C, json.dumps({"version": 1, "lanes": [{"target": "volume", "points": [{"t": float(q.split(":")[0]), "v": float(q.split(":")[1])} for q in pts]}]}, separators=(",", ":"))))
vo = '<audio id="vo" class="clip" src="assets/audio/%s" data-start="%.3f" data-duration="%.3f" data-track-index="11" data-volume="1"></audio>' % (T["vo"], T.get("vo_start", 0), T.get("vo_len", TOTAL - T.get("vo_start", 0)))
# sound on the visible actions: (id, file, scene, local time of the action, length, volume); each peak lands on its frame
PEAK = {"impact-bass-1": 0.073, "impact-bass-2": 1.986, "pop": 0.12, "sparkle": 0.027, "whoosh": 0.162, "whoosh-short": 0.08, "riser": 0.0}
SFX = [("x-crack", "sparkle", 0, -1, 1.8, 0.2), ("x-hook", "impact-bass-1", 0, 0.72, 2.1, 0.32), ("x-shatter", "whoosh-short", 1, 0.0, 0.57, 0.3),
       ("x-logo", "impact-bass-2", 1, 0.3, 2.59, 0.3), ("x-mas", "pop", 1, 0.5, 0.72, 0.18), ("x-ph", "whoosh", 2, 0.2, 0.57, 0.22),
       ("x-mac", "whoosh-short", 2, 1.3, 0.57, 0.26), ("x-dive", "whoosh-short", 3, 0.0, 0.57, 0.24), ("x-drop", "pop", 3, 0.78, 0.72, 0.22),
       ("x-pick", "pop", 3, 1.25, 0.72, 0.14), ("x-film", "pop", 4, 0.6, 0.72, 0.16), ("x-imp", "pop", 4, 2.05, 0.72, 0.16),
       ("x-in", "whoosh-short", 4, -0.8, 0.57, 0.22), ("x-sync", "sparkle", 5, 0.9, 1.8, 0.16), ("x-cut", "impact-bass-1", 5, 2.1, 2.1, 0.26),
       ("x-lyr", "pop", 6, 0.42, 0.72, 0.14), ("x-auto", "sparkle", 6, 2.35, 1.8, 0.18), ("x-dive2", "whoosh-short", 6, -0.38, 0.57, 0.22),
       ("x-pan", "whoosh-short", 7, 0.18, 0.57, 0.16), ("x-st1", "pop", 7, 0.5, 0.72, 0.1), ("x-st2", "pop", 7, 1.34, 0.72, 0.1),
       ("x-st3", "sparkle", 7, 2.36, 1.8, 0.12), ("x-shuf", "pop", 7, 3.66, 0.72, 0.2), ("x-exp", "pop", 8, 0.36, 0.72, 0.22), ("x-open", "whoosh", 8, 0.4, 0.57, 0.2),
       ("x-done", "sparkle", 8, -0.85, 1.8, 0.24), ("x-pack", "pop", 9, 2.15, 0.72, 0.18), ("x-fill", "sparkle", 9, 2.95, 1.8, 0.16),
       ("x-nod", "impact-bass-1", 10, 0.18, 2.1, 0.22), ("x-nos", "impact-bass-1", 10, 0.98, 2.1, 0.22), ("x-post", "whoosh-short", 11, 0.55, 0.57, 0.2),
       ("x-end", "impact-bass-2", 12, 0.02, 2.59, 0.34), ("x-ice", "sparkle", 12, 0.9, 1.8, 0.18)]
rows = []
for sid, fn, sc, lt, ln, vol in SFX:
    at = (starts[sc] + lt) if lt >= 0 else (starts[sc] + durs[sc] + lt) if sc + 1 < len(starts) else starts[sc] + lt
    if sid == "x-crack": at = 0.15
    t = max(0.0, at + 1 / 30 - PEAK[fn])
    rows.append('<audio id="%s" class="clip" src="assets/sfx/%s.mp3" data-start="%.3f" data-duration="%.2f" data-track-index="%d" data-volume="%.2f"></audio>' % (sid, fn, t, ln, 12 + len(rows) % 4, vol))
sfx = "\n      ".join(rows)

hosts = ['<div id="h-world" data-composition-id="world" data-composition-src="compositions/world.html" data-start="0" data-duration="%.3f" data-track-index="0" data-track-kind="graphics" data-width="1080" data-height="1920" style="z-index:0"></div>' % TOTAL]
for i, name in enumerate(SCENES):
    hosts.append('<div id="h-%s" data-composition-id="s%02d" data-composition-src="compositions/%s.html" data-start="%.3f" data-duration="%.3f" data-track-index="%d" data-track-kind="graphics" data-width="1080" data-height="1920" style="z-index:%d"%s></div>'
                 % (name[:3], i + 1, name, starts[i], durs[i], 1 + i % 2, 2 + i, ' data-variable-values=\'{"site":"stalak.app","handle":"@stalak_app"}\'' if i == 12 else ""))
hosts.append('<div id="h-snow" data-composition-id="snow" data-composition-src="compositions/snow.html" data-start="0" data-duration="%.3f" data-track-index="3" data-track-kind="graphics" data-width="1080" data-height="1920" data-variable-values=\'{"density":"sparse","speed":"calm"}\' style="z-index:60"></div>' % TOTAL)

html = """<!doctype html>
<html lang="en" data-resolution="portrait" data-composition-variables='[
    {"id":"site","type":"string","label":"Website","default":"stalak.app"},
    {"id":"handle","type":"string","label":"Social handle","default":"@stalak_app"}
  ]'>
  <head>
    <meta charset="UTF-8" /><meta name="viewport" content="width=1080, height=1920" />
    <title>Stalak — how it works (explainer, 9:16)</title>
    <script src="assets/vendor/gsap.min.js"></script>
    <script src="assets/kit.js"></script>
    <link rel="stylesheet" href="assets/kit.css" />
    <style>html, body { margin: 0; width: 1080px; height: 1920px; overflow: hidden; background: #1f6fd6; } #root { position: relative; width: 1080px; height: 1920px; overflow: hidden; background: #1f6fd6; }</style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="%(total).3f" data-width="1080" data-height="1920">
      <!-- generated by gen_index.py from timing.json: edit timing.json, then run python3 gen_index.py -->
      %(hosts)s
      %(music)s
      %(vo)s
      %(sfx)s
    </div>
    <script>
      window.__timelines = window.__timelines || {};
      window.__timelines["main"] = gsap.timeline({ paused: true });
    </script>
  </body>
</html>
""" % {"total": TOTAL, "hosts": "\n      ".join(hosts), "music": music, "vo": vo, "sfx": sfx}
(P / "index.html").write_text(html)
print("scenes:", [(SCENES[i][:3], starts[i], durs[i]) for i in range(len(SCENES))])
