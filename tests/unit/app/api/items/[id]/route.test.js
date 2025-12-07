/**
 * @jest-environment node
 */

jest.mock('@/lib/mongodb', () => ({
  getDb: jest.fn(),
}));

import { GET } from '@/app/api/items/[id]/route';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

describe.skip('GET /api/items/:id', () => {
  let mockDb;
  let mockCollection;

  const mockItem = {
    _id: new ObjectId('68fbe7e1ce0dbad3aab9a0bf'),
    title: 'Baby Onesie',
    price: 15.99,
    category: 'clothing',
    condition: 'new',
  };

  beforeEach(() => {
    mockCollection = {
      findOne: jest.fn(),
    };

    mockDb = {
      collection: jest.fn(() => mockCollection),
    };

    getDb.mockResolvedValue(mockDb);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return item by ID', async () => {
    mockCollection.findOne.mockResolvedValue(mockItem);

    const ctx = {
      params: Promise.resolve({ id: '68fbe7e1ce0dbad3aab9a0bf' }),
    };

    const response = await GET(null, ctx);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.item.title).toBe('Baby Onesie');
    expect(data.item._id).toBe('68fbe7e1ce0dbad3aab9a0bf');
  });

  it('should return 404 if item not found', async () => {
    mockCollection.findOne.mockResolvedValue(null);

    const ctx = {
      params: Promise.resolve({ id: '68fbe7e1ce0dbad3aab9a0bf' }),
    };

    const response = await GET(null, ctx);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toBe('Item not found');
  });

  it('should handle database errors', async () => {
    mockCollection.findOne.mockRejectedValue(new Error('Database error'));

    const ctx = {
      params: Promise.resolve({ id: '68fbe7e1ce0dbad3aab9a0bf' }),
    };

    const response = await GET(null, ctx);

    expect(response.status).toBe(500);
  });

  it('should handle invalid ObjectId', async () => {
    mockCollection.findOne.mockResolvedValue(null);

    const ctx = {
      params: Promise.resolve({ id: 'invalid-id' }),
    };

    const response = await GET(null, ctx);
    const data = await response.json();

    expect(mockCollection.findOne).toHaveBeenCalled();
    expect(response.status).toBe(404);
    expect(data.error).toBe('Item not found');
  });
});
