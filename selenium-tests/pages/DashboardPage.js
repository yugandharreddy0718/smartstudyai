import { By } from 'selenium-webdriver';

export class DashboardPage {
  constructor(driver) {
    this.driver = driver;
  }

  async selectGrade(gradeNumber) {
    const buttons = await this.driver.findElements(By.css('button, div'));
    for (const btn of buttons) {
      const text = await btn.getText();
      if (text.includes(`Class ${gradeNumber}`) || text.includes(`Grade ${gradeNumber}`) || text === `${gradeNumber}`) {
        await btn.click();
        await this.driver.sleep(1000);
        return true;
      }
    }
    return false;
  }

  async getSubjectCards() {
    return await this.driver.findElements(By.css('.subject-card, [data-testid="subject-card"], button, div'));
  }

  async clickSubject(subjectName) {
    const elements = await this.driver.findElements(By.css('button, div, a'));
    for (const el of elements) {
      const text = await el.getText();
      if (text.toLowerCase().includes(subjectName.toLowerCase())) {
        await el.click();
        await this.driver.sleep(1000);
        return true;
      }
    }
    return false;
  }
}
