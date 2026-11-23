"""Test of the Pro window after a video is saved (owner, 23/11: redone). Python Playwright (chromium).

    python3 /abs/path/tests/ui/fenetre_pro_ui.py <built public/ folder> [folder for screenshots]

When: never before « Enregistrer la vidéo »; not for the first video saved; from the 2nd one; once a day at most; never again
after 3 « Plus tard »; never for a subscriber.
What: the person's own video with and without the logo (two different pictures, the one without the logo the bigger), one
message, the price as on the plans page (the monthly price struck, 4,17 $ at 30 px as before, « 5 mois offerts », the yearly
amount written), « Passer à Pro » and « Plus tard » as two real buttons, a small line for the rest. Everything in the screen
without scrolling (iPhone 12: 664 px, iPhone SE: 568 px, computer). « Plus tard », ×, Escape close it at once.
French and English, no sideways scrolling, no error in the page."""
import functools, http.server, os, shutil, subprocess, sys, tempfile, threading
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.sync_api import sync_playwright

PUBLIC = os.path.abspath(sys.argv[1])
SHOTS = sys.argv[2] if len(sys.argv) > 2 else None
results = []
T = {'fr': {'t': 'Ta vidéo, sans le logo', 'go': 'Passer à Pro', 'later': 'Plus tard', 'amt': '4,17', 'was': '7,99', 'months': '5 mois offerts', 'bill': '49,99', 'year': 'une fois par an', 'also': 'Clip'},
     'en': {'t': 'Your video, without the logo', 'go': 'Go Pro', 'later': 'Maybe later', 'amt': '4.17', 'was': '7.99', 'months': '5 months free', 'bill': '49.99', 'year': 'once a year', 'also': 'Music video'}}


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


def check(name, ok, info=''):
    results.append(bool(ok))
    print(('PASS ' if ok else 'FAIL ') + name + (('  — ' + str(info)) if info and not ok else ''), flush=True)


def ev(pg, code):
    return pg.evaluate('s => __ev(s)', code)


def shown(pg):
    return pg.locator('#proPop').is_visible()


def export(pg):
    pg.evaluate('() => { __ev("exportOne()"); }')
    pg.wait_for_function('() => __ev("S.exporting")', timeout=20000)
    pg.wait_for_function('() => __ev("S.done && !S.exporting && cmpReady === lastBlob")', timeout=300000)


def run(b, base, site, lang, dev, PW):
    tag = dev + ' ' + lang; t = T[lang]
    opts = dict(PW.devices[dev]) if dev != 'ordinateur' else {'viewport': {'width': 1280, 'height': 860}}
    ctx = b.new_context(**opts, locale='en-US' if lang == 'en' else 'fr-FR')
    ctx.route('**/api/**', lambda r: r.fulfill(status=204, body=''))
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.goto(base + ('' if lang == 'en' else 'fr/'), wait_until='load'); pg.wait_for_function('window.__ev && window.MP4Box', timeout=60000)
    pg.evaluate("""() => { navigator.canShare = () => true; navigator.share = async () => { window.__sh = (window.__sh || 0) + 1; };
      const ck = HTMLAnchorElement.prototype.click; HTMLAnchorElement.prototype.click = function(){ if (this.download) return; return ck.call(this); }; }""")
    pg.set_input_files('#songFile', os.path.join(site, 'beat.wav')); pg.wait_for_function('() => __ev("!!S.song")', timeout=60000)
    pg.set_input_files('#takeFiles', [os.path.join(site, 'take1.mp4')])
    pg.wait_for_function('''() => __ev("S.takes.length === 1 && S.takes.every(t => t.status !== 'pending')")''', timeout=180000)
    ev(pg, 'go(4)'); pg.wait_for_function('() => __ev("S.cuts.length > 0")', timeout=60000); pg.wait_for_timeout(1200)
    ev(pg, "acctOpen = (why, o) => { window.__open = [why, o && o.plan || null]; }")
    # the 1st video: nothing before the saving, nothing after (the end screen shows the comparison)
    export(pg); pg.wait_for_timeout(2600)
    check(tag + ' : 1re vidéo : pas de fenêtre avant « Enregistrer la vidéo »', not shown(pg))
    pg.locator('#saveBtn').click(); pg.wait_for_timeout(2800)
    check(tag + ' : 1re vidéo enregistrée : pas de fenêtre (la comparaison est sur l’écran de fin)', not shown(pg) and ev(pg, "+store.get(PP_SAVES)") == 1, ev(pg, "+store.get(PP_SAVES)"))
    # the 2nd video: not before the saving, then about 1 s after it
    export(pg); pg.wait_for_timeout(2600)
    check(tag + ' : 2e vidéo : pas de fenêtre avant « Enregistrer la vidéo »', not shown(pg))
    pg.locator('#saveBtn').click()
    try: pg.wait_for_selector('#proPop:not([hidden])', timeout=6000); came = True
    except Exception: came = False
    check(tag + ' : 2e vidéo enregistrée : la fenêtre s’ouvre', came)
    pg.wait_for_timeout(700)
    if SHOTS: pg.screenshot(path=os.path.join(SHOTS, 'fenetre-%s-%s.png' % (dev.replace(' ', '').lower(), lang)))
    L = pg.evaluate('''async () => { const q = s => document.querySelector(s), r = s => { const b = q(s).getBoundingClientRect(); return { y: b.top, b: b.bottom, w: b.width, h: b.height, x: b.left, r: b.right }; };
      const a = q('#ppA'), bc = q('#ppB'); await a.decode().catch(() => {});
      const ca = document.createElement('canvas'); ca.width = bc.width; ca.height = bc.height; ca.getContext('2d').drawImage(a, 0, 0, ca.width, ca.height);
      const da = ca.getContext('2d').getImageData(0, 0, ca.width, ca.height).data, db = bc.getContext('2d').getImageData(0, 0, bc.width, bc.height).data;
      let diff = 0; for (let i = 0; i < da.length; i += 4) if (Math.abs(da[i] - db[i]) + Math.abs(da[i+1] - db[i+1]) + Math.abs(da[i+2] - db[i+2]) > 60) diff++;
      return { card: r('#proPopCard'), vh: innerHeight, vw: innerWidth, sh: q('#proPopCard').scrollHeight, ch: q('#proPopCard').clientHeight, diff: diff / (da.length / 4), picA: r('.pp-fa .pp-pic'), picB: r('.pp-fb .pp-pic'),
        t: q('#proPopT').textContent.trim(), amt: q('#ppAmt').textContent, amtSize: getComputedStyle(q('#ppAmt')).fontSize, was: q('#ppWas').textContent, wasLine: getComputedStyle(q('#ppWas')).textDecorationLine,
        months: q('#ppMonths').textContent, bill: q('#ppBill').textContent, also: q('#proPop .pp-also').textContent, go: r('#proPopGo'), later: r('#proPopLater'), goT: q('#proPopGo').textContent.trim(), laterT: q('#proPopLater').textContent.trim(),
        laterTag: q('#proPopLater').tagName, list: document.querySelectorAll('#proPop li').length, masc: r('.pp-masc'), anim: getComputedStyle(q('#proPopCard')).animationName, focus: document.activeElement && document.activeElement.id,
        tagPro: q('#proPop .pp-fb figcaption').textContent.includes('PRO'), titleY: r('#proPopT').y, showY: r('.pp-show').y }; }''')
    check(tag + ' : sa vidéo avec et sans le logo : deux images du même instant, seul le logo change ; « sans le logo » plus grande, étiquette PRO',
          0.001 < L['diff'] < 0.08 and L['picB']['w'] > L['picA']['w'] * 1.3 and L['tagPro'], (L['diff'], L['picA'], L['picB']))
    check(tag + ' : un seul message (« %s »), plus de liste à coches, une petite ligne pour le reste' % t['t'], L['t'] == t['t'] and L['list'] == 0 and t['also'] in L['also'], (L['t'], L['list'], L['also']))
    check(tag + ' : le prix : %s barré, %s à 30 px comme avant, « %s », le montant à l’année écrit' % (t['was'], t['amt'], t['months']),
          t['amt'] in L['amt'] and L['amtSize'] == '30px' and t['was'] in L['was'] and 'line-through' in L['wasLine'] and L['months'] == t['months'] and t['bill'] in L['bill'] and t['year'] in L['bill'], L)
    check(tag + ' : « %s » et « %s » : deux vrais boutons de la même largeur, d’au moins 44 px' % (t['go'], t['later']), L['goT'] == t['go'] and L['laterT'] == t['later'] and L['laterTag'] == 'BUTTON'
          and L['later']['h'] >= 44 and abs(L['later']['w'] - L['go']['w']) < 2 and L['focus'] == 'proPopGo', (L['go'], L['later'], L['focus']))
    check(tag + ' : toute la fenêtre dans l’écran, sans défiler (%d px)' % L['vh'], L['card']['y'] >= 0 and L['card']['b'] <= L['vh'] and L['card']['x'] >= 0 and L['card']['r'] <= L['vw'] and L['sh'] <= L['ch'] + 1, (L['card'], L['sh'], L['ch'], L['vh']))
    check(tag + ' : la mascotte contre la vidéo (pas posée au-dessus), entrée animée', L['masc']['y'] > L['picB']['y'] and L['masc']['b'] <= L['card']['b'] and L['anim'] == 'pp-rise', (L['masc'], L['picB'], L['anim']))
    # « Plus tard » closes at once; not again the same day
    pg.locator('#proPopLater').click()
    check(tag + ' : « %s » ferme tout de suite' % t['later'], not shown(pg))
    pg.locator('#saveBtn').click(); pg.wait_for_timeout(2800)
    check(tag + ' : pas deux fois le même jour', not shown(pg))
    # the next day: again; closed with × then Escape: 3 « Plus tard » in all, then never again
    for how in ('x', 'esc'):
        ev(pg, "store.set(PP_KEY, Date.now() - 25 * 3600e3), proOfferUi()")
        try: pg.wait_for_selector('#proPop:not([hidden])', timeout=6000); came = True
        except Exception: came = False
        check(tag + ' : le lendemain, elle revient (%s)' % ('×' if how == 'x' else 'Échap'), came)
        if how == 'x': pg.locator('#proPopX').click()
        else: pg.keyboard.press('Escape')
        pg.wait_for_timeout(100)
        check(tag + ' : … et se ferme tout de suite', not shown(pg))
    ev(pg, "store.set(PP_KEY, Date.now() - 25 * 3600e3), proOfferUi()"); pg.wait_for_timeout(2800)
    check(tag + ' : après 3 « Plus tard », plus jamais', not shown(pg) and ev(pg, "+store.get(PP_LATER)") == 3, ev(pg, "+store.get(PP_LATER)"))
    # « Passer à Pro »: the plans on Pro; a subscriber never sees it
    ev(pg, "store.set(PP_LATER, 0), store.set(PP_KEY, 0), proOfferUi()")
    pg.wait_for_selector('#proPop:not([hidden])', timeout=6000); pg.locator('#proPopGo').click(); pg.wait_for_timeout(200)
    check(tag + ' : « %s » ouvre les formules sur Pro, la fenêtre fermée' % t['go'], pg.evaluate('window.__open') == ['nowm', 'pro'] and not shown(pg), pg.evaluate('window.__open'))
    ev(pg, "store.set(PP_KEY, 0), acctHas = f => true, proOfferUi()"); pg.wait_for_timeout(2800)
    check(tag + ' : jamais pour un abonné', not shown(pg))
    sw = pg.evaluate('document.documentElement.scrollWidth')
    check(tag + ' : pas de défilement de côté', sw <= pg.viewport_size['width'], sw)
    check(tag + ' : aucune erreur dans la page', not errs, errs)
    ctx.close()


def main():
    tmp = tempfile.mkdtemp(prefix='stalak-fpro-')
    site = os.path.join(tmp, 'site'); shutil.copytree(PUBLIC, site)
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from _probe import add_probe; add_probe(site)
    ff = shutil.which('ffmpeg'); beat = "0.8*sin(2*PI*60*t)*exp(-25*mod(t,0.5))+0.15*sin(2*PI*440*t)"
    subprocess.run([ff, '-nostdin', '-v', 'error', '-y', '-f', 'lavfi', '-i', "aevalsrc='%s':s=44100:d=8" % beat, '-ac', '1', os.path.join(site, 'beat.wav')], check=True)
    subprocess.run([ff, '-nostdin', '-v', 'error', '-y', '-f', 'lavfi', '-i', 'testsrc2=s=360x640:r=30:d=8', '-f', 'lavfi', '-i', "aevalsrc='%s':s=44100:d=8" % beat,
                    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-g', '30', '-c:a', 'aac', '-shortest', os.path.join(site, 'take1.mp4')], check=True)
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=site))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = 'http://127.0.0.1:%d/' % srv.server_address[1]
    with sync_playwright() as p:
        b = p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'])
        for lang, dev in (('fr', 'iPhone 12'), ('en', 'iPhone SE'), ('en', 'ordinateur'), ('fr', 'ordinateur')):
            try: run(b, base, site, lang, dev, p)
            except Exception as e: check(dev + ' ' + lang + ' : déroulé complet', False, str(e)[:400])
        b.close()
    srv.shutdown(); shutil.rmtree(tmp, ignore_errors=True)
    print('%d/%d réussis' % (sum(results), len(results)))
    sys.exit(0 if all(results) else 1)


main()
