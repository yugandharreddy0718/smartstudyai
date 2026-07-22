import WebBasePage from './WebBasePage.js';

export default class WebLoginPage extends WebBasePage {
  constructor(driver) {
    super(driver);
  }

  // Selectors
  get appHeading() { return 'h1'; }
  get googleLoginButton() { return 'button'; }
  get featureList() { return '.bg-slate-50\\/50'; }
  get errorDisplay() { return 'div.bg-rose-50'; }

  // Actions
  async verifyLoginPageActive() {
    const isHeading = await this.isDisplayed(this.appHeading);
    const isBtn = await this.isDisplayed(this.googleLoginButton);
    if (!isHeading || !isBtn) {
      throw new Error('Sign-In Page elements failed to load in browser.');
    }
  }

  async getHeadingText() {
    return await this.getText(this.appHeading);
  }

  async clickGoogleSignIn() {
    await this.click(this.googleLoginButton);
  }

  async getErrorMessage() {
    if (await this.isDisplayed(this.errorDisplay)) {
      return await this.getText(this.errorDisplay);
    }
    return null;
  }
}
