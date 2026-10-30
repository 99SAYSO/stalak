"""UI test of the account menu and the Galerie (domaine Comptes, paiements & serveur), Python Playwright (chromium).

    python3 /abs/path/tests/ui/gallery_ui.py <base url of tests/ui/cloud-server.mjs> [folder for screenshots]

Build the site first (python3 build_site.py …), then run node tests/ui/cloud-server.mjs <repo>/public <port> (a fresh one per
run): the real Functions on node:sqlite with an in-memory R2. Accounts come from /__test/login?email=…&pro=1|0|ex.
Checks: signed out → « Se connecter » opens the sign-in; the menu (5 entries, Stalak Pro / Gérer mon abonnement, closes on a tap
outside, Escape, arrows, Aide, Mon compte, Se déconnecter); the Galerie for a free account and an ex-Pro (« réservée à Stalak
Pro », button to the Pro page); for Creator Plus: automatic saving (the example saves itself, « Enregistré ✓ », nothing sent
when nothing changed or during an export, the Galerie name kept), a 300 px cover, the grid (3 columns on a phone, more
on a computer, most recent first, name under the cover), a long press and « … » (rename, delete), a tap opens the project;
FR and EN; no horizontal scroll; no page error. Run this file by absolute path from a clean directory."""
import asyncio, json, os, sys, urllib.request
from playwright.async_api import async_playwright

BASE = sys.argv[1].rstrip('/')
SHOTS = sys.argv[2] if len(sys.argv) > 2 else None
results = []


def check(name, ok, info=''):
    results.append((name, bool(ok), info))
    print(('PASS ' if ok else 'FAIL ') + name + (('  — ' + str(info)) if info and not ok else ''), flush=True)


async def shot(page, name):
    if SHOTS:
        await page.wait_for_timeout(700)  # let the opening animations end
        await page.screenshot(path=os.path.join(SHOTS, name + '.png'))


def watch(page, errors):
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('console', lambda m: errors.append(m.text) if m.type == 'error' and 'favicon' not in m.text and 'status of 403' not in m.text and 'status of 404' not in m.text else None)


async def no_scroll(page):
    return await page.evaluate('() => document.documentElement.scrollWidth - window.innerWidth') <= 0


async def ctx_page(browser, lang, w, h, email=None, pro=None):
    ctx = await browser.new_context(locale='fr-FR' if lang == 'fr' else 'en-US', viewport={'width': w, 'height': h}, is_mobile=w < 500, has_touch=w < 500)
    if email:
        # a member who already saw the « thank you for going Pro » screen
        await ctx.add_init_script("try { for (const k of Object.keys(localStorage)) {} } catch (e) {}")
    page = await ctx.new_page()
    errors = []
    watch(page, errors)
    to = '/' if lang == 'fr' else '/en/'
    if email:
        await page.goto(BASE + f'/__test/login?email={email}&pro={pro}&to={to}', wait_until='load')
        uid = await page.evaluate("() => fetch('/api/me').then(r => r.json()).then(d => d.user && d.user.id)")
        await page.evaluate("id => localStorage.setItem('stalak:proThanks:' + id, '1')", uid)
        await page.goto(BASE + to, wait_until='load')
    else:
        await page.goto(BASE + to, wait_until='load')
    await page.wait_for_function("() => !document.querySelector('#acctBtn').hidden", timeout=15000)
    await page.wait_for_timeout(500)
    return ctx, page, errors


async def menu_open(page):
    await page.click('#acctBtn')
    await page.wait_for_selector('#acctMenu:not([hidden])', timeout=5000)


async def tiles(page):
    return await page.eval_on_selector_all('#clList .gal-item:not(.gal-ren)', """els => els.map(e => {
        const r = e.getBoundingClientRect(), img = e.querySelector('img');
        return { x: Math.round(r.left), y: Math.round(r.top), name: e.querySelector('.gal-name').textContent, img: img ? img.naturalWidth : 0 }; })""")


async def make_projects(page, names):
    # extra projects through the API (as the app would), each with a small JPEG cover drawn in the page
    await page.evaluate("""async names => {
        for (const [i, n] of names.entries()) {
            const id = 'p_api_' + i;
            await fetch('/api/projects/' + id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: n, state: { app: 'stalak', v: 1 } }) });
            const c = document.createElement('canvas'); c.width = 300; c.height = 533; const x = c.getContext('2d');
            x.fillStyle = 'hsl(' + (i * 70) + ' 70% 55%)'; x.fillRect(0, 0, 300, 533); x.fillStyle = '#fff'; x.font = 'bold 60px sans-serif'; x.fillText(String(i + 1), 120, 280);
            const b = await new Promise(r => c.toBlob(r, 'image/jpeg', 0.8));
            await fetch('/api/projects/' + id + '/cover', { method: 'PUT', headers: { 'Content-Type': 'image/jpeg' }, body: b });
            await new Promise(r => setTimeout(r, 15));
        }
    }""", names)


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()

        # 1. signed out: « Se connecter », no menu
        ctx, pg, err = await ctx_page(browser, 'fr', 390, 844)
        lbl = await pg.get_attribute('#acctBtn', 'aria-label')
        check('fr-390 signed out: the button says « Se connecter »', lbl == 'Se connecter', lbl)
        await pg.click('#acctBtn')
        await pg.wait_for_selector('#acctPage:not([hidden]) #apLogin:not([hidden])', timeout=5000)
        check('fr-390 signed out: it opens the sign-in, no menu', await pg.is_hidden('#acctMenu'))
        check('fr-390 signed out: no page error', not err, err)
        await ctx.close()

        # 2. a free account on a phone: the menu, the Galerie « réservée à Stalak Creator Plus »
        ctx, pg, err = await ctx_page(browser, 'fr', 390, 844, 'free-gal@example.com', '0')
        await menu_open(pg)
        items = await pg.eval_on_selector_all('#acctMenu [role=menuitem]', 'els => els.map(e => e.innerText.trim())')
        check('fr-390 free: 5 entries in the menu', items == ['Galerie', 'Mon compte', 'Stalak Pro', 'Aide', 'Se déconnecter'], items)
        check('fr-390 free: the button says the menu is open', await pg.get_attribute('#acctBtn', 'aria-expanded') == 'true')
        box = await pg.eval_on_selector('#acctMenu', 'e => { const r = e.getBoundingClientRect(); return [r.left, r.right, innerWidth]; }')
        check('fr-390 free: the menu fits on the screen', box[0] >= 0 and box[1] <= box[2], box)
        await shot(pg, 'menu-fr-390')
        # a tap anywhere else closes it
        await pg.touchscreen.tap(30, 600)
        await pg.wait_for_timeout(200)
        check('fr-390 free: a tap outside closes the menu', await pg.is_hidden('#acctMenu') and await pg.get_attribute('#acctBtn', 'aria-expanded') == 'false')
        await menu_open(pg)
        await pg.tap('#acctMenu [data-am=gallery]')
        await pg.wait_for_selector('#apGallery:not([hidden]) #galLock:not([hidden])', timeout=8000)
        lock = await pg.inner_text('#galLock')
        check('fr-390 free: Galerie « réservée à Stalak Creator Plus »', 'réservée à Stalak Creator Plus' in lock and 'Avec Stalak Creator Plus' in lock, lock)
        check('fr-390 free: no grid', await pg.is_hidden('#apProjects'))
        check('fr-390 free: address #galerie', (await pg.evaluate('location.hash')) == '#galerie')
        check('fr-390 free: no horizontal scroll', await no_scroll(pg))
        await shot(pg, 'gallery-free-fr-390')
        await pg.tap('#galPro')
        await pg.wait_for_selector('#apPro:not([hidden])', timeout=5000)
        why = await pg.inner_text('#apProWhy')
        check('fr-390 free: the button opens the plans page, with the reason', 'Stalak Creator Plus' in why, why)
        await pg.go_back()
        await pg.wait_for_selector('#apGallery:not([hidden])', timeout=5000)
        check('fr-390 free: Back goes back to the Galerie', True)
        await pg.click('#apBack')
        await pg.wait_for_timeout(500)
        # Aide and Mon compte
        await menu_open(pg)
        await pg.tap('#acctMenu [data-am=help]')
        await pg.wait_for_selector('#helpPanel:not([hidden])', timeout=5000)
        check('fr-390 free: « Aide » opens the help ice cube', True)
        await pg.click('#helpClose')
        await menu_open(pg)
        await pg.tap('#acctMenu [data-am=account]')
        await pg.wait_for_selector('#apAccount:not([hidden])', timeout=5000)
        check('fr-390 free: « Mon compte » opens the account page, with a Galerie card', await pg.is_visible('#apGalGo'))
        await pg.click('#apBack')
        await pg.wait_for_timeout(500)
        # Se déconnecter
        await menu_open(pg)
        await pg.tap('#acctMenu [data-am=out]')
        await pg.wait_for_function("() => document.querySelector('#acctBtn').getAttribute('aria-label') === 'Se connecter'", timeout=8000)
        check('fr-390 free: « Se déconnecter » signs out', True)
        check('fr-390 free: no page error', not err, err)
        await ctx.close()

        # 3. an ex-Pro on a computer (EN): the Galerie says his projects are kept 6 months
        ctx, pg, err = await ctx_page(browser, 'en', 1280, 800, 'ex-gal@example.com', 'ex')
        await menu_open(pg)
        check('en-1280 ex-Pro: « Stalak Pro » in the menu (not Pro any more)', (await pg.inner_text('#amProT')) == 'Stalak Pro')
        # keyboard: Escape closes and gives the focus back; arrows move
        await pg.keyboard.press('ArrowDown')
        check('en-1280: arrow down moves to « My account »', (await pg.evaluate('document.activeElement.innerText.trim()')) == 'My account')
        await pg.keyboard.press('Escape')
        check('en-1280: Escape closes the menu and focuses the button', await pg.is_hidden('#acctMenu') and (await pg.evaluate("document.activeElement.id")) == 'acctBtn')
        await menu_open(pg)
        await pg.click('#acctMenu [data-am=gallery]')
        await pg.wait_for_selector('#galLock:not([hidden])', timeout=8000)
        lock = await pg.inner_text('#galLock')
        check('en-1280 ex-Pro: « part of Stalak Creator Plus », kept 6 months', 'part of Stalak Creator Plus' in lock and '6 months' in lock, lock)
        await shot(pg, 'gallery-expro-en-1280')
        check('en-1280 ex-Pro: no page error', not err, err)
        await ctx.close()

        # 4. Pro on a phone: a real save from the example, with its cover; then the grid
        ctx, pg, err = await ctx_page(browser, 'fr', 390, 844, 'pro-gal@example.com', '1')
        await menu_open(pg)
        check('fr-390 Pro: « Gérer mon abonnement » in the menu', (await pg.inner_text('#amProT')) == 'Gérer mon abonnement')
        await pg.tap('#acctMenu [data-am=gallery]')
        await pg.wait_for_selector('#apGallery:not([hidden]) #clEmpty:not([hidden])', timeout=8000)
        empty = await pg.inner_text('#clEmpty')
        check('fr-390 Pro: empty Galerie says projects save themselves', 's’enregistre tout seul' in empty, empty)
        await pg.click('#apBack')
        await pg.wait_for_timeout(400)
        check('fr-390 Pro: no « Sauvegarder en ligne » button any more', await pg.locator('#cloudSaveBtn, #clSaveHere, #clNameF').count() == 0)
        puts = []
        pg.on('request', lambda r: puts.append((r.method, r.url)) if r.method in ('PUT', 'POST') and '/api/projects/' in r.url else None)
        await pg.click('#demoBtn')
        # automatic saving: the example saves itself, the header says « Enregistré ✓ »
        await pg.wait_for_selector('#clAuto[data-st=saved]:not([hidden])', timeout=60000)
        txt = await pg.text_content('#clAutoT')
        check('fr-390 Pro: the example saved itself, « Enregistré ✓ » in the header', txt == 'Enregistré ✓', txt)
        ab = await pg.eval_on_selector('#clAuto', 'e => { const r = e.getBoundingClientRect(); return [r.left, r.right, r.width, innerWidth]; }')
        check('fr-390 Pro: the indicator is small and on the screen', ab[0] >= 0 and ab[1] <= ab[3] and ab[2] <= 140, ab)
        await shot(pg, 'autosave-fr-390')
        stats = json.load(urllib.request.urlopen(BASE + '/__test/stats'))
        covers = [k for k in stats['keys'] if k.endswith('/cover')]
        check('fr-390 Pro: the save made a cover in R2, next to the project', len(covers) == 1 and '/p/' in covers[0], stats['keys'])
        pid = await pg.evaluate('__ev("CL.cur && CL.cur.id")')
        saves = [u for m, u in puts if m == 'PUT' and u.endswith('/api/projects/' + pid)]
        check('fr-390 Pro: one save for the example', len(saves) == 1, puts)
        # nothing changes: nothing is sent again
        await pg.wait_for_timeout(9000)
        saves = [u for m, u in puts if m == 'PUT' and u.endswith('/api/projects/' + pid)]
        check('fr-390 Pro: nothing changed → nothing sent', len(saves) == 1, puts)
        # renamed in the Galerie: the name stays after the next automatic save
        await pg.evaluate("id => fetch('/api/projects/' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Démo glace' }) })", pid)
        # during an export: nothing is sent; afterwards the change is saved
        n0 = len(puts)
        await pg.evaluate('__ev("S.exporting = true; S.seed = (S.seed || 0) + 7")')
        await pg.wait_for_timeout(10000)
        check('fr-390 Pro: nothing sent during an export', len(puts) == n0, puts[n0:])
        await pg.evaluate('__ev("S.exporting = false")')
        await pg.wait_for_function("id => performance.getEntriesByType('resource').filter(e => e.name.endsWith('/api/projects/' + id)).length >= 2", arg=pid, timeout=20000)
        await pg.wait_for_selector('#clAuto[data-st=saved]', timeout=10000)
        saves = [u for m, u in puts if m == 'PUT' and u.endswith('/api/projects/' + pid)]
        check('fr-390 Pro: after the export, the change is saved (only the project, no file sent again)', len(saves) == 2 and not any('/files' in u for m, u in puts[n0:]), puts[n0:])
        name = await pg.evaluate("id => fetch('/api/projects').then(r => r.json()).then(d => d.projects.find(p => p.id === id).name)", pid)
        check('fr-390 Pro: the name given in the Galerie is kept', name == 'Démo glace', name)
        await make_projects(pg, ['Son deux', 'Son trois', 'Un nom de projet vraiment très long pour voir', 'Son cinq'])
        await menu_open(pg)
        await pg.tap('#acctMenu [data-am=gallery]')
        await pg.wait_for_selector('#clList .gal-item', timeout=8000)
        await pg.wait_for_function("() => [...document.querySelectorAll('#clList img')].every(i => i.complete)", timeout=8000)
        t = await tiles(pg)
        check('fr-390 Pro: 5 projects, most recent first', [x['name'] for x in t][0] == 'Son cinq' and t[-1]['name'] == 'Démo glace' and len(t) == 5, [x['name'] for x in t])
        demo = [x for x in t if x['name'] == 'Démo glace'][0]
        check('fr-390 Pro: the cover made at save time is shown, 300 px wide', demo['img'] == 300, demo)
        cols = len(set(x['x'] for x in t))
        check('fr-390 Pro: 3 columns on a phone', cols == 3, cols)
        check('fr-390 Pro: no horizontal scroll', await no_scroll(pg))
        await shot(pg, 'gallery-pro-fr-390')
        # a long press: Renommer / Supprimer
        first = pg.locator('#clList .gal-item .gal-open').nth(0)
        bb = await first.bounding_box()
        await pg.mouse.move(bb['x'] + bb['width'] / 2, bb['y'] + bb['height'] / 3)
        await pg.mouse.down()
        await pg.wait_for_timeout(700)
        await pg.mouse.up()
        await pg.wait_for_timeout(200)
        menu = await pg.eval_on_selector('.gal-menu', 'e => e.hidden ? null : [...e.querySelectorAll("[role=menuitem]")].map(b => b.innerText)')
        check('fr-390 Pro: a long press shows Renommer / Supprimer', menu == ['Renommer', 'Supprimer'], menu)
        check('fr-390 Pro: … without opening the project', await pg.is_hidden('#cloudDlg'))
        mb = await pg.eval_on_selector('.gal-menu', 'e => { const r = e.getBoundingClientRect(); return [r.left, r.right, r.top, r.bottom, innerWidth, innerHeight]; }')
        check('fr-390 Pro: that menu fits on the screen', mb[0] >= 0 and mb[1] <= mb[4] and mb[2] >= 0 and mb[3] <= mb[5], mb)
        await shot(pg, 'gallery-longpress-fr-390')
        await pg.click('.gal-menu [data-k=rename]')
        await pg.wait_for_selector('#clList .gal-ren input', timeout=5000)
        await pg.fill('#clList .gal-ren input', 'Son cinq (renommé)')
        await pg.press('#clList .gal-ren input', 'Enter')
        await pg.wait_for_function("() => [...document.querySelectorAll('#clList .gal-name')].some(e => e.textContent === 'Son cinq (renommé)')", timeout=8000)
        check('fr-390 Pro: renamed', True)
        # « … »: Supprimer, with the confirmation
        await pg.click("#clList .gal-item:has-text('Son deux') .gal-more")
        await pg.click('.gal-menu [data-k=del]')
        await pg.wait_for_selector('#homeAsk:not([hidden])', timeout=5000)
        await pg.click('#homeYes')
        await pg.wait_for_function("() => ![...document.querySelectorAll('#clList .gal-name')].some(e => e.textContent === 'Son deux')", timeout=8000)
        stats = json.load(urllib.request.urlopen(BASE + '/__test/stats'))
        check('fr-390 Pro: deleted, with its cover', len([k for k in stats['keys'] if k.endswith('/cover')]) == 4, stats['keys'])
        # a tap opens the project (here the example is on screen: the app asks first)
        await pg.tap("#clList .gal-item:has-text('Démo glace') .gal-open")
        await pg.wait_for_selector('#homeAsk:not([hidden])', timeout=5000)
        check('fr-390 Pro: a tap opens the project (asks before replacing the one on screen)', True)
        await pg.click('#homeNo')
        check('fr-390 Pro: no page error', not err, err)
        await ctx.close()

        # 5. the same account on a computer: more columns
        ctx, pg, err = await ctx_page(browser, 'en', 1280, 800, 'pro-gal@example.com', '1')
        await pg.goto(BASE + '/en/#galerie', wait_until='load')
        await pg.wait_for_selector('#clList .gal-item', timeout=10000)
        await pg.wait_for_timeout(500)
        t = await tiles(pg)
        cols = len(set(x['x'] for x in t if x['y'] == t[0]['y']))
        check('en-1280 Pro: more than 3 columns on a computer', cols > 3, cols)
        check('en-1280 Pro: no horizontal scroll', await no_scroll(pg))
        await pg.hover('#clList .gal-item >> nth=0')
        await shot(pg, 'gallery-pro-en-1280')
        # a tap on an empty page opens the project directly
        await pg.click("#clList .gal-item:has-text('Démo glace') .gal-open")
        await pg.wait_for_function("() => /Démo glace/.test(document.querySelector('#status').textContent)", timeout=20000)
        try:
            await pg.wait_for_selector('#acctPage', state='hidden', timeout=5000); closed = True
        except Exception:
            closed = False
        check('en-1280 Pro: the project opens, the Galerie closes', closed)
        puts = []
        pg.on('request', lambda r: puts.append(r.url) if r.method in ('PUT', 'POST') and '/api/projects/' in r.url else None)
        await pg.wait_for_selector('#clAuto[data-st=saved]:not([hidden])', timeout=20000)
        txt = await pg.text_content('#clAutoT')
        check('en-1280 Pro: an opened project shows « Saved ✓ » without sending it again', txt == 'Saved ✓' and not puts, [txt, puts])
        await shot(pg, 'autosave-en-1280')
        check('en-1280 Pro: no page error', not err, err)
        await ctx.close()
        await browser.close()
    failed = [r for r in results if not r[1]]
    print(f'\n{len(results) - len(failed)}/{len(results)} passed')
    sys.exit(1 if failed else 0)

asyncio.run(main())
