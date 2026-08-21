import { describe, it, expect, vi } from 'vitest';
import { ocrService } from '../services/ocrService';
import Tesseract from 'tesseract.js';

vi.mock('tesseract.js', () => ({
  default: {
    recognize: vi.fn().mockResolvedValue({
      data: { text: 'Extracted OCR text content' },
    }),
  },
}));

describe('OCR Service Unit Tests', () => {
  it('extracts text from file mock using Tesseract', async () => {
    const text = await ocrService.extractText('sample_image_url');
    expect(text).toBe('Extracted OCR text content');
    expect(Tesseract.recognize).toHaveBeenCalled();
  });
});
