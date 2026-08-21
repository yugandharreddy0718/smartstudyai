export default class BasePage {
  constructor(driver) {
    this.driver = driver;
  }

  // Find a single element
  async getElement(selector) {
    return await this.driver.$(selector);
  }

  // Wait for displayed and click
  async click(selector) {
    const el = await this.getElement(selector);
    await el.waitForDisplayed({ timeout: 10000 });
    await el.click();
  }

  // Wait for displayed and type value
  async setValue(selector, value) {
    const el = await this.getElement(selector);
    await el.waitForDisplayed({ timeout: 10000 });
    await el.setValue(value);
  }

  // Get text of element
  async getText(selector) {
    const el = await this.getElement(selector);
    await el.waitForDisplayed({ timeout: 10000 });
    return await el.getText();
  }

  // Check if displayed safely
  async isDisplayed(selector) {
    try {
      const el = await this.getElement(selector);
      return await el.isDisplayed();
    } catch (e) {
      return false;
    }
  }

  // Pause execution
  async pause(ms) {
    await this.driver.pause(ms);
  }

  // Switch context to Capacitor Webview
  async switchToWebview() {
    const contexts = await this.driver.getContexts();
    const webviewContext = contexts.find(c => c.includes('WEBVIEW'));
    if (webviewContext) {
      await this.driver.switchContext(webviewContext);
      return true;
    }
    throw new Error('Webview context (Capacitor) not found in app.');
  }

  // Switch context to Native Android
  async switchToNative() {
    await this.driver.switchContext('NATIVE_APP');
  }
}
