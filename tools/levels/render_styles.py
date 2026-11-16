"""Rend les planches de style LEVELS (images fixes, 1080 x 1920) en PNG.

Usage : python3 tools/levels/render_styles.py SORTIE_DOSSIER
"""
import pathlib
import sys

from playwright.sync_api import sync_playwright

HERE = pathlib.Path(__file__).resolve().parent
out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "levels_styles")
out.mkdir(parents=True, exist_ok=True)

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1080, "height": 1920})
    for style in ("glace", "nuit", "sticker"):
        for scene in ("n1", "n5"):
            pg.goto(f"file://{HERE / 'styles.html'}?style={style}&scene={scene}")
            pg.evaluate("document.fonts.ready")
            pg.wait_for_timeout(300)
            f = out / f"style_{style}_{scene}.png"
            pg.locator("#s").screenshot(path=str(f))
            print(f)
    b.close()
