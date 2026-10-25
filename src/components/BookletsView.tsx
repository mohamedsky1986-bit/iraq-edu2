/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileText,
  Download,
  BookOpen,
  Crown,
  Search,
  ExternalLink,
  Plus,
  Trash2,
  Sparkles,
  Layers,
  X,
  FileCheck
} from 'lucide-react';
import { useCurriculum } from '../context/CurriculumContext';
import { StudyBooklet } from '../types/curriculum';
import { soundManager } from '../utils/audioSystem';

interface BookletsViewProps {
  onOpenSubscribe?: () => void;
}

export const BookletsView: React.FC<BookletsViewProps> = ({ onOpenSubscribe }) => {
  const {
    booklets,
    stages,
    subjects,
    selectedStageId,
    currentUser,
    deleteBooklet,
    addBooklet,
    incrementBookletDownloads
  } = useCurriculum();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('all');
  const [showVipOnlyFilter, setShowVipOnlyFilter] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [readingBooklet, setReadingBooklet] = useState<StudyBooklet | null>(null);

  // Filter booklets by currently selected stage
  const currentStage = stages.find(s => s.id === selectedStageId);
  const currentStageSubjects = subjects.filter(s => s.stageId === selectedStageId);

  const filteredBooklets = booklets.filter(b => {
    if (b.stageId !== selectedStageId) return false;
    if (selectedSubjectFilter !== 'all' && b.subjectId !== selectedSubjectFilter) return false;
    if (showVipOnlyFilter && !b.isVipOnly) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const matchTitle = b.title.toLowerCase().includes(q);
      const matchAuthor = b.authorTeacher.toLowerCase().includes(q);
      const matchDesc = b.description.toLowerCase().includes(q);
      const matchChapter = b.chapter.toLowerCase().includes(q);
      if (!matchTitle && !matchAuthor && !matchDesc && !matchChapter) return false;
    }
    return true;
  });

  const handleDownload = (booklet: StudyBooklet) => {
    if (booklet.isVipOnly && !currentUser.isVip && currentUser.role !== 'teacher') {
      soundManager.playError();
      if (onOpenSubscribe) onOpenSubscribe();
      return;
    }

    soundManager.playSuccess();
    incrementBookletDownloads(booklet.id);

    // Open PDF in new window / tab
    window.open(booklet.pdfUrl, '_blank', 'noopener,noreferrer');
  };

  const handleOpenReader = (booklet: StudyBooklet) => {
    if (booklet.isVipOnly && !currentUser.isVip && currentUser.role !== 'teacher') {
      soundManager.playError();
      if (onOpenSubscribe) onOpenSubscribe();
      return;
    }
    soundManager.playClick();
    incrementBookletDownloads(booklet.id);
    setReadingBooklet(booklet);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-l from-emerald-800 via-emerald-700 to-teal-800 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold text-emerald-100">
            <FileText className="w-4 h-4 text-emerald-300" />
            <span>ملازم ومذكرات وزارة التربية العراقية (PDF)</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            الملازم الدراسية الذهبية والملخصات الوزارية
          </h2>

          <p className="text-emerald-100/90 text-sm leading-relaxed">
            تصفح وحمل ملازم ومذكرات الأساتذة الأكفاء المعتمدة في المدارس العراقية، شاملة حلول الأسئلة الوزارية، الرسوم التوضيحية، وملخصات الفصول بجودة طباعة عالية.
          </p>

          <div className="flex items-center gap-3 pt-1 flex-wrap">
            <span className="text-xs text-emerald-200">
              المرحلة المحددة: <strong className="text-white font-bold">{currentStage?.name}</strong>
            </span>
            <span className="text-emerald-300">·</span>
            <span className="text-xs text-emerald-200">
              الملازم المتوفرة: <strong className="text-white font-bold font-mono">{filteredBooklets.length}</strong> ملزمة
            </span>

            {currentUser.role === 'teacher' && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="mr-auto px-4 py-2 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>نشر ملزمة PDF جديدة</span>
              </button>
            )}
          </div>
        </div>

        <div className="absolute left-6 bottom-4 opacity-10 pointer-events-none hidden sm:block">
          <BookOpen className="w-48 h-48" />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <input
            type="text"
            dir="rtl"
            placeholder="ابحث باسم الملزمة، اسم الأستاذ، أو عنوان الفصل..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-slate-400"
          />
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Subject Filter */}
          <select
            value={selectedSubjectFilter}
            onChange={(e) => setSelectedSubjectFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 cursor-pointer"
          >
            <option value="all">كافة المواد الدراسية</option>
            {currentStageSubjects.map(sub => (
              <option key={sub.id} value={sub.id}>{sub.name}</option>
            ))}
          </select>

          {/* VIP Toggle filter */}
          <button
            onClick={() => setShowVipOnlyFilter(prev => !prev)}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              showVipOnlyFilter
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>ملازم VIP فقط</span>
          </button>
        </div>
      </div>

      {/* Booklets Grid */}
      {filteredBooklets.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">لا توجد ملازم دراسية مطابقة</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            لم نعثر على ملازم دراسية مطابقة لشروط البحث والتصفية المحددة. جرب تغيير عبارة البحث أو اختيار مادة أخرى.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBooklets.map((booklet) => {
            const subject = subjects.find(s => s.id === booklet.subjectId);
            const isLocked = booklet.isVipOnly && !currentUser.isVip && currentUser.role !== 'teacher';

            return (
              <div
                key={booklet.id}
                className="bg-white rounded-3xl border border-slate-200 hover:border-emerald-300 hover:shadow-lg transition-all flex flex-col overflow-hidden group"
              >
                {/* Cover Image & Badges */}
                <div className="relative h-44 bg-slate-100 overflow-hidden">
                  <img
                    src={booklet.coverImageUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80'}
                    alt={booklet.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />

                  {/* Top Badges */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 flex-wrap">
                    {subject && (
                      <span className="px-2.5 py-1 bg-white/90 backdrop-blur-xs rounded-lg text-[11px] font-bold text-slate-800">
                        {subject.name}
                      </span>
                    )}

                    {booklet.isVipOnly ? (
                      <span className="px-2.5 py-1 bg-amber-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-xs">
                        <Crown className="w-3 h-3" />
                        <span>VIP</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-emerald-600 text-white rounded-lg text-[10px] font-bold">
                        مجاني
                      </span>
                    )}
                  </div>

                  {/* Chapter tag at bottom of cover */}
                  <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-white text-xs">
                    <span className="font-semibold truncate max-w-[200px]">
                      {booklet.chapter}
                    </span>
                    <span className="text-[11px] font-mono bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-xs">
                      {booklet.pageCount} صفحة
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">
                      {booklet.title}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {booklet.description}
                    </p>
                  </div>

                  {/* Metadata: Author & Downloads */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-medium text-slate-700 truncate max-w-[150px]">
                      إعداد: {booklet.authorTeacher}
                    </span>
                    <span className="font-mono text-slate-400">
                      {booklet.downloadCount.toLocaleString('ar-IQ')} تحميل
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-1">
                    {isLocked ? (
                      <button
                        onClick={() => {
                          if (onOpenSubscribe) onOpenSubscribe();
                        }}
                        className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                      >
                        <Crown className="w-4 h-4" />
                        <span>فتح الملزمة (حصري لمشتركي VIP)</span>
                      </button>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleOpenReader(booklet)}
                          className="py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                        >
                          <BookOpen className="w-4 h-4" />
                          <span>تصفح وقراءة</span>
                        </button>

                        <button
                          onClick={() => handleDownload(booklet)}
                          className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Download className="w-4 h-4 text-emerald-700" />
                          <span>تحميل PDF</span>
                        </button>
                      </div>
                    )}

                    {currentUser.role === 'teacher' && (
                      <button
                        onClick={() => {
                          if (confirm(`هل أنت متأكد من رغبتك في حذف الملزمة: «${booklet.title}»؟`)) {
                            deleteBooklet(booklet.id);
                          }
                        }}
                        className="w-full py-1.5 text-rose-600 hover:bg-rose-50 text-[11px] font-semibold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>حذف الملزمة من المنصة</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Booklet Modal (for Teacher) */}
      {isAddModalOpen && (
        <AddBookletModal
          onClose={() => setIsAddModalOpen(false)}
          defaultStageId={selectedStageId}
        />
      )}

      {/* Online PDF Reader Modal */}
      {readingBooklet && (
        <BookletReaderModal
          booklet={readingBooklet}
          onClose={() => setReadingBooklet(null)}
        />
      )}
    </div>
  );
};

interface AddBookletModalProps {
  onClose: () => void;
  defaultStageId: string;
}

const AddBookletModal: React.FC<AddBookletModalProps> = ({ onClose, defaultStageId }) => {
  const { stages, subjects, addBooklet } = useCurriculum();

  const [stageId, setStageId] = useState(defaultStageId);
  const stageSubjects = subjects.filter(s => s.stageId === stageId);
  const [subjectId, setSubjectId] = useState(stageSubjects[0]?.id || '');
  const [title, setTitle] = useState('');
  const [chapter, setChapter] = useState('');
  const [authorTeacher, setAuthorTeacher] = useState('أ. محمد السماوي');
  const [pageCount, setPageCount] = useState(32);
  const [pdfUrl, setPdfUrl] = useState('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
  const [coverImageUrl, setCoverImageUrl] = useState('https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80');
  const [description, setDescription] = useState('');
  const [isVipOnly, setIsVipOnly] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !chapter.trim()) return;

    addBooklet({
      stageId,
      subjectId: subjectId || stageSubjects[0]?.id || 'subj-g3-physics',
      title: title.trim(),
      chapter: chapter.trim(),
      authorTeacher: authorTeacher.trim() || 'أستاذ المادة',
      pageCount: Number(pageCount) || 20,
      pdfUrl: pdfUrl.trim(),
      coverImageUrl: coverImageUrl.trim(),
      description: description.trim() || 'ملزمة ومذكرة منهجية معتمدة لطلبة العراق.',
      isVipOnly
    });

    soundManager.playSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[92vh]">
        <div className="px-6 py-4 bg-emerald-50/70 border-b border-emerald-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-700" />
            <h3 className="text-base font-bold text-slate-900">نشر ملزمة دراسية (PDF) جديدة</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">المرحلة الدراسية:</label>
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

          <div>
            <label className="block font-bold text-slate-700 mb-1">عنوان الملزمة:</label>
            <input
              type="text"
              required
              placeholder="مثال: ملزمة الكيمياء الوزارية الشاملة - الثالث متوسط"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">الفصل الدراسي:</label>
              <input
                type="text"
                required
                placeholder="مثال: الفصل الأول: التركيب الذري"
                value={chapter}
                onChange={e => setChapter(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">اسم الأستاذ المعد:</label>
              <input
                type="text"
                required
                value={authorTeacher}
                onChange={e => setAuthorTeacher(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">عدد الصفحات:</label>
              <input
                type="number"
                min={1}
                required
                value={pageCount}
                onChange={e => setPageCount(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">صورة الغلاف (رابط URL):</label>
              <input
                type="url"
                value={coverImageUrl}
                onChange={e => setCoverImageUrl(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">رابط ملف الـ PDF المعتمد:</label>
            <input
              type="url"
              required
              value={pdfUrl}
              onChange={e => setPdfUrl(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-[11px] text-slate-900"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">نبذة وتفاصيل عن محتوى الملزمة:</label>
            <textarea
              rows={2}
              placeholder="وصف مختصر لمميزات الملزمة وأهم الأسئلة الوزارية الواردة فيها..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
            />
          </div>

          <label className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-200 cursor-pointer">
            <input
              type="checkbox"
              checked={isVipOnly}
              onChange={e => setIsVipOnly(e.target.checked)}
              className="w-4 h-4 text-amber-600 rounded"
            />
            <span className="font-bold text-amber-950">تخصيص لمشتركي باقات VIP فقط</span>
          </label>

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
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold cursor-pointer"
            >
              نشر الملزمة الآن
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface BookletReaderModalProps {
  booklet: StudyBooklet;
  onClose: () => void;
}

const BookletReaderModal: React.FC<BookletReaderModalProps> = ({ booklet, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl max-w-4xl w-full h-[90vh] flex flex-col overflow-hidden text-white">
        {/* Header */}
        <div className="px-6 py-3.5 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="truncate">
              <h3 className="font-bold text-sm text-slate-100 truncate">{booklet.title}</h3>
              <p className="text-[11px] text-slate-400">
                {booklet.chapter} · {booklet.authorTeacher} · {booklet.pageCount} صفحة
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={booklet.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">فتح في نافذة مستقلة</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Reader Body */}
        <div className="flex-1 bg-slate-950 p-2 sm:p-4 flex flex-col items-center justify-center overflow-hidden">
          <iframe
            src={`${booklet.pdfUrl}#toolbar=1`}
            title={booklet.title}
            className="w-full h-full rounded-2xl border border-slate-800 bg-white"
          />
        </div>
      </div>
    </div>
  );
};
