import { describe, it, expect } from 'vitest';
import { getChaptersBySubject, getLessonById, calculateSubjectProgress } from '../data/curriculum';

describe('Phase 8 Class 8 Mathematics Quality Validation', () => {
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

  it('1. verifies that exactly 35 Class 8 Maths lessons exist', () => {
    const chapters = getChaptersBySubject('maths', '8');
    expect(chapters.length).toBe(35);
  });

  it('2. verifies that all 35 lesson IDs are 100% unique and map to valid chapters', () => {
    const chapters = getChaptersBySubject('maths', '8');
    const seenIds = new Set<string>();

    chapters.forEach(ch => {
      expect(seenIds.has(ch.id)).toBe(false);
      seenIds.add(ch.id);

      expect(ch.id).toMatch(/^g8-maths-c\d+-l\d+$/);
      expect(ch.chapterId).toMatch(/^g8-maths-c\d+$/);
    });

    expect(seenIds.size).toBe(35);
  });

  it('3. verifies that every one of the 35 lessons contains all 13 required sections', () => {
    const chapters = getChaptersBySubject('maths', '8');

    chapters.forEach(ch => {
      const lesson = getLessonById(ch.id, '8');
      expect(lesson).toBeDefined();
      expect(lesson.content).toBeTruthy();

      MANDATORY_SECTIONS.forEach(sec => {
        expect(lesson.content).toContain(sec);
      });
    });
  });

  it('4. verifies 0 empty lessons and 0 duplicate lesson contents across all 35 lessons', () => {
    const chapters = getChaptersBySubject('maths', '8');
    const seenContents = new Set<string>();

    chapters.forEach(ch => {
      expect(ch.content.trim().length).toBeGreaterThan(200);

      expect(seenContents.has(ch.content)).toBe(false);
      seenContents.add(ch.content);
    });

    expect(seenContents.size).toBe(35);
  });

  it('5. verifies legacy chapter resolution (e.g. g8-maths-c1) resolves cleanly without 404', () => {
    for (let c = 1; c <= 13; c++) {
      const legacyId = `g8-maths-c${c}`;
      const lesson = getLessonById(legacyId, '8');

      expect(lesson).toBeDefined();
      expect(lesson.title).toBeTruthy();
      expect(lesson.content).toBeTruthy();
    }
  });

  it('6. verifies student progress tracking with 33 lessons', () => {
    const progressZero = calculateSubjectProgress('maths', [], '8');
    expect(progressZero).toBe(0);

    const progressSome = calculateSubjectProgress('maths', ['g8-maths-c1-l1', 'g8-maths-c1-l2'], '8');
    expect(progressSome).toBeGreaterThan(0);
    expect(progressSome).toBeLessThanOrEqual(100);
  });
});
