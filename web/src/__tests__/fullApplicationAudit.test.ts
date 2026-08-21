import { describe, it, expect } from 'vitest';
import {
  getChaptersBySubject,
  getLessonById,
  calculateSubjectProgress
} from '../data/curriculum';

const GRADES = ['6', '7', '8', '9', '10'];
const ACTIVE_SUBJECTS = ['maths', 'physics', 'chemistry', 'biology', 'history', 'geography'];

describe('SMARTSTUDY AI — PHASE 11: FULL APPLICATION AUDIT', () => {
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

  it('1. Programmatically verifies exact lesson counts across all 5 classes (Classes 6–10)', () => {
    const countsPerClass: Record<string, number> = { '6': 0, '7': 0, '8': 0, '9': 0, '10': 0 };

    GRADES.forEach(grade => {
      ACTIVE_SUBJECTS.forEach(subj => {
        const chapters = getChaptersBySubject(subj, grade);
        countsPerClass[grade] += chapters.length;
      });
    });

    expect(countsPerClass['6']).toBe(86);
    expect(countsPerClass['7']).toBe(84);
    expect(countsPerClass['8']).toBe(86);
    expect(countsPerClass['9']).toBe(89);
    expect(countsPerClass['10']).toBe(99);

    const totalLessons = Object.values(countsPerClass).reduce((a, b) => a + b, 0);
    expect(totalLessons).toBe(444);
  });

  it('2. Programmatically verifies all 444 lessons are unique and contain all 13 required sections', () => {
    const seenLessonIds = new Set<string>();
    const seenContents = new Set<string>();

    GRADES.forEach(grade => {
      ACTIVE_SUBJECTS.forEach(subj => {
        const chapters = getChaptersBySubject(subj, grade);
        chapters.forEach(ch => {
          expect(seenLessonIds.has(ch.id)).toBe(false);
          seenLessonIds.add(ch.id);

          const lesson = getLessonById(ch.id, grade);
          expect(lesson).toBeDefined();
          expect(lesson.content.trim().length).toBeGreaterThan(200);

          if (seenContents.has(lesson.content)) {
            console.log(`Duplicate content found at ID: ${ch.id}, title: ${lesson.title}`);
          }
          expect(seenContents.has(lesson.content)).toBe(false);
          seenContents.add(lesson.content);

          MANDATORY_SECTIONS.forEach(sec => {
            expect(lesson.content).toContain(sec);
          });
        });
      });
    });

    expect(seenLessonIds.size).toBe(444);
    expect(seenContents.size).toBe(444);
  });

  it('3. Verifies representative lesson resolution across all 30 Grade x Subject streams (5 Grades x 6 Subjects)', () => {
    GRADES.forEach(grade => {
      ACTIVE_SUBJECTS.forEach(subj => {
        const chapters = getChaptersBySubject(subj, grade);
        expect(chapters.length).toBeGreaterThan(0);

        const firstLesson = getLessonById(chapters[0].id, grade);
        expect(firstLesson).toBeDefined();
        expect(firstLesson.title).toBeTruthy();
        expect(firstLesson.content).toBeTruthy();
        expect(firstLesson.grade).toBe(grade);
        expect(firstLesson.subjectId).toBe(subj);
      });
    });
  });

  it('4. Verifies lesson progress isolation (completing g10-maths-c1-l1 does NOT mark g10-maths-c1-l2)', () => {
    const progressL1Only = calculateSubjectProgress('maths', ['g10-maths-c1-l1'], '10');
    const progressL1andL2 = calculateSubjectProgress('maths', ['g10-maths-c1-l1', 'g10-maths-c1-l2'], '10');

    expect(progressL1Only).toBeGreaterThan(0);
    expect(progressL1andL2).toBeGreaterThan(progressL1Only);
  });

  it('5. Verifies legacy chapter route resolution for all 5 classes without 404', () => {
    const legacyTestCases = [
      { id: 'g6-maths-c1', grade: '6' },
      { id: 'g7-maths-c1', grade: '7' },
      { id: 'g8-maths-c1', grade: '8' },
      { id: 'g9-maths-c1', grade: '9' },
      { id: 'g10-maths-c1', grade: '10' },
      { id: 'g6-physics-c1', grade: '6' },
      { id: 'g7-physics-c1', grade: '7' },
      { id: 'g8-physics-c1', grade: '8' },
      { id: 'g9-physics-c1', grade: '9' },
      { id: 'g10-physics-c1', grade: '10' }
    ];

    legacyTestCases.forEach(tc => {
      const lesson = getLessonById(tc.id, tc.grade);
      expect(lesson).toBeDefined();
      expect(lesson.title).toBeTruthy();
      expect(lesson.content).toBeTruthy();
    });
  });

  it('6. Verifies grade switching returns distinct grade-specific chapter lists', () => {
    const g6Maths = getChaptersBySubject('maths', '6');
    const g7Maths = getChaptersBySubject('maths', '7');
    const g8Maths = getChaptersBySubject('maths', '8');
    const g9Maths = getChaptersBySubject('maths', '9');
    const g10Maths = getChaptersBySubject('maths', '10');

    expect(g6Maths[0].id).toMatch(/^g6-maths/);
    expect(g7Maths[0].id).toMatch(/^g7-maths/);
    expect(g8Maths[0].id).toMatch(/^g8-maths/);
    expect(g9Maths[0].id).toMatch(/^g9-maths/);
    expect(g10Maths[0].id).toMatch(/^g10-maths/);

    expect(g6Maths[0].id).not.toBe(g7Maths[0].id);
    expect(g9Maths[0].id).not.toBe(g10Maths[0].id);
  });
});
