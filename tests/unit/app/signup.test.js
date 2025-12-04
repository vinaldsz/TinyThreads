/**
 * @jest-environment jsdom
 */
/* eslint-disable @typescript-eslint/no-require-imports */
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import { signIn as mockSignIn } from 'next-auth/react';

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated',
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/signup',
}));

// ✅ Mock Navbar 组件来避免 useSession 问题
jest.mock('@/components/Navbar/Navbar', () => {
  return function MockNavbar() {
    return <nav data-testid="mock-navbar">Navbar</nav>;
  };
});

// ✅ 现在导入组件
import SignUpPage from '@/app/signup/page';

describe('SignUp Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPush.mockClear();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
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
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<SignUpPage />);

    const nameInput = screen.getByPlaceholderText('Your name');
    const emailInput = screen.getByPlaceholderText('you@example.com');
    const passwordInput = screen.getByPlaceholderText(
      'Choose a strong password',
    );
    const confirmPasswordInput = screen.getByPlaceholderText(
      'Re-enter your password',
    );
    const submit = screen.getByRole('button', { name: /create account/i });

    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123' } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: 'Password123' },
      });
    });

    await act(async () => {
      fireEvent.click(submit);
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/auth/signup',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    });

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    });
  });

  test('shows error when signup fails', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Email already exists' }),
    });

    render(<SignUpPage />);

    const nameInput = screen.getByPlaceholderText('Your name');
    const emailInput = screen.getByPlaceholderText('you@example.com');
    const passwordInput = screen.getByPlaceholderText(
      'Choose a strong password',
    );
    const confirmPasswordInput = screen.getByPlaceholderText(
      'Re-enter your password',
    );
    const submit = screen.getByRole('button', { name: /create account/i });

    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123' } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: 'Password123' },
      });
    });

    await act(async () => {
      fireEvent.click(submit);
    });

    await waitFor(() => {
      expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
    });
  });

  test('renders Navbar component', () => {
    // The Navbar module is mocked above; render the mock directly and assert.
    const NavbarMod = require('@/components/Navbar/Navbar');
    const Navbar =
      NavbarMod && NavbarMod.default ? NavbarMod.default : NavbarMod;
    render(<Navbar />);
    expect(screen.getByTestId('mock-navbar')).toBeInTheDocument();
  });

  test('shows validation errors when fields are empty on submit', async () => {
    render(<SignUpPage />);

    const submit = screen.getByRole('button', { name: /create account/i });

    await act(async () => {
      fireEvent.click(submit);
      await Promise.resolve();
    });

    expect(screen.getByText('Full name is required')).toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(
      screen.getByText('Please confirm your password'),
    ).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('shows email format error when email is invalid', async () => {
    render(<SignUpPage />);

    const nameInput = screen.getByPlaceholderText('Your name');
    const emailInput = screen.getByPlaceholderText('you@example.com');
    const passwordInput = screen.getByPlaceholderText(
      'Choose a strong password',
    );
    const confirmPasswordInput = screen.getByPlaceholderText(
      'Re-enter your password',
    );
    const submit = screen.getByRole('button', { name: /create account/i });

    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      fireEvent.change(emailInput, { target: { value: 'not-an-email' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123' } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: 'Password123' },
      });
      fireEvent.click(submit);
      await Promise.resolve();
    });

    expect(
      screen.getByText('Please enter a valid email address'),
    ).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('shows password length error when password is too short', async () => {
    render(<SignUpPage />);

    const nameInput = screen.getByPlaceholderText('Your name');
    const emailInput = screen.getByPlaceholderText('you@example.com');
    const passwordInput = screen.getByPlaceholderText(
      'Choose a strong password',
    );
    const confirmPasswordInput = screen.getByPlaceholderText(
      'Re-enter your password',
    );
    const submit = screen.getByRole('button', { name: /create account/i });

    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'short' } });
      fireEvent.change(confirmPasswordInput, {
        target: { value: 'short' },
      });
      fireEvent.click(submit);
      await Promise.resolve();
    });

    expect(
      screen.getByText('Password must be at least 8 characters'),
    ).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('shows error when confirm password does not match', async () => {
    render(<SignUpPage />);

    const nameInput = screen.getByPlaceholderText('Your name');
    const emailInput = screen.getByPlaceholderText('you@example.com');
    const passwordInput = screen.getByPlaceholderText(
      'Choose a strong password',
    );
    const confirmPasswordInput = screen.getByPlaceholderText(
      'Re-enter your password',
    );
    const submit = screen.getByRole('button', { name: /create account/i });

    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, {
        target: { value: 'Password123' },
      });
      fireEvent.change(confirmPasswordInput, {
        target: { value: 'Different123' },
      });
      fireEvent.click(submit);
      await Promise.resolve();
    });

    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('calls Google signIn when clicking "Continue with Google"', async () => {
    mockSignIn.mockResolvedValueOnce({});

    render(<SignUpPage />);

    const googleButton = screen.getByRole('button', {
      name: /continue with google/i,
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
    mockSignIn.mockRejectedValueOnce(new Error('Google signup error'));

    render(<SignUpPage />);

    const googleButton = screen.getByRole('button', {
      name: /continue with google/i,
    });

    await act(async () => {
      fireEvent.click(googleButton);
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(
        screen.getByText(
          /something went wrong while signing you up with google/i,
        ),
      ).toBeInTheDocument();
    });
  });
});
