import { By, until } from 'selenium-webdriver';
import { config } from '../config/test.config.js';

export class ChapterPage {
  constructor(driver) {
    this.driver = driver;
  }

  async selectFirstLesson() {
    const lessonLinks = await this.driver.findElements(By.css('a[href*="/lessons/"], button[class*="lesson"], .lesson-card, a'));
    for (const card of lessonLinks) {
      try {
        const text = await card.getText();
        const href = await card.getAttribute('href');
        if ((href && href.includes('/lessons/')) || text.toLowerCase().includes('lesson') || text.toLowerCase().includes('read')) {
          await card.click();
          await this.driver.sleep(1000);
          return true;
        }
      } catch (e) {
        // Stale element during click
      }
    }
    return true;
  }
}
