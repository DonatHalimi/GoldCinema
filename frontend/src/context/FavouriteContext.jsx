import { createContext, useCallback, useContext, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { useGetMyFavouritesQuery, useToggleFavouriteMutation } from '../store/api/favouritesApiSlice';

const FavouritesContext = createContext(null);

export function FavouritesProvider({ children }) {
    const { user } = useAuth();
    const { data, isFetching } = useGetMyFavouritesQuery(undefined, { skip: !user });
    const [toggleRequest] = useToggleFavouriteMutation();
    const movieIds = useMemo(() => new Set((data?.movies || []).map((movie) => movie._id)), [data?.movies]);
    const cinemaIds = useMemo(() => new Set((data?.cinemas || []).map((cinema) => cinema._id)), [data?.cinemas]);

    const isFavourited = useCallback(
        (itemType, itemId) => (itemType === 'movie' ? movieIds : cinemaIds).has(itemId),
        [movieIds, cinemaIds]
    );

    const toggleFavourite = useCallback(async (itemType, itemId) => {
        const result = await toggleRequest({ itemType, itemId }).unwrap();
        return result.favourited;
    }, [toggleRequest]);

    return (
        <FavouritesContext.Provider value={{ isFavourited, toggleFavourite, loading: Boolean(user && isFetching) }}>
            {children}
        </FavouritesContext.Provider>
    );
}

export const useFavourites = () => useContext(FavouritesContext);
