// sw.js (الإصدار v3 المستقر)

const CACHE_NAME = 'royal-book-v3'; 

// قائمة الملفات الملكية الشاملة (تأكد من وجودها فعلياً في مجلدك)
const urlsToCache = [
  'index.html',
  'editor.html',
  'login.html',
  'royal-features-interactive-fixed.html',
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
// استراتيجية "الكاش أولاً، ثم الشبكة" مع حماية ضد الانهيار
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // 1. إذا كان الملف موجوداً في الكاش، أرجعه فوراً
            if (cachedResponse) {
                return cachedResponse;
            }

            // 2. إذا لم يكن في الكاش، جربه من الشبكة
            return fetch(event.request)
                .then((networkResponse) => {
                    // تأكد من أن الاستجابة صالحة قبل إرجاعها
                    if (!networkResponse || networkResponse.status !== 200) {
                        return networkResponse;
                    }
                    return networkResponse;
                })
                .catch(() => {
                    // 3. الحل السحري: إذا فشلت الشبكة (مثل صورة placeholder)
                    // نرجو إرجاع "استجابة فارغة" بدلاً من إرسال Error يحطم الـ SW
                    return new Response('Network error occurred', {
                        status: 408,
                        statusText: 'Network error occurred'
                    });
                });
        })
    );
});
