import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Shell } from '../components/layout/Shell';
import AdminRoute from '../components/AdminRoute';

let mockAuth = {
  user: { uid: 'user1' },
  profile: { role: 'superAdmin' } as any,
  loading: false,
};

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => mockAuth,
}));

describe('Shell Navigation Component Unit Tests', () => {
  it('renders Admin Panel in sidebar when role is superAdmin', () => {
    mockAuth = {
      user: { uid: 'super1' },
      profile: { role: 'superAdmin' } as any,
      loading: false,
    };

    render(
      <MemoryRouter initialEntries={['/']}>
        <Shell>
          <div>Dashboard Content</div>
        </Shell>
      </MemoryRouter>
    );

    const adminPanelElements = screen.getAllByText('Admin Panel');
    expect(adminPanelElements.length).toBeGreaterThan(0);
    expect(adminPanelElements[0]).toBeInTheDocument();
  });

  it('renders Admin Panel in sidebar when role is admin', () => {
    mockAuth = {
      user: { uid: 'admin1' },
      profile: { role: 'admin' } as any,
      loading: false,
    };

    render(
      <MemoryRouter initialEntries={['/']}>
        <Shell>
          <div>Dashboard Content</div>
        </Shell>
      </MemoryRouter>
    );

    const adminPanelElements = screen.getAllByText('Admin Panel');
    expect(adminPanelElements.length).toBeGreaterThan(0);
    expect(adminPanelElements[0]).toBeInTheDocument();
  });

  it('does NOT render Admin Panel in sidebar when role is student', () => {
    mockAuth = {
      user: { uid: 'student1' },
      profile: { role: 'student' } as any,
      loading: false,
    };

    render(
      <MemoryRouter initialEntries={['/']}>
        <Shell>
          <div>Dashboard Content</div>
        </Shell>
      </MemoryRouter>
    );

    expect(screen.queryByText('Admin Panel')).not.toBeInTheDocument();
  });

  it('prevents student from accessing /admin route', () => {
    mockAuth = {
      user: { uid: 'student1' },
      profile: { role: 'student' } as any,
      loading: false,
    };

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/" element={<div>Dashboard Home</div>} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <div>Admin Dashboard Screen</div>
              </AdminRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Dashboard Home')).toBeInTheDocument();
    expect(screen.queryByText('Admin Dashboard Screen')).not.toBeInTheDocument();
  });
});
