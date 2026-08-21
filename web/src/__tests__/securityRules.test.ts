import { describe, it, expect } from 'vitest';

// Helper simulating Firestore Security Rule Evaluations
function evaluateRule(
  ruleType: 'read' | 'write' | 'list' | 'get' | 'create' | 'update' | 'delete',
  path: string,
  auth: { uid: string } | null,
  userDoc?: any,
  requestData?: any,
  resourceData?: any
) {
  const isSignedIn = auth !== null;
  const uid = auth?.uid;
  const isOwner = (userId: string) => isSignedIn && uid === userId;
  const isAdmin = isSignedIn && userDoc && (userDoc.role === 'admin' || userDoc.role === 'superAdmin');
  const isSuperAdmin = isSignedIn && userDoc && userDoc.role === 'superAdmin';

  // 1. Recursive Curriculum Protection: /curriculum/{classId} and all subcollections
  if (path.startsWith('/curriculum/')) {
    if (ruleType === 'read' || ruleType === 'get' || ruleType === 'list') {
      return isSignedIn; // allow read: if isSignedIn();
    }
    if (ruleType === 'write' || ruleType === 'create' || ruleType === 'update' || ruleType === 'delete') {
      return isAdmin; // allow write: if isAdmin();
    }
  }

  // 2. Lesson Progress Subcollection Protection: /users/{userId}/lessonProgress/{lessonId}
  const progressMatch = path.match(/^\/users\/([^/]+)\/lessonProgress\/([^/]+)$/);
  if (progressMatch) {
    const targetUserId = progressMatch[1];
    if (ruleType === 'read' || ruleType === 'get' || ruleType === 'write' || ruleType === 'create' || ruleType === 'update') {
      return isOwner(targetUserId); // allow read, write: if isOwner(userId);
    }
  }

  // 3. User Profile Protection: /users/{userId}
  const userMatch = path.match(/^\/users\/([^/]+)$/);
  if (userMatch) {
    const targetUserId = userMatch[1];
    if (ruleType === 'get') {
      return isOwner(targetUserId) || isAdmin;
    }
    if (ruleType === 'list') {
      return isAdmin;
    }
    if (ruleType === 'update') {
      const affectedKeys = Object.keys(requestData || {});
      const modifiesRole = affectedKeys.includes('role') && requestData.role !== resourceData?.role;
      if (modifiesRole) {
        return isSuperAdmin; // Only Super Admin can change role
      }
      return isOwner(targetUserId) || isSuperAdmin;
    }
  }

  return false;
}

describe('Firestore Security Rules Logic Verification (22 Test Cases)', () => {
  const studentAuth = { uid: 'student_123' };
  const studentDoc = { role: 'student' };

  const adminAuth = { uid: 'admin_123' };
  const adminDoc = { role: 'admin' };

  const superAdminAuth = { uid: 'super_123' };
  const superAdminDoc = { role: 'superAdmin' };

  // CURRICULUM TESTS (1 to 10)
  it('TEST 1: Student reads subject -> ALLOW', () => {
    expect(evaluateRule('read', '/curriculum/class_8/subjects/maths', studentAuth, studentDoc)).toBe(true);
  });

  it('TEST 2: Student reads chapter -> ALLOW', () => {
    expect(evaluateRule('read', '/curriculum/class_8/subjects/maths/chapters/c1', studentAuth, studentDoc)).toBe(true);
  });

  it('TEST 3: Student reads lesson -> ALLOW', () => {
    expect(evaluateRule('read', '/curriculum/class_8/subjects/maths/chapters/c1/lessons/l1', studentAuth, studentDoc)).toBe(true);
  });

  it('TEST 4: Student creates subject -> DENY', () => {
    expect(evaluateRule('create', '/curriculum/class_8/subjects/new_subj', studentAuth, studentDoc)).toBe(false);
  });

  it('TEST 5: Student updates chapter -> DENY', () => {
    expect(evaluateRule('update', '/curriculum/class_8/subjects/maths/chapters/c1', studentAuth, studentDoc)).toBe(false);
  });

  it('TEST 6: Student deletes lesson -> DENY', () => {
    expect(evaluateRule('delete', '/curriculum/class_8/subjects/maths/chapters/c1/lessons/l1', studentAuth, studentDoc)).toBe(false);
  });

  it('TEST 7: Admin creates subject -> ALLOW', () => {
    expect(evaluateRule('create', '/curriculum/class_8/subjects/new_subj', adminAuth, adminDoc)).toBe(true);
  });

  it('TEST 8: Admin updates chapter -> ALLOW', () => {
    expect(evaluateRule('update', '/curriculum/class_8/subjects/maths/chapters/c1', adminAuth, adminDoc)).toBe(true);
  });

  it('TEST 9: Admin deletes lesson -> ALLOW', () => {
    expect(evaluateRule('delete', '/curriculum/class_8/subjects/maths/chapters/c1/lessons/l1', adminAuth, adminDoc)).toBe(true);
  });

  it('TEST 10: Super Admin modifies curriculum -> ALLOW', () => {
    expect(evaluateRule('update', '/curriculum/class_8/subjects/maths/chapters/c1/lessons/l1', superAdminAuth, superAdminDoc)).toBe(true);
  });

  // USER PROFILE TESTS (11 to 18)
  it('TEST 11: Student reads own profile -> ALLOW', () => {
    expect(evaluateRule('get', '/users/student_123', studentAuth, studentDoc)).toBe(true);
  });

  it('TEST 12: Student reads another user profile -> DENY', () => {
    expect(evaluateRule('get', '/users/other_user', studentAuth, studentDoc)).toBe(false);
  });

  it('TEST 13: Student updates own displayName -> ALLOW', () => {
    expect(evaluateRule('update', '/users/student_123', studentAuth, studentDoc, { displayName: 'New Name' }, { role: 'student' })).toBe(true);
  });

  it('TEST 14: Student changes own role to admin -> DENY', () => {
    expect(evaluateRule('update', '/users/student_123', studentAuth, studentDoc, { role: 'admin' }, { role: 'student' })).toBe(false);
  });

  it('TEST 15: Student changes own role to superAdmin -> DENY', () => {
    expect(evaluateRule('update', '/users/student_123', studentAuth, studentDoc, { role: 'superAdmin' }, { role: 'student' })).toBe(false);
  });

  it('TEST 16: Admin reads/list users -> ALLOW', () => {
    expect(evaluateRule('list', '/users/student_123', adminAuth, adminDoc)).toBe(true);
  });

  it('TEST 17: Admin changes another user role -> DENY', () => {
    expect(evaluateRule('update', '/users/student_123', adminAuth, adminDoc, { role: 'admin' }, { role: 'student' })).toBe(false);
  });

  it('TEST 18: Super Admin changes another user role -> ALLOW', () => {
    expect(evaluateRule('update', '/users/student_123', superAdminAuth, superAdminDoc, { role: 'admin' }, { role: 'student' })).toBe(true);
  });

  // LESSON PROGRESS TESTS (19 to 22)
  it('TEST 19: Student reads own lessonProgress -> ALLOW', () => {
    expect(evaluateRule('get', '/users/student_123/lessonProgress/l1', studentAuth, studentDoc)).toBe(true);
  });

  it('TEST 20: Student writes own lessonProgress -> ALLOW', () => {
    expect(evaluateRule('write', '/users/student_123/lessonProgress/l1', studentAuth, studentDoc)).toBe(true);
  });

  it('TEST 21: Student reads another user lessonProgress -> DENY', () => {
    expect(evaluateRule('get', '/users/other_user/lessonProgress/l1', studentAuth, studentDoc)).toBe(false);
  });

  it('TEST 22: Student writes another user lessonProgress -> DENY', () => {
    expect(evaluateRule('write', '/users/other_user/lessonProgress/l1', studentAuth, studentDoc)).toBe(false);
  });
});
