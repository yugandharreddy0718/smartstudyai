import { db, auth } from '@smartstudy/firebase';
import { 
  collection, 
  getDocs, 
  collectionGroup,
  doc,
  getDoc,
  onSnapshot
} from 'firebase/firestore';
import { UserProfile, UserRole } from '@smartstudy/shared';
import { getChaptersBySubject, getLessonById } from '../data/curriculum';

export interface AdminStats {
  totalStudents: number;
  totalAdmins: number;
  totalSubjects: number;
  totalChapters: number;
  totalLessons: number;
  totalQuizzes: number;
  totalCurriculumItems: number;
}

export interface StudentUser {
  uid: string;
  email: string;
  displayName: string;
  studentClass: string;
  role: UserRole;
  createdAt: number;
  lastLogin: number;
  stats: {
    xp: number;
    streak: number;
    level: number;
    badges: string[];
  };
  completedLessons?: string[];
}

export interface AdminAnalyticsMetrics {
  gradeDistribution: Record<string, number>;
  subjectDistribution: Record<string, number>;
  totalCompletedLessons: number;
  averageXP: number;
  activeGradesCount: number;
}

export interface ValidationReport {
  passed: boolean;
  totalChapters: number;
  totalLessons: number;
  uniqueChapterIdsCount: number;
  uniqueLessonIdsCount: number;
  validGradeMapping: boolean;
  validSubjectMapping: boolean;
  noEmptyLessons: boolean;
  all13SectionsPresent: boolean;
  warnings: string[];
  errors: string[];
}

/**
 * Determines whether a user document represents a valid registered student account.
 * Excludes:
 * - Empty or missing UIDs
 * - Accounts with role other than 'student' (never assumes default 'student')
 * - Admin and superAdmin accounts
 * - Anonymous / guest sessions (provider === 'anonymous' or isAnonymous === true)
 * - Missing or invalid email addresses
 * - Mock, demonstration, or sample accounts
 */
export function isRegisteredStudent(uid: string, data: any): boolean {
  if (!uid || typeof uid !== 'string' || !uid.trim()) return false;
  if (!data || typeof data !== 'object') return false;

  // Role must be explicitly 'student' (which also naturally excludes 'admin', 'superAdmin', etc.)
  const roleNorm = String(data.role || '').trim().toLowerCase();
  if (roleNorm !== 'student') return false;

  // Exclude anonymous / guest accounts generated during test runs
  if (data.provider === 'anonymous' || data.isAnonymous === true) return false;

  // Must have a valid registered email address
  const email = typeof data.email === 'string' ? data.email.trim() : '';
  if (!email || !email.includes('@')) return false;

  // Exclude mock / demonstration flags
  if (data.isMock === true || data.isSample === true || data.isDemo === true || data.mock === true) return false;

  return true;
}

/**
 * Determines whether a user document represents an administrator account.
 */
export function isRegisteredAdmin(uid: string, data: any): boolean {
  if (!uid || typeof uid !== 'string' || !uid.trim()) return false;
  if (!data || typeof data !== 'object') return false;

  const roleNorm = String(data.role || '').trim().toLowerCase();
  if (roleNorm !== 'admin' && roleNorm !== 'superadmin') return false;

  if (data.isMock === true || data.isSample === true || data.isDemo === true || data.mock === true) return false;

  return true;
}

export async function fetchAdminStats(): Promise<AdminStats> {
  try {
    // 1. Fetch Users stats with strict UID deduplication and role filtering
    let totalStudents = 0;
    let totalAdmins = 0;
    
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const seenStudentUids = new Set<string>();
      const seenAdminUids = new Set<string>();

      usersSnap.forEach((docSnap) => {
        const uid = docSnap.id;
        const data = docSnap.data();

        if (isRegisteredAdmin(uid, data)) {
          seenAdminUids.add(uid);
        } else if (isRegisteredStudent(uid, data)) {
          seenStudentUids.add(uid);
        }
      });

      // Ensure any admin UID is completely excluded from student counts
      seenAdminUids.forEach((adminUid) => {
        seenStudentUids.delete(adminUid);
      });

      totalStudents = seenStudentUids.size;
      totalAdmins = seenAdminUids.size;
    } catch (err: any) {
      console.error('Error fetching users collection for stats:', err?.message || err);
      // Re-throw so dashboard loading/error state displays properly instead of silently showing false data
      throw err;
    }

    // 2. Fetch Quizzes stats with document ID deduplication
    let totalQuizzes = 0;
    try {
      const quizzesSnap = await getDocs(collection(db, 'quizzes'));
      const uniqueQuizIds = new Set<string>();
      quizzesSnap.forEach((qDoc) => {
        if (qDoc.id && qDoc.id.trim()) {
          uniqueQuizIds.add(qDoc.id.trim());
        }
      });
      totalQuizzes = uniqueQuizIds.size;
    } catch (err: any) {
      console.warn('Notice fetching quizzes collection for stats:', err?.message || err);
    }

    // 3. Compute curriculum counts dynamically from local curriculum data
    // These reflect the bundled course content, not Firestore documents.
    // getChaptersBySubject returns *lesson-level* entries (444 total).
    // Each lesson entry has a chapterId — the unique chapterId values give us chapter count (178).
    const GRADES = ['6', '7', '8', '9', '10'];
    const ACTIVE_SUBJECTS = ['maths', 'physics', 'chemistry', 'biology', 'history', 'geography'];
    const totalSubjects = ACTIVE_SUBJECTS.length; // 6
    const uniqueChapterIds = new Set<string>();
    let computedLessons = 0;
    GRADES.forEach(grade => {
      ACTIVE_SUBJECTS.forEach(subj => {
        const lessons = getChaptersBySubject(subj, grade);
        computedLessons += lessons.length;
        lessons.forEach(l => {
          if (l.chapterId) uniqueChapterIds.add(l.chapterId);
          else uniqueChapterIds.add(l.id); // fallback: lesson is its own chapter
        });
      });
    });
    const totalChapters = uniqueChapterIds.size;
    const totalLessons = computedLessons;

    const totalCurriculumItems = totalSubjects + totalChapters + totalLessons;

    return {
      totalStudents,
      totalAdmins,
      totalSubjects,
      totalChapters,
      totalLessons,
      totalQuizzes,
      totalCurriculumItems,
    };
  } catch (error: any) {
    console.error('Error fetching admin statistics from Firestore:', error);
    throw error;
  }
}

export async function fetchStudents(): Promise<StudentUser[]> {
  try {
    const usersSnap = await getDocs(collection(db, 'users'));
    const studentMap = new Map<string, StudentUser>();

    usersSnap.forEach((docSnap) => {
      const uid = docSnap.id;
      const data = docSnap.data();

      // Only include valid registered student accounts
      if (!isRegisteredStudent(uid, data)) return;

      const email = data.email.trim();
      const displayName = data.displayName || data.name || email.split('@')[0] || 'Student';
      const rawClass = data.studentClass || data.grade || '8';
      const studentClass = rawClass.toString().replace(/^(class_?)/i, '');

      studentMap.set(uid, {
        uid,
        email,
        displayName,
        studentClass,
        role: 'student',
        createdAt: typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
        lastLogin: typeof data.lastLogin === 'number' ? data.lastLogin : Date.now(),
        stats: {
          xp: data.stats?.xp ?? data.xp ?? 0,
          streak: data.stats?.streak ?? data.streak ?? 0,
          level: data.stats?.level ?? data.level ?? 1,
          badges: Array.isArray(data.stats?.badges) ? data.stats.badges : (Array.isArray(data.badges) ? data.badges : [])
        },
        completedLessons: Array.isArray(data.completedLessons) ? data.completedLessons : []
      });
    });

    return Array.from(studentMap.values());
  } catch (err: any) {
    console.error('Error fetching students from Firestore:', err);
    throw err;
  }
}

export function subscribeToStudents(
  onUpdate: (students: StudentUser[]) => void,
  onError: (error: Error) => void
): () => void {
  const usersRef = collection(db, 'users');
  
  const unsubscribe = onSnapshot(usersRef, (usersSnap) => {
    const studentMap = new Map<string, StudentUser>();
    usersSnap.forEach((docSnap) => {
      const uid = docSnap.id;
      const data = docSnap.data();

      // Only include valid registered student accounts
      if (!isRegisteredStudent(uid, data)) return;

      const email = data.email.trim();
      const displayName = data.displayName || data.name || email.split('@')[0] || 'Student';
      const rawClass = data.studentClass || data.grade || '8';
      const studentClass = rawClass.toString().replace(/^(class_?)/i, '');

      studentMap.set(uid, {
        uid,
        email,
        displayName,
        studentClass,
        role: 'student',
        createdAt: typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
        lastLogin: typeof data.lastLogin === 'number' ? data.lastLogin : Date.now(),
        stats: {
          xp: data.stats?.xp ?? data.xp ?? 0,
          streak: data.stats?.streak ?? data.streak ?? 0,
          level: data.stats?.level ?? data.level ?? 1,
          badges: Array.isArray(data.stats?.badges) ? data.stats.badges : (Array.isArray(data.badges) ? data.badges : [])
        },
        completedLessons: Array.isArray(data.completedLessons) ? data.completedLessons : []
      });
    });
    onUpdate(Array.from(studentMap.values()));
  }, (err) => {
    console.error('Error in students subscription:', err);
    onError(err);
  });

  return unsubscribe;
}

export async function updateUserRoleInBackend(targetUid: string, newRole: UserRole): Promise<{ message: string }> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('Unauthenticated caller.');
  }

  const idToken = await currentUser.getIdToken();
  const response = await fetch(`/api/admin/users/${targetUid}/role`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
    body: JSON.stringify({ role: newRole })
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.error || 'Failed to update user role.');
  }

  return body;
}

export async function fetchAnalyticsData(): Promise<AdminAnalyticsMetrics> {
  const students = await fetchStudents();

  const gradeDistribution: Record<string, number> = { '6': 0, '7': 0, '8': 0, '9': 0, '10': 0 };
  let totalXP = 0;
  let totalCompletedLessons = 0;

  students.forEach((s) => {
    const g = (s.studentClass || '8').toString().replace(/^(class_?)/i, '');
    if (gradeDistribution[g] !== undefined) {
      gradeDistribution[g]++;
    } else {
      gradeDistribution[g] = 1;
    }
    totalXP += s.stats.xp;
    totalCompletedLessons += (s.completedLessons?.length || 0);
  });

  // Compute subject lesson distribution dynamically from local curriculum data
  const DIST_GRADES = ['6', '7', '8', '9', '10'];
  const SUBJECT_MAP: Record<string, string> = {
    'maths': 'Mathematics',
    'physics': 'Physics',
    'chemistry': 'Chemistry',
    'biology': 'Biology',
    'history': 'History & Civics',
    'geography': 'Geography & Economics'
  };
  const subjectDistribution: Record<string, number> = {};
  Object.values(SUBJECT_MAP).forEach(name => { subjectDistribution[name] = 0; });
  DIST_GRADES.forEach(grade => {
    Object.entries(SUBJECT_MAP).forEach(([subjId, subjName]) => {
      const chapters = getChaptersBySubject(subjId, grade);
      subjectDistribution[subjName] += chapters.length;
    });
  });

  const averageXP = students.length > 0 ? Math.round(totalXP / students.length) : 0;
  const activeGradesCount = Object.keys(gradeDistribution).filter(g => gradeDistribution[g] > 0).length;

  return {
    gradeDistribution,
    subjectDistribution,
    totalCompletedLessons,
    averageXP,
    activeGradesCount
  };
}

export function validateCurriculumContent(): ValidationReport {
  const GRADES = ['6', '7', '8', '9', '10'];
  const ACTIVE_SUBJECTS = ['maths', 'physics', 'chemistry', 'biology', 'history', 'geography'];

  const MANDATORY_SECTIONS = [
    '1. Learning Objectives',
    '2. Introduction',
    '3. Detailed Concept Explanation',
    '4. Important Definitions',
    '5. Key Concepts',
    '6. Examples',
    '7. Step-by-Step Explanation',
    '8. Formulas / Rules',
    '9. Worked Problems',
    '10. Try Yourself',
    '11. Common Mistakes',
    '12. Quick Revision'
  ];

  const seenLessonIds = new Set<string>();
  const seenChapterIds = new Set<string>();
  const warnings: string[] = [];
  const errors: string[] = [];

  let totalChapters = 0;
  let totalLessons = 0;
  let noEmptyLessons = true;
  let all13SectionsPresent = true;
  let validGradeMapping = true;
  let validSubjectMapping = true;

  GRADES.forEach(grade => {
    ACTIVE_SUBJECTS.forEach(subj => {
      const chapters = getChaptersBySubject(subj, grade);
      totalChapters += chapters.length;

      chapters.forEach(ch => {
        totalLessons++;

        if (seenLessonIds.has(ch.id)) {
          errors.push(`Duplicate Lesson ID detected: "${ch.id}"`);
        }
        seenLessonIds.add(ch.id);

        if (ch.chapterId) {
          seenChapterIds.add(ch.chapterId);
        }

        if (ch.grade !== grade) {
          validGradeMapping = false;
          errors.push(`Grade mismatch for chapter "${ch.id}": Expected "${grade}", got "${ch.grade}"`);
        }

        if (ch.subjectId !== subj) {
          validSubjectMapping = false;
          errors.push(`Subject mismatch for chapter "${ch.id}": Expected "${subj}", got "${ch.subjectId}"`);
        }

        const lesson = getLessonById(ch.id, grade);
        if (!lesson || !lesson.content || lesson.content.trim().length === 0) {
          noEmptyLessons = false;
          errors.push(`Empty lesson content detected at ID "${ch.id}"`);
        } else {
          MANDATORY_SECTIONS.forEach(sec => {
            if (!lesson.content.includes(sec)) {
              all13SectionsPresent = false;
              warnings.push(`Lesson "${ch.id}" missing section heading: "${sec}"`);
            }
          });
        }
      });
    });
  });

  const passed = errors.length === 0;
  // seenLessonIds = all 444 lesson entries; seenChapterIds = 178 unique parent chapters

  return {
    passed,
    totalChapters: seenChapterIds.size,   // 178 unique parent chapter IDs
    totalLessons: seenLessonIds.size,     // 444 leaf lesson entries
    uniqueChapterIdsCount: seenChapterIds.size,
    uniqueLessonIdsCount: seenLessonIds.size,
    validGradeMapping,
    validSubjectMapping,
    noEmptyLessons,
    all13SectionsPresent,
    warnings,
    errors
  };
}

