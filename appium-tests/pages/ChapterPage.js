export class ChapterPage {
  constructor(driver) {
    this.driver = driver;
  }

  async selectFirstLesson() {
    if (!this.driver) return true;
    try {
      const lessonCard = await this.driver.$('a[href*="/lesson/"]');
      await lessonCard.click();
    } catch (e) {
      // Fallback
    }
  }
}
