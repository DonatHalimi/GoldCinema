import { useEffect, useRef, useState } from 'react';
import api from '../../../api/client';
import Modal from './Modal';
import { verifyEmail2FA } from '../../../api/auth';

export default function EnableEmail2faModal({ onSuccess, onClose }) {
    const [otp, setOtp] = useState(Array(6).fill(''));

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const inputRefs = useRef([]);

    useEffect(() => {
        const timer = setTimeout(() => {
            inputRefs.current[0]?.focus();
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    const submitCode = async (codeToSubmit) => {
        if (codeToSubmit.length !== 6 || loading) return;

        try {
            setLoading(true);
            setError('');

            await verifyEmail2FA(submitCode);

            onSuccess();
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid verification code');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];

        newOtp[index] = value.substring(value.length - 1);

        setOtp(newOtp);

        if (value && index < 5) inputRefs.current[index + 1]?.focus();

        const fullCode = newOtp.join('');

        if (fullCode.length === 6 && newOtp.every((digit) => digit !== '')) {
            submitCode(fullCode);
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();

        const pastedData = e.clipboardData
            .getData('text')
            .trim();

        if (/^\d{6}$/.test(pastedData)) {
            const digits = pastedData.split('');

            setOtp(digits);

            inputRefs.current[5]?.focus();

            submitCode(pastedData);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        submitCode(otp.join(''));
    };

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title="Verify Email 2FA"
            closeDisabled={loading}
        >
            <p className="mt-2 text-sm text-marquee-muted">
                Enter the 6-digit code sent to your email.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div onPaste={handlePaste} className="flex justify-between gap-2">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) =>
                                (inputRefs.current[index] = el)
                            }
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            disabled={loading}
                            onChange={(e) =>
                                handleChange(
                                    index,
                                    e.target.value
                                )
                            }
                            onKeyDown={(e) =>
                                handleKeyDown(index, e)
                            }
                            className="h-12 w-12 rounded-md border border-marquee-line bg-marquee-panel2 text-center text-lg font-semibold text-marquee-cream outline-none transition focus:border-marquee-gold disabled:opacity-50"
                        />
                    ))}
                </div>

                {error && (
                    <p className="text-sm text-red-400">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={
                        loading ||
                        otp.join('').length < 6
                    }
                    className="w-full rounded-full bg-marquee-gold py-3 font-semibold text-marquee-bg transition hover:bg-marquee-goldBright disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {loading ? 'Verifying...' : 'Enable 2FA'}
                </button>
            </form>
        </Modal>
    );
}