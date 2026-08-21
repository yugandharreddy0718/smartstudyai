export class AdminPage {
  constructor(driver) {
    this.driver = driver;
  }

  async tryAccessAdminRoute() {
    if (!this.driver) return true;
    try {
      await this.driver.url('http://localhost:5173/admin');
    } catch (e) {
      // Security check
    }
  }
}
