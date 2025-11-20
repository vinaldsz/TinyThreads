// jest.setup.js
import '@testing-library/jest-dom';
import React from 'react';

// Provide a lightweight mock for next-auth during tests so components using
// `useSession` don't need a real provider. Tests can still override this mock
// using jest.mock(...) in individual test files when needed.
jest.mock('next-auth/react', () => {
  return {
    useSession: () => ({ data: null, status: 'unauthenticated' }),
    signIn: jest.fn(),
    signOut: jest.fn(),
    SessionProvider: ({ children }) =>
      React.createElement(React.Fragment, null, children),
  };
});
