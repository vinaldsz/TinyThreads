/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import ItemCard from '@/components/ItemCard/ItemCard';

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function MockImage({
    src,
    alt,
    fill,
    onLoadingComplete,
    onError,
    className,
    ...props
  }) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={className}
        {...props}
        {...(fill ? { 'data-fill': 'true' } : {})}
        onLoad={() => onLoadingComplete && onLoadingComplete()}
        onError={() => onError && onError()}
      />
    );
  };
});

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock console.log
const originalLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});

afterAll(() => {
  console.log = originalLog;
});

describe('ItemCard Component', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    useRouter.mockReturnValue({
      push: mockPush,
    });
    mockPush.mockClear();
  });

  const mockItem = {
    id: '123',
    title: 'Baby Onesie 6M',
    price: 5.99,
    condition: 'like-new',
    category: 'Clothing',
    ageRange: '6M',
    imageUrl: '/test-image.jpg',
    description: 'Cute baby onesie, barely worn',
  };

  // ========================================
  // Basic Rendering Tests
  // ========================================

  describe('Basic Rendering', () => {
    test('renders item card with basic information', () => {
      render(<ItemCard item={mockItem} />);

      expect(screen.getByText('Baby Onesie 6M')).toBeInTheDocument();
      expect(screen.getByText('$5.99')).toBeInTheDocument();
      expect(screen.getByText('Like New')).toBeInTheDocument();
      expect(screen.getByText('Clothing')).toBeInTheDocument();
      expect(screen.getByText('6M')).toBeInTheDocument();
      expect(screen.getByText('Cute baby onesie, barely worn')).toBeInTheDocument();
    });

    test('shows View Details button', () => {
      render(<ItemCard item={mockItem} />);
      expect(screen.getByText('View Details')).toBeInTheDocument();
    });

    test('displays item image', () => {
      render(<ItemCard item={mockItem} />);
      const image = screen.getByAltText('Baby Onesie 6M');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', '/test-image.jpg');
    });
  });

  // ========================================
  // Category Icon Tests
  // ========================================

  describe('Category Icons', () => {
    test('displays clothing icon for Clothing category', () => {
      render(<ItemCard item={{ ...mockItem, category: 'Clothing' }} />);
      expect(screen.getAllByText('👕').length).toBeGreaterThan(0);
    });

    test('displays toys icon for Toys category', () => {
      render(<ItemCard item={{ ...mockItem, category: 'Toys' }} />);
      expect(screen.getAllByText('🧸').length).toBeGreaterThan(0);
    });

    test('displays books icon for Books category', () => {
      render(<ItemCard item={{ ...mockItem, category: 'Books' }} />);
      expect(screen.getAllByText('📚').length).toBeGreaterThan(0);
    });

    test('displays gear icon for Gear category', () => {
      render(<ItemCard item={{ ...mockItem, category: 'Gear' }} />);
      expect(screen.getAllByText('🍼').length).toBeGreaterThan(0);
    });

    test('displays other icon for Other category', () => {
      render(<ItemCard item={{ ...mockItem, category: 'Other' }} />);
      expect(screen.getAllByText('✨').length).toBeGreaterThan(0);
    });

    test('displays default icon for unknown category', () => {
      render(<ItemCard item={{ ...mockItem, category: 'Unknown' }} />);
      expect(screen.getAllByText('🛍️').length).toBeGreaterThan(0);
    });
  });

  // ========================================
  // Condition Label Tests
  // ========================================

  describe('Condition Labels', () => {
    test('displays New for new condition', () => {
      render(<ItemCard item={{ ...mockItem, condition: 'new' }} />);
      expect(screen.getByText('New')).toBeInTheDocument();
    });

    test('displays Like New for like-new condition', () => {
      render(<ItemCard item={{ ...mockItem, condition: 'like-new' }} />);
      expect(screen.getByText('Like New')).toBeInTheDocument();
    });

    test('displays Good for good condition', () => {
      render(<ItemCard item={{ ...mockItem, condition: 'good' }} />);
      expect(screen.getByText('Good')).toBeInTheDocument();
    });

    test('displays Fair for fair condition', () => {
      render(<ItemCard item={{ ...mockItem, condition: 'fair' }} />);
      expect(screen.getByText('Fair')).toBeInTheDocument();
    });

    test('handles empty condition gracefully', () => {
      render(<ItemCard item={{ ...mockItem, condition: '' }} />);
      expect(screen.queryByText('New')).not.toBeInTheDocument();
    });

    test('prettifies unknown condition with hyphens', () => {
      render(<ItemCard item={{ ...mockItem, condition: 'barely-used' }} />);
      expect(screen.getByText('Barely Used')).toBeInTheDocument();
    });
  });

  // ========================================
  // Navigation Tests
  // ========================================

  describe('Navigation', () => {
    test('navigates to item detail when card is clicked', () => {
      render(<ItemCard item={mockItem} />);

      const card = screen.getByText('Baby Onesie 6M').closest('div');
      fireEvent.click(card);

      expect(mockPush).toHaveBeenCalledWith('/Items/123');
    });

    test('logs navigation information', () => {
      render(<ItemCard item={mockItem} />);

      const card = screen.getByText('Baby Onesie 6M').closest('div');
      fireEvent.click(card);

      expect(console.log).toHaveBeenCalledWith('Navigating to:', '/items/123');
      expect(console.log).toHaveBeenCalledWith('Item ID:', '123');
    });
  });

  // ========================================
  // Image Loading Tests
  // ========================================

  describe('Image Loading States', () => {
    test('shows loading overlay initially', () => {
      const { container } = render(<ItemCard item={mockItem} />);
      expect(container.querySelector('.loadingOverlay')).toBeInTheDocument();
    });

    test('hides loading overlay after image loads', async () => {
      const { container } = render(<ItemCard item={mockItem} />);

      const image = screen.getByAltText('Baby Onesie 6M');
      fireEvent.load(image);

      await waitFor(() => {
        expect(container.querySelector('.loadingOverlay')).not.toBeInTheDocument();
      });
    });

    test('shows no image placeholder on image error', async () => {
      const { container } = render(<ItemCard item={mockItem} />);

      const image = screen.getByAltText('Baby Onesie 6M');
      fireEvent.error(image);

      await waitFor(() => {
        expect(screen.getByText('No Image')).toBeInTheDocument();
      });

      expect(container.querySelector('.noImageContainer')).toBeInTheDocument();
    });

    test('displays category icon in no image placeholder', async () => {
      render(<ItemCard item={mockItem} />);

      const image = screen.getByAltText('Baby Onesie 6M');
      fireEvent.error(image);

      await waitFor(() => {
        expect(screen.getByText('No Image')).toBeInTheDocument();
      });

      expect(screen.getAllByText('👕').length).toBeGreaterThan(0);
    });
  });

  // ========================================
  // Multiple Images / Carousel Tests
  // ========================================

  describe('Image Carousel', () => {
    const itemWithMultipleImages = {
      ...mockItem,
      imageUrls: [
        '/image1.jpg',
        '/image2.jpg',
        '/image3.jpg',
      ],
    };

    test('shows carousel controls for multiple images', () => {
      render(<ItemCard item={itemWithMultipleImages} />);

      expect(screen.getByText('1/3')).toBeInTheDocument();
      expect(screen.getByText('‹')).toBeInTheDocument();
      expect(screen.getByText('›')).toBeInTheDocument();
    });

    test('does NOT show carousel controls for single image', () => {
      render(<ItemCard item={mockItem} />);

      expect(screen.queryByText('1/1')).not.toBeInTheDocument();
      expect(screen.queryByText('‹')).not.toBeInTheDocument();
      expect(screen.queryByText('›')).not.toBeInTheDocument();
    });

    test('navigates to next image', () => {
      render(<ItemCard item={itemWithMultipleImages} />);

      expect(screen.getByText('1/3')).toBeInTheDocument();

      const nextButton = screen.getByText('›');
      fireEvent.click(nextButton);

      expect(screen.getByText('2/3')).toBeInTheDocument();
    });

    test('navigates to previous image', () => {
      render(<ItemCard item={itemWithMultipleImages} />);

      expect(screen.getByText('1/3')).toBeInTheDocument();

      const prevButton = screen.getByText('‹');
      fireEvent.click(prevButton);

      expect(screen.getByText('3/3')).toBeInTheDocument(); // Wraps to last
    });

    test('wraps from last to first image when clicking next', () => {
      render(<ItemCard item={itemWithMultipleImages} />);

      const nextButton = screen.getByText('›');
      
      fireEvent.click(nextButton); // 1 -> 2
      fireEvent.click(nextButton); // 2 -> 3
      fireEvent.click(nextButton); // 3 -> 1 (wrap)

      expect(screen.getByText('1/3')).toBeInTheDocument();
    });

    test('carousel buttons stop event propagation', () => {
      render(<ItemCard item={itemWithMultipleImages} />);

      const nextButton = screen.getByText('›');
      fireEvent.click(nextButton);

      // Card click should not be triggered
      expect(mockPush).not.toHaveBeenCalled();
    });

    test('previous button stops event propagation', () => {
      render(<ItemCard item={itemWithMultipleImages} />);

      const prevButton = screen.getByText('‹');
      fireEvent.click(prevButton);

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  // ========================================
  // Edge Cases
  // ========================================

  describe('Edge Cases', () => {
    test('handles item with imageUrls array', () => {
      const itemWithUrls = {
        ...mockItem,
        imageUrls: ['/image1.jpg', '/image2.jpg'],
      };

      render(<ItemCard item={itemWithUrls} />);

      const image = screen.getByAltText('Baby Onesie 6M');
      expect(image).toHaveAttribute('src', '/image1.jpg');
    });

    test('falls back to imageUrl when imageUrls is empty', () => {
      const itemWithSingleUrl = {
        ...mockItem,
        imageUrls: [],
        imageUrl: '/single-image.jpg',
      };

      render(<ItemCard item={itemWithSingleUrl} />);

      const image = screen.getByAltText('Baby Onesie 6M');
      expect(image).toHaveAttribute('src', '/single-image.jpg');
    });

    test('handles missing description', () => {
      const itemWithoutDescription = {
        ...mockItem,
        description: undefined,
      };

      render(<ItemCard item={itemWithoutDescription} />);

      expect(screen.getByText('Baby Onesie 6M')).toBeInTheDocument();
    });

    test('handles missing ageRange', () => {
      const itemWithoutAge = {
        ...mockItem,
        ageRange: undefined,
      };

      render(<ItemCard item={itemWithoutAge} />);

      expect(screen.getByText('Baby Onesie 6M')).toBeInTheDocument();
    });
  });

  // ========================================
  // Condition Class Tests
  // ========================================

  describe('Condition Classes', () => {
    test('applies correct class for new condition', () => {
      const { container } = render(<ItemCard item={{ ...mockItem, condition: 'new' }} />);
      
      const conditionBadge = container.querySelector('.conditionNew');
      expect(conditionBadge).toBeInTheDocument();
    });

    test('applies correct class for like-new condition', () => {
      const { container } = render(<ItemCard item={{ ...mockItem, condition: 'like-new' }} />);
      
      const conditionBadge = container.querySelector('.conditionLikeNew');
      expect(conditionBadge).toBeInTheDocument();
    });

    test('applies correct class for good condition', () => {
      const { container } = render(<ItemCard item={{ ...mockItem, condition: 'good' }} />);
      
      const conditionBadge = container.querySelector('.conditionGood');
      expect(conditionBadge).toBeInTheDocument();
    });

    test('applies correct class for fair condition', () => {
      const { container } = render(<ItemCard item={{ ...mockItem, condition: 'fair' }} />);
      
      const conditionBadge = container.querySelector('.conditionFair');
      expect(conditionBadge).toBeInTheDocument();
    });

    test('applies default class for unknown condition', () => {
      const { container } = render(<ItemCard item={{ ...mockItem, condition: 'unknown' }} />);
      
      const conditionBadge = container.querySelector('.conditionDefault');
      expect(conditionBadge).toBeInTheDocument();
    });
  });

  // ========================================
  // Image Array Handling Tests
  // ========================================

  describe('Image Array Handling', () => {
    test('uses imageUrls array when available', () => {
      const item = {
        ...mockItem,
        imageUrls: ['/img1.jpg', '/img2.jpg'],
      };

      render(<ItemCard item={item} />);

      const image = screen.getByAltText('Baby Onesie 6M');
      expect(image).toHaveAttribute('src', '/img1.jpg');
    });

    test('uses imageUrl when imageUrls is not an array', () => {
      const item = {
        ...mockItem,
        imageUrls: null,
        imageUrl: '/fallback.jpg',
      };

      render(<ItemCard item={item} />);

      const image = screen.getByAltText('Baby Onesie 6M');
      expect(image).toHaveAttribute('src', '/fallback.jpg');
    });

    test('uses imageUrl when imageUrls is empty array', () => {
      const item = {
        ...mockItem,
        imageUrls: [],
        imageUrl: '/fallback.jpg',
      };

      render(<ItemCard item={item} />);

      const image = screen.getByAltText('Baby Onesie 6M');
      expect(image).toHaveAttribute('src', '/fallback.jpg');
    });
  });

  // ========================================
  // All Categories Test
  // ========================================

  describe('All Category Icons', () => {
    test('displays correct icons for all categories', () => {
      const categories = [
        { name: 'Clothing', icon: '👕' },
        { name: 'Toys', icon: '🧸' },
        { name: 'Books', icon: '📚' },
        { name: 'Gear', icon: '🍼' },
        { name: 'Other', icon: '✨' },
        { name: 'Random', icon: '🛍️' },
      ];

      categories.forEach(({ name, icon }) => {
        const { container } = render(
          <ItemCard item={{ ...mockItem, category: name }} />
        );
        
        expect(screen.getAllByText(icon).length).toBeGreaterThan(0);
        container.remove(); // Clean up
      });
    });
  });

  // ========================================
  // All Conditions Test
  // ========================================

  describe('All Condition Labels', () => {
    test('handles all condition values correctly', () => {
      const conditions = [
        { value: 'new', label: 'New' },
        { value: 'like-new', label: 'Like New' },
        { value: 'good', label: 'Good' },
        { value: 'fair', label: 'Fair' },
        { value: 'custom-condition', label: 'Custom Condition' },
      ];

      conditions.forEach(({ value, label }) => {
        const { container } = render(
          <ItemCard item={{ ...mockItem, condition: value }} />
        );
        
        expect(screen.getByText(label)).toBeInTheDocument();
        container.remove();
      });
    });
  });

  // ========================================
  // Price Display Tests
  // ========================================

  describe('Price Display', () => {
    test('displays price with dollar sign', () => {
      render(<ItemCard item={{ ...mockItem, price: 10.5 }} />);
      expect(screen.getByText('$10.5')).toBeInTheDocument();
    });

    test('displays integer prices', () => {
      render(<ItemCard item={{ ...mockItem, price: 20 }} />);
      expect(screen.getByText('$20')).toBeInTheDocument();
    });

    test('displays decimal prices', () => {
      render(<ItemCard item={{ ...mockItem, price: 15.99 }} />);
      expect(screen.getByText('$15.99')).toBeInTheDocument();
    });
  });
});