import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Ticket, LayoutDashboard, LogOut, ChevronDown, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function UserDropdown() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    const displayName = user?.name
        ? user.name.split(' ')[0]
        : user?.email?.split('@')[0] || 'User';

    useEffect(() => {
        function handleClickOutside(e) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target)
            ) {
                setOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const isAdmin =
        user.role === 'admin' ||
        user.role?.name?.toLowerCase() === 'admin';

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full border border-marquee-line bg-marquee-panel2 px-4 py-2 text-marquee-cream transition hover:border-marquee-gold"
            >
                <User size={18} />

                <span>{displayName}</span>

                <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                />
            </button>

            {open && (
                <div className="absolute right-0 mt-3 w-60 overflow-hidden rounded-xl border border-marquee-line bg-marquee-panel shadow-2xl">
                    <div className="border-b border-marquee-line px-4 py-4">
                        <p className="font-semibold text-marquee-cream">
                            {displayName}
                        </p>

                        <p className="mt-1 text-xs text-marquee-muted">
                            {user.email}
                        </p>
                    </div>

                    {isAdmin && (
                        <Link
                            to="/admin/users"
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 text-sm text-marquee-muted transition hover:bg-marquee-panel2 hover:text-marquee-gold"
                        >
                            <LayoutDashboard size={18} />
                            Dashboard
                        </Link>
                    )}

                    <Link
                        to="/account"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-marquee-muted transition hover:bg-marquee-panel2 hover:text-marquee-gold"
                    >
                        <Settings size={18} />
                        Account
                    </Link>

                    <Link
                        to="/tickets"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-marquee-muted transition hover:bg-marquee-panel2 hover:text-marquee-gold"
                    >
                        <Ticket size={18} />
                        My Tickets
                    </Link>

                    <button
                        onClick={() => {
                            setOpen(false);
                            logout();
                            navigate('/');
                        }}
                        className="flex w-full items-center gap-3 border-t border-marquee-line px-4 py-3 text-left text-sm text-red-400 transition hover:bg-red-500/10"
                    >
                        <LogOut size={18} />
                        Log out
                    </button>
                </div>
            )}
        </div>
    );
}