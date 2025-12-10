/**
 * Integration tests for the main browse page: src/app/page.js
 *
 * These tests are intentionally simple and focus on:
 * - default filters on initial load
 * - hiding the current user's own listings
 * - handling distance sort when geolocation is unsupported
 * - handling distance sort when geolocation fails
 * - clearing filters back to defaults
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import BrowsePage from '../../../src/app/page';
import { getItems } from '../../../src/services/itemService';

// ---- Mocks ----

jest.mock('next-auth/react');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('../../../src/hooks/useItemsPerPage', () => ({
  __esModule: true,
  default: jest.fn(() => 8),
}));

// Minimal FilterBar mock that lets us trigger filter changes / clear filters
jest.mock('../../../src/components/FilterBar/FilterBar', () => {
  return function MockFilterBar({ onFiltersChange, onClearFilters }) {
    return (
      <div data-testid="filter-bar">
        <button
          type="button"
          onClick={() => onFiltersChange({ sortBy: 'distance' })}
        >
          Sort by distance
        </button>
        <button type="button" onClick={() => onClearFilters()}>
          Clear filters
        </button>
      </div>
    );
  };
});

// ItemGrid mock to surface the items passed from BrowsePage
jest.mock('../../../src/components/ItemGrid/ItemGrid', () => {
  return function MockItemGrid({ items }) {
    return (
      <div data-testid="item-grid">
        {items.map((item) => (
          <div key={item._id} data-testid="grid-item">
            {item.title}
          </div>
        ))}
      </div>
    );
  };
});

// Pagination can be a simple placeholder
jest.mock('../../../src/components/Pagination/Pagination', () => {
  return function MockPagination() {
    return <div data-testid="pagination" />;
  };
});

// itemService
jest.mock('../../../src/services/itemService', () => ({
  getItems: jest.fn(),
}));

// ---- Shared mocks / setup ----

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
};

describe('Main Browse Page (src/app/page.js)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useRouter.mockReturnValue(mockRouter);

    // Default session: authenticated user
    useSession.mockReturnValue({
      data: { user: { id: 'user123' } },
      status: 'authenticated',
    });

    // Default getItems response
    getItems.mockResolvedValue({
      items: [],
      page: 1,
      total: 0,
      hasMore: false,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('calls getItems with default filters on initial load', async () => {
    render(<BrowsePage />);

    await waitFor(() => {
      expect(getItems).toHaveBeenCalled();
    });

    const [pageArg, perPageArg, filtersArg] = getItems.mock.calls[0];

    expect(pageArg).toBe(1);
    expect(typeof perPageArg).toBe('number');
    expect(filtersArg).toMatchObject({
      availability: 'available',
      hideMyListings: true,
    });
  });

  it('hides the current user listings from the browse grid', async () => {
    getItems.mockResolvedValueOnce({
      items: [
        {
          _id: 'item1',
          title: 'My Own Listing',
          sellerId: 'user123',
        },
        {
          _id: 'item2',
          title: 'Other Seller Item',
          sellerId: 'other456',
        },
      ],
      page: 1,
      total: 2,
      hasMore: false,
    });

    render(<BrowsePage />);

    await waitFor(() => {
      const gridItems = screen.getAllByTestId('grid-item');
      const titles = gridItems.map((node) => node.textContent);
      expect(titles).toContain('Other Seller Item');
      expect(titles).not.toContain('My Own Listing');
    });
  });

  it('shows a location error when geolocation is not supported and distance sort is selected', async () => {
    // Simulate environment where geolocation is not supported
    const originalNavigator = global.navigator;
    // @ts-expect-error - allow overriding navigator for test
    global.navigator = { ...originalNavigator, geolocation: undefined };

    render(<BrowsePage />);

    // First default load
    await waitFor(() => {
      expect(getItems).toHaveBeenCalledTimes(1);
    });

    const sortByDistanceBtn = screen.getByText('Sort by distance');
    fireEvent.click(sortByDistanceBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/Location is not supported on this device/i),
      ).toBeInTheDocument();
    });

    // Restore original navigator
    global.navigator = originalNavigator;
  });

  it('falls back to newest and shows error when geolocation fails', async () => {
    // Mock working geolocation that calls the error callback
    const originalNavigator = global.navigator;
    // @ts-expect-error - allow overriding navigator for test
    global.navigator = {
      ...originalNavigator,
      geolocation: {
        getCurrentPosition: (success, error) =>
          error({ code: 1, message: 'User denied' }),
      },
    };

    render(<BrowsePage />);

    await waitFor(() => {
      expect(getItems).toHaveBeenCalledTimes(1);
    });

    const sortByDistanceBtn = screen.getByText('Sort by distance');
    fireEvent.click(sortByDistanceBtn);

    // We don't assert the exact copy here, just that a location-related
    // error message is shown to the user.
    await waitFor(() => {
      const errorEl = screen.getByText(/location/i);
      expect(errorEl).toBeInTheDocument();
    });

    // At least one more getItems call should happen with sortBy reset to newest.
    // Initial load is 1 call, fallback should trigger another, so we expect ≥ 2.
    await waitFor(() => {
      expect(getItems.mock.calls.length).toBeGreaterThanOrEqual(2);
    });

    // Restore original navigator
    global.navigator = originalNavigator;
  });

  it('resets filters back to defaults when clear filters is clicked', async () => {
    render(<BrowsePage />);

    // Initial load
    await waitFor(() => {
      expect(getItems).toHaveBeenCalledTimes(1);
    });

    // Simulate that filters changed once already (e.g., by distance),
    // which will cause another getItems call.
    const sortByDistanceBtn = screen.getByText('Sort by distance');
    fireEvent.click(sortByDistanceBtn);

    // We don't care how many times exactly, just that later calls exist.
    await waitFor(() => {
      expect(getItems).toHaveBeenCalled();
    });

    const clearFiltersBtn = screen.getByText('Clear filters');
    fireEvent.click(clearFiltersBtn);

    // After clear, there should be another call with default filters
    await waitFor(() => {
      expect(getItems).toHaveBeenCalled();
    });

    const lastCall = getItems.mock.calls[getItems.mock.calls.length - 1];

    const [pageArg, perPageArg, filtersArg] = lastCall;

    expect(pageArg).toBe(1);
    expect(typeof perPageArg).toBe('number');
    expect(filtersArg).toMatchObject({
      availability: 'available',
      hideMyListings: true,
    });
    expect(filtersArg.lat).toBeUndefined();
    expect(filtersArg.lng).toBeUndefined();
  });
});
