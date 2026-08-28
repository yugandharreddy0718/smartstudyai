import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const config = {
  platformName: 'Android',
  deviceName: process.env.APPIUM_DEVICE || process.env.APPIUM_DEVICE_NAME || 'I2305',
  automationName: 'UiAutomator2',
  appPath: process.env.APPIUM_APP_PATH || path.resolve(__dirname, '../../mobile/build/app/outputs/flutter-apk/app-debug.apk'),
  appPackage: process.env.APPIUM_APP_PACKAGE || 'com.smartstudy.ai.smartstudy_mobile',
  appActivity: process.env.APPIUM_APP_ACTIVITY || '.MainActivity',
  host: process.env.APPIUM_HOST || '127.0.0.1',
  port: parseInt(process.env.APPIUM_PORT || '4723', 10),
  implicitTimeout: 10000,
  explicitTimeout: 30000
};
