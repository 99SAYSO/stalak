"""Studio Chambre — renders the mock-up in still images and lays them out as boards for « Studio Stalak ».

  SERIE_WORK=<dir> python3 tools/serie/maquette.py [shots|boards|all]

Each still is drawn by the series engine (tools/serie/engine/play.html?ep=maquette&shot=…), so the owner validates
exactly what will move later. Nothing here costs credits : no generated image, no voice.
(Marketing & croissance, 15/11/2026)
"""
import functools
import http.server
import json
import os
import socketserver
import sys
import threading

from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
WORK = os.path.join(os.environ.get('SERIE_WORK', '/tmp/serie'), 'maquette')
SHOTS_DIR = os.path.join(WORK, 'shots')
BOARDS_DIR = os.path.join(WORK, 'planches')
FONT_TITLE = os.path.join(ROOT, 'site_src/fonts/lilitaone.ttf')
FONT_TEXT = os.path.join(ROOT, 'site_src/fonts/rubik.ttf')
SKY, INK, SNOW, ICE, NIGHT = '#1f6fd6', '#0a0d14', '#fdfeff', '#d6ecff', '#0e3f8f'
PRELOAD = ['/site_src/emoji/hello.webp', '/site_src/aide/fr-takes.jpg', '/site_src/icons/icon.svg', '/site_src/icons/watermark.svg']

# name → query of play.html (ep=maquette)
SHOTS = {}
for st, bg in (('A', SKY), ('B', SKY), ('C', ICE)):
    for pose in ('fier', 'crie', 'fatigue'):
        SHOTS[f'{st}-{pose}'] = f'shot=portrait&who=yanis&pose={pose}&style={st}&bg={bg.replace("#", "%23")}'
for pose in ('ebahi', 'smirk', 'chut'):
    SHOTS[f'A-{pose}'] = f'shot=portrait&who=yanis&pose={pose}&style=A&bg={SKY.replace("#", "%23")}'
SHOTS['A-maman'] = f'shot=portrait&who=maman&style=A&bg={SKY.replace("#", "%23")}'
SHOTS['A-banquise'] = f'shot=portrait&who=banquise&style=A&bg={SKY.replace("#", "%23")}'
for ui in ('1', '2', '3'):
    SHOTS[f'cri1-ui{ui}'] = f'shot=cri1&style=A&ui={ui}'
    SHOTS[f'intro1-ui{ui}'] = f'shot=intro1&style=A&ui={ui}'
for shot in ('intro1', 'nuit', 'appli', 'montage', 'prise', 'ecrannoir', 'fenetre', 'danse', 'stalak', 'fin',
             'micro', 'porte', 'lunettes', 'pic', 'notif', 'discussion', 'banquise', 'decale'):
    SHOTS[f'set-{shot}'] = f'shot={shot}&style=A&clean=1'


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


def serve():
    socketserver.TCPServer.allow_reuse_address = True
    httpd = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=ROOT))
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd


def shots(only=None):
    from playwright.sync_api import sync_playwright
    os.makedirs(SHOTS_DIR, exist_ok=True)
    httpd = serve()
    port = httpd.server_address[1]
    data = json.dumps(dict(fps=30, lines=[], subs=[], beats=[], preload=PRELOAD))
    with sync_playwright() as p:
        b = p.chromium.launch()
        for name, qs in SHOTS.items():
            if only and name not in only:
                continue
            pg = b.new_page(viewport=dict(width=1080, height=1920), device_scale_factor=1)
            pg.add_init_script(f'window.__DATA = {data};')
            pg.goto(f'http://127.0.0.1:{port}/tools/serie/engine/play.html?ep=maquette&{qs}')
            pg.wait_for_function('window.ready === true', timeout=20000)
            pg.wait_for_timeout(250)
            pg.screenshot(path=os.path.join(SHOTS_DIR, name + '.png'))
            pg.close()
        b.close()
    httpd.shutdown()
    print(len(os.listdir(SHOTS_DIR)), 'stills in', SHOTS_DIR)


# ---------------- boards ----------------
def font(path, size, bold=False):
    f = ImageFont.truetype(path, size)
    if bold:
        try:
            f.set_variation_by_axes([800])
        except Exception:
            pass
    return f


def wrap(draw, text, f, width):
    words, lines, cur = text.split(), [], ''
    for w in words:
        test = (cur + ' ' + w).strip()
        if draw.textlength(test, font=f) <= width:
            cur = test
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def header(img, title, subtitle):
    d = ImageDraw.Draw(img)
    W = img.width
    ft = font(FONT_TITLE, 54)
    lines = wrap(d, title, ft, W - 80)
    y = 34
    for ln in lines:
        d.text((W // 2, y), ln, font=ft, fill=SNOW, anchor='ma', stroke_width=7, stroke_fill=INK)
        y += 64
    if subtitle:
        fs = font(FONT_TEXT, 28, bold=True)
        for ln in wrap(d, subtitle, fs, W - 100):
            d.text((W // 2, y + 6), ln, font=fs, fill=ICE, anchor='ma')
            y += 38
    return y + 26


def panel(img, im, x, y, caption=None):
    d = ImageDraw.Draw(img)
    w, h = im.size
    d.rounded_rectangle((x + 4, y + 10, x + w + 4, y + h + 10), 22, fill=INK)            # hard shadow
    mask = Image.new('L', im.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, w - 1, h - 1), 20, fill=255)
    img.paste(im, (x, y), mask)
    d.rounded_rectangle((x - 3, y - 3, x + w + 3, y + h + 3), 22, outline=INK, width=6)
    if caption:
        fc = font(FONT_TEXT, 27, bold=True)
        yy = y + h + 22
        for ln in wrap(d, caption, fc, w + 10):
            d.text((x + w // 2, yy), ln, font=fc, fill=SNOW, anchor='ma')
            yy += 34


def load(name):
    return Image.open(os.path.join(SHOTS_DIR, name + '.png')).convert('RGB')


def board_two(out, title, subtitle, items):
    """2 frames side by side (540 × 960 each)."""
    W = 1200
    img = Image.new('RGB', (W, 1400), SKY)
    y0 = header(img, title, subtitle)
    for i, (name, cap) in enumerate(items):
        im = load(name).resize((540, 960), Image.LANCZOS)
        panel(img, im, 40 + i * 580, y0, cap)
    img = img.crop((0, 0, W, y0 + 960 + 96))
    img.save(os.path.join(BOARDS_DIR, out + '.jpg'), quality=90)


CROP_BODY = (140, 470, 940, 1650)   # Yanis in a portrait still (neck at 540,1100, scale 1.2)
CROP_HEAD = (250, 500, 830, 1110)


def board_row(out, title, subtitle, items, crop=CROP_BODY, size=(340, 502), cols=3):
    W = 1200
    rows = (len(items) + cols - 1) // cols
    img = Image.new('RGB', (W, 3000), SKY)
    y0 = header(img, title, subtitle)
    gap = (W - cols * size[0]) // (cols + 1)
    y = y0
    for r in range(rows):
        for c in range(cols):
            k = r * cols + c
            if k >= len(items):
                break
            name, cap = items[k]
            im = name if isinstance(name, Image.Image) else load(name).crop(crop).resize(size, Image.LANCZOS)
            panel(img, im, gap + c * (size[0] + gap), y, cap)
        y += size[1] + 92
    img = img.crop((0, 0, W, y + 6))
    img.save(os.path.join(BOARDS_DIR, out + '.jpg'), quality=90)


def tile_mascot(size):
    im = Image.new('RGB', size, SKY)
    st = Image.open(os.path.join(ROOT, 'site_src/emoji/hello.webp')).convert('RGBA')
    s = int(size[0] * 0.86)
    st = st.resize((s, s), Image.LANCZOS)
    im.paste(st, ((size[0] - s) // 2, (size[1] - s) // 2 + 20), st)
    return im


def tile_narrator(size):
    im = Image.new('RGB', size, NIGHT)
    d = ImageDraw.Draw(im)
    cx, cy = size[0] // 2, size[1] // 2 - 40
    d.rounded_rectangle((cx - 46, cy - 120, cx + 46, cy + 30), 46, fill=SNOW, outline=INK, width=8)   # a microphone
    d.arc((cx - 82, cy - 60, cx + 82, cy + 86), 0, 180, fill=INK, width=10)
    d.line((cx, cy + 86, cx, cy + 140), fill=INK, width=10)
    d.line((cx - 50, cy + 142, cx + 50, cy + 142), fill=INK, width=10)
    f = font(FONT_TEXT, 26, bold=True)
    for i, ln in enumerate(wrap(d, "On l'entend, on ne le voit pas.", f, size[0] - 40)):
        d.text((cx, cy + 180 + i * 34), ln, font=f, fill=ICE, anchor='ma')
    return im


def boards():
    os.makedirs(BOARDS_DIR, exist_ok=True)
    styles = {'A': ('STYLE A · STICKER GIVRÉ (celui que je conseille)', "Contour noir épais et liseré blanc, comme un autocollant. Le plus lisible sur un téléphone."),
              'B': ('STYLE B · GLAÇON', "Des formes taillées comme de la glace, des reflets nets."),
              'C': ('STYLE C · PAPIER DÉCOUPÉ', "Sans contour : du papier découpé, avec une ombre portée.")}
    for k, (t, s) in styles.items():
        board_row(f'style-{k}', t, 'Yanis, alias Lil Givre. ' + s,
                  [(f'{k}-fier', 'Fier'), (f'{k}-crie', 'Il crie'), (f'{k}-fatigue', 'Épuisé, à 3 h 47')])
    names = {'1': 'CARTE GIVRÉE', '2': 'GLAÇON', '3': 'RUBAN BLEU'}
    for ui, nm in names.items():
        board_two(f'bandeau-{ui}', f'BANDEAU ET SOUS-TITRES · PROPOSITION {ui} : {nm}',
                  "À gauche : le cri et le bandeau du titre. À droite : le narrateur, l'étiquette du personnage et le nom de celui qui parle.",
                  [(f'cri1-ui{ui}', '0:00 · le cri, le bandeau du titre'), (f'intro1-ui{ui}', '0:02 · le narrateur parle, le bandeau est parti')])
    size = (340, 502)
    banq = load('A-banquise').crop((180, 600, 900, 1320)).resize((340, 340), Image.LANCZOS)
    bq = Image.new('RGB', size, SKY)
    bq.paste(banq, (0, 80))
    board_row('personnages', 'LES PERSONNAGES (STYLE A)', 'Yanis, sa mère, Big Banquise, la mascotte de Stalak (ses autocollants officiels, petit rôle) et le narrateur.',
              [('A-fier', 'YANIS, alias Lil Givre'), ('A-maman', 'MAMAN'), (bq, 'BIG BANQUISE'),
               (tile_mascot(size), 'LA MASCOTTE DE STALAK'), (tile_narrator(size), 'LE NARRATEUR')])
    board_row('expressions', 'YANIS · SES EXPRESSIONS', 'Celles dont les 3 pilotes ont besoin.',
              [('A-fier', 'Fier'), ('A-crie', 'Il crie'), ('A-fatigue', 'Épuisé'), ('A-ebahi', 'Ébahi'), ('A-smirk', 'Sourire en coin'), ('A-chut', 'Chut')],
              crop=CROP_HEAD, size=(340, 357))
    sets = [
        ('decor-chambre', 'DÉCOR · LA CHAMBRE DE YANIS', 'Son studio : la fenêtre givrée, la mousse au mur, la porte « Studio, ne pas déranger ».',
         [('set-intro1', 'Le jour'), ('set-nuit', 'La nuit (03:47)')]),
        ('decor-ordi', "DÉCOR · L'ORDINATEUR", "Une appli d'enregistrement dessinée par nous (pas celle de BandLab), puis le montage à la main.",
         [('set-appli', "Son appli d'enregistrement"), ('set-montage', "Le montage : la bouche décalée")]),
        ('decor-prises', 'DÉCOR · LES PRISES ET L\'ÉCRAN NOIR', 'Le téléphone calé sur une pile de livres ; la vidéo « écran noir avec les paroles ».',
         [('set-prise', 'Prise 2, « pour le mystère »'), ('set-ecrannoir', "L'écran noir qu'on fait défiler")]),
        ('decor-mascotte', 'ÉPISODE 1 · LA MASCOTTE ET LA FIN', 'La mascotte de Stalak à la fenêtre (autocollant officiel), puis Yanis qui danse.',
         [('set-fenetre', 'Toc toc à la fenêtre'), ('set-danse', 'La vidéo est faite')]),
        ('decor-fin', 'LE VRAI STALAK ET LA CARTE DE FIN', "Les vraies captures de l'appli, puis stalak.app et le titre du prochain épisode.",
         [('set-stalak', 'Le vrai Stalak, en 3 étapes'), ('set-fin', 'La carte de fin')]),
        ('decor-micro', 'ÉPISODE 2 · LE MICRO', 'Prise 23, voyant REC allumé ; puis la prise gâchée, réécoutée.',
         [('set-micro', 'Au micro, la bonne prise'), ('set-pic', 'Le pic rouge « MAMAN »')]),
        ('decor-porte', 'ÉPISODE 2 · LA PORTE', "Sa mère entre avec le poulet congelé ; puis elle revient en lunettes noires.",
         [('set-porte', "« T'as sorti le poulet ? »"), ('set-lunettes', '« Je veux être créditée »')]),
        ('decor-telephone', 'ÉPISODE 3 · LE TÉLÉPHONE', 'La notification de Big Banquise ; la discussion et ses notes vocales.',
         [('set-notif', "L'écran verrouillé"), ('set-discussion', 'La discussion')]),
        ('decor-banquise', 'ÉPISODE 3 · BIG BANQUISE', 'La star du rap glacé ; sa vidéo de promo, décalée.',
         [('set-banquise', 'Big Banquise'), ('set-decale', 'Sa vidéo décalée')]),
    ]
    for out, t, s, items in sets:
        board_two(out, t, s, items)
    print(len(os.listdir(BOARDS_DIR)), 'boards in', BOARDS_DIR)


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'all'
    if cmd in ('shots', 'all'):
        shots(set(sys.argv[2:]) or None)
    if cmd in ('boards', 'all'):
        boards()
