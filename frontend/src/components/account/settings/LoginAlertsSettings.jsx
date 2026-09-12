import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { updateLoginAlerts } from '../../../api/auth';

export default function LoginAlertsSettings({ initialLoginAlerts = true, onUpdate }) {
    const [loginAlerts, setLoginAlerts] = useState(initialLoginAlerts);
    const [alertsLoading, setAlertsLoading] = useState(false);

    useEffect(() => {
        setLoginAlerts(initialLoginAlerts);
    }, [initialLoginAlerts]);

    const handleToggleLoginAlerts = async () => {
        const nextState = !loginAlerts;
        setAlertsLoading(true);

        try {
            const data = await updateLoginAlerts(nextState);
            setLoginAlerts(data.loginAlerts);

            if (onUpdate) onUpdate(data.loginAlerts);
            toast.success(data.message || 'Login alerts updated successfully.');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to update login alerts.');
        } finally {
            setAlertsLoading(false);
        }
    };

    return (
        <div className="rounded-xl border border-marquee-line bg-marquee-bg p-5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-marquee-line/30 text-marquee-gold">
                        <Bell className="h-5 w-5" />
                    </div>

                    <div>
                        <h3 className="font-semibold text-marquee-cream">
                            Login Alerts
                        </h3>
                        <p className="text-sm text-marquee-muted">
                            Get notified via email whenever your account is accessed from a new login
                        </p>
                    </div>
                </div>

                <motion.button
                    type="button"
                    onClick={handleToggleLoginAlerts}
                    disabled={alertsLoading}
                    aria-pressed={loginAlerts}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-marquee-gold focus-visible:ring-offset-2 focus-visible:ring-offset-marquee-bg disabled:opacity-50 ${loginAlerts ? 'bg-marquee-gold' : 'bg-marquee-line/50'}`}
                >
                    <motion.span
                        className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0"
                        animate={{ x: loginAlerts ? 20 : 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                </motion.button>
            </div>
        </div>
    );
}