import React, { useState } from 'react';

interface NavbarProps {
  isAdmin: boolean;
  setIsAdmin: (value: boolean) => void;
  adminName: string;
  setAdminName: (name: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ isAdmin, setIsAdmin, adminName, setAdminName }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const adminProfiles = [
    { id: '1', name: 'د. أحمد النابغة (المدير العام)', role: 'مدير رئيسي' },
    { id: '2', name: 'أ. فاطمة التعليمية (مشرفة النظام)', role: 'مشرفة محتوى' },
    { id: '3', name: 'م. محمد قاسم (مسؤول التقنية)', role: 'أدمن تقني' }
  ];

  return (
    <header className="bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white shadow-2xl border-b border-indigo-500/30 sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* الشعار والهوية البصرية الفاخرة */}
        <div className="flex items-center space-x-3 space-x-reverse group cursor-pointer">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 via-purple-600 to-violet-700 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/40 border border-indigo-400/40 group-hover:scale-105 transition-all duration-300">
            <span className="text-2xl font-black text-white tracking-wider">ن</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-white via-indigo-100 to-violet-300 bg-clip-text text-transparent">
                منصة النابغة
              </span>
              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                PRO
              </span>
            </div>
            <span className="block text-[11px] font-medium text-indigo-400/80 tracking-widest uppercase">
              Al-Nabigha Educational Platform
            </span>
          </div>
        </div>

        {/* لوحة التحكم والتحكم بالأدمن */}
        <div className="flex items-center gap-4">
          
          {/* زر تبديل وضع العرض (طالب / أدمن) */}
          <div className="bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 flex items-center shadow-inner">
            <button
              onClick={() => setIsAdmin(false)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-1.5 ${
                !isAdmin 
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🎓</span> عرض الطالب
            </button>
            <button
              onClick={() => setIsAdmin(true)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-1.5 ${
                isAdmin 
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>⚡</span> لوحة الأدمن
            </button>
          </div>

          {/* قائمة تبديل حساب الأدمن الاحترافية */}
          {isAdmin && (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2.5 bg-gradient-to-r from-indigo-900/80 to-slate-900 hover:from-indigo-900 hover:to-indigo-950 text-indigo-100 px-4 py-2.5 rounded-2xl border border-indigo-500/30 transition-all text-xs font-semibold shadow-xl hover:border-indigo-400/50"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="max-w-[160px] truncate">{adminName}</span>
                <svg className={`w-4 h-4 text-indigo-300 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* القائمة المنسدلة لاختيار المشرف */}
              {isDropdownOpen && (
                <div className="absolute left-0 mt-3 w-80 bg-slate-900/95 backdrop-blur-xl border border-indigo-500/30 rounded-2xl shadow-2xl overflow-hidden z-50 p-2.5">
                  <div className="px-3 py-2 text-[10px] font-bold text-indigo-400 uppercase tracking-wider border-b border-slate-800/80 mb-2 flex items-center justify-between">
                    <span>تبديل حساب المشرف</span>
                    <span className="bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded text-[9px]">متعدد الصلاحيات</span>
                  </div>
                  <div className="space-y-1">
                    {adminProfiles.map((profile) => (
                      <button
                        key={profile.id}
                        onClick={() => {
                          setAdminName(profile.name);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full text-right px-3.5 py-3 rounded-xl text-xs transition-all flex flex-col gap-1 ${
                          adminName === profile.name 
                            ? 'bg-gradient-to-r from-indigo-600/30 to-violet-600/20 border border-indigo-500/50 text-white font-bold shadow-md' 
                            : 'hover:bg-slate-800/80 text-slate-300 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{profile.name}</span>
                          {adminName === profile.name && (
                            <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                          )}
                        </div>
                        <span className="text-[10px] text-indigo-400 font-normal">{profile.role}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </header>
  );
};