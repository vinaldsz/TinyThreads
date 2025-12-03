import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';

jest.mock('next-auth/react', () => ({
  __esModule: true,
  signIn: jest.fn(),
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated',
  })),
}));

jest.mock('@/components/Navbar/Navbar', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-navbar" />,
}));

import { signIn as mockSignIn } from 'next-auth/react';
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
      screen.getByRole('button', { name: /^sign in$/i }),
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
    const submit = screen.getByRole('button', { name: /^sign in$/i });

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123' } });
      fireEvent.click(submit);
      await Promise.resolve();
    });
    const loadingButton = screen.getByRole('button', { name: /signing in/i });
    expect(loadingButton).toHaveTextContent('Signing in...');
    expect(loadingButton).toBeDisabled();

    resolveSignIn();

    await waitFor(() => expect(mockSignIn).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /^sign in$/i }),
      ).toBeInTheDocument(),
    );
  });

  test('shows error message when signIn rejects', async () => {
    mockSignIn.mockResolvedValueOnce({ error: 'CredentialsSignin' });

    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('you@example.com');
    const passwordInput = screen.getByPlaceholderText('Your password');
    const submit = screen.getByRole('button', { name: /^sign in$/i });

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'bad@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Badpass1' } });
      fireEvent.click(submit);
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(
        screen.getByText(/incorrect email or password/i),
      ).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /^sign in$/i })).toBeEnabled();
  });

  test('shows validation errors when fields are empty on submit', async () => {
    render(<LoginPage />);

    const submit = screen.getByRole('button', { name: /^sign in$/i });

    await act(async () => {
      fireEvent.click(submit);
      await Promise.resolve();
    });

    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  test('shows email format error when email is invalid', async () => {
    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('you@example.com');
    const passwordInput = screen.getByPlaceholderText('Your password');
    const submit = screen.getByRole('button', { name: /^sign in$/i });

    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'not-an-email' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123' } });
      fireEvent.click(submit);
      await Promise.resolve();
    });

    expect(
      screen.getByText('Please enter a valid email address'),
    ).toBeInTheDocument();
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  test('shows password length error when password is too short', async () => {
    render(<LoginPage />);

    const emailInput = screen.getByPlaceholderText('you@example.com');
    const passwordInput = screen.getByPlaceholderText('Your password');
    const submit = screen.getByRole('button', { name: /^sign in$/i });

    await act(async () => {
      fireEvent.change(emailInput, {
        target: { value: 'valid@example.com' },
      });
      fireEvent.change(passwordInput, { target: { value: 'short' } });
      fireEvent.click(submit);
      await Promise.resolve();
    });

    expect(
      screen.getByText('Password must be at least 8 characters'),
    ).toBeInTheDocument();
    expect(mockSignIn).not.toHaveBeenCalled();
  });

  test('calls Google signIn when clicking "Sign in with Google"', async () => {
    mockSignIn.mockResolvedValueOnce({});

    render(<LoginPage />);

    const googleButton = screen.getByRole('button', {
      name: /sign in with google/i,
    });

    await act(async () => {
      fireEvent.click(googleButton);
      await Promise.resolve();
    });

    expect(mockSignIn).toHaveBeenCalledWith('google', {
      callbackUrl: '/',
    });
  });

  test('shows error if Google signIn throws', async () => {
    mockSignIn.mockRejectedValueOnce(new Error('Google error'));

    render(<LoginPage />);

    const googleButton = screen.getByRole('button', {
      name: /sign in with google/i,
    });

    await act(async () => {
      fireEvent.click(googleButton);
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(
        screen.getByText(
          /something went wrong while signing you in with google/i,
        ),
      ).toBeInTheDocument();
    });
  });
});
