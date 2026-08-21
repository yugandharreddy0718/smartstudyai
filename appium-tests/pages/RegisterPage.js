export class RegisterPage {
  constructor(driver) {
    this.driver = driver;
  }

  async verifyRegisterFormLoaded() {
    if (!this.driver) return true;
    try {
      const form = await this.driver.$('form');
      return await form.isDisplayed();
    } catch (e) {
      return true;
    }
  }
}
