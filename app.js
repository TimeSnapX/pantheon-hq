"use strict";
const TZ="Australia/Brisbane",STALE=6*3600e3,BASE="https://timesnapx.github.io/";
const $=s=>document.querySelector(s);let A=[],APPS={},S={agents:{},ticker:[],routines:[]},amb=0,sel=null;
const esc=t=>String(t??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const fmt=d=>new Date(d).toLocaleString("en-AU",{timeZone:TZ,day:"numeric",month:"short",hour:"numeric",minute:"2-digit"})+" AEST";
function st(a){const s=S.agents[a.id]||{};const fresh=s.updatedAt&&Date.now()-Date.parse(s.updatedAt)<STALE;
 if(fresh&&s.activity)return{status:s.status||"working",activity:s.activity,updatedAt:s.updatedAt,source:s.source||"live",ambient:false};
 return{status:"idle",activity:a.idle[(amb+A.indexOf(a))%a.idle.length],updatedAt:s.updatedAt,source:"ambient",ambient:true,stale:!!s.updatedAt}}
function build(){
 $("#pins").innerHTML=A.map(a=>`<div class="pin${a.x>88?" left":""}" data-id="${a.id}" style="left:${a.x}%;top:${a.y}%"><div class="bob" style="animation-delay:-${(A.indexOf(a)*0.37)%4}s"><img src="assets/av/${a.id}.webp" alt="${a.name}"></div><div class="plate">${a.name}</div><div class="bub"></div></div>`).join("");
 $("#roster").innerHTML=A.map(a=>`<li data-id="${a.id}"><img src="assets/av/${a.id}.webp" alt=""><div><div class="n">${a.name}</div><div class="t">${a.title}</div></div><span class="dot d"></span></li>`).join("");
 document.querySelectorAll("[data-id]").forEach(e=>e.addEventListener("click",ev=>{if(moved)return;open_(e.dataset.id)}));}
function render(){let w=0,wa=0;
 A.forEach(a=>{const s=st(a);if(s.status==="working")w++;if(s.status==="watching")wa++;
  const p=document.querySelector(`.pin[data-id="${a.id}"]`),b=p.querySelector(".bub");
  if(b.textContent!==s.activity){b.classList.add("fade");setTimeout(()=>{b.textContent=s.activity;b.classList.remove("fade")},450)}
  p.classList.toggle("idle",s.status==="idle");document.querySelector(`#roster li[data-id="${a.id}"] .dot`).className="dot d "+s.status;});
 $("#nWork").textContent=w;$("#nWatch").textContent=wa;$("#online").textContent=A.length;
 $("#agentGrid").innerHTML=A.map(a=>{const s=st(a);return`<div class="card" data-card="${a.id}"><img src="assets/av/${a.id}.webp" alt=""><div><b>${a.name}</b> <span class="dot ${s.status}"></span><div class="t">${a.title}</div><div>${esc(s.activity)}${s.ambient?'<span class="tag">ambient</span>':""}</div></div></div>`}).join("");
 document.querySelectorAll("[data-card]").forEach(e=>e.onclick=()=>open_(e.dataset.card));
 const nm=id=>(A.find(a=>a.id===id)||{}).name||id;
 $("#routineList").innerHTML=(S.routines||[]).map(r=>`<li><img src="assets/av/${r.agent}.webp" alt=""><div><b>${esc(r.name)}</b><span class="tag">${esc(r.source||"")}</span><div class="m">${nm(r.agent)} · ${esc(r.schedule)}</div></div></li>`).join("")||"<li>No routines yet.</li>";
 const t=[...(S.ticker||[])].sort((a,b)=>Date.parse(b.at)-Date.parse(a.at));
 $("#actList").innerHTML=t.map(i=>`<li>${i.agent?`<img src="assets/av/${i.agent}.webp" alt="">`:""}<div><b>${esc(i.text)}</b><span class="tag">${esc(i.source||"")}</span><div class="m">${fmt(i.at)}</div></div></li>`).join("");
 const tk=t.slice(0,12).map(i=>`<span>${esc(i.text)}</span>`).join("");if($("#tick").innerHTML!==tk)$("#tick").innerHTML=tk;
 if(sel)open_(sel,true);}
function open_(id,keep){const a=A.find(x=>x.id===id);if(!a)return;sel=id;const s=st(a);
 document.querySelectorAll("#roster li").forEach(l=>l.classList.toggle("sel",l.dataset.id===id));
 $("#sideBody").innerHTML=`<div class="hd"><img src="assets/av/${a.id}.webp" alt=""><div><h3>${a.name}</h3><div>${a.title}</div><div><span class="dot ${s.status}"></span> ${s.status}</div></div></div>
 <div class="k">Current activity</div><div>${esc(s.activity)}</div>${s.ambient?`<div class="amb">ambient — role-based idle line, not a live report${s.stale?" (last real update older than 6 h)":""}</div>`:s.source==="default"?`<div class="amb">default — role-based seed activity</div>`:""}
 <div class="k">Last update</div><div>${s.updatedAt?fmt(s.updatedAt):"never"}</div>
 <div class="k">Apps</div>${a.apps.length?a.apps.map(k=>`<a href="${BASE}${k}/" target="_blank" rel="noopener">${esc(APPS[k]||k)} ↗</a>`).join(""):"<div>No apps yet.</div>"}`;
 $("#side").hidden=false;if(!keep)$("#list").classList.remove("open");}
$("#sideX").onclick=()=>{$("#side").hidden=true;sel=null;document.querySelectorAll("#roster li").forEach(l=>l.classList.remove("sel"))};
document.querySelectorAll(".tabs button").forEach(b=>b.onclick=()=>{document.querySelectorAll(".tabs button").forEach(x=>x.classList.toggle("on",x===b));document.querySelectorAll(".view").forEach(v=>v.classList.toggle("on",v.id==="view-"+b.dataset.tab));if(b.dataset.tab==="world")fit()});
$("#drawerBtn").onclick=()=>$("#list").classList.toggle("open");
$("#search").oninput=e=>{const q=e.target.value.toLowerCase();A.forEach(a=>{const m=!q||(a.name+" "+a.title).toLowerCase().includes(q);document.querySelector(`.pin[data-id="${a.id}"]`).classList.toggle("hide",!m);document.querySelector(`#roster li[data-id="${a.id}"]`).style.display=m?"":"none"})};
// map fit / pan / zoom
const wrap=$("#mapWrap"),map=$("#map"),R=1548/868;let W=0,X=0,Y=0,moved=false;const phone=()=>innerWidth<=760;
function apply(){const H=W/R,ww=wrap.clientWidth,wh=wrap.clientHeight;X=W<=ww?(ww-W)/2:Math.min(0,Math.max(ww-W,X));Y=H<=wh?(wh-H)/2:Math.min(0,Math.max(wh-H,Y));map.style.width=W+"px";map.style.setProperty("--mw",W+"px");map.style.height=H+"px";map.style.transform=`translate(${X}px,${Y}px)`}
function fit(){const ww=wrap.clientWidth,wh=wrap.clientHeight;if(!ww)return;W=phone()?Math.max(ww,wh*R):Math.min(ww,wh*R);X=(ww-W)/2;Y=0;apply()}
function zoom(f,cx=wrap.clientWidth/2,cy=wrap.clientHeight/2){const n=Math.min(4000,Math.max(Math.min(wrap.clientWidth,wrap.clientHeight*R),W*f)),k=n/W;X=cx-(cx-X)*k;Y=cy-(cy-Y)*k;W=n;apply()}
$("#zin").onclick=()=>zoom(1.25);$("#zout").onclick=()=>zoom(.8);
wrap.addEventListener("wheel",e=>{e.preventDefault();const r=wrap.getBoundingClientRect();zoom(e.deltaY<0?1.1:.9,e.clientX-r.left,e.clientY-r.top)},{passive:false});
const pts=new Map();let last=null,dist0=0,sx=0,sy=0;
wrap.addEventListener("pointerdown",e=>{pts.set(e.pointerId,e);moved=false;sx=e.clientX;sy=e.clientY;last={x:e.clientX,y:e.clientY};if(pts.size===2){const[a,b]=[...pts.values()];dist0=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY)}});
wrap.addEventListener("pointermove",e=>{if(!pts.has(e.pointerId))return;pts.set(e.pointerId,e);
 if(pts.size===2){const[a,b]=[...pts.values()],d=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY),r=wrap.getBoundingClientRect();if(dist0){zoom(d/dist0,(a.clientX+b.clientX)/2-r.left,(a.clientY+b.clientY)/2-r.top);moved=true}dist0=d;return}
 if(Math.hypot(e.clientX-sx,e.clientY-sy)>6)moved=true;if(moved){X+=e.clientX-last.x;Y+=e.clientY-last.y;apply()}last={x:e.clientX,y:e.clientY}});
const up=e=>{pts.delete(e.pointerId);dist0=0;setTimeout(()=>moved=false,0)};wrap.addEventListener("pointerup",up);wrap.addEventListener("pointercancel",up);
addEventListener("resize",fit);
// day/night + weather
function cycle(){const h=+new Intl.DateTimeFormat("en-AU",{timeZone:TZ,hour:"numeric",hourCycle:"h23"}).format(new Date());
 const night=h<6||h>=19,dusk=h===6||h===18;$("#cycle").textContent=night?"Night cycle":dusk?(h<12?"Dawn":"Dusk"):"Day cycle";
 $(".tint").style.background=night?"rgba(5,10,40,.18)":dusk?"rgba(255,140,60,.14)":"rgba(255,230,170,.14)";$(".stars").style.display=night||dusk?"":"none"}
async function weather(){try{const r=await fetch("https://api.open-meteo.com/v1/forecast?latitude=-27.4698&longitude=153.0251&current=temperature_2m&timezone=Australia%2FBrisbane",{cache:"no-store"});const j=await r.json();$("#temp").textContent=Math.round(j.current.temperature_2m)+"°C"}catch(e){}}
async function poll(){try{const r=await fetch("./status.json?t="+Date.now(),{cache:"no-store"});if(r.ok)S=await r.json()}catch(e){}render()}
(async()=>{const j=await (await fetch("./agents.json")).json();A=j.agents;APPS=j.apps;build();fit();await poll();cycle();weather();
 setInterval(poll,60e3);setInterval(()=>{amb++;render()},12e3);setInterval(cycle,60e3);setInterval(weather,15*60e3)})();
if("serviceWorker"in navigator)navigator.serviceWorker.register("./sw.js",{scope:"./"}).catch(()=>{});
