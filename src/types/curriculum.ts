/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type EducationalTier = 'intermediate' | 'preparatory';

export interface EducationalStage {
  id: string;
  name: string;
  shortName: string;
  tier: EducationalTier;
  badge?: string;
  description: string;
}

export interface Subject {
  id: string;
  stageId: string;
  name: string;
  iconName: string;
  accentColor: string;
  description: string;
  isCustom?: boolean;
}

export interface Lesson {
  id: string;
  subjectId: string;
  stageId: string;
  title: string;
  chapter: string;
  summary: string;
  keyPoints: string[];
  youtubeVideoUrl?: string;
  imageUrl?: string;
  bookPages?: string;
  isVipOnly?: boolean;
}

export type QuestionType = 'mcq' | 'fill_blank' | 'true_false' | 'matching';

export interface MatchingPair {
  id: string;
  left: string;
  right: string;
}

export interface Question {
  id: string;
  stageId: string;
  subjectId: string;
  lessonId?: string;
  chapter?: string; // تحديد الفصل (الفصل الأول، الثاني، إلخ)
  type: QuestionType;
  prompt: string;
  options?: string[]; // for mcq
  correctAnswer: string; // for mcq & true_false
  acceptedAnswers?: string[]; // for fill_blank
  matchingPairs?: MatchingPair[]; // for matching
  explanation: string;
  hint?: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'ministerial';
  imageUrl?: string; // صورة السؤال أو المخطط
  isVip?: boolean; // خيار تفعيل وضع VIP مقابل السؤال
}

export interface Exam {
  id: string;
  title: string;
  stageId: string;
  subjectId: string;
  chapter?: string; // الفصل المخصص للامتحان
  description: string;
  durationMinutes: number;
  questionIds: string[]; // تسلسل الأسئلة مع تقديم وتأخير
  isComprehensive: boolean;
  isMinisterial: boolean;
  isVip: boolean;
}

export interface QuestionEvaluationResult {
  questionId: string;
  questionPrompt: string;
  questionType: QuestionType;
  studentAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  hasTypoAlert: boolean;
  similarityPercent?: number;
  feedback: string;
  explanation: string;
}

export interface StudentSubmission {
  id: string;
  examId: string;
  examTitle: string;
  studentEmail: string;
  studentName: string;
  stageId: string;
  subjectId: string;
  score: number;
  totalScore: number;
  percentage: number;
  completedAt: string;
  timeSpentSeconds: number;
  results: QuestionEvaluationResult[];
}

export interface UserAccount {
  email: string;
  name: string;
  username: string; // اليوزر نيم الخاص بالطالب
  role: 'student' | 'teacher';
  isVip: boolean;
  targetStageId?: string;
  password?: string; // كلمة المرور
  governorate?: string; // المحافظة العراقية
  phoneNumber?: string;
  registeredAt: string; // وقت وتاريخ التسجيل
  lastActiveAt: string; // آخر ظهور للطالب
  customNotes?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  priceIQD: number; // السعر بالدينار العراقي
  durationText: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  isActive: boolean;
}

export interface PaymentSettings {
  zainCashNumber: string;
  zainCashHolder: string;
  qiCardNumber: string;
  asiaCellNumber: string;
  whatsappContact: string;
  instructions: string;
  exchangeNote: string;
}

export interface AdminSecuritySettings {
  passcode: string; // الرمز السري للوحة التحكم
  instituteName: string;
  supportPhone: string;
  fuzzyToleranceEnabled: boolean;
  allowPublicReviews: boolean;
}

export interface StudentReview {
  id: string;
  studentName: string;
  username: string;
  studentEmail: string;
  governorate: string; // بغداد، البصرة، نينوى، إلخ
  gradeName: string;
  rating: number; // 1-5 stars
  comment: string;
  createdAt: string;
  isApproved: boolean; // موافقة المدرس
  isFeatured?: boolean; // مثبت في الواجهة
}

export interface StudyBooklet {
  id: string;
  title: string;
  stageId: string;
  subjectId: string;
  chapter: string;
  authorTeacher: string;
  pageCount: number;
  pdfUrl: string;
  coverImageUrl?: string;
  description: string;
  isVipOnly: boolean;
  publishedAt: string;
  downloadCount: number;
}
