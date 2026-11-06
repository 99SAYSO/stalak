#!/usr/bin/env python3
"""Trial of 06/11 (Earshot, Take One, Explainroo): the AFTER version of the Short. Copy of ../youtube/build_short.py (the BEFORE,
left untouched); what changes is marked « TRIAL ». Run: python3 build_after.py   (VOICE=flora for the Flora read)
- Take One: the app cards redrawn in code give way to the real app on a phone (phone.js, screens from capture_app.py, the real
  export in the preview); the opening frame no longer cuts the labels.
- Explainroo: the voice is Kokoro (am_fenrir), made on this machine (make_vo_kokoro.py), same 10 lines as the Flora read.
- Earshot: the cues it found without a sound get one, a stop-down before the drop, the new taps / pops from its sound bank.

The BEFORE: Builds the YouTube Short (9:16) of « The edit nobody sees »: short/index.html, short/assets/times.js and the video clips in
short/compositions/film.html. Same world, same engine (assets/engine.js, portrait mode), same voice read, re-cut:
"Now comes the part nobody sees: the edit." -> the beat -> lips out of sync -> a new pile every day -> "This is Stalak." on the drop
-> the song -> the takes -> lined up and cut on the beat -> 2 bars of his song ("I gotta bounce") -> "You film. Stalak edits." -> the end.
Captions on screen, as in the film (caps.py; many watch Shorts without sound). Run: python3 build_short.py (after build.py and vo_cut.py)
"""
import json, os, re, pathlib, shutil, sys
import numpy as np
HERE = pathlib.Path(__file__).resolve().parent.parent / "youtube"      # TRIAL: the BEFORE's sources (film, engine, captions)
sys.path.insert(0, str(HERE))
from caps import make_caps, payoff_lyric

OUT = pathlib.Path(__file__).resolve().parent / "short"
VOICE = os.environ.get("VOICE", "kokoro")                               # TRIAL: kokoro (Explainroo) or flora (the BEFORE's read)
VODIR = {"kokoro": "vo_kokoro", "flora": "vo"}[VOICE]
P = 60 / 157
BAR = 4 * P
D0 = 20.2946 + 3 * P
OFF = 23.13007
TAKE = 1.452
def B(b): return b * P
def inst_bar(k): return D0 + k * BAR
def song_bar(j): return inst_bar(j + 2) - OFF

DROP_B = 34                      # the drop (inst bar 2) on film beat 34: film 0 is on beat 3 of a bar (downbeats: beats 2, 6, 10…)
DB = DROP_B % 4
INST0 = inst_bar(2) - B(DROP_B)  # inst time at film 0
PAY_B = 56                       # his song from beat 3 of song bar 5 (phase-matched: song bar j = inst bar j + 2), 2 bars
END_B = PAY_B + 8
SONG0 = song_bar(5) + 2 * P
assert abs((INST0 + B(PAY_B)) - (song_bar(5) + 2 * P + OFF)) < 1e-6

VO = {c["id"]: c for c in json.loads((OUT / "assets/audio" / VODIR / "yt_clips.json").read_text())}
LIDS = ["L02", "L04", "L05", "L06", "L07", "L08", "S09", "L10", "L16", "L17"]
def word(lid, w, n=1):
    hits = [t for x, t in VO[lid]["words"] if x.strip(".,?!:'").lower() == w.lower()]
    return hits[n - 1]
def dur(lid): return VO[lid]["speech_dur"]
MASTER = 0.68
at = {"L07": B(DROP_B) - word("L07", "stalak") - 0.02}
A0 = 0.14
G = [0.40, 1.05, 0.45]           # after L02, L04 (time to read OFF BEAT, owner 2/11), L05
if VOICE == "kokoro":            # TRIAL: Kokoro says "This is" faster, so "Stalak" on the drop leaves a longer gap before it:
    A0, G = 0.34, [0.48, 1.10, 0.52]   # the first lines start a little later and breathe a little more (gap before L07 ~0.7 s)
t = A0
for l, g in zip(LIDS[:4], G + [0.0]): at[l] = t; t += dur(l) + g
g1 = at["L07"] - (at["L06"] + dur("L06"))
assert 0.26 <= g1 <= 0.8, g1
prev = at["L07"] + dur("L07")
for l, g in (("L08", 0.3), ("S09", 0.3), ("L10", 0.3)): at[l] = prev + g; prev = at[l] + dur(l)
assert B(PAY_B) - prev > 0.4, (prev, B(PAY_B))
at["L16"] = B(END_B) - 0.02
b = END_B
while B(b) < at["L16"] + dur("L16") + 0.24: b += 1
at["L17"] = B(b) - 0.02
TOTAL = round(B(b + 13), 3)
while TOTAL - (at["L17"] + dur("L17")) <= 1.0 or TOTAL - (at["L17"] + word("L17", "stalak")) < 2.3: TOTAL = round(TOTAL + P, 3)   # TRIAL: Kokoro's last line is longer: more beats, the URL stays 2 s+
assert TOTAL - (at["L17"] + dur("L17")) > 1.0
def W(lid, w, n=1): return at[lid] + word(lid, w, n)
NEVER = 1000.0                   # scenes of the long film that the Short does not have
S = {
    "s2": at["L02"] - 0.08, "cutIn": W("L02", "part"), "slice": W("L02", "edit"),
    "s4": at["L04"] - 0.1, "blade": W("L04", "beat"),
    "s5": at["L05"] - 0.42, "off": W("L05", "off"), "lips": W("L05", "and"), "words": W("L05", "words"),
    "s6": at["L06"] - 0.1, "tue": W("L06", "tomorrow"), "wed": W("L06", "another"), "thu": W("L06", "day"), "fri": W("L06", "that"),
    "s7": at["L07"], "drop": B(DROP_B),
    "s8": at["L08"] - 0.32, "songDrop": W("L08", "drop"), "land": W("L08", "song"),
    "s9": at["S09"] - 0.12, "takesIn": W("S09", "takes"), "imp": NEVER, "rec": NEVER,
    "align": W("L10", "lines"), "synced": W("L10", "music"), "toEdit": W("L10", "and"), "cuts": W("L10", "cuts"), "beat10": W("L10", "beat"),
    "pay": B(PAY_B), "payEnd": B(END_B),
    "s17": at["L16"], "film17": W("L16", "you"), "stalak17": W("L16", "stalak"),
    "s18": at["L17"] - 0.04, "url": W("L17", "stalak"), "free": W("L17", "free"), "nodl": W("L17", "no", 1), "nosu": W("L17", "no", 2),
}
S["s3"] = S["s4"] - 0.001
for k in ("try1", "try2", "try3"): S[k] = S["s3"]
S["sweep0"] = S["cuts"] - 0.05; S["sweep1"] = S["sweep0"] + 1.25
S["cu0"] = S["s5"] + 0.62
for k in ("s11", "lock", "s12", "paste", "tap", "show", "onTime", "s13", "chill", "punchy", "pace", "s14", "tik", "pro", "yt",
          "s15", "cplus", "thirty", "edits", "newv", "day", "one15", "turns"): S[k] = NEVER
assert S["cu0"] < S["off"] - 0.1 and S["sweep1"] < S["pay"] - 0.3

# the voice
vo_rows, vo_spans = [], []
for i, lid in enumerate(LIDS):
    c = VO[lid]
    vo_rows.append('<audio id="%s" class="clip" src="assets/audio/%s/%s.wav" data-start="%.3f" data-duration="%.3f" data-track-index="%d" data-volume="%.3f"></audio>'
                   % (lid.lower(), VODIR, lid, at[lid] - c["speech_offset"], c["dur"], 30 + i % 2, min(1.0, MASTER * 10 ** (c.get("gain_db", 0) / 20))))
    vo_spans.append([round(at[lid], 3), round(at[lid] + dur(lid), 3)])
for a, b2 in zip(vo_spans, vo_spans[1:]): assert b2[0] - a[1] > 0.15, (a, b2)

# captions: the problem and Stalak lines, a few words at a time (the claim and the end card show their own words)
CAPS2 = make_caps(LIDS, at, VO, dur, LIDS[:8], [B(PAY_B) - 0.42])

# the music: the beat (the drop on "Stalak"), 2 bars of his song, the beat to the end
LO1, LO2, HI = 0.40, 0.22, 0.46
if VOICE == "kokoro": LO1, LO2 = 0.34, 0.19   # TRIAL (Earshot: "duck the music 3-6 dB under the voice"): 1.4 dB lower under the voice
end10 = at["L10"] + dur("L10")
# the payoff: the takes' own sound (they are lip-synced to it, see build.py), same place of the beat as SONG0, 8 bars later:
# take time 20.55-23.61, his line « j'ai mis de l'or sur mes plaies, cicatrices valent des millions »
TAUS0 = round(SONG0 - TAKE + 8 * BAR, 4)
MUS = [("m-walk", "inst.mp3", 0.0, B(PAY_B), INST0), ("m-pay", "takes_song.wav", B(PAY_B), B(END_B), TAUS0),
       ("m-end", "inst.mp3", B(END_B), TOTAL, INST0 + B(END_B))]
def autos(mid, a, b):
    if mid == "m-walk": return [(0.0, LO1), (S["drop"] - 0.62, LO1), (S["drop"] - 0.5, LO1 * 0.355), (S["drop"] - 0.03, LO1 * 0.355), (S["drop"] + 0.02, LO2), (end10 + 0.05, LO2), (end10 + 0.45, HI), (b - a, HI)]
    if mid == "m-pay": return [(0.0, 0.52), (b - a, 0.52)]   # the takes' sound is 0.7 LU quieter than song.mp3 here
    e17 = at["L17"] + dur("L17") - a
    return [(0.0, LO2), (e17 + 0.05, LO2), (e17 + 0.45, 0.4), (b - a - 1.0, 0.4), (b - a, 0.0)]
mus_rows = []
for mid, fn, a, b2, ms in MUS:
    pts = autos(mid, a, b2)
    xa = 0.012 if a > 0 else 0.0
    d_ = (b2 - a) + xa + (0.012 if b2 < TOTAL else 0)
    pts = [(x + xa, v * MASTER) for x, v in pts]
    def at_(x): return float(np.interp(x, [p[0] for p in pts], [p[1] for p in pts]))
    if a > 0: pts = [(0.0, 0.0), (0.024, at_(0.024))] + [p for p in pts if p[0] > 0.024]
    if b2 < TOTAL: pts = [p for p in pts if p[0] < d_ - 0.024] + [(d_ - 0.024, at_(d_ - 0.024)), (d_, 0.0)]
    pts = [(round(x, 3), round(v, 3)) for x, v in pts]
    auto = json.dumps({"version": 1, "lanes": [{"target": "volume", "points": [{"t": t_, "v": v} for t_, v in pts]}]}, separators=(",", ":"))
    mus_rows.append('<audio id="%s" class="clip" src="assets/audio/%s" data-start="%.3f" data-duration="%.3f" data-media-start="%.3f" data-track-index="%d" data-timeline-role="music" data-volume="1" data-automation=\'%s\'></audio>'
                    % (mid, fn, a - xa, d_, ms - xa, 7 + len(mus_rows) % 2, auto))

# sounds on the visible actions
PK = json.loads((HERE / "assets/sfx/peaks.json").read_text())
ES = {"tap": (0.004, 0.094), "tap_up": (0.004, 0.07), "ui_pop": (0.042, 0.18), "hit_punch": (0.058, 0.282), "tick_cut": (0.007, 0.132), "swipe_rise": (0.299, 0.6),
      "cut_air": (0.043, 0.549), "cut_kick": (0.013, 0.325), "shutter": (0.042, 0.242)}
PK.update({k: {"peak": v[0], "dur": v[1]} for k, v in ES.items()})
PK.update({"slice": {"peak": 0.002, "dur": 0.42}, "thud": {"peak": 0.004, "dur": 0.45}, "scatter": {"peak": 0.02, "dur": 0.7},
           "tick": {"peak": 0.001, "dur": 0.09}, "tock": {"peak": 0.001, "dur": 0.09}})
EXT = {"slice": "wav", "thud": "wav", "scatter": "wav", "tick": "wav", "tock": "wav"}
EXT.update({k: "wav" for k in ES})
LAYN = [(0, 1), (4, 2), (8, 3), (10, 1), (12, 2), (16, 3), (20, 1), (22, 3), (24, 2), (28, 1)]
beats4 = [B(x) for x in range(int(S["s4"] / P) + 1, int(S["blade"] / P) + 1)]
SFX = [("x-cutin", "whoosh", S["cutIn"] + 0.05, 0.14), ("x-slice", "slice", S["slice"], 0.34), ("x-scat", "scatter", S["slice"] + 0.08, 0.3),
       ("x-pull", "whoosh-short", S["slice"] + 0.2, 0.1), ("x-s4", "whoosh-short", S["s4"] + 0.04, 0.08)] + \
      [("x-b%d" % i, "tick", bt, 0.22) for i, bt in enumerate(beats4[-4:])] + [
       ("x-blade", "slice", S["blade"] + 0.02, 0.3), ("x-err", "error", S["blade"] + 0.2, 0.12),
       ("x-dive", "whoosh-cinematic", S["s5"] + 0.62, 0.16), ("x-off", "glitch-1", S["off"] + 0.05, 0.12), ("x-lips", "glitch-2", S["lips"] + 0.02, 0.1),
       ("x-s6", "whoosh-short", S["s6"] - 0.06, 0.1), ("x-s6b", "cut_air", S["s6"], 0.34),
       ("x-tue", "thud", S["tue"] + 0.28, 0.4), ("x-wed", "thud", S["wed"] + 0.28, 0.4), ("x-thu", "thud", S["thu"] + 0.28, 0.4), ("x-fri", "thud", S["fri"] + 0.28, 0.4),
       ("x-sc6a", "scatter", S["tue"] + 0.32, 0.16), ("x-sc6b", "scatter", S["wed"] + 0.32, 0.16), ("x-sc6c", "scatter", S["thu"] + 0.32, 0.16),
       ("x-suck", "whoosh-cinematic", S["drop"] - 0.04, 0.16, 1.9, 0.9), ("x-drop", "impact-bass-1", S["drop"], 0.3), ("x-dropk", "cut_kick", S["drop"], 0.4), ("x-drop2", "sparkle", S["drop"] + 0.06, 0.16),
       ("x-rise", "swipe_rise", S["s8"] - 0.15, 0.16), ("x-fall", "whoosh-short", S["songDrop"] + 0.1, 0.12),
       ("x-tap1", "tap", S["land"], 0.2), ("x-tap1u", "tap_up", S["land"] + 0.085, 0.12), ("x-bpm", "ping", S["land"] + 0.3, 0.08),
       ("x-s9", "ui_pop", S["s9"] + 0.05, 0.14),
       ("x-tk1", "pop", S["takesIn"] + 0.08, 0.16), ("x-tk2", "pop", S["takesIn"] + 0.2, 0.16), ("x-tk3", "pop", S["takesIn"] + 0.32, 0.16),
       ("x-tap2", "tap", S["takesIn"] + 0.42, 0.2), ("x-tap2u", "tap_up", S["takesIn"] + 0.505, 0.12),
       ("x-al", "whoosh-short", S["align"] + 0.05, 0.1), ("x-lk1", "click-soft", S["synced"] - 0.45, 0.2), ("x-lk2", "click-soft", S["synced"] - 0.33, 0.2),
       ("x-lk3", "click-soft", S["synced"] - 0.21, 0.2), ("x-ok", "chime", S["synced"] - 0.1, 0.06), ("x-tap3", "tap", S["toEdit"] + 0.02, 0.2), ("x-tap3u", "tap_up", S["toEdit"] + 0.105, 0.12),
       ("x-cut", "tick_cut", S["toEdit"] + 1.528, 0.22)] + [
       ("x-pay", "impact-bass-2", S["pay"], 0.26), ("x-payout", "whoosh-short", S["payEnd"] - 0.14, 0.12),
       ("x-cl1", "hit_punch", S["film17"], 0.36), ("x-cl1s", "shutter", S["film17"], 0.3),   # TRIAL (Earshot): a punch and a camera shutter on « You film. »
       ("x-cl2", "impact-bass-1", S["stalak17"] + 0.02, 0.2), ("x-cl3", "sparkle", S["stalak17"] + 0.08, 0.12),
       ("x-end", "whoosh-short", S["s18"] + 0.04, 0.12), ("x-endi", "sparkle", S["s18"] + 0.2, 0.1), ("x-type", "typing", S["url"] - 0.05, 0.12, 0.43, 0.5)]
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
    rows.append('<audio id="%s" class="clip" src="assets/%s/%s.%s" data-start="%.3f" data-duration="%.3f"%s data-track-index="%d" data-volume="%.3f"></audio>'
                % (sid, "sfx_es" if fn in ES else "sfx", fn, EXT.get(fn, "mp3"), st, ln, (' data-media-start="%.3f"' % ms) if ms > 0 else "", 12 + lane, vol * MASTER))
rs_ = S["drop"] + 1 / 30 - 3.982 + 2.4
rows.append('<audio id="x-riser" class="clip" src="assets/sfx/riser.mp3" data-start="%.3f" data-duration="%.3f" data-media-start="2.400" data-track-index="29" data-volume="%.3f"></audio>' % (rs_, S["drop"] - rs_ + 0.1, 0.16 * MASTER))
rp = S["pay"] + 1 / 30 - 3.982 + 2.9
rows.append('<audio id="x-riser2" class="clip" src="assets/sfx/riser.mp3" data-start="%.3f" data-duration="%.3f" data-media-start="2.900" data-track-index="28" data-volume="%.3f"></audio>' % (rp, S["pay"] - rp + 0.1, 0.14 * MASTER))

# the page: the film's page, made portrait
def portrait_html():
    s = (HERE / "compositions/film.html").read_text()
    for k in ["EDIT", "EXP", "TV", "CU", "PAY0", "PAY1", "PAY2"]:
        s = re.sub(r"<!--%s-->.*?<!--/%s-->" % (k, k), "<!--%s-->\n<!--/%s-->" % (k, k), s, flags=re.S)
    def R(a, b):
        nonlocal s
        assert a in s, a[:90]; s = s.replace(a, b)
    R('<head><meta charset="UTF-8" /><title>film — the edit nobody sees</title></head>', '<head><meta charset="UTF-8" /><title>film — the edit nobody sees (Short, 9:16)</title></head>')
    R('<div id="root" data-composition-id="film" data-width="1920" data-height="1080">', '<div id="root" data-composition-id="film" data-width="1080" data-height="1920">')
    R('<canvas id="snow" data-layout-allow-overflow width="1920" height="1080"></canvas>', '<canvas id="snow" data-layout-allow-overflow width="1080" height="1920"></canvas>')
    R('#snow { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; }', '#snow { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; }')
    R('          #grain { position: absolute; inset: 0;', """          .cl { font-size: 116px; -webkit-text-stroke: 6px #0a0d14; }
          #pp0 { left: 115px; top: 250px; width: 850px; height: 1511px; border-radius: 48px; transform-origin: 50% 50%; }
          .capk { gap: 12px 16px; }
          .capk .tw { font-size: 60px; } .capk .tk { font-size: 74px; } .capk .ow { font-size: 68px; } .capk .ck { font-size: 72px; }
          #grain { position: absolute; inset: 0;""")
    a0 = s.index('        <div id="pay">'); a1 = s.index('        <!-- you film, Stalak edits -->')
    s = s[:a0] + """        <div id="pay">
          <div class="pp" id="pp0">
            <!--PAY0-->
            <!--/PAY0-->
            <div class="lyr pl" style="top:1030px;font-size:76px"></div>
          </div>
        </div>

""" + s[a1:]
    R('          <div class="chip" id="cu-word" style="left:0;top:0">bounce</div>', """          <div class="chip" id="cu-word" style="left:0;top:0;font-size:84px">bounce</div>
          <div class="lab red" id="cu-tag2" style="left:0;top:0;font-size:58px;visibility:hidden">1 frame off</div>""")
    a0 = s.index('        <div id="end">'); a1 = s.index('        <div id="grain"></div>')
    s = s[:a0] + """        <div id="end">
          <img id="end-icon" class="abs" src="assets/brand/icon.svg" alt="" style="left:390px;top:380px;width:300px;height:300px" />
          <img id="end-wm" class="abs" src="assets/brand/wordmark.svg" alt="Stalak" style="left:170px;top:700px;width:740px;height:326px" />
          <div class="abs lil" id="end-url" style="left:0;width:1080px;top:1110px;text-align:center;font-size:104px;color:#ffffff;text-shadow:0 7px 0 #0a0d14;white-space:pre"></div>
          <div class="abs" id="end-sub" style="left:0;width:1080px;top:1260px;text-align:center;font-weight:700;font-size:50px;color:#ffffff;white-space:pre"></div>
        </div>
        <div id="caps"></div>
""" + s[a1:]
    # the three app cards, laid out tall
    for a, b2 in [
        ('id="c-song" style="left:-540px;top:-350px;width:1080px;height:700px"', 'id="c-song" style="left:-500px;top:-450px;width:1000px;height:900px"'),
        ('<div class="drop" id="s-drop" style="left:56px;top:250px;width:956px;height:250px">', '<div class="drop" id="s-drop" style="left:40px;top:250px;width:908px;height:330px">'),
        ('<svg class="abs" style="left:56px;top:62px" width="110" height="120" viewBox="0 0 110 120">', '<svg class="abs" style="left:46px;top:104px" width="110" height="120" viewBox="0 0 110 120">'),
        ('<div class="abs" style="left:200px;top:62px;font-weight:800;font-size:50px;white-space:nowrap">Import your music</div>', '<div class="abs" style="left:186px;top:100px;font-weight:800;font-size:50px;white-space:nowrap">Import your music</div>'),
        ('style="left:200px;top:130px;font-weight:500;font-size:34px;color:#4c5b73;white-space:nowrap">MP3', 'style="left:186px;top:168px;font-weight:500;font-size:32px;color:#4c5b73;white-space:nowrap">MP3'),
        ('<div class="abs hide" id="s-wave" style="left:56px;top:250px;width:956px;height:250px;', '<div class="abs hide" id="s-wave" style="left:40px;top:250px;width:908px;height:330px;'),
        ('<svg id="s-wsvg" class="abs" style="left:0;top:78px" width="946" height="150" viewBox="0 0 946 150"></svg>', '<svg id="s-wsvg" class="abs" style="left:0;top:110px" width="898" height="200" viewBox="0 0 946 150" preserveAspectRatio="none"></svg>'),
        ('<div class="abs hide" id="s-bpm" style="left:56px;top:540px;', '<div class="abs hide" id="s-bpm" style="left:40px;top:640px;'),
        ('<div class="btn ink hide" id="s-next" style="left:740px;top:556px;width:272px;height:96px">', '<div class="btn ink hide" id="s-next" style="left:676px;top:760px;width:272px;height:96px">'),
        ('id="c-takes" style="left:880px;top:-400px;width:1240px;height:820px"', 'id="c-takes" style="left:1000px;top:-640px;width:1000px;height:1280px"'),
        ('<div class="big" id="t-imp" style="left:56px;top:150px;width:650px;height:136px">', '<div class="big" id="t-imp" style="left:40px;top:140px;width:908px;height:136px">'),
        ('<div class="big" id="t-rec" style="left:56px;top:312px;width:650px;height:136px">', '<div class="big" id="t-rec" style="left:40px;top:296px;width:908px;height:136px">'),
        ('<div class="abs" id="t-panel" style="left:56px;top:480px;width:1128px;height:236px;', '<div class="abs" id="t-panel" style="left:40px;top:966px;width:908px;height:196px;'),
        ('<svg id="t-rows" class="abs" style="left:0;top:0" width="1120" height="228" viewBox="0 0 1120 228"></svg>', '<svg id="t-rows" class="abs" style="left:0;top:0" width="900" height="188" viewBox="0 0 1120 228" preserveAspectRatio="none"></svg>'),
        ('<div class="abs hide" id="t-ok" style="left:60px;top:732px;', '<div class="abs hide" id="t-ok" style="left:44px;top:1180px;'),
        ('id="c-edit" data-layout-allow-overlap style="left:2250px;top:-440px;width:1500px;height:880px"', 'id="c-edit" data-layout-allow-overlap style="left:2500px;top:-800px;width:1000px;height:1600px"'),
        ('<div class="pv" id="pv" style="left:40px;top:40px;width:420px;height:747px;border-radius:30px">', '<div class="pv" id="pv" style="left:244px;top:520px;width:500px;height:889px;border-radius:34px">'),
        ('<div class="lyr" id="pv-lyr" style="top:520px;font-size:46px;visibility:hidden"></div>', '<div class="lyr" id="pv-lyr" style="top:620px;font-size:54px;visibility:hidden"></div>'),
        ('<div class="ttl" style="left:510px;top:40px">Your edit</div>', '<div class="ttl" style="left:40px;top:40px">Your edit</div>'),
        ('<div class="lbl" style="left:510px;top:160px">Cuts</div>', '<div class="lbl" style="left:40px;top:150px">Cuts</div>'),
        ('<div class="seg" style="left:660px;top:142px"><b class="on">Auto</b>', '<div class="seg" style="left:190px;top:132px"><b class="on">Auto</b>'),
        ('<div class="lbl" style="left:510px;top:262px">Pace</div>', '<div class="lbl" style="left:40px;top:252px">Pace</div>'),
        ('<div class="seg" id="pace" style="left:660px;top:244px">', '<div class="seg" id="pace" style="left:190px;top:234px">'),
        ('<div id="ruler" style="left:510px;top:372px;width:950px"></div>', '<div id="ruler" style="left:19px;top:356px;width:950px"></div>'),
        ('<div id="bar" data-layout-ignore style="left:510px;top:404px;width:950px"></div>', '<div id="bar" data-layout-ignore style="left:19px;top:388px;width:950px"></div>'),
        ('<div id="ph" style="left:510px;top:388px"></div>', '<div id="ph" style="left:19px;top:372px"></div>'),
        ('<div class="btn" style="left:510px;top:580px;width:290px;height:100px">▶ Play</div>', '<div class="btn" style="left:40px;top:1450px;width:272px;height:100px">▶ Play</div>'),
        ('<div class="btn ink" style="left:826px;top:580px;width:310px;height:100px">↻ Shuffle</div>', '<div class="btn ink" style="left:336px;top:1450px;width:300px;height:100px">↻ Shuffle</div>'),
        ('<div class="btn blue" id="e-exp" style="left:1162px;top:580px;width:298px;height:100px">Export</div>', '<div class="btn blue" id="e-exp" style="left:660px;top:1450px;width:288px;height:100px">Export</div>')]:
        R(a, b2)
    # TRIAL (Take One): the real app on a phone
    s = s.replace('        <div id="w1" data-layout-allow-overflow>', PHONE_HTML + '        <div id="w1" data-layout-allow-overflow>', 1)
    R('            window.YT.init(root);', '            window.YT.init(root); window.PH.init(root);')
    R('onUpdate: function () { window.YT.render(clock.t); } }, 0);', 'onUpdate: function () { window.YT.render(clock.t); window.PH.render(clock.t); } }, 0);')
    R('if (e && e.detail && typeof e.detail.time === "number") window.YT.render(e.detail.time); });', 'if (e && e.detail && typeof e.detail.time === "number") { window.YT.render(e.detail.time); window.PH.render(e.detail.time); } });')
    R('            window.YT.render(0);', '            window.YT.render(0); window.PH.render(0);')
    return s
SW = 560                 # the phone screen (px on the frame) = 412 app CSS px
SH = round(839 * SW / 412)
K = SW / 412
ROWS = "".join('<div class="ph-row" style="left:%.1fpx;top:%.1fpx;width:%.1fpx;height:%.1fpx"></div>' % (43 * K, (c - 38) * K, 326 * K, 76 * K) for c in (683, 778, 873))
VPH_T0 = S["toEdit"] + 0.02
PHONE_HTML = """        <!-- TRIAL (Take One, 06/11): the real Stalak app on a phone, his song and takes; the edit plays the real export -->
        <style>
          #phone { position: absolute; inset: 0; visibility: hidden; }
          #ph-cam { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; transform-origin: 0 0; }
          .ph-body { position: absolute; left: %(bx)dpx; top: 430px; width: %(bw)dpx; height: %(bh)dpx; border-radius: 92px; background: #0a0d14; box-shadow: 0 18px 0 rgba(10, 13, 20, 0.38); }
          .ph-scr { position: absolute; left: 22px; top: 22px; width: %(sw)dpx; height: %(sh)dpx; border-radius: 70px; overflow: hidden; background: #1f6fd6; }
          .ph-shot { position: absolute; left: 0; top: 0; width: %(sw)dpx; visibility: hidden; }
          .ph-shot img { display: block; width: %(sw)dpx; }
          .ph-row { position: absolute; border-radius: 20px; box-shadow: 0 0 0 6px #2fbf71 inset; background: rgba(47, 191, 113, 0.12); visibility: hidden; }
          #ph-pv { position: absolute; overflow: hidden; border-radius: 20px; background: #0a0d14; }
          #ph-pv video { position: absolute; inset: 0; width: 100%%; height: 100%%; object-fit: cover; }
          #ph-head { position: absolute; left: 0; top: 0; width: 6px; height: 128px; border-radius: 3px; background: #0a0d14; visibility: hidden; }
          #ph-head::before { content: ""; position: absolute; left: -9px; top: -6px; width: 24px; height: 24px; border-radius: 12px; background: #ff6fae; border: 3px solid #0a0d14; box-sizing: border-box; }
          #ph-chip { position: absolute; left: 0; top: 0; width: 400px; height: 104px; border: 6px solid #0a0d14; border-radius: 26px; background: #ffffff; box-shadow: 0 10px 0 #0a0d14; box-sizing: border-box; visibility: hidden;
            display: flex; align-items: center; gap: 18px; padding: 0 26px; font-family: Rubik, sans-serif; font-weight: 800; font-size: 38px; color: #0a0d14; white-space: nowrap; }
          .ph-mini { position: absolute; left: 0; top: 0; width: 132px; height: 235px; border: 6px solid #0a0d14; border-radius: 22px; overflow: hidden; background: #0a0d14; box-shadow: 0 8px 0 #0a0d14; visibility: hidden; }
          .ph-mini img { width: 100%%; height: 100%%; object-fit: cover; display: block; }
          #ph-ring { position: absolute; left: 0; top: 0; width: 120px; height: 120px; border-radius: 60px; border: 8px solid #ffffff; box-shadow: 0 0 0 5px #0a0d14, inset 0 0 0 5px #0a0d14; box-sizing: border-box; visibility: hidden; }
        </style>
        <div id="phone" data-layout-allow-overflow data-layout-allow-overlap>
          <div id="ph-cam" data-layout-allow-overflow data-layout-allow-overlap>
            <div class="ph-body">
              <div class="ph-scr" data-layout-allow-overflow>
                <div class="ph-shot" id="ph-home"><img src="assets/app/01_home.jpg" alt="" /></div>
                <div class="ph-shot" id="ph-song"><img src="assets/app/02_song.jpg" alt="" /></div>
                <div class="ph-shot" id="ph-takes0"><img src="assets/app/03_takes0.jpg" alt="" /></div>
                <div class="ph-shot" id="ph-takes" data-layout-allow-overflow><img src="assets/app/04_takes.jpg" alt="" />%(rows)s</div>
                <div class="ph-shot" id="ph-edit"><img src="assets/app/06_edit.jpg" alt="" />
                  <div id="ph-pv"><video id="vph" class="clip" data-hf-media-start-basis="local" src="assets/app/edit.mp4" data-start="%(v0).3f" data-duration="%(vd).3f" data-media-start="0" muted playsinline></video></div>
                  <div id="ph-head"></div>
                </div>
              </div>
            </div>
            <div id="ph-chip"><svg width="56" height="56" viewBox="0 0 56 56"><circle cx="28" cy="28" r="26" fill="#1f6fd6" stroke="#0a0d14" stroke-width="5"/><path d="M23 15 v22 a6 6 0 1 1 -4 -5.6 V15 l15 -3 v19 a6 6 0 1 1 -4 -5.6 V16.4 z" fill="#ffffff"/></svg>neva die.wav</div>
            <div class="ph-mini"><img src="assets/stills/t1_05.jpg" alt="" /></div>
            <div class="ph-mini"><img src="assets/stills/t2_05.jpg" alt="" /></div>
            <div class="ph-mini"><img src="assets/stills/t3_05.jpg" alt="" /></div>
            <div id="ph-ring"></div>
          </div>
        </div>
""" % {"bx": (1080 - SW - 44) // 2, "bw": SW + 44, "sw": SW, "bh": SH + 44, "sh": SH, "rows": ROWS, "v0": VPH_T0, "vd": S["pay"] + 0.1 - VPH_T0}
(OUT / "compositions").mkdir(parents=True, exist_ok=True)
(OUT / "compositions" / "film.html").write_text(portrait_html())

# the videos
FPS = 30
TLEN = {1: 15.0, 2: 25.56, 3: 25.56}                    # the takes' lengths (s)
def clips(prefix, t0, t1, take_fn, tau_fn, extra=""):
    out, seg = [], None
    for f in range(int(round(t0 * FPS)), int(round(t1 * FPS))):
        tf = f / FPS
        k, tau = take_fn(tf), tau_fn(tf)
        if seg and seg["k"] == k and abs(tau - (seg["tau0"] + (tf - seg["t0"]))) < 0.5 / FPS:
            seg["t1"] = tf + 1 / FPS; continue
        if seg: out.append(seg)
        seg = {"k": k, "t0": tf, "t1": tf + 1 / FPS, "tau0": tau}
    if seg: out.append(seg)
    html = []
    for i, s_ in enumerate(out):
        assert 0.0 <= s_["tau0"] and s_["tau0"] + (s_["t1"] - s_["t0"]) <= TLEN[s_["k"]], (prefix, s_)
        # each clip starts half a frame early (and its media with it): rounded to the millisecond, back-to-back clips left a frame
        # time in neither clip, which rendered as one black frame at some cuts (2/11)
        e = min(0.5 / FPS, s_["tau0"])
        html.append('<video id="%s%02d" class="clip v"%s data-hf-media-start-basis="local" src="assets/takes/take%d.mp4" data-start="%.4f" data-duration="%.4f" data-media-start="%.4f" muted playsinline></video>'
                    % (prefix, i, extra, s_["k"], s_["t0"] - e, s_["t1"] - s_["t0"], s_["tau0"] - e))
    return "\n".join(html)
L8 = 8 * BAR
PART0 = B(DROP_B)
def take_at(t):
    p = ((t - PART0) % L8) / P
    return LAYN[max(i for i, (b0, _) in enumerate(LAYN) if b0 <= p + 1e-6)][1]
W0 = 8.6
def tau_loop(t):
    u = t + (INST0 - OFF - TAKE)
    return W0 + ((u - W0) % (2 * BAR))
EDIT = ""   # TRIAL: the board's preview is hidden (the phone plays the real export)
CU = clips("vc", S["cu0"], S["s6"] + 0.05, lambda t: 3, lambda t: 5.62 + (t - S["cu0"]) if t < S["lips"] else 12.0 + (t - S["lips"]))
PAYL = [(0, 2), (3, 3), (4, 2), (6, 3)]               # takes 2 and 3, where his mouth shows (take 1 ends at 15 s)
def take_pay(t):
    p = max(0.0, (t - B(PAY_B)) / P)
    return PAYL[max(i for i, (b0, _) in enumerate(PAYL) if b0 <= p + 1e-6)][1]
PAY = clips("vp0", B(PAY_B) - 0.35, B(END_B) + 0.05, take_pay, lambda t: TAUS0 + (t - B(PAY_B)))
film = OUT / "compositions" / "film.html"
s_ = film.read_text()
for k, html in {"EDIT": EDIT, "EXP": "", "TV": "", "CU": CU, "PAY0": PAY}.items():
    s_, nn = re.subn(r"<!--%s-->.*?<!--/%s-->" % (k, k), "<!--%s-->\n%s\n<!--/%s-->" % (k, html, k), s_, flags=re.S)
    if nn != 1: raise SystemExit("marker %s missing" % k)
# TRIAL (planche contact, v8): « Stalak edits. » and « Free · No download · No sign-up » touched the right-hand strip that
# TikTok's buttons cover (the end card also grows 4.5 % until the end): a little smaller, still centred
for a_, b_ in [(".cl { font-size: 116px;", ".cl { font-size: 108px;"),
               ("text-align:center;font-weight:700;font-size:50px;color:#ffffff;white-space:pre",
                "text-align:center;font-weight:700;font-size:46px;color:#ffffff;white-space:pre")]:
    assert s_.count(a_) == 1, a_
    s_ = s_.replace(a_, b_)
film.write_text(s_)

# waveforms (same as the film)
LONG = json.loads(re.search(r"window\.T = (.*);\s*$", (HERE / "assets/times.js").read_text(), re.S).group(1))
LAY = dict(LONG["LAY"]); LAY["normal"] = LAYN
times = {"P": P, "TOTAL": TOTAL, "W": 1080, "H": 1920, "DB": DB, "PLYR": payoff_lyric(TAUS0, B(END_B) - B(PAY_B) - 0.02),   # 2 bars: "millions." leaves with the panel
         "S": {k: round(v, 3) for k, v in S.items()}, "VO": vo_spans, "VW": [VO[l]["words"] for l in LIDS], "CAPS2": CAPS2,
         "LAY": LAY, "PART0": round(PART0, 4), "L8": round(L8, 4), "WAVES": LONG["WAVES"], "songBar0": LONG["songBar0"], "BAR": BAR}
(OUT / "assets" / "times.js").write_text("/* generated by build_short.py: the Short's clock */\nwindow.T = %s;\n" % json.dumps(times, separators=(",", ":")))

html = """<!doctype html>
<html lang="en" data-resolution="portrait">
  <head>
    <meta charset="UTF-8" /><meta name="viewport" content="width=1080, height=1920" />
    <title>Stalak — The edit nobody sees (YouTube Short, 9:16)</title>
    <script src="assets/vendor/gsap.min.js"></script>
    <script src="assets/times.js"></script>
    <script src="assets/engine.js"></script>
    <script src="assets/phone.js"></script>
    <style>
      @font-face { font-family: "Rubik"; src: url("assets/fonts/rubik.ttf"); font-weight: 300 900; }
      @font-face { font-family: "Lilita One"; src: url("assets/fonts/lilitaone.ttf"); }
      html, body { margin: 0; width: 1080px; height: 1920px; overflow: hidden; background: #12161c; }
      #main { position: relative; width: 1080px; height: 1920px; overflow: hidden; background: #12161c; }
    </style>
  </head>
  <body>
    <div id="main" data-composition-id="main" data-start="0" data-duration="%(total).3f" data-width="1080" data-height="1920">
      <!-- generated by ../build_after.py (trial of 06/11): edit it, then run python3 build_after.py -->
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
(OUT / "index.html").write_text(html)
print("Short: total %.3f s | drop %.3f | payoff %.3f-%.3f | gap %.3f" % (TOTAL, B(DROP_B), B(PAY_B), B(END_B), g1))
print("voice", vo_spans)
print("clips: edit %d, cu %d, pay %d" % (EDIT.count("<video"), CU.count("<video"), PAY.count("<video")))

# TRIAL: the engine copy (portrait: the first camera position starts further left, the TAKE labels are whole on frame 0) + phone.js
eng = (HERE / "assets/engine.js").read_text()
a = "var KCX = [[0, 820], "
assert eng.count(a) == 1
eng = eng.replace(a, "var KCX = [[0, PORT ? %d : 820], " % int(os.environ.get("CX0", "640")))
# TRIAL (planche contact): « 1 frame off » / « out of sync » sat in the bottom 20 % that TikTok / Instagram cover: above the word now
b2 = 'px(fx + fw - 350) + "," + px(fy + fh - 130)'
assert eng.count(b2) == 1
eng = eng.replace(b2, 'px(fx + fw - 350) + "," + px(fy + fh - 420)')
# TRIAL (planche contact, v8): « OFF BEAT » ran into the right-hand strip that TikTok's buttons cover (its box past the frame's
# edge, in the before too): moved left on the tape (mat px)
b3 = "place($.tag4, x4c - 120, 0, 6,"
assert eng.count(b3) == 1
eng = eng.replace(b3, "place($.tag4, x4c - 120 - (PORT ? %d : 0), 0, 6," % int(os.environ.get("TAG4_DX", "80")))
(OUT / "assets" / "engine.js").write_text(eng)
shutil.copy(pathlib.Path(__file__).resolve().parent / "phone.js", OUT / "assets" / "phone.js")
for f in ("hyperframes.json", "meta.json", "package.json"):
    if not (OUT / f).exists(): shutil.copy(HERE / "short" / f, OUT / f)
print("voice:", VOICE)
