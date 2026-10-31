#!/usr/bin/env python3
"""Builds index.html and assets/times.js for « Before midnight » from timing.json (the voice decides the times).

timing.json: lines [[start,end]...] (12, the SPEC shots), words {name: film time}, total, vo, c (instrumental time at film 0),
beat_drop (film time where the bass returns = a downbeat of the instrumental at 40.095).
Footage is cut like Stalak's own edit (EDL) and stays on the beat: take time = film time + c - 49.041.
Run: python3 build.py
"""
import json, re, pathlib
P = pathlib.Path(__file__).parent
T = json.loads((P / "timing.json").read_text())
L, W, TOTAL, C = T["lines"], T["words"], T["total"], T["c"]
OFF = C - 49.041
B = 60 / 157
def beat(k): return round(T["beat_drop"] + k * B, 3)
CUTS = [0, .669, 1.434, 2.198, 3.727, 4.491, 5.256, 8.313, 9.842, 10.606, 11.371, 12.90, 14.428, 15.957, 16.721, 17.486, 19.015, 20.543, 22.072, 22.837, 23.601, 25.565]
TAKES = [2, 1, 3, 2, 1, 3, 1, 3, 1, 3, 1, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2]

# scenes: (file, start, end). Each starts a little before its line and ends a little after the next one starts.
S = [l[0] for l in L]
SC = [("s01-midnight", 0.0, S[1] + 0.2), ("s02-forty", S[1] - 0.25, S[2] + 0.1), ("s03-again", S[2] - 0.08, S[3] + 0.15), ("s04-rewind", S[3] - 0.2, S[4] + 0.1),
      ("s05-song", S[4] - 0.3, S[5] + 0.15), ("s06-takes", S[5] - 0.2, S[6] + 0.15), ("s07-beat", S[6] - 0.2, S[7] + 0.1), ("s08-style", S[7] - 0.15, S[8] + 0.1),
      ("s09-done", S[8] - 0.2, S[9] + 0.1), ("s10-three", S[9] - 0.15, S[10] + 0.1), ("s11-free", S[10] - 0.12, S[11] + 0.05), ("s12-end", S[11] - 0.2, TOTAL)]

FROST = '{"preset":null,"intensity":1,"adjust":{"exposure":0.08,"contrast":0.1,"highlights":0.15,"shadows":0,"whites":0,"blacks":0,"temperature":-0.8,"tint":0,"vibrance":0,"saturation":-0.4},"details":{"vignette":0,"vignetteMidpoint":0.5,"vignetteRoundness":0,"vignetteFeather":0.65,"grain":0,"grainSize":0.25,"grainRoughness":0.5},"effects":{"blur":0,"pixelate":0,"chromaBleed":0,"tapeDamage":0,"tapeTracking":0,"tapeNoise":1,"tapeSpeed":0.5,"filmArtifacts":0,"halftone":0,"halftoneSize":0,"twoInkPrint":0,"twoInkPrintSize":0,"ascii":0,"asciiSize":0.06578947368421052,"asciiInvert":0,"asciiStyle":0,"asciiColor":1,"asciiRotation":0,"dither":0,"ditherSize":0,"bloom":0.25,"bloomRadius":8,"monoScreen":0,"monoScreenSize":0,"monoScreenAngle":0,"monoScreenSpread":0,"monoScreenShape":0,"monoScreenInvert":0,"scanlines":0,"scanlineCount":0,"scanlineSoftness":0,"chromaticAberration":0,"chromaticAngle":0,"crtCurvature":0,"digitalGlitch":0,"digitalGlitchColorSplit":0,"digitalGlitchLineTear":0,"digitalGlitchPixelate":0,"digitalGlitchBlockAmount":0,"digitalGlitchBlockDisplacement":0,"digitalGlitchBlockOpacity":0,"digitalGlitchSpeed":0,"engraving":0,"engravingSpacing":0.4117647058823529,"engravingMinThickness":0.2,"engravingMaxThickness":0.4571428571428572,"engravingAngle":0.25,"engravingContrast":0.4666666666666667,"engravingSharpness":0.59,"engravingWave":0.2,"engravingWaveFrequency":0.2222222222222222,"crosshatch":0,"crosshatchSpacing":0.28,"crosshatchThickness":0.25,"crosshatchAngle":0.25,"crosshatchContrast":0.3333333333333333,"crosshatchEdges":0.5,"crosshatchLineWeight":0,"crosshatchWave":0.33,"crosshatchWaveFrequency":0.2222222222222222,"kuwahara":0,"kuwaharaRadius":0.14285714285714285,"kuwaharaSharpness":0.3125,"kuwaharaSaturation":0.5},"lut":null,"colorSpace":"rec709","wheels":{"shadows":{"hue":212,"amount":0.42,"level":0},"midtones":{"hue":205,"amount":0.3,"level":0.04},"highlights":{"hue":195,"amount":0.22,"level":0.08}}}'   # the app's Frost filter as a media treatment (npx hyperframes media-treatment), kept across rebuilds
def montage(prefix, s0, a, b, take=None, extra=""):
    """clips of Stalak's edit between film times a and b, in the scene's local time (scene starts at s0)"""
    t0, t1, out = a + OFF, b + OFF, []
    if take is not None:
        return '<video id="%s" class="clip" data-hf-media-start-basis="local" src="assets/takes/take%d.mp4" data-start="%.3f" data-duration="%.3f" data-media-start="%.3f" muted playsinline></video>' % (prefix, take, a - s0, b - a, t0)
    for k in range(21):
        x, y = max(CUTS[k], t0), min(CUTS[k + 1], t1)
        if y - x < 0.02: continue
        out.append('<video id="%s%d" class="clip"%s data-hf-media-start-basis="local" src="assets/takes/take%d.mp4" data-start="%.3f" data-duration="%.3f" data-media-start="%.3f" muted playsinline></video>'
                   % (prefix, k, extra, TAKES[k], (x - OFF) - s0, y - x, x))
    return "".join(out)

def put(name, marker, html):
    f = P / "compositions" / (name + ".html"); s = f.read_text()
    s2, n = re.subn(r"<!--%s-->.*?<!--/%s-->" % (marker, marker), "<!--%s-->%s<!--/%s-->" % (marker, html, marker), s, flags=re.S)
    if n != 1: raise SystemExit("marker %s missing in %s" % (marker, name))
    f.write_text(s2)

st = {n: (a, b) for n, a, b in SC}
# the real finished video (s08 on the phone, s09 full screen): the EDL, starting at the lyric moment
a8, b8 = st["s08-style"]; put("s08-style", "MONTAGE", montage("y-m", a8, a8, b8, extra=' data-color-grading="%s"' % FROST.replace("&", "&amp;").replace('"', "&quot;")))
a9, b9 = st["s09-done"]; put("s09-done", "MONTAGE", montage("d-m", a9, a9, b9))
# the opening take (s01): take 1 at its start, slowed down, as the real person
# s06: the three takes on cards: stills (no video needed)

# times for the scenes (film seconds): window.T
times = {"L": L, "W": W, "S": {n: [a, b] for n, a, b in SC}, "TOTAL": TOTAL, "OFF": OFF, "BEAT": B, "DROP": T["beat_drop"]}
(P / "assets" / "times.js").write_text("/* generated by build.py from timing.json: the film's clock */\nwindow.T = %s;\nwindow.T.beat = function (k) { return window.T.DROP + k * window.T.BEAT; };\n" % json.dumps(times))

# sound on the visible actions: (id, file, film time, length, volume), each peak on its frame, greedy lanes
PEAK = {"impact-bass-1": 0.073, "impact-bass-2": 1.986, "pop": 0.12, "sparkle": 0.027, "whoosh": 0.162, "whoosh-short": 0.08, "whoosh-cinematic": 0.35,
        "riser": 0.0, "click": 0.01, "click-soft": 0.01, "typing": 0.0, "key-press": 0.01, "notification": 0.02, "glitch-1": 0.02, "glitch-2": 0.02, "chime": 0.02, "ping": 0.02}
SFX = [("x-tick", "click-soft", 0.3, 0.3, 0.14), ("x-tick2", "click-soft", 1.3, 0.3, 0.14), ("x-spin", "riser", S[1], 1.6, 0.14), ("x-forty", "impact-bass-1", W["forty"], 2.1, 0.3),
       ("x-flash", "whoosh-short", S[2] - 0.05, 0.57, 0.22)]
SFX += [("x-w%d" % i, "click", W[w], 0.3, 0.3) for i, w in enumerate(["cut", "trim", "sync", "again"])]
SFX += [("x-missed", "glitch-1", W["missed"], 0.6, 0.18), ("x-rew", "whoosh", W["rewind"], 0.57, 0.22), ("x-logo", "impact-bass-2", W["meet"], 2.59, 0.32), ("x-rays", "sparkle", W["meet"] + 0.25, 1.8, 0.2),
        ("x-phone", "whoosh-cinematic", S[4] - 0.2, 1.6, 0.22), ("x-drop", "pop", S[4] + 0.35, 0.72, 0.24), ("x-orbit", "whoosh-short", S[5], 0.57, 0.2),
        ("x-land", "whoosh-short", S[6] - 0.15, 0.57, 0.18)]
SFX += [("x-c%d" % i, "click", beat(i), 0.3, 0.26) for i in range(8)]
SFX += [("x-big", "impact-bass-1", beat(0), 2.1, 0.26), ("x-lyr", "pop", W["lyrics"] + 0.2, 0.72, 0.2), ("x-st1", "pop", W["style"] + 0.2, 0.72, 0.14), ("x-st2", "pop", W["style"] + 0.7, 0.72, 0.14), ("x-st3", "pop", W["style"] + 1.2, 0.72, 0.14),
        ("x-out", "whoosh", S[8] - 0.1, 0.57, 0.22), ("x-done", "sparkle", W["done"], 1.8, 0.2), ("x-three", "impact-bass-1", W["three"], 2.1, 0.3), ("x-strike", "whoosh-short", S[9] + 0.3, 0.57, 0.18),
        ("x-nd", "pop", W["nodl"], 0.72, 0.18), ("x-ns", "pop", W["nosu"], 0.72, 0.18), ("x-end", "impact-bass-2", W["stalak_end"], 2.59, 0.3), ("x-type", "typing", W["url"], 0.75, 0.2), ("x-btn", "pop", W["url"] + 0.9, 0.72, 0.2)]
rows, lanes = [], []
for sid, fn, at, ln, vol in sorted(SFX, key=lambda r: r[2] - PEAK[r[1]]):
    t = max(0.0, at + 1 / 30 - PEAK[fn])
    lane = next((i for i, end in enumerate(lanes) if end <= t), None)
    if lane is None: lanes.append(0); lane = len(lanes) - 1
    lanes[lane] = t + ln
    rows.append('<audio id="%s" class="clip" src="assets/sfx/%s.mp3" data-start="%.3f" data-duration="%.2f" data-track-index="%d" data-volume="%.2f"></audio>' % (sid, fn, t, ln, 12 + lane, vol))

# the music: muffled and low under the first lines, the bass returns at beat_drop, full at the end
drop = T["beat_drop"]
pts = [(0, 0.22), (drop - 0.3, 0.22), (drop, 0.42), (S[7] - 0.1, 0.3), (S[8] - 0.2, 0.3), (S[8], 0.5), (S[9] - 0.2, 0.5), (S[9], 0.26), (S[11], 0.26), (S[11] + 0.6, 0.45), (TOTAL, 0)]
auto = json.dumps({"version": 1, "lanes": [{"target": "volume", "points": [{"t": round(t, 3), "v": v} for t, v in pts]}]}, separators=(",", ":"))
music = '<audio id="music" class="clip" src="assets/audio/inst.mp3" data-start="0" data-duration="%.3f" data-media-start="%.3f" data-track-index="10" data-timeline-role="music" data-volume="1" data-fade-out="1.2" data-automation=\'%s\'></audio>' % (TOTAL, C, auto)
vo = '<audio id="vo" class="clip" src="assets/audio/%s" data-start="%.3f" data-duration="%.3f" data-track-index="11" data-volume="1"></audio>' % (T["vo"], T["vo_start"], 35.8)

hosts = ['<div id="h-stage" data-composition-id="stage" data-composition-src="compositions/stage.html" data-start="0" data-duration="%.3f" data-track-index="0" data-track-kind="graphics" data-width="1080" data-height="1920" style="z-index:5"></div>' % TOTAL]
for i, (name, a, b) in enumerate(SC):
    hosts.append('<div id="h-%s" data-composition-id="%s" data-composition-src="compositions/%s.html" data-start="%.3f" data-duration="%.3f" data-track-index="%d" data-track-kind="graphics" data-width="1080" data-height="1920" style="z-index:%d"></div>'
                 % (name[:3], name[:3], name, a, b - a, 1 + i % 2, 10 + i))
html = """<!doctype html>
<html lang="en" data-resolution="portrait">
  <head>
    <meta charset="UTF-8" /><meta name="viewport" content="width=1080, height=1920" />
    <title>Stalak — Before midnight (trailer v4, 9:16)</title>
    <script src="assets/vendor/gsap.min.js"></script>
    <script src="assets/kit.js"></script>
    <script src="assets/trailer.js"></script>
    <script src="assets/times.js"></script>
    <link rel="stylesheet" href="assets/kit.css" />
    <link rel="stylesheet" href="assets/trailer.css" />
    <style>html, body { margin: 0; width: 1080px; height: 1920px; overflow: hidden; background: #0e0f13; } #root { position: relative; width: 1080px; height: 1920px; overflow: hidden; background: #0e0f13; }</style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="%(total).3f" data-width="1080" data-height="1920">
      <!-- generated by build.py from timing.json: edit timing.json, then run python3 build.py -->
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
""" % {"total": TOTAL, "hosts": "\n      ".join(hosts), "music": music, "vo": vo, "sfx": "\n      ".join(rows)}
(P / "index.html").write_text(html)
print("scenes:", [(n, a, round(b - a, 2)) for n, a, b in SC])
