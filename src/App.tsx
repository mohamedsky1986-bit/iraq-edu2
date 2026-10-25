import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { db } from './firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { 
  GraduationCap, ShieldCheck, MapPin, BookOpen, Video, FileText, 
  Award, ArrowRight, UserCheck, Users, ChevronDown, CheckCircle2, 
  Sparkles, PlusCircle, Trash2, Crown, Lock, Unlock, Settings, Play, Download, CheckSquare, Edit3, Image as ImageIcon, Eye, X, Key, User, Clock, CheckCircle, AlertCircle, FileText as NoteIcon, MessageCircle, CreditCard
} from 'lucide-react';

export function App() {
  const [isAdmin, setIsAdmin] = useState<boolean>(true);
  const [adminName, setAdminName] = useState<string>('د. أحمد النابغة (المدير العام)');
  const [adminUsername, setAdminUsername] = useState<string>('admin');
  const [adminPassword, setAdminPassword] = useState<string>('123456');
  
  const [vipSettings, setVipSettings] = useState({
    price: '25,000 دينار عراقي / شهرياً',
    mastercard: '9876-5432-1098-7654 (مصرف الرافدين)',
    transferPhone: '07701234567 (زين كاش / آسياسيل)',
    whatsapp: '9647701234567'
  });

  const [vipModalItem, setVipModalItem] = useState<any | null>(null);

  const [loggedStudent, setLoggedStudent] = useState<any | null>(null);
  const [studentLoginUser, setStudentLoginUser] = useState('');
  const [studentLoginPass, setStudentLoginPass] = useState('');
  const [isStudentSignup, setIsStudentSignup] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentStage, setNewStudentStage] = useState('الثالث المتوسط');

  const [activeTab, setActiveTab] = useState<'curriculum' | 'students' | 'adminPanel' | 'settings' | 'vipSettings'>('curriculum');
  const [selectedStage, setSelectedStage] = useState<string>('third_intermediate'); 
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [activePdfUrl, setActivePdfUrl] = useState<string | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<any | null>(null);

  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizResult, setQuizResult] = useState<{score: number, total: number, details: any[]} | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(900);
  const [timerActive, setTimerActive] = useState<boolean>(false);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  const allStagesList = [
    { id: 'first_intermediate', name: 'الأول المتوسط' },
    { id: 'second_intermediate', name: 'الثاني المتوسط' },
    { id: 'third_intermediate', name: 'الثالث المتوسط' },
    { id: 'fourth_sci', name: 'الرابع العلمي' },
    { id: 'fourth_lit', name: 'الرابع الأدبي' },
    { id: 'fifth_sci', name: 'الخامس العلمي' },
    { id: 'fifth_lit', name: 'الخامس الأدبي' },
    { id: 'sixth_sci', name: 'السادس العلمي' },
    { id: 'sixth_lit', name: 'السادس الأدبي' },
  ];

  useEffect(() => {
    async function loadDataFromFirebase() {
      try {
        const subsSnap = await getDocs(collection(db, 'subjects'));
        if (!subsSnap.empty) {
          setSubjects(subsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        } else {
          const defaultSub = {
            name: 'الرياضيات',
            stage: 'third_intermediate',
            stageName: 'الثالث المتوسط',
            icon: '📐',
            color: 'from-indigo-600 to-violet-800',
            image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=500&q=80',
            videos: [{ id: 'v1', title: 'محاضرة الفصل الأول: المتباينات', url: 'https://www.youtube.com/embed/T1SxpvU-iqA', duration: '45 دقيقة', isVip: false }],
            booklets: [{ id: 'b1', title: 'ملزمة الرياضيات الشاملة (PDF)', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', size: '18 MB', isVip: false }],
            notes: [],
            quizzes: []
          };
          const docRef = await addDoc(collection(db, 'subjects'), defaultSub);
          setSubjects([{ id: docRef.id, ...defaultSub }]);
        }

        const studsSnap = await getDocs(collection(db, 'students'));
        if (!studsSnap.empty) {
          setStudentsList(studsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        } else {
          const defaultStudent = { name: 'علي محمد حسن', username: 'ali', pass: '123', stage: 'الثالث المتوسط', isVip: true, status: 'متصل الآن', lastSeen: 'الآن', regDate: '2026-10-01', examScore: 'لم يتقدم' };
          const docRef = await addDoc(collection(db, 'students'), defaultStudent);
          setStudentsList([{ id: docRef.id, ...defaultStudent }]);
        }
      } catch (e) {
        console.error('Firebase load error:', e);
      }
    }
    loadDataFromFirebase();
  }, []);

  const [newSubName, setNewSubName] = useState('');
  const [newSubStage, setNewSubStage] = useState('third_intermediate');
  const [newSubImage, setNewSubImage] = useState('');

  const filteredSubjects = selectedStage === 'all' 
    ? subjects 
    : subjects.filter(s => s.stage === selectedStage);

  if (!loggedStudent && !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl space-y-6">
          <div className="text-center">
            <GraduationCap className="w-14 h-14 text-indigo-600 mx-auto mb-2 animate-bounce" />
            <h2 className="text-2xl font-black text-slate-900">منصة النابغة التعليمية PRO</h2>
            <p className="text-xs text-slate-500 mt-1">عذراً، يجب تسجيل الدخول للوصول إلى المناهج والامتحانات</p>
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            const found = studentsList.find(st => st.username === studentLoginUser && st.pass === studentLoginPass);
            if (found) {
              setLoggedStudent(found);
              setSuccessMessage(`أهلاً بك يا ${found.name}!`);
            } else {
              alert('اسم المستخدم أو كلمة المرور غير صحيحة.');
            }
          }} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">اسم المستخدم</label>
              <input type="text" required value={studentLoginUser} onChange={(e) => setStudentLoginUser(e.target.value)} placeholder="اليوزر الخاص بك..." className="w-full px-4 py-2.5 rounded-xl border text-sm font-bold font-mono" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">كلمة المرور</label>
              <input type="password" required value={studentLoginPass} onChange={(e) => setStudentLoginPass(e.target.value)} placeholder="كلمة المرور..." className="w-full px-4 py-2.5 rounded-xl border text-sm font-bold font-mono" />
            </div>
            <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md">
              تسجيل الدخول للمنصة
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 font-sans antialiased">
      <div className="sticky top-0 z-40 shadow-md">
        <Navbar 
          isAdmin={isAdmin}
          setIsAdmin={setIsAdmin}
          adminName={adminName}
          setAdminName={setAdminName}
        />
      </div>

      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between py-3 gap-3">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <button 
              onClick={() => { setActiveTab('curriculum'); setSelectedSubjectId(null); }}
              className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${activeTab === 'curriculum' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              <BookOpen className="w-4 h-4" /> المنهج الدراسي والصفوف
            </button>
            {isAdmin && (
              <button 
                onClick={() => { setActiveTab('adminPanel'); setSelectedSubjectId(null); }}
                className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${activeTab === 'adminPanel' ? 'bg-emerald-600 text-white shadow-md' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}
              >
                <Settings className="w-4 h-4" /> إضافة المواد والصور
              </button>
            )}
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 w-full">
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl flex items-center gap-3 text-sm font-bold shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {activeTab === 'curriculum' && !selectedSubjectId && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl">📚</div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">اختر الصف الدراسي المطلوب</h3>
                  <p className="text-xs text-slate-500">يتضمن كافة المراحل والصفوف الدراسية التسع في العراق</p>
                </div>
              </div>

              <div className="relative w-full sm:w-96">
                <select 
                  value={selectedStage}
                  onChange={(e) => setSelectedStage(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-indigo-200 text-slate-900 text-sm font-black rounded-xl px-4 py-3.5 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-sm"
                >
                  <option value="all">🌟 عرض كافة المراحل والصفوف الدراسية</option>
                  {allStagesList.map(st => (
                    <option key={st.id} value={st.id}>{st.name}</option>
                  ))}
                </select>
                <ChevronDown className="w-5 h-5 text-indigo-600 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSubjects.map((sub) => (
                <div 
                  key={sub.id}
                  className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200/80 group flex flex-col justify-between relative"
                >
                  <div onClick={() => setSelectedSubjectId(sub.id)} className="h-40 w-full relative overflow-hidden bg-slate-200 cursor-pointer">
                    <img src={sub.image} alt={sub.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                    <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-white">
                      <span className="text-xs font-black bg-indigo-600/90 px-3 py-1 rounded-lg">{sub.stageName}</span>
                      <span className="text-2xl">{sub.icon}</span>
                    </div>
                  </div>
                  
                  <div onClick={() => setSelectedSubjectId(sub.id)} className="p-6 cursor-pointer">
                    <h3 className="text-xl font-black text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                      {sub.name}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'adminPanel' && isAdmin && (
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-emerald-200 space-y-6">
            <h2 className="text-2xl font-black text-slate-900">لوحة إضافة المواد والصور المخصصة</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!newSubName) return;
              const foundStageObj = allStagesList.find(st => st.id === newSubStage);
              const newObj = {
                name: newSubName,
                stage: newSubStage,
                stageName: foundStageObj ? foundStageObj.name : 'المرحلة الدراسية',
                icon: '📚',
                color: 'from-blue-600 to-indigo-800',
                image: newSubImage || 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=500&q=80',
                videos: [], booklets: [], notes: [], quizzes: []
              };
              try {
                const docRef = await addDoc(collection(db, 'subjects'), newObj);
                setSubjects([{ id: docRef.id, ...newObj }, ...subjects]);
                setNewSubName('');
                setNewSubImage('');
                setSuccessMessage('تمت إضافة المادة وحفظها في قاعدة البيانات بنجاح!');
                setTimeout(() => setSuccessMessage(null), 3000);
              } catch (err) {
                console.error(err);
              }
            }} className="bg-slate-50 p-6 rounded-2xl border space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input type="text" required value={newSubName} onChange={(e) => setNewSubName(e.target.value)} placeholder="اسم المادة..." className="px-4 py-2.5 rounded-xl border text-sm font-bold bg-white" />
                <select value={newSubStage} onChange={(e) => setNewSubStage(e.target.value)} className="px-4 py-2.5 rounded-xl border text-sm font-bold bg-white">
                  {allStagesList.map(st => (
                    <option key={st.id} value={st.id}>{st.name}</option>
                  ))}
                </select>
                <input type="text" value={newSubImage} onChange={(e) => setNewSubImage(e.target.value)} placeholder="رابط صورة المادة..." className="px-4 py-2.5 rounded-xl border text-sm font-bold bg-white font-mono" />
              </div>
              <button type="submit" className="bg-emerald-600 text-white font-bold py-3 px-8 rounded-xl text-xs shadow-md">
                إضافة ونشر المادة
              </button>
            </form>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between text-xs text-slate-500">
          <span className="font-bold text-slate-800">منصة النابغة التعليمية - المنهج العراقي الرسمي</span>
          <span>بغداد - العراق</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
