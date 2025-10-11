
import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Make vi available globally
globalThis.vi = vi;

// Cleanup after each test case
afterEach(() => {
  cleanup();
});

// Mock Firebase
vi.mock('@/integrations/firebase/config', () => ({
  auth: {},
  db: {},
  analytics: {}
}));

// Mock Framer Motion
vi.mock('framer-motion', () => ({
  motion: {
    div: 'div',
    button: 'button',
    form: 'form',
    h1: 'h1',
    p: 'p'
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children
}));
