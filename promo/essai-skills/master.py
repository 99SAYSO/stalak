#!/usr/bin/env python3
"""Earshot trial: the after version mastered like the before (-14 LUFS integrated, true peak -1.5 dBTP): a plain gain then a
look-ahead peak limiter (ffmpeg alimiter), aimed again until the loudness is within 0.2 LU; the picture copied as it is.
(loudnorm's dynamic mode, tried first, flattened the hits: Earshot then heard fewer of them on their frame.)

    python3 master.py <render.mp4> <out.mp4>
"""
import json, re, subprocess, sys

src, out = sys.argv[1], sys.argv[2]
I = -14.0


def measure(path, af=None):
    cmd = ["ffmpeg", "-hide_banner", "-i", path] + (["-af", af + ",loudnorm=print_format=json"] if af else ["-af", "loudnorm=print_format=json"]) + ["-f", "null", "-"]
    p = subprocess.run(cmd, capture_output=True, text=True)
    m = json.loads(re.findall(r"\{[^{}]*\"input_i\"[^{}]*\}", p.stderr, re.S)[-1])
    return float(m["input_i"]), float(m["input_tp"])


i0, tp0 = measure(src)
gain = I - i0
for _ in range(4):
    af = "volume=%.2fdB,alimiter=limit=0.73:level=disabled:attack=5:release=50" % gain
    i1, tp1 = measure(src, af)
    if abs(I - i1) < 0.2: break
    gain += I - i1
subprocess.run(["ffmpeg", "-hide_banner", "-v", "error", "-y", "-i", src, "-c:v", "copy", "-af", af, "-ar", "48000", "-c:a", "aac", "-b:a", "192k",
                "-movflags", "+faststart", out], check=True)
i2, tp2 = measure(out)
print("in: %.2f LUFS, %.2f dBTP | gain %+.2f dB + limiter | out: %.2f LUFS, %.2f dBTP" % (i0, tp0, gain, i2, tp2))
