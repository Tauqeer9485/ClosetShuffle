import pg from 'pg';
import { randomUUID } from 'node:crypto';
import { conflict } from '../errors.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUuid = (v) => typeof v === 'string' && UUID_RE.test(v);
const validIds = (ids) => (ids || []).filter(isUuid);

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  banned BOOLEAN NOT NULL DEFAULT false,
  city TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL,
  brand TEXT NOT NULL DEFAULT '',
  size TEXT NOT NULL,
  item_condition TEXT NOT NULL,
  estimated_value INTEGER NOT NULL DEFAULT 0,
  images TEXT[] NOT NULL DEFAULT '{}',
  city TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  status TEXT NOT NULL DEFAULT 'AVAILABLE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_listings_status_category ON listings(status, category);
CREATE INDEX IF NOT EXISTS idx_listings_user ON listings(user_id);
CREATE TABLE IF NOT EXISTS swap_requests (
  id UUID PRIMARY KEY,
  requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  offered_listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  target_listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_swaps_requester ON swap_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_swaps_target_owner ON swap_requests(target_owner_id);
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY,
  swap_request_id UUID NOT NULL REFERENCES swap_requests(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_messages_swap ON messages(swap_request_id, created_at);
`;

const toUser = (r, withHash = false) =>
  r && {
    id: r.id,
    name: r.name,
    email: r.email,
    role: r.role,
    banned: r.banned,
    city: r.city,
    lat: r.lat,
    lng: r.lng,
    createdAt: r.created_at,
    ...(withHash ? { passwordHash: r.password_hash } : {}),
  };

const toListing = (r) =>
  r && {
    id: r.id,
    userId: r.user_id,
    title: r.title,
    description: r.description,
    category: r.category,
    brand: r.brand,
    size: r.size,
    condition: r.item_condition,
    estimatedValue: r.estimated_value,
    images: r.images,
    city: r.city,
    lat: r.lat,
    lng: r.lng,
    status: r.status,
    createdAt: r.created_at,
    ...(r.distance_km != null ? { distanceKm: Math.round(r.distance_km * 10) / 10 } : {}),
  };

const toSwap = (r) =>
  r && {
    id: r.id,
    requesterId: r.requester_id,
    targetOwnerId: r.target_owner_id,
    offeredListingId: r.offered_listing_id,
    targetListingId: r.target_listing_id,
    status: r.status,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };

const toMessage = (r) =>
  r && {
    id: r.id,
    swapRequestId: r.swap_request_id,
    senderId: r.sender_id,
    content: r.content,
    createdAt: r.created_at,
  };

// Build "col = $n" fragments for the keys of `patch` that appear in `columnMap`.
function buildSet(patch, columnMap) {
  const sets = [];
  const values = [];
  for (const [key, col] of Object.entries(columnMap)) {
    if (patch[key] !== undefined) {
      values.push(patch[key]);
      sets.push(`${col} = $${values.length}`);
    }
  }
  return { sets, values };
}

export async function createPostgresDb({ url, ssl }) {
  if (!url) throw new Error('DATABASE_URL is required when DB_TYPE=postgres');
  const pool = new pg.Pool({
    connectionString: url,
    ssl: ssl ? { rejectUnauthorized: false } : undefined,
    max: 10,
  });
  await pool.query(SCHEMA);

  const one = async (sql, params) => (await pool.query(sql, params)).rows[0] || null;
  const many = async (sql, params) => (await pool.query(sql, params)).rows;

  const users = {
    async create(u) {
      try {
        const r = await one(
          `INSERT INTO users (id, name, email, password_hash, role, city, lat, lng)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
          [randomUUID(), u.name, u.email.toLowerCase(), u.passwordHash, u.role || 'user', u.city ?? null, u.lat ?? null, u.lng ?? null],
        );
        return toUser(r);
      } catch (e) {
        if (e.code === '23505') throw conflict('Email already registered');
        throw e;
      }
    },
    async findByEmail(email) {
      return toUser(await one('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]), true);
    },
    async findById(id) {
      if (!isUuid(id)) return null;
      return toUser(await one('SELECT * FROM users WHERE id = $1', [id]));
    },
    async findByIds(ids) {
      const v = validIds(ids);
      if (!v.length) return [];
      return (await many('SELECT * FROM users WHERE id = ANY($1::uuid[])', [v])).map((r) => toUser(r));
    },
    async update(id, patch) {
      const { sets, values } = buildSet(patch, { name: 'name', city: 'city', lat: 'lat', lng: 'lng' });
      if (!sets.length) return this.findById(id);
      values.push(id);
      return toUser(await one(`UPDATE users SET ${sets.join(', ')} WHERE id = $${values.length} RETURNING *`, values));
    },
    async setBanned(id, banned) {
      if (!isUuid(id)) return null;
      return toUser(await one('UPDATE users SET banned = $2 WHERE id = $1 RETURNING *', [id, banned]));
    },
    async list({ limit = 50, offset = 0 } = {}) {
      return (await many('SELECT * FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset])).map((r) => toUser(r));
    },
  };

  const listings = {
    async create(l) {
      const r = await one(
        `INSERT INTO listings (id, user_id, title, description, category, brand, size, item_condition,
                               estimated_value, images, city, lat, lng)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
        [randomUUID(), l.userId, l.title, l.description || '', l.category, l.brand || '', l.size, l.condition,
         l.estimatedValue, l.images || [], l.city ?? null, l.lat ?? null, l.lng ?? null],
      );
      return toListing(r);
    },
    async findById(id) {
      if (!isUuid(id)) return null;
      return toListing(await one('SELECT * FROM listings WHERE id = $1', [id]));
    },
    async findByIds(ids) {
      const v = validIds(ids);
      if (!v.length) return [];
      return (await many('SELECT * FROM listings WHERE id = ANY($1::uuid[])', [v])).map(toListing);
    },
    async update(id, patch) {
      const { sets, values } = buildSet(patch, {
        title: 'title', description: 'description', category: 'category', brand: 'brand', size: 'size',
        condition: 'item_condition', estimatedValue: 'estimated_value', images: 'images',
        city: 'city', lat: 'lat', lng: 'lng',
      });
      if (!sets.length) return this.findById(id);
      values.push(id);
      return toListing(await one(`UPDATE listings SET ${sets.join(', ')} WHERE id = $${values.length} RETURNING *`, values));
    },
    async remove(id) {
      // swap_requests and messages are removed by ON DELETE CASCADE
      await pool.query('DELETE FROM listings WHERE id = $1', [id]);
    },
    // Atomic compare-and-set: returns true only if the listing was in one of the `from` states.
    async setStatusIf(id, from, to) {
      const r = await pool.query('UPDATE listings SET status = $3 WHERE id = $1 AND status = ANY($2::text[])', [id, from, to]);
      return r.rowCount > 0;
    },
    async search(f = {}) {
      const params = [];
      const p = (v) => { params.push(v); return `$${params.length}`; };
      const where = [];
      if (f.status) where.push(`l.status = ${p(f.status)}`);
      if (f.category) where.push(`l.category = ${p(f.category)}`);
      if (f.size) where.push(`LOWER(l.size) = LOWER(${p(f.size)})`);
      if (f.condition) where.push(`l.item_condition = ${p(f.condition)}`);
      if (f.userId) where.push(`l.user_id = ${p(f.userId)}`);
      if (f.excludeUserId) where.push(`l.user_id <> ${p(f.excludeUserId)}`);
      if (f.q) {
        const t = p(`%${f.q}%`);
        where.push(`(l.title ILIKE ${t} OR l.brand ILIKE ${t})`);
      }
      const hasGeo = Number.isFinite(f.lat) && Number.isFinite(f.lng);
      let dist = 'NULL::float8';
      if (hasGeo) {
        const la = p(f.lat);
        const ln = p(f.lng);
        // Haversine distance in km (no PostGIS needed, so it runs on any Postgres)
        dist = `(6371 * acos(LEAST(1, cos(radians(${la}::float8)) * cos(radians(l.lat)) * cos(radians(l.lng) - radians(${ln}::float8)) + sin(radians(${la}::float8)) * sin(radians(l.lat)))))`;
        where.push('l.lat IS NOT NULL AND l.lng IS NOT NULL');
      }
      const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
      let sql = `SELECT * FROM (SELECT l.*, ${dist} AS distance_km FROM listings l ${whereSql}) t`;
      if (hasGeo && f.maxDistanceKm) sql += ` WHERE t.distance_km <= ${p(f.maxDistanceKm)}`;
      sql += hasGeo ? ' ORDER BY t.distance_km ASC, t.created_at DESC' : ' ORDER BY t.created_at DESC';
      sql += ` LIMIT ${p(f.limit ?? 20)} OFFSET ${p(f.offset ?? 0)}`;
      return (await many(sql, params)).map(toListing);
    },
  };

  const swaps = {
    async create(s) {
      return toSwap(await one(
        `INSERT INTO swap_requests (id, requester_id, target_owner_id, offered_listing_id, target_listing_id)
         VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [randomUUID(), s.requesterId, s.targetOwnerId, s.offeredListingId, s.targetListingId],
      ));
    },
    async findById(id) {
      if (!isUuid(id)) return null;
      return toSwap(await one('SELECT * FROM swap_requests WHERE id = $1', [id]));
    },
    async listForUser(userId) {
      return (await many(
        'SELECT * FROM swap_requests WHERE requester_id = $1 OR target_owner_id = $1 ORDER BY created_at DESC',
        [userId],
      )).map(toSwap);
    },
    async list({ status, limit = 50, offset = 0 } = {}) {
      if (status) {
        return (await many('SELECT * FROM swap_requests WHERE status = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3', [status, limit, offset])).map(toSwap);
      }
      return (await many('SELECT * FROM swap_requests ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset])).map(toSwap);
    },
    async findOpenDuplicate(offeredId, targetId) {
      return toSwap(await one(
        `SELECT * FROM swap_requests WHERE offered_listing_id = $1 AND target_listing_id = $2
         AND status IN ('PENDING','ACCEPTED') LIMIT 1`,
        [offeredId, targetId],
      ));
    },
    // Atomic compare-and-set on status. Returns the updated swap, or null if it was not in a `from` state.
    async transition(id, from, to) {
      return toSwap(await one(
        'UPDATE swap_requests SET status = $3, updated_at = now() WHERE id = $1 AND status = ANY($2::text[]) RETURNING *',
        [id, from, to],
      ));
    },
    async cancelPendingForListings(listingIds, exceptSwapId) {
      const r = await pool.query(
        `UPDATE swap_requests SET status = 'CANCELLED', updated_at = now()
         WHERE status = 'PENDING' AND id <> $1
           AND (offered_listing_id = ANY($2::uuid[]) OR target_listing_id = ANY($2::uuid[]))`,
        [exceptSwapId, listingIds],
      );
      return r.rowCount;
    },
  };

  const messages = {
    async create(m) {
      return toMessage(await one(
        'INSERT INTO messages (id, swap_request_id, sender_id, content) VALUES ($1,$2,$3,$4) RETURNING *',
        [randomUUID(), m.swapRequestId, m.senderId, m.content],
      ));
    },
    async listBySwap(swapId, { after, limit = 200 } = {}) {
      return (await many(
        `SELECT * FROM messages WHERE swap_request_id = $1
         AND ($2::timestamptz IS NULL OR created_at > $2::timestamptz)
         ORDER BY created_at ASC LIMIT $3`,
        [swapId, after || null, limit],
      )).map(toMessage);
    },
  };

  return {
    type: 'postgres',
    users,
    listings,
    swaps,
    messages,
    async stats() {
      const c = await one(`SELECT
        (SELECT count(*) FROM users)::int AS users,
        (SELECT count(*) FROM listings)::int AS listings,
        (SELECT count(*) FROM listings WHERE status = 'AVAILABLE')::int AS available_listings,
        (SELECT count(*) FROM messages)::int AS messages`);
      const byStatus = await many('SELECT status, count(*)::int AS n FROM swap_requests GROUP BY status');
      const active = await one(`SELECT count(DISTINCT uid)::int AS n FROM (
        SELECT user_id AS uid FROM listings WHERE created_at > now() - interval '30 days'
        UNION ALL SELECT requester_id FROM swap_requests WHERE created_at > now() - interval '30 days'
        UNION ALL SELECT sender_id FROM messages WHERE created_at > now() - interval '30 days') t`);
      return {
        users: c.users,
        listings: c.listings,
        availableListings: c.available_listings,
        messages: c.messages,
        activeUsers30d: active.n,
        swapsByStatus: Object.fromEntries(byStatus.map((r) => [r.status, r.n])),
      };
    },
    async close() {
      await pool.end();
    },
  };
}
