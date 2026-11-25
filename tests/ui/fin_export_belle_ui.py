"""Test of the end of an export on a phone (Chef, 25/11, docs/handoff/chef-fin-export-belle-page.md; owner, 2nd time: « l'écran
pour enregistrer la vidéo est tout noir et moche. Je veux une belle page comme les autres »). Python Playwright, the test server
with real accounts (tests/ui/cloud-server.mjs), an iPhone 13 in French and an iPhone SE in English.

    node tests/ui/cloud-server.mjs <built public/ folder with the probe> <port>
    python3 /abs/path/tests/ui/fin_export_belle_ui.py http://127.0.0.1:<port> [folder for screenshots]

Three cases: with the 1 € offer (1st export), without it (exports 2 to 9), a subscriber (no watermark). Each time:
- the background, from the top of the page to its very end: no band more than 40 px high darker than #0e3f8f (measured on
  the background alone, the cards and the video made invisible, at each scroll position);
- the mascot celebrating next to « Ta vidéo est prête », the golden halo behind the video, the falling flakes;
- confetti when the screen comes (and none with « reduce motion »);
- the white cards one under the other, evenly spaced, and the page ends at the last card (a small margin, no big void);
- the same layout with and without the offer.
Screenshots: top, middle and bottom of the page in each case."""
import os, sys
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.sync_api import sync_playwright

BASE = sys.argv[1].rstrip('/')
SHOTS = sys.argv[2] if len(sys.argv) > 2 else None
results = []
FAST_EXPORT = ("pickVideoConfig = async () => null, renderRealtime = async () => { await new Promise(r => setTimeout(r, 120)); "
               "return { blob: new Blob([new Uint8Array(4096)], { type: 'video/mp4' }), ext: 'mp4' }; }")
NIGHT = 0.2126 * 0x0e + 0.7152 * 0x3f + 0.0722 * 0x8f   # the luminance of #0e3f8f


def check(name, ok, info=''):
    results.append(bool(ok))
    print(('PASS ' if ok else 'FAIL ') + name + (('  — ' + str(info)) if info and not ok else ''))


def ev(pg, code):
    return pg.evaluate('s => __ev(s)', code)


def dark_bands(pg):
    """The background alone (everything in the page made invisible), screenshot by screenshot from the top to the end: the
    highest run of rows whose median is darker than #0e3f8f."""
    from PIL import Image
    import io, statistics
    pg.add_style_tag(content='html.m4fe .wrap *{visibility:hidden !important}html.m4fe .m4-fx,html.m4fe .m4-fx *{visibility:hidden !important}')
    pg.wait_for_timeout(200)
    vh = pg.evaluate('innerHeight'); H = pg.evaluate('document.documentElement.scrollHeight'); worst, y = 0, 0
    while True:
        pg.evaluate('y => scrollTo(0, y)', y); pg.wait_for_timeout(120)
        im = Image.open(io.BytesIO(pg.screenshot())).convert('RGB'); w, h = im.size; px = im.load(); run = 0
        for r in range(0, h, 2):
            lum = statistics.median(0.2126 * px[x, r][0] + 0.7152 * px[x, r][1] + 0.0722 * px[x, r][2] for x in range(0, w, 6))
            run = run + 2 if lum < NIGHT - 2 else 0
            worst = max(worst, run * vh / h)
        if y + vh >= H: break
        y += vh - 40
    pg.evaluate('() => document.querySelectorAll("style").forEach(s => { if (s.textContent.includes(".m4-fx,html.m4fe")) s.remove(); })')
    pg.evaluate('scrollTo(0, 0)'); pg.wait_for_timeout(150)
    return round(worst)


def three(pg, name):
    if not SHOTS: return
    H = pg.evaluate('document.documentElement.scrollHeight'); vh = pg.evaluate('innerHeight')
    for k, y in (('haut', 0), ('milieu', max(0, (H - vh) // 2)), ('bas', H)):
        pg.evaluate('y => scrollTo(0, y)', y); pg.wait_for_timeout(250)
        pg.screenshot(path=os.path.join(SHOTS, 'fin-%s-%s.png' % (name, k)))
    pg.evaluate('scrollTo(0, 0)')


def layout(pg):
    return pg.evaluate("""() => {
      const r = [...document.querySelectorAll('#result > *, #doneView .dv-foot')].filter(e => e.offsetParent && getComputedStyle(e).display !== 'none' && getComputedStyle(e).position !== 'absolute' && e.getBoundingClientRect().height > 4)
        .map(e => e.getBoundingClientRect()).sort((a, b) => a.top - b.top);
      const gaps = []; for (let i = 1; i < r.length; i++) gaps.push(Math.round(r[i].top - r[i - 1].bottom));
      const last = r[r.length - 1], end = document.documentElement.scrollHeight - (last.bottom + scrollY);
      const m = document.querySelector('.m4-fem'), h = document.querySelector('.m4-of1h'), mr = m && m.getBoundingClientRect(), hr = h && h.getBoundingClientRect();
      const cards = ['#result > .capbox', '#result > .optbox', '#result > .post', '#result > .m4-of1s', '#doneView .dv-foot'].map(q => document.querySelector(q)).filter(e => e && e.offsetParent).every(e => getComputedStyle(e).backgroundColor === 'rgb(255, 255, 255)');
      return { gaps, end: Math.round(end), cards, mascot: !!(mr && hr && mr.width > 40 && Math.abs((mr.top + mr.bottom) / 2 - (hr.top + hr.bottom) / 2) < 70),
               halo: !!document.querySelector('#result > .m4-halo') && getComputedStyle(document.querySelector('#result > .m4-halo')).display !== 'none',
               flakes: getComputedStyle(document.querySelector('.m4-fbg')).backgroundImage.includes('radial-gradient'), hscroll: document.documentElement.scrollWidth > innerWidth + 1 }; }""")


def run(b, PW, dev, lang, calm=False):
    tag = dev + ' ' + lang + (' (réduire les animations)' if calm else '')
    opts = dict(PW.devices[dev])
    ctx = b.new_context(**opts, locale='fr-FR' if lang == 'fr' else 'en-US', reduced_motion='reduce' if calm else 'no-preference')
    ctx.add_init_script("window.__stalakM3on = 1; window.__stalakM4on = 1; try { if (!localStorage.getItem('stalak:onb')) localStorage.setItem('stalak:onb', JSON.stringify({ v: 2, done: 1, sent: 1, a: { artistName: 'T-Crazy' } })); localStorage.setItem('stalak:tuto', '1'); } catch (e) {}")
    # TikTok offered (as on stalak.app): the config says so
    def cfg(route):
        r = route.fetch(); import json as J
        try: d = J.loads(r.text())
        except Exception: d = {}
        d.setdefault('features', {})['social'] = ['tiktok']
        route.fulfill(response=r, body=J.dumps(d), headers={**r.headers, 'content-type': 'application/json'})
    ctx.route('**/api/config', cfg)
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    to = '/fr/' if lang == 'fr' else '/'
    email = 'fin-%s-%s%s@example.com' % (dev.replace(' ', '').lower(), lang, '-calm' if calm else '')
    pg.goto(BASE + '/__test/login?email=%s&pro=0&to=%s' % (email, to), wait_until='load')
    uid = pg.evaluate("() => fetch('/api/me').then(r => r.json()).then(d => d.user && d.user.id)")
    pg.evaluate("id => localStorage.setItem('stalak:proThanks:' + id, '1')", uid)
    pg.goto(BASE + to, wait_until='load'); pg.wait_for_function('() => !!window.StalakM && !!window.__ev', timeout=30000); pg.wait_for_timeout(1500)
    pg.locator('#mhEx:visible, #heroDemo:visible, #demoBtn:visible').first.click()
    pg.wait_for_function('() => __ev("S.step === 4 && S.cuts.length > 0")', timeout=240000); pg.wait_for_timeout(800)
    sfx = '-' + dev.replace(' ', '') + '-' + lang
    cases = [('offre', "offer1On = () => true, of1Prices = { today: '1 €', then: '7,99 €' }"), ('sans-offre', 'offer1On = () => false')] if not calm else [('offre', "offer1On = () => true, of1Prices = { today: '1 €', then: '7,99 €' }")]
    seen = {}
    for i, (name, setup) in enumerate(cases):
        ev(pg, setup + ", S.song.demo = false, store.set(PP_KEY, 1), " + FAST_EXPORT)
        if i: ev(pg, "$('#dvEdit').click()"); pg.wait_for_timeout(600)
        pg.evaluate('() => { __ev("exportOne()"); }'); pg.wait_for_function('() => __ev("S.done === true && !S.exporting")', timeout=90000)
        pg.wait_for_function("() => document.documentElement.classList.contains('m4fe')", timeout=8000)
        pg.wait_for_timeout(350)
        conf = pg.evaluate("() => document.querySelectorAll('.m4-fx i').length")
        if calm: check(tag + ' : avec « réduire les animations », pas de confettis', conf == 0, conf)
        else: check(tag + ' : %s : des confettis à l’arrivée sur l’écran' % name, conf >= 20, conf)
        pg.wait_for_timeout(3200)
        if not calm: check(tag + ' : %s : les confettis ne tombent qu’une fois, puis s’en vont' % name, pg.evaluate("() => document.querySelectorAll('.m4-fx i').length") == 0)
        L = layout(pg); seen[name] = L
        check(tag + ' : %s : la mascotte qui fête à côté de « Ta vidéo est prête », le halo doré, les flocons' % name, L['mascot'] and L['halo'] and L['flakes'], L)
        check(tag + ' : %s : les cartes blanches l’une sous l’autre, espacées pareil (écarts %s)' % (name, L['gaps']), L['cards'] and L['gaps'] and max(L['gaps'][1:] or [0]) <= 24 and min(L['gaps']) >= 0, L)
        check(tag + ' : %s : la page s’arrête à la dernière carte (%d px dessous)' % (name, L['end']), 0 <= L['end'] <= 60, L['end'])
        check(tag + ' : %s : rien ne dépasse sur le côté' % name, not L['hscroll'])
        tk = pg.evaluate("() => { const b = document.querySelector('#ttkPub'), s = document.querySelector('#saveRow'), c = document.querySelector('#result > .m4-of1s'); if (!b) return null; const r = b.getBoundingClientRect(), q = s.getBoundingClientRect(); return [!!c && c.contains(b), !b.hidden && r.height >= 44, r.top >= q.bottom - 1, Math.abs(r.width - q.width) <= 2]; }")
        check(tag + ' : %s : « Publier sur TikTok » dans la carte blanche, juste sous « Enregistrer », même largeur' % name, tk == [True, True, True, True], tk)
        bg = pg.evaluate("() => { const f = document.querySelector('.m4-fbg').getBoundingClientRect(); return [f.top <= 0, f.bottom >= innerHeight, getComputedStyle(document.documentElement).backgroundColor]; }")
        check(tag + ' : %s : le ciel couvre tout l’écran, et sous la barre de Safari c’est son bleu clair du bas (jamais un bleu uni)' % name, bg == [True, True, 'rgb(214, 236, 255)'], bg)
        three(pg, name + sfx)
        d = dark_bands(pg)
        check(tag + ' : %s : du haut jusqu’en bas, aucune bande de plus de 40 px plus sombre que #0e3f8f (pire : %d px)' % (name, d), d <= 40, d)
    if len(seen) == 2:
        a, b2 = seen['offre'], seen['sans-offre']
        check(tag + ' : même rendu avec et sans l’offre (mascotte, halo, flocons, cartes)', all(a[k] == b2[k] for k in ('mascot', 'halo', 'flakes', 'cards')), [a, b2])
    check(tag + ' : aucune erreur dans la page', not errs, errs)
    ctx.close()


def main():
    with sync_playwright() as p:
        b = p.chromium.launch()
        for a in (('iPhone 13', 'fr'), ('iPhone SE', 'en'), ('iPhone 13', 'fr', True)):
            try: run(b, p, *a)
            except Exception as e: check(' '.join(str(x) for x in a) + ' : déroulé complet', False, str(e)[:400])
        b.close()
    print('%d/%d réussis' % (sum(results), len(results)))
    sys.exit(0 if all(results) else 1)


main()
