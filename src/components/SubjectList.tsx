import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Search, BookOpen, Clock, Heart } from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

const SUBJECTS = [
  { id: 'maths', name: 'Mathematics', icon: '📐', color: 'bg-indigo-500', count: 12 },
  { id: 'science', name: 'Science', icon: '🔬', color: 'bg-rose-500', count: 8 },
  { id: 'geography', name: 'Geography', icon: '🌍', color: 'bg-emerald-500', count: 6 },
  { id: 'history', name: 'History', icon: '📜', color: 'bg-amber-500', count: 5 },
  { id: 'physics', name: 'Physics', icon: '⚡', color: 'bg-sky-500', count: 9 },
  { id: 'biology', name: 'Biology', icon: '🌿', color: 'bg-teal-500', count: 7 },
];

export default function SubjectList() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeFilter, setActiveFilter] = React.useState('All');

  const filteredSubjects = SUBJECTS.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'All' || s.id === activeFilter.toLowerCase(); // Simple filter for demo
    return matchesSearch;
  });

  const filters = ['All', 'Science', 'Mathematics', 'Language', 'Social'];

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="font-display font-bold text-4xl mb-2 tracking-tight text-slate-900">Learning Library</h2>
            <p className="text-slate-500 font-medium">Over <span className="text-brand-primary font-bold">1,200 lessons</span> powered by AI analysis.</p>
          </div>
          
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-brand-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search subjects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-slate-200 rounded-2xl pl-12 pr-6 py-4 w-full md:w-96 shadow-sm focus:outline-none focus:ring-4 focus:ring-brand-primary/10 focus:border-brand-primary transition-all font-medium text-slate-600"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap border-2",
                activeFilter === filter 
                  ? "bg-slate-900 text-white border-slate-900 shadow-xl shadow-slate-900/20" 
                  : "bg-white text-slate-400 border-slate-100 hover:border-slate-200"
              )}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredSubjects.map((subject) => (
          <motion.div
            key={subject.id}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -8 }}
            className="group relative overflow-hidden bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500"
          >
            {/* Background Pattern */}
            <div className={cn("absolute top-0 right-0 w-40 h-40 opacity-5 rounded-full translate-x-1/4 -translate-y-1/4 transition-transform group-hover:scale-150 duration-700", subject.color)} />
            
            <div className="flex items-start justify-between mb-10">
              <div className={cn("w-20 h-20 rounded-[2rem] flex items-center justify-center text-4xl shadow-xl shadow-current/10 relative z-10", subject.color)}>
                <span className="drop-shadow-sm">{subject.icon}</span>
              </div>
              <button className="p-3 bg-slate-50 text-slate-300 rounded-2xl hover:text-rose-500 hover:bg-rose-50 transition-all active:scale-90">
                <Heart className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-display font-bold text-3xl text-slate-900 group-hover:text-brand-primary transition-colors">{subject.name}</h3>
                <div className="flex items-center gap-4 mt-3">
                   <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                      <BookOpen className="w-3.5 h-3.5" />
                      {subject.count} chapters
                   </div>
                   <div className="w-1 h-1 bg-slate-200 rounded-full" />
                   <div className="flex items-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                      <Clock className="w-3.5 h-3.5" /> 
                      12h Study
                   </div>
                </div>
              </div>

              <div className="pt-2">
                <Link 
                  to={`/subjects/${subject.id}`}
                  className="inline-flex items-center justify-between w-full p-2 pl-6 bg-slate-50 rounded-2xl group/btn hover:bg-slate-900 hover:text-white transition-all duration-300"
                >
                  <span className="font-bold text-slate-600 group-hover/btn:text-white transition-colors">Start Path</span>
                  <div className="w-12 h-12 bg-white text-slate-900 rounded-xl flex items-center justify-center shadow-sm group-hover/btn:bg-brand-primary group-hover/btn:text-white transition-all group-hover/btn:rotate-[-10deg]">
                     <ArrowRight className="w-6 h-6" />
                  </div>
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Stats Footnote */}
      <div className="bg-slate-50 p-12 rounded-[3.5rem] border border-slate-100 flex flex-col items-center text-center max-w-4xl mx-auto space-y-4">
         <h3 className="font-display font-bold text-2xl tracking-tight">Need help focusing?</h3>
         <p className="text-slate-500 font-medium max-w-2xl">Our AI Tutor is available 24/7 to help you explain complex topics in any of these subjects.</p>
         <Link to="/chat" className="inline-flex items-center gap-2 text-brand-primary font-bold group">
            Contact AI Tutor
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
         </Link>
      </div>
    </div>
  );
}
