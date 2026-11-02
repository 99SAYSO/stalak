#!/usr/bin/env python3
"""Builds the YouTube presentation film « The edit nobody sees » (story A, chosen by the owner on 2/11):
index.html (music, voice, sounds, the film host), assets/times.js (the clock and the data the engine draws: waveforms, the cuts)
and the video clips in compositions/film.html (between the <!--X--> markers).

The grid (measured on the instrumental, see ../one-shape/SPEC.md): 157 BPM. inst = song + 23.13007 s (sample-accurate).
Takes: take time = song time - 1.452 s (lip sync). Film beat b is at b * P seconds; film 0 is a downbeat (inst bar -9).
Run: python3 vo_cut.py (once, after the voice file is downloaded), then python3 build.py
"""
import json, re, pathlib, subprocess, wave
import numpy as np
from caps import make_caps

HERE = pathlib.Path(__file__).parent
P = 60 / 157
BAR = 4 * P
D0 = 20.2946 + 3 * P            # an instrumental downbeat
OFF = 23.13007                   # inst = song + OFF
TAKE = 1.452                     # take = song - TAKE
def B(b): return b * P
def inst_bar(k): return D0 + k * BAR
def song_bar(j): return inst_bar(j + 2) - OFF

K0 = -10                         # inst bar at film 0 (a 4-bar phrase of the beat's intro), its bass from film bar 4
DROP_B = 48                      # film bar 12 = inst bar 2, the beat's drop: "This is Stalak."
PAY_B = 128                      # film bar 32 = inst bar 22, in the 8-bar phase of song bar 4: his song, 4 bars
END_B = PAY_B + 16               # film bar 36: "You film. Stalak edits."
TOTAL = round(B(164), 3)         # film bar 41
assert K0 + DROP_B // 4 == 2 and (K0 + PAY_B // 4 - 6) % 8 == 0

# ------------------------------------------------------------------ the voice (vo_cut.py: 17 lines, the long silences cut)
VO = {c["id"]: c for c in json.loads((HERE / "assets/audio/vo/yt_clips.json").read_text())}
LIDS = ["L%02d" % i for i in range(1, 18)]
def word(lid, w, n=1):
    hits = [t for x, t in VO[lid]["words"] if x.strip(".,?!:'").lower() == w.lower()]
    return hits[n - 1]
def dur(lid): return VO[lid]["speech_dur"]
MASTER = 0.68                    # the whole mix: the render sums the tracks with no limiter (mastered after)
at = {}
at["L07"] = B(DROP_B) - word("L07", "stalak") - 0.02             # "Stalak" lands on the drop
A0 = 0.10
G = [0.30, 0.45, 0.30, 1.05, 0.50]   # the problem's gaps after L01..L05; after "…land on the beat.", time to read OFF BEAT (owner, 2/11)
t = A0
for l, g in zip(LIDS[:6], G + [0.0]):
    at[l] = t; t += dur(l) + g
g1 = at["L07"] - (at["L06"] + dur("L06"))                        # the breath before the drop
assert 0.26 <= g1 <= 0.8, g1
end7 = at["L07"] + dur("L07")
LIM = B(PAY_B) - 0.75                                            # the last line ends before the payoff's riser
g2 = (LIM - end7 - sum(dur(l) for l in LIDS[7:15])) / 8
t, prev = end7 + g2, end7
for l in LIDS[7:15]:                                             # Stalak, step by step: each line starts on an eighth note
    s = round(t / (P / 2)) * (P / 2)
    s = max(s, prev + 0.24)
    at[l] = s; prev = s + dur(l); t = prev + g2
assert at["L15"] + dur("L15") < B(PAY_B) - 0.4, (at["L15"] + dur("L15"), B(PAY_B))
at["L16"] = B(END_B) - 0.02                                      # "You" on the downbeat after the payoff
b = END_B
while B(b) < at["L16"] + dur("L16") + 0.24: b += 1
at["L17"] = B(b) - 0.02
assert at["L17"] + dur("L17") < TOTAL - 1.6
vo_rows, vo_spans = [], []
for i, lid in enumerate(LIDS):
    c = VO[lid]
    vo_rows.append('<audio id="%s" class="clip" src="assets/audio/vo/%s.wav" data-start="%.3f" data-duration="%.3f" data-track-index="%d" data-volume="%.3f"></audio>'
                   % (lid.lower(), lid, at[lid] - c["speech_offset"], c["dur"], 30 + i % 2, MASTER))
    vo_spans.append([round(at[lid], 3), round(at[lid] + dur(lid), 3)])
for a, b2 in zip(vo_spans, vo_spans[1:]):
    assert b2[0] - a[1] > 0.15, ("voice lines too close", a, b2)
def W(lid, w, n=1): return at[lid] + word(lid, w, n)

# ------------------------------------------------------------------ the scenes (film seconds), from the voice
S = {
    "s2": at["L02"] - 0.08, "cutIn": W("L02", "part"), "slice": W("L02", "edit"),
    "s3": at["L03"] - 0.1, "try1": W("L03", "take"), "try2": W("L03", "line"), "try3": W("L03", "track"),
    "s4": at["L04"] - 0.1, "blade": W("L04", "beat"),
    "s5": at["L05"] - 0.42, "off": W("L05", "off"), "lips": W("L05", "and"), "words": W("L05", "words"),
    "s6": at["L06"] - 0.1, "tue": W("L06", "tomorrow"), "wed": W("L06", "another"), "thu": W("L06", "day"), "fri": W("L06", "that"),
    "s7": at["L07"], "drop": B(DROP_B),
    "s8": at["L08"] - 0.32, "songDrop": W("L08", "drop"), "land": W("L08", "song"),
    "s9": at["L09"] - 0.12, "takesIn": W("L09", "takes"), "imp": W("L09", "import"), "rec": W("L09", "film"),
    "align": W("L10", "lines"), "synced": W("L10", "music"), "toEdit": W("L10", "and"), "cuts": W("L10", "cuts"), "beat10": W("L10", "beat"),
    "s11": at["L11"] - 0.24, "lock": W("L11", "locked"),
    "s12": at["L12"] - 0.2, "paste": W("L12", "paste"), "tap": W("L12", "tap"), "show": W("L12", "show"), "onTime": W("L12", "time"),
    "s13": at["L13"] - 0.18, "chill": W("L13", "chill"), "punchy": W("L13", "punchy"), "pace": W("L13", "pace"),
    "s14": at["L14"] - 0.06, "tik": W("L14", "tiktok"), "pro": W("L14", "pro"), "yt": W("L14", "youtube"),
    "s15": at["L15"] - 0.2, "cplus": W("L15", "creator"), "thirty": W("L15", "thirty"), "edits": W("L15", "edits"), "newv": W("L15", "new"), "day": W("L15", "day"), "one15": W("L15", "one"), "turns": W("L15", "turns"),
    "pay": B(PAY_B), "payEnd": B(END_B),
    "s17": at["L16"], "film17": W("L16", "you"), "stalak17": W("L16", "stalak"),
    "s18": at["L17"] - 0.04, "url": W("L17", "stalak"), "free": W("L17", "free"), "nodl": W("L17", "no", 1), "nosu": W("L17", "no", 2),
}
S["sweep0"] = S["cuts"] - 0.05                       # the cut bar is cut, block after block, across one bar's time
S["sweep1"] = S["sweep0"] + 1.25
S["cu0"] = S["s5"] + 0.62                            # the dive ends: the frame plays
assert S["cu0"] < S["off"] - 0.1 and S["sweep1"] < S["s11"]
# the edit: an 8-bar part of the song (32 beats): (first beat, take); the pace re-cuts it
LAY = {
    "normal": [(0, 1), (4, 2), (8, 3), (10, 1), (12, 2), (16, 3), (20, 1), (22, 3), (24, 2), (28, 1)],
    "chill": [(0, 2), (8, 1), (16, 3), (24, 1)],
    "punchy": [(0, 3), (2, 1), (4, 2), (5, 3), (6, 1), (8, 2), (10, 3), (11, 1), (12, 2), (14, 3), (16, 1), (18, 2), (19, 3), (20, 1), (22, 2),
               (24, 3), (26, 1), (27, 2), (28, 3), (30, 1)],
}
L8 = 8 * BAR
PART0 = B(DROP_B)                                   # the edit's part starts on the drop's bar line, every 8 bars after
def lay_at(t): return "chill" if S["chill"] <= t < S["punchy"] else ("punchy" if t >= S["punchy"] else "normal")
def take_at(t, lay=None):
    p = ((t - PART0) % L8) / P
    blocks = LAY[lay or lay_at(t)]
    k = max(i for i, (b0, _) in enumerate(blocks) if b0 <= p + 1e-6)
    return blocks[k][1]

# ------------------------------------------------------------------ the music
MUS = [
    ("m-walk", "inst.mp3", 0.0, B(PAY_B), inst_bar(K0)),           # the intro, its bass from bar 4, the drop on bar 12
    ("m-pay", "song.mp3", B(PAY_B), B(END_B), song_bar(4)),        # his song, his voice, 4 bars ("I gotta bounce")
    ("m-end", "inst.mp3", B(END_B), TOTAL, inst_bar(K0 + END_B // 4)),
]
LO1, LO2, HI = 0.40, 0.22, 0.46                     # under the voice (problem, Stalak), between (measured, see REVIEW.md)
end15 = at["L15"] + dur("L15")
def autos(mid, a, b):
    if mid == "m-walk":
        return [(0.0, LO1), (S["drop"] - 0.3, LO1), (S["drop"] + 0.02, LO2), (end15 + 0.05, LO2), (end15 + 0.45, HI), (b - a, HI)]
    if mid == "m-pay":
        return [(0.0, 0.48), (b - a, 0.48)]
    e17 = at["L17"] + dur("L17") - a
    return [(0.0, LO2), (e17 + 0.05, LO2), (e17 + 0.45, 0.4), (b - a - 1.3, 0.4), (b - a, 0.0)]
mus_rows = []
for mid, fn, a, b, ms in MUS:
    pts = autos(mid, a, b)
    xa = 0.012 if a > 0 else 0.0
    dur_ = (b - a) + xa + (0.012 if b < TOTAL else 0)
    pts = [(x + xa, v * MASTER) for x, v in pts]
    def at_(x): return float(np.interp(x, [p[0] for p in pts], [p[1] for p in pts]))
    if a > 0: pts = [(0.0, 0.0), (0.024, at_(0.024))] + [p for p in pts if p[0] > 0.024]
    if b < TOTAL: pts = [p for p in pts if p[0] < dur_ - 0.024] + [(dur_ - 0.024, at_(dur_ - 0.024)), (dur_, 0.0)]
    pts = [(round(x, 3), round(v, 3)) for x, v in pts]
    auto = json.dumps({"version": 1, "lanes": [{"target": "volume", "points": [{"t": t_, "v": v} for t_, v in pts]}]}, separators=(",", ":"))
    mus_rows.append('<audio id="%s" class="clip" src="assets/audio/%s" data-start="%.3f" data-duration="%.3f" data-media-start="%.3f" data-track-index="%d" data-timeline-role="music" data-volume="1" data-automation=\'%s\'></audio>'
                    % (mid, fn, a - xa, dur_, ms - xa, 7 + len(mus_rows) % 2, auto))

# ------------------------------------------------------------------ sounds made here (the cutter, a card that lands, pieces that scatter)
SR = 48000
def wav_out(name, x):
    x = np.clip(x, -1, 1)
    with wave.open(str(HERE / "assets/sfx" / (name + ".wav")), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32000).astype(np.int16).tobytes())
rs = np.random.RandomState(7)
tt = np.arange(int(0.42 * SR)) / SR
n = rs.randn(tt.size)
hp = np.concatenate([[0], np.diff(n)])                                    # bright noise
slice_ = hp * np.exp(-tt / 0.05) * (1 - np.exp(-tt / 0.003)) * 0.55
slice_ += np.sin(2 * np.pi * (3200 - 2400 * tt / 0.42) * tt) * np.exp(-tt / 0.035) * 0.25
slice_[: int(0.004 * SR)] += rs.randn(int(0.004 * SR)) * 0.6               # the click of the blade
wav_out("slice", slice_)
tt = np.arange(int(0.45 * SR)) / SR
thud = np.sin(2 * np.pi * 85 * tt) * np.exp(-tt / 0.07) * 0.9 + rs.randn(tt.size) * np.exp(-tt / 0.018) * 0.35
wav_out("thud", thud)
tt = np.arange(int(0.7 * SR)) / SR
scat = np.zeros(tt.size)
for k in range(16):
    t0 = int((0.02 + 0.55 * (k / 16) ** 1.3 + rs.rand() * 0.02) * SR)
    m = int(0.006 * SR)
    scat[t0:t0 + m] += rs.randn(m) * np.exp(-np.arange(m) / (0.0015 * SR)) * (0.7 - 0.03 * k)
wav_out("scatter", np.concatenate([[0], np.diff(scat)]) * 0.9)
PK = json.loads((HERE / "assets/sfx/peaks.json").read_text())
PK.update({"slice": {"peak": 0.002, "dur": 0.42}, "thud": {"peak": 0.004, "dur": 0.45}, "scatter": {"peak": 0.02, "dur": 0.7},
           "tick": {"peak": 0.001, "dur": 0.09}, "tock": {"peak": 0.001, "dur": 0.09}, "shatter-s": {"peak": 0.003, "dur": 0.5}})
EXT = {"slice": "wav", "thud": "wav", "scatter": "wav", "tick": "wav", "tock": "wav", "shatter-s": "wav"}

# ------------------------------------------------------------------ sounds on the visible actions: (id, file, film time of the hit, volume[, media start, length])
beats4 = [B(b) for b in range(int(S["s4"] / P) + 1, int((S["blade"]) / P) + 1)]
SFX = [
    ("x-open", "whoosh-short", 0.05, 0.10),
    ("x-cutin", "whoosh", S["cutIn"] + 0.05, 0.14), ("x-slice", "slice", S["slice"], 0.34), ("x-scat", "scatter", S["slice"] + 0.08, 0.3),
    ("x-pull", "whoosh-short", S["slice"] + 0.2, 0.1),
    ("x-s3", "whoosh-short", S["s3"] + 0.04, 0.08),
    ("x-t1", "click-soft", S["try1"] + 0.3, 0.16), ("x-t2", "click-soft", S["try2"] + 0.3, 0.16), ("x-t3", "click-soft", S["try3"] + 0.3, 0.16),
    ("x-s4", "whoosh-short", S["s4"] + 0.04, 0.08),
] + [("x-b%d" % i, "tick", bt, 0.22) for i, bt in enumerate(beats4[-4:])] + [
    ("x-blade", "slice", S["blade"] + 0.02, 0.3), ("x-err", "error", S["blade"] + 0.2, 0.12),
    ("x-dive", "whoosh-cinematic", S["s5"] + 0.62, 0.16), ("x-off", "glitch-1", S["off"] + 0.05, 0.12), ("x-lips", "glitch-2", S["lips"] + 0.25, 0.1),
    ("x-s6", "whoosh-short", S["s6"] + 0.04, 0.1),
    ("x-tue", "thud", S["tue"] + 0.28, 0.4), ("x-wed", "thud", S["wed"] + 0.28, 0.4), ("x-thu", "thud", S["thu"] + 0.28, 0.4), ("x-fri", "thud", S["fri"] + 0.28, 0.4),
    ("x-sc6a", "scatter", S["tue"] + 0.32, 0.16), ("x-sc6b", "scatter", S["wed"] + 0.32, 0.16), ("x-sc6c", "scatter", S["thu"] + 0.32, 0.16),
    ("x-suck", "whoosh-cinematic", S["drop"] - 0.04, 0.16, 1.9, 0.9),
    ("x-drop", "impact-bass-1", S["drop"], 0.3), ("x-drop2", "sparkle", S["drop"] + 0.06, 0.16),
    ("x-s8", "whoosh-short", S["s8"] - 0.36, 0.12), ("x-fall", "whoosh-short", S["songDrop"] + 0.1, 0.12), ("x-land", "pop", S["land"] + 0.16, 0.2),
    ("x-bpm", "ping", S["land"] + 0.1, 0.08),
    ("x-s9", "whoosh-short", S["s9"] + 0.12, 0.12),
    ("x-tk1", "pop", S["takesIn"] + 0.08, 0.16), ("x-tk2", "pop", S["takesIn"] + 0.2, 0.16), ("x-tk3", "pop", S["takesIn"] + 0.32, 0.16),
    ("x-imp", "click", S["imp"] + 0.05, 0.22), ("x-rec", "click", S["rec"] + 0.05, 0.22),
    ("x-al", "whoosh-short", S["align"] + 0.05, 0.1), ("x-lk1", "click-soft", S["synced"] - 0.45, 0.2), ("x-lk2", "click-soft", S["synced"] - 0.33, 0.2),
    ("x-lk3", "click-soft", S["synced"] - 0.21, 0.2), ("x-ok", "chime", S["synced"] - 0.1, 0.06),
    ("x-toed", "whoosh-short", S["toEdit"] + 0.08, 0.12),
] + [("x-c%02d" % i, "tick", S["sweep0"] + (S["sweep1"] - S["sweep0"]) * (b0 / 32), 0.18) for i, (b0, _) in enumerate(LAY["normal"]) if b0 > 0] + [
    ("x-s11", "whoosh-short", S["s11"] + 0.1, 0.1), ("x-lock", "key-press", S["lock"] + 0.06, 0.3),
    ("x-s12", "whoosh-short", S["s12"] + 0.06, 0.12), ("x-paste", "typing", S["paste"] + 0.12, 0.12, 0.43, 0.6), ("x-tsy", "click", S["tap"] - 0.12, 0.2),
] + [("x-tap%d" % i, "key-press", S["tap"] + 0.12 + i * P, 0.26) for i in range(3)] + [
    ("x-lyout", "whoosh-short", S["show"] - 0.12, 0.1), ("x-lyr", "pop", S["show"] + 0.1, 0.14),
    ("x-chill", "click", S["chill"], 0.22), ("x-rc1", "whoosh-short", S["chill"] + 0.08, 0.08),
    ("x-punchy", "click", S["punchy"] + 0.04, 0.22),
] + [("x-p%02d" % i, "tick", S["punchy"] + 0.1 + 0.03 * i, 0.12) for i in range(0, 16, 3)] + [
    ("x-exp", "click", S["s14"] + 0.02, 0.24), ("x-tox", "whoosh", S["s14"] + 0.22, 0.14), ("x-phone", "pop", S["tik"] + 0.06, 0.12),
    ("x-tv", "whoosh", S["pro"] - 0.08, 0.14), ("x-pro", "sparkle", S["pro"] + 0.25, 0.12),
    ("x-s15", "whoosh-short", S["s15"] + 0.1, 0.12), ("x-cp", "sparkle", S["cplus"] + 0.05, 0.1), ("x-30", "click", S["cplus"] + 0.42, 0.2),
    ("x-mk", "click", S["one15"], 0.22), ("x-tp", "pop", S["one15"] + 0.12, 0.14),
    ("x-fan", "whoosh-cinematic", S["turns"] + 0.3, 0.12, 2.0, 1.2), ("x-ready", "chime", S["edits"] + 0.3, 0.07),
    ("x-week", "whoosh", S["newv"] + 0.02, 0.12),
] + [("x-d%d" % i, "pop", S["newv"] + 0.4 + i * P / 2, 0.12) for i in range(7)] + [
    ("x-pay", "impact-bass-2", S["pay"], 0.26), ("x-payout", "whoosh-short", S["payEnd"] - 0.14, 0.12),
    ("x-cl1", "impact-bass-1", S["film17"] + 0.02, 0.16), ("x-cl2", "impact-bass-1", S["stalak17"] + 0.02, 0.2), ("x-cl3", "sparkle", S["stalak17"] + 0.08, 0.12),
    ("x-end", "whoosh-short", S["s18"] + 0.04, 0.12), ("x-endi", "sparkle", S["s18"] + 0.2, 0.1), ("x-type", "typing", S["url"] - 0.05, 0.12, 0.43, 0.5),
]
rows, lanes = [], []
def sfx_start(fn, at_): return at_ - 0.02 if fn == "typing" else max(0.0, at_ + 1 / 30 - PK[fn]["peak"])
for row in sorted(SFX, key=lambda r: sfx_start(r[1], r[2])):
    sid, fn, at_, vol = row[:4]
    ms = row[4] if len(row) > 4 else (0.43 if fn == "typing" else 0.0)
    st = sfx_start(fn, at_) if not (len(row) > 4 and fn != "typing") else at_ - (PK[fn]["peak"] - ms)
    ln = row[5] if len(row) > 5 else min(PK[fn]["dur"] - ms, 1.4)
    if st < 0: ms -= st; ln += st; st = 0.0
    lane = next((i for i, end in enumerate(lanes) if end <= st), None)
    if lane is None: lanes.append(0); lane = len(lanes) - 1
    lanes[lane] = st + ln
    ext = EXT.get(fn, "mp3")
    rows.append('<audio id="%s" class="clip" src="assets/sfx/%s.%s" data-start="%.3f" data-duration="%.3f"%s data-track-index="%d" data-volume="%.3f"></audio>'
                % (sid, fn, ext, st, ln, (' data-media-start="%.3f"' % ms) if ms > 0 else "", 12 + lane, vol * MASTER))
rs_ = S["drop"] + 1 / 30 - 3.982 + 2.4           # the riser into the drop: its peak (3.982 s into the file) lands on it
rows.append('<audio id="x-riser" class="clip" src="assets/sfx/riser.mp3" data-start="%.3f" data-duration="%.3f" data-media-start="2.400" data-track-index="29" data-volume="%.3f"></audio>' % (rs_, S["drop"] - rs_ + 0.1, 0.16 * MASTER))
rp = S["pay"] + 1 / 30 - 3.982 + 2.9             # and into the payoff, shorter
rows.append('<audio id="x-riser2" class="clip" src="assets/sfx/riser.mp3" data-start="%.3f" data-duration="%.3f" data-media-start="2.900" data-track-index="28" data-volume="%.3f"></audio>' % (rp, S["pay"] - rp + 0.1, 0.14 * MASTER))

# ------------------------------------------------------------------ the videos
FPS = 30
def clips(prefix, t0, t1, take_fn, tau_fn, extra=""):
    """film [t0, t1) -> <video> clips: a new clip whenever the take changes or its time jumps"""
    out, seg = [], None
    n0, n1 = int(round(t0 * FPS)), int(round(t1 * FPS))
    for f in range(n0, n1):
        tf = f / FPS
        k, tau = take_fn(tf), tau_fn(tf)
        if seg and seg["k"] == k and abs(tau - (seg["tau0"] + (tf - seg["t0"]))) < 0.5 / FPS:
            seg["t1"] = tf + 1 / FPS; continue
        if seg: out.append(seg)
        seg = {"k": k, "t0": tf, "t1": tf + 1 / FPS, "tau0": tau}
    if seg: out.append(seg)
    html = []
    for i, s_ in enumerate(out):
        assert 0.0 <= s_["tau0"] and s_["tau0"] + (s_["t1"] - s_["t0"]) <= 15.0, (prefix, s_)
        html.append('<video id="%s%02d" class="clip v"%s data-hf-media-start-basis="local" src="assets/takes/take%d.mp4" data-start="%.3f" data-duration="%.3f" data-media-start="%.3f" muted playsinline></video>'
                    % (prefix, i, extra, s_["k"], s_["t0"], s_["t1"] - s_["t0"], s_["tau0"]))
    return "\n".join(html), out
W0 = 8.6                                               # the preview's takes loop through 2 bars where he faces the camera
def tau_loop(t):
    u = t + (inst_bar(K0) - OFF - TAKE)                # the take time in the music's place...
    return W0 + ((u - W0) % (2 * BAR))                 # ...kept in [8.6, 11.66), same phase
def take_edit(t): return 1 if t < S["sweep1"] else take_at(t)
EDIT, edit_segs = clips("ve", S["toEdit"] - 0.5, S["s14"] + 0.9, take_edit, tau_loop)
EXP, _ = clips("vx", S["s14"] + 0.1, S["s15"] + 0.7, lambda t: take_at(t, "punchy"), tau_loop)
# the YouTube music video (16:9): the owner's own clip (assets/clip/mv.mp4, sent 2/11), not a take of the vertical edit
TV0, TV1, MV0 = S["pro"] - 0.45, S["s15"] + 0.7, 4.6    # from 4.6 s: after its title and white flash, his shots at the window
assert MV0 + (TV1 - TV0) <= 9.3, TV1 - TV0
TV = '<video id="vt00" class="clip v" data-hf-media-start-basis="local" src="assets/clip/mv.mp4" data-start="%.3f" data-duration="%.3f" data-media-start="%.3f" muted playsinline></video>' % (TV0, TV1 - TV0, MV0)
# the close-up: take 3, his face close; at "and your lips…" the picture slips to another moment
CU, _ = clips("vc", S["cu0"], S["s6"] + 0.05, lambda t: 3, lambda t: 5.62 + (t - S["cu0"]) if t < S["lips"] else 12.0 + (t - S["lips"]))
# the payoff: three edits of the pack (MON, TUE, WED), each cut differently, all on his song (take = song - TAKE)
PAYL = [[(0, 3), (3, 2), (5, 1), (7, 3), (9, 2), (11, 1), (13, 3), (15, 2)],
        [(0, 2), (2, 1), (4, 3), (7, 2), (9, 1), (10, 3), (12, 2), (14, 1)],
        [(0, 1), (2, 2), (3, 3), (4, 1), (5, 2), (7, 1), (9, 3), (10, 1), (11, 2), (12, 3), (13, 1), (14, 2), (15, 3)]]
for b_ in range(16):                                   # the three panels never show the same take at the same time
    ks = [[k for b0, k in l if b0 <= b_][-1] for l in PAYL]
    assert sorted(ks) == [1, 2, 3], (b_, ks)
def tau_pay(t): return song_bar(4) + (t - B(PAY_B)) - TAKE
def take_pay(lay):
    def f(t):
        p = max(0.0, (t - B(PAY_B)) / P)
        return lay[max(i for i, (b0, _) in enumerate(lay) if b0 <= p + 1e-6)][1]
    return f
PAYH = [clips("vp%d" % i, B(PAY_B) - 0.4, B(END_B) + 0.5, take_pay(l), tau_pay)[0] for i, l in enumerate(PAYL)]
assert tau_pay(B(PAY_B) - 0.4) > 0 and tau_pay(B(END_B) + 0.5) < 15
film = HERE / "compositions" / "film.html"
s_ = film.read_text()
for k, html in {"EDIT": EDIT, "EXP": EXP, "TV": TV, "CU": CU, "PAY0": PAYH[0], "PAY1": PAYH[1], "PAY2": PAYH[2]}.items():
    s_, nn = re.subn(r"<!--%s-->.*?<!--/%s-->" % (k, k), "<!--%s-->\n%s\n<!--/%s-->" % (k, html, k), s_, flags=re.S)
    if nn != 1: raise SystemExit("marker %s missing" % k)
film.write_text(s_)

# ------------------------------------------------------------------ the waveforms the film draws (his song)
def env(path, a, b, n):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-ss", "%.3f" % a, "-t", "%.3f" % (b - a), "-i", str(path), "-ac", "1", "-ar", "8000", "-f", "s16le", "-"],
                         capture_output=True, check=True).stdout
    x = np.frombuffer(raw, np.int16).astype(np.float32) / 32768
    x = x[: len(x) // n * n].reshape(n, -1)
    r = np.sqrt((x ** 2).mean(1))
    return [round(float(v), 3) for v in r / r.max()]
SONG = HERE / "assets/audio/song.mp3"
WAVES = {"tape": env(SONG, 0, 30, 600), "pick": env(SONG, 0, 30, 236), "part": env(SONG, song_bar(4), song_bar(4) + 8 * BAR, 280)}

CAPS2 = make_caps(LIDS, at, VO, dur, LIDS[:15], [B(PAY_B) - 0.42])   # every line but the claim and the end card (they show their own words)
times = {"P": P, "TOTAL": TOTAL, "S": {k: round(v, 3) for k, v in S.items()}, "VO": vo_spans, "VW": [VO[l]["words"] for l in LIDS], "CAPS2": CAPS2,
         "LAY": LAY, "PART0": round(PART0, 4), "L8": round(L8, 4), "PAYL": PAYL, "WAVES": WAVES,
         "songBar0": round(song_bar(0), 4), "BAR": BAR}
(HERE / "assets" / "times.js").write_text("/* generated by build.py: the film's clock (scenes, voice words, the edit, waveforms) */\nwindow.T = %s;\n" % json.dumps(times, separators=(",", ":")))

html = """<!doctype html>
<html lang="en" data-resolution="landscape">
  <head>
    <meta charset="UTF-8" /><meta name="viewport" content="width=1920, height=1080" />
    <title>Stalak — The edit nobody sees (YouTube, 16:9)</title>
    <script src="assets/vendor/gsap.min.js"></script>
    <script src="assets/times.js"></script>
    <script src="assets/engine.js"></script>
    <style>
      @font-face { font-family: "Rubik"; src: url("assets/fonts/rubik.ttf"); font-weight: 300 900; }
      @font-face { font-family: "Lilita One"; src: url("assets/fonts/lilitaone.ttf"); }
      html, body { margin: 0; width: 1920px; height: 1080px; overflow: hidden; background: #12161c; }
      #main { position: relative; width: 1920px; height: 1080px; overflow: hidden; background: #12161c; }
    </style>
  </head>
  <body>
    <div id="main" data-composition-id="main" data-start="0" data-duration="%(total).3f" data-width="1920" data-height="1080">
      <!-- generated by build.py: edit build.py, then run python3 build.py -->
      <div id="h-film" data-composition-id="film" data-composition-src="compositions/film.html" data-start="0" data-duration="%(total).3f" data-track-index="0" data-track-kind="graphics" data-width="1920" data-height="1080" style="z-index:1"></div>
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
print("total %.3f s | drop %.3f | payoff %.3f-%.3f | gaps %.3f / %.3f" % (TOTAL, B(DROP_B), B(PAY_B), B(END_B), g1, g2))
print("voice", vo_spans)
print("scenes", {k: round(v, 2) for k, v in S.items()})
print("clips: edit %d, exp %d, tv %d, cu %d, pay %s" % (EDIT.count("<video"), EXP.count("<video"), TV.count("<video"), CU.count("<video"), [h.count("<video") for h in PAYH]))
