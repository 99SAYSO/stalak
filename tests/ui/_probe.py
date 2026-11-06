"""The tests' probe: `window.__ev(code)` runs code inside the app (its variables are not global). Written into a copy of the
built site, after the app's start (`applyLang();` at the end of app.js): inside the page (the claude.ai build, older builds)
or, since 6/11 (audit n° 10), in its own file /assets/app.<version>.js."""
import glob, os

MARK = 'applyLang();\n})();'
PROBE = 'applyLang();\nwindow.__ev = (s) => eval(s);\n})();'


def add_probe(site):
    done = 0
    for p in [os.path.join(site, 'index.html'), os.path.join(site, 'fr', 'index.html')] + glob.glob(os.path.join(site, 'assets', 'app.*.js')):
        if not os.path.exists(p): continue
        t = open(p, encoding='utf-8').read()
        if MARK in t: open(p, 'w', encoding='utf-8').write(t.replace(MARK, PROBE)); done += 1
    assert done, 'repère de la sonde introuvable'
