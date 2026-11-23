import { apiSlice } from './apiSlice';

export const paymentsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getPaymentMethods: builder.query({
            query: () => ({ url: '/payments/methods' }),
            transformResponse: (response) => response.paymentMethods || [],
            providesTags: [{ type: 'Users', id: 'PAYMENT-METHODS' }],
        }),
        createSetupIntent: builder.mutation({
            query: () => ({ url: '/payments/setup', method: 'POST' }),
        }),
        setDefaultPaymentMethod: builder.mutation({
            query: (id) => ({ url: `/payments/methods/${id}/default`, method: 'POST' }),
            invalidatesTags: [{ type: 'Users', id: 'PAYMENT-METHODS' }],
        }),
        deletePaymentMethod: builder.mutation({
            query: (id) => ({ url: `/payments/methods/${id}`, method: 'DELETE' }),
            invalidatesTags: [{ type: 'Users', id: 'PAYMENT-METHODS' }],
        }),
        createStripePaymentIntent: builder.mutation({
            query: (data) => ({ url: '/payments/stripe/create-intent', method: 'POST', data }),
        }),
        confirmStripePayment: builder.mutation({
            query: ({ order, paymentIntent }) => ({
                url: '/payments/stripe/confirm',
                method: 'POST',
                data: { orderId: order._id, paymentIntentId: paymentIntent.id },
            }),
            invalidatesTags: (result, error, { order }) => [
                { type: 'Orders', id: order._id },
                { type: 'Orders', id: 'LIST' },
                { type: 'Bookings', id: 'LIST' },
                { type: 'Tickets', id: 'LIST' },
            ],
        }),
        createPaypalOrder: builder.mutation({
            query: (bookingId) => ({ url: '/payments/paypal/create-order', method: 'POST', data: { bookingId } }),
        }),
        capturePaypalPayment: builder.mutation({
            query: ({ bookingId, orderID }) => ({
                url: '/payments/paypal/capture-order',
                method: 'POST',
                data: { bookingId, orderID },
            }),
            invalidatesTags: (result, error, { bookingId }) => [
                { type: 'Orders', id: bookingId },
                { type: 'Orders', id: 'LIST' },
                { type: 'Bookings', id: 'LIST' },
                { type: 'Tickets', id: 'LIST' },
            ],
        }),
        applyGiftCard: builder.mutation({
            query: ({ orderId, code }) => ({ url: `/orders/${orderId}/apply-gift-card`, method: 'POST', data: { code } }),
            invalidatesTags: (result, error, { orderId }) => [{ type: 'Orders', id: orderId }],
        }),
        removeGiftCard: builder.mutation({
            query: (orderId) => ({ url: `/orders/${orderId}/remove-gift-card`, method: 'POST' }),
            invalidatesTags: (result, error, orderId) => [{ type: 'Orders', id: orderId }],
        }),
        finalizeOrderWithGiftCard: builder.mutation({
            query: (orderId) => ({ url: `/orders/${orderId}/finalize-with-gift-card`, method: 'POST' }),
            invalidatesTags: (result, error, orderId) => [
                { type: 'Orders', id: orderId },
                { type: 'Orders', id: 'LIST' },
                { type: 'Tickets', id: 'LIST' },
            ],
        }),
        createGiftCard: builder.mutation({
            query: (data) => ({ url: '/giftcards', method: 'POST', data }),
            invalidatesTags: [{ type: 'GiftCards', id: 'LIST' }],
        }),
        createGiftCardPaymentIntent: builder.mutation({
            query: ({ giftCardId, paymentMethodId }) => ({
                url: '/giftcards/stripe/create-intent',
                method: 'POST',
                data: { giftCardId, ...(paymentMethodId ? { paymentMethodId } : {}) },
            }),
        }),
        confirmGiftCardPayment: builder.mutation({
            query: ({ giftCard, paymentIntent }) => ({
                url: '/giftcards/stripe/confirm',
                method: 'POST',
                data: { giftCardId: giftCard._id, paymentIntentId: paymentIntent.id },
            }),
            invalidatesTags: [{ type: 'GiftCards', id: 'LIST' }],
        }),
        createGiftCardPaypalOrder: builder.mutation({
            query: (giftCard) => ({
                url: '/giftcards/paypal/create-order',
                method: 'POST',
                data: { giftCardId: giftCard._id },
            }),
        }),
        captureGiftCardPaypalOrder: builder.mutation({
            query: ({ giftCard, orderID }) => ({
                url: '/giftcards/paypal/capture-order',
                method: 'POST',
                data: { giftCardId: giftCard._id, orderID },
            }),
            invalidatesTags: [{ type: 'GiftCards', id: 'LIST' }],
        }),
    }),
});

export const {
    useGetPaymentMethodsQuery,
    useCreateSetupIntentMutation,
    useSetDefaultPaymentMethodMutation,
    useDeletePaymentMethodMutation,
    useCreateStripePaymentIntentMutation,
    useConfirmStripePaymentMutation,
    useCreatePaypalOrderMutation,
    useCapturePaypalPaymentMutation,
    useApplyGiftCardMutation,
    useRemoveGiftCardMutation,
    useFinalizeOrderWithGiftCardMutation,
    useCreateGiftCardMutation,
    useCreateGiftCardPaymentIntentMutation,
    useConfirmGiftCardPaymentMutation,
    useCreateGiftCardPaypalOrderMutation,
    useCaptureGiftCardPaypalOrderMutation,
} = paymentsApiSlice;
