"""Assembles src/ into shuffle-lab.html (the page that gets published)."""
import pathlib, sys
root = pathlib.Path(__file__).parent; src = root / 'src'
head = (src/'head.html').read_text(encoding='utf-8')
css = (src/'style.css').read_text(encoding='utf-8')
theme = src/'theme.css'
if theme.exists(): css += '\n/* ---- theme ---- */\n' + theme.read_text(encoding='utf-8')
pricing = src/'pricing.css'   # the plan cards of the Stalak Pro page (shared with /tarifs on the site)
if pricing.exists(): css += '\n' + pricing.read_text(encoding='utf-8')
markup = (src/'markup.html').read_text(encoding='utf-8')
import re
markup = re.sub(r'<!--HEROVIDEO-->.*?<!--/HEROVIDEO-->', '', markup, flags=re.S)  # Marketing : pas de vidéo d'exemple dans la version claude.ai
js = (src/'app.js').read_text(encoding='utf-8')
# the footer (src/footer.py, the same on every page): here its light version (no pages of the site on claude.ai); the app writes it
# again in English from the English dictionary when the language changes
sys.path.insert(0, str(src)); import footer, json
assert '<!--FOOTER-->' in markup and '/*@EN*/{' in js
markup = markup.replace('<!--FOOTER-->', footer.render('fr', lite=True, i18n='site.footer'))
js = js.replace('/*@EN*/{', '/*@EN*/{' + json.dumps('site.footer') + ': ' + json.dumps(footer.inner('en', lite=True), ensure_ascii=False).replace('</', '<\\/') + ', ', 1)
css += '\n' + (src/'footer.css').read_text(encoding='utf-8')
out = head + '<style>' + css + '</style>' + markup + '<script>' + js + '</script>\n'
dest = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else root / 'shuffle-lab.html'
dest.write_text(out, encoding='utf-8'); print('built', dest, len(out), 'bytes')
