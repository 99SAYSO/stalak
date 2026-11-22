"""Test of the 22/11 changes (audit mobile and audit vente, App & montage). Python Playwright (chromium).

    python3 /abs/path/tests/ui/vente_ui.py <built public/ folder> [folder for screenshots]

1. The first screen of a phone (iPhone 12: 664 px seen, iPhone SE: 568 px): « Choisir mon son » and « Voir un exemple » are in
   it, without scrolling. « Choisir mon son » opens the file choice of the song, « Voir un exemple » loads the example. On a
   computer they are not there (the song card and « Essayer avec un exemple » are already in its first screen).
2. The Montage step: « Exporter » is a bar across the bottom of the screen (the whole width, at the very bottom), with what will
   be exported next to it; the help ice cube sits above it; at the bottom of the page no link of the footer is under the bar.
3. « Stalak monte ta vidéo »: while the takes are being set on the song, the card says so with the real steps, ticked as they
   are done, then it goes.
4. The export screen: the 4 real steps of the export, ticked as they are done, all ticked at the end.
5. The end screen (free plan): with / without the logo, then « Enregistrer la vidéo » seen whole without scrolling (iPhone 12,
   iPhone SE, computer), then « Publier sur TikTok » and « Exporter sans le logo »; the e-mail box further down.
French and English, no sideways scrolling, no error in the page."""
import functools, http.server, os, shutil, subprocess, sys, tempfile, threading
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.sync_api import sync_playwright

PUBLIC = os.path.abspath(sys.argv[1])
SHOTS = sys.argv[2] if len(sys.argv) > 2 else None
results = []
T = {'fr': {'song': 'Choisir mon son', 'demo': 'Voir un exemple', 'ws': 'Stalak monte ta vidéo', 'exp': 'Exporter', 'takes': 'prises'},
     'en': {'song': 'Choose my song', 'demo': 'See an example', 'ws': 'Stalak is editing your video', 'exp': 'Export', 'takes': 'takes'}}


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


def check(name, ok, info=''):
    results.append(bool(ok))
    print(('PASS ' if ok else 'FAIL ') + name + (('  — ' + str(info)) if info and not ok else ''), flush=True)


def ev(pg, code):
    return pg.evaluate('s => __ev(s)', code)


def box(pg, sel):
    return pg.evaluate("s => { const e = document.querySelector(s); if (!e || e.hidden) return null; const r = e.getBoundingClientRect(); return r.width ? { x: r.left, y: r.top, w: r.width, h: r.height, b: r.bottom, r: r.right } : null; }", sel)


def page(b, base, lang, dev, PW):
    opts = dict(PW.devices[dev]) if dev != 'ordinateur' else {'viewport': {'width': 1280, 'height': 860}}
    ctx = b.new_context(**opts, locale='en-US' if lang == 'en' else 'fr-FR')
    ctx.route('**/api/**', lambda r: r.fulfill(status=204, body=''))
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.goto(base + ('' if lang == 'en' else 'fr/'), wait_until='load'); pg.wait_for_function('window.__ev && window.MP4Box', timeout=60000)
    pg.wait_for_timeout(600)
    return ctx, pg, errs


def first_screen(b, base, lang, dev, PW):
    tag = dev + ' ' + lang; t = T[lang]
    ctx, pg, errs = page(b, base, lang, dev, PW)
    vh = pg.viewport_size['height']
    s, d = box(pg, '#heroSong'), box(pg, '#heroDemo')
    if dev == 'ordinateur':
        check(tag + ' : ordinateur : pas de boutons en plus (la carte du son est déjà dans le premier écran)', s is None and d is None and box(pg, '#songDrop')['b'] <= vh, (s, d))
    else:
        check(tag + ' : « %s » et « %s » dans le premier écran, sans défiler (%d px)' % (t['song'], t['demo'], vh), s and d and s['b'] <= vh and d['b'] <= vh and pg.evaluate('scrollY') == 0, (s, d, vh))
        txt = [pg.locator('#heroSong').inner_text().strip(), pg.locator('#heroDemo').inner_text().strip()]
        check(tag + ' : les textes des deux boutons', txt == [t['song'], t['demo']], txt)
        check(tag + ' : boutons d’au moins 44 px, « %s » le plus grand' % t['song'], d['h'] >= 44 and s['h'] > d['h'], (s, d))
        with pg.expect_file_chooser(timeout=5000) as fc: pg.locator('#heroSong').click()
        check(tag + ' : « %s » ouvre le choix du fichier du son' % t['song'], fc.value.element.evaluate('e => e.id') == 'songFile')
        if SHOTS: pg.screenshot(path=os.path.join(SHOTS, 'accueil-%s-%s.png' % (dev.replace(' ', '').lower(), lang)))
        pg.locator('#heroDemo').click()
        pg.wait_for_function('() => __ev("S.step === 4 && S.cuts.length > 0")', timeout=180000)
        check(tag + ' : « %s » charge l’exemple' % t['demo'], ev(pg, '!!(S.song && S.song.demo)'))
        # 2. the bar
        pg.wait_for_timeout(1200); pg.evaluate('window.scrollTo(0, 0)'); pg.wait_for_timeout(500)
        f, vw = box(pg, '#expFab'), pg.viewport_size['width']
        check(tag + ' : « %s » : une barre sur toute la largeur, tout en bas' % t['exp'], f and abs(f['x']) < 1 and abs(f['w'] - vw) < 1 and abs(f['b'] - vh) < 1.5, (f, vw, vh))
        g = box(pg, '#expFab .expbar-go'); info = pg.locator('#expFabI').inner_text()
        check(tag + ' : le bouton (%s) et ce qui sera exporté (format, durée, prises)' % t['exp'], g and g['h'] >= 52 and pg.locator('#expFab .expbar-go').inner_text().startswith(t['exp'])
              and '9:16' in info and t['takes'] in info, (g, info))
        cube = box(pg, '#helpBtn')
        check(tag + ' : le glaçon d’aide au-dessus de la barre', cube and cube['b'] <= f['y'] + 1, (cube, f))
        if SHOTS: pg.screenshot(path=os.path.join(SHOTS, 'barre-%s-%s.png' % (dev.replace(' ', '').lower(), lang)))
        pg.evaluate('window.scrollTo(0, document.documentElement.scrollHeight)'); pg.wait_for_timeout(900)
        f = box(pg, '#expFab')
        if f:
            hit = pg.evaluate("y => [...document.querySelectorAll('#siteFoot a, #siteFoot button')].filter(e => { const r = e.getBoundingClientRect(); return r.width && r.bottom > y; }).length", f['y'])
            check(tag + ' : en bas de la page, aucun lien du pied de page sous la barre', hit == 0, hit)
        pg.locator('#expFab .expbar-go').click(); pg.wait_for_timeout(2500)
        check(tag + ' : un appui amène à la carte Exporter, la barre s’en va', pg.locator('#expFab').is_hidden())
    sw = pg.evaluate('document.documentElement.scrollWidth')
    check(tag + ' : pas de défilement de côté', sw <= pg.viewport_size['width'], sw)
    check(tag + ' : aucune erreur dans la page', not errs, errs)
    ctx.close()


def work_and_export(b, base, site, lang, dev, PW):
    tag = dev + ' ' + lang; t = T[lang]
    ctx, pg, errs = page(b, base, lang, dev, PW)
    pg.set_input_files('#songFile', os.path.join(site, 'beat.wav')); pg.wait_for_function('() => __ev("!!S.song")', timeout=60000)
    ev(pg, 'go(2)'); pg.wait_for_timeout(300)
    # 3. « Stalak monte ta vidéo », its states read every 50 ms while the takes are set on the song
    pg.evaluate("() => { window.__ws = []; window.__wsT = setInterval(() => { const b = document.querySelector('#wSteps'); if (!b || b.hidden) { window.__ws.push('-'); return; } window.__ws.push([...b.querySelectorAll('li[data-ws]')].filter(l => !l.hidden).map(l => l.dataset.st[0]).join('')); }, 50); }")
    pg.set_input_files('#takeFiles', [os.path.join(site, 'take1.mp4'), os.path.join(site, 'take2.mp4')])
    pg.wait_for_function('''() => __ev("S.takes.length === 2 && S.takes.every(t => t.status !== 'pending')")''', timeout=180000)
    title = pg.locator('#wSteps .ws-t').inner_text().strip()
    if SHOTS and not pg.locator('#wSteps').is_hidden(): pg.locator('#wSteps').scroll_into_view_if_needed(); pg.screenshot(path=os.path.join(SHOTS, 'etapes-montage-%s-%s.png' % (dev.replace(' ', '').lower(), lang)))
    pg.wait_for_function("() => document.querySelector('#wSteps').hidden", timeout=60000)
    seen = pg.evaluate("() => { clearInterval(window.__wsT); return window.__ws.filter((x, i, a) => i === 0 || x !== a[i - 1]); }")
    shown = [x for x in seen if x != '-']
    check(tag + ' : « %s » s’affiche pendant le calage des prises, à l’étape Prises' % t['ws'], title == t['ws'] and any(x.startswith('dn') for x in shown), seen)
    check(tag + ' : les étapes se cochent dans l’ordre, puis la carte s’en va', all(list(x) == sorted(x, key='dnt'.index) for x in shown) and shown[-1] == 'dddd', seen)
    # 4. the export screen
    ev(pg, 'go(4)'); pg.wait_for_function('() => __ev("S.cuts.length > 1")', timeout=60000); pg.wait_for_timeout(1500)
    pg.evaluate("() => { window.__xs = []; window.__xsT = setInterval(() => { const s = document.querySelector('#expScreen'); if (s.hidden) return; window.__xs.push([...document.querySelectorAll('#xSteps li')].map(l => (l.dataset.st || '?')[0]).join('')); }, 40); }")
    pg.evaluate('() => { __ev("exportOne()"); }')
    pg.wait_for_function("() => !document.querySelector('#expScreen').hidden", timeout=20000)
    pg.wait_for_timeout(300)
    if SHOTS: pg.screenshot(path=os.path.join(SHOTS, 'export-%s-%s.png' % (dev.replace(' ', '').lower(), lang)))
    xb = box(pg, '#xSteps'); vh = pg.viewport_size['height']
    check(tag + ' : écran d’export : les 4 étapes dans l’écran', xb and xb['b'] <= vh and pg.locator('#xSteps li').count() == 4, (xb, vh))
    pg.wait_for_function('() => __ev("S.done")', timeout=300000)
    xs = pg.evaluate("() => { clearInterval(window.__xsT); return window.__xs.filter((x, i, a) => i === 0 || x !== a[i - 1]); }")
    check(tag + ' : les étapes de l’export avancent dans l’ordre et finissent toutes cochées', 'dddd' in xs and any(x.startswith('dn') for x in xs) and all(list(x) == sorted(x, key='dnt'.index) for x in xs), xs)
    # 5. (Chef de projet, 22/11) the end screen: « Enregistrer la vidéo » seen whole without scrolling, with the Pro offer (with /
    # without the logo, « Exporter sans le logo ») and « Publier sur TikTok » (a stand-in where tiktok.js puts it), the e-mail box under
    pg.wait_for_timeout(2500)
    if pg.locator('#proPop .card').is_visible(): pg.locator('#proPopLater').click(); pg.wait_for_timeout(500)
    pg.evaluate("() => { if (!document.querySelector('#ttkPub')){ const b = document.createElement('button'); b.className = 'btn big ttk-pubbtn ttk-tt protag'; b.id = 'ttkPub'; b.dataset.plan = 'PRO'; b.textContent = 'TikTok'; document.querySelector('#saveRow').after(b); } }")
    pg.wait_for_timeout(300)
    sv, cm, go, tt = box(pg, '#saveBtn'), box(pg, '#dvCmp'), box(pg, '#dvCmpGo'), box(pg, '#ttkPub')
    check(tag + ' : fin d’export : avec / sans le logo, puis « Enregistrer la vidéo » en entier dans l’écran, sans défiler', pg.evaluate('scrollY') == 0 and cm and sv and cm['b'] <= sv['y'] and sv['y'] >= 0 and sv['b'] <= vh, (cm, sv, vh))
    check(tag + ' : … puis « Publier sur TikTok », « Exporter sans le logo », et la case e-mail plus bas', tt and go and sv['b'] <= tt['y'] and tt['b'] <= go['y'] and (box(pg, '#optBox') is None or box(pg, '#optBox')['y'] > go['b']), (sv, tt, go, box(pg, '#optBox')))
    if SHOTS: pg.screenshot(path=os.path.join(SHOTS, 'fin-%s-%s.png' % (dev.replace(' ', '').lower(), lang)))
    sw = pg.evaluate('document.documentElement.scrollWidth')
    check(tag + ' : pas de défilement de côté', sw <= pg.viewport_size['width'], sw)
    check(tag + ' : aucune erreur dans la page', not errs, errs)
    ctx.close()


def main():
    tmp = tempfile.mkdtemp(prefix='stalak-vente-')
    site = os.path.join(tmp, 'site'); shutil.copytree(PUBLIC, site)
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from _probe import add_probe; add_probe(site)
    ff = shutil.which('ffmpeg'); beat = "0.8*sin(2*PI*60*t)*exp(-25*mod(t,0.5))+0.15*sin(2*PI*440*t)"
    subprocess.run([ff, '-nostdin', '-v', 'error', '-y', '-f', 'lavfi', '-i', "aevalsrc='%s':s=44100:d=16" % beat, '-ac', '1', os.path.join(site, 'beat.wav')], check=True)
    for i in (1, 2):
        subprocess.run([ff, '-nostdin', '-v', 'error', '-y', '-f', 'lavfi', '-i', 'testsrc2=s=360x640:r=30:d=16,hue=h=%d' % (i * 90), '-f', 'lavfi', '-i', "aevalsrc='%s':s=44100:d=16" % beat,
                        '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-g', '30', '-c:a', 'aac', '-shortest', os.path.join(site, 'take%d.mp4' % i)], check=True)
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=site))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = 'http://127.0.0.1:%d/' % srv.server_address[1]
    with sync_playwright() as p:
        b = p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'])
        for lang, dev in (('fr', 'iPhone 12'), ('en', 'iPhone 12'), ('fr', 'iPhone SE'), ('en', 'ordinateur')):
            try: first_screen(b, base, lang, dev, p)
            except Exception as e: check(dev + ' ' + lang + ' : premier écran, déroulé complet', False, str(e)[:400])
        for lang, dev in (('fr', 'iPhone 12'), ('en', 'iPhone SE'), ('en', 'ordinateur')):
            try: work_and_export(b, base, site, lang, dev, p)
            except Exception as e: check(dev + ' ' + lang + ' : montage et export, déroulé complet', False, str(e)[:400])
        b.close()
    srv.shutdown(); shutil.rmtree(tmp, ignore_errors=True)
    print('%d/%d réussis' % (sum(results), len(results)))
    sys.exit(0 if all(results) else 1)


main()
