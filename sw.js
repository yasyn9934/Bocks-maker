const CACHE_NAME = 'royal-book-v1';
// قائمة الملفات التي سيتم حفظها للعمل دون إنترنت
const urlsToCache = [
  'index.html',
  'editor.html',
  'login.html',
  'auth.js',
  'style.css', // إذا كان لديك ملف CSS خارجي
  'fonts/Amiri-Regular.ttf',
  'fonts/ArefRuqaa-Bold.ttf'
];

// مرحلة التثبيت: حفظ الملفات في الذاكرة
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('جاري حفظ ملفات الموقع للعمل دون إنترنت...');
        return cache.addAll(urlsToCache);
      })
  );
});

// مرحلة الاستجابة: جلب الملف من الكاش إذا لم يتوفر إنترنت
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // إذا وجدنا الملف في الكاش، نعيده، وإذا لم نجده نطلبه من الشبكة
        return response || fetch(event.request);
      })
  );
});
