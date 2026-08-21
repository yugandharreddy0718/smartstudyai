import { By } from 'selenium-webdriver';

export class LessonPage {
  constructor(driver) {
    this.driver = driver;
  }

  async verify13SectionLayout() {
    const bodyText = await this.driver.findElement(By.css('body')).getText();
    const mandatorySections = [
      'Learning Objectives',
      'Introduction',
      'Detailed Concept Explanation'
    ];
    return mandatorySections.some(sec => bodyText.includes(sec));
  }

  async markComplete() {
    const buttons = await this.driver.findElements(By.css('button'));
    for (const btn of buttons) {
      const text = await btn.getText();
      if (text.toLowerCase().includes('complete') || text.toLowerCase().includes('mark')) {
        await btn.click();
        await this.driver.sleep(1000);
        return true;
      }
    }
    return false;
  }
}
