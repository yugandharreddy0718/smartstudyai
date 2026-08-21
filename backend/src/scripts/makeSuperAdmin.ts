import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

const PROJECT_ID = 'gen-lang-client-0319194827';
const DATABASE_ID = 'ai-studio-2bce6e12-8e86-497d-9a6c-372bf2ee28e4';

process.env.GCLOUD_PROJECT = PROJECT_ID;
process.env.GOOGLE_CLOUD_PROJECT = PROJECT_ID;

const TARGET_EMAIL = 'yugandharreddymukthapurram@gmail.com';
const TARGET_UID = 'nvwMUWUW9rYlYrphVW9Sxz1oKmp1';
const TARGET_ROLE = 'superAdmin';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: PROJECT_ID,
  });
}

async function getWorkingDb() {
  const namedDb = getFirestore(DATABASE_ID);
  try {
    const docRef = namedDb.collection('users').doc(TARGET_UID);
    await docRef.get();
    console.log(`[FIRESTORE] Connected to named database: "${DATABASE_ID}"`);
    return namedDb;
  } catch (e: any) {
    console.warn(`[NOTICE] Named database "${DATABASE_ID}" read returned: ${e?.message || e}. Falling back to default database...`);
    const defaultDb = getFirestore();
    console.log(`[FIRESTORE] Connected to default database: "(default)"`);
    return defaultDb;
  }
}

export async function promoteAccountToSuperAdmin(): Promise<void> {
  console.log(`==================================================`);
  console.log(`[PROMOTION START] Promoting ${TARGET_EMAIL}`);
  console.log(`Target UID: ${TARGET_UID}`);
  console.log(`Target Role: ${TARGET_ROLE}`);
  console.log(`==================================================`);

  const db = await getWorkingDb();
  const userDocRef = db.collection('users').doc(TARGET_UID);

  // 1. Fetch current Firestore user document
  const docSnapBefore = await userDocRef.get();
  let previousRole = 'student';
  if (docSnapBefore.exists) {
    const data = docSnapBefore.data();
    previousRole = data?.role || 'student';
    console.log(`[CURRENT FIRESTORE PROFILE FOUND]`);
    console.log(`UID: ${TARGET_UID}`);
    console.log(`Email in Firestore: ${data?.email || 'N/A'}`);
    console.log(`Current Role: ${previousRole}`);
  } else {
    console.log(`[NOTICE] No existing Firestore document at /users/${TARGET_UID}. Will create canonical profile.`);
  }

  // 2. Perform Non-Destructive Merge Write to Firestore /users/{uid}.role
  console.log(`\n[EXECUTING FIRESTORE ROLE UPDATE] Setting role: "${TARGET_ROLE}" on /users/${TARGET_UID}...`);
  await userDocRef.set({
    role: TARGET_ROLE,
    updatedAt: Date.now()
  }, { merge: true });

  // 3. Verification Step: Read back Firestore Document
  const docSnapAfter = await userDocRef.get();
  const updatedData = docSnapAfter.data();
  const updatedFirestoreRole = updatedData?.role;

  console.log(`\n[FIRESTORE VERIFICATION]`);
  console.log(`Firestore /users/${TARGET_UID}.role: "${updatedFirestoreRole}" (${updatedFirestoreRole === TARGET_ROLE ? 'VERIFIED SUCCESS' : 'FAILED'})`);
  console.log(`Preserved Fields: ${Object.keys(updatedData || {}).join(', ')}`);

  if (updatedFirestoreRole !== TARGET_ROLE) {
    console.error(`[CRITICAL ERROR] Firestore role update failed! Read back: "${updatedFirestoreRole}"`);
    process.exit(1);
  }

  // 4. Attempt Auth Custom Claim Update
  let authClaimVerified = false;
  console.log(`\n[ATTEMPTING FIREBASE AUTH CUSTOM CLAIM UPDATE]`);
  try {
    const authUser = await admin.auth().getUser(TARGET_UID);
    const existingClaims = authUser.customClaims || {};
    const mergedClaims = { ...existingClaims, role: TARGET_ROLE };

    await admin.auth().setCustomUserClaims(TARGET_UID, mergedClaims);

    const recheckedUser = await admin.auth().getUser(TARGET_UID);
    const setRole = recheckedUser.customClaims?.role;
    if (setRole === TARGET_ROLE) {
      authClaimVerified = true;
      console.log(`Auth Custom Claim role: "${setRole}" (VERIFIED SUCCESS)`);
    }
  } catch (err: any) {
    console.warn(`[NOTICE] Auth Custom Claim update via Admin SDK API returned restriction: ${err?.message || err}`);
    console.warn(`Note: SmartStudy AI frontend and backend fallback directly use canonical Firestore /users/{uid}.role ("${updatedFirestoreRole}"), which is fully active and verified.`);
  }

  console.log(`\n==================================================`);
  console.log(`[PROMOTION SUMMARY REPORT]`);
  console.log(`Email: ${TARGET_EMAIL}`);
  console.log(`UID: ${TARGET_UID}`);
  console.log(`Previous Role: ${previousRole}`);
  console.log(`New Role: ${updatedFirestoreRole}`);
  console.log(`Firestore Role Status: VERIFIED ("${updatedFirestoreRole}")`);
  console.log(`Auth Claim Status: ${authClaimVerified ? 'VERIFIED ("superAdmin")' : 'FIRESTORE FALLBACK ACTIVE'}`);
  console.log(`==================================================`);
  console.log(`[SUCCESS] Account ${TARGET_EMAIL} is now officially a ${TARGET_ROLE}!`);
}

// Auto-run when executed directly via tsx
promoteAccountToSuperAdmin().catch((err) => {
  console.error(`[CRITICAL ERROR] Promotion script failed:`, err);
  process.exit(1);
});
