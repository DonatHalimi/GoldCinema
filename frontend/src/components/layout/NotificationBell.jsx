import { AnimatePresence, motion, useAnimationControls } from 'framer-motion';
import { Bell, CheckCheck, ChevronRight, Settings, Shield, Tag, Ticket } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';

const bellShake = {
    rotate: [0, -18, 14, -10, 8, -5, 3, 0],
    transition: { duration: 0.9, ease: 'easeInOut' },
};

export default function NotificationBell() {
    const { t } = useTranslation('account');
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const bellControls = useAnimationControls();
    const prevUnreadRef = useRef(unreadCount);

    useEffect(() => {
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (unreadCount > prevUnreadRef.current) {
            bellControls.start(bellShake);
        }
        prevUnreadRef.current = unreadCount;
    }, [unreadCount, bellControls]);

    const handleToggle = () => {
        setOpen((prev) => {
            if (!prev) bellControls.start(bellShake);
            return !prev;
        });
    };

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
        if (diffMins < 1) return t('justNow');
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
                onClick={handleToggle}
                title={t('notificationsTitle')}
                aria-label={t('notificationsTitle')}
                className="group relative flex h-8 w-8 items-center justify-center rounded-lg text-marquee-muted transition-colors duration-200 hover:bg-white/[0.03] hover:text-marquee-gold focus:outline-none"
            >
                <motion.span
                    animate={bellControls}
                    style={{ originX: 0.5, originY: 0.15, display: 'inline-flex' }}
                >
                    <Bell size={16} />
                </motion.span>

                {unreadCount > 0 && (
                    <motion.span
                        key={unreadCount}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: [0, 1.3, 1], opacity: 1 }}
                        transition={{ duration: 0.4, ease: 'backOut' }}
                        className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-marquee-gold px-1 text-[9px] font-bold text-marquee-bg shadow-sm"
                    >
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </motion.span>
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
                                <h3 className="font-semibold text-marquee-cream text-sm">{t('notificationsTitle')}</h3>
                                {unreadCount > 0 && (
                                    <span className="rounded-full bg-marquee-gold/20 px-2 py-0.5 text-xs text-marquee-gold font-medium">
                                        {unreadCount} {t('newNotifications')}
                                    </span>
                                )}
                            </div>

                            {unreadCount > 0 && (
                                <button onClick={markAllAsRead} className="flex items-center gap-1 text-xs text-marquee-muted transition hover:text-marquee-gold">
                                    <CheckCheck size={14} />
                                    {t('markAllAsRead')}
                                </button>
                            )}
                        </div>

                        <div className="max-h-80 overflow-y-auto divide-y divide-marquee-line/50">
                            {recentNotifications.length === 0 ? (
                                <div className="px-4 py-8 text-center text-marquee-muted text-sm">
                                    <Bell className="mx-auto mb-2 opacity-30" size={28} />
                                    <p>{t('noNotifications')}</p>
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

                        <div className="flex items-center justify-between border-t border-marquee-line bg-marquee-panel2/50 px-3 py-2.5">
                            <Link
                                to="/account/notifications"
                                onClick={() => setOpen(false)}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-marquee-gold transition hover:text-marquee-goldBright"
                            >
                                {t('viewAllNotifications')}
                                <ChevronRight size={14} />
                            </Link>

                            <Link
                                to="/account/notifications"
                                onClick={() => setOpen(false)}
                                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-marquee-muted transition hover:bg-white/[0.03] hover:text-marquee-gold"
                            >
                                <Settings size={13} />
                                {t('notificationSettings')}
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}