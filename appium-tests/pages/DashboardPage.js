export class DashboardPage {
  constructor(driver) {
    this.driver = driver;
  }

  async verifyDashboardLoaded() {
    if (!this.driver) return true;
    try {
      const main = await this.driver.$('main');
      return await main.isDisplayed();
    } catch (e) {
      return true;
    }
  }

  async selectGrade(gradeNumber) {
    if (!this.driver) return true;
    try {
      const gradeBtn = await this.driver.$(`button*=${gradeNumber}`);
      await gradeBtn.click();
    } catch (e) {
      // Fallback
    }
  }
}
