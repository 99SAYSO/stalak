"""UI test of the offer of 30/10/2026 (domaine Comptes, paiements & serveur), Python Playwright (chromium):
the plans page (Gratuit + Basic / Pro / Max, monthly / yearly), the free video of the day and its reminder box.

    python3 /abs/path/tests/ui/plans_ui.py <base url of tests/ui/cloud-server.mjs> [folder for screenshots]

Build the site first (python3 build_site.py …), then run node tests/ui/cloud-server.mjs <repo>/public <port> (a fresh one per
run): the real Functions on node:sqlite. Accounts come from /__test/login?email=…&pro=1&plan=basic|pro|max (or pro=0).
In that server, Max yearly has no Paddle price: its button must say « Bientôt ».
Checks: signed out, FR, 390 px: 4 cards (Max first on a phone), prices, the yearly switch (Basic 3,25 €/mois, 39 € a year,
« Économise 35 % »), a plan asks to sign in, the export asks for a free account; free, EN, 1280 px: 4 cards side by side
(Gratuit → Max), a real export from the example uses the free video of the day, a second one opens the plans page with the
reason, the account page says so, the reminder box is saved; Basic at 390 px: unlimited exports, no reminder box; Pro at
1280 px: « Ta formule », « Passer à Max » asks to confirm first; Max: the perks list with « Parler à un humain »; no horizontal
scroll; no page error. Run this file by absolute path from a clean directory."""
import asyncio, json, os, sys, urllib.request
from playwright.async_api import async_playwright

BASE = sys.argv[1].rstrip('/')
SHOTS = sys.argv[2] if len(sys.argv) > 2 else None
results = []


def check(name, ok, info=''):
    results.append((name, bool(ok), info))
    print(('PASS ' if ok else 'FAIL ') + name + (('  — ' + str(info)) if info and not ok else ''), flush=True)


async def shot(page, name, full=False):
    if SHOTS:
        await page.wait_for_timeout(700)
        await page.screenshot(path=os.path.join(SHOTS, name + '.png'), full_page=full)


def watch(page, errors):
    page.on('pageerror', lambda e: errors.append(str(e)))
    # 401 / 403 / 429 answers are expected here (signed out, plan needed, daily video used)
    page.on('console', lambda m: errors.append(m.text) if m.type == 'error' and 'favicon' not in m.text and not any(
        ('status of %d' % c) in m.text for c in (401, 403, 404, 429, 599)) else None)


async def no_scroll(page):
    return await page.evaluate('() => document.documentElement.scrollWidth - window.innerWidth') <= 0


async def open_page(browser, lang, w, h, email=None, q='pro=0'):
    ctx = await browser.new_context(locale='fr-FR' if lang == 'fr' else 'en-US', viewport={'width': w, 'height': h}, is_mobile=w < 500, has_touch=w < 500)
    page = await ctx.new_page()
    errors = []
    watch(page, errors)
    to = '/' if lang == 'fr' else '/en/'
    if email:
        await page.goto(BASE + f'/__test/login?email={email}&{q}&lang={lang}&to={to}', wait_until='load')
        uid = await page.evaluate("() => fetch('/api/me').then(r => r.json()).then(d => d.user && d.user.id)")
        await page.evaluate("id => localStorage.setItem('stalak:proThanks:' + id, '1')", uid)
        await page.goto(BASE + to, wait_until='load')
    else:
        await page.goto(BASE + to, wait_until='load')
    await page.wait_for_function("() => !document.querySelector('#acctBtn').hidden", timeout=15000)
    await page.wait_for_timeout(500)
    return ctx, page, errors


async def plans_page(page):
    await page.evaluate("() => { location.hash = '#pro'; }")
    await page.wait_for_selector('#apPro:not([hidden]) #apBuy:not([hidden])', timeout=8000)
    await page.wait_for_timeout(400)


async def cards(page):
    return await page.eval_on_selector_all('#apBuy .pl-card', """els => els.map(e => {
        const r = e.getBoundingClientRect(), b = e.querySelector('[data-buy], #apStayFree');
        return { plan: e.dataset.plan, x: Math.round(r.left), y: Math.round(r.top + scrollY),
          amt: (e.querySelector('.pr-amt') || {}).textContent, bill: (e.querySelector('.pr-bill') || {}).textContent,
          pill: [...e.querySelectorAll('.pr-pill')].filter(p => !p.hidden).map(p => p.textContent).join(' '),
          btn: b ? b.textContent.trim() : '', off: b ? b.disabled : null }; })""")


async def why(page):
    return await page.evaluate("() => [...document.querySelectorAll('#apWhy, #apProWhy')].filter(e => !e.hidden && e.offsetParent).map(e => e.innerText).join(' ')")


async def close_pages(page):
    for _ in range(5):
        if await page.is_hidden('#acctPage'):
            return
        await page.click('#apBack')
        await page.wait_for_timeout(500)


async def demo_ready(page):
    await page.click('#demoBtn')
    await page.wait_for_selector('#exportBtn:not([disabled])', state='visible', timeout=40000)
    await page.wait_for_timeout(800)


async def export_once(page, timeout=180000):
    await page.evaluate("() => { const r = document.querySelector('#result'); if (r) r.hidden = true; }")
    await page.click('#exportBtn')
    await page.wait_for_function("() => { const r = document.querySelector('#result'); const a = document.querySelector('#acctPage'); return (r && !r.hidden) || (a && !a.hidden); }", timeout=timeout)
    await page.wait_for_timeout(300)
    return await page.evaluate("() => ({ result: !document.querySelector('#result').hidden, plans: !document.querySelector('#acctPage').hidden && !document.querySelector('#apPro').hidden, login: !document.querySelector('#acctPage').hidden && !document.querySelector('#apLogin').hidden })")


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()

        # 1. signed out, FR, phone
        ctx, pg, err = await open_page(browser, 'fr', 390, 844)
        await plans_page(pg)
        c = await cards(pg)
        check('fr-390: 4 cards, Max first on a phone', [x['plan'] for x in c] == ['max', 'pro', 'basic', 'free'], c)
        check('fr-390: one column', max(x['x'] for x in c) - min(x['x'] for x in c) <= 2, c)
        by = {x['plan']: x for x in c}
        check('fr-390: monthly prices', by['basic']['amt'] == '4,99 €' and by['pro']['amt'] == '10,99 €' and by['max']['amt'] == '13,99 €', [x['amt'] for x in c])
        rib = await pg.inner_text('#plMaxRib')
        check('fr-390: Max put forward: « Seulement 3 € de plus que Pro »', 'Seulement 3' in rib and 'Pro' in rib, rib)
        await shot(pg, 'plans-fr-390')
        await pg.tap('#plInt [data-int=year]')
        await pg.wait_for_timeout(200)
        c = await cards(pg); by = {x['plan']: x for x in c}
        check('fr-390 yearly: Basic 3,25 €/mois, 39 € once a year, saves 35 %', by['basic']['amt'] == '3,25 €' and '39 €' in by['basic']['bill'] and '35' in by['basic']['pill'], by['basic'])
        check('fr-390 yearly: Pro 9,08 €/mois (109 € a year)', by['pro']['amt'] == '9,08 €' and '109 €' in by['pro']['bill'], by['pro'])
        check('fr-390 yearly: a plan without a price says « Bientôt »', by['max']['btn'] == 'Bientôt' and by['max']['off'], by['max'])
        check('fr-390: no horizontal scroll (the comparison scrolls inside its card)', await no_scroll(pg))
        await shot(pg, 'plans-year-fr-390')
        await pg.tap('#plInt [data-int=month]')
        await pg.tap('#apBuy [data-buy=basic]')
        await pg.wait_for_selector('#apLogin:not([hidden])', timeout=5000)
        check('fr-390 signed out: a plan asks to sign in first', True)
        await close_pages(pg)
        await demo_ready(pg)
        r = await export_once(pg, 20000)
        await pg.wait_for_selector('#apLogin:not([hidden])', timeout=5000)
        w = await why(pg)
        check('fr-390 signed out: the export asks for a free account', not r['result'] and 'compte gratuit' in w, (r, w))
        await shot(pg, 'export-signedout-fr-390')
        check('fr-390: no page error', not err, err)
        await ctx.close()

        # 2. free account, EN, computer: 4 cards in a row; the free video of the day
        ctx, pg, err = await open_page(browser, 'en', 1280, 900, 'free-plan@example.com', 'pro=0')
        await plans_page(pg)
        c = await cards(pg)
        row = sorted(c, key=lambda x: x['x'])
        check('en-1280: 4 cards side by side, Free → Max', [x['plan'] for x in row] == ['free', 'basic', 'pro', 'max'] and len({x['x'] for x in c}) == 4, row)
        check('en-1280: « Your current plan » on Free', 'current plan' in {x['plan']: x for x in c}['free']['pill'], c)
        check('en-1280: no horizontal scroll', await no_scroll(pg))
        await shot(pg, 'plans-en-1280')
        await shot(pg, 'plans-en-1280-full', True)
        await close_pages(pg)
        await demo_ready(pg)
        r1 = await export_once(pg)
        check('en-1280 free: the first export of the day works', r1['result'] and not r1['plans'], r1)
        me = json.loads(await pg.evaluate("() => fetch('/api/me').then(r => r.text())"))
        check('en-1280 free: counted by the server (used today)', me['freeVideo']['usedToday'] is True, me['freeVideo'])
        r2 = await export_once(pg)
        w = await why(pg)
        check('en-1280 free: a second export opens the plans page with the reason', r2['plans'] and 'free video of the day is done' in w and 'midnight' in w, (r2, w))
        await shot(pg, 'daily-used-en-1280')
        await pg.evaluate("() => { location.hash = '#compte'; }")
        await pg.wait_for_selector('#apAccount:not([hidden])', timeout=8000)
        fv = await pg.inner_text('#apFv')
        check('en-1280 free: the account page says the video of the day is done', 'done' in fv and 'midnight' in fv, fv)
        check('en-1280 free: the reminder box is there, not ticked', await pg.is_visible('#apRemind') and not await pg.is_checked('#apRemind'))
        await pg.click('#apRemind')
        await pg.wait_for_timeout(800)
        me = json.loads(await pg.evaluate("() => fetch('/api/me').then(r => r.text())"))
        check('en-1280 free: the reminder box is saved', me['user']['reminders'] is True, me['user'])
        await shot(pg, 'account-free-en-1280')
        check('en-1280 free: no page error', not err, err)
        await ctx.close()

        # 3. Basic on a phone: unlimited exports, no logo, no reminder box
        ctx, pg, err = await open_page(browser, 'fr', 390, 844, 'basic-plan@example.com', 'pro=1&plan=basic')
        await demo_ready(pg)
        a = await export_once(pg); b = await export_once(pg)
        check('fr-390 Basic: two exports in a row, no limit', a['result'] and b['result'] and not b['plans'], (a, b))
        check('fr-390 Basic: Clip still tagged PRO, text sizes unlocked', await pg.evaluate("() => document.querySelector('#kindSeg button[data-v=clip]').classList.contains('protag') && !document.querySelector('#stSize button.protag')"))
        await pg.evaluate("() => { location.hash = '#compte'; }")
        await pg.wait_for_selector('#apAccount:not([hidden])', timeout=8000)
        sub = await pg.inner_text('#apSubT')
        check('fr-390 Basic: the account says « Stalak Basic »', 'Stalak Basic' in sub, sub)
        check('fr-390 Basic: no reminder box, no free-video line', not await pg.is_visible('#apRemind') and not await pg.is_visible('#apFv'))
        check('fr-390 Basic: no horizontal scroll', await no_scroll(pg))
        check('fr-390 Basic: no page error', not err, err)
        await ctx.close()

        # 4. Pro on a computer: its plan, and the switch to Max asks to confirm first
        ctx, pg, err = await open_page(browser, 'fr', 1280, 900, 'pro-plan@example.com', 'pro=1&plan=pro')
        await plans_page(pg)
        c = await cards(pg); by = {x['plan']: x for x in c}
        check('fr-1280 Pro: « Ta formule » on Pro', by['pro']['btn'] == 'Ta formule' and by['pro']['off'], by['pro'])
        check('fr-1280 Pro: « Passer à Max »', by['max']['btn'] == 'Passer à Max', by['max'])
        t = await pg.inner_text('#apProT')
        check('fr-1280 Pro: title « Tu es en Stalak Pro »', t == 'Tu es en Stalak Pro', t)
        perks = await pg.inner_text('#apPerks')
        check('fr-1280 Pro: its perks (20 a day, 20 Go), not Max', '20 fois par jour' in perks and '20 Go' in perks and 'humain' not in perks, perks)
        await pg.click('#apBuy [data-buy=max]')
        await pg.wait_for_timeout(200)
        b = await pg.inner_text('#apBuy [data-buy=max]')
        note = await pg.inner_text('.pl-max [data-pl=note]')
        check('fr-1280 Pro: a first tap asks to confirm (prorated)', b == 'Confirmer : passer à Max' and 'prorata' in note, (b, note))
        await shot(pg, 'plans-pro-fr-1280')
        check('fr-1280 Pro: no page error', not err, err)
        await ctx.close()

        # 5. Max on a phone, EN: « Talk to a human » in its perks; the menu says « Manage my subscription »
        ctx, pg, err = await open_page(browser, 'en', 390, 844, 'max-plan@example.com', 'pro=1&plan=max')
        await plans_page(pg)
        perks = await pg.inner_text('#apPerks')
        check('en-390 Max: perks with 60 a day, 100 GB, Talk to a human', '60 times' in perks and '100 GB' in perks and 'Talk to a human' in perks, perks)
        check('en-390 Max: no horizontal scroll', await no_scroll(pg))
        await shot(pg, 'plans-max-en-390')
        check('en-390 Max: no page error', not err, err)
        await ctx.close()

        # 6. the sign-up form has the reminder box (not ticked)
        ctx, pg, err = await open_page(browser, 'fr', 390, 844)
        await pg.evaluate("() => { location.hash = '#inscription'; }")
        await pg.wait_for_selector('#apUpF:not([hidden])', timeout=8000)
        lbl = await pg.inner_text('label[for=apUpRemind]')
        check('fr-390 sign-up: the reminder box, not ticked', not await pg.is_checked('#apUpRemind') and 'vidéo gratuite du jour' in lbl, lbl)
        check('fr-390 sign-up: no horizontal scroll', await no_scroll(pg))
        await shot(pg, 'signup-fr-390')
        await ctx.close()
        await browser.close()

    failed = [r for r in results if not r[1]]
    print(f'\n{len(results) - len(failed)}/{len(results)} passed')
    sys.exit(1 if failed else 0)

asyncio.run(main())
