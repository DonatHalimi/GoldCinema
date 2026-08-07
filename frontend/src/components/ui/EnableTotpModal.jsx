import { useState, useRef, useEffect } from "react";
import api from "../../api/client";
import { X, Loader2, Copy, Check } from "lucide-react";

export default function EnableTotpModal({
    onClose,
    onSuccess
}) {
    const [qr, setQr] = useState(null);
    const [secret, setSecret] = useState("");
    const [otp, setOtp] = useState(Array(6).fill(""));
    const [backupCodes, setBackupCodes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const inputRefs = useRef([]);

    const startSetup = async () => {
        try {
            setLoading(true);
            setError("");
            const { data } = await api.post(
                "/auth/2fa/totp/setup"
            );

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

    const submitCode = async (codeToSubmit) => {
        if (codeToSubmit.length !== 6 || loading) return;

        try {
            setLoading(true);
            setError("");

            const { data } = await api.post(
                "/auth/2fa/totp/verify",
                {
                    code: codeToSubmit
                }
            );

            setBackupCodes(data.backupCodes);
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

        const fullCode = newOtp.join("");
        if (fullCode.length === 6 && newOtp.every((digit) => digit !== "")) {
            submitCode(fullCode);
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData("text").trim();

        if (/^\d{6}$/.test(pastedData)) {
            const digits = pastedData.split("");
            setOtp(digits);
            inputRefs.current[5]?.focus();
            submitCode(pastedData);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        submitCode(otp.join(""));
    };

    return (
        <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-md rounded-xl border border-marquee-line bg-marquee-bg p-6 shadow-2xl">
                <div className="flex justify-between items-center">
                    <h2 className="font-display text-2xl font-semibold tracking-wide text-marquee-goldBright">
                        Authenticator App
                    </h2>

                    <button
                        onClick={onClose}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
                    >
                        <X />
                    </button>
                </div>

                {loading && !qr && !backupCodes.length && (
                    <div className="flex flex-col items-center justify-center py-10">
                        <Loader2 className="animate-spin w-8 h-8 text-marquee-gold" />
                        <p className="mt-3 text-sm text-marquee-muted">Generating setup...</p>
                    </div>
                )}

                {qr && !backupCodes.length && (
                    <div className="mt-5">
                        <p className="
                            text-sm
                            text-marquee-muted
                        ">
                            Scan this QR code with your authenticator app
                        </p>

                        <img src={qr} className="mx-auto mt-4 w-48 h-48" />
                        <div className="mt-6 rounded-lg border border-marquee-line bg-marquee-panel2 p-3 space-y-1.5">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium uppercase tracking-wider text-marquee-muted">
                                    Can't scan? Use setup key
                                </span>
                            </div>
                            <div className="overflow-x-auto py-1">
                                <code className="block text-xs font-mono tracking-wider break-all text-marquee-cream bg-black/20 p-2 rounded">
                                    {secret}
                                </code>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-medium text-marquee-muted">
                                    Enter 6-digit verification code from your app
                                </label>
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
                                                h-12 w-12
                                                rounded-md
                                                border
                                                border-marquee-line
                                                bg-marquee-panel2
                                                text-center
                                                text-lg
                                                font-semibold
                                                text-marquee-cream
                                                outline-none
                                                transition
                                                focus:border-marquee-gold
                                                disabled:opacity-50
                                            "
                                        />
                                    ))}
                                </div>
                            </div>

                            {error && (
                                <p className="text-sm text-red-400">
                                    {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                disabled={loading || otp.join("").length < 6}
                                className="
                                    mt-4
                                    w-full
                                    rounded-full
                                    bg-marquee-gold
                                    px-5
                                    py-2
                                    font-semibold
                                    text-zinc-950
                                    flex items-center justify-center
                                    hover:bg-opacity-90
                                    disabled:opacity-50
                                    transition
                                "
                            >
                                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Verify & Enable"}
                            </button>
                        </form>
                    </div>
                )}

                {backupCodes.length > 0 && (
                    <div className="mt-5">
                        <h3 className="
                            font-semibold
                            text-green-400
                        ">
                            Save your backup codes
                        </h3>

                        <div className="
                            mt-3
                            grid
                            grid-cols-2
                            gap-2
                        ">
                            {backupCodes.map((code) => (
                                <div
                                    key={code}
                                    className="
                                        rounded
                                        bg-marquee-panel2
                                        p-2
                                        text-sm
                                        text-marquee-cream
                                    "
                                >
                                    {code}
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => {
                                onSuccess();
                            }}
                            className="
                                mt-5
                                w-full
                                rounded-full
                                bg-marquee-gold
                                px-5
                                py-2
                                font-semibold
                                text-zinc-950
                                hover:bg-opacity-90
                                transition
                            "
                        >
                            Done
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}