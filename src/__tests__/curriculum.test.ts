import { describe, it, expect } from 'vitest';
import { getChaptersBySubject, calculateSubjectProgress, checkLessonLock } from '../data/curriculum';
import { TEXTBOOK_MATHS_G6 } from '../data/textbookData';

describe('Curriculum Data Unit Tests', () => {
  it('retrieves chapters by subject and grade', () => {
    const chaptersGrade8 = getChaptersBySubject('maths', '8');
    expect(Array.isArray(chaptersGrade8)).toBe(true);
    expect(chaptersGrade8.length).toBeGreaterThan(0);
    expect(chaptersGrade8[0]).toHaveProperty('title');
  });

  it('calculates subject progress correctly', () => {
    const chapters = getChaptersBySubject('maths', '8');
    const firstChapterId = chapters[0]?.id;
    const progressZero = calculateSubjectProgress('maths', [], '8');
    expect(progressZero).toBe(0);

    if (firstChapterId) {
      const progressSome = calculateSubjectProgress('maths', [firstChapterId], '8');
      expect(progressSome).toBeGreaterThan(0);
    }
  });

  it('checks lesson lock status properly', () => {
    const lockFirst = checkLessonLock('maths', 0, [], '8');
    expect(lockFirst.isLocked).toBe(false);
  });

  it('fetches textbook data for valid lesson ID from TEXTBOOK_MATHS_G6', () => {
    const data = TEXTBOOK_MATHS_G6['g6-maths-c1'];
    expect(data).toBeDefined();
    if (data) {
      expect(data).toHaveProperty('chapterNumber');
      expect(data.sections.length).toBeGreaterThan(0);
    }
  });
});
