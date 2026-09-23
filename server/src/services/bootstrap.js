import bcrypt from 'bcryptjs';
import { config } from '../config.js';
import { getDb } from '../db/index.js';

// Creates the admin account from ADMIN_EMAIL / ADMIN_PASSWORD if it doesn't exist yet.
// Useful on hosts where you have no shell to run a script.
export async function bootstrapAdmin() {
  const { email, password, name } = config.bootstrapAdmin;
  if (!email || !password) return null;
  const db = getDb();
  const existing = await db.users.findByEmail(email);
  if (existing) return existing;
  const user = await db.users.create({
    name,
    email,
    passwordHash: await bcrypt.hash(password, 10),
    role: 'admin',
  });
  console.log(`Admin account created: ${email}`);
  return user;
}
