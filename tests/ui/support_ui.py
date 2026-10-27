"""UI test of the owner's dashboard and « Parler à un humain », Python Playwright (chromium).

    python3 /abs/path/tests/ui/support_ui.py <base url of tests/ui/server.mjs> <path of the claude.ai build shuffle-lab.html>

Build the site first (python3 build_site.py …, python3 build.py), then run node tests/ui/server.mjs <repo>/public <port>:
the real Functions on node:sqlite; Cloudflare Access is imitated by a test key (cookie test_admin=1, set by /__test/admin-login).
Checks: the visitor writes when nobody is there (e-mail asked, owner told by e-mail), the dashboard (figures, 8 charts, table,
messages) on a computer and a phone, the owner's answer e-mailed to the visitor who left, the live chat when the owner is
« disponible », FR and EN, no horizontal scroll, no page error (the dashboard runs under a strict CSP), the claude.ai build.
Run this file by absolute path from a clean directory."""
import asyncio, json, os, sys, urllib.request
from playwright.async_api import async_playwright

BASE, CLAUDE_BUILD = sys.argv[1].rstrip('/'), sys.argv[2]
SHOTS = os.environ.get('STALAK_UI_SHOTS')
results = []


def check(name, ok, info=''):
    results.append((name, bool(ok), info))
    print(('PASS ' if ok else 'FAIL ') + name + (('  — ' + str(info)) if info and not ok else ''))


def mails():
    return json.load(urllib.request.urlopen(BASE + '/__test/mails'))


async def shot(page, name):
    if SHOTS: await page.screenshot(path=os.path.join(SHOTS, name + '.png'), full_page=False)


def watch(page, errors):
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('console', lambda m: errors.append(m.text) if m.type == 'error' and 'favicon' not in m.text else None)


async def no_scroll(page):
    return await page.evaluate('() => document.documentElement.scrollWidth - window.innerWidth') <= 0


async def last_bot(page):
    return await page.eval_on_selector_all('#helpLog .hp-msg.bot:not(.wait)', 'els => els.length ? els[els.length - 1].innerText : ""')


async def visitor(browser, lang, width, height):
    ctx = await browser.new_context(locale='fr-FR' if lang == 'fr' else 'en-US', viewport={'width': width, 'height': height},
                                    is_mobile=width < 500, has_touch=width < 500)
    page = await ctx.new_page()
    errors = []
    watch(page, errors)
    await page.goto(BASE + ('/' if lang == 'fr' else '/en/'), wait_until='load')
    await page.wait_for_timeout(500)
    await page.click('#helpBtn', force=True)
    await page.wait_for_selector('#helpPanel:not([hidden])')
    return ctx, page, errors


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        m0 = len(mails())

        # 1. a visitor on a phone, nobody on the dashboard: an e-mail is asked
        vctx, v, verr = await visitor(browser, 'fr', 390, 844)
        check('fr-390: « Parler à un humain » shown on stalak.app', await v.is_visible('#helpHuman') and 'humain' in (await v.inner_text('#helpHuman')))
        await v.click('#helpHuman')
        await v.wait_for_selector('#helpMail')
        msg = await last_bot(v)
        check('fr-390: nobody there → asks for an e-mail', 'e-mail' in msg, msg)
        check('fr-390: placeholder for the team', 'équipe' in (await v.get_attribute('#helpIn', 'placeholder')))
        await v.fill('#helpMail', '')
        await v.fill('#helpIn', 'Mon export reste bloqué à 80 %')
        await v.press('#helpIn', 'Enter')
        await v.wait_for_timeout(300)
        check('fr-390: no e-mail → asked again, message kept', 'e-mail' in (await last_bot(v)) and 'export' in (await v.input_value('#helpIn')))
        await v.fill('#helpMail', 'fan@example.com')
        await v.press('#helpIn', 'Enter')
        await v.wait_for_function("() => /fan@example.com/.test(document.querySelector('#helpLog').innerText)", timeout=10000)
        check('fr-390: sent, answer promised by e-mail', 'fan@example.com' in (await last_bot(v)))
        check('fr-390: e-mail field gone once known', not await v.is_visible('#helpMail'))
        check('fr-390: no horizontal scroll', await no_scroll(v))
        await shot(v, 'support-visitor-fr-390')
        new = mails()[m0:]
        check('owner told by e-mail (nobody on the dashboard)', any(x.startswith('contact@stalak.app: Stalak : nouveau message (fan@example.com)') for x in new), new)
        # the visitor closes the page
        check('fr-390: no page error', not verr, verr)
        await vctx.close()

        # 2. the dashboard on a computer
        actx = await browser.new_context(locale='fr-FR', viewport={'width': 1280, 'height': 900})
        a = await actx.new_page()
        aerr = []
        watch(a, aerr)
        await a.goto(BASE + '/__test/admin-login', wait_until='load')
        await a.wait_for_selector('#charts .chart', timeout=15000)
        await a.wait_for_function("() => document.querySelector('#who').textContent.includes('@')", timeout=10000)
        check('admin-1280: signed in as the owner', 'owner@example.com' in (await a.inner_text('#who')))
        n = await a.eval_on_selector_all('#charts .chart', 'e => e.length')
        check('admin-1280: 8 day-by-day charts', n == 8, n)
        check('admin-1280: figures shown', (await a.inner_text('#kUsers')).strip() != '–' and (await a.inner_text('#kMrr')).strip() != '–')
        live = await a.inner_text('#kLive')
        check('admin-1280: live visitors counted (the visitor page sent its sign of life)', live.strip().isdigit(), live)
        await a.wait_for_selector('#tlist button', timeout=10000)
        item = await a.inner_text('#tlist button')
        check('admin-1280: the message is listed, marked new', 'fan@example.com' in item and 'nouveau' in item, item)
        await a.click('#tableBtn')
        check('admin-1280: table view', await a.is_visible('#tableWrap table'))
        await a.hover('#charts .chart .hit >> nth=-1')
        tip = await a.eval_on_selector_all('#charts .chart .tip', "els => els.filter(e => getComputedStyle(e).display !== 'none').map(e => e.textContent)")
        check('admin-1280: tooltip on hover (day and value)', len(tip) == 1 and '·' in tip[0], tip)
        await a.click('#tlist button')
        await a.wait_for_selector('#replyText')
        conv = await a.inner_text('#conv')
        check('admin-1280: conversation open, with the page context and the absent visitor', 'bloqué à 80' in conv and 'Ce que montrait la page' in conv, conv[:200])
        await a.fill('#replyText', 'Essaie sur Chrome, ça devrait passer.')
        await a.click('#conv button[type=submit]')
        # the visitor left a few seconds ago: e-mailed at once, or by the catch-up once his page has not fetched it for 20 s
        await a.wait_for_function("() => /envoyé par e-mail/.test(document.querySelector('#conv .msgs').innerText)", timeout=50000)
        check('admin-1280: reply e-mailed to the visitor who left', any(x.startswith('fan@example.com: Réponse de l’équipe Stalak') for x in mails()[m0:]), mails()[m0:])
        check('admin-1280: no horizontal scroll', await no_scroll(a))
        await shot(a, 'support-admin-1280')

        # 3. « disponible » on: a visitor in English gets the live chat, no e-mail needed
        await a.check('#availSw')
        await a.wait_for_function("() => /Direct/.test(document.querySelector('#availTxt').textContent)", timeout=15000)
        check('admin: « disponible » shown', True)
        vctx, v, verr = await visitor(browser, 'en', 1280, 800)
        await v.click('#helpHuman')
        await v.wait_for_selector('#helpMail')
        check('en-1280: someone is here → e-mail optional', 'here' in (await last_bot(v)) and 'optional' in (await v.inner_text('#helpMailRow')))
        await v.fill('#helpIn', 'Hi! How do I remove the logo?')
        await v.press('#helpIn', 'Enter')
        await v.wait_for_function("() => /Keep this window open/.test(document.querySelector('#helpLog').innerText)", timeout=10000)
        check('en-1280: sent without e-mail, live', True)
        await a.wait_for_function("() => [...document.querySelectorAll('#tlist button')].some(b => /remove the logo/.test(b.innerText))", timeout=25000)
        await a.click("#tlist button:has-text('remove the logo')")
        await a.wait_for_selector('#replyText')
        live_pill = await a.inner_text('#conv .head')
        check('admin: the visitor shows as online', 'en ligne' in live_pill, live_pill)
        await a.fill('#replyText', 'Take Stalak Pro: videos without the logo.')
        await a.press('#replyText', 'Control+Enter')
        await v.wait_for_function("() => /Take Stalak Pro/.test(document.querySelector('#helpLog').innerText)", timeout=12000)
        team = await v.eval_on_selector('#helpLog .hp-msg.team', 'e => getComputedStyle(e, "::before").content')
        check('en-1280: the answer appears live, signed « Stalak team »', 'Stalak team' in team, team)
        check('en-1280: not e-mailed (no address, seen live)', not any('Reply from' in x for x in mails()[m0:]))
        await shot(v, 'support-visitor-en-1280')
        # the visitor comes back later: the conversation is still there
        await v.reload(wait_until='load')
        await v.wait_for_timeout(500)
        await v.click('#helpBtn', force=True)
        await v.wait_for_function("() => /Take Stalak Pro/.test(document.querySelector('#helpLog').innerText)", timeout=10000)
        check('en-1280: conversation back after a reload', True)
        await v.click("#helpLog .hp-chips button")
        check('en-1280: back to the assistant', 'AI' in (await last_bot(v)))
        check('en-1280: no page error', not verr, verr)
        await vctx.close()

        # 4. the dashboard on a phone
        pctx = await browser.new_context(locale='fr-FR', viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True)
        ph = await pctx.new_page()
        perr = []
        watch(ph, perr)
        await ph.goto(BASE + '/__test/admin-login', wait_until='load')
        await ph.wait_for_selector('#charts .chart', timeout=15000)
        await ph.wait_for_selector('#tlist button', timeout=10000)
        check('admin-390: no horizontal scroll', await no_scroll(ph), await ph.evaluate('() => document.documentElement.scrollWidth'))
        await shot(ph, 'support-admin-390')
        check('admin-390: no page error (strict CSP)', not perr, perr)
        await pctx.close()
        check('admin-1280: no page error (strict CSP)', not aerr, aerr)
        await actx.close()

        # 5. the dashboard is not there without Access, nor the button in the claude.ai build
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
