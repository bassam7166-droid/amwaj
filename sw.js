// Service Worker - مركز أمواج الخليج
const CACHE_NAME = 'amwaj-cache-v3';
const OFFLINE_URL = './index.html';

// تثبيت SW
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll([OFFLINE_URL]);
    })
  );
  self.skipWaiting();
});

// تفعيل SW
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

// اعتراض الطلبات
self.addEventListener('fetch', function(event) {
  if (event.request.method !== 'GET') return;
  
  // للـ Firebase — لا نتدخل
  if (event.request.url.includes('firebase') || 
      event.request.url.includes('googleapis') ||
      event.request.url.includes('cdnjs')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(function(response) {
        // خزّن نسخة محلية
        if (response.ok) {
          var copy = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, copy);
          });
        }
        return response;
      })
      .catch(function() {
        // بدون إنترنت — استخدم الكاش
        return caches.match(event.request).then(function(cached) {
          return cached || caches.match(OFFLINE_URL);
        });
      })
  );
});
