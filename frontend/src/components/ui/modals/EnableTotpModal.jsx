import { Download, Loader2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { setupTotp2FA, verifyTotp2FA } from '../../../api/auth';
import Modal from './Modal';

export default function EnableTotpModal({ onClose, onSuccess }) {
    const [qr, setQr] = useState(null);
    const [secret, setSecret] = useState('');
    const [otp, setOtp] = useState(
        Array(6).fill('')
    );
    const [backupCodes, setBackupCodes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const inputRefs = useRef([]);

    const startSetup = async () => {
        try {
            setLoading(true);
            setError('');

            const { data } = await setupTotp2FA();

            setQr(data.qrDataUrl);
            setSecret(data.secret);
        } catch (err) {
            setError(
                err.response?.data?.error ||
                err.message
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        startSetup();
    }, []);

    useEffect(() => {
        if (qr && !backupCodes.length) {
            const timer = setTimeout(() => { inputRefs.current[0]?.focus(); }, 100);

            return () => clearTimeout(timer);
        }
    }, [qr, backupCodes.length]);

    const submitCode = async (codeToSubmit) => {
        if (codeToSubmit.length !== 6 || loading) return;

        try {
            setLoading(true);
            setError('');

            const { data } = await verifyTotp2FA(codeToSubmit);

            setBackupCodes(data.backupCodes);
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid verification code');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];

        newOtp[index] = value.substring(
            value.length - 1
        );

        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        const fullCode = newOtp.join('');

        if (fullCode.length === 6 && newOtp.every((digit) => digit !== '')) {
            submitCode(fullCode);
        }
    };

    const handleKeyDown = (index, event) => {
        if (event.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (event) => {
        event.preventDefault();

        const pastedData = event.clipboardData.getData('text').trim();

        if (/^\d{6}$/.test(pastedData)) {
            const digits = pastedData.split('');

            setOtp(digits);

            inputRefs.current[5]?.focus();

            submitCode(pastedData);
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        submitCode(otp.join(''));
    };

    const handleDownload = () => {
        const blob = new Blob([backupCodes.join('\n')], { type: 'text/plain' });

        const url = URL.createObjectURL(blob);

        const anchor = document.createElement('a');

        anchor.href = url;
        anchor.download = 'goldcinema-backup-codes.txt';

        anchor.click();

        URL.revokeObjectURL(url);
    };

    const formattedSecret = secret
        ? secret.match(/.{1,4}/g)?.join(' ') ||
        secret
        : '';

    return (
        <Modal
            isOpen
            onClose={onClose}
            title="Authenticator App"
            closeDisabled={loading}
        >
            {loading &&
                !qr &&
                !backupCodes.length && (
                    <div className="flex flex-col items-center justify-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-marquee-gold" />

                        <p className="mt-3 text-sm text-marquee-muted">
                            Generating setup...
                        </p>
                    </div>
                )}

            {qr && !backupCodes.length && (
                <div className="mt-5">
                    <p className="text-sm text-marquee-muted">
                        Scan this QR code with your
                        authenticator app
                    </p>

                    <img
                        src={qr}
                        alt="Authenticator setup QR code"
                        className="mx-auto mt-4 h-48 w-48"
                    />

                    <div className="mt-6 space-y-2 rounded-lg border border-marquee-line bg-marquee-panel2 p-4 text-left">
                        <span className="block text-xs font-medium uppercase tracking-wider text-marquee-muted">
                            Can't scan? Use setup key
                        </span>

                        <div className="text-center">
                            <div className="inline-block rounded-md border border-marquee-line/50 bg-black/30 px-4 py-2.5">
                                <code className="font-mono text-sm tracking-widest text-marquee-cream">
                                    {formattedSecret}
                                </code>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-medium text-marquee-muted">
                                Enter 6-digit verification
                                code from your app
                            </label>

                            <div
                                className="flex justify-between gap-2"
                                onPaste={handlePaste}
                            >
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(element) => { inputRefs.current[index] = element; }}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        disabled={loading}
                                        onChange={(event) => handleChange(index, event.target.value)}
                                        onKeyDown={(event) => handleKeyDown(index, event)}
                                        className="h-12 w-12 rounded-md border border-marquee-line bg-marquee-panel2 text-center text-lg font-semibold text-marquee-cream outline-none transition focus:border-marquee-gold disabled:opacity-50"
                                    />
                                ))}
                            </div>
                        </div>

                        {error && <p className="text-sm text-red-400">{error}</p>}

                        <button
                            type="submit"
                            disabled={
                                loading ||
                                otp.join('').length <
                                6
                            }
                            className="mt-4 flex w-full items-center justify-center rounded-full bg-marquee-gold px-5 py-2 font-semibold text-zinc-950 transition hover:bg-opacity-90 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    <span className="ml-2">
                                        Verifying
                                    </span>
                                </>
                            ) : (
                                'Verify & Enable'
                            )}
                        </button>
                    </form>
                </div>
            )}

            {backupCodes.length > 0 && (
                <div className="mt-5">
                    <h3 className="font-semibold text-green-400">
                        Save your backup codes
                    </h3>

                    <p className="mt-1 text-xs text-marquee-muted">
                        Store these codes safely. Each
                        code can only be used once.
                    </p>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                        {backupCodes.map((code) => (
                            <div
                                key={code}
                                className="rounded bg-marquee-panel2 p-2 text-center font-mono text-sm tracking-wider text-marquee-cream"
                            >
                                {code}
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={handleDownload}
                        className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-marquee-line bg-marquee-panel2 px-4 py-2 text-xs font-semibold text-marquee-cream transition hover:border-marquee-gold"
                    >
                        <Download className="h-4 w-4 text-marquee-gold" />
                        Download Codes File
                    </button>

                    <button
                        type="button"
                        onClick={onSuccess}
                        className="mt-3 w-full rounded-full bg-marquee-gold px-5 py-2 font-semibold text-zinc-950 transition hover:bg-opacity-90"
                    >
                        Done
                    </button>
                </div>
            )}
        </Modal>
    );
}