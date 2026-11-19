"""Re-render only some shots of an episode through HyperFrames and splice them into the full render.

usage : SERIE_WORK=<work dir> python3 tools/serie/splice.py <ep> <shot_index> [<shot_index> ...]     (0 = first shot, -1 = last shot)
Before : tcrazy.py <ep> plan (when the timeline or the subtitles changed), then tcrazy.py <ep> hfproject ; after : mux, sheet,
deliver, thumb. Every splice starts again from the full render : give all the shots to redo in one go.

The full HyperFrames render <ep>/video_hf.mp4 stays the base ; each chosen shot is rendered again (from 0.2 s before
its start, to check the alignment on the frames that did not change) and its frames replace the old ones, cut exactly
on the shot's own boundaries. Then the same final encode as the pipeline (video.mp4, TV range BT.709).
"""
import json, math, os, subprocess, sys
import numpy as np
from PIL import Image

WORK = os.environ['SERIE_WORK']
FPS = 30
ep, idx = sys.argv[1], [int(a) for a in sys.argv[2:]]
d = os.path.join(WORK, ep)
D = json.load(open(os.path.join(d, 'ep.json'), encoding='utf-8'))
proj, full = os.path.join(d, 'hf'), os.path.join(d, 'video_hf.mp4')
sp = os.path.join(d, 'splice'); os.makedirs(sp, exist_ok=True)


def run(cmd, **kw):
    r = subprocess.run(cmd, capture_output=True, text=True, **kw)
    if r.returncode:
        print(r.stdout[-2000:], r.stderr[-2000:]); raise SystemExit('failed : ' + ' '.join(cmd[:4]))
    return r


def nframes(p):
    return int(run(['ffprobe', '-v', 'error', '-count_frames', '-select_streams', 'v:0', '-show_entries', 'stream=nb_read_frames', '-of', 'csv=p=0', p]).stdout.strip())


def frame(p, n):
    out = os.path.join(sp, '_f.png')
    run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', p, '-vf', 'select=eq(n\\,%d)' % n, '-frames:v', '1', '-vsync', '0', out])
    return np.asarray(Image.open(out).convert('RGB'), dtype=np.float32)


N = nframes(full)
first = lambda t: int(math.ceil(t * FPS - 1e-6))   # the first frame index at or after the time t
segs = []
# the shots to redo, as frame ranges ; shots next to each other are rendered as one segment
rng = []
for i in sorted(j % len(D['shots']) for j in idx):
    sh = D['shots'][i]
    a, b = first(sh['t0']), (first(sh['t1']) if sh is not D['shots'][-1] else N)
    if rng and rng[-1][1] == a:
        rng[-1] = (rng[-1][0], b, rng[-1][2] + '+' + sh['frame'])
    else:
        rng.append((a, b, sh['frame']))
for a, b, name in rng:
    pre = 6 if a >= 6 else 0                          # 0.2 s of the shot before, rendered too, for the alignment check
    s0 = (a - pre) / FPS
    out = os.path.join(sp, 'seg_%s.mp4' % name)
    sh = {'frame': name}
    cmd = ['npx', '-y', 'hyperframes', 'render', proj, '-o', out, '--quality', 'high', '--fps', '30', '--quiet', '--start', '%.4f' % s0]
    if b < N:
        cmd += ['--end', '%.4f' % ((b + 2) / FPS)]
    print('render', sh['frame'], 'frames', a, b, 'from', s0, flush=True)
    run(cmd)
    n = nframes(out)
    # alignment : the frames before the shot are the same in both renders (or, for the first shot, the lower part of the picture)
    # (offset k : the segment's first frame is the full render's frame a - pre + k)
    s0f = frame(out, 0)
    if pre:
        errs = {k: float(np.abs(s0f - frame(full, a - pre + k)).mean()) for k in (-1, 0, 1)}
    else:
        # the first shot is rendered from 0 : its frame k is at k / 30 s by construction (nothing to compare it with,
        # its whole picture may have changed)
        errs = {0: 0.0}
    k = min(errs, key=errs.get)
    print('  alignment error by offset :', {kk: round(v, 2) for kk, v in errs.items()}, '->', k, flush=True)
    if errs[k] > 3:
        raise SystemExit('the segment is not aligned on the full render')
    pre -= k
    need = b - a
    if n - pre < need:
        raise SystemExit('segment too short : %d frames for %d' % (n - pre, need))
    segs.append((a, b, out, pre))

# the cut list : the full render between the re-rendered shots
segs.sort()
parts, cur, inputs = [], 0, [full]
for a, b, out, pre in segs:
    if a > cur:
        parts.append((0, cur, a))
    inputs.append(out)
    parts.append((len(inputs) - 1, pre, pre + (b - a)))
    cur = b
if cur < N:
    parts.append((0, cur, N))
# 19/11 : each part is cut into its own lossless file, then the parts are joined by the concat demuxer, which reads them one
# after the other. (One filter graph that trims the same full render several times kept its frames in memory : about 6 GB on
# episode 13, and the system stopped it.)
lst = os.path.join(sp, 'parts.txt')
with open(lst, 'w') as f:
    for j, (src, s, e) in enumerate(parts):
        pj = os.path.join(sp, 'part_%02d.mp4' % j)
        run(['ffmpeg', '-nostdin', '-y', '-v', 'error', '-i', inputs[src], '-vf', 'trim=start_frame=%d:end_frame=%d,setpts=PTS-STARTPTS' % (s, e),
             '-c:v', 'libx264', '-preset', 'ultrafast', '-qp', '0', '-pix_fmt', 'yuv420p', '-r', '30', pj])
        n = nframes(pj)
        if n != e - s:
            raise SystemExit('part %d : %d frames for %d' % (j, n, e - s))
        f.write("file '%s'\n" % pj)
cmd = ['ffmpeg', '-nostdin', '-y', '-v', 'error', '-f', 'concat', '-safe', '0', '-i', lst, '-vf', 'scale=in_range=pc:out_range=tv:out_color_matrix=bt709',
       '-c:v', 'libx264', '-preset', 'medium', '-crf', '17', '-pix_fmt', 'yuv420p', '-colorspace', 'bt709', '-color_range', 'tv', '-r', '30', os.path.join(d, 'video.mp4')]
run(cmd)
for j in range(len(parts)):
    os.remove(os.path.join(sp, 'part_%02d.mp4' % j))
nv = nframes(os.path.join(d, 'video.mp4'))
print('video.mp4 :', nv, 'frames (full render :', N, ')')
if nv != N:
    raise SystemExit('the spliced video does not have the frames of the full render')
