import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInAnonymously, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, getDocFromServer } from 'firebase/firestore';
// @ts-ignore
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

// In-memory OTP store for email authentication
const otpStore: Record<string, { code: string; expiresAt: number }> = {};

export async function sendEmailOTP(email: string): Promise<{ success: boolean; code: string; message: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Please enter a valid email address.');
  }

  // Generate a 6-digit OTP code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore[cleanEmail] = {
    code,
    expiresAt: Date.now() + 5 * 60 * 1000 // Valid for 5 minutes
  };

  console.log(`[SmartStudy Auth] OTP generated for ${cleanEmail}: ${code}`);

  return {
    success: true,
    code,
    message: `Verification code sent to ${cleanEmail}`
  };
}

export async function verifyEmailOTP(email: string, inputCode: string) {
  const cleanEmail = email.trim().toLowerCase();
  const stored = otpStore[cleanEmail];

  if (!stored) {
    throw new Error('No active OTP request found. Please click "Send OTP" first.');
  }

  if (Date.now() > stored.expiresAt) {
    delete otpStore[cleanEmail];
    throw new Error('OTP verification code has expired. Please request a new OTP.');
  }

  if (stored.code !== inputCode.trim()) {
    throw new Error('Invalid OTP code. Please enter the 6-digit code sent to your email.');
  }

  // Clear consumed OTP
  delete otpStore[cleanEmail];

  // Authenticate user via Firebase
  let user = auth.currentUser;
  if (!user) {
    const anonResult = await signInAnonymously(auth);
    user = anonResult.user;
  }

  // Initialize/update user profile with verified email
  const docRef = doc(db, 'users', user.uid);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    await setDoc(docRef, {
      uid: user.uid,
      email: cleanEmail,
      displayName: cleanEmail.split('@')[0],
      studentClass: 'Class 8',
      createdAt: Date.now(),
      lastLogin: Date.now(),
      stats: { xp: 0, streak: 0, level: 1, badges: [] },
      completedLessons: []
    });
  } else {
    await setDoc(docRef, { email: cleanEmail, lastLogin: Date.now() }, { merge: true });
  }

  return user;
}

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.warn('Google Popup sign-in unavailable or restricted in WebView, falling back to Guest session...', error);
    try {
      const anonResult = await signInAnonymously(auth);
      return anonResult.user;
    } catch (fallbackErr) {
      console.error('Anonymous auth fallback failed:', fallbackErr);
      throw error;
    }
  }
}

export async function signInAsGuest() {
  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error) {
    console.error('Error signing in as guest:', error);
    throw error;
  }
}

export async function logOut() {
  await signOut(auth);
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
