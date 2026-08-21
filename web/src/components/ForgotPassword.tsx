import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, AlertCircle, Mail } from 'lucide-react';
import { resetPassword } from '@smartstudy/firebase';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to send reset email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-0 -left-20 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-brand-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl relative z-10 border border-slate-100"
      >
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-slate-900/20">
            <Sparkles className="text-white w-8 h-8" />
          </div>
          <h1 className="font-display font-bold text-3xl text-slate-900 mb-1 tracking-tight">Reset Password</h1>
          <p className="text-slate-500 font-medium text-sm">Enter your email to receive a reset link</p>
        </div>

        <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 mb-6">
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Email</label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@example.com"
                  required
                  className="w-full bg-white text-slate-900 pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm shadow-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-md shadow-indigo-600/20 disabled:opacity-50 text-sm mt-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Send Password Reset Email</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {error && (
          <div className="mt-4 p-3.5 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-600 text-xs font-medium animate-shake">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3 text-emerald-700 text-xs font-medium">
            <p>Password reset email sent! Check your inbox.</p>
          </div>
        )}

        <div className="mt-6 text-center text-sm text-slate-600 font-medium">
          <Link to="/login" className="text-indigo-600 font-bold hover:underline">
            Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
