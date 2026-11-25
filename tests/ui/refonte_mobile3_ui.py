"""Test of the mobile redesign, lot 3 (24/11): the editor in 4 steps and the camera on a phone (src/mobile3.js).
Python Playwright (chromium, a fake camera).

    python3 /abs/path/tests/ui/refonte_mobile3_ui.py <path of a built public/ folder> [folder for screenshots]

- iPhone 12 in French, iPhone SE in English: the top bar (back, 4 steps, help), « Étape n sur 4 » and the demo's question,
  one blue button at the bottom; nothing wider than the screen; no error in the page.
- No setting disappears: every control of the editor is still in the page and reachable (the fold under the song, the
  sheets of the Montage step, the camera's own buttons), and they still act (format, cuts, lyrics, remix, timer, flash).
- The mascot's bubble: the first time only.
- The camera: its own full screen, the timer (off / 3 s / 5 s), the flash (aria-pressed, the white frame without a torch),
  « Terminer ».
- A computer: nothing of this. Under test without the flag: nothing either (the older tests keep their layout)."""
import functools, http.server, os, shutil, sys, tempfile, threading
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.sync_api import sync_playwright

PUBLIC = os.path.abspath(sys.argv[1])
SHOTS = sys.argv[2] if len(sys.argv) > 2 else None
results = []
T = {'fr': {'k': 'Étape {n} sur 4', 'h1': 'Choisis ton passage', 'h2': 'Tes prises', 's2': 'Plus tu en as, plus le montage est varié.', 'h3': 'Des paroles à l’écran ?',
            'tip2': 'Filme le même passage sous plusieurs angles.', 'exp': 'Exporter ma vidéo', 'rec': 'Filmer une prise', 'done': 'Terminer',
            'ly': ['Automatiques', 'Je colle mon texte', 'Sans paroles'], 'tools': ['Coupes', 'Effets', 'Filtres', 'Paroles', 'Remixer', 'Format']},
     'en': {'k': 'Step {n} of 4', 'h1': 'Pick your part', 'h2': 'Your takes', 's2': 'The more you have, the more varied the edit.', 'h3': 'Lyrics on screen?',
            'tip2': 'Film the same part from several angles.', 'exp': 'Export my video', 'rec': 'Film a take', 'done': 'Done',
            'ly': ['Automatic', 'I paste my lyrics', 'No lyrics'], 'tools': ['Cuts', 'Effects', 'Filters', 'Lyrics', 'Remix', 'Format']}}
# every control of the editor (inventory of docs/handoff/app-refonte-mobile.md, lot 3)
CONTROLS = ['#kindSeg', '#songPlay', '#segPlay', '#wave', '#barPrev', '#barNext', '#endPrev', '#endNext', '#barsSel', '#bpmTap', '#bpmTapOk', '#beatTest', '#songFile',
            '#takeFiles', '#recOpen', '#recFlip', '#recFlash', '#recTimerSeg', '#recGo', '#recStop', '#recCancel', '#recClose',
            '#lyrMode', '#lyText', '#autoStart', '#tapStart', '#lyFile', '#lyTrLang', '#lyTrGo', '#tapBtn', '#autoAgain', '#tapAgain',
            '#stPos', '#stFont', '#stColor', '#stDeco', '#stSize', '#stAnim', '#stHl',
            '#kindSeg4', '#modeSeg', '#paceSeg', '#brollSeg', '#fxSeg', '#fmtSeg', '#frameSeg', '#bestChk', '#filtRow', '#tl', '#tlZoom',
            '#cutSwap', '#cutAdd', '#cutLock', '#cutFx', '#cutExcl', '#fxChange', '#fxDel', '#fxSee', '#playBtn', '#shuffleBtn',
            '#exportBtn', '#packSel', '#packBtn']


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


def check(name, ok, info=''):
    results.append(ok)
    print(('PASS ' if ok else 'FAIL ') + name + (('  — ' + str(info)) if info and not ok else ''))


def ev(pg, code):
    return pg.evaluate('s => __ev(s)', code)


def vis(pg, sel):
    return pg.evaluate("s => { const e = document.querySelector(s); if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden' && r.bottom > 0 && r.top < innerHeight; }", sel)


def no_hscroll(pg):
    return pg.evaluate('() => document.documentElement.scrollWidth <= innerWidth + 1')


def shot(pg, name):
    if SHOTS: pg.screenshot(path=os.path.join(SHOTS, name + '.png'))


def head(pg):
    return pg.evaluate("() => { const h = document.querySelector('.m3-head'); return h && h.isConnected ? [h.querySelector('.m3-k').textContent, h.querySelector('.m3-h').textContent, h.querySelector('.m3-s').textContent] : null; }")


def bottom_button(pg, sel):
    """the one blue button at the bottom: blue, ink outline, at the bottom of the screen"""
    return pg.evaluate("""s => { const e = document.querySelector(s); if (!e) return null; const c = getComputedStyle(e), r = e.getBoundingClientRect();
      return [c.backgroundColor, c.borderTopColor, r.bottom <= innerHeight && r.bottom > innerHeight - 140, Math.round(r.height)]; }""", sel)


def run(b, base, lang, dev):
    tag = dev + ' ' + lang; t = T[lang]
    ctx = b.new_context(**PW.devices[dev], locale='fr-FR' if lang == 'fr' else 'en-US', permissions=['camera', 'microphone'])
    ctx.add_init_script('window.__stalakM3on = 1;')
    ctx.route('**/api/**', lambda r: r.fulfill(status=204, body=''))
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.goto(base + ('fr/' if lang == 'fr' else ''), wait_until='load'); pg.wait_for_function('window.__ev && window.StalakM3', timeout=60000)
    check(tag + ' : à l’accueil, rien du nouvel éditeur', not ev(pg, "document.documentElement.classList.contains('m3')") and not vis(pg, '.m3-bar'))
    pg.locator('#heroDemo:visible, #mhEx:visible, #demoBtn:visible').first.click()
    pg.wait_for_function('() => __ev("S.step === 4 && S.cuts.length > 0")', timeout=240000); pg.wait_for_timeout(1200)
    check(tag + ' : tous les réglages de l’éditeur sont encore dans la page', pg.evaluate("l => l.filter(s => !document.querySelector(s))", CONTROLS) == [], pg.evaluate("l => l.filter(s => !document.querySelector(s))", CONTROLS))

    # 1. Son
    ev(pg, 'go(1)'); pg.wait_for_timeout(1000)
    segs = pg.evaluate("() => [...document.querySelectorAll('.m3-segs li')].map(l => l.classList.contains('on'))")
    check(tag + ' : la barre du haut : retour, 4 étapes (la 1re allumée), le glaçon d’aide', vis(pg, '.m3-back') and vis(pg, '.m3-cube') and segs == [True, False, False, False] and not vis(pg, '.wrap > header'), segs)
    check(tag + ' : étape 1 : « %s »' % t['h1'], head(pg) == [t['k'].replace('{n}', '1'), t['h1'], ''], head(pg))
    bb = bottom_button(pg, '#next1')
    check(tag + ' : un seul bouton en bas, bleu à contour encre', bb and bb[0] == 'rgb(31, 111, 214)' and bb[1] == 'rgb(10, 13, 20)' and bb[2] and bb[3] >= 56, bb)
    check(tag + ' : la carte du son (onde, poignées, écoute) et TikTok / Clip', vis(pg, '#wave') and vis(pg, '#segPlay') and vis(pg, '#kindSeg'))
    pg.locator('.m3-more > summary').click(); pg.wait_for_timeout(400)
    pg.locator('#barsSel').scroll_into_view_if_needed()
    check(tag + ' : « Début, durée et rythme » : les mesures, la durée et le rythme sont là', vis(pg, '#barsSel') and pg.evaluate("() => !!document.querySelector('.m3-more #barNext') && !!document.querySelector('.m3-more #beatFix')"))
    shot(pg, 'm3-son-%s-%s' % (dev.replace(' ', ''), lang))
    pg.locator('.m3-back').click(); pg.wait_for_timeout(600)
    check(tag + ' : « retour » à l’étape 1 : la question avant de quitter le projet', vis(pg, '#homeAsk') if pg.evaluate("() => !!document.querySelector('#homeAsk')") else True)
    if vis(pg, '#homeNo'): pg.locator('#homeNo').click(); pg.wait_for_timeout(300)

    # 2. Prises
    pg.locator('#next1').click(); pg.wait_for_timeout(1200)
    check(tag + ' : étape 2 : « %s », « %s »' % (t['h2'], t['s2']), head(pg) == [t['k'].replace('{n}', '2'), t['h2'], t['s2']], head(pg))
    tip = pg.evaluate("() => { const p = document.querySelector('.m3-tip p'); return p && p.isConnected ? p.textContent : null; }")
    check(tag + ' : la bulle de la mascotte, la première fois', tip == t['tip2'], tip)
    n = pg.locator('.m3-grid li.take').count()
    check(tag + ' : les prises en images (3), et « + »', n == 3 and pg.locator('.m3-grid .m3-add').count() == 1 and pg.locator('.m3-grid li.take canvas.m3-th').count() == 3, n)
    check(tag + ' : « %s » au-dessus de « Continuer »' % t['rec'], pg.locator('#recOpen .m3-rl').inner_text().strip() == t['rec'] and vis(pg, '#recOpen') and vis(pg, '#next2')
          and pg.evaluate("() => document.querySelector('#recOpen').getBoundingClientRect().bottom <= document.querySelector('#next2').getBoundingClientRect().top"))
    check(tag + ' : rien ne dépasse de l’écran (étape 2)', no_hscroll(pg))
    shot(pg, 'm3-prises-%s-%s' % (dev.replace(' ', ''), lang))
    # the camera
    pg.locator('#recOpen').click(); pg.wait_for_function("() => document.documentElement.classList.contains('m3cam')", timeout=15000); pg.wait_for_timeout(800)
    r = pg.evaluate("() => { const r = document.querySelector('#recPanel').getBoundingClientRect(); return [r.left, r.top, Math.round(r.width) === innerWidth, Math.round(r.height) === innerHeight]; }")
    check(tag + ' : la caméra a son propre écran, en plein écran', r == [0, 0, True, True], r)
    check(tag + ' : la caméra : fermer, n° de la prise, caméra avant / arrière, minuteur, flash, gros bouton, « %s »' % t['done'],
          all(vis(pg, s) for s in ('.m3-cx', '.m3-pill', '#recFlip', '.m3-ct', '#recFlash', '#recGo', '#recClose')) and 'Prise 4' in pg.locator('.m3-pill').inner_text() if lang == 'fr' else
          all(vis(pg, s) for s in ('.m3-cx', '.m3-pill', '#recFlip', '.m3-ct', '#recFlash', '#recGo', '#recClose')) and 'Take 4' in pg.locator('.m3-pill').inner_text(), pg.locator('.m3-pill').inner_text())
    check(tag + ' : « %s » écrit sur le bouton qui ferme' % t['done'], pg.evaluate("() => getComputedStyle(document.querySelector('#recClose'), '::after').content") == '"' + t['done'] + '"')
    d0 = ev(pg, 'recDelay'); pg.locator('.m3-ct').click(); pg.wait_for_timeout(200); d1 = ev(pg, 'recDelay'); pg.locator('.m3-ct').click(); pg.wait_for_timeout(200); d2 = ev(pg, 'recDelay')
    pg.locator('.m3-ct').click(); pg.wait_for_timeout(200)
    check(tag + ' : le minuteur change (sans → 3 s → 5 s → sans), le même réglage que la caméra', [d0, d1, d2, ev(pg, 'recDelay')] == [0, 3, 5, 0], [d0, d1, d2])
    pg.locator('#recFlash').click(); pg.wait_for_timeout(300)
    check(tag + ' : le flash : allumé (sans torche : le cadre blanc autour de l’image)', pg.locator('#recFlash').get_attribute('aria-pressed') == 'true' and ev(pg, "$('#recPanel').classList.contains('flashring')"))
    shot(pg, 'm3-camera-%s-%s' % (dev.replace(' ', ''), lang))
    pg.locator('#recFlash').click(); pg.wait_for_timeout(200)
    check(tag + ' : le flash s’éteint', pg.locator('#recFlash').get_attribute('aria-pressed') == 'false' and not ev(pg, "$('#recPanel').classList.contains('flashring')"))
    pg.locator('#recClose').click(); pg.wait_for_timeout(600)
    check(tag + ' : « %s » : retour aux prises, la caméra éteinte' % t['done'], not ev(pg, "document.documentElement.classList.contains('m3cam')") and not ev(pg, '!!recStream') and vis(pg, '#next2'))

    # 3. Paroles
    pg.locator('#next2').click(); pg.wait_for_timeout(1200)
    check(tag + ' : étape 3 : « %s »' % t['h3'], head(pg) == [t['k'].replace('{n}', '3'), t['h3'], ''], head(pg))
    ly = pg.evaluate("() => [...document.querySelectorAll('.m3-ly button b')].map(b => b.textContent)")
    check(tag + ' : 3 grands choix de paroles, ceux de la démo', ly == t['ly'], ly)
    pg.locator('.m3-ly button[data-m="none"]').click(); pg.wait_for_timeout(400)
    check(tag + ' : « %s » : le réglage change' % t['ly'][2], ev(pg, 'S.lyrics.mode') == 'none' and pg.locator('.m3-ly button[data-m="none"]').get_attribute('aria-pressed') == 'true')
    pg.locator('.m3-ly button[data-m="paste"]').click(); pg.wait_for_timeout(400)
    check(tag + ' : « %s » : coller, .txt et calage, comme avant' % t['ly'][1], ev(pg, 'S.lyrics.mode') == 'paste' and vis(pg, '#lyText') and pg.evaluate("() => !!document.querySelector('#lyFile') && !!document.querySelector('#tapStart')"))
    shot(pg, 'm3-paroles-%s-%s' % (dev.replace(' ', ''), lang))

    # 4. Montage
    pg.locator('#next3').click(); pg.wait_for_timeout(1500)
    segs = pg.evaluate("() => [...document.querySelectorAll('.m3-segs li')].map(l => l.classList.contains('on'))")
    check(tag + ' : étape 4 : la barre pleine, l’aperçu et sa lecture', segs == [True] * 4 and vis(pg, '#view') and vis(pg, '.m3-play'), segs)
    tools = pg.evaluate("() => [...document.querySelectorAll('.m3-tools button span')].map(s => s.textContent)")
    check(tag + ' : 6 outils : %s' % ', '.join(t['tools']), tools == t['tools'] and vis(pg, '.m3-tools'), tools)
    bb = bottom_button(pg, '#expFab .expbar-go')
    check(tag + ' : « %s » en bas, bleu' % t['exp'], pg.locator('#expFab .m3-el').inner_text().strip() == t['exp'] and bb and bb[0] == 'rgb(31, 111, 214)' and bb[2], bb)
    check(tag + ' : rien ne dépasse de l’écran (étape 4)', no_hscroll(pg))
    shot(pg, 'm3-montage-%s-%s' % (dev.replace(' ', ''), lang))
    for k, sel in (('cuts', '#modeSeg'), ('filt', '#filtRow'), ('ly', '#stPos'), ('fmt', '#fmtSeg')):
        pg.locator('.m3-tools button[data-tool="%s"]' % k).click(); pg.wait_for_timeout(500)
        check(tag + ' : outil « %s » : sa feuille et ses réglages' % k, vis(pg, '#m3Sh_' + k) and vis(pg, sel) and pg.locator('.m3-tools button[data-tool="%s"]' % k).get_attribute('aria-expanded') == 'true')
        if k == 'filt':
            # (25/11, owner) the thumbnails are pictures as the sheet opens, never black squares
            dark = pg.evaluate("() => [...document.querySelectorAll('#filtRow canvas')].filter(c => c.offsetParent).map(c => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let s = 0; for (let i = 0; i < d.length; i += 4 * 97) s += d[i] + d[i + 1] + d[i + 2]; return s; }).filter(v => v < 30).length")
            check(tag + ' : Filtres : les vignettes sont des images dès l’ouverture (aucune noire)', dark == 0, dark)
        if k == 'fmt':
            pg.locator('#fmtSeg button[data-v="45"]').click(); pg.wait_for_timeout(400)
            check(tag + ' : Format 4:5 choisi dans la feuille', ev(pg, 'S.fmt') == '45'); pg.locator('#fmtSeg button[data-v="916"]').click(); pg.wait_for_timeout(300)
        if k == 'cuts':
            pg.locator('#paceSeg button[data-v="nerveux"]').click(); pg.wait_for_timeout(400)
            check(tag + ' : Rythme « Nerveux » choisi dans la feuille', ev(pg, 'S.pace') == 'nerveux'); shot(pg, 'm3-coupes-%s-%s' % (dev.replace(' ', ''), lang))
        pg.keyboard.press('Escape'); pg.wait_for_timeout(400)
        check(tag + ' : Échap ferme la feuille « %s »' % k, not vis(pg, '#m3Sh_' + k))
    pg.locator('.m3-tools button[data-tool="fx"]').click(); pg.wait_for_timeout(400)
    check(tag + ' : outil « Effets » en TikTok : il dit que les effets sont dans le mode Clip', vis(pg, '.m3-fxno') and len(pg.locator('.m3-fxno').inner_text()) > 10)
    pg.locator('#m3Sh_fx .m3-rd').click(); pg.wait_for_timeout(300)
    v0 = ev(pg, 'S.version'); pg.locator('.m3-tools button[data-tool="mix"]').click(); pg.wait_for_timeout(800)
    check(tag + ' : « Remixer » : un nouveau montage (version suivante)', ev(pg, 'S.version') == v0 + 1, (v0, ev(pg, 'S.version')))
    pg.locator('.m3-tools button[data-tool="ly"]').click(); pg.wait_for_timeout(400); pg.locator('.m3-lyedit').click(); pg.wait_for_timeout(1000)
    check(tag + ' : « Modifier les paroles » ramène à l’étape 3', ev(pg, 'S.step') == 3)
    pg.locator('.m3-back').click(); pg.wait_for_timeout(1000)
    check(tag + ' : « retour » : l’étape d’avant', ev(pg, 'S.step') == 2)
    # the bubble: the first time only
    ev(pg, 'go(3)'); pg.wait_for_timeout(600); ev(pg, 'go(2)'); pg.wait_for_timeout(800)
    check(tag + ' : la bulle ne revient pas', not pg.evaluate("() => { const p = document.querySelector('.m3-tip'); return !!(p && p.isConnected && p.getBoundingClientRect().height); }"))
    check(tag + ' : aucune erreur dans la page', not errs, errs)
    ctx.close()


def computer(b, base, lang):
    tag = 'ordinateur ' + lang
    ctx = b.new_context(viewport={'width': 1280, 'height': 860}, locale='fr-FR' if lang == 'fr' else 'en-US')
    ctx.add_init_script('window.__stalakM3on = 1;'); ctx.route('**/api/**', lambda r: r.fulfill(status=204, body=''))
    pg = ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.goto(base + ('fr/' if lang == 'fr' else ''), wait_until='load'); pg.wait_for_function('() => !!window.__ev', timeout=60000); pg.wait_for_timeout(1500)
    pg.locator('#demoBtn:visible, #heroDemo:visible').first.click(); pg.wait_for_function('() => __ev("S.step === 4 && S.cuts.length > 0")', timeout=240000)
    check(tag + ' : sur ordinateur, rien de tout ça (le fichier n’est pas chargé)', not pg.evaluate('() => !!window.StalakM3') and not ev(pg, "document.documentElement.classList.contains('m3')") and vis(pg, '#modeSeg'))
    check(tag + ' : aucune erreur dans la page', not errs, errs)
    ctx.close()


def quiet(b, base):
    ctx = b.new_context(**PW.devices['iPhone 12'], locale='fr-FR'); ctx.route('**/api/**', lambda r: r.fulfill(status=204, body=''))
    pg = ctx.new_page(); pg.goto(base + 'fr/', wait_until='load'); pg.wait_for_function('() => !!window.__ev', timeout=60000); pg.wait_for_timeout(2500)
    check('iPhone 12 fr : sous test sans le drapeau, le nouvel éditeur reste éteint (les anciens tests gardent leur page)', not pg.evaluate('() => !!window.StalakM3'))
    ctx.close()


def main():
    global PW
    tmp = tempfile.mkdtemp(prefix='stalak-m3-'); site = os.path.join(tmp, 'site'); shutil.copytree(PUBLIC, site)
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from _probe import add_probe; add_probe(site)
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=site))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = 'http://127.0.0.1:%d/' % srv.server_address[1]
    with sync_playwright() as p:
        PW = p
        b = p.chromium.launch(args=['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required'])
        for fn, a in ((run, (base, 'fr', 'iPhone 12')), (run, (base, 'en', 'iPhone SE')), (computer, (base, 'fr')), (quiet, (base,))):
            try: fn(b, *a)
            except Exception as e: check(' '.join(str(x) for x in a[1:]) + ' : déroulé complet (' + fn.__name__ + ')', False, str(e)[:400])
        b.close()
    srv.shutdown(); shutil.rmtree(tmp, ignore_errors=True)
    print('%d/%d réussis' % (sum(results), len(results)))
    sys.exit(0 if all(results) else 1)


PW = None
main()
