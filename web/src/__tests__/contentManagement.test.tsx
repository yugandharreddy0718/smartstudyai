import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import SubjectManagement from '../components/admin/SubjectManagement';
import ChapterManagement from '../components/admin/ChapterManagement';
import BookManagement from '../components/admin/BookManagement';
import * as contentService from '../services/contentManagementService';

// Mock Auth Hook
let mockAuth = {
  user: { uid: 'admin123', email: 'admin@smartstudy.ai' } as any,
  profile: { uid: 'admin123', displayName: 'Admin User', role: 'admin' } as any,
  loading: false,
};

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => mockAuth,
}));

describe('Phase 4B Content Management Automated Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================
  // SUBJECTS TESTS
  // ==========================================
  describe('Subjects Management', () => {
    it('1. Admin can view subjects', async () => {
      vi.spyOn(contentService, 'getSubjectsByClass').mockResolvedValueOnce([
        {
          id: 'maths',
          name: 'Mathematics',
          classId: 'class_8',
          description: 'Maths curriculum for Grade 8',
          icon: '📐',
          totalChapters: 5,
          order: 1,
          status: 'published',
          createdAt: 1000,
          updatedAt: 1000,
        },
      ]);

      render(
        <MemoryRouter>
          <SubjectManagement />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Mathematics')).toBeInTheDocument();
        expect(screen.getByText('5')).toBeInTheDocument();
      });
    });

    it('2. Admin can create subject', async () => {
      vi.spyOn(contentService, 'getSubjectsByClass').mockResolvedValue([]);
      const createSpy = vi.spyOn(contentService, 'createSubject').mockResolvedValueOnce({
        id: 'computer',
        name: 'Computer Science',
        classId: 'class_8',
        description: 'CS Basics',
        icon: '💻',
        order: 1,
        status: 'published',
        createdAt: 1000,
        updatedAt: 1000,
      });

      render(
        <MemoryRouter>
          <SubjectManagement />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('No Subjects Found')).toBeInTheDocument();
      });

      const addBtn = screen.getByRole('button', { name: /add subject/i });
      fireEvent.click(addBtn);

      const nameInput = screen.getByPlaceholderText(/e\.g\. Mathematics/i);
      fireEvent.change(nameInput, { target: { value: 'Computer Science' } });

      const submitBtn = screen.getByRole('button', { name: /create subject/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(createSpy).toHaveBeenCalledWith('8', expect.objectContaining({ name: 'Computer Science' }));
      });
    });

    it('3. Admin can edit subject', async () => {
      vi.spyOn(contentService, 'getSubjectsByClass').mockResolvedValue([
        {
          id: 'science',
          name: 'Science Fundamentals',
          classId: 'class_8',
          description: 'Basic Science',
          icon: '🔬',
          totalChapters: 3,
          order: 2,
          status: 'published',
          createdAt: 1000,
          updatedAt: 1000,
        },
      ]);
      const updateSpy = vi.spyOn(contentService, 'updateSubject').mockResolvedValueOnce();

      render(
        <MemoryRouter>
          <SubjectManagement />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Science Fundamentals')).toBeInTheDocument();
      });

      const editBtn = screen.getByTitle('Edit subject');
      fireEvent.click(editBtn);

      const nameInput = screen.getByPlaceholderText(/e\.g\. Mathematics/i);
      fireEvent.change(nameInput, { target: { value: 'Advanced Science' } });

      const saveBtn = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(updateSpy).toHaveBeenCalledWith('8', 'science', expect.objectContaining({ name: 'Advanced Science' }));
      });
    });

    it('4. Admin can delete safe subject', async () => {
      vi.spyOn(contentService, 'getSubjectsByClass').mockResolvedValue([
        {
          id: 'geography',
          name: 'Geography',
          classId: 'class_8',
          description: 'Earth science',
          icon: '🌍',
          totalChapters: 0,
          order: 3,
          status: 'published',
          createdAt: 1000,
          updatedAt: 1000,
        },
      ]);
      const deleteSpy = vi.spyOn(contentService, 'deleteSubject').mockResolvedValueOnce();

      render(
        <MemoryRouter>
          <SubjectManagement />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Geography')).toBeInTheDocument();
      });

      const deleteBtn = screen.getByTitle('Delete subject');
      fireEvent.click(deleteBtn);

      const confirmBtn = screen.getByRole('button', { name: /confirm delete/i });
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(deleteSpy).toHaveBeenCalledWith('8', 'geography');
      });
    });

    it('5. Delete subject is blocked if dependent chapters exist', async () => {
      vi.spyOn(contentService, 'getSubjectsByClass').mockResolvedValue([
        {
          id: 'maths',
          name: 'Mathematics',
          classId: 'class_8',
          description: 'Has chapters',
          icon: '📐',
          totalChapters: 2,
          order: 1,
          status: 'published',
          createdAt: 1000,
          updatedAt: 1000,
        },
      ]);
      vi.spyOn(contentService, 'deleteSubject').mockRejectedValueOnce(
        new Error('Cannot delete subject "maths": It contains 2 active chapter(s). Please delete or reassign chapters first.')
      );

      render(
        <MemoryRouter>
          <SubjectManagement />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Mathematics')).toBeInTheDocument();
      });

      const deleteBtn = screen.getByTitle('Delete subject');
      fireEvent.click(deleteBtn);

      const confirmBtn = screen.getByRole('button', { name: /confirm delete/i });
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(screen.getByText(/Contains 2 active chapter\(s\)/i)).toBeInTheDocument();
      });
    });
  });

  // ==========================================
  // CHAPTERS TESTS
  // ==========================================
  describe('Chapters Management', () => {
    it('8. Admin can view chapters', async () => {
      vi.spyOn(contentService, 'getSubjectsByClass').mockResolvedValue([
        { id: 'maths', name: 'Mathematics', classId: 'class_8', description: '', order: 1, status: 'published', createdAt: 1, updatedAt: 1 }
      ]);
      const chapterSpy = vi.spyOn(contentService, 'getChaptersBySubject').mockResolvedValue([
        {
          id: 'c1',
          subjectId: 'maths',
          classId: 'class_8',
          title: 'Rational Numbers',
          description: 'Understanding fractions & scale',
          order: 1,
          totalLessons: 3,
          estimatedMinutes: 45,
          status: 'published',
          createdAt: 1000,
          updatedAt: 1000,
        },
      ]);

      render(
        <MemoryRouter>
          <ChapterManagement />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(chapterSpy).toHaveBeenCalled();
        expect(screen.getByText('Rational Numbers')).toBeInTheDocument();
        expect(screen.getByText('45')).toBeInTheDocument();
      });
    });

    it('9. Admin can create chapter', async () => {
      vi.spyOn(contentService, 'getSubjectsByClass').mockResolvedValue([
        { id: 'maths', name: 'Mathematics', classId: 'class_8', description: '', order: 1, status: 'published', createdAt: 1, updatedAt: 1 }
      ]);
      vi.spyOn(contentService, 'getChaptersBySubject').mockResolvedValue([]);
      const createSpy = vi.spyOn(contentService, 'createChapter').mockResolvedValueOnce({
        id: 'c2',
        subjectId: 'maths',
        classId: 'class_8',
        title: 'Linear Equations',
        description: 'Single variable equations',
        order: 2,
        totalLessons: 1,
        estimatedMinutes: 30,
        status: 'published',
        createdAt: 1000,
        updatedAt: 1000,
      });

      render(
        <MemoryRouter>
          <ChapterManagement />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('No Chapters Found')).toBeInTheDocument();
      });

      const addBtn = screen.getByRole('button', { name: /add chapter/i });
      fireEvent.click(addBtn);

      const titleInput = screen.getByPlaceholderText(/e\.g\. Knowing Our Numbers/i);
      fireEvent.change(titleInput, { target: { value: 'Linear Equations' } });

      const submitBtn = screen.getByRole('button', { name: /create chapter/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(createSpy).toHaveBeenCalledWith('8', 'maths', expect.objectContaining({ title: 'Linear Equations' }));
      });
    });
  });

  // ==========================================
  // BOOKS & STORAGE TESTS
  // ==========================================
  describe('Books & Firebase Storage Upload Validation', () => {
    it('13. Admin can open book management view', async () => {
      vi.spyOn(contentService, 'getSubjectsByClass').mockResolvedValue([]);
      vi.spyOn(contentService, 'getBooksByClass').mockResolvedValueOnce([
        {
          id: 'b1',
          title: 'NCERT Grade 8 Math Textbook',
          classId: 'class_8',
          subjectId: 'maths',
          description: 'Official NCERT Math Textbook',
          pdfUrl: 'https://storage.example.com/math.pdf',
          storagePath: 'books/class_8/maths/math.pdf',
          fileSizeBytes: 10485760, // 10 MB
          fileName: 'math_grade8.pdf',
          status: 'published',
          createdAt: 1000,
          updatedAt: 1000,
        },
      ]);

      render(
        <MemoryRouter>
          <BookManagement />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('NCERT Grade 8 Math Textbook')).toBeInTheDocument();
        expect(screen.getByText('10 MB')).toBeInTheDocument();
      });
    });

    it('14. Valid PDF file passes client validation', async () => {
      vi.spyOn(contentService, 'getSubjectsByClass').mockResolvedValue([
        { id: 'maths', name: 'Mathematics', classId: 'class_8', description: '', order: 1, status: 'published', createdAt: 1, updatedAt: 1 }
      ]);
      vi.spyOn(contentService, 'getBooksByClass').mockResolvedValue([]);

      render(
        <MemoryRouter>
          <BookManagement />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('No Books Found')).toBeInTheDocument();
      });

      const uploadBtn = screen.getByRole('button', { name: /upload book/i });
      fireEvent.click(uploadBtn);

      const fileInput = document.getElementById('book-pdf-input') as HTMLInputElement;
      const validPdfFile = new File(['dummy pdf content'], 'valid_textbook.pdf', { type: 'application/pdf' });

      fireEvent.change(fileInput, { target: { files: [validPdfFile] } });

      await waitFor(() => {
        expect(screen.getByText(/Selected: valid_textbook.pdf/i)).toBeInTheDocument();
      });
    });

    it('15. Invalid file type (non-PDF) is rejected with clear error', async () => {
      vi.spyOn(contentService, 'getSubjectsByClass').mockResolvedValue([
        { id: 'maths', name: 'Mathematics', classId: 'class_8', description: '', order: 1, status: 'published', createdAt: 1, updatedAt: 1 }
      ]);
      vi.spyOn(contentService, 'getBooksByClass').mockResolvedValue([]);

      render(
        <MemoryRouter>
          <BookManagement />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('No Books Found')).toBeInTheDocument();
      });

      const uploadBtn = screen.getByRole('button', { name: /upload book/i });
      fireEvent.click(uploadBtn);

      const fileInput = document.getElementById('book-pdf-input') as HTMLInputElement;
      const invalidExeFile = new File(['binary content'], 'virus.exe', { type: 'application/x-msdownload' });

      fireEvent.change(fileInput, { target: { files: [invalidExeFile] } });

      await waitFor(() => {
        expect(screen.getByText(/Only PDF documents \(\.pdf\) are allowed/i)).toBeInTheDocument();
      });
    });

    it('16. File size exceeding 50MB is rejected', async () => {
      vi.spyOn(contentService, 'getSubjectsByClass').mockResolvedValue([
        { id: 'maths', name: 'Mathematics', classId: 'class_8', description: '', order: 1, status: 'published', createdAt: 1, updatedAt: 1 }
      ]);
      vi.spyOn(contentService, 'getBooksByClass').mockResolvedValue([]);

      render(
        <MemoryRouter>
          <BookManagement />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('No Books Found')).toBeInTheDocument();
      });

      const uploadBtn = screen.getByRole('button', { name: /upload book/i });
      fireEvent.click(uploadBtn);

      const fileInput = document.getElementById('book-pdf-input') as HTMLInputElement;
      const oversizedFile = new File(['a'.repeat(1000)], 'huge.pdf', { type: 'application/pdf' });
      Object.defineProperty(oversizedFile, 'size', { value: 60 * 1024 * 1024 }); // 60 MB

      fireEvent.change(fileInput, { target: { files: [oversizedFile] } });

      await waitFor(() => {
        expect(screen.getByText(/exceeds 50MB maximum limit/i)).toBeInTheDocument();
      });
    });
  });

  // ==========================================
  // PUBLISHING & STATUS TESTS
  // ==========================================
  describe('Publishing Lifecycle & Status Control', () => {
    it('19. Admin can toggle content status between Published and Unpublished', async () => {
      vi.spyOn(contentService, 'getSubjectsByClass').mockResolvedValue([
        {
          id: 'physics',
          name: 'Physics',
          classId: 'class_8',
          description: '',
          order: 1,
          status: 'published',
          createdAt: 1,
          updatedAt: 1,
        },
      ]);
      const updateSpy = vi.spyOn(contentService, 'updateSubject').mockResolvedValueOnce();

      render(
        <MemoryRouter>
          <SubjectManagement />
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Physics')).toBeInTheDocument();
      });

      const statusBtn = screen.getByRole('button', { name: /published/i });
      fireEvent.click(statusBtn);

      await waitFor(() => {
        expect(updateSpy).toHaveBeenCalledWith('8', 'physics', { status: 'unpublished' });
      });
    });
  });
});
