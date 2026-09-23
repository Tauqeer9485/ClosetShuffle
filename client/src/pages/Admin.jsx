// TODO (Admin panel), all routes need an admin account
//  - GET    /api/admin/stats                 -> KPI cards (listings, swaps, conversion rate, active users)
//  - GET    /api/admin/users  + PATCH /api/admin/users/:id/ban { banned }
//  - GET    /api/admin/listings + DELETE /api/admin/listings/:id   (remove inappropriate items)
//  - GET    /api/admin/swaps?status=...  + PATCH /api/admin/swaps/:id/status { status: 'CANCELLED' | 'COMPLETED' } (disputes)
export default function Admin() {
  return <h1>Admin</h1>;
}
