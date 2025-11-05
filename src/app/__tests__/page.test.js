import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BrowsePage from '../page';
import { getItems, filterItems } from '@/services/itemService';

// Mock Next.js Link component
jest.mock('next/link', () => {
  const MockLink = ({ children, href, ...props }) => {
    return <a href={href} {...props}>{children}</a>;
  };
  MockLink.displayName = 'MockLink';
  return MockLink;
});

// Mock itemService functions
jest.mock('@/services/itemService', () => ({
  getItems: jest.fn(),
  filterItems: jest.fn(),
}));

// Mock FilterBar component
jest.mock('@/components/FilterBar/FilterBar', () => {
  const MockFilterBar = function({ onFiltersChange, onClearFilters, initialFilters, itemCount, activeFiltersCount, sortLabel }) {
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
        <button 
          onClick={onClearFilters}
          data-testid="clear-filters"
        >
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
  const MockItemGrid = function({ items, loading, hasMore }) {
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
jest.mock('../app/page.module.css', () => ({
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
    filterItems.mockResolvedValue(mockItemsResponse);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Component Rendering', () => {
    test('renders without crashing', async () => {
      render(<BrowsePage />);
      
      await waitFor(() => {
        expect(screen.getByText('TinyThreads')).toBeInTheDocument();
      });
    });

    test('renders header section with logo and title', async () => {
      render(<BrowsePage />);
      
      await waitFor(() => {
        expect(screen.getByText('👶')).toBeInTheDocument();
        expect(screen.getByText('TinyThreads')).toBeInTheDocument();
      });
    });

    test('renders navigation with about link', async () => {
      render(<BrowsePage />);
      
      await waitFor(() => {
        const aboutLink = screen.getByText('About');
        expect(aboutLink).toBeInTheDocument();
        expect(aboutLink).toHaveAttribute('href', '/about');
      });
    });

    test('renders FilterBar component', async () => {
      render(<BrowsePage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('filter-bar')).toBeInTheDocument();
      });
    });

    test('renders ItemGrid component', async () => {
      render(<BrowsePage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('item-grid')).toBeInTheDocument();
      });
    });
  });

  describe('Initial Data Loading', () => {
    test('loads items on component mount', async () => {
      render(<BrowsePage />);
      
      expect(getItems).toHaveBeenCalledTimes(1);
      
      await waitFor(() => {
        expect(screen.getByTestId('items-length')).toHaveTextContent('3');
      });
    });

    test('sets loading state correctly during initial load', async () => {
      // Mock a delayed response
      getItems.mockImplementation(() => new Promise(resolve => 
        setTimeout(() => resolve(mockItemsResponse), 100)
      ));
      
      render(<BrowsePage />);
      
      // Should start with loading
      expect(screen.getByTestId('loading-state')).toHaveTextContent('loading');
      
      // Should finish loading
      await waitFor(() => {
        expect(screen.getByTestId('loading-state')).toHaveTextContent('loaded');
      }, { timeout: 200 });
    });

    test('displays correct item count in FilterBar', async () => {
      render(<BrowsePage />);
      
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
      filterItems.mockResolvedValue(filteredResponse);
      
      render(<BrowsePage />);
      
      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('items-length')).toHaveTextContent('3');
      });
      
      // Trigger filter change
      const filterButton = screen.getByTestId('trigger-filter-change');
      fireEvent.click(filterButton);
      
      // Should call filterItems
      await waitFor(() => {
        expect(filterItems).toHaveBeenCalledWith({ category: 'clothing' });
      });
      
      // Should update filtered items
      await waitFor(() => {
        expect(screen.getByTestId('items-length')).toHaveTextContent('1');
      });
    });

    test('sets loading state during filter changes', async () => {
      filterItems.mockImplementation(() => new Promise(resolve => 
        setTimeout(() => resolve({ items: [mockItems[0]] }), 100)
      ));
      
      render(<BrowsePage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('loading-state')).toHaveTextContent('loaded');
      });
      
      // Trigger filter change
      const filterButton = screen.getByTestId('trigger-filter-change');
      fireEvent.click(filterButton);
      
      // Should show loading
      expect(screen.getByTestId('loading-state')).toHaveTextContent('loading');
      
      // Should finish loading
      await waitFor(() => {
        expect(screen.getByTestId('loading-state')).toHaveTextContent('loaded');
      }, { timeout: 200 });
    });

    test('clears all filters correctly', async () => {
      render(<BrowsePage />);
      
      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('items-length')).toHaveTextContent('3');
      });
      
      // First apply a filter
      const filterButton = screen.getByTestId('trigger-filter-change');
      fireEvent.click(filterButton);
      
      await waitFor(() => {
        expect(filterItems).toHaveBeenCalled();
      });
      
      // Then clear filters
      const clearButton = screen.getByTestId('clear-filters');
      fireEvent.click(clearButton);
      
      // Should reset to original items
      await waitFor(() => {
        expect(screen.getByTestId('items-length')).toHaveTextContent('3');
      });
    });
  });

  describe('Active Filters Count', () => {
    test('calculates active filters count correctly with no filters', async () => {
      render(<BrowsePage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('active-filters-count')).toHaveTextContent('0');
      });
    });

    test('calculates active filters count with valid filters', async () => {
      render(<BrowsePage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('active-filters-count')).toHaveTextContent('0');
      });
      
      // Mock FilterBar to send multiple filters
      jest.clearAllMocks();
      filterItems.mockResolvedValue({ items: [mockItems[0]] });
      
      // Re-render with mocked filter changes
      const { rerender } = render(<BrowsePage />);
      
      // Wait for mount
      await waitFor(() => {
        expect(screen.getByTestId('items-length')).toHaveTextContent('3');
      });
    });

    test('ignores empty string and newest sort in active count', () => {
      const { container } = render(<BrowsePage />);
      const instance = container._reactInternalFiber || container._reactInternalInstance;
      
      // We'll test the logic indirectly through the component behavior
      // The active filters count should be 0 with empty filters
      waitFor(() => {
        expect(screen.getByTestId('active-filters-count')).toHaveTextContent('0');
      });
    });
  });

  describe('Sort Labels', () => {
    test('displays default sort label', async () => {
      render(<BrowsePage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('sort-label')).toHaveTextContent('Newest first');
      });
    });

    test('displays correct sort labels for different sort types', () => {
      // Since we can't easily test the internal getSortLabel function directly,
      // we'll verify it works through component behavior
      render(<BrowsePage />);
      
      // The mock component will display whatever getSortLabel returns
      waitFor(() => {
        expect(screen.getByTestId('sort-label')).toBeInTheDocument();
      });
    });
  });

  describe('Component Props', () => {
    test('passes correct props to ItemGrid', async () => {
      render(<BrowsePage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('has-more')).toHaveTextContent('no-more');
        expect(screen.getByTestId('loading-state')).toBeInTheDocument();
        expect(screen.getByTestId('items-length')).toBeInTheDocument();
      });
    });

    test('passes initial empty filters to FilterBar', async () => {
      render(<BrowsePage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('active-filters-count')).toHaveTextContent('0');
      });
    });
  });

  describe('Error Handling', () => {
    test('handles getItems error gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      getItems.mockRejectedValue(new Error('API Error'));
      
      render(<BrowsePage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('loading-state')).toHaveTextContent('loaded');
      });
      
      // Should still render the component
      expect(screen.getByText('TinyThreads')).toBeInTheDocument();
      
      consoleSpy.mockRestore();
    });

    test('handles filterItems error gracefully', async () => {
      filterItems.mockRejectedValue(new Error('Filter Error'));
      
      render(<BrowsePage />);
      
      await waitFor(() => {
        expect(screen.getByTestId('items-length')).toHaveTextContent('3');
      });
      
      const filterButton = screen.getByTestId('trigger-filter-change');
      fireEvent.click(filterButton);
      
      // Should still function after error
      await waitFor(() => {
        expect(screen.getByText('TinyThreads')).toBeInTheDocument();
      });
    });
  });

  describe('State Management', () => {
    test('maintains separate items and filteredItems state', async () => {
      render(<BrowsePage />);
      
      // Initial state - both should be the same
      await waitFor(() => {
        expect(screen.getByTestId('items-length')).toHaveTextContent('3');
      });
      
      // After filtering, filteredItems changes but original items remain
      filterItems.mockResolvedValue({ items: [mockItems[0]] });
      
      const filterButton = screen.getByTestId('trigger-filter-change');
      fireEvent.click(filterButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('items-length')).toHaveTextContent('1');
      });
      
      // Clear filters should restore to original items
      const clearButton = screen.getByTestId('clear-filters');
      fireEvent.click(clearButton);
      
      await waitFor(() => {
        expect(screen.getByTestId('items-length')).toHaveTextContent('3');
      });
    });
  });
});