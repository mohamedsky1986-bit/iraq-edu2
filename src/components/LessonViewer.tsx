/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  BookOpen,
  Video,
  Image as ImageIcon,
  CheckCircle,
  PlusCircle,
  ExternalLink,
  Sparkles,
  BookMarked
} from 'lucide-react';
import { Lesson } from '../types/curriculum';
import { useCurriculum } from '../context/CurriculumContext';

interface LessonViewerProps {
  initialSubjectId?: string | null;
  onOpenAddLessonModal: () => void;
}

// Converts standard YouTube URLs into embed URLs
function getYouTubeEmbedUrl(url?: string): string | null {
  if (!url) return null;
  try {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
  } catch {}
  return null;
}

export const LessonViewer: React.FC<LessonViewerProps> = ({
  initialSubjectId,
  onOpenAddLessonModal
}) => {
  const { lessons, subjects, selectedStageId, currentUser } = useCurriculum();

  const [activeSubjectFilter, setActiveSubjectFilter] = useState<string | null>(initialSubjectId || null);

  const stageSubjects = subjects.filter(s => s.stageId === selectedStageId);
  const filteredLessons = lessons.filter(l => {
    if (l.stageId !== selectedStageId) return false;
    if (activeSubjectFilter && l.subjectId !== activeSubjectFilter) return false;
    return true;
  });

  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(
    filteredLessons[0]?.id || null
  );

  const activeLesson = lessons.find(l => l.id === selectedLessonId) || filteredLessons[0];

  return (
    <div className="space-y-6">
      {/* Header and Filter strip */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wide block">
            المكتبة الرقمية والشروحات التفاعلية
          </span>
          <h2 className="text-xl font-bold text-slate-900">
            شروحات الكتب المدرسية والمحاضرات المرئية
          </h2>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {currentUser.role === 'teacher' && (
            <button
              onClick={onOpenAddLessonModal}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>إضافة شرح جديد من الكتاب</span>
            </button>
          )}
        </div>
      </div>

      {/* Subject Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <button
          onClick={() => setActiveSubjectFilter(null)}
          className={`px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer whitespace-nowrap ${
            activeSubjectFilter === null
              ? 'bg-emerald-600 text-white'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          كافة المواد
        </button>
        {stageSubjects.map(sub => (
          <button
            key={sub.id}
            onClick={() => setActiveSubjectFilter(sub.id)}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              activeSubjectFilter === sub.id
                ? 'bg-emerald-600 text-white'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {sub.name}
          </button>
        ))}
      </div>

      {/* Main Content Layout */}
      {filteredLessons.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">لا توجد شروحات مضافة لهذه المادة بعد</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            يمكن للمدرس إضافة ملخصات من الكتب المدرسية، روابط يوتيوب لشرح الدروس، ومخططات توضيحية.
          </p>
          {currentUser.role === 'teacher' && (
            <button
              onClick={onOpenAddLessonModal}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>إضافة أول درس وشرح</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Lessons List (Right column) */}
          <div className="lg:col-span-4 space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
              قائمة الدروس ({filteredLessons.length}):
            </h3>
            <div className="space-y-2">
              {filteredLessons.map(lesson => {
                const isSelected = activeLesson?.id === lesson.id;
                const parentSub = subjects.find(s => s.id === lesson.subjectId);

                return (
                  <div
                    key={lesson.id}
                    onClick={() => setSelectedLessonId(lesson.id)}
                    className={`p-4 rounded-2xl border text-right transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-[11px] font-semibold text-emerald-800 block mb-1">
                      {parentSub?.name} · {lesson.chapter}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mb-1 leading-snug">
                      {lesson.title}
                    </h4>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                      {lesson.youtubeVideoUrl && (
                        <span className="flex items-center gap-1 text-rose-600 font-medium">
                          <Video className="w-3.5 h-3.5" />
                          <span>فيديو يوتيوب</span>
                        </span>
                      )}
                      {lesson.imageUrl && (
                        <span className="flex items-center gap-1 text-sky-600 font-medium">
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>مخطط الكتاب</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Lesson Reader & Media Player (Left column) */}
          {activeLesson && (
            <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
              {/* Lesson Title Header */}
              <div className="border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md">
                    {activeLesson.chapter}
                  </span>
                  {activeLesson.bookPages && (
                    <span className="text-xs text-slate-400 font-medium">
                      {activeLesson.bookPages}
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 leading-tight">
                  {activeLesson.title}
                </h3>
              </div>

              {/* YouTube Video Player Embed if present */}
              {activeLesson.youtubeVideoUrl && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-rose-600" />
                    <span>محاضرة الشرح المرئي من يوتيوب:</span>
                  </h4>
                  <div className="rounded-2xl overflow-hidden aspect-video bg-slate-900 shadow-xs border border-slate-200">
                    {getYouTubeEmbedUrl(activeLesson.youtubeVideoUrl) ? (
                      <iframe
                        src={getYouTubeEmbedUrl(activeLesson.youtubeVideoUrl)!}
                        title={activeLesson.title}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white p-4 text-center">
                        <a
                          href={activeLesson.youtubeVideoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 bg-rose-600 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-rose-700"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>فتح الفيديو على يوتيوب</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Textbook Summary Section */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BookMarked className="w-4 h-4 text-emerald-600" />
                  <span>الشرح والملخص من الكتاب المنهجي:</span>
                </h4>
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-sm leading-relaxed text-slate-800 text-justify">
                  {activeLesson.summary}
                </div>
              </div>

              {/* Study Key Points */}
              {activeLesson.keyPoints && activeLesson.keyPoints.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>النقاط والمفاهيم الوزارية الجوهرية:</span>
                  </h4>
                  <ul className="space-y-2">
                    {activeLesson.keyPoints.map((point, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs text-slate-800"
                      >
                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Textbook Diagram Illustration if available */}
              {activeLesson.imageUrl && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-sky-600" />
                    <span>المخطط التوضيحي المعتمد:</span>
                  </h4>
                  <div className="rounded-2xl overflow-hidden border border-slate-200">
                    <img
                      src={activeLesson.imageUrl}
                      alt={activeLesson.title}
                      referrerPolicy="no-referrer"
                      className="w-full max-h-96 object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
