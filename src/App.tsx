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
  
  // إعدادات الدفع واشتراكات الـ VIP
  const [vipSettings, setVipSettings] = useState({
    price: '25,000 دينار عراقي / شهرياً',
    mastercard: '9876-5432-1098-7654 (مصرف الرافدين)',
    transferPhone: '07701234567 (زين كاش / آسياسيل)',
    whatsapp: '9647701234567'
  });

  const [vipModalItem, setVipModalItem] = useState<any | null>(null);

  // نظام تسجيل دخول الطالب
  const [loggedStudent, setLoggedStudent] = useState<any | null>(null);
  const [studentLoginUser, setStudentLoginUser] = useState('');
  const [studentLoginPass, setStudentLoginPass] = useState('');
  const [isStudentSignup, setIsStudentSignup] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentStage, setNewStudentStage] = useState('الثالث المتوسط');

  const [activeTab, setActiveTab] = useState<'curriculum' | 'students' | 'adminPanel' | 'settings' | 'vipSettings'>('curriculum');
  const [selectedStage, setSelectedStage] = useState<string>('third_intermediate'); 
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  
  // المشغلات وقارئ الـ PDF والاختبارات
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [activePdfUrl, setActivePdfUrl] = useState<string | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<any | null>(null);

  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizResult, setQuizResult] = useState<{score: number, total: number, details: any[]} | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(900);
  const [timerActive, setTimerActive] = useState<boolean>(false);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // قاعدة بيانات الطلبة والمواد (متزامنة مع Firebase)
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editUser, setEditUser] = useState('');
  const [editPass, setEditPass] = useState('');

  // المراحل التسع الرسمية
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

  // جلب البيانات من Firestore عند فتح التطبيق
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
            notes: [{ id: 'n1', title: 'تعليل: لماذا تعتبر الأعداد الحقيقية أساس الرياضيات؟', content: 'لأنها تتضمن الأعداد النسبية وغير النسبية وتغطي كافة العمليات الحسابية.', image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=400&q=80', isVip: false }],
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

  // حقول الإضافة داخل المادة
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoVip, setNewVideoVip] = useState(false);
  
  const [newBookletTitle, setNewBookletTitle] = useState('');
  const [newBookletUrl, setNewBookletUrl] = useState('');
  const [newBookletVip, setNewBookletVip] = useState(false);

  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteImage, setNewNoteImage] = useState('');
  const [newNoteVip, setNewNoteVip] = useState(false);
  
  const [quizTitle, setQuizTitle] = useState('');
  const [quizIsVip, setQuizIsVip] = useState(false);
  const [questionType, setQuestionType] = useState<'mcq' | 'fill' | 'true_false'>('mcq');
  const [questionText, setQuestionText] = useState('');
  const [mcqOptions, setMcqOptions] = useState(['', '', '', '']);
  const [mcqCorrect, setMcqCorrect] = useState('');
  const [fillCorrect, setFillCorrect] = useState('');
  const [tfCorrect, setTfCorrect] = useState('صح');
  const [currentQuestionsList, setCurrentQuestionsList] = useState<any[]>([]);

  const [newSubName, setNewSubName] = useState('');
  const [newSubStage, setNewSubStage] = useState('third_intermediate');
  const [newSubImage, setNewSubImage] = useState('');

  useEffect(() => {
    let interval: any;
    if (timerActive && timeLeft > 0 && !quizResult) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && timerActive && !quizResult) {
      handleGradeQuiz();
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft, quizResult]);

  const formatYouTubeUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('embed/')) return url;
    let videoId = '';
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    } else if (url.includes('watch?v=')) {
      videoId = url.split('watch?v=')[1]?.split('&')[0];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  };

  const checkAnswerFlexible = (userAns: string, correctAns: string) => {
    if (!userAns) return false;
    const cleanUser = userAns.trim().toLowerCase();
    const cleanCorrect = correctAns.trim().toLowerCase();
    if (cleanUser === cleanCorrect) return true;
    const correctWords = cleanCorrect.split(' ').filter((w: string) => w.length > 1);
    let matched = 0;
    correctWords.forEach((w: string) => {
      if (cleanUser.includes(w)) matched++;
    });
    if (correctWords.length > 0 && (matched / correctWords.length) >= 0.5) return true;
    if (cleanCorrect.includes(cleanUser) && cleanUser.length >= (cleanCorrect.length - 3)) return true;
    return false;
  };

  const handleAddQuestionToQuiz = () => {
    if (!questionText) return;
    if (questionType === 'mcq') {
      setCurrentQuestionsList([...currentQuestionsList, { type: 'mcq', q: questionText, options: mcqOptions, correct: mcqCorrect }]);
    } else if (questionType === 'fill') {
      setCurrentQuestionsList([...currentQuestionsList, { type: 'fill', q: questionText, correct: fillCorrect }]);
    } else {
      setCurrentQuestionsList([...currentQuestionsList, { type: 'true_false', q: questionText, options: ['صح', 'خطأ'], correct: tfCorrect }]);
    }
    setQuestionText('');
    setMcqOptions(['', '', '', '']);
    setMcqCorrect('');
    setFillCorrect('');
    setSuccessMessage('تمت إضافة السؤال بنجاح إلى ورقة الامتحان!');
    setTimeout(() => setSuccessMessage(null), 2500);
  };

  const handleSaveQuizToSubject = async (subjectId: string) => {
    if (!quizTitle || currentQuestionsList.length === 0) {
      alert('يرجى كتابة عنوان الامتحان وإضافة سؤال واحد على الأقل.');
      return;
    }
    const newQuizObj = { id: Date.now().toString(), title: quizTitle, isVip: quizIsVip, questions: currentQuestionsList };
    const targetSub = subjects.find(s => s.id === subjectId);
    if (!targetSub) return;
    const updatedQuizzes = [...(targetSub.quizzes || []), newQuizObj];

    try {
      await updateDoc(doc(db, 'subjects', subjectId), { quizzes: updatedQuizzes });
      setSubjects(subjects.map(sub => sub.id === subjectId ? { ...sub, quizzes: updatedQuizzes } : sub));
      setQuizTitle('');
      setQuizIsVip(false);
      setCurrentQuestionsList([]);
      setSuccessMessage('تم نشر الامتحان بنجاح في قاعدة البيانات!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleGradeQuiz = () => {
    if (!activeQuiz || !activeQuiz.questions) return;
    setTimerActive(false);
    let score = 0;
    const details = activeQuiz.questions.map((q: any, idx: number) => {
      const userAns = quizAnswers[idx] || '';
      let isCorrect = false;
      if (q.type === 'mcq' || q.type === 'true_false') {
        isCorrect = userAns === q.correct;
      } else {
        isCorrect = checkAnswerFlexible(userAns, q.correct);
      }
      if (isCorrect) score += (100 / activeQuiz.questions.length);
      return { q: q.q, userAns, correct: q.correct, isCorrect };
    });

    const finalScore = Math.round(score);
    setQuizResult({ score: finalScore, total: 100, details });

    if (loggedStudent) {
      setStudentsList(studentsList.map(st => st.id === loggedStudent.id ? {...st, examScore: `${finalScore}/100`} : st));
    }
    setSuccessMessage(`أتممت الامتحان بنجاح! درجتك: ${finalScore}/100`);
  };

  const filteredSubjects = selectedStage === 'all' 
    ? subjects 
    : subjects.filter(s => s.stage === selectedStage);

  // بوابة تسجيل دخول الطلاب الإجبارية للزائر
  if (!loggedStudent && !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl space-y-6">
          <div className="text-center">
            <GraduationCap className="w-14 h-14 text-indigo-600 mx-auto mb-2 animate-bounce" />
            <h2 className="text-2xl font-black text-slate-900">منصة النابغة التعليمية PRO</h2>
            <p className="text-xs text-slate-500 mt-1">عذراً، يجب تسجيل الدخول للوصول إلى المناهج والامتحانات</p>
          </div>

          {isStudentSignup ? (
            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!newStudentName || !studentLoginUser || !studentLoginPass) return;
              const newSt = {
                name: newStudentName,
                username: studentLoginUser,
                pass: studentLoginPass,
                stage: newStudentStage,
                isVip: false,
                status: 'متصل الآن',
                lastSeen: 'الآن',
                regDate: new Date().toISOString().split('T')[0],
                examScore: 'لم يتقدم'
              };
              try {
                const docRef = await addDoc(collection(db, 'students'), newSt);
                const savedSt = { id: docRef.id, ...newSt };
                setStudentsList([savedSt, ...studentsList]);
                setLoggedStudent(savedSt);
                setSuccessMessage('تم إنشاء الحساب وتسجيل الدخول بنجاح!');
              } catch (err) {
                console.error(err);
              }
            }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم الطالب الثلاثي</label>
                <input type="text" required value={newStudentName} onChange={(e) => setNewStudentName(e.target.value)} placeholder="مثال: محمد قاسم كريم" className="w-full px-4 py-2.5 rounded-xl border text-sm font-bold" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الصف الدراسي</label>
                <select value={newStudentStage} onChange={(e) => setNewStudentStage(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border text-sm font-bold">
                  {allStagesList.map(st => (
                    <option key={st.id} value={st.name}>{st.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم المستخدم (Username)</label>
                <input type="text" required value={studentLoginUser} onChange={(e) => setStudentLoginUser(e.target.value)} placeholder="اختر يوزر..." className="w-full px-4 py-2.5 rounded-xl border text-sm font-bold font-mono" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">كلمة المرور (Password)</label>
                <input type="password" required value={studentLoginPass} onChange={(e) => setStudentLoginPass(e.target.value)} placeholder="كلمة المرور..." className="w-full px-4 py-2.5 rounded-xl border text-sm font-bold font-mono" />
              </div>
              <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md">
                تسجيل حساب جديد ودخول المنصة
              </button>
              <div className="text-center pt-2">
                <button type="button" onClick={() => setIsStudentSignup(false)} className="text-xs text-indigo-600 font-bold hover:underline">
                  لديك حساب بالفعل؟ تسجيل الدخول
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={(e) => {
              e.preventDefault();
              const found = studentsList.find(st => st.username === studentLoginUser && st.pass === studentLoginPass);
              if (found) {
                setLoggedStudent(found);
                setSuccessMessage(`أهلاً بك يا ${found.name}!`);
              } else {
                alert('اسم المستخدم أو كلمة المرور غير صحيحة، أو لم يتم اعتماد حسابك.');
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
              <div className="flex items-center justify-between pt-2">
                <button type="button" onClick={() => setIsStudentSignup(true)} className="text-xs text-indigo-600 font-bold hover:underline">
                  إنشاء حساب جديد
                </button>
                <button type="button" onClick={() => { setIsAdmin(true); }} className="text-xs text-slate-500 font-bold hover:underline">
                  دخول المدير (الأدمن)
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 font-sans antialiased">
      
      {/* نافذة تفاصيل الدفع واشتراك الـ VIP */}
      {vipModalItem && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl relative space-y-6 text-right">
            <button onClick={() => setVipModalItem(null)} className="absolute top-4 left-4 w-10 h-10 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-full flex items-center justify-center font-bold">
              <X className="w-5 h-5" />
            </button>
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto text-3xl shadow-inner">⭐</div>
              <h3 className="text-2xl font-black text-slate-900">محتوى حصري (VIP)</h3>
              <p className="text-xs text-slate-500">هذا المحتوى يتطلب تفعيل اشتراك VIP للوصول إليه.</p>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border space-y-3 text-xs font-bold text-slate-800">
              <div className="flex justify-between items-center pb-2 border-b">
                <span>سعر الاشتراك:</span>
                <span className="text-indigo-600 font-black text-sm">{vipSettings.price}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span>رقم الماستر كارد / المصرف:</span>
                <span className="font-mono text-slate-900">{vipSettings.mastercard}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span>تحويل رصيد (زين كاش / آسياسيل):</span>
                <span className="font-mono text-indigo-700">{vipSettings.transferPhone}</span>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-600 text-center">بعد إتمام التحويل، يرجى إرسال إيصال الدفع عبر الواتساب:</p>
              <a 
                href={`https://wa.me/${vipSettings.whatsapp}?text=${encodeURIComponent('مرحباً، أود تفعيل اشتراك الـ VIP في منصة النابغة التعليمية.')}`} 
                target="_blank" 
                rel="noreferrer"
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-lg flex items-center justify-center gap-2 text-sm"
              >
                <MessageCircle className="w-5 h-5" /> إرسال إيصال الدفع عبر الواتساب
              </a>
            </div>
          </div>
        </div>
      )}

      {/* مشغل الفيديو المنبثق */}
      {activeVideoUrl && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-4 shadow-2xl relative">
            <button onClick={() => setActiveVideoUrl(null)} className="absolute -top-4 -left-4 w-10 h-10 bg-rose-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
              <X className="w-5 h-5" />
            </button>
            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black">
              <iframe src={activeVideoUrl} className="w-full h-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
            </div>
          </div>
        </div>
      )}

      {/* قارئ الـ PDF المنبثق */}
      {activePdfUrl && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full h-[80vh] p-4 shadow-2xl relative flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="font-black text-lg">قارئ الملزمة والملخصات (PDF)</h3>
              <button onClick={() => setActivePdfUrl(null)} className="w-10 h-10 bg-rose-600 text-white rounded-full flex items-center justify-center font-bold">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 w-full rounded-2xl overflow-hidden bg-slate-100 mt-3">
              <iframe src={activePdfUrl} className="w-full h-full border-0"></iframe>
            </div>
          </div>
        </div>
      )}

      {/* نافذة خوض الامتحان التفاعلي */}
      {activeQuiz && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative space-y-6">
            <div className="flex items-center justify-between pb-4 border-b">
              <div>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-xl">امتحان تفاعلي ذكي</span>
                <h3 className="text-xl font-black text-slate-900 mt-1">{activeQuiz.title}</h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1.5 rounded-xl text-xs font-bold">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')} دقيقة</span>
                </div>
                <button onClick={() => { setActiveQuiz(null); setQuizResult(null); setQuizAnswers({}); setTimerActive(false); }} className="w-10 h-10 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 rounded-full flex items-center justify-center font-bold">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {quizResult ? (
              <div className="space-y-6 text-center py-6">
                <div className="w-24 h-24 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-4xl font-black mx-auto shadow-inner">
                  {quizResult.score}%
                </div>
                <h4 className="text-2xl font-black text-slate-900">نتيجة الامتحان النهائي</h4>
                <div className="space-y-3 text-right">
                  {quizResult.details.map((det: any, dIdx: number) => (
                    <div key={dIdx} className={`p-4 rounded-2xl border ${det.isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
                      <div className="font-bold text-sm">س{dIdx+1}: {det.q}</div>
                      <div className="text-xs mt-1">إجابتك: <b>{det.userAns || 'بدون إجابة'}</b> {det.isCorrect ? '✅ صحيحة' : `❌ خاطئة (الصحيح: ${det.correct})`}</div>
                    </div>
                  ))}
                </div>
                <button onClick={() => { setActiveQuiz(null); setQuizResult(null); setQuizAnswers({}); setTimerActive(false); }} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-md">
                  إغلاق ورقة الامتحان
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {activeQuiz.questions?.map((q: any, qIdx: number) => (
                  <div key={qIdx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="font-black text-slate-900 text-sm">السؤال {qIdx+1}: {q.q}</div>
                    {q.type === 'mcq' || q.type === 'true_false' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt: string, oIdx: number) => (
                          <label key={oIdx} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer font-bold text-xs transition-all ${quizAnswers[qIdx] === opt ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white border-slate-200 hover:bg-slate-100'}`}>
                            <input type="radio" name={`q_${qIdx}`} checked={quizAnswers[qIdx] === opt} onChange={() => setQuizAnswers({...quizAnswers, [qIdx]: opt})} className="hidden" />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <input 
                        type="text" 
                        placeholder="اكتب إجابتك هنا..." 
                        value={quizAnswers[qIdx] || ''} 
                        onChange={(e) => setQuizAnswers({...quizAnswers, [qIdx]: e.target.value})} 
                        className="w-full px-4 py-3 bg-white rounded-xl border text-sm font-bold" 
                      />
                    )}
                  </div>
                ))}
                <button onClick={handleGradeQuiz} className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-lg text-sm">
                  تسليم ورقة الامتحان وعرض النتيجة الفورية
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* شريط التنقل العلوي */}
      <div className="sticky top-0 z-40 shadow-md">
        <Navbar 
          isAdmin={isAdmin}
          setIsAdmin={setIsAdmin}
          adminName={adminName}
          setAdminName={setAdminName}
        />
      </div>

      {/* شريط التبويبات */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between py-3 gap-3">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <button 
              onClick={() => { setActiveTab('curriculum'); setSelectedSubjectId(null); }}
              className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${activeTab === 'curriculum' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              <BookOpen className="w-4 h-4" /> المنهج الدراسي والصفوف
            </button>
            {isAdmin ? (
              <>
                <button 
                  onClick={() => { setActiveTab('students'); setSelectedSubjectId(null); }}
                  className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${activeTab === 'students' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  <Users className="w-4 h-4" /> إدارة الطلبة والـ VIP
                </button>
                <button 
                  onClick={() => { setActiveTab('adminPanel'); setSelectedSubjectId(null); }}
                  className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${activeTab === 'adminPanel' ? 'bg-emerald-600 text-white shadow-md' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}
                >
                  <Settings className="w-4 h-4" /> إضافة المواد والصور
                </button>
                <button 
                  onClick={() => { setActiveTab('vipSettings'); setSelectedSubjectId(null); }}
                  className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${activeTab === 'vipSettings' ? 'bg-amber-600 text-white shadow-md' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}
                >
                  <Crown className="w-4 h-4" /> إعدادات اشتراكات VIP
                </button>
                <button 
                  onClick={() => { setActiveTab('settings'); setSelectedSubjectId(null); }}
                  className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 ${activeTab === 'settings' ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                >
                  <Key className="w-4 h-4" /> إعدادات حساب الأدمن
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 bg-indigo-50 px-3 py-2 rounded-xl text-indigo-900 text-xs font-bold">
                <User className="w-4 h-4 text-indigo-600" />
                <span>الطالب: {loggedStudent?.name} ({loggedStudent?.stage}) {loggedStudent?.isVip ? '⭐ VIP' : 'مجاني'}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {isAdmin ? (
              <button onClick={() => { setIsAdmin(false); setLoggedStudent(null); }} className="px-3 py-1.5 bg-violet-600 text-white rounded-xl text-xs font-bold shadow">
                خروج / تسجيل دخول طالب
              </button>
            ) : (
              <button onClick={() => { setIsAdmin(true); setLoggedStudent(null); }} className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold shadow">
                العودة لوحة الأدمن
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
        
        {/* البانر */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 rounded-3xl shadow-xl text-white p-8 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-indigo-800/60 border border-indigo-600/30 px-3 py-1 rounded-xl text-xs font-bold mb-4 text-indigo-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> منصة النابغة التعليمية - المنهج العراقي الرسمي
            </div>
            <h1 className="text-3xl sm:text-4xl font-black mb-3 tracking-tight">
              إدارة المناهج، الامتحانات الذكية، والشروحات التفاعلية 🎓
            </h1>
          </div>
        </div>

        {/* 1. تبويب المنهج الدراسي */}
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
                  {isAdmin && (
                    <button 
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (window.confirm(`هل أنت متأكد من حذف مادة ${sub.name}?`)) {
                          try {
                            await deleteDoc(doc(db, 'subjects', sub.id));
                            setSubjects(subjects.filter(s => s.id !== sub.id));
                            setSuccessMessage('تم حذف المادة بنجاح.');
                            setTimeout(() => setSuccessMessage(null), 3000);
                          } catch (err) {
                            console.error(err);
                          }
                        }
                      }}
                      className="absolute top-3 left-3 w-9 h-9 bg-rose-600 hover:bg-rose-700 text-white rounded-xl flex items-center justify-center shadow-lg z-20 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

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
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600">
                      <span>{sub.videos?.length || 0} فيديو</span>
                      <span>•</span>
                      <span>{sub.booklets?.length || 0} ملزمة</span>
                      <span>•</span>
                      <span>{sub.quizzes?.length || 0} امتحان</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. إدارة المادة الدراسية المفصلة */}
        {selectedSubjectId && (() => {
          const currentSub = subjects.find(s => s.id === selectedSubjectId);
          if (!currentSub) return null;
          return (
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-indigo-100 space-y-8">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-200">إدارة مادة دراسية</span>
                  <h3 className="text-2xl font-black text-slate-900 mt-2 flex items-center gap-3">
                    <span className="text-3xl">{currentSub.icon}</span> {currentSub.name} ({currentSub.stageName})
                  </h3>
                </div>
                <button onClick={() => setSelectedSubjectId(null)} className="text-xs font-bold bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl">
                  ← العودة لقائمة الصفوف
                </button>
              </div>

              {/* أ) الشروحات والتعاليل */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                <h4 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <NoteIcon className="w-5 h-5 text-amber-600" /> الشروحات والتعاليل والملاحظات ({currentSub.notes?.length || 0})
                </h4>
                <div className="space-y-4">
                  {currentSub.notes?.map((note: any) => (
                    <div key={note.id} className="p-5 bg-white rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-sm gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h5 className="font-black text-slate-900 text-sm">💡 {note.title}</h5>
                          {note.isVip && <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-black">⭐ VIP</span>}
                        </div>
                        {note.isVip && !loggedStudent?.isVip && isAdmin === false ? (
                          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
                            <span className="text-xs font-bold text-amber-800 flex items-center gap-1"><Lock className="w-3.5 h-3.5" /> هذا الشرح خاص بمشتركي الـ VIP</span>
                            <button onClick={() => setVipModalItem(note)} className="px-3 py-1.5 bg-amber-500 text-white font-bold rounded-lg text-xs">شاهد تفاصيل الاشتراك</button>
                          </div>
                        ) : (
                          <>
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{note.content}</p>
                            {note.image && (
                              <div className="mt-3 h-48 w-full max-w-md rounded-xl overflow-hidden border">
                                <img src={note.image} alt={note.title} className="w-full h-full object-cover" />
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {isAdmin && (
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 mt-4">
                    <h5 className="text-xs font-black text-slate-800">إضافة شرح أو تعليل أو ملاحظة جديدة:</h5>
                    <input type="text" value={newNoteTitle} onChange={(e) => setNewNoteTitle(e.target.value)} placeholder="عنوان الشرح..." className="w-full px-4 py-2.5 rounded-xl border text-xs font-bold" />
                    <textarea value={newNoteContent} onChange={(e) => setNewNoteContent(e.target.value)} placeholder="نص الشرح التفصيلي..." className="w-full px-4 py-2.5 rounded-xl border text-xs font-bold h-24" />
                    <button onClick={async () => {
                      if (!newNoteTitle || !newNoteContent) return;
                      const newNoteObj = { id: Date.now().toString(), title: newNoteTitle, content: newNoteContent, image: newNoteImage, isVip: newNoteVip };
                      const updatedNotes = [...(currentSub.notes || []), newNoteObj];
                      await updateDoc(doc(db, 'subjects', currentSub.id), { notes: updatedNotes });
                      setSubjects(subjects.map(s => s.id === currentSub.id ? {...s, notes: updatedNotes} : s));
                      setNewNoteTitle(''); setNewNoteContent('');
                      setSuccessMessage('تمت إضافة الشرح بنجاح!');
                      setTimeout(() => setSuccessMessage(null), 3000);
                    }} className="w-full py-3 bg-amber-600 text-white rounded-xl text-xs font-bold shadow">
                      + نشر الشرح في المادة
                    </button>
                  </div>
                )}
              </div>

              {/* ب) الفيديوهات */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                <h4 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <Video className="w-5 h-5 text-indigo-600" /> الدروس المرئية ({currentSub.videos?.length || 0})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentSub.videos?.map((vid: any) => (
                    <div key={vid.id} className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm">
                      <span className="font-bold text-slate-800 text-sm">{vid.title}</span>
                      <button onClick={() => setActiveVideoUrl(vid.url)} className="px-3 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-md">
                        تشغيل
                      </button>
                    </div>
                  ))}
                </div>

                {isAdmin && (
                  <div className="bg-white p-4 rounded-xl border space-y-3 mt-4">
                    <h5 className="text-xs font-black text-slate-800">إضافة درس مرئي جديد:</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input type="text" value={newVideoTitle} onChange={(e) => setNewVideoTitle(e.target.value)} placeholder="عنوان الدرس..." className="px-4 py-2 rounded-xl border text-xs font-bold" />
                      <input type="text" value={newVideoUrl} onChange={(e) => setNewVideoUrl(e.target.value)} placeholder="رابط يوتيوب..." className="px-4 py-2 rounded-xl border text-xs font-bold font-mono" />
                    </div>
                    <button onClick={async () => {
                      if (!newVideoTitle || !newVideoUrl) return;
                      const formattedUrl = formatYouTubeUrl(newVideoUrl);
                      const newVidObj = { id: Date.now().toString(), title: newVideoTitle, url: formattedUrl, duration: '45 دقيقة', isVip: newVideoVip };
                      const updatedVids = [...(currentSub.videos || []), newVidObj];
                      await updateDoc(doc(db, 'subjects', currentSub.id), { videos: updatedVids });
                      setSubjects(subjects.map(s => s.id === currentSub.id ? {...s, videos: updatedVids} : s));
                      setNewVideoTitle(''); setNewVideoUrl('');
                      setSuccessMessage('تمت إضافة الفيديو بنجاح!');
                      setTimeout(() => setSuccessMessage(null), 3000);
                    }} className="w-full bg-indigo-600 text-white py-2 rounded-xl text-xs font-bold shadow">
                      + نشر الفيديو
                    </button>
                  </div>
                )}
              </div>

              {/* ج) الامتحانات والاختبارات */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-6">
                <h4 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-indigo-600" /> الامتحانات والاختبارات ({currentSub.quizzes?.length || 0})
                </h4>
                <div className="space-y-3">
                  {currentSub.quizzes?.map((quiz: any) => (
                    <div key={quiz.id} className="p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-between shadow-sm">
                      <span className="font-bold text-slate-800 text-sm">📝 {quiz.title}</span>
                      <button onClick={() => { setActiveQuiz(quiz); setTimeLeft(900); setTimerActive(true); }} className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-md">
                        بدء الامتحان
                      </button>
                    </div>
                  ))}
                </div>

                {isAdmin && (
                  <div className="bg-white p-6 rounded-2xl border border-indigo-200 space-y-4">
                    <h5 className="font-black text-slate-900 text-sm">🛠️ صياغة وإضافة امتحان تفاعلي جديد:</h5>
                    <input type="text" value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} placeholder="عنوان الامتحان الشامل..." className="w-full px-4 py-2.5 rounded-xl border text-sm font-bold bg-white" />
                    
                    <div className="p-4 bg-slate-50 rounded-xl border space-y-3">
                      <input type="text" value={questionText} onChange={(e) => setQuestionText(e.target.value)} placeholder="نص السؤال..." className="w-full px-3 py-2 bg-white rounded-lg border text-xs font-bold" />
                      <input type="text" value={fillCorrect} onChange={(e) => setFillCorrect(e.target.value)} placeholder="الإجابة الصحيحة..." className="w-full px-3 py-1.5 bg-emerald-50 border rounded-lg text-xs font-bold" />
                      <button onClick={handleAddQuestionToQuiz} className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">
                        + إضافة هذا السؤال لورقة الامتحان
                      </button>
                    </div>

                    <button onClick={() => handleSaveQuizToSubject(currentSub.id)} className="w-full py-3 bg-indigo-600 text-white font-black rounded-xl text-xs">
                      نشر الامتحان التفاعلي نهائياً للمادة
                    </button>
                  </div>
                )}
              </div>

            </div>
          );
        })()}

        {/* 3. لوحة إدارة الطلبة والـ VIP */}
        {activeTab === 'students' && isAdmin && (
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200 space-y-6">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-indigo-600" /> لوحة إدارة الطلبة وحسابات الـ VIP
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b text-slate-700 text-xs font-black">
                    <th className="p-4">الطالب والصف</th>
                    <th className="p-4">بيانات الدخول</th>
                    <th className="p-4">حالة الاتصال والدرجة</th>
                    <th className="p-4">نوع الاشتراك</th>
                    <th className="p-4 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-xs font-bold text-slate-800">
                  {studentsList.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50">
                      <td className="p-4">
                        <div className="font-black text-slate-900">{st.name}</div>
                        <div className="text-indigo-600 text-[11px]">{st.stage}</div>
                      </td>
                      <td className="p-4 font-mono">
                        <div>👤 {st.username}</div>
                        <div>🔑 {st.pass}</div>
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] bg-emerald-50 text-emerald-700">{st.status}</span>
                        <div className="text-[11px] text-amber-600 mt-1">الدرجة: {st.examScore}</div>
                      </td>
                      <td className="p-4">
                        <button onClick={async () => {
                          const newVip = !st.isVip;
                          await updateDoc(doc(db, 'students', st.id), { isVip: newVip });
                          setStudentsList(studentsList.map(item => item.id === st.id ? {...item, isVip: newVip} : item));
                        }} className={`px-3 py-1.5 rounded-xl text-[11px] font-black ${st.isVip ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-700'}`}>
                          {st.isVip ? '⭐ VIP مفعّل' : 'حساب مجاني'}
                        </button>
                      </td>
                      <td className="p-4 text-center">
                        <button onClick={async () => {
                          await deleteDoc(doc(db, 'students', st.id));
                          setStudentsList(studentsList.filter(item => item.id !== st.id));
                        }} className="text-rose-500 p-2"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. لوحة إضافة المواد العامة */}
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
                setNewSubName(''); setNewSubImage('');
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

        {/* 5. إعدادات الـ VIP */}
        {activeTab === 'vipSettings' && isAdmin && (
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-amber-200 space-y-6">
            <h2 className="text-2xl font-black text-slate-900">إعدادات أسعار وطرق دفع اشتراكات الـ VIP</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              setSuccessMessage('تم تحديث إعدادات الدفع واشتراكات الـ VIP بنجاح!');
              setTimeout(() => setSuccessMessage(null), 3000);
            }} className="bg-slate-50 p-6 rounded-2xl border space-y-4 max-w-xl">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">سعر الاشتراك</label>
                <input type="text" value={vipSettings.price} onChange={(e) => setVipSettings({...vipSettings, price: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border text-sm font-bold bg-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رقم الماستر كارد / المصرف</label>
                <input type="text" value={vipSettings.mastercard} onChange={(e) => setVipSettings({...vipSettings, mastercard: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border text-sm font-bold bg-white font-mono" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رقم تحويل الرصيد</label>
                <input type="text" value={vipSettings.transferPhone} onChange={(e) => setVipSettings({...vipSettings, transferPhone: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border text-sm font-bold bg-white font-mono" />
              </div>
              <button type="submit" className="w-full py-3 bg-amber-600 text-white font-bold rounded-xl text-xs shadow-md">
                حفظ تعديلات طرق الدفع والـ VIP
              </button>
            </form>
          </div>
        )}

        {/* 6. إعدادات حساب الأدمن */}
        {activeTab === 'settings' && isAdmin && (
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200 space-y-6">
            <h2 className="text-2xl font-black text-slate-900">إعدادات حساب المدير العام والصلاحيات</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              setSuccessMessage('تم تحديث بيانات حساب المدير العام بنجاح!');
              setTimeout(() => setSuccessMessage(null), 3000);
            }} className="bg-slate-50 p-6 rounded-2xl border space-y-4 max-w-xl">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم المدير الظاهر</label>
                <input type="text" value={adminName} onChange={(e) => setAdminName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border text-sm font-bold bg-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم المستخدم (Username)</label>
                <input type="text" value={adminUsername} onChange={(e) => setAdminUsername(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border text-sm font-bold bg-white font-mono" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">كلمة المرور (Password)</label>
                <input type="text" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border text-sm font-bold bg-white font-mono" />
              </div>
              <button type="submit" className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl text-xs shadow-md">
                حفظ التغييرات الأمنية
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
