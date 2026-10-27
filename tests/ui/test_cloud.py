"""UI tests of the online saving (Stalak Pro), with Python Playwright (Chromium, headless).

Run (from a clean directory, never from one holding a file named like a stdlib module):
  1. build the site in a copy of the repo:     python3 <copy>/build_site.py  and  python3 <copy>/build.py <copy>/shuffle-lab.html
  2. start the test server:                    node tests/ui/cloud-server.mjs <copy>/public 8790
  3. run:  STALAK_BASE=http://localhost:8790 STALAK_MEDIA=<dir with song2.wav, takeC.mp4, takeD.mp4> \
           STALAK_CLAUDE_PAGE=<copy>/shuffle-lab.html STALAK_SHOTS=<dir> python3 /abs/path/tests/ui/test_cloud.py
The takes must be VP9 / Opus (headless Chromium cannot decode H.264).
"""
import asyncio, json, os, sys, time, traceback, wave, urllib.request, functools
from playwright.async_api import async_playwright

print = functools.partial(print, flush=True)
BASE = os.environ.get('STALAK_BASE', 'http://localhost:8790')
MEDIA = os.environ['STALAK_MEDIA']
CLAUDE_PAGE = os.environ.get('STALAK_CLAUDE_PAGE')
SHOTS = os.environ.get('STALAK_SHOTS', '/tmp/stalak-ui-shots')
os.makedirs(SHOTS, exist_ok=True)
SONG, TAKES = os.path.join(MEDIA, 'song2.wav'), [os.path.join(MEDIA, 'takeC.mp4'), os.path.join(MEDIA, 'takeD.mp4')]

def helper(path):
    with urllib.request.urlopen(BASE + path) as r: return json.loads(r.read() or b'{}')

def big_song():
    """song2.wav twice in a row: a song over 8 MB, sent in parts (R2 multipart)."""
    out = os.path.join(SHOTS, 'song_big.wav')
    if not os.path.exists(out):
        with wave.open(SONG) as w: params, data = w.getparams(), w.readframes(w.getnframes())
        with wave.open(out, 'wb') as o: o.setparams(params); o.writeframes(data + data)
    return out

SNAP = """() => { const S = window.__S, ti = t => S.takes.indexOf((t && t.view) || t), r = x => Math.round(x * 1e6) / 1e6;
  return { kind: S.kind, fmt: S.fmt, startBar: S.startBar, nBars: S.nBars, clipEnd: S.clipEnd, pace: S.pace, mode: S.mode, seed: S.seed,
    version: S.version, bestTake: S.bestTake, fxLevel: S.fxLevel, brollAmt: S.brollAmt, step: S.step, segStart: r(S.segStart), segEnd: r(S.segEnd),
    song: { name: S.song.name, demo: !!S.song.demo, bpm: S.song.bpm, down: S.song.down, beats: S.song.beats.map(r), size: S.song.file ? S.song.file.size : null },
    takes: S.takes.map(t => ({ name: t.name, kind: t.kind, broll: !!t.broll, offset: r(t.offset), status: t.status, excl: t.excl, mirror: !!t.mirror,
      size: t.file ? t.file.size : null, look: t.look || null })),
    cuts: S.cuts.map(c => [r(c.t0), r(c.t1), ti(c.take), !!c.locked]), locks: S.locks.map(c => [r(c.t0), r(c.t1), ti(c.take)]),
    fxUser: S.fxUser, fxAuto: S.fxAuto, lyrics: { mode: S.lyrics.mode, lines: S.lyrics.lines.map(l => [l.text, l.t == null ? null : r(l.t)]), style: S.lyrics.style } }; }"""

# each take can be shown (decoded by the page, its light copy, or unreadable here) and has its picture marks
READY = "() => window.__S.takes.map(t => [!!t.live, t.proxyState || null, !!t.unreadable, !!t.qual, t.duration > 0])"

class T:
    def __init__(self, p, name): self.p, self.name, self.errs = p, name, []
RUN = str(int(time.time()))
LAST = []   # the browsers opened by the running test (screenshot on failure, closed after)

async def sign_in(ctx, email, pro=True, lang='fr'):
    """the session cookie lands in the browser context (a navigation through the redirect would skip the page hook)"""
    email = email.replace('@', '-' + RUN + '@')   # the test server keeps its data between runs
    r = await ctx.request.get(f"{BASE}/__test/login?email={email}&pro={'1' if pro else '0'}&lang={lang}", max_redirects=0)
    assert r.status == 302, r.status

async def page_for(p, w=390, h=844, mobile=True, lang='fr', email=None, pro=True, url=None):
    b = await p.chromium.launch()
    kw = dict(viewport={'width': w, 'height': h}, locale='fr-FR' if lang == 'fr' else 'en-GB')
    if mobile: kw.update(is_mobile=True, has_touch=True, device_scale_factor=2)
    ctx = await b.new_context(**kw)
    # the « Merci ! » shown once to a new Pro account: already seen
    await ctx.add_init_script("{ const g = Storage.prototype.getItem; Storage.prototype.getItem = function (k) { return String(k).startsWith('stalak:proThanks:') ? '1' : g.call(this, k); }; }")
    pg = await ctx.new_page()
    t = T(pg, email); t.b = b; t.ctx = ctx; LAST.append(t)
    pg.on('pageerror', lambda e: t.errs.append('PAGEERR ' + str(e)))
    pg.on('console', lambda m: m.type == 'error' and 'Failed to load resource' not in m.text and t.errs.append('CONSOLE ' + m.text))
    async def hook(route):
        r = await route.fetch(); body = await r.text()
        await route.fulfill(response=r, body=body.replace('const S = {', 'const S = window.__S = {', 1))
    await pg.route(lambda u: u.startswith(BASE) and (u.rstrip('/') in (BASE, BASE + '/en') or '?' in u and u.split('?')[0].rstrip('/') in (BASE, BASE + '/en')), hook)
    home = '/en/' if lang == 'en' else '/'
    if email: await sign_in(ctx, email, pro, lang)
    await pg.goto(BASE + (url or home))
    await pg.wait_for_function("window.__S && document.querySelector('#acctBtn') && !document.querySelector('#acctBtn').hidden", timeout=20000)
    return t

async def shot(pg, name, full=False):
    path = os.path.join(SHOTS, name + '.png'); await pg.screenshot(path=path, full_page=full); return path

async def status(pg): return (await pg.text_content('#status') or '').strip()

async def load_demo(pg):
    await pg.click('#demoBtn')
    await pg.wait_for_function("window.__S.step === 4 && window.__S.cuts.length > 0", timeout=60000)

async def load_media(pg, song=SONG, takes=TAKES):
    await pg.set_input_files('#songFile', song)
    await pg.wait_for_function("document.querySelector('#songMeta').textContent.includes('BPM')", timeout=90000)
    await pg.click('#next1')
    await pg.set_input_files('#takeFiles', takes)
    await pg.wait_for_function(f"window.__S.takes.filter(t => !t.broll && t.status !== 'pending').length >= {len(takes)} && !document.querySelector('#next2').disabled", timeout=240000)
    await pg.wait_for_timeout(500)
    await pg.click('#next2'); await pg.click('#next3')
    await pg.wait_for_function("window.__S.step === 4 && window.__S.cuts.length > 0", timeout=30000)

async def settle(pg, timeout=150000):
    """the background work on the takes (picture analysis for « best take ») is over"""
    await pg.wait_for_function("window.__S.takes.filter(t => t.kind === 'video' && !t.broll).every(t => t.qual || t.unreadable) && !window.__S.qualDirty", timeout=timeout)
    await pg.wait_for_timeout(1500)

async def some_edits(pg, fmt='45'):
    """things that must come back: pace (new seed), format, a kept shot, an excluded passage, the text colour"""
    await pg.click('#paceSeg button[data-v="nerveux"]')
    await pg.click(f'#fmtSeg button[data-v="{fmt}"]')
    await pg.evaluate("""() => { const S = window.__S; S.lyrics.style.color = '#ffe14d'; S.takes.forEach((t, i) => { if (t.excl) t.excl.push([0.5 + i, 0.75 + i]); }); }""")
    cuts = pg.locator('#tl .cut')
    if await cuts.count() > 2:
        await cuts.nth(1).click()
        if await pg.is_visible('#cutLock'): await pg.click('#cutLock')

async def save(pg, name, expect_ok=True, timeout=180000):
    await pg.click('#cloudSaveBtn')
    await pg.wait_for_selector('#cloudDlg:not([hidden]) #clName', timeout=5000)
    default = await pg.input_value('#clName')
    await pg.fill('#clName', name)
    await pg.click('#clGo')
    if expect_ok:
        await pg.wait_for_selector('#cloudDlg #clDone:not([hidden])', timeout=timeout)
    else:
        await pg.wait_for_selector('#cloudDlg #clRetry:not([hidden])', timeout=timeout)
    return default

async def open_account(pg):
    await pg.click('#acctBtn')
    await pg.wait_for_selector('#apAccount:not([hidden])', timeout=10000)
    await pg.wait_for_function("document.querySelectorAll('#clList .cl-item').length > 0 || !document.querySelector('#clEmpty').hidden", timeout=10000)

async def open_project(pg, name, timeout=240000):
    item = pg.locator('#clList .cl-item', has_text=name)
    await item.locator('.cl-open').click()
    await pg.wait_for_function("window.__S.step === 4 && document.querySelector('#cloudDlg').hidden && document.querySelector('#acctPage').hidden && window.__S.cuts.length > 0", timeout=timeout)

def diff(a, b, path=''):
    if isinstance(a, dict) and isinstance(b, dict):
        out = []
        for k in set(a) | set(b): out += diff(a.get(k), b.get(k), f'{path}.{k}')
        return out
    if isinstance(a, list) and isinstance(b, list):
        if len(a) != len(b): return [f'{path}: length {len(a)} != {len(b)}']
        out = []
        for i, (x, y) in enumerate(zip(a, b)): out += diff(x, y, f'{path}[{i}]')
        return out
    if isinstance(a, float) and isinstance(b, float) and abs(a - b) < 1e-6: return []
    return [] if a == b else [f'{path}: {json.dumps(a)[:80]} != {json.dumps(b)[:80]}']

async def no_overflow(pg):
    sw, iw = await pg.evaluate("[document.documentElement.scrollWidth, window.innerWidth]")
    assert sw <= iw + 1, f'horizontal overflow {sw} > {iw}'

# ---------------------------------------------------------------------------------------------------------------
async def t_demo_fr_390(p):
    """Pro, FR, iPhone width: the example, edits, save, reload, « Mes projets » → open: everything restored"""
    t = await page_for(p, email='demo-fr@example.com')
    pg = t.p
    await load_demo(pg); await some_edits(pg)
    assert await pg.is_visible('#cloudSaveBtn'), 'save button visible'
    assert 'protag' not in (await pg.get_attribute('#cloudSaveBtn', 'class')), 'no PRO tag for Pro'
    before = await pg.evaluate(SNAP)
    await pg.click('#cloudSaveBtn')
    await pg.wait_for_selector('#cloudDlg:not([hidden])')
    default = await pg.input_value('#clName')
    assert default.startswith('Son de démo · '), default
    await no_overflow(pg); await shot(pg, 'fr390_save_name')
    await pg.fill('#clName', 'Démo glace'); await pg.click('#clGo')
    await pg.wait_for_selector('#cloudDlg #clDone:not([hidden])', timeout=60000)
    msg = await pg.text_content('#clMsg'); assert 'sauvegardé' in msg, msg
    await shot(pg, 'fr390_save_done')
    await pg.click('#clDone')
    assert 'Sauvegardé en ligne' in (await pg.text_content('#cloudSaveNote'))
    s = helper('/__test/stats'); assert s['projects'] >= 1
    await pg.reload(); await pg.wait_for_function("window.__S && !document.querySelector('#acctBtn').hidden")
    await open_account(pg)
    names = await pg.locator('#clList .cl-name').all_text_contents()
    assert 'Démo glace' in names, names
    q = await pg.text_content('#clQuotaT'); assert 'utilisés sur 20' in q, q
    await no_overflow(pg); await pg.locator('#apProjects').screenshot(path=os.path.join(SHOTS, 'fr390_account_projects.png'))
    await open_project(pg, 'Démo glace')
    after = await pg.evaluate(SNAP)
    d = diff(before, after); assert not d, 'restored state differs: ' + '; '.join(d[:8])
    st = await status(pg); assert 'est ouvert' in st, st
    await shot(pg, 'fr390_opened')
    return t

async def t_media_en_1280(p):
    """Pro, EN, desktop: song + 2 takes; save with a dropped connection (retry), re-save sends nothing again, reload, open"""
    t = await page_for(p, w=1280, h=860, mobile=False, lang='en', email='media-en@example.com')
    pg = t.p
    await load_media(pg); await settle(pg); await some_edits(pg, fmt='11')
    before = await pg.evaluate(SNAP)
    ready_before = await pg.evaluate(READY)
    assert before['song']['size'] and all(x['size'] for x in before['takes'])
    s0 = helper('/__test/stats')
    helper('/__test/fail?method=PUT&path=/files/&n=2')   # the first file upload fails twice (503)
    await pg.click('#cloudSaveBtn'); await pg.wait_for_selector('#cloudDlg:not([hidden])')
    assert (await pg.input_value('#clName')).startswith('song2 · ')
    hint = await pg.text_content('#clSizeT'); assert '3 file(s)' in hint, hint
    await pg.fill('#clName', 'My clip'); await pg.click('#clGo')
    seen_retry = False
    for _ in range(600):
        m = await pg.text_content('#clMsg') or ''
        if 'trying again' in m: seen_retry = True
        if await pg.is_visible('#clDone'): break
        await pg.wait_for_timeout(100)
    assert seen_retry, 'retry message shown'
    assert 'saved online' in (await pg.text_content('#clMsg'))
    rows = await pg.locator('#clFiles li').all_text_contents()
    assert len(rows) == 3 and all('sent' in r for r in rows), rows
    await shot(pg, 'en1280_saved')
    await pg.click('#clDone')
    s1 = helper('/__test/stats'); assert s1['objects'] - s0['objects'] == 3, s1
    puts = s1['requests'].get('PUT /api/projects/:p/files/:f', 0)
    # saved again (same project): nothing is uploaded twice
    await pg.click('#cloudSaveBtn'); await pg.wait_for_selector('#cloudDlg:not([hidden])')
    assert await pg.input_value('#clName') == 'My clip'
    await pg.click('#clGo'); await pg.wait_for_selector('#cloudDlg #clDone:not([hidden])', timeout=60000)
    rows = await pg.locator('#clFiles li').all_text_contents()
    assert all('already online' in r for r in rows), rows
    s2 = helper('/__test/stats'); assert s2['requests'].get('PUT /api/projects/:p/files/:f', 0) == puts, 'no new upload'
    assert s2['objects'] == s1['objects'] and s2['projects'] == s1['projects']
    await pg.click('#clDone')
    # a fresh browser (another device), same account
    await t.b.close()
    t2 = await page_for(p, w=1280, h=860, mobile=False, lang='en', email='media-en@example.com')
    pg = t2.p
    await open_account(pg)
    meta = await pg.locator('#clList .cl-item', has_text='My clip').locator('.cl-meta').text_content()
    assert 'MB' in meta, meta
    await pg.locator('#apProjects').screenshot(path=os.path.join(SHOTS, 'en1280_account.png'))
    item = pg.locator('#clList .cl-item', has_text='My clip')
    await item.locator('.cl-open').click()
    await pg.wait_for_selector('#cloudDlg:not([hidden]) #clFiles li')
    await shot(pg, 'en1280_opening')
    await pg.wait_for_function("window.__S.step === 4 && document.querySelector('#cloudDlg').hidden && window.__S.cuts.length > 0", timeout=240000)
    after = await pg.evaluate(SNAP)
    d = diff(before, after); assert not d, 'restored state differs: ' + '; '.join(d[:8])
    assert 'is open' in await status(pg)
    # the background analysis of the opened takes does not change the edit afterwards
    await settle(pg)
    ready = await pg.evaluate(READY)
    assert ready == ready_before, f'takes readable as before: {ready} vs {ready_before}'
    later = await pg.evaluate(SNAP)
    d = diff(before, later); assert not d, 'edit changed after opening: ' + '; '.join(d[:8])
    await shot(pg, 'en1280_opened')
    t2.errs = t.errs + t2.errs
    return t2

async def t_multipart_account(p):
    """a song over 8 MB saved from « Mes projets » (sent in parts), then renamed and deleted"""
    t = await page_for(p, w=1280, h=860, mobile=False, email='big@example.com')
    pg = t.p
    await pg.set_input_files('#songFile', big_song())
    await pg.wait_for_function("document.querySelector('#songMeta').textContent.includes('BPM')", timeout=90000)
    await open_account(pg)
    assert await pg.is_visible('#clSaveHere')
    s0 = helper('/__test/stats')
    await pg.click('#clSaveHere'); await pg.wait_for_selector('#cloudDlg:not([hidden])')
    await pg.fill('#clName', 'Gros son'); await pg.click('#clGo')
    await pg.wait_for_selector('#cloudDlg #clDone:not([hidden])', timeout=120000)
    await pg.click('#clDone')
    s1 = helper('/__test/stats')
    assert s1['requests'].get('PUT /api/projects/:p/files/:f/parts/:n', 0) - s0['requests'].get('PUT /api/projects/:p/files/:f/parts/:n', 0) == 2, s1['requests']
    assert s1['uploads'] == 0
    await pg.wait_for_function("[...document.querySelectorAll('#clList .cl-name')].some(e => e.textContent === 'Gros son')")
    # rename
    item = pg.locator('#clList .cl-item', has_text='Gros son')
    await item.locator('.cl-ren-btn').click()
    await pg.fill('#clList .cl-ren input', 'Son XXL'); await pg.keyboard.press('Enter')
    await pg.wait_for_function("[...document.querySelectorAll('#clList .cl-name')].some(e => e.textContent === 'Son XXL')")
    # delete: asked first; « Annuler » keeps it
    item = pg.locator('#clList .cl-item', has_text='Son XXL')
    await item.locator('.cl-del').click(); await pg.wait_for_selector('#homeAsk:not([hidden])')
    assert 'Supprimer « Son XXL » ?' == (await pg.text_content('#homeAskT')).strip()
    await pg.click('#homeNo')
    assert await pg.locator('#clList .cl-item', has_text='Son XXL').count() == 1
    await item.locator('.cl-del').click(); await pg.wait_for_selector('#homeAsk:not([hidden])'); await pg.click('#homeYes')
    await pg.wait_for_function("![...document.querySelectorAll('#clList .cl-name')].some(e => e.textContent === 'Son XXL')")
    s2 = helper('/__test/stats'); assert s2['objects'] == s1['objects'] - 1, (s1, s2)
    assert not await pg.locator('#clEmpty').is_hidden()
    return t

async def t_quota(p):
    t = await page_for(p, w=390, mobile=True, lang='en', email='quota@example.com')
    pg = t.p
    helper('/__test/quota?bytes=3000000')
    try:
        await load_media(pg)
        await save(pg, 'Too big', expect_ok=False)
        m = await pg.text_content('#clMsg'); assert 'storage is full' in m and 'of 2.9' in m, m
        await shot(pg, 'en390_quota')
        await no_overflow(pg)
        await pg.click('#clDone')
    finally:
        helper('/__test/quota')
    return t

async def t_gating(p):
    """not Pro: the button carries PRO and leads to the Stalak Pro page; signed out too"""
    t = await page_for(p, email='free@example.com', pro=False)
    pg = t.p
    await load_demo(pg)
    assert await pg.is_visible('#cloudSaveBtn')
    assert 'protag' in await pg.get_attribute('#cloudSaveBtn', 'class')
    await pg.click('#cloudSaveBtn')
    await pg.wait_for_selector('#apPro:not([hidden])')
    why = await pg.text_content('#apProWhy'); assert 'sauvegarde en ligne fait partie de Stalak Pro' in why, why
    assert await pg.is_hidden('#cloudDlg')
    await shot(pg, 'fr390_gating_pro')
    await t.b.close()
    t2 = await page_for(p)   # signed out
    pg = t2.p
    await load_demo(pg)
    assert 'protag' in await pg.get_attribute('#cloudSaveBtn', 'class')
    await pg.click('#cloudSaveBtn')
    await pg.wait_for_selector('#acctPage:not([hidden])')
    assert await pg.is_visible('#apPro') or await pg.is_visible('#apLogin')
    t2.errs = t.errs + t2.errs
    return t2

async def t_clip_downgrade(p):
    """a clip saved while Pro, opened after Pro ended: opens as a TikTok / Reels (Pro gating at load time)"""
    t = await page_for(p, w=1280, mobile=False, email='ex-pro@example.com')
    pg = t.p
    await pg.click('#kindSeg button[data-v="clip"]')
    await load_demo(pg)
    assert await pg.evaluate("window.__S.kind") == 'clip'
    await save(pg, 'Mon clip'); await pg.click('#clDone')
    await sign_in(t.ctx, 'ex-pro@example.com', pro=False)
    await pg.goto(BASE + '/')
    await pg.wait_for_function("window.__S && !document.querySelector('#acctBtn').hidden")
    await open_account(pg)
    assert 'protag' in await pg.get_attribute('#clSaveHere', 'class') or await pg.is_hidden('#clSaveHere')
    await open_project(pg, 'Mon clip', timeout=60000)
    assert await pg.evaluate("window.__S.kind") == 'reel'
    st = await status(pg); assert 'mode Clip fait partie de Stalak Pro' in st, st
    return t

async def t_no_r2(p):
    """R2 not configured: no save button, « Mes projets » says « bientôt », nothing fails"""
    helper('/__test/r2?on=0')
    try:
        t = await page_for(p, email='nor2@example.com')
        pg = t.p
        await load_demo(pg)
        await pg.wait_for_timeout(500)
        assert await pg.is_hidden('#cloudRow'), 'save button hidden'
        await pg.click('#acctBtn'); await pg.wait_for_selector('#apAccount:not([hidden])')
        await pg.wait_for_selector('#clSoon:not([hidden])')
        assert 'bientôt' in await pg.text_content('#apProjects h3')
        assert await pg.is_visible('#clSoonP') and await pg.is_hidden('#clActions') and await pg.is_hidden('#clQuota')
        await pg.locator('#apProjects').screenshot(path=os.path.join(SHOTS, 'fr390_no_r2.png'))
        await no_overflow(pg)
        # in English
        await pg.click('#apAccount .langsw button[data-lang="en"]')
        h = await pg.text_content('#apProjects h3'); assert 'My projects' in h and 'soon' in h, h
    finally:
        helper('/__test/r2?on=1')
    return t

async def t_claude_page(p):
    """the claude.ai page (no account.js): loads, the example works, nothing of the online saving shows"""
    b = await p.chromium.launch(); ctx = await b.new_context(viewport={'width': 390, 'height': 844})
    pg = await ctx.new_page(); t = T(pg, 'claude'); t.b = b; LAST.append(t)
    pg.on('pageerror', lambda e: t.errs.append('PAGEERR ' + str(e)))
    pg.on('console', lambda m: m.type == 'error' and 'Failed to load resource' not in m.text and 'net::' not in m.text and t.errs.append('CONSOLE ' + m.text))
    vendor = os.path.join(os.path.dirname(CLAUDE_PAGE), 'public', 'vendor')
    async def ext(route):
        u = route.request.url
        if 'mp4-muxer' in u: await route.fulfill(path=os.path.join(vendor, 'mp4-muxer.min.js'), content_type='text/javascript')
        elif 'mp4box' in u: await route.fulfill(path=os.path.join(vendor, 'mp4box.all.min.js'), content_type='text/javascript')
        else: await route.abort()
    await pg.route(lambda u: not u.startswith('file:'), ext)
    html = open(CLAUDE_PAGE, encoding='utf-8').read().replace('const S = {', 'const S = window.__S = {', 1)
    hooked = os.path.join(SHOTS, 'claude_hook.html'); open(hooked, 'w', encoding='utf-8').write(html)
    await pg.goto('file://' + hooked)
    await pg.wait_for_function('window.__S', timeout=20000)
    await load_demo(pg)
    assert await pg.is_hidden('#cloudRow') and await pg.is_hidden('#cloudDlg') and await pg.is_hidden('#acctBtn')
    assert await pg.evaluate('typeof window.StalakAccount') == 'undefined'
    await shot(pg, 'claude_page')
    return t

TESTS = [t_demo_fr_390, t_media_en_1280, t_multipart_account, t_quota, t_gating, t_clip_downgrade, t_no_r2, t_claude_page]

async def main():
    only = sys.argv[1:]
    results = []
    async with async_playwright() as p:
        for fn in TESTS:
            if only and fn.__name__ not in only: continue
            t0 = time.time(); t = None
            try:
                t = await fn(p)
                errs = t.errs if t else []
                results.append((fn.__name__, 'PASS' if not errs else 'FAIL', '; '.join(errs)[:400], time.time() - t0))
            except Exception as e:
                results.append((fn.__name__, 'FAIL', (str(e) or repr(e))[:500], time.time() - t0))
                traceback.print_exc()
                if LAST:
                    try:
                        await shot(LAST[-1].p, 'FAIL_' + fn.__name__, full=True)
                        print('   console/page errors:', LAST[-1].errs[:5], ' status:', await status(LAST[-1].p), ' dialog:', await LAST[-1].p.text_content('#clMsg'))
                    except Exception: pass
            finally:
                for x in LAST:
                    try: await x.b.close()
                    except Exception: pass
                LAST.clear()
            print(f'{results[-1][1]:4}  {fn.__name__}  ({results[-1][3]:.0f} s)  {results[-1][2]}')
    failed = [r for r in results if r[1] != 'PASS']
    print(f'\n{len(results) - len(failed)}/{len(results)} passed')
    sys.exit(1 if failed else 0)

asyncio.run(main())
