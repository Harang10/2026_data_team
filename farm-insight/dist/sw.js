// 팜인사이트 오프라인 캐시. 온라인이면 항상 새 파일을 받고(네트워크 우선), 끊기면 저장된 파일을 쓴다.
const CACHE='farm-insight-v1';
const SHELL=['./','./index.html','./style.css','./app.js','./model.js','./wizard.js','./favicon.svg','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET'||new URL(request.url).origin!==location.origin)return;
  event.respondWith(fetch(request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(request,copy));}return response;})
    .catch(()=>caches.match(request,{ignoreSearch:true}).then(hit=>hit||caches.match('./index.html'))));
});
