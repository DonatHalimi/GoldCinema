import { useSelector } from 'react-redux';
import { useGetActivePermissionsQuery } from '../store/api/usersApiSlice';
import { hasAllPermissions, hasAnyPermission, hasPermission } from '../utils/permissions';

export function usePermissions() {
    const sessionEnabled = useSelector((state) => state.auth.sessionEnabled);
    const loggingOut = useSelector((state) => state.auth.loggingOut);
    const result = useGetActivePermissionsQuery(undefined, { skip: !sessionEnabled || loggingOut });
    return {
        permissions: result.data,
        keys: result.data?.permissions || [],
        unrestricted: Boolean(result.data?.unrestricted),
        isLoading: result.isLoading || result.isFetching,
        error: result.error,
        refetch: result.refetch,
    };
}

export function useHasPermission(permission, mode = 'any') {
    const { permissions, isLoading } = usePermissions();
    const allowed = Array.isArray(permission)
        ? mode === 'all'
            ? hasAllPermissions(permissions, permission)
            : hasAnyPermission(permissions, permission)
        : hasPermission(permissions, permission);
    return { allowed, isLoading };
}
