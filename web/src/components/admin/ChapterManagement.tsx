import React, { useState, useEffect } from 'react';
import * as contentService from '../../services/contentManagementService';
import { SubjectData, ChapterData, ContentStatus } from '../../services/contentManagementService';
import { 
  FolderTree, 
  BookOpen, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  RefreshCw, 
  AlertCircle, 
  X, 
  Eye, 
  EyeOff, 
  Clock, 
  FileText 
} from 'lucide-react';

const CLASSES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

export default function ChapterManagement() {
  const [selectedClass, setSelectedClass] = useState('8');
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  
  const [chapters, setChapters] = useState<ChapterData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<ChapterData | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order: 1,
    estimatedMinutes: 30,
    status: 'published' as ContentStatus
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Delete modal states
  const [deleteTarget, setDeleteTarget] = useState<ChapterData | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const activeSubjectId = selectedSubjectId || (subjects.length > 0 ? subjects[0].id : '');

  const loadChapters = async (cls = selectedClass, subjId = activeSubjectId) => {
    if (!subjId) {
      setChapters([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await contentService.getChaptersBySubject(cls, subjId);
      setChapters(data);
    } catch (err: any) {
      console.error('Error loading chapters:', err);
      setError(err?.message || 'Failed to load chapters from Firestore.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadClassSubjects = async () => {
      setLoading(true);
      setError(null);
      try {
        const subs = await contentService.getSubjectsByClass(selectedClass);
        setSubjects(subs);
        const subIdToUse = selectedSubjectId && subs.some(s => s.id === selectedSubjectId)
          ? selectedSubjectId
          : (subs.length > 0 ? subs[0].id : '');

        if (subIdToUse) {
          if (subIdToUse !== selectedSubjectId) {
            setSelectedSubjectId(subIdToUse);
          }
          const chs = await contentService.getChaptersBySubject(selectedClass, subIdToUse);
          setChapters(chs);
        } else {
          setSelectedSubjectId('');
          setChapters([]);
        }
      } catch (err: any) {
        console.error('Error loading chapter management data:', err);
        setError(err?.message || 'Failed to load data.');
      } finally {
        setLoading(false);
      }
    };
    loadClassSubjects();
  }, [selectedClass]);

  const handleSubjectChange = async (subjId: string) => {
    setSelectedSubjectId(subjId);
    await loadChapters(selectedClass, subjId);
  };

  const handleOpenAddModal = () => {
    setEditingChapter(null);
    setFormData({
      title: '',
      description: '',
      order: chapters.length + 1,
      estimatedMinutes: 30,
      status: 'published'
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (chapter: ChapterData) => {
    setEditingChapter(chapter);
    setFormData({
      title: chapter.title,
      description: chapter.description,
      order: chapter.order,
      estimatedMinutes: chapter.estimatedMinutes || 30,
      status: chapter.status
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.title.trim()) {
      setFormError('Chapter Title is required.');
      return;
    }
    if (!activeSubjectId) {
      setFormError('Please select a subject first.');
      return;
    }

    setFormSubmitting(true);
    try {
      if (editingChapter) {
        await contentService.updateChapter(selectedClass, activeSubjectId, editingChapter.id, {
          title: formData.title.trim(),
          description: formData.description.trim(),
          order: Number(formData.order),
          estimatedMinutes: Number(formData.estimatedMinutes),
          status: formData.status
        });
      } else {
        await contentService.createChapter(selectedClass, activeSubjectId, {
          title: formData.title.trim(),
          description: formData.description.trim(),
          order: Number(formData.order),
          estimatedMinutes: Number(formData.estimatedMinutes),
          status: formData.status
        });
      }
      setIsModalOpen(false);
      await loadChapters(selectedClass, activeSubjectId);
    } catch (err: any) {
      console.error('Error saving chapter:', err);
      setFormError(err?.message || 'Failed to save chapter.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleStatus = async (chapter: ChapterData) => {
    const newStatus: ContentStatus = chapter.status === 'published' ? 'unpublished' : 'published';
    try {
      await contentService.updateChapter(selectedClass, activeSubjectId, chapter.id, { status: newStatus });
      setChapters(prev => prev.map(c => c.id === chapter.id ? { ...c, status: newStatus } : c));
    } catch (err: any) {
      alert(`Failed to update status: ${err?.message || err}`);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);

    try {
      await contentService.deleteChapter(selectedClass, activeSubjectId, deleteTarget.id);
      setDeleteTarget(null);
      await loadChapters(selectedClass, activeSubjectId);
    } catch (err: any) {
      console.error('Error deleting chapter:', err);
      setDeleteError(err?.message || 'Failed to delete chapter.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredChapters = chapters.filter(c => 
    (c.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-white">Chapter Management</h2>
          <p className="text-slate-400 text-sm mt-1">
            Organize syllabus chapters for Grade <span className="text-indigo-400 font-bold">{selectedClass}</span>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Class Selector */}
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-xs font-bold text-slate-400">Class:</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="bg-transparent text-sm font-bold text-indigo-400 focus:outline-none cursor-pointer"
            >
              {CLASSES.map((c) => (
                <option key={c} value={c} className="bg-slate-900 text-slate-100">
                  Grade {c}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Selector */}
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-xs font-bold text-slate-400">Subject:</span>
            <select
              value={activeSubjectId}
              onChange={(e) => handleSubjectChange(e.target.value)}
              disabled={subjects.length === 0}
              className="bg-transparent text-sm font-bold text-indigo-400 focus:outline-none cursor-pointer disabled:opacity-50"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id} className="bg-slate-900 text-slate-100">
                  {s.icon} {s.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleOpenAddModal}
            disabled={!activeSubjectId}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Add Chapter</span>
          </button>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search chapters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400 w-full sm:w-auto justify-between sm:justify-end">
          <span>Total: <strong className="text-white">{filteredChapters.length}</strong> chapters</span>
          <button
            onClick={() => loadChapters()}
            disabled={loading || !selectedSubjectId}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-all disabled:opacity-50"
            title="Refresh chapters"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex items-center gap-3 text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Chapters Table / List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 animate-pulse h-20"></div>
          ))}
        </div>
      ) : !selectedSubjectId ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-slate-300 font-bold text-base">No Subjects in Grade {selectedClass}</h3>
          <p className="text-slate-500 text-xs mt-1">Please create a subject under Subject Management before adding chapters.</p>
        </div>
      ) : filteredChapters.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center">
          <FolderTree className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-slate-300 font-bold text-base">No Chapters Found</h3>
          <p className="text-slate-500 text-xs mt-1">No chapters added for this subject yet.</p>
          <button
            onClick={handleOpenAddModal}
            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all"
          >
            Create First Chapter
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredChapters.map((chapter) => (
            <div
              key={chapter.id}
              className="bg-slate-900 p-5 rounded-2xl border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-sm shrink-0">
                  #{chapter.order}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-slate-100 text-base">{chapter.title}</h3>
                    <button
                      onClick={() => handleToggleStatus(chapter)}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border transition-all ${
                        chapter.status === 'published'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {chapter.status === 'published' ? (
                        <>
                          <Eye className="w-3 h-3" /> Published
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-3 h-3" /> {chapter.status}
                        </>
                      )}
                    </button>
                  </div>

                  <p className="text-slate-400 text-xs mt-1 line-clamp-1">{chapter.description || 'No description provided.'}</p>

                  <div className="flex items-center gap-4 text-[11px] text-slate-500 mt-2">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <strong>{chapter.totalLessons ?? 1}</strong> lessons
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <strong>{chapter.estimatedMinutes ?? 30}</strong> mins
                    </span>
                    <span className="font-mono text-[10px]">ID: {chapter.id}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  onClick={() => handleOpenEditModal(chapter)}
                  className="p-2 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 rounded-xl transition-all"
                  title="Edit chapter"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setDeleteTarget(chapter);
                    setDeleteError(null);
                  }}
                  className="p-2 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-xl transition-all"
                  title="Delete chapter"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Chapter Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-white">
                {editingChapter ? 'Edit Chapter' : 'Add New Chapter'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 text-xs text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Chapter Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Knowing Our Numbers, Forces and Pressure"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="Summary of topics covered in this chapter..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Chapter Order</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Est. Minutes</label>
                  <input
                    type="number"
                    min={5}
                    step={5}
                    value={formData.estimatedMinutes}
                    onChange={(e) => setFormData({ ...formData, estimatedMinutes: parseInt(e.target.value) || 30 })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ContentStatus })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="unpublished">Unpublished</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {formSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingChapter ? 'Save Changes' : 'Create Chapter'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="font-display font-bold text-lg text-white">Delete Chapter?</h3>
            </div>

            <p className="text-slate-300 text-xs leading-relaxed">
              Are you sure you want to delete chapter <strong className="text-white">{deleteTarget.title}</strong>?
            </p>

            {deleteError && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 text-xs text-rose-300">
                {deleteError}
              </div>
            )}

            <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {deleting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
