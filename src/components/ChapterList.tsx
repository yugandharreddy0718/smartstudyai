import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, BookOpen, CheckCircle2, Play, Trophy, GraduationCap, Sparkles, ChevronRight } from 'lucide-react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';
import { getChaptersBySubject, checkLessonLock, calculateSubjectProgress } from '../data/curriculum';
import { StudentClass } from '../types';

export default function ChapterList() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const { profile, setStudentClass } = useAuth();

  const subjectKey = subjectId || 'maths';
  const currentGrade = profile?.studentClass || '8';
  
  // Always query grade on entering a subject to ensure accurate curriculum leveling
  const [showGradeModal, setShowGradeModal] = useState(true);

  const chapters = getChaptersBySubject(subjectKey, currentGrade);
  const subjectName = subjectKey.charAt(0).toUpperCase() + subjectKey.slice(1);
  const completed = profile?.completedLessons || [];
  const doneCount = chapters.filter(c => completed.includes(c.id)).length;
  const masteryProgress = calculateSubjectProgress(subjectKey, completed, currentGrade);

  const handleSelectGrade = async (grade: string) => {
    await setStudentClass(grade as StudentClass);
    setShowGradeModal(false);
  };

  const gradeDetails: Record<string, string> = {
    "1": "Introductory Basics & Counting",
    "2": "Elementary Sums & Shapes",
    "3": "Tables, Fractions & Charts",
    "4": "Long Division & Surface Measures",
    "5": "Decimals, Protractor Angles & Shapes",
    "6": "Algebras & Negative Numbers",
    "7": "Rational Figures & Pythagoras Theorem",
    "8": "Exponents, Powers & Quadrilaterals",
    "9": "Irrational Surds & Identities",
    "10": "Prime Factorizations, Quadratic Systems"
  };

  return (
    <div className="space-y-8 pb-32 relative">
      {/* Grade Confirmation Modal Overlap */}
      <AnimatePresence>
        {showGradeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[3rem] w-full max-w-2xl p-8 border border-slate-100 shadow-2xl relative overflow-hidden text-left"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -translate-y-1/2 translate-x-1/2 -z-10" />

              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-display font-bold text-slate-900 flex items-center gap-2">
                    Select Your Grade level
                    <Sparkles className="w-5 h-5 text-indigo-500 fill-indigo-505" />
                  </h3>
                  <p className="text-sm text-slate-400 font-medium mt-1">
                    Choose a grade to calibrate curriculum, chapters, and quizzes for <span className="text-indigo-600 font-bold">{subjectName}</span>.
                  </p>
                </div>
              </div>

              {/* Grid of Grades 6-10 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                {['6', '7', '8', '9', '10'].map((g) => {
                  const isSelected = currentGrade === g;
                  return (
                    <button
                      key={g}
                      onClick={() => handleSelectGrade(g)}
                      className={cn(
                        "p-4 rounded-2xl text-left border transition-all cursor-pointer flex items-center justify-between group",
                        isSelected
                          ? "bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-900/15"
                          : "bg-slate-50/50 border-slate-100 text-slate-700 hover:border-indigo-100 hover:bg-slate-50"
                      )}
                    >
                      <div className="min-w-0">
                        <p className={cn("font-bold text-sm", isSelected ? "text-white" : "text-slate-800")}>
                          Grade {g}
                        </p>
                        <p className={cn("text-[10px] uppercase font-bold tracking-wider truncate mt-0.5 max-w-[200px]", isSelected ? "text-slate-400" : "text-slate-400 group-hover:text-indigo-500")}>
                          {gradeDetails[g] || "Secondary Material"}
                        </p>
                      </div>
                      <ChevronRight className={cn("w-4 h-4 transition-all group-hover:translate-x-1", isSelected ? "text-white/60" : "text-slate-300")} />
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Currently selected: <strong className="text-slate-900">Grade {currentGrade}</strong></span>
                <button
                  onClick={() => setShowGradeModal(false)}
                  className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer transition-all"
                >
                  Confirm & View chapters
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header Navigation */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-brand-primary transition-all font-bold text-sm group cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Library
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowGradeModal(true)}
            className="flex items-center gap-2 text-indigo-600 bg-indigo-50/60 border border-indigo-100 hover:bg-indigo-100/50 px-4 py-2 rounded-2xl shadow-sm cursor-pointer transition-all text-xs font-bold uppercase tracking-wider"
          >
            <GraduationCap className="w-4 h-4" />
            Switch Grade
          </button>
          <div className="flex items-center gap-2 text-slate-400 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100">
             <Trophy className="w-4 h-4 text-yellow-500" />
             <span className="text-xs font-bold uppercase tracking-wider">Lvl {profile?.stats.level || 1}</span>
          </div>
        </div>
      </div>

      <section className="relative p-12 bg-slate-900 rounded-[3.5rem] text-white overflow-hidden shadow-2xl shadow-slate-900/20">
        <div className="relative z-10 max-w-lg text-left">
          <div className="flex items-center gap-3 mb-6">
             <span className="px-3 py-1 bg-brand-primary/20 text-brand-primary rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border border-brand-primary/30">
               Core Subject
             </span>
             <span className="w-1 h-1 bg-slate-700 rounded-full" />
             <span className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md">
               Grade {currentGrade}
             </span>
          </div>
          <h2 className="text-5xl font-display font-bold mb-4 tracking-tight leading-tight">{subjectName}</h2>
          <p className="text-slate-400 font-medium mb-10 leading-relaxed">
            Master the fundamentals of {subjectName} aligned with Grade {currentGrade} specifications. Study chapters in order to gain XP and levels!
          </p>
          
          <div className="flex items-center gap-8">
            <div className="space-y-1">
                <p className="text-3xl font-display font-bold text-white">{doneCount}<span className="text-slate-600 text-xl">/{chapters.length}</span></p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.1em]">Chapters Done</p>
            </div>
            <div className="w-px h-12 bg-slate-800" />
            <div className="space-y-1">
               <div className="flex items-center gap-2">
                 <p className="text-3xl font-display font-bold text-brand-secondary">{masteryProgress}%</p>
                 <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                   <div 
                     className="h-full bg-brand-secondary shadow-[0_0_8px_var(--color-brand-secondary)] transition-all duration-500" 
                     style={{ width: `${masteryProgress}%` }}
                   />
                 </div>
               </div>
               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.1em]">Subject Mastery</p>
            </div>
          </div>
        </div>
        
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 right-0 p-12 opacity-10">
           <BookOpen className="w-64 h-64 rotate-12" />
        </div>
      </section>

      {chapters.length === 0 ? (
        <div className="p-16 text-center bg-slate-50 border border-dashed border-slate-200 rounded-[2.5rem] space-y-3">
          <p className="text-2xl font-bold text-slate-800">No Chapters Available</p>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
             Grade {currentGrade} does not contain specialized material for {subjectName}. Try selecting another grade level or starting from mathematics.
          </p>
          <button
            onClick={() => setShowGradeModal(true)}
            className="mt-6 px-6 py-3 bg-indigo-600 hover:bg-indigo-750 text-white rounded-xl font-bold text-xs cursor-pointer transition-all"
          >
            Change Grade Level
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 relative text-left">
          <div className="absolute left-10 top-0 bottom-0 w-1 bg-slate-100 rounded-full -z-10" />
          {chapters.map((chapter, idx) => {
            const { isLocked, status } = checkLessonLock(subjectKey, idx, completed, currentGrade);
            return (
              <ChapterCard 
                key={chapter.id} 
                chapter={{ ...chapter, status }} 
                isLocked={isLocked}
                index={idx + 1} 
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function ChapterCard({ chapter, isLocked, index }: { chapter: any, isLocked: boolean, index: number, key?: any }) {
  return (
    <Link 
      to={isLocked ? '#' : `/lessons/${chapter.id}`}
      className={cn(
        "group p-6 rounded-[2rem] border transition-all flex items-center gap-6",
        isLocked ? "bg-slate-50 border-slate-100 opacity-60 grayscale cursor-not-allowed" : "bg-white border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1"
      )}
    >
      <div className={cn(
        "w-16 h-16 rounded-2xl flex items-center justify-center font-display font-bold text-2xl relative shrink-0",
        chapter.status === 'completed' ? "bg-emerald-50 text-emerald-600" : 
        chapter.status === 'in-progress' ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/30" : "bg-slate-200 text-slate-400"
      )}>
        {index}
        {chapter.status === 'completed' && (
          <div className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-sm border border-emerald-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-display font-bold text-xl mb-1 truncate">{chapter.title}</h3>
        <p className="text-slate-400 text-sm truncate">{chapter.desc}</p>
        <div className="flex items-center gap-4 mt-2">
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
             <BookOpen className="w-3 h-3" /> {chapter.lessons} LESSONS
           </span>
           {chapter.status === 'in-progress' && (
             <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden max-w-[80px]">
               <div className="h-full bg-brand-primary w-2/3" />
             </div>
           )}
        </div>
      </div>

      <div className={cn(
        "w-12 h-12 rounded-xl flex items-center justify-center transition-all shrink-0",
        isLocked ? "text-slate-300" : "bg-slate-50 text-slate-400 group-hover:bg-brand-primary group-hover:text-white"
      )}>
        {isLocked ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        ) : (
          <Play className="w-5 h-5 fill-current" />
        )}
      </div>
    </Link>
  );
}
