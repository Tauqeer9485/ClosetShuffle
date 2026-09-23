import { Router } from 'express';
import { z } from 'zod';
import { getDb } from '../db/index.js';
import { authRequired } from '../middleware/auth.js';
import {
  assertParticipant, changeStatus, enrichSwaps, postMessage, requestSwap,
} from '../services/swapService.js';
import { asyncHandler } from '../utils.js';

const router = Router();
router.use(authRequired);

const requestSchema = z.object({
  offeredListingId: z.string().min(1),
  targetListingId: z.string().min(1),
});
const statusSchema = z.object({
  status: z.enum(['ACCEPTED', 'REJECTED', 'CANCELLED', 'COMPLETED']),
});

// Propose one of my items for someone else's item
router.post('/request', asyncHandler(async (req, res) => {
  const body = requestSchema.parse(req.body);
  const swap = await requestSwap({ user: req.user, ...body });
  const [enriched] = await enrichSwaps([swap]);
  res.status(201).json({ swap: enriched });
}));

// My swaps: sent and received
router.get('/', asyncHandler(async (req, res) => {
  const swaps = await getDb().swaps.listForUser(req.user.id);
  res.json({ swaps: await enrichSwaps(swaps) });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const swap = await assertParticipant(req.params.id, req.user);
  const [enriched] = await enrichSwaps([swap]);
  res.json({ swap: enriched });
}));

// Accept / reject / cancel / complete
router.patch('/:id/status', asyncHandler(async (req, res) => {
  const { status } = statusSchema.parse(req.body);
  const swap = await changeStatus({ swapId: req.params.id, newStatus: status, actor: req.user });
  const [enriched] = await enrichSwaps([swap]);
  req.app.get('io')?.to(`swap:${swap.id}`).emit('swap:updated', { id: swap.id, status: swap.status });
  res.json({ swap: enriched });
}));

// Chat history. Poll with ?after=<ISO timestamp of the last message> if you are not using sockets.
// Timestamps are compared at millisecond precision, so clients should de-duplicate messages by id.
router.get('/:id/messages', asyncHandler(async (req, res) => {
  const swap = await assertParticipant(req.params.id, req.user);
  const after = z.string().datetime().optional().parse(req.query.after);
  res.json({ messages: await getDb().messages.listBySwap(swap.id, { after }) });
}));

// REST fallback for sending a message (sockets use the "message:send" event instead)
router.post('/:id/messages', asyncHandler(async (req, res) => {
  const message = await postMessage({ swapId: req.params.id, user: req.user, content: req.body?.content });
  req.app.get('io')?.to(`swap:${req.params.id}`).emit('message:new', message);
  res.status(201).json({ message });
}));

export default router;
