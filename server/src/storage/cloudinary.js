export async function createCloudinaryStorage({ cloudName, apiKey, apiSecret }) {
  const { v2: cloudinary } = await import('cloudinary');
  // If CLOUDINARY_URL is set the SDK configures itself; otherwise use the three values.
  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
  } else if (!process.env.CLOUDINARY_URL) {
    throw new Error('STORAGE_DRIVER=cloudinary needs CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET');
  }
  return {
    name: 'cloudinary',
    async save({ buffer }) {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder: 'clothswap' }, (err, res) =>
          err ? reject(err) : resolve({ url: res.secure_url, key: res.public_id }),
        );
        stream.end(buffer);
      });
    },
    async remove(url) {
      const m = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z0-9]+$/i);
      if (m) await cloudinary.uploader.destroy(m[1]).catch(() => {});
    },
  };
}
