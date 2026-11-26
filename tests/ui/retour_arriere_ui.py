"""Test of a project after a step back (Clarity, 26/11: a visitor left the edit for a page of the site, came back and started all
over again: docs/handoff/chef-aide-glacon-26-11.md). Python Playwright (chromium) + ffmpeg, iPhone 15 Pro and a computer.

    python3 /abs/path/tests/ui/retour_arriere_ui.py <path of a built public/ folder>

A song and two takes of the person, the edit at step 4; then a page of the site, then « back »:
- the browser keeps the page (back-forward cache): the edit is as it was;
- the browser has to load it again (the Google app, many in-app browsers): the edit comes back by itself, takes, song, passage and
  cuts, at step 4, without asking;
- a reload (Safari going to Photos) still asks « Reprendre ton dernier montage ? » (decided 30/10, unchanged);
- « Retour au menu principal » after the save, then back: no project comes back by itself."""
import functools, http.server, os, shutil, subprocess, sys, tempfile, threading
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.sync_api import sync_playwright

PUBLIC = os.path.abspath(sys.argv[1])
results = []


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


def check(name, ok, info=''):
    results.append(bool(ok))
    print(('PASS ' if ok else 'FAIL ') + name + (('  — ' + str(info)) if info and not ok else ''))


def ev(pg, c):
    return pg.evaluate('s => __ev(s)', c)


def ready(pg):
    pg.wait_for_function('window.__ev && window.MP4Box', timeout=30000)


STATE = "({ n: S.takes.length, name: S.song && S.song.name, a: +S.segStart.toFixed(2), b: +S.segEnd.toFixed(2), step: S.step, cuts: S.cuts.length })"


def edit(pg, site):
    pg.set_input_files('#songFile', os.path.join(site, 'beat.wav'))
    pg.wait_for_function('() => __ev("!!S.song")', timeout=30000)
    pg.set_input_files('#takeFiles', [os.path.join(site, 'take1.webm'), os.path.join(site, 'take2.webm')])
    pg.wait_for_function('() => __ev("S.takes.length === 2 && S.takes.every(t => t.status !== \'pending\')")', timeout=90000)
    ev(pg, 'go(4)'); pg.wait_for_function('() => __ev("S.step === 4 && S.cuts.length > 0")', timeout=30000)
    ev(pg, "segFree('l', 3.37), updateSegment(), segFree('r', 11.83), updateSegment(), rebuild(false)"); pg.wait_for_timeout(300)
    pg.wait_for_function('() => __ev("LP.saved != null && !LP.running && LP.pending == null && LP.quick === lpQuick()")', timeout=30000)
    return ev(pg, STATE)


def run(b, base, site, lang, iphone, bfcache):
    tag = ('iPhone' if iphone else 'ordinateur') + ' ' + lang + (' (page gardée par le navigateur)' if bfcache else ' (page rechargée au retour)')
    opts = dict(b._pw.devices['iPhone 15 Pro']) if iphone else {'viewport': {'width': 1280, 'height': 860}}
    ctx = b.new_context(**opts, locale='en-US' if lang == 'en' else 'fr-FR')
    if not bfcache: ctx.add_init_script("addEventListener('unload', () => {});")   # no back-forward cache, as in the Google app
    pg = ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:200]) if 'ViewTransition' not in str(e) else None)   # the site's page transitions (Marketing): aborted by the test's quick navigation
    url = base + ('' if lang == 'en' else 'fr/')
    pg.goto(url, wait_until='load'); ready(pg)
    before = edit(pg, site)
    pg.goto(base + 'how-to-lip-sync.html', wait_until='load'); pg.wait_for_timeout(500)
    pg.go_back(wait_until='load'); ready(pg)
    try: pg.wait_for_function('() => __ev("!!S.song && S.step === 4 && S.cuts.length > 0")', timeout=20000)
    except Exception: pass
    after = ev(pg, STATE)
    check(tag + ' : après un retour en arrière, le montage est là, tout seul (prises, son, passage, étape 4)', after == before and not pg.locator('#lpOffer').is_visible(), [before, after])
    if not bfcache:
        # a reload is still a question (decided 30/10)
        pg.reload(wait_until='load'); ready(pg)
        try: pg.wait_for_selector('#lpOffer:not([hidden])', timeout=10000); asked = True
        except Exception: asked = False
        check(tag + ' : un rechargement demande toujours « Reprendre ton dernier montage ? »', asked and not ev(pg, '!!S.song'))
        # the person goes home on purpose (« Retour au menu principal » does homeGo): nothing comes back by itself
        pg.locator('#lpYes').click(); pg.wait_for_function('() => __ev("!!S.song && S.step === 4")', timeout=30000)
        ev(pg, 'homeGo()'); pg.wait_for_load_state('load'); ready(pg); pg.wait_for_timeout(1500)
        pg.goto(base + 'how-to-lip-sync.html', wait_until='load'); pg.go_back(wait_until='load'); ready(pg); pg.wait_for_timeout(2500)
        check(tag + ' : parti exprès à l’accueil, puis retour en arrière : rien ne revient tout seul', not ev(pg, '!!S.song'))
    check(tag + ' : aucune erreur dans la page', not errs, errs)
    ctx.close()


def main():
    tmp = tempfile.mkdtemp(prefix='stalak-back-')
    site = os.path.join(tmp, 'site'); shutil.copytree(PUBLIC, site)
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from _probe import add_probe; add_probe(site)
    ff = shutil.which('ffmpeg')
    beat = "0.8*sin(2*PI*60*t)*exp(-25*mod(t,0.5))+0.15*sin(2*PI*440*t)"
    subprocess.run([ff, '-nostdin', '-v', 'error', '-y', '-f', 'lavfi', '-i', "aevalsrc='%s':s=44100:d=20" % beat, '-ac', '1', os.path.join(site, 'beat.wav')], check=True)
    for i, col in ((1, 'red'), (2, 'blue')):
        subprocess.run([ff, '-nostdin', '-v', 'error', '-y', '-f', 'lavfi', '-i', 'color=c=%s:s=360x640:r=30:d=20' % col, '-f', 'lavfi', '-i', "aevalsrc='%s':s=44100:d=20" % beat,
                        '-shortest', '-c:v', 'libvpx', '-b:v', '300k', '-c:a', 'libopus', os.path.join(site, 'take%d.webm' % i)], check=True)
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=site))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = 'http://127.0.0.1:%d/' % srv.server_address[1]
    with sync_playwright() as p:
        b = p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'])
        b._pw = p
        for a in (('fr', True, False), ('en', True, True), ('fr', False, False)):
            try: run(b, base, site, *a)
            except Exception as e: check(' '.join(str(x) for x in a) + ' : déroulé complet', False, str(e)[:300])
        b.close()
    srv.shutdown(); shutil.rmtree(tmp, ignore_errors=True)
    print('%d/%d réussis' % (sum(results), len(results)))
    sys.exit(0 if all(results) else 1)


main()
