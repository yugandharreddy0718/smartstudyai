import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load backend/.env first, fallback to root .env
const backendEnv = path.resolve(__dirname, '../../.env');
const rootEnv = path.resolve(__dirname, '../../../../.env');

dotenv.config({ path: backendEnv });
dotenv.config({ path: rootEnv });

const geminiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
const firebaseId = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || '';
const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || process.env.VITE_FIREBASE_STORAGE_BUCKET || '';

export const config = {
  port: Number(process.env.PORT) || 3000,
  geminiApiKey: geminiKey,
  firebaseProjectId: firebaseId,
  firebaseStorageBucket: storageBucket,
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || 'noreply@smartstudyai.com'
  }
};

export function printEnvDiagnostics() {
  console.log('==================================================');
  console.log('SMARTSTUDY AI BACKEND ENVIRONMENT DIAGNOSTICS');
  console.log(`PORT: ${config.port}`);
  console.log(`GEMINI_API_KEY: ${config.geminiApiKey ? 'configured' : 'NOT CONFIGURED'}`);
  console.log(`FIREBASE_PROJECT_ID: ${config.firebaseProjectId ? 'configured' : 'NOT CONFIGURED'}`);
  console.log(`FIREBASE_STORAGE_BUCKET: ${config.firebaseStorageBucket ? 'configured' : 'NOT CONFIGURED'}`);
  console.log('==================================================');
}
