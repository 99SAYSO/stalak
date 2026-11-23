"""« BONNE IDÉE VS MAUVAISE IDÉE » : make a video from its validated card (Marketing & croissance, 23/11/2026).

    SERIE_WORK=<work> python3 tools/serie/bonne_idee.py <bi1|bi2|bi3> <step> [...]

Steps, in order :
  script <card.json> : the card exported from Studio Stalak → <work>/scripts/<card>.json (the words are never typed again)
  voices : <work>/voice/<ep>/raw/LNN.wav (Flora, one line at a time, generated once) → trimmed and sped up. The lines that are the
           same in every video (8 to 14, and the verdict) are taken from bi1.
  plan   : the timeline (tcrazy.py, no padding) ; the shout written as the card's censored `ecran`, its shock words in colour,
           from the very first image ; everything else 2 to 4 words at a time ; nothing written over the Stalak part
  frames : the pictures (engine/anim.html) → video.mp4
  part   : the Stalak part (stalak_part.py : the owner's iPhone recordings on Big Mo's phone), cut to this video's own timing
           and laid over shot 08
  audio, mux, sheet, deliver, hd, thumb : as tcrazy.py (the sound of the recordings is added under Big Mo's voice)
  all    : plan to thumb
Renders, voices and recordings stay in the work folder, never in the repo.
"""
import json
import os
import re
import shutil
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import tcrazy as C  # noqa: E402
import stalak_part as SP  # noqa: E402

T, WORK, FPS = C.T, C.WORK, C.FPS
SET = {'bi1': 1, 'bi2': 2, 'bi3': 3}      # the set of the Stalak part (stalak_part.py : 1 the kitchen in the evening, 2 the bedroom, 3 the street)
SHARED = (8, 9, 10, 11, 12, 13, 14)       # the same words in every video : recorded once (bi1). (Line 7, the verdict, is no longer used : 23/11.)
STALAK = (11, 12, 13, 14)
# Big Mo's words over the Stalak part, 2 to 4 at a time ; [green] : the word that matters. The same words as in the cards.
PART_SUBS = {11: ["Va sur [stalak.app],", "c'est [gratuit]."], 12: ["Tu choisis ton son,", "tu te filmes", "plusieurs fois,"],
             13: ["tu colles", "tes paroles."], 14: ["Stalak coupe tes prises", "sur le rythme,", "lèvres [synchro].", "Ton snippet est prêt."]}
# the recordings shown during each moment (see stalak_part.py for what each one is) : (recording, from, to, speed or 'fill', sound)
PIECES = [('A', 'STALAK.APP', [('r1', 0.00, 2.70, 'fill', False)]),            # the home page, down to « Choisis ton son »
          ('B1', '1 · SON', [('r2', 0.00, 5.10, 'fill', False)]),                # step 1 : the song, the passage chosen
          ('B2', '2 · PRISES', [('r2', 10.90, 15.00, 'fill', False)]),           # step 2 : « Filmer maintenant »
          ('C1', '3 · PAROLES', [('r4', 0.40, 1.70, 'fill', False)]),            # step 3 : « Coller mes paroles »
          ('C2', None, [('r5', 0.00, 2.70, 'fill', False)]),                     # the lyrics set on the voice
          ('D1', '4 · MONTAGE', [('r5', 20.50, None, 1.0, True)]),               # step 4 : the montage plays, cut on the beat (its sound)
          ('D2', None, [('r5', 68.00, 68.80, 'fill', False)]),                   # « Ta vidéo est prête ✓ »
          ('FIN', None, [('final', 0.00, None, 1.0, True)])]                     # the finished video (the free export, with its watermark)


def card_of(ep):
    return json.load(open(os.path.join(WORK, 'scripts', T.EPISODES[ep]['card'] + '.json'), encoding='utf-8'))


def script(ep, src):
    c = json.load(open(src, encoding='utf-8'))
    c = c.get('data', c)
    s = c['script'].replace('(CRIE', '(crie')
    s = re.sub(r'» ([A-ZÉÈ][A-ZÉÈ .]+ : «)', '»\n\\1', s)  # two speakers written on one line : one line each
    c['script'] = s
    os.makedirs(os.path.join(WORK, 'scripts'), exist_ok=True)
    json.dump(c, open(os.path.join(WORK, 'scripts', T.EPISODES[ep]['card'] + '.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    for l in C.script_lines(ep):
        print('%2d %-6s %s%s' % (l['n'], l['who'], l['text'], '  (' + l['note'] + ')' if l['note'] else ''))


def voices(ep):
    raw = os.path.join(WORK, 'voice', ep, 'raw')
    os.makedirs(raw, exist_ok=True)
    L1, L = {l['n']: l for l in C.script_lines('bi1')}, C.script_lines(ep)
    for l in L:  # a line with the same words and the same speaker as in bi1 uses that recording
        dst = os.path.join(raw, 'L%02d.wav' % l['n'])
        if ep != 'bi1' and not os.path.exists(dst):
            same = [m for m in L1.values() if m['text'] == l['text'] and m['who'] == l['who']]
            if same:
                shutil.copy(os.path.join(WORK, 'voice', 'bi1', 'raw', 'L%02d.wav' % same[0]['n']), dst)
    C.voices(ep)
    # every voice leaves C.voices at the same loudness : the shout of the hook must stay louder than the rest (a real shout), without clipping
    import numpy as np
    p1 = os.path.join(WORK, 'voice', ep, 'L01.wav')
    x = C.read_audio(p1)
    C.write_wav(p1, np.tanh(x * 1.9 / 0.92) * 0.92)
    d = len(x) / C.SR
    if d > 2.85:  # the hook is over before 3 s (rule of 23/11) : a long shout is said a little faster (1.3× at most)
        tmp = p1 + '.t.wav'
        C.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', p1, '-filter:a', 'atempo=%.3f' % min(1.3, d / 2.85), '-ar', str(C.SR), '-ac', '1', tmp])
        os.replace(tmp, p1)
        print('L01 (the shout) : %.2f s → %.2f s' % (d, len(C.read_audio(p1)) / C.SR))


def chunks24(text, *a, **k):
    """the subtitles of this format : 2 to 4 words at a time ; cut at the punctuation first, then each part in even pieces,
    never ending on a little word (« le », « de »…) ; a word alone joins its neighbour"""
    words = [w for w in C.typo(text).split(' ') if w]
    clauses, cur = [], []
    for w in words:
        cur.append(w)
        if re.search(r'[.!?…,:;]$', w):
            clauses.append(cur); cur = []
    if cur:
        clauses.append(cur)
    out = []
    for c in clauses:
        k = -(-len(c) // 4)
        i = 0
        for j in range(k):
            n = -(-(len(c) - i) // (k - j))
            while n > 2 and i + n < len(c) and re.sub(r'[^\w]', '', c[i + n - 1].lower()) in C.WEAK:
                n -= 1
            out.append(c[i:i + n]); i += n
    m = []
    for g in out:  # a word alone goes with the piece before it (or the next one) when that stays within 4 words
        if m and (len(g) == 1 or len(m[-1]) == 1) and len(m[-1]) + len(g) <= 4:
            m[-1] = m[-1] + g
        else:
            m.append(g)
    return [' '.join(g) for g in m]


def plan(ep):
    mus = os.path.join(C.MUSIC, 'silence.wav')
    if not os.path.exists(mus):
        C.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo', '-t', '30', mus])
    bj = os.path.join(C.MUSIC, 'beats.json')
    cache = json.load(open(bj)) if os.path.exists(bj) else {}
    if 'silence.wav' not in cache:
        cache['silence.wav'] = [0.5, 0.0]; json.dump(cache, open(bj, 'w'))
    C.chunks = chunks24
    D, _ = C._build(ep, {})
    card = card_of(ep)
    h = card['hooks'][int(card.get('hookChoisi') or 0)]
    for s in D['subs']:
        if s.get('kind') == 'cri':  # the shout : the censored text of the card, from the very first image, the shock words in colour
            txt = C.typo(h['ecran'])
            s.update(text=txt, shock=h.get('motChoc', ''), shake=True, words=C.word_times(None, s['t0'], s['t1'] - 0.6, txt), t0=-0.4)
            s['words'][0] = -0.4  # already full size on the very first image
    st = next(sh for sh in D['shots'] if sh['frame'].endswith('-08'))  # the Stalak part
    D['subs'] = [s for s in D['subs'] if not (st['t0'] - 1e-6 <= s['t0'] < st['t1'])]  # the Stalak part writes Big Mo's words itself
    D['stalak'] = [st['t0'], st['t1']]
    C._save(ep, D)
    for sh in D['shots']:
        print('  %-7s %6.2f → %6.2f' % (sh['frame'], sh['t0'], sh['t1']))
    return D


def part(ep):
    D = json.load(open(os.path.join(WORK, ep, 'ep.json'), encoding='utf-8'))
    t0, t1 = D['stalak']
    f0, f1 = int(round(t0 * FPS)), int(round(t1 * FPS))
    total = f1 - f0
    L = {l['n']: l for l in D['lines'] if l['n'] in STALAK}
    txt = {l['n']: l['text'] for l in C.script_lines(ep)}
    r = lambda n, k: L[n][k] - t0
    cut = lambda n, upto: r(n, 't0') + (r(n, 't1') - r(n, 't0')) * len(upto) / len(txt[n])
    fin = r(14, 't1') - 0.25
    b = [0.0, r(12, 't0'), cut(12, 'Tu choisis ton son,'), r(13, 't0'), (r(13, 't0') + r(14, 't0')) / 2, r(14, 't0'),
         cut(14, 'Stalak coupe tes prises sur le rythme, lèvres synchro.'), fin, total / FPS]
    fb = [int(round(x * FPS)) for x in b]
    fb[-1] = total
    pieces, steps = [], []
    for k, (key, label, ps) in enumerate(PIECES):
        nf = fb[k + 1] - fb[k]
        (src, s0, s1, sp, snd), = ps
        if sp == 'fill':
            speed = (s1 - s0) / (nf / FPS)
        else:
            speed, s1 = sp, s0 + nf / FPS * sp
        if not 0.25 <= speed <= 16:
            print('WARNING : %s at %.2f×' % (key, speed))
        pieces.append(dict(slot=key, src=src, s0=s0, s1=round(s1, 3), speed=round(speed, 4), frames=nf, f0=fb[k], zoom='contain' if src == 'final' else 1.0, cx=.5, cy=.5, sound=snd))
        if label:
            steps.append(dict(text=label, t0=round(b[k] + (0.15 if k == 0 else 0.0), 3)))
    for i, s in enumerate(steps):
        s['t1'] = round(steps[i + 1]['t0'] if i + 1 < len(steps) else fin, 3)
    subs = []
    for n in STALAK:
        cs = PART_SUBS[n]
        plain = [c.replace('[', '').replace(']', '') for c in cs]
        assert ' '.join(plain) == txt[n], (plain, txt[n])  # the words of the card, nothing else
        tot, acc = sum(len(c) for c in plain), 0
        for c, cp in zip(cs, plain):
            a = r(n, 't0') + (r(n, 't1') - r(n, 't0')) * acc / tot
            acc += len(cp)
            subs.append(dict(text=c, t0=round(a, 3), t1=round(r(n, 't0') + (r(n, 't1') - r(n, 't0')) * acc / tot, 3)))
    for i in range(len(subs) - 1):
        if subs[i + 1]['t0'] - subs[i]['t1'] < 0.4:
            subs[i]['t1'] = subs[i + 1]['t0']
    big = round(fin + 0.1, 3)
    P = dict(fps=FPS, duration=round(total / FPS, 3), frames=total, lines=[dict(n=n, text=txt[n], t0=round(r(n, 't0'), 3), t1=round(r(n, 't1'), 3), real=True) for n in STALAK],
             pieces=pieces, subs=subs, steps=steps, big=big, card=[0.3, big])
    SP.PART = os.path.join(WORK, ep, 'stalak_part')
    os.makedirs(SP.PART, exist_ok=True)
    json.dump(P, open(os.path.join(SP.PART, 'part.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    for p in pieces:
        print('  %-4s %-5s %6.2f → %6.2f  ×%-6.2f %4d images' % (p['slot'], p['src'], p['s0'], p['s1'], p['speed'], p['frames']))
    SP.screen()
    d = os.path.join(WORK, ep)
    body = os.path.join(d, 'video_body.mp4')
    C.encode(ep)  # the body, from the pictures as they are now (video.mp4 is then replaced by the body with the part in it)
    shutil.copy(os.path.join(d, 'video.mp4'), body)
    n = SET[ep]
    # Big Mo in the set, as drawn in the video itself (shot 08), is the background of the part
    C.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', body, '-vf', 'trim=start_frame=%d:end_frame=%d,setpts=PTS-STARTPTS' % (f0, f1), '-an',
           '-c:v', 'libx264', '-preset', 'medium', '-crf', '12', '-g', '1', '-pix_fmt', 'yuv420p', '-colorspace', 'bt709', '-color_range', 'tv', os.path.join(SP.PART, 'bg-%02d.mp4' % n)])
    SP.hf(n)
    C.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', body, '-i', os.path.join(SP.PART, 'part-%02d.mp4' % n), '-filter_complex',
           '[0:v]trim=end_frame=%d,setpts=PTS-STARTPTS[a];[1:v]trim=end_frame=%d,setpts=PTS-STARTPTS[b];[0:v]trim=start_frame=%d,setpts=PTS-STARTPTS[c];[a][b][c]concat=n=3:v=1[v]' % (f0, total, f1),
           '-map', '[v]', '-c:v', 'libx264', '-preset', 'medium', '-crf', '16', '-pix_fmt', 'yuv420p', '-colorspace', 'bt709', '-color_range', 'tv', os.path.join(d, 'video.mp4')])
    nfr = int(C.run(['ffprobe', '-v', 'error', '-count_frames', '-select_streams', 'v:0', '-show_entries', 'stream=nb_read_frames', '-of', 'csv=p=0', os.path.join(d, 'video.mp4')]).stdout.strip())
    print('part : %d images laid over %.2f → %.2f s ; video %d images (%d expected)' % (total, t0, t1, nfr, int(round(D['duration'] * FPS))))


def audio(ep):
    p = os.path.join(WORK, ep, 'ep.json')
    D = json.load(open(p, encoding='utf-8'))
    scr = os.path.join(WORK, ep, 'stalak_part', 'screen.wav')
    D['sfx'] = [s for s in D['sfx'] if not os.path.isabs(s['name'])] + [dict(name=scr, t=D['stalak'][0], gain=0.4)]  # the recordings' own sound, low under Big Mo
    json.dump(D, open(p, 'w', encoding='utf-8'), ensure_ascii=False)
    orig = C.sfx_path
    C.sfx_path = lambda name: name if os.path.isabs(name) else orig(name)
    C.audio(ep)


if __name__ == '__main__':
    ep, step = sys.argv[1], sys.argv[2]
    if step == 'script':
        script(ep, sys.argv[3])
    else:
        todo = ['plan', 'frames', 'part', 'audio', 'mux', 'sheet', 'deliver', 'hd', 'thumb'] if step == 'all' else [step]
        fn = dict(voices=voices, plan=plan, frames=C.frames, part=part, audio=audio, mux=C.mux, sheet=C.sheet, deliver=C.deliver, hd=C.hd, thumb=C.thumb)
        for s in todo:
            fn[s](ep)
