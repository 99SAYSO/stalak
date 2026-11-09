"""Marketing & croissance (09/11/2026, A7): real screenshots of the built app (public/) at phone size (iPhone 15 Pro emulated
in Chromium), Free plan, with the real example (site_src/demo/example/: 8 bars of « neva die » by 99Sayso and his 3 takes,
used with his OK; the 2 lyric lines known for these bars). For the help pages (site_drafts/make_aide.py).

    python3 site_drafts/aide_shots.py public en      (then fr)

Writes site_src/aide/<lang>-song.jpg, -takes.jpg, -edit.jpg, -export.jpg (600 px wide, from a 2x screenshot)."""
import functools, http.server, json, os, shutil, sys, tempfile, threading
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.sync_api import sync_playwright
from PIL import Image

PUBLIC, LANG = os.path.abspath(sys.argv[1]), sys.argv[2]
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'site_src', 'aide')
EX = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'site_src', 'demo', 'example') + '/'
SONG, TAKES = EX + 'song.mp3', [EX + 'take1.mp4', EX + 'take2.mp4', EX + 'take3.mp4']
H = 600   # CSS px kept from the top of the viewport (the iPhone's is 852)


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


def ev(pg, code):
    return pg.evaluate('s => __ev(s)', code)


def shot(pg, name, sel, top=12, h=H):
    pg.evaluate('([s, t]) => { const e = document.querySelector(s); window.scrollTo(0, e.getBoundingClientRect().top + scrollY - t); }', [sel, top])
    pg.mouse.move(2, 2); pg.wait_for_timeout(700)
    raw = os.path.join(tempfile.gettempdir(), '_%s-%s.png' % (LANG, name)); pg.screenshot(path=raw)
    im = Image.open(raw).convert('RGB'); s = im.width / 393
    im = im.crop((0, 0, im.width, int(h * s))).resize((600, int(600 * h / 393)), Image.LANCZOS)
    im.save(os.path.join(OUT, '%s-%s.jpg' % (LANG, name)), quality=82, optimize=True, progressive=True)


def main():
    os.makedirs(OUT, exist_ok=True)
    tmp = tempfile.mkdtemp(); site = os.path.join(tmp, 'site'); shutil.copytree(PUBLIC, site)
    sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'tests', 'ui')); from _probe import add_probe; add_probe(site)
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=site))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = 'http://127.0.0.1:%d/' % srv.server_address[1] + ('fr/' if LANG == 'fr' else '')
    info = {}
    with sync_playwright() as p:
        b = p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'])
        dev = dict(p.devices['iPhone 15 Pro']); dev['device_scale_factor'] = 2
        ctx = b.new_context(**dev, locale='fr-FR' if LANG == 'fr' else 'en-US')
        ctx.route('**/api/**', lambda r: r.fulfill(status=204, body=''))
        pg = ctx.new_page(); errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
        pg.goto(base, wait_until='load'); pg.wait_for_function('window.__ev && window.MP4Box', timeout=30000)
        pg.wait_for_timeout(800)
        # 1. the song (the toast « Tempo detected » is left to fade away)
        pg.set_input_files('#songFile', SONG)
        pg.wait_for_function('() => __ev("!!S.song && !!S.song.bpm")', timeout=60000)
        pg.wait_for_timeout(6000)
        shot(pg, 'song', '[data-i18n="p1.title"]', h=660)
        # 2. the takes, each lined up with the song by Stalak
        ev(pg, 'go(2)'); pg.wait_for_timeout(500)
        pg.set_input_files('#takeFiles', TAKES)
        pg.wait_for_function('() => __ev("S.takes.length === 3 && S.takes.every(t => t.status !== \'pending\')")', timeout=600000)
        pg.wait_for_timeout(2500)
        shot(pg, 'takes', '[data-i18n="p2.title"]')
        info['takes'] = ev(pg, "S.takes.map(t => [t.name, t.status, +(t.offset || 0).toFixed(3)])")
        # 3. the lyrics: the 2 known lines of these 8 bars, pasted and synced (as tapping would)
        ev(pg, 'go(3)'); pg.wait_for_timeout(600)
        ev(pg, """(() => { S.lyrUser = true; S.lyrics.mode = 'paste'; S.lyrics.lines = [
            {text: "j'ai mis de l'or sur mes plaies,", t: 9.115}, {text: "cicatrices valent des millions", t: 10.415}]; saveLyrics && saveLyrics(); })()""")
        # 4. the edit, on a frame with the lyrics
        ev(pg, 'go(4)'); pg.wait_for_function('() => __ev("S.step === 4 && S.cuts.length > 0")', timeout=60000)
        pg.wait_for_timeout(2500)
        ev(pg, 'showFrame(9.6)'); pg.wait_for_timeout(1500)
        shot(pg, 'edit', '[data-i18n="p4.title"]', top=16, h=640)
        # 5. the export
        shot(pg, 'export', '#exportBtn', top=300, h=600)
        info['cuts'] = ev(pg, "S.cuts.length")
        info['errors'] = errs
        b.close()
    srv.shutdown(); shutil.rmtree(tmp, ignore_errors=True)
    print(json.dumps(info, ensure_ascii=False))


main()
