import { By } from 'selenium-webdriver';

export class ProfilePage {
  constructor(driver) {
    this.driver = driver;
  }

  async logout() {
    const buttons = await this.driver.findElements(By.css('button, a'));
    for (const btn of buttons) {
      const text = await btn.getText();
      if (text.toLowerCase().includes('sign out') || text.toLowerCase().includes('logout')) {
        await btn.click();
        await this.driver.sleep(1000);
        return true;
      }
    }
    return false;
  }
}
