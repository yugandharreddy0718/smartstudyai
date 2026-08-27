import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { fetchStudents, updateUserRoleInBackend, StudentUser } from '../../services/adminService';
import { UserRole } from '@smartstudy/shared';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Users, 
  Search, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Lock, 
  UserCheck, 
  X,
  Sparkles
} from 'lucide-react';

export default function RoleManagement() {
  const { profile } = useAuth();
  const userRole = (profile?.role || 'admin').trim();
  const isSuperAdmin = userRole === 'superAdmin';

  const [users, setUsers] = useState<StudentUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Role Change Modal
  const [targetUser, setTargetUser] = useState<StudentUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadUsersData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchStudents();
      setUsers(data);
    } catch (err: any) {
      console.error('Failed to load user accounts:', err);
      setError(err?.message || 'Failed to fetch user accounts for role management.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      loadUsersData();
    }
  }, [isSuperAdmin]);

  // If not superAdmin, show strict restriction notice
  if (!isSuperAdmin) {
    return (
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-12 text-center max-w-2xl mx-auto my-12 space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h3 className="font-display font-bold text-xl text-white">SuperAdmin Privilege Required</h3>
        <p className="text-slate-400 text-xs leading-relaxed max-w-md mx-auto">
          Role management and privilege escalation are strictly restricted to accounts with the <span className="text-amber-400 font-bold uppercase">superAdmin</span> role. Standard administrators do not have authorization to modify account privileges.
        </p>
      </div>
    );
  }

  const filteredUsers = users.filter(u => 
    (u.displayName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.uid || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenRoleModal = (u: StudentUser) => {
    setTargetUser(u);
    setSelectedRole(u.role);
  };

  const handleConfirmRoleChange = async () => {
    if (!targetUser) return;
    setIsSubmitting(true);
    setError(null);

    try {
      await updateUserRoleInBackend(targetUser.uid, selectedRole);
      setToastMessage(`Successfully updated role for ${targetUser.displayName} to "${selectedRole}".`);
      setTargetUser(null);
      await loadUsersData();
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err: any) {
      console.error('Error changing role:', err);
      setError(err?.message || 'Failed to update user role via backend service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between text-emerald-300 text-sm">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display font-bold text-2xl text-white">Role Management</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wider">
              SuperAdmin Only
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Assign and reassign administrative access privileges for SmartStudy AI platform users.
          </p>
        </div>

        <button
          onClick={loadUsersData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, email, or UID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <span className="text-xs text-slate-400">
          Total Users: <strong className="text-white">{filteredUsers.length}</strong>
        </span>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex items-center gap-3 text-rose-300 text-sm">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Users Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-slate-900 p-5 rounded-2xl border border-slate-800 animate-pulse h-16" />
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-slate-300 font-bold text-base">No Users Found</h3>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-800/80 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Current Role</th>
                  <th className="py-3.5 px-4">UID</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200 font-medium">
                {filteredUsers.map((u) => {
                  const roleStyle = 
                    u.role === 'superAdmin' 
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : u.role === 'admin'
                      ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
                      : 'bg-slate-800 text-slate-400 border-slate-700';

                  return (
                    <tr key={u.uid} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 font-bold flex items-center justify-center shrink-0">
                            {u.displayName[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-100">{u.displayName}</p>
                            <p className="text-[11px] text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${roleStyle}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                        {u.uid}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenRoleModal(u)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 rounded-lg border border-indigo-500/30 text-xs font-bold transition-all"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Change Role</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Role Change Modal */}
      {targetUser && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                <h3 className="font-display font-bold text-lg text-white">Modify User Role</h3>
              </div>
              <button onClick={() => setTargetUser(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-slate-300 text-xs leading-relaxed">
              Target User: <strong className="text-white">{targetUser.displayName}</strong> ({targetUser.email})
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Select New Role:</label>
              {(['student', 'admin', 'superAdmin'] as UserRole[]).map((r) => (
                <label
                  key={r}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedRole === r
                      ? 'bg-indigo-600/20 border-indigo-500/50 text-white'
                      : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="role"
                      value={r}
                      checked={selectedRole === r}
                      onChange={() => setSelectedRole(r)}
                      className="accent-indigo-500"
                    />
                    <span className="text-xs font-bold capitalize">{r}</span>
                  </div>
                  {r === 'superAdmin' && (
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                      Full Access
                    </span>
                  )}
                </label>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                onClick={() => setTargetUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRoleChange}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSubmitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Save New Role</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
