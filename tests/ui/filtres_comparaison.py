"""Comparison page of the video filters, made from the app's own code (the /*@FILTERS*/ block of src/app.js), and a check
that every filter works.

    python3 /abs/path/tests/ui/filtres_comparaison.py <out.html> [folder for captures]

- <out.html>: a page (artifact) showing each filter on example pictures (a face, a night scene, a day scene), in 9:16 and in 16:9,
  moving (grain, VHS lines, jumps) or still, and on a photo or a video picked by the viewer. Nothing is copied by hand: the
  shader and the overlay are taken from src/app.js as they are, so the page shows exactly what the app draws.
- with a captures folder: the page is opened in Chromium, each filter is drawn at the size of the finished video (1080×1920 and
  1920×1080), the PNGs are saved, and the script checks that every filter compiles, changes the picture, and is the same at
  half size (preview) and full size (export). Exit code 1 if a check fails."""
import base64, io, json, os, re, sys
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.abspath(sys.argv[1])
SHOTS = os.path.abspath(sys.argv[2]) if len(sys.argv) > 2 else None
js = open(os.path.join(ROOT, 'src', 'app.js'), encoding='utf-8').read()
block = re.search(r'/\*@FILTERS\*/(.*?)/\*FILTERS@\*/', js, re.S).group(1)
FR = json.loads(re.search(r'/\*@FR\*/(.*?)/\*FR@\*/', js, re.S).group(1))

# what each filter does, as the owner asked for it (shown under each picture)
DESC = {
    'givre': 'Bleu froid, blancs éclatants, voile glacé sur les bords.',
    'la': 'Grain, tons chauds délavés, noirs grisés.',
    'nuit': 'Vert monochrome, grain fort, bords flous.',
    'demon': 'Rouges profonds, noirs écrasés, zones claires qui brillent, léger tremblement.',
    'hallo': 'Orange et violet, contraste fort, vignette sombre.',
    'vhs': 'Lignes de cassette, couleurs qui bavent, date en coin.',
    'film35': 'Grain de pellicule, tons chauds.',
    'super8': 'Image jaunie, coins sombres, petites saccades.',
    'nb': 'Contrasté et granuleux.',
    'golden': 'Lumière dorée.',
    'reve': 'Halo lumineux sur les zones claires.',
    'y2k': 'Couleurs saturées, reflets années 2000, petites étoiles.',
    'pastel': 'Couleurs douces et claires.',
    # « Couleurs »: the looks of the stories' colour filters (their name on Instagram in brackets, for comparing)
    'velours': 'Doux et flatteur, léger halo, contraste adouci (façon « Paris »).',
    'soleil': 'Chaud, lumineux, couleurs riches (façon « Los Angeles »).',
    'cocon': 'Plus chaud, un peu délavé (façon « Oslo »).',
    'lagon': 'Bleus et verts plus vifs, plus de contraste (façon « Lagos »).',
    'eclat': 'Plus lumineux, un peu plus contrasté (façon « Melbourne »).',
    'miel': 'Doux, chaud et clair (façon « Jakarta »).',
    'dune': 'Chaud et doré, élégant (façon « Abu Dhabi »).',
    'souvenir': 'Délavé, rose chaud, nostalgique (façon « Buenos Aires »).',
    'beton': 'Plus sombre, plus froid, urbain (façon « New York »).',
    'fuchsia': 'Teinte rose chaude, vive (façon « Jaipur »).',
    'safran': 'Jaune doré, un peu délavé (façon « Le Caire »).',
    'mono': 'Noir et blanc net, sans grain (façon « Tokyo »).',
    'tropique': 'Dégradé coucher de soleil posé sur l’image (façon « Rio de Janeiro »).',
}


def sample(path, box=None):
    im = Image.open(path).convert('RGB')
    if box: im = im.crop(box)
    b = io.BytesIO(); im.save(b, 'JPEG', quality=92)
    return 'data:image/jpeg;base64,' + base64.b64encode(b.getvalue()).decode()


import sklearn, skimage
SK = os.path.join(os.path.dirname(skimage.__file__), 'data')
SL = os.path.join(os.path.dirname(sklearn.__file__), 'datasets', 'images')
SAMPLES = [   # free example pictures shipped with scikit-image / scikit-learn (no person)
    {'id': 'visage', 'name': 'Visage', 'src': sample(os.path.join(SK, 'chelsea.png'))},
    {'id': 'nuit', 'name': 'Nuit et lumières', 'src': sample(os.path.join(SK, 'rocket.jpg'))},
    {'id': 'jour', 'name': 'Jour', 'src': sample(os.path.join(SL, 'china.jpg'))},
]
NAMES = {f: FR['filt.' + f] for f in ['none'] + list(DESC)}
THEMES = {k: FR['filt.th.' + k] for k in ('col', 'cam', 'retro', 'esth')}

PAGE = r'''<title>Filtres Stalak</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lilita+One&family=Rubik:wght@400;500;700&family=JetBrains+Mono:wght@700&display=swap">
<style>
/* Stalak's own world, one look on purpose: blue sky, white cards outlined in ink, ice. Cards in a grid, one per filter, by theme. */
:root{ --sky:#1f6fd6; --sky-deep:#1557b0; --ice:#d6ecff; --frost:#eef7ff; --snow:#ffffff; --ink:#0a0d14; --muted:#3f5170; --pro:#7a3ff2; --free:#11804a;
  --display:"Lilita One", "Arial Rounded MT Bold", system-ui, sans-serif; --body:"Rubik", system-ui, -apple-system, "Segoe UI", sans-serif; color-scheme:light }
body{ background:var(--sky); color:var(--ink); font:400 15px/1.5 var(--body) }
.wrap{ max-width:1180px; margin:0 auto; padding-block:28px 64px; padding-left:max(16px, env(safe-area-inset-left, 0px)); padding-right:max(16px, env(safe-area-inset-right, 0px)); display:flex; flex-direction:column; gap:22px }
h1{ font:400 clamp(30px, 6vw, 46px)/1.05 var(--display); color:var(--snow); margin:0; text-shadow:0 3px 0 var(--ink); letter-spacing:.01em; text-wrap:balance }
.lead{ color:var(--snow); margin:6px 0 0; max-width:62ch }
.bar{ background:var(--snow); border:3px solid var(--ink); border-radius:20px; padding:14px; display:flex; flex-wrap:wrap; gap:12px 22px; align-items:center; box-shadow:0 5px 0 var(--ink) }
.grp{ display:flex; flex-wrap:wrap; gap:8px; align-items:center; min-width:0 }
.grp > span{ font:700 12px/1 var(--body); text-transform:uppercase; letter-spacing:.08em; color:var(--muted); margin-right:2px }
.chip{ display:inline-flex; align-items:center; font:500 14px/1 var(--body); color:var(--ink); background:var(--frost); border:2.5px solid var(--ink); border-radius:999px; padding:9px 14px; cursor:pointer; min-height:40px }
.chip[aria-pressed="true"]{ background:var(--ink); color:var(--snow) }
.chip:focus-visible, .card:focus-visible, .big button:focus-visible{ outline:3px solid var(--snow); outline-offset:3px; box-shadow:0 0 0 6px var(--ink) }
.file{ position:relative; overflow:hidden }
.file input{ position:absolute; inset:0; opacity:0; cursor:pointer }
section h2{ font:400 26px/1.1 var(--display); color:var(--snow); margin:0 0 12px; text-shadow:0 2px 0 var(--ink) }
.grid{ display:grid; gap:16px; grid-template-columns:repeat(auto-fill, minmax(min(100%, var(--cw)), 1fr)) }
.grid.v{ --cw:178px } .grid.h{ --cw:300px }
.card{ background:var(--snow); border:3px solid var(--ink); border-radius:18px; overflow:hidden; display:flex; flex-direction:column; cursor:zoom-in; text-align:left; padding:0; font:inherit; color:inherit; box-shadow:0 4px 0 var(--ink); transition:transform .15s }
.card:hover{ transform:translateY(-2px) }
.card canvas{ width:100%; height:auto; display:block; background:var(--ink); border-bottom:3px solid var(--ink) }
.card .txt{ padding:10px 12px 12px; display:flex; flex-direction:column; gap:4px; min-width:0 }
.card .nm{ display:flex; align-items:center; gap:8px; justify-content:space-between; font:700 15px/1.2 var(--body) }
.card .ds{ color:var(--muted); font-size:13px; line-height:1.4 }
.tag{ font:700 11px/1 var(--body); letter-spacing:.06em; text-transform:uppercase; border-radius:999px; padding:5px 8px; color:var(--snow); white-space:nowrap }
.tag.pro{ background:var(--pro) } .tag.free{ background:var(--free) }
.note{ background:var(--frost); border:3px solid var(--ink); border-radius:16px; padding:12px 14px; max-width:78ch }
.note p{ margin:0 } .note p + p{ margin-top:6px }
.big{ position:fixed; inset:0; background:rgba(10,13,20,.92); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; z-index:20;
  padding:calc(16px + env(safe-area-inset-top, 0px)) max(16px, env(safe-area-inset-right, 0px)) calc(16px + env(safe-area-inset-bottom, 0px)) max(16px, env(safe-area-inset-left, 0px)) }
.big[hidden]{ display:none }
.big canvas{ max-width:100%; max-height:calc(100% - 120px); border:3px solid var(--snow); border-radius:14px; background:#000 }
.big .row{ display:flex; gap:10px; flex-wrap:wrap; justify-content:center; align-items:center; color:var(--snow); font:700 18px/1.2 var(--body) }
.big button{ font:500 15px/1 var(--body); background:var(--snow); color:var(--ink); border:2.5px solid var(--ink); border-radius:999px; padding:10px 16px; min-height:44px; cursor:pointer }
.big button.hold{ background:var(--ice) }
@media (prefers-reduced-motion:reduce){ .card{ transition:none } .card:hover{ transform:none } }
</style>
<div class="wrap">
  <header>
    <h1>Filtres Stalak</h1>
    <p class="lead">Les 26 filtres, dessinés par le même code que l’app. Ce que tu vois ici est ce que l’aperçu et la vidéo exportée montreront. Touche un filtre pour le voir en grand et le comparer à l’original.</p>
  </header>
  <div class="bar" role="group" aria-label="Réglages de la comparaison">
    <div class="grp" id="smp"><span>Image</span></div>
    <div class="grp" id="fmt"><span>Format</span>
      <button class="chip" type="button" data-v="v" aria-pressed="true">9:16 (TikTok)</button>
      <button class="chip" type="button" data-v="h" aria-pressed="false">16:9 (Clip)</button>
    </div>
    <div class="grp"><span>Mouvement</span>
      <button class="chip" type="button" id="anim" aria-pressed="true">Animé</button>
    </div>
  </div>
  <div class="note">
    <p><b>À valider :</b> l’ambiance de chaque filtre. Les paroles ne sont pas dessinées ici : dans l’app, elles restent au-dessus du filtre, sans changer.</p>
    <p>Gratuit : Givre, Film 35 mm, Noir &amp; blanc. Les 23 autres sont Stalak Pro : on peut les essayer dans l’aperçu, l’export ouvre la page Pro.</p>
  </div>
  <div id="themes"></div>
</div>
<div class="big" id="big" hidden role="dialog" aria-modal="true" aria-labelledby="bigName">
  <canvas id="bigCv"></canvas>
  <div class="row"><span id="bigName"></span></div>
  <div class="row">
    <button type="button" id="bigOrig" aria-pressed="false">Maintenir pour voir l’original</button>
    <button type="button" id="bigPrev">‹ Précédent</button>
    <button type="button" id="bigNext">Suivant ›</button>
    <button type="button" id="bigClose">Fermer</button>
  </div>
</div>
<script>
__BLOCK__
const SAMPLES = __SAMPLES__, NAMES = __NAMES__, THEMES = __THEMES__, DESC = __DESC__;
const $ = s => document.querySelector(s);
let fmt = 'v', anim = true, cur = SAMPLES[0].id, media = null, userUrl = null, bigIdx = -1, holdOrig = false;
const imgs = {}; SAMPLES.forEach(s => { const i = new Image(); i.src = s.src; imgs[s.id] = i; });
const R = filtRunner();
// the source picture at the finished video's shape (half size, as in the app's preview), « cover » like the app
const srcCv = document.createElement('canvas'), srcCx = srcCv.getContext('2d');
const L = () => fmt === 'v' ? [1080, 1920] : [1920, 1080];
function fillSource(){
  const [lw, lh] = L(), k = 0.5, w = lw * k, h = lh * k; if (srcCv.width !== w || srcCv.height !== h){ srcCv.width = w; srcCv.height = h; }
  const m = cur === 'user' ? media : imgs[cur]; srcCx.fillStyle = '#000'; srcCx.fillRect(0, 0, w, h);
  if (!m) return false;
  const sw = m.videoWidth || m.naturalWidth || m.width, sh = m.videoHeight || m.naturalHeight || m.height; if (!sw) return false;
  const sc = Math.max(w / sw, h / sh); srcCx.imageSmoothingQuality = 'high';
  srcCx.drawImage(m, (w - sw * sc) / 2, (h - sh * sc) / 2, sw * sc, sh * sc); return true;
}
// a card: the picture through its filter, then the overlay (VHS writing, Y2K stars) in the finished video's units
function paint(cv, idx, t){
  const [lw, lh] = L(), x = cv.getContext('2d');
  if (holdOrig && cv.id === 'bigCv'){ x.drawImage(srcCv, 0, 0, cv.width, cv.height); return; }
  x.drawImage(R.run(srcCv, idx, t, cv.width, cv.height, lw, lh), 0, 0);
  x.save(); x.scale(cv.width / lw, cv.height / lh); filtOverlay(x, idx, t, lw, lh); x.restore();
}
const cards = [];
function build(){
  const box = $('#themes'); box.innerHTML = ''; cards.length = 0;
  const [lw, lh] = L(), cw = fmt === 'v' ? 270 : 480, ch = Math.round(cw * lh / lw);
  const groups = [[null, [0]]].concat(FILT_THEMES.map(th => [th, FILTERS.map((f, i) => f.th === th ? i : -1).filter(i => i >= 0)]));
  groups.forEach(([th, list]) => {
    const sec = document.createElement('section'), h2 = document.createElement('h2'); h2.textContent = th ? THEMES[th] : 'Sans filtre (l’original)'; sec.append(h2);
    const grid = document.createElement('div'); grid.className = 'grid ' + fmt; sec.append(grid);
    list.forEach(i => {
      const f = FILTERS[i], b = document.createElement('button'); b.type = 'button'; b.className = 'card'; b.setAttribute('aria-label', 'Voir ' + NAMES[f.id] + ' en grand');
      const cv = document.createElement('canvas'); cv.width = cw; cv.height = ch;
      const tx = document.createElement('div'); tx.className = 'txt';
      tx.innerHTML = '<div class="nm"><span></span>' + (i ? '<span class="tag ' + (f.free ? 'free">Gratuit' : 'pro">Pro') + '</span>' : '') + '</div><div class="ds"></div>';
      tx.querySelector('.nm span').textContent = NAMES[f.id]; tx.querySelector('.ds').textContent = DESC[f.id] || 'Ta vidéo telle quelle.';
      b.append(cv, tx); b.onclick = () => openBig(i); grid.append(b); cards.push([cv, i]);
    });
    box.append(sec);
  });
}
function frame(force){
  const t = cur === 'user' && media && media.tagName === 'VIDEO' ? media.currentTime : (anim ? performance.now() / 1000 : 4.2);
  if (!fillSource()) return;
  for (const [cv, i] of cards) paint(cv, i, t);
  if (bigIdx >= 0) paint($('#bigCv'), bigIdx, t);
}
function loop(){ if (anim || (media && media.tagName === 'VIDEO')) frame(); requestAnimationFrame(loop); }
function openBig(i){
  bigIdx = i; const [lw, lh] = L(), cv = $('#bigCv'), k = Math.min(1, 900 / Math.max(lw, lh)); cv.width = Math.round(lw * k); cv.height = Math.round(lh * k);
  const f = FILTERS[i]; $('#bigName').textContent = NAMES[f.id] + (i ? (f.free ? ' · gratuit' : ' · Stalak Pro') : '');
  $('#big').hidden = false; $('#bigClose').focus(); frame();
}
function closeBig(){ const i = bigIdx; bigIdx = -1; $('#big').hidden = true; const c = cards.find(x => x[1] === i); if (c) c[0].parentElement.focus(); }
$('#bigClose').onclick = closeBig;
$('#bigPrev').onclick = () => openBig((bigIdx + FILTERS.length - 1) % FILTERS.length);
$('#bigNext').onclick = () => openBig((bigIdx + 1) % FILTERS.length);
const hold = on => { holdOrig = on; $('#bigOrig').classList.toggle('hold', on); $('#bigOrig').setAttribute('aria-pressed', String(on)); frame(); };
$('#bigOrig').addEventListener('pointerdown', e => { e.preventDefault(); hold(true); });
['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => $('#bigOrig').addEventListener(ev, () => hold(false)));
$('#bigOrig').addEventListener('keydown', e => { if (e.key === ' ' || e.key === 'Enter'){ e.preventDefault(); hold(true); } });
$('#bigOrig').addEventListener('keyup', () => hold(false));
document.addEventListener('keydown', e => { if (bigIdx < 0) return; if (e.key === 'Escape') closeBig(); if (e.key === 'ArrowRight') $('#bigNext').click(); if (e.key === 'ArrowLeft') $('#bigPrev').click(); });
// pictures: the examples, then the viewer's own photo or video
const smp = $('#smp');
SAMPLES.forEach((s, k) => { const b = document.createElement('button'); b.className = 'chip'; b.type = 'button'; b.dataset.v = s.id; b.textContent = s.name; b.setAttribute('aria-pressed', String(k === 0)); smp.append(b); });
{ const l = document.createElement('label'); l.className = 'chip file'; l.textContent = 'Ta photo ou ta vidéo…'; const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*,video/*'; i.id = 'userFile'; i.setAttribute('aria-label', 'Choisir ta photo ou ta vidéo'); l.append(i); smp.append(l);
  i.onchange = () => { const f = i.files[0]; if (!f) return; if (userUrl) URL.revokeObjectURL(userUrl); userUrl = URL.createObjectURL(f);
    if (/^video/.test(f.type)){ const v = document.createElement('video'); v.muted = true; v.loop = true; v.playsInline = true; v.src = userUrl; v.onloadeddata = () => { media = v; v.play().catch(() => {}); pick('user'); }; }
    else { const im = new Image(); im.onload = () => { media = im; pick('user'); }; im.src = userUrl; } }; }
function pick(id){ cur = id; smp.querySelectorAll('.chip').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v === id || (id === 'user' && b.classList.contains('file'))))); frame(); }
smp.addEventListener('click', e => { const b = e.target.closest('button.chip'); if (b) pick(b.dataset.v); });
$('#fmt').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; fmt = b.dataset.v; $('#fmt').querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); build(); frame(); });
$('#anim').onclick = () => { anim = !anim; $('#anim').setAttribute('aria-pressed', String(anim)); $('#anim').textContent = anim ? 'Animé' : 'Image fixe'; frame(); };
if (matchMedia('(prefers-reduced-motion: reduce)').matches){ anim = false; $('#anim').setAttribute('aria-pressed', 'false'); $('#anim').textContent = 'Image fixe'; }
build();
Promise.all(Object.values(imgs).map(i => i.decode().catch(() => {}))).then(() => { frame(); requestAnimationFrame(loop); });
if (document.fonts) document.fonts.ready.then(() => frame());
window.__filt = { L, frame, fillSource, R, srcCv, pick, setFmt: f => { fmt = f; build(); }, paint };
</script>
'''

html = (PAGE.replace('__BLOCK__', block)
        .replace('__SAMPLES__', json.dumps(SAMPLES)).replace('__NAMES__', json.dumps(NAMES, ensure_ascii=False))
        .replace('__THEMES__', json.dumps(THEMES, ensure_ascii=False)).replace('__DESC__', json.dumps(DESC, ensure_ascii=False)))
open(OUT, 'w', encoding='utf-8').write(html)
print('page :', OUT, '(%d ko)' % (len(html) // 1024))

if not SHOTS: sys.exit(0)

# ---- checks and captures in Chromium ----
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH', '/opt/pw-browsers')
from playwright.sync_api import sync_playwright
os.makedirs(SHOTS, exist_ok=True)
results = []


def check(name, ok, info=''):
    results.append(ok); print(('PASS ' if ok else 'FAIL ') + name + (('  — ' + str(info)) if info and not ok else ''))


page_html = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>' + html + '</body></html>'
test = OUT + '.test.html'; open(test, 'w', encoding='utf-8').write(page_html)
with sync_playwright() as p:
    b = p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    pg = b.new_page(viewport={'width': 1280, 'height': 900}); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)[:200]))
    pg.on('console', lambda m: errs.append(m.text[:200]) if m.type == 'error' and 'fonts.g' not in m.text and 'Failed to load resource' not in m.text else None)
    pg.goto('file://' + test); pg.wait_for_function('window.__filt', timeout=20000); pg.wait_for_timeout(1200)
    check('le code des filtres se charge et compile', not errs and pg.evaluate('!!__filt.R'), errs)
    stats = pg.evaluate("""() => {
      const out = {}, F = window.__filt;
      for (const [fmt, smp] of [['v', 'visage'], ['h', 'jour'], ['v', 'nuit']]){
        F.setFmt(fmt); F.pick(smp); F.fillSource();
        const [lw, lh] = F.L(), mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
        const base = mk(lw / 4, lh / 4); base.getContext('2d').drawImage(F.srcCv, 0, 0, base.width, base.height);
        const bd = base.getContext('2d').getImageData(0, 0, base.width, base.height).data;
        FILTERS.forEach((f, i) => {
          // full size (export) and half size (preview), both brought down to a quarter to compare the look, not the pixels
          const full = mk(lw, lh), half = mk(lw / 2, lh / 2);
          F.paint(full, i, 3.0); F.paint(half, i, 3.0);
          const a = mk(lw / 4, lh / 4), b2 = mk(lw / 4, lh / 4);
          a.getContext('2d').drawImage(full, 0, 0, a.width, a.height); b2.getContext('2d').drawImage(half, 0, 0, b2.width, b2.height);
          const da = a.getContext('2d').getImageData(0, 0, a.width, a.height).data, db = b2.getContext('2d').getImageData(0, 0, a.width, a.height).data;
          let dHalf = 0, dOrig = 0, n = 0, sum = 0;
          for (let k = 0; k < da.length; k += 4){ for (let ch = 0; ch < 3; ch++){ dHalf += Math.abs(da[k+ch] - db[k+ch]); dOrig += Math.abs(da[k+ch] - bd[k+ch]); sum += da[k+ch]; } n += 3; }
          out[fmt + ':' + smp + ':' + f.id] = { half: dHalf / n, orig: dOrig / n, mean: sum / n, png: full.toDataURL('image/png') };
        });
      }
      return out;
    }""")
    for key, st in stats.items():
        fmt, smp, fid = key.split(':')
        open(os.path.join(SHOTS, ('916' if fmt == 'v' else '169') + '-' + smp + '-' + fid + '.png'), 'wb').write(base64.b64decode(st['png'].split(',', 1)[1]))
        if fid == 'none':
            check(key + ' : sans filtre = image d’origine', st['orig'] < 1.0, round(st['orig'], 2))
        else:
            check(key + ' : le filtre change l’image (écart %.0f)' % st['orig'], st['orig'] > 6, round(st['orig'], 2))
            check(key + ' : image ni noire ni blanche (moyenne %.0f)' % st['mean'], 18 < st['mean'] < 235, round(st['mean'], 1))
        # grain and fine lines differ pixel by pixel between sizes; the look (a quarter-size view) must match
        check(key + ' : même rendu aperçu / export (écart %.1f)' % st['half'], st['half'] < 9, round(st['half'], 2))
    pg.evaluate("__filt.setFmt('v'); __filt.frame()"); pg.wait_for_timeout(300)
    pg.screenshot(path=os.path.join(SHOTS, 'page-ordi.png'), full_page=True)
    pg.set_viewport_size({'width': 390, 'height': 844}); pg.wait_for_timeout(300)
    sw = pg.evaluate('document.documentElement.scrollWidth')
    check('page sur téléphone sans défilement horizontal', sw <= 390, sw)
    pg.screenshot(path=os.path.join(SHOTS, 'page-tel.png'))
    b.close()
os.remove(test)
print('%d/%d réussis' % (sum(results), len(results)))
sys.exit(0 if all(results) else 1)
