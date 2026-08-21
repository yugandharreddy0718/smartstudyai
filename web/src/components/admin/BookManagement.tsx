import React, { useState, useEffect } from 'react';
import * as contentService from '../../services/contentManagementService';
import { SubjectData, BookData, ContentStatus } from '../../services/contentManagementService';
import { UploadTask } from 'firebase/storage';
import { 
  BookMarked, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  RefreshCw, 
  AlertCircle, 
  X, 
  Eye, 
  EyeOff, 
  FileText, 
  UploadCloud, 
  ExternalLink, 
  CheckCircle2 
} from 'lucide-react';

const CLASSES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function BookManagement() {
  const [selectedClass, setSelectedClass] = useState('8');
  const [subjects, setSubjects] = useState<SubjectData[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');

  const [books, setBooks] = useState<BookData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Upload Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<BookData | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    subjectId: '',
    description: '',
    coverImageUrl: '',
    status: 'published' as ContentStatus
  });

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [activeUploadTask, setActiveUploadTask] = useState<UploadTask | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<BookData | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // 1. Fetch subjects when Class changes
  useEffect(() => {
    const loadClassSubjects = async () => {
      try {
        const subs = await contentService.getSubjectsByClass(selectedClass);
        setSubjects(subs);
      } catch (err) {
        console.error('Error fetching subjects:', err);
      }
    };
    loadClassSubjects();
  }, [selectedClass]);

  // 2. Fetch books when Class or Subject changes
  const loadBooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const targetSub = selectedSubjectId === 'all' ? undefined : selectedSubjectId;
      const data = await contentService.getBooksByClass(selectedClass, targetSub);
      setBooks(data);
    } catch (err: any) {
      console.error('Error loading books:', err);
      setError(err?.message || 'Failed to load books from Firestore.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, [selectedClass, selectedSubjectId]);

  const handleOpenAddModal = () => {
    setEditingBook(null);
    setFormData({
      title: '',
      subjectId: subjects[0]?.id || '',
      description: '',
      coverImageUrl: '',
      status: 'published'
    });
    setSelectedFile(null);
    setUploadProgress(null);
    setActiveUploadTask(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (book: BookData) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      subjectId: book.subjectId,
      description: book.description,
      coverImageUrl: book.coverImageUrl || '',
      status: book.status
    });
    setSelectedFile(null);
    setUploadProgress(null);
    setActiveUploadTask(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // File type validation
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      if (!isPdf) {
        setFormError('Invalid file type: Only PDF documents (.pdf) are allowed.');
        setSelectedFile(null);
        return;
      }

      // File size validation (50MB max)
      const maxSizeBytes = 50 * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        setFormError(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds 50MB maximum limit.`);
        setSelectedFile(null);
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleCancelUpload = () => {
    if (activeUploadTask) {
      activeUploadTask.cancel();
      setActiveUploadTask(null);
      setUploadProgress(null);
      setFormSubmitting(false);
      setFormError('Upload cancelled by user.');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.title.trim()) {
      setFormError('Book Title is required.');
      return;
    }
    if (!formData.subjectId) {
      setFormError('Please select a Subject.');
      return;
    }

    if (!editingBook && !selectedFile) {
      setFormError('Please select a PDF textbook file to upload.');
      return;
    }

    setFormSubmitting(true);
    try {
      let pdfUrl = editingBook?.pdfUrl || '';
      let storagePath = editingBook?.storagePath || '';
      let fileSizeBytes = editingBook?.fileSizeBytes || 0;
      let fileName = editingBook?.fileName || '';

      // Upload file if new file selected
      if (selectedFile) {
        setUploadProgress(0);
        const uploadResult = await contentService.uploadBookPdf({
          file: selectedFile,
          classId: selectedClass,
          subjectId: formData.subjectId,
          status: formData.status,
          onProgress: (p) => setUploadProgress(p),
          onTaskCreated: (task) => setActiveUploadTask(task)
        });
        pdfUrl = uploadResult.pdfUrl;
        storagePath = uploadResult.storagePath;
        fileSizeBytes = uploadResult.fileSizeBytes;
        fileName = uploadResult.fileName;
      }

      if (editingBook) {
        await contentService.updateBook(selectedClass, editingBook.id, {
          title: formData.title.trim(),
          subjectId: formData.subjectId,
          description: formData.description.trim(),
          coverImageUrl: formData.coverImageUrl.trim(),
          pdfUrl,
          storagePath,
          fileSizeBytes,
          fileName,
          status: formData.status
        });
      } else {
        await contentService.createBook(selectedClass, {
          title: formData.title.trim(),
          subjectId: formData.subjectId,
          description: formData.description.trim(),
          coverImageUrl: formData.coverImageUrl.trim(),
          pdfUrl,
          storagePath,
          fileSizeBytes,
          fileName,
          status: formData.status
        });
      }

      setIsModalOpen(false);
      await loadBooks();
    } catch (err: any) {
      console.error('Error saving book:', err);
      setFormError(err?.message || 'Failed to upload or save book.');
    } finally {
      setFormSubmitting(false);
      setUploadProgress(null);
      setActiveUploadTask(null);
    }
  };

  const handleToggleStatus = async (book: BookData) => {
    const newStatus: ContentStatus = book.status === 'published' ? 'unpublished' : 'published';
    try {
      await contentService.updateBook(selectedClass, book.id, { status: newStatus });
      setBooks(prev => prev.map(b => b.id === book.id ? { ...b, status: newStatus } : b));
    } catch (err: any) {
      alert(`Failed to update status: ${err?.message || err}`);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);

    try {
      await contentService.deleteBook(selectedClass, deleteTarget.id);
      setDeleteTarget(null);
      await loadBooks();
    } catch (err: any) {
      console.error('Error deleting book:', err);
      setDeleteError(err?.message || 'Failed to delete book and file.');
    } finally {
      setDeleting(false);
    }
  };

  const filteredBooks = books.filter(b => 
    (b.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.subjectId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.fileName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl text-white">Book & Textbook Management</h2>
          <p className="text-slate-400 text-sm mt-1">
            Upload PDF textbooks to Firebase Storage & manage book metadata for Grade <span className="text-indigo-400 font-bold">{selectedClass}</span>.
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

          {/* Subject Filter */}
          <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
            <span className="text-xs font-bold text-slate-400">Subject:</span>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="bg-transparent text-sm font-bold text-indigo-400 focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-slate-900 text-slate-100">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id} className="bg-slate-900 text-slate-100">
                  {s.icon} {s.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Book</span>
          </button>
        </div>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search books by title, filename, or subject..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400 w-full sm:w-auto justify-between sm:justify-end">
          <span>Total Books: <strong className="text-white">{filteredBooks.length}</strong></span>
          <button
            onClick={loadBooks}
            disabled={loading}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-all disabled:opacity-50"
            title="Refresh books"
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

      {/* Books Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-900/60 p-6 rounded-2xl border border-slate-800 animate-pulse h-48 flex flex-col justify-between">
              <div className="h-4 bg-slate-800 rounded w-1/2"></div>
              <div className="h-3 bg-slate-800 rounded w-3/4"></div>
              <div className="h-8 bg-slate-800 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center">
          <BookMarked className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-slate-300 font-bold text-base">No Books Found</h3>
          <p className="text-slate-500 text-xs mt-1">No PDF textbooks uploaded for Grade {selectedClass} yet.</p>
          <button
            onClick={handleOpenAddModal}
            className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all"
          >
            Upload First Textbook PDF
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              className="bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-slate-700/80 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-100 text-base line-clamp-1">{book.title}</h3>
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">{book.subjectId}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleStatus(book)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border transition-all ${
                      book.status === 'published'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {book.status === 'published' ? (
                      <>
                        <Eye className="w-3 h-3" /> Published
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3 h-3" /> {book.status}
                      </>
                    )}
                  </button>
                </div>

                <p className="text-slate-400 text-xs mt-3 line-clamp-2">{book.description || 'No description provided.'}</p>
                
                <div className="mt-3 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                  <span className="truncate max-w-[180px]" title={book.fileName}>📄 {book.fileName || 'pdf_document.pdf'}</span>
                  <span className="font-semibold text-slate-300 shrink-0">{formatBytes(book.fileSizeBytes)}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                <a
                  href={book.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View PDF</span>
                </a>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(book)}
                    className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 rounded-lg transition-all"
                    title="Edit book metadata"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setDeleteTarget(book);
                      setDeleteError(null);
                    }}
                    className="p-1.5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg transition-all"
                    title="Delete book"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload / Edit Book Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-white">
                {editingBook ? 'Edit Book Metadata' : 'Upload & Register Textbook PDF'} (Grade {selectedClass})
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={formSubmitting}
                className="text-slate-400 hover:text-white p-1 transition-all disabled:opacity-50"
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
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Book / Textbook Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NCERT Mathematics Grade 8 Official Textbook"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Subject *</label>
                  <select
                    value={formData.subjectId}
                    onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                    required
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Select Subject...</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Publishing Status</label>
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

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief description of textbook content or edition..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* PDF File Picker Section */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                  PDF File {editingBook ? '(Leave blank to keep existing file)' : '*'}
                </label>
                
                <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500/60 rounded-2xl p-4 text-center bg-slate-950/40 transition-all">
                  <input
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={handleFileChange}
                    id="book-pdf-input"
                    className="hidden"
                  />
                  <label htmlFor="book-pdf-input" className="cursor-pointer flex flex-col items-center justify-center space-y-2">
                    <UploadCloud className="w-8 h-8 text-indigo-400" />
                    <span className="text-xs font-bold text-slate-200">
                      {selectedFile ? selectedFile.name : 'Click to select PDF textbook file'}
                    </span>
                    <span className="text-[10px] text-slate-500">Max size: 50MB | Supported format: PDF</span>
                  </label>
                </div>
                {selectedFile && (
                  <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Selected: {selectedFile.name} ({formatBytes(selectedFile.size)})
                  </p>
                )}
              </div>

              {/* Upload Progress Bar */}
              {uploadProgress !== null && (
                <div className="space-y-1.5 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span>Uploading to Firebase Storage...</span>
                    <span className="text-indigo-400">{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCancelUpload}
                    className="text-[11px] font-bold text-rose-400 hover:underline"
                  >
                    Cancel Upload
                  </button>
                </div>
              )}

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={formSubmitting}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {formSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingBook ? 'Save Metadata' : 'Upload & Save Book'}</span>
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
              <h3 className="font-display font-bold text-lg text-white">Delete Textbook & Storage File?</h3>
            </div>

            <p className="text-slate-300 text-xs leading-relaxed">
              Are you sure you want to delete <strong className="text-white">{deleteTarget.title}</strong>? This action will permanently delete the Firestore metadata record AND the uploaded PDF file from Firebase Storage.
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
