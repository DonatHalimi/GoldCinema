import { apiSlice } from './apiSlice';

export const moviesApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getMovies: builder.query({
            query: () => ({ url: '/movies' }),
            transformResponse: (response) => response.movies || [],
            providesTags: (movies) => [
                { type: 'Movies', id: 'LIST' },
                ...(movies || []).map((movie) => ({ type: 'Movies', id: movie._id })),
            ],
        }),
        getMovie: builder.query({
            query: (id) => ({ url: `/movies/${id}` }),
            transformResponse: (response) => response.movie,
            providesTags: (movie, error, id) => [{ type: 'Movies', id }],
        }),
        getMovieShowtimes: builder.query({
            query: (id) => ({ url: `/movies/${id}/showtimes` }),
            transformResponse: (response) => response.showtimes || [],
            providesTags: (showtimes, error, movieId) => [
                { type: 'Showtimes', id: `MOVIE-${movieId}` },
                ...(showtimes || []).map((showtime) => ({ type: 'Showtimes', id: showtime.id })),
            ],
        }),
        getShowtime: builder.query({
            query: (id) => ({ url: `/showtimes/${id}` }),
            transformResponse: (response) => response,
            providesTags: (result, error, id) => [
                { type: 'Showtimes', id },
                { type: 'Seats', id },
            ],
        }),
    }),
});

export const {
    useGetMoviesQuery,
    useGetMovieQuery,
    useGetMovieShowtimesQuery,
    useGetShowtimeQuery,
} = moviesApiSlice;
