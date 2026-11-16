"""Rend les visuels LEVELS validables (style D) : le plateau et les accessoires par épisode.

Usage : python3 tools/levels/render_visuels.py SORTIE_DOSSIER
"""
import pathlib
import sys

from playwright.sync_api import sync_playwright

HERE = pathlib.Path(__file__).resolve().parent
out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else "levels_visuels")
out.mkdir(parents=True, exist_ok=True)
SCENES = [("plateau", "porte"), ("props_drill", ""), ("props_triste", ""), ("props_motivation", "")]
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1080, "height": 1920})
    for scene, decor in SCENES:
        pg.goto(f"file://{HERE / 'styles.html'}?style=ref&scene={scene}&decor={decor}")
        pg.evaluate("document.fonts.ready")
        pg.wait_for_timeout(300)
        f = out / f"levels_{scene}.png"
        pg.locator("#s").screenshot(path=str(f))
        print(f)
    b.close()
