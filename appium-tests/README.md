# SmartStudy AI — Standalone Appium Android Mobile E2E Testing Framework

This isolated directory (`appium-tests/`) contains the complete **Appium Android Mobile E2E Automation Framework** for SmartStudy AI.

---

## 📁 Directory Structure

```text
appium-tests/
├── config/
│   └── test.config.js              # Appium Host, Port, Capabilities & Timeout Settings
├── drivers/
│   └── driver.js                   # WebdriverIO Session Setup & Lifecycle Manager
├── pages/
│   ├── LoginPage.js                # POM for Login & Authentication
│   ├── RegisterPage.js             # POM for Mobile Registration Flow
│   ├── DashboardPage.js            # POM for Student Dashboard & Grade Selector
│   ├── SubjectPage.js              # POM for Subject Grid
│   ├── ChapterPage.js              # POM for Chapter & Sub-Lesson Catalog
│   ├── LessonPage.js               # POM for 13-Section Pedagogical Layout & Progress
│   ├── AIStudioPage.js             # POM for AI Tools (Summary, Q&A, MCQ, Quiz, Tutor)
│   ├── UploadPage.js               # POM for Mobile Document Upload & PDF Reader
│   ├── ProfilePage.js              # POM for Student Profile Stats & Session Logout
│   └── AdminPage.js                # POM for Admin Route Access Security Control
├── reports/
│   ├── screenshots/                # Failure & Checkpoint Image Captures
│   ├── appium-report.xlsx          # Multi-sheet Excel Analysis Report (Summary + Details)
│   └── appium-report.html          # Interactive HTML Executive Dashboard
├── utils/
│   ├── testData.js                 # Data-driven Test Payloads
│   ├── screenshots.js              # Screenshot Helper Utility
│   └── excelReporter.js            # ExcelJS Spreadsheet & HTML Report Compiler
├── .env.example                    # Environment Blueprint
├── package.json                    # Standalone Appium Dependencies
├── runner.js                       # Master Suite Runner (25 Test Checkpoints)
└── README.md                       # Suite Documentation
```

---

## 🚀 Execution Commands

Run the full Appium E2E Android Mobile Suite from the root directory:

```bash
# Main execution command
npm run test:appium

# View generated reports location
npm run report:appium
```

---

## 📊 Report Artifacts

After suite execution, reports are compiled automatically:
- **Excel Spreadsheet:** `appium-tests/reports/appium-report.xlsx`
- **Interactive HTML Dashboard:** `appium-tests/reports/appium-report.html`
- **Screenshots:** `appium-tests/reports/screenshots/`
- **Synced Copy:** `Test Results/Mobile/appium-report.xlsx` & `appium-report.html`
