import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, onSnapshot } from 'firebase/firestore';
import { auth, db, normalizeUserProfile } from '@smartstudy/firebase';
import { UserProfile, StudentClass } from '@smartstudy/shared';

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
    let unsubscribeProgress: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (unsubscribeProgress) {
        unsubscribeProgress();
        unsubscribeProgress = null;
      }

      try {
        if (currentUser) {
          // Force refresh ID token to get latest custom claims (including role)
          let claimRole: string | undefined;
          try {
            const tokenResult = await currentUser.getIdTokenResult(true);
            claimRole = tokenResult.claims.role as string | undefined;
          } catch (tokenErr) {
            console.warn("Notice refreshing ID token claims in useAuth:", tokenErr);
          }

          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);
          
          let normalized: UserProfile;
          if (docSnap.exists()) {
            normalized = normalizeUserProfile(docSnap.data(), currentUser);
          } else {
            const rawProfile = {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || 'Student',
              photoURL: currentUser.photoURL || undefined,
              studentClass: StudentClass.C8,
              role: claimRole || 'student',
              createdAt: Date.now(),
              lastLogin: Date.now(),
              stats: { xp: 0, streak: 0, level: 1, badges: [] },
              completedLessons: []
            };
            await setDoc(docRef, rawProfile);
            normalized = normalizeUserProfile(rawProfile, currentUser);
          }

          // Priority: Firestore role || Token Claim role || Email check || normalized role || 'student'
          const emailLower = (currentUser.email || '').toLowerCase();
          const isSuperAdminEmail = emailLower.includes('yugandhar') || emailLower.includes('admin');
          const effectiveRole = (docSnap.exists() && docSnap.data()?.role) || claimRole || (isSuperAdminEmail ? 'superAdmin' : normalized.role) || 'student';
          normalized.role = effectiveRole;

          console.log("AUTH UID:", currentUser.uid);
          console.log("AUTH EMAIL:", currentUser.email);
          console.log("FIRESTORE ROLE:", docSnap.data()?.role);
          console.log("AUTH CLAIM ROLE:", claimRole);
          console.log("EFFECTIVE ROLE:", effectiveRole);

          // CRITICAL: Set profile immediately so profile is populated before loading becomes false
          setProfile(normalized);

          // Initial completed lessons array from document or legacy array
          const legacyCompleted = normalized.completedLessons || [];

          // Subscribe to real-time lessonProgress subcollection (Canonical Cross-Platform Sync)
          const progressColRef = collection(db, 'users', currentUser.uid, 'lessonProgress');
          unsubscribeProgress = onSnapshot(progressColRef, async (snapshot) => {
            const completedFromSubcol: string[] = [];

            snapshot.docs.forEach((docSnap) => {
              const data = docSnap.data();
              if (data.completed === true || data.isCompleted === true) {
                completedFromSubcol.push(docSnap.id);
              }
            });

            // Combine subcollection progress with legacy array for 100% data preservation
            const mergedCompleted = Array.from(new Set([...legacyCompleted, ...completedFromSubcol]));

            // Automatic Migration: If legacy items exist that are not yet in subcollection, migrate them now
            for (const legacyId of legacyCompleted) {
              if (!completedFromSubcol.includes(legacyId)) {
                const progDocRef = doc(db, 'users', currentUser.uid, 'lessonProgress', legacyId);
                await setDoc(progDocRef, {
                  lessonId: legacyId,
                  completed: true,
                  isCompleted: true,
                  progressPercentage: 100,
                  lastAccessedAt: Date.now(),
                  completedAt: Date.now(),
                  updatedAt: Date.now()
                }, { merge: true });
              }
            }

            // Update completedLessons on canonical profile
            setProfile((prev) => prev ? {
              ...prev,
              completedLessons: mergedCompleted
            } : {
              ...normalized,
              completedLessons: mergedCompleted
            });
          }, (err) => {
            console.error("Error subscribing to lessonProgress subcollection:", err);
            setProfile(normalized);
          });

        } else {
          setProfile(null);
        }
      } catch (err) {
        console.error("Error loading user profile:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProgress) unsubscribeProgress();
    };
  }, []);

  const setStudentClass = async (sc: StudentClass) => {
    if (!user) return;
    const docRef = doc(db, 'users', user.uid);
    const cleanClass = sc.toString().replace(/^(class_?)/i, '');
    await setDoc(docRef, { studentClass: cleanClass, grade: cleanClass, updatedAt: Date.now() }, { merge: true });
    setProfile(p => p ? { ...p, studentClass: cleanClass as StudentClass } : null);
  };

  const completeLesson = async (lessonId: string) => {
    if (!user || !profile) return;
    const currentCompleted = profile.completedLessons || [];
    if (currentCompleted.includes(lessonId)) return; // Already completed

    const updatedCompleted = [...currentCompleted, lessonId];
    
    // Increment stats on lesson completion (+100 XP)
    const currentXP = profile.stats?.xp || 0;
    const newXP = currentXP + 100;
    const newLevel = Math.floor(newXP / 500) + 1; // 500 XP per level
    
    // 1. Write canonical LessonProgress document to subcollection (/users/{uid}/lessonProgress/{lessonId})
    const progDocRef = doc(db, 'users', user.uid, 'lessonProgress', lessonId);
    await setDoc(progDocRef, {
      lessonId,
      completed: true,
      isCompleted: true,
      progressPercentage: 100,
      lastAccessedAt: Date.now(),
      completedAt: Date.now(),
      updatedAt: Date.now()
    }, { merge: true });

    // 2. Update user stats and mirror completedLessons on profile for backwards compatibility
    const docRef = doc(db, 'users', user.uid);
    await setDoc(docRef, {
      completedLessons: updatedCompleted,
      stats: {
        ...profile.stats,
        xp: newXP,
        level: newLevel
      },
      updatedAt: Date.now()
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
