import { Download, FileText } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { exportLogs } from '../../api/auth';

export default function SecurityLogExportCard() {
    const { t } = useTranslation('account');
    const [exporting, setExporting] = useState(false);

    const handleExport = async () => {
        setExporting(true);

        try {
            const response = await exportLogs();
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'goldcinema-security-activity-log.json');
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Security logs exported successfully.');
        } catch (err) {
            toast.error('Failed to export security logs.');
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="rounded-xl border border-marquee-line bg-marquee-bg p-5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-marquee-line/30 text-marquee-gold">
                        <FileText className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-marquee-cream">{t('securityLogExportHeader')}</h3>
                        <p className="text-sm text-marquee-muted">
                            {t('downloadSecurityLogDesc')}
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleExport}
                    disabled={exporting}
                    className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg border border-marquee-gold bg-marquee-panel2 px-3 py-2 text-xs font-semibold text-marquee-gold transition-all hover:border-marquee-gold/40 hover:bg-marquee-gold/10 hover:text-marquee-gold disabled:opacity-50"
                >
                    <Download className="h-3.5 w-3.5 text-marquee-gold" />
                    {exporting ? t('exportingActivityLog') : t('exportActivityLog')}
                </button>
            </div>
        </div>
    );
}