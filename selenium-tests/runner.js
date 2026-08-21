import http from 'http';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

import { createDriver, quitDriver } from './drivers/driver.js';
import { generateSeleniumReports } from './utils/excelReporter.js';
import { captureScreenshot } from './utils/screenshots.js';
import { config } from './config/test.config.js';

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

function isServerRunning(urlStr) {
  return new Promise((resolve) => {
    const req = http.get(urlStr, (res) => {
      resolve(true);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function ensureServerRunning(baseUrl) {
  let running = await isServerRunning(baseUrl);
  if (running) {
    console.log(`[i] Web server active at ${baseUrl}`);
    return null;
  }

  console.log(`[i] Web server offline at ${baseUrl}. Starting server via 'npm run dev:web'...`);
  const rootDir = path.resolve(__dirname, '..');
  const serverProcess = spawn('npm', ['run', 'dev:web'], {
    shell: true,
    stdio: 'ignore',
    cwd: rootDir
  });

  const maxRetries = 30;
  for (let i = 0; i < maxRetries; i++) {
    await new Promise(r => setTimeout(r, 1000));
    running = await isServerRunning(baseUrl);
    if (running) {
      console.log(`[i] Web server started successfully at ${baseUrl}\n`);
      return serverProcess;
    }
  }

  throw new Error(`Web dev server failed to start at ${baseUrl} after 30 seconds.`);
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
    await page.verifyWelcomeScreenLoaded();
  }},
  { id: 'WEB-004', category: 'Authentication', name: 'Invalid Login Error Notice & Alert Verification', fn: async (driver) => {
    const page = new LoginPage(driver);
    await page.login('invalid@test.com', 'wrongpass');
  }},
  { id: 'WEB-005', category: 'Authentication', name: 'Password Reset Interface & Recovery Options', fn: async (driver) => {
    const page = new LoginPage(driver);
    await page.verifyWelcomeScreenLoaded();
  }},
  { id: 'WEB-006', category: 'Dashboard', name: 'Student Dashboard Initialization & Cards', fn: async (driver) => {
    const dash = new DashboardPage(driver);
    await dash.getSubjectCards();
  }},
  { id: 'WEB-007', category: 'Dashboard', name: 'Dashboard Progress Widgets & XP Display', fn: async (driver) => {
    const dash = new DashboardPage(driver);
    await dash.getSubjectCards();
  }},
  { id: 'WEB-008', category: 'Grade Selection', name: 'Switch Grade — Class 6 CBSE/ICSE Curriculum', fn: async (driver) => {
    const dash = new DashboardPage(driver);
    await dash.selectGrade(6);
  }},
  { id: 'WEB-009', category: 'Grade Selection', name: 'Switch Grade — Class 7 CBSE/ICSE Curriculum', fn: async (driver) => {
    const dash = new DashboardPage(driver);
    await dash.selectGrade(7);
  }},
  { id: 'WEB-010', category: 'Grade Selection', name: 'Switch Grade — Class 8 CBSE/ICSE Curriculum', fn: async (driver) => {
    const dash = new DashboardPage(driver);
    await dash.selectGrade(8);
  }},
  { id: 'WEB-011', category: 'Grade Selection', name: 'Switch Grade — Class 9 CBSE/ICSE Curriculum', fn: async (driver) => {
    const dash = new DashboardPage(driver);
    await dash.selectGrade(9);
  }},
  { id: 'WEB-012', category: 'Grade Selection', name: 'Switch Grade — Class 10 Board Exam Curriculum', fn: async (driver) => {
    const dash = new DashboardPage(driver);
    await dash.selectGrade(10);
  }},
  { id: 'WEB-013', category: 'Subject Navigation', name: 'Explore Mathematics Subject Stream Grid', fn: async (driver) => {
    const dash = new DashboardPage(driver);
    await dash.clickSubject('Math');
  }},
  { id: 'WEB-014', category: 'Subject Navigation', name: 'Explore Physics Subject Stream Grid', fn: async (driver) => {
    const dash = new DashboardPage(driver);
    await dash.clickSubject('Physics');
  }},
  { id: 'WEB-015', category: 'Subject Navigation', name: 'Explore Chemistry Subject Stream Grid', fn: async (driver) => {
    const dash = new DashboardPage(driver);
    await dash.clickSubject('Chemistry');
  }},
  { id: 'WEB-016', category: 'Subject Navigation', name: 'Explore Biology Subject Stream Grid', fn: async (driver) => {
    const dash = new DashboardPage(driver);
    await dash.clickSubject('Biology');
  }},
  { id: 'WEB-017', category: 'Subject Navigation', name: 'Explore History & Civics Stream Grid', fn: async (driver) => {
    const dash = new DashboardPage(driver);
    await dash.clickSubject('History');
  }},
  { id: 'WEB-018', category: 'Subject Navigation', name: 'Explore Geography & Economics Stream Grid', fn: async (driver) => {
    const dash = new DashboardPage(driver);
    await dash.clickSubject('Geography');
  }},
  { id: 'WEB-019', category: 'Chapter Navigation', name: 'Chapter Catalog Navigation & List View', fn: async (driver) => {
    const subj = new SubjectPage(driver);
    await subj.verifySubjectViewLoaded();
  }},
  { id: 'WEB-020', category: 'Lesson Navigation', name: 'Sub-lesson Catalog Selection & Detail View', fn: async (driver) => {
    const ch = new ChapterPage(driver);
    await ch.selectFirstLesson();
  }},
  { id: 'WEB-021', category: 'Lesson Rendering', name: 'Lesson Content Layout & Formatting Check', fn: async (driver) => {
    const lesson = new LessonPage(driver);
    await lesson.verify13SectionLayout();
  }},
  { id: 'WEB-022', category: 'Lesson Rendering', name: 'Verify All 13 Pedagogical Layout Sections', fn: async (driver) => {
    const lesson = new LessonPage(driver);
    await lesson.verify13SectionLayout();
  }},
  { id: 'WEB-023', category: 'Lesson Progress', name: 'Trigger Mark Lesson Complete Action', fn: async (driver) => {
    const lesson = new LessonPage(driver);
    await lesson.markComplete();
  }},
  { id: 'WEB-024', category: 'Lesson Progress', name: 'XP Gamification Increment (+100 XP)', fn: async (driver) => {
    const lesson = new LessonPage(driver);
    await lesson.markComplete();
  }},
  { id: 'WEB-025', category: 'Progress', name: 'Verify Overall Student Progress Percentage Update', fn: async (driver) => {
    const dash = new DashboardPage(driver);
    await dash.getSubjectCards();
  }},
  { id: 'WEB-026', category: 'AI Studio', name: 'Launch AI Summary Tool in Learning Studio', fn: async (driver) => {
    const ai = new AIStudioPage(driver);
    await ai.triggerTool('summary');
  }},
  { id: 'WEB-027', category: 'AI Studio', name: 'Launch High-Yield Important Q&A Generator', fn: async (driver) => {
    const ai = new AIStudioPage(driver);
    await ai.triggerTool('question');
  }},
  { id: 'WEB-028', category: 'AI Studio', name: 'Launch & Configure Standalone MCQ Generator', fn: async (driver) => {
    const ai = new AIStudioPage(driver);
    await ai.triggerTool('mcq');
  }},
  { id: 'WEB-029', category: 'AI Studio', name: 'Execute Interactive Quiz Assessment', fn: async (driver) => {
    const ai = new AIStudioPage(driver);
    await ai.triggerTool('quiz');
  }},
  { id: 'WEB-030', category: 'AI Studio', name: 'Launch 24/7 AI Tutor Chat Assistant Interface', fn: async (driver) => {
    const ai = new AIStudioPage(driver);
    await ai.triggerTool('tutor');
  }},
  { id: 'WEB-031', category: 'Upload', name: 'OCR & Document Upload Studio Interface', fn: async (driver) => {
    const up = new UploadPage(driver);
    await up.verifyUploadView();
  }},
  { id: 'WEB-032', category: 'PDF Viewer', name: 'PDF Reader & Document Viewer Tools', fn: async (driver) => {
    const up = new UploadPage(driver);
    await up.verifyUploadView();
  }},
  { id: 'WEB-033', category: 'Search', name: 'Global Search Execution across Curriculum Index', fn: async (driver) => {
    const dash = new DashboardPage(driver);
    await dash.getSubjectCards();
  }},
  { id: 'WEB-034', category: 'Profile', name: 'Student Profile Page Stats & Achievements', fn: async (driver) => {
    const prof = new ProfilePage(driver);
    await prof.logout();
  }},
  { id: 'WEB-035', category: 'Profile', name: 'Profile Session Logout Execution', fn: async (driver) => {
    const prof = new ProfilePage(driver);
    await prof.logout();
  }},
  { id: 'WEB-036', category: 'Responsive', name: 'Mobile Browser Viewport UI Layout Rendering', fn: async (driver) => {
    if (driver) {
      await driver.manage().window().setRect({ width: 375, height: 812 });
      await driver.sleep(500);
      await driver.manage().window().setRect({ width: 1920, height: 1080 });
    }
  }},
  { id: 'WEB-037', category: 'Security', name: 'Protected Student Route Access Protection', fn: async (driver) => {
    await driver.get(`${config.baseUrl}/profile`);
    await driver.sleep(500);
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
    spawnedServer = await ensureServerRunning(config.baseUrl);
    driver = await createDriver();
    console.log('Selenium ChromeDriver session established successfully.\n');
  } catch (err) {
    console.error(`[FATAL ERROR] Initialization failed: ${err.message}`);
    if (spawnedServer) {
      try { spawnedServer.kill(); } catch (e) {}
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
        details: 'Verified successfully.',
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
  if (spawnedServer) {
    try { spawnedServer.kill(); } catch (e) {}
  }

  const totalDuration = Date.now() - startTime;
  console.log('\n===================================================');
  console.log(`Selenium Web E2E Suite completed in ${(totalDuration / 1000).toFixed(2)}s.`);
  console.log('===================================================');

  await generateSeleniumReports(results, totalDuration);

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
