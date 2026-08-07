import { useState, useRef } from 'react';
import api from '../../api/client';
import { X } from 'lucide-react';

export default function EnableEmail2faModal({ onSuccess, onClose }) {
    const [otp, setOtp] = useState(Array(6).fill(''));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const inputRefs = useRef([]);

    const submitCode = async (codeToSubmit) => {
        if (codeToSubmit.length !== 6 || loading) return;

        try {
            setLoading(true);
            setError('');

            await api.post('/auth/2fa/email/verify', { code: codeToSubmit });

            onSuccess();
        } catch (err) {
            setError(
                err.response?.data?.error ||
                'Invalid verification code'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.substring(value.length - 1);
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

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
        const pastedData = e.clipboardData.getData('text').trim();

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-md rounded-xl border border-marquee-line bg-marquee-bg p-6 shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-marquee-line/50">
                    <h2 className="font-display text-2xl font-semibold tracking-wide text-marquee-goldBright">
                        Verify Email 2FA
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
                    >
                        <X />
                    </button>
                </div>

                <p className="mt-2 text-sm text-marquee-muted">
                    Enter the 6-digit code sent to your email.
                </p>

                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                    <div className="flex gap-2 justify-between" onPaste={handlePaste}>
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                disabled={loading}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="
                                    h-12 w-12 rounded-md
                                    border border-marquee-line
                                    bg-marquee-panel2
                                    text-center text-lg font-semibold
                                    text-marquee-cream
                                    outline-none
                                    transition
                                    focus:border-marquee-gold
                                    disabled:opacity-50
                                "
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
                        disabled={loading || otp.join('').length < 6}
                        className="
                            w-full rounded-full
                            bg-marquee-gold
                            py-3
                            font-semibold
                            text-marquee-bg
                            hover:bg-marquee-goldBright
                            disabled:opacity-50
                            transition
                        "
                    >
                        {loading ? 'Verifying...' : 'Enable 2FA'}
                    </button>
                </form>
            </div>
        </div>
    );
}