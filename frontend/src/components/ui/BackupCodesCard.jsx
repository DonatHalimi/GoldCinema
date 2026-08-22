import { Download, Eye, EyeOff, KeyRound, RefreshCw, ShieldAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/client';

export default function BackupCodesCard({ twoFactor }) {
    const [codes, setCodes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCodes, setShowCodes] = useState(true);

    const isTotpEnabled = twoFactor?.enabled && twoFactor?.methods?.includes('totp');

    useEffect(() => {
        const storedCodes = sessionStorage.getItem('goldcinema-backup-codes');

        if (storedCodes) {
            try {
                const parsedCodes = JSON.parse(storedCodes);

                if (Array.isArray(parsedCodes)) {
                    setCodes(parsedCodes);
                    setShowCodes(true);
                }
            } catch {
                sessionStorage.removeItem('goldcinema-backup-codes');
            }
        }
    }, []);

    const handleGenerateCodes = async () => {
        if (!isTotpEnabled) return;

        setLoading(true);

        try {
            const { data } = await api.post('/auth/security/backup-codes');

            const newCodes = data.backupCodes || [];

            setCodes(newCodes);
            setShowCodes(true);

            sessionStorage.setItem(
                'goldcinema-backup-codes',
                JSON.stringify(newCodes)
            );

            toast.success('New backup recovery codes generated');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to generate backup recovery codes');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        if (!codes.length) return;

        const blob = new Blob(
            [codes.join('\n')],
            { type: 'text/plain' }
        );

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');

        a.href = url;
        a.download = 'goldcinema-backup-codes.txt';

        document.body.appendChild(a);
        a.click();
        a.remove();

        URL.revokeObjectURL(url);
    };

    const handleToggleVisibility = () => {
        setShowCodes((current) => !current);
    };

    return (
        <div className="rounded-xl border border-marquee-line bg-marquee-bg p-5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-marquee-line/30 text-marquee-gold">
                        <KeyRound className="h-5 w-5" />
                    </div>

                    <div>
                        <h3 className="font-semibold text-marquee-cream">
                            Backup Recovery Codes
                        </h3>

                        <p className="text-sm text-marquee-muted">
                            Use backup codes to access your account if you lose your device or authenticator app.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleGenerateCodes}
                    disabled={loading || !isTotpEnabled}
                    className="inline-flex items-center gap-2 rounded-full bg-marquee-gold px-4 py-2 text-xs font-semibold text-marquee-bg transition hover:bg-marquee-goldBright disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />

                    {codes.length > 0 ? 'Regenerate Codes' : 'Generate Codes'}
                </button>
            </div>

            {!isTotpEnabled && (
                <div className="mt-4 flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-xs text-yellow-400">
                    <ShieldAlert className="h-4 w-4 shrink-0" />

                    <span>
                        Authenticator App 2FA must be enabled to generate backup recovery codes.
                    </span>
                </div>
            )}

            {isTotpEnabled && codes.length > 0 && (
                <div className="mt-4 rounded-lg border border-marquee-line bg-marquee-panel2 p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <p className="text-xs text-marquee-muted">
                            Store these codes safely. Each code can only be used once.
                            Regenerating your codes invalidates the previous set.
                        </p>

                        <button
                            type="button"
                            onClick={handleToggleVisibility}
                            className="ml-4 inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-marquee-gold transition hover:text-marquee-goldBright"
                        >
                            {showCodes ? (
                                <>
                                    <EyeOff className="h-4 w-4" />
                                    Hide
                                </>
                            ) : (
                                <>
                                    <Eye className="h-4 w-4" />
                                    Show
                                </>
                            )}
                        </button>
                    </div>

                    <div className="mb-4 grid grid-cols-2 gap-2 font-mono text-sm text-marquee-cream">
                        {codes.map((code, idx) => (
                            <div key={idx} className="rounded border border-marquee-line bg-marquee-bg px-3 py-1.5 text-center tracking-wider">
                                {showCodes ? code : '••••••••'}
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={handleDownload}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-marquee-gold hover:text-marquee-goldBright"
                    >
                        <Download className="h-4 w-4" />
                        Download Codes File
                    </button>
                </div>
            )}
        </div>
    );
}