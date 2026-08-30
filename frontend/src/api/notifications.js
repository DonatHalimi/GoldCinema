import api from "./client";

export async function getNotifications(filter, page, limit = 20) {
    const { data } = await api.get('/notifications', {
        params: {
            filter,
            page,
            limit,
        },
    });

    return data;
};

export async function markNotificationAsRead(id, read = true) {
    const { data } = await api.patch(`/notifications/${id}/read`, { read });

    return data;
};

export async function markAllNotificationsAsRead() {
    const { data } = await api.patch('/notifications/read-all');

    return data;
};

export async function toggleNotificationArchive(id, archived) {
    const { data } = await api.patch(`/notifications/${id}/archive`, { archived });

    return data;
};

export async function archiveAllReadNotifications() {
    const { data } = await api.patch('/notifications/archive-all-read');

    return data;
};

export async function markAllNotificationsAsArchived() {
    const { data } = await api.patch('/notifications/archive-all');

    return data;
};

export async function markAllNotificationsAsUnarchived() {
    const { data } = await api.patch('/notifications/unarchive-all');

    return data;
};

export async function deleteUserNotification(id) {
    const { data } = await api.delete(`/notifications/${id}`);

    return data;
};

export async function clearArchivedNotifications() {
    const { data } = await api.delete('/notifications/clear-archived');

    return data;
};
