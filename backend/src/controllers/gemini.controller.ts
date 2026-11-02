import { Request, Response } from 'express';
import { Type } from '@google/genai';
import { ai } from '../services/gemini.service.js';
import { config } from '../config/env.js';
import zlib from 'zlib';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdfParseModule = require('pdf-parse');
const { PDFParse } = pdfParseModule || {};

async function callGeminiWithRetry<T>(fn: () => Promise<T>, maxRetries = 2): Promise<T> {
  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      return await fn();
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      const isDailyQuota = errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('Quota exceeded') || errMsg.includes('rate-limits') || errMsg.includes('FreeTier');
      if (isDailyQuota) {
        console.warn('[GEMINI API] Quota exhausted or rate limit hit. Returning immediately without retrying.');
        throw err;
      }
      
      if (attempt < maxRetries) {
        attempt++;
        console.warn(`[GEMINI API] Error encountered: ${errMsg}. Retrying attempt ${attempt}/${maxRetries}...`);
        await new Promise(resolve => setTimeout(resolve, 2000 * attempt)); // Exponential backoff
        continue;
      }
      
      throw err;
    }
  }
  throw new Error("Retry loop exhausted");
}

function handleGeminiError(res: Response, error: any, defaultMessage: string) {
  console.error(`[GEMINI ERROR] ${defaultMessage}:`, error?.message || error);
  const errMsg = error?.message || String(error);
  const isQuota = errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsg.includes('Quota exceeded') || errMsg.includes('rate-limits') || errMsg.includes('FreeTier');

  if (isQuota) {
    return res.status(429).json({
      success: false,
      code: 'AI_QUOTA_EXHAUSTED',
      error: 'AI daily quota has been exhausted. Please try again later.'
    });
  }

  return res.status(500).json({
    success: false,
    error: errMsg || defaultMessage
  });
}

export const generateSummary = async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ success: false, error: 'Text content is required' });
    }
    const response = await callGeminiWithRetry(() => ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze this educational content and provide a structured summary including: Key Points, Important Concepts, Easy Explanation, and Exam Prep Notes. Output in Markdown format. \n\n Content: ${text}`,
    }));
    const outText = response.text || '';
    res.json({ success: true, result: outText, text: outText, summary: outText });
  } catch (error: any) {
    return handleGeminiError(res, error, 'Error generating summary');
  }
};

function extractTextFromDocx(buffer: Buffer): string {
  try {
    let pos = 0;
    while (pos < buffer.length - 30) {
      if (buffer[pos] === 0x50 && buffer[pos + 1] === 0x4b && buffer[pos + 2] === 0x03 && buffer[pos + 3] === 0x04) {
        const compressionMethod = buffer.readUInt16LE(pos + 8);
        const compressedSize = buffer.readUInt32LE(pos + 18);
        const fileNameLength = buffer.readUInt16LE(pos + 26);
        const extraFieldLength = buffer.readUInt16LE(pos + 28);

        const fileName = buffer.toString('utf8', pos + 30, pos + 30 + fileNameLength);
        const dataOffset = pos + 30 + fileNameLength + extraFieldLength;

        if (fileName === 'word/document.xml') {
          const compressedData = buffer.subarray(dataOffset, dataOffset + compressedSize);
          let xmlContent = '';
          if (compressionMethod === 8) {
            xmlContent = zlib.inflateRawSync(compressedData).toString('utf8');
          } else if (compressionMethod === 0) {
            xmlContent = compressedData.toString('utf8');
          }

          if (xmlContent) {
            const wtRegex = /<w:t[^>]*>(.*?)<\/w:t>/g;
            let match;
            const pieces: string[] = [];
            while ((match = wtRegex.exec(xmlContent)) !== null) {
              if (match[1]) {
                pieces.push(
                  match[1]
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&amp;/g, '&')
                    .replace(/&quot;/g, '"')
                    .replace(/&apos;/g, "'")
                );
              }
            }
            return pieces.join(' ');
          }
        }
        pos = dataOffset + compressedSize;
      } else {
        pos++;
      }
    }
  } catch (err) {
    console.error('Error parsing docx zip:', err);
  }

  try {
    const rawStr = buffer.toString('utf8');
    const printable = rawStr.replace(/[^\x20-\x7E\n\r\t]/g, ' ').replace(/\s+/g, ' ');
    if (printable.trim().length > 30) {
      return printable.trim();
    }
  } catch (e) {}

  return '';
}

export const generateMultimodal = async (req: Request, res: Response) => {
  try {
    const { fileData } = req.body;
    if (!fileData || !fileData.data || !fileData.mimeType) {
      return res.status(400).json({ success: false, error: 'fileData with data and mimeType is required' });
    }

    const mime = String(fileData.mimeType).toLowerCase();
    const fileName = req.body.fileName ? String(req.body.fileName).toLowerCase() : '';
    const buffer = Buffer.from(fileData.data, 'base64');

    if (!buffer || buffer.length === 0) {
      return res.status(400).json({ success: false, error: 'Uploaded file is empty (0 bytes)' });
    }

    const isMagicPdf = buffer.length >= 4 && buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46;
    const isPdf = mime.includes('pdf') || fileName.endsWith('.pdf') || isMagicPdf;
    const isDocx = mime.includes('wordprocessingml') || mime.includes('officedocument') || mime.includes('msword') || mime.includes('docx') || mime.includes('doc');
    const isText = mime.includes('text/') || mime.includes('plain') || mime.includes('markdown');

    // 1. If PDF file: extract text using pdf-parse locally WITHOUT hitting Gemini
    if (isPdf) {
      try {
        let rawText = '';
        if (typeof PDFParse === 'function') {
          const uint8 = new Uint8Array(buffer);
          const parser = new PDFParse(uint8);
          const pdfRes = await parser.getText();
          rawText = (pdfRes && pdfRes.text) ? pdfRes.text.trim() : '';
        } else if (typeof pdfParseModule === 'function') {
          const pdfData = await pdfParseModule(buffer);
          rawText = (pdfData && pdfData.text) ? pdfData.text.trim() : '';
        }

        const cleanChars = rawText.replace(/[^a-zA-Z0-9]/g, '');
        if (cleanChars.length >= 3) {
          console.log(`[PDF EXTRACTION] Native pdf-parse extracted ${rawText.length} characters successfully without hitting Gemini API.`);
          return res.json({
            success: true,
            source: 'pdf-parse',
            text: rawText,
            result: rawText,
            extractedText: rawText,
            textLength: rawText.length
          });
        } else {
          console.warn('[PDF EXTRACTION] Native pdf-parse extracted 0 readable text words. Scanned/image PDF detected.');
          return res.status(400).json({
            success: false,
            code: 'PDF_TEXT_EXTRACTION_EMPTY',
            error: 'This PDF does not contain extractable text. It may be a scanned/image-only PDF.'
          });
        }
      } catch (pdfErr: any) {
        console.warn('[PDF EXTRACTION] Native pdf-parse failed:', pdfErr?.message);
        return res.status(400).json({
          success: false,
          code: 'PDF_TEXT_EXTRACTION_EMPTY',
          error: 'This PDF does not contain extractable text. It may be a scanned/image-only PDF.'
        });
      }
    }

    // 2. Handle DOCX / Word files or Text files directly without hitting Gemini for text OCR
    if (isDocx || isText) {
      let extractedText = '';
      if (isDocx) {
        extractedText = extractTextFromDocx(buffer);
      } else {
        extractedText = buffer.toString('utf8');
      }

      if (extractedText.trim().length > 0) {
        return res.json({
          success: true,
          source: 'text-extractor',
          text: extractedText.trim(),
          result: extractedText.trim(),
          extractedText: extractedText.trim(),
          textLength: extractedText.trim().length
        });
      } else {
        return res.status(400).json({
          success: false,
          code: 'DOCUMENT_TEXT_EMPTY',
          error: 'No readable text was extracted from this file.'
        });
      }
    }

    // 3. Image OCR via Gemini Multimodal inlineData
    if (!config.geminiApiKey) {
      return res.status(500).json({ success: false, error: 'GEMINI_API_KEY is not configured on the backend server' });
    }

    const promptText = `You are an expert AI learning assistant. Perform OCR on this uploaded textbook image/notes page. Extract all handwritten or printed text verbatim.`;

    try {
      const response = await callGeminiWithRetry(() => ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            inlineData: {
              mimeType: fileData.mimeType,
              data: fileData.data,
            }
          },
          {
            text: promptText
          }
        ]
      }));

      const outText = response.text || '';
      return res.json({
        success: true,
        source: 'gemini-ocr',
        result: outText,
        text: outText,
        extractedText: outText,
        textLength: outText.length
      });
    } catch (inlineErr: any) {
      return handleGeminiError(res, inlineErr, 'Error in Multimodal OCR');
    }
  } catch (error: any) {
    return handleGeminiError(res, error, 'Error processing multimodal upload');
  }
};

export const generateQuiz = async (req: Request, res: Response) => {
  try {
    const { text, count = 5, difficulty = 'medium' } = req.body;
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ success: false, error: 'Text content is required' });
    }

    const numCount = Math.min(Math.max(Number(count) || 5, 1), 20);
    const validDifficulties = ['easy', 'medium', 'hard', 'mixed'];
    const selectedDifficulty = validDifficulties.includes(String(difficulty).toLowerCase())
      ? String(difficulty).toLowerCase()
      : 'medium';

    const response = await callGeminiWithRetry(() => ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a multiple-choice quiz with ${numCount} questions at ${selectedDifficulty} difficulty level based strictly on this content. 
Each question MUST have exactly 4 options. 
Include 'correctAnswer' as the 0-based integer index (0, 1, 2, or 3) pointing to the correct option in the options array.
Include a clear, educational explanation for why that option is correct.

Content: ${text}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.INTEGER },
              explanation: { type: Type.STRING }
            },
            required: ['question', 'options', 'correctAnswer', 'explanation']
          }
        }
      }
    }));

    const rawQuestions = JSON.parse(response.text || '[]');
    
    // Normalize response to ensure clean 0-based index for correctAnswer and 4 options
    const normalized = rawQuestions.map((q: any) => {
      const options = Array.isArray(q.options) && q.options.length > 0 ? q.options : ['Option A', 'Option B', 'Option C', 'Option D'];
      let idx = typeof q.correctAnswer === 'number' ? q.correctAnswer : 0;
      if (typeof q.correctAnswer === 'string') {
        const found = options.findIndex((opt: string) => opt.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase());
        idx = found !== -1 ? found : 0;
      }
      if (idx < 0 || idx >= options.length) idx = 0;

      return {
        question: q.question || 'Question',
        options,
        correctAnswer: idx,
        explanation: q.explanation || 'No explanation provided.'
      };
    });

    res.json({ result: normalized });
  } catch (error: any) {
    return handleGeminiError(res, error, 'Error generating quiz');
  }
};

export const generateFlashcards = async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    const response = await callGeminiWithRetry(() => ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate 5 flashcards for this content. Each flashcard should have a 'front' (question/term) and a 'back' (answer/definition). \n\n Content: ${text}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              front: { type: Type.STRING },
              back: { type: Type.STRING }
            },
            required: ['front', 'back']
          }
        }
      }
    }));
    res.json({ result: JSON.parse(response.text || '[]') });
  } catch (error: any) {
    return handleGeminiError(res, error, 'Error generating flashcards');
  }
};

export const generateTopics = async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    const response = await callGeminiWithRetry(() => ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Extract a list of the most important topics and learning objectives from this educational content. Provide a bulleted list with brief descriptions for each. Output in Markdown format. \n\n Content: ${text}`,
    }));
    res.json({ result: response.text });
  } catch (error: any) {
    return handleGeminiError(res, error, 'Error generating topics');
  }
};

export const generateExplanation = async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    const response = await callGeminiWithRetry(() => ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Explain this content in very simple terms, as if you were explaining it to a young student. Use analogies and avoid complex jargon. Output in Markdown format. \n\n Content: ${text}`,
    }));
    res.json({ result: response.text });
  } catch (error: any) {
    return handleGeminiError(res, error, 'Error generating explanation');
  }
};

export const chatWithTutor = async (req: Request, res: Response) => {
  try {
    const { history, message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    const response = await callGeminiWithRetry(() => ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        ...(Array.isArray(history) ? history : []).map((h: any) => ({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.content }] })),
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: 'You are SmartStudy AI, a helpful and patient tutor for students in classes 6-10. Explain complex topics simply using conceptual breakdowns and vivid analogies suitable for middle & high school students. Always encourage the student.'
      }
    }));
    res.json({ result: response.text });
  } catch (error: any) {
    return handleGeminiError(res, error, 'Error in chatWithTutor');
  }
};

export const generateImportantQuestions = async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string' || text.trim() === '') {
      return res.status(400).json({ error: 'Text is required' });
    }
    const response = await callGeminiWithRetry(() => ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze this educational content and generate high-yield exam-oriented questions strictly based on the text. Generate questions across 4 categories: 1 Mark (Very Short Answer, type: "very_short"), 2 Marks (Short Answer, type: "short"), 3 Marks (Medium Answer, type: "medium"), and 5 Marks (Long/Analytical Answer, type: "long"). Provide a model answer and key scoring points for each question. Do not fabricate information that is not supported by the supplied text.\n\nContent: ${text}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              marks: { type: Type.INTEGER },
              type: { type: Type.STRING },
              answer: { type: Type.STRING },
              keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['question', 'marks', 'type', 'answer', 'keyPoints']
          }
        }
      }
    }));

    let result = [];
    try {
      result = JSON.parse(response.text || '[]');
    } catch (parseErr) {
      console.error('Error parsing JSON from Gemini response in generateImportantQuestions:', parseErr);
      return res.status(500).json({ error: 'Invalid response format received from AI model' });
    }

    res.json({ result });
  } catch (error: any) {
    return handleGeminiError(res, error, 'Error generating important questions');
  }
};
