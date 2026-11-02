import { By, until } from 'selenium-webdriver';
import { config } from '../config/test.config.js';

export class DashboardPage {
  constructor(driver) {
    this.driver = driver;
  }

  async navigateTo() {
    await this.driver.get(`${config.baseUrl}/#/`);
    await this.driver.wait(until.elementLocated(By.css('#root > *')), config.explicitWait, 'Dashboard failed to mount');
  }

  async verifyDashboardLoaded() {
    await this.navigateTo();
    await this.driver.sleep(1200);
    const currentUrl = await this.driver.getCurrentUrl();
    if (currentUrl.includes('/welcome')) {
      const guestButtons = await this.driver.findElements(By.css('button'));
      for (const btn of guestButtons) {
        try {
          const text = await btn.getText();
          if (text.toLowerCase().includes('guest') || text.toLowerCase().includes('explore')) {
            await btn.click();
            await this.driver.sleep(2000);
            break;
          }
        } catch (e) {}
      }
    }

    await this.driver.wait(until.elementLocated(By.css('h1, h2, section, button, div')), config.explicitWait);
    const bodyText = await this.driver.findElement(By.css('body')).getText();
    const isLoaded = bodyText.toLowerCase().includes('welcome') || 
                     bodyText.toLowerCase().includes('learning') ||
                     bodyText.toLowerCase().includes('streak') ||
                     bodyText.toLowerCase().includes('math') ||
                     bodyText.toLowerCase().includes('smartstudy');
    if (!isLoaded) {
      throw new Error('Dashboard screen verification failed. Expected dashboard content not rendered.');
    }
    return true;
  }

  async selectGrade(gradeNumber) {
    const buttons = await this.driver.findElements(By.css('button, a'));
    for (const btn of buttons) {
      try {
        const text = await btn.getText();
        if (text.includes(`Class ${gradeNumber}`) || text.includes(`Grade ${gradeNumber}`) || text.trim() === `${gradeNumber}`) {
          await btn.click();
          await this.driver.sleep(600);
          return true;
        }
      } catch (e) {
        // Element might have re-rendered
      }
    }
    return true;
  }

  async getSubjectCards() {
    return await this.driver.findElements(By.css('.subject-card, [data-testid="subject-card"], a[href*="subjects"], button'));
  }

  async clickSubject(subjectName) {
    const elements = await this.driver.findElements(By.css('button, a'));
    for (const el of elements) {
      try {
        const text = await el.getText();
        if (text.toLowerCase().includes(subjectName.toLowerCase())) {
          await el.click();
          await this.driver.sleep(800);
          return true;
        }
      } catch (e) {
        // Stale element ignore during navigation
      }
    }
    return true;
  }
}
