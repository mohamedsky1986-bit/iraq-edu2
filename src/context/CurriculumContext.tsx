/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  EducationalStage,
  Subject,
  Lesson,
  Question,
  Exam,
  StudentSubmission,
  UserAccount,
  SubscriptionPlan,
  PaymentSettings,
  AdminSecuritySettings,
  StudentReview,
  StudyBooklet
} from '../types/curriculum';
import {
  INITIAL_STAGES,
  INITIAL_SUBJECTS,
  INITIAL_LESSONS,
  INITIAL_QUESTIONS,
  INITIAL_EXAMS,
  INITIAL_SUBMISSIONS,
  INITIAL_USERS,
  INITIAL_SUBSCRIPTION_PLANS,
  INITIAL_PAYMENT_SETTINGS,
  INITIAL_ADMIN_SECURITY,
  INITIAL_STUDENT_REVIEWS,
  INITIAL_BOOKLETS
} from '../data/initialData';
import { soundManager } from '../utils/audioSystem';

interface CurriculumContextType {
  stages: EducationalStage[];
  subjects: Subject[];
  lessons: Lesson[];
  questions: Question[];
  exams: Exam[];
  submissions: StudentSubmission[];
  users: UserAccount[];
  currentUser: UserAccount;
  selectedStageId: string;
  soundEnabled: boolean;
  activeExam: Exam | null;

  // Security & Admin Passcode
  adminSettings: AdminSecuritySettings;
  isTeacherUnlocked: boolean;
  unlockTeacherPanel: (enteredPasscode: string) => boolean;
  lockTeacherPanel: () => void;
  changeAdminPasscode: (oldPass: string, newPass: string) => boolean;
  updateAdminSettings: (settings: Partial<AdminSecuritySettings>) => void;

  // Subscription Plans & Payments
  subscriptionPlans: SubscriptionPlan[];
  paymentSettings: PaymentSettings;
  updateSubscriptionPlan: (planId: string, fields: Partial<SubscriptionPlan>) => void;
  addSubscriptionPlan: (newPlan: Omit<SubscriptionPlan, 'id'>) => void;
  deleteSubscriptionPlan: (planId: string) => void;
  updatePaymentSettings: (settings: Partial<PaymentSettings>) => void;

  // Student Reviews
  studentReviews: StudentReview[];
  addStudentReview: (rev: Omit<StudentReview, 'id' | 'createdAt' | 'isApproved'>) => void;
  approveReview: (reviewId: string, approved: boolean) => void;
  toggleFeatureReview: (reviewId: string) => void;
  deleteReview: (reviewId: string) => void;

  // Student User Management
  updateStudentUser: (email: string, fields: Partial<UserAccount>) => void;
  deleteStudentUser: (email: string) => void;
  addNewStudent: (student: UserAccount) => void;

  // Actions
  setSelectedStageId: (stageId: string) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setCurrentUser: (user: UserAccount) => void;
  loginWithEmail: (email: string, name?: string, role?: 'student' | 'teacher') => void;
  switchUserRole: (role: 'student' | 'teacher') => void;
  toggleVipStatus: (email: string, isVip: boolean) => void;

  // Content actions
  addSubject: (subject: Omit<Subject, 'id'>) => Subject;
  addLesson: (lesson: Omit<Lesson, 'id'>) => Lesson;
  addQuestion: (question: Omit<Question, 'id'>) => Question;
  updateQuestion: (questionId: string, fields: Partial<Question>) => void;
  deleteQuestion: (questionId: string) => void;
  toggleQuestionVip: (questionId: string) => void;
  addExam: (exam: Omit<Exam, 'id'>) => Exam;
  updateExam: (examId: string, fields: Partial<Exam>) => void;
  deleteExam: (examId: string) => void;
  recordSubmission: (submission: Omit<StudentSubmission, 'id'>) => StudentSubmission;
  setActiveExam: (exam: Exam | null) => void;

  // Study Booklets (PDF)
  booklets: StudyBooklet[];
  addBooklet: (booklet: Omit<StudyBooklet, 'id' | 'publishedAt' | 'downloadCount'>) => StudyBooklet;
  deleteBooklet: (bookletId: string) => void;
  incrementBookletDownloads: (bookletId: string) => void;

  // Export / Import
  exportDataAsJson: () => string;
  importDataFromJson: (jsonData: string) => boolean;
  resetToDefaults: () => void;
}

const CurriculumContext = createContext<CurriculumContextType | null>(null);

const STORAGE_KEYS = {
  STAGES: 'nobogh_stages_v2',
  SUBJECTS: 'nobogh_subjects_v2',
  LESSONS: 'nobogh_lessons_v2',
  QUESTIONS: 'nobogh_questions_v2',
  EXAMS: 'nobogh_exams_v2',
  SUBMISSIONS: 'nobogh_submissions_v2',
  USERS: 'nobogh_users_v2',
  CURRENT_USER: 'nobogh_current_user_v2',
  SELECTED_STAGE: 'nobogh_selected_stage_v2',
  ADMIN_SETTINGS: 'nobogh_admin_settings_v2',
  PLANS: 'nobogh_plans_v2',
  PAYMENTS: 'nobogh_payments_v2',
  REVIEWS: 'nobogh_reviews_v2',
  BOOKLETS: 'nobogh_booklets_v2'
};

export const CurriculumProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stages] = useState<EducationalStage[]>(INITIAL_STAGES);

  const [booklets, setBooklets] = useState<StudyBooklet[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BOOKLETS);
      return saved ? JSON.parse(saved) : INITIAL_BOOKLETS;
    } catch {
      return INITIAL_BOOKLETS;
    }
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
      return saved ? JSON.parse(saved) : INITIAL_SUBJECTS;
    } catch {
      return INITIAL_SUBJECTS;
    }
  });

  const [lessons, setLessons] = useState<Lesson[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LESSONS);
      return saved ? JSON.parse(saved) : INITIAL_LESSONS;
    } catch {
      return INITIAL_LESSONS;
    }
  });

  const [questions, setQuestions] = useState<Question[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.QUESTIONS);
      return saved ? JSON.parse(saved) : INITIAL_QUESTIONS;
    } catch {
      return INITIAL_QUESTIONS;
    }
  });

  const [exams, setExams] = useState<Exam[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EXAMS);
      return saved ? JSON.parse(saved) : INITIAL_EXAMS;
    } catch {
      return INITIAL_EXAMS;
    }
  });

  const [submissions, setSubmissions] = useState<StudentSubmission[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SUBMISSIONS);
      return saved ? JSON.parse(saved) : INITIAL_SUBMISSIONS;
    } catch {
      return INITIAL_SUBMISSIONS;
    }
  });

  const [users, setUsers] = useState<UserAccount[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USERS);
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [currentUser, setCurrentUser] = useState<UserAccount>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return saved ? JSON.parse(saved) : INITIAL_USERS[0];
    } catch {
      return INITIAL_USERS[0];
    }
  });

  const [adminSettings, setAdminSettings] = useState<AdminSecuritySettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ADMIN_SETTINGS);
      return saved ? JSON.parse(saved) : INITIAL_ADMIN_SECURITY;
    } catch {
      return INITIAL_ADMIN_SECURITY;
    }
  });

  const [isTeacherUnlocked, setIsTeacherUnlocked] = useState<boolean>(false);

  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PLANS);
      return saved ? JSON.parse(saved) : INITIAL_SUBSCRIPTION_PLANS;
    } catch {
      return INITIAL_SUBSCRIPTION_PLANS;
    }
  });

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
      return saved ? JSON.parse(saved) : INITIAL_PAYMENT_SETTINGS;
    } catch {
      return INITIAL_PAYMENT_SETTINGS;
    }
  });

  const [studentReviews, setStudentReviews] = useState<StudentReview[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      return saved ? JSON.parse(saved) : INITIAL_STUDENT_REVIEWS;
    } catch {
      return INITIAL_STUDENT_REVIEWS;
    }
  });

  const [selectedStageId, setSelectedStageIdState] = useState<string>(() => {
    if (currentUser.role === 'student' && currentUser.targetStageId) {
      return currentUser.targetStageId;
    }
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SELECTED_STAGE);
      return saved || 'grade-3-intermediate';
    } catch {
      return 'grade-3-intermediate';
    }
  });

  // Automatically lock students to their specific registered stage
  useEffect(() => {
    if (currentUser.role === 'student' && currentUser.targetStageId && selectedStageId !== currentUser.targetStageId) {
      setSelectedStageIdState(currentUser.targetStageId);
    }
  }, [currentUser, selectedStageId]);

  const setSelectedStageId = (stageId: string) => {
    // If student is logged in with a bound stage, prevent switching to other stages
    if (currentUser.role === 'student' && currentUser.targetStageId && stageId !== currentUser.targetStageId) {
      return;
    }
    setSelectedStageIdState(stageId);
  };

  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => {
    return soundManager.isEnabled();
  });

  const [activeExam, setActiveExam] = useState<Exam | null>(null);

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
    } catch {}
  }, [subjects]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(lessons));
    } catch {}
  }, [lessons]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.QUESTIONS, JSON.stringify(questions));
    } catch {}
  }, [questions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EXAMS, JSON.stringify(exams));
    } catch {}
  }, [exams]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
    } catch {}
  }, [submissions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch {}
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    } catch {}
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ADMIN_SETTINGS, JSON.stringify(adminSettings));
    } catch {}
  }, [adminSettings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(subscriptionPlans));
    } catch {}
  }, [subscriptionPlans]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(paymentSettings));
    } catch {}
  }, [paymentSettings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(studentReviews));
    } catch {}
  }, [studentReviews]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SELECTED_STAGE, selectedStageId);
    } catch {}
  }, [selectedStageId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKLETS, JSON.stringify(booklets));
    } catch {}
  }, [booklets]);

  // Passcode verification
  const unlockTeacherPanel = (enteredPasscode: string): boolean => {
    if (enteredPasscode.trim() === adminSettings.passcode.trim()) {
      setIsTeacherUnlocked(true);
      soundManager.playSuccess();
      return true;
    }
    soundManager.playError();
    return false;
  };

  const lockTeacherPanel = () => {
    setIsTeacherUnlocked(false);
  };

  const changeAdminPasscode = (oldPass: string, newPass: string): boolean => {
    if (oldPass.trim() === adminSettings.passcode.trim() && newPass.trim().length >= 4) {
      setAdminSettings(prev => ({
        ...prev,
        passcode: newPass.trim()
      }));
      soundManager.playSuccess();
      return true;
    }
    soundManager.playError();
    return false;
  };

  const updateAdminSettings = (settings: Partial<AdminSecuritySettings>) => {
    setAdminSettings(prev => ({ ...prev, ...settings }));
  };

  // Student user updates
  const updateStudentUser = (email: string, fields: Partial<UserAccount>) => {
    setUsers(prev => prev.map(u => {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        const updated = { ...u, ...fields };
        if (currentUser.email.toLowerCase() === email.toLowerCase()) {
          setCurrentUser(updated);
        }
        return updated;
      }
      return u;
    }));
  };

  const deleteStudentUser = (email: string) => {
    setUsers(prev => prev.filter(u => u.email.toLowerCase() !== email.toLowerCase()));
  };

  const addNewStudent = (student: UserAccount) => {
    setUsers(prev => [student, ...prev.filter(u => u.email.toLowerCase() !== student.email.toLowerCase())]);
    setCurrentUser(student);
    if (student.targetStageId) {
      setSelectedStageIdState(student.targetStageId);
    }
  };

  // Subscription plans
  const updateSubscriptionPlan = (planId: string, fields: Partial<SubscriptionPlan>) => {
    setSubscriptionPlans(prev => prev.map(p => p.id === planId ? { ...p, ...fields } : p));
  };

  const addSubscriptionPlan = (newPlan: Omit<SubscriptionPlan, 'id'>) => {
    const created: SubscriptionPlan = {
      ...newPlan,
      id: `plan-${Date.now()}`
    };
    setSubscriptionPlans(prev => [...prev, created]);
  };

  const deleteSubscriptionPlan = (planId: string) => {
    setSubscriptionPlans(prev => prev.filter(p => p.id !== planId));
  };

  const updatePaymentSettings = (settings: Partial<PaymentSettings>) => {
    setPaymentSettings(prev => ({ ...prev, ...settings }));
  };

  // Student Reviews
  const addStudentReview = (rev: Omit<StudentReview, 'id' | 'createdAt' | 'isApproved'>) => {
    const created: StudentReview = {
      ...rev,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isApproved: false // Requires teacher review
    };
    setStudentReviews(prev => [created, ...prev]);
    soundManager.playSuccess();
  };

  const approveReview = (reviewId: string, approved: boolean) => {
    setStudentReviews(prev => prev.map(r => r.id === reviewId ? { ...r, isApproved: approved } : r));
  };

  const toggleFeatureReview = (reviewId: string) => {
    setStudentReviews(prev => prev.map(r => r.id === reviewId ? { ...r, isFeatured: !r.isFeatured } : r));
  };

  const deleteReview = (reviewId: string) => {
    setStudentReviews(prev => prev.filter(r => r.id !== reviewId));
  };

  const setSoundEnabled = (enabled: boolean) => {
    soundManager.setEnabled(enabled);
    setSoundEnabledState(enabled);
  };

  const loginWithEmail = (email: string, name?: string, role: 'student' | 'teacher' = 'student') => {
    const cleanEmail = email.trim().toLowerCase();
    const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      const withActive = { ...existing, lastActiveAt: new Date().toISOString() };
      setCurrentUser(withActive);
      setUsers(prev => prev.map(u => u.email.toLowerCase() === cleanEmail ? withActive : u));
      if (withActive.role === 'student' && withActive.targetStageId) {
        setSelectedStageIdState(withActive.targetStageId);
      }
    } else {
      const generatedUsername = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');
      const newUser: UserAccount = {
        email: cleanEmail,
        username: generatedUsername,
        name: name?.trim() || cleanEmail.split('@')[0],
        role: cleanEmail.includes('teacher') || cleanEmail === 'mohamedsky1986@gmail.com' ? 'teacher' : role,
        isVip: false,
        targetStageId: selectedStageId,
        governorate: 'العراق',
        registeredAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString()
      };
      setUsers(prev => [newUser, ...prev]);
      setCurrentUser(newUser);
      if (newUser.role === 'student' && newUser.targetStageId) {
        setSelectedStageIdState(newUser.targetStageId);
      }
    }
  };

  const switchUserRole = (role: 'student' | 'teacher') => {
    const updated: UserAccount = {
      ...currentUser,
      role
    };
    setCurrentUser(updated);
    setUsers(prev => prev.map(u => u.email === updated.email ? updated : u));
  };

  const toggleVipStatus = (email: string, isVip: boolean) => {
    setUsers(prev => prev.map(u => {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        return { ...u, isVip };
      }
      return u;
    }));
    if (currentUser.email.toLowerCase() === email.toLowerCase()) {
      setCurrentUser(prev => ({ ...prev, isVip }));
    }
  };

  const addSubject = (newSub: Omit<Subject, 'id'>): Subject => {
    const created: Subject = {
      ...newSub,
      id: `subj-${Date.now()}`,
      isCustom: true
    };
    setSubjects(prev => [...prev, created]);
    return created;
  };

  const addLesson = (newLes: Omit<Lesson, 'id'>): Lesson => {
    const created: Lesson = {
      ...newLes,
      id: `les-${Date.now()}`
    };
    setLessons(prev => [created, ...prev]);
    return created;
  };

  const addQuestion = (newQ: Omit<Question, 'id'>): Question => {
    const created: Question = {
      ...newQ,
      id: `q-${Date.now()}`
    };
    setQuestions(prev => [created, ...prev]);
    return created;
  };

  const updateQuestion = (questionId: string, fields: Partial<Question>) => {
    setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, ...fields } : q));
  };

  const deleteQuestion = (questionId: string) => {
    setQuestions(prev => prev.filter(q => q.id !== questionId));
  };

  const toggleQuestionVip = (questionId: string) => {
    setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, isVip: !q.isVip } : q));
  };

  const addBooklet = (booklet: Omit<StudyBooklet, 'id' | 'publishedAt' | 'downloadCount'>): StudyBooklet => {
    const created: StudyBooklet = {
      ...booklet,
      id: `bk-${Date.now()}`,
      publishedAt: new Date().toISOString(),
      downloadCount: 0
    };
    setBooklets(prev => [created, ...prev]);
    return created;
  };

  const deleteBooklet = (bookletId: string) => {
    setBooklets(prev => prev.filter(b => b.id !== bookletId));
  };

  const incrementBookletDownloads = (bookletId: string) => {
    setBooklets(prev => prev.map(b => b.id === bookletId ? { ...b, downloadCount: b.downloadCount + 1 } : b));
  };

  const addExam = (newEx: Omit<Exam, 'id'>): Exam => {
    const created: Exam = {
      ...newEx,
      id: `exam-${Date.now()}`
    };
    setExams(prev => [created, ...prev]);
    return created;
  };

  const updateExam = (examId: string, fields: Partial<Exam>) => {
    setExams(prev => prev.map(e => e.id === examId ? { ...e, ...fields } : e));
  };

  const deleteExam = (examId: string) => {
    setExams(prev => prev.filter(e => e.id !== examId));
  };

  const recordSubmission = (newSub: Omit<StudentSubmission, 'id'>): StudentSubmission => {
    const created: StudentSubmission = {
      ...newSub,
      id: `sub-${Date.now()}`
    };
    setSubmissions(prev => [created, ...prev]);
    return created;
  };

  const exportDataAsJson = (): string => {
    const exportObject = {
      app: 'منصة نبوغ التعليمية - جمهورية العراق',
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      adminSettings: {
        instituteName: adminSettings.instituteName,
        supportPhone: adminSettings.supportPhone
      },
      stages,
      subjects,
      lessons,
      questions,
      exams,
      booklets,
      subscriptionPlans,
      paymentSettings,
      studentReviews,
      users,
      submissionsCount: submissions.length
    };
    return JSON.stringify(exportObject, null, 2);
  };

  const importDataFromJson = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.subjects && Array.isArray(parsed.subjects)) setSubjects(parsed.subjects);
      if (parsed.lessons && Array.isArray(parsed.lessons)) setLessons(parsed.lessons);
      if (parsed.questions && Array.isArray(parsed.questions)) setQuestions(parsed.questions);
      if (parsed.exams && Array.isArray(parsed.exams)) setExams(parsed.exams);
      if (parsed.booklets && Array.isArray(parsed.booklets)) setBooklets(parsed.booklets);
      if (parsed.subscriptionPlans && Array.isArray(parsed.subscriptionPlans)) setSubscriptionPlans(parsed.subscriptionPlans);
      if (parsed.paymentSettings) setPaymentSettings(parsed.paymentSettings);
      return true;
    } catch {
      return false;
    }
  };

  const resetToDefaults = () => {
    setSubjects(INITIAL_SUBJECTS);
    setLessons(INITIAL_LESSONS);
    setQuestions(INITIAL_QUESTIONS);
    setExams(INITIAL_EXAMS);
    setBooklets(INITIAL_BOOKLETS);
    setSubmissions(INITIAL_SUBMISSIONS);
    setUsers(INITIAL_USERS);
    setSubscriptionPlans(INITIAL_SUBSCRIPTION_PLANS);
    setPaymentSettings(INITIAL_PAYMENT_SETTINGS);
    setStudentReviews(INITIAL_STUDENT_REVIEWS);
    setAdminSettings(INITIAL_ADMIN_SECURITY);
    setCurrentUser(INITIAL_USERS[0]);
    setSelectedStageId('grade-3-intermediate');
    setIsTeacherUnlocked(false);
    localStorage.clear();
  };

  return (
    <CurriculumContext.Provider
      value={{
        stages,
        subjects,
        lessons,
        questions,
        exams,
        booklets,
        submissions,
        users,
        currentUser,
        selectedStageId,
        soundEnabled,
        activeExam,
        adminSettings,
        isTeacherUnlocked,
        subscriptionPlans,
        paymentSettings,
        studentReviews,
        unlockTeacherPanel,
        lockTeacherPanel,
        changeAdminPasscode,
        updateAdminSettings,
        updateSubscriptionPlan,
        addSubscriptionPlan,
        deleteSubscriptionPlan,
        updatePaymentSettings,
        addStudentReview,
        approveReview,
        toggleFeatureReview,
        deleteReview,
        updateStudentUser,
        deleteStudentUser,
        addNewStudent,
        setSelectedStageId,
        setSoundEnabled,
        setCurrentUser,
        loginWithEmail,
        switchUserRole,
        toggleVipStatus,
        addSubject,
        addLesson,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        toggleQuestionVip,
        addExam,
        updateExam,
        deleteExam,
        recordSubmission,
        setActiveExam,
        addBooklet,
        deleteBooklet,
        incrementBookletDownloads,
        exportDataAsJson,
        importDataFromJson,
        resetToDefaults
      }}
    >
      {children}
    </CurriculumContext.Provider>
  );
};

export const useCurriculum = (): CurriculumContextType => {
  const ctx = useContext(CurriculumContext);
  if (!ctx) {
    throw new Error('useCurriculum must be used within a CurriculumProvider');
  }
  return ctx;
};
