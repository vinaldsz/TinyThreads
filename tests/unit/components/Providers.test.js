import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

jest.mock('next-auth/react', () => ({
  SessionProvider: ({ children }) => <div data-testid="session-provider">{children}</div>,
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated',
  })),
}));

import Providers from '@/components/Providers';

describe('Providers component', () => {
  test('renders children without crashing', () => {
    render(
      <Providers>
        <div>child-content</div>
      </Providers>,
    );

    expect(screen.getByText('child-content')).toBeInTheDocument();
  });

  test('accepts session prop and renders children', () => {
    render(
      <Providers session={{ user: { name: 'test' } }}>
        <span>with-session</span>
      </Providers>,
    );

    expect(screen.getByText('with-session')).toBeInTheDocument();
  });
});
