import { randomUUID } from 'node:crypto';
import { extFor } from './utils.js';

// Works with AWS S3 and any S3-compatible service (Cloudflare R2, MinIO, DigitalOcean Spaces...)
// via S3_ENDPOINT. Make the bucket (or a CDN in front of it) publicly readable,
// and set S3_PUBLIC_BASE_URL if the public URL differs from the default AWS one.
export async function createS3Storage(cfg) {
  if (!cfg.bucket) throw new Error('STORAGE_DRIVER=s3 needs S3_BUCKET');
  const { S3Client, PutObjectCommand, DeleteObjectCommand } = await import('@aws-sdk/client-s3');
  const client = new S3Client({
    region: cfg.region,
    endpoint: cfg.endpoint,
    forcePathStyle: cfg.forcePathStyle,
    ...(cfg.accessKeyId && cfg.secretAccessKey
      ? { credentials: { accessKeyId: cfg.accessKeyId, secretAccessKey: cfg.secretAccessKey } }
      : {}),
  });
  const publicBase = (
    cfg.publicBaseUrl || `https://${cfg.bucket}.s3.${cfg.region}.amazonaws.com`
  ).replace(/\/$/, '');

  return {
    name: 's3',
    async save({ buffer, mimetype }) {
      const key = `clothswap/${randomUUID()}${extFor(mimetype)}`;
      await client.send(new PutObjectCommand({ Bucket: cfg.bucket, Key: key, Body: buffer, ContentType: mimetype }));
      return { url: `${publicBase}/${key}`, key };
    },
    async remove(url) {
      if (!url.startsWith(publicBase + '/')) return;
      const key = url.slice(publicBase.length + 1);
      await client.send(new DeleteObjectCommand({ Bucket: cfg.bucket, Key: key })).catch(() => {});
    },
  };
}
