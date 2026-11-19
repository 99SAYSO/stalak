"""Checks every line of text an episode will show, before its render (and after a change of the engine).

The owner's rule (16/11) : a title, an end card, the shout or a subtitle never ends a line with a small word, and never
leaves one word alone on a line. Added on 19/11 after the contact sheets of episodes 12 to 15 : never a line ending with a
number (« trois / prises », « Zéro / abonné ») or an elided small word (« d'une / prise »).

usage : SERIE_WORK=<work dir> python3 tools/serie/check_lines.py <ep> [<ep> ...]      (after tcrazy.py <ep> plan)

It uses the engine itself (anim.html, frame.js, storyboard.js) : the lines checked are the lines the video will show.
Prints each problem with its time, and exits with 1 when there is one.
"""
import json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import tcrazy as C  # noqa: E402
from playwright.sync_api import sync_playwright  # noqa: E402

SMALL = r"de|du|des|le|la|les|un|une|à|et|ou|ton|ta|tes|son|sa|ses|mon|ma|mes|ce|cet|ces|cette|leur|leurs|en|au|aux|sur|dans|pour|par|avec|sans|chez|vers|je|tu|il|elle|on|ils|qui|que|ne|se|me|te|quelques|plusieurs|chaque|toute|toutes|tous"
NUM = r"zéro|deux|trois|quatre|cinq|six|sept|huit|neuf|dix|onze|douze|treize|quatorze|quinze|seize|vingt|trente|quarante|cinquante|soixante|cent|cents|mille|\d+"
END_BAD = re.compile(r"(?i)(?:^|\s)(?:(?:d|l|qu|jusqu|lorsqu|puisqu|s|n|j|m|t)['’])?(?:%s|%s)$" % (SMALL, NUM))

# in the page : the lines of each subtitle card, of the shout and of the title bands and end cards (74 px Lilita One)
JS = r"""
(D) => {
  const P = new DOMParser(), out = [];
  const texts = (markup, sel) => [...P.parseFromString('<svg xmlns="http://www.w3.org/2000/svg">' + markup + '</svg>', 'image/svg+xml').querySelectorAll(sel)].map(e => e.textContent);
  FRAME.MUTE_SUB = false;
  for (const s of D.subs) {
    if (s.kind === 'cri') {
      const L = FRAME.criLayout(s.who, s.text), rows = new Map();
      L.words.forEach(o => rows.set(o.y, (rows.has(o.y) ? rows.get(o.y) + ' ' : '') + o.w));
      out.push({ t: s.t0, kind: 'cri', lines: [...rows.values()] });
    } else out.push({ t: s.t0, kind: 'sous-titre', lines: texts(FRAME.sub(1, s.who, s.text), 'text[font-family="Rubik"][font-size="44"]') });
  }
  FRAME.MUTE_SUB = true;
  D.shots.forEach(sh => {
    const lines = texts(FRAME.compose(sh.frame), 'text[font-family="Lilita One"][font-size="74"]');
    if (lines.length) out.push({ t: sh.t0, kind: 'bandeau ' + sh.frame, lines });
  });
  FRAME.MUTE_SUB = false;
  return out;
}
"""


DET = {'le', 'un', 'ce', 'du', 'au', 'mon', 'ton', 'son', 'leur', 'notre', 'votre'}


def ends_badly(line):
    w = line.split(' ')
    if len(w) > 1 and w[-1].lower() == 'son' and w[-2].lower() in DET:  # « le son » : the noun, not the possessive
        return False
    return bool(END_BAD.search(line))


def problems(lines, kind):
    lines = [l.replace('\u00a0', ' ').strip() for l in lines]
    if kind.startswith('bandeau') and lines and lines[0].startswith('PROCHAIN ÉPISODE'):
        lines = lines[1:]  # the end card : « PROCHAIN ÉPISODE : » always has its own line
    out = []
    if len(lines) > 1:
        longest = max(len(l) for l in lines)
        # a subtitle card : never one word alone ; a title (centred, big) : a long word alone is fine when the lines are even
        out += ['« %s » seul sur sa ligne' % l for l in lines if ' ' not in l and (kind == 'sous-titre' or len(l) < 0.6 * longest)]
    out += ['ligne finie par « %s »' % l.split(' ')[-1] for l in lines[:-1] if ends_badly(l)]
    return out


def main(eps):
    srv, bad = C.serve(), 0
    with sync_playwright() as p:
        br = p.chromium.launch()
        for ep in eps:
            D = json.load(open(os.path.join(C.WORK, ep, 'ep.json'), encoding='utf-8'))
            pg = br.new_page(viewport={'width': 1080, 'height': 1920})
            pg.add_init_script('window.__DATA = ' + json.dumps(D, ensure_ascii=False) + ';')
            pg.goto('http://127.0.0.1:%d/tools/serie/engine/anim.html' % srv.server_address[1], wait_until='load')
            pg.wait_for_function('window.ready === true', timeout=90000)
            items = pg.evaluate(JS, D)
            pg.close()
            n = 0
            for it in items:
                for pb in problems(it['lines'], it['kind']):
                    n += 1
                    print('%s  %5.1f s  %-22s %s   (%s)' % (ep, it['t'], it['kind'], pb, ' / '.join(it['lines'])))
            print('%s : %d blocs de texte vérifiés, %d problème(s)' % (ep, len(items), n))
            bad += n
        br.close()
    srv.shutdown()
    sys.exit(1 if bad else 0)


if __name__ == '__main__':
    main(sys.argv[1:])
