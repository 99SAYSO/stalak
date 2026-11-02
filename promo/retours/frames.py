#!/usr/bin/env python3
"""Shows what the owner pointed at in the Salle de visionnage: for each of his remarks, the exact frame of the full-quality
video with his pen strokes drawn back on it (and the end frame of a passage), plus one sheet with every remark and its text.

usage: python3 frames.py REMARKS_DIR VIDEO.mp4 OUT_DIR
REMARKS_DIR: the files ArtifactData writes with out_dir (query of "remarks" where video == <id>): REMARKS_DIR/remarks/*.json.
The strokes are stored as fractions of the picture (0..1), so they land on the full-size frame exactly.
"""
import glob, json, os, subprocess, sys
from PIL import Image, ImageDraw, ImageFont

src, video, out = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(out, exist_ok=True)
files = sorted(glob.glob(os.path.join(src, "**", "*.json"), recursive=True))
rems = []
for f in files:
    d = json.load(open(f))
    d = d.get("data", d)
    if "frame" in d:
        d["_id"] = os.path.splitext(os.path.basename(f))[0]
        rems.append(d)
rems.sort(key=lambda r: (r["t"], r.get("createdAt", "")))


def frame(n, path):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", video, "-vf", "select=eq(n\\,%d)" % n, "-frames:v", "1", path], check=True)
    return Image.open(path).convert("RGB")


def fmt(t):
    m = int(t // 60); s = t - 60 * m
    return "%d:%05.2f" % (m, s)


fps = None
try:
    o = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=r_frame_rate", "-of", "csv=p=0", video],
                       capture_output=True, text=True).stdout.strip()
    a, b = o.split("/"); fps = float(a) / float(b)
except Exception:
    fps = 30.0
font = None
for p in ("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", "/usr/share/fonts/dejavu/DejaVuSans.ttf"):
    if os.path.exists(p):
        font = ImageFont.truetype(p, 26); small = ImageFont.truetype(p, 20); break
if font is None:
    font = small = ImageFont.load_default()
cards = []
for i, r in enumerate(rems, 1):
    im = frame(int(r["frame"]), os.path.join(out, "_f.png"))
    W, H = im.size
    dr = ImageDraw.Draw(im)
    for s in r.get("strokes") or []:
        pts = [(x * W, y * H) for x, y in s["p"]]
        wid = max(3, int(round(s.get("w", 0.0065) * W)))
        if len(pts) == 1:
            x, y = pts[0]; dr.ellipse([x - wid, y - wid, x + wid, y + wid], fill=s.get("c", "#ff453a"))
        else:
            dr.line(pts, fill=s.get("c", "#ff453a"), width=wid, joint="curve")
    name = "r%02d_%s.png" % (i, fmt(r["t"]).replace(":", "m").replace(".", "s"))
    im.save(os.path.join(out, name))
    end = None
    if r.get("t1"):
        end = frame(int(round(r["t1"] * fps)), os.path.join(out, "r%02d_fin.png" % i))
        end.save(os.path.join(out, "r%02d_fin.png" % i))
    cards.append((i, r, im, end))
    print("%d. %s%s · %s · %s : %s  -> %s" % (i, fmt(r["t"]), (" → " + fmt(r["t1"])) if r.get("t1") else "", r.get("kind"), r.get("status"),
                                             (r.get("text") or "(dessin seulement)").replace("\n", " "), name))
if os.path.exists(os.path.join(out, "_f.png")):
    os.remove(os.path.join(out, "_f.png"))
# one sheet: every remark, its frame (and end frame), its words
if cards:
    tw = 640; th = int(tw * cards[0][2].size[1] / cards[0][2].size[0]); pad = 16; txt_h = 120
    sheet = Image.new("RGB", (pad + 2 * (tw + pad), pad + len(cards) * (th + txt_h + pad)), (14, 17, 22))
    d = ImageDraw.Draw(sheet)
    for k, (i, r, im, end) in enumerate(cards):
        y = pad + k * (th + txt_h + pad)
        sheet.paste(im.resize((tw, th)), (pad, y))
        if end is not None:
            sheet.paste(end.resize((tw, th)), (pad * 2 + tw, y))
        head = "%d. %s%s  ·  %s  ·  %s" % (i, fmt(r["t"]), (" → " + fmt(r["t1"])) if r.get("t1") else "", r.get("kind", ""), r.get("status", ""))
        d.text((pad, y + th + 8), head, fill=(255, 214, 10), font=font)
        words, line, lines = (r.get("text") or "(dessin seulement)").split(), "", []
        for w_ in words:
            if d.textlength(line + " " + w_, font=small) > 2 * tw:
                lines.append(line); line = w_
            else:
                line = (line + " " + w_).strip()
        lines.append(line)
        for j, ln in enumerate(lines[:3]):
            d.text((pad, y + th + 44 + j * 24), ln, fill=(233, 238, 244), font=small)
    sheet.save(os.path.join(out, "remarques.png"))
    print("sheet:", os.path.join(out, "remarques.png"))
