/**
 * @jest-environment node
 */

/* eslint-disable @typescript-eslint/no-require-imports */

//
// Unit test for src/app/edit-listing/[id]/actions.js
// Focus: happy path with valid session, no location change, 1 kept image + 1 new image.
//

// --- Mocks --- //

// Mock next-auth session handling
jest.mock('next-auth', () => ({
  getServerSession: jest.fn(),
}));

// Mock authOptions export
jest.mock('@/app/api/auth/[...nextauth]/route', () => ({
  authOptions: {},
}));

// Mock MongoDB client used in actions
jest.mock('@/lib/mongodb', () => ({
  getDb: jest.fn(),
}));

// Mock AWS S3 helpers
jest.mock('@/lib/awss3.js', () => ({
  uploadImageToS3: jest.fn().mockResolvedValue({
    imageUrl: 'https://cdn.tinythreads.test/new-image.jpg',
  }),
  deleteImageFromS3: jest.fn().mockResolvedValue(undefined),
}));

// Mock mongodb's ObjectId to avoid pulling in real driver
jest.mock('mongodb', () => ({
  ObjectId: function ObjectId(id) {
    this.id = id;
  },
}));

// Stub next/cache + next/navigation in case they’re imported indirectly later
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

// Helper: fake FormData-like object with get / getAll
function createFakeFormData(entries) {
  return {
    get(name) {
      return Object.prototype.hasOwnProperty.call(entries, name)
        ? entries[name]
        : null;
    },
    getAll(name) {
      const value = entries[name];
      if (!value) return [];
      return Array.isArray(value) ? value : [value];
    },
  };
}

describe('updateListingAction (happy path)', () => {
  let updateListingAction;
  const mockCollection = {
    findOne: jest.fn(),
    updateOne: jest.fn(),
  };
  const mockDb = {
    collection: jest.fn(() => mockCollection),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Wire up DB mock
    const { getDb } = require('@/lib/mongodb');
    getDb.mockResolvedValue(mockDb);

    // Wire up session mock
    const { getServerSession } = require('next-auth');
    getServerSession.mockResolvedValue({
      user: { id: 'seller-123' },
    });

    // Dynamically import the action AFTER mocks are ready
    ({ updateListingAction } = require('@/app/edit-listing/[id]/actions'));
  });

  test('updates listing successfully with existing image + one new image, no location change', async () => {
    // Existing listing in DB
    mockCollection.findOne.mockResolvedValue({
      _id: 'item-123',
      title: 'Old Title',
      category: 'clothing',
      condition: 'good',
      price: 5,
      size: '6M',
      ageRange: '0-6M',
      location: 'San Francisco',
      description: 'Old description',
      imageUrls: ['https://cdn.tinythreads.test/old-image.jpg'],
      sellerId: 'seller-123',
      geoLocation: {
        type: 'Point',
        coordinates: [-122.4194, 37.7749],
      },
    });

    mockCollection.updateOne.mockResolvedValue({ acknowledged: true });

    // Fake file that passes the size/type/arrayBuffer checks
    const fakeFile = {
      name: 'baby.jpg',
      type: 'image/jpeg',
      size: 2345,
      arrayBuffer: async () => new ArrayBuffer(8),
    };

    const formData = createFakeFormData({
      id: 'item-123',
      title: 'Updated Title',
      category: 'clothing',
      condition: 'like-new',
      price: '10.50',
      size: '6M',
      ageRange: '0-6M',
      location: 'San Francisco', // same as existing → locationChanged = false
      description: 'Updated description',
      donation: 'false',
      existingImageUrls: ['https://cdn.tinythreads.test/old-image.jpg'],
      image: [fakeFile],
    });

    const result = await updateListingAction(formData);

    // Basic success check
    expect(result).toBeTruthy();
    expect(result.success).toBe(true);

    // DB interactions
    expect(mockDb.collection).toHaveBeenCalledWith('Listings');
    expect(mockCollection.findOne).toHaveBeenCalledTimes(1);
    expect(mockCollection.updateOne).toHaveBeenCalledTimes(1);

    const [filterArg, updateArg] = mockCollection.updateOne.mock.calls[0];

    // Filter should target the same id
    expect(filterArg).toEqual({ _id: expect.any(Object) });

    // $set document should contain updated fields
    expect(updateArg.$set.title).toBe('Updated Title');
    expect(updateArg.$set.category).toBe('clothing');
    expect(updateArg.$set.condition).toBe('like-new');
    expect(updateArg.$set.price).toBe(10.5);
    expect(updateArg.$set.size).toBe('6M');
    expect(updateArg.$set.ageRange).toBe('0-6M');
    expect(updateArg.$set.location).toBe('San Francisco');
    expect(updateArg.$set.description).toBe('Updated description');

    // Image URLs = 1 old + 1 new
    expect(Array.isArray(updateArg.$set.imageUrls)).toBe(true);
    expect(updateArg.$set.imageUrls).toContain(
      'https://cdn.tinythreads.test/old-image.jpg',
    );
    expect(updateArg.$set.imageUrls).toContain(
      'https://cdn.tinythreads.test/new-image.jpg',
    );
    expect(updateArg.$set.imageUrls).toHaveLength(2);

    // geoLocation should be preserved (no new lat/lng provided)
    expect(updateArg.$set.geoLocation).toEqual({
      type: 'Point',
      coordinates: [-122.4194, 37.7749],
    });

    // S3 helpers
    const { uploadImageToS3, deleteImageFromS3 } = require('@/lib/awss3.js');
    expect(uploadImageToS3).toHaveBeenCalledTimes(1);
    expect(deleteImageFromS3).not.toHaveBeenCalled();
  });
});
