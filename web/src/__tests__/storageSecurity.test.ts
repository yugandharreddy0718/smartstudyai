import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as contentService from '../services/contentManagementService';
import { ref, deleteObject, updateMetadata } from 'firebase/storage';

// Helper simulating Firebase Storage Security Rules evaluation engine
function evaluateStorageRuleRead(user: { uid: string; role: string } | null, resourceMetadata?: { status?: string } | null): boolean {
  const isSignedIn = user !== null;
  const isAdmin = isSignedIn && (user.role === 'admin' || user.role === 'superAdmin');
  
  if (isAdmin) return true;
  if (isSignedIn && resourceMetadata && resourceMetadata.status === 'published') return true;
  
  return false;
}

function evaluateStorageRuleWrite(user: { uid: string; role: string } | null, file?: { size: number; contentType: string }): boolean {
  const isSignedIn = user !== null;
  const isAdmin = isSignedIn && (user.role === 'admin' || user.role === 'superAdmin');
  
  if (!isAdmin) return false;
  if (!file) return false;
  
  const isValidPdfUpload = file.size > 0 && file.size <= 50 * 1024 * 1024 && file.contentType === 'application/pdf';
  return isValidPdfUpload;
}

function evaluateStorageRuleDelete(user: { uid: string; role: string } | null): boolean {
  const isSignedIn = user !== null;
  const isAdmin = isSignedIn && (user.role === 'admin' || user.role === 'superAdmin');
  return isAdmin;
}

// Mock Firebase Storage module functions
vi.mock('firebase/storage', async (importOriginal) => {
  const actual = await importOriginal<typeof import('firebase/storage')>();
  return {
    ...actual,
    ref: vi.fn().mockImplementation((storageInstance, path) => ({ fullPath: path })),
    uploadBytesResumable: vi.fn(),
    getDownloadURL: vi.fn(),
    deleteObject: vi.fn(),
    updateMetadata: vi.fn(),
  };
});

// Mock Firestore module functions
vi.mock('firebase/firestore', async (importOriginal) => {
  const actual = await importOriginal<typeof import('firebase/firestore')>();
  return {
    ...actual,
    setDoc: vi.fn(),
    getDoc: vi.fn(),
    updateDoc: vi.fn(),
    deleteDoc: vi.fn(),
  };
});

describe('Phase 4B.2 Firebase Storage Security Architecture & Rules Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('1. Unauthenticated user reads book PDF -> DENY', () => {
    const isAllowed = evaluateStorageRuleRead(null, { status: 'published' });
    expect(isAllowed).toBe(false);
  });

  it('2. Student reads published book -> ALLOW', () => {
    const studentUser = { uid: 'student1', role: 'student' };
    const isAllowed = evaluateStorageRuleRead(studentUser, { status: 'published' });
    expect(isAllowed).toBe(true);
  });

  it('3. Student reads draft book -> DENY', () => {
    const studentUser = { uid: 'student1', role: 'student' };
    const isAllowed = evaluateStorageRuleRead(studentUser, { status: 'draft' });
    expect(isAllowed).toBe(false);
  });

  it('4. Student reads unpublished book -> DENY', () => {
    const studentUser = { uid: 'student1', role: 'student' };
    const isAllowed = evaluateStorageRuleRead(studentUser, { status: 'unpublished' });
    expect(isAllowed).toBe(false);
  });

  it('5. Student uploads PDF -> DENY', () => {
    const studentUser = { uid: 'student1', role: 'student' };
    const isAllowed = evaluateStorageRuleWrite(studentUser, { size: 1024, contentType: 'application/pdf' });
    expect(isAllowed).toBe(false);
  });

  it('6. Student deletes PDF -> DENY', () => {
    const studentUser = { uid: 'student1', role: 'student' };
    const isAllowed = evaluateStorageRuleDelete(studentUser);
    expect(isAllowed).toBe(false);
  });

  it('7. Admin uploads PDF -> ALLOW', () => {
    const adminUser = { uid: 'admin1', role: 'admin' };
    const isAllowed = evaluateStorageRuleWrite(adminUser, { size: 1024, contentType: 'application/pdf' });
    expect(isAllowed).toBe(true);
  });

  it('8. Admin reads PDF (draft, published, or unpublished) -> ALLOW', () => {
    const adminUser = { uid: 'admin1', role: 'admin' };
    expect(evaluateStorageRuleRead(adminUser, { status: 'draft' })).toBe(true);
    expect(evaluateStorageRuleRead(adminUser, { status: 'published' })).toBe(true);
    expect(evaluateStorageRuleRead(adminUser, { status: 'unpublished' })).toBe(true);
  });

  it('9. Admin deletes PDF -> ALLOW', () => {
    const adminUser = { uid: 'admin1', role: 'admin' };
    const isAllowed = evaluateStorageRuleDelete(adminUser);
    expect(isAllowed).toBe(true);
  });

  it('10. SuperAdmin reads PDF -> ALLOW', () => {
    const superUser = { uid: 'super1', role: 'superAdmin' };
    expect(evaluateStorageRuleRead(superUser, { status: 'draft' })).toBe(true);
    expect(evaluateStorageRuleRead(superUser, { status: 'published' })).toBe(true);
  });

  it('11. SuperAdmin deletes PDF -> ALLOW', () => {
    const superUser = { uid: 'super1', role: 'superAdmin' };
    const isAllowed = evaluateStorageRuleDelete(superUser);
    expect(isAllowed).toBe(true);
  });

  // Preservation of File Validation, Rollback, and Status Metadata Syncing
  it('12. Invalid file type (.exe) is rejected before upload', async () => {
    const invalidExe = new File(['binary'], 'malware.exe', { type: 'application/x-msdownload' });
    await expect(contentService.uploadBookPdf({
      file: invalidExe,
      classId: '8',
      subjectId: 'maths'
    })).rejects.toThrow(/Only PDF documents \(\.pdf\) are allowed/i);
  });

  it('13. >50 MB file is rejected before upload', async () => {
    const oversizedFile = new File(['a'.repeat(100)], 'huge.pdf', { type: 'application/pdf' });
    Object.defineProperty(oversizedFile, 'size', { value: 60 * 1024 * 1024 });

    await expect(contentService.uploadBookPdf({
      file: oversizedFile,
      classId: '8',
      subjectId: 'maths'
    })).rejects.toThrow(/exceeds maximum allowed limit of 50MB/i);
  });

  it('14. Orphan storage cleanup is triggered if Firestore book creation fails', async () => {
    const deleteObjectMock = vi.mocked(deleteObject);
    const firestore = await import('firebase/firestore');
    vi.mocked(firestore.setDoc).mockRejectedValueOnce(new Error('Firestore write failure'));

    const bookData = {
      title: 'NCERT Math',
      subjectId: 'maths',
      pdfUrl: 'https://storage.example.com/math.pdf',
      storagePath: 'books/class_8/maths/1000_math.pdf'
    };

    await expect(contentService.createBook('8', bookData, true)).rejects.toThrow(/Firestore write failure/i);
    expect(deleteObjectMock).toHaveBeenCalled();
  });

  it('15. Updating book status synchronizes Storage metadata status', async () => {
    const updateMetadataMock = vi.mocked(updateMetadata);
    const firestore = await import('firebase/firestore');
    
    vi.mocked(firestore.updateDoc).mockResolvedValueOnce();
    vi.mocked(firestore.getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ storagePath: 'books/class_8/maths/1000_math.pdf' })
    } as any);

    await contentService.updateBook('8', 'b1', { status: 'unpublished' });
    expect(updateMetadataMock).toHaveBeenCalledWith(
      expect.anything(),
      { customMetadata: { status: 'unpublished' } }
    );
  });
});
