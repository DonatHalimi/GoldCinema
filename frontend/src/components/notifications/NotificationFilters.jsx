import { motion } from 'framer-motion';
import { FILTERS } from '../../utils/notificationHelpers';

export default function NotificationFilters({ currentFilter, onFilterChange, unreadCount }) {
    return (
        <div className="inline-flex items-center gap-1.5 rounded-full border border-marquee-line bg-marquee-bg p-1.5">
            {FILTERS.map((f) => {
                const isActive = currentFilter === f.value;
                return (
                    <button
                        key={f.value}
                        type="button"
                        onClick={() => onFilterChange(f.value)}
                        className={`relative rounded-full px-5 py-2 text-sm font-medium transition-colors duration-200 ${isActive ? 'text-marquee-line' : 'text-marquee-muted hover:text-marquee-gold'}`}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="activeFilterPill"
                                transition={{
                                    type: "spring",
                                    stiffness: 380,
                                    damping: 30,
                                }}
                                className="absolute inset-0 rounded-full bg-marquee-gold shadow-md"
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-1.5">
                            {f.label}
                            {f.value === 'unread' && unreadCount > 0 && (
                                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${isActive ? 'bg-black text-marquee-gold' : 'bg-marquee-gold text-black'}`}>
                                    {unreadCount}
                                </span>
                            )}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}