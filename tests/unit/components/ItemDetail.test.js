/**
 * @jest-environment jsdom
 */
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import ItemDetail from '@/components/ItemDetail/ItemDetail';
import { getItemById } from '@/services/itemService';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

// Mock Next.js router
const mockPush = jest.fn();
const mockBack = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

// Mock Navbar
jest.mock('@/components/Navbar/Navbar', () => {
  return function MockNavbar() {
    return <nav data-testid="navbar">Navbar</nav>;
  };
});

// Mock PurchaseModal
jest.mock('@/components/ItemDetail/PurchaseModal', () => {
  return function MockPurchaseModal({ item, onClose, onSuccess }) {
    return (
      <div data-testid="purchase-modal">
        <h2>Purchase Modal</h2>
        <p>Item: {item.title}</p>
        <button onClick={onClose}>Close</button>
        <button onClick={onSuccess}>Complete Purchase</button>
      </div>
    );
  };
});

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

// Mock itemService
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
  sold: 'sold',
  detailsSection: 'detailsSection',
  productInfo: 'productInfo',
  title: 'title',
  priceAndCondition: 'priceAndCondition',
  price: 'price',
  condition: 'condition',
  likenew: 'likenew',
  good: 'good',
  fair: 'fair',
  new: 'new',
  basicInfo: 'basicInfo',
  infoItem: 'infoItem',
  label: 'label',
  description: 'description',
  safetyNotice: 'safetyNotice',
  purchaseSection: 'purchaseSection',
  buyButton: 'buyButton',
  loginButton: 'loginButton',
  soldNotice: 'soldNotice',
  carouselControls: 'carouselControls',
  carouselBtn: 'carouselBtn',
  carouselCounter: 'carouselCounter',
  thumbnailStrip: 'thumbnailStrip',
  thumbnailBtn: 'thumbnailBtn',
  activeThumb: 'activeThumb',
  thumbnailImage: 'thumbnailImage',
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

describe('ItemDetail Component', () => {
  const mockRouter = {
    push: mockPush,
    back: mockBack,
  };

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
    useSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });
    mockPush.mockClear();
    mockBack.mockClear();
    getItemById.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    test('displays loading state initially', async () => {
      getItemById.mockImplementation(() => new Promise(() => {}));

      await act(async () => {
        render(<ItemDetail itemId="item-1" />);
      });

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

      expect(screen.getByText('$25.00')).toBeInTheDocument();
      expect(screen.getByText('Like New')).toBeInTheDocument();
      expect(screen.getByText(/Medium.*2-3 years/)).toBeInTheDocument();
      expect(screen.getByText('Clothing')).toBeInTheDocument();
      expect(screen.getByText('San Francisco')).toBeInTheDocument();
      expect(screen.getByText('Test description for the item')).toBeInTheDocument();
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
      const itemWithoutImage = { ...mockItem, imageUrl: null, imageUrls: [] };
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
      };
      getItemById.mockResolvedValue(itemWithMissingFields);

      await act(async () => {
        render(<ItemDetail itemId="item-1" />);
      });

      await waitFor(() => {
        expect(screen.getByText('Test Item')).toBeInTheDocument();
      });

      const dashes = screen.getAllByText('—');
      expect(dashes.length).toBeGreaterThanOrEqual(1);
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

  describe('Condition Styling', () => {
    test('applies correct CSS class for condition', async () => {
      const itemWithCondition = {
        ...mockItem,
        condition: 'Like New',
      };
      getItemById.mockResolvedValue(itemWithCondition);

      let container;
      await act(async () => {
        const result = render(<ItemDetail itemId="item-1" />);
        container = result.container;
      });

      await waitFor(() => {
        const conditionElement = container.querySelector('.condition');
        expect(conditionElement).toBeInTheDocument();
        expect(conditionElement).toHaveTextContent('Like New');
      });
    });

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
        expect(screen.getByText('—')).toBeInTheDocument();
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
      expect(screen.getByText('Bring a friend if possible')).toBeInTheDocument();
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

  // ========================================
  // NEW: Purchase Functionality Tests
  // ========================================

  describe('Purchase Functionality - User Logged In', () => {
    beforeEach(() => {
      useSession.mockReturnValue({
        data: { 
          user: { 
            id: 'user123', 
            name: 'Test User', 
            email: 'test@example.com' 
          } 
        },
        status: 'authenticated',
      });
    });

    test('should show Buy Now button for available items', async () => {
      await act(async () => {
        render(<ItemDetail itemId="item-1" />);
      });

      await waitFor(() => {
        expect(screen.getByText('Buy Now')).toBeInTheDocument();
      });
    });

    test('should open purchase modal when Buy Now is clicked', async () => {
      await act(async () => {
        render(<ItemDetail itemId="item-1" />);
      });

      await waitFor(() => {
        expect(screen.getByText('Buy Now')).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByText('Buy Now'));
      });

      expect(screen.getByTestId('purchase-modal')).toBeInTheDocument();
      expect(screen.getByText('Item: Test Item')).toBeInTheDocument();
    });

    test('should close purchase modal when Close is clicked', async () => {
      await act(async () => {
        render(<ItemDetail itemId="item-1" />);
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText('Buy Now'));
      });

      expect(screen.getByTestId('purchase-modal')).toBeInTheDocument();

      await act(async () => {
        fireEvent.click(screen.getByText('Close'));
      });

      expect(screen.queryByTestId('purchase-modal')).not.toBeInTheDocument();
    });

    test('should refresh item data after successful purchase', async () => {
      getItemById
        .mockResolvedValueOnce(mockItem) // Initial load
        .mockResolvedValueOnce({ ...mockItem, status: 'sold' }); // After purchase

      await act(async () => {
        render(<ItemDetail itemId="item-1" />);
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText('Buy Now'));
      });

      await act(async () => {
        fireEvent.click(screen.getByText('Complete Purchase'));
      });

      await waitFor(() => {
        expect(getItemById).toHaveBeenCalledTimes(2);
      });
    });

    test('should NOT show Buy Now button for sold items', async () => {
      const soldItem = { ...mockItem, status: 'sold' };
      getItemById.mockResolvedValue(soldItem);

      await act(async () => {
        render(<ItemDetail itemId="item-1" />);
      });

      await waitFor(() => {
        expect(screen.getByText('This item has been sold')).toBeInTheDocument();
      });

      expect(screen.queryByText('Buy Now')).not.toBeInTheDocument();
    });
  });

  describe('Purchase Functionality - User NOT Logged In', () => {
    beforeEach(() => {
      useSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });
    });

    test('should show Sign in to purchase button', async () => {
      await act(async () => {
        render(<ItemDetail itemId="item-1" />);
      });

      await waitFor(() => {
        expect(screen.getByText('Sign in to purchase')).toBeInTheDocument();
      });
    });

    test('should NOT show Buy Now button', async () => {
      await act(async () => {
        render(<ItemDetail itemId="item-1" />);
      });

      await waitFor(() => {
        expect(screen.getByText('Test Item')).toBeInTheDocument();
      });

      expect(screen.queryByText('Buy Now')).not.toBeInTheDocument();
    });

    test('should redirect to login when Sign in to purchase is clicked', async () => {
      await act(async () => {
        render(<ItemDetail itemId="item-1" />);
      });

      await waitFor(() => {
        expect(screen.getByText('Sign in to purchase')).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByText('Sign in to purchase'));
      });

      expect(mockPush).toHaveBeenCalledWith('/login');
    });

    test('should show sold notice for sold items', async () => {
      const soldItem = { ...mockItem, status: 'sold' };
      getItemById.mockResolvedValue(soldItem);

      await act(async () => {
        render(<ItemDetail itemId="item-1" />);
      });

      await waitFor(() => {
        expect(screen.getByText('This item has been sold')).toBeInTheDocument();
      });

      expect(screen.queryByText('Sign in to purchase')).not.toBeInTheDocument();
    });
  });

  describe('Image Carousel - Multiple Images', () => {
    const itemWithMultipleImages = {
      ...mockItem,
      imageUrls: [
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg',
        'https://example.com/image3.jpg',
      ],
    };

    test('should display carousel controls for multiple images', async () => {
      getItemById.mockResolvedValue(itemWithMultipleImages);

      await act(async () => {
        render(<ItemDetail itemId="item-1" />);
      });

      await waitFor(() => {
        expect(screen.getByText('1/3')).toBeInTheDocument();
      });
    });

    test('should navigate to next image', async () => {
      getItemById.mockResolvedValue(itemWithMultipleImages);

      await act(async () => {
        render(<ItemDetail itemId="item-1" />);
      });

      await waitFor(() => {
        expect(screen.getByText('1/3')).toBeInTheDocument();
      });

      const nextButton = screen.getByText('›');

      await act(async () => {
        fireEvent.click(nextButton);
      });

      expect(screen.getByText('2/3')).toBeInTheDocument();
    });

    test('should navigate to previous image', async () => {
      getItemById.mockResolvedValue(itemWithMultipleImages);

      await act(async () => {
        render(<ItemDetail itemId="item-1" />);
      });

      await waitFor(() => {
        expect(screen.getByText('1/3')).toBeInTheDocument();
      });

      const prevButton = screen.getByText('‹');

      await act(async () => {
        fireEvent.click(prevButton);
      });

      expect(screen.getByText('3/3')).toBeInTheDocument();
    });

    test('should wrap from last to first image', async () => {
      getItemById.mockResolvedValue(itemWithMultipleImages);

      await act(async () => {
        render(<ItemDetail itemId="item-1" />);
      });

      await waitFor(() => {
        expect(screen.getByText('1/3')).toBeInTheDocument();
      });

      const nextButton = screen.getByText('›');

      // Click next 3 times to wrap around
      await act(async () => {
        fireEvent.click(nextButton);
        fireEvent.click(nextButton);
        fireEvent.click(nextButton);
      });

      expect(screen.getByText('1/3')).toBeInTheDocument();
    });

    test('should display thumbnails for multiple images', async () => {
      getItemById.mockResolvedValue(itemWithMultipleImages);

      await act(async () => {
        render(<ItemDetail itemId="item-1" />);
      });

      await waitFor(() => {
        const thumbnails = screen.getAllByAltText(/thumbnail/i);
        expect(thumbnails).toHaveLength(3);
      });
    });

    test('should click thumbnail to change main image', async () => {
      getItemById.mockResolvedValue(itemWithMultipleImages);

      let container;
      await act(async () => {
        const result = render(<ItemDetail itemId="item-1" />);
        container = result.container;
      });

      await waitFor(() => {
        expect(screen.getByText('1/3')).toBeInTheDocument();
      });

      const thumbnails = container.querySelectorAll('.thumbnailBtn');

      await act(async () => {
        fireEvent.click(thumbnails[2]); // Click third thumbnail
      });

      expect(screen.getByText('3/3')).toBeInTheDocument();
    });
  });

  describe('Navbar Integration', () => {
    test('should render Navbar component', async () => {
      await act(async () => {
        render(<ItemDetail itemId="item-1" />);
      });

      expect(screen.getByTestId('navbar')).toBeInTheDocument();
    });
  });
});