import { Navigate, Route, Routes } from 'react-router-dom';
import Home from '../../pages/Home';
import MovieDetail from '../../pages/MovieDetail';
import SeatSelection from '../../pages/SeatSelection';
import Login from '../../pages/Login';
import Register from '../../pages/Register';
import VerifyEmail from '../../pages/VerifyEmail';
import ResetPassword from '../../pages/ResetPassword';
import Checkout from '../../pages/Checkout';
import Confirmation from '../../pages/Confirmation';
import Account from '../../pages/Account';
import NotFound from '../../pages/NotFound';
import RequireAuth from '../guards/RequireAuth';
import RequireGuest from '../guards/RequireGuest';
import RequireAdmin from '../guards/RequireAdmin';
import ProfileSettings from '../../components/account/settings/ProfileSettings';
import SecuritySettings from '../../components/account/settings/SecuritySettings';
import Notifications from '../../components/account/content/Notifications';
import TicketsContent from '../../components/account/content/TicketContent';
import Sessions from '../../components/account/session/Sessions';
import DangerZone from '../../components/account/content/DangerZone';
import ContactPage from '../../pages/Contact';
import AdminDashboard from '../../pages/AdminDashboard';

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movies/:id" element={<MovieDetail />} />
            <Route path="/showtimes/:id" element={<SeatSelection />} />

            <Route
                path="/login"
                element={
                    <RequireGuest>
                        <Login />
                    </RequireGuest>
                }
            />
            <Route
                path="/register"
                element={
                    <RequireGuest>
                        <Register />
                    </RequireGuest>
                }
            />
            <Route
                path="/verify-email"
                element={
                    <RequireGuest>
                        <VerifyEmail />
                    </RequireGuest>
                }
            />
            <Route
                path="/reset-password"
                element={
                    <RequireGuest>
                        <ResetPassword />
                    </RequireGuest>
                }
            />

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
                path="/account"
                element={
                    <RequireAuth>
                        <Account />
                    </RequireAuth>
                }
            >
                <Route index element={<Navigate to="profile" replace />} />
                <Route path="profile" element={<ProfileSettings />} />
                <Route path="security" element={<SecuritySettings />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="tickets" element={<TicketsContent />} />
                <Route path="sessions" element={<Sessions />} />
                <Route path="danger" element={<DangerZone />} />
            </Route>

            <Route path="/contact" element={<ContactPage />} />

            <Route
                path="/admin/:moduleName?"
                element={
                    <RequireAdmin>
                        <AdminDashboard />
                    </RequireAdmin>
                }
            />

            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}