"""The watermark of free videos (owner, 06/11, « C · Plus petit »): the mascot's face in white, as a stencil.
The white shape of the drawing, with its dark lines cut out (transparent), from site_src/emoji/focus.webp.

    python3 tools/watermark_mascot.py [preview folder]

writes site_src/icons/watermark.svg: the face (one white path, « evenodd »: the holes are the drawing's lines) and, under it,
« stalak.app » in Rubik bold as outlines; and the same picture into src/app.js (between /*@WMSVG*/ and /*WMSVG@*/), which
draws it (wmDraw). Cleaned so it stays sharp when small (about 17 % of the video's width):
- the dreadlocks become one dark mass (the thin light lines between them and the white beads go);
- specks and lines thinner than the video can show are dropped;
- the outline is traced into smooth curves (potrace), so it is sharp at any size.
Needs: pip install opencv-python-headless potracer."""
import os
import sys

import cv2
import numpy as np
import potrace

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'site_src', 'emoji', 'focus.webp')
OUT = os.path.join(ROOT, 'site_src', 'icons', 'watermark.svg')
UP = 4   # work at 4 × the 256 px drawing


def stencil():
    im = cv2.imread(SRC, cv2.IMREAD_UNCHANGED)                      # 256 × 256, BGRA
    im = cv2.resize(im, None, fx=UP, fy=UP, interpolation=cv2.INTER_CUBIC)
    a = im[:, :, 3].astype(np.float32) / 255
    bgr = im[:, :, :3].astype(np.float32)
    luma = 0.114 * bgr[:, :, 0] + 0.587 * bgr[:, :, 1] + 0.299 * bgr[:, :, 2]
    shape = a > 0.5
    # the dark lines of the drawing (black ink, dreadlocks): luma low
    dark = (luma < 78) & shape
    k = lambda r: cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * r + 1, 2 * r + 1))
    d8 = dark.astype(np.uint8)
    # the dreadlocks: closing the dark parts a little fills the thinnest light gaps between the locks (the face stays white)
    d8 = cv2.morphologyEx(d8, cv2.MORPH_CLOSE, k(2))
    # the drawing's outer black outline: a hole along the edge would only thin the shape; the edge is the shape's own edge
    inner = cv2.erode(shape.astype(np.uint8), k(1))
    white = (shape & ~(d8.astype(bool))).astype(np.uint8)
    white &= inner
    # light specks: anywhere, under ~2.5 % of the width; at the sides (the dreadlocks' white beads), under ~5 %. The face in
    # the middle keeps its small parts (the eyes, cut up by the lines of the drawing)
    side = 256 * UP
    n, lab, st, cen = cv2.connectedComponentsWithStats(white, 8)
    for i in range(1, n):
        area, cx = st[i, cv2.CC_STAT_AREA], cen[i][0] / side
        if area < (side * 0.025) ** 2 or (area < (side * 0.05) ** 2 and not 0.3 < cx < 0.7): white[lab == i] = 0
    holes = (1 - white) & shape.astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(holes, 8)
    for i in range(1, n):
        if st[i, cv2.CC_STAT_AREA] < (256 * UP * 0.006) ** 2: white[lab == i] = 1
    # a thin line of the drawing (≈ 2 px at 256 px) would vanish at 17 % of a 1080 px video: lines are made a little wider
    white = cv2.erode(white, k(UP // 2 + 1))
    # the parka's chest (below the fur collar, with half a letter on it): cut off, the face is what is kept
    cut = int(256 * UP * 0.905)
    white[cut:, :] = 0
    white = cv2.morphologyEx(white, cv2.MORPH_OPEN, k(2))
    return white.astype(bool)


def trace(mask):
    bm = potrace.Bitmap(~mask)   # (potracer traces the dark pixels: the white shape is handed over as dark)
    path = bm.trace(turdsize=int((UP * 3) ** 2), alphamax=1.0, opticurve=True, opttolerance=0.3)
    ys, xs = np.where(mask)
    x0, y0, x1, y1 = xs.min() - UP * 2, ys.min() - UP * 2, xs.max() + UP * 2, ys.max() + UP * 2
    s = 1 / UP
    f = lambda p: '%.1f %.1f' % ((p.x - x0) * s, (p.y - y0) * s)
    d = []
    for c in path:
        d.append('M' + f(c.start_point))
        for seg in c.segments:
            if seg.is_corner: d.append('L' + f(seg.c) + 'L' + f(seg.end_point))
            else: d.append('C' + f(seg.c1) + ' ' + f(seg.c2) + ' ' + f(seg.end_point))
        d.append('Z')
    w, h = (x1 - x0) * s, (y1 - y0) * s
    return w, h, ''.join(d)


def text_path(txt, width, top):
    """« stalak.app » in Rubik bold (700), as outlines: the same in every browser, no font to load. Its width: `width`,
    its top at `top`; returns (path, height)"""
    from fontTools.ttLib import TTFont
    from fontTools.varLib.instancer import instantiateVariableFont
    from fontTools.pens.svgPathPen import SVGPathPen
    from fontTools.pens.transformPen import TransformPen
    f = instantiateVariableFont(TTFont(os.path.join(ROOT, 'site_src', 'fonts', 'rubik.ttf')), {'wght': 700})
    gs, cmap, hm = f.getGlyphSet(), f.getBestCmap(), f['hmtx']
    from fontTools.pens.boundsPen import BoundsPen
    names = [cmap[ord(ch)] for ch in txt]
    adv = sum(hm[n][0] for n in names)
    bp, x = BoundsPen(gs), 0
    for n in names: gs[n].draw(TransformPen(bp, (1, 0, 0, 1, x, 0))); x += hm[n][0]
    x0, y0, x1, y1 = bp.bounds   # (font units, y up)
    k = width / (x1 - x0)
    d, x = [], 0
    for n in names:
        pen = SVGPathPen(gs)
        gs[n].draw(TransformPen(pen, (k, 0, 0, -k, (x - x0) * k, top + y1 * k)))
        d.append(pen.getCommands()); x += hm[n][0]
    return ''.join(d), (y1 - y0) * k


def main():
    m = stencil()
    w, h, d = trace(m)
    tw = w * 1.02
    td, th = text_path('stalak.app', tw, h + h * 0.03)
    W = max(w, tw)
    ox = (W - w) / 2
    svg = ("<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 %.1f %.1f'><path fill='#fff' fill-rule='evenodd' transform='translate(%.1f 0)' d='%s'/>"
           "<path fill='#fff' transform='translate(%.1f 0)' d='%s'/></svg>" % (W, h * 1.03 + th + 1, ox, d, (W - tw) / 2, td))
    open(OUT, 'w').write(svg + '\n')
    print('écrit', OUT, len(svg), 'octets, %.0f × %.0f' % (W, h * 1.03 + th))
    # the app draws it from src/app.js: the same picture, written between its markers
    app = os.path.join(ROOT, 'src', 'app.js'); js = open(app, encoding='utf-8').read()
    a, b = js.index('/*@WMSVG*/') + len('/*@WMSVG*/'), js.index('/*WMSVG@*/')
    open(app, 'w', encoding='utf-8').write(js[:a] + '"' + svg.replace('"', "'") + '"' + js[b:])
    print('mis dans', app)
    if len(sys.argv) > 1:
        cv2.imwrite(os.path.join(sys.argv[1], 'mask.png'), (m * 255).astype(np.uint8))


main()
