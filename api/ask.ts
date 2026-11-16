
import { GoogleGenAI } from '@google/genai';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'الطريقة غير مسموحة' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: 'خدمة المدرّس الذكي غير مفعّلة. تحقق من إعداد GEMINI_API_KEY في Vercel.'
    });
  }

  try {
    const { question, subject, stage, curriculumContext, image } = req.body || {};

    if (typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({ error: 'اكتب سؤالك أولاً.' });
    }

    if (question.length > 2500) {
      return res.status(400).json({ error: 'السؤال طويل جداً. اختصره إلى 2500 حرف.' });
    }

    const context = typeof curriculumContext === 'string'
      ? curriculumContext.slice(0, 18000)
      : '';

    const prompt = `أنت المدرّس الذكي في منصة النابغة التعليمية العراقية.
أجب باللغة العربية الواضحة وبأسلوب يناسب الطالب العراقي.

المرحلة: ${String(stage || 'غير محددة').slice(0, 100)}
المادة: ${String(subject || 'غير محددة').slice(0, 100)}

قواعد صارمة:
1. اعتمد أولاً على محتوى المنهج المرفق فقط.
2. لا تخترع معلومة أو قانوناً أو جواباً غير موجود في المصدر.
3. إذا لم يكف المصدر، قل بوضوح إنك لم تجد جواباً مؤكداً في المحتوى المرفوع.
4. اشرح المسائل خطوة بخطوة واذكر عنوان الدرس إذا توفر.
5. ميّز بين نص المنهج والتوضيح الإضافي.
6. لا تدّع أن الإجابة وزارية إذا لم يذكر المصدر ذلك.

محتوى المنهج:
${context || 'لا يوجد محتوى منهجي مرفق لهذه المادة.'}

سؤال الطالب:
${question.trim()}`;

    const ai = new GoogleGenAI({ apiKey });
    const parts: any[] = [{ text: prompt }];

    if (
      image &&
      typeof image.data === 'string' &&
      typeof image.mimeType === 'string' &&
      /^image\/(png|jpeg|webp)$/.test(image.mimeType)
    ) {
      const raw = image.data.replace(
        /^data:image\/[a-zA-Z0-9.+-]+;base64,/,
        ''
      );

      if (raw.length > 5000000) {
        return res.status(400).json({ error: 'حجم الصورة كبير. اختر صورة أصغر.' });
      }

      parts.push({
        inlineData: {
          mimeType: image.mimeType,
          data: raw
        }
      });
    }

    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts }]
    });

    const answer = result.text?.trim();

    if (!answer) {
      return res.status(502).json({
        error: 'ما حصلت إجابة واضحة. جرّب صياغة السؤال بطريقة ثانية.'
      });
    }

    return res.status(200).json({ answer });

  } catch (error: any) {
    console.error('Ask Nabigha API error:', error);
    return res.status(500).json({
      error: 'صار خطأ أثناء إعداد الإجابة. حاول مرة ثانية بعد قليل.'
    });
  }
}
