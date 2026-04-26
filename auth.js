/**
 * auth.js - نظام إدارة المستخدمين والتحقق
 */

const AUTH_CONFIG = {
    // الرابط الخاص بك الذي نشرته مؤخراً
    SCRIPT_URL: "https://script.google.com/macros/s/AKfycbzVIL8_9oYVEfAIvIlzcQjz9SV1SR2Fni0k2Euo__92mtERHfiPJHnoxQKSkvYM5lB6/exec",
    GUEST_LIMIT: 1 
};

// قراءة حالة المستخدم من الذاكرة المحلية
let currentUser = JSON.parse(localStorage.getItem('royal_user')) || { role: 'guest', id: 'guest_tmp', username: 'زائر' };

/**
 * دالة التحقق من صلاحية إضافة كتب جديدة
 */
function canAddMoreBooks() {
    const booksCount = JSON.parse(localStorage.getItem('royal_books_list') || '[]').length;
    if (currentUser.role === 'guest') {
        return booksCount < AUTH_CONFIG.GUEST_LIMIT;
    }
    return true; // العضو المسجل له مساحة مفتوحة
}

/**
 * تسجيل الخروج
 */
function logoutUser() {
    if (confirm("هل أنت متأكد من تسجيل الخروج؟")) {
        localStorage.removeItem('royal_user');
        localStorage.removeItem('royal_books_list'); // تنظيف المكتبة لضمان الخصوصية
        window.location.href = 'index.html';
    }
}

// تحديث الواجهة عند تحميل أي صفحة
document.addEventListener('DOMContentLoaded', () => {
    const userDisplay = document.getElementById('userDisplayName');
    const authBtn = document.getElementById('authActionBtn');
    
    if (userDisplay && authBtn) {
        if (currentUser.role === 'member') {
            userDisplay.innerText = `مرحباً، ${currentUser.username}`;
            authBtn.innerText = "تسجيل الخروج";
            authBtn.onclick = logoutUser;
        } else {
            userDisplay.innerText = "أنت تتصفح كزائر";
            authBtn.innerText = "تسجيل الدخول / فتح حساب";
            authBtn.onclick = () => window.location.href = 'login.html';
        }
    }
});

// مراقبة حالة الإنترنت
window.addEventListener('online', () => {
    // تحقق مما إذا كان المستخدم مسجلاً دخوله أصلاً
    if (currentUser.role === 'member') {
        showSyncPrompt();
    }
});

function showSyncPrompt() {
    // التحقق مما إذا كان المستخدم قد اختار "لا تظهر مجدداً"
    if (localStorage.getItem('hideSyncPrompt') === 'true') return;

    const syncDiv = document.createElement('div');
    syncDiv.id = 'syncNotice';
    syncDiv.style = "position:fixed; bottom:20px; left:20px; background:white; padding:20px; border-radius:10px; box-shadow:0 5px 15px rgba(0,0,0,0.3); z-index:10001; border-right:5px solid var(--royal-gold); direction:rtl;";
    syncDiv.innerHTML = `
        <p>أنت الآن متصل بالإنترنت، هل تريد مزامنة هذه النسخة ببياناتك على الموقع السحابي؟</p>
        <button onclick="startSyncProcess()" style="background:var(--royal-green); color:white; border:none; padding:5px 15px; cursor:pointer;">نعم، أريد المزامنة</button>
        <button onclick="document.getElementById('syncNotice').remove()" style="background:#ccc; border:none; padding:5px 15px; cursor:pointer;">ليس الآن</button>
        <br><br>
        <label style="font-size:12px; color:#666;">
            <input type="checkbox" id="noShowAgain"> لا تظهر هذه الرسالة مجدداً
        </label>
        <button onclick="saveSyncPreference()" style="font-size:12px; background:none; border:1px solid #ddd; cursor:pointer;">حفظ التفضيل</button>
    `;
    document.body.appendChild(syncDiv);
}

function saveSyncPreference() {
    if (document.getElementById('noShowAgain').checked) {
        localStorage.setItem('hideSyncPrompt', 'true');
    }
    document.getElementById('syncNotice').remove();
}

async function startSyncProcess() {
    if (document.getElementById('syncNotice')) document.getElementById('syncNotice').innerText = "جاري المزامنة... انتظر قليلاً";
    
    const localBooks = JSON.parse(localStorage.getItem('royal_books_list') || '[]');
    const userId = currentUser.id;

    try {
        const response = await fetch(AUTH_CONFIG.SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({
                action: "sync_library",
                userId: userId,
                localBooks: localBooks // سنرسل النسخة المحلية كاملة ليقوم السيرفر بالمقارنة
            })
        });

        const result = await response.json();

        if (result.success) {
            // تحديث المكتبة المحلية بالبيانات المدمجة القادمة من السيرفر
            localStorage.setItem('royal_books_list', JSON.stringify(result.mergedBooks));
            alert("تمت المزامنة بنجاح! تم تحديث الكتب السحابية وجلب الجديد منها.");
            if (typeof renderBooks === "function") renderBooks(); // لتحديث الواجهة فوراً
        }
    } catch (error) {
        console.error("خطأ في المزامنة:", error);
        alert("فشلت المزامنة، تأكد من جودة الاتصال.");
    }

    if (document.getElementById('syncNotice')) document.getElementById('syncNotice').remove();
}

