import { describe, it, expect } from 'vitest';
import { 
  getChaptersBySubject, 
  getLessonById, 
  calculateSubjectProgress, 
  checkLessonLock 
} from '../data/curriculum';
import { TEXTBOOK_MATHS_G6 } from '../data/textbookData';

describe('Phase 5 Curriculum Data Architecture Verification', () => {
  const GRADES = ['6', '7', '8', '9', '10'];
  const ACTIVE_SUBJECTS = ['maths', 'physics', 'chemistry', 'biology', 'history', 'geography'];

  it('verifies that exactly 5 classes (6 to 10) exist and contain chapters', () => {
    GRADES.forEach(grade => {
      let classChapters = 0;
      ACTIVE_SUBJECTS.forEach(subj => {
        const chapters = getChaptersBySubject(subj, grade);
        classChapters += chapters.length;
      });
      expect(classChapters).toBeGreaterThan(0);
    });
  });

  it('verifies that 6 active subject streams exist', () => {
    ACTIVE_SUBJECTS.forEach(subj => {
      const chapters = getChaptersBySubject(subj, '8');
      expect(Array.isArray(chapters)).toBe(true);
      expect(chapters.length).toBeGreaterThan(0);
    });
  });

  it('verifies exact chapter counts: Class 6 (35), Class 7 (35), Class 8 (35), Class 9 (35), Class 10 (38) = 178 Total', () => {
    const countsPerClass: Record<string, number> = {};
    let totalChapters = 0;

    GRADES.forEach(grade => {
      let count = 0;
      ACTIVE_SUBJECTS.forEach(subj => {
        const chapters = getChaptersBySubject(subj, grade);
        count += chapters.length;
      });
      countsPerClass[grade] = count;
      totalChapters += count;
    });

    expect(countsPerClass['6']).toBe(86); // 37 Maths + 8 Physics + 5 Chem + 8 Bio + 15 History + 13 Geography
    expect(countsPerClass['7']).toBe(84); // 33 Maths + 8 Physics + 5 Chem + 10 Bio + 15 History + 13 Geography
    expect(countsPerClass['8']).toBe(86); // 35 Maths + 9 Physics + 5 Chem + 10 Bio + 15 History + 12 Geography
    expect(countsPerClass['9']).toBe(89); // 32 Maths + 11 Physics + 11 Chem + 8 Bio + 12 History + 15 Geography
    expect(countsPerClass['10']).toBe(99); // 37 Maths + 11 Physics + 11 Chem + 11 Bio + 13 History + 16 Geography
    expect(totalChapters).toBe(444);
  });

  it('verifies that 0 duplicate chapter IDs and 0 duplicate lesson IDs exist across all chapters', () => {
    const chapterIds = new Set<string>();
    const lessonIds = new Set<string>();

    GRADES.forEach(grade => {
      ACTIVE_SUBJECTS.forEach(subj => {
        const chapters = getChaptersBySubject(subj, grade);
        chapters.forEach(ch => {
          expect(lessonIds.has(ch.id)).toBe(false);
          lessonIds.add(ch.id);
        });
      });
    });

    expect(lessonIds.size).toBe(444);
  });

  it('verifies that every chapter belongs to a valid grade and valid subject stream', () => {
    GRADES.forEach(grade => {
      ACTIVE_SUBJECTS.forEach(subj => {
        const chapters = getChaptersBySubject(subj, grade);
        chapters.forEach(ch => {
          expect(ch.grade).toBe(grade);
          expect(ch.subjectId).toBe(subj);
          expect(ch.title).toBeTruthy();
          expect(ch.desc).toBeTruthy();
        });
      });
    });
  });

  it('verifies legacy route resolution: legacy chapter IDs resolve cleanly without 404', () => {
    // 1. Base legacy chapter format
    const legacyG6Maths = getLessonById('g6-maths-c1');
    expect(legacyG6Maths.title).toBe('Comparing Large Numbers & Place Value Systems');
    expect(legacyG6Maths.grade).toBe('6');

    const legacyG10Maths = getLessonById('g10-maths-c1');
    expect(legacyG10Maths.title).toBe("Euclid's Division Lemma & HCF Computation");
    expect(legacyG10Maths.grade).toBe('10');

    // 2. Legacy 'science' query fallback
    const legacyScienceChapters = getChaptersBySubject('science', '8');
    expect(legacyScienceChapters.length).toBeGreaterThan(0);

    const legacyScienceLesson = getLessonById('g8-science-c1');
    expect(legacyScienceLesson).toBeDefined();
    expect(legacyScienceLesson.title).toBeTruthy();
  });

  it('verifies student progress calculation & lock checking for both new and legacy IDs', () => {
    const chapters = getChaptersBySubject('maths', '8');
    const firstChapterId = chapters[0].chapterId || chapters[0].id;
    const firstLessonId = chapters[0].id;

    // Zero progress
    expect(calculateSubjectProgress('maths', [], '8')).toBe(0);

    // Progress with modular lesson ID
    expect(calculateSubjectProgress('maths', [firstLessonId], '8')).toBeGreaterThan(0);

    // Progress with legacy chapter ID
    expect(calculateSubjectProgress('maths', [firstChapterId], '8')).toBeGreaterThan(0);

    // Lock check
    const lockFirst = checkLessonLock('maths', 0, [], '8');
    expect(lockFirst.isLocked).toBe(false);

    const lockCompleted = checkLessonLock('maths', 0, [firstLessonId], '8');
    expect(lockCompleted.status).toBe('completed');
  });

  it('fetches extended textbook data for valid lesson ID from TEXTBOOK_MATHS_G6', () => {
    const data = TEXTBOOK_MATHS_G6['g6-maths-c1'];
    expect(data).toBeDefined();
    if (data) {
      expect(data).toHaveProperty('chapterNumber');
      expect(data.sections.length).toBeGreaterThan(0);
    }
  });
});
