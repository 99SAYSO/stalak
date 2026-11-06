"""Test of the smoothness of the exported videos (owner, 06/11: « parfaitement fluide, comme une vidéo filmée avec la caméra,
sans aucun moment plus lent, même minime »). Python Playwright (chromium) + ffmpeg.

    python3 /abs/path/tests/ui/fluidite_ui.py <built public/ folder> [folder for the measures]

Measured picture by picture, in the exported files:
- the timestamps: every picture exactly 1/30 s after the one before (no gap, no picture twice at the same time);
- the pictures themselves: each test take shows its own picture number (13 black and white squares across the middle) and
  its name (2 squares under them). Read back from every picture of the export, inside a shot the number must go up by exactly
  1 from one picture to the next: the same number twice is a picture shown twice (a little slow moment), +2 a skipped one.
The 3 takes are the cases met: exactly 30 pictures/s (1080 × 1920); 29.97 pictures/s in 720 × 1280 (drawn bigger, through
the canvas); 30 pictures/s with uneven timestamps (± 4 ms, as an iPhone or a recorder writes them). Each take is lined up
half a picture away from the video's pictures, the hardest case (measured on 06/11 with the version then online: 54 pictures
shown twice and 54 skipped out of 200 on the uneven take; 0 with the fix).
On an iPhone (iPhone 15 Pro emulated: Safari's ways, WebGL drawing, decoding straight through) and a computer; a single video
(free plan, with the watermark) and a pack (Creator Plus). The test browser has no AAC encoder: the export is asked with Opus
sound (same pictures, same timing as with AAC on a phone)."""
import base64, functools, http.server, io, json, os, shutil, subprocess, sys, tempfile, threading, zipfile
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.sync_api import sync_playwright

PUBLIC = os.path.abspath(sys.argv[1])
OUTDIR = sys.argv[2] if len(sys.argv) > 2 else None
results = []
FF = shutil.which('ffmpeg'); FP = shutil.which('ffprobe')
BITS, BW = 13, 80            # 13 squares of 80 px for the picture number, at y 900–1000 of a 1080 × 1920 picture
BEAT = "0.8*sin(2*PI*60*t)*exp(-25*mod(t,0.5))+0.15*sin(2*PI*440*t)"


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


def check(name, ok, info=''):
    results.append(bool(ok))
    print(('PASS ' if ok else 'FAIL ') + name + (('  — ' + str(info)) if info and not ok else ''))


def make_take(path, w, h, rate, take_id, jitter=False):
    """a take that shows its picture number and its name; its sound: the song's beat (so it lines up by itself)"""
    s = w / 1080
    bw, y0, y1, ty0, ty1 = BW * s, 900 * s, 1000 * s, 1100 * s, 1200 * s
    lum = ("if(between(Y,{y0},{y1}),if(lt(X,{bw}*{n}),if(mod(floor(N/pow(2,floor(X/{bw}))),2),235,16),128),"
           "if(between(Y,{ty0},{ty1}),if(lt(X,{bw}*2),if(mod(floor({tid}/pow(2,floor(X/{bw}))),2),235,16),128),"
           "100+60*sin(X/57+N/9)))").format(y0=y0, y1=y1, bw=bw, n=BITS, ty0=ty0, ty1=ty1, tid=take_id)
    vf = "geq=lum='%s':cb=128:cr=128" % lum
    # (the time base made fine first: otherwise the uneven times are rounded to 1/30 s, two pictures at the same time)
    if jitter: vf += ",settb=1/90000,setpts='(N/30+0.004*sin(N*1.7))/TB'"
    # (24 s, longer than the 20 s song: a take never runs out before the end of the passage, its last picture held)
    args = [FF, '-nostdin', '-v', 'error', '-y', '-f', 'lavfi', '-i', 'color=c=gray:s=%dx%d:r=%s:d=24' % (w, h, rate),
            '-f', 'lavfi', '-i', "aevalsrc='%s':s=44100:d=24" % BEAT, '-vf', vf, '-shortest',
            '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-g', '30', '-pix_fmt', 'yuv420p', '-c:a', 'aac']
    if jitter: args += ['-fps_mode', 'passthrough', '-enc_time_base', '1:90000', '-video_track_timescale', '90000']
    subprocess.run(args + [path], check=True)


def read_video(path):
    """(timestamps, [(take name, picture number)]) of every picture of an exported video"""
    out = subprocess.run([FP, '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'packet=pts_time', '-of', 'csv=p=0', path], capture_output=True, text=True).stdout
    ts = sorted(float(x.split(',')[0]) for x in out.split() if x.strip())
    raw = subprocess.run([FF, '-v', 'error', '-i', path, '-map', '0:v:0', '-vf', 'crop=1080:320:0:880,format=gray', '-f', 'rawvideo', '-'], capture_output=True).stdout
    fr = 1080 * 320; pics = []
    for k in range(len(raw) // fr):
        b = raw[k * fr:(k + 1) * fr]
        px = lambda x, y: b[y * 1080 + x]
        num = sum((1 << i) for i in range(BITS) if px(int((i + 0.5) * BW), 70) > 128)
        tid = sum((1 << i) for i in range(2) if px(int((i + 0.5) * BW), 270) > 128)
        pics.append((tid, num))
    return ts, pics


def analyse(tag, path, cuts):
    ts, pics = read_video(path)
    d = [round((b - a) * 30, 3) for a, b in zip(ts, ts[1:])]
    bad_ts = [(i, x) for i, x in enumerate(d) if abs(x - 1) > 0.02]
    check(tag + ' : horodatages réguliers, chaque image 1/30 s après la précédente (%d images)' % len(ts), len(ts) > 100 and not bad_ts, bad_ts[:10])
    bounds = set(cuts)
    dup, skip, n = [], [], 0
    for f in range(1, len(pics)):
        if f in bounds or pics[f][0] != pics[f - 1][0] or pics[f][0] == 0: continue
        n += 1; step = pics[f][1] - pics[f - 1][1]
        if step == 0: dup.append(f)
        elif step != 1: skip.append((f, step))
    check(tag + ' : aucune image en double, aucune sautée dans les plans (%d passages d’image vérifiés)' % n, n > 100 and not dup and not skip,
          'doubles %s, sautées %s' % (dup[:12], skip[:12]))
    return {'images': len(ts), 'checked': n, 'dup': len(dup), 'skip': len(skip), 'bad_ts': len(bad_ts)}


def ev(pg, code):
    return pg.evaluate('s => __ev(s)', code)


def run(b, base, site, iphone, measures):
    tag = 'iPhone' if iphone else 'ordinateur'
    opts = dict(PW.devices['iPhone 15 Pro']) if iphone else {'viewport': {'width': 1280, 'height': 860}}
    ctx = b.new_context(**opts, locale='fr-FR', accept_downloads=True)
    ctx.route('**/api/**', lambda r: r.fulfill(status=204, body=''))
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.goto(base + 'fr/', wait_until='load'); pg.wait_for_function('window.__ev && window.MP4Box', timeout=20000)
    pg.set_input_files('#songFile', os.path.join(site, 'beat.wav'))
    pg.wait_for_function('() => __ev("!!S.song")', timeout=30000)
    pg.set_input_files('#takeFiles', [os.path.join(site, n) for n in ('take1.mp4', 'take2.mp4', 'take3.mp4')])
    pg.wait_for_function('() => __ev("S.takes.length === 3 && S.takes.every(t => t.status !== \'pending\')")', timeout=120000)
    # the hardest case: each take lined up half a picture away from the video's pictures (the sound's sync decides it, so it
    # happens to some takes): there the nearest picture in time flips from one to the other with the least unevenness
    ev(pg, "S.takes.forEach(t => { t.offset = Math.round(t.offset * 30) / 30 + 0.5 / 30 + 0.0003; })")
    ev(pg, "go(4)"); pg.wait_for_function('() => __ev("S.step === 4 && S.cuts.length > 0")', timeout=30000)
    ev(pg, "S.lyrics.mode = 'none', setFilter('none', true), store.set(PP_KEY, 1), pickAudioConfig = async sr => ({ codec: 'opus', sampleRate: sr, numberOfChannels: 2, bitrate: 128000 })")
    fx = ev(pg, "S.takes.map(t => [t.name, +(t.offset || 0).toFixed(3)])")
    # ---- one video (free plan: with the watermark) ----
    pg.evaluate('() => { window.__p = __ev("exportOne()"); }')
    pg.wait_for_function('() => __ev("!S.exporting && !!lastBlob")', timeout=600000)
    rt = ev(pg, "lastName")
    cuts = ev(pg, "S.lastEdits[0].map(c => Math.round((c.t0 - S.segStart) * OUT_FPS))")
    b64 = pg.evaluate("() => __ev(\"new Promise(r => { const f = new FileReader(); f.onload = () => r(f.result); f.readAsDataURL(lastBlob); })\")")
    p1 = os.path.join(OUTDIR or tempfile.gettempdir(), 'fluidite-%s-simple.mp4' % ('iphone' if iphone else 'ordi'))
    open(p1, 'wb').write(base64.b64decode(b64.split(',')[1]))
    check(tag + ' : export simple image par image (pas la méthode en temps réel)', ev(pg, "!S.realtime") and rt.endswith('.mp4'), rt)
    measures[tag + ' simple'] = analyse(tag + ' simple', p1, cuts)
    # ---- a pack (Creator Plus): 5 videos ----
    ev(pg, "acctHas = f => true, planTags(), $('#packSel').value = '5'")
    pg.evaluate('() => { window.__p = __ev("exportPack()"); }')
    pg.wait_for_function('() => __ev("!S.exporting && !!lastBlob && /zip$/.test(lastName)")', timeout=900000)
    edits = ev(pg, "S.lastEdits.map(l => l.map(c => Math.round((c.t0 - S.segStart) * OUT_FPS)))")
    b64 = pg.evaluate("() => __ev(\"new Promise(r => { const f = new FileReader(); f.onload = () => r(f.result); f.readAsDataURL(lastBlob); })\")")
    z = zipfile.ZipFile(io.BytesIO(base64.b64decode(b64.split(',')[1])))
    names = sorted(n for n in z.namelist() if n.endswith('.mp4'))
    check(tag + ' : pack de 5 vidéos', len(names) == 5, names)
    for k, n in enumerate(names):
        p = os.path.join(OUTDIR or tempfile.gettempdir(), 'fluidite-%s-pack-%d.mp4' % ('iphone' if iphone else 'ordi', k + 1))
        open(p, 'wb').write(z.read(n))
        measures['%s pack %d' % (tag, k + 1)] = analyse('%s pack %d/5' % (tag, k + 1), p, edits[k] if k < len(edits) else [])
    check(tag + ' : aucune erreur dans la page', not errs, errs)
    ctx.close()


def main():
    global PW
    tmp = tempfile.mkdtemp(prefix='stalak-fluide-')
    site = os.path.join(tmp, 'site'); shutil.copytree(PUBLIC, site)
    from _probe import add_probe; add_probe(site)
    subprocess.run([FF, '-nostdin', '-v', 'error', '-y', '-f', 'lavfi', '-i', "aevalsrc='%s':s=44100:d=20" % BEAT, '-ac', '1', os.path.join(site, 'beat.wav')], check=True)
    make_take(os.path.join(site, 'take1.mp4'), 1080, 1920, '30', 1)
    make_take(os.path.join(site, 'take2.mp4'), 720, 1280, '30000/1001', 2)
    make_take(os.path.join(site, 'take3.mp4'), 1080, 1920, '30', 3, jitter=True)
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=site))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = 'http://127.0.0.1:%d/' % srv.server_address[1]
    measures = {}
    with sync_playwright() as p:
        PW = p
        b = p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'])
        only = os.environ.get('FLUIDE_ONLY')
        for iphone in (True, False):
            if only and only != ('iphone' if iphone else 'ordi'): continue
            try: run(b, base, site, iphone, measures)
            except Exception as e: check(('iPhone' if iphone else 'ordinateur') + ' : déroulé complet', False, str(e)[:400])
        b.close()
    srv.shutdown(); shutil.rmtree(tmp, ignore_errors=True)
    print('MESURES ' + json.dumps(measures, ensure_ascii=False))
    print('%d/%d réussis' % (sum(results), len(results)))
    sys.exit(0 if all(results) else 1)


main()
