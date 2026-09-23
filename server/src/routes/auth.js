import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { getDb } from '../db/index.js';
import { signToken } from '../middleware/auth.js';
import { forbidden, unauthorized } from '../errors.js';
import { lat, lng } from '../schemas.js';
import { asyncHandler } from '../utils.js';

const router = Router();

const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
  city: z.string().trim().max(80).optional(),
  lat: lat(),
  lng: lng(),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

router.post('/register', asyncHandler(async (req, res) => {
  const data = registerSchema.parse(req.body);
  const user = await getDb().users.create({
    name: data.name,
    email: data.email,
    passwordHash: await bcrypt.hash(data.password, 10),
    city: data.city,
    lat: data.lat,
    lng: data.lng,
  });
  res.status(201).json({ token: signToken(user), user });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);
  const found = await getDb().users.findByEmail(email);
  if (!found || !(await bcrypt.compare(password, found.passwordHash))) {
    throw unauthorized('Invalid email or password');
  }
  if (found.banned) throw forbidden('Account suspended');
  const { passwordHash, ...user } = found;
  res.json({ token: signToken(user), user });
}));

export default router;
