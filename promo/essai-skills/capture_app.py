"""Take One « real product on screen »: the real Stalak app (built public/), on a phone (Pixel 7 size), driven like a user
with the owner's song and takes; a screenshot of each step and where the preview sits on the edit screen.

    python3 capture_app.py <built public/> <out dir> <song file> <take files...>
"""
import functools, http.server, json, os, shutil, sys, tempfile, threading
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.sync_api import sync_playwright

PUBLIC, OUT, SONG, TAKES = os.path.abspath(sys.argv[1]), sys.argv[2], sys.argv[3], sys.argv[4:]


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


def ev(pg, code):
    return pg.evaluate('s => __ev(s)', code)


RECTS = """sels => { const r = {}; for (const [k, sel] of Object.entries(sels)){ const el = typeof sel === 'string' && sel.startsWith('text:') ? [...document.querySelectorAll('p,div,span,strong,small')].find(e => e.offsetParent && e.children.length === 0 && e.textContent.trim().startsWith(sel.slice(5))) : document.querySelector(sel); if (el && el.offsetParent !== null){ const b = el.getBoundingClientRect(); r[k] = [+b.x.toFixed(1), +b.y.toFixed(1), +b.width.toFixed(1), +b.height.toFixed(1)]; } } return r; }"""
CLEAN = """() => { for (const e of document.querySelectorAll('p,div,span')) if (e.children.length === 0 && /Preparing the test/.test(e.textContent)) e.textContent = ''; }"""


def shot(pg, info, name, sels):
    pg.evaluate(CLEAN); pg.wait_for_timeout(200)
    pg.screenshot(path=os.path.join(OUT, name + '.png'))
    info.setdefault('shots', {})[name] = pg.evaluate(RECTS, sels)


def main():
    os.makedirs(OUT, exist_ok=True)
    tmp = tempfile.mkdtemp(); site = os.path.join(tmp, 'site'); shutil.copytree(PUBLIC, site)
    p = os.path.join(site, 'index.html'); html = open(p, encoding='utf-8').read()
    assert 'applyLang();\n})();' in html
    open(p, 'w', encoding='utf-8').write(html.replace('applyLang();\n})();', 'applyLang();\nwindow.__ev = (s) => eval(s);\n})();'))
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=site))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = 'http://127.0.0.1:%d/' % srv.server_address[1]
    info = {}
    with sync_playwright() as pw:
        b = pw.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
        dev = dict(pw.devices['Pixel 7']); dev.pop('default_browser_type', None)
        ctx = b.new_context(**dev, locale='en-US')
        ctx.route('**/api/**', lambda r: r.fulfill(status=204, body=''))
        pg = ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
        pg.goto(base, wait_until='load'); pg.wait_for_function('window.__ev && window.MP4Box', timeout=30000)
        pg.wait_for_timeout(1200); shot(pg, info, '01_home', {'drop': '#songDrop', 'continue': 'text:Continue'})
        pg.set_input_files('#songFile', SONG)
        pg.wait_for_function('() => __ev("!!S.song")', timeout=60000)
        tap = os.environ.get('TAP')
        if tap:
            t0, P = [float(x) for x in tap.split(',')]
            ev(pg, "(() => { const ts = []; for (let k = 0; k < 16; k++) ts.push(%f + k * %f + [0.006, -0.004, 0.002][k %% 3]); tapT.taps = ts; tapT.fit = tapFit(ts); tapApply(); try { beatTestEnd(); } catch(e){} stop(true); })()" % (t0, P))
        pg.wait_for_timeout(2500); shot(pg, info, '02_song', {'meta': '#songMeta', 'drop': '#songDrop', 'box': '#songBox'})
        info['song'] = ev(pg, "({ bpm: S.song.bpm, dur: S.song.duration, step: S.step })")
        ev(pg, 'go(2)'); pg.wait_for_timeout(900); shot(pg, info, '03_takes_empty', {'imp': 'label[for=takeFiles]', 'list': '#takeList'})
        pg.set_input_files('#takeFiles', TAKES)
        pg.wait_for_function('() => __ev("S.takes.length === %d && S.takes.every(t => t.status !== \'pending\')")' % len(TAKES), timeout=600000)
        pg.wait_for_timeout(1500); shot(pg, info, '04_takes', {'imp': 'label[for=takeFiles]', 'list': '#takeList', 'synced': 'text:All the takes'}); pg.screenshot(path=os.path.join(OUT, '04_takes_full.png'), full_page=True)
        info['takes'] = ev(pg, "S.takes.map(t => ({ name: t.name, status: t.status, offset: +(t.offset || 0).toFixed(3) }))")
        start = float(os.environ.get('START', '0')); bars = int(os.environ.get('BARS', '4'))
        sb = ev(pg, "(() => { let best = 0, d = 1e9; for (let b = 0; b < totalBars(); b++){ const x = Math.abs(barTime(b) - %f); if (x < d){ d = x; best = b; } } return best; })()" % start)
        ev(pg, "S.nBars = %d, S.startBar = %d, updateSegment()" % (bars, sb))
        ev(pg, 'go(3)'); pg.wait_for_timeout(900); shot(pg, info, '05_lyrics', {'view': '#view'})
        ev(pg, "S.lyrics.mode = 'none'")
        ev(pg, 'go(4)'); pg.wait_for_function('() => __ev("S.step === 4 && S.cuts.length > 0")', timeout=60000)
        seed = int(os.environ.get('SEED', '8')); ev(pg, "S.seed = %d, rebuild(false)" % seed)
        pg.wait_for_timeout(1500); shot(pg, info, '06_edit', {'view': '#view', 'bar': '#timeline, .timeline, #tl', 'edit': 'text:Your edit'})
        info['segment'] = ev(pg, "({ segStart: +S.segStart.toFixed(3), segEnd: +S.segEnd.toFixed(3), cuts: S.cuts.map(c => [+(c.t0 - S.segStart).toFixed(3), (c.take && c.take.name || '?')]) })")
        # where things sit on the edit screen (CSS px; the screenshot is at the device's scale)
        info['dpr'] = dev['device_scale_factor']; info['viewport'] = dev['viewport']
        info['rects'] = pg.evaluate("""() => { const r = {}; for (const [k, sel] of Object.entries({ view: '#view', timeline: '#timeline, .timeline, #tl', export: '#exportBtn', shuffle: '#shuffleBtn', play: '#playBtn' })){ const el = document.querySelector(sel); if (el){ const b = el.getBoundingClientRect(); r[k] = [b.x, b.y, b.width, b.height]; } } return r; }""")
        info['errors'] = errs
        b.close()
    srv.shutdown()
    json.dump(info, open(os.path.join(OUT, 'capture.json'), 'w'), indent=1)
    print(json.dumps(info, indent=1)[:2500])


main()
