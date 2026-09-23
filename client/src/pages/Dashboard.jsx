// TODO (User Dashboard)
//  - GET /api/users/profile  -> my details and my listings (all statuses)
//  - GET /api/swaps          -> incoming and outgoing requests (already enriched with items, people, valueComparison)
//  - Accept / reject incoming: PATCH /api/swaps/:id/status
//  - "Add a listing" form: POST /api/listings as multipart FormData (fields + up to 5 "images"),
//    with a live preview from POST /api/listings/calculate-value
export default function Dashboard() {
  return <h1>My swaps</h1>;
}
