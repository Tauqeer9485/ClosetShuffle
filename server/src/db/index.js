import { config } from '../config.js';

/**
 * Every database adapter returns the same shape:
 *   { users, listings, swaps, messages, stats(), close() }
 * Routes and services only talk to this shape, never to pg / mongodb directly.
 * To add another database, create an adapter with the same methods and register it below.
 */
let db;

export async function connectDb() {
  if (db) return db;
  const { type } = config.db;
  if (type === 'postgres' || type === 'postgresql') {
    const { createPostgresDb } = await import('./postgres.js');
    db = await createPostgresDb(config.db);
  } else if (type === 'mongo' || type === 'mongodb') {
    const { createMongoDb } = await import('./mongo.js');
    db = await createMongoDb(config.db);
  } else {
    throw new Error(`Unsupported DB_TYPE "${type}". Use "postgres" or "mongo".`);
  }
  return db;
}

export function getDb() {
  if (!db) throw new Error('Database not connected yet. Call connectDb() first.');
  return db;
}
