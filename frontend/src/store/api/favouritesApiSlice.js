import { apiSlice } from './apiSlice';

export const favouritesApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getMyFavourites: builder.query({
            query: (type) => ({ url: '/favourites/mine', params: type ? { type } : undefined }),
            providesTags: (result) => [
                { type: 'Favourites', id: 'LIST' },
                ...(result?.movies || []).map((movie) => ({ type: 'Favourites', id: `movie-${movie._id}` })),
                ...(result?.cinemas || []).map((cinema) => ({ type: 'Favourites', id: `cinema-${cinema._id}` })),
            ],
        }),
        toggleFavourite: builder.mutation({
            query: ({ itemType, itemId }) => ({
                url: '/favourites/toggle',
                method: 'POST',
                data: { itemType, itemId },
            }),
            invalidatesTags: (result, error, { itemType, itemId }) => [
                { type: 'Favourites', id: 'LIST' },
                { type: 'Favourites', id: `${itemType}-${itemId}` },
            ],
        }),
    }),
});

export const { useGetMyFavouritesQuery, useToggleFavouriteMutation } = favouritesApiSlice;
