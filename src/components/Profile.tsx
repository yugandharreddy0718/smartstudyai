import React from 'react';
import { motion } from 'motion/react';
import { User, LogOut, Award, Target, Calendar, Settings, ShieldCheck, Palette, GraduationCap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { logOut } from '../lib/firebase';
import { cn } from '../lib/utils';
import { StudentClass } from '../types';

export default function Profile() {
  const { profile, setStudentClass } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Profile Header */}
      <section className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -translate-y-1/2 translate-x-1/2" />
        
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="relative group">
            <div className="w-32 h-32 rounded-[2rem] bg-brand-primary/10 flex items-center justify-center border-4 border-white shadow-xl overflow-hidden">
              {profile?.photoURL ? (
                <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-brand-primary" />
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-brand-accent rounded-xl flex items-center justify-center text-white border-2 border-white shadow-lg">
              <span className="font-bold text-xs">Lvl {profile?.stats.level || 1}</span>
            </div>
          </div>

          <div className="text-center md:text-left flex-1">
            <h2 className="text-3xl font-display font-bold mb-1">{profile?.displayName || 'Yugandhar'}</h2>
            <p className="text-slate-400 font-medium mb-6">{profile?.email || 'yugandhar@example.com'}</p>
            
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <span className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-xs uppercase tracking-wide">Grade {profile?.studentClass || '8'}</span>
              <span className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-bold text-xs uppercase tracking-wide">Scholar Badge</span>
              <span className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-wide">Student ID #{profile?.uid ? profile.uid.slice(0, 5) : '55321'}</span>
            </div>
          </div>

          <button 
            onClick={() => logOut()}
            className="p-4 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-100 transition-colors group"
          >
            <LogOut className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatBox label="Experience" value={`${profile?.stats.xp || 0} XP`} icon={Award} color="bg-amber-50 text-amber-600" />
        <StatBox label="Current Streak" value={`${profile?.stats.streak || 1} Days`} icon={Target} color="bg-orange-50 text-orange-600" />
        <StatBox label="Lessons Done" value={String(profile?.completedLessons?.length || 0)} icon={Calendar} color="bg-indigo-50 text-indigo-600" />
        <StatBox label="Rank" value="#124" icon={Trophy} color="bg-emerald-50 text-emerald-600" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Achievements */}
        <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
          <h3 className="font-display font-bold text-xl mb-6">Badges & Achievements</h3>
          <div className="grid grid-cols-3 gap-6">
            <BadgeItem icon="🔥" label="7 Day Streak" unlocked />
            <BadgeItem icon="🧠" label="Math Pro" unlocked />
            <BadgeItem icon="📚" label="Reading Owl" unlocked />
            <BadgeItem icon="🎨" label="Creative" unlocked={false} />
            <BadgeItem icon="⚡" label="Fast Learner" unlocked={false} />
            <BadgeItem icon="🌟" label="Overachiever" unlocked={false} />
          </div>
        </section>

        {/* Account Settings */}
        <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-display font-bold text-xl mb-2">Settings</h3>

          {/* Active Grade Selector */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 mb-4 text-left">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-500" />
              Active Grade Level
            </p>
            <div className="grid grid-cols-5 gap-2">
              {['6', '7', '8', '9', '10'].map((g) => {
                const isActive = (profile?.studentClass || '8') === g;
                return (
                  <button
                    key={g}
                    onClick={() => {
                      setStudentClass(g as StudentClass);
                    }}
                    className={cn(
                      "py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer",
                      isActive 
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-100"
                        : "bg-white text-slate-500 border-slate-200 hover:bg-slate-100/50"
                    )}
                  >
                    G{g}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Changing your grade loads grade-aligned chapters, subjects, and study tasks dynamically.</p>
          </div>
          
          <SettingItem icon={Settings} label="General Settings" />
          <SettingItem icon={Palette} label="Appearance & Theme" />
          <SettingItem icon={ShieldCheck} label="Privacy & Security" />
          <div className="pt-4 mt-4 border-t border-slate-50 flex items-center justify-between text-slate-300 text-xs font-medium">
             <span>App Version 1.0.0</span>
             <span>SmartStudy AI 2026</span>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatBox({ label, value, icon: Icon, color }: { label: string, value: string, icon: any, color: string }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4", color)}>
        <Icon className="w-6 h-6" />
      </div>
      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">{label}</span>
      <span className="text-xl font-display font-bold text-slate-900">{value}</span>
    </div>
  );
}

function BadgeItem({ icon, label, unlocked }: { icon: string, label: string, unlocked: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2 group">
      <div className={cn(
        "w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-2xl transition-all",
        unlocked ? "bg-slate-50 shadow-sm group-hover:scale-110" : "bg-slate-50 opacity-40 grayscale"
      )}>
        {icon}
      </div>
      <span className={cn("text-[10px] font-bold text-center", unlocked ? "text-slate-600" : "text-slate-400")}>{label}</span>
    </div>
  );
}

function Trophy({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
  );
}

function SettingItem({ icon: Icon, label }: { icon: any, label: string }) {
  return (
    <button className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors text-slate-600 group">
      <div className="flex items-center gap-4">
        <Icon className="w-5 h-5 text-slate-400 group-hover:text-brand-primary transition-colors" />
        <span className="font-bold text-sm">{label}</span>
      </div>
      <ArrowRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1" />
    </button>
  );
}

function ArrowRight({ className }: { className?: string }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>;
}
