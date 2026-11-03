#!/usr/bin/env python3
"""The film's sound, mixed offline from index.html exactly as its <audio> rows say (start, length, media start, volume, volume
lane, edge fades, playback rate, lowpass chain), to check the levels without a render, or to compare with a render's sound.

usage: python3 mix.py out.wav                     the mix (48 kHz stereo float), and its loudness by group
       python3 mix.py out.wav --compare film.mp4  the same, next to the loudness of the render's sound, window by window
Groups: the voice (ids v01..v12), the music (m-…), the effects (x-…). Mono files play on both sides, as in Web Audio.
"""
import json, pathlib, re, subprocess, sys, tempfile
import numpy as np
import soundfile as sf

HERE = pathlib.Path(__file__).parent
SR = 48000
html = (HERE / "index.html").read_text()
TOTAL = float(re.search(r'id="main"[^>]*data-duration="([0-9.]+)"', html).group(1))
N = int(round(TOTAL * SR))
G = {"voice": np.zeros((N + SR, 2)), "music": np.zeros((N + SR, 2)), "sfx": np.zeros((N + SR, 2))}
_cache = {}


def load(src, rate=1.0, lowpass=None):
    key = (src, rate, lowpass)
    if key not in _cache:
        p = str(HERE / src)
        ch = int(subprocess.run(["ffprobe", "-v", "error", "-select_streams", "a:0", "-show_entries", "stream=channels", "-of", "csv=p=0", p],
                                capture_output=True, text=True).stdout.strip() or 2)
        af = []
        if rate != 1.0:
            af.append("atempo=%.4f" % rate)           # slower, same pitch (Web Audio's preservesPitch)
        if lowpass:
            af.append("lowpass=f=%d" % lowpass)
        cmd = ["ffmpeg", "-v", "error", "-i", p] + (["-af", ",".join(af)] if af else []) + ["-ac", str(min(ch, 2)), "-ar", str(SR), "-f", "f32le", "-"]
        x = np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, np.float32).astype(np.float64)
        _cache[key] = np.repeat(x[:, None], 2, 1) if ch == 1 else x.reshape(-1, 2)
    return _cache[key]


for m in re.finditer(r"<audio ([^>]*)></audio>", html):
    a = m.group(1)

    def attr(n, d=None):
        mm = re.search(r'(?:^|\s)%s="([^"]*)"' % n, a)
        return mm.group(1) if mm else d
    cid, src = attr("id"), attr("src")
    st, du = float(attr("data-start")), float(attr("data-duration"))
    ms, vol, rate = float(attr("data-media-start", 0)), float(attr("data-volume", 1)), float(attr("data-playback-rate", 1))
    lp = None
    if attr("data-fx-chain"):
        for node in json.loads(attr("data-fx-chain").replace("&quot;", '"'))["nodes"]:
            if node["type"] == "lowpass":
                lp = int(node["params"]["frequency"])
    x = load(src, rate, lp)
    i0, n = int(round(ms / rate * SR)), int(round(du * SR))          # after atempo, the file's time runs 1/rate slower
    seg = x[i0:i0 + n].copy()
    t = np.arange(len(seg)) / SR
    g = np.full(len(seg), vol)
    if attr("data-automation"):
        pts = json.loads(attr("data-automation").replace("&quot;", '"'))["lanes"][0]["points"]
        g *= np.interp(t, [p["t"] for p in pts], [p["v"] for p in pts])
    fi, fo = float(attr("data-fade-in", 0)), float(attr("data-fade-out", 0))
    if fi > 0:
        g *= np.clip(t / fi, 0, 1)
    if fo > 0:
        g *= np.clip((du - t) / fo, 0, 1)
    seg *= g[:, None]
    k = "voice" if re.match(r"^v[0-9]", cid) else ("music" if cid.startswith("m-") else "sfx")
    j0 = int(round(st * SR)); j1 = min(N + SR, j0 + len(seg))
    G[k][j0:j1] += seg[: j1 - j0]

mix = (G["voice"] + G["music"] + G["sfx"])[:N]
out = sys.argv[1]
sf.write(out, mix.astype(np.float32), SR, subtype="FLOAT")


def lufs(x):
    with tempfile.NamedTemporaryFile(suffix=".wav") as f:
        sf.write(f.name, np.clip(x, -1, 1).astype(np.float32), SR, subtype="FLOAT")
        o = subprocess.run(["ffmpeg", "-hide_banner", "-i", f.name, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
        i = re.findall(r"I:\s+(-?[0-9.]+|-inf) LUFS", o)
        return float(i[-1]) if i and i[-1] != "-inf" else -70.0


ref = None
if "--compare" in sys.argv:
    v = sys.argv[sys.argv.index("--compare") + 1]
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", v, "-vn", "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    ref = np.frombuffer(raw, np.float32).astype(np.float64).reshape(-1, 2)
print("mix: %.3f s, peak %.2f dBFS, %.1f LUFS" % (N / SR, 20 * np.log10(np.abs(mix).max() + 1e-12), lufs(mix)))
WIN = [(0, TOTAL)] + [(float(w.split(",")[0]), float(w.split(",")[1])) for w in sys.argv[2:] if re.match(r"^[0-9.]+,[0-9.]+$", w)]
if len(WIN) == 1:
    WIN += [(t, min(TOTAL, t + 4)) for t in range(0, int(TOTAL), 4)]
for t0, t1 in WIN:
    a, b = int(t0 * SR), int(t1 * SR)
    row = "%5.1f-%5.1f  voice %6.1f  music %6.1f  sfx %6.1f  mix %6.1f" % (t0, t1, lufs(G["voice"][a:b]), lufs(G["music"][a:b]), lufs(G["sfx"][a:b]), lufs(mix[a:b]))
    if ref is not None:
        row += "  | render %6.1f" % lufs(ref[a:b])
    print(row)
