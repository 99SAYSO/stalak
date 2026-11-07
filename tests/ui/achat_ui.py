"""Audit of 6/11, points 2 and 20 (domaine Comptes), Python Playwright against tests/ui/cloud-server.mjs, Paddle imitated:
- one « Choose Pro » is enough: from the pricing page (?plan=pro-year) signed out → the sign-in page; once signed in (here the
  way back from Google, #auth-ok-pro) the payment window opens by itself with that plan and that billing;
- signed in, the pricing link opens the payment at once; the plans page, signed out → sign in → payment, no second tap;
- the payment window blocked (an ad blocker): paddle.js not loaded, or loaded but no window → a clear message;
- « Sans filigrane » said once on the plans page: the Pro ribbon (choice of 6/11) keeps it, the banner above gives the price.
- (7/11) where the payment window is closed without buying (stage) and the visit's source with each step; the optional e-mail
  for tips at the end of a video (box not ticked, never for a subscriber, not asked again).
The site served must carry the tests' probe (tests/ui/_probe.py): copy public/ and add it, then start the server on the copy:
    cp -r public /tmp/x && python3 -c "import sys; sys.path.insert(0, 'tests/ui'); from _probe import add_probe; add_probe('/tmp/x')"
    node tests/ui/cloud-server.mjs /tmp/x <port>
    python3 /abs/path/tests/ui/achat_ui.py <base url of that fresh tests/ui/cloud-server.mjs>"""
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
        # 6. report of 7/11: where the payment window is closed (stage) and the source of the visit, sent with each step
        c = await ctx_for(b); p = await c.new_page(); evs = []
        p.on('request', lambda r: '/api/event' in r.url and evs.append(json.loads(r.post_data or '{}')))
        await p.goto(BASE + '/__test/login?email=stage@example.com&pro=0&to=' + '/fr/%3Fref%3Dseo-triller%23pro', wait_until='load'); await p.wait_for_timeout(1500)
        check('the visit source is worked out once for the tab (?ref=seo-triller → triller)', await p.evaluate("() => sessionStorage.getItem('stalak:vsrc')") == 'triller')
        for steps, want in [(['checkout.customer.created'], 'details'), ([], 'start'), (['checkout.customer.created', 'checkout.payment.selected'], 'payment')]:
            await p.click('#apBuy .pl-card[data-plan="pro"] [data-buy]'); await opens(p, n=1); await p.wait_for_timeout(300)
            for n in steps: await p.evaluate("n => window.__pcb({ name: n })", n)
            await p.evaluate("() => window.__pcb({ name: 'checkout.closed' })"); await p.wait_for_timeout(500)
            got = [e for e in evs if e.get('name') == 'checkout_close']
            check(f'payment window closed without buying → stage « {want} »', got and got[-1].get('stage') == want and got[-1].get('src') == 'triller', got[-1:] if got else evs[-3:])
            await p.evaluate("() => { window.__opens = []; }")
        await p.click('#apBuy .pl-card[data-plan="pro"] [data-buy]'); await opens(p, n=1); await p.wait_for_timeout(300)
        await p.evaluate("() => { window.__pcb({ name: 'checkout.payment.initiated' }); window.__pcb({ name: 'checkout.completed', data: {} }); window.__pcb({ name: 'checkout.closed' }); }")
        await p.wait_for_timeout(500)
        names = [e.get('name') for e in evs]
        check('bought: « checkout_done » once, no « closed without buying »', names.count('checkout_done') == 1 and names.count('checkout_close') == 3, names)
        check('each step carries the source', all(e.get('src') == 'triller' for e in evs if e.get('name') in ('checkout_open', 'checkout_done', 'checkout_close')), evs)
        await c.close()
        # 7. report of 7/11: the e-mail for tips at the end of a video (free users; box not ticked)
        c = await ctx_for(b); p = await c.new_page(); posts = []
        p.on('request', lambda r: r.url.endswith('/api/optin') and posts.append(json.loads(r.post_data or '{}')))
        await p.goto(BASE + '/fr/', wait_until='load'); await p.wait_for_function('typeof window.__ev === "function"', timeout=20000)
        # (the end screen of a real export, imitated: a video in hand; the box is taken out of the hidden step to be seen)
        await p.evaluate("() => __ev(\"lastBlob = new Blob(['x'], { type: 'video/mp4' }), lastName = 'stalak.mp4', S.lastDemo = false, optUi(), document.body.prepend($('#optBox'))\")")
        check('free user, after a video: the box is there, not ticked', await p.is_visible('#optBox') and not await p.is_checked('#optOk'))
        await p.fill('#optEmail', 'tips@example.com'); await p.click('#optGo'); await p.wait_for_timeout(300)
        check('without the tick: nothing sent, a clear word', not posts and 'Coche la case' in await p.inner_text('#optNote'), (posts, await p.inner_text('#optNote')))
        await p.check('#optOk'); await p.click('#optGo')
        await p.wait_for_function("() => /Regarde ta boîte mail/.test(document.querySelector('#optT').textContent)", timeout=8000)
        check('ticked: sent with the consent, then « regarde ta boîte mail »', posts == [{'email': 'tips@example.com', 'consent': True, 'lang': 'fr'}] and await p.is_hidden('#optForm'), posts)
        await p.evaluate("() => __ev('optUi()')")
        check('not asked again on this device', await p.evaluate("() => __ev(\"$('#optBox').hidden\")"))
        await c.close()
        c = await ctx_for(b); p = await c.new_page()
        await p.goto(BASE + '/__test/login?email=sub@example.com&pro=1&to=/fr/', wait_until='load'); await p.wait_for_function('typeof window.__ev === "function"', timeout=20000); await p.wait_for_timeout(1200)
        await p.evaluate("() => __ev(\"lastBlob = new Blob(['x'], { type: 'video/mp4' }), lastName = 'stalak.mp4', S.lastDemo = false, optUi()\")")
        check('never asked to a subscriber', await p.evaluate("() => __ev(\"$('#optBox').hidden\")"))
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
