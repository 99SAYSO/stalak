"""Audit of 6/11, points 2 and 20 (domaine Comptes), Python Playwright against tests/ui/cloud-server.mjs, Paddle imitated:
- one « Choose Pro » is enough: from the pricing page (?plan=pro-year) signed out → the sign-in page; once signed in (here the
  way back from Google, #auth-ok-pro) the payment window opens by itself with that plan and that billing;
- signed in, the pricing link opens the payment at once; the plans page, signed out → sign in → payment, no second tap;
- the payment window blocked (an ad blocker): paddle.js not loaded, or loaded but no window → a clear message;
- « Sans filigrane » said once on the plans page: the Pro ribbon (choice of 6/11) keeps it, the banner above gives the price.
    python3 /abs/path/tests/ui/achat_ui.py <base url of a fresh tests/ui/cloud-server.mjs>"""
import asyncio, json, sys
from playwright.async_api import async_playwright

BASE = sys.argv[1].rstrip('/')
results = []
def check(name, ok, info=''):
    results.append(ok); print(('PASS ' if ok else 'FAIL ') + name + ('' if ok else '  ' + str(info)))

# a Paddle imitation: records Checkout.open; mode 'ok' sends checkout.loaded, 'silent' nothing (blocked window)
FAKE = """window.Paddle = { Environment: { set(){} }, Initialize(o){ window.__pcb = o.eventCallback; },
  Checkout: { open(o){ (window.__opens = window.__opens || []).push(o); if (window.__pmode !== 'silent') setTimeout(() => window.__pcb && window.__pcb({ name: 'checkout.loaded' }), 50); } } };"""

async def ctx_for(b, paddle='ok', lang='fr', width=390):
    c = await b.new_context(viewport={'width': width, 'height': 860}, locale='fr-FR' if lang == 'fr' else 'en-US')
    if paddle == 'blocked': await c.route('https://cdn.paddle.com/**', lambda r: r.abort())
    else:
        await c.route('https://cdn.paddle.com/**', lambda r: r.fulfill(status=200, content_type='application/javascript', body=FAKE))
        if paddle == 'silent': await c.add_init_script("window.__pmode = 'silent'")
    return c

async def opens(p, n=1, ms=8000):
    try: await p.wait_for_function(f"() => (window.__opens || []).length >= {n}", timeout=ms)
    except Exception: pass
    return await p.evaluate("() => (window.__opens || []).map(o => o.items[0].priceId)")

async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch(); errs = []
        # 1. pricing page « Choose Pro » (yearly), signed out
        c = await ctx_for(b); p = await c.new_page(); p.on('pageerror', lambda e: errs.append(str(e)))
        await p.goto(BASE + '/fr/?plan=pro-year#pro', wait_until='load'); await p.wait_for_timeout(1500)
        check('signed out: the pricing link opens the sign-in page', await p.is_visible('#apLogin'), await p.evaluate("() => location.href"))
        check('the choice is kept (this tab)', json.loads(await p.evaluate("() => sessionStorage.getItem('stalak:buy')") or '{}').get('plan') == 'pro')
        check('the address no longer carries ?plan=', 'plan=' not in await p.evaluate("() => location.search"))
        # signed in (the way back from Google: cookie + #auth-ok-pro) → the payment opens by itself, Pro yearly
        await p.goto(BASE + '/__test/login?email=buyer1@example.com&pro=0&to=' + '/fr/%23auth-ok-pro', wait_until='load')
        ids = await opens(p)
        check('signed in → the payment window opens by itself, with Pro yearly (one « Choose Pro »)', ids == ['pri_pro_y'], ids)
        check('the choice is used once', await p.evaluate("() => sessionStorage.getItem('stalak:buy')") is None)
        await c.close()
        # 2. signed in already: the pricing link (Creator Plus monthly) opens the payment at once
        c = await ctx_for(b); p = await c.new_page(); p.on('pageerror', lambda e: errs.append(str(e)))
        await p.goto(BASE + '/__test/login?email=buyer2@example.com&pro=0&to=/', wait_until='load')
        await p.goto(BASE + '/?plan=creator-month#pro', wait_until='load')
        ids = await opens(p)
        check('signed in: the pricing link opens the payment at once', ids == ['pri_creator_m'], ids)
        await c.close()
        # 3. the plans page, signed out: « Choose Pro » → sign in → the payment, no second tap
        c = await ctx_for(b); p = await c.new_page(); p.on('pageerror', lambda e: errs.append(str(e)))
        await p.goto(BASE + '/fr/#pro', wait_until='load'); await p.wait_for_timeout(1500)
        await p.click('#plInt button[data-int="month"]')
        await p.click('#apBuy .pl-card[data-plan="pro"] [data-buy]')
        await p.wait_for_selector('#apLogin', state='visible', timeout=5000)
        await p.goto(BASE + '/__test/login?email=buyer3@example.com&pro=0&to=' + '/fr/%23auth-ok-pro', wait_until='load')
        ids = await opens(p)
        check('plans page signed out → sign in → payment of Pro monthly', ids == ['pri_pro_m'], ids)
        # signing in from elsewhere later does not open an old choice
        await c.close()
        c = await ctx_for(b); p = await c.new_page()
        await p.goto(BASE + '/fr/#pro', wait_until='load'); await p.wait_for_timeout(1200)
        await p.click('#apBuy .pl-card[data-plan="pro"] [data-buy]')
        await p.goto(BASE + '/__test/login?email=buyer4@example.com&pro=0&to=' + '/fr/%23auth-ok-account', wait_until='load')
        ids = await opens(p, ms=3000)
        check('signed in from the account button: no payment opened', ids == [], ids)
        await c.close()
        # 4. blocked: paddle.js cannot load / loads but no window
        for mode, code in [('blocked', 'bloquée'), ('silent', 'ne s’est pas ouverte')]:
            c = await ctx_for(b, paddle=mode); p = await c.new_page()
            await p.goto(BASE + '/__test/login?email=blocked-' + mode + '@example.com&pro=0&to=/fr/%23pro', wait_until='load'); await p.wait_for_timeout(1500)
            await p.click('#apBuy .pl-card[data-plan="pro"] [data-buy]')
            try:
                await p.wait_for_function("t => document.querySelector('#acctPage').innerText.includes(t)", arg=code, timeout=16000)
                ok = True
            except Exception: ok = False
            txt = await p.evaluate("() => [...document.querySelectorAll('#acctPage [role=status], #acctPage [role=alert], #acctPage .ap-msg')].map(e => e.innerText).join(' | ')")
            check(f'payment window {mode}: a clear message (ad blocker)', ok and 'bloqueur de pub' in await p.inner_text('#acctPage'), txt[:200])
            await c.close()
        # 5. the Pro ribbon
        c = await ctx_for(b); p = await c.new_page()
        await p.goto(BASE + '/fr/#pro', wait_until='load'); await p.wait_for_timeout(1500)
        rib = (await p.inner_text('#apBuy .pl-card[data-plan="pro"] .pl-ribbon')).strip(); promo = await p.inner_text('#apPromo')
        check('« Sans filigrane » said once: the Pro ribbon keeps it, the banner above gives the price', rib == 'Sans filigrane' and 'filigrane' not in promo.lower() and '4,17' in promo, (rib, promo))
        await c.close(); await b.close()
        check('no page error', not errs, errs)
    print(f'\n{sum(results)}/{len(results)} passed'); sys.exit(0 if all(results) else 1)

asyncio.run(main())
