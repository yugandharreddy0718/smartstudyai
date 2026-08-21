import { By } from 'selenium-webdriver';

export class UploadPage {
  constructor(driver) {
    this.driver = driver;
  }

  async verifyUploadView() {
    const bodyText = await this.driver.findElement(By.css('body')).getText();
    return bodyText.toLowerCase().includes('upload') || bodyText.toLowerCase().includes('pdf') || bodyText.toLowerCase().includes('file');
  }
}
