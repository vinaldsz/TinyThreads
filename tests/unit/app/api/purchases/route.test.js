/**
 * @jest-environment node
 */

jest.mock('@/lib/mongodb', () => ({
  getDb: jest.fn(),
}));

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

jest.mock('@/app/api/auth/[...nextauth]/route', () => ({
  authOptions: {
    providers: [],
    session: { strategy: 'jwt' },
  },
}));

// Mock console.error to prevent Next.js error handler infinite loop
global.console = {
  ...console,
  error: jest.fn(),
};

import { GET } from '@/app/api/purchases/route';
import { getDb } from '@/lib/mongodb';
import { getServerSession } from 'next-auth/next';
import { ObjectId } from 'mongodb';

describe('GET /api/purchases', () => {
  let mockDb;
  let mockTransactionsCollection;
  let mockListingsCollection;

  const mockUserId = new ObjectId();
  const mockItemId1 = new ObjectId();
  const mockItemId2 = new ObjectId();

  beforeEach(() => {
    mockTransactionsCollection = {
      find: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      toArray: jest.fn(),
    };

    mockListingsCollection = {
      find: jest.fn().mockReturnThis(),
      toArray: jest.fn(),
    };

    mockDb = {
      collection: jest.fn((name) => {
        if (name === 'transactions') return mockTransactionsCollection;
        if (name === 'Listings') return mockListingsCollection;
        return null;
      }),
    };

    getDb.mockResolvedValue(mockDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if user is not authenticated', async () => {
    getServerSession.mockResolvedValue(null);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should return purchases for authenticated user', async () => {
    getServerSession.mockResolvedValue({
      user: { id: mockUserId.toString(), email: 'test@example.com' },
    });

    const mockTransactions = [
      {
        _id: new ObjectId(),
        itemId: mockItemId1,
        buyerId: mockUserId,
        price: 25.99,
        timestamp: new Date('2025-12-01'),
        status: 'completed',
      },
      {
        _id: new ObjectId(),
        itemId: mockItemId2,
        buyerId: mockUserId,
        price: 15.0,
        timestamp: new Date('2025-11-15'),
        status: 'completed',
      },
    ];

    const mockItems = [
      {
        _id: mockItemId1,
        title: 'Baby Shoes',
        imageUrls: ['https://example.com/shoes.jpg'],
        condition: 'Like New',
        size: '6-12M',
        category: 'Clothing',
        location: 'San Jose, CA',
        sellerName: 'Jane Doe',
        sellerEmail: 'jane@example.com',
      },
      {
        _id: mockItemId2,
        title: 'Toy Car',
        imageUrl: 'https://example.com/car.jpg',
        imageUrls: [],
        condition: 'Good',
        size: 'Medium',
        category: 'Toys',
        location: 'Fremont, CA',
        sellerName: 'John Smith',
        sellerEmail: 'john@example.com',
      },
    ];

    mockTransactionsCollection.toArray.mockResolvedValue(mockTransactions);
    mockListingsCollection.toArray.mockResolvedValue(mockItems);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.purchases).toHaveLength(2);
    expect(data.purchases[0]).toMatchObject({
      price: 25.99,
      status: 'completed',
      item: {
        title: 'Baby Shoes',
        condition: 'Like New',
      },
    });
  });

  it('should handle imageUrl fallback', async () => {
    getServerSession.mockResolvedValue({
      user: { id: mockUserId.toString() },
    });

    const mockTransactions = [
      {
        _id: new ObjectId(),
        itemId: mockItemId1,
        buyerId: mockUserId,
        price: 20.0,
        timestamp: new Date(),
        status: 'completed',
      },
    ];

    const mockItems = [
      {
        _id: mockItemId1,
        title: 'Test Item',
        imageUrl: 'https://example.com/test.jpg',
        condition: 'New',
        size: '12M',
        category: 'Clothing',
      },
    ];

    mockTransactionsCollection.toArray.mockResolvedValue(mockTransactions);
    mockListingsCollection.toArray.mockResolvedValue(mockItems);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.purchases[0].item.imageUrls).toEqual([
      'https://example.com/test.jpg',
    ]);
  });

  it('should handle missing items', async () => {
    getServerSession.mockResolvedValue({
      user: { id: mockUserId.toString() },
    });

    const mockTransactions = [
      {
        _id: new ObjectId(),
        itemId: mockItemId1,
        buyerId: mockUserId,
        price: 20.0,
        timestamp: new Date(),
        status: 'completed',
      },
    ];

    mockTransactionsCollection.toArray.mockResolvedValue(mockTransactions);
    mockListingsCollection.toArray.mockResolvedValue([]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.purchases[0].item).toBeNull();
  });

  it('should return empty array when no purchases', async () => {
    getServerSession.mockResolvedValue({
      user: { id: mockUserId.toString() },
    });

    mockTransactionsCollection.toArray.mockResolvedValue([]);
    mockListingsCollection.toArray.mockResolvedValue([]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.purchases).toEqual([]);
  });
});
