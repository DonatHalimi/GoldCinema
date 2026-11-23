import { createApi } from '@reduxjs/toolkit/query/react';
import api from '../../api/client';

export const axiosBaseQuery = async (
    { url, method = 'GET', data, params, headers, responseType },
    { signal }
) => {
    try {
        const response = await api.request({
            url,
            method,
            data,
            params,
            headers,
            responseType,
            signal,
        });
        return { data: response.data };
    } catch (error) {
        if (api.isCancel?.(error) || error.code === 'ERR_CANCELED') {
            return { error: { status: 'CANCELLED', data: null } };
        }
        return {
            error: {
                status: error.response?.status ?? 'FETCH_ERROR',
                data: error.response?.data ?? { error: error.message || 'Request failed.' },
            },
        };
    }
};

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: axiosBaseQuery,
    tagTypes: [
        'Movies',
        'Showtimes',
        'Seats',
        'Bookings',
        'Orders',
        'Tickets',
        'Reviews',
        'Favourites',
        'Notifications',
        'Users',
        'Staff',
        'Shifts',
        'Equipment',
        'Analytics',
        'GiftCards',
        'Roles',
        'Permissions',
        'EmailTemplates',
    ],
    endpoints: () => ({}),
});
