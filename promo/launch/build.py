"""Builds the launch film (SPEC.md): writes assets/times.js (every time the engine uses), assets/audio/music/bed.wav (the
music, cut on its bars), index.html (the film host, the voice lines, the music and its ducking, the sound effects) and puts the
video clips into compositions/film.html between their <!--C:box--> markers.

The voice is the clock (hyperframes sound.md): each scene starts on a beat of the music near its voice line, and every action
that a word names (a click, a chip, a typed word) lands on that word (K below, from the word timings of vo_cut.py).
usage: python3 build.py            (python3 build.py --no-bed: keep the existing bed.wav)
"""
import json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
FPS = 60                           # v3: 60 images a second (his remark: "pas assez fluide"), YouTube plays it
FRAME = 1.0 / FPS
OUT_TIMES = os.path.join(HERE, "assets", "times.js")
FILM = os.path.join(HERE, "compositions", "film.html")
INDEX = os.path.join(HERE, "index.html")
HF = ["npx", "--yes", "hyperframes@0.8.223"]

# ---------------------------------------------------------------- the voice: 12 lines (assets/audio/vo/V01..V12.wav, vo_cut.py)
VO = json.load(open(os.path.join(HERE, "assets", "audio", "vo", "lines.json")))
# where each line's file starts in the film (s); its speech starts speech_offset (0.1 s) later
AT = {"V01": 1.5, "V02": 7.7, "V03": 9.75, "V04": 16.25, "V05": 24.1, "V06": 30.2, "V07": 34.0,
      "V08": 40.4, "V09": 45.2, "V10": 49.8, "V11": 53.75, "V12": 55.9}


def w(line, word, k=0):
    """film time of the onset of the k-th `word` of a line"""
    v = VO[line]
    hits = [t for x, t in v["words"] if x.strip(".,?!:").lower() == word.lower()]
    return round(AT[line] + v["speech_offset"] + hits[k], 4)


def speech(line):
    v = VO[line]
    a = AT[line] + v["speech_offset"]
    return a, a + v["speech_dur"]


# ---------------------------------------------------------------- the music
# v3 (his remark of 2/11, 19 h 13: the Lyria track is "beaucoup trop calme et mignon", he wants "la musique qu'on utilisait
# avant"): the instrumental of his "neva die" (157 BPM, as in promo/youtube and promo/one-shape), slowed to the film's
# 150 BPM with rubberband (pitch kept; 1 bar = 1.6 s), so every cut and flash stays on its beat. Its grid, measured in
# promo/one-shape: a downbeat at D0 = 20.2946 + 3 × 60/157 s, bars every 4 × 60/157 s, chords looping every 8 bars.
# Stretched: bar k at INST_D0 + 1.6 k (checked on the file: onsets on that grid, 3 ms off the expected map, corr. 0.99).
# The instrumental's parts (bar loudness): intro −14..−7 (soft), pre −6..1 (808 in), drop 2..17, break 18-19, 20..33,
# soft 34..41, pre 42..49, 50..65, outro 66..73.
TRACK = os.path.join(HERE, "assets", "audio", "music", "nevadie_inst.mp3")        # = promo/youtube/assets/audio/inst.mp3
TRACK150 = os.path.join(HERE, "assets", "audio", "music", "nevadie_150.wav")
BED = os.path.join(HERE, "assets", "audio", "music", "bed.wav")
BPM = 150.0
BEAT = 60.0 / BPM                  # 0.4 s; a bar = 1.6 s; the film's downbeats fall at 0.8 + 1.6 k
STRETCH = 150.0 / 157.0
INST_D0 = (20.2946 + 3 * 60 / 157) / STRETCH - 0.0029
BEAT0 = 0.8 - 2 * 1.6              # a film downbeat (times.js)
# the bed: (film time, instrumental bar there). Each seam keeps the 8-bar loop in phase (next bar ≡ last + 1, mod 8),
# except into the outro, which comes under the impact.
BED_PLAN = [(0.0, -11.5),          # its intro (soft) under the opening; film 0.8 is a downbeat
            (2.4, -2),             # the 808 comes in as the glass UI builds (the last 4 bars of its pre)
            (8.8, 2),              # its drop, on "Meet Stalak." (the logo), then 16 bars
            (34.4, 50),            # 10 more bars of the full beat (same loop phase)
            (50.4, 36),            # a 2-bar break (its soft part) under "less time editing / more time making music"
            (53.6, 22),            # the beat back on "So, what will you drop today?" (S11)
            (55.2, 71, 6.0)]       # its last 3 bars, under the crystal and the logo: it ends at 60.0 with the track
                                   # (+6 dB: its outro is ~14 dB under its full beat)

# ---------------------------------------------------------------- the scenes (s), each on a beat (multiples of 0.4)
S = {"s0": 0.0, "s1": 1.6, "s1b": 5.2, "s2": 6.4, "s3a": 9.6, "s3b": 12.0, "s3c": 13.6, "s4": 16.0, "s5": 24.0, "s5f": 25.6,
     "s6": 28.8, "s7": 33.6, "s8": 40.0, "s9": 44.8, "s10": 49.6, "s11": 53.6, "s12": 55.2, "end": 60.0}
TOTAL = S["end"]
for k, v in S.items():
    assert abs(v / BEAT - round(v / BEAT)) < 1e-6, (k, v)
FL = [S["s5f"] + i * 0.8 for i in range(5)]          # the four flashes, two beats each: 25.6, 26.4, 27.2, 28.0 (→ 28.8)

# ---------------------------------------------------------------- the actions, on the words that name them
K = {}
K["type1"] = [S["s1b"] + 0.1, S["s1b"] + 0.9]                         # "I have a song." typed while the voice says "a song?"
K["split"] = w("V04", "just") - 0.35                                  # he goes to the right, the glass box comes in
K["chSong"] = w("V04", "song") - 0.1                                  # "neva die.mp3" lands on "song"
K["chTk"] = [w("V04", "takes") - 0.12 + 0.15 * i for i in range(3)]    # Take 1, 2, 3 on "takes"
K["slide4"] = K["chTk"][2] + 0.2                                      # he leaves, the box goes to the middle
K["go"] = w("V04", "stalak") - 0.02                                   # the → click on "Stalak"
K["synced"] = w("V04", "syncs") + 0.3                                 # "All the takes are synced." while the voice says it
K["edit4"] = w("V04", "music") + 0.35                                 # the real edit card, after "music"
K["words6"] = w("V06", "beautifully") - 0.05                          # "Beautifully [window] edited"
K["ready6"] = w("V06", "ready")                                       # "ready to post", letters landing
K["toggle6"] = w("V06", "post") + 0.21                                # the cursor switches the toggle on, after "post"
K["punchy"] = w("V07", "pace") + 0.5                                  # click on Punchy after "Change the pace"
K["lyr7"] = w("V07", "lyrics") + 0.15                                 # his line's first word in the preview
K["shuffle"] = w("V07", "shuffle") + 0.03                             # click on ↻ Shuffle on "shuffle"
K["dir"] = [w("V07", "in") - 0.06, w("V07", "any") - 0.06, w("V07", "direction") - 0.06]
K["ws8"] = [w("V08", x) - 0.12 for x in ("what", "starts", "as")]
K["ft8"] = [w("V08", "a") - 0.03, w("V08", "few") - 0.03, w("V08", "takes") - 0.08]
K["pack"] = w("V08", "week") + 0.02                                   # click on "Make the pack" on "week"
K["export"] = w("V09", "export")                                      # click on Export on "Export"
K["pick"] = [w("V09", x) for x in ("tiktok", "reels", "shorts", "youtube")]
K["less"] = [w("V10", "less") - 0.07, w("V10", "editing") + 0.14]     # "Less time editing." typed …
K["del"] = [K["less"][1] + 0.28, K["less"][1] + 0.55]                 # … then wiped
K["more"] = [w("V10", "more") - 0.05, w("V10", "music") + 0.06]       # "More time making music." typed
K["wwy"] = [w("V11", x) - 0.08 for x in ("what", "will", "you")]
K["drop"] = w("V11", "drop") - 0.11
K["today"] = w("V11", "today") - 0.13
K["mark"] = w("V12", "stalak") - 0.1                                  # the name wipes in on "Stalak"
K["drop"] = BED_PLAN[2][0]                                           # v3: the beat drops (the snow burst)
K["back"] = BED_PLAN[5][0]                                           # v3: the beat comes back after the break

# ---------------------------------------------------------------- the video clips (his takes and his music video)
TAKE = {1: "assets/takes/take1.mp4", 2: "assets/takes/take2.mp4", 3: "assets/takes/take3.mp4", "mv": "assets/clip/mv.mp4"}
TLEN = {1: 15.02, 2: 25.566, 3: 25.566, "mv": 9.3}
# his music video: titles at 0-2.3 s and a glitch at 3.53-3.9; its own flash cuts at 4.4, 5.37, 6.17, 6.63, 7.27 stay (his edit)
MV_OK = [(2.33, 3.5), (4.47, 7.95), (8.47, 9.3)]
CLIPS = []                         # (id, src, start, end, media start, box): box = the <!--C:box--> container in film.html


def clip(cid, k, a, b, m0, box):
    assert m0 >= 0 and m0 + (b - a) <= TLEN[k] + 1e-6, (cid, k, m0, b - a)
    if k == "mv":
        assert any(x - 0.04 <= m0 and m0 + (b - a) <= y + 0.06 for x, y in MV_OK), (cid, m0, b - a)
    CLIPS.append((cid, TAKE[k], round(a, 4), round(b, 4), round(m0, 4), box))


# his line « j'ai mis de l'or sur mes plaies, cicatrices valent des millions », in English at his request (take times, takes 2
# and 3, promo/youtube/caps.py LYRIC); the app shows it in its "Classic" style, word by word on his voice
LYRIC = [[21.24, [[["I", 21.26], ["put", 21.50], ["gold", 21.80]], [["on", 22.17], ["my", 22.40], ["wounds,", 22.47]]]],
         [22.55, [[["scars", 22.56], ["worth", 22.98]], [["millions.", 23.12]]]]]
LY = {}                            # lyric display -> [[film a, film b, take time at a]]

WHIP = 0.25                        # v2: the camera pans from device to device (S3): each one is seen 0.25 s before its scene
clip("v3b", 3, S["s3b"] - WHIP, S["s3c"] + WHIP, 2.0 - (WHIP - 0.05), "phone")  # the phone: take 3 in the app's preview
# v2 (owner's remark 1, 2/11: no more close-up of his face): the tablet's preview IS his card of S4. Take 2 runs on the
# tablet at media time = film time, and goes on in the 9:16 card at 16.0 s: one continuous shot from the tablet to the card.
clip("v3c", 2, S["s3c"] - WHIP, S["s4"] + 0.05, S["s3c"] - WHIP, "tablet")      # the tablet: take 2
clip("v4a", 2, S["s4"] - 0.05, K["slide4"] + 0.45, S["s4"] - 0.05, "live")      # him, performing in his 9:16 card
clip("v4d", 2, K["edit4"] - 0.05, S["s5"] + 0.05, 1.0, "s4prev")               # the edit card's preview
# TikTok (Frost), YouTube, Reels (B&W), Shorts (35 mm), lyrics. v2: the YouTube tile reaches his video's own cut at 7.27 s
# just as it fills the frame (flash 1); the 35 mm tile no longer repeats the moment the card has just shown (take 2, 14-16 s)
TILES = [(3, 15.0), ("mv", 5.76), (1, 9.0), (2, 3.0), (2, 20.75)]
for i, (k, m0) in enumerate(TILES):
    a = S["s5"] + i * 0.09                                                     # each tile's clip starts as the tile appears
    clip("v5t%d" % i, k, a, S["s5f"] + 0.05, m0, "t%d" % i)
    if i == 4:
        LY["t4"] = [[a, S["s5f"] + 0.05, m0]]
clip("v5f0", "mv", FL[0] - 0.05, FL[1] + 0.05, 2.35, "f0")                     # flash 1: his music video, full frame
for i, k in enumerate((1, 2, 3)):                                              # flash 2: the 3 takes, the same instant of the song
    clip("v5f1%d" % i, k, FL[1] - 0.05, FL[2] + 0.05, 12.2, "f1" + "abc"[i])
M5 = 23.12 - (FL[3] - 0.42 - (FL[2] - 0.05))                                   # "millions." sung 0.42 s before the cut
clip("v5f2", 3, FL[2] - 0.05, FL[3] + 0.05, M5, "f2")                          # flash 3: "scars worth millions." on his voice
LY["f2"] = [[FL[2] - 0.05, FL[3] + 0.05, M5]]
clip("v6", "mv", S["s6"] - 0.05, K["toggle6"] - 0.1, 4.5, "lap6")              # the laptop, then the window between the words
A7 = S["s7"] + 1.1                                                             # the preview of S7 starts as the edit lands
M7 = 21.26 - (K["lyr7"] - A7)                                                  # so that "I" is sung at K.lyr7
clip("v7a", 3, A7 - 0.05, K["shuffle"] + 0.02, M7 - 0.05, "prev7")             # take 3, before Shuffle
clip("v7b", 2, K["shuffle"], S["s8"] + 0.04, M7 + (K["shuffle"] - A7), "prev7")  # after Shuffle: take 2, the same instant of the song
LY["p7"] = [[A7 - 0.05, K["shuffle"], M7 - 0.05], [K["shuffle"], S["s8"] + 0.04, M7 + (K["shuffle"] - A7)]]
C9 = S["s9"] + 0.95                                                            # the carousel's videos
for i, (k, m0) in enumerate([(2, 11.0), (1, 4.0), (3, 17.0)]):
    clip("v9c%d" % i, k, C9, S["s10"] + 0.05, m0, "car%d" % i)                 # TikTok, Reels, Shorts
clip("v9c3", "mv", C9, C9 + 1.15, 2.35, "car3")                                # YouTube: his music video, its two clean parts
clip("v9c4", "mv", C9 + 1.15, S["s10"] + 0.05, 4.5, "car3")

# the free filters of the app on the grid (src/app.js FILT_FRAG: Givre, Noir & blanc, Film 35 mm), as media treatments
TREAT = {"v5t0": {"adjust": {"temperature": -0.45, "saturation": -0.28, "contrast": 0.12, "whites": 0.15, "highlights": 0.08}},
         "v5t2": {"adjust": {"saturation": -1, "contrast": 0.3}, "details": {"grain": 0.3, "grainSize": 0.3, "vignette": 0.25}},
         "v5t3": {"adjust": {"contrast": 0.18, "temperature": 0.16}, "details": {"grain": 0.28, "grainSize": 0.28, "vignette": 0.22}}}

# ---------------------------------------------------------------- sound effects (assets/sfx: the HyperFrames library, Pixabay)
PEAKS = json.load(open(os.path.join(HERE, "assets", "sfx", "peaks.json")))     # where each file hits, from its start
SFX = []                           # (id, file, start, duration, media start, volume, extra attributes)
LOWPASS = '{"version":1,"nodes":[{"type":"lowpass","id":"n1","label":"Darker take","params":{"frequency":2400}}]}'


def fx(cid, f, hit, vol, dur=None, rate=1.0, lp=False, fade=0.0, pre=None):
    """a sound whose peak lands one frame after its picture (hyperframes sound.md); pre: play only that long before the peak"""
    name = f.rsplit(".", 1)[0]
    peak, flen = PEAKS[name]["peak"], PEAKS[name]["dur"]
    lead = peak / rate if pre is None else min(pre, peak / rate)
    st, m0 = hit + FRAME - lead, peak - lead * rate
    if st < 0:
        m0, st = m0 - st * rate, 0.0
    d = min(dur or (flen - m0) / rate, (flen - m0) / rate)
    extra = ""
    if rate != 1.0:
        extra += ' data-playback-rate="%.2f"' % rate
    if lp:
        extra += ' data-fx-chain="%s"' % LOWPASS.replace('"', "&quot;")
    if fade:
        extra += ' data-fade-out="%.2f"' % fade
    SFX.append((cid, f, st, d, m0, vol, extra))


# levels (measured: whoosh -15 LUFS, cinematic -14, pop -21, typing -31, key -36 LUFS; click peak -5 dBFS): each effect
# about 9 dB under the voice (-18 LUFS) and 3 dB over the ducked bed, the riser and the impact louder (sound.md)
G = {"whoosh": 2.5, "click": 2.0, "pop": 3.4, "typing": 5.8, "key": 5.6, "spark": 1.0, "hit": 1.1, "rise": 1.2, "cine": 1.6}
LIFT = {"whoosh": 1.85, "cine": 1.85, "click": 2.65, "typing": 2.65, "key": 2.1, "pop": 1.85, "spark": 1.6, "hit": 1.33, "rise": 1.7}
G = {k: v * LIFT[k] for k, v in G.items()}       # measured with mix.py: each hit 2-4 dB over the bed around it (clicks, typing: peaks)


def whoosh(cid, hit, vol, kind):
    """three takes of the cut sound, rotated: A plain, B slower and darker, C the cinematic one from just before its peak"""
    if kind == "A":
        fx(cid, "whoosh.mp3", hit, vol * G["whoosh"])
    elif kind == "B":
        fx(cid, "whoosh.mp3", hit, vol * G["whoosh"] * 1.2, rate=0.8, lp=True)
    else:
        fx(cid, "whoosh-cinematic.mp3", hit, vol * G["cine"], dur=1.2, fade=0.4, pre=0.6)


fx("x-spark", "sparkle.mp3", 0.1, 0.2 * G["spark"])
fx("x-open", "whoosh-cinematic.mp3", 1.45, 0.13 * G["cine"], dur=2.2, fade=0.5)              # the icon's window opens on the sky
fx("x-pill", "pop.mp3", S["s1"] + 0.92, 0.12 * G["pop"])                                  # the pill grows out of the + button
whoosh("x-push1", S["s1b"] - 0.05, 0.09, "B")                                  # the camera goes into the box
fx("x-type1", "typing.mp3", K["type1"][0] + 0.45, 0.14 * G["typing"], dur=0.85, fade=0.12)
whoosh("x-cut2", S["s2"], 0.1, "A")
fx("x-logo", "sparkle.mp3", S["s2"] + 1.0, 0.17 * G["spark"])
whoosh("x-cut3", S["s3a"], 0.11, "C")
whoosh("x-cut3b", S["s3b"], 0.09, "A")
whoosh("x-cut3c", S["s3c"], 0.09, "B")
whoosh("x-cut4", S["s4"] - 0.45, 0.1, "B")                                    # v2: the tablet's push into his card (15.0 → 16.0)
whoosh("x-split", K["split"] + 0.2, 0.07, "B")
fx("x-chs", "pop.mp3", K["chSong"] + 0.14, 0.12 * G["pop"])
for i, t in enumerate(K["chTk"]):
    fx("x-ch%d" % i, "pop.mp3", t + 0.14, (0.1 - 0.012 * i) * G["pop"])
fx("x-go", "click.mp3", K["go"], 0.18 * G["click"])
fx("x-sync", "pop.mp3", K["synced"] + 0.04, 0.14 * G["pop"])
whoosh("x-cut5", S["s5"], 0.1, "C")
for i, kind in enumerate("BACB"):
    whoosh("x-fl%d" % i, FL[i], 0.095, kind)
whoosh("x-cut6", S["s6"], 0.1, "A")
fx("x-tick1", "key-press.mp3", K["ready6"] + 0.05, 0.08 * G["key"])
fx("x-tick2", "key-press.mp3", K["ready6"] + 0.32, 0.065 * G["key"])
fx("x-toggle", "click.mp3", K["toggle6"], 0.17 * G["click"])
whoosh("x-pills", S["s7"] + 0.35, 0.07, "B")
whoosh("x-dive", S["s7"] + 1.15, 0.08, "C")
fx("x-punchy", "click.mp3", K["punchy"], 0.17 * G["click"])
fx("x-shuffle", "click.mp3", K["shuffle"], 0.17 * G["click"])
whoosh("x-dir", K["dir"][0] + 0.1, 0.06, "A")
whoosh("x-flake", S["s8"], 0.12, "C")
whoosh("x-rise8", S["s8"] + 2.5, 0.08, "B")
fx("x-pack", "click.mp3", K["pack"], 0.17 * G["click"])
fx("x-days1", "pop.mp3", K["pack"] + 0.35, 0.11 * G["pop"])
fx("x-days2", "pop.mp3", K["pack"] + 0.68, 0.085 * G["pop"])
whoosh("x-cut9", S["s9"], 0.1, "A")
fx("x-export", "click.mp3", K["export"], 0.17 * G["click"])
whoosh("x-car", S["s9"] + 1.15, 0.09, "C")
for i in (1, 2, 3):
    whoosh("x-pick%d" % i, K["pick"][i] - 0.12, 0.055, "BAB"[i - 1])
whoosh("x-cut10", S["s10"], 0.09, "B")
fx("x-type2", "typing.mp3", K["less"][0] + 0.45, 0.13 * G["typing"], dur=K["less"][1] - K["less"][0], fade=0.12)
fx("x-del1", "key-press.mp3", K["del"][0] + 0.02, 0.07 * G["key"])
fx("x-del2", "key-press.mp3", K["del"][0] + 0.16, 0.06 * G["key"])
fx("x-type3", "typing.mp3", K["more"][0] + 0.45, 0.13 * G["typing"], dur=min(1.5, K["more"][1] - K["more"][0]), fade=0.15)
whoosh("x-streak", S["s11"], 0.12, "C")
fx("x-rise", "riser.mp3", S["s12"], 0.11 * G["rise"], dur=1.5, fade=0.25, pre=1.3)       # the one riser, into the one impact
fx("x-hit", "impact-bass-1.mp3", S["s12"], 0.22 * G["hit"])
fx("x-mark", "sparkle.mp3", S["s12"] + 1.32, 0.17 * G["spark"])
fx("x-cta", "pop.mp3", S["s12"] + 2.42, 0.1 * G["pop"])

# ---------------------------------------------------------------- the music bed: the track from its groove, cut to its outro
def run(cmd):
    return subprocess.run(cmd, check=True, capture_output=True, text=True)


def build_bed():
    import numpy as np, soundfile as sf
    if not os.path.exists(TRACK150):
        run(["ffmpeg", "-v", "error", "-y", "-i", TRACK, "-af", "rubberband=tempo=%.10f:transients=crisp:detector=percussive:pitchq=quality:channels=together" % STRETCH,
             "-ar", "48000", "-ac", "2", "-c:a", "pcm_s16le", TRACK150])
    x, sr = sf.read(TRACK150, dtype="float64")
    n = int(round((TOTAL + 0.3) * sr))
    t = np.arange(n) / sr
    seams = [p[0] for p in BED_PLAN] + [TOTAL + 1.0]
    xf, lead = 0.03, 0.012             # equal-power crossfades of 30 ms, centred 12 ms before each bar line (whole downbeats)

    def src(i, tt):                    # the instrumental under film time tt, for part i
        return BED_PLAN[i][1] * 1.6 + INST_D0 + (tt - BED_PLAN[i][0])

    def read(s):
        j = np.clip(np.round(s * sr).astype(int), 0, len(x) - 1)
        return x[j]
    out = np.zeros((n, 2))
    for i in range(len(BED_PLAN)):
        a = seams[i] - lead - xf / 2 if i else 0.0
        b = min(TOTAL + 0.3, seams[i + 1] - lead + xf / 2)
        m = (t >= a) & (t < b)
        g = np.ones(m.sum())
        tt = t[m]
        if i:                          # fade in over the seam
            q = np.clip((tt - (seams[i] - lead - xf / 2)) / xf, 0, 1); g *= np.sin(q * np.pi / 2)
        if i < len(BED_PLAN) - 1:      # fade out over the next seam
            q = np.clip((tt - (seams[i + 1] - lead - xf / 2)) / xf, 0, 1); g *= np.cos(q * np.pi / 2)
        gain = 10 ** ((BED_PLAN[i][2] if len(BED_PLAN[i]) > 2 else 0.0) / 20)
        out[m] += read(src(i, tt)) * (g * gain)[:, None]
    out *= np.clip(t / 0.35, 0, 1)[:, None]                               # in from silence
    out *= np.clip((TOTAL - t) / 1.4, 0, 1)[:, None]                      # out with the track's own ending
    tmp = BED + ".tmp.wav"
    sf.write(tmp, out.astype(np.float32), sr, subtype="FLOAT")
    out = run(["ffmpeg", "-hide_banner", "-i", tmp, "-af", "loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"]).stderr
    m = json.loads(out[out.rindex("{"):out.rindex("}") + 1])
    ln = ("loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=%s:measured_TP=%s:measured_LRA=%s:measured_thresh=%s:offset=%s:linear=true"
          % (m["input_i"], m["input_tp"], m["input_lra"], m["input_thresh"], m["target_offset"]))
    run(["ffmpeg", "-v", "error", "-y", "-i", tmp, "-af", ln + ",aresample=48000", "-c:a", "pcm_s16le", BED])
    os.remove(tmp)
    return m["input_i"]


# the bed's level: up between the lines, down under the voice (hyperframes media-use mixing.md), then up for the end card
OPEN, DUCK, END = 0.95, 0.33, 0.8               # the music about 10 dB under the voice, 4 dB under it between the lines
                                                # (v3, measured on the new beat: under the voice −25.2 LUFS vs −15.0)


def ducking():
    spans = [list(speech(k)) for k in sorted(AT)]
    merged = []
    for a, b in spans:
        if merged and a - merged[-1][1] < 1.1:
            merged[-1][1] = b
        else:
            merged.append([a, b])
    pts = [(0.0, OPEN)]
    for a, b in merged:
        pts += [(a - 0.3, OPEN), (a - 0.05, DUCK), (b + 0.15, DUCK), (b + 0.55, OPEN if b < TOTAL - 3 else END)]
    pts.append((TOTAL, pts[-1][1]))
    out, last = [], -1
    for t, v in pts:
        t = max(0.0, round(t, 3))
        if t > last:
            out.append({"t": t, "v": v})
            last = t
    return {"version": 1, "lanes": [{"target": "volume", "points": out}]}


# ---------------------------------------------------------------- write times.js
UI = json.load(open(os.path.join(HERE, "assets", "ui", "ui.json")))   # capture_ui.py: the real screens and their buttons
from PIL import Image                                                  # a card near the page's bottom was cut by the window:
for name, u in UI.items():                                             # its picture is the truth (2x), the boxes stay
    if not name.startswith("screen_"):
        with Image.open(os.path.join(HERE, "assets", "ui", name + ".png")) as im:
            u["w"], u["h"] = im.size[0] / 2.0, im.size[1] / 2.0
T = {"TOTAL": TOTAL, "FPS": FPS, "S": S, "AT": AT, "BPM": BPM, "BEAT0": BEAT0, "FL": FL, "K": K, "UI": UI, "LYRIC": LYRIC, "LY": LY,
     "VO": {k: {"at": AT[k], "dur": v["dur"], "off": v["speech_offset"], "words": v["words"]} for k, v in VO.items() if k in AT}}
with open(OUT_TIMES, "w") as f:
    f.write("// generated by build.py\nwindow.T = %s;\n" % json.dumps(T, separators=(",", ":")))

# ---------------------------------------------------------------- the clips into film.html (keeping each clip's media treatment)
film = open(FILM).read()
grades = {}
for m in re.finditer(r'<video\b[^>]*>', film):
    tag = m.group(0)
    i, g = re.search(r'\bid="([^"]+)"', tag), re.search(r'data-color-grading="([^"]*)"', tag)
    if i and g:
        grades[i.group(1)] = g.group(1)
e = 0.5 / FPS                      # every clip starts half a frame early (no frame left without a picture)
boxes = {}
for cid, src, a, b, m0, box in CLIPS:
    g = (' data-color-grading="%s"' % grades[cid]) if cid in grades and cid in TREAT else ""
    boxes.setdefault(box, []).append('<video id="%s" class="clip v"%s data-hf-media-start-basis="local" src="%s" data-start="%.4f" data-duration="%.4f" '
                                     'data-media-start="%.4f" muted playsinline></video>' % (cid, g, src, a - e, b - a + e, max(0.0, m0 - e)))
for box, vids in boxes.items():
    pat = r"<!--C:%s-->.*?<!--/C:%s-->" % (box, box)
    assert re.search(pat, film, flags=re.S), box
    film = re.sub(pat, lambda m: "<!--C:%s-->" % box + "".join(vids) + "<!--/C:%s-->" % box, film, flags=re.S)
open(FILM, "w").write(film)
for cid, patch in TREAT.items():   # hyperframes media-treatment writes and validates the grading (media-use media-treatments.md)
    env = dict(os.environ)
    r = subprocess.run(HF + ["media-treatment", "--selector", "#" + cid, "--grading", json.dumps(patch), "--apply", "--json"],
                       cwd=HERE, capture_output=True, text=True, env=env)
    assert r.returncode == 0 and '"ok": true' in r.stdout, (cid, r.stdout[-600:], r.stderr[-600:])

# ---------------------------------------------------------------- the music and index.html
lufs = None
if "--no-bed" not in sys.argv or not os.path.exists(BED):
    lufs = build_bed()
aud = []
VOL_VO = 0.78
for k in sorted(VO):
    if k in AT:
        aud.append('<audio id="%s" class="clip" src="assets/audio/vo/%s.wav" data-start="%.3f" data-duration="%.3f" data-track-index="%d" data-volume="%.3f" data-audio-group="voiceover"></audio>'
                   % (k.lower(), k, AT[k], VO[k]["dur"], 30 + int(k[1:]) % 2, VOL_VO))
aud.append('<audio id="m-bed" class="clip" src="assets/audio/music/bed.wav" data-start="0" data-duration="%.3f" data-track-index="20" '
           'data-timeline-role="music" data-volume="1" data-audio-group="music" data-automation="%s"></audio>'
           % (TOTAL, json.dumps(ducking(), separators=(",", ":")).replace('"', "&quot;")))
for i, (cid, f, st, d, m0, v, extra) in enumerate(SFX):
    aud.append('<audio id="%s" class="clip" src="assets/sfx/%s" data-start="%.3f" data-duration="%.3f"%s data-track-index="%d" data-volume="%.3f" data-audio-group="sfx"%s></audio>'
               % (cid, f, st, d, (' data-media-start="%.3f"' % m0) if m0 > 0 else "", 40 + i % 6, v, extra))
index = """<!doctype html>
<html lang="en" data-resolution="landscape">
  <head>
    <meta charset="UTF-8" /><meta name="viewport" content="width=1920, height=1080" />
    <title>Stalak — launch film (YouTube, 16:9)</title>
    <script src="assets/vendor/gsap.min.js"></script>
    <script src="assets/times.js"></script>
    <script src="assets/engine.js"></script>
    <style>
      @font-face { font-family: "Rubik"; src: url("assets/fonts/rubik.ttf"); font-weight: 300 900; }
      @font-face { font-family: "Lilita One"; src: url("assets/fonts/lilitaone.ttf"); }
      html, body { margin: 0; width: 1920px; height: 1080px; overflow: hidden; background: #050c1f; }
      #main { position: relative; width: 1920px; height: 1080px; overflow: hidden; background: #050c1f; }
    </style>
  </head>
  <body>
    <div id="main" data-composition-id="main" data-start="0" data-duration="%(T)s" data-width="1920" data-height="1080">
      <!-- generated by build.py: edit build.py, then run python3 build.py -->
      <div id="h-film" data-composition-id="film" data-composition-src="compositions/film.html" data-start="0" data-duration="%(T)s" data-track-index="0" data-track-kind="graphics" data-width="1920" data-height="1080" style="z-index:1"></div>
      %(AUD)s
    </div>
    <script>
      window.__timelines = window.__timelines || {};
      window.__timelines["main"] = gsap.timeline({ paused: true });
    </script>
  </body>
</html>
""" % {"T": "%.3f" % TOTAL, "AUD": "\n      ".join(aud)}
open(INDEX, "w").write(index)
print("times.js, index.html: %.2f s, %d clips, %d voice lines, %d effects, music bed %s" % (
    TOTAL, len(CLIPS), len([k for k in VO if k in AT]), len(SFX), ("rebuilt (track %s LUFS → -16)" % lufs) if lufs else "kept"))
print("K:", json.dumps({k: v for k, v in K.items()}))
