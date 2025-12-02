import { render, screen } from '@testing-library/react';
// user-event not required; use fireEvent + waitFor to handle async updates
import ItemGrid from '@/components/ItemGrid/ItemGrid';

// Mock ItemCard component
jest.mock('@/components/ItemCard/ItemCard', () => {
  return function MockItemCard({ item }) {
    return (
      <div data-testid={`item-card-${item.id}`}>
        <h3>{item.title}</h3>
        <span>${item.price}</span>
      </div>
    );
  };
});

describe('ItemGrid Component', () => {
  // Mock items data
  const mockItems = [
    {
      id: '1',
      title: 'Baby Onesie',
      price: 10.99,
      category: 'Clothing',
      condition: 'Like New',
    },
    {
      id: '2',
      title: 'Toy Car',
      price: 5.99,
      category: 'Toys',
      condition: 'Good',
    },
    {
      id: '3',
      title: 'Picture Book',
      price: 3.5,
      category: 'Books',
      condition: 'New',
    },
  ];

  const mockOnLoadMore = jest.fn();

  beforeEach(() => {
    mockOnLoadMore.mockClear();
  });

  // ===== LOADING STATES =====
  describe('loading states', () => {
    test('shows loading skeletons when initially loading with no items', () => {
      render(<ItemGrid items={[]} loading={true} />);

      // Should show 8 skeleton cards
      const skeletons = document.querySelectorAll('[class*="skeletonCard"]');
      expect(skeletons).toHaveLength(8);

      // Should not show empty state or items
      expect(screen.queryByText('No items found')).not.toBeInTheDocument();
      expect(screen.queryByText('Showing 0 items')).not.toBeInTheDocument();
    });

    test('shows loading skeletons with correct structure', () => {
      render(<ItemGrid items={[]} loading={true} />);

      // Check skeleton structure
      const firstSkeleton = document.querySelector('[class*="skeletonCard"]');
      expect(firstSkeleton).toBeInTheDocument();

      // Check for skeleton image and content
      const skeletonImage = document.querySelector('[class*="skeletonImage"]');
      const skeletonContent = document.querySelector(
        '[class*="skeletonContent"]',
      );
      expect(skeletonImage).toBeInTheDocument();
      expect(skeletonContent).toBeInTheDocument();
    });

    test('does not show loading skeletons when not loading', () => {
      render(<ItemGrid items={mockItems} loading={false} />);

      const skeletons = document.querySelectorAll('[class*="skeletonCard"]');
      expect(skeletons).toHaveLength(0);
    });
  });

  // ===== EMPTY STATE =====
  describe('empty state', () => {
    test('shows empty state when not loading and no items', () => {
      render(<ItemGrid items={[]} loading={false} />);

      expect(screen.getByText('No items found')).toBeInTheDocument();
      expect(screen.getByText('🔍')).toBeInTheDocument();
      expect(
        screen.getByText(/Try adjusting your filters/),
      ).toBeInTheDocument();
    });

    test('does not show empty state when loading', () => {
      render(<ItemGrid items={[]} loading={true} />);

      expect(screen.queryByText('No items found')).not.toBeInTheDocument();
    });

    test('does not show empty state when items exist', () => {
      render(<ItemGrid items={mockItems} loading={false} />);

      expect(screen.queryByText('No items found')).not.toBeInTheDocument();
    });
  });

  // ===== ITEMS DISPLAY =====
  describe('items display', () => {
    test('renders items when provided', () => {
      render(<ItemGrid items={mockItems} loading={false} />);

      // Should render ItemCard for each item
      expect(screen.getByTestId('item-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('item-card-2')).toBeInTheDocument();
      expect(screen.getByTestId('item-card-3')).toBeInTheDocument();

      // Should show item details
      expect(screen.getByText('Baby Onesie')).toBeInTheDocument();
      expect(screen.getByText('Toy Car')).toBeInTheDocument();
      expect(screen.getByText('Picture Book')).toBeInTheDocument();
    });

    test('shows correct items count', () => {
      render(<ItemGrid items={mockItems} loading={false} />);

      expect(screen.getByText('Showing 3 items')).toBeInTheDocument();
    });

    test('handles empty items array gracefully', () => {
      render(<ItemGrid items={[]} loading={false} />);

      expect(screen.queryByTestId(/item-card/)).not.toBeInTheDocument();
      expect(screen.getByText('No items found')).toBeInTheDocument();
    });
  });

  // ===== DEFAULT PROPS =====
  describe('default props', () => {
    test('works with minimal props', () => {
      render(<ItemGrid />);

      // Should show empty state with default props
      expect(screen.getByText('No items found')).toBeInTheDocument();
    });

    test('uses default prop values', () => {
      render(<ItemGrid />);

      // items=[], loading=false, hasMore=true by default
      expect(screen.getByText('No items found')).toBeInTheDocument();
      expect(screen.queryByText('Load More Items')).not.toBeInTheDocument(); // No onLoadMore provided
    });
  });

  // Load-more behavior removed from component; tests related to that feature
  // were intentionally deleted because UI no longer includes a "Load More"
  // button. The component now relies on pagination controls elsewhere.

  // ===== END MESSAGE =====
  describe('end message', () => {
    test('shows end message when hasMore is false and items exist', () => {
      render(<ItemGrid items={mockItems} hasMore={false} />);

      expect(
        screen.getByText('You have reached the end! 🎉'),
      ).toBeInTheDocument();
    });

    test('does not show end message when hasMore is true', () => {
      render(<ItemGrid items={mockItems} hasMore={true} />);

      expect(
        screen.queryByText('You have reached the end! 🎉'),
      ).not.toBeInTheDocument();
    });

    test('does not show end message when no items', () => {
      render(<ItemGrid items={[]} hasMore={false} />);

      expect(
        screen.queryByText('You have reached the end! 🎉'),
      ).not.toBeInTheDocument();
    });
  });

  // ===== CONDITIONAL RENDERING LOGIC =====
  describe('conditional rendering combinations', () => {
    test('loading=true with existing items shows items + skeletons', () => {
      render(<ItemGrid items={mockItems} loading={true} />);

      // Should show existing items
      expect(screen.getByTestId('item-card-1')).toBeInTheDocument();
      expect(screen.getByText('Showing 3 items')).toBeInTheDocument();

      // Should NOT show initial loading skeletons (only shows when items.length === 0)
      const skeletons = document.querySelectorAll('[class*="skeletonCard"]');
      expect(skeletons).toHaveLength(0);
    });

    test('hasMore=true, no onLoadMore shows items but no load button', () => {
      render(
        <ItemGrid
          items={mockItems}
          hasMore={true}
          // No onLoadMore provided
        />,
      );

      expect(screen.getByTestId('item-card-1')).toBeInTheDocument();
      // Load More button removed from UI; verify it's not present
      expect(screen.queryByText('Load More Items')).not.toBeInTheDocument();
      expect(
        screen.queryByText('You have reached the end! 🎉'),
      ).not.toBeInTheDocument();
    });

    test('hasMore=false with items shows end message, no load button', () => {
      render(
        <ItemGrid
          items={mockItems}
          hasMore={false}
          onLoadMore={mockOnLoadMore}
        />,
      );

      expect(screen.getByTestId('item-card-1')).toBeInTheDocument();
      expect(screen.queryByText('Load More Items')).not.toBeInTheDocument();
      expect(
        screen.getByText('You have reached the end! 🎉'),
      ).toBeInTheDocument();
    });
  });

  // ===== EDGE CASES =====
  describe('edge cases', () => {
    test('handles single item correctly', () => {
      const singleItem = [mockItems[0]];

      render(<ItemGrid items={singleItem} />);

      expect(screen.getByText('Showing 1 items')).toBeInTheDocument();
      expect(screen.getByTestId('item-card-1')).toBeInTheDocument();
    });

    test('handles large number of items', () => {
      const manyItems = Array.from({ length: 50 }, (_, i) => ({
        id: `item-${i}`,
        title: `Item ${i}`,
        price: 10 + i,
      }));

      render(<ItemGrid items={manyItems} />);

      expect(screen.getByText('Showing 50 items')).toBeInTheDocument();
      expect(screen.getByTestId('item-card-item-0')).toBeInTheDocument();
      expect(screen.getByTestId('item-card-item-49')).toBeInTheDocument();
    });

    test('handles items with missing properties', () => {
      const itemsWithMissingProps = [
        { id: '1' }, // Missing title, price, etc.
        { id: '2', title: 'Has Title' },
      ];

      render(<ItemGrid items={itemsWithMissingProps} />);

      expect(screen.getByText('Showing 2 items')).toBeInTheDocument();
      expect(screen.getByTestId('item-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('item-card-2')).toBeInTheDocument();
    });

    test('handles onLoadMore prop gracefully when provided (no UI)', () => {
      const syncLoadMore = jest.fn(() => 'not a promise');

      render(
        <ItemGrid items={mockItems} hasMore={true} onLoadMore={syncLoadMore} />,
      );

      // Component no longer exposes a Load More button — ensure nothing called
      expect(screen.queryByText('Load More Items')).not.toBeInTheDocument();
      expect(syncLoadMore).not.toHaveBeenCalled();
    });
  });

  // ===== ACCESSIBILITY =====
  describe('accessibility', () => {
    test('empty state has proper heading structure', () => {
      render(<ItemGrid items={[]} loading={false} />);

      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('No items found');
    });
  });
});
