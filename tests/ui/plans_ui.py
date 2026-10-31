"""UI test of the offer of 30/10/2026, evening (domaine Comptes, paiements & serveur), Python Playwright (chromium):
the plans page (Gratuit + Stalak Pro + Stalak Creator Plus, monthly / yearly, in dollars) and the change of plan.

    python3 /abs/path/tests/ui/plans_ui.py <base url of tests/ui/cloud-server.mjs> [folder for screenshots]

Build the site first (python3 build_site.py …), then run node tests/ui/cloud-server.mjs <repo>/public <port> (a fresh one per
run): the real Functions on node:sqlite, Paddle imitated. Accounts come from /__test/login?email=…&pro=1[&plan=pro] (or pro=0).
In that server, Creator Plus yearly has no Paddle price: its button must say « Bientôt ».
Checks (aligned on the Tarifs page, audit of 30/10): signed out, FR, 390 px: 3 cards (Pro first on a phone, « Ni pub ni
filigrane »), YEARLY by default (Pro 4,17 $/mois, 49,99 $ a year, « Économise 47 % »), monthly 7,99 $ / 14,99 $, « dès 2
playbacks », « 100 GB » in English, a plan asks to sign in; free, EN, 1280 px: 3 cards side by side (Free → Creator Plus), no
reminder box any more; Pro at 1280 px: « Ta formule », « Passer à Creator Plus » shows today's price before confirming; Creator
Plus at 390 px EN: its perks (60 a day, 100 GB, Talk to a human), Pro starts at the renewal; sign-up without the reminder box;
no horizontal scroll; no page error. Run this file by absolute path from a clean directory."""
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
        check('fr-390: 3 cards, Pro first on a phone (as on the Tarifs page)', [x['plan'] for x in c] == ['pro', 'creator', 'free'], c)
        check('fr-390: one column', max(x['x'] for x in c) - min(x['x'] for x in c) <= 2, c)
        by = {x['plan']: x for x in c}
        yr = await pg.get_attribute('#plInt [data-int=year]', 'aria-checked')
        check('fr-390: yearly by default', yr == 'true', yr)
        check('fr-390 yearly: Pro 4,17 $/mois, 49,99 $ once a year, saves 47 %', by['pro']['amt'] == '4,17 $' and '49,99 $' in by['pro']['bill'] and '47' in by['pro']['pill'], by['pro'])
        check('fr-390 yearly: Creator Plus saves 44 %', '44' in by['creator']['pill'], by['creator'])
        check('fr-390 yearly: a plan without a price says « Bientôt »', by['creator']['btn'] == 'Bientôt' and by['creator']['off'], by['creator'])
        rib = await pg.inner_text('#apBuy .pl-pro .pl-ribbon')
        check('fr-390: Pro put forward « Ni pub ni filigrane »', rib == 'Ni pub ni filigrane' and await pg.eval_on_selector('#apBuy .pl-pro', 'e => e.classList.contains("is-best")'), rib)
        save = await pg.inner_text('#plIntSave')
        check('fr-390: the yearly switch says « jusqu’à −47 % »', '47' in save, save)
        packs = await pg.inner_text('#apBuy .pl-creator [data-i18n="pl.f.packs"]')
        check('fr-390: packs « dès 2 playbacks »', 'dès 2 playbacks' in packs, packs)
        check('fr-390: no horizontal scroll (the comparison scrolls inside its card)', await no_scroll(pg))
        await shot(pg, 'plans-year-fr-390')
        await pg.tap('#plInt [data-int=month]')
        await pg.wait_for_timeout(200)
        c = await cards(pg); by = {x['plan']: x for x in c}
        check('fr-390: monthly prices in dollars', by['pro']['amt'] == '7,99 $' and by['creator']['amt'] == '14,99 $', [x['amt'] for x in c])
        await shot(pg, 'plans-fr-390')
        await pg.tap('#apBuy [data-buy=pro]')
        await pg.wait_for_selector('#apLogin:not([hidden])', timeout=5000)
        check('fr-390 signed out: a plan asks to sign in first', True)
        check('fr-390: no page error', not err, err)
        await ctx.close()

        # 2. free account, EN, computer: 3 cards in a row; no reminder box any more
        ctx, pg, err = await open_page(browser, 'en', 1280, 900, 'free-plan@example.com', 'pro=0')
        await plans_page(pg)
        c = await cards(pg)
        row = sorted(c, key=lambda x: x['x'])
        check('en-1280: 3 cards side by side, Free → Creator Plus', [x['plan'] for x in row] == ['free', 'pro', 'creator'] and len({x['x'] for x in c}) == 3, row)
        by = {x['plan']: x for x in c}
        check('en-1280: dollar prices, yearly by default', by['pro']['amt'] == '$4.17' and by['creator']['amt'] == '$8.33' and '47' in by['pro']['pill'], [x['amt'] for x in c])
        gb = await pg.inner_text('#apBuy [data-i18n="pl.v.100"]')
        packs = await pg.inner_text('#apBuy .pl-creator [data-i18n="pl.f.packs"]')
        check('en-1280: « 100 GB » and « from just 2 takes »', gb == '100 GB' and 'from just 2 takes' in packs, [gb, packs])
        # opened by a lock: the reason stays in sight at the top of the card the page scrolls to
        await pg.evaluate('__ev("acctOpen(\'clip\', { plan: \'pro\' })")')
        await pg.wait_for_selector('#apBuy .pl-pro .pl-why', timeout=5000)
        await pg.wait_for_timeout(900)
        why = await pg.eval_on_selector('#apBuy .pl-pro .pl-why', 'e => { const r = e.getBoundingClientRect(); return [e.textContent, r.top >= 0 && r.bottom <= innerHeight]; }')
        check('en-1280 lock: the reason is shown on the Pro card, in sight', 'Music video mode' in why[0] and why[1], why)
        await shot(pg, 'plans-why-en-1280')
        check('en-1280: « Your current plan » on Free', 'current plan' in by['free']['pill'], c)
        check('en-1280: no horizontal scroll', await no_scroll(pg))
        await shot(pg, 'plans-en-1280')
        await shot(pg, 'plans-en-1280-full', True)
        await pg.evaluate("() => { location.hash = '#compte'; }")
        await pg.wait_for_selector('#apAccount:not([hidden])', timeout=8000)
        check('en-1280 free: no free-video line nor reminder box', await pg.evaluate("() => !document.querySelector('#apRemind') && !document.querySelector('#apFv')"))
        sub = await pg.inner_text('#apSub')
        check('en-1280 free: « See the plans »', 'See the plans' in sub, sub)
        check('en-1280 free: no page error', not err, err)
        await ctx.close()

        # 3. Pro on a computer: its plan, and the move to Creator Plus shows today's price before confirming
        ctx, pg, err = await open_page(browser, 'fr', 1280, 900, 'pro-plan@example.com', 'pro=1&plan=pro')
        await plans_page(pg)
        c = await cards(pg); by = {x['plan']: x for x in c}
        check('fr-1280 Pro: « Ta formule » on Pro', by['pro']['btn'] == 'Ta formule' and by['pro']['off'], by['pro'])
        check('fr-1280 Pro: « Passer à Creator Plus »', by['creator']['btn'] == 'Passer à Creator Plus', by['creator'])
        t = await pg.inner_text('#apProT')
        check('fr-1280 Pro: title « Tu es en Stalak Pro »', t == 'Tu es en Stalak Pro', t)
        perks = await pg.inner_text('#apPerks')
        check('fr-1280 Pro: its perks (no watermark, 20 a day), not Creator Plus', 'filigrane' in perks and '20 fois par jour' in perks and 'humain' not in perks and 'Go' not in perks, perks)
        await pg.click('#apBuy [data-buy=creator]')
        await pg.wait_for_function("() => /23,10/.test(document.querySelector('.pl-creator [data-pl=note]').textContent)", timeout=8000)
        b = await pg.inner_text('#apBuy [data-buy=creator]')
        note = await pg.inner_text('.pl-creator [data-pl=note]')
        check('fr-1280 Pro: a first tap shows the price of today and asks to confirm', b == 'Confirmer : passer à Creator Plus' and '23,10' in note and 'prorata' in note, (b, note))
        await shot(pg, 'plans-pro-fr-1280')
        check('fr-1280 Pro: no page error', not err, err)
        await ctx.close()

        # 4. Creator Plus on a phone, EN: its perks; Pro starts at the renewal
        ctx, pg, err = await open_page(browser, 'en', 390, 844, 'creator-plan@example.com', 'pro=1&plan=creator')
        await plans_page(pg)
        perks = await pg.inner_text('#apPerks')
        check('en-390 Creator Plus: perks with 60 a day, 100 GB, Talk to a human', '60 times' in perks and '100 GB' in perks and 'Talk to a human' in perks, perks)
        await pg.tap('#apBuy [data-buy=pro]')
        await pg.wait_for_function("() => /renewal/.test(document.querySelector('.pl-pro [data-pl=note]').textContent)", timeout=8000)
        note = await pg.inner_text('.pl-pro [data-pl=note]')
        check('en-390 Creator Plus: Pro starts at the renewal, nothing refunded', 'nothing is refunded' in note and 'Creator Plus stays on' in note, note)
        await pg.tap('#apBuy [data-buy=pro]')
        await pg.wait_for_function("() => /starts on/.test(document.querySelector('#apMsgT').textContent)", timeout=8000)
        check('en-390 Creator Plus: the move to Pro is planned for the renewal', 'Stalak Pro starts on' in await pg.inner_text('#apMsgT'))
        check('en-390 Creator Plus: no horizontal scroll', await no_scroll(pg))
        await shot(pg, 'plans-creator-en-390')
        check('en-390 Creator Plus: no page error', not err, err)
        await ctx.close()

        # 5. the sign-up form: no reminder box any more
        ctx, pg, err = await open_page(browser, 'fr', 390, 844)
        await pg.evaluate("() => { location.hash = '#inscription'; }")
        await pg.wait_for_selector('#apUpF:not([hidden])', timeout=8000)
        check('fr-390 sign-up: no reminder box', await pg.evaluate("() => !document.querySelector('#apUpRemind')"))
        check('fr-390 sign-up: no horizontal scroll', await no_scroll(pg))
        await ctx.close()
        await browser.close()

    failed = [r for r in results if not r[1]]
    print(f'\n{len(results) - len(failed)}/{len(results)} passed')
    sys.exit(1 if failed else 0)

asyncio.run(main())
