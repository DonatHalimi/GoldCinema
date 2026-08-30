import api from './client';

export async function toggleFavourite(itemType, itemId) {
    const { data } = await api.post('/favourites/toggle', { itemType, itemId, });

    return data;
};

export async function getMyFavourites(type) {
    const { data } = await api.get('/favourites/mine', { params: type ? { type } : {}, });

    return data;
};