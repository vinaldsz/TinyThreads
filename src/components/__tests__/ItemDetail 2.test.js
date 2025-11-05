import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ItemDetail from '../ItemDetail/ItemDetail 2';
import { getItems } from '../../services/itemService';
import { useRouter } from 'next/navigation';

// Mock Next.js router
const mockPush = jest.fn();
const mockBack = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock itemService
jest.mock('../../services/itemService', () => ({
  getItems: jest.fn(),
}));

// Mock CSS modules
jest.mock('../ItemDetail/ItemDetail.module.css', () => ({
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
  sellerSection: 'sellerSection',
  sellerCard: 'sellerCard',
  sellerHeader: 'sellerHeader',
  sellerName: 'sellerName',
  sellerRating: 'sellerRating',
  stars: 'stars',
  ratingNumber: 'ratingNumber',
  sellerMeta: 'sellerMeta',
  location: 'location',
  contactButtons: 'contactButtons',
  emailButton: 'emailButton',
  phoneButton: 'phoneButton',
  soldMessage: 'soldMessage',
  safetyNotice: 'safetyNotice',
}));

// Mock console.error
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe('ItemDetail 2', () => {
  const mockRouter = {
    push: mockPush,
    back: mockBack,
  };

  const mockItem = {
    id: 'item-1',
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
    seller: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '555-1234',
      rating: 4.5,
      joinDate: '2023-01-15',
    },
  };

  const mockItemsResponse = {
    items: [mockItem],
  };

  beforeEach(() => {
    useRouter.mockReturnValue(mockRouter);
    getItems.mockResolvedValue(mockItemsResponse);
    mockPush.mockClear();
    mockBack.mockClear();
    getItems.mockClear();
    
    // Mock window.location.href
    delete window.location;
    window.location = { href: '' };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Loading State', () => {
    test('displays loading state initially', () => {
      getItems.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      render(<ItemDetail itemId="item-1" />);
      
      expect(screen.getByText('Loading item details...')).toBeInTheDocument();
      expect(screen.getByText('Loading item details...')).toBeInTheDocument();
    });

    test('shows loading spinner', () => {
      getItems.mockImplementation(() => new Promise(() => {}));
      
      const { container } = render(<ItemDetail itemId="item-1" />);
      
      expect(container.querySelector('.loadingSpinner')).toBeInTheDocument();
    });
  });

  describe('Item Not Found', () => {
    test('displays not found message when item does not exist', async () => {
      getItems.mockResolvedValue({ items: [] });
      
      render(<ItemDetail itemId="non-existent" />);
      
      await waitFor(() => {
        expect(screen.getByText('Item Not Found')).toBeInTheDocument();
      });
      
      expect(screen.getByText('The item you\'re looking for doesn\'t exist or has been removed.')).toBeInTheDocument();
    });

    test('handles back navigation from not found page', async () => {
      getItems.mockResolvedValue({ items: [] });
      
      render(<ItemDetail itemId="non-existent" />);
      
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
      render(<ItemDetail itemId="item-1" />);
      
      await waitFor(() => {
        expect(screen.getByText('Test Item')).toBeInTheDocument();
      });
      
      expect(screen.getByText('$25')).toBeInTheDocument();
      expect(screen.getByText('Like New')).toBeInTheDocument();
      expect(screen.getByText('Medium (2-3 years)')).toBeInTheDocument();
      expect(screen.getByText('Clothing')).toBeInTheDocument();
      expect(screen.getByText('San Francisco')).toBeInTheDocument();
      expect(screen.getByText('Test description for the item')).toBeInTheDocument();
    });

    test('displays item image with correct attributes', async () => {
      render(<ItemDetail itemId="item-1" />);
      
      await waitFor(() => {
        const image = screen.getByAltText('Test Item');
        expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
        expect(image).toHaveClass('productImage');
      });
    });

    test('displays available status badge', async () => {
      render(<ItemDetail itemId="item-1" />);
      
      await waitFor(() => {
        expect(screen.getByText('✓ Available')).toBeInTheDocument();
      });
    });

    test('displays sold status badge for sold items', async () => {
      const soldItem = { ...mockItem, status: 'sold' };
      getItems.mockResolvedValue({ items: [soldItem] });
      
      render(<ItemDetail itemId="item-1" />);
      
      await waitFor(() => {
        expect(screen.getByText('Sold')).toBeInTheDocument();
      });
    });
  });

  describe('Seller Information', () => {
    test('displays seller details correctly', async () => {
      render(<ItemDetail itemId="item-1" />);
      
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });
      
      expect(screen.getByText('4.5/5.0')).toBeInTheDocument();
      expect(screen.getByText('Member since 1/15/2023')).toBeInTheDocument();
    });

    test('displays seller rating with correct stars', async () => {
      render(<ItemDetail itemId="item-1" />);
      
      await waitFor(() => {
        const starsElement = screen.getByText('★★★★☆');
        expect(starsElement).toBeInTheDocument();
      });
    });

    test('displays contact buttons for available items', async () => {
      render(<ItemDetail itemId="item-1" />);
      
      await waitFor(() => {
        expect(screen.getByText('📧 Email Seller')).toBeInTheDocument();
        expect(screen.getByText('📞 Call Seller')).toBeInTheDocument();
      });
    });

    test('displays unavailable message for sold items', async () => {
      const soldItem = { ...mockItem, status: 'sold' };
      getItems.mockResolvedValue({ items: [soldItem] });
      
      render(<ItemDetail itemId="item-1" />);
      
      await waitFor(() => {
        expect(screen.getByText('This item is no longer available')).toBeInTheDocument();
      });
      
      expect(screen.queryByText('📧 Email Seller')).not.toBeInTheDocument();
      expect(screen.queryByText('📞 Call Seller')).not.toBeInTheDocument();
    });
  });

  describe('Contact Functionality', () => {
    test('handles email contact correctly', async () => {
      render(<ItemDetail itemId="item-1" />);
      
      await waitFor(() => {
        expect(screen.getByText('📧 Email Seller')).toBeInTheDocument();
      });
      
      const emailButton = screen.getByText('📧 Email Seller');
      fireEvent.click(emailButton);
      
      expect(window.location.href).toBe(
        'mailto:john@example.com?subject=Interested%20in%20Test%20Item&body=Hi%20John%20Doe%2C%0A%0AI\'m%20interested%20in%20your%20Test%20Item%20listed%20for%20%2425.%20Is%20it%20still%20available%3F%0A%0AThanks!'
      );
    });

    test('handles phone contact correctly', async () => {
      render(<ItemDetail itemId="item-1" />);
      
      await waitFor(() => {
        expect(screen.getByText('📞 Call Seller')).toBeInTheDocument();
      });
      
      const phoneButton = screen.getByText('📞 Call Seller');
      fireEvent.click(phoneButton);
      
      expect(window.location.href).toBe('tel:555-1234');
    });

    test('does not attempt contact when email is missing', async () => {
      const itemWithoutEmail = {
        ...mockItem,
        seller: { ...mockItem.seller, email: null },
      };
      getItems.mockResolvedValue({ items: [itemWithoutEmail] });
      
      render(<ItemDetail itemId="item-1" />);
      
      await waitFor(() => {
        expect(screen.getByText('📧 Email Seller')).toBeInTheDocument();
      });
      
      const emailButton = screen.getByText('📧 Email Seller');
      fireEvent.click(emailButton);
      
      expect(window.location.href).toBe('');
    });

    test('does not attempt call when phone is missing', async () => {
      const itemWithoutPhone = {
        ...mockItem,
        seller: { ...mockItem.seller, phone: null },
      };
      getItems.mockResolvedValue({ items: [itemWithoutPhone] });
      
      render(<ItemDetail itemId="item-1" />);
      
      await waitFor(() => {
        expect(screen.getByText('📞 Call Seller')).toBeInTheDocument();
      });
      
      const phoneButton = screen.getByText('📞 Call Seller');
      fireEvent.click(phoneButton);
      
      expect(window.location.href).toBe('');
    });
  });

  describe('Navigation', () => {
    test('handles back navigation from header', async () => {
      render(<ItemDetail itemId="item-1" />);
      
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
      getItems.mockRejectedValue(new Error(errorMessage));
      
      render(<ItemDetail itemId="item-1" />);
      
      await waitFor(() => {
        expect(console.error).toHaveBeenCalledWith('Error fetching item:', expect.any(Error));
      });
      
      await waitFor(() => {
        expect(screen.getByText('Item Not Found')).toBeInTheDocument();
      });
    });
  });

  describe('Conditional Rendering', () => {
    test('does not fetch item when itemId is not provided', () => {
      render(<ItemDetail itemId={null} />);
      
      expect(getItems).not.toHaveBeenCalled();
    });

    test('fetches item when itemId is provided', () => {
      render(<ItemDetail itemId="item-1" />);
      
      expect(getItems).toHaveBeenCalledTimes(1);
    });
  });

  describe('Condition Styling', () => {
    test('applies correct CSS class for condition with spaces', async () => {
      const itemWithSpacedCondition = {
        ...mockItem,
        condition: 'Like New'
      };
      getItems.mockResolvedValue({ items: [itemWithSpacedCondition] });
      
      const { container } = render(<ItemDetail itemId="item-1" />);
      
      await waitFor(() => {
        const conditionElement = container.querySelector('.condition.likenew');
        expect(conditionElement).toBeInTheDocument();
      });
    });
  });

  describe('Safety Notice', () => {
    test('displays safety tips', async () => {
      render(<ItemDetail itemId="item-1" />);
      
      await waitFor(() => {
        expect(screen.getByText('🛡️ Safety Tips')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Meet in a public place like a library, coffee shop, or mall')).toBeInTheDocument();
      expect(screen.getByText('Bring a friend if possible')).toBeInTheDocument();
      expect(screen.getByText('Inspect items carefully before payment')).toBeInTheDocument();
      expect(screen.getByText('Trust your instincts - if something feels off, walk away')).toBeInTheDocument();
    });
  });
});