"""Test of the camera takes' « remise en ordre » (remuxTake), Python Playwright (chromium) + ffmpeg.

    python3 /abs/path/tests/ui/remux_frag.py <path of a built public/ folder>

The recorders write fragmented MP4s. Safari on iPhone writes some without the base offset of each track fragment (allowed by
the standard: the second track's data then follows the first one's). The MP4 library read that data at the wrong place, so the
takes filmed on an iPhone came out broken (« Decoder failure » in the preview, the light copy and the export).
For several layouts of the same video, the take put back in order must decode to exactly the same pictures and sound."""
import functools, http.server, os, shutil, subprocess, sys, tempfile, threading, base64
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.sync_api import sync_playwright

PUBLIC = os.path.abspath(sys.argv[1])
FF = shutil.which('ffmpeg')
LAYOUTS = {   # name: (track order, fragmentation flags)
    'base_moof': (['0:v', '0:a'], ['-movflags', 'frag_keyframe+empty_moov+default_base_moof']),
    'offset_ecrit': (['0:v', '0:a'], ['-movflags', 'frag_keyframe+empty_moov']),
    'sans_offset_video_1re': (['0:v', '0:a'], ['-movflags', 'frag_keyframe+empty_moov+omit_tfhd_offset']),
    'sans_offset_video_2e': (['0:a', '0:v'], ['-movflags', 'empty_moov+omit_tfhd_offset', '-frag_duration', '500000']),
    'moof_separes': (['0:a', '0:v'], ['-movflags', 'frag_keyframe+empty_moov+separate_moof+omit_tfhd_offset']),
}
results = []


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


def check(name, ok, info=''):
    results.append(ok)
    print(('PASS ' if ok else 'FAIL ') + name + (('  — ' + str(info)) if info and not ok else ''))


def ff(*a):
    subprocess.run([FF, '-nostdin', '-v', 'error', '-y', *a], check=True)


def decoded(path, what):
    """md5 of each decoded picture (v) or of the whole decoded sound (a), plus ffmpeg's error lines"""
    if what == 'v':
        p = subprocess.run([FF, '-nostdin', '-v', 'error', '-noautorotate', '-i', path, '-map', '0:v', '-f', 'framemd5', '-'], capture_output=True, text=True)
        # the reading of the file also opens the other track: only the picture decoder's complaints count here
        return [l.split(',')[-1].strip() for l in p.stdout.splitlines() if l and not l.startswith('#')], '\n'.join(l for l in p.stderr.splitlines() if 'h264' in l)
    p = subprocess.run([FF, '-nostdin', '-v', 'error', '-i', path, '-map', '0:a', '-f', 'md5', '-'], capture_output=True, text=True)
    return p.stdout.strip(), '\n'.join(l for l in p.stderr.splitlines() if 'aac' in l)


def main():
    tmp = tempfile.mkdtemp(prefix='stalak-remux-')
    site = os.path.join(tmp, 'site'); shutil.copytree(PUBLIC, site)
    # the app lives in a closure: the page gets a test probe, __ev(code), that evaluates code inside it (this copy only)
    idx = os.path.join(site, 'index.html'); html = open(idx, encoding='utf-8').read()
    assert 'applyLang();\n})();' in html, 'repère de la sonde introuvable'
    open(idx, 'w', encoding='utf-8').write(html.replace('applyLang();\n})();', 'applyLang();\nwindow.__ev = (s) => eval(s);\n})();'))
    # a filmed take: 1920×1080 H.264 baseline turned upright, AAC 48 kHz mono, 4 s, a key picture each second
    src = os.path.join(tmp, 'src.mp4')
    ff('-f', 'lavfi', '-i', 'testsrc2=size=1920x1080:rate=30', '-f', 'lavfi', '-i', 'sine=frequency=440:sample_rate=48000', '-t', '4',
       '-c:v', 'libx264', '-profile:v', 'baseline', '-g', '30', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-ac', '1', '-ar', '48000', src)
    for name, (order, flags) in LAYOUTS.items():
        ff('-display_rotation', '90', '-i', src, '-map', order[0], '-map', order[1], '-c', 'copy', *flags, os.path.join(site, name + '.mp4'))
    srv = http.server.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Quiet, directory=site))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = 'http://127.0.0.1:%d/' % srv.server_address[1]
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page()
        pg.goto(base, wait_until='load')
        pg.wait_for_function('window.__ev && window.MP4Box && window.Mp4Muxer', timeout=20000)
        for name in LAYOUTS:
            b64 = pg.evaluate("""async name => {
              const blob = await (await fetch('/' + name + '.mp4')).blob();
              const r = await __ev('remuxTake')(new File([blob], name + '.mp4', { type: 'video/mp4' }));
              if (!r) return null;
              const u = new Uint8Array(r.buf); let s = '';
              for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
              return btoa(s);
            }""", name)
            if b64 is None: check(name + ' : remise en ordre faite', False, 'remuxTake a rendu null'); continue
            out = os.path.join(tmp, name + '.out.mp4'); open(out, 'wb').write(base64.b64decode(b64))
            # the reference: the same layout as the recorder wrote it, read by ffmpeg
            ref_v, _ = decoded(os.path.join(site, name + '.mp4'), 'v'); ref_a, _ = decoded(os.path.join(site, name + '.mp4'), 'a')
            v, ve = decoded(out, 'v'); a, ae = decoded(out, 'a')
            same = sum(1 for x, y in zip(v, ref_v) if x == y)
            check(name + ' : images identiques (' + str(same) + '/' + str(len(ref_v)) + ')', len(v) == len(ref_v) and same == len(ref_v) and not ve, ve[:160])
            check(name + ' : son identique', a == ref_a and not ae, ae[:160])
        b.close()
    srv.shutdown(); shutil.rmtree(tmp, ignore_errors=True)
    print('%d/%d réussis' % (sum(results), len(results)))
    sys.exit(0 if all(results) else 1)


main()
