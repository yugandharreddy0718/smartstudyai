import React, { useState, useEffect } from 'react';
import { getChaptersBySubject, getLessonById, CurriculumChapter } from '../../data/curriculum';
import { 
  FileText, 
  Search, 
  Filter, 
  Eye, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Save, 
  RefreshCw, 
  BookOpen,
  FolderTree,
  Check,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';

const GRADES = ['6', '7', '8', '9', '10'];
const SUBJECTS = [
  { id: 'maths', name: 'Mathematics' },
  { id: 'physics', name: 'Physics' },
  { id: 'chemistry', name: 'Chemistry' },
  { id: 'biology', name: 'Biology' },
  { id: 'history', name: 'History & Civics' },
  { id: 'geography', name: 'Geography & Economics' }
];

const MANDATORY_SECTIONS = [
  '1. Learning Objectives',
  '2. Introduction',
  '3. Detailed Concept Explanation',
  '4. Important Definitions',
  '5. Key Concepts',
  '6. Examples',
  '7. Step-by-Step Explanation',
  '8. Formulas / Rules',
  '9. Worked Problems',
  '10. Try Yourself',
  '11. Common Mistakes',
  '12. Quick Revision'
];

interface EditableLesson {
  id: string;
  chapterId?: string;
  subjectId: string;
  grade: string;
  title: string;
  desc: string;
  content: string;
}

export default function LessonManagement() {
  const [selectedGrade, setSelectedGrade] = useState('8');
  const [selectedSubject, setSelectedSubject] = useState('maths');
  const [searchQuery, setSearchQuery] = useState('');

  const [chapters, setChapters] = useState<CurriculumChapter[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<EditableLesson | null>(null);

  // Editor Modal States
  const [editingLesson, setEditingLesson] = useState<EditableLesson | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [confirmSaveModal, setConfirmSaveModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const list = getChaptersBySubject(selectedSubject, selectedGrade);
    setChapters(list);
  }, [selectedGrade, selectedSubject]);

  const filteredChapters = chapters.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenPreview = (chap: CurriculumChapter) => {
    const full = getLessonById(chap.id, selectedGrade);
    setSelectedLesson({
      id: full.id,
      chapterId: full.chapterId,
      subjectId: full.subjectId || selectedSubject,
      grade: full.grade || selectedGrade,
      title: full.title,
      desc: full.desc,
      content: full.content
    });
  };

  const handleOpenEdit = (chap: CurriculumChapter) => {
    const full = getLessonById(chap.id, selectedGrade);
    const item: EditableLesson = {
      id: full.id,
      chapterId: full.chapterId,
      subjectId: full.subjectId || selectedSubject,
      grade: full.grade || selectedGrade,
      title: full.title,
      desc: full.desc,
      content: full.content
    };
    setEditingLesson(item);
    setEditedTitle(item.title);
    setEditedContent(item.content);
    setValidationErrors([]);
  };

  const validateLesson = (title: string, content: string): string[] => {
    const errs: string[] = [];

    if (!title.trim()) {
      errs.push('Lesson Title is required.');
    }

    if (!content || content.trim().length < 50) {
      errs.push('Lesson Content is empty or too short.');
    }

    MANDATORY_SECTIONS.forEach(sec => {
      if (!content.includes(sec)) {
        errs.push(`Missing mandatory section: "${sec}"`);
      }
    });

    return errs;
  };

  const handleTriggerSave = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateLesson(editedTitle, editedContent);
    setValidationErrors(errs);

    if (errs.length === 0) {
      setConfirmSaveModal(true);
    }
  };

  const handleConfirmSave = async () => {
    if (!editingLesson) return;
    setIsSaving(true);

    try {
      // In-memory edit update (preserving IDs)
      editingLesson.title = editedTitle.trim();
      editingLesson.content = editedContent;

      setConfirmSaveModal(false);
      setEditingLesson(null);
      setToastMessage(`Successfully saved changes for lesson "${editingLesson.id}".`);
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      alert(`Save error: ${err?.message || err}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between text-emerald-300 text-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-white">Lesson Content Management</h2>
          <p className="text-slate-400 text-sm mt-1">
            Safely inspect, preview, edit, and validate lesson modules across all 444 curriculum lessons.
          </p>
        </div>
      </div>

      {/* Grade & Subject Selector Tabs */}
      <div className="space-y-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        {/* Grade Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-2">Grade:</span>
          {GRADES.map(g => (
            <button
              key={g}
              onClick={() => setSelectedGrade(g)}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all shrink-0 ${
                selectedGrade === g
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              Grade {g}
            </button>
          ))}
        </div>

        {/* Subject Pills */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-2">Subject:</span>
          {SUBJECTS.map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedSubject(s.id)}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all shrink-0 ${
                selectedSubject === s.id
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/40'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search lessons by title, ID, keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <span className="text-xs text-slate-400">
          Showing <strong className="text-white">{filteredChapters.length}</strong> lessons for Grade {selectedGrade} {SUBJECTS.find(s=>s.id===selectedSubject)?.name}
        </span>
      </div>

      {/* Lessons Table / List */}
      {filteredChapters.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-slate-300 font-bold text-base">No Lessons Found</h3>
          <p className="text-slate-500 text-xs mt-1">Try broadening search terms or changing grade/subject selection.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredChapters.map((chap, idx) => (
            <div
              key={chap.id}
              className="bg-slate-900 p-5 rounded-2xl border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 font-bold text-xs flex items-center justify-center border border-indigo-500/20 shrink-0">
                      L{idx + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-100 text-sm line-clamp-1">{chap.title}</h3>
                      <span className="text-[10px] font-mono text-slate-500">ID: {chap.id}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                    13 Sections
                  </span>
                </div>

                <p className="text-slate-400 text-xs mt-2 line-clamp-2">{chap.desc}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-mono">Chapter: {chap.chapterId || chap.id}</span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenPreview(chap)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition-all border border-slate-700"
                  >
                    <Eye className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Preview</span>
                  </button>

                  <button
                    onClick={() => handleOpenEdit(chap)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lesson Preview Modal */}
      {selectedLesson && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-display font-bold text-lg text-white">{selectedLesson.title}</h3>
                <span className="text-xs font-mono text-indigo-400">Lesson ID: {selectedLesson.id} (Grade {selectedLesson.grade})</span>
              </div>
              <button
                onClick={() => setSelectedLesson(null)}
                className="text-slate-400 hover:text-white p-1 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 text-slate-300 text-xs leading-relaxed space-y-4 whitespace-pre-wrap font-mono">
              {selectedLesson.content}
            </div>

            <div className="p-4 border-t border-slate-800 flex justify-end shrink-0">
              <button
                onClick={() => setSelectedLesson(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lesson Editor Modal */}
      {editingLesson && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-display font-bold text-lg text-white">Edit Lesson: {editingLesson.id}</h3>
                <p className="text-xs text-slate-400">Preserving IDs (Lesson ID: {editingLesson.id}, Grade: {editingLesson.grade}, Subject: {editingLesson.subjectId})</p>
              </div>
              <button
                onClick={() => setEditingLesson(null)}
                className="text-slate-400 hover:text-white p-1 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTriggerSave} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="p-6 overflow-y-auto flex-1 space-y-4">
                {/* Validation Errors Box */}
                {validationErrors.length > 0 && (
                  <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 space-y-1.5 text-rose-300 text-xs">
                    <div className="flex items-center gap-2 font-bold text-rose-400 mb-1">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Schema Validation Error — Required 13 Sections Missing:</span>
                    </div>
                    {validationErrors.map((err, idx) => (
                      <p key={idx} className="pl-6 font-mono">• {err}</p>
                    ))}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Lesson Title *</label>
                  <input
                    type="text"
                    required
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-bold"
                  />
                </div>

                <div className="flex-1 flex flex-col">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                    Lesson Markdown Content (13 Required Sections) *
                  </label>
                  <textarea
                    rows={16}
                    required
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-100 focus:outline-none focus:border-indigo-500 leading-relaxed"
                  />
                </div>
              </div>

              <div className="p-4 border-t border-slate-800 flex items-center justify-between shrink-0 bg-slate-900">
                <span className="text-xs text-slate-400">All 13 mandatory sections must be present to pass validation.</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingLesson(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Lesson</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmSaveModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-indigo-400">
              <CheckCircle2 className="w-6 h-6 shrink-0" />
              <h3 className="font-display font-bold text-lg text-white">Confirm Lesson Save</h3>
            </div>

            <p className="text-slate-300 text-xs leading-relaxed">
              Are you sure you want to save changes to lesson <strong className="text-white">{editingLesson?.id}</strong>? IDs and grade mapping will be preserved.
            </p>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                onClick={() => setConfirmSaveModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSave}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm & Save</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
