/**
 * @jest-environment node
 */

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));
jest.mock('@/lib/mongodb', () => ({
  getDb: jest.fn(),
}));
jest.mock('@/app/api/auth/[...nextauth]/route', () => ({
  authOptions: {},
}));

const stripeCreateMock = jest.fn();
const stripeRetrieveMock = jest.fn();
const StripeMock = jest.fn(() => ({
  identity: {
    verificationSessions: {
      create: stripeCreateMock,
      retrieve: stripeRetrieveMock,
    },
  },
}));

jest.mock('stripe', () => ({
  __esModule: true,
  default: StripeMock,
}));

import { POST as createVerification } from '@/app/api/stripe/create-verification/route';
import {
  GET as statusGET,
  PUT as statusPUT,
} from '@/app/api/stripe/verification-status/route';
import { POST as syncPOST } from '@/app/api/stripe/sync-verification/route';
import { getServerSession } from 'next-auth';
import { getDb } from '@/lib/mongodb';

const userId = '507f1f77bcf86cd799439011';

describe('Stripe verification routes', () => {
  let mockCollection;
  let mockDb;

  beforeEach(() => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
    stripeCreateMock.mockReset();
    stripeRetrieveMock.mockReset();
    StripeMock.mockClear();

    mockCollection = {
      findOne: jest.fn(),
      updateOne: jest.fn(),
    };

    mockDb = {
      collection: jest.fn(() => mockCollection),
    };

    getDb.mockResolvedValue(mockDb);
    getServerSession.mockResolvedValue({
      user: {
        id: userId,
        name: 'Test User',
        email: 'test@example.com',
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.STRIPE_SECRET_KEY;
  });

  test('create-verification returns hosted URL and stores session id', async () => {
    mockCollection.findOne.mockResolvedValue({
      _id: userId,
      isVerified: false,
      name: 'Test User',
      email: 'test@example.com',
    });
    stripeCreateMock.mockResolvedValue({
      id: 'vs_123',
      url: 'https://verify.test/session',
    });
    mockCollection.updateOne.mockResolvedValue({ modifiedCount: 1 });

    const req = new Request('http://localhost/api/stripe/create-verification', {
      method: 'POST',
      headers: { origin: 'https://tinythreads.test' },
    });

    const res = await createVerification(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.verificationUrl).toBe('https://verify.test/session');
    expect(mockCollection.updateOne).toHaveBeenCalledWith(
      { _id: expect.any(Object) },
      expect.objectContaining({
        $set: expect.objectContaining({ verificationSessionId: 'vs_123' }),
      }),
    );
    expect(stripeCreateMock).toHaveBeenCalled();
  });

  test('verification-status GET returns verification flags', async () => {
    mockCollection.findOne.mockResolvedValue({
      _id: userId,
      isVerified: true,
      verificationSessionId: 'vs_abc',
      verifiedAt: new Date('2025-01-01'),
    });

    const res = await statusGET();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.isVerified).toBe(true);
    expect(data.verificationSessionId).toBe('vs_abc');
  });

  test('sync-verification marks user verified when Stripe session is verified', async () => {
    mockCollection.findOne.mockResolvedValue({
      _id: userId,
      isVerified: false,
      verificationSessionId: 'vs_123',
    });
    stripeRetrieveMock.mockResolvedValue({ status: 'verified' });
    mockCollection.updateOne.mockResolvedValue({ matchedCount: 1 });

    const res = await syncPOST();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.isVerified).toBe(true);
    expect(stripeRetrieveMock).toHaveBeenCalledWith('vs_123');
    expect(mockCollection.updateOne).toHaveBeenCalledWith(
      { _id: expect.any(Object) },
      expect.objectContaining({
        $set: expect.objectContaining({ isVerified: true }),
      }),
    );
  });

  test('verification-status PUT sets user verified', async () => {
    mockCollection.updateOne.mockResolvedValue({ matchedCount: 1 });

    const res = await statusPUT();
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.isVerified).toBe(true);
  });
});
