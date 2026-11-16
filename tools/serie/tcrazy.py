"""Série « T-Crazy » — make an episode from its validated script and storyboard (Marketing & croissance, 16/11/2026).

    SERIE_WORK=<work> python3 tools/serie/tcrazy.py <ep> <step> [...]

The order of the steps :
  prompts : the voice of each line, as Flora requests (Gemini TTS) → <work>/<ep>/voice_requests.json. The voice is generated
            ONCE, line by line, on the validated text (owner, 16/11 : « réplique par réplique mais faut que ça reste réaliste »).
  voices  : <work>/voice/<ep>/raw/LNN.wav (downloaded) → trimmed, faster for Liam (×1,1) and the narrator (×1,2) → <work>/voice/<ep>/LNN.wav
  plan    : the timeline (shots, lines, subtitles, music) → <work>/<ep>/ep.json
  frames  : every image, drawn by engine/anim.html (Playwright, 30 images/s) → <work>/<ep>/video.mp4 (no sound) : quick checks
  hf      : the same images through HyperFrames (owner, 16/11 : « utilise aussi hyperframes ») : the engine is the runtime of a
            HyperFrames composition, with the registry's light leak on each change of time and a vignette in the evening
            → <work>/<ep>/video.mp4 (no sound ; about 12-15 min per episode on 2 processors ; HYPERFRAMES_BROWSER_PATH = an installed Chrome)
  audio   : the 4 Pixabay ambiences under the voices, a few sound effects, -14 LUFS → <work>/<ep>/mix.wav
  mux     : → <work>/<ep>/<ep>.mp4 (publication) and <ep>-720.mp4 (for Studio Stalak, under 20 MB)
  sheet   : the contact sheet, one image every 0.5 s (tools/contact_sheet.py)
  thumb   : the thumbnail, drawn in the series style → <work>/<ep>/<ep>-miniature.jpg
The words come from <work>/scripts/<card>.json (the card exported from Studio Stalak) : never typed again.
Renders, voices and music stay in the work folder, never in the repo.
"""
import functools
import http.server
import json
import math
import os
import re
import shutil
import subprocess
import sys
import threading
import wave

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(HERE, 'episodes'))
import tcrazy_eps as T  # noqa: E402

WORK = os.environ.get('SERIE_WORK', '/tmp/serie')
FPS, SR = 30, 48000
SFX = os.path.join(ROOT, 'promo/youtube/short/assets/sfx')
MUSIC = os.path.join(WORK, 'musique')
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')


def run(cmd):
    return subprocess.run(cmd, check=True, capture_output=True, text=True)


def read_audio(path, ch=1):
    raw = subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-i', path, '-ac', str(ch), '-ar', str(SR), '-f', 'f32le', '-'], check=True, capture_output=True).stdout
    x = np.frombuffer(raw, dtype=np.float32).copy()
    return x.reshape(-1, ch) if ch > 1 else x


def write_wav(path, x):
    x = np.clip(x, -1, 1)
    ch = 1 if x.ndim == 1 else x.shape[1]
    with wave.open(path, 'wb') as w:
        w.setnchannels(ch); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())


# ---------------------------------------------------------------- the script
LINE_RX = re.compile(r'^([A-ZÉÈ][A-ZÉÈ .]+?)(?: \(([^)]*)\))? : « (.+?) »')


def script_lines(ep):
    """the spoken lines of the validated script, numbered from 1 : [{n, who, text, note}]"""
    E = T.EPISODES[ep]
    card = json.load(open(os.path.join(WORK, 'scripts', E['card'] + '.json'), encoding='utf-8'))
    text = card.get('data', card)['script']
    out = []
    for ln in text.split('\n'):
        m = LINE_RX.match(ln.strip())
        if m:
            out.append(dict(n=len(out) + 1, who=T.SPEAKERS[m.group(1)], text=m.group(3), note=m.group(2) or ''))
    return out


def sentences(text):
    """the sentences of a line, for a shot that changes in the middle of it (« M. Reyes » is not a sentence end)"""
    parts = re.split(r'(?<=[.!?])\s+(?=[A-ZÉÈÀ0-9«])', text)
    out = []
    for p in parts:
        if out and re.search(r'\bM\.$', out[-1]):
            out[-1] += ' ' + p
        else:
            out.append(p)
    return out


# ---------------------------------------------------------------- the voices
def prompts(ep):
    E, L = T.EPISODES[ep], script_lines(ep)
    raw = os.path.join(WORK, 'voice', ep, 'raw')
    req = []
    for l in L:
        if l['n'] in E['same']:
            continue
        if os.path.exists(os.path.join(raw, 'L%02d.wav' % l['n'])):  # a recording kept from before (same text) : never paid twice
            continue
        who = l['who']
        if not T.VOICES.get(who):
            print('NO VOICE YET for', who, '(line %d)' % l['n'])
            continue
        d = E['direction'].get(l['n'])
        how = (d + ', ' if d else '') + ('with a smooth natural pace' if who == 'narrateur' else 'realistic and natural, not exaggerated, natural pace')
        req.append(dict(n=l['n'], who=who, voice=T.VOICES[who],
                        prompt='Say in French, as %s, %s, no added pauses: "%s"' % (T.PERSONA[who], how, l['text'])))
    os.makedirs(os.path.join(WORK, ep), exist_ok=True)
    json.dump(req, open(os.path.join(WORK, ep, 'voice_requests.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('%d lines to generate (%.3f $)' % (len(req), 0.013 * len(req)))
    return req


def trim(x):
    a = np.abs(x)
    thr = max(1e-3, 0.02 * np.percentile(a, 99.5))
    idx = np.where(a > thr)[0]
    if not len(idx):
        return x
    s, e = max(0, idx[0] - int(0.02 * SR)), min(len(x), idx[-1] + int(0.08 * SR))
    return x[s:e]


def squeeze(x, longest=0.30, keep=0.18):
    """the pauses inside a line : none longer than `longest` s (cut down to `keep` s), so that nobody sounds slow
    (owner, 16/11 : « tous les personnages parlent trop lentement » ; and he does not want added pauses)"""
    hop = int(0.01 * SR)
    n = len(x) // hop
    if n < 10:
        return x
    e = np.array([np.sqrt(np.mean(x[k * hop:(k + 1) * hop] ** 2)) for k in range(n)])
    sil = e < max(1e-4, 0.05 * np.percentile(e, 95))
    out, pos, k = [], 0, 0
    while k < n:
        if sil[k]:
            j = k
            while j < n and sil[j]:
                j += 1
            if k > 0 and j < n and (j - k) * hop > longest * SR:
                cut_a, cut_b = k * hop + int(keep / 2 * SR), j * hop - int(keep / 2 * SR)
                out.append(x[pos:cut_a]); pos = cut_b
            k = j
        else:
            k += 1
    out.append(x[pos:])
    return np.concatenate(out)


def voices(ep):
    E, L = T.EPISODES[ep], script_lines(ep)
    raw, out = os.path.join(WORK, 'voice', ep, 'raw'), os.path.join(WORK, 'voice', ep)
    for l in L:
        n = E['same'].get(l['n'], l['n'])
        src = os.path.join(raw, 'L%02d.wav' % n)
        if not os.path.exists(src):
            print('missing', src); continue
        sp = T.SPEED.get(l['who'], 1.0)
        tmp = os.path.join(out, '_t.wav')
        if sp != 1.0:
            run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', src, '-filter:a', 'atempo=%.3f' % sp, '-ar', str(SR), '-ac', '1', tmp])
        else:
            run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', src, '-ar', str(SR), '-ac', '1', tmp])
        x = squeeze(trim(read_audio(tmp)))
        # every voice at the same loudness before the mix
        rms = np.sqrt(np.mean(x ** 2)) + 1e-9
        x = x * (0.09 / rms)
        write_wav(os.path.join(out, 'L%02d.wav' % l['n']), x)
        os.remove(tmp)
        print('L%02d %-9s %.2f s' % (l['n'], l['who'], len(x) / SR))


# ---------------------------------------------------------------- the timeline
def envelope(x):
    """the mouth opening for each image (0..1), from the loudness of the voice"""
    hop = SR // FPS
    n = int(math.ceil(len(x) / hop))
    rms = np.array([np.sqrt(np.mean(x[k * hop:(k + 1) * hop] ** 2) + 1e-12) for k in range(n)])
    ref = np.percentile(rms, 90) + 1e-9
    v = np.clip((rms / ref - 0.15) / 0.85, 0, 1)
    return [round(float(a), 3) for a in v]


# a subtitle line never ends on one of these little words (« le », « de », « qui »…)
WEAK = set('le la les un une des du de à au aux en et ou sa son ses mon ma mes ton ta tes ce cet cette qui que dans sur pour par avec il elle on je tu ne se y'.split())


def split_best(words, maxc):
    """a sentence too long for one subtitle : cut where both parts stay readable (20 characters at least if possible), as even
    as possible, rather after a comma or a colon, never after a little word nor before « de »"""
    s = ' '.join(words)
    if len(s) <= maxc or len(words) < 2:
        return [s]
    best = None
    for least in (20, 12):  # no piece shorter than 20 characters if it can be helped
        for i in range(1, len(words)):
            left, right = ' '.join(words[:i]), ' '.join(words[i:])
            if len(left) < least or len(right) < least:
                continue
            cost = max(len(left), len(right)) + (0 if re.search(r'[.!?,…:;]$', words[i - 1]) else 14) + (40 if words[i - 1].lower() in WEAK else 0) \
                + (10 if words[i].lower() in ('de', 'du', 'des') else 0)
            if best is None or cost < best[0]:
                best = (cost, i)
        if best:
            break
    i = best[1] if best else len(words) // 2
    return split_best(words[:i], maxc) + split_best(words[i:], maxc)


def chunks(text, maxc=62, merge=50, short=20):
    """subtitles : whole sentences when they fit ; a sentence too long for the screen is cut in readable pieces (split_best)
    (split on plain spaces only, so « décalée ?! » stays whole). Short pieces join their neighbour (since EP4, 16/11 :
    no subtitle of three words flashing for one second, no cut in the middle of a sentence when it fits)."""
    text = re.sub(r' ([?!:;»])', '\u00a0\\1', text).replace('« ', '«\u00a0')  # French typography : no orphan « ?! » at a line start
    text = re.sub(r'\b(GTA) (\d)', '\\1\u00a0\\2', text)  # « GTA 6 » never cut in two (16/11, contact sheet of « Le clip façon GTA »)
    units = []
    for sen in sentences(text):
        units += split_best([w for w in sen.split(' ') if w], maxc)
    out = []
    for u in units:
        if out and (len(out[-1]) + 1 + len(u) <= merge or ((len(u) < short or len(out[-1]) < short) and len(out[-1]) + 1 + len(u) <= maxc)):
            out[-1] += ' ' + u
        else:
            out.append(u)
    # a piece still very short (« Pas mal. » before a long sentence : 0.3 s on screen, unreadable) is cut again with its
    # neighbour into two readable halves (HyperFrames check, 16/11 : « line_unread »)
    i = 0
    while i < len(out):
        if len(out[i]) < 14 and len(out) > 1:
            a = i if i + 1 < len(out) else i - 1
            both = (out[a] + ' ' + out[a + 1]).split(' ')
            parts = split_best(both, maxc) if len(' '.join(both)) > maxc else [' '.join(both)]
            out[a:a + 2] = parts
            i = a + len(parts)
        else:
            i += 1
    return out


def typo(text):
    """French typography for the screen : a non-breaking space before ? ! : ; » and after «, so they never start a line"""
    return re.sub(r' ([?!:;»])', '\u00a0\\1', text).replace('« ', '«\u00a0')


def is_cri(l):
    """the shout of the hook : the first line, « (crie) » in the script. Only that one is written big, word by word ; every
    other line, even shouted, is a normal subtitle (owner, 16/11 at 16 h 34 : « en sous-titre normal, pas comme celui de l'intro »)"""
    return l['n'] == 1 and 'crie' in (l.get('note') or '')


def word_times(x, a, b, text):
    """when each word of a shout appears : by length within the voice, a little before it is said"""
    words = [w for w in text.split(' ') if w]
    tot = sum(len(w) + 1 for w in words)
    out, acc = [], 0
    for w in words:
        out.append(round(a + (b - a) * 0.94 * acc / tot - 0.04, 3))
        acc += len(w) + 1
    out[0] = round(a, 3)
    return out


_BEATS = {}


def beats_of(track):
    """(seconds per beat, time of the first beat) of a music, measured once with librosa and kept in <work>/musique/beats.json"""
    if track in _BEATS:
        return _BEATS[track]
    fn = os.path.join(MUSIC, 'beats.json')
    cache = json.load(open(fn)) if os.path.exists(fn) else {}
    name = T.TRACKS.get(track)
    if not name:
        return (0.5, 0.0)
    if name not in cache:
        import librosa
        y, sr = librosa.load(os.path.join(MUSIC, name), sr=22050, mono=True, duration=90)
        tempo, bt = librosa.beat.beat_track(y=y, sr=sr, units='time')
        per = float(np.median(np.diff(bt))) if len(bt) > 4 else 60.0 / float(np.atleast_1d(tempo)[0])
        cache[name] = [per, float(bt[0]) if len(bt) else 0.0]
        json.dump(cache, open(fn, 'w'))
    _BEATS[track] = tuple(cache[name])
    return _BEATS[track]


def chunk_times(x, a, b, cs):
    """when each subtitle of a piece of voice starts : by length, moved to the nearest pause of the voice (± 0.4 s), so
    that a subtitle changes when the speaker breathes. x = the voice of that piece (None : by length only)."""
    tot = sum(len(c) for c in cs)
    prop = [a]
    for c in cs[:-1]:
        prop.append(prop[-1] + (b - a) * len(c) / tot)
    if x is None or len(cs) < 2 or len(x) < SR // 2:
        return prop + [b]
    q = [a + v for v in split_points(x, None, cs)]
    bounds = q + [b]
    for i in range(len(cs)):  # never a piece much shorter than its share of the text
        if bounds[i + 1] - bounds[i] < 0.6 * (b - a) * len(cs[i]) / tot:
            return prop + [b]
    return bounds


def est(text, who):
    return (0.3 + len(text) / 15.0) / T.SPEED.get(who, 1.0)


def split_points(x, text, parts):
    """where each sentence of a line starts, in seconds : by their length, moved to the nearest pause of the voice"""
    d = len(x) / SR if x is not None else None
    tot = sum(len(p) for p in parts)
    pts, acc = [0.0], 0
    for p in parts[:-1]:
        acc += len(p) + 1
        g = acc / (tot + len(parts) - 1)
        if x is None:
            pts.append(g); continue
        hop = SR // 100
        e = np.array([np.sqrt(np.mean(x[k:k + hop] ** 2)) for k in range(0, len(x) - hop, hop)])
        c = int(g * len(e)); w = 40  # ± 0.4 s
        lo, hi = max(1, c - w), min(len(e) - 1, c + w)
        k = lo + int(np.argmin(np.convolve(e[lo:hi], np.ones(8) / 8, mode='same')))
        pts.append(k / len(e))
    return [p * (d or 1.0) for p in pts]  # fractions when there is no voice yet (multiplied later)


def plan(ep):
    """the timeline. First without any pause added ; if the episode is shorter than T.TARGET, the shots that are shorter
    than in the storyboard get the missing time (a pause before and after their lines), in proportion."""
    D, nat = _build(ep, {})
    times = T.TIMES[ep]
    missing = T.TARGET - D['duration']
    if missing > 0:
        E = T.EPISODES[ep]
        defi = {}
        for k, (frame, refs, opt) in enumerate(E['shots'][:-1]):
            if opt.get('fixed'):  # a shot whose actions are timed on its lines (storyboard K) : never moved
                continue
            want = times[k + 1] - times[k]
            starts_mid = bool(refs) and re.match(r'\d+[bc]$', str(refs[0]))
            ends_mid = nat[k]['mid']
            if not (starts_mid and ends_mid):
                defi[k] = max(0.0, want - nat[k]['dur'])
        cap = {}
        for k in defi:  # small : no blank between two lines (owner, 16/11 : « il faut cut à ce moment la séquence, il y a un blanc »)
            refs = E['shots'][k][1]
            can_lead = k > 0 and bool(refs) and not re.match(r'\d+[bc]$', str(refs[0]))
            cap[k] = (0.15 if can_lead else 0.0, 0.0 if nat[k]['mid'] else 0.2)
        hold = {k: 0.0 for k in defi}
        left = missing
        for _ in range(8):  # in proportion to what each shot lacks, never over its cap
            open_ = {k: dv for k, dv in defi.items() if hold[k] < sum(cap[k]) - 1e-6 and dv > hold[k]}
            tot = sum(defi[k] - hold[k] for k in open_)
            if left <= 1e-3 or tot <= 0:
                break
            f = min(1.0, left / tot)
            for k in open_:
                add = min((defi[k] - hold[k]) * f, sum(cap[k]) - hold[k])
                hold[k] += add; left -= add
        pad = {}
        for k, h in hold.items():
            lead = min(cap[k][0], 0.3 * h) if cap[k][1] > 0 else min(cap[k][0], h)
            pad[k] = (lead, min(cap[k][1], h - lead))
        D, nat = _build(ep, pad)
    _save(ep, D)
    return D


def _build(ep, pad):
    """the timeline : each line where its voice falls, each shot on screen while its lines are spoken, the subtitles,
    the music changes. A shot may change in the middle of a line, between two of its sentences ('7a', '7b')."""
    E, L = T.EPISODES[ep], {l['n']: l for l in script_lines(ep)}
    vdir = os.path.join(WORK, 'voice', ep)
    GAP, CUT, LEAD = 0.22, 0.32, 0.18  # between two lines of a shot, at a cut, before the first shout
    t, shots, lines, subs, music, sfx, placed, nat = 0.0, [], [], [], [], [], {}, []
    for k, (frame, refs, opt) in enumerate(E['shots']):
        t0 = t
        if 'music' in opt:
            music.append(dict(track=opt['music'], t=round(t0, 3)))
        for name, at, gain in opt.get('sfx', []):
            if at >= 0:  # from the start of the shot ; a negative time counts from its end (placed below)
                sfx.append(dict(name=name, t=round(t0 + at, 3), gain=gain))
        pl, pa = pad.get(k, (0.0, 0.0))
        lead = opt.get('lead', 0.0) + pl
        if opt.get('dip'):  # a change of time or place : the picture comes out of the dark and its caption is read before
            lead = max(lead, 1.0)  # anyone speaks (owner, 16/11 at 17 h 04 : « un enfant doit pouvoir comprendre »)
        cur, mid = t0 + (LEAD if k == 0 else 0.0) + lead, False
        for j, ref in enumerate(refs):
            m = re.match(r'(\d+)([abc]?)$', str(ref))
            n, part = int(m.group(1)), m.group(2)
            l = L[n]
            if part in ('', 'a'):  # a new line starts here
                pth = os.path.join(vdir, 'L%02d.wav' % n)
                x = read_audio(pth) if os.path.exists(pth) else None
                d = len(x) / SR if x is not None else est(l['text'], l['who'])
                if j > 0:
                    cur += GAP
                parts = sentences(l['text']) if part else [l['text']]
                pts = split_points(x, l['text'], parts)
                if x is None:
                    pts = [q * d for q in pts]
                placed[n] = P = dict(t0=cur, t1=cur + d, parts=parts, pts=[cur + q for q in pts] + [cur + d], x=x)
                lines.append(dict(n=n, who=l['who'], t0=round(cur, 3), t1=round(cur + d, 3), env=envelope(x) if x is not None else [], real=x is not None))
            P = placed[n]
            ip = 'abc'.index(part) if part else 0
            a, b = (P['pts'][ip], P['pts'][ip + 1]) if part else (P['t0'], P['t1'])
            xs = P['x'][int((a - P['t0']) * SR):int((b - P['t0']) * SR)] if P['x'] is not None else None
            if is_cri(l):  # a shout (owner, 16/11) : no subtitle card, the words big and one by one, then the subtitles again
                txt = typo(P['parts'][ip] if part else l['text'])
                subs.append(dict(who=l['who'], text=txt, t0=round(a, 3), t1=round(b + 0.6, 3), kind='cri', words=word_times(xs, a, b, txt)))
            else:
                cs = chunks(P['parts'][ip] if part else l['text'])
                bt = chunk_times(xs, a, b, cs)
                for i, c in enumerate(cs):
                    subs.append(dict(who=l['who'], text=c, t0=round(bt[i], 3), t1=round(max(bt[i + 1], bt[i] + 0.5), 3)))
            cur = b
            mid = bool(part) and ip < len(P['parts']) - 1  # the line goes on in the next shot
        if not refs:
            t = t0 + opt.get('hold', 3.0)
        else:
            t = cur + (0.0 if mid else CUT + opt.get('after', 0.0) + pa)
        shots.append(dict(frame=frame, t0=round(t0, 3), t1=round(t, 3), dip=bool(opt.get('dip'))))
        for name, at, gain in opt.get('sfx', []):
            if at < 0:
                sfx.append(dict(name=name, t=round(t + at, 3), gain=gain))
        nat.append(dict(dur=t - t0, mid=mid))
    subs.sort(key=lambda s: s['t0'])
    for i in range(len(subs) - 1):  # a subtitle never stays over the next one
        subs[i]['t1'] = min(subs[i]['t1'], subs[i + 1]['t0'])
    for i, s in enumerate(subs):  # a very short one (« Non. ») stays at least 0.9 s, in the silence after it, inside its shot
        if s.get('kind') == 'cri' or s['t1'] - s['t0'] >= 0.9:
            continue
        end = next((sh['t1'] for sh in shots if sh['t0'] <= s['t0'] < sh['t1']), s['t1'])
        nxt = subs[i + 1]['t0'] if i + 1 < len(subs) else end
        s['t1'] = round(max(s['t1'], min(s['t0'] + 0.9, nxt, end - 0.05)), 3)
    for sh in shots:  # the beat of the music under each shot : the Stalak screen cuts its clip on it
        cur_m = [m for m in music if m['t'] <= sh['t0'] + 1e-6]
        if cur_m:
            per, first = beats_of(cur_m[-1]['track'])
            sh['beat'], sh['beat0'] = round(per, 4), round(cur_m[-1]['t'] + first, 4)
    D = dict(ep=ep, fps=FPS, duration=round(t, 3), shots=shots, lines=lines, subs=subs, music=music, sfx=sfx,
             preload=['/site_src/icons/icon.svg'] + ['/site_src/emoji/%s.webp' % e for e in ('hype', 'cool', 'shock')])
    return D, nat


def _save(ep, D):
    os.makedirs(os.path.join(WORK, ep), exist_ok=True)
    json.dump(D, open(os.path.join(WORK, ep, 'ep.json'), 'w', encoding='utf-8'), ensure_ascii=False)
    real = sum(1 for x in D['lines'] if x['real'])
    print('%s : %.2f s, %d shots, %d lines (%d with their voice), %d subtitles' % (ep, D['duration'], len(D['shots']), len(D['lines']), real, len(D['subs'])))


# ---------------------------------------------------------------- the images
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


def _render_range(args):
    data_json, a, b, outdir, port = args
    from playwright.sync_api import sync_playwright
    errs = []
    with sync_playwright() as p:
        br = p.chromium.launch(args=['--font-render-hinting=none', '--force-color-profile=srgb'])
        pg = br.new_page(viewport={'width': 1080, 'height': 1920}, device_scale_factor=1)
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.add_init_script('window.__DATA = ' + data_json + ';')
        pg.goto('http://127.0.0.1:%d/tools/serie/engine/anim.html' % port, wait_until='load')
        pg.wait_for_function('window.ready === true', timeout=90000)
        for f in range(a, b):
            pg.evaluate('t => seekAsync(t)', f / FPS)
            pg.screenshot(path=os.path.join(outdir, 'f%05d.jpg' % f), type='jpeg', quality=92)
        br.close()
    return errs


def serve():
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv


def frames(ep, a=None, b=None, procs=2):
    D = json.load(open(os.path.join(WORK, ep, 'ep.json'), encoding='utf-8'))
    n = int(round(D['duration'] * FPS))
    a, b = int(a or 0), int(b or n)
    outdir = os.path.join(WORK, ep, 'frames')
    if a == 0 and b == n:
        shutil.rmtree(outdir, ignore_errors=True)
    os.makedirs(outdir, exist_ok=True)
    srv = serve()
    data_json = json.dumps(D, ensure_ascii=False)
    from multiprocessing import Pool
    step = int(math.ceil((b - a) / procs))
    jobs = [(data_json, k, min(b, k + step), outdir, srv.server_address[1]) for k in range(a, b, step)]
    with Pool(len(jobs)) as pool:
        errs = sum(pool.map(_render_range, jobs), [])
    srv.shutdown()
    if errs:
        print('PAGE ERRORS:', *errs[:5], sep='\n  ')
    if a == 0 and b == n:
        encode(ep)


# ---------------------------------------------------------------- the images through HyperFrames
# Owner, 16/11 at 19 h 32 : « utilise aussi hyperframes ». The episode becomes a HyperFrames composition : the series engine
# (engine/anim.js) is its runtime, seeked by HyperFrames (hf-seek) for each picture ; over it, finishing layers from the
# HyperFrames registry : the warm light leak « organic-light-leak-overlay » across every change of time or place, and the
# « vignette » in the evening (the lens darkens the corners when the light is low). npx hyperframes render makes the video.
HF_CACHE = os.path.join(WORK, 'hfcache')
GSAP_CDN = 'https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js'


def _hf_blocks():
    """the registry items, installed once (npx hyperframes add) in the work folder, never in the repo ; GSAP saved next to them"""
    blk = os.path.join(HF_CACHE, 'compositions', 'organic-light-leak-overlay.html')
    if not os.path.exists(blk):
        os.makedirs(HF_CACHE, exist_ok=True)
        subprocess.run(['npx', '-y', 'hyperframes', 'add', 'organic-light-leak-overlay', '--json'], cwd=HF_CACHE, check=True, capture_output=True)
        subprocess.run(['npx', '-y', 'hyperframes', 'add', 'vignette', '--json'], cwd=HF_CACHE, check=True, capture_output=True)
    if not os.path.exists(os.path.join(HF_CACHE, 'gsap.min.js')):
        run(['curl', '-sS', '-f', '-o', os.path.join(HF_CACHE, 'gsap.min.js'), GSAP_CDN])
    return open(blk, encoding='utf-8').read()


def hf_project(ep):
    """<work>/<ep>/hf : index.html (the engine as the runtime, the data of the episode, the finishing layers), the engine,
    the fonts and pictures it uses, the registry blocks"""
    D = json.load(open(os.path.join(WORK, ep, 'ep.json'), encoding='utf-8'))
    E = T.EPISODES[ep]
    leak = _hf_blocks()
    proj = os.path.join(WORK, ep, 'hf')
    shutil.rmtree(proj, ignore_errors=True)
    os.makedirs(os.path.join(proj, 'compositions'))
    shutil.copytree(os.path.join(HERE, 'engine'), os.path.join(proj, 'engine'), ignore=shutil.ignore_patterns('*.html'))
    for sub in ('icons', 'emoji'):
        shutil.copytree(os.path.join(ROOT, 'site_src', sub), os.path.join(proj, 'site_src', sub))
    os.makedirs(os.path.join(proj, 'assets', 'fonts'))
    for fnt in ('lilitaone.ttf', 'rubik.ttf'):
        shutil.copy(os.path.join(ROOT, 'site_src', 'fonts', fnt), os.path.join(proj, 'assets', 'fonts', fnt))
    shutil.copy(os.path.join(HF_CACHE, 'gsap.min.js'), os.path.join(proj, 'assets', 'gsap.min.js'))
    mounts = []
    # a light leak across each change of time or place (the dip to black) : from 0.7 s before the cut to 1.5 s after it.
    # One copy of the block per passage, its ids and classes made unique, so that the passages never touch each other.
    k = 0
    for i, sh in enumerate(D['shots']):
        if not sh['dip'] or i == 0:
            continue
        k += 1
        cid = 'leak%d' % k
        src = leak.replace('organic-light-leak-overlay', cid).replace('hf-light-leak', cid + '-light').replace('hf-leak-', cid + '-').replace(GSAP_CDN, 'assets/gsap.min.js')
        open(os.path.join(proj, 'compositions', cid + '.html'), 'w', encoding='utf-8').write(src)
        t0 = max(0.0, sh['t0'] - 0.7)
        # (softer than the block's own peak : the caption of the new moment must stay readable through it)
        mounts.append('<div id="%s" class="clip" data-composition-id="%s" data-composition-src="compositions/%s.html" data-start="%.3f" data-duration="2.0" data-width="1080" data-height="1920" data-track-index="%d" data-track-kind="graphics" style="position:absolute;left:0;top:0;width:1080px;height:1920px;z-index:5;opacity:0.6"></div>' % (cid, cid, cid, t0, 1 + k))
    # the vignette over the evening shots (the sets at sunset or at night : lights.js), one stretch per run of such shots
    eve = [sh for sh in D['shots'] if _set_hour(sh['frame']) in ('coucher', 'soir', 'nuit')]
    runs, cur = [], None
    for sh in eve:
        if cur and abs(cur[1] - sh['t0']) < 0.01:
            cur[1] = sh['t1']
        else:
            cur = [sh['t0'], sh['t1']]; runs.append(cur)
    for j, (a, b) in enumerate(runs):
        mounts.append('<div id="vig%d" class="clip vig" data-start="%.3f" data-duration="%.3f" data-track-index="%d" data-track-kind="graphics"></div>' % (j + 1, a, b - a, 20 + j))
    data = json.dumps(D, ensure_ascii=False).replace('</', '<\\/')
    html = """<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=1080, height=1920">
<title>T-Crazy, %(ep)s</title>
<style>
@font-face{font-family:'Lilita One';src:url(assets/fonts/lilitaone.ttf)}
@font-face{font-family:'Rubik';src:url(assets/fonts/rubik.ttf);font-weight:300 900}
html,body{margin:0;background:#000;overflow:hidden}
#root{position:relative;width:1080px;height:1920px;overflow:hidden;background:#000}
#s{position:absolute;left:0;top:0;display:block}
/* the registry block « vignette » : the corners darken in the evening (soft, the faces stay clear) */
.vig{position:absolute;left:0;top:0;width:1080px;height:1920px;pointer-events:none;z-index:4;background:radial-gradient(ellipse at 50%% 46%%,transparent 52%%,rgba(10,13,20,0.34) 100%%)}
</style>
</head>
<body>
<div id="root" data-composition-id="tcrazy-%(ep)s" data-width="1080" data-height="1920" data-duration="%(dur).3f" data-fps="30">
<svg id="s" width="1080" height="1920" viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg"></svg>
%(mounts)s
</div>
<script>window.__DATA = %(data)s;</script>
<script src="engine/tcrazy.js"></script><script src="engine/decors.js"></script><script src="engine/lights.js"></script><script src="engine/liam.js"></script><script src="engine/cast.js"></script><script src="engine/frame.js"></script><script>FRAME.ANIM = true;</script><script src="engine/storyboard.js"></script><script src="engine/anim.js"></script>
<script src="assets/gsap.min.js"></script>
<script>
  // the series engine is the runtime : HyperFrames asks for the picture at a time, the engine draws it (no clock).
  // Its paused timeline drives the engine from a property setter (a seek sets the time, the setter draws that picture) ;
  // hf-seek waits for the pictures of a new shot to be decoded before the capture.
  window.__hf = window.__hf || {}; window.__hf.buildReady = window.__hf.buildReady || {};
  window.__hf.buildReady.tcrazy = new Promise(function (res) { (function w() { if (window.ready) res(); else setTimeout(w, 25); })(); });
  window.__timelines = window.__timelines || {};
  var DUR = %(dur).3f, driver = { _t: 0 };
  Object.defineProperty(driver, 't', { get: function () { return this._t; }, set: function (v) { this._t = v; if (window.ready) window.seek(v); } });
  var tl = gsap.timeline({ paused: true });
  tl.to(driver, { t: DUR, duration: DUR, ease: 'none' }, 0);
  window.__timelines['tcrazy-%(ep)s'] = tl;
  window.addEventListener('hf-seek', function (e) { e.detail.waitUntil(window.seekReady(e.detail.time)); });
</script>
</body>
</html>
""" % dict(ep=ep, dur=D['duration'], mounts='\n'.join(mounts), data=data)
    open(os.path.join(proj, 'index.html'), 'w', encoding='utf-8').write(html)
    return proj


def _set_hour(frame):
    """the hour of the set of a storyboard frame ('jour', 'coucher', 'nuit'…), read in the page itself"""
    return _HOURS().get(frame, 'jour')


_HOURS_CACHE = {}


def _HOURS():
    """frame id → hour, measured once in the page itself (FRAMES[id].set[2])"""
    if _HOURS_CACHE:
        return _HOURS_CACHE
    from playwright.sync_api import sync_playwright
    srv = serve()
    with sync_playwright() as p:
        br = p.chromium.launch()
        pg = br.new_page()
        pg.goto('http://127.0.0.1:%d/tools/serie/engine/frame.html?f=set-rue1' % srv.server_address[1])
        pg.wait_for_function('window.FRAME && window.FRAME.FRAMES')
        _HOURS_CACHE.update(pg.evaluate("() => Object.fromEntries(Object.entries(FRAME.FRAMES).map(([k, F]) => [k, F.set ? F.set[2] : (F.plain ? 'plain' : 'jour')]))"))
        br.close()
    srv.shutdown()
    return _HOURS_CACHE


def hf(ep, a=None, b=None):
    """the images through HyperFrames → <work>/<ep>/video.mp4 (no sound : the mix is laid under it by mux)"""
    proj = hf_project(ep)
    out = os.path.join(WORK, ep, 'video_hf.mp4')
    cmd = ['npx', '-y', 'hyperframes', 'render', proj, '-o', out, '--quality', 'high', '--fps', '30', '--quiet']
    if a is not None:
        cmd += ['--start', str(a)]
    if b is not None:
        cmd += ['--end', str(b)]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(r.stdout[-3000:], r.stderr[-3000:])
        raise SystemExit('hyperframes render failed')
    if a is None and b is None:
        # the published video : no sound in it yet (the mix comes with mux), the same encoding as before
        run(['ffmpeg', '-nostdin', '-y', '-v', 'error', '-i', out, '-map', '0:v', '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p',
             '-vf', 'scale=in_range=pc:out_range=tv:out_color_matrix=bt709', '-colorspace', 'bt709', '-color_range', 'tv', os.path.join(WORK, ep, 'video.mp4')])
    print('hyperframes :', out)


def encode(ep):
    """the images already drawn → video.mp4 (after redrawing only a part of them : frames <ep> <from> <to>)"""
    D = json.load(open(os.path.join(WORK, ep, 'ep.json'), encoding='utf-8'))
    n = int(round(D['duration'] * FPS))
    outdir = os.path.join(WORK, ep, 'frames')
    if True:
        out = os.path.join(WORK, ep, 'video.mp4')
        run(['ffmpeg', '-nostdin', '-y', '-v', 'error', '-framerate', str(FPS), '-i', os.path.join(outdir, 'f%05d.jpg'), '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '17',
             '-pix_fmt', 'yuv420p', '-vf', 'scale=in_range=pc:out_range=tv:out_color_matrix=bt709', '-colorspace', 'bt709', '-color_range', 'tv', out])
        print('frames : %d images → %s' % (n, out))


# ---------------------------------------------------------------- the sound
def sfx_path(name):
    """a sound effect : made here (knock.wav : two knocks on a window), or one of the shared ones"""
    if name == 'knock.wav':
        p = os.path.join(WORK, 'sfx', 'knock.wav')
        if not os.path.exists(p):
            os.makedirs(os.path.dirname(p), exist_ok=True)
            out = np.zeros(int(0.6 * SR), np.float32)
            for at in (0.0, 0.19):  # a knuckle on glass : a short low thump and a click, twice
                n = int(0.09 * SR); tt = np.arange(n) / SR
                thump = np.sin(2 * np.pi * 150 * tt) * np.exp(-tt * 55) + 0.5 * np.sin(2 * np.pi * 420 * tt) * np.exp(-tt * 90)
                click = np.random.RandomState(7).randn(n) * np.exp(-tt * 400) * 0.35
                a0 = int(at * SR); out[a0:a0 + n] += (thump + click).astype(np.float32)
            write_wav(p, out / np.abs(out).max() * 0.9)
        return p
    if name == 'steps.wav':  # five soft steps of sneakers on the pavement, one every 0.45 s (a character walks in or out)
        p = os.path.join(WORK, 'sfx', 'steps.wav')
        if not os.path.exists(p):
            os.makedirs(os.path.dirname(p), exist_ok=True)
            rs = np.random.RandomState(11)
            out = np.zeros(int(2.4 * SR), np.float32)
            for i in range(5):
                n = int(0.12 * SR); tt = np.arange(n) / SR
                noise = rs.randn(n)
                lp = np.convolve(noise, np.ones(18) / 18, mode='same')  # a dull scuff, not a hiss
                step = (lp * 2.2 * np.exp(-tt * 38) + 0.6 * np.sin(2 * np.pi * (95 + 10 * i) * tt) * np.exp(-tt * 45)) * (0.8 + 0.2 * (i % 2))
                a0 = int((0.02 + i * 0.45) * SR); out[a0:a0 + n] += step.astype(np.float32)
            write_wav(p, out / np.abs(out).max() * 0.9)
        return p
    p = os.path.join(SFX, name)
    return p if os.path.exists(p) else None


def audio(ep):
    D = json.load(open(os.path.join(WORK, ep, 'ep.json'), encoding='utf-8'))
    N = int(round(D['duration'] * SR))
    mus = np.zeros((N, 2), np.float32)
    secs = D['music'] + [dict(track=None, t=D['duration'])]
    XF = int(0.35 * SR)
    for s, nx in zip(secs, secs[1:]):
        x = read_audio(os.path.join(MUSIC, T.TRACKS[s['track']]), ch=2)
        x = x / (np.sqrt(np.mean(x ** 2)) + 1e-9) * 0.10
        a, b = int(s['t'] * SR), min(N, int(nx['t'] * SR) + XF)
        need = b - a
        while len(x) < need:
            x = np.concatenate([x, x])
        piece = x[:need].copy()
        fi = min(XF, need)
        piece[:fi] *= np.linspace(0, 1, fi)[:, None] if a > 0 else 1
        if b < N:
            piece[-XF:] *= np.linspace(1, 0, XF)[:, None]
        if b >= N:  # the end : a fade out on the last second
            fo = min(len(piece), SR)
            piece[-fo:] *= np.linspace(1, 0, fo)[:, None]
        mus[a:b] += piece[:b - a]
    vox = np.zeros(N, np.float32)
    act = np.zeros(N, np.float32)
    vdir = os.path.join(WORK, 'voice', ep)
    for L in D['lines']:
        p = os.path.join(vdir, 'L%02d.wav' % L['n'])
        if not os.path.exists(p):
            continue
        x = read_audio(p)
        a = int(L['t0'] * SR)
        x = x[:max(0, N - a)]
        vox[a:a + len(x)] += x
        act[a:a + len(x)] = 1
    # the music steps back under the voices (attack 0.12 s, release 0.45 s)
    env = np.zeros(N, np.float32)
    lv, atk, rel = 0.0, 1 / (0.12 * SR), 1 / (0.45 * SR)
    hop = 240
    for k in range(0, N, hop):
        tgt = act[k:k + hop].max() if k < N else 0
        lv = min(tgt, lv + atk * hop) if tgt > lv else max(tgt, lv - rel * hop)
        env[k:k + hop] = lv
    duck = 1.0 - 0.72 * env  # the voice about 9 dB above the music
    mix = mus * duck[:, None] + vox[:, None] * 1.0
    for s in D.get('sfx', []):
        p = sfx_path(s['name'])
        if not p:
            continue
        x = read_audio(p, ch=2) * s['gain']
        a = int(s['t'] * SR)
        x = x[:max(0, N - a)]
        mix[a:a + len(x)] += x
    raw = os.path.join(WORK, ep, 'mix_raw.wav')
    write_wav(raw, mix * 0.8)
    # -14 LUFS, true peak -1.5, two passes
    o = subprocess.run(['ffmpeg', '-nostdin', '-hide_banner', '-i', raw, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
    m = json.loads(o[o.rfind('{'):o.rfind('}') + 1])
    out = os.path.join(WORK, ep, 'mix.wav')
    run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', raw, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=%s:measured_TP=%s:measured_LRA=%s:measured_thresh=%s:offset=%s:linear=true' %
         (m['input_i'], m['input_tp'], m['input_lra'], m['input_thresh'], m['target_offset']), '-ar', str(SR), out])
    print('audio : %.2f s → %s' % (N / SR, out))


def mux(ep):
    d = os.path.join(WORK, ep)
    full = os.path.join(d, ep + '.mp4')
    run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', os.path.join(d, 'video.mp4'), '-i', os.path.join(d, 'mix.wav'), '-map', '0:v', '-map', '1:a',
         '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-movflags', '+faststart', full])
    light = os.path.join(d, ep + '-720.mp4')
    run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', full, '-vf', 'scale=720:1280', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '25', '-pix_fmt', 'yuv420p',
         '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', light])
    for p in (full, light):
        print('%s : %.1f Mo' % (p, os.path.getsize(p) / 1e6))


def sheet(ep):
    d = os.path.join(WORK, ep)
    run(['python3', os.path.join(ROOT, 'tools/contact_sheet.py'), os.path.join(d, ep + '.mp4'), '--out', os.path.join(d, 'planche')])
    print(*sorted(os.path.join(d, 'planche', f) for f in os.listdir(os.path.join(d, 'planche'))), sep='\n')


def deliver(ep):
    """what goes into Studio Stalak : the full-size video under 19.5 MB (also the one to publish), and a one-page overview
    (one image per second) for plancheUrl"""
    from PIL import Image, ImageDraw, ImageFont
    d = os.path.join(WORK, ep)
    src, pub = os.path.join(d, ep + '.mp4'), os.path.join(d, ep + '-pub.mp4')
    for crf in (21, 23, 25):
        run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', src, '-c:v', 'libx264', '-preset', 'medium', '-crf', str(crf), '-pix_fmt', 'yuv420p', '-c:a', 'copy', '-movflags', '+faststart', pub])
        if os.path.getsize(pub) < 19.5e6:
            break
    dur = float(run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', pub]).stdout)
    n, cols, tw, th = int(dur), 9, 160, 284
    rows = (n + cols - 1) // cols
    img = Image.new('RGB', (cols * (tw + 6) + 6, rows * (th + 28) + 6), '#111111')
    dr, f = ImageDraw.Draw(img), ImageFont.truetype(os.path.join(ROOT, 'site_src/fonts/rubik.ttf'), 18)
    for k in range(n):
        p = os.path.join(d, '_ov.jpg')
        run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-ss', str(k + 0.5), '-i', pub, '-frames:v', '1', '-vf', 'scale=%d:%d' % (tw, th), p])
        x, y = 6 + (k % cols) * (tw + 6), 6 + (k // cols) * (th + 28)
        img.paste(Image.open(p), (x, y + 22)); dr.text((x, y), '%d:%02d' % (k // 60, k % 60), font=f, fill='#ffd34d')
    img.save(os.path.join(d, ep + '-planche.jpg'), quality=85)
    print('%s : %.1f Mo, %.1f s ; %s-planche.jpg' % (pub, os.path.getsize(pub) / 1e6, dur, ep))


def thumb(ep):
    from playwright.sync_api import sync_playwright
    srv = serve()
    out = os.path.join(WORK, ep, ep + '-miniature.jpg')
    with sync_playwright() as p:
        br = p.chromium.launch()
        pg = br.new_page(viewport={'width': 1080, 'height': 1920})
        pg.goto('http://127.0.0.1:%d/tools/serie/engine/frame.html?f=thumb-%s' % (srv.server_address[1], ep))
        pg.wait_for_function('window.ready === true', timeout=30000)
        pg.screenshot(path=out, type='jpeg', quality=92)
        br.close()
    srv.shutdown()
    print(out)


if __name__ == '__main__':
    ep, step = sys.argv[1], sys.argv[2]
    {'prompts': prompts, 'voices': voices, 'plan': plan, 'frames': lambda e: frames(e, *sys.argv[3:5]), 'hf': lambda e: hf(e, *sys.argv[3:5]), 'hfproject': hf_project, 'encode': encode, 'audio': audio, 'mux': mux, 'sheet': sheet, 'thumb': thumb, 'deliver': deliver}[step](ep)
