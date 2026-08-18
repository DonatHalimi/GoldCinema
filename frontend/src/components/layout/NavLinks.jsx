import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from './NotificationBell';
import UserDropdown from './UserDropdown';

export default function NavLinks() {
    const { user } = useAuth();

    return (
        <nav className="flex items-center gap-4 font-body text-sm">
            <Link to="/" className="text-marquee-muted transition hover:text-marquee-gold mr-2">
                Now Showing
            </Link>

            {!user ? (
                <Link to="/login" className="rounded-full bg-marquee-gold px-5 py-1.5 font-semibold text-marquee-bg transition hover:bg-marquee-goldBright">
                    Sign in
                </Link>
            ) : (
                <div className="flex items-center gap-3">
                    <NotificationBell />
                    <UserDropdown />
                </div>
            )}
        </nav>
    );
}