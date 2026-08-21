import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase/firebase-applet-config.json';

async function testWrite() {
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
  const auth = getAuth(app);
  const webDb = getFirestore(app, firebaseConfig.firestoreDatabaseId);

  const cred = await signInWithEmailAndPassword(auth, 'seed.admin@smartstudy.ai', 'SmartStudySeed2026!');
  const uid = cred.user.uid;
  const email = cred.user.email || 'seed.admin@smartstudy.ai';
  console.log('Logged in UID:', uid);

  // Test 1: Write to /users/{uid} with valid fields
  try {
    await setDoc(doc(webDb, 'users', uid), {
      uid,
      email,
      displayName: 'Seed Admin',
      studentClass: '8',
      photoURL: '',
      createdAt: Date.now(),
      lastLogin: Date.now(),
      stats: { xp: 0, level: 1, streak: 0, badges: [] }
    });
    console.log('✔ Valid write to /users/{uid} SUCCESS!');
  } catch (e: any) {
    console.error('❌ Valid write to /users/{uid} FAILED:', e.message);
  }

  // Test 2: Write to /users/{uid}/lessonProgress/l1
  try {
    await setDoc(doc(webDb, 'users', uid, 'lessonProgress', 'l1'), {
      lessonId: 'l1',
      completed: true,
      isCompleted: true,
      progressPercentage: 100,
      lastAccessedAt: Date.now(),
      completedAt: Date.now(),
      updatedAt: Date.now()
    }, { merge: true });
    console.log('✔ Write to /users/{uid}/lessonProgress/l1 SUCCESS!');
  } catch (e: any) {
    console.error('❌ Write to /users/{uid}/lessonProgress/l1 FAILED:', e.message);
  }

  // Test 3: Write to /lessons/g8-maths-c1-l1
  try {
    await setDoc(doc(webDb, 'lessons', 'g8-maths-c1-l1'), {
      id: 'g8-maths-c1-l1',
      title: 'Rational Numbers',
      type: 'text',
      ownerId: uid,
      createdAt: Date.now()
    }, { merge: true });
    console.log('✔ Write to /lessons/g8-maths-c1-l1 SUCCESS!');
  } catch (e: any) {
    console.error('❌ Write to /lessons/g8-maths-c1-l1 FAILED:', e.message);
  }
}

testWrite().catch(console.error);
