/**
 * @jest-environment node
 */

// Mock MongoDB
jest.mock('@/lib/mongodb', () => ({
  getDb: jest.fn(),
}));

import { GET } from '@/app/api/items/route';
import { getDb } from '@/lib/mongodb';

describe('GET /api/items', () => {
  let mockDb;
  let mockCollection;

  const mockItems = [
    {
      _id: '123',
      title: 'Baby Onesie',
      price: 15.99,
      category: 'clothing',
      condition: 'new',
      size: '0-3 months',
      ageRange: '0-3 months',
      description: 'Soft cotton onesie',
      createdAt: new Date('2025-11-20'),
    },
    {
      _id: '456',
      title: 'Toy Car',
      price: 25.5,
      category: 'toys',
      condition: 'good',
      size: 'medium',
      ageRange: '1-2 years',
      description: 'Fun toy car',
      createdAt: new Date('2025-11-22'),
    },
  ];

  beforeEach(() => {
    mockCollection = {
      find: jest.fn(() => ({
        sort: jest.fn(() => ({
          skip: jest.fn(() => ({
            limit: jest.fn(() => ({
              toArray: jest.fn().mockResolvedValue(mockItems),
            })),
          })),
        })),
      })),
      // New pagination behavior uses countDocuments
      countDocuments: jest.fn().mockResolvedValue(mockItems.length),
    };

    mockDb = {
      collection: jest.fn(() => mockCollection),
    };

    getDb.mockResolvedValue(mockDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return all items', async () => {
    const request = new Request('http://localhost:3000/api/items');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.items).toHaveLength(2);
    expect(data.total).toBe(2);
  });

  it('should filter by category', async () => {
    const request = new Request(
      'http://localhost:3000/api/items?category=clothing',
    );
    await GET(request);

    expect(mockCollection.find).toHaveBeenCalledWith(
      expect.objectContaining({
        category: { $regex: '^clothing$', $options: 'i' },
      }),
    );
  });

  it('should filter by condition', async () => {
    const request = new Request(
      'http://localhost:3000/api/items?condition=new',
    );
    await GET(request);

    expect(mockCollection.find).toHaveBeenCalledWith(
      expect.objectContaining({
        condition: { $regex: '^new$', $options: 'i' },
      }),
    );
  });

  it('should filter by size', async () => {
    const request = new Request(
      'http://localhost:3000/api/items?size=0-3%20months',
    );
    await GET(request);

    expect(mockCollection.find).toHaveBeenCalledWith(
      expect.objectContaining({
        size: { $regex: expect.stringContaining('0-3 months'), $options: 'i' },
      }),
    );
  });

  it('should filter by ageRange', async () => {
    const request = new Request(
      'http://localhost:3000/api/items?ageRange=0-3%20months',
    );
    await GET(request);

    expect(mockCollection.find).toHaveBeenCalledWith(
      expect.objectContaining({
        ageRange: {
          $regex: expect.stringContaining('0-3 months'),
          $options: 'i',
        },
      }),
    );
  });

  it('should filter by price range', async () => {
    const request = new Request(
      'http://localhost:3000/api/items?priceMin=10&priceMax=20',
    );
    await GET(request);

    expect(mockCollection.find).toHaveBeenCalledWith(
      expect.objectContaining({
        price: expect.objectContaining({
          $gte: 10,
          $lte: 20,
        }),
      }),
    );
  });

  it('should search by searchTerm', async () => {
    const request = new Request(
      'http://localhost:3000/api/items?searchTerm=onesie',
    );
    await GET(request);

    expect(mockCollection.find).toHaveBeenCalledWith(
      expect.objectContaining({
        $or: expect.arrayContaining([
          expect.objectContaining({ title: expect.any(Object) }),
          expect.objectContaining({ description: expect.any(Object) }),
        ]),
      }),
    );
  });

  it('should sort by newest (default)', async () => {
    const request = new Request('http://localhost:3000/api/items');
    const mockSort = jest.fn(() => ({
      skip: jest.fn(() => ({
        limit: jest.fn(() => ({
          toArray: jest.fn().mockResolvedValue(mockItems),
        })),
      })),
    }));

    mockCollection.find.mockReturnValue({ sort: mockSort });

    await GET(request);

    expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
  });

  it('should sort by oldest', async () => {
    const request = new Request(
      'http://localhost:3000/api/items?sortBy=oldest',
    );
    const mockSort = jest.fn(() => ({
      skip: jest.fn(() => ({
        limit: jest.fn(() => ({
          toArray: jest.fn().mockResolvedValue(mockItems),
        })),
      })),
    }));

    mockCollection.find.mockReturnValue({ sort: mockSort });

    await GET(request);

    expect(mockSort).toHaveBeenCalledWith({ createdAt: 1 });
  });

  it('should sort by price low to high', async () => {
    const request = new Request(
      'http://localhost:3000/api/items?sortBy=price-low',
    );
    const mockSort = jest.fn(() => ({
      skip: jest.fn(() => ({
        limit: jest.fn(() => ({
          toArray: jest.fn().mockResolvedValue(mockItems),
        })),
      })),
    }));

    mockCollection.find.mockReturnValue({ sort: mockSort });

    await GET(request);

    expect(mockSort).toHaveBeenCalledWith({ price: 1 });
  });

  it('should sort by price high to low', async () => {
    const request = new Request(
      'http://localhost:3000/api/items?sortBy=price-high',
    );
    const mockSort = jest.fn(() => ({
      skip: jest.fn(() => ({
        limit: jest.fn(() => ({
          toArray: jest.fn().mockResolvedValue(mockItems),
        })),
      })),
    }));

    mockCollection.find.mockReturnValue({ sort: mockSort });

    await GET(request);

    expect(mockSort).toHaveBeenCalledWith({ price: -1 });
  });

  it('should apply limit parameter', async () => {
    const request = new Request('http://localhost:3000/api/items?limit=10');
    const mockLimit = jest.fn(() => ({
      toArray: jest.fn().mockResolvedValue(mockItems),
    }));

    mockCollection.find.mockReturnValue({
      sort: jest.fn(() => ({ skip: jest.fn(() => ({ limit: mockLimit })) })),
    });

    await GET(request);

    expect(mockLimit).toHaveBeenCalledWith(10);
  });

  it('should use default limit of 48', async () => {
    const request = new Request('http://localhost:3000/api/items');
    const mockLimit = jest.fn(() => ({
      toArray: jest.fn().mockResolvedValue(mockItems),
    }));

    mockCollection.find.mockReturnValue({
      sort: jest.fn(() => ({ skip: jest.fn(() => ({ limit: mockLimit })) })),
    });

    await GET(request);

    expect(mockLimit).toHaveBeenCalledWith(12);
  });

  it('should combine multiple filters', async () => {
    const request = new Request(
      'http://localhost:3000/api/items?category=clothing&condition=new&priceMin=10&priceMax=20',
    );
    await GET(request);

    expect(mockCollection.find).toHaveBeenCalledWith(
      expect.objectContaining({
        category: expect.any(Object),
        condition: expect.any(Object),
        price: expect.objectContaining({
          $gte: 10,
          $lte: 20,
        }),
      }),
    );
  });

  it('should serialize _id to string', async () => {
    const request = new Request('http://localhost:3000/api/items');
    const response = await GET(request);
    const data = await response.json();

    expect(data.items[0]._id).toBe('123');
    expect(data.items[1]._id).toBe('456');
  });
});
