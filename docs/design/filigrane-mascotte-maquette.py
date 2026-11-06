import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops
S, ROOT = sys.argv[1], sys.argv[2]
face = Image.open(f'{ROOT}/public/emoji/focus.webp').convert('RGBA')
a = face.getchannel('A')
lum = face.convert('L')
dark = Image.eval(lum, lambda v: 255 if v < 70 else 0)
lines = ImageChops.multiply(dark, a)                     # the black strokes
solid = Image.eval(a, lambda v: 255 if v > 40 else 0)    # whole shape
white = Image.new('RGBA', face.size, (255,255,255,0))
def mk(alpha): m = white.copy(); m.putalpha(alpha); return m
def scale(ch, k): return Image.eval(ch, lambda v: int(v*k))
V = {}
V['A'] = ('Silhouette pleine', mk(scale(solid, .9)))
V['B'] = ('Trait blanc', mk(lines))
V['C'] = ('Pochoir', mk(scale(ImageChops.subtract(solid, lines), .92)))
V['D'] = ('Givré', mk(ImageChops.lighter(scale(solid, .35), lines)))
# E: round badge: translucent white ring + stencil inside
sz = 256; badge = Image.new('RGBA', (sz, sz), (0,0,0,0)); d = ImageDraw.Draw(badge)
d.ellipse((6,6,sz-6,sz-6), outline=(255,255,255,235), width=12, fill=(255,255,255,40))
inner = V['C'][1].resize((190,190), Image.LANCZOS); badge.alpha_composite(inner, (33,40))
V['E'] = ('Badge rond', badge)
font = ImageFont.truetype(f'{ROOT}/public/fonts/rubik.ttf', 30)
try: font.set_variation_by_axes([700])
except Exception: pass
def mark(img, w):
    h = int(img.height*w/img.width); im = img.resize((w, h), Image.LANCZOS)
    tw = int(font.getlength('stalak.app')); W = max(w, tw+8); H = h + 40
    m = Image.new('RGBA', (W, H), (0,0,0,0)); m.alpha_composite(im, ((W-w)//2, 0))
    ImageDraw.Draw(m).text((W//2, h+4), 'stalak.app', font=font, fill=(255,255,255,235), anchor='mt')
    sh = Image.new('RGBA', m.size, (0,0,0,0)); sh.putalpha(scale(m.getchannel('A'), .45))
    sh = sh.filter(ImageFilter.GaussianBlur(4))
    out = Image.new('RGBA', (W+12, H+12), (0,0,0,0)); out.alpha_composite(sh, (8,8)); out.alpha_composite(m, (6,6)); return out
take = Image.open(f'{S}/take_crop.png').crop((40,0,434,700)).resize((540,960), Image.LANCZOS).convert('RGBA')
blue = Image.open(f'{S}/full14.png').resize((540,960), Image.LANCZOS).convert('RGBA')
lab = ImageFont.truetype(f'{ROOT}/public/fonts/rubik.ttf', 34)
cols = []
for k,(name,img) in V.items():
    m = mark(img, 120)
    col = Image.new('RGB', (540, 70+960*2+20), (24,24,28)); dd = ImageDraw.Draw(col)
    dd.text((270, 35), f'{k}. {name}', font=lab, fill=(255,255,255), anchor='mm')
    for i,bg in enumerate((take, blue)):
        p = bg.copy(); p.alpha_composite(m, (540-m.width-24, 960-m.height-170)); col.paste(p.convert('RGB'), (0, 70+i*(960+20)))
    cols.append(col)
    # close-up
    z = Image.new('RGBA', (420, 420), (90,90,96,255)); mm = mark(img, 260); z.alpha_composite(mm, ((420-mm.width)//2, (420-mm.height)//2)); z.convert('RGB').save(f'{S}/zoom_{k}.png')
board = Image.new('RGB', (len(cols)*560+20, cols[0].height+20), (12,12,14))
for i,c in enumerate(cols): board.paste(c, (20+i*560, 10))
board.save(f'{S}/filigranes_maquettes.jpg', quality=90)
z = [Image.open(f'{S}/zoom_{k}.png') for k in V]; zb = Image.new('RGB', (len(z)*430+10, 480), (12,12,14)); dz = ImageDraw.Draw(zb)
for i,im in enumerate(z): zb.paste(im, (10+i*430, 50)); dz.text((10+i*430+210, 25), list(V)[i], font=lab, fill='white', anchor='mm')
zb.save(f'{S}/filigranes_gros_plan.jpg', quality=92)
print('ok')
