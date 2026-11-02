import { By, until } from 'selenium-webdriver';
import { config } from '../config/test.config.js';

export class LoginPage {
  constructor(driver) {
    this.driver = driver;
  }

  async navigateTo(route = '') {
    const url = route ? `${config.baseUrl}/#${route}` : `${config.baseUrl}/#/welcome`;
    await this.driver.get(url);
    await this.driver.wait(until.elementLocated(By.css('#root > *')), config.explicitWait, 'React app root failed to mount');
  }

  async navigateToLogin() {
    await this.driver.get(`${config.baseUrl}/#/login`);
    await this.driver.wait(until.elementLocated(By.css('#root > *')), config.explicitWait, 'Login screen failed to mount');
  }

  async verifyWelcomeScreenLoaded() {
    await this.driver.wait(until.elementLocated(By.css('body')), config.explicitWait);
    const bodyText = await this.driver.findElement(By.css('body')).getText();
    const hasWelcome = bodyText.toLowerCase().includes('smartstudy') || 
                       bodyText.toLowerCase().includes('welcome') ||
                       bodyText.toLowerCase().includes('login') ||
                       bodyText.toLowerCase().includes('sign in');
    if (!hasWelcome) {
      throw new Error(`Welcome screen verification failed. Content does not match expected branding.`);
    }
    return true;
  }

  async verifyLoginFormLoaded() {
    await this.driver.wait(until.elementLocated(By.css('input[type="email"]')), config.explicitWait);
    const emailField = await this.driver.findElement(By.css('input[type="email"]'));
    const passField = await this.driver.findElement(By.css('input[type="password"]'));
    const isEmailDisplayed = await emailField.isDisplayed();
    const isPassDisplayed = await passField.isDisplayed();
    if (!isEmailDisplayed || !isPassDisplayed) {
      throw new Error('Login form input fields are not visible');
    }
    return true;
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
    await this.navigateToLogin();
    const emailInputs = await this.driver.findElements(By.css('input[type="email"], input[name="email"]'));
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
      if (text.toLowerCase().includes('sign in') || text.toLowerCase().includes('login')) {
        await btn.click();
        await this.driver.sleep(1200);
        break;
      }
    }
  }

  async verifyLoginErrorDisplayed() {
    await this.driver.wait(until.elementLocated(By.css('div.text-rose-600, div.bg-rose-50, [role="alert"]')), config.explicitWait);
    const errorEl = await this.driver.findElement(By.css('div.text-rose-600, div.bg-rose-50, [role="alert"]'));
    const isDisplayed = await errorEl.isDisplayed();
    if (!isDisplayed) {
      throw new Error('Expected authentication error message to be visible');
    }
    return true;
  }
}
