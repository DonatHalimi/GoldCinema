import api from "./client";

export async function createContact(request) {
    const { data } = await api.post('/contact', request);

    return data;
};
