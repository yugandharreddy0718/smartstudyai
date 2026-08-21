import { By } from 'selenium-webdriver';

export class ChapterPage {
  constructor(driver) {
    this.driver = driver;
  }

  async selectFirstLesson() {
    const lessonCards = await this.driver.findElements(By.css('.lesson-card, button, a, div'));
    for (const card of lessonCards) {
      const text = await card.getText();
      if (text.toLowerCase().includes('lesson') || text.toLowerCase().includes('read') || text.toLowerCase().includes('chapter')) {
        await card.click();
        await this.driver.sleep(1000);
        return true;
      }
    }
    return false;
  }
}
