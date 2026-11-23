"""Comptes, 23/11 (owner's decisions): the cookie banner, Clarity and GA4 only after « Accepter », the GA4 funnel, and the
« 1 € » offer on the end screen of an export with the watermark. Python Playwright (chromium), the server imitated.

    python3 /abs/path/tests/ui/mesure_ui.py <built public/ folder> [folder for screenshots]

Checked, in French and English, on a phone (390 px) and a computer (1280 px):
- no measuring tool set in /api/config: no banner, nothing loaded;
- tools set: the banner shows; « Accepter » and « Refuser » have the same size; NOTHING is loaded nor written (no request to
  clarity.ms / googletagmanager.com, no _ga / _clck cookie) before the choice;
- « Refuser »: still nothing, the choice is kept (no banner after a reload); « Gérer les cookies » in the footer opens it again;
- « Accepter »: Clarity and GA4 load with their ids; the fields and the videos are masked for Clarity; the steps of the
  funnel go to GA4 (paywall_vu with its place, checkout_ouvert, accueil_vue on the home page); after a reload: loaded, no banner;
  « Refuser » afterwards: their cookies are deleted;
- Global Privacy Control: no banner, nothing loaded;
- the 1 € offer: on the end screen with the watermark, for an account that has the right to it, the button says « Retire le
  filigrane pour 1 € » (the amount Paddle gives when it answers) and, right below and readable, « … aujourd'hui, puis …/mois
  dans 7 jours. Annulable à tout moment. »; the payment opens with the offer; without the right: the free trial as before;
- nothing wider than the screen; no error in the page."""
import functools, http.server, json, os, shutil, subprocess, sys, tempfile, threading
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.sync_api import sync_playwright

PUBLIC = os.path.abspath(sys.argv[1])
SHOTS = sys.argv[2] if len(sys.argv) > 2 else None
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
results = []


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


def check(name, ok, info=''):
    results.append(bool(ok))
    print(('PASS ' if ok else 'FAIL ') + name + (('  — ' + str(info)) if info and not ok else ''), flush=True)


ENT = json.loads(subprocess.run(['node', '--input-type=module', '-e',
    "import('" + os.path.join(ROOT, 'functions/_lib/entitlements.js') + "').then(m => console.log(JSON.stringify({ free: m.entitlementsOf('free') })))"],
    capture_output=True, text=True, check=True).stdout)
BASE_CFG = {'paddle': {'environment': 'sandbox', 'clientToken': 'test_x', 'prices': {'pro': {'month': 'pri_pm', 'year': 'pri_py'}, 'creator': {'month': 'pri_cm', 'year': 'pri_cy'},
            'month': 'pri_pm', 'year': 'pri_py', 'proTrial': {'month': 'pri_pmt', 'year': 'pri_pyt'}, 'proOffer1': 'pri_of1'}},
            'plans': {'pro': {'month': {'amount': '7.99', 'currency': 'USD'}, 'year': {'amount': '49.99', 'currency': 'USD'}},
                      'creator': {'month': {'amount': '14.99', 'currency': 'USD'}, 'year': {'amount': '99.99', 'currency': 'USD'}}},
            'features': {'socialConnect': False, 'social': [], 'cloudSave': False}, 'auth': {'providers': [], 'passwordMin': 8, 'turnstile': None},
            'trial': {'days': 7, 'plans': ['pro']}}
MEASURE = {'clarity': 'tstclar01', 'ga4': 'G-TEST12345', 'tiktok': False}
USER = {'id': 'u1', 'email': 'a@example.com', 'createdAt': '2026-01-01T00:00:00Z'}
T = {'fr': {'yes': 'Accepter', 'no': 'Refuser', 'ck': 'Gérer les cookies', 'go': 'Retire le filigrane pour', 'terms': ['aujourd’hui, puis', '/mois dans 7 jours.', 'Annulable à tout moment.'],
            'trial': 'Essayer Pro 7 jours gratuits'},
     'en': {'yes': 'Accept', 'no': 'Refuse', 'ck': 'Cookie settings', 'go': 'Remove the watermark for', 'terms': ['today, then', '/month in 7 days.', 'Cancel anytime.'],
            'trial': 'Try Pro free for 7 days'}}


def context(b, PW, lang, dev, measure, me='yes', gpc=False):
    opts = dict(PW.devices[dev]) if dev != 'ordinateur' else {'viewport': {'width': 1280, 'height': 860}}
    ctx = b.new_context(**opts, locale='en-US' if lang == 'en' else 'fr-FR')
    seen = []
    cfg = dict(BASE_CFG, measure=measure or {'clarity': None, 'ga4': None, 'tiktok': False})
    def api(r):
        u = r.request.url.split('?')[0]
        if u.endswith('/api/config'): return r.fulfill(status=200, content_type='application/json', body=json.dumps(cfg))
        if u.endswith('/api/me'):
            if me == 'out': body = {'user': None, 'session': None, 'entitlements': ENT['free'], 'subscription': None}
            else: body = {'user': USER, 'session': {}, 'entitlements': dict(ENT['free'], trialEligible=me == 'yes', offer1Eligible=me == 'yes'), 'subscription': None}
            return r.fulfill(status=200, content_type='application/json', body=json.dumps(body))
        if u.endswith('/api/event'):
            try: seen.append(('event', json.loads(r.request.post_data or '{}').get('name')))
            except Exception: pass
        return r.fulfill(status=204, body='')
    ctx.route('**/api/**', api)
    def tool(r):
        seen.append(('tool', r.request.url))
        return r.fulfill(status=200, content_type='application/javascript', body='/* fake */')
    ctx.route('https://www.clarity.ms/**', tool)
    ctx.route('https://www.googletagmanager.com/**', tool)
    ctx.route('https://cdn.paddle.com/**', lambda r: r.fulfill(status=200, content_type='application/javascript', body='/* no paddle */'))
    if gpc: ctx.add_init_script("Object.defineProperty(navigator, 'globalPrivacyControl', { get: () => true })")
    return ctx, seen


def tools(seen): return [u for k, u in seen if k == 'tool']
def ckies(ctx): return {c['name']: c['value'] for c in ctx.cookies()}
def banner(pg): return pg.evaluate("() => { const b = document.querySelector('.st-cc'); if (!b) return false; const r = b.getBoundingClientRect(); return r.height > 0 && r.bottom <= innerHeight + 1 && getComputedStyle(b).visibility !== 'hidden'; }")


def consent_run(b, PW, base, lang, dev):
    t = T[lang]; tag = dev + ' ' + lang
    home = base + ('' if lang == 'en' else 'fr/'); pricing = base + ('pricing.html' if lang == 'en' else 'fr/tarifs.html')
    # 1. nothing set: no banner, nothing loaded
    ctx, seen = context(b, PW, lang, dev, None)
    pg = ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.goto(pricing, wait_until='load'); pg.wait_for_timeout(1200)
    check(tag + ' : sans Clarity ni GA4 réglés : pas de bandeau, rien chargé', not banner(pg) and not tools(seen))
    ctx.close()
    # 2. tools set: banner, nothing before the choice
    ctx, seen = context(b, PW, lang, dev, MEASURE)
    pg = ctx.new_page(); pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.goto(pricing, wait_until='load'); pg.wait_for_selector('.st-cc', timeout=8000); pg.wait_for_timeout(600)
    check(tag + ' : le bandeau apparaît', banner(pg))
    sz = pg.evaluate("() => [...document.querySelectorAll('.st-cc button')].map(b => { const r = b.getBoundingClientRect(), s = getComputedStyle(b); return [b.textContent, Math.round(r.width), Math.round(r.height), s.fontWeight, s.fontSize, s.backgroundColor]; })")
    check(tag + ' : « %s » et « %s » de même taille et même aspect' % (t['no'], t['yes']), len(sz) == 2 and {sz[0][0], sz[1][0]} == {t['yes'], t['no']} and sz[0][1:] == sz[1][1:], sz)
    check(tag + ' : rien de chargé ni de déposé avant le choix', not tools(seen) and not [c for c in ckies(ctx) if c.startswith(('_ga', '_cl'))], (tools(seen), ckies(ctx)))
    box = pg.evaluate("() => { const r = document.querySelector('.st-cc').getBoundingClientRect(); return [r.left, r.right, innerWidth, document.documentElement.scrollWidth]; }")
    check(tag + ' : le bandeau tient dans l’écran (pas de défilement de côté)', box[0] >= 0 and box[1] <= box[2] and box[3] <= box[2], box)
    if SHOTS: pg.screenshot(path=os.path.join(SHOTS, 'bandeau-%s-%s.png' % (dev.replace(' ', '').lower(), lang)))
    # « Refuser »: still nothing, kept, the footer link opens it again
    pg.locator('.st-cc button[data-cc="n"]').click(); pg.wait_for_timeout(500)
    check(tag + ' : « %s » : le bandeau part, rien chargé, choix gardé' % t['no'], not banner(pg) and not tools(seen) and ckies(ctx).get('stalak_cc') == 'n', ckies(ctx))
    c = [x for x in ctx.cookies() if x['name'] == 'stalak_cc'][0]
    import time
    check(tag + ' : le choix est gardé 6 mois', 175 * 86400 < c['expires'] - time.time() < 190 * 86400, c['expires'])
    pg.reload(wait_until='load'); pg.wait_for_timeout(1200)
    check(tag + ' : après rechargement : pas de bandeau, toujours rien', not banner(pg) and not tools(seen))
    link = pg.locator('footer [data-ck]').first
    link.scroll_into_view_if_needed(); link.click(); pg.wait_for_timeout(500)
    check(tag + ' : « %s » dans le pied de page rouvre le bandeau' % t['ck'], banner(pg) and pg.url.startswith(pricing.split('#')[0]))
    # « Accepter »: Clarity and GA4 with their ids, the masking, the funnel
    pg.locator('.st-cc button[data-cc="y"]').click(); pg.wait_for_timeout(1200)
    tl = tools(seen)
    check(tag + ' : « %s » : Clarity chargé avec son identifiant' % t['yes'], any('clarity.ms/tag/tstclar01' in u for u in tl), tl)
    check(tag + ' : « %s » : Google Analytics chargé avec son identifiant' % t['yes'], any('googletagmanager.com/gtag/js?id=G-TEST12345' in u for u in tl), tl)
    check(tag + ' : les réponses du bandeau sont comptées (anonyme)', ('event', 'consent_no') in seen and ('event', 'consent_yes') in seen)
    ctx.close()
    # the home page (the app): accueil_vue, the funnel, the masking; a reload keeps it; « Refuser » deletes the cookies
    ctx, seen = context(b, PW, lang, dev, MEASURE, me='yes')
    ctx.add_cookies([{'name': 'stalak_cc', 'value': 'y', 'url': base}])
    pg = ctx.new_page(); pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.goto(home, wait_until='load'); pg.wait_for_function('() => !!window.StalakConsent && !!window.StalakAccount', timeout=30000); pg.wait_for_timeout(1500)
    check(tag + ' : déjà accepté : chargé sans bandeau', not banner(pg) and len(tools(seen)) >= 2, tools(seen))
    pg.evaluate("() => { StalakAccount.event('plans_open', { why: 'wm' }); StalakAccount.event('checkout_open'); StalakAccount.event('export_ok'); }"); pg.wait_for_timeout(300)
    dl = pg.evaluate("() => (window.dataLayer || []).map(a => Array.from(a)).filter(a => a[0] === 'event').map(a => [a[1], a[2] || {}])")
    names = [d[0] for d in dl]
    check(tag + ' : GA4 reçoit accueil_vue, paywall_vu (avec l’endroit), checkout_ouvert, export_ok', 'accueil_vue' in names and ['paywall_vu', {'endroit': 'wm'}] in dl and 'checkout_ouvert' in names and 'export_ok' in names, dl)
    check(tag + ' : les compteurs anonymes restent', ('event', 'plans_open') in seen and ('event', 'checkout_open') in seen)
    pg.evaluate("() => { const i = document.createElement('input'); i.type = 'email'; i.id = 'zz'; document.body.appendChild(i); const c = document.createElement('canvas'); c.id = 'zc'; document.body.appendChild(c); }"); pg.wait_for_timeout(300)
    m = pg.evaluate("() => [document.querySelector('#zz').getAttribute('data-clarity-mask'), document.querySelector('#zc').getAttribute('data-clarity-mask'), [...document.querySelectorAll('video,canvas,input')].every(e => e.getAttribute('data-clarity-mask') === 'true')]")
    check(tag + ' : Clarity : champs, aperçus et vidéos masqués', m == ['true', 'true', True], m)
    ctx.add_cookies([{'name': '_ga', 'value': 'GA1.1.1', 'url': base}, {'name': '_clck', 'value': 'x', 'url': base}])
    pg.evaluate("() => StalakConsent.open()"); pg.wait_for_selector('.st-cc', timeout=5000)
    pg.locator('.st-cc button[data-cc="n"]').click(); pg.wait_for_timeout(400)
    left = [c for c in ckies(ctx) if c.startswith(('_ga', '_cl'))]
    check(tag + ' : « %s » après « %s » : les cookies de mesure sont effacés' % (t['no'], t['yes']), not left and ckies(ctx).get('stalak_cc') == 'n', left)
    pg.evaluate("() => StalakAccount.event('checkout_open')"); pg.wait_for_timeout(200)
    dl2 = pg.evaluate("() => (window.dataLayer || []).map(a => Array.from(a)).filter(a => a[0] === 'event').length")
    check(tag + ' : plus rien envoyé à GA4 après le refus', dl2 == len(dl), (dl2, len(dl)))
    check(tag + ' : aucune erreur dans la page', not errs, errs[:3])
    ctx.close()
    # GPC
    ctx, seen = context(b, PW, lang, dev, MEASURE, gpc=True)
    pg = ctx.new_page(); pg.goto(pricing, wait_until='load'); pg.wait_for_timeout(1500)
    check(tag + ' : GPC (signal de refus du navigateur) : pas de bandeau, rien chargé', not banner(pg) and not tools(seen))
    ctx.close()


def offer_run(b, PW, base, site, lang, dev):
    t = T[lang]
    for me, label in (('yes', 'droit à l’offre'), ('no', 'déjà eu un essai')):
        tag = dev + ' ' + lang + ' (' + label + ')'
        ctx, seen = context(b, PW, lang, dev, None, me=me)
        pg = ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
        pg.goto(base + ('' if lang == 'en' else 'fr/'), wait_until='load'); pg.wait_for_function('window.__ev && window.MP4Box', timeout=60000)
        pg.wait_for_function('() => __ev("!!plCfg && ACCT.state.user !== null")', timeout=20000); pg.wait_for_timeout(500)
        pg.evaluate('s => __ev(s)', "ACCT.checkout = (p, i, o) => { window.__co = [p, i, o || null]; return new Promise(() => {}); }")
        if me == 'yes': pg.evaluate('s => __ev(s)', "ACCT.offerPrices = () => Promise.resolve({ today: " + json.dumps('1,20 €' if lang == 'fr' else '€1.20') + ", then: " + json.dumps('9,59 $US' if lang == 'fr' else '$9.59') + " })")
        pg.set_input_files('#songFile', os.path.join(site, 'beat.wav')); pg.wait_for_function('() => __ev("!!S.song")', timeout=60000)
        pg.set_input_files('#takeFiles', [os.path.join(site, 'take1.mp4')])
        pg.wait_for_function('''() => __ev("S.takes.length === 1 && S.takes.every(t => t.status !== 'pending')")''', timeout=180000)
        pg.evaluate('s => __ev(s)', 'go(4)'); pg.wait_for_function('() => __ev("S.cuts.length > 0")', timeout=60000); pg.wait_for_timeout(1200)
        pg.evaluate('() => { __ev("exportOne()"); }')
        pg.wait_for_function('() => __ev("S.exporting")', timeout=20000)
        pg.wait_for_function('() => __ev("S.done && !S.exporting && cmpReady === lastBlob")', timeout=300000); pg.wait_for_timeout(2600)
        r = pg.evaluate('''() => { const q = s => document.querySelector(s), go = q('#dvCmpGo'), of = q('#dvOffer1'), tr = q('#dvTrial');
            const sp = s => (s || '').replace(/\\u00a0|\\u202f/g, ' ').trim();
            return { go: sp(go.innerText), goShown: !go.hidden && !!go.offsetParent, of: sp(of.textContent), ofShown: !of.hidden && !!of.offsetParent, trShown: !tr.hidden && !!tr.offsetParent,
              gap: of.getBoundingClientRect().top - go.getBoundingClientRect().bottom, fs: parseFloat(getComputedStyle(of).fontSize), color: getComputedStyle(of).color,
              vw: innerWidth, sw: document.documentElement.scrollWidth }; }''')
        if me == 'yes':
            check(tag + ' : écran de fin avec filigrane : « %s 1,20 € » (montant donné par Paddle)' % t['go'], r['goShown'] and r['go'].startswith(t['go']) and ('1,20 €' in r['go'] or '€1.20' in r['go']), r['go'])
            check(tag + ' : juste dessous, lisible : le prix aujourd’hui, puis par mois dans 7 jours, annulable', r['ofShown'] and all(x in r['of'] for x in t['terms']) and ('9,59' in r['of'] or '9.59' in r['of']) and 0 <= r['gap'] <= 24 and r['fs'] >= 13.5, r)
            check(tag + ' : pas de texte d’essai gratuit sur cet écran', not r['trShown'] and t['trial'] not in r['go'], r)
            if SHOTS:
                pg.locator('#dvCmpGo').scroll_into_view_if_needed(); pg.wait_for_timeout(300)
                pg.screenshot(path=os.path.join(SHOTS, 'offre-1-euro-%s-%s.png' % (dev.replace(' ', '').lower(), lang)))
            pg.locator('#dvCmpGo').click(); pg.wait_for_timeout(700)
            co = pg.evaluate('s => __ev(s)', 'window.__co')
            check(tag + ' : le paiement s’ouvre avec l’offre (Pro, mensuel)', co == ['pro', 'month', {'kind': 'offer1'}], co)
        else:
            check(tag + ' : sans droit : pas d’offre à 1 €', not r['ofShown'] and t['go'] not in r['go'], r)
        check(tag + ' : rien de plus large que l’écran', r['sw'] <= r['vw'], (r['sw'], r['vw']))
        check(tag + ' : aucune erreur dans la page', not errs, errs[:3])
        ctx.close()


def main():
    tmp = tempfile.mkdtemp(prefix='stalak-mesure-')
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
        for lang, dev in (('fr', 'iPhone 12'), ('en', 'ordinateur'), ('en', 'iPhone 12'), ('fr', 'ordinateur')):
            try: consent_run(b, p, base, lang, dev)
            except Exception as e: check(dev + ' ' + lang + ' : bandeau, déroulé complet', False, str(e)[:400])
        for lang, dev in (('fr', 'iPhone 12'), ('en', 'ordinateur')):
            try: offer_run(b, p, base, site, lang, dev)
            except Exception as e: check(dev + ' ' + lang + ' : offre 1 €, déroulé complet', False, str(e)[:400])
        b.close()
    srv.shutdown(); shutil.rmtree(tmp, ignore_errors=True)
    print('%d/%d réussis' % (sum(results), len(results)))
    sys.exit(0 if all(results) else 1)


main()
