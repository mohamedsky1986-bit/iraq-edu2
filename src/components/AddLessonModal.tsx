/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, BookOpen, Video, Image as ImageIcon } from 'lucide-react';
import { useCurriculum } from '../context/CurriculumContext';

interface AddLessonModalProps {
  onClose: () => void;
}

export const AddLessonModal: React.FC<AddLessonModalProps> = ({ onClose }) => {
  const { stages, subjects, selectedStageId, addLesson } = useCurriculum();

  const [stageId, setStageId] = useState(selectedStageId);
  const stageSubjects = subjects.filter(s => s.stageId === stageId);
  const [subjectId, setSubjectId] = useState(stageSubjects[0]?.id || subjects[0]?.id || '');

  const [chapter, setChapter] = useState('');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [keyPointsRaw, setKeyPointsRaw] = useState('');
  const [youtubeVideoUrl, setYoutubeVideoUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [bookPages, setBookPages] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim()) return;

    const keyPoints = keyPointsRaw
      ? keyPointsRaw.split('\n').map(l => l.trim()).filter(Boolean)
      : [];

    addLesson({
      stageId,
      subjectId,
      chapter: chapter.trim() || 'الفصل الأول',
      title: title.trim(),
      summary: summary.trim(),
      keyPoints,
      youtubeVideoUrl: youtubeVideoUrl.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      bookPages: bookPages.trim() || undefined
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">إضافة شرح درس مدرسي جديد مع فيديو وصور</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {/* Stage & Subject */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">الصف الدراسي:</label>
              <select
                value={stageId}
                onChange={e => {
                  setStageId(e.target.value);
                  const valid = subjects.filter(s => s.stageId === e.target.value);
                  if (valid.length > 0) setSubjectId(valid[0].id);
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

          {/* Chapter & Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">اسم الفصل أو الوحدة:</label>
              <input
                type="text"
                required
                placeholder="مثال: الفصل الأول: الكهربائية الساكنة"
                value={chapter}
                onChange={e => setChapter(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">عنوان الدرس والشرح:</label>
              <input
                type="text"
                required
                placeholder="مثال: قانون كولوم وحساب القوة الكهربائية"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold"
              />
            </div>
          </div>

          {/* Book Summary */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">نص الشرح والتلخيص من الكتاب:</label>
            <textarea
              rows={4}
              required
              placeholder="اكتب التلخيص والشرح المفصل للمفاهيم والقوانين كما وردت في الكتاب المنهجي..."
              value={summary}
              onChange={e => setSummary(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl leading-relaxed text-slate-800"
            />
          </div>

          {/* Key points */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              النقاط والمفاهيم الوزارية الهامة (سطر لكل نقطة):
            </label>
            <textarea
              rows={3}
              placeholder="النقطة الأولى&#10;النقطة الثانية&#10;النقطة الثالثة"
              value={keyPointsRaw}
              onChange={e => setKeyPointsRaw(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
            />
          </div>

          {/* Media Links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Video className="w-4 h-4 text-rose-600" />
                <span>رابط فيديو الشرح من YouTube:</span>
              </label>
              <input
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeVideoUrl}
                onChange={e => setYoutubeVideoUrl(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-xl font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-sky-600" />
                <span>رابط صورة المخطط أو صفحة الكتاب:</span>
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-xl font-mono text-[11px]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">أرقام الصفحات في الكتاب المنهجي (اختياري):</label>
            <input
              type="text"
              placeholder="مثال: الصفحات 24 إلى 30"
              value={bookPages}
              onChange={e => setBookPages(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl"
            />
          </div>

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
              حفظ الدرس ونشره للطلاب
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
