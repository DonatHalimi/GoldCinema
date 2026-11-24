import { apiSlice } from './apiSlice';

export const bookingsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getConcessions: builder.query({
            query: () => ({ url: '/orders/concessions' }),
            transformResponse: (response) => response.concessions || [],
        }),
        holdSeats: builder.mutation({
            query: (request) => ({ url: '/hold-seat', method: 'POST', data: request }),
            invalidatesTags: (result, error, request) => [
                { type: 'Seats', id: request.showtimeId },
                { type: 'Showtimes', id: request.showtimeId },
            ],
        }),
        extendSeatHold: builder.mutation({
            query: (holdId) => ({ url: '/extend-hold', method: 'POST', data: { holdId } }),
            invalidatesTags: ['Bookings'],
        }),
        createOrder: builder.mutation({
            query: (request) => ({ url: '/orders', method: 'POST', data: request }),
            transformResponse: (response) => response.order,
            invalidatesTags: [{ type: 'Orders', id: 'LIST' }, { type: 'Bookings', id: 'LIST' }],
        }),
        setOrderConcessions: builder.mutation({
            query: ({ orderId, items }) => ({
                url: `/orders/${orderId}/concessions`,
                method: 'PUT',
                data: { items },
            }),
            transformResponse: (response) => response.order,
            invalidatesTags: (result, error, { orderId }) => [{ type: 'Orders', id: orderId }],
        }),
        getOrder: builder.query({
            query: (id) => ({ url: `/orders/${id}` }),
            transformResponse: (response) => (response.data ?? response).order,
            providesTags: (order, error, id) => [{ type: 'Orders', id }],
        }),
        getMyOrders: builder.query({
            query: () => ({ url: '/orders/mine' }),
            transformResponse: (response) => response.orders || [],
            providesTags: (orders) => [
                { type: 'Orders', id: 'LIST' },
                ...(orders || []).map((order) => ({ type: 'Orders', id: order._id })),
            ],
        }),
    }),
});

export const {
    useHoldSeatsMutation,
    useGetConcessionsQuery,
    useExtendSeatHoldMutation,
    useCreateOrderMutation,
    useSetOrderConcessionsMutation,
    useGetOrderQuery,
    useGetMyOrdersQuery,
} = bookingsApiSlice;
