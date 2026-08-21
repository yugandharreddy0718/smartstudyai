import admin from 'firebase-admin';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || 'gen-lang-client-0319194827'
    });
  } catch (error) {
    console.warn('Firebase Admin SDK auto-initialization notice in authRoleService:', error);
  }
}

export const ALLOWED_ROLES = ['student', 'admin', 'superAdmin'] as const;
export type AllowedRole = typeof ALLOWED_ROLES[number];

export function isValidRole(role: any): role is AllowedRole {
  return typeof role === 'string' && (ALLOWED_ROLES as readonly string[]).includes(role);
}

export function getAdminFirestore() {
  if (!admin.apps.length) {
    throw new Error('Firebase Admin SDK is not initialized.');
  }
  try {
    return (admin as any).firestore('ai-studio-2bce6e12-8e86-497d-9a6c-372bf2ee28e4');
  } catch (e) {
    return admin.firestore();
  }
}

export interface SyncUserRoleResult {
  success: boolean;
  uid: string;
  previousRole: string;
  newRole: AllowedRole;
}

/**
 * Synchronize user role from Firestore to Firebase Auth Custom Claims.
 * Preserves non-role custom claims.
 * Atomicity: Sets Auth custom claim first. If Firestore update fails, attempts rollback to previousRole.
 */
export async function syncUserRole(targetUid: string, newRole: string): Promise<SyncUserRoleResult> {
  if (!targetUid || typeof targetUid !== 'string' || !targetUid.trim()) {
    throw new Error('Invalid target UID provided.');
  }

  if (!isValidRole(newRole)) {
    throw new Error(`Invalid role "${newRole}". Allowed roles are: ${ALLOWED_ROLES.join(', ')}`);
  }

  const cleanUid = targetUid.trim();
  const db = getAdminFirestore();
  const userDocRef = db.collection('users').doc(cleanUid);

  // 1. Fetch current user document to get existing role for rollback protection
  let previousRole: AllowedRole = 'student';
  try {
    const docSnap = await userDocRef.get();
    if (docSnap.exists) {
      const data = docSnap.data();
      if (data && isValidRole(data.role)) {
        previousRole = data.role;
      }
    }
  } catch (err) {
    console.warn(`Notice: Could not read existing Firestore role for ${cleanUid}, defaulting rollback baseline to student:`, err);
  }

  // 2. Fetch existing custom claims to preserve non-role claims
  let existingClaims: Record<string, any> = {};
  try {
    const userRecord = await admin.auth().getUser(cleanUid);
    existingClaims = userRecord.customClaims || {};
  } catch (e) {
    console.warn(`Notice: Could not read existing custom claims for ${cleanUid}:`, e);
  }

  const mergedClaims = { ...existingClaims, role: newRole };

  // 3. Set Firebase Auth Custom Claim (preserving non-role custom claims)
  try {
    await admin.auth().setCustomUserClaims(cleanUid, mergedClaims);
  } catch (authErr: any) {
    console.error(`Failed to set custom user claim for ${cleanUid}:`, authErr);
    throw new Error(`Firebase Auth custom claim update failed: ${authErr.message}`);
  }

  // 4. Update Firestore Document /users/{uid}.role
  try {
    await userDocRef.set({
      role: newRole,
      updatedAt: Date.now()
    }, { merge: true });

    return {
      success: true,
      uid: cleanUid,
      previousRole,
      newRole
    };
  } catch (firestoreErr: any) {
    console.error(`CRITICAL: Firestore role update failed for ${cleanUid} after Auth claim was set. Attempting rollback to "${previousRole}"...`, firestoreErr);
    
    // Attempt Rollback preserving non-role claims
    try {
      const rollbackClaims = { ...existingClaims, role: previousRole };
      await admin.auth().setCustomUserClaims(cleanUid, rollbackClaims);
      console.log(`Rollback successful: Restored Auth claim for ${cleanUid} to "${previousRole}".`);
      throw new Error(`Firestore role update failed: ${firestoreErr.message}. Auth claim was safely rolled back to "${previousRole}".`);
    } catch (rollbackErr: any) {
      const criticalMessage = `CRITICAL INCONSISTENCY DETECTED: Firestore update failed (${firestoreErr.message}) AND Auth claim rollback failed (${rollbackErr.message}) for user ${cleanUid}. User Auth claim is currently set to "${newRole}", but Firestore role remains "${previousRole}". Manual remediation required!`;
      console.error(criticalMessage);
      throw new Error(criticalMessage);
    }
  }
}

export type DryRunAction = 
  | 'NO_CHANGE' 
  | 'SET_ROLE' 
  | 'UPDATE_ROLE' 
  | 'SKIP_INVALID_ROLE' 
  | 'SKIP_MISSING_AUTH' 
  | 'SKIP_MISSING_PROFILE';

export interface DryRunAuditItem {
  uid: string;
  firestoreRole: string;
  authClaimRole: string;
  action: DryRunAction;
  nonRoleClaimsPreserved: Record<string, any>;
  details: string;
}

export interface DryRunAuditReport {
  totalFirestoreDocuments: number;
  totalAuthUsersCount: number;
  roleDistribution: {
    student: number;
    admin: number;
    superAdmin: number;
    missingOrInvalidRole: number;
  };
  authMatching: {
    matchedFirestoreAndAuth: number;
    firestoreWithoutAuth: number;
    authWithoutFirestore: number;
  };
  customClaimDistribution: {
    correctRoleClaim: number;
    missingRoleClaim: number;
    incorrectRoleClaim: number;
    hasNonRoleCustomClaims: number;
  };
  actionsSummary: {
    NO_CHANGE: number;
    SET_ROLE: number;
    UPDATE_ROLE: number;
    SKIP_INVALID_ROLE: number;
    SKIP_MISSING_AUTH: number;
    SKIP_MISSING_PROFILE: number;
  };
  dryRunTable: DryRunAuditItem[];
  modificationsExecuted: false;
  deploymentsExecuted: false;
}

/**
 * READ-ONLY Migration Dry-Run Audit Generator
 * Scans Firestore /users and Firebase Auth users without modifying ANY data.
 */
export async function generateMigrationDryRunAudit(): Promise<DryRunAuditReport> {
  const db = getAdminFirestore();
  
  // 1. Read Firestore /users collection
  const firestoreSnapshot = await db.collection('users').get();
  const firestoreUserMap = new Map<string, any>();
  
  firestoreSnapshot.forEach((docSnap: any) => {
    firestoreUserMap.set(docSnap.id, docSnap.data());
  });

  // 2. Fetch Firebase Auth Users
  const authUserMap = new Map<string, admin.auth.UserRecord>();
  try {
    let pageToken: string | undefined;
    do {
      const listResult = await admin.auth().listUsers(1000, pageToken);
      listResult.users.forEach((userRecord) => {
        authUserMap.set(userRecord.uid, userRecord);
      });
      pageToken = listResult.pageToken;
    } while (pageToken);
  } catch (err) {
    console.warn('Notice: Could not list Firebase Auth users via Admin SDK in environment:', err);
  }

  // Statistics counters
  const roleDist = { student: 0, admin: 0, superAdmin: 0, missingOrInvalidRole: 0 };
  const authMatch = { matchedFirestoreAndAuth: 0, firestoreWithoutAuth: 0, authWithoutFirestore: 0 };
  const claimDist = { correctRoleClaim: 0, missingRoleClaim: 0, incorrectRoleClaim: 0, hasNonRoleCustomClaims: 0 };
  const actionsCount = {
    NO_CHANGE: 0,
    SET_ROLE: 0,
    UPDATE_ROLE: 0,
    SKIP_INVALID_ROLE: 0,
    SKIP_MISSING_AUTH: 0,
    SKIP_MISSING_PROFILE: 0
  };

  const dryRunTable: DryRunAuditItem[] = [];

  // Track processed UIDs
  const processedUids = new Set<string>();

  // Process Firestore documents first
  for (const [uid, data] of firestoreUserMap.entries()) {
    processedUids.add(uid);
    const rawRole = data?.role;
    const isValid = isValidRole(rawRole);

    if (isValid) {
      roleDist[rawRole as AllowedRole]++;
    } else {
      roleDist.missingOrInvalidRole++;
    }

    const authUser = authUserMap.get(uid);

    if (!authUser) {
      authMatch.firestoreWithoutAuth++;
      actionsCount.SKIP_MISSING_AUTH++;
      dryRunTable.push({
        uid,
        firestoreRole: String(rawRole || 'NONE'),
        authClaimRole: 'NO_AUTH_RECORD',
        action: 'SKIP_MISSING_AUTH',
        nonRoleClaimsPreserved: {},
        details: 'Firestore user document exists, but no corresponding Firebase Auth account found.'
      });
      continue;
    }

    authMatch.matchedFirestoreAndAuth++;

    if (!isValid) {
      actionsCount.SKIP_INVALID_ROLE++;
      dryRunTable.push({
        uid,
        firestoreRole: String(rawRole || 'INVALID'),
        authClaimRole: String(authUser.customClaims?.role || 'NONE'),
        action: 'SKIP_INVALID_ROLE',
        nonRoleClaimsPreserved: filterNonRoleClaims(authUser.customClaims),
        details: `Firestore role "${rawRole}" is invalid. User skipped for role migration.`
      });
      continue;
    }

    const customClaims = authUser.customClaims || {};
    const authRole = customClaims.role;
    const nonRoleClaims = filterNonRoleClaims(customClaims);

    if (Object.keys(nonRoleClaims).length > 0) {
      claimDist.hasNonRoleCustomClaims++;
    }

    if (!authRole) {
      claimDist.missingRoleClaim++;
      actionsCount.SET_ROLE++;
      dryRunTable.push({
        uid,
        firestoreRole: rawRole,
        authClaimRole: 'NONE',
        action: 'SET_ROLE',
        nonRoleClaimsPreserved: nonRoleClaims,
        details: `Auth account missing role custom claim. Would set claim to "${rawRole}".`
      });
    } else if (authRole === rawRole) {
      claimDist.correctRoleClaim++;
      actionsCount.NO_CHANGE++;
      dryRunTable.push({
        uid,
        firestoreRole: rawRole,
        authClaimRole: authRole,
        action: 'NO_CHANGE',
        nonRoleClaimsPreserved: nonRoleClaims,
        details: `Role claim matches Firestore role ("${rawRole}"). No modification required.`
      });
    } else {
      claimDist.incorrectRoleClaim++;
      actionsCount.UPDATE_ROLE++;
      dryRunTable.push({
        uid,
        firestoreRole: rawRole,
        authClaimRole: authRole,
        action: 'UPDATE_ROLE',
        nonRoleClaimsPreserved: nonRoleClaims,
        details: `Role mismatch (Auth: "${authRole}" vs Firestore: "${rawRole}"). Would update Auth claim to "${rawRole}".`
      });
    }
  }

  // Process Auth users missing Firestore profiles
  for (const [uid, authUser] of authUserMap.entries()) {
    if (!processedUids.has(uid)) {
      authMatch.authWithoutFirestore++;
      actionsCount.SKIP_MISSING_PROFILE++;
      const customClaims = authUser.customClaims || {};
      dryRunTable.push({
        uid,
        firestoreRole: 'NO_FIRESTORE_DOC',
        authClaimRole: String(customClaims.role || 'NONE'),
        action: 'SKIP_MISSING_PROFILE',
        nonRoleClaimsPreserved: filterNonRoleClaims(customClaims),
        details: 'Firebase Auth user exists without corresponding Firestore user document.'
      });
    }
  }

  return {
    totalFirestoreDocuments: firestoreUserMap.size,
    totalAuthUsersCount: authUserMap.size,
    roleDistribution: roleDist,
    authMatching: authMatch,
    customClaimDistribution: claimDist,
    actionsSummary: actionsCount,
    dryRunTable,
    modificationsExecuted: false,
    deploymentsExecuted: false
  };
}

function filterNonRoleClaims(claims: Record<string, any> | undefined): Record<string, any> {
  if (!claims) return {};
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(claims)) {
    if (key !== 'role') {
      result[key] = value;
    }
  }
  return result;
}
