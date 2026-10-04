import { Download, Eye, EyeOff, KeyRound, RefreshCw, ShieldAlert } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { generateBackupCodes } from '../../api/auth';

export default function BackupCodesCard({ twoFactor }) {
    const { t } = useTranslation('account');
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
            const { data } = await generateBackupCodes();

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
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-marquee-line/30 text-marquee-gold">
                        <KeyRound className="h-5 w-5" />
                    </div>

                    <div>
                        <h3 className="font-semibold text-marquee-cream">
                            {t('backupHeader')}
                        </h3>
                        <p className="text-sm text-marquee-muted">
                            {t('backupDesc')}
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleGenerateCodes}
                    disabled={loading || !isTotpEnabled}
                    className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-marquee-gold bg-marquee-panel2 px-3 py-2 text-xs font-semibold text-marquee-gold transition-all hover:border-marquee-gold/40 hover:bg-marquee-gold/10 hover:text-marquee-gold disabled:opacity-50"
                >
                    <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                    {codes.length > 0 ? t('regenCodes') : t('genCodes')}
                </button>
            </div>

            {!isTotpEnabled && (
                <div className="mt-4 flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-xs text-yellow-400">
                    <ShieldAlert className="h-4 w-4 shrink-0" />

                    <span className="text-sm text-marquee-muted">
                        {t('authReqDesc')}
                    </span>
                </div>
            )}

            {isTotpEnabled && codes.length > 0 && (
                <div className="mt-4 rounded-lg border border-marquee-line bg-marquee-panel2 p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <p className="text-xs text-marquee-muted">
                            {t('storeCodesDesc')}
                        </p>

                        <button
                            type="button"
                            onClick={handleToggleVisibility}
                            className="ml-4 inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-marquee-gold transition hover:text-marquee-goldBright"
                        >
                            {showCodes ? (
                                <>
                                    <EyeOff className="h-4 w-4" />
                                    {t('hideCodes')}
                                </>
                            ) : (
                                <>
                                    <Eye className="h-4 w-4" />
                                    {t('showCodes')}
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
                        {t('downloadCodesFile')}
                    </button>
                </div>
            )}
        </div>
    );
}