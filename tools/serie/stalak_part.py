"""« BONNE IDÉE VS MAUVAISE IDÉE » : the Stalak part, the last 20 to 22 s, the same in every video (Marketing & croissance, 20/11/2026).

Big Mo explains Stalak while the owner's own iPhone screen recordings of stalak.app play on his phone (owner, 20/11 : « sur le
téléphone de Big Mo, découpés et accélérés si besoin, sans rien inventer. Garde l'igloo de fabrication et la vidéo finie qui
tourne »). Under the phone, a store-like card (logo, « Stalak · Ton clip playback monté sur le rythme », « Ouvrir ») ; on its
corner, the step of the site (1 Son, 2 Prises, 3 Paroles, 4 Montage) ; at the top, Big Mo's words, 2 to 4 at a time ; at the
end, the finished video bigger, « stalak.app » under it.

    SERIE_WORK=<work> python3 tools/serie/stalak_part.py <step> [set 1..6]

The recordings stay in the work folder (never in the repo) : <work>/stalak_part/src/
  r1.mp4    the home page, then « Importer la musique »                (18 h 45 min 12 s)
  r2.mp4    step 1 Son (the passage chosen with the handles), then step 2 Prises (« Filmer maintenant »)   (18 h 45 min 32 s)
  r4.mp4    step 3 Paroles (« Coller mes paroles »)                    (18 h 48 min 12 s)
  r5.mp4    the lyrics set on the voice, step 4 Montage playing, the igloo (export), « Ta vidéo est prête »   (18 h 49 min 56 s)
  final.mp4 the exported video (the free one : it has the watermark)  (stalak-v5-916.mp4)
Steps :
  plan   : the timeline → <work>/stalak_part/part.json. Big Mo's lines are timed on his voice once it exists
           (<work>/voice/bima-stalak/LNN.wav, generated once on the validated text), else on the length of the text ;
           every piece of recording is cut to its line : a piece at 1× keeps its speed (and its sound : the montage, the
           finished video), the « elastic » piece of a line is sped up or slowed to fill what is left.
  screen : the phone's screen → screen.mp4 (964 × 2090, all intra) and screen.wav (the sound of the 1× pieces)
  bg     : Big Mo in the set of the video (engine/storyboard.js, frame bima-stalak-0N, the set darkened behind him) → bg.mp4
  hf     : everything together through HyperFrames → part-N.mp4 (with screen.wav under it)
  sheet  : the contact sheet (tools/contact_sheet.py)
  all    : the five, in order
Sets : 1 the kitchen in the evening, 2 the bedroom, 3 the street, 4 the roof, 5 the kitchen in the morning, 6 the court.
"""
import json
import os
import shutil
import subprocess
import sys
import wave

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
WORK = os.environ.get('SERIE_WORK', '/tmp/serie')
PART = os.path.join(WORK, 'stalak_part')
SRC = os.path.join(PART, 'src')
FPS = 30
SW, SH = 964, 2090          # the screen, twice its size on the 1080 × 1920 picture (482 × 1045 : the iPhone's 1290 × 2796)
INK, BLUE, SNOW, GREEN = '#0a0d14', '#1f6fd6', '#fdfeff', '#1f9d55'
MO_COL = '#c98a06'          # Big Mo's colour (engine/frame.js, WHO)

# Big Mo's words : the base text of docs/marketing/FORMAT_BONNE_IDEE_VS_MAUVAISE_IDEE.md (« C'est simple. » closes the bridge,
# just before), the sentence of the lyrics put before the one of the cuts so that the 4 steps come in the site's order. The
# same words as in the 6 cards : never typed anywhere else. On screen 2 to 4 words at a time ; [green] : the word that matters.
LINES = [
    ("Va sur stalak.app. C'est gratuit, sans rien télécharger.", ["Va sur [stalak.app].", "C'est [gratuit],", "sans rien télécharger."]),
    ("Tu choisis ton son et le passage que tu veux.", ["Tu choisis ton son", "et le passage", "que tu veux."]),
    ("Tu te filmes plusieurs fois en playback, direct sur le site.", ["Tu te filmes", "plusieurs fois en playback,", "direct sur le site."]),
    ("Tu mets tes paroles à l'écran.", ["Tu mets tes paroles", "à l'écran."]),
    ("Stalak coupe tes prises sur le rythme, les lèvres bien synchro, et en quelques minutes, ton snippet est prêt pour TikTok et Insta.",
     ["Stalak coupe tes prises", "sur le rythme,", "les lèvres bien [synchro],", "et en quelques minutes,", "ton snippet est prêt", "pour TikTok et Insta."]),
]
LEAD, GAP, HOLD, FIN_EARLY = 0.12, 0.18, 1.8, 1.2   # before the first word, between two lines, the end (bigger, « stalak.app »), the finished video starts this much before the last word

# the pieces of each line : (recording, from, to, speed or 'fill', zoom, centre x, centre y, sound)
# zoom : the part of the screen shown (1 = all of it), around (centre x, centre y) in fractions of the screen
PIECES = {
    'L1': [('r1', 0.00, 1.10, 'fill', 1.0, .5, .5, False),           # the home page : « stalak.app », « Le montage de playback gratuit »
           ('r1', 1.10, 2.70, 1.0, 1.0, .5, .5, False)],              # down to « Choisis ton son »
    'L2': [('r2', 0.00, 1.00, 1.0, 1.0, .5, .5, False),               # step 1 : « neva die v3 », the whole song
           ('r2', 1.00, 5.10, 'fill', 1.0, .5, .5, False)],           # the handles : 65, 37, 19, 13, then 12 measures
    'L3': [('r2', 10.90, 15.00, 'fill', 1.0, .5, .5, False)],         # step 2 : « Importer mes vidéos », « Filmer maintenant »
    'L4': [('r4', 0.40, 1.70, 1.0, 1.0, .5, .5, False),               # step 3 : « Les paroles à l'écran », « Coller mes paroles »
           ('r5', 0.00, 2.70, 'fill', 1.0, .5, .5, False)],           # the lyrics set on the voice, phrase by phrase
    'L5a': [('r5', 20.50, None, 1.0, 1.0, .5, .5, True)],             # step 4 : the montage plays, cut on the beat, the lips in sync (its sound)
    'L5b': [('r5', 39.40, 67.20, 'fill', 1.0, .5, .5, False),         # the igloo : « Stalak construit ta vidéo », 5 → 100 %
            ('r5', 68.00, 68.80, 1.0, 1.0, .5, .5, False)],           # « Ta vidéo est prête ✓ » (from 68.0 : before it, the page loads, blank)
    'FIN': [('final', 0.00, None, 1.0, 'contain', .5, .5, True)],     # the finished video (the free export : its watermark stays in sight)
}
# (20/11 : no zoom inside the screen : the texts of the site run from edge to edge, any zoom cut them ; the recordings are
# shown whole, as they are, only cut and sped up)
STEPS = [('L1', 'STALAK.APP'), ('L2', '1 · SON'), ('L3', '2 · PRISES'), ('L4', '3 · PAROLES'), ('L5a', '4 · MONTAGE')]


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(' '.join(cmd)[:600]); print(r.stderr[-2000:])
        raise SystemExit('command failed')
    return r.stdout


def wav_len(p):
    with wave.open(p) as w:
        return w.getnframes() / w.getframerate()


def est(text):  # tools/serie/tcrazy.py : the length of a line before its voice exists (Big Mo ×1,15)
    return (0.3 + len(text) / 15.0) / 1.15


def src_len(name):
    return float(run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', os.path.join(SRC, name + '.mp4')]).strip())


# ---------------------------------------------------------------- the timeline
def plan():
    vdir = os.path.join(WORK, 'voice', 'bima-stalak')
    lines, t = [], LEAD
    for i, (text, chunks) in enumerate(LINES):
        p = os.path.join(vdir, 'L%02d.wav' % (i + 1))
        d = wav_len(p) if os.path.exists(p) else est(text)
        lines.append(dict(n=i + 1, text=text, t0=round(t, 3), t1=round(t + d, 3), real=os.path.exists(p)))
        t += d + GAP
    L5 = lines[4]
    cut = len("Stalak coupe tes prises sur le rythme, les lèvres bien synchro,") / len(L5['text'])  # the comma after « synchro »
    t5a = L5['t0'] + cut * (L5['t1'] - L5['t0'])
    end = L5['t1'] + HOLD
    fin = L5['t1'] - FIN_EARLY
    slots = dict(L1=(0.0, lines[1]['t0']), L2=(lines[1]['t0'], lines[2]['t0']), L3=(lines[2]['t0'], lines[3]['t0']),
                 L4=(lines[3]['t0'], lines[4]['t0']), L5a=(lines[4]['t0'], t5a), L5b=(t5a, fin), FIN=(fin, end))
    # each slot in whole pictures, one after the other, so that the screen video has exactly the length of the part
    pieces, f = [], 0
    for key in ('L1', 'L2', 'L3', 'L4', 'L5a', 'L5b', 'FIN'):
        a, b = slots[key]
        nf = int(round(b * FPS)) - f
        fixed = [p for p in PIECES[key] if p[3] != 'fill']
        nfix = 0
        for (r, s0, s1, sp, z, cx, cy, snd) in fixed:
            if s1 is not None:
                nfix += int(round((s1 - s0) / sp * FPS))
        fill_n = nf - nfix
        for (r, s0, s1, sp, z, cx, cy, snd) in PIECES[key]:
            if sp == 'fill':
                n = fill_n
                speed = (s1 - s0) / (n / FPS)
                if not 0.25 <= speed <= 16:
                    print('WARNING : %s %s %.2f-%.2f at %.2f×' % (key, r, s0, s1, speed))
            elif s1 is None:  # a 1× piece that lasts as long as what its slot leaves (and keeps its sound)
                n, speed = nf - nfix, sp
                s1 = s0 + n / FPS * sp
            else:
                n, speed = int(round((s1 - s0) / sp * FPS)), sp
            pieces.append(dict(slot=key, src=r, s0=s0, s1=round(s1, 3), speed=round(speed, 4), frames=n, f0=f, zoom=z, cx=cx, cy=cy, sound=snd))
            f += n
    total = f
    subs = []
    for l, (text, chunks) in zip(lines, LINES):  # the words, 2 to 4 at a time, in proportion to their length
        plain = [c.replace('[', '').replace(']', '') for c in chunks]
        tot, acc = sum(len(c) for c in plain), 0
        for c, cp in zip(chunks, plain):
            a = l['t0'] + (l['t1'] - l['t0']) * acc / tot
            acc += len(cp)
            b = l['t0'] + (l['t1'] - l['t0']) * acc / tot
            subs.append(dict(text=c, t0=round(a, 3), t1=round(b, 3)))
    for i in range(len(subs) - 1):  # each one stays until the next (across the small gap between two lines)
        if subs[i + 1]['t0'] - subs[i]['t1'] < GAP + 0.01:
            subs[i]['t1'] = subs[i + 1]['t0']
    steps = [dict(text=txt, t0=round(slots[k][0] + (0.15 if k == 'L1' else 0.0), 3), t1=round(slots[{'L1': 'L2', 'L2': 'L3', 'L3': 'L4', 'L4': 'L5a', 'L5a': 'FIN'}[k]][0], 3)) for k, txt in STEPS]
    P = dict(fps=FPS, duration=round(total / FPS, 3), frames=total, lines=lines, slots={k: [round(a, 3), round(b, 3)] for k, (a, b) in slots.items()},
             pieces=pieces, subs=subs, steps=steps, big=round(L5['t1'], 3), card=[0.3, round(L5['t1'], 3)])
    os.makedirs(PART, exist_ok=True)
    json.dump(P, open(os.path.join(PART, 'part.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('part : %.2f s (%d images), voice %s, finished video from %.2f s, bigger at %.2f s' % (
        P['duration'], total, 'real' if all(l['real'] for l in lines) else 'estimated', fin, L5['t1']))
    for p in pieces:
        print('  %-4s %-5s %6.2f → %6.2f  ×%-6.2f %4d images  zoom %s' % (p['slot'], p['src'], p['s0'], p['s1'], p['speed'], p['frames'], p['zoom']))
    return P


# ---------------------------------------------------------------- the phone's screen
def screen():
    P = json.load(open(os.path.join(PART, 'part.json'), encoding='utf-8'))
    tmp = os.path.join(PART, 'pieces')
    shutil.rmtree(tmp, ignore_errors=True)
    os.makedirs(tmp)
    lst = []
    for i, p in enumerate(P['pieces']):
        out = os.path.join(tmp, 'p%02d.mp4' % i)
        src = os.path.join(SRC, p['src'] + '.mp4')
        if p['zoom'] == 'contain':  # the finished video (9:16) whole on the screen, black above and under, as a phone plays it
            vf = 'setpts=(PTS-STARTPTS)/%s,fps=%d,scale=%d:-2:flags=lanczos,pad=%d:%d:(ow-iw)/2:(oh-ih)/2:color=black' % (p['speed'], FPS, SW, SW, SH)
        else:  # the part of the screen around (cx, cy), never past its edges
            z = p['zoom']
            vf = ('setpts=(PTS-STARTPTS)/%s,fps=%d,crop=w=trunc(iw/%s/2)*2:h=trunc(ih/%s/2)*2:x=max(0\\,min(iw-ow\\,iw*%s-ow/2)):y=max(0\\,min(ih-oh\\,ih*%s-oh/2)),'
                  'scale=%d:%d:flags=lanczos' % (p['speed'], FPS, z, z, p['cx'], p['cy'], SW, SH))
        vf += ',tpad=stop_mode=clone:stop_duration=2,setsar=1,format=yuv420p'
        dur_src = p['s1'] - p['s0'] + 0.5
        run(['ffmpeg', '-nostdin', '-y', '-v', 'error', '-ss', '%.3f' % p['s0'], '-t', '%.3f' % dur_src, '-i', src, '-an', '-vf', vf,
             '-frames:v', str(p['frames']), '-c:v', 'libx264', '-preset', 'medium', '-crf', '14', '-g', '1', '-r', str(FPS), out])
        n = int(run(['ffprobe', '-v', 'error', '-count_frames', '-select_streams', 'v:0', '-show_entries', 'stream=nb_read_frames', '-of', 'csv=p=0', out]).strip())
        if n != p['frames']:
            raise SystemExit('piece %d : %d images instead of %d' % (i, n, p['frames']))
        lst.append(out)
    with open(os.path.join(tmp, 'list.txt'), 'w') as fh:
        fh.writelines("file '%s'\n" % x for x in lst)
    run(['ffmpeg', '-nostdin', '-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', os.path.join(tmp, 'list.txt'), '-c', 'copy', os.path.join(PART, 'screen.mp4')])
    # the sound of the pieces at 1× that have one (the montage as it plays, the finished video), each in its place, faded at its edges
    parts = []
    for i, p in enumerate(P['pieces']):
        if not p['sound']:
            continue
        d = p['frames'] / FPS
        a = os.path.join(tmp, 'a%02d.wav' % i)
        run(['ffmpeg', '-nostdin', '-y', '-v', 'error', '-ss', '%.3f' % p['s0'], '-t', '%.3f' % d, '-i', os.path.join(SRC, p['src'] + '.mp4'), '-vn',
             '-af', 'aresample=48000,loudnorm=I=-18:TP=-2:LRA=11,afade=t=in:d=0.06,afade=t=out:st=%.3f:d=0.12' % max(0, d - 0.12), '-ac', '2', a])
        parts.append((p['f0'] / FPS, a))
    sfx = os.path.join(ROOT, 'promo', 'youtube', 'short', 'assets', 'sfx')
    for t0, name, db in [(0.0, 'whoosh-short.mp3', -16)] + [(s['t0'], 'pop.mp3', -20) for s in P['steps']] + [(P['big'], 'whoosh-short.mp3', -18)]:
        a = os.path.join(tmp, 'x%05d.wav' % int(t0 * 1000))
        run(['ffmpeg', '-nostdin', '-y', '-v', 'error', '-i', os.path.join(sfx, name), '-af', 'aresample=48000,volume=%ddB' % db, '-ac', '2', a])
        parts.append((t0, a))
    inputs, filt = [], []
    for k, (t0, a) in enumerate(parts):
        inputs += ['-i', a]
        filt.append('[%d:a]adelay=%d|%d[d%d]' % (k, int(t0 * 1000), int(t0 * 1000), k))
    mix = ';'.join(filt) + ';' + ''.join('[d%d]' % k for k in range(len(parts))) + 'amix=inputs=%d:normalize=0,apad=whole_dur=%.3f[o]' % (len(parts), P['duration'])
    run(['ffmpeg', '-nostdin', '-y', '-v', 'error'] + inputs + ['-filter_complex', mix, '-map', '[o]', '-t', '%.3f' % P['duration'], '-ar', '48000', os.path.join(PART, 'screen.wav')])
    print('screen : %d pieces, %.2f s → %s' % (len(lst), P['duration'], os.path.join(PART, 'screen.mp4')))


# ---------------------------------------------------------------- Big Mo in the set (the series engine)
def bg(set_n=1):
    sys.path.insert(0, HERE)
    import tcrazy as C
    P = json.load(open(os.path.join(PART, 'part.json'), encoding='utf-8'))
    ep = 'bima-stalak-%02d' % set_n
    D = dict(ep=ep, fps=FPS, duration=P['duration'], shots=[dict(frame=ep, t0=0.0, t1=P['duration'], dip=False)],
             lines=[dict(n=l['n'], who='bigmo', t0=l['t0'], t1=l['t1'], env=[], real=False) for l in P['lines']],
             subs=[], music=[], sfx=[], preload=['/site_src/icons/icon.svg'])
    vdir = os.path.join(WORK, 'voice', 'bima-stalak')
    for l in D['lines']:  # once the voice exists : the mouth on it (30 values per second, as tcrazy.py does)
        p = os.path.join(vdir, 'L%02d.wav' % l['n'])
        if os.path.exists(p):
            l['env'] = C.envelope(C.read_audio(p)); l['real'] = True
    os.makedirs(os.path.join(C.WORK, ep), exist_ok=True)
    json.dump(D, open(os.path.join(C.WORK, ep, 'ep.json'), 'w', encoding='utf-8'), ensure_ascii=False)
    C.frames(ep)
    shutil.copy(os.path.join(C.WORK, ep, 'video.mp4'), os.path.join(PART, 'bg-%02d.mp4' % set_n))
    print('bg :', os.path.join(PART, 'bg-%02d.mp4' % set_n))


# ---------------------------------------------------------------- everything together (HyperFrames)
def _words(c):  # « Va sur [stalak.app]. » : the word that matters in green
    import html
    out, rest = '', c
    while '[' in rest:
        a, b = rest.index('['), rest.index(']')
        out += html.escape(rest[:a]) + '<span class="g">%s</span>' % html.escape(rest[a + 1:b])
        rest = rest[b + 1:]
    return out + html.escape(rest)


def hf(set_n=1):
    P = json.load(open(os.path.join(PART, 'part.json'), encoding='utf-8'))
    proj = os.path.join(PART, 'hf')
    shutil.rmtree(proj, ignore_errors=True)
    os.makedirs(os.path.join(proj, 'assets', 'fonts'))
    for fnt in ('lilitaone.ttf', 'rubik.ttf'):
        shutil.copy(os.path.join(ROOT, 'site_src', 'fonts', fnt), os.path.join(proj, 'assets', 'fonts', fnt))
    shutil.copy(os.path.join(ROOT, 'site_src', 'icons', 'icon.svg'), os.path.join(proj, 'assets', 'icon.svg'))
    shutil.copy(os.path.join(WORK, 'hfcache', 'gsap.min.js'), os.path.join(proj, 'assets', 'gsap.min.js'))
    shutil.copy(os.path.join(PART, 'screen.mp4'), os.path.join(proj, 'assets', 'screen.mp4'))
    shutil.copy(os.path.join(PART, 'bg-%02d.mp4' % set_n), os.path.join(proj, 'assets', 'bg.mp4'))
    D, big = P['duration'], P['big']
    clip = lambda i, a, b, extra='': 'id="%s" class="clip" data-start="%.3f" data-duration="%.3f" data-track-index="%s"%s' % (i, a, b - a, 3, extra)
    subs = '\n'.join('<div %s><div class="sub-in"><div class="sub-card"><span class="sub-tab">BIG MO</span>%s</div></div></div>' % (
        clip('s%02d' % k, s['t0'], s['t1']).replace('class="clip"', 'class="clip sub"'), _words(s['text'])) for k, s in enumerate(P['subs']))
    steps = '\n'.join('<div %s><div class="step-in">%s</div></div>' % (clip('st%d' % k, s['t0'], s['t1']).replace('class="clip"', 'class="clip step"'), s['text'])
                      for k, s in enumerate(P['steps']))
    # the phone : 518 × 1081 (the screen 482 × 1045 inside an 18 px edge), its top left corner at 431, 320 ; at the end, bigger, in the middle
    html_ = """<!doctype html>
<html><head><meta charset="utf-8">
<style>
@font-face { font-family: 'Lilita One'; src: url('assets/fonts/lilitaone.ttf'); }
@font-face { font-family: 'Rubik'; src: url('assets/fonts/rubik.ttf'); font-weight: 300 900; }
html, body { margin: 0; background: %(ink)s; }
#root { position: relative; width: 1080px; height: 1920px; overflow: hidden; background: %(ink)s; }
#bg { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; z-index: 1; }
#phone { position: absolute; left: 431px; top: 320px; width: 518px; height: 1081px; z-index: 5; transform-origin: 50%% 50%%; }
#phone .shadow { position: absolute; left: 12px; top: 16px; width: 518px; height: 1081px; border-radius: 62px; background: %(ink)s; opacity: .55; }
#phone .body { position: absolute; inset: 0; border-radius: 62px; background: #2a2d36; border: 9px solid %(ink)s; box-sizing: border-box; }
#phone .scr { position: absolute; left: 18px; top: 18px; width: 482px; height: 1045px; border-radius: 44px; overflow: hidden; background: #000; }
#scr { position: absolute; left: 0; top: 0; width: 482px; height: 1045px; object-fit: fill; }
#phone .glare { position: absolute; left: -300px; top: 0; width: 160px; height: 1045px; background: linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,.16), rgba(255,255,255,0)); transform: skewX(-18deg); }
.step { position: absolute; right: 655px; top: 386px; z-index: 7; }  /* over the set, left of the phone, above Big Mo's head (20/11 : on the phone's corner it went under the words) */
.step-in { font: 50px 'Lilita One'; color: %(snow)s; background: %(blue)s; border: 6px solid %(ink)s; border-radius: 999px; padding: 4px 28px 8px; box-shadow: 6px 8px 0 %(ink)s; white-space: nowrap; transform: rotate(-6deg); }
#card { position: absolute; left: 390px; top: 1414px; width: 560px; height: 112px; z-index: 6; }
#card .in { position: absolute; inset: 0; display: flex; align-items: center; gap: 14px; padding: 0 16px; box-sizing: border-box; background: %(snow)s; border: 5px solid %(ink)s; border-radius: 26px; box-shadow: 6px 8px 0 %(ink)s; }
#card img { width: 72px; height: 72px; flex: none; }
#card .txt { flex: 1; min-width: 0; }
#card .name { font: 36px/1 'Lilita One'; color: %(ink)s; }
#card .tag { font: 600 21px/1.18 'Rubik'; color: #5b6170; margin-top: 4px; }
#card .open { flex: none; font: 800 26px 'Rubik'; color: %(snow)s; background: %(blue)s; border: 4px solid %(ink)s; border-radius: 999px; padding: 8px 22px 10px; }
.sub { position: absolute; left: 0; top: 0; width: 1080px; height: 310px; z-index: 8; }  /* the name tab stays below the top band hidden by TikTok */
.sub-in { position: absolute; left: 0; right: 0; bottom: 0; display: flex; justify-content: center; transform-origin: 50%% 100%%; }
.sub-card { position: relative; font: 800 44px/56px 'Rubik'; color: %(ink)s; background: %(snow)s; border: 6px solid %(ink)s; border-radius: 22px; padding: 22px 36px 20px; box-shadow: 8px 10px 0 %(ink)s; white-space: nowrap; }
.sub-tab { position: absolute; left: 12px; top: -40px; font: 34px/44px 'Lilita One'; color: %(snow)s; background: %(mo)s; border: 5px solid %(ink)s; border-radius: 26px; padding: 0 20px; transform: rotate(-3deg); transform-origin: 0 100%%; }
.g { color: %(green)s; }
#url { position: absolute; left: 0; top: 1412px; width: 1080px; height: 130px; z-index: 9; }
#url svg { position: absolute; left: 0; top: 0; }
</style></head>
<body>
<div id="root" data-composition-id="part" data-start="0" data-duration="%(dur).3f" data-width="1080" data-height="1920">
  <video id="bg" class="clip" data-start="0" data-duration="%(dur).3f" data-track-index="0" src="assets/bg.mp4" muted playsinline></video>
  <div id="phone"><div class="shadow"></div><div class="body"></div>
    <div class="scr"><video id="scr" class="clip" data-start="0" data-duration="%(dur).3f" data-track-index="1" src="assets/screen.mp4" muted playsinline></video><div class="glare"></div></div>
  </div>
  <div %(cardclip)s><div class="in"><img src="assets/icon.svg" alt=""><div class="txt"><div class="name">Stalak</div><div class="tag">Ton clip playback monté sur le rythme</div></div><div class="open">Ouvrir</div></div></div>
  %(steps)s
  %(subs)s
  <div %(urlclip)s><svg width="1080" height="130" viewBox="0 0 1080 130"><text x="548" y="104" text-anchor="middle" font-family="Lilita One" font-size="104" fill="%(ink)s">stalak.app</text><text x="540" y="96" text-anchor="middle" font-family="Lilita One" font-size="104" fill="%(snow)s" stroke="%(ink)s" stroke-width="14" paint-order="stroke" stroke-linejoin="round">stalak.app</text></svg></div>
</div>
<script src="assets/gsap.min.js"></script>
<script>
  window.__timelines = window.__timelines || {};
  var tl = gsap.timeline({ paused: true }), D = %(dur).3f, BIG = %(big).3f;
  // the phone comes up as Big Mo starts, then drifts a little (never still) ; at the end, bigger, in the middle
  tl.fromTo('#phone', { y: 150, scale: 0.92, opacity: 0, rotation: -2 }, { y: 0, scale: 1, opacity: 1, rotation: -1.2, duration: 0.45, ease: 'power3.out' }, 0);
  tl.to('#phone', { rotation: 0.8, y: -8, duration: BIG - 0.45, ease: 'sine.inOut' }, 0.45);
  tl.to('#phone', { x: -150, y: -90, scale: 1.2, rotation: 0, duration: 0.6, ease: 'power2.inOut' }, BIG);
  // a shine crosses the glass now and then
  [2.2, 9.6, 16.4].forEach(function (t) { if (t < BIG) tl.fromTo('#phone .glare', { x: 0 }, { x: 1000, duration: 1.0, ease: 'power1.inOut' }, t); });
  // the store card slides up under the phone, and goes when the phone grows
  tl.fromTo('#card .in', { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: 'power3.out' }, %(card0).3f);
  tl.to('#card .in', { y: 40, opacity: 0, duration: 0.22, ease: 'power2.in' }, BIG - 0.24);
  // the steps pop on the corner of the phone
  document.querySelectorAll('.step').forEach(function (el) {
    var a = parseFloat(el.dataset.start);
    tl.fromTo(el.querySelector('.step-in'), { scale: 0.55, rotation: -16, opacity: 0 }, { scale: 1, rotation: -6, opacity: 1, duration: 0.32, ease: 'back.out(2.2)' }, a);
  });
  // Big Mo's words : each card pops (as the series' subtitles do)
  document.querySelectorAll('.sub').forEach(function (el) {
    var a = parseFloat(el.dataset.start);
    tl.fromTo(el.querySelector('.sub-in'), { scale: 0.86 }, { scale: 1, duration: 0.24, ease: 'power2.out' }, a);
  });
  // « stalak.app » under the finished video
  tl.fromTo('#url svg', { y: 50, opacity: 0, scale: 0.8 }, { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.8)' }, BIG + 0.25);
  window.__timelines['part'] = tl;
</script>
</body></html>
""" % dict(ink=INK, snow=SNOW, blue=BLUE, green=GREEN, mo=MO_COL, dur=D, big=big, card0=P['card'][0] + 0.01, steps=steps, subs=subs,
           cardclip=clip('card', P['card'][0], big), urlclip=clip('url', big, D))
    open(os.path.join(proj, 'index.html'), 'w', encoding='utf-8').write(html_)
    env = dict(os.environ)
    env.setdefault('HYPERFRAMES_BROWSER_PATH', '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome')
    out = os.path.join(PART, 'part_hf.mp4')
    r = subprocess.run(['npx', '-y', 'hyperframes', 'render', proj, '-o', out, '--quality', 'high', '--fps', str(FPS), '--quiet'], capture_output=True, text=True, env=env)
    if r.returncode != 0:
        print(r.stdout[-3000:], r.stderr[-3000:])
        raise SystemExit('hyperframes render failed')
    final = os.path.join(PART, 'part-%02d.mp4' % set_n)
    run(['ffmpeg', '-nostdin', '-y', '-v', 'error', '-i', out, '-i', os.path.join(PART, 'screen.wav'), '-map', '0:v', '-map', '1:a', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17',
         '-pix_fmt', 'yuv420p', '-vf', 'scale=in_range=pc:out_range=tv:out_color_matrix=bt709', '-colorspace', 'bt709', '-color_range', 'tv',
         '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', final])
    print('part :', final)


def sheet(set_n=1):
    v = os.path.join(PART, 'part-%02d.mp4' % set_n)
    run([sys.executable, os.path.join(ROOT, 'tools', 'contact_sheet.py'), v, '--out', os.path.join(PART, 'planche-%02d' % set_n)])
    print('sheet :', os.path.join(PART, 'planche-%02d' % set_n))


if __name__ == '__main__':
    step = sys.argv[1] if len(sys.argv) > 1 else 'all'
    n = int(sys.argv[2]) if len(sys.argv) > 2 else 1
    if step in ('plan', 'all'):
        plan()
    if step in ('screen', 'all'):
        screen()
    if step in ('bg', 'all'):
        bg(n)
    if step in ('hf', 'all'):
        hf(n)
    if step in ('sheet', 'all'):
        sheet(n)
