# SmartStudy AI — Selenium Web E2E Testing Framework

This isolated directory (`selenium-tests/`) contains the complete enterprise Selenium Web End-to-End Automation Suite for the SmartStudy AI web application.

## Directory Layout

```
selenium-tests/
├── config/
│   └── test.config.js              # Central Test Configuration & Environment Settings
├── drivers/
│   └── driver.js                   # Selenium WebDriver Builder & Chrome Headless Options
├── pages/
│   ├── LoginPage.js                # POM for Welcome & Login Screen
│   ├── RegisterPage.js             # POM for User Registration
│   ├── DashboardPage.js            # POM for Student Dashboard & Grade Selector
│   ├── SubjectPage.js              # POM for Subject Grid
│   ├── ChapterPage.js              # POM for Chapter & Sub-Lesson Exploration
│   ├── LessonPage.js               # POM for 13-Section Pedagogical Layout & Mark Complete
│   ├── AIStudioPage.js             # POM for AI Summary, Q&A, MCQ Generator, Quiz & AI Tutor
│   ├── UploadPage.js               # POM for Document Upload & PDF Reader
│   ├── ProfilePage.js              # POM for Student Profile & Session Logout
│   └── AdminPage.js                # POM for Route Protection Verification
├── reports/
│   ├── screenshots/                # Captured Checkpoint Screenshots
│   ├── selenium-report.xlsx        # Excel Analysis Report (Summary & Details Sheets)
│   └── selenium-report.html        # Interactive HTML Executive Dashboard
├── utils/
│   ├── testData.js                 # Data-Driven Payload Generator
│   ├── screenshots.js              # Screenshot Helper Utility
│   └── excelReporter.js            # ExcelJS & HTML Report Compilation Engine
├── runner.js                       # Master Suite Test Runner
├── package.json                    # Standalone Test Dependencies
└── README.md                       # Execution Documentation
```

## Test Suite Coverage (18 Functional Modules)

1. **Authentication**: Welcome screen UI, Registration options, Protected route redirects
2. **Dashboard**: Subject cards grid rendering
3. **Grade Selection**: Parameterized verification across Class 6, Class 7, Class 8, Class 9, Class 10
4. **Subject Navigation**: Mathematics & Core subjects exploration
5. **Chapter Navigation**: Chapter & sub-lesson catalog navigation
6. **Lesson Navigation**: Sub-lesson detail view opening
7. **Lesson Content**: 13-Section pedagogical layout content check
8. **Lesson Progress**: Mark complete action & +100 XP award tracking
9. **AI Summary**: AI summary generation interface
10. **Important Q&A**: High-yield exam Q&A generator
11. **MCQ Generator**: Standalone MCQ quiz builder
12. **Quiz**: Interactive quiz assessment interface
13. **AI Tutor**: 24/7 AI Tutor chat interface
14. **Upload**: OCR document upload studio
15. **PDF Viewer**: PDF reader & annotation tools
16. **Search**: Index search query execution
17. **Profile**: Student stats overview & logout execution
18. **Security**: Admin route access control protection

## Execution Instructions

```bash
# Execute Complete Selenium Web E2E Suite & Generate Reports
npm run test:selenium

# Generate / View Selenium Reports
npm run report:selenium
```
