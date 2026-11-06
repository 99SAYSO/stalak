"""Test of the offer in the app: Gratuit / Stalak Pro / Stalak Creator Plus and the watermark of free videos (no ad since
06/11: free videos always carry it; no watermark = Pro or Creator Plus). Python Playwright (chromium) + ffmpeg.

    python3 /abs/path/tests/ui/formules_ui.py <path of a built public/ folder> [folder for screenshots]

- Gratuit: no account needed to export; one « Exporter » button and, next to it, « Sans filigrane → Pro » (the plans). The
  watermark (06/11: the mascot's face as a white stencil + « stalak.app », about 14 % of the width) is in the preview and in
  the export (2D and WebGL, same picture; packs use the same drawing); it jumps to another corner every 5 s, always inside the part
  TikTok and Instagram do not cover (top 8 %, bottom 20 %, right 12 %). No ad button, and Google's ad script is never loaded.
- Pro / Creator Plus are played by the test: acctHas(feat) is replaced inside the app; at the end Comptes' own function is
  put back. acctOpen is watched.
- An iPhone (iPhone 15 Pro: size, touch, Safari's user agent) and a computer, in French and English."""
import functools, http.server, os, shutil, sys, tempfile, threading
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.sync_api import sync_playwright

PUBLIC = os.path.abspath(sys.argv[1])
SHOTS = sys.argv[2] if len(sys.argv) > 2 else None
results = []
PW = None
PLANS = {
    'gratuit': [],
    'pro': ['nowm', 'clip', 'fx', 'text', 'filters', 'lyrics'],
    'creator': ['nowm', 'clip', 'fx', 'text', 'filters', 'lyrics', 'pack5', 'pack10', 'pack30', 'cloud', 'human'],
}
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


def check(name, ok, info=''):
    results.append(ok)
    print(('PASS ' if ok else 'FAIL ') + name + (('  — ' + str(info)) if info and not ok else ''))


def ev(pg, code):
    return pg.evaluate('s => __ev(s)', code)


def plan(pg, name):
    pg.evaluate("""feats => { window.__feats = feats; if (!window.__real) window.__real = __ev("acctHas");
      __ev("acctHas = f => window.__feats.includes(f); acctOpen = (why, o) => { window.__open = [why, o && o.plan || null]; }; textGate(); planTags(); filtUI(); kindUI(); wmUI()"); }""", PLANS[name])


def lock(pg, code, stop_export=True):
    pg.evaluate('() => { window.__open = null; window.__began = false; }')
    if stop_export: ev(pg, "beginExport = () => { window.__began = true; window.__wmAt = S.wm; throw new Error('test : export arrêté ici'); }")
    try: pg.evaluate('s => Promise.resolve(__ev(s)).catch(() => {})', code)
    except Exception: pass
    pg.wait_for_timeout(200)
    return pg.evaluate('() => [window.__open, window.__began]')


def wm_spot(pg, t, res=0.5):
    """where the watermark is on the preview picture at t: the box of the pixels it changes (logical units)"""
    return ev(pg, """(() => { const t = %f, take = { kind: 'video', offset: 0, duration: 999, live: null, el: { readyState: 0 }, color: '#fff', name: 't' };
      const pic = { img: window.__flat, w: 1080, h: 1920, rot: 0 }, oldLy = S.lyrics.mode; S.lyrics.mode = 'none'; setRes(%f);
      const grab = () => g.getImageData(0, 0, view.width, view.height).data;
      S.exporting = true; S.wm = false; drawFrame(g, { take }, t, false, pic); const a = grab();
      S.wm = wmOn(); drawFrame(g, { take }, t, false, pic); const b = grab(); S.exporting = false;
      let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1, n = 0;
      for (let i = 0; i < a.length; i += 4) if (Math.abs(a[i] - b[i]) + Math.abs(a[i+1] - b[i+1]) + Math.abs(a[i+2] - b[i+2]) > 30){ const p = i / 4, x = p %% view.width, y = Math.floor(p / view.width); n++; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
      S.lyrics.mode = oldLy; setRes(0.5); const k = 1 / %f;
      return n ? [Math.round(x0 * k), Math.round(y0 * k), Math.round(x1 * k), Math.round(y1 * k), n] : null; })()""" % (t, res, res))


def run(b, base, lang, iphone):
    tag = ('iPhone' if iphone else 'ordinateur') + ' ' + lang
    opts = dict(PW.devices['iPhone 15 Pro']) if iphone else {'viewport': {'width': 1280, 'height': 860}}
    ctx = b.new_context(**opts, locale='en-US' if lang == 'en' else 'fr-FR')
    gpt = []; ctx.route('**/*doubleclick.net/**', lambda r: (gpt.append(r.request.url), r.fulfill(status=404, body='')))
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:200]) if 'test : export arrêté ici' not in str(e) else None)
    pg.goto(base + ('' if lang == 'en' else 'fr/'), wait_until='load')
    pg.wait_for_function('window.__ev && window.MP4Box', timeout=20000)
    pg.locator('#demoBtn').click()
    pg.wait_for_function('() => __ev("S.step === 4 && S.cuts.length > 0")', timeout=60000)
    ev(pg, "window.__flat = (() => { const c = document.createElement('canvas'); c.width = 1080; c.height = 1920; const x = c.getContext('2d'); x.fillStyle = '#7a8fa8'; x.fillRect(0, 0, 1080, 1920); return c; })()")

    # ---- Gratuit, no account (Comptes' own acctHas, signed out) ----
    ev(pg, "ACCT.state.user = null, acctOpen = (why, o) => { window.__open = [why, o && o.plan || null]; }, textGate(), planTags(), filtUI(), wmUI()")
    note = pg.locator('#outroNote')
    want_p = 'No watermark → Pro' if lang == 'en' else 'Sans filigrane → Pro'
    check(tag + ' gratuit : note du filigrane et « ' + want_p + ' » visibles', note.is_visible() and pg.locator('#outroPro').is_visible() and pg.locator('#outroPro').inner_text().strip() == want_p, pg.locator('#outroPro').inner_text())
    check(tag + ' gratuit : un seul bouton « Exporter », plus de bouton pub', pg.locator('#adBtn').count() == 0 and pg.locator('#expRow button').count() == 1)
    et = ' '.join(pg.locator('#exportBtn').inner_text().split())
    check(tag + ' gratuit : texte du bouton', et == ('Export with watermark' if lang == 'en' else 'Exporter avec filigrane'), et)
    pb, eb = pg.locator('#outroPro').bounding_box(), pg.locator('#exportBtn').bounding_box()
    check(tag + ' gratuit : « ' + want_p + ' » juste à côté du bouton', pb and eb and 0 <= pb['y'] - (eb['y'] + eb['height']) < 90, (eb, pb))
    o = lock(pg, "setFilter('nb', true), exportOne()")
    check(tag + ' gratuit : export sans compte, sans écran du jour', o == [None, True] and ev(pg, 'S.wm === true') and pg.locator('#dayDone').count() == 0, o)
    check(tag + ' gratuit : plus de fin Stalak de 3 s', ev(pg, 'outroOn() === false'))
    # the watermark (06/11): the mascot and « stalak.app », about 17 % of the width, in the preview; it jumps from corner to
    # corner every 5 s (never seen gliding), always inside the part TikTok and Instagram do not cover
    s1, s4, s5, s6, s11, s16 = (wm_spot(pg, t) for t in (1.0, 4.9, 5.1, 6.0, 11.0, 16.0))
    check(tag + ' gratuit : filigrane dans l’aperçu, en haut à droite au début', s1 is not None and s1[2] > 850 and s1[1] < 260, s1)
    ww, hh = (s1[2] - s1[0], s1[3] - s1[1]) if s1 else (0, 0)
    check(tag + ' gratuit : environ 14 % de la largeur (06/11), la mascotte et « stalak.app » dessous', 0.125 * 1080 <= ww <= 0.165 * 1080 and 0.95 < hh / max(ww, 1) < 1.3, (ww, hh))
    check(tag + ' gratuit : il ne glisse pas (même place de 1 à 4,9 s)', s4 is not None and abs(s4[0] - s1[0]) < 4 and abs(s4[1] - s1[1]) < 4, (s1, s4))
    check(tag + ' gratuit : il saute d’un coup à 5 s (en bas à gauche)', s5 is not None and s6 is not None and all(abs(u - v) < 4 for u, v in zip(s5[:4], s6[:4])) and s5[0] < 120 and s5[1] > 1150, (s5, s6))
    check(tag + ' gratuit : puis en bas à droite, puis en haut à gauche (jamais au milieu, où sont les paroles)', s11 is not None and s16 is not None and s11[2] > 850 and s11[1] > 1150 and s16[0] < 120 and s16[1] < 260, (s11, s16))
    # TikTok / Instagram (tools/contact_sheet.py): top 8 %, bottom 20 %, right 12 % (a few px of soft shadow allowed)
    inside = all(sp and sp[1] >= 0.08 * 1920 - 6 and sp[3] <= 0.80 * 1920 + 8 and sp[2] <= 0.88 * 1080 + 8 for sp in (s1, s5, s11, s16))
    check(tag + ' gratuit : les 4 coins hors des zones cachées par TikTok et Instagram', inside, (s1, s5, s11, s16))
    # padlocks: the right plan
    check(tag + ' gratuit : « ou passe à Pro » → Pro', lock(pg, "$('#outroPro').click()")[0] == ['nowm', 'pro'])
    check(tag + ' gratuit : karaoké → Pro', lock(pg, "document.querySelector('#stAnim button[data-v=\"kara\"]').click()")[0] == ['text', 'pro'])
    check(tag + ' gratuit : taille L → Pro', lock(pg, "document.querySelector('#stSize button[data-v=\"l\"]').click()")[0] == ['text', 'pro'])
    check(tag + ' gratuit : mode Clip → Pro', lock(pg, "document.querySelector('#kindSeg button[data-v=\"clip\"]').click()")[0] == ['clip', 'pro'])
    ev(pg, "filtAsk = async () => 'pro'")   # (audit 30/10) the question « Pro, or without this filter »: answered Pro here (audit_ui.py tests it)
    check(tag + ' gratuit : filtre Pro à l’export → Pro', lock(pg, "setFilter('demon', true), exportOne()") == [['filters', 'pro'], False])
    check(tag + ' gratuit : pack → Creator Plus', lock(pg, "setFilter('nb', true), $('#packSel').value = '10', exportPack()")[0] == ['pack', 'creator'])
    check(tag + ' gratuit : paroles automatiques → Pro', lock(pg, "lockOpen('lyrics')")[0] == ['lyrics', 'pro'])
    tags = pg.evaluate("""() => ({ clip: document.querySelector('#kindSeg button[data-v="clip"]').dataset.plan, pack: document.querySelector('#packBtn').dataset.plan,
      kara: document.querySelector('#stAnim button[data-v="kara"]').dataset.plan, filt: document.querySelectorAll('#filtRow .filtpro').length,
      filtTag: (document.querySelector('#filtRow .filtpro') || {}).textContent })""")
    check(tag + ' gratuit : étiquettes PRO / CREATOR+', tags['clip'] == 'PRO' and tags['pack'] == 'CREATOR+' and tags['kara'] == 'PRO' and tags['filt'] == 5 and tags['filtTag'] == 'PRO', tags)
    pk = pg.evaluate("""() => { const b = document.querySelector('#packBtn'), a = getComputedStyle(b, '::after'), z = getComputedStyle(b, '::before');
      return [b.classList.contains('protag'), z.content, a.content, a.backgroundImage, parseFloat(a.fontSize), a.display]; }""")
    check(tag + ' gratuit : « Générer le pack » avec cadenas et CREATOR+ bien visibles', pk[0] and '🔒' in pk[1] and 'CREATOR+' in pk[2] and 'gradient' in pk[3] and pk[4] >= 11 and pk[5] != 'none', pk)
    tip = pg.locator('.packtip').inner_text()
    check(tag + ' gratuit : conseil du pack (dès 2 prises, plus de prises = plus varié)', ('2 takes' in tip and 'more varied' in tip) if lang == 'en' else ('2 playbacks' in tip and 'plus les vidéos sont variées' in tip), tip)
    if SHOTS:
        pg.locator('#outroNote').scroll_into_view_if_needed()
        pg.locator('#expRow').screenshot(path=os.path.join(SHOTS, 'boutons-' + ('iphone' if iphone else 'ordi') + '-' + lang + '.png'))
        pg.locator('#packBtn').scroll_into_view_if_needed(); pg.locator('#packBtn').screenshot(path=os.path.join(SHOTS, 'pack-' + ('iphone' if iphone else 'ordi') + '-' + lang + '.png'))
        ev(pg, "showFrame(1.0)"); pg.wait_for_timeout(400); pg.locator('#view').screenshot(path=os.path.join(SHOTS, 'filigrane-' + ('iphone' if iphone else 'ordi') + '-' + lang + '.png'))

    # ---- Pro ----
    plan(pg, 'pro')
    check(tag + ' pro : pas de filigrane, ni note ni lien', not pg.locator('#outroNote').is_visible() and ev(pg, 'wmOn() === false') and wm_spot(pg, 1.0) is None)
    check(tag + ' pro : Clip, karaoké, filtres ouverts', ev(pg, "can('clip') && textFree('anim', 'kara') && !filtLocked()") and pg.locator('#filtRow .filtpro').count() == 0)
    check(tag + ' pro : pack → Creator Plus', lock(pg, "$('#packSel').value = '5', planTags(), exportPack()")[0] == ['pack', 'creator'])
    # ---- Creator Plus ----
    plan(pg, 'creator')
    ev(pg, "$('#packSel').value = '30', planTags()")
    check(tag + ' creator : packs sans cadenas', not pg.evaluate("() => document.querySelector('#packBtn').classList.contains('protag')") and ev(pg, "can('pack30')"))
    n = ev(pg, 'readyTakes().length')
    o = lock(pg, "S.__takes = S.takes, S.takes = S.takes.filter(t => !t.broll).slice(0, 1), exportPack()")
    msg = pg.locator('#status').inner_text(); ev(pg, 'S.takes = S.__takes')
    check(tag + ' creator : pack avec 1 playback → « au moins 2 » et le conseil', o == [None, False] and '2' in msg and ('more varied' in msg if lang == 'en' else 'variées' in msg), (n, o, msg))
    o = lock(pg, "$('#status').textContent = '', S.__takes = S.takes, S.takes = S.takes.filter(t => !t.broll).slice(0, 2), exportPack()")
    msg = pg.locator('#status').inner_text(); ev(pg, 'S.takes = S.__takes')
    check(tag + ' creator : pack avec 2 playbacks accepté', o[0] is None and 'at least 2' not in msg and 'au moins 2' not in msg, (n, o, msg))
    # ---- Comptes' own acctHas again ----
    ev(pg, "acctHas = window.__real, ACCT.state.user = null, planTags()")
    st = ev(pg, "[wmOn(), can('clip'), can('nowm'), S.exporting, exportGate]")
    check(tag + ' fonctions de Comptes, sans compte : gratuit avec filigrane', st[0] is True and st[1] is False, st)
    o = lock(pg, "setFilter('nb', true), exportOne()")
    check(tag + ' fonctions de Comptes, sans compte : export sans compte', o == [None, True], o)
    check(tag + ' le script de pub de Google n’est jamais chargé', not gpt, gpt)
    check(tag + ' aucune erreur dans la page', not errs, errs)
    sw = pg.evaluate('document.documentElement.scrollWidth')
    check(tag + ' pas de défilement horizontal', sw <= pg.viewport_size['width'], sw)
    ctx.close()


def engine(b, base):
    """the watermark is the same in the preview, the export's 2D canvas and its WebGL drawing; a real export carries it"""
    ctx = b.new_context(viewport={'width': 1280, 'height': 860}, locale='fr-FR'); pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.goto(base + 'fr/', wait_until='load'); pg.wait_for_function('window.__ev && window.MP4Box', timeout=20000)
    pg.locator('#demoBtn').click(); pg.wait_for_function('() => __ev("S.step === 4 && S.cuts.length > 0")', timeout=60000)
    ev(pg, "ACCT.state.user = null")
    r = ev(pg, """(() => {
      const c0 = document.createElement('canvas'); c0.width = 1080; c0.height = 1920; const x0 = c0.getContext('2d'); const gr = x0.createLinearGradient(0, 0, 1080, 1920); gr.addColorStop(0, '#203a80'); gr.addColorStop(1, '#e0a050'); x0.fillStyle = gr; x0.fillRect(0, 0, 1080, 1920);
      const pic = { img: c0, w: 1080, h: 1920, rot: 0 }, take = { kind: 'video', offset: 0, duration: 999, live: null, el: { readyState: 0 }, color: '#fff', name: 't' };
      const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
      const small = src => { const c = mk(270, 480); c.getContext('2d').drawImage(src, 0, 0, 270, 480); return c.getContext('2d').getImageData(0, 0, 270, 480).data; };
      const diff = (a, b) => { let s = 0; for (let i = 0; i < a.length; i += 4) for (let k = 0; k < 3; k++) s += Math.abs(a[i+k] - b[i+k]); return s / (a.length / 4 * 3); };
      const oldLy = S.lyrics.mode; S.lyrics.mode = 'none'; const out = {};
      for (const t of [1, 6.6, 9]){
        setRes(0.5); drawFrame(g, { take }, t, false, pic); const pv = small(view);
        S.exporting = true; S.wm = true; setRes(1); drawFrame(g, { take }, t, false, pic); const e2 = small(view);
        const R = expGL(); const eg = small(R.video(pic, 1, t, false)); R.close(); S.wm = false; const R2 = expGL(); const none = small(R2.video(pic, 1, t, false)); R2.close(); S.exporting = false;
        setRes(0.5); out[t] = [diff(pv, e2), diff(e2, eg), diff(eg, none)];
      }
      S.lyrics.mode = oldLy; return out; })()""")
    for t, (a, b2, c) in r.items():
        check('filigrane à %s s : aperçu = export 2D (écart %.2f), export WebGL = export 2D (%.2f), présent dans l’export (%.2f)' % (t, a, b2, c), a < 3 and b2 < 2 and c > 0.05, (a, b2, c))
    # a real export of a free video: the watermark is drawn in every picture
    ev(pg, "window.__wmN = 0, (() => { const w0 = wmDraw; wmDraw = function(){ window.__wmN++; return w0.apply(this, arguments); }; })(), lastBlob = null")
    aok = pg.evaluate('async () => { await __ev("exportOne()"); return [__ev("!!lastBlob"), window.__wmN]; }')
    check('export d’une vidéo gratuite : le filigrane est dans chaque image', aok[0] and aok[1] > 100, aok)
    check('moteur : aucune erreur dans la page', not errs, errs)
    ctx.close()


def main():
    tmp = tempfile.mkdtemp(prefix='stalak-formules-')
    site = os.path.join(tmp, 'site'); shutil.copytree(PUBLIC, site)
    for page in ('index.html', 'fr/index.html'):
        p = os.path.join(site, page); html = open(p, encoding='utf-8').read()
        assert 'applyLang();\n})();' in html, 'repère de la sonde introuvable'
        open(p, 'w', encoding='utf-8').write(html.replace('applyLang();\n})();', 'applyLang();\nwindow.__ev = (s) => eval(s);\n})();'))
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=site))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = 'http://127.0.0.1:%d/' % srv.server_address[1]
    with sync_playwright() as p:
        b = p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
        global PW; PW = p
        only = os.environ.get('FORMULES_ONLY')   # e.g. « ordi-fr »: one run only (while debugging)
        for lang in ('fr', 'en'):
            for iphone in (True, False):
                if only and only != ('iphone' if iphone else 'ordi') + '-' + lang: continue
                try: run(b, base, lang, iphone)
                except Exception as e: check(('iPhone' if iphone else 'ordinateur') + ' ' + lang + ' : déroulé complet', False, str(e)[:300])
        if not only:
          try: engine(b, base)
          except Exception as e: check('moteur : déroulé complet', False, str(e)[:300])
        b.close()
    srv.shutdown(); shutil.rmtree(tmp, ignore_errors=True)
    print('%d/%d réussis' % (sum(results), len(results)))
    sys.exit(0 if all(results) else 1)


main()
