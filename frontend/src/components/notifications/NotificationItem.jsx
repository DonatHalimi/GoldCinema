import { motion } from 'framer-motion';
import {
    Archive,
    ArchiveRestore,
    ExternalLink,
    MailCheck,
    MailOpen,
    Trash2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDate, getTypeIcon } from '../../utils/notificationHelpers';

export default function NotificationItem({
    notification,
    onMarkRead,
    onToggleArchive,
    onDeleteRequest,
}) {
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
                            {title}
                        </h4>

                        {!read && !archived && <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-marquee-gold" />}

                        <span className="shrink-0 text-xs text-marquee-muted">
                            • {formatDate(createdAt)}
                        </span>
                    </div>

                    <p className="text-xs leading-relaxed text-marquee-muted">
                        {message}
                    </p>
                </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
                {link && (
                    <button
                        type="button"
                        onClick={() => navigate(link)}
                        className="inline-flex items-center gap-1 rounded-lg border border-marquee-gold/30 bg-marquee-gold/10 px-2.5 py-1.5 text-xs font-semibold text-marquee-gold transition hover:bg-marquee-gold hover:text-black"
                    >
                        View
                        <ExternalLink size={12} />
                    </button>
                )}

                <button
                    type="button"
                    onClick={handleToggleRead}
                    title={read ? 'Mark as Unread' : 'Mark as Read'}
                    className="rounded-lg border border-marquee-line bg-marquee-panel2 p-1.5 text-marquee-muted transition hover:border-marquee-gold hover:text-marquee-gold"
                >
                    {read ? (
                        <MailOpen size={15} />
                    ) : (
                        <MailCheck size={15} />
                    )}
                </button>

                <button
                    type="button"
                    onClick={handleToggleArchive}
                    title={archived ? 'Unarchive' : 'Archive'}
                    className={`rounded-lg border p-1.5 transition ${archived
                        ? 'border-marquee-gold bg-marquee-gold/10 text-marquee-gold hover:bg-marquee-gold/20'
                        : 'border-marquee-line bg-marquee-panel2 text-marquee-muted hover:border-marquee-gold hover:text-marquee-gold'
                        }`}
                >
                    {archived ? (
                        <ArchiveRestore size={15} />
                    ) : (
                        <Archive size={15} />
                    )}
                </button>

                <button
                    type="button"
                    onClick={handleDeleteClick}
                    title="Delete"
                    className="rounded-lg border border-marquee-line bg-marquee-panel2 p-1.5 text-marquee-muted transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
                >
                    <Trash2 size={15} />
                </button>
            </div>
        </motion.div>
    );
}