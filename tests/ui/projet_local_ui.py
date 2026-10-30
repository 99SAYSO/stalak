"""Test of the project kept in the phone (audit of 30/10, n° 1): a song and two real takes, a little work (free handles, a
filter), then the page is reloaded (as Safari does when one goes to Photos or TikTok): « Reprendre ton dernier montage ? »
brings everything back. Also: the example alone is not offered, « Non merci », a missing file, leaving the page.
Python Playwright (chromium) + ffmpeg.

    python3 /abs/path/tests/ui/projet_local_ui.py <path of a built public/ folder> [folder for screenshots]

An iPhone (iPhone 15 Pro emulated) and a computer, in French and English."""
import functools, http.server, os, shutil, subprocess, sys, tempfile, threading
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.sync_api import sync_playwright

PUBLIC = os.path.abspath(sys.argv[1])
SHOTS = sys.argv[2] if len(sys.argv) > 2 else None
results = []
PW = None


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


def check(name, ok, info=''):
    results.append(ok)
    print(('PASS ' if ok else 'FAIL ') + name + (('  — ' + str(info)) if info and not ok else ''))


def ev(pg, code):
    return pg.evaluate('s => __ev(s)', code)


def cols_of(pg):
    """the colour in the middle of the preview, on a shot of each take"""
    out = []
    for k in range(2):
        t = ev(pg, "(() => { const c = S.cuts.find(c => S.takes.indexOf(baseOf(c.take)) === %d); return c ? (c.t0 + c.t1) / 2 : null; })()" % k)
        ev(pg, 'stop(true), showFrame(%f)' % t); pg.wait_for_timeout(1500); ev(pg, 'showFrame(%f)' % t); pg.wait_for_timeout(800)
        out.append(ev(pg, "(() => { const d = g.getImageData(Math.floor(view.width / 2), Math.floor(view.height / 2), 1, 1).data; return [d[0], d[1], d[2]]; })()"))
    return out


def ready(pg):
    pg.wait_for_function('window.__ev && window.MP4Box', timeout=20000)


def run(b, base, site, lang, iphone):
    tag = ('iPhone' if iphone else 'ordinateur') + ' ' + lang
    opts = dict(PW.devices['iPhone 15 Pro']) if iphone else {'viewport': {'width': 1280, 'height': 860}}
    ctx = b.new_context(**opts, locale='en-US' if lang == 'en' else 'fr-FR')
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    url = base + ('en/' if lang == 'en' else '')
    pg.goto(url, wait_until='load'); ready(pg)
    # the example alone: nothing to pick up afterwards
    pg.locator('#demoBtn').click(); pg.wait_for_function('() => __ev("S.step === 4 && S.cuts.length > 0")', timeout=60000)
    pg.wait_for_timeout(7000)
    pg.reload(wait_until='load'); ready(pg); pg.wait_for_timeout(800)
    check(tag + ' : l’exemple seul n’est pas proposé', not pg.locator('#lpOffer').is_visible())
    # a song and two takes of the person
    pg.set_input_files('#songFile', os.path.join(site, 'beat.wav'))
    pg.wait_for_function('() => __ev("!!S.song")', timeout=30000)
    pg.set_input_files('#takeFiles', [os.path.join(site, 'take1.webm'), os.path.join(site, 'take2.webm')])
    pg.wait_for_function('() => __ev("S.takes.length === 2 && S.takes.every(t => t.status !== \'pending\')")', timeout=90000)
    ev(pg, "go(4)"); pg.wait_for_function('() => __ev("S.step === 4 && S.cuts.length > 0")', timeout=30000)
    ev(pg, "segFree('l', 3.37), updateSegment(), segFree('r', 11.83), updateSegment(), rebuild(false), setFilter('nb', true)")
    pg.wait_for_timeout(300)
    base_cols = cols_of(pg)
    before = ev(pg, "({ a: S.segStart, b: S.segEnd, f: S.filter, n: S.takes.length, cuts: S.cuts.map(c => [+c.t0.toFixed(3), +c.t1.toFixed(3), S.takes.indexOf(baseOf(c.take))]), name: S.song.name, off: S.takes.map(t => +t.offset.toFixed(3)) })")
    # kept in the phone within a few seconds
    pg.wait_for_function('() => __ev("LP.saved != null && !LP.running && LP.pending == null && LP.quick === lpQuick()")', timeout=30000)
    check(tag + ' : projet gardé dans le téléphone', ev(pg, '!lpUnsaved()'))
    # Safari reloads the tab
    pg.reload(wait_until='load'); ready(pg)
    pg.wait_for_selector('#lpOffer:not([hidden])', timeout=10000)
    p = pg.locator('#lpOfferP').inner_text()
    check(tag + ' : « Reprendre ton dernier montage ? » à l’ouverture', pg.locator('#lpOffer').is_visible() and 'beat' in p and ('2 takes' in p if lang == 'en' else '2 prises' in p), p)
    if SHOTS: pg.locator('#lpOffer').screenshot(path=os.path.join(SHOTS, 'reprendre-' + ('iphone' if iphone else 'ordi') + '-' + lang + '.png'))
    pg.locator('#lpYes').click()
    pg.wait_for_function('() => __ev("S.step === 4 && S.cuts.length > 0 && !LP.applying")', timeout=90000)
    after = ev(pg, "({ a: S.segStart, b: S.segEnd, f: S.filter, n: S.takes.length, cuts: S.cuts.map(c => [+c.t0.toFixed(3), +c.t1.toFixed(3), S.takes.indexOf(baseOf(c.take))]), name: S.song.name, off: S.takes.map(t => +t.offset.toFixed(3)) })")
    check(tag + ' : tout revient (son, 2 prises, calage, passage libre, filtre, montage)', after == before, (before, after))
    check(tag + ' : la carte disparaît, message', not pg.locator('#lpOffer').is_visible() and ('back' in pg.locator('#status').inner_text() if lang == 'en' else 'revenu' in pg.locator('#status').inner_text()), pg.locator('#status').inner_text())
    # the takes' pictures are there again, as before the reload
    cols = cols_of(pg)
    check(tag + ' : les vidéos reprises s’affichent comme avant', all(sum(abs(x - y) for x, y in zip(c0, c1)) < 40 for c0, c1 in zip(base_cols, cols)) and base_cols[0] != base_cols[1], (base_cols, cols))
    # nothing new: no question when leaving; a change not kept yet: the browser asks
    pg.wait_for_timeout(500)
    check(tag + ' : rien à perdre → pas de question en quittant', ev(pg, '!lpUnsaved()'))
    ev(pg, "setFilter('none', true)")
    check(tag + ' : changement pas encore gardé → question en quittant', ev(pg, 'lpUnsaved()'))
    asked = pg.evaluate("() => { const e = new Event('beforeunload', { cancelable: true }); window.dispatchEvent(e); return e.defaultPrevented; }")
    check(tag + ' : le navigateur demande avant de quitter', asked)
    pg.wait_for_function('() => __ev("!lpUnsaved()")', timeout=20000)
    # « Non merci »
    pg.reload(wait_until='load'); ready(pg); pg.wait_for_selector('#lpOffer:not([hidden])', timeout=10000)
    pg.locator('#lpNo').click()
    check(tag + ' : « Non merci » ferme la carte', not pg.locator('#lpOffer').is_visible() and ev(pg, '!S.song'))
    # a missing file: a clear message
    ev(pg, "lpKeys('media').then(ks => lpDel('media', ks[0]))"); pg.wait_for_timeout(300)
    pg.reload(wait_until='load'); ready(pg); pg.wait_for_selector('#lpOffer:not([hidden])', timeout=10000)
    pg.locator('#lpYes').click(); pg.wait_for_function('() => __ev("!LP.applying")', timeout=30000)
    msg = pg.locator('#lpOfferP').inner_text()
    check(tag + ' : fichier manquant → message simple', ('missing' in msg) if lang == 'en' else ('n’est plus' in msg), msg)
    check(tag + ' : aucune erreur dans la page', not errs, errs)
    ctx.close()


def main():
    tmp = tempfile.mkdtemp(prefix='stalak-local-')
    site = os.path.join(tmp, 'site'); shutil.copytree(PUBLIC, site)
    for page in ('index.html', 'en/index.html'):
        p = os.path.join(site, page); html = open(p, encoding='utf-8').read()
        assert 'applyLang();\n})();' in html, 'repère de la sonde introuvable'
        open(p, 'w', encoding='utf-8').write(html.replace('applyLang();\n})();', 'applyLang();\nwindow.__ev = (s) => eval(s);\n})();'))
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
        global PW; PW = p
        only = os.environ.get('LOCAL_ONLY')
        for lang in ('fr', 'en'):
            for iphone in (True, False):
                if only and only != ('iphone' if iphone else 'ordi') + '-' + lang: continue
                try: run(b, base, site, lang, iphone)
                except Exception as e: check(('iPhone' if iphone else 'ordinateur') + ' ' + lang + ' : déroulé complet', False, str(e)[:300])
        b.close()
    srv.shutdown(); shutil.rmtree(tmp, ignore_errors=True)
    print('%d/%d réussis' % (sum(results), len(results)))
    sys.exit(0 if all(results) else 1)


main()
