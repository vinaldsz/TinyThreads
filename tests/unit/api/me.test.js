/**
 * @jest-environment node
 */
/* eslint-disable @typescript-eslint/no-require-imports */
jest.mock('next/server', () => ({
  NextResponse: {
    json: (body, opts) => ({ body, status: opts?.status || 200 }),
  },
}));

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }));
jest.mock('@/app/api/auth/[...nextauth]/route', () => ({ authOptions: {} }));
jest.mock('@/lib/mongodb', () => ({
  getDb: jest.fn(),
}));

const { getServerSession } = require('next-auth');
const { getDb } = require('@/lib/mongodb');

const meRoute = require('@/app/api/me/route');

describe('/api/me route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null user when not authenticated (GET)', async () => {
    getServerSession.mockResolvedValueOnce({});
    const res = await meRoute.GET();
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ user: null });
  });

  it('returns user when authenticated (GET)', async () => {
    getServerSession.mockResolvedValueOnce({ user: { email: 'a@b.com' } });
    const fakeUser = {
      _id: '123',
      email: 'a@b.com',
      displayName: 'Zoe',
      passwordHash: 'x',
    };
    getDb.mockResolvedValueOnce({
      collection: () => ({ findOne: () => fakeUser }),
    });

    const res = await meRoute.GET();
    expect(res.status).toBe(200);
    expect(res.body.user.displayName).toBe('Zoe');
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it('returns 401 for PATCH when not authenticated', async () => {
    getServerSession.mockResolvedValueOnce({});
    const req = { json: async () => ({ displayName: 'X' }) };
    const res = await meRoute.PATCH(req);
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/Not authenticated/i);
  });

  it('updates user on PATCH and returns updated user', async () => {
    getServerSession.mockResolvedValueOnce({ user: { email: 'u@e.com' } });
    const updated = { _id: 'u1', email: 'u@e.com', displayName: 'New' };
    const fakeCollection = {
      findOneAndUpdate: jest.fn().mockResolvedValue({ value: updated }),
    };
    getDb.mockResolvedValueOnce({ collection: () => fakeCollection });

    const req = { json: async () => ({ displayName: 'New' }) };
    const res = await meRoute.PATCH(req);
    expect(res.status).toBe(200);
    expect(res.body.user.displayName).toBe('New');
  });

  it('returns 404 when PATCH cannot find user', async () => {
    getServerSession.mockResolvedValueOnce({ user: { email: 'u@e.com' } });
    const fakeCollection = {
      findOneAndUpdate: jest.fn().mockResolvedValue({ value: null }),
    };
    getDb.mockResolvedValueOnce({ collection: () => fakeCollection });

    const req = { json: async () => ({ displayName: 'Nope' }) };
    const res = await meRoute.PATCH(req);
    expect(res.status).toBe(404);
  });

  it('returns 500 on internal error', async () => {
    getServerSession.mockImplementationOnce(() => {
      throw new Error('boom');
    });
    const res = await meRoute.GET();
    expect(res.status).toBe(500);
  });
});
