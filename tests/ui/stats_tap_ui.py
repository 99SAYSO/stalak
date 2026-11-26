"""Test of a tap on the bottom bar before the app has loaded (Clarity, 26/11: a tap on « Stats » did nothing for a visitor not
signed in, on an iPhone, 9 s after arriving). Python Playwright, the test server (tests/ui/cloud-server.mjs), iPhone 13, a slow
network (the bar is on screen before app.js has arrived).

    python3 /abs/path/tests/ui/stats_tap_ui.py http://127.0.0.1:<port>

- tapped while the app is still loading: « Stats » opens the sign-in once the app is ready (nothing lost), the tapped button
  shows it is waiting;
- tapped once the app is ready: the same;
- « Compte » tapped early: the sign-in too."""
import os, sys
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.sync_api import sync_playwright

BASE = sys.argv[1].rstrip('/')
results = []


def check(name, ok, info=''):
    results.append(bool(ok))
    print(('PASS ' if ok else 'FAIL ') + name + (('  — ' + str(info)) if info and not ok else ''))


def opened(pg):
    return pg.evaluate("() => [location.hash, !document.querySelector('#acctPage').hidden]")


with sync_playwright() as p:
    b = p.chromium.launch()
    for tab, lang, slow in (('stats', 'en', True), ('stats', 'fr', True), ('account', 'en', True), ('stats', 'en', False)):
        tag = 'iPhone 13 %s : « %s » %s' % (lang, tab, 'pendant le chargement' if slow else 'une fois l’app prête')
        ctx = b.new_context(**p.devices['iPhone 13'], locale='fr-FR' if lang == 'fr' else 'en-US')
        ctx.add_init_script("window.__stalakM3on = 1; window.__stalakM4on = 1; try { localStorage.setItem('stalak:tuto', '1'); } catch (e) {}")
        pg = ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
        cdp = ctx.new_cdp_session(pg); cdp.send('Network.enable')
        if slow: cdp.send('Network.emulateNetworkConditions', {'offline': False, 'latency': 400, 'downloadThroughput': 60000, 'uploadThroughput': 60000})
        pg.goto(BASE + ('/fr/' if lang == 'fr' else '/'), wait_until='commit')
        sel = '#tabBar [data-tab="%s"]' % tab
        for i in range(300):
            if pg.evaluate("s => { const e = document.querySelector(s); return !!e && e.getBoundingClientRect().width > 0; }", sel): break
            pg.wait_for_timeout(100)
        if not slow: pg.wait_for_function('() => !!window.StalakM', timeout=60000); pg.wait_for_timeout(800)
        early = not pg.evaluate('() => !!window.StalakM')
        pg.tap(sel)
        if slow:
            busy = pg.locator(sel).get_attribute('aria-busy')
            check(tag + ' : le tap est fait avant que l’app soit prête, le bouton montre qu’il attend', early and busy == 'true', [early, busy])
            cdp.send('Network.emulateNetworkConditions', {'offline': False, 'latency': 0, 'downloadThroughput': -1, 'uploadThroughput': -1})
            pg.wait_for_function('() => !!window.StalakM', timeout=120000)
        try: pg.wait_for_function("() => location.hash === '#connexion' && !document.querySelector('#acctPage').hidden", timeout=10000)
        except Exception: pass
        o = opened(pg)
        check(tag + ' : la connexion s’ouvre (rien n’est perdu)', o == ['#connexion', True], o)
        check(tag + ' : plus de bouton en attente', pg.locator('#tabBar [aria-busy]').count() == 0)
        check(tag + ' : aucune erreur dans la page', not errs, errs)
        ctx.close()
    b.close()
print('%d/%d réussis' % (sum(results), len(results)))
sys.exit(0 if all(results) else 1)
