# AutoSphere Backend

Express API used by the AutoSphere web app. Supports **optional MongoDB**: when `MONGODB_URI` is set, dashboard, profile, trips, vehicle health, insurance, and mobility score are stored in the database. Profile changes from the web app are saved to the DB and reflected on the next load. Without a database, the server uses in-memory mock data.

## Prerequisites

- **Node.js** 18+
- **MongoDB** (optional) — for persisting data

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and set `JWT_SECRET`, `PORT`. To use the database, set `MONGODB_URI` (e.g. `mongodb://localhost:27017/autosphere`).

3. **Seed the database** (only when using MongoDB): run once to insert sample driver data (profile, trips, vehicle health, insurance, mobility score):
   ```bash
   npm run seed
   ```

## Start the server

From the backend directory (`autosphere_full_production_monorepo/services/backend`):

```bash
npm start
```

Or run directly:

```bash
node src/server.js
```

Server runs at **http://localhost:3000**. Keep this running while using the web app. The web app (Vite) proxies `/api` and `/auth` to this port in development.

## API

When MongoDB is connected, data is read from and written to the database. Profile updates (e.g. from the Driver Settings/Onboarding screen) are persisted and reflected on the website and in the DB.

- `GET /api/dashboard?driverId=driver1` — Dashboard summary (aggregated from DB when connected)
- `GET /api/mobility-score?driverId=driver1` — Mobility score breakdown
- `GET /api/trips?driverId=driver1&limit=20` — Trip history
- `GET /api/vehicle-health?driverId=driver1` — Vehicle and component health
- `GET /api/insurance?driverId=driver1` — Insurance policy
- `GET /api/drivers` — List drivers
- `GET /api/profile?driverId=driver1` — Driver profile
- `PUT /api/profile?driverId=driver1` — Save profile (persisted to DB when connected)

Default `driverId` is `driver1` if omitted.

## Auth

- `POST /auth/login` — Body: `{ "email": "..." }`. Returns JWT.
