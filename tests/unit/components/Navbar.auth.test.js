import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock next/image and next/link to simple elements so Navbar renders predictably
jest.mock('next/image', () => {
  return function MockImage({ src, alt, width, height, className }) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
      />
    );
  };
});
jest.mock('next/link', () => {
  return ({ href, children, className }) => (
    <a href={href} className={className}>
      {children}
    </a>
  );
});

// Mock CSS module to avoid missing class names
jest.mock('@/components/Navbar/Navbar.module.css', () => ({
  navbar: 'navbar',
  brandWrapper: 'brandWrapper',
  brand: 'brand',
  brandLogo: 'brandLogo',
  inner: 'inner',
  spacer: 'spacer',
  links: 'links',
  aboutLink: 'aboutLink',
  profileWrap: 'profileWrap',
  profileButton: 'profileButton',
  profileDropdown: 'profileDropdown',
  dropdownItem: 'dropdownItem',
  linkButton: 'linkButton',
  signupButton: 'signupButton',
}));

// Mock next-auth so we can control session and signOut. Create the mock inside
// the factory to avoid jest mock hoisting issues, then require it below.
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: { user: { name: 'Alice', email: 'a@b' } },
    status: 'authenticated',
  }),
  signOut: jest.fn(),
}));

const { signOut: mockSignOut } = require('next-auth/react');

import Navbar from '@/components/Navbar/Navbar';

describe('Navbar authenticated behavior', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('shows profile and dropdown can sign out and closes on outside click', async () => {
    render(<Navbar />);

    // Profile button should render with user name
    const profileButton = screen.getByRole('button', { name: /alice/i });
    expect(profileButton).toBeInTheDocument();

    // Click to open
    fireEvent.click(profileButton);

    // Dropdown should appear (menuitem role)
    const signOutButton = await screen.findByRole('menuitem', {
      name: /sign out/i,
    });
    expect(signOutButton).toBeInTheDocument();

    // Simulate outside click to close
    const evt = new MouseEvent('mousedown', { bubbles: true });
    document.body.dispatchEvent(evt);

    await waitFor(() => {
      expect(
        screen.queryByRole('menuitem', { name: /sign out/i }),
      ).not.toBeInTheDocument();
    });

    // Open again and click sign out
    fireEvent.click(profileButton);
    const signOutButton2 = await screen.findByRole('menuitem', {
      name: /sign out/i,
    });
    fireEvent.click(signOutButton2);
    expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: '/' });
  });
});
