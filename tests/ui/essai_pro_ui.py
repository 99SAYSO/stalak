"""Test of the 7-day Stalak Pro trial (Chef de projet, 23/11, 7 h 14). Python Playwright (chromium), the server imitated.

    python3 /abs/path/tests/ui/essai_pro_ui.py <built public/ folder> [folder for screenshots]

The server (Comptes) says the trial exists in /api/config (`trial: {days: 7, plans: ['pro']}`) and who may have it in /api/me
(`entitlements.trialEligible`). Checked, in French and English, on a phone and a computer:
- with the right to it: everywhere Pro is offered (plans screen, Pro window, end screen, locked filters and Clip mode) the button
  says « Essayer Pro 7 jours gratuits », and just below, always shown: « Puis 4,17 $/mois, facturé 49,99 $ par an » (or the
  monthly price when monthly is chosen) and « Annulable à tout moment avant la fin de l'essai ». On the plans screen, before
  paying: « Aujourd'hui : 0 $. 1er prélèvement le <date in 7 days> : <amount> ». The checkout is asked with the trial.
- without the right to it (already had one): as before, no trial word anywhere, the checkout without the trial;
- signed out: the trial is offered (the server checks the right after sign-in);
- during the trial: the account says « Essai Pro : encore X jours » with the date of the 1st payment and « Gérer ou annuler »;
  the menu says it too; 1 day is singular; cancelled: « rien ne sera prélevé ». No trial offer any more.
- the size of the 4,17 $ does not change (52 px on the plans screen, 30 px in the Pro window); nothing wider than the screen;
  no error in the page."""
import datetime, functools, http.server, json, os, shutil, subprocess, sys, tempfile, threading
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.sync_api import sync_playwright

PUBLIC = os.path.abspath(sys.argv[1])
SHOTS = sys.argv[2] if len(sys.argv) > 2 else None
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
results = []
T = {'fr': {'go': 'Essayer Pro 7 jours gratuits', 'thenY': 'Puis 4,17', 'billY': '49,99', 'parAn': 'par an', 'thenM': 'Puis 7,99',
            'month': 'chaque mois', 'cancel': 'Annulable à tout moment avant la fin de l’essai', 'today': 'Aujourd’hui : 0', 'first': '1er prélèvement le',
            'left3': 'Essai Pro : encore 3 jours', 'left1': 'Essai Pro : encore 1 jour ', 'manage': 'Gérer ou annuler', 'nothing': 'rien ne sera prélevé',
            'trial': 'essai', 'monthBtn': 'Mensuel'},
     'en': {'go': 'Try Pro free for 7 days', 'thenY': 'Then $4.17', 'billY': '$49.99', 'parAn': 'a year', 'thenM': 'Then $7.99',
            'month': 'billed monthly', 'cancel': 'Cancel anytime before the trial ends', 'today': 'Today: $0', 'first': 'First payment on',
            'left3': 'Pro trial: 3 days left', 'left1': 'Pro trial: 1 day left', 'manage': 'Manage or cancel', 'nothing': 'nothing will be charged',
            'trial': 'trial', 'monthBtn': 'Monthly'}}


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


def check(name, ok, info=''):
    results.append(bool(ok))
    print(('PASS ' if ok else 'FAIL ') + name + (('  — ' + str(info)) if info and not ok else ''), flush=True)


def ev(pg, code):
    return pg.evaluate('s => __ev(s)', code)


ENT = json.loads(subprocess.run(['node', '--input-type=module', '-e',
    "import('" + os.path.join(ROOT, 'functions/_lib/entitlements.js') + "').then(m => console.log(JSON.stringify({ free: m.entitlementsOf('free'), pro: m.entitlementsOf('pro') })))"],
    capture_output=True, text=True, check=True).stdout)
CFG = {'paddle': {'environment': 'sandbox', 'clientToken': 'test_x', 'prices': {'pro': {'month': 'pri_pm', 'year': 'pri_py'}, 'creator': {'month': 'pri_cm', 'year': 'pri_cy'}, 'month': 'pri_pm', 'year': 'pri_py'}},
       'plans': {'pro': {'month': {'amount': '7.99', 'currency': 'USD'}, 'year': {'amount': '49.99', 'currency': 'USD'}},
                 'creator': {'month': {'amount': '14.99', 'currency': 'USD'}, 'year': {'amount': '99.99', 'currency': 'USD'}}},
       'features': {'socialConnect': False, 'social': [], 'cloudSave': False}, 'auth': {'providers': [], 'passwordMin': 8, 'turnstile': None},
       'trial': {'days': 7, 'plans': ['pro']}}
USER = {'id': 'u1', 'email': 'a@example.com', 'createdAt': '2026-01-01T00:00:00Z'}


def iso(days):
    return (datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=days)).strftime('%Y-%m-%dT%H:%M:%SZ')


def ME(kind):
    if kind == 'out': return {'user': None, 'session': None, 'entitlements': ENT['free'], 'subscription': None}
    if kind in ('yes', 'no'): return {'user': USER, 'session': {}, 'entitlements': dict(ENT['free'], trialEligible=kind == 'yes'), 'subscription': None}
    days, cancel = {'trial3': (2.6, False), 'trial1': (0.4, False), 'trialX': (2.6, True)}[kind]
    return {'user': USER, 'session': {}, 'entitlements': dict(ENT['pro'], trialEligible=False),
            'subscription': {'status': 'trialing', 'plan': 'pro', 'interval': 'year', 'trialEndsAt': iso(days), 'currentPeriodEnd': iso(days), 'cancelAt': iso(days) if cancel else None}}


def page(b, PW, base, lang, dev, me):
    opts = dict(PW.devices[dev]) if dev != 'ordinateur' else {'viewport': {'width': 1280, 'height': 860}}
    ctx = b.new_context(**opts, locale='en-US' if lang == 'en' else 'fr-FR')
    def api(r):
        u = r.request.url.split('?')[0]
        if u.endswith('/api/config'): return r.fulfill(status=200, content_type='application/json', body=json.dumps(CFG))
        if u.endswith('/api/me'): return r.fulfill(status=200, content_type='application/json', body=json.dumps(ME(me)))
        return r.fulfill(status=204, body='')
    ctx.route('**/api/**', api)
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.goto(base + ('' if lang == 'en' else 'fr/'), wait_until='load'); pg.wait_for_function('window.__ev && window.MP4Box', timeout=60000)
    pg.wait_for_function('() => __ev("!!plCfg && (ACCT.state.user !== null || %s)")' % ('true' if me == 'out' else 'false'), timeout=20000)
    pg.wait_for_timeout(500)
    ev(pg, "ACCT.checkout = (p, i, o) => { window.__co = [p, i, o || null]; return new Promise(() => {}); }")
    return ctx, pg, errs


def txt(pg, sel):
    return pg.evaluate('s => { const e = document.querySelector(s); return e ? e.textContent.replace(/\\u00a0|\\u202f/g, " ").trim() : null; }', sel)


def vis(pg, sel):
    return pg.evaluate('s => { const e = document.querySelector(s); return !!e && !e.hidden && !!e.offsetParent && getComputedStyle(e).visibility !== "hidden"; }', sel)


def n(s):
    return (s or '').replace(' ', ' ').replace(' ', ' ').replace("'", '’')


def plans(pg, tag, t, offered, lang, dev):
    ev(pg, "acctOpen('nowm', { plan: 'pro' })"); pg.wait_for_timeout(700)
    btn = n(txt(pg, '#apBuy [data-buy="pro"]'))
    terms = n(txt(pg, '#plTrialTerms'))
    if offered:
        check(tag + ' : formules : le bouton Pro dit « ' + t['go'] + ' »', btn == t['go'], btn)
        check(tag + ' : formules : juste dessous, visible, le prix après l’essai (annuel)', vis(pg, '#plTrialTerms') and t['thenY'] in terms and t['billY'] in terms and t['parAn'] in terms, terms)
        check(tag + ' : formules : « annulable à tout moment avant la fin de l’essai »', t['cancel'] in terms, terms)
        d = pg.evaluate("() => __ev(\"acctDate(new Date(Date.now() + 7 * 864e5).toISOString())\")")
        check(tag + ' : formules : avant de payer, 0 $ aujourd’hui, la date et le montant du 1er prélèvement', t['today'] in terms and t['first'] in terms and n(d) in terms and t['billY'] in terms.split(t['first'])[-1], terms)
        r = pg.evaluate('''() => { const a = document.querySelector('#apBuy [data-buy="pro"]').getBoundingClientRect(), b = document.querySelector('#plTrialTerms').getBoundingClientRect(); return [a.bottom, b.top]; }''')
        check(tag + ' : formules : les conditions sont juste sous le bouton', 0 <= r[1] - r[0] <= 24, r)
        if SHOTS:
            pg.locator('#apBuy .pl-pro').scroll_into_view_if_needed(); pg.wait_for_timeout(300)
            pg.screenshot(path=os.path.join(SHOTS, 'essai-formules-%s-%s.png' % (dev.replace(' ', '').lower(), lang)))
        pg.locator('#plInt button[data-int="month"]').click(); pg.wait_for_timeout(300)
        tm = n(txt(pg, '#plTrialTerms'))
        check(tag + ' : formules en mensuel : 7,99 $ chaque mois, 1er prélèvement de 7,99 $', t['thenM'] in tm and t['month'] in tm and t['thenM'].split(' ', 1)[1].strip('$') in tm.split(t['first'])[-1] and t['billY'] not in tm, tm)
        pg.locator('#apBuy [data-buy="pro"]').click(); pg.wait_for_timeout(300)
        check(tag + ' : formules : le paiement est demandé avec l’essai (Pro, mensuel)', ev(pg, 'window.__co') == ['pro', 'month', {'trial': True}], ev(pg, 'window.__co'))
        pg.locator('#plInt button[data-int="year"]').click(); pg.wait_for_timeout(200)
    else:
        check(tag + ' : formules : pas d’essai, le bouton Pro comme avant', t['go'] not in btn and t['trial'] not in btn.lower() and not vis(pg, '#plTrialTerms'), [btn, terms])
        if ev(pg, '!!ACCT.state.user'):
            pg.locator('#apBuy [data-buy="pro"]').click(); pg.wait_for_timeout(300)
            check(tag + ' : formules : le paiement est demandé sans essai', ev(pg, 'window.__co') == ['pro', 'year', None], ev(pg, 'window.__co'))
    fs = pg.evaluate("() => [getComputedStyle(document.querySelector('.pl-pro .pr-amt')).fontSize, innerWidth]")
    want = '52px' if fs[1] < 1000 else '44px'   # as on main: 52 px on a phone, 44 px on a computer (3 cards side by side)
    check(tag + ' : formules : la taille du 4,17 $ ne change pas (' + want + ')', fs[0] == want, fs)
    ev(pg, "apHide && apHide()"); pg.wait_for_timeout(300)


def popups(pg, tag, t, offered):
    # the Pro window, the locked filters, the locked Clip mode: the same button and the same lines
    out = pg.evaluate('''() => ['#proPopGo', '#faPro', '#caPro'].map(s => { const b = document.querySelector(s), p = b.parentElement.querySelector('.tr-terms');
        return [b.textContent.replace(/\\u00a0|\\u202f/g, ' ').trim(), p ? !p.hidden : null, p ? p.textContent.replace(/\\u00a0|\\u202f/g, ' ') : null, p && b.nextElementSibling === p]; })''')
    for (s, (b, shown, terms, nxt)) in zip(['fenêtre Pro', 'filtres verrouillés', 'Clip verrouillé'], out):
        terms = n(terms)
        if offered:
            check(tag + ' : ' + s + ' : « ' + t['go'] + ' », et juste dessous le prix et « annulable »', n(b) == t['go'] and shown and nxt and t['thenY'] in terms and t['billY'] in terms and t['cancel'] in terms, [b, shown, terms, nxt])
        else:
            check(tag + ' : ' + s + ' : comme avant, pas d’essai', t['go'] != n(b) and not shown, [b, shown])


def run(b, PW, base, site, lang, dev):
    t = T[lang]
    # 1. with the right to the trial
    tag = dev + ' ' + lang + ' (droit à l’essai)'
    ctx, pg, errs = page(b, PW, base, lang, dev, 'yes')
    check(tag + ' : l’app voit le droit à l’essai', ev(pg, 'trialOn()') is True and ev(pg, 'trialDays()') == 7)
    plans(pg, tag, t, True, lang, dev)
    popups(pg, tag, t, True)
    # the Pro window opened for real (after a saved video): the button, the lines, the 4,17 $ size
    if dev != 'iPhone SE':
        pg.set_input_files('#songFile', os.path.join(site, 'beat.wav')); pg.wait_for_function('() => __ev("!!S.song")', timeout=60000)
        pg.set_input_files('#takeFiles', [os.path.join(site, 'take1.mp4')])
        pg.wait_for_function('''() => __ev("S.takes.length === 1 && S.takes.every(t => t.status !== 'pending')")''', timeout=180000)
        ev(pg, 'go(4)'); pg.wait_for_function('() => __ev("S.cuts.length > 0")', timeout=60000); pg.wait_for_timeout(1200)
        pg.evaluate('() => { __ev("exportOne()"); }')
        pg.wait_for_function('() => __ev("S.exporting")', timeout=20000)
        pg.wait_for_function('() => __ev("S.done && !S.exporting && cmpReady === lastBlob")', timeout=300000); pg.wait_for_timeout(2600)
        cmp = pg.evaluate('''() => { const q = s => document.querySelector(s), go = q('#dvCmpGo');
            return { go: go.innerText.replace(/\\u00a0|\\u202f/g, ' ').trim(), goShown: !go.hidden && !!go.offsetParent, tag: !!q('#dvCmpGo .cmp-tag') && !q('#dvCmpGo .cmp-tag').hidden,
              terms: q('#dvTrial').textContent.replace(/\\u00a0|\\u202f/g, ' '), tShown: !q('#dvTrial').hidden && !!q('#dvTrial').offsetParent, pShown: !q('#dvCmpP').hidden,
              gap: q('#dvTrial').getBoundingClientRect().top - go.getBoundingClientRect().bottom, vw: innerWidth, sw: document.documentElement.scrollWidth }; }''')
        check(tag + ' : écran de fin : « ' + t['go'] + ' » (sans étiquette PRO à côté)', n(cmp['go']) == t['go'] and cmp['goShown'] and not cmp['tag'], cmp)
        check(tag + ' : écran de fin : juste dessous, le prix après l’essai et « annulable »', cmp['tShown'] and t['thenY'] in n(cmp['terms']) and t['cancel'] in n(cmp['terms']) and 0 <= cmp['gap'] <= 24 and not cmp['pShown'], cmp)
        check(tag + ' : écran de fin : rien de plus large que l’écran', cmp['sw'] <= cmp['vw'], cmp)
        if SHOTS:
            pg.locator('#dvCmpGo').scroll_into_view_if_needed(); pg.wait_for_timeout(300)
            pg.screenshot(path=os.path.join(SHOTS, 'essai-fin-%s-%s.png' % (dev.replace(' ', '').lower(), lang)))
        pg.locator('#dvCmpGo').click(); pg.wait_for_timeout(700)
        check(tag + ' : écran de fin : le bouton ouvre les formules sur Pro, avec la date et le montant du 1er prélèvement', vis(pg, '#plTrialTerms') and t['first'] in n(txt(pg, '#plTrialTerms')), txt(pg, '#plTrialTerms'))
        ev(pg, "apHide && apHide()"); pg.wait_for_timeout(300)
        ev(pg, 'ppOpen()'); pg.wait_for_timeout(600)
        pp = pg.evaluate('''() => { const q = s => document.querySelector(s), c = q('#proPopCard');
            return { amt: getComputedStyle(q('#ppAmt')).fontSize, fits: c.scrollHeight <= c.clientHeight + 1 && c.getBoundingClientRect().bottom <= innerHeight + 1,
              later: !!q('#proPopLater').offsetParent }; }''')
        check(tag + ' : fenêtre Pro : 4,17 $ toujours à 30 px, tout tient dans l’écran, « Plus tard » visible', pp['amt'] == '30px' and pp['fits'] and pp['later'], pp)
        if SHOTS: pg.screenshot(path=os.path.join(SHOTS, 'essai-fenetre-%s-%s.png' % (dev.replace(' ', '').lower(), lang)))
        ev(pg, 'ppClose()')
    check(tag + ' : aucune erreur dans la page', not errs, errs[:3])
    ctx.close()
    # 2. without the right (already had a trial): as before
    tag = dev + ' ' + lang + ' (sans droit)'
    ctx, pg, errs = page(b, PW, base, lang, dev, 'no')
    check(tag + ' : l’app ne propose pas l’essai', ev(pg, 'trialOn()') is False)
    plans(pg, tag, t, False, lang, dev)
    popups(pg, tag, t, False)
    check(tag + ' : aucune erreur dans la page', not errs, errs[:3])
    ctx.close()
    # 3. signed out: offered (the right is checked by the server after sign-in)
    tag = dev + ' ' + lang + ' (déconnecté)'
    ctx, pg, errs = page(b, PW, base, lang, dev, 'out')
    check(tag + ' : l’essai est proposé (le droit est vérifié à la connexion)', ev(pg, 'trialOn()') is True)
    popups(pg, tag, t, True)
    ctx.close()
    # 4. during the trial: the account and the menu
    for kind, want, label in (('trial3', t['left3'], '3 jours'), ('trial1', t['left1'], '1 jour (singulier)'), ('trialX', t['left3'], 'annulé')):
        tag = dev + ' ' + lang + ' (essai en cours, ' + label + ')'
        ctx, pg, errs = page(b, PW, base, lang, dev, kind)
        pg.wait_for_timeout(1500); ev(pg, "typeof ptClose === 'function' && ptClose()"); pg.wait_for_timeout(500)   # « Bienvenue dans Pro », shown once
        ev(pg, "apGo('account')"); pg.wait_for_timeout(700)
        if dev != 'ordinateur':   # phone (mobile redesign, lot 2): the profile says it first, the detail is behind the gear
            prof = n(txt(pg, '#m2PlanT'))
            check(tag + ' : profil du téléphone : « ' + want.strip() + ' » sur la carte de la formule', want.strip() in prof and vis(pg, '#m2PlanT'), prof)
            pg.evaluate("() => { const g = document.querySelector('#m2Gear'); if (g && g.getClientRects().length) { g.click(); return true; } return false; }"); pg.wait_for_timeout(400)
        sub, go = n(txt(pg, '#apSubT')), n(txt(pg, '#apSubGo'))
        check(tag + ' : compte : « ' + want.strip() + ' »', (want if kind != 'trial1' else want.strip()) in sub and vis(pg, '#apSubT'), sub)
        if kind == 'trialX': check(tag + ' : compte : annulé, « rien ne sera prélevé » et la date de fin', t['nothing'] in sub, sub)
        else: check(tag + ' : compte : la date du 1er prélèvement', t['first'].lower() in sub.lower(), sub)
        check(tag + ' : compte : le lien « ' + t['manage'] + ' »', go == t['manage'] and vis(pg, '#apSubGo'), go)
        if kind == 'trial3' and SHOTS: pg.locator('#apSub').scroll_into_view_if_needed(); pg.wait_for_timeout(300)
        if kind == 'trial3' and SHOTS: pg.screenshot(path=os.path.join(SHOTS, 'essai-compte-%s-%s.png' % (dev.replace(' ', '').lower(), lang)))
        ev(pg, "apHide && apHide()"); pg.wait_for_timeout(200)
        menu = n(txt(pg, '#amProT'))
        check(tag + ' : menu du compte : « ' + want.strip() + ' »', menu == want.strip(), menu)
        check(tag + ' : essai en cours = abonné : le mode Clip est ouvert (décision du 24/11)', ev(pg, "can('clip')") is True)
        check(tag + ' : plus d’offre d’essai pendant l’essai', ev(pg, 'trialOn()') is False and not ev(pg, "$$('.tr-terms').some(p => !p.hidden)"))
        check(tag + ' : aucune erreur dans la page', not errs, errs[:3])
        ctx.close()


def main():
    tmp = tempfile.mkdtemp(prefix='stalak-essai-')
    site = os.path.join(tmp, 'site'); shutil.copytree(PUBLIC, site)
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    from _probe import add_probe; add_probe(site)
    ff = shutil.which('ffmpeg'); beat = "0.8*sin(2*PI*60*t)*exp(-25*mod(t,0.5))+0.15*sin(2*PI*440*t)"
    subprocess.run([ff, '-nostdin', '-v', 'error', '-y', '-f', 'lavfi', '-i', "aevalsrc='%s':s=44100:d=8" % beat, '-ac', '1', os.path.join(site, 'beat.wav')], check=True)
    subprocess.run([ff, '-nostdin', '-v', 'error', '-y', '-f', 'lavfi', '-i', 'testsrc2=s=360x640:r=30:d=8', '-f', 'lavfi', '-i', "aevalsrc='%s':s=44100:d=8" % beat,
                    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-g', '30', '-c:a', 'aac', '-shortest', os.path.join(site, 'take1.mp4')], check=True)
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=site))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = 'http://127.0.0.1:%d/' % srv.server_address[1]
    with sync_playwright() as p:
        b = p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'])
        for lang, dev in (('fr', 'iPhone 12'), ('en', 'ordinateur'), ('en', 'iPhone SE'), ('fr', 'ordinateur')):
            try: run(b, p, base, site, lang, dev)
            except Exception as e: check(dev + ' ' + lang + ' : déroulé complet', False, str(e)[:400])
        b.close()
    srv.shutdown(); shutil.rmtree(tmp, ignore_errors=True)
    print('%d/%d réussis' % (sum(results), len(results)))
    sys.exit(0 if all(results) else 1)


main()
