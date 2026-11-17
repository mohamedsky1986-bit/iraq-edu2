
import { GoogleGenAI } from '@google/genai';

const PRIMARY_MODEL = 'gemini-3.8-flash';
const FALLBACK_MODEL = 'gemini-3.5-flash-lite';

const wait = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));

// فحص أخطاء الضغط المؤقت من Gemini
function isTemporaryError(error: any): boolean {
  const message = String(error?.message || error || '').toLowerCase();

  return (
    error?.status === 503 ||
    error?.code === 503 ||
    message.includes('"code":503') ||
    message.includes('unavailable') ||
    message.includes('high demand') ||
    message.includes('overloaded') ||
    message.includes('resource_exhausted') ||
    error?.status === 429 ||
    error?.code === 429
  );
}

// إرسال السؤال مع إعادة المحاولة والنموذج البديل
async function generateAnswer(
  ai: GoogleGenAI,
  parts: any[]
): Promise<string> {
  // المحاولة الأولى بالنموذج الأساسي
  try {
    const result = await ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents: [{ role: 'user', parts }]
    });

    const answer = result.text?.trim();
    if (answer) return answer;

    throw new Error('لم يرجع النموذج إجابة.');
  } catch (error: any) {
    if (!isTemporaryError(error)) throw error;

    console.warn('Gemini الأساسي مشغول، إعادة المحاولة...');
  }

  // إعادة المحاولة مرة واحدة
  await wait(900);

  try {
    const result = await ai.models.generateContent({
      model: PRIMARY_MODEL,
      contents: [{ role: 'user', parts }]
    });

    const answer = result.text?.trim();
    if (answer) return answer;

    throw new Error('لم يرجع النموذج إجابة.');
  } catch (error: any) {
    if (!isTemporaryError(error)) throw error;

    console.warn('النموذج الأساسي ما زال مشغولاً، الانتقال للبديل...');
  }

  // النموذج البديل الأسرع
  const fallbackResult = await ai.models.generateContent({
    model: FALLBACK_MODEL,
    contents: [{ role: 'user', parts }]
  });

  const fallbackAnswer = fallbackResult.text?.trim();

  if (!fallbackAnswer) {
    throw new Error('لم يرجع النموذج البديل إجابة.');
  }

  return fallbackAnswer;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'الطريقة غير مسموحة'
    });
  }

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

    const context =
      typeof curriculumContext === 'string'
        ? curriculumContext.slice(0, 18000)
        : '';

    const prompt = `
أنت المدرّس الذكي في منصة النابغة التعليمية العراقية.

مهمتك مساعدة الطالب العراقي على فهم المنهج والإجابة عن أسئلته.

المرحلة الدراسية: ${String(stage || 'غير محددة').slice(0, 100)}
المادة الدراسية: ${String(subject || 'غير محددة').slice(0, 100)}

التعليمات:

1. اعتمد على محتوى المنهج المرفق أساساً للإجابة.
2. افهم سؤال الطالب جيداً، وأجب عن المطلوب مباشرة.
3. لا تكتفِ بإعادة صياغة السؤال.
4. لا تخترع معلومات أو قوانين أو إجابات غير مؤكدة.
5. إذا لم تجد الجواب في المحتوى المرفق، وضّح ذلك للطالب بصراحة، ويمكنك تقديم شرح علمي موثوق مع تمييزه عن محتوى الكتاب.
6. اشرح المسائل الرياضية والعلمية خطوة بخطوة.
7. اذكر عنوان الدرس أو الفصل إذا كان متوفراً.
8. استخدم لغة عربية واضحة ومناسبة للطلاب العراقيين.
9. رتّب الإجابة بعناوين ونقاط عند الحاجة.
10. ميّز بين معلومات الكتاب والتوضيحات الإضافية.
11. لا تصف أي سؤال بأنه وزاري إلا إذا كان المصدر يثبت ذلك.
12. إذا أرسل الطالب صورة لسؤال، اقرأ السؤال الموجود بالصورة وحاول حله وفق المنهج.
13. إذا كان السؤال قصيراً مثل تعريف أو تعداد أو تعليل، أعطِ إجابة مباشرة دون إطالة غير ضرورية.
14. لا ترفض الإجابة لمجرد أن صياغة السؤال مختلفة عن صياغة الكتاب.

محتوى المنهج المرفوع:

${context || 'لا يوجد محتوى منهجي مرفق لهذه المادة.'}

سؤال الطالب:

${question.trim()}
`;

    const parts: any[] = [
      { text: prompt }
    ];

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

    const ai = new GoogleGenAI({ apiKey });

    const answer = await generateAnswer(ai, parts);

    return res.status(200).json({
      answer
    });

  } catch (error: any) {
    console.error(
      'Ask Nabigha API error:',
      error?.message || error
    );

    if (isTemporaryError(error)) {
      return res.status(503).json({
        error: 'خدمة المدرّس الذكي مزدحمة حالياً. حاول مرة ثانية بعد قليل.'
      });
    }

    return res.status(500).json({
      error: 'صار خطأ أثناء إعداد الإجابة. حاول مرة ثانية بعد قليل.'
    });
  }
}
