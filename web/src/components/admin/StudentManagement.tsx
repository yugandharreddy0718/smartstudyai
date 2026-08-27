import React, { useState, useEffect } from 'react';
import { fetchStudents, StudentUser } from '../../services/adminService';
import { 
  Users, 
  Search, 
  Filter, 
  RefreshCw, 
  AlertCircle, 
  GraduationCap, 
  Award, 
  Flame, 
  CheckCircle2, 
  X, 
  Eye, 
  ShieldCheck, 
  Calendar,
  BookOpen
} from 'lucide-react';

const GRADES = ['All', '6', '7', '8', '9', '10'];

export default function StudentManagement() {
  const [students, setStudents] = useState<StudentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('All');

  // Student detail modal state
  const [selectedStudent, setSelectedStudent] = useState<StudentUser | null>(null);

  const loadStudentsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchStudents();
      setStudents(data);
    } catch (err: any) {
      console.error('Failed to load students:', err);
      setError(err?.message || 'Failed to retrieve student records from Firestore.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentsData();
  }, []);

  const filteredStudents = students.filter((s) => {
    const matchesSearch = 
      (s.displayName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.uid || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const cleanGrade = (s.studentClass || '8').toString().replace(/^(class_?)/i, '');
    const matchesGrade = selectedGrade === 'All' || cleanGrade === selectedGrade;

    return matchesSearch && matchesGrade;
  });

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-white">Student Management</h2>
          <p className="text-slate-400 text-sm mt-1">
            Browse and inspect active student accounts, academic performance, and learning statistics.
          </p>
        </div>

        <button
          onClick={loadStudentsData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Search & Grade Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search student by name, email, or UID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-bold text-slate-400">Grade:</span>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="bg-transparent text-xs font-bold text-indigo-400 focus:outline-none cursor-pointer"
            >
              {GRADES.map((g) => (
                <option key={g} value={g} className="bg-slate-900 text-slate-100">
                  {g === 'All' ? 'All Grades' : `Grade ${g}`}
                </option>
              ))}
            </select>
          </div>

          <span className="text-xs text-slate-400">
            Found <strong className="text-white">{filteredStudents.length}</strong> students
          </span>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex items-center justify-between text-rose-300 text-sm">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadStudentsData}
            className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 rounded-lg font-semibold text-xs transition-all shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton / Student Cards Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-slate-900 p-5 rounded-2xl border border-slate-800 animate-pulse h-16" />
          ))}
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-slate-300 font-bold text-base">No Students Found</h3>
          <p className="text-slate-500 text-xs mt-1">Try clearing filters or search query.</p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-800/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Grade</th>
                  <th className="py-3.5 px-4">XP & Level</th>
                  <th className="py-3.5 px-4">Streak</th>
                  <th className="py-3.5 px-4">Completed Lessons</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200 font-medium">
                {filteredStudents.map((student) => {
                  const cleanGrade = (student.studentClass || '8').toString().replace(/^(class_?)/i, '');
                  const completedCount = student.completedLessons?.length || 0;

                  return (
                    <tr key={student.uid} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center border border-indigo-500/30 shrink-0">
                            {student.displayName[0]?.toUpperCase() || 'S'}
                          </div>
                          <div className="truncate max-w-[200px]">
                            <p className="font-bold text-slate-100 truncate">{student.displayName}</p>
                            <p className="text-[11px] text-slate-400 truncate">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-slate-800 text-indigo-400 font-bold border border-slate-700">
                          Grade {cleanGrade}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 text-amber-400 font-bold">
                            <Award className="w-3.5 h-3.5" />
                            <span>{student.stats.xp} XP</span>
                          </div>
                          <span className="text-slate-500">•</span>
                          <span className="text-slate-400">Lvl {student.stats.level}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 text-rose-400 font-bold">
                          <Flame className="w-3.5 h-3.5 fill-rose-500/20" />
                          <span>{student.stats.streak} Days</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{completedCount} Lessons</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setSelectedStudent(student)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 rounded-lg border border-indigo-500/30 text-xs font-bold transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl space-y-5 p-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-bold text-xl flex items-center justify-center">
                  {selectedStudent.displayName[0]?.toUpperCase() || 'S'}
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-white">{selectedStudent.displayName}</h3>
                  <p className="text-xs text-slate-400">{selectedStudent.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="text-slate-400 hover:text-white p-1 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Grid Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Class / Grade</span>
                <span className="text-sm font-extrabold text-white">
                  Grade {(selectedStudent.studentClass || '8').toString().replace(/^(class_?)/i, '')}
                </span>
              </div>

              <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Account Role</span>
                <span className="text-sm font-extrabold text-indigo-400 uppercase tracking-wider">
                  {selectedStudent.role}
                </span>
              </div>

              <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Total Experience</span>
                <div className="flex items-center gap-1.5 text-amber-400 font-bold text-sm">
                  <Award className="w-4 h-4" />
                  <span>{selectedStudent.stats.xp} XP (Level {selectedStudent.stats.level})</span>
                </div>
              </div>

              <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Current Streak</span>
                <div className="flex items-center gap-1.5 text-rose-400 font-bold text-sm">
                  <Flame className="w-4 h-4" />
                  <span>{selectedStudent.stats.streak} Days</span>
                </div>
              </div>
            </div>

            {/* Completed Lessons Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-emerald-400" />
                  Completed Lessons ({selectedStudent.completedLessons?.length || 0})
                </span>
              </div>
              <div className="max-h-36 overflow-y-auto bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
                {!selectedStudent.completedLessons || selectedStudent.completedLessons.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No completed lessons recorded yet.</p>
                ) : (
                  selectedStudent.completedLessons.map((lessonId, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1 px-2.5 bg-slate-900 rounded-lg text-[11px] font-mono text-slate-300 border border-slate-800">
                      <span>{lessonId}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
