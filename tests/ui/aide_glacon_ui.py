"""Test of the two buttons of the help ice cube on a phone (owner, 26/11: « Talk to a human » looked like a stuck tab and « Copy
info for the team » like a dashed block; docs/handoff/chef-aide-glacon-26-11.md). Python Playwright, the test server
(tests/ui/cloud-server.mjs), 390 px, French and English.

    python3 /abs/path/tests/ui/aide_glacon_ui.py http://127.0.0.1:<port> [folder for screenshots]

- « Parler à un humain »: a real Stalak button, blue, ink outline all round, hard shadow, the width of the question box, 44 px
  high at least, right under it;
- « Copier les infos pour l'équipe »: a quiet link under it (no border, no dashes, no white block), 44 px to tap, centred;
- the « Découvrir Creator Plus » of the bubble: blue Stalak button too, never black;
- both on the screen, nothing goes off the side, no error."""
import os, sys
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.sync_api import sync_playwright

BASE = sys.argv[1].rstrip('/'); S = sys.argv[2] if len(sys.argv) > 2 else None
results = []
UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
T = {'fr': ('Parler à un humain', 'Copier les infos pour l’équipe', 'Découvrir Creator Plus'), 'en': ('Talk to a human', 'Copy info for the team', 'Discover Creator Plus')}


def check(name, ok, info=''):
    results.append(bool(ok))
    print(('PASS ' if ok else 'FAIL ') + name + (('  — ' + str(info)) if info and not ok else ''))


with sync_playwright() as p:
    b = p.chromium.launch()
    for lang in ('fr', 'en'):
        tag = 'iPhone 390 ' + lang
        ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True, locale='fr-FR' if lang == 'fr' else 'en-US', user_agent=UA)
        ctx.add_init_script("window.__stalakM3on = 1; window.__stalakM4on = 1; try { localStorage.setItem('stalak:onb', JSON.stringify({ v: 2, done: 1, sent: 1, a: { artistName: 'T' } })); localStorage.setItem('stalak:tuto', '1'); } catch (e) {}")
        pg = ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
        to = '/fr/' if lang == 'fr' else '/'
        pg.goto(BASE + '/__test/login?email=aide-%s@example.com&pro=0&to=%s' % (lang, to))
        uid = pg.evaluate("() => fetch('/api/me').then(r => r.json()).then(d => d.user && d.user.id)")
        pg.evaluate("id => localStorage.setItem('stalak:proThanks:' + id, '1')", uid); pg.goto(BASE + to); pg.wait_for_timeout(2500)
        pg.locator('#helpBtn').click(); pg.wait_for_timeout(900)
        r = pg.evaluate("""() => { const g = s => { const e = document.querySelector(s), c = getComputedStyle(e), r = e.getBoundingClientRect();
            return { t: e.textContent.trim(), x: r.left, y: r.top, w: r.width, h: r.height, b: r.bottom, bg: c.backgroundColor, bt: c.borderTopStyle + ' ' + c.borderTopWidth, bb: c.borderBottomStyle + ' ' + c.borderBottomWidth, bl: c.borderLeftStyle, sh: c.boxShadow, td: c.textDecorationLine }; };
            return { h: g('#helpHuman'), d: g('#helpDiag'), f: g('#helpForm'), vw: innerWidth, vh: innerHeight, hs: document.documentElement.scrollWidth > innerWidth + 1 }; }""")
        h, d, f = r['h'], r['d'], r['f']
        check(tag + ' : « %s » : un vrai bouton bleu, contour noir tout autour, ombre dure' % T[lang][0], h['t'] == T[lang][0] and h['bg'] == 'rgb(31, 111, 214)' and h['bt'] == 'solid 3px' and h['bb'] == 'solid 3px' and h['bl'] == 'solid' and 'px' in h['sh'] and h['h'] >= 44, h)
        check(tag + ' : il a la largeur de la zone de question, juste dessous', abs(h['w'] - f['w']) <= 2 and abs(h['x'] - f['x']) <= 2 and 0 <= h['y'] - f['b'] <= 24, [h, f])
        check(tag + ' : « %s » : un lien discret (ni contour, ni pointillés, ni bloc blanc), centré, 44 px à toucher' % T[lang][1], d['t'] == T[lang][1] and d['bg'] == 'rgba(0, 0, 0, 0)' and d['bt'].startswith('none') and d['td'] == 'underline' and d['h'] >= 44 and abs((d['x'] + d['w'] / 2) - r['vw'] / 2) <= 2 and d['y'] >= h['b'], d)
        check(tag + ' : les deux dans l’écran, rien ne dépasse sur le côté', d['b'] <= r['vh'] and not r['hs'], r)
        if S: pg.screenshot(path=os.path.join(S, 'aide-ouvert-%s.png' % lang))
        pg.locator('#helpHuman').click(); pg.wait_for_timeout(1200)
        c = pg.evaluate("""() => { const e = [...document.querySelectorAll('#helpLog .hp-msg .btn.primary')].pop(); if (!e) return null; const c = getComputedStyle(e); return [e.textContent.trim(), c.backgroundColor, c.borderTopWidth, e.getBoundingClientRect().height]; }""")
        check(tag + ' : « %s » dans la bulle : bouton bleu Stalak, jamais noir' % T[lang][2], c and c[0] == T[lang][2] and c[1] == 'rgb(31, 111, 214)' and c[2] == '3px' and c[3] >= 44, c)
        if S: pg.screenshot(path=os.path.join(S, 'aide-humain-%s.png' % lang))
        check(tag + ' : aucune erreur dans la page', not errs, errs)
        ctx.close()
    b.close()
print('%d/%d réussis' % (sum(results), len(results)))
sys.exit(0 if all(results) else 1)
