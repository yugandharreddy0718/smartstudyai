import React, { useState, useEffect } from 'react';
import { fetchAnalyticsData, AdminAnalyticsMetrics } from '../../services/adminService';
import { 
  BarChart3, 
  GraduationCap, 
  BookOpen, 
  CheckCircle2, 
  Award, 
  RefreshCw, 
  AlertCircle,
  TrendingUp,
  PieChart,
  Layers
} from 'lucide-react';

export default function AdminAnalytics() {
  const [data, setData] = useState<AdminAnalyticsMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAnalyticsData();
      setData(res);
    } catch (err: any) {
      console.error('Failed to fetch analytics metrics:', err);
      setError(err?.message || 'Failed to retrieve analytics data from Firestore.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-white">System Analytics & Insight</h2>
          <p className="text-slate-400 text-sm mt-1">
            Real-time academic performance, subject distributions, and grade metrics across the application.
          </p>
        </div>

        <button
          onClick={loadMetrics}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex items-center justify-between text-rose-300 text-sm">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadMetrics}
            className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 rounded-lg font-semibold text-xs transition-all shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* Top 4 Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Grades</span>
            <div className="text-2xl font-black text-white mt-1">
              {loading ? '...' : (data?.activeGradesCount ?? 5)} / 5
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Classes 6 to 10 active</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Completed Lessons</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              {loading ? '...' : (data?.totalCompletedLessons ?? 0)}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Learner progress logs</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Average XP / Student</span>
            <div className="text-2xl font-black text-amber-400 mt-1">
              {loading ? '...' : `${data?.averageXP ?? 0} XP`}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Platform gamification score</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Curriculum Modules</span>
            <div className="text-2xl font-black text-purple-400 mt-1">
              444 Lessons
            </div>
            <p className="text-[10px] text-slate-500 mt-1">178 chapters published</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Grade & Subject Distribution Visualizations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Grade Distribution Panel */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-slate-100 text-base">Students by Grade</h3>
            </div>
            <span className="text-xs text-slate-400">Classes 6–10</span>
          </div>

          <div className="space-y-3 pt-2">
            {['6', '7', '8', '9', '10'].map((grade) => {
              const count: number = data?.gradeDistribution[grade] ?? 0;
              const gradeVals: number[] = Object.values(data?.gradeDistribution || {});
              const total: number = gradeVals.reduce((a: number, b: number) => a + b, 0) || 1;
              const percent: number = Math.round((count / total) * 100);

              return (
                <div key={grade} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">Grade {grade}</span>
                    <span className="text-slate-400 font-mono">{count} students ({percent}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(percent, 4)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Subject Content Distribution Panel */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-slate-100 text-base">Subject Content Distribution</h3>
            </div>
            <span className="text-xs text-slate-400">444 Total Lessons</span>
          </div>

          <div className="space-y-3 pt-2">
            {data?.subjectDistribution && Object.entries(data.subjectDistribution).map(([subj, countVal]) => {
              const count: number = Number(countVal);
              const totalLessons: number = 444;
              const percent: number = Math.round((count / totalLessons) * 100);

              return (
                <div key={subj} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">{subj}</span>
                    <span className="text-slate-400 font-mono">{count} lessons ({percent}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
