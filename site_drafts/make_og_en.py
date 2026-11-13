# Marketing & croissance (13/11): the English version of the site's main share picture.
# site_src/og.png (logo, mascot, snow) carries a French line, « Ton playback, monté sur le rythme. », and it was the share
# picture of the English pages too (home, pricing, Triller page). This draws site_src/og-en.png: the same picture, with the line in
# English, written in the same font, size and shadow (checked: redrawing the French line this way gives back og.png to the pixel).
# Run: python3 site_drafts/make_og_en.py   (Playwright + the site's own Rubik font)
import base64, io, os, pathlib
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.sync_api import sync_playwright
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
LINE = 'Your lip sync, cut to the beat.'


def data(path, mime):
    return 'data:' + mime + ';base64,' + base64.b64encode(path.read_bytes()).decode()


# the French line sits at x 97-751, y 437-471 on a plain sky (#1f6fd6): it is covered, then the English line is written in its place
PAGE = """<!doctype html><html><head><meta charset="utf-8"><style>@font-face{{font-family:R;src:url('{rubik}');font-weight:300 900}}
html,body{{margin:0;width:1200px;height:630px;overflow:hidden}}body{{position:relative;background:url('{og}')}}
.cover{{position:absolute;left:90px;top:426px;width:700px;height:56px;background:#1f6fd6}}
.t{{position:absolute;left:96px;top:433px;font:700 38px/1 R,sans-serif;color:#fff;text-shadow:0 3px 0 #0a0d14;white-space:nowrap}}
</style></head><body><div class="cover"></div><div class="t">{line}</div></body></html>"""


def main():
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1200, 'height': 630}, device_scale_factor=1)
        pg.set_content(PAGE.format(rubik=data(ROOT / 'site_src' / 'fonts' / 'rubik.ttf', 'font/ttf'),
                                   og=data(ROOT / 'site_src' / 'og.png', 'image/png'), line=LINE), wait_until='load')
        pg.evaluate('document.fonts.ready.then(() => document.fonts.size)'); pg.wait_for_timeout(100)
        right = pg.evaluate("() => { const r = document.createRange(); r.selectNodeContents(document.querySelector('.t')); return r.getBoundingClientRect().right; }")
        assert right < 760, 'the line would run into the mascot'
        Image.open(io.BytesIO(pg.screenshot())).convert('RGB').save(ROOT / 'site_src' / 'og-en.png', optimize=True)
        b.close()
    print('wrote', ROOT / 'site_src' / 'og-en.png')


if __name__ == '__main__':
    main()
