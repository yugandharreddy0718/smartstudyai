# SmartStudy AI - E2E Appium Test Suite

This folder contains the complete end-to-end automated UI test suite for the SmartStudy AI Android application using **Appium** (via **WebdriverIO**) and compiles results into a professional **Excel Report**.

---

## What is in this Folder?
1. **`package.json`**: Manages test execution dependencies (`webdriverio`, `exceljs`, `dotenv`).
2. **`run-tests.js`**: The main test automation runner that handles setup, context switching, E2E user-flow interactions, exception handling, and Excel generation.
3. **`appium-test-report.xlsx`**: (Generated after running) A beautiful, styled Excel workbook containing a high-level metadata dashboard, summary cards, and detailed color-coded PASS/FAIL status for each step.

---

## Quick Start (Verification Run)
You can run the script instantly. If no active local Appium server is detected, the script will gracefully fallback to a **Simulation Mode** so you can immediately see the E2E steps and verify the generated Excel Report!

1. Open your terminal in this folder:
   ```bash
   cd appium-tests
   ```
2. Run the test script:
   ```bash
   npm test
   ```
3. Open the newly created `appium-test-report.xlsx` to view the Excel analysis dashboard!

---

## Live Mobile Testing Setup Guide

To run these tests against a real Android device or emulator, follow these steps:

### 1. Prerequisites & Environment Variables
Ensure you have the following installed on your machine:
* **Node.js** (v18+)
* **Java Development Kit (JDK)** (v11+)
* **Android Studio & SDK Command Line Tools**
* Set your environment variable: `ANDROID_HOME` pointing to your Android SDK path (e.g., `C:\Users\<User>\AppData\Local\Android\Sdk`).

### 2. Build the Android APK
Compile the responsive React app and wrap it with Capacitor:
```bash
# In the root project directory
npm run build
npx cap sync
npx cap open android
```
In Android Studio, click **Build > Build Bundle(s) / APK(s) > Build APK(s)** to generate the `app-debug.apk` file.

### 3. Start Appium Server
Install and run Appium globally:
```bash
npm install -g appium
# Install the Android driver (UiAutomator2)
appium driver install uiautomator2

# Start the server on default port 4723
appium
```

### 4. Boot your Device/Emulator
* Start an Android Emulator from Android Studio AVD Manager, or connect a physical Android device via USB with **USB Debugging** enabled.
* Run `adb devices` to verify the connection.

### 5. Run Live Tests
By default, the script looks for the APK in `../android/app/build/outputs/apk/debug/app-debug.apk`. If it is in a different location, set the environment variable:
```powershell
$env:APPIUM_APP_PATH="C:\Path\To\Your\app-debug.apk"
npm test
```
The script will now boot the emulator, install the app, transition into the Capacitor Webview context, run the login, subject, lesson, and AI tutor E2E tests, and output a live report.
