import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function EmptyTickets() {
    const { t } = useTranslation('account');
    return (
        <div className="rounded-xl border border-dashed border-marquee-line p-10 text-center">
            <p className="text-marquee-muted">
                {t('emptyTickets')}
            </p>

            <Link to="/" className="mt-4 inline-block rounded-full bg-marquee-gold px-6 py-2 font-semibold text-marquee-bg">
                {t('browseMovies')}
            </Link>
        </div>
    );
}