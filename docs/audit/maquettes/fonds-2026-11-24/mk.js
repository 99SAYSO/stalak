const {chromium}=require('playwright');const fs=require('fs');
const W="url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240' viewBox='0 0 240 240'%3E%3Cg fill='%23ffffff'%3E%3Ccircle cx='18' cy='22' r='3' opacity='.9'/%3E%3Ccircle cx='96' cy='12' r='2' opacity='.6'/%3E%3Ccircle cx='170' cy='40' r='3.5' opacity='.85'/%3E%3Ccircle cx='220' cy='100' r='2' opacity='.7'/%3E%3Ccircle cx='60' cy='90' r='2.5' opacity='.8'/%3E%3Ccircle cx='130' cy='120' r='3' opacity='.9'/%3E%3Ccircle cx='30' cy='170' r='2' opacity='.6'/%3E%3Ccircle cx='190' cy='180' r='3' opacity='.8'/%3E%3Ccircle cx='100' cy='210' r='2.5' opacity='.7'/%3E%3Ccircle cx='230' cy='230' r='1.8' opacity='.6'/%3E%3C/g%3E%3C/svg%3E\")";
const light=`#p1 .hero-h1{color:#fff;text-shadow:0 4px 0 #0a0d14,3px 0 0 #0a0d14,-3px 0 0 #0a0d14,0 -3px 0 #0a0d14,2px 2px 0 #0a0d14,-2px 2px 0 #0a0d14,2px -2px 0 #0a0d14,-2px -2px 0 #0a0d14}
#p1 .hero-s{color:rgba(255,255,255,.92)} #p1 .hero-demo,#p1 .hero-demo *{color:#fff!important}
html{--flakes:${W}}`;
const V={
 'A-degrade-ciel':`html:root:not(.medit){background:radial-gradient(70vw 34vh at 50% 30%,rgba(255,255,255,.35),transparent 70%),linear-gradient(180deg,#0b2f73 0%,#1f6fd6 48%,#6fb6ff 80%,#cfe8ff 100%) fixed!important}${light}`,
 'B-aurore':`html:root:not(.medit){background:
   radial-gradient(60vw 22vh at 20% 10%,rgba(64,240,200,.55),transparent 70%),
   radial-gradient(70vw 20vh at 75% 16%,rgba(120,200,255,.55),transparent 70%),
   radial-gradient(55vw 18vh at 55% 4%,rgba(170,120,255,.45),transparent 70%),
   radial-gradient(90vw 40vh at 50% 105%,rgba(31,111,214,.9),transparent 70%),
   linear-gradient(180deg,#06132e 0%,#0b2556 55%,#0e3f8f 100%) fixed!important}${light}`,
 'C-bonbon-glace':`html:root:not(.medit){background:
   radial-gradient(60vw 40vh at 10% 15%,#8fd0ff,transparent 70%),
   radial-gradient(60vw 40vh at 95% 30%,#c9b8ff,transparent 70%),
   radial-gradient(70vw 40vh at 20% 85%,#ffd3ea,transparent 70%),
   radial-gradient(70vw 45vh at 90% 95%,#9fe6ff,transparent 70%),
   #e8f4ff fixed!important}`,
 'D-projecteur':`html:root:not(.medit){background:
   radial-gradient(45vw 25vh at 50% 26%,rgba(255,255,255,.55),transparent 70%),
   repeating-conic-gradient(from 0deg at 50% 26%,rgba(255,255,255,.10) 0 9deg,transparent 9deg 18deg),
   radial-gradient(120vw 80vh at 50% 26%,#3d8bf0,#1f6fd6 45%,#0e3f8f 100%) fixed!important}
 body{background:var(--icicles) 0 0/64px 26px repeat-x!important}${light}`,
};
(async()=>{const b=await chromium.launch();
const only=process.argv[2];const extra=process.argv[3];
if(only&&extra)V[only]=`html:root:not(.medit){background:url(data:image/jpeg;base64,${fs.readFileSync(extra).toString('base64')}) center/cover no-repeat fixed!important}${light}
 html{--flakes:${W}}`;
for(const [k,css] of Object.entries(V)){ if(only&&k!==only)continue;
 const c=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'});
 await c.addCookies([{name:'stalak_cc',value:'n',domain:'stalak.app',path:'/'}]);
 const p=await c.newPage();await p.goto('https://stalak.app/fr/',{waitUntil:'networkidle'});await p.waitForTimeout(4500);
 await p.addStyleTag({content:css});await p.waitForTimeout(600);await p.screenshot({path:k+'.png'});await c.close();console.log(k);}
await b.close();})();
