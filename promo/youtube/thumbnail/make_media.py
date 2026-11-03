"""The pictures of the thumbnails: real frames of his 3 takes of « neva die », read from his original .MOV files (the sharpest
frame near each chosen moment, by the eye sharpness of MediaPipe's face landmarks), saved as media/t<take>_<frame>.jpg.
media/ stays out of git (frames taken from his footage, the owner's rule).

usage: python3 make_media.py TAKE1.MOV TAKE2.MOV TAKE3.MOV
"""
import os, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
MEDIA = os.path.join(HERE, "media")
MOV = {1: sys.argv[1], 2: sys.argv[2], 3: sys.argv[3]}
# (take, frame at 30 fps): 3/470 eyes to the lens, mouth open on a word (the sharpest close frame of the 3 takes);
# 1/64 crossed fingers, 1/380 both thumbs, 2/62 hands together, 2/448 straight at the camera, 3/50 finger on the lips, 3/85 "call me"
FRAMES = [(3, 470), (1, 64), (1, 380), (2, 62), (2, 448), (3, 50), (3, 85)]

os.makedirs(MEDIA, exist_ok=True)
for k, f in FRAMES:
    out = os.path.join(MEDIA, "t%d_%03d.jpg" % (k, f))
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", MOV[k], "-vf", "select=eq(n\\,%d)" % f, "-frames:v", "1", "-q:v", "1", out], check=True)
    print(out)
