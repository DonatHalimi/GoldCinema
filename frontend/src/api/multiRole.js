import api from './client';

export async function getRoleSession() {
    const { data } = await api.get('/auth/me');

    return data.user;
}

export async function selectActiveRole(role) {
    const { data } = await api.post('/auth/select-role', { role });

    return data;
}

export async function switchActiveRole(role) {
    const { data } = await api.post('/auth/switch-role', { role });

    return data;
}

export async function getRoleCatalog() {
    const { data } = await api.get('/admin/role-catalog');

    return data.roles || [];
}

export async function getUserRoleAssignments(userId) {
    const { data } = await api.get(`/admin/users/${userId}/roles`);

    return data.user;
}

export async function updateUserRoleAssignments(userId, roles, managerCinemaId) {
    const { data } = await api.patch(`/admin/users/${userId}/roles`, { roles, managerCinemaId });

    return data;
}