#!/usr/bin/env python3
"""LEVELS v2 (mise en scène du 17/11) : fabrique une vidéo avec HyperFrames.

  python3 tools/levels/v2/build.py voix|plan|rendu|son|mux|tout [--ep abo]

La scène (décors, personnages, écrans) est dessinée en SVG par scene.js à chaque image ;
le haut de l'écran (titre, chiffres, phrase, jauge HYPE), les bulles, les cartons de fin et la lumière
ambiante sont des éléments HTML animés par la timeline GSAP de HyperFrames (index.html généré ici).
Aucune musique. Bruitages faits en code.
"""
import json, os, shutil, subprocess, sys
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
sys.path.insert(0, os.path.join(HERE, '..'))
import fabrique as F  # noqa: E402  (prep_voice, tone, noise, P, sfx, read, write, run, dur)
from episodes import OFF  # noqa: E402

WORK = os.environ.get('LEVELS_WORK', '/home/claude/work/levels')
SR = F.SR
F.SPEED.update(r=1.15, rp=1.12)  # v2 : un peu plus vif pour tenir sous 40 s

EP = {
    'abo': dict(
        title=['COMMENT FAIRE LA PROMO', 'DE TON SON QUAND', "T'AS 0 ABONNÉ"],
        voices=dict(r1=('abo_r1', 'r'), i1=('abo_i1', 'v'), r2=('abo_r2', 'r'), m1=('mere_sulafat', 'rp'), r3=('abo_r3', 'r'), r4=('abo_r4', 'r')),
        text=dict(r1="Mon pote, écoute mon son 2 secondes, j'suis le futur Drake !", i1="Je t'ai rien demandé.",
                  r2="Partagez à tous vos collègues, c'est pour la famille !", m1="Arrête de spammer le groupe de la famille !",
                  r3="Je commente sous toutes les vidéos de stars, quelqu'un va bien cliquer.", r4="Le son est lourd, l'image c'est pas grave."),
        labels=["personne ne t'a demandé", 'mauvais public', "c'est du spam", 'rien à regarder', 'un snippet qui donne envie'],
        lyrics=['Bonnet bleu dans le bloc,', "j'ai le flow qui gèle tout"], bpm=140,
        lieux=['rue', 'immeuble', 'toit'],
    ),
}


def wdir(ep):
    d = os.path.join(WORK, 'v2_' + ep); os.makedirs(d, exist_ok=True); return d


# ------------------------------------------------------------------ voix
def voices(ep):
    E = EP[ep]; raw = os.path.join(WORK, 'voice', 'raw'); out = os.path.join(wdir(ep), 'voice'); os.makedirs(out, exist_ok=True)
    for k, (src, who) in E['voices'].items():
        d = F.prep_voice(os.path.join(raw, src + '.wav'), who, os.path.join(out, k + '.wav'))
        print('%-3s %.2f s  %s' % (k, d, E['text'][k]))


# ------------------------------------------------------------------ la timeline
def plan(ep):
    E = EP[ep]; vd = os.path.join(wdir(ep), 'voice'); offd = os.path.join(WORK, 'voice', 'off')
    D = dict(title=E['title'], labels=E['labels'], levels=[], says=[], hype=[], sfx=[], hits=[], shakes=[], flashes=[])
    sfx = lambda t, s, g=0.9: D['sfx'].append(dict(t=round(t, 3), s=s, g=g))
    hype = lambda t, v, c=None, d=0.45: D['hype'].append(dict(t=round(t, 3), v=v, c=c, d=d))

    def say(k, who, t0, bub):
        f = os.path.join(vd, k + '.wav'); d = F.dur(f)
        D['says'].append(dict(id=k, who=who, text=E['text'][k], t0=round(t0, 3), t1=round(t0 + d, 3), file=f, bub=bub))
        sfx(t0 - 0.06, 'bulle', 0.7)
        return t0 + d

    def coup(t, word, x, y, s, a=1.0):
        sfx(t, s); D['hits'].append(dict(t=round(t, 3), word=word, x=x, y=y)); D['shakes'].append(dict(t=round(t, 3), d=0.4, a=a))
        return dict(t=round(t, 3))

    BH = dict(x=40, y=905, w=840, tail=330)  # bulle du rappeur quand il est devant un écran
    t = 0.0
    # ---- NIVEAU 1 : l'inconnu dans la rue
    L = dict(n=1, t0=0.0); hype(0, 0.02, 'il y croit', 0.01)
    e = say('r1', 'r', 0.35, dict(x=40, y=1000, w=800, tail=440))
    hype(e + 0.05, 0.06, 'il y croit')
    e = say('i1', 'i', e + 0.25, dict(x=400, y=1000, w=540, tail=790))
    L['coup'] = coup(e + 0.5, 'BAF !', 560, 1080, 'baffe')
    hype(L['coup']['t'] + 0.15, 0.02, "même toi t'y crois pas")
    t = L['coup']['t'] + 0.85; L['t1'] = round(t, 3); D['levels'].append(L)

    # ---- NIVEAU 2 : le groupe de la famille
    L = dict(n=2, t0=round(t, 3)); D['flashes'].append(L['t0']); sfx(t, 'swoosh', 0.6)
    msgs = []
    for i, txt in enumerate(['Écoutez mon son !!!', 'Écoutez mon son !!!', '🎤 vocal · 4:12', 'Écoutez mon son !!!', 'Écoutez mon son !!!', 'ÉCOUTEZ MON SON !!!']):
        tm = t + 0.15 + i * 0.16; msgs.append(dict(t=round(tm, 3), text=txt, me=True)); sfx(tm, 'msg', 0.35)
    e = say('r2', 'r', t + 1.05, BH)
    hype(e + 0.05, 0.08, 'il y croit')
    ts = e + 0.2; msgs.append(dict(t=round(ts, 3), text='Tata Josiane a quitté le groupe', sys=True)); sfx(ts, 'ding')
    ring = ts + 0.9; sfx(ring, 'ring', 0.6)
    e = say('m1', 'm', ring + 0.55, dict(x=40, y=905, w=860, tail=740, tag='MAMAN · au téléphone'))
    L['coup'] = coup(e + 0.5, 'CLAC !', 470, 1080, 'clac')
    hype(L['coup']['t'] + 0.15, 0.04, 'Tata Josiane a quitté le groupe')
    D['n2'] = dict(msgs=msgs, ring=round(ring, 3), ringEnd=round(ring + 0.55, 3))
    t = L['coup']['t'] + 0.85; L['t1'] = round(t, 3); D['levels'].append(L)

    # ---- NIVEAU 3 : le spam sous les vidéos de stars
    L = dict(n=3, t0=round(t, 3)); D['flashes'].append(L['t0']); sfx(t, 'swoosh', 0.6)
    posts = []
    for i, (c, name) in enumerate([('#6b3fa8', 'STAR DU RAP'), ('#a83f6b', 'STAR DE LA POP'), ('#3f7aa8', 'STAR DU STREET')]):
        c1 = t + 0.35 + i * 1.05; posts.append(dict(c=c, name=name, c1=round(c1, 3))); sfx(c1, 'msg', 0.4)
    e = say('r3', 'r', t + 0.4, BH)
    hype(e + 0.05, 0.07, 'il y croit')
    D['n3'] = dict(t0=round(t, 3), posts=posts)
    L['coup'] = coup(e + 0.5, 'PAF !', 430, 1080, 'paf')
    hype(L['coup']['t'] + 0.15, 0.03, 'bloqué par 40 comptes')
    t = L['coup']['t'] + 0.85; L['t1'] = round(t, 3); D['levels'].append(L)

    # ---- NIVEAU 4 : une photo fixe, 12 vues, la jauge lui tombe dessus
    L = dict(n=4, t0=round(t, 3)); D['flashes'].append(L['t0']); sfx(t, 'swoosh', 0.6)
    D['n4'] = dict(t0=round(t + 0.25, 3))
    e = say('r4', 'r', t + 0.45, BH)
    hype(e + 0.05, 0.05, 'il y croit')
    drop = e + 0.5; D['drop'] = dict(t0=round(drop, 3), t1=round(drop + 0.42, 3)); sfx(drop, 'craque', 0.7)
    L['coup'] = coup(drop + 0.42, 'BONG !', 330, 1150, 'bong', 1.3)
    hype(L['coup']['t'] + 0.1, 0.01, "12 vues, dont 3 c'est ta mère", 0.3)
    D['drop']['back'] = round(L['coup']['t'] + 0.7, 3)
    t = L['coup']['t'] + 1.0; L['t1'] = round(t, 3); D['levels'].append(L)

    # ---- NIVEAU 5 : Stalak (voix off), puis les personnages reviennent
    L = dict(n=5, t0=round(t, 3), ok=True); D['flashes'].append(L['t0']); sfx(t, 'ding'); sfx(t, 'swoosh', 0.6)
    N = dict(lieux=E['lieux'])
    VO = dict(x=70, y=0, w=860, top=800, tag='VOIX OFF')
    vo = [os.path.join(offd, 'vo%d.wav' % i) for i in (1, 2, 3)]

    def off(i, t0):
        d = F.dur(vo[i]); D['says'].append(dict(id='vo%d' % (i + 1), who='off', text=OFF['texts'][i], t0=round(t0, 3), t1=round(t0 + d, 3), file=vo[i], bub=VO))
        sfx(t0 - 0.06, 'bulle', 0.5); return t0 + d
    t += 0.35; N['tPrises'] = round(t, 3)
    for i in range(3): sfx(t + i * 0.55, 'pop', 0.8)
    e = off(0, t + 0.1); hype(e, 0.3, 'tiens tiens…')
    t = max(t + 1.65, e + 0.1); N['tApp'] = round(t, 3)
    e = off(1, t + 0.1); sfx(t + 0.8, 'snap'); hype(e, 0.6, 'ça devient sérieux')
    t = max(t + 1.6, e + 0.1); N['tSnip'] = round(t, 3)
    e = off(2, t + 0.15)
    beat = 60 / E['bpm']; snip = max(2.6, e - t + 0.3)
    N['beats'] = [round(t + k * beat, 3) for k in range(int(snip / beat) + 2)]
    for b in N['beats']:
        if b < t + snip: sfx(b, 'tick', 0.6)
    words, lines, tt = [], [], t + 0.2
    for line in E['lyrics']:
        ws = []
        for w in line.split():
            syl = max(1, sum(ch in 'aeiouyéèêàâôîû' for ch in w.lower())); d = beat * (0.5 if syl < 2 else 1.0)
            ws.append(dict(w=w, t0=round(tt, 3), t1=round(tt + d * 0.92, 3), syl=syl)); tt += d
        lines.append(dict(words=ws, t1=round(tt, 3))); words += ws; tt += beat * 0.5
    lines[-1]['t1'] = round(t + snip + 5, 3)
    N['words'] = words; N['lines'] = lines
    hype(e, 0.85, 'ça donne envie…')
    t += snip; N['tPub'] = round(t, 3)
    for i in range(3): sfx(t + i * 0.25, 'pop', 0.8)
    sfx(t + 0.4, 'coeurs', 0.6)
    t += 1.1; N['tBack'] = round(t, 3); sfx(t, 'swoosh', 0.5)
    N['chat'] = [dict(t=round(t + 0.35, 3), text='Tata Josiane a rejoint le groupe', sys=True),
                 dict(t=round(t + 0.85, 3), text="c'est toi ça ?? 😍", from_='Tata Josiane'),
                 dict(t=round(t + 1.4, 3), text='Je partage à tout le monde ❤️', from_='Maman')]
    for m in N['chat']: m['from'] = m.pop('from_', None); sfx(m['t'], 'msg', 0.45)
    D['boom'] = round(t + 1.75, 3); hype(t + 1.45, 1.0, 'là, ça donne envie', 0.3); sfx(D['boom'], 'explose'); sfx(D['boom'], 'win', 0.8)
    D['shakes'].append(dict(t=D['boom'], d=0.5, a=0.7))
    t = D['boom'] + 1.0; L['t1'] = round(t, 3); D['levels'].append(L); D['n5'] = N

    # ---- la fin
    D['promo'] = round(t, 3); sfx(t, 'swoosh', 0.6); sfx(t + 0.35, 'ding', 0.7)
    t += 2.05; D['question'] = round(t, 3); sfx(t, 'pop', 0.9)
    t += 2.0; D['duration'] = round(t, 2)
    json.dump(D, open(os.path.join(wdir(ep), 'data.json'), 'w'), ensure_ascii=False, indent=1)
    print('durée %.2f s · niveaux %s' % (t, ' | '.join('%d:%.1f-%.1f' % (l['n'], l['t0'], l['t1']) for l in D['levels'])))
    return D


# ------------------------------------------------------------------ bruitages (en code)
def sfx(name):
    T, N, P = F.tone, F.noise, F.P
    if name == 'bulle':
        return P((0.35, T(420, 900, 0.09, decay=30)), (0.12, N(0.03, 90)))
    if name == 'bulle_out':
        return 0.15 * T(700, 350, 0.08, decay=35)
    if name == 'msg':
        return P((0.3, T(1250, 1250, 0.07, decay=45)), (0.2, T(1660, 1660, 0.07, decay=45)))
    if name == 'swoosh':
        x = N(0.35, 6, lp=2500); env = np.sin(np.linspace(0, np.pi, len(x))) ** 2
        return (0.5 * x * env).astype(np.float32)
    if name == 'ring':
        out = np.zeros(int(0.75 * SR), np.float32)
        for k in range(2):
            s = 0.16 * (T(950, 950, 0.3, decay=1) + T(1150, 1150, 0.3, decay=1)) * (0.6 + 0.4 * np.sign(np.sin(np.linspace(0, 0.3 * 2 * np.pi * 24, int(0.3 * SR)))))
            a = int(k * 0.4 * SR); out[a:a + len(s)] += s[:len(out) - a]
        return out
    if name == 'clac':
        return P((1.0, N(0.12, 45)), (0.5, T(240, 90, 0.18, decay=22)))
    if name == 'paf':
        return P((0.9, N(0.2, 32)), (0.45, T(380, 110, 0.22, decay=18)), (0.25, T(1500, 1500, 0.08, decay=40)))
    if name == 'craque':
        return P((0.5, N(0.06, 70)), (0.3, T(2000, 600, 0.35, decay=6)))
    if name == 'coeurs':
        out = np.zeros(int(1.0 * SR), np.float32)
        for i, f in enumerate((880, 1100, 1320, 1760)):
            s = 0.12 * T(f, f * 1.05, 0.2, decay=12); a = int(i * 0.12 * SR); out[a:a + len(s)] += s
        return out
    if name == 'explose':
        return P((0.9, N(0.9, 5, lp=1200)), (0.6, T(120, 40, 0.8, decay=4)), (0.3, N(0.08, 50)))
    return F.sfx(name)


def audio(ep):
    D = json.load(open(os.path.join(wdir(ep), 'data.json')))
    mix = np.zeros(int((D['duration'] + 0.6) * SR), np.float32)

    def put(x, t, g=1.0):
        a = max(0, int(t * SR)); b = min(len(mix), a + len(x)); mix[a:b] += g * x[:b - a]
    for s in D['says']:
        put(F.read(s['file']), s['t0'])
        put(sfx('bulle_out'), s['t1'] + 0.35, 0.6)
    for e in D['sfx']:
        put(sfx(e['s']), e['t'], e.get('g', 0.9))
    raw = os.path.join(wdir(ep), 'mix_raw.wav'); F.write(raw, mix * 0.9)
    F.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', raw, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', str(SR), os.path.join(wdir(ep), 'mix.wav')])
    print('son : ok')


# ------------------------------------------------------------------ le projet HyperFrames
def project(ep):
    D = json.load(open(os.path.join(wdir(ep), 'data.json')))
    pj = os.path.join(wdir(ep), 'hf'); a = os.path.join(pj, 'assets'); os.makedirs(a, exist_ok=True)
    gs = os.path.join(a, 'gsap.min.js')
    if not os.path.exists(gs):
        src = '/home/claude/work/hftest/assets/gsap.min.js'
        if os.path.exists(src): shutil.copy(src, gs)
        else: F.run(['curl', '-sSL', '-o', gs, 'https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js'])
    shutil.copy(os.path.join(REPO, 'public', 'fonts', 'lilitaone.ttf'), a)
    shutil.copy(os.path.join(REPO, 'public', 'fonts', 'rubik.ttf'), a)
    shutil.copy(os.path.join(REPO, 'site_src', 'icons', 'icon.svg'), a)
    shutil.copy(os.path.join(HERE, '..', 'engine.js'), a)
    shutil.copy(os.path.join(HERE, 'scene.js'), a)
    shutil.copy(os.path.join(HERE, 'ui.js'), a)
    pub = {k: v for k, v in D.items()}
    pub['says'] = [{k: v for k, v in s.items() if k != 'file'} for s in D['says']]
    open(os.path.join(a, 'data.js'), 'w').write('window.__DATA = ' + json.dumps(pub, ensure_ascii=False) + ';\n')
    html = open(os.path.join(HERE, 'index.html')).read().replace('__DUR__', str(D['duration']))
    open(os.path.join(pj, 'index.html'), 'w').write(html)
    return pj


def render(ep):
    pj = project(ep); out = os.path.join(wdir(ep), 'video_muette.mp4')
    F.run(['npx', '-y', 'hyperframes', 'render', pj, '-o', out, '--fps', '30', '--quiet'])
    print('rendu :', out)


def mux(ep):
    d = wdir(ep); out = os.path.join(d, 'levels_%s.mp4' % ep)
    F.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', os.path.join(d, 'video_muette.mp4'), '-i', os.path.join(d, 'mix.wav'),
           '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', out])
    print('vidéo :', out)


if __name__ == '__main__':
    step = sys.argv[1] if len(sys.argv) > 1 else 'tout'
    ep = sys.argv[sys.argv.index('--ep') + 1] if '--ep' in sys.argv else 'abo'
    if step in ('voix', 'tout'): voices(ep)
    if step in ('plan', 'tout'): plan(ep)
    if step in ('son', 'tout'): audio(ep)
    if step == 'projet': print(project(ep))
    if step in ('rendu', 'tout'): render(ep)
    if step in ('mux', 'tout'): mux(ep)
