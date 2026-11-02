import { By, until } from 'selenium-webdriver';
import { config } from '../config/test.config.js';

export class SubjectPage {
  constructor(driver) {
    this.driver = driver;
  }

  async navigateTo() {
    await this.driver.get(`${config.baseUrl}/#/subjects`);
    await this.driver.wait(until.elementLocated(By.css('#root > *')), config.explicitWait, 'Subject catalog failed to mount');
  }

  async verifySubjectViewLoaded() {
    await this.navigateTo();
    await this.driver.wait(until.elementLocated(By.css('h1, h2, a[href*="subjects"], [class*="rounded"]')), config.explicitWait);
    const bodyText = await this.driver.findElement(By.css('body')).getText();
    const isSubject = bodyText.toLowerCase().includes('chapter') || 
                      bodyText.toLowerCase().includes('subject') ||
                      bodyText.toLowerCase().includes('math') ||
                      bodyText.toLowerCase().includes('science') ||
                      bodyText.toLowerCase().includes('smartstudy');
    if (!isSubject) {
      throw new Error('Subject view verification failed. Expected curriculum subjects not found.');
    }
    return true;
  }
}
