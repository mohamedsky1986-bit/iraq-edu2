import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { db } from './firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, serverTimestamp, setDoc, getDoc } from 'firebase/firestore';
import { 
  GraduationCap, ShieldCheck, MapPin, BookOpen, Video, FileText, 
  Award, ArrowRight, UserCheck, Users, ChevronDown, CheckCircle2, 
  Sparkles, PlusCircle, Trash2, Crown, Lock, Unlock, Settings, Play, Download, CheckSquare, Edit3, Image as ImageIcon, Eye, X, Key, User, Clock, CheckCircle, AlertCircle, FileText as NoteIcon, MessageCircle, CreditCard, Smartphone, ExternalLink, ArrowUp, ArrowDown, Flame, Send, MessageSquare, Globe, Search, RotateCcw, Unlock as UnlockIcon, Laptop
} from 'lucide-react';

const MY_TELEGRAM_LINK = 'https://t.me/YourUsername'; 

// مخزن محلي IndexedDB لحفظ المناهج كاملة على الجهاز للعمل دون إنترنت
const OFFLINE_DB_NAME = 'nabigha-offline-v1';
const OFFLINE_STORE_NAME = 'app-cache';
const openOfflineDB = (): Promise<IDBDatabase> => new Promise((resolve, reject) => {
  if (typeof indexedDB === 'undefined') return reject(new Error('IndexedDB غير متاح'));
  const request = indexedDB.open(OFFLINE_DB_NAME, 1);
  request.onupgradeneeded = () => {
    const database = request.result;
    if (!database.objectStoreNames.contains(OFFLINE_STORE_NAME)) database.createObjectStore(OFFLINE_STORE_NAME);
  };
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error || new Error('تعذر فتح التخزين المحلي'));
});
const saveSubjectsOffline = async (subjectsToSave: any[]) => {
  try {
    const database = await openOfflineDB();
    await new Promise<void>((resolve, reject) => {
      const tx = database.transaction(OFFLINE_STORE_NAME, 'readwrite');
      tx.objectStore(OFFLINE_STORE_NAME).put(subjectsToSave, 'subjects');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
    database.close();
  } catch (error) { console.warn('تعذر حفظ المناهج دون إنترنت:', error); }
};
const readSubjectsOffline = async (): Promise<any[]> => {
  try {
    const database = await openOfflineDB();
    const value = await new Promise<any>((resolve, reject) => {
      const request = database.transaction(OFFLINE_STORE_NAME, 'readonly').objectStore(OFFLINE_STORE_NAME).get('subjects');
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
    database.close();
    return Array.isArray(value) ? value : [];
  } catch (error) { return []; }
};

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
  const [isOnline, setIsOnline] = useState<boolean>(() => typeof navigator === 'undefined' ? true : navigator.onLine);

  // إظهار حالة الاتصال فوراً، دون التأثير على عمل المنصة أو بيانات Firebase
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // تهيئة PWA: ملف manifest ثابت + Service Worker
  useEffect(() => {
    let manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement | null;
    if (!manifestLink) {
      manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      document.head.appendChild(manifestLink);
    }
    manifestLink.href = '/manifest.webmanifest';

    let iconLink = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
    if (!iconLink) {
      iconLink = document.createElement('link');
      iconLink.rel = 'icon';
      document.head.appendChild(iconLink);
    }
    iconLink.href = '/icons/icon-192.png';

    // Service Worker يعمل على HTTPS أو localhost فقط
    if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
      navigator.serviceWorker.register('/sw.js').catch((err) => console.error('PWA service worker:', err));
    }
  }, []);

  const [isAdmin, setIsAdmin] = useState<boolean> (() => {
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
      whatsappPhone: '',
      telegram: MY_TELEGRAM_LINK
    });
  });

  // تبقى نسخة محلية للعرض السريع، مع تحميل الإعدادات المشتركة من Firestore حتى تظهر على كل الأجهزة.
  useEffect(() => {
    localStorage.setItem('nabough_vip_settings', JSON.stringify(vipSettings));
  }, [vipSettings]);

  useEffect(() => {
    const loadVipSettings = async () => {
      try {
        const snap = await getDoc(doc(db, 'settings', 'vip_config'));
        if (snap.exists()) setVipSettings((current: any) => ({ ...current, ...snap.data() }));
      } catch (error) {
        console.warn('تعذر تحميل إعدادات VIP المشتركة:', error);
      }
    };
    loadVipSettings();
  }, []);

  // إعلانات المنصة: قراءة مستقلة لا تغيّر سجلات المواد أو الطلبة.
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'announcements'), (snapshot) => {
      const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      items.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setAnnouncementItems(items);
    }, (error) => console.warn('تعذر تحميل الإعلانات:', error));
    return () => unsubscribe();
  }, []);

  const handleSaveAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim()) return;
    setAnnouncementSaving(true);
    try {
      await addDoc(collection(db, 'announcements'), { text: announcementText.trim(), stage: announcementStage, active: true, createdAt: serverTimestamp() });
      setAnnouncementText('');
      setSuccessMessage('تم نشر الإعلان بنجاح.');
    } catch (error) { alert('تعذر نشر الإعلان. تحقق من اتصال الإنترنت وصلاحيات Firestore.'); }
    finally { setAnnouncementSaving(false); }
  };

  const getWhatsAppUrl = (rawPhone: string, message: string) => {
    let phone = (rawPhone || '').replace(/\D/g, '');
    if (phone.startsWith('00')) phone = phone.slice(2);
    if (phone.startsWith('07')) phone = `964${phone.slice(1)}`;
    else if (phone.startsWith('7') && phone.length === 10) phone = `964${phone}`;
    return phone ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}` : '';
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

  // بحث وتصفية قائمة الطلبة في لوحة الإدارة فقط (بدون تعديل قاعدة البيانات)
  const [studentSearchText, setStudentSearchText] = useState('');
  const [studentStageFilter, setStudentStageFilter] = useState('all');

  // جلب البيانات مع دعم العمل بدون إنترنت
  useEffect(() => {
    let cancelled = false;
    async function loadDataOfflineFirst() {
      // اعرض آخر نسخة محفوظة فوراً، ثم حدّثها من Firebase إذا توفر الإنترنت
      const idbSubjects = await readSubjectsOffline();
      const localSubjects = safeGetStorage('nabough_cached_subjects', []);
      const firstCached = idbSubjects.length ? idbSubjects : localSubjects;
      if (!cancelled && firstCached.length) setSubjects(firstCached);
      try {
        const subsSnap = await getDocs(collection(db, 'subjects'));
        if (!subsSnap.empty) {
          const loadedSubs = subsSnap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => (Number.isFinite(a.displayOrder) ? a.displayOrder : 999999) - (Number.isFinite(b.displayOrder) ? b.displayOrder : 999999));
          if (!cancelled) setSubjects(loadedSubs);
          try { localStorage.setItem('nabough_cached_subjects', JSON.stringify(loadedSubs)); } catch (storageError) { console.warn('Local storage quota; IndexedDB remains available:', storageError); }
          await saveSubjectsOffline(loadedSubs);
        }
        const studsSnap = await getDocs(collection(db, 'students'));
        if (!studsSnap.empty) {
          const loadedStuds = studsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          if (!cancelled) setStudentsList(loadedStuds);
          try { localStorage.setItem('nabough_cached_students', JSON.stringify(loadedStuds)); } catch (storageError) { console.warn('Students cache quota:', storageError); }
        }
      } catch (e) {
        const cachedSubs = firstCached;
        const cachedStuds = safeGetStorage('nabough_cached_students', []);
        if (!cancelled && cachedSubs.length) setSubjects(cachedSubs);
        if (!cancelled && cachedStuds.length) setStudentsList(cachedStuds);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    loadDataOfflineFirst();
    const refreshWhenOnline = async () => {
      try {
        const fresh = await getDocs(collection(db, 'subjects'));
        if (!fresh.empty && !cancelled) {
          const latest = fresh.docs.map(d => ({ id: d.id, ...d.data() })).sort((a: any, b: any) => (Number.isFinite(a.displayOrder) ? a.displayOrder : 999999) - (Number.isFinite(b.displayOrder) ? b.displayOrder : 999999));
          setSubjects(latest);
          try { localStorage.setItem('nabough_cached_subjects', JSON.stringify(latest)); } catch (storageError) { console.warn('Local storage quota:', storageError); }
          await saveSubjectsOffline(latest);
        }
      } catch (error) { console.warn('تعذر تحديث المحتوى بعد عودة الإنترنت:', error); }
    };
    window.addEventListener('online', refreshWhenOnline);
    const safetyTimer = setTimeout(() => { if (!cancelled) setIsLoading(false); }, 1200);
    return () => { cancelled = true; clearTimeout(safetyTimer); window.removeEventListener('online', refreshWhenOnline); };
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

  const [activeTab, setActiveTab] = useState<'curriculum' | 'students' | 'adminPanel' | 'settings' | 'vipSettings' | 'communications'>('curriculum');
  const [selectedStage, setSelectedStage] = useState<string>('all'); 
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [activePdfUrl, setActivePdfUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfLoadFailed, setPdfLoadFailed] = useState(false);
  const [announcementItems, setAnnouncementItems] = useState<any[]>([]);
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementStage, setAnnouncementStage] = useState('all');
  const [announcementSaving, setAnnouncementSaving] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<any | null>(null);

  // إدارة ملفات الاختبارات التفاعلية HTML داخل صفحة المادة
  const [htmlQuizTitle, setHtmlQuizTitle] = useState('');
  const [htmlQuizContent, setHtmlQuizContent] = useState('');
  const [htmlQuizVip, setHtmlQuizVip] = useState(false);
  const [htmlQuizFileName, setHtmlQuizFileName] = useState('');
  const [htmlQuizSaving, setHtmlQuizSaving] = useState(false);

  // حالات تعديل الامتحان المتقدمة (تعديل عنوان، تعديل أسئلة، وإضافة أسئلة جديدة ضمن نافذة التعديل)
  const [editingQuizItem, setEditingQuizItem] = useState<{subjectId: string, quiz: any} | null>(null);
  const [editQuizTitle, setEditQuizTitle] = useState('');
  const [editQuizDuration, setEditQuizDuration] = useState(15);
  const [editQuizQuestions, setEditQuizQuestions] = useState<any[]>([]);
  // حقول إضافة سؤال جديد داخل نافذة تعديل الامتحان
  const [editNewQText, setEditNewQText] = useState('');
  const [editNewQCorrect, setEditNewQCorrect] = useState('');

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
  const [editInteractiveCorrect, setEditInteractiveCorrect] = useState('');
  const [editInteractiveOptions, setEditInteractiveOptions] = useState<string[]>(['', '', '', '']);

  const getEmbedPdfUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('drive.google.com')) {
      return `https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`;
    }
    return url;
  };

  useEffect(() => {
    if (!activePdfUrl || !pdfLoading) return;
    const timer = window.setTimeout(() => { setPdfLoading(false); setPdfLoadFailed(true); }, 45000);
    return () => window.clearTimeout(timer);
  }, [activePdfUrl, pdfLoading]);

  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizResult, setQuizResult] = useState<{score: number, total: number, details: any[]} | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(900);
  const [timerActive, setTimerActive] = useState<boolean>(false);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [editSubName, setEditSubName] = useState('');
  const [editSubImage, setEditSubImage] = useState('');

  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
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

  // دالة التصحيح المرن والذكي للغة العربية
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
      localStorage.setItem('nabough_cached_subjects', JSON.stringify(updatedSubs)); void saveSubjectsOffline(updatedSubs);
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

  // حفظ ملف HTML ضمن سجل الامتحانات للمادة نفسها دون تغيير بقية بياناتها.
  const handleSaveHtmlQuiz = async (subjectId: string) => {
    if (!htmlQuizTitle.trim() || !htmlQuizContent.trim()) {
      alert('اكتب عنوان الامتحان واختر ملف HTML أولاً.');
      return;
    }
    const htmlBytes = new Blob([htmlQuizContent]).size;
    if (htmlBytes > 500 * 1024) {
      alert('حجم ملف HTML كبير. قلّل حجمه إلى أقل من 500 كيلوبايت ثم أعد المحاولة.');
      return;
    }
    const targetSub = subjects.find((item: any) => item.id === subjectId);
    if (!targetSub) return;
    const newHtmlQuiz = {
      id: `html_${Date.now()}`,
      title: htmlQuizTitle.trim(),
      type: 'html',
      htmlContent: htmlQuizContent,
      fileName: htmlQuizFileName || 'quiz.html',
      isVip: htmlQuizVip,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    const updatedQuizzes = [...(targetSub.quizzes || []), newHtmlQuiz];
    setHtmlQuizSaving(true);
    try {
      await updateDoc(doc(db, 'subjects', subjectId), { quizzes: updatedQuizzes });
      const updatedSubs = subjects.map((sub: any) => sub.id === subjectId ? { ...sub, quizzes: updatedQuizzes } : sub);
      setSubjects(updatedSubs);
      localStorage.setItem('nabough_cached_subjects', JSON.stringify(updatedSubs)); void saveSubjectsOffline(updatedSubs);
      setHtmlQuizTitle('');
      setHtmlQuizContent('');
      setHtmlQuizFileName('');
      setHtmlQuizVip(false);
      setSuccessMessage('تم رفع ونشر ملف HTML داخل المادة بنجاح!');
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (error) {
      alert('تعذر حفظ ملف HTML. تحقق من الاتصال وحجم بيانات المادة في Firestore.');
    } finally {
      setHtmlQuizSaving(false);
    }
  };

  const handleUpdateHtmlQuiz = async (subjectId: string, quizId: string, changes: any) => {
    const targetSub = subjects.find((item: any) => item.id === subjectId);
    if (!targetSub) return;
    const updatedQuizzes = (targetSub.quizzes || []).map((q: any) => q.id === quizId ? { ...q, ...changes } : q);
    try {
      await updateDoc(doc(db, 'subjects', subjectId), { quizzes: updatedQuizzes });
      const updatedSubs = subjects.map((sub: any) => sub.id === subjectId ? { ...sub, quizzes: updatedQuizzes } : sub);
      setSubjects(updatedSubs);
      localStorage.setItem('nabough_cached_subjects', JSON.stringify(updatedSubs)); void saveSubjectsOffline(updatedSubs);
      setSuccessMessage('تم تحديث الاختبار بنجاح.');
      setTimeout(() => setSuccessMessage(null), 2500);
    } catch (error) {
      alert('تعذر تحديث الاختبار. تحقق من الاتصال.');
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

  const handleMoveItem = async (subjectId: string, listKey: 'notes' | 'videos' | 'booklets' | 'quizzes', index: number, direction: 'up' | 'down') => {
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
      localStorage.setItem('nabough_cached_subjects', JSON.stringify(updatedSubs)); void saveSubjectsOffline(updatedSubs);
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

    const orderedList = list.map((sub, orderIndex) => ({ ...sub, displayOrder: orderIndex }));
    try {
      await Promise.all(orderedList.map(sub => updateDoc(doc(db, 'subjects', sub.id), { displayOrder: sub.displayOrder })));
      setSubjects(orderedList);
      localStorage.setItem('nabough_cached_subjects', JSON.stringify(orderedList)); void saveSubjectsOffline(orderedList);
    } catch (e) {
      alert('ما تم حفظ ترتيب المواد. تأكد من الاتصال بالإنترنت ثم حاول مرة ثانية.');
    }
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
      {!isOnline && (
        <div role="status" className="sticky top-0 z-[60] w-full bg-amber-100 text-amber-900 border-b border-amber-300 px-3 py-2 text-center text-xs sm:text-sm font-bold">
          <span className="inline-flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
            لا يوجد اتصال بالإنترنت — تعرض المنصة المحتوى المحفوظ على هذا الجهاز، وقد لا تعمل الفيديوهات والدردشة والخدمات المباشرة.
          </span>
        </div>
      )}

      {/* نافذة تعديل الامتحان للأدمن (مع دعم تعديل السؤال، وتعديل النص والإجابة، وإضافة أسئلة جديدة) */}
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
                      <span className="text-xs font-bold text-slate-900">س{eqIdx+1}:</span>
                      <button onClick={() => {
                        setEditQuizQuestions(editQuizQuestions.filter((_, i) => i !== eqIdx));
                      }} className="text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg text-xs flex items-center gap-1 font-bold">
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
                    <input 
                      type="text" 
                      value={eq.correct} 
                      onChange={(e) => {
                        const newQ = [...editQuizQuestions];
                        newQ[eqIdx].correct = e.target.value;
                        setEditQuizQuestions(newQ);
                      }} 
                      placeholder="الإجابة الصحيحة..." 
                      className="w-full px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-bold text-emerald-900" 
                    />
                  </div>
                ))}
              </div>

              {/* إضافة سؤال جديد داخل نافذة التعديل */}
              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-200 space-y-2">
                <h5 className="text-xs font-black text-indigo-900">➕ إضافة سؤال جديد لهذا الامتحان أثناء التعديل:</h5>
                <input 
                  type="text" 
                  value={editNewQText} 
                  onChange={(e) => setEditNewQText(e.target.value)} 
                  placeholder="نص السؤال الجديد..." 
                  className="w-full px-3 py-1.5 bg-white border rounded-lg text-xs font-bold" 
                />
                <input 
                  type="text" 
                  value={editNewQCorrect} 
                  onChange={(e) => setEditNewQCorrect(e.target.value)} 
                  placeholder="الإجابة الصحيحة للسؤال الجديد..." 
                  className="w-full px-3 py-1.5 bg-white border rounded-lg text-xs font-bold text-emerald-900" 
                />
                <button type="button" onClick={() => {
                  if (!editNewQText || !editNewQCorrect) {
                    alert('يرجى كتابة نص السؤال والإجابة الصحيحة.');
                    return;
                  }
                  setEditQuizQuestions([...editQuizQuestions, { type: 'fill', q: editNewQText, correct: editNewQCorrect, isMinisterial: false }]);
                  setEditNewQText('');
                  setEditNewQCorrect('');
                  alert('✅ تم إضافة السؤال الجديد للقائمة مؤقتاً، اضغط حفظ التعديلات نهائياً للاتمام.');
                }} className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold cursor-pointer">
                  + إرفاق هذا السؤال للامتحان
                </button>
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
                  localStorage.setItem('nabough_cached_subjects', JSON.stringify(updatedSubs)); void saveSubjectsOffline(updatedSubs);
                  setEditingQuizItem(null);
                  setSuccessMessage('تم تحديث الامتحان وتعديل الأسئلة بنجاح!');
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

      {editingNoteId && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 shadow-2xl relative space-y-3 text-right">
            <button onClick={() => setEditingNoteId(null)} className="absolute top-3 left-3 w-8 h-8 bg-slate-100 rounded-full">✕</button>
            <h3 className="text-lg font-black border-b pb-2">تعديل الشرح أو التعليل</h3>
            <label className="block text-xs font-bold">عنوان الشرح</label><input value={editNoteTitle} onChange={e => setEditNoteTitle(e.target.value)} className="w-full border rounded-xl p-2 text-sm" />
            <label className="block text-xs font-bold">نص الشرح</label><textarea value={editNoteContent} onChange={e => setEditNoteContent(e.target.value)} className="w-full border rounded-xl p-2 text-sm min-h-28" />
            <label className="block text-xs font-bold">رابط الصورة (اختياري)</label><input value={editNoteImage} onChange={e => setEditNoteImage(e.target.value)} className="w-full border rounded-xl p-2 text-sm" />
            <label className="flex items-center gap-2 text-xs font-bold"><input type="checkbox" checked={editNoteVip} onChange={e => setEditNoteVip(e.target.checked)} /> شرح خاص بـ VIP</label>
            <div className="flex gap-2 pt-2"><button onClick={async () => { const subjectId = selectedSubjectId; if (!subjectId) { alert('لم يتم تحديد المادة. أغلق النافذة وافتح التعديل من داخل المادة مرة أخرى.'); return; } try { const subjectRef = doc(db, 'subjects', subjectId); const freshSnap = await getDoc(subjectRef); if (!freshSnap.exists()) { alert('لم نعثر على المادة في قاعدة البيانات.'); return; } const freshSubject = freshSnap.data() as any; const freshNotes = Array.isArray(freshSubject.notes) ? freshSubject.notes : []; if (!freshNotes.some((n: any) => n.id === editingNoteId)) { alert('لم نعثر على الشرح المطلوب. حدّث الصفحة وافتح التعديل من جديد.'); return; } const updatedNotes = freshNotes.map((n: any) => n.id === editingNoteId ? { ...n, title: editNoteTitle, content: editNoteContent, image: editNoteImage, isVip: editNoteVip } : n); await updateDoc(subjectRef, { notes: updatedNotes }); const updatedSubs = subjects.map(s => s.id === subjectId ? { ...s, notes: updatedNotes } : s); setSubjects(updatedSubs); localStorage.setItem('nabough_cached_subjects', JSON.stringify(updatedSubs)); void saveSubjectsOffline(updatedSubs); setEditingNoteId(null); setSuccessMessage('تم حفظ تعديل الشرح في قاعدة البيانات بنجاح'); setTimeout(() => setSuccessMessage(null), 3000); } catch (e: any) { console.error('Note update failed:', e); alert('فشل حفظ التعديل: ' + (e?.code || e?.message || 'خطأ غير معروف')); } }} className="flex-1 bg-emerald-600 text-white rounded-xl py-2 font-bold text-sm">حفظ التعديل</button><button onClick={() => setEditingNoteId(null)} className="flex-1 bg-slate-200 rounded-xl py-2 font-bold text-sm">إلغاء</button></div>
          </div>
        </div>
      )}

      {/* نافذة تعديل السؤال التفاعلي التابع للشرح */}
      {editingInteractiveItem && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4 text-right">
            <button onClick={() => setEditingInteractiveItem(null)} className="absolute top-4 left-4 w-9 h-9 bg-slate-100 hover:bg-rose-50 text-slate-600 rounded-full flex items-center justify-center font-bold">
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-black text-slate-900 pb-2 border-b">تعديل السؤال التفاعلي السريع</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">نص السؤال</label>
                <input type="text" value={editInteractiveQText} onChange={(e) => setEditInteractiveQText(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs font-bold" />
              </div>
              {(editingInteractiveItem.questionObj?.type === 'mcq' || editingInteractiveItem.questionObj?.type === 'true_false') && <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">الاختيارات (تگدر تعدل كل اختيار)</label>
                {editInteractiveOptions.map((opt, idx) => <input key={idx} type="text" value={opt} onChange={(e) => setEditInteractiveOptions(prev => prev.map((v, i) => i === idx ? e.target.value : v))} placeholder={`الخيار ${idx + 1}`} className="w-full px-3 py-2 border rounded-xl text-xs font-bold" />)}
              </div>}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الإجابة الصحيحة</label>
                <input type="text" value={editInteractiveCorrect} onChange={(e) => setEditInteractiveCorrect(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs font-bold text-emerald-900 bg-emerald-50" />
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t">
              <button onClick={async () => {
                const targetSub = subjects.find(s => s.id === editingInteractiveItem.subjectId);
                if (!targetSub) return;
                const updatedNotes = targetSub.notes.map((n: any) => {
                  if (n.id === editingInteractiveItem.noteId) {
                    const newIqList = [...n.interactiveQuestions];
                    newIqList[editingInteractiveItem.questionIndex] = {
                      ...newIqList[editingInteractiveItem.questionIndex],
                      q: editInteractiveQText,
                      correct: editInteractiveCorrect,
                      ...((editingInteractiveItem.questionObj?.type === 'mcq' || editingInteractiveItem.questionObj?.type === 'true_false') ? { options: editInteractiveOptions } : {})
                    };
                    return { ...n, interactiveQuestions: newIqList };
                  }
                  return n;
                });

                try {
                  await updateDoc(doc(db, 'subjects', editingInteractiveItem.subjectId), { notes: updatedNotes });
                  const updatedSubs = subjects.map(s => s.id === editingInteractiveItem.subjectId ? {...s, notes: updatedNotes} : s);
                  setSubjects(updatedSubs);
                  localStorage.setItem('nabough_cached_subjects', JSON.stringify(updatedSubs)); void saveSubjectsOffline(updatedSubs);
                  setEditingInteractiveItem(null);
                  setSuccessMessage('تم تعديل السؤال التفاعلي بنجاح!');
                  setTimeout(() => setSuccessMessage(null), 3000);
                } catch(e) {}
              }} className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold">
                حفظ التعديل
              </button>
              <button onClick={() => setEditingInteractiveItem(null)} className="flex-1 py-2.5 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة تعديل الفيديو للأدمن */}
      {editingVideoItem && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4 text-right">
            <button onClick={() => setEditingVideoItem(null)} className="absolute top-4 left-4 w-9 h-9 bg-slate-100 hover:bg-rose-50 text-slate-600 rounded-full flex items-center justify-center font-bold">
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-black text-slate-900 pb-2 border-b">تعديل الدرس المرئي (الفيديو)</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">عنوان الفيديو</label>
                <input type="text" value={editVideoTitle} onChange={(e) => setEditVideoTitle(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs font-bold" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رابط يوتيوب</label>
                <input type="text" value={editVideoUrl} onChange={(e) => setEditVideoUrl(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs font-mono font-bold" />
              </div>
              <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                <input type="checkbox" checked={editVideoVip} onChange={(e) => setEditVideoVip(e.target.checked)} className="w-4 h-4 text-amber-600" />
                <span>فيديو خاص بـ VIP؟</span>
              </label>
            </div>

            <div className="flex gap-2 pt-3 border-t">
              <button onClick={async () => {
                const targetSub = subjects.find(s => s.id === editingVideoItem.subjectId);
                if (!targetSub) return;
                const formattedUrl = formatYouTubeUrl(editVideoUrl);
                const updatedVideos = targetSub.videos.map((v: any) => v.id === editingVideoItem.video.id ? { ...v, title: editVideoTitle, url: formattedUrl, isVip: editVideoVip } : v);
                
                try {
                  await updateDoc(doc(db, 'subjects', editingVideoItem.subjectId), { videos: updatedVideos });
                  const updatedSubs = subjects.map(s => s.id === editingVideoItem.subjectId ? {...s, videos: updatedVideos} : s);
                  setSubjects(updatedSubs);
                  localStorage.setItem('nabough_cached_subjects', JSON.stringify(updatedSubs)); void saveSubjectsOffline(updatedSubs);
                  setEditingVideoItem(null);
                  setSuccessMessage('تم تعديل الفيديو بنجاح!');
                  setTimeout(() => setSuccessMessage(null), 3000);
                } catch(e) {}
              }} className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold">
                حفظ التعديل
              </button>
              <button onClick={() => setEditingVideoItem(null)} className="flex-1 py-2.5 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة تعديل الملزمة PDF للأدمن */}
      {editingBookletItem && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4 text-right">
            <button onClick={() => setEditingBookletItem(null)} className="absolute top-4 left-4 w-9 h-9 bg-slate-100 hover:bg-rose-50 text-slate-600 rounded-full flex items-center justify-center font-bold">
              <X className="w-4 h-4" />
            </button>
            <h3 className="text-lg font-black text-slate-900 pb-2 border-b">تعديل الملزمة (PDF)</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">عنوان الملزمة</label>
                <input type="text" value={editBookletTitle} onChange={(e) => setEditBookletTitle(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs font-bold" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رابط ملف PDF</label>
                <input type="text" value={editBookletUrl} onChange={(e) => setEditBookletUrl(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs font-mono font-bold" />
              </div>
              <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                <input type="checkbox" checked={editBookletVip} onChange={(e) => setEditBookletVip(e.target.checked)} className="w-4 h-4 text-amber-600" />
                <span>ملزمة خاصة بـ VIP؟</span>
              </label>
            </div>

            <div className="flex gap-2 pt-3 border-t">
              <button onClick={async () => {
                const targetSub = subjects.find(s => s.id === editingBookletItem.subjectId);
                if (!targetSub) return;
                const updatedBooklets = targetSub.booklets.map((b: any) => b.id === editingBookletItem.booklet.id ? { ...b, title: editBookletTitle, url: editBookletUrl, isVip: editBookletVip } : b);
                
                try {
                  await updateDoc(doc(db, 'subjects', editingBookletItem.subjectId), { booklets: updatedBooklets });
                  const updatedSubs = subjects.map(s => s.id === editingBookletItem.subjectId ? {...s, booklets: updatedBooklets} : s);
                  setSubjects(updatedSubs);
                  localStorage.setItem('nabough_cached_subjects', JSON.stringify(updatedSubs)); void saveSubjectsOffline(updatedSubs);
                  setEditingBookletItem(null);
                  setSuccessMessage('تم تعديل الملزمة بنجاح!');
                  setTimeout(() => setSuccessMessage(null), 3000);
                } catch(e) {}
              }} className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold">
                حفظ التعديل
              </button>
              <button onClick={() => setEditingBookletItem(null)} className="flex-1 py-2.5 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نافذة الدردشة العامة */}
      {showPublicChatModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full h-[85vh] p-4 sm:p-6 shadow-2xl relative flex flex-col text-right">
            <button onClick={() => setShowPublicChatModal(false)} className="absolute top-4 left-4 w-9 h-9 bg-slate-100 hover:bg-rose-50 text-slate-600 rounded-full flex items-center justify-center font-bold">
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-3 pb-4 border-b">
              <div className="w-11 h-11 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg">🌐</div>
              <div>
                <h3 className="font-black text-slate-900 text-base">الدردشة العامة للطلبة (سؤال وجواب ونقاشات)</h3>
                <p className="text-xs text-slate-500">الرسائل تظهر فوراً لجميع الطلبة على الموبايل والحاسبة</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 my-3 bg-slate-50 rounded-2xl border">
              {publicChatMessages.map((msg) => (
                <div key={msg.id} className="p-3.5 bg-white rounded-2xl border border-slate-200/80 shadow-sm relative group space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-indigo-700 border-b pb-1">
                    <span>👤 {msg.sender}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-mono text-[10px]">{msg.time}</span>
                      {isAdmin && (
                        <button 
                          onClick={async () => {
                            if (window.confirm('هل تريد حذف هذه الرسالة؟')) {
                              try {
                                await deleteDoc(doc(db, 'public_chat', msg.id));
                              } catch(e) {}
                            }
                          }}
                          className="text-rose-500 hover:bg-rose-50 p-1 rounded font-bold"
                          title="حذف رسالة مخالفة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs font-bold text-slate-800 leading-relaxed pt-1">{msg.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendPublicMessage} className="flex gap-2 pt-2 border-t">
              <input 
                type="text" 
                value={publicChatInput} 
                onChange={(e) => setPublicChatInput(e.target.value)} 
                placeholder="اكتب سؤالك أو استفسارك لزملائك هنا..." 
                className="flex-1 px-4 py-3 rounded-xl border text-xs font-bold bg-white" 
                autoFocus
              />
              <button type="submit" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow flex items-center gap-1">
                <Send className="w-3.5 h-3.5" /> إرسال
              </button>
            </form>
          </div>
        </div>
      )}

      {/* نافذة إرشادات التثبيت الداخلية الأنيقة */}
      {showInstallGuideModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-4 text-right">
            <button onClick={() => setShowInstallGuideModal(false)} className="absolute top-4 left-4 w-8 h-8 bg-slate-100 hover:bg-rose-50 text-slate-600 rounded-full flex items-center justify-center font-bold">
              <X className="w-4 h-4" />
            </button>
            <div className="text-center space-y-1">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto text-xl font-black">📱</div>
              <h3 className="text-lg font-black text-slate-900">تثبيت منصة النابغة على هاتفك</h3>
              <p className="text-xs text-slate-500">اختر متصفحك لتثبيت التطبيق بسهولة:</p>
            </div>
            
            <div className="space-y-3 text-xs font-bold text-slate-700 bg-slate-50 p-4 rounded-2xl border">
              <div>🤖 <b>أندرويد (متصفح كروم):</b> افتح قائمة المتصفح (⋮) بالأعلى، ثم اختر <b>"تثبيت التطبيق"</b> أو <b>"إضافة إلى الشاشة الرئيسية"</b>.</div>
              <div className="border-t pt-2">🍏 <b>آيفون (متصفح سفاري):</b> اضغط على زر المشاركة (📤) بالأسفل، ثم اختر <b>"إضافة إلى الشاشة الرئيسية"</b>.</div>
            </div>

            <button onClick={() => setShowInstallGuideModal(false)} className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-md">
              حسناً، فهمت 🌟
            </button>
          </div>
        </div>
      )}

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
            <form onSubmit={async (e) => {
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
                    <div className="font-bold text-sm flex items-center gap-2">
                      <span>س{dIdx+1}: {det.q}</span>
                      {det.isMinisterial && <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded font-black">🔥 وزاري مهم</span>}
                    </div>
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

                const nowFormatted = new Date().toLocaleDateString('ar-IQ', {month: 'numeric', day: 'numeric'}) + ' | ' + new Date().toLocaleTimeString('ar-IQ', {hour: '2-digit', minute:'2-digit'});
                const regDateFormatted = new Date().toLocaleDateString('ar-IQ', {year: 'numeric', month: '2-digit', day: '2-digit'});
                const device = getDeviceType();
                const newSt = {
                  name: newStudentName,
                  username: studentLoginUser,
                  pass: studentLoginPass,
                  stage: newStudentStage,
                  isVip: false,
                  status: 'متصل الآن',
                  lastSeen: nowFormatted,
                  regDate: regDateFormatted,
                  deviceType: device,
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
                  const nowFormatted = new Date().toLocaleDateString('ar-IQ', {month: 'numeric', day: 'numeric'}) + ' | ' + new Date().toLocaleTimeString('ar-IQ', {hour: '2-digit', minute:'2-digit'});
                  const device = getDeviceType();

                  try {
                    await updateDoc(doc(db, 'students', found.id), { 
                      status: 'متصل الآن', 
                      lastSeen: nowFormatted,
                      deviceType: device
                    });
                  } catch(err) {}

                  found.status = 'متصل الآن';
                  found.lastSeen = nowFormatted;
                  found.deviceType = device;
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

            {(() => {
              const studentMessage = `السلام عليكم، أريد تفعيل اشتراك VIP في منصة النابغة التعليمية.%0Aاسم الطالب: ${loggedStudent?.name || 'غير محدد'}%0Aاسم المستخدم: ${loggedStudent?.username || 'غير محدد'}%0Aالمرحلة: ${loggedStudent?.stage || 'غير محددة'}%0Aالمحتوى المطلوب: ${vipModalItem?.title || 'اشتراك VIP'}%0Aالسعر: ${vipSettings.price}%0Aسأرسل صورة إيصال الدفع هنا، يرجى تفعيل الاشتراك بعد التحقق.`;
              const whatsappUrl = getWhatsAppUrl(vipSettings.whatsappPhone, decodeURIComponent(studentMessage));
              return whatsappUrl ? (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setVipModalItem(null)}
                  className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-black rounded-2xl shadow-lg flex items-center justify-center gap-2 text-sm text-center"
                >
                  <MessageCircle className="w-5 h-5" /> مراسلة الإدارة عبر واتساب وإرسال الإيصال
                </a>
              ) : (
                <div className="w-full p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-bold text-center">
                  لم يُضف رقم واتساب الإدارة بعد. يرجى التواصل مع إدارة المنصة.
                </div>
              );
            })()}
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
          <div className="bg-white rounded-3xl max-w-4xl w-full h-[85vh] p-4 shadow-2xl relative flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b gap-3 flex-wrap">
              <h3 className="font-black text-base text-slate-900">قارئ الملزمة والملخصات (PDF)</h3>
              <div className="flex items-center gap-2">
                <a 
                  href={activePdfUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> فتح / تحميل خارجي 📥
                </a>
                <button onClick={() => { setActivePdfUrl(null); setPdfLoading(false); setPdfLoadFailed(false); }} className="w-9 h-9 bg-rose-600 text-white rounded-full flex items-center justify-center font-bold">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 w-full rounded-2xl overflow-hidden bg-slate-100 mt-3 relative">
              {pdfLoading && !pdfLoadFailed && <div className="absolute inset-0 z-10 bg-white/95 flex flex-col items-center justify-center gap-3 text-center p-5"><div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-700 to-violet-500 text-white flex items-center justify-center text-3xl font-black shadow-lg animate-pulse">ن</div><p className="font-black text-slate-800">يرجى الانتظار، جارٍ تحميل الكتاب</p><p className="text-xs text-slate-500">قد يستغرق فتح الملف بعض الوقت حسب حجمه وسرعة الإنترنت.</p><div className="w-40 h-1.5 rounded-full bg-slate-200 overflow-hidden"><div className="h-full w-1/2 bg-indigo-600 animate-pulse rounded-full" /></div></div>}
              {pdfLoadFailed && <div className="absolute inset-0 z-10 bg-white flex flex-col items-center justify-center gap-3 text-center p-5"><p className="font-bold text-rose-700">تعذر عرض الكتاب داخل المنصة.</p><p className="text-xs text-slate-500">جرّب إعادة التحميل أو افتحه خارج المنصة.</p><button onClick={() => { setPdfLoadFailed(false); setPdfLoading(true); }} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold">إعادة المحاولة</button></div>}
              <iframe key={activePdfUrl} src={getEmbedPdfUrl(activePdfUrl)} onLoad={() => { setPdfLoading(false); setPdfLoadFailed(false); }} onError={() => { setPdfLoading(false); setPdfLoadFailed(true); }} className="w-full h-full border-0" title="عارض ملف PDF"></iframe>
            </div>
          </div>
        </div>
      )}

      {/* نافذة الامتحان */}
      {activeQuiz && !activeQuiz.htmlContent && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 shadow-2xl relative space-y-6">
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
                      <div className="font-bold text-sm flex items-center gap-2">
                        <span>س{dIdx+1}: {det.q}</span>
                        {det.isMinisterial && <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded font-black">🔥 وزاري مهم</span>}
                      </div>
                      <div className="text-xs mt-1">إجابتك: <b>{det.userAns || 'بدون إجابة'}</b> (درجة السؤال: {det.partialScore}/100) {det.isCorrect ? '✅ صحيحة' : '❌ نقطة ضعف'}</div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  {quizResult.details.some(d => !d.isCorrect) && (
                    <button onClick={handleRetryIncorrectQuestions} className="flex-1 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl shadow-md flex items-center justify-center gap-2 text-xs cursor-pointer">
                      <RotateCcw className="w-4 h-4" /> إعادة امتحان الأخطاء فقط (امتحان ذكي 🔄)
                    </button>
                  )}
                  <button onClick={() => { setActiveQuiz(null); setQuizResult(null); setQuizAnswers({}); setTimerActive(false); }} className="flex-1 py-3.5 bg-slate-900 text-white font-bold rounded-xl text-xs">
                    إغلاق ورقة الامتحان
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {activeQuiz.questions?.map((q: any, qIdx: number) => (
                  <div key={qIdx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="font-black text-slate-900 text-sm flex items-center gap-2 flex-wrap">
                      <span>السؤال {qIdx+1}: {q.q}</span>
                      {q.isMinisterial && <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded font-black">🔥 وزاري مهم</span>}
                    </div>
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

      {/* عارض ملفات HTML داخل المنصة */}
      {activeQuiz?.htmlContent && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-[60] flex items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-2xl w-full max-w-6xl h-[94vh] p-2 sm:p-3 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between gap-2 px-2 pb-2 border-b">
              <h3 className="font-black text-sm sm:text-base text-slate-900">{activeQuiz.title}</h3>
              <button onClick={() => setActiveQuiz(null)} className="px-3 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold">إغلاق الاختبار ✕</button>
            </div>
            <iframe title={activeQuiz.title} srcDoc={activeQuiz.htmlContent} sandbox="allow-scripts allow-forms allow-modals" className="w-full flex-1 border-0 rounded-xl mt-2 bg-white" />
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
              <button onClick={() => { setActiveTab('communications'); setSelectedSubjectId(null); }} className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 whitespace-nowrap ${activeTab === 'communications' ? 'bg-sky-600 text-white' : 'bg-sky-50 text-sky-700'}`}>
                <MessageSquare className="w-3.5 h-3.5" /> الإعلانات والتواصل
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

            {!isAdmin && loggedStudent && (
              <div>
                {!isChangingStage ? (
                  <button onClick={() => setIsChangingStage(true)} className="px-3 py-1 bg-indigo-800/70 hover:bg-indigo-700 text-indigo-200 rounded-lg text-xs font-bold border border-indigo-500/30 cursor-pointer">
                    🔄 تغيير المرحلة الدراسية
                  </button>
                ) : (
                  <div className="flex items-center gap-2 bg-indigo-950 border border-indigo-500/50 p-2 rounded-xl max-w-xs">
                    <select 
                      value={loggedStudent.stage}
                      onChange={async (e) => {
                        const newStage = e.target.value;
                        const updatedSt = { ...loggedStudent, stage: newStage };
                        setLoggedStudent(updatedSt);
                        localStorage.setItem('nabough_logged_student', JSON.stringify(updatedSt));
                        try {
                          await updateDoc(doc(db, 'students', loggedStudent.id), { stage: newStage });
                          setStudentsList(studentsList.map(s => s.id === loggedStudent.id ? {...s, stage: newStage} : s));
                          setSelectedSubjectId(null);
                          setIsChangingStage(false);
                          setSuccessMessage(`تم تحديث مرحلتك إلى: ${newStage}`);
                          setTimeout(() => setSuccessMessage(null), 3000);
                        } catch(err) {}
                      }}
                      className="w-full bg-white text-slate-900 text-xs font-black rounded-lg px-2 py-1 cursor-pointer"
                    >
                      {allStagesList.map(st => (
                        <option key={st.id} value={st.name}>{st.name}</option>
                      ))}
                    </select>
                    <button onClick={() => setIsChangingStage(false)} className="px-2 py-1 bg-rose-600 text-white rounded-lg text-xs">✕</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* الإعلانات الموجهة لجميع الطلبة أو لمرحلتهم */}
        {!isAdmin && announcementItems.filter((a: any) => a.active !== false && (a.stage === 'all' || (loggedStudent && a.stage === loggedStudent.stage))).map((a: any) => (
          <div key={a.id} className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-right shadow-sm"><div className="flex items-start gap-2"><span className="text-lg">📢</span><p className="text-sm font-bold text-amber-900 leading-relaxed">{a.text}</p></div></div>
        ))}
        {!isAdmin && vipSettings.telegram && vipSettings.telegram !== 'https://t.me/YourUsername' && (
          <div className="flex justify-center"><a href={vipSettings.telegram} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white px-4 py-2.5 text-xs font-black shadow"><Send className="w-4 h-4" /> انضم إلى قناة التليجرام</a></div>
        )}

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
              {filteredSubjects.map((sub, sIdx) => (
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

                  {editingSubjectId === sub.id && (
                    <div onClick={(e) => e.stopPropagation()} className="absolute inset-0 bg-white/95 backdrop-blur-md z-30 p-4 flex flex-col justify-center space-y-2 text-right">
                      <input type="text" value={editSubName} onChange={(e) => setEditSubName(e.target.value)} className="px-2 py-1 border rounded text-xs font-bold" />
                      <input type="text" value={editSubImage} onChange={(e) => setEditSubImage(e.target.value)} className="px-2 py-1 border rounded text-xs font-mono" />
                      <div className="flex gap-2">
                        <button onClick={async () => {
                          await updateDoc(doc(db, 'subjects', sub.id), { name: editSubName, image: editSubImage });
                          setSubjects(subjects.map(s => s.id === sub.id ? {...s, name: editSubName, image: editSubImage} : s));
                          setEditingSubjectId(null);
                        }} className="flex-1 py-1 bg-emerald-600 text-white rounded text-xs cursor-pointer">حفظ</button>
                        <button onClick={() => setEditingSubjectId(null)} className="flex-1 py-1 bg-slate-200 rounded text-xs cursor-pointer">إلغاء</button>
                      </div>
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
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500 mt-2">
                      <span>{sub.videos?.length || 0} فيديو</span>
                      <span>{sub.booklets?.length || 0} ملزمة</span>
                      <span>{sub.quizzes?.length || 0} امتحان</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredSubjects.length === 0 && (
              <div className="bg-white rounded-2xl p-8 text-center border space-y-2">
                <p className="text-slate-500 font-bold text-sm">لا توجد مواد مضافة لهذه المرحلة حالياً.</p>
              </div>
            )}
          </div>
        )}

        {/* 2. إدارة وتصفح المادة الدراسية المفصلة */}
        {selectedSubjectId && (() => {
          const currentSub = subjects.find(s => s.id === selectedSubjectId);
          if (!currentSub) return null;

          const filteredNotes = (currentSub.notes || []).filter((n: any) => 
            n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            n.content.toLowerCase().includes(searchQuery.toLowerCase())
          );

          const filteredVideos = (currentSub.videos || []).filter((v: any) => 
            v.title.toLowerCase().includes(searchQuery.toLowerCase())
          );

          const filteredBooklets = (currentSub.booklets || []).filter((b: any) => 
            b.title.toLowerCase().includes(searchQuery.toLowerCase())
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

              {/* شريط البحث الفوري الذكي */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="بحث سريع (اكتب أول حرف أو كلمة مثل: الفصل الأول، تعريف...)" 
                  className="w-full bg-slate-50 border-2 border-indigo-100 rounded-2xl pr-10 pl-4 py-3 text-xs sm:text-sm font-bold text-slate-900 focus:outline-none focus:border-indigo-500 shadow-sm"
                />
              </div>

              {/* أ) الشروحات والتعاليل */}
              <div className="bg-slate-50 p-3 sm:p-5 rounded-2xl border space-y-4">
                <h4 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <NoteIcon className="w-4 h-4 text-amber-600" /> الشروحات والتعاليل والملاحظات ({filteredNotes.length})
                </h4>
                <div className="space-y-4">
                  {filteredNotes.map((note: any, nIdx: number) => (
                    <div key={note.id} className="p-4 bg-white rounded-2xl border shadow-sm space-y-3 relative">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <h5 className="font-black text-slate-900 text-xs sm:text-sm">💡 {note.title}</h5>
                          {note.isVip && <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-black">⭐ VIP</span>}
                        </div>
                        {isAdmin && <div className="flex items-center gap-1">
                          <button onClick={() => { setEditingNoteId(note.id); setEditNoteTitle(note.title || ''); setEditNoteContent(note.content || ''); setEditNoteImage(note.image || ''); setEditNoteVip(!!note.isVip); }} className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-[10px] font-bold">✏️ تعديل الشرح</button>
                          <button onClick={async () => { if (!window.confirm('تأكيد حذف الشرح وكل الأسئلة التفاعلية التابعة له؟')) return; const updatedNotes = (currentSub.notes || []).filter((n: any) => n.id !== note.id); try { await updateDoc(doc(db, 'subjects', currentSub.id), { notes: updatedNotes }); const updatedSubs = subjects.map(s => s.id === currentSub.id ? { ...s, notes: updatedNotes } : s); setSubjects(updatedSubs); localStorage.setItem('nabough_cached_subjects', JSON.stringify(updatedSubs)); void saveSubjectsOffline(updatedSubs); setSuccessMessage('تم حذف الشرح بنجاح'); setTimeout(() => setSuccessMessage(null), 2500); } catch (e) { alert('تعذر حذف الشرح، حاول مرة أخرى'); } }} className="px-2 py-1 bg-rose-50 text-rose-700 rounded-lg text-[10px] font-bold">🗑 حذف</button>
                        </div>}
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed">{note.content}</p>

                      {note.image && (
                        <div className="mt-2 h-48 w-full rounded-xl overflow-hidden border shadow-sm">
                          <img src={note.image} alt={note.title} className="w-full h-full object-cover" />
                        </div>
                      )}

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
                                        setEditInteractiveCorrect(iq.correct);
                                        setEditInteractiveOptions(Array.isArray(iq.options) ? [...iq.options] : ['', '', '', '']);
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

                {isAdmin && (
                  <div className="bg-white p-4 rounded-xl border space-y-3 mt-3">
                    <h5 className="text-xs font-black text-slate-800">➕ إضافة شرح أو تعليل جديد (مع صورة توضيحية وسؤال تفاعلي):</h5>
                    <input type="text" value={newNoteTitle} onChange={(e) => setNewNoteTitle(e.target.value)} placeholder="العنوان..." className="w-full px-3 py-2 border rounded-xl text-xs font-bold" />
                    <textarea value={newNoteContent} onChange={(e) => setNewNoteContent(e.target.value)} placeholder="النص التفصيلي..." className="w-full px-3 py-2 border rounded-xl text-xs font-bold h-20" />
                    <input type="text" value={newNoteImage} onChange={(e) => setNewNoteImage(e.target.value)} placeholder="رابط صورة توضيحية للشرح (اختياري)..." className="w-full px-3 py-2 border rounded-xl text-xs font-mono" />
                    
                    <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-200 space-y-2">
                      <h6 className="text-xs font-black text-indigo-900">إرفاق سؤال تفاعلي سريع:</h6>
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

              {/* ب) الفيديوهات الشارحة (مع زر التعديل والـ VIP) */}
              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border space-y-4">
                <h4 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <Video className="w-4 h-4 text-indigo-600" /> الدروس المرئية ({filteredVideos.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredVideos.map((vid: any) => (
                    <div key={vid.id} className="p-3.5 bg-white rounded-xl border flex items-center justify-between shadow-sm flex-wrap gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">▶</div>
                        <div>
                          <span className="font-bold text-slate-800 text-xs block">{vid.title}</span>
                          <span className="text-[10px] text-slate-500">{vid.duration} {vid.isVip ? '• ⭐ VIP' : ''}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {vid.isVip && !isVipActive && isAdmin === false ? (
                          <button onClick={() => setVipModalItem(vid)} className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-bold cursor-pointer">قفل VIP 🔒</button>
                        ) : (
                          <button onClick={() => setActiveVideoUrl(vid.url)} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow cursor-pointer">تشغيل</button>
                        )}
                        {isAdmin && (
                          <div className="flex items-center gap-1">
                            <button onClick={() => {
                              setEditingVideoItem({ subjectId: currentSub.id, video: vid });
                              setEditVideoTitle(vid.title);
                              setEditVideoUrl(vid.url);
                              setEditVideoVip(vid.isVip || false);
                            }} className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs cursor-pointer" title="تعديل الفيديو"><Edit3 className="w-3.5 h-3.5" /></button>
                            <button onClick={async () => {
                              const updatedVids = currentSub.videos.filter((v: any) => v.id !== vid.id);
                              await updateDoc(doc(db, 'subjects', currentSub.id), { videos: updatedVids });
                              setSubjects(subjects.map(s => s.id === currentSub.id ? {...s, videos: updatedVids} : s));
                            }} className="text-rose-500 p-1 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {isAdmin && (
                  <div className="bg-white p-3 rounded-xl border space-y-2 mt-2">
                    <h5 className="text-xs font-black text-slate-800">➕ إضافة فيديو جديد (مع دعم VIP):</h5>
                    <input type="text" value={newVideoTitle} onChange={(e) => setNewVideoTitle(e.target.value)} placeholder="عنوان الفيديو..." className="w-full px-3 py-1.5 border rounded-lg text-xs font-bold" />
                    <input type="text" value={newVideoUrl} onChange={(e) => setNewVideoUrl(e.target.value)} placeholder="رابط يوتيوب..." className="w-full px-3 py-1.5 border rounded-lg text-xs font-mono" />
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-1 text-xs font-bold cursor-pointer">
                        <input type="checkbox" checked={newVideoVip} onChange={(e) => setNewVideoVip(e.target.checked)} className="w-4 h-4" />
                        <span>فيديو خاص بـ VIP؟</span>
                      </label>
                    </div>
                    <button onClick={async () => {
                      if (!newVideoTitle || !newVideoUrl) return;
                      const formattedUrl = formatYouTubeUrl(newVideoUrl);
                      const newVidObj = { id: Date.now().toString(), title: newVideoTitle, url: formattedUrl, duration: '45 دقيقة', isVip: newVideoVip };
                      const updatedVids = [...(currentSub.videos || []), newVidObj];
                      await updateDoc(doc(db, 'subjects', currentSub.id), { videos: updatedVids });
                      setSubjects(subjects.map(s => s.id === currentSub.id ? {...s, videos: updatedVids} : s));
                      setNewVideoTitle(''); setNewVideoUrl(''); setNewVideoVip(false);
                      setSuccessMessage('تم نشر الفيديو بنجاح!');
                      setTimeout(() => setSuccessMessage(null), 3000);
                    }} className="w-full py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold cursor-pointer">+ نشر الفيديو</button>
                  </div>
                )}
              </div>

              {/* ج) ملازم PDF (مع زر التعديل والـ VIP) */}
              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border space-y-4">
                <h4 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" /> ملازم الـ PDF ({filteredBooklets.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredBooklets.map((book: any) => (
                    <div key={book.id} className="p-3.5 bg-white rounded-xl border flex items-center justify-between shadow-sm flex-wrap gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs flex-shrink-0">📄</div>
                        <div>
                          <span className="font-bold text-slate-800 text-xs block">{book.title}</span>
                          <span className="text-[10px] text-slate-500">{book.size} {book.isVip ? '• ⭐ VIP' : ''}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {book.isVip && !isVipActive && isAdmin === false ? (
                          <button onClick={() => setVipModalItem(book)} className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-bold cursor-pointer">قفل VIP 🔒</button>
                        ) : (
                          <button onClick={() => { setPdfLoading(true); setPdfLoadFailed(false); setActivePdfUrl(book.url); }} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold shadow cursor-pointer">قراءة 👁️</button>
                        )}
                        {isAdmin && (
                          <div className="flex items-center gap-1">
                            <button onClick={() => {
                              setEditingBookletItem({ subjectId: currentSub.id, booklet: book });
                              setEditBookletTitle(book.title);
                              setEditBookletUrl(book.url);
                              setEditBookletVip(book.isVip || false);
                            }} className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs cursor-pointer" title="تعديل الملزمة"><Edit3 className="w-3.5 h-3.5" /></button>
                            <button onClick={async () => {
                              const updatedBooks = currentSub.booklets.filter((b: any) => b.id !== book.id);
                              await updateDoc(doc(db, 'subjects', currentSub.id), { booklets: updatedBooks });
                              setSubjects(subjects.map(s => s.id === currentSub.id ? {...s, booklets: updatedBooks} : s));
                            }} className="text-rose-500 p-1 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {isAdmin && (
                  <div className="bg-white p-3 rounded-xl border space-y-2 mt-2">
                    <h5 className="text-xs font-black text-slate-800">➕ إضافة ملزمة PDF جديدة (مع دعم VIP):</h5>
                    <input type="text" value={newBookletTitle} onChange={(e) => setNewBookletTitle(e.target.value)} placeholder="عنوان الملزمة..." className="w-full px-3 py-1.5 border rounded-lg text-xs font-bold" />
                    <input type="text" value={newBookletUrl} onChange={(e) => setNewBookletUrl(e.target.value)} placeholder="رابط الـ PDF..." className="w-full px-3 py-1.5 border rounded-lg text-xs font-mono" />
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-1 text-xs font-bold cursor-pointer">
                        <input type="checkbox" checked={newBookletVip} onChange={(e) => setNewBookletVip(e.target.checked)} className="w-4 h-4" />
                        <span>ملزمة خاصة بـ VIP؟</span>
                      </label>
                    </div>
                    <button onClick={async () => {
                      if (!newBookletTitle || !newBookletUrl) return;
                      const newBookObj = { id: Date.now().toString(), title: newBookletTitle, url: newBookletUrl, size: '15 MB', isVip: newBookletVip };
                      const updatedBooks = [...(currentSub.booklets || []), newBookObj];
                      await updateDoc(doc(db, 'subjects', currentSub.id), { booklets: updatedBooks });
                      setSubjects(subjects.map(s => s.id === currentSub.id ? {...s, booklets: updatedBooks} : s));
                      setNewBookletTitle(''); setNewBookletUrl(''); setNewBookletVip(false);
                      setSuccessMessage('تم نشر الملزمة بنجاح!');
                      setTimeout(() => setSuccessMessage(null), 3000);
                    }} className="w-full py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold cursor-pointer">+ نشر الملزمة</button>
                  </div>
                )}
              </div>

              {/* د) الامتحانات (مع خاصية الاستيراد السريع للأسئلة التفاعلية المضافة سابقاً) */}
              <div className="bg-slate-50 p-4 sm:p-5 rounded-2xl border space-y-4">
                <h4 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-indigo-600" /> الامتحانات المتاحة ({currentSub.quizzes?.length || 0})
                </h4>
                <div className="space-y-2">
                  {currentSub.quizzes?.filter((quiz: any) => isAdmin || quiz.isActive !== false).map((quiz: any) => (
                    <div key={quiz.id} className="p-3.5 bg-white rounded-xl border flex items-center justify-between shadow-sm flex-wrap gap-2">
                      <span className="font-bold text-slate-800 text-xs sm:text-sm">
                        📝 {quiz.title} {quiz.type === 'html' ? '· ملف HTML' : `(${quiz.durationMinutes || 15} دقيقة) · الأسئلة: ${quiz.questions?.length || 0}`} {quiz.isVip && '⭐ VIP'} {quiz.isActive === false && '· معطّل'}
                      </span>
                      <div className="flex items-center gap-2 flex-wrap">
                        {quiz.isVip && !isVipActive && isAdmin === false ? (
                          <button onClick={() => setVipModalItem(quiz)} className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-bold cursor-pointer">قفل VIP 🔒</button>
                        ) : (
                          <button onClick={() => {
                            if (quiz.type === 'html' || quiz.htmlContent) setActiveQuiz(quiz);
                            else { setActiveQuiz(quiz); setTimeLeft((quiz.durationMinutes || 15) * 60); setTimerActive(true); }
                          }} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow cursor-pointer">
                            {quiz.type === 'html' ? 'فتح داخل المنصة ↗' : 'بدء الامتحان 🚀'}
                          </button>
                        )}
                        {isAdmin && (
                          <div className="flex items-center gap-1 flex-wrap">
                            {quiz.type === 'html' || quiz.htmlContent ? (
                              <>
                                <button onClick={() => {
                                  const title = window.prompt('تعديل عنوان الاختبار:', quiz.title);
                                  if (title !== null && title.trim()) handleUpdateHtmlQuiz(currentSub.id, quiz.id, { title: title.trim() });
                                }} className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs" title="تعديل الاسم"><Edit3 className="w-3.5 h-3.5" /></button>
                                <button onClick={() => handleUpdateHtmlQuiz(currentSub.id, quiz.id, { isVip: !quiz.isVip })} className={`px-2 py-1 rounded-lg text-[10px] font-black ${quiz.isVip ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-700'}`}>
                                  {quiz.isVip ? 'VIP مفعّل' : 'تفعيل VIP'}
                                </button>
                                <button onClick={() => handleUpdateHtmlQuiz(currentSub.id, quiz.id, { isActive: quiz.isActive === false })} className={`px-2 py-1 rounded-lg text-[10px] font-black ${quiz.isActive === false ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}>
                                  {quiz.isActive === false ? 'تفعيل' : 'إيقاف'}
                                </button>
                                <button onClick={async () => {
                                  if (!window.confirm('حذف ملف الاختبار نهائياً؟')) return;
                                  const updatedQuizzes = (currentSub.quizzes || []).filter((q: any) => q.id !== quiz.id);
                                  try {
                                    await updateDoc(doc(db, 'subjects', currentSub.id), { quizzes: updatedQuizzes });
                                    const updatedSubs = subjects.map((sub: any) => sub.id === currentSub.id ? { ...sub, quizzes: updatedQuizzes } : sub);
                                    setSubjects(updatedSubs);
                                    localStorage.setItem('nabough_cached_subjects', JSON.stringify(updatedSubs)); void saveSubjectsOffline(updatedSubs);
                                  } catch (error) { alert('تعذر حذف الاختبار.'); }
                                }} className="text-rose-500 p-1" title="حذف"><Trash2 className="w-4 h-4" /></button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => {
                                  setEditingQuizItem({ subjectId: currentSub.id, quiz });
                                  setEditQuizTitle(quiz.title);
                                  setEditQuizDuration(quiz.durationMinutes || 15);
                                  setEditQuizQuestions(quiz.questions || []);
                                }} className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs" title="تعديل"><Edit3 className="w-3.5 h-3.5" /></button>
                                <button onClick={async () => {
                                  if (!window.confirm('حذف الامتحان؟')) return;
                                  const updatedQuizzes = currentSub.quizzes.filter((q: any) => q.id !== quiz.id);
                                  await updateDoc(doc(db, 'subjects', currentSub.id), { quizzes: updatedQuizzes });
                                  const updatedSubs = subjects.map((sub: any) => sub.id === currentSub.id ? {...sub, quizzes: updatedQuizzes} : sub);
                                  setSubjects(updatedSubs);
                                  localStorage.setItem('nabough_cached_subjects', JSON.stringify(updatedSubs)); void saveSubjectsOffline(updatedSubs);
                                }} className="text-rose-500 p-1"><Trash2 className="w-4 h-4" /></button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {(!currentSub.quizzes || currentSub.quizzes.length === 0) && (
                    <p className="text-xs text-slate-500 text-center py-3 font-bold">لا توجد امتحانات منشورة حتى الآن.</p>
                  )}
                </div>

                {isAdmin && (
                  <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200 space-y-3 mt-3">
                    <h5 className="text-sm font-black text-indigo-950">📤 رفع اختبار HTML جاهز</h5>
                    <input type="text" value={htmlQuizTitle} onChange={(e) => setHtmlQuizTitle(e.target.value)} placeholder="عنوان الاختبار (مثال: امتحان نصف السنة)" className="w-full px-3 py-2 border rounded-xl text-xs font-bold bg-white" />
                    <input type="file" accept=".html,.htm,text/html" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (!/\.html?$/i.test(file.name)) { alert('اختر ملف HTML فقط.'); e.target.value = ''; return; }
                      if (file.size > 500 * 1024) { alert('حجم الملف يجب أن يكون أقل من 500 كيلوبايت.'); e.target.value = ''; return; }
                      const reader = new FileReader();
                      reader.onload = () => {
                        setHtmlQuizContent(String(reader.result || ''));
                        setHtmlQuizFileName(file.name);
                        if (!htmlQuizTitle.trim()) setHtmlQuizTitle(file.name.replace(/\.html?$/i, ''));
                      };
                      reader.onerror = () => alert('تعذرت قراءة الملف.');
                      reader.readAsText(file, 'UTF-8');
                    }} className="w-full px-3 py-2 border rounded-xl text-xs bg-white" />
                    {htmlQuizFileName && <p className="text-xs text-emerald-700 font-bold">تم اختيار الملف: {htmlQuizFileName}</p>}
                    <label className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs font-bold text-amber-900">
                      <input type="checkbox" checked={htmlQuizVip} onChange={(e) => setHtmlQuizVip(e.target.checked)} className="w-4 h-4" />
                      جعل الاختبار للمشتركين VIP فقط
                    </label>
                    <p className="text-[11px] text-slate-600">يُحفظ محتوى HTML داخل بيانات المادة في Firestore ويُعرض داخل المنصة. الحد الأقصى للملف 500KB.</p>
                    <button type="button" disabled={htmlQuizSaving} onClick={() => handleSaveHtmlQuiz(currentSub.id)} className="w-full py-2.5 bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs">
                      {htmlQuizSaving ? 'جارٍ الحفظ...' : 'حفظ ونشر اختبار HTML داخل المادة'}
                    </button>
                  </div>
                )}

                {isAdmin && (
                  <div className="bg-white p-4 rounded-xl border space-y-3 mt-3">
                    <h5 className="text-xs font-black text-slate-800">🛠️ صياغة امتحان جديد (مع الاستيراد السريع للأسئلة التفاعلية):</h5>
                    <input type="text" value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} placeholder="عنوان الامتحان..." className="w-full px-3 py-2 border rounded-xl text-xs font-bold" />
                    
                    {/* استيراد سريع من الشروحات والأسئلة التفاعلية المضافة سابقاً */}
                    {currentSub.notes && currentSub.notes.length > 0 && (
                      <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl space-y-2">
                        <label className="block text-xs font-black text-indigo-900">💡 استيراد سؤال من الأسئلة التفاعلية أو الشروحات السابقة:</label>
                        <select 
                          onChange={(e) => {
                            const val = e.target.value;
                            if (!val) return;
                            if (val.includes('__iq_')) {
                              const [nId, iqIdxStr] = val.split('__iq_');
                              const foundNote = currentSub.notes.find((n: any) => n.id === nId);
                              if (foundNote && foundNote.interactiveQuestions) {
                                const iq = foundNote.interactiveQuestions[Number(iqIdxStr)];
                                if (iq) {
                                  setCurrentQuestionsList([...currentQuestionsList, { type: iq.type || 'fill', q: iq.q, options: iq.options || [], correct: iq.correct, isMinisterial: false }]);
                                  setSuccessMessage('تم استيراد السؤال التفاعلي بنجاح إلى الامتحان!');
                                  setTimeout(() => setSuccessMessage(null), 2500);
                                }
                              }
                            } else {
                              const foundNote = currentSub.notes.find((n: any) => n.id === val);
                              if (foundNote) {
                                setCurrentQuestionsList([...currentQuestionsList, { type: 'fill', q: foundNote.title, correct: foundNote.content, isMinisterial: false }]);
                                setSuccessMessage('تم استيراد الشرح/التعليل بنجاح إلى الامتحان!');
                                setTimeout(() => setSuccessMessage(null), 2500);
                              }
                            }
                            e.target.value = '';
                          }}
                          className="w-full px-3 py-2 bg-white border rounded-lg text-xs font-bold text-slate-800 cursor-pointer"
                        >
                          <option value="">-- اضغط لاختيار سؤال تفاعلي أو شرح لاستيراده للامتحان --</option>
                          {currentSub.notes.map((n: any) => (
                            <React.Fragment key={n.id}>
                              <option value={n.id}>📖 شرح: {n.title}</option>
                              {n.interactiveQuestions && n.interactiveQuestions.map((iq: any, iqIdx: number) => (
                                <option key={`${n.id}__iq_${iqIdx}`} value={`${n.id}__iq_${iqIdx}`}>&nbsp;&nbsp;&nbsp;&nbsp;⭐ سؤال تفاعلي: {iq.q}</option>
                              ))}
                            </React.Fragment>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="p-3 bg-slate-50 rounded-xl border space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold">أضف سؤال يدوياً ({currentQuestionsList.length} مضافة)</span>
                        <select value={questionType} onChange={(e) => setQuestionType(e.target.value as any)} className="px-2 py-1 border rounded text-xs font-bold">
                          <option value="mcq">اختيار من متعدد</option>
                          <option value="fill">فراغات</option>
                          <option value="true_false">صح وخطأ</option>
                        </select>
                      </div>
                      <input type="text" value={questionText} onChange={(e) => setQuestionText(e.target.value)} placeholder="نص السؤال..." className="w-full px-3 py-1.5 bg-white border rounded text-xs font-bold" />
                      
                      <label className="flex items-center gap-2 p-2 bg-amber-50 border rounded-lg text-xs font-black text-amber-900 cursor-pointer">
                        <input type="checkbox" checked={isMinisterialQuestion} onChange={(e) => setIsMinisterialQuestion(e.target.checked)} className="w-4 h-4 text-amber-600 rounded" />
                        <span>🔥 تعليم هذا السؤال كـ (وزاري مهم)</span>
                      </label>

                      {questionType === 'mcq' && (
                        <div className="grid grid-cols-2 gap-1.5">
                          {mcqOptions.map((opt, oIdx) => (
                            <input key={oIdx} type="text" value={opt} onChange={(e) => {
                              const opts = [...mcqOptions]; opts[oIdx] = e.target.value; setMcqOptions(opts);
                            }} placeholder={`خيار ${oIdx+1}`} className="px-2 py-1 bg-white border rounded text-xs" />
                          ))}
                          <input type="text" value={mcqCorrect} onChange={(e) => setMcqCorrect(e.target.value)} placeholder="الخيار الصحيح..." className="col-span-2 px-2 py-1 bg-emerald-50 border rounded text-xs font-bold text-emerald-900" />
                        </div>
                      )}
                      {questionType === 'fill' && (
                        <input type="text" value={fillCorrect} onChange={(e) => setFillCorrect(e.target.value)} placeholder="الإجابة الصحيحة..." className="w-full px-2 py-1 bg-emerald-50 border rounded text-xs font-bold text-emerald-900" />
                      )}
                      {questionType === 'true_false' && (
                        <div className="flex gap-4 text-xs font-bold">
                          <label className="cursor-pointer"><input type="radio" name="stf" checked={tfCorrect === 'صح'} onChange={() => setTfCorrect('صح')} /> صح</label>
                          <label className="cursor-pointer"><input type="radio" name="stf" checked={tfCorrect === 'خطأ'} onChange={() => setTfCorrect('خطأ')} /> خطأ</label>
                        </div>
                      )}
                      <button type="button" onClick={handleAddQuestionToQuiz} className="w-full py-1.5 bg-slate-900 text-white rounded text-xs font-bold cursor-pointer">+ إضافة السؤال للامتحان</button>
                    </div>

                    <button onClick={() => handleSaveQuizToSubject(currentSub.id)} className="w-full py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-xs shadow cursor-pointer">
                      نشر الامتحان في المنصة
                    </button>
                  </div>
                )}
              </div>

            </div>
          );
        })()}

        {/* 3. لوحة إدارة الطلبة مع تاريخ التسجيل وزر فك الارتباط 🔓 وتعديل البيانات */}
        {activeTab === 'students' && isAdmin && (
          <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-6 shadow-xl border space-y-4 w-full">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" /> إدارة الطلبة ودرجاتهم وتعديل بياناتهم
            </h2>

            {/* أدوات البحث والتصفية: لا تغيّر بيانات الطلبة أو طريقة إدارتهم */}
            <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_220px] gap-2 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-3">
              <div className="relative">
                <input
                  type="search"
                  value={studentSearchText}
                  onChange={(e) => setStudentSearchText(e.target.value)}
                  placeholder="ابحث باسم الطالب أو اسم المستخدم..."
                  aria-label="البحث باسم الطالب أو اسم المستخدم"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
              <select
                value={studentStageFilter}
                onChange={(e) => setStudentStageFilter(e.target.value)}
                aria-label="تصفية الطلبة حسب المرحلة"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold text-slate-800 outline-none focus:border-indigo-500"
              >
                <option value="all">كل المراحل الدراسية</option>
                {allStagesList.map((stageOption) => (
                  <option key={stageOption.id} value={stageOption.name}>{stageOption.name}</option>
                ))}
              </select>
              <div className="sm:col-span-2 flex items-center justify-between gap-2 text-xs font-bold text-slate-600">
                <span>عدد النتائج: {studentsList.filter((st) => {
                  const q = studentSearchText.trim().toLocaleLowerCase();
                  const matchesText = !q ||
                    String(st.name || '').toLocaleLowerCase().includes(q) ||
                    String(st.username || '').toLocaleLowerCase().includes(q);
                  const matchesStage = studentStageFilter === 'all' || String(st.stage || '') === studentStageFilter;
                  return matchesText && matchesStage;
                }).length} من {studentsList.length}</span>
                {(studentSearchText || studentStageFilter !== 'all') && (
                  <button
                    type="button"
                    onClick={() => { setStudentSearchText(''); setStudentStageFilter('all'); }}
                    className="rounded-lg bg-white px-3 py-1.5 text-indigo-700 border border-indigo-100 hover:bg-indigo-100"
                  >
                    مسح البحث والتصفية
                  </button>
                )}
              </div>
            </div>

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
                  {studentsList.filter((st) => {
                    const q = studentSearchText.trim().toLocaleLowerCase();
                    const matchesText = !q ||
                      String(st.name || '').toLocaleLowerCase().includes(q) ||
                      String(st.username || '').toLocaleLowerCase().includes(q);
                    const matchesStage = studentStageFilter === 'all' || String(st.stage || '') === studentStageFilter;
                    return matchesText && matchesStage;
                  }).map((st) => (
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
                  {studentsList.filter((st) => {
                    const q = studentSearchText.trim().toLocaleLowerCase();
                    const matchesText = !q ||
                      String(st.name || '').toLocaleLowerCase().includes(q) ||
                      String(st.username || '').toLocaleLowerCase().includes(q);
                    const matchesStage = studentStageFilter === 'all' || String(st.stage || '') === studentStageFilter;
                    return matchesText && matchesStage;
                  }).length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-sm font-bold text-slate-500">
                        لا توجد نتائج مطابقة للبحث أو المرحلة المحددة.
                      </td>
                    </tr>
                  )}
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
                videos: [], booklets: [], notes: [], quizzes: []
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
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                await setDoc(doc(db, 'settings', 'vip_config'), {
                  price: vipSettings.price || '',
                  mastercard: vipSettings.mastercard || '',
                  transferPhone: vipSettings.transferPhone || '',
                  whatsappPhone: (vipSettings.whatsappPhone || '').replace(/\s+/g, ''),
                  telegram: vipSettings.telegram || ''
                }, { merge: true });
                localStorage.setItem('nabough_vip_settings', JSON.stringify(vipSettings));
                setSuccessMessage('تم حفظ إعدادات VIP ورقم واتساب سحابياً، وستظهر للطلاب على الموبايل والحاسبة.');
              } catch (error) {
                alert('تعذر حفظ إعدادات VIP سحابياً. تحقق من اتصال الإنترنت وصلاحيات Firestore.');
              }
              setTimeout(() => setSuccessMessage(null), 4000);
            }} className="space-y-3 max-w-lg">
              <label className="block text-xs font-bold text-slate-700">سعر الاشتراك</label>
              <input type="text" value={vipSettings.price} onChange={(e) => setVipSettings({...vipSettings, price: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-xs font-bold" placeholder="مثال: 10,000 دينار عراقي / سنوياً" />
              <label className="block text-xs font-bold text-slate-700">رقم الماستر كارد / المصرف</label>
              <input type="text" value={vipSettings.mastercard} onChange={(e) => setVipSettings({...vipSettings, mastercard: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-xs font-mono" placeholder="الماستر كارد / المصرف" />
              <label className="block text-xs font-bold text-slate-700">رقم التحويل (زين كاش / آسياسيل)</label>
              <input type="text" value={vipSettings.transferPhone || ''} onChange={(e) => setVipSettings({...vipSettings, transferPhone: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-xs font-mono" placeholder="رقم التحويل" />
              <label className="block text-xs font-bold text-slate-700">رابط قناة التليجرام (يمكن إضافته لاحقاً)</label>
              <input type="url" dir="ltr" value={vipSettings.telegram || ''} onChange={(e) => setVipSettings({...vipSettings, telegram: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-xs font-mono text-left" placeholder="https://t.me/اسم_القناة" />
              <label className="block text-xs font-bold text-slate-700">رقم واتساب الإدارة لاستلام طلبات VIP</label>
              <input type="tel" dir="ltr" inputMode="tel" value={vipSettings.whatsappPhone || ''} onChange={(e) => setVipSettings({...vipSettings, whatsappPhone: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-xs font-mono text-left" placeholder="9647XXXXXXXXX أو 07XXXXXXXXX" />
              <p className="text-[11px] text-slate-500 leading-relaxed">اكتب رقمك العراقي مع مفتاح الدولة 964، أو اكتبه بصيغة 07… وسيحوّله النظام تلقائياً. لا تكتب علامة + أو مسافات عند الحاجة.</p>
              <button type="submit" className="w-full py-2.5 bg-amber-600 text-white rounded-xl text-xs font-bold cursor-pointer">حفظ إعدادات الدفع ورقم واتساب سحابياً</button>
            </form>
          </div>
        )}

        {/* إدارة الإعلانات والتواصل */}
        {activeTab === 'communications' && isAdmin && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xl border space-y-3">
              <h2 className="text-xl font-black text-slate-900">إضافة إعلان للطلاب</h2>
              <form onSubmit={handleSaveAnnouncement} className="space-y-3">
                <textarea value={announcementText} onChange={e => setAnnouncementText(e.target.value)} rows={3} maxLength={500} placeholder="اكتب الإعلان أو التنبيه هنا..." className="w-full border rounded-xl p-3 text-sm" />
                <select value={announcementStage} onChange={e => setAnnouncementStage(e.target.value)} className="w-full border rounded-xl p-2 text-sm font-bold"><option value="all">جميع المراحل</option>{allStagesList.map(st => <option key={st.id} value={st.name}>{st.name}</option>)}</select>
                <button disabled={announcementSaving || !announcementText.trim()} className="w-full rounded-xl bg-sky-600 text-white py-2.5 text-sm font-black disabled:opacity-50">{announcementSaving ? 'جارٍ النشر...' : 'نشر الإعلان'}</button>
              </form>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-xl border space-y-3"><h3 className="font-black">الإعلانات المنشورة</h3>
              {announcementItems.length === 0 ? <p className="text-xs text-slate-500">لا توجد إعلانات حالياً.</p> : announcementItems.map((a: any) => <div key={a.id} className="border rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"><div><p className="text-sm font-bold">{a.text}</p><p className="text-[11px] text-slate-500 mt-1">{a.stage === 'all' ? 'جميع المراحل' : a.stage}</p></div><div className="flex gap-2"><button onClick={async () => { const next = prompt('تعديل نص الإعلان:', a.text); if (next === null || !next.trim()) return; try { await updateDoc(doc(db, 'announcements', a.id), { text: next.trim() }); } catch(e) { alert('تعذر تعديل الإعلان.'); } }} className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold">تعديل</button><button onClick={async () => { if (!confirm('هل تريد حذف هذا الإعلان؟')) return; try { await deleteDoc(doc(db, 'announcements', a.id)); } catch(e) { alert('تعذر حذف الإعلان.'); } }} className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 text-xs font-bold">حذف</button></div></div>)}
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-xl border space-y-2"><h3 className="font-black">زر قناة التليجرام</h3><p className="text-xs text-slate-600">أضف رابط القناة من تبويب إعدادات VIP؛ سيظهر زر الانضمام للطلاب تلقائياً بعد حفظ الرابط.</p><button onClick={() => setActiveTab('vipSettings')} className="px-4 py-2 rounded-xl bg-amber-500 text-white text-xs font-bold">فتح إعدادات الرابط</button></div>
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
