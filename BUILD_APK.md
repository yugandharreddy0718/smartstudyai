# Guide: Run on Mobile & Build APK for SmartStudy AI

To run and test the SmartStudy AI app on your phone, you have two options depending on whether you want an instant preview or a standalone installable Android package (.apk).

---

## Option 1: Run instantly on your phone (No Build Required) ⚡

Since your development server is running on your computer, you can open it directly on your mobile device as long as they are connected to the same Wi-Fi network:

1. Connect your mobile phone to the **same Wi-Fi network** as your computer.
2. Open the web browser on your phone and navigate to:
   ```
   http://172.23.22.107:3000
   ```
3. The app is fully responsive and will display the mobile-optimized interface directly.

---

## Option 2: Build a native Android APK (.apk) 📱

Since the current mobile app is a responsive React/Vite web application, you can use **Capacitor** (the modern tool for wrapping web apps into native apps) to compile it into a real Android APK.

### Prerequisites
- [Android Studio](https://developer.android.com/studio) installed on your computer.
- [Node.js](https://nodejs.org/) installed.

### Step 1: Install Capacitor
In your terminal, navigate to the project directory and run:
```bash
npm install @capacitor/core @capacitor/cli
```

### Step 2: Initialize Capacitor
Initialize Capacitor with your app name and package ID:
```bash
npx cap init SmartStudyAI com.smartstudy.app --web-dir=dist
```

### Step 3: Build your React App
Compile the optimized production bundle of your React app:
```bash
npm run build
```

### Step 4: Add the Android Platform
Install the Capacitor Android library and add it to your project:
```bash
npm install @capacitor/android
npx cap add android
```
This will generate a native `android` folder in your project directory containing a fully-configured Gradle/Android project.

### Step 5: Sync the web build with Android
Copy your built web assets into the Android native directory:
```bash
npx cap sync
```

### Step 6: Build the APK using Android Studio
1. Open the project in Android Studio by running:
   ```bash
   npx cap open android
   ```
   *(Or manually open the `android` folder inside Android Studio).*
2. Wait for Gradle to finish indexing the project.
3. In Android Studio's top menu, click:
   **Build > Build Bundle(s) / APK(s) > Build APK(s)**
4. Once completed, a popup will appear at the bottom right. Click **Locate** to find your compiled `app-debug.apk` file.
5. Transfer this `.apk` to your phone and install it!
