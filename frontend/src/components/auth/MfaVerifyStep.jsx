import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import RememberMeCheckbox from './RememberMeCheckbox';

const RESEND_COOLDOWN_SECONDS = 30;

export default function MfaVerifyStep({ mfaState, from, onBack }) {
    const { verifyLoginMfa } = useAuth();
    const navigate = useNavigate();

    const [otp, setOtp] = useState(Array(6).fill(''));
    const [backupCode, setBackupCode] = useState('');
    const [useBackupCode, setUseBackupCode] = useState(false);
    const [trustDevice, setTrustDevice] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [resending, setResending] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    const [selectedMethod, setSelectedMethod] = useState(null);

    const otpRefs = useRef([]);
    const backupInputRef = useRef(null);

    const hasTotp = mfaState.methods?.includes('totp');
    const hasEmail = mfaState.methods?.includes('email');

    useEffect(() => {
        if (hasTotp) {
            setSelectedMethod('totp');
        } else if (hasEmail) {
            setSelectedMethod('email');
        }
    }, [hasTotp, hasEmail]);

    useEffect(() => {
        if (useBackupCode) {
            backupInputRef.current?.focus();
        } else {
            otpRefs.current[0]?.focus();
        }
    }, [useBackupCode, selectedMethod]);

    useEffect(() => {
        if (resendCooldown <= 0) return;

        const timer = setInterval(() => {
            setResendCooldown((s) => Math.max(0, s - 1));
        }, 1000);

        return () => clearInterval(timer);
    }, [resendCooldown]);

    const switchMethod = (method) => {
        setSelectedMethod(method);
        setOtp(Array(6).fill(''));
        setBackupCode('');
        setError('');
        setResendCooldown(0);
        setUseBackupCode(false);
    };

    const submitVerification = async (codeToSubmit) => {
        const cleanCode = codeToSubmit.trim();

        if (!cleanCode || submitting || !selectedMethod) return;

        setSubmitting(true);
        setError('');

        try {
            await verifyLoginMfa(
                mfaState.mfaToken,
                cleanCode,
                selectedMethod,
                mfaState.rememberMe,
                trustDevice
            );

            navigate(from, { replace: true });
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Invalid code. Please try again.');

            if (useBackupCode) {
                setBackupCode('');
                backupInputRef.current?.focus();
            } else {
                setOtp(Array(6).fill(''));
                otpRefs.current[0]?.focus();
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];

        newOtp[index] = value.substring(value.length - 1);

        setOtp(newOtp);

        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }

        const fullCode = newOtp.join('');

        if (
            fullCode.length === 6 &&
            newOtp.every((digit) => digit !== '')
        ) {
            submitVerification(fullCode);
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (
            e.key === 'Backspace' &&
            !otp[index] &&
            index > 0
        ) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();

        const pastedData = e.clipboardData
            .getData('text')
            .trim();

        if (/^\d{6}$/.test(pastedData)) {
            const digits = pastedData.split('');

            setOtp(digits);

            otpRefs.current[5]?.focus();

            submitVerification(pastedData);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const codeToSubmit = useBackupCode
            ? backupCode
            : otp.join('');

        submitVerification(codeToSubmit);
    };

    async function handleResend() {
        if (selectedMethod !== 'email') return;

        setResending(true);
        setError('');

        try {
            await api.post('/auth/2fa/login-resend', {
                mfaToken: mfaState.mfaToken,
            });

            setResendCooldown(RESEND_COOLDOWN_SECONDS);
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Could not resend code.');
        } finally {
            setResending(false);
        }
    }

    const methodLabel =
        selectedMethod === 'totp'
            ? 'authenticator app'
            : 'email';

    return (
        <div>
            <button
                type="button"
                onClick={onBack}
                className="mb-4 text-sm text-marquee-muted hover:text-marquee-gold"
            >
                &larr; Back to login
            </button>

            <h1 className="mb-2 text-center font-serif text-3xl font-bold text-marquee-cream">
                Verify it's you
            </h1>

            <p className="mb-5 text-center text-sm text-marquee-muted">
                {useBackupCode
                    ? 'Enter one of your saved backup codes.'
                    : `Enter the 6 - digit code from your ${methodLabel}.`}
            </p>

            {!useBackupCode && hasTotp && hasEmail && (
                <div className="mb-5 space-y-2">
                    <p className="text-center text-xs text-marquee-muted">
                        Choose a verification method
                    </p>

                    <button
                        type="button"
                        onClick={() => switchMethod('totp')}
                        disabled={submitting}
                        className={`w-full rounded-lg border px-4 py-3 text-left transition ${selectedMethod === 'totp'
                            ? 'border-marquee-gold bg-marquee-gold/10 text-marquee-cream'
                            : 'border-marquee-line bg-marquee-panel2 text-marquee-muted hover:border-marquee-gold/50 hover:text-marquee-cream'}`}>
                        <div className="font-medium">
                            Authenticator App
                        </div>

                        <div className="mt-1 text-xs text-marquee-muted">
                            Use the 6-digit code from your authenticator app.
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => switchMethod('email')}
                        disabled={submitting}
                        className={`w-full rounded-lg border px-4 py-3 text-left transition ${selectedMethod === 'email'
                            ? 'border-marquee-gold bg-marquee-gold/10 text-marquee-cream'
                            : 'border-marquee-line bg-marquee-panel2 text-marquee-muted hover:border-marquee-gold/50 hover:text-marquee-cream'}`}>
                        <div className="font-medium">
                            Email
                        </div>

                        <div className="mt-1 text-xs text-marquee-muted">
                            Receive a 6-digit verification code by email.
                        </div>
                    </button>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {useBackupCode ? (
                    <label className="block">
                        <span className="mb-1 block text-sm text-marquee-muted">
                            Backup code
                        </span>
                        <input
                            ref={backupInputRef}
                            type="text"
                            value={backupCode}
                            onChange={(e) =>
                                setBackupCode(e.target.value)
                            }
                            maxLength={10}
                            required
                            disabled={submitting}
                            className="w-full rounded-md border border-marquee-line bg-marquee-panel2 px-4 py-2.5 text-center tracking-[0.3em] text-marquee-cream outline-none transition focus:border-marquee-gold disabled:opacity-50"
                        />
                    </label>
                ) : (
                    <div>
                        <span className="mb-2 block text-center text-sm text-marquee-muted">
                            Verification code
                        </span>

                        <div onPaste={handleOtpPaste} className="flex justify-between gap-2">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) =>
                                        (otpRefs.current[index] = el)
                                    }
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete={
                                        index === 0
                                            ? 'one-time-code'
                                            : 'off'
                                    }
                                    maxLength={1}
                                    value={digit}
                                    disabled={submitting}
                                    onChange={(e) =>
                                        handleOtpChange(
                                            index,
                                            e.target.value
                                        )
                                    }
                                    onKeyDown={(e) =>
                                        handleOtpKeyDown(index, e)
                                    }
                                    className="h-12 w-12 rounded-md border border-marquee-line bg-marquee-panel2 text-center text-lg font-semibold text-marquee-cream outline-none transition focus:border-marquee-gold disabled:opacity-50"
                                />
                            ))}
                        </div>
                    </div>
                )}

                {error && (
                    <p className="text-sm text-red-400">
                        {error}
                    </p>
                )}

                <RememberMeCheckbox
                    checked={trustDevice}
                    onChange={() =>
                        setTrustDevice((prev) => !prev)
                    }
                />
                <button
                    type="submit"
                    disabled={
                        submitting ||
                        !selectedMethod ||
                        (
                            useBackupCode
                                ? !backupCode.trim()
                                : otp.join('').length < 6
                        )
                    }
                    className="w-full rounded-full bg-marquee-gold px-6 py-3 font-semibold text-marquee-bg transition hover:bg-marquee-goldBright disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {submitting ? 'Verifying...' : 'Verify'}
                </button>

                <div className="flex items-center justify-between text-sm">
                    <button
                        type="button"
                        onClick={() => {
                            setUseBackupCode((prev) => !prev);
                            setOtp(Array(6).fill(''));
                            setBackupCode('');
                            setError('');
                        }}
                        className="text-marquee-gold hover:text-marquee-goldBright"
                    >
                        {useBackupCode ? 'Use verification code instead' : 'Use a backup code instead'}
                    </button>

                    {selectedMethod === 'email' &&
                        !useBackupCode && (
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={
                                    resending ||
                                    resendCooldown > 0
                                }
                                className="text-marquee-muted hover:text-marquee-gold disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {resendCooldown > 0
                                    ? `Resend in ${resendCooldown} s`
                                    : resending
                                        ? 'Sending...'
                                        : 'Resend code'}
                            </button>
                        )}
                </div>
            </form>
        </div>
    );
}