import 'dotenv/config';

const env = process.env;
const bool = (v, d = false) =>
  v === undefined || v === '' ? d : ['1', 'true', 'yes', 'on'].includes(String(v).toLowerCase());
const list = (v) => (v || '').split(',').map((s) => s.trim()).filter(Boolean);

const nodeEnv = env.NODE_ENV || 'development';
const port = Number(env.PORT) || 4000;
const origins = list(env.CLIENT_URL || 'http://localhost:5173');

export const config = {
  env: nodeEnv,
  isProd: nodeEnv === 'production',
  port,
  trustProxy: env.TRUST_PROXY !== undefined ? Number(env.TRUST_PROXY) : nodeEnv === 'production' ? 1 : 0,
  corsOrigins: origins.includes('*') ? true : origins,
  jwt: {
    secret: env.JWT_SECRET || 'dev-secret-change-me',
    expiresIn: env.JWT_EXPIRES_IN || '7d',
  },
  db: {
    type: (env.DB_TYPE || 'postgres').toLowerCase(),
    url: env.DATABASE_URL,
    ssl: bool(env.DB_SSL),
    mongoDbName: env.MONGO_DB_NAME || 'clothswap',
  },
  storage: {
    driver: (env.STORAGE_DRIVER || 'local').toLowerCase(),
    localDir: env.LOCAL_UPLOAD_DIR || 'uploads',
    publicBaseUrl: env.PUBLIC_BASE_URL || `http://localhost:${port}`,
    cloudinary: {
      cloudName: env.CLOUDINARY_CLOUD_NAME,
      apiKey: env.CLOUDINARY_API_KEY,
      apiSecret: env.CLOUDINARY_API_SECRET,
    },
    s3: {
      bucket: env.S3_BUCKET,
      region: env.S3_REGION || 'us-east-1',
      endpoint: env.S3_ENDPOINT || undefined,
      accessKeyId: env.S3_ACCESS_KEY_ID || undefined,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY || undefined,
      publicBaseUrl: env.S3_PUBLIC_BASE_URL || undefined,
      forcePathStyle: bool(env.S3_FORCE_PATH_STYLE),
    },
  },
  bootstrapAdmin: {
    email: env.ADMIN_EMAIL,
    password: env.ADMIN_PASSWORD,
    name: env.ADMIN_NAME || 'Platform Admin',
  },
};

if (config.isProd && config.jwt.secret === 'dev-secret-change-me') {
  throw new Error('JWT_SECRET must be set when NODE_ENV=production');
}
