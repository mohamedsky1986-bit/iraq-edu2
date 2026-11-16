
import { GoogleGenAI } from '@google/genai';

export default async function handler(req: any, res: any) {
  // السماح بطلبات POST فقط
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'الطريقة غير مسموحة'
    });
  }

  // التحقق من مفتاح Gemini
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('GEMINI_API_KEY is missing');

    return res.status(503).json({
      error: 'خدمة المدرّس الذكي غير مفعّلة. تحقق من إعداد GEMINI_API_KEY في Vercel.'
    });
  }

  try {
    const {
      question,
      subject,
      stage,
      curriculumContext,
      image
    } = req.body || {};

    // التحقق من السؤال
    if (typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({
        error: 'اكتب سؤالك أولاً.'
      });
    }

    if (question.length > 2500) {
      return res.status(400).json({
        error: 'السؤال طويل جداً. اختصره إلى 2500 حرف.'
      });
    }

    // قراءة محتوى المنهج
    const context =
      typeof curriculumContext === 'string'
        ? curriculumContext.slice(0, 18000)
        : '';

    // تجهيز تعليمات المدرّس الذكي
    const prompt = `
أنت المدرّس الذكي في منصة النابغة التعليمية العراقية.

مهمتك مساعدة الطالب العراقي على فهم المنهج والإجابة عن أسئلته.

المرحلة الدراسية: ${String(stage || 'غير محددة').slice(0, 100)}
المادة الدراسية: ${String(subject || 'غير محددة').slice(0, 100)}

التعليمات:

1. اعتمد على محتوى المنهج المرفق أساساً للإجابة.
2. لا تخترع معلومات أو قوانين أو إجابات غير مؤكدة.
3. إذا لم تجد الجواب في المحتوى المرفق، وضّح ذلك للطالب بصراحة.
4. اشرح المسائل الرياضية والعلمية خطوة بخطوة.
5. اذكر عنوان الدرس أو الفصل إذا كان متوفراً.
6. استخدم لغة عربية واضحة ومناسبة للطلاب العراقيين.
7. رتّب الإجابة بعناوين ونقاط عند الحاجة.
8. ميّز بين معلومات الكتاب والتوضيحات الإضافية.
9. لا تصف أي سؤال بأنه وزاري إلا إذا كان المصدر يثبت ذلك.
10. إذا أرسل الطالب صورة لسؤال، اقرأ السؤال الموجود بالصورة وحاول حله وفق المنهج.

محتوى المنهج المرفوع:

${context || 'لا يوجد محتوى منهجي مرفق لهذه المادة.'}

سؤال الطالب:

${question.trim()}
`;

    const ai = new GoogleGenAI({ apiKey });

    const parts: any[] = [
      {
        text: prompt
      }
    ];

    // التحقق من الصورة المرفقة
    if (image) {
      if (
        typeof image.data !== 'string' ||
        typeof image.mimeType !== 'string' ||
        !/^image\/(png|jpeg|webp)$/.test(image.mimeType)
      ) {
        return res.status(400).json({
          error: 'صيغة الصورة غير مدعومة. استخدم PNG أو JPG أو WEBP.'
        });
      }

      const raw = image.data.replace(
        /^data:image\/[a-zA-Z0-9.+-]+;base64,/,
        ''
      );

      if (!raw || raw.length > 5000000) {
        return res.status(400).json({
          error: 'حجم الصورة كبير أو الصورة غير صالحة. اختر صورة أصغر.'
        });
      }

      parts.push({
        inlineData: {
          mimeType: image.mimeType,
          data: raw
        }
      });
    }

    // إرسال السؤال إلى Gemini
    const result = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts
        }
      ]
    });

    const answer = result.text?.trim();

    // التحقق من وجود إجابة
    if (!answer) {
      return res.status(502).json({
        error: 'ما حصلت إجابة واضحة. جرّب صياغة السؤال بطريقة ثانية.'
      });
    }

    // إرسال الإجابة إلى المنصة
    return res.status(200).json({
      answer
    });

  } catch (error: any) {
    // تسجيل الخطأ الحقيقي في Vercel
    console.error(
      'Ask Nabigha API error:',
      error?.message || error
    );

    return res.status(500).json({
      error: 'صار خطأ أثناء إعداد الإجابة. حاول مرة ثانية بعد قليل.'
    });
  }
}
