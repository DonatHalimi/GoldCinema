import { Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { useFavourites } from '../context/FavouriteContext';

export default function FavouriteButton({
    itemType,
    itemId,
    className = '',
    onToggle,
}) {
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
        } catch {
            // Optimistic update already rolled back in context.
        }
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            aria-label={
                favourited
                    ? 'Remove from favourites'
                    : 'Add to favourites'
            }
            aria-pressed={favourited}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/50 backdrop-blur transition hover:bg-black/70 ${className}`}
        >
            <Heart
                size={16}
                className={
                    favourited
                        ? 'fill-marquee-gold text-marquee-gold'
                        : 'text-white'
                }
            />
        </button>
    );
}