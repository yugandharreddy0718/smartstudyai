/**
 * Normalizes and sanitizes mathematical notation formatted by generative models
 * (e.g., converting block \[ ... \] to $$ ... $$ and inline \( ... \) to $ ... $
 * for robust react-markdown and MathJax/LaTeX display rendering).
 */
export function cleanMathText(text: string): string {
  if (!text) return '';

  let cleaned = text;

  // Replace block math syntax \[ ... \] with standard $$ ... $$
  cleaned = cleaned.replace(/\\\[/g, '$$$$').replace(/\\\]/g, '$$$$');

  // Replace inline math syntax \( ... \) with standard $ ... $
  cleaned = cleaned.replace(/\\\(/g, '$').replace(/\\\)/g, '$');

  // Perform minor cleanups for common AI notation artifacts
  cleaned = cleaned.replace(/\\\$/g, '$');

  return cleaned;
}
