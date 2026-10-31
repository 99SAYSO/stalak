"""Test of the video filters in the app (Montage step), Python Playwright (chromium) + ffmpeg.

    python3 /abs/path/tests/ui/filtres_ui.py <path of a built public/ folder> [folder for screenshots]

Checks, on the example song (« Essayer avec un exemple ») and on a real video take:
- the row of thumbnails (14, by theme, each showing its filter on the picture), FR / EN, phone and computer;
- the preview changes with the filter, the lyrics stay on top unchanged;
- the same picture in the preview (half size), the export's 2D canvas and the export's WebGL drawing (Safari's way);
- Stalak Pro: a Pro filter can be tried, but exporting opens the Pro page (« filters »); a free filter does not;
- the filter is saved with the project and comes back when it is opened;
- what a filter costs per picture of the export (2D and WebGL), and a whole export with and without a filter."""
import functools, http.server, json, os, shutil, subprocess, sys, tempfile, threading
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


def aev(pg, code):
    return pg.evaluate('s => __ev("(async () => {" + s + "})()")', code)


def ui(b, base, lang, phone):
    tag = ('téléphone' if phone else 'ordinateur') + ' ' + lang
    ctx = b.new_context(viewport={'width': 390, 'height': 844} if phone else {'width': 1280, 'height': 860},
                        has_touch=phone, is_mobile=phone, locale='en-US' if lang == 'en' else 'fr-FR')
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.goto(base + ('en/' if lang == 'en' else ''), wait_until='load')
    pg.wait_for_function('window.__ev && window.MP4Box', timeout=20000)
    pg.locator('#demoBtn').click()
    pg.wait_for_function('() => __ev("S.step === 4 && S.cuts.length > 0")', timeout=40000)
    pg.wait_for_timeout(800)
    # (audit 30/10) without Pro the Pro filters are behind the « + 23 » tile: opened here to see them all
    pg.locator('#filtMore').click(); pg.wait_for_timeout(300)
    n = pg.locator('#filtRow .filt').count()
    th = pg.locator('#filtRow .filtth').all_inner_texts()
    want = ['Colors', 'Camera', 'Retro', 'Aesthetic'] if lang == 'en' else ['Couleurs', 'Caméra', 'Rétro', 'Esthétique']
    check(tag + ' : 27 vignettes en 4 thèmes', n == 27 and [t.replace('PRO', '').strip().lower() for t in th[1:]] == [w.lower() for w in want], (n, th))
    pro = pg.locator('#filtRow .filtpro').count()
    check(tag + ' : 23 filtres Pro derrière une tuile, une étiquette PRO par thème (compte gratuit)', pro == 5 and pg.locator('#filtMore b').inner_text() == '+23', pro)
    # the thumbnails show the picture, each through its own filter
    # (animations of 31/10: the thumbnails are drawn after the step has slid in, a few per frame: waited for, 10 s at most)
    for _ in range(40):
        sig = pg.evaluate("""() => [...document.querySelectorAll('#filtRow canvas')].map(cv => { const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let r = 0, g = 0, b = 0; for (let i = 0; i < d.length; i += 4){ r += d[i]; g += d[i+1]; b += d[i+2]; } const n = d.length / 4; return [r / n, g / n, b / n].map(Math.round); })""")
        distinct = len({tuple(x) for x in sig})
        if distinct >= 26 and all(sum(x) > 30 for x in sig): break
        pg.wait_for_timeout(250)
    check(tag + ' : vignettes dessinées et toutes différentes', distinct >= 26 and all(sum(x) > 30 for x in sig), sig)
    sw = pg.evaluate('document.documentElement.scrollWidth')
    check(tag + ' : pas de défilement horizontal de la page (la rangée défile seule)', sw <= (390 if phone else 1280), sw)
    if SHOTS:
        pg.locator('#filtBox').scroll_into_view_if_needed()
        pg.locator('#filtBox').screenshot(path=os.path.join(SHOTS, 'rangee-' + ('tel' if phone else 'ordi') + '-' + lang + '.png'))
    # choose Noir & blanc with a touch / a click: the preview turns grey (measured under the take's coloured label, above the lyrics)
    b2 = pg.locator('#filtRow .filt[data-v="nb"]'); b2.scroll_into_view_if_needed()
    if phone: b2.tap()
    else: b2.click()
    pg.wait_for_timeout(500)
    chk = pg.locator('#filtRow .filt[aria-checked="true"]').get_attribute('data-v')
    grey = ev(pg, """(() => { const d = g.getImageData(0, Math.round(view.height * 0.1), view.width, Math.round(view.height * 0.25)).data; let m = 0; for (let i = 0; i < d.length; i += 4) m = Math.max(m, Math.abs(d[i] - d[i+1]), Math.abs(d[i+1] - d[i+2])); return m; })()""")
    check(tag + ' : Noir & blanc choisi, aperçu en gris', chk == 'nb' and ev(pg, 'S.filter') == 'nb' and grey <= 3, (chk, grey))
    stt = pg.locator('#status').inner_text()
    check(tag + ' : message du filtre', ('Black & white' if lang == 'en' else 'Noir & blanc') in stt, stt)
    # keyboard: arrows move in the row
    pg.locator('#filtRow .filt[data-v="nb"]').focus(); pg.keyboard.press('ArrowRight'); pg.wait_for_timeout(200)
    # (audit 30/10) without Pro the free filters come first: the next one is the first filter after them
    want_next = pg.evaluate("() => { const l = [...document.querySelectorAll('#filtRow .filt')].map(b => b.dataset.v); return l[l.indexOf('nb') + 1]; }")
    check(tag + ' : flèche → filtre suivant', ev(pg, 'S.filter') == want_next and pg.evaluate('document.activeElement.dataset.v') == want_next, (ev(pg, 'S.filter'), want_next))
    # a Pro filter: tried in the preview, the export opens the Pro page
    ev(pg, "window.__why = null, acctOpen = w => { window.__why = w; }")
    pg.locator('#filtRow .filt[data-v="demon"]').click(); pg.wait_for_timeout(300)
    stt = pg.locator('#status').inner_text()
    check(tag + ' : filtre Pro essayé dans l’aperçu', ev(pg, 'S.filter') == 'demon' and 'Pro' in stt, stt)
    ev(pg, "filtAsk = async () => 'pro'")   # (audit 30/10) the question « Pro, or without this filter », answered Pro here
    ev(pg, 'exportOne()'); pg.wait_for_timeout(300)
    check(tag + ' : export avec un filtre Pro → page Pro « filters »', pg.evaluate('window.__why') == 'filters' and not ev(pg, 'S.exporting'), pg.evaluate('window.__why'))
    ev(pg, 'exportPack()'); pg.wait_for_timeout(200)
    check(tag + ' : pack → page Pro', pg.evaluate('window.__why') in ('pack', 'filters'))
    ev(pg, "window.__why = null, setFilter('film35', true), exportOne()"); pg.wait_for_timeout(300)
    # offer of 30/10: signed out, a free filter does not ask for a plan, only for the free account (the video of the day)
    check(tag + ' : filtre gratuit → pas de page Pro (sans compte : création du compte gratuit)', pg.evaluate('window.__why') in (None, 'daily'), pg.evaluate('window.__why'))
    pg.wait_for_function('() => __ev("!S.exporting")', timeout=120000)
    if SHOTS and not phone:
        ev(pg, "setFilter('vhs', true)"); pg.wait_for_timeout(400)
        pg.locator('#view').screenshot(path=os.path.join(SHOTS, 'apercu-vhs-' + lang + '.png'))
    check(tag + ' : aucune erreur dans la page', not errs, errs)
    ctx.close()


def engine(b, base, video):
    """same picture in preview / export 2D / export WebGL; cost per picture; save and reopen; whole export timings"""
    ctx = b.new_context(viewport={'width': 1280, 'height': 860}, locale='fr-FR'); pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.goto(base, wait_until='load'); pg.wait_for_function('window.__ev && window.MP4Box', timeout=20000)
    pg.locator('#demoBtn').click(); pg.wait_for_function('() => __ev("S.step === 4 && S.cuts.length > 0")', timeout=40000)
    # a real picture for the WebGL / 2D comparison: a test pattern in 1080×1920 (sharp colours, gradients, text)
    ev(pg, """window.__pic = (() => { const c = document.createElement('canvas'); c.width = 1080; c.height = 1920; const x = c.getContext('2d');
      const gr = x.createLinearGradient(0, 0, 1080, 1920); gr.addColorStop(0, '#1d3c8f'); gr.addColorStop(.5, '#f2a65a'); gr.addColorStop(1, '#0b0b10'); x.fillStyle = gr; x.fillRect(0, 0, 1080, 1920);
      for (let i = 0; i < 8; i++){ x.fillStyle = 'hsl(' + i * 45 + ',80%,55%)'; x.beginPath(); x.arc(160 + (i % 4) * 250, 500 + Math.floor(i / 4) * 700, 110, 0, 7); x.fill(); }
      x.fillStyle = '#fff'; x.fillRect(440, 200, 200, 1500); x.font = 'bold 150px sans-serif'; x.fillText('HAUT', 330, 170); return c; })()""")
    res = ev(pg, """(() => {
      const out = {}, saved = S.filter, oldLy = S.lyrics.mode; S.lyrics.mode = 'none';
      const pic = { img: __pic, w: 1080, h: 1920, rot: 0 }, take = { kind: 'video', offset: 0, duration: 999, live: null, el: { readyState: 0 }, color: '#fff', name: 't' };
      const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
      const small = (src) => { const c = mk(270, 480); c.getContext('2d').drawImage(src, 0, 0, 270, 480); return c.getContext('2d').getImageData(0, 0, 270, 480).data; };
      const diff = (a, b) => { let s = 0; for (let i = 0; i < a.length; i += 4) for (let k = 0; k < 3; k++) s += Math.abs(a[i+k] - b[i+k]); return s / (a.length / 4 * 3); };
      for (const f of FILTERS){
        S.filter = f.id;
        // preview: half size on the page's canvas
        setRes(0.5); drawFrame(g, { take }, 3.0, false, pic); const pv = small(view);
        // export, 2D canvas: full size
        setRes(1); drawFrame(g, { take }, 3.0, false, pic); const e2 = small(view);
        // export, WebGL (Safari): full size
        const R = expGL(); const cv = R.video(pic, 1, 3.0, false); const eg = small(cv); R.close();
        setRes(0.5);
        out[f.id] = { pv_e2: diff(pv, e2), e2_gl: diff(e2, eg), top: (() => { const d = eg; let s = 0; for (let i = 0; i < 270 * 4 * 20; i += 4) s += d[i] + d[i+1] + d[i+2]; return s / (270 * 20 * 3); })(),
                      topRef: (() => { const d = e2; let s = 0; for (let i = 0; i < 270 * 4 * 20; i += 4) s += d[i] + d[i+1] + d[i+2]; return s / (270 * 20 * 3); })() };
      }
      S.filter = saved; S.lyrics.mode = oldLy; setRes(0.5); return out;
    })()""")
    for fid, r in res.items():
        check('rendu ' + fid + ' : aperçu = export 2D (écart %.1f)' % r['pv_e2'], r['pv_e2'] < 9, r)
        check('rendu ' + fid + ' : export WebGL = export 2D, image à l’endroit (écart %.1f)' % r['e2_gl'], r['e2_gl'] < 4 and abs(r['top'] - r['topRef']) < 6, r)
    # cost per picture of the export (1080×1920), average of 40 pictures, 2D and WebGL
    cost = ev(pg, """(() => {
      const take = { kind: 'video', offset: 0, duration: 999, live: null, el: { readyState: 0 }, color: '#fff', name: 't' }, pic = { img: __pic, w: 1080, h: 1920, rot: 0 }, out = {};
      const oldLy = S.lyrics.mode; S.lyrics.mode = 'none'; setRes(1);
      for (const id of ['none', 'nb', 'reve', 'vhs', 'super8']){
        S.filter = id;
        let t0 = performance.now(); for (let i = 0; i < 40; i++){ drawFrame(g, { take }, 3 + i / 30, false, pic); g.getImageData(0, 0, 1, 1); } const d2 = (performance.now() - t0) / 40;
        const R = expGL(); R.video(pic, 1, 3, false); t0 = performance.now();
        for (let i = 0; i < 40; i++){ const cv = R.video(pic, 1, 3 + i / 30, false); const vf = new VideoFrame(cv, { timestamp: i * 33333 }); vf.close(); }
        R.gl = null; const dg = (performance.now() - t0) / 40; R.close(); out[id] = [d2, dg];
      }
      S.filter = 'none'; S.lyrics.mode = oldLy; setRes(0.5); return out;
    })()""")
    print('coût par image d’export (1080×1920, cette machine sans carte graphique) : ' + ', '.join('%s 2D %.1f ms / WebGL %.1f ms' % (k, v[0], v[1]) for k, v in cost.items()))
    base2d, basegl = cost['none']
    worst2d = max(v[0] for k, v in cost.items() if k != 'none') - base2d
    check('coût d’un filtre mesuré (2D +%.1f ms par image)' % worst2d, all(v[0] > 0 and v[1] > 0 for v in cost.values()), cost)
    # saved with the project, back when it is opened
    ev(pg, "setFilter('golden', true)")
    st = aev(pg, "const r = await clCollect(); return r.state.set.filter;")
    check('sauvegarde : le filtre est dans le projet', st == 'golden', st)
    ev(pg, "setFilter('none', true)")
    # whole exports, without and with a filter (when this browser has a video encoder)
    enc = aev(pg, "const c = await pickVideoConfig(); return c ? c.codec : null;")
    # an account without the daily limit, so that the exports go through (offer of 30/10: signed out, an export asks for an account)
    ev(pg, "acctHas = f => f === 'unlimited'")
    if enc:
        times = {}
        # free filters only: this test page has no Pro account, a Pro filter would open the Pro page instead of exporting
        for fid in ('none', 'film35', 'nb'):
            ev(pg, "setFilter('%s', true), lastBlob = null" % fid)
            t = aev(pg, "const t0 = performance.now(); await exportOne(); return [performance.now() - t0, lastBlob ? lastBlob.size : 0];")
            times[fid] = t
            if SHOTS and t[1]:
                b64 = aev(pg, "const u = new Uint8Array(await lastBlob.arrayBuffer()); let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s);")
                open(os.path.join(SHOTS, 'export-' + fid + '.mp4'), 'wb').write(__import__('base64').b64decode(b64))
        print('export complet (exemple, %s) : ' % enc + ', '.join('%s %.1f s (%d ko)' % (k, v[0] / 1000, v[1] / 1024) for k, v in times.items()))
        slow = max(times['film35'][0], times['nb'][0]) / max(1, times['none'][0])
        check('export avec filtre pas beaucoup plus lent (x%.2f)' % slow, all(v[1] > 0 for v in times.values()) and slow < 1.6, times)
    else:
        print('export complet : pas d’encodeur vidéo dans ce navigateur de test, mesure faite image par image seulement')
    check('moteur : aucune erreur dans la page', not errs, errs)
    ctx.close()


def main():
    tmp = tempfile.mkdtemp(prefix='stalak-filtres-')
    site = os.path.join(tmp, 'site'); shutil.copytree(PUBLIC, site)
    for page in ('index.html', 'en/index.html'):
        p = os.path.join(site, page); html = open(p, encoding='utf-8').read()
        assert 'applyLang();\n})();' in html, 'repère de la sonde introuvable'
        open(p, 'w', encoding='utf-8').write(html.replace('applyLang();\n})();', 'applyLang();\nwindow.__ev = (s) => eval(s);\n})();'))
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=site))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = 'http://127.0.0.1:%d/' % srv.server_address[1]
    with sync_playwright() as p:
        b = p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'])
        # STALAK_ONLY=moteur: only the drawing, cost and export part (the long one is the export)
        for lang in (() if os.environ.get('STALAK_ONLY') == 'moteur' else ('fr', 'en')):
            for phone in (True, False):
                try: ui(b, base, lang, phone)
                except Exception as e: check(('téléphone' if phone else 'ordinateur') + ' ' + lang + ' : déroulé complet', False, str(e)[:300])
        try: engine(b, base, None)
        except Exception as e: check('moteur : déroulé complet', False, str(e)[:300])
        b.close()
    srv.shutdown(); shutil.rmtree(tmp, ignore_errors=True)
    print('%d/%d réussis' % (sum(results), len(results)))
    sys.exit(0 if all(results) else 1)


main()
