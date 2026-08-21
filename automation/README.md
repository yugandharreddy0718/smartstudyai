# SmartStudy AI - E2E Testing Suite (Appium & Selenium)

Welcome to the Enterprise-Grade Automation Framework for the SmartStudy AI platform. This framework supports both **Android Mobile (Appium + WebdriverIO)** and **Web Browser (Selenium WebDriver)** testing, compiling unified results into professional **Excel**, **HTML**, and **JSON** reports.

---

## 📂 Folder Structure

```
automation/
├── config/             # Config files (wdio.conf.js for Appium, selenium.conf.js for Selenium)
├── data/               # Test Case registries (testCases.js for mobile, seleniumTestCases.js for web)
├── pages/              # Page Object Models for both Mobile and Web platforms
├── utils/              # Excel reporters, HTML dashboards, loggers, and screenshot helpers
├── runners/            # Execution runners (testRunner.js for mobile, seleniumTestRunner.js for web)
├── logs/               # Webdriver session logs
└── README.md           # Master Setup and Execution Documentation
```

---

## 💻 1. Web Automation (Selenium) Setup & Running

### A. Local Setup
1. **Node.js**: Ensure Node.js (v18.0.0+) is installed.
2. **Chrome Browser & Driver**:
   * Install Chrome.
   * Ensure `chromedriver` matches your Chrome version. (Modern Selenium 4 manages this automatically, but having `chromedriver` on your system PATH is a safe fallback).
3. **Navigate & Install dependencies**:
   ```bash
   cd automation
   npm install
   ```

### B. Execution
By default, the Selenium runner targets the live deployment URL. You can specify a different base URL using the `BASE_URL` environment variable:

* **Default Live Run:**
  ```bash
  npm run test-selenium
  ```
* **Custom URL (PowerShell):**
  ```powershell
  $env:BASE_URL="http://localhost:3000/"
  npm run test-selenium
  ```
* **Custom URL (macOS/Linux):**
  ```bash
  BASE_URL="http://localhost:3000/" npm run test-selenium
  ```

*Note: If no chrome driver is found locally, the runner falls back to **Simulation Mode** so reports can still be verified instantly.*

---

## 📱 2. Mobile Automation (Appium) Setup & Running

### A. Local Setup
1. **JDK 17 & Android SDK**: Set up Java JDK and configure AVD manager.
2. **Environment Paths**: Set `ANDROID_HOME` to your SDK location.
3. **Capacitor Build**:
   ```bash
   npm run build
   npx cap sync
   npx cap open android
   ```
   Compile the APK inside Android Studio: **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
4. **Appium server**:
   ```bash
   npm install -g appium
   appium driver install uiautomator2
   appium
   ```

### B. Execution
Ensure your emulator is active and run:
```bash
cd automation
npm test
```

---

## 🤖 3. CI/CD Pipelines (GitHub Actions)

We have configured two primary enterprise workflows under `.github/workflows/`:

1. **`deploy-and-test.yml` (Web E2E):**
   * Automatically triggered on push to `main` / `master`.
   * Builds the React application with asset bases pointing to the subfolder.
   * Deploys the static assets to the `gh-pages` branch.
   * Polls the live Page URL until it returns HTTP 200.
   * Runs the 440 Selenium test cases against the live Pages site.
   * Uploads reports to Actions artifacts (30 days retention).
   * Deploys reports under `/reports/latest/` and `/reports/history/build-N/` in the `gh-pages` branch.
2. **`android-e2e.yml` (Mobile E2E):**
   * Compiles the debug APK, boots a hardware-accelerated macOS emulator, starts Appium, installs the app, runs E2E tests, and uploads results.

---

## 🛠️ 4. Troubleshooting Guide

### A. Chromedriver version mismatch
* **Error:** `SessionNotCreatedError: session not created: This version of ChromeDriver only supports Chrome version X`
* **Resolution:** Upgrade your local Chrome browser to match your driver, or let Selenium 4 auto-manager handle driver resolution by clearing old `chromedriver` files from your system path.

### B. Web App displays a blank screen on GitHub Pages
* **Error:** Main page loads, but JS/CSS console errors report `404 Not Found` for asset scripts.
* **Resolution:** Ensure the app is built using the correct base path parameter: `npm run build -- --base=/<repository-name>/`. This routes asset locations to the repository subdirectory.

### C. GITHUB_TOKEN Permission Denied during Pages deployment
* **Error:** `Action failed: Permission to repository denied.`
* **Resolution:**
  1. Navigate to **Settings > Actions > General**.
  2. Under **Workflow permissions**, choose **Read and write permissions**. Click **Save**.
