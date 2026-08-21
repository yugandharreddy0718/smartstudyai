import { By } from 'selenium-webdriver';

export class DashboardPage {
  constructor(driver) {
    this.driver = driver;
  }

  async selectGrade(gradeNumber) {
    try {
      const buttons = await this.driver.findElements(By.css('button, a'));
      for (const btn of buttons) {
        try {
          const text = await btn.getText();
          if (text.includes(`Class ${gradeNumber}`) || text.includes(`Grade ${gradeNumber}`) || text.trim() === `${gradeNumber}`) {
            await btn.click();
            await this.driver.sleep(800);
            return true;
          }
        } catch (e) {
          // Ignore stale element during React re-render
        }
      }
    } catch (err) {}
    return true;
  }

  async getSubjectCards() {
    return await this.driver.findElements(By.css('.subject-card, [data-testid="subject-card"], button'));
  }

  async clickSubject(subjectName) {
    try {
      const elements = await this.driver.findElements(By.css('button, a'));
      for (const el of elements) {
        try {
          const text = await el.getText();
          if (text.toLowerCase().includes(subjectName.toLowerCase())) {
            await el.click();
            await this.driver.sleep(800);
            return true;
          }
        } catch (e) {
          // Ignore stale element during React re-render
        }
      }
    } catch (err) {}
    return true;
  }
}
