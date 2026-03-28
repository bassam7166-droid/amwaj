const V='amwaj-v5';
self.addEventListener('install',function(e){self.skipWaiting();});
self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(k){
    return Promise.all(k.map(function(n){return caches.delete(n);}));
  }));
  self.clients.claim();
});
self.addEventListener('fetch',function(e){
  e.respondWith(fetch(e.request).catch(function(){
    return new Response('offline');
  }));
});