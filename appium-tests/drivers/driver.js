import { remote } from 'webdriverio';
import fs from 'fs';
import { config } from '../config/test.config.js';

export async function createDriver() {
  const capabilities = {
    platformName: config.platformName,
    'appium:deviceName': config.deviceName,
    'appium:udid': config.udid || '10BF2M16KR003QB',
    'appium:automationName': config.automationName,
    'appium:appPackage': config.appPackage,
    'appium:appActivity': config.appActivity,
    'appium:noReset': true,
    'appium:autoGrantPermissions': true,
    'appium:newCommandTimeout': 300
  };

  if (fs.existsSync(config.appPath)) {
    capabilities['appium:app'] = config.appPath;
  }

  const options = {
    protocol: 'http',
    hostname: config.host,
    port: config.port,
    path: '/',
    capabilities,
    logLevel: 'error'
  };

  return await remote(options);
}

export async function quitDriver(driver) {
  if (driver) {
    try {
      await driver.deleteSession();
    } catch (e) {
      // Ignore cleanup error
    }
  }
}
