import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import '@testing-library/jest-dom';
import BrowsePage from '@/app/page';
import { getItems } from '@/services/itemService';

// Mock Next.js Link component
jest.mock('next/link', () => {
  const MockLink = ({ children, href, ...props }) => {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
  MockLink.displayName = 'MockLink';
  return MockLink;
});

// Mock itemService functions
jest.mock('@/services/itemService', () => ({
  getItems: jest.fn(),
}));

// Mock FilterBar component
jest.mock('@/components/FilterBar/FilterBar', () => {
  const MockFilterBar = function ({
    onFiltersChange,
    onClearFilters,
    itemCount,
    activeFiltersCount,
    sortLabel,
  }) {
    return (
      <div data-testid="filter-bar">
        <div data-testid="item-count">{itemCount}</div>
        <div data-testid="active-filters-count">{activeFiltersCount}</div>
        <div data-testid="sort-label">{sortLabel}</div>
        <button
          onClick={() => onFiltersChange({ category: 'clothing' })}
          data-testid="trigger-filter-change"
        >
          Change Filters
        </button>
        <button onClick={onClearFilters} data-testid="clear-filters">
          Clear Filters
        </button>
      </div>
    );
  };
  MockFilterBar.displayName = 'MockFilterBar';
  return MockFilterBar;
});

// Mock ItemGrid component
jest.mock('@/components/ItemGrid/ItemGrid', () => {
  const MockItemGrid = function ({ items, loading, hasMore }) {
    return (
      <div data-testid="item-grid">
        <div data-testid="items-length">{items.length}</div>
        <div data-testid="loading-state">{loading ? 'loading' : 'loaded'}</div>
        <div data-testid="has-more">{hasMore ? 'has-more' : 'no-more'}</div>
      </div>
    );
  };
  MockItemGrid.displayName = 'MockItemGrid';
  return MockItemGrid;
});

// Mock CSS modules
jest.mock('@/app/page.module.css', () => ({
  page: 'page',
  container: 'container',
  headerSection: 'headerSection',
  logoContainer: 'logoContainer',
  logo: 'logo',
  title: 'title',
  nav: 'nav',
  aboutLink: 'aboutLink',
  controlSection: 'controlSection',
}));

describe('BrowsePage', () => {
  const mockItems = [
    { id: '1', title: 'Item 1', price: 10, category: 'clothing' },
    { id: '2', title: 'Item 2', price: 20, category: 'toys' },
    { id: '3', title: 'Item 3', price: 15, category: 'books' },
  ];

  const mockItemsResponse = {
    items: mockItems,
  };

  beforeEach(() => {
    getItems.mockResolvedValue(mockItemsResponse);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    test('renders without crashing', async () => {
      await act(async () => {
        render(<BrowsePage />);
      });

      await waitFor(() => {
        expect(screen.getByAltText('TinyThreads')).toBeInTheDocument();
      });
    });

    test('renders header section with logo and title', async () => {
      await act(async () => {
        render(<BrowsePage />);
      });

      await waitFor(() => {
        expect(screen.getByAltText('TinyThreads')).toBeInTheDocument();
      });
    });

    test('renders navigation with about link', async () => {
      await act(async () => {
        render(<BrowsePage />);
      });

      await waitFor(() => {
        const aboutLink = screen.getByText('About');
        expect(aboutLink).toBeInTheDocument();
        expect(aboutLink).toHaveAttribute('href', '/about');
      });
    });

    test('renders FilterBar component', async () => {
      await act(async () => {
        render(<BrowsePage />);
      });

      await waitFor(() => {
        expect(screen.getByTestId('filter-bar')).toBeInTheDocument();
      });
    });

    test('renders ItemGrid component', async () => {
      await act(async () => {
        render(<BrowsePage />);
      });

      await waitFor(() => {
        expect(screen.getByTestId('item-grid')).toBeInTheDocument();
      });
    });
  });

  describe('Initial Data Loading', () => {
    test('loads items on component mount', async () => {
      await act(async () => {
        render(<BrowsePage />);
      });

      expect(getItems).toHaveBeenCalledTimes(1);

      await waitFor(() => {
        expect(screen.getByTestId('items-length')).toHaveTextContent('3');
      });
    });

    test('sets loading state correctly during initial load', async () => {
      // Mock a delayed response
      getItems.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve(mockItemsResponse), 100),
          ),
      );

      await act(async () => {
        render(<BrowsePage />);
      });

      // Should start with loading
      expect(screen.getByTestId('loading-state')).toHaveTextContent('loading');

      // Should finish loading
      await waitFor(
        () => {
          expect(screen.getByTestId('loading-state')).toHaveTextContent(
            'loaded',
          );
        },
        { timeout: 200 },
      );
    });

    test('displays correct item count in FilterBar', async () => {
      await act(async () => {
        render(<BrowsePage />);
      });

      await waitFor(() => {
        expect(screen.getByTestId('item-count')).toHaveTextContent('3');
      });
    });
  });

  describe('Filter Functionality', () => {
    test('handles filter changes correctly', async () => {
      const filteredResponse = {
        items: [mockItems[0]], // Only one item
      };
      // Ensure initial load returns full list, then filter returns smaller set
      getItems.mockResolvedValueOnce(mockItemsResponse);
      getItems.mockResolvedValueOnce(filteredResponse);

      await act(async () => {
        render(<BrowsePage />);
      });

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('items-length')).toHaveTextContent('3');
      });

      // Trigger filter change
      await act(async () => {
        const filterButton = screen.getByTestId('trigger-filter-change');
        fireEvent.click(filterButton);
      });

      // Should call getItems for the filtered request (page reset to 1)
      await waitFor(() => {
        expect(getItems).toHaveBeenCalledWith(
          expect.any(Number),
          expect.any(Number),
          expect.objectContaining({ category: 'clothing' }),
        );
      });

      // Should update filtered items
      await waitFor(() => {
        expect(screen.getByTestId('items-length')).toHaveTextContent('1');
      });
    });

    test('sets loading state during filter changes', async () => {
      getItems.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ items: [mockItems[0]] }), 100),
          ),
      );

      await act(async () => {
        render(<BrowsePage />);
      });

      await waitFor(() => {
        expect(screen.getByTestId('loading-state')).toHaveTextContent('loaded');
      });

      // Trigger filter change
      await act(async () => {
        const filterButton = screen.getByTestId('trigger-filter-change');
        fireEvent.click(filterButton);
      });

      // Should show loading
      expect(screen.getByTestId('loading-state')).toHaveTextContent('loading');

      // Should finish loading
      await waitFor(
        () => {
          expect(screen.getByTestId('loading-state')).toHaveTextContent(
            'loaded',
          );
        },
        { timeout: 200 },
      );
    });

    test('clears all filters correctly', async () => {
      await act(async () => {
        render(<BrowsePage />);
      });

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('items-length')).toHaveTextContent('3');
      });

      // First apply a filter
      await act(async () => {
        const filterButton = screen.getByTestId('trigger-filter-change');
        fireEvent.click(filterButton);
      });

      await waitFor(() => {
        expect(getItems).toHaveBeenCalled();
      });

      // Then clear filters
      await act(async () => {
        const clearButton = screen.getByTestId('clear-filters');
        fireEvent.click(clearButton);
      });

      // Should reset to original items
      await waitFor(() => {
        expect(screen.getByTestId('items-length')).toHaveTextContent('3');
      });
    });
  });

  describe('Active Filters Count', () => {
    test('calculates active filters count correctly with no filters', async () => {
      await act(async () => {
        render(<BrowsePage />);
      });

      await waitFor(() => {
        expect(screen.getByTestId('active-filters-count')).toHaveTextContent(
          '0',
        );
      });
    });

    test('shows zero active filters initially', async () => {
      await act(async () => {
        render(<BrowsePage />);
      });

      await waitFor(() => {
        expect(screen.getByTestId('active-filters-count')).toHaveTextContent(
          '0',
        );
      });
    });
  });

  describe('Sort Labels', () => {
    test('displays default sort label', async () => {
      await act(async () => {
        render(<BrowsePage />);
      });

      await waitFor(() => {
        expect(screen.getByTestId('sort-label')).toHaveTextContent(
          'Newest first',
        );
      });
    });
  });

  describe('Component Props', () => {
    test('passes correct props to ItemGrid', async () => {
      await act(async () => {
        render(<BrowsePage />);
      });

      await waitFor(() => {
        expect(screen.getByTestId('has-more')).toHaveTextContent('no-more');
        expect(screen.getByTestId('loading-state')).toBeInTheDocument();
        expect(screen.getByTestId('items-length')).toBeInTheDocument();
      });
    });

    test('passes initial empty filters to FilterBar', async () => {
      await act(async () => {
        render(<BrowsePage />);
      });

      await waitFor(() => {
        expect(screen.getByTestId('active-filters-count')).toHaveTextContent(
          '0',
        );
      });
    });
  });

  describe('Error Handling', () => {
    test('handles getItems error gracefully', async () => {
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      getItems.mockRejectedValue(new Error('API Error'));

      await act(async () => {
        render(<BrowsePage />);
      });

      await waitFor(() => {
        expect(screen.getByTestId('loading-state')).toHaveTextContent('loaded');
      });

      // Should still render the component
      expect(screen.getByAltText('TinyThreads')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });

    test('handles filterItems error gracefully', async () => {
      await act(async () => {
        render(<BrowsePage />);
      });

      // Wait for successful initial load
      await waitFor(() => {
        expect(screen.getByTestId('items-length')).toHaveTextContent('3');
      });

      // Set up error for subsequent filtered getItems calls
      getItems.mockRejectedValue(new Error('Filter Error'));
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      // Trigger the filter change that will cause the error
      await act(async () => {
        const filterButton = screen.getByTestId('trigger-filter-change');
        fireEvent.click(filterButton);

        // Wait for the async operation to attempt
        await waitFor(() => {
          expect(getItems).toHaveBeenCalled();
        });
      });

      // Component should still be functional after error
      expect(screen.getByAltText('TinyThreads')).toBeInTheDocument();

      // Loading should eventually be set to false
      await waitFor(() => {
        expect(screen.getByTestId('loading-state')).toHaveTextContent('loaded');
      });

      consoleSpy.mockRestore();
    });
  });

  describe('State Management', () => {
    test('maintains separate items and filteredItems state', async () => {
      await act(async () => {
        render(<BrowsePage />);
      });

      // Initial state - both should be the same
      await waitFor(() => {
        expect(screen.getByTestId('items-length')).toHaveTextContent('3');
      });

      // After filtering, filteredItems changes but original items remain
      // Mock getItems to return filtered set on next call
      getItems.mockResolvedValueOnce({ items: [mockItems[0]] });

      await act(async () => {
        const filterButton = screen.getByTestId('trigger-filter-change');
        fireEvent.click(filterButton);
      });

      await waitFor(() => {
        expect(screen.getByTestId('items-length')).toHaveTextContent('1');
      });

      // Clear filters should restore to original items
      getItems.mockResolvedValueOnce({ items: mockItems });
      await act(async () => {
        const clearButton = screen.getByTestId('clear-filters');
        fireEvent.click(clearButton);
      });

      await waitFor(() => {
        expect(screen.getByTestId('items-length')).toHaveTextContent('3');
      });
    });
  });

  describe('CSS Classes', () => {
    test('applies correct CSS classes to main elements', async () => {
      await act(async () => {
        render(<BrowsePage />);
      });

      const page = screen.getByAltText('TinyThreads').closest('.page');
      const container = document.querySelector('.container');

      expect(page).toHaveClass('page');
      expect(container).toHaveClass('container');
    });
  });

  describe('Accessibility', () => {
    test('about link is accessible', async () => {
      await act(async () => {
        render(<BrowsePage />);
      });

      await waitFor(() => {
        const aboutLink = screen.getByRole('link', { name: /about/i });
        expect(aboutLink).toBeInTheDocument();
        expect(aboutLink).toHaveAttribute('href', '/about');
      });
    });
  });
});
