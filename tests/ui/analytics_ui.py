"""UI test of the dashboard page « Clarity et Google Analytics » and its 2 tiles on Accueil (Comptes, 24/11), Playwright.

    python3 /abs/path/tests/ui/analytics_ui.py <base url of tests/ui/server.mjs> [screenshots dir]

Run node tests/ui/server.mjs <repo>/public <port> first. Two cases:
- the demo (/admin-demo/, made-up answers of GA4 and Clarity, built by tools/admin_demo_data.mjs): live, the funnel with the
  biggest loss in red, sources / countries / devices / languages / pages, the reminder about cookies with the share, the
  Clarity snapshot, the friction signals by page with « Voir les enregistrements » (Clarity, new tab), the 2 tiles of Accueil;
- the real page with no secret (the test server has none): the steps to link GA4 and Clarity, no error.
On a computer (1280) and a phone (390): no horizontal scroll, no page error (strict CSP), every « ? » opens its explanation."""
import asyncio, os, sys
from playwright.async_api import async_playwright

BASE = sys.argv[1].rstrip('/')
SHOTS = sys.argv[2] if len(sys.argv) > 2 else None
results = []


def check(name, ok, info=''):
    results.append((name, bool(ok), info))
    print(('PASS ' if ok else 'FAIL ') + name + (('  — ' + str(info)[:300]) if info and not ok else ''))


async def go(page, name):
    await page.click('#menuBtn')
    await page.wait_for_selector('#drawer.open #tab-' + name, state='visible', timeout=5000)
    await page.click('#tab-' + name)
    await page.wait_for_selector('#p-' + name, state='visible', timeout=5000)


async def run(browser, width, demo):
    tag = ('démo' if demo else 'vrai tableau sans secret') + ' · ' + ('ordinateur' if width > 500 else 'téléphone')
    ctx = await browser.new_context(locale='fr-FR', viewport={'width': width, 'height': 900}, is_mobile=width < 500, has_touch=width < 500)
    page = await ctx.new_page(); errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('console', lambda m: errors.append(m.text) if m.type == 'error' and 'favicon' not in m.text else None)
    await page.goto(BASE + ('/admin-demo/' if demo else '/__test/admin-login'), wait_until='load')
    await page.wait_for_timeout(900)
    # Accueil: the 2 tiles
    live_v = (await page.inner_text('#hLiveV')).strip(); fric = (await page.inner_text('#hFricV')).strip()
    if demo:
        check(tag + ' : tuile « Sur le site en ce moment » = 8', live_v == '8', live_v)
        check(tag + ' : tuile Clarity = le plus gros souci', fric.startswith('Clics morts : ') and '/' in fric, fric)
    else:
        check(tag + ' : tuiles sans secret : « pas encore relié »', live_v == '–' and 'pas encore relié' in fric and 'pas encore relié' in await page.inner_text('#hLiveS'), (live_v, fric))
    if SHOTS: await page.screenshot(path=os.path.join(SHOTS, 'analytics-accueil-%s-%d.png' % ('demo' if demo else 'off', width)), full_page=True)
    await go(page, 'analytics'); await page.wait_for_timeout(700)
    check(tag + ' : titre de la page', (await page.inner_text('#whereTxt')) == 'Clarity et Google Analytics')
    note = await page.inner_text('#aNote')
    check(tag + ' : rappel « seulement les visiteurs qui ont accepté les cookies »', 'accepté les cookies' in note, note)
    if demo:
        check(tag + ' : la part estimée par rapport à notre compteur', 'environ' in note and '% des visites ces 7 jours' in note, note)
        rows = await page.eval_on_selector_all('#aFunnel .fstep', 'els => els.map(e => ({ t: e.innerText, a: e.getAttribute("aria-label"), worst: e.classList.contains("worst"), col: getComputedStyle(e.querySelector(".tr i")).backgroundColor }))')
        check(tag + ' : entonnoir de 10 étapes, dans l’ordre', len(rows) == 10 and rows[0]['t'].startswith('Arrivée sur l’accueil') and 'Questionnaire, étape 1' in rows[1]['t'] and rows[-1]['t'].startswith('Achat'), [r['t'][:30] for r in rows])
        worst = [r for r in rows if r['worst']]
        check(tag + ' : une seule étape en rouge, la plus grosse perte', len(worst) == 1 and worst[0]['a'].endswith('plus grosse perte') and worst[0]['col'] in ('rgb(180, 35, 24)', 'rgb(255, 138, 128)'), worst)
        check(tag + ' : % de l’étape d’avant écrits', '22 %' in worst[0]['t'] or '22,0 %' in worst[0]['t'], worst[0]['t'] if worst else '')
        live = await page.inner_text('#aLive')
        check(tag + ' : en direct : 8 personnes, pays et pages', '8' in live and 'personnes en ce moment' in live and 'États-Unis' in live and 'montage' in live, live[:200])
        src = await page.inner_text('#aSrc')
        check(tag + ' : sources avec TikTok repéré', '🎵 tiktok.com / referral' in src, src[:200])
        for sel, want in [('#aCtry', 'France'), ('#aDev', 'Téléphone'), ('#aLang', 'French'), ('#aPages', '/fr/')]:
            t = await page.inner_text(sel); check(tag + ' : liste ' + sel + ' remplie (' + want + ')', want in t, t[:120])
        k = await page.inner_text('#aKpis'); check(tag + ' : temps passé moyen par personne', 'temps passé moyen' in k and 'min' in k, k)
        # period 30 days: other figures
        await page.click('#aPer button[data-d="30"]'); await page.wait_for_timeout(500)
        rows30 = await page.eval_on_selector_all('#aFunnel .fstep .tr span', 'els => els.map(e => e.innerText.replace(/\\s/g, " "))')
        check(tag + ' : 30 jours : autres chiffres', rows30[:1] == ['5 480'], rows30[:3])
        await page.click('#aPer button[data-d="7"]'); await page.wait_for_timeout(400)
        cl = await page.inner_text('#aClState'); ck = await page.inner_text('#aClKpis')
        check(tag + ' : relevé Clarity daté, appels du jour', 'Relevé du' in cl and 'sur 10' in cl, cl)
        check(tag + ' : Clarity : sessions, pages par session, défilement, temps actif', all(x in ck for x in ['sessions', 'pages par session', 'défilement', 'temps actif']), ck)
        hist = await page.eval_on_selector_all('#aClHist li', 'els => els.length')
        check(tag + ' : 14 jours de relevés', hist == 14, hist)
        sig = await page.inner_text('#aSig'); check(tag + ' : les 6 signaux', all(x in sig for x in ['Clics de rage', 'Clics morts', 'Retours rapides', 'Erreurs JavaScript', 'Défilement excessif']), sig)
        fr = await page.eval_on_selector_all('#aFric li', 'els => els.map(e => { const a = e.querySelector("a"); return { t: e.innerText, href: a && a.href, tgt: a && a.target, rel: a && a.rel }; })')
        check(tag + ' : frictions par page et appareil, la plus grosse en premier', len(fr) >= 5 and fr[0]['t'].startswith('Clics morts') and '/ · Téléphone' in fr[0]['t'], [x['t'][:40] for x in fr[:3]])
        check(tag + ' : « Voir les enregistrements » ouvre Clarity dans un nouvel onglet', all(x['href'] == 'https://clarity.microsoft.com/projects/view/zic7crm0mc/impressions' and x['tgt'] == '_blank' and 'noopener' in x['rel'] for x in fr), fr[:1])
        check(tag + ' : le filtre à mettre dans Clarity est écrit', 'filtre : Dead clicks · URL contient « / »' in fr[0]['t'], fr[0]['t'])
        body = await page.inner_text('#p-analytics')
        check(tag + ' : jamais d’e-mail ni d’identifiant affiché', '@' not in body, '')
        await page.click('#aClBtn'); await page.wait_for_timeout(400)
        check(tag + ' : « Relever maintenant » répond', 'déjà complet' in await page.inner_text('#aClOut'))
    else:
        fu = await page.inner_text('#aFunnel'); cl = await page.inner_text('#aClState')
        check(tag + ' : GA4 pas relié : les étapes à suivre (GA4_SA_KEY, Lecteur)', 'GA4_SA_KEY' in fu and 'Lecteur' in fu and '565628578' in fu, fu[:200])
        check(tag + ' : Clarity pas relié : les étapes (CLARITY_API_TOKEN)', 'CLARITY_API_TOKEN' in cl and 'Exportation de données' in cl, cl[:200])
        check(tag + ' : pas de bouton « Relever maintenant » sans jeton', not await page.is_visible('#aClBtn'))
        lv = await page.inner_text('#aLive'); check(tag + ' : en direct : étapes à suivre, pas d’erreur', 'GA4_SA_KEY' in lv, lv[:120])
    # every « ? » of the page opens its sentence
    qs = await page.query_selector_all('#p-analytics .q'); ok = True
    for q in qs:
        await q.click(); await page.wait_for_timeout(60)
        ok = ok and await q.get_attribute('aria-expanded') == 'true'
    check(tag + ' : les « ? » ouvrent leur explication (%d)' % len(qs), ok and len(qs) == 5)
    check(tag + ' : rien de plus large que l’écran', await page.evaluate('() => document.documentElement.scrollWidth - innerWidth') <= 0)
    if SHOTS: await page.screenshot(path=os.path.join(SHOTS, 'analytics-%s-%d.png' % ('demo' if demo else 'off', width)), full_page=True)
    check(tag + ' : aucune erreur dans la page', not errors, errors[:3])
    await ctx.close()


async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for demo in (True, False):
            for w in (1280, 390): await run(b, w, demo)
        await b.close()
    bad = [r for r in results if not r[1]]
    print('\n%d/%d' % (len(results) - len(bad), len(results)))
    sys.exit(1 if bad else 0)

asyncio.run(main())
