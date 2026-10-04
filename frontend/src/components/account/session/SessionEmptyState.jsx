import { motion } from 'framer-motion';
import { Laptop } from 'lucide-react';
import { useTranslation } from 'react-i18next';


export default function SessionEmptyState() {
    const { t } = useTranslation('account');
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-marquee-line py-12 text-center"
        >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-marquee-line bg-marquee-panel2 text-marquee-goldDim">
                <Laptop size={22} />
            </div>

            <div>
                <p className="text-sm font-medium text-marquee-cream">{t('sessionsOnlyThisDevice')}</p>

                <p className="mt-1 text-xs text-marquee-muted">{t('sessionsNoOtherActiveSessions')}</p>
            </div>
        </motion.div>
    );
}