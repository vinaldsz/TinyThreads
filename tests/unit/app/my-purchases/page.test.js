/**
 * @jest-environment jsdom
 */
import React from 'react';
import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import MyPurchasesPage from '@/app/my-purchases/page';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, style }) => <img src={src} alt={alt} style={style} />,
}));

global.fetch = jest.fn();

describe('MyPurchasesPage Component', () => {
  const mockPush = jest.fn();
  const mockRouter = { push: mockPush };

  beforeEach(() => {
    useRouter.mockReturnValue(mockRouter);
    jest.clearAllMocks();
  });

  it('should redirect to login if user is unauthenticated', () => {
    useSession.mockReturnValue({ status: 'unauthenticated' });

    render(<MyPurchasesPage />);

    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('should show loading state initially', () => {
    useSession.mockReturnValue({ status: 'loading' });

    render(<MyPurchasesPage />);

    expect(screen.getByText('Loading your purchases...')).toBeInTheDocument();
  });

  it('should fetch and display purchases for authenticated user', async () => {
    useSession.mockReturnValue({
      status: 'authenticated',
      data: { user: { id: 'user123' } },
    });

    const mockPurchases = [
      {
        transactionId: 'txn1',
        purchaseDate: '2025-12-01T10:00:00Z',
        price: 25.99,
        status: 'completed',
        item: {
          id: 'item1',
          title: 'Baby Shoes',
          imageUrls: ['https://example.com/shoes.jpg'],
          condition: 'Like New',
          size: '6-12M',
          category: 'Clothing',
          location: 'San Jose, CA',
          sellerName: 'Jane Doe',
          sellerEmail: 'jane@example.com',
        },
      },
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ purchases: mockPurchases }),
    });

    await act(async () => {
      render(<MyPurchasesPage />);
    });

    await waitFor(() => {
      expect(screen.getByText('My Purchases')).toBeInTheDocument();
      expect(screen.getByText('Baby Shoes')).toBeInTheDocument();
      expect(screen.getByText('$25.99')).toBeInTheDocument();
      expect(screen.getByText('Like New')).toBeInTheDocument();
      expect(screen.getByText('6-12M')).toBeInTheDocument();
      expect(screen.getByText('📍 San Jose, CA')).toBeInTheDocument();
    });
  });

  it('should display empty state when user has no purchases', async () => {
    useSession.mockReturnValue({
      status: 'authenticated',
      data: { user: { id: 'user123' } },
    });

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ purchases: [] }),
    });

    await act(async () => {
      render(<MyPurchasesPage />);
    });

    await waitFor(() => {
      expect(screen.getByText('No purchases yet')).toBeInTheDocument();
      expect(
        screen.getByText('Items you purchase will appear here'),
      ).toBeInTheDocument();
      expect(screen.getByText('Browse Items')).toBeInTheDocument();
    });
  });

  it('should format purchase date correctly', async () => {
    useSession.mockReturnValue({
      status: 'authenticated',
      data: { user: { id: 'user123' } },
    });

    const mockPurchases = [
      {
        transactionId: 'txn1',
        purchaseDate: '2025-12-01T10:00:00Z',
        price: 20.0,
        status: 'completed',
        item: {
          id: 'item1',
          title: 'Test Item',
          imageUrls: ['https://example.com/test.jpg'],
          condition: 'Good',
          size: 'M',
        },
      },
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ purchases: mockPurchases }),
    });

    await act(async () => {
      render(<MyPurchasesPage />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Purchased on/)).toBeInTheDocument();
      expect(screen.getByText(/December 1, 2025/)).toBeInTheDocument();
    });
  });

  it('should navigate to item detail page when purchase is clicked', async () => {
    useSession.mockReturnValue({
      status: 'authenticated',
      data: { user: { id: 'user123' } },
    });

    const mockPurchases = [
      {
        transactionId: 'txn1',
        purchaseDate: '2025-12-01T10:00:00Z',
        price: 20.0,
        status: 'completed',
        item: {
          id: 'item123',
          title: 'Test Item',
          imageUrls: ['https://example.com/test.jpg'],
          condition: 'Good',
          size: 'M',
        },
      },
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ purchases: mockPurchases }),
    });

    await act(async () => {
      render(<MyPurchasesPage />);
    });

    await waitFor(() => {
      expect(screen.getByText('Test Item')).toBeInTheDocument();
    });

    const itemCard = screen.getByText('Test Item').closest('.itemDetails');
    fireEvent.click(itemCard);

    expect(mockPush).toHaveBeenCalledWith('/Items/item123');
  });

  it('should display seller contact information', async () => {
    useSession.mockReturnValue({
      status: 'authenticated',
      data: { user: { id: 'user123' } },
    });

    const mockPurchases = [
      {
        transactionId: 'txn1',
        purchaseDate: '2025-12-01T10:00:00Z',
        price: 20.0,
        status: 'completed',
        item: {
          id: 'item1',
          title: 'Test Item',
          imageUrls: ['https://example.com/test.jpg'],
          condition: 'Good',
          size: 'M',
          sellerName: 'John Doe',
          sellerEmail: 'john@example.com',
        },
      },
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ purchases: mockPurchases }),
    });

    await act(async () => {
      render(<MyPurchasesPage />);
    });

    await waitFor(() => {
      expect(screen.getByText(/Seller: John Doe/)).toBeInTheDocument();
      expect(screen.getByText('Contact')).toBeInTheDocument();
    });

    const contactLink = screen.getByText('Contact');
    expect(contactLink).toHaveAttribute('href', 'mailto:john@example.com');
  });

  it('should handle missing item details gracefully', async () => {
    useSession.mockReturnValue({
      status: 'authenticated',
      data: { user: { id: 'user123' } },
    });

    const mockPurchases = [
      {
        transactionId: 'txn1',
        purchaseDate: '2025-12-01T10:00:00Z',
        price: 20.0,
        status: 'completed',
        item: null,
      },
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ purchases: mockPurchases }),
    });

    await act(async () => {
      render(<MyPurchasesPage />);
    });

    await waitFor(() => {
      expect(screen.getByText('Item details unavailable')).toBeInTheDocument();
    });
  });

  it('should display error message on fetch failure', async () => {
    useSession.mockReturnValue({
      status: 'authenticated',
      data: { user: { id: 'user123' } },
    });

    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await act(async () => {
      render(<MyPurchasesPage />);
    });

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('Failed to fetch purchases')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  it('should retry fetching purchases when Try Again is clicked', async () => {
    useSession.mockReturnValue({
      status: 'authenticated',
      data: { user: { id: 'user123' } },
    });

    // First call fails
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await act(async () => {
      render(<MyPurchasesPage />);
    });

    await waitFor(() => {
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    // Second call succeeds
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ purchases: [] }),
    });

    const retryButton = screen.getByText('Try Again');

    await act(async () => {
      fireEvent.click(retryButton);
      // Wait a tick for the promise to resolve
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // After successful retry, should show empty state
    await waitFor(
      () => {
        expect(screen.queryByText('Error')).not.toBeInTheDocument();
        expect(screen.getByText('No purchases yet')).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it('should navigate to home page when Browse Items is clicked', async () => {
    useSession.mockReturnValue({
      status: 'authenticated',
      data: { user: { id: 'user123' } },
    });

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ purchases: [] }),
    });

    await act(async () => {
      render(<MyPurchasesPage />);
    });

    await waitFor(() => {
      expect(screen.getByText('Browse Items')).toBeInTheDocument();
    });

    const browseButton = screen.getByText('Browse Items');
    fireEvent.click(browseButton);

    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it('should display multiple purchases with correct count', async () => {
    useSession.mockReturnValue({
      status: 'authenticated',
      data: { user: { id: 'user123' } },
    });

    const mockPurchases = [
      {
        transactionId: 'txn1',
        purchaseDate: '2025-12-01T10:00:00Z',
        price: 25.99,
        status: 'completed',
        item: {
          id: 'item1',
          title: 'Item 1',
          imageUrls: ['https://example.com/1.jpg'],
          condition: 'New',
          size: 'S',
        },
      },
      {
        transactionId: 'txn2',
        purchaseDate: '2025-11-15T10:00:00Z',
        price: 15.0,
        status: 'completed',
        item: {
          id: 'item2',
          title: 'Item 2',
          imageUrls: ['https://example.com/2.jpg'],
          condition: 'Good',
          size: 'M',
        },
      },
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ purchases: mockPurchases }),
    });

    await act(async () => {
      render(<MyPurchasesPage />);
    });

    await waitFor(() => {
      expect(screen.getByText('You have 2 purchases')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });
  });

  it('should use singular form for single purchase', async () => {
    useSession.mockReturnValue({
      status: 'authenticated',
      data: { user: { id: 'user123' } },
    });

    const mockPurchases = [
      {
        transactionId: 'txn1',
        purchaseDate: '2025-12-01T10:00:00Z',
        price: 20.0,
        status: 'completed',
        item: {
          id: 'item1',
          title: 'Single Item',
          imageUrls: ['https://example.com/test.jpg'],
          condition: 'New',
          size: 'M',
        },
      },
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ purchases: mockPurchases }),
    });

    await act(async () => {
      render(<MyPurchasesPage />);
    });

    await waitFor(() => {
      expect(screen.getByText('You have 1 purchase')).toBeInTheDocument();
    });
  });
});
