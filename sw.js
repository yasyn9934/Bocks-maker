// sw.js (الإصدار v3 المستقر)

const CACHE_NAME = 'royal-book-v3'; 

// قائمة الملفات الملكية الشاملة (تأكد من وجودها فعلياً في مجلدك)
const urlsToCache = [
  'index.html',
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
        console.log('جاري حفظ ملفات النظام (أوف لاين) v3...⏳');
        
        // التعديل الآمن هنا: نستخدم addAll بشكل مرن
        // بدلاً من addAll(urlsToCache) التي تفشل كلها لفشل ملف واحد
        return Promise.all(
            urlsToCache.map(url => {
                // نطلب كل ملف على حدة، وإذا فشل، نسجله كخطأ دون إفشال العملية كلها
                return cache.add(url).catch(error => {
                    console.error('فشل تحميل الملف الأوف لاين:', url, error);
                });
            })
        );
      })
      .then(() => self.skipWaiting()) // لتفعيل النسخة الجديدة فوراً
  );
});

// استراتيجية "الكاش أولاً، ثم الشبكة" (مستقرة للأوف لاين)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse; // إذا وجدناه محلياً، نرجعه فوراً
        }
        
        // إذا لم نجده، نطلبه من الشبكة
        return fetch(event.request).catch(() => {
            // في حال فشل الكاش والشبكة، يمكنك إرجاع صفحة أوف لاين مخصصة هنا
            // return caches.match('offline.html');
        });
      })
  );
});
