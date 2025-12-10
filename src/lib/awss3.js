import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

const {
  AWS_REGION,
  AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY,
  S3_PUBLIC_BASE,
  S3_BUCKET_NAME,
} = process.env;

if (!AWS_REGION || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
  throw new Error('Missing AWS credentials or region in environment variables');
}
if (!S3_BUCKET_NAME) {
  throw new Error('Missing S3_BUCKET_NAME in environment variables');
}

const s3 = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

const PUBLIC_BASE = S3_PUBLIC_BASE;

export function getPublicUrl(key) {
  return `${PUBLIC_BASE}/${key}`;
}

export async function uploadImageToS3(
  file,
  { folder = 'items', filenamePrefix = 'item' } = {},
) {
  if (!file || typeof file === 'string') {
    throw new Error('uploadImageToS3: file is required');
  }

  if (!file.type?.startsWith?.('image/')) {
    throw new Error('Only image uploads are allowed');
  }

  const originalName = file.name || 'upload.jpg';
  const ext = (
    originalName.includes('.') ? originalName.split('.').pop() : 'jpg'
  ).toLowerCase();
  const key = `${folder}/${filenamePrefix}-${randomUUID()}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const putCmd = new PutObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: file.type || 'application/octet-stream',
    CacheControl: 'public, max-age=31536000, immutable',
    // ACL: "public-read", // uncomment if your bucket uses ACLs for public access
  });
  await s3.send(putCmd);

  return { key, imageUrl: getPublicUrl(key) };
}

export async function getPresignedUploadUrl(
  key,
  contentType,
  { expiresIn = 60 } = {},
) {
  if (!key || !contentType) {
    throw new Error('key and contentType required for presigned url');
  }

  const putCmd = new PutObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000, immutable',
  });

  const signedUrl = await getSignedUrl(s3, putCmd, { expiresIn });
  const publicUrl = getPublicUrl(key);
  return { signedUrl, publicUrl, key };
}

export async function deleteImageFromS3(url) {
  if (!url) return;

  try {
    // Extract S3 key from public URL
    // Example: https://abc.s3.amazonaws.com/items/item-123.jpg → items/item-123.jpg
    const key = url.replace(`${S3_PUBLIC_BASE}/`, '');

    const deleteCmd = new DeleteObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
    });

    await s3.send(deleteCmd);
    console.log('Deleted from S3:', key);
  } catch (err) {
    console.error('❌ Failed to delete from S3:', err);
    throw err;
  }
}

export default s3;
