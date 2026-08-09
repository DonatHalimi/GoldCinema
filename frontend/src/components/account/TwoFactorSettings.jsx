import { useEffect, useState } from 'react';
import { ShieldCheck, BadgeCheck, Trash2 } from 'lucide-react';
import api from '../../api/client';
import EnableEmail2faModal from '../ui/EnableEmail2faModal';
import EnableTotpModal from '../ui/EnableTotpModal';
import Disable2faModal from '../ui/Disable2faModal.jsx';
import { toast } from 'react-toastify';

export default function TwoFactorSettings() {
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
                console.error('Failed to load 2FA status:', err);
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
            toast.error('Failed to enable Email 2FA.')
        } finally {
            setLoading(false);
        }
    };

    const handle2FASuccess = (method) => {
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
        <>
            <div className="rounded-xl border border-marquee-line bg-marquee-bg p-5">
                <div className="flex items-start gap-3">
                    <ShieldCheck className="h-6 w-6 shrink-0 text-marquee-gold" />

                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-marquee-cream">
                                Two-Factor Authentication
                            </h3>

                            {twoFactor.enabled && (
                                <span className="flex items-center gap-1.5 text-xs font-medium text-green-400">
                                    <BadgeCheck className="h-4 w-4" />
                                    Enabled
                                </span>
                            )}
                        </div>

                        <p className="mt-1 text-sm text-marquee-muted">
                            Add an extra layer of protection to your account
                            using email, an authenticator app or SMS
                        </p>
                    </div>
                </div>

                {twoFactor.methods.length > 0 && (
                    <div className="mt-5 space-y-3">
                        {twoFactor.methods.includes('email') && (
                            <div className="flex items-center justify-between rounded-lg border border-marquee-line bg-marquee-panel2 px-4 py-3">
                                <div>
                                    <p className="text-sm font-medium text-marquee-cream">
                                        Email 2FA
                                    </p>

                                    <p className="text-xs text-marquee-muted">
                                        Verification codes are sent to your
                                        email
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleDisableClick('email')
                                    }
                                    className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 px-3 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/10"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Remove
                                </button>
                            </div>
                        )}

                        {twoFactor.methods.includes('totp') && (
                            <div className="flex items-center justify-between rounded-lg border border-marquee-line bg-marquee-panel2 px-4 py-3">
                                <div>
                                    <p className="text-sm font-medium text-marquee-cream">
                                        Authenticator App
                                    </p>

                                    <p className="text-xs text-marquee-muted">
                                        Use an authenticator app to generate
                                        verification codes
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleDisableClick('totp')
                                    }
                                    className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 px-3 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/10"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Remove
                                </button>
                            </div>
                        )}

                        {twoFactor.methods.includes('sms') && (
                            <div className="flex items-center justify-between rounded-lg border border-marquee-line bg-marquee-panel2 px-4 py-3">
                                <div>
                                    <p className="text-sm font-medium text-marquee-cream">
                                        SMS 2FA
                                    </p>

                                    <p className="text-xs text-marquee-muted">
                                        Verification codes are sent via SMS
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleDisableClick('sms')
                                    }
                                    className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 px-3 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/10"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Remove
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-5 flex flex-wrap gap-3">
                    {!twoFactor.methods.includes('email') && (
                        <button
                            type="button"
                            onClick={enableEmail2FA}
                            disabled={loading}
                            className="rounded-full border border-marquee-gold px-5 py-2 text-sm font-semibold text-marquee-gold transition hover:bg-marquee-gold hover:text-zinc-950 disabled:opacity-50"
                        >
                            Enable Email 2FA
                        </button>
                    )}

                    {!twoFactor.methods.includes('totp') && (
                        <button
                            type="button"
                            onClick={() => setShowTotpSetup(true)}
                            disabled={loading}
                            className="rounded-full border border-marquee-gold px-5 py-2 text-sm font-semibold text-marquee-gold transition hover:bg-marquee-gold hover:text-zinc-950 disabled:opacity-50"
                        >
                            Authenticator App
                        </button>
                    )}

                    {!twoFactor.methods.includes('sms') && (
                        <button
                            type="button"
                            onClick={() => setShowSmsSetup(true)}
                            disabled={loading}
                            className="rounded-full border border-marquee-gold px-5 py-2 text-sm font-semibold text-marquee-gold transition hover:bg-marquee-gold hover:text-zinc-950 disabled:opacity-50"
                        >
                            Enable SMS 2FA
                        </button>
                    )}
                </div>
            </div>

            {showEmailVerify && (
                <EnableEmail2faModal
                    onClose={() => setShowEmailVerify(false)}
                    onSuccess={() => handle2FASuccess('email')}
                />
            )}

            {showTotpSetup && (
                <EnableTotpModal
                    onClose={() => setShowTotpSetup(false)}
                    onSuccess={() => handle2FASuccess('totp')}
                />
            )}

            {showSmsSetup && (
                <EnableSms2faModal
                    onClose={() => setShowSmsSetup(false)}
                    onSuccess={() => handle2FASuccess('sms')}
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
        </>
    );
}
