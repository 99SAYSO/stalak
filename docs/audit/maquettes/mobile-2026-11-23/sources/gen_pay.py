import json, os
D = os.path.dirname(os.path.abspath(__file__))
AV = json.load(open('/home/claude/stalak/site_src/avis.json'))[:4]

COMMON_CSS = r"""
@font-face{font-family:"Lilita One";src:url('assets/fonts/lilitaone.ttf')}
@font-face{font-family:"DM Sans";src:url('assets/fonts/dmsans.ttf');font-weight:100 1000}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1920px;overflow:hidden;background:#0e3f8f}
#root{position:relative;width:1080px;height:1920px;overflow:hidden;font-family:"DM Sans";color:#0a0d14}
#x{position:absolute;right:50px;top:70px;width:96px;height:96px;border-radius:50%;background:rgba(255,255,255,.25);color:#fff;font:700 54px/96px "DM Sans";text-align:center;z-index:20}
h1.t{position:absolute;left:40px;right:40px;text-align:center;font:400 96px/1 "Lilita One";z-index:10}
.revw{position:absolute;left:0;right:0;height:300px;overflow:visible;z-index:10}
.rev{position:absolute;top:0;width:900px;height:280px;background:#fff;border:9px solid #0a0d14;border-radius:52px;box-shadow:0 14px 0 #0a0d14;padding:34px 44px}
.rev .st{font:900 40px "DM Sans";color:#f5b400;letter-spacing:4px}
.rev .who{font:700 38px "DM Sans";margin-left:14px;letter-spacing:0;color:#0a0d14}
.rev p{font:500 34px/1.3 "DM Sans";margin-top:12px;color:#2a3346;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.dots{position:absolute;left:0;right:0;display:flex;gap:16px;justify-content:center;z-index:10}
.dots i{width:22px;height:22px;border-radius:11px;background:rgba(255,255,255,.55);border:4px solid #0a0d14}
.dots i.on{width:70px;background:#ffd23f}
.plan{position:absolute;left:60px;right:60px;height:190px;border-radius:52px;border:9px solid #0a0d14;background:#fff;box-shadow:0 14px 0 #0a0d14;display:flex;align-items:center;padding:0 44px;gap:30px;z-index:10}
.plan .r{width:70px;height:70px;border-radius:50%;border:8px solid #0a0d14;flex:none;background:#fff;position:relative}
.plan.on .r::after{content:"";position:absolute;inset:9px;border-radius:50%;background:#1f6fd6}
.plan.on{background:#eaf4ff;outline:8px solid #1f6fd6;outline-offset:-1px}
.plan b{font:400 54px "Lilita One";display:block}
.plan small{font:500 36px "DM Sans";color:#3b4660}
.plan .pr{margin-left:auto;text-align:right}
.plan .pr b{font-size:58px}
.tag{position:absolute;left:110px;padding:8px 28px;border-radius:24px;background:#ffd23f;border:6px solid #0a0d14;font:800 36px "DM Sans";z-index:11}
#cta{position:absolute;left:60px;right:60px;height:180px;border-radius:56px;background:#1f6fd6;border:10px solid #0a0d14;box-shadow:0 18px 0 #0a0d14;color:#fff;font:400 70px/160px "Lilita One";text-align:center;text-shadow:0 6px 0 #0a0d14;overflow:hidden;z-index:10}
#cta .sh{position:absolute;top:-40px;bottom:-40px;width:140px;left:-200px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.55),transparent);transform:skewX(-20deg)}
.ou{position:absolute;left:490px;width:100px;height:68px;border-radius:34px;background:#ffd23f;border:7px solid #0a0d14;font:400 40px/54px "Lilita One";text-align:center;z-index:12}
.legal{position:absolute;left:60px;right:60px;text-align:center;font:500 30px "DM Sans";z-index:10}
#finger{position:absolute;left:0;top:0;width:130px;height:130px;margin:-65px 0 0 -65px;border-radius:50%;background:rgba(10,13,20,.25);border:8px solid rgba(255,255,255,.95);z-index:30;opacity:0}
.fl{position:absolute;border-radius:50%;background:#fff}
"""

def reviews_html():
    out = []
    for i, a in enumerate(AV):
        f = 'Creator Plus' if a['formule'] == 'creator' else 'Pro'
        out.append(f'<div class="rev" id="r{i}"><div class="st">★★★★★<span class="who">{a["pseudo"]} · {f}</span></div><p>{a["texte"]}</p></div>')
    return ''.join(out)

def dots_html():
    return ''.join(f'<i id="d{i}"{" class=on" if i==0 else ""}></i>' for i in range(len(AV)))

# Swipe animation shared: cards laid out horizontally (A,B: carousel) — x positions computed in JS
SWIPE_JS = r"""
const N = %d, CW = 940, X0 = 90;
for (let i = 0; i < N; i++) gsap.set('#r' + i, { x: X0 + i * CW });
const car = { p: 0 };
function place(){ for (let i = 0; i < N; i++){ const d = i - car.p; gsap.set('#r'+i, { x: X0 + d * CW, rotation: d * 2.2, scale: 1 - Math.min(Math.abs(d),1) * 0.06 }); }
  for (let i = 0; i < N; i++){ const on = Math.abs(i - car.p) < 0.5; const el = document.getElementById('d'+i); el.className = on ? 'on' : ''; } }
place();
function swipe(t, to, fy){
  tl.set('#finger', { x: 860, y: fy, opacity: 0 }, t - 0.05);
  tl.to('#finger', { opacity: 1, scale: 0.9, duration: 0.15 }, t);
  tl.to('#finger', { x: 260, duration: 0.45, ease: 'power2.inOut' }, t + 0.12);
  tl.to(car, { p: to, duration: 0.6, ease: 'back.out(1.4)', onUpdate: place }, t + 0.15);
  tl.to('#finger', { opacity: 0, scale: 1.1, duration: 0.2 }, t + 0.58);
}
""" % len(AV)

def page(css, body, js, dur=12):
    return f"""<!doctype html><html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=1080, height=1920">
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script><style>{COMMON_CSS}{css}</style></head><body>
<div id="root" data-composition-id="main" data-start="0" data-duration="{dur}" data-width="1080" data-height="1920">
<div id="scene" class="clip" data-start="0" data-duration="{dur}" data-track-index="0" data-layout-allow-overflow style="position:absolute;inset:0">{body}<div id="finger"></div></div></div>
<script>
window.__timelines = window.__timelines || {{}};
const tl = gsap.timeline({{ paused: true }});
{js}
window.__timelines["main"] = tl; tl.seek(0);
</script></body></html>"""

def bottom(y_t, y_rev, y_dots, y_tag, y_p1, y_p2, y_cta, y_legal, tcolor, lcolor):
    return f"""<h1 class="t" style="top:{y_t}px;color:{tcolor}">Fais décoller ton son</h1>
<div class="revw" style="top:{y_rev}px">{reviews_html()}</div>
<div class="dots" style="top:{y_dots}px">{dots_html()}</div>
<div class="tag" style="top:{y_tag}px">Meilleur prix · −48 %</div>
<div class="plan on" id="p1" style="top:{y_p1}px"><span class="r"></span><div><b>Pro · à l’année</b><small>7 jours gratuits</small></div><div class="pr"><b>4,17 $/mois</b><small>49,99 $ par an</small></div></div>
<div class="plan" id="p2" style="top:{y_p2}px"><span class="r"></span><div><b>Pro · au mois</b><small>7 jours gratuits</small></div><div class="pr"><b>7,99 $/mois</b></div></div>
<div class="ou" style="top:{(y_p2+190+y_cta)//2-34}px">ou</div><div id="cta" style="top:{y_cta}px"><span class="sh" id="sh"></span>Essayer gratuitement</div>
<div class="legal" style="top:{y_legal}px;color:{lcolor}">Rien à payer aujourd’hui · Annulable en 1 geste</div>"""

INTRO_JS = r"""
['h1.t','.revw','.dots','.tag','#p1','.ou','#p2','#cta','.legal'].forEach((s,k)=>{ tl.from(s,{ y:90, opacity:0, duration:0.55, ease:'back.out(1.6)' }, 0.5 + k*0.09); });
tl.to('#sh', { left: 1100, duration: 0.9, ease: 'power2.inOut' }, 2.2);
tl.to('#sh', { left: -200, duration: 0 }, 3.2);
tl.to('#sh', { left: 1100, duration: 0.9, ease: 'power2.inOut' }, 9.6);
tl.to('#cta', { scale: 1.04, duration: 0.25, yoyo: true, repeat: 3, ease: 'sine.inOut' }, 10.6);
"""

# ---------- A : aurore boréale de nuit ----------
cssA = r"""
#bg{position:absolute;inset:0;background:linear-gradient(180deg,#06163d 0%,#0b2a6b 45%,#1657b3 75%,#5aa0f5 100%)}
.aur{position:absolute;left:-300px;width:1700px;height:520px;border-radius:50%;filter:blur(60px);opacity:.75;mix-blend-mode:screen}
#a1{top:60px;background:linear-gradient(90deg,transparent,#3df5c8 30%,#4aa8ff 60%,transparent)}
#a2{top:260px;background:linear-gradient(90deg,transparent,#8a6bff 35%,#3df5c8 65%,transparent);opacity:.5}
#ice{position:absolute;left:250px;top:380px;width:580px;height:200px;border-radius:50%;background:radial-gradient(closest-side,#e8f6ff,#9fd2ff 70%,transparent);opacity:.9}
#m{position:absolute;left:360px;top:120px;width:360px}
#stars i{position:absolute;width:6px;height:6px;border-radius:50%;background:#fff}
"""
bodyA = '<div id="bg"></div><div id="stars"></div><div class="aur" id="a1"></div><div class="aur" id="a2"></div><div id="snow"></div><div id="ice"></div><img id="m" src="assets/img/hype.png"><div id="x">×</div>' + \
    bottom(600, 760, 1075, 1150, 1180, 1410, 1640, 1850, '#fff', '#d6ecff')
jsA = r"""
const st=document.getElementById('stars'); for(let i=0;i<60;i++){ const s=document.createElement('i'); s.style.left=(Math.random()*1080)+'px'; s.style.top=(Math.random()*560)+'px'; s.id='s'+i; st.appendChild(s); tl.fromTo('#s'+i,{opacity:.2},{opacity:1,duration:0.6+Math.random(),yoyo:true,repeat:9,ease:'sine.inOut'},Math.random()*2); }
tl.fromTo('#a1',{x:-200,skewY:-6},{x:200,skewY:6,duration:12,ease:'sine.inOut'},0);
tl.fromTo('#a2',{x:220,skewY:5},{x:-180,skewY:-5,duration:12,ease:'sine.inOut'},0);
const sn=document.getElementById('snow'); for(let i=0;i<40;i++){ const f=document.createElement('div'); f.className='fl'; const z=6+Math.random()*12; f.style.cssText=`width:${z}px;height:${z}px;left:${Math.random()*1080}px;top:-30px;opacity:${.5+Math.random()*.5}`; f.id='f'+i; sn.appendChild(f); tl.fromTo('#f'+i,{y:-40},{y:1960,x:(Math.random()-.5)*200,duration:6+Math.random()*5,ease:'none'},Math.random()*-6+0.01); }
tl.from('#m',{y:-500,rotation:-20,duration:0.8,ease:'bounce.out'},0.1);
tl.fromTo('#m',{y:0},{y:-18,duration:0.8,yoyo:true,repeat:12,ease:'sine.inOut',immediateRender:false},0.9);
tl.from('#ice',{scale:0,duration:0.5,ease:'back.out(2)'},0.3);
""" + INTRO_JS + SWIPE_JS + "swipe(4.0,1,915); swipe(5.6,2,915); swipe(7.2,3,915);"

# ---------- B : scène avec projecteurs ----------
cssB = r"""
#bg{position:absolute;inset:0;background:radial-gradient(900px 700px at 540px 330px,#2a7bff 0,#123f9e 45%,#081a45 100%)}
.beam{position:absolute;top:-200px;width:260px;height:1100px;background:linear-gradient(180deg,rgba(255,255,255,.55),rgba(255,255,255,0));filter:blur(8px);transform-origin:50% 0;mix-blend-mode:screen}
#b1{left:120px}#b2{left:700px}
#stage{position:absolute;left:-100px;right:-100px;top:500px;height:110px;border-radius:50%;background:radial-gradient(closest-side,#ffffffaa,#7fc0ff55 60%,transparent)}
#crowd{position:absolute;left:0;right:0;top:470px;height:120px}
#crowd i{position:absolute;bottom:0;width:70px;height:90px;border-radius:35px 35px 0 0;background:#06102e}
#m{position:absolute;left:365px;top:70px;width:350px}
#conf i{position:absolute;width:18px;height:26px;border:4px solid #0a0d14;border-radius:4px}
"""
bodyB = '<div id="bg"></div><div class="beam" id="b1"></div><div class="beam" id="b2"></div><div id="stage"></div><img id="m" src="assets/img/star.png"><div id="crowd"></div><div id="conf"></div><div id="x">×</div>' + \
    bottom(620, 770, 1085, 1140, 1170, 1390, 1650, 1860, '#fff', '#d6ecff')
jsB = r"""
tl.fromTo('#b1',{rotation:-28},{rotation:22,duration:3,yoyo:true,repeat:3,ease:'sine.inOut'},0);
tl.fromTo('#b2',{rotation:26},{rotation:-24,duration:3.4,yoyo:true,repeat:3,ease:'sine.inOut'},0);
const cr=document.getElementById('crowd'); for(let i=0;i<16;i++){ const c=document.createElement('i'); c.style.left=(i*70-10)+'px'; c.style.height=(70+(i%3)*18)+'px'; c.id='c'+i; cr.appendChild(c); tl.to('#c'+i,{y:-22,duration:0.28,yoyo:true,repeat:21,ease:'power1.inOut'},0.4+(i%4)*0.07); }
const cf=document.getElementById('conf'); const cols=['#ffd23f','#ffffff','#5aa0f5','#ff6b9a']; for(let i=0;i<46;i++){ const c=document.createElement('i'); c.style.background=cols[i%4]; c.style.left=(540+(Math.random()-.5)*80)+'px'; c.style.top='420px'; c.id='k'+i; cf.appendChild(c); tl.fromTo('#k'+i,{x:0,y:0,rotation:0,opacity:1},{x:(Math.random()-.5)*1100,y:-200-Math.random()*300,rotation:Math.random()*720,duration:0.9,ease:'power3.out'},0.55); tl.to('#k'+i,{y:'+=900',opacity:0,duration:2.2,ease:'power1.in'},1.45); }
tl.from('#m',{scale:0,rotation:180,duration:0.7,ease:'back.out(1.8)'},0.2);
tl.fromTo('#m',{rotation:5},{rotation:-5,duration:0.45,yoyo:true,repeat:24,ease:'sine.inOut',immediateRender:false},0.9);
""" + INTRO_JS + SWIPE_JS + "swipe(4.0,1,925); swipe(5.6,2,925); swipe(7.2,3,925);"

# ---------- C : glaçon géant qui brille, rayons ----------
cssC = r"""
#bg{position:absolute;inset:0;background:linear-gradient(180deg,#5aa0f5 0%,#1f6fd6 40%,#d6ecff 40.05%,#d6ecff 100%)}
#rays{position:absolute;left:540px;top:330px;width:0;height:0}
#rays i{position:absolute;left:-40px;top:-1200px;width:80px;height:1200px;background:linear-gradient(180deg,rgba(255,255,255,0),rgba(255,255,255,.35));transform-origin:50% 100%}
#cube{position:absolute;left:330px;top:120px;width:420px;height:420px;border-radius:70px;border:10px solid #0a0d14;background:linear-gradient(135deg,#ffffff 0%,#d6ecff 40%,#9fd2ff 100%);box-shadow:0 18px 0 #0a0d14;overflow:hidden}
#cube .gl{position:absolute;top:-60px;bottom:-60px;width:120px;left:-200px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.9),transparent);transform:skewX(-20deg)}
#m{position:absolute;left:380px;top:135px;width:320px}
#crack{position:absolute;left:330px;top:120px;width:420px;height:420px}
#wave{position:absolute;left:-60px;right:-60px;top:640px;height:160px;border-radius:50%;background:#d6ecff;border-top:10px solid #0a0d14}
#pro{position:absolute;left:690px;top:110px;padding:12px 30px;border-radius:30px;background:#ffd23f;border:7px solid #0a0d14;font:400 52px "Lilita One";box-shadow:0 8px 0 #0a0d14;transform:rotate(10deg);z-index:12}
.rev{background:#fff}
"""
bodyC = '<div id="bg"></div><div id="rays"></div><div id="snow"></div><div id="cube"><span class="gl" id="gl"></span></div><img id="m" src="assets/img/cool.png"><div id="pro">PRO</div><div id="wave"></div><div id="x">×</div>' + \
    bottom(700, 830, 1140, 1190, 1220, 1440, 1660, 1860, '#0a0d14', '#3b4660')
jsC = r"""
const ry=document.getElementById('rays'); for(let i=0;i<14;i++){ const r=document.createElement('i'); r.style.transform=`rotate(${i*360/14}deg)`; ry.appendChild(r); }
tl.fromTo('#rays',{rotation:0},{rotation:60,duration:12,ease:'none'},0);
const sn=document.getElementById('snow'); for(let i=0;i<30;i++){ const f=document.createElement('div'); f.className='fl'; const z=6+Math.random()*10; f.style.cssText=`width:${z}px;height:${z}px;left:${Math.random()*1080}px;top:-30px;opacity:${.6+Math.random()*.4}`; f.id='f'+i; sn.appendChild(f); tl.fromTo('#f'+i,{y:-40},{y:760,x:(Math.random()-.5)*120,duration:4+Math.random()*4,ease:'none',repeat:2},Math.random()*-4+0.01); }
tl.from('#cube',{scale:0,rotation:-25,duration:0.7,ease:'back.out(1.7)'},0.1);
tl.from('#m',{y:260,opacity:0,duration:0.6,ease:'back.out(2)'},0.45);
tl.fromTo('#m',{y:0},{y:-14,duration:0.9,yoyo:true,repeat:11,ease:'sine.inOut',immediateRender:false},1.05);
tl.from('#pro',{scale:0,rotation:-60,duration:0.5,ease:'back.out(3)'},0.9);
tl.to('#pro',{rotation:4,duration:0.6,yoyo:true,repeat:14,ease:'sine.inOut'},1.4);
tl.to('#gl',{left:560,duration:0.8,ease:'power2.inOut',repeat:4,repeatDelay:1.4},1.2);
tl.fromTo('#cube',{y:0},{y:-14,duration:0.9,yoyo:true,repeat:11,ease:'sine.inOut',immediateRender:false},1.05);
""" + INTRO_JS + SWIPE_JS + "swipe(4.0,1,975); swipe(5.6,2,975); swipe(7.2,3,975);"

for name, css, body, js in [('payA', cssA, bodyA, jsA), ('payB', cssB, bodyB, jsB), ('payC', cssC, bodyC, jsC)]:
    js2 = js.replace('Math.random()', 'rnd()')
    js2 = "let _s=7; function rnd(){ _s=(_s*16807)%2147483647; return (_s-1)/2147483646; }\n" + js2
    open(os.path.join(D, name, 'index.html'), 'w').write(page(css, body, js2))
print('ok')
