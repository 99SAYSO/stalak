"""Test of the owner's list of 06/11 (before « plus de pub » goes online). Python Playwright (chromium, a fake camera) + ffmpeg.

    python3 /abs/path/tests/ui/fin_export_ui.py <built public/ folder> [folder for screenshots]

1. Filming a take on the site with no timer: no number at all on the screen (with a timer: 3, 2, 1, then the beats).
2. A take filmed then removed: the button says « Lancer la prise 1 » again (the number follows the takes that are left).
4. « Continuer » after the takes: « Tu veux ajouter les paroles à la vidéo ? » — Non: the edit; Oui: the Lyrics step;
   Échap: nothing changes. Lyrics already there: no question.
6. The end of an export: only « Enregistrer la vidéo » (big), « Partager » (phone), « Copier la légende », « Sans filigrane →
   Pro » (free) and the small « Modifier la vidéo »; the edit and the steps are hidden; « Modifier la vidéo » brings the edit
   back with the video kept. Also with a pack (Creator Plus): « Enregistrer le pack (.zip) », no caption, no share.
On an iPhone (390 px) and a computer (1280 px), in French and English."""
import functools, http.server, os, shutil, subprocess, sys, tempfile, threading
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.sync_api import sync_playwright

PUBLIC = os.path.abspath(sys.argv[1])
SHOTS = sys.argv[2] if len(sys.argv) > 2 else None
results = []
FAST_EXPORT = ("pickVideoConfig = async () => null, renderRealtime = async () => { await new Promise(r => setTimeout(r, 120)); "
               "return { blob: new Blob([new Uint8Array(4096)], { type: 'video/mp4' }), ext: 'mp4' }; }")
T = {
    'fr': {'go1': '● Lancer la prise 1', 'go2': '● Lancer la prise 2', 'lq': 'Tu veux ajouter les paroles à la vidéo ?', 'yes': 'Oui', 'no': 'Non',
           'save': 'Enregistrer la vidéo', 'pack': 'Enregistrer le pack (.zip)', 'share': 'Partager', 'copy': 'Copier la légende', 'pro': 'Sans filigrane → Pro',
           'edit': 'Modifier la vidéo', 'ready': 'Ta vidéo est prête ✓', 'readyp': 'Ton pack est prêt ✓'},
    'en': {'go1': '● Start take 1', 'go2': '● Start take 2', 'lq': 'Add the lyrics to your video?', 'yes': 'Yes', 'no': 'No',
           'save': 'Save video', 'pack': 'Save the pack (.zip)', 'share': 'Share', 'copy': 'Copy caption', 'pro': 'No watermark → Pro',
           'edit': 'Edit the video', 'ready': 'Your video is ready ✓', 'readyp': 'Your pack is ready ✓'},
}


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


def check(name, ok, info=''):
    results.append(bool(ok))
    print(('PASS ' if ok else 'FAIL ') + name + (('  — ' + str(info)) if info and not ok else ''))


def ev(pg, code):
    return pg.evaluate('s => __ev(s)', code)


def new_page(b, base, lang, iphone, PW):
    opts = dict(PW.devices['iPhone 12']) if iphone else {'viewport': {'width': 1280, 'height': 860}}
    ctx = b.new_context(**opts, locale='en-US' if lang == 'en' else 'fr-FR', permissions=['camera', 'microphone'])
    ctx.route('**/api/**', lambda r: r.fulfill(status=204, body=''))
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.goto(base + ('' if lang == 'en' else 'fr/'), wait_until='load'); pg.wait_for_function('window.__ev && window.MP4Box', timeout=20000)
    return ctx, pg, errs


def visible(pg, sel):
    return pg.evaluate("s => { const e = document.querySelector(s); if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; }", sel)


def camera(b, base, site, lang, iphone, PW):
    tag = ('iPhone' if iphone else 'ordinateur') + ' ' + lang + ' caméra'
    t = T[lang]
    ctx, pg, errs = new_page(b, base, lang, iphone, PW)
    pg.set_input_files('#songFile', os.path.join(site, 'beat.wav')); pg.wait_for_function('() => __ev("!!S.song")', timeout=30000)
    ev(pg, "go(2), recTimerSet(0)")
    pg.locator('#recOpen').click(); pg.wait_for_function('() => __ev("!!recStream")', timeout=15000)
    check(tag + ' : à l’ouverture, « %s »' % t['go1'], pg.locator('#recGo').inner_text().strip() == t['go1'], pg.locator('#recGo').inner_text())
    # 1. no timer: watch the screen during the bar before the passage and the start of the take
    pg.locator('#recGo').click()
    seen = pg.evaluate("""() => new Promise(res => { const out = new Set(); const t0 = performance.now();
      const look = () => { for (const s of ['#recCount', '#recCd']){ const e = document.querySelector(s); if (e && !e.hidden && e.textContent.trim()) out.add(s + ':' + e.textContent.trim()); }
        if (performance.now() - t0 < 4500) requestAnimationFrame(look); else res([...out]); }; look(); })""")
    check(tag + ' : sans minuteur, aucun chiffre à l’écran pendant la prise', not seen, seen)
    pg.locator('#recStop').click()
    pg.wait_for_function('() => __ev("S.takes.length === 1 && S.takes[0].status !== \'pending\'")', timeout=60000)
    check(tag + ' : après la prise 1, « %s »' % t['go2'], pg.locator('#recGo').inner_text().strip() == t['go2'], pg.locator('#recGo').inner_text())
    # 2. the take removed: « … prise 1 » again
    pg.locator('#takeList button[aria-label="%s"]' % ev(pg, "_t('tk.remove')")).first.click(); pg.wait_for_timeout(300)
    check(tag + ' : prise supprimée → « %s » (le numéro suit les prises qui restent)' % t['go1'], ev(pg, 'S.takes.length') == 0 and pg.locator('#recGo').inner_text().strip() == t['go1'] and not visible(pg, '#recDone') and not visible(pg, '#recN'),
          (pg.locator('#recGo').inner_text(), ev(pg, 'S.takes.length')))
    # with a timer: 3, 2, 1 (and only then the beats)
    ev(pg, 'recTimerSet(3)'); pg.locator('#recGo').click()
    seen = pg.evaluate("""() => new Promise(res => { const out = []; const t0 = performance.now();
      const look = () => { const e = document.querySelector('#recCd'); const v = e && !e.hidden ? e.textContent.trim() : ''; if (v && out[out.length - 1] !== v) out.push(v);
        if (performance.now() - t0 < 3400) requestAnimationFrame(look); else res(out); }; look(); })""")
    check(tag + ' : avec le minuteur de 3 s : 3, 2, 1', seen == ['3', '2', '1'], seen)
    pg.wait_for_timeout(500); pg.locator('#recStop').click()
    pg.wait_for_function('() => __ev("S.takes.length === 1")', timeout=60000)
    check(tag + ' : aucune erreur dans la page', not errs, errs)
    ctx.close()


def flow(b, base, lang, iphone, PW):
    tag = ('iPhone' if iphone else 'ordinateur') + ' ' + lang
    t = T[lang]
    ctx, pg, errs = new_page(b, base, lang, iphone, PW)
    pg.evaluate("() => { navigator.canShare = () => true; navigator.share = async () => {}; }")
    pg.locator('#demoBtn').click(); pg.wait_for_function('() => __ev("S.step === 4 && S.cuts.length > 0")', timeout=90000)
    # 4. the lyrics question (the example's lyrics taken away: a person who has none yet)
    ev(pg, "S.__ly = S.lyrics.lines, S.lyrics.lines = [], go(2)")
    pg.locator('#next2').click(); pg.wait_for_timeout(250)
    check(tag + ' : « Continuer » → « %s » Oui / Non' % t['lq'], visible(pg, '#lyAsk .card') and pg.locator('#lyAskT').inner_text().strip() == t['lq']
          and pg.locator('#lqYes').inner_text().strip() == t['yes'] and pg.locator('#lqNo').inner_text().strip() == t['no'] and ev(pg, 'S.step') == 2)
    if SHOTS: pg.screenshot(path=os.path.join(SHOTS, 'paroles-%s-%s.png' % ('iphone' if iphone else 'ordi', lang)))
    pg.keyboard.press('Escape'); pg.wait_for_timeout(150)
    check(tag + ' : Échap : la question se ferme, on reste aux prises', not visible(pg, '#lyAsk .card') and ev(pg, 'S.step') == 2)
    pg.locator('#next2').click(); pg.wait_for_timeout(150); pg.locator('#lqNo').click(); pg.wait_for_timeout(250)
    check(tag + ' : Non → directement au montage', ev(pg, 'S.step') == 4 and not visible(pg, '#lyAsk .card'))
    ev(pg, 'go(2)'); pg.locator('#next2').click(); pg.wait_for_timeout(150); pg.locator('#lqYes').click(); pg.wait_for_timeout(250)
    check(tag + ' : Oui → l’onglet Paroles', ev(pg, 'S.step') == 3 and not visible(pg, '#lyAsk .card'))
    ev(pg, "S.lyrics.lines = S.__ly, go(2)"); pg.locator('#next2').click(); pg.wait_for_timeout(250)
    check(tag + ' : des paroles déjà là → pas de question, onglet Paroles', ev(pg, 'S.step') == 3 and not visible(pg, '#lyAsk .card'))
    ev(pg, 'go(4)')
    # 6. the end of an export (free plan)
    ev(pg, "store.set(PP_KEY, 1), " + FAST_EXPORT)
    pg.evaluate('() => { __ev("exportOne()"); }')
    pg.wait_for_function('() => __ev("S.done === true")', timeout=30000); pg.wait_for_timeout(400)
    vis = {k: visible(pg, s) for k, s in (('save', '#saveBtn'), ('share', '#shareBtn'), ('copy', '#capCopy'), ('pro', '#dvPro'), ('edit', '#dvEdit'),
                                         ('steps', '#stepper'), ('work', '#work'), ('stage', '#view'), ('exportBtn', '#exportBtn'), ('fab', '#expFab'), ('links', '#postBox'))}
    want = {'save': True, 'share': iphone, 'copy': True, 'pro': True, 'edit': True, 'steps': False, 'work': False, 'stage': False, 'exportBtn': False, 'fab': False, 'links': False}
    check(tag + ' : fin d’export : seulement l’essentiel (Enregistrer, %sCopier la légende, Sans filigrane → Pro, Modifier), plus de montage ni d’onglets' % ('Partager, ' if iphone else ''), vis == want, vis)
    txt = {k: pg.locator(s).inner_text().strip() for k, s in (('save', '#saveBtn'), ('copy', '#capCopy'), ('pro', '#dvPro'), ('edit', '#dvEdit'), ('ready', '#dvT'))}
    check(tag + ' : textes de la fin d’export', txt == {'save': t['save'], 'copy': t['copy'], 'pro': t['pro'], 'edit': t['edit'], 'ready': t['ready']}, txt)
    if iphone: check(tag + ' : « %s » sous « %s »' % (t['share'], t['save']), pg.locator('#shareBtn').inner_text().strip() == t['share'])
    bx = {k: pg.locator(s).bounding_box() for k, s in (('save', '#saveBtn'), ('share', '#shareBtn'), ('copy', '#capCopy'), ('edit', '#dvEdit'))}
    order = [bx['save']['y'], bx['share']['y'] if iphone else bx['save']['y'] + 1, bx['copy']['y']]
    check(tag + ' : dans l’ordre Enregistrer, %sCopier la légende' % ('Partager, ' if iphone else ''), order == sorted(order) and bx['edit']['y'] > bx['copy']['y'], bx)
    vh = pg.viewport_size['height']
    check(tag + ' : on voit tout de suite où toucher : les boutons dans l’écran, « Enregistrer » le plus grand', bx['copy']['y'] + bx['copy']['height'] <= vh
          and bx['save']['height'] >= max(bx['copy']['height'], (bx['share'] or {'height': 0})['height'] if iphone else 0), (bx, vh))
    big = pg.evaluate("() => parseFloat(getComputedStyle(document.querySelector('#saveBtn')).fontSize) > parseFloat(getComputedStyle(document.querySelector('#dvEdit')).fontSize) + 4")
    check(tag + ' : « Modifier la vidéo » petit et discret', big)
    sw = pg.evaluate('document.documentElement.scrollWidth')
    check(tag + ' : pas de défilement horizontal', sw <= pg.viewport_size['width'], sw)
    if SHOTS: pg.screenshot(path=os.path.join(SHOTS, 'fin-%s-%s.png' % ('iphone' if iphone else 'ordi', lang)))
    pg.locator('#capCopy').click(); pg.wait_for_timeout(200)
    check(tag + ' : « Copier la légende » marche', bool(pg.locator('#capNote').inner_text().strip()))
    pg.locator('#dvEdit').click(); pg.wait_for_timeout(300)
    check(tag + ' : « Modifier la vidéo » : retour au montage, onglets revenus, vidéo gardée', not ev(pg, 'S.done') and visible(pg, '#stepper') and visible(pg, '#view') and ev(pg, 'S.step') == 4
          and ev(pg, '!!lastBlob') and visible(pg, '#saveBtn') and not visible(pg, '#doneView .card'))
    # the pack (Creator Plus)
    ev(pg, "acctHas = f => true, planTags(), $('#packSel').value = '5', renderVideos = async (list, v, a, p, onVideo) => { for (let k = 0; k < list.length; k++) await onVideo(k, new Uint8Array(64).buffer); }, pickVideoConfig = async () => ({ codec: 'avc1.42E028', bitrate: 8e6 }), pickAudioConfig = async () => ({ codec: 'mp4a.40.2' })")
    pg.evaluate('() => { __ev("exportPack()"); }')
    pg.wait_for_function('() => __ev("S.done === true && /zip$/.test(lastName)")', timeout=30000); pg.wait_for_timeout(300)
    check(tag + ' : fin d’un pack : « %s », « %s », ni légende, ni partage, ni Pro' % (t['readyp'], t['pack']),
          pg.locator('#dvT').inner_text().strip() == t['readyp'] and pg.locator('#saveBtn').inner_text().strip() == t['pack'] and not visible(pg, '#capCopy') and not visible(pg, '#shareBtn') and not visible(pg, '#dvPro'))
    check(tag + ' : aucune erreur dans la page', not errs, errs)
    ctx.close()


def main():
    tmp = tempfile.mkdtemp(prefix='stalak-fin-')
    site = os.path.join(tmp, 'site'); shutil.copytree(PUBLIC, site)
    for page in ('index.html', 'fr/index.html'):
        p = os.path.join(site, page); html = open(p, encoding='utf-8').read()
        assert 'applyLang();\n})();' in html, 'repère de la sonde introuvable'
        open(p, 'w', encoding='utf-8').write(html.replace('applyLang();\n})();', 'applyLang();\nwindow.__ev = (s) => eval(s);\n})();'))
    beat = "0.8*sin(2*PI*60*t)*exp(-25*mod(t,0.5))+0.15*sin(2*PI*440*t)"
    subprocess.run([shutil.which('ffmpeg'), '-nostdin', '-v', 'error', '-y', '-f', 'lavfi', '-i', "aevalsrc='%s':s=44100:d=20" % beat, '-ac', '1', os.path.join(site, 'beat.wav')], check=True)
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=site))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = 'http://127.0.0.1:%d/' % srv.server_address[1]
    with sync_playwright() as p:
        b = p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required',
                                    '--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'])
        for lang in ('fr', 'en'):
            for iphone in (True, False):
                for f in (flow, camera):
                    try: f(b, base, site, lang, iphone, p) if f is camera else f(b, base, lang, iphone, p)
                    except Exception as e: check(('iPhone' if iphone else 'ordinateur') + ' ' + lang + ' ' + f.__name__ + ' : déroulé complet', False, str(e)[:300])
        b.close()
    srv.shutdown(); shutil.rmtree(tmp, ignore_errors=True)
    print('%d/%d réussis' % (sum(results), len(results)))
    sys.exit(0 if all(results) else 1)


main()
