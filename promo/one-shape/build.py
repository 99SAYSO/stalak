#!/usr/bin/env python3
"""Builds « One take » (promo v5): index.html (music, voice, sounds, the film host), assets/times.js (the clock)
and the video clips inside compositions/film.html, from the beat grid of « neva die ».

The grid (measured on the instrumental, see SPEC.md): 157 BPM, a beat attack at inst 20.2946 s, downbeats on class 3.
inst = song + 23.13007 s (sample-accurate on the bass). Takes: take time = song time - 1.452 s (lip sync, from promo v1).
Film beat b is at b * P seconds; film 0 is a downbeat (song bar 6, inst bar 8).
Run: python3 build.py
"""
import json, re, pathlib, subprocess
import numpy as np

HERE = pathlib.Path(__file__).parent
P = 60 / 157
BAR = 4 * P
D0 = 20.2946 + 3 * P            # an instrumental downbeat
OFF = 23.13007                   # inst = song + OFF
TAKE = 1.452                     # take = song - TAKE
def B(b): return b * P
def inst_bar(k): return D0 + k * BAR
def song_bar(j): return inst_bar(j + 2) - OFF

TOTAL = round(B(77), 3)
# music: (id, file, film start, film end, media start, volume)
MUS = [
    ("m-hook", "song.mp3", 0.0, B(4), song_bar(6)),             # his song, his voice: the finished snippet
    ("m-walk", "inst.mp3", B(4), B(48), inst_bar(9)),           # the beat under the voice (bars 18-19 of the inst: the break)
    ("m-pay", "song.mp3", B(48), B(60), song_bar(2)),           # the drop: his song again, lips in sync
    ("m-end", "inst.mp3", B(60), TOTAL, inst_bar(23)),
]
FILM0_SONG = song_bar(6)
def take_hook(t): return FILM0_SONG + t - TAKE                 # film t -> take time, hook (song audible)
def take_pay(t): return song_bar(2) + (t - B(48)) - TAKE        # payoff (song audible)
def take_prev(t): return FILM0_SONG + t - TAKE - 8 * BAR      # previews under the instrumental (same beat phase)

# Stalak's real edit of this part (Version 1, 21 shots, 25.6 s), take times
CUTS = [0, .669, 1.434, 2.198, 3.727, 4.491, 5.256, 8.313, 9.842, 10.606, 11.371, 12.90, 14.428, 15.957, 16.721, 17.486, 19.015, 20.543, 22.072, 22.837, 23.601, 25.565]
TAKES = [2, 1, 3, 2, 1, 3, 1, 3, 1, 3, 1, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2]
FROST = '{"preset":null,"intensity":1,"adjust":{"exposure":0.08,"contrast":0.1,"highlights":0.15,"shadows":0,"whites":0,"blacks":0,"temperature":-0.8,"tint":0,"vibrance":0,"saturation":-0.4},"details":{"vignette":0,"vignetteMidpoint":0.5,"vignetteRoundness":0,"vignetteFeather":0.65,"grain":0,"grainSize":0.25,"grainRoughness":0.5},"effects":{"blur":0,"pixelate":0,"chromaBleed":0,"tapeDamage":0,"tapeTracking":0,"tapeNoise":1,"tapeSpeed":0.5,"filmArtifacts":0,"halftone":0,"halftoneSize":0,"twoInkPrint":0,"twoInkPrintSize":0,"ascii":0,"asciiSize":0.06578947368421052,"asciiInvert":0,"asciiStyle":0,"asciiColor":1,"asciiRotation":0,"dither":0,"ditherSize":0,"bloom":0.25,"bloomRadius":8,"monoScreen":0,"monoScreenSize":0,"monoScreenAngle":0,"monoScreenSpread":0,"monoScreenShape":0,"monoScreenInvert":0,"scanlines":0,"scanlineCount":0,"scanlineSoftness":0,"chromaticAberration":0,"chromaticAngle":0,"crtCurvature":0,"digitalGlitch":0,"digitalGlitchColorSplit":0,"digitalGlitchLineTear":0,"digitalGlitchPixelate":0,"digitalGlitchBlockAmount":0,"digitalGlitchBlockDisplacement":0,"digitalGlitchBlockOpacity":0,"digitalGlitchSpeed":0,"engraving":0,"engravingSpacing":0.4117647058823529,"engravingMinThickness":0.2,"engravingMaxThickness":0.4571428571428572,"engravingAngle":0.25,"engravingContrast":0.4666666666666667,"engravingSharpness":0.59,"engravingWave":0.2,"engravingWaveFrequency":0.2222222222222222,"crosshatch":0,"crosshatchSpacing":0.28,"crosshatchThickness":0.25,"crosshatchAngle":0.25,"crosshatchContrast":0.3333333333333333,"crosshatchEdges":0.5,"crosshatchLineWeight":0,"crosshatchWave":0.33,"crosshatchWaveFrequency":0.2222222222222222,"kuwahara":0,"kuwaharaRadius":0.14285714285714285,"kuwaharaSharpness":0.3125,"kuwaharaSaturation":0.5},"lut":null,"colorSpace":"rec709","wheels":{"shadows":{"hue":212,"amount":0.42,"level":0},"midtones":{"hue":205,"amount":0.3,"level":0.04},"highlights":{"hue":195,"amount":0.22,"level":0.08}}}'
GRADE_FROST = ' data-color-grading="%s"' % FROST.replace("&", "&amp;").replace('"', "&quot;")

def edl(prefix, a, b, tmap, extra="", only=None):
    """video clips of Stalak's edit shown between film times a and b; tmap(film t) -> take time"""
    out = []
    t0, t1 = tmap(a), tmap(b)
    for k in range(21):
        x, y = max(CUTS[k], t0), min(CUTS[k + 1], t1)
        if k == 20: y = min(25.55, t1)
        if y - x < 0.02: continue
        tk = only or TAKES[k]
        fa = a + (x - t0)
        out.append('<video id="%s%02d" class="clip v"%s data-hf-media-start-basis="local" src="assets/takes/take%d.mp4" data-start="%.3f" data-duration="%.3f" data-media-start="%.3f" muted playsinline></video>'
                   % (prefix, k, extra, tk, fa, y - x, x))
    return "\n".join(out)

def one(vid, take, a, b, tmedia, extra=""):
    return '<video id="%s" class="clip v"%s data-hf-media-start-basis="local" src="assets/takes/take%d.mp4" data-start="%.3f" data-duration="%.3f" data-media-start="%.3f" muted playsinline></video>' % (vid, extra, take, a, b - a, tmedia)

V = {}
# hook: film 0 -> the click (b4); the last shot is held to the click
hook = edl("vh", 0.0, B(4), take_hook)
V["HOOK"] = hook
# the three takes for the sync: out of sync first (b20 -> b23.5), then in sync (b23.5 -> b24.6)
SY_A, SY_S, SY_E = B(19.6), B(23.5), B(24.7)
offs = [0.42, -0.31, 0.23]
for i, tk in enumerate([1, 2, 3]):
    V["SYNC%d" % (i + 1)] = one("vs%da" % (i + 1), tk, SY_A, SY_S, take_prev(SY_A) + offs[i]) + "\n" + one("vs%db" % (i + 1), tk, SY_S, SY_E, take_prev(SY_S))
# the edit preview (b28 -> b40) and the filter preview (b40 -> b44, plain + Frost on top)
V["EDIT"] = edl("ve", B(28), B(40.45), take_prev)
V["FILT"] = edl("vf", B(40), B(44.3), take_prev, extra=GRADE_FROST)   # Frost faded in with --hf-color-grading-intensity
# the payoff: his finished snippet, full screen, Frost, with his voice
V["PAY"] = edl("vp", B(48), B(60.4), take_pay, extra=GRADE_FROST)

film = HERE / "compositions" / "film.html"
s = film.read_text()
for k, html in V.items():
    s, n = re.subn(r"<!--%s-->.*?<!--/%s-->" % (k, k), "<!--%s-->\n%s\n<!--/%s-->" % (k, html, k), s, flags=re.S)
    if n != 1: raise SystemExit("marker %s missing" % k)
film.write_text(s)

# voice: 14 lines, each on its beat (speech onset), clip starts speech_offset earlier
VO = json.loads((HERE / "assets/audio/vo/vo_clips.json").read_text())
VO_AT = [B(4), B(10.25), B(12.75), B(17.75), B(20), B(24.25), B(28), B(36), B(40), B(44), B(60), B(64.75), B(68.75), B(72.5)]
vo_rows, vo_spans = [], []
for i, (c, at) in enumerate(zip(VO, VO_AT)):
    st = at - c["speech_offset"]
    vo_rows.append('<audio id="%s" class="clip" src="assets/audio/vo/%s.wav" data-start="%.3f" data-duration="%.3f" data-track-index="%d" data-volume="1"></audio>' % (c["id"], c["id"], st, c["dur"], 30 + i % 2))
    vo_spans.append([round(at, 3), round(at + c["speech_dur"], 3)])
for a, b in zip(vo_spans, vo_spans[1:]):
    assert b[0] - a[1] > 0.1, ("voice lines too close", a, b)

# music: ducked under the voice (lanes in clip-local seconds)
def duck(a, b, base, low):
    """volume lane: base, ducked to low under every voice line (0.08 s attack before it, 0.2 s release after it)"""
    spans = []
    for s0, e0 in vo_spans:                       # lines closer than 0.9 s stay under one duck (no pumping between them)
        if e0 < a or s0 > b: continue
        if spans and s0 - spans[-1][1] < 0.9: spans[-1][1] = e0
        else: spans.append([s0, e0])
    wins = [(max(s0 - 0.18, a) - a, s0 - 0.1 - a, e0 + 0.18 - a, e0 + 0.38 - a) for s0, e0 in spans]
    def g(x):
        v = 0.0
        for p0, p1, p2, p3 in wins:
            if p0 <= x <= p1: v = max(v, (x - p0) / max(1e-6, p1 - p0))
            elif p1 < x < p2: v = 1.0
            elif p2 <= x <= p3: v = max(v, 1 - (x - p2) / max(1e-6, p3 - p2))
        return v
    xs = sorted(set([0.0, b - a] + [round(min(max(x, 0.0), b - a), 3) for w in wins for x in w]))
    pts, last = [], None
    for x in xs:
        v = round(base - (base - low) * g(x), 3)
        pts.append((x, v))
    # drop points that do not change the line
    out = [pts[0]]
    for i in range(1, len(pts) - 1):
        if not (pts[i - 1][1] == pts[i][1] == pts[i + 1][1]): out.append(pts[i])
    out.append(pts[-1])
    return out
mus_rows = []
for mid, fn, a, b, ms in MUS:
    if mid == "m-walk": pts = duck(a, b, 0.62, 0.34)
    elif mid == "m-end":
        pts = [p for p in duck(a, b, 0.6, 0.32) if p[0] < b - a - 1.0]
        pts += [(b - a - 1.0, pts[-1][1]), (b - a, 0.0)]   # fade out under the end card, after the last word
    elif mid == "m-hook": pts = [(0, 0.8), (b - a, 0.8)]
    else: pts = [(0, 0.78), (b - a, 0.78)]   # the payoff: his song, a little under full so the drop is big but not a jump
    auto = json.dumps({"version": 1, "lanes": [{"target": "volume", "points": [{"t": round(t, 3), "v": v} for t, v in pts]}]}, separators=(",", ":"))
    xa = 0.012 if a > 0 else 0.0   # tiny overlap so the seams never drop out
    mus_rows.append('<audio id="%s" class="clip" src="assets/audio/%s" data-start="%.3f" data-duration="%.3f" data-media-start="%.3f" data-track-index="%d" data-timeline-role="music" data-volume="1" data-automation=\'%s\'></audio>'
                    % (mid, fn, a - xa, (b - a) + xa + (0.012 if b < TOTAL else 0), ms - xa, 7 + len(mus_rows) % 2, auto))

# sounds on the visible actions: (id, file, film time of the hit, volume[, media start, length])
PK = json.loads((HERE / "assets/sfx/peaks.json").read_text())
SFX = [
    ("x-click0", "click-soft", B(4), 0.34), ("x-shrink", "whoosh-short", B(4.15), 0.18),
    ("x-drop", "pop", B(10.4), 0.26), ("x-check", "sparkle", B(11.5), 0.16), ("x-pill", "whoosh-short", B(12.05), 0.16),
    ("x-card", "whoosh", B(16.05), 0.16), ("x-click1", "click", B(17.75), 0.32),
    ("x-row1", "pop", B(18.25), 0.18), ("x-row2", "key-press", B(18.75), 0.22), ("x-row3", "pop", B(19.25), 0.18),
    ("x-rise", "whoosh", B(20.05), 0.2), ("x-sync", "impact-bass-1", B(23.5), 0.26), ("x-sync2", "sparkle", B(23.55), 0.16),
    ("x-type1", "typing", B(24.7), 0.16), ("x-type2", "typing", B(26.55), 0.14),
    ("x-edit", "whoosh-short", B(28.05), 0.16), ("x-click2", "click", B(36.5), 0.32), ("x-shuf", "whoosh-short", B(36.65), 0.2), ("x-v2", "pop", B(38), 0.16),
    ("x-click3", "click", B(41), 0.3), ("x-frost", "sparkle", B(41.3), 0.16), ("x-click4", "click", B(45), 0.32),
    ("x-boom", "impact-bass-2", B(48), 0.34), ("x-out", "whoosh", B(60.05), 0.18), ("x-three", "impact-bass-1", B(64.75), 0.26),
    ("x-logo", "impact-bass-2", B(68.05), 0.28), ("x-ice", "sparkle", B(68.4), 0.16), ("x-type3", "typing", B(72.55), 0.14),
]
rows, lanes = [], []
for sid, fn, at, vol in sorted(SFX, key=lambda r: r[2] - PK[r[1]]["peak"]):
    st = max(0.0, at + 1 / 30 - PK[fn]["peak"])
    ln = min(PK[fn]["dur"], 1.4) if fn not in ("typing",) else 1.5
    lane = next((i for i, end in enumerate(lanes) if end <= st), None)
    if lane is None: lanes.append(0); lane = len(lanes) - 1
    lanes[lane] = st + ln
    rows.append('<audio id="%s" class="clip" src="assets/sfx/%s.mp3" data-start="%.3f" data-duration="%.3f" data-track-index="%d" data-volume="%.2f"></audio>' % (sid, fn, st, ln, 12 + lane, vol))
# the riser into the drop: its peak (3.982 s into the file) lands on b48
rs = B(48) + 1 / 30 - 3.982 + 2.2
rows.append('<audio id="x-riser" class="clip" src="assets/sfx/riser.mp3" data-start="%.3f" data-duration="%.3f" data-media-start="2.200" data-track-index="29" data-volume="0.22"></audio>' % (rs, B(48) - rs + 0.15))

# the music's energy per frame (bass, mids), for the song pill's bars
import librosa
sr = 22050
def load(fn): return librosa.load(str(HERE / "assets/audio" / fn), sr=sr, mono=True)[0]
src = {"song.mp3": load("song.mp3"), "inst.mp3": load("inst.mp3")}
n = int(round(TOTAL * 30)) + 2
low, mid = np.zeros(n), np.zeros(n)
for mid_, fn, a, b, ms in MUS:
    y = src[fn]
    for f in range(int(a * 30), min(n, int(b * 30) + 1)):
        t = ms + (f / 30 - a)
        i0, i1 = int((t - 0.03) * sr), int((t + 0.03) * sr)
        if i0 < 0 or i1 >= len(y): continue
        seg = y[i0:i1]
        S = np.abs(np.fft.rfft(seg * np.hanning(len(seg))))
        fr = np.fft.rfftfreq(len(seg), 1 / sr)
        low[f] = S[(fr > 35) & (fr < 160)].sum(); mid[f] = S[(fr > 300) & (fr < 3000)].sum()
low /= np.percentile(low, 98) or 1; mid /= np.percentile(mid, 98) or 1
times = {"P": P, "TOTAL": TOTAL, "VO": vo_spans, "CUTS": CUTS, "TAKES": TAKES,
         "low": [round(min(1.2, x), 3) for x in low], "mid": [round(min(1.2, x), 3) for x in mid],
         "hookCap": [round(9.50 - (FILM0_SONG - TAKE), 3), B(4)], "payCap": [round(5.83 - (song_bar(2) - TAKE) + B(48), 3), round(B(59.6), 3)],
         "prevOff": round(FILM0_SONG - TAKE - 8 * BAR, 4)}
(HERE / "assets" / "times.js").write_text("/* generated by build.py: the film's clock (beats, voice lines, music energy) */\nwindow.T = %s;\n" % json.dumps(times, separators=(",", ":")))

html = """<!doctype html>
<html lang="en" data-resolution="portrait">
  <head>
    <meta charset="UTF-8" /><meta name="viewport" content="width=1080, height=1920" />
    <title>Stalak — One take (promo v5, 9:16)</title>
    <script src="assets/vendor/gsap.min.js"></script>
    <script src="assets/times.js"></script>
    <script src="assets/engine.js"></script>
    <style>
      @font-face { font-family: "Rubik"; src: url("assets/fonts/rubik.ttf"); font-weight: 300 900; }
      @font-face { font-family: "Lilita One"; src: url("assets/fonts/lilitaone.ttf"); }
      html, body { margin: 0; width: 1080px; height: 1920px; overflow: hidden; background: #1f6fd6; }
      #main { position: relative; width: 1080px; height: 1920px; overflow: hidden; background: #1f6fd6; }
    </style>
  </head>
  <body>
    <div id="main" data-composition-id="main" data-start="0" data-duration="%(total).3f" data-width="1080" data-height="1920" data-motion-blur="on" data-motion-blur-events="on" data-motion-blur-shutter="200">
      <!-- generated by build.py: edit build.py, then run python3 build.py -->
      <div id="h-film" data-composition-id="film" data-composition-src="compositions/film.html" data-start="0" data-duration="%(total).3f" data-track-index="0" data-track-kind="graphics" data-width="1080" data-height="1920" style="z-index:1"></div>
      %(mus)s
      %(vo)s
      %(sfx)s
    </div>
    <script>
      window.__timelines = window.__timelines || {};
      window.__timelines["main"] = gsap.timeline({ paused: true });
    </script>
  </body>
</html>
""" % {"total": TOTAL, "mus": "\n      ".join(mus_rows), "vo": "\n      ".join(vo_rows), "sfx": "\n      ".join(rows)}
(HERE / "index.html").write_text(html)
print("total", TOTAL, "| music", [(m[0], round(m[2], 3), round(m[3], 3), round(m[4], 3)) for m in MUS])
print("voice", vo_spans)
print("hook caption", times["hookCap"], "payoff caption", times["payCap"], "preview offset", times["prevOff"])
