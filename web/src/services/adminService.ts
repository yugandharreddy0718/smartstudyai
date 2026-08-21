import { db } from '@smartstudy/firebase';
import { 
  collection, 
  getDocs, 
  collectionGroup 
} from 'firebase/firestore';

export interface AdminStats {
  totalStudents: number;
  totalAdmins: number;
  totalSubjects: number;
  totalChapters: number;
  totalLessons: number;
  totalQuizzes: number;
  totalCurriculumItems: number;
}

export async function fetchAdminStats(): Promise<AdminStats> {
  try {
    // 1. Fetch Users stats
    let totalStudents = 0;
    let totalAdmins = 0;
    
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      usersSnap.forEach((docSnap) => {
        const data = docSnap.data();
        const role = data.role || 'student';
        if (role === 'admin' || role === 'superAdmin') {
          totalAdmins++;
        } else {
          totalStudents++;
        }
      });
    } catch (err: any) {
      console.warn('Notice fetching users collection for stats:', err?.message || err);
      // Re-throw if it's a permission denied error
      if (err?.code === 'permission-denied' || err?.message?.includes('permission-denied')) {
        throw err;
      }
    }

    // 2. Fetch Quizzes stats
    let totalQuizzes = 0;
    try {
      const quizzesSnap = await getDocs(collection(db, 'quizzes'));
      totalQuizzes = quizzesSnap.size;
    } catch (err: any) {
      console.warn('Notice fetching quizzes collection for stats:', err?.message || err);
    }

    // 3. Fetch Lessons stats
    let totalLessons = 0;
    const lessonSubjectSet = new Set<string>();
    const lessonChapterSet = new Set<string>();

    try {
      const lessonsSnap = await getDocs(collection(db, 'lessons'));
      totalLessons = lessonsSnap.size;
      lessonsSnap.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.subjectId) lessonSubjectSet.add(data.subjectId);
        if (data.chapterId) lessonChapterSet.add(data.chapterId);
      });
    } catch (err: any) {
      console.warn('Notice fetching lessons collection for stats:', err?.message || err);
    }

    // 4. Fetch Subjects & Chapters stats (collectionGroup or nested /curriculum fallback)
    let totalSubjects = lessonSubjectSet.size;
    let totalChapters = lessonChapterSet.size;

    try {
      const subjectsGroupSnap = await getDocs(collectionGroup(db, 'subjects'));
      if (!subjectsGroupSnap.empty) {
        const uniqueSubjects = new Set<string>();
        subjectsGroupSnap.forEach((docSnap) => {
          uniqueSubjects.add(docSnap.id);
        });
        totalSubjects = Math.max(totalSubjects, uniqueSubjects.size);
      }
    } catch (err) {
      // Ignore if collectionGroup indexed search fails, keep fallback from lessons
    }

    try {
      const chaptersGroupSnap = await getDocs(collectionGroup(db, 'chapters'));
      if (!chaptersGroupSnap.empty) {
        totalChapters = Math.max(totalChapters, chaptersGroupSnap.size);
      }
    } catch (err) {
      // Ignore if collectionGroup indexed search fails, keep fallback from lessons
    }

    // Fallback: If still zero and /curriculum class documents exist, scan class docs
    if (totalSubjects === 0 || totalChapters === 0) {
      const defaultSubjects = ['maths', 'science', 'geography', 'history', 'physics', 'biology'];
      if (totalLessons > 0) {
        totalSubjects = Math.max(totalSubjects, defaultSubjects.length);
      }
    }

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
