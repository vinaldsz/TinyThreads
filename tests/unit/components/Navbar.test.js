/**
 * @jest-environment jsdom
 */
/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useSession, signOut } from 'next-auth/react';
import Navbar from '@/components/Navbar/Navbar';

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  signOut: jest.fn(),
}));

// Mock Next.js Image
jest.mock('next/image', () => {
  return function MockImage({ src, alt, width, height, className }) {
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        data-testid="navbar-image"
      />
    );
  };
});

// Mock Next.js Link
jest.mock('next/link', () => {
  return function MockLink({ children, href, className }) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  };
});

describe('Navbar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========================================
  // Unauthenticated User Tests
  // ========================================

  describe('When User is NOT Logged In', () => {
    beforeEach(() => {
      useSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });
    });

    test('renders navbar with logo', () => {
      render(<Navbar />);

      const navbar = screen.getByRole('navigation');
      expect(navbar).toBeInTheDocument();

      const logo = screen.getByAltText('TinyThreads');
      expect(logo).toBeInTheDocument();
    });

    test('renders about link', () => {
      render(<Navbar />);

      const aboutLink = screen.getByRole('link', { name: /about/i });
      expect(aboutLink).toHaveAttribute('href', '/about');
    });

    test('does NOT show user menu when not logged in', () => {
      render(<Navbar />);

      expect(
        screen.queryByRole('button', { name: /user menu/i }),
      ).not.toBeInTheDocument();
    });

    test('has correct structure', () => {
      const { container } = render(<Navbar />);

      expect(container.querySelector('.navbar')).toBeInTheDocument();
      expect(container.querySelector('.brandWrapper')).toBeInTheDocument();
      expect(container.querySelector('.inner')).toBeInTheDocument();
    });
  });

  // ========================================
  // Authenticated User Tests
  // ========================================

  describe('When User IS Logged In', () => {
    let originalFetch;

    beforeAll(() => {
      originalFetch = global.fetch;
    });

    beforeEach(() => {
      global.fetch = jest.fn(() =>
        Promise.resolve({ json: () => Promise.resolve({ isVerified: false }) }),
      );

      useSession.mockReturnValue({
        data: {
          user: {
            id: 'user123',
            name: 'Test User',
            email: 'test@example.com',
          },
        },
        status: 'authenticated',
      });
    });

    afterEach(() => {
      if (originalFetch) {
        global.fetch = originalFetch;
      } else {
        delete global.fetch;
      }
    });

    test('displays user name', () => {
      render(<Navbar />);

      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    test('shows user menu button', () => {
      render(<Navbar />);

      // Look for user name as button or clickable element
      const userButton = screen.getByText('Test User');
      expect(userButton).toBeInTheDocument();
    });

    test('opens dropdown menu when user name is clicked', async () => {
      render(<Navbar />);

      const userButton = screen.getByText('Test User');

      fireEvent.click(userButton);

      await waitFor(() => {
        expect(screen.getByText(/sign out/i)).toBeInTheDocument();
      });
    });

    test('closes dropdown when clicking outside', async () => {
      render(<Navbar />);

      const userButton = screen.getByText('Test User');
      fireEvent.click(userButton);

      await waitFor(() => {
        expect(screen.getByText(/sign out/i)).toBeInTheDocument();
      });

      // Click outside
      fireEvent.mouseDown(document.body);

      await waitFor(() => {
        expect(screen.queryByText(/sign out/i)).not.toBeInTheDocument();
      });
    });

    test('calls signOut when Sign Out is clicked', async () => {
      render(<Navbar />);

      const userButton = screen.getByText('Test User');
      fireEvent.click(userButton);

      await waitFor(() => {
        expect(screen.getByText(/sign out/i)).toBeInTheDocument();
      });

      const signOutButton = screen.getByText(/sign out/i);
      fireEvent.click(signOutButton);

      expect(signOut).toHaveBeenCalledTimes(1);
    });

    test('displays email as fallback when name is not available', () => {
      useSession.mockReturnValue({
        data: {
          user: {
            id: 'user123',
            email: 'test@example.com',
            // name is undefined
          },
        },
        status: 'authenticated',
      });

      render(<Navbar />);

      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });
  });

  // ========================================
  // Logo and Branding Tests
  // ========================================

  describe('Logo and Branding', () => {
    beforeEach(() => {
      useSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });
    });

    test('renders logo with correct attributes', () => {
      render(<Navbar />);

      const logo = screen.getByTestId('navbar-image');
      expect(logo).toHaveAttribute('src', '/TinyThreadsScribble_new.png');
      expect(logo).toHaveAttribute('alt', 'TinyThreads');
      expect(logo).toHaveAttribute('width', '1000');
      expect(logo).toHaveAttribute('height', '1000');
    });

    test('logo is clickable and links to home', () => {
      render(<Navbar />);

      const brandLink = screen.getByRole('link', { name: /tinythreads/i });
      expect(brandLink).toHaveAttribute('href', '/');
    });
  });

  // ========================================
  // Accessibility Tests
  // ========================================

  describe('Accessibility', () => {
    beforeEach(() => {
      useSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });
    });

    test('navbar has proper ARIA label', () => {
      render(<Navbar />);

      const navbar = screen.getByRole('navigation');
      expect(navbar).toHaveAttribute('aria-label', 'Main navigation');
    });

    test('all links are accessible', () => {
      render(<Navbar />);

      const aboutLink = screen.getByRole('link', { name: /about/i });
      expect(aboutLink).toBeInTheDocument();
      expect(aboutLink).toHaveAttribute('href');
    });
  });

  // ========================================
  // Loading State Tests
  // ========================================

  describe('Session Loading State', () => {
    test('handles loading session state', () => {
      useSession.mockReturnValue({
        data: null,
        status: 'loading',
      });

      render(<Navbar />);

      const navbar = screen.getByRole('navigation');
      expect(navbar).toBeInTheDocument();
    });
  });
});
