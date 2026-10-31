"""Test of the animations of the app and the site (skill motion-design, rule of 31/10). Python Playwright (chromium).

    python3 /abs/path/tests/ui/animations_ui.py <path of a built public/ folder>

- Every animation and transition of every style sheet of the app, the pricing page and a legal page only moves
  transform and opacity; durations come from the shared tokens (--dur-1 … --dur-5); nothing that answers a touch lasts
  more than 300 ms, except a short list of ambient or rare animations (snow, waiting screen, celebration…); no curve
  overshoots (no bounce).
- Changing step: the new step slides in the direction of travel, 300 ms, ease-out-quart.
- « Réduire les animations » (prefers-reduced-motion): nothing moves at all (no animation running, no smooth scroll).
- Smoothness: an iPhone 15 Pro emulated with its processor slowed down 4 times; frames measured while the snow falls, a
  step changes, the help opens and the Pro window opens."""
import functools, http.server, json, os, shutil, sys, tempfile, threading
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.sync_api import sync_playwright

PUBLIC = os.path.abspath(sys.argv[1])
results = []
PW = None
# allowed to last longer: ambient (snow, water, the mascot at work), rare or illustrative (hello, celebration, countdown)
LONG_OK = {'al-snow-far', 'al-snow-near', 'si-snow', 'ex-wave', 'ex-walk', 'ex-carry', 'al-hello', 'al-bob', 'clAutoPulse',
           'ad-frost', 'ad-twinkle', 'pp-frost', 'pr-glint', 'pr-drop', 'pt-fly', 'pt-pop', 'mo-flake', 'mo-ripple', 'cam-pop', 'cam-again'}


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


def check(name, ok, info=''):
    results.append(ok)
    print(('PASS ' if ok else 'FAIL ') + name + (('  — ' + str(info)) if info and not ok else ''))


def ev(pg, code):
    return pg.evaluate('s => __ev(s)', code)


SCAN = r"""() => {
  const root = getComputedStyle(document.documentElement), v = x => x.replace(/var\((--[\w-]+)\)/g, (m, n) => root.getPropertyValue(n).trim() || m);
  const ms = t => /ms$/.test(t) ? parseFloat(t) : /s$/.test(t) ? parseFloat(t) * 1000 : NaN;
  const out = { kfBad: [], trBad: [], long: [], bounce: [], names: new Set(), rules: 0 };
  const walk = list => { for (const r of list){
    if (r.cssRules && !(r instanceof CSSKeyframesRule)) walk(r.cssRules);
    if (r instanceof CSSKeyframesRule){ const props = new Set(); for (const k of r.cssRules) for (let i = 0; i < k.style.length; i++) props.add(k.style[i].replace(/^-webkit-/, ''));
      const bad = [...props].filter(p => !/^(opacity|transform|translate|scale|rotate)$/.test(p)); if (bad.length) out.kfBad.push(r.name + ':' + bad.join('/')); }
    if (r instanceof CSSStyleRule){
      const st = r.style, an = st.getPropertyValue('animation'), tr = st.getPropertyValue('transition');
      for (const [kind, val] of [['animation', an], ['transition', tr]]){
        if (!val || /^none/.test(val)) continue; out.rules++;
        const text = v(val);
        for (const part of text.split(/,(?![^(]*\))/)){
          const toks = part.trim().split(/\s+(?![^(]*\))/), times = toks.filter(t => /^-?[\d.]+m?s$/.test(t)).map(ms), dur = times[0];
          const bez = (part.match(/cubic-bezier\(([^)]*)\)/) || [])[1];
          if (bez){ const n = bez.split(',').map(Number); if (n[1] < 0 || n[1] > 1 || n[3] < 0 || n[3] > 1) out.bounce.push(r.selectorText + ' ' + part.trim()); }
          if (kind === 'transition'){ const prop = toks[0]; if (!/^(transform|opacity|none)$/.test(prop)) out.trBad.push(r.selectorText + ' ' + part.trim()); if (dur > 300) out.long.push(r.selectorText + ' ' + part.trim()); }
          else { const name = toks.find(t => /^[a-zA-Z][\w-]*$/.test(t) && !/^(linear|ease|ease-in|ease-out|ease-in-out|both|forwards|backwards|infinite|alternate|normal|reverse|none|running|paused)$/.test(t));
            if (name){ out.names.add(name); if (dur > 300 && !window.__LONG.includes(name)) out.long.push(r.selectorText + ' ' + part.trim()); } }
        }
      }
    } } };
  for (const sh of document.styleSheets){ try { walk(sh.cssRules); } catch(e){} }
  out.names = [...out.names]; return out; }"""


def frames(pg, ms, action=None):
    """frame intervals (ms) during `ms` milliseconds, an action started at the beginning"""
    return pg.evaluate("""([ms, act]) => new Promise(res => { const d = []; let last = performance.now(); const end = last + ms;
      if (act) __ev(act); const f = t => { d.push(t - last); last = t; if (t < end) requestAnimationFrame(f); else res(d); }; requestAnimationFrame(f); })""", [ms, action])


def stats(d, action=False):
    """frames of the animation; with an action, its first frame (the page doing what was asked: preparing the step,
    opening the panel) is told apart: what must stay smooth is the movement after it"""
    first = round(d[1], 1) if action and len(d) > 1 else None
    d = sorted(d[2:] if action else d[1:]) or [0]
    return {'n': len(d), 'p95': round(d[int(len(d) * 0.95) - 1 if len(d) > 1 else 0], 1), 'max': round(d[-1], 1), 'long': sum(1 for x in d if x > 50), '1re': first}


def run(b, base, lang, iphone, calm):
    tag = ('iPhone' if iphone else 'ordinateur') + ' ' + lang + (' (réduire les animations)' if calm else '')
    opts = dict(PW.devices['iPhone 15 Pro']) if iphone else {'viewport': {'width': 1280, 'height': 860}}
    ctx = b.new_context(**opts, locale='en-US' if lang == 'en' else 'fr-FR', reduced_motion='reduce' if calm else 'no-preference')
    ctx.route('**/tag/js/gpt.js', lambda r: r.fulfill(status=404, body=''))
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.add_init_script('window.__LONG = ' + json.dumps(sorted(LONG_OK)))
    pg.goto(base + ('en/' if lang == 'en' else ''), wait_until='load'); pg.wait_for_function('typeof window.__ev === "function"', timeout=20000)
    if not calm:
        r = pg.evaluate(SCAN)
        check(tag + ' : app : images-clés seulement en transform / opacity', not r['kfBad'], r['kfBad'])
        check(tag + ' : app : transitions seulement en transform / opacity', not r['trBad'], r['trBad'][:6])
        check(tag + ' : app : rien de plus de 300 ms, sauf ambiance et moments rares (%d règles)' % r['rules'], not r['long'], r['long'][:6])
        check(tag + ' : app : aucune courbe qui rebondit', not r['bounce'], r['bounce'][:6])
        tok = pg.evaluate("() => ['--dur-1', '--dur-2', '--dur-3', '--dur-4', '--dur-5', '--ease-out', '--ease-move', '--ease-press'].map(n => getComputedStyle(document.documentElement).getPropertyValue(n).trim())")
        check(tag + ' : réglages communs (durées et courbes) présents', tok[:5] == ['120ms', '180ms', '240ms', '300ms', '500ms'] and tok[5].startswith('cubic-bezier(.165'), tok)
    pg.locator('#demoBtn').click()
    pg.wait_for_function('() => __ev("S.step === 4 && S.cuts.length > 0")', timeout=60000)
    pg.wait_for_timeout(800)
    if calm:
        ev(pg, 'go(2)'); pg.wait_for_timeout(50)
        ev(pg, "$('#helpBtn').click()"); pg.wait_for_timeout(50)
        run_n = pg.evaluate("() => document.getAnimations().filter(a => a.playState === 'running').map(a => a.animationName || a.transitionProperty || '?')")
        check(tag + ' : rien ne bouge (aucune animation en cours : neige, étape, aide)', not run_n, run_n)
        check(tag + ' : défilement de la page sans glissement', ev(pg, "scrollB() === 'auto'"))
        check(tag + ' : aucune erreur dans la page', not errs, errs)
        ctx.close(); return
    # changing step: slides the right way, 300 ms, ease-out-quart
    ev(pg, 'go(2)'); pg.wait_for_timeout(30)
    a = pg.evaluate("() => { const x = document.getAnimations().find(a => a.animationName && a.effect && a.effect.target && a.effect.target.id === 'p2'); return x ? [x.animationName, x.effect.getTiming().duration, getComputedStyle(x.effect.target).animationTimingFunction] : null; }")
    check(tag + ' : changement d’étape : glisse vers l’arrière en 300 ms, ease-out-quart', a is not None and a[0] == 'mo-step-l' and a[1] == 300 and a[2] == 'cubic-bezier(0.165, 0.84, 0.44, 1)', a)
    ev(pg, 'go(4)'); pg.wait_for_timeout(400)
    if iphone:
        # (the page is let settle before each measure: what is measured is the animation, not the work of the step before)
        pg.wait_for_timeout(2500)
        cdp = ctx.new_cdp_session(pg); cdp.send('Emulation.setCPUThrottlingRate', {'rate': 4})
        sn = stats(frames(pg, 1500))
        st = stats(frames(pg, 900, 'go(3)'), True)
        ev(pg, 'go(4)'); pg.wait_for_timeout(3000)
        hp = stats(frames(pg, 700, "$('#helpBtn').click()"), True); ev(pg, "$('#helpClose').click()"); pg.wait_for_timeout(1500)
        ev(pg, "store.set(PP_KEY, null)")
        pp = stats(frames(pg, 1100, 'ppOpen()'), True); ev(pg, 'ppClose()')
        cdp.send('Emulation.setCPUThrottlingRate', {'rate': 1})
        print('   images (processeur ×4 plus lent) — neige %s · étape %s · aide %s · fenêtre Pro %s' % (sn, st, hp, pp))
        ok = all(x['long'] <= 1 and x['p95'] <= 20 for x in (sn, st, hp, pp))
        check(tag + ' : fluide, processeur 4 fois plus lent (mouvement à 60 images/s : 95 %% en moins de 20 ms, au plus 1 image de plus de 50 ms, soit environ 1 image sautée à vitesse normale ; 1re image notée à part)', ok, (sn, st, hp, pp))
    # the legal page and the pricing page of the site
    pages = ['mentions-legales.html', 'tarifs.html'] if lang == 'fr' else ['en/' + f for f in sorted(os.listdir(os.path.join(PUBLIC, 'en'))) if f.endswith('.html') and f != 'index.html'][:2]
    for path in pages:
        pg.goto(base + path, wait_until='load')
        r = pg.evaluate(SCAN)
        check(tag + ' : site (%s) : transform / opacity, ≤ 300 ms, sans rebond (%d règles)' % (path, r['rules']), not r['kfBad'] and not r['trBad'] and not r['long'] and not r['bounce'], r)
    check(tag + ' : aucune erreur dans la page', not errs, errs)
    ctx.close()


def main():
    tmp = tempfile.mkdtemp(prefix='stalak-anim-')
    site = os.path.join(tmp, 'site'); shutil.copytree(PUBLIC, site)
    for page in ('index.html', 'en/index.html'):
        p = os.path.join(site, page); html = open(p, encoding='utf-8').read()
        assert 'applyLang();\n})();' in html, 'repère de la sonde introuvable'
        open(p, 'w', encoding='utf-8').write(html.replace('applyLang();\n})();', 'applyLang();\nwindow.__ev = (s) => eval(s);\n})();'))
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=site))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = 'http://127.0.0.1:%d/' % srv.server_address[1]
    with sync_playwright() as p:
        b = p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
        global PW; PW = p
        for lang in ('fr', 'en'):
            for iphone in (True, False):
                for calm in (False, True):
                    if calm and not iphone: continue
                    try: run(b, base, lang, iphone, calm)
                    except Exception as e: check(('iPhone' if iphone else 'ordinateur') + ' ' + lang + (' calme' if calm else '') + ' : déroulé complet', False, str(e)[:300])
        b.close()
    srv.shutdown(); shutil.rmtree(tmp, ignore_errors=True)
    print('%d/%d réussis' % (sum(results), len(results)))
    sys.exit(0 if all(results) else 1)


main()
