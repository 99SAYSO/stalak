"""Test of the failed exports (report of the figures of 7/11, track 4: 8 % of the exports failed). Python Playwright.

    python3 /abs/path/tests/ui/exports_rates_ui.py <built public/ folder> [folder for screenshots]

1. A failed export is made again once by itself (safer settings): the person gets her video; counted export_retry (with its
   details) and export_saved, never export_fail.
2. Failed twice: the message as before, export_fail with the details (step, format, one/pack, WebCodecs, passage, time,
   memory), only short words of the closed lists.
3. Left Stalak during the export: it waits, says it will start again, and goes on by itself once the page is back.
4. The browser closed the tab during an export: the next visit counts it (« crash ») once, says it, and makes the next export
   lighter (then back to normal).
5. The page closed during an export: counted « closed ».
6. Cancelled by the person: not made again (export_fail « cancel »). A pack too big for the device: export_refused, not a failure.
On an iPhone (390 px) and a computer (1280 px), in French and English."""
import functools, http.server, json, os, shutil, sys, tempfile, threading
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.sync_api import sync_playwright

PUBLIC = os.path.abspath(sys.argv[1])
SHOTS = sys.argv[2] if len(sys.argv) > 2 else None
results = []
OPUS = "pickAudioConfig = async sr => ({ codec: 'opus', sampleRate: sr, numberOfChannels: 2, bitrate: 128000 })"
# renderVideos replaced: fails the first n times with this message (after a little work), then makes a small video
FAKE = """(window.__runs = [], window.__go = null, window.__failN = %d, window.__failMsg = %s, window.__wait = %d,
  renderVideos = async (list, vcfg, acfg, onProg, onVideo) => {
    window.__runs.push({ hw: vcfg.hardwareAcceleration || null, br: vcfg.bitrate, noTiles: !!S.noTiles, noGl: !!S.noGl });
    for (let i = 0; i < 5; i++){ onProg((i + 1) / 10); await new Promise(r => setTimeout(r, 40)); }
    if (window.__wait) await new Promise(r => { window.__go = r; });
    if (window.__runs.length <= window.__failN){ if (S.cancel) throw new Error('annulé'); throw new Error(window.__failMsg); }
    onProg(0.95, 'assemblage', 0); await onVideo(0, new Uint8Array(4096).buffer);
  })"""
T = {
    'fr': {'retry': 'Stalak le refait avec des réglages plus sûrs', 'back': 'Il repart tout seul dès que tu reviens', 'fail': 'L’export n’a pas marché',
           'crash': 'Ton dernier export s’est arrêté en route'},
    'en': {'retry': 'Stalak is making it again with safer settings', 'back': 'It starts again by itself as soon as you’re back', 'fail': 'The export didn’t work',
           'crash': 'Your last export stopped halfway'},
}
X_KEYS = {'st': ['start', 'prepare', 'frames', 'assemble', 'file', 'realtime'], 'fmt': ['916', '45', '11', '169'], 'kind': ['one', 'pack'], 'path': ['wc', 'rt', 'none'],
          'dur': ['d15', 'd30', 'd60', 'dlong'], 'took': ['t10', 't30', 't60', 't180', 'tlong'], 'mem': ['m1', 'm2', 'm4', 'm8', 'unk']}


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


def check(name, ok, info=''):
    results.append(bool(ok))
    print(('PASS ' if ok else 'FAIL ') + name + (('  — ' + str(info)) if info and not ok else ''))


def ev(pg, code):
    return pg.evaluate('s => __ev(s)', code)


def text(pg):
    return pg.evaluate("() => document.body.innerText")


def x_ok(x):
    return isinstance(x, dict) and set(x) == set(X_KEYS) and all(x[k] in X_KEYS[k] for k in X_KEYS)


def shot(pg, name):
    if not SHOTS: return
    try: pg.screenshot(path=os.path.join(SHOTS, name), timeout=90000)
    except Exception as e: print('(capture manquée : %s)' % str(e)[:80])


def setup(b, base, lang, iphone, PW):
    opts = dict(PW.devices['iPhone 12']) if iphone else {'viewport': {'width': 1280, 'height': 860}}
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
    return ctx, pg, events, errs


def open_app(pg, base, lang):
    pg.goto(base + ('' if lang == 'en' else 'fr/'), wait_until='load', timeout=120000); pg.wait_for_function('window.__ev && window.MP4Box', timeout=60000)


def demo(pg):
    pg.locator('#demoBtn').click(); pg.wait_for_function('() => __ev("S.step === 4 && S.cuts.length > 0")', timeout=180000); pg.wait_for_timeout(300)
    ev(pg, "store.set(PP_KEY, 1), " + OPUS)


def names(events, n):
    return [e for e in events if e.get('name') == n]


def run(b, base, lang, iphone, PW):
    tag = ('iPhone' if iphone else 'ordinateur') + ' ' + lang
    t = T[lang]; dev = 'iphone' if iphone else 'ordi'
    ctx, pg, events, errs = setup(b, base, lang, iphone, PW)
    open_app(pg, base, lang); demo(pg)

    print('·', tag, '1', flush=True)
    # 1. fails once, made again by itself
    del events[:]
    ev(pg, FAKE % (1, json.dumps('Decoding error: the decoder stopped'), 0))
    pg.evaluate('() => { __ev("exportOne()"); }')
    pg.wait_for_function('() => window.__runs && window.__runs.length === 2', timeout=60000)
    msg = pg.evaluate("() => { const e = document.querySelector('#expRetry'); return e && !e.hidden && e.getClientRects().length ? e.textContent : ''; }")
    check(tag + ' : 1 échec → nouvel essai automatique, dit sur l’écran d’export : « %s »' % t['retry'], t['retry'] in msg, msg)
    pg.wait_for_function('() => __ev("S.done === true && !S.exporting")', timeout=60000); pg.wait_for_timeout(300)
    runs = pg.evaluate('window.__runs'); hw0 = runs[0]['hw']
    check(tag + ' : 2e essai avec des réglages plus sûrs (encodeur au choix du navigateur, une prise à la fois, dessin 2D)', runs[0]['noTiles'] is False and runs[1]['hw'] is None and runs[1]['noTiles'] and runs[1]['noGl'], runs)
    check(tag + ' : réglages remis comme avant ensuite', ev(pg, '!S.noTiles && !S.noGl'))
    r = names(events, 'export_retry')
    check(tag + ' : compté « refait tout seul » (lecture vidéo) avec ses détails, pas « raté »', len(r) == 1 and r[0].get('cat') == 'decoder' and x_ok(r[0].get('x'))
          and r[0]['x']['kind'] == 'one' and r[0]['x']['path'] == 'wc' and r[0]['x']['st'] == 'frames' and not names(events, 'export_fail'), r)
    check(tag + ' : un seul « export commencé », puis réussi et « rattrapé »', len(names(events, 'export_start')) == 1 and len(names(events, 'export_ok')) == 1
          and [e.get('cat') for e in names(events, 'export_saved')] == ['decoder'], [e.get('name') for e in events])
    shot(pg, 'rattrape-%s-%s.png' % (dev, lang))
    pg.locator('#dvEdit').click(); pg.wait_for_timeout(300)

    print('·', tag, '2', flush=True)
    # 2. fails twice: the message, export_fail with the details
    del events[:]
    ev(pg, FAKE % (9, json.dumps('Encoding error'), 0))
    pg.evaluate('() => { __ev("exportOne()"); }')
    pg.wait_for_function('() => window.__runs.length === 2 && !__ev("S.exporting")', timeout=60000); pg.wait_for_timeout(600)
    f = names(events, 'export_fail')
    check(tag + ' : 2 échecs → « %s », compté raté (fabrication) avec les détails' % t['fail'], t['fail'] in text(pg) and len(f) == 1 and f[0].get('cat') == 'encoder' and x_ok(f[0].get('x'))
          and len(names(events, 'export_retry')) == 1 and not names(events, 'export_saved'), ([(e.get('name'), e.get('cat')) for e in events], pg.evaluate("() => [...document.querySelectorAll('.nearmsg')].map(m => m.textContent)")))
    # (the test browser tells its memory even as an iPhone; a real iPhone never does: « unk »)
    pg.wait_for_timeout(1400)
    check(tag + ' : raté juste après une vidéo réussie : pas l’écran de fin de l’ancienne vidéo, le message se voit', not ev(pg, 'S.done') and pg.evaluate("() => { const m = document.querySelector('#expNear .nearmsg'); return !!m && !!m.getClientRects().length; }"))
    check(tag + ' : la mémoire de l’appareil, en tranche', f and f[0]['x']['mem'] in ('m1', 'm2', 'm4', 'm8', 'unk'), f and f[0].get('x'))
    shot(pg, 'rate-%s-%s.png' % (dev, lang))

    print('·', tag, '6a', flush=True)
    # 6a. cancelled: not made again
    del events[:]
    ev(pg, FAKE % (9, json.dumps('x'), 1))
    pg.evaluate('() => { __ev("exportOne()"); }'); pg.wait_for_function('() => !!window.__go', timeout=60000)
    ev(pg, "$('#cancelBtn').click()"); pg.evaluate('() => window.__go()')
    pg.wait_for_function('() => !__ev("S.exporting")', timeout=60000); pg.wait_for_timeout(900)
    check(tag + ' : annulé par la personne : pas de nouvel essai', pg.evaluate('window.__runs.length') == 1 and [e.get('cat') for e in names(events, 'export_fail')] == ['cancel'] and not names(events, 'export_retry'),
          [(e.get('name'), e.get('cat')) for e in events])

    print('·', tag, '3', flush=True)
    # 3. left Stalak: waits, then goes on by itself
    del events[:]
    ev(pg, FAKE % (1, json.dumps('Codec reclaimed due to inactivity'), 1))
    pg.evaluate('() => { window.__done = false; window.__p = Promise.resolve(__ev("exportOne()")).then(() => { window.__done = true; }); }'); pg.wait_for_function('() => !!window.__go', timeout=60000)
    pg.evaluate("""() => { window.__hid = true; Object.defineProperty(document, 'hidden', { configurable: true, get: () => !!window.__hid });
      Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => window.__hid ? 'hidden' : 'visible' });
      document.dispatchEvent(new Event('visibilitychange')); window.__go(); }""")
    pg.wait_for_function('() => !__ev("S.exporting")', timeout=60000); pg.wait_for_timeout(1500)
    # (7/11, seen by the Chef de projet) the export ends properly while the page stays hidden: it never waits for the return
    check(tag + ' : appli quittée : l’export se termine proprement tout de suite (page toujours cachée)', pg.evaluate('window.__done') is True and pg.evaluate('document.hidden') is True)
    r = names(events, 'export_retry')
    check(tag + ' : appli quittée : attend, « %s »' % t['back'], pg.evaluate('window.__runs.length') == 1 and t['back'] in text(pg) and len(r) == 1 and r[0].get('cat') == 'hidden', (pg.evaluate('window.__runs.length'), [(e.get('name'), e.get('cat')) for e in events], pg.evaluate("() => { const out = []; let e = document.querySelector('#expNear'); while (e){ const c = getComputedStyle(e); if (c.display === 'none' || e.hidden) out.push((e.id || e.className || e.tagName) + ':' + c.display); e = e.parentElement; } return [out, __ev('S.step'), __ev('S.done')]; }")))
    pg.evaluate("() => { window.__wait = 0; window.__hid = false; document.dispatchEvent(new Event('visibilitychange')); }")
    pg.wait_for_function('() => window.__runs.length === 2 && __ev("S.done === true && !S.exporting")', timeout=60000); pg.wait_for_timeout(300)
    check(tag + ' : de retour : l’export repart tout seul et la vidéo est là', [e.get('cat') for e in names(events, 'export_saved')] == ['hidden'] and not names(events, 'export_fail') and t['back'] not in text(pg))
    pg.locator('#dvEdit').click(); pg.wait_for_timeout(300)

    print('·', tag, '6b', flush=True)
    # 6b. a pack too big for the device: refused, not a failure
    del events[:]
    ev(pg, "acctHas = f => true, planTags(), S.memMB = 5, $('#packSel').value = '5'")
    pg.evaluate('() => { __ev("exportPack()"); }'); pg.wait_for_timeout(800)
    check(tag + ' : pack trop gros pour l’appareil : « refusé », pas « raté »', [e.get('cat') for e in names(events, 'export_refused')] == ['memory'] and not names(events, 'export_fail'),
          [(e.get('name'), e.get('cat')) for e in events])
    ev(pg, "S.memMB = 0, acctHas = f => false, planTags()")

    print('·', tag, '5', flush=True)
    # 5. the page closed during an export
    del events[:]
    ev(pg, FAKE % (0, json.dumps('x'), 1))
    pg.evaluate('() => { __ev("exportOne()"); }'); pg.wait_for_function('() => !!window.__go', timeout=60000)
    check(tag + ' : export en cours noté sur l’appareil (pour le retrouver si l’onglet est fermé)', pg.evaluate("() => JSON.parse(localStorage.getItem('stalak:expRun') || 'null')") is not None)
    # (a request sent while the page closes is not seen by the test's interception: what the page sends is noted on the device)
    ev(pg, "ACCT.event = (n, x) => { const a = JSON.parse(localStorage.getItem('__evs') || '[]'); a.push(Object.assign({ name: n }, x)); localStorage.setItem('__evs', JSON.stringify(a)); }")
    open_app(pg, base, lang); pg.wait_for_timeout(800)
    c = [e for e in pg.evaluate("() => JSON.parse(localStorage.getItem('__evs') || '[]')") if e.get('name') == 'export_fail']
    check(tag + ' : page fermée pendant l’export : comptée « fermée », une fois, sans « plantage » ensuite', [e.get('cat') for e in c] == ['closed'] and x_ok(c[0].get('x')) and not names(events, 'export_fail'), (c, [(e.get('name'), e.get('cat')) for e in events]))

    print('·', tag, '4', flush=True)
    # 4. the browser closed the tab (no pagehide): found at the next visit
    del events[:]
    pg.evaluate("""() => localStorage.setItem('stalak:expRun', JSON.stringify({ st: 'frames', fmt: '916', kind: 'one', path: 'wc', dur: 'd30', took: 't60', mem: 'unk', left: false }))""")
    open_app(pg, base, lang); pg.wait_for_timeout(1200)
    c = names(events, 'export_fail')
    check(tag + ' : onglet fermé par le navigateur : compté « plantage » à la visite suivante, avec les détails, et dit', [e.get('cat') for e in c] == ['crash'] and x_ok(c[0].get('x')) and t['crash'] in text(pg), (c, text(pg)[-300:]))
    shot(pg, 'plantage-%s-%s.png' % (dev, lang))
    open_app(pg, base, lang); pg.wait_for_timeout(600)
    check(tag + ' : compté une seule fois (rechargé ensuite : rien de plus)', len(names(events, 'export_fail')) == 1 and ev(pg, 'S.lightNext') == 'crash')
    demo(pg); del events[:]
    ev(pg, FAKE % (0, json.dumps('x'), 0))
    pg.evaluate('() => { __ev("exportOne()"); }'); pg.wait_for_function('() => __ev("S.done === true && !S.exporting")', timeout=60000)
    runs = pg.evaluate('window.__runs')
    check(tag + ' : l’export suivant est plus léger (débit réduit, réglages sûrs), puis plus rien de spécial', len(runs) == 1 and runs[0]['noTiles'] and runs[0]['br'] <= 6e6 and runs[0]['hw'] is None
          and not ev(pg, 'S.lightNext') and pg.evaluate("() => localStorage.getItem('stalak:expLight')") is None, runs)
    # (audit 13/11, n° 4) a long video on a phone (> 45 s): the safe drawing from the start (one take at a time, 2D), same encoder
    pg.locator('#dvEdit').click(); pg.wait_for_timeout(300)
    ev(pg, FAKE % (0, json.dumps('x'), 0)); ev(pg, "S.__se = S.segEnd, S.segEnd = S.segStart + 70")
    pg.evaluate('() => { __ev("exportOne()"); }'); pg.wait_for_function('() => __ev("S.done === true && !S.exporting")', timeout=60000)
    runs = pg.evaluate('window.__runs'); ev(pg, "S.segEnd = S.__se")
    if iphone:
        check(tag + ' : vidéo de 70 s sur téléphone : prises une à une et dessin 2D dès le départ, même encodeur', len(runs) == 1 and runs[0]['noTiles'] and runs[0]['noGl'] and runs[0]['hw'] == hw0
              and ev(pg, '!S.noTiles && !S.noGl'), (runs, hw0))
    else:
        check(tag + ' : vidéo de 70 s sur ordinateur : comme d’habitude', len(runs) == 1 and not runs[0]['noTiles'] and not runs[0]['noGl'], runs)
    check(tag + ' : aucune erreur dans la page', not errs, errs)
    ctx.close()


def main():
    tmp = tempfile.mkdtemp(prefix='stalak-xr-')
    site = os.path.join(tmp, 'site'); shutil.copytree(PUBLIC, site)
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from _probe import add_probe; add_probe(site)
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=site))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = 'http://127.0.0.1:%d/' % srv.server_address[1]
    with sync_playwright() as p:
        b = p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'])
        for lang in ('fr', 'en'):
            for iphone in (True, False):
                try: run(b, base, lang, iphone, p)
                except Exception as e: check(('iPhone' if iphone else 'ordinateur') + ' ' + lang + ' : déroulé complet', False, str(e)[:400])
        b.close()
    srv.shutdown(); shutil.rmtree(tmp, ignore_errors=True)
    print('%d/%d réussis' % (sum(results), len(results)))
    sys.exit(0 if all(results) else 1)


main()
