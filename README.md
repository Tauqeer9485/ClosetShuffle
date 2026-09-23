# ClosetShuffle: Clothing Exchange & Swap Marketplace (starter)

React frontend + Node/Express API. The database and image storage are chosen by environment variables,
so the same code runs on Render, a VM (AWS EC2, DigitalOcean...), Docker, or your laptop.

```
ClosetShuffle/
  server/   Express API, Socket.io chat, DB + storage adapters
  client/   React (Vite) app
  docker-compose.yml   Postgres + API in one command
```

## Run locally

```bash
# 1. API
cd server
cp .env.example .env          # edit DATABASE_URL (or use docker compose below)
npm install
npm run seed                  # demo users + listings (password: Demo@12345), admin from ADMIN_EMAIL
npm run dev                   # http://localhost:4000/health

# 2. Frontend (new terminal)
cd client
cp .env.example .env
npm install
npm run dev                   # http://localhost:5173
```

No local Postgres? From the repo root: `docker compose up --build` starts Postgres and the API.

## Switching database and storage (config only, no code changes)

| Setting | Options | Notes |
|---|---|---|
| `DB_TYPE` + `DATABASE_URL` | `postgres` / `mongo` | Postgres: any host (Supabase, Neon, RDS, local). Mongo: Atlas or self-hosted. Tables/indexes are created on startup. |
| `STORAGE_DRIVER` | `local` / `cloudinary` / `s3` | `s3` also covers Cloudflare R2, MinIO, DigitalOcean Spaces via `S3_ENDPOINT`. |
| `CLIENT_URL` | comma-separated origins | Must include your deployed frontend URL (CORS). |
| `VITE_API_URL` (client) | API base URL | The only frontend deployment setting. |

Both database adapters expose the same methods (`server/src/db/postgres.js`, `mongo.js`), and storage
drivers share `save()` / `remove()` (`server/src/storage/`). Routes never import a database or SDK directly,
so adding another backend means adding one file and one line in `db/index.js` or `storage/index.js`.

Note: with `STORAGE_DRIVER=local`, uploads live on the server disk. Free hosts wipe that disk on restart,
so use `cloudinary` or `s3` for anything you deploy for evaluation.

## Deploy recipes

**Managed (free tiers):** API on Render (Web Service, root `server`, start `npm start`), frontend on Vercel
(root `client`, set `VITE_API_URL`), database on Neon/Supabase (Postgres) or Atlas (Mongo), images on Cloudinary.
Set `NODE_ENV=production`, `JWT_SECRET`, `CLIENT_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.

**Your own server / VM:** `docker compose up -d --build` (or run `node src/index.js` under PM2), put Nginx with
HTTPS in front, and forward WebSocket upgrade headers so chat works. Build the client with `npm run build`
and serve `client/dist` from Nginx or any static host.

**Serverless-only hosting:** REST works everywhere. Socket.io needs a long-running server, so poll
`GET /api/swaps/:id/messages?after=...` instead (already supported).

## API summary

| Area | Endpoints |
|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login` |
| Profile | `GET/PATCH /api/users/profile` |
| Listings | `GET /api/listings` (q, category, size, condition, lat, lng, maxDistance), `POST /api/listings` (multipart, field `images`), `GET/PUT/DELETE /api/listings/:id`, `POST /api/listings/calculate-value`, `GET /api/listings/suggestions?listingId=` |
| Swaps | `POST /api/swaps/request`, `GET /api/swaps`, `GET /api/swaps/:id`, `PATCH /api/swaps/:id/status`, `GET/POST /api/swaps/:id/messages` |
| Chat (socket) | events `swap:join`, `message:send`, `message:new`, `swap:updated` |
| Admin | `GET /api/admin/stats`, `users`, `listings`, `swaps`; `PATCH users/:id/ban`; `DELETE listings/:id`; `PATCH swaps/:id/status` |

Swap flow: `PENDING` to `ACCEPTED` / `REJECTED` / `CANCELLED`, then `ACCEPTED` to `COMPLETED` (or `CANCELLED`).
Accepting reserves both items with an atomic update, so two people cannot claim the same item, and it cancels other
open requests for those items.

Swap value = category base x brand tier x condition (`server/src/constants.js`, editable). Values are "points".
Categories Dresses and Ethnic Wear were added to the spec's list.

## What is done vs still to build

Done: schema, auth, listings with image upload, value calculator, radius search, fair-swap suggestions, swap
state machine, chat (socket + REST), admin API with KPIs, seed data, Docker.
Client: login/register and browse/filter/nearby, item detail. The Swap Request, Chat, Dashboard and Admin pages
are stubs with TODO comments listing the exact endpoints to call.

This starter has not been run against a live database yet. First run: `npm run seed`, then try the flow with the
demo accounts (`aarav@closetshuffle.test` and `neha@closetshuffle.test`, password `Demo@12345`).

## Test checklist before submission

Register/login with bad input; create a listing with and without photos; browse with filters and nearby;
request a swap for your own item (should fail); accept from the wrong account (should fail); two requests for
one item, accept one (the other cancels); chat in two browsers; complete a swap and check both items show as
swapped; admin: delete a listing, ban a user, read KPIs; open the live link in a private window on your phone.
