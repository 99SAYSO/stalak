"""UI test of the help assistant on stalak.app (the ice cube at the bottom right), Python Playwright (chromium).

    python3 /abs/path/tests/ui/help_ui.py <base url of tests/ui/server.mjs> <path of the claude.ai build shuffle-lab.html>

Build the site first (python3 build_site.py …, python3 build.py), then run node tests/ui/server.mjs <repo>/public <port>:
the real Functions on node:sqlite with a fake Workers AI that answers the chat. Checks, on a phone (390 px) and a computer
(1280 px), in French and English: the AI notice, the suggested questions, typed questions, the conversation sent, no
Markdown left in the answer, the "busy" message, no horizontal scroll, no page error; and that the claude.ai build still loads.
Run this file by absolute path from a clean directory."""
import asyncio, json, os, sys, urllib.request
from playwright.async_api import async_playwright

BASE, CLAUDE_BUILD = sys.argv[1].rstrip('/'), sys.argv[2]
SHOTS = os.environ.get('STALAK_UI_SHOTS')
results = []


def check(name, ok, info=''):
    results.append((name, bool(ok), info))
    print(('PASS ' if ok else 'FAIL ') + name + (('  — ' + str(info)) if info and not ok else ''))


def ai_calls():
    return [c for c in json.load(urllib.request.urlopen(BASE + '/__test/ai')) if c.get('help')]


def help_max(n):
    urllib.request.urlopen(BASE + '/__test/helpmax?n=' + str(n)).read()


async def run_one(browser, path, lang, width, height):
    tag = f'{lang}-{width}'
    ctx = await browser.new_context(locale='fr-FR' if lang == 'fr' else 'en-US', viewport={'width': width, 'height': height}, device_scale_factor=2 if width < 500 else 1,
                                    is_mobile=width < 500, has_touch=width < 500)
    page = await ctx.new_page()
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    # the 503 of the « busy » step is expected: the browser logs any failed request by itself
    page.on('console', lambda m: errors.append(m.text) if m.type == 'error' and 'favicon' not in m.text and 'status of 503' not in m.text else None)
    await page.goto(BASE + path, wait_until='load')
    await page.wait_for_timeout(600)
    await page.click('#helpBtn', force=True)
    await page.wait_for_selector('#helpPanel:not([hidden])')
    hello = await page.inner_text('#helpLog .hp-msg.bot')
    check(f'{tag}: hello says the answers come from an AI', ('IA' in hello) if lang == 'fr' else ('AI' in hello), hello)
    chips = await page.query_selector_all('#helpLog .hp-chips button')
    check(f'{tag}: 4 suggested questions', len(chips) == 4, len(chips))
    if SHOTS: await page.screenshot(path=os.path.join(SHOTS, f'help-{tag}-open.png'))

    n0 = len(ai_calls())
    await chips[0].click()
    await page.wait_for_function("() => { const m = [...document.querySelectorAll('#helpLog .hp-msg.bot')]; const l = m[m.length - 1]; return l && !l.classList.contains('wait') && m.length >= 2; }", timeout=15000)
    answer = (await page.query_selector_all('#helpLog .hp-msg.bot'))[-1]
    txt = await answer.inner_text()
    want = 'Exporter la vidéo' if lang == 'fr' else 'Export video'
    check(f'{tag}: answer shown, no Markdown left', want in txt and '**' not in txt, txt)
    calls = ai_calls()[n0:]
    check(f'{tag}: one call, in the page language', len(calls) == 1 and calls[0]['en'] == (lang == 'en'), calls)

    await page.fill('#helpIn', 'Et le son ?' if lang == 'fr' else 'And the sound?')
    await page.press('#helpIn', 'Enter')
    await page.wait_for_function("() => document.querySelectorAll('#helpLog .hp-msg.bot:not(.wait)').length >= 3", timeout=15000)
    calls = ai_calls()[n0:]
    check(f'{tag}: typed question sent with the conversation (3 turns)', len(calls) == 2 and calls[1]['turns'] == 3, calls)
    check(f'{tag}: send button enabled again', await page.is_enabled('#helpSend'))

    # the site's daily budget used up: a clear message, with how to reach the team
    help_max(0)
    await page.fill('#helpIn', 'Encore ?' if lang == 'fr' else 'Again?')
    await page.press('#helpIn', 'Enter')
    await page.wait_for_selector('#helpLog .hp-msg.bot.err', timeout=15000)
    err = await page.inner_text('#helpLog .hp-msg.bot.err')
    check(f'{tag}: busy message with the team email', ('pause' in err or 'break' in err) and 'contact@stalak.app' in err, err)
    help_max(1000)

    over = await page.evaluate('() => document.documentElement.scrollWidth - window.innerWidth')
    box = await page.eval_on_selector('#helpPanel', 'e => { const r = e.getBoundingClientRect(); return [r.left, r.right, window.innerWidth]; }')
    check(f'{tag}: no horizontal scroll, panel inside the screen', over <= 0 and box[0] >= 0 and box[1] <= box[2], (over, box))
    if SHOTS: await page.screenshot(path=os.path.join(SHOTS, f'help-{tag}-chat.png'))
    await page.keyboard.press('Escape')
    check(f'{tag}: Escape closes the window', await page.is_hidden('#helpPanel'))
    check(f'{tag}: no page error', not errors, errors)
    await ctx.close()


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        help_max(1000)
        for path, lang in (('/', 'fr'), ('/en/', 'en')):
            for w, h in ((390, 844), (1280, 800)):
                await run_one(browser, path, lang, w, h)
        # the claude.ai build (no account, no server): still loads, the help window still opens
        page = await browser.new_page()
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        await page.goto('file://' + os.path.abspath(CLAUDE_BUILD), wait_until='load')
        await page.wait_for_timeout(800)
        await page.click('#helpBtn', force=True)
        hello = await page.inner_text('#helpLog .hp-msg.bot')
        check('claude.ai build: loads, help opens, no AI notice of the site', hello and 'IA :' not in hello and 'AI:' not in hello, hello)
        check('claude.ai build: no page error', not errors, errors)
        await browser.close()
    failed = [r for r in results if not r[1]]
    print(f'\n{len(results) - len(failed)}/{len(results)} passed')
    sys.exit(1 if failed else 0)

asyncio.run(main())
