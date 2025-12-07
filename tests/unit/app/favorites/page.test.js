/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import FavoritesPage from '../../../../src/app/favorites/page';

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

describe('Favorites Page', () => {
  const mockRouter = {
    push: jest.fn(),
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

      render(<FavoritesPage />);

      expect(mockRouter.push).toHaveBeenCalledWith('/login');
    });

    it('should show loading while checking auth', () => {
      useSession.mockReturnValue({
        data: null,
        status: 'loading',
      });

      render(<FavoritesPage />);

      expect(screen.getByText('Loading your favorites...')).toBeInTheDocument();
    });

    it('should fetch favorites when authenticated', async () => {
      useSession.mockReturnValue({
        data: { user: { id: 'user123' } },
        status: 'authenticated',
      });

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          favorites: [],
          total: 0,
        }),
      });

      render(<FavoritesPage />);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/favorites');
      });
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no favorites', async () => {
      useSession.mockReturnValue({
        data: { user: { id: 'user123' } },
        status: 'authenticated',
      });

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          favorites: [],
          total: 0,
        }),
      });

      render(<FavoritesPage />);

      await waitFor(() => {
        expect(screen.getByText('No favorites yet')).toBeInTheDocument();
      });

      expect(
        screen.getByText(
          'Start exploring and save items you love by clicking the heart icon!',
        ),
      ).toBeInTheDocument();
      expect(screen.getByText('Browse Items')).toBeInTheDocument();
    });

    it('should navigate to home when clicking Browse Items', async () => {
      useSession.mockReturnValue({
        data: { user: { id: 'user123' } },
        status: 'authenticated',
      });

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          favorites: [],
          total: 0,
        }),
      });

      render(<FavoritesPage />);

      await waitFor(() => {
        expect(screen.getByText('Browse Items')).toBeInTheDocument();
      });

      const browseButton = screen.getByText('Browse Items');
      browseButton.click();

      expect(mockRouter.push).toHaveBeenCalledWith('/');
    });
  });

  describe('Display Favorites', () => {
    const mockFavorites = [
      {
        _id: 'fav1',
        itemId: 'item1',
        item: {
          _id: 'item1',
          id: 'item1',
          title: 'Baby Hat',
          price: 10,
          imageUrl: 'https://example.com/hat.jpg',
          category: 'clothing',
        },
      },
      {
        _id: 'fav2',
        itemId: 'item2',
        item: {
          _id: 'item2',
          id: 'item2',
          title: 'Baby Shoes',
          price: 15,
          imageUrl: 'https://example.com/shoes.jpg',
          category: 'clothing',
        },
      },
    ];

    it('should display favorited items', async () => {
      useSession.mockReturnValue({
        data: { user: { id: 'user123' } },
        status: 'authenticated',
      });

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          favorites: mockFavorites,
          total: 2,
        }),
      });

      render(<FavoritesPage />);

      await waitFor(() => {
        expect(screen.getByText('Baby Hat')).toBeInTheDocument();
        expect(screen.getByText('Baby Shoes')).toBeInTheDocument();
      });
    });

    it('should show correct item count', async () => {
      useSession.mockReturnValue({
        data: { user: { id: 'user123' } },
        status: 'authenticated',
      });

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          favorites: mockFavorites,
          total: 2,
        }),
      });

      render(<FavoritesPage />);

      await waitFor(() => {
        expect(screen.getByText('2 items saved')).toBeInTheDocument();
      });
    });

    it('should handle singular item count', async () => {
      useSession.mockReturnValue({
        data: { user: { id: 'user123' } },
        status: 'authenticated',
      });

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          favorites: [mockFavorites[0]],
          total: 1,
        }),
      });

      render(<FavoritesPage />);

      await waitFor(() => {
        expect(screen.getByText('1 item saved')).toBeInTheDocument();
      });
    });

    it('should filter out invalid items', async () => {
      useSession.mockReturnValue({
        data: { user: { id: 'user123' } },
        status: 'authenticated',
      });

      const favoritesWithInvalid = [
        ...mockFavorites,
        {
          _id: 'fav3',
          itemId: 'deleted-item',
          item: null, // Invalid item
        },
      ];

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          favorites: favoritesWithInvalid,
          total: 3,
        }),
      });

      render(<FavoritesPage />);

      await waitFor(() => {
        const itemCards = screen.getAllByTestId('item-card');
        expect(itemCards).toHaveLength(2); // Only valid items
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error message on fetch failure', async () => {
      useSession.mockReturnValue({
        data: { user: { id: 'user123' } },
        status: 'authenticated',
      });

      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      render(<FavoritesPage />);

      await waitFor(() => {
        expect(
          screen.getByText(/Failed to fetch favorites/i),
        ).toBeInTheDocument();
      });
    });

    it('should show retry button on error', async () => {
      useSession.mockReturnValue({
        data: { user: { id: 'user123' } },
        status: 'authenticated',
      });

      fetch.mockResolvedValueOnce({
        ok: false,
      });

      render(<FavoritesPage />);

      await waitFor(() => {
        expect(screen.getByText('Try Again')).toBeInTheDocument();
      });
    });

    it('should retry fetching on retry button click', async () => {
      useSession.mockReturnValue({
        data: { user: { id: 'user123' } },
        status: 'authenticated',
      });

      // First call fails
      fetch.mockResolvedValueOnce({
        ok: false,
      });

      render(<FavoritesPage />);

      await waitFor(() => {
        expect(screen.getByText('Try Again')).toBeInTheDocument();
      });

      // Second call succeeds
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          favorites: [],
          total: 0,
        }),
      });

      const retryButton = screen.getByText('Try Again');
      retryButton.click();

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(2);
        expect(screen.getByText('No favorites yet')).toBeInTheDocument();
      });
    });

    it('should handle network errors', async () => {
      useSession.mockReturnValue({
        data: { user: { id: 'user123' } },
        status: 'authenticated',
      });

      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      fetch.mockRejectedValueOnce(new Error('Network error'));

      render(<FavoritesPage />);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner during fetch', () => {
      useSession.mockReturnValue({
        data: { user: { id: 'user123' } },
        status: 'authenticated',
      });

      fetch.mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () => resolve({ ok: true, json: async () => ({}) }),
              100,
            ),
          ),
      );

      render(<FavoritesPage />);

      expect(screen.getByText('Loading your favorites...')).toBeInTheDocument();
    });
  });
});
