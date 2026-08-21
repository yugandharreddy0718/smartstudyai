import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const config = {
  runner: 'local',
  port: 4723,
  path: '/',
  specs: [
    '../tests/**/*.js'
  ],
  maxInstances: 1,
  capabilities: [{
    platformName: 'Android',
    'appium:deviceName': process.env.APPIUM_DEVICE_NAME || 'Android Emulator',
    'appium:platformVersion': process.env.APPIUM_PLATFORM_VERSION || '13.0',
    'appium:automationName': 'UiAutomator2',
    'appium:app': process.env.APPIUM_APP_PATH || path.resolve(__dirname, '../../android/app/build/outputs/apk/debug/app-debug.apk'),
    'appium:appPackage': 'com.smartstudy.app',
    'appium:appActivity': 'com.smartstudy.app.MainActivity',
    'appium:noReset': false,
    'appium:autoGrantPermissions': true,
    'appium:newCommandTimeout': 240
  }],
  logLevel: 'error',
  bail: 0,
  waitforTimeout: 10000,
  connectionRetryTimeout: 120000,
  connectionRetryCount: 3,
  services: [],
  framework: 'mocha',
  reporters: ['spec'],
  mochaOpts: {
    ui: 'bdd',
    timeout: 60000
  }
};
