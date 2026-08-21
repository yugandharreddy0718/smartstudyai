import { AdminPage } from '../../pages/AdminPage.js';

export async function runSecurityTests(driver) {
  const admin = new AdminPage(driver);
  await admin.tryAccessAdminRoute();
}
