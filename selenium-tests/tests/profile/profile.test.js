import { ProfilePage } from '../../pages/ProfilePage.js';

export async function runProfileTests(driver) {
  const prof = new ProfilePage(driver);
  await prof.logout();
}
