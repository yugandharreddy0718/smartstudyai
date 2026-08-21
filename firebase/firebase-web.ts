import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
// @ts-ignore
import firebaseConfig from './firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const storage = getStorage(app);

// Helper to normalize user profile data to canonical schema
export function normalizeUserProfile(data: any, user?: any): any {
  if (!data) return null;
  const displayName = data.displayName || data.name || user?.displayName || user?.email?.split('@')[0] || 'Student';
  const photoURL = data.photoURL || data.photoUrl || user?.photoURL || '';
  const rawClass = data.studentClass || data.grade || '8';
  const studentClass = rawClass.toString().replace(/^(class_?)/i, '');
  const role = data.role || 'student';
  
  const xp = data.stats?.xp ?? data.xp ?? 0;
  const level = data.stats?.level ?? data.level ?? 1;
  const streak = data.stats?.streak ?? data.streak ?? 0;
  const badges = data.stats?.badges ?? data.badges ?? [];

  return {
    ...data,
    uid: data.uid || user?.uid,
    email: data.email || user?.email || '',
    displayName,
    photoURL,
    studentClass,
    role,
    stats: {
      xp,
      level,
      streak,
      badges
    },
    createdAt: data.createdAt || Date.now(),
    updatedAt: Date.now()
  };
}

// Initialize user profile in Firestore using Canonical Schema
async function initUserProfile(user: any, name?: string, grade?: string) {
  const docRef = doc(db, 'users', user.uid);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    const rawClass = (grade || '8').toString().replace(/^(class_?)/i, '');
    const canonicalProfile = {
      uid: user.uid,
      displayName: name || user.displayName || user.email?.split('@')[0] || 'Student',
      email: user.email || '',
      studentClass: rawClass,
      photoURL: user.photoURL || '',
      role: 'student',
      provider: user.isAnonymous ? 'anonymous' : (user.providerData[0]?.providerId || 'password'),
      stats: {
        xp: 0,
        level: 1,
        streak: 0,
        badges: []
      },
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    await setDoc(docRef, canonicalProfile);
  } else {
    const data = docSnap.data();
    const normalized = normalizeUserProfile(data, user);
    await setDoc(docRef, normalized, { merge: true });
  }
}

export async function registerWithEmail(email: string, password: string, name: string, grade: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await initUserProfile(userCredential.user, name, grade);
  return userCredential.user;
}

export async function loginWithEmail(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  await initUserProfile(userCredential.user);
  await refreshUserTokenClaims();
  return userCredential.user;
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email);
}

export async function signInAsGuest() {
  try {
    const result = await signInAnonymously(auth);
    await initUserProfile(result.user);
    return result.user;
  } catch (error: any) {
    console.error('Error signing in as guest:', error);
    if (error?.code === 'auth/admin-restricted-operation' || error?.message?.includes('admin-restricted-operation')) {
      throw new Error('Anonymous sign-in is currently disabled in Firebase Console. Please enable "Anonymous" under Firebase Console > Authentication > Sign-in method.');
    }
    throw error;
  }
}

export async function logOut() {
  await signOut(auth);
}

export async function refreshUserTokenClaims(): Promise<any> {
  if (auth.currentUser) {
    return await auth.currentUser.getIdTokenResult(true);
  }
  return null;
}

// CRITICAL: Connection test
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();
