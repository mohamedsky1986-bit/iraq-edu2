/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Award,
  CheckSquare,
  Square,
  Clock,
  FileQuestion,
  ChevronUp,
  ChevronDown,
  Layers,
  ArrowUpDown,
  BookOpen
} from 'lucide-react';
import { useCurriculum } from '../context/CurriculumContext';

interface CreateExamModalProps {
  onClose: () => void;
}

export const CreateExamModal: React.FC<CreateExamModalProps> = ({ onClose }) => {
  const { stages, subjects, selectedStageId, questions, addExam } = useCurriculum();

  const [stageId, setStageId] = useState(selectedStageId);
  const stageSubjects = subjects.filter(s => s.stageId === stageId);
  const [subjectId, setSubjectId] = useState(stageSubjects[0]?.id || subjects[0]?.id || '');

  const [title, setTitle] = useState('');
  const [chapter, setChapter] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(25);
  const [isMinisterial, setIsMinisterial] = useState(true);
  const [isVip, setIsVip] = useState(false);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [chapterFilter, setChapterFilter] = useState<string>('all');

  // Extract distinct chapters for the chosen subject
  const availableChapters = Array.from(
    new Set(
      questions
        .filter(q => q.stageId === stageId && q.subjectId === subjectId && q.chapter)
        .map(q => q.chapter as string)
    )
  );

  // Available questions filtered by stage, subject, and chapter
  const availableQuestions = questions.filter(q => {
    if (q.stageId !== stageId) return false;
    if (q.subjectId !== subjectId) return false;
    if (chapterFilter !== 'all' && q.chapter !== chapterFilter) return false;
    return true;
  });

  const toggleQuestionSelect = (qId: string) => {
    setSelectedQuestionIds(prev =>
      prev.includes(qId) ? prev.filter(id => id !== qId) : [...prev, qId]
    );
  };

  const selectAllFiltered = () => {
    const toAdd = availableQuestions.map(q => q.id).filter(id => !selectedQuestionIds.includes(id));
    setSelectedQuestionIds(prev => [...prev, ...toAdd]);
  };

  const deselectAllFiltered = () => {
    const idsToRemove = availableQuestions.map(q => q.id);
    setSelectedQuestionIds(prev => prev.filter(id => !idsToRemove.includes(id)));
  };

  // تقديم وتأخير ترتيب الأسئلة
  const moveQuestionUp = (index: number) => {
    if (index === 0) return;
    setSelectedQuestionIds(prev => {
      const next = [...prev];
      const temp = next[index - 1];
      next[index - 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const moveQuestionDown = (index: number) => {
    if (index >= selectedQuestionIds.length - 1) return;
    setSelectedQuestionIds(prev => {
      const next = [...prev];
      const temp = next[index + 1];
      next[index + 1] = next[index];
      next[index] = temp;
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const finalQuestionIds = selectedQuestionIds.length > 0
      ? selectedQuestionIds
      : availableQuestions.map(q => q.id);

    if (finalQuestionIds.length === 0) {
      alert('يرجى اختيار أو إضافة سؤال واحد على الأقل للمادة لإنشاء الامتحان.');
      return;
    }

    addExam({
      stageId,
      subjectId,
      title: title.trim(),
      chapter: chapter.trim() || undefined,
      description: description.trim() || 'امتحان شامل وفق معايير وزارة التربية العراقية.',
      durationMinutes: Number(durationMinutes) || 20,
      questionIds: finalQuestionIds,
      isComprehensive: finalQuestionIds.length >= 2,
      isMinisterial,
      isVip
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-emerald-50/70 border-b border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-700" />
            <h3 className="text-base font-bold text-slate-900">إنشاء وتخصيص امتحان مدرسي (مع تقديم وتأخير الأسئلة)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {/* Stage & Subject */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">المرحلة والصف الدراسي:</label>
              <select
                value={stageId}
                onChange={e => {
                  setStageId(e.target.value);
                  const valid = subjects.filter(s => s.stageId === e.target.value);
                  if (valid.length > 0) setSubjectId(valid[0].id);
                  setSelectedQuestionIds([]);
                  setChapterFilter('all');
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800"
              >
                {stages.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">المادة الدراسية للامتحان:</label>
              <select
                value={subjectId}
                onChange={e => {
                  setSubjectId(e.target.value);
                  setSelectedQuestionIds([]);
                  setChapterFilter('all');
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800"
              >
                {stageSubjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Exam Title, Chapter & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">عنوان الامتحان المعتمد:</label>
              <input
                type="text"
                required
                placeholder="مثال: الامتحان الوزاري الشامل: الفيزياء (الدور الأول)"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">وقت الامتحان (بالدقائق):</label>
              <div className="relative">
                <input
                  type="number"
                  min={5}
                  max={180}
                  required
                  value={durationMinutes}
                  onChange={e => setDurationMinutes(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 pl-8"
                />
                <Clock className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Chapter input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">تحديد الفصل الدراسي المستهدف (اختياري):</label>
              <input
                type="text"
                placeholder="مثال: الفصل الأول: الكهربائية الساكنة"
                value={chapter}
                onChange={e => setChapter(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">تصفية بنك الأسئلة حسب الفصل:</label>
              <select
                value={chapterFilter}
                onChange={e => setChapterFilter(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-medium text-slate-800"
              >
                <option value="all">كافة الفصول والوحدات ({availableQuestions.length} سؤال)</option>
                {availableChapters.map(chap => (
                  <option key={chap} value={chap}>{chap}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">توجيهات أو رسالة الامتحان للطلبة:</label>
            <textarea
              rows={2}
              placeholder="توجيهات تشجيعية للطلبة قبل بدء الامتحان..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
            />
          </div>

          {/* Question Selector Deck */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <FileQuestion className="w-4 h-4 text-emerald-700" />
                <span className="font-bold text-slate-800">
                  تحديد أسئلة الامتحان من بنك الأسئلة ({selectedQuestionIds.length} محددة):
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={selectAllFiltered}
                  className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-emerald-700 font-semibold hover:bg-slate-100 cursor-pointer"
                >
                  تحديد المعروض
                </button>
                <button
                  type="button"
                  onClick={deselectAllFiltered}
                  className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-600 font-semibold hover:bg-slate-100 cursor-pointer"
                >
                  إلغاء المعروض
                </button>
              </div>
            </div>

            {/* Questions List with Quick Selection */}
            {availableQuestions.length === 0 ? (
              <p className="text-slate-500 py-3 text-center">
                لا توجد أسئلة مسجلة مطابقة لهذا التصنيف. يمكنك إضافة أسئلة من تبويب بنك الأسئلة.
              </p>
            ) : (
              <div className="max-h-44 overflow-y-auto space-y-2 pr-1">
                {availableQuestions.map((q) => {
                  const isChecked = selectedQuestionIds.includes(q.id);
                  return (
                    <div
                      key={q.id}
                      onClick={() => toggleQuestionSelect(q.id)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-emerald-50 border-emerald-400'
                          : 'bg-white border-slate-200 hover:bg-slate-100/70'
                      }`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-emerald-700 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <span className="font-medium text-slate-900 leading-snug line-clamp-1">{q.prompt}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {q.chapter && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-mono">
                            {q.chapter.split(':')[0]}
                          </span>
                        )}
                        <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-slate-100 text-slate-700">
                          {q.type === 'fill_blank' ? 'فراغ ذكي' : q.type === 'mcq' ? 'خيارات' : 'صح/خطأ'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Selected Questions Order &تقديم وتأخير Manager */}
          {selectedQuestionIds.length > 0 && (
            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-emerald-800" />
                  <span className="font-bold text-emerald-950">
                    ترتيب تسلسل الأسئلة في الاختبار (تقديم ▲ وتأخير ▼):
                  </span>
                </div>
                <span className="text-[11px] text-emerald-800 font-medium">
                  {selectedQuestionIds.length} سؤال بالترتيب المحدد
                </span>
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {selectedQuestionIds.map((qId, idx) => {
                  const questionObj = questions.find(q => q.id === qId);
                  if (!questionObj) return null;

                  return (
                    <div
                      key={qId}
                      className="p-2 bg-white rounded-xl border border-emerald-200/80 flex items-center justify-between gap-2 shadow-2xs"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className="w-6 h-6 rounded-lg bg-emerald-700 text-white font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-medium text-slate-900 truncate">
                          {questionObj.prompt}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {/* تقديم (Move up) */}
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveQuestionUp(idx)}
                          title="تقديم السؤال للأعلى"
                          className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-0.5 cursor-pointer ${
                            idx === 0
                              ? 'text-slate-300 border-slate-200 bg-slate-50 cursor-not-allowed'
                              : 'text-emerald-800 bg-emerald-50 border-emerald-300 hover:bg-emerald-100'
                          }`}
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                          <span>تقديم</span>
                        </button>

                        {/* تأخير (Move down) */}
                        <button
                          type="button"
                          disabled={idx === selectedQuestionIds.length - 1}
                          onClick={() => moveQuestionDown(idx)}
                          title="تأخير السؤال للأسفل"
                          className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-0.5 cursor-pointer ${
                            idx === selectedQuestionIds.length - 1
                              ? 'text-slate-300 border-slate-200 bg-slate-50 cursor-not-allowed'
                              : 'text-slate-700 bg-slate-100 border-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                          <span>تأخير</span>
                        </button>

                        {/* إلغاء التحديد */}
                        <button
                          type="button"
                          onClick={() => toggleQuestionSelect(qId)}
                          title="حذف من هذا الامتحان"
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Ministerial & VIP flags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={isMinisterial}
                onChange={e => setIsMinisterial(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <span className="font-bold text-slate-800">امتحان محاكاة وزاري (بكالوريا)</span>
            </label>

            <label className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
              <input
                type="checkbox"
                checked={isVip}
                onChange={e => setIsVip(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded"
              />
              <span className="font-bold text-slate-800">تخصيص لطلبة VIP فقط</span>
            </label>
          </div>

          {/* Footer actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold transition-colors cursor-pointer"
            >
              اعتماد ونشر الامتحان
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
