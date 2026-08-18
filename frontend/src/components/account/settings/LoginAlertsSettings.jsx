import { Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import api from '../../../api/client';

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
            const { data } = await api.put('/auth/security/login-alerts', { loginAlerts: nextState });
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
                    <Bell className="h-6 w-6 text-marquee-gold" />
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
                    animate={{ backgroundColor: loginAlerts ? 'var(--color-marquee-gold, #cca43b)' : 'var(--color-marquee-panel2, #27272a)' }}
                    transition={{ duration: 0.2 }}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent focus:outline-none disabled:opacity-50 ${loginAlerts ? 'bg-marquee-gold' : 'bg-marquee-panel2'}`}>
                    <motion.span
                        className="pointer-events-none inline-block h-5 w-5 rounded-full bg-zinc-950 shadow ring-0"
                        animate={{ x: loginAlerts ? 20 : 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                </motion.button>
            </div>
        </div>
    );
}