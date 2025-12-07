// tests/unit/components/FilterBar.branch-coverage.test.js
/**
 * Additional FilterBar tests focused on branch coverage
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import FilterBar from '../../../src/components/FilterBar/FilterBar';

jest.mock('next-auth/react');
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('FilterBar - Branch Coverage Tests', () => {
  const mockOnFiltersChange = jest.fn();
  const mockOnClearFilters = jest.fn();
  const mockRouterPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useRouter.mockReturnValue({ push: mockRouterPush });
  });

  describe('Session Handling Branches', () => {
    it('should show Add Listing button as Link when user is logged in', () => {
      useSession.mockReturnValue({
        data: { user: { id: 'user123' } },
        status: 'authenticated',
      });

      render(<FilterBar onFiltersChange={mockOnFiltersChange} />);

      const addButton = screen.getByText(/Add listing/i);
      expect(addButton.tagName).toBe('A'); // It's a Link
      expect(addButton).toHaveAttribute('href', '/add-listing');
    });

    it('should show Add Listing button as button when user is NOT logged in', () => {
      useSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
      });

      render(<FilterBar onFiltersChange={mockOnFiltersChange} />);

      const addButton = screen.getByText(/Add listing/i);
      expect(addButton.tagName).toBe('BUTTON');
      fireEvent.click(addButton);
      expect(mockRouterPush).toHaveBeenCalledWith('/login');
    });

    it('should handle loading session state', () => {
      useSession.mockReturnValue({
        data: null,
        status: 'loading',
      });

      render(<FilterBar onFiltersChange={mockOnFiltersChange} />);

      expect(screen.getByText(/Add listing/i)).toBeInTheDocument();
    });
  });

  describe('Clear Filters Branches', () => {
    it('should call onClearFilters when provided', () => {
      useSession.mockReturnValue({ data: null, status: 'unauthenticated' });

      render(
        <FilterBar
          onFiltersChange={mockOnFiltersChange}
          onClearFilters={mockOnClearFilters}
          activeFiltersCount={3}
        />,
      );

      const clearButton = screen.getByText('Clear');
      fireEvent.click(clearButton);

      expect(mockOnClearFilters).toHaveBeenCalled();
    });

    it('should handle missing onClearFilters gracefully', () => {
      useSession.mockReturnValue({ data: null, status: 'unauthenticated' });

      render(
        <FilterBar
          onFiltersChange={mockOnFiltersChange}
          activeFiltersCount={3}
        />,
      );

      const clearButton = screen.getByText('Clear');
      fireEvent.click(clearButton);

      // Should not throw error
      expect(clearButton).toBeInTheDocument();
    });

    it('should hide clear button when no active filters', () => {
      useSession.mockReturnValue({ data: null, status: 'unauthenticated' });

      render(
        <FilterBar
          onFiltersChange={mockOnFiltersChange}
          activeFiltersCount={0}
        />,
      );

      expect(screen.queryByText('Clear')).not.toBeInTheDocument();
    });

    it('should show clear button when filters are active', () => {
      useSession.mockReturnValue({ data: null, status: 'unauthenticated' });

      render(
        <FilterBar
          onFiltersChange={mockOnFiltersChange}
          activeFiltersCount={2}
        />,
      );

      expect(screen.getByText('Clear')).toBeInTheDocument();
    });
  });

  describe('Filter Button Text Branches', () => {
    it('should show "Filter" when no active filters', () => {
      useSession.mockReturnValue({ data: null, status: 'unauthenticated' });

      render(
        <FilterBar
          onFiltersChange={mockOnFiltersChange}
          activeFiltersCount={0}
        />,
      );

      expect(screen.getByText('Filter')).toBeInTheDocument();
    });

    it('should show "Filters (1)" when 1 active filter', () => {
      useSession.mockReturnValue({ data: null, status: 'unauthenticated' });

      render(
        <FilterBar
          onFiltersChange={mockOnFiltersChange}
          activeFiltersCount={1}
        />,
      );

      expect(screen.getByText('Filters (1)')).toBeInTheDocument();
    });

    it('should show "Filters (5)" when 5 active filters', () => {
      useSession.mockReturnValue({ data: null, status: 'unauthenticated' });

      render(
        <FilterBar
          onFiltersChange={mockOnFiltersChange}
          activeFiltersCount={5}
        />,
      );

      expect(screen.getByText('Filters (5)')).toBeInTheDocument();
    });
  });

  describe('Filter Normalization Branches', () => {
    it('should normalize category filter when it is a string', () => {
      useSession.mockReturnValue({ data: null, status: 'unauthenticated' });

      render(<FilterBar onFiltersChange={mockOnFiltersChange} />);

      fireEvent.click(screen.getByText(/Filter/));

      const categorySelect = screen.getByLabelText('Category');
      fireEvent.change(categorySelect, { target: { value: 'Clothing' } });

      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'Clothing',
        }),
      );
    });

    it('should normalize condition filter when it is a string', () => {
      useSession.mockReturnValue({ data: null, status: 'unauthenticated' });

      render(<FilterBar onFiltersChange={mockOnFiltersChange} />);

      fireEvent.click(screen.getByText(/Filter/));

      const conditionSelect = screen.getByLabelText('Condition');
      fireEvent.change(conditionSelect, { target: { value: 'New' } });

      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          condition: 'New',
        }),
      );
    });

    it('should normalize size filter', () => {
      useSession.mockReturnValue({ data: null, status: 'unauthenticated' });

      render(<FilterBar onFiltersChange={mockOnFiltersChange} />);

      fireEvent.click(screen.getByText(/Filter/));

      const sizeSelect = screen.getByLabelText('Size');
      fireEvent.change(sizeSelect, { target: { value: 'NB' } });

      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          size: 'NB',
        }),
      );
    });

    it('should normalize ageRange filter', () => {
      useSession.mockReturnValue({ data: null, status: 'unauthenticated' });

      render(<FilterBar onFiltersChange={mockOnFiltersChange} />);

      fireEvent.click(screen.getByText(/Filter/));

      const ageRangeSelect = screen.getByLabelText('Age Range');
      fireEvent.change(ageRangeSelect, { target: { value: '0-6M' } });

      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          ageRange: '0-6M',
        }),
      );
    });

    it('should normalize searchTerm filter', () => {
      useSession.mockReturnValue({ data: null, status: 'unauthenticated' });

      render(<FilterBar onFiltersChange={mockOnFiltersChange} />);

      const searchInput = screen.getByPlaceholderText(/Search Baby Items/i);
      fireEvent.change(searchInput, { target: { value: '  baby clothes  ' } });
      fireEvent.keyPress(searchInput, { key: 'Enter', code: 'Enter' });

      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          searchTerm: 'baby clothes',
        }),
      );
    });
  });

  describe('Callback Branches', () => {
    it('should call onFiltersChange when provided', () => {
      useSession.mockReturnValue({ data: null, status: 'unauthenticated' });

      render(<FilterBar onFiltersChange={mockOnFiltersChange} />);

      const searchInput = screen.getByPlaceholderText(/Search Baby Items/i);
      fireEvent.change(searchInput, { target: { value: 'test' } });

      expect(mockOnFiltersChange).toHaveBeenCalled();
    });

    it('should handle missing onFiltersChange gracefully', () => {
      useSession.mockReturnValue({ data: null, status: 'unauthenticated' });

      render(<FilterBar />);

      const searchInput = screen.getByPlaceholderText(/Search Baby Items/i);
      fireEvent.change(searchInput, { target: { value: 'test' } });

      // Should not throw error
      expect(searchInput.value).toBe('test');
    });
  });

  describe('Search Handling Branches', () => {
    it('should trigger search on Enter key', () => {
      useSession.mockReturnValue({ data: null, status: 'unauthenticated' });

      render(<FilterBar onFiltersChange={mockOnFiltersChange} />);

      const searchInput = screen.getByPlaceholderText(/Search Baby Items/i);
      fireEvent.change(searchInput, { target: { value: 'baby hat' } });
      fireEvent.keyPress(searchInput, {
        key: 'Enter',
        code: 'Enter',
        charCode: 13,
      });

      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          searchTerm: 'baby hat',
        }),
      );
    });

    it('should not trigger search on other keys', () => {
      useSession.mockReturnValue({ data: null, status: 'unauthenticated' });

      render(<FilterBar onFiltersChange={mockOnFiltersChange} />);

      const searchInput = screen.getByPlaceholderText(/Search Baby Items/i);
      fireEvent.change(searchInput, { target: { value: 'baby' } });

      const callsBeforeKeyPress = mockOnFiltersChange.mock.calls.length;

      fireEvent.keyPress(searchInput, { key: 'a', code: 'KeyA' });

      // Should not call again (only called from onChange)
      expect(mockOnFiltersChange.mock.calls.length).toBe(callsBeforeKeyPress);
    });
  });

  describe('Initial Filters Branches', () => {
    it('should use initialFilters when provided', () => {
      useSession.mockReturnValue({ data: null, status: 'unauthenticated' });

      const initialFilters = {
        category: 'Clothing',
        condition: 'New',
        size: 'NB',
        ageRange: '0-6M',
        sortBy: 'price-low',
        searchTerm: 'baby clothes',
      };

      render(
        <FilterBar
          initialFilters={initialFilters}
          onFiltersChange={mockOnFiltersChange}
        />,
      );

      const searchInput = screen.getByPlaceholderText(/Search Baby Items/i);
      expect(searchInput.value).toBe('baby clothes');
    });

    it('should use default values when initialFilters is empty', () => {
      useSession.mockReturnValue({ data: null, status: 'unauthenticated' });

      render(<FilterBar onFiltersChange={mockOnFiltersChange} />);

      const searchInput = screen.getByPlaceholderText(/Search Baby Items/i);
      expect(searchInput.value).toBe('');
    });

    it('should handle partial initialFilters', () => {
      useSession.mockReturnValue({ data: null, status: 'unauthenticated' });

      const initialFilters = {
        category: 'Toys',
        // Other fields missing - should use defaults
      };

      render(
        <FilterBar
          initialFilters={initialFilters}
          onFiltersChange={mockOnFiltersChange}
        />,
      );

      expect(screen.getByPlaceholderText(/Search Baby Items/i).value).toBe('');
    });
  });

  describe('Filter Toggle Branches', () => {
    it('should show filters when showFilters is true', () => {
      useSession.mockReturnValue({ data: null, status: 'unauthenticated' });

      render(<FilterBar onFiltersChange={mockOnFiltersChange} />);

      const filterButton = screen.getByText('Filter');
      fireEvent.click(filterButton);

      expect(screen.getByLabelText('Category')).toBeInTheDocument();
      expect(screen.getByLabelText('Condition')).toBeInTheDocument();
      expect(screen.getByLabelText('Size')).toBeInTheDocument();
    });

    it('should hide filters when clicking filter button again', () => {
      useSession.mockReturnValue({ data: null, status: 'unauthenticated' });

      render(<FilterBar onFiltersChange={mockOnFiltersChange} />);

      const filterButton = screen.getByText('Filter');

      // Open filters
      fireEvent.click(filterButton);
      expect(screen.getByLabelText('Category')).toBeInTheDocument();

      // Close filters
      fireEvent.click(filterButton);
      expect(screen.queryByLabelText('Category')).not.toBeInTheDocument();
    });
  });

  describe('All Filter Options Coverage', () => {
    beforeEach(() => {
      useSession.mockReturnValue({ data: null, status: 'unauthenticated' });
    });

    it('should handle all category options', () => {
      render(<FilterBar onFiltersChange={mockOnFiltersChange} />);

      fireEvent.click(screen.getByText('Filter'));
      const categorySelect = screen.getByLabelText('Category');

      const categories = ['', 'Clothing', 'Toys', 'Books', 'Gear', 'Other'];

      categories.forEach((category) => {
        fireEvent.change(categorySelect, { target: { value: category } });
        expect(mockOnFiltersChange).toHaveBeenCalledWith(
          expect.objectContaining({ category }),
        );
      });
    });

    it('should handle all condition options', () => {
      render(<FilterBar onFiltersChange={mockOnFiltersChange} />);

      fireEvent.click(screen.getByText('Filter'));
      const conditionSelect = screen.getByLabelText('Condition');

      const conditions = ['', 'New', 'Like-New', 'Good', 'Fair'];

      conditions.forEach((condition) => {
        fireEvent.change(conditionSelect, { target: { value: condition } });
        expect(mockOnFiltersChange).toHaveBeenCalledWith(
          expect.objectContaining({ condition }),
        );
      });
    });

    it('should handle all size options', () => {
      render(<FilterBar onFiltersChange={mockOnFiltersChange} />);

      fireEvent.click(screen.getByText('Filter'));
      const sizeSelect = screen.getByLabelText('Size');

      const sizes = [
        '',
        'NB',
        '3M',
        '6M',
        '9M',
        '12M',
        '18M',
        '24M',
        '2T',
        '3T',
        '4T',
      ];

      sizes.forEach((size) => {
        fireEvent.change(sizeSelect, { target: { value: size } });
        expect(mockOnFiltersChange).toHaveBeenCalledWith(
          expect.objectContaining({ size }),
        );
      });
    });

    it('should handle all ageRange options', () => {
      render(<FilterBar onFiltersChange={mockOnFiltersChange} />);

      fireEvent.click(screen.getByText('Filter'));
      const ageRangeSelect = screen.getByLabelText('Age Range');

      const ageRanges = ['', '0-6M', '6-12M', '1-2Y', '2-3Y', '3-5Y'];

      ageRanges.forEach((ageRange) => {
        fireEvent.change(ageRangeSelect, { target: { value: ageRange } });
        expect(mockOnFiltersChange).toHaveBeenCalledWith(
          expect.objectContaining({ ageRange }),
        );
      });
    });

    it('should handle all availability options', () => {
      render(<FilterBar onFiltersChange={mockOnFiltersChange} />);

      fireEvent.click(screen.getByText('Filter'));
      const availabilitySelect = screen.getByLabelText('Availability');

      const availabilities = ['available', 'sold'];

      availabilities.forEach((availability) => {
        fireEvent.change(availabilitySelect, {
          target: { value: availability },
        });
        expect(mockOnFiltersChange).toHaveBeenCalledWith(
          expect.objectContaining({ availability }),
        );
      });
    });

    it('should handle all sortBy options', () => {
      render(<FilterBar onFiltersChange={mockOnFiltersChange} />);

      const sortSelect = screen.getByLabelText('Sort by');

      const sortOptions = [
        'newest',
        'oldest',
        'price-low',
        'price-high',
        'distance',
      ];

      sortOptions.forEach((sortBy) => {
        fireEvent.change(sortSelect, { target: { value: sortBy } });
        expect(mockOnFiltersChange).toHaveBeenCalledWith(
          expect.objectContaining({ sortBy }),
        );
      });
    });
  });

  describe('Normalization Edge Cases', () => {
    beforeEach(() => {
      useSession.mockReturnValue({ data: null, status: 'unauthenticated' });
    });

    it('should handle non-string category values', () => {
      render(<FilterBar onFiltersChange={mockOnFiltersChange} />);

      fireEvent.click(screen.getByText('Filter'));
      const categorySelect = screen.getByLabelText('Category');

      // Simulate empty selection
      fireEvent.change(categorySelect, { target: { value: '' } });

      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({ category: '' }),
      );
    });

    it.skip('should handle empty searchTerm', () => {
      render(<FilterBar onFiltersChange={mockOnFiltersChange} />);

      const searchInput = screen.getByPlaceholderText(/Search Baby Items/i);
      fireEvent.change(searchInput, { target: { value: '' } });

      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({ searchTerm: '' }),
      );
    });

    it('should handle whitespace-only searchTerm', () => {
      render(<FilterBar onFiltersChange={mockOnFiltersChange} />);

      const searchInput = screen.getByPlaceholderText(/Search Baby Items/i);
      fireEvent.change(searchInput, { target: { value: '   ' } });
      fireEvent.keyPress(searchInput, { key: 'Enter' });

      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({ searchTerm: '' }),
      );
    });
  });

  describe('Filter Clear All Fields', () => {
    it('should reset all filters to default values', () => {
      useSession.mockReturnValue({ data: null, status: 'unauthenticated' });

      const initialFilters = {
        category: 'Clothing',
        condition: 'New',
        size: 'NB',
        ageRange: '0-6M',
        sortBy: 'price-low',
        searchTerm: 'test',
        availability: 'sold',
      };

      render(
        <FilterBar
          initialFilters={initialFilters}
          onFiltersChange={mockOnFiltersChange}
          onClearFilters={mockOnClearFilters}
          activeFiltersCount={5}
        />,
      );

      const clearButton = screen.getByText('Clear');
      fireEvent.click(clearButton);

      // Should close filter panel
      expect(screen.queryByLabelText('Category')).not.toBeInTheDocument();

      // Should call onClearFilters
      expect(mockOnClearFilters).toHaveBeenCalled();
    });
  });

  describe('Aria and Accessibility Branches', () => {
    it('should set aria-expanded to true when filters are shown', () => {
      useSession.mockReturnValue({ data: null, status: 'unauthenticated' });

      render(<FilterBar onFiltersChange={mockOnFiltersChange} />);

      const filterButton = screen.getByText('Filter');

      fireEvent.click(filterButton);

      expect(filterButton).toHaveAttribute('aria-expanded', 'true');
    });

    it('should set aria-expanded to false when filters are hidden', () => {
      useSession.mockReturnValue({ data: null, status: 'unauthenticated' });

      render(<FilterBar onFiltersChange={mockOnFiltersChange} />);

      const filterButton = screen.getByText('Filter');

      expect(filterButton).toHaveAttribute('aria-expanded', 'false');
    });
  });

  describe('Multiple Filter Changes', () => {
    it('should handle rapid filter changes', () => {
      useSession.mockReturnValue({ data: null, status: 'unauthenticated' });

      render(<FilterBar onFiltersChange={mockOnFiltersChange} />);

      fireEvent.click(screen.getByText('Filter'));

      const categorySelect = screen.getByLabelText('Category');
      const conditionSelect = screen.getByLabelText('Condition');
      const sizeSelect = screen.getByLabelText('Size');

      // Rapid changes
      fireEvent.change(categorySelect, { target: { value: 'Clothing' } });
      fireEvent.change(conditionSelect, { target: { value: 'New' } });
      fireEvent.change(sizeSelect, { target: { value: 'NB' } });

      expect(mockOnFiltersChange).toHaveBeenCalledTimes(3);
    });

    it('should accumulate multiple filters correctly', () => {
      useSession.mockReturnValue({ data: null, status: 'unauthenticated' });

      render(<FilterBar onFiltersChange={mockOnFiltersChange} />);

      fireEvent.click(screen.getByText('Filter'));

      const categorySelect = screen.getByLabelText('Category');
      fireEvent.change(categorySelect, { target: { value: 'Clothing' } });

      const sizeSelect = screen.getByLabelText('Size');
      fireEvent.change(sizeSelect, { target: { value: 'NB' } });

      // Last call should have both filters
      const lastCall =
        mockOnFiltersChange.mock.calls[
          mockOnFiltersChange.mock.calls.length - 1
        ][0];
      expect(lastCall.category).toBe('Clothing');
      expect(lastCall.size).toBe('NB');
    });
  });
});
