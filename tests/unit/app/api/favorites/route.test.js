/**
 * @jest-environment node
 */

jest.mock('@/lib/mongodb', () => ({
  getDb: jest.fn(),
}));

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('@/app/api/auth/[...nextauth]/route', () => ({
  authOptions: {
    providers: [],
    session: { strategy: 'jwt' },
  },
}));

// Mock console.error to prevent issues
global.console = {
  ...console,
  error: jest.fn(),
};

import { GET, POST, DELETE } from '@/app/api/favorites/route';
import { getDb } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { ObjectId } from 'mongodb';

describe('Favorites API', () => {
  let mockDb;
  let mockFavoritesCollection;
  let mockListingsCollection;

  const mockUserId = new ObjectId();
  const mockItemId = new ObjectId();

  beforeEach(() => {
    mockFavoritesCollection = {
      aggregate: jest.fn().mockReturnThis(),
      toArray: jest.fn(),
      findOne: jest.fn(),
      insertOne: jest.fn(),
      deleteOne: jest.fn(),
    };

    mockListingsCollection = {
      findOne: jest.fn(),
    };

    mockDb = {
      collection: jest.fn((name) => {
        if (name === 'favorites') return mockFavoritesCollection;
        if (name === 'Listings') return mockListingsCollection;
        return null;
      }),
    };

    getDb.mockResolvedValue(mockDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/favorites', () => {
    it('should return 401 if not authenticated', async () => {
      getServerSession.mockResolvedValue(null);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return favorites for authenticated user', async () => {
      getServerSession.mockResolvedValue({
        user: { id: mockUserId.toString() },
      });

      const mockFavorites = [
        {
          _id: new ObjectId(),
          userId: mockUserId,
          itemId: mockItemId,
          createdAt: new Date(),
          item: {
            _id: mockItemId,
            title: 'Test Item',
            price: 20.0,
            size: '12M',
            condition: 'Like New',
          },
        },
      ];

      mockFavoritesCollection.toArray.mockResolvedValue(mockFavorites);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.favorites).toHaveLength(1);
    });
  });

  describe('POST /api/favorites', () => {
    it('should return 401 if not authenticated', async () => {
      getServerSession.mockResolvedValue(null);

      const mockRequest = {
        json: jest.fn().mockResolvedValue({ itemId: mockItemId.toString() }),
      };

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should add item to favorites', async () => {
      getServerSession.mockResolvedValue({
        user: { id: mockUserId.toString() },
      });

      mockListingsCollection.findOne.mockResolvedValue({
        _id: mockItemId,
        title: 'Test Item',
      });
      mockFavoritesCollection.findOne.mockResolvedValue(null);
      mockFavoritesCollection.insertOne.mockResolvedValue({
        insertedId: new ObjectId(),
      });

      const mockRequest = {
        json: jest.fn().mockResolvedValue({ itemId: mockItemId.toString() }),
      };

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.message).toBe('Item added to favorites');
      expect(mockFavoritesCollection.insertOne).toHaveBeenCalled();
    });
  });

  describe('DELETE /api/favorites', () => {
    it('should return 401 if not authenticated', async () => {
      getServerSession.mockResolvedValue(null);

      const mockRequest = {
        url: `http://localhost/api/favorites?itemId=${mockItemId.toString()}`,
      };

      const response = await DELETE(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should remove item from favorites', async () => {
      getServerSession.mockResolvedValue({
        user: { id: mockUserId.toString() },
      });

      mockFavoritesCollection.deleteOne.mockResolvedValue({
        deletedCount: 1,
      });

      const mockRequest = {
        url: `http://localhost/api/favorites?itemId=${mockItemId.toString()}`,
      };

      const response = await DELETE(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe('Item removed from favorites');
      expect(mockFavoritesCollection.deleteOne).toHaveBeenCalled();
    });
  });
});
