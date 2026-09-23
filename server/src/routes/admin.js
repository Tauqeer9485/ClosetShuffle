import { Router } from 'express';
import { z } from 'zod';
import { getDb } from '../db/index.js';
import { adminRequired } from '../middleware/auth.js';
import { forbidden, notFound } from '../errors.js';
import { changeStatus, enrichSwaps } from '../services/swapService.js';
import { removeListing } from '../services/listingService.js';
import { asyncHandler } from '../utils.js';

const router = Router();
router.use(adminRequired);

const page = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

// Analytics / KPIs
router.get('/stats', asyncHandler(async (req, res) => {
  const s = await getDb().stats();
  const by = s.swapsByStatus;
  const totalSwaps = Object.values(by).reduce((a, b) => a + b, 0);
  const converted = (by.ACCEPTED || 0) + (by.COMPLETED || 0);
  res.json({
    ...s,
    totalSwaps,
    completedSwaps: by.COMPLETED || 0,
    swapConversionRate: totalSwaps ? Math.round((converted / totalSwaps) * 1000) / 10 : 0,
  });
}));

router.get('/users', asyncHandler(async (req, res) => {
  res.json({ users: await getDb().users.list(page.parse(req.query)) });
}));

router.patch('/users/:id/ban', asyncHandler(async (req, res) => {
  const { banned } = z.object({ banned: z.boolean() }).parse(req.body);
  if (req.params.id === req.user.id) throw forbidden('You cannot suspend your own account');
  const user = await getDb().users.setBanned(req.params.id, banned);
  if (!user) throw notFound('User not found');
  res.json({ user });
}));

router.get('/listings', asyncHandler(async (req, res) => {
  const { limit, offset } = page.parse(req.query);
  res.json({ items: await getDb().listings.search({ limit, offset }) });
}));

router.delete('/listings/:id', asyncHandler(async (req, res) => {
  await removeListing(req.params.id);
  res.status(204).end();
}));

router.get('/swaps', asyncHandler(async (req, res) => {
  const { limit, offset } = page.parse(req.query);
  const status = z.enum(['PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'COMPLETED']).optional().parse(req.query.status);
  const swaps = await getDb().swaps.list({ status, limit, offset });
  res.json({ swaps: await enrichSwaps(swaps) });
}));

// Dispute resolution: force a swap to CANCELLED or COMPLETED
router.patch('/swaps/:id/status', asyncHandler(async (req, res) => {
  const { status } = z.object({ status: z.enum(['CANCELLED', 'COMPLETED']) }).parse(req.body);
  const swap = await changeStatus({ swapId: req.params.id, newStatus: status, actor: req.user });
  const [enriched] = await enrichSwaps([swap]);
  res.json({ swap: enriched });
}));

export default router;
