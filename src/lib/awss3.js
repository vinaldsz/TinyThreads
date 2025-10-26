import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

const { AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, S3_PUBLIC_BASE, S3_BUCKET_NAME } = process.env;

if (!AWS_REGION || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
  throw new Error("Missing AWS credentials or region in environment variables");
}
if (!S3_BUCKET_NAME) {
  throw new Error("Missing S3_BUCKET_NAME in environment variables");
}

const s3 = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

const PUBLIC_BASE = S3_PUBLIC_BASE || "https://tinythreads-s3-bucket.s3.us-east-1.amazonaws.com";

export function getPublicUrl(key) {
  return `${PUBLIC_BASE}/${key}`;
}

export async function uploadImageToS3(file, { folder = "items", filenamePrefix = "item" } = {}) {
  if (!file || typeof file === "string") {
    throw new Error("uploadImageToS3: file is required");
  }

  if (!file.type?.startsWith?.("image/")) {
    throw new Error("Only image uploads are allowed");
  }

  const originalName = file.name || "upload.jpg";
  const ext = (originalName.includes(".") ? originalName.split(".").pop() : "jpg").toLowerCase();
  const key = `${folder}/${filenamePrefix}-${randomUUID()}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const putCmd = new PutObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: file.type || "application/octet-stream",
    CacheControl: "public, max-age=31536000, immutable",
    // ACL: "public-read", // uncomment if your bucket uses ACLs for public access
  });
  await s3.send(putCmd);

  return { key, imageUrl: getPublicUrl(key) };
}

export default s3;
