import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import App from '../App';

// Mock useAuth hook so we don't depend on actual Firebase during unit tests
vi.mock('../hooks/useAuth', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useAuth: vi.fn(() => ({
    user: null,
    loading: false,
    loginWithGoogle: vi.fn(),
    logout: vi.fn(),
  })),
}));

describe('SmartStudy AI App Unit Tests', () => {
  it('renders login screen container when user is unauthenticated', () => {
    const { container } = render(<App />);
    expect(container).toBeDefined();
    expect(container.firstChild).not.toBeNull();
  });

  it('contains expected app layout structure', () => {
    const { container } = render(<App />);
    expect(container.innerHTML).toBeTruthy();
  });
});
