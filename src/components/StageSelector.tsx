/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Layers, ChevronDown, GraduationCap, CheckCircle2 } from 'lucide-react';
import { useCurriculum } from '../context/CurriculumContext';

interface StageSelectorProps {
  onAddSubjectClick: () => void;
}

export const StageSelector: React.FC<StageSelectorProps> = ({ onAddSubjectClick }) => {
  const { stages, selectedStageId, setSelectedStageId, subjects, currentUser } = useCurriculum();

  const currentStage = stages.find(s => s.id === selectedStageId) || stages[0];
  const stageSubjects = subjects.filter(sub => sub.stageId === selectedStageId);

  // إذا كان المستخدم طالباً، لا تظهر أمامه المراحل الأخرى ويثبت على مرحلته فقط
  if (currentUser.role === 'student') {
    return (
      <div className="bg-white rounded-2xl border border-emerald-200/80 p-5 shadow-xs mb-6 bg-gradient-to-l from-emerald-50/40 via-white to-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200 shadow-2xs">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-emerald-800 tracking-wide">
                  مرحلتك الدراسية المخصصة
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100/80 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                  <span>حساب طالب مقيّد بمرحلته</span>
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 leading-tight mt-1">
                {currentStage.name}
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                المنهاج والأسئلة والامتحانات والملازم موجهة خصيصاً لمرحلتك الدراسية المعتمدة في العراق.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
              <span>المواد المتاحة: <strong className="text-slate-900 font-mono tabular-nums">{stageSubjects.length}</strong> مواد دراسية</span>
            </div>
            <div className="px-3.5 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold">
              <span>{currentStage.badge || 'المنهج الوزاري المعتمد'}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Stage Title and Selection Control */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wide block">
                اختيار المرحلة الدراسية
              </span>
              <h2 className="text-lg font-bold text-slate-900 leading-tight">
                {currentStage.name}
              </h2>
            </div>
          </div>

          {/* Accessible Native Select for fast and reliable screen interaction */}
          <div className="relative w-full sm:w-auto mt-1 sm:mt-0 sm:mr-3">
            <select
              aria-label="قائمة اختيار الصف الدراسي"
              value={selectedStageId}
              onChange={(e) => setSelectedStageId(e.target.value)}
              className="w-full sm:w-auto appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-800 text-sm font-semibold rounded-xl pl-8 pr-4 py-2.5 cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            >
              <optgroup label="المرحلة المتوسطة">
                {stages.filter(s => s.tier === 'intermediate').map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="المرحلة الإعدادية (البكالوريا)">
                {stages.filter(s => s.tier === 'preparatory').map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </optgroup>
            </select>
            <ChevronDown className="w-4 h-4 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Right: Quick Stats & Teacher Add Subject Button */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>المواد المتاحة: <strong className="text-slate-900 font-mono tabular-nums">{stageSubjects.length}</strong> مواد</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-700 font-medium">{currentStage.badge || 'منهاج معتمد'}</span>
          </div>

          {currentUser.role === 'teacher' && (
            <button
              onClick={onAddSubjectClick}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs hover:shadow-sm transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5"
            >
              <span>+ إضافة مادة جديدة لهذا الصف</span>
            </button>
          )}
        </div>
      </div>

      {/* Fast Grade Quick-Pills for 1-click desktop navigation */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
        <span className="text-slate-600 font-medium whitespace-nowrap ml-2">انتقال سريع:</span>
        {stages.map(stage => {
          const isSelected = stage.id === selectedStageId;
          return (
            <button
              key={stage.id}
              onClick={() => setSelectedStageId(stage.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {stage.shortName}
            </button>
          );
        })}
      </div>
    </div>
  );
};
