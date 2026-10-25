/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Plus, BookOpen } from 'lucide-react';
import { useCurriculum } from '../context/CurriculumContext';

interface AddSubjectModalProps {
  onClose: () => void;
}

export const AddSubjectModal: React.FC<AddSubjectModalProps> = ({ onClose }) => {
  const { stages, selectedStageId, addSubject } = useCurriculum();

  const [stageId, setStageId] = useState(selectedStageId);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [iconName, setIconName] = useState('BookOpen');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addSubject({
      stageId,
      name: name.trim(),
      description: description.trim() || 'مادة دراسية معتمدة ضمن الخطة التعليمية.',
      iconName,
      accentColor: 'indigo'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">إضافة مادة دراسية جديدة للمنهاج</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">الصف / المرحلة الدراسية:</label>
            <select
              value={stageId}
              onChange={e => setStageId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-semibold text-slate-800"
            >
              {stages.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">اسم المادة الدراسية:</label>
            <input
              type="text"
              required
              placeholder="مثال: علم الأحياء، الاقتصاد، الكيمياء التحليلية..."
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-sm text-slate-900"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">وصف المادة ومحاورها:</label>
            <textarea
              rows={3}
              placeholder="وصف مختصر لمفردات المنهج والفصول الدراسية..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">الأيقونة المناسبة:</label>
            <select
              value={iconName}
              onChange={e => setIconName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 font-medium"
            >
              <option value="BookOpen">كتاب ودراسات لغوية (BookOpen)</option>
              <option value="Calculator">رياضيات ومعادلات (Calculator)</option>
              <option value="Atom">فيزياء وذرات (Atom)</option>
              <option value="FlaskConical">كيمياء ومختبر (FlaskConical)</option>
              <option value="HeartPulse">أحياء وجسم الإنسان (HeartPulse)</option>
              <option value="Languages">لغات أجنبية (Languages)</option>
              <option value="Microscope">علوم وبحوث (Microscope)</option>
            </select>
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
              إضافة المادة فوراً
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
