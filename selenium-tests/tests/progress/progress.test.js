import { DashboardPage } from '../../pages/DashboardPage.js';

export async function runProgressTests(driver) {
  const dash = new DashboardPage(driver);
  await dash.getSubjectCards();
}
