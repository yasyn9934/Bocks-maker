// sw.js (الإصدار v4 المصحح والمستقر)

const CACHE_NAME = 'royal-book-v3'; 

const urlsToCache = [
  './',
  'index.html',
  'editor.html',
  'login.html',
  'royal-features-interactive-fixed.html',
  'plugins.js',
  'auth.js',
  'PDFs/royal-assets.js',
  'PDFs/royal-parser.js',
  'PDFs/royal-renderer.js',
  'logo.png',
  'logo-512.png',
  'fonts/Amiri-Regular.ttf',
  'fonts/Amiri-Bold.ttf',
  'fonts/ArefRuqaa-Regular.ttf',
  'fonts/ArefRuqaa-Bold.ttf'
];

// مرحلة التثبيت: حفظ الملفات بمرونة
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('جاري تأمين ملفات النظام أوف لاين... ⏳');
      return Promise.all(
        urlsToCache.map(url => {
          return cache.add(url).catch(error => {
            console.error('الملف غير موجود أو تعذر حفظه:', url);
          });
        })
      );
    }).then(() => self.skipWaiting())
  );
});

// استراتيجية جلب البيانات: الشبكة أولاً، ثم الكاش
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // إذا نجحت الشبكة، أرجع النتيجة فوراً
        if (networkResponse && networkResponse.status === 200) {
          return networkResponse;
        }
        return networkResponse;
      })
      .catch(() => {
        // إذا انقطعت الشبكة (catch)، ابحث في الكاش
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // اختيارياً: يمكنك إرجاع صفحة أوف لاين هنا إذا لم يوجد كاش
        });
      })
  );
});
