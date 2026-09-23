import { z } from 'zod';
import { getDb } from '../db/index.js';
import { badRequest, conflict, forbidden, notFound } from '../errors.js';
import { compareValues } from './valueCalculator.js';

const RULES = {
  ACCEPTED: { from: ['PENDING'] },
  REJECTED: { from: ['PENDING'] },
  CANCELLED: { from: ['PENDING', 'ACCEPTED'] },
  COMPLETED: { from: ['ACCEPTED'] },
};

export async function requestSwap({ user, offeredListingId, targetListingId }) {
  const db = getDb();
  const [offered, target] = await Promise.all([
    db.listings.findById(offeredListingId),
    db.listings.findById(targetListingId),
  ]);
  if (!offered || !target) throw notFound('Listing not found');
  if (offered.userId !== user.id) throw forbidden('You can only offer your own items');
  if (target.userId === user.id) throw badRequest('You cannot swap with yourself');
  if (offered.status !== 'AVAILABLE' || target.status !== 'AVAILABLE') {
    throw conflict('One of the items is no longer available');
  }
  if (await db.swaps.findOpenDuplicate(offered.id, target.id)) {
    throw conflict('You already have an open request for this pair of items');
  }
  return db.swaps.create({
    requesterId: user.id,
    targetOwnerId: target.userId,
    offeredListingId: offered.id,
    targetListingId: target.id,
  });
}

function canPerform(swap, newStatus, actor) {
  const isRequester = swap.requesterId === actor.id;
  const isTargetOwner = swap.targetOwnerId === actor.id;
  // Admins can settle disputes by cancelling or completing any swap
  if (actor.role === 'admin' && (newStatus === 'CANCELLED' || newStatus === 'COMPLETED')) return true;
  switch (newStatus) {
    case 'ACCEPTED':
    case 'REJECTED':
      return isTargetOwner;
    case 'CANCELLED':
      return swap.status === 'PENDING' ? isRequester : isRequester || isTargetOwner;
    case 'COMPLETED':
      return isRequester || isTargetOwner;
    default:
      return false;
  }
}

export async function changeStatus({ swapId, newStatus, actor }) {
  const db = getDb();
  const rule = RULES[newStatus];
  if (!rule) throw badRequest('Invalid status');
  const swap = await db.swaps.findById(swapId);
  if (!swap) throw notFound('Swap not found');
  if (!canPerform(swap, newStatus, actor)) throw forbidden('You cannot perform this action on this swap');
  if (!rule.from.includes(swap.status)) {
    throw conflict(`This swap is ${swap.status}, so it cannot be changed to ${newStatus}`);
  }

  const listingIds = [swap.offeredListingId, swap.targetListingId];
  const releaseListings = () =>
    Promise.all(listingIds.map((id) => db.listings.setStatusIf(id, ['PENDING_SWAP'], 'AVAILABLE')));

  if (newStatus === 'ACCEPTED') {
    // Reserve both items first. The compare-and-set makes sure two requests can't claim the same item.
    const claimedTarget = await db.listings.setStatusIf(swap.targetListingId, ['AVAILABLE'], 'PENDING_SWAP');
    const claimedOffered =
      claimedTarget && (await db.listings.setStatusIf(swap.offeredListingId, ['AVAILABLE'], 'PENDING_SWAP'));
    if (!claimedTarget || !claimedOffered) {
      if (claimedTarget) await db.listings.setStatusIf(swap.targetListingId, ['PENDING_SWAP'], 'AVAILABLE');
      throw conflict('One of the items is no longer available');
    }
    const updated = await db.swaps.transition(swap.id, ['PENDING'], 'ACCEPTED');
    if (!updated) {
      await releaseListings();
      throw conflict('This swap was already updated');
    }
    // Other open requests for the same items can no longer be fulfilled
    await db.swaps.cancelPendingForListings(listingIds, swap.id);
    return updated;
  }

  const updated = await db.swaps.transition(swap.id, rule.from, newStatus);
  if (!updated) throw conflict('This swap was already updated');
  if (newStatus === 'COMPLETED') {
    await Promise.all(listingIds.map((id) => db.listings.setStatusIf(id, ['PENDING_SWAP'], 'SWAPPED')));
  } else if (newStatus === 'CANCELLED' && swap.status === 'ACCEPTED') {
    await releaseListings();
  }
  return updated;
}

export async function assertParticipant(swapId, user, { allowAdmin = true } = {}) {
  const swap = await getDb().swaps.findById(swapId);
  if (!swap) throw notFound('Swap not found');
  const isParticipant = swap.requesterId === user.id || swap.targetOwnerId === user.id;
  if (!isParticipant && !(allowAdmin && user.role === 'admin')) throw forbidden('You are not part of this swap');
  return swap;
}

const contentSchema = z.string().trim().min(1, 'Message cannot be empty').max(2000);

export async function postMessage({ swapId, user, content }) {
  const swap = await assertParticipant(swapId, user, { allowAdmin: false });
  if (!['PENDING', 'ACCEPTED'].includes(swap.status)) throw conflict('Chat is closed for this swap');
  return getDb().messages.create({
    swapRequestId: swap.id,
    senderId: user.id,
    content: contentSchema.parse(content),
  });
}

// Attach listings, people and a value comparison so the UI needs a single request.
export async function enrichSwaps(swaps) {
  if (!swaps.length) return [];
  const db = getDb();
  const listingIds = [...new Set(swaps.flatMap((s) => [s.offeredListingId, s.targetListingId]))];
  const userIds = [...new Set(swaps.flatMap((s) => [s.requesterId, s.targetOwnerId]))];
  const [listings, users] = await Promise.all([db.listings.findByIds(listingIds), db.users.findByIds(userIds)]);
  const listingMap = new Map(listings.map((l) => [l.id, l]));
  const userMap = new Map(users.map((u) => [u.id, { id: u.id, name: u.name, city: u.city }]));
  return swaps.map((s) => {
    const offeredListing = listingMap.get(s.offeredListingId) || null;
    const targetListing = listingMap.get(s.targetListingId) || null;
    return {
      ...s,
      offeredListing,
      targetListing,
      requester: userMap.get(s.requesterId) || null,
      targetOwner: userMap.get(s.targetOwnerId) || null,
      valueComparison:
        offeredListing && targetListing
          ? compareValues(offeredListing.estimatedValue, targetListing.estimatedValue)
          : null,
    };
  });
}
