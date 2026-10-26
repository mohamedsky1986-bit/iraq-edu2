import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { db } from './firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { 
  GraduationCap, ShieldCheck, MapPin, BookOpen, Video, FileText, 
  Award, ArrowRight, UserCheck, Users, ChevronDown, CheckCircle2, 
  Sparkles, PlusCircle, Trash2, Crown, Lock, Unlock, Settings, Play, Download, CheckSquare, Edit3, Image as ImageIcon, Eye, X, Key, User, Clock, CheckCircle, AlertCircle, FileText as NoteIcon, MessageCircle, CreditCard, Smartphone
} from 'lucide-react';

const safeGetStorage = (key: string, fallback: any) => {
  try {
    const item = localStorage.getItem(key);
    if (!item || item === 'undefined' || item === 'null') return fallback;
    return JSON.parse(item);
  } catch (e) {
    return fallback;
  }
};

export function App() {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // تم تصحيح القوس هنا لتصبح الدالة سليمة 100%
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('nabough_is_admin') === 'true';
  });

  useEffect(() => {
    localStorage.setItem('nabough_is_admin', isAdmin ? 'true' : 'false');
  }, [isAdmin]);

  const [showAdminLoginModal, setShowAdminLoginModal] = useState<boolean>(false);
  const [adminPinInput, setAdminPinInput] = useState<string>('');
  const [showStudentAuthModal, setShowStudentAuthModal] = useState<boolean>(false);
  const [viewingStudentAnswers, setViewingStudentAnswers] = useState<any | null>(null);

  // زر تثبيت التطبيق السريع (PWA)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState<boolean>(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    setShowInstallBtn(true);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallBtn(false);
      }
      setDeferredPrompt(null);
    } else {
      alert('التطبيق جاهز! يمكنك تثبيته مباشرة من إعدادات متصفحك (اختر: إضافة إلى الشاشة الرئيسية).');
    }
  };

  const [adminStageFilter, setAdminStageFilter] = useState<string>('all');

  const [adminName, setAdminName] = useState<string>(() => localStorage.getItem('nabough_admin_name') || 'مدير المنصة');
  const [adminUsername, setAdminUsername] = useState<string>(() => localStorage.getItem('nabough_admin_user') || 'admin');
  const [adminPassword, setAdminPassword] = useState<string>(() => localStorage.getItem('nabough_admin_pass') || '123456');
  
  const [vipSettings, setVipSettings] = useState(() => {
    return safeGetStorage('nabough_vip_settings', {
      price: '25,000 دينار عراقي / شهرياً',
      mastercard: '9876-5432-1098-7654 (مصرف الرافدين)',
      transferPhone: '07701234567 (زين كاش / آسياسيل)',
      whatsapp: '9647701234567'
    });
  });

  useEffect(() => {
    localStorage.setItem('nabough_vip_settings', JSON.stringify(vipSettings));
  }, [vipSettings]);

  const [vipModalItem, setVipModalItem] = useState<any | null>(null);

  const [loggedStudent, setLoggedStudent] = useState<any | null>(() => {
    return safeGetStorage('nabough_logged_student', null);
  });

  useEffect(() => {
    if (loggedStudent) {
      localStorage.setItem('nabough_logged_student', JSON.stringify(loggedStudent));
    } else {
      localStorage.removeItem('nabough_logged_student');
    }
  }, [loggedStudent]);

  const [studentsList, setStudentsList] = useState<any[]>(() => {
    return safeGetStorage('nabough_cached_students', []);
  });

  const [subjects, setSubjects] = useState<any[]>(() => {
    return safeGetStorage('nabough_cached_subjects', []);
  });

  const currentLoggedStudentData = loggedStudent ? studentsList?.find((s: any) => s.id === loggedStudent.id) || loggedStudent : null;
  const isVipActive = currentLoggedStudentData?.isVip || false;

  const [studentLoginUser, setStudentLoginUser] = useState('');
  const [studentLoginPass, setStudentLoginPass] = useState('');
  const [isStudentSignup, setIsStudentSignup] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentStage, setNewStudentStage] = useState('الثالث المتوسط');

  const [activeTab, setActiveTab] = useState<'curriculum' | 'students' | 'adminPanel' | 'settings' | 'vipSettings'>('curriculum');
  const [selectedStage, setSelectedStage] = useState<string>('all'); 
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [activePdfUrl, setActivePdfUrl] = useState<string | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<any | null>(null);

  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizResult, setQuizResult] = useState<{score: number, total: number, details: any[]} | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(900);
  const [timerActive, setTimerActive] = useState<boolean>(false);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editUser, setEditUser] = useState('');
  const [editPass, setEditPass] = useState('');
  const [editStage, setEditStage] = useState('');
  const [editName, setEditName] = useState('');

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
    if (loggedStudent) {
      const updateInterval = setInterval(async () => {
        const nowTime = new Date().toLocaleTimeString('ar-IQ', {hour: '2-digit', minute:'2-digit'});
        try {
          await updateDoc(doc(db, 'students', loggedStudent.id), { lastSeen: nowTime });
        } catch(e) {}
      }, 30000);
      return () => clearInterval(updateInterval);
    }
  }, [loggedStudent]);

  useEffect(() => {
    async function loadDataFromFirebase() {
      try {
        const subsSnap = await getDocs(collection(db, 'subjects'));
        if (!subsSnap.empty) {
          const loadedSubs = subsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          setSubjects(loadedSubs);
          localStorage.setItem('nabough_cached_subjects', JSON.stringify(loadedSubs));
        }

        const studsSnap = await getDocs(collection(db, 'students'));
        if (!studsSnap.empty) {
          const loadedStuds = studsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          setStudentsList(loadedStuds);
          localStorage.setItem('nabough_cached_students', JSON.stringify(loadedStuds));
        }
      } catch (e) {
        console.error('Offline mode / Firebase load error:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadDataFromFirebase();

    const safetyTimer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);
    return () => clearTimeout(safetyTimer);
  }, []);

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
  const [quizDurationMinutes, setQuizDurationMinutes] = useState<number>(15);
  const [questionType, setQuestionType] = useState<'mcq' | 'fill' | 'true_false'>('mcq');
  const [questionText, setQuestionText] = useState('');
  const [mcqOptions, setMcqOptions] = useState(['', '', '', '']);
  const [mcqCorrect, setMcqCorrect] = useState('');
  const [fillCorrect, setFillCorrect] = useState('');
  const [tfCorrect, setTfCorrect] = useState('صح');
  const [currentQuestionsList, setCurrentQuestionsList] = useState<any[]>([]);

  const [newSubName, setNewSubName] = useState('');
  const [newSubStage, setNewSubStage] = useState('الثالث المتوسط');
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

  const evaluateAnswerSmart = (userAns: string, correctAns: string, qType: string) => {
    if (!userAns) return { isCorrect: false, scoreRatio: 0 };
    const cleanUser = userAns.trim().toLowerCase();
    const cleanCorrect = correctAns.trim().toLowerCase();

    if (qType === 'mcq' || qType === 'true_false') {
      return { isCorrect: cleanUser === cleanCorrect, scoreRatio: cleanUser === cleanCorrect ? 1 : 0 };
    }

    if (cleanUser === cleanCorrect) {
      return { isCorrect: true, scoreRatio: 1 };
    }

    const correctWords = cleanCorrect.split(/[\s,،.؛\-]+/).filter(w => w.length > 2);
    if (correctWords.length === 0) {
      return { isCorrect: cleanUser.includes(cleanCorrect) || cleanCorrect.includes(cleanUser), scoreRatio: 0.5 };
    }

    let matchedCount = 0;
    correctWords.forEach(w => {
      if (cleanUser.includes(w)) matchedCount++;
    });

    const ratio = matchedCount / correctWords.length;
    if (ratio >= 0.8) {
      return { isCorrect: true, scoreRatio: 1 };
    } else if (ratio >= 0.4) {
      return { isCorrect: false, scoreRatio: 0.6 };
    } else if (cleanCorrect.includes(cleanUser) && cleanUser.length >= 3) {
      return { isCorrect: false, scoreRatio: 0.4 };
    }

    return { isCorrect: false, scoreRatio: 0 };
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
    const newQuizObj = { id: Date.now().toString(), title: quizTitle, isVip: quizIsVip, durationMinutes: quizDurationMinutes, questions: currentQuestionsList };
    const targetSub = subjects.find(s => s.id === subjectId);
    if (!targetSub) return;
    const updatedQuizzes = [...(targetSub.quizzes || []), newQuizObj];

    try {
      await updateDoc(doc(db, 'subjects', subjectId), { quizzes: updatedQuizzes });
      const updatedSubs = subjects.map(sub => sub.id === subjectId ? { ...sub, quizzes: updatedQuizzes } : sub);
      setSubjects(updatedSubs);
      localStorage.setItem('nabough_cached_subjects', JSON.stringify(updatedSubs));
      setQuizTitle('');
      setQuizIsVip(false);
      setQuizDurationMinutes(15);
      setCurrentQuestionsList([]);
      setSuccessMessage('تم نشر الامتحان بنجاح في قاعدة البيانات!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleGradeQuiz = async () => {
    if (!activeQuiz || !activeQuiz.questions) return;
    setTimerActive(false);
    let totalScoreEarned = 0;
    const maxPossibleScore = activeQuiz.questions.length * 100;

    const details = activeQuiz.questions.map((q: any, idx: number) => {
      const userAns = quizAnswers[idx] || '';
      const evaluation = evaluateAnswerSmart(userAns, q.correct, q.type);
      const questionGrade = Math.round(evaluation.scoreRatio * 100);
      totalScoreEarned += questionGrade;

      return { 
        q: q.q, 
        userAns, 
        correct: q.correct, 
        isCorrect: evaluation.isCorrect || evaluation.scoreRatio >= 0.8,
        partialScore: questionGrade
      };
    });

    const finalScore = Math.round((totalScoreEarned / maxPossibleScore) * 100);
    setQuizResult({ score: finalScore, total: 100, details });

    if (loggedStudent) {
      const nowTime = new Date().toLocaleTimeString('ar-IQ', {hour: '2-digit', minute:'2-digit'});
      const updatedStuds = studentsList.map(st => st.id === loggedStudent.id ? {
        ...st, 
        examScore: `${finalScore}/100`, 
        examDetails: details,
        lastSeen: nowTime
      } : st);
      setStudentsList(updatedStuds);
      localStorage.setItem('nabough_cached_students', JSON.stringify(updatedStuds));
      try {
        await updateDoc(doc(db, 'students', loggedStudent.id), {
          examScore: `${finalScore}/100`,
          examDetails: details,
          lastSeen: nowTime
        });
      } catch(e) {}
    }
    setSuccessMessage(`أتممت الامتحان بنجاح! درجتك: ${finalScore}/100`);
  };

  const filteredSubjects = subjects.filter(s => {
    if (isAdmin) {
      return selectedStage === 'all' || s.stage === selectedStage;
    } else {
      return selectedStage === 'all' || s.stage === selectedStage;
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-black text-4xl shadow-2xl animate-bounce mb-6">ن</div>
        <h2 className="text-2xl font-black tracking-wide">منصة النابغة التعليمية</h2>
        <p className="text-xs text-slate-400 mt-2">جاري تجهيز المنصة بثبات...</p>
        <div className="w-40 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-6">
          <div className="w-full h-full bg-indigo-500 animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 font-sans antialiased overflow-x-hidden pt-2 sm:pt-4">
      
      {/* نافذة تسجيل دخول الأدمن عبر القفل السري */}
      {showAdminLoginModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl relative space-y-4 text-right">
            <button onClick={() => setShowAdminLoginModal(false)} className="absolute top-4 left-4 w-8 h-8 bg-slate-100 hover:bg-rose-50 text-slate-600 rounded-full flex items-center justify-center font-bold">
              <X className="w-4 h-4" />
            </button>
            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto text-xl font-black">🔐</div>
              <h3 className="text-lg font-black text-slate-900">تسجيل دخول المدير العام</h3>
              <p className="text-xs text-slate-500">أدخل كلمة المرور الخاصة بلوحة الإدارة</p>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (adminPinInput === adminPassword) {
                setIsAdmin(true);
                setLoggedStudent(null);
                setShowAdminLoginModal(false);
                setAdminPinInput('');
                setSuccessMessage('تم تفعيل وضع الإدارة بنجاح!');
                setTimeout(() => setSuccessMessage(null), 3000);
              } else {
                alert('كلمة مرور الأدمن غير صحيحة!');
              }
            }} className="space-y-3">
              <input 
                type="password" 
                placeholder="كلمة المرور..." 
                value={adminPinInput} 
                onChange={(e) => setAdminPinInput(e.target.value)} 
                className="w-full px-4 py-2.5 rounded-xl border text-sm font-bold font-mono" 
                autoFocus
              />
              <button type="submit" className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-md">
                دخول لوحة التحكم
              </button>
            </form>
          </div>
        </div>
      )}

      {/* نافذة عرض إجابات الطالب ونقاط الضعف */}
      {viewingStudentAnswers && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative space-y-6 text-right">
            <button onClick={() => setViewingStudentAnswers(null)} className="absolute top-4 left-4 w-10 h-10 bg-slate-100 hover:bg-rose-50 text-slate-600 rounded-full flex items-center justify-center font-bold">
              <X className="w-5 h-5" />
            </button>
            <div className="text-center space-y-1 pb-3 border-b">
              <h3 className="text-xl font-black text-slate-900">إجابات الطالب ونقاط الضعف: {viewingStudentAnswers.name}</h3>
              <p className="text-xs text-indigo-600 font-bold">المرحلة: {viewingStudentAnswers.stage} | الدرجة الكلية: {viewingStudentAnswers.examScore}</p>
            </div>

            <div className="space-y-4">
              {viewingStudentAnswers.examDetails && viewingStudentAnswers.examDetails.length > 0 ? (
                viewingStudentAnswers.examDetails.map((det: any, dIdx: number) => (
                  <div key={dIdx} className={`p-4 rounded-2xl border ${det.isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
                    <div className="font-bold text-sm">س{dIdx+1}: {det.q}</div>
                    <div className="text-xs mt-1.5 flex flex-col gap-1">
                      <span>إجابة الطالب: <b>{det.userAns || 'بدون إجابة'}</b></span>
                      <span>الإجابة النموذجية: <b>{det.correct}</b></span>
                      <span className="font-black">درجة السؤال: {det.partialScore}/100 {det.isCorrect ? '✅ صحيحة' : '❌ نقطة ضعف محتملة للتركيز عليها'}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-500 py-6 text-sm font-bold">لم يتقدم هذا الطالب لأي امتحان تفاعلي بعد.</p>
              )}
            </div>

            <button onClick={() => setViewingStudentAnswers(null)} className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl text-xs">
              إغلاق النافذة
            </button>
          </div>
        </div>
      )}

      {/* نافذة تسجيل دخول أو إنشاء حساب طالب */}
      {showStudentAuthModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl relative space-y-6 text-right">
            <button onClick={() => setShowStudentAuthModal(false)} className="absolute top-4 left-4 w-10 h-10 bg-slate-100 hover:bg-rose-50 text-slate-600 rounded-full flex items-center justify-center font-bold">
              <X className="w-5 h-5" />
            </button>
            <div className="text-center">
              <GraduationCap className="w-14 h-14 text-indigo-600 mx-auto mb-2 animate-bounce" />
              <h2 className="text-2xl font-black text-slate-900">بوابة دخول الطلاب</h2>
              <p className="text-xs text-slate-500 mt-1">سجل دخولك أو أنشئ حساباً جديداً للوصول إلى تفاصيل المواد والامتحانات</p>
            </div>

            {isStudentSignup ? (
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!newStudentName || !studentLoginUser || !studentLoginPass) return;

                const nameParts = newStudentName.trim().split(/\s+/);
                if (nameParts.length < 3) {
                  alert('⚠️ يرجى إدخال الاسم الثلاثي الصريح صحيحاً.');
                  return;
                }

                const userRegex = /^[a-zA-Z0-9_]{4,}$/;
                if (!userRegex.test(studentLoginUser)) {
                  alert('⚠️ اسم المستخدم يجب أن يكون 4 أحرف إنجليزية أو أرقام على الأقل.');
                  return;
                }

                const passRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
                if (!passRegex.test(studentLoginPass)) {
                  alert('⚠️ كلمة المرور يجب أن تكون 8 أحرف على الأقل وتتضمن أحرفاً إنجليزية وأرقاماً.');
                  return;
                }

                if (studentsList.some(st => st.username === studentLoginUser)) {
                  alert('⚠️ اسم المستخدم هذا مستخدم مسبقاً، يرجى اختيار يوزر آخر.');
                  return;
                }

                const nowTime = new Date().toLocaleTimeString('ar-IQ', {hour: '2-digit', minute:'2-digit'});
                const newSt = {
                  name: newStudentName,
                  username: studentLoginUser,
                  pass: studentLoginPass,
                  stage: newStudentStage,
                  isVip: false,
                  status: 'متصل الآن',
                  lastSeen: nowTime,
                  regDate: new Date().toISOString().split('T')[0],
                  examScore: 'لم يتقدم'
                };

                try {
                  const docRef = await addDoc(collection(db, 'students'), newSt);
                  const savedSt = { id: docRef.id, ...newSt };
                  const updatedStuds = [savedSt, ...studentsList];
                  setStudentsList(updatedStuds);
                  localStorage.setItem('nabough_cached_students', JSON.stringify(updatedStuds));
                  setLoggedStudent(savedSt);
                  setShowStudentAuthModal(false);
                  setSuccessMessage('تم إنشاء الحساب وتسجيل الدخول بنجاح!');
                } catch (err) {
                  console.error(err);
                }
              }} className="space-y-4">
                
                <div className="bg-amber-50 border-2 border-amber-300 p-4 rounded-2xl space-y-2">
                  <label className="block text-xs font-black text-amber-900">⚠️ تنبيه هام: اختر مرحلتك الدراسية بدقة أولاً</label>
                  <select value={newStudentStage} onChange={(e) => setNewStudentStage(e.target.value)} className="w-full px-4 py-3 rounded-xl border-2 border-amber-400 bg-white text-sm font-black text-slate-900 shadow-sm cursor-pointer">
                    {allStagesList.map(st => (
                      <option key={st.id} value={st.name}>{st.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الاسم الثلاثي الصريح</label>
                  <input type="text" required value={newStudentName} onChange={(e) => setNewStudentName(e.target.value)} placeholder="مثال: محمد قاسم كريم" className="w-full px-4 py-2.5 rounded-xl border text-sm font-bold" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اسم المستخدم (4 أحرف إنجليزية على الأقل)</label>
                  <input type="text" required value={studentLoginUser} onChange={(e) => setStudentLoginUser(e.target.value)} placeholder="مثال: mohamed123" className="w-full px-4 py-2.5 rounded-xl border text-sm font-bold font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">كلمة المرور (8 أحرف تحوي أحرف وأرقام)</label>
                  <input type="password" required value={studentLoginPass} onChange={(e) => setStudentLoginPass(e.target.value)} placeholder="كلمة المرور القوية..." className="w-full px-4 py-2.5 rounded-xl border text-sm font-bold font-mono" />
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
              <form onSubmit={async (e) => {
                e.preventDefault();
                const found = studentsList.find(st => st.username === studentLoginUser && st.pass === studentLoginPass);
                if (found) {
                  if (found.status === 'متصل الآن') {
                    alert('⚠️ عذراً، هذا اليوزر متصل حالياً عند شخص آخر (على جهاز آخر). لا يمكن فتح نفس الحساب في جهازين في نفس الوقت.');
                    return;
                  }
                  const nowTime = new Date().toLocaleTimeString('ar-IQ', {hour: '2-digit', minute:'2-digit'});
                  await updateDoc(doc(db, 'students', found.id), { status: 'متصل الآن', lastSeen: nowTime });
                  found.status = 'متصل الآن';
                  found.lastSeen = nowTime;
                  setLoggedStudent(found);
                  setShowStudentAuthModal(false);
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
                <div className="text-center pt-2">
                  <button type="button" onClick={() => setIsStudentSignup(true)} className="text-xs text-indigo-600 font-bold hover:underline">
                    ليس لديك حساب؟ إنشاء حساب جديد
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* نافذة تفاصيل الدفع VIP */}
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
                <span>تحويل رصيد:</span>
                <span className="font-mono text-indigo-700">{vipSettings.transferPhone}</span>
              </div>
              {loggedStudent && (
                <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-200 text-indigo-950 space-y-1">
                  <div>👤 اسم الطالب: <b>{loggedStudent.name}</b></div>
                  <div>🔑 اليوزر: <span className="font-mono">{loggedStudent.username}</span></div>
                </div>
              )}
            </div>

            <a 
              href={`https://wa.me/${vipSettings.whatsapp}?text=${encodeURIComponent(`مرحباً، أود تفعيل اشتراك الـ VIP في منصة النابغة التعليمية.\nمعلومات الطالب:\nالاسم الثلاثي: ${loggedStudent ? loggedStudent.name : 'زائر'}\nاليوزر: ${loggedStudent ? loggedStudent.username : 'غير مسجل'}\nوهذا إيصال الدفع:`)}`} 
              target="_blank" 
              rel="noreferrer"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-lg flex items-center justify-center gap-2 text-sm"
            >
              <MessageCircle className="w-5 h-5" /> إرسال إيصال الدفع عبر الواتساب
            </a>
          </div>
        </div>
      )}

      {/* مشغل الفيديو */}
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

      {/* قارئ PDF */}
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

      {/* نافذة الامتحان */}
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
                      <div className="text-xs mt-1">إجابتك: <b>{det.userAns || 'بدون إجابة'}</b> (درجة السؤال: {det.partialScore}/100) {det.isCorrect ? '✅ صحيحة' : '❌ نقطة ضعف'}</div>
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

      {/* رأس الصفحة مع زر تثبيت التطبيق باللون الذهبي البارز */}
      <div className="w-full bg-slate-900 py-3 px-4 sm:px-8 shadow-md flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-base shadow">ن</div>
          <div>
            <h2 className="text-white font-black text-sm sm:text-base tracking-wide">منصة النابغة التعليمية</h2>
            <p className="text-[10px] text-slate-400">المنهج العراقي الرسمي</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {showInstallBtn && (
            <button onClick={handleInstallApp} className="px-3.5 py-2 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 rounded-xl text-xs font-black shadow-lg flex items-center gap-1.5 animate-pulse border border-yellow-200 cursor-pointer">
              <Smartphone className="w-4 h-4 text-slate-950" /> تثبيت التطبيق 📱
            </button>
          )}

          {isAdmin ? (
            <button onClick={() => setIsAdmin(false)} className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow">
              خروج من وضع الأدمن
            </button>
          ) : loggedStudent ? (
            <button onClick={async () => {
              if (loggedStudent) {
                try {
                  await updateDoc(doc(db, 'students', loggedStudent.id), { status: 'غير متصل' });
                } catch(e) {}
              }
              localStorage.removeItem('nabough_logged_student');
              setLoggedStudent(null); 
            }} className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow">
              تسجيل الخروج ({loggedStudent.name})
            </button>
          ) : (
            <button onClick={() => setShowStudentAuthModal(true)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md">
              تسجيل دخول / إنشاء حساب طالب
            </button>
          )}
        </div>
      </div>

      {/* شريط التبويبات (للأدمن فقط) */}
      {isAdmin && (
        <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between py-3 gap-3 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => { setActiveTab('curriculum'); setSelectedSubjectId(null); }}
                className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'curriculum' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                <BookOpen className="w-4 h-4" /> المنهج الدراسي والصفوف
              </button>
              <button 
                onClick={() => { setActiveTab('students'); setSelectedSubjectId(null); }}
                className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'students' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                <Users className="w-4 h-4" /> إدارة الطلبة والـ VIP
              </button>
              <button 
                onClick={() => { setActiveTab('adminPanel'); setSelectedSubjectId(null); }}
                className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'adminPanel' ? 'bg-emerald-600 text-white shadow-md' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}
              >
                <Settings className="w-4 h-4" /> إضافة المواد والصور
              </button>
              <button 
                onClick={() => { setActiveTab('vipSettings'); setSelectedSubjectId(null); }}
                className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'vipSettings' ? 'bg-amber-600 text-white shadow-md' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}
              >
                <Crown className="w-4 h-4" /> إعدادات VIP
              </button>
              <button 
                onClick={() => { setActiveTab('settings'); setSelectedSubjectId(null); }}
                className={`px-4 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'settings' ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
              >
                <Key className="w-4 h-4" /> إعدادات الأدمن
              </button>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 w-full">
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl flex items-center gap-3 text-sm font-bold shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      {/* المحتوى الرئيسي */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 overflow-x-hidden">
        
        {/* البانر العلوي */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 rounded-3xl shadow-xl text-white p-6 sm:p-8 relative overflow-hidden mt-1">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-indigo-800/60 border border-indigo-600/30 px-3 py-1 rounded-xl text-xs font-bold mb-4 text-indigo-200 flex-wrap">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> منصة النابغة التعليمية - المنهج العراقي الرسمي
              {!isAdmin && loggedStudent && <span className="bg-indigo-600 text-white px-2 py-0.5 rounded text-[10px] mr-2">مرحلتك الحصرية: {loggedStudent?.stage}</span>}
            </div>
            <h1 className="text-2xl sm:text-4xl font-black mb-3 tracking-tight leading-snug">
              {isAdmin ? 'لوحة تحكم المدير العام والإدارة 🎓' : loggedStudent ? `مرحباً بك يا ${loggedStudent?.name} في مرحلة ${loggedStudent?.stage} 📚` : 'تصفح المناهج الدراسية والامتحانات التفاعلية 🎓'}
            </h1>
          </div>
        </div>

        {/* 1. تبويب المنهج الدراسي */}
        {activeTab === 'curriculum' && !selectedSubjectId && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xl flex-shrink-0">📚</div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">
                    {isAdmin ? 'اختر الصف الدراسي المطلوب' : loggedStudent ? `مرحلتك الدراسية الحصرية: ${loggedStudent?.stage}` : 'اختر الصف الدراسي لتصفح المناهج'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {isAdmin ? 'يتضمن كافة المراحل والصفوف الدراسية التسع في العراق' : loggedStudent ? 'تظهر لك مواد صفك حصراً' : 'استخدم القائمة المنسدلة لاختيار أي صف وتصفح مواده، وعند محاولة فتح مادة سيُطلب منك تسجيل الدخول'}
                  </p>
                </div>
              </div>

              {(!loggedStudent || isAdmin) && (
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
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSubjects.map((sub) => (
                <div 
                  key={sub.id}
                  onClick={() => {
                    if (!loggedStudent && !isAdmin) {
                      setShowStudentAuthModal(true);
                    } else {
                      setSelectedSubjectId(sub.id);
                    }
                  }}
                  className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200/80 group flex flex-col justify-between relative cursor-pointer"
                >
                  {isAdmin && (
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 z-25">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingSubjectId(sub.id);
                          setEditSubName(sub.name);
                          setEditSubImage(sub.image || '');
                        }}
                        className="w-9 h-9 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center shadow-lg transition-all"
                        title="تعديل المادة"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (window.confirm(`هل أنت متأكد من حذف مادة ${sub.name}?`)) {
                            try {
                              await deleteDoc(doc(db, 'subjects', sub.id));
                              const updatedSubs = subjects.filter(s => s.id !== sub.id);
                              setSubjects(updatedSubs);
                              localStorage.setItem('nabough_cached_subjects', JSON.stringify(updatedSubs));
                              setSuccessMessage('تم حذف المادة بنجاح.');
                              setTimeout(() => setSuccessMessage(null), 3000);
                            } catch (err) {
                              console.error(err);
                            }
                          }
                        }}
                        className="w-9 h-9 bg-rose-600 hover:bg-rose-700 text-white rounded-xl flex items-center justify-center shadow-lg transition-all"
                        title="حذف المادة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {editingSubjectId === sub.id && (
                    <div onClick={(e) => e.stopPropagation()} className="absolute inset-0 bg-white/95 backdrop-blur-md z-30 p-6 flex flex-col justify-center space-y-3 text-right">
                      <h4 className="font-black text-sm text-slate-900">تعديل بيانات المادة</h4>
                      <input type="text" value={editSubName} onChange={(e) => setEditSubName(e.target.value)} placeholder="اسم المادة..." className="px-3 py-2 border rounded-xl text-xs font-bold" />
                      <input type="text" value={editSubImage} onChange={(e) => setEditSubImage(e.target.value)} placeholder="رابط الصورة..." className="px-3 py-2 border rounded-xl text-xs font-bold font-mono" />
                      <div className="flex gap-2 pt-2">
                        <button onClick={async () => {
                          await updateDoc(doc(db, 'subjects', sub.id), { name: editSubName, image: editSubImage });
                          const updatedSubs = subjects.map(s => s.id === sub.id ? {...s, name: editSubName, image: editSubImage} : s);
                          setSubjects(updatedSubs);
                          localStorage.setItem('nabough_cached_subjects', JSON.stringify(updatedSubs));
                          setEditingSubjectId(null);
                          setSuccessMessage('تم تعديل المادة بنجاح!');
                          setTimeout(() => setSuccessMessage(null), 3000);
                        }} className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold">حفظ</button>
                        <button onClick={() => setEditingSubjectId(null)} className="flex-1 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold">إلغاء</button>
                      </div>
                    </div>
                  )}

                  <div className="h-40 w-full relative overflow-hidden bg-slate-200">
                    <img src={sub.image} alt={sub.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                    <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-white">
                      <span className="text-xs font-black bg-indigo-600/90 px-3 py-1 rounded-lg">{sub.stageName}</span>
                      <span className="text-2xl">{sub.icon}</span>
                    </div>
                  </div>
                  
                  <div className="p-6">
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

            {filteredSubjects.length === 0 && (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                <p className="text-slate-500 font-bold text-base">لا توجد مواد دراسية مضافة لهذه المرحلة حالياً.</p>
              </div>
            )}
          </div>
        )}

        {/* 2. إدارة المادة الدراسية المفصلة */}
        {selectedSubjectId && (() => {
          const currentSub = subjects.find(s => s.id === selectedSubjectId);
          if (!currentSub) return null;
          return (
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-indigo-100 space-y-8">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-3">
                <div>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-200">عرض المادة الدراسية</span>
                  <h3 className="text-2xl font-black text-slate-900 mt-2 flex items-center gap-3">
                    <span className="text-3xl">{currentSub.icon}</span> {currentSub.name} ({currentSub.stageName})
                  </h3>
                </div>
                <button onClick={() => setSelectedSubjectId(null)} className="text-xs font-bold bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl">
                  ← العودة للمناهج
                </button>
              </div>

              {/* أ) الشروحات والتعاليل مع خيار التعديل */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                <h4 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <NoteIcon className="w-5 h-5 text-amber-600" /> الشروحات والتعاليل والملاحظات التعليمية ({currentSub.notes?.length || 0})
                </h4>
                <div className="space-y-4">
                  {currentSub.notes?.map((note: any) => (
                    <div key={note.id} className="p-5 bg-white rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-sm gap-4 relative">
                      
                      {editingNoteId === note.id ? (
                        <div className="w-full space-y-3 bg-slate-50 p-4 rounded-xl border">
                          <h5 className="font-black text-xs text-indigo-900">تعديل الشرح أو التعليل</h5>
                          <input type="text" value={editNoteTitle} onChange={(e) => setEditNoteTitle(e.target.value)} placeholder="العنوان..." className="w-full px-3 py-2 border rounded-xl text-xs font-bold bg-white" />
                          <textarea value={editNoteContent} onChange={(e) => setEditNoteContent(e.target.value)} placeholder="النص..." className="w-full px-3 py-2 border rounded-xl text-xs font-bold bg-white h-20" />
                          <input type="text" value={editNoteImage} onChange={(e) => setEditNoteImage(e.target.value)} placeholder="رابط الصورة..." className="w-full px-3 py-2 border rounded-xl text-xs font-bold font-mono bg-white" />
                          <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                            <input type="checkbox" checked={editNoteVip} onChange={(e) => setEditNoteVip(e.target.checked)} className="w-4 h-4 text-amber-600" />
                            <span>شرح خاص بـ VIP؟</span>
                          </label>
                          <div className="flex gap-2 pt-2">
                            <button onClick={async () => {
                              const updatedNotes = currentSub.notes.map((n: any) => n.id === note.id ? { ...n, title: editNoteTitle, content: editNoteContent, image: editNoteImage, isVip: editNoteVip } : n);
                              await updateDoc(doc(db, 'subjects', currentSub.id), { notes: updatedNotes });
                              const updatedSubs = subjects.map(s => s.id === currentSub.id ? {...s, notes: updatedNotes} : s);
                              setSubjects(updatedSubs);
                              localStorage.setItem('nabough_cached_subjects', JSON.stringify(updatedSubs));
                              setEditingNoteId(null);
                              setSuccessMessage('تم تعديل الشرح أو التعليل بنجاح!');
                              setTimeout(() => setSuccessMessage(null), 3000);
                            }} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold">حفظ التعديل</button>
                            <button onClick={() => setEditingNoteId(null)} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold">إلغاء</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h5 className="font-black text-slate-900 text-sm">💡 {note.title}</h5>
                              {note.isVip && <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-black">⭐ VIP</span>}
                            </div>
                            {note.isVip && !isVipActive && isAdmin === false ? (
                              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between flex-wrap gap-2">
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

                          {isAdmin && (
                            <div className="flex items-center gap-2 self-start">
                              <button onClick={() => {
                                setEditingNoteId(note.id);
                                setEditNoteTitle(note.title);
                                setEditNoteContent(note.content);
                                setEditNoteImage(note.image || '');
                                setEditNoteVip(note.isVip || false);
                              }} className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg" title="تعديل الشرح">
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button onClick={async () => {
                                const updatedNotes = currentSub.notes.filter((n: any) => n.id !== note.id);
                                await updateDoc(doc(db, 'subjects', currentSub.id), { notes: updatedNotes });
                                const updatedSubs = subjects.map(s => s.id === currentSub.id ? {...s, notes: updatedNotes} : s);
                                setSubjects(updatedSubs);
                                localStorage.setItem('nabough_cached_subjects', JSON.stringify(updatedSubs));
                                setSuccessMessage('تم حذف الشرح بنجاح.');
                                setTimeout(() => setSuccessMessage(null), 3000);
                              }} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg" title="حذف الشرح">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>

                {isAdmin && (
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 mt-4">
                    <h5 className="text-xs font-black text-slate-800">إضافة شرح أو تعليل أو ملاحظة تعليمية (مع صورة و VIP):</h5>
                    <input type="text" value={newNoteTitle} onChange={(e) => setNewNoteTitle(e.target.value)} placeholder="عنوان الشرح أو التعليل..." className="w-full px-4 py-2.5 rounded-xl border text-xs font-bold" />
                    <textarea value={newNoteContent} onChange={(e) => setNewNoteContent(e.target.value)} placeholder="اكتب نص الشرح أو التعليل التفصيلي هنا..." className="w-full px-4 py-2.5 rounded-xl border text-xs font-bold h-24" />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input type="text" value={newNoteImage} onChange={(e) => setNewNoteImage(e.target.value)} placeholder="رابط صورة توضيحية (اختياري)..." className="px-4 py-2 rounded-xl border text-xs font-bold font-mono" />
                      <label className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border font-bold text-xs cursor-pointer justify-center">
                        <input type="checkbox" checked={newNoteVip} onChange={(e) => setNewNoteVip(e.target.checked)} className="w-4 h-4 text-amber-600 rounded" />
                        <span>شرح خاص بـ VIP؟</span>
                      </label>
                    </div>
                    <button onClick={async () => {
                      if (!newNoteTitle || !newNoteContent) return;
                      const newNoteObj = { id: Date.now().toString(), title: newNoteTitle, content: newNoteContent, image: newNoteImage, isVip: newNoteVip };
                      const updatedNotes = [...(currentSub.notes || []), newNoteObj];
                      await updateDoc(doc(db, 'subjects', currentSub.id), { notes: updatedNotes });
                      const updatedSubs = subjects.map(s => s.id === currentSub.id ? {...s, notes: updatedNotes} : s);
                      setSubjects(updatedSubs);
                      localStorage.setItem('nabough_cached_subjects', JSON.stringify(updatedSubs));
                      setNewNoteTitle(''); setNewNoteContent(''); setNewNoteImage(''); setNewNoteVip(false);
                      setSuccessMessage('تمت إضافة الشرح أو التعليل بنجاح للمادة!');
                      setTimeout(() => setSuccessMessage(null), 3000);
                    }} className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow">
                      + نشر الشرح / التعليل في المادة
                    </button>
                  </div>
                )}
              </div>

              {/* ب) الفيديوهات الشارحة */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                <h4 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <Video className="w-5 h-5 text-indigo-600" /> الدروس المرئية والمحاضرات ({currentSub.videos?.length || 0})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentSub.videos?.map((vid: any) => (
                    <div key={vid.id} className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold flex-shrink-0">▶</div>
                        <div>
                          <span className="font-bold text-slate-800 text-sm block">{vid.title}</span>
                          <span className="text-xs text-slate-500">المدة: {vid.duration} {vid.isVip ? '• ⭐ VIP' : ''}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {vid.isVip && !isVipActive && isAdmin === false ? (
                          <button onClick={() => setVipModalItem(vid)} className="px-3 py-1.5 bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow">
                            <Lock className="w-3.5 h-3.5" /> قفل VIP
                          </button>
                        ) : (
                          <button onClick={() => setActiveVideoUrl(vid.url)} className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-md">
                            <Play className="w-3.5 h-3.5" /> تشغيل
                          </button>
                        )}
                        {isAdmin && (
                          <button onClick={async () => {
                            const updatedVids = currentSub.videos.filter((v: any) => v.id !== vid.id);
                            await updateDoc(doc(db, 'subjects', currentSub.id), { videos: updatedVids });
                            const updatedSubs = subjects.map(s => s.id === currentSub.id ? {...s, videos: updatedVids} : s);
                            setSubjects(updatedSubs);
                            localStorage.setItem('nabough_cached_subjects', JSON.stringify(updatedSubs));
                            setSuccessMessage('تم حذف الفيديو بنجاح.');
                            setTimeout(() => setSuccessMessage(null), 3000);
                          }} className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {isAdmin && (
                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 mt-4">
                    <h5 className="text-xs font-black text-slate-800">إضافة درس مرئي جديد (رابط يوتيوب و VIP):</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input type="text" value={newVideoTitle} onChange={(e) => setNewVideoTitle(e.target.value)} placeholder="عنوان الدرس..." className="px-4 py-2 rounded-xl border text-xs font-bold" />
                      <input type="text" value={newVideoUrl} onChange={(e) => setNewVideoUrl(e.target.value)} placeholder="رابط يوتيوب..." className="px-4 py-2 rounded-xl border text-xs font-bold font-mono" />
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1 text-xs font-bold cursor-pointer">
                          <input type="checkbox" checked={newVideoVip} onChange={(e) => setNewVideoVip(e.target.checked)} className="w-4 h-4" />
                          <span>VIP</span>
                        </label>
                        <button onClick={async () => {
                          if (!newVideoTitle || !newVideoUrl) return;
                          const formattedUrl = formatYouTubeUrl(newVideoUrl);
                          const newVidObj = { id: Date.now().toString(), title: newVideoTitle, url: formattedUrl, duration: '45 دقيقة', isVip: newVideoVip };
                          const updatedVids = [...(currentSub.videos || []), newVidObj];
                          await updateDoc(doc(db, 'subjects', currentSub.id), { videos: updatedVids });
                          const updatedSubs = subjects.map(s => s.id === currentSub.id ? {...s, videos: updatedVids} : s);
                          setSubjects(updatedSubs);
                          localStorage.setItem('nabough_cached_subjects', JSON.stringify(updatedSubs));
                          setNewVideoTitle(''); setNewVideoUrl(''); setNewVideoVip(false);
                          setSuccessMessage('تمت إضافة الفيديو بنجاح!');
                          setTimeout(() => setSuccessMessage(null), 3000);
                        }} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-xl text-xs font-bold shadow-md">
                          + نشر الفيديو
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ج) ملازم PDF */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
                <h4 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-600" /> ملازم وقارئ الـ PDF ({currentSub.booklets?.length || 0})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentSub.booklets?.map((book: any) => (
                    <div key={book.id} className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center justify-between shadow-sm flex-wrap gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold flex-shrink-0">📄</div>
                        <div>
                          <span className="font-bold text-slate-800 text-sm block">{book.title}</span>
                          <span className="text-xs text-slate-500">الحجم: {book.size} {book.isVip ? '• ⭐ VIP' : ''}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {book.isVip && !isVipActive && isAdmin === false ? (
                          <button onClick={() => setVipModalItem(book)} className="px-3 py-1.5 bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow">
                            <Lock className="w-3.5 h-3.5" /> قفل VIP
                          </button>
                        ) : (
                          <button onClick={() => setActivePdfUrl(book.url)} className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-md">
                            <Eye className="w-3.5 h-3.5" /> قراءة
                          </button>
                        )}
                        {isAdmin && (
                          <button onClick={async () => {
                            const updatedBooks = currentSub.booklets.filter((b: any) => b.id !== book.id);
                            await updateDoc(doc(db, 'subjects', currentSub.id), { booklets: updatedBooks });
                            const updatedSubs = subjects.map(s => s.id === currentSub.id ? {...s, booklets: updatedBooks} : s);
                            setSubjects(updatedSubs);
                            localStorage.setItem('nabough_cached_subjects', JSON.stringify(updatedSubs));
                            setSuccessMessage('تم حذف الملزمة بنجاح.');
                            setTimeout(() => setSuccessMessage(null), 3000);
                          }} className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {isAdmin && (
                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 mt-4">
                    <h5 className="text-xs font-black text-slate-800">إضافة ملزمة PDF للقراءة (مع VIP):</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input type="text" value={newBookletTitle} onChange={(e) => setNewBookletTitle(e.target.value)} placeholder="عنوان الملزمة..." className="px-4 py-2 rounded-xl border text-xs font-bold" />
                      <input type="text" value={newBookletUrl} onChange={(e) => setNewBookletUrl(e.target.value)} placeholder="رابط ملف الـ PDF..." className="px-4 py-2 rounded-xl border text-xs font-bold font-mono" />
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1 text-xs font-bold cursor-pointer">
                          <input type="checkbox" checked={newBookletVip} onChange={(e) => setNewBookletVip(e.target.checked)} className="w-4 h-4" />
                          <span>VIP</span>
                        </label>
                        <button onClick={async () => {
                          if (!newBookletTitle || !newBookletUrl) return;
                          const newBookObj = { id: Date.now().toString(), title: newBookletTitle, url: newBookletUrl, size: '15 MB', isVip: newBookletVip };
                          const updatedBooks = [...(currentSub.booklets || []), newBookObj];
                          await updateDoc(doc(db, 'subjects', currentSub.id), { booklets: updatedBooks });
                          const updatedSubs = subjects.map(s => s.id === currentSub.id ? {...s, booklets: updatedBooks} : s);
                          setSubjects(updatedSubs);
                          localStorage.setItem('nabough_cached_subjects', JSON.stringify(updatedSubs));
                          setNewBookletTitle(''); setNewBookletUrl(''); setNewBookletVip(false);
                          setSuccessMessage('تمت إضافة الملزمة بنجاح!');
                          setTimeout(() => setSuccessMessage(null), 3000);
                        }} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-xs font-bold shadow-md">
                          + نشر الملزمة
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* د) الامتحانات */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-6">
                <h4 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-indigo-600" /> الامتحانات والاختبارات التفاعلية ({currentSub.quizzes?.length || 0})
                </h4>
                <div className="space-y-3">
                  {currentSub.quizzes?.map((quiz: any) => (
                    <div key={quiz.id} className="p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-between shadow-sm flex-wrap gap-3">
                      <span className="font-bold text-slate-800 text-sm flex items-center gap-2 flex-wrap">
                        📝 {quiz.title} ({quiz.durationMinutes || 15} دقيقة) {quiz.isVip && <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-black">⭐ VIP</span>}
                      </span>
                      <div className="flex items-center gap-2">
                        {quiz.isVip && !isVipActive && isAdmin === false ? (
                          <button onClick={() => setVipModalItem(quiz)} className="px-3 py-1.5 bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow">
                            <Lock className="w-3.5 h-3.5" /> قفل VIP
                          </button>
                        ) : (
                          <button onClick={() => { setActiveQuiz(quiz); setTimeLeft((quiz.durationMinutes || 15) * 60); setTimerActive(true); }} className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-md">
                            بدء الامتحان
                          </button>
                        )}
                        {isAdmin && (
                          <button onClick={async () => {
                            const updatedQuizzes = currentSub.quizzes.filter((q: any) => q.id !== quiz.id);
                            await updateDoc(doc(db, 'subjects', currentSub.id), { quizzes: updatedQuizzes });
                            const updatedSubs = subjects.map(s => s.id === currentSub.id ? {...s, quizzes: updatedQuizzes} : s);
                            setSubjects(updatedSubs);
                            localStorage.setItem('nabough_cached_subjects', JSON.stringify(updatedSubs));
                            setSuccessMessage('تم حذف الامتحان.');
                            setTimeout(() => setSuccessMessage(null), 3000);
                          }} className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {isAdmin && (
                  <div className="bg-white p-6 rounded-2xl border border-indigo-200 space-y-4">
                    <h5 className="font-black text-slate-900 text-sm">🛠️ صياغة وإضافة امتحان تفاعلي جديد للمادة:</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1">عنوان الامتحان الرئيسي</label>
                        <input type="text" value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} placeholder="مثال: امتحان الفصل الأول الشامل..." className="w-full px-4 py-2.5 rounded-xl border text-sm font-bold bg-white" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">وقت الامتحان (بالدقائق)</label>
                        <input type="number" value={quizDurationMinutes} onChange={(e) => setQuizDurationMinutes(Number(e.target.value))} className="w-full px-4 py-2.5 rounded-xl border text-sm font-bold bg-white" min={1} max={180} />
                      </div>
                    </div>

                    {currentSub.notes && currentSub.notes.length > 0 && (
                      <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl space-y-2">
                        <label className="block text-xs font-black text-indigo-900">💡 استيراد سريع من الشروحات والتعاليل المضافة للمادة:</label>
                        <select 
                          onChange={(e) => {
                            const noteId = e.target.value;
                            if (!noteId) return;
                            const foundNote = currentSub.notes.find((n: any) => n.id === noteId);
                            if (foundNote) {
                              setQuestionText(foundNote.title);
                              setFillCorrect(foundNote.content);
                              setQuestionType('fill');
                            }
                          }}
                          className="w-full px-3 py-2 bg-white border rounded-lg text-xs font-bold text-slate-800"
                        >
                          <option value="">-- اضغط لاختيار تعليل أو شرح لإضافته كسؤال --</option>
                          {currentSub.notes.map((n: any) => (
                            <option key={n.id} value={n.id}>{n.title}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="p-4 bg-slate-50 rounded-xl border space-y-3">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-xs font-black text-slate-800">إضافة سؤال جديد ({currentQuestionsList.length} أسئلة مضافة)</span>
                        <select value={questionType} onChange={(e) => setQuestionType(e.target.value as any)} className="px-3 py-1 bg-white border rounded-lg text-xs font-bold">
                          <option value="mcq">اختيار من متعدد (MCQ)</option>
                          <option value="fill">ملء فراغات (تصحيح ذكي مرن)</option>
                          <option value="true_false">صح وخطأ</option>
                        </select>
                      </div>

                      <input type="text" value={questionText} onChange={(e) => setQuestionText(e.target.value)} placeholder="نص السؤال..." className="w-full px-3 py-2 bg-white rounded-lg border text-xs font-bold" />

                      {questionType === 'mcq' && (
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            {mcqOptions.map((opt, oIdx) => (
                              <input key={oIdx} type="text" value={opt} onChange={(e) => {
                                const newOpts = [...mcqOptions];
                                newOpts[oIdx] = e.target.value;
                                setMcqOptions(newOpts);
                              }} placeholder={`الخيار ${oIdx+1}`} className="px-3 py-1.5 bg-white rounded-lg border text-xs" />
                            ))}
                          </div>
                          <input type="text" value={mcqCorrect} onChange={(e) => setMcqCorrect(e.target.value)} placeholder="اكتب الخيار الصحيح تماماً..." className="w-full px-3 py-1.5 bg-emerald-50 border border-emerald-300 rounded-lg text-xs font-bold text-emerald-900" />
                        </div>
                      )}

                      {questionType === 'fill' && (
                        <input type="text" value={fillCorrect} onChange={(e) => setFillCorrect(e.target.value)} placeholder="الإجابة النموذجية أو المفاتيح الصحيحة..." className="w-full px-3 py-2 bg-emerald-50 border border-emerald-300 rounded-lg text-xs font-bold text-emerald-900" />
                      )}

                      {questionType === 'true_false' && (
                        <div className="flex items-center gap-4 py-1 flex-wrap">
                          <span className="text-xs font-bold text-slate-700">الإجابة الصحيحة:</span>
                          <label className="flex items-center gap-1 text-xs font-bold cursor-pointer">
                            <input type="radio" name="tf" checked={tfCorrect === 'صح'} onChange={() => setTfCorrect('صح')} /> صح
                          </label>
                          <label className="flex items-center gap-1 text-xs font-bold cursor-pointer">
                            <input type="radio" name="tf" checked={tfCorrect === 'خطأ'} onChange={() => setTfCorrect('خطأ')} /> خطأ
                          </label>
                        </div>
                      )}

                      <button onClick={handleAddQuestionToQuiz} className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-bold shadow">
                        + إضافة هذا السؤال لورقة الامتحان
                      </button>
                    </div>

                    <button onClick={() => handleSaveQuizToSubject(currentSub.id)} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs shadow-md">
                      نشر الامتحان التفاعلي نهائياً للمادة
                    </button>
                  </div>
                )}
              </div>

            </div>
          );
        })()}

        {/* 3. لوحة إدارة الطلبة مع خيارات التعديل الشاملة */}
        {activeTab === 'students' && isAdmin && (
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  <Users className="w-6 h-6 text-indigo-600" /> لوحة إدارة الطلبة وحسابات الـ VIP
                </h2>
                <p className="text-sm text-slate-600 mt-1">تعديل بيانات الطالب بالكامل، ترقية المرحلة، وتفعيل الـ VIP.</p>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">تصفية بالمرحلة:</span>
                <select 
                  value={adminStageFilter} 
                  onChange={(e) => setAdminStageFilter(e.target.value)}
                  className="px-4 py-2 bg-slate-50 border-2 border-indigo-200 rounded-xl text-xs font-black text-slate-900 cursor-pointer"
                >
                  <option value="all">🌟 عرض كافة المراحل ({studentsList.length} طالب)</option>
                  {allStagesList.map(st => (
                    <option key={st.id} value={st.name}>{st.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 text-xs font-black">
                    <th className="p-4">الطالب والمرحلة</th>
                    <th className="p-4">تاريخ التسجيل & آخر ظهور</th>
                    <th className="p-4">بيانات الدخول (تعديل اليوزر والباسورد والاسم)</th>
                    <th className="p-4">الحالة والدرجة ونقاط الضعف</th>
                    <th className="p-4">اشتراك VIP</th>
                    <th className="p-4 text-center">التحكم</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-800">
                  {studentsList
                    .filter(st => adminStageFilter === 'all' || st.stage === adminStageFilter)
                    .map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50/80 transition-all">
                      <td className="p-4">
                        <div className="font-black text-slate-900">{st.name}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-indigo-600 text-[11px] bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">{st.stage}</span>
                        </div>
                      </td>

                      <td className="p-4 text-slate-600">
                        <div>📅 تسجيل: <span className="font-mono text-slate-900">{st.regDate || 'غير متوفر'}</span></div>
                        <div className="mt-1">🕒 آخر ظهور: <span className="font-mono text-emerald-600">{st.lastSeen || 'الآن'}</span></div>
                      </td>

                      <td className="p-4">
                        {editingStudentId === st.id ? (
                          <div className="flex flex-col gap-1.5 bg-slate-50 p-3 rounded-xl border border-indigo-200">
                            <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="الاسم الثلاثي..." className="px-2 py-1 rounded bg-white border text-xs font-bold" />
                            <input type="text" value={editUser} onChange={(e) => setEditUser(e.target.value)} placeholder="اليوزر الجديد" className="px-2 py-1 rounded bg-white border text-xs font-bold" />
                            <input type="text" value={editPass} onChange={(e) => setEditPass(e.target.value)} placeholder="الباسورد الجديد" className="px-2 py-1 rounded bg-white border text-xs font-bold" />
                            <select value={editStage} onChange={(e) => setEditStage(e.target.value)} className="px-2 py-1 rounded bg-white border text-xs font-bold">
                              {allStagesList.map(s => (
                                <option key={s.id} value={s.name}>{s.name}</option>
                              ))}
                            </select>
                            <div className="flex gap-2 pt-1">
                              <button onClick={async () => {
                                await updateDoc(doc(db, 'students', st.id), { name: editName, username: editUser, pass: editPass, stage: editStage });
                                const updatedStuds = studentsList.map(item => item.id === st.id ? {...item, name: editName, username: editUser, pass: editPass, stage: editStage} : item);
                                setStudentsList(updatedStuds);
                                localStorage.setItem('nabough_cached_students', JSON.stringify(updatedStuds));
                                setEditingStudentId(null);
                                setSuccessMessage('تم تحديث بيانات الطالب وترقيته بنجاح!');
                                setTimeout(() => setSuccessMessage(null), 3000);
                              }} className="px-3 py-1 bg-emerald-600 text-white rounded text-xs font-bold">حفظ</button>
                              <button onClick={() => setEditingStudentId(null)} className="px-3 py-1 bg-slate-200 rounded text-xs">إلغاء</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border gap-2">
                            <div>
                              <div className="text-slate-900">👤 اليوزر: <span className="font-mono text-indigo-700">{st.username}</span></div>
                              <div className="text-slate-600">🔑 الباسورد: <span className="font-mono text-slate-900">{st.pass}</span></div>
                            </div>
                            <button onClick={() => { 
                              setEditingStudentId(st.id); 
                              setEditName(st.name);
                              setEditUser(st.username); 
                              setEditPass(st.pass);
                              setEditStage(st.stage);
                            }} className="p-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg flex-shrink-0" title="تعديل بيانات الطالب">
                              <Edit3 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>

                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200">{st.status}</span>
                        <div className="text-[11px] text-amber-600 font-black mt-1">الدرجة: {st.examScore}</div>
                        {st.examDetails && (
                          <button onClick={() => setViewingStudentAnswers(st)} className="mt-2 px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-[10px] font-bold shadow hover:bg-indigo-700 block">
                            🔍 عرض الإجابات ونقاط الضعف
                          </button>
                        )}
                      </td>

                      <td className="p-4">
                        <button onClick={async () => {
                          const newVip = !st.isVip;
                          await updateDoc(doc(db, 'students', st.id), { isVip: newVip });
                          const updatedStuds = studentsList.map(item => item.id === st.id ? {...item, isVip: newVip} : item);
                          setStudentsList(updatedStuds);
                          localStorage.setItem('nabough_cached_students', JSON.stringify(updatedStuds));
                          setSuccessMessage('تم تحديث اشتراك الـ VIP.');
                          setTimeout(() => setSuccessMessage(null), 3000);
                        }} className={`px-3 py-1.5 rounded-xl text-[11px] font-black whitespace-nowrap ${st.isVip ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-700'}`}>
                          {st.isVip ? '⭐ VIP مفعّل' : 'حساب مجاني'}
                        </button>
                      </td>

                      <td className="p-4 text-center">
                        <button onClick={async () => {
                          await deleteDoc(doc(db, 'students', st.id));
                          const updatedStuds = studentsList.filter(item => item.id !== st.id);
                          setStudentsList(updatedStuds);
                          localStorage.setItem('nabough_cached_students', JSON.stringify(updatedStuds));
                          setSuccessMessage('تم حذف الطالب.');
                          setTimeout(() => setSuccessMessage(null), 3000);
                        }} className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. إضافة المواد (أدمن فقط) */}
        {activeTab === 'adminPanel' && isAdmin && (
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-emerald-200 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">➕</div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900">لوحة إضافة المواد والصور المخصصة</h2>
                  <p className="text-xs text-slate-500">أضف أي مادة لأي صف مع صورة جذابة</p>
                </div>
              </div>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!newSubName) return;
              const foundStageObj = allStagesList.find(st => st.id === newSubStage || st.name === newSubStage);
              const newObj = {
                name: newSubName,
                stage: foundStageObj ? foundStageObj.id : 'third_intermediate',
                stageName: foundStageObj ? foundStageObj.name : newSubStage,
                icon: '📚',
                color: 'from-blue-600 to-indigo-800',
                image: newSubImage || 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=500&q=80',
                videos: [], booklets: [], notes: [], quizzes: []
              };
              try {
                const docRef = await addDoc(collection(db, 'subjects'), newObj);
                const updatedSubs = [{ id: docRef.id, ...newObj }, ...subjects];
                setSubjects(updatedSubs);
                localStorage.setItem('nabough_cached_subjects', JSON.stringify(updatedSubs));
                setNewSubName(''); setNewSubImage('');
                setSuccessMessage('تمت إضافة المادة وحفظها في قاعدة البيانات بنجاح!');
                setTimeout(() => setSuccessMessage(null), 3000);
              } catch (err) {
                console.error(err);
              }
            }} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اسم المادة</label>
                  <input type="text" required value={newSubName} onChange={(e) => setNewSubName(e.target.value)} placeholder="مثال: الحاسوب والتكنولوجيا" className="w-full px-4 py-2.5 rounded-xl border text-sm font-bold bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الصف الدراسي</label>
                  <select value={newSubStage} onChange={(e) => setNewSubStage(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border text-sm font-bold bg-white">
                    {allStagesList.map(st => (
                      <option key={st.id} value={st.name}>{st.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رابط صورة المادة (URL)</label>
                  <input type="text" value={newSubImage} onChange={(e) => setNewSubImage(e.target.value)} placeholder="رابط صورة..." className="w-full px-4 py-2.5 rounded-xl border text-sm font-bold bg-white font-mono" />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl text-xs shadow-md">
                  إضافة ونشر المادة
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 5. إعدادات VIP */}
        {activeTab === 'vipSettings' && isAdmin && (
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-amber-200 space-y-6">
            <h2 className="text-2xl font-black text-slate-900">إعدادات أسعار وطرق دفع اشتراكات الـ VIP</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              setSuccessMessage('تم تحديث إعدادات الدفع ورقم الواتساب بنجاح!');
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
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رقم الواتساب لاستلام الإيصالات (بدون +، مثلاً: 96477...)</label>
                <input type="text" value={vipSettings.whatsapp} onChange={(e) => setVipSettings({...vipSettings, whatsapp: e.target.value})} className="w-full px-4 py-2.5 rounded-xl border text-sm font-bold bg-white font-mono" />
              </div>
              <button type="submit" className="w-full py-3 bg-amber-600 text-white font-bold rounded-xl text-xs shadow-md">
                حفظ إعدادات الـ VIP ورقم الواتساب
              </button>
            </form>
          </div>
        )}

        {/* 6. إعدادات الأدمن */}
        {activeTab === 'settings' && isAdmin && (
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200 space-y-6">
            <h2 className="text-2xl font-black text-slate-900">إعدادات حساب المدير العام والصلاحيات</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              localStorage.setItem('nabough_admin_pass', adminPassword);
              localStorage.setItem('nabough_admin_user', adminUsername);
              localStorage.setItem('nabough_admin_name', adminName);
              setSuccessMessage('تم تحديث كلمة المرور وحفظها بشكل دائم في الجهاز!');
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
                <label className="block text-xs font-bold text-slate-700 mb-1">كلمة المرور الجديدة الخاصة بك (Password)</label>
                <input type="text" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder="أدخل كلمة مرور قوية جديدة..." className="w-full px-4 py-2.5 rounded-xl border text-sm font-bold bg-white font-mono" />
                <p className="text-[11px] text-slate-500 mt-1">هذه الكلمة ستبقى محفوظة بشكل دائم في متصفحك، وهي المطلوبة عند الضغط على رمز القفل 🔒 بالأسفل.</p>
              </div>
              <button type="submit" className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl text-xs shadow-md">
                حفظ كلمة المرور الجديدة والأمان
              </button>
            </form>
          </div>
        )}

      </main>

      {/* الفوتر مع رمز القفل السري للأدمن */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-auto w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-emerald-600" />
            <span className="font-bold text-slate-800">منصة النابغة التعليمية</span>
            <span>•</span>
            <span>المنهج العراقي الرسمي</span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-emerald-600" /> بغداد - العراق</span>
            
            {/* زر القفل السري لدخول الأدمن */}
            <button 
              onClick={() => setShowAdminLoginModal(true)} 
              className="w-7 h-7 bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-400 rounded-full flex items-center justify-center transition-all shadow-sm"
              title="دخول المدير العام (الأدمن)"
            >
              🔒
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
