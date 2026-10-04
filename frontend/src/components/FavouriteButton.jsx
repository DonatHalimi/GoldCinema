import { Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFavourites } from '../context/FavouriteContext';

export default function FavouriteButton({
    itemType,
    itemId,
    className = '',
    onToggle,
}) {
    const { t } = useTranslation('account');
    const { user } = useAuth();
    const { isFavourited, toggleFavourite } = useFavourites();
    const navigate = useNavigate();
    const favourited = isFavourited(itemType, itemId);

    async function handleClick(e) {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            navigate('/login');
            return;
        }

        try {
            const newFavourited = await toggleFavourite(itemType, itemId);
            onToggle?.(newFavourited);
        } catch { }
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            aria-label={favourited ? t('removeFromFavourites') : t('addToFavourites')}
            aria-pressed={favourited}
            className={`group/action relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black/50 backdrop-blur transition hover:bg-black/70 ${className}`}
        >
            <Heart
                size={16}
                className={favourited ? 'fill-marquee-gold text-marquee-gold' : 'text-white'}
            />

            <span
                className={`pointer-events-none absolute right-0 top-full z-20 mt-2 whitespace-nowrap rounded-md border bg-marquee-panel2 px-2.5 py-1.5 text-xs opacity-0 shadow-xl transition-opacity group-hover/action:opacity-100 ${favourited
                    ? 'border-marquee-gold/20 text-marquee-gold'
                    : 'border-marquee-line text-marquee-cream'
                    }`}
            >
                {favourited
                    ? t('removeFromFavourites')
                    : t('addToFavourites')}
            </span>
        </button>
    );
}