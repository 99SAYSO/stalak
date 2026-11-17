"""Estimate the speech time of a script (the pipeline's own estimate : (0.3 + chars/15) / speed)."""
import json, re, sys
SPEED = {'liam': 1.1, 'narrateur': 1.35, 'nadia': 1.15, 'maya': 1.15, 'deuce': 1.25, 'reyes': 1.2, 'bigmo': 1.15}
NAMES = {'LIAM': 'liam', 'NARRATEUR': 'narrateur', 'NADIA': 'nadia', 'MAYA': 'maya', 'DEUCE': 'deuce', 'M. REYES': 'reyes', 'BIG MO': 'bigmo'}
pat = re.compile(r'^(LIAM|NARRATEUR|NADIA|MAYA|DEUCE|M\. REYES|BIG MO)(?: \([^)]*\))? : « (.*?) »\s*$', re.M)

def est(script):
    tot, n, per = 0.0, 0, {}
    for who, text in pat.findall(script):
        w = NAMES[who]
        d = (0.3 + len(text) / 15.0) / SPEED[w]
        tot += d; n += 1; per[w] = per.get(w, 0) + 1
    return tot, n, per

if __name__ == '__main__':
    for f in sys.argv[1:]:
        x = json.load(open(f))
        s = x['script'] if 'script' in x else x
        tot, n, per = est(s)
        print('%-28s lines %2d  speech %5.1f s  card duree %-14s  %s' % (f.split('/')[-1], n, tot, x.get('duree', ''), per))
