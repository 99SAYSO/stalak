#!/usr/bin/env python3
"""Builds promo v8 « The Snippet Machine » (owner's pick, 1/11): index.html (music, sounds, the film host),
assets/times.js (the clock) and the video clips in compositions/film.html. Synthesised sounds go to assets/sfx/gen_*.wav.

An isometric island of ice where a chain-reaction machine edits his snippet, every part moving on his beat;
the camera follows it in one take, dives into the phone (his real snippet, his song), pulls back: the island
was the top of the Stalak icon. No voice: titles, music, sounds.

The grid (measured on the instrumental, see ../one-shape/SPEC.md): 157 BPM. inst = song + 23.13007 s (sample-accurate).
Takes: take time = song time - 1.452 s (lip sync). Film beat b is at b * P seconds; film 0 is a downbeat (inst bar -4).
Run: python3 build.py
"""
import json, re, pathlib, wave, subprocess
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

K0 = -4                          # inst bar at film 0: its bass and light hats; the beat's own drop (inst bar 2) is film beat 24
DROP = 24                        # film beat of the drop: the blade starts cutting
PAY = 52                         # film beat of his snippet (song bar 6, "I gotta bounce"), after a one-beat breath (the dive)
TOTAL = round(B(76), 3)
assert K0 + DROP // 4 == 2
MASTER = 0.68                    # the render sums the tracks with no limiter: keep the mix under 0 dBFS, master after

# ------------------------------------------------------------------ the music
def lane(pts):
    return json.dumps({"version": 1, "lanes": [{"target": "volume", "points": [{"t": round(t, 3), "v": round(v * MASTER, 3)} for t, v in pts]}]}, separators=(",", ":"))
MUSIC_LV, PAY_LV = 0.62, 0.80
PRE = 1.6                        # the beat before its drop is 7 LU softer than after: lift it, so the hook is not quiet (the drop still hits)
mus_rows = []
a, b = 0.0, B(PAY - 1)           # the machine, until the breath before his snippet
mus_rows.append('<audio id="m-walk" class="clip" src="assets/audio/inst.mp3" data-start="0.000" data-duration="%.3f" data-media-start="%.3f" data-track-index="7" data-timeline-role="music" data-volume="1" data-automation=\'%s\'></audio>'
                % (b + 0.03, inst_bar(K0), lane([(0, MUSIC_LV * PRE), (B(DROP) - 0.03, MUSIC_LV * PRE), (B(DROP), MUSIC_LV), (b - 0.02, MUSIC_LV), (b + 0.03, 0.0)])))
a, b = B(PAY), B(PAY + 8)        # his song, two bars
mus_rows.append('<audio id="m-pay" class="clip" src="assets/audio/song.mp3" data-start="%.3f" data-duration="%.3f" data-media-start="%.3f" data-track-index="8" data-timeline-role="music" data-volume="1" data-automation=\'%s\'></audio>'
                % (a, (b - a) + 0.012, song_bar(6), lane([(0, 0.0), (0.012, PAY_LV), (b - a - 0.012, PAY_LV), (b - a + 0.012, 0.0)])))
a = B(PAY + 8)                   # song bars 6-7 = inst bars 8-9: the instrumental goes on from inst bar 10
d = TOTAL - (a - 0.012)
mus_rows.append('<audio id="m-end" class="clip" src="assets/audio/inst.mp3" data-start="%.3f" data-duration="%.3f" data-media-start="%.3f" data-track-index="7" data-timeline-role="music" data-volume="1" data-automation=\'%s\'></audio>'
                % (a - 0.012, d, inst_bar(10) - 0.012, lane([(0, 0.0), (0.024, MUSIC_LV), (d - 1.3, MUSIC_LV), (d, 0.0)])))

# ------------------------------------------------------------------ sounds made here (numpy), 48 kHz mono
SR = 48000
GEN = HERE / "assets" / "sfx"
rs = np.random.RandomState(7)
def env(n, att, dec):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(att, 1e-4)) * np.exp(-t / dec)
def sine(f, n, f2=None):
    t = np.arange(n) / SR
    if f2 is None: return np.sin(2 * np.pi * f * t)
    fr = f * (f2 / f) ** (t / t[-1]); return np.sin(2 * np.pi * np.cumsum(fr) / SR)
def bp(x, lo, hi):
    X = np.fft.rfft(x); fr = np.fft.rfftfreq(len(x), 1 / SR); X[(fr < lo) | (fr > hi)] = 0; return np.fft.irfft(X, len(x))
def save(name, x, peak=0.9):
    x = x / (np.abs(x).max() + 1e-9) * peak
    with wave.open(str(GEN / ("gen_%s.wav" % name)), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype("<i2").tobytes())
def n_(s): return int(s * SR)
save("domino", sine(2900, n_(.05)) * env(n_(.05), .0005, .009) + 0.6 * sine(4300, n_(.05)) * env(n_(.05), .0005, .006) + 0.9 * sine(620, n_(.05)) * env(n_(.05), .001, .02) + 0.3 * bp(rs.randn(n_(.05)), 2000, 9000) * env(n_(.05), .0002, .004))
save("blade", 0.8 * bp(rs.randn(n_(.12)), 2500, 11000) * env(n_(.12), .002, .028) + 0.25 * sine(5600, n_(.12)) * env(n_(.12), .001, .05) + 0.4 * sine(900, n_(.12), 300) * env(n_(.12), .001, .02))
save("land", sine(1500, n_(.04)) * env(n_(.04), .0005, .007) + 0.7 * sine(380, n_(.04)) * env(n_(.04), .001, .015))
save("thud", sine(110, n_(.3), 45) * env(n_(.3), .002, .08) + 0.5 * bp(rs.randn(n_(.3)), 300, 3000) * env(n_(.3), .0005, .01) + 0.3 * sine(1800, n_(.3)) * env(n_(.3), .0005, .006))
bl = bp(rs.randn(n_(.7)), 400, 7000); bl = bl * env(n_(.7), .012, .22)
save("blast", bl + 0.5 * sine(70, n_(.7), 40) * env(n_(.7), .005, .12))
save("beep", np.sign(sine(1900, n_(.07))) * 0.35 * env(n_(.07), .002, .05))
sw = np.zeros(n_(.78)); tt = 0.0; k = 0
while tt < 0.74:
    c = sine(3400, n_(.012)) * env(n_(.012), .0003, .003); i = n_(tt); sw[i:i + len(c)] += c[:len(sw) - i]; tt += max(0.022, 0.06 - 0.0025 * k); k += 1
save("stopwatch", sw, 0.7)
save("clang", sine(1250, n_(.4)) * env(n_(.4), .0008, .09) + 0.6 * sine(3330, n_(.4)) * env(n_(.4), .0005, .05) + 0.4 * bp(rs.randn(n_(.4)), 1500, 8000) * env(n_(.4), .0002, .006))
cr = bp(rs.randn(n_(.35)), 600, 9000) * env(n_(.35), .0008, .05)
for f0 in (1700, 2600, 4100): cr += 0.25 * sine(f0, n_(.35)) * env(n_(.35), .0005, .03)
save("crack", cr)
wr = bp(rs.randn(n_(6.0)), 150, 1800) * 0.5 + 0.35 * sine(55, n_(6.0)) + 0.12 * sine(110, n_(6.0))
wr *= np.minimum(1, np.arange(n_(6.0)) / n_(.08)) * np.minimum(1, (n_(6.0) - np.arange(n_(6.0))) / n_(.15))
save("whir", wr, 0.6)
GEN_DUR = {"domino": .05, "blade": .12, "land": .04, "thud": .3, "blast": .7, "beep": .07, "stopwatch": .78, "clang": .4, "crack": .35, "whir": 6.0}

# ------------------------------------------------------------------ sounds on the visible actions: (id, file, film time of the hit, volume[, media start, length])
PK = json.loads((GEN / "peaks.json").read_text())
SFX = [
    ("x-open", "whoosh", 0.12, 0.24), ("x-claw", "gen:clang", B(6), 0.30), ("x-fall", "whoosh-short", B(6.55), 0.22),
    ("x-land", "impact-bass-1", B(7), 0.30), ("x-crack", "gen:crack", B(7), 0.34),
    ("x-lever", "gen:land", B(8), 0.5),
] + [("x-dom%d" % i, "gen:domino", B(8 + i), 0.42) for i in range(8)] + [
    ("x-bpm", "pop", B(10), 0.22), ("x-switch", "gen:clang", B(16), 0.22),
] + [("x-reel%d" % i, "gen:thud", B(16 + i), 0.40) for i in range(3)] + [("x-bill%d" % i, "pop", B(16 + i) + 0.08, 0.16) for i in range(3)] + [
    ("x-whir", "gen:whir", B(20), 0.20, 0.0, B(14)),
    ("x-riser", "riser", B(DROP), 0.20, 2.2, None),
    ("x-drop", "impact-bass-1", B(DROP), 0.34),
] + [("x-cut%02d" % k, "gen:blade", B(DROP + 0.5 * k), 0.40) for k in range(21)] + [
    ("x-hop1", "whoosh-short", B(34.5), 0.20), ("x-sync1", "gen:beep", B(36), 0.30), ("x-sync2", "gen:beep", B(36.5), 0.30),
    ("x-lock", "chime", B(37), 0.22), ("x-lock2", "sparkle", B(37), 0.16),
    ("x-hop2", "whoosh-short", B(38), 0.20),
] + [("x-slam%d" % i, "gen:thud", B(39 + i), 0.55) for i in range(3)] + [
    ("x-hop3", "whoosh-short", B(42), 0.20), ("x-blast", "gen:blast", B(43), 0.42), ("x-frost", "sparkle", B(43.3), 0.20),
    ("x-hop4", "whoosh-short", B(46), 0.20), ("x-sw", "gen:stopwatch", B(46.05), 0.30), ("x-ding", "ping", B(48), 0.26),
    ("x-slot", "gen:clang", B(48.75), 0.20), ("x-on", "notification", B(49), 0.18),
    ("x-dive", "whoosh", B(50.1), 0.30), ("x-rise2", "riser", B(PAY), 0.16, 2.9, None), ("x-pay", "impact-bass-2", B(PAY), 0.26),
    ("x-back", "whoosh", B(60.2), 0.26),
] + [("x-sink%d" % i, "pop", B(64 + 0.5 * i), 0.14) for i in range(4)] + [
    ("x-turn", "whoosh-short", B(65.6), 0.22),
    ("x-logo", "impact-bass-1", B(68), 0.30), ("x-logo2", "sparkle", B(68.1), 0.18), ("x-type", "typing", B(69.5), 0.16, 0.43, 0.42),
    ("x-tag", "pop", B(70.5), 0.16),
]
rows, lanes = [], []
def sfx_start(fn, at_):
    if fn == "typing": return at_ - 0.02
    if fn.startswith("gen:"): return max(0.0, at_ - 0.002)
    return max(0.0, at_ + 1 / 30 - PK[fn]["peak"])
for row in sorted(SFX, key=lambda r: sfx_start(r[1], r[2])):
    sid, fn, at_, vol = row[:4]
    ms = row[4] if len(row) > 4 else None
    st = sfx_start(fn, at_)
    if fn.startswith("gen:"):
        g = fn[4:]; src = "assets/sfx/gen_%s.wav" % g; ln = row[5] if len(row) > 5 and row[5] else GEN_DUR[g]
    else:
        src = "assets/sfx/%s.mp3" % fn
        if ms is not None and fn == "riser":           # its peak (3.982 s in) lands on the hit
            st = at_ + 1 / 30 - (PK[fn]["peak"] - ms); ln = PK[fn]["peak"] - ms + 0.15
        else: ln = row[5] if len(row) > 5 and row[5] else min(PK[fn]["dur"], 1.4)
    lane_i = next((i for i, end in enumerate(lanes) if end <= st), None)
    if lane_i is None: lanes.append(0); lane_i = len(lanes) - 1
    lanes[lane_i] = st + ln
    msa = ' data-media-start="%.3f"' % ms if ms is not None else ""
    rows.append('<audio id="%s" class="clip" src="%s" data-start="%.3f" data-duration="%.3f"%s data-track-index="%d" data-volume="%.3f"></audio>' % (sid, src, st, ln, msa, 12 + lane_i, vol * MASTER))

# ------------------------------------------------------------------ the videos: the three takes on their cards, then his snippet (the real edit, Frost)
CUTS = [0, .669, 1.434, 2.198, 3.727, 4.491, 5.256, 8.313, 9.842, 10.606, 11.371, 12.90, 14.428, 15.957, 16.721, 17.486, 19.015, 20.543, 22.072, 22.837, 23.601, 25.565]
TAKES = [2, 1, 3, 2, 1, 3, 1, 3, 1, 3, 1, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2]     # "Version 1": 21 shots, 25.6 s (the real edit)
FROST = json.loads(re.search(r"^FROST = '(.*)'$", (HERE / "../wyr/build.py").read_text(), re.M).group(1))
GRADE_FROST = ' data-color-grading="%s"' % json.dumps(FROST, separators=(",", ":")).replace("&", "&amp;").replace('"', "&quot;")
TK0 = song_bar(6) - TAKE                         # take time at his snippet's downbeat (film beat PAY)
def tk(t): return TK0 + (t - B(PAY))
def edl(prefix, a, b, extra=""):
    out = []
    t0, t1 = tk(a), tk(b)
    for k in range(21):
        x, y = max(CUTS[k], t0), min(CUTS[k + 1], t1)
        if y - x < 0.02: continue
        out.append('<video id="%s%02d" class="clip v"%s data-hf-media-start-basis="local" src="assets/takes/take%d.mp4" data-start="%.3f" data-duration="%.3f" data-media-start="%.3f" muted playsinline></video>'
                   % (prefix, k, extra, TAKES[k], a + (x - t0), y - x, x))
    return "\n".join(out)
BILL = []
for i in range(3):                                # the takes on their little cards, from the reel's landing to the strip
    a = B(16 + i) - 0.15
    BILL.append('<video id="vb%d" class="clip v" data-hf-media-start-basis="local" src="assets/takes/take%d.mp4" data-start="%.3f" data-duration="%.3f" data-media-start="%.3f" muted playsinline></video>' % (i, i + 1, a, B(22) - a, 4.0 + 0.7 * i))
V_ = {"BILL0": BILL[0], "BILL1": BILL[1], "BILL2": BILL[2], "PAY": edl("vp", B(49.5), B(63.5), GRADE_FROST)}
film = HERE / "compositions" / "film.html"
s_ = film.read_text()
for k, html in V_.items():
    s_, n = re.subn(r"<!--%s-->.*?<!--/%s-->" % (k, k), "<!--%s-->\n%s\n<!--/%s-->" % (k, html, k), s_, flags=re.S)
    if n != 1: raise SystemExit("marker %s missing" % k)
film.write_text(s_)

# ------------------------------------------------------------------ the song's real waveform, engraved on its block (song 1.45 s -> 27 s, the part he lip-syncs)
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", str(HERE / "assets/audio/song.mp3"), "-ac", "1", "-ar", "8000", "-f", "f32le", "-"], capture_output=True, check=True).stdout
x = np.frombuffer(raw, np.float32)
seg = x[int(1.452 * 8000): int(27.0 * 8000)]
nb = 40
wave_ = [float(np.sqrt(np.mean(c ** 2))) for c in np.array_split(seg, nb)]
mx = max(wave_); WAVE = [round(0.18 + 0.82 * (v / mx) ** 0.8, 3) for v in wave_]

times = {"P": P, "TOTAL": TOTAL, "DROP": DROP, "PAY": PAY, "TAKES": TAKES, "WAVE": WAVE,
         "cap": round(B(PAY) + (9.50 - TK0), 3)}                # "I gotta bounce" (take 9.50)
(HERE / "assets" / "times.js").write_text("/* generated by build.py: the film's clock */\nwindow.T = %s;\n" % json.dumps(times, separators=(",", ":")))

html = """<!doctype html>
<html lang="en" data-resolution="portrait">
  <head>
    <meta charset="UTF-8" /><meta name="viewport" content="width=1080, height=1920" />
    <title>Stalak — The Snippet Machine (promo v8, 9:16)</title>
    <script src="assets/vendor/gsap.min.js"></script>
    <script src="assets/times.js"></script>
    <script src="assets/engine.js"></script>
    <style>
      @font-face { font-family: "Rubik"; src: url("assets/fonts/rubik.ttf"); font-weight: 300 900; }
      @font-face { font-family: "Lilita One"; src: url("assets/fonts/lilitaone.ttf"); }
      html, body { margin: 0; width: 1080px; height: 1920px; overflow: hidden; background: #6fb2f6; }
      #main { position: relative; width: 1080px; height: 1920px; overflow: hidden; background: #6fb2f6; }
    </style>
  </head>
  <body>
    <div id="main" data-composition-id="main" data-start="0" data-duration="%(total).3f" data-width="1080" data-height="1920">
      <!-- generated by build.py: edit build.py, then run python3 build.py -->
      <div id="h-film" data-composition-id="film" data-composition-src="compositions/film.html" data-start="0" data-duration="%(total).3f" data-track-index="0" data-track-kind="graphics" data-width="1080" data-height="1920" style="z-index:1"></div>
      %(mus)s
      %(sfx)s
    </div>
    <script>
      window.__timelines = window.__timelines || {};
      window.__timelines["main"] = gsap.timeline({ paused: true });
    </script>
  </body>
</html>
""" % {"total": TOTAL, "mus": "\n      ".join(mus_rows), "sfx": "\n      ".join(rows)}
(HERE / "index.html").write_text(html)
print("total %.3f s | drop %.3f | payoff %.3f-%.3f | cap %.3f" % (TOTAL, B(DROP), B(PAY), B(PAY + 8), times["cap"]))
