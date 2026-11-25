"""Test of the export screen on a phone (owner, 25/11: « Vidéo d'export j'aime pas… igloo, banquise », then « oui mais enlève
l'ours » on the mock-up docs/audit/maquettes/export-igloo-2026-11-25). Python Playwright, the test server
(tests/ui/cloud-server.mjs), iPhone 13 in French and iPhone SE in English.

    python3 /abs/path/tests/ui/export_igloo_ui.py http://127.0.0.1:<port> [folder for screenshots]

- « Stalak construit ton igloo », the night sky with its aurora, the mascot carrying the blocks;
- the igloo built block by block with the progress;
- at the end: « Igloo terminé ! Ta vidéo est prête », the door gold, the mascot cheering, confetti (none with « reduce motion »);
- no bear; « Annuler » can be reached; no error."""
import os, sys
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.sync_api import sync_playwright

BASE = sys.argv[1].rstrip('/')
SHOTS = sys.argv[2] if len(sys.argv) > 2 else None
results = []
T = {'fr': ('Stalak construit ton igloo', 'Igloo terminé ! Ta vidéo est prête'), 'en': ('Stalak is building your igloo', 'Igloo finished! Your video is ready')}


def check(name, ok, info=''):
    results.append(bool(ok))
    print(('PASS ' if ok else 'FAIL ') + name + (('  — ' + str(info)) if info and not ok else ''))


def ev(pg, c):
    return pg.evaluate('s => __ev(s)', c)


def run(b, p, dev, lang, calm=False):
    tag = dev + ' ' + lang + (' (réduire les animations)' if calm else '')
    ctx = b.new_context(**p.devices[dev], locale='fr-FR' if lang == 'fr' else 'en-US', reduced_motion='reduce' if calm else 'no-preference')
    ctx.add_init_script("window.__stalakM3on = 1; window.__stalakM4on = 1; try { localStorage.setItem('stalak:onb', JSON.stringify({ v: 2, done: 1, sent: 1, a: { artistName: 'T' } })); localStorage.setItem('stalak:tuto', '1'); } catch (e) {}")
    pg = ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    to = '/fr/' if lang == 'fr' else '/'
    pg.goto(BASE + '/__test/login?email=igloo-%s-%s%s@example.com&pro=0&to=%s' % (dev.replace(' ', ''), lang, '-calm' if calm else '', to)); pg.goto(BASE + to)
    pg.wait_for_function('() => !!window.StalakM && !!window.__ev', timeout=30000); pg.wait_for_timeout(1500)
    pg.locator('#mhEx:visible, #heroDemo:visible, #demoBtn:visible').first.click()
    pg.wait_for_function('() => __ev("S.step === 4 && S.cuts.length > 0")', timeout=240000); pg.wait_for_timeout(800)
    ev(pg, 'expOpen()'); pg.wait_for_timeout(400)
    s = pg.evaluate("() => [document.querySelector('#expTitle').textContent, !!document.querySelector('#expScreen .m3-aur'), getComputedStyle(document.querySelector('#expScreen')).backgroundImage.includes('gradient')]")
    check(tag + ' : « %s », le ciel de nuit et ses aurores' % T[lang][0], s == [T[lang][0], True, True], s)
    ons = []
    for q in (0.1, 0.5, 0.9):
        ev(pg, 'EXP_SM.hist = [], expUpdate(%s)' % q); pg.wait_for_timeout(900)
        ons.append(pg.evaluate("() => document.querySelectorAll('#expIgloo .ex-blk.on').length"))
        if SHOTS and q == 0.5: pg.screenshot(path=os.path.join(SHOTS, 'igloo-%s-%s.png' % (dev.replace(' ', ''), lang)))
    check(tag + ' : l’igloo se construit bloc par bloc avec l’avancement (%s)' % ons, ons[0] < ons[1] < ons[2], ons)
    ok = pg.evaluate("() => { const sc = document.querySelector('#expScreen'); sc.scrollTop = sc.scrollHeight; const r = document.querySelector('#expCancel').getBoundingClientRect(); return r.bottom <= innerHeight && r.height > 30; }")
    check(tag + ' : « Annuler » se voit (en faisant défiler si besoin)', ok)
    check(tag + ' : pas d’ours', pg.locator('#expScreen img[src*="ours"]').count() == 0)
    ev(pg, "$('#result').hidden = true, expClose(true)"); pg.wait_for_timeout(700)
    f = pg.evaluate("""() => { const m = getComputedStyle(document.querySelector('#expMascot')); return [document.querySelector('#expTitle').textContent, getComputedStyle(document.querySelector('#expDoor')).fill, m.backgroundImage.includes('hype'), document.querySelectorAll('.m3-igfx i').length]; }""")
    if SHOTS: pg.screenshot(path=os.path.join(SHOTS, 'igloo-fin-%s-%s%s.png' % (dev.replace(' ', ''), lang, '-calm' if calm else '')))
    check(tag + ' : la fin : « %s », la porte dorée, la mascotte qui fête' % T[lang][1], f[:3] == [T[lang][1], 'rgb(255, 210, 63)', True], f)
    check(tag + (' : pas de confettis' if calm else ' : des confettis'), (f[3] == 0) if calm else f[3] >= 20, f[3])
    check(tag + ' : aucune erreur dans la page', not errs, errs)
    ctx.close()


with sync_playwright() as p:
    b = p.chromium.launch()
    for a in (('iPhone 13', 'fr'), ('iPhone SE', 'en'), ('iPhone 13', 'fr', True)):
        try: run(b, p, *a)
        except Exception as e: check(' '.join(str(x) for x in a) + ' : déroulé complet', False, str(e)[:400])
    b.close()
print('%d/%d réussis' % (sum(results), len(results)))
sys.exit(0 if all(results) else 1)
