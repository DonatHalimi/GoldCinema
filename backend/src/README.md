# Backend Source

This folder contains the Express + MongoDB API for GoldCinema.

## Main structure

- `app.js` sets up the server, CORS, security middleware, rate limiting, and the main API route mounting.
- `routes/` exposes the API endpoints for auth, movies, showtimes, seat holds, orders, payments, and admin CRUD.
- `controllers/` contains reusable request handlers, especially the admin factory helpers.
- `middleware/` includes auth guards and the centralized error handler.
- `models/` defines the MongoDB schemas for users, roles, movies, showtimes, orders, seats, and related domain objects.
- `utils/` contains supporting services for emails, JWTs, QR tickets, Stripe, PayPal, and seat availability calculations.
- `db/` and `config/` handle database connection and startup configuration.

## Request flow

1. Requests enter through `app.js`.
2. Route files handle the endpoint and call the right controller/service logic.
3. Models interact with MongoDB.
4. Payments, verification emails, and ticket generation are handled through the `utils/` layer.

## Common API areas

- `auth` handles registration, login, refresh tokens, email verification, and session cookies.
- `movies` exposes public movie listings and showtime data.
- `showtimes` provides seat availability and showtime details.
- `seatHold` manages temporary seat reservation holds.
- `orders` creates and fetches customer orders.
- `payments` covers Stripe and PayPal checkout flows.
- `adminRoutes` provides generic CRUD endpoints for admin operations.

## Development

From the backend folder:

```bash
npm install
npm run dev
```