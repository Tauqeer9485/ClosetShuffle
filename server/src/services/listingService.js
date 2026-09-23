import { getDb } from '../db/index.js';
import { getStorage } from '../storage/index.js';
import { conflict, notFound } from '../errors.js';

export async function removeListing(listingId) {
  const db = getDb();
  const listing = await db.listings.findById(listingId);
  if (!listing) throw notFound('Listing not found');
  if (listing.status === 'PENDING_SWAP') {
    throw conflict('This item is part of an accepted swap. Cancel the swap first.');
  }
  await db.listings.remove(listing.id);
  const storage = getStorage();
  await Promise.all((listing.images || []).map((url) => storage.remove(url).catch(() => {})));
}
