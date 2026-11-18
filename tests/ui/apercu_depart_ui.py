"""Test of the start of the preview (bug seen by the owner on 16/11: the cuts went from take 1 to take 2 while the picture stayed
on take 1 for the first 2.3 s). Python Playwright, on an iPhone (390 px) and a computer (1280 px).

    python3 /abs/path/tests/ui/apercu_depart_ui.py <built public/ folder>

The takes are played by the browser's video players (as on an iPhone: the page's own decoding is switched off), and the
player of take 2 is made slow to find its place (2 s, as when several takes look for their place at once on an iPhone).
1. Take 2 is seen in the first 3 s: the song waits for it (up to 2.5 s), so the picture of take 2 is there on its cut.
2. Take 2 comes later: the song does not wait for it, and while take 2 is still looking for its place, the picture of take 1
   (on screen, ready) is drawn: it is no longer frozen because another take is not ready."""
import functools, http.server, os, shutil, subprocess, sys, tempfile, threading
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.sync_api import sync_playwright

PUBLIC = os.path.abspath(sys.argv[1])
results = []


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


def check(name, ok, info=''):
    results.append(bool(ok))
    print(('PASS ' if ok else 'FAIL ') + name + (('  — ' + str(info)) if info and not ok else ''), flush=True)


def ev(pg, code):
    return pg.evaluate('s => __ev(s)', code)


SLOW = """(async () => {
  // the players of the takes, as on an iPhone: the page's own decoding off
  for (const tk of S.takes){ liveClose(tk); await reloadEl(tk); if (tk.el !== fullEl(tk)) tk.el = fullEl(tk); }
  // a decoding started just before may still arrive: closed again
  await new Promise(r => setTimeout(r, 1000)); for (const tk of S.takes) if (tk.live){ liveClose(tk); await reloadEl(tk); tk.el = fullEl(tk); }
  const T2 = S.takes[1].el; window.__T2 = T2; window.__seekUntil = 0;
  Object.defineProperty(T2, 'seeking', { configurable: true, get: () => performance.now() < window.__seekUntil });
  const orig = seekTo;
  seekTo = (v, lt, strict) => v === T2 ? new Promise(r => { window.__seekUntil = performance.now() + 2000; setTimeout(() => orig(v, lt, strict).then(r), 2000); }) : orig(v, lt, strict);
  // the black box keeps 120 lines: keep every line of the test here
  window.__tr = []; const tr0 = trace; trace = m => { window.__tr.push(Math.round(performance.now()) + ' ' + m); tr0(m); };
  return true; })()"""


def held_after_start(tr):
    k = next((i for i, l in enumerate(tr) if 'son : départ rendu' in l), None)
    if k is None: return ['(le son n’est pas parti)']
    frames = [l for l in tr[k:] if ' image gardée' in l or ' dessin' in l]
    return [l for l in frames[3:] if 'image gardée' in l]


def run(b, base, site, iphone, PW):
    tag = 'iPhone' if iphone else 'ordinateur'
    opts = dict(PW.devices['iPhone 12']) if iphone else {'viewport': {'width': 1280, 'height': 900}}
    ctx = b.new_context(**opts, locale='fr-FR'); ctx.route('**/api/**', lambda r: r.fulfill(status=204, body=''))
    pg = ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.goto(base + 'fr/', wait_until='load', timeout=120000); pg.wait_for_function('window.__ev && window.MP4Box', timeout=60000)
    pg.set_input_files('#songFile', os.path.join(site, 'beat.wav')); pg.wait_for_function('() => __ev("!!S.song")', timeout=60000)
    pg.set_input_files('#takeFiles', [os.path.join(site, 'take1.mp4'), os.path.join(site, 'take2.mp4')])
    pg.wait_for_function('''() => __ev("S.takes.length === 2 && S.takes.every(t => t.status !== 'pending')")''', timeout=180000)
    ev(pg, "go(4)"); pg.wait_for_function('() => __ev("S.cuts.length > 1")', timeout=60000); pg.wait_for_timeout(1500)
    ev(pg, SLOW)
    print('  (prises :', ev(pg, "usedTakes().map(takeState).join(' | ')"), ')', flush=True)
    # every cut on take 1, but one, 6 s or more after the start of the passage, on take 2
    t2 = ev(pg, "(() => { const j = S.cuts.findIndex(c => c.t0 - S.segStart > 6); S.cuts.forEach((c, i) => { c.take = i === j ? S.takes[1] : S.takes[0]; }); return S.cuts[j].t0; })()")
    # 1. take 2 seen 1.2 s after the start: the song waits for it
    ev(pg, "window.__seekUntil = 0, S.takes[1].el.currentTime = 0")
    pg.wait_for_timeout(300)
    ev(pg, "window.__t0 = performance.now(), window.__tr = [], play(%f), traceLeft = 100000" % (t2 - 1.2))
    pg.wait_for_function('() => __ev("!preparing")', timeout=10000)
    waited = ev(pg, "performance.now() - window.__t0")
    pg.wait_for_timeout(2600); tr = ev(pg, "window.__tr.slice()"); ev(pg, "stop()")
    if not 1700 < waited < 3200: print('   ', [l for l in tr if 'P' in l.split(' ')[1][:2] or 'attente' in l or 'son' in l][:14], flush=True)
    check(tag + ' : prise 2 vue dans les 3 premières secondes : le son l’attend (environ 2 s) avant de partir', 1700 < waited < 3200, round(waited))
    held = held_after_start(tr)
    check(tag + ' : … puis l’image n’est jamais gardée une fois le son parti (prise 2 prête sur sa coupe)', not held, held[:5])
    # 2. take 2 comes 4 s after the start: the song does not wait; take 1 on screen is drawn while take 2 looks for its place
    pg.wait_for_timeout(500); ev(pg, "S.takes[1].el.currentTime = 0"); pg.wait_for_timeout(300)
    ev(pg, "window.__t0 = performance.now(), window.__tr = [], play(%f), traceLeft = 100000" % (t2 - 4.2))
    pg.wait_for_function('() => __ev("!preparing")', timeout=10000)
    waited = ev(pg, "performance.now() - window.__t0")
    pg.wait_for_timeout(1500)
    seek_now = ev(pg, "performance.now() < window.__seekUntil")
    tr = ev(pg, "window.__tr.slice()"); ev(pg, "stop()")
    drawn = [l for l in tr if ' dessin' in l]; held = held_after_start(tr)
    check(tag + ' : prise 2 plus tard : le son ne l’attend pas', waited < 1500, round(waited))
    check(tag + ' : … et pendant que la prise 2 cherche encore sa place, l’image de la prise 1 (à l’écran) avance', len(drawn) >= 10 and not held, (len(drawn), held[:3], seek_now))
    check(tag + ' : aucune erreur dans la page', not errs, errs)
    ctx.close()


def main():
    tmp = tempfile.mkdtemp(prefix='stalak-apd-')
    site = os.path.join(tmp, 'site'); shutil.copytree(PUBLIC, site)
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from _probe import add_probe; add_probe(site)
    ff = shutil.which('ffmpeg'); beat = "0.8*sin(2*PI*60*t)*exp(-25*mod(t,0.5))+0.15*sin(2*PI*440*t)"
    subprocess.run([ff, '-nostdin', '-v', 'error', '-y', '-f', 'lavfi', '-i', "aevalsrc='%s':s=44100:d=24" % beat, '-ac', '1', os.path.join(site, 'beat.wav')], check=True)
    for i in (1, 2):
        subprocess.run([ff, '-nostdin', '-v', 'error', '-y', '-f', 'lavfi', '-i', 'testsrc2=s=360x640:r=30:d=24,hue=h=%d' % (i * 90), '-f', 'lavfi', '-i', "aevalsrc='%s':s=44100:d=24" % beat,
                        '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-g', '30', '-c:a', 'aac', '-shortest', os.path.join(site, 'take%d.mp4' % i)], check=True)
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=site))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = 'http://127.0.0.1:%d/' % srv.server_address[1]
    with sync_playwright() as p:
        b = p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'])
        for iphone in (True, False):
            try: run(b, base, site, iphone, p)
            except Exception as e: check(('iPhone' if iphone else 'ordinateur') + ' : déroulé complet', False, str(e)[:400])
        b.close()
    srv.shutdown(); shutil.rmtree(tmp, ignore_errors=True)
    print('%d/%d réussis' % (sum(results), len(results)))
    sys.exit(0 if all(results) else 1)


main()
