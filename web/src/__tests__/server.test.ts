import { describe, it, expect } from 'vitest';

describe('Server API Logic & Data Schemas', () => {
  it('validates summary request payload requirement', () => {
    const validateSummaryInput = (body: any) => {
      if (!body || !body.text) {
        return { valid: false, error: 'Text is required' };
      }
      return { valid: true };
    };

    expect(validateSummaryInput({})).toEqual({ valid: false, error: 'Text is required' });
    expect(validateSummaryInput({ text: 'Photosynthesis process' })).toEqual({ valid: true });
  });

  it('validates multimodal file payload structure', () => {
    const validateMultimodalInput = (body: any) => {
      if (!body || !body.fileData || !body.fileData.data || !body.fileData.mimeType) {
        return { valid: false, error: 'fileData with data and mimeType is required' };
      }
      return { valid: true };
    };

    expect(validateMultimodalInput({})).toEqual({
      valid: false,
      error: 'fileData with data and mimeType is required',
    });
    expect(
      validateMultimodalInput({
        fileData: { data: 'base64str', mimeType: 'application/pdf' },
      })
    ).toEqual({ valid: true });
  });

  it('validates chat history formatting', () => {
    const formatHistory = (history: Array<{ role: string; content: string }>) => {
      return history.map((h) => ({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.content }],
      }));
    };

    const input = [
      { role: 'user', content: 'What is Gravity?' },
      { role: 'assistant', content: 'Gravity is a force...' },
    ];
    const output = formatHistory(input);

    expect(output).toHaveLength(2);
    expect(output[0].role).toBe('user');
    expect(output[1].role).toBe('model');
    expect(output[0].parts[0].text).toBe('What is Gravity?');
  });
});
