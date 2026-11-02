"""Shoots thumb.html for each variant at 2x in Chromium, then writes the YouTube files (1280 x 720 JPG, under 2 MB) and the
small views used to check them (168 x 94: a phone's search list; 320 x 180: a suggested list).

usage: python3 render.py [1 2 3]     ->  out/Stalak_thumbnail_<v>.jpg, out/<v>@2x.png, out/<v>_168.png, out/<v>_320.png,
                                         and out/feed.png (feed.html: the variants where YouTube shows them, light and dark)
"""
import os, sys
from PIL import Image
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "out")
os.makedirs(OUT, exist_ok=True)
VARIANTS = sys.argv[1:] or ["1", "2", "3"]

with sync_playwright() as p:
    b = p.chromium.launch()
    page = b.new_context(viewport={"width": 1280, "height": 720}, device_scale_factor=2).new_page()
    for v in VARIANTS:
        page.goto("file://%s/thumb.html?v=%s" % (HERE, v))
        page.wait_for_selector("body[data-ready='1']")
        page.wait_for_load_state("load")
        page.wait_for_function("Array.from(document.images).every(i => i.complete && i.naturalWidth > 0)")
        page.wait_for_timeout(300)                     # css background pictures (the clip cards)
        big = os.path.join(OUT, "%s@2x.png" % v)
        page.screenshot(path=big)
        im = Image.open(big).convert("RGB")
        jpg = os.path.join(OUT, "Stalak_thumbnail_%s.jpg" % v)
        im.resize((1280, 720), Image.LANCZOS).save(jpg, quality=92, optimize=True, progressive=True)
        for w, h in ((168, 94), (320, 180)):
            im.resize((w, h), Image.LANCZOS).save(os.path.join(OUT, "%s_%d.png" % (v, w)))
        kb = os.path.getsize(jpg) / 1024
        assert kb < 2000, (jpg, kb)
        print("%s: %s (%.0f KB)" % (v, jpg, kb))
    feed = b.new_context(viewport={"width": 940, "height": 400}, device_scale_factor=1).new_page()
    feed.goto("file://%s/feed.html?v=%s" % (HERE, ",".join(VARIANTS)))
    feed.wait_for_selector("body[data-ready='1']")
    feed.screenshot(path=os.path.join(OUT, "feed.png"), full_page=True)
    b.close()
