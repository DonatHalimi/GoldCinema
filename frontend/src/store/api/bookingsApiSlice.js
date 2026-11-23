import { apiSlice } from './apiSlice';

export const bookingsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
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
    useExtendSeatHoldMutation,
    useCreateOrderMutation,
    useGetOrderQuery,
    useGetMyOrdersQuery,
} = bookingsApiSlice;
