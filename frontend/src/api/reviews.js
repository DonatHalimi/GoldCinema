import api from './client';

export async function getMovieReviews(movieId, page = 1, limit = 10) {
    const { data } = await api.get(`/reviews/movie/${movieId}?page=${page}&limit=${limit}`);

    return data;
};

export async function getMyReviews() {
    const { data } = await api.get('/reviews/my');

    return data;
};

export async function createReview(payload) {
    const { data } = await api.post('/reviews', payload);

    return data;
};

export async function updateReview(reviewId, payload) {
    const { data } = await api.put(`/reviews/${reviewId}`, payload);

    return data;
};

export async function deleteReview(reviewId) {
    const { data } = await api.delete(`/reviews/${reviewId}`);

    return data;
};