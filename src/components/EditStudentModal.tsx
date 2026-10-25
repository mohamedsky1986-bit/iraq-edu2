/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, User, Crown, Calendar, Clock, Award, Phone, MapPin, Save, Trash2, CheckCircle2 } from 'lucide-react';
import { useCurriculum } from '../context/CurriculumContext';
import { UserAccount } from '../types/curriculum';

interface EditStudentModalProps {
  student: UserAccount;
  onClose: () => void;
}

export const EditStudentModal: React.FC<EditStudentModalProps> = ({ student, onClose }) => {
  const { updateStudentUser, deleteStudentUser, submissions, stages } = useCurriculum();

  const [name, setName] = useState(student.name);
  const [username, setUsername] = useState(student.username || student.email.split('@')[0]);
  const [isVip, setIsVip] = useState(student.isVip);
  const [governorate, setGovernorate] = useState(student.governorate || 'بغداد - الكرخ');
  const [phoneNumber, setPhoneNumber] = useState(student.phoneNumber || '');
  const [targetStageId, setTargetStageId] = useState(student.targetStageId || 'grade-3-intermediate');
  const [customNotes, setCustomNotes] = useState(student.customNotes || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Student's exams and submissions
  const studentSubmissions = submissions.filter(
    s => s.studentEmail.toLowerCase() === student.email.toLowerCase()
  );

  const averageScore = studentSubmissions.length > 0
    ? Math.round(studentSubmissions.reduce((acc, curr) => acc + curr.percentage, 0) / studentSubmissions.length)
    : 0;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateStudentUser(student.email, {
      name: name.trim(),
      username: username.trim().toLowerCase().replace(/[^a-zA-Z0-9_]/g, '_'),
      isVip,
      governorate,
      phoneNumber: phoneNumber.trim(),
      targetStageId,
      customNotes: customNotes.trim()
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleDelete = () => {
    if (confirm(`هل أنت متأكد من حذف حساب الطالب «${student.name}» نهائياً من المنصة؟`)) {
      deleteStudentUser(student.email);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                تعديل وبيانات الطالب: {student.name}
              </h3>
              <span className="text-xs text-slate-400 font-mono">{student.email}</span>
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
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
            <div>
              <span className="text-slate-400 text-[11px] block">وقت وتاريخ التسجيل</span>
              <strong className="text-slate-800 font-mono text-xs">
                {new Date(student.registeredAt).toLocaleDateString('ar-EG')}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">آخر ظهور</span>
              <strong className="text-emerald-700 font-mono text-xs">
                {new Date(student.lastActiveAt).toLocaleDateString('ar-EG')}
              </strong>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">الامتحانات المكتملة</span>
              <strong className="text-slate-900 font-mono text-xs">
                {studentSubmissions.length} اختبار
              </strong>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">متوسط الدرجات</span>
              <strong className={`font-mono text-xs font-bold ${averageScore >= 75 ? 'text-emerald-700' : 'text-amber-700'}`}>
                {averageScore}%
              </strong>
            </div>
          </div>

          {/* Editable Personal Data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">اسم الطالب الكامل:</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">اسم المستخدم (اليوزرنيم):</label>
              <input
                type="text"
                required
                dir="ltr"
                placeholder="username_iq"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">المحافظة في العراق:</label>
              <input
                type="text"
                value={governorate}
                onChange={e => setGovernorate(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">رقم الهاتف / الواتساب:</label>
              <input
                type="text"
                dir="ltr"
                placeholder="0780..."
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">الصف / المرحلة المسجل بها:</label>
              <select
                value={targetStageId}
                onChange={e => setTargetStageId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900"
              >
                {stages.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">نوع الاشتراك الحالي:</label>
              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold">
                  <input
                    type="radio"
                    name="student-vip-toggle"
                    checked={!isVip}
                    onChange={() => setIsVip(false)}
                  />
                  <span>حساب عادي مجاني</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-700">
                  <input
                    type="radio"
                    name="student-vip-toggle"
                    checked={isVip}
                    onChange={() => setIsVip(true)}
                  />
                  <Crown className="w-3.5 h-3.5 fill-amber-500" />
                  <span>اشتراك VIP فعال</span>
                </label>
              </div>
            </div>
          </div>

          {/* Teacher custom notes */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">ملاحظات وتوجيهات خاصة بالطالب (يراها المدرس فقط):</label>
            <textarea
              rows={2}
              placeholder="اكتب أي ملاحظة عن مستوى الطالب في الامتحانات أو متابعته..."
              value={customNotes}
              onChange={e => setCustomNotes(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800"
            />
          </div>

          {/* Student Exam Records */}
          <div className="space-y-2 pt-2 border-t border-slate-200">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>سجل امتحانات ودرجات الطالب ({studentSubmissions.length}):</span>
            </h4>
            {studentSubmissions.length === 0 ? (
              <p className="text-slate-400 py-2">لم يقم الطالب بإجراء أي امتحانات حتى الآن.</p>
            ) : (
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {studentSubmissions.map(sub => (
                  <div key={sub.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-[11px]">
                    <div>
                      <strong className="text-slate-900 block">{sub.examTitle}</strong>
                      <span className="text-slate-400 font-mono">
                        {new Date(sub.completedAt).toLocaleDateString('ar-EG')} · الوقت: {Math.floor(sub.timeSpentSeconds / 60)} د
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-md font-mono font-bold ${
                      sub.percentage >= 75 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {sub.score}/{sub.totalScore} ({sub.percentage}%)
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleDelete}
              className="px-3 py-2 text-rose-700 hover:bg-rose-50 rounded-xl font-bold flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>حذف حساب الطالب</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>حفظ التعديلات</span>
              </button>
            </div>
          </div>

          {savedSuccess && (
            <div className="p-3 bg-emerald-100 text-emerald-900 rounded-xl font-bold text-center flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>تم حفظ وتحديث بيانات الطالب بنجاح!</span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
