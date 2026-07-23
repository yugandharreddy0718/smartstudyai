import { describe, it, expect, vi, beforeEach } from 'vitest';
import { geminiService } from '../services/geminiService';

describe('Gemini API Service Unit Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('generates summary successfully', async () => {
    const mockResponse = { result: 'Mock summary response' };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const summary = await geminiService.generateSummary('Photosynthesis chapter');
    expect(summary).toBe('Mock summary response');
    expect(global.fetch).toHaveBeenCalledWith('/api/gemini/summary', expect.any(Object));
  });

  it('handles API error when summary generation fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      statusText: 'Internal Server Error',
    });

    await expect(geminiService.generateSummary('text')).rejects.toThrow(
      'Failed to generate summary'
    );
  });

  it('generates quiz array from service', async () => {
    const mockQuiz = [{ question: 'What is 2+2?', options: ['3', '4'], correctAnswer: '4', explanation: 'Math' }];
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ result: mockQuiz }),
    });

    const quiz = await geminiService.generateQuiz('Math text', 1);
    expect(quiz).toHaveLength(1);
    expect(quiz[0].question).toBe('What is 2+2?');
  });

  it('chats with tutor successfully', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ result: 'Hello student!' }),
    });

    const reply = await geminiService.chatWithTutor([], 'Hi tutor');
    expect(reply).toBe('Hello student!');
  });
});
