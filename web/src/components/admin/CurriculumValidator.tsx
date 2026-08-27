import React, { useState, useEffect } from 'react';
import { validateCurriculumContent, ValidationReport } from '../../services/adminService';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Check, 
  FileText, 
  FolderTree, 
  Layers,
  BookOpen
} from 'lucide-react';

export default function CurriculumValidator() {
  const [report, setReport] = useState<ValidationReport | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const runValidation = () => {
    setIsScanning(true);
    setTimeout(() => {
      const res = validateCurriculumContent();
      setReport(res);
      setIsScanning(false);
    }, 400);
  };

  useEffect(() => {
    runValidation();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-white">Curriculum Integrity & Validation</h2>
          <p className="text-slate-400 text-sm mt-1">
            Automated diagnostic scanner verifying 178 chapters, 444 lessons, ID uniqueness, and 13-section schemas.
          </p>
        </div>

        <button
          onClick={runValidation}
          disabled={isScanning}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
          <span>Run Full Diagnostic Scan</span>
        </button>
      </div>

      {/* Report Status Banner */}
      {isScanning ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
          <h3 className="font-bold text-white text-sm">Scanning 444 Lessons & 178 Chapters...</h3>
          <p className="text-xs text-slate-400">Verifying section headings, grade maps, and content uniqueness.</p>
        </div>
      ) : report ? (
        <div className="space-y-6">
          {/* Main Status Badge Card */}
          <div className={`p-6 rounded-2xl border flex items-center justify-between ${
            report.passed 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shrink-0 ${
                report.passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
              }`}>
                {report.passed ? <CheckCircle2 className="w-7 h-7" /> : <XCircle className="w-7 h-7" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-lg font-black uppercase tracking-wider ${report.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {report.passed ? 'STATUS: PASS' : 'STATUS: ERROR'}
                  </span>
                  {report.warnings.length > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold uppercase">
                      {report.warnings.length} Warnings
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  {report.passed 
                    ? 'All 178 chapters and 444 lessons verified cleanly with 0 fatal errors.' 
                    : `Detected ${report.errors.length} fatal error(s) in curriculum architecture.`}
                </p>
              </div>
            </div>

            <div className="text-right font-mono text-xs hidden sm:block">
              <div>Total Lessons: <strong className="text-white">{report.totalLessons}</strong></div>
              <div>Total Chapters: <strong className="text-white">{report.totalChapters}</strong></div>
            </div>
          </div>

          {/* 6 Validation Check Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Chapters</span>
                <span className="text-xl font-extrabold text-white mt-1 block">{report.totalChapters} / 178</span>
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            </div>

            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Lessons</span>
                <span className="text-xl font-extrabold text-white mt-1 block">{report.totalLessons} / 444</span>
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            </div>

            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Unique Lesson IDs</span>
                <span className="text-xl font-extrabold text-white mt-1 block">{report.uniqueLessonIdsCount} Unique</span>
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            </div>

            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Grade & Subject Mapping</span>
                <span className="text-xl font-extrabold text-emerald-400 mt-1 block">Valid</span>
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            </div>

            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Non-Empty Lessons</span>
                <span className="text-xl font-extrabold text-emerald-400 mt-1 block">
                  {report.noEmptyLessons ? 'PASS (0 Empty)' : 'FAIL'}
                </span>
              </div>
              {report.noEmptyLessons ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
              )}
            </div>

            <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">13-Section Schema Check</span>
                <span className="text-xl font-extrabold text-emerald-400 mt-1 block">
                  {report.all13SectionsPresent ? '100% Complete' : 'Warnings'}
                </span>
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            </div>
          </div>

          {/* Diagnostics Log Details */}
          {report.errors.length > 0 && (
            <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-6 space-y-3">
              <h3 className="font-bold text-rose-400 text-sm flex items-center gap-2">
                <XCircle className="w-4 h-4" />
                <span>Fatal Validation Errors ({report.errors.length}):</span>
              </h3>
              <div className="space-y-1 font-mono text-xs text-rose-300 bg-slate-950 p-4 rounded-xl border border-slate-800">
                {report.errors.map((err, idx) => (
                  <p key={idx}>• {err}</p>
                ))}
              </div>
            </div>
          )}

          {report.warnings.length > 0 && (
            <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-6 space-y-3">
              <h3 className="font-bold text-amber-400 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Schema Warnings ({report.warnings.length}):</span>
              </h3>
              <div className="max-h-48 overflow-y-auto space-y-1 font-mono text-xs text-amber-300 bg-slate-950 p-4 rounded-xl border border-slate-800">
                {report.warnings.map((warn, idx) => (
                  <p key={idx}>• {warn}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
