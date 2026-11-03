#!/usr/bin/env python3
"""Prepares one video for the Salle de visionnage (README.md): a light review copy (<= 20 MiB, the page's asset limit), a
filmstrip for its timeline (one picture every 0.5 s), and the video's record (scenes, sound envelope) for its database.

usage: python3 prepare.py VIDEO.mp4 --id stalak-lancement-v2 --title "Stalak — film de lancement" --version 2 \
           [--scenes scenes.json] [--note "Ce que j'ai changé"] [--out DIR]
scenes.json: [[t0, t1, "label"], ...] in seconds. Then upload DIR/review.mp4 and DIR/strip.jpg to the artifact (Artifact tool,
asset: true, file_paths), put the two returned ids in DIR/doc.json ("asset" and "filmstrip.asset"), and write it with
ArtifactData set (collection "videos", doc_id = --id).
"""
import argparse, datetime, json, os, re, subprocess

ap = argparse.ArgumentParser()
ap.add_argument("video"); ap.add_argument("--id", required=True); ap.add_argument("--title", required=True)
ap.add_argument("--version", type=int, default=1); ap.add_argument("--scenes"); ap.add_argument("--note", default="")
ap.add_argument("--out", default="retours_out")
a = ap.parse_args()
os.makedirs(a.out, exist_ok=True)


def probe(v):
    o = json.loads(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration:stream=codec_type,width,height,r_frame_rate",
                                   "-of", "json", v], capture_output=True, text=True, check=True).stdout)
    vs = [s for s in o["streams"] if s["codec_type"] == "video"][0]
    n, d = vs["r_frame_rate"].split("/")
    return float(o["format"]["duration"]), int(vs["width"]), int(vs["height"]), round(float(n) / float(d), 3)


dur, w, h, fps = probe(a.video)
portrait = h > w
sw, sh = (720, 1280) if portrait else (1280, 720)
review = os.path.join(a.out, "review.mp4")
for crf in (25, 28, 31, 34):                           # the smallest quality loss that fits under 20 MiB
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", a.video, "-vf", "scale=%d:%d:flags=lanczos" % (sw, sh), "-c:v", "libx264", "-preset", "medium",
                    "-crf", str(crf), "-g", "15", "-keyint_min", "15", "-sc_threshold", "0", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k",
                    "-movflags", "+faststart", review], check=True)
    if os.path.getsize(review) <= 19.5 * 1024 * 1024:
        break
step = 0.5
n = int(dur / step) + 1
cols = 12
rows = (n + cols - 1) // cols
tw, th = (108, 192) if portrait else (192, 108)
strip = os.path.join(a.out, "strip.jpg")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", a.video, "-vf", "fps=%g,scale=%d:%d:flags=lanczos,tile=%dx%d" % (1 / step, tw, th, cols, rows),
                "-frames:v", "1", "-q:v", "4", strip], check=True)
# the sound envelope: peak level every 0.1 s, -42 dB → 0, -10 dB → 1
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", a.video, "-vn", "-ac", "1", "-ar", "8000", "-f", "s16le", "-"], capture_output=True).stdout
import array, math
pcm = array.array("h", raw)
wave, hop = [], 800
for i in range(0, max(1, int(dur * 10))):
    seg = pcm[i * hop:(i + 1) * hop]
    pk = max((abs(x) for x in seg), default=0) / 32768.0
    db = 20 * math.log10(pk) if pk > 0 else -90
    wave.append(round(min(1, max(0, (db + 42) / 32)), 2))
scenes = []
if a.scenes:
    scenes = [{"t0": s[0], "t1": s[1], "label": s[2]} for s in json.load(open(a.scenes))]
doc = {"title": a.title, "version": a.version, "fps": fps, "w": w, "h": h, "duration": round(dur, 3),
       "createdAt": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z"), "note": a.note,
       "filmstrip": {"asset": None, "cols": cols, "rows": rows, "n": n, "step": step, "tw": tw, "th": th},
       "scenes": scenes, "wave": wave, "waveSpan": round(dur, 3), "asset": None, "source": "claude", "file": os.path.abspath(a.video)}
json.dump(doc, open(os.path.join(a.out, "doc.json"), "w"), ensure_ascii=False)
print("review copy %.1f MB, strip %d pictures, record %s" % (os.path.getsize(review) / 1e6, n, os.path.join(a.out, "doc.json")))
