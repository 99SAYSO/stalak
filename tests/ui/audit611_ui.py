"""Test of the audit of 06/11 (docs/audit/2026-11-06-audit-complet.md), points 4, 5, 6, 7, 10, 18 and 22. Python Playwright.

    python3 /abs/path/tests/ui/audit611_ui.py <built public/ folder> [folder for screenshots]

4.  Paid while the video on the end screen has the watermark: « Enregistrer sans filigrane » appears (first, big), makes the
    same video again without it, then goes away.
5.  The « Passer à Pro » window never opens for the example; on a phone only after the tap on « Enregistrer la vidéo »; on a
    computer as before (1 s after the first video).
6.  One real H1 (« Free lip-sync video editor for rappers » / « Montage vidéo lip-sync gratuit pour rappeurs ») and a line
    under it, above the song form; the logo is no longer a title.
7.  The example's end screen: « Now try it with your song » (no Pro link); it starts again on the song form, highlighted.
10. The page: no JS inside it (its own versioned files, deferred), fonts in WOFF2.
18. « Clip » (free): the 16:9 preview, no payment page; at the export a question: Pro / TikTok-Reels / nothing (also a pack).
22. After « Essayer avec un exemple » the keyboard is on « Lecture »; the footer's links are 44 px high.
On an iPhone (390 px) and a computer (1280 px), in French and English."""
import functools, glob, http.server, os, re, shutil, subprocess, sys, tempfile, threading
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.sync_api import sync_playwright

PUBLIC = os.path.abspath(sys.argv[1])
SHOTS = sys.argv[2] if len(sys.argv) > 2 else None
results = []
FAST_EXPORT = ("pickVideoConfig = async () => null, renderRealtime = async () => { await new Promise(r => setTimeout(r, 120)); "
               "return { blob: new Blob([new Uint8Array(4096)], { type: 'video/mp4' }), ext: 'mp4' }; }")
T = {
    'fr': {'h1': 'Le montage de playback gratuit pour les rappeurs', 'try': 'Essaie avec ton son', 'nowm': 'Enregistrer sans filigrane',
           'savewm': 'Enregistrer celle-ci (avec filigrane)', 'save': 'Enregistrer la vidéo', 'ca': 'Le mode Clip est réservé à Pro'},
    'en': {'h1': 'Free lip-sync video editor for rappers', 'try': 'Now try it with your song', 'nowm': 'Save without watermark',
           'savewm': 'Save this one (with watermark)', 'save': 'Save video', 'ca': 'Clip mode is a Pro feature'},
}


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


def check(name, ok, info=''):
    results.append(bool(ok))
    print(('PASS ' if ok else 'FAIL ') + name + (('  — ' + str(info)) if info and not ok else ''))


def ev(pg, code):
    return pg.evaluate('s => __ev(s)', code)


def visible(pg, sel):
    return pg.evaluate("s => { const e = document.querySelector(s); if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; }", sel)


def new_page(b, base, lang, iphone, PW, ctx=None):
    if ctx is None:
        opts = dict(PW.devices['iPhone 12']) if iphone else {'viewport': {'width': 1280, 'height': 860}}
        ctx = b.new_context(**opts, locale='en-US' if lang == 'en' else 'fr-FR')
        ctx.route('**/api/**', lambda r: r.fulfill(status=204, body=''))
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.goto(base + ('' if lang == 'en' else 'fr/'), wait_until='load', timeout=120000); pg.wait_for_function('window.__ev && window.MP4Box', timeout=60000)
    return ctx, pg, errs


def shot(pg, path):
    try: pg.screenshot(path=path, timeout=180000)
    except Exception as e: print('(capture manquée : %s)' % str(e)[:80])


def demo(pg):
    pg.locator('#demoBtn').click(); pg.wait_for_function('() => __ev("S.step === 4 && S.cuts.length > 0")', timeout=180000); pg.wait_for_timeout(300)


def flow(b, base, site, lang, iphone, PW):
    tag = ('iPhone' if iphone else 'ordinateur') + ' ' + lang
    t = T[lang]
    ctx, pg, errs = new_page(b, base, lang, iphone, PW)
    # 6. the real title
    h1 = pg.evaluate("() => [...document.querySelectorAll('h1')].filter(e => e.getClientRects().length).map(e => e.textContent.trim())")
    check(tag + ' : un seul H1, « %s », au-dessus du formulaire' % t['h1'], h1 == [t['h1']] and pg.locator('#heroPitch').bounding_box()['y'] < pg.locator('#songDrop').bounding_box()['y']
          and not pg.evaluate("() => !!document.querySelector('#homeBtn').closest('h1')"), h1)
    tag_ok = pg.locator('.hero-s').inner_text().strip()
    check(tag + ' : une ligne d’accroche sous le titre', len(tag_ok) > 30, tag_ok)
    hb, mb = pg.evaluate("() => { const r = document.createRange(); r.selectNodeContents(document.querySelector('.hero-s')); const b = r.getBoundingClientRect(); return { x: b.x, y: b.y, width: b.width, height: b.height }; }"), pg.evaluate("() => { const c = document.querySelector('#p1 > .card:not(.lpoffer)'); const r = c.getBoundingClientRect(), a = getComputedStyle(c, '::after'); return { right: r.right - parseFloat(a.right), w: parseFloat(a.width) }; }")
    check(tag + ' : l’accroche ne passe pas sous la mascotte', hb['x'] + hb['width'] <= mb['right'] - mb['w'] + 4 or hb['y'] + hb['height'] < pg.locator('#p1 > .card:not(.lpoffer)').bounding_box()['y'] - 142, (hb, mb))
    if SHOTS: shot(pg, os.path.join(SHOTS, 'accueil-%s-%s.png' % ('iphone' if iphone else 'ordi', lang)))
    # (6/11, Chef de projet: the home title is Marketing's « version compacte », chosen by the owner: #heroPitch, .hero-s)
    # 22. the example: the keyboard on « Lecture »
    demo(pg)
    check(tag + ' : après « Essayer avec un exemple », le clavier est sur « Lecture »', pg.evaluate("document.activeElement && document.activeElement.id") == 'playBtn', pg.evaluate("document.activeElement && (document.activeElement.id || document.activeElement.tagName)"))
    # 5 + 7. the example's export: « Essaie avec ton son », no Pro link, no Pro window (never seen on this device)
    ev(pg, "store.set(PP_KEY, 0), " + FAST_EXPORT)
    pg.evaluate('() => { __ev("exportOne()"); }'); pg.wait_for_function('() => __ev("S.done === true")', timeout=120000); pg.wait_for_timeout(400)
    check(tag + ' : fin de l’exemple : « %s », pas de lien Pro' % t['try'], visible(pg, '#dvTry') and pg.locator('#dvTry').inner_text().strip() == t['try'] and not visible(pg, '#dvPro') and visible(pg, '#saveBtn'))
    if SHOTS: shot(pg, os.path.join(SHOTS, 'fin-exemple-%s-%s.png' % ('iphone' if iphone else 'ordi', lang)))
    pg.locator('#saveBtn').click(); pg.wait_for_timeout(2600)
    check(tag + ' : la fenêtre Pro ne s’ouvre pas pour l’exemple (même après « Enregistrer »)', not visible(pg, '#proPop .card'))
    pg.locator('#dvTry').click(); pg.wait_for_load_state('load'); pg.wait_for_function('window.__ev && window.MP4Box', timeout=60000); pg.wait_for_timeout(300)
    check(tag + ' : « %s » : retour au choix du son, mis en avant, le clavier dessus' % t['try'],
          ev(pg, 'S.step') == 1 and not ev(pg, 'S.song') and pg.evaluate("document.querySelector('#songDrop').classList.contains('try')") and pg.evaluate("document.activeElement && document.activeElement.id") == 'songFile')
    # 5. one's own video: on a phone the window waits for « Enregistrer »
    pg.set_input_files('#songFile', os.path.join(site, 'beat.wav')); pg.wait_for_function('() => __ev("!!S.song")', timeout=120000)
    pg.set_input_files('#takeFiles', [os.path.join(site, 'take.mp4')]); pg.wait_for_function('() => __ev("S.takes.length === 1 && S.takes[0].status === \'ready\' && S.cuts.length > 0")', timeout=180000)
    ev(pg, "go(4), store.set(PP_KEY, 0), " + FAST_EXPORT)
    pg.evaluate('() => { __ev("exportOne()"); }'); pg.wait_for_function('() => __ev("S.done === true")', timeout=120000); pg.wait_for_timeout(2600)
    if iphone:
        check(tag + ' : 1re vidéo : la fenêtre Pro n’est pas encore là, « Enregistrer » se voit', not visible(pg, '#proPop .card') and visible(pg, '#dvPro'))
        pg.locator('#saveBtn').click(); pg.wait_for_timeout(2800)
        check(tag + ' : après le toucher sur « Enregistrer », la fenêtre Pro', visible(pg, '#proPop .card'))
    else:
        check(tag + ' : 1re vidéo : la fenêtre Pro comme avant', visible(pg, '#proPop .card'))
    if visible(pg, '#proPop .card'): pg.locator('#proPopLater').click(); pg.wait_for_timeout(500)
    # 4. paid now: « Enregistrer sans filigrane »
    check(tag + ' : avant le paiement, pas de « %s »' % t['nowm'], not visible(pg, '#dvNoWm') and ev(pg, 'S.lastWm') is True)
    ev(pg, "acctHas = f => true, planTags && planTags(), doneUi()"); pg.wait_for_timeout(200)
    check(tag + ' : payé : « %s » en premier, gros ; « %s » à côté' % (t['nowm'], t['savewm']), visible(pg, '#dvNoWm') and pg.locator('#dvNoWm').inner_text().strip() == t['nowm']
          and pg.locator('#saveBtn').inner_text().strip() == t['savewm'] and not visible(pg, '#dvPro')
          and pg.locator('#dvNoWm').bounding_box()['y'] < pg.locator('#saveBtn').bounding_box()['y'] and pg.locator('#dvNoWm').bounding_box()['height'] >= 56)
    if SHOTS: shot(pg, os.path.join(SHOTS, 'sans-filigrane-%s-%s.png' % ('iphone' if iphone else 'ordi', lang)))
    n0 = ev(pg, 'S.okCount')
    pg.locator('#dvNoWm').click(); pg.wait_for_function('() => __ev("!S.exporting && S.done && S.lastWm === false")', timeout=120000); pg.wait_for_timeout(300)
    check(tag + ' : la même vidéo refaite sans filigrane, le bouton s’en va', ev(pg, 'S.okCount') == n0 + 1 and not visible(pg, '#dvNoWm') and pg.locator('#saveBtn').inner_text().strip() == t['save'])
    check(tag + ' : aucune erreur dans la page', not errs, errs)
    ctx.close()


def clip(b, base, site, lang, iphone, PW):
    tag = ('iPhone' if iphone else 'ordinateur') + ' ' + lang + ' Clip'
    t = T[lang]
    ctx, pg, errs = new_page(b, base, lang, iphone, PW)
    demo(pg); ev(pg, "S.__lock = [], lockOpen = (f, w) => S.__lock.push(f), go(1)")
    pg.locator('#kindSeg button[data-v="clip"]').click(); pg.wait_for_timeout(400)
    check(tag + ' : « Clip » sans Pro : l’aperçu 16:9, pas la page de paiement', ev(pg, 'isClip()') and ev(pg, 'S.fmt') == '169' and ev(pg, 'S.__lock.length') == 0, (ev(pg, 'S.fmt'), ev(pg, 'S.__lock')))
    ev(pg, "go(4), " + FAST_EXPORT)
    pg.evaluate('() => { __ev("exportOne()"); }'); pg.wait_for_timeout(300)
    check(tag + ' : à l’export : « %s »' % t['ca'], visible(pg, '#clipAsk .card') and pg.locator('#clipAskT').inner_text().strip() == t['ca'] and not ev(pg, 'S.exporting'))
    if SHOTS: shot(pg, os.path.join(SHOTS, 'clip-%s-%s.png' % ('iphone' if iphone else 'ordi', lang)))
    pg.keyboard.press('Escape'); pg.wait_for_timeout(200)
    check(tag + ' : Échap : rien ne change (toujours Clip, pas d’export)', not visible(pg, '#clipAsk .card') and ev(pg, 'isClip()') and not ev(pg, 'S.exporting') and not ev(pg, 'S.done'))
    pg.evaluate('() => { __ev("exportOne()"); }'); pg.wait_for_timeout(300); pg.locator('#caPro').click(); pg.wait_for_timeout(200)
    check(tag + ' : « Passer à Pro » : la page des formules (Clip)', ev(pg, 'S.__lock') == ['clip'] and not ev(pg, 'S.exporting'))
    pg.evaluate('() => { __ev("exportOne()"); }'); pg.wait_for_timeout(300); pg.locator('#caReel').click()
    pg.wait_for_function('() => __ev("S.done === true")', timeout=120000)
    check(tag + ' : « TikTok / Reels » : la vidéo sort en 9:16', not ev(pg, 'isClip()') and ev(pg, 'S.fmt') == '916')
    # a pack (Creator Plus without Pro's Clip: the same question)
    pg.locator('#dvEdit').click(); pg.wait_for_timeout(300)
    ev(pg, "acctHas = f => f !== 'clip' && f !== 'nowm', planTags(), setKind('clip', true), $('#packSel').value = '5'")
    pg.evaluate('() => { __ev("exportPack()"); }'); pg.wait_for_timeout(400)
    check(tag + ' : un pack en Clip sans Pro : la même question', visible(pg, '#clipAsk .card'))
    pg.locator('#caNo').click(); pg.wait_for_timeout(200)
    check(tag + ' : aucune erreur dans la page', not errs, errs)
    ctx.close()


def page_files(b, base, lang, iphone, PW):
    tag = ('iPhone' if iphone else 'ordinateur') + ' ' + lang
    opts = dict(PW.devices['iPhone 12']) if iphone else {'viewport': {'width': 1280, 'height': 860}}
    ctx = b.new_context(**opts); ctx.route('**/api/**', lambda r: r.fulfill(status=204, body=''))
    seen = []
    pg = ctx.new_page(); pg.on('response', lambda r: seen.append((r.url, r.headers.get('content-type', ''))))
    pg.goto(base + ('' if lang == 'en' else 'fr/'), wait_until='load', timeout=120000); pg.wait_for_function('window.__ev && window.MP4Box', timeout=60000)
    pg.evaluate("document.fonts.ready"); pg.wait_for_timeout(300)
    fonts = [u for u, _ in seen if '/fonts/' in u and not u.endswith('.css') and '?' not in u.split('/fonts/')[1]]
    check(tag + ' : polices en WOFF2 seulement', fonts and all(re.search(r'\.[0-9a-f]{8}\.woff2$', u) for u in fonts), fonts)
    scripts = pg.evaluate("() => [...document.scripts].map(s => ({ src: s.getAttribute('src') || '', defer: s.defer, n: s.src ? 0 : s.textContent.length }))")
    ext = [s for s in scripts if s['src']]
    check(tag + ' : les scripts à part, différés (mp4box, mp4-muxer, compte, appli)', len(ext) >= 4 and all(s['defer'] for s in ext)
          and any(re.match(r'/assets/app\.[0-9a-f]{10}\.js$', s['src']) for s in ext) and max(s['n'] for s in scripts if not s['src']) < 20000, scripts)
    # 22. the footer's links
    hs = pg.evaluate("() => [...document.querySelectorAll('.ft-list a')].map(a => Math.round(a.getBoundingClientRect().height))")
    check(tag + ' : liens du pied de page : 44 px', hs and min(hs) >= 44, hs)
    ctx.close()


def main():
    tmp = tempfile.mkdtemp(prefix='stalak-a611-')
    site = os.path.join(tmp, 'site'); shutil.copytree(PUBLIC, site)
    size = os.path.getsize(os.path.join(site, 'index.html'))
    check('index.html : moins de 400 Ko (était 1,17 Mo)', size < 400_000, size)
    from _probe import add_probe; add_probe(site)
    beat = "0.8*sin(2*PI*60*t)*exp(-25*mod(t,0.5))+0.15*sin(2*PI*440*t)"
    ff = shutil.which('ffmpeg')
    subprocess.run([ff, '-nostdin', '-v', 'error', '-y', '-f', 'lavfi', '-i', "aevalsrc='%s':s=44100:d=20" % beat, '-ac', '1', os.path.join(site, 'beat.wav')], check=True)
    subprocess.run([ff, '-nostdin', '-v', 'error', '-y', '-f', 'lavfi', '-i', 'testsrc2=s=360x640:r=30:d=20', '-f', 'lavfi', '-i', "aevalsrc='%s':s=44100:d=20" % beat,
                    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-g', '30', '-c:a', 'aac', '-shortest', os.path.join(site, 'take.mp4')], check=True)
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=site))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = 'http://127.0.0.1:%d/' % srv.server_address[1]
    with sync_playwright() as p:
        b = p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'])
        for lang in ('fr', 'en'):
            for iphone in (True, False):
                for f in (flow, clip, page_files):
                    try: f(b, base, lang, iphone, p) if f is page_files else f(b, base, site, lang, iphone, p)
                    except Exception as e: check(('iPhone' if iphone else 'ordinateur') + ' ' + lang + ' ' + f.__name__ + ' : déroulé complet', False, str(e)[:300])
        b.close()
    srv.shutdown(); shutil.rmtree(tmp, ignore_errors=True)
    print('%d/%d réussis' % (sum(results), len(results)))
    sys.exit(0 if all(results) else 1)


main()
