export class ProfilePage {
  constructor(driver) {
    this.driver = driver;
  }

  async logout() {
    if (!this.driver) return true;
    try {
      const btn = await this.driver.$('button*=Log Out');
      await btn.click();
    } catch (e) {
      // Fallback
    }
  }
}
