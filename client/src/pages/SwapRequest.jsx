// TODO (Swap Request page): read ?target=<listingId>.
//  1. GET  /api/listings/:target                     -> show the item you want
//  2. GET  /api/users/profile                        -> pick one of your AVAILABLE items to offer
//  3. GET  /api/listings/suggestions?listingId=<mine> -> optional "fair match" hints
//  4. POST /api/swaps/request { offeredListingId, targetListingId } -> then navigate to /swaps/:id/chat
// The response includes valueComparison { offered, target, difference, fair } to display side by side.
export default function SwapRequest() {
  return <h1>Propose a swap</h1>;
}
