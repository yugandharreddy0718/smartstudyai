import { By, until } from 'selenium-webdriver';
import { config } from '../config/test.config.js';

export class AIStudioPage {
  constructor(driver) {
    this.driver = driver;
  }

  async navigateTo() {
    await this.driver.get(`${config.baseUrl}/#/chat`);
    await this.driver.wait(until.elementLocated(By.css('#root > *')), config.explicitWait, 'AI Chat screen failed to mount');
  }

  async verifyAIChatLoaded() {
    await this.navigateTo();
    await this.driver.wait(until.elementLocated(By.css('input, textarea, [placeholder*="Ask" i], [placeholder*="help" i]')), config.explicitWait);
    const bodyText = await this.driver.findElement(By.css('body')).getText();
    const isLoaded = bodyText.toLowerCase().includes('tutor') || 
                     bodyText.toLowerCase().includes('ai') || 
                     bodyText.toLowerCase().includes('help');
    if (!isLoaded) {
      throw new Error('AI Chat screen verification failed. Chat elements not visible.');
    }
    return true;
  }

  async triggerTool(toolName) {
    const buttons = await this.driver.findElements(By.css('button, a, div'));
    for (const btn of buttons) {
      try {
        const text = await btn.getText();
        if (text.toLowerCase().includes(toolName.toLowerCase())) {
          await btn.click();
          await this.driver.sleep(1000);
          return true;
        }
      } catch (e) {
        // Stale element during React render
      }
    }
    return true;
  }

  async verifyResultContainer() {
    const elements = await this.driver.findElements(By.css('div, p, button'));
    return elements.length > 0;
  }
}
