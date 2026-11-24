import os, gen_pay as g
D = os.path.dirname(os.path.abspath(__file__))
def css(img, hero, tsize, extra=''):
    return f"""
#bg{{position:absolute;inset:0;background:#081a45}}
#hero{{position:absolute;left:0;top:0;width:1080px;height:{hero}px;overflow:hidden}}
#hero img{{position:absolute;left:50%;top:0;height:100%;width:auto;transform:translateX(-50%)}}
#fade{{position:absolute;left:0;right:0;top:{hero-260}px;height:262px;background:linear-gradient(180deg,rgba(8,26,69,0),#081a45 88%)}}
.beam{{position:absolute;top:-200px;width:220px;height:1000px;background:linear-gradient(180deg,rgba(255,255,255,.38),rgba(255,255,255,0));filter:blur(10px);transform-origin:50% 0;mix-blend-mode:screen}}
#b1{{left:200px}}#b2{{left:660px}}
#m{{position:absolute}}
#conf i{{position:absolute;width:18px;height:26px;border:4px solid #0a0d14;border-radius:4px}}
#fl i{{position:absolute;width:26px;height:26px;border-radius:50%;background:radial-gradient(closest-side,#fff,rgba(255,255,255,0))}}
h1.t{{font:900 {tsize}px/1.02 "DM Sans";letter-spacing:-3px;text-shadow:0 6px 0 #0a0d14,0 0 30px rgba(8,26,69,.9)}}
h1.t b{{color:#ffd23f;font-weight:900}}
{extra}"""
def body(img, title, pos):
    b = g.bottom(*pos, '#fff', '#d6ecff').replace('Fais décoller ton son', title)
    return f'<div id="bg"></div><div id="hero"><img id="hi" src="assets/img/{img}"></div><div class="beam" id="b1"></div><div class="beam" id="b2"></div><div id="fl"></div><img id="m" src="assets/img/star.png"><div id="fade"></div><div id="conf"></div><div id="x">×</div>' + b
def js(mx, my, flY, swY):
    return r"""
tl.fromTo('#hi',{scale:1.14},{scale:1.0,duration:12,ease:'power1.out',transformOrigin:'50%% 60%%'},0);
tl.fromTo('#b1',{rotation:-24},{rotation:20,duration:3,yoyo:true,repeat:3,ease:'sine.inOut'},0);
tl.fromTo('#b2',{rotation:22},{rotation:-22,duration:3.4,yoyo:true,repeat:3,ease:'sine.inOut'},0);
const fl=document.getElementById('fl'); for(let i=0;i<14;i++){ const c=document.createElement('i'); c.style.left=(40+Math.random()*1000)+'px'; c.style.top=(%d+Math.random()*120)+'px'; c.id='z'+i; fl.appendChild(c); gsap.set('#z'+i,{opacity:0,scale:.3}); tl.to('#z'+i,{opacity:1,scale:1.6,duration:0.12,yoyo:true,repeat:1,ease:'power2.out'},0.8+Math.random()*10.5); }
const cf=document.getElementById('conf'); const cols=['#ffd23f','#ffffff','#5aa0f5','#ff6b9a']; for(let i=0;i<46;i++){ const c=document.createElement('i'); c.style.background=cols[i%%4]; c.style.left='%dpx'; c.style.top='%dpx'; c.id='k'+i; cf.appendChild(c); tl.fromTo('#k'+i,{x:0,y:0,rotation:0,opacity:1},{x:(Math.random()-.5)*1100,y:-150-Math.random()*250,rotation:Math.random()*720,duration:0.9,ease:'power3.out'},0.55); tl.to('#k'+i,{y:'+=900',opacity:0,duration:2.2,ease:'power1.in'},1.45); }
tl.from('#m',{y:-600,rotation:-30,duration:0.7,ease:'bounce.out'},0.15);
tl.fromTo('#m',{rotation:4},{rotation:-4,duration:0.45,yoyo:true,repeat:24,ease:'sine.inOut',immediateRender:false},0.9);
""" % (flY, mx, my) + g.INTRO_JS + g.SWIPE_JS + f"swipe(4.0,1,{swY}); swipe(5.6,2,{swY}); swipe(7.2,3,{swY});"
V = {
 'payD': dict(img='salle.jpg', hero=720, ts=88, title='Fais décoller <b>ton son</b>', pos=(628,770,1085,1140,1170,1390,1650,1860), m='left:410px;top:150px;width:260px', conf=(540,300), fl=470, sw=925, extra=''),
 'payE': dict(img='festival.jpg', hero=720, ts=74, title='FAIS DÉCOLLER <b>TON SON</b>', pos=(640,770,1085,1140,1170,1390,1650,1860), m='left:420px;top:185px;width:240px', conf=(540,320), fl=440, sw=925, extra='h1.t{letter-spacing:-1px}'),
 'payF': dict(img='salle.jpg', hero=860, ts=104, title='Fais décoller<br><b>ton son</b>', pos=(640,890,1186,1206,1262,1466,1690,1874), m='left:385px;top:150px;width:310px', conf=(540,330), fl=560, sw=1030, extra='.rev{height:262px;padding:26px 44px}.plan{height:172px}.tag{font-size:32px;padding:5px 24px}#cta{height:160px;line-height:140px}'),
}
for n, v in V.items():
    c = css(v['img'], v['hero'], v['ts'], '#m{'+v['m']+'}' + v['extra'])
    j = js(v['conf'][0], v['conf'][1], v['fl'], v['sw']).replace('Math.random()', 'rnd()')
    j = "let _s=7; function rnd(){ _s=(_s*16807)%2147483647; return (_s-1)/2147483646; }\n" + j
    open(os.path.join(D, n, 'index.html'), 'w').write(g.page(c, body(v['img'], v['title'], v['pos']), j))
print('ok2')
