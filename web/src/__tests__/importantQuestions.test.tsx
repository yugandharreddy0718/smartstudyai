import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import LessonDetailsScreen from '../components/LessonDetailsScreen';
import { geminiService } from '../services/geminiService.js';
import { ImportantQuestion } from '@smartstudy/shared';

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { uid: 'student123' },
    profile: {
      studentClass: '6',
      stats: { level: 1, xp: 100, streak: 3 },
      completedLessons: [],
    },
    completeLesson: vi.fn(),
  }),
}));

const mockQuestions: ImportantQuestion[] = [
  {
    question: 'What is a prime number?',
    marks: 1,
    type: 'very_short',
    answer: 'A prime number is a natural number greater than 1 that has no positive divisors other than 1 and itself.',
    keyPoints: ['Number > 1', 'Divisors are 1 and itself'],
  },
  {
    question: 'Explain the difference between prime and composite numbers.',
    marks: 2,
    type: 'short',
    answer: 'Prime numbers have exactly two factors, while composite numbers have more than two factors.',
    keyPoints: ['Prime: exactly 2 factors', 'Composite: more than 2 factors'],
  },
  {
    question: 'Find the prime factorization of 36 with step-by-step division.',
    marks: 3,
    type: 'medium',
    answer: 'Divide by 2: 36/2 = 18. Divide by 2: 18/2 = 9. Divide by 3: 9/3 = 3. 36 = 2 x 2 x 3 x 3.',
    keyPoints: ['Step 1: Divide by 2', 'Step 2: Divide by 3', 'Final expression: 2^2 x 3^2'],
  },
  {
    question: 'Discuss the Fundamental Theorem of Arithmetic and prove why prime factorization is unique.',
    marks: 5,
    type: 'long',
    answer: 'Every composite number can be expressed uniquely as a product of primes up to the order of factors.',
    keyPoints: ['Existence of prime decomposition', 'Uniqueness proof by contradiction', 'Fundamental role in number theory'],
  },
];

describe('Important Questions & Answers (High-Yield Exam Q&A Generator) Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders "Important Q&A" action button in Learning Studio sidebar', () => {
    render(
      <MemoryRouter initialEntries={['/lessons/g6-maths-c1']}>
        <Routes>
          <Route path="/lessons/:lessonId" element={<LessonDetailsScreen />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Important Q&A')).toBeInTheDocument();
  });

  it('triggers generateImportantQuestions API call with lesson content payload', async () => {
    const spy = vi.spyOn(geminiService, 'generateImportantQuestions').mockResolvedValue(mockQuestions);

    render(
      <MemoryRouter initialEntries={['/lessons/g6-maths-c1']}>
        <Routes>
          <Route path="/lessons/:lessonId" element={<LessonDetailsScreen />} />
        </Routes>
      </MemoryRouter>
    );

    const btn = screen.getByText('Important Q&A').closest('button')!;
    fireEvent.click(btn);

    await waitFor(() => {
      expect(spy).toHaveBeenCalledTimes(1);
    });

    const callArg = spy.mock.calls[0][0];
    expect(callArg).toBeTruthy();
    expect(typeof callArg).toBe('string');
  });

  it('displays loading state while generating questions', async () => {
    vi.spyOn(geminiService, 'generateImportantQuestions').mockReturnValue(
      new Promise((resolve) => setTimeout(() => resolve(mockQuestions), 300))
    );

    render(
      <MemoryRouter initialEntries={['/lessons/g6-maths-c1']}>
        <Routes>
          <Route path="/lessons/:lessonId" element={<LessonDetailsScreen />} />
        </Routes>
      </MemoryRouter>
    );

    const btn = screen.getByText('Important Q&A');
    fireEvent.click(btn);

    const actionBtn = screen.getByText('Important Q&A').closest('button');
    expect(actionBtn).toBeDisabled();

    await waitFor(() => {
      expect(screen.getByText('High-Yield Exam Q&A')).toBeInTheDocument();
    });
  });

  it('renders generated questions correctly grouped by marks (1, 2, 3, 5 Marks)', async () => {
    vi.spyOn(geminiService, 'generateImportantQuestions').mockResolvedValue(mockQuestions);

    render(
      <MemoryRouter initialEntries={['/lessons/g6-maths-c1']}>
        <Routes>
          <Route path="/lessons/:lessonId" element={<LessonDetailsScreen />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Important Q&A').closest('button')!);

    await waitFor(() => {
      expect(screen.getByText('High-Yield Exam Q&A')).toBeInTheDocument();
    });

    expect(screen.getByText('1 MARK — Very Short Answer')).toBeInTheDocument();
    expect(screen.getByText('2 MARKS — Short Answer')).toBeInTheDocument();
    expect(screen.getByText('3 MARKS — Medium Answer')).toBeInTheDocument();
    expect(screen.getByText('5 MARKS — Long / Analytical Answer')).toBeInTheDocument();

    expect(screen.getByText('What is a prime number?')).toBeInTheDocument();
    expect(screen.getByText('Explain the difference between prime and composite numbers.')).toBeInTheDocument();
    expect(screen.getByText('Find the prime factorization of 36 with step-by-step division.')).toBeInTheDocument();
    expect(screen.getByText('Discuss the Fundamental Theorem of Arithmetic and prove why prime factorization is unique.')).toBeInTheDocument();
  });

  it('expands and collapses model answer and key marking points on Show Answer click', async () => {
    vi.spyOn(geminiService, 'generateImportantQuestions').mockResolvedValue(mockQuestions);

    render(
      <MemoryRouter initialEntries={['/lessons/g6-maths-c1']}>
        <Routes>
          <Route path="/lessons/:lessonId" element={<LessonDetailsScreen />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Important Q&A').closest('button')!);

    await waitFor(() => {
      expect(screen.getByText('What is a prime number?')).toBeInTheDocument();
    });

    expect(screen.queryByText('Model Answer')).not.toBeInTheDocument();

    const showAnswerButtons = screen.getAllByText('Show Answer');
    fireEvent.click(showAnswerButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Model Answer')).toBeInTheDocument();
      expect(screen.getByText(/natural number greater than 1/i)).toBeInTheDocument();
      expect(screen.getByText('Key Marking Points')).toBeInTheDocument();
      expect(screen.getByText('Divisors are 1 and itself')).toBeInTheDocument();
    });

    const hideBtn = screen.getByText('Hide Answer');
    fireEvent.click(hideBtn);

    await waitFor(() => {
      expect(screen.queryByText('Model Answer')).not.toBeInTheDocument();
    });
  });

  it('handles API error gracefully and supports Retry behavior', async () => {
    const spy = vi.spyOn(geminiService, 'generateImportantQuestions')
      .mockRejectedValueOnce(new Error('Network error generating questions'))
      .mockResolvedValueOnce(mockQuestions);

    render(
      <MemoryRouter initialEntries={['/lessons/g6-maths-c1']}>
        <Routes>
          <Route path="/lessons/:lessonId" element={<LessonDetailsScreen />} />
        </Routes>
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('Important Q&A').closest('button')!);

    await waitFor(() => {
      expect(screen.getByText('Network error generating questions')).toBeInTheDocument();
    });

    const retryBtn = screen.getByText('Retry');
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByText('What is a prime number?')).toBeInTheDocument();
    });
  });

  it('handles empty questions list state', async () => {
    vi.spyOn(geminiService, 'generateImportantQuestions').mockResolvedValue([]);

    render(
      <MemoryRouter initialEntries={['/lessons/g6-maths-c1']}>
        <Routes>
          <Route path="/lessons/:lessonId" element={<LessonDetailsScreen />} />
        </Routes>
      </MemoryRouter>
    );

    const btn = screen.getByText('Important Q&A').closest('button')!;
    fireEvent.click(btn);

    await waitFor(() => {
      expect(screen.getByText('No exam questions generated')).toBeInTheDocument();
    });
  });
});
