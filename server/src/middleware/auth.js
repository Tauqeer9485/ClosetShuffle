import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { getDb } from '../db/index.js';
import { forbidden, unauthorized } from '../errors.js';
import { asyncHandler } from '../utils.js';

export const signToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });

// Verifies the JWT and loads the user from the database (so bans and role changes apply immediately).
export async function userFromToken(token) {
  if (!token) throw unauthorized();
  let payload;
  try {
    payload = jwt.verify(token, config.jwt.secret);
  } catch {
    throw unauthorized('Invalid or expired token');
  }
  const user = await getDb().users.findById(payload.sub);
  if (!user) throw unauthorized('Account not found');
  if (user.banned) throw forbidden('Account suspended');
  return user;
}

const bearer = (req) => {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  return scheme === 'Bearer' ? token : null;
};

export const authRequired = asyncHandler(async (req, res, next) => {
  req.user = await userFromToken(bearer(req));
  next();
});

export const adminRequired = [
  authRequired,
  (req, res, next) => (req.user.role === 'admin' ? next() : next(forbidden('Admin access only'))),
];
