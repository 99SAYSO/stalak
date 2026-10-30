"""Test of the export fixes of 30/10 (21 h): before a new export the previous video stops playing and lets go of its file;
a cancelled export gives the previous video back (and keeps it as the one to save); two real exports in a row take about
the same time. Also a look at the two export buttons. Python Playwright (chromium).

    python3 /abs/path/tests/ui/export_pub_ui.py <path of a built public/ folder> [folder for screenshots]

An iPhone (iPhone 15 Pro emulated: size, touch, Safari's user agent) and a computer, in French and English. The test machine
has no AAC encoder: the real exports go through the real-time recorder (the iPhone uses WebCodecs, faster)."""
import functools, http.server, os, shutil, sys, tempfile, threading, time
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


def run(b, base, lang, iphone, real):
    tag = ('iPhone' if iphone else 'ordinateur') + ' ' + lang
    opts = dict(PW.devices['iPhone 15 Pro']) if iphone else {'viewport': {'width': 1280, 'height': 860}}
    ctx = b.new_context(**opts, locale='en-US' if lang == 'en' else 'fr-FR')
    ctx.route('**/tag/js/gpt.js', lambda r: r.fulfill(status=404, body=''))
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.goto(base + ('en/' if lang == 'en' else ''), wait_until='load')
    pg.wait_for_function('window.__ev && window.MP4Box', timeout=20000)
    pg.locator('#demoBtn').click()
    pg.wait_for_function('() => __ev("S.step === 4 && S.cuts.length > 0")', timeout=60000)
    ev(pg, "ACCT.state.user = null, adUI()")
    if SHOTS:
        card = pg.locator('#expRow').locator('xpath=ancestor::*[contains(@class,"card")][1]')
        card.scroll_into_view_if_needed(); pg.wait_for_timeout(300)
        card.screenshot(path=os.path.join(SHOTS, 'export-' + ('iphone' if iphone else 'ordi') + '-' + lang + '.png'))

    # a previous video, playing (a real short video: the demo's first take)
    pg.evaluate("""() => { window.__paused = 0; const rv = document.querySelector('#resultVideo');
      rv.pause = function(){ window.__paused++; return HTMLMediaElement.prototype.pause.call(this); }; }""")
    ev(pg, """(() => { const rv = $('#resultVideo'); window.__old = new Blob([new Uint8Array(4096)], { type: 'video/mp4' }); lastBlob = window.__old;
      window.__oldUrl = URL.createObjectURL(window.__old); rv.src = window.__oldUrl; rv.hidden = false; $('#result').hidden = false;
      window.__revoked = []; const rk = URL.revokeObjectURL; URL.revokeObjectURL = u => { window.__revoked.push(u); rk.call(URL, u); }; })()""")
    # an export that waits until it is cancelled: what is there during the export, and after
    ev(pg, """(() => { pickVideoConfig = async () => null;
      renderRealtime = () => new Promise(res => { const rv = $('#resultVideo');
        window.__during = [rv.getAttribute('src'), $('#result').hidden, window.__paused];
        const iv = setInterval(() => { if (S.cancel){ clearInterval(iv); res({ blob: new Blob(['y']), ext: 'webm' }); } }, 40); }); })()""")
    pg.evaluate('() => { window.__p = __ev("exportOne()"); }')
    pg.wait_for_function('() => window.__during', timeout=10000)
    d = pg.evaluate('window.__during')
    check(tag + ' : nouvel export → la vidéo précédente est coupée (pause) et lâche son fichier', d[2] >= 1 and d[0] is None and d[1] is True, d)
    pg.locator('#expCancel').wait_for(state='visible'); pg.evaluate("document.querySelector('#expCancel').click()")
    pg.evaluate('() => window.__p'); pg.wait_for_timeout(200)
    after = pg.evaluate("""() => [document.querySelector('#resultVideo').getAttribute('src') === window.__oldUrl, document.querySelector('#result').hidden,
      __ev('lastBlob') === window.__old, window.__revoked.includes(window.__oldUrl), __ev('S.exporting')]""")
    check(tag + ' : export annulé → la vidéo précédente revient, toujours à enregistrer', after == [True, False, True, False, False], after)
    st = pg.locator('#status').inner_text()
    check(tag + ' : message « annulé »', ('cancel' in st.lower()) if lang == 'en' else ('annul' in st.lower()), st)
    # an export that ends: the new video replaces the old one, whose file is let go
    ev(pg, "renderRealtime = async () => ({ blob: new Blob([new Uint8Array(2048)], { type: 'video/webm' }), ext: 'webm' })")
    pg.evaluate('() => __ev("exportOne()")'); pg.wait_for_timeout(200)
    nw = pg.evaluate("""() => [__ev('lastBlob') !== window.__old, document.querySelector('#resultVideo').getAttribute('src') !== window.__oldUrl, window.__revoked.includes(window.__oldUrl), document.querySelector('#result').hidden]""")
    check(tag + ' : export fini → nouvelle vidéo, ancienne libérée', nw == [True, True, True, False], nw)

    if real:
        # two real exports in a row (the second with the first one playing): the second is not slower
        pg.reload(wait_until='load'); pg.wait_for_function('window.__ev && window.MP4Box', timeout=20000)
        pg.locator('#demoBtn').click(); pg.wait_for_function('() => __ev("S.step === 4 && S.cuts.length > 0")', timeout=60000)
        ev(pg, "ACCT.state.user = null, S.nBars = 2, S.locks = [], rebuild(false)")
        times = []
        for k in range(2):
            t0 = time.time()
            pg.evaluate('async () => { await __ev("exportOne()"); }')
            times.append(time.time() - t0)
            ok = ev(pg, '!!lastBlob && !S.exporting')
            if k == 0:
                pg.evaluate("() => { const rv = document.querySelector('#resultVideo'); rv.muted = true; return rv.play().catch(() => {}); }"); pg.wait_for_timeout(500)
                playing = pg.evaluate("() => !document.querySelector('#resultVideo').paused")
        check(tag + ' : deux vrais exports de suite, le 2e n’est pas plus lent (%.1f s puis %.1f s)' % tuple(times), ok and times[1] <= times[0] * 1.3 + 1, (times, playing))
    check(tag + ' : aucune erreur dans la page', not errs, errs)
    ctx.close()


def main():
    tmp = tempfile.mkdtemp(prefix='stalak-export-')
    site = os.path.join(tmp, 'site'); shutil.copytree(PUBLIC, site)
    for page in ('index.html', 'en/index.html'):
        p = os.path.join(site, page); html = open(p, encoding='utf-8').read()
        assert 'applyLang();\n})();' in html, 'repère de la sonde introuvable'
        open(p, 'w', encoding='utf-8').write(html.replace('applyLang();\n})();', 'applyLang();\nwindow.__ev = (s) => eval(s);\n})();'))
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=site))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = 'http://127.0.0.1:%d/' % srv.server_address[1]
    with sync_playwright() as p:
        b = p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'])
        global PW; PW = p
        for lang in ('fr', 'en'):
            for iphone in (True, False):
                try: run(b, base, lang, iphone, real=(lang == 'fr'))
                except Exception as e: check(('iPhone' if iphone else 'ordinateur') + ' ' + lang + ' : déroulé complet', False, str(e)[:300])
        b.close()
    srv.shutdown(); shutil.rmtree(tmp, ignore_errors=True)
    print('%d/%d réussis' % (sum(results), len(results)))
    sys.exit(0 if all(results) else 1)


main()
