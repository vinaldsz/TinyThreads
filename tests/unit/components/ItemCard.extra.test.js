import { render, screen, fireEvent } from '@testing-library/react';

// We'll provide a different Image mock in this file to specifically exercise
// the image-error path by calling onError instead of onLoadingComplete.
jest.mock('next/image', () => {
  return function MockImage({ src, alt, onError }) {
    // Simulate an image error
    setTimeout(() => onError && onError(), 0);
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt} />
    );
  };
});

jest.mock('next/navigation', () => ({ useRouter: jest.fn() }));

import ItemCard from '@/components/ItemCard/ItemCard';
import { useRouter } from 'next/navigation';

describe('ItemCard extra branches', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    useRouter.mockReturnValue({ push: mockPush });
    mockPush.mockClear();
  });

  test('renders fallback condition label and default category icon', async () => {
    const item = {
      id: 'a1',
      title: 'Mystery Item',
      price: 1.5,
      condition: 'very-good',
      category: 'UnknownCategory',
      ageRange: '3Y',
      imageUrl: '/no-image.jpg',
      description: 'desc',
    };

    render(<ItemCard item={item} />);

    // Fallback condition should be title-cased (Very Good)
    expect(await screen.findByText('Very Good')).toBeInTheDocument();

    // Unknown category should show default icon (🛍️)
    expect(screen.getByText('🛍️')).toBeInTheDocument();
  });

  test('category-specific icons render for Toys and Books', () => {
    const toyItem = {
      id: 't1',
      title: 'Toy',
      price: 2,
      condition: 'good',
      category: 'Toys',
      ageRange: '2Y',
      imageUrl: '/i.jpg',
      description: '',
    };
    const bookItem = {
      id: 'b1',
      title: 'Book',
      price: 3,
      condition: 'new',
      category: 'Books',
      ageRange: 'N/A',
      imageUrl: '/i.jpg',
      description: '',
    };

    render(<ItemCard item={toyItem} />);
    expect(screen.getByText('🧸')).toBeInTheDocument();

    render(<ItemCard item={bookItem} />);
    expect(screen.getByText('📚')).toBeInTheDocument();
  });

  test('image error path shows No Image container and still navigates on click', async () => {
    const item = {
      id: 'err1',
      title: 'Broken Image',
      price: 0.5,
      condition: 'fair',
      category: 'Other',
      ageRange: '0-1',
      imageUrl: '/broken.jpg',
      description: 'no img',
    };

    render(<ItemCard item={item} />);

    // When mock Image calls onError it should render the No Image text
    expect(await screen.findByText('No Image')).toBeInTheDocument();

    // Clicking the card still triggers navigation
    const card = screen.getByText('Broken Image').closest('div');
    fireEvent.click(card);
    expect(mockPush).toHaveBeenCalledWith('/Items/err1');
  });
});
