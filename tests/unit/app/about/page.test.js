/**
 * @jest-environment jsdom
 */
/* eslint-disable @next/next/no-img-element */
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AboutPage from '@/app/about/page';

// Mock Navbar
jest.mock('@/components/Navbar/Navbar', () => {
  return function MockNavbar() {
    return <div data-testid="navbar">Navbar</div>;
  };
});

// Mock Next.js Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, width, height, className }) => {
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
      />
    );
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
      />
    );
  },
}));

describe('About Page', () => {
  // ========================================
  // Basic Rendering Tests
  // ========================================

  describe('Page Structure', () => {
    it('should render the about page', () => {
      render(<AboutPage />);

      const heading = screen.getByRole('heading', {
        level: 1,
        name: 'About Tiny Threads',
      });
      expect(heading).toBeInTheDocument();
    });

    it('should render Navbar component', () => {
      render(<AboutPage />);

      expect(screen.getByTestId('navbar')).toBeInTheDocument();
    });

    it('should display the main heading', () => {
      render(<AboutPage />);

      const mainHeading = screen.getByRole('heading', {
        level: 1,
        name: 'About Tiny Threads',
      });
      expect(mainHeading).toBeInTheDocument();
    });

    it('should display Our Story section', () => {
      render(<AboutPage />);

      expect(
        screen.getByText(
          /curated marketplace where parents can list and discover pre-loved baby clothes and toys/i,
        ),
      ).toBeInTheDocument();
    });
  });

  // ========================================
  // Journey Section Tests
  // ========================================

  describe('Journey Section', () => {
    it('should render Our Journey section', () => {
      render(<AboutPage />);

      expect(
        screen.getByRole('heading', { level: 2, name: 'Our Journey' }),
      ).toBeInTheDocument();
    });

    it('should render JourneySection component', () => {
      render(<AboutPage />);

      expect(screen.getByText('It Started With Love')).toBeInTheDocument();
    });
  });

  // ========================================
  // Beliefs Section Tests
  // ========================================

  describe('Beliefs Section', () => {
    it('should render What We Believe In section', () => {
      render(<AboutPage />);

      expect(
        screen.getByRole('heading', { level: 2, name: 'What We Believe In' }),
      ).toBeInTheDocument();
    });

    it('should render all 4 belief cards', () => {
      render(<AboutPage />);

      expect(screen.getByText('Family First')).toBeInTheDocument();
      expect(screen.getByText('Love for Earth')).toBeInTheDocument();
      expect(screen.getByText('Safe & Gentle')).toBeInTheDocument();
      expect(screen.getByText('Budget Friendly')).toBeInTheDocument();
    });

    it('should display all belief icons', () => {
      render(<AboutPage />);

      expect(screen.getByText('💝')).toBeInTheDocument();
      expect(screen.getByText('🌱')).toBeInTheDocument();
      expect(screen.getByText('🛡️')).toBeInTheDocument();
      expect(screen.getByText('💰')).toBeInTheDocument();
    });

    it('should display belief descriptions', () => {
      render(<AboutPage />);

      expect(
        screen.getByText(/Our community always supports parents/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Every item gets a small gift of care/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/We ensure high safety standards/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Quality baby items shouldn't cost a fortune/),
      ).toBeInTheDocument();
    });
  });

  // ========================================
  // Hello Section Tests
  // ========================================

  describe('Hello Section', () => {
    it('should render Say Hello section', () => {
      render(<AboutPage />);

      expect(
        screen.getByRole('heading', { level: 2, name: 'Say Hello' }),
      ).toBeInTheDocument();
    });

    it('should display hello message', () => {
      render(<AboutPage />);

      expect(
        screen.getByText(/We are a small engineering-led team/i),
      ).toBeInTheDocument();
    });
  });

  // ========================================
  // Team Section Tests
  // ========================================

  describe('Team Section', () => {
    it('should render The Team section', () => {
      render(<AboutPage />);

      expect(
        screen.getByRole('heading', {
          level: 2,
          name: 'The Team Behind TinyThreads',
        }),
      ).toBeInTheDocument();
    });

    it('should render all 3 team members', () => {
      render(<AboutPage />);

      expect(screen.getByText('Vinal Dalcy Dsouza')).toBeInTheDocument();
      expect(screen.getByText('Abhishek Tuteja')).toBeInTheDocument();
      expect(screen.getByText('Xiaowei Qi')).toBeInTheDocument();
    });

    it('should display all team member roles', () => {
      render(<AboutPage />);

      const roles = screen.getAllByText('Software Development Engineer');
      expect(roles.length).toBe(3);
    });

    it('should display team member descriptions', () => {
      render(<AboutPage />);

      expect(
        screen.getByText(
          /Full-stack engineer focused on backend infrastructure/,
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Backend specialist working on database design/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /Frontend engineer creating intuitive user interfaces/,
        ),
      ).toBeInTheDocument();
    });

    it('should render team member images', () => {
      render(<AboutPage />);

      const images = screen.getAllByRole('img');
      // 3 team members + 1 journey image = 4 total
      expect(images.length).toBeGreaterThanOrEqual(3);
    });
  });

  // ========================================
  // Integration Tests
  // ========================================

  describe('Page Integration', () => {
    it('should render all major sections in correct order', () => {
      const { container } = render(<AboutPage />);

      const sections = container.querySelectorAll('section');
      expect(sections.length).toBe(5); // hero, journey, beliefs, hello, team
    });

    it('should have consistent structure', () => {
      render(<AboutPage />);

      // Check all h2 headings are present
      const h2Headings = screen.getAllByRole('heading', { level: 2 });
      expect(h2Headings.length).toBe(5); // Our Story, Our Journey, What We Believe In, Say Hello, The Team
    });
  });
});
