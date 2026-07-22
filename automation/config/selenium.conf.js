import chrome from 'selenium-webdriver/chrome.js';

export function getChromeOptions() {
  const options = new chrome.Options();
  
  // Use modern headless browser arguments suitable for docker/ci containers
  options.addArguments('--headless=new');
  options.addArguments('--disable-gpu');
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--window-size=1920,1080');
  options.excludeSwitches('enable-logging');
  
  return options;
}

export const config = {
  baseUrl: process.env.BASE_URL || 'https://yugandharreddy0718.github.io/smartstudyai/',
  defaultTimeout: 15000
};
