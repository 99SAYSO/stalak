"""Fabrique une vidéo LEVELS (style D) de bout en bout, sans musique.

Usage : python3 tools/levels/fabrique.py EPISODE [etape]
  etapes : voix (prépare les voix déjà téléchargées) · plan (timeline) · images · son · tout (défaut)
Dossier de travail : ~/work/levels/ (les voix brutes dans voice/raw/<ep>_<id>.wav). Rien de lourd dans le dépôt.
Les voix sont générées une seule fois sur Flora (Gemini TTS), voir docs/marketing/levels/FORMAT.md.
"""
import json, math, os, subprocess, sys, wave
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
WORK = os.environ.get('LEVELS_WORK', '/home/claude/work/levels')
SR = 48000
FPS = 30
SPEED = {'r': 1.1, 'rp': 1.1, 'v': 1.1, 'off': 1.2}
sys.path.insert(0, HERE)
from episodes import EPISODES, OFF  # noqa: E402


def run(cmd):
    subprocess.run(cmd, check=True)


def read(path):
    w = wave.open(path)
    sr, ch = w.getframerate(), w.getnchannels()
    x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    if ch > 1:
        x = x.reshape(-1, ch).mean(1)
    if sr != SR:
        n = int(len(x) * SR / sr)
        x = np.interp(np.linspace(0, len(x) - 1, n), np.arange(len(x)), x).astype(np.float32)
    return x


def write(path, x):
    y = (np.clip(x, -1, 1) * 32767).astype(np.int16)
    w = wave.open(path, 'w'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(y.tobytes()); w.close()


def trim(x):
    a = np.abs(x); thr = max(1e-3, 0.02 * np.percentile(a, 99.5)); idx = np.where(a > thr)[0]
    if not len(idx):
        return x
    return x[max(0, idx[0] - int(0.02 * SR)):min(len(x), idx[-1] + int(0.08 * SR))]


def squeeze(x, longest=0.30, keep=0.18):
    """aucune pause de plus de 0,3 s dans une réplique (goût : pas de pauses ajoutées, personne ne parle lentement)"""
    hop = int(0.01 * SR); n = len(x) // hop
    if n < 10:
        return x
    e = np.array([np.sqrt(np.mean(x[k * hop:(k + 1) * hop] ** 2)) for k in range(n)])
    sil = e < max(1e-4, 0.05 * np.percentile(e, 95)); out, pos, k = [], 0, 0
    while k < n:
        if sil[k]:
            j = k
            while j < n and sil[j]:
                j += 1
            if k > 0 and j < n and (j - k) * hop > longest * SR:
                a, b = k * hop + int(keep / 2 * SR), j * hop - int(keep / 2 * SR)
                out.append(x[pos:a]); pos = b
            k = j
        else:
            k += 1
    out.append(x[pos:])
    return np.concatenate(out)


def prep_voice(src, who, dst, cut=None):
    tmp = dst + '.tmp.wav'
    args = ['ffmpeg', '-nostdin', '-v', 'error', '-y']
    if cut:
        args += ['-ss', str(cut[0]), '-to', str(cut[1])]
    args += ['-i', src]
    sp = SPEED[who]
    args += ['-filter:a', 'atempo=%.3f' % sp, '-ar', str(SR), '-ac', '1', tmp]
    run(args)
    x = squeeze(trim(read(tmp))); os.remove(tmp)
    x = x * (0.09 / (np.sqrt(np.mean(x ** 2)) + 1e-9))
    if who == 'rp':  # la voix sort du téléphone : petit filtre « haut-parleur »
        from numpy.fft import rfft, irfft
        X = rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X[(f < 350) | (f > 4500)] *= 0.08; x = irfft(X, len(x)).astype(np.float32) * 1.3
    write(dst, x)
    return len(x) / SR


def voices(ep):
    E = EPISODES[ep]; raw = os.path.join(WORK, 'voice', 'raw'); out = os.path.join(WORK, 'voice', ep); os.makedirs(out, exist_ok=True)
    for lv in E['levels']:
        for l in lv.get('lines', []):
            d = prep_voice(os.path.join(raw, '%s_%s.wav' % (ep, l['id'])), l['who'], os.path.join(out, l['id'] + '.wav'))
            print('%-4s %-3s %.2f s  %s' % (l['id'], l['who'], d, l['text']))
    offd = os.path.join(WORK, 'voice', 'off'); os.makedirs(offd, exist_ok=True)
    for i, (a, b) in enumerate(OFF['cuts']):
        d = prep_voice(os.path.join(raw, 'off_all.wav'), 'off', os.path.join(offd, 'vo%d.wav' % (i + 1)), cut=(a, b))
        print('vo%d %.2f s  %s' % (i + 1, d, OFF['texts'][i]))


def dur(path):
    w = wave.open(path); return w.getnframes() / w.getframerate()


def plan(ep):
    E = EPISODES[ep]; vdir = os.path.join(WORK, 'voice', ep); offd = os.path.join(WORK, 'voice', 'off')
    T = dict(ep=ep, genre=E['genre'], levels=[], says=[], hits=[], shakes=[], sfx=[], questionText=E['question'])
    t = 0.0
    for lv in E['levels'][:4]:
        L = dict(n=lv['n'], t0=t, label=lv['label'], special=lv.get('special', {}), hx=lv.get('hx', 330), phone=lv.get('phone'))
        T['sfx'].append(dict(t=t, s='ding'))
        t += lv.get('lead', 0.15)
        for l in lv['lines']:
            d = dur(os.path.join(vdir, l['id'] + '.wav'))
            T['says'].append(dict(who=l['who'], text=l['text'], t0=t, t1=t + d, file=os.path.join(vdir, l['id'] + '.wav'), by=l.get('by'), tail=l.get('tail')))
            t += d + l.get('gap', 0.1)
        t += 0.5 - 0.1  # la demi-seconde de silence avant le coup (pilier 5)
        c = dict(lv['coup']); c['t'] = t + (0.6 if c['type'] in ('chute', 'big') else 0.18)
        if c['type'] in ('chute', 'big'):
            T['sfx'].append(dict(t=c['t'] - 0.6, s='whistle'))
        L['coup'] = c
        T['hits'].append(dict(t=c['t'], word=c['word'], x=c.get('bx', 470), y=c.get('by', 1080)))
        T['shakes'].append(dict(t=c['t'], d=0.35 if c['type'] != 'big' else 0.55, a=1.0 if c['type'] != 'big' else 1.8))
        T['sfx'].append(dict(t=c['t'], s=c.get('sfx', c['type'])))
        if c['type'] == 'pied':
            T['sfx'].append(dict(t=c['t'] + 0.12, s='iiih'))
        if c['type'] == 'double':
            T['sfx'].append(dict(t=c['t'] + 0.35, s='baffe')); T['hits'].append(dict(t=c['t'] + 0.35, word=c['word'], x=c.get('bx', 470) - 60, y=c.get('by', 1080) + 40))
        t = c['t'] + (0.8 if c['type'] != 'double' else 1.1)
        L['t1'] = t; T['levels'].append(L)
    # niveau 5
    lv = E['levels'][4]; L = dict(n=5, t0=t, label=lv['label'], special={}, hx=330)
    T['sfx'].append(dict(t=t, s='ding'))
    N = dict(lieux=lv['lieux'])
    t += 0.5; N['tPrises'] = t
    vo = [os.path.join(offd, 'vo%d.wav' % i) for i in (1, 2, 3)]
    d1 = dur(vo[0]); T['says'].append(dict(who='off', text=OFF['texts'][0], t0=t + 0.1, t1=t + 0.1 + d1, file=vo[0]))
    for i in range(3):
        T['sfx'].append(dict(t=t + i * 0.7, s='pop'))
    t = max(t + 2.1, t + 0.1 + d1 + 0.1); N['tApp'] = t
    d2 = dur(vo[1]); T['says'].append(dict(who='off', text=OFF['texts'][1], t0=t + 0.15, t1=t + 0.15 + d2, file=vo[1]))
    T['sfx'].append(dict(t=t + 0.9, s='snap'))
    t = max(t + 2.0, t + 0.15 + d2 + 0.15); N['tSnip'] = t
    d3 = dur(vo[2]); T['says'].append(dict(who='off', text=OFF['texts'][2], t0=t + 0.2, t1=t + 0.2 + d3, file=vo[2]))
    snip = max(4.0, 0.2 + d3 + 0.6)
    bpm = lv['bpm']; beat = 60 / bpm
    N['beats'] = [t + k * beat for k in range(int(snip / beat) + 2)]
    for b in N['beats']:
        if b < t + snip:
            T['sfx'].append(dict(t=b, s='tick'))
    # les paroles du snippet : chaque mot sur une moitié de temps, en 2 lignes
    words = []; tt = t + 0.25; lines = []
    for line in lv['lyrics']:
        ws = []
        for w in line.split():
            syl = max(1, sum(ch in 'aeiouyéèêàâôîû' for ch in w.lower()))
            d = beat * (0.5 if syl < 2 else 1.0)
            ws.append(dict(w=w, t0=tt, t1=tt + d * 0.92, syl=syl)); tt += d
        lines.append(dict(words=ws, t1=tt)); words += ws; tt += beat * 0.5
    lines[-1]['t1'] = t + snip + 1
    N['words'] = words; N['lyricsLines'] = lines
    t += snip; N['tEnd'] = t
    # le Videur : il hoche la tête, décroche la corde, « … Entre. », la porte s'ouvre
    T['rope'] = t + 0.5
    T['sfx'].append(dict(t=T['rope'], s='rope'))
    l = lv['lines'][0]; d = dur(os.path.join(vdir, l['id'] + '.wav'))
    T['says'].append(dict(who='v', text=l['text'], t0=t + 0.75, t1=t + 0.75 + d, file=os.path.join(vdir, l['id'] + '.wav')))
    T['door'] = t + 0.75 + d + 0.1; T['win'] = T['door']
    T['sfx'].append(dict(t=T['door'], s='win'))
    t = T['door'] + 1.0
    L['t1'] = t; T['levels'].append(L); T['n5'] = N
    T['promo'] = t; t += 2.5; T['question'] = t; t += 2.0
    T['duration'] = round(t, 3)
    # l'enveloppe de la voix « dans le téléphone » (bouche du rappeur filmé)
    env = np.zeros(int(t * FPS) + 2)
    for s in T['says']:
        if s['who'] == 'rp':
            x = read(s['file']); hop = SR // FPS
            for k in range(len(x) // hop):
                i = int((s['t0']) * FPS) + k
                if i < len(env):
                    env[i] = float(np.sqrt(np.mean(x[k * hop:(k + 1) * hop] ** 2)) / 0.12)
    T['env'] = [round(min(1.0, v), 3) for v in env]
    # le niveau 4 : les paroles mal montées
    for L4 in T['levels']:
        if L4.get('phone') and L4['phone'].get('type') == 'desync':
            ws, a = [], 0.2
            for w in ' '.join(lv['lyrics']).split():
                ws.append(dict(w=w, a=a, b=a + 0.28)); a += 0.3
            L4['phone']['words'] = ws
    os.makedirs(os.path.join(WORK, ep), exist_ok=True)
    json.dump(T, open(os.path.join(WORK, ep, 'timeline.json'), 'w'), ensure_ascii=False)
    print('%s : %.2f s' % (ep, T['duration']))
    for L in T['levels']:
        print('  niveau %d : %.2f → %.2f s' % (L['n'], L['t0'], L['t1']))
    return T


# ---------------------------------------------------------------- bruitages (faits en code, libres de droits)
def tone(f0, f1, d, kind='sine', decay=6.0):
    n = int(d * SR); tt = np.arange(n) / SR; f = np.linspace(f0, f1, n); ph = 2 * np.pi * np.cumsum(f) / SR
    x = np.sin(ph) if kind == 'sine' else np.sign(np.sin(ph)) * 0.5
    return (x * np.exp(-decay * tt)).astype(np.float32)


def noise(d, decay=20.0, lp=None):
    n = int(d * SR); x = np.random.RandomState(7).randn(n).astype(np.float32) * np.exp(-decay * np.arange(n) / SR)
    if lp:
        k = int(SR / lp); x = np.convolve(x, np.ones(k) / k, 'same')
    return x


def P(*parts):
    """additionne des sons de longueurs différentes"""
    n = max(len(x) for _, x in parts); out = np.zeros(n, np.float32)
    for g, x in parts:
        out[:len(x)] += g * x
    return out


def sfx(name):
    if name == 'baffe':
        return P((0.9, noise(0.25, 30)), (0.4, tone(300, 120, 0.2, decay=20)))
    if name == 'double':
        return sfx('baffe')
    if name == 'pied':
        return P((0.8, tone(160, 60, 0.35, decay=9)), (0.3, noise(0.1, 40)))
    if name == 'iiih':
        return 0.25 * tone(900, 1700, 0.45, decay=3)
    if name == 'whistle':
        return 0.22 * tone(1800, 500, 0.75, decay=0.5)
    if name in ('chute', 'big', 'clang'):
        parts = [tone(f, f * 0.98, 1.2, decay=4) for f in (420, 655, 980, 1420)]
        return P((0.175, sum(parts)), (0.7, noise(0.08, 50)))
    if name == 'bong':
        return P((0.8, tone(180, 150, 1.2, decay=3)), (0.4, tone(370, 360, 1.0, decay=4)), (0.6, noise(0.06, 60)))
    if name == 'poc':
        return 0.7 * tone(500, 200, 0.18, decay=18)
    if name == 'splotch':
        return 0.8 * noise(0.4, 9, lp=800)
    if name == 'kickout':
        return P((0.6, noise(0.5, 4, lp=300)), (0.4, tone(300, 80, 0.6, decay=4)))
    if name == 'ding':
        return P((0.25, tone(1320, 1320, 0.35, decay=9)), (0.15, tone(1980, 1980, 0.3, decay=12)))
    if name == 'pop':
        return 0.3 * tone(900, 400, 0.08, decay=40)
    if name == 'snap':
        return P((0.3, noise(0.05, 80)), (0.2, tone(1500, 1500, 0.08, decay=40)))
    if name == 'tick':
        return 0.12 * tone(1000, 1000, 0.05, decay=60)
    if name == 'rope':
        return 0.25 * noise(0.2, 15, lp=2000)
    if name == 'win':
        x = np.zeros(int(1.0 * SR), np.float32)
        for i, f in enumerate((523, 659, 784, 1046)):
            s = 0.18 * tone(f, f, 0.5, decay=5); a = int(i * 0.09 * SR); x[a:a + len(s)] += s[:len(x) - a]
        return x
    raise KeyError(name)


def audio(ep):
    T = json.load(open(os.path.join(WORK, ep, 'timeline.json')))
    mix = np.zeros(int((T['duration'] + 0.5) * SR), np.float32)
    def put(x, t, g=1.0):
        a = int(t * SR); b = min(len(mix), a + len(x)); mix[a:b] += g * x[:b - a]
    for s in T['says']:
        put(read(s['file']), s['t0'])
    for e in T['sfx']:
        put(sfx(e['s']), e['t'], 0.9)
    write(os.path.join(WORK, ep, 'mix_raw.wav'), mix * 0.9)
    run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', os.path.join(WORK, ep, 'mix_raw.wav'), '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', str(SR), os.path.join(WORK, ep, 'mix.wav')])
    print('son : ok')


def images(ep, step=1, only=None):
    from playwright.sync_api import sync_playwright
    T = json.load(open(os.path.join(WORK, ep, 'timeline.json')))
    out = os.path.join(WORK, ep, 'video_raw.mp4')
    n = int(T['duration'] * FPS)
    ff = subprocess.Popen(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-f', 'image2pipe', '-framerate', str(FPS), '-i', '-',
                           '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', out], stdin=subprocess.PIPE)
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1080, 'height': 1920})
        pg.goto('file://' + os.path.join(HERE, 'engine.html')); pg.evaluate('document.fonts.ready')
        pg.evaluate('tl => setup(tl)', T)
        for i in range(n):
            pg.evaluate('t => draw(t)', i / FPS)
            ff.stdin.write(pg.screenshot(type='jpeg', quality=92))
            if i % 150 == 0:
                print('image %d / %d' % (i, n), flush=True)
        b.close()
    ff.stdin.close(); ff.wait()
    print('images : ok')


def still(ep, times, out):
    from playwright.sync_api import sync_playwright
    T = json.load(open(os.path.join(WORK, ep, 'timeline.json')))
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1080, 'height': 1920})
        pg.goto('file://' + os.path.join(HERE, 'engine.html')); pg.evaluate('document.fonts.ready')
        pg.evaluate('tl => setup(tl)', T)
        for t in times:
            pg.evaluate('t => draw(t)', t); pg.screenshot(path=os.path.join(out, '%s_%05.2f.jpg' % (ep, t)), type='jpeg', quality=85)
        b.close()


def mux(ep):
    d = os.path.join(WORK, ep)
    run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', os.path.join(d, 'video_raw.mp4'), '-i', os.path.join(d, 'mix.wav'),
         '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', os.path.join(d, 'levels_%s.mp4' % ep)])
    print('vidéo :', os.path.join(d, 'levels_%s.mp4' % ep))


if __name__ == '__main__':
    ep = sys.argv[1]; step = sys.argv[2] if len(sys.argv) > 2 else 'tout'
    if step in ('voix', 'tout'): voices(ep)
    if step in ('plan', 'tout'): plan(ep)
    if step in ('son', 'tout'): audio(ep)
    if step in ('images', 'tout'): images(ep)
    if step in ('mux', 'tout'): mux(ep)
    if step == 'stills':
        os.makedirs('/tmp/stills', exist_ok=True); still(ep, [float(x) for x in sys.argv[3].split(',')], '/tmp/stills')
