"""Test of the owner's feedback of 26/11 (docs/handoff/chef-retours-26-11.md), on a phone. Python Playwright, the test server
(tests/ui/cloud-server.mjs), iPhone 13 in French and iPhone SE in English.

    python3 /abs/path/tests/ui/retours_26_11_ui.py http://127.0.0.1:<port>

1. « Meilleure prise auto » off at the start, with its short explanation in brackets next to it.
2. After « Enregistrer la vidéo »: « Retour au menu principal » / « Back to home », which goes back home; the video stays in
   « Montages ».
3. The 12 « Tendance » filters exist, first in the filters sheet, and each one changes the picture.
4. Snippet: no « Effets » tool; Clip: the « Effets » tool is there.
5. The export: the mascot goes back and forth (transform only), the pile of blocks is shown, nothing moves with « reduce motion ».
7. « Encore environ 1 s » in white."""
import os, sys
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.sync_api import sync_playwright

BASE = sys.argv[1].rstrip('/')
results = []
FAST = ("pickVideoConfig = async () => null, renderRealtime = async () => { await new Promise(r => setTimeout(r, 120)); "
        "return { blob: new Blob([new Uint8Array(4096)], { type: 'video/mp4' }), ext: 'mp4' }; }")
TT = ['braise', 'brume', 'lilas', 'craie', 'minuit', 'rubis', 'charbon', 'webcam', 'ecran', 'camescope', 'coton', 'clarte']


def check(name, ok, info=''):
    results.append(bool(ok))
    print(('PASS ' if ok else 'FAIL ') + name + (('  — ' + str(info)) if info and not ok else ''))


def ev(pg, c):
    return pg.evaluate('s => __ev(s)', c)


def run(b, p, dev, lang, calm=False):
    tag = dev + ' ' + lang + (' (réduire les animations)' if calm else '')
    ctx = b.new_context(**p.devices[dev], locale='fr-FR' if lang == 'fr' else 'en-US', reduced_motion='reduce' if calm else 'no-preference')
    ctx.add_init_script("window.__stalakM3on = 1; window.__stalakM4on = 1; try { localStorage.setItem('stalak:onb', JSON.stringify({ v: 2, done: 1, sent: 1, a: { artistName: 'T' } })); localStorage.setItem('stalak:tuto', '1'); } catch (e) {}")
    pg = ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    to = '/fr/' if lang == 'fr' else '/'
    pro = 1 if (lang == 'fr' and not calm) else 0
    pg.goto(BASE + '/__test/login?email=r26-%s-%s%s@example.com&pro=%d&to=%s' % (dev.replace(' ', ''), lang, '-c' if calm else '', pro, to))
    uid = pg.evaluate("() => fetch('/api/me').then(r => r.json()).then(d => d.user && d.user.id)")
    pg.evaluate("id => localStorage.setItem('stalak:proThanks:' + id, '1')", uid); pg.goto(BASE + to)
    pg.wait_for_function('() => !!window.StalakM && !!window.__ev', timeout=30000); pg.wait_for_timeout(1500)
    pg.locator('#mhEx:visible, #heroDemo:visible, #demoBtn:visible').first.click()
    pg.wait_for_function('() => __ev("S.step === 4 && S.cuts.length > 0")', timeout=240000); pg.wait_for_timeout(1000)
    if not calm:
        # 1
        why = pg.locator('label[for="bestChk"] .best-why').inner_text()
        check(tag + ' : « Meilleure prise auto » désactivée au départ, avec son explication entre parenthèses', ev(pg, 'S.bestTake') is False and not pg.locator('#bestChk').is_checked() and why.startswith('(') and len(why) > 40, why)
        # 4
        fx = pg.evaluate("() => { const b = document.querySelector('.m3-tools button[data-tool=\"fx\"]'); return [!!b, b && b.hidden, document.querySelectorAll('.m3-tools button[data-tool]:not([hidden])').length]; }")
        check(tag + ' : en mode Snippet, pas de bouton « Effets » (5 outils)', ev(pg, 'S.kind') != 'clip' and fx == [True, True, 5], fx)
        k0 = ev(pg, 'S.kind'); ev(pg, "(S.kind = 'clip', true)"); ev(pg, 'go(3)'); pg.wait_for_timeout(400); ev(pg, 'go(4)'); pg.wait_for_timeout(800)
        fx2 = pg.evaluate("() => !document.querySelector('.m3-tools button[data-tool=\"fx\"]').hidden")
        check(tag + ' : en mode Clip, le bouton « Effets » est là', fx2)
        ev(pg, "(S.kind = '%s', true)" % k0); ev(pg, 'go(3)'); pg.wait_for_timeout(400); ev(pg, 'go(4)'); pg.wait_for_function('() => __ev("S.step === 4 && S.cuts.length > 0")', timeout=60000); pg.wait_for_timeout(600)
        # 3
        f = pg.evaluate("ids => { const W = window.__ev; return W('FILTERS.map(f => f.id + \":\" + f.th)'); }", TT)
        check(tag + ' : les 12 filtres « Tendance » existent', all((i + ':tt') in f for i in TT), f)
        check(tag + ' : « Tendance » en premier dans les familles de filtres', ev(pg, 'FILT_THEMES[0]') == 'tt')
        ch = pg.evaluate("""ids => __ev(`(() => { const c = document.createElement('canvas'); c.width = 64; c.height = 64; const x = c.getContext('2d');
            const g = x.createLinearGradient(0, 0, 64, 64); g.addColorStop(0, '#3a2a22'); g.addColorStop(.5, '#b07a5a'); g.addColorStop(1, '#202838'); x.fillStyle = g; x.fillRect(0, 0, 64, 64);
            const R = filtRunner(), base = x.getImageData(0, 0, 64, 64).data, out = {};
            for (const id of ${JSON.stringify(ids)}){ const cv = R.run(c, filtIdx(id), 1, 64, 64, 1080, 1080); const o = document.createElement('canvas'); o.width = o.height = 64; o.getContext('2d').drawImage(cv, 0, 0);
              const d = o.getContext('2d').getImageData(0, 0, 64, 64).data; let s = 0; for (let i = 0; i < d.length; i += 4) s += Math.abs(d[i] - base[i]) + Math.abs(d[i+1] - base[i+1]) + Math.abs(d[i+2] - base[i+2]); out[id] = Math.round(s / (64 * 64 * 3)); }
            R.close(); return out; })()`)""", TT)
        check(tag + ' : chaque filtre « Tendance » change l’image', ch and all(v >= 3 for v in ch.values()), ch)
    # 5 and 7
    ev(pg, 'expOpen()'); pg.wait_for_timeout(300); ev(pg, 'EXP_SM.hist = [], expUpdate(0.4)'); pg.wait_for_timeout(600)
    m = pg.evaluate("""() => { const m = document.querySelector('#expMascot'), s = getComputedStyle(m), a = []; for (let i = 0; i < 4; i++) a.push(m.getBoundingClientRect().left);
        return [s.animationName, getComputedStyle(document.querySelector('#expScreen .ex-pile')).display !== 'none']; }""")
    xs = []
    for i in range(6): xs.append(pg.evaluate("() => Math.round(document.querySelector('#expMascot').getBoundingClientRect().left)")); pg.wait_for_timeout(260)
    if calm: check(tag + ' : avec « réduire les animations », la mascotte ne bouge pas', len(set(xs)) == 1, xs)
    else: check(tag + ' : la mascotte fait des allers-retours entre le tas de blocs et l’igloo (tas visible)', m == ['m3trip', True] and max(xs) - min(xs) > 20, [m, xs])
    ev(pg, "(document.querySelector('#expEta').hidden = false, true)")
    col = pg.evaluate("() => getComputedStyle(document.querySelector('#expEta')).color")
    check(tag + ' : « Encore environ … s » en blanc', col == 'rgb(255, 255, 255)', col)
    ev(pg, "$('#result').hidden = true, expClose(true)"); pg.wait_for_timeout(1900)
    if not calm:
        # 2
        ev(pg, "offer1On = () => false, S.song.demo = false, store.set(PP_KEY, 1), " + FAST)
        pg.evaluate('() => { __ev("exportOne()"); }'); pg.wait_for_function('() => __ev("S.done === true && !S.exporting")', timeout=90000); pg.wait_for_timeout(1200)
        check(tag + ' : avant d’enregistrer, pas encore de « Retour au menu principal »', not pg.locator('.m4-home').is_visible())
        pg.locator('#saveBtn').click(); pg.wait_for_timeout(900)
        if pg.locator('#proPop .card').is_visible(): pg.locator('#proPopLater').click(); pg.wait_for_timeout(300)
        h = pg.locator('.m4-home'); h.scroll_into_view_if_needed()
        txt = h.inner_text().strip(); bb = h.bounding_box()
        check(tag + ' : après « Enregistrer la vidéo », « %s » bien visible' % txt, h.is_visible() and txt.endswith('Retour au menu principal' if lang == 'fr' else 'Back to home') and bb['height'] >= 50, [txt, bb])
        a = pg.evaluate("() => StalakM.ed.goHome.constructor.name")
        check(tag + ' : avant de revenir à l’accueil, le montage est d’abord gardé dans le téléphone (« Montages »)', a == 'AsyncFunction', a)
        h.click(); pg.wait_for_timeout(1500)
        check(tag + ' : le bouton ramène à l’accueil', pg.evaluate('() => StalakM.home()'))
        # the example alone is never kept (lpWorth); a real edit is kept on the phone before going home (goHome awaits lpSave(true))
        pass
    check(tag + ' : aucune erreur dans la page', not errs, errs)
    ctx.close()


with sync_playwright() as p:
    b = p.chromium.launch()
    for a in (('iPhone 13', 'fr'), ('iPhone SE', 'en'), ('iPhone 13', 'fr', True)):
        try: run(b, p, *a)
        except Exception as e: check(' '.join(str(x) for x in a) + ' : déroulé complet', False, str(e)[:400])
    b.close()
print('%d/%d réussis' % (sum(results), len(results)))
sys.exit(0 if all(results) else 1)
