/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Star, MessageSquarePlus, CheckCircle2, MapPin, User, Send, Sparkles } from 'lucide-react';
import { useCurriculum } from '../context/CurriculumContext';

const IRAQI_GOVERNORATES = [
  'بغداد - الكرخ',
  'بغداد - الرصافة',
  'البصرة',
  'النجف الأشرف',
  'كربلاء المقدسة',
  'نينوى (الموصل)',
  'أربيل',
  'بابل (الحلة)',
  'ذي قار (الناصرية)',
  'الأنبار',
  'كركوك',
  'ديالى',
  'صلاح الدين (تكريت)',
  'واسط (الكوت)',
  'ميسان (العمارة)',
  'المثنى (السماوة)',
  'القادسية (الديوانية)',
  'السليمانية',
  'دهوك'
];

export const StudentReviewsSection: React.FC = () => {
  const { studentReviews, addStudentReview, currentUser, stages, selectedStageId } = useCurriculum();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [governorate, setGovernorate] = useState(currentUser.governorate || 'بغداد - الكرخ');
  const [submittedMessage, setSubmittedMessage] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const activeStage = stages.find(s => s.id === selectedStageId) || stages[0];

  // Only show approved reviews to the public
  const approvedReviews = studentReviews.filter(r => r.isApproved);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    addStudentReview({
      studentName: currentUser.name,
      username: currentUser.username || currentUser.email.split('@')[0],
      studentEmail: currentUser.email,
      governorate,
      gradeName: activeStage.shortName,
      rating,
      comment: comment.trim(),
      isFeatured: false
    });

    setComment('');
    setSubmittedMessage(true);
    setTimeout(() => {
      setSubmittedMessage(false);
      setIsFormOpen(false);
    }, 3500);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>آراء وتقييمات طلبة العراق</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            تجارب الطلبة المتفوقين في الامتحانات المدرسية والوزارية
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            تقييمات موثقة من طلبة المتوسطة والإعدادية في كافة محافظات العراق
          </p>
        </div>

        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs whitespace-nowrap"
        >
          <MessageSquarePlus className="w-4 h-4" />
          <span>{isFormOpen ? 'إغلاق نموذج الرأي' : 'أضف رأيك وتقييمك للمنصة'}</span>
        </button>
      </div>

      {/* Review Submission Form */}
      {isFormOpen && (
        <form onSubmit={handleSubmitReview} className="bg-slate-50/80 rounded-2xl border border-emerald-200 p-5 space-y-4 text-xs">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-bold text-slate-900 text-sm">مشاركة تجربتك مع أساتذة وطلبة المنصة:</h4>
            <div className="flex items-center gap-1">
              <span className="text-slate-500 font-semibold ml-2">تقييمك:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                >
                  <Star className={`w-5 h-5 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-bold mb-1">اسم الطالب:</label>
              <input
                type="text"
                disabled
                value={currentUser.name}
                className="w-full p-2.5 bg-slate-200/70 border border-slate-300 rounded-xl text-slate-700 font-medium cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">المحافظة في العراق:</label>
              <select
                value={governorate}
                onChange={e => setGovernorate(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-semibold text-slate-800"
              >
                {IRAQI_GOVERNORATES.map(gov => (
                  <option key={gov} value={gov}>{gov}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">المرحلة الدراسية:</label>
              <input
                type="text"
                disabled
                value={activeStage.name}
                className="w-full p-2.5 bg-slate-200/70 border border-slate-300 rounded-xl text-slate-700 font-medium cursor-not-allowed"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">اكتب رأيك بالتطبيق والاختبارات والشروحات:</label>
            <textarea
              rows={3}
              required
              placeholder="اكتب كيف ساعدتك الاختبارات والشروحات والتصحيح الذكي في تحصيلك الدراسي..."
              value={comment}
              onChange={e => setComment(e.target.value)}
              className="w-full p-3 bg-white border border-slate-300 rounded-xl text-slate-900 font-medium leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <span className="text-[11px] text-slate-500">
              * يتم مراجعة التقييم ونشره فوراً بعد موافقة مشرف المنصة لضمان جودة المحتوى التربوي.
            </span>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>إرسال التقييم للمشرف</span>
            </button>
          </div>

          {submittedMessage && (
            <div className="p-3 bg-emerald-100 text-emerald-900 rounded-xl font-bold text-center flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>شكراً لك! تم إرسال تقييمك للمشرف بنجاح وسيظهر في الواجهة بعد اعتماده.</span>
            </div>
          )}
        </form>
      )}

      {/* Reviews Cards Grid */}
      {approvedReviews.length === 0 ? (
        <div className="text-center py-8 text-slate-500 text-xs">
          لا توجد تقييمات منشورة حتى الآن. كن أول من يشارك رأيه!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {approvedReviews.map((rev) => (
            <div
              key={rev.id}
              className="p-5 rounded-2xl border border-slate-200/90 bg-white hover:border-emerald-300 transition-all flex flex-col justify-between gap-3 shadow-2xs"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                      {rev.studentName.slice(0, 1)}
                    </div>
                    <div>
                      <strong className="text-xs font-bold text-slate-900 block leading-tight">{rev.studentName}</strong>
                      <span className="text-[10px] text-slate-400 font-mono">@{rev.username}</span>
                    </div>
                  </div>

                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  «{rev.comment}»
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                <span className="flex items-center gap-1 text-slate-600">
                  <MapPin className="w-3 h-3 text-emerald-600" />
                  <span>{rev.governorate}</span>
                </span>
                <span>{rev.gradeName}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
