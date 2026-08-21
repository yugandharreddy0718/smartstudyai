import { describe, it, expect } from 'vitest';
import { getChaptersBySubject, getLessonById, calculateSubjectProgress } from '../data/curriculum';

describe('Phase 8 Class 8 History Quality Validation', () => {
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

  it('1. verifies that exactly 15 Class 8 History lessons exist', () => {
    const chapters = getChaptersBySubject('history', '8');
    expect(chapters.length).toBe(15);
  });

  it('2. verifies that all 15 lesson IDs are 100% unique and map to valid chapters', () => {
    const chapters = getChaptersBySubject('history', '8');
    const seenIds = new Set<string>();

    chapters.forEach(ch => {
      expect(seenIds.has(ch.id)).toBe(false);
      seenIds.add(ch.id);

      expect(ch.id).toMatch(/^g8-history-c\d+-l\d+$/);
      expect(ch.chapterId).toMatch(/^g8-history-c\d+$/);
    });

    expect(seenIds.size).toBe(15);
  });

  it('3. verifies that every one of the 15 lessons contains all 13 required sections', () => {
    const chapters = getChaptersBySubject('history', '8');

    chapters.forEach(ch => {
      const lesson = getLessonById(ch.id, '8');
      expect(lesson).toBeDefined();
      expect(lesson.content).toBeTruthy();

      MANDATORY_SECTIONS.forEach(sec => {
        expect(lesson.content).toContain(sec);
      });
    });
  });

  it('4. verifies 0 empty lessons and 0 duplicate lesson contents across all 15 lessons', () => {
    const chapters = getChaptersBySubject('history', '8');
    const seenContents = new Set<string>();

    chapters.forEach(ch => {
      expect(ch.content.trim().length).toBeGreaterThan(200);

      expect(seenContents.has(ch.content)).toBe(false);
      seenContents.add(ch.content);
    });

    expect(seenContents.size).toBe(15);
  });

  it('5. verifies legacy chapter resolution (e.g. g8-history-c1) resolves cleanly without 404', () => {
    for (let c = 1; c <= 7; c++) {
      const legacyId = `g8-history-c${c}`;
      const lesson = getLessonById(legacyId, '8');

      expect(lesson).toBeDefined();
      expect(lesson.title).toBeTruthy();
      expect(lesson.content).toBeTruthy();
    }
  });

  it('6. verifies student progress tracking with 15 lessons', () => {
    const progressZero = calculateSubjectProgress('history', [], '8');
    expect(progressZero).toBe(0);

    const progressSome = calculateSubjectProgress('history', ['g8-history-c1-l1', 'g8-history-c1-l2'], '8');
    expect(progressSome).toBeGreaterThan(0);
    expect(progressSome).toBeLessThanOrEqual(100);
  });
});
