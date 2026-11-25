"""Test of « Stats » (24/11, docs/handoff/chef-stats-analyse.md): the tutorial at the first launch, the questionnaire from the
« Stats » tab (« Autre » and its field, TikTok always needed, Spotify needed when the music is out, YouTube), about 9 s of uneven
loading, « Ton analyse est prête » and the account to create, then the screen of « Stats » (Comptes' GET /api/stats: the free
summary, the rest blurred with a padlock for a free account, shown for Pro). The test server with real accounts.

    node tests/ui/cloud-server.mjs <built public/ folder with the probe> <port>
    python3 /abs/path/tests/ui/refonte_stats_ui.py http://127.0.0.1:<port> [folder for screenshots]"""
import json, os, sys, time
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.sync_api import sync_playwright

BASE = sys.argv[1].rstrip('/')
SHOTS = sys.argv[2] if len(sys.argv) > 2 else None
results = []
T = {'fr': {'other': 'Dis-nous ce que tu fais', 'needTt': 'Il faut ton TikTok pour faire ton analyse.', 'needSp': 'Il faut ton Spotify pour faire ton analyse.',
            'ready': 'Ton analyse est prête', 'create': 'Crée ton compte pour la voir', 'see': 'Voir mon analyse', 'title': 'Tes stats', 'sum': 'Ton bilan', 'unlock': 'Débloquer avec Pro',
            'add': 'Ajouter mes liens', 'plan': 'Ton plan de la semaine', 'tt1': 'On analyse ton TikTok…', 'sp1': 'On lit tes sorties Spotify…'},
     'en': {'other': 'Tell us what you make', 'needTt': 'We need your TikTok to make your analysis.', 'needSp': 'We need your Spotify to make your analysis.',
            'ready': 'Your analysis is ready', 'create': 'Create your account to see it', 'see': 'See my analysis', 'title': 'Your stats', 'sum': 'Your summary', 'unlock': 'Unlock with Pro',
            'add': 'Add my links', 'plan': 'Your plan for the week', 'tt1': 'Analysing your TikTok…', 'sp1': 'Reading your Spotify releases…'}}


def check(name, ok, info=''):
    ok = bool(ok); results.append(ok)
    print(('PASS ' if ok else 'FAIL ') + name + (('  — ' + str(info)) if info and not ok else ''))


def ev(pg, code):
    return pg.evaluate('s => __ev(s)', code)


def vis(pg, sel):
    return pg.evaluate("s => { const e = document.querySelector(s); if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; }", sel)


def shot(pg, name):
    if SHOTS: pg.screenshot(path=os.path.join(SHOTS, name + '.png'))


def page(b, PW, dev, lang, email=None, pro='0', tuto=True):
    ctx = b.new_context(**PW.devices[dev], locale='fr-FR' if lang == 'fr' else 'en-US')
    ctx.add_init_script('window.__stalakM4on = 1; window.__stalakM5on = 1;' + ('' if tuto else "try { localStorage.setItem('stalak:tuto', '1'); } catch (e) {}"))
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    to = '/fr/' if lang == 'fr' else '/'
    if email:
        pg.goto(BASE + '/__test/login?email=%s&pro=%s&to=%s' % (email, pro, to), wait_until='load')
        uid = pg.evaluate("() => fetch('/api/me').then(r => r.json()).then(d => d.user && d.user.id)")
        pg.evaluate("id => localStorage.setItem('stalak:proThanks:' + id, '1')", uid)
    pg.goto(BASE + to, wait_until='load'); pg.wait_for_function('() => !!window.StalakM5', timeout=30000); pg.wait_for_timeout(1500)
    return ctx, pg, errs


def nxt(pg, w=850):
    pg.tap('.ob-cta'); pg.wait_for_timeout(w)
    return int(pg.locator('.ob-q.on').get_attribute('data-i'))


def answer(pg, t, links=True, autre=True):
    """name, « Autre » + its field, « Oui, déjà en ligne », the links (TikTok and Spotify needed), the rest"""
    pg.fill('#obName', 'T-Crazy'); nxt(pg)
    if autre:
        pg.tap('.ob-q.on [data-v=autre]'); pg.wait_for_timeout(300)
    nxt(pg); pg.tap('.ob-q.on [data-v=oui]'); i = nxt(pg)
    return i


def signed_out(b, PW, dev, lang):
    tag = dev + ' ' + lang + ' (sans compte)'; t = T[lang]
    ctx, pg, errs = page(b, PW, dev, lang)
    check(tag + ' : 1er lancement : le tutoriel, pas le questionnaire', pg.locator('.m4-tu').count() == 1 and pg.locator('#m2Onb').count() == 0)
    pg.locator('.m4-skip').click(); pg.wait_for_timeout(600)
    pg.locator('#tabBar [data-tab="stats"]').click(); pg.wait_for_selector('#m2Onb', timeout=8000); pg.wait_for_timeout(900)
    check(tag + ' : « Stats » ouvre le questionnaire (pas la création de compte)', vis(pg, '#m2Onb') and ev(pg, 'apView') != 'login')
    pg.fill('#obName', 'T-Crazy'); nxt(pg)
    pg.tap('.ob-q.on [data-v=autre]'); pg.wait_for_timeout(400)
    ph = pg.locator('#obOther').get_attribute('placeholder') if vis(pg, '#obOther') else None
    check(tag + ' : « Autre » ouvre un champ libre « %s »' % t['other'], ph == t['other'], ph)
    pg.fill('#obOther', 'Afro trap'); shot(pg, 'stats-autre-%s' % lang)
    nxt(pg); pg.tap('.ob-q.on [data-v=oui]'); i = nxt(pg)
    check(tag + ' : les liens : TikTok, Spotify, Apple Music, SoundCloud, YouTube, Instagram', pg.evaluate("() => [...document.querySelectorAll('.ob-q.on .ob-in[data-l]')].map(w => w.dataset.l)") == ['tiktok', 'spotify', 'appleMusic', 'soundcloud', 'youtube', 'instagram'])
    req = pg.evaluate("() => [...document.querySelectorAll('.ob-q.on .ob-in[data-l]')].filter(w => !w.querySelector('.ob-req').hidden).map(w => w.dataset.l)")
    check(tag + ' : « déjà en ligne » : TikTok et Spotify obligatoires', req == ['tiktok', 'spotify'], req)
    pg.tap('.ob-cta'); pg.wait_for_timeout(500)
    msgs = pg.evaluate("() => [...document.querySelectorAll('.ob-q.on .ob-bad:not([hidden])')].map(m => m.textContent)")
    check(tag + ' : sans eux, « Continuer » reste ici et le dit sous chaque champ', int(pg.locator('.ob-q.on').get_attribute('data-i')) == i and msgs == [t['needTt'], t['needSp']], msgs)
    shot(pg, 'stats-liens-%s' % lang)
    pg.fill('.ob-in[data-l=tiktok] input', '@tcrazy'); pg.fill('.ob-in[data-l=spotify] input', 'open.spotify.com/artist/abc'); pg.fill('.ob-in[data-l=youtube] input', 'youtube.com/@tcrazy')
    j = nxt(pg)
    check(tag + ' : un lien Spotify donné : la question des auditeurs n’est pas posée', j != 4 and j > i, j)
    for k in range(4):
        if pg.locator('.ob-load.on').count(): break
        nxt(pg, 700)
    pg.wait_for_selector('.ob-load.on', timeout=5000); t0 = time.time()
    lines = []
    for k in range(14):
        pg.wait_for_timeout(500); lines.append(pg.evaluate("() => [...document.querySelectorAll('.ob-ln')].filter(l => getComputedStyle(l).opacity > 0.5).map(l => l.innerText.trim()).join('|')"))
        if pg.locator('.ob-lock').count(): break
    pg.wait_for_selector('.ob-lock', timeout=15000); dt = time.time() - t0
    check(tag + ' : chargement d’environ 9 s', 7.5 <= dt <= 11.5, round(dt, 1))
    seen = ' '.join(lines)
    check(tag + ' : des étapes qui traînent : « %s », « %s »' % (t['tt1'], t['sp1']), t['tt1'] in seen and t['sp1'] in seen and seen.count(t['tt1']) >= 3, lines)
    pg.wait_for_timeout(900)
    check(tag + ' : « %s », un aperçu flouté avec un cadenas, « %s »' % (t['ready'], t['create']), pg.locator('.ob-q.on h1').inner_text().strip() == t['ready'] and vis(pg, '.ob-lock .m5-pad')
          and pg.locator('.ob-cta').inner_text().strip() == t['create'] and 'blur' in pg.evaluate("() => getComputedStyle(document.querySelector('.ob-lock .m5-bl')).filter"))
    check(tag + ' : l’aperçu : 6 parties aux titres lisibles (dont le coach), leur contenu flouté', pg.evaluate("() => document.querySelectorAll('.ob-lock .m5-pv h3').length") == 6 and pg.evaluate("() => [...document.querySelectorAll('.ob-lock .m5-pv h3')].every(h => getComputedStyle(h).filter === 'none')"))
    shot(pg, 'stats-pret-%s' % lang)
    st = json.loads(pg.evaluate("localStorage.getItem('stalak:onb')"))
    check(tag + ' : les réponses gardées (genreOther, liens TikTok / YouTube)', st['a'].get('genreOther') == 'Afro trap' and st['a']['links'].get('tiktok') == '@tcrazy' and st['a']['links'].get('youtube') == 'youtube.com/@tcrazy', st['a'])
    pg.tap('.ob-cta'); pg.wait_for_timeout(1200)
    check(tag + ' : « %s » : la création du compte' % t['create'], ev(pg, 'apView') == 'login' and ev(pg, 'apMode') == 'up' and pg.locator('#m2Onb').count() == 0, (ev(pg, 'apView'), ev(pg, 'apMode')))
    # the account made: « Stats » opens with the analysis, the answers on the account (Comptes' names)
    mail = 'st-%s-%s@example.com' % (dev.replace(' ', '').lower(), lang)
    pg.goto(BASE + '/__test/login?email=%s&pro=0&to=%s' % (mail, '/fr/' if lang == 'fr' else '/'), wait_until='load'); pg.wait_for_function('() => !!window.StalakM5', timeout=30000)
    pg.wait_for_selector('#m5Stats .m5-sum, #m5Stats .m5-card', timeout=15000); pg.wait_for_timeout(1200)
    check(tag + ' : après la création du compte, « Stats » s’ouvre : « %s »' % t['title'], vis(pg, '#m5Stats') and pg.locator('#m5Stats h1').inner_text().strip() == t['title'])
    pr = pg.evaluate("() => fetch('/api/artist').then(r => r.json()).then(d => d.profile)") or {}
    check(tag + ' : sur le compte : genreOther, liens TikTok, Spotify, YouTube', pr.get('genreOther') == 'Afro trap' and pr.get('links', {}).get('tiktok') and pr.get('links', {}).get('spotify') and pr.get('links', {}).get('youtube'), pr)
    check(tag + ' : « %s » : le bilan gratuit (les phrases de Comptes)' % t['sum'], vis(pg, '.m5-card h2') and pg.locator('.m5-card h2').first.inner_text().strip() == t['sum'])
    check(tag + ' : compte gratuit : le reste flouté avec un cadenas et « %s » (aucun chiffre Pro envoyé)' % t['unlock'], vis(pg, '.m5-lock .m5-pad') and pg.locator('.m5-unlock').inner_text().strip() == t['unlock']
          and 'blur' in pg.evaluate("() => getComputedStyle(document.querySelector('.m5-lock .m5-bl')).filter"))
    shot(pg, 'stats-gratuit-%s' % lang)
    pg.locator('.m5-unlock').click(); pg.wait_for_timeout(900)
    check(tag + ' : « %s » ouvre le paywall' % t['unlock'], ev(pg, 'apView') == 'pro' and not vis(pg, '#m5Stats'))
    check(tag + ' : aucune erreur dans la page', not errs, errs)
    ctx.close()


def skipped(b, PW, dev, lang):
    """« Passer » at the first question: Stats says what is missing, « Ajouter mes liens » opens the links"""
    tag = dev + ' ' + lang + ' (questionnaire passé)'; t = T[lang]
    ctx, pg, errs = page(b, PW, dev, lang, email='skip-%s@example.com' % lang, tuto=False)
    pg.locator('#tabBar [data-tab="stats"]').click(); pg.wait_for_selector('#m2Onb', timeout=8000); pg.wait_for_timeout(800)
    pg.tap('.ob-skip'); pg.wait_for_selector('#m5Stats .m5-links', timeout=12000); pg.wait_for_timeout(600)
    note = pg.locator('.m5-warn').first.inner_text()
    check(tag + ' : sans le lien TikTok, « Stats » le dit et ne fait pas l’analyse', 'TikTok' in note and pg.locator('.m5-links').first.inner_text().strip() == t['add'], note)
    pg.locator('.m5-links').first.click(); pg.wait_for_selector('#m2Onb', timeout=6000); pg.wait_for_timeout(900)
    check(tag + ' : « %s » : le questionnaire, directement aux liens' % t['add'], pg.locator('.ob-q.on .ob-in[data-l=tiktok]').count() == 1)
    pg.fill('.ob-in[data-l=tiktok] input', '@nova'); pg.tap('.ob-cta')
    pg.wait_for_selector('.ob-lock', timeout=15000); pg.wait_for_timeout(900)
    check(tag + ' : connecté : « %s »' % t['see'], pg.locator('.ob-cta').inner_text().strip() == t['see'])
    pg.tap('.ob-cta'); pg.wait_for_selector('#m5Stats .m5-card', timeout=15000); pg.wait_for_timeout(1500)
    check(tag + ' : le lien TikTok donné : plus de « il manque ton TikTok »', not any('TikTok' in x for x in pg.evaluate("() => [...document.querySelectorAll('.m5-warn')].map(x => x.textContent)")))
    check(tag + ' : aucune erreur dans la page', not errs, errs)
    ctx.close()


def pro(b, PW, dev, lang):
    tag = dev + ' ' + lang + ' (Pro)'; t = T[lang]
    ctx, pg, errs = page(b, PW, dev, lang, email='stpro-%s@example.com' % lang, pro='1', tuto=False)
    pg.evaluate("() => localStorage.setItem('stalak:onb', JSON.stringify({ v: 2, done: 1, a: { artistName: 'Pro', genres: ['rap'], onPlatforms: 'non', links: { tiktok: '@pro' } } }))")
    pg.locator('#tabBar [data-tab="stats"]').click(); pg.wait_for_selector('#m5Stats .m5-card', timeout=15000); pg.wait_for_timeout(1500)
    check(tag + ' : Pro : pas de cadenas, l’analyse complète, avec « Ton coach »', pg.locator('.m5-lock').count() == 0 and pg.locator('.m5-coach').count() == 1)
    shot(pg, 'stats-pro-%s' % lang)
    check(tag + ' : rien ne dépasse, le « + » au-dessus', not pg.evaluate(OVER) and pg.evaluate(PLUS), pg.evaluate(OVER))
    pg.locator('#tabBar [data-tab="home"]').click(); pg.wait_for_timeout(600)
    check(tag + ' : un autre onglet ferme « Stats »', not vis(pg, '#m5Stats'))
    check(tag + ' : aucune erreur dans la page', not errs, errs)
    ctx.close()


OVER = """() => { const W = innerWidth; return [...document.querySelectorAll('#m5Stats *')].filter(e => { const r = e.getBoundingClientRect(); return r.width && (r.right > W + 0.5 || r.left < -0.5); }).map(e => String(e.className)).slice(0, 4); }"""
PLUS = """() => { const p = document.querySelector('.tab-plus'); const r = p.getBoundingClientRect(); const e = document.elementFromPoint(r.left + r.width / 2, r.top + 5); return p.contains(e); }"""


def demo(b, PW, dev, lang, mode):
    """the mock-ups (owner's feedback 24/11): ?demo=gratuit / ?demo=pro shows « Stats » signed in, example figures said so"""
    tag = dev + ' ' + lang + ' (démo ' + mode + ')'; t = T[lang]
    ctx = b.new_context(**PW.devices[dev], locale='fr-FR' if lang == 'fr' else 'en-US')
    ctx.add_init_script("window.__stalakM4on = 1; window.__stalakM5on = 1; try { localStorage.setItem('stalak:tuto', '1'); } catch (e) {}")
    pg = ctx.new_page(); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.goto(BASE + ('/fr/' if lang == 'fr' else '/') + '?demo=' + mode, wait_until='load')
    pg.wait_for_selector('#m5Stats .m5-card', timeout=15000); pg.wait_for_timeout(1500)
    txt = pg.locator('#m5Stats').inner_text()
    check(tag + ' : « Stats » s’ouvre seul, comme connecté, sans questionnaire', vis(pg, '#m5Stats') and pg.locator('#m2Onb').count() == 0 and pg.locator('#m5Stats h1').inner_text().strip() == t['title'])
    check(tag + ' : les chiffres sont dits « exemple »', ('Exemple' if lang == 'fr' else 'Example') in pg.locator('.m5-demo').inner_text())
    if mode == 'pro':
        check(tag + ' : la partie Pro en entier, avec « Ton coach »', pg.locator('.m5-lock').count() == 0 and pg.locator('.m5-coach').count() == 1)
        co = pg.evaluate("() => [document.querySelectorAll('.m5-coach .m5-cw').length, document.querySelectorAll('.m5-coach .m5-cx li').length, document.querySelectorAll('.m5-coach .m5-ci').length, document.querySelectorAll('.m5-coach .m5-make').length, !!document.querySelector('.m5-coach .m5-ai')]")
        check(tag + ' : le coach : 3 vidéos qui marchent, ce qui ne marche pas, 3 idées avec « Monter cette idée », l’étiquette IA au-dessus', co == [3, 2, 3, 3, True], co)
        ai = pg.evaluate("() => { const a = document.querySelector('.m5-coach .m5-ai'), f = document.querySelector('.m5-coach .m5-cs'); return !!a && !!f && a.getBoundingClientRect().top < f.getBoundingClientRect().top && /Claude/.test(a.textContent); }")
        check(tag + ' : l’étiquette « Analyse écrite par une IA (Claude, d’Anthropic) » au-dessus de l’analyse', ai)
        pg.goto(BASE + ('/fr/' if lang == 'fr' else '/') + '?demo=pro&coach=off', wait_until='load'); pg.wait_for_selector('#m5Stats .m5-coach', timeout=15000); pg.wait_for_timeout(800)
        act = pg.evaluate("() => [document.querySelectorAll('.m5-act dt').length, !!document.querySelector('.m5-act a[href*=\"#coach\"]'), !!document.querySelector('.m5-con'), document.querySelectorAll('.m5-ci').length]")
        check(tag + ' : coach pas activé : ce qui part, vers qui, le lien vers la confidentialité, « Activer mon coach », aucune analyse', act == [2, True, True, 0], act)
        pg.locator('.m5-con').click(); pg.wait_for_timeout(600)
        check(tag + ' : « Activer mon coach » : l’analyse arrive (démo)', pg.locator('.m5-ci').count() == 3 and pg.locator('.m5-off').count() == 1)
        check(tag + ' : le coach remplace « Ton plan de la semaine » et « Ton rythme »', pg.evaluate("() => [...document.querySelectorAll('#m5Stats .m5-card > h2')].map(h => h.textContent)").count(t['plan']) == 0)
    else: check(tag + ' : gratuit : bilan, puis la partie Pro floutée sous le cadenas', t['sum'] in txt and pg.locator('.m5-lock .m5-unlock').count() == 1 and pg.locator('.m5-lock .m5-pv h3').count() == 6)
    check(tag + ' : rien ne dépasse à droite ni à gauche', not pg.evaluate(OVER), pg.evaluate(OVER))
    check(tag + ' : le « + » de la barre du bas reste au-dessus de la page', pg.evaluate(PLUS))
    pg.evaluate("() => { const s = document.getElementById('m5Stats'); s.scrollTop = s.scrollHeight; }"); pg.wait_for_timeout(400)
    check(tag + ' : en bas de page aussi, le « + » au-dessus', pg.evaluate(PLUS))
    shot(pg, 'stats-demo-%s-%s' % (mode, lang))
    ctx.close(); pg2 = b.new_page(); pg2.goto(BASE + '/fr/', wait_until='load'); pg2.close()
    check(tag + ' : aucune erreur dans la page', not errs, errs)


def main():
    with sync_playwright() as p:
        b = p.chromium.launch()
        for fn, a in ((signed_out, ('iPhone 12', 'fr')), (signed_out, ('iPhone SE', 'en')), (skipped, ('iPhone 12', 'fr')), (pro, ('iPhone 12', 'fr')), (pro, ('iPhone SE', 'en')),
                      (demo, ('iPhone 12', 'fr', 'gratuit')), (demo, ('iPhone SE', 'en', 'pro')), (demo, ('iPhone SE', 'fr', 'gratuit'))):
            try: fn(b, p, *a)
            except Exception as e: check(' '.join(str(x) for x in a) + ' : déroulé complet (' + fn.__name__ + ')', False, str(e)[:400])
        b.close()
    print('%d/%d réussis' % (sum(results), len(results)))
    sys.exit(0 if all(results) else 1)


main()
