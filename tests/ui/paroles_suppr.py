"""Test of the « ✕ » that deletes a lyric line (« Paroles » step, list of the timed lines), with « Annuler ». Python Playwright (chromium) + ffmpeg.

    python3 /abs/path/tests/ui/paroles_suppr.py <path of a built public/ folder> [folder for screenshots]

Phone (390 px, touch) and computer (1280 px), in French and in English."""
import functools, http.server, os, shutil, subprocess, sys, tempfile, threading
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.sync_api import sync_playwright

PUBLIC = os.path.abspath(sys.argv[1])
SHOTS = sys.argv[2] if len(sys.argv) > 2 else None
results = []
LINES = ['Première phrase du couplet', 'Deuxième phrase à enlever', 'Troisième phrase', 'Quatrième phrase']


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


def check(name, ok, info=''):
    results.append(ok)
    print(('PASS ' if ok else 'FAIL ') + name + (('  — ' + str(info)) if info and not ok else ''))


def ev(pg, code):
    return pg.evaluate('s => __ev(s)', code)


def run(b, base, lang, phone):
    tag = ('téléphone' if phone else 'ordinateur') + ' ' + lang
    ctx = b.new_context(viewport={'width': 390, 'height': 844} if phone else {'width': 1280, 'height': 800},
                        has_touch=phone, is_mobile=phone, locale='en-US' if lang == 'en' else 'fr-FR')
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:160]))
    pg.goto(base + ('en/' if lang == 'en' else ''), wait_until='load')
    pg.wait_for_function('window.__ev && window.MP4Box', timeout=20000)
    pg.set_input_files('#songFile', os.path.join(SITE, 'beat.wav'))
    pg.wait_for_function('() => __ev("!!S.song")', timeout=30000)
    # four timed lines, as after « Caler mes paroles », on the « Paroles » step (where the lines are listed; the step needs a
    # take to be reached, so it is shown directly here)
    ev(pg, "S.lyrics.mode = 'paste', S.lyrics.lines = " + str([{'text': t, 't': 2.0 + 2 * i} for i, t in enumerate(LINES)]).replace("'", '"') + ", S.step = 3, $('#p1').hidden = true, $('#work').hidden = false, $('#p3').hidden = false, lyricsView(), renderLines()")
    pg.wait_for_timeout(300)
    n = pg.locator('#lyLines .lydel').count()
    check(tag + ' : une croix par ligne', n == len(LINES), n)
    lab = pg.locator('#lyLines .lydel').nth(1).get_attribute('aria-label')
    check(tag + ' : la croix dit ce qu’elle fait', lab == ('Delete line 2' if lang == 'en' else 'Supprimer la ligne 2'), lab)
    # nothing sticks out of its line, nothing scrolls sideways
    over = pg.evaluate("""() => [...document.querySelectorAll('#lyLines li')].filter(li => { const r = li.getBoundingClientRect(); return [...li.querySelectorAll('button,input')].some(e => { const q = e.getBoundingClientRect(); return q.right > r.right + 1 || q.width < 20; }); }).length""")
    check(tag + ' : boutons dans la ligne, assez larges', over == 0, over)
    pg.locator('#lyLines').scroll_into_view_if_needed()
    if SHOTS: pg.locator('#lyEdit').screenshot(path=os.path.join(SHOTS, 'paroles-' + ('tel' if phone else 'ordi') + '-' + lang + '.png'))
    btn = pg.locator('#lyLines .lydel').nth(1)
    if phone: btn.tap()
    else: btn.click()
    pg.wait_for_timeout(200)
    left = ev(pg, 'S.lyrics.lines.map(l => l.text)')
    check(tag + ' : la bonne ligne est supprimée', left == [LINES[0], LINES[2], LINES[3]], left)
    check(tag + ' : liste et zone de texte à jour', pg.locator('#lyLines li').count() == 3 and pg.locator('#lyText').input_value().split('\n') == left)
    stt = pg.locator('#status').inner_text()
    check(tag + ' : message avec « Annuler »', LINES[1] in stt and ('Undo' if lang == 'en' else 'Annuler') in stt, stt)
    # the deletion is kept for this song (saved like any lyric edit)
    kept = ev(pg, 'JSON.stringify(store.get(lyricsKey()) || S.lyrics.lines).includes(' + repr(LINES[1]).replace("'", '"') + ')')
    check(tag + ' : suppression enregistrée', ev(pg, 'S.song.demo') or not kept)
    u = pg.locator('#status .lyundo')
    if phone: u.tap()
    else: u.click()
    pg.wait_for_timeout(200)
    back = ev(pg, 'S.lyrics.lines.map(l => l.text)')
    check(tag + ' : « Annuler » remet la ligne à sa place', back == LINES and pg.locator('#lyLines li').count() == 4, back)
    # the last line too, then the list is empty but the page holds
    for _ in range(4): pg.locator('#lyLines .lydel').first.click(); pg.wait_for_timeout(100)
    check(tag + ' : toutes les lignes supprimables', ev(pg, 'S.lyrics.lines.length') == 0)
    sw = pg.evaluate('document.documentElement.scrollWidth')
    check(tag + ' : pas de défilement horizontal', sw <= (390 if phone else 1280), sw)
    check(tag + ' : aucune erreur dans la page', not errs, errs)
    ctx.close()


SITE = None


def main():
    global SITE
    tmp = tempfile.mkdtemp(prefix='stalak-paroles-')
    SITE = os.path.join(tmp, 'site'); shutil.copytree(PUBLIC, SITE)
    for page in ('index.html', 'en/index.html'):
        p = os.path.join(SITE, page); html = open(p, encoding='utf-8').read()
        assert 'applyLang();\n})();' in html, 'repère de la sonde introuvable'
        open(p, 'w', encoding='utf-8').write(html.replace('applyLang();\n})();', 'applyLang();\nwindow.__ev = (s) => eval(s);\n})();'))
    subprocess.run([shutil.which('ffmpeg'), '-nostdin', '-v', 'error', '-y', '-f', 'lavfi', '-i',
                    "aevalsrc='0.8*sin(2*PI*60*t)*exp(-25*mod(t,0.5))+0.15*sin(2*PI*440*t)':s=44100:d=30", '-ac', '1', os.path.join(SITE, 'beat.wav')], check=True)
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=SITE))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = 'http://127.0.0.1:%d/' % srv.server_address[1]
    with sync_playwright() as p:
        b = p.chromium.launch()
        for lang in ('fr', 'en'):
            for phone in (True, False):
                try: run(b, base, lang, phone)
                except Exception as e: check(('téléphone' if phone else 'ordinateur') + ' ' + lang + ' : déroulé complet', False, str(e)[:300])
        b.close()
    srv.shutdown(); shutil.rmtree(tmp, ignore_errors=True)
    print('%d/%d réussis' % (sum(results), len(results)))
    sys.exit(0 if all(results) else 1)


main()
