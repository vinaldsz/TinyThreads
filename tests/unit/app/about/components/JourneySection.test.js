/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import JourneySection from '@/app/about/components/JourneySection/JourneySection';

// Mock Next.js Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, width, height, className }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} width={width} height={height} className={className} />;
  },
}));

describe('JourneySection Component', () => {
  it('should render the journey section', () => {
    render(<JourneySection />);
    
    expect(screen.getByText('It Started With Love')).toBeInTheDocument();
  });

  it('should display the main heading', () => {
    render(<JourneySection />);
    
    const heading = screen.getByRole('heading', { level: 3, name: 'It Started With Love' });
    expect(heading).toBeInTheDocument();
  });

  it('should display the problem statement', () => {
    render(<JourneySection />);
    
    expect(screen.getByText(/parents waste hundreds of dollars annually/)).toBeInTheDocument();
  });

  it('should display the solution', () => {
    render(<JourneySection />);
    
    expect(screen.getByText(/What if technology could make selling baby items 10x faster/)).toBeInTheDocument();
  });

  it('should display the mission', () => {
    render(<JourneySection />);
    
    expect(screen.getByText(/making parenting more affordable and sustainable/)).toBeInTheDocument();
  });

  it('should display the journey image', () => {
    render(<JourneySection />);
    
    const image = screen.getByAltText('Happy child playing with toys');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/images/about/journey-child.png');
  });

  it('should display the image caption', () => {
    render(<JourneySection />);
    
    expect(screen.getByText(/Every toy deserves another chance to make someone smile/)).toBeInTheDocument();
  });

  it('should render all three paragraphs', () => {
    render(<JourneySection />);
    
    const paragraphs = screen.getAllByText(/parents|technology|platform/i);
    expect(paragraphs.length).toBeGreaterThanOrEqual(3);
  });
});