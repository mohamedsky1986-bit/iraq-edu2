/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Save, Sparkles, Image, Crown } from 'lucide-react';
import { useCurriculum } from '../context/CurriculumContext';
import { Question } from '../types/curriculum';
import { soundManager } from '../utils/audioSystem';

interface EditQuestionModalProps {
  question: Question;
  onClose: () => void;
}

export const EditQuestionModal: React.FC<EditQuestionModalProps> = ({ question, onClose }) => {
  const { stages, subjects, updateQuestion } = useCurriculum();

  const [prompt, setPrompt] = useState(question.prompt);
  const [chapter, setChapter] = useState(question.chapter || '');
  const [correctAnswer, setCorrectAnswer] = useState(question.correctAnswer);
  const [acceptedAnswersRaw, setAcceptedAnswersRaw] = useState(
    question.acceptedAnswers ? question.acceptedAnswers.join(', ') : question.correctAnswer
  );
  const [optionsRaw, setOptionsRaw] = useState(
    question.options ? question.options.join('\n') : ''
  );
  const [explanation, setExplanation] = useState(question.explanation || '');
  const [hint, setHint] = useState(question.hint || '');
  const [difficulty, setDifficulty] = useState(question.difficulty);
  const [imageUrl, setImageUrl] = useState(question.imageUrl || '');
  const [isVip, setIsVip] = useState(!!question.isVip);

  const stage = stages.find(s => s.id === question.stageId);
  const subject = subjects.find(s => s.id === question.subjectId);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const fields: Partial<Question> = {
      prompt: prompt.trim(),
      chapter: chapter.trim() || undefined,
      explanation: explanation.trim(),
      hint: hint.trim() || undefined,
      difficulty,
      imageUrl: imageUrl.trim() || undefined,
      isVip
    };

    if (question.type === 'fill_blank') {
      const accepted = acceptedAnswersRaw
        ? acceptedAnswersRaw.split(',').map(s => s.trim()).filter(Boolean)
        : [correctAnswer.trim()];
      fields.acceptedAnswers = accepted;
      fields.correctAnswer = accepted[0] || correctAnswer.trim();
    } else if (question.type === 'mcq') {
      const splitOpts = optionsRaw.split('\n').map(o => o.trim()).filter(Boolean);
      fields.options = splitOpts;
      fields.correctAnswer = correctAnswer.trim() || splitOpts[0] || '';
    } else if (question.type === 'true_false') {
      fields.correctAnswer = correctAnswer.trim();
    }

    updateQuestion(question.id, fields);
    soundManager.playSuccess();
    onClose();
  };

  const [showPreview, setShowPreview] = useState(false);

  const insertFormatting = (tag: string) => {
    setPrompt(prev => prev ? `${prev} ${tag}` : tag);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-indigo-50/70 border-b border-indigo-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
              تعديل
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900">تعديل وتنسيق السؤال في بنك الأسئلة</h3>
              <p className="text-[11px] text-slate-500">{subject?.name} · {stage?.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {/* Chapter */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">تحديد الفصل أو الوحدة:</label>
            <input
              type="text"
              placeholder="مثال: الفصل الأول: الكهربائية الساكنة"
              value={chapter}
              onChange={e => setChapter(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900"
            />
          </div>

          {/* Prompt with Supervisor Formatting Toolbar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="block font-bold text-slate-700">نص السؤال أو الفراغ:</label>
              
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-[10px] text-slate-400 font-semibold ml-1">أدوات التنسيق:</span>
                <button
                  type="button"
                  onClick={() => insertFormatting('**نص عريض**')}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-bold text-[10px] cursor-pointer"
                  title="إدراج نص عريض"
                >
                  عريض B
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('(....)')}
                  className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-md font-mono font-bold text-[10px] cursor-pointer"
                  title="إدراج موضع فراغ"
                >
                  (....) فراغ
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('【وزاري مكرر】')}
                  className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-md font-bold text-[10px] cursor-pointer"
                  title="إدراج علامة وزاري"
                >
                  【وزاري】
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('[ x² / H₂O ]')}
                  className="px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-md font-mono text-[10px] cursor-pointer"
                  title="رمز رياضي / كيميائي"
                >
                  [معادلة]
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('✓')}
                  className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[11px] cursor-pointer"
                >
                  ✓
                </button>
                <button
                  type="button"
                  onClick={() => insertFormatting('✗')}
                  className="px-1.5 py-0.5 bg-rose-100 text-rose-800 rounded font-bold text-[11px] cursor-pointer"
                >
                  ✗
                </button>
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-colors ${
                    showPreview ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {showPreview ? 'إخفاء المعاينة' : 'معاينة التنسيق'}
                </button>
              </div>
            </div>

            <textarea
              rows={3}
              required
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500"
            />

            {showPreview && prompt && (
              <div className="p-3 bg-slate-900 text-white rounded-xl text-xs space-y-1">
                <span className="text-[10px] text-slate-400 block font-semibold">معاينة شكل السؤال للطلبة:</span>
                <p className="font-medium leading-relaxed text-emerald-300">
                  {prompt}
                </p>
              </div>
            )}
          </div>

          {/* Type specific fields */}
          {question.type === 'fill_blank' && (
            <div className="space-y-3 bg-indigo-50/40 p-4 rounded-2xl border border-indigo-100">
              <div>
                <label className="block font-bold text-indigo-950 mb-1">
                  الإجابات المقبولة للفراغ (مفصولة بفواصل):
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: الكولوم, كولوم, كولم"
                  value={acceptedAnswersRaw}
                  onChange={e => setAcceptedAnswersRaw(e.target.value)}
                  className="w-full p-2.5 bg-white border border-indigo-200 rounded-xl font-bold text-indigo-900"
                />
                <span className="text-[11px] text-indigo-700 mt-1 block">
                  النظام يدعم التسامح الذكي للأخطاء الإملائية البسيطة والهمزات مع تنبيه الطالب.
                </span>
              </div>
            </div>
          )}

          {question.type === 'mcq' && (
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  الخيارات المتاحة (خيار واحد في كل سطر):
                </label>
                <textarea
                  rows={4}
                  required
                  value={optionsRaw}
                  onChange={e => setOptionsRaw(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الخيار الصحيح المعتمد:</label>
                <input
                  type="text"
                  required
                  value={correctAnswer}
                  onChange={e => setCorrectAnswer(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-bold text-emerald-800"
                />
              </div>
            </div>
          )}

          {question.type === 'true_false' && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">الإجابة الصحيحة:</label>
              <select
                value={correctAnswer}
                onChange={e => setCorrectAnswer(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800"
              >
                <option value="صح">صح</option>
                <option value="خطأ">خطأ</option>
              </select>
            </div>
          )}

          {/* Explanation and Hint */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">الشرح والتفسير العلمي:</label>
              <textarea
                rows={2}
                value={explanation}
                onChange={e => setExplanation(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">تلميح لمساعدة الطالب (اختياري):</label>
              <textarea
                rows={2}
                value={hint}
                onChange={e => setHint(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          {/* Image & Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">رابط صورة السؤال / المخطط (URL):</label>
              <input
                type="url"
                placeholder="https://..."
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">مستوى الصعوبة والتصنيف:</label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
              >
                <option value="easy">سهل - مباشر</option>
                <option value="medium">متوسط - تطبيقي</option>
                <option value="hard">متقدم - مهارات عليا</option>
                <option value="ministerial">وزاري معتمد</option>
              </select>
            </div>
          </div>

          {/* VIP Toggle */}
          <label className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200 cursor-pointer">
            <input
              type="checkbox"
              checked={isVip}
              onChange={e => setIsVip(e.target.checked)}
              className="w-4 h-4 text-amber-600 rounded"
            />
            <div className="flex items-center gap-1.5">
              <Crown className="w-4 h-4 text-amber-600" />
              <span className="font-bold text-amber-950">تفعيل وضع VIP لهذا السؤال (حصري للمشتركين)</span>
            </div>
          </label>

          {/* Actions */}
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
              className="px-5 py-2 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>حفظ التعديلات</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
