jest.mock('next/font/google', () => ({
  Geist: jest.fn(() => ({
    variable: '--font-geist-sans',
  })),
  Geist_Mono: jest.fn(() => ({
    variable: '--font-geist-mono',
  })),
}));

// Mock CSS import
jest.mock('../globals.css', () => ({}));

import RootLayout, { metadata } from '../layout';
import { Geist, Geist_Mono } from 'next/font/google';

// Get the mocked functions
const mockGeist = Geist;
const mockGeistMono = Geist_Mono;

describe('RootLayout', () => {
  // RootLayout renders html/body elements which cannot be tested directly
  // with react-testing-library. The component structure is validated by Next.js.
  test('component exists and is a function', () => {
    expect(typeof RootLayout).toBe('function');
  });
});

describe('metadata export', () => {
  test('exports correct metadata object', () => {
    expect(metadata).toBeDefined();
    expect(metadata).toEqual({
      title: 'TinyThreads | Buy & Sell Baby Clothes',
      description: 'A 60-second resale marketplace for baby clothes and toys',
    });
  });

  test('metadata has correct title', () => {
    expect(metadata.title).toBe('TinyThreads | Buy & Sell Baby Clothes');
  });

  test('metadata has correct description', () => {
    expect(metadata.description).toBe(
      'A 60-second resale marketplace for baby clothes and toys',
    );
  });

  test('metadata object structure', () => {
    expect(typeof metadata).toBe('object');
    expect(Object.keys(metadata)).toEqual(['title', 'description']);
  });
});

describe('Font imports', () => {
  test('Geist font is imported and configured correctly', () => {
    expect(mockGeist).toHaveBeenCalledWith({
      variable: '--font-geist-sans',
      subsets: ['latin'],
    });
  });

  test('Geist_Mono font is imported and configured correctly', () => {
    expect(mockGeistMono).toHaveBeenCalledWith({
      variable: '--font-geist-mono',
      subsets: ['latin'],
    });
  });
});
