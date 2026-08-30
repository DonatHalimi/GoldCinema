import api from "./client";

export async function getShowtimeById(id) {
    const { data } = await api.get(`/showtimes/${id}`);

    return data;
}
