"""Test of the app's links since English moved to the main address (01/11: / in English, /fr/ in French), and, since the
ads are gone (owner, 06/11), that the app never loads any Google ad or consent script. Python Playwright (chromium).

    python3 /abs/path/tests/ui/liens_cmp_ui.py <path of a built public/ folder> [folder for screenshots]

Links: every link of the app page (footer, account page, plans page…), in both languages, leads to a page of the built
site that exists, never to an old address (/en/…, /tarifs, /conditions…, which the server sends on with a 301). The FR / EN
switch puts the address on / or /fr/ (and the canonical address and the manifest), without reloading: the work stays.
Footer: « Gérer les cookies » and « Your Privacy Choices » are plain links to the privacy page (no window in the app any more).
No Google ad script (doubleclick, googlesyndication, Funding Choices) at any moment, even after a video is made.
An iPhone (iPhone 15 Pro emulated) and a computer, in French and English."""
import functools, http.server, os, re, shutil, sys, tempfile, threading
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.sync_api import sync_playwright

PUBLIC = os.path.abspath(sys.argv[1])
SHOTS = sys.argv[2] if len(sys.argv) > 2 else None
results = []
PW = None
OLD = re.compile(r'^/(en(/|$)|tarifs|conditions|remboursement|confidentialite|mentions-legales|alternative-triller)')

class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


def check(name, ok, info=''):
    ok = bool(ok); results.append(ok)
    print(('PASS ' if ok else 'FAIL ') + name + (('  — ' + str(info)) if info and not ok else ''))


def ev(pg, code):
    return pg.evaluate('s => __ev(s)', code)


def page_exists(path):
    """the built page a path leads to on Cloudflare Pages (/pricing → pricing.html, /fr/ → fr/index.html)"""
    p = path.split('#')[0].split('?')[0]
    if p.endswith('/'): p += 'index.html'
    f = os.path.join(PUBLIC, p.lstrip('/'))
    return os.path.isfile(f) or os.path.isfile(f + '.html')


def links(pg):
    return pg.evaluate("() => [...document.querySelectorAll('a[href]')].map(a => a.getAttribute('href')).filter(h => h.startsWith('/'))")


def ctx_page(b, base, lang, iphone):
    opts = dict(PW.devices['iPhone 15 Pro']) if iphone else {'viewport': {'width': 1280, 'height': 860}}
    ctx = b.new_context(**opts, locale='en-US' if lang == 'en' else 'fr-FR')
    google = []
    def googleish(r):
        google.append(r.request.url); r.fulfill(status=404, body='')
    ctx.route(re.compile(r'.*(fundingchoicesmessages\.google\.com|googlesyndication\.com|doubleclick\.net).*'), googleish)
    ctx.route('**/api/**', lambda r: r.fulfill(status=404, body=''))
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.goto(base + ('fr/' if lang == 'fr' else ''), wait_until='load'); pg.wait_for_function('typeof window.__ev === "function"', timeout=20000)
    return ctx, pg, errs, google


def run(b, base, lang, iphone):
    tag = ('iPhone' if iphone else 'ordinateur') + ' ' + lang
    ctx, pg, errs, google = ctx_page(b, base, lang, iphone)
    pg.on('pageerror', lambda e: None)
    want_path = '/fr/' if lang == 'fr' else '/'
    # ---- links of the page, in its language ----
    hs = links(pg)
    bad = sorted(set(h for h in hs if OLD.match(h) or not page_exists(h)))
    check(tag + ' : tous les liens de la page mènent à une page qui existe, aucune ancienne adresse (%d liens)' % len(hs), not bad and len(hs) > 8, bad)
    want = ['/fr/tarifs', '/fr/conditions', '/fr/remboursement', '/fr/confidentialite'] if lang == 'fr' else ['/pricing', '/terms', '/refunds', '/privacy']
    check(tag + ' : Tarifs, conditions, remboursement, confidentialité dans la bonne langue', all(w in hs for w in want), sorted(set(hs)))
    check(tag + ' : pas de script Google à l’ouverture', not google, google)
    # ---- the FR / EN switch: the address follows, the work stays ----
    pg.locator('#demoBtn').click(); pg.wait_for_function('() => __ev("S.step === 4 && S.cuts.length > 0")', timeout=60000)
    pg.evaluate("() => history.replaceState(null, '', location.pathname + '#compte')")
    other = 'en' if lang == 'fr' else 'fr'
    pg.locator('#siteFoot .langsw button[data-lang="%s"]' % other).click(); pg.wait_for_timeout(300)
    st = pg.evaluate("""() => [location.pathname, location.hash, document.querySelector('link[rel="canonical"]').href, document.querySelector('link[rel="manifest"]').getAttribute('href'), document.documentElement.lang]""")
    o_path = '/fr/' if other == 'fr' else '/'
    check(tag + ' : FR / EN : l’adresse passe sur %s (canonique, manifeste, #compte gardé), sans recharger' % o_path,
          st == [o_path, '#compte', 'https://stalak.app' + o_path, '/fr/manifest.webmanifest' if other == 'fr' else '/manifest.webmanifest', other] and ev(pg, 'S.step === 4 && S.cuts.length > 0'), st)
    hs2 = links(pg)
    want2 = ['/fr/tarifs', '/fr/conditions'] if other == 'fr' else ['/pricing', '/terms', '/privacy']
    bad2 = sorted(set(h for h in hs2 if OLD.match(h) or not page_exists(h)))
    check(tag + ' : après le changement de langue, liens dans la nouvelle langue, tous valides', not bad2 and all(w in hs2 for w in want2), (bad2, sorted(set(hs2))[:12]))
    pg.locator('#siteFoot .langsw button[data-lang="%s"]' % lang).click(); pg.wait_for_timeout(200)
    check(tag + ' : retour à la langue de départ : %s' % want_path, pg.evaluate('location.pathname') == want_path)
    pg.evaluate("() => history.replaceState(null, '', location.pathname)")
    # ---- footer: « Gérer les cookies » and « Your Privacy Choices » ----
    ck, pc = pg.locator('#siteFoot a[data-ck]'), pg.locator('#siteFoot a[data-pc]')
    ck_txt, pc_txt = ('Cookie settings', 'Your Privacy Choices') if lang == 'en' else ('Gérer les cookies', 'Your Privacy Choices')
    check(tag + ' : pied de page : « %s » et « %s »' % (ck_txt, pc_txt), ck.count() == 1 and pc.count() == 1 and ck.inner_text() == ck_txt and pc.inner_text() == pc_txt)
    cookies_href = '/privacy#cookies' if lang == 'en' else '/fr/confidentialite#cookies'
    prevented = pg.evaluate("() => { const a = document.querySelector('#siteFoot a[data-ck]'); const e = new MouseEvent('click', { bubbles: true, cancelable: true }); a.addEventListener('click', ev => ev.preventDefault(), { once: true }); const r = !a.dispatchEvent(e); return [a.getAttribute('href'), window.__revoked || 0]; }")
    check(tag + ' : sans outil certifié, « Gérer les cookies » mène à la confidentialité (cookies)', prevented == [cookies_href, 0] and page_exists(cookies_href), prevented)
    # Your Privacy Choices: a plain link to the privacy page (no ad, nothing to choose in the app any more: 06/11)
    pc_href = '/privacy#choices' if lang == 'en' else '/fr/confidentialite#cookies'
    prevented = pg.evaluate("() => { const a = document.querySelector('#siteFoot a[data-pc]'); const e = new MouseEvent('click', { bubbles: true, cancelable: true }); a.addEventListener('click', ev => ev.preventDefault(), { once: true }); const r = a.dispatchEvent(e); return [a.getAttribute('href'), document.querySelectorAll('#pcAsk').length]; }")
    check(tag + ' : « Your Privacy Choices » mène à la page Confidentialité, plus de fenêtre dans l’app', prevented == [pc_href, 0] and page_exists(pc_href), prevented)
    # no ad any more: after a video is made, still no Google script, no ad button
    ev(pg, "beginExport = () => { window.__began = true; throw new Error('test : export arrêté ici'); }")
    pg.evaluate('() => { try { __ev("exportOne()").catch(() => {}); } catch(e){} }'); pg.wait_for_timeout(500)
    check(tag + ' : aucun script de pub ni de consentement Google, même après une vidéo ; plus de bouton pub', not google and pg.locator('#adBtn').count() == 0
          and ev(pg, "typeof CMP_ON === 'undefined' && typeof AD_UNIT === 'undefined'"), google)
    sw = pg.evaluate('document.documentElement.scrollWidth')
    check(tag + ' : pas de défilement horizontal', sw <= pg.viewport_size['width'], sw)
    check(tag + ' : aucune erreur dans la page', not [e for e in errs if 'test : export arrêté ici' not in e], errs)
    ctx.close()


def site_pages(b, base):
    """the site's own pages (pricing, legal): their links, and « Cookie settings » / « Gérer les cookies » in their footer"""
    ctx = b.new_context(viewport={'width': 1280, 'height': 860}); pg = ctx.new_page()
    for path in ['/pricing', '/terms', '/refunds', '/privacy', '/legal-notice', '/fr/tarifs', '/fr/conditions', '/fr/remboursement', '/fr/confidentialite', '/fr/mentions-legales']:
        f = path.lstrip('/') + '.html'
        pg.goto(base + f, wait_until='load')
        hs = links(pg)
        bad = sorted(set(h for h in hs if OLD.match(h) or not page_exists(h)))
        fl = pg.evaluate("() => [...document.querySelectorAll('footer a')].map(a => [a.textContent, a.getAttribute('href')])")
        want = ['Gérer les cookies', '/fr/confidentialite#cookies'] if path.startswith('/fr/') else ['Cookie settings', '/privacy#cookies']
        check('site %s : liens valides, « %s » en bas de page' % (path, want[0]), not bad and want in fl, (bad, fl))
    ctx.close()


def main():
    tmp = tempfile.mkdtemp(prefix='stalak-liens-')
    site = os.path.join(tmp, 'site'); shutil.copytree(PUBLIC, site)
    for page in ('index.html', 'fr/index.html'):
        p = os.path.join(site, page); html = open(p, encoding='utf-8').read()
        assert 'applyLang();\n})();' in html, 'repère de la sonde introuvable'
        open(p, 'w', encoding='utf-8').write(html.replace('applyLang();\n})();', 'applyLang();\nwindow.__ev = (s) => eval(s);\n})();'))
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=site))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = 'http://127.0.0.1:%d/' % srv.server_address[1]
    with sync_playwright() as p:
        b = p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
        global PW; PW = p
        for lang in ('en', 'fr'):
            for iphone in (True, False):
                try: run(b, base, lang, iphone)
                except Exception as e: check(('iPhone' if iphone else 'ordinateur') + ' ' + lang + ' : déroulé complet', False, str(e)[:300])
        try: site_pages(b, base)
        except Exception as e: check('pages du site : déroulé complet', False, str(e)[:300])
        b.close()
    srv.shutdown(); shutil.rmtree(tmp, ignore_errors=True)
    print('%d/%d réussis' % (sum(results), len(results)))
    sys.exit(0 if all(results) else 1)


main()
