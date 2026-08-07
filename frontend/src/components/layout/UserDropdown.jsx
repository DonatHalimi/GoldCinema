import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Ticket, LayoutDashboard, LogOut, ChevronDown, Settings, User2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';

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
                className="flex items-center gap-2 rounded-full border border-marquee-line bg-marquee-panel2 px-2 py-1 text-marquee-cream transition hover:border-marquee-gold"
            >
                <Avatar
                    name={user?.name}
                    avatar={user?.avatar}
                    size="sm"
                />

                <span>{displayName}</span>

                <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="absolute right-0 mt-3 w-60 overflow-hidden rounded-xl border border-marquee-line bg-marquee-panel shadow-2xl z-50 origin-top"
                    >
                        <div className="flex items-center gap-3 border-b border-marquee-line px-3 py-4">
                            <Avatar
                                name={user?.name}
                                avatar={user?.avatar}
                                size="sm"
                            />

                            <div className="min-w-0">
                                <p className="truncate font-semibold text-marquee-cream">
                                    {displayName}
                                </p>

                                <p className="truncate text-xs text-marquee-muted">
                                    {user.email}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col px-1">
                            <Link
                                to="/account"
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 text-sm text-marquee-muted transition hover:bg-marquee-panel2 hover:text-marquee-gold"
                            >
                                <User2 size={18} />
                                Account
                            </Link>

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
                                to="/account/tickets"
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
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}