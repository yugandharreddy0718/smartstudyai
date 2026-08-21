import BasePage from './BasePage.js';

export default class LoginPage extends BasePage {
  constructor(driver) {
    super(driver);
  }

  // Selectors
  get appHeading() { return 'h1'; }
  get googleLoginButton() { return 'button'; }
  get featureItems() { return '.bg-slate-50\\/50'; }
  get errorContainer() { return 'div.bg-rose-50'; }

  // Actions
  async getHeadingText() {
    return await this.getText(this.appHeading);
  }

  async verifyLoginPageLoaded() {
    const isHeadingVisible = await this.isDisplayed(this.appHeading);
    const isBtnVisible = await this.isDisplayed(this.googleLoginButton);
    if (!isHeadingVisible || !isBtnVisible) {
      throw new Error('Login Page elements did not load correctly.');
    }
  }

  async clickGoogleLogin() {
    await this.click(this.googleLoginButton);
  }

  async getErrorMessage() {
    if (await this.isDisplayed(this.errorContainer)) {
      return await this.getText(this.errorContainer);
    }
    return null;
  }
}
