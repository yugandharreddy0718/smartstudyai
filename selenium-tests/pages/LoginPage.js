import { By, until } from 'selenium-webdriver';
import { config } from '../config/test.config.js';

export class LoginPage {
  constructor(driver) {
    this.driver = driver;
  }

  async navigateTo() {
    await this.driver.get(config.baseUrl);
    await this.driver.sleep(1000);
  }

  async verifyWelcomeScreenLoaded() {
    const bodyText = await this.driver.findElement(By.css('body')).getText();
    return bodyText.toLowerCase().includes('smartstudy') || bodyText.toLowerCase().includes('welcome');
  }

  async clickLoginTab() {
    const buttons = await this.driver.findElements(By.css('button, a'));
    for (const btn of buttons) {
      const text = await btn.getText();
      if (text.toLowerCase().includes('sign in') || text.toLowerCase().includes('login')) {
        await btn.click();
        await this.driver.sleep(500);
        return true;
      }
    }
    return false;
  }

  async login(email, password) {
    const emailInputs = await this.driver.findElements(By.css('input[type="email"], input[name="email"], input[placeholder*="email" i]'));
    if (emailInputs.length > 0) {
      await emailInputs[0].clear();
      await emailInputs[0].sendKeys(email);
    }

    const passInputs = await this.driver.findElements(By.css('input[type="password"], input[name="password"]'));
    if (passInputs.length > 0) {
      await passInputs[0].clear();
      await passInputs[0].sendKeys(password);
    }

    const submitBtns = await this.driver.findElements(By.css('button[type="submit"], button'));
    for (const btn of submitBtns) {
      const text = await btn.getText();
      if (text.toLowerCase().includes('sign in') || text.toLowerCase().includes('login') || text.toLowerCase().includes('continue')) {
        await btn.click();
        await this.driver.sleep(1000);
        break;
      }
    }
  }
}
