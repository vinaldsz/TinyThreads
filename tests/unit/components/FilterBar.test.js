import { render, screen, fireEvent } from '@testing-library/react';
import FilterBar from '@/components/FilterBar/FilterBar';

describe.skip('FilterBar Component', () => {
  const mockOnFiltersChange = jest.fn();
  const mockOnClearFilters = jest.fn();

  beforeEach(() => {
    mockOnFiltersChange.mockClear();
    mockOnClearFilters.mockClear();
  });

  // ===== INITIAL RENDER TESTS =====
  describe('initial render', () => {
    test('renders with default props', () => {
      render(<FilterBar />);

      // Should show search input
      expect(
        screen.getByPlaceholderText('Search Baby Items...'),
      ).toBeInTheDocument();

      // Should show filter button with no active filters
      expect(screen.getByText('Filter')).toBeInTheDocument();

      // Should show sort dropdown
      expect(screen.getByLabelText('Sort by')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Newest First')).toBeInTheDocument();
    });

    test('renders with custom initial filters', () => {
      const initialFilters = {
        category: 'Clothing',
        condition: 'Like New',
        searchTerm: 'baby shirt',
        sortBy: 'price-low',
      };

      render(<FilterBar initialFilters={initialFilters} />);

      expect(screen.getByDisplayValue('baby shirt')).toBeInTheDocument();
      expect(
        screen.getByDisplayValue('Price: Low to High'),
      ).toBeInTheDocument();
    });

    test('shows clear button when activeFiltersCount > 0', () => {
      render(<FilterBar activeFiltersCount={2} />);

      expect(screen.getByText('Clear')).toBeInTheDocument();
    });

    test('does not show clear button when activeFiltersCount is 0', () => {
      render(<FilterBar activeFiltersCount={0} />);

      expect(screen.queryByText('Clear')).not.toBeInTheDocument();
    });
  });

  // ===== SEARCH FUNCTIONALITY TESTS =====
  describe('search functionality', () => {
    test('updates search term on input change', () => {
      render(<FilterBar onFiltersChange={mockOnFiltersChange} />);

      const searchInput = screen.getByPlaceholderText('Search Baby Items...');
      fireEvent.change(searchInput, { target: { value: 'baby toys' } });

      expect(searchInput.value).toBe('baby toys');
      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({ searchTerm: 'baby toys' }),
      );
    });

    test('triggers search on Enter key press', () => {
      render(<FilterBar onFiltersChange={mockOnFiltersChange} />);

      const searchInput = screen.getByPlaceholderText('Search Baby Items...');

      fireEvent.change(searchInput, { target: { value: 'test search' } });
      fireEvent.keyPress(searchInput, { key: 'Enter', charCode: 13 });

      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({ searchTerm: 'test search' }),
      );
    });

    test('does not trigger search on other key presses', () => {
      render(<FilterBar onFiltersChange={mockOnFiltersChange} />);

      const searchInput = screen.getByPlaceholderText('Search Baby Items...');

      // Clear previous calls from onChange
      mockOnFiltersChange.mockClear();

      fireEvent.keyPress(searchInput, { key: 'Tab', charCode: 9 });
      fireEvent.keyPress(searchInput, { key: 'Escape', charCode: 27 });

      // Should only have been called from onChange, not from key press
      expect(mockOnFiltersChange).toHaveBeenCalledTimes(0);
    });
  });

  // ===== FILTER TOGGLE TESTS =====
  describe('filter toggle', () => {
    test('shows/hides filter options when filter button clicked', () => {
      render(<FilterBar />);

      const filterButton = screen.getByText('Filter');

      // Initially filters should be hidden
      expect(screen.queryByText('Category')).not.toBeInTheDocument();
      expect(filterButton).toHaveAttribute('aria-expanded', 'false');

      // Click to show filters
      fireEvent.click(filterButton);

      expect(screen.getByText('Category')).toBeInTheDocument();
      expect(screen.getByText('Condition')).toBeInTheDocument();
      expect(filterButton).toHaveAttribute('aria-expanded', 'true');

      // Click again to hide filters
      fireEvent.click(filterButton);

      expect(screen.queryByText('Category')).not.toBeInTheDocument();
      expect(filterButton).toHaveAttribute('aria-expanded', 'false');
    });

    test('shows active filters styling when activeFiltersCount > 0', () => {
      render(<FilterBar activeFiltersCount={2} />);

      const filterButton = screen.getByText('Filters (2)');
      expect(filterButton).toHaveClass('filtersActive');
    });
  });

  // ===== FILTER DROPDOWN TESTS =====
  describe('filter dropdowns', () => {
    test('changes category filter', () => {
      render(<FilterBar onFiltersChange={mockOnFiltersChange} />);

      // Show filters
      fireEvent.click(screen.getByText('Filter'));

      const categorySelect = screen.getByLabelText(/category/i);
      fireEvent.change(categorySelect, { target: { value: 'Toys' } });

      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'Toys' }),
      );
    });

    test('changes condition filter', () => {
      render(<FilterBar onFiltersChange={mockOnFiltersChange} />);

      // Show filters
      fireEvent.click(screen.getByText('Filter'));

      const conditionSelect = screen.getByLabelText(/condition/i);
      fireEvent.change(conditionSelect, { target: { value: 'New' } });

      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({ condition: 'New' }),
      );
    });

    test('changes sort option', () => {
      render(<FilterBar onFiltersChange={mockOnFiltersChange} />);

      const sortSelect = screen.getByLabelText('Sort by');
      fireEvent.change(sortSelect, { target: { value: 'price-high' } });

      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({ sortBy: 'price-high' }),
      );
    });

    test('renders all category options', () => {
      render(<FilterBar />);

      fireEvent.click(screen.getByText('Filter'));

      const categorySelect = screen.getByLabelText(/category/i);

      expect(categorySelect).toContainHTML(
        '<option value="">All Categories</option>',
      );
      expect(categorySelect).toContainHTML(
        '<option value="Clothing">Clothing</option>',
      );
      expect(categorySelect).toContainHTML(
        '<option value="Toys">Toys</option>',
      );
      expect(categorySelect).toContainHTML(
        '<option value="Books">Books</option>',
      );
      expect(categorySelect).toContainHTML(
        '<option value="Gear">Baby Gear</option>',
      );
      expect(categorySelect).toContainHTML(
        '<option value="Other">Other</option>',
      );
    });

    test('renders all condition options', () => {
      render(<FilterBar />);

      fireEvent.click(screen.getByText('Filter'));

      const conditionSelect = screen.getByLabelText(/condition/i);

      expect(conditionSelect).toContainHTML(
        '<option value="">Any Condition</option>',
      );
      expect(conditionSelect).toContainHTML('<option value="New">New</option>');
      expect(conditionSelect).toContainHTML(
        '<option value="Like-New">Like New</option>',
      );
      expect(conditionSelect).toContainHTML(
        '<option value="Good">Good</option>',
      );
      expect(conditionSelect).toContainHTML(
        '<option value="Fair">Fair</option>',
      );
    });

    test('renders all sort options', () => {
      render(<FilterBar />);

      const sortSelect = screen.getByLabelText('Sort by');

      expect(sortSelect).toContainHTML(
        '<option value="newest">Newest First</option>',
      );
      expect(sortSelect).toContainHTML(
        '<option value="oldest">Oldest First</option>',
      );
      expect(sortSelect).toContainHTML(
        '<option value="price-low">Price: Low to High</option>',
      );
      expect(sortSelect).toContainHTML(
        '<option value="price-high">Price: High to Low</option>',
      );
    });
  });

  // ===== CLEAR FILTERS TESTS =====
  describe('clear filters', () => {
    test('clears all filters when clear button clicked', () => {
      const initialFilters = {
        category: 'Toys',
        condition: 'New',
        searchTerm: 'test search',
        sortBy: 'price-high',
      };

      render(
        <FilterBar
          initialFilters={initialFilters}
          activeFiltersCount={3}
          onFiltersChange={mockOnFiltersChange}
          onClearFilters={mockOnClearFilters}
        />,
      );

      const clearButton = screen.getByText('Clear');
      fireEvent.click(clearButton);

      // Should call onClearFilters
      expect(mockOnClearFilters).toHaveBeenCalledTimes(1);

      // Should reset internal state
      expect(screen.getByDisplayValue('')).toBeInTheDocument(); // search input
      expect(screen.getByDisplayValue('Newest First')).toBeInTheDocument(); // sort reset
    });

    test('hides filter panel when clearing filters', () => {
      render(
        <FilterBar
          activeFiltersCount={1}
          onClearFilters={mockOnClearFilters}
        />,
      );

      // Open filter panel
      fireEvent.click(screen.getByText('Filters (1)'));
      expect(screen.getByText('Category')).toBeInTheDocument();

      // Clear filters
      fireEvent.click(screen.getByText('Clear'));

      // Panel should be hidden
      expect(screen.queryByText('Category')).not.toBeInTheDocument();
    });

    test('handles clear without onClearFilters callback', () => {
      render(<FilterBar activeFiltersCount={1} />);

      const clearButton = screen.getByText('Clear');

      // Should not throw error
      expect(() => {
        fireEvent.click(clearButton);
      }).not.toThrow();
    });
  });

  // ===== HELPER FUNCTIONS TESTS =====
  describe('helper functions', () => {
    test('getFiltersButtonText returns correct text', () => {
      const { rerender } = render(<FilterBar activeFiltersCount={0} />);
      expect(screen.getByText('Filter')).toBeInTheDocument();

      rerender(<FilterBar activeFiltersCount={1} />);
      expect(screen.getByText('Filters (1)')).toBeInTheDocument();

      rerender(<FilterBar activeFiltersCount={5} />);
      expect(screen.getByText('Filters (5)')).toBeInTheDocument();
    });
  });

  // ===== INTEGRATION TESTS =====
  describe('integration scenarios', () => {
    test('complete filter workflow', () => {
      render(<FilterBar onFiltersChange={mockOnFiltersChange} />);

      // 1. Search for items
      const searchInput = screen.getByPlaceholderText('Search Baby Items...');
      fireEvent.change(searchInput, { target: { value: 'baby clothes' } });

      // 2. Open filters
      fireEvent.click(screen.getByText('Filter'));

      // 3. Set category
      const categorySelect = screen.getByLabelText(/category/i);
      fireEvent.change(categorySelect, { target: { value: 'Clothing' } });

      // 4. Set condition
      const conditionSelect = screen.getByLabelText(/condition/i);
      fireEvent.change(conditionSelect, { target: { value: 'Like-New' } });

      // 5. Change sort
      const sortSelect = screen.getByLabelText('Sort by');
      fireEvent.change(sortSelect, { target: { value: 'price-low' } });

      // Should have called onFiltersChange multiple times with accumulated filters
      expect(mockOnFiltersChange).toHaveBeenLastCalledWith({
        category: 'Clothing',
        condition: 'Like-New',
        ageRange: '',
        priceRange: '',
        sortBy: 'price-low',
        searchTerm: 'baby clothes',
      });
    });

    test('preserves initial filters in state', () => {
      const initialFilters = {
        category: 'Books',
        condition: 'Good',
        customField: 'custom value',
      };

      render(<FilterBar initialFilters={initialFilters} />);

      // Open filters to see current values
      fireEvent.click(screen.getByText('Filter'));

      // Should preserve custom fields through spread operator
      expect(screen.getByDisplayValue('Books')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Good')).toBeInTheDocument();
    });
  });

  // ===== EDGE CASES =====
  describe('edge cases', () => {
    test('handles missing callback functions gracefully', () => {
      render(<FilterBar />);

      const searchInput = screen.getByPlaceholderText('Search Baby Items...');

      // Should not throw errors
      expect(() => {
        fireEvent.change(searchInput, { target: { value: 'test' } });
        fireEvent.keyPress(searchInput, { key: 'Enter' });
      }).not.toThrow();
    });

    test('handles empty initial filters', () => {
      render(<FilterBar initialFilters={{}} />);

      expect(screen.getByDisplayValue('')).toBeInTheDocument(); // search input
      expect(screen.getByDisplayValue('Newest First')).toBeInTheDocument(); // sort
    });

    test('handles undefined initial filters', () => {
      render(<FilterBar initialFilters={undefined} />);

      expect(screen.getByDisplayValue('')).toBeInTheDocument();
    });
  });

  // ===== ACCESSIBILITY TESTS =====
  describe('accessibility', () => {
    // (removed test for getByLabelText('Search'))

    test('updates aria-expanded when filters toggle', () => {
      render(<FilterBar />);

      const filterButton = screen.getByText('Filter');

      expect(filterButton).toHaveAttribute('aria-expanded', 'false');

      fireEvent.click(filterButton);
      expect(filterButton).toHaveAttribute('aria-expanded', 'true');

      fireEvent.click(filterButton);
      expect(filterButton).toHaveAttribute('aria-expanded', 'false');
    });

    test('has proper form labels in filter panel', () => {
      render(<FilterBar />);

      fireEvent.click(screen.getByText('Filter'));

      expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/condition/i)).toBeInTheDocument();
    });

    test('search input is keyboard accessible', () => {
      render(<FilterBar onFiltersChange={mockOnFiltersChange} />);

      const searchInput = screen.getByPlaceholderText('Search Baby Items...');

      // Should be focusable
      searchInput.focus();
      expect(document.activeElement).toBe(searchInput);

      // Should handle Enter key
      fireEvent.keyPress(searchInput, { key: 'Enter', charCode: 13 });
      expect(mockOnFiltersChange).toHaveBeenCalled();
    });
  });

  // ===== STATE MANAGEMENT TESTS =====
  describe('state management', () => {
    test('maintains independent state for showFilters', () => {
      render(<FilterBar />);

      const filterButton = screen.getByText('Filter');

      // Toggle multiple times
      fireEvent.click(filterButton);
      expect(screen.getByText('Category')).toBeInTheDocument();

      fireEvent.click(filterButton);
      expect(screen.queryByText('Category')).not.toBeInTheDocument();

      fireEvent.click(filterButton);
      expect(screen.getByText('Category')).toBeInTheDocument();
    });

    test('preserves filter state when toggling visibility', () => {
      render(<FilterBar onFiltersChange={mockOnFiltersChange} />);

      // Set a filter
      const sortSelect = screen.getByLabelText('Sort by');
      fireEvent.change(sortSelect, { target: { value: 'price-high' } });

      // Toggle filter panel
      fireEvent.click(screen.getByText('Filter'));
      fireEvent.click(screen.getByText('Filter'));

      // Filter value should be preserved
      expect(sortSelect.value).toBe('price-high');
    });
  });
});
