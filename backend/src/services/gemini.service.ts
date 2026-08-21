import { GoogleGenAI, Type } from '@google/genai';
import { config } from '../config/env.js';

if (!config.geminiApiKey) {
  console.warn("Warning: GEMINI_API_KEY environment variable is not set.");
}

export const ai = new GoogleGenAI({
  apiKey: config.geminiApiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});
