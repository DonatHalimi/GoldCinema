import { Routes, Route, Navigate } from 'react-router-dom';
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
import ProfileSettings from '../../components/account/ProfileSettings';
import SecuritySettings from '../../components/account/SecuritySettings';
import Notifications from '../../components/account/Notifications';
import TicketsContent from '../../components/account/TicketContent';
import Sessions from '../../components/account/Sessions';
import DangerZone from '../../components/account/DangerZone';
import AdminDashboard from '../../pages/AdminDashboard';
import RequireAuth from '../guards/RequireAuth';
import RequireAdmin from '../guards/RequireAdmin';
import NotFound from '../../pages/NotFound';

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movies/:id" element={<MovieDetail />} />
            <Route path="/showtimes/:id" element={<SeatSelection />} />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/reset-password" element={<ResetPassword />} />

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