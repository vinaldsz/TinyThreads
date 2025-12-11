import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import FavoriteButton from '../../../src/components/FavoriteButton/FavoriteButton';

// Mock next-auth
jest.mock('next-auth/react');

// Mock fetch
global.fetch = jest.fn();

describe('FavoriteButton Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete window.location;
    window.location = { href: '' };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Authentication', () => {
    it('should not render when user is not logged in', () => {
      useSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });

      const { container } = render(<FavoriteButton itemId="123" />);
      expect(container.firstChild).toBeNull();
    });

    it('should render when user is logged in', () => {
      useSession.mockReturnValue({
        data: { user: { id: 'user123' } },
        status: 'authenticated',
      });

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ isFavorited: false }),
      });

      render(<FavoriteButton itemId="123" />);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });

  describe('Favorite Status Check', () => {
    it('should check favorite status on mount', async () => {
      useSession.mockReturnValue({
        data: { user: { id: 'user123' } },
        status: 'authenticated',
      });

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ isFavorited: true }),
      });

      render(<FavoriteButton itemId="item123" />);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          '/api/favorites/check?itemId=item123',
        );
      });
    });

    it('should handle check status error gracefully', async () => {
      useSession.mockReturnValue({
        data: { user: { id: 'user123' } },
        status: 'authenticated',
      });

      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      fetch.mockRejectedValueOnce(new Error('Network error'));

      render(<FavoriteButton itemId="item123" />);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalled();
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Toggle Favorite', () => {
    it('should add to favorites when not favorited', async () => {
      useSession.mockReturnValue({
        data: { user: { id: 'user123' } },
        status: 'authenticated',
      });

      // Mock check status - not favorited
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ isFavorited: false }),
      });

      render(<FavoriteButton itemId="item123" />);

      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });

      // Mock add to favorites
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ _id: 'fav123', message: 'Added' }),
      });

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId: 'item123' }),
        });
      });
    });

    it('should remove from favorites when favorited', async () => {
      useSession.mockReturnValue({
        data: { user: { id: 'user123' } },
        status: 'authenticated',
      });

      // Mock check status - already favorited
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ isFavorited: true }),
      });

      render(<FavoriteButton itemId="item123" />);

      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });

      // Mock remove from favorites
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Removed' }),
      });

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/favorites?itemId=item123', {
          method: 'DELETE',
        });
      });
    });

    it('should show alert on toggle error', async () => {
      useSession.mockReturnValue({
        data: { user: { id: 'user123' } },
        status: 'authenticated',
      });

      window.alert = jest.fn();

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ isFavorited: false }),
      });

      render(<FavoriteButton itemId="item123" />);

      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });

      // Mock failed add
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Failed' }),
      });

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(
          'Something went wrong. Please try again.',
        );
      });
    });

    it('should prevent double clicks', async () => {
      useSession.mockReturnValue({
        data: { user: { id: 'user123' } },
        status: 'authenticated',
      });

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ isFavorited: false }),
      });

      render(<FavoriteButton itemId="item123" />);

      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ _id: 'fav123' }),
      });

      const button = screen.getByRole('button');

      // Click multiple times rapidly
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      await waitFor(() => {
        // Should only call API once
        expect(fetch).toHaveBeenCalledTimes(2); // 1 check + 1 add
      });
    });
  });

  describe('UI States', () => {
    it('should apply correct className', () => {
      useSession.mockReturnValue({
        data: { user: { id: 'user123' } },
        status: 'authenticated',
      });

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ isFavorited: false }),
      });

      render(<FavoriteButton itemId="123" className="custom-class" />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('should have correct aria-label', async () => {
      useSession.mockReturnValue({
        data: { user: { id: 'user123' } },
        status: 'authenticated',
      });

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ isFavorited: false }),
      });

      render(<FavoriteButton itemId="123" />);

      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('aria-label', 'Add to favorites');
      });
    });

    it('should show loading state', async () => {
      useSession.mockReturnValue({
        data: { user: { id: 'user123' } },
        status: 'authenticated',
      });

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ isFavorited: false }),
      });

      render(<FavoriteButton itemId="123" />);

      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });

      // Mock slow API response
      fetch.mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({ _id: 'fav123' }),
                }),
              100,
            ),
          ),
      );

      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Button should be disabled during loading
      expect(button).toBeDisabled();
    });
  });

  describe('Event Handling', () => {
    it('should prevent event propagation', async () => {
      useSession.mockReturnValue({
        data: { user: { id: 'user123' } },
        status: 'authenticated',
      });

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ isFavorited: false }),
      });

      const parentClickHandler = jest.fn();

      render(
        <div onClick={parentClickHandler}>
          <FavoriteButton itemId="123" />
        </div>,
      );

      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });

      const button = screen.getByRole('button');
      fireEvent.click(button);

      // Parent click handler should not be called
      expect(parentClickHandler).not.toHaveBeenCalled();
    });
  });
});
