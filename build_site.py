"""Builds the public website (site/) from the same sources as the claude.ai page.
   python3 build_site.py [--email contact@…] [--domain stalak.app]
   Differences with the claude.ai page: fonts and libraries served by the site itself (no Google / jsDelivr at load time),
   proper <head> (description, sharing preview), legal pages, cache and security headers for Cloudflare Pages.
   Two pages: / in French and /en/ in English (same app; the English page has its texts written in English in the HTML
   itself, for search engines, and the app starts in English there unless the person picked FR with the switch)."""
import pathlib, re, shutil, sys, json, html as H, datetime

root = pathlib.Path(__file__).parent
src, extra, out = root / 'src', root / 'site_src', root / 'public'
args = sys.argv[1:]
def arg(name, default=''):
    return args[args.index(name) + 1] if name in args else default
EMAIL = arg('--email')
DOMAIN = arg('--domain', 'stalak.app')
SELLER = arg('--seller')   # legal name of the seller (company or sole proprietor), shown in the terms of sale
URL = 'https://' + DOMAIN
# Marketing & croissance : comptes officiels de Stalak, déclarés à Google (schema.org « sameAs ») et en liens dans le pied de page.
# Mettre l'adresse complète du profil (ex. 'https://www.instagram.com/<compte>/') ; une case vide n'apparaît nulle part.
SOCIAL = {
    'Instagram': 'https://www.instagram.com/stalak_app/',
    'TikTok': 'https://www.tiktok.com/@stalak_app',
    'YouTube': '',
}
SOCIAL = {k: v for k, v in SOCIAL.items() if v}
# pages FR / EN du plan du site (en plus de l'accueil)
SITEMAP_PAIRS = [('/tarifs', '/en/pricing'), ('/conditions', '/en/terms'), ('/remboursement', '/en/refunds'),
                 ('/confidentialite', '/en/privacy'), ('/mentions-legales', '/en/legal-notice')]

head = (src / 'head.html').read_text(encoding='utf-8')
css = (src / 'style.css').read_text(encoding='utf-8') + '\n/* ---- theme ---- */\n' + (src / 'theme.css').read_text(encoding='utf-8') + '\n' + (src / 'pricing.css').read_text(encoding='utf-8')
PRICING_CSS = (src / 'pricing.css').read_text(encoding='utf-8')   # plan cards: in the app's Stalak Pro page and in /pricing.css for /tarifs
markup = (src / 'markup.html').read_text(encoding='utf-8')
# Marketing & croissance : la vidéo du premier écran n'apparaît que si site_src/demo/hero.mp4 existe (une vraie vidéo finie, 9:16, 5 à 8 s, sans son)
markup = re.sub(r'<!--HEROVIDEO-->.*?<!--/HEROVIDEO-->', '', markup, flags=re.S) if not (extra / 'demo' / 'hero.mp4').exists() else markup.replace('<!--HEROVIDEO-->', '').replace('<!--/HEROVIDEO-->', '')
js = (src / 'app.js').read_text(encoding='utf-8')
ACCOUNT_JS = (src / 'account.js').read_text(encoding='utf-8')   # stalak.app only: sign in, Stalak Pro

# 1. head: fonts and libraries from the site itself
# favicon: real files (Google Search cannot read an icon written inside the page as data:)
head = re.sub(r'<link rel="icon" type="image/svg\+xml" href="data:[^"]*">',
              '<link rel="icon" href="/favicon.ico" sizes="48x48">\n<link rel="icon" type="image/svg+xml" href="/icons/icon.svg">\n<link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png">', head)
head = re.sub(r'<link rel="preconnect" href="https://fonts.googleapis.com">\n?', '', head)
head = re.sub(r'<link rel="stylesheet" href="https://fonts.googleapis.com[^"]*">', '<link rel="stylesheet" href="/fonts/fonts.css">', head)
head = head.replace('https://cdn.jsdelivr.net/npm/mp4-muxer@5.1.3/build/mp4-muxer.min.js', '/vendor/mp4-muxer.min.js')
head = head.replace('https://cdn.jsdelivr.net/npm/mp4box@0.5.2/dist/mp4box.all.min.js', '/vendor/mp4box.all.min.js')
assert 'googleapis' not in head and 'jsdelivr' not in head, 'an outside resource is left in the head'
head = re.sub(r'<meta charset="utf-8">\n?|<meta name="viewport"[^>]*>\n?', '', head)
assert '<title>Stalak</title>' in head

# the texts of each page
PAGE = {
  'fr': {
    'path': '/', 'locale': 'fr_FR',
    'title': 'Stalak — ton playback monté sur le rythme',
    'desc': 'Monte ton playback sur le rythme : importe ton son et tes prises, Stalak coupe en gardant la synchro des lèvres. Gratuit, sans téléchargement ni inscription.',
    'ld': 'Stalak est un site de montage de playback (lip sync) : il coupe tes prises sur le rythme de ton son, garde la synchro des lèvres parfaite et exporte pour TikTok, Reels, Shorts et YouTube.',
    'about': """
    <h2 id="aboutT">Stalak, c’est quoi ?</h2>
    <p><strong>Stalak</strong> est un site de <strong>montage de playback</strong> (lip sync) :
    tu importes ton son et plusieurs vidéos où tu chantes dessus, et Stalak coupe sur le rythme en passant d’une prise à l’autre,
    avec une <strong>synchro des lèvres parfaite</strong>. Tu exportes pour <strong>TikTok, Instagram Reels, YouTube Shorts</strong> ou un clip <strong>YouTube</strong> en 16:9.</p>
    <p><strong>Aucun téléchargement, aucune inscription : 3 étapes et c’est posté.</strong> Stalak marche dans ton navigateur, sur iPhone, Android ou ordinateur, gratuitement et sans créer de compte.</p>
    <p><strong>Comment faire un playback avec Stalak :</strong></p>
    <ul>
      <li>Importe ton son.</li>
      <li>Ajoute plusieurs prises où tu chantes dessus, filmées avant ou directement avec la caméra de Stalak.</li>
      <li>Stalak coupe sur le rythme, passe d’une prise à l’autre, et tu exportes ta vidéo.</li>
    </ul>
    <p><strong>Ce que tu peux faire :</strong></p>
    <ul>
      <li>Coupes automatiques sur les temps, sur les mots ou par mesure.</li>
      <li>Paroles à l’écran en phrase entière ; mot par mot et karaoké avec Stalak Pro.</li>
      <li>Paroles écrites et calées automatiquement à partir de ta voix (Stalak Pro).</li>
      <li>Mode Clip 16:9 pour YouTube, avec effets : flash, zoom, secousse, ralenti… (Stalak Pro)</li>
      <li>Packs de 5 à 30 vidéos aux coupes différentes du même son, dès 2 prises (Creator Plus).</li>
      <li>Le montage se fait dans ton navigateur, sur iPhone, Android ou ordinateur : tes vidéos restent sur ton appareil, sauf tes projets en ligne, enregistrés automatiquement avec Creator Plus, et le son envoyé pour tes paroles automatiques.</li>
    </ul>
  """,
    'legal': '<a href="/tarifs">Tarifs</a> · <a href="/conditions">Conditions</a> · <a href="/remboursement">Remboursement</a> · <a href="/confidentialite">Confidentialité</a> · <a href="/mentions-legales">Mentions légales</a>',
  },
  'en': {
    'path': '/en/', 'locale': 'en_US',
    'title': 'Stalak: free lip-sync video editor that cuts your takes to the beat',
    'desc': 'Drop in your song and a few takes of you rapping or singing. Stalak cuts between them on the beat, perfectly in sync. Free, no download, no sign-up.',
    'ld': 'Stalak is a free, browser-based lip-sync video editor for rappers and singers. It cuts between your takes on the beat of your song, keeps the lip sync tight and exports for TikTok, Reels, YouTube Shorts and YouTube.',
    'about': """
    <h2 id="aboutT">What is Stalak?</h2>
    <p><strong>Stalak</strong> is a <strong>lip-sync video editor</strong> for rappers and singers.
    Drop in your song and a few videos of you performing it, and Stalak cuts between your takes on the beat,
    with <strong>the lip sync locked in</strong>. Export for <strong>TikTok, Instagram Reels and YouTube Shorts</strong>, or a full 16:9 music video for <strong>YouTube</strong>.</p>
    <p><strong>No download. No sign-up. 3 steps and you’re ready to post.</strong> Stalak runs right in your browser on iPhone, Android or desktop. It’s free, and you don’t need an account.</p>
    <p><strong>How to make a lip-sync video with Stalak:</strong></p>
    <ul>
      <li>Upload your song.</li>
      <li>Add a few takes of you performing it. Film them ahead of time, or right in Stalak’s camera.</li>
      <li>Stalak cuts between your takes on the beat. Hit export and post.</li>
    </ul>
    <p><strong>What you can do:</strong></p>
    <ul>
      <li>Auto cuts on the beat, on every word or every bar.</li>
      <li>On-screen lyrics, one line at a time; word-by-word and karaoke styles with Stalak Pro.</li>
      <li>Auto lyrics: Stalak writes and syncs your lyrics from your vocals (Stalak Pro).</li>
      <li>16:9 music video mode for YouTube, with effects like flash, zoom, shake and slow-mo (Stalak Pro).</li>
      <li>Video packs: 5 to 30 differently cut videos from one song, from just 2 takes (Creator Plus).</li>
      <li>Everything happens in your browser, so your videos stay on your device. The only exceptions: your cloud projects, saved automatically with Creator Plus, and the audio sent for auto lyrics.</li>
    </ul>
  """,
    'legal': '<a href="/en/pricing">Pricing</a> · <a href="/en/terms">Terms</a> · <a href="/en/refunds">Refunds</a> · <a href="/en/privacy">Privacy</a> · <a href="/en/legal-notice">Legal notice</a>',
  },
}

# Marketing & croissance : liens vers les comptes officiels dans le pied de page (rel="me")
# (31/10) shown as icons next to the legal links: the glyphs come from Simple Icons (site_src/icons/social/, CC0), white on the ink
SOCIAL_HTML = ''
if SOCIAL:
    def _glyph(n):
        f = extra / 'icons' / 'social' / (n.lower() + '.svg')
        if not f.exists(): return H.escape(n)
        sv = f.read_text(encoding='utf-8')
        sv = re.sub(r'<title>.*?</title>', '', sv).replace('role="img" ', '')
        return sv.replace('<svg ', '<svg aria-hidden="true" focusable="false" fill="currentColor" ', 1)
    SOCIAL_HTML = '<div class="social-links">' + ''.join(
        f'<a href="{H.escape(u)}" rel="me noopener" target="_blank" aria-label="{n} @stalak_app" title="{n} @stalak_app">{_glyph(n)}</a>'
        for n, u in SOCIAL.items()) + '</div>'
# 2. the app: contact address for the help bubble; « Stalak, c'est quoi ? » and the links to the legal pages under the « by Alaska » badge
if EMAIL:
    assert "const SUPPORT_EMAIL = '';" in js
    js = js.replace("const SUPPORT_EMAIL = '';", 'const SUPPORT_EMAIL = ' + json.dumps(EMAIL) + ';')
a = '<div class="byalaska" id="byAlaska">by Alaska</div>'
assert a in markup
markup = markup.replace(a, '<section class="about" aria-labelledby="aboutT" data-i18n="site.about">' + PAGE['fr']['about'] + '</section>\n  ' + a)
# the legal links go in the footer, next to the FR / EN switch (the claude.ai page has the footer with the switch only)
f = '<footer class="sitefoot" id="siteFoot">'
assert f in markup
markup = markup.replace(f, f + SOCIAL_HTML + '<nav class="legal-links" data-i18n="site.legal">' + PAGE['fr']['legal'] + '</nav>')
css += '\n.about{align-self:center;max-width:760px;width:100%;color:#fff;font-size:14.5px;line-height:1.55;margin-top:18px}.about h2{font:400 22px/1.2 var(--display);margin:0 0 6px;color:#fff;text-shadow:0 2px 0 var(--ink)}.about p{margin:0 0 8px}.about ul{margin:0 0 8px;padding-left:20px}.about strong{font-weight:700}\n.legal-links{font-size:13px;color:#fff;opacity:.9}.legal-links a{color:#fff}\n.social-links{display:flex;gap:10px;justify-content:center}.social-links a{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:50%;background:var(--ink,#0a0d14);color:#fff;border:2px solid #fff;box-shadow:0 3px 0 rgba(10,13,20,.35);transition:transform .15s}.social-links a:hover,.social-links a:focus-visible{transform:translateY(-2px)}.social-links svg{width:20px;height:20px}\n'

# 3. languages: the dictionaries are in app.js (between /*@EN*/ … /*EN@*/ and /*@FR*/ … /*FR@*/); the French of the page's
#    fixed texts is read from the markup (data-i18n, data-i18n-attr) and given to the app, so that the English page can
#    switch back to French; the English page gets its texts in English in the HTML
def block(name):
    m = re.search(r'/\*@' + name + r'\*/(.*?)/\*' + name + r'@\*/', js, re.S)
    assert m, 'no ' + name + ' block in app.js'
    return m
EN = json.loads(block('EN').group(1)); FR = json.loads(block('FR').group(1))
EN.update({'doc.title': PAGE['en']['title'], 'site.about': PAGE['en']['about'], 'site.legal': PAGE['en']['legal']})
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
markup_en, n_en = localize(markup, EN)
markup_en = markup_en.replace('data-lang="fr" lang="fr" aria-pressed="true"', 'data-lang="fr" lang="fr" aria-pressed="false"').replace('data-lang="en" lang="en" aria-pressed="false"', 'data-lang="en" lang="en" aria-pressed="true"')
assert n_en == len(TAG.findall(markup)), 'some texts of the English page were not replaced'

def meta(lang):
    P = PAGE[lang]; url = URL + P['path']; other = 'en' if lang == 'fr' else 'fr'
    LD = {'@context': 'https://schema.org', '@graph': [
      {'@type': 'WebApplication', 'name': 'Stalak', 'url': url, 'applicationCategory': 'MultimediaApplication', 'operatingSystem': 'Web, iOS, Android, macOS, Windows',
       'inLanguage': lang, 'isAccessibleForFree': True,
       # Marketing & croissance : les offres en dollars (comme la page Tarifs) ; Paddle ajoute les taxes au paiement
       'offers': [dict({'@type': 'Offer', 'name': n, 'price': pr, 'priceCurrency': 'USD', 'url': URL + ('/tarifs' if lang == 'fr' else '/en/pricing')},
                       **({'priceSpecification': {'@type': 'UnitPriceSpecification', 'price': pr, 'priceCurrency': 'USD', 'billingDuration': d}} if d else {}))
                  for n, pr, d in [('Free', '0', None), ('Stalak Pro (monthly)', '7.99', 'P1M'), ('Stalak Pro (yearly)', '49.99', 'P1Y'),
                                   ('Creator Plus (monthly)', '14.99', 'P1M'), ('Creator Plus (yearly)', '99.99', 'P1Y')]],
       'description': P['ld'], 'image': URL + '/og.png', 'creator': {'@type': 'Organization', 'name': 'Alaska'}, 'publisher': {'@id': URL + '/#organization'}},
      {'@type': 'WebSite', '@id': URL + '/#website', 'name': 'Stalak', 'alternateName': ['Stalak app', 'stalak.app'], 'url': url, 'inLanguage': lang, 'publisher': {'@id': URL + '/#organization'}},
      dict({'@type': 'Organization', '@id': URL + '/#organization', 'name': 'Stalak', 'alternateName': 'stalak.app', 'url': URL + '/',
            'logo': {'@type': 'ImageObject', 'url': URL + '/icons/icon-512.png', 'width': 512, 'height': 512}, 'image': URL + '/og.png',
            'description': P['ld'], 'email': EMAIL or None, 'parentOrganization': {'@type': 'Organization', 'name': 'Alaska'}},
           **({'sameAs': list(SOCIAL.values())} if SOCIAL else {})),
    ]}
    for n in LD['@graph']:
        for k in [k for k, v in n.items() if v is None]: del n[k]
    return f'''<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="description" content="{H.escape(P['desc'])}">
<meta name="theme-color" content="#1f6fd6">
<link rel="canonical" href="{url}">
<link rel="alternate" hreflang="fr" href="{URL}/">
<link rel="alternate" hreflang="en" href="{URL}/en/">
<link rel="alternate" hreflang="x-default" href="{URL}/en/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Stalak">
<meta property="og:locale" content="{P['locale']}">
<meta property="og:locale:alternate" content="{PAGE[other]['locale']}">
<meta property="og:title" content="{H.escape(P['title'])}">
<meta property="og:description" content="{H.escape(P['desc'])}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{URL}/og.png">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="{URL}/og.png">
<link rel="manifest" href="/manifest.webmanifest">
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Stalak">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<script type="application/ld+json">{json.dumps(LD, ensure_ascii=False)}</script>
'''
def page(lang, body):
    h = meta(lang) + head.replace('<title>Stalak</title>', '<title>' + H.escape(PAGE[lang]['title']) + '</title>')
    return '<!doctype html>\n<html lang="' + lang + '">\n<head>\n' + h + '<style>' + css + '</style>\n</head>\n<body>\n' + body + '<script>' + ACCOUNT_JS + '</script>\n<script>' + js + '</script>\n</body>\n</html>\n'

if out.exists(): shutil.rmtree(out)
shutil.copytree(extra, out)
(out / 'pricing.css').write_text(PRICING_CSS, encoding='utf-8')
# the stylesheets of the static pages get a version in their address: a browser never keeps an old one
import hashlib
_v = {n: hashlib.sha1((out / n).read_bytes()).hexdigest()[:8] for n in ('pricing.css', 'site.css') if (out / n).exists()}
for f in list(out.glob('*.html')) + list((out / 'en').glob('*.html')):
    t = f.read_text(encoding='utf-8'); t2 = t
    for n, v in _v.items(): t2 = t2.replace('href="/' + n + '"', 'href="/' + n + '?v=' + v + '"')
    if t2 != t: f.write_text(t2, encoding='utf-8')
(out / 'index.html').write_text(page('fr', markup), encoding='utf-8')
(out / 'en').mkdir(exist_ok=True)
(out / 'en' / 'index.html').write_text(page('en', markup_en), encoding='utf-8')

# 4. legal pages (to complete with the publisher's details: see the [ … ] parts)
for name in ['mentions-legales.html', 'confidentialite.html', 'en/legal-notice.html', 'en/privacy.html', 'tarifs.html', 'conditions.html', 'remboursement.html', 'en/pricing.html', 'en/terms.html', 'en/refunds.html']:
    p = out / name
    p.write_text(p.read_text(encoding='utf-8').replace('{{EMAIL}}', EMAIL or ('[E-MAIL ADDRESS]' if name.startswith('en/') else '[ADRESSE E-MAIL]')).replace('{{URL}}', URL).replace('{{SELLER}}', SELLER or ('the publisher of the site, a private individual' if name.startswith('en/') else 'l’éditeur du site, un particulier')), encoding='utf-8')
(out / 'robots.txt').write_text(f'User-agent: *\nAllow: /\nSitemap: {URL}/sitemap.xml\n', encoding='utf-8')
today = datetime.date.today().isoformat()
alts = ''.join(f'<xhtml:link rel="alternate" hreflang="{l}" href="{u}"/>' for l, u in [('fr', URL + '/'), ('en', URL + '/en/'), ('x-default', URL + '/en/')])
(out / 'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">'
    + ''.join(f'<url><loc>{u}</loc><lastmod>{today}</lastmod>{alts}</url>' for u in [URL + '/', URL + '/en/']) + ''.join(f'<url><loc>{URL}{a}</loc><lastmod>{today}</lastmod><xhtml:link rel="alternate" hreflang="fr" href="{URL}{a}"/><xhtml:link rel="alternate" hreflang="en" href="{URL}{b}"/><xhtml:link rel="alternate" hreflang="x-default" href="{URL}{b}"/></url><url><loc>{URL}{b}</loc><lastmod>{today}</lastmod><xhtml:link rel="alternate" hreflang="fr" href="{URL}{a}"/><xhtml:link rel="alternate" hreflang="en" href="{URL}{b}"/><xhtml:link rel="alternate" hreflang="x-default" href="{URL}{b}"/></url>' for a, b in SITEMAP_PAIRS) + '</urlset>\n', encoding='utf-8')
n = sum(1 for _ in out.rglob('*') if _.is_file()); size = sum(f.stat().st_size for f in out.rglob('*') if f.is_file())
print('site built in', out, '·', n, 'files ·', round(size / 1048576, 1), 'MB')
