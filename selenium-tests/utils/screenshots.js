import fs from 'fs';
import path from 'path';
import { config } from '../config/test.config.js';

export async function captureScreenshot(driver, fileName) {
  try {
    if (!fs.existsSync(config.screenshotsDir)) {
      fs.mkdirSync(config.screenshotsDir, { recursive: true });
    }

    const safeName = fileName.replace(/[^a-z0-9_-]/gi, '_').toLowerCase() + '.png';
    const filePath = path.join(config.screenshotsDir, safeName);

    if (driver) {
      const screenshotBase64 = await driver.takeScreenshot();
      fs.writeFileSync(filePath, screenshotBase64, 'base64');
      return filePath;
    }
  } catch (err) {
    console.error(`Failed to capture screenshot (${fileName}):`, err.message);
  }
  return null;
}
