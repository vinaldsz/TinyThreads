// src/lib/__tests__/mongodb.test.js

describe("mongodb helper getDb", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test("getDb returns requested db from mocked MongoClient", async () => {
    // prepare mocks
    const mockDbObj = { ok: true };
    const mockClient = { db: jest.fn((name) => ({ name, ...mockDbObj })) };
    const connectMock = jest.fn(() => Promise.resolve(mockClient));

    // Mock the mongodb module before importing the helper
    jest.doMock("mongodb", () => {
      return {
        MongoClient: function MongoClient() {
          return { connect: connectMock };
        },
      };
    });

    // Ensure env var exists (module requires it)
    process.env.MONGODB_URI =
      process.env.MONGODB_URI || "mongodb://localhost:27017";

    // Import the module under test after mocks are set up
    const { getDb } = await import("../../lib/mongodb.js");

    // Call getDb and assert
    const db = await getDb("custom-db");
    expect(db).toEqual({ name: "custom-db", ...mockDbObj });
    expect(mockClient.db).toHaveBeenCalledWith("custom-db");
  });
});
