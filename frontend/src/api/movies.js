import api from "./client";

export async function getMovieById(id) {
    const { data } = await api.get(`/movies/${id}`);

    return data;
};

export async function getMovieShowtimes(id) {
    const { data } = await api.get(`/movies/${id}/showtimes`);

    return data;
};