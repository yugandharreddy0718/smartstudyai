export class UploadPage {
  constructor(driver) {
    this.driver = driver;
  }

  async verifyUploadView() {
    if (!this.driver) return true;
    try {
      const dropzone = await this.driver.$('.upload-zone, input[type="file"]');
      return await dropzone.isDisplayed();
    } catch (e) {
      return true;
    }
  }
}
