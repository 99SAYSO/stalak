"""Test of the Clip mode, step 1 (study docs/clip/2026-11-07-etude-mode-clip.md, owner's decision of 7/11). Python Playwright.

    python3 /abs/path/tests/ui/clip1_ui.py <built public/ folder> [folder for screenshots]

n° 2  Free plan: in the Clip's preview the effects (Subtle / Intense) and the lyrics work, with the watermark; only the export
      of a clip asks for Pro (the question, with its answer counted: clip_ask).
n° 5  The sound at 384 kbit/s (320 when the encoder refuses 384), for everyone.
n° 6  Clip ↔ TikTok at the Montage step, without going back to step 1.
n° 3  The real example (« neva die », 3 takes), in TikTok (8 bars) and in Clip; the claude.ai page keeps the drawn one.
n° 4  The framing of upright takes in a 16:9 clip: whole + blur / fill on the face / zoom (PRO tag in Free, seen in the preview).
Measure: export_start / export_ok carry the kind (clip / reel). Memory: a video too long for the device is not started (said).
On an iPhone (390 px) and a computer (1280 px), in French and English."""
import functools, hashlib, http.server, json, os, shutil, sys, tempfile, threading
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.sync_api import sync_playwright

PUBLIC = os.path.abspath(sys.argv[1])
SHOTS = sys.argv[2] if len(sys.argv) > 2 else None
results = []
FAST_EXPORT = ("pickVideoConfig = async () => null, renderRealtime = async () => { await new Promise(r => setTimeout(r, 120)); "
               "return { blob: new Blob([new Uint8Array(4096)], { type: 'video/mp4' }), ext: 'mp4' }; }")
T = {
    'fr': {'kind4': 'Vidéo', 'frame': 'Cadrage', 'fit': 'Entière + flou', 'face': 'Remplir', 'zoom': 'Zoom', 'ca': 'Le mode Clip est réservé à Pro',
           'mem': 'trop longue pour la mémoire de cet appareil', 'take': 'Prise d’exemple 1'},
    'en': {'kind4': 'Video', 'frame': 'Framing', 'fit': 'Whole + blur', 'face': 'Fill', 'zoom': 'Zoom', 'ca': 'Clip mode is a Pro feature',
           'mem': 'too long for this device’s memory', 'take': 'Example take 1'},
}


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


def check(name, ok, info=''):
    results.append(bool(ok))
    print(('PASS ' if ok else 'FAIL ') + name + (('  — ' + str(info)) if info and not ok else ''), flush=True)


def ev(pg, code):
    return pg.evaluate('s => __ev(s)', code)


def visible(pg, sel):
    return pg.evaluate("s => { const e = document.querySelector(s); return !!e && !!e.getClientRects().length && getComputedStyle(e).visibility !== 'hidden'; }", sel)


def shot(pg, name, sel=None):
    if not SHOTS: return
    try:
        (pg.locator(sel) if sel else pg).screenshot(path=os.path.join(SHOTS, name), timeout=90000)
    except Exception as e: print('(capture manquée : %s)' % str(e)[:80])


def canvas_hash(pg):
    return pg.evaluate("() => { const c = document.querySelector('#view'); const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let h = 0; for (let i = 0; i < d.length; i += 97) h = (h * 31 + d[i]) >>> 0; return h; }")


def run(b, base, lang, iphone, PW):
    tag = ('iPhone' if iphone else 'ordinateur') + ' ' + lang
    t = T[lang]; dev = 'iphone' if iphone else 'ordi'
    opts = dict(PW.devices['iPhone 12']) if iphone else {'viewport': {'width': 1280, 'height': 900}}
    ctx = b.new_context(**opts, locale='en-US' if lang == 'en' else 'fr-FR')
    events = []
    def on_event(route):
        try: events.append(json.loads(route.request.post_data or '{}'))
        except Exception: pass
        route.fulfill(status=200, content_type='application/json', body='{"ok":true}')
    ctx.route('**/api/event', on_event)
    ctx.route('**/api/**', lambda r: r.fallback() if r.request.url.endswith('/api/event') else r.fulfill(status=204, body=''))
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.goto(base + ('' if lang == 'en' else 'fr/'), wait_until='load', timeout=120000); pg.wait_for_function('window.__ev && window.MP4Box', timeout=60000)

    # n° 3: the real example, in TikTok
    pg.locator('#demoBtn').click(); pg.wait_for_function('() => __ev("S.step === 4 && S.cuts.length > 0")', timeout=240000); pg.wait_for_timeout(600)
    info = ev(pg, "[S.song.name, S.song.bpm, S.song.real, S.takes.map(t => [t.name, t.offset, t.status, !!t.demoReal, t.kind]), demoOnly(), S.nBars, S.kind]")
    check(tag + ' : vrai exemple en TikTok : « neva die », 157 BPM, 3 prises calées à 0, 8 mesures', info[0] == 'neva die · 99Sayso' and info[1] == 157 and info[2]
          and len(info[3]) == 3 and all(x[1] == 0 and x[3] and x[4] == 'video' for x in info[3]) and info[3][0][0] == t['take'] and info[4] and info[5] == 8 and info[6] == 'reel', info)
    beats = ev(pg, "S.song.beats.slice(0, 3).concat([S.song.down])")
    check(tag + ' : tempo imposé (un temps toutes les 0,382 s depuis 0)', abs(beats[0]) < 1e-3 and abs(beats[1] - 0.38217) < 1e-3 and abs(beats[2] - 0.76434) < 1e-3 and beats[3] == 0, beats)
    shot(pg, 'exemple-tiktok-%s-%s.png' % (dev, lang))

    # n° 6: Clip at the Montage step
    check(tag + ' : « %s » : TikTok / Clip à l’étape Montage' % t['kind4'], visible(pg, '#kindSeg4') and ev(pg, "$('#kindSeg4').closest('.card').querySelector('[data-i18n=\"p4.kind\"]').textContent.trim()") == t['kind4'])
    pg.locator('#kindSeg4 button[data-v="clip"]').click(); pg.wait_for_timeout(1500)
    st = ev(pg, "[S.step, S.kind, S.fmt, $('#kindSeg button[data-v=\"clip\"]').getAttribute('aria-pressed'), $('#kindSeg4 button[data-v=\"clip\"]').getAttribute('aria-pressed'), S.cuts.length > 0]")
    check(tag + ' : passé en Clip sans quitter l’étape 4 (16:9, les deux sélecteurs à jour)', st == [4, 'clip', '169', 'true', 'true', True], st)
    co = [e.get('cat') for e in events if e.get('name') == 'clip_open']
    check(tag + ' : « a ouvert le mode Clip » compté (Gratuit), une fois', co == ['free'], co)

    # n° 2: the effects and the lyrics in Free, with the watermark
    ev(pg, "S.lyrics.lines = [{ text: 'Ligne de test', t: 0.5 }, { text: 'Deuxième ligne', t: 4 }], S.lyrics.mode = 'paste', rebuild(false)")
    pg.wait_for_function('() => __ev("!!(S.song.music || S.song.musicDone || fxItems().length >= 0)")', timeout=60000)
    pg.wait_for_function('() => __ev("fxItems().filter(i => i.ok).length > 0")', timeout=180000)
    fx = ev(pg, "[fxOn(), fxItems().filter(i => i.ok).length, wmShow(), S.lyrics.mode, lyricsOn(1), can('fx'), can('clip')]")
    check(tag + ' : Gratuit en Clip : effets posés dans l’aperçu, paroles affichées, filigrane', fx[0] and fx[1] > 0 and fx[2] and fx[3] == 'paste' and fx[4] and not fx[5] and not fx[6], fx)
    ev(pg, "S.__lock = [], lockOpen = (f, w) => S.__lock.push(f)")
    pg.locator('#fxSeg button[data-v="intense"]').click(); pg.wait_for_timeout(800)
    check(tag + ' : « Intense » se choisit sans Pro (pas de page de paiement)', ev(pg, "S.fxLevel") == 'intense' and ev(pg, "S.__lock.length") == 0 and ev(pg, "fxItems().filter(i => i.ok).length") > 0)
    pg.locator('#fxSeg button[data-v="sobre"]').click(); pg.wait_for_timeout(500)

    # n° 4: the framing
    pg.wait_for_function('() => __ev("!$(\'#frameSeg\').hidden")', timeout=60000)
    labels = ev(pg, "[...document.querySelectorAll('#frameSeg button')].map(b => b.textContent.trim())")
    check(tag + ' : « %s » : %s / %s / %s, « %s » au départ pour l’exemple' % (t['frame'], t['fit'], t['face'], t['zoom'], t['zoom']), labels == [t['fit'], t['face'], t['zoom']] and ev(pg, 'S.frame') == 'zoom', (labels, ev(pg, 'S.frame')))
    check(tag + ' : PRO sur « Remplir » et « Zoom » en Gratuit', ev(pg, "[...document.querySelectorAll('#frameSeg button')].map(b => b.classList.contains('protag'))") == [False, True, True])
    pg.wait_for_function('() => __ev("S.takes.every(t => t.qual && t.qual.fy)")', timeout=400000)
    fys = ev(pg, "S.takes.map(t => t.qual.fyMed)")
    check(tag + ' : hauteur du visage trouvée dans chaque prise (entre le haut et le milieu)', all(0.15 < y < 0.5 for y in fys), fys)
    hs = {}
    for v in ('fit', 'face', 'zoom'):
        pg.locator('#frameSeg button[data-v="%s"]' % v).click(); pg.wait_for_timeout(900)
        hs[v] = canvas_hash(pg)
        shot(pg, 'cadrage-%s-%s-%s.png' % (v, dev, lang), '#view')
    check(tag + ' : les 3 cadrages changent bien l’image de l’aperçu', len(set(hs.values())) == 3 and ev(pg, "S.frame") == 'zoom' and ev(pg, "store.get('stalak:frame')") == 'zoom', hs)
    pg.locator('#frameSeg button[data-v="face"]').click(); pg.wait_for_timeout(300)
    shot(pg, 'montage-clip-%s-%s.png' % (dev, lang))
    pg.locator('#fmtSeg button[data-v="916"]').click(); pg.wait_for_timeout(400)
    check(tag + ' : en 9:16 le cadrage disparaît (seulement pour un clip 16:9)', not visible(pg, '#frameSeg'))
    pg.locator('#fmtSeg button[data-v="169"]').click(); pg.wait_for_timeout(400)

    # n° 2 + measure: the export of a clip asks for Pro; the answer is counted
    del events[:]
    ev(pg, "store.set(PP_KEY, 1), " + FAST_EXPORT)
    pg.evaluate('() => { __ev("exportOne()"); }'); pg.wait_for_timeout(500)
    check(tag + ' : l’export du Clip demande Pro : « %s »' % t['ca'], visible(pg, '#clipAsk .card') and pg.locator('#clipAskT').inner_text().strip() == t['ca'])
    pg.locator('#caReel').click()
    pg.wait_for_function('() => __ev("S.done === true && !S.exporting")', timeout=60000); pg.wait_for_timeout(300)
    ca = [e.get('cat') for e in events if e.get('name') == 'clip_ask']; ks = [(e.get('name'), e.get('cat')) for e in events if e.get('name') in ('export_start', 'export_ok')]
    check(tag + ' : choix compté (« TikTok / Reels »), puis export TikTok compté avec sa sorte', ca == ['reel'] and ks == [('export_start', 'reel'), ('export_ok', 'reel')], (ca, ks))
    pg.locator('#dvEdit').click(); pg.wait_for_timeout(400)
    ev(pg, "acctHas = f => true, planTags(), setKind('clip', true)"); pg.wait_for_timeout(800)
    del events[:]
    pg.evaluate('() => { __ev("exportOne()"); }'); pg.wait_for_function('() => __ev("S.done === true && !S.exporting")', timeout=60000)
    ks = [(e.get('name'), e.get('cat')) for e in events if e.get('name') in ('export_start', 'export_ok', 'clip_ask')]
    check(tag + ' : Pro : un clip s’exporte sans question, compté « clip »', ks == [('export_start', 'clip'), ('export_ok', 'clip')], ks)
    pg.locator('#dvEdit').click(); pg.wait_for_timeout(400)

    # memory: too long for the device → not started, said
    del events[:]
    ev(pg, "S.memMB = 1, pickVideoConfig = async () => ({ codec: 'avc1.640028', width: W, height: H, bitrate: 10e6, framerate: 30 })")
    pg.evaluate('() => { __ev("exportOne()"); }'); pg.wait_for_timeout(800)
    msg = pg.evaluate("() => [...document.querySelectorAll('.nearmsg')].map(m => m.textContent).join(' | ')")
    check(tag + ' : vidéo trop longue pour la mémoire : pas lancée, dit clairement', t['mem'] in msg and not ev(pg, 'S.exporting')
          and [e.get('name') for e in events] == ['export_refused'] and events[0].get('cat') == 'memory', (msg, [(e.get('name'), e.get('cat')) for e in events]))
    shot(pg, 'memoire-%s-%s.png' % (dev, lang))
    ev(pg, "S.memMB = 0")

    # n° 5: the sound at 384 kbit/s, else 320
    br = pg.evaluate("""async () => { const AE = window.AudioEncoder; const was = AE && AE.isConfigSupported; if (!AE) return 'no encoder';
      AE.isConfigSupported = async c => ({ supported: true, config: c }); const a = await __ev('pickAudioConfig(48000)');
      AE.isConfigSupported = async c => ({ supported: c.bitrate <= 320000, config: c }); const b = await __ev('pickAudioConfig(48000)');
      AE.isConfigSupported = was; return [a.bitrate, b.bitrate, a.codec]; }""")
    check(tag + ' : son AAC 384 kbit/s (320 si l’encodeur refuse 384)', br == [384000, 320000, 'mp4a.40.2'], br)

    # n° 6, back: TikTok at the Montage step
    pg.locator('#kindSeg4 button[data-v="reel"]').click(); pg.wait_for_timeout(1200)
    pg.locator('#kindSeg4 button[data-v="clip"]').click(); pg.wait_for_timeout(600); pg.locator('#kindSeg4 button[data-v="reel"]').click(); pg.wait_for_timeout(1200)
    check(tag + ' : une seule fois par visite (rouvert : rien de plus)', [e for e in events if e.get('name') == 'clip_open'] == [])
    check(tag + ' : retour en TikTok depuis l’étape 4 (9:16, 8 mesures)', ev(pg, "[S.step, S.kind, S.fmt, S.nBars]") == [4, 'reel', '916', 8], ev(pg, "[S.step, S.kind, S.fmt, S.nBars]"))
    check(tag + ' : aucune erreur dans la page', not errs, errs)
    ctx.close()


def claude_page(b, site, PW):
    # the claude.ai page: no /demo/ folder, no account: the drawn example as before
    html = open(os.path.join(site, 'shuffle-lab.html'), encoding='utf-8').read()
    html = html.replace('applyLang();\n})();', 'applyLang();\nwindow.__ev = (s) => eval(s);\n})();')
    open(os.path.join(site, 'shuffle-lab.html'), 'w', encoding='utf-8').write(html)
    ctx = b.new_context(viewport={'width': 1280, 'height': 900}); pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.goto('file://' + os.path.join(site, 'shuffle-lab.html')); pg.wait_for_function('!!window.__ev', timeout=60000)
    pg.locator('#demoBtn').click(); pg.wait_for_function('() => __ev("S.step === 4 && S.cuts.length > 0")', timeout=120000)
    check('page claude.ai : l’exemple dessiné, comme avant', ev(pg, "S.takes.every(t => t.kind === 'demo') && !S.song.real") and not errs, errs)
    ctx.close()


def main():
    tmp = tempfile.mkdtemp(prefix='stalak-clip1-')
    site = os.path.join(tmp, 'site'); shutil.copytree(PUBLIC, site)
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from _probe import add_probe; add_probe(site)
    root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    shutil.copy(os.path.join(root, 'shuffle-lab.html'), os.path.join(site, 'shuffle-lab.html'))
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=site))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = 'http://127.0.0.1:%d/' % srv.server_address[1]
    with sync_playwright() as p:
        b = p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'])
        try: claude_page(b, site, p)
        except Exception as e: check('page claude.ai : déroulé complet', False, str(e)[:300])
        for lang in ('fr', 'en'):
            for iphone in (True, False):
                try: run(b, base, lang, iphone, p)
                except Exception as e: check(('iPhone' if iphone else 'ordinateur') + ' ' + lang + ' : déroulé complet', False, str(e)[:400])
        b.close()
    srv.shutdown(); shutil.rmtree(tmp, ignore_errors=True)
    print('%d/%d réussis' % (sum(results), len(results)))
    sys.exit(0 if all(results) else 1)


main()
