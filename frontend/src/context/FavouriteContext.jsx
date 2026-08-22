import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getMyFavourites, toggleFavourite as toggleFavouriteApi } from '../api/client';
import { useAuth } from './AuthContext';

const FavouritesContext = createContext(null);

export function FavouritesProvider({ children }) {
    const { user } = useAuth();
    const [movieIds, setMovieIds] = useState(new Set());
    const [cinemaIds, setCinemaIds] = useState(new Set());
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user) {
            setMovieIds(new Set());
            setCinemaIds(new Set());
            return;
        }

        setLoading(true);
        getMyFavourites()
            .then(({ movies, cinemas }) => {
                setMovieIds(new Set(movies.map((m) => m._id)));
                setCinemaIds(new Set(cinemas.map((c) => c._id)));
            })
            .catch(() => {
                // Non-critical: favourite state just stays empty/stale on failure.
            })
            .finally(() => setLoading(false));
    }, [user]);

    const isFavourited = useCallback(
        (itemType, itemId) => (itemType === 'movie' ? movieIds : cinemaIds).has(itemId),
        [movieIds, cinemaIds]
    );

    const toggleFavourite = useCallback(async (itemType, itemId) => {
        // Optimistic update, rolled back if the request fails.
        const setFn = itemType === 'movie' ? setMovieIds : setCinemaIds;
        const wasFavourited = (itemType === 'movie' ? movieIds : cinemaIds).has(itemId);

        setFn((prev) => {
            const next = new Set(prev);
            wasFavourited ? next.delete(itemId) : next.add(itemId);
            return next;
        });

        try {
            const { favourited } = await toggleFavouriteApi(itemType, itemId);
            setFn((prev) => {
                const next = new Set(prev);
                favourited ? next.add(itemId) : next.delete(itemId);
                return next;
            });
            return favourited;
        } catch (err) {
            setFn((prev) => {
                const next = new Set(prev);
                wasFavourited ? next.add(itemId) : next.delete(itemId);
                return next;
            });
            throw err;
        }
    }, [movieIds, cinemaIds]);

    return (
        <FavouritesContext.Provider value={{ isFavourited, toggleFavourite, loading }}>
            {children}
        </FavouritesContext.Provider>
    );
}

export const useFavourites = () => useContext(FavouritesContext);