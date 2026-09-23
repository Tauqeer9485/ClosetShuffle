import { Router } from 'express';
import { z } from 'zod';
import { getDb } from '../db/index.js';
import { authRequired } from '../middleware/auth.js';
import { lat, lng } from '../schemas.js';
import { asyncHandler } from '../utils.js';

const router = Router();

const updateSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  city: z.string().trim().max(80).optional(),
  lat: lat(),
  lng: lng(),
});

router.get('/profile', authRequired, asyncHandler(async (req, res) => {
  const listings = await getDb().listings.search({ userId: req.user.id, limit: 100 });
  res.json({ user: req.user, listings });
}));

router.patch('/profile', authRequired, asyncHandler(async (req, res) => {
  const patch = updateSchema.parse(req.body);
  const user = await getDb().users.update(req.user.id, patch);
  res.json({ user });
}));

export default router;
