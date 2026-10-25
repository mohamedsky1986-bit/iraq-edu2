/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Award, PlayCircle, Timer, FileQuestion, Sparkles, BookOpen } from 'lucide-react';
import { useCurriculum } from '../context/CurriculumContext';
import { Exam } from '../types/curriculum';

interface MinisterialExamsViewProps {
  onStartExam: (exam: Exam) => void;
  onOpenVip: () => void;
}

export const MinisterialExamsView: React.FC<MinisterialExamsViewProps> = ({
  onStartExam,
  onOpenVip
}) => {
  const { exams, subjects, stages, selectedStageId, currentUser } = useCurriculum();

  // All ministerial or comprehensive exams
  const ministerialExams = exams.filter(e => e.isMinisterial || e.isComprehensive);

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-linear-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
            <Award className="w-4 h-4" />
            <span>محاكاة الامتحانات الوزارية والبكالوريا الرسمية</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black leading-tight">
            الامتحانات الشاملة والوزارية لمدارس جمهورية العراق
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            اختبارات محددة بوقت زمني تحاكي بدقة أسئلة البكالوريا لوزارة التربية العراقية، مع تصحيح ذكي لأسئلة الفراغات يتسامح مع الأخطاء الإملائية البسيطة ويعلمك الإجابة النموذجية المعتمدة في مركز الفحص.
          </p>
        </div>
      </div>

      {/* Grid of Ministerial Exams */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ministerialExams.map(exam => {
          const sub = subjects.find(s => s.id === exam.subjectId);
          const stage = stages.find(s => s.id === exam.stageId);
          const isLockedForNonVip = exam.isVip && !currentUser.isVip;

          return (
            <div
              key={exam.id}
              className="bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-400 p-6 shadow-xs transition-all flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md">
                    {stage?.name || 'مرحلة وزارية'}
                  </span>
                  {exam.isVip ? (
                    <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>VIP حصري</span>
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-slate-500">
                      متاح مجاناً
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {exam.title}
                </h3>

                <p className="text-xs text-slate-500 leading-relaxed">
                  {exam.description}
                </p>

                <div className="flex items-center gap-3 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    <span>المادة: <strong>{sub?.name || 'عام'}</strong></span>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1 font-mono">
                    <Timer className="w-3.5 h-3.5 text-slate-400" />
                    <span>المدة: <strong>{exam.durationMinutes}</strong> دقيقة</span>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="flex items-center gap-1 font-mono">
                    <FileQuestion className="w-3.5 h-3.5 text-slate-400" />
                    <span><strong>{exam.questionIds.length}</strong> أسئلة</span>
                  </span>
                </div>
              </div>

              <div>
                <button
                  onClick={() => {
                    if (isLockedForNonVip) {
                      onOpenVip();
                    } else {
                      onStartExam(exam);
                    }
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
                    isLockedForNonVip
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {isLockedForNonVip ? (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>فتح الامتحان الشامل باشتراك VIP</span>
                    </>
                  ) : (
                    <>
                      <PlayCircle className="w-4 h-4" />
                      <span>بدء الامتحان الوزاري التفاعلي</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
