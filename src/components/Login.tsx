import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, BookOpen, BrainCircuit, BarChart3, AlertCircle, Mail, KeyRound, CheckCircle2, RefreshCw } from 'lucide-react';
import { signInWithGoogle, signInAsGuest, sendEmailOTP, verifyEmailOTP } from '../lib/firebase';
import { cn } from '../lib/utils';

export default function Login() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [activeStep, setActiveStep] = useState<'email' | 'otp'>('email');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setError(null);
    setInfoMessage(null);

    try {
      const res = await sendEmailOTP(email);
      setGeneratedCode(res.code);
      setInfoMessage(`OTP sent to ${email.trim().toLowerCase()}`);
      setActiveStep('otp');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to send OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!otp || otp.trim().length < 4) {
      setError('Please enter the verification code sent to your email.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await verifyEmailOTP(email, otp);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to sign in with Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInAsGuest();
    } catch (e: any) {
      console.error(e);
      setError("Guest sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-brand-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl relative z-10 border border-slate-100"
      >
        {/* Logo Banner */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-slate-900/20">
            <Sparkles className="text-white w-8 h-8" />
          </div>
          <h1 className="font-display font-bold text-3xl text-slate-900 mb-1 tracking-tight">SmartStudy AI</h1>
          <p className="text-slate-500 font-medium text-sm">Sign in with Email ID & OTP</p>
        </div>

        {/* Feature Highlights */}
        <div className="space-y-3 mb-8">
          <FeatureItem icon={BrainCircuit} text="AI-powered study analysis" color="bg-indigo-50 text-indigo-600" />
          <FeatureItem icon={BookOpen} text="Personalized lesson notes" color="bg-rose-50 text-rose-600" />
          <FeatureItem icon={BarChart3} text="Real-time progress tracking" color="bg-emerald-50 text-emerald-600" />
        </div>

        {/* Email OTP Authentication Form */}
        <div className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 mb-6">
          {activeStep === 'email' ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Student Email Address
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    required
                    className="w-full bg-white text-slate-900 pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-medium placeholder:text-slate-400 text-sm shadow-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-md shadow-indigo-600/20 disabled:opacity-50 text-sm"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Send Verification OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Enter 6-Digit OTP
                  </label>
                  <button
                    type="button"
                    onClick={() => { setActiveStep('email'); setError(null); }}
                    className="text-xs font-semibold text-indigo-600 hover:underline"
                  >
                    Change Email
                  </button>
                </div>

                <div className="relative">
                  <KeyRound className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    required
                    className="w-full bg-white text-slate-900 pl-12 pr-4 py-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono font-bold text-lg tracking-widest placeholder:tracking-normal placeholder:font-normal placeholder:text-sm text-center shadow-sm"
                  />
                </div>
              </div>

              {/* Demo OTP Helper Box */}
              {generatedCode && (
                <div 
                  onClick={() => setOtp(generatedCode)}
                  className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between cursor-pointer hover:bg-emerald-100/70 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span className="text-xs font-semibold text-emerald-800">
                      OTP Sent! Code: <strong className="font-mono text-emerald-900 text-sm underline">{generatedCode}</strong>
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-200/80 px-2 py-0.5 rounded-md">
                    Tap to fill
                  </span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 px-6 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-md shadow-emerald-600/20 disabled:opacity-50 text-sm"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Verify & Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center pt-1">
                <button
                  type="button"
                  onClick={() => handleSendOTP()}
                  className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Resend OTP Code</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Alternative Login Methods */}
        <div className="space-y-2.5">
          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-slate-900 text-white py-3.5 px-6 rounded-xl font-semibold flex items-center justify-center gap-3 hover:bg-slate-800 transition-all active:scale-[0.98] shadow-md shadow-slate-900/10 disabled:opacity-50 text-sm"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt="Google" />
            <span>Continue with Google</span>
          </button>

          <button 
            onClick={handleGuestLogin}
            disabled={loading}
            className="w-full bg-white text-slate-700 border border-slate-200 py-3 px-6 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all active:scale-[0.98] disabled:opacity-50 text-sm"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Quick Start / Guest Mode</span>
          </button>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="mt-4 p-3.5 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-600 text-xs font-medium animate-shake">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {infoMessage && !error && (
          <div className="mt-4 p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center gap-2 text-indigo-700 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            <p>{infoMessage}</p>
          </div>
        )}

        <p className="mt-6 text-center text-xs text-slate-400">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}

function FeatureItem({ icon: Icon, text, color }: { icon: any, text: string, color: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", color)}>
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-slate-700 font-medium text-xs">{text}</span>
    </div>
  );
}
