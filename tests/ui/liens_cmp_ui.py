"""Test of the app's links since English moved to the main address (01/11: / in English, /fr/ in French) and of the
consent for the rewarded ad (Juridique: STATUS « bandeau de consentement (CMP) », privacy page). Python Playwright (chromium).

    python3 /abs/path/tests/ui/liens_cmp_ui.py <path of a built public/ folder> [folder for screenshots]

Links: every link of the app page (footer, account page, plans page…), in both languages, leads to a page of the built
site that exists, never to an old address (/en/…, /tarifs, /conditions…, which the server sends on with a 301). The FR / EN
switch puts the address on / or /fr/ (and the canonical address and the manifest), without reloading: the work stays.
Consent: no Google script before « Regarder une pub » is touched; without the certified tool (CMP_ON false) the ad is asked
in « limited ads » mode; with it, the ad waits for the choice made in Google's window (imitated here: googlefc and its
callbackQueue), « Gérer les cookies » opens it again; « Your Privacy Choices » and Global Privacy Control make the ad
non-personalised. An iPhone (iPhone 15 Pro emulated) and a computer, in French and English."""
import functools, http.server, os, re, shutil, sys, tempfile, threading
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.sync_api import sync_playwright

PUBLIC = os.path.abspath(sys.argv[1])
SHOTS = sys.argv[2] if len(sys.argv) > 2 else None
results = []
PW = None
OLD = re.compile(r'^/(en(/|$)|tarifs|conditions|remboursement|confidentialite|mentions-legales|alternative-triller)')

# an imitation of Google Publisher Tag (rewarded) that also records the privacy settings, and of Google's consent window
# (googlefc): window.__fcMode = 'none' (no window published) or 'ask' (the window comes; window.__fcChoose() answers it)
FAKE_GPT = r"""
(function(){
  window.__gptLoads = (window.__gptLoads || 0) + 1;
  var gt = window.googletag = window.googletag || { cmd: [] }, L = {}, pa = {
    addEventListener: function(n, f){ (L[n] = L[n] || []).push(f); return pa; },
    setPrivacySettings: function(o){ window.__privacy = Object.assign({}, window.__privacy || {}, o); return pa; }
  };
  function fire(n, e){ (L[n] || []).forEach(function(f){ f(e); }); }
  gt.apiReady = true; gt.enums = { OutOfPageFormat: { REWARDED: 5 } }; gt.pubads = function(){ return pa; };
  gt.defineOutOfPageSlot = function(u, f){ window.__adAskedAt = Date.now(); window.__adAsked = (window.__adAsked || 0) + 1; var s = { addService: function(){ return s; } }; return s; };
  gt.destroySlots = function(){}; gt.enableServices = function(){};
  gt.display = function(s){ setTimeout(function(){ fire('slotRenderEnded', { slot: s, isEmpty: false });
    fire('rewardedSlotReady', { slot: s, makeRewardedVisible: function(){ setTimeout(function(){ fire('rewardedSlotGranted', { slot: s }); fire('rewardedSlotClosed', { slot: s }); }, 200); } }); }, 100); };
  var q = gt.cmd; gt.cmd = { push: function(f){ f(); } }; (q || []).forEach(function(f){ f(); });
  // Google's consent window comes with Google's script
  if (window.__fcMode === 'ask'){
    var fc = window.googlefc = window.googlefc || {}, cq = fc.callbackQueue || [], run = function(k){ cq.forEach(function(o){ if (o[k] && !o['_' + k]){ o['_' + k] = 1; o[k](); } }); };
    fc.callbackQueue = { push: function(o){ cq.push(o); if (fc.__api) run('CONSENT_API_READY'); if (fc.__data) run('CONSENT_DATA_READY'); } };
    fc.showRevocationMessage = function(){ window.__revoked = (window.__revoked || 0) + 1; };
    setTimeout(function(){ fc.__api = true; run('CONSENT_API_READY'); window.__fcShown = true; }, 300);
    window.__fcChoose = function(){ fc.__data = true; run('CONSENT_DATA_READY'); };
  }
})();
"""


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


def ctx_page(b, base, lang, iphone, gpc=False):
    opts = dict(PW.devices['iPhone 15 Pro']) if iphone else {'viewport': {'width': 1280, 'height': 860}}
    ctx = b.new_context(**opts, locale='en-US' if lang == 'en' else 'fr-FR')
    google = []
    def gpt(r):
        google.append(r.request.url); r.fulfill(status=200, content_type='application/javascript', body=FAKE_GPT)
    def googleish(r):
        if '/tag/js/gpt.js' in r.request.url: return gpt(r)
        google.append(r.request.url); r.fulfill(status=404, body='')
    ctx.route(re.compile(r'.*(fundingchoicesmessages\.google\.com|googlesyndication\.com|doubleclick\.net).*'), googleish)
    ctx.route('**/api/**', lambda r: r.fulfill(status=404, body=''))
    if gpc: ctx.add_init_script("Object.defineProperty(navigator, 'globalPrivacyControl', { get: () => true })")
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.goto(base + ('fr/' if lang == 'fr' else ''), wait_until='load'); pg.wait_for_function('typeof window.__ev === "function"', timeout=20000)
    return ctx, pg, errs, google


def ad_once(pg):
    ev(pg, "wmPass = false, adUI()")
    pg.evaluate('() => { window.__privacy = null; window.__adAsked = 0; }')
    ev(pg, "beginExport = () => { window.__began = true; throw new Error('test : export arrêté ici'); }")
    pg.locator('#adBtn').click()


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
    # Your Privacy Choices
    pc.scroll_into_view_if_needed(); pc.click(); pg.wait_for_selector('#pcAsk:not([hidden])', timeout=3000)
    pg.wait_for_timeout(400)   # (its opening animation done)
    bo, bi = pg.locator('#pcOut').bounding_box(), pg.locator('#pcIn').bounding_box()
    same = abs(bo['width'] - bi['width']) < 2 and abs(bo['height'] - bi['height']) < 2 and pg.evaluate("() => getComputedStyle(document.querySelector('#pcOut')).backgroundColor === getComputedStyle(document.querySelector('#pcIn')).backgroundColor")
    check(tag + ' : « Your Privacy Choices » : deux choix de même taille et même couleur, rien de pré-choisi qui pousse', same, (bo, bi))
    if SHOTS: pg.locator('#pcAsk .card').screenshot(path=os.path.join(SHOTS, 'choix-' + ('iphone' if iphone else 'ordi') + '-' + lang + '.png'))
    pg.locator('#pcOut').click()
    check(tag + ' : « Ne pas vendre ni partager » gardé sur l’appareil', ev(pg, "store.get(PC_KEY) === true") and ('do not sell' in pg.locator('#pcState').inner_text().lower() if lang == 'en' else 'ne pas vendre' in pg.locator('#pcState').inner_text()), pg.locator('#pcState').inner_text())
    pg.keyboard.press('Escape'); pg.wait_for_timeout(100)
    check(tag + ' : la fenêtre se ferme (Échap)', not pg.locator('#pcAsk').is_visible())
    check(tag + ' : toujours pas de script Google', not google, google)
    # ---- the ad: without the certified tool, limited ads; opted out, not personalised ----
    ad_once(pg); pg.wait_for_function('() => __ev("!adBusy")', timeout=20000)
    pv = pg.evaluate('window.__privacy')
    check(tag + ' : pub demandée seulement au toucher, en « pubs limitées », non personnalisée après le refus', len(google) == 1 and pv and pv.get('limitedAds') is True and pv.get('restrictDataProcessing') is True, (google, pv))
    pc.click(); pg.locator('#pcIn').click(); pg.keyboard.press('Escape')
    ad_once(pg); pg.wait_for_function('() => __ev("!adBusy")', timeout=20000)
    pv = pg.evaluate('window.__privacy')
    check(tag + ' : « Autoriser » : plus de restriction (toujours « pubs limitées » sans outil certifié)', pv and pv.get('limitedAds') is True and not pv.get('restrictDataProcessing'), pv)
    # ---- with Google's certified window (CMP_ON): the ad waits for the choice ----
    ev(pg, 'CMP_ON = true')
    pg.evaluate("() => { window.__fcMode = 'ask'; window.googletag = undefined; window.googlefc = undefined; window.__fcShown = false; }")
    ev(pg, 'gptP = null')
    ad_once(pg)
    pg.wait_for_function('() => window.__fcShown === true', timeout=10000); pg.wait_for_timeout(2500)
    asked_before = pg.evaluate('window.__adAsked')
    pg.evaluate('() => window.__fcChoose()')
    pg.wait_for_function('() => __ev("!adBusy")', timeout=20000)
    pv = pg.evaluate('window.__privacy')
    check(tag + ' : avec l’outil certifié : la pub attend le choix fait dans la fenêtre de Google, puis passe', asked_before == 0 and pg.evaluate('window.__adAsked') == 1 and ev(pg, 'wmPass === true || window.__began === true'), (asked_before, pg.evaluate('window.__adAsked')))
    check(tag + ' : avec l’outil certifié : plus de « pubs limitées » forcées (le choix décide)', pv is not None and 'limitedAds' not in pv, pv)
    pg.evaluate('() => { window.__revoked = 0; }')
    ck.click(); pg.wait_for_function('() => (window.__revoked || 0) > 0', timeout=8000)
    check(tag + ' : avec l’outil certifié : « Gérer les cookies » rouvre la fenêtre de Google', pg.evaluate('window.__revoked') == 1 and pg.evaluate('location.pathname') == want_path)
    # Google's window not published (CMP_ON but nothing comes): the ad still goes after 5 s
    pg.evaluate("() => { window.__fcMode = 'none'; window.googletag = undefined; window.googlefc = undefined; }"); ev(pg, 'gptP = null')
    ad_once(pg); pg.wait_for_function('() => __ev("!adBusy")', timeout=20000)
    check(tag + ' : fenêtre de Google absente : la pub passe quand même (après 5 s)', pg.evaluate('window.__adAsked') == 1)
    ev(pg, 'CMP_ON = false')
    sw = pg.evaluate('document.documentElement.scrollWidth')
    check(tag + ' : pas de défilement horizontal', sw <= pg.viewport_size['width'], sw)
    check(tag + ' : aucune erreur dans la page', not [e for e in errs if 'test : export arrêté ici' not in e], errs)
    ctx.close()
    # ---- Global Privacy Control: counts as a refusal ----
    ctx, pg, errs, google = ctx_page(b, base, lang, iphone, gpc=True)
    pg.locator('#siteFoot a[data-pc]').click(); pg.wait_for_selector('#pcAsk:not([hidden])', timeout=3000)
    check(tag + ' : GPC activé : dit dans la fenêtre, « Autoriser » indisponible, refus appliqué', pg.locator('#pcGpc').is_visible() and pg.locator('#pcIn').is_disabled() and ev(pg, 'optedOut()'))
    pg.keyboard.press('Escape')
    pg.locator('#demoBtn').click(); pg.wait_for_function('() => __ev("S.step === 4 && S.cuts.length > 0")', timeout=60000)
    ad_once(pg); pg.wait_for_function('() => __ev("!adBusy")', timeout=20000)
    pv = pg.evaluate('window.__privacy')
    check(tag + ' : GPC : pub non personnalisée', pv and pv.get('restrictDataProcessing') is True, pv)
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
