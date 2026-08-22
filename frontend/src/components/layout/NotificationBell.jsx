import { AnimatePresence, motion } from 'framer-motion';
import { Bell, CheckCheck, ChevronRight, Shield, Tag, Ticket } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';

export default function NotificationBell() {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getTypeIcon = (type) => {
        switch (type) {
            case 'purchase':
                return <Ticket size={16} className="text-marquee-gold" />;
            case 'login':
                return <Shield size={16} className="text-marquee-gold" />;
            case 'promo':
                return <Tag size={16} className="text-marquee-gold" />;
            default:
                return <Bell size={16} className="text-marquee-gold" />;
        }
    };

    const getRelativeTime = (dateStr) => {
        if (!dateStr) return '';
        const diffMs = Date.now() - new Date(dateStr).getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    };

    const handleNotificationClick = (item) => {
        if (!item.read) {
            markAsRead(item._id, false);
        }
        setOpen(false);
        if (item.link) {
            navigate(item.link);
        } else {
            navigate('/account/notifications');
        }
    };

    const recentNotifications = notifications.slice(0, 5);

    return (
        <div ref={dropdownRef} className="relative">
            <button
                onClick={() => setOpen((prev) => !prev)}
                title="Notifications"
                aria-label="Notifications"
                className="relative flex items-center justify-center rounded-full p-2 text-marquee-muted transition hover:bg-marquee-panel hover:text-marquee-gold focus:outline-none"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-marquee-gold text-[10px] font-bold text-black shadow-lg animate-pulse">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="absolute right-0 mt-3 w-80 sm:w-96 overflow-hidden rounded-xl border border-marquee-line bg-marquee-panel shadow-2xl z-50 origin-top"
                    >
                        <div className="flex items-center justify-between border-b border-marquee-line px-4 py-3 bg-marquee-panel2">
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-marquee-cream text-sm">Notifications</h3>
                                {unreadCount > 0 && (
                                    <span className="rounded-full bg-marquee-gold/20 px-2 py-0.5 text-xs text-marquee-gold font-medium">
                                        {unreadCount} new
                                    </span>
                                )}
                            </div>

                            {unreadCount > 0 && (
                                <button onClick={markAllAsRead} className="flex items-center gap-1 text-xs text-marquee-muted transition hover:text-marquee-gold">
                                    <CheckCheck size={14} />
                                    Mark all read
                                </button>
                            )}
                        </div>

                        <div className="max-h-80 overflow-y-auto divide-y divide-marquee-line/50">
                            {recentNotifications.length === 0 ? (
                                <div className="px-4 py-8 text-center text-marquee-muted text-sm">
                                    <Bell className="mx-auto mb-2 opacity-30" size={28} />
                                    <p>No notifications yet</p>
                                </div>
                            ) : (
                                recentNotifications.map((item) => (
                                    <div
                                        key={item._id}
                                        onClick={() => handleNotificationClick(item)}
                                        className={`group flex items-start gap-3 p-3.5 transition cursor-pointer ${!item.read
                                            ? 'bg-marquee-gold/5 hover:bg-marquee-gold/10'
                                            : 'hover:bg-marquee-panel2/60'
                                            }`}
                                    >
                                        <div className="mt-0.5 rounded-lg bg-marquee-bg p-2 border border-marquee-line/60">
                                            {getTypeIcon(item.type)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-1">
                                                <p className={`text-xs font-semibold truncate ${!item.read ? 'text-marquee-goldBright' : 'text-marquee-cream'}`}>
                                                    {item.title}
                                                </p>
                                                <span className="text-[10px] text-marquee-muted shrink-0">
                                                    {getRelativeTime(item.createdAt)}
                                                </span>
                                            </div>
                                            <p className="mt-0.5 text-xs text-marquee-muted line-clamp-2 leading-relaxed">
                                                {item.message}
                                            </p>
                                        </div>

                                        {!item.read && <span className="h-2 w-2 rounded-full bg-marquee-gold shrink-0 mt-1.5" />}
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="border-t border-marquee-line bg-marquee-panel2/50 p-2.5 text-center">
                            <Link
                                to="/account/notifications"
                                onClick={() => setOpen(false)}
                                className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-marquee-gold transition hover:text-marquee-goldBright"
                            >
                                View all notifications
                                <ChevronRight size={14} />
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}