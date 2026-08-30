import api from './client';

export async function getPaymentMethods() {
    const { data } = await api.get('/payments/methods');

    return data;
};

export async function createSetupIntent() {
    const { data } = await api.post('/payments/setup');

    return data;
};

export async function setDefaultPaymentMethod(id) {
    const { data } = await api.post(`/payments/methods/${id}/default`);

    return data;
};

export async function deletePaymentMethod(id) {
    const { data } = await api.delete(`/payments/methods/${id}`);

    return data;
};

export async function confirmStripePayment(order, paymentIntent) {
    const { data } = await api.post('/payments/stripe/confirm', {
        orderId: order._id,
        paymentIntentId: paymentIntent.id,
    });

    return data;
};

export async function createPaypalOrder(bookingId) {
    const { data } = await api.post('/payments/paypal/create-order', {
        bookingId,
    });

    return data;
};

export async function confirmPaypalPayment(bookingId, orderID) {
    const { data } = await api.post('/payments/paypal/capture-order', {
        bookingId,
        orderID,
    });

    return data;
}

export async function createStripePaymentIntent(request) {
    const { data } = await api.post('/payments/stripe/create-intent', request);

    return data;
}