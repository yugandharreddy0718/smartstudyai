import { remote } from 'webdriverio';
import { config } from '../config/test.config.js';

export async function createDriver() {
  const capabilities = {
    platformName: config.platformName,
    'appium:deviceName': config.deviceName,
    'appium:automationName': config.automationName,
    'appium:app': config.appPath,
    'appium:appPackage': config.appPackage,
    'appium:appActivity': config.appActivity,
    'appium:noReset': false,
    'appium:autoGrantPermissions': true,
    'appium:newCommandTimeout': 300
  };

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
