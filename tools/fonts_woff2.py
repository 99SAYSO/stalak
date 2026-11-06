"""The fonts of the site in WOFF2, cut down to the letters used (audit 6/11, n° 10: Rubik was 77 % of a guide's weight).

    python3 tools/fonts_woff2.py

For each TTF of site_src/fonts/, writes site_src/fonts/<name>.<version>.woff2 (the version: 8 characters of its content's
fingerprint, so a browser that keeps fonts a year, `immutable`, never keeps an old one), drops the older WOFF2 of the same
font, and writes fonts.css again with them (the app and every page of the site load /fonts/fonts.css).
Kept: Latin (with all its accents: French, Spanish, Portuguese, German, Polish, Vietnamese…), Greek, Cyrillic, punctuation,
currencies, arrows and ✓ — lyrics typed in another script fall back to the phone's own font, as before for missing letters.
The TTF files stay (the e-mails and the dashboard use them). Needs: pip install fonttools brotli. Written by App & montage."""
import hashlib, io, os, re
from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIR = os.path.join(ROOT, 'site_src', 'fonts')
RANGES = ['U+0000-024F', 'U+0259', 'U+02B0-02FF', 'U+0300-036F', 'U+0370-03FF', 'U+0400-04FF', 'U+1E00-1EFF',
          'U+2000-206F', 'U+20A0-20CF', 'U+2100-214F', 'U+2190-21FF', 'U+2212', 'U+2713-2714', 'U+2190-2193', 'U+FB00-FB06']


def unicodes():
    out = set()
    for r in RANGES:
        a, _, b = r[2:].partition('-')
        out.update(range(int(a, 16), int(b or a, 16) + 1))
    return sorted(out)


def main():
    css = open(os.path.join(DIR, 'fonts.css'), encoding='utf-8').read()
    for ttf in sorted(f for f in os.listdir(DIR) if f.endswith('.ttf')):
        name = ttf[:-4]
        opts = subset.Options(); opts.flavor = 'woff2'; opts.layout_features = ['*']; opts.name_IDs = ['*']; opts.notdef_outline = True
        opts.glyph_names = False; opts.hinting = False   # (hints are of no use on phones and retina screens)
        f = TTFont(os.path.join(DIR, ttf))
        sub = subset.Subsetter(options=opts); sub.populate(unicodes=unicodes()); sub.subset(f)
        buf = io.BytesIO(); f.flavor = 'woff2'; f.save(buf); data = buf.getvalue()
        v = hashlib.sha1(data).hexdigest()[:8]
        for old in os.listdir(DIR):
            if re.fullmatch(re.escape(name) + r'\.[0-9a-f]{8}\.woff2', old) and old != name + '.' + v + '.woff2': os.remove(os.path.join(DIR, old))
        open(os.path.join(DIR, name + '.' + v + '.woff2'), 'wb').write(data)
        before = os.path.getsize(os.path.join(DIR, ttf))
        print('%-24s %7d → %6d octets (%d %%)' % (ttf, before, len(data), round(100 * len(data) / before)))
        # fonts.css: this font's url → the WOFF2
        css, n = re.subn(r"url\('/fonts/" + re.escape(name) + r"(?:\.ttf|\.[0-9a-f]{8}\.woff2)'\) format\('(?:truetype|woff2)'\)",
                         "url('/fonts/" + name + '.' + v + ".woff2') format('woff2')", css)
        assert n == 1, ttf + ' not found once in fonts.css'
    open(os.path.join(DIR, 'fonts.css'), 'w', encoding='utf-8').write(css)
    print('fonts.css écrit')


main()
