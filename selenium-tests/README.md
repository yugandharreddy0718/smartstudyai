# SmartStudy AI — Selenium Web E2E Automation Test Suite

This directory (`selenium-tests/`) contains the complete Node.js Selenium Web End-to-End Automation Suite for the SmartStudy AI Web Application.

## Test Workflow Coverage

1. **WS-001**: Launch Web Application & Verify Title
2. **WS-002**: Authentication & Welcome Screen UI Verification
3. **WS-003**: Student Profile & Grade Selection (Classes 6–10)
4. **WS-004**: Subject Grid & Navigation (6 Core Subjects)
5. **WS-005**: Chapter List & Sub-Lesson Exploration
6. **WS-006**: 13-Section Pedagogical Lesson Content Verification
7. **WS-007**: Learning Studio & AI Tools (Summary, Q&A, MCQ Generator, Quiz, AI Tutor)
8. **WS-008**: Mark Lesson Complete & XP / Progress Tracking (+100 XP)
9. **WS-009**: Profile View & Session Logout Execution

## Generated Excel Analysis Report

The runner automatically generates a formatted Excel report (`selenium-test-report.xlsx`) containing:
- **Title Banner**: Styled header block
- **Metadata Cards**: Execution date, target URL, and execution mode
- **Summary Cards**: Total Steps, Passed, Failed, Success Rate %, Total Duration
- **Detailed Results Table**: Step ID, Name, Status (PASS green / FAIL red), Duration (ms), Timestamp, Details

Reports are saved to:
- `selenium-tests/selenium-test-report.xlsx`
- `Test Results/Web/selenium-test-report.xlsx`
- `Test Results/Excel/selenium-test-report.xlsx`

## Execution Instructions

```bash
# Navigate to the selenium-tests directory
cd selenium-tests

# Run Selenium E2E Web Test Suite & Generate Excel Report
node run-tests.js
```
