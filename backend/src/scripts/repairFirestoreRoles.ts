import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

const PROJECT_ID = 'gen-lang-client-0319194827';
const DATABASE_ID = 'ai-studio-2bce6e12-8e86-497d-9a6c-372bf2ee28e4';

if (!admin.apps.length) {
  admin.initializeApp({
    projectId: PROJECT_ID,
  });
}

const db = getFirestore(DATABASE_ID);

const ROLE_ASSIGNMENTS: Record<string, 'student' | 'superAdmin'> = {
  'ZHr4NYzIU5MmYSVUhDiK9JlVLYH2': 'superAdmin',
  'H9jVUUFV8xPrnIXObS7FqiD3SQE3': 'student',
  'BMnxALY7W3ZtqkBTtWsjRX1ZvI12': 'student',
  'fXaU2H7daHTOaWLI3ooyDlAzBEk1': 'student',
  'uRh9XKIrFVeIItlTRIbUI3Mbsaq1': 'student',
  'nvwMUWUW9rYlYrphVW9Sxz1oKmp1': 'student',
};

async function executeRoleRepair() {
  console.log('=== PHASE 4B.8 — INITIAL FIRESTORE ROLE REPAIR ===\n');

  const updateResults: Array<{
    uid: string;
    email: string;
    previousRole: string;
    newRole: string;
  }> = [];

  let firestoreWritesPerformed = 0;

  // Perform updates
  for (const [uid, newRole] of Object.entries(ROLE_ASSIGNMENTS)) {
    const docRef = db.collection('users').doc(uid);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      throw new Error(`Document /users/${uid} does not exist! Aborting repair.`);
    }

    const data = docSnap.data() || {};
    const previousRole = String(data.role || 'undefined');
    const email = data.email || 'no-email';

    // Preserve all existing fields and set/update role ONLY
    await docRef.set({ role: newRole }, { merge: true });
    firestoreWritesPerformed++;

    updateResults.push({
      uid,
      email,
      previousRole,
      newRole,
    });
  }

  console.log('--- REPAIR UPDATES COMPLETED ---');
  for (const res of updateResults) {
    console.log(`UID: ${res.uid} | Previous Role: ${res.previousRole} -> New Role: ${res.newRole}`);
  }

  // Verification read-back
  console.log('\n--- VERIFICATION READ-BACK ---');
  const firestoreSnapshot = await db.collection('users').get();

  let students = 0;
  let admins = 0;
  let superAdmins = 0;
  let missingInvalidRole = 0;

  firestoreSnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const role = data?.role;

    if (role === 'student') {
      students++;
    } else if (role === 'admin') {
      admins++;
    } else if (role === 'superAdmin') {
      superAdmins++;
    } else {
      missingInvalidRole++;
    }
  });

  console.log(`Students: ${students}`);
  console.log(`Admins: ${admins}`);
  console.log(`SuperAdmins: ${superAdmins}`);
  console.log(`Missing/Invalid Role: ${missingInvalidRole}`);
  console.log(`Firestore Writes Performed: ${firestoreWritesPerformed}`);

  if (students === 5 && admins === 0 && superAdmins === 1 && missingInvalidRole === 0) {
    console.log('\n✔ VERIFICATION SUCCESS: All 6 Firestore documents now have valid roles!');
  } else {
    console.error('\n❌ VERIFICATION FAILURE: Role counts do not match expected targets!');
    process.exit(1);
  }
}

executeRoleRepair().catch((err) => {
  console.error('Role repair failed:', err);
  process.exit(1);
});
