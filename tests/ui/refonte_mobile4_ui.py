"""Test of the mobile redesign, lot 4 (24/11): the tutorial, the help ice cube as a chat, the paywall, the end of an export with
the 1 € offer and the screen after a purchase, on a phone (src/mobile4.js). Python Playwright, the test server with real
accounts (tests/ui/cloud-server.mjs).

    node tests/ui/cloud-server.mjs <built public/ folder with the probe> <port>
    python3 /abs/path/tests/ui/refonte_mobile4_ui.py http://127.0.0.1:<port> [folder for screenshots]

iPhone 12 in French, iPhone SE in English; a computer (nothing of this); under test without the flag (nothing either)."""
import json, os, sys
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.sync_api import sync_playwright

BASE = sys.argv[1].rstrip('/')
SHOTS = sys.argv[2] if len(sys.argv) > 2 else None
results = []
FAST_EXPORT = ("pickVideoConfig = async () => null, renderRealtime = async () => { await new Promise(r => setTimeout(r, 120)); "
               "return { blob: new Blob([new Uint8Array(4096)], { type: 'video/mp4' }), ext: 'mp4' }; }")
T = {'fr': {'tt': ['Choisis ton son', 'Filme tes prises', 'Stalak coupe sur le rythme', 'Exporte et poste'], 'next': 'Suivant', 'go': 'C’est parti !', 'skip': 'Passer',
            'again': 'Revoir le tutoriel', 'hT': 'Le glaçon d’aide', 'hS': 'Répond tout de suite', 'pw': 'Fais décoller ton son', 'ts': 'ton son', 'or': 'ou', 'year': 'Pro · à l’année', 'month': 'Pro · au mois',
            'cr': 'Voir Creator Plus (packs, sauvegarde en ligne)', 'thx': 'Bienvenue dans Stalak', 'thxGo': 'Faire un montage', 'thxPlan': 'Voir ma formule'},
     'en': {'tt': ['Pick your song', 'Film your takes', 'Stalak cuts to the beat', 'Export and post'], 'next': 'Next', 'go': 'Let’s go!', 'skip': 'Skip',
            'again': 'See the tutorial again', 'hT': 'The help ice cube', 'hS': 'Answers right away', 'pw': 'Make your song take off', 'ts': 'your song', 'or': 'or', 'year': 'Pro · yearly', 'month': 'Pro · monthly',
            'cr': 'See Creator Plus (packs, online saving)', 'thx': 'Welcome to Stalak', 'thxGo': 'Make an edit', 'thxPlan': 'See my plan'}}


def check(name, ok, info=''):
    results.append(ok)
    print(('PASS ' if ok else 'FAIL ') + name + (('  — ' + str(info)) if info and not ok else ''))


def ev(pg, code):
    return pg.evaluate('s => __ev(s)', code)


def vis(pg, sel):
    return pg.evaluate("s => { const e = document.querySelector(s); if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; }", sel)


def no_hscroll(pg):
    return pg.evaluate('() => document.documentElement.scrollWidth <= innerWidth + 1')


def shot(pg, name):
    if SHOTS: pg.screenshot(path=os.path.join(SHOTS, name + '.png'))


def page(b, PW, dev, lang, email, flag=True, onb=True):
    opts = dict(PW.devices[dev]) if dev != 'ordi' else {'viewport': {'width': 1280, 'height': 860}}
    ctx = b.new_context(**opts, locale='fr-FR' if lang == 'fr' else 'en-US')
    init = ''
    if flag: init += 'window.__stalakM4on = 1;'
    if onb: init += "try { if (!localStorage.getItem('stalak:onb')) localStorage.setItem('stalak:onb', JSON.stringify({ v: 2, done: 1, sent: 1, a: { artistName: 'T-Crazy' } })); } catch (e) {}"
    ctx.add_init_script(init)
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    to = '/fr/' if lang == 'fr' else '/'
    pg.goto(BASE + '/__test/login?email=%s&pro=0&to=%s' % (email, to), wait_until='load')
    uid = pg.evaluate("() => fetch('/api/me').then(r => r.json()).then(d => d.user && d.user.id)")
    pg.evaluate("id => localStorage.setItem('stalak:proThanks:' + id, '1')", uid)
    pg.goto(BASE + to, wait_until='load'); pg.wait_for_function('() => !!window.StalakM', timeout=30000); pg.wait_for_timeout(1500)
    return ctx, pg, errs


def run(b, PW, dev, lang):
    tag = dev + ' ' + lang; t = T[lang]
    ctx, pg, errs = page(b, PW, dev, lang, 'm4-%s-%s@example.com' % (dev.replace(' ', '').lower(), lang))
    # the tutorial, at the first launch (the onboarding answered)
    pg.wait_for_selector('.m4-tu', timeout=10000); pg.wait_for_timeout(700)
    seen = []
    for i in range(4):
        seen.append(pg.locator('.m4-s.on h2').inner_text().replace('\n', ' ').strip())
        if i == 0: shot(pg, 'm4-tuto-%s-%s' % (dev.replace(' ', ''), lang)); check(tag + ' : tutoriel : « %s » et « %s »' % (t['skip'], t['next']), pg.locator('.m4-skip').inner_text().strip() == t['skip'] and pg.locator('.m4-tu .m4-cta').inner_text().strip() == t['next'])
        if i < 3: pg.locator('.m4-tu .m4-cta').click(); pg.wait_for_timeout(600)
    check(tag + ' : tutoriel : les 4 écrans de la démo, dans l’ordre', seen == t['tt'], seen)
    check(tag + ' : tutoriel : « %s » au dernier, plus de « Passer »' % t['go'], pg.locator('.m4-tu .m4-cta').inner_text().strip() == t['go'] and not vis(pg, '.m4-skip'))
    bars = pg.evaluate("() => [...document.querySelectorAll('.m4-bars b')].map(b => getComputedStyle(b).transform)")
    check(tag + ' : tutoriel : la barre du haut est pleine', all(x in ('none', 'matrix(1, 0, 0, 1, 0, 0)') for x in bars), bars)
    check(tag + ' : rien ne dépasse de l’écran (tutoriel)', no_hscroll(pg))
    pg.locator('.m4-tu .m4-cta').click(); pg.wait_for_timeout(700)
    check(tag + ' : tutoriel fini : il ne revient pas', pg.locator('.m4-tu').count() == 0 and pg.evaluate("() => localStorage.getItem('stalak:tuto')") == '1')
    pg.reload(wait_until='load'); pg.wait_for_function('() => !!window.StalakM4', timeout=30000); pg.wait_for_timeout(2500)
    check(tag + ' : rouvert : pas de 2e tutoriel', pg.locator('.m4-tu').count() == 0)
    # from the profile
    pg.locator('#tabBar [data-tab="account"]').click(); pg.wait_for_selector('#m4Again', timeout=8000); pg.wait_for_timeout(500)
    check(tag + ' : profil : « %s »' % t['again'], pg.locator('#m4Again span').inner_text().strip() == t['again'] and vis(pg, '#m4Again'))
    pg.locator('#m4Again').click(); pg.wait_for_selector('.m4-tu', timeout=5000); pg.wait_for_timeout(500)
    check(tag + ' : « %s » : le tutoriel revient, « Passer » le ferme' % t['again'], vis(pg, '.m4-tu'))
    pg.locator('.m4-skip').click(); pg.wait_for_timeout(600)
    check(tag + ' : « Passer » ferme le tutoriel', pg.locator('.m4-tu').count() == 0)
    ev(pg, 'apHide()'); pg.wait_for_timeout(500)
    # the help: a chat
    pg.locator('#helpBtn').click(); pg.wait_for_timeout(1000)
    r = pg.evaluate("() => { const r = document.querySelector('#helpPanel').getBoundingClientRect(); return [Math.round(r.width) === innerWidth, Math.round(r.height) === innerHeight]; }")
    check(tag + ' : le glaçon d’aide en plein écran : « %s », « %s »' % (t['hT'], t['hS']), r == [True, True] and pg.locator('.m4-hh b').inner_text().strip() == t['hT'] and pg.locator('.m4-hh span').inner_text().strip() == t['hS'], r)
    check(tag + ' : le chat : la vraie réponse du glaçon, des réponses à toucher, le champ et l’envoi', vis(pg, '#helpLog .hp-msg.bot') and pg.locator('#helpLog .hp-chips button').count() >= 2 and vis(pg, '#helpIn') and vis(pg, '#helpSend'))
    shot(pg, 'm4-aide-%s-%s' % (dev.replace(' ', ''), lang))
    pg.locator('.m4-hb').click(); pg.wait_for_timeout(500)
    check(tag + ' : le retour ferme l’aide', not vis(pg, '#helpPanel'))
    # the paywall
    ev(pg, "acctOpen('nowm', { plan: 'pro' })"); pg.wait_for_timeout(1500)
    h = pg.locator('.m4-pt').inner_text().replace('\n', ' ').strip()
    st = pg.evaluate("() => { const h = document.querySelector('.m4-pt'), y = h.querySelector('.m4-ts'), c = getComputedStyle(h); return [c.fontFamily.includes('DM Sans'), +c.fontWeight >= 800, y && y.textContent, y && getComputedStyle(y).color, h.getClientRects().length && h.scrollWidth <= h.clientWidth + 1]; }")
    check(tag + ' : paywall « Salle » : « %s » en DM Sans très gras, « %s » en jaune, sur une ligne' % (t['pw'], t['ts']), h == t['pw'] and st[0] and st[1] and st[2] == t['ts'] and st[3] == 'rgb(255, 210, 63)' and st[4], (h, st))
    im = pg.evaluate("() => [getComputedStyle(document.querySelector('.m4-bg')).backgroundImage, document.querySelector('.m4-star').getAttribute('src')]")
    check(tag + ' : paywall : le décor dessiné de la salle et le sticker de la mascotte', 'scene-salle.webp' in im[0] and im[1] == '/emoji/star.webp', im)
    ok = pg.evaluate("() => Promise.all(['/decors/scene-salle.webp', '/emoji/star.webp'].map(u => fetch(u).then(r => r.ok && r.headers.get('content-type').includes('image'))))")
    check(tag + ' : paywall : les 2 images sont servies par le site', all(ok), ok)
    ou = pg.evaluate("() => { const m = document.querySelector('.m4-opt[data-int=month]').getBoundingClientRect(), o = document.querySelector('.m4-ou'), g = document.querySelector('.m4-go').getBoundingClientRect(), r = o.getBoundingClientRect(); return [o.textContent, r.top >= m.bottom - 6 && r.bottom <= g.top + 6]; }")
    check(tag + ' : paywall : la pastille « %s » entre « au mois » et le bouton' % t['or'], ou == [t['or'], True], ou)
    sw = pg.evaluate("async () => { const rv = document.querySelector('.m4-rv'); const before = [...document.querySelectorAll('.m4-dots i')].findIndex(i => i.classList.contains('on')); rv.scrollTo({ left: rv.querySelectorAll('li')[2].offsetLeft - 16 }); await new Promise(r => setTimeout(r, 400)); return [getComputedStyle(rv).scrollSnapType.includes('x'), before, [...document.querySelectorAll('.m4-dots i')].findIndex(i => i.classList.contains('on')), rv.querySelectorAll('li')[1].getBoundingClientRect().left < innerWidth]; }")
    check(tag + ' : paywall : les avis glissent au doigt, la carte suivante dépasse, les points suivent', sw[0] and sw[1] == 0 and sw[2] == 2 and sw[3], sw)
    rv = pg.evaluate("() => [...document.querySelectorAll('.m4-rv li blockquote')].map(q => q.textContent)")
    src = pg.evaluate("() => [...document.querySelectorAll('.rv-list > li blockquote')].slice(0, 6).map(q => q.textContent)")
    check(tag + ' : paywall : de vrais avis clients, mot pour mot', len(rv) == 6 and rv == src, (rv[:1], src[:1]))
    opts = pg.evaluate("() => [...document.querySelectorAll('.m4-opt b')].map(b => b.textContent)")
    check(tag + ' : paywall : l’année mise en avant, le mois', opts == [t['year'], t['month']] and pg.locator('.m4-opt[data-int="year"]').get_attribute('aria-checked') == 'true', opts)
    a = ev(pg, "plAmounts('pro')"); ys = pg.locator('.m4-opt[data-int="year"] strong').inner_text(); ms = pg.locator('.m4-opt[data-int="month"] strong').inner_text()
    check(tag + ' : paywall : les prix de la page des formules', ev(pg, "plMoney(plAmounts('pro').y, plAmounts('pro').cur)") in ys and ev(pg, "plMoney(plAmounts('pro').m, plAmounts('pro').cur)") in ms, (ys, ms, a))
    pg.locator('.m4-opt[data-int="month"]').click(); pg.wait_for_timeout(300)
    check(tag + ' : paywall : « au mois » choisit la facturation mensuelle de la page', ev(pg, 'plInt') == 'month' and pg.locator('.m4-opt[data-int="month"]').get_attribute('aria-checked') == 'true')
    pg.locator('.m4-opt[data-int="year"]').click(); pg.wait_for_timeout(300)
    check(tag + ' : paywall : un seul bouton principal', pg.locator('#apPro .m4-cta:visible').count() == 1 and not vis(pg, '#apBuy'))
    check(tag + ' : paywall : pas de faux compte à rebours ni de prix barré', pg.locator('.m4-pw s').count() == 0 and not any(w in pg.locator('.m4-pw').inner_text().lower() for w in ('expire', 'plus que', 'left:', 'timer')))
    check(tag + ' : rien ne dépasse de l’écran (paywall)', no_hscroll(pg))
    shot(pg, 'm4-paywall-%s-%s' % (dev.replace(' ', ''), lang))
    ev(pg, "__buyAsk = null, plBuy = (p, b) => { window.__buy = [p, plInt]; }")
    pg.locator('.m4-go').click(force=True); pg.wait_for_timeout(300)
    check(tag + ' : paywall : le bouton achète Pro, à l’année, comme la page', pg.evaluate('() => window.__buy') == ['pro', 'year'], pg.evaluate('() => window.__buy'))
    pg.locator('.m4-cr').click(); pg.wait_for_timeout(500)
    check(tag + ' : « %s » : toute la page des formules revient' % t['cr'], vis(pg, '#apBuy') and vis(pg, '.pl-creator'))
    ev(pg, 'apHide()'); pg.wait_for_timeout(500)
    # after a purchase
    ev(pg, 'ptOpen()'); pg.wait_for_timeout(1500)
    check(tag + ' : après un achat : la feuille, « %s … », un bouton « %s », « %s »' % (t['thx'], t['thxGo'], t['thxPlan']), vis(pg, '.m4-thx') and t['thx'] in pg.locator('.m4-thx h2').inner_text()
          and pg.locator('.m4-thx .m4-cta').inner_text().strip() == t['thxGo'] and pg.locator('.m4-thx .m4-tp').inner_text().strip() == t['thxPlan'] and pg.locator('.m4-conf i').count() > 20)
    shot(pg, 'm4-merci-%s-%s' % (dev.replace(' ', ''), lang))
    pg.locator('.m4-thx .m4-tp').click(); pg.wait_for_timeout(800)
    check(tag + ' : « %s » : la feuille se ferme, le profil s’ouvre' % t['thxPlan'], pg.locator('.m4-thx').count() == 0 and not vis(pg, '#proThx') and ev(pg, 'apView') == 'account')
    # the end of an export with the watermark, and the 1 € offer (the amounts are Paddle's: given here as the app would get them)
    ev(pg, 'apHide()'); pg.wait_for_timeout(300)
    pg.locator('#mhEx:visible, #heroDemo:visible, #demoBtn:visible').first.click()
    pg.wait_for_function('() => __ev("S.step === 4 && S.cuts.length > 0")', timeout=240000); pg.wait_for_timeout(800)
    ev(pg, "offer1On = () => true, of1Prices = { today: '1 €', then: '7,99 €' }, S.song.demo = false, store.set(PP_KEY, 1), " + FAST_EXPORT)
    pg.evaluate('() => { __ev("exportOne()"); }'); pg.wait_for_function('() => __ev("S.done === true && !S.exporting")', timeout=90000); pg.wait_for_timeout(1500)
    ev(pg, 'trialUi()'); pg.wait_for_timeout(800)
    on = ev(pg, "document.documentElement.classList.contains('m4of1')")
    check(tag + ' : fin d’export avec filigrane : l’offre à 1 € en feuille blanche', on and vis(pg, '.m4-of1s') and '1 €' in pg.locator('.m4-of1s h3').inner_text(), on)
    if on:
        check(tag + ' : « Retirer pour 1 € », les conditions en clair, « Enregistrer avec le filigrane » en petit', '1 €' in pg.locator('#dvCmpGo').inner_text() and vis(pg, '#dvOffer1') and '7,99 €' in pg.locator('#dvOffer1').inner_text() and vis(pg, '#saveBtn'))
        shot(pg, 'm4-offre1-%s-%s' % (dev.replace(' ', ''), lang))
        # (25/11, owner) the free save is a real button, as wide as the blue one, just under it
        sz = pg.evaluate("() => { const a = document.querySelector('#dvCmpGo').getBoundingClientRect(), b = document.querySelector('#saveBtn').getBoundingClientRect(); return [Math.round(a.width), Math.round(b.width), Math.round(b.height), Math.round(b.top - a.bottom), getComputedStyle(document.querySelector('#saveBtn')).borderTopWidth]; }")
        check(tag + ' : « Enregistrer gratuitement (avec filigrane) » : un vrai bouton, même largeur que le bleu, juste dessous', abs(sz[0] - sz[1]) <= 2 and sz[2] >= 50 and 0 <= sz[3] <= 120 and sz[4] != '0px'
              and ('gratuitement' in pg.locator('#saveBtn').inner_text() or 'for free' in pg.locator('#saveBtn').inner_text()), sz)
        # (25/11, owner) no black void, no lost icon under the sheet: every block after it is a white card, one after the other
        gap = pg.evaluate("() => { const r = [...document.querySelectorAll('#result > *')].filter(e => e.offsetParent && getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().height > 4).map(e => e.getBoundingClientRect()).sort((a, b) => a.top - b.top); let g = 0; for (let i = 1; i < r.length; i++) g = Math.max(g, r[i].top - r[i - 1].bottom); return Math.round(g); }")
        cards = pg.evaluate("() => ['.capbox', '.optbox', '.post'].map(q => document.querySelector('#result > ' + q)).filter(e => e && e.offsetParent).every(e => getComputedStyle(e).backgroundColor === 'rgb(255, 255, 255)')")
        check(tag + ' : sous l’offre, pas de vide noir (plus grand écart %d px), chaque bloc dans une carte blanche' % gap, gap <= 40 and cards, [gap, cards])
        # (25/11, owner) « Retirer pour 1 € » pays the offer itself, never the plans page
        ev(pg, "window.__co = null, ACCT.checkout = async (p, i, o) => { window.__co = [p, i, o && o.kind]; }, apRun = f => f()")
        pg.locator('#dvCmpGo').click(force=True); pg.wait_for_timeout(600)
        check(tag + ' : « Retirer pour 1 € » ouvre le paiement de l’offre, jamais les formules', pg.evaluate('() => window.__co') == ['pro', 'month', 'offer1'] and ev(pg, 'apView') != 'pro', [pg.evaluate('() => window.__co'), ev(pg, 'apView')])
        ev(pg, 'apHide()'); pg.wait_for_timeout(300)
        # (25/11, owner's decision) the offer at the 1st export, then the 10th, the 20th… never in between
        turns = ev(pg, "[1,2,5,9,10,11,19,20].map(n => (store.set(EXP_KEY, n), of1Turn()))")
        check(tag + ' : l’offre au 1er export, au 10e, au 20e, jamais du 2e au 9e', turns == [True, False, False, False, True, False, False, True], turns)
        paid = ev(pg, "(acctPaid = () => true, offer1Right())")
        check(tag + ' : jamais pour un abonné', paid is False)
        ev(pg, "acctPaid = () => false")
        ev(pg, "offer1On = () => false, trialUi()"); pg.wait_for_timeout(600)
        check(tag + ' : sans l’offre cette fois : « Enregistrer » d’abord, et un petit lien « Retirer le filigrane »', ev(pg, "document.documentElement.classList.contains('m4wm')") and vis(pg, '#saveBtn') and pg.locator('#dvCmpGo .m4-rw').count() == 1 and not vis(pg, '#dvCmp'))
        check(tag + ' : sans le droit à l’offre : l’écran de fin habituel revient, rien ne manque', not ev(pg, "document.documentElement.classList.contains('m4of1')") and pg.locator('.m4-of1s').count() == 0 and pg.evaluate("() => !!document.querySelector('#result #saveRow') && !!document.querySelector('#result #dvCmpGo')"))
    check(tag + ' : aucune erreur dans la page', not errs, errs)
    ctx.close()


def computer(b, PW, lang):
    ctx, pg, errs = page(b, PW, 'ordi', lang, 'm4-ordi-%s@example.com' % lang)
    pg.wait_for_timeout(1500)
    check('ordinateur ' + lang + ' : rien de tout ça (le fichier n’est pas chargé)', not pg.evaluate('() => !!window.StalakM4') and pg.locator('.m4-tu').count() == 0)
    check('ordinateur ' + lang + ' : aucune erreur dans la page', not errs, errs)
    ctx.close()


def quiet(b, PW):
    ctx, pg, errs = page(b, PW, 'iPhone 12', 'fr', 'm4-quiet@example.com', flag=False)
    pg.wait_for_timeout(2500)
    check('iPhone 12 fr : sous test sans le drapeau, rien du lot 4 (les anciens tests gardent leur page)', not pg.evaluate('() => !!window.StalakM4') and pg.locator('.m4-tu').count() == 0)
    ctx.close()


def main():
    with sync_playwright() as p:
        b = p.chromium.launch()
        for fn, a in ((run, ('iPhone 12', 'fr')), (run, ('iPhone SE', 'en')), (computer, ('fr',)), (quiet, ())):
            try: fn(b, p, *a)
            except Exception as e: check(' '.join(str(x) for x in a) + ' : déroulé complet (' + fn.__name__ + ')', False, str(e)[:400])
        b.close()
    print('%d/%d réussis' % (sum(results), len(results)))
    sys.exit(0 if all(results) else 1)


main()
