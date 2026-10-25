/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Normalizes Arabic and general text for robust comparison.
 * - Removes Arabic diacritics (tashkeel, tatweel)
 * - Normalizes Alef variants (أ, إ, آ, ٱ -> ا)
 * - Normalizes Taa Marbuta and Haa (ة -> ه)
 * - Normalizes Alif Maqsura and Yaa (ى -> ي)
 * - Removes unnecessary punctuation and collapses whitespace
 */
export function normalizeArabicText(text: string): string {
  if (!text) return '';

  let normalized = text.trim().toLowerCase();

  // Remove Arabic diacritics (Tashkeel: Fatha, Damma, Kasra, Sukun, Tanween, Shadda, etc.)
  normalized = normalized.replace(/[\u064B-\u065F\u0670]/g, '');

  // Remove Tatweel (kashida)
  normalized = normalized.replace(/\u0640/g, '');

  // Normalize Alef forms
  normalized = normalized.replace(/[أإآٱ]/g, 'ا');

  // Normalize Taa Marbuta to Haa
  normalized = normalized.replace(/ة/g, 'ه');

  // Normalize Alif Maqsura to Yaa
  normalized = normalized.replace(/ى/g, 'ي');

  // Remove surrounding punctuation and symbols
  normalized = normalized.replace(/[.,/#!$%^&*;:{}=\-_`~()؟?،!]/g, ' ');

  // Collapse consecutive whitespaces
  normalized = normalized.replace(/\s+/g, ' ').trim();

  return normalized;
}

/**
 * Calculates Levenshtein edit distance between two strings.
 */
export function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,    // deletion
          dp[i][j - 1] + 1,    // insertion
          dp[i - 1][j - 1] + 1 // substitution
        );
      }
    }
  }

  return dp[m][n];
}

export interface FillBlankEvaluation {
  isCorrect: boolean;
  isExact: boolean;
  hasTypoAlert: boolean;
  matchedAnswer: string;
  similarityPercent: number;
  feedbackMessage: string;
  tip?: string;
}

/**
 * Tolerant smart grading for fill-in-the-blank questions.
 * Handles minor typos (1-2 character edits or >= 80% similarity),
 * accepting the answer while alerting the student of the precise spelling mistake.
 */
export function evaluateFillBlankAnswer(
  studentInput: string,
  acceptedAnswers: string[]
): FillBlankEvaluation {
  const cleanedStudentRaw = studentInput ? studentInput.trim() : '';
  if (!cleanedStudentRaw) {
    return {
      isCorrect: false,
      isExact: false,
      hasTypoAlert: false,
      matchedAnswer: acceptedAnswers[0] || '',
      similarityPercent: 0,
      feedbackMessage: 'لم تقم بكتابة أي إجابة في الفراغ.',
    };
  }

  const normalizedStudent = normalizeArabicText(cleanedStudentRaw);

  let bestMatch = acceptedAnswers[0] || '';
  let bestDistance = Infinity;
  let bestSimilarity = 0;
  let isExactFound = false;

  for (const rawAccepted of acceptedAnswers) {
    const targetClean = rawAccepted.trim();
    const normalizedTarget = normalizeArabicText(targetClean);

    // Exact string match (raw or normalized)
    if (cleanedStudentRaw === targetClean || normalizedStudent === normalizedTarget) {
      return {
        isCorrect: true,
        isExact: true,
        hasTypoAlert: false,
        matchedAnswer: targetClean,
        similarityPercent: 100,
        feedbackMessage: 'إجابة دقيقة وصحيحة 100%! أحسنت.',
      };
    }

    // Also check if stripping 'ال' prefix makes them match
    const studentNoAl = normalizedStudent.startsWith('ال') ? normalizedStudent.slice(2) : normalizedStudent;
    const targetNoAl = normalizedTarget.startsWith('ال') ? normalizedTarget.slice(2) : normalizedTarget;
    if (studentNoAl === targetNoAl && studentNoAl.length > 2) {
      return {
        isCorrect: true,
        isExact: false,
        hasTypoAlert: true,
        matchedAnswer: targetClean,
        similarityPercent: 95,
        feedbackMessage: `إجابة مقبولة وصحيحة، مع ملاحظة كتابة (ال) التعريف: «${targetClean}».`,
        tip: `كتبت: "${cleanedStudentRaw}" والصيغة النموذجية: "${targetClean}".`
      };
    }

    const dist = levenshteinDistance(normalizedStudent, normalizedTarget);
    const maxLen = Math.max(normalizedStudent.length, normalizedTarget.length);
    const similarity = maxLen > 0 ? Math.round(((maxLen - dist) / maxLen) * 100) : 0;

    if (dist < bestDistance) {
      bestDistance = dist;
      bestMatch = targetClean;
      bestSimilarity = similarity;
    }
  }

  // Determine tolerance criteria based on word length
  const targetLen = normalizeArabicText(bestMatch).length;
  // If word length <= 4: max 1 typo allowed with >= 75% similarity
  // If word length > 4: max 2 typos allowed with >= 75% similarity
  const maxAllowedDistance = targetLen <= 4 ? 1 : 2;

  if (bestDistance <= maxAllowedDistance && bestSimilarity >= 75) {
    return {
      isCorrect: true,
      isExact: false,
      hasTypoAlert: true,
      matchedAnswer: bestMatch,
      similarityPercent: bestSimilarity,
      feedbackMessage: `إجابة صحيحة ومقبولة بنسبة ${bestSimilarity}%! انتبه للخطأ الإملائي البسيط.`,
      tip: `الإملاء الصحيح هو: «${bestMatch}»، وأنت كتبت: «${cleanedStudentRaw}». تم احتساب الدرجة تشجيعاً لك!`
    };
  }

  // Answer is incorrect
  return {
    isCorrect: false,
    isExact: false,
    hasTypoAlert: false,
    matchedAnswer: bestMatch,
    similarityPercent: bestSimilarity,
    feedbackMessage: `إجابة غير صحيحة. الإجابة الصحيحة هي: «${bestMatch}».`,
    tip: `نسبة التطابق مع الإجابة هي ${bestSimilarity}%. راجع الشرح والدرس لترسيخ المعلومة.`
  };
}
