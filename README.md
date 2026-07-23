<div align="center">
  <img width="1200" height="475" alt="SmartStudy AI Banner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />

  # 🎓 SmartStudy AI

  **Enterprise AI-Powered Personal Tutor & Study Suite for K-12 Students**

  [![Enterprise CI/CD Pipeline](https://github.com/yugandharreddy0718/smartstudyai/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/yugandharreddy0718/smartstudyai/actions/workflows/ci-cd.yml)
  [![Unit Tests & Coverage](https://github.com/yugandharreddy0718/smartstudyai/actions/workflows/unit-tests.yml/badge.svg)](https://github.com/yugandharreddy0718/smartstudyai/actions/workflows/unit-tests.yml)
  [![CodeQL Security Scan](https://github.com/yugandharreddy0718/smartstudyai/actions/workflows/codeql.yml/badge.svg)](https://github.com/yugandharreddy0718/smartstudyai/actions/workflows/codeql.yml)
  [![Super-Linter](https://github.com/yugandharreddy0718/smartstudyai/actions/workflows/super-linter.yml/badge.svg)](https://github.com/yugandharreddy0718/smartstudyai/actions/workflows/super-linter.yml)
  [![Security Audit](https://github.com/yugandharreddy0718/smartstudyai/actions/workflows/security.yml/badge.svg)](https://github.com/yugandharreddy0718/smartstudyai/actions/workflows/security.yml)
  [![GitHub Pages Deploy](https://github.com/yugandharreddy0718/smartstudyai/actions/workflows/deploy-and-test.yml/badge.svg)](https://github.com/yugandharreddy0718/smartstudyai/actions/workflows/deploy-and-test.yml)
  [![Coverage](https://img.shields.io/badge/Coverage-92%25-brightgreen.svg)](DEVOPS.md)
  [![Node Version](https://img.shields.io/badge/Node.js-18.x%20%7C%2020.x%20%7C%2022.x-339933?logo=node.js&logoColor=white)](package.json)
  [![Vite](https://img.shields.io/badge/Vite-6.2.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
  [![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=white)](https://react.dev/)
  [![Capacitor](https://img.shields.io/badge/Capacitor-8.4-119EFF?logo=capacitor&logoColor=white)](https://capacitorjs.com/)
  [![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

</div>

---

## 🌟 Overview

**SmartStudy AI** is an intelligent, multi-modal study platform designed for classes 6–10. Powered by Google Gemini 2.5 Flash, it transforms raw notes, textbook photos, and PDFs into structured summaries, interactive quizzes, flashcards, conceptual analogies, and real-time AI tutor conversations.

Detailed DevOps & CI/CD architecture is documented in [DEVOPS.md](DEVOPS.md).

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite 6, Tailwind CSS, Lucide React, Framer Motion |
| **Backend** | Express 4, Node.js 20, ESBuild, Google Gemini 2.5 SDK |
| **Mobile** | Capacitor 8 (Android Studio APK packaging) |
| **Testing** | Vitest, React Testing Library, Selenium Webdriver, Appium (Android) |
| **DevOps** | GitHub Actions, CodeQL, Super-Linter, Dependabot, Gitleaks, GitHub Pages |

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- **Node.js**: v18.x or v20.x or v22.x
- **npm**: v9+

### 2. Installation
```bash
# Clone repository
git clone https://github.com/yugandharreddy0718/smartstudyai.git
cd smartstudyai

# Install dependencies
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```

### 4. Run Application
```bash
# Start development server
npm run dev

# Run Vitest unit test suite
npm test

# Generate code coverage
npm run test:coverage

# TypeScript typecheck
npm run typecheck

# Production build
npm run build
```

---

## 🛡️ DevOps & CI/CD Workflows

For detailed workflow breakdowns, test execution matrices, and report generation details, see [DEVOPS.md](DEVOPS.md).
