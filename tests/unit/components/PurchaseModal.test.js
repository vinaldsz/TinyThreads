/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import PurchaseModal from '@/components/ItemDetail/PurchaseModal';

global.fetch = jest.fn();

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, width, height, className }) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} width={width} height={height} className={className} />;
  },
}));

describe('PurchaseModal Component', () => {
  const mockItem = {
    _id: 'test-item-123',
    title: 'Test Baby Clothes',
    price: 19.99,
    condition: 'New',
    location: 'Fremont, CA',
    imageUrls: ['https://example.com/test-image.jpg'],
  };

  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    fetch.mockClear();
  });

  // ========================================
  // Basic Rendering Tests
  // ========================================

  describe('Rendering', () => {
    it('should render the modal', () => {
      render(
        <PurchaseModal
          item={mockItem}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.getByText('Test Baby Clothes')).toBeInTheDocument();
      expect(screen.getByText('$19.99')).toBeInTheDocument();
    });

    it('should display item condition and location', () => {
      render(
        <PurchaseModal
          item={mockItem}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.getByText(/Condition:/)).toBeInTheDocument();
      expect(screen.getByText(/New/)).toBeInTheDocument();
      expect(screen.getByText(/Location:/)).toBeInTheDocument();
      expect(screen.getByText(/Fremont, CA/)).toBeInTheDocument();
    });

    it('should display item image', () => {
      render(
        <PurchaseModal
          item={mockItem}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const image = screen.getByAltText('Test Baby Clothes');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', 'https://example.com/test-image.jpg');
    });

    it('should render action buttons', () => {
      render(
        <PurchaseModal
          item={mockItem}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Confirm Purchase/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '×' })).toBeInTheDocument();
    });
  });

  // ========================================
  // Interaction Tests
  // ========================================

  describe('User Interactions', () => {
    it('should call onClose when Cancel is clicked', () => {
      render(
        <PurchaseModal
          item={mockItem}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when × is clicked', () => {
      render(
        <PurchaseModal
          item={mockItem}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      fireEvent.click(screen.getByRole('button', { name: '×' }));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when clicking backdrop', () => {
      const { container } = render(
        <PurchaseModal
          item={mockItem}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      fireEvent.click(container.firstChild);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  // ========================================
  // Purchase Flow Tests
  // ========================================

  describe('Purchase Flow', () => {
    it('should show loading state when confirming', async () => {
      fetch.mockImplementation(() => new Promise(() => {}));

      render(
        <PurchaseModal
          item={mockItem}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Confirm Purchase/i }));
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Confirming/i })).toBeInTheDocument();
      });
    });

    it('should disable button during loading', async () => {
      fetch.mockImplementation(() => new Promise(() => {}));

      render(
        <PurchaseModal
          item={mockItem}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const confirmButton = screen.getByRole('button', { name: /Confirm Purchase/i });

      await act(async () => {
        fireEvent.click(confirmButton);
      });

      await waitFor(() => {
        expect(confirmButton).toBeDisabled();
      });
    });

    it('should make API call with correct data', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      render(
        <PurchaseModal
          item={mockItem}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Confirm Purchase/i }));
      });

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          '/api/transactions/create',
          expect.objectContaining({
            method: 'POST',
            body: JSON.stringify({ itemId: 'test-item-123' }),
          })
        );
      });
    });

    it('should show success view after purchase', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      render(
        <PurchaseModal
          item={mockItem}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Confirm Purchase/i }));
      });

      await waitFor(() => {
        expect(screen.getByText('✅')).toBeInTheDocument();
      });
      expect(screen.getAllByText(/Purchase confirmed!/i).length).toBeGreaterThan(0);
    });

    it('should show Done button after success', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      render(
        <PurchaseModal
          item={mockItem}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Confirm Purchase/i }));
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument();
      });
    });

    it('should call onSuccess after 2 seconds', async () => {
      jest.useFakeTimers();

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      render(
        <PurchaseModal
          item={mockItem}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Confirm Purchase/i }));
      });

      await waitFor(() => {
        expect(screen.getByText('✅')).toBeInTheDocument();
      });

      expect(mockOnSuccess).not.toHaveBeenCalled();

      await act(async () => {
        jest.advanceTimersByTime(2000);
      });

      expect(mockOnSuccess).toHaveBeenCalledTimes(1);

      jest.useRealTimers();
    });
  });

  // ========================================
  // Error Handling Tests
  // ========================================

  describe('Error Handling', () => {
    it('should show error view when purchase fails', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Item already sold' }),
      });

      render(
        <PurchaseModal
          item={mockItem}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Confirm Purchase/i }));
      });

      await waitFor(() => {
        expect(screen.getByText('❌')).toBeInTheDocument();
        expect(screen.getByText('Item already sold')).toBeInTheDocument();
      });
    });

    it('should call onError when purchase fails', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Test error' }),
      });

      render(
        <PurchaseModal
          item={mockItem}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
          onError={mockOnError}
        />
      );

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Confirm Purchase/i }));
      });

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith('Test error');
      });
    });

    it('should NOT call onSuccess when purchase fails', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Error' }),
      });

      render(
        <PurchaseModal
          item={mockItem}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Confirm Purchase/i }));
      });

      await waitFor(() => {
        expect(screen.getByText('❌')).toBeInTheDocument();
      });

      expect(mockOnSuccess).not.toHaveBeenCalled();
    });

    it('should show Try Again and Close buttons on error', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Error' }),
      });

      render(
        <PurchaseModal
          item={mockItem}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Confirm Purchase/i }));
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Try Again' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
      });
    });

    it('should reset to confirmation view when Try Again is clicked', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Error' }),
      });

      render(
        <PurchaseModal
          item={mockItem}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Confirm Purchase/i }));
      });

      await waitFor(() => {
        expect(screen.getByText('❌')).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Try Again' }));
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Confirm Purchase/i })).toBeInTheDocument();
        expect(screen.queryByText('❌')).not.toBeInTheDocument();
      });
    });

    it('should handle network errors', async () => {
      fetch.mockRejectedValueOnce(new Error('Network failure'));

      render(
        <PurchaseModal
          item={mockItem}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Confirm Purchase/i }));
      });

      await waitFor(() => {
        expect(screen.getByText('Network failure')).toBeInTheDocument();
      });
    });
  });

  // ========================================
  // Edge Cases
  // ========================================

  describe('Edge Cases', () => {
    it('should handle missing images', () => {
      const itemWithoutImage = {
        ...mockItem,
        imageUrls: undefined,
        imageUrl: undefined,
      };

      render(
        <PurchaseModal
          item={itemWithoutImage}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      const image = screen.getByAltText('Test Baby Clothes');
      expect(image).toHaveAttribute('src', expect.stringContaining('placeholder'));
    });

    it('should work without onError callback', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Error' }),
      });

      render(
        <PurchaseModal
          item={mockItem}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Confirm Purchase/i }));
      });

      await waitFor(() => {
        expect(screen.getByText('❌')).toBeInTheDocument();
      });
    });

    it('should work without onSuccess callback', async () => {
      jest.useFakeTimers();

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      render(
        <PurchaseModal
          item={mockItem}
          onClose={mockOnClose}
        />
      );

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: /Confirm Purchase/i }));
      });

      await waitFor(() => {
        expect(screen.getByText('✅')).toBeInTheDocument();
      });

      await act(async () => {
        jest.advanceTimersByTime(2000);
      });

      jest.useRealTimers();
    });
  });
});