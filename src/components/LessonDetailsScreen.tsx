import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, BrainCircuit, FileText, Sparkles, MessageCircle, Lightbulb, CheckCircle2, RotateCcw, Clock, ChevronRight, HelpCircle, Eye, EyeOff, BookOpenCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { geminiService } from '../services/geminiService';
import { useAuth } from '../hooks/useAuth';
import { getLessonById } from '../data/curriculum';
import { TEXTBOOK_MATHS_G6 } from '../data/textbookData';
import { getOrCreateTextbookData } from '../lib/textbookGenerator';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';
import { cleanMathText } from '../lib/mathUtils';

export default function LessonDetailsScreen() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { profile, completeLesson } = useAuth();
  
  const lesson = getLessonById(lessonId || '', profile?.studentClass);
  const isCompleted = profile?.completedLessons?.includes(lesson.id) || false;

  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<{ type: 'summary' | 'quiz' | 'flashcards' | 'topics' | 'explanation', data: any } | null>(null);
  const [viewInlinePdf, setViewInlinePdf] = useState<boolean>(false);

  // Premium textbook reading companion states
  const [textbookTab, setTextbookTab] = useState<'reading' | 'practice' | 'solutions' | 'pdf'>('reading');
  const [activeSectionIdx, setActiveSectionIdx] = useState<number>(0);
  const [selectedTryTheseIdx, setSelectedTryTheseIdx] = useState<number | null>(null);
  const [tryTheseAnswers, setTryTheseAnswers] = useState<Record<number, string>>({});
  const [showSolutionIdx, setShowSolutionIdx] = useState<Record<string, boolean>>({});

  // Dedicated states for interactive quiz
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizCurrentIndex, setQuizCurrentIndex] = useState<number>(0);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // NCERT official math chapters mapping to textbook portal PDFs
  const getPdfUrl = () => {
    if (!lesson.id) return null;
    const match = lesson.id.match(/^g(\d+)-([^-]+)-c(\d+)$/);
    if (match) {
      const gradeVal = match[1];
      const subject = match[2];
      const idx = match[3];
      if (gradeVal === '6' && subject === 'maths') {
        const chNum = idx.padStart(2, '0');
        return `https://ncert.nic.in/textbook/pdf/femh1${chNum}.pdf`;
      }
    }
    return null;
  };

  const pdfUrl = getPdfUrl();
  const activePdfUrl = lesson.fileUrl || pdfUrl;
  const textbookData = getOrCreateTextbookData(lesson);

  const isCorrect = (selected: string, correct: string) => {
    if (!selected || !correct) return false;
    const s = selected.trim().toLowerCase();
    const c = correct.trim().toLowerCase();
    return s === c || c.includes(s) || s.includes(c);
  };

  const calculateScore = () => {
    if (!result || result.type !== 'quiz' || !result.data) return 0;
    let score = 0;
    result.data.forEach((q: any, i: number) => {
      if (isCorrect(quizAnswers[i], q.correctAnswer)) {
        score++;
      }
    });
    return score;
  };

  const getReviewDetails = (score: number) => {
    if (score === 10) {
      return {
        title: "Outstanding! Perfect Score! 🏆",
        review: "You've fully mastered this lesson's key concepts with flawless execution. Exemplary academic performance!"
      };
    } else if (score >= 8) {
      return {
        title: "Excellent Work! 🌟",
        review: "Very strong understanding of the topic! You've grasped all the core formulas and logical milestones. Review any small errors."
      };
    } else if (score >= 5) {
      return {
        title: "Good Effort! 👍",
        review: "You have a decent grasp of the basic concepts, but some details need attention. We highly recommend reviewing the AI Summary and retaking."
      };
    } else {
      return {
        title: "Keep Learning! 💪",
        review: "A solid first attempt, but more review will help. Try reading the 'Easy Explanation' or asking the 'AI Tutor' to clear up doubts!"
      };
    }
  };

  const handleAction = async (type: 'summary' | 'quiz' | 'flashcards' | 'topics' | 'explanation') => {
    setLoading(type);
    try {
      if (type === 'summary') {
        const summary = await geminiService.generateSummary(lesson.content);
        setResult({ type, data: summary });
      } else if (type === 'quiz') {
        const quiz = await geminiService.generateQuiz(lesson.content, 10);
        setQuizAnswers({});
        setQuizCurrentIndex(0);
        setQuizSubmitted(false);
        setResult({ type, data: quiz });
      } else if (type === 'flashcards') {
        const flashcards = await geminiService.generateFlashcards(lesson.content);
        setResult({ type, data: flashcards });
      } else if (type === 'topics') {
        const topics = await geminiService.generateTopics(lesson.content);
        setResult({ type, data: topics });
      } else if (type === 'explanation') {
        const explanation = await geminiService.generateExplanation(lesson.content);
        setResult({ type, data: explanation });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-12">
      {/* Content Area */}
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between mb-2">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-slate-500 hover:text-brand-primary transition-all font-bold text-xs uppercase tracking-widest group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>
          
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">AI Learning Active</span>
          </div>
        </div>

        <div className="bg-white rounded-[3rem] overflow-hidden border border-slate-100 shadow-sm">
          <div className="p-8 md:p-12 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="w-20 h-20 bg-brand-primary/10 text-brand-primary rounded-[2rem] flex items-center justify-center shrink-0">
                <BookOpen className="w-10 h-10" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold text-brand-secondary uppercase tracking-widest bg-brand-secondary/10 px-2 py-0.5 rounded">{lesson.subjectId.toUpperCase()} Unit</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mastery Level: Advanced</span>
                </div>
                <h2 className="text-4xl font-display font-bold text-slate-900 tracking-tight">{lesson.title}</h2>
              </div>
            </div>
                  {/* Textbook PDF Link section / Interactive Textbook Reader */}
            {textbookData ? (
              <div className="space-y-6">
                {/* Mode Selector Tabs */}
                <div className="flex border-b border-slate-100 pb-px gap-2 overflow-x-auto scroller-none">
                  <button
                    onClick={() => setTextbookTab('reading')}
                    className={cn(
                      "pb-4 px-4 font-display font-bold text-xs uppercase tracking-wider transition-all border-b-2 whitespace-nowrap flex items-center gap-2 cursor-pointer outline-none",
                      (textbookTab === 'reading' || (textbookTab !== 'practice' && textbookTab !== 'solutions' && textbookTab !== 'pdf'))
                        ? "border-brand-primary text-brand-primary font-extrabold"
                        : "border-transparent text-slate-400 hover:text-slate-600"
                    )}
                  >
                    <BookOpen className="w-4 h-4" />
                    📖 Interactive Textbook
                  </button>
                  <button
                    onClick={() => setTextbookTab('practice')}
                    className={cn(
                      "pb-4 px-4 font-display font-bold text-xs uppercase tracking-wider transition-all border-b-2 whitespace-nowrap flex items-center gap-2 cursor-pointer outline-none",
                      textbookTab === 'practice'
                        ? "border-brand-primary text-brand-primary font-extrabold"
                        : "border-transparent text-slate-400 hover:text-slate-600"
                    )}
                  >
                    <HelpCircle className="w-4 h-4" />
                    📝 "Try These" Exercises
                  </button>
                  <button
                    onClick={() => setTextbookTab('solutions')}
                    className={cn(
                      "pb-4 px-4 font-display font-bold text-xs uppercase tracking-wider transition-all border-b-2 whitespace-nowrap flex items-center gap-2 cursor-pointer outline-none",
                      textbookTab === 'solutions'
                        ? "border-brand-primary text-brand-primary font-extrabold"
                        : "border-transparent text-slate-400 hover:text-slate-600"
                    )}
                  >
                    <BookOpenCheck className="w-4 h-4" />
                    💡 Solved Solutions
                  </button>
                  {activePdfUrl && (
                    <button
                      onClick={() => setTextbookTab('pdf')}
                      className={cn(
                        "pb-4 px-4 font-display font-bold text-xs uppercase tracking-wider transition-all border-b-2 whitespace-nowrap flex items-center gap-2 cursor-pointer outline-none",
                        textbookTab === 'pdf'
                          ? "border-brand-primary text-brand-primary font-extrabold"
                          : "border-transparent text-slate-400 hover:text-slate-600"
                      )}
                    >
                      <FileText className="w-4 h-4" />
                      📄 Official PDF Guide
                    </button>
                  )}
                </div>

                {(textbookTab === 'reading' || (textbookTab !== 'practice' && textbookTab !== 'solutions' && textbookTab !== 'pdf')) && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-2">
                    {/* Left Sidebar Sections Navigation */}
                    <div className="md:col-span-4 space-y-2 border-r border-slate-50 pr-4">
                      <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-3 mb-3">Chapter Sections</p>
                      {textbookData.sections.map((sec, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveSectionIdx(idx)}
                          className={cn(
                            "w-full text-left p-3.5 rounded-2xl transition-all flex flex-col gap-1 cursor-pointer",
                            activeSectionIdx === idx
                              ? "bg-brand-primary/5 text-brand-primary border border-brand-primary/15 shadow-sm font-bold"
                              : "text-slate-600 hover:bg-slate-50 border border-transparent"
                          )}
                        >
                          <span className="font-display font-bold text-xs leading-tight">{sec.title}</span>
                          {sec.subtitle && <span className="text-[9px] opacity-75 font-semibold uppercase">{sec.subtitle}</span>}
                        </button>
                      ))}
                    </div>

                    {/* Right Content reading panel */}
                    <div className="md:col-span-8 bg-slate-50/50 p-6 md:p-8 rounded-[2.5rem] border border-slate-100 min-h-[400px]">
                      <h3 className="font-display font-bold text-xl text-slate-900 mb-1">
                        {textbookData.sections[activeSectionIdx]?.title}
                      </h3>
                      {textbookData.sections[activeSectionIdx]?.subtitle && (
                        <p className="text-[10px] text-brand-secondary font-bold uppercase tracking-wider mb-6">
                          {textbookData.sections[activeSectionIdx]?.subtitle}
                        </p>
                      )}
                      
                      <div className="markdown-body prose prose-slate text-sm text-slate-700 leading-relaxed space-y-4">
                        <ReactMarkdown>
                          {cleanMathText(textbookData.sections[activeSectionIdx]?.markdown || '')}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </div>
                )}

                {textbookTab === 'practice' && (
                  <div className="pt-2 space-y-6">
                    <div className="p-6 bg-brand-primary/5 rounded-3xl border border-brand-primary/10 flex items-start gap-4">
                      <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-2xl">
                        <HelpCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-sm text-slate-900">Textbook "Try These" Questions</h4>
                        <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                          These are the actual critical questions printed inside your NCERT textbook! Try making your selections and check the answers dynamically.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Left: Questions list */}
                      <div className="space-y-2">
                        {textbookData.tryThese.map((q, idx) => {
                          const isAnswered = tryTheseAnswers[idx] !== undefined;
                          const isCorrectChoice = tryTheseAnswers[idx] === q.correct;
                          return (
                            <button
                              key={idx}
                              onClick={() => setSelectedTryTheseIdx(idx)}
                              className={cn(
                                "w-full text-left p-4 rounded-2xl border text-xs font-bold transition-all flex items-center justify-between gap-3 cursor-pointer",
                                selectedTryTheseIdx === idx
                                  ? "bg-slate-900 border-slate-900 text-white shadow-lg"
                                  : isAnswered
                                    ? isCorrectChoice
                                      ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                                      : "bg-rose-50 border-rose-100 text-rose-800"
                                    : "bg-white border-slate-100 text-slate-600 hover:border-slate-300"
                              )}
                            >
                              <span className="line-clamp-2">Question {idx + 1}</span>
                              {isAnswered && (
                                <span className={cn(
                                  "text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shrink-0",
                                  isCorrectChoice ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                                )}>
                                  {isCorrectChoice ? "Correct" : "Try Again"}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Right: Selected Question Explainer */}
                      <div className="md:col-span-2 bg-slate-50 p-6 md:p-8 rounded-[2rem] border border-slate-100 min-h-[300px] flex flex-col justify-between">
                        {selectedTryTheseIdx !== null ? (
                          <div className="space-y-6">
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Interactive Problem {selectedTryTheseIdx + 1}</p>
                              <h4 className="font-display font-semibold text-base text-slate-900 leading-relaxed">
                                {cleanMathText(textbookData.tryThese[selectedTryTheseIdx].question)}
                              </h4>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {textbookData.tryThese[selectedTryTheseIdx].options.map((opt, i) => {
                                const isSelected = tryTheseAnswers[selectedTryTheseIdx!] === opt;
                                const isCorrectOpt = opt === textbookData.tryThese[selectedTryTheseIdx!].correct;
                                const hasAnswered = tryTheseAnswers[selectedTryTheseIdx!] !== undefined;

                                return (
                                  <button
                                    key={i}
                                    onClick={() => {
                                      setTryTheseAnswers(prev => ({ ...prev, [selectedTryTheseIdx!]: opt }));
                                    }}
                                    className={cn(
                                      "p-4 rounded-xl border text-xs font-bold transition-all text-left flex items-center justify-between cursor-pointer",
                                      isSelected
                                        ? isCorrectOpt
                                          ? "bg-emerald-600 border-emerald-600 text-white"
                                          : "bg-rose-600 border-rose-600 text-white"
                                        : hasAnswered && isCorrectOpt
                                          ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                                          : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                                    )}
                                  >
                                    <span>{cleanMathText(opt)}</span>
                                    {isSelected && <span className="text-[10px]">✔</span>}
                                  </button>
                                );
                              })}
                            </div>

                            {tryTheseAnswers[selectedTryTheseIdx] !== undefined && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2"
                              >
                                <div className="flex items-center gap-2">
                                  <div className={cn(
                                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0",
                                    tryTheseAnswers[selectedTryTheseIdx] === textbookData.tryThese[selectedTryTheseIdx].correct
                                      ? "bg-emerald-100 text-emerald-600"
                                      : "bg-rose-100 text-rose-600"
                                  )}>
                                    i
                                  </div>
                                  <span className="text-xs font-extrabold text-slate-800">
                                    {tryTheseAnswers[selectedTryTheseIdx] === textbookData.tryThese[selectedTryTheseIdx].correct
                                      ? "Correct choice!"
                                      : "Incorrect. Try again or read the step list below."}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-550 leading-relaxed font-semibold pr-4">
                                  {cleanMathText(textbookData.tryThese[selectedTryTheseIdx].explanation)}
                                </p>
                              </motion.div>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-center py-12 text-slate-400">
                            <HelpCircle className="w-12 h-12 stroke-[1.5] mb-2 text-slate-300 animate-pulse" />
                            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Select a question on the left to start practice</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {textbookTab === 'solutions' && (
                  <div className="pt-2 space-y-6">
                    <div className="p-6 bg-emerald-500/5 rounded-3xl border border-emerald-500/10 flex items-start gap-4">
                      <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-2xl">
                        <BookOpenCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-sm text-slate-900">NCERT Solved Exercise Sheets</h4>
                        <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                          Master every exercise from your Class VI math textbook. Click on any question to view its step-by-step logical mathematical derivation.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-8">
                      {textbookData.exercises.map((ex, exIdx) => (
                        <div key={exIdx} className="space-y-4">
                          <h3 className="font-display font-extrabold text-sm uppercase tracking-wide text-slate-500 border-l-4 border-slate-900 pl-3">
                            {ex.name}
                          </h3>

                          <div className="space-y-3">
                            {ex.questions.map((q, qIdx) => {
                              const key = `${exIdx}-${qIdx}`;
                              const shown = showSolutionIdx[key] || false;

                              return (
                                <div key={qIdx} className="bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                                  <div className="p-5 flex items-start justify-between gap-4">
                                    <div className="space-y-1 pr-4">
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Question {qIdx + 1}</p>
                                      <p className="font-bold text-xs text-slate-800 leading-relaxed pr-2">{cleanMathText(q.q)}</p>
                                    </div>
                                    <button
                                      onClick={() => setShowSolutionIdx(prev => ({ ...prev, [key]: !shown }))}
                                      className={cn(
                                        "px-4 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-all outline-none border cursor-pointer shrink-0 shadow-sm",
                                        shown 
                                          ? "bg-slate-900 border-slate-950 text-white" 
                                          : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
                                      )}
                                    >
                                      {shown ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                      {shown ? "Hide Ans" : "Show Solution"}
                                    </button>
                                  </div>

                                  {shown && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      className="bg-white border-t border-slate-100 p-6 space-y-4"
                                    >
                                      <div className="space-y-11">
                                        <div className="inline-block min-w-[200px] bg-emerald-50 px-5 py-3 rounded-2xl border border-emerald-100">
                                          <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Final Answer</p>
                                          <p className="font-extrabold text-xs text-slate-900 whitespace-pre-wrap">
                                            {cleanMathText(q.ans)}
                                          </p>
                                        </div>
                                      </div>

                                      {q.steps && q.steps.length > 0 && (
                                        <div className="space-y-2 pt-2 border-t border-slate-50">
                                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Step-by-step Solution</p>
                                          <ol className="list-decimal pl-5 text-xs text-slate-600 space-y-2 font-medium pr-4 leading-relaxed">
                                            {q.steps.map((step, sI) => (
                                              <li key={sI}>{cleanMathText(step)}</li>
                                            ))}
                                          </ol>
                                        </div>
                                      )}
                                    </motion.div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {textbookTab === 'pdf' && activePdfUrl && (
                  <div className="pt-2 space-y-6">
                    {/* Modern Secure PDF Player */}
                    <div className="p-6 bg-brand-primary/5 rounded-3xl border border-brand-primary/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-2xl shrink-0">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-display font-bold text-sm text-slate-900">Official Textbook PDF Embed</h4>
                          <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                            Rendered directly in security containers. If you cannot see it, use the controls on the right.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <a 
                          href={activePdfUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1.5 shadow-sm"
                        >
                          Open PDF in New Secure Tab ↗
                        </a>
                        <button 
                          onClick={() => setTextbookTab('reading')}
                          className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          Use In-App Reader 📖
                        </button>
                      </div>
                    </div>

                    <div className="overflow-hidden border border-slate-100 rounded-[2.5rem] bg-slate-900 shadow-xl relative min-h-[600px] flex flex-col">
                      <div className="bg-slate-950 px-6 py-4 flex items-center justify-between border-b border-white/5 select-none text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest ml-3">PDF DOCUMENT VIEWER</span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {lesson.title}
                        </div>
                      </div>
                      
                      <object
                        data={activePdfUrl}
                        type="application/pdf"
                        className="w-full h-[650px] bg-white border-0"
                      >
                        <iframe 
                          src={`https://docs.google.com/gview?url=${encodeURIComponent(activePdfUrl)}&embedded=true`}
                          className="w-full h-[650px] bg-white border-0" 
                          title={`${lesson.title} PDF Document Reader`}
                        />
                      </object>

                      <div className="bg-slate-950 p-4 text-center border-t border-white/5 text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                        Secure Frame • {activePdfUrl.slice(0, 60)}...
                      </div>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-6 border border-slate-100 space-y-4">
                      <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">💡 Troubleshooting PDF Display</p>
                      <ul className="list-disc pl-5 text-xs text-slate-500 space-y-2 leading-relaxed">
                        <li><strong>Cookie & CORS Block:</strong> If the PDF box appears dark, the server has disallowed native loading. Bypassed instantly by using <strong>"Open PDF in New Secure Tab ↗"</strong>.</li>
                        <li><strong>Standard Copy View:</strong> Switching back to <strong>"Interactive Textbook"</strong> will show all formatted formulas, textbook definitions, and step-by-step math sections directly.</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Fallback standard lesson view if no direct textbook data is available
              <div className="space-y-6">
                {activePdfUrl && (
                  <div className="flex border-b border-slate-100 pb-px gap-2 overflow-x-auto scroller-none">
                    <button
                      onClick={() => setTextbookTab('reading')}
                      className={cn(
                        "pb-4 px-4 font-display font-bold text-xs uppercase tracking-wider transition-all border-b-2 whitespace-nowrap flex items-center gap-2 cursor-pointer outline-none",
                        (textbookTab === 'reading' || (textbookTab !== 'pdf'))
                          ? "border-brand-primary text-brand-primary font-extrabold"
                          : "border-transparent text-slate-400 hover:text-slate-600"
                      )}
                    >
                      <BookOpen className="w-4 h-4" />
                      📖 In-App Lesson Guide
                    </button>
                    <button
                      onClick={() => setTextbookTab('pdf')}
                      className={cn(
                        "pb-4 px-4 font-display font-bold text-xs uppercase tracking-wider transition-all border-b-2 whitespace-nowrap flex items-center gap-2 cursor-pointer outline-none",
                        textbookTab === 'pdf'
                          ? "border-brand-primary text-brand-primary font-extrabold"
                          : "border-transparent text-slate-400 hover:text-slate-600"
                      )}
                    >
                      <FileText className="w-4 h-4" />
                      📄 Official PDF Document
                    </button>
                  </div>
                )}

                {(textbookTab !== 'pdf' || !activePdfUrl) && (
                  <div className="prose prose-slate max-w-none bg-slate-50/80 p-8 rounded-[2.5rem] border border-slate-100 relative">
                    <div className="absolute top-6 right-8 text-slate-200 select-none">
                       <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                         <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C20.1216 16 21.017 16.8954 21.017 18V21C21.017 22.1046 20.1216 23 19.017 23H16.017C14.9124 23 14.017 22.1046 14.017 21ZM14.017 13C14.017 11.8954 14.9124 11 16.017 11H19.017C20.1216 11 21.017 11.8954 21.017 13V16C21.017 17.1046 20.1216 18 19.017 18H16.017C14.9124 18 14.017 17.1046 14.017 16V13ZM14.017 5L14.017 2C14.017 0.895431 14.9124 0 16.017 0H19.017C20.1216 0 21.017 0.895431 21.017 2V5C21.017 6.10457 20.1216 7 19.017 7H16.017C14.9124 7 14.017 6.10457 14.017 5V5ZM3.01704 21L3.01704 18C3.01704 16.8954 3.91247 16 5.01704 16H8.01704C9.12161 16 10.017 16.8954 10.017 18V21C10.017 22.1046 9.12161 23 8.01704 23H5.01704C3.91247 23 3.01704 22.1046 3.01704 21ZM3.01704 13C3.01704 11.8954 3.91247 11 5.01704 11H8.01704C9.12161 11 10.017 11.8954 10.017 13V16C10.017 17.1046 9.12161 18 8.01704 18H5.01704C3.91247 18 3.01704 17.1046 3.01704 16V13ZM3.01704 5L3.01704 2C3.01704 0.895431 3.91247 0 5.01704 0H8.01704C9.12161 0 10.017 0.895431 10.017 2V5C10.017 6.10457 9.12161 7 8.01704 7H5.01704C3.91247 7 3.01704 6.10457 3.01704 5V5Z" />
                       </svg>
                    </div>
                    <div className="relative z-10 whitespace-pre-wrap text-slate-700 leading-relaxed font-medium">
                      {lesson.content}
                    </div>
                  </div>
                )}

                {textbookTab === 'pdf' && activePdfUrl && (
                  <div className="pt-2 space-y-6">
                    {/* Fallback Non-textbook inline PDF Document Viewer */}
                    <div className="p-6 bg-brand-primary/5 rounded-3xl border border-brand-primary/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fadeIn">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-brand-primary/10 text-brand-primary rounded-2xl shrink-0">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-display font-bold text-sm text-slate-900">Official Document Reader</h4>
                          <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                            Viewing custom/uploaded document. Standard controls are embedded directly below.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <a 
                          href={activePdfUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all inline-flex items-center gap-1.5 shadow-sm"
                        >
                          Open PDF in New Secure Tab ↗
                        </a>
                      </div>
                    </div>

                    <div className="overflow-hidden border border-slate-100 rounded-[2.5rem] bg-slate-900 shadow-xl relative min-h-[600px] flex flex-col">
                      <div className="bg-slate-950 px-6 py-4 flex items-center justify-between border-b border-white/5 select-none text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest ml-3">PDF RENDER STREAM</span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {lesson.title}
                        </div>
                      </div>
                      
                      <object
                        data={activePdfUrl}
                        type="application/pdf"
                        className="w-full h-[650px] bg-white border-0"
                      >
                        <iframe 
                          src={`https://docs.google.com/gview?url=${encodeURIComponent(activePdfUrl)}&embedded=true`}
                          className="w-full h-[650px] bg-white border-0" 
                          title={`${lesson.title} PDF Reader`}
                        />
                      </object>

                      <div className="bg-slate-950 p-4 text-center border-t border-white/5 text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                        Document Frame • {activePdfUrl.slice(0, 60)}...
                      </div>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-6 border border-slate-100 space-y-4">
                      <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">💡 Troubleshooting PDF Display</p>
                      <ul className="list-disc pl-5 text-xs text-slate-500 space-y-2 leading-relaxed">
                        <li>If the browser rejects standard page rendering, click <strong>"Open PDF in New Secure Tab ↗"</strong> at the top to access the raw document securely or download it to your device.</li>
                        <li>Alternatively, you can toggle back to <strong>"In-App Lesson Guide"</strong> to read the complete text materials without any external connection.</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
               <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                  <Clock className="w-4 h-4" /> Est. Time: 15-20 min
               </div>
               
               {isCompleted ? (
                 <div className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-600 rounded-2xl font-bold border border-emerald-200">
                    <span>Completed</span>
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                 </div>
               ) : (
                 <button 
                    onClick={async () => {
                      if (lesson.id) {
                        await completeLesson(lesson.id);
                      }
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-emerald-600 transition-all active:scale-95 shadow-xl shadow-slate-900/10 cursor-pointer"
                 >
                    Mark as Complete
                    <CheckCircle2 className="w-5 h-5" />
                 </button>
               )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Sidebar */}
      <aside className="w-full lg:w-96 space-y-6">
        <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm sticky top-24">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-display font-bold text-xl">Learning Studio</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <ActionButton 
              icon={FileText} 
              label="Summary" 
              onClick={() => handleAction('summary')} 
              loading={loading === 'summary'}
              color="text-indigo-600 bg-indigo-50 hover:bg-indigo-100"
            />
            <ActionButton 
              icon={BrainCircuit} 
              label="Quiz" 
              onClick={() => handleAction('quiz')} 
              loading={loading === 'quiz'}
              color="text-rose-600 bg-rose-50 hover:bg-rose-100"
            />
            <ActionButton 
              icon={Lightbulb} 
              label="Flashcards" 
              onClick={() => handleAction('flashcards')} 
              loading={loading === 'flashcards'}
              color="text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
            />
            <ActionButton 
              icon={Sparkles} 
              label="Explanation" 
              onClick={() => handleAction('explanation')} 
              loading={loading === 'explanation'}
              color="text-amber-600 bg-amber-50 hover:bg-amber-100"
            />
            <ActionButton 
              icon={CheckCircle2} 
              label="Topics" 
              onClick={() => handleAction('topics')} 
              loading={loading === 'topics'}
              color="text-blue-600 bg-blue-50 hover:bg-blue-100"
            />
            <ActionButton 
              icon={MessageCircle} 
              label="AI Tutor" 
              onClick={() => navigate('/chat')} 
              color="text-brand-primary bg-brand-primary/5 hover:bg-brand-primary/10"
            />
          </div>

          <div className="mt-8 pt-8 border-t border-slate-50">
             <div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-4 group cursor-pointer hover:bg-slate-100 transition-all">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover:text-brand-primary transition-colors">
                   <ChevronRight className="w-6 h-6" />
                </div>
                <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Next Lesson</p>
                   <p className="text-sm font-bold text-slate-900">Polynomials Basics</p>
                </div>
             </div>
          </div>
        </div>

        {/* AI Output (Floating/Side) */}
        <AnimatePresence>
          {result && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[2.5rem] p-8 border-2 border-brand-primary/10 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4">
                 <button onClick={() => setResult(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                   <RotateCcw className="w-5 h-5" />
                 </button>
              </div>

              {result.type === 'summary' && (
                <div className="space-y-6">
                  <h3 className="font-display font-bold text-xl flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-brand-primary" />
                    AI Summary
                  </h3>
                  <div className="markdown-body text-sm text-slate-700 bg-brand-primary/5 p-6 rounded-2xl border border-brand-primary/10">
                    <ReactMarkdown>{cleanMathText(result.data)}</ReactMarkdown>
                  </div>
                </div>
              )}

              {result.type === 'topics' && (
                <div className="space-y-6">
                  <h3 className="font-display font-bold text-xl flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-blue-500" />
                    Important Topics
                  </h3>
                  <div className="markdown-body text-sm text-slate-700 bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                    <ReactMarkdown>{cleanMathText(result.data)}</ReactMarkdown>
                  </div>
                </div>
              )}

              {result.type === 'explanation' && (
                <div className="space-y-6">
                  <h3 className="font-display font-bold text-xl flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                    Easy Explanation
                  </h3>
                  <div className="markdown-body text-sm text-slate-700 bg-amber-50/50 p-6 rounded-2xl border border-amber-100">
                    <ReactMarkdown>{cleanMathText(result.data)}</ReactMarkdown>
                  </div>
                </div>
              )}

              {result.type === 'quiz' && (
                <div className="space-y-6">
                  {/* Header with Progress Bar */}
                  <div className="flex items-center justify-between">
                     <h3 className="font-display font-bold text-xl flex items-center gap-2 text-slate-900">
                       <BrainCircuit className="w-5 h-5 text-rose-500" />
                       Interactive Quiz
                     </h3>
                     <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                       {quizSubmitted ? "Review" : `${quizCurrentIndex + 1} / ${result.data.length}`}
                     </span>
                  </div>

                  {!quizSubmitted ? (
                    // Quiz Play Mode
                    <div className="space-y-6">
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-rose-500 transition-all duration-300"
                          style={{ width: `${((quizCurrentIndex + 1) / result.data.length) * 100}%` }}
                        />
                      </div>

                      {/* Question Box */}
                      <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 space-y-4">
                        <p className="font-display font-semibold text-base text-slate-800 leading-relaxed">
                          {result.data[quizCurrentIndex]?.question}
                        </p>
                      </div>

                      {/* Options List */}
                      <div className="space-y-3">
                        {result.data[quizCurrentIndex]?.options.map((option: string, index: number) => {
                          const isSelected = quizAnswers[quizCurrentIndex] === option;
                          return (
                            <button
                              key={index}
                              onClick={() => {
                                setQuizAnswers(prev => ({ ...prev, [quizCurrentIndex]: option }));
                              }}
                              className={cn(
                                "w-full text-left p-4 rounded-2xl border font-medium text-sm transition-all flex items-center justify-between group",
                                isSelected 
                                  ? "bg-rose-50 border-rose-200 text-rose-700 shadow-sm shadow-rose-100" 
                                  : "bg-white border-slate-100 text-slate-600 hover:border-slate-300 hover:bg-slate-50/50"
                              )}
                            >
                              <span className="flex-1 pr-4">{option}</span>
                              <div className={cn(
                                "w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all",
                                isSelected 
                                  ? "border-rose-500 bg-rose-500 text-white" 
                                  : "border-slate-300 group-hover:border-slate-400"
                              )}>
                                {isSelected && <div className="w-2.5 h-2.5 bg-rose-500 rounded-full" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Navigation Controls */}
                      <div className="flex items-center justify-between pt-2">
                        <button
                          disabled={quizCurrentIndex === 0}
                          onClick={() => setQuizCurrentIndex(prev => prev - 1)}
                          className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-all"
                        >
                          Previous
                        </button>

                        {quizCurrentIndex < result.data.length - 1 ? (
                          <button
                            disabled={!quizAnswers[quizCurrentIndex]}
                            onClick={() => setQuizCurrentIndex(prev => prev + 1)}
                            className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all disabled:opacity-40 disabled:pointer-events-none"
                          >
                            Next
                          </button>
                        ) : (
                          <button
                            disabled={Object.keys(quizAnswers).length < result.data.length}
                            onClick={() => {
                              setQuizSubmitted(true);
                              if (calculateScore() >= 8 && lesson.id) {
                                completeLesson(lesson.id);
                              }
                            }}
                            className="px-8 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-rose-100 disabled:opacity-40"
                          >
                            Submit Quiz
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    // Quiz Review and Score Mode
                    <div className="space-y-6">
                      {/* Score Summary Card */}
                      {(() => {
                        const score = calculateScore();
                        const percent = Math.round((score / result.data.length) * 100);
                        const reviewDetails = getReviewDetails(score);

                        return (
                          <div className="text-center p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-4">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Your Result</p>
                            
                            {/* Visual Progress Bar-style percentage indicator */}
                            <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                              <svg className="w-full h-full transform -rotate-90">
                                <circle
                                  cx="56"
                                  cy="56"
                                  r="46"
                                  stroke="#f1f5f9"
                                  strokeWidth="8"
                                  fill="transparent"
                                />
                                <circle
                                  cx="56"
                                  cy="56"
                                  r="46"
                                  stroke={percent >= 80 ? "#10b981" : percent >= 50 ? "#f59e0b" : "#ef4444"}
                                  strokeWidth="8"
                                  fill="transparent"
                                  strokeDasharray={2 * Math.PI * 46}
                                  strokeDashoffset={2 * Math.PI * 46 * (1 - percent / 100)}
                                  className="transition-all duration-1000 ease-out"
                                />
                              </svg>
                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-display font-extrabold text-slate-950">{score}</span>
                                <span className="text-[10px] font-bold text-slate-400">out of {result.data.length}</span>
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <h4 className="font-display font-bold text-lg text-slate-900">{reviewDetails.title}</h4>
                              <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                                {reviewDetails.review}
                              </p>
                            </div>

                            <div className="pt-2">
                              <button
                                onClick={() => {
                                  setQuizAnswers({});
                                  setQuizCurrentIndex(0);
                                  setQuizSubmitted(false);
                                }}
                                className="px-6 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
                              >
                                Retake Quiz
                              </button>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Question-by-Question Review with Explanations */}
                      <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                        <h4 className="font-display font-extrabold text-sm text-slate-900 uppercase tracking-wider">Answer Review</h4>
                        
                        {result.data.map((q: any, i: number) => {
                          const selected = quizAnswers[i];
                          const correct = q.correctAnswer;
                          const correctMatched = isCorrect(selected, correct);

                          return (
                            <div key={i} className="p-4 bg-white rounded-2xl border border-slate-100 space-y-3">
                              <div className="flex items-start justify-between gap-3">
                                <span className="text-xs font-bold text-slate-400 shrink-0 mt-0.5">Q{i + 1}</span>
                                <p className="font-bold text-xs text-slate-800 leading-relaxed flex-1">{q.question}</p>
                                <span className={cn(
                                  "text-[10px] font-bold uppercase px-2 py-0.5 rounded shrink-0",
                                  correctMatched 
                                    ? "bg-emerald-50 text-emerald-600" 
                                    : "bg-rose-50 text-rose-600"
                                )}>
                                  {correctMatched ? "Correct" : "Incorrect"}
                                </span>
                              </div>

                              <div className="space-y-1 text-xs">
                                <p className="text-slate-500">
                                  Your answer: <span className={cn("font-semibold", correctMatched ? "text-emerald-600" : "text-rose-600")}>{selected || "None"}</span>
                                </p>
                                {!correctMatched && (
                                  <p className="text-slate-500">
                                    Correct answer: <span className="font-semibold text-emerald-600">{correct}</span>
                                  </p>
                                )}
                              </div>

                              <div className="p-3 bg-slate-50 rounded-xl border border-dotted border-slate-200">
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-sans">Explanation</p>
                                 <p className="text-[11px] text-slate-600 leading-relaxed font-medium">{q.explanation}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {result.type === 'flashcards' && (
                <div className="space-y-6">
                   <h3 className="font-display font-bold text-xl">Flashcards</h3>
                   <div className="space-y-4">
                    {result.data.map((f: any, i: number) => (
                      <Flashcard key={i} front={f.front} back={f.back} />
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </aside>
    </div>
  );
}

function ActionButton({ icon: Icon, label, onClick, loading, color }: { icon: any, label: string, onClick: () => void, loading?: boolean, color: string }) {
  return (
    <button 
      onClick={onClick}
      disabled={loading}
      className={cn(
        "flex flex-col items-center gap-2 p-4 rounded-2xl transition-all card-hover group disabled:opacity-50 disabled:scale-100",
        color
      )}
    >
      <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-1">
        {loading ? (
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <Icon className="w-6 h-6" />
        )}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-tight text-center">{label}</span>
    </button>
  );
}

function Flashcard({ front, back }: { front: string, back: string }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div 
      className="perspective-1000 h-40 cursor-pointer group"
      onClick={() => setFlipped(!flipped)}
    >
      <motion.div 
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
        className="relative w-full h-full transform-style-3d shadow-sm"
      >
        <div className="absolute inset-0 backface-hidden bg-white border border-slate-200 rounded-2xl p-6 flex items-center justify-center text-center">
          <p className="font-bold text-slate-800">{front}</p>
        </div>
        <div className="absolute inset-0 backface-hidden bg-brand-primary text-white border border-brand-primary rounded-2xl p-6 flex items-center justify-center text-center rotate-y-180">
          <p className="font-medium">{back}</p>
        </div>
      </motion.div>
    </div>
  );
}
