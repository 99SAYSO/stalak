"""Test of the « Son » step: file dropped on the import square, the two handles of the passage (free: no magnet on the
beat), the red playhead dragged to listen, « Écouter le passage ».
Python Playwright (chromium) + ffmpeg.

    python3 /abs/path/tests/ui/son_passage.py <path of a built public/ folder> [folder for screenshots]

Phone (390 px, touch: the handles are dragged with a finger through real touch events) and computer (1280 px, mouse,
the file is dropped on the import square), in French and in English."""
import functools, http.server, os, shutil, subprocess, sys, tempfile, threading
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.sync_api import sync_playwright

PUBLIC = os.path.abspath(sys.argv[1])
SHOTS = sys.argv[2] if len(sys.argv) > 2 else None
results = []


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


def check(name, ok, info=''):
    results.append(ok)
    print(('PASS ' if ok else 'FAIL ') + name + (('  — ' + str(info)) if info and not ok else ''))


def ev(pg, code):
    return pg.evaluate('s => __ev(s)', code)


def drag(pg, cdp, touch, x0, y, x1, steps=12):
    """a handle dragged from x0 to x1: a finger (real touch events) or the mouse"""
    if touch:
        cdp.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': x0, 'y': y}]})
        for i in range(1, steps + 1):
            cdp.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': x0 + (x1 - x0) * i / steps, 'y': y}]})
        cdp.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
    else:
        pg.mouse.move(x0, y); pg.mouse.down()
        for i in range(1, steps + 1): pg.mouse.move(x0 + (x1 - x0) * i / steps, y)
        pg.mouse.up()
    pg.wait_for_timeout(300)


def seg(pg):
    return ev(pg, '({ a: S.segStart, b: S.segEnd, sb: S.startBar, nb: S.nBars, dur: S.song.duration, bars: [...Array(totalBars() + 1).keys()].map(barTime) })')


def on_bar(t, bars, dur):
    return any(abs(t - x) < 1e-6 for x in bars) or abs(t - dur) < 1e-6


def near(t, want, dur, box_w):
    """t is where the finger was let go (to a few pixels), not pulled to a bar"""
    return abs(t - want) <= 3 * dur / box_w


def run(b, base, wav, lang, phone):
    tag = ('téléphone' if phone else 'ordinateur') + ' ' + lang
    ctx = b.new_context(viewport={'width': 390, 'height': 844} if phone else {'width': 1280, 'height': 800},
                        has_touch=phone, is_mobile=phone, device_scale_factor=2 if phone else 1,
                        locale='en-US' if lang == 'en' else 'fr-FR')
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:160]))
    pg.goto(base + ('en/' if lang == 'en' else ''), wait_until='load')
    pg.wait_for_function('window.__ev && window.MP4Box', timeout=20000)
    if phone:
        pg.set_input_files('#songFile', wav)
    else:
        # the file dragged over the square, then dropped
        pg.evaluate("""async () => {
          const blob = await (await fetch('/beat.wav')).blob();
          window.__dt = new DataTransfer(); __dt.items.add(new File([blob], 'beat.wav', { type: 'audio/wav' }));
          document.querySelector('#songDrop').dispatchEvent(new DragEvent('dragenter', { bubbles: true, cancelable: true, dataTransfer: __dt }));
        }""")
        over = pg.evaluate("""() => { const d = document.querySelector('#songDrop'); return { on: d.classList.contains('over'), txt: getComputedStyle(d, '::after').content }; }""")
        want = 'Drop your file here' if lang == 'en' else 'Lâche ton fichier ici'
        check(tag + ' : effet quand le fichier survole le carré', over['on'] and want in over['txt'], over)
        if SHOTS: pg.locator('#songDrop').screenshot(path=os.path.join(SHOTS, 'survol-' + lang + '.png'))
        pg.evaluate("""() => { const d = document.querySelector('#songDrop');
          d.dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer: __dt }));
          d.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: __dt })); }""")
        check(tag + ' : effet retiré après le dépôt', not pg.evaluate("document.querySelector('#songDrop').classList.contains('over')"))
    pg.wait_for_function('() => !document.querySelector("#songBox").hidden && __ev("!!S.song")', timeout=30000)
    check(tag + ' : son chargé' + (' par glisser-déposer' if not phone else ''), True)
    vis = pg.evaluate("['#gripL', '#gripR', '#segPlay', '#endBox'].map(s => { const e = document.querySelector(s); return !e.hidden && e.getBoundingClientRect().width > 0; })")
    check(tag + ' : deux poignées, bouton « Écouter le passage » et case Fin visibles', all(vis), vis)
    # the waveform in the middle of the screen (at the bottom, the help bubble covers the right of the screen)
    pg.evaluate("document.querySelector('#waveBox').scrollIntoView({ block: 'center' })"); pg.wait_for_timeout(300)
    cdp = ctx.new_cdp_session(pg) if phone else None
    box = pg.locator('#wave').bounding_box(); y = box['y'] + box['height'] / 2
    s0 = seg(pg)
    # the end handle pulled back to about 61 % of the song: it stays exactly where the finger lets go (between two bars)
    xr = box['x'] + s0['b'] / s0['dur'] * box['width']
    drag(pg, cdp, phone, xr, y, box['x'] + 0.613 * box['width'])
    s1 = seg(pg)
    check(tag + ' : poignée de fin libre (là où on la lâche, pas collée au rythme)', s1['b'] < s0['b'] - 1 and near(s1['b'], 0.613 * s1['dur'], s1['dur'], box['width']) and not on_bar(s1['b'], s1['bars'], s1['dur']) and abs(s1['a'] - s0['a']) < 1e-6, (s0['a'], s0['b'], s1['a'], s1['b']))
    # the start handle pushed to about 26 %
    xl = box['x'] + s1['a'] / s1['dur'] * box['width']
    drag(pg, cdp, phone, xl, y, box['x'] + 0.257 * box['width'])
    s2 = seg(pg)
    check(tag + ' : poignée de début libre (fin gardée)', s2['a'] > s1['a'] + 1 and abs(s2['b'] - s1['b']) < 1e-6 and near(s2['a'], 0.257 * s2['dur'], s2['dur'], box['width']) and not on_bar(s2['a'], s2['bars'], s2['dur']), (s1['a'], s1['b'], s2['a'], s2['b']))
    # (no takes at this step: an edit on the beat over the bars that cover the passage, as generate() makes, is cut by segClamp)
    ev(pg, "window.__cuts = (() => { const out = [], t0 = barTime(S.startBar), t1 = barTime(segEndBar()), st = (barTime(1) - barTime(0)) / 2; for (let t = t0; t < t1 - 1e-6; t += st) out.push({ t0: t, t1: Math.min(t1, t + st), take: null }); return segClamp(out); })()")
    cu = ev(pg, '[__cuts[0].t0, __cuts[__cuts.length - 1].t1, __cuts.length, __cuts.every((c, i) => i === 0 || Math.abs(c.t0 - __cuts[i-1].t1) < 1e-6)]')
    check(tag + ' : la vidéo commence et finit pile aux poignées, sans trou', abs(cu[0] - s2['a']) < 1e-6 and abs(cu[1] - s2['b']) < 1e-6 and cu[3], (cu, s2['a'], s2['b']))
    inner = ev(pg, '__cuts.slice(1).map(c => c.t0)')
    check(tag + ' : les coupes à l’intérieur restent sur le rythme', all(any(abs(t - x) < 0.02 for x in ev(pg, '[...Array(totalBars() * 16 + 1).keys()].map(k => barTime(0) + k * (barTime(1) - barTime(0)) / 16)')) for t in inner), inner)
    lbl = pg.evaluate("[document.querySelector('#startLbl').textContent, document.querySelector('#endLbl').textContent, document.querySelector('#barsSel').selectedOptions[0].textContent]")
    check(tag + ' : début, fin et durée écrits', lbl[0] != '0:00.00' and lbl[1] != '0:00.00' and str(s2['nb']) in lbl[2], (lbl, s2['nb']))
    gp = pg.evaluate("[parseFloat(document.querySelector('#gripL').style.left), parseFloat(document.querySelector('#gripR').style.left)]")
    check(tag + ' : poignées à la place du passage', abs(gp[0] - s2['a'] / s2['dur'] * 100) < 0.01 and abs(gp[1] - s2['b'] / s2['dur'] * 100) < 0.01, gp)
    check(tag + ' : montage refait pour le nouveau passage', ev(pg, 'S.cuts.every(c => c.t0 >= S.segStart - 1e-6 && c.t1 <= S.segEnd + 1e-6)'))
    # the red playhead: dragged with a finger, the song plays from where it is let go
    ph = pg.locator('#wph').bounding_box(); want = 0.45
    check(tag + ' : curseur rouge prenable au doigt', pg.evaluate("getComputedStyle(document.querySelector('#wph')).pointerEvents") != 'none' and ph is not None)
    # taken by its round red button (at the top), even where it sits on the start handle
    drag(pg, cdp, phone, ph['x'] + ph['width'] / 2, box['y'] - 2, box['x'] + want * box['width'])
    pg.wait_for_timeout(300)
    lp = ev(pg, '({ at: S.listenAt, playing: S.playing, seg: listenSeg, a: S.segStart, b: S.segEnd })')
    left = pg.evaluate("parseFloat(document.querySelector('#wph').style.left)")
    check(tag + ' : curseur glissé → lecture à partir de là', lp['playing'] and not lp['seg'] and lp['at'] is not None and abs(lp['at'] - want * s2['dur']) < 1.5 and abs(left - lp['at'] / s2['dur'] * 100) < 1, (lp, left))
    ev(pg, 'stop(true)'); pg.wait_for_timeout(200); sa = seg(pg)
    check(tag + ' : glisser le curseur ne change pas le passage', abs(sa['a'] - s2['a']) < 1e-6 and abs(sa['b'] - s2['b']) < 1e-6, (sa['a'], sa['b'], s2['a'], s2['b']))
    # a touch in the middle of the passage (not on a handle) still moves the passage and plays it
    if SHOTS: pg.locator('#songBox').screenshot(path=os.path.join(SHOTS, 'passage-' + ('tel' if phone else 'ordi') + '-' + lang + '.png'))
    # « Écouter le passage »: plays from the start of the passage, the passage stays as chosen, and it stops at its end
    pg.locator('#segPlay').click()
    pg.wait_for_function('__ev("S.playing")', timeout=5000)
    st = ev(pg, '({ a: S.segStart, b: S.segEnd, seg: listenSeg })')
    btn = pg.locator('#segPlay').inner_text()
    check(tag + ' : « Écouter le passage » joue le passage choisi', st['seg'] and abs(st['a'] - s2['a']) < 1e-6 and abs(st['b'] - s2['b']) < 1e-6 and 'Stop' in btn, (st, btn))
    pg.wait_for_timeout(800)
    t = ev(pg, 'songNow()')
    check(tag + ' : la lecture part du début du passage', s2['a'] - 0.05 <= t <= s2['a'] + 3, (t, s2['a']))
    pg.locator('#segPlay').click(); pg.wait_for_timeout(200)
    back = pg.locator('#segPlay').inner_text()
    check(tag + ' : deuxième appui = stop', not ev(pg, 'S.playing') and ('Play the part' in back if lang == 'en' else 'Écouter le passage' in back), back)
    # the ‹ › buttons put the passage back on the bars
    pg.locator('#barNext').click(); pg.wait_for_timeout(150)
    bn = seg(pg)
    check(tag + ' : « › » remet le passage sur les mesures', ev(pg, 'S.segA === null') and on_bar(bn['a'], bn['bars'], bn['dur']), (bn['a'], bn['b']))
    # end of the passage reached: playback stops by itself, the passage is kept
    ev(pg, 'S.nBars = 1, S.locks = [], rebuild(false)'); pg.wait_for_timeout(100)
    one = seg(pg); pg.locator('#segPlay').click()
    pg.wait_for_function('__ev("!S.playing")', timeout=int((one['b'] - one['a']) * 1000) + 6000)
    after = seg(pg)
    check(tag + ' : arrêt tout seul à la fin du passage, passage gardé', abs(after['a'] - one['a']) < 1e-6 and abs(after['b'] - one['b']) < 1e-6, (one['a'], one['b'], after['a'], after['b']))
    if not phone:
        # Clip (16:9, the whole song by default): the same handles and the same « Fin » buttons
        ev(pg, "setKind('clip')"); pg.wait_for_timeout(300)
        pg.evaluate("document.querySelector('#waveBox').scrollIntoView({ block: 'center' })"); pg.wait_for_timeout(200)
        box = pg.locator('#wave').bounding_box(); y = box['y'] + box['height'] / 2
        c0 = ev(pg, '({ k: S.kind, a: S.segStart, b: S.segEnd, e: S.clipEnd, dur: S.song.duration })')
        drag(pg, cdp, False, box['x'] + c0['b'] / c0['dur'] * box['width'], y, box['x'] + 0.5 * box['width'])
        c1 = seg(pg); ce = ev(pg, 'S.clipEnd')
        check(tag + ' : Clip, poignée de fin tirée (libre)', c0['k'] == 'clip' and c1['b'] < c0['b'] - 1 and ce is not None and near(c1['b'], 0.5 * c1['dur'], c1['dur'], box['width']), (c0, c1['b'], ce))
        pg.locator('#endPrev').click(); pg.wait_for_timeout(150)
        check(tag + ' : Clip, « Fin ‹ » finit une mesure plus tôt', ev(pg, 'S.clipEnd') == ce - 1)
        for _ in range(40): pg.locator('#endNext').click()
        pg.wait_for_timeout(150)
        check(tag + ' : Clip, « Fin › » va jusqu’à la fin du son', ev(pg, 'S.clipEnd === null && S.segEnd === S.song.duration'))
        ev(pg, "setKind('reel')")
    sw = pg.evaluate('document.documentElement.scrollWidth')
    check(tag + ' : pas de défilement horizontal', sw <= (390 if phone else 1280), sw)
    check(tag + ' : aucune erreur dans la page', not errs, errs)
    ctx.close()


def main():
    tmp = tempfile.mkdtemp(prefix='stalak-son-')
    site = os.path.join(tmp, 'site'); shutil.copytree(PUBLIC, site)
    for page in ('index.html', 'en/index.html'):
        p = os.path.join(site, page); html = open(p, encoding='utf-8').read()
        assert 'applyLang();\n})();' in html, 'repère de la sonde introuvable'
        open(p, 'w', encoding='utf-8').write(html.replace('applyLang();\n})();', 'applyLang();\nwindow.__ev = (s) => eval(s);\n})();'))
    # a song with a clear beat: 120 BPM, a kick on each beat and a held note, 40 s
    wav = os.path.join(site, 'beat.wav')
    subprocess.run([shutil.which('ffmpeg'), '-nostdin', '-v', 'error', '-y', '-f', 'lavfi', '-i',
                    "aevalsrc='0.8*sin(2*PI*60*t)*exp(-25*mod(t,0.5))+0.15*sin(2*PI*440*t)':s=44100:d=40", '-ac', '1', wav], check=True)
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=site))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = 'http://127.0.0.1:%d/' % srv.server_address[1]
    with sync_playwright() as p:
        b = p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
        for lang in ('fr', 'en'):
            for phone in (True, False):
                try: run(b, base, wav, lang, phone)
                except Exception as e: check(('téléphone' if phone else 'ordinateur') + ' ' + lang + ' : déroulé complet', False, str(e)[:300])
        b.close()
    srv.shutdown(); shutil.rmtree(tmp, ignore_errors=True)
    print('%d/%d réussis' % (sum(results), len(results)))
    sys.exit(0 if all(results) else 1)


main()
