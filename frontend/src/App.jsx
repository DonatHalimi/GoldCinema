import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import RequireAuth from './components/guards/RequireAuth';
import Home from './pages/Home';
import MovieDetail from './pages/MovieDetail';
import SeatSelection from './pages/SeatSelection';
import Checkout from './pages/Checkout';
import Confirmation from './pages/Confirmation';
import MyTickets from './pages/MyTickets';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/AdminDashboard';
import RequireAdmin from './components/guards/RequireAdmin';
import { ToastContainer } from 'react-toastify';
import Account from './pages/Account';
import ProfileSettings from './components/account/ProfileSettings';
import SecuritySettings from './components/account/SecuritySettings';
import Notifications from './components/account/Notifications';
import Sessions from './components/account/Sessions';
import DangerZone from './pages/DangerZone';
import { Navigate } from 'react-router-dom';
import { Footer } from './components/layout/Footer';

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
          {/* <Route
            path="/tickets"
            element={
              <RequireAuth>
                <MyTickets />
              </RequireAuth>
            }
          /> */}

          <Route
            path="/admin/:moduleName?"
            element={
              <RequireAdmin>
                <AdminDashboard />
              </RequireAdmin>
            }
          />

          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/account" element={<Account />}>
            <Route index element={<Navigate to="profile" replace />} />
            <Route path="profile" element={<ProfileSettings />} />
            <Route path="security" element={<SecuritySettings />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="tickets" element={<MyTickets />} />
            <Route path="sessions" element={<Sessions />} />
            <Route path="danger" element={<DangerZone />} />
          </Route>

          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<NotFound />} />
        </Routes>

        <ToastContainer
          position="top-right"
          autoClose={4000}
          newestOnTop
          stacked
          limit={5}
          theme="dark"
        />
      </main>
      <Footer />
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