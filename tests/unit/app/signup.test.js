import React from 'react';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';

// Mock next/navigation useRouter push
const fakePush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: fakePush }),
}));

import SignUpPage from '@/app/signup/page';

describe('SignUp Page', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('renders form inputs and submit button', () => {
    render(<SignUpPage />);

    expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Choose a strong password'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /create account/i }),
    ).toBeInTheDocument();
  });

  test('submits form and navigates to login on success', async () => {
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<SignUpPage />);

    const nameInput = screen.getByPlaceholderText('Your name');
    const emailInput = screen.getByPlaceholderText('you@example.com');
    const passwordInput = screen.getByPlaceholderText(
      'Choose a strong password',
    );
    const submit = screen.getByRole('button', { name: /create account/i });

    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123' } });
      fireEvent.click(submit);
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/auth/signup',
        expect.objectContaining({ method: 'POST' }),
      );
      expect(fakePush).toHaveBeenCalledWith('/login');
    });

    global.fetch = originalFetch;
  });

  test('shows error when signup fails', async () => {
    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Email already exists' }),
    });

    render(<SignUpPage />);

    const nameInput = screen.getByPlaceholderText('Your name');
    const emailInput = screen.getByPlaceholderText('you@example.com');
    const passwordInput = screen.getByPlaceholderText(
      'Choose a strong password',
    );
    const submit = screen.getByRole('button', { name: /create account/i });

    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123' } });
      fireEvent.click(submit);
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
    });

    global.fetch = originalFetch;
  });
});
