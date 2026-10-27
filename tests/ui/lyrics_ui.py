"""UI test of « Paroles automatiques » (Stalak Pro), Python Playwright (chromium).

    python3 /abs/path/tests/ui/lyrics_ui.py <base url of tests/ui/server.mjs> <path of the claude.ai build shuffle-lab.html>

Build a copy of the site first (python3 build_site.py in a copy of the repo, python3 build.py <copy>/shuffle-lab.html),
then run node tests/ui/server.mjs <copy>/public <port>: the real Functions on node:sqlite with a fake Workers AI.
Run this file by absolute path from a clean directory (no file named like a stdlib module next to it)."""
import asyncio, base64, json, os, sys, urllib.request
from playwright.async_api import async_playwright

BASE, CLAUDE_BUILD = sys.argv[1].rstrip('/'), sys.argv[2]
SHOTS = os.environ.get('STALAK_UI_SHOTS')   # a folder for screenshots (optional)
results = []


async def shot(target, name):
    if SHOTS: await target.screenshot(path=os.path.join(SHOTS, name + '.png'))


def check(name, ok, info=''):
    results.append((name, bool(ok), info))
    print(('PASS ' if ok else 'FAIL ') + name + (('  — ' + str(info)) if info and not ok else ''))


def post(path, body):
    req = urllib.request.Request(BASE + path, data=json.dumps(body).encode(), headers={'Content-Type': 'application/json'}, method='POST')
    return json.load(urllib.request.urlopen(req))


# the app lives in a closure: the pages are served with a test probe, __ev(code), that evaluates code inside it
async def ev(page, src):
    return await page.evaluate('s => __ev("(" + s + ")()")', src)


async def wait(page, src, timeout=30000):
    return await page.wait_for_function('s => window.__ev && __ev("(" + s + ")()")', arg=src, timeout=timeout)


def ai_calls():
    return json.load(urllib.request.urlopen(BASE + '/__test/ai'))


async def new_page(browser, width, lang, user=None):
    ctx = await browser.new_context(viewport={'width': width, 'height': 860 if width < 500 else 900}, locale='fr-FR' if lang == 'fr' else 'en-US')
    if user:
        await ctx.add_cookies([{'name': 'stalak_s', 'value': user['token'], 'domain': 'localhost', 'path': '/', 'httpOnly': True, 'secure': False, 'sameSite': 'Lax'}])
        # the « Merci ! » slides of a new Pro member were already seen
        await ctx.add_init_script("try { localStorage.setItem('stalak:proThanks:%s', '1'); } catch (e) {}" % user['id'])
    page = await ctx.new_page()
    errors = []
    page.on('pageerror', lambda e: errors.append('pageerror: ' + str(e)))
    # (« Failed to load resource »: the HTTP errors mocked on purpose, and the claude.ai page's CDN fonts with no network here)
    page.on('console', lambda m: errors.append('console: ' + m.text) if m.type == 'error' and 'Failed to load resource' not in m.text else None)
    return ctx, page, errors


async def demo_to_lyrics(page):
    await page.click('#demoBtn')
    await wait(page, '() => S.song && S.song.demo && S.step === 4', timeout=30000)
    await page.click('#stepper button[data-go="3"]')
    await wait(page, '() => S.step === 3')


async def pro_flow(browser, width, lang):
    tag = f'pro {lang} {width}'
    user = post('/__test/user', {'pro': True})
    ctx, page, errors = await new_page(browser, width, lang, user)
    await page.goto(BASE + ('/en/' if lang == 'en' else '/') + '?lang=' + lang)
    await wait(page, '() => window.StalakAccount && StalakAccount.state.entitlements && StalakAccount.state.entitlements.plan === "pro"', timeout=15000)
    await demo_to_lyrics(page)
    auto = page.locator('#lyrMode button[data-mode="auto"]')
    check(f'{tag}: button has no « soon » and no PRO tag', (await auto.inner_text()).strip() in ('Transcription auto', 'Auto transcription') and not await auto.evaluate('b => b.classList.contains("protag")'), await auto.inner_text())
    await auto.click()
    check(f'{tag}: auto panel shown, Pro page not opened', await page.locator('#lyTr').is_visible() and not await page.locator('#acctPage').is_visible())
    go = page.locator('#lyTrGo')
    n0 = len(ai_calls())
    await page.locator('#lyTrLang button[data-v="%s"]' % lang).click()
    await go.click()
    st = await page.locator('#status').inner_text()
    await wait(page, '() => !trBusy && S.lyrics.lines.length && S.lyrics.lines.every(l => l.tr)', timeout=30000)
    calls = ai_calls()[n0:]
    check(f'{tag}: compact WAV pieces sent (mono 16 kHz, ≤ 31 s, language hint, no voice filter)', calls and all(c['wav'] == 'RIFFWAVE' and c['rate'] == 16000 and c['channels'] == 1 and c['seconds'] <= 31 and c['language'] == lang and c['vad'] is False for c in calls), calls)
    info = await ev(page, '''() => ({ n: S.lyrics.lines.length, mode: S.lyrics.mode, lines: S.lyrics.lines.map(l => ({ text: l.text, t: l.t, wo: l.wo })),
        tl: timedLines().map(l => ({ t: l.t, wt: l.wt.length, words: l.words.length })), state: lyricsState(), seg: [S.segStart, S.segEnd] })''')
    check(f'{tag}: lines appear timed, word times kept (karaoke / word by word)', info['n'] > 0 and all(l['t'] is not None and l['wo'] and len(l['wo']) == len(l['text'].split()) for l in info['lines'])
          and all(x['wt'] == x['words'] for x in info['tl']) and not info['state']['warn'], info)
    check(f'{tag}: silence hallucination dropped', not any('Amara' in l['text'] for l in info['lines']))
    check(f'{tag}: lines inside the passage', all(info['seg'][0] - 1.01 <= l['t'] <= info['seg'][1] + 1 for l in info['lines']), info['seg'])
    check(f'{tag}: lines editable with note and nudges', await page.locator('#lyEdit').is_visible() and await page.locator('#trNote').is_visible()
          and await page.locator('#lyLines li').count() == info['n'])
    await shot(page.locator('.card:has(#lyrMode)'), f'lyrics_{lang}_{width}')
    done = await page.locator('#status').inner_text()
    check(f'{tag}: friendly status', ('phrase' in done if lang == 'fr' else 'line' in done) and (await go.inner_text()) in ('Les réécrire', 'Write them again'), done)
    # edit a word: the line keeps its time, the model follows
    inp = page.locator('#ly0')
    await inp.fill('Bonjour la neige ' + ' '.join(info['lines'][0]['text'].split()[3:]))
    t_after = await ev(page, '() => [S.lyrics.lines[0].text, S.lyrics.lines[0].t, timedLines()[0].text]')
    check(f'{tag}: text editable afterwards', t_after[0].startswith('Bonjour la neige') and t_after[1] == info['lines'][0]['t'] and t_after[2] == t_after[0], t_after)
    # nudge
    await page.locator('#lyLines li').first.locator('.nudge button').last.click()
    t2 = await ev(page, '() => S.lyrics.lines[0].t')
    check(f'{tag}: timing nudge works', abs(t2 - info['lines'][0]['t'] - 0.05) < 1e-6, t2)
    # karaoke draws the words being sung (canvas not blank in the line area)
    await page.locator('#stAnim button[data-v="kara"]').click()
    kara = await ev(page, '''() => { const l = timedLines()[0]; const c = document.createElement('canvas'); c.width = W * RES; c.height = H * RES; const x = c.getContext('2d');
        x.setTransform(RES,0,0,RES,0,0); drawLyrics(x, l.wt[1] + 0.05); const d = x.getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) n++; return { anim: S.lyrics.style.anim, px: n }; }''')
    check(f'{tag}: karaoke renders the transcribed line', kara['anim'] == 'kara' and kara['px'] > 500, kara)
    # whole song → several pieces, merged in order
    n1 = len(ai_calls())
    await ev(page, '() => { S.segStart = 0; S.segEnd = S.song.duration; }')
    await go.click()
    await wait(page, '() => !trBusy', timeout=30000)
    calls = ai_calls()[n1:]
    dur = await ev(page, '() => S.song.duration')
    ts = await ev(page, '() => S.lyrics.lines.map(l => l.t)')
    expect = max(1, -(-int(dur + 1) // 30))
    check(f'{tag}: long passage cut into pieces ≤ 30 s and merged in order ({dur:.1f} s)', len(calls) >= expect and ts == sorted(ts) and ts[-1] > 30 and all(c['seconds'] <= 30.05 for c in calls),
          {'calls': [c['seconds'] for c in calls], 'last': ts[-1:]})
    # pieces one after the other, each with the end of the previous piece's words as context after the song prompt
    song_p = 'Paroles de chanson.' if lang == 'fr' else 'Song lyrics.'
    check(f'{tag}: pieces sent one after the other', len(calls) >= 2 and all(calls[i]['t0'] >= calls[i - 1]['t1'] for i in range(1, len(calls))),
          [(c['t0'], c['t1']) for c in calls])
    check(f'{tag}: first piece with the song prompt alone, the next ones with the previous words as context', calls[0]['prompt'] == song_p
          and all(c['prompt'].startswith(song_p + ' ') and 4 < len(c['prompt']) - len(song_p) <= 201 for c in calls[1:]) and not any(c['conditioned'] for c in calls),
          [c['prompt'] for c in calls])
    texts = await ev(page, '() => S.lyrics.lines.map(l => l.text)')
    log = await ev(page, '() => DIAG.join("\\n")')
    check(f'{tag}: line repeated at a cut removed (merge)', 'en double aux coupures retirés' in log and all(texts[i] != texts[i - 1] for i in range(1, len(texts))), texts)
    check(f'{tag}: voice brought forward, level evened, no clipping', 'voix mise en avant en' in log and all(c['peak'] <= 0.905 and c['rms'] > 0.02 for c in calls),
          [(round(c['rms'], 3), round(c['peak'], 3)) for c in calls] + [l for l in log.split('\n') if 'mise en avant' in l][-1:])
    await vox_flow(page, tag, lang, go)
    # friendly errors
    for status, body, key in [(429, {'error': 'quota_exceeded'}, ('limite du jour', 'limit')), (413, {'error': 'too_long'}, ('trop long', 'too long')),
                              (503, {'error': 'ai_unavailable'}, ('pas disponibles', 'available')), (None, None, ('connexion', 'connection'))]:
        def make(status, body):
            async def handler(route):
                if status is None: await route.abort()
                else: await route.fulfill(status=status, content_type='application/json', body=json.dumps(body))
            return handler
        handler = make(status, body)
        await page.route('**/api/lyrics/transcribe', handler)
        await go.click()
        await wait(page, '() => !trBusy', timeout=15000)
        msg = await page.locator('#status').inner_text()
        check(f'{tag}: error {status or "network"} → friendly message', key[0 if lang == 'fr' else 1] in msg and len(await ev(page, '() => S.lyrics.lines')) > 0, msg)
        await page.unroute('**/api/lyrics/transcribe')
    # export path untouched
    await page.click('#stepper button[data-go="4"]')
    check(f'{tag}: export button ready', await page.locator('#exportBtn').is_visible() and await page.locator('#exportBtn').is_enabled())
    await shot(page, f'pro_{lang}_{width}')
    check(f'{tag}: no console errors', not errors, errors)
    await ctx.close()


async def vox_flow(page, tag, lang, go):
    """« voix seule »: the vocals alone of the song, used for the transcription only"""
    pick = page.locator('#lyVoxPick')
    want = 'Tu as la voix seule (a cappella) ?' if lang == 'fr' else 'Got the vocals alone (a cappella)?'
    check(f'{tag}: « voix seule » link shown under the button', await pick.is_visible() and want in await pick.inner_text(), await pick.inner_text())
    # a « vocals » file made from the song itself: it starts 4 s in and stops 3 s before the end (length differs by 7 s)
    mk = '''(o) => { const b = S.song.buffer, sr = b.sampleRate, d = b.getChannelData(0), i0 = Math.round(o.from * sr), i1 = b.length - Math.round(o.cut * sr), n = i1 - i0;
        const buf = new ArrayBuffer(44 + n * 2), v = new DataView(buf), w = (p, s) => { for (let i = 0; i < s.length; i++) v.setUint8(p + i, s.charCodeAt(i)); };
        w(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); w(8, 'WAVEfmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
        v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, n * 2, true);
        for (let i = 0; i < n; i++) v.setInt16(44 + i * 2, Math.max(-1, Math.min(1, d[i0 + i])) * 32767, true);
        const u = new Uint8Array(buf); let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); }'''
    async def wav(frm, cut):
        return base64.b64decode(await page.evaluate('o => __ev("(" + o.src + ")")(o)', {'src': mk, 'from': frm, 'cut': cut}))
    await page.set_input_files('#lyVoxFile', files=[{'name': 'voix-seule.wav', 'mimeType': 'audio/wav', 'buffer': await wav(4, 3)}])
    await wait(page, '() => S.song.vox && /voix-seule/.test(S.song.vox.name)', timeout=20000)
    vox = await ev(page, '() => ({ off: S.song.vox.offset, sure: S.song.vox.sure })')
    msg = await page.locator('#status').inner_text()
    check(f'{tag}: vocals 4 s in: offset found, user told', abs(vox['off'] - 4) < 0.06 and vox['sure'] and ('décalée de +4,0 s' in msg if lang == 'fr' else '+4.0 s off' in msg), [vox, msg, [l for l in (await ev(page, '() => DIAG.join("\\n")')).split('\n') if 'voix seule' in l][-1:]])
    check(f'{tag}: vocals shown with « Retirer », link hidden', await page.locator('#lyVoxOn').is_visible() and 'voix-seule.wav' in await page.locator('#lyVoxOn').inner_text()
          and not await pick.is_visible())
    n0 = len(ai_calls())
    await go.click()
    await wait(page, '() => !trBusy', timeout=30000)
    log = await ev(page, '() => DIAG.join("\\n")')
    check(f'{tag}: transcription made from the vocals', 'voix seule importée, décalage ' in log and len(ai_calls()) > n0 and await ev(page, '() => S.lyrics.lines.length > 0 && S.lyrics.lines.every(l => l.t != null)'),
          [l for l in log.split('\n') if 'voix' in l][-2:])
    await page.locator('#lyVoxDel').click()
    check(f'{tag}: vocals removed', await ev(page, '() => !S.song.vox') and await pick.is_visible() and ('retirée' in await page.locator('#status').inner_text() or 'removed' in await page.locator('#status').inner_text()))
    # same length: taken as starting with the song, no search
    await page.set_input_files('#lyVoxFile', files=[{'name': 'acapella.wav', 'mimeType': 'audio/wav', 'buffer': await wav(0, 0.5)}])
    await wait(page, '() => S.song.vox && S.song.vox.name === "acapella.wav"', timeout=20000)
    msg = await page.locator('#status').inner_text()
    check(f'{tag}: vocals of the same length: offset 0, ready', await ev(page, '() => S.song.vox.offset === 0 && S.song.vox.sure') and ('prête' in msg or 'ready' in msg), msg)
    # not audio: friendly message, nothing kept from it
    await page.locator('#lyVoxDel').click()
    await page.set_input_files('#lyVoxFile', files=[{'name': 'pas-du-son.mp3', 'mimeType': 'audio/mpeg', 'buffer': b'not audio at all' * 50}])
    await page.wait_for_function('() => /lire ce fichier|can.t read this file/.test(document.querySelector("#status").textContent)', timeout=20000)
    check(f'{tag}: unreadable vocals file → friendly message', await ev(page, '() => !S.song.vox'))


async def free_flow(browser, width, lang, signed_in=True):
    tag = f'{"free" if signed_in else "signed-out"} {lang} {width}'
    user = post('/__test/user', {'pro': False}) if signed_in else None
    ctx, page, errors = await new_page(browser, width, lang, user)
    await page.goto(BASE + ('/en/' if lang == 'en' else '/') + '?lang=' + lang)
    await wait(page, '() => window.StalakAccount && StalakAccount.state.entitlements', timeout=15000)
    await demo_to_lyrics(page)
    auto = page.locator('#lyrMode button[data-mode="auto"]')
    check(f'{tag}: PRO tag on « Transcription auto »', await auto.evaluate('b => b.classList.contains("protag")'))
    n0 = len(ai_calls())
    await auto.click()
    await page.wait_for_selector('#acctPage', state='visible', timeout=5000)
    txt = await page.locator('#acctPage').inner_text()
    why = {'fr': 'Les paroles automatiques font partie de Stalak Pro', 'en': 'Automatic lyrics are part of Stalak Pro'}[lang]
    check(f'{tag}: opens the Pro page with the « why »', why in txt, txt[:300])
    check(f'{tag}: lyrics mode unchanged, nothing sent', await ev(page, '() => S.lyrics.mode') == 'paste' and len(ai_calls()) == n0)
    perks = await ev(page, '''() => [...document.querySelectorAll('[data-i18n="pr.f.auto"],[data-i18n="acct.perk4"],[data-i18n="pt.s4t"]')].map(e => e.innerHTML)''')
    check(f'{tag}: automatic lyrics no longer marked soon', perks and not any('soon' in p for p in perks), perks)
    await shot(page, f'{"free" if signed_in else "out"}_{lang}_{width}')
    check(f'{tag}: no console errors', not errors, errors)
    await ctx.close()


async def claude_build(browser, width, lang):
    tag = f'claude.ai build {lang} {width}'
    ctx, page, errors = await new_page(browser, width, lang)
    probe = CLAUDE_BUILD.replace('.html', '.probe.html')
    with open(CLAUDE_BUILD, encoding='utf-8') as f: html = f.read()
    assert 'applyLang();\n})();' in html
    with open(probe, 'w', encoding='utf-8') as f: f.write(html.replace('applyLang();\n})();', 'applyLang();\nwindow.__ev = (s) => eval(s);\n})();'))
    await page.goto('file://' + probe + '?lang=' + lang)
    await wait(page, '() => typeof S === "object"')
    check(f'{tag}: no account script', await ev(page, '() => !window.StalakAccount'))
    await demo_to_lyrics(page)
    auto = page.locator('#lyrMode button[data-mode="auto"]')
    check(f'{tag}: no PRO tag, no « soon »', not await auto.evaluate('b => b.classList.contains("protag")') and 'soon' not in (await auto.inner_html()))
    await auto.click()
    check(f'{tag}: shown as unavailable here, with « Coller mes paroles »', await page.locator('#lyTrNA').is_visible() and not await page.locator('#lyTr').is_visible()
          and 'stalak.app' in await page.locator('#lyTrNA').inner_text())
    check(f'{tag}: no « voix seule » link here (no server)', not await page.locator('#lyVoxPick').is_visible())
    await page.click('#autoToPaste')
    check(f'{tag}: back to paste mode, demo lyrics still timed', await ev(page, '() => S.lyrics.mode === "paste" && timedLines().length > 0'))
    check(f'{tag}: no errors', not errors, errors)
    await ctx.close()


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        await pro_flow(browser, 390, 'fr')
        await pro_flow(browser, 1280, 'en')
        await free_flow(browser, 1280, 'en')
        await free_flow(browser, 390, 'fr')
        await free_flow(browser, 390, 'fr', signed_in=False)
        await claude_build(browser, 390, 'fr')
        await claude_build(browser, 1280, 'en')
        await browser.close()
    bad = [r for r in results if not r[1]]
    print(f'\n{len(results) - len(bad)}/{len(results)} checks passed')
    sys.exit(1 if bad else 0)

asyncio.run(main())
