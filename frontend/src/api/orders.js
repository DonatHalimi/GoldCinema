import api from "./client";

export async function getMyOrders() {
    const { data } = await api.get('/orders/mine');

    return data.orders;
};

export async function getOrderById(id) {
    const { data } = await api.get(`/orders/${id}`);

    return data;
};

export async function createOrder(request) {
    const { data } = await api.post('/orders', request);

    return data;
}