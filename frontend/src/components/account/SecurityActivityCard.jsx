import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ChevronUp, ClipboardList, KeyRound, Laptop, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getActivityData } from '../../api/auth';

export default function SecurityActivityCard() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        const fetchActivityData = async () => {
            try {
                const data = await getActivityData();
                setActivities(data.activities || []);
            } catch (err) {
                toast.error('Failed to load security activity.');
            } finally {
                setLoading(false);
            }
        };

        fetchActivityData();
    }, []);

    const getIcon = (type) => {
        switch (type) {
            case 'passkey':
                return KeyRound;
            case 'device':
                return Laptop;
            default:
                return ShieldCheck;
        }
    };

    const displayedActivities = showAll ? activities : activities.slice(0, 5);

    return (
        <div className="rounded-xl border border-marquee-line bg-marquee-bg p-5">
            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-marquee-line/30 text-marquee-gold">
                    <ClipboardList className="h-5 w-5" />
                </div>

                <div>
                    <h3 className="font-semibold text-marquee-cream">Recent Security Activity</h3>
                    <p className="text-sm text-marquee-muted">
                        Review recent logins, password changes, and other important security events
                    </p>
                </div>
            </div>

            <div className="mt-5">
                {loading ? (
                    <p className="text-sm text-marquee-muted">Loading activity...</p>
                ) : activities.length === 0 ? (
                    <p className="text-sm text-marquee-muted">No security events recorded yet.</p>
                ) : (
                    <>
                        <div className="space-y-3">
                            <AnimatePresence initial={false} mode="popLayout">
                                {displayedActivities.map((item) => {
                                    const IconComponent = getIcon(item.type);
                                    const eventDate = new Date(item.date);
                                    return (
                                        <motion.div
                                            key={item.id}
                                            layout
                                            initial={{ opacity: 0, y: -20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                                            className="flex items-center justify-between rounded-lg border border-marquee-line bg-marquee-panel2 p-3 text-sm"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-marquee-line/30 text-marquee-gold">
                                                    <IconComponent className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-marquee-cream">
                                                        {item.title}
                                                    </p>
                                                    <p className="text-xs text-marquee-muted">
                                                        {item.description}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-xs text-marquee-muted whitespace-nowrap ml-4">
                                                {eventDate.toLocaleDateString('en-GB')} {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>

                        {activities.length > 5 && (
                            <button
                                onClick={() => setShowAll(!showAll)}
                                className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-marquee-line bg-marquee-panel2 py-2 text-xs font-medium text-marquee-gold transition hover:bg-marquee-line/20"
                            >
                                {showAll ? (
                                    <>
                                        <span>Show Less</span>
                                        <ChevronUp className="h-4 w-4" />
                                    </>
                                ) : (
                                    <>
                                        <span>Show All ({activities.length - 5} more)</span>
                                        <ChevronDown className="h-4 w-4" />
                                    </>
                                )}
                            </button>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}