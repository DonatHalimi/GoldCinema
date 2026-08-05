# Frontend Source

This folder contains the React frontend for GoldCinema.

## Main structure

- `main.jsx` boots the app, wraps it in the router and auth provider, and renders the toast container.
- `App.jsx` defines the main routes and global layout.
- `api/client.js` is the shared Axios client for backend calls.
- `context/AuthContext.jsx` stores the current authenticated user session.
- `components/` contains reusable UI pieces such as `Navbar`, `MovieCard`, `SeatMap`, `StripeCheckout`, `PaypalCheckout`, `CrudModal`, and `ModuleDataGrid`.
- `pages/` contains the route-level screens for browsing movies, selecting seats, checking out, and managing account/admin flows.

## Typical usage

1. Open the home page to browse movies.
2. Pick a movie and select a showtime.
3. Choose seats and reserve them.
4. Continue to the payment page.
5. Confirm the order and view the ticket details.

## Development

From the frontend folder:

```bash
npm install
npm run dev
```