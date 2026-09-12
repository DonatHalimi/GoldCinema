import api from './client';

export async function createGiftCard(payload) {
    const { data } = await api.post('/giftcards', payload);
    return data;
};

export async function createGiftCardPaymentIntent({ giftCardId, paymentMethodId }) {
    const { data } = await api.post('/giftcards/stripe/create-intent', {
        giftCardId,
        ...(paymentMethodId ? { paymentMethodId } : {}),
    });

    return data;
};

export async function confirmGiftCardPayment(giftCard, paymentIntent) {
    const { data } = await api.post('/giftcards/stripe/confirm', {
        giftCardId: giftCard._id,
        paymentIntentId: paymentIntent.id,
    });

    return data;
};

export async function createGiftCardPaypalOrder(giftCard) {
    const { data } = await api.post('/giftcards/paypal/create-order', { giftCardId: giftCard._id, });

    return data;
};

export async function captureGiftCardPaypalOrder(giftCard, orderID) {
    const { data } = await api.post('/giftcards/paypal/capture-order', {
        giftCardId: giftCard._id,
        orderID,
    });

    return data;
};

export async function lookupGiftCard(code) {
    const { data } = await api.get(`/giftcards/lookup/${code}`);
    return data;
};

export async function redeemGiftCard(code, orderId, amount) {
    const { data } = await api.post('/giftcards/redeem', {
        code,
        orderId,
        amount,
    });

    return data;
};

export async function applyGiftCard(orderId, code) {
    const { data } = await api.post(`/orders/${orderId}/apply-gift-card`, { code });

    return data;
};

export async function removeGiftCard(orderId) {
    const { data } = await api.post(`/orders/${orderId}/remove-gift-card`);

    return data;
};

export async function finalizeOrderWithGiftCard(orderId) {
    const { data } = await api.post(`/orders/${orderId}/finalize-with-gift-card`);

    return data;
};

export async function createOrderStripePaymentIntent({ orderId, paymentMethodId }) {
    const { data } = await api.post('/payments/stripe/create-intent', {
        orderId,
        ...(paymentMethodId ? { paymentMethodId } : {}),
    });

    return data;
};