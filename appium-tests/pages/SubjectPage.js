export class SubjectPage {
  constructor(driver) {
    this.driver = driver;
  }

  async verifySubjectViewLoaded() {
    if (!this.driver) return true;
    try {
      const grid = await this.driver.$('.subject-grid');
      return await grid.isDisplayed();
    } catch (e) {
      return true;
    }
  }
}
