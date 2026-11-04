import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { db } from './firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, serverTimestamp, setDoc, getDoc } from 'firebase/firestore';
import { 
  GraduationCap, ShieldCheck, MapPin, BookOpen, Video, FileText, 
  Award, ArrowRight, UserCheck, Users, ChevronDown, CheckCircle2, 
  Sparkles, PlusCircle, Trash2, Crown, Lock, Unlock, Settings, Play, Download, CheckSquare, Edit3, Image as ImageIcon, Eye, X, Key, User, Clock, CheckCircle, AlertCircle, FileText as NoteIcon, MessageCircle, CreditCard, Smartphone, ExternalLink, ArrowUp, ArrowDown, Flame, Send, MessageSquare, Globe, Search, RotateCcw, Unlock as UnlockIcon, Laptop, Upload
} from 'lucide-react';

const MY_TELEGRAM_LINK = 'https://t.me/YourUsername'; 

const safeGetStorage = (key: string, fallback: any) => {
  try {
    const item = localStorage.getItem(key);
    if (!item || item === 'undefined' || item === 'null') return fallback;
    const parsed = JSON.parse(item);
    if (Array.isArray(fallback) && !Array.isArray(parsed)) return fallback;
    return parsed;
  } catch (e) {
    return fallback;
  }
};

export function App() {
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const manifest = {
      name: "منصة النابغة التعليمية",
      short_name: "النابغة",
      start_url: "/",
      display: "standalone",
      background_color: "#0f172a",
      theme_color: "#0f172a",
      icons: [
        {
          src: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=512&h=512&q=80",
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable"
        }
      ]
    };
    const stringManifest = JSON.stringify(manifest);
    const blob = new Blob([stringManifest], { type: 'application/json' });
    const manifestURL = URL.createObjectURL(blob);
    
    let link = document.querySelector('link[rel="manifest"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'manifest';
      document.head.appendChild(link);
    }
    link.setAttribute('href', manifestURL);
  }, []);

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

  // نظام الدردشة العامة الفورية
  const [showPublicChatModal, setShowPublicChatModal] = useState<boolean>(false);
  const [publicChatInput, setPublicChatInput] = useState<string>('');
  const [publicChatMessages, setPublicChatMessages] = useState<any[]>([]);

  useEffect(() => {
    try {
      const q = query(collection(db, 'public_chat'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        msgs.sort((a: any, b: any) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
        setPublicChatMessages(msgs);
      }, (error) => {});
      return () => unsubscribe();
    } catch (e) {}
  }, []);

  const handleSendPublicMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicChatInput.trim()) return;
    
    const nowDateTime = new Date().toLocaleDateString('ar-IQ', {month: 'numeric', day: 'numeric'}) + ' | ' + new Date().toLocaleTimeString('ar-IQ', {hour: '2-digit', minute:'2-digit'});
    const newMsg = {
      sender: loggedStudent ? `${loggedStudent.name} (${loggedStudent.stage})` : (isAdmin ? 'مدير المنصة 🎓' : 'زائر كريم'),
      text: publicChatInput,
      time: nowDateTime,
      createdAt: serverTimestamp()
    };

    try {
      await addDoc(collection(db, 'public_chat'), newMsg);
      setPublicChatInput('');
    } catch (err) {
      alert('⚠️ تعذر الإرسال لعدم توفر اتصال بالإنترنت.');
    }
  };

  const [showInstallGuideModal, setShowInstallGuideModal] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(() => (window as any).deferredPrompt || null);
  const [showInstallBtn, setShowInstallBtn] = useState<boolean>(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      return false;
    }
    return true;
  });

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      (window as any).deferredPrompt = e;
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    };

    const handleAppInstalled = () => {
      setShowInstallBtn(false);
      (window as any).deferredPrompt = null;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallApp = async () => {
    const promptEvent = deferredPrompt || (window as any).deferredPrompt;
    if (promptEvent) {
      promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === 'accepted') {
        setShowInstallBtn(false);
      }
      setDeferredPrompt(null);
      (window as any).deferredPrompt = null;
    } else {
      setShowInstallGuideModal(true);
    }
  };

  const [adminStageFilter, setAdminStageFilter] = useState<string>('all');
  const [adminName, setAdminName] = useState<string>('مدير المنصة');
  const [adminUsername, setAdminUsername] = useState<string>('admin');
  const [adminPassword, setAdminPassword] = useState<string>('123456');

  useEffect(() => {
    async function fetchAdminSettings() {
      try {
        const docSnap = await getDoc(doc(db, 'settings', 'admin_config'));
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.password) setAdminPassword(data.password);
          if (data.username) setAdminUsername(data.username);
          if (data.name) setAdminName(data.name);
        }
      } catch (e) {}
    }
    fetchAdminSettings();
  }, []);
  
  const [vipSettings, setVipSettings] = useState(() => {
    return safeGetStorage('nabough_vip_settings', {
      price: '25,000 دينار عراقي / شهرياً',
      mastercard: '9876-5432-1098-7654 (مصرف الرافدين)',
      transferPhone: '07701234567 (زين كاش / آسياسيل)',
      telegram: MY_TELEGRAM_LINK
    });
  });

  useEffect(() => {
    localStorage.setItem('nabough_vip_settings', JSON.stringify(vipSettings));
  }, [vipSettings]);

  const getTelegramUrl = (usernameOrLink: string, text: string) => {
    let clean = (usernameOrLink || MY_TELEGRAM_LINK).replace('https://t.me/', '').replace('t.me/', '').replace('@', '').trim();
    return `https://t.me/${clean}?text=${encodeURIComponent(text)}`;
  };

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

  // جلب البيانات مع دعم العمل بدون إنترنت
  useEffect(() => {
    async function loadDataOfflineFirst() {
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
        const cachedSubs = safeGetStorage('nabough_cached_subjects', []);
        const cachedStuds = safeGetStorage('nabough_cached_students', []);
        if (cachedSubs.length > 0) setSubjects(cachedSubs);
        if (cachedStuds.length > 0) setStudentsList(cachedStuds);
      } finally {
        setIsLoading(false);
      }
    }
    loadDataOfflineFirst();

    const safetyTimer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(safetyTimer);
  }, []);

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

  const [isChangingStage, setIsChangingStage] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<'curriculum' | 'students' | 'adminPanel' | 'settings' | 'vipSettings'>('curriculum');
  const [selectedStage, setSelectedStage] = useState<string>('all'); 
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [activePdfUrl, setActivePdfUrl] = useState<string | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<any | null>(null);
  const [activeHtmlQuizUrl, setActiveHtmlQuizUrl] = useState<string | null>(null);

  const [editingQuizItem, setEditingQuizItem] = useState<{subjectId: string, quiz: any} | null>(null);
  const [editQuizTitle, setEditQuizTitle] = useState('');
  const [editQuizDuration, setEditQuizDuration] = useState(15);
  const [editQuizQuestions, setEditQuizQuestions] = useState<any[]>([]);

  const [editingVideoItem, setEditingVideoItem] = useState<{subjectId: string, video: any} | null>(null);
  const [editVideoTitle, setEditVideoTitle] = useState('');
  const [editVideoUrl, setEditVideoUrl] = useState('');
  const [editVideoVip, setEditVideoVip] = useState(false);

  const [editingBookletItem, setEditingBookletItem] = useState<{subjectId: string, booklet: any} | null>(null);
  const [editBookletTitle, setEditBookletTitle] = useState('');
  const [editBookletUrl, setEditBookletUrl] = useState('');
  const [editBookletVip, setEditBookletVip] = useState(false);

  const [editingInteractiveItem, setEditingInteractiveItem] = useState<{subjectId: string, noteId: string, questionIndex: number, questionObj: any} | null>(null);
  const [editInteractiveQText, setEditInteractiveQText] = useState('');
  const [editInteractiveOptions, setEditInteractiveOptions] = useState(['', '', '', '']);
  const [editInteractiveCorrect, setEditInteractiveCorrect] = useState('');

  const getEmbedPdfUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('drive.google.com')) {
      return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
    }
    return url;
  };

  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizResult, setQuizResult] = useState<{score: number, total: number, details: any[]} | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(900);
  const [timerActive, setTimerActive] = useState<boolean>(false);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [editSubName, setEditSubName] = useState('');
  const [editSubImage, setEditSubImage] = useState('');

  const [editingNoteModal, setEditingNoteModal] = useState<{subjectId: string, note: any} | null>(null);
  const [editNoteTitle, setEditNoteTitle] = useState('');
  const [editNoteContent, setEditNoteContent] = useState('');
  const [editNoteImage, setEditNoteImage] = useState('');
  const [editNoteVip, setEditNoteVip] = useState(false);

  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editStudentName, setEditStudentName] = useState('');
  const [editStudentUser, setEditStudentUser] = useState('');
  const [editStudentPass, setEditStudentPass] = useState('');
  const [editStudentStage, setEditStudentStage] = useState('');

  const [isMinisterialQuestion, setIsMinisterialQuestion] = useState<boolean>(false);

  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteImage, setNewNoteImage] = useState('');
  const [newNoteVip, setNewNoteVip] = useState(false);

  // إعدادات إنشاء الأسئلة التفاعلية اليدوية ضمن الشروحات
  const [interactiveType, setInteractiveType] = useState<'mcq' | 'fill' | 'true_false'>('mcq');
  const [interactiveQText, setInteractiveQText] = useState('');
  const [interactiveOptions, setInteractiveOptions] = useState(['', '', '', '']);
  const [interactiveCorrect, setInteractiveCorrect] = useState('');
  const [interactiveFill, setInteractiveFill] = useState('');
  const [interactiveTf, setInteractiveTf] = useState('صح');
  const [interactiveList, setInteractiveList] = useState<any[]>([]);
  const [studentInteractiveAnswers, setStudentInteractiveAnswers] = useState<Record<number, string>>({});
  const [interactiveGradedStatus, setInteractiveGradedStatus] = useState<Record<number, boolean>>({});

  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoVip, setNewVideoVip] = useState(false);

  const [newBookletTitle, setNewBookletTitle] = useState('');
  const [newBookletUrl, setNewBookletUrl] = useState('');
  const [newBookletVip, setNewBookletVip] = useState(false);

  // حالات رفع اختبار تفاعلي جاهز من الحاسبة (ملف HTML)
  const [uploadHtmlTitle, setUploadHtmlTitle] = useState('');
  const [uploadHtmlContent, setUploadHtmlContent] = useState('');

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

  const normalizeArabic = (str: string) => {
    if (!str) return '';
    return str
      .trim()
      .toLowerCase()
      .replace(/[\u064b-\u0652]/g, '')
      .replace(/[أإآ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي')
      .replace(/[^\u0600-\u06FF\s0-9a-zA-Z]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const getDeviceType = () => {
    const ua = navigator.userAgent;
    if (/android|iphone|ipad|ipod/i.test(ua)) {
      return '📱 موبايل';
    }
    return '💻 حاسبة';
  };

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
    const cleanUser = normalizeArabic(userAns);
    const cleanCorrect = normalizeArabic(correctAns);

    if (qType === 'mcq' || qType === 'true_false') {
      return { isCorrect: cleanUser === cleanCorrect, scoreRatio: cleanUser === cleanCorrect ? 1 : 0 };
    }

    if (cleanUser === cleanCorrect) {
      return { isCorrect: true, scoreRatio: 1 };
    }

    const correctWords = cleanCorrect.split(' ').filter(w => w.length > 2);
    if (correctWords.length === 0) {
      return { isCorrect: cleanUser.includes(cleanCorrect) || cleanCorrect.includes(cleanUser), scoreRatio: 0.6 };
    }

    let matchedCount = 0;
    correctWords.forEach(w => {
      if (cleanUser.includes(w)) matchedCount++;
    });

    const ratio = matchedCount / correctWords.length;
    
    if (ratio >= 0.7) {
      return { isCorrect: true, scoreRatio: 1 };
    } else if (ratio >= 0.4) {
      return { isCorrect: false, scoreRatio: 0.75 };
    } else if (ratio >= 0.2) {
      return { isCorrect: false, scoreRatio: 0.5 };
    } else if (cleanCorrect.includes(cleanUser) && cleanUser.length >= 3) {
      return { isCorrect: false, scoreRatio: 0.3 };
    }

    return { isCorrect: false, scoreRatio: 0 };
  };

  const handleAddQuestionToQuiz = () => {
    if (!questionText) return;
    if (questionType === 'mcq') {
      setCurrentQuestionsList([...currentQuestionsList, { type: 'mcq', q: questionText, options: mcqOptions, correct: mcqCorrect, isMinisterial: isMinisterialQuestion }]);
    } else if (questionType === 'fill') {
      setCurrentQuestionsList([...currentQuestionsList, { type: 'fill', q: questionText, correct: fillCorrect, isMinisterial: isMinisterialQuestion }]);
    } else {
      setCurrentQuestionsList([...currentQuestionsList, { type: 'true_false', q: questionText, options: ['صح', 'خطأ'], correct: tfCorrect, isMinisterial: isMinisterialQuestion }]);
    }
    setQuestionText('');
    setMcqOptions(['', '', '', '']);
    setMcqCorrect('');
    setFillCorrect('');
    setIsMinisterialQuestion(false);
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
      alert('⚠️ لا يوجد انترنت لحفظ التعديلات سحابياً.');
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
        isCorrect: evaluation.isCorrect || evaluation.scoreRatio >= 0.7,
        partialScore: questionGrade,
        isMinisterial: q.isMinisterial
      };
    });

    const finalScore = Math.round((totalScoreEarned / maxPossibleScore) * 100);
    setQuizResult({ score: finalScore, total: 100, details });

    if (loggedStudent) {
      const nowFormatted = new Date().toLocaleDateString('ar-IQ', {month: 'numeric', day: 'numeric'}) + ' | ' + new Date().toLocaleTimeString('ar-IQ', {hour: '2-digit', minute:'2-digit'});
      const device = getDeviceType();
      const updatedStuds = studentsList.map(st => st.id === loggedStudent.id ? {
        ...st, 
        examScore: `${finalScore}/100`, 
        examDetails: details,
        lastSeen: nowFormatted,
        deviceType: device
      } : st);
      setStudentsList(updatedStuds);
      localStorage.setItem('nabough_cached_students', JSON.stringify(updatedStuds));
      try {
        await updateDoc(doc(db, 'students', loggedStudent.id), {
          examScore: `${finalScore}/100`,
          examDetails: details,
          lastSeen: nowFormatted,
          deviceType: device
        });
      } catch(e) {}
    }
    setSuccessMessage(`أتممت الامتحان بنجاح! درجتك: ${finalScore}/100`);
  };

  const handleRetryIncorrectQuestions = () => {
    if (!quizResult || !quizResult.details) return;
    const incorrectOnly = quizResult.details.filter(d => !d.isCorrect).map(d => ({
      q: d.q,
      correct: d.correct,
      type: 'fill',
      isMinisterial: d.isMinisterial
    }));

    if (incorrectOnly.length === 0) {
      alert('أنت بطل! ليس لديك أخطاء لإعادتها.');
      return;
    }

    const retryQuizObj = {
      title: `إعادة امتحان الأخطاء السابقة (${activeQuiz.title})`,
      durationMinutes: 10,
      questions: incorrectOnly
    };

    setQuizResult(null);
    setQuizAnswers({});
    setActiveQuiz(retryQuizObj);
    setTimeLeft(600);
    setTimerActive(true);
  };

  const handleMoveItem = async (subjectId: string, listKey: 'notes' | 'videos' | 'booklets' | 'quizzes' | 'htmlQuizzes', index: number, direction: 'up' | 'down') => {
    const targetSub = subjects.find(s => s.id === subjectId);
    if (!targetSub) return;
    const list = [...(targetSub[listKey] || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    try {
      await updateDoc(doc(db, 'subjects', subjectId), { [listKey]: list });
      const updatedSubs = subjects.map(s => s.id === subjectId ? { ...s, [listKey]: list } : s);
      setSubjects(updatedSubs);
      localStorage.setItem('nabough_cached_subjects', JSON.stringify(updatedSubs));
    } catch(e) {}
  };

  const handleMoveSubjectGlobal = async (subjectId: string, direction: 'up' | 'down') => {
    const list = [...subjects];
    const index = list.findIndex(s => s.id === subjectId);
    if (index === -1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    setSubjects(list);
    localStorage.setItem('nabough_cached_subjects', JSON.stringify(list));
  };

  const filteredSubjects = subjects.filter(s => {
    if (isAdmin) {
      return selectedStage === 'all' || s.stage === selectedStage || s.stageName === selectedStage;
    } else if (loggedStudent) {
      return s.stageName === loggedStudent.stage || s.stage === loggedStudent.stage || s.stageName?.trim() === loggedStudent.stage?.trim();
    } else {
      return selectedStage === 'all' || s.stage === selectedStage || s.stageName === selectedStage;
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
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 font-sans antialiased overflow-x-hidden pt-1 sm:pt-2">
      
      {/* نافذة مشغل ملفات HTML التفاعلية المرفوعة */}
      {activeHtmlQuizUrl && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full h-[90vh] p-4 shadow-2xl relative flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="font-black text-base text-slate-900">الاختبار التفاعلي الجاهز 🌟</h3>
              <button onClick={() => setActiveHtmlQuizUrl(null)} className="w-9 h-9 bg-rose-600 text-white rounded-full flex items-center justify-center font-bold">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 w-full rounded-2xl overflow-hidden bg-white mt-3 border">
              <iframe srcDoc={activeHtmlQuizUrl} className="w-full h-full border-0"></iframe>
            </div>
          </div>
        </div>
      )}

      {/* نافذة تعديل الشرح الرئيسي */}
      {editingNoteModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-4 text-right">
            <button onClick={() => setEditingNoteModal(null)} className="absolute top-4 left-4 w-9 h-9 bg-slate-100 hover:bg-rose-50 text-slate-600 rounded-full flex items-center justify-center font-bold">
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-black text-slate-900 pb-2 border-b">تعديل الشرح أو التعليل الرئيسي</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">عنوان الشرح / التعليل</label>
                <input type="text" value={editNoteTitle} onChange={(e) => setEditNoteTitle(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs font-bold" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">النص التفصيلي</label>
                <textarea value={editNoteContent} onChange={(e) => setEditNoteContent(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs font-bold h-24" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رابط الصورة التوضيحية للشرح (URL)</label>
                <input type="text" value={editNoteImage} onChange={(e) => setEditNoteImage(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs font-mono font-bold" />
              </div>
              <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                <input type="checkbox" checked={editNoteVip} onChange={(e) => setEditNoteVip(e.target.checked)} className="w-4 h-4 text-amber-600" />
                <span>شرح خاص بـ VIP؟</span>
              </label>
            </div>

            <div className="flex gap-2 pt-3 border-t">
              <button onClick={async () => {
                const targetSub = subjects.find(s => s.id === editingNoteModal.subjectId);
                if (!targetSub) return;
                const updatedNotes = targetSub.notes.map((n: any) => n.id === editingNoteModal.note.id ? { 
                  ...n, 
                  title: editNoteTitle, 
                  content: editNoteContent, 
                  image: editNoteImage, 
                  isVip: editNoteVip 
                } : n);

                try {
                  await updateDoc(doc(db, 'subjects', editingNoteModal.subjectId), { notes: updatedNotes });
                  const updatedSubs = subjects.map(s => s.id === editingNoteModal.subjectId ? {...s, notes: updatedNotes} : s);
                  setSubjects(updatedSubs);
                  localStorage.setItem('nabough_cached_subjects', JSON.stringify(updatedSubs));
                  setEditingNoteModal(null);
                  setSuccessMessage('تم تعديل الشرح بنجاح!');
                  setTimeout(() => setSuccessMessage(null), 3000);
                } catch(e) {}
              }} className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer">
                حفظ التعديل
              </button>
              <button onClick={() => setEditingNoteModal(null)} className="flex-1 py-2.5 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة تعديل الامتحان للأدمن */}
      {editingQuizItem && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl relative space-y-4 text-right">
            <button onClick={() => setEditingQuizItem(null)} className="absolute top-4 left-4 w-9 h-9 bg-slate-100 hover:bg-rose-50 text-slate-600 rounded-full flex items-center justify-center font-bold">
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-black text-slate-900 pb-2 border-b">تعديل الامتحان وتفاصيل الأسئلة</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">عنوان الامتحان</label>
                <input type="text" value={editQuizTitle} onChange={(e) => setEditQuizTitle(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs font-bold" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الوقت (بالدقائق)</label>
                <input type="number" value={editQuizDuration} onChange={(e) => setEditQuizDuration(Number(e.target.value))} className="w-full px-3 py-2 border rounded-xl text-xs font-bold" />
              </div>

              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-black text-indigo-900">أسئلة الامتحان الحالية (تعديل أو حذف):</h4>
                {editQuizQuestions.map((eq: any, eqIdx: number) => (
                  <div key={eqIdx} className="p-3 bg-slate-50 rounded-xl border space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-900">س{eqIdx+1} ({eq.type || 'fill'}):</span>
                      <button onClick={() => {
                        setEditQuizQuestions(editQuizQuestions.filter((_, i) => i !== eqIdx));
                      }} className="text-rose-500 hover:bg-rose-50 p-1 rounded text-xs flex items-center gap-1 font-bold cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" /> حذف السؤال
                      </button>
                    </div>

                    <input 
                      type="text" 
                      value={eq.q} 
                      onChange={(e) => {
                        const newQ = [...editQuizQuestions];
                        newQ[eqIdx].q = e.target.value;
                        setEditQuizQuestions(newQ);
                      }} 
                      placeholder="نص السؤال..." 
                      className="w-full px-3 py-1.5 bg-white border rounded-lg text-xs font-bold" 
                    />

                    {eq.options && Array.isArray(eq.options) && (
                      <div className="grid grid-cols-2 gap-1.5 pt-1">
                        {eq.options.map((opt: string, oIdx: number) => (
                          <input 
                            key={oIdx} 
                            type="text" 
                            value={opt} 
                            onChange={(e) => {
                              const newQ = [...editQuizQuestions];
                              newQ[eqIdx].options[oIdx] = e.target.value;
                              setEditQuizQuestions(newQ);
                            }} 
                            placeholder={`خيار ${oIdx+1}`} 
                            className="px-2 py-1 bg-white border rounded text-xs" 
                          />
                        ))}
                      </div>
                    )}

                    <input 
                      type="text" 
                      value={eq.correct} 
                      onChange={(e) => {
                        const newQ = [...editQuizQuestions];
                        newQ[eqIdx].correct = e.target.value;
                        setEditQuizQuestions(newQ);
                      }} 
                      placeholder="الإجابة الصحيحة تماماً..." 
                      className="w-full px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-bold text-emerald-900" 
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <button onClick={async () => {
                const targetSub = subjects.find(s => s.id === editingQuizItem.subjectId);
                if (!targetSub) return;
                const updatedQuizzes = targetSub.quizzes.map((qz: any) => qz.id === editingQuizItem.quiz.id ? { ...qz, title: editQuizTitle, durationMinutes: editQuizDuration, questions: editQuizQuestions } : qz);
                
                try {
                  await updateDoc(doc(db, 'subjects', editingQuizItem.subjectId), { quizzes: updatedQuizzes });
                  const updatedSubs = subjects.map(s => s.id === editingQuizItem.subjectId ? {...s, quizzes: updatedQuizzes} : s);
                  setSubjects(updatedSubs);
                  localStorage.setItem('nabough_cached_subjects', JSON.stringify(updatedSubs));
                  setEditingQuizItem(null);
                  setSuccessMessage('تم تحديث الامتحان بنجاح!');
                  setTimeout(() => setSuccessMessage(null), 3000);
                } catch(e) {}
              }} className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer">
                حفظ التعديلات نهائياً
              </button>
              <button onClick={() => setEditingQuizItem(null)} className="flex-1 py-2.5 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* رأس الصفحة */}
      <div className="w-full bg-slate-900 py-2.5 px-3 sm:px-6 shadow-md flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow">ن</div>
          <div>
            <h2 className="text-white font-black text-xs sm:text-sm tracking-wide">منصة النابغة التعليمية</h2>
            <p className="text-[9px] text-slate-400">المنهج العراقي الرسمي</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button onClick={() => setShowPublicChatModal(true)} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[11px] font-bold shadow flex items-center gap-1.5 cursor-pointer">
            <Globe className="w-3.5 h-3.5" /> الدردشة العامة 🌐
          </button>

          {showInstallBtn && (
            <button onClick={handleInstallApp} className="px-2 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 rounded-xl text-[11px] font-black shadow flex items-center gap-1 cursor-pointer">
              <Smartphone className="w-3.5 h-3.5" /> تثبيت 📱
            </button>
          )}

          {isAdmin ? (
            <button onClick={() => setIsAdmin(false)} className="px-2.5 py-1.5 bg-rose-600 text-white rounded-xl text-[11px] font-bold shadow-sm">خروج الأدمن</button>
          ) : loggedStudent ? (
            <button onClick={async () => {
              if (loggedStudent) {
                try { await updateDoc(doc(db, 'students', loggedStudent.id), { status: 'غير متصل' }); } catch(e) {}
              }
              localStorage.removeItem('nabough_logged_student');
              setLoggedStudent(null); 
            }} className="px-2.5 py-1.5 bg-rose-600 text-white rounded-xl text-[11px] font-bold shadow-sm">خروج ({loggedStudent.name.split(' ')[0]})</button>
          ) : (
            <button onClick={() => setShowStudentAuthModal(true)} className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-[11px] font-bold shadow-md">دخول / تسجيل</button>
          )}
        </div>
      </div>

      {/* شريط التبويبات (للأدمن فقط) */}
      {isAdmin && (
        <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30 w-full">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between py-2.5 gap-2 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-2">
              <button onClick={() => { setActiveTab('curriculum'); setSelectedSubjectId(null); }} className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'curriculum' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                <BookOpen className="w-3.5 h-3.5" /> المنهج الدراسي
              </button>
              <button onClick={() => { setActiveTab('students'); setSelectedSubjectId(null); }} className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'students' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                <Users className="w-3.5 h-3.5" /> الطلبة ودرجاتهم
              </button>
              <button onClick={() => { setActiveTab('adminPanel'); setSelectedSubjectId(null); }} className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'adminPanel' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                <PlusCircle className="w-3.5 h-3.5" /> إضافة المواد
              </button>
              <button onClick={() => { setActiveTab('vipSettings'); setSelectedSubjectId(null); }} className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'vipSettings' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800'}`}>
                <Crown className="w-3.5 h-3.5" /> إعدادات VIP
              </button>
              <button onClick={() => { setActiveTab('settings'); setSelectedSubjectId(null); }} className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'settings' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}>
                <Key className="w-3.5 h-3.5" /> كلمة المرور
              </button>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="w-full px-2 sm:px-4 mt-3">
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-2 rounded-xl flex items-center gap-2 text-xs font-bold shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      {/* المحتوى الرئيسي */}
      <main className="flex-1 w-full max-w-full mx-auto px-1 sm:px-3 py-3 space-y-5 overflow-x-hidden">
        
        {/* البانر العلوي */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 rounded-2xl shadow-lg text-white p-4 sm:p-6 relative overflow-hidden">
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-1.5 bg-indigo-800/60 border border-indigo-600/30 px-2.5 py-0.5 rounded-lg text-[11px] font-bold text-indigo-200">
              <ShieldCheck className="w-3 h-3 text-emerald-400" /> منصة النابغة التعليمية - المنهج العراقي الرسمي
            </div>
            
            <h1 className="text-xl sm:text-3xl font-black tracking-tight leading-snug">
              {isAdmin ? 'لوحة تحكم المدير العام والإدارة 🎓' : loggedStudent ? `أهلاً بك يا ${loggedStudent?.name} (${loggedStudent?.stage}) 📚` : 'تصفح المناهج والامتحانات التفاعلية 🎓'}
            </h1>
          </div>
        </div>

        {/* 1. تبويب المنهج الدراسي */}
        {activeTab === 'curriculum' && !selectedSubjectId && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg flex-shrink-0">📚</div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm sm:text-base">
                    {isAdmin ? 'اختر الصف الدراسي' : loggedStudent ? `مرحلتك الحصرية: ${loggedStudent?.stage}` : 'اختر الصف الدراسي'}
                  </h3>
                  <p className="text-[11px] text-slate-500">يتضمن كافة المراحل والصفوف في العراق</p>
                </div>
              </div>

              {(!loggedStudent || isAdmin) && (
                <div className="relative w-full sm:w-80">
                  <select 
                    value={selectedStage}
                    onChange={(e) => setSelectedStage(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-indigo-200 text-slate-900 text-xs sm:text-sm font-black rounded-xl px-3 py-3 appearance-none cursor-pointer"
                  >
                    <option value="all">🌟 عرض كافة المراحل الدراسية</option>
                    {allStagesList.map(st => (
                      <option key={st.id} value={st.id}>{st.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-indigo-600 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredSubjects.map((sub) => (
                <div 
                  key={sub.id}
                  onClick={() => {
                    if (!loggedStudent && !isAdmin) {
                      setShowStudentAuthModal(true);
                    } else {
                      setSelectedSubjectId(sub.id);
                      setSearchQuery('');
                    }
                  }}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-slate-200 group flex flex-col justify-between relative cursor-pointer"
                >
                  {isAdmin && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 z-25">
                      <button onClick={(e) => { e.stopPropagation(); handleMoveSubjectGlobal(sub.id, 'up'); }} className="w-6 h-6 bg-slate-800 text-white rounded flex items-center justify-center text-xs cursor-pointer" title="للأعلى"><ArrowUp className="w-3 h-3" /></button>
                      <button onClick={(e) => { e.stopPropagation(); handleMoveSubjectGlobal(sub.id, 'down'); }} className="w-6 h-6 bg-slate-800 text-white rounded flex items-center justify-center text-xs cursor-pointer" title="للأسفل"><ArrowDown className="w-3 h-3" /></button>
                      <button onClick={(e) => { e.stopPropagation(); setEditingSubjectId(sub.id); setEditSubName(sub.name); setEditSubImage(sub.image || ''); }} className="w-6 h-6 bg-indigo-600 text-white rounded flex items-center justify-center text-xs cursor-pointer"><Edit3 className="w-3 h-3" /></button>
                      <button onClick={async (e) => {
                        e.stopPropagation();
                        if (window.confirm(`حذف مادة ${sub.name}?`)) {
                          await deleteDoc(doc(db, 'subjects', sub.id));
                          setSubjects(subjects.filter(s => s.id !== sub.id));
                        }
                      }} className="w-6 h-6 bg-rose-600 text-white rounded flex items-center justify-center text-xs cursor-pointer"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  )}

                  <div className="h-32 w-full relative overflow-hidden bg-slate-200">
                    <img src={sub.image} alt={sub.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                    <div className="absolute bottom-2 right-2 left-2 flex items-center justify-between text-white">
                      <span className="text-[11px] font-black bg-indigo-600/90 px-2 py-0.5 rounded">{sub.stageName}</span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-base font-black text-slate-900">{sub.name}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. إدارة وتصفح المادة الدراسية المفصلة (مع استعادة الشروحات والأسئلة التفاعلية اليدوية بالكامل) */}
        {selectedSubjectId && (() => {
          const currentSub = subjects.find(s => s.id === selectedSubjectId);
          if (!currentSub) return null;

          const filteredNotes = (currentSub.notes || []).filter((n: any) => 
            n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            n.content.toLowerCase().includes(searchQuery.toLowerCase())
          );

          return (
            <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-xl border border-indigo-100 space-y-6 w-full">
              <div className="flex items-center justify-between pb-3 border-b flex-wrap gap-2">
                <div>
                  <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">عرض المادة</span>
                  <h3 className="text-lg sm:text-2xl font-black text-slate-900 mt-1 flex items-center gap-2">
                    <span>{currentSub.icon}</span> {currentSub.name} ({currentSub.stageName})
                  </h3>
                </div>
                <button onClick={() => setSelectedSubjectId(null)} className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-2 rounded-xl cursor-pointer">
                  ← العودة للمناهج
                </button>
              </div>

              {/* قسم رفع اختبار تفاعلي جاهز (ملف HTML من الحاسبة مباشرة) */}
              {isAdmin && (
                <div className="bg-indigo-50 border-2 border-indigo-200 p-4 rounded-2xl space-y-3">
                  <h4 className="font-black text-indigo-900 text-sm flex items-center gap-2">
                    <Upload className="w-4 h-4 text-indigo-600" /> رفع اختبار تفاعلي جاهز (اختر ملف HTML من حاسبتك) 🌟
                  </h4>
                  <p className="text-xs text-slate-600">اكتب عنوان الاختبار، ثم اضغط تصفح لاختيار ملف الـ HTML من حاسبتك:</p>
                  
                  <div className="space-y-2">
                    <input 
                      type="text" 
                      value={uploadHtmlTitle}
                      onChange={(e) => setUploadHtmlTitle(e.target.value)}
                      placeholder="عنوان الاختبار (مثال: اختبار الوحدة الأولى)..." 
                      className="w-full px-3 py-2 bg-white border rounded-xl text-xs font-bold" 
                    />
                    <div className="flex items-center gap-2 flex-wrap">
                      <input 
                        type="file" 
                        accept=".html,.htm"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              setUploadHtmlContent(event.target?.result as string || '');
                            };
                            reader.readAsText(file);
                          }
                        }}
                        className="w-full sm:w-auto text-xs font-bold file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer bg-white border rounded-xl p-2"
                      />
                    </div>
                  </div>

                  <button onClick={async () => {
                    if (!uploadHtmlTitle || !uploadHtmlContent) {
                      alert('يرجى كتابة عنوان الاختبار واختيار ملف الـ HTML من الحاسبة.');
                      return;
                    }
                    const newHtmlQuiz = { id: Date.now().toString(), title: uploadHtmlTitle, content: uploadHtmlContent };
                    const updatedHtmlQuizzes = [...(currentSub.htmlQuizzes || []), newHtmlQuiz];
                    
                    try {
                      await updateDoc(doc(db, 'subjects', currentSub.id), { htmlQuizzes: updatedHtmlQuizzes });
                      const updatedSubs = subjects.map(s => s.id === currentSub.id ? {...s, htmlQuizzes: updatedHtmlQuizzes} : s);
                      setSubjects(updatedSubs);
                      localStorage.setItem('nabough_cached_subjects', JSON.stringify(updatedSubs));
                      setUploadHtmlTitle('');
                      setUploadHtmlContent('');
                      setSuccessMessage('تم رفع ونشر الاختبار التفاعلي بنجاح!');
                      setTimeout(() => setSuccessMessage(null), 3000);
                    } catch(err) {
                      alert('حدث خطأ أثناء النشر.');
                    }
                  }} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow cursor-pointer">
                    + نشر الاختبار التفاعلي المرفوع في هذه المادة 🚀
                  </button>
                </div>
              )}

              {/* استعراض الاختبارات التفاعلية المرفوعة للطلاب */}
              {currentSub.htmlQuizzes && currentSub.htmlQuizzes.length > 0 && (
                <div className="bg-slate-50 p-4 rounded-2xl border space-y-3">
                  <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                    🌟 الاختبارات التفاعلية المرفوعة ({currentSub.htmlQuizzes.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentSub.htmlQuizzes.map((hq: any) => (
                      <div key={hq.id} className="p-3 bg-white rounded-xl border flex items-center justify-between shadow-sm">
                        <span className="font-black text-slate-800 text-xs">⭐ {hq.title}</span>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setActiveHtmlQuizUrl(hq.content)} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow cursor-pointer">
                            فتح الاختبار 🎯
                          </button>
                          {isAdmin && (
                            <button onClick={async () => {
                              if (window.confirm('حذف هذا الاختبار؟')) {
                                const newHq = currentSub.htmlQuizzes.filter((x: any) => x.id !== hq.id);
                                await updateDoc(doc(db, 'subjects', currentSub.id), { htmlQuizzes: newHq });
                                setSubjects(subjects.map(s => s.id === currentSub.id ? {...s, htmlQuizzes: newHq} : s));
                              }
                            }} className="text-rose-500 p-1 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* أ) الشروحات والتعاليل مع الأسئلة التفاعلية اليدوية بكامل تفاصيلها وأزرار التعديل والحذف */}
              <div className="bg-slate-50 p-3 sm:p-5 rounded-2xl border space-y-4">
                <h4 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <NoteIcon className="w-4 h-4 text-amber-600" /> الشروحات والتعاليل والملاحظات ({filteredNotes.length})
                </h4>
                <div className="space-y-4">
                  {filteredNotes.map((note: any) => (
                    <div key={note.id} className="p-4 bg-white rounded-2xl border shadow-sm space-y-3 relative">
                      <div className="flex items-center justify-between flex-wrap gap-2 border-b pb-2">
                        <div className="flex items-center gap-2">
                          <h5 className="font-black text-slate-900 text-xs sm:text-sm">💡 {note.title}</h5>
                          {note.isVip && <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-black">⭐ VIP</span>}
                        </div>

                        {isAdmin && (
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => {
                              setEditingNoteModal({ subjectId: currentSub.id, note: note });
                              setEditNoteTitle(note.title);
                              setEditNoteContent(note.content);
                              setEditNoteImage(note.image || '');
                              setEditNoteVip(note.isVip || false);
                            }} className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1">
                              <Edit3 className="w-3.5 h-3.5" /> تعديل الشرح ✏️
                            </button>

                            <button onClick={async () => {
                              if (window.confirm(`حذف هذا الشرح (${note.title})؟`)) {
                                const updatedNotes = currentSub.notes.filter((n: any) => n.id !== note.id);
                                await updateDoc(doc(db, 'subjects', currentSub.id), { notes: updatedNotes });
                                setSubjects(subjects.map(s => s.id === currentSub.id ? {...s, notes: updatedNotes} : s));
                                setSuccessMessage('تم حذف الشرح بنجاح!');
                                setTimeout(() => setSuccessMessage(null), 3000);
                              }
                            }} className="px-2.5 py-1 bg-rose-50 text-rose-600 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1">
                              <Trash2 className="w-3.5 h-3.5" /> حذف 🗑️
                            </button>
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed">{note.content}</p>

                      {note.image && (
                        <div className="mt-2 w-full max-h-72 rounded-xl overflow-hidden border shadow-sm bg-slate-50 flex items-center justify-center p-2">
                          <img src={note.image} alt={note.title} className="max-h-64 w-auto object-contain rounded-lg" />
                        </div>
                      )}

                      {/* الأسئلة التفاعلية اليدوية التابعة للشرح */}
                      {note.interactiveQuestions && note.interactiveQuestions.length > 0 && (
                        <div className="mt-3 p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-2.5">
                          <div className="flex items-center justify-between">
                            <h6 className="text-[11px] font-black text-indigo-900 flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> الأسئلة التفاعلية السريعة:
                            </h6>
                          </div>
                          {note.interactiveQuestions.map((iq: any, iqIdx: number) => {
                            const ansKey = `${note.id}_${iqIdx}`;
                            const userAns = studentInteractiveAnswers[ansKey] || '';
                            const isGraded = interactiveGradedStatus[ansKey];
                            const isCorrect = evaluateAnswerSmart(userAns, iq.correct, iq.type).isCorrect;

                            return (
                              <div key={iqIdx} className="bg-white p-3 rounded-lg border space-y-2 relative">
                                <div className="flex items-center justify-between">
                                  <div className="text-xs font-bold text-slate-900">س: {iq.q}</div>
                                  {isAdmin && (
                                    <div className="flex items-center gap-1">
                                      <button onClick={() => {
                                        setEditingInteractiveItem({ subjectId: currentSub.id, noteId: note.id, questionIndex: iqIdx, questionObj: iq });
                                        setEditInteractiveQText(iq.q);
                                        setEditInteractiveOptions(iq.options ? [...iq.options] : ['', '', '', '']);
                                        setEditInteractiveCorrect(iq.correct);
                                      }} className="p-1 bg-indigo-50 text-indigo-600 rounded text-[10px] cursor-pointer" title="تعديل السؤال"><Edit3 className="w-3 h-3" /></button>
                                      
                                      <button onClick={async () => {
                                        if (window.confirm('حذف هذا السؤال التفاعلي؟')) {
                                          const newIqList = note.interactiveQuestions.filter((_: any, idx: number) => idx !== iqIdx);
                                          const updatedNotes = currentSub.notes.map((n: any) => n.id === note.id ? { ...n, interactiveQuestions: newIqList } : n);
                                          await updateDoc(doc(db, 'subjects', currentSub.id), { notes: updatedNotes });
                                          setSubjects(subjects.map(s => s.id === currentSub.id ? {...s, notes: updatedNotes} : s));
                                        }
                                      }} className="p-1 text-rose-500 rounded text-[10px] cursor-pointer" title="حذف السؤال"><Trash2 className="w-3 h-3" /></button>
                                    </div>
                                  )}
                                </div>

                                {iq.type === 'mcq' || iq.type === 'true_false' ? (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                    {iq.options.map((opt: string, oIdx: number) => (
                                      <label key={oIdx} className={`flex items-center gap-2 p-2 rounded border cursor-pointer text-xs font-bold transition-all ${userAns === opt ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50'}`}>
                                        <input type="radio" name={`iq_${ansKey}`} checked={userAns === opt} onChange={() => setStudentInteractiveAnswers({...studentInteractiveAnswers, [ansKey]: opt})} className="hidden" />
                                        <span>{opt}</span>
                                      </label>
                                    ))}
                                  </div>
                                ) : (
                                  <input 
                                    type="text" 
                                    value={userAns} 
                                    onChange={(e) => setStudentInteractiveAnswers({...studentInteractiveAnswers, [ansKey]: e.target.value})} 
                                    placeholder="اكتب إجابتك هنا..." 
                                    className="w-full px-3 py-1.5 bg-slate-50 border rounded text-xs font-bold" 
                                  />
                                )}

                                <div className="flex items-center justify-between pt-1">
                                  <button onClick={() => setInteractiveGradedStatus({...interactiveGradedStatus, [ansKey]: true})} className="px-3 py-1 bg-indigo-600 text-white rounded text-[10px] font-bold shadow cursor-pointer">
                                    تحقق ✓
                                  </button>
                                  {isGraded && (
                                    <span className={`text-[10px] font-black ${isCorrect ? 'text-emerald-600' : 'text-rose-600'}`}>
                                      {isCorrect ? '✅ صحيحة بطل!' : `❌ خطأ (العبارة الصحيحة: ${iq.correct})`}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* نموذج إضافة شرح جديد مع الأسئلة التفاعلية اليدوية */}
                {isAdmin && (
                  <div className="bg-white p-4 rounded-xl border space-y-3 mt-3">
                    <h5 className="text-xs font-black text-slate-800">➕ إضافة شرح أو تعليل جديد (مع صورة توضيحية وسؤال تفاعلي يدوي):</h5>
                    <input type="text" value={newNoteTitle} onChange={(e) => setNewNoteTitle(e.target.value)} placeholder="العنوان..." className="w-full px-3 py-2 border rounded-xl text-xs font-bold" />
                    <textarea value={newNoteContent} onChange={(e) => setNewNoteContent(e.target.value)} placeholder="النص التفصيلي..." className="w-full px-3 py-2 border rounded-xl text-xs font-bold h-20" />
                    <input type="text" value={newNoteImage} onChange={(e) => setNewNoteImage(e.target.value)} placeholder="رابط صورة توضيحية للشرح (اختياري)..." className="w-full px-3 py-2 border rounded-xl text-xs font-mono" />
                    
                    {/* إرفاق سؤال تفاعلي يدوي */}
                    <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-200 space-y-2">
                      <h6 className="text-xs font-black text-indigo-900">إرفاق سؤال تفاعلي سريع (اختيارات / فراغ / صح وخطأ):</h6>
                      <div className="flex gap-2">
                        <select value={interactiveType} onChange={(e) => setInteractiveType(e.target.value as any)} className="px-2 py-1 bg-white border rounded text-xs font-bold">
                          <option value="mcq">اختيارات</option>
                          <option value="fill">فراغ</option>
                          <option value="true_false">صح وخطأ</option>
                        </select>
                        <input type="text" value={interactiveQText} onChange={(e) => setInteractiveQText(e.target.value)} placeholder="نص السؤال التفاعلي..." className="flex-1 px-2 py-1 bg-white border rounded text-xs font-bold" />
                      </div>

                      {interactiveType === 'mcq' && (
                        <div className="grid grid-cols-2 gap-2">
                          {interactiveOptions.map((opt, oIdx) => (
                            <input key={oIdx} type="text" value={opt} onChange={(e) => {
                              const opts = [...interactiveOptions]; opts[oIdx] = e.target.value; setInteractiveOptions(opts);
                            }} placeholder={`الخيار ${oIdx+1}`} className="px-2 py-1 bg-white border rounded text-xs" />
                          ))}
                          <input type="text" value={interactiveCorrect} onChange={(e) => setInteractiveCorrect(e.target.value)} placeholder="الخيار الصحيح..." className="col-span-2 px-2 py-1 bg-emerald-50 border rounded text-xs font-bold text-emerald-900" />
                        </div>
                      )}

                      {interactiveType === 'fill' && (
                        <input type="text" value={interactiveFill} onChange={(e) => setInteractiveFill(e.target.value)} placeholder="الإجابة بالفراغ..." className="w-full px-2 py-1 bg-emerald-50 border rounded text-xs font-bold text-emerald-900" />
                      )}

                      {interactiveType === 'true_false' && (
                        <div className="flex gap-4 text-xs font-bold items-center">
                          <span>الإجابة الصحيحة:</span>
                          <label><input type="radio" name="itf" checked={interactiveTf === 'صح'} onChange={() => setInteractiveTf('صح')} /> صح</label>
                          <label><input type="radio" name="itf" checked={interactiveTf === 'خطأ'} onChange={() => setInteractiveTf('خطأ')} /> خطأ</label>
                        </div>
                      )}

                      <button type="button" onClick={() => {
                        if (!interactiveQText) { alert('اكتب نص السؤال'); return; }
                        const qObj = {
                          type: interactiveType,
                          q: interactiveQText,
                          options: interactiveType === 'mcq' ? interactiveOptions : (interactiveType === 'true_false' ? ['صح', 'خطأ'] : []),
                          correct: interactiveType === 'mcq' ? interactiveCorrect : (interactiveType === 'fill' ? interactiveFill : interactiveTf)
                        };
                        setInteractiveList([...interactiveList, qObj]);
                        setInteractiveQText(''); setInteractiveCorrect(''); setInteractiveFill('');
                        alert('✅ تم إضافة السؤال للقائمة!');
                      }} className="px-3 py-1.5 bg-slate-900 text-white rounded text-xs font-bold cursor-pointer">
                        + إضافة السؤال للقائمة ({interactiveList.length} مضافة)
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border font-bold text-xs cursor-pointer">
                        <input type="checkbox" checked={newNoteVip} onChange={(e) => setNewNoteVip(e.target.checked)} className="w-4 h-4 text-amber-600 rounded" />
                        <span>شرح خاص بـ VIP؟</span>
                      </label>
                    </div>

                    <button onClick={async () => {
                      if (!newNoteTitle || !newNoteContent) return;
                      const newNoteObj = { 
                        id: Date.now().toString(), 
                        title: newNoteTitle, 
                        content: newNoteContent, 
                        image: newNoteImage, 
                        isVip: newNoteVip,
                        interactiveQuestions: interactiveList
                      };
                      const updatedNotes = [...(currentSub.notes || []), newNoteObj];
                      await updateDoc(doc(db, 'subjects', currentSub.id), { notes: updatedNotes });
                      setSubjects(subjects.map(s => s.id === currentSub.id ? {...s, notes: updatedNotes} : s));
                      setNewNoteTitle(''); setNewNoteContent(''); setNewNoteImage(''); setNewNoteVip(false); setInteractiveList([]);
                      setSuccessMessage('تم نشر الشرح والصورة والأسئلة بنجاح!');
                      setTimeout(() => setSuccessMessage(null), 3000);
                    }} className="w-full py-2.5 bg-amber-600 text-white rounded-xl text-xs font-bold shadow cursor-pointer">
                      نشر الشرح في المادة
                    </button>
                  </div>
                )}
              </div>

            </div>
          );
        })()}

        {/* 3. إدارة الطلبة */}
        {activeTab === 'students' && isAdmin && (
          <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-xl border space-y-4 w-full">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" /> إدارة الطلبة ودرجاتهم وتعديل بياناتهم
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse min-w-[750px]">
                <thead>
                  <tr className="bg-slate-50 border-b text-slate-700 text-xs font-black">
                    <th className="p-3">الطالب والمرحلة</th>
                    <th className="p-3">تاريخ التسجيل & آخر ظهور</th>
                    <th className="p-3">بيانات الدخول (تعديل الاسم، اليوزر، الباسورد)</th>
                    <th className="p-3">الدرجة & VIP</th>
                    <th className="p-3 text-center">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-xs font-bold text-slate-800">
                  {studentsList.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50">
                      <td className="p-3">
                        <div className="font-black text-slate-900">{st.name}</div>
                        <span className="text-indigo-600 text-[10px]">{st.stage}</span>
                      </td>

                      <td className="p-3 text-slate-600 space-y-1">
                        <div>📅 <span className="font-mono">{st.regDate || '2026-10-31'}</span></div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-emerald-600 font-mono text-[11px]">🕒 {st.lastSeen || 'الآن'}</span>
                          <button onClick={async () => {
                            await updateDoc(doc(db, 'students', st.id), { status: 'غير متصل' });
                            setStudentsList(studentsList.map(item => item.id === st.id ? {...item, status: 'غير متصل'} : item));
                            setSuccessMessage(`تم فك الارتباط بنجاح للطالب ${st.name}!`);
                            setTimeout(() => setSuccessMessage(null), 3000);
                          }} className="px-2 py-0.5 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded text-[10px] font-black cursor-pointer flex items-center gap-1" title="فك ارتباط الجهاز وإتاحة الدخول">
                            <UnlockIcon className="w-3 h-3" /> فك الارتباط 🔓
                          </button>
                        </div>
                      </td>

                      <td className="p-3">
                        {editingStudentId === st.id ? (
                          <div className="flex flex-col gap-1.5 bg-slate-50 p-2.5 rounded-xl border border-indigo-200">
                            <input type="text" value={editStudentName} onChange={(e) => setEditStudentName(e.target.value)} placeholder="الاسم..." className="px-2 py-1 rounded bg-white border text-xs font-bold" />
                            <input type="text" value={editStudentUser} onChange={(e) => setEditStudentUser(e.target.value)} placeholder="اليوزر..." className="px-2 py-1 rounded bg-white border text-xs font-bold font-mono" />
                            <input type="text" value={editStudentPass} onChange={(e) => setEditStudentPass(e.target.value)} placeholder="الباسورد..." className="px-2 py-1 rounded bg-white border text-xs font-bold font-mono" />
                            <select value={editStudentStage} onChange={(e) => setEditStudentStage(e.target.value)} className="px-2 py-1 rounded bg-white border text-xs font-bold">
                              {allStagesList.map(s => (
                                <option key={s.id} value={s.name}>{s.name}</option>
                              ))}
                            </select>
                            <div className="flex gap-2 pt-1">
                              <button onClick={async () => {
                                await updateDoc(doc(db, 'students', st.id), {
                                  name: editStudentName,
                                  username: editStudentUser,
                                  pass: editStudentPass,
                                  stage: editStudentStage
                                });
                                setStudentsList(studentsList.map(item => item.id === st.id ? {
                                  ...item,
                                  name: editStudentName,
                                  username: editStudentUser,
                                  pass: editStudentPass,
                                  stage: editStudentStage
                                } : item));
                                setEditingStudentId(null);
                                setSuccessMessage('تم تحديث بيانات الطالب بنجاح!');
                                setTimeout(() => setSuccessMessage(null), 3000);
                              }} className="px-3 py-1 bg-emerald-600 text-white rounded text-[11px] font-bold cursor-pointer">حفظ</button>
                              <button onClick={() => setEditingStudentId(null)} className="px-3 py-1 bg-slate-200 rounded text-[11px] cursor-pointer">إلغاء</button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border gap-2">
                            <div>
                              <div className="text-slate-900">👤 يوزر: <span className="font-mono text-indigo-700">{st.username}</span></div>
                              <div className="text-slate-600">🔑 باسورد: <span className="font-mono">{st.pass}</span></div>
                            </div>
                            <button onClick={() => {
                              setEditingStudentId(st.id);
                              setEditStudentName(st.name);
                              setEditStudentUser(st.username);
                              setEditStudentPass(st.pass);
                              setEditStudentStage(st.stage);
                            }} className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs cursor-pointer hover:bg-indigo-100" title="تعديل بيانات الطالب">
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>

                      <td className="p-3 space-y-1">
                        <div className="text-amber-600 font-black">{st.examScore}</div>
                        <button onClick={async () => {
                          const newVip = !st.isVip;
                          await updateDoc(doc(db, 'students', st.id), { isVip: newVip });
                          setStudentsList(studentsList.map(item => item.id === st.id ? {...item, isVip: newVip} : item));
                        }} className={`px-2 py-0.5 rounded text-[10px] font-black cursor-pointer ${st.isVip ? 'bg-amber-500 text-white' : 'bg-slate-200'}`}>
                          {st.isVip ? '⭐ VIP مفعّل' : 'عادي'}
                        </button>
                      </td>

                      <td className="p-3 text-center space-y-1">
                        {st.examDetails && (
                          <button onClick={() => setViewingStudentAnswers(st)} className="px-2 py-1 bg-indigo-600 text-white rounded text-[10px] font-bold cursor-pointer block mx-auto">
                            🔍 عرض الأخطاء
                          </button>
                        )}
                        <button onClick={async () => {
                          if (window.confirm('حذف هذا الطالب نهائياً؟')) {
                            await deleteDoc(doc(db, 'students', st.id));
                            setStudentsList(studentsList.filter(item => item.id !== st.id));
                          }
                        }} className="text-rose-500 p-1 block mx-auto cursor-pointer" title="حذف الطالب"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. إضافة المواد */}
        {activeTab === 'adminPanel' && isAdmin && (
          <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-xl border border-emerald-200 space-y-4 w-full">
            <h2 className="text-xl font-black text-slate-900">إضافة مادة دراسية جديدة</h2>
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
                videos: [], booklets: [], notes: [], quizzes: [], htmlQuizzes: []
              };
              const docRef = await addDoc(collection(db, 'subjects'), newObj);
              setSubjects([{ id: docRef.id, ...newObj }, ...subjects]);
              setNewSubName(''); setNewSubImage('');
              setSuccessMessage('تمت إضافة المادة بنجاح!');
              setTimeout(() => setSuccessMessage(null), 3000);
            }} className="space-y-3">
              <input type="text" required value={newSubName} onChange={(e) => setNewSubName(e.target.value)} placeholder="اسم المادة (مثال: الرياضيات)..." className="w-full px-3 py-2.5 border rounded-xl text-xs font-bold" />
              <select value={newSubStage} onChange={(e) => setNewSubStage(e.target.value)} className="w-full px-3 py-2.5 border rounded-xl text-xs font-bold">
                {allStagesList.map(st => (
                  <option key={st.id} value={st.name}>{st.name}</option>
                ))}
              </select>
              <input type="text" value={newSubImage} onChange={(e) => setNewSubImage(e.target.value)} placeholder="رابط صورة الغلاف (اختياري)..." className="w-full px-3 py-2.5 border rounded-xl text-xs font-mono" />
              <button type="submit" className="w-full bg-emerald-600 text-white font-bold py-3 rounded-xl text-xs shadow cursor-pointer">نشر المادة في المنصة</button>
            </form>
          </div>
        )}

        {/* 5. إعدادات VIP */}
        {activeTab === 'vipSettings' && isAdmin && (
          <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-xl border space-y-4 w-full">
            <h2 className="text-xl font-black text-slate-900">إعدادات أسعار وطرق دفع VIP</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              setSuccessMessage('تم حفظ إعدادات VIP بنجاح!');
              setTimeout(() => setSuccessMessage(null), 3000);
            }} className="space-y-3 max-w-lg">
              <input type="text" value={vipSettings.price} onChange={(e) => setVipSettings({...vipSettings, price: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-xs font-bold" placeholder="السعر" />
              <input type="text" value={vipSettings.mastercard} onChange={(e) => setVipSettings({...vipSettings, mastercard: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-xs font-mono" placeholder="الماستر كارد" />
              <button type="submit" className="w-full py-2.5 bg-amber-600 text-white rounded-xl text-xs font-bold cursor-pointer">حفظ التغييرات</button>
            </form>
          </div>
        )}

        {/* 6. إعدادات كلمة المرور الموحدة سحابياً */}
        {activeTab === 'settings' && isAdmin && (
          <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-xl border space-y-4 w-full">
            <h2 className="text-xl font-black text-slate-900">تغيير كلمة مرور المدير (موحدة لكل الأجهزة والمتصفحات)</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                await setDoc(doc(db, 'settings', 'admin_config'), {
                  password: adminPassword,
                  username: adminUsername,
                  name: adminName
                });
                setSuccessMessage('تم حفظ كلمة المرور سحابياً بنجاح، وستعمل في الموبايل والحاسبة فوراً!');
                setTimeout(() => setSuccessMessage(null), 4000);
              } catch(err) {
                alert('حدث خطأ أثناء الحفظ.');
              }
            }} className="space-y-3 max-w-lg">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">كلمة المرور الجديدة</label>
                <input type="text" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs font-mono font-bold" placeholder="كلمة المرور الجديدة" />
              </div>
              <button type="submit" className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer">حفظ وتوحيد كلمة المرور سحابياً ☁️</button>
            </form>
          </div>
        )}

      </main>

      {/* الفوتر */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto w-full px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-slate-500">
          <span>منصة النابغة التعليمية</span>
          <button onClick={() => setShowAdminLoginModal(true)} className="w-6 h-6 bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-400 rounded-full flex items-center justify-center transition-all text-xs cursor-pointer" title="دخول الأدمن">🔒</button>
        </div>
      </footer>
    </div>
  );
}

export default App;
