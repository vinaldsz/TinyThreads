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
jest.mock('@/lib/awss3.js', () => ({ uploadImageToS3: jest.fn() }));

const { getServerSession } = require('next-auth');
const { getDb } = require('@/lib/mongodb');
const { uploadImageToS3 } = require('@/lib/awss3.js');

const uploadRoute = require('@/app/api/uploads/avatar/upload/route');

describe('/api/uploads/avatar/upload route', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 401 when not authenticated', async () => {
    getServerSession.mockResolvedValueOnce({});
    const req = { formData: async () => new Map() };
    const res = await uploadRoute.POST(req);
    expect(res.status).toBe(401);
  });

  it('returns 400 when no file provided', async () => {
    getServerSession.mockResolvedValueOnce({ user: { email: 'a@b.com' } });
    const req = { formData: async () => ({ get: () => null }) };
    const res = await uploadRoute.POST(req);
    expect(res.status).toBe(400);
  });

  it('uploads file and updates user', async () => {
    getServerSession.mockResolvedValueOnce({ user: { email: 'a@b.com' } });
    const file = { name: 'f.png' };
    uploadImageToS3.mockResolvedValueOnce({
      key: 'avatar/k',
      imageUrl: 'https://cdn/avatar.png',
    });

    const fakeCollection = {
      findOneAndUpdate: jest
        .fn()
        .mockResolvedValue({ value: { _id: '1', email: 'a@b.com' } }),
    };
    getDb.mockResolvedValueOnce({ collection: () => fakeCollection });

    const req = { formData: async () => ({ get: () => file }) };
    const res = await uploadRoute.POST(req);
    expect(res.status).toBe(200);
    expect(res.body.publicUrl).toBe('https://cdn/avatar.png');
    expect(res.body.key).toBe('avatar/k');
  });

  it('returns 404 when user not found after upload', async () => {
    getServerSession.mockResolvedValueOnce({ user: { email: 'a@b.com' } });
    const file = { name: 'f.png' };
    uploadImageToS3.mockResolvedValueOnce({
      key: 'avatar/k',
      imageUrl: 'https://cdn/avatar.png',
    });

    const fakeCollection = {
      findOneAndUpdate: jest.fn().mockResolvedValue({ value: null }),
    };
    getDb.mockResolvedValueOnce({ collection: () => fakeCollection });

    const req = { formData: async () => ({ get: () => file }) };
    const res = await uploadRoute.POST(req);
    expect(res.status).toBe(404);
  });

  it('returns 500 on internal error', async () => {
    getServerSession.mockImplementationOnce(() => {
      throw new Error('boom');
    });
    const req = { formData: async () => ({ get: () => null }) };
    const res = await uploadRoute.POST(req);
    expect(res.status).toBe(500);
  });
});
