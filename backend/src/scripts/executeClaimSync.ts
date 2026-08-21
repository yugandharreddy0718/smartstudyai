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

const EXPECTED_ROLES: Record<string, string> = {
  'ZHr4NYzIU5MmYSVUhDiK9JlVLYH2': 'superAdmin',
  'H9jVUUFV8xPrnIXObS7FqiD3SQE3': 'student',
  'BMnxALY7W3ZtqkBTtWsjRX1ZvI12': 'student',
  'fXaU2H7daHTOaWLI3ooyDlAzBEk1': 'student',
  'uRh9XKIrFVeIItlTRIbUI3Mbsaq1': 'student',
  'nvwMUWUW9rYlYrphVW9Sxz1oKmp1': 'student',
};

function filterNonRoleClaims(claims?: Record<string, any>): Record<string, any> {
  if (!claims) return {};
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(claims)) {
    if (key !== 'role') {
      result[key] = value;
    }
  }
  return result;
}

export async function executeClaimSync() {
  console.log('=== PHASE 4B.9 — EXECUTE EXISTING USER CUSTOM CLAIM SYNCHRONIZATION ===\n');

  const updateLog: Array<{
    uid: string;
    email: string;
    previousClaims: Record<string, any>;
    newClaims: Record<string, any>;
    status: 'SUCCESS' | 'FAILED';
    error?: string;
  }> = [];

  let setCustomUserClaimsCalls = 0;
  let firestoreWritesPerformed = 0;

  // 1. SYNCHRONIZATION LOOP
  for (const [uid, expectedRole] of Object.entries(EXPECTED_ROLES)) {
    try {
      // Read current Auth record
      const userRecord = await admin.auth().getUser(uid);
      const existingClaims = userRecord.customClaims || {};
      const nonRoleClaims = filterNonRoleClaims(existingClaims);
      const mergedClaims = { ...nonRoleClaims, role: expectedRole };

      console.log(`[SYNC] Updating Auth UID: ${uid} (${userRecord.email || 'no-email'})`);
      console.log(`       Previous Claims: ${JSON.stringify(existingClaims)}`);
      console.log(`       New Claims:      ${JSON.stringify(mergedClaims)}`);

      // Set Custom User Claims in Firebase Auth
      await admin.auth().setCustomUserClaims(uid, mergedClaims);
      setCustomUserClaimsCalls++;

      updateLog.push({
        uid,
        email: userRecord.email || 'no-email',
        previousClaims: existingClaims,
        newClaims: mergedClaims,
        status: 'SUCCESS',
      });

      console.log(`✔ [SUCCESS] Set custom claim role="${expectedRole}" for UID ${uid}\n`);
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      console.error(`❌ [FAILED] Claim sync failed for UID ${uid}:`, errMsg);
      updateLog.push({
        uid,
        email: 'unknown',
        previousClaims: {},
        newClaims: {},
        status: 'FAILED',
        error: errMsg,
      });

      console.error('\nStopping execution immediately due to synchronization failure.');
      throw new Error(`Claim synchronization failed on UID ${uid}: ${errMsg}`);
    }
  }

  // 2. READ-ONLY VERIFICATION STEP USING admin.auth().getUser()
  console.log('--- READ-ONLY VERIFICATION VIA admin.auth().getUser() ---');
  let verifiedCorrect = 0;
  let verifiedMissing = 0;
  let verifiedMismatched = 0;

  for (const [uid, expectedRole] of Object.entries(EXPECTED_ROLES)) {
    const verifiedUser = await admin.auth().getUser(uid);
    const actualRole = verifiedUser.customClaims?.role;

    console.log(`UID ${uid} -> Auth Claim Role: "${actualRole}" | Expected: "${expectedRole}"`);

    if (!actualRole) {
      verifiedMissing++;
    } else if (actualRole === expectedRole) {
      verifiedCorrect++;
    } else {
      verifiedMismatched++;
    }
  }

  console.log('\n--- VERIFICATION SUMMARY ---');
  console.log(`Matched Users Verified Correct Claims: ${verifiedCorrect}`);
  console.log(`Matched Users Missing Role Claims:     ${verifiedMissing}`);
  console.log(`Matched Users Mismatched Role Claims:  ${verifiedMismatched}`);
  console.log(`Total setCustomUserClaims() Calls:      ${setCustomUserClaimsCalls}`);
  console.log(`Firestore Writes Performed:            ${firestoreWritesPerformed}`);

  if (verifiedCorrect === 6 && verifiedMissing === 0 && verifiedMismatched === 0) {
    console.log('\n✔ PHASE 4B.9 VERIFICATION SUCCESSFUL: All 6 matched accounts have correct custom claims!');
  } else {
    console.error('\n❌ PHASE 4B.9 VERIFICATION FAILED: Custom claim state does not match expected targets!');
    process.exit(1);
  }
}

executeClaimSync().catch((err) => {
  console.error('Fatal error during claim synchronization execution:', err);
  process.exit(1);
});
