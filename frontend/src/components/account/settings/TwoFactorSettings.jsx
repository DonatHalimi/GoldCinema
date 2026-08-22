import { BadgeCheck, Mail, ShieldCheck, Smartphone, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../../api/client.js';
import Disable2faModal from '../../ui/Disable2faModal.jsx.jsx';
import EnableEmail2faModal from '../../ui/EnableEmail2faModal.jsx';
import EnableTotpModal from '../../ui/EnableTotpModal.jsx';

export default function TwoFactorSettings() {
    const [showEmailVerify, setShowEmailVerify] = useState(false);
    const [showTotpSetup, setShowTotpSetup] = useState(false);
    const [showDisableModal, setShowDisableModal] = useState(false);

    const [disableMethod, setDisableMethod] = useState(null);

    const [twoFactor, setTwoFactor] = useState({ methods: [] });

    const [loading, setLoading] = useState(false);

    const isEnabled = twoFactor.methods.length > 0;

    useEffect(() => {
        const fetchSecurityStatus = async () => {
            try {
                const { data } = await api.get('/auth/me');
                const activeMethods = data.user?.twoFactor?.methods || [];

                setTwoFactor({ methods: activeMethods });
            } catch (err) {
                toast.error('Failed to load 2FA status.');
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
            toast.error('Failed to enable Email 2FA.');
        } finally {
            setLoading(false);
        }
    };

    const handle2FASuccess = (method) => {
        setTwoFactor((prev) => ({
            methods: prev.methods.includes(method)
                ? prev.methods
                : [...prev.methods, method],
        }));

        setShowEmailVerify(false);
        setShowTotpSetup(false);
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

            return { methods };
        });

        setDisableMethod(null);
        setShowDisableModal(false);
    };

    return (
        <>
            <div className="rounded-xl border border-marquee-line bg-marquee-bg p-5">
                <div className="flex items-start gap-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-marquee-line/30 text-marquee-gold">
                        <ShieldCheck className="h-5 w-5" />
                    </div>

                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-marquee-cream">
                                Two-Factor Authentication
                            </h3>

                            {isEnabled && (
                                <span className="flex items-center gap-1.5 text-xs font-medium text-green-400">
                                    <BadgeCheck className="h-4 w-4" />
                                    Enabled
                                </span>
                            )}
                        </div>

                        <p className="mt-1 text-sm text-marquee-muted">
                            Add an extra layer of protection to your account
                            using email or an authenticator app
                        </p>
                    </div>
                </div>

                {twoFactor.methods.length > 0 && (
                    <div className="mt-5 space-y-3">
                        {twoFactor.methods.includes('email') && (
                            <div className="flex items-center justify-between rounded-lg border border-marquee-line bg-marquee-panel2 px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-marquee-line/30 text-marquee-gold">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-marquee-cream">
                                            Email 2FA
                                        </p>
                                        <p className="text-xs text-marquee-muted">
                                            Verification codes are sent to your email
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleDisableClick('email')}
                                    className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 px-3 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/10"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Remove
                                </button>
                            </div>
                        )}

                        {twoFactor.methods.includes('totp') && (
                            <div className="flex items-center justify-between rounded-lg border border-marquee-line bg-marquee-panel2 px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-marquee-line/30 text-marquee-gold">
                                        <Smartphone className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-marquee-cream">
                                            Authenticator App
                                        </p>
                                        <p className="text-xs text-marquee-muted">
                                            Use an authenticator app to generate verification codes
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleDisableClick('totp')}
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
                            className="inline-flex items-center gap-2 rounded-full border border-marquee-gold px-5 py-2 text-sm font-semibold text-marquee-gold transition hover:bg-marquee-gold hover:text-zinc-950 disabled:opacity-50"
                        >
                            <Mail className="h-4 w-4" />
                            Enable Email 2FA
                        </button>
                    )}

                    {!twoFactor.methods.includes('totp') && (
                        <button
                            type="button"
                            onClick={() => setShowTotpSetup(true)}
                            disabled={loading}
                            className="inline-flex items-center gap-2 rounded-full border border-marquee-gold px-5 py-2 text-sm font-semibold text-marquee-gold transition hover:bg-marquee-gold hover:text-zinc-950 disabled:opacity-50"
                        >
                            <Smartphone className="h-4 w-4" />
                            Authenticator App
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