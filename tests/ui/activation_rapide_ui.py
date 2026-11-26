"""Test of « le wow en moins d'une minute » (docs/handoff/chef-activation-rapide.md, 26/11), on a phone. Python Playwright, the
test server (tests/ui/cloud-server.mjs) with a song beat.wav in its folder; iPhone 13 in French, iPhone SE in English.

    python3 /abs/path/tests/ui/activation_rapide_ui.py http://127.0.0.1:<port>

- the tutorial: 3 screens at most, each with one title and one sentence, « Passer » on the first ones;
- « Montages » empty: the mascot, « Choisir mon son » and the example;
- the wow: the song chosen, « Continuer »: 10 s of HER song on the example's takes, cut on the beat, with « Maintenant, filme les
  tiennes »; then step 2 with no take (nothing of the example kept), once per song;
- the camera: a Stalak screen before the phone's window; refused: how to allow it again, the import instead;
- the steps sent once, anonymous: step_song, step_passage, step_preview (with the time as a bucket); never for the example;
- « Reprendre ton snippet ? » after a reload, the song alone (no take yet), back at step 2."""
import json, os, sys
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.sync_api import sync_playwright

BASE = sys.argv[1].rstrip('/'); SITE_SONG = os.environ.get('SONG')
results = []
T = {'fr': {'gs': 'Choisir mon son', 'wow': 'Ton son, coupé sur le rythme', 'go': 'Maintenant, filme les tiennes', 'cam': 'Ta caméra et ton micro', 'deny': 'La caméra est bloquée', 'lp': 'Reprendre ton snippet ?'},
     'en': {'gs': 'Choose my song', 'wow': 'Your song, cut to the beat', 'go': 'Now film yours', 'cam': 'Your camera and your mic', 'deny': 'The camera is blocked', 'lp': 'Pick up your snippet?'}}


def check(name, ok, info=''):
    results.append(bool(ok))
    print(('PASS ' if ok else 'FAIL ') + name + (('  — ' + str(info)) if info and not ok else ''))


def ev(pg, c):
    return pg.evaluate('s => __ev(s)', c)


def run(b, p, dev, lang):
    tag = dev + ' ' + lang; t = T[lang]
    ctx = b.new_context(**p.devices[dev], locale='fr-FR' if lang == 'fr' else 'en-US')
    ctx.add_init_script("window.__stalakM3on = 1; window.__stalakM4on = 1;")
    pg = ctx.new_page(); errs = []; evs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.on('request', lambda r: evs.append(json.loads(r.post_data or '{}')) if r.url.endswith('/api/event') and r.method == 'POST' else None)
    to = '/fr/' if lang == 'fr' else '/'
    pg.goto(BASE + '/__test/login?email=act-%s-%s@example.com&pro=0&to=%s' % (dev.replace(' ', ''), lang, to))
    uid = pg.evaluate("() => fetch('/api/me').then(r => r.json()).then(d => d.user && d.user.id)")
    pg.evaluate("id => localStorage.setItem('stalak:proThanks:' + id, '1')", uid); pg.goto(BASE + to)
    pg.wait_for_function('() => !!window.StalakM && !!window.__ev', timeout=30000)
    # the tutorial
    pg.wait_for_selector('.m4-tu', timeout=15000); pg.wait_for_timeout(800)
    n = pg.locator('.m4-tu .m4-s').count(); one = pg.evaluate("() => [...document.querySelectorAll('.m4-tu .m4-s')].every(s => s.querySelectorAll('h2').length === 1 && s.querySelectorAll('p').length === 1)")
    check(tag + ' : tutoriel : %d écrans (3 au plus), un seul message chacun, « Passer » dès le début' % n, n <= 3 and one and pg.locator('.m4-skip').is_visible(), [n, one])
    pg.locator('.m4-skip').click(); pg.wait_for_timeout(700)
    # « Montages » empty
    pg.locator('#tabBar [data-tab="gallery"]').click(); pg.wait_for_timeout(1500)
    g = pg.evaluate("() => { const c = document.querySelector('#galStart'); return !!c && !c.hidden && c.offsetParent !== null ? [c.querySelector('#galSong').textContent, !!c.querySelector('img'), !!c.querySelector('#galEx')] : null; }")
    check(tag + ' : « Montages » vide : la mascotte, « %s » et l’exemple' % t['gs'], g == [t['gs'], True, True], g)
    pg.locator('#galSong').click(); pg.wait_for_timeout(1000); pg.keyboard.press('Escape'); pg.wait_for_timeout(500)
    # the song, then the wow
    pg.set_input_files('#songFile', SITE_SONG); pg.wait_for_function('() => __ev("!!S.song")', timeout=30000); pg.wait_for_timeout(1500)
    t0 = pg.evaluate('performance.now()')
    pg.locator('#next1').click()
    pg.wait_for_function('() => { const b = document.querySelector("#wowBox"); return !!b && !b.hidden; }', timeout=60000); pg.wait_for_timeout(600)
    w = ev(pg, "({ step: S.step, wow: S.takes.filter(t => t.wow).length, mine: S.takes.filter(t => !t.wow && !t.broll).length, cuts: S.cuts.length, playing: S.playing, kept: lpWorth() })")
    check(tag + ' : le wow : « %s », ton son coupé sur les prises d’exemple, qui joue' % t['wow'], pg.locator('#wowT').inner_text() == t['wow'] and w['step'] == 4 and w['wow'] == 3 and w['mine'] == 0 and w['cuts'] > 4 and w['playing'], w)
    check(tag + ' : pendant le wow, rien de l’exemple n’est gardé dans le téléphone', w['kept'] is False)
    secs = (pg.evaluate('performance.now()') - t0) / 1000
    check(tag + ' : le wow arrive vite après « Continuer » (%.1f s)' % secs, secs < 15, secs)
    pg.wait_for_timeout(10800)
    check(tag + ' : l’aperçu s’arrête après 10 s', not ev(pg, 'S.playing'))
    pg.locator('#wowGo').click(); pg.wait_for_timeout(1000)
    a = ev(pg, "({ step: S.step, n: S.takes.length })")
    check(tag + ' : « %s » : l’étape des prises, sans aucune prise d’exemple' % t['go'], a == {'step': 2, 'n': 0} and pg.locator('#wowBox').is_hidden(), a)
    ev(pg, 'go(1)'); pg.wait_for_timeout(500); pg.locator('#next1').click(); pg.wait_for_timeout(1500)
    check(tag + ' : une seule fois par son', ev(pg, 'S.step') == 2 and pg.locator('#wowBox').is_hidden())
    # the camera
    pg.locator('#recOpen').click(); pg.wait_for_timeout(700)
    c = pg.evaluate("() => { const b = document.querySelector('#camPrep'); return b && !b.hidden ? [document.querySelector('#camPrepT').textContent, b.querySelectorAll('.cp-btns button').length] : null; }")
    check(tag + ' : avant la fenêtre du téléphone, l’écran Stalak « %s »' % t['cam'], c == [t['cam'], 3], c)
    ev(pg, "(navigator.mediaDevices.getUserMedia = () => Promise.reject(new DOMException('denied', 'NotAllowedError')), true)")
    pg.locator('#camPrep [data-v="go"]').click(); pg.wait_for_timeout(1500)
    d = pg.evaluate("() => { const b = document.querySelector('#camPrep'); return b && !b.hidden ? [document.querySelector('#camPrepT').textContent, document.querySelector('#camPrep .cp-how').textContent.length > 40, !!b.querySelector('[data-v=import]')] : null; }")
    check(tag + ' : refusée : « %s », comment la réautoriser, l’import à la place' % t['deny'], d == [t['deny'], True, True], d)
    pg.locator('#camPrep [data-v="no"]').click(); pg.wait_for_timeout(500)
    # the steps
    names = [e.get('name') for e in evs if str(e.get('name', '')).startswith('step_')]
    pv = [e for e in evs if e.get('name') == 'step_preview']
    check(tag + ' : les étapes envoyées une fois chacune (son, passage, wow avec sa durée)', names.count('step_song') == 1 and names.count('step_passage') == 1 and len(pv) == 1 and pv[0].get('cat') in ('s30', 's60', 's120', 's300', 'slong'), names)
    # « Reprendre ton snippet ? »: the song alone, back at step 2
    pg.wait_for_function('() => __ev("LP.saved != null && !LP.running && LP.pending == null")', timeout=30000)
    pg.reload(); pg.wait_for_function('() => !!window.StalakM && !!window.__ev', timeout=30000)
    pg.wait_for_selector('#lpOffer:not([hidden])', timeout=15000)
    check(tag + ' : après un rechargement, « %s » (le son seul, sans prise)' % t['lp'], pg.locator('#lpOfferT').inner_text() == t['lp'])
    pg.locator('#lpYes').click(); pg.wait_for_function('() => __ev("!!S.song")', timeout=30000); pg.wait_for_timeout(1200)
    r = ev(pg, "({ step: S.step, n: S.takes.length, name: S.song.name })")
    check(tag + ' : « Reprendre » : le son revient, à l’étape où on était (les prises)', r['step'] == 2 and r['n'] == 0 and r['name'] == 'beat', r)
    check(tag + ' : aucune erreur dans la page', not errs, errs)
    ctx.close()


with sync_playwright() as p:
    b = p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
    for a in (('iPhone 13', 'fr'), ('iPhone SE', 'en')):
        try: run(b, p, *a)
        except Exception as e: check(' '.join(a) + ' : déroulé complet', False, str(e)[:400])
    b.close()
print('%d/%d réussis' % (sum(results), len(results)))
sys.exit(0 if all(results) else 1)
