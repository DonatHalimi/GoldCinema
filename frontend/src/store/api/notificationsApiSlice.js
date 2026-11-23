import { apiSlice } from './apiSlice';

export const notificationsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getNotifications: builder.query({
            query: ({ filter = 'all', page = 1, limit = 20 } = {}) => ({
                url: '/notifications',
                params: { filter, page, limit },
            }),
            providesTags: (result) => [
                { type: 'Notifications', id: 'LIST' },
                ...(result?.notifications || []).map((item) => ({ type: 'Notifications', id: item._id })),
            ],
        }),
        markNotificationAsRead: builder.mutation({
            query: ({ id, read = true }) => ({ url: `/notifications/${id}/read`, method: 'PATCH', data: { read } }),
            invalidatesTags: [{ type: 'Notifications', id: 'LIST' }],
        }),
        markAllNotificationsAsRead: builder.mutation({
            query: () => ({ url: '/notifications/read-all', method: 'PATCH' }),
            invalidatesTags: [{ type: 'Notifications', id: 'LIST' }],
        }),
        updateNotificationArchive: builder.mutation({
            query: ({ id, archived }) => ({ url: `/notifications/${id}/archive`, method: 'PATCH', data: { archived } }),
            invalidatesTags: [{ type: 'Notifications', id: 'LIST' }],
        }),
        archiveAllReadNotifications: builder.mutation({
            query: () => ({ url: '/notifications/archive-all-read', method: 'PATCH' }),
            invalidatesTags: [{ type: 'Notifications', id: 'LIST' }],
        }),
        archiveAllNotifications: builder.mutation({
            query: () => ({ url: '/notifications/archive-all', method: 'PATCH' }),
            invalidatesTags: [{ type: 'Notifications', id: 'LIST' }],
        }),
        unarchiveAllNotifications: builder.mutation({
            query: () => ({ url: '/notifications/unarchive-all', method: 'PATCH' }),
            invalidatesTags: [{ type: 'Notifications', id: 'LIST' }],
        }),
        deleteNotification: builder.mutation({
            query: (id) => ({ url: `/notifications/${id}`, method: 'DELETE' }),
            invalidatesTags: [{ type: 'Notifications', id: 'LIST' }],
        }),
        clearArchivedNotifications: builder.mutation({
            query: () => ({ url: '/notifications/clear-archived', method: 'DELETE' }),
            invalidatesTags: [{ type: 'Notifications', id: 'LIST' }],
        }),
    }),
});

export const {
    useGetNotificationsQuery,
    useMarkNotificationAsReadMutation,
    useMarkAllNotificationsAsReadMutation,
    useUpdateNotificationArchiveMutation,
    useArchiveAllReadNotificationsMutation,
    useArchiveAllNotificationsMutation,
    useUnarchiveAllNotificationsMutation,
    useDeleteNotificationMutation,
    useClearArchivedNotificationsMutation,
} = notificationsApiSlice;
