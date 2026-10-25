/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Mail,
  User,
  ShieldCheck,
  CheckCircle2,
  Crown,
  Lock,
  Unlock,
  GraduationCap,
  MapPin,
  KeyRound,
  Eye,
  EyeOff,
  Phone,
  Sparkles
} from 'lucide-react';
import { useCurriculum } from '../context/CurriculumContext';
import { UserAccount } from '../types/curriculum';

interface AuthModalProps {
  onClose: () => void;
  onOpenVip: () => void;
}

const IRAQI_GOVERNORATES = [
  'بغداد - الرصافة',
  'بغداد - الكرخ',
  'البصرة',
  'نينوى (الموصل)',
  'أربيل',
  'النجف الأشرف',
  'كربلاء المقدسة',
  'بابل (الحلة)',
  'ذي قار (الناصرية)',
  'كركوك',
  'الأنبار (الرمادي/الفلوجة)',
  'ديالى (بعقوبة)',
  'صلاح الدين (تكريت/سامراء)',
  'ميسان (العمارة)',
  'المثنى (السماوة)',
  'القادسية (الديوانية)',
  'واسط (الكوت)',
  'دهوك',
  'السليمانية'
];

export const AuthModal: React.FC<AuthModalProps> = ({ onClose, onOpenVip }) => {
  const {
    currentUser,
    loginWithEmail,
    addNewStudent,
    stages,
    users
  } = useCurriculum();

  const [activeTab, setActiveTab] = useState<'register' | 'login'>('register');

  // Registration state: Stage MUST be first
  const [regStageId, setRegStageId] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regGovernorate, setRegGovernorate] = useState(IRAQI_GOVERNORATES[0]);
  const [regPhone, setRegPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  // Login form state
  const [loginInput, setLoginInput] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Auto-generate username suggestion from name or email
  const handleNameChange = (val: string) => {
    setRegName(val);
    if (!regUsername) {
      const slug = val.trim().replace(/\s+/g, '_');
      setRegUsername(slug);
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regStageId) {
      setRegError('يرجى تحديد المرحلة الدراسية من القائمة المنسدلة أولاً.');
      return;
    }
    if (!regName.trim()) {
      setRegError('يرجى إدخال اسم الطالب الثلاثي.');
      return;
    }
    if (!regEmail.trim()) {
      setRegError('يرجى إدخال البريد الإلكتروني.');
      return;
    }
    if (!regUsername.trim()) {
      setRegError('يرجى إدخال اسم المستخدم.');
      return;
    }
    if (!regPassword.trim() || regPassword.trim().length < 4) {
      setRegError('كلمة المرور يجب أن تتكون من 4 أحرف أو أرقام على الأقل.');
      return;
    }

    const cleanEmail = regEmail.trim().toLowerCase();
    const cleanUsername = regUsername.trim().toLowerCase();

    // Check if email or username already exists
    const emailExists = users.some(u => u.email.toLowerCase() === cleanEmail);
    if (emailExists) {
      setRegError('هذا البريد الإلكتروني مسجل مسبقاً، يمكنك تسجيل الدخول به.');
      return;
    }

    const newStudentUser: UserAccount = {
      email: cleanEmail,
      name: regName.trim(),
      username: cleanUsername,
      role: 'student',
      isVip: false,
      targetStageId: regStageId,
      password: regPassword.trim(),
      governorate: regGovernorate,
      phoneNumber: regPhone.trim() || undefined,
      registeredAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString()
    };

    addNewStudent(newStudentUser);
    onClose();
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!loginInput.trim()) {
      setLoginError('يرجى إدخال البريد الإلكتروني أو اسم المستخدم.');
      return;
    }

    const clean = loginInput.trim().toLowerCase();
    const foundUser = users.find(
      u => u.email.toLowerCase() === clean || u.username.toLowerCase() === clean
    );

    if (foundUser) {
      loginWithEmail(foundUser.email, foundUser.name, foundUser.role);
      onClose();
    } else {
      // Allow dynamic student login with email
      loginWithEmail(clean, clean.split('@')[0], 'student');
      onClose();
    }
  };

  const handleSwitchToDemo = (demoEmail: string, demoName: string, demoRole: 'student' | 'teacher') => {
    loginWithEmail(demoEmail, demoName, demoRole);
    onClose();
  };

  const selectedStageObj = stages.find(s => s.id === regStageId);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900">
              بوابة الدخول وتسجيل حساب الطالب العراقي
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs: Register New Student vs Sign In */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-100 border-b border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'register'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4 text-emerald-600" />
            <span>إنشاء حساب طالب جديد</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('login')}
            className={`py-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'login'
                ? 'bg-white text-indigo-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Mail className="w-4 h-4 text-indigo-600" />
            <span>تسجيل الدخول لحساب قائم</span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {/* TAB 1: NEW STUDENT REGISTRATION WITH STAGE-FIRST LOCK */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              {regError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 font-bold text-xs">
                  {regError}
                </div>
              )}

              {/* STEP 1: FIRST OPTION IS THE STAGE DROPDOWN */}
              <div className="p-4 bg-emerald-50/80 border-2 border-emerald-300 rounded-2xl space-y-2 shadow-2xs">
                <div className="flex items-center justify-between">
                  <label htmlFor="stage-dropdown-select" className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-bold">
                      1
                    </span>
                    <span>الخطوة الأولى: تحديد المرحلة الدراسية (إلزامي للبدء):</span>
                  </label>
                  {regStageId && (
                    <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                      <Unlock className="w-3.5 h-3.5" />
                      <span>تم فتح الحقول</span>
                    </span>
                  )}
                </div>

                <div className="relative">
                  <select
                    id="stage-dropdown-select"
                    value={regStageId}
                    onChange={e => setRegStageId(e.target.value)}
                    className="w-full p-3 bg-white border border-emerald-400 focus:border-emerald-600 rounded-xl text-slate-900 font-bold text-sm cursor-pointer shadow-xs focus:ring-2 focus:ring-emerald-500 transition-all"
                  >
                    <option value="">-- اضغط هنا لاختيار مرحلتك الدراسية أولاً --</option>
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
                </div>

                <p className="text-[11px] text-emerald-800 leading-relaxed font-medium">
                  {regStageId
                    ? `المرحلة المختارة: ${selectedStageObj?.name} (سيتم تقييد حسابك ومحتواك على هذه المرحلة فقط)`
                    : 'يجب اختيار الصف الدراسي من القائمة المنسدلة لفتح باقي بيانات التسجيل'}
                </p>
              </div>

              {/* STEP 2: FIELDS UNLOCK ONLY AFTER STAGE IS SELECTED */}
              {!regStageId ? (
                /* LOCKED PLACEHOLDER BANNER */
                <div className="p-6 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300 text-center space-y-2.5">
                  <div className="w-12 h-12 rounded-2xl bg-slate-200 text-slate-500 flex items-center justify-center mx-auto shadow-inner">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div>
                    <strong className="block text-slate-800 text-sm font-bold">
                      بيانات الطالب (الاسم، الإيميل، اليوزر، الباسورد) مقفلة
                    </strong>
                    <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto leading-relaxed">
                      حدد المرحلة الدراسية من القائمة المنسدلة أعلاه أولاً. بمجرد اختيارها ستفتح كافة حقول التسجيل مباشرة.
                    </p>
                  </div>
                </div>
              ) : (
                /* UNLOCKED INPUTS */
                <div className="space-y-3.5 pt-1 animate-fadeIn">
                  <div className="p-2.5 bg-emerald-100/70 border border-emerald-300 rounded-xl flex items-center gap-2 text-emerald-900 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>تم فتح حقول التسجيل! يرجى إدخال بياناتك للمتابعة:</span>
                  </div>

                  {/* Student Full Name */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      اسم الطالب الثلاثي:
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="مثال: علي حيدر الكرخي"
                        value={regName}
                        onChange={e => handleNameChange(e.target.value)}
                        className="w-full p-2.5 pr-9 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500"
                      />
                      <User className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  {/* Email & Username */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        البريد الإلكتروني:
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          dir="ltr"
                          placeholder="student@example.com"
                          value={regEmail}
                          onChange={e => setRegEmail(e.target.value)}
                          className="w-full p-2.5 pr-9 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-emerald-500"
                        />
                        <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        اسم المستخدم (اليوزر نيم):
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          dir="ltr"
                          placeholder="ali_karkh"
                          value={regUsername}
                          onChange={e => setRegUsername(e.target.value)}
                          className="w-full p-2.5 pr-9 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono font-bold focus:ring-2 focus:ring-emerald-500"
                        />
                        <span className="text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 font-mono font-bold">
                          @
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Password with visibility toggle */}
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      كلمة المرور (الباسورد):
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        dir="ltr"
                        placeholder="••••••••"
                        value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        className="w-full p-2.5 pr-9 pl-9 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono font-bold focus:ring-2 focus:ring-emerald-500"
                      />
                      <KeyRound className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-1 text-slate-400 hover:text-slate-700 absolute left-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Iraqi Governorate & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        المحافظة العراقية:
                      </label>
                      <div className="relative">
                        <select
                          value={regGovernorate}
                          onChange={e => setRegGovernorate(e.target.value)}
                          className="w-full p-2.5 pr-9 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold cursor-pointer"
                        >
                          {IRAQI_GOVERNORATES.map(gov => (
                            <option key={gov} value={gov}>{gov}</option>
                          ))}
                        </select>
                        <MapPin className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">
                        رقم الهاتف / الواتساب (اختياري):
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          dir="ltr"
                          placeholder="0770xxxxxxx"
                          value={regPhone}
                          onChange={e => setRegPhone(e.target.value)}
                          className="w-full p-2.5 pr-9 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono"
                        />
                        <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600">
                    <span className="font-bold text-slate-800">ملاحظة الخصوصية:</span> عند التسجيل، ستدخل مباشرة على صفك المختار ({selectedStageObj?.name}) ولن تظهر أمامك صفوف أخرى لضمان تركيزك التام على منهاجك الوزاري.
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 text-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>إتمام تسجيل الحساب والدخول المباشر لمرحلتي</span>
                  </button>
                </div>
              )}
            </form>
          )}

          {/* TAB 2: SIGN IN FOR EXISTING USERS */}
          {activeTab === 'login' && (
            <div className="space-y-4">
              {/* Current Active User Banner */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-slate-400 font-medium block">الحساب النشط حالياً:</span>
                <div className="flex items-center justify-between">
                  <div>
                    <strong className="text-sm font-bold text-slate-900 block">{currentUser.name}</strong>
                    <span className="font-mono text-slate-500 text-[11px]">{currentUser.email}</span>
                  </div>
                  <div className="text-left">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold block mb-1 ${
                      currentUser.role === 'teacher' ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {currentUser.role === 'teacher' ? 'مدرس / مشرف' : 'طالب مدرسي'}
                    </span>
                    {currentUser.isVip ? (
                      <span className="text-amber-700 font-bold flex items-center gap-1 text-[11px]">
                        <Crown className="w-3 h-3 fill-amber-500" />
                        <span>مشترك VIP</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          onClose();
                          onOpenVip();
                        }}
                        className="text-amber-700 hover:underline font-bold text-[11px]"
                      >
                        تفعيل VIP +
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Demo Switcher */}
              <div>
                <span className="font-bold text-slate-700 block mb-2">أو التبديل السريع لحساب تجريبي:</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSwitchToDemo('mohamedsky1986@gmail.com', 'أ. محمد السماوي (المشرف)', 'teacher')}
                    className="p-2.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl text-right transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-1 text-indigo-800 font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>حساب المشرف والمدرس</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block truncate">mohamedsky1986@gmail.com</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSwitchToDemo('ali.student@nobogh.iq', 'علي أحمد الكرخي', 'student')}
                    className="p-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-right transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-1 text-emerald-800 font-bold">
                      <User className="w-3.5 h-3.5" />
                      <span>طالب (الثالث متوسط)</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block truncate">ali.student@nobogh.iq</span>
                  </button>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-3 pt-3 border-t border-slate-100">
                {loginError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 font-bold text-xs">
                    {loginError}
                  </div>
                )}

                <div>
                  <label className="block text-slate-600 mb-1 font-bold">
                    البريد الإلكتروني أو اسم المستخدم:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="student@nobogh.iq أو ali_karkh"
                    value={loginInput}
                    onChange={e => setLoginInput(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 mb-1 font-bold">
                    كلمة المرور:
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-medium"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all cursor-pointer shadow-xs"
                >
                  دخول الحساب والمتابعة
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
