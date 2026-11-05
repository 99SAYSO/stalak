"""CNIL rules for the first-visit source (Juridique, 5/11), in a real browser against tests/ui/server.mjs:
the source is kept with its date (« source|ms »), never extended by a new visit, forgotten after 13 months; « none » (refused on
the privacy page) is never replaced nor sent; after sign-up it leaves the browser (« done|ms ») and an account from Europe only
adds +1 to the anonymous total. Build the site first, start the server, then: python3 tests/ui/provenance_ui.py <base>"""
import asyncio, json, re, sys, urllib.request
from playwright.async_api import async_playwright

BASE = sys.argv[1].rstrip('/')
results = []
def check(name, ok, info=''):
    results.append(ok); print(('PASS ' if ok else 'FAIL ') + name + ('' if ok else '  ' + str(info)))
def post(path, body):
    r = urllib.request.Request(BASE + path, data=json.dumps(body).encode(), headers={'Content-Type': 'application/json'}, method='POST')
    return json.loads(urllib.request.urlopen(r).read())

async def page_with(browser, init=None, user=None, url='/'):
    ctx = await browser.new_context(viewport={'width': 390, 'height': 800})
    if user: await ctx.add_cookies([{'name': 'stalak_s', 'value': user['token'], 'url': BASE}])
    if init is not None: await ctx.add_init_script("try { if (!sessionStorage.getItem('t')) { sessionStorage.setItem('t', '1'); localStorage.setItem('stalak:src', " + json.dumps(init) + "); } } catch (e) {}")
    p = await ctx.new_page(); sent = []; errs = []
    p.on('request', lambda r: '/api/account/source' in r.url and sent.append(r.post_data))
    p.on('pageerror', lambda e: errs.append(str(e)))
    await p.goto(BASE + url, wait_until='load'); await p.wait_for_timeout(1200)
    return ctx, p, sent, errs

async def src(p): return await p.evaluate("() => localStorage.getItem('stalak:src')")

async def main():
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        # first visit from a ?ref= link: kept with its date
        ctx, p, _, errs = await page_with(b, url='/?ref=tiktok')
        v1 = await src(p)
        check('first visit kept with its date', bool(re.fullmatch(r'ref:tiktok\|\d{13}', v1 or '')), v1)
        await p.goto(BASE + '/?ref=ig', wait_until='load'); await p.wait_for_timeout(500)
        check('a new visit neither replaces nor extends it', await src(p) == v1, await src(p))
        check('no page error', not errs, errs); await ctx.close()
        # 13 months later: forgotten, a new first visit
        old = 'ig|' + str(int(__import__('time').time() * 1000) - 400 * 86400000)
        ctx, p, _, _ = await page_with(b, init=old)
        v = await src(p); check('forgotten after 13 months', v != old and v.startswith('direct|'), v); await ctx.close()
        # older value without a date (before this rule): dated 5/11/2026, not renewed
        ctx, p, _, _ = await page_with(b, init='yt')
        check('an old value gets the date of 5/11/2026', await src(p) == 'yt|1793836800000', await src(p)); await ctx.close()
        # refused on the privacy page
        ctx, p, sent, _ = await page_with(b, init='none', url='/?ref=tiktok')
        check('« none » is kept, nothing recorded', await src(p) == 'none', await src(p)); await ctx.close()
        u = post('/__test/user', {'pro': False})
        ctx, p, sent, _ = await page_with(b, init='none', user=u)
        check('« none » is never sent at sign-up', not sent and await src(p) == 'none', (sent, await src(p))); await ctx.close()
        # a new account: sent once, then gone from the browser
        u = post('/__test/user', {'pro': False})
        ctx, p, sent, _ = await page_with(b, init='tiktok|' + str(int(__import__('time').time() * 1000)), user=u)
        await p.wait_for_function("() => /^done\\|/.test(localStorage.getItem('stalak:src') || '')", timeout=8000)
        check('sent once at sign-up', len(sent) == 1 and '"tiktok"' in sent[0], sent)
        check('then erased from the browser (« done »)', re.fullmatch(r'done\|\d{13}', await src(p) or '') is not None, await src(p))
        await p.reload(wait_until='load'); await p.wait_for_timeout(800)
        check('never sent again', len(sent) == 1 and (await src(p)).startswith('done|'), (sent, await src(p)))
        await ctx.close(); await b.close()
    print(f'\n{sum(results)}/{len(results)} passed'); sys.exit(0 if all(results) else 1)

asyncio.run(main())
