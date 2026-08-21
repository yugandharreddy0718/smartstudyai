import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logDir = path.resolve(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}
const logFile = path.join(logDir, 'automation.log');

// Clear existing log file on start
try {
  fs.writeFileSync(logFile, '');
} catch (e) {
  // Silent fail
}

export function log(msg, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logMsg = `[${timestamp}] [${level}] ${msg}`;
  console.log(logMsg);
  
  try {
    fs.appendFileSync(logFile, logMsg + '\n');
  } catch (e) {
    // Silent fail
  }
}

export function info(msg) {
  log(msg, 'INFO');
}

export function warn(msg) {
  log(msg, 'WARN');
}

export function error(msg) {
  log(msg, 'ERROR');
}
