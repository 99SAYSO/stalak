"""Test of the mobile redesign, lot 2 (docs/handoff/chef-refonte-mobile-app.md, demos n° 2, 3, 4 and 13): the sign-in and the
profile as full screens, pull to refresh on « Montages », the onboarding. Python Playwright (chromium) on the test server
with real accounts:

    node tests/ui/cloud-server.mjs <built public/ folder> 8801 &
    python3 /abs/path/tests/ui/refonte_mobile2_ui.py http://127.0.0.1:8801 [folder for screenshots]

Checked, in French and English, on an iPhone 12 and an iPhone SE:
- the sign-in: full screen (no bar at the bottom), the scene (mascot, bubble), the e-mail first then « Continuer » shows the
  rest of the SAME form (password, « Mot de passe oublié ? »); a wrong e-mail does not pass; « Créer un compte » keeps its
  legal sentence and its links; the form still reaches the server; closing it gives the home screen and its bar back;
- the profile: photo, name, e-mail, « Ma formule » (opens the plans), « Mes montages », the language (the page changes
  language), the help, the legal links of the footer in a sheet (each one leads to a page that exists), the settings (photo,
  name, password, delete: the cards of before) and back, « Se déconnecter »;
- pull to refresh on « Montages »: the list is asked again from the server, the page comes back in place;
- the onboarding: only at a first launch (never again once done or passed), one question per screen, several answers where
  said, the two questions about streaming only for someone already on the platforms, « Passer » everywhere; the loading
  screen and the plan only repeat the answers given (nothing invented: no line about listeners for someone who gave none);
  the answers are kept; with « less motion » it works without any animation;
- on a computer nothing of this is loaded; nothing wider than the screen, no error in the page."""
import json, os, sys, urllib.request
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.sync_api import sync_playwright

BASE = sys.argv[1].rstrip('/')
SHOTS = sys.argv[2] if len(sys.argv) > 2 else None
results = []
T = {'fr': {'in': 'Connecte-toi à Stalak', 'up': 'Crée ton compte Stalak', 'cont': 'Continuer', 'plan': 'Ma formule', 'free': 'Gratuit', 'out': 'Se déconnecter', 'gal': 'Mes montages',
            'legal': ['/fr/conditions', '/fr/confidentialite', '/fr/remboursement'], 'q0': 'Ton nom d’artiste ?', 'skip': 'Passer', 'go': 'Faire ma 1re vidéo', 'ready': 'Ton plan est prêt, T-Crazy !',
            'readyN': 'Ton plan est prêt !', 'from': '100 à 1 000', 'to': '10 000', 'who': 'Rap et Drill, sur TikTok et Reels', 'temps': 'Stalak coupe tes prises sur le rythme à ta place', 'aud': 'auditeurs'},
     'en': {'in': 'Sign in to Stalak', 'up': 'Create your Stalak account', 'cont': 'Continue', 'plan': 'My plan', 'free': 'Free', 'out': 'Sign out', 'gal': 'My edits',
            'legal': ['/terms', '/privacy', '/refunds'], 'q0': 'Your artist name?', 'skip': 'Skip', 'go': 'Make my first video', 'ready': 'Your plan is ready, T-Crazy!',
            'readyN': 'Your plan is ready!', 'from': '100 to 1,000', 'to': '10,000', 'who': 'Rap and Drill, on TikTok and Reels', 'temps': 'Stalak cuts your takes to the beat for you', 'aud': 'listeners'}}


def check(name, ok, info=''):
    results.append(bool(ok))
    print(('PASS ' if ok else 'FAIL ') + name + (('  — ' + str(info)) if info and not ok else ''), flush=True)


def vis(pg, sel):
    return pg.evaluate("s => { const e = document.querySelector(s); return !!e && e.getClientRects().length > 0 && getComputedStyle(e).visibility !== 'hidden'; }", sel)


def no_hscroll(pg):
    return pg.evaluate('document.documentElement.scrollWidth <= innerWidth + 1')


def page(b, PW, dev, lang, email=None, pro='0', onb=False, calm=False):
    opts = dict(PW.devices[dev]) if dev != 'ordi' else {'viewport': {'width': 1280, 'height': 860}}
    ctx = b.new_context(**opts, locale='fr-FR' if lang == 'fr' else 'en-US', reduced_motion='reduce' if calm else 'no-preference')
    if onb: ctx.add_init_script('window.__stalakOnb = 1;')
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    to = '/fr/' if lang == 'fr' else '/'
    if email:
        pg.goto(BASE + '/__test/login?email=%s&pro=%s&to=%s' % (email, pro, to), wait_until='load')
        uid = pg.evaluate("() => fetch('/api/me').then(r => r.json()).then(d => d.user && d.user.id)")
        pg.evaluate("id => localStorage.setItem('stalak:proThanks:' + id, '1')", uid)
    pg.goto(BASE + to, wait_until='load')
    pg.wait_for_function('window.StalakM && (innerWidth >= 900 || window.StalakM2)', timeout=20000); pg.wait_for_timeout(700)
    return ctx, pg, errs


def shot(pg, name):
    if SHOTS: pg.screenshot(path=os.path.join(SHOTS, name + '.png'))


def exists(path):
    try: return urllib.request.urlopen(BASE + path).status == 200
    except Exception: return False


def login(b, PW, dev, lang):
    tag = dev + ' ' + lang + ' (connexion)'; t = T[lang]
    ctx, pg, errs = page(b, PW, dev, lang)
    pg.tap('#tabBar [data-tab=account]'); pg.wait_for_selector('#apLogin:not([hidden]) .m2-scene', timeout=8000); pg.wait_for_timeout(1100)
    check(tag + ' : plein écran, la barre du bas est partie', not vis(pg, '#tabBar') and pg.evaluate("document.documentElement.classList.contains('m2-login')"))
    title = pg.locator('.m2-lt').inner_text().replace('\n', ' ').strip()
    check(tag + ' : la scène (mascotte, bulle) et le titre « %s »' % t['in'], vis(pg, '.m2-masc') and vis(pg, '.m2-bub') and title == t['in'] and len(pg.locator('.m2-bub').inner_text().strip()) > 3, title)
    check(tag + ' : la phrase qui dit vrai sur le compte reste (pas de promesse de sauvegarde gratuite)', vis(pg, '.ap-noacct'))
    check(tag + ' : l’e-mail d’abord : un champ, « %s », pas encore de mot de passe' % t['cont'], vis(pg, '#apInMail') and vis(pg, '#apInF .m2-cont') and not vis(pg, '#apInPw') and not vis(pg, '#apInF .ap-go')
          and pg.locator('#apInF .m2-cont').inner_text().strip() == t['cont'])
    bb = pg.locator('#apInF .m2-cont').bounding_box(); cs = pg.evaluate("() => { const c = getComputedStyle(document.querySelector('#apInF .m2-cont')); return [c.backgroundColor, c.borderTopColor, c.boxShadow]; }")
    check(tag + ' : le bouton principal : bleu, contour encre, ombre dure, 56 px au moins', cs[0] == 'rgb(31, 111, 214)' and cs[1] == 'rgb(10, 13, 20)' and 'rgb(10, 13, 20) 0px 6px 0px 0px' in cs[2] and bb['height'] >= 56, (cs, bb))
    shot(pg, 'connexion-%s-%s' % (dev.replace(' ', ''), lang))
    pg.fill('#apInMail', 'pas-un-email'); pg.tap('#apInF .m2-cont'); pg.wait_for_timeout(400)
    check(tag + ' : un e-mail faux ne passe pas', not vis(pg, '#apInPw'))
    pg.fill('#apInMail', 'personne@example.com'); pg.tap('#apInF .m2-cont'); pg.wait_for_timeout(900)
    check(tag + ' : « %s » : le mot de passe, « Mot de passe oublié ? » et le vrai bouton arrivent, le clavier sur le mot de passe' % t['cont'],
          vis(pg, '#apInPw') and vis(pg, '#apForgot') and vis(pg, '#apInF .ap-go') and not vis(pg, '#apInF .m2-cont') and pg.evaluate('document.activeElement.id') == 'apInPw')
    reqs = []
    pg.on('request', lambda r: reqs.append(r.url) if r.method == 'POST' and '/api/' in r.url else None)
    pg.fill('#apInPw', 'mauvais-mot-de-passe'); pg.locator('#apInF .ap-go').tap(); pg.wait_for_timeout(1500)
    check(tag + ' : le formulaire part toujours au serveur (les règles des comptes ne changent pas)', any('/api/auth' in u or '/api/login' in u or '/api/' in u for u in reqs), reqs)
    check(tag + ' : rien ne dépasse de l’écran', no_hscroll(pg))
    # create an account: the same way, with its legal sentence
    pg.evaluate("document.querySelector('#apToUp button').click()"); pg.wait_for_timeout(900)
    title = pg.locator('.m2-lt').inner_text().replace('\n', ' ').strip()
    links = pg.evaluate("() => [...document.querySelectorAll('#apUpF .ap-uplegal a')].map(a => a.getAttribute('href'))")
    check(tag + ' : « Créer un compte » : titre « %s », mot de passe, pseudo, la phrase légale et ses 2 liens' % t['up'], title == t['up'] and vis(pg, '#apUpPw') and vis(pg, '#apUpName') and vis(pg, '#apUpF .ap-uplegal')
          and len(links) == 2 and all(exists(h) for h in links), (title, links))
    shot(pg, 'inscription-%s-%s' % (dev.replace(' ', ''), lang))
    pg.locator('#apBack').tap(); pg.wait_for_timeout(900)
    check(tag + ' : fermer : l’accueil et sa barre reviennent', vis(pg, '#tabBar') and not vis(pg, '#acctPage') and not pg.evaluate("document.documentElement.classList.contains('m2-login')"))
    # opened again: the e-mail first again
    pg.tap('#tabBar [data-tab=account]'); pg.wait_for_timeout(900)
    check(tag + ' : rouvert : de nouveau l’e-mail d’abord', pg.locator('.m2-cont:visible').count() == 1 and not vis(pg, '#apInPw') and not vis(pg, '#apUpPw'))
    check(tag + ' : aucune erreur dans la page', not errs, errs)
    ctx.close()


def profile(b, PW, dev, lang):
    tag = dev + ' ' + lang + ' (profil)'; t = T[lang]
    mail = 'm2-%s-%s@example.com' % (dev.replace(' ', '').lower(), lang)
    ctx, pg, errs = page(b, PW, dev, lang, mail)
    pg.tap('#tabBar [data-tab=account]'); pg.wait_for_selector('#apAccount:not([hidden]) .m2-pf', timeout=8000); pg.wait_for_timeout(1100)
    txt = pg.locator('.m2-pf').inner_text()
    check(tag + ' : son écran à lui : photo, nom, e-mail, la barre du bas reste', vis(pg, '#m2Av') and pg.locator('#m2Name').inner_text().strip() == mail.split('@')[0] and mail in txt and vis(pg, '#tabBar'), txt[:200])
    check(tag + ' : les anciennes cartes sont rangées dans les réglages', not vis(pg, '#apNameF') and not vis(pg, '#apOut') and not vis(pg, '#apDel'))
    check(tag + ' : « %s » : %s' % (t['plan'], t['free']), t['plan'] in pg.locator('#m2Plan').inner_text() and t['free'] in pg.locator('#m2Plan').inner_text())
    rows = pg.evaluate("() => [...document.querySelectorAll('.m2-list .m2-row')].map(r => Math.round(r.getBoundingClientRect().height))")
    check(tag + ' : la liste : 5 lignes de 44 px au moins', len(rows) == 5 and min(rows) >= 44, rows)
    check(tag + ' : rien ne dépasse de l’écran', no_hscroll(pg))
    shot(pg, 'profil-%s-%s' % (dev.replace(' ', ''), lang))
    # the legal links
    pg.tap('#m2Legal'); pg.wait_for_selector('.m2-sheet', timeout=4000); pg.wait_for_timeout(700)
    hrefs = pg.evaluate("() => [...document.querySelectorAll('.m2-sheet a')].map(a => a.getAttribute('href'))")
    inner = [h for h in hrefs if h.startswith('/')]
    check(tag + ' : « Infos légales et guides » : conditions, confidentialité, remboursement, et chaque lien mène à une page qui existe',
          all(h in hrefs for h in t['legal']) and len(inner) >= 8 and all(exists(h) for h in inner), [h for h in inner if not exists(h)] or hrefs)
    shot(pg, 'legal-%s-%s' % (dev.replace(' ', ''), lang))
    pg.tap('.m2-sheet .m2-x'); pg.wait_for_timeout(700)
    check(tag + ' : la feuille se ferme', pg.locator('.m2-sheet').count() == 0)
    # the settings and back
    pg.tap('#m2Gear'); pg.wait_for_timeout(800)
    check(tag + ' : réglages : photo, pseudo, mot de passe, « Supprimer mon compte », rien ne manque', vis(pg, '#apNameF') and vis(pg, '#apAvIn') is not None and vis(pg, '#apPwEdit') and vis(pg, '#apDel') and vis(pg, '#apOut') and not vis(pg, '.m2-pf'))
    pg.locator('#apBack').tap(); pg.wait_for_timeout(700)
    check(tag + ' : « Retour » revient au profil', vis(pg, '.m2-pf') and not vis(pg, '#apNameF'))
    # the plans
    pg.tap('#m2Plan'); pg.wait_for_selector('#apPro:not([hidden])', timeout=5000); pg.wait_for_timeout(600)
    check(tag + ' : « %s » ouvre les formules' % t['plan'], vis(pg, '#apBuy') and not vis(pg, '.m2-pf'))
    pg.go_back(); pg.wait_for_selector('#apAccount:not([hidden])', timeout=5000); pg.wait_for_timeout(600)
    # « Mes montages »
    pg.tap('#m2Gal'); pg.wait_for_selector('#apGallery:not([hidden])', timeout=5000)
    check(tag + ' : « %s » ouvre la galerie' % t['gal'], True)
    pg.go_back(); pg.wait_for_selector('#apAccount:not([hidden])', timeout=5000); pg.wait_for_timeout(600)
    # the language
    other = 'en' if lang == 'fr' else 'fr'
    pg.locator('.m2-pf .langsw button[data-lang="%s"]' % other).tap(); pg.wait_for_timeout(900)
    check(tag + ' : la langue : tout le profil change, l’adresse aussi', T[other]['plan'] in pg.locator('#m2Plan').inner_text() and pg.locator('#m2Out').inner_text().strip() == T[other]['out']
          and pg.evaluate('location.pathname') == ('/fr/' if other == 'fr' else '/'), pg.locator('#m2Plan').inner_text())
    pg.locator('.m2-pf .langsw button[data-lang="%s"]' % lang).tap(); pg.wait_for_timeout(700)
    # sign out
    pg.locator('#m2Out').scroll_into_view_if_needed(); pg.tap('#m2Out')
    pg.wait_for_function("() => !window.StalakAccount.state.user", timeout=8000); pg.wait_for_timeout(900)
    check(tag + ' : « %s » déconnecte' % t['out'], not vis(pg, '.m2-pf'))
    check(tag + ' : aucune erreur dans la page', not errs, errs)
    ctx.close()


PULL = """(dy) => { const p = document.querySelector('#acctPage');
  const T = (t, y) => p.dispatchEvent(new TouchEvent(t, { bubbles: true, cancelable: true, touches: t === 'touchend' ? [] : [new Touch({ identifier: 1, target: p, clientX: 200, clientY: y })], changedTouches: [new Touch({ identifier: 1, target: p, clientX: 200, clientY: y })] }));
  T('touchstart', 200); for (let y = 210; y <= 200 + dy; y += 15) T('touchmove', y); return () => 0; }"""


def pull(b, PW, dev, lang):
    tag = dev + ' ' + lang + ' (tirer pour rafraîchir)'
    ctx, pg, errs = page(b, PW, dev, lang, 'm2-pro-%s-%s@example.com' % (dev.replace(' ', '').lower(), lang), '1')
    pg.tap('#tabBar [data-tab=gallery]'); pg.wait_for_selector('#apGallery:not([hidden])', timeout=8000); pg.wait_for_timeout(1200)
    asked = []
    pg.on('request', lambda r: asked.append(r.url) if r.method == 'GET' and '/api/projects' in r.url else None)
    # a small pull: nothing is asked, the page comes back
    pg.evaluate(PULL, 90); pg.wait_for_timeout(200)
    mid = pg.evaluate("() => [document.querySelector('#acctPage').getBoundingClientRect().top, document.querySelector('.m2-ptr').getBoundingClientRect().height]")
    pg.evaluate("() => { const p = document.querySelector('#acctPage'); p.dispatchEvent(new TouchEvent('touchend', { bubbles: true, cancelable: true, touches: [], changedTouches: [new Touch({ identifier: 1, target: p, clientX: 200, clientY: 290 })] })); }")
    pg.wait_for_timeout(1200)
    check(tag + ' : un petit tirage : la page descend, le fond bleu et la capuche derrière, puis tout revient sans rien demander',
          mid[0] > 20 and mid[1] > 20 and not asked and abs(pg.evaluate("document.querySelector('#acctPage').getBoundingClientRect().top")) < 1, (mid, asked))
    # a real pull
    pg.evaluate(PULL, 420); pg.wait_for_timeout(250)
    shot(pg, 'tirer-%s-%s' % (dev.replace(' ', ''), lang))
    pg.evaluate("() => { const p = document.querySelector('#acctPage'); p.dispatchEvent(new TouchEvent('touchend', { bubbles: true, cancelable: true, touches: [], changedTouches: [new Touch({ identifier: 1, target: p, clientX: 200, clientY: 620 })] })); }")
    pg.wait_for_timeout(3600)
    check(tag + ' : un vrai tirage : la liste est redemandée au serveur', len(asked) >= 1, asked)
    check(tag + ' : … puis la page est revenue à sa place, la galerie toujours là', abs(pg.evaluate("document.querySelector('#acctPage').getBoundingClientRect().top")) < 1 and vis(pg, '#apGallery')
          and not pg.evaluate("document.documentElement.classList.contains('m2-pull')"))
    check(tag + ' : aucune erreur dans la page', not errs, errs)
    ctx.close()


def onboarding(b, PW, dev, lang, calm=False):
    tag = dev + ' ' + lang + (' (onboarding, moins d’animations)' if calm else ' (onboarding)'); t = T[lang]
    W = 250 if calm else 1000
    ctx, pg, errs = page(b, PW, dev, lang, onb=True, calm=calm)
    pg.wait_for_selector('#m2Onb', timeout=8000); pg.wait_for_timeout(W)
    check(tag + ' : au premier lancement : « %s », un champ, « %s », la barre du bas cachée' % (t['q0'], t['skip']), pg.locator('.ob-q.on h1').inner_text().strip() == t['q0'] and vis(pg, '#obName')
          and pg.locator('.ob-skip').inner_text().strip() == t['skip'] and not vis(pg, '#tabBar'))
    cs = pg.evaluate("() => { const c = getComputedStyle(document.querySelector('.ob-cta')); const r = document.querySelector('.ob-cta').getBoundingClientRect(); return [c.backgroundColor, c.borderTopColor, r.bottom <= innerHeight, r.height]; }")
    check(tag + ' : un seul bouton principal, en bas, bleu à contour encre', cs[0] == 'rgb(31, 111, 214)' and cs[1] == 'rgb(10, 13, 20)' and cs[2] and cs[3] >= 56 and pg.locator('.ob-cta:visible').count() == 1, cs)
    shot(pg, 'onboarding-0-%s-%s' % (dev.replace(' ', ''), lang))
    seen = [0]

    def nxt():
        pg.tap('.ob-cta'); pg.wait_for_timeout(W); i = int(pg.locator('.ob-q.on').get_attribute('data-i')); seen.append(i); return i
    pg.fill('#obName', 'T-Crazy'); i = nxt()
    bub = pg.locator('#m2Onb .m2-bub').inner_text()
    check(tag + ' : la mascotte répond avec son nom', 'T-Crazy' in bub, bub)
    pg.tap('.ob-q.on [data-v=rap]'); pg.tap('.ob-q.on [data-v=drill]')
    check(tag + ' : plusieurs choix possibles (2 cochés)', pg.locator('.ob-q.on .ob-op[aria-pressed=true]').count() == 2)
    shot(pg, 'onboarding-1-%s-%s' % (dev.replace(' ', ''), lang))
    i = nxt(); pg.tap('.ob-q.on [data-v=oui]'); i = nxt()
    check(tag + ' : déjà sur les plateformes : les liens (facultatifs, et la phrase dit qu’on ne lit pas ses écoutes)', i == 3 and pg.locator('.ob-q.on .ob-in').count() == 4
          and ('ne lit pas' in pg.locator('.ob-q.on .ob-hint').inner_text() or 'do not read' in pg.locator('.ob-q.on .ob-hint').inner_text()), i)
    pg.fill('.ob-in[data-l=spotify] input', 'open.spotify.com/artist/abc')
    i = nxt(); check(tag + ' : puis ses auditeurs d’aujourd’hui (c’est lui qui le dit)', i == 4); pg.tap('.ob-q.on [data-v=b]')
    i = nxt(); pg.tap('.ob-q.on [data-v=tiktok]'); pg.tap('.ob-q.on [data-v=reels]')
    i = nxt(); pg.tap('.ob-q.on [data-v=temps]')
    i = nxt(); pg.tap('.ob-q.on [data-v=b]')
    i = nxt(); pg.tap('.ob-q.on [data-v=son]')
    check(tag + ' : 9 questions, une par écran, dans l’ordre', seen == list(range(9)), seen)
    check(tag + ' : rien ne dépasse de l’écran', no_hscroll(pg))
    pg.tap('.ob-cta')
    lines = []
    if not calm:
        pg.wait_for_selector('.ob-load.on', timeout=4000); pg.wait_for_timeout(700)
        lines = pg.evaluate("() => [...document.querySelectorAll('.ob-ln')].map(l => l.innerText.trim())")
        check(tag + ' : chargement : 4 phrases, toutes tirées de ses réponses (auditeurs, genres, 9:16 pour ses réseaux, objectif)',
              len(lines) == 4 and t['from'].lower() in lines[0].lower() and 'Rap' in lines[1] and '9:16' in lines[2] and 'TikTok' in lines[2] and t['to'] in lines[3], lines)
        shot(pg, 'onboarding-chargement-%s-%s' % (dev.replace(' ', ''), lang))
    pg.wait_for_selector('.ob-plan', timeout=15000); pg.wait_for_timeout(W + 600)
    plan = pg.evaluate("() => [...document.querySelectorAll('.ob-plan div > span')].map(l => l.innerText.trim())"); head = pg.locator('.ob-q.on h1').inner_text().replace('\n', ' ').strip()
    check(tag + ' : « %s » et un plan fait de ses réponses' % t['ready'], head == t['ready'] and plan[0] == t['who'] and t['from'].lower() in plan[1].lower() and t['to'] in plan[1] and t['temps'] in plan, (head, plan))
    check(tag + ' : aucune promesse : ni nombre de vues, ni « 3 vidéos par semaine », ni suivi automatique des écoutes', not any(w in ' '.join(plan + lines).lower() for w in ('vues', 'views', 'par semaine', 'per week', 'chaque semaine', 'every week')), plan)
    check(tag + ' : un seul bouton : « %s »' % t['go'], pg.locator('.ob-cta').inner_text().strip() == t['go'] and not vis(pg, '.ob-skip'))
    shot(pg, 'onboarding-plan-%s-%s' % (dev.replace(' ', ''), lang))
    st = json.loads(pg.evaluate("localStorage.getItem('stalak:onb')"))
    check(tag + ' : les réponses sont gardées', st.get('done') and st['a'] == {'name': 'T-Crazy', 'genres': ['rap', 'drill'], 'onPlatforms': 'oui', 'links': {'spotify': 'open.spotify.com/artist/abc'}, 'listeners': 'b',
                                                                          'posts': ['tiktok', 'reels'], 'blocks': ['temps'], 'target': 'b', 'goals': ['son']}, st)
    pg.tap('.ob-cta'); pg.wait_for_timeout(W + 400)
    check(tag + ' : « %s » : l’accueil, sa barre et son gros bouton' % t['go'], pg.locator('#m2Onb').count() == 0 and vis(pg, '#tabBar') and vis(pg, '#heroSong'))
    pg.reload(wait_until='load'); pg.wait_for_function('window.StalakM2', timeout=20000); pg.wait_for_timeout(1500)
    check(tag + ' : jamais une 2e fois', pg.locator('#m2Onb').count() == 0)
    check(tag + ' : aucune erreur dans la page', not errs, errs)
    ctx.close()


def onboarding_short(b, PW, dev, lang):
    """Not on the platforms, nothing ticked, no name: fewer questions, and the plan says nothing it does not know."""
    tag = dev + ' ' + lang + ' (onboarding, peu de réponses)'; t = T[lang]
    ctx, pg, errs = page(b, PW, dev, lang, onb=True)
    pg.wait_for_selector('#m2Onb', timeout=8000); pg.wait_for_timeout(900)
    seen = [0]
    for k in range(8):
        if int(pg.locator('.ob-q.on').get_attribute('data-i')) == 2: pg.tap('.ob-q.on [data-v=non]')
        pg.tap('.ob-cta'); pg.wait_for_timeout(900)
        if pg.locator('.ob-load.on').count(): break
        seen.append(int(pg.locator('.ob-q.on').get_attribute('data-i')))
    check(tag + ' : « Pas encore » : ni les liens ni les auditeurs d’aujourd’hui ne sont demandés', seen == [0, 1, 2, 5, 6, 7, 8], seen)
    lines = pg.evaluate("() => [...document.querySelectorAll('.ob-ln')].map(l => l.innerText.trim())")
    check(tag + ' : chargement : une seule phrase, sur ce que Stalak fait vraiment (aucune réponse à répéter)', len(lines) == 1 and t['aud'] not in lines[0], lines)
    pg.locator('.ob-load').tap(); pg.wait_for_selector('.ob-plan', timeout=15000); pg.wait_for_timeout(1500)
    plan = pg.evaluate("() => [...document.querySelectorAll('.ob-plan div > span')].map(l => l.innerText.trim())"); head = pg.locator('.ob-q.on h1').inner_text().strip()
    check(tag + ' : « %s » (sans nom), et un plan sans chiffre inventé' % t['readyN'], head == t['readyN'] and len(plan) == 1 and not any(c.isdigit() for c in plan[0].replace('1re', '').replace('first', '')), (head, plan))
    ctx.close()
    # « Passer » at the first question: nothing more, and never again
    ctx, pg, errs2 = page(b, PW, dev, lang, onb=True)
    pg.wait_for_selector('#m2Onb', timeout=8000); pg.wait_for_timeout(900)
    pg.tap('.ob-skip'); pg.wait_for_timeout(1100)
    st = json.loads(pg.evaluate("localStorage.getItem('stalak:onb')"))
    check(tag + ' : « %s » : l’accueil tout de suite, noté comme passé' % t['skip'], pg.locator('#m2Onb').count() == 0 and vis(pg, '#tabBar') and st.get('skipped') and not st.get('done'), st)
    pg.reload(wait_until='load'); pg.wait_for_function('window.StalakM2', timeout=20000); pg.wait_for_timeout(1500)
    check(tag + ' : … et plus jamais proposé', pg.locator('#m2Onb').count() == 0)
    check(tag + ' : aucune erreur dans la page', not errs and not errs2, errs + errs2)
    ctx.close()


def computer(b, PW, lang):
    tag = 'ordinateur ' + lang
    ctx, pg, errs = page(b, PW, 'ordi', lang, 'm2-ordi-%s@example.com' % lang)
    ctx2 = None
    check(tag + ' : rien du lot 2 n’est chargé (ni fichier, ni onboarding)', not pg.evaluate('!!window.StalakM2') and pg.locator('#m2Onb, .m2-pf, .m2-scene').count() == 0
          and not pg.evaluate("[...document.scripts].some(s => /mobile2/.test(s.src))"))
    pg.click('#acctBtn'); pg.wait_for_selector('#acctMenu:not([hidden])', timeout=5000); pg.click('#acctMenu [data-am=account]'); pg.wait_for_selector('#apAccount:not([hidden])', timeout=5000)
    check(tag + ' : « Ton compte » comme avant (cartes, « Se déconnecter »)', vis(pg, '#apNameF') and vis(pg, '#apOut') and vis(pg, '#apBack'))
    check(tag + ' : aucune erreur dans la page', not errs, errs)
    ctx.close()


def quiet(b, PW, lang):
    """An automated visit that does not ask for it, and a second visit: no onboarding."""
    ctx, pg, errs = page(b, PW, 'iPhone 12', lang)
    pg.wait_for_timeout(1500)
    check('iPhone 12 ' + lang + ' : pas d’onboarding pour un robot (tests, Google)', pg.locator('#m2Onb').count() == 0 and vis(pg, '#heroSong'))
    ctx.close()


def main():
    jobs = [(login, ('iPhone 12', 'fr')), (login, ('iPhone SE', 'en')), (profile, ('iPhone 12', 'fr')), (profile, ('iPhone SE', 'en')),
            (pull, ('iPhone 12', 'fr')), (onboarding, ('iPhone 12', 'fr')), (onboarding, ('iPhone SE', 'en')), (onboarding, ('iPhone 12', 'en', True)),
            (onboarding_short, ('iPhone 12', 'fr')), (onboarding_short, ('iPhone SE', 'en')), (computer, ('fr',)), (computer, ('en',)), (quiet, ('fr',))]
    with sync_playwright() as p:
        b = p.chromium.launch()
        for fn, a in jobs:
            try: fn(b, p, *a)
            except Exception as e: check(' '.join(str(x) for x in a) + ' : déroulé complet (' + fn.__name__ + ')', False, str(e)[:500])
        b.close()
    print('%d/%d réussis' % (sum(results), len(results)))
    sys.exit(0 if all(results) else 1)


main()
