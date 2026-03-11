# AutoSphere Backend

Express API used by the AutoSphere web app. **No database** — all API responses use in-memory mock data. You can add a database later and wire these routes to it.

## Prerequisites

- **Node.js** 18+

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. (Optional) Copy `.env.example` to `.env` and set `JWT_SECRET` and `PORT` if needed.

3. Start the server:
   ```bash
   npm start
   ```

Server runs at **http://localhost:3000**. The web app (Vite) proxies `/api` and `/auth` to this port in development.

## API (mock data, no database)

- `GET /api/dashboard?driverId=driver1` — Dashboard summary
- `GET /api/mobility-score?driverId=driver1` — Mobility score breakdown
- `GET /api/trips?driverId=driver1&limit=20` — Trip history
- `GET /api/vehicle-health?driverId=driver1` — Vehicle and component health
- `GET /api/insurance?driverId=driver1` — Insurance policy
- `GET /api/drivers` — List drivers
- `GET /api/profile?driverId=driver1` — Driver profile (in-memory; reset on server restart)
- `PUT /api/profile?driverId=driver1` — Save profile (in-memory only until you add a database)

Default `driverId` is `driver1` if omitted.

## Auth

- `POST /auth/login` — Body: `{ "email": "..." }`. Returns JWT.
