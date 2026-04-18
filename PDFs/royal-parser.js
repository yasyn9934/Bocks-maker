/**
 * 👑 محرك الكتب الملكي - المُحلل (Royal Parser)
 * الوظيفة: تحويل النص الخام إلى كائنات بيانات ذكية (AST) لتسهيل رسمها في الـ PDF
 */

class RoyalParser {
    constructor() {
        this.chapterCount = 0;
        this.toc = []; // الفهرس
    }

    // دالة التحليل الرئيسية
    parse(rawText) {
        this.chapterCount = 0;
        this.toc = [];
        const lines = rawText.split('\n');
        const parsedBlocks = [];

        lines.forEach((line, index) => {
            let text = line.trim();
            if (text === "") {
                parsedBlocks.push({ type: 'spacer', height: 10 }); // مسافة فارغة
                return;
            }

            // اكتشاف العناوين (الفصول)
            if (text.startsWith('# ')) {
                this.chapterCount++;
                let title = text.replace('# ', '').trim();
                let chapterId = `chapter_${this.chapterCount}`;
                
                // إضافة العنوان للفهرس
                this.toc.push({ id: chapterId, title: title, page: 0 });

                parsedBlocks.push({
                    type: 'heading',
                    text: title,
                    id: chapterId,
                    align: 'center',
                    fontSize: 34,
                    color: '#4a3f35',
                    font: 'Aref Ruqaa',
                    marginTop: 20,
                    marginBottom: 20
                });
            } 
            // اكتشاف الآيات القرآنية لتنسيقها بلون مختلف (مثال)
            else if (text.includes('﴿') && text.includes('﴾')) {
                parsedBlocks.push({
                    type: 'quran',
                    text: text,
                    align: 'justify',
                    fontSize: 22,
                    color: '#2c5e2e', // لون أخضر للقرآن
                    font: 'Amiri',
                    lineHeight: 2.2
                });
            }
            // النصوص العادية
            else {
                parsedBlocks.push({
                    type: 'paragraph',
                    text: text,
                    align: 'justify',
                    fontSize: 20,
                    color: '#333333',
                    font: 'Amiri',
                    lineHeight: 2.2
                });
            }
        });

        return {
            blocks: parsedBlocks,
            tableOfContents: this.toc
        };
    }
}

// تصدير المحلل ليكون متاحاً عالمياً
window.royalParser = new RoyalParser();
