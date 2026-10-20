const C="pantheon-hq-v1";
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(["./","./index.html","./style.css","./app.js","./agents.json","./assets/world.webp","./manifest.webmanifest","./icons/icon-192.png"])).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!==C).map(n=>caches.delete(n)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{const u=new URL(e.request.url);
 if(e.request.method!=="GET"||u.origin!==location.origin||!u.pathname.startsWith(new URL(self.registration.scope).pathname)||u.pathname.endsWith("/status.json")||/googleapis|accounts\.google|gstatic|open-meteo/.test(u.host))return;
 e.respondWith(fetch(e.request).then(r=>{if(r.ok){const c=r.clone();caches.open(C).then(x=>x.put(e.request,c))}return r}).catch(()=>caches.match(e.request,{ignoreSearch:true}).then(r=>r||caches.match("./"))))});
