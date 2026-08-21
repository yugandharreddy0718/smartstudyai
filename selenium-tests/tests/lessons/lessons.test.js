import { LessonPage } from '../../pages/LessonPage.js';

export async function runLessonTests(driver) {
  const lesson = new LessonPage(driver);
  await lesson.verify13SectionLayout();
  await lesson.markComplete();
}
