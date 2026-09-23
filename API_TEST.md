# ClosetShuffle API Postman Test Guide

This document gives step-by-step Postman instructions for every API route implemented in this workspace.

> Scope: REST endpoints under `server/src/routes/*.js`.
> Socket/chat events are included as a note at the end because they are not standard Postman HTTP requests.

## 1) Start the API

Run the server locally before testing:

```bash
cd server
npm install
npm run seed
npm run dev
```

Expected base URL:

```text
http://localhost:4000
```

If you use Docker instead:

```bash
docker compose up --build
```

---

## 2) Postman setup

Create a Postman Environment with these variables:

```text
baseUrl = http://localhost:4000
token = 
adminToken = 
userEmail = aarav@closetshuffle.test
userPassword = Demo@12345
```

For protected routes, set a header in Postman:

```http
Authorization: Bearer {{token}}
```

For admin routes, set:

```http
Authorization: Bearer {{adminToken}}
```

---

## 3) Demo users

The seeded demo accounts are:

- `aarav@closetshuffle.test` / `Demo@12345`
- `neha@closetshuffle.test` / `Demo@12345`
- `rohan@clothswap.test` / `Demo@12345`
- `priya@clothswap.test` / `Demo@12345`

If your project was seeded with environment-based admin credentials, use the configured admin email/password for `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

---

## 4) Auth API

### A. Register a new user

Method: `POST`

URL:

```text
{{baseUrl}}/api/auth/register
```

Headers:

```http
Content-Type: application/json
```

Body (raw JSON):

```json
{
  "name": "Test User",
  "email": "testuser@example.com",
  "password": "TestPass123",
  "city": "Pune",
  "lat": 18.5204,
  "lng": 73.8567
}
```

Expected result:

- Status `201 Created`
- Response contains `token` and `user`
- Save token to `{{token}}`

Validation checks:

- invalid email should fail
- password shorter than 8 chars should fail
- duplicate email should fail

### B. Login

Method: `POST`

URL:

```text
{{baseUrl}}/api/auth/login
```

Headers:

```http
Content-Type: application/json
```

Body:

```json
{
  "email": "aarav@closetshuffle.test",
  "password": "Demo@12345"
}
```

Expected result:

- Status `200 OK`
- Response includes JWT token and user summary
- Save response token to `{{token}}`

Failure cases:

- wrong password -> `401`
- suspended/banned account -> `403`

---

## 5) User profile API

### A. Get current user profile

Method: `GET`

URL:

```text
{{baseUrl}}/api/users/profile
```

Headers:

```http
Authorization: Bearer {{token}}
```

Expected result:

- Status `200 OK`
- Response contains `user` and `listings`

### B. Update current user profile

Method: `PATCH`

URL:

```text
{{baseUrl}}/api/users/profile
```

Headers:

```http
Authorization: Bearer {{token}}
Content-Type: application/json
```

Body:

```json
{
  "name": "Aarav Sharma Updated",
  "city": "Koregaon Park",
  "lat": 18.5362,
  "lng": 73.894
}
```

Expected result:

- Status `200 OK`
- Response returns updated `user`

Validation checks:

- empty name or invalid lat/lng should fail
- missing auth should fail

---

## 6) Listings API

### A. Browse listings with filters

Method: `GET`

URL:

```text
{{baseUrl}}/api/listings?category=Tops&size=M&condition=Good&lat=18.5204&lng=73.8567&maxDistance=25&limit=10&offset=0
```

Optional filters:

- `q`
- `category`
- `size`
- `condition`
- `lat`
- `lng`
- `maxDistance`
- `limit`
- `offset`

Expected result:

- Status `200 OK`
- Response contains `items`, `limit`, `offset`, `hasMore`

### B. Get suggestions for one of my listings

Method: `GET`

URL:

```text
{{baseUrl}}/api/listings/suggestions?listingId={{myListingId}}&radius=25&tolerance=0.3
```

Headers:

```http
Authorization: Bearer {{token}}
```

Expected result:

- Status `200 OK`
- returns a list of similar-value items as `items`

Security check:

- requesting suggestions for another user's listing should fail with `403`

### C. Calculate listing value preview

Method: `POST`

URL:

```text
{{baseUrl}}/api/listings/calculate-value
```

Headers:

```http
Authorization: Bearer {{token}}
Content-Type: application/json
```

Body:

```json
{
  "category": "Shoes",
  "brand": "Nike",
  "condition": "Like New"
}
```

Expected result:

- Status `200 OK`
- response contains a numeric `estimatedValue`

### D. Create a new listing

Method: `POST`

URL:

```text
{{baseUrl}}/api/listings
```

Headers:

```http
Authorization: Bearer {{token}}
```

Body type: `form-data`

Fields:

- `title`: `Classic striped tee`
- `description`: `Cotton tee in a relaxed fit.`
- `category`: `Tops`
- `brand`: `H&M`
- `size`: `M`
- `condition`: `Good`
- `city`: `Pune`
- `lat`: `18.5204`
- `lng`: `73.8567`
- `images`: select at least one image file (`jpg`, `png`, or `webp`)

Expected result:

- Status `201 Created`
- Response contains a `listing` object with `id`, `images`, `estimatedValue`

Validation checks:

- no image file -> `400`
- invalid file type -> `400`
- missing title/category/size -> `400`

### E. Get a single listing by ID

Method: `GET`

URL:

```text
{{baseUrl}}/api/listings/{{listingId}}
```

Expected result:

- Status `200 OK`
- Response includes `listing` and `owner`

Missing ID test:

- invalid non-existent listing ID -> `404`

### F. Update a listing

Method: `PUT`

URL:

```text
{{baseUrl}}/api/listings/{{listingId}}
```

Headers:

```http
Authorization: Bearer {{token}}
Content-Type: application/json
```

Body:

```json
{
  "title": "Classic striped tee - updated",
  "condition": "Like New",
  "priceHint": "not used by API"
}
```

Notes:

- This endpoint accepts partial listing fields.
- Only the owner or admin can update.
- If the listing is no longer `AVAILABLE`, update fails.

Expected result:

- Status `200 OK`
- response returns updated `listing`

### G. Delete a listing

Method: `DELETE`

URL:

```text
{{baseUrl}}/api/listings/{{listingId}}
```

Headers:

```http
Authorization: Bearer {{token}}
```

Expected result:

- Status `204 No Content`

Security checks:

- deleting another user's listing should fail with `403`
- deleting a non-existent listing should fail with `404`

---

## 7) Swap API

### A. Request a swap

Method: `POST`

URL:

```text
{{baseUrl}}/api/swaps/request
```

Headers:

```http
Authorization: Bearer {{token}}
Content-Type: application/json
```

Body:

```json
{
  "offeredListingId": "{{myAvailableListingId}}",
  "targetListingId": "{{otherUsersListingId}}"
}
```

Expected result:

- Status `201 Created`
- response contains `swap`

Business rules to test:

- you cannot request a swap for your own listing -> fail
- if same item is requested twice, one may be rejected/cancelled automatically

### B. List my swaps

Method: `GET`

URL:

```text
{{baseUrl}}/api/swaps
```

Headers:

```http
Authorization: Bearer {{token}}
```

Expected result:

- Status `200 OK`
- response contains `swaps`

### C. Get a swap by ID

Method: `GET`

URL:

```text
{{baseUrl}}/api/swaps/{{swapId}}
```

Headers:

```http
Authorization: Bearer {{token}}
```

Expected result:

- Status `200 OK`
- response includes swap detail and participants

Access control:

- user who is not a participant should fail

### D. Change swap status

Method: `PATCH`

URL:

```text
{{baseUrl}}/api/swaps/{{swapId}}/status
```

Headers:

```http
Authorization: Bearer {{token}}
Content-Type: application/json
```

Body:

```json
{
  "status": "ACCEPTED"
}
```

Allowed values:

- `ACCEPTED`
- `REJECTED`
- `CANCELLED`
- `COMPLETED`

Expected result:

- Status `200 OK`
- response contains updated `swap`

Business rules to test:

- accepting a swap may reserve both items atomically
- other pending requests for same items are cancelled automatically
- wrong account cannot accept someone else’s swap -> fail
- completing a swap after acceptance should be valid

### E. Get swap messages

Method: `GET`

URL:

```text
{{baseUrl}}/api/swaps/{{swapId}}/messages?after={{isoTimestamp}}
```

Headers:

```http
Authorization: Bearer {{token}}
```

Expected result:

- Status `200 OK`
- response contains `messages`

Use `after` for polling when not using socket events.

### F. Send a chat message via REST

Method: `POST`

URL:

```text
{{baseUrl}}/api/swaps/{{swapId}}/messages
```

Headers:

```http
Authorization: Bearer {{token}}
Content-Type: application/json
```

Body:

```json
{
  "content": "Hi! Is the item still available for swap?"
}
```

Expected result:

- Status `201 Created`
- response contains the created `message`

---

## 8) Admin API

Admin route group is protected and requires an admin role.

Create admin token by logging in with the admin email/password configured in environment variables.

### A. Get admin stats / KPIs

Method: `GET`

URL:

```text
{{baseUrl}}/api/admin/stats
```

Headers:

```http
Authorization: Bearer {{adminToken}}
```

Expected result:

- Status `200 OK`
- response includes combined KPI fields, including `totalSwaps`, `completedSwaps`, `swapConversionRate`

### B. List users

Method: `GET`

URL:

```text
{{baseUrl}}/api/admin/users?limit=50&offset=0
```

Headers:

```http
Authorization: Bearer {{adminToken}}
```

Expected result:

- Status `200 OK`
- response contains `users`

### C. Ban / unban a user

Method: `PATCH`

URL:

```text
{{baseUrl}}/api/admin/users/{{userId}}/ban
```

Headers:

```http
Authorization: Bearer {{adminToken}}
Content-Type: application/json
```

Body:

```json
{
  "banned": true
}
```

Expected result:

- Status `200 OK`
- response contains updated `user`

Security test:

- admin cannot suspend their own account -> `403`

### D. List listings in admin view

Method: `GET`

URL:

```text
{{baseUrl}}/api/admin/listings?limit=50&offset=0
```

Headers:

```http
Authorization: Bearer {{adminToken}}
```

Expected result:

- Status `200 OK`
- response contains `items`

### E. Delete any listing as admin

Method: `DELETE`

URL:

```text
{{baseUrl}}/api/admin/listings/{{listingId}}
```

Headers:

```http
Authorization: Bearer {{adminToken}}
```

Expected result:

- Status `204 No Content`

### F. List swap records

Method: `GET`

URL:

```text
{{baseUrl}}/api/admin/swaps?status=PENDING&limit=50&offset=0
```

Headers:

```http
Authorization: Bearer {{adminToken}}
```

Expected result:

- Status `200 OK`
- response contains `swaps`

### G. Force swap status as admin

Method: `PATCH`

URL:

```text
{{baseUrl}}/api/admin/swaps/{{swapId}}/status
```

Headers:

```http
Authorization: Bearer {{adminToken}}
Content-Type: application/json
```

Body:

```json
{
  "status": "CANCELLED"
}
```

Allowed values:

- `CANCELLED`
- `COMPLETED`

Expected result:

- Status `200 OK`
- response contains updated `swap`

---

## 9) Socket / real-time chat tests

The app also exposes Socket.IO chat events.

Relevant event names:

- `swap:join`
- `message:send`
- `message:new`
- `swap:updated`

Use a Postman WebSocket request and connect to the server socket endpoint.

Example:

```text
ws://localhost:4000
```

Then emit/join events after authentication using the same JWT/session flow used by the web client.

If you are not using sockets, the REST fallback is already supported:

- `GET /api/swaps/:id/messages?after=...`
- `POST /api/swaps/:id/messages`

---

## 10) Common validation checklist

Run these validation checks during API testing:

- login with bad credentials and verify `401`
- register with invalid data and verify `400`
- create a listing without photo and verify `400`
- request swap for your own item and verify failure
- accept swap from wrong account and verify failure
- create two requests for one item; accept one and verify the other is cancelled
- chat in two browser sessions or with REST polling
- complete a swap and check both items appear as swapped
- admin can read KPIs and manage bans/listings/swaps

---

## 11) Recommended Postman order

1. Register or login
2. Save `{{token}}`
3. Get user profile
4. Create listing with image
5. Read listing(s)
6. Request swap
7. Update swap status
8. Send message
9. Login as admin and test admin endpoints

---

## 12) Notes

- File uploads use `multipart/form-data` and field name `images`.
- Protected endpoints require `Authorization: Bearer <token>`.
- Most endpoints return JSON in the shape `{ ... }` and some return `204 No Content` for deletes.
- The server supports both Postgres and Mongo configuration via environment variables, but the routes remain the same.
