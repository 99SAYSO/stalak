"""Test of « Où est ton son ? » (25/11, Clarity: on an iPhone « Choisir mon son » was tapped 4 times then dropped; the owner
validated the mock-up docs/audit/maquettes/son-2026-11-25). Python Playwright (chromium, an iPhone emulated).

Usage: python3 tests/ui/ou_est_ton_son_ui.py <public dir>

- On a phone, « Choisir mon son » (home, « + », step 1) opens the sheet first, not the file picker: Fichiers, AirDrop /
  WhatsApp, the sound of a video, a voice memo, and the example song in yellow with its button, all on the screen.
- AirDrop / WhatsApp and the voice memo show the steps and « Ouvrir Fichiers »; « ‹ Où est ton son ? » comes back.
- « Le son d'une vidéo » opens a picker of videos; the video's sound becomes the song (step 1), the sheet goes away.
- The example button loads the example. On a computer: the file picker directly, no sheet.
"""
import functools, http.server, os, shutil, subprocess, sys, tempfile, threading
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.sync_api import sync_playwright

PUBLIC = os.path.abspath(sys.argv[1])
results = []
T = {'fr': {'t': 'Où est ton son ?', 'ops': ['Dans Fichiers', 'Reçu par AirDrop ou WhatsApp', 'Le son d’une vidéo', 'Une note vocale'], 'demo': 'Essayer avec le son d’exemple', 'open': 'Ouvrir Fichiers'},
     'en': {'t': 'Where is your song?', 'ops': ['In Files', 'Received by AirDrop or WhatsApp', 'The sound of a video', 'A voice memo'], 'demo': 'Try with the example song', 'open': 'Open Files'}}


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


def check(name, ok, info=''):
    results.append(bool(ok)); print(('PASS ' if ok else 'FAIL ') + name + (('  — ' + str(info)) if info and not ok else ''))


def run(b, PW, base, dev, lang, vid):
    tag = dev + ' ' + lang; t = T[lang]
    c = b.new_context(**PW.devices[dev], locale='fr-FR' if lang == 'fr' else 'en-US')
    c.add_init_script('window.__stalakM3on = 1; window.__stalakM4on = 1; try { localStorage.setItem("stalak:tuto", "1"); } catch (e) {}')
    c.route('**/api/**', lambda r: r.fulfill(status=204, body=''))
    pg = c.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.goto(base + ('fr/' if lang == 'fr' else ''), wait_until='load'); pg.wait_for_function('window.__ev && window.StalakM3', timeout=60000); pg.wait_for_timeout(1000)
    chooser = []; pg.on('filechooser', lambda f: chooser.append(f))
    pg.locator('#mhNew:visible, #heroSong:visible').first.click(); pg.wait_for_timeout(600)
    on = pg.evaluate("() => !!document.querySelector('.m3-son.on')")
    check(tag + ' : « Choisir mon son » ouvre « %s », pas le sélecteur de fichiers' % t['t'], on and not chooser and pg.locator('.m3-son h2').inner_text().strip() == t['t'], [on, len(chooser)])
    ops = pg.locator('.m3-son .op b').all_inner_texts()
    check(tag + ' : 4 choix : Fichiers, AirDrop / WhatsApp, vidéo, note vocale', ops == t['ops'], ops)
    box = pg.evaluate("() => { const g = document.querySelector('.m3-son .go').getBoundingClientRect(), d = document.querySelector('.m3-son .dm'); return [g.bottom <= innerHeight + 1, getComputedStyle(d).backgroundColor, Math.round(g.bottom), innerHeight]; }")
    check(tag + ' : le son d’exemple en jaune et son bouton, visibles sans faire défiler', box[:2] == [True, "rgb(255, 210, 63)"] and pg.locator('.m3-son .go').inner_text().strip() == t['demo'], box)
    pg.locator('.m3-son .op[data-k="wa"]').click(); pg.wait_for_timeout(300)
    check(tag + ' : AirDrop / WhatsApp : les étapes et « %s »' % t['open'], pg.locator('.m3-son ol li').count() == 3 and pg.locator('.m3-son .go').inner_text().strip() == t['open'])
    pg.locator('.m3-son .tb button[data-t="ad"]').click(); pg.wait_for_timeout(200)
    check(tag + ' : onglet AirDrop : ses propres étapes', pg.locator('.m3-son ol li').count() == 2)
    pg.locator('.m3-son .go').click(); pg.wait_for_timeout(400)
    check(tag + ' : « %s » ouvre le sélecteur de fichiers, la feuille se ferme' % t['open'], len(chooser) == 1 and not pg.evaluate("() => document.querySelector('.m3-son').classList.contains('on')"), len(chooser))
    pg.locator('#mhNew:visible, #heroSong:visible').first.click(); pg.wait_for_timeout(400)
    pg.locator('.m3-son .op[data-k="vo"]').click(); pg.wait_for_timeout(200)
    check(tag + ' : note vocale : les étapes de Dictaphone', pg.locator('.m3-son ol li').count() == 3)
    pg.locator('.m3-son .bk').click(); pg.wait_for_timeout(200)
    check(tag + ' : « ‹ %s » revient aux choix' % t['t'], pg.locator('.m3-son .op').count() == 4)
    with pg.expect_file_chooser() as fc: pg.locator('.m3-son .op[data-k="vi"]').click()
    check(tag + ' : « Le son d’une vidéo » : un sélecteur de vidéos', fc.value.element.get_attribute('accept') == 'video/*')
    fc.value.set_files(vid); pg.wait_for_function("() => __ev('!!S.song')", timeout=30000); pg.wait_for_timeout(500)
    check(tag + ' : le son de la vidéo devient le son du montage (étape 1), la feuille s’en va', pg.evaluate("() => __ev('S.step')") == 1 and not pg.evaluate("() => document.querySelector('.m3-son').classList.contains('on')"))
    check(tag + ' : aucune erreur dans la page', not errs, errs)
    c.close()


def computer(b, base):
    c = b.new_context(viewport={'width': 1280, 'height': 800}); c.route('**/api/**', lambda r: r.fulfill(status=204, body=''))
    pg = c.new_page(); pg.goto(base + 'fr/', wait_until='load'); pg.wait_for_function('() => !!window.__ev', timeout=60000); pg.wait_for_timeout(800)
    with pg.expect_file_chooser(timeout=5000) as fc: pg.evaluate("() => __ev('songPick()')")
    check('ordinateur : le sélecteur de fichiers directement, pas de feuille', fc.value is not None and pg.locator('.m3-son.on').count() == 0)
    c.close()


def main():
    tmp = tempfile.mkdtemp(prefix='stalak-son-'); site = os.path.join(tmp, 'site'); shutil.copytree(PUBLIC, site)
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from _probe import add_probe; add_probe(site)
    vid = os.path.join(tmp, 'son.mp4')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'lavfi', '-i', 'color=c=blue:s=320x568:d=6', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=6', '-shortest', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', vid], check=True)
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=site))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = 'http://127.0.0.1:%d/' % srv.server_address[1]
    with sync_playwright() as p:
        b = p.chromium.launch()
        for dev, lang in (('iPhone 13', 'fr'), ('iPhone SE', 'en')):
            try: run(b, p, base, dev, lang, vid)
            except Exception as e: check(dev + ' ' + lang + ' : déroulé complet', False, str(e)[:300])
        try: computer(b, base)
        except Exception as e: check('ordinateur : déroulé complet', False, str(e)[:300])
        b.close()
    srv.shutdown(); shutil.rmtree(tmp, ignore_errors=True)
    print('%d/%d réussis' % (sum(results), len(results)))
    sys.exit(0 if all(results) else 1)


if __name__ == '__main__':
    main()
