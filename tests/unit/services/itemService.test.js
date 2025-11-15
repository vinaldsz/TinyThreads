import {
  getItems,
  getItemById,
  filterItems,
  searchItems,
  getItemsBySeller,
  getAvailableFilters,
  getFeaturedItems,
} from '@/services/itemService';

// Mock the types/item module using the alias so this file works from its new location
jest.mock('@/types/item', () => ({
  getFilterOptions: jest.fn(() => ({
    categories: ['Clothing', 'Toys', 'Books'],
    conditions: ['New', 'Like New', 'Good', 'Fair'],
    sizes: ['Newborn', '3M', '6M', '12M'],
  })),
}));

// Mock fetch globally
global.fetch = jest.fn();

describe('itemService', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    fetch.mockReset();
    delete process.env.NEXT_PUBLIC_API_BASE_URL;
  });

  // ===== NORMALIZE ITEM TESTS (Pure Function) =====
  describe('normalizeItem', () => {
    // We need to import the internal function by testing it through public functions
    // or we can test the normalization behavior through the public API functions

    test('handles item with _id field', async () => {
      const mockResponse = {
        items: [
          {
            _id: '507f1f77bcf86cd799439011',
            title: 'Test Item',
            price: 10.99,
            size: '6M',
          },
        ],
        total: 1,
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getItems();
      const item = result.items[0];

      expect(item.id).toBe('507f1f77bcf86cd799439011');
      expect(item._id).toBe('507f1f77bcf86cd799439011');
    });

    test('handles item with regular id field', async () => {
      const mockResponse = {
        items: [
          {
            id: 'simple-id',
            title: 'Test Item',
            price: '15.50',
          },
        ],
        total: 1,
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getItems();
      const item = result.items[0];

      expect(item.id).toBe('simple-id');
      expect(item.price).toBe(15.5); // Should convert string to number
    });

    test('handles missing fields with defaults', async () => {
      const mockResponse = {
        items: [
          {
            _id: 'test-id',
            // Missing most fields
          },
        ],
        total: 1,
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getItems();
      const item = result.items[0];

      expect(item.title).toBe('');
      expect(item.price).toBe(0);
      expect(item.size).toBe('');
      expect(item.condition).toBe('');
      expect(item.description).toBe('');
      expect(item.category).toBe('');
      expect(item.ageRange).toBe('');
      expect(item.status).toBe('available');
    });

    test('handles imageUrls array', async () => {
      const mockResponse = {
        items: [
          {
            _id: 'test-id',
            imageUrls: ['image1.jpg', 'image2.jpg'],
          },
        ],
        total: 1,
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getItems();
      const item = result.items[0];

      expect(item.imageUrl).toBe('image1.jpg'); // Should take first image
    });

    test('handles empty imageUrls array', async () => {
      const mockResponse = {
        items: [
          {
            _id: 'test-id',
            imageUrls: [],
            imageUrl: 'fallback.jpg',
          },
        ],
        total: 1,
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getItems();
      const item = result.items[0];

      expect(item.imageUrl).toBe('fallback.jpg');
    });
  });

  // ===== API FETCH TESTS =====
  describe('apiFetch error handling', () => {
    test('throws error on non-ok response', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: async () => 'Item not found',
      });

      await expect(getItemById('nonexistent')).rejects.toThrow(
        'API 404: Item not found',
      );
    });

    test('handles response with no error text', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => {
          throw new Error('No text');
        },
      });

      await expect(getItemById('test')).rejects.toThrow(
        'API 500: Internal Server Error',
      );
    });

    test('uses default API base when no environment variable set', async () => {
      // Just verify it uses relative URLs by default
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'test', title: 'Test' }),
      });

      await getItemById('test-id');

      expect(fetch).toHaveBeenCalledWith(
        '/api/items/test-id',
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
        }),
      );
    });

    test('handles API response with different error format', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: async () => 'Resource not found',
      });

      await expect(getItemById('missing')).rejects.toThrow(
        'API 404: Resource not found',
      );
    });
  });

  // ===== GET ITEMS TESTS =====
  describe('getItems', () => {
    test('fetches items with default pagination', async () => {
      const mockResponse = {
        items: [
          { _id: '1', title: 'Item 1', price: 10 },
          { _id: '2', title: 'Item 2', price: 20 },
        ],
        total: 2,
        page: 1,
        limit: 12,
        hasMore: false,
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getItems();

      expect(fetch).toHaveBeenCalledWith(
        '/api/items?page=1&limit=12',
        expect.any(Object),
      );
      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(12);
      expect(result.hasMore).toBe(false);
    });

    test('handles custom pagination parameters', async () => {
      const mockResponse = {
        items: [],
        total: 50,
        page: 3,
        limit: 24,
        hasMore: true,
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getItems(3, 24);

      expect(fetch).toHaveBeenCalledWith(
        '/api/items?page=3&limit=24',
        expect.any(Object),
      );
      expect(result.page).toBe(3);
      expect(result.limit).toBe(24);
      expect(result.hasMore).toBe(true);
    });

    test('includes extra parameters in query string', async () => {
      const mockResponse = { items: [], total: 0 };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await getItems(1, 12, { category: 'Clothing', size: '6M' });

      expect(fetch).toHaveBeenCalledWith(
        '/api/items?page=1&limit=12&category=Clothing&size=6M',
        expect.any(Object),
      );
    });

    test('filters out empty extra parameters', async () => {
      const mockResponse = { items: [], total: 0 };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await getItems(1, 12, {
        category: 'Clothing',
        size: '',
        condition: null,
        search: undefined,
      });

      expect(fetch).toHaveBeenCalledWith(
        '/api/items?page=1&limit=12&category=Clothing',
        expect.any(Object),
      );
    });

    test('handles response without pagination metadata', async () => {
      const mockResponse = {
        items: [{ _id: '1', title: 'Item 1' }],
        // Missing total, page, limit, hasMore
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getItems();

      expect(result.total).toBe(1); // Falls back to items.length
      expect(result.page).toBe(1); // Falls back to requested page
      expect(result.limit).toBe(12); // Falls back to requested limit
      expect(result.hasMore).toBe(false); // items.length < limit
    });
  });

  // ===== GET ITEM BY ID TESTS =====
  describe('getItemById', () => {
    test('fetches single item successfully', async () => {
      const mockItem = {
        _id: 'test-id',
        title: 'Test Item',
        price: 25.99,
        description: 'Test description',
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ item: mockItem }),
      });

      const result = await getItemById('test-id');

      expect(fetch).toHaveBeenCalledWith(
        '/api/items/test-id',
        expect.any(Object),
      );
      expect(result.id).toBe('test-id');
      expect(result.title).toBe('Test Item');
      expect(result.price).toBe(25.99);
    });

    test('handles response without item wrapper', async () => {
      const mockItem = {
        _id: 'test-id',
        title: 'Direct Item',
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockItem, // Direct object, not { item: ... }
      });

      const result = await getItemById('test-id');

      expect(result.title).toBe('Direct Item');
    });

    test('throws error when id is missing', async () => {
      await expect(getItemById('')).rejects.toThrow('Missing item id');
      await expect(getItemById(null)).rejects.toThrow('Missing item id');
      await expect(getItemById(undefined)).rejects.toThrow('Missing item id');

      expect(fetch).not.toHaveBeenCalled();
    });

    test('throws error when item not found', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ error: 'Item not found' }),
      });

      await expect(getItemById('nonexistent')).rejects.toThrow(
        'Item with id nonexistent not found',
      );
    });
  });

  // ===== FILTER ITEMS TESTS =====
  describe('filterItems', () => {
    test('applies filters to API call', async () => {
      const mockResponse = {
        items: [{ _id: '1', title: 'Filtered Item' }],
        total: 1,
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const filters = {
        category: 'Clothing',
        condition: 'Like New',
        size: '6M',
      };

      const result = await filterItems(filters);

      expect(fetch).toHaveBeenCalledWith(
        '/api/items?category=Clothing&condition=Like+New&size=6M',
        expect.any(Object),
      );
      expect(result.appliedFilters).toEqual(filters);
    });

    test('filters out empty and "All" values', async () => {
      const mockResponse = { items: [], total: 0 };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const filters = {
        category: 'Clothing',
        condition: 'All',
        size: '',
        minPrice: null,
        maxPrice: undefined,
      };

      await filterItems(filters);

      expect(fetch).toHaveBeenCalledWith(
        '/api/items?category=Clothing',
        expect.any(Object),
      );
    });

    test('handles empty filters object', async () => {
      const mockResponse = { items: [], total: 0 };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await filterItems({});

      expect(fetch).toHaveBeenCalledWith('/api/items?', expect.any(Object));
    });
  });

  // ===== SEARCH ITEMS TESTS =====
  describe('searchItems', () => {
    test('calls filterItems with searchTerm', async () => {
      const mockResponse = {
        items: [{ _id: '1', title: 'Search Result' }],
        total: 1,
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await searchItems('baby clothes');

      expect(fetch).toHaveBeenCalledWith(
        '/api/items?searchTerm=baby+clothes',
        expect.any(Object),
      );
      expect(result.appliedFilters).toEqual({ searchTerm: 'baby clothes' });
    });
  });

  // ===== GET ITEMS BY SELLER TESTS =====
  describe('getItemsBySeller', () => {
    test('fetches items by seller ID', async () => {
      const mockResponse = {
        items: [
          { _id: '1', title: 'Seller Item 1' },
          { _id: '2', title: 'Seller Item 2' },
        ],
        total: 2,
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getItemsBySeller('seller123');

      expect(fetch).toHaveBeenCalledWith(
        '/api/items?sellerId=seller123&page=1&limit=24',
        expect.any(Object),
      );
      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    test('handles custom pagination for seller items', async () => {
      const mockResponse = { items: [], total: 0 };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await getItemsBySeller('seller123', 2, 10);

      expect(fetch).toHaveBeenCalledWith(
        '/api/items?sellerId=seller123&page=2&limit=10',
        expect.any(Object),
      );
    });

    test('throws error when sellerId is missing', async () => {
      await expect(getItemsBySeller('')).rejects.toThrow('Missing sellerId');
      await expect(getItemsBySeller(null)).rejects.toThrow('Missing sellerId');

      expect(fetch).not.toHaveBeenCalled();
    });
  });

  // ===== GET AVAILABLE FILTERS TESTS =====
  describe('getAvailableFilters', () => {
    test('returns filter options from types module', () => {
      const filters = getAvailableFilters();

      expect(filters).toEqual({
        categories: ['Clothing', 'Toys', 'Books'],
        conditions: ['New', 'Like New', 'Good', 'Fair'],
        sizes: ['Newborn', '3M', '6M', '12M'],
      });
    });
  });

  // ===== GET FEATURED ITEMS TESTS =====
  describe('getFeaturedItems', () => {
    test('fetches featured items with default limit', async () => {
      const mockResponse = {
        items: [
          { _id: '1', title: 'Featured Item 1' },
          { _id: '2', title: 'Featured Item 2' },
        ],
        total: 2,
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getFeaturedItems();

      expect(fetch).toHaveBeenCalledWith(
        '/api/items?limit=6&featured=true',
        expect.any(Object),
      );
      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    test('fetches featured items with custom limit', async () => {
      const mockResponse = { items: [], total: 0 };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await getFeaturedItems(10);

      expect(fetch).toHaveBeenCalledWith(
        '/api/items?limit=10&featured=true',
        expect.any(Object),
      );
    });
  });

  // ===== EDGE CASES AND ERROR CONDITIONS =====
  describe('edge cases', () => {
    test('handles network failure', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(getItems()).rejects.toThrow('Network error');
    });

    test('handles malformed JSON response', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      });

      await expect(getItems()).rejects.toThrow('Invalid JSON');
    });

    test('handles non-array items response', async () => {
      const mockResponse = {
        items: null, // Not an array
        total: 0,
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getItems();

      expect(result.items).toEqual([]); // Should default to empty array
      expect(result.total).toBe(0);
    });
  });
});
