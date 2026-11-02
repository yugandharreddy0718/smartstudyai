import { db, auth } from '@smartstudy/firebase';
import { doc, setDoc } from 'firebase/firestore';

export interface QuizAttemptRecord {
  id: string;
  uid: string;
  userEmail: string;
  displayName: string;
  lessonId: string;
  subjectId?: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  completedAt: number;
  createdAt: number;
}

export async function recordQuizAttempt(attempt: {
  lessonId: string;
  subjectId?: string;
  score: number;
  totalQuestions: number;
  percentage: number;
}): Promise<QuizAttemptRecord | null> {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;

  const attemptId = `quiz_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const now = Date.now();
  const record: QuizAttemptRecord = {
    id: attemptId,
    uid: currentUser.uid,
    userEmail: currentUser.email || '',
    displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Student',
    lessonId: attempt.lessonId,
    subjectId: attempt.subjectId || '',
    score: attempt.score,
    totalQuestions: attempt.totalQuestions,
    percentage: attempt.percentage,
    completedAt: now,
    createdAt: now
  };

  try {
    // 1. Record in global 'quizzes' collection for admin dashboard statistics
    await setDoc(doc(db, 'quizzes', attemptId), record, { merge: true });

    // 2. Record in user's subcollection for personalized history
    await setDoc(doc(db, 'users', currentUser.uid, 'quizAttempts', attemptId), record, { merge: true });
  } catch (err) {
    console.warn('Notice saving quiz attempt to Firestore:', err);
  }

  return record;
}

