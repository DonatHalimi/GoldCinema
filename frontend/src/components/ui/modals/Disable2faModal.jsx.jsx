import { Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'react-toastify';

import {
    disable2FA,
    sendEmail2FADisableCode,
    sendSms2FADisableCode,
} from '../../../api/auth';

import { PasswordField } from '../FormUI';
import Modal from './Modal';

export default function Disable2faModal({
    method,
    onClose,
    onSuccess,
}) {
    const [password, setPassword] = useState('');
    const [code, setCode] = useState('');
    const [codeSent, setCodeSent] = useState(method === 'totp');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const inputRefs = useRef([]);

    const isTotp = method === 'totp';
    const isEmail = method === 'email';
    const isSms = method === 'sms';

    const methodLabel = isTotp
        ? 'Authenticator App'
        : isEmail
            ? 'Email Authentication'
            : isSms
                ? 'SMS Authentication'
                : 'Two-Factor Authentication';

    const codeLabel = isTotp
        ? 'Authenticator Code'
        : 'Verification Code';

    const codeDescription = isTotp
        ? 'Enter the current 6-digit code from your authenticator app.'
        : `Enter the 6-digit code sent to your ${isSms ? 'phone' : 'email'}.`;

    const handleSendCode = async () => {
        if (!password.trim()) {
            setError('Please enter your current password.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            if (isSms) {
                await sendSms2FADisableCode(password);
            } else if (isEmail) {
                await sendEmail2FADisableCode(password);
            } else {
                setError('Invalid 2FA method.');
                return;
            }

            setCodeSent(true);
            setCode('');

            toast.success(
                `Verification code sent to your ${isSms ? 'phone' : 'email'}.`
            );
        } catch (err) {
            setError(err.response?.data?.error || err.response?.data?.message || 'Failed to send verification code.');
        } finally {
            setLoading(false);
        }
    };

    const handleDisable = async (event) => {
        event.preventDefault();

        if (!password.trim()) {
            setError('Please enter your current password.');
            return;
        }

        if (!code.trim()) {
            setError(
                isTotp
                    ? 'Please enter your authenticator code.'
                    : 'Please enter the verification code.'
            );
            return;
        }

        if (code.length !== 6) {
            setError('Please enter the 6-digit verification code.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await disable2FA(password, method, code);

            toast.success(`${methodLabel} disabled successfully.`);

            onSuccess(method);
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || err.response?.data?.message || 'Failed to disable 2FA.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (isTotp) {
            await handleDisable(event);
            return;
        }

        if (!codeSent) {
            await handleSendCode();
            return;
        }

        await handleDisable(event);
    };

    return (
        <Modal
            isOpen
            onClose={onClose}
            title="Disable 2FA"
            closeDisabled={loading}
        >
            <div className="mt-4">
                <p className="text-sm text-marquee-muted">
                    You are about to disable{' '}
                    <span className="font-medium text-marquee-cream">
                        {methodLabel}
                    </span>{' '}
                    authentication.
                </p>

                <p className="mt-2 text-sm text-marquee-muted">
                    {isTotp
                        ? 'Enter your current password and authenticator code to confirm this change.'
                        : !codeSent
                            ? 'Enter your current password to receive a verification code.'
                            : codeDescription}
                </p>
            </div>

            <form
                onSubmit={handleSubmit}
                className="mt-5 space-y-4"
            >
                <PasswordField
                    label="Current Password"
                    value={password}
                    onChange={(value) => {
                        setPassword(value);
                        if (error) setError('');
                    }}
                    required
                    error={error && !code ? error : ''}
                />

                {(isTotp || codeSent) && (
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-marquee-cream">
                            {codeLabel}
                        </label>

                        <div
                            className="flex justify-between gap-2"
                            onPaste={(event) => {
                                event.preventDefault();

                                const pastedData = event.clipboardData.getData('text').trim();

                                if (/^\d{6}$/.test(pastedData)) {
                                    setCode(pastedData);

                                    inputRefs.current[5]?.focus();

                                    if (!loading) {
                                        setTimeout(() => {
                                            handleDisable({
                                                preventDefault: () => { },
                                            });
                                        }, 0);
                                    }
                                }
                            }}
                        >
                            {Array.from({ length: 6 }).map((_, index) => (
                                <input
                                    key={index}
                                    ref={(element) => {
                                        inputRefs.current[index] = element;
                                    }}
                                    type="text"
                                    inputMode="numeric"
                                    autoComplete={
                                        index === 0 ? 'one-time-code' : 'off'
                                    }
                                    maxLength={1}
                                    value={code[index] || ''}
                                    disabled={loading}
                                    autoFocus={index === 0}
                                    onChange={(event) => {
                                        const value = event.target.value;

                                        if (!/^\d*$/.test(value)) return;

                                        const digit = value.slice(-1);

                                        const newCode = code.split('');

                                        newCode[index] = digit;

                                        const updatedCode = newCode.join('').slice(0, 6);

                                        setCode(updatedCode);

                                        if (error) {
                                            setError('');
                                        }

                                        if (digit && index < 5) {
                                            inputRefs.current[index + 1]?.focus();
                                        }

                                        if (updatedCode.length === 6 && /^\d{6}$/.test(updatedCode)) {
                                            setTimeout(() => {
                                                handleDisable({
                                                    preventDefault: () => { },
                                                });
                                            }, 0);
                                        }
                                    }}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Backspace' && !code[index] && index > 0) {
                                            inputRefs.current[index - 1]?.focus();
                                        }
                                    }}
                                    className="h-12 w-12 rounded-md border border-marquee-line bg-marquee-panel2 text-center text-lg font-semibold text-marquee-cream outline-none transition focus:border-marquee-gold disabled:opacity-50"
                                />
                            ))}
                        </div>

                        {error && (
                            <p className="mt-2 text-sm text-red-400">
                                {error}
                            </p>
                        )}

                        {!isTotp && (
                            <p className="mt-2 text-xs text-marquee-muted">
                                {codeDescription}
                            </p>
                        )}
                    </div>
                )}

                {!isTotp && !codeSent && error && (
                    <p className="text-sm text-red-400">
                        {error}
                    </p>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="rounded-full border border-marquee-line px-4 py-2 text-sm text-marquee-muted transition hover:border-marquee-gold hover:text-marquee-cream disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={
                            loading ||
                            !password.trim() ||
                            ((isTotp || codeSent) && code.length !== 6)
                        }
                        className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {loading && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        )}

                        {loading
                            ? isTotp || codeSent
                                ? 'Disabling...'
                                : 'Sending...'
                            : isTotp || codeSent
                                ? 'Disable 2FA'
                                : 'Send verification code'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}