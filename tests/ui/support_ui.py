"""UI test of the owner's dashboard and « Parler à un humain » (Stalak Pro), Python Playwright (chromium).

    python3 /abs/path/tests/ui/support_ui.py <base url of tests/ui/server.mjs> <path of the claude.ai build shuffle-lab.html>

Build the site first (python3 build_site.py …, python3 build.py), then run node tests/ui/server.mjs <repo>/public <port>
(a fresh one for each run): the real Functions on node:sqlite; Cloudflare Access is imitated by a test key (cookie
test_admin=1, set by /__test/admin-login); test accounts come from POST /__test/user {pro}.
Checks: signed out and free → « Réservé à Stalak Pro » screen (button to the Pro page, contact address); a Pro member when
nobody is there (answer by e-mail « sous 24 h », owner told by e-mail); the dashboard (☰ menu, Accueil, figures explained with « ? », globe, charts, table, « Pro » badge, TEST)
on a computer and a phone; the owner's answer e-mailed to the member who left; the live chat when the owner is « disponible »;
an ex-Pro keeps the answers already received but cannot write; FR and EN; no horizontal scroll; no page error (strict CSP);
the claude.ai build. Run this file by absolute path from a clean directory."""
import asyncio, json, os, sys, time, urllib.request
from playwright.async_api import async_playwright

BASE, CLAUDE_BUILD = sys.argv[1].rstrip('/'), sys.argv[2]
SHOTS = os.environ.get('STALAK_UI_SHOTS')
results = []


def check(name, ok, info=''):
    results.append((name, bool(ok), info))
    print(('PASS ' if ok else 'FAIL ') + name + (('  — ' + str(info)) if info and not ok else ''))


def get(path):
    return json.load(urllib.request.urlopen(BASE + path))


def post(path, body):
    req = urllib.request.Request(BASE + path, data=json.dumps(body).encode(), headers={'Content-Type': 'application/json'}, method='POST')
    return json.load(urllib.request.urlopen(req))


async def shot(page, name):
    if SHOTS: await page.screenshot(path=os.path.join(SHOTS, name + '.png'), full_page=False)


def watch(page, errors):
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('console', lambda m: errors.append(m.text) if m.type == 'error' and 'favicon' not in m.text else None)


async def go(page, name):
    # dashboard v3: the pages are in the ☰ menu
    await page.click('#menuBtn')
    await page.wait_for_selector('#drawer.open #tab-' + name, state='visible', timeout=5000)
    await page.click('#tab-' + name)
    await page.wait_for_selector('#p-' + name, state='visible', timeout=5000)
    await page.wait_for_timeout(250)


async def no_scroll(page):
    return await page.evaluate('() => document.documentElement.scrollWidth - window.innerWidth') <= 0


async def last_bot(page):
    return await page.eval_on_selector_all('#helpLog .hp-msg.bot:not(.wait)', 'els => els.length ? els[els.length - 1].innerText : ""')


async def visitor(browser, lang, width, height, user=None):
    ctx = await browser.new_context(locale='fr-FR' if lang == 'fr' else 'en-US', viewport={'width': width, 'height': height},
                                    is_mobile=width < 500, has_touch=width < 500)
    if user: await ctx.add_cookies([{'name': 'stalak_s', 'value': user['token'], 'url': BASE}])
    # a member who already saw the « thank you for going Pro » screen (shown once per account and device)
    if user: await ctx.add_init_script("try { localStorage.setItem('stalak:proThanks:" + user['id'] + "', '1'); } catch (e) {}")
    page = await ctx.new_page()
    errors = []
    watch(page, errors)
    await page.goto(BASE + ('/fr/' if lang == 'fr' else '/'), wait_until='load')
    await page.wait_for_timeout(700)
    await page.click('#helpBtn', force=True)
    await page.wait_for_selector('#helpPanel:not([hidden])')
    return ctx, page, errors


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        m0 = len(get('/__test/mails'))

        # 1. signed out, on a phone: « Réservé à Stalak Pro », a button to the Pro page, the contact address
        vctx, v, verr = await visitor(browser, 'fr', 390, 844)
        check('fr-390 signed out: « Parler à un humain » shown', await v.is_visible('#helpHuman'))
        await v.click('#helpHuman')
        await v.wait_for_selector('#helpLog .hp-gate')
        gate = await v.inner_text('#helpLog .hp-gate')
        check('fr-390 signed out: reserved to Stalak Pro', 'réservé à Stalak Creator Plus' in gate and 'sous 24 h' in gate, gate)
        href = await v.get_attribute('#helpLog .hp-gate a', 'href')
        check('fr-390 signed out: contact address still offered', href == 'mailto:contact@stalak.app', href)
        check('fr-390 signed out: no message box for the team', 'équipe' not in (await v.get_attribute('#helpIn', 'placeholder')))
        check('fr-390: no horizontal scroll', await no_scroll(v))
        await shot(v, 'humain-pro-gate-fr-390')
        await v.click('#helpLog .hp-gate button')
        await v.wait_for_timeout(600)
        why = await v.evaluate("() => [...document.querySelectorAll('#apWhy, #apProWhy')].filter(e => !e.hidden && e.offsetParent).map(e => e.innerText).join(' ')")
        check('fr-390 signed out: the button opens sign-in / Pro, with the reason', 'Parler à un humain' in why and await v.is_hidden('#helpPanel'), why)
        check('fr-390 signed out: no page error', not verr, verr)
        await vctx.close()

        # 2. a free account: the same screen
        free = post('/__test/user', {'pro': False})
        vctx, v, verr = await visitor(browser, 'en', 1280, 800, free)
        await v.click('#helpHuman')
        await v.wait_for_selector('#helpLog .hp-gate')
        gate = await v.inner_text('#helpLog .hp-gate')
        check('en-1280 free: reserved to Stalak Pro', 'part of Stalak Creator Plus' in gate and 'within 24 hours' in gate, gate)
        await v.click('#helpLog .hp-gate button')
        await v.wait_for_timeout(600)
        why = await v.evaluate("() => { const e = document.querySelector('#apProWhy'); return e && !e.hidden ? e.innerText : ''; }")
        check('en-1280 free: the Pro page says why', 'Talk to a human' in why, why)
        check('en-1280 free: no page error', not verr, verr)
        await vctx.close()

        # 3. a Pro member on a phone, nobody on the dashboard: answer by e-mail within 24 h, to the account's address
        pro = post('/__test/user', {'pro': True, 'plan': 'creator'})
        vctx, v, verr = await visitor(browser, 'fr', 390, 844, pro)
        await v.click('#helpHuman')
        await v.wait_for_function("() => /sous 24 h/.test(document.querySelector('#helpLog').innerText)", timeout=10000)
        msg = await last_bot(v)
        mail = pro.get('email') or msg.split(' à ')[-1].split(',')[0]
        check('fr-390 Pro: nobody there → answer by e-mail within 24 h', 'sous 24 h' in msg and '@example.com' in msg, msg)
        check('fr-390 Pro: no e-mail field to fill', not await v.is_visible('#helpMail'))
        check('fr-390 Pro: placeholder for the team', 'équipe' in (await v.get_attribute('#helpIn', 'placeholder')))
        await v.fill('#helpIn', 'Mon export reste bloqué à 80 %')
        await v.press('#helpIn', 'Enter')
        await v.wait_for_function("() => /La réponse arrivera sous 24 h/.test(document.querySelector('#helpLog').innerText)", timeout=10000)
        check('fr-390 Pro: sent', True)
        await shot(v, 'humain-pro-member-fr-390')
        new = get('/__test/mails')[m0:]
        check('owner told by e-mail, marked Pro', any(x.startswith('contact@stalak.app: Stalak Creator Plus : nouveau message') for x in new), new)
        check('fr-390 Pro: no page error', not verr, verr)
        await vctx.close()

        # 4. the dashboard on a computer
        actx = await browser.new_context(locale='fr-FR', viewport={'width': 1280, 'height': 900})
        a = await actx.new_page()
        aerr = []
        watch(a, aerr)
        await a.goto(BASE + '/__test/admin-login', wait_until='load')
        await a.wait_for_function("() => document.querySelector('#hMoneyV').textContent.trim() !== '–'", timeout=15000)
        await a.wait_for_function("() => document.querySelector('#who').textContent.includes('@')", timeout=10000)
        check('admin-1280: opens on Accueil, no period buttons there', await a.is_visible('#p-home') and not await a.is_visible('#periodBar'))
        cards = await a.eval_on_selector_all('#p-home .hc', 'e => e.length')
        check('admin-1280: Accueil = 6 big cards', cards == 6, cards)
        await a.click('#menuBtn')
        await a.wait_for_selector('#drawer.open', timeout=5000)
        items = await a.eval_on_selector_all('#drawer nav button', 'els => els.map(e => e.textContent.replace(/\\s+/g, " ").trim())')
        check('admin-1280: ☰ menu with 8 pages', len(items) == 8 and items[0].endswith('Accueil'), items)
        await a.keyboard.press('Escape')
        await a.wait_for_timeout(300)
        check('admin-1280: Escape closes the menu', not await a.is_visible('#drawer nav'))
        await go(a, 'today')
        check('admin-1280: « Aujourd’hui » has no 7 j / 30 j buttons (bug fixed)', not await a.is_visible('#periodBar'))
        check('admin-1280: Pro subscribers counted, marked TEST (sandbox)', (await a.inner_text('#kPro')).strip() == '1' and await a.is_visible('#testNote'), await a.inner_text('#kPro'))
        expl = await a.eval_on_selector_all('#p-today .kpi', 'els => els.filter(e => !e.querySelector(".e") || e.querySelector(".e").textContent.length < 20).length')
        check('admin-1280: every figure explained in a sentence', expl == 0, expl)
        hidden = await a.eval_on_selector_all('#p-today .kpi .e', "els => els.filter(e => getComputedStyle(e).display !== 'none').length")
        await a.click('#p-today .kpi .q >> nth=0')
        shown = await a.eval_on_selector_all('#p-today .kpi .e', "els => els.filter(e => getComputedStyle(e).display !== 'none').length")
        check('admin-1280: sentences hidden until « ? » is tapped', hidden == 0 and shown == 1, (hidden, shown))
        await go(a, 'signups')
        await a.wait_for_selector('#signupList li', timeout=10000)
        row = await a.inner_text('#signupList li >> nth=0')
        check('admin-1280: new accounts listed with a source and a plan', any(w in row for w in ['Gratuit', 'Pro', 'Creator Plus']), row)
        whos = await a.eval_on_selector_all('#signupList li .who', 'els => els.map(e => [e.querySelector(".nm").textContent, e.querySelector(".em").textContent])')
        check('admin-1280: each new account shows its pseudo (or « — ») and its e-mail', whos and all(n and '@' in e for n, e in whos) and any(n == '—' for n, e in whos), whos[:3])
        home_txt = await a.evaluate("() => document.querySelector('#p-home').innerText")
        check('admin-1280: no e-mail on the Accueil', '@' not in home_txt)
        await go(a, 'users')
        check('admin-1280: period buttons on Utilisateurs', await a.is_visible('#periodBar'))
        await a.wait_for_function("() => { const c = document.querySelector('#globe'); return c && c.width > 100; }", timeout=10000)
        check('admin-1280: globe drawn', await a.evaluate("() => { const c = document.querySelector('#globe'), x = c.getContext('2d').getImageData(c.width/2|0, c.height/2|0, 1, 1).data; return x[3] > 0; }"))
        check('admin-1280: 4 day-by-day charts', await a.eval_on_selector_all('#charts .chart', 'e => e.length') == 4)
        await go(a, 'msgs')
        await a.wait_for_selector('#tlist button', timeout=10000)
        item = await a.inner_text('#tlist button')
        check('admin-1280: conversation listed, new, with the « Creator Plus » badge', 'nouveau' in item and 'Creator Plus' in item, item)
        await go(a, 'users')
        await a.click('details.more-d > summary')
        await a.click('#tableBtn')
        check('admin-1280: table view', await a.is_visible('#tableWrap table'))
        await a.hover('#charts .chart .hit >> nth=-1')
        tip = await a.eval_on_selector_all('#charts .chart .tip', "els => els.filter(e => getComputedStyle(e).display !== 'none').map(e => e.textContent)")
        check('admin-1280: tooltip on hover', len(tip) == 1 and '·' in tip[0], tip)
        await go(a, 'money')
        check('admin-1280: money tab marked TEST', await a.is_visible('#p-money [data-test]'))
        await go(a, 'msgs')
        await a.click('#tlist button')
        await a.wait_for_selector('#replyText')
        head = await a.inner_text('#conv .head')
        check('admin-1280: « Creator Plus » shown in the open conversation', 'Creator Plus' in head and 'gratuit' not in head, head)
        await a.fill('#replyText', 'Essaie sur Chrome, ça devrait passer.')
        await a.click('#conv button[type=submit]')
        t_reply = time.time()
        # the visitor left a few seconds ago: the answer goes by e-mail once his page has not asked for 12 s (support.js CATCH_UP_MS),
        # at the dashboard's next refresh (every 10 s): about 20 s; 90 s allowed for slow machines
        await a.wait_for_function("() => /envoyé par e-mail/.test(document.querySelector('#conv .msgs').innerText)", timeout=90000)
        print('   (reply e-mailed after %.1f s)' % (time.time() - t_reply), flush=True)
        check('admin-1280: reply e-mailed to the member who left', any('Réponse de l’équipe Stalak' in x for x in get('/__test/mails')[m0:]))
        check('admin-1280: no horizontal scroll', await no_scroll(a))
        await shot(a, 'humain-pro-admin-1280')

        # 5. « disponible » on: another Pro member in English gets the live chat
        await a.check('#availSw')
        await a.wait_for_function("() => /Direct/.test(document.querySelector('#availTxt').textContent)", timeout=15000)
        pro2 = post('/__test/user', {'pro': True, 'plan': 'creator'})
        vctx, v, verr = await visitor(browser, 'en', 1280, 800, pro2)
        await v.click('#helpHuman')
        await v.wait_for_function("() => /team is here/.test(document.querySelector('#helpLog').innerText)", timeout=10000)
        await v.fill('#helpIn', 'Hi! How do I remove the logo?')
        await v.press('#helpIn', 'Enter')
        await v.wait_for_function("() => /Keep this window open/.test(document.querySelector('#helpLog').innerText)", timeout=10000)
        check('en-1280 Pro: live chat offered and message sent', True)
        await a.wait_for_function("() => [...document.querySelectorAll('#tlist button')].some(b => /remove the logo/.test(b.innerText))", timeout=25000)
        await a.click("#tlist button:has-text('remove the logo')")
        await a.wait_for_selector('#replyText')
        # « en ligne » = the member's page asked for news in the last 15 s (it asks every 5 s); the open conversation refreshes every 4 s
        try:
            await a.wait_for_function("() => /en ligne/.test(document.querySelector('#conv .head').innerText)", timeout=12000); online = True
        except Exception:
            online = False
        check('admin: the member shows as online', online, await a.inner_text('#conv .head'))
        await a.fill('#replyText', 'Stalak Pro removes it: export again.')
        await a.press('#replyText', 'Control+Enter')
        await v.wait_for_function("() => /export again/.test(document.querySelector('#helpLog').innerText)", timeout=12000)
        team = await v.eval_on_selector('#helpLog .hp-msg.team', 'e => getComputedStyle(e, "::before").content')
        check('en-1280 Pro: the answer appears live, signed « Stalak team »', 'Stalak team' in team, team)
        await shot(v, 'humain-pro-live-en-1280')
        check('en-1280 Pro: no page error', not verr, verr)

        # 6. Pro ends (same device): the member still reads the answers, but writing again shows the Pro screen; « ex-Pro » on the dashboard
        get('/__test/unpro?id=' + pro2['id'])
        await v.set_viewport_size({'width': 390, 'height': 844})
        await v.reload(wait_until='load')
        await v.wait_for_timeout(700)
        await v.click('#helpBtn', force=True)
        await v.wait_for_selector('#helpPanel:not([hidden])')
        await v.click('#helpHuman')
        await v.wait_for_function("() => /export again/.test(document.querySelector('#helpLog').innerText)", timeout=10000)
        await v.wait_for_selector('#helpLog .hp-gate')
        gate = await v.inner_text('#helpLog .hp-gate')
        check('en-390 ex-Pro: answers kept, writing needs Pro', 'need Stalak Creator Plus' in gate and 'stay right above' in gate, gate)
        check('en-390 ex-Pro: the box goes back to the assistant', 'team' not in (await v.get_attribute('#helpIn', 'placeholder')))
        check('en-390 ex-Pro: no horizontal scroll', await no_scroll(v))
        await shot(v, 'humain-pro-expro-en-390')
        check('en-390 ex-Pro: no page error', not verr, verr)
        await vctx.close()
        await a.click("[data-st='all']")
        await a.wait_for_function("() => [...document.querySelectorAll('#tlist button')].some(b => /export again/.test(b.innerText) && /gratuit/.test(b.innerText))", timeout=15000)
        check('admin: « gratuit » once the subscription ended', True)

        # 7. the dashboard on a phone
        pctx = await browser.new_context(locale='fr-FR', viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
        ph = await pctx.new_page()
        perr = []
        watch(ph, perr)
        await ph.goto(BASE + '/__test/admin-login', wait_until='load')
        await ph.wait_for_function("() => document.querySelector('#hMoneyV').textContent.trim() !== '–'", timeout=15000)
        check('admin-390: Accueil without horizontal scroll', await no_scroll(ph))
        await shot(ph, 'tdb3-accueil-390')
        bad = []
        for t in ['today', 'signups', 'users', 'money', 'funnel', 'msgs', 'health', 'home']:
            await go(ph, t)
            if not await no_scroll(ph): bad.append(t)
        check('admin-390: no horizontal scroll on any page', not bad, bad)
        await go(ph, 'signups')
        await ph.wait_for_selector('#signupList li .who', timeout=10000)
        lay = await ph.evaluate("() => { const w = document.querySelector('#signupList li .who'), n = w.querySelector('.nm').getBoundingClientRect(), e = w.querySelector('.em').getBoundingClientRect(); return e.top >= n.bottom - 1; }")
        check('admin-390: the e-mail goes under the pseudo', lay)
        await shot(ph, 'comptes-emails-390')
        await go(ph, 'msgs')
        await ph.wait_for_selector('#tlist button', timeout=10000)
        await shot(ph, 'humain-pro-admin-390')
        check('admin-390: no page error (strict CSP)', not perr, perr)
        await pctx.close()
        check('admin-1280: no page error (strict CSP)', not aerr, aerr)
        await actx.close()

        # 8. no dashboard without Access; no « talk to a human » in the claude.ai build
        nctx = await browser.new_context()
        n = await nctx.new_page()
        r = await n.goto(BASE + '/admin/')
        check('no Access token: no dashboard', r.status == 403 and 'tableau' not in (await n.content()))
        await nctx.close()
        page = await browser.new_page()
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        await page.goto('file://' + os.path.abspath(CLAUDE_BUILD), wait_until='load')
        await page.wait_for_timeout(600)
        await page.click('#helpBtn', force=True)
        check('claude.ai build: no « talk to a human »', not await page.is_visible('#helpHuman'))
        check('claude.ai build: no page error', not errors, errors)
        await browser.close()
    failed = [r for r in results if not r[1]]
    print(f'\n{len(results) - len(failed)}/{len(results)} passed')
    sys.exit(1 if failed else 0)

asyncio.run(main())
