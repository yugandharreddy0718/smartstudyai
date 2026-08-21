import { LoginPage } from '../../pages/LoginPage.js';
import { RegisterPage } from '../../pages/RegisterPage.js';

export async function runAuthTests(driver) {
  const login = new LoginPage(driver);
  await login.navigateTo();
  await login.verifyWelcomeScreenLoaded();

  const reg = new RegisterPage(driver);
  await reg.verifyRegisterFormLoaded();
}
