import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';

// Create the mock inside the factory to avoid hoisting issues
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

const { signIn: mockSignIn } = require('next-auth/react');

import LoginPage from '@/app/login/page';

describe('Login Page', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('renders form inputs and submit button', () => {
    render(<LoginPage />);

    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Your password')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /sign in/i }),
    ).toBeInTheDocument();
  });

  test('calls signIn and shows loading state while pending', async () => {
    let resolveSignIn;
    mockSignIn.mockImplementation(
      () =>
        new Promise((res) => {
          resolveSignIn = res;
        }),
    );

    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('you@example.com');
    const passwordInput = screen.getByPlaceholderText('Your password');
    const submit = screen.getByRole('button', { name: /sign in/i });

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123' } });
      fireEvent.click(submit);
      await Promise.resolve();
    });

    expect(screen.getByRole('button')).toHaveTextContent('Signing in...');
    expect(screen.getByRole('button')).toBeDisabled();

    resolveSignIn();

    await waitFor(() => expect(mockSignIn).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /sign in/i }),
      ).toBeInTheDocument(),
    );
  });

  test('shows error message when signIn rejects', async () => {
    mockSignIn.mockRejectedValueOnce(new Error('Invalid credentials'));

    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('you@example.com');
    const passwordInput = screen.getByPlaceholderText('Your password');
    const submit = screen.getByRole('button', { name: /sign in/i });

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'bad@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'badpass' } });
      fireEvent.click(submit);
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /sign in/i })).toBeEnabled();
  });
});
