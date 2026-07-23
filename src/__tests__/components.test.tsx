import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import Login from '../components/Login';
import SubjectList from '../components/SubjectList';
import Profile from '../components/Profile';

vi.mock('../hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: { uid: '123', email: 'student@example.com' },
    profile: {
      studentClass: '8',
      stats: { level: 1, xp: 100, streak: 3 },
      completedLessons: [],
    },
    loginWithGoogle: vi.fn(),
    logout: vi.fn(),
    setStudentClass: vi.fn(),
  })),
}));

describe('React Component Unit Tests', () => {
  it('renders Login component correctly', () => {
    render(<Login />);
    expect(screen.getByText(/SmartStudy/i)).toBeInTheDocument();
  });

  it('renders SubjectList component with subjects', () => {
    render(
      <MemoryRouter>
        <SubjectList />
      </MemoryRouter>
    );
    expect(screen.getByText(/Library/i)).toBeInTheDocument();
  });

  it('renders Profile component with user metrics', () => {
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );
    expect(screen.getByText(/Student ID/i)).toBeInTheDocument();
  });
});
