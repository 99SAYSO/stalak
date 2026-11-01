"""Test of the footer (owner, 01/11; src/footer.py + src/footer.css): the same on every page — the app (/ and /fr/), Pricing,
the legal pages, the 6 guides, the Triller page — in French and English, and its light version in the claude.ai page.
Python Playwright (chromium).

    python3 /abs/path/tests/ui/pied_de_page_ui.py <built public/ folder> [claude.ai page (shuffle-lab.html)] [folder for screenshots]

On an iPhone (iPhone 15 Pro emulated) and a computer. Checked: one full-width ink band at the very bottom (never fixed), 4 columns
on a computer and stacked on a phone, the same links on every page of a language and only our own sites, every link leads to a
page that exists, Français / English to the same page, the bottom line; in the app: the help ice cube and the Export button never
cover a link, the language switch writes the footer again (and still works), « Gérer les cookies » and « Your Privacy Choices »."""
import functools, http.server, os, re, shutil, sys, tempfile, threading
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.sync_api import sync_playwright

PUBLIC = os.path.abspath(sys.argv[1])
LITE = os.path.abspath(sys.argv[2]) if len(sys.argv) > 2 and sys.argv[2] != '-' else None
SHOTS = sys.argv[3] if len(sys.argv) > 3 else None
results = []
OURS = ('https://www.instagram.com/stalak_app/', 'https://www.tiktok.com/@stalak_app')
EN_PAGES = ['/', '/pricing', '/terms', '/refunds', '/privacy', '/legal-notice', '/triller-alternative', '/lip-sync-video-editor',
            '/music-video-maker-for-rappers', '/rap-snippet-video', '/lip-sync-videos-for-singers', '/how-to-make-a-lip-sync-video', '/edit-video-to-the-beat']
FR_PAGES = ['/fr/', '/fr/tarifs', '/fr/conditions', '/fr/remboursement', '/fr/confidentialite', '/fr/mentions-legales', '/fr/alternative-triller']
OTHER = dict([('/fr/', '/'), ('/fr/tarifs', '/pricing'), ('/fr/conditions', '/terms'), ('/fr/remboursement', '/refunds'), ('/fr/confidentialite', '/privacy'),
              ('/fr/mentions-legales', '/legal-notice'), ('/fr/alternative-triller', '/triller-alternative')])
OTHER.update({v: k for k, v in list(OTHER.items())})
HEADS = {'fr': ['Produit', 'Légal', 'Tes choix'], 'en': ['Product', 'Legal', 'Your choices']}
MUST = {'fr': ['/fr/tarifs', '/fr/alternative-triller', '/fr/conditions', '/fr/remboursement', '/fr/confidentialite', '/fr/mentions-legales'],
        'en': ['/pricing', '/triller-alternative', '/terms', '/refunds', '/privacy', '/legal-notice']}
GUIDES = ['/lip-sync-video-editor', '/music-video-maker-for-rappers', '/rap-snippet-video', '/lip-sync-videos-for-singers',
          '/how-to-make-a-lip-sync-video', '/edit-video-to-the-beat']
BOTTOM = '© 2026 Stalak · Made by 99Sayso'


class Quiet(http.server.SimpleHTTPRequestHandler):
    """serves /pricing from pricing.html, like the real site"""
    def log_message(self, *a): pass
    def send_head(self):
        p = self.translate_path(self.path)
        if not os.path.exists(p) and os.path.exists(p + '.html'): self.path = self.path.split('?')[0].split('#')[0] + '.html'
        return super().send_head()


def check(name, ok, info=''):
    results.append(ok)
    print(('PASS ' if ok else 'FAIL ') + name + (('  — ' + str(info)) if info and not ok else ''))


def page_exists(site, href):
    u = href.split('#')[0].split('?')[0]
    if u.endswith('/'): return os.path.exists(os.path.join(site, u.strip('/'), 'index.html') if u.strip('/') else os.path.join(site, 'index.html'))
    return os.path.exists(os.path.join(site, u.lstrip('/') + '.html'))


FOOT_JS = """() => {
  const f = document.querySelector('footer.ft'), r = f.getBoundingClientRect(), cs = getComputedStyle(f);
  const links = [...f.querySelectorAll('a')].filter(a => !a.closest('.langsw')).map(a => a.getAttribute('href'));
  const langs = [...f.querySelectorAll('.langsw a, .langsw button')].map(a => a.getAttribute('href') || a.dataset.lang);
  const cols = [...f.querySelectorAll('.ft-col')].map(c => { const b = c.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top)]; });
  return { n: document.querySelectorAll('footer').length, pos: cs.position, anim: cs.animationName, bg: cs.backgroundColor,
           left: r.left, width: r.width, vw: document.documentElement.clientWidth, bottom: r.bottom + scrollY, doc: document.documentElement.scrollHeight,
           sw: document.documentElement.scrollWidth, links, langs, cols, heads: [...f.querySelectorAll('.ft-h')].map(h => h.textContent),
           bottomTxt: f.querySelector('.ft-bottom').textContent, tag: f.querySelector('.ft-tag').textContent,
           ck: !!f.querySelector('a[data-ck]'), pc: (f.querySelector('a[data-pc]') || {}).textContent,
           icicles: getComputedStyle(f, '::before').backgroundImage.includes('svg') };
}"""


def links_of(d):
    return d['links']


def static_page(b, base, site, url, lang, iphone, ref):
    tag = ('iPhone' if iphone else 'ordinateur') + ' ' + url
    ctx = b.new_context(**(dict(PW.devices['iPhone 15 Pro']) if iphone else {'viewport': {'width': 1366, 'height': 860}}))
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.goto(base + url, wait_until='load'); pg.wait_for_timeout(300)
    pg.evaluate('window.scrollTo(0, document.documentElement.scrollHeight)'); pg.wait_for_timeout(300)
    d = pg.evaluate(FOOT_JS)
    check(tag + ' : un seul pied de page, bande pleine largeur fond encre, glaçons en haut', d['n'] == 1 and abs(d['left']) < 1 and abs(d['width'] - d['vw']) < 1
          and d['bg'] == 'rgb(10, 13, 20)' and d['icicles'], d)
    check(tag + ' : pas fixe, tout en bas de la page, sans animation', d['pos'] in ('relative', 'static') and abs(d['bottom'] - d['doc']) < 2 and d['anim'] == 'none', d)
    check(tag + ' : textes dans la langue de la page', d['heads'] == HEADS[lang] and d['bottomTxt'] == BOTTOM and ('rythme' in d['tag'] if lang == 'fr' else 'beat' in d['tag']), (d['heads'], d['tag']))
    ls = links_of(d)
    check(tag + ' : Tarifs, les 6 guides, la page Triller, les 4 pages légales, cookies, Your Privacy Choices, Instagram, TikTok',
          all(m in ls for m in MUST[lang] + GUIDES) and all(o in ls for o in OURS) and d['ck'] and d['pc'] == 'Your Privacy Choices', ls)
    bad = [h for h in d['links'] + [x for x in d['langs'] if x.startswith('/')] if not (h in OURS or (h.startswith('/') and not h.startswith('//') and page_exists(site, h)))]
    check(tag + ' : seulement nos sites, chaque lien mène à une page qui existe', not bad, bad)
    want = (url, OTHER.get(url, '/fr/')) if lang == 'fr' else (OTHER.get(url, '/fr/'), url)
    check(tag + ' : Français / English vers la même page dans l’autre langue', d['langs'] == list(want), (d['langs'], want))
    if ref is not None: check(tag + ' : mêmes liens que le pied de page de l’app', ls == ref, (ls, ref))
    cols = d['cols']
    if iphone: check(tag + ' : téléphone : colonnes empilées', len(cols) == 4 and len({c[0] for c in cols}) == 1 and all(cols[i][1] < cols[i + 1][1] for i in range(3)), cols)
    else: check(tag + ' : ordinateur : 4 colonnes côte à côte', len(cols) == 4 and len({c[1] for c in cols}) == 1 and all(cols[i][0] < cols[i + 1][0] for i in range(3)), cols)
    check(tag + ' : pas de défilement horizontal', d['sw'] <= d['vw'], (d['sw'], d['vw']))
    check(tag + ' : aucune erreur dans la page', not errs, errs)
    ctx.close()


def overlap(a, b):
    return a and b and a['x'] < b['x'] + b['width'] and b['x'] < a['x'] + a['width'] and a['y'] < b['y'] + b['height'] and b['y'] < a['y'] + a['height']


def app(b, base, site, lang, iphone):
    tag = ('iPhone' if iphone else 'ordinateur') + ' app ' + lang
    ctx = b.new_context(**(dict(PW.devices['iPhone 15 Pro']) if iphone else {'viewport': {'width': 1366, 'height': 860}}), locale='fr-FR' if lang == 'fr' else 'en-US')
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    url = '/fr/' if lang == 'fr' else '/'
    pg.goto(base + url, wait_until='load'); pg.wait_for_function('typeof window.__ev === "function"', timeout=20000)
    d = pg.evaluate(FOOT_JS)
    ref = links_of(d)
    check(tag + ' : un seul pied de page, bande pleine largeur fond encre, pas fixe, tout en bas', d['n'] == 1 and abs(d['left']) < 1 and abs(d['width'] - d['vw']) < 1
          and d['bg'] == 'rgb(10, 13, 20)' and d['pos'] in ('relative', 'static') and abs(d['bottom'] - d['doc']) < 2, d)
    check(tag + ' : textes et liens', d['heads'] == HEADS[lang] and d['bottomTxt'] == BOTTOM and all(m in ref for m in MUST[lang] + GUIDES + list(OURS)) and d['ck'] and d['pc'] == 'Your Privacy Choices', (d['heads'], ref))
    bad = [h for h in d['links'] + [x for x in d['langs'] if x.startswith('/')] if not (h in OURS or (h.startswith('/') and page_exists(site, h)))]
    check(tag + ' : seulement nos sites, chaque lien mène à une page qui existe', not bad, bad)
    cols = d['cols']
    if iphone: check(tag + ' : téléphone : colonnes empilées', len({c[0] for c in cols}) == 1 and all(cols[i][1] < cols[i + 1][1] for i in range(3)), cols)
    else: check(tag + ' : ordinateur : 4 colonnes côte à côte', len({c[1] for c in cols}) == 1, cols)
    # the help ice cube and the Export button, at the very bottom of the page (video ready, Export button off the screen)
    pg.locator('#demoBtn').click(); pg.wait_for_function('() => __ev("S.step === 4 && S.cuts.length > 0")', timeout=60000)
    pg.wait_for_timeout(1500)
    pg.evaluate('window.scrollTo(0, document.documentElement.scrollHeight)'); pg.wait_for_timeout(900)
    fab = pg.locator('#expFab'); cube = pg.locator('#helpBtn').bounding_box()
    fb = fab.bounding_box() if fab.count() and fab.is_visible() else None
    boxes = pg.evaluate("() => [...document.querySelectorAll('#siteFoot a, #siteFoot button, #siteFoot .ft-bottom, #siteFoot .ft-tag')].map(e => { const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, width: r.width, height: r.height }; })")
    hit = [bx for bx in boxes if overlap(bx, cube) or overlap(bx, fb)]
    check(tag + ' : en bas de la page, la bulle d’aide et le bouton Exporter ne cachent aucun lien' + (' (bouton Exporter affiché)' if fb else ''), not hit, (hit, cube, fb))
    if SHOTS: pg.screenshot(path=os.path.join(SHOTS, 'pied-app-' + ('iphone' if iphone else 'ordi') + '-' + lang + '.png'))
    # the language switch of the footer: the address follows, the footer is written again, the work stays
    other = 'en' if lang == 'fr' else 'fr'
    pg.locator('#siteFoot .langsw button[data-lang="%s"]' % other).click(); pg.wait_for_timeout(300)
    d2 = pg.evaluate(FOOT_JS)
    check(tag + ' : FR / EN du pied de page : tout le pied de page passe dans l’autre langue, le montage reste',
          d2['heads'] == HEADS[other] and all(m in d2['links'] for m in MUST[other]) and pg.evaluate('location.pathname') == ('/fr/' if other == 'fr' else '/')
          and pg.evaluate('document.querySelector(\'#siteFoot .langsw button[aria-pressed="true"]\').dataset.lang') == other and pg.evaluate('() => __ev("S.step === 4 && S.cuts.length > 0")'), d2['heads'])
    pg.locator('#siteFoot .langsw button[data-lang="%s"]' % lang).click(); pg.wait_for_timeout(300)
    check(tag + ' : … et revient (le sélecteur marche encore après avoir été réécrit)', pg.evaluate(FOOT_JS)['heads'] == HEADS[lang] and pg.evaluate('location.pathname') == url)
    pg.locator('#siteFoot a[data-pc]').click(); pg.wait_for_selector('#pcAsk:not([hidden])', timeout=3000)
    check(tag + ' : « Your Privacy Choices » ouvre la fenêtre, après le changement de langue', pg.locator('#pcAsk').is_visible())
    pg.keyboard.press('Escape')
    check(tag + ' : aucune erreur dans la page', not errs, errs)
    ctx.close()
    return ref


def lite(b):
    for iphone in (True, False):
        tag = ('iPhone' if iphone else 'ordinateur') + ' claude.ai'
        ctx = b.new_context(**(dict(PW.devices['iPhone 15 Pro']) if iphone else {'viewport': {'width': 1366, 'height': 860}}), locale='fr-FR')
        pg = ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
        pg.goto('file://' + LITE, wait_until='load'); pg.wait_for_timeout(1500)
        d = pg.evaluate(FOOT_JS)
        check(tag + ' : pied de page léger (marque, langue, dernière ligne), aucun lien vers des pages qui n’existent pas ici',
              d['n'] == 1 and d['heads'] == ['Tes choix'] and d['bottomTxt'] == BOTTOM and all(h in OURS for h in d['links']) and abs(d['width'] - d['vw']) < 1, d)
        pg.locator('#siteFoot .langsw button[data-lang="en"]').click(); pg.wait_for_timeout(300)
        d = pg.evaluate(FOOT_JS)
        check(tag + ' : en anglais', d['heads'] == ['Your choices'] and 'beat' in d['tag'], d['heads'])
        check(tag + ' : aucune erreur dans la page', not errs, errs)
        ctx.close()


def main():
    global PW
    tmp = tempfile.mkdtemp(prefix='stalak-pied-')
    site = os.path.join(tmp, 'site'); shutil.copytree(PUBLIC, site)
    for page in ('index.html', 'fr/index.html'):
        p = os.path.join(site, page); html = open(p, encoding='utf-8').read()
        assert 'applyLang();\n})();' in html, 'repère de la sonde introuvable'
        open(p, 'w', encoding='utf-8').write(html.replace('applyLang();\n})();', 'applyLang();\nwindow.__ev = (s) => eval(s);\n})();'))
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=site))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = 'http://127.0.0.1:%d' % srv.server_address[1]
    with sync_playwright() as p:
        PW = p
        b = p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'])
        for iphone in (True, False):
            for lang, pages in (('fr', FR_PAGES), ('en', EN_PAGES)):
                ref = None
                try: ref = app(b, base, site, lang, iphone)
                except Exception as e: check(('iPhone' if iphone else 'ordinateur') + ' app ' + lang + ' : déroulé complet', False, str(e)[:300])
                for u in pages[1:]:
                    try: static_page(b, base, site, u, lang, iphone, ref)
                    except Exception as e: check(u + ' : déroulé complet', False, str(e)[:300])
        if LITE: lite(b)
        b.close()
    srv.shutdown(); shutil.rmtree(tmp, ignore_errors=True)
    print('%d/%d réussis' % (sum(results), len(results)))
    sys.exit(0 if all(results) else 1)


main()
