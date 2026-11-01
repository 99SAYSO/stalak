#!/usr/bin/env python3
"""Builds promo v7 « Your snippet is the problem » (inspired by a 28 s motion explainer the owner sent, 1/11):
index.html (music, voice, sounds, the film host), assets/times.js (the clock) and the video clips in compositions/film.html.

A lesson told by a voice, word by word on screen, over white cards that tilt in: the problem (everyone posts the same
snippet), what it costs, what the snippets people replay do, Stalak, then "Post it everywhere" and the logo.
Light look in Stalak's colours (ice white, Stalak blue), Stalak's fonts, the real app for the Stalak part, his real snippet.

The grid (measured on the instrumental, see ../one-shape/SPEC.md): 157 BPM. inst = song + 23.13007 s (sample-accurate).
Takes: take time = song time - 1.452 s (lip sync). Film beat b is at b * P seconds; film 0 is a downbeat (inst bar -8).
Run: python3 vo_cut.py (once, after the voice file is downloaded), then python3 build.py
"""
import json, re, pathlib
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

K0 = -8                          # inst bar at film 0: the beat's melodic intro; its bass comes in on film bar 2
DROP_B = 40                      # film bar 10 = inst bar 2, the beat's own drop: "...are built differently."
PAY_B = 64                       # film bar 16 = inst bar 8, in the 8-bar loop's phase of song bar 6 ("I gotta bounce")
TOTAL = round(B(80), 3)
assert K0 + DROP_B // 4 == 2 and (K0 + PAY_B // 4) % 8 == 0

# ------------------------------------------------------------------ the voice (vo_cut.py)
VO = {c["id"]: c for c in json.loads((HERE / "assets/audio/vo/lesson_clips.json").read_text())}
def word(lid, w, n=1):
    hits = [t for x, t in VO[lid]["words"] if x.strip(".,?!'").lower() == w.lower()]
    return hits[n - 1]
GAP = 0.16
MASTER = 0.68                      # the whole mix: the render sums the tracks with no limiter, so it must stay under 0 dBFS (mastered after)
at = {}
at["l1"] = 0.06
for prev, cur in (("l1", "l2"), ("l2", "l3"), ("l3", "l4")):
    at[cur] = at[prev] + VO[prev]["speech_dur"] + GAP
at["l5"] = B(DROP_B) - word("l5", "differently") - 0.04          # "differently" lands on the drop
assert at["l5"] - (at["l4"] + VO["l4"]["speech_dur"]) > 0.1
at["l6"] = at["l5"] + VO["l5"]["speech_dur"] + GAP
at["l7"] = at["l6"] + VO["l6"]["speech_dur"] + GAP
assert B(PAY_B) - (at["l7"] + VO["l7"]["speech_dur"]) > 0.15, "the payoff must come after the voice"
at["l8"] = B(PAY_B + 4) + 0.12
at["l9"] = B(PAY_B + 10) + 0.1                                    # the logo on the snare (beat 3 of bar 18): "everywhere" keeps its circle a beat longer
assert at["l9"] - (at["l8"] + VO["l8"]["speech_dur"]) > 0.3
LIDS = ["l1", "l2", "l3", "l4", "l5", "l6", "l7", "l8", "l9"]
vo_rows, vo_spans = [], []
for i, lid in enumerate(LIDS):
    c = VO[lid]
    vo_rows.append('<audio id="%s" class="clip" src="assets/audio/vo/%s.wav" data-start="%.3f" data-duration="%.3f" data-track-index="%d" data-volume="%.3f"></audio>'
                   % (lid, lid, at[lid] - c["speech_offset"], c["dur"], 30 + i % 2, MASTER))
    vo_spans.append([round(at[lid], 3), round(at[lid] + c["speech_dur"], 3)])
for a, b in zip(vo_spans, vo_spans[1:]):
    assert b[0] - a[1] > 0.1, ("voice lines too close", a, b)
assert vo_spans[-1][1] < TOTAL - 0.8
def W(lid, w, n=1): return at[lid] + word(lid, w, n)

# ------------------------------------------------------------------ the music
MUS = [
    ("m-walk", "inst.mp3", 0.0, B(PAY_B), inst_bar(K0)),          # intro, the bass from bar 2, the drop on bar 10
    ("m-pay", "song.mp3", B(PAY_B), B(PAY_B + 4), song_bar(6)),   # his song, his voice: "I gotta bounce"
    ("m-end", "inst.mp3", B(PAY_B + 4), TOTAL, inst_bar(25)),      # song 7 = inst 9 = inst 25 in the loop
]
def duck(a, b, base, low):
    spans = []
    for s0, e0 in vo_spans:
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
    pts = [(x, round(base - (base - low) * g(x), 3)) for x in xs]
    out = [pts[0]]
    for i in range(1, len(pts) - 1):
        if not (pts[i - 1][1] == pts[i][1] == pts[i + 1][1]): out.append(pts[i])
    out.append(pts[-1])
    return out
mus_rows = []
for mid, fn, a, b, ms in MUS:
    if mid == "m-walk": pts = duck(a, b, 0.6, 0.24)
    elif mid == "m-end":
        pts = [p for p in duck(a, b, 0.5, 0.2) if p[0] < b - a - 1.2]
        pts += [(b - a - 1.2, pts[-1][1]), (b - a, 0.0)]
    else: pts = [(0, 0.5), (b - a, 0.5)]
    xa = 0.012 if a > 0 else 0.0
    dur = (b - a) + xa + (0.012 if b < TOTAL else 0)
    pts = [(x + xa, v * MASTER) for x, v in pts]          # in the clip's own time
    def at_(x): return float(np.interp(x, [p[0] for p in pts], [p[1] for p in pts]))
    if a > 0: pts = [(0.0, 0.0), (0.024, at_(0.024))] + [p for p in pts if p[0] > 0.024]     # 24 ms crossfade with the music before
    if b < TOTAL: pts = [p for p in pts if p[0] < dur - 0.024] + [(dur - 0.024, at_(dur - 0.024)), (dur, 0.0)]   # and with the music after
    pts = [(round(x, 3), round(v, 3)) for x, v in pts]
    auto = json.dumps({"version": 1, "lanes": [{"target": "volume", "points": [{"t": t, "v": v} for t, v in pts]}]}, separators=(",", ":"))
    mus_rows.append('<audio id="%s" class="clip" src="assets/audio/%s" data-start="%.3f" data-duration="%.3f" data-media-start="%.3f" data-track-index="%d" data-timeline-role="music" data-volume="1" data-automation=\'%s\'></audio>'
                    % (mid, fn, a - xa, (b - a) + xa + (0.012 if b < TOTAL else 0), ms - xa, 7 + len(mus_rows) % 2, auto))

# ------------------------------------------------------------------ the scenes (film seconds), from the voice
S = {
    "s2": at["l2"] - 0.12,                       # the feed card: everyone's snippet, the same
    "tag1": W("l2", "one"), "tag2": W("l2", "no", 1), "tag3": W("l2", "no", 2),
    "s3": at["l3"] - 0.06,                       # the feed scrolls
    "swipe": W("l3", "scroll"),
    "s4": at["l4"] - 0.08,                       # the numbers stay flat
    "rep0": W("l4", "replays"), "sha0": W("l4", "shares"),
    "s5": at["l5"] - 0.08,                       # the snippets people replay
    "launch": W("l5", "built"), "drop": B(DROP_B),
    "s6": at["l6"] - 0.04,                       # the three things
    "p1": W("l6", "cut"), "p2": W("l6", "switch"), "p3": W("l6", "lyrics"),
    "s7": at["l7"], "hour": W("l7", "an"),
    "merge": W("l7", "stalak"), "edit": W("l7", "does"),
    "pay": B(PAY_B), "payEnd": B(PAY_B + 4),
    "s9": B(PAY_B + 4), "every": W("l8", "everywhere"),
    "s10": B(PAY_B + 10), "url": at["l9"],
}
assert S["merge"] > S["p3"] + 0.8 and S["edit"] > S["merge"] + 0.3

# ------------------------------------------------------------------ sounds on the visible actions: (id, file, film time of the hit, volume[, media start, length])
PK = json.loads((HERE / "assets/sfx/peaks.json").read_text())
SFX = [
    ("x-hook", "whoosh-short", 0.04, 0.12),
    ("x-s2", "whoosh-short", S["s2"] + 0.06, 0.14), ("x-tag1", "pop", S["tag1"], 0.14), ("x-tag2", "pop", S["tag2"], 0.14), ("x-tag3", "pop", S["tag3"], 0.14),
    ("x-s3", "whoosh-short", S["s3"] + 0.06, 0.12), ("x-swipe", "whoosh", S["swipe"] + 0.1, 0.2),
    ("x-s4", "whoosh-short", S["s4"] + 0.06, 0.12), ("x-rep", "pop", S["rep0"], 0.14), ("x-sha", "pop", S["sha0"], 0.14),
    ("x-s5", "whoosh-short", S["s5"] + 0.06, 0.12), ("x-up", "whoosh", S["launch"] + 0.1, 0.14),
    ("x-drop", "impact-bass-1", S["drop"], 0.22), ("x-drop2", "sparkle", S["drop"] + 0.04, 0.14),
    ("x-p1", "pop", S["p1"], 0.2), ("x-p2", "pop", S["p2"], 0.2), ("x-p3", "pop", S["p3"], 0.2),
    ("x-merge", "whoosh", S["merge"], 0.2), ("x-icon", "impact-bass-1", S["merge"] + 0.08, 0.2), ("x-icon2", "sparkle", S["merge"] + 0.12, 0.16),
    ("x-edit", "whoosh-short", S["edit"], 0.16), ("x-blocks", "typing", S["edit"] + 0.06, 0.1, 1.05),
    ("x-pay", "impact-bass-2", S["pay"], 0.24),
    ("x-s9", "whoosh-short", S["s9"] + 0.04, 0.14), ("x-circle", "whoosh-short", S["every"] + 0.12, 0.1),
    ("x-logo", "impact-bass-1", S["s10"] + 0.06, 0.2), ("x-logo2", "sparkle", S["s10"] + 0.12, 0.14), ("x-type", "typing", S["url"], 0.14, 0.4),
]
rows, lanes = [], []
def sfx_start(fn, at_): return at_ - 0.02 if fn == "typing" else max(0.0, at_ + 1 / 30 - PK[fn]["peak"])
for row in sorted(SFX, key=lambda r: sfx_start(r[1], r[2])):
    sid, fn, at_, vol = row[:4]
    st = sfx_start(fn, at_)
    ln = row[4] if len(row) > 4 else (min(PK[fn]["dur"], 1.4) if fn != "typing" else 1.5)
    lane = next((i for i, end in enumerate(lanes) if end <= st), None)
    if lane is None: lanes.append(0); lane = len(lanes) - 1
    lanes[lane] = st + ln
    ms = ' data-media-start="0.430"' if fn == "typing" else ""
    rows.append('<audio id="%s" class="clip" src="assets/sfx/%s.mp3" data-start="%.3f" data-duration="%.3f"%s data-track-index="%d" data-volume="%.3f"></audio>' % (sid, fn, st, ln, ms, 12 + lane, vol * MASTER))
rs = B(PAY_B) + 1 / 30 - 3.982 + 2.6          # the riser into the payoff: its peak (3.982 s into the file) lands on it
rows.append('<audio id="x-riser" class="clip" src="assets/sfx/riser.mp3" data-start="%.3f" data-duration="%.3f" data-media-start="2.600" data-track-index="29" data-volume="%.3f"></audio>' % (rs, B(PAY_B) - rs + 0.12, 0.2 * MASTER))

# ------------------------------------------------------------------ the videos: the edit preview, then the payoff (his snippet, Frost)
def tk(t):                                     # film t -> take time, in the music's place (the song's place under the payoff)
    return inst_bar(K0) + t - OFF - TAKE
CUTS = [0, .669, 1.434, 2.198, 3.727, 4.491, 5.256, 8.313, 9.842, 10.606, 11.371, 12.90, 14.428, 15.957, 16.721, 17.486, 19.015, 20.543, 22.072, 22.837, 23.601, 25.565]
TAKES = [2, 1, 3, 2, 1, 3, 1, 3, 1, 3, 1, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2]
NEW = [1, 3, 2, 1, 2, 3, 2, 1, 1, 2, 1, 3, 1, 2, 3, 1, 3, 2, 1, 2, 3]
FROST = json.loads(re.search(r"^FROST = '(.*)'$", (HERE / "../wyr/build.py").read_text(), re.M).group(1))
GRADE_FROST = ' data-color-grading="%s"' % json.dumps(FROST, separators=(",", ":")).replace("&", "&amp;").replace('"', "&quot;")
def edl(prefix, a, b, extra="", takes=TAKES):
    out = []
    t0, t1 = tk(a), tk(b)
    for k in range(21):
        x, y = max(CUTS[k], t0), min(CUTS[k + 1], t1)
        if k == 20: y = min(25.55, t1)
        if y - x < 0.02: continue
        out.append('<video id="%s%02d" class="clip v"%s data-hf-media-start-basis="local" src="assets/takes/take%d.mp4" data-start="%.3f" data-duration="%.3f" data-media-start="%.3f" muted playsinline></video>'
                   % (prefix, k, extra, takes[k], a + (x - t0), y - x, x))
    return "\n".join(out)
assert tk(S["edit"]) > 0 and abs(tk(B(PAY_B)) - (song_bar(6) - TAKE)) < 1e-6
V_ = {"EDIT": edl("ve", S["edit"] - 0.2, B(PAY_B) + 0.05), "PAY": edl("vp", B(PAY_B), B(PAY_B + 4) + 0.3, extra=GRADE_FROST, takes=NEW)}
film = HERE / "compositions" / "film.html"
s_ = film.read_text()
for k, html in V_.items():
    s_, n = re.subn(r"<!--%s-->.*?<!--/%s-->" % (k, k), "<!--%s-->\n%s\n<!--/%s-->" % (k, html, k), s_, flags=re.S)
    if n != 1: raise SystemExit("marker %s missing" % k)
film.write_text(s_)

times = {"P": P, "TOTAL": TOTAL, "DROPB": DROP_B, "PAYB": PAY_B, "S": {k: round(v, 3) for k, v in S.items()},
         "VO": vo_spans, "VW": [VO[l]["words"] for l in LIDS], "CUTS": CUTS, "TAKES": TAKES, "NEW": NEW,
         "payCap": round(9.50 + TAKE + OFF - inst_bar(K0), 3), "tk0": round(inst_bar(K0) - OFF - TAKE, 4)}
(HERE / "assets" / "times.js").write_text("/* generated by build.py: the film's clock (scenes, voice words, the edit) */\nwindow.T = %s;\n" % json.dumps(times, separators=(",", ":")))

html = """<!doctype html>
<html lang="en" data-resolution="portrait">
  <head>
    <meta charset="UTF-8" /><meta name="viewport" content="width=1080, height=1920" />
    <title>Stalak — Your snippet is the problem (promo v7, 9:16)</title>
    <script src="assets/vendor/gsap.min.js"></script>
    <script src="assets/times.js"></script>
    <script src="assets/engine.js"></script>
    <style>
      @font-face { font-family: "Rubik"; src: url("assets/fonts/rubik.ttf"); font-weight: 300 900; }
      @font-face { font-family: "Lilita One"; src: url("assets/fonts/lilitaone.ttf"); }
      html, body { margin: 0; width: 1080px; height: 1920px; overflow: hidden; background: #f6faff; }
      #main { position: relative; width: 1080px; height: 1920px; overflow: hidden; background: #f6faff; }
    </style>
  </head>
  <body>
    <div id="main" data-composition-id="main" data-start="0" data-duration="%(total).3f" data-width="1080" data-height="1920">
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
print("total %.3f s | drop %.3f | payoff %.3f-%.3f" % (TOTAL, B(DROP_B), B(PAY_B), B(PAY_B + 4)))
print("voice", vo_spans)
print("scenes", {k: round(v, 2) for k, v in S.items()})
