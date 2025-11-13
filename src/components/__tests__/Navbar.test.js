// Mock CSS modules
jest.mock('../Navbar/Navbar.module.css', () => ({
  navbar: 'navbar',
  brandWrapper: 'brandWrapper',
  brand: 'brand',
  brandLogo: 'brandLogo',
  inner: 'inner',
  spacer: 'spacer',
  links: 'links',
  aboutLink: 'aboutLink',
}));

// Mock Next.js Image component
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
        data-testid="navbar-image"
      />
    );
  };
});

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Navbar from '../Navbar/Navbar';
jest.mock('../Navbar/Navbar.module.css', () => ({
  navbar: 'navbar',
  brandWrapper: 'brandWrapper',
  brand: 'brand',
  brandLogo: 'brandLogo',
  inner: 'inner',
  spacer: 'spacer',
  links: 'links',
  aboutLink: 'aboutLink',
}));

describe('Navbar', () => {
  beforeEach(() => {
    render(<Navbar />);
  });

  describe('Structure and Rendering', () => {
    test('renders navbar element with correct role and aria-label', () => {
      const navbar = screen.getByRole('navigation', {
        name: /main navigation/i,
      });
      expect(navbar).toBeInTheDocument();
      expect(navbar).toHaveClass('navbar');
    });

    test('renders brand wrapper and brand sections', () => {
      const navbar = screen.getByRole('navigation');

      // Check for brand wrapper (by class since it's not semantic)
      expect(navbar.querySelector('.brandWrapper')).toBeInTheDocument();
      expect(navbar.querySelector('.brand')).toBeInTheDocument();
    });

    test('renders inner section with spacer and links', () => {
      const navbar = screen.getByRole('navigation');

      // Check for inner section structure
      expect(navbar.querySelector('.inner')).toBeInTheDocument();
      expect(navbar.querySelector('.spacer')).toBeInTheDocument();
      expect(navbar.querySelector('.links')).toBeInTheDocument();
    });
  });

  describe('Logo/Brand Image', () => {
    test('renders TinyThreads logo with correct attributes', () => {
      const logoImage = screen.getByTestId('navbar-image');

      expect(logoImage).toBeInTheDocument();
      expect(logoImage).toHaveAttribute('src', '/TinyThreadsScribble.png');
      expect(logoImage).toHaveAttribute('alt', 'TinyThreads');
      expect(logoImage).toHaveAttribute('width', '400');
      expect(logoImage).toHaveAttribute('height', '400');
      expect(logoImage).toHaveClass('brandLogo');
    });

    test('logo has proper alt text for accessibility', () => {
      const logoImage = screen.getByAltText('TinyThreads');
      expect(logoImage).toBeInTheDocument();
    });
  });

  describe('Navigation Links', () => {
    test('renders about link with correct href and text', () => {
      const aboutLink = screen.getByRole('link', { name: /about/i });

      expect(aboutLink).toBeInTheDocument();
      expect(aboutLink).toHaveAttribute('href', '/about');
      expect(aboutLink).toHaveClass('aboutLink');
      expect(aboutLink).toHaveTextContent('About');
    });

    test('about link is accessible', () => {
      const aboutLink = screen.getByRole('link', { name: /about/i });
      expect(aboutLink).toBeInTheDocument();
      expect(aboutLink).toHaveAttribute('href');
    });
  });

  describe('CSS Classes', () => {
    test('applies correct CSS classes to elements', () => {
      const navbar = screen.getByRole('navigation');
      const aboutLink = screen.getByRole('link', { name: /about/i });
      const logoImage = screen.getByTestId('navbar-image');

      expect(navbar).toHaveClass('navbar');
      expect(aboutLink).toHaveClass('aboutLink');
      expect(logoImage).toHaveClass('brandLogo');
    });
  });

  describe('Accessibility', () => {
    test('navbar has proper ARIA attributes', () => {
      const navbar = screen.getByRole('navigation');

      expect(navbar).toHaveAttribute('role', 'navigation');
      expect(navbar).toHaveAttribute('aria-label', 'Main navigation');
    });

    test('all interactive elements are accessible', () => {
      // About link should be focusable and have proper role
      const aboutLink = screen.getByRole('link', { name: /about/i });
      expect(aboutLink).toBeInTheDocument();
      expect(aboutLink).toHaveAttribute('href');
    });

    test('logo image has meaningful alt text', () => {
      const logoImage = screen.getByAltText('TinyThreads');
      expect(logoImage).toBeInTheDocument();
      // Alt text should not be empty or generic
      expect(logoImage.getAttribute('alt')).toBe('TinyThreads');
    });
  });

  describe('Layout Structure', () => {
    test('maintains expected DOM structure', () => {
      const navbar = screen.getByRole('navigation');

      // Check hierarchical structure exists
      expect(navbar.querySelector('.brandWrapper .brand')).toBeInTheDocument();
      expect(navbar.querySelector('.inner .links')).toBeInTheDocument();
      expect(navbar.querySelector('.inner .spacer')).toBeInTheDocument();
    });

    test('brand wrapper is separate from inner section', () => {
      const navbar = screen.getByRole('navigation');
      const brandWrapper = navbar.querySelector('.brandWrapper');
      const inner = navbar.querySelector('.inner');

      expect(brandWrapper).toBeInTheDocument();
      expect(inner).toBeInTheDocument();

      // Check that brandWrapper and inner are siblings, not nested
      expect(brandWrapper.parentElement).toBe(navbar);
      expect(inner.parentElement).toBe(navbar);
      expect(brandWrapper.nextElementSibling).toBe(inner);
    });
  });

  describe('Error Handling', () => {
    test('handles missing image gracefully', () => {
      // This tests that the component doesn't crash if image fails to load
      const logoImage = screen.getByTestId('navbar-image');

      // Simulate image error
      const errorEvent = new Event('error');
      logoImage.dispatchEvent(errorEvent);

      // Component should still be rendered
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
  });
});
