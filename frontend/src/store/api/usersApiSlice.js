import { apiSlice } from './apiSlice';

export const usersApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getCurrentProfile: builder.query({
            query: () => ({ url: '/auth/me' }),
            providesTags: [{ type: 'Users', id: 'CURRENT' }],
        }),
        selectActiveRole: builder.mutation({
            query: (role) => ({ url: '/auth/select-role', method: 'POST', data: { role } }),
            invalidatesTags: [{ type: 'Users', id: 'CURRENT' }],
        }),
        switchActiveRole: builder.mutation({
            query: (role) => ({ url: '/auth/switch-role', method: 'POST', data: { role } }),
            invalidatesTags: [{ type: 'Users', id: 'CURRENT' }],
        }),
        updateCurrentProfile: builder.mutation({
            query: (profile) => ({ url: '/auth/profile', method: 'PUT', data: profile }),
            invalidatesTags: [{ type: 'Users', id: 'CURRENT' }],
        }),
        getActivePermissions: builder.query({
            query: () => ({ url: '/auth/permissions' }),
            providesTags: [{ type: 'Permissions', id: 'ACTIVE' }],
        }),
        getRoles: builder.query({
            query: (params = {}) => ({ url: '/roles', params }),
            providesTags: (result) =>
                result?.data
                    ? [{ type: 'Roles', id: 'LIST' }, ...result.data.map((role) => ({ type: 'Roles', id: role.id }))]
                    : [{ type: 'Roles', id: 'LIST' }],
        }),
        getRole: builder.query({
            query: (id) => ({ url: `/roles/${id}` }),
            providesTags: (_result, _error, id) => [{ type: 'Roles', id }],
        }),
        getPermissions: builder.query({
            query: (params = {}) => ({ url: '/permissions', params }),
            providesTags: [{ type: 'Permissions', id: 'LIST' }],
        }),
        getGroupedPermissions: builder.query({
            query: () => ({ url: '/permissions/grouped' }),
            providesTags: [{ type: 'Permissions', id: 'GROUPED' }],
        }),
        createRole: builder.mutation({
            query: (body) => ({ url: '/roles', method: 'POST', data: body }),
            invalidatesTags: [{ type: 'Roles', id: 'LIST' }],
        }),
        updateRole: builder.mutation({
            query: ({ id, ...body }) => ({ url: `/roles/${id}`, method: 'PUT', data: body }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'Roles', id: 'LIST' }, { type: 'Roles', id }],
        }),
        replaceRolePermissions: builder.mutation({
            query: ({ id, permissionKeys }) => ({ url: `/roles/${id}/permissions`, method: 'PUT', data: { permissionKeys } }),
            invalidatesTags: (_result, _error, { id }) => [
                { type: 'Roles', id: 'LIST' },
                { type: 'Roles', id },
                { type: 'Permissions', id: 'ACTIVE' },
            ],
        }),
        deleteRole: builder.mutation({
            query: (id) => ({ url: `/roles/${id}`, method: 'DELETE' }),
            invalidatesTags: [{ type: 'Roles', id: 'LIST' }],
        }),
        createPermission: builder.mutation({
            query: (body) => ({ url: '/permissions', method: 'POST', data: body }),
            invalidatesTags: [
                { type: 'Permissions', id: 'LIST' },
                { type: 'Permissions', id: 'GROUPED' },
            ],
        }),
        updatePermission: builder.mutation({
            query: ({ id, ...body }) => ({ url: `/permissions/${id}`, method: 'PUT', data: body }),
            invalidatesTags: [
                { type: 'Permissions', id: 'LIST' },
                { type: 'Permissions', id: 'GROUPED' },
                { type: 'Permissions', id: 'ACTIVE' },
                { type: 'Roles' },
            ],
        }),
        deletePermission: builder.mutation({
            query: (id) => ({ url: `/permissions/${id}`, method: 'DELETE' }),
            invalidatesTags: [
                { type: 'Permissions', id: 'LIST' },
                { type: 'Permissions', id: 'GROUPED' },
                { type: 'Permissions', id: 'ACTIVE' },
                { type: 'Roles' },
            ],
        }),
        restorePermission: builder.mutation({
            query: (id) => ({ url: `/permissions/${id}/restore`, method: 'POST' }),
            invalidatesTags: [
                { type: 'Permissions', id: 'LIST' },
                { type: 'Permissions', id: 'GROUPED' },
                { type: 'Permissions', id: 'ACTIVE' },
                { type: 'Roles' },
            ],
        }),
    }),
});

export const {
    useGetCurrentProfileQuery,
    useLazyGetCurrentProfileQuery,
    useSelectActiveRoleMutation,
    useSwitchActiveRoleMutation,
    useUpdateCurrentProfileMutation,
    useGetActivePermissionsQuery,
    useGetRolesQuery,
    useGetRoleQuery,
    useGetPermissionsQuery,
    useGetGroupedPermissionsQuery,
    useCreateRoleMutation,
    useUpdateRoleMutation,
    useReplaceRolePermissionsMutation,
    useDeleteRoleMutation,
    useCreatePermissionMutation,
    useUpdatePermissionMutation,
    useDeletePermissionMutation,
    useRestorePermissionMutation,
} = usersApiSlice;
