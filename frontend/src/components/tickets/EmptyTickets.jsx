import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function EmptyTickets() {
    const { t } = useTranslation('account');
    return (
        <div className="rounded-xl border border-dashed border-marquee-line p-10 text-center">
            <p className="text-marquee-muted">
                {t('emptyTickets')}
            </p>

            <Link to="/" className="mt-5 inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg border border-marquee-gold bg-marquee-panel2 px-6 py-3 text-sm font-semibold text-marquee-gold transition-all hover:border-marquee-gold/40 hover:bg-marquee-gold/10 hover:text-marquee-gold disabled:opacity-50">
                {t('browseMovies')}
            </Link>
        </div>
    );
}