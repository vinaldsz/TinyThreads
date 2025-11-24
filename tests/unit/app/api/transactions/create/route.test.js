/**
 * @jest-environment node
 */

// ✅ Mock all dependencies BEFORE imports
jest.mock('@/lib/mongodb', () => ({
  getDb: jest.fn(),
}));

jest.mock('next-auth', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    GET: jest.fn(),
    POST: jest.fn(),
  })),
}));

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(),
}));

// ✅ Mock the entire auth route to prevent NextAuth initialization
jest.mock('@/app/api/auth/[...nextauth]/route', () => ({
  authOptions: {
    providers: [],
    session: { strategy: 'jwt' },
  },
}));

// Now safe to import
import { POST } from '@/app/api/transactions/create/route';
import { getServerSession } from 'next-auth/next';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

describe('POST /api/transactions/create', () => {
  let mockDb;
  let mockCollection;
  let mockSession;
  let mockMongoSession;

  beforeEach(() => {
    mockMongoSession = {
      withTransaction: jest.fn((callback) => callback()),
      endSession: jest.fn(),
    };

    mockCollection = {
      findOneAndUpdate: jest.fn(),
      insertOne: jest.fn(),
    };

    mockDb = {
      collection: jest.fn(() => mockCollection),
      client: {
        startSession: jest.fn(() => mockMongoSession),
      },
    };

    mockSession = {
      user: {
        id: '691ffb620d244f8994b3d021',
        name: 'Test User',
        email: 'test@example.com',
      },
    };

    getDb.mockResolvedValue(mockDb);
    getServerSession.mockResolvedValue(mockSession);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a transaction successfully', async () => {
    mockCollection.findOneAndUpdate.mockResolvedValue({
      value: {
        _id: new ObjectId('68fbe7e1ce0dbad3aab9a0bf'),
        title: 'Test Item',
        price: 20,
        sellerId: new ObjectId('691ffb620d244f8994b3d021'),
        sellerName: 'Seller Name',
        status: 'sold',
      },
    });

    mockCollection.insertOne.mockResolvedValue({
      insertedId: new ObjectId(),
    });

    const request = {
      json: jest.fn().mockResolvedValue({
        itemId: '68fbe7e1ce0dbad3aab9a0bf',
      }),
    };

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(mockCollection.findOneAndUpdate).toHaveBeenCalled();
    expect(mockCollection.insertOne).toHaveBeenCalled();
  });

  it('should return 401 if user is not authenticated', async () => {
    getServerSession.mockResolvedValue(null);

    const request = {
      json: jest.fn().mockResolvedValue({
        itemId: '68fbe7e1ce0dbad3aab9a0bf',
      }),
    };

    const response = await POST(request);
    expect(response.status).toBe(401);
  });

  it('should return 409 if item is already sold', async () => {
    mockCollection.findOneAndUpdate.mockResolvedValue({
      value: null,
    });

    const request = {
      json: jest.fn().mockResolvedValue({
        itemId: '68fbe7e1ce0dbad3aab9a0bf',
      }),
    };

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toBeDefined();
  });

  it('should handle database errors', async () => {
    mockCollection.findOneAndUpdate.mockRejectedValue(
      new Error('Database error'),
    );

    const request = {
      json: jest.fn().mockResolvedValue({
        itemId: '68fbe7e1ce0dbad3aab9a0bf',
      }),
    };

    const response = await POST(request);
    expect(response.status).toBe(500);
  });

  it('should include buyerUsername and sellerId in transaction', async () => {
    let insertedTransaction;

    mockCollection.findOneAndUpdate.mockResolvedValue({
      value: {
        _id: new ObjectId(),
        title: 'Test',
        price: 20,
        sellerId: new ObjectId(),
        status: 'sold',
      },
    });

    mockCollection.insertOne.mockImplementation((data) => {
      insertedTransaction = data;
      return Promise.resolve({ insertedId: new ObjectId() });
    });

    const request = {
      json: jest.fn().mockResolvedValue({
        itemId: '68fbe7e1ce0dbad3aab9a0bf',
      }),
    };

    await POST(request);

    expect(insertedTransaction.buyerUsername).toBeDefined();
    expect(insertedTransaction.sellerId).toBeDefined();
    expect(insertedTransaction.buyerId).toBeDefined();
  });
});
