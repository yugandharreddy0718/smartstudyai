import { By } from 'selenium-webdriver';

export class SubjectPage {
  constructor(driver) {
    this.driver = driver;
  }

  async verifySubjectViewLoaded() {
    const bodyText = await this.driver.findElement(By.css('body')).getText();
    return bodyText.toLowerCase().includes('chapter') || bodyText.toLowerCase().includes('subject');
  }
}
