// src/lib/__tests__/awss3.test.js
import { jest } from "@jest/globals";

// Mock AWS SDK before importing awss3
const mockSend = jest.fn();
const mockS3Client = jest.fn(() => ({
  send: mockSend,
}));
const mockPutObjectCommand = jest.fn();

jest.mock("@aws-sdk/client-s3", () => ({
  S3Client: mockS3Client,
  PutObjectCommand: mockPutObjectCommand,
}));

// Mock crypto.randomUUID
const mockRandomUUID = jest.fn();
jest.mock("crypto", () => ({
  randomUUID: mockRandomUUID,
}));

// Mock environment variables
const originalEnv = process.env;

describe("awss3", () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Set up default environment variables
    process.env = {
      ...originalEnv,
      AWS_REGION: "us-east-1",
      AWS_ACCESS_KEY_ID: "test-access-key",
      AWS_SECRET_ACCESS_KEY: "test-secret-key",
      S3_BUCKET_NAME: "test-bucket",
      S3_PUBLIC_BASE: "https://test-bucket.s3.amazonaws.com",
    };

    // Reset modules to pick up new env vars
    jest.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  // ===== ENVIRONMENT VALIDATION TESTS =====
  describe("environment validation", () => {
    test("throws error when AWS_REGION is missing", async () => {
      delete process.env.AWS_REGION;

      await expect(async () => {
        await import("../awss3.js");
      }).rejects.toThrow(
        "Missing AWS credentials or region in environment variables"
      );
    });

    test("throws error when AWS_ACCESS_KEY_ID is missing", async () => {
      delete process.env.AWS_ACCESS_KEY_ID;

      await expect(async () => {
        await import("../awss3.js");
      }).rejects.toThrow(
        "Missing AWS credentials or region in environment variables"
      );
    });

    test("throws error when AWS_SECRET_ACCESS_KEY is missing", async () => {
      delete process.env.AWS_SECRET_ACCESS_KEY;

      await expect(async () => {
        await import("../awss3.js");
      }).rejects.toThrow(
        "Missing AWS credentials or region in environment variables"
      );
    });

    test("throws error when S3_BUCKET_NAME is missing", async () => {
      delete process.env.S3_BUCKET_NAME;

      await expect(async () => {
        await import("../awss3.js");
      }).rejects.toThrow("Missing S3_BUCKET_NAME in environment variables");
    });

    test("initializes S3Client with correct configuration when all env vars present", async () => {
      // Import with valid environment
      await import("../awss3.js");

      expect(mockS3Client).toHaveBeenCalledWith({
        region: "us-east-1",
        credentials: {
          accessKeyId: "test-access-key",
          secretAccessKey: "test-secret-key",
        },
      });
    });
  });

  // ===== GET PUBLIC URL TESTS =====
  describe("getPublicUrl", () => {
    let getPublicUrl;

    beforeEach(async () => {
      const awsModule = await import("../awss3.js");
      getPublicUrl = awsModule.getPublicUrl;
    });

    test("generates correct public URL with custom S3_PUBLIC_BASE", () => {
      const key = "items/item-123.jpg";
      const result = getPublicUrl(key);

      expect(result).toBe(
        "https://test-bucket.s3.amazonaws.com/items/item-123.jpg"
      );
    });

    test("handles keys with special characters", () => {
      const key = "items/item with spaces & symbols!.jpg";
      const result = getPublicUrl(key);

      expect(result).toBe(
        "https://test-bucket.s3.amazonaws.com/items/item with spaces & symbols!.jpg"
      );
    });

    test("handles empty key", () => {
      const result = getPublicUrl("");

      expect(result).toBe("https://test-bucket.s3.amazonaws.com/");
    });
  });

  // ===== UPLOAD IMAGE TO S3 TESTS =====
  describe("uploadImageToS3", () => {
    let uploadImageToS3;
    const mockFile = {
      name: "test-image.jpg",
      type: "image/jpeg",
      arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(1024)),
    };

    beforeEach(async () => {
      // Set up mocks
      mockRandomUUID.mockReturnValue("12345678-1234-5678-9012-123456789abc");
      mockSend.mockResolvedValue({});

      const awsModule = await import("../awss3.js");
      uploadImageToS3 = awsModule.uploadImageToS3;
    });

    // ===== SUCCESSFUL UPLOAD TESTS =====
    test("uploads image successfully with default options", async () => {
      const result = await uploadImageToS3(mockFile);

      expect(mockPutObjectCommand).toHaveBeenCalledWith({
        Bucket: "test-bucket",
        Key: "items/item-12345678-1234-5678-9012-123456789abc.jpg",
        Body: expect.any(Buffer),
        ContentType: "image/jpeg",
        CacheControl: "public, max-age=31536000, immutable",
      });

      expect(mockSend).toHaveBeenCalledTimes(1);

      expect(result).toEqual({
        key: "items/item-12345678-1234-5678-9012-123456789abc.jpg",
        imageUrl:
          "https://test-bucket.s3.amazonaws.com/items/item-12345678-1234-5678-9012-123456789abc.jpg",
      });
    });

    test("uploads image with custom folder and prefix", async () => {
      const result = await uploadImageToS3(mockFile, {
        folder: "profile",
        filenamePrefix: "avatar",
      });

      expect(mockPutObjectCommand).toHaveBeenCalledWith(
        expect.objectContaining({
          Key: "profile/avatar-12345678-1234-5678-9012-123456789abc.jpg",
        })
      );

      expect(result.key).toBe(
        "profile/avatar-12345678-1234-5678-9012-123456789abc.jpg"
      );
    });

    test("handles different image types", async () => {
      const pngFile = {
        ...mockFile,
        name: "test-image.png",
        type: "image/png",
      };

      await uploadImageToS3(pngFile);

      expect(mockPutObjectCommand).toHaveBeenCalledWith(
        expect.objectContaining({
          Key: "items/item-12345678-1234-5678-9012-123456789abc.png",
          ContentType: "image/png",
        })
      );
    });

    test("handles file without extension", async () => {
      const noExtFile = {
        ...mockFile,
        name: "testimage",
      };

      await uploadImageToS3(noExtFile);

      expect(mockPutObjectCommand).toHaveBeenCalledWith(
        expect.objectContaining({
          Key: "items/item-12345678-1234-5678-9012-123456789abc.jpg", // defaults to jpg
        })
      );
    });

    test("handles file without name", async () => {
      const noNameFile = {
        ...mockFile,
        name: undefined,
      };

      await uploadImageToS3(noNameFile);

      expect(mockPutObjectCommand).toHaveBeenCalledWith(
        expect.objectContaining({
          Key: "items/item-12345678-1234-5678-9012-123456789abc.jpg", // defaults to upload.jpg -> jpg
        })
      );
    });

    test("converts file extension to lowercase", async () => {
      const upperCaseFile = {
        ...mockFile,
        name: "test-image.JPEG",
      };

      await uploadImageToS3(upperCaseFile);

      expect(mockPutObjectCommand).toHaveBeenCalledWith(
        expect.objectContaining({
          Key: "items/item-12345678-1234-5678-9012-123456789abc.jpeg",
        })
      );
    });

    test("handles file without ContentType", async () => {
      const noTypeFile = {
        ...mockFile,
        type: undefined,
      };

      await expect(uploadImageToS3(noTypeFile)).rejects.toThrow(
        "Only image uploads are allowed"
      );
    });

    test("converts ArrayBuffer to Buffer correctly", async () => {
      const testData = new ArrayBuffer(8);
      const view = new Uint8Array(testData);
      view[0] = 0xff;
      view[7] = 0xaa;

      mockFile.arrayBuffer.mockResolvedValueOnce(testData);

      await uploadImageToS3(mockFile);

      const putCall = mockPutObjectCommand.mock.calls[0][0];
      expect(putCall.Body).toBeInstanceOf(Buffer);
      expect(putCall.Body[0]).toBe(0xff);
      expect(putCall.Body[7]).toBe(0xaa);
    });

    // ===== FILE VALIDATION TESTS =====
    test("throws error when file is null", async () => {
      await expect(uploadImageToS3(null)).rejects.toThrow(
        "uploadImageToS3: file is required"
      );

      expect(mockSend).not.toHaveBeenCalled();
    });

    test("throws error when file is undefined", async () => {
      await expect(uploadImageToS3(undefined)).rejects.toThrow(
        "uploadImageToS3: file is required"
      );

      expect(mockSend).not.toHaveBeenCalled();
    });

    test("throws error when file is string", async () => {
      await expect(uploadImageToS3("not-a-file")).rejects.toThrow(
        "uploadImageToS3: file is required"
      );

      expect(mockSend).not.toHaveBeenCalled();
    });

    test("throws error when file is not an image", async () => {
      const textFile = {
        ...mockFile,
        type: "text/plain",
      };

      await expect(uploadImageToS3(textFile)).rejects.toThrow(
        "Only image uploads are allowed"
      );

      expect(mockSend).not.toHaveBeenCalled();
    });

    test("throws error when file type is undefined", async () => {
      const noTypeFile = {
        ...mockFile,
        type: undefined,
      };

      // This should pass the type check since type?.startsWith?.() will be false for undefined
      // Wait, let me check the actual logic...
      // if (!file.type?.startsWith?.("image/")) means if type is undefined, startsWith is undefined,
      // so undefined?.() is undefined, !undefined is true, so it throws error
      await expect(uploadImageToS3(noTypeFile)).rejects.toThrow(
        "Only image uploads are allowed"
      );
    });

    test("accepts valid image mime types", async () => {
      const imageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

      for (const type of imageTypes) {
        const testFile = { ...mockFile, type };
        await expect(uploadImageToS3(testFile)).resolves.toBeDefined();
      }

      expect(mockSend).toHaveBeenCalledTimes(imageTypes.length);
    });

    // ===== ERROR HANDLING TESTS =====
    test("handles S3 upload failure", async () => {
      const s3Error = new Error("S3 upload failed");
      mockSend.mockRejectedValueOnce(s3Error);

      await expect(uploadImageToS3(mockFile)).rejects.toThrow(
        "S3 upload failed"
      );

      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    test("handles arrayBuffer conversion failure", async () => {
      const fileWithBadArrayBuffer = {
        ...mockFile,
        arrayBuffer: jest
          .fn()
          .mockRejectedValue(new Error("ArrayBuffer failed")),
      };

      await expect(uploadImageToS3(fileWithBadArrayBuffer)).rejects.toThrow(
        "ArrayBuffer failed"
      );

      expect(mockSend).not.toHaveBeenCalled();
    });

    test("handles AWS SDK configuration errors", async () => {
      const configError = new Error("Invalid AWS configuration");
      mockS3Client.mockImplementationOnce(() => {
        throw configError;
      });

      // Need to re-import to trigger the error
      jest.resetModules();

      await expect(async () => {
        await import("../awss3.js");
      }).rejects.toThrow("Invalid AWS configuration");
    });

    // ===== EDGE CASES =====
    test("handles very large UUID", async () => {
      mockRandomUUID.mockReturnValue("a".repeat(100)); // Very long UUID

      const result = await uploadImageToS3(mockFile);

      expect(result.key).toBe(`items/item-${"a".repeat(100)}.jpg`);
    });

    test("handles file with multiple dots in name", async () => {
      const complexFile = {
        ...mockFile,
        name: "test.file.with.many.dots.jpeg",
      };

      await uploadImageToS3(complexFile);

      expect(mockPutObjectCommand).toHaveBeenCalledWith(
        expect.objectContaining({
          Key: "items/item-12345678-1234-5678-9012-123456789abc.jpeg",
        })
      );
    });

    test("handles empty string filename", async () => {
      const emptyNameFile = {
        ...mockFile,
        name: "",
      };

      await uploadImageToS3(emptyNameFile);

      // Should default to 'upload.jpg'
      expect(mockPutObjectCommand).toHaveBeenCalledWith(
        expect.objectContaining({
          Key: "items/item-12345678-1234-5678-9012-123456789abc.jpg",
        })
      );
    });
  });

  // ===== DEFAULT EXPORT TEST =====
  describe("default export", () => {
    test("exports S3Client instance", async () => {
      const awsModule = await import("../awss3.js");

      expect(awsModule.default).toBeDefined();
      // The default export should be the result of new S3Client()
      expect(mockS3Client).toHaveBeenCalled();
    });
  });
});
