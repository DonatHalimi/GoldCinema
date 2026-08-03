# GoldCinema — Frontend

Vite + React client for GoldCinema. See the [root README](../README.md) for full project docs,
environment variables, and architecture notes.

## Scripts

- `npm run dev` — start the dev server (http://localhost:3000)
- `npm run build` — production build to `dist/`
- `npm run preview` — preview the production build locally

## Structure

```
src/
├── api/client.js          Axios instance (attaches JWT, normalizes errors)
├── context/AuthContext.jsx Auth state + login/register/logout
├── components/             Shared UI: Navbar, SeatMap, MovieCard, Stripe/PayPal checkout
├── pages/                  One file per route
└── App.jsx                 Route table
```
