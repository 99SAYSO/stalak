"""Builds the public website (site/) from the same sources as the claude.ai page.
   python3 build_site.py [--email contact@…] [--domain stalak.app]
   Differences with the claude.ai page: fonts and libraries served by the site itself (no Google / jsDelivr at load time),
   proper <head> (description, sharing preview), legal pages, cache and security headers for Cloudflare Pages."""
import pathlib, re, shutil, sys, json

root = pathlib.Path(__file__).parent
src, extra, out = root / 'src', root / 'site_src', root / 'public'
args = sys.argv[1:]
def arg(name, default=''):
    return args[args.index(name) + 1] if name in args else default
EMAIL = arg('--email')
DOMAIN = arg('--domain', 'stalak.app')
URL = 'https://' + DOMAIN

head = (src / 'head.html').read_text(encoding='utf-8')
css = (src / 'style.css').read_text(encoding='utf-8') + '\n/* ---- theme ---- */\n' + (src / 'theme.css').read_text(encoding='utf-8')
markup = (src / 'markup.html').read_text(encoding='utf-8')
js = (src / 'app.js').read_text(encoding='utf-8')

# 1. head: fonts and libraries from the site itself
head = re.sub(r'<link rel="preconnect" href="https://fonts.googleapis.com">\n?', '', head)
head = re.sub(r'<link rel="stylesheet" href="https://fonts.googleapis.com[^"]*">', '<link rel="stylesheet" href="/fonts/fonts.css">', head)
head = head.replace('https://cdn.jsdelivr.net/npm/mp4-muxer@5.1.3/build/mp4-muxer.min.js', '/vendor/mp4-muxer.min.js')
head = head.replace('https://cdn.jsdelivr.net/npm/mp4box@0.5.2/dist/mp4box.all.min.js', '/vendor/mp4box.all.min.js')
assert 'googleapis' not in head and 'jsdelivr' not in head, 'an outside resource is left in the head'
LD = {'@context': 'https://schema.org', '@graph': [
  {'@type': 'WebApplication', 'name': 'Stalak', 'url': URL + '/', 'applicationCategory': 'MultimediaApplication', 'operatingSystem': 'Web, iOS, Android, macOS, Windows',
   'inLanguage': 'fr', 'isAccessibleForFree': True, 'offers': {'@type': 'Offer', 'price': '0', 'priceCurrency': 'EUR'},
   'description': 'Stalak est un site de montage de playback (lip sync) : il coupe tes prises sur le rythme de ton son, garde la synchro des lèvres parfaite et exporte pour TikTok, Reels, Shorts et YouTube.',
   'image': URL + '/og.png', 'creator': {'@type': 'Organization', 'name': 'Alaska'}},
  {'@type': 'WebSite', 'name': 'Stalak', 'alternateName': 'Stalak app', 'url': URL + '/'},
]}
desc = 'Stalak monte ton playback sur le rythme : importe ton son et tes prises, la synchro des lèvres est parfaite, exporte pour TikTok, Reels, Shorts ou YouTube. Gratuit, dans le navigateur.'
meta = f'''<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="description" content="{desc}">
<meta name="theme-color" content="#1f6fd6">
<link rel="canonical" href="{URL}/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Stalak">
<meta property="og:title" content="Stalak — ton playback monté sur le rythme">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{URL}/">
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
head = re.sub(r'<meta charset="utf-8">\n?|<meta name="viewport"[^>]*>\n?', '', head)
head = meta + head.replace('<title>Stalak</title>', '<title>Stalak — ton playback monté sur le rythme</title>')

# 2. the app: contact address for the help bubble; links to the legal pages under the « by Alaska » badge
ABOUT = """<section class="about" aria-labelledby="aboutT">
    <h2 id="aboutT">Stalak, c’est quoi ?</h2>
    <p><strong>Stalak</strong> est un site gratuit de <strong>montage de playback</strong> (lip sync), dans l’esprit de Triller :
    tu importes ton son et plusieurs vidéos où tu chantes dessus, et Stalak coupe sur le rythme en passant d’une prise à l’autre,
    avec une <strong>synchro des lèvres parfaite</strong>. Tu exportes pour <strong>TikTok, Instagram Reels, YouTube Shorts</strong> ou un clip <strong>YouTube</strong> en 16:9.</p>
    <ul>
      <li>Coupes automatiques sur les temps, sur les mots ou par mesure.</li>
      <li>Paroles à l’écran calées sur la voix, style karaoké.</li>
      <li>Mode Clip avec effets : flash, zoom, secousse, ralenti…</li>
      <li>Packs de 5 à 30 vidéos différentes pour poster tous les jours.</li>
      <li>Tout se passe dans ton navigateur, sur iPhone, Android ou ordinateur : tes vidéos restent chez toi.</li>
    </ul>
  </section>
  """
if EMAIL:
    assert "const SUPPORT_EMAIL = '';" in js
    js = js.replace("const SUPPORT_EMAIL = '';", 'const SUPPORT_EMAIL = ' + json.dumps(EMAIL) + ';')
a = '<div class="byalaska" id="byAlaska">by Alaska</div>'
assert a in markup
markup = markup.replace(a, ABOUT + a + '\n  <nav class="legal-links"><a href="/mentions-legales">Mentions légales</a> · <a href="/confidentialite">Confidentialité</a></nav>')
css += '\n.about{align-self:center;max-width:760px;width:100%;color:#fff;font-size:14.5px;line-height:1.55;margin-top:18px}.about h2{font:400 22px/1.2 var(--display);margin:0 0 6px;color:#fff;text-shadow:0 2px 0 var(--ink)}.about p{margin:0 0 8px}.about ul{margin:0;padding-left:20px}.about strong{font-weight:700}\n.legal-links{align-self:center;font-size:13px;color:#fff;opacity:.85;margin-top:-4px}.legal-links a{color:#fff}\n'

if out.exists(): shutil.rmtree(out)
shutil.copytree(extra, out)
(out / 'index.html').write_text('<!doctype html>\n<html lang="fr">\n<head>\n' + head + '<style>' + css + '</style>\n</head>\n<body>\n' + markup + '<script>' + js + '</script>\n</body>\n</html>\n', encoding='utf-8')

# 3. legal pages (to complete with the publisher's details: see the [ … ] parts)
for name in ['mentions-legales.html', 'confidentialite.html']:
    p = out / name
    p.write_text(p.read_text(encoding='utf-8').replace('{{EMAIL}}', EMAIL or '[ADRESSE E-MAIL]').replace('{{URL}}', URL), encoding='utf-8')
(out / 'robots.txt').write_text(f'User-agent: *\nAllow: /\nSitemap: {URL}/sitemap.xml\n', encoding='utf-8')
(out / 'sitemap.xml').write_text(f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>{URL}/</loc><lastmod>{__import__('datetime').date.today().isoformat()}</lastmod></url></urlset>\n', encoding='utf-8')
n = sum(1 for _ in out.rglob('*') if _.is_file()); size = sum(f.stat().st_size for f in out.rglob('*') if f.is_file())
print('site built in', out, '·', n, 'files ·', round(size / 1048576, 1), 'MB')
