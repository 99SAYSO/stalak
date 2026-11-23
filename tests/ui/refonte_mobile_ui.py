"""Test of the mobile redesign, lot 1 (Chef de projet, 23/11: docs/handoff/chef-refonte-mobile-app.md). Python Playwright
(chromium), the server imitated.

    python3 /abs/path/tests/ui/refonte_mobile_ui.py <built public/ folder> [folder for screenshots]

Checked, in French and English:
- on a phone (iPhone 12, iPhone SE): the text is in DM Sans (titles and buttons in Lilita One); the home screen: the pitch chosen
  on 23/11 signed out (one main button, blue with an ink outline and a hard shadow, wholly in the first screen with the example
  link), the greeting, the formula and « Nouveau montage » signed in, « Tes derniers montages » for Creator Plus; the bar at the
  bottom (Accueil, Montages, « + », Stats, Compte): each button does its job, 44 px at least, the current one is marked, nothing
  of the page hides under it at the end of the page; it stays on « Montages » and « Compte », leaves for the sign-in, the plans
  and as soon as a song is there (the editor: header, steps and every setting of step 1 back as before);
- the opening « le glaçon »: once per session, the home screen underneath at the end, a touch passes it, never with « reduce
  motion », never on a computer; GSAP comes from the site (no outside address);
- on a computer (1280 px): no bar, no opening, Rubik, the header as before;
- nothing wider than the screen, no error in the page."""
import functools, http.server, json, os, shutil, subprocess, sys, tempfile, threading
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.sync_api import sync_playwright

PUBLIC = os.path.abspath(sys.argv[1])
SHOTS = sys.argv[2] if len(sys.argv) > 2 else None
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
results = []
T = {'fr': {'tabs': ['Accueil', 'Montages', 'Stats', 'Compte'], 'plus': 'Nouveau montage', 'hi': 'Salut Clément', 'song': 'Choisir mon son', 'ex': 'Voir un exemple',
            'new': 'Nouveau montage', 'last': 'Tes derniers montages', 'pill': 'Stalak Pro', 'gal': 'Galerie', 'acc': 'Ton compte'},
     'en': {'tabs': ['Home', 'Edits', 'Stats', 'Account'], 'plus': 'New edit', 'hi': 'Hey Clément', 'song': 'Choose my song', 'ex': 'See an example',
            'new': 'New edit', 'last': 'Your latest edits', 'pill': 'Stalak Pro', 'gal': 'Gallery', 'acc': 'Your account'}}


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


def check(name, ok, info=''):
    results.append(bool(ok))
    print(('PASS ' if ok else 'FAIL ') + name + (('  — ' + str(info)) if info and not ok else ''), flush=True)


def ev(pg, code):
    return pg.evaluate('s => __ev(s)', code)


ENT = json.loads(subprocess.run(['node', '--input-type=module', '-e',
    "import('" + os.path.join(ROOT, 'functions/_lib/entitlements.js') + "').then(m => console.log(JSON.stringify({ free: m.entitlementsOf('free'), pro: m.entitlementsOf('pro'), creator: m.entitlementsOf('creator') })))"],
    capture_output=True, text=True, check=True).stdout)
CFG = {'paddle': {'environment': 'sandbox', 'clientToken': 'test_x', 'prices': {'pro': {'month': 'pri_pm', 'year': 'pri_py'}, 'creator': {'month': 'pri_cm', 'year': 'pri_cy'}, 'month': 'pri_pm', 'year': 'pri_py'}},
       'plans': {'pro': {'month': {'amount': '7.99', 'currency': 'USD'}, 'year': {'amount': '49.99', 'currency': 'USD'}},
                 'creator': {'month': {'amount': '14.99', 'currency': 'USD'}, 'year': {'amount': '99.99', 'currency': 'USD'}}},
       'features': {'socialConnect': False, 'social': [], 'cloudSave': True}, 'auth': {'providers': [], 'passwordMin': 8, 'turnstile': None}}
USER = {'id': 'u1', 'email': 'clement@example.com', 'displayName': 'Clément', 'createdAt': '2026-01-01T00:00:00Z', 'hasPassword': True}
PROJECTS = {'projects': [{'id': 'p%d' % i, 'name': n, 'updatedAt': '2026-11-2%dT10:00:00Z' % i, 'size': 1000, 'coverUrl': None} for i, n in enumerate(['Freestyle #3', 'Snippet love', 'Drill test', 'Vieux projet'])],
            'storage': {'available': True, 'used': 4000, 'quota': 10 ** 9, 'partSize': 5 * 2 ** 20, 'maxFile': 10 ** 9}}


def ME(kind):
    if kind == 'out': return {'user': None, 'session': None, 'entitlements': ENT['free'], 'subscription': None}
    plan = {'in': 'free', 'creator': 'creator'}[kind]
    return {'user': USER, 'session': {}, 'entitlements': ENT[plan], 'subscription': None if plan == 'free' else {'status': 'active', 'plan': plan, 'interval': 'year', 'currentPeriodEnd': '2027-11-01T00:00:00Z', 'cancelAt': None}}


def page(b, PW, base, lang, dev, me, splash=False, calm=False):
    opts = dict(PW.devices[dev]) if dev != 'ordinateur' else {'viewport': {'width': 1280, 'height': 860}}
    ctx = b.new_context(**opts, locale='en-US' if lang == 'en' else 'fr-FR', reduced_motion='reduce' if calm else 'no-preference')
    out = []
    def api(r):
        u = r.request.url.split('?')[0]
        if u.endswith('/api/config'): return r.fulfill(status=200, content_type='application/json', body=json.dumps(CFG))
        if u.endswith('/api/me'): return r.fulfill(status=200, content_type='application/json', body=json.dumps(ME(me)))
        if u.endswith('/api/projects'): return r.fulfill(status=200, content_type='application/json', body=json.dumps(PROJECTS))
        return r.fulfill(status=204, body='')
    ctx.route('**/api/**', api)
    ctx.on('request', lambda r: out.append(r.url) if not r.url.startswith(base) and not r.url.startswith('data:') and not r.url.startswith('blob:') else None)
    if splash: ctx.add_init_script('window.__stalakSplash = 1')
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.goto(base + ('' if lang == 'en' else 'fr/'), wait_until='load'); pg.wait_for_function('window.__ev && window.MP4Box', timeout=60000)
    if me != 'out': pg.wait_for_function('() => __ev("!!ACCT.state.user")', timeout=20000)
    if not splash: pg.wait_for_timeout(900)
    if me == 'creator': pg.wait_for_timeout(1400); ev(pg, "typeof ptClose === 'function' && ptClose()"); pg.wait_for_timeout(500)   # « Merci ! » (shown once to a new subscriber)
    return ctx, pg, errs, out


def box(pg, sel):
    return pg.evaluate('''s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(), c = getComputedStyle(e);
        return { top: r.top, bottom: r.bottom, left: r.left, right: r.right, w: r.width, h: r.height, shown: c.display !== 'none' && c.visibility !== 'hidden' && r.width > 0 && r.height > 0,
          font: c.fontFamily, bg: c.backgroundColor, border: c.borderTopWidth + ' ' + c.borderTopColor, shadow: c.boxShadow, text: (e.innerText || '').replace(/\\u00a0|\\u202f/g, ' ').trim() }; }''', sel)


def shot(pg, name):
    if SHOTS: pg.screenshot(path=os.path.join(SHOTS, name + '.png'))


def wide(pg):
    return pg.evaluate('() => [document.documentElement.scrollWidth, innerWidth]')


def phone(b, PW, base, site, lang, dev):
    t = T[lang]; key = dev.replace(' ', '').lower() + '-' + lang
    # ---- signed out: the pitch, one main button, the bar ----
    tag = dev + ' ' + lang + ' (déconnecté)'
    ctx, pg, errs, out = page(b, PW, base, lang, dev, 'out')
    vh = pg.evaluate('innerHeight')
    f = pg.evaluate('''() => ({ body: getComputedStyle(document.body).fontFamily, p: getComputedStyle(document.querySelector('.hero-s2')).fontFamily, h1: getComputedStyle(document.querySelector('.hero-h1')).fontFamily,
        btn: getComputedStyle(document.querySelector('#heroSong')).fontFamily, ok: document.fonts.check('500 16px "DM Sans"') })''')
    check(tag + ' : le texte est en DM Sans, les titres et le bouton en Lilita One', f['body'].startswith('"DM Sans"') and f['p'].startswith('"DM Sans"') and 'Lilita One' in f['h1'] and 'Lilita One' in f['btn'] and f['ok'], f)
    bar, song, ex, h1 = box(pg, '#tabBar'), box(pg, '#heroSong'), box(pg, '#heroDemo'), box(pg, '.hero-h1')
    check(tag + ' : la barre du bas est là, collée en bas, sur toute la largeur', bar['shown'] and abs(bar['bottom'] - vh) < 1 and bar['left'] == 0 and abs(bar['right'] - pg.evaluate('innerWidth')) < 1, bar)
    labels = pg.evaluate('''() => [...document.querySelectorAll('#tabBar [data-tab]')].map(b => [b.dataset.tab, (b.innerText || '').trim(), b.getAttribute('aria-label'), b.getBoundingClientRect().width, b.getBoundingClientRect().height, b.getAttribute('aria-current')])''')
    check(tag + ' : 5 boutons : ' + ', '.join(t['tabs'][:2]) + ', « + », ' + ', '.join(t['tabs'][2:]), [l[0] for l in labels] == ['home', 'gallery', 'new', 'stats', 'account'] and [l[1] for l in labels if l[0] != 'new'] == t['tabs'] and labels[2][2] == t['plus'], labels)
    check(tag + ' : chaque bouton de la barre fait au moins 44 px, « Accueil » est marqué', all(l[3] >= 44 and l[4] >= 44 for l in labels) and labels[0][5] == 'page' and not any(l[5] for l in labels[1:]), labels)
    plus = box(pg, '#tabBar .tab-plus')
    check(tag + ' : le « + » est bleu, à contour noir, et dépasse au-dessus de la barre', plus['bg'] == 'rgb(31, 111, 214)' and 'rgb(10, 13, 20)' in plus['border'] and plus['top'] < bar['top'] and plus['w'] >= 60, plus)
    check(tag + ' : premier écran : le titre, « ' + t['song'] + ' » et « ' + t['ex'] + ' » en entier au-dessus de la barre', h1['shown'] and h1['top'] >= 0 and song['shown'] and t['song'] in song['text'] and ex['shown'] and t['ex'] in ex['text'] and ex['bottom'] <= bar['top'] + 1 and song['bottom'] < ex['top'] + 1, [h1, song, ex, bar])
    check(tag + ' : le bouton principal est bleu, à contour noir et ombre dure noire, large d’un pouce', song['bg'] == 'rgb(31, 111, 214)' and 'rgb(10, 13, 20)' in song['border'] and 'rgb(10, 13, 20) 0px 6px 0px 0px' in song['shadow'] and song['h'] >= 56 and song['w'] >= pg.evaluate('innerWidth') * 0.8, song)
    prim = pg.evaluate('''() => [...document.querySelectorAll('.wrap .btn.primary, .wrap .mh-new')].filter(e => { const r = e.getBoundingClientRect(); return e.offsetParent && r.bottom > 0 && r.top < innerHeight; }).map(e => e.id)''')
    check(tag + ' : un seul bouton principal dans le premier écran', prim == ['heroSong'], prim)
    hid = pg.evaluate('''() => ['.wrap > header', '#songDrop', '#demoBtn', '#next1', '#mhNew', '#mhHi', '#stepper'].filter(s => { const e = document.querySelector(s); return e && e.offsetParent; })''')
    check(tag + ' : ni en-tête, ni étapes, ni carte du son sur l’accueil (ils reviennent dans l’éditeur)', not hid, hid)
    pill = box(pg, '#mhPill')
    check(tag + ' : la formule en haut à droite (« ' + t['pill'] + ' », 44 px), elle ouvre les formules', pill['shown'] and pill['text'] == t['pill'] and pill['h'] >= 44, pill)
    w = wide(pg); check(tag + ' : rien de plus large que l’écran', w[0] <= w[1], w)
    shot(pg, 'rm1-accueil-deconnecte-' + key)
    # the end of the page: nothing under the bar
    pg.evaluate('window.scrollTo(0, document.documentElement.scrollHeight)'); pg.wait_for_timeout(500)
    last = pg.evaluate('''() => { const bar = document.querySelector('#tabBar').getBoundingClientRect(); let low = 0, who = '';
        for (const e of document.querySelectorAll('.ft a, .ft button, .ft p')){ const r = e.getBoundingClientRect(); if (r.height && r.bottom > low){ low = r.bottom; who = (e.innerText || '').trim().slice(0, 30); } }
        return [low, bar.top, who]; }''')
    check(tag + ' : en bas de page, rien du pied de page sous la barre', last[0] <= last[1] + 1, last)
    pg.evaluate('window.scrollTo(0, 0)'); pg.wait_for_timeout(200)
    # the formula → the plans (the bar leaves), back
    pg.locator('#mhPill').click(); pg.wait_for_timeout(700)
    st = pg.evaluate('''() => [document.documentElement.className, getComputedStyle(document.querySelector('#tabBar')).display, !document.querySelector('#apPro').hidden]''')
    check(tag + ' : la formule ouvre l’écran des formules, sans la barre', st[2] and (st[1] == 'none' or 'mfull' in st[0]), st)
    ev(pg, 'apHide()'); pg.wait_for_timeout(700)
    # « Montages » and « Compte » signed out: the sign-in, full screen
    for tab in ('gallery', 'account', 'stats'):
        pg.locator('#tabBar [data-tab="%s"]' % tab).click(); pg.wait_for_timeout(600)
        st = pg.evaluate('''() => [!document.querySelector('#apLogin').hidden, document.documentElement.classList.contains('mfull')]''')
        check(tag + ' : « ' + tab + ' » demande de se connecter (plein écran, sans la barre)', st == [True, True], st)
        ev(pg, 'apHide()'); pg.wait_for_timeout(600)
    # « + » and the main button open the choice of the song
    for sel, name in (('#tabBar .tab-plus', '« + »'), ('#heroSong', '« ' + t['song'] + ' »')):
        with pg.expect_file_chooser(timeout=5000) as fc: pg.locator(sel).click()
        check(tag + ' : ' + name + ' ouvre le choix du son', fc.value is not None)
    # a song: the editor as before, no bar
    fc.value.set_files(os.path.join(site, 'beat.wav')); pg.wait_for_function('() => __ev("!!S.song")', timeout=60000); pg.wait_for_timeout(900)
    ed = pg.evaluate('''() => { const v = s => { const e = document.querySelector(s); return !!e && !!e.offsetParent; }, c = getComputedStyle(document.querySelector('#tabBar'));
        return { cls: document.documentElement.className, bar: c.display, header: v('.wrap > header'), steps: v('#stepper'), next: v('#next1'), kind: v('#kindSeg'), wave: v('#wave'), bars: v('#barsSel'), beat: v('#beatFix'), drop: v('#songDrop'),
          demo: v('#demoBtn'), acct: v('#acctBtn'), price: v('#priceBtn'), hero: v('#heroPitch'), top: v('#mhTop'), bg: getComputedStyle(document.documentElement).backgroundColor }; }''')
    check(tag + ' : avec un son : plus de barre, l’en-tête et les 4 étapes reviennent', 'medit' in ed['cls'] and ed['bar'] == 'none' and ed['header'] and ed['steps'] and ed['acct'] and not ed['hero'] and not ed['top'], ed)
    check(tag + ' : étape Son : aucun réglage ne manque (TikTok / Clip, onde, durée, rythme, changer de son, exemple, Continuer)', all(ed[k] for k in ('kind', 'wave', 'bars', 'beat', 'drop', 'demo', 'next')), ed)
    check(tag + ' : l’éditeur garde son fond bleu', ed['bg'] == 'rgb(31, 111, 214)', ed['bg'])
    shot(pg, 'rm1-etape-son-' + key)
    check(tag + ' : aucune erreur dans la page', not errs, errs[:3])
    check(tag + ' : aucune adresse extérieure appelée (GSAP et polices viennent du site)', not out, out[:3])
    ctx.close()

    # ---- signed in (free): the greeting, « Nouveau montage », the pages with the bar ----
    tag = dev + ' ' + lang + ' (connecté)'
    ctx, pg, errs, out = page(b, PW, base, lang, dev, 'in')
    vh = pg.evaluate('innerHeight')
    hi, new, bar = box(pg, '#mhHiT'), box(pg, '#mhNew'), box(pg, '#tabBar')
    check(tag + ' : « ' + t['hi'] + ' » en haut, la formule à droite', hi['shown'] and hi['text'] == t['hi'] and box(pg, '#mhPill')['shown'], hi)
    check(tag + ' : la carte « ' + t['new'] + ' » : bleue, contour noir, ombre dure, en entier au-dessus de la barre', new['shown'] and t['new'] in new['text'] and new['bg'] == 'rgb(31, 111, 214)' and 'rgb(10, 13, 20) 0px 6px 0px 0px' in new['shadow'] and new['bottom'] <= bar['top'], new)
    check(tag + ' : le pitch des visiteurs, les avis et « c’est quoi » ne sont plus là', not box(pg, '#heroPitch')['shown'] and not pg.evaluate('''() => [...document.querySelectorAll('.bands, .proof')].some(e => e.offsetParent)'''))
    prim = pg.evaluate('''() => [...document.querySelectorAll('.wrap .btn.primary, .wrap .mh-new')].filter(e => { const r = e.getBoundingClientRect(); return e.offsetParent && r.bottom > 0 && r.top < innerHeight; }).map(e => e.id)''')
    check(tag + ' : un seul bouton principal', prim == ['mhNew'], prim)
    w = wide(pg); check(tag + ' : rien de plus large que l’écran', w[0] <= w[1], w)
    shot(pg, 'rm1-accueil-connecte-' + key)
    with pg.expect_file_chooser(timeout=5000) as fc: pg.locator('#mhNew').click()
    check(tag + ' : la carte ouvre le choix du son', fc.value is not None)
    pg.locator('#tabBar [data-tab="gallery"]').click(); pg.wait_for_timeout(800)
    st = pg.evaluate('''() => ({ view: !document.querySelector('#apGallery').hidden, bar: getComputedStyle(document.querySelector('#tabBar')).display, cur: [...document.querySelectorAll('#tabBar [aria-current]')].map(b => b.dataset.tab),
        top: document.elementFromPoint(40, innerHeight - 20).closest('#tabBar') !== null, cube: !!document.querySelector('#helpBtn').offsetParent && getComputedStyle(document.querySelector('#helpBtn')).display !== 'none' })''')
    check(tag + ' : « ' + t['tabs'][1] + ' » ouvre la galerie, la barre reste au-dessus et marque l’onglet', st['view'] and st['bar'] == 'flex' and st['cur'] == ['gallery'] and st['top'], st)
    shot(pg, 'rm1-montages-' + key)
    pg.locator('#tabBar [data-tab="account"]').click(); pg.wait_for_timeout(800)
    st = pg.evaluate('''() => ({ view: !document.querySelector('#apAccount').hidden, cur: [...document.querySelectorAll('#tabBar [aria-current]')].map(b => b.dataset.tab) })''')
    check(tag + ' : « ' + t['tabs'][3] + ' » ouvre le compte, onglet marqué', st['view'] and st['cur'] == ['account'], st)
    low = pg.evaluate('''() => { const p = document.querySelector('#acctPage'); p.scrollTop = p.scrollHeight; const bar = document.querySelector('#tabBar').getBoundingClientRect(); let low = 0;
        for (const e of p.querySelectorAll('#apAccount button, #apAccount a')){ const r = e.getBoundingClientRect(); if (e.offsetParent && r.bottom > low) low = r.bottom; } return [low, bar.top]; }''')
    check(tag + ' : en bas du compte, aucun bouton sous la barre', low[0] <= low[1] + 1, low)
    pg.locator('#tabBar [data-tab="home"]').click(); pg.wait_for_timeout(800)
    st = pg.evaluate('''() => ({ page: document.querySelector('#acctPage').hidden, cur: [...document.querySelectorAll('#tabBar [aria-current]')].map(b => b.dataset.tab), cls: document.documentElement.className })''')
    check(tag + ' : « ' + t['tabs'][0] + ' » revient à l’accueil', st['page'] and st['cur'] == ['home'] and 'mpage' not in st['cls'], st)
    check(tag + ' : aucune erreur dans la page', not errs, errs[:3])
    ctx.close()

    # ---- Creator Plus: « Tes derniers montages » ----
    tag = dev + ' ' + lang + ' (Creator Plus)'
    ctx, pg, errs, out = page(b, PW, base, lang, dev, 'creator')
    pg.wait_for_function('''() => document.querySelectorAll('#mhList li').length > 0''', timeout=15000); pg.wait_for_timeout(300)
    ls = pg.evaluate('''() => ({ t: (document.querySelector('#mhLastT').innerText || '').trim(), shown: !!document.querySelector('#mhLastT').offsetParent, names: [...document.querySelectorAll('#mhList b')].map(b => b.textContent),
        w: [...document.querySelectorAll('#mhList button')].map(b => Math.round(b.getBoundingClientRect().width)), pill: (document.querySelector('#mhPill').innerText || '').trim() })''')
    check(tag + ' : « ' + t['last'] + ' » : les 3 derniers, côte à côte', ls['shown'] and ls['t'] == t['last'] and ls['names'] == ['Freestyle #3', 'Snippet love', 'Drill test'] and len(set(ls['w'])) == 1 and ls['w'][0] >= 80, ls)
    check(tag + ' : la pastille dit la formule (Creator Plus)', ls['pill'] == 'Creator Plus', ls['pill'])
    w = wide(pg); check(tag + ' : rien de plus large que l’écran', w[0] <= w[1], w)
    shot(pg, 'rm1-accueil-creator-' + key)
    check(tag + ' : aucune erreur dans la page', not errs, errs[:3])
    ctx.close()


def opening(b, PW, base, lang, dev):
    tag = dev + ' ' + lang + ' (ouverture)'
    ctx, pg, errs, out = page(b, PW, base, lang, dev, 'out', splash=True)
    st = pg.evaluate('''() => ({ on: document.documentElement.classList.contains('splash-on'), el: !!document.querySelector('#splash'), gsap: !!window.gsap, src: [...document.scripts].map(s => s.src).filter(s => /gsap/.test(s)) })''')
    check(tag + ' : le rideau bleu est là, GSAP vient du site', st['el'] and st['on'] and len(st['src']) == 1 and '/vendor/gsap-' in st['src'][0], st)
    if SHOTS:
        for i, ms in enumerate((700, 900, 800, 700, 500)):
            pg.wait_for_timeout(ms); pg.screenshot(path=os.path.join(SHOTS, 'rm1-ouverture-%s-%d.png' % (lang, i + 1)))
    pg.wait_for_function('window.__stalakSplashDone === true', timeout=12000)
    st = pg.evaluate('''() => ({ on: document.documentElement.classList.contains('splash-on'), el: !!document.querySelector('#splash'), m: getComputedStyle(document.querySelector('.hero-m')).visibility,
        left: [...document.querySelectorAll('.hero-h1, #heroSong, #tabBar, #mhPill')].map(e => [e.style.opacity, e.style.transform, e.style.filter].join('|')), bar: getComputedStyle(document.querySelector('#tabBar')).display })''')
    check(tag + ' : à la fin, l’accueil est là, rien ne reste du rideau ni de l’animation', not st['on'] and not st['el'] and st['m'] == 'visible' and all(x in ('||', '|none|', '|none|none', '||none') for x in st['left']) and st['bar'] == 'flex', st)
    shot(pg, 'rm1-ouverture-%s-fin' % lang)
    pg.reload(wait_until='load'); pg.wait_for_timeout(600)
    check(tag + ' : une seule fois par session (pas rejouée en rechargeant)', not pg.evaluate('''() => !!document.querySelector('#splash')'''))
    check(tag + ' : aucune erreur dans la page', not errs, errs[:3])
    ctx.close()
    # a touch passes it
    ctx, pg, errs, out = page(b, PW, base, lang, dev, 'out', splash=True)
    pg.wait_for_function('!!window.gsap', timeout=8000); pg.wait_for_timeout(700)
    t0 = pg.evaluate('performance.now()'); pg.touchscreen.tap(190, 300)
    pg.wait_for_function('window.__stalakSplashDone === true', timeout=8000)
    took = pg.evaluate('performance.now()') - t0
    check(tag + ' : un toucher la passe (l’accueil en moins de 2,5 s)', took < 2500, took)
    ctx.close()
    # how long it lasts, left alone (no screenshot meanwhile: they hold the page back)
    ctx, pg, errs, out = page(b, PW, base, lang, dev, 'out', splash=True)
    pg.wait_for_function('window.__stalakSplashDone === true', timeout=12000)
    dur = pg.evaluate('window.__stalakSplashMs')
    check(tag + ' : elle dure entre 4,5 et 6,5 s, chargement compris', 4500 <= dur <= 6500, dur)
    ctx.close()
    # never with « reduce motion »
    ctx, pg, errs, out = page(b, PW, base, lang, dev, 'out', splash=True, calm=True)
    st = pg.evaluate('''() => [!!document.querySelector('#splash'), !!window.gsap, getComputedStyle(document.querySelector('#tabBar')).display]''')
    check(tag + ' : avec « réduire les animations » : pas d’ouverture, GSAP pas chargé, l’accueil directement', st == [False, False, 'flex'], st)
    ctx.close()


def computer(b, PW, base, lang):
    tag = 'ordinateur ' + lang
    ctx, pg, errs, out = page(b, PW, base, lang, 'ordinateur', 'in', splash=True)
    st = pg.evaluate('''() => { const v = s => { const e = document.querySelector(s); return !!e && getComputedStyle(e).display !== 'none'; };
        return { bar: v('#tabBar'), top: v('#mhTop'), new: v('#mhNew'), last: v('#mhLastT'), splash: !!document.querySelector('#splash'), gsap: !!window.gsap, header: v('.wrap > header'), steps: v('#stepper'),
          font: getComputedStyle(document.body).fontFamily, drop: !!document.querySelector('#songDrop').offsetParent, bg: getComputedStyle(document.documentElement).backgroundColor }; }''')
    check(tag + ' : ni barre, ni accueil de téléphone, ni ouverture, GSAP pas chargé', not st['bar'] and not st['top'] and not st['new'] and not st['last'] and not st['splash'] and not st['gsap'], st)
    check(tag + ' : comme avant : en-tête, étapes, carte du son, Rubik, fond bleu', st['header'] and st['steps'] and st['drop'] and st['font'].startswith('Rubik') and st['bg'] == 'rgb(31, 111, 214)', st)
    w = wide(pg); check(tag + ' : rien de plus large que l’écran', w[0] <= w[1], w)
    check(tag + ' : aucune erreur dans la page', not errs, errs[:3])
    ctx.close()


def main():
    tmp = tempfile.mkdtemp(prefix='stalak-rm-')
    site = os.path.join(tmp, 'site'); shutil.copytree(PUBLIC, site)
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from _probe import add_probe; add_probe(site)
    ff = shutil.which('ffmpeg'); beat = "0.8*sin(2*PI*60*t)*exp(-25*mod(t,0.5))+0.15*sin(2*PI*440*t)"
    subprocess.run([ff, '-nostdin', '-v', 'error', '-y', '-f', 'lavfi', '-i', "aevalsrc='%s':s=44100:d=8" % beat, '-ac', '1', os.path.join(site, 'beat.wav')], check=True)
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=site))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = 'http://127.0.0.1:%d/' % srv.server_address[1]
    with sync_playwright() as p:
        b = p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'])
        jobs = [(phone, ('fr', 'iPhone 12')), (phone, ('en', 'iPhone SE')), (opening, ('fr', 'iPhone 12')), (opening, ('en', 'iPhone SE')), (computer, ('fr',)), (computer, ('en',))]
        for fn, a in jobs:
            try:
                if fn is phone: fn(b, p, base, site, *a)
                else: fn(b, p, base, *a)
            except Exception as e: check(' '.join(a) + ' : déroulé complet (' + fn.__name__ + ')', False, str(e)[:500])
        b.close()
    srv.shutdown(); shutil.rmtree(tmp, ignore_errors=True)
    print('%d/%d réussis' % (sum(results), len(results)))
    sys.exit(0 if all(results) else 1)


main()
