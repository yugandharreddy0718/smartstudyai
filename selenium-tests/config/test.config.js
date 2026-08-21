import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const config = {
  baseUrl: process.env.BASE_URL || 'http://localhost:5173',
  browser: process.env.BROWSER || 'chrome',
  headless: process.env.HEADLESS !== 'false',
  implicitWait: parseInt(process.env.IMPLICIT_WAIT || '10000', 10),
  explicitWait: parseInt(process.env.EXPLICIT_WAIT || '15000', 10),
  testEmail: process.env.TEST_EMAIL || 'student@smartstudy.ai',
  testPassword: process.env.TEST_PASSWORD || 'Password123!',
  reportsDir: path.resolve(__dirname, '../reports'),
  screenshotsDir: path.resolve(__dirname, '../reports/screenshots'),
  excelReportPath: path.resolve(__dirname, '../reports/selenium-report.xlsx'),
  htmlReportPath: path.resolve(__dirname, '../reports/selenium-report.html')
};
