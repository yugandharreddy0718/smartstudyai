import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const config = {
  platformName: 'Android',
  deviceName: process.env.APPIUM_DEVICE_NAME || 'Android Emulator',
  automationName: 'UiAutomator2',
  appPath: process.env.APPIUM_APP_PATH || path.resolve(__dirname, '../../android/app/build/outputs/apk/debug/app-debug.apk'),
  appPackage: process.env.APPIUM_APP_PACKAGE || 'com.smartstudy.app',
  appActivity: process.env.APPIUM_APP_ACTIVITY || 'com.smartstudy.app.MainActivity',
  host: process.env.APPIUM_HOST || '127.0.0.1',
  port: parseInt(process.env.APPIUM_PORT || '4723', 10),
  implicitTimeout: 10000,
  explicitTimeout: 30000
};
