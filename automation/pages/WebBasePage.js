import { By, until } from 'selenium-webdriver';

export default class WebBasePage {
  constructor(driver) {
    this.driver = driver;
  }

  // Find an element using CSS or XPath
  async findElement(selector, type = 'css') {
    const locator = type === 'xpath' ? By.xpath(selector) : By.css(selector);
    return await this.driver.findElement(locator);
  }

  // Explicit wait for visibility and click
  async click(selector, type = 'css', timeout = 10000) {
    const el = await this.waitForVisible(selector, type, timeout);
    await el.click();
  }

  // Explicit wait for visibility, clear and type
  async sendKeys(selector, text, type = 'css', timeout = 10000) {
    const el = await this.waitForVisible(selector, type, timeout);
    await el.clear();
    await el.sendKeys(text);
  }

  // Wait for visibility and extract text
  async getText(selector, type = 'css', timeout = 10000) {
    const el = await this.waitForVisible(selector, type, timeout);
    return await el.getText();
  }

  // Safe checks for element presence
  async isDisplayed(selector, type = 'css') {
    try {
      const locator = type === 'xpath' ? By.xpath(selector) : By.css(selector);
      const el = await this.driver.findElement(locator);
      return await el.isDisplayed();
    } catch (e) {
      return false;
    }
  }

  // Wrapper for selenium's wait visibility
  async waitForVisible(selector, type = 'css', timeout = 10000) {
    const locator = type === 'xpath' ? By.xpath(selector) : By.css(selector);
    await this.driver.wait(until.elementLocated(locator), timeout);
    const el = await this.driver.findElement(locator);
    await this.driver.wait(until.elementIsVisible(el), timeout);
    return el;
  }

  // Navigate to target URL
  async navigateTo(url) {
    await this.driver.get(url);
  }

  // Wait for specified milliseconds
  async pause(ms) {
    await this.driver.sleep(ms);
  }
}
