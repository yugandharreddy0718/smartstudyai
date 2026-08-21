import { apiClient, ImportantQuestion, MCQQuestion, MCQDifficulty } from '@smartstudy/shared';

export const geminiService = {
  async generateSummary(text: string): Promise<string> {
    const data = await apiClient.post('/api/gemini/summary', { text });
    return data.result;
  },

  async generateSummaryFromMultimodal(fileData: { mimeType: string, data: string }): Promise<string> {
    const data = await apiClient.post('/api/gemini/multimodal', { fileData });
    return data.result;
  },

  async generateQuiz(text: string, count: number = 5, difficulty: MCQDifficulty = 'medium'): Promise<any[]> {
    const data = await apiClient.post('/api/gemini/quiz', { text, count, difficulty });
    return data.result;
  },

  async generateFlashcards(text: string): Promise<any[]> {
    const data = await apiClient.post('/api/gemini/flashcards', { text });
    return data.result;
  },

  async generateTopics(text: string): Promise<string> {
    const data = await apiClient.post('/api/gemini/topics', { text });
    return data.result;
  },

  async generateExplanation(text: string): Promise<string> {
    const data = await apiClient.post('/api/gemini/explanation', { text });
    return data.result;
  },

  async chatWithTutor(history: { role: string, content: string }[], message: string): Promise<string> {
    const data = await apiClient.post('/api/gemini/chat', { history, message });
    return data.result;
  },

  async generateImportantQuestions(text: string): Promise<ImportantQuestion[]> {
    const data = await apiClient.post('/api/gemini/important-questions', { text });
    return data.result;
  },

  async generateMCQs(text: string, count: number = 10, difficulty: MCQDifficulty = 'medium'): Promise<MCQQuestion[]> {
    const data = await apiClient.post('/api/gemini/mcq-generator', { text, count, difficulty });
    return data.result;
  }
};
