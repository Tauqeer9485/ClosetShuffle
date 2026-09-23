import { MongoClient } from 'mongodb';
import { randomUUID } from 'node:crypto';
import { conflict } from '../errors.js';

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Documents use string UUIDs as _id so ids look identical to the Postgres adapter.
const fromDoc = (d) => {
  if (!d) return null;
  const { _id, ...rest } = d;
  return { id: _id, ...rest };
};
const toUser = (d, withHash = false) => {
  const u = fromDoc(d);
  if (u && !withHash) delete u.passwordHash;
  return u;
};
const toListing = (d) => {
  const l = fromDoc(d);
  if (!l) return null;
  delete l.geo;
  if (l.distanceMeters != null) {
    l.distanceKm = Math.round(l.distanceMeters / 100) / 10;
    delete l.distanceMeters;
  }
  return l;
};
const pick = (obj, keys) => {
  const out = {};
  for (const k of keys) if (obj[k] !== undefined) out[k] = obj[k];
  return out;
};
const geoOf = (lat, lng) =>
  Number.isFinite(lat) && Number.isFinite(lng) ? { type: 'Point', coordinates: [lng, lat] } : undefined;

export async function createMongoDb({ url, mongoDbName }) {
  if (!url) throw new Error('DATABASE_URL is required when DB_TYPE=mongo');
  const client = new MongoClient(url);
  await client.connect();
  const database = client.db(mongoDbName);

  const U = database.collection('users');
  const L = database.collection('listings');
  const S = database.collection('swap_requests');
  const M = database.collection('messages');

  await Promise.all([
    U.createIndex({ email: 1 }, { unique: true }),
    L.createIndex({ status: 1, category: 1 }),
    L.createIndex({ userId: 1 }),
    L.createIndex({ geo: '2dsphere' }),
    S.createIndex({ requesterId: 1 }),
    S.createIndex({ targetOwnerId: 1 }),
    M.createIndex({ swapRequestId: 1, createdAt: 1 }),
  ]);

  const users = {
    async create(u) {
      const doc = {
        _id: randomUUID(),
        name: u.name,
        email: u.email.toLowerCase(),
        passwordHash: u.passwordHash,
        role: u.role || 'user',
        banned: false,
        city: u.city ?? null,
        lat: u.lat ?? null,
        lng: u.lng ?? null,
        createdAt: new Date(),
      };
      try {
        await U.insertOne(doc);
      } catch (e) {
        if (e.code === 11000) throw conflict('Email already registered');
        throw e;
      }
      return toUser(doc);
    },
    async findByEmail(email) {
      return toUser(await U.findOne({ email: email.toLowerCase() }), true);
    },
    async findById(id) {
      return toUser(await U.findOne({ _id: String(id) }));
    },
    async findByIds(ids) {
      if (!ids?.length) return [];
      return (await U.find({ _id: { $in: ids } }).toArray()).map((d) => toUser(d));
    },
    async update(id, patch) {
      const $set = pick(patch, ['name', 'city', 'lat', 'lng']);
      if (!Object.keys($set).length) return this.findById(id);
      return toUser(await U.findOneAndUpdate({ _id: id }, { $set }, { returnDocument: 'after' }));
    },
    async setBanned(id, banned) {
      return toUser(await U.findOneAndUpdate({ _id: String(id) }, { $set: { banned } }, { returnDocument: 'after' }));
    },
    async list({ limit = 50, offset = 0 } = {}) {
      return (await U.find().sort({ createdAt: -1 }).skip(offset).limit(limit).toArray()).map((d) => toUser(d));
    },
  };

  const listingFilter = (f) => {
    const q = {};
    if (f.status) q.status = f.status;
    if (f.category) q.category = f.category;
    if (f.size) q.size = new RegExp(`^${escapeRegex(f.size)}$`, 'i');
    if (f.condition) q.condition = f.condition;
    if (f.userId) q.userId = f.userId;
    if (f.excludeUserId) q.userId = { $ne: f.excludeUserId };
    if (f.q) {
      const r = new RegExp(escapeRegex(f.q), 'i');
      q.$or = [{ title: r }, { brand: r }];
    }
    return q;
  };

  const listings = {
    async create(l) {
      const doc = {
        _id: randomUUID(),
        userId: l.userId,
        title: l.title,
        description: l.description || '',
        category: l.category,
        brand: l.brand || '',
        size: l.size,
        condition: l.condition,
        estimatedValue: l.estimatedValue,
        images: l.images || [],
        city: l.city ?? null,
        lat: l.lat ?? null,
        lng: l.lng ?? null,
        status: 'AVAILABLE',
        createdAt: new Date(),
      };
      const geo = geoOf(doc.lat, doc.lng);
      if (geo) doc.geo = geo;
      await L.insertOne(doc);
      return toListing(doc);
    },
    async findById(id) {
      return toListing(await L.findOne({ _id: String(id) }));
    },
    async findByIds(ids) {
      if (!ids?.length) return [];
      return (await L.find({ _id: { $in: ids } }).toArray()).map(toListing);
    },
    async update(id, patch) {
      const $set = pick(patch, [
        'title', 'description', 'category', 'brand', 'size', 'condition',
        'estimatedValue', 'images', 'city', 'lat', 'lng',
      ]);
      if (patch.lat !== undefined || patch.lng !== undefined) {
        const cur = await L.findOne({ _id: id });
        const geo = geoOf(patch.lat ?? cur?.lat, patch.lng ?? cur?.lng);
        if (geo) $set.geo = geo;
      }
      if (!Object.keys($set).length) return this.findById(id);
      return toListing(await L.findOneAndUpdate({ _id: id }, { $set }, { returnDocument: 'after' }));
    },
    async remove(id) {
      // MongoDB has no cascade: remove dependent swaps and their messages by hand.
      const related = await S.find({ $or: [{ offeredListingId: id }, { targetListingId: id }] }, { projection: { _id: 1 } }).toArray();
      const swapIds = related.map((s) => s._id);
      if (swapIds.length) {
        await M.deleteMany({ swapRequestId: { $in: swapIds } });
        await S.deleteMany({ _id: { $in: swapIds } });
      }
      await L.deleteOne({ _id: id });
    },
    async setStatusIf(id, from, to) {
      const r = await L.updateOne({ _id: id, status: { $in: from } }, { $set: { status: to } });
      return r.modifiedCount > 0;
    },
    async search(f = {}) {
      const query = listingFilter(f);
      const limit = f.limit ?? 20;
      const offset = f.offset ?? 0;
      const hasGeo = Number.isFinite(f.lat) && Number.isFinite(f.lng);
      if (hasGeo) {
        const stage = {
          near: { type: 'Point', coordinates: [f.lng, f.lat] },
          distanceField: 'distanceMeters',
          spherical: true,
          query,
        };
        if (f.maxDistanceKm) stage.maxDistance = f.maxDistanceKm * 1000;
        const docs = await L.aggregate([{ $geoNear: stage }, { $skip: offset }, { $limit: limit }]).toArray();
        return docs.map(toListing);
      }
      return (await L.find(query).sort({ createdAt: -1 }).skip(offset).limit(limit).toArray()).map(toListing);
    },
  };

  const swaps = {
    async create(s) {
      const now = new Date();
      const doc = {
        _id: randomUUID(),
        requesterId: s.requesterId,
        targetOwnerId: s.targetOwnerId,
        offeredListingId: s.offeredListingId,
        targetListingId: s.targetListingId,
        status: 'PENDING',
        createdAt: now,
        updatedAt: now,
      };
      await S.insertOne(doc);
      return fromDoc(doc);
    },
    async findById(id) {
      return fromDoc(await S.findOne({ _id: String(id) }));
    },
    async listForUser(userId) {
      return (await S.find({ $or: [{ requesterId: userId }, { targetOwnerId: userId }] }).sort({ createdAt: -1 }).toArray()).map(fromDoc);
    },
    async list({ status, limit = 50, offset = 0 } = {}) {
      return (await S.find(status ? { status } : {}).sort({ createdAt: -1 }).skip(offset).limit(limit).toArray()).map(fromDoc);
    },
    async findOpenDuplicate(offeredId, targetId) {
      return fromDoc(await S.findOne({
        offeredListingId: offeredId,
        targetListingId: targetId,
        status: { $in: ['PENDING', 'ACCEPTED'] },
      }));
    },
    async transition(id, from, to) {
      return fromDoc(await S.findOneAndUpdate(
        { _id: id, status: { $in: from } },
        { $set: { status: to, updatedAt: new Date() } },
        { returnDocument: 'after' },
      ));
    },
    async cancelPendingForListings(listingIds, exceptSwapId) {
      const r = await S.updateMany(
        {
          status: 'PENDING',
          _id: { $ne: exceptSwapId },
          $or: [{ offeredListingId: { $in: listingIds } }, { targetListingId: { $in: listingIds } }],
        },
        { $set: { status: 'CANCELLED', updatedAt: new Date() } },
      );
      return r.modifiedCount;
    },
  };

  const messages = {
    async create(m) {
      const doc = {
        _id: randomUUID(),
        swapRequestId: m.swapRequestId,
        senderId: m.senderId,
        content: m.content,
        createdAt: new Date(),
      };
      await M.insertOne(doc);
      return fromDoc(doc);
    },
    async listBySwap(swapId, { after, limit = 200 } = {}) {
      const q = { swapRequestId: swapId };
      if (after) q.createdAt = { $gt: new Date(after) };
      return (await M.find(q).sort({ createdAt: 1 }).limit(limit).toArray()).map(fromDoc);
    },
  };

  return {
    type: 'mongo',
    users,
    listings,
    swaps,
    messages,
    async stats() {
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const [usersN, listingsN, availableN, messagesN, byStatus, a, b, c] = await Promise.all([
        U.countDocuments(),
        L.countDocuments(),
        L.countDocuments({ status: 'AVAILABLE' }),
        M.countDocuments(),
        S.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]).toArray(),
        L.distinct('userId', { createdAt: { $gt: since } }),
        S.distinct('requesterId', { createdAt: { $gt: since } }),
        M.distinct('senderId', { createdAt: { $gt: since } }),
      ]);
      return {
        users: usersN,
        listings: listingsN,
        availableListings: availableN,
        messages: messagesN,
        activeUsers30d: new Set([...a, ...b, ...c]).size,
        swapsByStatus: Object.fromEntries(byStatus.map((r) => [r._id, r.n])),
      };
    },
    async close() {
      await client.close();
    },
  };
}
