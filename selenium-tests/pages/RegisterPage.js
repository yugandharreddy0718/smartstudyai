import { By, until } from 'selenium-webdriver';
import { config } from '../config/test.config.js';

export class RegisterPage {
  constructor(driver) {
    this.driver = driver;
  }

  async navigateTo() {
    await this.driver.get(`${config.baseUrl}/#/register`);
    await this.driver.wait(until.elementLocated(By.css('#root > *')), config.explicitWait, 'Register page failed to mount');
  }

  async verifyRegisterFormLoaded() {
    await this.navigateTo();
    await this.driver.wait(until.elementLocated(By.css('form, input[type="email"]')), config.explicitWait);
    const bodyText = await this.driver.findElement(By.css('body')).getText();
    const hasRegister = bodyText.toLowerCase().includes('register') || 
                        bodyText.toLowerCase().includes('create account') || 
                        bodyText.toLowerCase().includes('sign up');
    if (!hasRegister) {
      throw new Error(`Register form verification failed. Body text does not indicate registration screen.`);
    }
    return true;
  }
}
