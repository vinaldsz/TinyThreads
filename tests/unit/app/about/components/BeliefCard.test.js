/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import BeliefCard from '@/app/about/components/BeliefCard/BeliefCard';

describe('BeliefCard Component', () => {
  const mockProps = {
    icon: '💝',
    title: 'Family First',
    description:
      'Our community always supports parents, sharing resources and kindness.',
  };

  it('should render the card', () => {
    render(<BeliefCard {...mockProps} />);

    expect(screen.getByText('💝')).toBeInTheDocument();
    expect(screen.getByText('Family First')).toBeInTheDocument();
    expect(
      screen.getByText(/Our community always supports parents/),
    ).toBeInTheDocument();
  });

  it('should display the icon', () => {
    render(<BeliefCard {...mockProps} />);

    const icon = screen.getByText('💝');
    expect(icon).toBeInTheDocument();
  });

  it('should display the title as h3', () => {
    render(<BeliefCard {...mockProps} />);

    const title = screen.getByRole('heading', {
      level: 3,
      name: 'Family First',
    });
    expect(title).toBeInTheDocument();
  });

  it('should display the description', () => {
    render(<BeliefCard {...mockProps} />);

    expect(screen.getByText(mockProps.description)).toBeInTheDocument();
  });

  it('should render with different icons', () => {
    const { rerender } = render(<BeliefCard {...mockProps} />);
    expect(screen.getByText('💝')).toBeInTheDocument();

    rerender(<BeliefCard {...mockProps} icon="🌱" />);
    expect(screen.getByText('🌱')).toBeInTheDocument();
  });

  it('should render with different titles and descriptions', () => {
    const customProps = {
      icon: '🛡️',
      title: 'Safe & Gentle',
      description: 'We ensure high safety standards.',
    };

    render(<BeliefCard {...customProps} />);

    expect(screen.getByText('Safe & Gentle')).toBeInTheDocument();
    expect(
      screen.getByText('We ensure high safety standards.'),
    ).toBeInTheDocument();
  });
});
