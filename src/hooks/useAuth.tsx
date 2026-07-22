import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile, StudentClass } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  setStudentClass: (sc: StudentClass) => Promise<void>;
  completeLesson: (lessonId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          // Always ensure completedLessons exists
          setProfile({
            ...data,
            completedLessons: data.completedLessons || []
          } as UserProfile);
        } else {
          // Initialize profile - ensuring a new user always starts with a fresh dashboard/progress
          const newProfile: UserProfile = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || 'Student',
            photoURL: user.photoURL || undefined,
            studentClass: StudentClass.C8, // Default
            createdAt: Date.now(),
            lastLogin: Date.now(),
            stats: { xp: 0, streak: 0, level: 1, badges: [] },
            completedLessons: []
          };
          await setDoc(docRef, newProfile);
          setProfile(newProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
  }, []);

  const setStudentClass = async (sc: StudentClass) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid);
    await setDoc(docRef, { studentClass: sc }, { merge: true });
    setProfile(p => p ? { ...p, studentClass: sc } : null);
  };

  const completeLesson = async (lessonId: string) => {
    if (!user || !profile) return;
    const currentCompleted = profile.completedLessons || [];
    if (currentCompleted.includes(lessonId)) return; // Already completed

    const updatedCompleted = [...currentCompleted, lessonId];
    
    // Increment stats on lesson completion (+100 XP)
    const currentXP = profile.stats.xp || 0;
    const newXP = currentXP + 100;
    const newLevel = Math.floor(newXP / 500) + 1; // 500 XP per level
    
    const docRef = doc(db, 'users', user.uid);
    await setDoc(docRef, {
      completedLessons: updatedCompleted,
      stats: {
        ...profile.stats,
        xp: newXP,
        level: newLevel
      }
    }, { merge: true });

    setProfile(p => p ? {
      ...p,
      completedLessons: updatedCompleted,
      stats: {
        ...p.stats,
        xp: newXP,
        level: newLevel
      }
    } : null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, setStudentClass, completeLesson }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
