"""UI test of the owner's dashboard and « Parler à un humain » (Stalak Pro), Python Playwright (chromium).

    python3 /abs/path/tests/ui/support_ui.py <base url of tests/ui/server.mjs> <path of the claude.ai build shuffle-lab.html>

Build the site first (python3 build_site.py …, python3 build.py), then run node tests/ui/server.mjs <repo>/public <port>
(a fresh one for each run): the real Functions on node:sqlite; Cloudflare Access is imitated by a test key (cookie
test_admin=1, set by /__test/admin-login); test accounts come from POST /__test/user {pro}.
Checks: signed out and free → « Réservé à Stalak Pro » screen (button to the Pro page, contact address); a Pro member when
nobody is there (answer by e-mail « sous 24 h », owner told by e-mail); the dashboard (figures, 8 charts, table, « Pro » badge)
on a computer and a phone; the owner's answer e-mailed to the member who left; the live chat when the owner is « disponible »;
an ex-Pro keeps the answers already received but cannot write; FR and EN; no horizontal scroll; no page error (strict CSP);
the claude.ai build. Run this file by absolute path from a clean directory."""
import asyncio, json, os, sys, urllib.request
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
    await page.goto(BASE + ('/' if lang == 'fr' else '/en/'), wait_until='load')
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
        check('fr-390 signed out: reserved to Stalak Pro', 'réservé à Stalak Pro' in gate and 'sous 24 h' in gate, gate)
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
        check('en-1280 free: reserved to Stalak Pro', 'part of Stalak Pro' in gate and 'within 24 hours' in gate, gate)
        await v.click('#helpLog .hp-gate button')
        await v.wait_for_timeout(600)
        why = await v.evaluate("() => { const e = document.querySelector('#apProWhy'); return e && !e.hidden ? e.innerText : ''; }")
        check('en-1280 free: the Pro page says why', 'Talk to a human' in why, why)
        check('en-1280 free: no page error', not verr, verr)
        await vctx.close()

        # 3. a Pro member on a phone, nobody on the dashboard: answer by e-mail within 24 h, to the account's address
        pro = post('/__test/user', {'pro': True})
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
        check('owner told by e-mail, marked Pro', any(x.startswith('contact@stalak.app: Stalak Pro : nouveau message') for x in new), new)
        check('fr-390 Pro: no page error', not verr, verr)
        await vctx.close()

        # 4. the dashboard on a computer
        actx = await browser.new_context(locale='fr-FR', viewport={'width': 1280, 'height': 900})
        a = await actx.new_page()
        aerr = []
        watch(a, aerr)
        await a.goto(BASE + '/__test/admin-login', wait_until='load')
        await a.wait_for_selector('#charts .chart', timeout=15000)
        await a.wait_for_function("() => document.querySelector('#who').textContent.includes('@')", timeout=10000)
        check('admin-1280: 8 day-by-day charts', await a.eval_on_selector_all('#charts .chart', 'e => e.length') == 8)
        check('admin-1280: Pro subscribers counted', (await a.inner_text('#kPro')).strip() == '1', await a.inner_text('#kPro'))
        await a.wait_for_selector('#tlist button', timeout=10000)
        item = await a.inner_text('#tlist button')
        check('admin-1280: conversation listed, new, with the « Pro » badge', 'nouveau' in item and 'Pro' in item, item)
        await a.click('#tableBtn')
        check('admin-1280: table view', await a.is_visible('#tableWrap table'))
        await a.hover('#charts .chart .hit >> nth=-1')
        tip = await a.eval_on_selector_all('#charts .chart .tip', "els => els.filter(e => getComputedStyle(e).display !== 'none').map(e => e.textContent)")
        check('admin-1280: tooltip on hover', len(tip) == 1 and '·' in tip[0], tip)
        await a.click('#tlist button')
        await a.wait_for_selector('#replyText')
        head = await a.inner_text('#conv .head')
        check('admin-1280: « Pro » shown in the open conversation', 'Pro' in head and 'ex-Pro' not in head, head)
        await a.fill('#replyText', 'Essaie sur Chrome, ça devrait passer.')
        await a.click('#conv button[type=submit]')
        await a.wait_for_function("() => /envoyé par e-mail/.test(document.querySelector('#conv .msgs').innerText)", timeout=50000)
        check('admin-1280: reply e-mailed to the member who left', any('Réponse de l’équipe Stalak' in x for x in get('/__test/mails')[m0:]))
        check('admin-1280: no horizontal scroll', await no_scroll(a))
        await shot(a, 'humain-pro-admin-1280')

        # 5. « disponible » on: another Pro member in English gets the live chat
        await a.check('#availSw')
        await a.wait_for_function("() => /Direct/.test(document.querySelector('#availTxt').textContent)", timeout=15000)
        pro2 = post('/__test/user', {'pro': True})
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
        check('admin: the member shows as online', 'en ligne' in (await a.inner_text('#conv .head')))
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
        check('en-390 ex-Pro: answers kept, writing needs Pro', 'need Stalak Pro' in gate and 'stay right above' in gate, gate)
        check('en-390 ex-Pro: the box goes back to the assistant', 'team' not in (await v.get_attribute('#helpIn', 'placeholder')))
        check('en-390 ex-Pro: no horizontal scroll', await no_scroll(v))
        await shot(v, 'humain-pro-expro-en-390')
        check('en-390 ex-Pro: no page error', not verr, verr)
        await vctx.close()
        await a.click("[data-st='all']")
        await a.wait_for_function("() => [...document.querySelectorAll('#tlist button')].some(b => /export again/.test(b.innerText) && /ex-Pro/.test(b.innerText))", timeout=15000)
        check('admin: « ex-Pro » once the subscription ended', True)

        # 7. the dashboard on a phone
        pctx = await browser.new_context(locale='fr-FR', viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
        ph = await pctx.new_page()
        perr = []
        watch(ph, perr)
        await ph.goto(BASE + '/__test/admin-login', wait_until='load')
        await ph.wait_for_selector('#charts .chart', timeout=15000)
        await ph.wait_for_selector('#tlist button', timeout=10000)
        check('admin-390: no horizontal scroll', await no_scroll(ph))
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
