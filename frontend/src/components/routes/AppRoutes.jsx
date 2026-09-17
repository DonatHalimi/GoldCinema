import { Navigate, Route, Routes } from 'react-router-dom';
import DangerZone from '../../components/account/content/DangerZone';
import Notifications from '../../components/account/content/Notifications';
import TicketsContent from '../../components/account/content/TicketContent';
import Sessions from '../../components/account/session/Sessions';
import ProfileSettings from '../../components/account/settings/ProfileSettings';
import SecuritySettings from '../../components/account/settings/SecuritySettings';
import Account from '../../pages/Account';
import AdminDashboard from '../../pages/AdminDashboard';
import BuyGiftCard from '../../pages/BuyGiftCard';
import Checkout from '../../pages/Checkout';
import Cinema from '../../pages/Cinema';
import Confirmation from '../../pages/Confirmation';
import ContactPage from '../../pages/Contact';
import Favourites from '../../pages/Favourites';
import Home from '../../pages/Home';
import Login from '../../pages/Login';
import MovieDetails from '../../pages/MovieDetails';
import MyReviews from '../../pages/MyReviews';
import NotFound from '../../pages/NotFound';
import Register from '../../pages/Register';
import ResetPassword from '../../pages/ResetPassword';
import SeatSelection from '../../pages/SeatSelection';
import VerifyEmail from '../../pages/VerifyEmail';
import RequireAdmin from '../guards/RequireAdmin';
import RequireAuth from '../guards/RequireAuth';
import RequireGuest from '../guards/RequireGuest';
import PaymentMethods from '../payments/PaymentMethods';

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movies/:id" element={<MovieDetails />} />
            <Route path="/showtimes/:id" element={<SeatSelection />} />
            <Route path="/cinemas/:id" element={<Cinema />} />

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
                path="/gift-cards"
                element={
                    <RequireAuth>
                        <BuyGiftCard />
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
                <Route path="favourites" element={<Favourites />} />
                <Route path="reviews" element={<MyReviews />} />
                <Route path="payments" element={<PaymentMethods />} />
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