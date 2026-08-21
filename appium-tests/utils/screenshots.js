import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function captureScreenshot(driver, name) {
  if (!driver) return null;
  try {
    const reportsDir = path.resolve(__dirname, '../reports/screenshots');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }
    const filename = `${name}_${Date.now()}.png`;
    const filePath = path.join(reportsDir, filename);
    await driver.saveScreenshot(filePath);
    return filePath;
  } catch (e) {
    return null;
  }
}
