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

jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-id' }),
  }),
}));

import { POST } from '@/app/api/reports/route';
import { getDb } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { ObjectId } from 'mongodb';

describe('POST /api/reports', () => {
  let mockDb;
  let mockReportsCollection;

  const mockItemId = new ObjectId();
  const mockSellerId = new ObjectId();
  const mockReporterId = new ObjectId();

  beforeEach(() => {
    mockReportsCollection = {
      insertOne: jest.fn().mockResolvedValue({
        insertedId: new ObjectId(),
      }),
    };

    mockDb = {
      collection: jest.fn((name) => {
        if (name === 'reports') return mockReportsCollection;
        return null;
      }),
    };

    getDb.mockResolvedValue(mockDb);

    // Suppress console.error for cleaner test output
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    console.error.mockRestore();
  });

  it('should return 401 if user is not authenticated', async () => {
    getServerSession.mockResolvedValue(null);

    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        itemId: mockItemId.toString(),
        sellerId: mockSellerId.toString(),
        reason: 'spam',
      }),
    };

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('You must be logged in to submit a report');
  });

  it('should return 400 if required fields are missing', async () => {
    getServerSession.mockResolvedValue({
      user: { id: mockReporterId.toString(), email: 'reporter@example.com' },
    });

    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        itemId: mockItemId.toString(),
        // Missing sellerId and reason
      }),
    };

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Missing required fields');
  });

  it('should create a report successfully', async () => {
    getServerSession.mockResolvedValue({
      user: {
        id: mockReporterId.toString(),
        name: 'Reporter User',
        email: 'reporter@example.com',
      },
    });

    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        itemId: mockItemId.toString(),
        itemTitle: 'Test Item',
        sellerId: mockSellerId.toString(),
        sellerName: 'Seller User',
        sellerEmail: 'seller@example.com',
        reporterId: mockReporterId.toString(),
        reporterName: 'Reporter User',
        reporterEmail: 'reporter@example.com',
        reason: 'inappropriate',
        details: 'This item violates terms',
      }),
    };

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Report submitted successfully');
    expect(data.reportId).toBeDefined();
    expect(mockReportsCollection.insertOne).toHaveBeenCalled();
  });

  it('should handle report without optional fields', async () => {
    getServerSession.mockResolvedValue({
      user: {
        id: mockReporterId.toString(),
        email: 'reporter@example.com',
      },
    });

    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        itemId: mockItemId.toString(),
        sellerId: mockSellerId.toString(),
        reason: 'spam',
      }),
    };

    const response = await POST(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);

    const reportArg = mockReportsCollection.insertOne.mock.calls[0][0];
    expect(reportArg.itemTitle).toBe('Unknown');
    expect(reportArg.details).toBe('');
    expect(reportArg.status).toBe('pending');
  });

  it('should handle valid ObjectId strings', async () => {
    getServerSession.mockResolvedValue({
      user: { id: mockReporterId.toString(), email: 'test@example.com' },
    });

    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        itemId: mockItemId.toString(),
        sellerId: mockSellerId.toString(),
        reporterId: mockReporterId.toString(),
        reason: 'other',
      }),
    };

    const response = await POST(mockRequest);

    expect(response.status).toBe(201);
    const reportArg = mockReportsCollection.insertOne.mock.calls[0][0];
    expect(reportArg.itemId).toBeInstanceOf(ObjectId);
    expect(reportArg.sellerId).toBeInstanceOf(ObjectId);
  });

  it('should use session user data when reporter info not provided', async () => {
    getServerSession.mockResolvedValue({
      user: {
        id: mockReporterId.toString(),
        name: 'Session User',
        email: 'session@example.com',
      },
    });

    const mockRequest = {
      json: jest.fn().mockResolvedValue({
        itemId: mockItemId.toString(),
        sellerId: mockSellerId.toString(),
        reason: 'spam',
        // No reporter info provided
      }),
    };

    const response = await POST(mockRequest);

    expect(response.status).toBe(201);
    const reportArg = mockReportsCollection.insertOne.mock.calls[0][0];
    expect(reportArg.reporterName).toBe('Session User');
    expect(reportArg.reporterEmail).toBe('session@example.com');
  });
});
