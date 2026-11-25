"""Builds the public website (site/) from the same sources as the claude.ai page.
   python3 build_site.py [--email contact@…] [--domain stalak.app]
   Differences with the claude.ai page: fonts and libraries served by the site itself (no Google / jsDelivr at load time),
   proper <head> (description, sharing preview), legal pages, cache and security headers for Cloudflare Pages.
   Two pages: / in English and /fr/ in French (same app; the English page has its texts written in English in the HTML
   itself, for search engines, and the app starts in English there unless the person picked FR with the switch).
   (Marketing & croissance, 01/11/2026) English moved to the root and French to /fr/ (owner's decision of 31/10):
   the old addresses (/en/…, /tarifs…) are sent to the new ones by site_src/_redirects (301, never a chain)."""
import pathlib, re, shutil, sys, json, html as H, datetime

root = pathlib.Path(__file__).parent
src, extra, out = root / 'src', root / 'site_src', root / 'public'
args = sys.argv[1:]
def arg(name, default=''):
    return args[args.index(name) + 1] if name in args else default
EMAIL = arg('--email')
DOMAIN = arg('--domain', 'stalak.app')
SELLER = arg('--seller')   # legal name of the seller (company or sole proprietor), shown in the terms of sale
# Juridique & business (01/11/2026): identity of the micro-entreprise (vendeur.json at the root, not published as a file).
# Empty name / SIRET / address / phone = « private individual » texts; all four filled = the business texts of the legal pages.
VENDEUR = json.loads((root / 'vendeur.json').read_text(encoding='utf-8')) if (root / 'vendeur.json').exists() else {}
BIZ = {k: str(VENDEUR.get(k) or '').strip() for k in ('nom', 'siret', 'adresse', 'telephone')}
BIZ_ON = all(BIZ.values())
assert BIZ_ON or not any(BIZ.values()), 'vendeur.json: fill in nom, siret, adresse and telephone together (or leave all four empty)'
MED = {k: str((VENDEUR.get('mediateur') or {}).get(k) or '').strip() for k in ('nom', 'site')}
MED_ON = all(MED.values())
assert MED_ON or not any(MED.values()), 'vendeur.json: the mediator needs both its name and its website'
assert not MED_ON or MED['site'].startswith('https://'), 'vendeur.json: the mediator website must start with https://'
URL = 'https://' + DOMAIN
# Marketing & croissance : comptes officiels de Stalak (schema.org « sameAs ») et les 6 guides : depuis le 01/11 ils sont listés dans
# src/footer.py (le pied de page, la même source pour toutes les pages) ; c'est là qu'il faut les changer.
sys.path.insert(0, str(src)); import footer as FOOT
SOCIAL = FOOT.SOCIAL
# pages FR / EN du plan du site (en plus de l'accueil) ; l'anglais est à la racine, le français dans /fr/ (31/10).
# Confidentialité et mentions légales n'y sont pas : elles sont en « noindex » (choix Juridique), Google ne doit pas les recevoir.
SITEMAP_PAIRS = [('/fr/tarifs', '/pricing'), ('/fr/conditions', '/terms'), ('/fr/remboursement', '/refunds'),
                 ('/fr/alternative-triller', '/triller-alternative'), ('/fr/clip', '/music-video')]
# (25/11, point SEO/AEO) les 6 guides existent aussi en français (src/footer.py, GUIDES_FR) : ils passent dans les paires FR / EN,
# et GUIDES ne garde que les guides sans page française (aucun aujourd'hui) ; les pages « percer » aussi (src/footer.py, PERCER)
SITEMAP_PAIRS += [('/fr/' + fr, '/' + en) for fr, en, _ in FOOT.GUIDES_FR] + [('/fr/' + fr, '/' + en) for fr, en, _, _ in FOOT.PERCER]
GUIDES = [g for g in FOOT.GUIDES if g[0] not in {en for _, en, _ in FOOT.GUIDES_FR}]
# Marketing & croissance (09/11, A7) : les pages d'aide, en FR et en EN, dans le plan du site avec leurs liens FR / EN (src/footer.py, AIDE)
SITEMAP_PAIRS += [('/fr/' + fr, '/' + en) for fr, en, _, _ in FOOT.AIDE]

head = (src / 'head.html').read_text(encoding='utf-8')
css = (src / 'style.css').read_text(encoding='utf-8') + '\n/* ---- theme ---- */\n' + (src / 'theme.css').read_text(encoding='utf-8') + '\n' + (src / 'pricing.css').read_text(encoding='utf-8')
PRICING_CSS = (src / 'pricing.css').read_text(encoding='utf-8')   # plan cards: in the app's Stalak Pro page and in /pricing.css for /tarifs
markup = (src / 'markup.html').read_text(encoding='utf-8')
# Marketing & croissance : la petite vidéo du premier écran n'apparaît que si site_src/demo/edit.mp4 existe (un vrai montage Stalak,
# 9:16, quelques secondes ; 06/11 : les prises « neva die » du propriétaire, avec son accord) ; même fichier dans les guides
markup = re.sub(r'<!--HEROVIDEO-->.*?<!--/HEROVIDEO-->', '', markup, flags=re.S) if not (extra / 'demo' / 'edit.mp4').exists() else markup.replace('<!--HEROVIDEO-->', '').replace('<!--/HEROVIDEO-->', '')
js = (src / 'app.js').read_text(encoding='utf-8')
ACCOUNT_JS = (src / 'account.js').read_text(encoding='utf-8')   # stalak.app only: sign in, Stalak Pro
TIKTOK_JS = (src / 'tiktok.js').read_text(encoding='utf-8')     # Réseaux sociaux (21/11), stalak.app only: « Publier sur TikTok », « Mes stats »

# 1. head: fonts and libraries from the site itself
# favicon: real files (Google Search cannot read an icon written inside the page as data:)
head = re.sub(r'<link rel="icon" type="image/svg\+xml" href="data:[^"]*">',
              '<link rel="icon" href="/favicon.ico" sizes="48x48">\n<link rel="icon" type="image/svg+xml" href="/icons/icon.svg">\n<link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png">', head)
head = re.sub(r'<link rel="preconnect" href="https://fonts.googleapis.com">\n?', '', head)
head = re.sub(r'<link rel="stylesheet" href="https://fonts.googleapis.com[^"]*">', '<link rel="stylesheet" href="/fonts/fonts.css">', head)
head = head.replace('https://cdn.jsdelivr.net/npm/mp4-muxer@5.1.3/build/mp4-muxer.min.js', '/vendor/mp4-muxer.min.js')
head = head.replace('https://cdn.jsdelivr.net/npm/mp4box@0.5.2/dist/mp4box.all.min.js', '/vendor/mp4box.all.min.js')
# App & montage (audit 6/11, n° 10): the two video libraries no longer hold up the first paint (« defer »: they run after the
# page is read, in their order, before the app's own code, which is « defer » too, see page())
head = head.replace('<script src="/vendor/', '<script defer src="/vendor/')
assert head.count('<script defer src="/vendor/') == 2
# App & montage (audit 13/11, n° 1): not even « defer » any more: the libraries and the app are loaded right after the first
# picture of the page (APP_LOADER, page()), so that nothing of their 360 KB comes before what the person sees
VENDOR = re.findall(r'<script defer src="(/vendor/[^"]+)"></script>\n?', head)
assert len(VENDOR) == 2
head = re.sub(r'<script defer src="/vendor/[^"]+"></script>\n?', '', head)
assert 'googleapis' not in head and 'jsdelivr' not in head, 'an outside resource is left in the head'
head = re.sub(r'<meta charset="utf-8">\n?|<meta name="viewport"[^>]*>\n?', '', head)
assert '<title>Stalak</title>' in head

# the texts of each page
PAGE = {
  'fr': {
    'path': '/fr/', 'locale': 'fr_FR',
    'title': 'Stalak — ton playback monté sur le rythme',
    'desc': 'Ton son est prêt, pas ton snippet ? Importe ton son et tes prises : Stalak monte ton playback sur le rythme, lèvres synchro. Prêt à poster ce soir. Gratuit.',   # (23/11) the result first, as on the page
    'ld': 'Stalak est un site de montage de playback (lip sync) : il coupe tes prises sur le rythme de ton son, garde la synchro des lèvres parfaite et exporte pour TikTok, Reels, Shorts et YouTube.',
    'about': """
    <h2 id="aboutT">Stalak, c’est quoi ?</h2>
    <p><strong>Stalak</strong> est un site de <strong>montage de playback</strong> (lip sync) : tu importes ton son et quelques prises où tu rappes dessus,
    Stalak passe d’une prise à l’autre sur le rythme, lèvres synchro, et tu exportes pour <strong>TikTok, Reels et Shorts</strong>,
    ou tout ton morceau en clip <strong>YouTube</strong> 16:9 avec le <a href="/fr/clip">mode Clip</a> (export avec Stalak Pro).</p>
    <p>Gratuit, dans ton navigateur, sans compte ni téléchargement. <a href="/fr/comment-faire-un-playback">Comment faire un playback, pas à pas</a></p>
  """,
  },
  'en': {
    'path': '/', 'locale': 'en_US',
    'title': 'Stalak: free lip-sync video editor that cuts to the beat',   # ≤ 60 characters for Google (13/11 audit; before: « …that cuts your takes to the beat », 67)
    'desc': 'Song done, no snippet yet? Drop in your song and a few takes: Stalak cuts them on the beat, lips in sync. Ready to post tonight. Free, no sign-up.',
    'ld': 'Stalak is a free, browser-based lip-sync video editor for rappers and singers. It cuts between your takes on the beat of your song, keeps the lip sync tight and exports for TikTok, Reels, YouTube Shorts and YouTube.',
    'about': """
    <h2 id="aboutT">What is Stalak?</h2>
    <p><strong>Stalak</strong> is a <strong>lip-sync video editor</strong> for rappers and singers: drop in your song and a few takes of you performing it,
    and Stalak cuts between them on the beat, lips in sync. Export for <strong>TikTok, Reels and Shorts</strong>,
    or your whole song as a 16:9 <strong>YouTube</strong> video with <a href="/music-video">Music video mode</a> (export with Stalak Pro).</p>
    <p>Free, in your browser, no account, no download. <a href="/how-to-make-a-lip-sync-video">How to make a lip-sync video, step by step</a></p>
  """,
  },
}

# 2. the app: contact address for the help bubble; « Stalak, c'est quoi ? » and the links to the legal pages under the « by Alaska » badge
if EMAIL:
    assert "const SUPPORT_EMAIL = '';" in js
    js = js.replace("const SUPPORT_EMAIL = '';", 'const SUPPORT_EMAIL = ' + json.dumps(EMAIL) + ';')
a = '<div class="byalaska" id="byAlaska">by Alaska</div>'
assert a in markup
# Marketing & croissance (22/11, sales audit, owner's decisions): before / after, the customer reviews and the counter, just above
# « Stalak, c'est quoi ? ». The reviews: site_src/avis.json, word for word as the owner gave them ({pseudo, note 1-5, texte,
# formule: free | pro | creator}; the note as the person gave it, 1 to 5, decimals allowed); « Avis clients », the average of all of them, no « achat vérifié » badge (not bought through Paddle).
# No review in the file: no band. The counter: every video exported since the launch (/api/stats/exports); hidden if it doesn't load.
AVIS = json.loads((extra / 'avis.json').read_text(encoding='utf-8')) if (extra / 'avis.json').exists() else []
PLAN_NAME = {'free': {'fr': 'Gratuit', 'en': 'Free'}, 'pro': {'fr': 'Stalak Pro', 'en': 'Stalak Pro'}, 'creator': {'fr': 'Creator Plus', 'en': 'Creator Plus'}}
for _r in AVIS:
    assert set(_r) >= {'pseudo', 'note', 'texte', 'formule'}, 'avis.json: pseudo, note, texte and formule for each review'
    assert isinstance(_r['note'], (int, float)) and 1 <= _r['note'] <= 5 and _r['formule'] in PLAN_NAME and str(_r['texte']).strip(), 'avis.json: a note from 1 to 5 and a known formule'
def rv_item(r, lang, tag='li', cls=''):
    v = float(r['note']); n = int(v + .5); s = ('%g' % v).replace('.', ',' if lang == 'fr' else '.')   # 4,8/5 as given; the stars rounded
    return ('<' + tag + (' class="' + cls + '"' if cls else '') + '><span class="rv-note"><span class="rv-stars" aria-hidden="true">' + '★' * n + '☆' * (5 - n) + '</span> <b>' + s + '/5</b></span>'
            '<blockquote lang="' + ('en' if lang == 'en' and r.get('texte_en') else 'fr') + '"' + (' data-i18n="rv.q.' + str(AVIS.index(r)) + '"' if tag == 'li' else '') + '>' + H.escape(str(r['texte_en'] if lang == 'en' and r.get('texte_en') else r['texte'])) + '</blockquote><p class="rv-who">' + H.escape(str(r['pseudo'])) + ' · ' + PLAN_NAME[r['formule']][lang] + '</p></' + tag + '>')
RV_MEAN = sum(float(r['note']) for r in AVIS) / len(AVIS) if AVIS else 0
# App & montage (23/11, maquette A): the same average for the pill of the phone's first screen (app.js heroProof)
assert 'id="heroProof" data-mean=""' in markup
if AVIS: markup = markup.replace('id="heroProof" data-mean=""', 'id="heroProof" data-mean="%.2f"' % RV_MEAN)
def rv_avg(lang):   # what follows the note (the note itself is #rvNum: it climbs when it comes on screen, src: RV_NUM_JS)
    n = len(AVIS)
    if lang == 'fr': return 'sur 5 · ' + str(n) + (' avis clients' if n > 1 else ' avis client')
    return 'out of 5 · ' + str(n) + (' customer reviews' if n > 1 else ' customer review')
# (23/11, idea 4) the note written in the page's language (4,7 / 4.7, also after the footer's FR / EN switch); when it comes on
# screen, once: the five stars fill up to the note and the number climbs to it (not with « reduce motion »)
RV_NUM_JS = ('<script>(function (p) { var b = p && p.querySelector("#rvNum"); if (!b) return; var n = parseFloat(p.getAttribute("data-v")), root = document.documentElement;'
             ' function show(v){ b.textContent = v.toFixed(1).replace(".", root.lang === "en" ? "." : ","); } show(n);'
             ' if (window.MutationObserver) new MutationObserver(function () { show(n); }).observe(root, { attributes: true, attributeFilter: ["lang"] });'
             ' if (!("IntersectionObserver" in window) || (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches)) return;'
             ' var io = new IntersectionObserver(function (e) { if (!e[0].isIntersecting) return; io.disconnect(); p.classList.add("is-in"); var t0 = 0;'
             '   requestAnimationFrame(function step(t){ if (!t0) t0 = t; var k = Math.min(1, (t - t0) / 900); show(n * (1 - Math.pow(1 - k, 4))); if (k < 1) requestAnimationFrame(step); }); }, { threshold: .8 }); io.observe(p);'
             ' })(document.currentScript.previousElementSibling);</script>')
# (23/11, owner) on a computer the example video stands next to « Avec Stalak » (the hero keeps it on a phone); the reviews fill
# the width of the screen and glide to the left by themselves: the list doubled, moved by transform only, stopped under the
# mouse or a finger, still dragged by hand; « reduce motion » or no script: a plain list to slide by hand
FX_TAG = '<script>' + (src / 'fx.js').read_text(encoding='utf-8') + '</script>'
# (23/11, idea 2) « 3 prises deviennent 1 montage »: the real edit (demo/edit.mp4: take 1, 2, 3, 2, one per bar: cuts measured at
# 1.53, 3.07 and 4.60 s) with a picture of each raw take (demo/takes.jpg) lit when it is the one on screen, and the four bars
# under it with a playhead that follows the video's own time
BA_VIDEO = ('<figure class="ba-v" id="baMix"><div class="mx-row"><div class="mx-takes" aria-hidden="true"><i class="mx-t mx-t1"></i><i class="mx-t mx-t2"></i><i class="mx-t mx-t3"></i></div>'
            '<video src="/demo/edit.mp4" poster="/demo/edit.jpg" width="432" height="768" muted loop playsinline preload="none" '
            'aria-label="Exemple : une vidéo montée par Stalak à partir de trois prises" data-i18n-attr="aria-label:hero.v"></video></div>'
            '<div class="mx-bar" aria-hidden="true"><b></b><b></b><b></b><b></b><u></u></div>'
            '<figcaption data-i18n="ba.v">3 prises, 1 montage. Stalak change de prise à chaque mesure.</figcaption>'
            '<script>(function (f) { var v = f && f.querySelector("video"); if (!v) return; var ts = f.querySelectorAll(".mx-t"), head = f.querySelector(".mx-bar u"), bar = f.querySelector(".mx-bar"), ORDER = [0, 1, 2, 1], cur = -1, raf = 0;'
            ' function show(){ var d = v.duration || 6.12, p = Math.min(.9999, (v.currentTime || 0) / d), k = ORDER[Math.floor(p * 4)];'
            '   if (k !== cur){ cur = k; for (var i = 0; i < ts.length; i++) ts[i].classList.toggle("on", i === k); }'
            '   head.style.transform = "translate3d(" + (p * (bar.clientWidth - 6)).toFixed(1) + "px,0,0)"; }'
            ' function loop(){ show(); raf = requestAnimationFrame(loop); }'
            ' v.addEventListener("playing", function () { if (!raf) raf = requestAnimationFrame(loop); });'
            ' v.addEventListener("pause", function () { cancelAnimationFrame(raf); raf = 0; show(); }); v.addEventListener("seeked", show); show();'
            ' if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches){ v.controls = true; return; }'
            ' if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { if (e[0].isIntersecting){ var p = v.play(); if (p && p.catch) p.catch(function () {}); } else v.pause(); }, { threshold: .25 }).observe(v);'
            ' })(document.currentScript.parentNode);</script></figure>') if (extra / 'demo' / 'edit.mp4').exists() else ''
RV_JS = ('<script>(function (v) { var l = v && v.firstElementChild; if (!l || !window.requestAnimationFrame) return;'
         ' if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;'
         ' var n = l.children.length, i, c; for (i = 0; i < n; i++){ c = l.children[i].cloneNode(true); c.setAttribute("aria-hidden", "true"); l.appendChild(c); }'
         ' v.classList.add("is-auto"); v.scrollLeft = 0;'
         ' var SPEED = 34, x = 0, vel = SPEED, half = 0, last = 0, raf = 0, over = false, drag = null, seen = false;'
         ' function size(){ half = l.offsetWidth / 2; }'
         ' function tick(t){ var dt = last ? Math.min(t - last, 64) / 1000 : 0; last = t;'
         '   var to = over || drag ? 0 : SPEED; vel += (to - vel) * Math.min(1, dt * 7); if (Math.abs(to - vel) < .5) vel = to; if (!drag) x += vel * dt;'
         '   if (half > 0){ x %= half; if (x < 0) x += half; }'
         '   l.style.transform = "translate3d(" + (-x).toFixed(2) + "px,0,0)"; raf = requestAnimationFrame(tick); }'
         ' function run(){ var on = seen && !document.hidden; if (on && !raf){ last = 0; raf = requestAnimationFrame(tick); } else if (!on && raf){ cancelAnimationFrame(raf); raf = 0; } }'
         ' v.addEventListener("mouseenter", function () { over = true; }); v.addEventListener("mouseleave", function () { over = false; });'
         ' v.addEventListener("pointerdown", function (e) { if (e.pointerType === "mouse" && e.button !== 0) return; drag = { id: e.pointerId, px: e.clientX, x0: x, cap: false }; if (e.pointerType !== "mouse") over = true; });'
         ' v.addEventListener("pointermove", function (e) { if (!drag || e.pointerId !== drag.id) return; var d = e.clientX - drag.px;'
         '   if (!drag.cap && Math.abs(d) > 5){ drag.cap = true; v.classList.add("is-drag"); try { v.setPointerCapture(e.pointerId); } catch (_) {} }'
         '   if (drag.cap) x = drag.x0 - d; });'
         ' function end(e){ if (!drag || (e && e.pointerId !== drag.id)) return; drag = null; v.classList.remove("is-drag"); if (!e || e.pointerType !== "mouse") over = false; }'
         ' v.addEventListener("pointerup", end); v.addEventListener("pointercancel", end);'
         ' window.addEventListener("resize", size); if (document.fonts && document.fonts.ready) document.fonts.ready.then(size); size();'
         ' if ("IntersectionObserver" in window) new IntersectionObserver(function (e) { seen = e[0].isIntersecting; run(); }, { rootMargin: "120px" }).observe(v); else seen = true;'
         ' document.addEventListener("visibilitychange", run); run();'
         ' })(document.currentScript.previousElementSibling);</script>')
COUNT = ('<p class="proof-n" id="proofN" hidden><span class="pn-a" data-i18n="proof.a">Déjà</span> <b id="proofNum"></b> <span class="pn-b" data-i18n="proof.b">vidéos montées avec Stalak</span></p>'
         '<script>(function (p) { if (!p || !window.fetch) return;'
         ' fetch("/api/stats/exports").then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {'
         ' var n = j && Number(j.total); if (!(n > 0)) return;'
         ' var b = document.getElementById("proofNum"), loc = document.documentElement.lang === "en" ? "en-US" : "fr-FR";'
         ' function show(v){ b.textContent = Math.round(v).toLocaleString(loc); }'
         ' show(n); p.hidden = false;'
         ' if (!("IntersectionObserver" in window) || (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches)) return;'
         ' show(0); var io = new IntersectionObserver(function (e) { if (!e[0].isIntersecting) return; io.disconnect(); var t0 = 0;'
         '   requestAnimationFrame(function step(t){ if (!t0) t0 = t; var k = Math.min(1, (t - t0) / 900); show(n * (1 - Math.pow(1 - k, 4))); if (k < 1) requestAnimationFrame(step); }); }, { threshold: .6 }); io.observe(p);'
         ' }).catch(function () {}); })(document.currentScript.previousElementSibling);</script>')
PROOF = ('<section class="proof">'
         + COUNT +
         '<div class="ba"><div class="ba-c ba-no"><h3 data-i18n="ba.no.t">Sans Stalak</h3><p data-i18n="ba.no">Tes prises dorment dans ta galerie. Caler chaque coupe à la main prend des heures, et la bouche décale.</p></div>'
         '<div class="ba-c ba-yes"><div class="ba-yt"><h3 data-i18n="ba.yes.t">Avec Stalak</h3><p data-i18n="ba.yes">Ton son et tes prises, c’est tout. Stalak coupe sur le rythme, garde tes lèvres synchro, et c’est prêt pour TikTok, Reels et Shorts.</p></div>' + BA_VIDEO + '</div></div>'
         + '</section>\n  ')
RV_BAND = (('<section class="band band-night rv-band" aria-labelledby="rvT"><div class="band-in"><h2 id="rvT" data-i18n="rv.t">Avis clients</h2><p class="rv-avg" id="rvAvg" data-v="' + ('%.2f' % RV_MEAN) + '"><span class="rv-fill" aria-hidden="true" style="--w:' + ('%.1f' % (RV_MEAN * 20)) + '%">★★★★★<em>★★★★★</em></span> <b id="rvNum">' + ('%.1f' % RV_MEAN).replace('.', ',') + '</b> <span data-i18n="rv.avg">' + rv_avg('fr') + '</span></p>' + RV_NUM_JS + '</div>' +
            '<div class="rv-edge"><div class="rv-view"><ul class="rv-list">' + ''.join(rv_item(r, 'fr') for r in AVIS) + '</ul></div>' + RV_JS + '</div></section>') if AVIS else '')
# (23/11, the owner's choice « Bandes de glace »; stalak-da: each part of a page has its own full-width band, each band starts
# with a row of icicles in the colour of the band above). Under the editor: the counter and « Sans / Avec Stalak » stay on the
# blue with the snow (in .wrap); then, as children of <body> like the footer (outside the column, so nothing clips them): the
# reviews on a night-blue band, « Stalak, c'est quoi ? » and the « by Alaska » badge on a frost band, then the footer (ink)
BANDS = ('<div class="bands" id="bands">' + RV_BAND
         + '<div class="band band-frost"><div class="band-in"><section class="about" aria-labelledby="aboutT" data-i18n="site.about">' + PAGE['fr']['about'] + '</section>'
         + '<p class="trial-line" data-i18n="trial.line">Stalak Pro : <a href="/fr/tarifs#essai">essai de 7 jours</a>, carte demandée. Ensuite 7,99 $ par mois sauf si tu annules avant la fin.</p>'
         + a + '</div></div></div>\n')
markup = markup.replace(a, PROOF + FX_TAG + '\n  ')
assert markup.count('<!--FOOTER-->') == 1
markup = markup.replace('<!--FOOTER-->', BANDS + '<!--FOOTER-->')
# the footer: src/footer.py (the same on every page, owner 01/11); in the other language, the app takes it from the dictionary (site.footer)
assert '<!--FOOTER-->' in markup
markup = markup.replace('<!--FOOTER-->', FOOT.render('fr', i18n='site.footer'))
css += '\n' + (src / 'footer.css').read_text(encoding='utf-8')
css += '\n' + (src / 'fx.css').read_text(encoding='utf-8')   # Marketing (23/11): the animation ideas the owner picked
css += '\n' + (src / 'bands.css').read_text(encoding='utf-8')   # Marketing (23/11): « Bandes de glace »
css += '\n' + (src / 'tiktok.css').read_text(encoding='utf-8')   # Réseaux sociaux (21/11)
css += '\n' + (src / 'mobile.css').read_text(encoding='utf-8')   # App & montage (23/11): refonte mobile (phones only)
# the opening « le glaçon » (phones, once per session) and where the app finds GSAP: served by the site, loaded only on a phone
GSAP_URL = '/vendor/gsap-3.15.0.min.js'
assert (extra / 'vendor' / 'gsap-3.15.0.min.js').exists()
# what the page itself does, first thing in <body> (the rest is /assets/splash.<version>.js, written further down with the app's files)
SPLASH_BOOT = ("(function(){var d=document,W=window,G=W.STALAK_GSAP=%s;try{"
               "if(!W.matchMedia||!matchMedia('(max-width:899px)').matches||matchMedia('(prefers-reduced-motion: reduce)').matches)return;"
               "if(navigator.webdriver&&!W.__stalakSplash)return;"   # automated checks: only the one that asks for it
               "if(location.hash&&location.hash.length>1)return;"
               "if(sessionStorage.getItem('stalak:splash')||sessionStorage.getItem('stalak:openProject'))return;"
               "sessionStorage.setItem('stalak:splash','1');}catch(e){return;}"
               "var sp=d.createElement('div'),r=d.documentElement;sp.id='splash';sp.setAttribute('aria-hidden','true');"
               "sp.innerHTML='<div class=\"sp-curtain\"><div class=\"sp-bg\"></div></div>';r.classList.add('splash-on');d.body.insertBefore(sp,d.body.firstChild);"
               "W.__stalakSplashT=Date.now();"
               "function bye(){if(W.__stalakSplashGo||!sp.parentNode)return;sp.style.transition='opacity .3s ease-out';sp.style.opacity='0';"
               "setTimeout(function(){r.classList.remove('splash-on');if(sp.parentNode)sp.parentNode.removeChild(sp);W.__stalakSplashDone=true;},320);}"
               "[G,%s].forEach(function(u){var s=d.createElement('script');s.src=u;s.async=false;s.onerror=bye;d.head.appendChild(s);});"
               "setTimeout(bye,3000);})();")
css += '\n.about{font-size:15px;line-height:1.6}.about h2{font:400 24px/1.2 var(--display);margin:0 0 8px}.about p{margin:0 0 8px}.about ul{margin:0 0 8px;padding-left:20px}.about strong{font-weight:700}.about a{font-weight:700;text-decoration:underline;text-underline-offset:3px}\n'

# 3. languages: the dictionaries are in app.js (between /*@EN*/ … /*EN@*/ and /*@FR*/ … /*FR@*/); the French of the page's
#    fixed texts is read from the markup (data-i18n, data-i18n-attr) and given to the app, so that the English page can
#    switch back to French; the English page gets its texts in English in the HTML
def block(name):
    m = re.search(r'/\*@' + name + r'\*/(.*?)/\*' + name + r'@\*/', js, re.S)
    assert m, 'no ' + name + ' block in app.js'
    return m
EN = json.loads(block('EN').group(1)); FR = json.loads(block('FR').group(1))
EN.update({'doc.title': PAGE['en']['title'], 'site.about': PAGE['en']['about'], 'site.footer': FOOT.inner('en')})
EN.update({'ba.no.t': 'Without Stalak', 'ba.no': 'Your takes sit in your camera roll. Lining up every cut by hand takes hours, and the lips drift.',
           'ba.yes.t': 'With Stalak', 'ba.yes': 'Your song and your takes, that’s it. Stalak cuts on the beat, keeps your lips in sync, and it’s ready for TikTok, Reels and Shorts.',
           'trial.line': 'Stalak Pro: <a href="/pricing#trial">7-day trial</a>, card required. Then $7.99 a month unless you cancel before it ends.', 'rv.t': 'Customer reviews', 'ba.v': '3 takes, 1 edit. Stalak switches takes on every bar.', 'proof.a': 'Already', 'proof.b': 'videos made with Stalak'})
if AVIS: EN['rv.avg'] = rv_avg('en')
# (23/11, the owner) the reviews in English on the English site: each one's « texte_en » in avis.json (French kept word for word)
for _i, _r in enumerate(AVIS):
    if _r.get('texte_en'): EN['rv.q.%d' % _i] = H.escape(_r['texte_en'])
FR.update({'doc.title': PAGE['fr']['title']})

TAG = re.compile(r'<(\w+)\b([^>]*?)\bdata-i18n="([^"]+)"([^>]*)>(.*?)</\1>', re.S)
ATTR = re.compile(r'<\w+\b[^>]*\bdata-i18n-attr="([^"]+)"[^>]*>')
def static_fr(m):
    d = {}
    for t in TAG.finditer(m): d.setdefault(t.group(3), t.group(5))
    for t in ATTR.finditer(m):
        for pair in t.group(1).split(';'):
            at, k = pair.split(':', 1)
            v = re.search(r'\s' + re.escape(at) + r'="([^"]*)"', t.group(0))
            d.setdefault(k, H.unescape(v.group(1)) if v else '')
    return d
def localize(m, D):
    n = [0]
    def tag(t):
        k = t.group(3)
        if k not in D: return t.group(0)
        n[0] += 1
        return '<' + t.group(1) + t.group(2) + 'data-i18n="' + k + '"' + t.group(4) + '>' + D[k] + '</' + t.group(1) + '>'
    m = TAG.sub(tag, m)
    def attr(t):
        s = t.group(0)
        for pair in t.group(1).split(';'):
            at, k = pair.split(':', 1)
            if k in D: s = re.sub(r'(\s' + re.escape(at) + r'=")[^"]*(")', lambda x: x.group(1) + H.escape(D[k], quote=True) + x.group(2), s, count=1)
        return s
    return ATTR.sub(attr, m), n[0]
SFR = static_fr(markup)
missing = sorted(k for k in SFR if k not in EN)
assert not missing, 'no English for: ' + ', '.join(missing)
def jdump(d): return json.dumps(d, ensure_ascii=False).replace('</', '<\\/')
js = js[:block('EN').start(1)] + jdump(EN) + js[block('EN').end(1):]
js = js[:block('FR').start(1)] + jdump(FR) + js[block('FR').end(1):]
js = js[:block('STATIC_FR').start(1)] + jdump(SFR) + js[block('STATIC_FR').end(1):]
# Marketing & croissance (25/11, point SEO/AEO du Chef, docs/audit/seo-aeo-2026-11-25.md): the titles of the app's screens
# (« Ta vidéo est prête ✓ », « Reprendre ton dernier montage ? », the steps, the windows…) are not the plan of the page for
# Google and the AIs. On stalak.app only, they become <x-h2 role="heading" aria-level="2">: the same for a screen reader, not
# a <h2> in the HTML. Kept as <h2>: « Stalak, c'est quoi ? » (aboutT), the reviews (rvT) and the footer. Their style follows:
# every CSS selector with h2 gets the same one with x-h2 (same weight), and x-h2 starts with a browser's h2 look.
_H2_KEEP = re.compile(r'\bid="(aboutT|rvT)"|class="ft-h"')
def _demote_h2(m):
    attrs = m.group(1) or ''
    if _H2_KEEP.search(attrs): return m.group(0)
    return '<x-h2 role="heading" aria-level="2"' + attrs + '>' + m.group(2) + '</x-h2>'
markup, _n_h2 = re.subn(r'<h2(\s[^>]*)?>(.*?)</h2>', _demote_h2, markup, flags=re.S)
assert _n_h2 >= 20 and markup.count('<h2') == 2 + markup.count('class="ft-h"'), 'home page: the h2 kept should be aboutT, rvT and the footer'
def _split_sel(s):
    parts, depth, cur = [], 0, ''
    for ch in s:
        if ch == ',' and depth == 0: parts.append(cur); cur = ''; continue
        depth += ch == '('; depth -= ch == ')'; cur += ch
    return parts + [cur]
_H2_RE = re.compile(r'(?<![\w.#-])h2(?![\w-])')
def _css_x_h2(c):
    def fix(m):
        sel = m.group(0); extra = [_H2_RE.sub('x-h2', p) for p in _split_sel(sel) if _H2_RE.search(p)]
        return sel if not extra else sel.rstrip() + ',' + ','.join(extra) + ' '
    return 'x-h2{display:block;font-size:1.5em;font-weight:bold;margin-block:.83em}\n' + re.sub(r'[^{}]+(?=\{)', fix, c)
css = _css_x_h2(css)
markup_en, n_en = localize(markup, EN)
markup_en = markup_en.replace('data-lang="fr" lang="fr" aria-pressed="true"', 'data-lang="fr" lang="fr" aria-pressed="false"').replace('data-lang="en" lang="en" aria-pressed="false"', 'data-lang="en" lang="en" aria-pressed="true"')
assert n_en == len(TAG.findall(markup)), 'some texts of the English page were not replaced'

# Marketing & croissance (25/11, SEO/AEO): the date the home page last changed (its sources: src/ and this script), for
# « dateModified » (Google and the AIs prefer pages that say when they were updated): the last commit, or today if not committed
def _home_modified():
    import subprocess
    try:
        g = lambda *a: subprocess.run(['git', *a, '--', 'src', 'build_site.py'], cwd=root, capture_output=True, text=True, timeout=20).stdout.strip()
        return datetime.date.today().isoformat() if g('status', '--porcelain') else (g('log', '-1', '--format=%cs') or datetime.date.today().isoformat())
    except Exception:
        return datetime.date.today().isoformat()
HOME_MODIFIED = _home_modified()

def meta(lang):
    P = PAGE[lang]; url = URL + P['path']; other = 'en' if lang == 'fr' else 'fr'
    # Marketing & croissance (13/11): the share picture in the page's language (og.png carries a French line; og-en.png, the same
    # picture in English, from site_drafts/make_og_en.py)
    og = URL + ('/og-en.png' if lang == 'en' else '/og.png')
    LD = {'@context': 'https://schema.org', '@graph': [
      {'@type': 'WebApplication', 'name': 'Stalak', 'url': url, 'applicationCategory': 'MultimediaApplication', 'operatingSystem': 'Web, iOS, Android, macOS, Windows',
       'inLanguage': lang, 'isAccessibleForFree': True,
       # Marketing & croissance : les offres en dollars (comme la page Tarifs) ; Paddle ajoute les taxes au paiement
       'offers': [dict({'@type': 'Offer', 'name': n, 'price': pr, 'priceCurrency': 'USD', 'url': URL + ('/fr/tarifs' if lang == 'fr' else '/pricing')},
                       **({'priceSpecification': {'@type': 'UnitPriceSpecification', 'price': pr, 'priceCurrency': 'USD', 'billingDuration': d}} if d else {}))
                  for n, pr, d in [('Free', '0', None), ('Stalak Pro (monthly)', '7.99', 'P1M'), ('Stalak Pro (yearly)', '49.99', 'P1Y'),
                                   ('Creator Plus (monthly)', '14.99', 'P1M'), ('Creator Plus (yearly)', '99.99', 'P1Y')]],
       'description': P['ld'], 'image': og, 'creator': {'@type': 'Organization', 'name': 'Alaska'}, 'publisher': {'@id': URL + '/#organization'}, 'dateModified': HOME_MODIFIED},
      {'@type': 'WebSite', '@id': URL + '/#website', 'name': 'Stalak', 'alternateName': ['Stalak app', 'stalak.app'], 'url': url, 'inLanguage': lang, 'publisher': {'@id': URL + '/#organization'}, 'dateModified': HOME_MODIFIED},
      dict({'@type': 'Organization', '@id': URL + '/#organization', 'name': 'Stalak', 'alternateName': 'stalak.app', 'url': URL + '/',
            'logo': {'@type': 'ImageObject', 'url': URL + '/icons/icon-512.png', 'width': 512, 'height': 512}, 'image': og,
            'description': P['ld'], 'email': EMAIL or None, 'parentOrganization': {'@type': 'Organization', 'name': 'Alaska'}},
           **({'sameAs': list(SOCIAL.values())} if SOCIAL else {})),
    ]}
    for n in LD['@graph']:
        for k in [k for k, v in n.items() if v is None]: del n[k]
    return f'''<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="description" content="{H.escape(P['desc'])}">
<meta name="theme-color" content="#1f6fd6">
<meta name="google-adsense-account" content="ca-pub-2317718448369640">
<link rel="canonical" href="{url}">
<link rel="alternate" hreflang="fr" href="{URL}/fr/">
<link rel="alternate" hreflang="en" href="{URL}/">
<link rel="alternate" hreflang="x-default" href="{URL}/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Stalak">
<meta property="og:locale" content="{P['locale']}">
<meta property="og:locale:alternate" content="{PAGE[other]['locale']}">
<meta property="og:title" content="{H.escape(P['title'])}">
<meta property="og:description" content="{H.escape(P['desc'])}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{og}">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="{og}">
<link rel="manifest" href="{'/fr/manifest.webmanifest' if lang == 'fr' else '/manifest.webmanifest'}">
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Stalak">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<script type="application/ld+json">{json.dumps(LD, ensure_ascii=False)}</script>
'''
# Marketing & croissance (01/11) : l'accueil anglais propose « Version française → » à un téléphone réglé en français, sans redirection
# automatique (Google visite le site en anglais, depuis les États-Unis : il doit voir les deux versions). Un appui sur × le ferme
# pour de bon ; un appui sur le lien retient le français (même clé que le bouton FR / EN de l'app). Le bandeau se cache si la page
# passe en français, ou si une langue a déjà été choisie (bouton FR / EN, ?lang=).
FR_HINT_HTML = ('<div class="frhint" id="frHint" lang="fr" hidden><a href="/fr/" id="frHintGo">Version française <span aria-hidden="true">→</span></a>'
                '<button type="button" id="frHintX" aria-label="Fermer">×</button></div>\n')
FR_HINT_JS = r'''<script>/* Marketing & croissance: « Version française → » on the English home, for a phone set to French */
(function(){var b=document.getElementById('frHint');if(!b)return;
function get(k){try{return localStorage.getItem(k)}catch(e){return null}}
function set(k,v){try{localStorage.setItem(k,v)}catch(e){}}
var l=(navigator.languages&&navigator.languages[0])||navigator.language||'';if(!/^fr\b/i.test(l))return;
function show(){var q;try{q=new URLSearchParams(location.search).has('lang')}catch(e){q=false}
b.hidden=!(document.documentElement.lang==='en'&&get('stalak:lang')==null&&get('stalak:frHint')==null&&!q);}
show();try{new MutationObserver(show).observe(document.documentElement,{attributes:true,attributeFilter:['lang']})}catch(e){}
document.getElementById('frHintX').onclick=function(){set('stalak:frHint','0');b.hidden=true;};
document.getElementById('frHintGo').onclick=function(){set('stalak:lang',JSON.stringify('fr'));this.href='/fr/'+location.hash;};})();</script>
'''
# the app installed from the English home opens /?app=1 (site_src/manifest.webmanifest; installed from /fr/, it opens /fr/?app=1 with
# site_src/fr/manifest.webmanifest): on a phone set to French, with no language chosen yet, /?app=1 stays in French as before the
# move (the app reads ?lang= first) — for the apps installed before 01/11; runs before the app
PWA_LANG_JS = r'''<script>/* Marketing & croissance: the installed app keeps French on a French phone (no language chosen yet) */
(function(){try{var q=new URLSearchParams(location.search);if(q.has('lang')||localStorage.getItem('stalak:lang')!=null)return;
var app=q.get('app')==='1'||navigator.standalone===true||(window.matchMedia&&matchMedia('(display-mode: standalone)').matches);
var l=(navigator.languages&&navigator.languages[0])||navigator.language||'';
if(app&&/^fr\b/i.test(l)){q.set('lang','fr');history.replaceState(history.state,'',location.pathname+'?'+q.toString()+location.hash);}}catch(e){}})();</script>
'''
css += '\n.frhint{display:flex;align-items:center;gap:2px;width:max-content;max-width:calc(100% - 32px);margin:0 auto 12px;background:#fff;color:var(--ink,#0a0d14);border:2px solid var(--ink,#0a0d14);border-radius:999px;box-shadow:0 3px 0 var(--ink,#0a0d14);font-size:14.5px;font-weight:600;line-height:1.2}.frhint[hidden]{display:none}.frhint a{color:inherit;text-decoration:none;padding:10px 4px 10px 16px}.frhint button{flex:none;width:40px;height:40px;border:0;border-radius:50%;background:transparent;color:inherit;font:inherit;font-size:20px;line-height:1;cursor:pointer}\n'
def page(lang, body):
    h = meta(lang) + head.replace('<title>Stalak</title>', '<title>' + H.escape(PAGE[lang]['title']) + '</title>')
    # the banner and its script come first in the page: shown or not before the first paint, so nothing moves afterwards
    if lang == 'en': h, body = h + PWA_LANG_JS, FR_HINT_HTML + FR_HINT_JS + body
    body = '<script>window.STALAK_M2=' + json.dumps('/assets/' + ASSETS['mobile2']) + ';window.STALAK_M3=' + json.dumps('/assets/' + ASSETS['mobile3']) + ';window.STALAK_M4=' + json.dumps('/assets/' + ASSETS['mobile4']) + ';' + SPLASH_BOOT % (json.dumps(GSAP_URL), json.dumps('/assets/' + ASSETS['splash'])) + '</script>\n' + body   # first in <body>: the curtain is there before the first picture
    tail = ''
    # App & montage (audit 6/11, n° 10): the app's code is no longer written inside the page (860 KB downloaded again at every
    # visit, the page being « no-cache »): two files whose name carries their version (/assets/…), kept a year by the browser
    h = h.replace('href="/fonts/fonts.css"', 'href="/fonts/fonts.css?v=' + _v['fonts/fonts.css'] + '"')
    return ('<!doctype html>\n<html lang="' + lang + '">\n<head>\n' + h + '<style>' + css + '</style>\n</head>\n<body>\n' + body
            + app_loader() + tail + '</body>\n</html>\n')

def app_loader():
    """App & montage (audit 13/11, n° 1: on a slow phone the biggest text of the home page showed at 4.5 s, cible 2.5 s).
    The page is drawn first; the two video libraries and the app (360 KB, kept a year: /assets/… carry their version) are
    loaded right after that first picture, in their order (async = false). Then the home video starts, unless the person
    asked her phone for less motion (it stays on its first picture)."""
    files = VENDOR + ['/assets/' + ASSETS['account'], '/assets/' + ASSETS['app'], '/assets/' + ASSETS['tiktok']]
    return ('<script>/* App & montage: the app after the first picture (audit 13/11) */(function(){var L=' + json.dumps(files) + ';'
            'function go(){L.forEach(function(s){var e=document.createElement("script");e.src=s;e.async=false;document.body.appendChild(e);});}'
            'requestAnimationFrame(function(){setTimeout(go,0);});'
            'function vid(){var v=document.querySelector("video.hero-v");if(!v||!v.offsetParent)return;var calm=false;try{calm=matchMedia("(prefers-reduced-motion: reduce)").matches;}catch(e){}'
            'if(calm)return;v.preload="auto";var p=v.play();if(p&&p.catch)p.catch(function(){});}'
            'if(document.readyState==="complete")setTimeout(vid,0);else addEventListener("load",function(){setTimeout(vid,0);});'
            '})();</script>\n')

if out.exists(): shutil.rmtree(out)
shutil.copytree(extra, out)
(out / 'pricing.css').write_text(PRICING_CSS, encoding='utf-8')
# the stylesheets of the static pages get a version in their address: a browser never keeps an old one
import hashlib
# the footer of the static pages (src/footer.py): its style goes into /site.css, which all of them load
(out / 'site.css').write_text((out / 'site.css').read_text(encoding='utf-8') + '\n' + (src / 'footer.css').read_text(encoding='utf-8') + '\n' + (src / 'fx.css').read_text(encoding='utf-8') + '\n' + (src / 'bands.css').read_text(encoding='utf-8'), encoding='utf-8')
_v = {n: hashlib.sha1((out / n).read_bytes()).hexdigest()[:8] for n in ('pricing.css', 'site.css', 'fonts/fonts.css') if (out / n).exists()}
for f in list(out.glob('*.html')) + list((out / 'fr').glob('*.html')):
    t = f.read_text(encoding='utf-8'); t2 = t
    for n, v in _v.items(): t2 = t2.replace('href="/' + n + '"', 'href="/' + n + '?v=' + v + '"')
    if t2 != t: f.write_text(t2, encoding='utf-8')
# App & montage (audit 6/11, n° 10): the app's code and the account's, as versioned files
(out / 'assets').mkdir(exist_ok=True)
ASSETS = {}
for _k, _code in (('app', js), ('account', ACCOUNT_JS), ('tiktok', TIKTOK_JS), ('splash', (src / 'splash.js').read_text(encoding='utf-8')),
                  ('mobile2', (src / 'mobile2.js').read_text(encoding='utf-8')),   # refonte mobile, lot 2 (phones only, loaded by the app)
                  ('mobile3', (src / 'mobile3.js').read_text(encoding='utf-8')),   # refonte mobile, lot 3: the editor and the camera (phones only)
                  ('mobile4', (src / 'mobile4.js').read_text(encoding='utf-8'))):   # refonte mobile, lot 4: tutorial, help, paywall, 1 € offer, thanks (phones only)
    _b = _code.encode('utf-8'); _n = _k + '.' + hashlib.sha1(_b).hexdigest()[:10] + '.js'
    (out / 'assets' / _n).write_bytes(_b); ASSETS[_k] = _n
(out / 'index.html').write_text(page('en', markup_en), encoding='utf-8')
(out / 'fr').mkdir(exist_ok=True)
(out / 'fr' / 'index.html').write_text(page('fr', markup), encoding='utf-8')

# 4. static pages: legal pages (to complete with the publisher's details: see the [ … ] parts), pricing, guides, comparison page.
#    English at the root, French in fr/. Marketing & croissance : the example video of the guides only shows if
#    site_src/demo/edit.mp4 exists (a real Stalak edit; 06/11: the before / after of the guides, audit point 13).
DEMO = (extra / 'demo' / 'edit.mp4').exists()
for p in [f for f in list(out.glob('*.html')) + list((out / 'fr').glob('*.html')) if f.name != 'index.html']:
    fr = p.parent.name == 'fr'
    seller = SELLER or ((BIZ['nom'] + (', entrepreneur individuel (EI)' if fr else ', sole proprietor (EI, France)')) if BIZ_ON else
                        ('l’éditeur du site, un particulier' if fr else 'the publisher of the site, a private individual'))
    t = p.read_text(encoding='utf-8').replace('{{EMAIL}}', EMAIL or ('[ADRESSE E-MAIL]' if fr else '[E-MAIL ADDRESS]')).replace('{{URL}}', URL).replace('{{SELLER}}', seller)
    # Juridique & business: <!--PRO-->…<!--/PRO--> shown once vendeur.json is filled, <!--PARTICULIER-->…<!--/PARTICULIER--> before;
    # <!--MED-->…<!--/MED--> once the mediator is filled, <!--NOMED-->…<!--/NOMED--> before.
    for on, yes, no in ((BIZ_ON, 'PRO', 'PARTICULIER'), (MED_ON, 'MED', 'NOMED')):
        keep, drop = (yes, no) if on else (no, yes)
        t = re.sub(r'<!--' + drop + r'-->.*?<!--/' + drop + r'-->', '', t, flags=re.S).replace('<!--' + keep + '-->', '').replace('<!--/' + keep + '-->', '')
    for k, v in (('NOM', BIZ['nom']), ('SIRET', BIZ['siret']), ('ADRESSE', BIZ['adresse']), ('TEL', BIZ['telephone']),
                 ('MED_NOM', MED['nom']), ('MED_SITE', MED['site'])):
        t = t.replace('{{' + k + '}}', H.escape(v))
    t = t.replace('<!--DEMO-->', '').replace('<!--/DEMO-->', '') if DEMO else re.sub(r'<!--DEMO-->.*?<!--/DEMO-->', '', t, flags=re.S)
    # (22/11) one customer review under each plan of Pricing: the first one of avis.json for that plan, or nothing
    for _k in PLAN_NAME:
        _r = next((r for r in AVIS if r['formule'] == _k), None)
        t = t.replace('<!--AVIS:' + _k + '-->', rv_item(_r, 'fr' if fr else 'en', 'div', 'pr-rv') if _r else '')
    assert '{{' not in t, 'a {{…}} is left in ' + str(p)
    # the footer: the same on every page (src/footer.py), in the page's language, with « Français / English » to the same page
    assert t.count('<footer>') == 1 and t.count('</footer>') == 1, 'one <footer> expected in ' + str(p)
    t = re.sub(r'<footer>.*?</footer>', lambda m: FOOT.render('fr' if fr else 'en', page=('/fr/' if fr else '/') + p.stem), t, flags=re.S)
    if '</body>' in t: t = t.replace('</body>', FX_TAG + '</body>', 1)   # (23/11) blocks that come up softly, snow on the main buttons
    p.write_text(t, encoding='utf-8')
# Comptes (23/11, owner's decisions): the cookie banner and the measuring tools (src/consent.js), on every page of stalak.app
# (never in the claude.ai version, build.py). It shows nothing and loads nothing until Clarity / GA4 / TikTok are set
# (/api/config measure), and nothing at all before « Accepter ».
_cb = (src / 'consent.js').read_text(encoding='utf-8').encode('utf-8'); _cn = 'consent.' + hashlib.sha1(_cb).hexdigest()[:10] + '.js'
(out / 'assets' / _cn).write_bytes(_cb)
_ctag = '<script defer src="/assets/' + _cn + '"></script>'
for _f in list(out.glob('*.html')) + list((out / 'fr').glob('*.html')) + list(out.glob('aide/**/*.html')) + list((out / 'fr').glob('aide/**/*.html')):
    _t = _f.read_text(encoding='utf-8')
    if '/assets/consent.' in _t or '</head>' not in _t: continue
    # (24/11) the 2 app pages: no « defer » script in the HTML (audit 13/11, n° 1): consent.js joins the scripts the page adds
    # right after its first picture, first of the list (async = false keeps the order: it is there before the app)
    if 'var L=["' in _t: _f.write_text(_t.replace('var L=["', 'var L=["/assets/' + _cn + '", "', 1), encoding='utf-8'); continue
    _f.write_text(_t.replace('</head>', _ctag + '\n</head>', 1), encoding='utf-8')
(out / 'robots.txt').write_text(f'User-agent: *\nAllow: /\nSitemap: {URL}/sitemap.xml\n', encoding='utf-8')
today = datetime.date.today().isoformat()
# plan du site : l'anglais à la racine, le français dans /fr/ ; chaque page listée doit exister (pas de lien mort envoyé à Google)
def _page_file(u):
    s = u.strip('/')
    return out / (s + '/index.html' if u.endswith('/') and s else (s + '.html' if s else 'index.html'))
_listed = ['/', '/fr/'] + [u for pair in SITEMAP_PAIRS for u in pair] + ['/' + s for s, _ in GUIDES]
_gone = [u for u in _listed if not _page_file(u).exists()]
assert not _gone, 'sitemap: no page for ' + ', '.join(_gone)
def _alts(fr, en): return ''.join(f'<xhtml:link rel="alternate" hreflang="{l}" href="{URL}{u}"/>' for l, u in [('fr', fr), ('en', en), ('x-default', en)])
# lastmod = the date the page's source last changed (Bing and Google only trust a true date): the last commit touching it,
# or today if it is changed and not committed yet (or if git is not there). The two app pages follow src/ and this script.
import subprocess
def _lastmod(u):
    srcs = ['src', 'build_site.py'] if u in ('/', '/fr/') else ['site_src' + u + '.html']
    try:
        g = lambda *a: subprocess.run(['git', *a, '--', *srcs], cwd=root, capture_output=True, text=True, timeout=20).stdout.strip()
        return today if g('status', '--porcelain') else (g('log', '-1', '--format=%cs') or today)
    except Exception:
        return today
(out / 'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">'
    + ''.join(f'<url><loc>{URL}{u}</loc><lastmod>{_lastmod(u)}</lastmod>{_alts(fr, en)}</url>' for fr, en in [('/fr/', '/')] + SITEMAP_PAIRS for u in (en, fr))
    + ''.join(f'<url><loc>{URL}/{s}</loc><lastmod>{_lastmod("/" + s)}</lastmod></url>' for s, _ in GUIDES) + '</urlset>\n', encoding='utf-8')
n = sum(1 for _ in out.rglob('*') if _.is_file()); size = sum(f.stat().st_size for f in out.rglob('*') if f.is_file())
print('site built in', out, '·', n, 'files ·', round(size / 1048576, 1), 'MB')
