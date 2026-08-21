import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AdminRoute from '../components/AdminRoute';
import { normalizeUserProfile } from '@smartstudy/firebase';

let mockAuth = {
  user: null as any,
  profile: null as any,
  loading: false,
};

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => mockAuth,
}));

describe('Admin Authentication & Authorization Unit Tests', () => {
  it('normalizes user profile with role = student by default', () => {
    const rawData = {
      uid: 'user123',
      email: 'student@example.com',
      displayName: 'Test Student',
      studentClass: '8',
    };
    const normalized = normalizeUserProfile(rawData);
    expect(normalized.role).toBe('student');
  });

  it('preserves existing admin role during normalization', () => {
    const rawData = {
      uid: 'admin123',
      email: 'admin@example.com',
      displayName: 'Test Admin',
      studentClass: '8',
      role: 'admin',
    };
    const normalized = normalizeUserProfile(rawData);
    expect(normalized.role).toBe('admin');
  });

  it('redirects student away from /admin', () => {
    mockAuth = {
      user: { uid: 'student123' },
      profile: { uid: 'student123', role: 'student' } as any,
      loading: false,
    };

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/" element={<div>Student Home</div>} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <div>Admin Secret Panel</div>
              </AdminRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Student Home')).toBeInTheDocument();
    expect(screen.queryByText('Admin Secret Panel')).not.toBeInTheDocument();
  });

  it('allows access for admin role on /admin', () => {
    mockAuth = {
      user: { uid: 'admin123' },
      profile: { uid: 'admin123', role: 'admin' } as any,
      loading: false,
    };

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/" element={<div>Student Home</div>} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <div>Admin Secret Panel</div>
              </AdminRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Admin Secret Panel')).toBeInTheDocument();
  });

  it('allows access for superAdmin role on /admin', () => {
    mockAuth = {
      user: { uid: 'super123' },
      profile: { uid: 'super123', role: 'superAdmin' } as any,
      loading: false,
    };

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/" element={<div>Student Home</div>} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <div>Admin Secret Panel</div>
              </AdminRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Admin Secret Panel')).toBeInTheDocument();
  });
});
