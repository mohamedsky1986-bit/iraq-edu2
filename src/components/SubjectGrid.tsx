/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Calculator,
  Zap,
  FlaskConical,
  HeartPulse,
  BookOpen,
  Languages,
  Atom,
  Dna,
  BookMarked,
  Microscope,
  FileQuestion,
  PlayCircle,
  Award,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { Subject, Exam } from '../types/curriculum';
import { useCurriculum } from '../context/CurriculumContext';

interface SubjectGridProps {
  selectedSubjectId: string | null;
  onSelectSubject: (subjectId: string | null) => void;
  onStartExam: (exam: Exam) => void;
  onViewLessons: (subjectId: string) => void;
}

// Icon mapper for dynamic subject icons
const getSubjectIcon = (iconName: string) => {
  switch (iconName) {
    case 'Calculator': return Calculator;
    case 'Zap': return Zap;
    case 'FlaskConical': return FlaskConical;
    case 'HeartPulse': return HeartPulse;
    case 'BookOpen': return BookOpen;
    case 'Languages': return Languages;
    case 'Atom': return Atom;
    case 'Dna': return Dna;
    case 'BookMarked': return BookMarked;
    case 'Microscope': return Microscope;
    default: return BookOpen;
  }
};

export const SubjectGrid: React.FC<SubjectGridProps> = ({
  selectedSubjectId,
  onSelectSubject,
  onStartExam,
  onViewLessons
}) => {
  const { subjects, selectedStageId, questions, exams, lessons } = useCurriculum();

  const stageSubjects = subjects.filter(sub => sub.stageId === selectedStageId);

  if (stageSubjects.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center my-6">
        <p className="text-slate-600 text-sm">
          لم يتم العثور على مواد مسجلة لهذا الصف حتى الآن. يمكن للمدرس إضافة مادة جديدة من الزر أعلاه.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Subjects Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stageSubjects.map(subject => {
          const IconComponent = getSubjectIcon(subject.iconName);
          const isSelected = selectedSubjectId === subject.id;
          const subjectQuestions = questions.filter(q => q.subjectId === subject.id);
          const subjectExams = exams.filter(e => e.subjectId === subject.id);
          const subjectLessons = lessons.filter(l => l.subjectId === subject.id);

          return (
            <div
              key={subject.id}
              onClick={() => onSelectSubject(isSelected ? null : subject.id)}
              className={`rounded-2xl p-5 border text-right transition-all cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'bg-emerald-50/70 border-emerald-500 shadow-sm ring-1 ring-emerald-500'
                  : 'bg-white border-slate-200/90 hover:border-emerald-300 hover:shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
                  <IconComponent className="w-6 h-6 text-emerald-700" />
                </div>
                {subject.isCustom && (
                  <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    مادة مضافة
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-slate-900 mb-1">{subject.name}</h3>
              <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                {subject.description}
              </p>

              {/* Counts metadata without pill badges */}
              <div className="flex items-center gap-2 text-xs text-slate-500 border-t border-slate-100 pt-3 mb-3">
                <span className="font-medium text-slate-700">
                  <strong className="font-mono tabular-nums">{subjectQuestions.length}</strong> سؤال
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  <strong className="font-mono tabular-nums">{subjectExams.length}</strong> امتحان
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  <strong className="font-mono tabular-nums">{subjectLessons.length}</strong> شروحات
                </span>
              </div>

              {/* Action buttons inside card */}
              <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                {subjectExams.length > 0 ? (
                  <button
                    onClick={() => onStartExam(subjectExams[0])}
                    className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <PlayCircle className="w-3.5 h-3.5" />
                    <span>بدء الامتحان ({subjectExams[0].durationMinutes} د)</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onSelectSubject(subject.id)}
                    className="flex-1 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>استعراض بنك الأسئلة</span>
                  </button>
                )}

                <button
                  onClick={() => onViewLessons(subject.id)}
                  title="استعراض شروحات الكتاب وفيديوهات الشرح"
                  className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-slate-600" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* When a subject is explicitly selected: Show its specific exams & question previews */}
      {selectedSubjectId && (
        <SelectedSubjectDetails
          subjectId={selectedSubjectId}
          onStartExam={onStartExam}
          onViewLessons={onViewLessons}
        />
      )}
    </div>
  );
};

interface SelectedSubjectDetailsProps {
  subjectId: string;
  onStartExam: (exam: Exam) => void;
  onViewLessons: (subjectId: string) => void;
}

const SelectedSubjectDetails: React.FC<SelectedSubjectDetailsProps> = ({
  subjectId,
  onStartExam,
  onViewLessons
}) => {
  const { subjects, questions, exams, currentUser } = useCurriculum();
  const subject = subjects.find(s => s.id === subjectId);
  if (!subject) return null;

  const subjectExams = exams.filter(e => e.subjectId === subjectId);
  const subjectQuestions = questions.filter(q => q.subjectId === subjectId);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs mt-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <span className="text-xs text-emerald-700 font-semibold uppercase tracking-wider block">
            المحتوى التفصيلي لمادة
          </span>
          <h3 className="text-xl font-bold text-slate-900">{subject.name}</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewLessons(subjectId)}
            className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>عرض شروحات وكتب المادة</span>
          </button>
        </div>
      </div>

      {/* Exams list */}
      <div>
        <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Award className="w-4 h-4 text-emerald-600" />
          <span>الامتحانات والاختبارات التفاعلية المتاحة:</span>
        </h4>

        {subjectExams.length === 0 ? (
          <p className="text-xs text-slate-500 py-3">لا توجد امتحانات مجهزة حالياً لهذه المادة.</p>
        ) : (
          <div className="space-y-3">
            {subjectExams.map(exam => {
              const isLockedForNonVip = exam.isVip && !currentUser.isVip;

              return (
                <div
                  key={exam.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h5 className="text-sm font-bold text-slate-900">{exam.title}</h5>
                      {exam.isVip && (
                        <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          VIP حصري
                        </span>
                      )}
                      {exam.isMinisterial && (
                        <span className="text-[11px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                          وزاري
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{exam.description}</p>
                    <div className="text-xs text-slate-400">
                      المدة: <strong className="text-slate-600 font-mono tabular-nums">{exam.durationMinutes}</strong> دقيقة · عدد الأسئلة: <strong className="text-slate-600 font-mono tabular-nums">{exam.questionIds.length}</strong>
                    </div>
                  </div>

                  <button
                    onClick={() => onStartExam(exam)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                      isLockedForNonVip
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {isLockedForNonVip ? (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>فتح باشتراك VIP</span>
                      </>
                    ) : (
                      <>
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>بدء الاختبار الآن</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Question preview bank */}
      <div>
        <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <FileQuestion className="w-4 h-4 text-emerald-600" />
          <span>نماذج من بنك الأسئلة للمادة ({subjectQuestions.length} سؤال):</span>
        </h4>
        <div className="space-y-2">
          {subjectQuestions.slice(0, 3).map((q, idx) => (
            <div key={q.id} className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
              <span className="font-mono text-emerald-700 font-semibold">{idx + 1}.</span>
              <div className="flex-1">
                <p className="font-medium text-slate-800">{q.prompt}</p>
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  النوع: {q.type === 'fill_blank' ? 'فراغات تفاعلية ذكية' : q.type === 'mcq' ? 'اختيار من متعدد' : q.type === 'true_false' ? 'صح أو خطأ' : 'مطابقة وتوصيل'} · الصعوبة: {q.difficulty}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
