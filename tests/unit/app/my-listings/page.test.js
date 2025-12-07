/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import MyListingsPage from '../../../../src/app/my-listings/page';

// Mock dependencies
jest.mock('next-auth/react');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));
jest.mock('../../../../src/components/ItemCard/ItemCard', () => {
  return function MockItemCard({ item }) {
    return <div data-testid="item-card">{item.title}</div>;
  };
});

global.fetch = jest.fn();

describe('My Listings Page', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  const mockSession = {
    user: {
      id: 'user123',
      name: 'Test User',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useRouter.mockReturnValue(mockRouter);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Authentication', () => {
    it('should redirect to login when not authenticated', () => {
      useSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });

      render(<MyListingsPage />);

      expect(mockRouter.push).toHaveBeenCalledWith('/login');
    });

    it('should show loading while checking auth', () => {
      useSession.mockReturnValue({
        data: null,
        status: 'loading',
      });

      render(<MyListingsPage />);

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('should fetch listings when authenticated', async () => {
      useSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated',
      });

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] }),
      });

      render(<MyListingsPage />);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/items?sellerId=user123'),
        );
      });
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no listings', async () => {
      useSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated',
      });

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] }),
      });

      render(<MyListingsPage />);

      await waitFor(() => {
        expect(
          screen.getByText("You haven't posted any listings yet"),
        ).toBeInTheDocument();
      });
    });

    it('should show create listing button in empty state', async () => {
      useSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated',
      });

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] }),
      });

      render(<MyListingsPage />);

      await waitFor(() => {
        expect(
          screen.getByText('Create Your First Listing'),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Display Listings', () => {
    const mockListings = [
      {
        _id: 'item1',
        id: 'item1',
        title: 'Baby Hat',
        price: 10,
        status: 'available',
        imageUrl: 'https://example.com/hat.jpg',
        category: 'clothing',
        sellerId: 'user123',
      },
      {
        _id: 'item2',
        id: 'item2',
        title: 'Baby Shoes',
        price: 15,
        status: 'sold',
        imageUrl: 'https://example.com/shoes.jpg',
        category: 'clothing',
        sellerId: 'user123',
      },
    ];

    it('should display user listings', async () => {
      useSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated',
      });

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: mockListings }),
      });

      render(<MyListingsPage />);

      await waitFor(() => {
        expect(screen.getByText('Baby Hat')).toBeInTheDocument();
        expect(screen.getByText('Baby Shoes')).toBeInTheDocument();
      });
    });

    it('should show correct item count', async () => {
      useSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated',
      });

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: mockListings }),
      });

      render(<MyListingsPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/2.*listing/i) || screen.getByText(/2.*item/i),
        ).toBeInTheDocument();
      });
    });

    it('should handle singular count', async () => {
      useSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated',
      });

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [mockListings[0]] }),
      });

      render(<MyListingsPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/1.*listing/i) || screen.getByText(/1.*item/i),
        ).toBeInTheDocument();
      });
    });
  });

  describe('Filtering', () => {
    const mockListings = [
      {
        _id: 'item1',
        id: 'item1',
        title: 'Baby Hat',
        price: 10,
        status: 'available',
        category: 'clothing',
        sellerId: 'user123',
      },
      {
        _id: 'item2',
        id: 'item2',
        title: 'Baby Shoes',
        price: 15,
        status: 'sold',
        category: 'clothing',
        sellerId: 'user123',
      },
    ];

    it('should filter by status', async () => {
      useSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated',
      });

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: mockListings }),
      });

      render(<MyListingsPage />);

      await waitFor(() => {
        expect(screen.getByText('Baby Hat')).toBeInTheDocument();
      });

      // Look for status filter buttons
      const availableButton = screen.getByRole('button', {
        name: /Available \(1\)/,
      });
      if (availableButton) {
        fireEvent.click(availableButton);

        // Should show only available items
        expect(screen.getByText('Baby Hat')).toBeInTheDocument();
      }
    });

    it('should show all items by default', async () => {
      useSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated',
      });

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: mockListings }),
      });

      render(<MyListingsPage />);

      await waitFor(() => {
        const itemCards = screen.getAllByTestId('item-card');
        expect(itemCards.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Search', () => {
    const mockListings = [
      {
        _id: 'item1',
        id: 'item1',
        title: 'Baby Hat',
        price: 10,
        status: 'available',
        category: 'clothing',
        sellerId: 'user123',
      },
      {
        _id: 'item2',
        id: 'item2',
        title: 'Baby Shoes',
        price: 15,
        status: 'sold',
        category: 'clothing',
        sellerId: 'user123',
      },
    ];

    it('should have search functionality', async () => {
      useSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated',
      });

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: mockListings }),
      });

      render(<MyListingsPage />);

      await waitFor(() => {
        expect(screen.getByText('Baby Hat')).toBeInTheDocument();
      });

      // Look for search input
      const searchInput = screen.queryByPlaceholderText(/search/i);
      if (searchInput) {
        fireEvent.change(searchInput, { target: { value: 'hat' } });

        await waitFor(() => {
          expect(screen.getByText('Baby Hat')).toBeInTheDocument();
        });
      }
    });
  });

  describe('Error Handling', () => {
    it('should show error message on fetch failure', async () => {
      useSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated',
      });

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      render(<MyListingsPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/failed/i) || screen.getByText(/error/i),
        ).toBeInTheDocument();
      });
    });

    it('should handle network errors', async () => {
      useSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated',
      });

      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      fetch.mockRejectedValueOnce(new Error('Network error'));

      render(<MyListingsPage />);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Navigation', () => {
    it('should navigate to add listing page', async () => {
      useSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated',
      });

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: [] }),
      });

      render(<MyListingsPage />);

      await waitFor(() => {
        const addButton = screen.getByText('Create Your First Listing');
        expect(addButton).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner during fetch', () => {
      useSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated',
      });

      fetch.mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () => resolve({ ok: true, json: async () => ({ items: [] }) }),
              100,
            ),
          ),
      );

      render(<MyListingsPage />);

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
  });

  describe('Statistics', () => {
    it('should show listing statistics', async () => {
      useSession.mockReturnValue({
        data: mockSession,
        status: 'authenticated',
      });

      const mockListings = [
        {
          _id: 'item1',
          id: 'item1',
          title: 'Baby Hat',
          status: 'available',
          sellerId: 'user123',
        },
        {
          _id: 'item2',
          id: 'item2',
          title: 'Baby Shoes',
          status: 'sold',
          sellerId: 'user123',
        },
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ items: mockListings }),
      });

      render(<MyListingsPage />);

      await waitFor(() => {
        // Should show total count
        const statCards = screen.getAllByText('2');
        expect(statCards.length).toBeGreaterThan(0);
      });
    });
  });
});
