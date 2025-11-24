/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TeamCard from '@/app/about/components/TeamCard/TeamCard';

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
  },
}));

describe('TeamCard Component', () => {
  const mockProps = {
    name: 'Vinal Dalcy Dsouza',
    role: 'Software Development Engineer',
    description:
      'Full-stack engineer focused on backend infrastructure, API development, and system architecture for TinyThreads.',
    image: '/images/about/team/member-1.png',
    altText: 'Vinal Dalcy Dsouza, Software Development Engineer',
  };

  it('should render the team card', () => {
    render(<TeamCard {...mockProps} />);

    expect(screen.getByText('Vinal Dalcy Dsouza')).toBeInTheDocument();
    expect(
      screen.getByText('Software Development Engineer'),
    ).toBeInTheDocument();
  });

  it('should display team member name as h3', () => {
    render(<TeamCard {...mockProps} />);

    const name = screen.getByRole('heading', {
      level: 3,
      name: 'Vinal Dalcy Dsouza',
    });
    expect(name).toBeInTheDocument();
  });

  it('should display team member role', () => {
    render(<TeamCard {...mockProps} />);

    expect(
      screen.getByText('Software Development Engineer'),
    ).toBeInTheDocument();
  });

  it('should display team member description', () => {
    render(<TeamCard {...mockProps} />);

    expect(
      screen.getByText(/Full-stack engineer focused on backend infrastructure/),
    ).toBeInTheDocument();
  });

  it('should display team member image', () => {
    render(<TeamCard {...mockProps} />);

    const image = screen.getByAltText(
      'Vinal Dalcy Dsouza, Software Development Engineer',
    );
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/images/about/team/member-1.png');
  });

  it('should render with different team member data', () => {
    const customProps = {
      name: 'Xiaowei Qi',
      role: 'Frontend Engineer',
      description: 'Creates beautiful user interfaces.',
      image: '/images/about/team/member-3.png',
      altText: 'Xiaowei Qi, Frontend Engineer',
    };

    render(<TeamCard {...customProps} />);

    expect(screen.getByText('Xiaowei Qi')).toBeInTheDocument();
    expect(screen.getByText('Frontend Engineer')).toBeInTheDocument();
    expect(
      screen.getByText('Creates beautiful user interfaces.'),
    ).toBeInTheDocument();
  });

  it('should have correct image dimensions', () => {
    render(<TeamCard {...mockProps} />);

    const image = screen.getByAltText(mockProps.altText);
    expect(image).toHaveAttribute('width', '120');
    expect(image).toHaveAttribute('height', '120');
  });
});
