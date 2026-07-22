import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Flame, Trophy, Star, Clock, BookOpen, BrainCircuit, Sparkles, FileText, MessageCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { calculateSubjectProgress } from '../data/curriculum';

export default function Dashboard() {
  const { profile } = useAuth();
  const completed = profile?.completedLessons || [];

  const mathsProgress = calculateSubjectProgress('maths', completed, profile?.studentClass);
  const scienceProgress = calculateSubjectProgress('science', completed, profile?.studentClass);
  const geographyProgress = calculateSubjectProgress('geography', completed, profile?.studentClass);
  const historyProgress = calculateSubjectProgress('history', completed, profile?.studentClass);
  const physicsProgress = calculateSubjectProgress('physics', completed, profile?.studentClass);
  const biologyProgress = calculateSubjectProgress('biology', completed, profile?.studentClass);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <section className="relative overflow-hidden bg-slate-900 rounded-[3.5rem] p-10 text-white shadow-2xl shadow-slate-900/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-md">
            <div className="flex items-center gap-2 mb-4">
               <span className="w-2 h-2 bg-brand-primary rounded-full animate-pulse" />
               <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Live Learning Session</span>
            </div>
            <h2 className="text-5xl font-display font-bold mb-4 tracking-tight">Welcome, {profile?.displayName?.split(' ')[0] || 'Yugandhar'}! 👋</h2>
            <p className="text-slate-400 font-medium mb-8 leading-relaxed">
              You've mastered <span className="text-white font-bold">{completed.length} topics</span> total. Keep up the momentum!
            </p>
            
            <div className="flex items-center gap-4">
              <Link to="/subjects" className="px-8 py-4 bg-brand-primary text-white rounded-2xl font-bold flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-primary/20">
                Continue Learning
                <ArrowRight className="w-5 h-5" />
              </Link>
              <div className="flex -space-x-3">
                {[1,2,3].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-bold">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-400">
                  +{completed.length + 2}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/10 text-center min-w-[140px] hover:bg-white/10 transition-colors">
              <Flame className="w-10 h-10 text-orange-400 fill-orange-400 mx-auto mb-3" />
              <p className="text-3xl font-display font-bold">{profile?.stats.streak || 1}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Day Streak</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[2.5rem] border border-white/10 text-center min-w-[140px] hover:bg-white/10 transition-colors">
              <Trophy className="w-10 h-10 text-yellow-400 fill-yellow-400 mx-auto mb-3" />
              <p className="text-3xl font-display font-bold">{profile?.stats.xp || 0}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">XP Points</p>
            </div>
          </div>
        </div>

        {/* Accents */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-primary/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-brand-secondary/5 rounded-full blur-[80px]" />
      </section>

      {/* Stats and Challenges */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 p-8 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5" />
               </div>
               <h3 className="font-display font-bold text-xl uppercase tracking-tight">Active Progress</h3>
            </div>
            <Link to="/subjects" className="text-brand-primary font-bold text-xs uppercase tracking-widest hover:underline">View Subjects</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ProgressItem label="Mathematics" progress={mathsProgress} color="bg-indigo-500" />
            <ProgressItem label="Science" progress={scienceProgress} color="bg-rose-500" />
            <ProgressItem label="Geography" progress={geographyProgress} color="bg-emerald-500" />
            <ProgressItem label="History" progress={historyProgress} color="bg-amber-500" />
          </div>
        </section>

        <section className="p-8 bg-white rounded-[3rem] border border-slate-100 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-display font-bold text-xl uppercase tracking-tight">Daily Goals</h3>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">2/5 Done</span>
          </div>
          <div className="space-y-4 flex-1">
            <ChallengeItem title="Mastery Quiz" desc="Score 100% on any quiz" xp={100} done={false} />
            <ChallengeItem title="Deep Analysis" desc="Analyze a new lesson" xp={50} done={completed.length > 0} />
            <ChallengeItem title="Daily Streak" desc="Log in 3 days in a row" xp={20} done={true} />
          </div>
        </section>
      </div>

      {/* Explore Subjects */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-display font-bold text-3xl tracking-tight">Your Curriculum</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <SubjectCard icon="📐" name="Maths" color="bg-white border-slate-100 hover:border-indigo-200" subColor="text-indigo-600" path="/subjects/maths" />
          <SubjectCard icon="🔬" name="Science" color="bg-white border-slate-100 hover:border-rose-200" subColor="text-rose-600" path="/subjects/science" />
          <SubjectCard icon="🌍" name="Geography" color="bg-white border-slate-100 hover:border-emerald-200" subColor="text-emerald-600" path="/subjects/geography" />
          <SubjectCard icon="📜" name="History" color="bg-white border-slate-100 hover:border-amber-200" subColor="text-amber-600" path="/subjects/history" />
          <SubjectCard icon="⚡" name="Physics" color="bg-white border-slate-100 hover:border-sky-200" subColor="text-sky-600" path="/subjects/physics" />
          <SubjectCard icon="🌿" name="Biology" color="bg-white border-slate-100 hover:border-teal-200" subColor="text-teal-600" path="/subjects/biology" />
        </div>
      </section>

      {/* AI Hub */}
      <section className="relative p-10 bg-brand-primary rounded-[4rem] text-white overflow-hidden shadow-2xl shadow-brand-primary/20">
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left space-y-6">
             <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20">
               <Sparkles className="w-4 h-4 text-white" />
               <span className="text-[10px] font-bold uppercase tracking-widest">Premium Feature</span>
             </div>
             <h3 className="text-5xl font-display font-bold leading-tight tracking-tight">AI Study Analysis</h3>
             <p className="text-white/70 text-lg font-medium leading-relaxed max-w-md">
               Upload your textbook pages or notes and let AI create summaries, quizzes, and flashcards instantly.
             </p>
             <Link 
               to="/upload" 
               className="inline-flex items-center gap-3 px-10 py-5 bg-white text-brand-primary rounded-2xl font-bold hover:scale-105 transition-all shadow-2xl shadow-white/10 active:scale-95"
             >
               Go to Upload Center
               <ArrowRight className="w-5 h-5" />
             </Link>
          </div>
          
          <div className="grid grid-cols-2 gap-4 shrink-0">
             <div className="p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 text-center animate-float">
                <FileText className="w-8 h-8 text-white mx-auto mb-3" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">Summaries</p>
             </div>
             <div className="p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 text-center animate-float [animation-delay:0.5s]">
                <BrainCircuit className="w-8 h-8 text-white mx-auto mb-3" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">Quizzes</p>
             </div>
             <div className="p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 text-center animate-float [animation-delay:1s]">
                <Star className="w-8 h-8 text-white mx-auto mb-3" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">Flashcards</p>
             </div>
             <div className="p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 text-center animate-float [animation-delay:1.5s]">
                <MessageCircle className="w-8 h-8 text-white mx-auto mb-3" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">AI Tutor</p>
             </div>
          </div>
        </div>

        {/* Decor */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white rounded-full opacity-5 blur-[100px] translate-x-1/2 -translate-y-1/2" />
      </section>
    </div>
  );
}

function ProgressItem({ label, progress, color }: { label: string, progress: number, color: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="font-bold text-slate-900">{progress}%</span>
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          className={cn("h-full rounded-full", color)}
        />
      </div>
    </div>
  );
}

function ChallengeItem({ title, desc, xp, done }: { title: string, desc: string, xp: number, done: boolean }) {
  return (
    <div className={cn("flex items-center gap-4 p-4 rounded-2xl border transition-all", done ? "bg-slate-50 border-slate-200" : "bg-white border-slate-100 shadow-sm")}>
      <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center", done ? "bg-emerald-500 border-emerald-500" : "border-slate-300")}>
        {done && <ArrowRight className="w-4 h-4 text-white" />}
      </div>
      <div className="flex-1">
        <h4 className={cn("font-bold text-sm", done && "text-slate-500 line-through")}>{title}</h4>
        <p className="text-xs text-slate-400">{desc}</p>
      </div>
      <div className="text-xs font-bold text-brand-primary">+{xp} XP</div>
    </div>
  );
}

function SubjectCard({ icon, name, color, subColor, path }: { icon: string, name: string, color: string, subColor?: string, path: string }) {
  return (
    <Link to={path} className={cn("flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all hover:scale-105 active:scale-95 group", color)}>
      <span className="text-4xl mb-4 grayscale-[0.5] group-hover:grayscale-0 transition-all drop-shadow-xl">{icon}</span>
      <span className={cn("font-display font-bold text-lg", subColor || "text-slate-900")}>{name}</span>
    </Link>
  );
}

function RecommendationCard({ title, subject, difficulty, time }: { title: string, subject: string, difficulty: string, time: string }) {
  return (
    <div className="p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-colors group cursor-pointer">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold text-brand-primary bg-brand-primary/10 px-3 py-1 rounded-full uppercase tracking-wider">{subject}</span>
        <div className="flex items-center gap-2 text-slate-400 text-xs">
          <Clock className="w-3 h-3" />
          {time}
        </div>
      </div>
      <h4 className="font-display font-bold text-xl mb-4 group-hover:text-brand-primary transition-colors">{title}</h4>
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">Difficulty: <span className="text-slate-300">{difficulty}</span></span>
        <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-all group-hover:translate-x-1" />
      </div>
    </div>
  );
}
