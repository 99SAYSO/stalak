#!/usr/bin/env python3
"""Builds the YouTube Short (9:16) of « The edit nobody sees »: short/index.html, short/assets/times.js and the video clips in
short/compositions/film.html. Same world, same engine (assets/engine.js, portrait mode), same voice read, re-cut:
"Now comes the part nobody sees: the edit." -> the beat -> lips out of sync -> a new pile every day -> "This is Stalak." on the drop
-> the song -> the takes -> lined up and cut on the beat -> 2 bars of his song ("I gotta bounce") -> "You film. Stalak edits." -> the end.
Captions on screen (many watch Shorts without sound). Run: python3 build_short.py (after build.py and vo_cut.py)
"""
import json, re, pathlib
import numpy as np

HERE = pathlib.Path(__file__).parent
OUT = HERE / "short"
P = 60 / 157
BAR = 4 * P
D0 = 20.2946 + 3 * P
OFF = 23.13007
TAKE = 1.452
def B(b): return b * P
def inst_bar(k): return D0 + k * BAR
def song_bar(j): return inst_bar(j + 2) - OFF

DROP_B = 30                      # the drop (inst bar 2) on film beat 30: film 0 is on beat 3 of a bar (downbeats: beats 2, 6, 10…)
DB = DROP_B % 4
INST0 = inst_bar(2) - B(DROP_B)  # inst time at film 0
PAY_B = 52                       # his song from beat 3 of song bar 5 (phase-matched: song bar j = inst bar j + 2), 2 bars
END_B = PAY_B + 8
SONG0 = song_bar(5) + 2 * P
assert abs((INST0 + B(PAY_B)) - (song_bar(5) + 2 * P + OFF)) < 1e-6

VO = {c["id"]: c for c in json.loads((HERE / "assets/audio/vo/yt_clips.json").read_text())}
LIDS = ["L02", "L04", "L05", "L06", "L07", "L08", "S09", "L10", "L16", "L17"]
def word(lid, w, n=1):
    hits = [t for x, t in VO[lid]["words"] if x.strip(".,?!:'").lower() == w.lower()]
    return hits[n - 1]
def dur(lid): return VO[lid]["speech_dur"]
MASTER = 0.68
at = {"L07": B(DROP_B) - word("L07", "stalak") - 0.02}
A0, G7 = 0.14, 0.26
g1 = (at["L07"] - G7 - A0 - sum(dur(l) for l in LIDS[:4])) / 3
assert 0.2 <= g1 <= 0.4, g1
t = A0
for l in LIDS[:4]: at[l] = t; t += dur(l) + g1
prev = at["L07"] + dur("L07")
for l, g in (("L08", 0.3), ("S09", 0.3), ("L10", 0.3)): at[l] = prev + g; prev = at[l] + dur(l)
assert B(PAY_B) - prev > 0.4, (prev, B(PAY_B))
at["L16"] = B(END_B) - 0.02
b = END_B
while B(b) < at["L16"] + dur("L16") + 0.24: b += 1
at["L17"] = B(b) - 0.02
TOTAL = round(B(b + 13), 3)
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
    vo_rows.append('<audio id="%s" class="clip" src="assets/audio/vo/%s.wav" data-start="%.3f" data-duration="%.3f" data-track-index="%d" data-volume="%.3f"></audio>'
                   % (lid.lower(), lid, at[lid] - c["speech_offset"], c["dur"], 30 + i % 2, MASTER))
    vo_spans.append([round(at[lid], 3), round(at[lid] + dur(lid), 3)])
for a, b2 in zip(vo_spans, vo_spans[1:]): assert b2[0] - a[1] > 0.15, (a, b2)

# captions: the problem and Stalak lines, a few words at a time (the claim and the end card show their own words)
CH = [("L02", [(0, 5), (6, 7)]), ("L04", [(0, 3), (4, 7)]), ("L05", [(0, 2), (3, 6), (7, 9)]), ("L06", [(0, 1), (2, 5), (6, 10)]),
      ("L07", [(0, 2)]), ("L08", [(0, 3)]), ("S09", [(0, 3)]), ("L10", [(0, 3), (4, 7), (8, 11), (12, 14)])]
CAPS = []
for lid, chunks in CH:
    li = LIDS.index(lid)
    for ci, (a, b2) in enumerate(chunks):
        end = (at[lid] + VO[lid]["words"][chunks[ci + 1][0]][1] - 0.02) if ci + 1 < len(chunks) else at[lid] + dur(lid) + 0.22
        CAPS.append({"line": li, "from": a, "to": b2, "end": round(end, 3)})
assert all(len(VO[lid]["words"]) - 1 == ch[-1][1] for lid, ch in CH)

# the music: the beat (the drop on "Stalak"), 2 bars of his song, the beat to the end
LO1, LO2, HI = 0.40, 0.22, 0.46
end10 = at["L10"] + dur("L10")
MUS = [("m-walk", "inst.mp3", 0.0, B(PAY_B), INST0), ("m-pay", "song.mp3", B(PAY_B), B(END_B), SONG0),
       ("m-end", "inst.mp3", B(END_B), TOTAL, INST0 + B(END_B))]
def autos(mid, a, b):
    if mid == "m-walk": return [(0.0, LO1), (S["drop"] - 0.3, LO1), (S["drop"] + 0.02, LO2), (end10 + 0.05, LO2), (end10 + 0.45, HI), (b - a, HI)]
    if mid == "m-pay": return [(0.0, 0.48), (b - a, 0.48)]
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
PK.update({"slice": {"peak": 0.002, "dur": 0.42}, "thud": {"peak": 0.004, "dur": 0.45}, "scatter": {"peak": 0.02, "dur": 0.7},
           "tick": {"peak": 0.001, "dur": 0.09}, "tock": {"peak": 0.001, "dur": 0.09}})
EXT = {"slice": "wav", "thud": "wav", "scatter": "wav", "tick": "wav", "tock": "wav"}
LAYN = [(0, 1), (4, 2), (8, 3), (10, 1), (12, 2), (16, 3), (20, 1), (22, 3), (24, 2), (28, 1)]
beats4 = [B(x) for x in range(int(S["s4"] / P) + 1, int(S["blade"] / P) + 1)]
SFX = [("x-cutin", "whoosh", S["cutIn"] + 0.05, 0.14), ("x-slice", "slice", S["slice"], 0.34), ("x-scat", "scatter", S["slice"] + 0.08, 0.3),
       ("x-pull", "whoosh-short", S["slice"] + 0.2, 0.1), ("x-s4", "whoosh-short", S["s4"] + 0.04, 0.08)] + \
      [("x-b%d" % i, "tick", bt, 0.22) for i, bt in enumerate(beats4[-4:])] + [
       ("x-blade", "slice", S["blade"] + 0.02, 0.3), ("x-err", "error", S["blade"] + 0.2, 0.12),
       ("x-dive", "whoosh-cinematic", S["s5"] + 0.62, 0.16), ("x-off", "glitch-1", S["off"] + 0.05, 0.12), ("x-lips", "glitch-2", S["lips"] + 0.25, 0.1),
       ("x-s6", "whoosh-short", S["s6"] + 0.04, 0.1),
       ("x-tue", "thud", S["tue"] + 0.28, 0.4), ("x-wed", "thud", S["wed"] + 0.28, 0.4), ("x-thu", "thud", S["thu"] + 0.28, 0.4), ("x-fri", "thud", S["fri"] + 0.28, 0.4),
       ("x-sc6a", "scatter", S["tue"] + 0.32, 0.16), ("x-sc6b", "scatter", S["wed"] + 0.32, 0.16), ("x-sc6c", "scatter", S["thu"] + 0.32, 0.16),
       ("x-suck", "whoosh-cinematic", S["drop"] - 0.04, 0.16, 1.9, 0.9), ("x-drop", "impact-bass-1", S["drop"], 0.3), ("x-drop2", "sparkle", S["drop"] + 0.06, 0.16),
       ("x-s8", "whoosh-short", S["s8"] - 0.12, 0.12), ("x-fall", "whoosh-short", S["songDrop"] + 0.1, 0.12), ("x-land", "pop", S["land"] + 0.16, 0.2),
       ("x-bpm", "ping", S["land"] + 0.1, 0.08), ("x-s9", "whoosh-short", S["s9"] + 0.12, 0.12),
       ("x-tk1", "pop", S["takesIn"] + 0.08, 0.16), ("x-tk2", "pop", S["takesIn"] + 0.2, 0.16), ("x-tk3", "pop", S["takesIn"] + 0.32, 0.16),
       ("x-al", "whoosh-short", S["align"] + 0.05, 0.1), ("x-lk1", "click-soft", S["synced"] - 0.45, 0.2), ("x-lk2", "click-soft", S["synced"] - 0.33, 0.2),
       ("x-lk3", "click-soft", S["synced"] - 0.21, 0.2), ("x-ok", "chime", S["synced"] - 0.1, 0.06), ("x-toed", "whoosh-short", S["toEdit"] + 0.08, 0.12)] + \
      [("x-c%02d" % i, "tick", S["sweep0"] + (S["sweep1"] - S["sweep0"]) * (b0 / 32), 0.18) for i, (b0, _) in enumerate(LAYN) if b0 > 0] + [
       ("x-pay", "impact-bass-2", S["pay"], 0.26), ("x-payout", "whoosh-short", S["payEnd"] - 0.14, 0.12),
       ("x-cl1", "impact-bass-1", S["film17"] + 0.02, 0.16), ("x-cl2", "impact-bass-1", S["stalak17"] + 0.02, 0.2), ("x-cl3", "sparkle", S["stalak17"] + 0.08, 0.12),
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
    rows.append('<audio id="%s" class="clip" src="assets/sfx/%s.%s" data-start="%.3f" data-duration="%.3f"%s data-track-index="%d" data-volume="%.3f"></audio>'
                % (sid, fn, EXT.get(fn, "mp3"), st, ln, (' data-media-start="%.3f"' % ms) if ms > 0 else "", 12 + lane, vol * MASTER))
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
          #caps { position: absolute; inset: 0; pointer-events: none; }
          .cap { position: absolute; left: 70px; right: 70px; top: 150px; text-align: center; font-weight: 800; font-size: 70px; line-height: 1.12; color: #ffffff;
            -webkit-text-stroke: 10px #0a0d14; paint-order: stroke fill; text-shadow: 0 7px 0 #0a0d14; visibility: hidden; }
          .cap .w { display: inline-block; }
          #grain { position: absolute; inset: 0;""")
    a0 = s.index('        <div id="pay">'); a1 = s.index('        <!-- you film, Stalak edits -->')
    s = s[:a0] + """        <div id="pay">
          <div class="pp" id="pp0">
            <!--PAY0-->
            <!--/PAY0-->
            <div class="lyr pl" style="top:1060px;font-size:84px"><span>I</span> <span>gotta</span> <span>bounce</span></div>
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
    return s
(OUT / "compositions" / "film.html").write_text(portrait_html())

# the videos
FPS = 30
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
        assert 0.0 <= s_["tau0"] and s_["tau0"] + (s_["t1"] - s_["t0"]) <= 15.0, (prefix, s_)
        html.append('<video id="%s%02d" class="clip v"%s data-hf-media-start-basis="local" src="assets/takes/take%d.mp4" data-start="%.3f" data-duration="%.3f" data-media-start="%.3f" muted playsinline></video>'
                    % (prefix, i, extra, s_["k"], s_["t0"], s_["t1"] - s_["t0"], s_["tau0"]))
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
EDIT = clips("ve", S["toEdit"] - 0.5, S["pay"] + 0.1, lambda t: 1 if t < S["sweep1"] else take_at(t), tau_loop)
CU = clips("vc", S["cu0"], S["s6"] + 0.05, lambda t: 3, lambda t: 5.62 + (t - S["cu0"]) if t < S["lips"] else 12.0 + (t - S["lips"]))
PAYL = [(0, 3), (2, 2), (4, 1), (5, 3), (6, 2), (7, 3)]
def take_pay(t):
    p = max(0.0, (t - B(PAY_B)) / P)
    return PAYL[max(i for i, (b0, _) in enumerate(PAYL) if b0 <= p + 1e-6)][1]
PAY = clips("vp0", B(PAY_B) - 0.35, B(END_B) + 0.05, take_pay, lambda t: SONG0 + (t - B(PAY_B)) - TAKE)
film = OUT / "compositions" / "film.html"
s_ = film.read_text()
for k, html in {"EDIT": EDIT, "EXP": "", "TV": "", "CU": CU, "PAY0": PAY}.items():
    s_, nn = re.subn(r"<!--%s-->.*?<!--/%s-->" % (k, k), "<!--%s-->\n%s\n<!--/%s-->" % (k, html, k), s_, flags=re.S)
    if nn != 1: raise SystemExit("marker %s missing" % k)
film.write_text(s_)

# waveforms (same as the film)
LONG = json.loads(re.search(r"window\.T = (.*);\s*$", (HERE / "assets/times.js").read_text(), re.S).group(1))
LAY = dict(LONG["LAY"]); LAY["normal"] = LAYN
times = {"P": P, "TOTAL": TOTAL, "W": 1080, "H": 1920, "DB": DB, "LYR": round(10.952 - SONG0, 3),
         "S": {k: round(v, 3) for k, v in S.items()}, "VO": vo_spans, "VW": [VO[l]["words"] for l in LIDS], "CAPS": CAPS,
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
    <style>
      @font-face { font-family: "Rubik"; src: url("assets/fonts/rubik.ttf"); font-weight: 300 900; }
      @font-face { font-family: "Lilita One"; src: url("assets/fonts/lilitaone.ttf"); }
      html, body { margin: 0; width: 1080px; height: 1920px; overflow: hidden; background: #12161c; }
      #main { position: relative; width: 1080px; height: 1920px; overflow: hidden; background: #12161c; }
    </style>
  </head>
  <body>
    <div id="main" data-composition-id="main" data-start="0" data-duration="%(total).3f" data-width="1080" data-height="1920">
      <!-- generated by ../build_short.py: edit it, then run python3 build_short.py -->
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
