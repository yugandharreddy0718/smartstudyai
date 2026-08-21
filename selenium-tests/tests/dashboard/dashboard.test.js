import { DashboardPage } from '../../pages/DashboardPage.js';

export async function runDashboardTests(driver) {
  const dash = new DashboardPage(driver);
  await dash.getSubjectCards();
  await dash.selectGrade(6);
  await dash.selectGrade(10);
}
