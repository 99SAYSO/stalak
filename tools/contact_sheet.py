#!/usr/bin/env python3
"""Planche contact : une image toutes les 0,5 s (réglable), avec l'horodatage
et les zones masquées par TikTok / Instagram en vertical.
Usage : python3 contact_sheet.py VIDEO.mp4 [--step 0.5] [--cols 6] [--rows 4] [--width 300] [--out DOSSIER]
Sortie : DOSSIER/planche_01.jpg, planche_02.jpg ... (24 images par planche par défaut)."""
import argparse, os, subprocess, sys, tempfile, glob, json
from PIL import Image, ImageDraw, ImageFont

ap = argparse.ArgumentParser()
ap.add_argument("video"); ap.add_argument("--step", type=float, default=0.5)
ap.add_argument("--cols", type=int, default=6); ap.add_argument("--rows", type=int, default=4)
ap.add_argument("--width", type=int, default=300); ap.add_argument("--out", default=None)
ap.add_argument("--no-zones", action="store_true")
a = ap.parse_args()

info = json.loads(subprocess.check_output(["ffprobe","-v","error","-select_streams","v:0",
    "-show_entries","stream=width,height:format=duration","-of","json",a.video]))
W, H = info["streams"][0]["width"], info["streams"][0]["height"]
dur = float(info["format"]["duration"])
out = a.out or os.path.splitext(a.video)[0] + "_planche"
os.makedirs(out, exist_ok=True)
tmp = tempfile.mkdtemp()
tw = a.width; th = round(H * tw / W)
# une recherche exacte par horodatage (le filtre fps d'ffmpeg décalait les images d'environ 0,25 s)
n = int(dur // a.step) + 1; frames = []; times = []
for k in range(n):
    t = min(k * a.step, max(dur - 0.05, 0)); f = os.path.join(tmp, f"f_{k:05d}.png")
    subprocess.run(["ffmpeg","-v","error","-y","-ss",f"{t:.3f}","-i",a.video,"-frames:v","1",
        "-vf",f"scale={tw}:{th}",f], check=True)
    if os.path.exists(f): frames.append(f); times.append(t)
try: font = ImageFont.truetype("DejaVuSans-Bold.ttf", 16)
except Exception: font = ImageFont.load_default()
vertical = H > W
per = a.cols * a.rows; lab = 24; sheets = []
for s in range(0, len(frames), per):
    chunk = frames[s:s+per]
    sheet = Image.new("RGB", (a.cols*(tw+6)+6, a.rows*(th+lab+6)+6), (20,20,20))
    d = ImageDraw.Draw(sheet)
    for i, f in enumerate(chunk):
        t = times[s+i]
        x = 6 + (i % a.cols)*(tw+6); y = 6 + (i // a.cols)*(th+lab+6)
        im = Image.open(f).convert("RGB")
        if vertical and not a.no_zones:
            o = ImageDraw.Draw(im, "RGBA")
            # zones souvent masquées en 9:16 : haut ~8 %, bas ~20 % (légende), droite ~12 % (boutons)
            o.rectangle([0,0,tw,int(th*.08)], fill=(255,0,0,40))
            o.rectangle([0,int(th*.80),tw,th], fill=(255,0,0,40))
            o.rectangle([int(tw*.88),int(th*.35),tw,int(th*.80)], fill=(255,0,0,40))
        sheet.paste(im, (x, y+lab))
        d.text((x+2, y+3), f"{int(t//60)}:{t%60:04.1f}", fill=(255,230,0), font=font)
    p = os.path.join(out, f"planche_{s//per+1:02d}.jpg"); sheet.save(p, quality=88); sheets.append(p)
print(f"{len(frames)} images ({dur:.1f} s, pas {a.step} s) -> {len(sheets)} planche(s) :")
print("\n".join(sheets))
