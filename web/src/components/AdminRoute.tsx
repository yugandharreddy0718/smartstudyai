import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center gap-4 bg-slate-900 text-white">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
        <span className="font-display font-bold text-slate-400">Verifying Admin Permissions...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const roleRaw = profile?.role || 'student';
  const normalizedRole = String(roleRaw).trim().toLowerCase();
  const isAllowed = normalizedRole === 'admin' || normalizedRole === 'superadmin';

  if (!isAllowed) {
    console.warn(`[Access Denied] User ${user.uid} with role '${profile?.role}' attempted to access Admin Panel.`);
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default AdminRoute;
