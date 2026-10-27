"""Assembles src/ into shuffle-lab.html (the page that gets published)."""
import pathlib, sys
root = pathlib.Path(__file__).parent; src = root / 'src'
head = (src/'head.html').read_text(encoding='utf-8')
css = (src/'style.css').read_text(encoding='utf-8')
theme = src/'theme.css'
if theme.exists(): css += '\n/* ---- theme ---- */\n' + theme.read_text(encoding='utf-8')
markup = (src/'markup.html').read_text(encoding='utf-8')
js = (src/'app.js').read_text(encoding='utf-8')
out = head + '<style>' + css + '</style>' + markup + '<script>' + js + '</script>\n'
dest = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else root / 'shuffle-lab.html'
dest.write_text(out, encoding='utf-8'); print('built', dest, len(out), 'bytes')
