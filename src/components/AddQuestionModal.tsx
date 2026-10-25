/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Plus, Sparkles, HelpCircle } from 'lucide-react';
import { useCurriculum } from '../context/CurriculumContext';
import { QuestionType } from '../types/curriculum';

interface AddQuestionModalProps {
  onClose: () => void;
}

export const AddQuestionModal: React.FC<AddQuestionModalProps> = ({ onClose }) => {
  const { stages, subjects, selectedStageId, addQuestion } = useCurriculum();

  const [stageId, setStageId] = useState(selectedStageId);
  const stageSubjects = subjects.filter(s => s.stageId === stageId);
  const [subjectId, setSubjectId] = useState(stageSubjects[0]?.id || subjects[0]?.id || '');
  const [chapter, setChapter] = useState('');
  const [type, setType] = useState<QuestionType>('fill_blank');
  const [prompt, setPrompt] = useState('');
  const [acceptedAnswersRaw, setAcceptedAnswersRaw] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [mcqOptions, setMcqOptions] = useState(['', '', '', '']);
  const [trueFalseVal, setTrueFalseVal] = useState('صح');
  const [explanation, setExplanation] = useState('');
  const [hint, setHint] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'ministerial'>('medium');
  const [imageUrl, setImageUrl] = useState('');
  const [isVip, setIsVip] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    if (type === 'fill_blank') {
      const accepted = acceptedAnswersRaw
        ? acceptedAnswersRaw.split(',').map(s => s.trim()).filter(Boolean)
        : [correctAnswer.trim()];
      const mainCorrect = accepted[0] || correctAnswer.trim();

      addQuestion({
        stageId,
        subjectId,
        chapter: chapter.trim() || undefined,
        type: 'fill_blank',
        prompt: prompt.trim(),
        acceptedAnswers: accepted,
        correctAnswer: mainCorrect,
        explanation: explanation.trim() || 'الإجابة النموذجية المعتمدة وفق المنهاج الوزاري.',
        hint: hint.trim(),
        difficulty,
        imageUrl: imageUrl.trim() || undefined,
        isVip
      });
    } else if (type === 'mcq') {
      const cleanOptions = mcqOptions.map(o => o.trim()).filter(Boolean);
      const selectedCorrect = correctAnswer.trim() || cleanOptions[0] || '';

      addQuestion({
        stageId,
        subjectId,
        chapter: chapter.trim() || undefined,
        type: 'mcq',
        prompt: prompt.trim(),
        options: cleanOptions,
        correctAnswer: selectedCorrect,
        explanation: explanation.trim() || 'الإجابة الصحيحة وفق الكتاب.',
        hint: hint.trim(),
        difficulty,
        imageUrl: imageUrl.trim() || undefined,
        isVip
      });
    } else if (type === 'true_false') {
      addQuestion({
        stageId,
        subjectId,
        chapter: chapter.trim() || undefined,
        type: 'true_false',
        prompt: prompt.trim(),
        options: ['صح', 'خطأ'],
        correctAnswer: trueFalseVal,
        explanation: explanation.trim() || 'وفق القواعد والمفاهيم العلمية المقررة.',
        hint: hint.trim(),
        difficulty,
        imageUrl: imageUrl.trim() || undefined,
        isVip
      });
    }

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
            <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
              +
            </span>
            <h3 className="text-base font-bold text-slate-900">إضافة سؤال امتحاني جديد لبنك الأسئلة (مع التنسيق)</h3>
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
          {/* Stage & Subject selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">الصف / المرحلة الدراسية:</label>
              <select
                value={stageId}
                onChange={e => {
                  setStageId(e.target.value);
                  const validSubs = subjects.filter(s => s.stageId === e.target.value);
                  if (validSubs.length > 0) setSubjectId(validSubs[0].id);
                }}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800"
              >
                {stages.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">المادة الدراسية:</label>
              <select
                value={subjectId}
                onChange={e => setSubjectId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800"
              >
                {stageSubjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Chapter / الفصل */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">الفصل أو الوحدة الدراسية (تحديد فصول المنهج العراقي):</label>
            <input
              type="text"
              placeholder="مثال: الفصل الأول: الكهربائية الساكنة / الفصل الثاني: المغناطيسية"
              value={chapter}
              onChange={e => setChapter(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900"
            />
          </div>

          {/* Question Type */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">نوع السؤال التفاعلي:</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'fill_blank', label: 'فراغات تفاعلية ذكية' },
                { id: 'mcq', label: 'اختيار من متعدد' },
                { id: 'true_false', label: 'صح أو خطأ' }
              ].map(t => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setType(t.id as QuestionType)}
                  className={`py-2 rounded-xl font-bold transition-colors cursor-pointer border ${
                    type === t.id
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt with Supervisor Formatting Toolbar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="block font-bold text-slate-700">نص السؤال أو الفراغ التفاعلي:</label>
              
              {/* Quick Formatting Tools for Supervisor */}
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
              placeholder="اكتب نص السؤال هنا (مثال: تقاس الشحنة الكهربائية في النظام الدولي بوحدة تسمى (....) )"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500"
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

          {/* Specific Inputs per Type */}
          {type === 'fill_blank' && (
            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-3">
              <div className="flex items-center gap-1.5 text-emerald-900 font-bold">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>إعدادات الفراغات والتصحيح الذكي:</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  الإجابات المقبولة (افصل بينها بفاصلة):
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: الكولوم, كولوم, كولم"
                  value={acceptedAnswersRaw}
                  onChange={e => setAcceptedAnswersRaw(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-medium"
                />
                <span className="text-[11px] text-slate-500 block mt-1">
                  ملاحظة: سيقبل النظام الأخطاء الإملائية الطفيفة وينبه الطالب بالصيغة النموذجية تلقائياً!
                </span>
              </div>
            </div>
          )}

          {type === 'mcq' && (
            <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <label className="block font-bold text-slate-700 mb-1">الخيارات الأربعة:</label>
              {mcqOptions.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-6 font-mono text-slate-400 font-bold">{i + 1}.</span>
                  <input
                    type="text"
                    required
                    placeholder={`الخيار رقم ${i + 1}`}
                    value={opt}
                    onChange={e => {
                      const updated = [...mcqOptions];
                      updated[i] = e.target.value;
                      setMcqOptions(updated);
                    }}
                    className="flex-1 p-2 bg-white border border-slate-300 rounded-lg"
                  />
                  <input
                    type="radio"
                    name="correct-mcq"
                    checked={correctAnswer === opt && opt !== ''}
                    onChange={() => setCorrectAnswer(opt)}
                    className="w-4 h-4 text-indigo-600 cursor-pointer"
                    title="حدد هذا الخيار كإجابة صحيحة"
                  />
                </div>
              ))}
              <span className="text-[11px] text-slate-500 block mt-1">
                اختر الدائرة بجانب الخيار الذي يمثل الإجابة الصحيحة.
              </span>
            </div>
          )}

          {type === 'true_false' && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <label className="block font-bold text-slate-700">الإجابة الصحيحة للعبارة:</label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer font-bold">
                  <input
                    type="radio"
                    name="tf-correct"
                    value="صح"
                    checked={trueFalseVal === 'صح'}
                    onChange={() => setTrueFalseVal('صح')}
                  />
                  <span>صح</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer font-bold">
                  <input
                    type="radio"
                    name="tf-correct"
                    value="خطأ"
                    checked={trueFalseVal === 'خطأ'}
                    onChange={() => setTrueFalseVal('خطأ')}
                  />
                  <span>خطأ</span>
                </label>
              </div>
            </div>
          )}

          {/* Explanation and Hint */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">الشرح العلمي النموذجي:</label>
              <textarea
                rows={2}
                placeholder="الشرح الذي يظهر للطالب بعد إنهاء الاختبار..."
                value={explanation}
                onChange={e => setExplanation(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">تلميح مساعد (اختياري):</label>
              <textarea
                rows={2}
                placeholder="تلميح يطلبه الطالب أثناء التفكير..."
                value={hint}
                onChange={e => setHint(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          {/* Image Diagram & Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">رابط صورة أو مخطط (اختياري):</label>
              <input
                type="url"
                placeholder="https://..."
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">مستوى الصعوبة والتصنيف:</label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value as any)}
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold"
              >
                <option value="easy">سهل - مباشر</option>
                <option value="medium">متوسط - تطبيقي</option>
                <option value="hard">متقدم - مهارات عليا</option>
                <option value="ministerial">وزاري معتمد</option>
              </select>
            </div>
          </div>

          {/* VIP Checkbox */}
          <div className="pt-2 flex items-center gap-2">
            <input
              type="checkbox"
              id="vip-q"
              checked={isVip}
              onChange={e => setIsVip(e.target.checked)}
              className="w-4 h-4 text-amber-600 rounded cursor-pointer"
            />
            <label htmlFor="vip-q" className="font-bold text-slate-800 cursor-pointer">
              تخصيص هذا السؤال لمشتركي VIP فقط
            </label>
          </div>

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
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xs transition-colors cursor-pointer"
            >
              حفظ السؤال وإدراجه في المنهاج
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
