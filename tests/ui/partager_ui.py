"""Test of « Partager » at the export (owner, 05/11, « comme CapCut »). Python Playwright (chromium).

    python3 /abs/path/tests/ui/partager_ui.py <built public/ folder> [folder for screenshots]

- iPhone (390 px) and Android (Pixel 7): « Partager » is the main button. It opens the phone's share list with the video file
  (one MP4 file, the very video made), its hint says to pick TikTok or Instagram, and « Copier la légende » (with « made with
  stalak.app ») is right under it. The download is a small « Télécharger le fichier » link.
- Closing the share list changes nothing. If the phone refuses to share the file, the download comes back as the main button.
- A phone that cannot share a file, and a computer (1280 px) even when its browser could share: the download as before.
- The same for the free plan and for Pro. French and English, no sideways scrolling, no error.
The phone's share list is replaced by a stand-in: the test sees what Stalak hands to it."""
import functools, http.server, os, shutil, sys, tempfile, threading
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.sync_api import sync_playwright

PUBLIC = os.path.abspath(sys.argv[1])
SHOTS = sys.argv[2] if len(sys.argv) > 2 else None
results = []
PW = None
FAST_EXPORT = """pickVideoConfig = async () => null;
  renderRealtime = async () => { await new Promise(r => setTimeout(r, 120)); return { blob: new Blob([new Uint8Array(4096)], { type: 'video/mp4' }), ext: 'mp4' }; }"""
TXT = {
    'fr': {'share': 'Partager', 'file': 'Télécharger le fichier', 'save': 'Enregistrer sur l\'appareil', 'copied': 'copiée', 'sent': 'Envoyé', 'noshare': 'partage direct'},
    'en': {'share': 'Share', 'file': 'Download the file', 'save': 'Save to device', 'copied': 'copied', 'sent': 'Sent', 'noshare': 'Direct sharing'},
}


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


def check(name, ok, info=''):
    results.append(ok)
    print(('PASS ' if ok else 'FAIL ') + name + (('  — ' + str(info)) if info and not ok else ''))


def ev(pg, code):
    return pg.evaluate('s => __ev(s)', code)


LAYOUT_JS = """() => {
  const q = s => document.querySelector(s), vis = e => !!e && !e.closest('[hidden]') && e.getClientRects().length > 0;
  const box = q('#shareBox');
  return { box: vis(box), kids: [...box.children].map(e => e.id), after: box.nextElementSibling && box.nextElementSibling.id,
           share: vis(q('#shareBtn')), shareTxt: q('#shareBtn').textContent.trim(), shareCls: q('#shareBtn').className,
           save: vis(q('#saveBtn')), saveTxt: q('#saveBtn').textContent.trim(), saveCls: q('#saveBtn').className,
           post: vis(q('#postBox')), hint: q('#postHint').textContent, cap: vis(q('#capCopy')), capTxt: q('#capText').value,
           sw: document.documentElement.scrollWidth, vw: document.documentElement.clientWidth };
}"""


def make_video(pg, pro=False, share='ok'):
    """the example song, then an export (made fast: the video itself is tested elsewhere)"""
    pg.evaluate("""mode => { window.__share = null;
      navigator.canShare = d => mode !== 'nofile' && !!(d && d.files && d.files.length);
      navigator.share = async d => { window.__share = { n: d.files.length, name: d.files[0].name, type: d.files[0].type, size: d.files[0].size, text: d.text || null };
        if (mode === 'abort') throw new DOMException('closed', 'AbortError');
        if (mode === 'refuse') throw new DOMException('not allowed', 'NotAllowedError'); }; }""", share)
    if not ev(pg, 'S.step === 4 && S.cuts.length > 0'):
        pg.locator('#demoBtn').click(); pg.wait_for_function('() => __ev("S.step === 4 && S.cuts.length > 0")', timeout=60000)
    ev(pg, "store.set(PP_KEY, Date.now()), setFilter('none', true), S.noShare = false, " + FAST_EXPORT.replace('\n', ' ')
       + (", acctHas = f => true" if pro else ""))
    pg.evaluate('() => { window.__p = __ev("exportOne()"); }')
    pg.wait_for_function('() => __ev("!S.exporting && !!lastBlob")', timeout=30000); pg.wait_for_timeout(400)


def phone(b, base, lang, dev):
    tag = dev + ' ' + lang
    d = dict(PW.devices['iPhone 12' if dev == 'iPhone' else 'Pixel 7'])
    ctx = b.new_context(**d, locale='en-US' if lang == 'en' else 'fr-FR')
    try: ctx.grant_permissions(['clipboard-read', 'clipboard-write'])
    except Exception: pass
    ctx.route('**/api/event', lambda r: r.fulfill(status=204, body=''))
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.goto(base + ('' if lang == 'en' else 'fr/'), wait_until='load'); pg.wait_for_function('typeof window.__ev === "function"', timeout=20000)
    T = TXT[lang]
    make_video(pg)
    pg.wait_for_function('() => document.querySelector("#expScreen").hidden', timeout=10000); pg.wait_for_timeout(900)
    v = pg.evaluate('''() => { const st = document.querySelector('.work .stage').getBoundingClientRect(), b = document.querySelector('#shareBtn').getBoundingClientRect();
      return { stage: Math.round(st.bottom), top: Math.round(b.top), bottom: Math.round(b.bottom), h: innerHeight, focus: document.activeElement && document.activeElement.id }; }''')
    check(tag + ' : la vidéo prête, « ' + T['share'] + ' » arrive à l’écran, juste sous l’aperçu', v['top'] >= v['stage'] - 1 and v['bottom'] <= v['h'] and v['top'] - v['stage'] < 60 and v['focus'] == 'shareBtn', v)
    if SHOTS: pg.screenshot(path=os.path.join(SHOTS, 'tel-' + dev.lower() + '-' + lang + '.png'))
    L = pg.evaluate(LAYOUT_JS)
    check(tag + ' : « ' + T['share'] + ' » en grand bouton principal, en premier', L['box'] and L['share'] and L['shareTxt'] == T['share'] and 'primary' in L['shareCls'] and 'big' in L['shareCls'], L)
    check(tag + ' : dessous, l’explication (TikTok ou Instagram) puis la légende à copier', L['kids'] == ['shareBtn', 'postHint', 'capBox'] and 'TikTok' in L['hint'] and 'Instagram' in L['hint'] and L['cap'], L)
    check(tag + ' : le téléchargement devient un petit lien « ' + T['file'] + ' », sous le partage', L['after'] == 'saveRow' and L['save'] and L['saveTxt'] == T['file'] and 'linkbtn' in L['saveCls'], L)
    check(tag + ' : plus de liens vers les sites des réseaux (le partage du téléphone les remplace)', not L['post'], L)
    check(tag + ' : légende courte avec « made with stalak.app »', 'made with stalak.app' in L['capTxt'] and '#madewithstalak' in L['capTxt'] and len(L['capTxt']) < 140, L['capTxt'])
    pg.locator('#capCopy').click(); pg.wait_for_timeout(300)
    clip = pg.evaluate('() => navigator.clipboard.readText().catch(() => null)')
    check(tag + ' : « Copier la légende » copie le texte', T['copied'] in pg.locator('#capNote').inner_text() and (clip is None or clip == L['capTxt']), (pg.locator('#capNote').inner_text(), clip))
    check(tag + ' : pas de défilement de côté (' + str(L['vw']) + ' px)', L['sw'] <= L['vw'], L)
    if SHOTS:
        pg.locator('#result').scroll_into_view_if_needed(); pg.wait_for_timeout(200)
        pg.locator('#result').screenshot(path=os.path.join(SHOTS, 'partager-' + dev.lower() + '-' + lang + '.png'))
    size = ev(pg, 'lastBlob.size')
    pg.locator('#shareBtn').click(); pg.wait_for_timeout(300)
    s = pg.evaluate('window.__share')
    check(tag + ' : « ' + T['share'] + ' » ouvre le partage du téléphone avec le fichier vidéo (la vidéo faite, en MP4)',
          s and s['n'] == 1 and s['type'] == 'video/mp4' and s['name'].endswith('.mp4') and s['size'] == size and not s['text'], s)
    check(tag + ' : après le partage, « ' + T['sent'] + ' »', T['sent'] in pg.locator('#postHint').inner_text())
    # closing the share list: nothing changes
    make_video(pg, share='abort'); pg.locator('#shareBtn').click(); pg.wait_for_timeout(300)
    L2 = pg.evaluate(LAYOUT_JS)
    check(tag + ' : fermer le partage sans choisir ne change rien', L2['box'] and L2['share'] and not L2['post'] and T['sent'] not in L2['hint'], L2)
    # Pro: the same
    make_video(pg, pro=True)
    L3 = pg.evaluate(LAYOUT_JS)
    check(tag + ' : Pro : le même « ' + T['share'] + ' »', L3['box'] and L3['share'] and L3['kids'] == ['shareBtn', 'postHint', 'capBox'], L3)
    # the phone refuses to share the file: the download comes back as the main button
    make_video(pg, share='refuse'); pg.locator('#shareBtn').click(); pg.wait_for_timeout(300)
    L4 = pg.evaluate(LAYOUT_JS)
    check(tag + ' : partage refusé par le téléphone → « ' + T['save'] + ' » redevient le bouton principal, avec une explication',
          not L4['box'] and not L4['share'] and L4['saveTxt'] == T['save'] and 'primary' in L4['saveCls'] and L4['post'] and T['noshare'] in L4['hint'] and L4['cap'], L4)
    check(tag + ' : aucune erreur dans la page', not errs, errs)
    ctx.close()
    # a phone that cannot share a file
    ctx = b.new_context(**d, locale='en-US' if lang == 'en' else 'fr-FR')
    ctx.route('**/api/event', lambda r: r.fulfill(status=204, body=''))
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.goto(base + ('' if lang == 'en' else 'fr/'), wait_until='load'); pg.wait_for_function('typeof window.__ev === "function"', timeout=20000)
    make_video(pg, share='nofile')
    L5 = pg.evaluate(LAYOUT_JS)
    check(tag + ' : téléphone qui ne sait pas partager un fichier → « ' + T['save'] + ' » comme aujourd’hui',
          not L5['box'] and not L5['share'] and L5['saveTxt'] == T['save'] and 'primary' in L5['saveCls'] and L5['post'] and L5['cap'], L5)
    check(tag + ' : aucune erreur dans la page (sans partage de fichier)', not errs, errs)
    ctx.close()


def computer(b, base, lang):
    tag = 'ordinateur ' + lang
    ctx = b.new_context(viewport={'width': 1280, 'height': 860}, locale='en-US' if lang == 'en' else 'fr-FR')
    try: ctx.grant_permissions(['clipboard-read', 'clipboard-write'])
    except Exception: pass
    ctx.route('**/api/event', lambda r: r.fulfill(status=204, body=''))
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.goto(base + ('' if lang == 'en' else 'fr/'), wait_until='load'); pg.wait_for_function('typeof window.__ev === "function"', timeout=20000)
    T = TXT[lang]
    for pro in (False, True):
        make_video(pg, pro=pro)   # (its browser says it could share a file: a computer keeps the download all the same)
        L = pg.evaluate(LAYOUT_JS)
        check(tag + (' Pro' if pro else ' gratuit') + ' : « ' + T['save'] + ' » reste le bouton principal, pas de bouton Partager',
              not L['box'] and not L['share'] and L['saveTxt'] == T['save'] and 'primary' in L['saveCls'] and L['post'], L)
        check(tag + (' Pro' if pro else ' gratuit') + ' : la légende à copier, avec « made with stalak.app »', L['cap'] and 'made with stalak.app' in L['capTxt'], L['capTxt'])
    pg.locator('#capCopy').click(); pg.wait_for_timeout(300)
    check(tag + ' : « Copier la légende » copie le texte', T['copied'] in pg.locator('#capNote').inner_text())
    check(tag + ' : pas de défilement de côté', L['sw'] <= L['vw'], L)
    if SHOTS:
        pg.locator('#result').scroll_into_view_if_needed(); pg.wait_for_timeout(200)
        pg.locator('#result').screenshot(path=os.path.join(SHOTS, 'partager-ordi-' + lang + '.png'))
    check(tag + ' : aucune erreur dans la page', not errs, errs)
    ctx.close()


def main():
    global PW
    tmp = tempfile.mkdtemp(prefix='stalak-partager-')
    site = os.path.join(tmp, 'site'); shutil.copytree(PUBLIC, site)
    for page in ('index.html', 'fr/index.html'):
        p = os.path.join(site, page); html = open(p, encoding='utf-8').read()
        assert 'applyLang();\n})();' in html, 'repère de la sonde introuvable'
        open(p, 'w', encoding='utf-8').write(html.replace('applyLang();\n})();', 'applyLang();\nwindow.__ev = (s) => eval(s);\n})();'))
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=site))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = 'http://127.0.0.1:%d/' % srv.server_address[1]
    with sync_playwright() as p:
        PW = p
        b = p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'])
        for lang in ('fr', 'en'):
            for dev in ('iPhone', 'Android'):
                try: phone(b, base, lang, dev)
                except Exception as e: check(dev + ' ' + lang + ' : déroulé complet', False, str(e)[:300])
            try: computer(b, base, lang)
            except Exception as e: check('ordinateur ' + lang + ' : déroulé complet', False, str(e)[:300])
        b.close()
    srv.shutdown(); shutil.rmtree(tmp, ignore_errors=True)
    print('%d/%d réussis' % (sum(results), len(results)))
    sys.exit(0 if all(results) else 1)


main()
