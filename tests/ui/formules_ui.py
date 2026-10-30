"""Test of what each plan unlocks in the app (Gratuit / Basic / Pro / Max) and of the « Ta vidéo du jour est faite ✓ » screen.
Python Playwright (chromium).

    python3 /abs/path/tests/ui/formules_ui.py <path of a built public/ folder> [folder for screenshots]

The account side (Comptes) is played by the test: acctHas(feat), acctQuota(), acctUseVideo() (the account block of app.js)
are replaced inside the app for each plan, and acctOpen is watched to check that each padlock opens the plans page on the
right plan. At the end, Comptes' own functions are put back and a visitor signed out is checked."""
import functools, http.server, os, shutil, sys, tempfile, threading
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.sync_api import sync_playwright

PUBLIC = os.path.abspath(sys.argv[1])
SHOTS = sys.argv[2] if len(sys.argv) > 2 else None
results = []
PLANS = {   # what each plan has, as the offer of 30/10 says
    'gratuit': [],
    'basic': ['nologo', 'text', 'unlimited'],
    'pro': ['nologo', 'text', 'unlimited', 'filters', 'clip', 'pack5', 'pack10'],
    'max': ['nologo', 'text', 'unlimited', 'filters', 'clip', 'pack5', 'pack10', 'pack30'],
}


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


def check(name, ok, info=''):
    results.append(ok)
    print(('PASS ' if ok else 'FAIL ') + name + (('  — ' + str(info)) if info and not ok else ''))


def ev(pg, code):
    return pg.evaluate('s => __ev(s)', code)


def setup(pg, plan, left=1, signed=True):
    feats = PLANS[plan]
    pg.evaluate("""([feats, left, signed]) => {
      window.__feats = feats;
      window.__q = { left, resetAt: Date.now() + (5 * 60 + 12) * 60000 };
      window.__used = 0;
      if (!window.__real) window.__real = __ev("({ acctHas, acctQuota, acctUseVideo })");
      __ev("acctHas = f => window.__feats.includes(f); acctQuota = () => window.__q; acctUseVideo = async () => { window.__used++; window.__q.left = Math.max(0, window.__q.left - 1); }");
      window.__open = null;
      __ev("acctOpen = (why, o) => { window.__open = [why, o && o.plan || null]; }");
      __ev("beginExport = () => { window.__began = true; throw new Error('test : export arrêté ici'); }");
      __ev("ACCT.state.user = " + (signed ? "{ id: 'u1', email: 'test@example.com' }" : "null"));
      window.__began = false;
      __ev("textGate(); planTags(); filtUI(); kindUI()");
    }""", [feats, left, signed])


def lock(pg, code):
    pg.evaluate('() => { window.__open = null; window.__began = false; }')
    try: pg.evaluate('s => Promise.resolve(__ev(s)).catch(() => {})', code)
    except Exception: pass
    pg.wait_for_timeout(150)
    return pg.evaluate('() => [window.__open, window.__began]')


def run(b, base, lang, phone):
    tag = ('téléphone' if phone else 'ordinateur') + ' ' + lang
    ctx = b.new_context(viewport={'width': 390, 'height': 844} if phone else {'width': 1280, 'height': 860},
                        has_touch=phone, is_mobile=phone, locale='en-US' if lang == 'en' else 'fr-FR')
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:200]) if 'test : export arrêté ici' not in str(e) else None)
    pg.goto(base + ('en/' if lang == 'en' else ''), wait_until='load')
    pg.wait_for_function('window.__ev && window.MP4Box', timeout=20000)
    pg.locator('#demoBtn').click()
    pg.wait_for_function('() => __ev("S.step === 4 && S.cuts.length > 0")', timeout=60000)

    # ---- Gratuit ----
    setup(pg, 'gratuit', left=1)
    check(tag + ' gratuit : logo Stalak à la fin', ev(pg, 'outroOn()'))
    tags = pg.evaluate("""() => ({ clip: document.querySelector('#kindSeg button[data-v="clip"]').dataset.plan, pack: document.querySelector('#packBtn').dataset.plan,
      size: document.querySelector('#stSize button[data-v="l"]') && document.querySelector('#stSize button[data-v="l"]').dataset.plan,
      filt: document.querySelectorAll('#filtRow .filtpro').length })""")
    check(tag + ' gratuit : cadenas BASIC (texte), PRO (Clip, pack), 23 filtres PRO', tags['clip'] == 'PRO' and tags['pack'] == 'PRO' and tags['size'] == 'BASIC' and tags['filt'] == 23, tags)
    check(tag + ' gratuit : taille de texte L → formule Basic', lock(pg, "document.querySelector('#stSize button[data-v=\"l\"]').click()")[0] == ['text', 'basic'])
    check(tag + ' gratuit : mode Clip → formule Pro', lock(pg, "document.querySelector('#kindSeg button[data-v=\"clip\"]').click()")[0] == ['clip', 'pro'])
    check(tag + ' gratuit : pack de 10 → formule Pro', lock(pg, "$('#packSel').value = '10', exportPack()")[0] == ['pack', 'pro'])
    check(tag + ' gratuit : « L’enlever avec Basic » → formule Basic', lock(pg, "$('#outroPro').click()")[0] == ['outro', 'basic'])
    o = lock(pg, "setFilter('demon', true), exportOne()")
    check(tag + ' gratuit : export avec un filtre Pro → formule Pro, pas d’export', o == [['filters', 'pro'], False], o)
    o = lock(pg, "setFilter('nb', true), exportOne()")
    check(tag + ' gratuit : vidéo du jour disponible → l’export part', o == [None, True], o)
    # the video of the day used: the screen instead of the export
    pg.evaluate('() => { window.__q.left = 0; }')
    o = lock(pg, 'exportOne()')
    shown = pg.evaluate("() => !document.querySelector('#dayDone').hidden")
    t = pg.locator('#dayDoneT').inner_text(); p = pg.locator('#dayDoneP').inner_text(); left = pg.locator('#dayLeft').inner_text()
    want_t = 'Today’s video is done ✓' if lang == 'en' else 'Ta vidéo du jour est faite ✓'
    check(tag + ' gratuit : vidéo du jour faite → écran, pas d’export', shown and o[1] is False and t == want_t, (shown, o, t))
    check(tag + ' gratuit : temps restant affiché (5 h 12)', ('5 h 12' in left) and (('Next free video' in left) if lang == 'en' else ('Prochaine vidéo gratuite' in left)), left)
    check(tag + ' gratuit : texte « passe à Basic »', ('Basic' in p) and (('tomorrow' in p) if lang == 'en' else ('demain' in p)), p)
    sw = pg.evaluate('document.documentElement.scrollWidth')
    check(tag + ' gratuit : écran sans défilement horizontal', sw <= (390 if phone else 1280), sw)
    if SHOTS: pg.screenshot(path=os.path.join(SHOTS, 'jour-' + ('tel' if phone else 'ordi') + '-' + lang + '.png'))
    # the keyboard stays in the screen; « Passer à Basic » opens the plans page on Basic
    foc = pg.evaluate("() => document.activeElement && document.activeElement.id")
    pg.keyboard.press('Tab'); pg.keyboard.press('Tab'); pg.keyboard.press('Tab')
    inside = pg.evaluate("() => !!document.activeElement.closest('#dayDone')")
    check(tag + ' gratuit : focus sur « Passer à Basic », Tab reste dans l’écran', foc == 'dayGo' and inside, (foc, inside))
    pg.locator('#dayGo').click(); pg.wait_for_timeout(150)
    check(tag + ' gratuit : « Passer à Basic » → formule Basic, écran fermé', pg.evaluate('window.__open') == ['daily', 'basic'] and pg.evaluate("() => document.querySelector('#dayDone').hidden"))
    lock(pg, 'exportOne()'); pg.locator('#dayClose').click(); pg.wait_for_timeout(100)
    check(tag + ' gratuit : « Revenir demain » ferme l’écran', pg.evaluate("() => document.querySelector('#dayDone').hidden"))
    lock(pg, 'exportOne()'); pg.keyboard.press('Escape'); pg.wait_for_timeout(100)
    check(tag + ' gratuit : Échap ferme l’écran', pg.evaluate("() => document.querySelector('#dayDone').hidden"))
    # counted once the video is ready
    pg.evaluate('() => { window.__used = 0; }'); ev(pg, 'dayUsed()'); pg.wait_for_timeout(100)
    check(tag + ' gratuit : la vidéo faite est comptée', pg.evaluate('window.__used') == 1)
    # signed out: the free plan needs an account
    setup(pg, 'gratuit', left=1, signed=False)
    o = lock(pg, "setFilter('nb', true), exportOne()")
    check(tag + ' sans compte : export → création de compte', o[0] and o[0][0] == 'daily' and o[1] is False, o)

    # ---- Basic ----
    setup(pg, 'basic', left=0)
    check(tag + ' basic : sans logo', not ev(pg, 'outroOn()'))
    check(tag + ' basic : toutes les tailles de texte', ev(pg, "textFree('size', 'l') && textFree('anim', 'kara')") and not pg.evaluate("() => document.querySelector('#stSize button[data-v=\"l\"]').classList.contains('protag')"))
    check(tag + ' basic : vidéos illimitées (pas d’écran du jour)', lock(pg, "setFilter('nb', true), exportOne()") == [None, True])
    check(tag + ' basic : 3 filtres seulement (Démon → Pro)', lock(pg, "setFilter('demon', true), exportOne()")[0] == ['filters', 'pro'] and pg.locator('#filtRow .filtpro').count() == 23)
    check(tag + ' basic : Clip → Pro', lock(pg, "document.querySelector('#kindSeg button[data-v=\"clip\"]').click()")[0] == ['clip', 'pro'])
    check(tag + ' basic : pack de 5 → Pro', lock(pg, "$('#packSel').value = '5', planTags(), exportPack()")[0] == ['pack', 'pro'])

    # ---- Pro ----
    setup(pg, 'pro', left=0)
    check(tag + ' pro : tous les filtres', lock(pg, "setFilter('demon', true), exportOne()") == [None, True] and pg.locator('#filtRow .filtpro').count() == 0)
    check(tag + ' pro : mode Clip ouvert', not pg.evaluate("() => document.querySelector('#kindSeg button[data-v=\"clip\"]').classList.contains('protag')") and ev(pg, "can('clip')"))
    ev(pg, "$('#packSel').value = '30'"); pg.dispatch_event('#packSel', 'change')
    check(tag + ' pro : pack de 30 marqué MAX', pg.evaluate("() => document.querySelector('#packBtn').dataset.plan") == 'MAX')
    check(tag + ' pro : pack de 30 → formule Max', lock(pg, 'exportPack()')[0] == ['pack30', 'max'])
    ev(pg, "$('#packSel').value = '10'"); pg.dispatch_event('#packSel', 'change')
    check(tag + ' pro : pack de 10 sans cadenas', not pg.evaluate("() => document.querySelector('#packBtn').classList.contains('protag')"))

    # ---- Max ----
    setup(pg, 'max', left=0)
    ev(pg, "$('#packSel').value = '30'"); pg.dispatch_event('#packSel', 'change')
    check(tag + ' max : pack de 30 sans cadenas', not pg.evaluate("() => document.querySelector('#packBtn').classList.contains('protag')") and ev(pg, "can('pack30')"))

    # ---- Comptes' own functions, signed out: the free plan, and an export asks for a free account ----
    pg.evaluate('() => __ev("acctHas = window.__real.acctHas; acctQuota = window.__real.acctQuota; acctUseVideo = window.__real.acctUseVideo; ACCT.state.user = null; textGate(); planTags(); filtUI()")')
    o = lock(pg, "setFilter('nb', true), exportOne()")
    check(tag + ' fonctions de Comptes, sans compte : logo, Clip fermé, export → compte gratuit', ev(pg, "outroOn() && !can('clip') && !can('filters')") and o == [['daily', None], False], o)
    check(tag + ' aucune erreur dans la page', not errs, errs)
    ctx.close()


def main():
    tmp = tempfile.mkdtemp(prefix='stalak-formules-')
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
        for lang in ('fr', 'en'):
            for phone in (True, False):
                try: run(b, base, lang, phone)
                except Exception as e: check(('téléphone' if phone else 'ordinateur') + ' ' + lang + ' : déroulé complet', False, str(e)[:300])
        b.close()
    srv.shutdown(); shutil.rmtree(tmp, ignore_errors=True)
    print('%d/%d réussis' % (sum(results), len(results)))
    sys.exit(0 if all(results) else 1)


main()
