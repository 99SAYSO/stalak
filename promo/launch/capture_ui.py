"""The real Stalak screens for the launch film: the site built from this repo (public/, `python3 build_site.py --domain
stalak.app --email contact@stalak.app`) is served locally, Chromium loads "Try with an example" and photographs, at 2x:
whole screens (the home page for the laptop, the edit step for the phone and the tablet) and each card alone, with a
transparent background (Pick your song, Add your takes, Your edit in its Normal / Punchy / after-Shuffle states, the preview
with Play and Shuffle, Export with the Creator+ pack). Writes assets/ui/*.png and assets/ui/ui.json (each picture's box and,
inside it, the boxes of the buttons the cursor clicks, in css px of the 1440-wide page).

usage: python3 capture_ui.py        (assets/ui/ stays out of git: it is made again by this script)
"""
import json, os, subprocess, sys, time
from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
PUBLIC = os.path.normpath(os.path.join(HERE, "..", "..", "public"))
OUT = os.path.join(HERE, "assets", "ui")
PORT = 8765
os.makedirs(OUT, exist_ok=True)
srv = subprocess.Popen([sys.executable, "-m", "http.server", str(PORT)], cwd=PUBLIC, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(1.2)
URL = "http://127.0.0.1:%d/index.html" % PORT
UI = {}
# no page background (the film draws its own sky), no full-page snow canvas, and not the floating "Export ↓" button
# (#expFab, fixed at the bottom of the window: it landed on the cards' "Lyrics: 4 lines…" row; owner's remarks 2, 3, 5, 2/11)
CLEAR = """() => { if (!document.getElementById('cap')) { const s = document.createElement('style'); s.id = 'cap';
  s.textContent = 'html,body{background:transparent!important;background-image:none!important} body::before,body::after{display:none!important} #expFab{display:none!important}';
  document.head.appendChild(s); }
  for (const c of document.querySelectorAll('canvas')) { const r = c.getBoundingClientRect(); if (r.width >= innerWidth * 0.9 && r.height >= innerHeight * 0.5) c.style.visibility = 'hidden'; } }"""


def rect(loc):
    r = loc.bounding_box()
    return [round(r["x"], 1), round(r["y"], 1), round(r["width"], 1), round(r["height"], 1)]


def card(pg, name, sel, pad=(12, 18, 18, 12), inner=None):
    """one card alone, transparent; inner = {key: selector} -> boxes relative to the picture"""
    loc = pg.locator(sel).first
    loc.scroll_into_view_if_needed(); pg.wait_for_timeout(250)
    x, y, w, h = rect(loc)
    clip = {"x": x - pad[3], "y": y - pad[0], "width": w + pad[1] + pad[3], "height": h + pad[0] + pad[2]}
    pg.screenshot(path=os.path.join(OUT, name + ".png"), clip=clip, omit_background=True)
    boxes = {}
    for k, s in (inner or {}).items():
        bx, by, bw, bh = rect(pg.locator(s).first)
        boxes[k] = [round(bx - clip["x"], 1), round(by - clip["y"], 1), bw, bh]
    UI[name] = {"w": clip["width"], "h": clip["height"], "boxes": boxes}


def stage(pg, name):
    """the preview with Play and Shuffle; boxes: view (the preview picture), play, shuffle"""
    pg.evaluate("window.scrollTo(0, 0)"); pg.wait_for_timeout(200)
    s = pg.evaluate("""() => { const v = document.querySelector('#view'); let e = v;
      for (let i = 0; i < 6 && e; i++) { e = e.parentElement; if (e && e.getBoundingClientRect().height > v.getBoundingClientRect().height + 60) break; }
      const r = e.getBoundingClientRect(); return [r.x, r.y, r.width, r.height]; }""")
    clip = {"x": s[0] - 10, "y": s[1] - 10, "width": s[2] + 20, "height": s[3] + 26}
    pg.screenshot(path=os.path.join(OUT, name + ".png"), clip=clip, omit_background=True)
    boxes = {}
    for k, sel in (("view", "#view"), ("play", "#playBtn"), ("shuffle", "#shuffleBtn")):
        bx, by, bw, bh = rect(pg.locator(sel).first)
        boxes[k] = [round(bx - clip["x"], 1), round(by - clip["y"], 1), bw, bh]
    UI[name] = {"w": clip["width"], "h": clip["height"], "boxes": boxes}


def example(pg):
    pg.goto(URL); pg.wait_for_timeout(1500)
    pg.get_by_text("Try with an example").first.click(); pg.wait_for_timeout(6000)


try:
    with sync_playwright() as p:
        b = p.chromium.launch(args=["--autoplay-policy=no-user-gesture-required"])
        # whole screens, with the real sky: home on a laptop, the edit step on a phone and a tablet
        for name, vw, vh, dpr, mob, ex in (("screen_home", 1440, 900, 2, False, False), ("screen_phone_edit", 390, 844, 3, True, True),
                                           ("screen_tablet_edit", 1180, 820, 2, True, True)):
            ctx = b.new_context(viewport={"width": vw, "height": vh}, device_scale_factor=dpr, is_mobile=mob, has_touch=mob)
            pg = ctx.new_page()
            if ex: example(pg)
            else: pg.goto(URL); pg.wait_for_timeout(2500)
            pg.add_style_tag(content="#expFab{display:none!important}")    # (v2) not over the tablet's cut bar either
            pg.evaluate("window.scrollTo(0, 0)"); pg.wait_for_timeout(400)
            pg.screenshot(path=os.path.join(OUT, name + ".png"))
            view = pg.locator("#view").first
            UI[name] = {"w": vw, "h": vh, "boxes": {"view": rect(view)} if ex else {}}
            ctx.close()
        # the cards, alone
        ctx = b.new_context(viewport={"width": 1440, "height": 900}, device_scale_factor=2)
        pg = ctx.new_page(); pg.goto(URL); pg.wait_for_timeout(1500); pg.evaluate(CLEAR); pg.wait_for_timeout(300)
        card(pg, "song_empty", "section#p1 .card:visible", pad=(150, 12, 14, 12))
        example(pg); pg.evaluate(CLEAR); pg.wait_for_timeout(300)
        card(pg, "edit_normal", "section#p4 .card:visible >> nth=0",
             inner={"punchy": 'button:text-is("Punchy")', "normal": 'button:text-is("Normal")'})
        stage(pg, "stage_normal")
        pg.locator('button:text-is("Punchy")').first.click(); pg.wait_for_timeout(1500); pg.evaluate(CLEAR)
        card(pg, "edit_punchy", "section#p4 .card:visible >> nth=0")
        pg.locator("#shuffleBtn").first.click(); pg.wait_for_timeout(1500); pg.evaluate(CLEAR)
        card(pg, "edit_shuffle", "section#p4 .card:visible >> nth=0")
        stage(pg, "stage_shuffle")
        card(pg, "export", "section#p4 .card:visible >> nth=1", inner={"export": "#exportBtn", "pack": "#packBtn"})
        for step, sec, name in (("Sound", "p1", "song_loaded"), ("Takes", "p2", "takes")):
            pg.evaluate("window.scrollTo(0, 0)"); pg.locator('header button:has-text("%s")' % step).first.click()
            pg.wait_for_timeout(2500); pg.evaluate(CLEAR); pg.wait_for_timeout(200)
            card(pg, name, "section#%s .card:visible" % sec)
        ctx.close(); b.close()
finally:
    srv.terminate()
with open(os.path.join(OUT, "ui.json"), "w") as f:
    json.dump(UI, f, indent=1)
print(json.dumps(UI, indent=1)[:3000])
