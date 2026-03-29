const V='amwaj-v6';
const CACHE=['./index.html','./manifest.json','./icon-192.png','./icon-512.png'];

self.addEventListener('install',function(e){
  self.skipWaiting();
  e.waitUntil(caches.open(V).then(function(c){return c.addAll(CACHE);}));
});

self.addEventListener('activate',function(e){
  e.waitUntil(caches.keys().then(function(keys){
    return Promise.all(keys.filter(function(k){return k!==V;}).map(function(k){return caches.delete(k);}));
  }));
  self.clients.claim();
});

self.addEventListener('fetch',function(e){
  // Firebase requests — دائماً من الشبكة
  if(e.request.url.includes('firebaseio.com')||e.request.url.includes('googleapis')){
    e.respondWith(fetch(e.request));
    return;
  }
  // باقي الطلبات — من الكاش أولاً
  e.respondWith(
    caches.match(e.request).then(function(cached){
      return cached || fetch(e.request).then(function(response){
        return caches.open(V).then(function(c){
          c.put(e.request,response.clone());
          return response;
        });
      });
    }).catch(function(){
      return caches.match('./index.html');
    })
  );
});