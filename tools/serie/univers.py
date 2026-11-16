"""Studio Chambre / T-Crazy — lays out the universe options for « Studio Stalak » (onglet Univers).

  SERIE_WORK=<dir> python3 tools/serie/univers.py decors [rue-v1 …]   # the set boards (3:4, as the page shows them)

Since the owner's decision of 15/11 at 23 h, every image is drawn in code by Claude (tools/serie/engine : tcrazy.js, liam.js,
cast.js, decors.js) ; Flora only makes the voices. The renders stay in the work folder, never in the repo.
decor_board() lays out a set : day and night side by side, or one scene with a close-up.
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
    for w in [w for w in text.split(' ') if w]:  # split on plain spaces only : a non-breaking space keeps « and » attached
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


def decor_board(out, title, subtitle, scenes, traits, crop=None, crop_src=None, crop_label='GROS PLAN'):
    """3:4 board for a set. Two scenes (day, night) side by side ; or one scene with a close-up and its traits."""
    W, H = 1200, 1600
    nb = lambda t: t.replace('« ', '«\u00a0').replace(' »', '\u00a0»')  # never a lone guillemet at a line start
    traits = [nb(t) for t in traits]
    img = Image.new('RGB', (W, H), SKY)
    d = ImageDraw.Draw(img)
    fs = 60 if len(title) <= 34 else max(40, int(60 * 34 / len(title)))
    d.text((W // 2, 34), title, font=font(FONT_TITLE, fs), fill=SNOW, anchor='ma', stroke_width=8, stroke_fill=INK)
    d.text((W // 2, 112), subtitle, font=font(FONT_TEXT, 25, 700), fill=ICE, anchor='ma')
    ft, fl = font(FONT_TEXT, 28, 600), font(FONT_TITLE, 34)
    if len(scenes) == 2:
        for i, (label, path) in enumerate(scenes):
            sc = Image.open(path).convert('RGB').resize((548, 974), Image.LANCZOS)
            framed(img, sc, 34 + i * 584, 160)
            d.text((34 + i * 584 + 274, 1150), label, font=fl, fill=SNOW, anchor='ma', stroke_width=5, stroke_fill=INK)
        y = 1218
        for t in traits:
            for j, line in enumerate(wrap(d, t, ft, W - 120)):
                if j == 0:
                    d.text((50, y), '•', font=ft, fill=SNOW)
                d.text((80, y), line, font=ft, fill=SNOW)
                y += 36
            y += 10
    else:
        label, path = scenes[0]
        src = Image.open(path).convert('RGB')
        sc = src.resize((770, 1369), Image.LANCZOS)
        framed(img, sc, 34, 170)
        y = 572
        if crop:
            csrc = Image.open(crop_src).convert('RGB') if crop_src else src
            th = round(322 * (crop[3] - crop[1]) / (crop[2] - crop[0]))  # a square close-up, or a taller one (the 3:4 grid of a profile)
            framed(img, csrc.crop(crop).resize((322, th), Image.LANCZOS), 846, 170)
            d.text((846, 170 + th + 28), crop_label, font=font(FONT_TEXT, 26, 800), fill=ICE)
            y = 170 + th + 80
        for t in traits:
            for j, line in enumerate(wrap(d, t, ft, 322 - 30)):
                if j == 0:
                    d.text((846, y), '•', font=ft, fill=SNOW)
                d.text((876, y), line, font=ft, fill=SNOW)
                y += 36
            y += 14
    os.makedirs(os.path.join(WORK, 'planches'), exist_ok=True)
    p = os.path.join(WORK, 'planches', out + '.jpg')
    img.save(p, quality=88)
    return p


# The set boards (onglet Univers, fiches decor-*) : title, subtitle, scenes (label, render name), traits, close-up box.
# A render name is <set>-v<version>-<time>, made by tools/serie/shot.py from engine/decors.html?d=<set>&v=<version>&t=<time>.
DECOR_BOARDS = {
    'chambre-v1': ('LA CHAMBRE · VERSION 1 : LE STUDIO SOUS LA FENÊTRE', 'La chambre de la planche de style, vide, prête pour les personnages.',
                   [('LE JOUR', 'chambre-v1-jour'), ('LA NUIT', 'chambre-v1-nuit')],
                   ['Matelas au sol, mousse anti-bruit scotchée de travers, micro sur pied avec filtre.',
                    "Ordi portable avec une appli d'enregistrement inventée (aucun vrai logo), posters de rappeurs inventés.",
                    'Le jour : lumière chaude du soir. La nuit : néon bleu glace, écran qui éclaire, lune et ville allumée.'], None),
    'chambre-v2': ('LA CHAMBRE · VERSION 2 : LE PLACARD-STUDIO', 'Le placard transformé en cabine de chant, le lit sous la fenêtre.',
                   [('LE JOUR', 'chambre-v2-jour'), ('LA NUIT', 'chambre-v2-nuit')],
                   ['Le placard ouvert : couettes accrochées en cabine de chant, micro dedans, pancarte « STUDIO » sur la porte.',
                    "Bureau avec l'ordi et un vieil écran, lampe, boîtes de baskets empilées, lit défait sous une fenêtre à stores.",
                    'Une bande LED bleu glace au plafond : elle éclaire toute la chambre la nuit.'], None),
    'cuisine-v1': ('LA MAISON · VERSION 1 : LA CUISINE', "Là où Nadia surprend Liam, en fin d'après-midi.", [('', 'cuisine-v1-jour')],
                   ["Le frigo couvert de factures, de magnets et d'un dessin de Liam petit, micro en main.",
                    "L'évier plein de vaisselle : « T-Crazy mange pas si T-Crazy a pas fait la vaisselle. »",
                    'La cafetière de Nadia, la fenêtre et sa lumière chaude.'], (770, 570, 1070, 870)),
    'cuisine-v2': ('LA MAISON · VERSION 2 : LE SALON', "Le salon de la maison, en fin d'après-midi.", [('', 'cuisine-v2-jour')],
                   ['Le canapé usé avec sa pièce cousue et un plaid tricoté.',
                    'Les photos de famille, la télé, la table basse pleine de courrier.',
                    'La lumière du soir à travers les stores.'], (300, 960, 800, 1460)),
    'rue-v1': ('LA RUE · VERSION 1 : LA RUE PAVILLONNAIRE', "Petites maisons et l'épicerie de M. Reyes, l'après-midi.", [('', 'rue-v1-jour')],
               ['Les petites maisons, le poteau électrique et ses fils qui traversent le ciel.',
                "L'épicerie « REYES » : enseigne, store rayé, affiche « PROMO », panneau « OUVERT ».",
                "Le coffre « GLAÇONS » devant la vitrine : un clin d'œil glacé."], (480, 560, 1080, 1160)),
    'rue-v2': ('LA RUE · VERSION 2 : LA RUE EN VILLE', "Immeubles en briques et l'épicerie au pied, le soir.", [('', 'rue-v2-soir')],
               ['Immeubles en briques, escalier de secours, fenêtres allumées.',
                "L'épicerie au pied de l'immeuble, enseigne « REYES » lumineuse.",
                'Le lampadaire et la lumière de la vitrine sur le trottoir.'], (440, 940, 1080, 1580)),
    'terrain-v1': ('LE TERRAIN · VERSION 1 : LE TERRAIN GRILLAGÉ', 'Le terrain du quartier, en fin de journée.', [('', 'terrain-v1-jour')],
                   ['Le grillage, le panier au cercle tordu et au filet déchiré.',
                    'Les immeubles du quartier derrière, un panneau tordu, un banc.',
                    'Lumière dorée de fin de journée.'], (620, 820, 1060, 1260)),
    'terrain-v2': ('LE TERRAIN · VERSION 2 : SOUS LE PONT', "Le terrain sous l'autoroute, la nuit.", [('', 'terrain-v2-nuit')],
                   ["Sous un pont d'autoroute, entre deux piliers, la ville allumée au loin.",
                    'Un seul lampadaire orange éclaire le terrain.',
                    'Le lieu parfait pour les clashs avec Big\u00a0Mo.'], (0, 760, 560, 1320)),
    'lycee-v1': ('LE LYCÉE · VERSION 1 : LE COULOIR', 'Le couloir et ses casiers.', [('', 'lycee-v1-jour')],
                 ['Les casiers bleus (quelques rouges) en perspective.',
                  'Les néons au plafond, le sol qui brille, la porte « SORTIE » au fond.',
                  'Les 2 versions du lycée sont 2 lieux : tu peux garder les deux.'], (600, 420, 1080, 900)),
    'lycee-v2': ('LE LYCÉE · VERSION 2 : LE BUS JAUNE', "L'intérieur du bus scolaire.", [('', 'lycee-v2-jour')],
                 ["Les rangées de sièges verts face à toi, l'allée au milieu.",
                  'Les grandes fenêtres, la porte de secours jaune au fond.',
                  'Là où Liam montre ses vidéos à tout le monde.'], (220, 600, 860, 1240)),
    'toit-v1': ("LE TOIT · VERSION 1 : LE CHÂTEAU D'EAU", "Le toit de l'immeuble au coucher du soleil.", [('', 'toit-v1-soir')],
                ["Le château d'eau, les climatiseurs, une chaise pliante.",
                 'Le soleil qui se couche derrière la ville, le ciel orange.',
                 'Le lieu des moments « lifestyle » et des rêves de gloire.'], (20, 440, 420, 840)),
    'toit-v2': ('LE TOIT · VERSION 2 : LE TOIT AMÉNAGÉ', "Le toit au crépuscule, la ville qui s'allume.", [('', 'toit-v2-soir')],
                ['Un vieux canapé vert, une caisse avec une enceinte, des plantes.',
                 'Une guirlande lumineuse au-dessus du toit.',
                 "Une glacière bleue avec un flocon : le clin d'œil glacé."], (600, 1240, 1080, 1720)),
}


def decors(names):
    """Render the scenes a board needs (if missing) and lay the boards out : python3 tools/serie/univers.py decors [rue-v1 …]"""
    import subprocess
    out = []
    for name in names or DECOR_BOARDS:
        title, sub, scenes, traits, crop = DECOR_BOARDS[name]
        paths = []
        for label, r in scenes:
            p = os.path.join(WORK, 'decors', r + '.png')
            if not os.path.exists(p):
                os.makedirs(os.path.dirname(p), exist_ok=True)
                d, v, t = r.split('-')
                subprocess.run([sys.executable, os.path.join(ROOT, 'tools/serie/shot.py'),
                                'tools/serie/engine/decors.html?d=%s&v=%s&t=%s' % (d, v[1:], t), p], check=True)
            paths.append((label, p))
        out.append(decor_board(name, title, sub, paths, traits, crop))
    return out


# The series dressing (fiches bandeau and logo-serie) : frames made by engine/frame.html?f=<id> (frame.js).
EXAMPLE = 'Exemple de texte seulement : aucun script n\'est encore écrit.'
HABILLAGE_BOARDS = {
    'bandeau-v1': ('LE BANDEAU · VERSION 1 : LA CARTE GLACÉE', "À gauche l'accroche, à droite le narrateur (le bandeau est parti).",
                   [("L'ACCROCHE", 'bandeau-1-accroche'), ('LE NARRATEUR', 'bandeau-1-narrateur')],
                   ["Le titre de l'épisode sur la carte blanche de Stalak : gros contour noir, ombre dure, glaçons dessous.",
                    'Les sous-titres sur une carte blanche, le nom de celui qui parle dans une étiquette à sa couleur.', EXAMPLE]),
    'bandeau-v2': ('LE BANDEAU · VERSION 2 : LA BANDE BLEUE', "À gauche l'accroche, à droite le narrateur (le bandeau est parti).",
                   [("L'ACCROCHE", 'bandeau-2-accroche'), ('LE NARRATEUR', 'bandeau-2-narrateur')],
                   ['Le titre sur une bande bleue penchée, de bord à bord, avec de la neige posée dessus.',
                    'Les sous-titres en grosses lettres blanches cernées de noir, le nom au-dessus, à sa couleur.', EXAMPLE]),
    'bandeau-v3': ("LE BANDEAU · VERSION 3 : L'ÉTIQUETTE GLACE", "À gauche l'accroche, à droite le narrateur (le bandeau est parti).",
                   [("L'ACCROCHE", 'bandeau-3-accroche'), ('LE NARRATEUR', 'bandeau-3-narrateur')],
                   ["Le titre sur une étiquette glace, avec le numéro de l'épisode à gauche, en bleu nuit.",
                    'Les sous-titres dans un cadre bleu nuit bordé de glace, le nom dans une pastille à sa couleur.', EXAMPLE]),
    'bandeau-v4': ('LE BANDEAU · VERSION 4 : TON MÉLANGE', 'La bande de titre de la version 2, les sous-titres de la version 1.',
                   [("L'ACCROCHE", 'bandeau-4-accroche'), ('LE NARRATEUR', 'bandeau-4-narrateur')],
                   ["Le titre de l'épisode sur la bande bleue penchée, de bord à bord, avec de la neige posée dessus (version 2).",
                    'Les sous-titres sur une carte blanche, le nom de celui qui parle dans une étiquette à sa couleur (version 1).', EXAMPLE]),
    'miniature': ('LA MINIATURE · EXEMPLE', 'La couverture de chaque vidéo, faite avec elle, dans le style de la série.', [('', 'miniature-exemple')],
                  ["Le titre de l'épisode sur la bande bleue que tu as choisie, les personnages en grand.",
                   'Titre et visages restent au centre : ils se voient aussi quand TikTok recadre la miniature dans la grille du profil (ci-dessus).',
                   'Exemple : le titre et la scène changent à chaque épisode.'], ('miniature-exemple', (0, 240, 1080, 1680), 'DANS LA GRILLE')),
    'logo-v1': ('LE LOGO · VERSION 1 : T-CRAZY', 'Le badge rond, ici sur une miniature.', [('', 'logo-1')],
                ['Le nom de rappeur de Liam dans un badge rond bleu, glacé en haut.',
                 'Sa casquette posée dessus : on le reconnaît tout de suite.',
                 "Pas de nom de Stalak dans le logo : Stalak n'arrive qu'à la fin."], ('logo-1-seul', (90, 510, 990, 1410))),
    'logo-v2': ('LE LOGO · VERSION 2 : LE PROCHAIN', 'Le titre glacé, ici sur une miniature.', [('', 'logo-2')],
                ['« Le prochain », ce que Liam croit être, en grosses lettres bleues nappées de glace.',
                 "Dessous, l'accroche du narrateur : « 15 ans · 0 abonné ».",
                 "Pas de nom de Stalak dans le logo : Stalak n'arrive qu'à la fin."], ('logo-2-seul', (90, 510, 990, 1410))),
    'logo-v3': ('LE LOGO · VERSION 3 : 0 ABONNÉ', 'Le compteur gelé, ici sur une miniature.', [('', 'logo-3')],
                ['Un gros « 0 » en glace, avec ses glaçons, et « ABONNÉ » sur une étiquette bleue.',
                 "Le gag de la série en un coup d'œil : il n'a encore personne.",
                 "Pas de nom de Stalak dans le logo : Stalak n'arrive qu'à la fin."], ('logo-3-seul', (90, 510, 990, 1410))),
}
WAIT = 'new Promise(r => { const t = setInterval(() => { if (window.ready) { clearInterval(t); r(1); } }, 50); })'


def habillage(names):
    """Render the frames a board needs (if missing) and lay out the banner and logo boards : python3 tools/serie/univers.py habillage [logo-v2 …]"""
    import subprocess

    def frame(f):
        p = os.path.join(WORK, 'frames', f + '.png')
        if not os.path.exists(p):
            os.makedirs(os.path.dirname(p), exist_ok=True)
            subprocess.run([sys.executable, os.path.join(ROOT, 'tools/serie/shot.py'), 'tools/serie/engine/frame.html?f=' + f, p, '1080', '1920', WAIT], check=True)
        return p
    out = []
    for name in names or HABILLAGE_BOARDS:
        title, sub, scenes, traits, *close = HABILLAGE_BOARDS[name]
        paths = [(label, frame(f)) for label, f in scenes]
        if close:
            src, box, *label = close[0]
            out.append(decor_board(name, title, sub, paths, traits, crop=box, crop_src=frame(src), crop_label=(label or ['LE LOGO'])[0]))
        else:
            out.append(decor_board(name, title, sub, paths, traits))
    return out


def storyboard(eps):
    """The storyboard of each validated script (Studio Stalak, step « visuels ») : every shot drawn by engine/frame.html?f=<ep>-NN
    (storyboard.js), then one board per episode : python3 tools/serie/univers.py storyboard ep1 [ep2 …]"""
    import functools, http.server, threading
    os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
    from playwright.sync_api import sync_playwright

    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = 'http://127.0.0.1:%d/tools/serie/engine/frame.html' % srv.server_address[1]
    out = []
    with sync_playwright() as pw:
        b = pw.chromium.launch()
        pg = b.new_page(viewport={'width': 1080, 'height': 1920})
        pg.goto(base + '?f=bandeau-1-accroche')
        pg.wait_for_function('window.ready === true', timeout=30000)
        boards = pg.evaluate('JSON.parse(JSON.stringify(STORYBOARD.BOARDS))')
        for ep in eps:
            B = boards[ep]
            for sh in B['shots']:
                path = os.path.join(WORK, 'frames', sh['id'] + '.png')
                os.makedirs(os.path.dirname(path), exist_ok=True)
                pg.goto(base + '?f=' + sh['id'])
                pg.wait_for_function('window.ready === true', timeout=30000)
                pg.screenshot(path=path)
                sh['path'] = path
            # the board : 4 shots per row ; under each, the time, then the moment (two lines at most)
            n = len(B['shots']); cols = 4; rows = (n + cols - 1) // cols; tw, th = 270, 480
            W, H = 1200, 170 + rows * (th + 112) + 20
            img = Image.new('RGB', (W, H), SKY); d = ImageDraw.Draw(img)
            title = 'ÉPISODE %d · %s' % (B['num'], B['title'])
            f = font(FONT_TITLE, 52)
            while d.textlength(title, font=f) > W - 60: f = font(FONT_TITLE, f.size - 2)
            d.text((W // 2, 34), title, font=f, fill=SNOW, anchor='ma', stroke_width=7, stroke_fill=INK)
            d.text((W // 2, 112), B.get('note') or "Une image par moment du script. Les voix et l'animation viendront après ta validation.", font=font(FONT_TEXT, 24, 700), fill=ICE, anchor='ma')
            fc = font(FONT_TEXT, 21, 700)
            for i, sh in enumerate(B['shots']):
                x = 24 + (i % cols) * (tw + 24); y = 170 + (i // cols) * (th + 112)
                framed(img, Image.open(sh['path']).convert('RGB').resize((tw, th), Image.LANCZOS), x, y)
                d.text((x + tw // 2, y + th + 16), sh['t'], font=font(FONT_TITLE, 28), fill=ICE, anchor='ma', stroke_width=4, stroke_fill=INK)
                for k, ln in enumerate(wrap(d, sh['cap'], fc, tw + 10)[:2]):
                    d.text((x + tw // 2, y + th + 52 + k * 26), ln, font=fc, fill=SNOW, anchor='ma')
            dst = os.path.join(WORK, 'planches', 'storyboard-%s.jpg' % ep)
            img.save(dst, quality=90)
            out.append(dst)
        b.close()
    srv.shutdown()
    return out


if __name__ == '__main__':
    if sys.argv[1:2] == ['habillage']:
        print(*habillage(sys.argv[2:]), sep='\n')
        sys.exit(0)
    if sys.argv[1:2] == ['storyboard']:
        print(*storyboard(sys.argv[2:]), sep='\n')
        sys.exit(0)
    if sys.argv[1:2] == ['decors']:
        print(*decors(sys.argv[2:]), sep='\n')
        sys.exit(0)
    print('usage : SERIE_WORK=<dir> python3 tools/serie/univers.py decors|habillage [board …]  (all the boards by default)')
    sys.exit(0)
