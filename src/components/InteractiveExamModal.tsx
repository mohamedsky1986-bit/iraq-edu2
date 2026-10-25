/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Timer,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Award,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Printer
} from 'lucide-react';
import { Exam, Question, QuestionEvaluationResult } from '../types/curriculum';
import { useCurriculum } from '../context/CurriculumContext';
import { evaluateFillBlankAnswer } from '../utils/fuzzyMatching';
import { soundManager } from '../utils/audioSystem';

interface InteractiveExamModalProps {
  exam: Exam;
  onClose: () => void;
}

export const InteractiveExamModal: React.FC<InteractiveExamModalProps> = ({ exam, onClose }) => {
  const { questions, currentUser, recordSubmission, stages, subjects } = useCurriculum();

  // Load exam questions
  const examQuestions: Question[] = exam.questionIds
    .map(id => questions.find(q => q.id === id))
    .filter((q): q is Question => q !== undefined);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [matchingAnswers, setMatchingAnswers] = useState<Record<string, Record<string, string>>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [timeLeft, setTimeLeft] = useState(exam.durationMinutes * 60);
  const [evaluationResults, setEvaluationResults] = useState<QuestionEvaluationResult[]>([]);
  const [totalScore, setTotalScore] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer countdown
  useEffect(() => {
    if (isSubmitted) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isSubmitted]);

  const currentQ = examQuestions[currentIndex];

  const handleSelectOption = (opt: string) => {
    if (isSubmitted || !currentQ) return;
    soundManager.playClick();
    setAnswers(prev => ({ ...prev, [currentQ.id]: opt }));
  };

  const handleTextChange = (val: string) => {
    if (isSubmitted || !currentQ) return;
    setAnswers(prev => ({ ...prev, [currentQ.id]: val }));
  };

  const handleMatchingChange = (pairId: string, matchedRight: string) => {
    if (isSubmitted || !currentQ) return;
    soundManager.playClick();
    setMatchingAnswers(prev => ({
      ...prev,
      [currentQ.id]: {
        ...(prev[currentQ.id] || {}),
        [pairId]: matchedRight
      }
    }));
  };

  const handleSubmitExam = () => {
    if (isSubmitted) return;
    if (timerRef.current) clearInterval(timerRef.current);

    let earnedScore = 0;
    const results: QuestionEvaluationResult[] = [];

    examQuestions.forEach(q => {
      if (q.type === 'fill_blank') {
        const studentRaw = answers[q.id] || '';
        const accepted = q.acceptedAnswers && q.acceptedAnswers.length > 0
          ? q.acceptedAnswers
          : [q.correctAnswer];
        const evalRes = evaluateFillBlankAnswer(studentRaw, accepted);

        if (evalRes.isCorrect) {
          earnedScore += 1;
        }

        results.push({
          questionId: q.id,
          questionPrompt: q.prompt,
          questionType: q.type,
          studentAnswer: studentRaw || 'لم تجب',
          correctAnswer: evalRes.matchedAnswer || q.correctAnswer,
          isCorrect: evalRes.isCorrect,
          hasTypoAlert: evalRes.hasTypoAlert,
          similarityPercent: evalRes.similarityPercent,
          feedback: evalRes.feedbackMessage + (evalRes.tip ? ` (${evalRes.tip})` : ''),
          explanation: q.explanation
        });
      } else if (q.type === 'mcq' || q.type === 'true_false') {
        const studentChoice = answers[q.id] || '';
        const isCorrect = studentChoice.trim() === q.correctAnswer.trim();
        if (isCorrect) earnedScore += 1;

        results.push({
          questionId: q.id,
          questionPrompt: q.prompt,
          questionType: q.type,
          studentAnswer: studentChoice || 'لم تجب',
          correctAnswer: q.correctAnswer,
          isCorrect,
          hasTypoAlert: false,
          similarityPercent: isCorrect ? 100 : 0,
          feedback: isCorrect ? 'إجابة نموذجية دقيقة! أحسنت.' : `إجابة غير صحيحة. الإجابة الصحيحة هي: «${q.correctAnswer}»`,
          explanation: q.explanation
        });
      } else if (q.type === 'matching') {
        const pairs = q.matchingPairs || [];
        const studentPairs = matchingAnswers[q.id] || {};
        let matchedCorrect = 0;
        pairs.forEach(p => {
          if (studentPairs[p.id] === p.right) {
            matchedCorrect++;
          }
        });
        const isFullyCorrect = pairs.length > 0 && matchedCorrect === pairs.length;
        if (isFullyCorrect) earnedScore += 1;

        results.push({
          questionId: q.id,
          questionPrompt: q.prompt,
          questionType: q.type,
          studentAnswer: `طابق ${matchedCorrect} من أصل ${pairs.length}`,
          correctAnswer: q.correctAnswer,
          isCorrect: isFullyCorrect,
          hasTypoAlert: false,
          similarityPercent: pairs.length > 0 ? Math.round((matchedCorrect / pairs.length) * 100) : 0,
          feedback: isFullyCorrect ? 'تطابق كامل بنسبة 100%!' : `تم مطابقة ${matchedCorrect} من ${pairs.length} بصورة صحيحة.`,
          explanation: q.explanation
        });
      }
    });

    const percentage = examQuestions.length > 0
      ? Math.round((earnedScore / examQuestions.length) * 100)
      : 0;

    setTotalScore(percentage);
    setEvaluationResults(results);
    setIsSubmitted(true);

    // Audio and celebration
    if (percentage >= 60) {
      soundManager.playCelebrationFanfare();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {}
    } else {
      soundManager.playError();
    }

    // Record submission
    const stage = stages.find(s => s.id === exam.stageId);
    const subject = subjects.find(s => s.id === exam.subjectId);

    recordSubmission({
      examId: exam.id,
      examTitle: exam.title,
      studentEmail: currentUser.email,
      studentName: currentUser.name,
      stageId: exam.stageId,
      subjectId: exam.subjectId,
      score: earnedScore,
      totalScore: examQuestions.length,
      percentage,
      completedAt: new Date().toISOString(),
      timeSpentSeconds: exam.durationMinutes * 60 - timeLeft,
      results
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Strip */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                {exam.title}
              </h3>
              <span className="text-xs text-slate-500">
                طالب: {currentUser.name} ({currentUser.email})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Countdown timer */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-bold ${
              timeLeft < 180 ? 'bg-rose-50 text-rose-700 animate-pulse' : 'bg-slate-200 text-slate-700'
            }`}>
              <Timer className="w-4 h-4" />
              <span>{formatTime(timeLeft)}</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              aria-label="إغلاق الامتحان"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {!isSubmitted ? (
            <>
              {/* Progress & Quick Question Navigation Palette (تقديم وتأخير بين سؤال وسؤال) */}
              <div className="space-y-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">التنقل السريع بين الأسئلة:</span>
                    <span className="text-slate-400">|</span>
                    <span>السؤال <strong className="text-slate-900 font-mono">{currentIndex + 1}</strong> من <strong className="text-slate-900 font-mono">{examQuestions.length}</strong></span>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-medium border border-emerald-200/60">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>مجاب: {examQuestions.filter(q => {
                        if (q.type === 'matching') {
                          return Object.keys(matchingAnswers[q.id] || {}).length > 0;
                        }
                        return !!answers[q.id] && answers[q.id].trim().length > 0;
                      }).length}</span>
                    </span>
                    <span className="text-slate-400 font-mono">{Math.round(((currentIndex + 1) / examQuestions.length) * 100)}%</span>
                  </div>
                </div>

                {/* Question Numbers Quick Jumper Bar */}
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  {examQuestions.map((q, idx) => {
                    const isAnswered = q.type === 'matching'
                      ? Object.keys(matchingAnswers[q.id] || {}).length > 0
                      : !!answers[q.id] && answers[q.id].trim().length > 0;
                    const isCurrent = idx === currentIndex;

                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => {
                          setShowHint(false);
                          setCurrentIndex(idx);
                          soundManager.playClick();
                        }}
                        title={`الانتقال إلى السؤال رقم ${idx + 1} (${isAnswered ? 'تمت الإجابة' : 'لم تتم الإجابة بعد'})`}
                        className={`w-9 h-9 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer relative ${
                          isCurrent
                            ? 'bg-emerald-600 text-white ring-2 ring-emerald-500 ring-offset-1 shadow-sm'
                            : isAnswered
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        <span>{idx + 1}</span>
                        {isAnswered && !isCurrent && (
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / examQuestions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Current Question Box */}
              {currentQ ? (
                <div className="bg-slate-50/70 rounded-2xl border border-slate-200 p-6 space-y-6">
                  {/* Question header info */}
                  <div className="flex items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
                    <span className="text-xs font-semibold text-emerald-800 bg-emerald-100/70 px-2.5 py-1 rounded-md">
                      {currentQ.type === 'fill_blank' && 'سؤال فراغات تفاعلي ذكي'}
                      {currentQ.type === 'mcq' && 'سؤال اختيار من متعدد'}
                      {currentQ.type === 'true_false' && 'صح أم خطأ'}
                      {currentQ.type === 'matching' && 'سؤال مطابقة وتوصيل'}
                    </span>
                    <span className="text-xs text-slate-400">
                      مستوى الصعوبة: {currentQ.difficulty}
                    </span>
                  </div>

                  {/* Question Prompt */}
                  <h4 className="text-lg font-bold text-slate-900 leading-relaxed">
                    {currentQ.prompt}
                  </h4>

                  {/* Question Diagram / Image if present */}
                  {currentQ.imageUrl && (
                    <div className="rounded-xl overflow-hidden border border-slate-200 max-h-56">
                      <img
                        src={currentQ.imageUrl}
                        alt="توضيح السؤال"
                        referrerPolicy="no-referrer"
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  )}

                  {/* Render based on Question Type */}
                  {/* 1. SMART FILL-IN-THE-BLANK (مع التسامح الذكي للأخطاء الإملائية وتنبيه الطالب) */}
                  {currentQ.type === 'fill_blank' && (
                    <div className="space-y-4">
                      <label htmlFor="fill-blank-input" className="block text-xs font-semibold text-slate-700">
                        اكتب الإجابة المناسبة في الفراغ:
                      </label>
                      <div className="relative">
                        <input
                          id="fill-blank-input"
                          type="text"
                          dir="rtl"
                          placeholder="اكتب الإجابة هنا (مثال: الكولوم / هوند / القلب)..."
                          value={answers[currentQ.id] || ''}
                          onChange={(e) => handleTextChange(e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-base font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-slate-400 transition-all shadow-2xs"
                        />
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
                        <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>
                          <strong>ميزة التصحيح الذكي:</strong> النظام يتسامح مع الأخطاء الإملائية البسيطة والهمزات، وسينبهك للتصحيح النموذجي دون إنقاص درجتك!
                        </span>
                      </div>
                    </div>
                  )}

                  {/* 2. MCQ */}
                  {currentQ.type === 'mcq' && currentQ.options && (
                    <div className="space-y-2.5">
                      {currentQ.options.map((option, optIdx) => {
                        const isSelected = answers[currentQ.id] === option;
                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectOption(option)}
                            className={`w-full text-right p-4 rounded-xl border text-sm font-semibold transition-all flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                : 'bg-white hover:bg-slate-100/80 text-slate-800 border-slate-200'
                            }`}
                          >
                            <span>{option}</span>
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected ? 'border-white bg-white text-emerald-700' : 'border-slate-300'
                            }`}>
                              {isSelected && <span className="w-2 h-2 rounded-full bg-emerald-700" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* 3. True / False */}
                  {currentQ.type === 'true_false' && (
                    <div className="grid grid-cols-2 gap-4">
                      {['صح', 'خطأ'].map((choice) => {
                        const isSelected = answers[currentQ.id] === choice;
                        return (
                          <button
                            key={choice}
                            onClick={() => handleSelectOption(choice)}
                            className={`py-5 rounded-2xl border text-base font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-200'
                            }`}
                          >
                            <span>{choice}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* 4. Matching Pairs */}
                  {currentQ.type === 'matching' && currentQ.matchingPairs && (
                    <div className="space-y-3">
                      <p className="text-xs text-slate-600 font-medium">اختر الوظيفة / المقابل الصحيح لكل عنصر:</p>
                      {currentQ.matchingPairs.map((pair) => {
                        const selectedVal = (matchingAnswers[currentQ.id] || {})[pair.id] || '';
                        return (
                          <div key={pair.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200 gap-3">
                            <span className="font-bold text-sm text-slate-900 sm:w-1/3">{pair.left}</span>
                            <select
                              value={selectedVal}
                              onChange={(e) => handleMatchingChange(pair.id, e.target.value)}
                              className="w-full sm:w-2/3 bg-slate-50 border border-slate-300 text-xs font-semibold rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-emerald-500"
                            >
                              <option value="">-- اختر المطابقة المناسبة --</option>
                              {currentQ.matchingPairs?.map(p => (
                                <option key={p.id} value={p.right}>{p.right}</option>
                              ))}
                            </select>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Hint Toggle */}
                  {currentQ.hint && (
                    <div className="border-t border-slate-200 pt-3">
                      {showHint ? (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
                          <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <span><strong>تلميح المدرس:</strong> {currentQ.hint}</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowHint(true)}
                          className="text-xs text-amber-700 hover:text-amber-800 font-medium underline cursor-pointer"
                        >
                          هل تحتاج إلى تلميح لحل السؤال؟
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ) : null}

              {/* Navigation buttons: تقديم وتأخير بين سؤال وسؤال */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200/80">
                <button
                  disabled={currentIndex === 0}
                  onClick={() => {
                    setShowHint(false);
                    setCurrentIndex(prev => prev - 1);
                    soundManager.playClick();
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
                    currentIndex === 0
                      ? 'text-slate-300 border border-slate-200 cursor-not-allowed bg-slate-50'
                      : 'text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300/80'
                  }`}
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>تأخير (السؤال السابق)</span>
                </button>

                <div className="flex items-center gap-2">
                  {currentIndex < examQuestions.length - 1 ? (
                    <button
                      onClick={() => {
                        setShowHint(false);
                        setCurrentIndex(prev => prev + 1);
                        soundManager.playClick();
                      }}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
                    >
                      <span>تقديم (السؤال التالي)</span>
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitExam}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm animate-pulse"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>إنهاء الامتحان وتسليم الإجابة</span>
                    </button>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* RESULTS SCREEN WITH SMART FEEDBACK & TYPO ALERTS */
            <div className="space-y-6">
              {/* Score Banner */}
              <div className={`p-6 rounded-3xl text-center space-y-2 border ${
                totalScore >= 75
                  ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                  : totalScore >= 50
                  ? 'bg-amber-50/80 border-amber-300 text-amber-950'
                  : 'bg-rose-50/80 border-rose-300 text-rose-950'
              }`}>
                <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center bg-white shadow-xs">
                  {totalScore >= 75 ? (
                    <Award className="w-10 h-10 text-emerald-600" />
                  ) : totalScore >= 50 ? (
                    <Sparkles className="w-10 h-10 text-amber-600" />
                  ) : (
                    <AlertTriangle className="w-10 h-10 text-rose-600" />
                  )}
                </div>
                <h4 className="text-2xl font-black">
                  {totalScore >= 90
                    ? 'ممتاز جداً! تفوق باهر'
                    : totalScore >= 75
                    ? 'جيد جداً! أداء متميز'
                    : totalScore >= 50
                    ? 'ناجح، وتستحق مراجعة إضافية'
                    : 'حاول مجدداً للوصول إلى درجة النجاح'}
                </h4>
                <div className="text-4xl font-black font-mono tabular-nums my-1">
                  {totalScore}%
                </div>
                <p className="text-xs opacity-85">
                  تم حفظ نتيجتك في سجل المدرس بنجاح. راجع تفاصيل الأخطاء والتنبيهات الإملائية أدناه:
                </p>
              </div>

              {/* Question Breakdown with Typo Alerts */}
              <div className="space-y-4">
                <h5 className="text-sm font-bold text-slate-900">
                  تقرير الإجابات ونموذج التصحيح الذكي ({evaluationResults.length} سؤال):
                </h5>

                {evaluationResults.map((item, idx) => (
                  <div
                    key={item.questionId}
                    className={`p-4 rounded-2xl border text-xs space-y-2 ${
                      item.isCorrect
                        ? item.hasTypoAlert
                          ? 'bg-amber-50/60 border-amber-300'
                          : 'bg-emerald-50/50 border-emerald-200'
                        : 'bg-rose-50/50 border-rose-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2">
                        {item.isCorrect ? (
                          item.hasTypoAlert ? (
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          )
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        )}
                        <span className="font-bold text-slate-900">
                          {idx + 1}. {item.questionPrompt}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md font-semibold shrink-0 ${
                        item.isCorrect
                          ? item.hasTypoAlert
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {item.isCorrect
                          ? item.hasTypoAlert
                            ? 'مقبولة مع تنبيه إملائي'
                            : 'صحيحة 100%'
                          : 'غير صحيحة'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-200/40">
                      <div>
                        <span className="text-slate-500 block">إجابتك المسجلة:</span>
                        <strong className="text-slate-800 font-semibold">{item.studentAnswer}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">الإجابة النموذجية المعتمدة:</span>
                        <strong className="text-emerald-700 font-semibold">{item.correctAnswer}</strong>
                      </div>
                    </div>

                    {/* Educational feedback & Typo Tip */}
                    <div className="p-2.5 rounded-xl bg-white/80 border border-slate-200 text-slate-700">
                      <p className="font-medium">{item.feedback}</p>
                      <p className="text-slate-500 mt-1"><strong>الشرح العلمي:</strong> {item.explanation}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setCurrentIndex(0);
                    setAnswers({});
                    setMatchingAnswers({});
                    setTimeLeft(exam.durationMinutes * 60);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>إعادة الاختبار للتدريب</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>طباعة النتيجة</span>
                  </button>

                  <button
                    onClick={onClose}
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    <span>العودة للمنصة</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
