import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import ItemDetail from '@/components/ItemDetail/ItemDetail'; // Import current version, not ItemDetail 2
import { getItemById } from '@/services/itemService'; // Current version uses getItemById
import { useRouter } from 'next/navigation';

// Mock Next.js router
const mockPush = jest.fn();
const mockBack = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, className, width, height, ...props }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      {...props}
    />
  ),
}));

// Mock itemService - current version uses getItemById
jest.mock('@/services/itemService', () => ({
  getItemById: jest.fn(),
}));

// Mock CSS modules
jest.mock('@/components/ItemDetail/ItemDetail.module.css', () => ({
  loading: 'loading',
  loadingSpinner: 'loadingSpinner',
  notFound: 'notFound',
  backButton: 'backButton',
  container: 'container',
  header: 'header',
  content: 'content',
  imageSection: 'imageSection',
  mainImage: 'mainImage',
  productImage: 'productImage',
  noImage: 'noImage',
  statusBadge: 'statusBadge',
  available: 'available',
  detailsSection: 'detailsSection',
  productInfo: 'productInfo',
  title: 'title',
  priceAndCondition: 'priceAndCondition',
  price: 'price',
  condition: 'condition',
  likenew: 'likenew',
  good: 'good',
  fair: 'fair',
  basicInfo: 'basicInfo',
  infoItem: 'infoItem',
  label: 'label',
  description: 'description',
  safetyNotice: 'safetyNotice',
}));

// Mock console methods
const originalError = console.error;
const originalLog = console.log;
beforeAll(() => {
  console.error = jest.fn();
  console.log = jest.fn();
});

afterAll(() => {
  console.error = originalError;
  console.log = originalLog;
});

describe('ItemDetail (Current Version)', () => {
  const mockRouter = {
    push: mockPush,
    back: mockBack,
  };

  // Current version uses different data structure (matches MongoDB schema)
  const mockItem = {
    _id: 'item-1',
    title: 'Test Item',
    price: 25,
    condition: 'Like New',
    size: 'Medium',
    ageRange: '2-3 years',
    category: 'Clothing',
    location: 'San Francisco',
    description: 'Test description for the item',
    imageUrl: 'https://example.com/image.jpg',
    status: 'available',
    sellerId: 'seller1',
    createdAt: new Date(),
  };

  beforeEach(() => {
    useRouter.mockReturnValue(mockRouter);
    getItemById.mockResolvedValue(mockItem);
    mockPush.mockClear();
    mockBack.mockClear();
    getItemById.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    test('displays loading state initially', async () => {
      getItemById.mockImplementation(() => new Promise(() => {})); // Never resolves

      await act(async () => {
        render(<ItemDetail itemId="item-1" />);
      });

      expect(screen.getByText('Loading item details...')).toBeInTheDocument();
      expect(screen.getByText('Loading item details...')).toBeInTheDocument();
    });

    test('shows loading spinner', async () => {
      getItemById.mockImplementation(() => new Promise(() => {}));

      let container;
      await act(async () => {
        const result = render(<ItemDetail itemId="item-1" />);
        container = result.container;
      });

      expect(container.querySelector('.loadingSpinner')).toBeInTheDocument();
    });
  });

  describe('Item Not Found', () => {
    test('displays not found message when item does not exist', async () => {
      getItemById.mockResolvedValue(null);

      await act(async () => {
        render(<ItemDetail itemId="non-existent" />);
      });

      await waitFor(() => {
        expect(screen.getByText('Item Not Found')).toBeInTheDocument();
      });

      expect(
        screen.getByText(
          'The item you are looking for does not exist or has been removed.',
        ),
      ).toBeInTheDocument();
    });

    test('handles back navigation from not found page', async () => {
      getItemById.mockResolvedValue(null);

      await act(async () => {
        render(<ItemDetail itemId="non-existent" />);
      });

      await waitFor(() => {
        expect(screen.getByText('Item Not Found')).toBeInTheDocument();
      });

      const backButton = screen.getByText('← Go Back');
      fireEvent.click(backButton);

      expect(mockBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('Successful Item Loading', () => {
    test('displays item details correctly', async () => {
      await act(async () => {
        render(<ItemDetail itemId="item-1" />);
      });

      await waitFor(() => {
        expect(screen.getByText('Test Item')).toBeInTheDocument();
      });

      expect(screen.getByText('$25.00')).toBeInTheDocument(); // Current version uses formatPrice
      expect(screen.getByText(/Condition:\s*Like New/i)).toBeInTheDocument();
      expect(screen.getByText('Medium (2-3 years)')).toBeInTheDocument();
      expect(screen.getByText('Clothing')).toBeInTheDocument();
      expect(screen.getByText('San Francisco')).toBeInTheDocument();
      expect(
        screen.getByText('Test description for the item'),
      ).toBeInTheDocument();
    });

    test('displays item image with correct attributes', async () => {
      await act(async () => {
        render(<ItemDetail itemId="item-1" />);
      });

      await waitFor(() => {
        const image = screen.getByAltText('Test Item');
        expect(image.src).toBe('https://example.com/image.jpg');
        expect(image).toHaveClass('productImage');
      });
    });

    test('displays no image placeholder when imageUrl is missing', async () => {
      const itemWithoutImage = { ...mockItem, imageUrl: null };
      getItemById.mockResolvedValue(itemWithoutImage);

      await act(async () => {
        render(<ItemDetail itemId="item-1" />);
      });

      await waitFor(() => {
        expect(screen.getByText('No image available')).toBeInTheDocument();
      });
    });

    test('displays available status badge', async () => {
      await act(async () => {
        render(<ItemDetail itemId="item-1" />);
      });

      await waitFor(() => {
        expect(screen.getByText('✓ Available')).toBeInTheDocument();
      });
    });

    test('displays correct status for non-available items', async () => {
      const soldItem = { ...mockItem, status: 'sold' };
      getItemById.mockResolvedValue(soldItem);

      await act(async () => {
        render(<ItemDetail itemId="item-1" />);
      });

      await waitFor(() => {
        expect(screen.getByText('sold')).toBeInTheDocument();
      });
    });
  });

  describe('Price Formatting', () => {
    test('formats numeric prices correctly', async () => {
      const itemWithDecimalPrice = { ...mockItem, price: 25.5 };
      getItemById.mockResolvedValue(itemWithDecimalPrice);

      await act(async () => {
        render(<ItemDetail itemId="item-1" />);
      });

      await waitFor(() => {
        expect(screen.getByText('$25.50')).toBeInTheDocument();
      });
    });

    test('handles string prices', async () => {
      const itemWithStringPrice = { ...mockItem, price: '25' };
      getItemById.mockResolvedValue(itemWithStringPrice);

      await act(async () => {
        render(<ItemDetail itemId="item-1" />);
      });

      await waitFor(() => {
        expect(screen.getByText('$25.00')).toBeInTheDocument();
      });
    });

    test('handles invalid prices gracefully', async () => {
      const itemWithInvalidPrice = { ...mockItem, price: 'invalid' };
      getItemById.mockResolvedValue(itemWithInvalidPrice);

      await act(async () => {
        render(<ItemDetail itemId="item-1" />);
      });

      await waitFor(() => {
        expect(screen.getByText('$invalid')).toBeInTheDocument();
      });
    });
  });

  describe('Field Safety (Null/Undefined Handling)', () => {
    test('handles missing optional fields gracefully', async () => {
      const itemWithMissingFields = {
        _id: 'item-1',
        title: 'Test Item',
        price: 25,
        status: 'available',
        // Missing: condition, size, ageRange, category, location, description
      };
      getItemById.mockResolvedValue(itemWithMissingFields);

      await act(async () => {
        render(<ItemDetail itemId="item-1" />);
      });

      await waitFor(() => {
        expect(screen.getByText('Test Item')).toBeInTheDocument();
      });

      // Should display "—" for missing fields
      expect(screen.getAllByText('—')).toHaveLength(4); // condition, size/age, category, location, description
    });
  });

  describe('Navigation', () => {
    test('handles back navigation from header', async () => {
      await act(async () => {
        render(<ItemDetail itemId="item-1" />);
      });

      await waitFor(() => {
        expect(screen.getByText('← Back to Browse')).toBeInTheDocument();
      });

      const backButton = screen.getByText('← Back to Browse');
      fireEvent.click(backButton);

      expect(mockBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error Handling', () => {
    test('handles API error gracefully', async () => {
      const errorMessage = 'API Error';
      getItemById.mockRejectedValue(new Error(errorMessage));

      await act(async () => {
        render(<ItemDetail itemId="item-1" />);
      });

      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith(
          'Error fetching item:',
          expect.any(Error),
        );
      });

      await waitFor(() => {
        expect(screen.getByText('Item Not Found')).toBeInTheDocument();
      });
    });
  });

  describe('Conditional Rendering', () => {
    test('does not fetch item when itemId is not provided', async () => {
      await act(async () => {
        render(<ItemDetail itemId={null} />);
      });

      expect(getItemById).not.toHaveBeenCalled();
    });

    test('fetches item when itemId is provided', async () => {
      await act(async () => {
        render(<ItemDetail itemId="item-1" />);
      });

      expect(getItemById).toHaveBeenCalledWith('item-1');
      expect(getItemById).toHaveBeenCalledTimes(1);
    });
  });

  // Condition Styling test block removed as requested
  describe('Condition Styling', () => {
    test('handles empty condition gracefully', async () => {
      const itemWithEmptyCondition = {
        ...mockItem,
        condition: '',
      };
      getItemById.mockResolvedValue(itemWithEmptyCondition);

      await act(async () => {
        render(<ItemDetail itemId="item-1" />);
      });

      await waitFor(() => {
        // Condition no longer renders a placeholder — it renders nothing
        const missingCondition = screen.queryByText('—');
        expect(missingCondition).not.toBeInTheDocument();
      });
    });
  });

  describe('Image Carousel', () => {
    test('renders carousel for multiple images and allows navigation', async () => {
      const itemWithMultipleImages = {
        ...mockItem,
        imageUrls: [
          'https://example.com/image1.jpg',
          'https://example.com/image2.jpg',
        ],
        imageUrl: null,
      };
      getItemById.mockResolvedValue(itemWithMultipleImages);

      await act(async () => {
        render(<ItemDetail itemId="item-1" />);
      });

      // Initial image and counter
      await waitFor(() => {
        const image = screen.getByAltText('Test Item');
        expect(image).toBeInTheDocument();
        expect(image.src).toBe('https://example.com/image1.jpg');
      });

      expect(screen.getByText('1/2')).toBeInTheDocument();

      // Go to next image
      fireEvent.click(screen.getByText('›'));

      await waitFor(() => {
        const image = screen.getByAltText('Test Item');
        expect(screen.getByText('2/2')).toBeInTheDocument();
        expect(image.src).toBe('https://example.com/image2.jpg');
      });

      // Go back to previous image
      fireEvent.click(screen.getByText('‹'));

      await waitFor(() => {
        const image = screen.getByAltText('Test Item');
        expect(screen.getByText('1/2')).toBeInTheDocument();
        expect(image.src).toBe('https://example.com/image1.jpg');
      });
    });
  });

  describe('Safety Notice', () => {
    test('displays safety tips', async () => {
      await act(async () => {
        render(<ItemDetail itemId="item-1" />);
      });

      await waitFor(() => {
        expect(screen.getByText('🛡️ Safety Tips')).toBeInTheDocument();
      });

      expect(
        screen.getByText(
          'Meet in a public place like a library, coffee shop, or mall',
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Bring a friend if possible'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Inspect items carefully before payment'),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          'Trust your instincts — if something feels off, walk away',
        ),
      ).toBeInTheDocument();
    });
  });

  describe('Development Environment', () => {
    test('logs item data in development', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      await act(async () => {
        render(<ItemDetail itemId="item-1" />);
      });

      await waitFor(() => {
        expect(console.log).toHaveBeenCalledWith(
          'ItemDetail loaded item:',
          mockItem,
        );
      });

      process.env.NODE_ENV = originalEnv;
    });

    test('does not log in production', async () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      await act(async () => {
        render(<ItemDetail itemId="item-1" />);
      });

      await waitFor(() => {
        expect(screen.getByText('Test Item')).toBeInTheDocument();
      });

      expect(console.log).not.toHaveBeenCalledWith(
        'ItemDetail loaded item:',
        expect.anything(),
      );

      process.env.NODE_ENV = originalEnv;
    });
  });
});
