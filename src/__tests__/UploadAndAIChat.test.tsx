import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import Upload from '../components/Upload';
import AIChat from '../components/AIChat';

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
  })),
}));

describe('Upload & AIChat Component Unit Tests', () => {
  it('renders Upload studio interface', () => {
    const { container } = render(
      <MemoryRouter>
        <Upload />
      </MemoryRouter>
    );
    expect(container).toBeDefined();
    expect(screen.getByText(/Drop your study material here/i)).toBeInTheDocument();
  });

  it('renders AIChat interface', () => {
    const { container } = render(
      <MemoryRouter>
        <AIChat />
      </MemoryRouter>
    );
    expect(container).toBeDefined();
    expect(screen.getByText(/Smart Tutor/i)).toBeInTheDocument();
  });
});
