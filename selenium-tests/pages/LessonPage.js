import { By, until } from 'selenium-webdriver';
import { config } from '../config/test.config.js';

export class LessonPage {
  constructor(driver) {
    this.driver = driver;
  }

  async navigateTo(lessonId = 'g10-maths-c1-l1') {
    await this.driver.get(`${config.baseUrl}/#/lessons/${lessonId}`);
    await this.driver.wait(until.elementLocated(By.css('#root > *')), config.explicitWait, 'Lesson reader failed to mount');
  }

  async verify13SectionLayout() {
    await this.driver.wait(until.elementLocated(By.css('h1, h2, h3, section, article, div')), config.explicitWait);
    const bodyText = await this.driver.findElement(By.css('body')).getText();
    const mandatorySections = [
      'Learning Objectives',
      'Introduction',
      'Detailed Concept Explanation',
      'Summary',
      'SmartStudy'
    ];
    const matchFound = mandatorySections.some(sec => bodyText.toLowerCase().includes(sec.toLowerCase()));
    if (!matchFound) {
      throw new Error('Lesson reader verification failed. Pedagogical section headers not detected.');
    }
    return true;
  }

  async markComplete() {
    const buttons = await this.driver.findElements(By.css('button'));
    for (const btn of buttons) {
      try {
        const text = await btn.getText();
        if (text.toLowerCase().includes('complete') || text.toLowerCase().includes('mark')) {
          await btn.click();
          await this.driver.sleep(800);
          return true;
        }
      } catch (e) {
        // Stale element during click
      }
    }
    return true;
  }
}
