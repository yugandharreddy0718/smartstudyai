import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rawBaseUrl = process.env.BASE_URL || 'https://yugandharreddy0718.github.io/smartstudyai';
const normalizedBaseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;

export const config = {
  baseUrl: normalizedBaseUrl,
  browser: process.env.BROWSER || 'chrome',
  headless: process.env.HEADLESS !== 'false',
  implicitWait: parseInt(process.env.IMPLICIT_WAIT || '10000', 10),
  explicitWait: parseInt(process.env.EXPLICIT_WAIT || '15000', 10),
  testEmail: process.env.TEST_EMAIL || 'student@smartstudy.ai',
  testPassword: process.env.TEST_PASSWORD || 'Password123!',
  reportsDir: path.resolve(__dirname, '../../reports/selenium'),
  screenshotsDir: path.resolve(__dirname, '../../reports/selenium/screenshots'),
  excelReportPath: path.resolve(__dirname, '../../reports/selenium/Selenium_Test_Report.xlsx'),
  htmlReportPath: path.resolve(__dirname, '../../reports/selenium/selenium-report.html'),
  jsonReportPath: path.resolve(__dirname, '../../reports/selenium/selenium-results.json'),
  junitReportPath: path.resolve(__dirname, '../../reports/selenium/selenium-junit.xml')
};
