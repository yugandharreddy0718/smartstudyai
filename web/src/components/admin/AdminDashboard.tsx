import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { logOut } from '@smartstudy/firebase';
import { fetchAdminStats, AdminStats } from '../../services/adminService';
import SubjectManagement from './SubjectManagement';
import ChapterManagement from './ChapterManagement';
import BookManagement from './BookManagement';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FolderTree,
  FileText,
  HelpCircle,
  BarChart3,
  ShieldCheck,
  Settings,
  LogOut,
  Sparkles,
  Lock,
  ChevronRight,
  BookMarked,
  RefreshCw,
  AlertCircle,
  GraduationCap,
  ShieldAlert,
  Layers,
  ArrowRight,
  Activity
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users, badge: 'Phase 4' },
  { id: 'books', label: 'Books', icon: BookMarked },
  { id: 'subjects', label: 'Subjects', icon: BookOpen },
  { id: 'chapters', label: 'Chapters', icon: FolderTree },
  { id: 'lessons', label: 'Lessons', icon: FileText, badge: 'Phase 4' },
  { id: 'quizzes', label: 'Quizzes', icon: HelpCircle, badge: 'Phase 4' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, badge: 'Phase 4' },
  { id: 'audit', label: 'Audit Logs', icon: ShieldCheck, badge: 'Phase 4' },
  { id: 'settings', label: 'Settings', icon: Settings, badge: 'Phase 4' },
];

export default function AdminDashboard() {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const role = profile?.role || 'admin';
  const isSuper = role === 'superAdmin';
  const adminName = profile?.displayName || (profile as any)?.name || user?.displayName || user?.email?.split('@')[0] || 'Admin';

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminStats();
      setStats(data);
    } catch (err: any) {
      console.error('Failed to load admin stats:', err);
      if (err?.code === 'permission-denied' || err?.message?.includes('permission-denied')) {
        setError('Permission denied: You do not have authorization to view user statistics.');
      } else {
        setError(err?.message || 'Failed to fetch dashboard data from Firestore.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo Brand */}
          <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-white leading-tight">SmartStudy AI</h1>
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Admin Dashboard</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700/60">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Profile Card */}
        <div className="p-4 border-t border-slate-800/80">
          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center shrink-0 border border-indigo-500/30">
                {adminName[0]?.toUpperCase() || 'A'}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-200 truncate">{adminName}</p>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isSuper ? 'text-amber-400' : 'text-indigo-400'}`}>
                  {isSuper ? 'Super Admin' : 'Admin'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 border border-slate-700/50 text-xs font-bold transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Admin Header */}
        <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span className="font-semibold text-indigo-400">SmartStudy AI Admin</span>
            <ChevronRight className="w-4 h-4 text-slate-600" />
            <span className="text-slate-100 font-semibold capitalize">{activeTab}</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-300 hidden sm:inline">{adminName}</span>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700">
                <ShieldCheck className={`w-4 h-4 ${isSuper ? 'text-amber-400' : 'text-emerald-400'}`} />
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  {role}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Tab Body */}
        <main className="flex-1 p-8 overflow-y-auto">
          {activeTab === 'dashboard' ? (
            <div className="space-y-8 max-w-6xl">
              {/* Header Title Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="font-display font-bold text-2xl text-white">Admin Dashboard</h2>
                  <p className="text-slate-400 text-sm mt-1">
                    Real-time Firestore overview & system metrics for <span className="text-indigo-400 font-semibold">{adminName}</span>.
                  </p>
                </div>
                <button
                  onClick={loadStats}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all self-start sm:self-auto disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
                  <span>Refresh Data</span>
                </button>
              </div>

              {/* Error Banner */}
              {error && (
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex items-center justify-between text-rose-300 text-sm">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    <span>{error}</span>
                  </div>
                  <button
                    onClick={loadStats}
                    className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 rounded-lg font-semibold text-xs transition-all shrink-0"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* 6 Statistics Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {/* 1. Total Students */}
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-slate-700/80 transition-all flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Students</span>
                    <div className="text-3xl font-extrabold text-white mt-2">
                      {loading ? (
                        <span className="text-slate-500 text-lg font-medium animate-pulse">Loading...</span>
                      ) : (
                        stats?.totalStudents ?? 0
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">Enrolled learner accounts</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                </div>

                {/* 2. Total Admins */}
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-slate-700/80 transition-all flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Admins</span>
                    <div className="text-3xl font-extrabold text-white mt-2">
                      {loading ? (
                        <span className="text-slate-500 text-lg font-medium animate-pulse">Loading...</span>
                      ) : (
                        stats?.totalAdmins ?? 0
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">System & super administrators</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                </div>

                {/* 3. Total Subjects */}
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-slate-700/80 transition-all flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Subjects</span>
                    <div className="text-3xl font-extrabold text-white mt-2">
                      {loading ? (
                        <span className="text-slate-500 text-lg font-medium animate-pulse">Loading...</span>
                      ) : (
                        stats?.totalSubjects ?? 0
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">Active learning domains</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <BookOpen className="w-6 h-6" />
                  </div>
                </div>

                {/* 4. Total Chapters */}
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-slate-700/80 transition-all flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Chapters</span>
                    <div className="text-3xl font-extrabold text-white mt-2">
                      {loading ? (
                        <span className="text-slate-500 text-lg font-medium animate-pulse">Loading...</span>
                      ) : (
                        stats?.totalChapters ?? 0
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">Structured syllabus units</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
                    <FolderTree className="w-6 h-6" />
                  </div>
                </div>

                {/* 5. Total Lessons */}
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-slate-700/80 transition-all flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Lessons</span>
                    <div className="text-3xl font-extrabold text-white mt-2">
                      {loading ? (
                        <span className="text-slate-500 text-lg font-medium animate-pulse">Loading...</span>
                      ) : (
                        stats?.totalLessons ?? 0
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">Published educational modules</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <FileText className="w-6 h-6" />
                  </div>
                </div>

                {/* 6. Total Quizzes */}
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-slate-700/80 transition-all flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Quizzes</span>
                    <div className="text-3xl font-extrabold text-white mt-2">
                      {loading ? (
                        <span className="text-slate-500 text-lg font-medium animate-pulse">Loading...</span>
                      ) : (
                        stats?.totalQuizzes ?? 0
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">Assessment questionnaires</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                    <HelpCircle className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Total Curriculum Items Summary Banner */}
              <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">Total Curriculum Items</h4>
                    <p className="text-xs text-slate-400">Combined count of all subjects, chapters, and lessons registered in Firestore.</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-indigo-400">
                    {loading ? 'Loading...' : (stats?.totalCurriculumItems ?? 0)}
                  </span>
                </div>
              </div>

              {/* Quick Actions Section */}
              <div className="space-y-4">
                <h3 className="font-display font-bold text-lg text-white">Quick Actions</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {[
                    { label: 'Manage Books', icon: BookMarked, tab: 'books' },
                    { label: 'Manage Subjects', icon: BookOpen, tab: 'subjects' },
                    { label: 'Manage Chapters', icon: FolderTree, tab: 'chapters' },
                    { label: 'Manage Lessons', icon: FileText, tab: 'lessons' },
                    { label: 'Manage Quizzes', icon: HelpCircle, tab: 'quizzes' },
                  ].map((action) => {
                    const ActionIcon = action.icon;
                    return (
                      <button
                        key={action.tab}
                        onClick={() => setActiveTab(action.tab)}
                        className="bg-slate-900 hover:bg-slate-800/80 p-4 rounded-xl border border-slate-800 hover:border-indigo-500/40 text-left transition-all group flex flex-col justify-between"
                      >
                        <div className="w-9 h-9 rounded-lg bg-slate-800 group-hover:bg-indigo-600/20 text-slate-300 group-hover:text-indigo-400 flex items-center justify-center transition-all mb-3">
                          <ActionIcon className="w-4 h-4" />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-200 group-hover:text-white transition-all">{action.label}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-all" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Recent Activity Section */}
              <div className="space-y-4">
                <h3 className="font-display font-bold text-lg text-white">Recent Activity</h3>
                <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8 text-center flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center text-slate-400 mb-3">
                    <Activity className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-300">No Recent Activity</h4>
                  <p className="text-xs text-slate-500 max-w-sm mt-1">
                    System activity logging will be activated in Phase 4. Recent administrative actions, content updates, and user events will be logged here.
                  </p>
                </div>
              </div>
            </div>
          ) : activeTab === 'subjects' ? (
            <SubjectManagement />
          ) : activeTab === 'chapters' ? (
            <ChapterManagement />
          ) : activeTab === 'books' ? (
            <BookManagement />
          ) : (
            /* Placeholder View for Unimplemented Phase 4 Modules */
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-12 bg-slate-900/40 rounded-3xl border border-slate-800/80">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="font-display font-bold text-xl text-white capitalize">{activeTab} Module</h3>
              <div className="inline-block mt-2 px-3 py-1 rounded-full bg-slate-800 text-indigo-400 text-xs font-bold border border-slate-700">
                Coming in Phase 4
              </div>
              <p className="text-slate-400 text-sm max-w-md mt-4 leading-relaxed">
                This administrative module is scheduled for implementation in <span className="text-indigo-400 font-semibold">Phase 4 Content Management</span>. CRUD functionality will be enabled in subsequent updates.
              </p>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="mt-6 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition-all"
              >
                Back to Dashboard
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
