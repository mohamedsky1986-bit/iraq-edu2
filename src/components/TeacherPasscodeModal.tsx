/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lock, ShieldCheck, KeyRound, AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useCurriculum } from '../context/CurriculumContext';

interface TeacherPasscodeModalProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const TeacherPasscodeModal: React.FC<TeacherPasscodeModalProps> = ({ onSuccess, onCancel }) => {
  const { unlockTeacherPanel, adminSettings } = useCurriculum();

  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showPin, setShowPin] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) return;

    const ok = unlockTeacherPanel(passcode.trim());
    if (ok) {
      setErrorMsg('');
      onSuccess();
    } else {
      setErrorMsg('الرمز السري غير صحيح! يرجى إعادة المحاولة.');
      setPasscode('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full overflow-hidden text-center p-6 sm:p-8 space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center mx-auto shadow-xs">
          <KeyRound className="w-8 h-8" />
        </div>

        <div>
          <h3 className="text-xl font-bold text-slate-900 leading-tight">
            حماية لوحة تحكم المدرس
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            أدخل الرمز السري المخصص للوصول إلى بيانات الطلبة والأسئلة والاشتراكات
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={showPin ? 'text' : 'password'}
              autoFocus
              required
              placeholder="••••"
              value={passcode}
              onChange={e => {
                setErrorMsg('');
                setPasscode(e.target.value);
              }}
              className="w-full text-center text-2xl font-mono tracking-widest py-3 px-10 bg-slate-50 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold"
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {errorMsg ? (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          ) : (
            <div className="p-2 bg-indigo-50/70 rounded-xl text-[11px] text-indigo-800 font-medium">
              الرمز السري الافتراضي للمعاينة: <strong>{adminSettings.passcode}</strong>
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="w-1/2 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="w-1/2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>فتح اللوحة</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
