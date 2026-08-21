import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.matchMedia for components using responsive features or motion
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Global fetch mock if needed
global.fetch = vi.fn();
