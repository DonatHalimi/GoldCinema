import { useState } from 'react';
import { Bell } from 'lucide-react';
import api from '../../api/client';
import { toast } from 'react-toastify';

export default function LoginAlertsSettings({ initialLoginAlerts = true, onUpdate }) {
    const [loginAlerts, setLoginAlerts] = useState(initialLoginAlerts);
    const [alertsLoading, setAlertsLoading] = useState(false);

    const handleToggleLoginAlerts = async () => {
        const nextState = !loginAlerts;
        setAlertsLoading(true);
        try {
            const { data } = await api.put('/auth/security/login-alerts', {
                loginAlerts: nextState,
            });
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

                <button
                    type="button"
                    onClick={handleToggleLoginAlerts}
                    disabled={alertsLoading}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${loginAlerts ? 'bg-marquee-gold' : 'bg-marquee-panel2'}`}
                >
                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-zinc-950 shadow ring-0 transition duration-200 ease-in-out ${loginAlerts ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
            </div>
        </div>
    );
}