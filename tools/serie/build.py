"""Studio Chambre — build an episode (Marketing & croissance, 15/11/2026).

    SERIE_WORK=<dossier de travail> python3 tools/serie/build.py <ep> plan|frames|audio|mux|all|sheet

  plan   : timings from the voice files (work/voice/<ep>/<n>.wav, n = index in pilotes.voice_lines ; estimated when
           they are missing), one beat per step of the script, subtitles, mouth
           envelopes → work/<ep>/ep.json
  frames : draws every frame (Playwright, 30 images/s, 3 processes) → work/<ep>/video.mp4 (no sound)
  audio  : the series beat (synthesized here, no third-party rights), the voices, the sound effects (Pixabay licence),
           mixed to -14 LUFS → work/<ep>/mix.wav
  mux    : → work/<ep>/<ep>.mp4 ; sheet : the contact sheet (tools/contact_sheet.py, one image every 0.5 s)
The voice is generated ONCE, outside this script (Flora, Gemini TTS), from the validated script (règle 11).
Renders, voices and music stay in the work folder : never in the repo.
"""
import json, math, os, re, subprocess, sys, functools, http.server, threading, shutil, wave
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(HERE, 'episodes'))
import pilotes  # noqa: E402

WORK = os.environ.get('SERIE_WORK', '/tmp/serie-work')
FPS, SR = 30, 48000
SFX = os.path.join(ROOT, 'promo/youtube/short/assets/sfx')
BPM = 140.0
EPS = dict(pilotes.EPISODES)


def run(cmd, **k):
    return subprocess.run(cmd, check=True, capture_output=True, text=True, **k)


def read_wav(path):
    """any audio file → float32 mono at SR (through ffmpeg)"""
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()


def write_wav(path, x):
    x = np.clip(x, -1, 1)
    with wave.open(path, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())


# ---------------------------------------------------------------- plan
def voice_path(ep, i):
    return os.path.join(WORK, 'voice', ep, '%02d.wav' % i)


def trimmed_voice(ep, i):
    """the voice of line i, trimmed (leading and trailing silence), or None"""
    p = voice_path(ep, i)
    if not os.path.exists(p):
        return None
    x = read_wav(p)
    a = np.abs(x)
    thr = max(1e-3, 0.02 * np.percentile(a, 99.5))
    idx = np.where(a > thr)[0]
    if not len(idx):
        return x
    s, e = max(0, idx[0] - int(0.02 * SR)), min(len(x), idx[-1] + int(0.06 * SR))
    return x[s:e]


def envelope(x):
    """mouth opening per frame (0..1) from the loudness of the voice"""
    hop = SR // FPS
    n = int(math.ceil(len(x) / hop))
    rms = np.array([np.sqrt(np.mean(x[k * hop:(k + 1) * hop] ** 2) + 1e-12) for k in range(n)])
    ref = np.percentile(rms, 92) + 1e-9
    v = np.clip((rms / ref - 0.12) / 0.88, 0, 1)
    v = np.convolve(v, [0.25, 0.5, 0.25], mode='same')
    # a mouth that opens and closes : small dips between syllables read as talking
    return [round(float(a), 3) for a in v]


def chunks(text, maxc=34, merge=22):
    """subtitles : short phrases cut on punctuation (a phrase longer than maxc is cut in balanced parts ; two short
    ones are joined) ; split on plain spaces only, so « décalée ?! » stays one word"""
    words = [w for w in text.split(' ') if w]
    phrases, cur = [], []
    for w in words:
        cur.append(w)
        if re.search(r'[.!?,…:;]$', w):
            phrases.append(cur); cur = []
    if cur:
        phrases.append(cur)
    out = []
    for ph in phrases:
        s = ' '.join(ph)
        if len(s) <= maxc:
            if out and len(out[-1]) + 1 + len(s) <= merge:
                out[-1] += ' ' + s
            else:
                out.append(s)
        else:
            n = math.ceil(len(s) / maxc)
            per = math.ceil(len(ph) / n)
            out += [' '.join(ph[k:k + per]) for k in range(0, len(ph), per)]
    return out


def est_duration(text):
    return 0.25 + len(text) / 14.5


def plan(ep):
    """One beat per step of the validated script (episodes/pilotes.py) : a line, or an action without a new voice line.
    A line marked `same` reuses the recording of the identical earlier line (voice index)."""
    E = EPS[ep]
    keys = pilotes.voice_lines(ep)
    vx, lines, B, t = {}, [], [], 0.0
    for s in E['steps']:
        t0 = t
        info = dict(name=s.get('shot') or s['kind'], t0=round(t0, 3), music=s.get('music', 'duck'))
        if s['kind'] == 'line':
            vi = keys.index((s['who'], s['say'] or s['text']))
            if vi not in vx:
                vx[vi] = trimmed_voice(ep, vi)
            x = vx[vi]
            d = len(x) / SR if x is not None else est_duration(s['say'] or s['text'])
            ls = t0 + s.get('pre', 0.0)
            L = dict(who=s['who'], text=s['text'], voice=vi, dur=round(d, 3), t0=round(ls, 3), t1=round(ls + d, 3),
                     env=envelope(x) if x is not None else [], real=x is not None)
            info['line'] = len(lines)
            lines.append(L)
            t1 = ls + d + s['gap']
        else:
            t1 = t0 + s['dur']
        info['t1'] = round(t1, 3)
        sfx = []
        for name, at, gain in s.get('sfx', []):
            if isinstance(at, str):  # 'L0+x' : from the start of the line, 'L1+x' : from its end
                m = re.match(r'L([01])([+-][\d.]+)?', at)
                L = lines[info['line']]
                tt = (L['t0'] if m.group(1) == '0' else L['t1']) + float(m.group(2) or 0)
            else:
                tt = t0 + at
            sfx.append(dict(name=name, t=round(tt, 3), gain=gain))
        info['sfx'] = sfx
        B.append(info)
        t = t1
    subs = []
    for i, L in enumerate(lines):
        cs = chunks(L['text'])
        tot = sum(len(c) for c in cs)
        tt = L['t0']
        for c in cs:
            d = max(0.42, L['dur'] * len(c) / tot)
            subs.append(dict(text=c, who=L['who'], t0=round(tt, 3), t1=round(min(tt + d, L['t1'] + 0.25), 3), line=i))
            tt += d
    D = dict(ep=ep, fps=FPS, bpm=BPM, duration=round(t, 3), lines=lines, beats=B, subs=subs,
             preload=['/site_src/aide/fr-song.jpg', '/site_src/aide/fr-takes.jpg', '/site_src/aide/fr-edit.jpg', '/site_src/aide/fr-export.jpg',
                      '/site_src/icons/icon.svg', '/site_src/icons/watermark.svg'] + ['/site_src/emoji/%s.webp' % n for n in ('hello', 'cool', 'gg', 'hype', 'think', 'shock', 'love')])
    os.makedirs(os.path.join(WORK, ep), exist_ok=True)
    with open(os.path.join(WORK, ep, 'ep.json'), 'w', encoding='utf-8') as f:
        json.dump(D, f, ensure_ascii=False)
    real = sum(1 for L in lines if L['real'])
    print('%s : %.2f s, %d beats, %d lines (%d with a real voice), %d subtitles' % (ep, D['duration'], len(B), len(lines), real, len(subs)))
    return D


# ---------------------------------------------------------------- frames
class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


def _render_range(args):
    ep, data_json, a, b, outdir, port = args
    os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        br = p.chromium.launch(args=['--font-render-hinting=none', '--force-color-profile=srgb'])
        pg = br.new_page(viewport={'width': 1080, 'height': 1920}, device_scale_factor=1)
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.add_init_script('window.__DATA = ' + data_json + ';')
        pg.goto('http://127.0.0.1:%d/tools/serie/engine/play.html?ep=%s' % (port, ep), wait_until='load')
        pg.wait_for_function('window.ready === true', timeout=60000)
        for f in range(a, b):
            pg.evaluate('t => seek(t)', f / FPS)
            pg.screenshot(path=os.path.join(outdir, 'f%05d.jpg' % f), type='jpeg', quality=93)
        br.close()
    return errs


def frames(ep, only=None, procs=3):
    D = json.load(open(os.path.join(WORK, ep, 'ep.json'), encoding='utf-8'))
    n = int(round(D['duration'] * FPS))
    outdir = os.path.join(WORK, ep, 'frames')
    shutil.rmtree(outdir, ignore_errors=True); os.makedirs(outdir)
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    port = srv.server_address[1]
    data_json = json.dumps(D, ensure_ascii=False)
    from multiprocessing import Pool
    step = int(math.ceil(n / procs))
    jobs = [(ep, data_json, k, min(n, k + step), outdir, port) for k in range(0, n, step)]
    with Pool(len(jobs)) as pool:
        errs = sum(pool.map(_render_range, jobs), [])
    srv.shutdown()
    if errs:
        print('PAGE ERRORS:', *errs[:5], sep='\n  ')
    out = os.path.join(WORK, ep, 'video.mp4')
    run(['ffmpeg', '-y', '-v', 'error', '-framerate', str(FPS), '-i', os.path.join(outdir, 'f%05d.jpg'), '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '17',
         '-pix_fmt', 'yuv420p', '-vf', 'scale=in_range=pc:out_range=tv:out_color_matrix=bt709', '-colorspace', 'bt709', '-color_range', 'tv', out])
    print('frames : %d images → %s' % (n, out))


# ---------------------------------------------------------------- music : the series beat (synthesized, ours)
def note(n):  # midi → Hz
    return 440.0 * 2 ** ((n - 69) / 12)


def _env(n, a, d):
    t = np.arange(n) / SR
    e = np.exp(-t / d)
    if a > 0:
        e *= np.minimum(1, t / a)
    return e


def beat_loop():
    """4 bars at 140 BPM : icy bells, 808, kick, clap, hats. Returns the loop (float32)"""
    step = 60 / BPM / 4
    bar = step * 16
    L = int(round(bar * 4 * SR))
    out = np.zeros(L, dtype=np.float64)
    rng = np.random.default_rng(7)

    def add(x, at):
        i = int(round(at * SR))
        j = min(L, i + len(x))
        if i < L:
            out[i:j] += x[:j - i]
            if i + len(x) > L:  # wrap around (seamless loop)
                out[:i + len(x) - L] += x[j - i:]
    # kick
    n = int(0.42 * SR); t = np.arange(n) / SR
    f = 46 + 110 * np.exp(-t / 0.03)
    kick = np.sin(2 * np.pi * np.cumsum(f) / SR) * _env(n, 0.001, 0.16) * 0.95
    # clap : 3 quick noise bursts, band-limited
    n = int(0.25 * SR)
    nz = rng.standard_normal(n)
    nz = np.convolve(nz, np.ones(3) / 3, 'same') - np.convolve(nz, np.ones(40) / 40, 'same')
    clap = np.zeros(n)
    for k, o in enumerate((0, 0.012, 0.024)):
        i = int(o * SR); clap[i:] += nz[:n - i] * _env(n - i, 0.0005, 0.03 if k < 2 else 0.12)
    clap *= 0.42
    # hats
    n = int(0.05 * SR)
    hz = rng.standard_normal(n); hz = hz - np.convolve(hz, np.ones(6) / 6, 'same')
    hat = hz * _env(n, 0.0003, 0.012) * 0.16
    # 808 (with a soft saturation so a phone speaker hears it)
    def eight(midi, dur):
        n = int(dur * SR); t = np.arange(n) / SR
        fr = note(midi) * (1 + 0.6 * np.exp(-t / 0.025))
        x = np.sin(2 * np.pi * np.cumsum(fr) / SR) * _env(n, 0.003, dur * 0.55)
        return np.tanh(x * 2.2) * 0.42
    # bells (icy) : sine + inharmonic partials
    def bell(midi, dur=0.9, g=0.13):
        n = int(dur * SR); t = np.arange(n) / SR; fr = note(midi)
        x = (np.sin(2 * np.pi * fr * t) + 0.42 * np.sin(2 * np.pi * fr * 2.76 * t) * np.exp(-t / 0.08) + 0.2 * np.sin(2 * np.pi * fr * 5.4 * t) * np.exp(-t / 0.04))
        return x * _env(n, 0.002, 0.32) * g
    roots = [48, 44, 51, 46]  # C, Ab, Eb, Bb (an octave above the 808)
    for b in range(4):
        b0 = b * bar
        for s in (0, 10) + ((7,) if b % 2 else ()):
            add(kick, b0 + s * step)
        add(clap, b0 + 8 * step)
        for s in range(0, 16, 2):
            add(hat, b0 + s * step)
        if b == 3:
            for s in (13, 14, 15):
                add(hat * 0.8, b0 + s * step)
        add(eight(roots[b] - 12, bar * 0.95), b0)
    mel = [(0, 79), (3, 75), (6, 72), (8, 70), (11, 72), (14, 75),
           (16, 79), (19, 77), (22, 75), (24, 72), (27, 70), (30, 67)]
    for b2 in range(2):
        for s, m in mel:
            add(bell(m), b2 * 2 * bar + s * step)
            add(bell(m, g=0.05), b2 * 2 * bar + s * step + 3 * step)  # echo
    # a soft pad (two detuned saws, low-passed)
    pad = np.zeros(L)
    for b in range(4):
        n = int(bar * SR); t = np.arange(n) / SR
        for m in (roots[b] + 12, roots[b] + 15, roots[b] + 19):
            for det in (-0.12, 0.12):
                fr = note(m + det)
                pad[int(b * bar * SR):int(b * bar * SR) + n] += ((t * fr) % 1 * 2 - 1) * 0.018
    a = 0.06
    lp = np.zeros_like(pad)
    for k in range(1, len(pad)):
        lp[k] = lp[k - 1] + a * (pad[k] - lp[k - 1])
    out += lp
    return (out / (np.max(np.abs(out)) + 1e-9) * 0.8).astype(np.float32)


def scratch():
    n = int(0.42 * SR); t = np.arange(n) / SR
    rng = np.random.default_rng(3)
    nz = rng.standard_normal(n)
    # a vinyl scratch : a filtered noise whose « speed » goes back and forth
    speed = np.sin(2 * np.pi * 7 * t) * np.exp(-t / 0.3)
    saw = np.sin(2 * np.pi * np.cumsum(300 + 900 * np.abs(speed)) / SR)
    x = (0.5 * saw + 0.5 * np.convolve(nz, np.ones(4) / 4, 'same')) * np.abs(speed) * _env(n, 0.002, 0.25)
    return (x / (np.max(np.abs(x)) + 1e-9)).astype(np.float32)


def music_track(D, total_n, chop=None):
    """the beat along the episode, by beat : full / duck / off / stop (tape stop) / chop (with Maman's shout on the beat)"""
    loop = beat_loop()
    reps = int(math.ceil(total_n / len(loop))) + 1
    full = np.tile(loop, reps)[:total_n].astype(np.float64)
    gain = np.zeros(total_n)
    for b in D['beats']:
        i, j = int(b['t0'] * SR), int(b['t1'] * SR)
        m = b['music']
        gain[i:j] = {'full': 0.85, 'duck': 0.85, 'chop': 0.85, 'off': 0.0, 'stop': 0.0}.get(m, 0.85)
        if m == 'stop':
            # tape stop : the beat slows down to nothing in 0.5 s
            n = int(0.5 * SR)
            rate = np.linspace(1, 0, n) ** 1.3
            pos = i + np.cumsum(rate)
            seg = np.interp(pos, np.arange(len(full)), full) * np.linspace(1, 0, n) ** 0.5
            full[i:i + n] = seg
            gain[i:i + n] = 0.85
    # smooth the gain changes (no clicks)
    k = int(0.03 * SR)
    gain = np.convolve(gain, np.ones(k) / k, 'same')
    # ducking under the voices (except 'full' beats where the voice sits on top anyway, a little)
    voice_on = np.zeros(total_n)
    for L in D['lines']:
        voice_on[int(L['t0'] * SR):int(L['t1'] * SR)] = 1
    k2 = int(0.12 * SR)
    voice_on = np.convolve(voice_on, np.ones(k2) / k2, 'same')
    duckamt = np.zeros(total_n)
    for b in D['beats']:
        i, j = int(b['t0'] * SR), int(b['t1'] * SR)
        duckamt[i:j] = 0.62 if b['music'] in ('duck',) else (0.45 if b['music'] in ('full', 'chop') else 0)
    out = full * gain * (1 - duckamt * voice_on)
    # Maman's « Yanis ! », chopped on the beat (beats with music 'chop')
    if chop is not None:
        beat_s = 60 / BPM
        for b in D['beats']:
            if b['music'] != 'chop':
                continue
            tt = math.ceil(b['t0'] / (beat_s * 2)) * beat_s * 2
            while tt < b['t1'] - 0.3:
                i = int(tt * SR)
                j = min(total_n, i + len(chop))
                out[i:j] += chop[:j - i] * 0.9
                tt += beat_s * 2
    return out


def audio(ep):
    D = json.load(open(os.path.join(WORK, ep, 'ep.json'), encoding='utf-8'))
    total = int(math.ceil(D['duration'] * SR)) + SR // 2
    voice = np.zeros(total)
    lines_audio = {}
    for i, L in enumerate(D['lines']):
        x = trimmed_voice(ep, L.get('voice', i))
        if x is None:
            continue
        lines_audio[i] = x
        a = int(L['t0'] * SR)
        voice[a:a + len(x)] += x[:max(0, min(len(x), total - a))]
    # the chop : the first word of Maman's shout (the first line of p2)
    chop = None
    if ep == 'p2' and 0 in lines_audio:
        x = lines_audio[0]
        a = np.abs(x); hop = int(0.01 * SR)
        rms = np.array([a[k:k + hop].mean() for k in range(0, len(a) - hop, hop)])
        thr = 0.12 * rms.max()
        k = 20
        while k < len(rms) and rms[k] > thr:
            k += 1
        chop = x[:min(len(x), (k + 3) * hop)] * np.linspace(1, 0.7, min(len(x), (k + 3) * hop))
    music = music_track(D, total, chop)
    fx = np.zeros(total)
    for s in [x for b in D['beats'] for x in b['sfx']]:
        if s['name'] == 'scratch':
            y = scratch()
        elif s['name'] == 'tapestop':
            continue
        else:
            y = read_wav(os.path.join(SFX, s['name']))
            # place the sound by its peak when it is a hit
            if s['name'].startswith(('impact', 'thud', 'pop')):
                pk = int(np.argmax(np.abs(y[:int(0.3 * SR)])))
                y = y[pk:]
        i = int(s['t'] * SR)
        j = min(total, i + len(y))
        if i < total:
            fx[i:j] += y[:j - i] * s['gain'] * 4.0
    mix = voice * 1.0 + music * 0.33 + fx
    mix[-int(0.25 * SR):] *= np.linspace(1, 0, int(0.25 * SR))
    raw = os.path.join(WORK, ep, 'mix_raw.wav')
    write_wav(raw, mix / max(1.0, np.max(np.abs(mix)) * 1.05))
    out = os.path.join(WORK, ep, 'mix.wav')
    # two-pass loudness normalisation : -14 LUFS, true peak -1.5 dB
    meas = subprocess.run(['ffmpeg', '-hide_banner', '-i', raw, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'],
                          capture_output=True, text=True).stderr
    js = json.loads(meas[meas.rindex('{'):meas.rindex('}') + 1])
    run(['ffmpeg', '-y', '-v', 'error', '-i', raw, '-af',
         'loudnorm=I=-14:TP=-1.5:LRA=11:measured_I=%s:measured_TP=%s:measured_LRA=%s:measured_thresh=%s:offset=%s:linear=true' % (
             js['input_i'], js['input_tp'], js['input_lra'], js['input_thresh'], js['target_offset']), '-ar', str(SR), out])
    print('audio : %s (%d voices)' % (out, len(lines_audio)))


def mux(ep):
    v = os.path.join(WORK, ep, 'video.mp4'); a = os.path.join(WORK, ep, 'mix.wav')
    out = os.path.join(WORK, ep, '%s.mp4' % ep)
    run(['ffmpeg', '-y', '-v', 'error', '-i', v, '-i', a, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k',
         '-t', str(json.load(open(os.path.join(WORK, ep, 'ep.json')))['duration']), '-movflags', '+faststart', out])
    print('mux :', out)


def sheet(ep):
    v = os.path.join(WORK, ep, '%s.mp4' % ep)
    if not os.path.exists(v):
        v = os.path.join(WORK, ep, 'video.mp4')
    run(['python3', os.path.join(ROOT, 'tools/contact_sheet.py'), v, '--out', os.path.join(WORK, ep, 'planche')])
    print('sheet :', os.path.join(WORK, ep, 'planche'))


if __name__ == '__main__':
    ep, what = sys.argv[1], sys.argv[2]
    if what in ('plan', 'all'):
        plan(ep)
    if what in ('frames', 'all'):
        frames(ep)
    if what in ('audio', 'all'):
        audio(ep)
    if what in ('mux', 'all'):
        mux(ep)
    if what in ('sheet', 'all'):
        sheet(ep)
