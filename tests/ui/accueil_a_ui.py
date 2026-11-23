"""Test of the first screen under 900 px (« maquette A », owner, 23/11). Python Playwright (chromium).

    python3 /abs/path/tests/ui/accueil_a_ui.py <built public/ folder> [folder for screenshots]

Phone (iPhone 12: 664 px seen, iPhone SE: 568 px) and tablet (768 px), while no song is imported: everything centred, in this
order: the mascot (about 90 px wide), the title on 2 lines, the short sentence, one big black button « Choisir mon son » (it
opens the file choice), « Voir un exemple » as an underlined link with a small round ▶ (it loads the example), the white pill
« ★★★★★ 4,7/5 · 275 vidéos montées » (the note from site_src/avis.json, the number from /api/stats/exports; the number
missing: the note alone). No small video, no « mode Clip » pill, one mascot only. The button stays in the first screen of an
iPhone SE. A computer (1280 px) is unchanged: none of this. French and English, no sideways scrolling, no error."""
import functools, http.server, json, os, shutil, sys, tempfile, threading
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.sync_api import sync_playwright

PUBLIC = os.path.abspath(sys.argv[1])
SHOTS = sys.argv[2] if len(sys.argv) > 2 else None
results = []
AVIS = json.load(open(os.path.join(PUBLIC, 'avis.json'), encoding='utf-8'))
MEAN = sum(float(r['note']) for r in AVIS) / len(AVIS)
T = {'fr': {'h1': ['Ton son est prêt.', 'Ton snippet, pas encore ?'], 's': 'Filme quelques prises. Stalak les coupe sur le rythme, lèvres synchro.', 'song': 'Choisir mon son', 'demo': 'Voir un exemple',
            'note': ('%.1f' % MEAN).replace('.', ',') + '/5', 'vids': '275 vidéos montées'},
     'en': {'h1': ['Your song is done.', 'Where’s the snippet?'], 's': 'Film a few takes. Stalak cuts them on the beat, lips in sync.', 'song': 'Choose my song', 'demo': 'See an example',
            'note': ('%.1f' % MEAN) + '/5', 'vids': '275 videos made'}}
JS = """() => { const q = s => document.querySelector(s), r = s => { const e = q(s); if (!e) return null; const b = e.getBoundingClientRect(); return b.width ? { y: Math.round(b.top), b: Math.round(b.bottom), w: Math.round(b.width), cx: Math.round(b.left + b.width / 2) } : null; };
  const h = q('.hero-h1'), rg = document.createRange(); rg.selectNodeContents(h); const lines = [...new Set([...rg.getClientRects()].map(x => Math.round(x.top)))].length;
  const card = q('#p1 > .card:not(.lpoffer)');
  return { vh: innerHeight, vw: innerWidth, sw: document.documentElement.scrollWidth, m: r('.hero-m'), h1: r('.hero-h1'), s2: r('.hero-s2'), s1: r('.hero-s:not(.hero-s2)'), song: r('#heroSong'), demo: r('#heroDemo'), pill: r('#heroProof'),
    v: r('.hero-v'), clip: r('#heroClip'), lines, h1t: h.innerText.trim().split('\\n').map(x => x.trim()), s2t: q('.hero-s2').textContent.trim(), songT: q('#heroSong').textContent.trim(), demoT: q('#heroDemo').textContent.trim(),
    pillT: q('#heroProof').hidden ? null : q('#hpStars').textContent + ' ' + q('#hpTxt').textContent, songBg: getComputedStyle(q('#heroSong')).backgroundColor, demoLine: getComputedStyle(q('#heroDemo span')).textDecorationLine,
    demoDot: !!q('#heroDemo i svg') && getComputedStyle(q('#heroDemo i')).borderRadius, pillBg: getComputedStyle(q('#heroProof')).backgroundColor,
    cardM: getComputedStyle(card, '::after').display, mBg: getComputedStyle(q('.hero-m')).backgroundImage.slice(0, 4) }; }"""


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


def check(name, ok, info=''):
    results.append(bool(ok))
    print(('PASS ' if ok else 'FAIL ') + name + (('  — ' + str(info)) if info and not ok else ''), flush=True)


def page(b, base, lang, dev, PW, total=True):
    opts = dict(PW.devices[dev]) if dev in PW.devices else {'viewport': {'width': 1280, 'height': 860} if dev == 'ordinateur' else {'width': 768, 'height': 1024}}
    ctx = b.new_context(**opts, locale='en-US' if lang == 'en' else 'fr-FR')
    ctx.route('**/api/**', lambda r: r.fulfill(status=204, body=''))
    ctx.route('**/api/stats/exports', (lambda r: r.fulfill(status=200, content_type='application/json', body='{"total":275}')) if total else (lambda r: r.fulfill(status=500, body='')))
    pg = ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.goto(base + ('' if lang == 'en' else 'fr/'), wait_until='load'); pg.wait_for_function('window.__ev && window.MP4Box', timeout=60000); pg.wait_for_timeout(1800)
    return ctx, pg, errs


def run(b, base, lang, dev, PW):
    tag = dev + ' ' + lang; t = T[lang]
    ctx, pg, errs = page(b, base, lang, dev, PW)
    L = pg.evaluate(JS)
    if dev == 'ordinateur':
        check(tag + ' : ordinateur inchangé : ni mascotte en haut, ni phrase courte, ni boutons, ni pastille ; la mascotte reste sur la carte',
              not L['m'] and not L['s2'] and not L['song'] and not L['demo'] and not L['pill'] and L['s1'] and L['cardM'] != 'none', L)
    else:
        mid = L['vw'] / 2; items = [L['m'], L['h1'], L['s2'], L['song'], L['demo'], L['pill']]
        check(tag + ' : dans l’ordre : mascotte, titre, phrase, bouton, lien, pastille', all(items) and all(items[i]['b'] <= items[i + 1]['y'] + 6 for i in range(5)), items)
        check(tag + ' : tout centré', all(items) and all(abs(x['cx'] - mid) <= 2 for x in items), [x and x['cx'] for x in items])
        check(tag + ' : la mascotte qui fait coucou, environ 90 px de large (64 px sur un petit écran)', L['m'] and (L['m']['w'] == 90 or (L['vh'] <= 600 and L['m']['w'] == 64)) and L['mBg'] == 'url(', L['m'])
        check(tag + ' : le titre sur 2 lignes', L['lines'] == 2 and L['h1t'] == t['h1'], (L['lines'], L['h1t']))
        check(tag + ' : la phrase courte (la longue n’est pas affichée)', L['s2t'] == t['s'] and not L['s1'], (L['s2t'], L['s1']))
        check(tag + ' : un seul gros bouton noir « %s », dans le premier écran sans défiler (%d px)' % (t['song'], L['vh']), L['songT'] == t['song'] and L['songBg'] == 'rgb(10, 13, 20)' and L['song']['b'] <= L['vh']
              and L['song']['b'] - L['song']['y'] >= 56 and pg.evaluate('scrollY') == 0, (L['song'], L['songBg'], L['vh']))
        check(tag + ' : « %s » en lien souligné avec un petit rond ▶, d’au moins 44 px' % t['demo'], L['demoT'] == t['demo'] and 'underline' in L['demoLine'] and L['demoDot'] == '50%' and L['demo']['b'] - L['demo']['y'] >= 44, (L['demoT'], L['demoLine'], L['demoDot'], L['demo']))
        check(tag + ' : la pastille blanche : étoiles, « %s · %s » (vrais chiffres)' % (t['note'], t['vids']), L['pillT'] == '★★★★★ ' + t['note'] + ' · ' + t['vids'] and L['pillBg'] == 'rgb(255, 255, 255)', (L['pillT'], L['pillBg']))
        check(tag + ' : plus de petite vidéo ni de pastille « mode Clip » ; une seule mascotte (celle de la carte cachée)', not L['v'] and not L['clip'] and L['cardM'] == 'none', (L['v'], L['clip'], L['cardM']))
        if SHOTS: pg.screenshot(path=os.path.join(SHOTS, 'accueilA-%s-%s.png' % (dev.replace(' ', '').lower(), lang)))
        with pg.expect_file_chooser(timeout=5000) as fc: pg.locator('#heroSong').click()
        check(tag + ' : « %s » ouvre le choix du fichier du son' % t['song'], fc.value.element.evaluate('e => e.id') == 'songFile')
        pg.locator('#heroDemo').click(); pg.wait_for_function('() => __ev("S.step === 4 && S.cuts.length > 0")', timeout=180000)
        check(tag + ' : « %s » lance l’exemple' % t['demo'], pg.evaluate('s => __ev(s)', '!!(S.song && S.song.demo)'))
        pg.evaluate('s => __ev(s)', 'go(1)'); pg.wait_for_timeout(400)
        L2 = pg.evaluate(JS)
        check(tag + ' : un son chargé : le haut s’en va', not L2['m'] and not L2['song'] and not L2['pill'], L2)
    check(tag + ' : pas de défilement de côté', L['sw'] <= L['vw'], L['sw'])
    check(tag + ' : aucune erreur dans la page', not errs, errs)
    ctx.close()


def main():
    tmp = tempfile.mkdtemp(prefix='stalak-accA-')
    site = os.path.join(tmp, 'site'); shutil.copytree(PUBLIC, site)
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from _probe import add_probe; add_probe(site)
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=site))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = 'http://127.0.0.1:%d/' % srv.server_address[1]
    with sync_playwright() as p:
        b = p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'])
        for lang, dev in (('fr', 'iPhone 12'), ('en', 'iPhone 12'), ('fr', 'iPhone SE'), ('en', 'iPhone SE'), ('fr', 'tablette'), ('fr', 'ordinateur'), ('en', 'ordinateur')):
            try: run(b, base, lang, dev, p)
            except Exception as e: check(dev + ' ' + lang + ' : déroulé complet', False, str(e)[:400])
        # the number does not load: the note alone
        ctx, pg, errs = page(b, base, 'fr', 'iPhone 12', p, total=False)
        L = pg.evaluate(JS)
        check('iPhone 12 fr : le total ne se charge pas : la pastille montre seulement la note', L['pillT'] == '★★★★★ ' + T['fr']['note'], L['pillT'])
        ctx.close()
        b.close()
    srv.shutdown(); shutil.rmtree(tmp, ignore_errors=True)
    print('%d/%d réussis' % (sum(results), len(results)))
    sys.exit(0 if all(results) else 1)


main()
