import { BadgeCheck, Mail, MessageSquare, ShieldCheck, Smartphone, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { activateEmail2FA, getProfile } from '../../../api/auth.js';
import Disable2faModal from '../../ui/modals/Disable2faModal.jsx';
import EnableEmail2faModal from '../../ui/modals/EnableEmail2faModal.jsx';
import EnableSms2faModal from '../../ui/modals/EnableSMS2faModal.jsx';
import EnableTotpModal from '../../ui/modals/EnableTotpModal.jsx';

export default function TwoFactorSettings() {
    const { t } = useTranslation('account');
    const [showEmailVerify, setShowEmailVerify] = useState(false);
    const [showTotpSetup, setShowTotpSetup] = useState(false);
    const [showSmsSetup, setShowSmsSetup] = useState(false);
    const [showDisableModal, setShowDisableModal] = useState(false);

    const [disableMethod, setDisableMethod] = useState(null);

    const [twoFactor, setTwoFactor] = useState({ methods: [] });

    const [loading, setLoading] = useState(false);

    const isEnabled = twoFactor.methods.length > 0;

    useEffect(() => {
        const fetchSecurityStatus = async () => {
            try {
                const data = await getProfile();
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
            await activateEmail2FA();
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
                                {t('2faHeader')}
                            </h3>

                            {isEnabled && (
                                <span className="flex items-center gap-1.5 text-xs font-medium text-green-400">
                                    <BadgeCheck className="h-4 w-4" />
                                    {t('2FAEnabled')}
                                </span>
                            )}
                        </div>

                        <p className="mt-1 text-sm text-marquee-muted">
                            {t('2faDesc')}
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
                                            {t('email2FA')}
                                        </p>
                                        <p className="text-xs text-marquee-muted">
                                            {t('email2FADesc')}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleDisableClick('email')}
                                    className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-red-500/30 bg-marquee-bg/40 px-3 py-2 text-xs font-semibold text-red-400 transition-all hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    {t('removeEmail2FA')}
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
                                            {t('authApp2FAHeader')}
                                        </p>
                                        <p className="text-xs text-marquee-muted">
                                            {t('authApp2FADesc')}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleDisableClick('totp')}
                                    className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-red-500/30 bg-marquee-bg/40 px-3 py-2 text-xs font-semibold text-red-400 transition-all hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    {t('removeAuthApp2FA')}
                                </button>
                            </div>
                        )}

                        {twoFactor.methods.includes('sms') && (
                            <div className="flex items-center justify-between rounded-lg border border-marquee-line bg-marquee-panel2 px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-marquee-line/30 text-marquee-gold">
                                        <MessageSquare className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-marquee-cream">
                                            {t('sms2FAHeader')}
                                        </p>
                                        <p className="text-xs text-marquee-muted">
                                            {t('sms2FADesc')}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleDisableClick('sms')}
                                    className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-red-500/30 bg-marquee-bg/40 px-3 py-2 text-xs font-semibold text-red-400 transition-all hover:border-red-500/50 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    {t('removeSMS2FA')}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {!['email', 'totp', 'sms'].every((method) =>
                    twoFactor.methods.includes(method)
                ) && (
                        <div className="flex items-center justify-between rounded-2xl border border-marquee-line/60 bg-marquee-line/30 p-3 sm:p-4 mt-5">
                            <div className="flex w-full flex-wrap items-center gap-2 sm:gap-3">
                                {!twoFactor.methods.includes('email') && (
                                    <button
                                        type="button"
                                        onClick={enableEmail2FA}
                                        disabled={loading}
                                        className="inline-flex items-center gap-2 rounded-xl border border-marquee-line/70 bg-marquee-bg/40 px-4 py-2.5 text-sm font-semibold text-marquee-cream transition-all hover:border-marquee-gold/50 hover:bg-marquee-gold/10 hover:text-marquee-gold disabled:opacity-50"
                                    >
                                        <Mail className="h-4 w-4 text-marquee-gold" />
                                        {t('enableEmail2FA')}
                                    </button>
                                )}

                                {!twoFactor.methods.includes('totp') && (
                                    <button
                                        type="button"
                                        onClick={() => setShowTotpSetup(true)}
                                        disabled={loading}
                                        className="inline-flex items-center gap-2 rounded-xl border border-marquee-line/70 bg-marquee-bg/40 px-4 py-2.5 text-sm font-semibold text-marquee-cream transition-all hover:border-marquee-gold/50 hover:bg-marquee-gold/10 hover:text-marquee-gold disabled:opacity-50"
                                    >
                                        <Smartphone className="h-4 w-4 text-marquee-gold" />
                                        {t('enableAuthApp2FA')}
                                    </button>
                                )}

                                {!twoFactor.methods.includes('sms') && (
                                    <button
                                        type="button"
                                        onClick={() => setShowSmsSetup(true)}
                                        disabled={loading}
                                        className="inline-flex items-center gap-2 rounded-xl border border-marquee-line/70 bg-marquee-bg/40 px-4 py-2.5 text-sm font-semibold text-marquee-cream transition-all hover:border-marquee-gold/50 hover:bg-marquee-gold/10 hover:text-marquee-gold disabled:opacity-50"
                                    >
                                        <MessageSquare className="h-4 w-4 text-marquee-gold" />
                                        {t('enableSMS2FA')}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
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