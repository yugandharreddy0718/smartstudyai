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

function maskEmail(email?: string): string {
  if (!email) return 'NO_EMAIL';
  const parts = email.split('@');
  if (parts.length !== 2) return email;
  const name = parts[0];
  const domain = parts[1];
  const maskedName = name.length <= 2 ? name[0] + '*' : name.substring(0, 2) + '*'.repeat(Math.max(1, name.length - 2));
  return `${maskedName}@${domain}`;
}

async function runInvestigation() {
  console.log('=== STARTING READ-ONLY INVESTIGATION ===\n');

  // 1. Fetch Firestore /users
  const firestoreSnapshot = await db.collection('users').get();
  const firestoreDocs: Record<string, any> = {};
  firestoreSnapshot.forEach((docSnap) => {
    firestoreUsersLog(docSnap.id, docSnap.data());
    firestoreDocs[docSnap.id] = docSnap.data();
  });

  // 2. Fetch Auth Users
  const authUsers: Record<string, admin.auth.UserRecord> = {};
  let pageToken: string | undefined = undefined;
  do {
    const listResult = await admin.auth().listUsers(1000, pageToken);
    listResult.users.forEach((userRecord) => {
      authUsers[userRecord.uid] = userRecord;
    });
    pageToken = listResult.pageToken;
  } while (pageToken);

  console.log('\n--- 1. FIRESTORE PROFILES (/users) ---');
  let idx = 1;
  for (const [uid, data] of Object.entries(firestoreDocs)) {
    console.log(`\nFirestore Doc #${idx++}:`);
    console.log(`  UID: ${uid}`);
    console.log(`  email: ${maskEmail(data.email)}`);
    console.log(`  displayName/name: ${data.displayName || data.name || 'NOT_PRESENT'}`);
    console.log(`  studentClass/grade: ${data.studentClass || data.grade || data.class || 'NOT_PRESENT'}`);
    console.log(`  role field present: ${'role' in data}`);
    console.log(`  role value: ${data.role}`);
    console.log(`  createdAt: ${data.createdAt}`);
    console.log(`  updatedAt: ${data.updatedAt}`);
    console.log(`  All Document Keys: ${Object.keys(data).join(', ')}`);
    console.log(`  Raw Data: ${JSON.stringify(data)}`);
  }

  console.log('\n--- 2. MATCHED AUTH ACCOUNTS ---');
  idx = 1;
  for (const uid of Object.keys(firestoreDocs)) {
    const authUser = authUsers[uid];
    if (authUser) {
      console.log(`\nMatched Auth Account #${idx++}:`);
      console.log(`  UID: ${uid}`);
      console.log(`  email: ${maskEmail(authUser.email)}`);
      console.log(`  disabled: ${authUser.disabled}`);
      console.log(`  providerData: ${JSON.stringify(authUser.providerData.map(p => ({ providerId: p.providerId, email: maskEmail(p.email) })))}`);
      console.log(`  customClaims: ${JSON.stringify(authUser.customClaims || {})}`);
      console.log(`  creationTime: ${authUser.metadata.creationTime}`);
      console.log(`  lastSignInTime: ${authUser.metadata.lastSignInTime}`);
    } else {
      console.log(`\nMatched Auth Account #${idx++}: MISSING FOR UID ${uid}`);
    }
  }

  console.log('\n--- 3. UNMATCHED AUTH ACCOUNTS (Auth without Profile) ---');
  idx = 1;
  for (const [uid, authUser] of Object.entries(authUsers)) {
    if (!firestoreDocs[uid]) {
      console.log(`\nUnmatched Auth Account #${idx++}:`);
      console.log(`  UID: ${uid}`);
      console.log(`  email: ${maskEmail(authUser.email)}`);
      console.log(`  disabled: ${authUser.disabled}`);
      console.log(`  providerData: ${JSON.stringify(authUser.providerData.map(p => ({ providerId: p.providerId, email: maskEmail(p.email) })))}`);
      console.log(`  customClaims: ${JSON.stringify(authUser.customClaims || {})}`);
      console.log(`  creationTime: ${authUser.metadata.creationTime}`);
      console.log(`  lastSignInTime: ${authUser.metadata.lastSignInTime}`);
    }
  }
}

function firestoreUsersLog(id: string, data: any) {
  // helper
}

runInvestigation().catch(console.error);
