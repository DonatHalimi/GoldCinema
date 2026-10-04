import { motion } from 'framer-motion';
import {
    Archive,
    ArchiveRestore,
    ExternalLink,
    MailCheck,
    MailOpen,
    Trash2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
    formatDate,
    getTypeIcon,
} from '../../utils/notificationHelpers';

export default function NotificationItem({
    notification,
    onMarkRead,
    onToggleArchive,
    onDeleteRequest,
}) {
    const { t } = useTranslation('account');
    const navigate = useNavigate();

    const {
        _id,
        read,
        archived,
        type,
        title,
        message,
        createdAt,
        link,
        metadata,
    } = notification;

    const Icon = getTypeIcon(type);

    const handleToggleRead = () => onMarkRead(_id, !read);
    const handleToggleArchive = () => onToggleArchive(_id, !archived);
    const handleDeleteClick = () => onDeleteRequest(_id, title);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
                type: 'spring',
                stiffness: 380,
                damping: 30,
            }}
            className={`group flex flex-col justify-between gap-4 rounded-xl border p-4 shadow-lg transition-colors duration-200 hover:-translate-y-0.5 sm:flex-row sm:items-center ${!read && !archived
                ? 'border-marquee-gold/50 bg-marquee-gold/5 hover:border-marquee-gold'
                : 'border-marquee-line bg-marquee-bg hover:border-marquee-gold'
                }`}
        >
            <div className="flex min-w-0 items-start gap-3">
                <div className="mt-0.5 shrink-0 rounded-lg border border-marquee-line/60 bg-marquee-bg p-2.5">
                    <Icon
                        size={18}
                        className="text-marquee-gold"
                    />
                </div>

                <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                        <h4 className="truncate text-sm font-semibold text-marquee-cream">
                            {t(title)}
                        </h4>

                        {!read && !archived && (
                            <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-marquee-gold" />
                        )}

                        <span className="shrink-0 text-xs text-marquee-muted">
                            • {formatDate(createdAt)}
                        </span>
                    </div>

                    <p className="text-xs leading-relaxed text-marquee-muted">
                        {t(message, {
                            movieTitle: metadata?.movieTitle,
                            seatStr: metadata?.seatStr,
                            amount: metadata?.formattedAmount,
                        })}
                    </p>
                </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
                {/* View */}
                {link && (
                    <button
                        type="button"
                        onClick={() => navigate(link)}
                        aria-label="View notification"
                        className="group/action relative inline-flex items-center gap-1 rounded-lg border border-marquee-gold/30 bg-marquee-gold/10 px-2.5 py-1.5 text-xs font-semibold text-marquee-gold transition hover:bg-marquee-gold hover:text-black"
                    >
                        View
                        <ExternalLink size={12} />

                        <span className="pointer-events-none absolute right-0 top-full z-20 mt-2 whitespace-nowrap rounded-md border border-marquee-gold/20 bg-marquee-panel2 px-2.5 py-1.5 text-xs font-normal text-marquee-gold opacity-0 shadow-xl transition-opacity group-hover/action:opacity-100">
                            View notification
                        </span>
                    </button>
                )}

                {/* Mark Read / Unread */}
                <button
                    type="button"
                    onClick={handleToggleRead}
                    aria-label={read ? 'Mark as Unread' : 'Mark as Read'}
                    className="group/action relative rounded-lg border border-marquee-line bg-marquee-panel2 p-1.5 text-marquee-muted transition hover:border-marquee-gold hover:text-marquee-gold"
                >
                    {read ? (
                        <MailOpen size={15} />
                    ) : (
                        <MailCheck size={15} />
                    )}

                    <span className="pointer-events-none absolute right-0 top-full z-20 mt-2 whitespace-nowrap rounded-md border border-marquee-line bg-marquee-panel2 px-2.5 py-1.5 text-xs text-marquee-cream opacity-0 shadow-xl transition-opacity group-hover/action:opacity-100">
                        {read ? 'Mark as Unread' : 'Mark as Read'}
                    </span>
                </button>

                {/* Archive / Unarchive */}
                <button
                    type="button"
                    onClick={handleToggleArchive}
                    aria-label={archived ? 'Unarchive' : 'Archive'}
                    className={`group/action relative rounded-lg border p-1.5 transition ${archived
                        ? 'border-marquee-gold bg-marquee-gold/10 text-marquee-gold hover:bg-marquee-gold/20'
                        : 'border-marquee-line bg-marquee-panel2 text-marquee-muted hover:border-marquee-gold hover:text-marquee-gold'
                        }`}
                >
                    {archived ? (
                        <ArchiveRestore size={15} />
                    ) : (
                        <Archive size={15} />
                    )}

                    <span className="pointer-events-none absolute right-0 top-full z-20 mt-2 whitespace-nowrap rounded-md border border-marquee-gold/20 bg-marquee-panel2 px-2.5 py-1.5 text-xs text-marquee-gold opacity-0 shadow-xl transition-opacity group-hover/action:opacity-100">
                        {archived ? 'Unarchive' : 'Archive'}
                    </span>
                </button>

                {/* Delete */}
                <button
                    type="button"
                    onClick={handleDeleteClick}
                    aria-label="Delete notification"
                    className="group/action relative rounded-lg border border-marquee-line bg-marquee-panel2 p-1.5 text-marquee-muted transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
                >
                    <Trash2 size={15} />

                    <span className="pointer-events-none absolute right-0 top-full z-20 mt-2 whitespace-nowrap rounded-md border border-red-500/20 bg-marquee-panel2 px-2.5 py-1.5 text-xs text-red-300 opacity-0 shadow-xl transition-opacity group-hover/action:opacity-100">
                        Delete
                    </span>
                </button>
            </div>
        </motion.div>
    );
}