# GoldCinema — Backend

Express API for GoldCinema. See the [root README](../README.md) for full project docs.

## Scripts

- `npm run dev` — start with `node --watch` (auto-restarts on file changes)
- `npm start` — start normally
- `npm test` — run the integration test suite

## API reference

All routes are prefixed with `/api`. Authenticated routes expect `Authorization: Bearer <token>`.

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | - | Liveness check |
| POST | `/auth/register` | - | Create an account, returns `{ token, user }` |
| POST | `/auth/login` | - | `{ token, user }` |
| GET | `/auth/me` | ✓ | Current user |
| GET | `/movies` | - | List all movies |
| GET | `/movies/:id` | - | Movie detail |
| GET | `/movies/:id/showtimes` | - | Showtimes for a movie (seat counts only) |
| GET | `/showtimes/:id` | - | Full showtime detail including seat map |
| POST | `/bookings` | ✓ | `{ showtimeId, seatIds[] }` → creates a pending booking, holds seats 10 min |
| GET | `/bookings/mine` | ✓ | Current user's booking history |
| GET | `/bookings/:id` | ✓ | Single booking (must be owned by requester) |
| POST | `/payments/stripe/create-intent` | ✓ | `{ bookingId }` → `{ clientSecret }` |
| POST | `/payments/stripe/confirm` | ✓ | `{ bookingId, paymentIntentId }` → finalizes booking |
| POST | `/payments/stripe/webhook` | - (Stripe-signed) | Canonical payment confirmation for production |
| POST | `/payments/paypal/create-order` | ✓ | `{ bookingId }` → `{ orderID }` |
| POST | `/payments/paypal/capture-order` | ✓ | `{ bookingId, orderID }` → finalizes booking |