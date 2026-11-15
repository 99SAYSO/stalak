"""Studio Chambre / T-Crazy — lays out the universe options for « Studio Stalak » (onglet Univers).

  SERIE_WORK=<dir> python3 tools/serie/univers.py style      # the 3 style boards (3:4, as the page shows them)

The images themselves are generated on Flora (Nano Banana 2.1, 1K, about 0.05 $ each) from prompts that describe the
style by its traits only (no series or character name from elsewhere). They stay in the work folder, never in the repo.
(Marketing & croissance, 15/11/2026)
"""
import os
import sys

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
WORK = os.path.join(os.environ.get('SERIE_WORK', '/tmp/serie'), 'univers')
FONT_TITLE = os.path.join(ROOT, 'site_src/fonts/lilitaone.ttf')
FONT_TEXT = os.path.join(ROOT, 'site_src/fonts/rubik.ttf')
SKY, INK, SNOW, ICE, NIGHT = '#1f6fd6', '#0a0d14', '#fdfeff', '#d6ecff', '#0e3f8f'


def font(path, size, weight=None):
    f = ImageFont.truetype(path, size)
    if weight:
        try:
            f.set_variation_by_axes([weight])
        except Exception:
            pass
    return f


def wrap(d, text, f, width):
    out, cur = [], ''
    for w in text.split():
        t = (cur + ' ' + w).strip()
        if d.textlength(t, font=f) <= width:
            cur = t
        else:
            out.append(cur)
            cur = w
    return out + ([cur] if cur else [])


def framed(img, im, x, y, r=18):
    d = ImageDraw.Draw(img)
    w, h = im.size
    d.rounded_rectangle((x + 5, y + 11, x + w + 5, y + h + 11), r + 2, fill=INK)
    m = Image.new('L', im.size, 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, w - 1, h - 1), r, fill=255)
    img.paste(im, (x, y), m)
    d.rounded_rectangle((x - 3, y - 3, x + w + 3, y + h + 3), r + 2, outline=INK, width=6)


def board(out, title, scene, face_box, traits, label):
    """3:4 board : the scene in 9:16 on the left, a close-up of the face and the traits on the right."""
    W, H = 1200, 1600
    img = Image.new('RGB', (W, H), SKY)
    d = ImageDraw.Draw(img)
    d.text((W // 2, 34), title, font=font(FONT_TITLE, 64), fill=SNOW, anchor='ma', stroke_width=8, stroke_fill=INK)
    src = Image.open(scene).convert('RGB')
    sc = src.resize((770, int(770 * src.height / src.width)), Image.LANCZOS)
    sc = sc.crop((0, 0, 770, min(sc.height, 1370)))
    framed(img, sc, 34, 150)
    face = src.crop(face_box).resize((322, 322), Image.LANCZOS)
    framed(img, face, 846, 150)
    y = 506
    d.text((846, y), 'GROS PLAN', font=font(FONT_TEXT, 26, 800), fill=ICE)
    y += 52
    f = font(FONT_TEXT, 30, 600)
    for t in traits:
        lines = wrap(d, t, f, 322 - 30)
        d.text((846, y), '•', font=f, fill=SNOW)
        for ln in lines:
            d.text((876, y), ln, font=f, fill=SNOW)
            y += 38
        y += 16
    fl = font(FONT_TEXT, 24, 500)
    y = max(y + 10, 1300)
    for ln in wrap(d, label, fl, 330):
        d.text((846, y), ln, font=fl, fill=ICE)
        y += 31
    os.makedirs(os.path.join(WORK, 'planches'), exist_ok=True)
    p = os.path.join(WORK, 'planches', out + '.jpg')
    img.save(p, quality=90)
    return p


if __name__ == '__main__':
    print('see the functions ; boards are made from the generated images listed in the work folder')
    sys.exit(0)
