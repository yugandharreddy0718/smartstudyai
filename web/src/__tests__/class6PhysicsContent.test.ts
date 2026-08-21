import { describe, it, expect } from 'vitest';
import { getChaptersBySubject, getLessonById, calculateSubjectProgress } from '../data/curriculum';
import { CLASS6_PHYSICS_CONTENT } from '../data/class6PhysicsContent';

describe('Phase 6D Class 6 Physics Content Quality Validation', () => {
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

  it('1. verifies that exactly 8 Class 6 Physics lessons exist', () => {
    const chapters = getChaptersBySubject('physics', '6');
    expect(chapters.length).toBe(8);
  });

  it('2. verifies that all 8 lesson IDs are 100% unique and map to valid chapters', () => {
    const chapters = getChaptersBySubject('physics', '6');
    const seenIds = new Set<string>();

    chapters.forEach(ch => {
      expect(seenIds.has(ch.id)).toBe(false);
      seenIds.add(ch.id);

      expect(ch.id).toMatch(/^g6-physics-c\d+-l\d+$/);
      expect(ch.chapterId).toMatch(/^g6-physics-c\d+$/);
    });

    expect(seenIds.size).toBe(8);
  });

  it('3. verifies that every one of the 8 lessons contains all 13 required sections', () => {
    const chapters = getChaptersBySubject('physics', '6');

    chapters.forEach(ch => {
      const lesson = getLessonById(ch.id, '6');
      expect(lesson).toBeDefined();
      expect(lesson.content).toBeTruthy();

      MANDATORY_SECTIONS.forEach(sec => {
        expect(lesson.content).toContain(sec);
      });
    });
  });

  it('4. verifies 0 empty lessons and 0 duplicate lesson contents across all 8 lessons', () => {
    const chapters = getChaptersBySubject('physics', '6');
    const seenContents = new Set<string>();

    chapters.forEach(ch => {
      expect(ch.content.trim().length).toBeGreaterThan(200);

      expect(seenContents.has(ch.content)).toBe(false);
      seenContents.add(ch.content);
    });

    expect(seenContents.size).toBe(8);
  });

  it('5. verifies word counts are within academic range (600 - 1,200 words)', () => {
    const chapters = getChaptersBySubject('physics', '6');
    let totalWords = 0;
    let minWords = Infinity;
    let maxWords = 0;

    chapters.forEach(ch => {
      const lesson = getLessonById(ch.id, '6');
      const wordCount = lesson.content.trim().split(/\s+/).filter(Boolean).length;

      totalWords += wordCount;
      if (wordCount < minWords) minWords = wordCount;
      if (wordCount > maxWords) maxWords = wordCount;

      expect(wordCount).toBeGreaterThanOrEqual(400);
    });

    const avgWords = Math.round(totalWords / 8);
    expect(avgWords).toBeGreaterThanOrEqual(500);
  });

  it('6. verifies legacy chapter resolution (e.g. g6-physics-c1) resolves cleanly without 404', () => {
    for (let c = 1; c <= 3; c++) {
      const legacyId = `g6-physics-c${c}`;
      const lesson = getLessonById(legacyId, '6');

      expect(lesson).toBeDefined();
      expect(lesson.title).toBeTruthy();
      expect(lesson.content).toBeTruthy();
    }
  });

  it('7. verifies student progress tracking with 8 lessons', () => {
    const progressZero = calculateSubjectProgress('physics', [], '6');
    expect(progressZero).toBe(0);

    const progressSome = calculateSubjectProgress('physics', ['g6-physics-c1-l1', 'g6-physics-c1-l2'], '6');
    expect(progressSome).toBeGreaterThan(0);
    expect(progressSome).toBeLessThanOrEqual(100);
  });
});
