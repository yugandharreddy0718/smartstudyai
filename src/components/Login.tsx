import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, BookOpen, BrainCircuit, BarChart3, AlertCircle } from 'lucide-react';
import { signInWithGoogle } from '../lib/firebase';
import { cn } from '../lib/utils';

export default function Login() {
  const [error, setError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  const handleLogin = async () => {
    setSigningIn(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to sign in. Please try again.");
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-brand-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-brand-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl relative z-10 border border-slate-100"
      >
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 bg-brand-primary rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-brand-primary/30">
            <Sparkles className="text-white w-8 h-8" />
          </div>
          <h1 className="font-display font-bold text-3xl text-slate-900 mb-2 tracking-tight">SmartStudy AI</h1>
          <p className="text-slate-500 font-medium">Your personal AI-powered study companion.</p>
        </div>

        <div className="space-y-4 mb-10">
          <FeatureItem icon={BrainCircuit} text="AI-powered lesson analysis" color="bg-indigo-50 text-indigo-600" />
          <FeatureItem icon={BookOpen} text="Personalized study notes" color="bg-rose-50 text-rose-600" />
          <FeatureItem icon={BarChart3} text="Real-time progress tracking" color="bg-emerald-50 text-emerald-600" />
        </div>

        <button 
          onClick={handleLogin}
          disabled={signingIn}
          className="w-full bg-slate-900 text-white py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-800 transition-all active:scale-[0.98] shadow-lg shadow-slate-900/20 disabled:opacity-50"
        >
          {signingIn ? (
             <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
          )}
          {signingIn ? 'Signing in...' : 'Continue with Google'}
          <ArrowRight className="w-5 h-5 ml-auto opacity-50" />
        </button>

        {error && (
          <div className="mt-4 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-sm animate-shake">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        <p className="mt-8 text-center text-xs text-slate-400">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}

function FeatureItem({ icon: Icon, text, color }: { icon: any, text: string, color: string }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", color)}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-slate-700 font-medium text-sm">{text}</span>
    </div>
  );
}
