# SmartStudy AI — Standalone Selenium Web Application E2E Framework

This isolated directory (`selenium-tests/`) contains the complete **Selenium Web Application E2E Automation Framework** for SmartStudy AI.

---

## 📁 Directory Structure

```text
selenium-tests/
├── tests/
│   ├── authentication/
│   │   └── auth.test.js            # Auth & Registration Specs
│   ├── dashboard/
│   │   └── dashboard.test.js       # Dashboard & Grade Selector Specs
│   ├── curriculum/
│   │   └── curriculum.test.js      # Classes 6-10 & Subject Stream Specs
│   ├── lessons/
│   │   └── lessons.test.js         # 13 Pedagogical Layout & Progress Specs
│   ├── ai-studio/
│   │   └── aiStudio.test.js        # Summary, Q&A, MCQ, Quiz, Tutor Specs
│   ├── progress/
│   │   └── progress.test.js        # XP & Progress Tracker Specs
│   ├── profile/
│   │   └── profile.test.js         # Profile & Logout Specs
│   ├── search/
│   │   └── search.test.js          # Search Specs
│   └── security/
│       └── security.test.js        # Route & Role Protection Specs
├── config/
│   └── test.config.js              # Environment & Chrome Headless Settings
├── drivers/
│   └── driver.js                   # Selenium WebDriver Manager
├── pages/
│   ├── LoginPage.js                # POM for Login & Welcome
│   ├── RegisterPage.js             # POM for Registration
│   ├── DashboardPage.js            # POM for Dashboard & Grade Selector
│   ├── SubjectPage.js              # POM for Subject Grid
│   ├── ChapterPage.js              # POM for Chapter Catalog
│   ├── LessonPage.js               # POM for 13-Section Layout & XP
│   ├── AIStudioPage.js             # POM for AI Tools
│   ├── UploadPage.js               # POM for Upload & PDF Viewer
│   ├── ProfilePage.js              # POM for Profile & Logout
│   └── AdminPage.js                # POM for Admin Route Security
├── reports/
│   ├── index.html                  # Executive HTML Dashboard
│   └── selenium-report.html
├── excel/
│   └── selenium-report.xlsx        # 3-Sheet Excel Analysis Report
├── screenshots/                    # Failure Image Captures
├── logs/                           # Summary Execution Logs
├── runner.js                       # Master Runner (40 E2E Web Tests)
├── package.json                    # Standalone Dependencies
└── README.md                       # Documentation
```

---

## 🚀 Execution Commands

Run the full Selenium Web E2E Suite from the root directory:

```bash
# Main Web E2E Test Execution
npm run test:selenium

# View Reports Info
npm run report:selenium
```

---

## 📊 Deliverables & Output Paths

After suite execution, report artifacts are saved in:
- **Excel Analysis (3 Worksheets):** `selenium-tests/excel/selenium-report.xlsx` & `Test Results/Web/excel/selenium-report.xlsx`
- **Interactive HTML Dashboard:** `selenium-tests/reports/index.html` & `Test Results/Web/reports/latest/index.html`
- **Screenshots:** `selenium-tests/screenshots/` & `Test Results/Web/screenshots/`
- **Execution Summary Log:** `selenium-tests/logs/summary.md` & `Test Results/Web/logs/summary.md`
