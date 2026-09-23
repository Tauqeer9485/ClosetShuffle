import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config.js';
import { errorHandler, notFoundApi } from './middleware/error.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import listingRoutes from './routes/listings.js';
import swapRoutes from './routes/swaps.js';
import adminRoutes from './routes/admin.js';

export function createApp({ staticDir } = {}) {
  const app = express();
  app.set('trust proxy', config.trustProxy);
  // cross-origin resource policy relaxed so the frontend (another origin) can show uploaded images
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors({ origin: config.corsOrigins, credentials: true }));
  app.use(express.json({ limit: '100kb' }));
  app.use(morgan(config.isProd ? 'combined' : 'dev'));

  app.get('/health', (req, res) => res.json({ status: 'ok' }));
  if (staticDir) app.use('/uploads', express.static(staticDir, { maxAge: '7d' }));

  const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 50, standardHeaders: true, legacyHeaders: false });
  app.use('/api/auth', authLimiter, authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/listings', listingRoutes);
  app.use('/api/swaps', swapRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api', notFoundApi);
  app.use(errorHandler);
  return app;
}
