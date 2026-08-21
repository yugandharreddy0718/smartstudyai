import { By } from 'selenium-webdriver';

export class AIStudioPage {
  constructor(driver) {
    this.driver = driver;
  }

  async triggerTool(toolName) {
    const buttons = await this.driver.findElements(By.css('button, div'));
    for (const btn of buttons) {
      const text = await btn.getText();
      if (text.toLowerCase().includes(toolName.toLowerCase())) {
        await btn.click();
        await this.driver.sleep(1500);
        return true;
      }
    }
    return false;
  }

  async verifyResultContainer() {
    const elements = await this.driver.findElements(By.css('div, p, button'));
    return elements.length > 0;
  }
}
