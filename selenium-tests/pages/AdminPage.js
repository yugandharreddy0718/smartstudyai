import { By } from 'selenium-webdriver';
import { config } from '../config/test.config.js';

export class AdminPage {
  constructor(driver) {
    this.driver = driver;
  }

  async tryAccessAdminRoute() {
    await this.driver.get(`${config.baseUrl}/admin`);
    await this.driver.sleep(1000);
    const bodyText = await this.driver.findElement(By.css('body')).getText();
    return bodyText.toLowerCase().includes('admin') || bodyText.toLowerCase().includes('denied') || bodyText.toLowerCase().includes('welcome');
  }
}
