/**
 * 👑 محرك الكتب الملكي - الرسّام (Royal Renderer)
 * الوظيفة: أخذ البيانات من المُحلل، حساب الإحداثيات، رسم الصفحات، وإضافة الروابط.
 */

class RoyalRenderer {
    constructor() {
        this.doc = null;
        // إعدادات الصفحة بالمليمتر (مقاس B4 تقريباً كما في نسختك)
        this.pageWidth = 250;
        this.pageHeight = 353;
        // الهوامش الصارمة
        this.margins = { top: 42, bottom: 25, left: 35, right: 35 };
        // مؤشر الرسم (الـ Cursor الذي ينزل للأسفل مع كل سطر)
        this.cursorY = this.margins.top;
        this.currentPage = 1;
        this.tocData = []; // لحفظ أرقام صفحات الفصول من أجل الروابط
    }

    // الدالة الرئيسية لبدء بناء الكتاب
    async renderBook(parsedData, metadata) {
        // 1. تهيئة ملف الـ PDF (نستخدم مكتبة jsPDF المدمجة كأساس)
        const { jsPDF } = window.jspdf;
        this.doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [this.pageWidth, this.pageHeight]
        });

        // 2. تفعيل الخطوط والزخارف (سيتم جلبها من ملف الأصول royal-assets)
        if (window.royalAssets) {
            window.royalAssets.loadFonts(this.doc);
        }

        // 3. رسم الغلاف
        this.drawCover(metadata);

        // 4. رسم المحتوى (سطراً بسطر)
        parsedData.blocks.forEach(block => {
            this.drawBlock(block, metadata);
        });

        // 5. بناء الفهرس التفاعلي في نهاية الكتاب (أو بدايته)
        this.drawTableOfContents();

        // 6. الحفظ والإخراج
        this.doc.save((metadata.title || 'كتاب_ملكي') + '.pdf');
    }

    // دالة رسم الغلاف
    drawCover(metadata) {
        this.doc.setFont('Aref Ruqaa', 'normal');
        this.doc.setFontSize(55);
        this.doc.setTextColor(74, 63, 53); // لون #4a3f35
        
        // رسم العنوان في المنتصف
        this.doc.text(metadata.title || 'عنوان الكتاب', this.pageWidth / 2, 120, { align: 'center' });
        
        this.doc.setFontSize(30);
        this.doc.text(metadata.author || 'المؤلف', this.pageWidth / 2, 160, { align: 'center' });
        
        this.doc.setFont('Amiri', 'normal');
        this.doc.setFontSize(20);
        this.doc.setTextColor(119, 119, 119); // لون رمادي للتاريخ
        this.doc.text(metadata.date || '', this.pageWidth / 2, 190, { align: 'center' });

        this.addNewPage(metadata);
    }

    // دالة رسم الكتل النصية بدقة متناهية
    drawBlock(block, metadata) {
        if (block.type === 'spacer') {
            this.cursorY += block.height;
            return;
        }

        this.doc.setFont(block.font, 'normal');
        this.doc.setFontSize(block.fontSize);
        this.doc.setTextColor(block.color);

        // إذا كان الكتلة عنواناً (فصل جديد)
        if (block.type === 'heading') {
            this.checkPageBreak(40, metadata); // التأكد من وجود مساحة كافية للعنوان
            this.cursorY += block.marginTop;
            
            // حفظ رقم الصفحة الحالي لهذا الفصل لربطه بالفهرس لاحقاً
            this.tocData.push({ title: block.text, page: this.currentPage });

            this.doc.text(block.text, this.pageWidth / 2, this.cursorY, { align: 'center' });
            this.cursorY += block.marginBottom;
        } 
        // إذا كان فقرة أو آية قرآنية
        else {
            // تقسيم النص الطويل إلى أسطر تناسب عرض الصفحة
            let maxWidth = this.pageWidth - this.margins.left - this.margins.right;
            let lines = this.doc.splitTextToSize(block.text, maxWidth);

            lines.forEach(line => {
                this.checkPageBreak(12, metadata); // التحقق من المساحة قبل رسم كل سطر
                // الرسم من اليمين إلى اليسار
                this.doc.text(line, this.pageWidth - this.margins.right, this.cursorY, { align: 'right' });
                this.cursorY += (block.fontSize * 0.35); // مسافة السطر
            });
            this.cursorY += 8; // مسافة بين الفقرات
        }
    }

    // المراقب الصارم للصفحات (Zero Tolerance الحقيقي)
    checkPageBreak(requiredSpace, metadata) {
        if (this.cursorY + requiredSpace > this.pageHeight - this.margins.bottom) {
            this.addNewPage(metadata);
        }
    }

    // دالة إضافة صفحة جديدة ورسم الترويسة والزخارف
    addNewPage(metadata) {
        this.doc.addPage();
        this.currentPage++;
        this.cursorY = this.margins.top;

        // رسم الترويسة العلوية الثابتة
        this.doc.setFont('Amiri', 'normal');
        this.doc.setFontSize(14);
        this.doc.setTextColor(74, 63, 53);
        
        // العنوان على اليمين والتاريخ على اليسار
        this.doc.text(metadata.title, this.pageWidth - this.margins.right, 24, { align: 'right' });
        this.doc.text(metadata.date, this.margins.left, 24, { align: 'left' });

        // يمكننا هنا إضافة دالة رسم الزخارف بناءً على ستايل الصفحة المختار
        if (window.royalAssets) {
            window.royalAssets.drawFrame(this.doc, metadata.style, this.pageWidth, this.pageHeight);
        }
    }

    // دالة رسم الفهرس التفاعلي السحري
    drawTableOfContents() {
        if (this.tocData.length === 0) return;
        
        this.addNewPage({ title: 'الفهرس', date: '', style: 'style-clean' });
        this.doc.setFont('Aref Ruqaa', 'normal');
        this.doc.setFontSize(30);
        this.doc.text("الفهرس", this.pageWidth / 2, this.cursorY, { align: 'center' });
        this.cursorY += 20;

        this.doc.setFont('Amiri', 'normal');
        this.doc.setFontSize(18);

        this.tocData.forEach(item => {
            this.checkPageBreak(15, { title: 'الفهرس', date: '', style: 'style-clean' });
            
            // رسم النص ورقم الصفحة
            this.doc.text(item.title, this.pageWidth - this.margins.right, this.cursorY, { align: 'right' });
            this.doc.text(item.page.toString(), this.margins.left, this.cursorY, { align: 'left' });
            
            // 💡 السحر هنا: إنشاء رابط تفاعلي شفاف فوق هذا السطر ينقل للصفحة المطلوبة!
            // link(x, y, width, height, options)
            this.doc.link(this.margins.left, this.cursorY - 8, this.pageWidth - this.margins.left - this.margins.right, 12, { pageNumber: item.page });

            this.cursorY += 15;
        });
    }
}

// تصدير الرسام
window.royalRenderer = new RoyalRenderer();
