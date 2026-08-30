import api from "./client";

export async function holdSeat(request) {
    const { data } = await api.post('/hold-seat', request);

    return data;
}

export async function extendSeatHold(holdId) {
    const { data } = await api.post('/extend-hold', { holdId });

    return data;
};