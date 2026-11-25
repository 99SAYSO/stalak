"""Test of the follow-up of the Clarity analysis of 24/11 (docs/handoff/chef-suite-clarity.md, points 1 to 3). Playwright.

    python3 /abs/path/tests/ui/suite_clarity_ui.py <path of a built public/ folder>

1. The camera: the time left during a take, the take stops by itself at the end of the passage (as before), a camera that shows
   nothing is said plainly.
2. The passage: the song plays from a handle as soon as it is let go; quick choices 15 s / 30 s / chorus.
3. The export: the bar moves on smoothly even when the real progress stalls (16 → 17 % in 5 s), the time left is shown, the
   steps are a plain list. iPhone 12 and a computer, FR and EN; no error."""
import functools, http.server, os, shutil, sys, tempfile, threading
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.sync_api import sync_playwright

PUBLIC = os.path.abspath(sys.argv[1])
results = []


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


def check(name, ok, info=''):
    results.append(ok)
    print(('PASS ' if ok else 'FAIL ') + name + (('  — ' + str(info)) if info and not ok else ''))


def ev(pg, code):
    return pg.evaluate('s => __ev(s)', code)


def run(b, PW, base, lang, dev):
    tag = dev + ' ' + lang
    opts = dict(PW.devices[dev]) if dev != 'ordinateur' else {'viewport': {'width': 1280, 'height': 860}}
    ctx = b.new_context(**opts, locale='fr-FR' if lang == 'fr' else 'en-US')
    ctx.route('**/api/**', lambda r: r.fulfill(status=204, body=''))
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.goto(base + ('fr/' if lang == 'fr' else ''), wait_until='load'); pg.wait_for_function('() => !!window.__ev', timeout=60000)
    pg.locator('#heroDemo:visible, #mhEx:visible, #demoBtn:visible').first.click()
    pg.wait_for_function('() => __ev("S.step === 4 && S.cuts.length > 0")', timeout=240000); pg.wait_for_timeout(800)
    # 1. the camera
    left = ev(pg, "_t('rec.left', { s: 8 })")
    check(tag + ' : caméra : le temps restant pendant la prise (« %s »)' % left, ('8' in left) and (('encore' in left) if lang == 'fr' else ('left' in left)))
    check(tag + ' : caméra : la prise s’arrête seule à la fin du passage (fin = fin du passage + 0,3 s)', 'S.segEnd + 0.3' in ev(pg, 'startTake.toString()'))
    check(tag + ' : caméra : sans image après 4 s, un message clair', len(ev(pg, "_t('cam.black')")) > 40 and 'cam.black' in ev(pg, 'openCamera.toString()'))
    # 2. the passage
    ev(pg, 'go(1)'); pg.wait_for_timeout(800)
    check(tag + ' : passage : les choix rapides 15 s / 30 s / refrain sont là', pg.locator('#segQuick button').count() == 3 and ev(pg, "!$('#segQuick').hidden"))
    dur = ev(pg, 'S.song.duration')
    pg.locator('#segQuick [data-q="15"]').scroll_into_view_if_needed(); pg.locator('#segQuick [data-q="15"]').click(); pg.wait_for_timeout(600)
    d = ev(pg, 'S.segEnd - S.segStart')
    check(tag + ' : « 15 s » : un passage de 15 s (ou tout le son s’il est plus court), et on l’entend', abs(d - min(15, dur)) < 0.05 and ev(pg, 'listenOn') and pg.locator('#segQuick [data-q="15"]').get_attribute('aria-pressed') == ('true' if dur >= 15 else 'false'), (d, dur))
    ev(pg, 'stop(true)'); ev(pg, 'stop(true)')
    ref = ev(pg, '(() => { const c = segChorus(); return c ? [c.t0, c.t1] : null; })()')
    if ref:
        pg.locator('#segQuick [data-q="ref"]').click(); pg.wait_for_timeout(600)
        check(tag + ' : « Refrain » : le passage commence au 1er refrain trouvé', abs(ev(pg, 'S.segStart') - ref[0]) < 0.05, (ev(pg, 'S.segStart'), ref))
    else:
        check(tag + ' : « Refrain » grisé quand aucun refrain n’est trouvé', pg.locator('#segQuick [data-q="ref"]').is_disabled())
    ev(pg, 'stop(true)'); ev(pg, 'stop(true)')
    ev(pg, "waveDrag = { id: 7, side: 'l', moved: true }"); ev(pg, "waveUp({ pointerId: 7, type: 'pointerup' })"); pg.wait_for_timeout(500)
    check(tag + ' : la poignée lâchée : le son part de là', ev(pg, 'listenOn'))
    ev(pg, 'stop(true)'); ev(pg, 'stop(true)')
    # 3. the export screen
    ev(pg, 'go(4)'); pg.wait_for_timeout(500)
    ev(pg, 'expOpen(), expUpdate(0.16)'); pg.wait_for_timeout(300)
    ws, hid = [], []
    for k in range(5):
        pg.wait_for_timeout(1000); ws.append(float(ev(pg, "parseFloat($('#expBar').style.width)"))); hid.append(ev(pg, "$('#expScreen').hidden"))
        if k == 1: ev(pg, 'expUpdate(0.165)')
    check(tag + ' : export : la barre avance en continu même quand le vrai chiffre traîne (16 → 17 %)', all(b > a for a, b in zip(ws, ws[1:])) and ws[-1] < 22, (ws, hid))
    ev(pg, 'expT = performance.now() - 10000, EXP_SM.hist = [[performance.now() - 8000, 0.1], [performance.now(), 0.3]], expUpdate(0.3)'); pg.wait_for_timeout(600)
    eta = pg.locator('#expEta').inner_text().strip() if pg.locator('#expEta').is_visible() else ''
    check(tag + ' : export : le temps restant estimé', eta and any(c.isdigit() for c in eta), eta)
    st = pg.evaluate("() => { const c = getComputedStyle(document.querySelector('#xSteps')); return [c.borderTopWidth, c.boxShadow]; }")
    check(tag + ' : export : les étapes ne ressemblent plus à des boutons (pas de cadre ni d’ombre)', st == ['0px', 'none'], st)
    ev(pg, 'expUpdate(1)'); pg.wait_for_timeout(200)
    w100 = ev(pg, "$('#expBar').style.width"); check(tag + ' : export : 100 % seulement à la fin', w100 == '100.0%' or w100 == '100%', w100)
    ev(pg, 'expClose(false)')
    check(tag + ' : aucune erreur dans la page', not errs, errs)
    ctx.close()


def main():
    tmp = tempfile.mkdtemp(prefix='stalak-clarity-'); site = os.path.join(tmp, 'site'); shutil.copytree(PUBLIC, site)
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from _probe import add_probe; add_probe(site)
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=site))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = 'http://127.0.0.1:%d/' % srv.server_address[1]
    with sync_playwright() as p:
        b = p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
        for lang, dev in (('fr', 'iPhone 12'), ('en', 'ordinateur')):
            try: run(b, p, base, lang, dev)
            except Exception as e: check(dev + ' ' + lang + ' : déroulé complet', False, str(e)[:400])
        b.close()
    srv.shutdown(); shutil.rmtree(tmp, ignore_errors=True)
    print('%d/%d réussis' % (sum(results), len(results)))
    sys.exit(0 if all(results) else 1)


main()
