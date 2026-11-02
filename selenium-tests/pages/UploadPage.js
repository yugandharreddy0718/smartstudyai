import { By, until } from 'selenium-webdriver';
import { config } from '../config/test.config.js';

export class UploadPage {
  constructor(driver) {
    this.driver = driver;
  }

  async navigateTo() {
    await this.driver.get(`${config.baseUrl}/#/upload`);
    await this.driver.wait(until.elementLocated(By.css('#root > *')), config.explicitWait, 'Upload screen failed to mount');
  }

  async verifyUploadView() {
    await this.navigateTo();
    await this.driver.wait(until.elementLocated(By.css('input[type="file"], [class*="border-dashed"], button')), config.explicitWait);
    const bodyText = await this.driver.findElement(By.css('body')).getText();
    const isUpload = bodyText.toLowerCase().includes('upload') || 
                     bodyText.toLowerCase().includes('document') || 
                     bodyText.toLowerCase().includes('pdf') ||
                     bodyText.toLowerCase().includes('file');
    if (!isUpload) {
      throw new Error('Upload screen verification failed. Upload dropzone not detected.');
    }
    return true;
  }
}
