import { useEffect, useState } from 'react';
import {
    ShieldCheck,
    Bell,
    Laptop,
    History,
    KeyRound,
    BadgeCheck,
} from 'lucide-react';
import api from '../../api/client';
import EnableEmail2faModal from '../ui/EnableEmail2faModal';
import EnableTotpModal from '../ui/EnableTotpModal';
import TwoFactorSettings from './TwoFactorSettings';
import Disable2faModal from '../ui/Disable2faModal.jsx';
import PasskeySettings from './PasskeySettings.jsx';

export default function SecuritySettings() {
    const [showEmailVerify, setShowEmailVerify] = useState(false);
    const [showTotpSetup, setShowTotpSetup] = useState(false);
    const [showSmsSetup, setShowSmsSetup] = useState(false);
    const [showDisableModal, setShowDisableModal] = useState(false);
    const [disableMethod, setDisableMethod] = useState(null);

    const [twoFactor, setTwoFactor] = useState({
        enabled: false,
        methods: [],
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchSecurityStatus = async () => {
            try {
                const { data } = await api.get('/auth/me');

                setTwoFactor({
                    enabled: data.user?.twoFactor?.enabled || false,
                    methods: data.user?.twoFactor?.methods || [],
                });
            } catch (err) {
                console.error(err);
            }
        };

        fetchSecurityStatus();
    }, []);

    const enableEmail2FA = async () => {
        try {
            setLoading(true);
            await api.post('/auth/2fa/email/enable');
            setShowEmailVerify(true);
        } catch (err) {
            alert(err.response?.data?.error || err.message);
        } finally {
            setLoading(false);
        }
    };

    const handle2FASuccess = (method = 'email') => {
        setTwoFactor((prev) => ({
            enabled: true,
            methods: prev.methods.includes(method)
                ? prev.methods
                : [...prev.methods, method],
        }));

        setShowEmailVerify(false);
        setShowTotpSetup(false);
        setShowSmsSetup(false);
    };

    const handleDisableClick = (method) => {
        setDisableMethod(method);
        setShowDisableModal(true);
    };

    const handle2FADisableSuccess = () => {
        setTwoFactor((prev) => {
            const methods = prev.methods.filter(
                (method) => method !== disableMethod
            );

            return {
                enabled: methods.length > 0,
                methods,
            };
        });

        setDisableMethod(null);
        setShowDisableModal(false);
    };

    return (
        <div>
            <h2 className="font-display text-2xl font-semibold tracking-wide text-marquee-goldBright">
                Security
            </h2>

            <p className="mt-2 text-sm text-marquee-muted">
                Manage your account security and authentication methods
            </p>

            <div className="mt-6 space-y-5">
                <TwoFactorSettings />

                <PasskeySettings twoFactor={twoFactor} />

                <div className="rounded-xl border border-marquee-line bg-marquee-bg p-5">
                    <div className="flex items-center gap-3">
                        <Bell className="text-marquee-gold" />

                        <div>
                            <h3 className="font-semibold text-marquee-cream">
                                Login Alerts
                            </h3>

                            <p className="text-sm text-marquee-muted">
                                Get notified whenever your account is accessed from a new device or location
                            </p>
                        </div>
                    </div>

                    <button disabled className="mt-5 cursor-not-allowed rounded-full bg-marquee-panel2 px-5 py-2 text-sm text-marquee-muted">
                        Coming Soon
                    </button>
                </div>

                <div className="rounded-xl border border-marquee-line bg-marquee-bg p-5">
                    <div className="flex items-center gap-3">
                        <Laptop className="text-marquee-gold" />

                        <div>
                            <h3 className="font-semibold text-marquee-cream">
                                Trusted Devices
                            </h3>

                            <p className="text-sm text-marquee-muted">
                                Manage devices you've marked as trusted for quicker and safer sign-ins
                            </p>
                        </div>
                    </div>

                    <button
                        disabled
                        className="mt-5 cursor-not-allowed rounded-full bg-marquee-panel2 px-5 py-2 text-sm text-marquee-muted"
                    >
                        Coming Soon
                    </button>
                </div>

                <div className="rounded-xl border border-marquee-line bg-marquee-bg p-5">
                    <div className="flex items-center gap-3">
                        <History className="text-marquee-gold" />

                        <div>
                            <h3 className="font-semibold text-marquee-cream">
                                Recent Security Activity
                            </h3>

                            <p className="text-sm text-marquee-muted">
                                Review recent logins, password changes, and other important security events
                            </p>
                        </div>
                    </div>

                    <button disabled className="mt-5 cursor-not-allowed rounded-full bg-marquee-panel2 px-5 py-2 text-sm text-marquee-muted">
                        Coming Soon
                    </button>
                </div>

                {showEmailVerify && (
                    <EnableEmail2faModal
                        onClose={() => setShowEmailVerify(false)}
                        onSuccess={() => handle2FASuccess('email')}
                    />
                )}

                {showDisableModal && (
                    <Disable2faModal
                        method={disableMethod}
                        onClose={() => {
                            setShowDisableModal(false);
                            setDisableMethod(null);
                        }}
                        onSuccess={handle2FADisableSuccess}
                    />
                )}

                {showTotpSetup && (
                    <EnableTotpModal
                        onClose={() => setShowTotpSetup(false)}
                        onSuccess={() => handle2FASuccess('totp')}
                    />
                )}

                {/* SMS 2FA */}
                {showSmsSetup && (
                    <EnableSms2faModal
                        onClose={() => setShowSmsSetup(false)}
                        onSuccess={() => handle2FASuccess('sms')}
                    />
                )}
            </div>
        </div>
    );
}