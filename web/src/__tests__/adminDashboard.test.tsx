import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import AdminDashboard from '../components/admin/AdminDashboard';
import AdminRoute from '../components/AdminRoute';
import * as adminService from '../services/adminService';
import * as firebaseWeb from '@smartstudy/firebase';

const mockLogOut = vi.fn();
vi.mock('@smartstudy/firebase', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@smartstudy/firebase')>();
  return {
    ...actual,
    logOut: () => mockLogOut(),
  };
});

// Mock auth hook
let mockAuth = {
  user: null as any,
  profile: null as any,
  loading: false,
  logout: vi.fn(),
};

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => mockAuth,
}));

describe('Admin Dashboard Unit & Integration Tests (Phase 4A)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.logout = vi.fn();
  });

  it('1. Admin can load dashboard', async () => {
    mockAuth = {
      user: { uid: 'admin123', email: 'admin@smartstudy.ai' },
      profile: { uid: 'admin123', displayName: 'Admin User', role: 'admin' } as any,
      loading: false,
      logout: vi.fn(),
    };

    vi.spyOn(adminService, 'fetchAdminStats').mockResolvedValueOnce({
      totalStudents: 15,
      totalAdmins: 2,
      totalSubjects: 6,
      totalChapters: 24,
      totalLessons: 48,
      totalQuizzes: 10,
      totalCurriculumItems: 78,
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('SmartStudy AI Admin')).toBeInTheDocument();
    expect(screen.getAllByText('Admin User').length).toBeGreaterThan(0);
    
    await waitFor(() => {
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('6')).toBeInTheDocument();
    });
  });

  it('2. SuperAdmin can load dashboard and see superAdmin role badge', async () => {
    mockAuth = {
      user: { uid: 'super123', email: 'super@smartstudy.ai' },
      profile: { uid: 'super123', displayName: 'Super User', role: 'superAdmin' } as any,
      loading: false,
      logout: vi.fn(),
    };

    vi.spyOn(adminService, 'fetchAdminStats').mockResolvedValueOnce({
      totalStudents: 50,
      totalAdmins: 3,
      totalSubjects: 8,
      totalChapters: 30,
      totalLessons: 100,
      totalQuizzes: 20,
      totalCurriculumItems: 138,
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getAllByText(/Super/i).length).toBeGreaterThan(0);

    await waitFor(() => {
      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getByText('138')).toBeInTheDocument();
    });
  });

  it('3. Student cannot load dashboard and is redirected away', () => {
    mockAuth = {
      user: { uid: 'student123', email: 'student@example.com' },
      profile: { uid: 'student123', displayName: 'Student Joe', role: 'student' } as any,
      loading: false,
      logout: vi.fn(),
    };

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/" element={<div>Student Home Page</div>} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Student Home Page')).toBeInTheDocument();
    expect(screen.queryByText('SmartStudy AI Admin')).not.toBeInTheDocument();
  });

  it('4. Dashboard displays loading state before Firestore resolves', () => {
    mockAuth = {
      user: { uid: 'admin123', email: 'admin@smartstudy.ai' },
      profile: { uid: 'admin123', displayName: 'Admin User', role: 'admin' } as any,
      loading: false,
      logout: vi.fn(),
    };

    // Pending promise
    vi.spyOn(adminService, 'fetchAdminStats').mockImplementationOnce(() => new Promise(() => {}));

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AdminDashboard />
      </MemoryRouter>
    );

    expect(screen.getAllByText('Loading...').length).toBeGreaterThan(0);
  });

  it('5. Dashboard displays Firestore-derived data', async () => {
    mockAuth = {
      user: { uid: 'admin123', email: 'admin@smartstudy.ai' },
      profile: { uid: 'admin123', displayName: 'Admin User', role: 'admin' } as any,
      loading: false,
      logout: vi.fn(),
    };

    vi.spyOn(adminService, 'fetchAdminStats').mockResolvedValueOnce({
      totalStudents: 120,
      totalAdmins: 4,
      totalSubjects: 6,
      totalChapters: 42,
      totalLessons: 180,
      totalQuizzes: 35,
      totalCurriculumItems: 228,
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AdminDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('120')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument();
      expect(screen.getByText('180')).toBeInTheDocument();
      expect(screen.getByText('35')).toBeInTheDocument();
      expect(screen.getByText('228')).toBeInTheDocument();
    });
  });

  it('6. Permission error handling displays appropriate error message', async () => {
    mockAuth = {
      user: { uid: 'admin123', email: 'admin@smartstudy.ai' },
      profile: { uid: 'admin123', displayName: 'Admin User', role: 'admin' } as any,
      loading: false,
      logout: vi.fn(),
    };

    const permError = new Error('Permission denied');
    (permError as any).code = 'permission-denied';

    vi.spyOn(adminService, 'fetchAdminStats').mockRejectedValueOnce(permError);

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AdminDashboard />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Permission denied: You do not have authorization/i)).toBeInTheDocument();
    });
  });

  it('7. Logout button calls logout function', () => {
    mockAuth = {
      user: { uid: 'admin123', email: 'admin@smartstudy.ai' },
      profile: { uid: 'admin123', displayName: 'Admin User', role: 'admin' } as any,
      loading: false,
      logout: vi.fn(),
    };

    vi.spyOn(adminService, 'fetchAdminStats').mockResolvedValueOnce({
      totalStudents: 0,
      totalAdmins: 1,
      totalSubjects: 0,
      totalChapters: 0,
      totalLessons: 0,
      totalQuizzes: 0,
      totalCurriculumItems: 0,
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AdminDashboard />
      </MemoryRouter>
    );

    const signOutBtn = screen.getByRole('button', { name: /sign out/i });
    fireEvent.click(signOutBtn);

    expect(mockLogOut).toHaveBeenCalledTimes(1);
  });

  it('8. Navigating to non-dashboard tab displays "Coming in Phase 4"', async () => {
    mockAuth = {
      user: { uid: 'admin123', email: 'admin@smartstudy.ai' },
      profile: { uid: 'admin123', displayName: 'Admin User', role: 'admin' } as any,
      loading: false,
      logout: vi.fn(),
    };

    vi.spyOn(adminService, 'fetchAdminStats').mockResolvedValueOnce({
      totalStudents: 10,
      totalAdmins: 1,
      totalSubjects: 5,
      totalChapters: 10,
      totalLessons: 20,
      totalQuizzes: 5,
      totalCurriculumItems: 35,
    });

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AdminDashboard />
      </MemoryRouter>
    );

    const usersNavBtn = screen.getByRole('button', { name: /^Users/i });
    fireEvent.click(usersNavBtn);

    expect(screen.getByText('Coming in Phase 4')).toBeInTheDocument();
    expect(screen.getByText('users Module')).toBeInTheDocument();
  });
});
