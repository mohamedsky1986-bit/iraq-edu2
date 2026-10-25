/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  PlusCircle,
  FileQuestion,
  Users,
  Award,
  Download,
  Upload,
  Copy,
  Check,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  CreditCard,
  Settings,
  MessageSquare,
  KeyRound,
  Edit,
  Lock,
  Phone,
  Smartphone,
  Calendar,
  Clock,
  Eye,
  Star,
  Plus,
  Crown,
  BookOpen,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import { useCurriculum } from '../context/CurriculumContext';
import { UserAccount, StudentSubmission, SubscriptionPlan, PaymentSettings, Question, StudyBooklet, Exam } from '../types/curriculum';
import { EditStudentModal } from './EditStudentModal';
import { EditQuestionModal } from './EditQuestionModal';
import { EditExamModal } from './EditExamModal';

interface TeacherDashboardProps {
  onOpenAddQuestionModal: () => void;
  onOpenAddSubjectModal: () => void;
  onOpenAddLessonModal: () => void;
  onOpenCreateExamModal: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  onOpenAddQuestionModal,
  onOpenAddSubjectModal,
  onOpenAddLessonModal,
  onOpenCreateExamModal
}) => {
  const {
    questions,
    subjects,
    stages,
    exams,
    submissions,
    users,
    adminSettings,
    changeAdminPasscode,
    updateAdminSettings,
    lockTeacherPanel,
    subscriptionPlans,
    updateSubscriptionPlan,
    paymentSettings,
    updatePaymentSettings,
    studentReviews,
    approveReview,
    toggleFeatureReview,
    deleteReview,
    deleteQuestion,
    toggleQuestionVip,
    deleteExam,
    booklets,
    deleteBooklet,
    exportDataAsJson,
    importDataFromJson
  } = useCurriculum();

  const [activeTab, setActiveTab] = useState<'questions' | 'students' | 'pricing' | 'reviews' | 'booklets' | 'settings' | 'export_gemini'>('students');

  // Student editing state
  const [editingStudent, setEditingStudent] = useState<UserAccount | null>(null);

  // Question editing state
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Exam editing state
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [questionsSubTab, setQuestionsSubTab] = useState<'questions' | 'exams'>('questions');

  // Submissions state
  const [selectedSubmission, setSelectedSubmission] = useState<StudentSubmission | null>(null);

  // Filter state for questions
  const [filterSubjectId, setFilterSubjectId] = useState<string>('all');
  const [filterChapter, setFilterChapter] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // Change Passcode form state
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [pinChangeStatus, setPinChangeStatus] = useState<{ success: boolean; message: string } | null>(null);

  // Payment settings local edit state
  const [editPayment, setEditPayment] = useState<PaymentSettings>({ ...paymentSettings });
  const [paymentSavedMsg, setPaymentSavedMsg] = useState(false);

  // Platform settings local edit state
  const [instituteName, setInstituteName] = useState(adminSettings.instituteName);
  const [supportPhone, setSupportPhone] = useState(adminSettings.supportPhone);
  const [settingsSavedMsg, setSettingsSavedMsg] = useState(false);

  // Export / Import state
  const [copiedGeminiPrompt, setCopiedGeminiPrompt] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const questionChapters = Array.from(
    new Set(
      questions
        .filter(q => (filterSubjectId === 'all' || q.subjectId === filterSubjectId) && q.chapter)
        .map(q => q.chapter as string)
    )
  );

  const filteredQuestions = questions.filter(q => {
    if (filterSubjectId !== 'all' && q.subjectId !== filterSubjectId) return false;
    if (filterChapter !== 'all' && q.chapter !== filterChapter) return false;
    if (filterType !== 'all' && q.type !== filterType) return false;
    return true;
  });

  // Handle Passcode Change
  const handleChangePasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.trim().length < 4) {
      setPinChangeStatus({ success: false, message: 'الرمز السري الجديد يجب ألا يقل عن 4 أرقام/رموز.' });
      return;
    }
    if (newPin.trim() !== confirmNewPin.trim()) {
      setPinChangeStatus({ success: false, message: 'تأكيد الرمز السري الجديد غير متطابق.' });
      return;
    }

    const ok = changeAdminPasscode(currentPin.trim(), newPin.trim());
    if (ok) {
      setPinChangeStatus({ success: true, message: 'تم تغيير الرمز السري للوحة التحكم بنجاح!' });
      setCurrentPin('');
      setNewPin('');
      setConfirmNewPin('');
    } else {
      setPinChangeStatus({ success: false, message: 'الرمز السري الحالي غير صحيح.' });
    }
  };

  // Handle Payment Settings Save
  const handleSavePaymentSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updatePaymentSettings(editPayment);
    setPaymentSavedMsg(true);
    setTimeout(() => setPaymentSavedMsg(false), 2500);
  };

  // Handle Platform Settings Save
  const handleSavePlatformSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateAdminSettings({
      instituteName: instituteName.trim(),
      supportPhone: supportPhone.trim()
    });
    setSettingsSavedMsg(true);
    setTimeout(() => setSettingsSavedMsg(false), 2500);
  };

  const generateGeminiPrompt = () => {
    return `أنت خبير في المناهج التعليمية والامتحانات الوزارية لجمهورية العراق (المرحلتين المتوسطة والإعدادية - وزارة التربية العراقية).
أريدك أن تولد لي 10 أسئلة وزارية جديدة بصيغة JSON متوافقة 100% مع منصة نبوغ التعليمية، مع التركيز على أسئلة الفراغات الذكية (fill_blank) والخيارات (mcq) مع شرح تفصيلي وتلميح.

هيكل الـ JSON المطلوب لكل سؤال:
[
  {
    "stageId": "grade-3-intermediate", // أو grade-6-prep-sci
    "subjectId": "subj-g3-physics", // أو المادة المطلوبة في العراق
    "type": "fill_blank", // أو mcq أو true_false
    "prompt": "نص السؤال الوزاري بدقة...",
    "acceptedAnswers": ["الإجابة النموذجية 1", "إجابة بديلة 2"],
    "correctAnswer": "الإجابة النموذجية الأولى",
    "explanation": "شرح علمي دقيق لطريقة حل السؤال في الدفتر الامتحاني الوزاري...",
    "hint": "تلميح مبسط للحل...",
    "difficulty": "ministerial",
    "isVip": false
  }
]

يرجى إرسال الـ JSON مباشرة لتضمينه في التطبيق.`;
  };

  const handleCopyGeminiPrompt = () => {
    navigator.clipboard.writeText(generateGeminiPrompt());
    setCopiedGeminiPrompt(true);
    setTimeout(() => setCopiedGeminiPrompt(false), 2500);
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(exportDataAsJson());
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2500);
  };

  const handleImport = () => {
    if (!importText.trim()) return;
    const ok = importDataFromJson(importText.trim());
    if (ok) {
      setImportStatus('تم استيراد البيانات وتحديث النظام بنجاح!');
      setImportText('');
    } else {
      setImportStatus('خطأ في صيغة ملف الـ JSON، يرجى التأكد من صحة الكود.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Top Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 leading-tight">
                لوحة تحكم المشرف والمدرس
              </h2>
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[11px] font-bold rounded-md border border-emerald-200">
                العراق - محمي برمز سري
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              إدارة بيانات الطلبة كاملة، بنك الأسئلة والامتحانات، خطط وأسعار الاشتراكات (زين كاش)، وتقييمات الطلبة
            </p>
          </div>
        </div>

        {/* Action quick buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenCreateExamModal}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Award className="w-4 h-4" />
            <span>إنشاء امتحان مخصص</span>
          </button>
          <button
            onClick={onOpenAddQuestionModal}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>إضافة سؤال جديد</span>
          </button>
          <button
            onClick={onOpenAddSubjectModal}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <span>+ مادة دراسية</span>
          </button>
          <button
            onClick={lockTeacherPanel}
            className="px-3 py-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
            title="قفل لوحة التحكم بالرمز السري"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>قفل اللوحة</span>
          </button>
        </div>
      </div>

      {/* Tabs Strip */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none text-xs font-bold">
        <button
          onClick={() => setActiveTab('students')}
          className={`px-4 py-2 rounded-xl transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'students' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>بيانات الطلاب كاملة ({users.filter(u => u.role === 'student').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('questions')}
          className={`px-4 py-2 rounded-xl transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'questions' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileQuestion className="w-4 h-4" />
          <span>بنك الأسئلة والامتحانات ({questions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pricing')}
          className={`px-4 py-2 rounded-xl transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'pricing' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>الاشتراكات والأسعار وطرق الدفع</span>
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-4 py-2 rounded-xl transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'reviews' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>تعليقات وآراء الطلاب ({studentReviews.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('booklets')}
          className={`px-4 py-2 rounded-xl transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'booklets' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>الملازم والكتب PDF ({booklets.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'settings' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>إعدادات النظام والرمز السري</span>
        </button>

        <button
          onClick={() => setActiveTab('export_gemini')}
          className={`px-4 py-2 rounded-xl transition-colors cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'export_gemini' ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4 text-emerald-300" />
          <span>تصدير Gemini AI و Vercel</span>
        </button>
      </div>

      {/* TAB 1: COMPLETE STUDENT DATA (قابل للتعديل من لوحة التحكم) */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  سجل بيانات الطلاب المسجلين بالكامل في العراق
                </h3>
                <span className="text-xs text-slate-500">
                  يتضمن الاسم، اليوزرنيم، البريد، آخر ظهور، وقت التسجيل، الدرجات، ونوع الاشتراك (قابل للتعديل)
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-900 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">الاسم واليوزرنيم</th>
                    <th className="p-3.5">البريد الإلكتروني</th>
                    <th className="p-3.5">المحافظة</th>
                    <th className="p-3.5">وقت التسجيل</th>
                    <th className="p-3.5">آخر ظهور</th>
                    <th className="p-3.5">الامتحانات والدرجات</th>
                    <th className="p-3.5">نوع الاشتراك</th>
                    <th className="p-3.5 text-center">تعديل البيانات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map(u => {
                    const studentSubs = submissions.filter(
                      s => s.studentEmail.toLowerCase() === u.email.toLowerCase()
                    );
                    const avg = studentSubs.length > 0
                      ? Math.round(studentSubs.reduce((acc, curr) => acc + curr.percentage, 0) / studentSubs.length)
                      : 0;

                    return (
                      <tr key={u.email} className="hover:bg-indigo-50/30 transition-colors">
                        <td className="p-3.5">
                          <strong className="text-slate-900 block font-bold">{u.name}</strong>
                          <span className="font-mono text-indigo-700 text-[11px]">@{u.username || u.email.split('@')[0]}</span>
                        </td>
                        <td className="p-3.5 font-mono text-slate-600">{u.email}</td>
                        <td className="p-3.5 text-slate-700 font-medium">{u.governorate || 'العراق'}</td>
                        <td className="p-3.5 font-mono text-slate-500 text-[11px]">
                          {new Date(u.registeredAt).toLocaleDateString('ar-EG')}
                        </td>
                        <td className="p-3.5 font-mono text-emerald-700 font-semibold text-[11px]">
                          {new Date(u.lastActiveAt).toLocaleDateString('ar-EG')}
                        </td>
                        <td className="p-3.5">
                          {studentSubs.length > 0 ? (
                            <span className="font-mono font-bold text-slate-900">
                              {studentSubs.length} اختبار (متوسط: {avg}%)
                            </span>
                          ) : (
                            <span className="text-slate-400">لا يوجد اختبارات بعد</span>
                          )}
                        </td>
                        <td className="p-3.5">
                          {u.isVip ? (
                            <span className="px-2.5 py-1 bg-amber-100 text-amber-900 font-bold rounded-lg inline-flex items-center gap-1 text-[11px]">
                              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                              <span>مشترك VIP</span>
                            </span>
                          ) : (
                            <span className="text-slate-400 font-medium">حساب أساسي</span>
                          )}
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => setEditingStudent(u)}
                            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-bold text-xs inline-flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>تعديل الطالب</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: QUESTIONS & EXAMS BANK */}
      {activeTab === 'questions' && (
        <div className="space-y-4">
          {/* Sub-tabs: Questions Bank vs Custom Exams */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setQuestionsSubTab('questions')}
                className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  questionsSubTab === 'questions'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileQuestion className="w-3.5 h-3.5" />
                <span>بنك الأسئلة والتمارين ({questions.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setQuestionsSubTab('exams')}
                className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  questionsSubTab === 'exams'
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>إدارة وتنسيق الامتحانات ({exams.length})</span>
              </button>
            </div>

            {questionsSubTab === 'exams' && (
              <button
                type="button"
                onClick={onOpenCreateExamModal}
                className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إنشاء امتحان مدرسي جديد</span>
              </button>
            )}
          </div>

          {questionsSubTab === 'exams' ? (
            /* EXAMS MANAGEMENT TABLE */
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-900 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">#</th>
                      <th className="p-3.5">عنوان الامتحان</th>
                      <th className="p-3.5">المادة والمرحلة</th>
                      <th className="p-3.5">الفصل / الوحدة</th>
                      <th className="p-3.5">الوقت المتاح</th>
                      <th className="p-3.5">عدد الأسئلة والتسلسل</th>
                      <th className="p-3.5">الحالة</th>
                      <th className="p-3.5 text-center">إجراءات وتنسيق المشرف</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {exams.map((ex, idx) => {
                      const stage = stages.find(s => s.id === ex.stageId);
                      const sub = subjects.find(s => s.id === ex.subjectId);

                      return (
                        <tr key={ex.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="p-3.5 font-mono text-slate-400 font-semibold">{idx + 1}</td>
                          <td className="p-3.5">
                            <strong className="text-slate-900 block font-bold text-sm">{ex.title}</strong>
                            <span className="text-[11px] text-slate-500 line-clamp-1">{ex.description}</span>
                          </td>
                          <td className="p-3.5 whitespace-nowrap">
                            <span className="font-bold text-slate-800 block">{sub?.name}</span>
                            <span className="text-slate-500 text-[11px]">{stage?.shortName}</span>
                          </td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60 block truncate max-w-[140px]">
                              {ex.chapter || 'امتحان شامل'}
                            </span>
                          </td>
                          <td className="p-3.5 font-mono font-bold whitespace-nowrap">
                            {ex.durationMinutes} دقيقة
                          </td>
                          <td className="p-3.5 whitespace-nowrap">
                            <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                              {ex.questionIds.length} سؤال مرتب
                            </span>
                          </td>
                          <td className="p-3.5 whitespace-nowrap">
                            <div className="flex items-center gap-1">
                              {ex.isMinisterial && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">
                                  وزاري
                                </span>
                              )}
                              {ex.isVip && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500 text-white flex items-center gap-0.5">
                                  <Crown className="w-3 h-3" />
                                  <span>VIP</span>
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3.5 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingExam(ex)}
                                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-bold flex items-center gap-1 transition-colors cursor-pointer border border-indigo-200"
                                title="تعديل وتنسيق الامتحان والأسئلة وتقديمها وتأخيرها"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                <span>تعديل الامتحان</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  deleteExam(ex.id);
                                }}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="حذف الامتحان"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* QUESTIONS BANK VIEW */
            <div className="space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-bold text-slate-700">تصفية حسب:</span>
                  <select
                    value={filterSubjectId}
                    onChange={e => setFilterSubjectId(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 font-medium text-slate-800"
                  >
                    <option value="all">كافة المواد المنهجية</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>

                  <select
                    value={filterType}
                    onChange={e => setFilterType(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 font-medium text-slate-800"
                  >
                    <option value="all">كافة أنواع الأسئلة</option>
                    <option value="fill_blank">فراغات تفاعلية ذكية</option>
                    <option value="mcq">اختيار من متعدد</option>
                    <option value="true_false">صح أو خطأ</option>
                    <option value="matching">مطابقة وتوصيل</option>
                  </select>

                  <select
                    value={filterChapter}
                    onChange={e => setFilterChapter(e.target.value)}
                    className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 font-medium text-slate-800"
                  >
                    <option value="all">كافة الفصول والوحدات</option>
                    {questionChapters.map(ch => (
                      <option key={ch} value={ch}>{ch}</option>
                    ))}
                  </select>
                </div>

                <span className="text-slate-500 font-medium">
                  النتائج: <strong className="text-slate-900 font-mono tabular-nums">{filteredQuestions.length}</strong> سؤال
                </span>
              </div>

              {/* Questions Table with Inline VIP Toggle & Edit */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs text-slate-700">
                    <thead className="bg-slate-50 text-slate-900 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3.5">#</th>
                        <th className="p-3.5">نص السؤال</th>
                        <th className="p-3.5">الفصل / الوحدة</th>
                        <th className="p-3.5">المادة والمرحلة</th>
                        <th className="p-3.5">وضع VIP (بنقرة واحدة)</th>
                        <th className="p-3.5">النوع</th>
                        <th className="p-3.5">الإجابة النموذجية المعتمدة</th>
                        <th className="p-3.5">الصعوبة</th>
                        <th className="p-3.5 text-center">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredQuestions.map((q, idx) => {
                        const sub = subjects.find(s => s.id === q.subjectId);
                        const stage = stages.find(s => s.id === q.stageId);

                        return (
                          <tr key={q.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="p-3.5 font-mono text-slate-400 font-semibold">{idx + 1}</td>
                            <td className="p-3.5 font-semibold text-slate-900 max-w-xs" title={q.prompt}>
                              <div className="flex items-center gap-1.5">
                                {q.imageUrl && (
                                  <span className="text-indigo-600 bg-indigo-50 p-1 rounded-md shrink-0" title="يحتوي صورة أو مخطط توضيحي">
                                    <ImageIcon className="w-3.5 h-3.5" />
                                  </span>
                                )}
                                <span className="truncate">{q.prompt}</span>
                              </div>
                            </td>
                            <td className="p-3.5">
                              {q.chapter ? (
                                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/60 block truncate max-w-[140px]" title={q.chapter}>
                                  {q.chapter}
                                </span>
                              ) : (
                                <span className="text-slate-400">غير محدد</span>
                              )}
                            </td>
                            <td className="p-3.5 text-slate-500 whitespace-nowrap">
                              {sub?.name || 'مادة عامة'} ({stage?.shortName || ''})
                            </td>
                            <td className="p-3.5">
                              {/* خيار مقابيل السؤال تفعيل وضع VIP بنقرة واحدة */}
                              <button
                                type="button"
                                onClick={() => toggleQuestionVip(q.id)}
                                title={q.isVip ? 'إلغاء وضع VIP' : 'تفعيل وضع VIP للسؤال'}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                  q.isVip
                                    ? 'bg-amber-100 text-amber-950 border border-amber-300 hover:bg-amber-200'
                                    : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                                }`}
                              >
                                <Crown className={`w-3.5 h-3.5 ${q.isVip ? 'text-amber-600 fill-amber-500' : 'text-slate-400'}`} />
                                <span>{q.isVip ? 'VIP مفعّل' : 'تفعيل VIP'}</span>
                              </button>
                            </td>
                            <td className="p-3.5">
                              <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-800 whitespace-nowrap">
                                {q.type === 'fill_blank' && 'فراغات ذكية'}
                                {q.type === 'mcq' && 'اختيار متعدد'}
                                {q.type === 'true_false' && 'صح/خطأ'}
                                {q.type === 'matching' && 'مطابقة'}
                              </span>
                            </td>
                            <td className="p-3.5 font-mono font-medium text-emerald-800 max-w-[140px] truncate" title={q.correctAnswer}>
                              {q.correctAnswer}
                            </td>
                            <td className="p-3.5">
                              <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium whitespace-nowrap ${
                                q.difficulty === 'ministerial' ? 'bg-amber-100 text-amber-800 font-bold' : 'bg-slate-100 text-slate-700'
                              }`}>
                                {q.difficulty}
                              </span>
                            </td>
                            <td className="p-3.5 text-center whitespace-nowrap">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  onClick={() => setEditingQuestion(q)}
                                  title="تعديل السؤال"
                                  className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => deleteQuestion(q.id)}
                                  title="حذف السؤال"
                                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SUBSCRIPTIONS, PRICING & PAYMENT SETTINGS (قابلة للتعديل بالكامل) */}
      {activeTab === 'pricing' && (
        <div className="space-y-6">
          {/* Plans Cards */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  باقات واشتراكات الطلاب والأسعار (بالدينار العراقي IQD)
                </h3>
                <p className="text-xs text-slate-500">يمكنك تعديل الأسعار والمسميات والمميزات وحالة تفعيل كل باقة</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {subscriptionPlans.map((plan) => (
                <div key={plan.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between gap-4">
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                        {plan.durationText}
                      </span>
                      <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 font-semibold">
                        <input
                          type="checkbox"
                          checked={plan.isActive}
                          onChange={e => updateSubscriptionPlan(plan.id, { isActive: e.target.checked })}
                          className="rounded text-emerald-600"
                        />
                        <span>مفعلة</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-slate-500 font-semibold mb-1">اسم الباقة:</label>
                      <input
                        type="text"
                        value={plan.name}
                        onChange={e => updateSubscriptionPlan(plan.id, { name: e.target.value })}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 font-semibold mb-1">السعر بالدينار العراقي (IQD):</label>
                      <div className="relative">
                        <input
                          type="number"
                          step={1000}
                          value={plan.priceIQD}
                          onChange={e => updateSubscriptionPlan(plan.id, { priceIQD: Number(e.target.value) })}
                          className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 text-sm"
                        />
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">د.ع</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-500 font-semibold mb-1">وصف الباقة:</label>
                      <textarea
                        rows={2}
                        value={plan.description}
                        onChange={e => updateSubscriptionPlan(plan.id, { description: e.target.value })}
                        className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-700"
                      />
                    </div>
                  </div>

                  <span className="text-[11px] text-emerald-700 font-semibold">
                    ✓ التحديث يُحفظ تلقائياً في النظام
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods Settings (ZainCash, Qi Card, etc.) */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <CreditCard className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  إعدادات طرق الدفع في العراق (زين كاش، كي كارد، كارتات الرصيد)
                </h3>
                <p className="text-xs text-slate-500">
                  تعديل أرقام المحافظ وحسابات التحويل التي تظهر للطلبة عند رغبتهم بترقية الحساب
                </p>
              </div>
            </div>

            <form onSubmit={handleSavePaymentSettings} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    رقم محفظة زين كاش (ZainCash):
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={editPayment.zainCashNumber}
                    onChange={e => setEditPayment({ ...editPayment, zainCashNumber: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    اسم صاحب محفظة زين كاش:
                  </label>
                  <input
                    type="text"
                    value={editPayment.zainCashHolder}
                    onChange={e => setEditPayment({ ...editPayment, zainCashHolder: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    رقم حساب الماستر كارد / الكي كارد (Qi Card):
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={editPayment.qiCardNumber}
                    onChange={e => setEditPayment({ ...editPayment, qiCardNumber: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    رقم تحويل الرصيد (آسياسيل / كورك):
                  </label>
                  <input
                    type="text"
                    value={editPayment.asiaCellNumber}
                    onChange={e => setEditPayment({ ...editPayment, asiaCellNumber: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  رقم الواتساب لاستلام إشعارات التحويل والتفعيل الفوري:
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={editPayment.whatsappContact}
                  onChange={e => setEditPayment({ ...editPayment, whatsappContact: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 font-bold max-w-sm"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  تعليمات التحويل للطلبة:
                </label>
                <textarea
                  rows={3}
                  value={editPayment.instructions}
                  onChange={e => setEditPayment({ ...editPayment, instructions: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                {paymentSavedMsg && (
                  <span className="text-emerald-700 font-bold flex items-center gap-1 text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تم حفظ إعدادات الدفع بنجاح!</span>
                  </span>
                )}
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-xs cursor-pointer transition-colors"
                >
                  حفظ وتطبيق إعدادات الدفع
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: STUDENT REVIEWS MANAGEMENT */}
      {activeTab === 'reviews' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                إدارة تقييمات وتعليقات الطلبة ({studentReviews.length})
              </h3>
              <p className="text-xs text-slate-500">
                يمكنك الموافقة على نشر التقييمات، تثبيتها في الواجهة الرئيسية، أو حذفها
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {studentReviews.map((rev) => (
              <div
                key={rev.id}
                className={`p-4 rounded-2xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  rev.isApproved ? 'bg-white border-slate-200' : 'bg-amber-50/50 border-amber-200'
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <strong className="text-sm font-bold text-slate-900">{rev.studentName}</strong>
                    <span className="font-mono text-slate-400">@{rev.username}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-600 font-medium">{rev.governorate}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-emerald-700 font-medium">{rev.gradeName}</span>
                    <div className="flex items-center mr-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3 h-3 ${s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-slate-800 font-medium leading-relaxed">
                    «{rev.comment}»
                  </p>

                  <span className="text-[10px] text-slate-400 block font-mono">
                    {new Date(rev.createdAt).toLocaleDateString('ar-EG')}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => approveReview(rev.id, !rev.isApproved)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                      rev.isApproved
                        ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {rev.isApproved ? 'إلغاء النشر' : 'موافقة ونشر في الواجهة'}
                  </button>

                  <button
                    onClick={() => toggleFeatureReview(rev.id)}
                    className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-semibold cursor-pointer ${
                      rev.isFeatured ? 'bg-amber-50 border-amber-300 text-amber-800' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    {rev.isFeatured ? '★ مثبت' : 'تثبيت'}
                  </button>

                  <button
                    onClick={() => deleteReview(rev.id)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="حذف التقييم"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4.5: STUDY BOOKLETS MANAGEMENT (نشر الملازم لـ PDF) */}
      {activeTab === 'booklets' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                إدارة ونشر الملازم والكتب الدراسية بصيغة PDF ({booklets.length})
              </h3>
              <p className="text-xs text-slate-500">
                يمكنك رفع وتعديل روابط الملازم، متابعة عدد التحميلات، وتخصيص ملازم لمشتركي VIP
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-900 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">عنوان الملزمة</th>
                  <th className="p-3.5">الفصل الدراسي</th>
                  <th className="p-3.5">المادة والمرحلة</th>
                  <th className="p-3.5">الأستاذ المعد</th>
                  <th className="p-3.5">الصفحات</th>
                  <th className="p-3.5">التحميلات</th>
                  <th className="p-3.5">الحالة</th>
                  <th className="p-3.5 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {booklets.map((b) => {
                  const sub = subjects.find(s => s.id === b.subjectId);
                  const stage = stages.find(s => s.id === b.stageId);

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900 max-w-xs truncate" title={b.title}>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-emerald-700 shrink-0" />
                          <span className="truncate">{b.title}</span>
                        </div>
                      </td>
                      <td className="p-3.5 text-slate-700 font-medium">
                        {b.chapter}
                      </td>
                      <td className="p-3.5 text-slate-500">
                        {sub?.name || 'عام'} ({stage?.shortName || ''})
                      </td>
                      <td className="p-3.5 text-slate-700">
                        {b.authorTeacher}
                      </td>
                      <td className="p-3.5 font-mono text-slate-600">
                        {b.pageCount} ص
                      </td>
                      <td className="p-3.5 font-mono font-bold text-emerald-800">
                        {b.downloadCount.toLocaleString('ar-IQ')}
                      </td>
                      <td className="p-3.5">
                        {b.isVipOnly ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-900 flex items-center gap-1 w-max">
                            <Crown className="w-3 h-3 text-amber-600" />
                            <span>VIP فقط</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 w-max block">
                            مجانية للجميع
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <a
                            href={b.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title="معاينة ملف PDF"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => {
                              if (confirm(`هل أنت متأكد من حذف ملزمة: «${b.title}»؟`)) {
                                deleteBooklet(b.id);
                              }
                            }}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="حذف الملزمة"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: SYSTEM & SECURITY SETTINGS (الرمز السري والإعدادات المهمة) */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Change PIN Passcode */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <KeyRound className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  تغيير الرمز السري للوحة التحكم
                </h3>
                <p className="text-xs text-slate-500">
                  تعيين رمز سري جديد لحماية الدخول إلى لوحة المدرس والإدارة
                </p>
              </div>
            </div>

            <form onSubmit={handleChangePasscode} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">الرمز السري الحالي:</label>
                <input
                  type="password"
                  required
                  placeholder="••••"
                  value={currentPin}
                  onChange={e => setCurrentPin(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-center text-lg font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الرمز السري الجديد (4 أرقام على الأقل):</label>
                <input
                  type="password"
                  required
                  placeholder="الرمز الجديد"
                  value={newPin}
                  onChange={e => setNewPin(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-center text-lg font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">تأكيد الرمز السري الجديد:</label>
                <input
                  type="password"
                  required
                  placeholder="أعد كتابة الرمز الجديد"
                  value={confirmNewPin}
                  onChange={e => setConfirmNewPin(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-center text-lg font-bold"
                />
              </div>

              {pinChangeStatus && (
                <div className={`p-2.5 rounded-xl font-bold text-center ${
                  pinChangeStatus.success ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                }`}>
                  {pinChangeStatus.message}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all shadow-xs cursor-pointer"
              >
                حفظ الرمز السري الجديد
              </button>
            </form>
          </div>

          {/* Platform General Settings */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Settings className="w-5 h-5 text-emerald-600" />
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  إعدادات المنصة والمعهد في العراق
                </h3>
                <p className="text-xs text-slate-500">
                  تخصيص اسم المنصة وهواتف الدعم والتواصل
                </p>
              </div>
            </div>

            <form onSubmit={handleSavePlatformSettings} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم المنصة التعليمية / المعهد:</label>
                <input
                  type="text"
                  required
                  value={instituteName}
                  onChange={e => setInstituteName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">رقم هاتف الدعم والاستفسارات (العراق):</label>
                <input
                  type="text"
                  dir="ltr"
                  value={supportPhone}
                  onChange={e => setSupportPhone(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block">خيارات النظام الذكي:</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={adminSettings.fuzzyToleranceEnabled}
                    onChange={e => updateAdminSettings({ fuzzyToleranceEnabled: e.target.checked })}
                    className="rounded text-emerald-600"
                  />
                  <span>تفعيل التصحيح الذكي التسامحي للأخطاء الإملائية البسيطة في الفراغات</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={adminSettings.allowPublicReviews}
                    onChange={e => updateAdminSettings({ allowPublicReviews: e.target.checked })}
                    className="rounded text-emerald-600"
                  />
                  <span>السماح للطلبة بإرسال آراء وتقييمات للمنصة</span>
                </label>
              </div>

              {settingsSavedMsg && (
                <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl font-bold text-center">
                  تم حفظ وتطبيق إعدادات المنصة بنجاح!
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-xs cursor-pointer"
              >
                تحديث إعدادات المنصة
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 6: CLOUD DEPLOY, GITHUB & GEMINI AI */}
      {activeTab === 'export_gemini' && (
        <div className="space-y-6">
          <div className="bg-linear-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/30 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-indigo-300" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    نسخة إرسال وتوليد الأسئلة لجمهورية العراق عبر Gemini AI
                  </h3>
                  <span className="text-xs text-indigo-200">
                    انسخ هذا البرومبت المخصص وضعه في Google Gemini لتوليد أسئلة ومناهج وزارية عراقية فورية
                  </span>
                </div>
              </div>

              <button
                onClick={handleCopyGeminiPrompt}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                {copiedGeminiPrompt ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedGeminiPrompt ? 'تم نسخ البرومبت بنجاح!' : 'نسخ برومبت الجيميني'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-950/70 border border-indigo-500/20 text-xs font-mono text-indigo-100 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-48">
              {generateGeminiPrompt()}
            </pre>
          </div>

          {/* Backup Export/Import */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-emerald-600" />
                <h4 className="text-sm font-bold text-slate-900">تصدير كامل بيانات التطبيق (JSON)</h4>
              </div>
              <p className="text-xs text-slate-500">
                حفظ نسخة احتياطية من كافة المناهج والمواد والأسئلة والأسعار وبيانات الطلاب.
              </p>
              <button
                onClick={handleCopyJson}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {copiedJson ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedJson ? 'تم نسخ بيانات JSON بنجاح!' : 'نسخ ملف JSON الاحتياطي'}</span>
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-600" />
                <h4 className="text-sm font-bold text-slate-900">استيراد بيانات أو أسئلة جديدة</h4>
              </div>
              <textarea
                rows={2}
                placeholder="الصق كود الـ JSON هنا للاستيراد الفوري..."
                value={importText}
                onChange={e => setImportText(e.target.value)}
                className="w-full p-2.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl"
              />
              <button
                onClick={handleImport}
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                تنفيذ الاستيراد وتحديث المنصة
              </button>
              {importStatus && (
                <p className="text-[11px] font-semibold text-emerald-700">{importStatus}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Student Edit Modal */}
      {editingStudent && (
        <EditStudentModal
          student={editingStudent}
          onClose={() => setEditingStudent(null)}
        />
      )}

      {/* Question Edit Modal */}
      {editingQuestion && (
        <EditQuestionModal
          question={editingQuestion}
          onClose={() => setEditingQuestion(null)}
        />
      )}

      {/* Exam Edit Modal */}
      {editingExam && (
        <EditExamModal
          exam={editingExam}
          onClose={() => setEditingExam(null)}
        />
      )}
    </div>
  );
};
