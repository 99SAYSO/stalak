"""Test of the first video without the watermark, offered once per account (owner, 23/11). Python Playwright (chromium).

    python3 /abs/path/tests/ui/video_offerte_ui.py <built public/ folder> [folder for screenshots]

The server's side (Comptes, compte/video-offerte) is played by a stand-in: /api/me gives entitlements.freeNoWm; POST
/api/free-video → {granted: true} once, then {granted: false, reason: 'used'}; nothing given back.
1. Signed out, end screen of a free video: under the Pro offer, « Ta 1re vidéo sans filigrane est offerte : connecte-toi ».
   A tap opens the sign-in page with that sentence on top; signing in (here: the account appears) brings back to the same end
   screen, its video still there, with « Exporter sans filigrane (offert) ».
2. Signed in with it: that button in place of « Exporter sans le logo PRO »; a tap asks first (« C’est ta seule vidéo offerte
   sans filigrane. »), « Pas maintenant » goes back without using it. Confirmed: the server is asked only when the export
   starts.
3. The export fails: the server's « yes » is kept on the device: still offered, and the next try asks nothing again; that one
   is made without the watermark.
4. Used: nothing « offert » on the end screen any more; the Pro window says « Ta 1re vidéo était sans filigrane… ».
5. Nothing else becomes free: Clip, the Pro filters and the karaoke stay locked.
French and English, phone (iPhone 12) and computer (1280 px), no error in the page."""
import functools, http.server, json, os, shutil, subprocess, sys, tempfile, threading
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.sync_api import sync_playwright

PUBLIC = os.path.abspath(sys.argv[1])
SHOTS = sys.argv[2] if len(sys.argv) > 2 else None
results = []
T = {'fr': {'in': 'Ta 1re vidéo sans filigrane est offerte : connecte-toi', 'why': 'Connecte-toi : ta 1re vidéo sans filigrane est offerte.', 'go': 'Exporter sans filigrane (offert)',
            'ask': 'C’est ta seule vidéo offerte sans filigrane.', 'ok': 'Exporter sans filigrane', 'no': 'Pas maintenant', 'tag': 'OFFERT', 'pp': 'Ta 1re vidéo était sans filigrane. Toutes comme ça avec Pro ?'},
     'en': {'in': 'Your 1st video without the watermark is on us: sign in', 'why': 'Sign in: your 1st video without the watermark is on us.', 'go': 'Export without watermark (free)',
            'ask': 'This is your only free video without the watermark.', 'ok': 'Export without watermark', 'no': 'Not now', 'tag': 'FREE', 'pp': 'Your 1st video had no watermark. All of them like that with Pro?'}}
FREE_FEATS = ['unlimited']


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


def check(name, ok, info=''):
    results.append(bool(ok))
    print(('PASS ' if ok else 'FAIL ') + name + (('  — ' + str(info)) if info and not ok else ''), flush=True)


def ev(pg, code):
    return pg.evaluate('s => __ev(s)', code)


def vis(pg, sel):
    return pg.evaluate("s => { const e = document.querySelector(s); if (!e) return false; const r = e.getBoundingClientRect(); return !!(r.width && r.height) && getComputedStyle(e).visibility !== 'hidden'; }", sel)


def txt(pg, sel):
    return ' '.join(pg.locator(sel).inner_text().split())


class Srv:
    """the stand-in for the server: signed in or not, the free video there or used, the calls seen"""
    def __init__(self): self.user = False; self.free = True; self.calls = []; self.claimed = None
    def me(self, route):
        body = {'user': {'id': 'u1', 'email': 'a@b.c', 'displayName': 'Liam', 'providers': []}, 'session': {'method': 'password'},
                'entitlements': {'plan': 'free', 'features': FREE_FEATS, 'limits': {}, 'freeNoWm': self.free}} if self.user else {}
        route.fulfill(status=200, content_type='application/json', body=json.dumps(body))
    def api(self, route):
        u = route.request.url; p = u.split('/api/', 1)[1].split('?')[0]
        if p == 'me': return self.me(route)
        if p == 'free-video':
            self.calls.append('free-video')
            if not self.user: return route.fulfill(status=401, content_type='application/json', body='{"error":"unauthorized"}')
            if not self.free: return route.fulfill(status=200, content_type='application/json', body='{"granted":false,"reason":"used"}')
            self.free = False; return route.fulfill(status=200, content_type='application/json', body='{"granted":true}')
        route.fulfill(status=204, body='')


def export(pg):
    pg.evaluate('() => { __ev("exportOne()"); }')
    pg.wait_for_function('() => __ev("S.exporting")', timeout=20000)
    pg.wait_for_function('() => __ev("S.done && !S.exporting")', timeout=300000)
    pg.wait_for_timeout(2200)   # (the export screen closes 1,6 s after the end, then the end screen is drawn again)


def run(b, base, site, lang, dev, PW):
    tag = dev + ' ' + lang; t = T[lang]; srv = Srv()
    opts = dict(PW.devices[dev]) if dev != 'ordinateur' else {'viewport': {'width': 1280, 'height': 860}}
    ctx = b.new_context(**opts, locale='en-US' if lang == 'en' else 'fr-FR')
    ctx.route('**/api/**', srv.api)
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.goto(base + ('' if lang == 'en' else 'fr/'), wait_until='load'); pg.wait_for_function('window.__ev && window.MP4Box', timeout=60000)
    pg.set_input_files('#songFile', os.path.join(site, 'beat.wav')); pg.wait_for_function('() => __ev("!!S.song")', timeout=60000)
    pg.set_input_files('#takeFiles', [os.path.join(site, 'take1.mp4')])
    pg.wait_for_function('''() => __ev("S.takes.length === 1 && S.takes.every(t => t.status !== 'pending')")''', timeout=180000)
    ev(pg, 'go(4)'); pg.wait_for_function('() => __ev("S.cuts.length > 0")', timeout=60000); pg.wait_for_timeout(1200)
    # 5. nothing else becomes free (signed in, the free video there)
    srv.user = True; ev(pg, 'ACCT.me()'); pg.wait_for_timeout(500)
    locked = ev(pg, "[can('clip'), can('filters'), can('lyrics'), can('fx'), can('nowm')]")
    check(tag + ' : rien d’autre ne devient gratuit : Clip, filtres Pro, karaoké, effets restent Pro', locked == [False] * 5, locked)
    srv.user = False; ev(pg, 'ACCT.me()'); pg.wait_for_timeout(400)
    # 1. signed out
    export(pg)
    check(tag + ' : déconnecté : « %s » sous l’offre Pro' % t['in'], vis(pg, '#dvFreeIn') and txt(pg, '#dvFreeIn') == t['in'] and vis(pg, '#dvCmpGo')
          and pg.locator('#dvFreeIn').bounding_box()['y'] > pg.locator('#dvCmpGo').bounding_box()['y'] and not vis(pg, '#dvFreeGo'), (txt(pg, '#dvFreeIn'),))
    if SHOTS: pg.screenshot(path=os.path.join(SHOTS, 'offerte-deconnecte-%s-%s.png' % (dev.replace(' ', '').lower(), lang)), full_page=True)
    blob0 = ev(pg, 'lastBlob && lastBlob.size')
    pg.locator('#dvFreeLogin').click(); pg.wait_for_timeout(600)
    why = pg.evaluate("() => { const e = document.querySelector('#acctPage'); return e && e.innerText.includes(%s); }" % json.dumps(t['why']))
    check(tag + ' : « connecte-toi » ouvre la connexion, avec la phrase de la vidéo offerte en haut', vis(pg, '#acctPage') and why, why)
    srv.user = True; ev(pg, 'ACCT.me()'); pg.wait_for_timeout(900)
    check(tag + ' : connecté : retour au même écran de fin, la vidéo toujours là, prêt à exporter', not vis(pg, '#acctPage') and ev(pg, 'S.done') and ev(pg, 'lastBlob && lastBlob.size') == blob0
          and vis(pg, '#dvFreeGo') and not vis(pg, '#dvFreeIn'), (vis(pg, '#acctPage'), ev(pg, 'S.done')))
    # 2. signed in with it
    check(tag + ' : « %s » à la place de « Exporter sans le logo PRO », image de droite « %s »' % (t['go'], t['tag']), txt(pg, '#dvFreeGo') == t['go'] and not vis(pg, '#dvCmpGo')
          and txt(pg, '#cmpBTag') == t['tag'] and vis(pg, '#saveBtn') and pg.locator('#saveBtn').bounding_box()['y'] < pg.locator('#dvFreeGo').bounding_box()['y'], (txt(pg, '#dvFreeGo'), txt(pg, '#cmpBTag')))
    pg.locator('#dvFreeGo').click(); pg.wait_for_timeout(200)
    check(tag + ' : avant d’exporter, la phrase « %s », sans rien demander au serveur' % t['ask'], vis(pg, '#dvFreeAsk') and txt(pg, '#dvFreeAskT') == t['ask'] and txt(pg, '#dvFreeOk') == t['ok'] and srv.calls == [], (srv.calls,))
    if SHOTS: pg.locator('#dvFreeAsk').scroll_into_view_if_needed(); pg.screenshot(path=os.path.join(SHOTS, 'offerte-question-%s-%s.png' % (dev.replace(' ', '').lower(), lang)))
    pg.locator('#dvFreeNo').click(); pg.wait_for_timeout(150)
    check(tag + ' : « %s » revient au bouton, rien d’utilisé' % t['no'], vis(pg, '#dvFreeGo') and not vis(pg, '#dvFreeAsk') and srv.calls == [] and srv.free)
    # 3. the export fails: the « yes » kept on the device, still offered, the next try asks nothing
    ev(pg, "window.__realAC = pickAudioConfig, pickAudioConfig = async () => { throw new Error('test : échec voulu'); }")
    check(tag + ' : (le test remplace bien la fonction)', ev(pg, "pickAudioConfig !== window.__realAC"))
    pg.locator('#dvFreeGo').click(); pg.locator('#dvFreeOk').click()
    pg.wait_for_function('() => __ev("S.exporting")', timeout=20000)
    pg.wait_for_function('() => __ev("!S.exporting && !S.freeOn")', timeout=90000); pg.wait_for_timeout(2500)
    check(tag + ' : l’export rate : demandé une fois au serveur, toujours proposé (le « oui » gardé sur l’appareil)', srv.calls == ['free-video'] and vis(pg, '#dvFreeGo') and ev(pg, '!store.get(FREE_USED) && freeGrant()'),
          (srv.calls, vis(pg, '#dvFreeGo')))
    ev(pg, "pickAudioConfig = window.__realAC")
    pg.locator('#dvFreeGo').click(); pg.locator('#dvFreeOk').click()
    pg.wait_for_function('() => __ev("S.exporting")', timeout=20000)
    pg.wait_for_function('() => __ev("S.done && !S.exporting")', timeout=300000); pg.wait_for_timeout(2200)
    check(tag + ' : nouvel essai : rien redemandé au serveur, vidéo faite sans filigrane', srv.calls == ['free-video'] and ev(pg, 'S.lastWm') is False and ev(pg, '!S.freeOn && !freeGrant()'), srv.calls)
    # 4. used: nothing « offert »
    pg.wait_for_timeout(600)
    shown = [s for s in ('#dvFreeIn', '#dvFreeGo', '#dvFreeAsk') if vis(pg, s)]
    check(tag + ' : utilisée : plus rien de « offert » à l’écran', not shown and t['tag'] not in pg.locator('#doneView').inner_text(), shown)
    if SHOTS: pg.screenshot(path=os.path.join(SHOTS, 'offerte-faite-%s-%s.png' % (dev.replace(' ', '').lower(), lang)))
    export(pg)
    shown = [s for s in ('#dvFreeIn', '#dvFreeGo', '#dvFreeAsk') if vis(pg, s)]
    check(tag + ' : vidéo suivante : avec le filigrane, l’offre Pro, rien de « offert »', ev(pg, 'S.lastWm') is True and vis(pg, '#dvCmpGo') and not shown and txt(pg, '#cmpBTag') == 'PRO', (shown, ev(pg, 'S.lastWm'), txt(pg, '#cmpBTag')))
    srv.user = False; ev(pg, 'ACCT.me()'); pg.wait_for_timeout(500)
    check(tag + ' : déconnecté après l’avoir utilisée sur cet appareil : plus de « connecte-toi »', not vis(pg, '#dvFreeIn'))
    srv.user = True; ev(pg, 'ACCT.me()'); pg.wait_for_timeout(500)
    ev(pg, 'ppOpen()'); pg.wait_for_timeout(400)
    check(tag + ' : la fenêtre Pro : « %s »' % t['pp'], txt(pg, '#proPopT') == t['pp'], txt(pg, '#proPopT'))
    if SHOTS: pg.screenshot(path=os.path.join(SHOTS, 'offerte-fenetre-%s-%s.png' % (dev.replace(' ', '').lower(), lang)))
    pg.locator('#proPopLater').click()
    sw = pg.evaluate('document.documentElement.scrollWidth')
    check(tag + ' : pas de défilement de côté', sw <= pg.viewport_size['width'], sw)
    check(tag + ' : aucune erreur dans la page', not errs, errs)
    ctx.close()


def main():
    tmp = tempfile.mkdtemp(prefix='stalak-offerte-')
    site = os.path.join(tmp, 'site'); shutil.copytree(PUBLIC, site)
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from _probe import add_probe; add_probe(site)
    ff = shutil.which('ffmpeg'); beat = "0.8*sin(2*PI*60*t)*exp(-25*mod(t,0.5))+0.15*sin(2*PI*440*t)"
    subprocess.run([ff, '-nostdin', '-v', 'error', '-y', '-f', 'lavfi', '-i', "aevalsrc='%s':s=44100:d=6" % beat, '-ac', '1', os.path.join(site, 'beat.wav')], check=True)
    subprocess.run([ff, '-nostdin', '-v', 'error', '-y', '-f', 'lavfi', '-i', 'testsrc2=s=360x640:r=30:d=6', '-f', 'lavfi', '-i', "aevalsrc='%s':s=44100:d=6" % beat,
                    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-g', '30', '-c:a', 'aac', '-shortest', os.path.join(site, 'take1.mp4')], check=True)
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=site))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = 'http://127.0.0.1:%d/' % srv.server_address[1]
    with sync_playwright() as p:
        b = p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'])
        for lang, dev in [tuple(x.split(':')) for x in os.environ.get('VO_RUNS', 'fr:iPhone 12,en:iPhone 12,fr:ordinateur,en:ordinateur').split(',')]:
            try: run(b, base, site, lang, dev, p)
            except Exception as e: check(dev + ' ' + lang + ' : déroulé complet', False, str(e)[:400])
        b.close()
    srv.shutdown(); shutil.rmtree(tmp, ignore_errors=True)
    print('%d/%d réussis' % (sum(results), len(results)))
    sys.exit(0 if all(results) else 1)


main()
