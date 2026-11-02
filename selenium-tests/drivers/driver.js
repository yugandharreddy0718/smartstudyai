import { Builder } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import { config } from '../config/test.config.js';

export async function createDriver() {
  const options = new chrome.Options();
  
  if (config.headless) {
    options.addArguments('--headless=new');
  }
  
  options.addArguments(
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--window-size=1920,1080',
    '--remote-allow-origins=*',
    '--disable-extensions',
    '--disable-infobars',
    '--ignore-certificate-errors',
    '--disable-search-engine-choice-screen'
  );

  if (process.env.CHROME_BIN) {
    options.setChromeBinaryPath(process.env.CHROME_BIN);
  }

  const builder = new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options);

  if (process.env.CHROMEDRIVER_PATH) {
    const service = new chrome.ServiceBuilder(process.env.CHROMEDRIVER_PATH);
    builder.setChromeService(service);
  }

  const driver = await builder.build();

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
