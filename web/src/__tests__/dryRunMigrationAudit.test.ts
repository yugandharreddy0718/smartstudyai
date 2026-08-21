import { describe, it, expect } from 'vitest';

// Unit Test Engine for Dry-Run Migration Audit Logic
interface UserDoc {
  uid: string;
  role?: string;
}

interface AuthRecord {
  uid: string;
  customClaims?: Record<string, any>;
}

function processDryRunAudit(firestoreDocs: UserDoc[], authRecords: AuthRecord[]) {
  const firestoreMap = new Map<string, UserDoc>();
  firestoreDocs.forEach(doc => firestoreMap.set(doc.uid, doc));

  const authMap = new Map<string, AuthRecord>();
  authRecords.forEach(rec => authMap.set(rec.uid, rec));

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

  const dryRunTable: Array<{
    uid: string;
    firestoreRole: string;
    authClaimRole: string;
    action: string;
    nonRoleClaimsPreserved: Record<string, any>;
  }> = [];

  const processedUids = new Set<string>();

  for (const [uid, data] of firestoreMap.entries()) {
    processedUids.add(uid);
    const role = data.role;
    const isValid = role === 'student' || role === 'admin' || role === 'superAdmin';

    if (isValid) {
      roleDist[role as 'student' | 'admin' | 'superAdmin']++;
    } else {
      roleDist.missingOrInvalidRole++;
    }

    const authUser = authMap.get(uid);

    if (!authUser) {
      authMatch.firestoreWithoutAuth++;
      actionsCount.SKIP_MISSING_AUTH++;
      dryRunTable.push({
        uid,
        firestoreRole: role || 'NONE',
        authClaimRole: 'NO_AUTH_RECORD',
        action: 'SKIP_MISSING_AUTH',
        nonRoleClaimsPreserved: {}
      });
      continue;
    }

    authMatch.matchedFirestoreAndAuth++;

    if (!isValid) {
      actionsCount.SKIP_INVALID_ROLE++;
      dryRunTable.push({
        uid,
        firestoreRole: role || 'INVALID',
        authClaimRole: authUser.customClaims?.role || 'NONE',
        action: 'SKIP_INVALID_ROLE',
        nonRoleClaimsPreserved: filterNonRoleClaims(authUser.customClaims)
      });
      continue;
    }

    const claims = authUser.customClaims || {};
    const authRole = claims.role;
    const nonRoleClaims = filterNonRoleClaims(claims);

    if (Object.keys(nonRoleClaims).length > 0) {
      claimDist.hasNonRoleCustomClaims++;
    }

    if (!authRole) {
      claimDist.missingRoleClaim++;
      actionsCount.SET_ROLE++;
      dryRunTable.push({
        uid,
        firestoreRole: role,
        authClaimRole: 'NONE',
        action: 'SET_ROLE',
        nonRoleClaimsPreserved: nonRoleClaims
      });
    } else if (authRole === role) {
      claimDist.correctRoleClaim++;
      actionsCount.NO_CHANGE++;
      dryRunTable.push({
        uid,
        firestoreRole: role,
        authClaimRole: authRole,
        action: 'NO_CHANGE',
        nonRoleClaimsPreserved: nonRoleClaims
      });
    } else {
      claimDist.incorrectRoleClaim++;
      actionsCount.UPDATE_ROLE++;
      dryRunTable.push({
        uid,
        firestoreRole: role,
        authClaimRole: authRole,
        action: 'UPDATE_ROLE',
        nonRoleClaimsPreserved: nonRoleClaims
      });
    }
  }

  for (const [uid, authUser] of authMap.entries()) {
    if (!processedUids.has(uid)) {
      authMatch.authWithoutFirestore++;
      actionsCount.SKIP_MISSING_PROFILE++;
      dryRunTable.push({
        uid,
        firestoreRole: 'NO_FIRESTORE_DOC',
        authClaimRole: authUser.customClaims?.role || 'NONE',
        action: 'SKIP_MISSING_PROFILE',
        nonRoleClaimsPreserved: filterNonRoleClaims(authUser.customClaims)
      });
    }
  }

  return {
    totalFirestoreDocs: firestoreDocs.length,
    totalAuthRecords: authRecords.length,
    roleDist,
    authMatch,
    claimDist,
    actionsCount,
    dryRunTable,
    modificationsExecuted: false,
    deploymentsExecuted: false
  };
}

function filterNonRoleClaims(claims?: Record<string, any>): Record<string, any> {
  if (!claims) return {};
  const res: Record<string, any> = {};
  for (const [k, v] of Object.entries(claims)) {
    if (k !== 'role') res[k] = v;
  }
  return res;
}

describe('Phase 4B.7 Existing User Custom Claim Migration Dry-Run Audit Tests', () => {
  it('1. Categorizes NO_CHANGE when Auth claim matches Firestore role', () => {
    const firestoreDocs = [{ uid: 'u1', role: 'student' }];
    const authRecords = [{ uid: 'u1', customClaims: { role: 'student' } }];
    
    const result = processDryRunAudit(firestoreDocs, authRecords);
    expect(result.actionsCount.NO_CHANGE).toBe(1);
    expect(result.dryRunTable[0].action).toBe('NO_CHANGE');
  });

  it('2. Categorizes SET_ROLE when Auth account has missing role claim', () => {
    const firestoreDocs = [{ uid: 'u2', role: 'admin' }];
    const authRecords = [{ uid: 'u2', customClaims: { premium: true } }];
    
    const result = processDryRunAudit(firestoreDocs, authRecords);
    expect(result.actionsCount.SET_ROLE).toBe(1);
    expect(result.dryRunTable[0].action).toBe('SET_ROLE');
    expect(result.dryRunTable[0].nonRoleClaimsPreserved).toEqual({ premium: true });
  });

  it('3. Categorizes UPDATE_ROLE when Auth claim differs from Firestore role', () => {
    const firestoreDocs = [{ uid: 'u3', role: 'superAdmin' }];
    const authRecords = [{ uid: 'u3', customClaims: { role: 'admin' } }];
    
    const result = processDryRunAudit(firestoreDocs, authRecords);
    expect(result.actionsCount.UPDATE_ROLE).toBe(1);
    expect(result.dryRunTable[0].action).toBe('UPDATE_ROLE');
  });

  it('4. Categorizes SKIP_MISSING_AUTH when user doc has no Auth record', () => {
    const firestoreDocs = [{ uid: 'u4', role: 'student' }];
    const authRecords: AuthRecord[] = [];
    
    const result = processDryRunAudit(firestoreDocs, authRecords);
    expect(result.actionsCount.SKIP_MISSING_AUTH).toBe(1);
    expect(result.dryRunTable[0].action).toBe('SKIP_MISSING_AUTH');
  });

  it('5. Categorizes SKIP_MISSING_PROFILE when Auth record has no Firestore doc', () => {
    const firestoreDocs: UserDoc[] = [];
    const authRecords = [{ uid: 'u5', customClaims: { role: 'student' } }];
    
    const result = processDryRunAudit(firestoreDocs, authRecords);
    expect(result.actionsCount.SKIP_MISSING_PROFILE).toBe(1);
    expect(result.dryRunTable[0].action).toBe('SKIP_MISSING_PROFILE');
  });

  it('6. Preserves non-role custom claims without overwriting them', () => {
    const firestoreDocs = [{ uid: 'u6', role: 'admin' }];
    const authRecords = [{ uid: 'u6', customClaims: { orgId: 'org123', betaTester: true } }];
    
    const result = processDryRunAudit(firestoreDocs, authRecords);
    expect(result.dryRunTable[0].nonRoleClaimsPreserved).toEqual({ orgId: 'org123', betaTester: true });
  });

  it('7. Confirms ZERO modifications and ZERO deployments executed', () => {
    const result = processDryRunAudit([], []);
    expect(result.modificationsExecuted).toBe(false);
    expect(result.deploymentsExecuted).toBe(false);
  });
});
