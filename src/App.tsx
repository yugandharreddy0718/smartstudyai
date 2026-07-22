import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { Shell } from './components/layout/Shell';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import SubjectList from './components/SubjectList';
import ChapterList from './components/ChapterList';
import LessonDetailsScreen from './components/LessonDetailsScreen';
import Upload from './components/Upload';
import AIChat from './components/AIChat';
import Profile from './components/Profile';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="h-screen w-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
      <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
      <span className="font-display font-bold text-slate-400">SmartStudy AI</span>
    </div>
  );
  if (!user) return <Navigate to="/login" />;
  return <Shell>{children}</Shell>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="h-screen w-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
      <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin" />
      <span className="font-display font-bold text-slate-400">SmartStudy AI</span>
    </div>
  );
  if (user) return <Navigate to="/" />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/subjects" element={<ProtectedRoute><SubjectList /></ProtectedRoute>} />
          <Route path="/subjects/:subjectId" element={<ProtectedRoute><ChapterList /></ProtectedRoute>} />
          <Route path="/lessons/:lessonId" element={<ProtectedRoute><LessonDetailsScreen /></ProtectedRoute>} />
          <Route path="/upload" element={<ProtectedRoute><Upload /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><AIChat /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
