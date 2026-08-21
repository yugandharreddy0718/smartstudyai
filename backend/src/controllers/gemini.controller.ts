import { Request, Response } from 'express';
import { Type } from '@google/genai';
import { ai } from '../services/gemini.service.js';

export const generateSummary = async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze this educational content and provide a structured summary including: Key Points, Important Concepts, Easy Explanation, and Exam Prep Notes. Output in Markdown format. \n\n Content: ${text}`,
    });
    res.json({ result: response.text });
  } catch (error: any) {
    console.error('Error in generateSummary:', error);
    res.status(500).json({ error: error.message || 'Error generating summary' });
  }
};

export const generateMultimodal = async (req: Request, res: Response) => {
  try {
    const { fileData } = req.body;
    if (!fileData || !fileData.data || !fileData.mimeType) {
      return res.status(400).json({ error: 'fileData with data and mimeType is required' });
    }
    const isPdf = fileData.mimeType === 'application/pdf' || fileData.mimeType.includes('pdf');
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          inlineData: {
            mimeType: fileData.mimeType,
            data: fileData.data,
          }
        },
        {
          text: `You are an expert AI learning assistant. Analyze the uploaded ${isPdf ? 'document' : 'image'} (containing textbook pages, handwritten notes, educational material, or study guide).
Extract all the key content and produce a beautifully formatted structured study page with:
1. **Overview & Context** (1-2 sentences introduction)
2. **Key Concepts Explained** (Explain 3-4 major definitions, terms, or processes with neat formatting)
3. **Important Summary Points** / **Exam Prep Notes** (Actionable, scannable study bullets)
4. **Simple Analogy** (An intuitive real-life analogy explaining the core lesson concept)

Ensure the output is written in standard, clear Markdown with cohesive headings. If there are code blocks, equations, or diagrams described, represent them cleanly.`
        }
      ]
    });
    res.json({ result: response.text });
  } catch (error: any) {
    console.error('Error in generateMultimodal:', error);
    res.status(500).json({ error: error.message || 'Error generating multimodal summary' });
  }
};

export const generateQuiz = async (req: Request, res: Response) => {
  try {
    const { text, count = 5, difficulty = 'medium' } = req.body;
    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Text content is required' });
    }

    const numCount = Math.min(Math.max(Number(count) || 5, 1), 20);
    const validDifficulties = ['easy', 'medium', 'hard', 'mixed'];
    const selectedDifficulty = validDifficulties.includes(String(difficulty).toLowerCase())
      ? String(difficulty).toLowerCase()
      : 'medium';

    const response = await ai.models.generateContent({
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
    });

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
    console.error('Error in generateQuiz:', error);
    res.status(500).json({ error: error.message || 'Error generating quiz' });
  }
};

export const generateFlashcards = async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    const response = await ai.models.generateContent({
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
    });
    res.json({ result: JSON.parse(response.text || '[]') });
  } catch (error: any) {
    console.error('Error in generateFlashcards:', error);
    res.status(500).json({ error: error.message || 'Error generating flashcards' });
  }
};

export const generateTopics = async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Extract a list of the most important topics and learning objectives from this educational content. Provide a bulleted list with brief descriptions for each. Output in Markdown format. \n\n Content: ${text}`,
    });
    res.json({ result: response.text });
  } catch (error: any) {
    console.error('Error in generateTopics:', error);
    res.status(500).json({ error: error.message || 'Error generating topics' });
  }
};

export const generateExplanation = async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Explain this content in very simple terms, as if you were explaining it to a young student. Use analogies and avoid complex jargon. Output in Markdown format. \n\n Content: ${text}`,
    });
    res.json({ result: response.text });
  } catch (error: any) {
    console.error('Error in generateExplanation:', error);
    res.status(500).json({ error: error.message || 'Error generating explanation' });
  }
};

export const chatWithTutor = async (req: Request, res: Response) => {
  try {
    const { history, message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        ...history.map((h: any) => ({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.content }] })),
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction: 'You are SmartStudy AI, a helpful and patient tutor for students in classes 6-10. Explain complex topics simply using conceptual breakdowns and vivid analogies suitable for middle & high school students. Always encourage the student.'
      }
    });
    res.json({ result: response.text });
  } catch (error: any) {
    console.error('Error in chatWithTutor:', error);
    res.status(500).json({ error: error.message || 'Error in chatWithTutor' });
  }
};

export const generateImportantQuestions = async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string' || text.trim() === '') {
      return res.status(400).json({ error: 'Text is required' });
    }
    const response = await ai.models.generateContent({
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
    });

    let result = [];
    try {
      result = JSON.parse(response.text || '[]');
    } catch (parseErr) {
      console.error('Error parsing JSON from Gemini response in generateImportantQuestions:', parseErr);
      return res.status(500).json({ error: 'Invalid response format received from AI model' });
    }

    res.json({ result });
  } catch (error: any) {
    console.error('Error in generateImportantQuestions:', error);
    res.status(500).json({ error: error.message || 'Error generating important questions' });
  }
};
