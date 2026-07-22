import React from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { Home, BookOpen, MessageCircle, User, Upload, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

export function Shell({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: BookOpen, label: 'Learn', path: '/subjects' },
    { icon: Upload, label: 'Upload', path: '/upload' },
    { icon: MessageCircle, label: 'AI Tutor', path: '/chat' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col sticky top-0 h-screen z-40">
        <div className="p-6 flex items-center gap-2 mb-4">
          <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center shadow-lg shadow-brand-primary/20">
            <Sparkles className="text-white w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-lg leading-none tracking-tight">SmartStudy</span>
            <span className="text-[10px] font-bold text-brand-primary uppercase tracking-[0.2em]">AI Lab</span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                isActive 
                  ? "bg-slate-900 text-white shadow-xl shadow-slate-900/10" 
                  : "text-slate-500 hover:bg-slate-100/80 active:scale-95"
              )}
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn("w-5 h-5", isActive ? "text-brand-primary" : "text-slate-400 group-hover:text-slate-900")} />
                  <span className="font-bold text-sm">{item.label}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="active-indicator"
                      className="absolute right-0 w-1 h-6 bg-brand-primary rounded-l-full"
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <div className="bg-brand-primary/5 rounded-3xl p-4 border border-brand-primary/10">
            <p className="text-[10px] font-bold text-brand-primary uppercase tracking-widest mb-2">Pro Plan</p>
            <p className="text-xs text-slate-600 font-medium mb-3">Get unlimited AI study analysis!</p>
            <button className="w-full py-2 bg-brand-primary text-white text-xs font-bold rounded-xl shadow-lg shadow-brand-primary/20 hover:scale-105 active:scale-95 transition-all">
              Upgrade Now
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div className="md:hidden flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <span className="font-display font-bold text-lg tracking-tight">SmartStudy</span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-slate-400 text-sm font-medium">
             <Home className="w-4 h-4" />
             <span>/</span>
             <span className="text-slate-900 font-bold capitalize">
               {location.pathname === '/' ? 'Dashboard' : location.pathname.split('/')[1]}
             </span>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2.5 text-slate-400 hover:text-brand-primary bg-slate-50 hover:bg-brand-primary/5 rounded-xl transition-all relative">
              <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
            </button>
            <Link to="/profile" className="flex items-center gap-3 p-1 pr-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all">
              <div className="w-8 h-8 bg-brand-secondary rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-sm">
                YR
              </div>
              <span className="text-sm font-bold text-slate-700 hidden sm:block">Yugandhar</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto pb-24 md:pb-8">
          <div className="max-w-6xl mx-auto p-4 md:p-8">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-2xl border-t border-slate-100 px-8 py-4 flex justify-between items-center z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.03)]">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex flex-col items-center justify-center transition-all duration-300 relative",
              isActive ? "text-brand-primary scale-110" : "text-slate-400 hover:text-slate-600"
            )}
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn("w-6 h-6 stroke-[2.5]")} />
                {isActive && (
                  <motion.div 
                    layoutId="mobile-active"
                    className="absolute -bottom-1.5 w-1 h-1 bg-brand-primary rounded-full shadow-[0_0_8px_var(--color-brand-primary)]" 
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
