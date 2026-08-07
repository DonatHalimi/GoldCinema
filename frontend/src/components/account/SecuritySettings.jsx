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
import Disable2faModal from '../ui/DisableEmail2faModal';
import EnableTotpModal from '../ui/EnableTotpModal';

export default function SecuritySettings() {
    const [showEmailVerify, setShowEmailVerify] = useState(false);
    const [showTotpSetup, setShowTotpSetup] = useState(false);
    const [showSmsSetup, setShowSmsSetup] = useState(false);
    const [showDisableModal, setShowDisableModal] = useState(false);

    const [twoFactor, setTwoFactor] = useState({
        enabled: false,
        method: null,
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchSecurityStatus = async () => {
            try {
                const { data } = await api.get('/auth/me');

                setTwoFactor({
                    enabled: data.user?.twoFactor?.enabled || false,
                    method: data.user?.twoFactor?.method || null,
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
        setTwoFactor({
            enabled: true,
            method: method,
        });

        setShowEmailVerify(false);
        setShowTotpSetup(false);
        setShowSmsSetup(false);
    };

    const handle2FADisableSuccess = () => {
        setTwoFactor({
            enabled: false,
            method: null,
        });
        setShowDisableModal(false);
    };

    return (
        <div>
            <h2 className="font-display text-2xl font-semibold tracking-wide text-marquee-goldBright">
                Security
            </h2>

            <p className="mt-2 text-sm text-marquee-muted">
                Manage your account security and authentication methods.
            </p>

            <div className="mt-6 space-y-5">
                {/* Two Factor Authentication */}
                <div className="rounded-xl border border-marquee-line bg-marquee-bg p-5">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                            <ShieldCheck className="h-6 w-6 text-marquee-gold shrink-0" />

                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-marquee-cream">
                                        Two-Factor Authentication
                                    </h3>

                                    {twoFactor.enabled && (
                                        <button
                                            type="button"
                                            onClick={() => setShowDisableModal(true)}
                                            title="Click to disable 2FA"
                                            className="flex items-center gap-1 text-xs text-green-400 font-medium hover:text-red-400 transition-colors group cursor-pointer"
                                        >
                                            <BadgeCheck className="h-4 w-4 shrink-0 group-hover:hidden" />
                                            <span className="hidden group-hover:inline">Disable</span>
                                            <span>
                                                Enabled ({twoFactor.method ? twoFactor.method.charAt(0).toUpperCase() + twoFactor.method.slice(1) : ''})
                                            </span>
                                        </button>
                                    )}
                                </div>

                                <p className="mt-1 text-sm text-marquee-muted">
                                    Add an extra layer of protection to your account using email, SMS, or an authenticator app
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                        {twoFactor.method !== 'email' && (
                            <button
                                type="button"
                                onClick={enableEmail2FA}
                                disabled={loading}
                                className="rounded-full bg-marquee-gold px-5 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-marquee-goldBright disabled:opacity-50"
                            >
                                Enable Email 2FA
                            </button>
                        )}

                        {twoFactor.method !== 'sms' && (
                            <button
                                onClick={() => setShowSmsSetup(true)}
                                disabled={loading}
                                className="rounded-full border border-marquee-gold px-5 py-2 text-sm font-semibold text-marquee-gold transition hover:bg-marquee-gold hover:text-zinc-950 disabled:opacity-50"
                            >
                                Enable SMS 2FA
                            </button>
                        )}

                        {twoFactor.method !== 'totp' && (
                            <button
                                onClick={() => setShowTotpSetup(true)}
                                disabled={loading}
                                className="rounded-full border border-marquee-gold px-5 py-2 text-sm font-semibold text-marquee-gold transition hover:bg-marquee-gold hover:text-zinc-950 disabled:opacity-50"
                            >
                                Authenticator App
                            </button>
                        )}
                    </div>
                </div>

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

                {/* Passkeys */}
                <div className="rounded-xl border border-marquee-line bg-marquee-bg p-5">
                    <div className="flex items-center gap-3">
                        <KeyRound className="text-marquee-gold" />

                        <div>
                            <h3 className="font-semibold text-marquee-cream">
                                Passkeys
                            </h3>

                            <p className="text-sm text-marquee-muted">
                                Sign in securely using Face ID, Touch ID, Windows Hello, or another supported passkey provider
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
            </div>

            {/* Email 2FA */}
            {showEmailVerify && (
                <EnableEmail2faModal
                    onClose={() => setShowEmailVerify(false)}
                    onSuccess={() => handle2FASuccess('email')}
                />
            )}

            {showDisableModal && (
                <Disable2faModal
                    onClose={() => setShowDisableModal(false)}
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
    );
}