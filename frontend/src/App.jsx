import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import RequireAuth from './components/RequireAuth';
import Home from './pages/Home';
import MovieDetail from './pages/MovieDetail';
import SeatSelection from './pages/SeatSelection';
import Checkout from './pages/Checkout';
import Confirmation from './pages/Confirmation';
import MyTickets from './pages/MyTickets';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import AdminDashboard from './pages/AdminDashboard';
import RequireAdmin from './components/RequireAdmin';

export default function App() {
  return (
    <div className="min-h-screen bg-marquee-bg">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movies/:id" element={<MovieDetail />} />
          <Route path="/showtimes/:id" element={<SeatSelection />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/checkout/:orderId"
            element={
              <RequireAuth>
                <Checkout />
              </RequireAuth>
            }
          />
          <Route
            path="/confirmation/:orderId"
            element={
              <RequireAuth>
                <Confirmation />
              </RequireAuth>
            }
          />
          <Route
            path="/tickets"
            element={
              <RequireAuth>
                <MyTickets />
              </RequireAuth>
            }
          />

          <Route
            path="/admin/:moduleName?"
            element={
              <RequireAdmin>
                <AdminDashboard />
              </RequireAdmin>
            }
          />

          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer className="border-t border-marquee-line py-8 text-center text-xs text-marquee-muted">
        &copy; {new Date().getFullYear()} GoldCinema. All rights reserved. |{' '}
        <a
          href="https://github.com/DonatHalimi"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Donat Halimi
        </a>
      </footer>
    </div>
  );
}

function NotFound() {
  return (
    <div className="py-24 text-center">
      <p className="font-display text-5xl text-marquee-goldBright">404</p>
      <p className="mt-2 text-marquee-muted">This reel doesn't exist.</p>
    </div>
  );
}