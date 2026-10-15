const CACHE_NAME = 'barber-pwa-v1';
const urlsToCache = [
  'index.html',
  'admin.html',
  'manifest.json'
];

// تثبيت الـ Service Worker وحفظ الملفات في الكاش
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// جلب الملفات والبيانات بسلاسة
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});