/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Award,
  Clock,
  FileQuestion,
  ChevronUp,
  ChevronDown,
  Layers,
  ArrowUpDown,
  BookOpen,
  Trash2,
  Plus,
  CheckCircle2,
  Crown,
  Sparkles,
  Info
} from 'lucide-react';
import { useCurriculum } from '../context/CurriculumContext';
import { Exam } from '../types/curriculum';

interface EditExamModalProps {
  exam: Exam;
  onClose: () => void;
}

export const EditExamModal: React.FC<EditExamModalProps> = ({ exam, onClose }) => {
  const { stages, subjects, questions, updateExam } = useCurriculum();

  const [title, setTitle] = useState(exam.title);
  const [chapter, setChapter] = useState(exam.chapter || '');
  const [description, setDescription] = useState(exam.description);
  const [durationMinutes, setDurationMinutes] = useState(exam.durationMinutes);
  const [isMinisterial, setIsMinisterial] = useState(exam.isMinisterial);
  const [isVip, setIsVip] = useState(exam.isVip);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>(exam.questionIds);
  const [addQuestionSearch, setAddQuestionSearch] = useState('');
  const [showAvailableDrawer, setShowAvailableDrawer] = useState(false);

  const stageObj = stages.find(s => s.id === exam.stageId);
  const subjectObj = subjects.find(s => s.id === exam.subjectId);

  // Available questions that can be added to this exam
  const candidateQuestions = questions.filter(q => {
    return q.stageId === exam.stageId && q.subjectId === exam.subjectId;
  });

  const unusedQuestions = candidateQuestions.filter(
    q => !selectedQuestionIds.includes(q.id) &&
      (addQuestionSearch.trim() === '' || q.prompt.toLowerCase().includes(addQuestionSearch.toLowerCase()))
  );

  // Reordering functions: تقديم وتأخير الأسئلة
  const moveQuestionUp = (index: number) => {
    if (index <= 0) return;
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

  const removeQuestion = (qId: string) => {
    setSelectedQuestionIds(prev => prev.filter(id => id !== qId));
  };

  const addQuestionToExam = (qId: string) => {
    if (!selectedQuestionIds.includes(qId)) {
      setSelectedQuestionIds(prev => [...prev, qId]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (selectedQuestionIds.length === 0) {
      alert('يجب أن يحتوي الامتحان على سؤال واحد على الأقل.');
      return;
    }

    updateExam(exam.id, {
      title: title.trim(),
      chapter: chapter.trim() || undefined,
      description: description.trim(),
      durationMinutes: Number(durationMinutes) || 20,
      questionIds: selectedQuestionIds,
      isComprehensive: selectedQuestionIds.length >= 2,
      isMinisterial,
      isVip
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-indigo-50/80 border-b border-indigo-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                تعديل وتنسيق الامتحان المدرسي (لوحة المشرف)
              </h3>
              <p className="text-xs text-slate-500">
                {subjectObj?.name} - {stageObj?.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {/* Exam Title & Chapter */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                عنوان الامتحان أو الاختبار الوزاري:
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                الفصل أو الوحدة المحددة:
              </label>
              <input
                type="text"
                placeholder="مثال: الفصل الثالث"
                value={chapter}
                onChange={e => setChapter(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Description & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                وصف الامتحان وتعليمات الحل للطلبة:
              </label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                الوقت المتاح بالدقائق:
              </label>
              <div className="relative">
                <input
                  type="number"
                  min={5}
                  max={180}
                  value={durationMinutes}
                  onChange={e => setDurationMinutes(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                  دقيقة
                </span>
              </div>
            </div>
          </div>

          {/* Flags: Ministerial & VIP */}
          <div className="flex items-center gap-6 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isMinisterial}
                onChange={e => setIsMinisterial(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
              />
              <span className="font-bold text-slate-800">امتحان وزاري معتمد (بكالوريا)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isVip}
                onChange={e => setIsVip(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
              />
              <span className="font-bold text-amber-900 flex items-center gap-1">
                <Crown className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                <span>حصر الامتحان للمشتركين VIP</span>
              </span>
            </label>
          </div>

          {/* QUESTIONS MANAGEMENT: ORDERING (تقديم وتأخير) */}
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <ArrowUpDown className="w-4 h-4 text-indigo-600" />
                  <span>ترتيب وتسلسل الأسئلة في الامتحان ({selectedQuestionIds.length})</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  استخدم أزرار التقديم والتأخير لضبط تسلسل الأسئلة كما تظهر للطالب أثناء الاختبار
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAvailableDrawer(!showAvailableDrawer)}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showAvailableDrawer ? 'إخفاء بنك الإضافة' : '+ إضافة أسئلة للامتحان'}</span>
              </button>
            </div>

            {/* Add Questions Drawer */}
            {showAvailableDrawer && (
              <div className="p-3 bg-indigo-50/50 border border-indigo-200 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-indigo-950">
                    أسئلة بنك المادة المتاحة للإضافة ({unusedQuestions.length}):
                  </span>
                  <input
                    type="text"
                    placeholder="بحث في الأسئلة..."
                    value={addQuestionSearch}
                    onChange={e => setAddQuestionSearch(e.target.value)}
                    className="p-1.5 bg-white border border-indigo-200 rounded-lg text-[11px] w-48"
                  />
                </div>

                {unusedQuestions.length === 0 ? (
                  <p className="text-slate-500 text-center py-2">
                    كافة أسئلة هذه المادة مضافة بالفعل للامتحان.
                  </p>
                ) : (
                  <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                    {unusedQuestions.map(q => (
                      <div
                        key={q.id}
                        className="p-2 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-2 text-[11px]"
                      >
                        <div className="flex-1 truncate">
                          <strong className="text-slate-900">{q.prompt}</strong>
                          <span className="text-slate-400 mr-2 font-mono">({q.type})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => addQuestionToExam(q.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shrink-0 cursor-pointer"
                        >
                          + إضافة للامتحان
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Questions Sequence List */}
            <div className="border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden bg-slate-50/50">
              {selectedQuestionIds.length === 0 ? (
                <div className="p-6 text-center text-slate-500">
                  لا توجد أسئلة في هذا الامتحان. يرجى إضافة أسئلة من بنك الأسئلة أعلاه.
                </div>
              ) : (
                selectedQuestionIds.map((qId, idx) => {
                  const q = questions.find(item => item.id === qId);
                  if (!q) return null;

                  return (
                    <div
                      key={qId}
                      className="p-3 bg-white flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                    >
                      {/* Order and Prompt */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-800 font-mono font-bold flex items-center justify-center shrink-0 text-xs">
                          {idx + 1}
                        </span>

                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-900 truncate" title={q.prompt}>
                            {q.prompt}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                              {q.type === 'fill_blank' ? 'فراغ ذكي' : q.type === 'mcq' ? 'اختيارات' : 'صح/خطأ'}
                            </span>
                            {q.chapter && <span>· {q.chapter}</span>}
                            {q.isVip && (
                              <span className="text-amber-700 font-bold flex items-center gap-0.5">
                                <Crown className="w-3 h-3 fill-amber-500" />
                                <span>VIP</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Move Up / Down & Remove Controls */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveQuestionUp(idx)}
                          title="تقديم السؤال للأعلى"
                          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          disabled={idx === selectedQuestionIds.length - 1}
                          onClick={() => moveQuestionDown(idx)}
                          title="تأخير السؤال للأسفل"
                          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => removeQuestion(qId)}
                          title="إزالة من هذا الامتحان"
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Footer Save & Cancel */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>حفظ وتطبيق تعديلات الامتحان</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
