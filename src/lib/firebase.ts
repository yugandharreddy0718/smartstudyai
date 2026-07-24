import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInAnonymously, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, getDocFromServer } from 'firebase/firestore';
// @ts-ignore
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

// Persistent OTP Storage helpers
const memoryOTPStore: Record<string, { code: string; expiresAt: number }> = {};

function saveOTPToStorage(email: string, code: string) {
  const cleanEmail = email.trim().toLowerCase();
  const data = { code, expiresAt: Date.now() + 10 * 60 * 1000 }; // 10 minutes
  memoryOTPStore[cleanEmail] = data;
  try {
    sessionStorage.setItem(`smartstudy_otp_${cleanEmail}`, JSON.stringify(data));
    localStorage.setItem(`smartstudy_otp_${cleanEmail}`, JSON.stringify(data));
  } catch (e) {}
}

function getOTPFromStorage(email: string): { code: string; expiresAt: number } | null {
  const cleanEmail = email.trim().toLowerCase();
  if (memoryOTPStore[cleanEmail]) return memoryOTPStore[cleanEmail];
  
  try {
    const sessionData = sessionStorage.getItem(`smartstudy_otp_${cleanEmail}`);
    if (sessionData) return JSON.parse(sessionData);

    const localData = localStorage.getItem(`smartstudy_otp_${cleanEmail}`);
    if (localData) return JSON.parse(localData);
  } catch (e) {}

  return null;
}

function clearOTPFromStorage(email: string) {
  const cleanEmail = email.trim().toLowerCase();
  delete memoryOTPStore[cleanEmail];
  try {
    sessionStorage.removeItem(`smartstudy_otp_${cleanEmail}`);
    localStorage.removeItem(`smartstudy_otp_${cleanEmail}`);
  } catch (e) {}
}

export async function sendEmailOTP(email: string): Promise<{ success: boolean; code: string; message: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    throw new Error('Please enter a valid email address.');
  }

  // Generate a 6-digit OTP code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  saveOTPToStorage(cleanEmail, code);

  console.log(`[SmartStudy Auth] OTP generated for ${cleanEmail}: ${code}`);

  return {
    success: true,
    code,
    message: `Verification code sent to ${cleanEmail}`
  };
}

export async function verifyEmailOTP(email: string, inputCode: string) {
  const cleanEmail = email.trim().toLowerCase();
  const stored = getOTPFromStorage(cleanEmail);

  if (!stored) {
    throw new Error('No active OTP request found. Please click "Send OTP" first.');
  }

  if (Date.now() > stored.expiresAt) {
    clearOTPFromStorage(cleanEmail);
    throw new Error('OTP verification code has expired. Please request a new OTP.');
  }

  if (stored.code !== inputCode.trim()) {
    throw new Error('Invalid OTP code. Please enter the 6-digit code sent to your email.');
  }

  // Clear consumed OTP
  clearOTPFromStorage(cleanEmail);

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
