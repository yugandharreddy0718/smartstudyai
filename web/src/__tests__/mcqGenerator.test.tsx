import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import LessonDetailsScreen from '../components/LessonDetailsScreen';
import { geminiService } from '../services/geminiService';

vi.mock('../services/geminiService', () => ({
  geminiService: {
    generateSummary: vi.fn(),
    generateQuiz: vi.fn(),
    generateFlashcards: vi.fn(),
    generateTopics: vi.fn(),
    generateExplanation: vi.fn(),
    generateImportantQuestions: vi.fn(),
    generateMCQs: vi.fn()
  }
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { uid: 'student123', email: 'student@example.com' },
    profile: {
      uid: 'student123',
      displayName: 'Student One',
      studentClass: '8',
      role: 'student',
      completedLessons: []
    },
    loading: false,
    completeLesson: vi.fn()
  })
}));

vi.mock('../data/curriculum', () => ({
  getLessonById: vi.fn().mockImplementation((id: string) => ({
    id: id || 'test-lesson-1',
    title: 'Understanding Whole Numbers & Operations',
    content: 'Whole numbers consist of all natural numbers including zero: 0, 1, 2, 3... Natural numbers start from 1.',
    duration: '15 mins',
    xp: 50,
    subjectId: 'maths',
    grade: '8'
  }))
}));

describe('Standalone MCQ Generator Tests', () => {
  const mockMCQs = [
    {
      question: 'What is the smallest whole number?',
      options: ['1', '0', '-1', '10'],
      correctAnswer: 1,
      explanation: 'Zero (0) is the smallest whole number.'
    },
    {
      question: 'Which of the following is NOT a natural number?',
      options: ['5', '1', '0', '100'],
      correctAnswer: 2,
      explanation: 'Natural numbers start from 1, so 0 is not a natural number.'
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (lessonId = 'math-101') => {
    return render(
      <MemoryRouter initialEntries={[`/lesson/${lessonId}`]}>
        <Routes>
          <Route path="/lesson/:lessonId" element={<LessonDetailsScreen />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('1. renders the MCQ Generator action button in the Learning Studio sidebar', () => {
    renderComponent();
    expect(screen.getByRole('button', { name: /MCQ Generator/i })).toBeInTheDocument();
  });

  it('2. opens configuration view when MCQ Generator button is clicked', () => {
    renderComponent();
    const mcqBtn = screen.getByRole('button', { name: /MCQ Generator/i });
    fireEvent.click(mcqBtn);

    expect(screen.getByText(/Number of Questions/i)).toBeInTheDocument();
    expect(screen.getByText(/Difficulty/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Generate MCQs/i })).toBeInTheDocument();
  });

  it('3. allows selecting question count and difficulty options', () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /MCQ Generator/i }));

    const count15Btn = screen.getByRole('button', { name: '15' });
    fireEvent.click(count15Btn);
    expect(count15Btn).toHaveClass('bg-teal-600');

    const hardBtn = screen.getByRole('button', { name: 'Hard' });
    fireEvent.click(hardBtn);
    expect(hardBtn).toHaveClass('bg-teal-600');
  });

  it('4. calls geminiService.generateMCQs with selected count and difficulty', async () => {
    (geminiService.generateMCQs as any).mockResolvedValueOnce(mockMCQs);

    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /MCQ Generator/i }));

    fireEvent.click(screen.getByRole('button', { name: '15' }));
    fireEvent.click(screen.getByRole('button', { name: 'Hard' }));
    fireEvent.click(screen.getByRole('button', { name: /Generate MCQs/i }));

    await waitFor(() => {
      expect(geminiService.generateMCQs).toHaveBeenCalledWith(
        expect.stringContaining('Whole numbers'),
        15,
        'hard'
      );
    });

    expect(screen.getByText('What is the smallest whole number?')).toBeInTheDocument();
  });

  it('5. renders options A, B, C, D and enforces single option selection', async () => {
    (geminiService.generateMCQs as any).mockResolvedValueOnce(mockMCQs);

    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /MCQ Generator/i }));
    fireEvent.click(screen.getByRole('button', { name: /Generate MCQs/i }));

    const optionA = await screen.findByRole('button', { name: /A.*1/i });
    const optionB = await screen.findByRole('button', { name: /A.*0|B.*0/i });

    // Select Option A
    fireEvent.click(optionA);
    expect(optionA).toHaveClass('bg-teal-50');

    // Select Option B (switches selection)
    fireEvent.click(optionB);
    expect(optionB).toHaveClass('bg-teal-50');
    expect(optionA).not.toHaveClass('bg-teal-50');
  });

  it('6. calculates score, breakdown, and displays detailed review on Submit Test', async () => {
    (geminiService.generateMCQs as any).mockResolvedValueOnce(mockMCQs);

    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /MCQ Generator/i }));
    fireEvent.click(screen.getByRole('button', { name: /Generate MCQs/i }));

    const optionB = await screen.findByRole('button', { name: /A.*0|B.*0/i });
    fireEvent.click(optionB);

    const nextBtn = await screen.findByRole('button', { name: /Next Question/i });
    fireEvent.click(nextBtn);

    // Q2: Select wrong option A (correctAnswer: 2)
    const q2OptionA = await screen.findByRole('button', { name: /A.*5/i });
    fireEvent.click(q2OptionA);

    // Submit Test on final question
    const submitBtn = await screen.findByRole('button', { name: /Submit Test/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('MCQ RESULT')).toBeInTheDocument();
    });

    expect(screen.getByText(/50% Score/i)).toBeInTheDocument();
    expect(screen.getByText(/Zero \(0\) is the smallest whole number\./i)).toBeInTheDocument();
  });

  it('7. resets test state when Try Again is clicked', async () => {
    (geminiService.generateMCQs as any).mockResolvedValueOnce(mockMCQs);

    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /MCQ Generator/i }));
    fireEvent.click(screen.getByRole('button', { name: /Generate MCQs/i }));

    const nextBtn = await screen.findByRole('button', { name: /Next Question/i });
    fireEvent.click(nextBtn);

    const submitBtn = await screen.findByRole('button', { name: /Submit Test/i });
    fireEvent.click(submitBtn);

    const tryAgainBtn = await screen.findByRole('button', { name: /Try Again/i });
    fireEvent.click(tryAgainBtn);

    await waitFor(() => {
      expect(screen.getByText('What is the smallest whole number?')).toBeInTheDocument();
    });

    expect(screen.queryByText('MCQ RESULT')).not.toBeInTheDocument();
  });

  it('8. returns to configuration view when Generate New MCQs is clicked', async () => {
    (geminiService.generateMCQs as any).mockResolvedValueOnce(mockMCQs);

    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /MCQ Generator/i }));
    fireEvent.click(screen.getByRole('button', { name: /Generate MCQs/i }));

    const nextBtn = await screen.findByRole('button', { name: /Next Question/i });
    fireEvent.click(nextBtn);

    const submitBtn = await screen.findByRole('button', { name: /Submit Test/i });
    fireEvent.click(submitBtn);

    const genNewBtn = await screen.findByRole('button', { name: /Generate New MCQs/i });
    fireEvent.click(genNewBtn);

    await waitFor(() => {
      expect(screen.getByText(/Number of Questions/i)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /Generate MCQs/i })).toBeInTheDocument();
  });

  it('9. displays error message and Retry button on API failure', async () => {
    (geminiService.generateMCQs as any).mockRejectedValueOnce(new Error('Failed to generate MCQs'));

    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /MCQ Generator/i }));
    fireEvent.click(screen.getByRole('button', { name: /Generate MCQs/i }));

    await waitFor(() => {
      expect(screen.getByText(/Failed to generate MCQs/i)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument();
  });
});
