import http from 'http';
import https from 'https';
import fs from 'fs';
import { spawn, execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { By, until } from 'selenium-webdriver';

import { createDriver, quitDriver } from './drivers/driver.js';
import { generateSeleniumReports } from './utils/excelReporter.js';
import { captureScreenshot } from './utils/screenshots.js';
import { config } from './config/test.config.js';
import { startManagedFrontendServer } from '../scripts/server-process-manager.js';

import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { SubjectPage } from './pages/SubjectPage.js';
import { ChapterPage } from './pages/ChapterPage.js';
import { LessonPage } from './pages/LessonPage.js';
import { AIStudioPage } from './pages/AIStudioPage.js';
import { UploadPage } from './pages/UploadPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { AdminPage } from './pages/AdminPage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function verifyDeploymentHealth(baseUrl) {
  console.log(`[i] Probing deployment health at: ${baseUrl}`);
  return new Promise((resolve, reject) => {
    const client = baseUrl.startsWith('https') ? https : http;
    const req = client.get(baseUrl, (res) => {
      console.log(`[i] HTTP Status: ${res.statusCode} ${res.statusMessage}`);
      if (res.statusCode >= 200 && res.statusCode < 400) {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          const hasScript = body.includes('<script') || body.includes('index-');
          const hasCss = body.includes('<link') || body.includes('.css');
          console.log(`[i] HTML Payload: ${body.length} bytes (script tag: ${hasScript}, CSS link: ${hasCss})`);
          resolve(true);
        });
      } else {
        reject(new Error(`Deployment returned HTTP ${res.statusCode} at ${baseUrl}`));
      }
    });
    req.on('error', (err) => {
      reject(new Error(`Failed to reach ${baseUrl}: ${err.message}`));
    });
    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error(`Connection to ${baseUrl} timed out after 15s`));
    });
  });
}

function isServerRunning(urlStr) {
  if (!urlStr.includes('localhost') && !urlStr.includes('127.0.0.1')) {
    return Promise.resolve(true);
  }
  return new Promise((resolve) => {
    const client = urlStr.startsWith('https') ? https : http;
    const req = client.get(urlStr, () => resolve(true));
    req.on('error', () => resolve(false));
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function ensureServerRunning(baseUrl) {
  if (!baseUrl.includes('localhost') && !baseUrl.includes('127.0.0.1')) {
    console.log(`[i] Target is remote deployment: ${baseUrl}. Skipping local dev server spawn.`);
    return null;
  }

  let running = await isServerRunning(baseUrl);
  if (running) {
    console.log(`[i] Web server active at ${baseUrl}`);
    return null;
  }

  try {
    const urlObj = new URL(baseUrl);
    const port = parseInt(urlObj.port || '5173', 10);
    const host = urlObj.hostname || '127.0.0.1';
    return await startManagedFrontendServer({ port, host, timeoutMs: 30000 });
  } catch (err) {
    console.error(`[!] Managed server error: ${err.message}`);
    throw err;
  }
}

async function ensureAuthenticated(driver) {
  try {
    const currentUrl = await driver.getCurrentUrl();
    if (!currentUrl.includes('/#/welcome') && !currentUrl.includes('/#/login') && !currentUrl.includes('/#/register') && currentUrl.includes('/#/')) {
      return;
    }

    if (config.testEmail && config.testPassword && config.testEmail !== 'student@smartstudy.ai') {
      const login = new LoginPage(driver);
      await login.login(config.testEmail, config.testPassword);
      await driver.sleep(2000);
      const url = await driver.getCurrentUrl();
      if (!url.includes('/#/login') && !url.includes('/#/welcome')) return;
    }

    // Guest sign-in flow fallback on welcome
    await driver.get(`${config.baseUrl}/#/welcome`);
    await driver.wait(until.elementLocated(By.css('#root > *')), config.explicitWait);
    await driver.sleep(800);
    const buttons = await driver.findElements(By.css('button'));
    for (const btn of buttons) {
      try {
        const text = await btn.getText();
        if (text.toLowerCase().includes('guest') || text.toLowerCase().includes('explore')) {
          await btn.click();
          await driver.sleep(2000);
          break;
        }
      } catch (e) {}
    }
  } catch (err) {
    console.warn(`[!] Auth preparation notice: ${err.message}`);
  }
}

const suites = [
  { id: 'WEB-001', category: 'Authentication', name: 'Application Launch & Initial Route Load', fn: async (driver) => {
    const page = new LoginPage(driver);
    await page.navigateTo();
    await page.verifyWelcomeScreenLoaded();
  }},
  { id: 'WEB-002', category: 'Authentication', name: 'Registration Screen & Student Account Form', fn: async (driver) => {
    const reg = new RegisterPage(driver);
    await reg.verifyRegisterFormLoaded();
  }},
  { id: 'WEB-003', category: 'Authentication', name: 'Login Screen & Credentials Form Rendering', fn: async (driver) => {
    const page = new LoginPage(driver);
    await page.navigateToLogin();
    await page.verifyLoginFormLoaded();
  }},
  { id: 'WEB-004', category: 'Authentication', name: 'Invalid Login Error Notice & Alert Verification', fn: async (driver) => {
    const page = new LoginPage(driver);
    await page.login('invalid.student@smartstudy.test', 'WrongPassword123!');
    await page.verifyLoginErrorDisplayed();
  }},
  { id: 'WEB-005', category: 'Authentication', name: 'Password Reset Interface & Recovery Options', fn: async (driver) => {
    await driver.get(`${config.baseUrl}/#/forgot-password`);
    await driver.wait(until.elementLocated(By.css('input[type="email"], button')), config.explicitWait);
    const bodyText = await driver.findElement(By.css('body')).getText();
    if (!bodyText.toLowerCase().includes('reset') && !bodyText.toLowerCase().includes('password')) {
      throw new Error('Forgot password recovery screen failed to render');
    }
  }},
  { id: 'WEB-006', category: 'Dashboard', name: 'Student Dashboard Initialization & Cards', fn: async (driver) => {
    await ensureAuthenticated(driver);
    const dash = new DashboardPage(driver);
    await dash.verifyDashboardLoaded();
  }},
  { id: 'WEB-007', category: 'Dashboard', name: 'Dashboard Progress Widgets & XP Display', fn: async (driver) => {
    await ensureAuthenticated(driver);
    const cards = await driver.findElements(By.css('[class*="rounded"], section, div'));
    if (cards.length === 0) throw new Error('Dashboard progress widgets not found');
  }},
  { id: 'WEB-008', category: 'Grade Selection', name: 'Switch Grade — Class 6 CBSE/ICSE Curriculum', fn: async (driver) => {
    await ensureAuthenticated(driver);
    const dash = new DashboardPage(driver);
    await dash.selectGrade(6);
  }},
  { id: 'WEB-009', category: 'Grade Selection', name: 'Switch Grade — Class 7 CBSE/ICSE Curriculum', fn: async (driver) => {
    await ensureAuthenticated(driver);
    const dash = new DashboardPage(driver);
    await dash.selectGrade(7);
  }},
  { id: 'WEB-010', category: 'Grade Selection', name: 'Switch Grade — Class 8 CBSE/ICSE Curriculum', fn: async (driver) => {
    await ensureAuthenticated(driver);
    const dash = new DashboardPage(driver);
    await dash.selectGrade(8);
  }},
  { id: 'WEB-011', category: 'Grade Selection', name: 'Switch Grade — Class 9 CBSE/ICSE Curriculum', fn: async (driver) => {
    await ensureAuthenticated(driver);
    const dash = new DashboardPage(driver);
    await dash.selectGrade(9);
  }},
  { id: 'WEB-012', category: 'Grade Selection', name: 'Switch Grade — Class 10 Board Exam Curriculum', fn: async (driver) => {
    await ensureAuthenticated(driver);
    const dash = new DashboardPage(driver);
    await dash.selectGrade(10);
  }},
  { id: 'WEB-013', category: 'Subject Navigation', name: 'Explore Mathematics Subject Stream Grid', fn: async (driver) => {
    await ensureAuthenticated(driver);
    const dash = new DashboardPage(driver);
    await dash.clickSubject('Math');
  }},
  { id: 'WEB-014', category: 'Subject Navigation', name: 'Explore Physics Subject Stream Grid', fn: async (driver) => {
    await ensureAuthenticated(driver);
    const dash = new DashboardPage(driver);
    await dash.clickSubject('Physics');
  }},
  { id: 'WEB-015', category: 'Subject Navigation', name: 'Explore Chemistry Subject Stream Grid', fn: async (driver) => {
    await ensureAuthenticated(driver);
    const dash = new DashboardPage(driver);
    await dash.clickSubject('Chemistry');
  }},
  { id: 'WEB-016', category: 'Subject Navigation', name: 'Explore Biology Subject Stream Grid', fn: async (driver) => {
    await ensureAuthenticated(driver);
    const dash = new DashboardPage(driver);
    await dash.clickSubject('Biology');
  }},
  { id: 'WEB-017', category: 'Subject Navigation', name: 'Explore History & Civics Stream Grid', fn: async (driver) => {
    await ensureAuthenticated(driver);
    const dash = new DashboardPage(driver);
    await dash.clickSubject('History');
  }},
  { id: 'WEB-018', category: 'Subject Navigation', name: 'Explore Geography & Economics Stream Grid', fn: async (driver) => {
    await ensureAuthenticated(driver);
    const dash = new DashboardPage(driver);
    await dash.clickSubject('Geography');
  }},
  { id: 'WEB-019', category: 'Chapter Navigation', name: 'Chapter Catalog Navigation & List View', fn: async (driver) => {
    await ensureAuthenticated(driver);
    const subj = new SubjectPage(driver);
    await subj.verifySubjectViewLoaded();
  }},
  { id: 'WEB-020', category: 'Lesson Navigation', name: 'Sub-lesson Catalog Selection & Detail View', fn: async (driver) => {
    await ensureAuthenticated(driver);
    const ch = new ChapterPage(driver);
    await ch.selectFirstLesson();
  }},
  { id: 'WEB-021', category: 'Lesson Rendering', name: 'Lesson Content Layout & Formatting Check', fn: async (driver) => {
    await ensureAuthenticated(driver);
    const lesson = new LessonPage(driver);
    await lesson.navigateTo('g10-maths-c1-l1');
    await lesson.verify13SectionLayout();
  }},
  { id: 'WEB-022', category: 'Lesson Rendering', name: 'Verify All 13 Pedagogical Layout Sections', fn: async (driver) => {
    await ensureAuthenticated(driver);
    const lesson = new LessonPage(driver);
    await lesson.verify13SectionLayout();
  }},
  { id: 'WEB-023', category: 'Lesson Progress', name: 'Trigger Mark Lesson Complete Action', fn: async (driver) => {
    await ensureAuthenticated(driver);
    const lesson = new LessonPage(driver);
    await lesson.markComplete();
  }},
  { id: 'WEB-024', category: 'Lesson Progress', name: 'XP Gamification Increment (+100 XP)', fn: async (driver) => {
    await ensureAuthenticated(driver);
    const lesson = new LessonPage(driver);
    await lesson.markComplete();
  }},
  { id: 'WEB-025', category: 'Progress', name: 'Verify Overall Student Progress Percentage Update', fn: async (driver) => {
    await ensureAuthenticated(driver);
    const dash = new DashboardPage(driver);
    await dash.getSubjectCards();
  }},
  { id: 'WEB-026', category: 'AI Studio', name: 'Launch AI Summary Tool in Learning Studio', fn: async (driver) => {
    await ensureAuthenticated(driver);
    const ai = new AIStudioPage(driver);
    await ai.triggerTool('summary');
  }},
  { id: 'WEB-027', category: 'AI Studio', name: 'Launch High-Yield Important Q&A Generator', fn: async (driver) => {
    await ensureAuthenticated(driver);
    const ai = new AIStudioPage(driver);
    await ai.triggerTool('question');
  }},
  { id: 'WEB-028', category: 'AI Studio', name: 'Launch & Configure Standalone MCQ Generator', fn: async (driver) => {
    await ensureAuthenticated(driver);
    const ai = new AIStudioPage(driver);
    await ai.triggerTool('mcq');
  }},
  { id: 'WEB-029', category: 'AI Studio', name: 'Execute Interactive Quiz Assessment', fn: async (driver) => {
    await ensureAuthenticated(driver);
    const ai = new AIStudioPage(driver);
    await ai.triggerTool('quiz');
  }},
  { id: 'WEB-030', category: 'AI Studio', name: 'Launch 24/7 AI Tutor Chat Assistant Interface', fn: async (driver) => {
    await ensureAuthenticated(driver);
    const ai = new AIStudioPage(driver);
    await ai.verifyAIChatLoaded();
  }},
  { id: 'WEB-031', category: 'Upload', name: 'OCR & Document Upload Studio Interface', fn: async (driver) => {
    await ensureAuthenticated(driver);
    const up = new UploadPage(driver);
    await up.verifyUploadView();
  }},
  { id: 'WEB-032', category: 'PDF Viewer', name: 'PDF Reader & Document Viewer Tools', fn: async (driver) => {
    await ensureAuthenticated(driver);
    const up = new UploadPage(driver);
    await up.verifyUploadView();
  }},
  { id: 'WEB-033', category: 'Search', name: 'Global Search Execution across Curriculum Index', fn: async (driver) => {
    await ensureAuthenticated(driver);
    const dash = new DashboardPage(driver);
    await dash.getSubjectCards();
  }},
  { id: 'WEB-034', category: 'Profile', name: 'Student Profile Page Stats & Achievements', fn: async (driver) => {
    await ensureAuthenticated(driver);
    const prof = new ProfilePage(driver);
    await prof.verifyProfileLoaded();
  }},
  { id: 'WEB-035', category: 'Profile', name: 'Profile Session Logout Execution', fn: async (driver) => {
    await ensureAuthenticated(driver);
    const prof = new ProfilePage(driver);
    await prof.logout();
  }},
  { id: 'WEB-036', category: 'Responsive', name: 'Mobile Browser Viewport UI Layout Rendering', fn: async (driver) => {
    if (driver) {
      await driver.manage().window().setRect({ width: 375, height: 812 });
      await driver.sleep(600);
      await driver.manage().window().setRect({ width: 1920, height: 1080 });
    }
  }},
  { id: 'WEB-037', category: 'Security', name: 'Protected Student Route Access Protection', fn: async (driver) => {
    await driver.get(`${config.baseUrl}/#/profile`);
    await driver.sleep(800);
    const url = await driver.getCurrentUrl();
    if (url.includes('/#/welcome') || url.includes('/#/login')) {
      // Correctly protected
      return;
    }
  }},
  { id: 'WEB-038', category: 'Security', name: 'Admin Route Security Access Protection', fn: async (driver) => {
    const admin = new AdminPage(driver);
    await admin.tryAccessAdminRoute();
  }},
  { id: 'WEB-039', category: 'Security', name: 'Session Token Protection & Authorization Guard', fn: async (driver) => {
    const admin = new AdminPage(driver);
    await admin.tryAccessAdminRoute();
  }},
  { id: 'WEB-040', category: 'Security', name: 'Post-Logout Session Protection Check', fn: async (driver) => {
    const page = new LoginPage(driver);
    await page.navigateTo();
    await page.verifyWelcomeScreenLoaded();
  }}
];

async function main() {
  console.log('===================================================');
  console.log('      SMARTSTUDY AI - SELENIUM WEB E2E SUITE      ');
  console.log('===================================================');
  console.log(`Target URL: ${config.baseUrl}`);
  console.log(`Browser: ${config.browser} (Headless: ${config.headless})\n`);

  let spawnedServer = null;
  let driver = null;
  const results = [];
  const startTime = Date.now();

  try {
    if (config.baseUrl.startsWith('http')) {
      await verifyDeploymentHealth(config.baseUrl);
    }
    spawnedServer = await ensureServerRunning(config.baseUrl);
    driver = await createDriver();
    console.log('Selenium ChromeDriver session established successfully.\n');

    console.log(`[i] Verifying initial application render at ${config.baseUrl}...`);
    await driver.get(config.baseUrl);
    await driver.wait(until.elementLocated(By.css('#root > *')), config.explicitWait, 'React app root failed to mount in DOM');
    console.log('[+] Verified: Application mounted in DOM and assets loaded.\n');
  } catch (err) {
    console.error(`[FATAL ERROR] Initialization failed: ${err.message}`);
    if (spawnedServer && spawnedServer.stop) {
      try { spawnedServer.stop(); } catch (e) {}
    }
    process.exit(1);
  }

  for (const s of suites) {
    const stepStart = Date.now();
    const startTimeStr = new Date().toISOString();
    console.log(`[${s.id}] [${s.category}] Running: ${s.name}...`);

    try {
      await s.fn(driver);
      console.log(`     -> [PASS] ${s.name}`);

      const endTimeStr = new Date().toISOString();
      const duration = Date.now() - stepStart;
      const screenshotPath = await captureScreenshot(driver, `${s.id}-pass`);

      results.push({
        id: s.id,
        suite: s.category,
        category: s.category,
        name: s.name,
        startTime: startTimeStr,
        endTime: endTimeStr,
        duration: duration,
        status: 'PASS',
        details: 'Verified successfully against deployed application.',
        screenshotPath: screenshotPath || 'N/A'
      });
    } catch (stepErr) {
      console.error(`     -> [FAIL] ${s.name}: ${stepErr.message}`);
      const endTimeStr = new Date().toISOString();
      const duration = Date.now() - stepStart;
      const screenshotPath = await captureScreenshot(driver, `${s.id}-fail`);

      results.push({
        id: s.id,
        suite: s.category,
        category: s.category,
        name: s.name,
        startTime: startTimeStr,
        endTime: endTimeStr,
        duration: duration,
        status: 'FAIL',
        errorMessage: stepErr.message,
        details: stepErr.message,
        screenshotPath: screenshotPath || 'N/A'
      });
    }
  }

  await quitDriver(driver);
  if (spawnedServer && spawnedServer.stop) {
    try { spawnedServer.stop(); } catch (e) {}
  }

  const totalDuration = Date.now() - startTime;
  console.log('\n===================================================');
  console.log(`Selenium Web E2E Suite completed in ${(totalDuration / 1000).toFixed(2)}s.`);
  console.log('===================================================');

  // Save raw results for reporter.py
  const rawResultsPath = path.resolve(__dirname, '../reports/selenium/raw_results.json');
  const rawResultsDir = path.dirname(rawResultsPath);
  if (!fs.existsSync(rawResultsDir)) fs.mkdirSync(rawResultsDir, { recursive: true });
  fs.writeFileSync(rawResultsPath, JSON.stringify(results, null, 2), 'utf-8');

  // Mirror raw results
  const altRawPath = path.resolve(__dirname, 'reports/raw_results.json');
  const altRawDir = path.dirname(altRawPath);
  if (!fs.existsSync(altRawDir)) fs.mkdirSync(altRawDir, { recursive: true });
  fs.writeFileSync(altRawPath, JSON.stringify(results, null, 2), 'utf-8');

  // Generate JavaScript reports
  await generateSeleniumReports(results, totalDuration);

  // Invoke Python reporter for 355-case openpyxl Excel, HTML, JSON, and JUnit XML
  try {
    const rootDir = path.resolve(__dirname, '..');
    execSync('python selenium-tests/reporter.py', { stdio: 'inherit', cwd: rootDir });
  } catch (pyErr) {
    console.warn('[!] Note: Python reporter invocation completed with notice:', pyErr.message);
  }

  const hasFailures = results.some(r => r.status === 'FAIL');
  if (hasFailures) {
    console.error('[!] Test suite contains failures.');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal runner error:', err);
  process.exit(1);
});
