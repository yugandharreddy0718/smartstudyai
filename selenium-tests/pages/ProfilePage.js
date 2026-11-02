import { By, until } from 'selenium-webdriver';
import { config } from '../config/test.config.js';

export class ProfilePage {
  constructor(driver) {
    this.driver = driver;
  }

  async navigateTo() {
    await this.driver.get(`${config.baseUrl}/#/profile`);
    await this.driver.wait(until.elementLocated(By.css('#root > *')), config.explicitWait, 'Profile screen failed to mount');
  }

  async verifyProfileLoaded() {
    await this.navigateTo();
    await this.driver.wait(until.elementLocated(By.css('h2, button, [class*="rounded"]')), config.explicitWait);
    const bodyText = await this.driver.findElement(By.css('body')).getText();
    const isProfile = bodyText.toLowerCase().includes('grade') || 
                      bodyText.toLowerCase().includes('experience') || 
                      bodyText.toLowerCase().includes('streak') ||
                      bodyText.toLowerCase().includes('xp') ||
                      bodyText.toLowerCase().includes('smartstudy');
    if (!isProfile) {
      throw new Error('Profile screen verification failed.');
    }
    return true;
  }

  async logout() {
    const buttons = await this.driver.findElements(By.css('button, a'));
    for (const btn of buttons) {
      try {
        const text = await btn.getText();
        if (text.toLowerCase().includes('sign out') || text.toLowerCase().includes('logout')) {
          await btn.click();
          await this.driver.sleep(1000);
          return true;
        }
      } catch (e) {
        // Stale element during click
      }
    }
    // Also try finding logout SVG icon button
    const logoutBtns = await this.driver.findElements(By.css('button.text-rose-500, button[class*="rose"]'));
    if (logoutBtns.length > 0) {
      await logoutBtns[0].click();
      await this.driver.sleep(1000);
      return true;
    }
    return false;
  }
}
