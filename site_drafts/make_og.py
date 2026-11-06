# Marketing & croissance (06/11, audit point 21): one share picture per guide (1200 × 630, for links on X, Discord, iMessage…).
# Brand only (sky, snow, logo, mascot, Lilita One): no picture from the owner's takes.
# Run: python3 site_drafts/make_og.py   -> writes site_src/og/<slug>.jpg (Playwright + the site's own fonts)
import base64, html as H, os, pathlib, re, sys
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / 'site_src' / 'og'
LOGO = re.search(r'<svg class="logo".*?</svg>', (ROOT / 'src' / 'markup.html').read_text(encoding='utf-8'), flags=re.S).group(0)
def data(path, mime):   # the page is set from memory (about:blank): fonts and pictures go in as data: addresses
    return 'data:' + mime + ';base64,' + base64.b64encode(path.read_bytes()).decode()
LILITA = data(ROOT / 'site_src' / 'fonts' / 'lilitaone.ttf', 'font/ttf')
RUBIK = data(ROOT / 'site_src' / 'fonts' / 'rubik.ttf', 'font/ttf')
GUIDES = [   # slug, title on the picture, the mascot
    ('lip-sync-video-editor', 'Lip-sync video editor', 'Your takes, cut on the beat', 'cool'),
    ('music-video-maker-for-rappers', 'Music video maker for rappers', 'Phone takes, cut on the beat', 'hype'),
    ('rap-snippet-video', 'Rap snippet videos', 'Film once, post a new cut every day', 'focus'),
    ('lip-sync-videos-for-singers', 'Performance videos for singers', 'Several takes, one performance', 'love'),
    ('how-to-make-a-lip-sync-video', 'How to make a lip-sync video', 'Song, takes, lyrics, edit: 4 steps', 'hello'),
    ('edit-video-to-the-beat', 'Edit video to the beat', 'Cuts that land on the beat', 'gg'),
]
PAGE = """<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{{font-family:'Lilita One';src:url('{lilita}')}}@font-face{{font-family:'Rubik';src:url('{rubik}');font-weight:300 900}}
html,body{{margin:0;width:1200px;height:630px;overflow:hidden}}
body{{position:relative;background:#1f6fd6 radial-gradient(circle at 20% 15%,rgba(255,255,255,.16),transparent 45%);font-family:Rubik,sans-serif;color:#0a0d14}}
.flake{{position:absolute;border-radius:50%;background:#fff;opacity:.75}}
.logo{{position:absolute;left:64px;top:44px;height:92px;width:auto;overflow:visible}}
.card{{position:absolute;left:64px;top:176px;width:716px;box-sizing:border-box;padding:38px 44px 34px;background:#fff;border:5px solid #0a0d14;border-radius:34px;box-shadow:0 10px 0 #0a0d14}}
h1{{margin:0 0 14px;font:400 70px/1.02 'Lilita One',sans-serif;letter-spacing:.005em;text-wrap:balance}}
p{{margin:0;font-weight:600;font-size:31px;line-height:1.25;color:#24324a}}
.url{{position:absolute;left:64px;bottom:40px;color:#fff;font:400 38px/1 'Lilita One',sans-serif;text-shadow:0 4px 0 #0a0d14}}
.free{{position:absolute;left:300px;bottom:44px;color:#fff;font-weight:700;font-size:27px}}
.mascot{{position:absolute;right:58px;bottom:70px;width:330px;height:330px}}
</style></head><body>{flakes}{logo}
<div class="card"><h1>{title}</h1><p>{sub}</p></div>
<div class="url">stalak.app</div><div class="free">Free · in your browser · no sign-up</div>
<img class="mascot" src="{mascot}" alt=""></body></html>"""


def flakes():
    # the same snow on every picture (fixed positions, no randomness)
    pts = [(1010, 60, 9), (1130, 140, 6), (900, 30, 5), (1160, 40, 7), (860, 120, 4), (1080, 210, 5), (960, 190, 6), (1170, 260, 4),
           (520, 60, 5), (640, 110, 7), (720, 40, 4), (420, 120, 4), (1110, 560, 5), (860, 590, 6), (980, 600, 4), (40, 590, 5), (30, 140, 4)]
    return ''.join('<i class="flake" style="left:%dpx;top:%dpx;width:%dpx;height:%dpx"></i>' % (x, y, d, d) for x, y, d in pts)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1200, 'height': 630}, device_scale_factor=1)
        for slug, title, sub, mascot in GUIDES:
            pg.set_content(PAGE.format(lilita=LILITA, rubik=RUBIK, flakes=flakes(), logo=LOGO, title=H.escape(title).replace('lip-sync', '<span style="white-space:nowrap">lip-sync</span>').replace('Lip-sync', '<span style="white-space:nowrap">Lip-sync</span>'), sub=H.escape(sub),
                                       mascot=data(ROOT / 'site_src' / 'emoji' / (mascot + '.webp'), 'image/webp')), wait_until='load')
            pg.evaluate('document.fonts.ready.then(() => document.fonts.size)'); pg.wait_for_timeout(250)
            assert pg.evaluate("document.fonts.check('70px \"Lilita One\"')"), 'Lilita One not loaded'
            pg.screenshot(path=str(OUT / (slug + '.jpg')), type='jpeg', quality=86)
            print('wrote', OUT / (slug + '.jpg'))
        b.close()


if __name__ == '__main__':
    main()
