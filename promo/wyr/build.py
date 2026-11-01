#!/usr/bin/env python3
"""Builds « Would you rather » (promo v6): index.html (music, voice, sounds, the film host), assets/times.js (the clock)
and the video clips inside compositions/film.html, from the beat grid of « neva die ».

The film: a TikTok "would you rather" game (3 questions, red/blue screen, OR in the middle), the third question is
"an hour editing your snippet, or three minutes with Stalak?": BOOM, the screen explodes into snow on the beat's own drop,
the OR circle turns to ice and becomes Stalak; then the demo of promo v5 « One take » (v3), 15 bars later than in v5.

The grid (measured on the instrumental, see ../one-shape/SPEC.md): 157 BPM. inst = song + 23.13007 s (sample-accurate).
Takes: take time = song time - 1.452 s (lip sync). Film beat b is at b * P seconds.
A v5 beat x is film beat x + SH (V(x) below): the v5 demo, its music and its videos keep their v5 alignment.
Run: python3 vo_cut.py (once, after the voice file is downloaded), then python3 build.py
"""
import json, math, re, pathlib, subprocess
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

# ------------------------------------------------------------------ the game: 3 questions, real votes
# Sources (checked 1/11/2026): would-you-rather-game.com, FAQ of each question ("Out of N votes, X% of players chose ...").
#  Q1 https://www.would-you-rather-game.com/q/47954/would-you-rather-move-objects-by-thought-or-stop-time
#     "Out of 29,204 votes, 36% of players chose "Move objects by thought" and 64% preferred "Stop time"."
#  Q2 the same game, original French version (the English page has only 69 votes):
#     https://www.jeu-tu-preferes.fr/q/14936/tu-preferes-un-monde-sans-musique-ou-un-monde-sans-tele
#     "Sur 228 186 votes, 24% des joueurs ont choisi « Un monde sans musique » et 76% ont préféré « Un monde sans télé »."
#  Q3 no votes: it explodes.
# Images: Microsoft Fluent Emoji 3D (MIT licence, assets/wyr/LICENSE-fluent-emoji.txt); "no" = a red ring and slash drawn over the
# picture ("without ..."); Q3's answer is Stalak's real icon.
WC = [
    {"a": {"lines": ["Stop time"], "img": ["stopwatch_3d"], "pct": 64},
     "b": {"lines": ["Move things", "with your mind"], "img": ["brain_3d"], "pct": 36}, "votes": "29,204 votes"},
    {"a": {"lines": ["A world", "without music"], "img": ["headphone_3d", "no"], "pct": 24},
     "b": {"lines": ["A world", "without TV"], "img": ["television_3d", "no"], "pct": 76}, "votes": "228,186 votes"},
    {"a": {"lines": ["Spend an hour", "editing your snippet"], "img": ["weary_face_3d"]},
     "b": {"lines": ["3 minutes", "with Stalak"], "img": ["icon"]}, "votes": ""},
]

# ------------------------------------------------------------------ the voice
VOW = {c["id"]: c for c in json.loads((HERE / "assets/audio/vo/wyr_clips.json").read_text())}   # the new lines (vo_cut.py)
VO3 = {c["id"]: c for c in json.loads((HERE / "assets/audio/vo/vo_clips.json").read_text())}    # the v5 lines
def word(lid, w):
    return next(t for x, t in VOW[lid]["words"] if x.strip(".,?!").lower() == w)

# the game, question by question: the options are on screen from the start of the question, the voice reads them,
# the clock (3 s = 8 beats, ticking on the beat) starts on the first beat after "or", the votes show, the next one comes.
CD = 8                           # the countdown, in beats (3.06 s)
HOLD = 2.5                       # the votes stay this many beats before the next question
Q, s = [], 0.0
for k, lid in enumerate(["wyr_q1", "wyr_q2", "wyr_q3"]):
    on = s + 0.06
    c = VOW[lid]
    orr, end = on + word(lid, "or"), on + c["speech_dur"]
    cs = math.ceil((orr + 0.25) / P - 1e-9)          # countdown start (beats)
    q = {"s": round(s, 3), "on": round(on, 3), "or": round(orr, 3), "end": round(end, 3), "cs": cs, "rev": None, "nx": None}
    if k < 2:
        q["rev"] = cs + CD
        s = B(q["rev"] + HOLD)
        q["nx"] = round(s, 3)
    Q.append(q)
# Q3: no votes. The clock starts like the others and the screen explodes during "2", on the first downbeat after the voice
BOOM_B = 48
assert B(BOOM_B) - Q[2]["end"] > 0.3 and BOOM_B > Q[2]["cs"] + CD / 3, ("the boom must come after the voice, during 2", Q[2])
BOOM = B(BOOM_B)
# after the boom: 21.75 beats to the v5 zone, so that the music after the boom starts on the beat's own drop (inst bar 2)
# and still reaches the payoff (song bar 6) in the 8-bar loop's phase
SH = BOOM_B + 12
def V(x): return B(x + SH)      # a v5 beat, in film time
TOTAL = round(V(57.75), 3)       # v5 end card, without the "40 min by hand / 3 with Stalak" part (8.25 beats)
POST_K = 2                       # inst bar at the boom: the drop of the beat
assert abs((V(44) - BOOM) / BAR - 14) < 1e-6 and (POST_K + 14) % 8 == 0   # payoff on inst 16 = song 6 (8-bar loop)

# the answer lines: "drop" (in "Now, you just drop your song.") on v5 b10 (the file drops on b10.25), no gap before L3 (v5 b13)
A3 = V(10.0) - word("wyr_a3", "drop")
A2 = A3 - 0.13 - VOW["wyr_a2"]["speech_dur"]
A1 = A2 - 0.13 - VOW["wyr_a1"]["speech_dur"]
assert A1 - BOOM > 0.6, ("the boom needs its moment", A1 - BOOM)

LINES = [("wyr_q1", Q[0]["on"]), ("wyr_q2", Q[1]["on"]), ("wyr_q3", Q[2]["on"]), ("wyr_a1", A1), ("wyr_a2", A2), ("wyr_a3", A3),
         ("vo03", V(13)), ("vo04", V(17.75)), ("vo05", V(20)), ("vo06", V(24.25)), ("vo07", V(27)), ("vo08", V(35)),
         ("vo09", V(38.25)), ("vo10", V(40.5)), ("vo13", V(48.5)), ("vo14", V(52.25))]
vo_rows, vo_spans = [], []
for i, (lid, at) in enumerate(LINES):
    c = VOW.get(lid) or VO3[lid]
    st = at - c["speech_offset"]
    vo_rows.append('<audio id="%s" class="clip" src="assets/audio/vo/%s.wav" data-start="%.3f" data-duration="%.3f" data-track-index="%d" data-volume="1"></audio>'
                   % (lid, lid, st, c["dur"], 30 + i % 2))
    vo_spans.append([round(at, 3), round(at + c["speech_dur"], 3)])
for a, b in zip(vo_spans, vo_spans[1:]):
    assert b[0] - a[1] > 0.1, ("voice lines too close", a, b)
assert vo_spans[-1][1] < TOTAL - 0.6

# ------------------------------------------------------------------ the music
# the game runs on the beat's intro (no drums; the bass comes in with question 2), cut half a beat before the boom;
# the boom is the drop. Then as in v5: the beat under the voice, his song on the payoff, the beat to the end.
MUS = [
    ("m-wyr", "inst.mp3", 0.0, BOOM - P / 2, inst_bar(POST_K) - BOOM),
    ("m-walk", "inst.mp3", BOOM, V(44), inst_bar(POST_K)),
    ("m-pay", "song.mp3", V(44), V(48), song_bar(6)),
    ("m-end", "inst.mp3", V(48), TOTAL, inst_bar(25)),
]
assert MUS[0][4] > 0

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
    pts = [(x, round(base - (base - low) * g(x), 3)) for x in xs]
    out = [pts[0]]
    for i in range(1, len(pts) - 1):
        if not (pts[i - 1][1] == pts[i][1] == pts[i + 1][1]): out.append(pts[i])
    out.append(pts[-1])
    return out
mus_rows = []
for mid, fn, a, b, ms in MUS:
    if mid == "m-wyr":
        pts = duck(a, b, 1.0, 0.5)
        pts = [p for p in pts if p[0] < b - a - 0.05] + [(b - a - 0.05, pts[-1][1]), (b - a, 0.0)]   # the cut before the boom
    elif mid == "m-walk": pts = duck(a, b, 0.5, 0.18)
    elif mid == "m-end":
        pts = [p for p in duck(a, b, 0.5, 0.18) if p[0] < b - a - 1.0]
        pts += [(b - a - 1.0, pts[-1][1]), (b - a, 0.0)]   # fade out under the end card, after the last word
    else: pts = [(0, 0.78), (b - a, 0.78)]   # the payoff: his song, a little under full so the drop is big but not a jump
    auto = json.dumps({"version": 1, "lanes": [{"target": "volume", "points": [{"t": round(t, 3), "v": v} for t, v in pts]}]}, separators=(",", ":"))
    xa = 0.012 if a > 0 and mid != "m-walk" else 0.0   # tiny overlap so the seams never drop out (none at the boom: it follows a cut)
    xb = 0.012 if b < TOTAL and mid != "m-wyr" else 0.0
    mus_rows.append('<audio id="%s" class="clip" src="assets/audio/%s" data-start="%.3f" data-duration="%.3f" data-media-start="%.3f" data-track-index="%d" data-timeline-role="music" data-volume="1" data-automation=\'%s\'></audio>'
                    % (mid, fn, a - xa, (b - a) + xa + xb, ms - xa, 7 + len(mus_rows) % 2, auto))

# ------------------------------------------------------------------ sounds made here: the clock, the ice breaking
SFX_DIR = HERE / "assets/sfx"
def wav(path, x, sr=48000):
    x = np.clip(x, -1, 1); pcm = (x * 32767).astype("<i2").tobytes()
    import wave
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(pcm)
def make_sfx():
    sr = 48000; r = np.random.default_rng(11)
    def tone(f, d, tau, amp=1.0):
        t = np.arange(int(d * sr)) / sr
        return amp * np.sin(2 * np.pi * f * t) * np.exp(-t / tau)
    for name, fs in (("tick", (2350, 4700, 1250)), ("tock", (1700, 3400, 900))):
        n = int(0.09 * sr); x = np.zeros(n)
        x += tone(fs[0], 0.09, 0.010) + tone(fs[1], 0.09, 0.005, 0.45) + tone(fs[2], 0.09, 0.016, 0.35)
        cl = r.standard_normal(int(0.004 * sr)) * np.linspace(1, 0, int(0.004 * sr)); x[:len(cl)] += 0.5 * cl
        x *= 0.5 / np.max(np.abs(x)); wav(SFX_DIR / (name + ".wav"), x)
    for name, d, ntk, amp in (("shatter", 1.1, 90, 0.9), ("shatter-s", 0.5, 26, 0.7)):
        n = int(d * sr); x = np.zeros(n); t = np.arange(n) / sr
        nz = r.standard_normal(n)
        hp = np.diff(np.concatenate([[0], nz]))                          # crude high-pass: the crack
        x += 0.8 * hp * np.exp(-t / 0.045) * (1 - np.exp(-t / 0.002))
        for k in range(ntk):                                             # the shards: little glassy "tinks", dense first
            at = r.exponential(d * 0.22);
            if at > d - 0.05: continue
            f = r.uniform(2400, 9500); tau = r.uniform(0.012, 0.07); a0 = r.uniform(0.15, 0.6) * np.exp(-at / (d * 0.5))
            i0 = int(at * sr); m = min(n - i0, int(0.25 * sr)); tt = np.arange(m) / sr
            x[i0:i0 + m] += a0 * (np.sin(2 * np.pi * f * tt) + 0.4 * np.sin(2 * np.pi * f * 1.51 * tt)) * np.exp(-tt / tau)
        x *= amp / np.max(np.abs(x)); wav(SFX_DIR / (name + ".wav"), x)
make_sfx()
PK = json.loads((SFX_DIR / "peaks.json").read_text())
PK.update({"tick": {"peak": 0.001, "dur": 0.09}, "tock": {"peak": 0.001, "dur": 0.09}, "shatter": {"peak": 0.003, "dur": 1.1}, "shatter-s": {"peak": 0.003, "dur": 0.5}})
EXT = {"tick": "wav", "tock": "wav", "shatter": "wav", "shatter-s": "wav"}

# ------------------------------------------------------------------ sounds on the visible actions: (id, file, film time of the hit, volume[, media start, length])
SFX = [("x-q0", "pop", 0.02, 0.16)]
for k, q in enumerate(Q):
    SFX.append(("x-or%d" % k, "click-soft", q["or"], 0.22))
    end = q["rev"] if q["rev"] is not None else BOOM_B
    for j, bt in enumerate(range(q["cs"], end)):
        SFX.append(("x-t%d%d" % (k, j), "tick" if j % 2 == 0 else "tock", B(bt), 0.46 if j % 3 == 0 else 0.36))
    if q["rev"] is not None:
        SFX += [("x-rev%d" % k, "ping", B(q["rev"]), 0.3), ("x-pct%d" % k, "pop", B(q["rev"]) + 0.02, 0.2)]
        SFX += [("x-nx%d" % k, "whoosh-short", q["nx"], 0.16), ("x-op%d" % k, "pop", q["nx"] + 0.06, 0.16)]
SFX += [("x-boom", "impact-bass-2", BOOM, 0.4), ("x-shat", "shatter", BOOM, 0.3), ("x-boomw", "whoosh-cinematic", BOOM, 0.2, 1.6, 1.6),
        ("x-ice0", "sparkle", BOOM + 0.12, 0.14)]
SFX += [("x-icon", "impact-bass-1", A1 + word("wyr_a1", "stalak"), 0.3), ("x-icon2", "sparkle", A1 + word("wyr_a1", "stalak") + 0.08, 0.16),
        ("x-hour", "pop", A2 + word("wyr_a2", "an"), 0.18), ("x-over", "shatter-s", A2 + word("wyr_a2", "over"), 0.3),
        ("x-over2", "pop", A2 + word("wyr_a2", "over"), 0.14)]
# the v5 demo (its zone part half a beat earlier, so that the file drops on "drop")
ZB = A3 + 0.05                    # the icon becomes the zone on "Now,"
SFX += [
    ("x-burst", "whoosh", ZB, 0.18), ("x-file", "whoosh-short", V(9.45), 0.12),
    ("x-drop", "pop", V(10.25), 0.26), ("x-pill", "whoosh-short", V(10.8), 0.16),
    ("x-stalak", "impact-bass-2", V(13), 0.24), ("x-bpm", "pop", V(14.5), 0.14),
    ("x-card", "whoosh", V(17.05), 0.16), ("x-click1", "click", V(18), 0.32),
    ("x-row1", "pop", V(18.5), 0.18), ("x-row2", "key-press", V(18.875), 0.22), ("x-row3", "pop", V(19.25), 0.18),
    ("x-rise", "whoosh", V(20.05), 0.2), ("x-sync", "impact-bass-1", V(22), 0.26), ("x-sync2", "sparkle", V(22.05), 0.16),
    ("x-lyr", "whoosh-short", V(24.3), 0.14), ("x-click5", "click", V(25), 0.3), ("x-paste", "pop", V(25.25), 0.2),
    ("x-edit", "whoosh-short", V(26.8), 0.16), ("x-blocks", "typing", V(27.25), 0.1, 1.05),
    ("x-click2", "click", V(35), 0.32), ("x-shuf", "whoosh-short", V(35.15), 0.2), ("x-v2", "pop", V(36.25), 0.16),
    ("x-filt", "whoosh-short", V(37.8), 0.12), ("x-click3", "click", V(38.75), 0.3), ("x-frost", "sparkle", V(38.9), 0.16),
    ("x-exp", "whoosh-short", V(40.3), 0.14), ("x-click4", "click", V(41.25), 0.32),
    ("x-pay", "impact-bass-2", V(44), 0.34),
    ("x-spin", "whoosh", V(48.32), 0.2), ("x-logo", "impact-bass-2", V(48.75), 0.28), ("x-ice", "sparkle", V(49.05), 0.14), ("x-type3", "typing", V(51.5), 0.14, 0.4),
]
rows, lanes = [], []
def sfx_start(fn, at, ms=None):
    if fn == "typing": return at - 0.02                        # from its first key (0.45 s in)
    if ms is not None: return max(0.0, at + 1 / 30 - (PK[fn]["peak"] - ms))
    return max(0.0, at + 1 / 30 - PK[fn]["peak"])
for row in sorted(SFX, key=lambda r: sfx_start(r[1], r[2], r[4] if len(r) > 5 else None)):
    sid, fn, at, vol = row[:4]
    msv = row[4] if len(row) > 5 else None
    st = sfx_start(fn, at, msv)
    ln = row[5] if len(row) > 5 else (row[4] if len(row) > 4 else (min(PK[fn]["dur"], 1.4) if fn != "typing" else 1.5))
    lane = next((i for i, end in enumerate(lanes) if end <= st), None)
    if lane is None: lanes.append(0); lane = len(lanes) - 1
    lanes[lane] = st + ln
    ms = ' data-media-start="0.430"' if fn == "typing" else (' data-media-start="%.3f"' % msv if msv is not None else "")
    rows.append('<audio id="%s" class="clip" src="assets/sfx/%s.%s" data-start="%.3f" data-duration="%.3f"%s data-track-index="%d" data-volume="%.2f"></audio>'
                % (sid, fn, EXT.get(fn, "mp3"), st, ln, ms, 12 + lane, vol))
# the riser into the payoff: its peak (3.982 s into the file) lands on v5 b44
rs = V(44) + 1 / 30 - 3.982 + 2.2
rows.append('<audio id="x-riser" class="clip" src="assets/sfx/riser.mp3" data-start="%.3f" data-duration="%.3f" data-media-start="2.200" data-track-index="29" data-volume="0.22"></audio>' % (rs, V(44) - rs + 0.15))

# ------------------------------------------------------------------ the videos (all from the v5 demo)
FILM0_SONG = song_bar(3)                                         # v5's film 0 (its clock is kept for the previews)
OFFT = SH * P
def take_prev(t): return FILM0_SONG + (t - OFFT) - TAKE - 7 * BAR   # previews under the instrumental (v5 mapping)
def take_pay(t): return song_bar(6) + (t - V(44)) - TAKE          # payoff (song audible)
CUTS = [0, .669, 1.434, 2.198, 3.727, 4.491, 5.256, 8.313, 9.842, 10.606, 11.371, 12.90, 14.428, 15.957, 16.721, 17.486, 19.015, 20.543, 22.072, 22.837, 23.601, 25.565]
TAKES = [2, 1, 3, 2, 1, 3, 1, 3, 1, 3, 1, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2]
NEW = [1, 3, 2, 1, 2, 3, 2, 1, 1, 2, 1, 3, 1, 2, 3, 1, 3, 2, 1, 2, 3]
FROST = '{"preset":null,"intensity":1,"adjust":{"exposure":0.08,"contrast":0.1,"highlights":0.15,"shadows":0,"whites":0,"blacks":0,"temperature":-0.8,"tint":0,"vibrance":0,"saturation":-0.4},"details":{"vignette":0,"vignetteMidpoint":0.5,"vignetteRoundness":0,"vignetteFeather":0.65,"grain":0,"grainSize":0.25,"grainRoughness":0.5},"effects":{"blur":0,"pixelate":0,"chromaBleed":0,"tapeDamage":0,"tapeTracking":0,"tapeNoise":1,"tapeSpeed":0.5,"filmArtifacts":0,"halftone":0,"halftoneSize":0,"twoInkPrint":0,"twoInkPrintSize":0,"ascii":0,"asciiSize":0.06578947368421052,"asciiInvert":0,"asciiStyle":0,"asciiColor":1,"asciiRotation":0,"dither":0,"ditherSize":0,"bloom":0.25,"bloomRadius":8,"monoScreen":0,"monoScreenSize":0,"monoScreenAngle":0,"monoScreenSpread":0,"monoScreenShape":0,"monoScreenInvert":0,"scanlines":0,"scanlineCount":0,"scanlineSoftness":0,"chromaticAberration":0,"chromaticAngle":0,"crtCurvature":0,"digitalGlitch":0,"digitalGlitchColorSplit":0,"digitalGlitchLineTear":0,"digitalGlitchPixelate":0,"digitalGlitchBlockAmount":0,"digitalGlitchBlockDisplacement":0,"digitalGlitchBlockOpacity":0,"digitalGlitchSpeed":0,"engraving":0,"engravingSpacing":0.4117647058823529,"engravingMinThickness":0.2,"engravingMaxThickness":0.4571428571428572,"engravingAngle":0.25,"engravingContrast":0.4666666666666667,"engravingSharpness":0.59,"engravingWave":0.2,"engravingWaveFrequency":0.2222222222222222,"crosshatch":0,"crosshatchSpacing":0.28,"crosshatchThickness":0.25,"crosshatchAngle":0.25,"crosshatchContrast":0.3333333333333333,"crosshatchEdges":0.5,"crosshatchLineWeight":0,"crosshatchWave":0.33,"crosshatchWaveFrequency":0.2222222222222222,"kuwahara":0,"kuwaharaRadius":0.14285714285714285,"kuwaharaSharpness":0.3125,"kuwaharaSaturation":0.5},"lut":null,"colorSpace":"rec709","wheels":{"shadows":{"hue":212,"amount":0.42,"level":0},"midtones":{"hue":205,"amount":0.3,"level":0.04},"highlights":{"hue":195,"amount":0.22,"level":0.08}}}'
GRADE_FROST = ' data-color-grading="%s"' % FROST.replace("&", "&amp;").replace('"', "&quot;")

def edl(prefix, a, b, tmap, extra="", only=None, takes=TAKES):
    """video clips of Stalak's edit shown between film times a and b; tmap(film t) -> take time"""
    out = []
    t0, t1 = tmap(a), tmap(b)
    for k in range(21):
        x, y = max(CUTS[k], t0), min(CUTS[k + 1], t1)
        if k == 20: y = min(25.55, t1)
        if y - x < 0.02: continue
        tk = only or takes[k]
        fa = a + (x - t0)
        out.append('<video id="%s%02d" class="clip v"%s data-hf-media-start-basis="local" src="assets/takes/take%d.mp4" data-start="%.3f" data-duration="%.3f" data-media-start="%.3f" muted playsinline></video>'
                   % (prefix, k, extra, tk, fa, y - x, x))
    return "\n".join(out)
def one(vid, take, a, b, tmedia, extra=""):
    return '<video id="%s" class="clip v"%s data-hf-media-start-basis="local" src="assets/takes/take%d.mp4" data-start="%.3f" data-duration="%.3f" data-media-start="%.3f" muted playsinline></video>' % (vid, extra, take, a, b - a, tmedia)

V_ = {}
SY_A, SY_S, SY_E = V(19.6), V(22), V(25.2)
offs = [0.42, -0.31, 0.23]
for i, tk in enumerate([1, 2, 3]):
    V_["SYNC%d" % (i + 1)] = one("vs%da" % (i + 1), tk, SY_A, SY_S, take_prev(SY_A) + offs[i]) + "\n" + one("vs%db" % (i + 1), tk, SY_S, SY_E, take_prev(SY_S))
V_["EDIT"] = edl("ve", V(26.75), V(35.5), take_prev) + "\n" + edl("vn", V(35.5), V(40.6), take_prev, takes=NEW)
V_["FROST"] = edl("vf", V(38.6), V(40.65), take_prev, extra=GRADE_FROST, takes=NEW)
V_["PAY"] = edl("vp", V(44), V(48.5), take_pay, extra=GRADE_FROST, takes=NEW)
# the pictures of the game, preloaded (the canvas draws them)
IMGS = sorted({im for q in WC for side in ("a", "b") for im in q[side]["img"] if im not in ("icon", "no")})
V_["PRELOAD"] = "".join('<img id="im-%s" src="assets/wyr/%s.png" alt="" />' % (im.replace("_3d", ""), im) for im in IMGS) + '<img id="im-icon" src="assets/brand/icon.svg" alt="" />'

film = HERE / "compositions" / "film.html"
s_ = film.read_text()
for k, html in V_.items():
    s_, n = re.subn(r"<!--%s-->.*?<!--/%s-->" % (k, k), "<!--%s-->\n%s\n<!--/%s-->" % (k, html, k), s_, flags=re.S)
    if n != 1: raise SystemExit("marker %s missing" % k)
film.write_text(s_)

# ------------------------------------------------------------------ the clock for the engine
import librosa
sr = 22050
song = librosa.load(str(HERE / "assets/audio/song.mp3"), sr=sr, mono=True)[0]
def take_prev5(tv): return FILM0_SONG + tv - TAKE - 7 * BAR
ENV_T0, ENV_DT = round(take_prev5(B(19)) - 2.0, 3), 0.03
env = []
for i in range(int(round((take_prev5(B(25)) + 2.0 - ENV_T0) / ENV_DT)) + 1):
    c = (ENV_T0 + i * ENV_DT + TAKE) * sr
    seg = song[max(0, int(c - 0.03 * sr)):int(c + 0.03 * sr)]
    env.append(float(np.sqrt((seg ** 2).mean())) if len(seg) else 0.0)
env = np.array(env); env = np.clip(env / (np.percentile(env, 97) or 1), 0, 1) ** 0.8
times = {"P": P, "TOTAL": TOTAL, "SH": SH, "BOOM": round(BOOM, 4), "BOOMB": BOOM_B, "CD": CD, "Q": Q, "WC": WC, "ZB": round(ZB, 3),
         "VO": vo_spans, "VW": {k: VOW[k]["words"] for k in VOW}, "CUTS": CUTS, "TAKES": TAKES, "NEW": NEW, "OFFS": offs,
         "env": [round(float(x), 3) for x in env], "envT0": ENV_T0, "envDt": ENV_DT,
         "payCap": [round(9.50 - (song_bar(6) - TAKE) + V(44), 3), round(V(48) + 0.1, 3)],   # "I gotta bounce" (take 9.50)
         "prevOff": round(FILM0_SONG - TAKE - 7 * BAR, 4)}
(HERE / "assets" / "times.js").write_text("/* generated by build.py: the film's clock (the game, the boom, the voice, the edit, the sync waveform) */\nwindow.T = %s;\n" % json.dumps(times, separators=(",", ":")))

html = """<!doctype html>
<html lang="en" data-resolution="portrait">
  <head>
    <meta charset="UTF-8" /><meta name="viewport" content="width=1080, height=1920" />
    <title>Stalak — Would you rather (promo v6, 9:16)</title>
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
print("total %.3f s | boom %.3f s (b%d) | SH %d beats | zone %.3f s" % (TOTAL, BOOM, BOOM_B, SH, ZB))
for k, q in enumerate(Q): print("Q%d" % (k + 1), q, "cs %.3f s" % B(q["cs"]), ("rev %.3f s" % B(q["rev"])) if q["rev"] else "")
print("answers A1 %.3f A2 %.3f A3 %.3f (boom moment %.2f s)" % (A1, A2, A3, A1 - BOOM))
print("music", [(m[0], round(m[2], 3), round(m[3], 3), round(m[4], 3)) for m in MUS])
print("voice", vo_spans)
