"""Test of the takes filmed one after the other (owner, 25/11: black screen at the 2nd take on his iPhone, nothing answered,
he had to close the site; « zéro erreur » on the takes). Python Playwright (chromium, a fake camera, an iPhone emulated).

Usage: python3 tests/ui/prises_ui.py <public dir> [shots dir]

- 12 takes in a row on a short passage (3 s), the camera never closed: each take is kept, numbered, with its small picture;
  the camera picture still runs after each one; no error in the page.
- While the camera is open, nothing heavy runs in the background (no light copy, no picture analysis, no decoding of the
  takes' pictures): the phone's encoder is left to the camera. They run once the camera is closed, one take at a time.
- A camera the phone stopped (track ended) is opened again before the next take, without a black screen.
- The message « Prise n enregistrée » shows at the top of the camera, then goes away by itself.
- Then the 12 takes are all set on the song and the edit is made with them.
"""
import functools, http.server, os, shutil, sys, tempfile, threading, time
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.sync_api import sync_playwright

PUBLIC = os.path.abspath(sys.argv[1])
SHOTS = sys.argv[2] if len(sys.argv) > 2 else None
N = 12
STOP = int(os.environ.get('STOP', '6'))
results = []


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


def check(name, ok, info=''):
    results.append(bool(ok))
    print(('PASS ' if ok else 'FAIL ') + name + (('  — ' + str(info)) if info and not ok else ''))


def ev(pg, code):
    return pg.evaluate('s => __ev(s)', code)


def shot(pg, name):
    if SHOTS: pg.screenshot(path=os.path.join(SHOTS, name + '.png'))


def run(b, base, lang, dev):
    tag = dev + ' ' + lang
    ctx = b.new_context(**PW.devices[dev], locale='fr-FR' if lang == 'fr' else 'en-US', permissions=['camera', 'microphone'])
    ctx.add_init_script('window.__stalakM3on = 1;')
    ctx.route('**/api/**', lambda r: r.fulfill(status=204, body=''))
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.on('console', lambda m: errs.append('console: ' + m.text[:200]) if m.type == 'error' and 'favicon' not in m.text else None)
    pg.goto(base + ('fr/' if lang == 'fr' else ''), wait_until='load'); pg.wait_for_function('window.__ev && window.StalakM3', timeout=60000)
    pg.locator('#heroDemo:visible, #mhEx:visible, #demoBtn:visible').first.click()
    pg.wait_for_function('() => __ev("S.step === 4 && S.cuts.length > 0")', timeout=240000); pg.wait_for_timeout(1200)
    # a short passage: 3 s
    ev(pg, 'go(1)'); pg.wait_for_timeout(500)
    ev(pg, '(S.segA = S.segStart, S.segB = S.segStart + 3, updateSegment(), true)')
    ev(pg, 'go(2)'); pg.wait_for_timeout(1000)
    n0 = ev(pg, "S.takes.filter(t => !t.broll && t.kind !== 'demo').length")
    pg.locator('#recOpen').click(); pg.wait_for_function("() => document.documentElement.classList.contains('m3cam') && __ev('!!recStream')", timeout=15000)
    pg.wait_for_function("() => document.querySelector('#recVideo').videoWidth > 0", timeout=15000)
    if ev(pg, 'recDelay'): ev(pg, 'recTimerSet(0)')
    heavy, black, numbers, t0 = [], [], [], time.time()
    for i in range(N):
        if i == STOP:
            # the phone stops the camera (iPhone: another app, memory): the page opens it again before the next take
            ev(pg, "(recStream.getVideoTracks()[0].stop(), true)")
        pg.locator('#recGo').click()
        if i == STOP:
            pg.wait_for_function("() => __ev('!!recStream && recStream.getTracks().every(t => t.readyState === \"live\") && !camFixing')", timeout=15000)
            pg.wait_for_timeout(500)
            pg.locator('#recGo').click()
        pg.wait_for_function("() => __ev(\"!!recRec && recRec.state === 'recording'\")", timeout=15000)
        # while it films: nothing heavy in the background
        heavy.append(ev(pg, "[S.takes.filter(t => t.proxyState === 'run').length, qualIdle()]"))
        pg.wait_for_function(f"() => __ev(\"(!recRec || recRec.state === 'inactive') && S.takes.filter(t => !t.broll && t.kind !== 'demo').length === {n0 + i + 1}\")", timeout=40000)
        pg.wait_for_timeout(250)
        black.append(pg.evaluate("() => { const v = document.querySelector('#recVideo'); return [v.videoWidth > 0, !v.paused, !!v.srcObject]; }"))
        numbers.append(pg.locator('.m3-pill').inner_text())
        if i == 0:
            top = pg.evaluate("() => { const d = document.querySelector('#recDone'), r = d.getBoundingClientRect(), g = document.querySelector('#recGo').getBoundingClientRect(); return [!d.hidden, r.bottom < g.top, r.top >= 0, r.bottom <= innerHeight / 2]; }")
            check(tag + ' : « Prise 1 enregistrée » en haut de la caméra, au-dessus des boutons', top == [True, True, True, True], top)
            shot(pg, 'prises-toast-%s-%s' % (dev.replace(' ', ''), lang))
    secs = round(time.time() - t0)
    check(tag + ' : %d prises à la suite, chacune gardée' % N, ev(pg, "S.takes.filter(t => !t.broll && t.kind !== 'demo').length") == n0 + N, ev(pg, "S.takes.length"))
    check(tag + ' : après chaque prise, l’image de la caméra tourne encore (jamais d’écran noir)', all(x == [True, True, True] for x in black), black)
    check(tag + ' : le numéro de la prise suit (Prise %d … Prise %d)' % (n0 + 2, n0 + N + 1), numbers[-1].startswith(('Prise ' if lang == 'fr' else 'Take ') + str(n0 + N + 1)), numbers)
    check(tag + ' : pendant les prises, aucune copie légère ni analyse d’image en route', all(h == [0, False] for h in heavy), heavy)
    check(tag + ' : la caméra arrêtée par le téléphone est rouverte toute seule', ev(pg, "!!recStream && recStream.getTracks().every(t => t.readyState === 'live')"))
    gone = pg.wait_for_function("() => document.querySelector('#recDone').hidden", timeout=8000) is not None
    check(tag + ' : le message « Prise enregistrée » s’en va tout seul', gone)
    check(tag + ' : la caméra tient dans l’écran (rien derrière, en bas non plus)', pg.evaluate("""() => { const p = document.querySelector('#recPanel').getBoundingClientRect(), g = document.querySelector('#recGo').getBoundingClientRect(), c = document.querySelector('#recClose').getBoundingClientRect();
        return p.top <= 0 && p.bottom >= innerHeight && g.bottom <= innerHeight && c.bottom <= innerHeight && getComputedStyle(document.documentElement).backgroundColor === 'rgb(0, 0, 0)'; }"""))
    shot(pg, 'prises-camera-%s-%s' % (dev.replace(' ', ''), lang))
    # the camera closed: the takes get their pictures, one after the other
    pg.locator('#recClose').click(); pg.wait_for_timeout(500)
    pg.wait_for_function("() => __ev(\"S.takes.filter(t => t.filmed && t.status === 'pending').length === 0\")", timeout=120000)
    check(tag + ' : les %d prises sont calées sur le son' % N, ev(pg, "S.takes.filter(t => t.filmed && t.status !== 'pending').length") == N)
    check(tag + ' : les prises ont leur vignette', pg.evaluate("() => [...document.querySelectorAll('#takeList li.take canvas.m3-th')].filter(c => c.dataset.ok).length") >= N)
    ev(pg, 'go(4)'); pg.wait_for_function('() => __ev("S.step === 4 && S.cuts.length > 0")', timeout=60000)
    used = ev(pg, "new Set(S.cuts.map(c => c.take).filter(t => t && t.filmed)).size")
    check(tag + ' : le montage est fait avec les prises filmées', used >= 2, used)
    check(tag + ' : aucune erreur dans la page (%d s de prises)' % secs, not errs, errs[:5])
    ctx.close()


def main():
    global PW
    tmp = tempfile.mkdtemp(prefix='stalak-prises-'); site = os.path.join(tmp, 'site'); shutil.copytree(PUBLIC, site)
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from _probe import add_probe; add_probe(site)
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=site))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = 'http://127.0.0.1:%d/' % srv.server_address[1]
    with sync_playwright() as p:
        PW = p
        b = p.chromium.launch(args=['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'])
        for a in (('fr', 'iPhone 13'), ('en', 'iPhone SE')):
            try: run(b, base, *a)
            except Exception as e: check(' '.join(a[::-1]) + ' : déroulé complet', False, str(e)[:400])
        b.close()
    srv.shutdown(); shutil.rmtree(tmp, ignore_errors=True)
    print('%d/%d réussis' % (sum(results), len(results)))
    sys.exit(0 if all(results) else 1)


if __name__ == '__main__':
    main()
