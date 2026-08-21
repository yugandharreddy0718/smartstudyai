import { Builder } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import { config } from '../config/test.config.js';

export async function createDriver() {
  const options = new chrome.Options();
  
  if (config.headless) {
    options.addArguments('--headless=new');
  }
  
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--disable-gpu');
  options.addArguments('--window-size=1920,1080');
  options.addArguments('--remote-allow-origins=*');

  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  await driver.manage().setTimeouts({
    implicit: config.implicitWait,
    pageLoad: 30000,
    script: 30000
  });

  return driver;
}

export async function quitDriver(driver) {
  if (driver) {
    try {
      await driver.quit();
    } catch (e) {
      console.error('Error shutting down Selenium WebDriver:', e.message);
    }
  }
}
