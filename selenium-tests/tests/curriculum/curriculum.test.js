import { SubjectPage } from '../../pages/SubjectPage.js';
import { ChapterPage } from '../../pages/ChapterPage.js';

export async function runCurriculumTests(driver) {
  const subj = new SubjectPage(driver);
  await subj.verifySubjectViewLoaded();
  const ch = new ChapterPage(driver);
  await ch.selectFirstLesson();
}
