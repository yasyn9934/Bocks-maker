// sw.js

const CACHE_NAME = 'royal-book-v2'; // قمنا بتحديث الإصدار لإجبار المتصفح على التحديث

// قائمة الملفات الشاملة والضرورية جداً للعمل دون إنترنت
const urlsToCache = [
  './',                  // تعني الصفحة الرئيسية (index.html)
  'plugins.js',
  'editor.html',
  'login.html',
  'auth.js',
  'PDFs/royal-assets.js',  // ملفات المحرك الملكي
  'PDFs/royal-parser.js',
  'PDFs/royal-renderer.js',
  'logo.png',            // الأيقونات ضرورية لتثبيت التطبيق
  'logo-512.png',
  'fonts/Amiri-Regular.ttf', // الخطوط ضرورية جداً
  'fonts/Amiri-Bold.ttf',
  'fonts/ArefRuqaa-Regular.ttf',
  'fonts/ArefRuqaa-Bold.ttf'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        // addAll ستحاول جلب كل الملفات، إذا فشل ملف واحد، تفشل العملية كلها
        // وهذا ما نريده للتأكد من اكتمال النسخة
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // لتفعيل النسخة الجديدة فوراً
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});
