/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BackButton from '@/app/users/[id]/BackButton';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('BackButton', () => {
  let mockPush;
  let mockBack;

  beforeEach(() => {
    mockPush = jest.fn();
    mockBack = jest.fn();

    useRouter.mockReturnValue({
      push: mockPush,
      back: mockBack,
    });
  });

  test('renders with text "← Back"', () => {
    render(<BackButton />);
    expect(screen.getByText('← Back')).toBeInTheDocument();
  });

  test('calls router.push(returnUrl) when returnUrl prop is provided', () => {
    render(<BackButton returnUrl="/profile" />);
    const btn = screen.getByText('← Back');

    fireEvent.click(btn);

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith('/profile');
    expect(mockBack).not.toHaveBeenCalled();
  });

  test('calls router.back() when returnUrl is NOT provided', () => {
    render(<BackButton />);
    const btn = screen.getByText('← Back');

    fireEvent.click(btn);

    expect(mockBack).toHaveBeenCalledTimes(1);
    expect(mockPush).not.toHaveBeenCalled();
  });
});
