import api from './client';

export async function getItems(resource, page = 1, limit = 10) {
    const { data } = await api.get(`/admin/${resource}?page=${page}&limit=${limit}`);
    return data;
};

export async function getItemById(resource, id) {
    const { data } = await api.get(`/admin/${resource}/${id}`);

    return data;
};

export async function createItem(resource, payload) {
    const { data } = await api.post(`/admin/${resource}`, payload);

    return data;
};

export async function updateItem(resource, id, payload) {
    const { data } = await api.put(`/admin/${resource}/${id}`, payload);

    return data;
};

export async function deleteItem(resource, id) {
    const { data } = await api.delete(`/admin/${resource}/${id}`);

    return data;
};

export async function bulkDeleteItems(resource, ids) {
    const { data } = await api.delete(`/admin/${resource}/bulk-delete`, { data: { ids }, }
    );

    return data;
};