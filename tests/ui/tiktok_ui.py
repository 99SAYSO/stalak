"""Test of « Publier sur TikTok » and « Mes stats » (Réseaux sociaux, 21/11). Python Playwright (chromium) on the built site.

    python3 /abs/path/tests/ui/tiktok_ui.py <built public/ folder> [folder for screenshots]

The server is imitated in the page (Playwright routes): /api/me (a free or a Pro account), /api/config (TikTok offered),
/api/connect (linked or not), /api/tiktok/* (creator_info, sending in pieces, status, stats).
1. The account page: a « TikTok » card, « Relier TikTok » when not linked; name + avatar, « Mes stats », « Délier » when linked.
   The account menu: « TikTok · Mes stats ».
2. The end of an export: « Publier sur TikTok » under « Enregistrer la vidéo ». Free account: PRO tag, the plans page opens.
3. Pro: the form follows TikTok's Content Sharing Guidelines: the account's name, the preview, the editable caption, the
   visibility with NO default, the interactions unticked (one greyed out when the account forbids it), the commercial content
   switch (off; one of the two choices needed; « Contenu de marque » takes « Seulement moi » away, with its label), the
   consent sentence with TikTok's links, « Publier » disabled until it is all right. Draft mode. Then the sending: the pieces,
   the status, « Voir sur TikTok ».
4. « Mes stats »: free: the numbers and latest videos + the Pro box; Pro: the analysis (and the honesty sentence).
On an iPhone (390 px) and a computer (1280 px), in French and English; no horizontal scroll, no page error."""
import functools, http.server, json, os, re, shutil, sys, tempfile, threading
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.sync_api import sync_playwright
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import _probe

PUBLIC = os.path.abspath(sys.argv[1])
SHOTS = sys.argv[2] if len(sys.argv) > 2 else None
results = []
FAST_EXPORT = ("pickVideoConfig = async () => null, renderRealtime = async () => { await new Promise(r => setTimeout(r, 120)); "
               "return { blob: new Blob([new Uint8Array(4096)], { type: 'video/mp4' }), ext: 'mp4' }; }")
T = {
    'fr': {'pub': 'Publier sur TikTok', 'link': 'Relier TikTok', 'unlink': 'Délier', 'stats': 'Mes stats', 'pick': 'Choisis…',
           'go': 'Publier', 'see': 'Voir sur TikTok', 'music': 'confirmation d’utilisation de la musique', 'bc': 'politique sur le contenu de marque', 'proT': 'Pro'},
    'en': {'pub': 'Post to TikTok', 'link': 'Link TikTok', 'unlink': 'Unlink', 'stats': 'My stats', 'pick': 'Choose…',
           'go': 'Post', 'see': 'See it on TikTok', 'music': 'Music Usage Confirmation', 'bc': 'Branded Content Policy', 'proT': 'Pro'},
}
PRO_FEATS = ['nowm', 'clip', 'fx', 'text', 'filters', 'lyrics', 'tiktok', 'nologo', 'unlimited']
AV = 'data:image/svg+xml,' + '%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 4 4%22%3E%3Crect width=%224%22 height=%224%22 fill=%22%231f6fd6%22/%3E%3C/svg%3E'


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


def check(name, ok, info=''):
    results.append(bool(ok))
    print(('PASS ' if ok else 'FAIL ') + name + (('  — ' + str(info)) if info and not ok else ''))


def ev(pg, code):
    return pg.evaluate('s => __ev(s)', code)


def visible(pg, sel):
    return pg.evaluate("s => { const e = document.querySelector(s); if (!e) return false; const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden' && !e.closest('[hidden]'); }", sel)


def brand(pg, sel, info=False):
    r = pg.evaluate("""s => { const b = document.querySelector(s); if (!b) return null; const cs = getComputedStyle(b), lg = b.querySelector('svg.ttk-logo');
        const p = lg && lg.querySelector('path'); const r = lg && lg.getBoundingClientRect();
        return { bg: cs.backgroundColor, color: cs.color, logo: !!lg, fill: p && getComputedStyle(p).fill, w: r && Math.round(r.width), label: (b.querySelector('.ttk-lbl') || {}).textContent || '' }; }""", sel)
    if info: return r
    return bool(r) and r['bg'] == 'rgb(18, 18, 18)' and r['color'] == 'rgb(255, 255, 255)' and r['logo'] and r['fill'] == 'rgb(255, 255, 255)' and r['w'] >= 20 and len(r['label']) > 3


def no_hscroll(pg):
    return pg.evaluate("() => document.documentElement.scrollWidth <= window.innerWidth + 1")


VIDEOS = [{'id': str(7300000000000000000 + i), 'createdAt': 1763000000000 - i * 86400000, 'title': 'Vidéo %d #rap #stalak' % i, 'cover': AV,
           'url': 'https://www.tiktok.com/@stalak_app/video/%d' % i, 'views': 1000 * (10 - i), 'likes': 50 * (10 - i), 'stalak': i < 3} for i in range(8)]
ANALYSIS = {'n': 8, 'medianViews': 5500, 'engagement': 5.2, 'top': [VIDEOS[0]['id'], VIDEOS[1]['id'], VIDEOS[2]['id']],
            'flop': [VIDEOS[7]['id'], VIDEOS[6]['id'], VIDEOS[5]['id']],
            'weekday': [{'key': '6', 'n': 3, 'medianViews': 8000, 'enough': True}, {'key': '2', 'n': 2, 'medianViews': 3000, 'enough': False}],
            'hour': [{'key': '18-21', 'n': 4, 'medianViews': 7000, 'enough': True}],
            'duration': [{'key': '16-30', 'n': 5, 'medianViews': 6000, 'enough': True}, {'key': '61+', 'n': 1, 'medianViews': 900, 'enough': False}],
            'hashtags': [{'key': '#rap', 'n': 8, 'medianViews': 5500, 'enough': True}],
            'stalak': [{'key': 'stalak', 'n': 3, 'medianViews': 9000, 'enough': True}, {'key': 'other', 'n': 5, 'medianViews': 4000, 'enough': True}],
            'passages': [{'song': 'Mon son', 'videos': [{'id': VIDEOS[0]['id'], 'start': 32, 'end': 47, 'views': 10000}, {'id': VIDEOS[1]['id'], 'start': 0, 'end': 15, 'views': 9000}]}]}


def server(ctx, st):
    """st: {'pro': bool, 'linked': bool, 'calls': []} — the imitated Stalak server"""
    def handle(route):
        req = route.request
        path = re.sub(r'^https?://[^/]+', '', req.url).split('?')[0]
        m = req.method
        st['calls'].append((m, path))
        def js(o, status=200): route.fulfill(status=status, content_type='application/json', body=json.dumps(o))
        if path == '/api/me':
            return js({'user': {'id': 'u1', 'email': 'a@b.c', 'createdAt': '2026-01-01T00:00:00Z'}, 'session': {'id': 's'},
                       'entitlements': {'plan': 'pro' if st['pro'] else 'free', 'features': PRO_FEATS if st['pro'] else ['unlimited'], 'limits': {}}})
        if path == '/api/config':
            return js({'features': {'social': ['tiktok']}})
        if path == '/api/connect' and m == 'GET':
            return js({'accounts': [{'provider': 'tiktok', 'status': 'ok', 'displayName': 'Stalak App', 'avatarUrl': AV,
                                     'scopes': ['user.info.basic', 'video.publish', 'video.upload', 'user.info.stats', 'video.list']}] if st['linked'] else []})
        if path == '/api/connect/tiktok' and m == 'DELETE':
            # like the real server (CSRF): a change must come as JSON, or 415 (the « Délier » bug of 21/11)
            st['delCT'] = req.headers.get('content-type', '')
            if not st['delCT'].startswith('application/json'): return js({'error': 'unsupported_media_type'}, 415)
            st['linked'] = False; return js({'ok': True})
        if path == '/api/tiktok/creator':
            if not st['pro']: return js({'error': 'plan_required'}, 403)
            return js({'creator': {'nickname': 'Stalak App', 'username': 'stalak_app', 'avatarUrl': AV, 'maxDuration': 600,
                                   'privacyOptions': ['PUBLIC_TO_EVERYONE', 'MUTUAL_FOLLOW_FRIENDS', 'SELF_ONLY'],
                                   'commentDisabled': False, 'duetDisabled': False, 'stitchDisabled': True}, 'canDraft': True})
        if path == '/api/tiktok/publish' and m == 'POST':
            st['sent'] = json.loads(req.post_data or '{}')
            return js({'id': 'ttp_' + '0' * 24, 'mode': st['sent'].get('mode'), 'chunkSize': 4096, 'chunks': 1})
        if re.match(r'^/api/tiktok/publish/ttp_0+/chunk/\d+$', path):
            st['chunks'] = st.get('chunks', 0) + 1
            if st.get('lost'):   # the piece arrived but its answer was lost: the app sends it again, the server says « already have it »
                st['lost'] = False; return route.abort()
            if st['chunks'] > 1 and st.get('lostRetry'): return js({'error': 'not_uploading', 'message': 'x'}, 409)
            return js({'ok': True, 'done': True})
        if re.match(r'^/api/tiktok/publish/ttp_0+$', path):
            if st.get('stuck'): return js({'status': 'processing'})
            if st['sent'].get('mode') == 'draft': return js({'status': 'inbox'})
            return js({'status': 'published', 'url': 'https://www.tiktok.com/@stalak_app/video/7311111111111111111'})
        if path == '/api/tiktok/stats':
            return js({'account': {'displayName': 'Stalak App', 'avatarUrl': AV, 'followers': 1234, 'likes': 56789, 'videos': 42},
                       'videos': VIDEOS if st['pro'] else VIDEOS[:8], 'pro': st['pro'], 'analysis': ANALYSIS if st['pro'] else None})
        return route.fulfill(status=204, body='')
    ctx.route('**/api/**', handle)


def new_page(b, base, lang, iphone, PW, st):
    opts = dict(PW.devices['iPhone 12']) if iphone else {'viewport': {'width': 1280, 'height': 860}}
    ctx = b.new_context(**opts, locale='en-US' if lang == 'en' else 'fr-FR')
    server(ctx, st)
    ctx.add_init_script("try { localStorage.setItem('stalak:proThanks:u1', '1'); } catch (e) {}")
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.on('dialog', lambda d: d.accept())
    pg.goto(base + ('' if lang == 'en' else 'fr/'), wait_until='load'); pg.wait_for_function('window.__ev && window.MP4Box && window.StalakTikTok', timeout=20000)
    pg.wait_for_function('() => window.StalakAccount && window.StalakAccount.state && !!window.StalakAccount.state.user', timeout=10000)
    return ctx, pg, errs


def to_end(pg):
    pg.locator('#demoBtn').click(); pg.wait_for_function('() => __ev("S.step === 4 && S.cuts.length > 0")', timeout=90000)
    ev(pg, "S.song.demo = false, store.set(PP_KEY, 1), " + FAST_EXPORT)
    pg.evaluate('() => { __ev("exportOne()"); }')
    pg.wait_for_function('() => __ev("S.done === true")', timeout=30000); pg.wait_for_timeout(500)


def shot(pg, name, iphone, lang):
    if SHOTS: pg.screenshot(path=os.path.join(SHOTS, '%s-%s-%s.png' % (name, 'iphone' if iphone else 'ordi', lang)))


def flow(b, base, lang, iphone, PW, pro):
    tag = ('iPhone' if iphone else 'ordinateur') + ' ' + lang + (' Pro' if pro else ' gratuit')
    t = T[lang]
    st = {'pro': pro, 'linked': False, 'calls': []}
    ctx, pg, errs = new_page(b, base, lang, iphone, PW, st)
    # 1. account page, not linked
    ev(pg, "acctOpen()"); pg.wait_for_timeout(500)
    pg.wait_for_selector('#ttkCard', timeout=5000)
    check(tag + ' : page du compte : carte TikTok avec « %s »' % t['link'], visible(pg, '#ttkLink') and pg.locator('#ttkLink').inner_text().strip() == t['link'])
    check(tag + ' : « %s » aux couleurs de TikTok : fond noir, texte blanc, logo officiel blanc' % t['link'], brand(pg, '#ttkLink'), brand(pg, '#ttkLink', True))
    # linking: the popup is opened on the start address (the real TikTok screen comes after)
    pg.evaluate("() => { window.__opened = []; window.open = (u) => { window.__opened.push(u); return {}; }; }")
    pg.locator('#ttkLink').click()
    op = pg.evaluate('() => window.__opened')
    check(tag + ' : « %s » ouvre la fenêtre TikTok (/api/connect/tiktok/start)' % t['link'], len(op) == 1 and op[0].startswith('/api/connect/tiktok/start?return='), op)
    # back from TikTok: linked
    st['linked'] = True
    pg.evaluate("() => { const bc = new BroadcastChannel('stalak-social'); bc.postMessage({ stalakSocial: 'social-ok-tiktok' }); bc.close(); }")
    pg.wait_for_selector('#ttkUnlink', timeout=5000)
    txt = pg.locator('#ttkCard').inner_text()
    check(tag + ' : relié : le nom, l’avatar, « %s » et « %s »' % (t['stats'], t['unlink']), 'Stalak App' in txt and visible(pg, '#ttkCard .ttk-av')
          and pg.locator('#ttkStats').inner_text().strip() == t['stats'] and pg.locator('#ttkUnlink').inner_text().strip() == t['unlink'], txt)
    check(tag + ' : page du compte : pas de défilement de côté', no_hscroll(pg))
    shot(pg, 'tiktok-compte', iphone, lang)
    # 4. Mes stats
    pg.locator('#ttkStats').click(); pg.wait_for_selector('.ttk-ms .ttk-nums', timeout=5000)
    ms = pg.locator('.ttk-layer').inner_text()
    check(tag + ' : « Mes stats » : abonnés, likes, vidéos et les dernières vidéos', '1' in ms and pg.locator('.ttk-ms .ttk-v').count() >= 8, ms[:200])
    if pro:
        check(tag + ' : Pro : l’analyse (jour, heure, durée, hashtags, Stalak ou non, passage du son, top / flop)',
              pg.locator('.ttk-an').count() == 1 and pg.locator('.ttk-an .ttk-g').count() >= 6 and '0:32 → 0:47' in ms and pg.locator('.ttk-pro').count() == 0, ms[-600:])
        check(tag + ' : Pro : la phrase d’honnêteté (aucune promesse de vues)', visible(pg, '.ttk-honest'))
    else:
        check(tag + ' : gratuit : l’encadré Pro, pas d’analyse', visible(pg, '.ttk-pro') and pg.locator('.ttk-an').count() == 0)
    check(tag + ' : « Mes stats » : pas de défilement de côté', no_hscroll(pg) and pg.evaluate("() => { const b = document.querySelector('.ttk-box').getBoundingClientRect(); return b.left >= 0 && b.right <= innerWidth + 1; }"))
    shot(pg, 'tiktok-stats', iphone, lang)
    pg.keyboard.press('Escape'); pg.wait_for_timeout(200)
    check(tag + ' : Échap ferme « Mes stats »', pg.locator('.ttk-layer').count() == 0)
    # account menu item
    pg.keyboard.press('Escape'); pg.wait_for_timeout(300)
    pg.wait_for_timeout(300)
    ev(pg, "apHide()"); pg.wait_for_timeout(400)
    ev(pg, "acctMenu(true)"); pg.wait_for_timeout(200)
    check(tag + ' : menu du compte : « TikTok · %s » avec le logo TikTok' % t['stats'], visible(pg, '[data-am="tiktok"]') and t['stats'] in pg.locator('[data-am="tiktok"]').inner_text()
          and visible(pg, '[data-am="tiktok"] svg.ttk-logo'))
    ev(pg, "acctMenu(false)")
    # 2. the end of an export
    to_end(pg)
    check(tag + ' : fin d’export : « %s » visible' % t['pub'], visible(pg, '#ttkPub') and pg.locator('#ttkPub').inner_text().strip() == t['pub'])
    check(tag + ' : « %s » aux couleurs de TikTok : fond noir, texte blanc, logo officiel blanc' % t['pub'], brand(pg, '#ttkPub'), brand(pg, '#ttkPub', True))
    by = pg.locator('#saveBtn').bounding_box(); bt = pg.locator('#ttkPub').bounding_box()
    check(tag + ' : sous « Enregistrer la vidéo »', bt and by and bt['y'] > by['y'], (by, bt))
    check(tag + ' : fin d’export : pas de défilement de côté', no_hscroll(pg))
    if not pro:
        check(tag + ' : gratuit : étiquette PRO sur le bouton', pg.evaluate("() => document.querySelector('#ttkPub').classList.contains('protag') && document.querySelector('#ttkPub').dataset.plan === 'PRO'"))
        shot(pg, 'tiktok-fin', iphone, lang)
        pg.locator('#ttkPub').click(); pg.wait_for_timeout(600)
        check(tag + ' : gratuit : la page des formules s’ouvre (avec la phrase TikTok), pas de formulaire',
              pg.locator('.ttk-layer').count() == 0 and ev(pg, "apView") == 'pro' and 'TikTok' in pg.locator('#acctPage').inner_text(), ev(pg, "apView"))
        check(tag + ' : aucun appel à /api/tiktok/creator', not any(p == '/api/tiktok/creator' for _, p in st['calls']))
    else:
        check(tag + ' : Pro : pas d’étiquette PRO', not pg.evaluate("() => document.querySelector('#ttkPub').classList.contains('protag')"))
        ev(pg, "S.lastWm = false")
        pg.locator('#ttkPub').click(); pg.wait_for_selector('#ttkGo', timeout=8000)
        f = pg.evaluate("""() => { const q = (s) => document.querySelector(s); const box = [...document.querySelectorAll('.ttk-row input')];
            return { who: q('.ttk-who').innerText, prev: !!q('video.ttk-prev'), cap: !!q('#ttkCap'), vis: q('#ttkVis').value, first: q('#ttkVis').options[0].textContent,
              firstDis: q('#ttkVis').options[0].disabled, ticked: box.filter(b => b.checked).length, greyed: box.filter(b => b.disabled).length,
              cc: q('#ttkCc').checked, go: q('#ttkGo').disabled, modes: document.querySelectorAll('input[name=ttkMode]').length,
              links: [...document.querySelectorAll('.ttk-consent a')].map(a => a.textContent) }; }""")
        check(tag + ' : le nom du compte TikTok (1a) et l’aperçu (5a), la légende modifiable (5b)', 'Stalak App' in f['who'] and f['prev'] and f['cap'], f)
        check(tag + ' : visibilité sans choix par défaut (« %s ») (2b)' % t['pick'], f['vis'] == '' and f['first'] == t['pick'] and f['firstDis'], f)
        check(tag + ' : interactions décochées, « Collage » grisé (2c)', f['ticked'] == 0 and f['greyed'] == 1, f)
        check(tag + ' : contenu commercial désactivé par défaut (3a)', f['cc'] is False, f)
        check(tag + ' : phrase de consentement avec le lien Music Usage Confirmation (4)', t['music'] in f['links'], f)
        check(tag + ' : « %s » désactivé tant que la visibilité n’est pas choisie' % t['go'], f['go'] is True, f)
        check(tag + ' : deux modes : publier directement / brouillon', f['modes'] == 2, f)
        check(tag + ' : formulaire : pas de défilement de côté', no_hscroll(pg))
        shot(pg, 'tiktok-form', iphone, lang)
        pg.select_option('#ttkVis', 'PUBLIC_TO_EVERYONE')
        check(tag + ' : visibilité choisie → « %s » actif' % t['go'], not pg.locator('#ttkGo').is_disabled())
        pg.locator('label[for=ttkCc]').click()
        check(tag + ' : contenu commercial activé sans choix → bloqué', pg.locator('#ttkGo').is_disabled())
        pg.locator('.ttk-cc label').nth(1).click()   # Branded content
        g = pg.evaluate("""() => ({ priv: [...document.querySelector('#ttkVis').options].find(o => o.value === 'SELF_ONLY').disabled,
            links: [...document.querySelectorAll('.ttk-consent a')].map(a => a.textContent), go: document.querySelector('#ttkGo').disabled,
            lbl: document.querySelector('.ttk-cc + p').textContent })""")
        check(tag + ' : contenu de marque : « Seulement moi » impossible, Branded Content Policy dans le consentement, étiquette affichée (3b)',
              g['priv'] and t['bc'] in g['links'] and not g['go'] and g['lbl'], g)
        shot(pg, 'tiktok-form-marque', iphone, lang)
        pg.locator('label[for=ttkCc]').click()   # off again
        pg.select_option('#ttkVis', 'SELF_ONLY'); pg.locator('#ttkCap').fill('Mon son #rap')
        pg.locator('#ttkGo').click()
        pg.wait_for_selector('.ttk-out a.btn.primary', timeout=15000)
        s = st.get('sent', {})
        check(tag + ' : envoi : consentement, visibilité, légende, interactions et commercial transmis',
              s.get('consent') is True and s.get('privacy') == 'SELF_ONLY' and s.get('title') == 'Mon son #rap' and s.get('stitch') is False
              and s.get('commercial', {}).get('on') is False and st.get('chunks') == 1, s)
        out = pg.locator('.ttk-out').inner_text()
        check(tag + ' : publié : « %s » + « visible par toi seulement »' % t['see'], t['see'] in out and pg.locator('.ttk-out a.btn.primary').get_attribute('href').endswith('/video/7311111111111111111'), out)
        shot(pg, 'tiktok-publie', iphone, lang)
        pg.keyboard.press('Escape'); pg.wait_for_timeout(200)
        # draft mode
        st['chunks'] = 0
        pg.locator('#ttkPub').click(); pg.wait_for_selector('#ttkGo', timeout=8000)
        pg.locator('input[name=ttkMode][value=draft]').check()
        d = pg.evaluate("() => ({ go: document.querySelector('#ttkGo').disabled, vis: document.querySelector('#ttkVis').closest('.ttk-f').hidden })")
        check(tag + ' : brouillon : pas de visibilité à choisir, bouton actif', d['vis'] and not d['go'], d)
        pg.locator('#ttkGo').click(); pg.wait_for_timeout(4000)
        check(tag + ' : brouillon : envoyé dans la boîte de réception TikTok', st['sent'].get('mode') == 'draft' and pg.locator('.ttk-out a.btn.primary').count() == 0
              and pg.locator('.ttk-out .ttk-st').count() == 1, pg.locator('.ttk-out').inner_text())
        pg.keyboard.press('Escape'); pg.wait_for_timeout(200)
        # 22/11: the draft that turned forever. A piece whose answer is lost, then TikTok slow to answer: never locked
        st['chunks'] = 0; st['lost'] = True; st['lostRetry'] = True; st['stuck'] = True
        pg.locator('#ttkPub').click(); pg.wait_for_selector('#ttkGo', timeout=8000)
        pg.locator('input[name=ttkMode][value=draft]').check()
        pg.locator('#ttkGo').click(); pg.wait_for_timeout(6000)
        o = pg.evaluate("() => ({ err: document.querySelectorAll('.ttk-out .ttk-err').length, close: [...document.querySelectorAll('.ttk-out button')].length, txt: document.querySelector('.ttk-out').innerText })")
        check(tag + ' : brouillon : morceau reçu mais réponse perdue → pas d’erreur, on attend TikTok', st['chunks'] == 2 and o['err'] == 0, (st['chunks'], o))
        check(tag + ' : brouillon : pendant l’attente, « Fermer » est là', o['close'] == 1, o)
        shot(pg, 'tiktok-brouillon-attente', iphone, lang)
        pg.keyboard.press('Escape'); pg.wait_for_timeout(300)
        check(tag + ' : brouillon : Échap ferme pendant l’attente (rien ne reste bloqué)', pg.locator('.ttk-layer').count() == 0)
        st['stuck'] = False; st['lostRetry'] = False
    # « Délier » (the bug of 21/11): the request goes as JSON and the card comes back to « Relier TikTok »
    ev(pg, "acctOpen()"); pg.wait_for_selector('#ttkUnlink', timeout=8000)
    pg.locator('#ttkUnlink').click(); pg.wait_for_timeout(300)
    if pg.locator('.ttk-layer #ttkUnlinkGo, .ttk-layer .btn.primary').count():
        pg.locator('.ttk-layer .btn.primary').first.click()
    pg.wait_for_selector('#ttkLink', timeout=8000)
    check(tag + ' : « %s » envoie du JSON (pas de refus du serveur) et la carte revient à « %s »' % (t['unlink'], t['link']),
          st.get('delCT', '').startswith('application/json') and not st['linked'], st.get('delCT'))
    check(tag + ' : aucune erreur dans la page', not errs, errs)
    ctx.close()


def main():
    site = tempfile.mkdtemp(); shutil.copytree(PUBLIC, site, dirs_exist_ok=True)
    _probe.add_probe(site)
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=site))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = 'http://127.0.0.1:%d/' % srv.server_port
    if SHOTS: os.makedirs(SHOTS, exist_ok=True)
    with sync_playwright() as PW:
        b = PW.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
        for lang in ('fr', 'en'):
            for iphone in (True, False):
                for pro in (False, True):
                    flow(b, base, lang, iphone, PW, pro)
        b.close()
    srv.shutdown()
    print('%d/%d' % (sum(results), len(results)))
    sys.exit(0 if all(results) else 1)


main()
