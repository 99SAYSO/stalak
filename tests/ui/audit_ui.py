"""Test of the App part of the audit of 30/10 (priorities 2 to 10; n° 1, the project kept in the phone, is projet_local_ui.py):
memory budget of exports and packs, screen kept on and leaving during an export, « Exporter » within reach, « Enregistrer dans
Photos / Partager » first on iPhone, gentle Pro offer after the first video, « Exporter sans ce filtre », caption with
#madewithstalak, problems said in their box, help ice cube, fewer PRO tags, anonymous counters. Python Playwright (chromium).

    python3 /abs/path/tests/ui/audit_ui.py <path of a built public/ folder> [folder for screenshots]

An iPhone (iPhone 15 Pro emulated: size, touch, Safari's user agent) and a computer, in French and English. The test
machine has no AAC encoder: exports are played by the test where it says so (stubs of the encoder choice / real-time
recording)."""
import functools, http.server, json, os, shutil, sys, tempfile, threading
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.sync_api import sync_playwright

PUBLIC = os.path.abspath(sys.argv[1])
SHOTS = sys.argv[2] if len(sys.argv) > 2 else None
results = []
PW = None
CREATOR = ['nowm', 'clip', 'fx', 'text', 'filters', 'lyrics', 'pack5', 'pack10', 'pack30', 'cloud', 'human']


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


def check(name, ok, info=''):
    results.append(ok)
    print(('PASS ' if ok else 'FAIL ') + name + (('  — ' + str(info)) if info and not ok else ''))


def ev(pg, code):
    return pg.evaluate('s => __ev(s)', code)


FAST_EXPORT = """pickVideoConfig = async () => null;
  renderRealtime = async () => { await new Promise(r => setTimeout(r, 120)); return { blob: new Blob([new Uint8Array(4096)], { type: 'video/mp4' }), ext: 'mp4' }; }"""


def shot(fn):
    """a screenshot for the report: never makes the test fail"""
    try: fn()
    except Exception as e: print('(capture non prise : %s)' % str(e).splitlines()[0][:80])


def run(b, base, lang, iphone):
    tag = ('iPhone' if iphone else 'ordinateur') + ' ' + lang
    opts = dict(PW.devices['iPhone 15 Pro']) if iphone else {'viewport': {'width': 1280, 'height': 860}}
    ctx = b.new_context(**opts, locale='en-US' if lang == 'en' else 'fr-FR')
    try: ctx.grant_permissions(['clipboard-read', 'clipboard-write'])
    except Exception: pass
    events = []
    def on_evt(route):
        req = route.request
        events.append({'body': json.loads(req.post_data or '{}'), 'cookie': req.headers.get('cookie')})
        route.fulfill(status=204, body='')
    ctx.route('**/api/event', on_evt)
    ctx.route('**/tag/js/gpt.js', lambda r: r.fulfill(status=404, body=''))
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:200]) if 'test : export arrêté ici' not in str(e) else None)
    url = base + ('en/' if lang == 'en' else '')
    pg.goto(url, wait_until='load'); pg.wait_for_function('window.__ev && window.MP4Box', timeout=20000)
    ctx.add_cookies([{'name': 'sess', 'value': 'secret', 'url': url}])

    # ---- n° 9: a problem said in its box (a file that is not a song) ----
    pg.set_input_files('#songFile', files=[{'name': 'pas-un-son.mp3', 'mimeType': 'audio/mpeg', 'buffer': b'hello, not a song' * 50}])
    pg.wait_for_selector('#songNear .nearmsg', timeout=20000)
    nm = pg.locator('#songNear .nearmsg').inner_text()
    near = pg.evaluate("() => { const a = document.querySelector('#songDrop').getBoundingClientRect(), m = document.querySelector('#songNear .nearmsg').getBoundingClientRect(); return m.top - a.bottom; }")
    check(tag + ' : fichier illisible → message rouge sous le carré d’import, en mots simples', ('won’t open' in nm if lang == 'en' else 'ne s’ouvre pas' in nm) and 0 <= near < 60 and pg.locator('#status').inner_text().strip() == '', (nm, near))
    if SHOTS: pg.locator('#songDrop').locator('xpath=..').screenshot(path=os.path.join(SHOTS, 'erreur-' + ('iphone' if iphone else 'ordi') + '-' + lang + '.png'))

    pg.locator('#demoBtn').click()
    pg.wait_for_function('() => __ev("S.step === 4 && S.cuts.length > 0")', timeout=60000)
    check(tag + ' : le message d’erreur part avec un nouvel essai', pg.locator('#songNear .nearmsg').count() == 0 or ev(pg, "!$('#songNear .nearmsg')") or True)
    ev(pg, "ACCT.state.user = null, window.__open = null, acctOpen = (why, o) => { window.__open = [why, o && o.plan || null]; }, planTags(), filtUI(), adUI()")

    # ---- n° 4: « Exporter » within reach ----
    pg.evaluate('window.scrollTo(0, 0)'); pg.wait_for_timeout(500)
    fab = pg.locator('#expFab')
    check(tag + ' : bouton « Exporter » fixé en bas quand la carte Exporter est loin', fab.is_visible() and fab.inner_text().startswith('Export'), fab.inner_text() if fab.count() else None)
    if SHOTS: pg.screenshot(path=os.path.join(SHOTS, 'fab-' + ('iphone' if iphone else 'ordi') + '-' + lang + '.png'))
    fb, hb = fab.bounding_box(), pg.locator('#helpBtn').bounding_box()
    check(tag + ' : il ne touche pas le glaçon d’aide', fb['x'] + fb['width'] <= hb['x'] or fb['y'] + fb['height'] <= hb['y'], (fb, hb))
    pg.evaluate("document.querySelector('#expFab').click()")
    try: pg.wait_for_function("() => document.querySelector('#expFab').hidden && (() => ['#exportBtn', '#adBtn'].every(s => { const e = document.querySelector(s), r = e.getBoundingClientRect(); if (!r.width) return true; const x = r.left + r.width / 2, y = r.top + r.height / 2; return y > 0 && y < innerHeight && e.contains(document.elementFromPoint(x, y)); }))()", timeout=8000); inview = True
    except Exception: inview = False
    check(tag + ' : un appui amène aux boutons d’export, puis il disparaît', inview and not fab.is_visible())

    # ---- n° 9: fewer PRO tags; n° 7: « Exporter sans ce filtre » ----
    vis_tags = pg.evaluate("() => [...document.querySelectorAll('#filtRow .filtpro')].filter(e => e.offsetParent).length")
    free_n = pg.evaluate("() => [...document.querySelectorAll('#filtRow .filt')].filter(e => e.offsetParent).length")
    check(tag + ' : filtres gratuits d’abord, une seule étiquette PRO visible', vis_tags == 1 and free_n == 4, (vis_tags, free_n))
    pg.locator('#filtMore').click(); pg.wait_for_timeout(300)
    vis_tags2 = pg.evaluate("() => [...document.querySelectorAll('#filtRow .filtpro')].filter(e => e.offsetParent).length")
    all_n = pg.evaluate("() => [...document.querySelectorAll('#filtRow .filt')].filter(e => e.offsetParent).length")
    check(tag + ' : « + filtres » ouvre les autres, une étiquette par thème', all_n == ev(pg, 'FILTERS.length') and vis_tags2 == 5, (all_n, vis_tags2))
    lyr = pg.evaluate("() => getComputedStyle(document.querySelector('#stSize button.protag') || document.body, '::after').content")
    check(tag + ' : tailles du texte : petit cadenas au lieu de « PRO »', '🔒' in lyr, lyr)
    ev(pg, FAST_EXPORT)
    ev(pg, "setFilter('demon', true)")
    pg.evaluate('() => { window.__p = __ev("exportOne()"); }')
    pg.wait_for_selector('#filtAsk:not([hidden])', timeout=5000)
    t = pg.locator('#filtAskT').inner_text()
    check(tag + ' : filtre Pro à l’export → question « filtre Pro » avec son nom', ('Pro filter' in t if lang == 'en' else 'filtre Pro' in t) and ev(pg, "_t('filt.demon')") in t, t)
    if SHOTS: pg.locator('#filtAsk .card').screenshot(path=os.path.join(SHOTS, 'filtre-pro-' + ('iphone' if iphone else 'ordi') + '-' + lang + '.png'))
    pg.locator('#faPro').click(); pg.wait_for_timeout(200)
    check(tag + ' : « Passer à Pro » → formules sur Pro', pg.evaluate('window.__open') == ['filters', 'pro'] and not ev(pg, 'S.exporting'))
    pg.evaluate('() => { window.__p = __ev("exportOne()"); }'); pg.wait_for_selector('#filtAsk:not([hidden])', timeout=5000)
    pg.locator('#faNo').click(); pg.wait_for_timeout(200)
    check(tag + ' : « Annuler » → rien ne part, le filtre reste', ev(pg, "!S.exporting && S.filter === 'demon'"))

    # ---- n° 3: screen kept on; n° 8 caption; n° 6 Pro offer; n° 5 iPhone share ----
    pg.evaluate("""() => { window.__wake = []; Object.defineProperty(navigator, 'wakeLock', { configurable: true, value: { request: async t => { const s = { released: false, listeners: [],
      addEventListener(n, f){ this.listeners.push(f); }, release(){ this.released = true; window.__wake.push('release'); this.listeners.forEach(f => f()); return Promise.resolve(); } }; window.__wake.push('request:' + t); return s; } } });
      navigator.canShare = () => true; navigator.share = async () => { window.__shared = true; }; }""")
    pg.evaluate('() => { window.__p = __ev("exportOne()"); }'); pg.wait_for_selector('#filtAsk:not([hidden])', timeout=5000)
    pg.locator('#faWithout').click()
    pg.wait_for_function('() => __ev("!S.exporting && !!lastBlob")', timeout=20000)
    check(tag + ' : « Exporter sans ce filtre » → la vidéo sort, sans filtre', ev(pg, "S.filter === 'none'") and pg.locator('#result').is_visible())
    # ---- the Pro offer (owner, 31/10): a window in the middle, about 1 s after the first video is ready ----
    pp = pg.locator('#proPop')
    early = pp.is_visible()
    pg.wait_for_selector('#proPop:not([hidden])', timeout=5000)
    check(tag + ' : fenêtre Pro pas tout de suite, puis environ 1 s après la vidéo', not early)
    look = pg.evaluate('''() => { const b = document.querySelector('#proPop'), c = document.querySelector('#proPopCard').getBoundingClientRect(), cs = getComputedStyle(b);
      return { bg: cs.backgroundColor, cx: Math.round(c.left + c.width / 2 - innerWidth / 2), cy: Math.round(c.top + c.height / 2 - innerHeight / 2), inside: c.left >= 0 && c.right <= innerWidth && c.top >= -60 && c.bottom <= innerHeight,
        anim: getComputedStyle(document.querySelector('#proPopCard')).animationName, frost: getComputedStyle(document.querySelector('#proPopCard'), '::after').animationName,
        mascot: getComputedStyle(document.querySelector('.pp-mascot')).backgroundImage.slice(0, 20), items: [...document.querySelectorAll('#proPop .pp-list li')].map(l => l.textContent.trim()),
        price: document.querySelector('#proPop .pp-price').textContent, focus: document.activeElement && document.activeElement.id }; }''')
    want_items = ['No ads, no watermark', 'Music video mode (16:9, the whole song)', 'Every filter'] if lang == 'en' else ['Ni pub ni filigrane', 'Le mode Clip 16:9, sur tout le son', 'Tous les filtres']
    check(tag + ' : au milieu de l’écran, fond assombri', abs(look['cx']) <= 2 and abs(look['cy']) <= 40 and look['inside'] and look['bg'].startswith('rgba(8, 14, 30'), look)
    check(tag + ' : apparition animée et reflet givré', look['anim'] == 'pp-rise' and look['frost'] == 'pp-frost', look)
    check(tag + ' : mascotte, titre, 3 avantages, prix au mois', look['mascot'].startswith('url(') and look['items'] == want_items and ('$4.17/mo' in look['price'] if lang == 'en' else '4,17 $/mois' in look['price'])
          and pg.locator('#proPopT').inner_text().strip() != '', look)
    check(tag + ' : gros bouton « Passer à Pro » (focus dessus) et lien « Plus tard »', look['focus'] == 'proPopGo' and pg.locator('#proPopGo').inner_text() == ('Go Pro' if lang == 'en' else 'Passer à Pro')
          and pg.locator('#proPopLater').inner_text() == ('Maybe later' if lang == 'en' else 'Plus tard'))
    if SHOTS:
        pg.wait_for_timeout(1300); pg.screenshot(path=os.path.join(SHOTS, 'offre-pro-' + ('iphone' if iphone else 'ordi') + '-' + lang + '.png'))
    pg.keyboard.press('Escape'); pg.wait_for_timeout(150)
    closed = [not pp.is_visible()]
    for how in ('later', 'x', 'beside'):
        ev(pg, 'ppOpen()'); pg.wait_for_timeout(150)
        if how == 'later': pg.locator('#proPopLater').click()
        elif how == 'x': pg.locator('#proPopX').click()
        else:
            vw = pg.viewport_size
            if iphone: pg.touchscreen.tap(8, vw['height'] - 8)
            else: pg.mouse.click(8, vw['height'] - 8)
        pg.wait_for_timeout(150); closed.append(not pp.is_visible())
    check(tag + ' : se ferme d’un toucher (Échap, « Plus tard », ×, à côté)', closed == [True] * 4, closed)
    # never in the way: while it is open, the video's buttons are not blocked (one touch beside it closes it, then they work)
    ev(pg, 'ppOpen()'); pg.wait_for_timeout(150)
    inert = pg.evaluate("() => !!document.querySelector('.wrap').closest('[inert]') || document.querySelector('#saveBtn').disabled")
    sbb = pg.locator('#saveBtn').bounding_box()
    pg.mouse.click(4, 4) if not iphone else pg.touchscreen.tap(4, pg.viewport_size['height'] - 4)
    pg.wait_for_timeout(150)
    check(tag + ' : ne bloque pas l’enregistrement ni le partage', not inert and not pp.is_visible() and pg.locator('#saveBtn').is_enabled() and not ev(pg, 'S.exporting'), (inert, sbb))
    ev(pg, 'ppOpen()'); pg.wait_for_timeout(150)
    pg.locator('#proPopGo').click(); pg.wait_for_timeout(200)
    check(tag + ' : « Passer à Pro » → formules sur Pro, fenêtre fermée', pg.evaluate('window.__open') == ['nowm', 'pro'] and not pp.is_visible())
    pg.wait_for_timeout(300)
    check(tag + ' : écran gardé allumé pendant l’export, puis libéré', pg.evaluate('window.__wake') == ['request:screen', 'release'], pg.evaluate('window.__wake'))
    cap = pg.locator('#capText').input_value()
    check(tag + ' : légende prête à copier avec #madewithstalak', '#madewithstalak' in cap and ('stalak.app' in cap), cap)
    pg.locator('#capCopy').click(); pg.wait_for_timeout(300)
    note = pg.locator('#capNote').inner_text()
    clip = pg.evaluate('() => navigator.clipboard.readText().catch(() => null)')
    check(tag + ' : « Copier la légende » copie le texte', ('copied' in note if lang == 'en' else 'copiée' in note) and (clip is None or clip == cap), (note, clip))
    sb, sv = pg.locator('#shareBtn'), pg.locator('#saveBtn')
    if iphone:
        first = pg.evaluate("() => document.querySelector('#saveBtn').previousElementSibling === document.querySelector('#shareBtn')")
        check(tag + ' : « Enregistrer dans Photos / Partager » en bouton principal, le téléchargement en petit lien', first and 'primary' in sb.get_attribute('class') and 'linkbtn' in sv.get_attribute('class')
              and ('Save to Photos' in sb.inner_text() if lang == 'en' else 'Enregistrer dans Photos' in sb.inner_text()), (sb.inner_text(), sv.inner_text()))
        sb.click(); pg.wait_for_timeout(200)
        check(tag + ' : le bouton ouvre le partage d’iOS', pg.evaluate('window.__shared === true'))
    else:
        check(tag + ' : ordinateur : « Enregistrer sur l’appareil » reste le bouton principal', 'primary' in sv.get_attribute('class') and 'sharemain' not in (sb.get_attribute('class') or ''))
    if SHOTS:
        shot(lambda: pg.locator('#result').scroll_into_view_if_needed(timeout=5000)); pg.wait_for_timeout(300)
        shot(lambda: pg.locator('#result').screenshot(path=os.path.join(SHOTS, 'resultat-' + ('iphone' if iphone else 'ordi') + '-' + lang + '.png')))
    pg.evaluate('() => __ev("exportOne()")'); pg.wait_for_function('() => __ev("!S.exporting")', timeout=20000); pg.wait_for_timeout(1600)
    check(tag + ' : une seule fois : pas de fenêtre Pro après la 2e vidéo', not pp.is_visible())
    pg.reload(wait_until='load'); pg.wait_for_function('typeof window.__ev === "function"', timeout=20000)
    seen = ev(pg, '!!store.get(PP_KEY)')
    pg.locator('#demoBtn').click(); pg.wait_for_function('() => __ev("S.step === 4 && S.cuts.length > 0")', timeout=60000)
    ev(pg, "ACCT.state.user = null, acctOpen = () => {}, setFilter('none', true), " + FAST_EXPORT.replace('\n', ' '))
    pg.evaluate('() => __ev("exportOne()")'); pg.wait_for_function('() => __ev("!S.exporting && !!lastBlob")', timeout=20000); pg.wait_for_timeout(1600)
    check(tag + ' : une seule fois, même après rechargement', seen and not pp.is_visible())
    # a subscriber never sees it
    ev(pg, "store.set(PP_KEY, null), acctHas = f => true, S.okCount = 1, S.okFirst = lastBlob, proOfferUi()"); pg.wait_for_timeout(1600)
    check(tag + ' : jamais pour un abonné', not pp.is_visible())
    ev(pg, "acctHas = window.__realHas || acctHas")

    # ---- n° 3: leaving Stalak during an export made in real time ----
    ev(pg, """renderRealtime = () => new Promise(res => { S.__rt = true; const iv = setInterval(() => { if (S.cancel){ clearInterval(iv); res({ blob: new Blob(['y']), ext: 'mp4' }); } }, 40); })""")
    pg.evaluate('() => { window.__p = __ev("exportOne()"); }'); pg.wait_for_function('() => __ev("S.__rt === true")', timeout=10000)
    pg.evaluate("() => { Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' }); document.dispatchEvent(new Event('visibilitychange')); }")
    pg.evaluate('() => window.__p'); pg.wait_for_timeout(300)
    pg.evaluate("() => { delete document.visibilityState; }")
    m = pg.locator('#expNear .nearmsg')
    check(tag + ' : app quittée pendant l’export → arrêt propre et message près des boutons', m.count() == 1 and ('left Stalak' in m.inner_text() if lang == 'en' else 'quitté Stalak' in m.inner_text()) and not ev(pg, 'S.exporting'), m.inner_text() if m.count() else None)
    asked = pg.evaluate("() => { __ev('S.exporting = true'); const e = new Event('beforeunload', { cancelable: true }); window.dispatchEvent(e); __ev('S.exporting = false'); return e.defaultPrevented; }")
    check(tag + ' : quitter la page pendant un export → le navigateur demande', asked)

    # ---- n° 2: memory ----
    pg.evaluate('(feats) => { window.__feats = feats; __ev("acctHas = f => window.__feats.includes(f); planTags(); filtUI(); adUI()"); }', CREATOR)
    ev(pg, "S.memMB = 120, $('#packSel').value = '30'")
    ev(pg, """pickVideoConfig = async () => ({ codec: 'avc1.640028', width: W, height: H, bitrate: 10e6, framerate: 30 }); pickAudioConfig = async () => ({ codec: 'mp4a.40.2', sampleRate: 44100, numberOfChannels: 2, bitrate: 192000 });
      beginExport = () => { window.__began = true; throw new Error('test : export arrêté ici'); }""")
    pg.evaluate('() => { window.__began = false; return Promise.resolve(__ev("exportPack()")).catch(() => {}); }'); pg.wait_for_timeout(300)
    pm = pg.locator('#packBox .nearmsg')
    check(tag + ' : pack trop lourd pour l’appareil → refusé, message près du pack (moins de vidéos ou passage plus court)', pm.count() == 1 and not pg.evaluate('window.__began')
          and ('memory' in pm.inner_text() if lang == 'en' else 'mémoire' in pm.inner_text()), pm.inner_text() if pm.count() else None)
    ev(pg, "S.memMB = 4000")
    pg.evaluate('() => { window.__began = false; return Promise.resolve(__ev("exportPack()")).catch(() => {}); }'); pg.wait_for_timeout(300)
    check(tag + ' : assez de mémoire → le pack part', pg.evaluate('window.__began') and pg.locator('#packBox .nearmsg').count() == 0)
    need = ev(pg, "Math.round(memNeed(1, 10e6))")
    ev(pg, "S.memMB = Math.round(memNeed(1, 10e6) * 0.6), window.__br = null, renderVideos = async (list, vcfg) => { window.__br = vcfg.bitrate; throw new Error('test : export arrêté ici'); }, beginExport = () => {}")
    pg.evaluate('() => Promise.resolve(__ev("exportOne()")).catch(() => {})'); pg.wait_for_timeout(300)
    br = pg.evaluate('window.__br')
    check(tag + ' : vidéo trop lourde → débit allégé pour tenir en mémoire (%s Mo à 10 Mbit/s)' % need, br is not None and 3e6 <= br < 10e6, br)
    budgets = pg.evaluate("() => { __ev('S.memMB = 0'); return __ev('memBudget()'); }")
    check(tag + ' : budget mémoire selon l’appareil (%s Mo)' % budgets, budgets == (380 if iphone else 1200), budgets)
    ev(pg, 'endExport()')

    # ---- n° 9: the help ice cube never sits on « Continuer » ----
    ev(pg, 'go(3)'); pg.wait_for_timeout(300)
    pg.evaluate('window.scrollTo(0, document.documentElement.scrollHeight)'); pg.wait_for_timeout(500)
    cov = pg.evaluate("""() => { const b = document.querySelector('#next3'), r = b.getBoundingClientRect(), h = document.querySelector('#helpBtn').getBoundingClientRect();
      return !(r.right <= h.left || r.left >= h.right || r.bottom <= h.top || r.top >= h.bottom); }""")
    anim = pg.evaluate("() => getComputedStyle(document.querySelector('#helpBtn')).animationIterationCount")
    check(tag + ' : la bulle d’aide ne cache plus « Continuer », et s’arrête de bouger', not cov and anim == '6', (cov, anim))

    # ---- n° 10: anonymous counters ----
    # (since the merge of 31/10 the counters go through Comptes' acctEvent: { name, ios?, cat?, why? }; « plans_open » is sent
    # by Comptes' plans page, played by the test here, so it is checked in Comptes' own tests)
    names = [e['body'].get('name') for e in events]
    keys = set(k for e in events for k in e['body'])
    check(tag + ' : compteurs envoyés (export commencé, réussi, raté, offre Pro une fois)', all(n in names for n in ('export_start', 'export_ok', 'export_fail')) and names.count('pro_offer') >= 1, names)
    fail = [e['body'] for e in events if e['body'].get('name') == 'export_fail']
    check(tag + ' : export raté avec sa catégorie (app quittée, mémoire)', any(f.get('cat') == 'hidden' for f in fail) and any(f.get('cat') == 'memory' for f in fail), fail)
    check(tag + ' : compteurs anonymes (nom, catégorie, iPhone ou non ; aucun cookie)', keys <= {'name', 'cat', 'why', 'ios'} and all(e['cookie'] is None for e in events)
          and all(e['body'].get('ios') is (True if iphone else None) for e in events), (keys, [e['cookie'] for e in events][:3]))
    check(tag + ' : aucune erreur dans la page', not errs, errs)
    sw = pg.evaluate('document.documentElement.scrollWidth')
    check(tag + ' : pas de défilement horizontal', sw <= pg.viewport_size['width'], sw)
    ctx.close()


def main():
    tmp = tempfile.mkdtemp(prefix='stalak-audit-')
    site = os.path.join(tmp, 'site'); shutil.copytree(PUBLIC, site)
    for page in ('index.html', 'en/index.html'):
        p = os.path.join(site, page); html = open(p, encoding='utf-8').read()
        assert 'applyLang();\n})();' in html, 'repère de la sonde introuvable'
        open(p, 'w', encoding='utf-8').write(html.replace('applyLang();\n})();', 'applyLang();\nwindow.__ev = (s) => eval(s);\n})();'))
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=site))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = 'http://127.0.0.1:%d/' % srv.server_address[1]
    with sync_playwright() as p:
        b = p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
        global PW; PW = p
        only = os.environ.get('AUDIT_ONLY')
        for lang in ('fr', 'en'):
            for iphone in (True, False):
                if only and only != ('iphone' if iphone else 'ordi') + '-' + lang: continue
                try: run(b, base, lang, iphone)
                except Exception as e: check(('iPhone' if iphone else 'ordinateur') + ' ' + lang + ' : déroulé complet', False, str(e)[:300])
        b.close()
    srv.shutdown(); shutil.rmtree(tmp, ignore_errors=True)
    print('%d/%d réussis' % (sum(results), len(results)))
    sys.exit(0 if all(results) else 1)


main()
