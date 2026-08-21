import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

const PROJECT_ID = 'gen-lang-client-0319194827';
const DATABASE_ID = 'ai-studio-2bce6e12-8e86-497d-9a6c-372bf2ee28e4';

// Initialize Firebase Admin SDK using Application Default Credentials
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: PROJECT_ID,
  });
}

const ALLOWED_ROLES = ['student', 'admin', 'superAdmin'] as const;
type AllowedRole = typeof ALLOWED_ROLES[number];

function isValidRole(role: unknown): role is AllowedRole {
  return typeof role === 'string' && (ALLOWED_ROLES as readonly string[]).includes(role);
}

export async function runAudit(): Promise<void> {
  const db = getFirestore(DATABASE_ID);

  // 1. READ-ONLY FIRESTORE AUDIT (/users)
  const firestoreSnapshot = await db.collection('users').get();
  const firestoreUsers: Record<string, { uid: string; role: any }> = {};

  let totalFirestore = 0;
  let students = 0;
  let admins = 0;
  let superAdmins = 0;
  let missingInvalidRole = 0;

  firestoreSnapshot.forEach((docSnap) => {
    totalFirestore++;
    const data = docSnap.data();
    const role = data?.role;
    const uid = docSnap.id;

    firestoreUsers[uid] = { uid, role };

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

  // 2. READ-ONLY FIREBASE AUTH AUDIT
  const authUsers: Record<string, admin.auth.UserRecord> = {};
  let pageToken: string | undefined = undefined;

  do {
    const listResult: admin.auth.ListUsersResult = await admin.auth().listUsers(1000, pageToken);
    listResult.users.forEach((userRecord) => {
      authUsers[userRecord.uid] = userRecord;
    });
    pageToken = listResult.pageToken;
  } while (pageToken);

  // 3. MATCHING & CUSTOM CLAIMS & ACTIONS CALCULATION
  let matched = 0;
  let missingAuth = 0;
  let authWithoutProfile = 0;

  let correctClaims = 0;
  let missingClaims = 0;
  let mismatchedClaims = 0;
  let unrelatedClaims = 0;

  let noChange = 0;
  let setRole = 0;
  let updateRole = 0;
  let skipInvalidRole = 0;
  let skipMissingAuth = 0;
  let skipMissingProfile = 0;

  const processedUids: Record<string, boolean> = {};

  // Process all Firestore users
  for (const uid of Object.keys(firestoreUsers)) {
    processedUids[uid] = true;
    const firestoreUser = firestoreUsers[uid];
    const firestoreRole = firestoreUser.role;
    const isRoleValid = isValidRole(firestoreRole);
    const authUser = authUsers[uid];

    if (!authUser) {
      missingAuth++;
      skipMissingAuth++;
      continue;
    }

    matched++;

    if (!isRoleValid) {
      skipInvalidRole++;
      continue;
    }

    const customClaims = authUser.customClaims || {};
    const authRole = customClaims.role;

    // Check for unrelated custom claims (keys other than 'role')
    const nonRoleClaimKeys = Object.keys(customClaims).filter((key) => key !== 'role');
    if (nonRoleClaimKeys.length > 0) {
      unrelatedClaims++;
    }

    if (!authRole) {
      missingClaims++;
      setRole++;
    } else if (authRole === firestoreRole) {
      correctClaims++;
      noChange++;
    } else {
      mismatchedClaims++;
      updateRole++;
    }
  }

  // Process Auth users that do not have a Firestore profile
  for (const uid of Object.keys(authUsers)) {
    if (!processedUids[uid]) {
      authWithoutProfile++;
      skipMissingProfile++;
    }
  }

  // 4. PRINT REPORT
  console.log(`========================================
SMARTSTUDY AI — LIVE READ-ONLY AUDIT
========================================

PROJECT:
${PROJECT_ID}

FIRESTORE DATABASE:
${DATABASE_ID}

FIRESTORE USERS
Total: ${totalFirestore}
Students: ${students}
Admins: ${admins}
SuperAdmins: ${superAdmins}
Missing/Invalid Role: ${missingInvalidRole}

AUTH MATCHING
Matched: ${matched}
Missing Auth: ${missingAuth}
Auth Without Profile: ${authWithoutProfile}

CUSTOM CLAIMS
Correct: ${correctClaims}
Missing: ${missingClaims}
Mismatched: ${mismatchedClaims}
Unrelated Claims: ${unrelatedClaims}

MIGRATION ACTIONS — DRY RUN ONLY
NO_CHANGE: ${noChange}
SET_ROLE: ${setRole}
UPDATE_ROLE: ${updateRole}
SKIP_INVALID_ROLE: ${skipInvalidRole}
SKIP_MISSING_AUTH: ${skipMissingAuth}
SKIP_MISSING_PROFILE: ${skipMissingProfile}

SAFETY
setCustomUserClaims calls: 0
Firestore writes: 0
Auth modifications: 0
Storage modifications: 0
Deployments: 0

========================================`);
}

// Auto-run if script is executed directly via tsx / node
runAudit().catch((error) => {
  console.error('Audit execution error:', error);
  process.exit(1);
});
