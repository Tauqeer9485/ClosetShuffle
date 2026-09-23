import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { CATEGORIES, CONDITIONS } from '../constants.js';
import { getDb } from '../db/index.js';
import { getStorage } from '../storage/index.js';
import { authRequired } from '../middleware/auth.js';
import { AppError, badRequest, conflict, forbidden, notFound } from '../errors.js';
import { lat, lng, optNum } from '../schemas.js';
import { calculateValue } from '../services/valueCalculator.js';
import { removeListing } from '../services/listingService.js';
import { asyncHandler } from '../utils.js';

const router = Router();

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
  fileFilter: (req, file, cb) =>
    ALLOWED_TYPES.includes(file.mimetype)
      ? cb(null, true)
      : cb(new AppError(400, 'Only JPEG, PNG or WebP images are allowed')),
});

const listingSchema = z.object({
  title: z.string().trim().min(3).max(120),
  description: z.string().trim().max(1000).default(''),
  category: z.enum(CATEGORIES),
  brand: z.string().trim().max(60).default(''),
  size: z.string().trim().min(1).max(20),
  condition: z.enum(CONDITIONS),
  city: z.string().trim().max(80).optional(),
  lat: lat(),
  lng: lng(),
});

const searchSchema = z.object({
  q: z.string().trim().max(80).optional(),
  category: z.enum(CATEGORIES).optional(),
  size: z.string().trim().max(20).optional(),
  condition: z.enum(CONDITIONS).optional(),
  lat: lat(),
  lng: lng(),
  maxDistance: optNum(1, 20000),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

const calcSchema = z.object({
  category: z.enum(CATEGORIES),
  brand: z.string().trim().max(60).default(''),
  condition: z.enum(CONDITIONS),
});

// Browse and filter (public). Pass lat/lng (+ maxDistance in km) for nearby results.
router.get('/', asyncHandler(async (req, res) => {
  const f = searchSchema.parse(req.query);
  const items = await getDb().listings.search({
    q: f.q, category: f.category, size: f.size, condition: f.condition,
    status: 'AVAILABLE',
    lat: f.lat, lng: f.lng, maxDistanceKm: f.maxDistance,
    limit: f.limit, offset: f.offset,
  });
  res.json({ items, limit: f.limit, offset: f.offset, hasMore: items.length === f.limit });
}));

// Fair-swap suggestions for one of my items: nearby items of other people with a similar value.
router.get('/suggestions', authRequired, asyncHandler(async (req, res) => {
  const q = z.object({
    listingId: z.string().min(1),
    radius: optNum(1, 20000),
    tolerance: optNum(0.05, 1),
  }).parse(req.query);
  const mine = await getDb().listings.findById(q.listingId);
  if (!mine) throw notFound('Listing not found');
  if (mine.userId !== req.user.id) throw forbidden('You can only get suggestions for your own items');

  const originLat = mine.lat ?? req.user.lat;
  const originLng = mine.lng ?? req.user.lng;
  const tolerance = q.tolerance ?? 0.3;
  const candidates = await getDb().listings.search({
    status: 'AVAILABLE',
    excludeUserId: req.user.id,
    lat: originLat ?? undefined,
    lng: originLng ?? undefined,
    maxDistanceKm: originLat != null ? q.radius ?? 25 : undefined,
    limit: 100,
  });
  const items = candidates
    .filter((c) => Math.abs(c.estimatedValue - mine.estimatedValue) <= mine.estimatedValue * tolerance)
    .sort((a, b) => Math.abs(a.estimatedValue - mine.estimatedValue) - Math.abs(b.estimatedValue - mine.estimatedValue));
  res.json({ items });
}));

// Preview the estimated value before creating a listing
router.post('/calculate-value', authRequired, asyncHandler(async (req, res) => {
  res.json(calculateValue(calcSchema.parse(req.body)));
}));

// Create a listing (multipart/form-data: text fields + up to 5 "images")
router.post('/', authRequired, upload.array('images', 5), asyncHandler(async (req, res) => {
  const data = listingSchema.parse(req.body);
  const files = req.files || [];
  if (files.length < 1) throw badRequest('Add at least one photo of the item');

  const storage = getStorage();
  const uploaded = await Promise.all(files.map((f) => storage.save(f)));
  const images = uploaded.map((u) => u.url);
  try {
    const listing = await getDb().listings.create({
      ...data,
      userId: req.user.id,
      city: data.city ?? req.user.city ?? undefined,
      lat: data.lat ?? req.user.lat ?? undefined,
      lng: data.lng ?? req.user.lng ?? undefined,
      estimatedValue: calculateValue(data).estimatedValue,
      images,
    });
    res.status(201).json({ listing });
  } catch (e) {
    await Promise.all(images.map((u) => storage.remove(u).catch(() => {})));
    throw e;
  }
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const listing = await getDb().listings.findById(req.params.id);
  if (!listing) throw notFound('Listing not found');
  const owner = await getDb().users.findById(listing.userId);
  res.json({ listing, owner: owner && { id: owner.id, name: owner.name, city: owner.city } });
}));

router.put('/:id', authRequired, asyncHandler(async (req, res) => {
  const listing = await getDb().listings.findById(req.params.id);
  if (!listing) throw notFound('Listing not found');
  if (listing.userId !== req.user.id && req.user.role !== 'admin') throw forbidden();
  if (listing.status !== 'AVAILABLE') throw conflict('Only available items can be edited');

  const patch = listingSchema.partial().parse(req.body);
  const merged = { ...listing, ...patch };
  if (patch.category || patch.brand !== undefined || patch.condition) {
    patch.estimatedValue = calculateValue(merged).estimatedValue;
  }
  res.json({ listing: await getDb().listings.update(listing.id, patch) });
}));

router.delete('/:id', authRequired, asyncHandler(async (req, res) => {
  const listing = await getDb().listings.findById(req.params.id);
  if (!listing) throw notFound('Listing not found');
  if (listing.userId !== req.user.id && req.user.role !== 'admin') throw forbidden();
  await removeListing(listing.id);
  res.status(204).end();
}));

export default router;
