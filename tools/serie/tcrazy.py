"""Série « T-Crazy » — make an episode from its validated script and storyboard (Marketing & croissance, 16/11/2026).

    SERIE_WORK=<work> python3 tools/serie/tcrazy.py <ep> <step> [...]

The order of the steps :
  prompts : the voice of each line, as Flora requests (Gemini TTS) → <work>/<ep>/voice_requests.json. The voice is generated
            ONCE, line by line, on the validated text (owner, 16/11 : « réplique par réplique mais faut que ça reste réaliste »).
  voices  : <work>/voice/<ep>/raw/LNN.wav (downloaded) → trimmed, faster for Liam (×1,1) and the narrator (×1,2) → <work>/voice/<ep>/LNN.wav
  plan    : the timeline (shots, lines, subtitles, music) → <work>/<ep>/ep.json
  frames  : every image, drawn by engine/anim.html (Playwright, 30 images/s) → <work>/<ep>/video.mp4 (no sound)
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
    units = []
    for sen in sentences(text):
        units += split_best([w for w in sen.split(' ') if w], maxc)
    out = []
    for u in units:
        if out and (len(out[-1]) + 1 + len(u) <= merge or ((len(u) < short or len(out[-1]) < short) and len(out[-1]) + 1 + len(u) <= maxc)):
            out[-1] += ' ' + u
        else:
            out.append(u)
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
    {'prompts': prompts, 'voices': voices, 'plan': plan, 'frames': lambda e: frames(e, *sys.argv[3:5]), 'encode': encode, 'audio': audio, 'mux': mux, 'sheet': sheet, 'thumb': thumb, 'deliver': deliver}[step](ep)
