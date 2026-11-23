import { apiSlice } from './apiSlice';

export const reviewsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getMovieReviews: builder.query({
            query: ({ movieId, page = 1, limit = 10 }) => ({
                url: `/reviews/movie/${movieId}`,
                params: { page, limit },
            }),
            providesTags: (result, error, { movieId }) => [
                { type: 'Reviews', id: `MOVIE-${movieId}` },
                ...(result?.reviews || []).map((review) => ({ type: 'Reviews', id: review._id })),
            ],
        }),
        getMyReviews: builder.query({
            query: () => ({ url: '/reviews/my' }),
            providesTags: (result) => [
                { type: 'Reviews', id: 'MINE' },
                ...(result?.reviews || []).map((review) => ({ type: 'Reviews', id: review._id })),
            ],
        }),
        createReview: builder.mutation({
            query: (data) => ({ url: '/reviews', method: 'POST', data }),
            invalidatesTags: (result, error, { movie }) => [
                { type: 'Reviews', id: `MOVIE-${movie}` },
                { type: 'Reviews', id: 'MINE' },
                { type: 'Movies', id: movie },
            ],
        }),
        updateReview: builder.mutation({
            query: ({ reviewId, ...data }) => ({ url: `/reviews/${reviewId}`, method: 'PUT', data }),
            invalidatesTags: (result, error, { reviewId }) => [
                { type: 'Reviews', id: reviewId },
                { type: 'Reviews', id: 'MINE' },
                { type: 'Reviews', id: 'LIST' },
            ],
        }),
        deleteReview: builder.mutation({
            query: (reviewId) => ({ url: `/reviews/${reviewId}`, method: 'DELETE' }),
            invalidatesTags: (result, error, reviewId) => [
                { type: 'Reviews', id: reviewId },
                { type: 'Reviews', id: 'MINE' },
                { type: 'Reviews', id: 'LIST' },
            ],
        }),
    }),
});

export const {
    useGetMovieReviewsQuery,
    useGetMyReviewsQuery,
    useCreateReviewMutation,
    useUpdateReviewMutation,
    useDeleteReviewMutation,
} = reviewsApiSlice;
