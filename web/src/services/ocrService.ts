import Tesseract from 'tesseract.js';

export const ocrService = {
  async extractText(file: File | string): Promise<string> {
    const { data: { text } } = await Tesseract.recognize(
      file,
      'eng',
      { logger: m => console.log(m) }
    );
    return text;
  }
};
