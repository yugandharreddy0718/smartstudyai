import { DashboardPage } from '../../pages/DashboardPage.js';

export async function runSearchTests(driver) {
  const dash = new DashboardPage(driver);
  await dash.getSubjectCards();
}
