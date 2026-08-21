import { db, storage, auth } from '@smartstudy/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  where 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject,
  updateMetadata,
  UploadTask
} from 'firebase/storage';

export type ContentStatus = 'draft' | 'published' | 'unpublished';

export interface SubjectData {
  id: string;
  name: string;
  classId: string;
  description: string;
  iconUrl?: string;
  icon?: string;
  totalChapters?: number;
  order: number;
  status: ContentStatus;
  createdAt: number;
  updatedAt: number;
}

export interface ChapterData {
  id: string;
  subjectId: string;
  classId: string;
  title: string;
  description: string;
  order: number;
  totalLessons?: number;
  estimatedMinutes?: number;
  status: ContentStatus;
  createdAt: number;
  updatedAt: number;
}

export interface BookData {
  id: string;
  title: string;
  classId: string;
  subjectId: string;
  description: string;
  coverImageUrl?: string;
  pdfUrl: string;
  storagePath: string;
  fileSizeBytes: number;
  fileName: string;
  status: ContentStatus;
  createdBy?: string;
  createdAt: number;
  updatedAt: number;
}

export function formatClassId(classId: string): string {
  const cleanGrade = classId.toString().replace(/^(class_?)/i, '');
  return `class_${cleanGrade}`;
}

// Helper to sanitize filenames for Storage paths
function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, '_');
}

// ==========================================
// 1. SUBJECT MANAGEMENT SERVICES
// ==========================================

export async function getSubjectsByClass(classId: string): Promise<SubjectData[]> {
  const targetClassId = formatClassId(classId);
  const colRef = collection(db, 'curriculum', targetClassId, 'subjects');
  const q = query(colRef, orderBy('order'));
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      name: data.name || '',
      classId: targetClassId,
      description: data.description || data.desc || '',
      iconUrl: data.iconUrl || '',
      icon: data.icon || '📚',
      totalChapters: data.totalChapters || 0,
      order: data.order ?? 1,
      status: (data.status as ContentStatus) || 'published',
      createdAt: data.createdAt || Date.now(),
      updatedAt: data.updatedAt || Date.now(),
    };
  });
}

export async function createSubject(classId: string, data: Partial<SubjectData>): Promise<SubjectData> {
  const targetClassId = formatClassId(classId);
  const subjectId = (data.id || data.name || '').toLowerCase().trim().replace(/[^a-z0-9_]/g, '_');

  if (!subjectId) throw new Error('Subject ID or Name is required.');
  if (!data.name?.trim()) throw new Error('Subject Name is required.');

  const docRef = doc(db, 'curriculum', targetClassId, 'subjects', subjectId);
  const now = Date.now();
  const payload: SubjectData = {
    id: subjectId,
    classId: targetClassId,
    name: data.name.trim(),
    description: data.description?.trim() || '',
    iconUrl: data.iconUrl || '',
    icon: data.icon || '📚',
    totalChapters: data.totalChapters || 0,
    order: data.order ?? 1,
    status: data.status || 'published',
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(docRef, payload, { merge: true });
  return payload;
}

export async function updateSubject(
  classId: string, 
  subjectId: string, 
  updates: Partial<SubjectData>
): Promise<void> {
  const targetClassId = formatClassId(classId);
  const docRef = doc(db, 'curriculum', targetClassId, 'subjects', subjectId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Date.now(),
  });
}

export async function deleteSubject(classId: string, subjectId: string): Promise<void> {
  const targetClassId = formatClassId(classId);
  
  // Dependency Check: Ensure no child chapters exist before deleting
  const chaptersColRef = collection(db, 'curriculum', targetClassId, 'subjects', subjectId, 'chapters');
  const snapshot = await getDocs(chaptersColRef);
  if (!snapshot.empty) {
    throw new Error(`Cannot delete subject "${subjectId}": It contains ${snapshot.size} active chapter(s). Please delete or reassign chapters first.`);
  }

  const docRef = doc(db, 'curriculum', targetClassId, 'subjects', subjectId);
  await deleteDoc(docRef);
}

// ==========================================
// 2. CHAPTER MANAGEMENT SERVICES
// ==========================================

export async function getChaptersBySubject(classId: string, subjectId: string): Promise<ChapterData[]> {
  const targetClassId = formatClassId(classId);
  const colRef = collection(db, 'curriculum', targetClassId, 'subjects', subjectId, 'chapters');
  const q = query(colRef, orderBy('order'));

  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      subjectId,
      classId: targetClassId,
      title: data.title || data.name || '',
      description: data.description || data.desc || '',
      order: data.order ?? 1,
      totalLessons: data.totalLessons || data.lessons || 1,
      estimatedMinutes: data.estimatedMinutes || 30,
      status: (data.status as ContentStatus) || 'published',
      createdAt: data.createdAt || Date.now(),
      updatedAt: data.updatedAt || Date.now(),
    };
  });
}

export async function createChapter(
  classId: string, 
  subjectId: string, 
  data: Partial<ChapterData>
): Promise<ChapterData> {
  const targetClassId = formatClassId(classId);
  if (!data.title?.trim()) throw new Error('Chapter Title is required.');

  const chapterId = data.id || `${targetClassId.replace('class_', 'g')}-${subjectId}-c${data.order || Date.now()}`;
  const docRef = doc(db, 'curriculum', targetClassId, 'subjects', subjectId, 'chapters', chapterId);
  
  const now = Date.now();
  const payload: ChapterData = {
    id: chapterId,
    subjectId,
    classId: targetClassId,
    title: data.title.trim(),
    description: data.description?.trim() || '',
    order: data.order ?? 1,
    totalLessons: data.totalLessons || 1,
    estimatedMinutes: data.estimatedMinutes || 30,
    status: data.status || 'published',
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(docRef, payload, { merge: true });

  // Update parent subject's chapter count
  try {
    const chapters = await getChaptersBySubject(targetClassId, subjectId);
    await updateSubject(targetClassId, subjectId, { totalChapters: chapters.length });
  } catch (e) {
    // Non-fatal total count sync notice
  }

  return payload;
}

export async function updateChapter(
  classId: string, 
  subjectId: string, 
  chapterId: string, 
  updates: Partial<ChapterData>
): Promise<void> {
  const targetClassId = formatClassId(classId);
  const docRef = doc(db, 'curriculum', targetClassId, 'subjects', subjectId, 'chapters', chapterId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Date.now(),
  });
}

export async function deleteChapter(classId: string, subjectId: string, chapterId: string): Promise<void> {
  const targetClassId = formatClassId(classId);

  // Dependency Check: Ensure no child lessons exist before deleting
  const lessonsColRef = collection(db, 'curriculum', targetClassId, 'subjects', subjectId, 'chapters', chapterId, 'lessons');
  const snapshot = await getDocs(lessonsColRef);
  if (!snapshot.empty) {
    throw new Error(`Cannot delete chapter "${chapterId}": It contains ${snapshot.size} active lesson(s). Delete lessons first.`);
  }

  const docRef = doc(db, 'curriculum', targetClassId, 'subjects', subjectId, 'chapters', chapterId);
  await deleteDoc(docRef);

  // Update parent subject's chapter count
  try {
    const chapters = await getChaptersBySubject(targetClassId, subjectId);
    await updateSubject(targetClassId, subjectId, { totalChapters: chapters.length });
  } catch (e) {
    // Non-fatal total count sync notice
  }
}

// ==========================================
// 3. BOOK & FIREBASE STORAGE SERVICES
// ==========================================

export async function getBooksByClass(classId: string, subjectId?: string): Promise<BookData[]> {
  const targetClassId = formatClassId(classId);
  const colRef = collection(db, 'curriculum', targetClassId, 'books');
  
  let q = query(colRef, orderBy('createdAt', 'desc'));
  if (subjectId) {
    q = query(colRef, where('subjectId', '==', subjectId), orderBy('createdAt', 'desc'));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      title: data.title || '',
      classId: targetClassId,
      subjectId: data.subjectId || '',
      description: data.description || '',
      coverImageUrl: data.coverImageUrl || '',
      pdfUrl: data.pdfUrl || '',
      storagePath: data.storagePath || '',
      fileSizeBytes: data.fileSizeBytes || 0,
      fileName: data.fileName || '',
      status: (data.status as ContentStatus) || 'published',
      createdBy: data.createdBy || '',
      createdAt: data.createdAt || Date.now(),
      updatedAt: data.updatedAt || Date.now(),
    };
  });
}

export interface UploadBookResult {
  pdfUrl: string;
  storagePath: string;
  fileSizeBytes: number;
  fileName: string;
}

export interface UploadBookOptions {
  file: File;
  classId: string;
  subjectId: string;
  status?: ContentStatus;
  onProgress?: (progress: number) => void;
  onTaskCreated?: (task: UploadTask) => void;
}

export async function uploadBookPdf({
  file,
  classId,
  subjectId,
  status = 'published',
  onProgress,
  onTaskCreated
}: UploadBookOptions): Promise<UploadBookResult> {
  // Validation 1: File existence
  if (!file) {
    throw new Error('No file provided for upload.');
  }

  // Validation 2: PDF file type validation
  const isPdfType = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  if (!isPdfType) {
    throw new Error('Invalid file type: Only PDF documents (.pdf) are allowed.');
  }

  // Validation 3: File size validation (Max 50MB)
  const maxSizeBytes = 50 * 1024 * 1024; // 50 MB
  if (file.size > maxSizeBytes) {
    throw new Error(`File size (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds maximum allowed limit of 50MB.`);
  }

  if (file.size === 0) {
    throw new Error('Invalid file: File is empty (0 bytes).');
  }

  const targetClassId = formatClassId(classId);
  const cleanFileName = sanitizeFilename(file.name);
  const storagePath = `books/${targetClassId}/${subjectId}/${Date.now()}_${cleanFileName}`;
  
  const storageRef = ref(storage, storagePath);
  const uploadTask = uploadBytesResumable(storageRef, file, {
    contentType: 'application/pdf',
    customMetadata: {
      status: status || 'published',
      uploadedBy: auth.currentUser?.uid || 'admin',
      classId: targetClassId,
      subjectId
    }
  });

  if (onTaskCreated) {
    onTaskCreated(uploadTask);
  }

  return new Promise<UploadBookResult>((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        if (onProgress) onProgress(progress);
      },
      (error) => {
        console.error('Firebase Storage Upload Error:', error);
        reject(new Error(`Storage upload failed: ${error.message || 'Network error during file upload.'}`));
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({
            pdfUrl: downloadUrl,
            storagePath,
            fileSizeBytes: file.size,
            fileName: file.name
          });
        } catch (err: any) {
          reject(new Error(`Failed to retrieve download URL: ${err.message}`));
        }
      }
    );
  });
}

export async function createBook(
  classId: string, 
  data: Partial<BookData>,
  autoCleanupOnFailure: boolean = true
): Promise<BookData> {
  const targetClassId = formatClassId(classId);
  
  if (!data.title?.trim()) throw new Error('Book Title is required.');
  if (!data.subjectId) throw new Error('Subject is required.');
  if (!data.pdfUrl) throw new Error('PDF file URL is required.');

  const bookId = data.id || `book-${targetClassId}-${data.subjectId}-${Date.now()}`;
  const docRef = doc(db, 'curriculum', targetClassId, 'books', bookId);

  const now = Date.now();
  const payload: BookData = {
    id: bookId,
    title: data.title.trim(),
    classId: targetClassId,
    subjectId: data.subjectId,
    description: data.description?.trim() || '',
    coverImageUrl: data.coverImageUrl || '',
    pdfUrl: data.pdfUrl,
    storagePath: data.storagePath || '',
    fileSizeBytes: data.fileSizeBytes || 0,
    fileName: data.fileName || '',
    status: data.status || 'published',
    createdBy: auth.currentUser?.uid || 'admin',
    createdAt: now,
    updatedAt: now,
  };

  try {
    await setDoc(docRef, payload, { merge: true });
    return payload;
  } catch (firestoreError: any) {
    // Orphan Cleanup: If Firestore creation fails but a storage path was specified, attempt storage cleanup
    if (autoCleanupOnFailure && data.storagePath) {
      try {
        const fileRef = ref(storage, data.storagePath);
        await deleteObject(fileRef);
        console.warn(`Orphan cleanup successful: Removed storage file ${data.storagePath} after Firestore document creation failed.`);
      } catch (cleanupErr) {
        console.error(`Orphan cleanup warning: Failed to remove storage file ${data.storagePath} after Firestore failure:`, cleanupErr);
      }
    }
    throw firestoreError;
  }
}

export async function updateBook(classId: string, bookId: string, updates: Partial<BookData>): Promise<void> {
  const targetClassId = formatClassId(classId);
  const docRef = doc(db, 'curriculum', targetClassId, 'books', bookId);
  
  // 1. Update Firestore document
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Date.now(),
  });

  // 2. Synchronize Storage customMetadata status if status is modified
  if (updates.status) {
    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().storagePath) {
        const storagePath = docSnap.data().storagePath;
        const fileRef = ref(storage, storagePath);
        await updateMetadata(fileRef, {
          customMetadata: {
            status: updates.status
          }
        });
      }
    } catch (err: any) {
      console.warn('Notice: Storage metadata update notice:', err?.message || err);
    }
  }
}

export async function deleteBook(classId: string, bookId: string): Promise<void> {
  const targetClassId = formatClassId(classId);
  const docRef = doc(db, 'curriculum', targetClassId, 'books', bookId);
  
  // 1. Fetch doc to retrieve Storage path
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    if (data.storagePath) {
      try {
        const fileRef = ref(storage, data.storagePath);
        await deleteObject(fileRef);
      } catch (err: any) {
        console.warn('Storage file deletion notice (file may already be removed):', err?.message || err);
      }
    }
  }

  // 2. Delete Firestore metadata document
  await deleteDoc(docRef);
}
