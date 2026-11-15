"""Screenshot a page of the series engine (Marketing & croissance, 15/11/2026).
    python3 tools/serie/shot.py <page under the repo, e.g. tools/serie/engine/board.html> <out.png> [width height] [js to run first]
Serves the repo root over HTTP (fonts and pictures load by their repo paths), waits for fonts, takes the picture."""
import functools, http.server, os, sys, threading
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


def main():
    page, out = sys.argv[1], sys.argv[2]
    w, h = (int(sys.argv[3]), int(sys.argv[4])) if len(sys.argv) > 4 else (1080, 1920)
    js = sys.argv[5] if len(sys.argv) > 5 else ''
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': w, 'height': h}, device_scale_factor=1)
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: errs.append('console: ' + m.text) if m.type == 'error' else None)
        pg.goto('http://127.0.0.1:%d/%s' % (srv.server_address[1], page), wait_until='load')
        pg.evaluate('document.fonts.ready.then(() => 1)')
        if js:
            pg.evaluate(js)
        pg.wait_for_timeout(300)
        pg.screenshot(path=out)
        b.close()
        if errs:
            print('ERRORS:', *errs[:5], sep='\n  ')
    srv.shutdown()
    print('wrote', out)


main()
